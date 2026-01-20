// Система управления аккаунтами пользователей через Firebase
// Использует Firebase Anonymous Auth для гостевых пользователей
// Поддерживает Link Account для превращения гостя в зарегистрированного

class UserAccountManager {
    constructor() {
        this.currentUser = null;
        this.firebaseReady = false;
        this._anonSignInRequested = false;
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
        "tumski24.html"
    ];
    // Геометки (книги) = .map-mark без data-quest-number. Посчитано по HTML в репозитории.
    static TOTAL_BOOKS = 114;

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
                const openedBooks = Object.keys(this._getOpenedGeoMarkers()).length;
                const openedLocations = Object.keys(this._getVisitedPages()).length;
                await window.userDatabase.updateUserMetadata({
                    progress: {
                        openedBooks,
                        openedLocations
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
                const authInfo = {
                    hasUser: !!firebaseUser,
                    uid: firebaseUser?.uid,
                    isAnonymous: firebaseUser?.isAnonymous,
                    email: firebaseUser?.email || null,
                    displayName: firebaseUser?.displayName || null,
                    providers: firebaseUser?.providerData ? (firebaseUser.providerData || []).map(p => p?.providerId).filter(Boolean) : []
                };
                this._alog('onAuthStateChanged', authInfo);
                console.log('[account] onAuthStateChanged', authInfo);
                if (firebaseUser) {
                    // Пользователь авторизован
                    console.log('[account] loading user from Firestore', { uid: firebaseUser.uid });
                    this.currentUser = await window.userDatabase.getUser(firebaseUser.uid);
                    console.log('[account] loaded user from Firestore', {
                        uid: firebaseUser.uid,
                        firestoreUser: this.currentUser ? {
                            id: this.currentUser.id,
                            isAnonymous: this.currentUser.isAnonymous,
                            email: this.currentUser.email || null,
                            username: this.currentUser.username
                        } : null
                    });
                    if (!this.currentUser) {
                        // Создаем запись пользователя в Firestore
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
                        this.currentUser = await window.userDatabase.getUser(firebaseUser.uid);
                    } else {
                        // КРИТИЧНО: Если Auth пользователь НЕ гость, но Firestore еще показывает гостя - принудительно обновляем
                        // Это важно для случая, когда пользователь входит через Google и аккаунт уже существует
                        if (!firebaseUser.isAnonymous && this.currentUser.isAnonymous) {
                            try {
                                const syncInfo = {
                                    auth: { isAnonymous: false, email: firebaseUser.email || null, displayName: firebaseUser.displayName || null },
                                    profile: { isAnonymous: true, email: this.currentUser.email || null, username: this.currentUser.username }
                                };
                                this._alog('force sync: auth non-anon but profile anon -> update', syncInfo);
                                console.log('[account] force sync: auth non-anon but profile anon -> update', syncInfo);
                                const updateData = {
                                    isAnonymous: false,
                                    email: firebaseUser.email || null
                                };
                                if (firebaseUser.displayName && (!this.currentUser.username || this.currentUser.username === 'Гость' || this.currentUser.username.toLowerCase() === 'гость')) {
                                    updateData.username = firebaseUser.displayName;
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
                                console.log('[account] force sync: profile updated', updatedInfo);
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
                                        prev: { isAnonymous: this.currentUser.isAnonymous, email: this.currentUser.email || null },
                                        next: { isAnonymous: firebaseUser.isAnonymous, email: firebaseUser.email || null }
                                    });
                                    // Обновляем метаданные, включая username если есть displayName
                                    const updateData = {
                                        isAnonymous: firebaseUser.isAnonymous,
                                        email: firebaseUser.email || null
                                    };
                                    // Если есть displayName и текущий username пустой или "Гость", обновляем username
                                    if (firebaseUser.displayName && (!this.currentUser.username || this.currentUser.username === 'Гость' || this.currentUser.username.toLowerCase() === 'гость')) {
                                        updateData.username = firebaseUser.displayName;
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
                    // Пользователь вышел - создаем анонимного
                    try {
                        if (this._isOauthRedirectInProgress()) {
                            this._alog('skip createAnonymousUser: oauth redirect in progress');
                            return;
                        }
                        if (this.firebaseReady && !this._anonSignInRequested) {
                            this._anonSignInRequested = true;
                            await window.userDatabase.createAnonymousUser();
                        }
                    } catch (error) {
                        console.error('Ошибка создания анонимного пользователя:', error);
                    }
                }
            });
        }

        // Стартуем анонимный вход только один раз: дальше это сделает onAuthStateChanged
        if (this.firebaseReady && window.userDatabase && window.userDatabase.auth) {
            const currentAuthUser = window.userDatabase.getCurrentAuthUser();
            if (!currentAuthUser && !this._anonSignInRequested) {
                if (this._isOauthRedirectInProgress()) {
                    this._alog('skip initial createAnonymousUser: oauth redirect in progress');
                    return;
                }
                this._anonSignInRequested = true;
                try {
                    await window.userDatabase.createAnonymousUser();
                } catch (error) {
                    console.error('Ошибка создания анонимного пользователя:', error);
                }
            }
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
    async showAccountMenu() {
        if (!document.body) {
            document.addEventListener('DOMContentLoaded', () => this.showAccountMenu());
            return;
        }

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

        const menuCard = document.createElement('div');
        menuCard.style.cssText = `
            position: relative;
            max-width: 520px;
            width: 90%;
            max-height: 80vh;
            background: url('media/watercolor/oldcard.jpg') center/cover no-repeat;
            background-size: cover;
            border-radius: 15px;
            padding: 40px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
            text-align: center;
            overflow-y: auto;
            border: 3px solid #8B4513;
        `;

        const body = document.createElement('div');

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

            const headerName = document.createElement('div');
            headerName.style.cssText = `
                font-size: 26px;
                font-weight: bold;
                color: #654321;
                margin-bottom: 18px;
            `;
            // Auth = source of truth: после OAuth (в т.ч. 2FA) Auth может стать non-anon раньше, чем обновится Firestore.
            const authUser = window.userDatabase?.getCurrentAuthUser?.() || null;
            const isGuest = authUser ? !!authUser.isAnonymous : !!currentUser.isAnonymous;
            this._alog('renderUser', {
                auth: authUser ? {
                    uid: authUser.uid,
                    isAnonymous: !!authUser.isAnonymous,
                    email: authUser.email || null,
                    displayName: authUser.displayName || null,
                    providers: (authUser.providerData || []).map(p => p?.providerId).filter(Boolean)
                } : null,
                profile: {
                    id: currentUser.id,
                    isAnonymous: !!currentUser.isAnonymous,
                    username: currentUser.username,
                    email: currentUser.email || null
                },
                chosenIsGuest: isGuest
            });
            const rawUsername = (currentUser.username != null ? String(currentUser.username) : '').trim();
            const email = (currentUser.email != null ? String(currentUser.email) : '').trim();
            const hasRealName = rawUsername && rawUsername.toLowerCase() !== 'гость';
            headerName.textContent = isGuest
                ? this._t('account.guest', 'Гость')
                : (hasRealName ? rawUsername : (email || this._t('account.user', 'Пользователь')));

            // Если Auth уже не гость, а Firestore ещё гость — догоняем метаданные (без падений)
            try {
                if (authUser && !authUser.isAnonymous && currentUser.isAnonymous) {
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
            const visitedPages = this._getVisitedPages();
            const visitedPageKeys = Object.keys(visitedPages);
            const totalLocations = UserAccountManager.LOCATION_PAGES.length;
            const openedLocations = visitedPageKeys.filter((p) => UserAccountManager.LOCATION_PAGES.includes(p)).length;

            const tasks = currentUser.questState?.tasks || {};
            const completedTasks = Object.values(tasks).filter(Boolean).length;
            const totalTasks = UserAccountManager.TOTAL_QUEST_TASKS;

            const openedBooks = Object.keys(this._getOpenedGeoMarkers()).length;
            const totalBooks = UserAccountManager.TOTAL_BOOKS;

            const statsBox = document.createElement('div');
            statsBox.style.cssText = `
                background: rgba(255, 255, 255, 0.72);
                border-radius: 10px;
                padding: 14px 14px;
                border: 2px solid #8B4513;
                text-align: left;
                color: #654321;
                margin-bottom: 18px;
                font-size: 16px;
                line-height: 1.45;
            `;

            const mkRow = (label, value) => {
                const row = document.createElement('div');
                row.style.cssText = 'display:flex; justify-content:space-between; gap:12px; padding:6px 0; border-bottom: 1px solid rgba(139,69,19,0.25);';
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
                this._t('account.stats.not_available', '—')
            ));
            // последняя строка без бордера
            const booksRow = mkRow(
                this._t('account.stats.books', 'Прочитано книг'),
                `${openedBooks} / ${totalBooks}`
            );
            booksRow.style.borderBottom = 'none';
            statsBox.appendChild(booksRow);

            const buttonsContainer = document.createElement('div');
            buttonsContainer.style.cssText = 'display: flex; flex-direction: column; gap: 12px;';

            if (isGuest) {
                const saveTitle = document.createElement('div');
                saveTitle.textContent = this._t('account.actions.save_title', 'Сохранить');
                saveTitle.style.cssText = 'margin-top: 6px; margin-bottom: 2px; font-weight: bold; color:#654321;';
                buttonsContainer.appendChild(saveTitle);

                const mkBtn = (text, bg) => {
                    const b = document.createElement('button');
                    b.textContent = text;
                    b.style.cssText = `
                        padding: 12px 16px;
                        background: ${bg};
                        color: white;
                        border: none;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 16px;
                    `;
                    return b;
                };

                const btnEmail = mkBtn(this._t('account.actions.save_email', 'Email'), '#2196F3');
                btnEmail.onclick = () => {
                    overlay.remove();
                    this.showLinkAccountDialog();
                };

                const btnGoogle = mkBtn(this._t('account.actions.save_google', 'Google'), '#8B4513');
                btnGoogle.onclick = async () => {
                    try {
                        if (window.userDatabase && typeof window.userDatabase.linkAccountWithGoogle === 'function') {
                            await window.userDatabase.linkAccountWithGoogle();
                            overlay.remove();
                            // Переоткрываем меню, чтобы подтянуть обновлённый профиль (isAnonymous=false)
                            this.showAccountMenu();
                        } else {
                            alert('Google auth не настроен');
                        }
                    } catch (e) {
                        alert(e?.message || String(e));
                    }
                };

                const btnFacebook = mkBtn(this._t('account.actions.save_facebook', 'Facebook'), '#3b5998');
                btnFacebook.onclick = async () => {
                    try {
                        if (window.userDatabase && typeof window.userDatabase.linkAccountWithFacebook === 'function') {
                            await window.userDatabase.linkAccountWithFacebook();
                            overlay.remove();
                            this.showAccountMenu();
                        } else {
                            alert('Facebook auth не настроен');
                        }
                    } catch (e) {
                        alert(e?.message || String(e));
                    }
                };

                buttonsContainer.appendChild(btnEmail);
                buttonsContainer.appendChild(btnGoogle);
                buttonsContainer.appendChild(btnFacebook);
            } else {
                const signOutBtn = document.createElement('button');
                signOutBtn.textContent = this._t('account.actions.logout', 'Выйти');
                signOutBtn.style.cssText = `
                    margin-top: 10px;
                    padding: 12px 16px;
                    background: #d32f2f;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 16px;
                `;
                signOutBtn.onclick = async () => {
                    try { await window.userDatabase?.signOut?.(); } catch (_) {}
                    overlay.remove();
                };
                buttonsContainer.appendChild(signOutBtn);
            }

            body.appendChild(headerName);
            body.appendChild(statsBox);
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

    // Диалог входа по email/password (для пользователей, которые заходят с другого устройства)
    async showSignInDialog(prefillEmail = '') {
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

        const dialog = document.createElement('div');
        dialog.style.cssText = `
            position: relative;
            max-width: 420px;
            width: 90%;
            background: url('media/watercolor/oldcard.jpg') center/cover no-repeat;
            background-size: cover;
            border-radius: 15px;
            padding: 40px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
            text-align: center;
            border: 3px solid #8B4513;
        `;

        const title = document.createElement('h2');
        title.textContent = 'Войти по email';
        title.style.cssText = `color: #8B4513; margin-bottom: 18px; font-size: 24px;`;

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
        errorMsg.style.cssText = `color: #d32f2f; margin-bottom: 12px; font-size: 14px; min-height: 20px;`;

        const row = document.createElement('div');
        row.style.cssText = 'display:flex; gap:10px; justify-content:center;';

        const signInBtn = document.createElement('button');
        signInBtn.textContent = 'Войти';
        signInBtn.style.cssText = `
            padding: 12px 16px;
            background: #2196F3;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 16px;
            flex: 1;
        `;
        signInBtn.onclick = async () => {
            const email = emailInput.value.trim();
            const password = passwordInput.value;
            if (!email || !password) {
                errorMsg.textContent = 'Введите email и пароль';
                return;
            }
            signInBtn.disabled = true;
            signInBtn.textContent = '...';
            errorMsg.textContent = '';
            try {
                await window.userDatabase.signInWithEmail(email, password);
                overlay.remove();
                alert('✅ Вход выполнен');
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
            padding: 12px 16px;
            background: #8B4513;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 16px;
            flex: 1;
        `;
        cancelBtn.onclick = () => overlay.remove();

        row.appendChild(signInBtn);
        row.appendChild(cancelBtn);

        dialog.appendChild(title);
        dialog.appendChild(emailInput);
        dialog.appendChild(passwordInput);
        dialog.appendChild(errorMsg);
        dialog.appendChild(row);

        overlay.appendChild(dialog);
        document.body.appendChild(overlay);
    }

    // Показать диалог привязки email
    async showLinkAccountDialog() {
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

        const dialog = document.createElement('div');
        dialog.style.cssText = `
            position: relative;
            max-width: 400px;
            width: 90%;
            background: url('media/watercolor/oldcard.jpg') center/cover no-repeat;
            background-size: cover;
            border-radius: 15px;
            padding: 40px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
            text-align: center;
            border: 3px solid #8B4513;
        `;

        const title = document.createElement('h2');
        title.textContent = 'Привязать email';
        title.style.cssText = `
            color: #8B4513;
            margin-bottom: 20px;
            font-size: 24px;
        `;

        const description = document.createElement('p');
        description.textContent = 'Введите email и пароль для сохранения прогресса навсегда';
        description.style.cssText = `
            color: #654321;
            margin-bottom: 20px;
            font-size: 14px;
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
        passwordInput.placeholder = 'Пароль (минимум 6 символов)';
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
        usernameInput.placeholder = 'Имя пользователя (опционально)';
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
            color: #d32f2f;
            margin-bottom: 15px;
            font-size: 14px;
            min-height: 20px;
        `;

        const buttonsContainer = document.createElement('div');
        buttonsContainer.style.cssText = 'display: flex; gap: 10px; justify-content: center;';

        const linkBtn = document.createElement('button');
        linkBtn.textContent = 'Привязать';
        linkBtn.style.cssText = `
            padding: 12px 24px;
            background: #2196F3;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            flex: 1;
        `;
        linkBtn.onclick = async () => {
            const email = emailInput.value.trim();
            const password = passwordInput.value;
            const username = usernameInput.value.trim();

            if (!email || !password) {
                errorMsg.textContent = 'Заполните email и пароль';
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
                
                // Обновляем username если указан
                if (username) {
                    await window.userDatabase.updateUserMetadata({ username });
                }

                alert('✅ Email успешно привязан! Ваш прогресс сохранен.');
                overlay.remove();
                await this.updateAccountButton();
            } catch (error) {
                console.error('Ошибка привязки email:', error);
                const code = error?.code || '';
                if (code === 'auth/email-already-in-use') {
                    errorMsg.textContent = 'Этот email уже зарегистрирован. Нажмите «Войти по email» или используйте другой email.';
                    linkBtn.disabled = false;
                    linkBtn.textContent = 'Привязать';
                    // Добавим быстрый переход во вход
                    const goSignIn = document.createElement('button');
                    goSignIn.textContent = 'Войти по этому email';
                    goSignIn.style.cssText = `
                        margin-top: 10px;
                        padding: 10px 14px;
                        background: #8B4513;
                        color: white;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                        font-size: 14px;
                        width: 100%;
                    `;
                    goSignIn.onclick = () => {
                        overlay.remove();
                        this.showSignInDialog(email);
                    };
                    // не дублируем кнопку, если уже добавлена
                    if (!dialog.querySelector('[data-go-signin]')) {
                        goSignIn.dataset.goSignin = '1';
                        dialog.appendChild(goSignIn);
                    }
                    return;
                }

                errorMsg.textContent = error.message || 'Ошибка привязки email. Попробуйте еще раз.';
                linkBtn.disabled = false;
                linkBtn.textContent = 'Привязать';
            }
        };

        const signInBtn = document.createElement('button');
        signInBtn.textContent = 'Войти';
        signInBtn.style.cssText = `
            padding: 12px 24px;
            background: #5c3b1e;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            flex: 1;
        `;
        signInBtn.onclick = () => {
            const email = emailInput.value.trim();
            overlay.remove();
            this.showSignInDialog(email);
        };

        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = 'Отмена';
        cancelBtn.style.cssText = `
            padding: 12px 24px;
            background: #8B4513;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            flex: 1;
        `;
        cancelBtn.onclick = () => {
            overlay.remove();
            this.showAccountMenu();
        };

        buttonsContainer.appendChild(linkBtn);
        buttonsContainer.appendChild(signInBtn);
        buttonsContainer.appendChild(cancelBtn);

        dialog.appendChild(title);
        dialog.appendChild(description);
        dialog.appendChild(emailInput);
        dialog.appendChild(passwordInput);
        dialog.appendChild(usernameInput);
        dialog.appendChild(errorMsg);
        dialog.appendChild(buttonsContainer);

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
