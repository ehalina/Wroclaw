// Система управления аккаунтами пользователей через Firebase
// Использует Firebase Anonymous Auth для гостевых пользователей
// Поддерживает Link Account для превращения гостя в зарегистрированного

class UserAccountManager {
    constructor() {
        this.currentUser = null;
        this.firebaseReady = false;
        this._anonSignInRequested = false;
            this._authStateChangedFired = false; // Флаг, что onAuthStateChanged уже сработал
        this._progressSyncTimeout = null;
        this.init();
    }

    _isAccountDebug() {
        try { return localStorage.getItem('__account_debug') === '1'; } catch (_) { return false; }
    }

    _alog(...args) {
        if (!this._isAccountDebug()) return;
        try { console.log('[account]', ...args); } catch (_) {}
    }

    _isOauthRedirectInProgress() {
        try {
            if (sessionStorage.getItem('__oauth_in_progress') === '1') return true;
        } catch (_) {}
        try {
            if (localStorage.getItem('__oauth_in_progress') === '1') return true;
        } catch (_) {}
        return false;
    }

    // --- Константы прогресса (фиксируем на уровне проекта) ---
    static TOTAL_QUEST_TASKS = 13;
    // Все "локации" = страницы, где есть data-map-point (кроме index.html)
    static LOCATION_PAGES = [
        "dwor01.html",
        "dwor02.html",
        "dwor03.html",
        "dwor04.html",
        "dwor05.html",
        "dwor06.html",
        "dwor07.html",
        "dwor08.html",
        "dwor09.html",
        "dwor10.html",
        "dwor11.html",
        "dwor12.html",
        "dwor13.html",
        "ogrod02.html",
        "ogrod03.html",
        "ogrod04.html",
        "ogrod05.html",
        "ogrod06.html",
        "ogrod07.html",
        "ogrod08.html",
        "ogrod09.html",
        "ogrod12.html",
        "ogrod13.html",
        "pk01.html",
        "pk02.html",
        "tumski.html",
        "tumski02.html",
        "tumski03.html",
        "tumski04.html",
        "tumski05.html",
        "tumski06.html",
        "tumski07.html",
        "tumski08.html",
        "tumski09.html",
        "tumski10.html",
        "tumski11.html",
        "tumski12.html",
        "tumski13.html",
        "tumski14.html",
        "tumski15.html",
        "tumski16.html",
        "tumski17.html",
        "tumski18.html",
        "tumski19.html",
        "tumski20.html",
        "tumski21.html",
        "tumski22.html",
        "tumski23.html",
        "tumski24.html",
        "minsk01.html"
    ];
    // Геометки (книги) = .map-mark без data-quest-number. Посчитано по HTML в репозитории.
    static TOTAL_BOOKS = 114;
    // Геометки "гномы" – уникальные маркеры с data-gnome-id
    static TOTAL_GNOMES = 8;

    _t(key, fallback = '') {
        try {
            if (window.i18n && typeof window.i18n.t === 'function') {
                const v = window.i18n.t(key);
                if (v && v !== key) return v;
            }
        } catch (_) {}
        return fallback || key;
    }

    _safeJsonParse(str, fallback) {
        try { return JSON.parse(str); } catch (_) { return fallback; }
    }

    _getVisitedPages() {
        const store = this._safeJsonParse(localStorage.getItem('visitedPages') || '{}', {});
        return store && typeof store === 'object' ? store : {};
    }

    _getOpenedGeoMarkers() {
        const store = this._safeJsonParse(localStorage.getItem('openedGeoMarkers') || '{}', {});
        return store && typeof store === 'object' ? store : {};
    }

    _getFoundGnomes() {
        const store = this._safeJsonParse(localStorage.getItem('foundGnomes') || '{}', {});
        return store && typeof store === 'object' ? store : {};
    }

    // Единая функция для подсчета прогресса из localStorage
    _calculateProgressFromLocalStorage() {
        const visitedPages = this._getVisitedPages();
        const visitedPageKeys = Object.keys(visitedPages);
        const openedLocations = visitedPageKeys.filter((p) => UserAccountManager.LOCATION_PAGES.includes(p)).length;
        const openedBooks = Object.keys(this._getOpenedGeoMarkers()).length;
        const foundGnomes = Object.keys(this._getFoundGnomes()).length;
        const questState = this._safeJsonParse(sessionStorage.getItem('questState') || '{}', {});
        const completedTasks = Object.values(questState?.tasks || {}).filter(Boolean).length;
        
        return {
            openedLocations,
            openedBooks,
            completedTasks,
            foundGnomes
        };
    }

    trackGeoMarkerOpened(markerId) {
        if (!markerId) return;
        try {
            const store = this._getOpenedGeoMarkers();
            if (!store[markerId]) {
                store[markerId] = Date.now();
                localStorage.setItem('openedGeoMarkers', JSON.stringify(store));
            }
        } catch (_) {}

        // Если пользователь залогинен — попробуем иногда синкать прогресс (не на каждый клик)
        this.scheduleProgressSync();
    }

    trackGnomeFound(gnomeId) {
        if (!gnomeId) return;
        try {
            const store = this._getFoundGnomes();
            if (!store[gnomeId]) {
                store[gnomeId] = Date.now();
                localStorage.setItem('foundGnomes', JSON.stringify(store));
            }
        } catch (_) {}

        // Используем тот же механизм синхронизации, даже если сервер пока игнорирует этот показатель
        this.scheduleProgressSync();
    }

    scheduleProgressSync() {
        try {
            clearTimeout(this._progressSyncTimeout);
        } catch (_) {}
        this._progressSyncTimeout = setTimeout(async () => {
            try {
                const user = await this.getCurrentUser();
                if (!user || user.isAnonymous) return;
                if (!window.userDatabase || typeof window.userDatabase.updateUserMetadata !== 'function') return;

                // Пишем только агрегаты (не огромные списки) — безопаснее и дешевле
                const progress = this._calculateProgressFromLocalStorage();
                await window.userDatabase.updateUserMetadata({
                    progress: {
                        openedBooks: progress.openedBooks,
                        openedLocations: progress.openedLocations
                    }
                });
            } catch (_) {}
        }, 1200);
    }

    async init() {
        // Инициализируем Firebase
        if (!window.userDatabase) {
            await new Promise((resolve) => {
                if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', resolve);
                } else {
                    resolve();
                }
            });
        }

        // Инициализируем базу данных
        if (window.userDatabase) {
            try {
                await window.userDatabase.init();
                this.firebaseReady = true;
            } catch (error) {
                console.error('Ошибка инициализации базы данных:', error);
                this.firebaseReady = false;
            }
        }

        // Слушаем изменения состояния аутентификации
        if (this.firebaseReady && window.userDatabase && window.userDatabase.auth) {
            window.userDatabase.auth.onAuthStateChanged(async (firebaseUser) => {
                this._authStateChangedFired = true; // Отмечаем, что событие сработало
                const authInfo = {
                    hasUser: !!firebaseUser,
                    uid: firebaseUser?.uid,
                    isAnonymous: firebaseUser?.isAnonymous,
                    email: firebaseUser?.email || null,
                    displayName: firebaseUser?.displayName || null,
                    providers: firebaseUser?.providerData ? (firebaseUser.providerData || []).map(p => p?.providerId).filter(Boolean) : []
                };
                this._alog('onAuthStateChanged', authInfo);
                if (firebaseUser) {
                    // Пользователь авторизован
                    try {
                        this.currentUser = await window.userDatabase.getUser(firebaseUser.uid);
                    } catch (error) {
                        // Если ошибка прав доступа для нового анонимного пользователя - это нормально
                        // Просто создадим запись в Firestore
                        if (error?.code === 'permission-denied' && firebaseUser.isAnonymous) {
                            this._alog('getUser permission denied for new anonymous user, will create', { uid: firebaseUser.uid });
                            this.currentUser = null;
                        } else {
                            // Для других ошибок логируем, но продолжаем
                            this._alog('getUser error (non-critical)', { uid: firebaseUser.uid, error: error?.message || String(error) });
                            this.currentUser = null;
                        }
                    }
                    if (!this.currentUser) {
                        // Создаем запись пользователя в Firestore
                        try {
                            await window.userDatabase.saveUser({
                                id: firebaseUser.uid,
                                username: firebaseUser.isAnonymous ? 'Гость' : (firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Пользователь'),
                                email: firebaseUser.email || null,
                                isAnonymous: firebaseUser.isAnonymous,
                                questState: {
                                    tasks: {},
                                    completedQuests: []
                                }
                            });
                            // Пытаемся получить пользователя из Firestore
                            try {
                                this.currentUser = await window.userDatabase.getUser(firebaseUser.uid);
                            } catch (getError) {
                                // Если не удалось получить (ошибка прав доступа), используем данные из Auth
                                if (getError?.code === 'permission-denied' || getError?.code === 'unavailable') {
                                    this._alog('getUser failed after saveUser, using auth data', { uid: firebaseUser.uid, error: getError?.message });
                                    this.currentUser = {
                                        id: firebaseUser.uid,
                                        username: firebaseUser.isAnonymous ? 'Гость' : (firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Пользователь'),
                                        email: firebaseUser.email || null,
                                        isAnonymous: firebaseUser.isAnonymous,
                                        questState: { tasks: {}, completedQuests: [] }
                                    };
                                } else {
                                    throw getError;
                                }
                            }
                        } catch (saveError) {
                            // Если не удалось сохранить (ошибка прав доступа для нового пользователя), используем данные из Auth
                            if (saveError?.code === 'permission-denied' || saveError?.code === 'unavailable') {
                                this._alog('saveUser failed, using auth data', { uid: firebaseUser.uid, error: saveError?.message });
                                this.currentUser = {
                                    id: firebaseUser.uid,
                                    username: firebaseUser.isAnonymous ? 'Гость' : (firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Пользователь'),
                                    email: firebaseUser.email || null,
                                    isAnonymous: firebaseUser.isAnonymous,
                                    questState: { tasks: {}, completedQuests: [] }
                                };
                            } else {
                                // Для других ошибок логируем, но продолжаем с данными из Auth
                                this._alog('saveUser error (non-critical)', { uid: firebaseUser.uid, error: saveError?.message || String(saveError) });
                                this.currentUser = {
                                    id: firebaseUser.uid,
                                    username: firebaseUser.isAnonymous ? 'Гость' : (firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Пользователь'),
                                    email: firebaseUser.email || null,
                                    isAnonymous: firebaseUser.isAnonymous,
                                    questState: { tasks: {}, completedQuests: [] }
                                };
                            }
                        }
                    } else {
                        // Проверяем, вернулись ли мы с OAuth redirect
                        const oauthInProgress = 
                            sessionStorage.getItem('__oauth_in_progress') === '1' ||
                            localStorage.getItem('__oauth_in_progress') === '1';
                        
                        // Если OAuth был в процессе и теперь пользователь не анонимный - показываем диалог выбора прогресса
                        if (oauthInProgress && !firebaseUser.isAnonymous && this.currentUser.isAnonymous) {
                            // Очищаем флаг
                            try { sessionStorage.removeItem('__oauth_in_progress'); } catch (_) {}
                            try { localStorage.removeItem('__oauth_in_progress'); } catch (_) {}
                            
                            // Показываем диалог выбора прогресса после небольшой задержки
                            setTimeout(async () => {
                                try {
                                    const accountUser = await this.getCurrentUser();
                                    if (accountUser) {
                                        await this.showProgressChoiceDialog(accountUser);
                                    }
                                } catch (error) {
                                    console.warn('Ошибка показа диалога выбора прогресса после OAuth (не критично):', error);
                                }
                            }, 500);
                        }
                        
                        // КРИТИЧНО: Если Auth пользователь НЕ гость, но Firestore еще показывает гостя - принудительно обновляем
                        // Это важно для случая, когда пользователь входит через Google и аккаунт уже существует
                        if (!firebaseUser.isAnonymous && this.currentUser.isAnonymous) {
                            try {
                                const syncInfo = {
                                    auth: { isAnonymous: false, email: firebaseUser.email || null, displayName: firebaseUser.displayName || null },
                                    profile: { isAnonymous: true, email: this.currentUser.email || null, username: this.currentUser.username }
                                };
                                this._alog('force sync: auth non-anon but profile anon -> update', syncInfo);
                                const updateData = {
                                    isAnonymous: false,
                                    email: firebaseUser.email || null
                                };
                                // КРИТИЧНО: НЕ перезаписываем username из Firestore на displayName из Google Auth
                                // Если username уже существует и не равен "Гость", сохраняем его
                                const hasValidUsername = this.currentUser.username && 
                                    this.currentUser.username.trim() !== '' && 
                                    this.currentUser.username !== 'Гость' && 
                                    this.currentUser.username.toLowerCase() !== 'гость';
                                
                                if (!hasValidUsername && firebaseUser.displayName) {
                                    // Обновляем только если username действительно пустой или "Гость"
                                    updateData.username = firebaseUser.displayName;
                                    this._alog('force sync: updating username from displayName', { 
                                        oldUsername: this.currentUser.username, 
                                        newUsername: firebaseUser.displayName 
                                    });
                                } else {
                                    this._alog('force sync: preserving existing username', { 
                                        username: this.currentUser.username,
                                        hasValidUsername: hasValidUsername,
                                        displayName: firebaseUser.displayName
                                    });
                                }
                                await window.userDatabase.updateUserMetadata(updateData);
                                // Небольшая задержка для гарантии обновления Firestore
                                await new Promise(resolve => setTimeout(resolve, 150));
                                // Перезагружаем пользователя из Firestore
                                this.currentUser = await window.userDatabase.getUser(firebaseUser.uid);
                                const updatedInfo = {
                                    isAnonymous: this.currentUser?.isAnonymous,
                                    email: this.currentUser?.email || null,
                                    username: this.currentUser?.username
                                };
                                this._alog('force sync: profile updated', updatedInfo);
                            } catch (e) {
                                this._alog('force sync updateUserMetadata failed', e?.message || String(e));
                                // Fallback: используем данные из Auth напрямую
                                this.currentUser = {
                                    ...this.currentUser,
                                    isAnonymous: false,
                                    email: firebaseUser.email || null,
                                    username: firebaseUser.displayName || this.currentUser.username || 'Пользователь'
                                };
                            }
                    } else {
                        // Синхронизируем флаги с реальным Auth пользователем (важно при входе через OAuth для существующего аккаунта)
                        const needsSync =
                            (this.currentUser.isAnonymous !== firebaseUser.isAnonymous) ||
                            ((this.currentUser.email || null) !== (firebaseUser.email || null));

                        if (needsSync) {
                            try {
                                this._alog('needsSync -> updateUserMetadata', {
                                    prev: { isAnonymous: this.currentUser.isAnonymous, email: this.currentUser.email || null, username: this.currentUser.username },
                                    next: { isAnonymous: firebaseUser.isAnonymous, email: firebaseUser.email || null, displayName: firebaseUser.displayName }
                                });
                                // Обновляем метаданные, НО НЕ перезаписываем username, если он уже есть в Firestore
                                const updateData = {
                                    isAnonymous: firebaseUser.isAnonymous,
                                    email: firebaseUser.email || null
                                };
                                // КРИТИЧНО: НЕ перезаписываем username из Firestore на displayName из Google Auth
                                // Если username уже существует и не равен "Гость", сохраняем его
                                // Обновляем только если username пустой, равен "Гость" или отсутствует
                                const hasValidUsername = this.currentUser.username && 
                                    this.currentUser.username.trim() !== '' && 
                                    this.currentUser.username !== 'Гость' && 
                                    this.currentUser.username.toLowerCase() !== 'гость';
                                
                                if (!hasValidUsername && firebaseUser.displayName) {
                                    // Обновляем только если username действительно пустой или "Гость"
                                    updateData.username = firebaseUser.displayName;
                                    this._alog('needsSync: updating username from displayName', { 
                                        oldUsername: this.currentUser.username, 
                                        newUsername: firebaseUser.displayName 
                                    });
                                } else {
                                    this._alog('needsSync: preserving existing username', { 
                                        username: this.currentUser.username,
                                        hasValidUsername: hasValidUsername,
                                        displayName: firebaseUser.displayName
                                    });
                                }
                                
                                await window.userDatabase.updateUserMetadata(updateData);
                                // Перезагружаем пользователя из Firestore после обновления
                                this.currentUser = await window.userDatabase.getUser(firebaseUser.uid);
                            } catch (e) {
                                this._alog('needsSync updateUserMetadata failed', e?.message || String(e));
                                // не критично, просто покажем по данным как есть
                                }
                            }
                        }
                    }
                    await this.loadUserQuestState();
                    await this.updateAccountButton();
                } else {
                    // Пользователь вышел - сбрасываем состояние и создаем анонимного
                    this.currentUser = null;
                    this._anonSignInRequested = false; // Сбрасываем флаг для нового анонимного пользователя
                    try {
                        if (this._isOauthRedirectInProgress()) {
                            this._alog('skip createAnonymousUser: oauth redirect in progress');
                            return;
                        }
                        if (this.firebaseReady) {
                            this._anonSignInRequested = true;
                            await window.userDatabase.createAnonymousUser();
                        }
                    } catch (error) {
                        console.error('Ошибка создания анонимного пользователя:', error);
                        this._anonSignInRequested = false; // Сбрасываем флаг при ошибке
                    }
                }
            });
        }

        // Стартуем анонимный вход только один раз: дальше это сделает onAuthStateChanged
        // ВАЖНО: Ждем первого вызова onAuthStateChanged, чтобы не перезаписать существующую сессию
        if (this.firebaseReady && window.userDatabase && window.userDatabase.auth) {
            // Даем время onAuthStateChanged сработать (до 2 секунд)
            let attempts = 0;
            const checkAuthState = setInterval(() => {
                attempts++;
                const currentAuthUser = window.userDatabase.getCurrentAuthUser();
                // Если onAuthStateChanged уже сработал или есть пользователь, проверяем нужно ли создавать анонимного
                if (this._authStateChangedFired || currentAuthUser || attempts > 20) {
                    clearInterval(checkAuthState);
                    if (!currentAuthUser && !this._anonSignInRequested && !this._isOauthRedirectInProgress()) {
                        this._anonSignInRequested = true;
                        window.userDatabase.createAnonymousUser().catch(error => {
                            console.error('Ошибка создания анонимного пользователя:', error);
                        });
                    }
                }
            }, 100);
        }

        // Ждем загрузки DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.initAfterDOMReady();
            });
        } else {
            this.initAfterDOMReady();
        }
    }

    async initAfterDOMReady() {
        await this.updateAccountButton();
    }

    // Обновить отображение кнопки аккаунта
    async updateAccountButton() {
        const accountButton = document.querySelector('.account-menu-button');
        if (accountButton) {
            const user = await this.getCurrentUser();
            if (user) {
                const displayName = user.isAnonymous ? `${user.username} (Гость)` : user.username;
                accountButton.title = `Аккаунт: ${displayName}`;
            }
        }
    }

    // Получить текущего пользователя
    async getCurrentUser() {
        if (!window.userDatabase) {
            return null;
        }

        try {
            return await window.userDatabase.getCurrentUser();
        } catch (error) {
            console.error('Ошибка получения текущего пользователя:', error);
            return null;
        }
    }

    // Сохранить состояние квеста
    async saveQuestState(questState) {
        if (!window.userDatabase) {
            return false;
        }

        try {
            const currentUser = await this.getCurrentUser();
            if (!currentUser) {
                console.warn('Пользователь не авторизован');
                return false;
            }

            // Объединяем состояние квеста
            const updatedQuestState = {
                tasks: { ...currentUser.questState.tasks, ...questState.tasks },
                completedQuests: [...(currentUser.questState.completedQuests || [])]
            };

            // Проверяем завершенные квесты
            const totalTasks = 13;
            let completedTasks = 0;
            for (let i = 1; i <= totalTasks; i++) {
                if (updatedQuestState.tasks[i]) {
                    completedTasks++;
                }
            }

            // Если все задачи выполнены, добавляем в завершенные
            if (completedTasks === totalTasks && !updatedQuestState.completedQuests.includes('main')) {
                updatedQuestState.completedQuests.push('main');
            }

            // Сохраняем в Firestore
            await window.userDatabase.saveQuestState(updatedQuestState);
            return true;
        } catch (error) {
            console.error('Ошибка сохранения состояния квеста:', error);
            return false;
        }
    }

    // Загрузить состояние квеста
    async loadQuestState() {
        if (!window.userDatabase) {
            return { tasks: {}, completedQuests: [] };
        }

        try {
            return await window.userDatabase.loadQuestState();
        } catch (error) {
            console.error('Ошибка загрузки состояния квеста:', error);
            return { tasks: {}, completedQuests: [] };
        }
    }

    // Загрузить состояние квеста пользователя в sessionStorage
    async loadUserQuestState() {
        try {
            const questState = await this.loadQuestState();
            sessionStorage.setItem('questState', JSON.stringify(questState));
        } catch (error) {
            console.error('Ошибка загрузки состояния квеста:', error);
        }
    }

    // Показать меню аккаунта
    // Определение размера экрана для адаптивности
    _getScreenSize() {
        const width = window.innerWidth;
        if (width <= 480) return 'mobile'; // Телефон
        if (width <= 768) return 'tablet'; // Планшет
        return 'desktop'; // Десктоп
    }

    async showAccountMenu() {
        if (!document.body) {
            document.addEventListener('DOMContentLoaded', () => this.showAccountMenu());
            return;
        }

        const screenSize = this._getScreenSize();
        const isMobile = screenSize === 'mobile';
        const isTablet = screenSize === 'tablet';

        // Всегда показываем UI (даже если профиль ещё не успел загрузиться/создаться)
        const overlay = document.createElement('div');
        overlay.className = 'account-menu-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.85);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 20000;
            font-family: serif;
        `;

        // Адаптивные размеры в зависимости от экрана
        const padding = isMobile ? '20px' : isTablet ? '32px' : '56px';
        const minWidth = isMobile ? '90vw' : isTablet ? '80vw' : '656px';
        const minHeight = isMobile ? '85vh' : isTablet ? '75vh' : '576px';
        const maxWidth = isMobile ? '95vw' : '95vw';
        const maxHeight = isMobile ? '90vh' : isTablet ? '85vh' : '85vh';

        // Верстка как в image-wrapper
        const menuCard = document.createElement('div');
        menuCard.className = 'image-wrapper';
        menuCard.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: center;
            width: auto;
            height: 100%;
            max-width: 100%;
            max-height: 100%;
            box-sizing: border-box;
            position: relative;
            min-width: ${minWidth};
            min-height: ${minHeight};
            max-width: ${maxWidth};
            max-height: ${maxHeight};
            background: url('media/book/quest2.jpg') center no-repeat;
            background-size: contain;
            padding: ${padding};
            box-shadow: 0 4px 32px rgba(0,0,0,0.2);
            text-align: center;
            overflow: hidden;
        `;

        const body = document.createElement('div');
        body.style.cssText = `
            width: 70%;
            max-width: 70%;
            max-height: calc(100% - ${padding} * 2);
            overflow-y: auto;
            padding: ${isMobile ? '4px' : '6px'} 0;
            line-height: 1.2;
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        `;

        const closeBtnTop = document.createElement('button');
        closeBtnTop.textContent = '✕';
        closeBtnTop.title = this._t('account.actions.close', 'Закрыть');
        closeBtnTop.style.cssText = `
            position: absolute;
            top: 12px;
            right: 12px;
            width: 36px;
            height: 36px;
            border-radius: 18px;
            border: none;
            cursor: pointer;
            background: rgba(0,0,0,0.55);
            color: white;
            font-size: 18px;
        `;
        closeBtnTop.onclick = () => overlay.remove();

        menuCard.appendChild(closeBtnTop);
        menuCard.appendChild(body);
        overlay.appendChild(menuCard);
        document.body.appendChild(overlay);

        const renderUser = (currentUser) => {
            body.innerHTML = '';

            // Адаптивные размеры шрифтов
            const fontSizeBase = isMobile ? '14px' : isTablet ? '15px' : '16px';
            const fontSizeTitle = isMobile ? '20px' : isTablet ? '22px' : '26px';
            const fontSizeHeader = isMobile ? '18px' : isTablet ? '20px' : '24px';

            // Auth = source of truth: после OAuth (в т.ч. 2FA) Auth может стать non-anon раньше, чем обновится Firestore.
            const authUser = window.userDatabase?.getCurrentAuthUser?.() || null;
            const isGuest = authUser ? !!authUser.isAnonymous : !!(currentUser?.isAnonymous);

            // Кнопки будут добавлены в buttonsContainer ниже

            const headerRow = document.createElement('div');
            headerRow.style.cssText = `
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
                margin-bottom: 18px;
                margin-top: calc(${minHeight} / 12);
            `;

            const headerName = document.createElement('div');
            headerName.style.cssText = `
                font-size: ${fontSizeTitle};
                font-weight: bold;
                color: #654321;
            `;
            // Проверяем наличие currentUser
            if (!currentUser) {
                console.error('renderUser: currentUser is undefined');
                return;
            }
            
            this._alog('renderUser', {
                auth: authUser ? {
                    uid: authUser.uid,
                    isAnonymous: !!authUser.isAnonymous,
                    email: authUser.email || null,
                    displayName: authUser.displayName || null,
                    providers: (authUser.providerData || []).map(p => p?.providerId).filter(Boolean)
                } : null,
                profile: {
                    id: currentUser?.id || currentUser?.uid || null,
                    isAnonymous: !!currentUser?.isAnonymous,
                    username: currentUser?.username || null,
                    email: currentUser?.email || null
                },
                chosenIsGuest: isGuest
            });
            const rawUsername = (currentUser?.username != null ? String(currentUser.username) : '').trim();
            const email = (currentUser?.email != null ? String(currentUser.email) : '').trim();
            const hasRealName = rawUsername && rawUsername.toLowerCase() !== 'гость';
            // Показываем введенное имя даже для гостя, если оно не "Гость"
            headerName.textContent = hasRealName
                ? rawUsername
                : (isGuest ? this._t('account.guest', 'Гость') : (email || this._t('account.user', 'Пользователь')));

            headerRow.appendChild(headerName);

            // Кнопка редактирования имени для залогиненных (не гостя)
            if (!isGuest) {
                const editNameBtn = document.createElement('button');
                editNameBtn.textContent = '✎';
                editNameBtn.title = 'Изменить имя';
                editNameBtn.style.cssText = `
                    padding: 6px 10px;
                    background: rgba(139, 69, 19, 0.15);
                    border: 1px solid rgba(139, 69, 19, 0.5);
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                    color: #654321;
                `;
                editNameBtn.onclick = () => {
                    // Преобразуем headerName в input
                    const currentText = headerName.textContent;
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.value = currentText;
                    input.style.cssText = headerName.style.cssText + `
                        border: 2px solid #8B4513;
                        border-radius: 6px;
                        padding: 4px 8px;
                        background: rgba(255, 255, 255, 0.9);
                        outline: none;
                    `;
                    
                    const saveUsername = async () => {
                        const newName = input.value.trim();
                        if (!newName) {
                            alert('Имя не может быть пустым!');
                            input.focus();
                            return;
                        }
                        
                        if (newName === currentText) {
                            // Имя не изменилось, просто возвращаем обратно
                            headerRow.replaceChild(headerName, input);
                            return;
                        }
                        
                        try {
                            await window.userDatabase.updateUserMetadata({ username: newName });
                            // Обновляем локальные данные
                            if (currentUser) {
                                currentUser.username = newName;
                            }
                            this.currentUser = { ...(this.currentUser || {}), username: newName };
                            
                            // Синхронизируем в leaderboard немедленно (если есть id)
                            const userId = currentUser?.id || currentUser?.uid;
                            if (userId && window.userDatabase?._syncToLeaderboard) {
                                await window.userDatabase._syncToLeaderboard(userId, {
                                    username: newName,
                                    email: currentUser?.email || null,
                                    createdAt: currentUser?.createdAt || null,
                                    progress: currentUser?.progress || { openedLocations: 0, openedBooks: 0 },
                                    questState: currentUser?.questState || {}
                                }).catch(err => {
                                    console.error('[rating] Error syncing username to leaderboard:', err);
                                });
                            }
                            
                            // Обновляем отображение без перерисовки всей страницы
                            headerName.textContent = newName;
                            headerRow.replaceChild(headerName, input);
                        } catch (error) {
                            console.error('Ошибка сохранения имени:', error);
                            alert('Ошибка сохранения имени: ' + (error?.message || String(error)));
                            input.focus();
                        }
                    };
                    
                    input.addEventListener('blur', saveUsername);
                    input.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            input.blur();
                        } else if (e.key === 'Escape') {
                            headerRow.replaceChild(headerName, input);
                        }
                    });
                    
                    headerRow.replaceChild(input, headerName);
                    input.focus();
                    input.select();
                };
                headerRow.appendChild(editNameBtn);
            }

            // Если Auth уже не гость, а Firestore ещё гость — догоняем метаданные (без падений)
            try {
                if (authUser && !authUser.isAnonymous && currentUser?.isAnonymous) {
                    const e = authUser.email || null;
                    const u = authUser.displayName || (e ? e.split('@')[0] : '') || undefined;
                    this._alog('catch-up Firestore meta (auth non-anon, profile anon)', { email: e, username: u });
                    window.userDatabase?.updateUserMetadata?.({
                        isAnonymous: false,
                        email: e,
                        username: u
                    }).catch?.((err) => {
                        this._alog('catch-up updateUserMetadata failed', err?.message || String(err));
                    });
                }
            } catch (_) {}

            // --- Статистика ---
            // Используем единую функцию для подсчета прогресса
            const progress = this._calculateProgressFromLocalStorage();
            const openedLocations = progress.openedLocations;
            const openedBooks = progress.openedBooks;
            const completedTasks = progress.completedTasks;
            const foundGnomes = progress.foundGnomes || 0;
            
            const totalLocations = UserAccountManager.LOCATION_PAGES.length;
            const totalTasks = UserAccountManager.TOTAL_QUEST_TASKS;
            const totalBooks = UserAccountManager.TOTAL_BOOKS;
            const totalGnomes = UserAccountManager.TOTAL_GNOMES;

            const statsBox = document.createElement('div');
            statsBox.style.cssText = `
                padding: ${isMobile ? '8px' : '10px'} ${isMobile ? '8px' : '12px'};
                text-align: left;
                color: #654321;
                margin-bottom: ${isMobile ? '10px' : '12px'};
                font-size: ${isMobile ? '16px' : isTablet ? '18px' : '20px'};
                line-height: 1.25;
                width: 80%;
                margin-left: auto;
                margin-right: auto;
            `;

            const mkRow = (label, value) => {
                const row = document.createElement('div');
                row.style.cssText = 'display:flex; justify-content:space-between; gap:10px; padding:2px 0; border-bottom: 1px solid rgba(139,69,19,0.25);';
                const l = document.createElement('div');
                l.textContent = label;
                const v = document.createElement('div');
                v.style.cssText = 'font-weight: bold;';
                v.textContent = value;
                row.appendChild(l);
                row.appendChild(v);
                return row;
            };

            statsBox.appendChild(mkRow(
                this._t('account.stats.locations', 'Открыто локаций'),
                `${openedLocations} / ${totalLocations}`
            ));
            statsBox.appendChild(mkRow(
                this._t('account.stats.quests', 'Пройдено квестов'),
                `${completedTasks} / ${totalTasks}`
            ));
            statsBox.appendChild(mkRow(
                this._t('account.stats.gnomes', 'Найдено гномов'),
                totalGnomes ? `${foundGnomes} / ${totalGnomes}` : String(foundGnomes)
            ));
            // последняя строка без бордера
            const booksRow = mkRow(
                this._t('account.stats.books', 'Прочитано книг'),
                `${openedBooks} / ${totalBooks}`
            );
            booksRow.style.borderBottom = 'none';
            statsBox.appendChild(booksRow);

            // Блок рейтинга
            const ratingRow = document.createElement('div');
            ratingRow.style.cssText = 'display:flex; justify-content:space-between; align-items:center; gap:12px; padding:4px 0; margin-top: 8px; border-top: 1px solid rgba(139,69,19,0.25);';
            
            const ratingLabel = document.createElement('div');
            ratingLabel.textContent = this._t('account.stats.rating', 'Общий рейтинг');
            ratingLabel.style.cssText = `
                font-weight: bold;
                cursor: pointer;
            `;
            ratingLabel.onclick = () => this.showRatingList();
            ratingLabel.title = this._t('account.rating_list.show_full', 'Показать полный рейтинг');
            
            const ratingValue = document.createElement('div');
            ratingValue.textContent = '...';
            ratingValue.style.cssText = 'font-weight: bold;';
            
            const ratingButton = document.createElement('button');
            ratingButton.title = this._t('account.rating_list.show_full', 'Показать полный рейтинг');
            ratingButton.style.cssText = `
                padding: 6px 10px;
                background: rgba(139, 69, 19, 0.2);
                border: 1px solid rgba(139, 69, 19, 0.4);
                border-radius: 6px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
            `;
            
            const ratingIcon = document.createElement('img');
            ratingIcon.src = 'media/r.jpg';
            ratingIcon.alt = this._t('account.rating_list.show_full', 'Показать полный рейтинг');
            ratingIcon.style.cssText = `
                width: ${isMobile ? '20px' : isTablet ? '22px' : '24px'};
                height: ${isMobile ? '20px' : isTablet ? '22px' : '24px'};
                object-fit: contain;
            `;
            ratingButton.appendChild(ratingIcon);
            ratingButton.onclick = () => this.showRatingList();
            
            ratingRow.appendChild(ratingLabel);
            ratingRow.appendChild(ratingValue);
            ratingRow.appendChild(ratingButton);
            statsBox.appendChild(ratingRow);

            // Асинхронно загружаем рейтинг
            const ratingUserId = currentUser?.id || currentUser?.uid || null;
            if (ratingUserId) {
                this.calculateUserRating(ratingUserId, openedLocations, totalLocations, completedTasks, totalTasks, openedBooks, totalBooks, currentUser.username).then(rating => {
                    ratingValue.textContent = rating !== null ? `#${rating}` : '—';
                }).catch(() => {
                    ratingValue.textContent = '—';
                });
            } else {
                ratingValue.textContent = '—';
            }

            const buttonsContainer = document.createElement('div');
            buttonsContainer.style.cssText = `
                display: flex;
                flex-direction: row;
                flex-wrap: wrap;
                justify-content: center;
                align-items: center;
                gap: ${isMobile ? '6px' : isTablet ? '8px' : '10px'};
                margin-bottom: 10px;
            `;

            if (isGuest) {
                const mkBtn = (text, bg, icon) => {
                    const b = document.createElement('button');
                    b.title = text; // Подсказка при наведении
                    b.style.cssText = `
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding: 0;
                        background: transparent;
                        border: none;
                        cursor: pointer;
                        width: auto;
                        height: auto;
                    `;
                    
                    if (icon) {
                        const iconImg = document.createElement('img');
                        iconImg.src = icon;
                        iconImg.alt = text;
                        iconImg.style.cssText = `
                            width: ${isMobile ? '48px' : isTablet ? '56px' : '64px'};
                            height: ${isMobile ? '48px' : isTablet ? '56px' : '64px'};
                            object-fit: contain;
                        `;
                        b.appendChild(iconImg);
                    }
                    
                    return b;
                };

                const btnGuest = mkBtn('Гость', '#8B4513', 'media/user.jpg');
                btnGuest.onclick = () => {
                    // Преобразуем headerName в input
                    const currentText = headerName.textContent;
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.value = currentText === 'Гость' ? '' : currentText;
                    input.placeholder = this._t('account.edit_username.placeholder', 'Введите имя');
                    input.style.cssText = headerName.style.cssText + `
                        border: 2px solid #8B4513;
                        border-radius: 6px;
                        padding: ${isMobile ? '4px 6px' : '4px 8px'};
                        background: rgba(255, 255, 255, 0.9);
                        outline: none;
                        width: ${isMobile ? '140px' : '200px'};
                        max-width: ${isMobile ? '140px' : '200px'};
                        font-size: ${isMobile ? '13px' : fontSizeTitle};
                        box-sizing: border-box;
                    `;
                    
                    // Создаем кнопку "Сохранить"
                    const saveBtn = document.createElement('button');
                    saveBtn.textContent = this._t('account.guest_rating.save', 'Сохранить');
                    saveBtn.style.cssText = `
                        padding: ${isMobile ? '4px 8px' : '6px 12px'};
                        background: #8B4513;
                        color: white;
                        border: none;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: ${isMobile ? '12px' : '14px'};
                        margin-left: ${isMobile ? '4px' : '8px'};
                        white-space: nowrap;
                    `;
                    
                    const saveGuestData = async () => {
                        const username = input.value.trim();
                        if (!username) {
                            alert(this._t('account.guest_rating.name_required', 'Имя обязательно для сохранения рейтинга!'));
                            input.focus();
                            return;
                        }
                        
                        saveBtn.disabled = true;
                        saveBtn.textContent = this._t('account.guest_rating.saving', 'Сохранение...');
                        
                        try {
                            // Получаем текущего пользователя
                            const user = this.currentUser || await this.getCurrentUser();
                            if (!user) {
                                throw new Error('Пользователь не найден');
                            }
                            
                            // Получаем текущий прогресс через единую функцию
                            const progress = this._calculateProgressFromLocalStorage();
                            const openedLocations = progress.openedLocations;
                            const openedBooks = progress.openedBooks;
                            const completedTasks = progress.completedTasks;
                            
                            // Обновляем username в Firestore
                            await window.userDatabase.updateUserMetadata({ username });
                            
                            // Принудительно обновляем this.currentUser
                            if (this.currentUser) {
                                this.currentUser.username = username;
                            }
                            
                            // Ждем немного, чтобы Firestore обновился
                            await new Promise(resolve => setTimeout(resolve, 500));
                            
                            // Перезагружаем данные пользователя из Firestore
                            const updatedUser = await this.getCurrentUser();
                            if (updatedUser) {
                                this.currentUser = updatedUser;
                                if (updatedUser.username !== username) {
                                    this.currentUser.username = username;
                                }
                            }
                            
                            // Используем обновленного пользователя для синхронизации
                            const userForSync = updatedUser || this.currentUser || user;
                            const userId = userForSync?.id || userForSync?.uid;
                            
                            if (!userId) {
                                throw new Error('ID пользователя не найден');
                            }
                            
                            if (userId && window.userDatabase?._syncToLeaderboard) {
                                await window.userDatabase._syncToLeaderboard(userId, {
                                    username: username,
                                    email: userForSync?.email || null,
                                    createdAt: userForSync?.createdAt || null,
                                    progress: userForSync?.progress || { openedLocations: 0, openedBooks: 0 },
                                    questState: userForSync?.questState || {}
                                }).catch(err => {
                                    console.error('[rating] Error syncing guest to leaderboard:', err);
                                });
                            } else if (!userId) {
                                console.warn('[rating] Cannot sync guest: no userId found', { 
                                    updatedUser: !!updatedUser, 
                                    currentUser: !!this.currentUser,
                                    currentUserParam: !!currentUser 
                                });
                            }
                            
                            // Обновляем отображение
                            headerName.textContent = username;
                            headerRow.replaceChild(headerName, input);
                            headerRow.removeChild(saveBtn);
                            
                            // Показываем сообщение в стиле книги
                            this.showInfoDialog(this._t('account.guest_rating.info_message', 'Прогресс может не сохраниться на вашем устройстве при очистке данных браузера. Для надежного сохранения используйте e-mail или аккаунт Google.'));
                            
                            // Перерисовываем страницу для обновления данных с обновленным пользователем
                            const finalUser = updatedUser || this.currentUser || user;
                            if (finalUser) {
                                renderUser(finalUser);
                            } else {
                                // Если пользователь не найден, перезагружаем меню
                    overlay.remove();
                                this.showAccountMenu();
                            }
                        } catch (error) {
                            console.error('Ошибка сохранения рейтинга гостя:', error);
                            alert(this._t('account.guest_rating.save_error', 'Ошибка сохранения:') + ' ' + (error?.message || String(error)));
                            saveBtn.disabled = false;
                            saveBtn.textContent = this._t('account.guest_rating.save', 'Сохранить');
                            input.focus();
                        }
                    };
                    
                    input.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            saveGuestData();
                        } else if (e.key === 'Escape') {
                            headerRow.replaceChild(headerName, input);
                            if (headerRow.contains(saveBtn)) {
                                headerRow.removeChild(saveBtn);
                            }
                        }
                    });
                    
                    saveBtn.onclick = saveGuestData;
                    
                    headerRow.replaceChild(input, headerName);
                    headerRow.appendChild(saveBtn);
                    input.focus();
                    input.select();
                };

                const btnEmail = mkBtn(this._t('account.actions.save_email', 'Email'), '#2196F3', 'media/email.jpg');
                btnEmail.onclick = () => {
                    overlay.remove();
                    this.showLinkAccountDialog();
                };

                const btnGoogle = mkBtn(this._t('account.actions.save_google', 'Google'), '#8B4513', 'media/gmail.jpg');
                btnGoogle.onclick = async () => {
                    try {
                        if (window.userDatabase && typeof window.userDatabase.linkAccountWithGoogle === 'function') {
                            const result = await window.userDatabase.linkAccountWithGoogle();
                            
                            // Если result === null, значит произошел redirect, страница перезагрузится
                            // Не нужно закрывать overlay или переоткрывать меню
                            if (result === null) {
                                return; // Redirect произойдет, страница перезагрузится
                            }
                            
                            overlay.remove();
                            
                            // Ждем немного для синхронизации данных
                            await new Promise(resolve => setTimeout(resolve, 1000));
                            
                            // Получаем данные пользователя после входа
                            const authUser = window.userDatabase?.getCurrentAuthUser?.();
                            if (authUser && !authUser.isAnonymous) {
                                try {
                                    const accountUser = await this.getCurrentUser();
                                    if (accountUser) {
                                        await this.showProgressChoiceDialog(accountUser);
                                    }
                                } catch (error) {
                                    console.warn('Ошибка получения данных пользователя после OAuth (не критично):', error);
                                    // Продолжаем работу даже если не удалось получить данные
                                }
                            }
                            
                            // Переоткрываем меню, чтобы подтянуть обновлённый профиль (isAnonymous=false)
                            this.showAccountMenu();
                        } else {
                            alert('Google auth не настроен');
                        }
                    } catch (e) {
                        alert(e?.message || String(e));
                    }
                };

                buttonsContainer.appendChild(btnGuest);
                buttonsContainer.appendChild(btnEmail);
                buttonsContainer.appendChild(btnGoogle);
            } else {
                const signOutBtn = document.createElement('button');
                signOutBtn.textContent = this._t('account.actions.logout', 'Выйти');
                signOutBtn.style.cssText = `
                    margin-top: 10px;
                    padding: 12px 16px;
                    background: #8B4513;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 16px;
                `;
                signOutBtn.onclick = async () => {
                    try {
                        // Перед выходом синхронизируем прогресс в leaderboard
                        const userId = currentUser?.id || currentUser?.uid;
                        if (userId && window.userDatabase?._syncToLeaderboard) {
                            try {
                                // Получаем текущий прогресс через единую функцию
                                const progress = this._calculateProgressFromLocalStorage();
                                const openedLocations = progress.openedLocations;
                                const openedBooks = progress.openedBooks;
                                const completedTasks = progress.completedTasks;
                                
                                // Синхронизируем в leaderboard перед выходом
                                await window.userDatabase._syncToLeaderboard(userId, {
                                    username: currentUser?.username || null,
                                    email: currentUser?.email || null,
                                    createdAt: currentUser?.createdAt || null,
                                    progress: {
                                        openedLocations: openedLocations,
                                        openedBooks: openedBooks
                                    },
                                    questState: currentUser?.questState || {}
                                }).catch(err => {
                                    console.error('[rating] Error syncing before signOut:', err);
                                });
                            } catch (syncError) {
                                console.error('[rating] Error preparing sync before signOut:', syncError);
                            }
                        }
                        
                        await window.userDatabase?.signOut?.();
                    } catch (_) {}
                    overlay.remove();
                };
                buttonsContainer.appendChild(signOutBtn);
            }

            body.appendChild(headerRow);
            body.appendChild(statsBox);
            
            // Заголовок "Сохранить результат" (только для гостей) - после блока рейтинга
            if (isGuest) {
                const saveTitle = document.createElement('div');
                saveTitle.textContent = this._t('account.stats.save_result', 'Сохранить результат');
                saveTitle.style.cssText = `
                    margin-top: 12px;
                    margin-bottom: 8px;
                    font-weight: bold;
                    color: #654321;
                    font-size: ${fontSizeHeader};
                    text-align: center;
                `;
                body.appendChild(saveTitle);
            }
            
            body.appendChild(buttonsContainer);
        };

        try {
            // Пытаемся получить профиль пользователя
            let currentUser = await this.getCurrentUser();

            // Если профиля ещё нет в Firestore — создаём базовый
            if (!currentUser && window.userDatabase && typeof window.userDatabase.getCurrentAuthUser === 'function') {
                const authUser = window.userDatabase.getCurrentAuthUser();
                if (authUser) {
                    status.textContent = 'Создаём профиль...';
                    await window.userDatabase.saveUser({
                        id: authUser.uid,
                        username: authUser.isAnonymous ? 'Гость' : (authUser.displayName || authUser.email?.split('@')[0] || 'Пользователь'),
                        email: authUser.email || null,
                        isAnonymous: !!authUser.isAnonymous,
                        questState: { tasks: {}, completedQuests: [] }
                    });
                    currentUser = await this.getCurrentUser();
                }
            }

            if (!currentUser) {
                body.innerHTML = '';
                const msg = document.createElement('div');
                msg.style.cssText = 'color:#654321; background: rgba(255,255,255,0.7); padding:12px; border-radius:8px; border:2px solid #8B4513; margin-bottom: 12px;';
                msg.textContent = this._t('account.errors.profile_not_ready', 'Профиль не готов. Попробуйте через пару секунд.');
                const retry = document.createElement('button');
                retry.textContent = this._t('account.actions.retry', 'Повторить');
                retry.style.cssText = `
                    padding: 12px 16px;
                    background: #8B4513;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 16px;
                `;
                retry.onclick = () => {
                    overlay.remove();
                    this.showAccountMenu();
                };
                body.appendChild(msg);
                body.appendChild(retry);
                return;
            }

            renderUser(currentUser);
        } catch (error) {
            console.error('Ошибка открытия меню аккаунта:', error);
            body.innerHTML = '';
            const msg = document.createElement('div');
            msg.style.cssText = 'color:#654321; background: rgba(255,255,255,0.7); padding:12px; border-radius:8px; border:2px solid #8B4513; margin-bottom: 12px;';
            msg.textContent = this._t('account.errors.open_failed', 'Ошибка открытия меню аккаунта') + ': ' + (error?.message || String(error));
            const retry = document.createElement('button');
            retry.textContent = this._t('account.actions.retry', 'Повторить');
            retry.style.cssText = `
                padding: 12px 16px;
                background: #8B4513;
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 16px;
            `;
            retry.onclick = () => {
                overlay.remove();
                this.showAccountMenu();
            };
            body.appendChild(msg);
            body.appendChild(retry);
        }

    }

    // Диалог сохранения рейтинга гостя
    async showSaveGuestRatingDialog(currentUser) {
        const screenSize = this._getScreenSize();
        const isMobile = screenSize === 'mobile';
        const isTablet = screenSize === 'tablet';

        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.85);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 20001;
            font-family: serif;
        `;

        // Адаптивные размеры
        const padding = isMobile ? '20px' : isTablet ? '28px' : '32px';
        const minWidth = isMobile ? '90vw' : isTablet ? '75vw' : '576px';
        const minHeight = isMobile ? '80vh' : isTablet ? '70vh' : '544px';
        const maxWidth = isMobile ? '95vw' : '95vw';
        const maxHeight = isMobile ? '90vh' : isTablet ? '85vh' : '85vh';

        // Верстка как в image-wrapper
        const dialog = document.createElement('div');
        dialog.className = 'image-wrapper';
        dialog.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            width: auto;
            height: 100%;
            max-width: 100%;
            max-height: 100%;
            box-sizing: border-box;
            position: relative;
            min-width: ${minWidth};
            min-height: ${minHeight};
            max-width: ${maxWidth};
            max-height: ${maxHeight};
            background: url('media/book/quest2.jpg') center no-repeat;
            background-size: contain;
            padding: ${padding};
            box-shadow: 0 4px 32px rgba(0,0,0,0.2);
            text-align: center;
            overflow: hidden;
        `;
        
        // Контейнер для содержимого с ограничением ширины
        const contentContainer = document.createElement('div');
        contentContainer.style.cssText = `
            width: ${isMobile ? '60%' : '70%'};
            max-width: ${isMobile ? '220px' : '400px'};
            max-height: calc(100% - ${padding} * 2);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            overflow-y: auto;
        `;

        const closeBtn = document.createElement('button');
        closeBtn.textContent = '✕';
        closeBtn.title = this._t('account.actions.close', 'Закрыть');
        closeBtn.style.cssText = `
            position: absolute;
            top: 12px;
            right: 12px;
            width: 36px;
            height: 36px;
            border-radius: 18px;
            border: none;
            cursor: pointer;
            background: rgba(0,0,0,0.55);
            color: white;
            font-size: 18px;
        `;
        closeBtn.onclick = () => overlay.remove();

        const title = document.createElement('div');
        title.textContent = this._t('account.guest_rating.title', 'Сохранить рейтинг Гостя');
        title.style.cssText = `
            font-size: ${isMobile ? '20px' : isTablet ? '22px' : '24px'};
            font-weight: bold;
            color: #654321;
            margin-bottom: 20px;
            text-align: center;
        `;

        const warning = document.createElement('div');
        warning.textContent = this._t('account.guest_rating.warning', '⚠️ Внимание: Прогресс может не сохраниться на вашем устройстве при очистке данных браузера.');
        warning.style.cssText = `
            font-size: 14px;
            color: #8B4513;
            margin-bottom: 20px;
            padding: 12px;
            background: rgba(139, 69, 19, 0.1);
            border-radius: 6px;
            line-height: 1.4;
        `;

        const usernameLabel = document.createElement('label');
        usernameLabel.textContent = this._t('account.guest_rating.name_label', 'Введите ваше имя (обязательно):');
        usernameLabel.style.cssText = `
            display: block;
            font-size: 16px;
            color: #654321;
            margin-bottom: 8px;
            text-align: left;
        `;

        const usernameInput = document.createElement('input');
        usernameInput.type = 'text';
        usernameInput.placeholder = this._t('account.guest_rating.name_placeholder', 'Ваше имя');
        usernameInput.style.cssText = `
            width: 100%;
            max-width: ${isMobile ? '180px' : '100%'};
            padding: ${isMobile ? '8px' : '10px'};
            margin-bottom: 20px;
            border: 2px solid #8B4513;
            border-radius: 6px;
            font-size: ${isMobile ? '14px' : '16px'};
            font-family: serif;
            color: #654321;
            background: rgba(255, 255, 255, 0.9);
            box-sizing: border-box;
        `;

        const errorMsg = document.createElement('div');
        errorMsg.style.cssText = `
            color: #d32f2f;
            font-size: 14px;
            margin-bottom: 12px;
            min-height: 20px;
            display: none;
        `;

        const buttonsContainer = document.createElement('div');
        buttonsContainer.style.cssText = `display: flex; flex-direction: column; gap: 12px; align-items: ${isMobile ? 'flex-start' : 'center'}; width: 100%;`;

        const saveBtn = document.createElement('button');
        saveBtn.textContent = this._t('account.guest_rating.save', 'Сохранить');
        saveBtn.style.cssText = `
            padding: ${isMobile ? '8px 12px' : '12px 24px'};
            background: #8B4513;
            color: white;
            border: none;
            border-radius: 6px;
            font-size: ${isMobile ? '13px' : '16px'};
            font-weight: bold;
            cursor: pointer;
            font-family: serif;
            width: ${isMobile ? '100%' : 'auto'};
            max-width: ${isMobile ? '150px' : 'none'};
        `;
        saveBtn.onclick = async () => {
            const username = usernameInput.value.trim();
            if (!username) {
                errorMsg.textContent = this._t('account.guest_rating.name_required', 'Имя обязательно для сохранения рейтинга!');
                errorMsg.style.display = 'block';
                return;
            }

            errorMsg.style.display = 'none';
            saveBtn.disabled = true;
            saveBtn.textContent = this._t('account.guest_rating.saving', 'Сохранение...');

            try {
                // Получаем текущий прогресс через единую функцию
                const progress = this._calculateProgressFromLocalStorage();
                const openedLocations = progress.openedLocations;
                const openedBooks = progress.openedBooks;
                const completedTasks = progress.completedTasks;

                // Сначала обновляем username в Firestore users коллекции
                await window.userDatabase.updateUserMetadata({
                    username: username
                });

                // Принудительно обновляем this.currentUser сразу
                if (this.currentUser) {
                    this.currentUser.username = username;
                }

                // Ждем немного, чтобы Firestore обновился
                await new Promise(resolve => setTimeout(resolve, 500));

                // Перезагружаем данные пользователя из Firestore, чтобы убедиться, что все синхронизировано
                const updatedUser = await this.getCurrentUser();
                // Обновляем this.currentUser, чтобы меню показывало правильное имя
                if (updatedUser) {
                    this.currentUser = updatedUser;
                    // Дополнительно убеждаемся, что username обновлен
                    if (updatedUser.username !== username) {
                        this.currentUser.username = username;
                        // Если Firestore еще не обновился, обновляем вручную
                        console.log('[saveGuest] username mismatch, forcing update', { 
                            firestoreUsername: updatedUser.username, 
                            enteredUsername: username 
                        });
                    }
                }
                
                // Затем синхронизируем в leaderboard с обновленными данными
                // Используем username из this.currentUser (который мы обновили) или введенное имя
                const finalUsername = this.currentUser?.username || username;
                // Немедленная синхронизация для обновления username
                await window.userDatabase._syncToLeaderboard(currentUser.id, {
                    username: finalUsername, // Используем обновленное имя
                    email: updatedUser?.email || null,
                    createdAt: updatedUser?.createdAt || currentUser?.createdAt || new Date().toISOString(),
                    progress: {
                        openedLocations: openedLocations,
                        openedBooks: openedBooks
                    },
                    questState: {
                        tasks: currentUser?.questState?.tasks || {}
                    }
                }, true); // immediate = true для важных обновлений

                overlay.remove();
                alert(this._t('account.guest_rating.save_success', 'Рейтинг сохранен!'));
                // Небольшая задержка перед открытием меню, чтобы данные точно обновились
                await new Promise(resolve => setTimeout(resolve, 200));
                this.showAccountMenu(); // Обновляем меню (там будет обновленный username)
            } catch (error) {
                console.error('Ошибка сохранения рейтинга гостя:', error);
                errorMsg.textContent = this._t('account.guest_rating.save_error', 'Ошибка сохранения:') + ' ' + (error?.message || String(error));
                errorMsg.style.display = 'block';
                saveBtn.disabled = false;
                saveBtn.textContent = this._t('account.guest_rating.save', 'Сохранить');
            }
        };

        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = 'Отмена';
        cancelBtn.style.cssText = `
            padding: 12px 24px;
            background: rgba(101, 67, 33, 0.3);
            color: #654321;
            border: 2px solid #8B4513;
            border-radius: 6px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            font-family: serif;
            width: 100%;
            max-width: 300px;
        `;
        cancelBtn.onclick = () => overlay.remove();

        usernameInput.onkeypress = (e) => {
            if (e.key === 'Enter') {
                saveBtn.onclick();
            }
        };

        buttonsContainer.appendChild(saveBtn);
        buttonsContainer.appendChild(cancelBtn);

        // Добавляем элементы в контейнер содержимого
        contentContainer.appendChild(title);
        contentContainer.appendChild(warning);
        contentContainer.appendChild(usernameLabel);
        contentContainer.appendChild(usernameInput);
        contentContainer.appendChild(errorMsg);
        contentContainer.appendChild(buttonsContainer);
        
        dialog.appendChild(closeBtn);
        dialog.appendChild(contentContainer);
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        usernameInput.focus();
    }

    // Диалог редактирования имени пользователя
    async showEditUsernameDialog(currentUsername, currentUser, renderUserCallback) {
        const screenSize = this._getScreenSize();
        const isMobile = screenSize === 'mobile';
        const isTablet = screenSize === 'tablet';

        const overlay = document.createElement('div');
        overlay.className = 'edit-username-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.85);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 20003;
            font-family: serif;
        `;

        // Адаптивные размеры
        const padding = isMobile ? '20px' : isTablet ? '28px' : '32px';
        const minWidth = isMobile ? '90vw' : isTablet ? '75vw' : '480px';
        const minHeight = isMobile ? '80vh' : isTablet ? '70vh' : '400px';
        const maxWidth = isMobile ? '95vw' : '95vw';
        const maxHeight = isMobile ? '90vh' : isTablet ? '85vh' : '85vh';

        // Верстка как в image-wrapper
        const dialog = document.createElement('div');
        dialog.className = 'image-wrapper';
        dialog.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-start;
            width: auto;
            height: 100%;
            max-width: 100%;
            max-height: 100%;
            box-sizing: border-box;
            position: relative;
            min-width: ${minWidth};
            min-height: ${minHeight};
            max-width: ${maxWidth};
            max-height: ${maxHeight};
            background: url('media/book/quest2.jpg') center no-repeat;
            background-size: contain;
            padding: ${padding};
            box-shadow: 0 4px 32px rgba(0,0,0,0.2);
            text-align: center;
            overflow: hidden;
        `;

        const closeBtn = document.createElement('button');
        closeBtn.textContent = '✕';
        closeBtn.title = this._t('account.actions.close', 'Закрыть');
        closeBtn.style.cssText = `
            position: absolute;
            top: 12px;
            right: 12px;
            width: 36px;
            height: 36px;
            border-radius: 18px;
            border: none;
            cursor: pointer;
            background: rgba(0,0,0,0.55);
            color: white;
            font-size: 18px;
        `;
        closeBtn.onclick = () => overlay.remove();

        const contentContainer = document.createElement('div');
        contentContainer.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            max-width: 400px;
            width: 80%;
            max-height: calc(100% - ${padding} * 2);
            overflow-y: auto;
        `;

        const title = document.createElement('h2');
        title.textContent = this._t('account.edit_username.title', 'Изменить имя');
        title.style.cssText = `
            color: #8B4513;
            margin-bottom: 20px;
            font-size: ${isMobile ? '20px' : isTablet ? '22px' : '26px'};
            font-weight: bold;
            text-align: center;
        `;

        const usernameLabel = document.createElement('label');
        usernameLabel.textContent = this._t('account.edit_username.label', 'Имя пользователя:');
        usernameLabel.style.cssText = `
            color: #654321;
            font-size: ${isMobile ? '14px' : '16px'};
            margin-bottom: 8px;
            text-align: left;
            width: 100%;
        `;

        const usernameInput = document.createElement('input');
        usernameInput.type = 'text';
        usernameInput.value = currentUsername || '';
        usernameInput.placeholder = this._t('account.edit_username.placeholder', 'Введите имя');
        usernameInput.style.cssText = `
            width: 100%;
            padding: 12px;
            border: 2px solid #8B4513;
            border-radius: 6px;
            font-size: ${isMobile ? '14px' : '16px'};
            color: #654321;
            background: rgba(255, 255, 255, 0.9);
            font-family: serif;
            box-sizing: border-box;
        `;

        const errorMsg = document.createElement('div');
        errorMsg.style.cssText = `
            color: #d32f2f;
            font-size: 14px;
            margin-top: 8px;
            display: none;
            text-align: center;
            width: 100%;
        `;

        const buttonsContainer = document.createElement('div');
        buttonsContainer.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 12px;
            align-items: center;
            width: 100%;
            margin-top: 20px;
        `;

        const saveBtn = document.createElement('button');
        saveBtn.textContent = this._t('account.edit_username.save', 'Сохранить');
        saveBtn.style.cssText = `
            padding: 12px 24px;
            background: #8B4513;
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            font-family: serif;
            width: 100%;
            max-width: 300px;
        `;
        saveBtn.onclick = async () => {
            const newName = usernameInput.value.trim();
            if (!newName) {
                errorMsg.textContent = this._t('account.edit_username.empty_error', 'Имя не может быть пустым!');
                errorMsg.style.display = 'block';
                return;
            }

            errorMsg.style.display = 'none';
            saveBtn.disabled = true;
            saveBtn.textContent = this._t('account.edit_username.saving', 'Сохранение...');

            try {
                await window.userDatabase.updateUserMetadata({ username: newName });
                // Обновляем локальные данные
                currentUser.username = newName;
                this.currentUser = { ...(this.currentUser || {}), username: newName };
                
                // Синхронизируем в leaderboard немедленно
                await window.userDatabase._syncToLeaderboard(currentUser.id, {
                    username: newName,
                    email: currentUser?.email || null,
                    createdAt: currentUser?.createdAt || null,
                    progress: currentUser?.progress || { openedLocations: 0, openedBooks: 0 },
                    questState: currentUser?.questState || { tasks: {} }
                }, true); // immediate = true

                overlay.remove();
                // Обновляем отображение пользователя
                renderUserCallback({ ...currentUser, username: newName });
            } catch (e) {
                console.error('Ошибка обновления имени:', e);
                errorMsg.textContent = this._t('account.edit_username.update_error', 'Не удалось обновить имя:') + ' ' + (e?.message || String(e));
                errorMsg.style.display = 'block';
                saveBtn.disabled = false;
                saveBtn.textContent = this._t('account.edit_username.save', 'Сохранить');
            }
        };

        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = this._t('account.edit_username.cancel', 'Отмена');
        cancelBtn.style.cssText = `
            padding: 12px 24px;
            background: rgba(101, 67, 33, 0.3);
            color: #654321;
            border: 2px solid #8B4513;
            border-radius: 6px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            font-family: serif;
            width: 100%;
            max-width: 300px;
        `;
        cancelBtn.onclick = () => overlay.remove();

        usernameInput.onkeypress = (e) => {
            if (e.key === 'Enter') {
                saveBtn.onclick();
            }
        };

        buttonsContainer.appendChild(saveBtn);
        buttonsContainer.appendChild(cancelBtn);

        contentContainer.appendChild(title);
        contentContainer.appendChild(usernameLabel);
        contentContainer.appendChild(usernameInput);
        contentContainer.appendChild(errorMsg);
        contentContainer.appendChild(buttonsContainer);
        
        dialog.appendChild(closeBtn);
        dialog.appendChild(contentContainer);
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        usernameInput.focus();
        usernameInput.select();
    }

    // Диалог входа по email/password (для пользователей, которые заходят с другого устройства)
    async showSignInDialog(prefillEmail = '') {
        const screenSize = this._getScreenSize();
        const isMobile = screenSize === 'mobile';
        const isTablet = screenSize === 'tablet';

        const overlay = document.createElement('div');
        overlay.className = 'sign-in-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.85);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 20001;
            font-family: serif;
        `;

        // Адаптивные размеры
        const padding = isMobile ? '20px' : isTablet ? '28px' : '32px';
        const minWidth = isMobile ? '90vw' : isTablet ? '75vw' : '576px';
        const minHeight = isMobile ? '80vh' : isTablet ? '70vh' : '544px';
        const maxWidth = isMobile ? '95vw' : '95vw';
        const maxHeight = isMobile ? '90vh' : isTablet ? '85vh' : '85vh';

        // Верстка как в image-wrapper
        const dialog = document.createElement('div');
        dialog.className = 'image-wrapper';
        dialog.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            width: auto;
            height: 100%;
            max-width: 100%;
            max-height: 100%;
            box-sizing: border-box;
            position: relative;
            min-width: ${minWidth};
            min-height: ${minHeight};
            max-width: ${maxWidth};
            max-height: ${maxHeight};
            background: url('media/book/quest2.jpg') center no-repeat;
            background-size: contain;
            padding: ${padding};
            box-shadow: 0 4px 32px rgba(0,0,0,0.2);
            text-align: center;
            overflow: hidden;
        `;

        // Кнопка закрытия
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '✕';
        closeBtn.title = this._t('account.actions.close', 'Закрыть');
        closeBtn.style.cssText = `
            position: absolute;
            top: 12px;
            right: 12px;
            width: 36px;
            height: 36px;
            border-radius: 18px;
            border: none;
            cursor: pointer;
            background: rgba(0,0,0,0.55);
            color: white;
            font-size: 18px;
            z-index: 1;
        `;
        closeBtn.onclick = () => overlay.remove();

        // Контейнер для формы (как в попапе "Привязать email")
        const formContainer = document.createElement('div');
        formContainer.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 100%;
            max-width: 400px;
            margin: 0 auto;
            margin-top: calc(${minHeight} / 4);
        `;

        const emailInput = document.createElement('input');
        emailInput.type = 'email';
        emailInput.placeholder = 'Email';
        if (prefillEmail) emailInput.value = prefillEmail;
        emailInput.style.cssText = `
            width: 100%;
            padding: 12px;
            margin-bottom: 15px;
            border: 2px solid #8B4513;
            border-radius: 5px;
            font-size: 16px;
            box-sizing: border-box;
        `;

        const passwordInput = document.createElement('input');
        passwordInput.type = 'password';
        passwordInput.placeholder = 'Пароль';
        passwordInput.style.cssText = `
            width: 100%;
            padding: 12px;
            margin-bottom: 15px;
            border: 2px solid #8B4513;
            border-radius: 5px;
            font-size: 16px;
            box-sizing: border-box;
        `;

        const errorMsg = document.createElement('div');
        errorMsg.style.cssText = `
            color: #5c3b1e;
            margin-bottom: 15px;
            font-size: 14px;
            min-height: 20px;
        `;

        const buttonsContainer = document.createElement('div');
        buttonsContainer.style.cssText = 'display: flex; flex-direction: column; gap: 10px; width: 100%;';

        const signInBtn = document.createElement('button');
        signInBtn.textContent = this._t('account.link_account.signin_button', 'Войти');
        signInBtn.style.cssText = `
            padding: 12px 24px;
            background: #A0826D;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            width: 100%;
        `;
        signInBtn.onclick = async () => {
            const email = emailInput.value.trim();
            const password = passwordInput.value;
            if (!email || !password) {
                errorMsg.textContent = this._t('account.link_account.email_password_required', 'Введите email и пароль');
                return;
            }
            signInBtn.disabled = true;
            signInBtn.textContent = '...';
            errorMsg.textContent = '';
            try {
                await window.userDatabase.signInWithEmail(email, password);
                overlay.remove();
                
                // Ждем немного для синхронизации данных
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Получаем данные пользователя после входа
                const authUser = window.userDatabase?.getCurrentAuthUser?.();
                if (authUser && !authUser.isAnonymous) {
                    try {
                        const accountUser = await this.getCurrentUser();
                        if (accountUser) {
                            await this.showProgressChoiceDialog(accountUser);
                        }
                    } catch (error) {
                        console.warn('Ошибка получения данных пользователя после входа (не критично):', error);
                        // Продолжаем работу даже если не удалось получить данные
                    }
                }
                
                await this.updateAccountButton();
            } catch (e) {
                errorMsg.textContent = e?.message || String(e);
                signInBtn.disabled = false;
                signInBtn.textContent = 'Войти';
            }
        };

        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = 'Отмена';
        cancelBtn.style.cssText = `
            padding: 12px 24px;
            background: #5c3b1e;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            width: 100%;
        `;
        cancelBtn.onclick = () => overlay.remove();

        buttonsContainer.appendChild(signInBtn);
        buttonsContainer.appendChild(cancelBtn);

        formContainer.appendChild(emailInput);
        formContainer.appendChild(passwordInput);
        formContainer.appendChild(errorMsg);
        formContainer.appendChild(buttonsContainer);

        dialog.appendChild(closeBtn);
        dialog.appendChild(formContainer);

        overlay.appendChild(dialog);
        document.body.appendChild(overlay);
    }

    // Рассчитать рейтинг пользователя
    async calculateUserRating(userId, openedLocations, totalLocations, completedTasks, totalTasks, openedBooks, totalBooks, username = null) {
        try {
            if (!window.userDatabase) return null;
            // Если userId не передан, пробуем взять из текущего пользователя
            if (!userId) {
                const currentUser = await this.getCurrentUser();
                userId = currentUser?.id || currentUser?.uid || null;
            }
            if (!userId) return null;
            
            // Синхронизируем текущего пользователя в leaderboard (используем данные из параметров)
            try {
                console.log('[rating] calculateUserRating: syncing to leaderboard', { userId, usernameParam: username });
                
                // Получаем username из параметра или из текущего пользователя
                let finalUsername = username;
                if (!finalUsername || finalUsername === 'Гость') {
                    const currentUser = await this.getCurrentUser();
                    const authUser = window.userDatabase?.getCurrentAuthUser?.();
                    
                    console.log('[rating] calculateUserRating: determining username', {
                        usernameParam: username,
                        currentUserUsername: currentUser?.username,
                        authUser: authUser ? { uid: authUser.uid, displayName: authUser.displayName, email: authUser.email } : null
                    });
                    
                    // Приоритет: currentUser.username -> auth.displayName -> auth.email -> 'Гость'
                    finalUsername = currentUser?.username;
                    if (!finalUsername || finalUsername === 'Гость') {
                        if (authUser) {
                            finalUsername = authUser.displayName || authUser.email?.split('@')[0] || 'Гость';
                            console.log('[rating] calculateUserRating: using auth username', { finalUsername });
                        } else {
                            finalUsername = 'Гость';
                            console.log('[rating] calculateUserRating: no auth user, using Гость');
                        }
                    } else {
                        console.log('[rating] calculateUserRating: using currentUser username', { finalUsername });
                    }
                } else {
                    console.log('[rating] calculateUserRating: using param username', { finalUsername });
                }
                
                const currentUserData = {
                    username: finalUsername,
                    progress: {
                        openedLocations: openedLocations,
                        openedBooks: openedBooks
                    },
                    questState: {
                        tasks: {}
                    }
                };
                // Заполняем tasks из completedTasks
                for (let i = 1; i <= completedTasks; i++) {
                    currentUserData.questState.tasks[i] = true;
                }
                // Немедленная синхронизация для расчета рейтинга
                await window.userDatabase._syncToLeaderboard(userId, currentUserData, true);
            } catch (_) {}

            // Рассчитываем прогресс текущего пользователя
            const currentProgress = {
                locations: (openedLocations / totalLocations) * 100,
                quests: (completedTasks / totalTasks) * 100,
                books: (openedBooks / totalBooks) * 100
            };
            const currentTotal = (currentProgress.locations + currentProgress.quests + currentProgress.books) / 3;

            // Получаем всех пользователей из публичной коллекции leaderboard
            let allUsers = {};
            try {
                if (window.userDatabase && window.userDatabase.db) {
                    const leaderboardSnapshot = await window.userDatabase.db.collection('leaderboard').get();
                    leaderboardSnapshot.forEach(doc => {
                        const data = doc.data();
                        allUsers[data.userId] = {
                            id: data.userId,
                            username: data.username || 'Гость',
                            progress: {
                                openedLocations: data.openedLocations || 0,
                                openedBooks: data.openedBooks || 0
                            },
                            questState: {
                                tasks: data.tasks || {}
                            }
                        };
                    });
                    console.log('[rating] calculateUserRating leaderboard result:', Object.keys(allUsers).length, 'users');
                }
            } catch (leaderboardError) {
                console.error('[rating] calculateUserRating ошибка leaderboard:', leaderboardError?.message || leaderboardError);
            }

            // Рассчитываем прогресс всех пользователей
            const userProgress = [];
            
            // Добавляем текущего пользователя в список (только если прогресс > 0)
            if (currentTotal > 0 || openedLocations > 0 || completedTasks > 0 || openedBooks > 0) {
                userProgress.push({
                    uid: userId,
                    username: 'Вы',
                    total: currentTotal,
                    locations: openedLocations,
                    tasks: completedTasks,
                    books: openedBooks
                });
            }

            // Добавляем остальных пользователей (только с прогрессом > 0)
            for (const [uid, user] of Object.entries(allUsers)) {
                // Пропускаем текущего пользователя, если он уже есть в Firestore
                if (uid === userId) continue;
                
                const userLocations = user.progress?.openedLocations || 0;
                const userTasks = Object.values(user.questState?.tasks || {}).filter(Boolean).length;
                const userBooks = user.progress?.openedBooks || 0;
                
                // Пропускаем пользователей с нулевым прогрессом
                if (userLocations === 0 && userTasks === 0 && userBooks === 0) continue;
                
                const progress = {
                    locations: (userLocations / totalLocations) * 100,
                    quests: (userTasks / totalTasks) * 100,
                    books: (userBooks / totalBooks) * 100
                };
                const total = (progress.locations + progress.quests + progress.books) / 3;
                
                userProgress.push({
                    uid,
                    username: user.username || 'Гость',
                    total,
                    locations: userLocations,
                    tasks: userTasks,
                    books: userBooks
                });
            }

            // Сортируем по убыванию прогресса
            userProgress.sort((a, b) => b.total - a.total);

            // Находим позицию текущего пользователя
            const userIndex = userProgress.findIndex(u => u.uid === userId);
            return userIndex >= 0 ? userIndex + 1 : null;
        } catch (error) {
            console.error('Ошибка расчета рейтинга:', error);
            return null;
        }
    }

    // Показать полный список рейтинга
    async showRatingList() {
        if (!document.body) {
            document.addEventListener('DOMContentLoaded', () => this.showRatingList());
            return;
        }

        const screenSize = this._getScreenSize();
        const isMobile = screenSize === 'mobile';
        const isTablet = screenSize === 'tablet';

        const overlay = document.createElement('div');
        overlay.className = 'rating-list-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.85);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 20002;
            font-family: serif;
        `;

        // Адаптивные размеры для рейтинга
        const padding = isMobile ? '20px' : isTablet ? '32px' : '40px';
        const minWidth = isMobile ? '90vw' : isTablet ? '80vw' : '600px';
        const minHeight = isMobile ? '85vh' : isTablet ? '75vh' : '576px';
        const maxWidth = isMobile ? '95vw' : '95vw';
        const maxHeight = isMobile ? '90vh' : isTablet ? '85vh' : '95vh';

        // Верстка как в image-wrapper
        const ratingCard = document.createElement('div');
        ratingCard.className = 'image-wrapper';
        ratingCard.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            width: auto;
            height: 100%;
            max-width: 100%;
            max-height: 100%;
            box-sizing: border-box;
            position: relative;
            min-width: ${minWidth};
            min-height: ${minHeight};
            max-width: ${maxWidth};
            max-height: ${maxHeight};
            background: url('media/book/quest2.jpg') center no-repeat;
            background-size: contain;
            padding: ${padding};
            box-shadow: 0 4px 32px rgba(0,0,0,0.2);
            text-align: center;
            overflow: hidden;
        `;

        const closeBtn = document.createElement('button');
        closeBtn.textContent = '✕';
        closeBtn.title = this._t('account.actions.close', 'Закрыть');
        closeBtn.style.cssText = `
            position: absolute;
            top: 12px;
            right: 12px;
            width: 36px;
            height: 36px;
            border-radius: 18px;
            border: none;
            cursor: pointer;
            background: rgba(0,0,0,0.55);
            color: white;
            font-size: 18px;
        `;
        closeBtn.onclick = () => overlay.remove();

        const refreshBtn = document.createElement('button');
        refreshBtn.textContent = '🔄';
        refreshBtn.title = 'Обновить рейтинг из базы';
        refreshBtn.style.cssText = `
            position: absolute;
            top: 12px;
            right: 56px;
            width: 36px;
            height: 36px;
            border-radius: 18px;
            border: none;
            cursor: pointer;
            background: rgba(139, 69, 19, 0.7);
            color: white;
            font-size: 18px;
        `;

        const contentContainer = document.createElement('div');
        contentContainer.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            width: 100%;
            max-width: 100%;
            max-height: calc(100% - ${padding} * 2);
            overflow-y: auto;
        `;

        const title = document.createElement('h2');
        title.textContent = this._t('account.rating_list.title', 'Общий рейтинг');
        title.style.cssText = `
            color: #8B4513;
            margin-bottom: 20px;
            font-size: ${isMobile ? '20px' : isTablet ? '22px' : '26px'};
            font-weight: bold;
        `;

        const listContainer = document.createElement('div');
        // Ограничиваем высоту списка, чтобы он не выходил за пределы фона
        const titleHeight = isMobile ? 60 : isTablet ? 70 : 80;
        const listMaxHeight = `calc(100% - ${titleHeight}px - 40px)`;
        listContainer.style.cssText = `
            text-align: left; 
            color: #654321; 
            width: 80%; 
            margin: 0 auto;
            max-height: ${listMaxHeight};
            overflow-y: auto;
            overflow-x: hidden;
            padding-right: 8px;
            flex-shrink: 0;
        `;

        const loadingMsg = document.createElement('div');
        loadingMsg.textContent = this._t('account.rating_list.loading', 'Загрузка рейтинга...');
        loadingMsg.style.cssText = 'text-align: center; padding: 20px; color: #654321;';
        listContainer.appendChild(loadingMsg);

        contentContainer.appendChild(title);
        contentContainer.appendChild(listContainer);

        ratingCard.appendChild(closeBtn);
        ratingCard.appendChild(refreshBtn);
        ratingCard.appendChild(contentContainer);
        overlay.appendChild(ratingCard);
        document.body.appendChild(overlay);

        // Функция для загрузки данных рейтинга
        const loadRatingData = async () => {
            loadingMsg.textContent = this._t('account.rating_list.loading', 'Загрузка рейтинга...');
            listContainer.innerHTML = '';
            listContainer.appendChild(loadingMsg);
            
            try {
            const totalLocations = UserAccountManager.LOCATION_PAGES.length;
            const totalTasks = UserAccountManager.TOTAL_QUEST_TASKS;
            const totalBooks = UserAccountManager.TOTAL_BOOKS;
            const currentUser = await this.getCurrentUser();
            const currentUserId = currentUser?.id;
            
            // Получаем данные текущего пользователя (вычисляем ДО использования)
            const visitedPages = this._getVisitedPages();
            const visitedPageKeys = Object.keys(visitedPages);
            const currentOpenedLocations = visitedPageKeys.filter((p) => UserAccountManager.LOCATION_PAGES.includes(p)).length;
            const currentTasks = Object.values(currentUser?.questState?.tasks || {}).filter(Boolean).length;
            const currentOpenedBooks = Object.keys(this._getOpenedGeoMarkers()).length;
            
            // Синхронизируем текущего пользователя в leaderboard (используем данные из localStorage)
            if (currentUserId) {
                try {
                    console.log('[rating] showRatingList: syncing current user', { 
                        currentUserId, 
                        currentUserUsername: currentUser?.username,
                        currentUser: currentUser
                    });
                    
                    // Определяем username: приоритет у currentUser, затем auth
                    let username = currentUser?.username;
                    const authUser = window.userDatabase?.getCurrentAuthUser?.();
                    console.log('[rating] showRatingList: username determination', {
                        currentUserUsername: currentUser?.username,
                        authUser: authUser ? { uid: authUser.uid, displayName: authUser.displayName, email: authUser.email } : null
                    });
                    
                    if (!username || username === 'Гость') {
                        if (authUser) {
                            username = authUser.displayName || authUser.email?.split('@')[0] || 'Гость';
                            console.log('[rating] showRatingList: using auth username', { username });
                        } else {
                            username = 'Гость';
                            console.log('[rating] showRatingList: no auth user, using Гость');
                        }
                    } else {
                        console.log('[rating] showRatingList: using currentUser username', { username });
                    }
                    
                    const currentUserData = {
                        username: username,
                        email: currentUser?.email || null,
                        createdAt: currentUser?.createdAt || null,
                        progress: {
                            openedLocations: currentOpenedLocations,
                            openedBooks: currentOpenedBooks
                        },
                        questState: {
                            tasks: currentUser?.questState?.tasks || {}
                        }
                    };
                    console.log('[rating] showRatingList: calling _syncToLeaderboard', { currentUserId, currentUserData });
                    // Немедленная синхронизация для обновления рейтинга
                    await window.userDatabase._syncToLeaderboard(currentUserId, currentUserData, true);
                } catch (error) {
                    console.error('[rating] showRatingList: error syncing current user', { error: error?.message || String(error) });
                }
            }
            
            // Не синхронизируем всех пользователей здесь - это вызывает ошибки прав доступа
            // Данные уже синхронизируются при обновлении прогресса каждого пользователя

            // Получаем всех пользователей из публичной коллекции leaderboard
            let allUsers = {};
            try {
                if (window.userDatabase && window.userDatabase.db) {
                    const leaderboardSnapshot = await window.userDatabase.db.collection('leaderboard').get();
                    // Собираем все userId с username='Гость' для обновления
                    const usersToUpdate = [];
                    
                    leaderboardSnapshot.forEach(doc => {
                        const data = doc.data();
                        let username = data.username || 'Гость';
                        
                        console.log('[rating] showRatingList: reading from leaderboard', { 
                            userId: data.userId, 
                            usernameFromLeaderboard: username,
                            email: data.email,
                            createdAt: data.createdAt,
                            isCurrentUser: data.userId === currentUserId,
                            fullData: data
                        });
                        
                        // Пропускаем записи без userId
                        if (!data.userId || data.userId === 'undefined' || data.userId === undefined) {
                            console.log('[rating] showRatingList: skipping entry without userId', { data });
                            return;
                        }
                        
                        // Если username='Гость' и userId валидный, добавляем в список для обновления
                        if (username === 'Гость' && data.userId) {
                            usersToUpdate.push({ userId: data.userId, data: data });
                        }
                        
                        // Если это текущий пользователь, всегда обновляем username из auth/Firestore
                        if (data.userId === currentUserId) {
                            const authUser = window.userDatabase?.getCurrentAuthUser?.();
                            const authUsername = authUser?.displayName || authUser?.email?.split('@')[0];
                            
                            console.log('[rating] showRatingList: updating current user username', {
                                currentUserId,
                                usernameFromLeaderboard: username,
                                currentUserUsername: currentUser?.username,
                                authUsername: authUsername
                            });
                            
                            if (currentUser?.username && currentUser.username !== 'Гость') {
                                username = currentUser.username;
                                console.log('[rating] showRatingList: using currentUser.username', { username });
                            } else if (authUsername) {
                                username = authUsername;
                                console.log('[rating] showRatingList: using authUsername', { username });
                            }
                            
                            // Всегда обновляем в leaderboard для текущего пользователя
                            if (username !== 'Гость' && username !== data.username) {
                                console.log('[rating] showRatingList: updating leaderboard for current user', { 
                                    oldUsername: data.username, 
                                    newUsername: username 
                                });
                                // Немедленная синхронизация для обновления username
                                window.userDatabase._syncToLeaderboard(currentUserId, {
                                    username: username,
                                    email: currentUser?.email || data.email || null,
                                    createdAt: currentUser?.createdAt || data.createdAt || null,
                                    progress: {
                                        openedLocations: data.openedLocations || 0,
                                        openedBooks: data.openedBooks || 0
                                    },
                                    questState: {
                                        tasks: data.tasks || {}
                                    }
                                }, true).catch((error) => {
                                    console.error('[rating] showRatingList: error updating leaderboard', { error: error?.message || String(error) });
                                });
                            } else {
                                console.log('[rating] showRatingList: no need to update leaderboard', { 
                                    username, 
                                    dataUsername: data.username,
                                    reason: username === 'Гость' ? 'username is Гость' : 'username unchanged'
                                });
                            }
                        }
                        
                        allUsers[data.userId] = {
                            id: data.userId,
                            username: username,
                            email: data.email || null,
                            createdAt: data.createdAt || null,
                            progress: {
                                openedLocations: data.openedLocations || 0,
                                openedBooks: data.openedBooks || 0
                            },
                            questState: {
                                tasks: data.tasks || {}
                            }
                        };
                        console.log('[rating] showRatingList: added user to allUsers', { 
                            userId: data.userId, 
                            username, 
                            email: data.email, 
                            createdAt: data.createdAt,
                            data: data
                        });
                    });
                    
                    // Пытаемся обновить username для пользователей с 'Гость' из Firestore
                    if (usersToUpdate.length > 0) {
                        console.log('[rating] showRatingList: trying to update usernames from Firestore', { usersToUpdate: usersToUpdate.length });
                        for (const { userId, data } of usersToUpdate) {
                            // Пропускаем записи без валидного userId
                            if (!userId || userId === 'undefined') {
                                console.log('[rating] showRatingList: skipping update for invalid userId', { userId });
                                continue;
                            }
                            
                            try {
                                const userDoc = await window.userDatabase.db.collection('users').doc(userId).get();
                                if (userDoc.exists) {
                                    const userData = userDoc.data();
                                    const firestoreUsername = userData.username;
                                    if (firestoreUsername && firestoreUsername !== 'Гость') {
                                        console.log('[rating] showRatingList: updating username from Firestore', { userId, firestoreUsername });
                                        // Обновляем в leaderboard
                                        // Немедленная синхронизация для обновления username из Firestore
                                        await window.userDatabase._syncToLeaderboard(userId, {
                                            username: firestoreUsername,
                                            email: userData.email || data.email || null,
                                            createdAt: userData.createdAt || data.createdAt || null,
                                            progress: {
                                                openedLocations: data.openedLocations || 0,
                                                openedBooks: data.openedBooks || 0
                                            },
                                            questState: {
                                                tasks: data.tasks || {}
                                            }
                                        }, true);
                                        // Обновляем в локальном объекте для отображения
                                        if (allUsers[userId]) {
                                            allUsers[userId].username = firestoreUsername;
                                        }
                                    }
                                }
                            } catch (error) {
                                // Игнорируем ошибки прав доступа - это нормально для других пользователей
                                console.log('[rating] showRatingList: cannot update username from Firestore', { userId, error: error?.message });
                            }
                        }
                    }
                    
                    console.log('[rating] leaderboard result:', Object.keys(allUsers).length, 'users');
                }
            } catch (leaderboardError) {
                console.error('[rating] Ошибка получения leaderboard:', leaderboardError?.message || leaderboardError);
            }

            // Рассчитываем прогресс всех пользователей
            const userProgress = [];
            
            // Добавляем текущего пользователя в список (только если прогресс > 0 и не "Гость")
            const currentUsername = currentUser?.username || 'Гость';
            const currentProgress = {
                locations: (currentOpenedLocations / totalLocations) * 100,
                quests: (currentTasks / totalTasks) * 100,
                books: (currentOpenedBooks / totalBooks) * 100
            };
            const currentTotal = (currentProgress.locations + currentProgress.quests + currentProgress.books) / 3;
            
            // Пропускаем гостей
            if (currentUsername !== 'Гость' && currentUsername.toLowerCase() !== 'гость' && 
                (currentTotal > 0 || currentOpenedLocations > 0 || currentTasks > 0 || currentOpenedBooks > 0)) {
                userProgress.push({
                    uid: currentUserId,
                    username: currentUsername,
                    email: currentUser?.email || null,
                    createdAt: currentUser?.createdAt || null,
                    total: Math.round(currentTotal * 10) / 10,
                    locations: currentOpenedLocations,
                    tasks: currentTasks,
                    books: currentOpenedBooks
                });
            }

            // Добавляем остальных пользователей
            for (const [uid, user] of Object.entries(allUsers)) {
                // Пропускаем текущего пользователя, если он уже есть в Firestore
                if (uid === currentUserId) continue;
                
                const userLocations = user.progress?.openedLocations || 0;
                const userTasks = Object.values(user.questState?.tasks || {}).filter(Boolean).length;
                const userBooks = user.progress?.openedBooks || 0;
                
                const progress = {
                    locations: (userLocations / totalLocations) * 100,
                    quests: (userTasks / totalTasks) * 100,
                    books: (userBooks / totalBooks) * 100
                };
                const total = (progress.locations + progress.quests + progress.books) / 3;
                
                // Пропускаем всех гостей (независимо от рейтинга)
                const username = user.username || 'Гость';
                if (username === 'Гость' || username.toLowerCase() === 'гость') {
                    continue;
                }
                
                userProgress.push({
                    uid,
                    username: username,
                    email: user.email || null,
                    createdAt: user.createdAt || null,
                    total: Math.round(total * 10) / 10,
                    locations: userLocations,
                    tasks: userTasks,
                    books: userBooks
                });
            }

            // Сортируем по убыванию прогресса
            userProgress.sort((a, b) => b.total - a.total);

            listContainer.innerHTML = '';
            userProgress.forEach((user, index) => {
                const row = document.createElement('div');
                row.style.cssText = `
                    display: flex;
                    flex-direction: column;
                    padding: ${isMobile ? '8px' : '10px'};
                    margin-bottom: ${isMobile ? '4px' : '6px'};
                    background: ${user.uid === currentUserId ? 'rgba(139, 69, 19, 0.2)' : 'rgba(255, 255, 255, 0.1)'};
                    border-radius: 6px;
                    border: ${user.uid === currentUserId ? '2px solid #8B4513' : 'none'};
                `;

                const topRow = document.createElement('div');
                topRow.style.cssText = `display: flex; justify-content: space-between; align-items: center; margin-bottom: ${isMobile ? '4px' : '6px'};`;

                const rank = document.createElement('div');
                rank.textContent = `#${index + 1}`;
                rank.style.cssText = 'font-weight: bold; font-size: 18px; width: 50px;';

                const name = document.createElement('div');
                name.textContent = user.username;
                name.style.cssText = 'flex: 1; font-size: 16px; margin-left: 12px; font-weight: bold;';

                const progress = document.createElement('div');
                progress.textContent = `${user.total}%`;
                progress.style.cssText = 'font-weight: bold; font-size: 16px; width: 80px; text-align: right;';

                const details = document.createElement('div');
                const detailsText = this._t('account.rating_list.details_format', 'Л:{locations} К:{tasks} Б:{books}');
                details.textContent = detailsText.replace('{locations}', user.locations).replace('{tasks}', user.tasks).replace('{books}', user.books);
                details.style.cssText = 'font-size: 12px; color: rgba(101, 67, 33, 0.7); width: 100px; text-align: right; margin-left: 12px;';

                topRow.appendChild(rank);
                topRow.appendChild(name);
                topRow.appendChild(progress);
                topRow.appendChild(details);

                row.appendChild(topRow);
                listContainer.appendChild(row);
            });
            } catch (error) {
                console.error('Ошибка загрузки рейтинга:', error);
                loadingMsg.textContent = this._t('account.rating_list.load_error', 'Ошибка загрузки рейтинга');
            }
        };

        // Обработчик кнопки обновления
        refreshBtn.onclick = async () => {
            refreshBtn.disabled = true;
            refreshBtn.style.opacity = '0.5';
            await loadRatingData();
            refreshBtn.disabled = false;
            refreshBtn.style.opacity = '1';
        };

        // Первоначальная загрузка
        loadRatingData();
    }

    // Показать диалог привязки email
    async showLinkAccountDialog() {
        const screenSize = this._getScreenSize();
        const isMobile = screenSize === 'mobile';
        const isTablet = screenSize === 'tablet';

        const overlay = document.createElement('div');
        overlay.className = 'link-account-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.85);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 20001;
            font-family: serif;
        `;

        // Адаптивные размеры
        const padding = isMobile ? '20px' : isTablet ? '28px' : '32px';
        const minWidth = isMobile ? '90vw' : isTablet ? '75vw' : '576px';
        const minHeight = isMobile ? '80vh' : isTablet ? '70vh' : '544px';
        const maxWidth = isMobile ? '95vw' : '95vw';
        const maxHeight = isMobile ? '90vh' : isTablet ? '85vh' : '85vh';

        // Верстка как в image-wrapper
        const dialog = document.createElement('div');
        dialog.className = 'image-wrapper';
        dialog.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            width: auto;
            height: 100%;
            max-width: 100%;
            max-height: 100%;
            box-sizing: border-box;
            position: relative;
            min-width: ${minWidth};
            min-height: ${minHeight};
            max-width: ${maxWidth};
            max-height: ${maxHeight};
            background: url('media/book/quest2.jpg') center no-repeat;
            background-size: contain;
            padding: ${padding};
            box-shadow: 0 4px 32px rgba(0,0,0,0.2);
            text-align: center;
            overflow: hidden;
        `;

        // Кнопка закрытия
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '✕';
        closeBtn.title = this._t('account.actions.close', 'Закрыть');
        closeBtn.style.cssText = `
            position: absolute;
            top: 12px;
            right: 12px;
            width: 36px;
            height: 36px;
            border-radius: 18px;
            border: none;
            cursor: pointer;
            background: rgba(0,0,0,0.55);
            color: white;
            font-size: 18px;
            z-index: 1;
        `;
        closeBtn.onclick = () => overlay.remove();

        // Контейнер для формы (как в попапе гостя)
        const formContainer = document.createElement('div');
        formContainer.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            width: ${isMobile ? '70%' : '80%'};
            max-width: 400px;
            max-height: calc(100% - ${padding} * 2);
            overflow-y: auto;
        `;


        const emailInput = document.createElement('input');
        emailInput.type = 'email';
        emailInput.placeholder = 'Email';
        emailInput.style.cssText = `
            width: 100%;
            padding: 12px;
            margin-bottom: 15px;
            border: 2px solid #8B4513;
            border-radius: 5px;
            font-size: 16px;
            box-sizing: border-box;
        `;

        const passwordInput = document.createElement('input');
        passwordInput.type = 'password';
        passwordInput.placeholder = this._t('account.link_account.password_placeholder', 'Пароль (минимум 6 символов)');
        passwordInput.style.cssText = `
            width: 100%;
            padding: 12px;
            margin-bottom: 15px;
            border: 2px solid #8B4513;
            border-radius: 5px;
            font-size: 16px;
            box-sizing: border-box;
        `;

        const usernameInput = document.createElement('input');
        usernameInput.type = 'text';
        usernameInput.placeholder = this._t('account.link_account.username_placeholder', 'Имя пользователя');
        usernameInput.required = true;
        usernameInput.style.cssText = `
            width: 100%;
            padding: 12px;
            margin-bottom: 20px;
            border: 2px solid #8B4513;
            border-radius: 5px;
            font-size: 16px;
            box-sizing: border-box;
        `;

        const errorMsg = document.createElement('div');
        errorMsg.style.cssText = `
            color: #5c3b1e;
            margin-bottom: 15px;
            font-size: 14px;
            min-height: 20px;
        `;

        const buttonsContainer = document.createElement('div');
        buttonsContainer.style.cssText = 'display: flex; flex-direction: column; gap: 10px; width: 100%;';

        const linkBtn = document.createElement('button');
        linkBtn.textContent = this._t('account.link_account.link_button', 'Привязать аккаунт');
        linkBtn.style.cssText = `
            padding: 12px 24px;
            background: #A0826D;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            width: 100%;
        `;
        linkBtn.onclick = async () => {
            const email = emailInput.value.trim();
            const password = passwordInput.value;
            const username = usernameInput.value.trim();

            if (!email || !password || !username) {
                errorMsg.textContent = this._t('account.link_account.all_fields_required', 'Заполните все поля');
                return;
            }

            if (password.length < 6) {
                errorMsg.textContent = 'Пароль должен содержать минимум 6 символов';
                return;
            }

            linkBtn.disabled = true;
            linkBtn.textContent = 'Обработка...';
            errorMsg.textContent = '';

            try {
                await window.userDatabase.linkAccountWithEmail(email, password);
                
                // Обновляем username (обязательное поле)
                    await window.userDatabase.updateUserMetadata({ username });

                alert('✅ Email успешно привязан! Ваш прогресс сохранен.');
                overlay.remove();
                await this.updateAccountButton();
            } catch (error) {
                console.error('Ошибка привязки email:', error);
                const code = error?.code || '';
                if (code === 'auth/email-already-in-use') {
                    errorMsg.textContent = this._t('account.link_account.email_already_registered', 'Этот email уже зарегистрирован. Нажмите «У меня уже есть аккаунт» или используйте другой email.');
                    linkBtn.disabled = false;
                    linkBtn.textContent = this._t('account.link_account.link_button', 'Привязать аккаунт');
                    return;
                }

                errorMsg.textContent = error.message || 'Ошибка привязки email. Попробуйте еще раз.';
                linkBtn.disabled = false;
                linkBtn.textContent = this._t('account.link_account.link_button', 'Привязать аккаунт');
            }
        };

        const signInBtn = document.createElement('button');
        signInBtn.textContent = this._t('account.link_account.have_account_button', 'У меня уже есть аккаунт');
        signInBtn.style.cssText = `
            padding: 12px 24px;
            background: #5c3b1e;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            width: 100%;
        `;
        signInBtn.onclick = () => {
            const email = emailInput.value.trim();
            overlay.remove();
            this.showSignInDialog(email);
        };

        buttonsContainer.appendChild(linkBtn);
        buttonsContainer.appendChild(signInBtn);
        formContainer.appendChild(emailInput);
        formContainer.appendChild(passwordInput);
        formContainer.appendChild(usernameInput);
        formContainer.appendChild(errorMsg);
        formContainer.appendChild(buttonsContainer);

        dialog.appendChild(closeBtn);
        dialog.appendChild(formContainer);

        overlay.appendChild(dialog);
        document.body.appendChild(overlay);
    }

    // Показать информационное сообщение в стиле книги
    showInfoDialog(message) {
        const screenSize = this._getScreenSize();
        const isMobile = screenSize === 'mobile';
        const isTablet = screenSize === 'tablet';

        const overlay = document.createElement('div');
        overlay.className = 'info-dialog-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.85);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 20001;
            font-family: serif;
        `;

        // Адаптивные размеры
        const padding = isMobile ? '20px' : isTablet ? '28px' : '32px';
        const minWidth = isMobile ? '90vw' : isTablet ? '75vw' : '480px';
        const minHeight = isMobile ? '80vh' : isTablet ? '70vh' : '400px';
        const maxWidth = isMobile ? '95vw' : '95vw';
        const maxHeight = isMobile ? '90vh' : isTablet ? '85vh' : '85vh';

        // Верстка как в image-wrapper
        const dialog = document.createElement('div');
        dialog.className = 'image-wrapper';
        dialog.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            width: auto;
            height: 100%;
            max-width: 100%;
            max-height: 100%;
            box-sizing: border-box;
            position: relative;
            min-width: ${minWidth};
            min-height: ${minHeight};
            max-width: ${maxWidth};
            max-height: ${maxHeight};
            background: url('media/book/quest2.jpg') center no-repeat;
            background-size: contain;
            padding: ${padding};
            box-shadow: 0 4px 32px rgba(0,0,0,0.2);
            text-align: center;
            overflow: auto;
        `;

        // Кнопка закрытия
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '✕';
        closeBtn.title = this._t('account.actions.close', 'Закрыть');
        closeBtn.style.cssText = `
            position: absolute;
            top: 12px;
            right: 12px;
            width: 36px;
            height: 36px;
            border-radius: 18px;
            border: none;
            cursor: pointer;
            background: rgba(0,0,0,0.55);
            color: white;
            font-size: 18px;
            z-index: 1;
        `;
        closeBtn.onclick = () => overlay.remove();

        // Контейнер для содержимого
        const contentContainer = document.createElement('div');
        contentContainer.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 100%;
            max-width: 400px;
            margin: 0 auto;
        `;

        const messageDiv = document.createElement('div');
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            color: #654321;
            font-size: ${isMobile ? '14px' : '16px'};
            line-height: 1.6;
            text-align: center;
            padding: 20px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            margin-bottom: 20px;
        `;

        const okBtn = document.createElement('button');
        okBtn.textContent = 'OK';
        okBtn.style.cssText = `
            padding: 12px 24px;
            background: #8B4513;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            width: 100%;
            max-width: 200px;
        `;
        okBtn.onclick = () => overlay.remove();

        contentContainer.appendChild(messageDiv);
        contentContainer.appendChild(okBtn);

        dialog.appendChild(closeBtn);
        dialog.appendChild(contentContainer);

        overlay.appendChild(dialog);
        document.body.appendChild(overlay);
    }

    // Показать попап выбора прогресса при входе в существующий аккаунт
    async showProgressChoiceDialog(accountUser) {
        // ВРЕМЕННО ОТКЛЮЧЕНО: попап выбора прогресса
        // Просто выходим, дальнейший код не выполняется
        return;

        // Получаем прогресс гостя из localStorage через единую функцию
        const guestProgress = this._calculateProgressFromLocalStorage();
        const guestOpenedLocations = guestProgress.openedLocations;
        const guestOpenedBooks = guestProgress.openedBooks;
        const guestCompletedTasks = guestProgress.completedTasks;
        
        console.log('[progressChoice] Guest progress from localStorage:', {
            locations: guestOpenedLocations,
            books: guestOpenedBooks,
            tasks: guestCompletedTasks,
            visitedPages: Object.keys(this._getVisitedPages()).length,
            openedGeoMarkers: Object.keys(this._getOpenedGeoMarkers()).length,
            questState: this._safeJsonParse(sessionStorage.getItem('questState') || '{}', {})
        });
        
        // Получаем данные аккаунта ИЗ БАЗЫ (leaderboard/Firestore), а не из localStorage
        // Для гостя данные уже получены из localStorage выше
        const userId = accountUser?.id || accountUser?.uid;
        let accountOpenedLocations = 0;
        let accountOpenedBooks = 0;
        let accountCompletedTasks = 0;
        let gotDataFromDatabase = false;
        
        if (userId) {
            try {
                // Сначала пытаемся получить данные из leaderboard (публичная коллекция)
                if (window.userDatabase?.db) {
                    try {
                        const leaderboardDoc = await window.userDatabase.db.collection('leaderboard').doc(userId).get();
                        if (leaderboardDoc.exists) {
                            const data = leaderboardDoc.data();
                            accountOpenedLocations = data.openedLocations || 0;
                            accountOpenedBooks = data.openedBooks || 0;
                            const tasks = data.tasks || {};
                            accountCompletedTasks = Object.values(tasks).filter(Boolean).length;
                            gotDataFromDatabase = true;
                            console.log('[progressChoice] Got account data from leaderboard', { 
                                userId, 
                                locations: accountOpenedLocations, 
                                books: accountOpenedBooks, 
                                tasks: accountCompletedTasks 
                            });
                        }
                    } catch (leaderboardError) {
                        console.warn('[progressChoice] Cannot read from leaderboard:', leaderboardError?.message);
                    }
                }
                
                // Если не получили из leaderboard, пытаемся из Firestore users
                if (!gotDataFromDatabase) {
                    try {
                        const freshUser = await this.getCurrentUser();
                        if (freshUser) {
                            accountOpenedLocations = freshUser?.progress?.openedLocations || 0;
                            accountOpenedBooks = freshUser?.progress?.openedBooks || 0;
                            const tasks = freshUser?.questState?.tasks || {};
                            accountCompletedTasks = Object.values(tasks).filter(Boolean).length;
                            gotDataFromDatabase = true;
                            console.log('[progressChoice] Got account data from Firestore users', { 
                                userId, 
                                locations: accountOpenedLocations, 
                                books: accountOpenedBooks, 
                                tasks: accountCompletedTasks 
                            });
                        }
                    } catch (firestoreError) {
                        console.warn('[progressChoice] Cannot read from Firestore users:', firestoreError?.message);
                    }
                }
                
                // Если не получили данные из базы, используем accountUser как fallback
                if (!gotDataFromDatabase) {
                    accountOpenedLocations = accountUser?.progress?.openedLocations || 0;
                    accountOpenedBooks = accountUser?.progress?.openedBooks || 0;
                    const tasks = accountUser?.questState?.tasks || {};
                    accountCompletedTasks = Object.values(tasks).filter(Boolean).length;
                    console.log('[progressChoice] Using accountUser param as fallback', { 
                        userId, 
                        locations: accountOpenedLocations, 
                        books: accountOpenedBooks, 
                        tasks: accountCompletedTasks 
                    });
                }
            } catch (error) {
                console.error('[progressChoice] Ошибка получения прогресса аккаунта:', error);
                // Используем данные из accountUser как fallback только при ошибке
                accountOpenedLocations = accountUser?.progress?.openedLocations || 0;
                accountOpenedBooks = accountUser?.progress?.openedBooks || 0;
                accountCompletedTasks = Object.values(accountUser?.questState?.tasks || {}).filter(Boolean).length;
            }
        }
        
        // Проверяем, есть ли прогресс гостя
        const hasGuestProgress = guestOpenedLocations > 0 || guestOpenedBooks > 0 || guestCompletedTasks > 0;
        
        // Если нет прогресса гостя, не показываем попап
        if (!hasGuestProgress) {
            return;
        }
        
        const screenSize = this._getScreenSize();
        const isMobile = screenSize === 'mobile';
        const isTablet = screenSize === 'tablet';

        const overlay = document.createElement('div');
        overlay.className = 'progress-choice-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.85);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 20001;
            font-family: serif;
        `;

        const padding = isMobile ? '15px' : isTablet ? '20px' : '24px';
        const minWidth = isMobile ? '85vw' : isTablet ? '65vw' : '480px';
        const minHeight = isMobile ? '75vh' : isTablet ? '65vh' : '420px';
        const maxWidth = isMobile ? '90vw' : isTablet ? '75vw' : '520px';
        const maxHeight = isMobile ? '85vh' : isTablet ? '75vh' : '450px';

        const dialog = document.createElement('div');
        dialog.className = 'image-wrapper';
        dialog.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            width: auto;
            height: 100%;
            max-width: 100%;
            max-height: 100%;
            box-sizing: border-box;
            position: relative;
            min-width: ${minWidth};
            min-height: ${minHeight};
            max-width: ${maxWidth};
            max-height: ${maxHeight};
            background: url('media/watercolor/oldcard.jpg') center no-repeat;
            background-size: cover;
            padding: ${padding};
            box-shadow: 0 4px 32px rgba(0,0,0,0.2);
            text-align: center;
            overflow: hidden;
        `;

        const closeBtn = document.createElement('button');
        closeBtn.textContent = '✕';
        closeBtn.title = this._t('account.actions.close', 'Закрыть');
        closeBtn.style.cssText = `
            position: absolute;
            top: 12px;
            right: 12px;
            width: 36px;
            height: 36px;
            border-radius: 18px;
            border: none;
            cursor: pointer;
            background: rgba(0,0,0,0.55);
            color: white;
            font-size: 18px;
            z-index: 1;
        `;
        closeBtn.onclick = () => overlay.remove();

        const contentContainer = document.createElement('div');
        contentContainer.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            width: ${isMobile ? '70%' : '80%'};
            max-width: 350px;
            max-height: calc(100% - ${padding} * 2);
            overflow-y: auto;
        `;

        const title = document.createElement('h2');
        title.textContent = this._t('account.progress_choice.title', 'Какой прогресс сохранить?');
        title.style.cssText = `
            color: #8B4513;
            margin-bottom: 20px;
            font-size: ${isMobile ? '20px' : isTablet ? '22px' : '26px'};
            font-weight: bold;
        `;

        // Блок прогресса гостя
        const guestBlock = document.createElement('div');
        guestBlock.style.cssText = `
            width: 100%;
            margin-bottom: 10px;
            padding: 10px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 6px;
            border: 2px solid rgba(139, 69, 19, 0.3);
        `;

        const guestTitle = document.createElement('div');
        guestTitle.textContent = this._t('account.progress_choice.guest_title', 'Гость');
        guestTitle.style.cssText = `
            color: #654321;
            font-size: ${isMobile ? '15px' : '16px'};
            font-weight: bold;
            margin-bottom: 5px;
        `;

        const guestStats = document.createElement('div');
        guestStats.style.cssText = `
            color: #654321;
            font-size: ${isMobile ? '12px' : '13px'};
            margin-bottom: 8px;
            text-align: left;
            line-height: 1.3;
        `;
        guestStats.innerHTML = `
            ${this._t('account.progress_choice.guest_locations', 'Открыто локаций:')} ${guestOpenedLocations}<br>
            ${this._t('account.progress_choice.guest_quests', 'Пройдено квестов:')} ${guestCompletedTasks}<br>
            ${this._t('account.progress_choice.guest_books', 'Прочитано книг:')} ${guestOpenedBooks}
        `;

        const saveGuestBtn = document.createElement('button');
        saveGuestBtn.textContent = this._t('account.progress_choice.save_guest', 'Сохранить прогресс Гостя');
        saveGuestBtn.style.cssText = `
            padding: 8px 16px;
            background: #A0826D;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 13px;
            width: 100%;
        `;
        saveGuestBtn.onclick = async () => {
            try {
                // Сохраняем прогресс гостя в аккаунт
                const userId = accountUser?.id || accountUser?.uid;
                if (userId && window.userDatabase?._syncToLeaderboard) {
                    await window.userDatabase._syncToLeaderboard(userId, {
                        username: accountUser?.username || null,
                        email: accountUser?.email || null,
                        createdAt: accountUser?.createdAt || null,
                        progress: {
                            openedLocations: guestOpenedLocations,
                            openedBooks: guestOpenedBooks
                        },
                        questState: guestQuestState || {}
                    });
                }
                
                // Обновляем метаданные
                await window.userDatabase.updateUserMetadata({
                    progress: {
                        openedLocations: guestOpenedLocations,
                        openedBooks: guestOpenedBooks
                    },
                    questState: guestQuestState
                });
                
            overlay.remove();
                await this.updateAccountButton();
            } catch (error) {
                console.error('Ошибка сохранения прогресса гостя:', error);
                alert(this._t('account.progress_choice.save_error', 'Ошибка сохранения:') + ' ' + (error?.message || String(error)));
            }
        };

        guestBlock.appendChild(guestTitle);
        guestBlock.appendChild(guestStats);
        guestBlock.appendChild(saveGuestBtn);

        // Блок прогресса аккаунта
        const accountBlock = document.createElement('div');
        accountBlock.style.cssText = `
            width: 100%;
            margin-bottom: 10px;
            padding: 10px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 6px;
            border: 2px solid rgba(139, 69, 19, 0.3);
        `;

        const accountTitle = document.createElement('div');
        accountTitle.textContent = accountUser?.username || accountUser?.email || this._t('account.progress_choice.account_title', 'Аккаунт');
        accountTitle.style.cssText = `
            color: #654321;
            font-size: ${isMobile ? '15px' : '16px'};
            font-weight: bold;
            margin-bottom: 5px;
        `;

        const accountStats = document.createElement('div');
        accountStats.style.cssText = `
            color: #654321;
            font-size: ${isMobile ? '12px' : '13px'};
            margin-bottom: 8px;
            text-align: left;
            line-height: 1.3;
        `;
        
        // Логируем для отладки
        console.log('[progressChoice] Displaying account stats:', {
            userId,
            locations: accountOpenedLocations,
            books: accountOpenedBooks,
            tasks: accountCompletedTasks,
            gotDataFromDatabase,
            accountUserProgress: accountUser?.progress
        });
        
        accountStats.innerHTML = `
            ${this._t('account.progress_choice.account_locations', 'Открыто локаций:')} ${accountOpenedLocations}<br>
            ${this._t('account.progress_choice.account_quests', 'Пройдено квестов:')} ${accountCompletedTasks}<br>
            ${this._t('account.progress_choice.account_books', 'Прочитано книг:')} ${accountOpenedBooks}
        `;

        const saveAccountBtn = document.createElement('button');
        const accountProgressText = this._t('account.progress_choice.save_account', 'Сохранить прогресс аккаунта');
        saveAccountBtn.textContent = accountUser?.username ? accountProgressText.replace('аккаунта', accountUser.username) : accountProgressText;
        saveAccountBtn.style.cssText = `
            padding: 8px 16px;
            background: #5c3b1e;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 13px;
            width: 100%;
        `;
        saveAccountBtn.onclick = async () => {
            try {
                // Загружаем полные данные аккаунта из базы
                let accountQuestState = {};
                let accountUserData = null;
                
                // Получаем questState из leaderboard или Firestore
                if (window.userDatabase?.db && userId) {
                    try {
                        // Пытаемся из leaderboard
                        const leaderboardDoc = await window.userDatabase.db.collection('leaderboard').doc(userId).get();
                        if (leaderboardDoc.exists) {
                            const data = leaderboardDoc.data();
                            accountQuestState = { tasks: data.tasks || {} };
                        }
                    } catch (e) {
                        console.warn('[progressChoice] Cannot get questState from leaderboard:', e);
                    }
                    
                    // Если не получили, пытаемся из Firestore users
                    if (!accountQuestState.tasks || Object.keys(accountQuestState.tasks).length === 0) {
                        try {
                            accountUserData = await this.getCurrentUser();
                            if (accountUserData?.questState) {
                                accountQuestState = accountUserData.questState;
                            }
                        } catch (e) {
                            console.warn('[progressChoice] Cannot get questState from Firestore:', e);
                        }
                    }
                }
                
                // Очищаем данные гостя из localStorage, чтобы использовался прогресс аккаунта
                // visitedPages и openedGeoMarkers хранятся только в localStorage,
                // поэтому при выборе прогресса аккаунта нужно очистить данные гостя
                try {
                    // Очищаем visitedPages (локации гостя)
                    localStorage.removeItem('visitedPages');
                    console.log('[progressChoice] Cleared guest visitedPages');
                    
                    // Очищаем openedGeoMarkers (книги гостя)
                    localStorage.removeItem('openedGeoMarkers');
                    console.log('[progressChoice] Cleared guest openedGeoMarkers');

                    // Очищаем найденных гномов гостя
                    localStorage.removeItem('foundGnomes');
                    console.log('[progressChoice] Cleared guest foundGnomes');
                    
                    // Сохраняем questState аккаунта (или очищаем, если пустой)
                    if (accountQuestState && Object.keys(accountQuestState.tasks || {}).length > 0) {
                        sessionStorage.setItem('questState', JSON.stringify(accountQuestState));
                        console.log('[progressChoice] Saved account questState to sessionStorage', accountQuestState);
                    } else {
                        // Если у аккаунта нет прогресса, очищаем questState гостя
                        sessionStorage.removeItem('questState');
                        console.log('[progressChoice] Cleared guest questState (account has no progress)');
                    }
                    
                    // Синхронизируем прогресс аккаунта в leaderboard (обновим счетчики)
                    const currentUser = await this.getCurrentUser();
                    if (currentUser && window.userDatabase?._syncToLeaderboard) {
                        try {
                            await window.userDatabase._syncToLeaderboard(currentUser.id, currentUser);
                            console.log('[progressChoice] Synced account progress to leaderboard');
                        } catch (syncError) {
                            console.warn('[progressChoice] Cannot sync to leaderboard:', syncError);
                        }
                    }
                } catch (clearError) {
                    console.error('[progressChoice] Error saving account data:', clearError);
                }
                
                overlay.remove();
                await this.updateAccountButton();
                
                // Обновляем рейтинг, чтобы отобразились актуальные данные аккаунта
                try {
                    const currentUser = await this.getCurrentUser();
                    if (currentUser) {
                        await this.calculateUserRating(currentUser);
                    }
                } catch (ratingError) {
                    console.warn('[progressChoice] Cannot update rating:', ratingError);
                }
            } catch (error) {
                console.error('Ошибка сохранения прогресса аккаунта:', error);
                alert('Ошибка сохранения: ' + (error?.message || String(error)));
            }
        };

        accountBlock.appendChild(accountTitle);
        accountBlock.appendChild(accountStats);
        accountBlock.appendChild(saveAccountBtn);

        contentContainer.appendChild(title);
        contentContainer.appendChild(guestBlock);
        contentContainer.appendChild(accountBlock);

        dialog.appendChild(closeBtn);
        dialog.appendChild(contentContainer);

        overlay.appendChild(dialog);
        document.body.appendChild(overlay);
    }
}

// Создаем глобальный экземпляр
window.UserAccountManager = UserAccountManager;
try {
    if (!window.userAccountManager) {
        window.userAccountManager = new UserAccountManager();
    }
} catch (err) {
    console.error('Не удалось инициализировать userAccountManager', err);
    window.userAccountManager = null;
}

// Автоматическое сохранение состояния квеста каждые 30 секунд
if (!window.__questAutoSaveInterval) {
window.__questAutoSaveInterval = setInterval(async () => {
    if (window.userAccountManager) {
        try {
            const questStateJson = sessionStorage.getItem('questState');
            if (questStateJson) {
                const questState = JSON.parse(questStateJson);
                await window.userAccountManager.saveQuestState(questState);
            }
        } catch (error) {
            console.error('Ошибка автоматического сохранения:', error);
        }
    }
}, 30000);
}
