// База данных для хранения данных пользователей через Firebase Firestore
// Использует Firebase Anonymous Auth для гостевых пользователей
// Поддерживает Link Account для превращения гостя в зарегистрированного

class UserDatabase {
    constructor() {
        this.db = null;
        this.auth = null;
        this.firebase = null;
        this._firebaseRealm = null;
        this.initialized = false;
        this.initFailed = false;
        this._permissionDeniedLogged = false;
        this._initPromise = null;
        this._redirectHandled = false;
        this._leaderboardSyncTimeout = null; // Debounce для синхронизации leaderboard
        this._lastLeaderboardSync = {}; // Кэш последней синхронизации для каждого userId
    }

    _isAccountDebug() {
        try {
            const globalFlag = window.DEBUG_ACCOUNT;
            if (globalFlag === true || globalFlag === '1' || globalFlag === 'true') {
                return true;
            }
        } catch (_) {}

        try {
            return ['DEBUG_ACCOUNT', '__account_debug'].some((key) => {
                const value = localStorage.getItem(key);
                return value === '1' || value === 'true';
            });
        } catch (_) {
            return false;
        }
    }

    _dlog(...args) {
        if (!this._isAccountDebug()) return;
        try { console.log('[userDatabase]', ...args); } catch (_) {}
    }

    _getFirebaseGlobals() {
        const candidates = [window];
        try {
            if (window.parent && window.parent !== window) candidates.push(window.parent);
        } catch (_) {}
        try {
            if (window.top && window.top !== window && window.top !== window.parent) candidates.push(window.top);
        } catch (_) {}

        for (const w of candidates) {
            try {
                if (w && w.firebaseFirestore && w.firebaseAuth) {
                    return {
                        firestore: w.firebaseFirestore,
                        auth: w.firebaseAuth,
                        firebase: w.firebase || null,
                        realm: w,
                        initError: w.firebaseInitError || null
                    };
                }
                if (w && w.firebaseInitError) {
                    // конфиг/инициализация Firebase сломаны
                    return { firestore: null, auth: null, firebase: w.firebase || null, realm: w, initError: w.firebaseInitError };
                }
            } catch (_) {}
        }
        return { firestore: null, auth: null, firebase: null, realm: null, initError: null };
    }

    _logPermissionDeniedOnce(action) {
        if (this._permissionDeniedLogged) return;
        this._permissionDeniedLogged = true;
        console.error(
            `❌ Firestore: Missing or insufficient permissions (${action}).\n` +
            'Откройте Firebase Console → Firestore Database → Rules и разрешите пользователю читать/писать свой документ:\n' +
            'match /users/{userId} { allow read, write: if request.auth != null && request.auth.uid == userId; }\n' +
            'Подробно: `FIREBASE_SETUP.md` (Шаг 4).'
        );
    }

    // Инициализация Firebase
    async init() {
        if (this.initialized && this.db && this.auth) return;
        if (this.initFailed) throw new Error('Firebase init previously failed');
        if (this._initPromise) return this._initPromise;

        this._initPromise = (async () => {
            // Быстрая проверка (в этом окне или в parent/top)
            let globals = this._getFirebaseGlobals();
            if (globals.initError) {
                throw new Error(globals.initError);
            }

            if (!globals.firestore || !globals.auth) {
                // Ждем загрузки Firebase (до 20 секунд) — важно для SPA/iframe, где порядок загрузки плавает
                await new Promise((resolve, reject) => {
                    let attempts = 0;
                    const checkFirebase = setInterval(() => {
                        attempts++;
                        globals = this._getFirebaseGlobals();

                        if (globals.initError) {
                            clearInterval(checkFirebase);
                            reject(new Error(globals.initError));
                            return;
                        }

                        if (globals.firestore && globals.auth) {
                            clearInterval(checkFirebase);
                            resolve();
                        } else if (attempts > 200) { // 20 секунд максимум
                            clearInterval(checkFirebase);
                            reject(new Error('Firebase не загружен'));
                        }
                    }, 100);
                });
            }

            globals = this._getFirebaseGlobals();
            if (!globals.firestore || !globals.auth) {
                throw new Error('Firebase не загружен');
            }

            this.db = globals.firestore;
            this.auth = globals.auth;
            this.firebase = globals.firebase;
            this._firebaseRealm = globals.realm || window;
            this.initialized = true;

            this._dlog('✅ Firebase Firestore инициализирован');

            // Если вернулись с OAuth redirect/linkWithRedirect — обработаем результат
            try {
                await this._handleRedirectResultOnce();
            } catch (_) {}
        })().finally(() => {
            // оставляем promise только на время инициализации
            this._initPromise = null;
        });

        return this._initPromise;
    }

    async _handleRedirectResultOnce() {
        // Обрабатываем redirect один раз за загрузку страницы
        const redirectHandledKey = '__oauth_redirect_handled';
        let handledInStorage = false;
        try {
            handledInStorage = sessionStorage.getItem(redirectHandledKey) === '1';
        } catch (_) {}

        // Если видим флаг in_progress, сбрасываем защитный флаг — мы вернулись из redirect и должны обработать результат
        try {
            const inProgress =
                sessionStorage.getItem('__oauth_in_progress') === '1' ||
                localStorage.getItem('__oauth_in_progress') === '1';
            if (inProgress && handledInStorage) {
                sessionStorage.removeItem(redirectHandledKey);
                handledInStorage = false;
            }
        } catch (_) {}

        if (this._redirectHandled || handledInStorage) {
            return;
        }
        this._redirectHandled = true;
        try { sessionStorage.setItem(redirectHandledKey, '1'); } catch (_) {}

        if (!this.auth || typeof this.auth.getRedirectResult !== 'function') return;

        const finalizeOAuthUser = async (u) => {
            if (!u) return;
            try { sessionStorage.removeItem('__oauth_in_progress'); } catch (_) {}
            try { localStorage.removeItem('__oauth_in_progress'); } catch (_) {}

            let guestUid = null;
            try { guestUid = sessionStorage.getItem('__oauth_guest_uid') || null; } catch (_) {}
            if (!guestUid) {
                try { guestUid = localStorage.getItem('__oauth_guest_uid') || null; } catch (_) {}
            }
            if (guestUid && guestUid !== u.uid) {
                this._dlog('finalizeOAuthUser: merge guest progress', { guestUid, to: u.uid });
                await this._maybeMergeGuestProgressToCurrentUser(guestUid);
            }
            try { sessionStorage.removeItem('__oauth_guest_uid'); } catch (_) {}
            try { localStorage.removeItem('__oauth_guest_uid'); } catch (_) {}

            if (!u.isAnonymous) {
                const email = u.email || null;
                try {
                    // Проверяем, есть ли уже username в Firestore
                    let existingUsername = null;
                    try {
                        const userDoc = await this.db.collection('users').doc(u.uid).get();
                        if (userDoc.exists) {
                            const userData = userDoc.data();
                            existingUsername = userData.username;
                        }
                    } catch (getError) {
                        // Игнорируем ошибки получения - возможно, документ еще не создан
                        this._dlog('finalize: cannot get existing user', { uid: u.uid, error: getError?.message });
                    }

                    // Определяем, нужно ли обновлять username
                    // НЕ перезаписываем, если уже есть валидный username (не пустой и не "Гость")
                    const hasValidUsername = existingUsername &&
                        existingUsername.trim() !== '' &&
                        existingUsername !== 'Гость' &&
                        existingUsername.toLowerCase() !== 'гость';

                    const updateData = {
                        email,
                        isAnonymous: false,
                        linkedAt: new Date().toISOString()
                    };

                    // Обновляем username только если его нет или он равен "Гость"
                    if (!hasValidUsername) {
                        const newUsername = (u.displayName || (email ? email.split('@')[0] : '') || 'Пользователь');
                        updateData.username = newUsername;
                        this._dlog('finalize: updating username', {
                            oldUsername: existingUsername,
                            newUsername: newUsername,
                            uid: u.uid
                        });
                    } else {
                        this._dlog('finalize: preserving existing username', {
                            username: existingUsername,
                            displayName: u.displayName,
                            uid: u.uid
                        });
                    }

                    await this.updateUserMetadata(updateData);
                    await this._wait(200);
                    this._dlog('finalize: metadata updated', {
                        email,
                        username: updateData.username || existingUsername,
                        isAnonymous: false,
                        uid: u.uid
                    });
                } catch (e) {
                    console.error('[oauth] finalize updateUserMetadata failed', e?.message || String(e));
                    this._dlog('finalize updateUserMetadata failed', e?.message || String(e));
                }
            }
        };

        try {
            const res = await this.auth.getRedirectResult();
            if (res && res.user) {
                const u = res.user;
                this._dlog('getRedirectResult user', {
                    uid: u.uid,
                    isAnonymous: !!u.isAnonymous,
                    email: u.email || null,
                    displayName: u.displayName || null,
                    providers: (u.providerData || []).map(p => p?.providerId).filter(Boolean)
                });
                await finalizeOAuthUser(u);
            } else {
                this._dlog('getRedirectResult: no result');
                const authUser = this.getCurrentAuthUser();
                try {
                    const hasAuthNonAnon = authUser && !authUser.isAnonymous;
                    const oauthInProgress =
                        (sessionStorage.getItem('__oauth_in_progress') === '1') ||
                        (localStorage.getItem('__oauth_in_progress') === '1');
                    if (hasAuthNonAnon && oauthInProgress) {
                        await finalizeOAuthUser(authUser);
                    } else if (oauthInProgress && authUser && authUser.isAnonymous) {
                        // OAuth в процессе, но пользователь еще гость - возможно redirect еще не обработан
                        // Даем время на обновление auth state после redirect
                        await this._wait(500);
                        const updatedAuthUser = this.getCurrentAuthUser();
                        if (updatedAuthUser && !updatedAuthUser.isAnonymous) {
                            await finalizeOAuthUser(updatedAuthUser);
                        } else {
                            // Очищаем флаги, чтобы не было бесконечного цикла
                            try { sessionStorage.removeItem('__oauth_in_progress'); } catch (_) {}
                            try { localStorage.removeItem('__oauth_in_progress'); } catch (_) {}
                            try { sessionStorage.removeItem('__oauth_guest_uid'); } catch (_) {}
                            try { localStorage.removeItem('__oauth_guest_uid'); } catch (_) {}
                        }
                    }
                } catch (_) {}
                // НЕ сбрасываем __oauth_in_progress здесь: при redirect логине результат может потеряться,
                // если параллельно создать анонимного пользователя. Дадим auth шанс "досинхронизироваться".
                // Флаг будет сброшен по таймауту ниже.
            }
        } catch (e) {
            this._dlog('getRedirectResult failed', e?.message || String(e));
            console.error('[oauth] getRedirectResult failed', e);
            try { sessionStorage.removeItem('__oauth_in_progress'); } catch (_) {}
            try { localStorage.removeItem('__oauth_in_progress'); } catch (_) {}
        }

        // Safety net: не держим флаг вечно
        try {
            if (sessionStorage.getItem('__oauth_in_progress') === '1' || localStorage.getItem('__oauth_in_progress') === '1') {
                setTimeout(() => {
                    try {
                        // если за 20с так и остались в госте — снимаем блокировку анонимного логина
                        sessionStorage.removeItem('__oauth_in_progress');
                        localStorage.removeItem('__oauth_in_progress');
                        this._dlog('[oauth] cleared __oauth_in_progress by timeout');
                    } catch (_) {}
                }, 20000);
            }
        } catch (_) {}
    }

    _wait(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    _mergeQuestState(baseState, incomingState) {
        const base = baseState && typeof baseState === 'object' ? baseState : { tasks: {}, completedQuests: [] };
        const inc = incomingState && typeof incomingState === 'object' ? incomingState : { tasks: {}, completedQuests: [] };
        const outTasks = { ...(base.tasks || {}) };
        const incTasks = inc.tasks || {};
        for (const [k, v] of Object.entries(incTasks)) {
            // если где-то true — считаем выполненным
            outTasks[k] = Boolean(outTasks[k]) || Boolean(v);
        }
        const outCompleted = new Set([...(base.completedQuests || []), ...(inc.completedQuests || [])]);
        return { tasks: outTasks, completedQuests: Array.from(outCompleted) };
    }

    async _maybeMergeGuestProgressToCurrentUser(guestUid) {
        try {
            if (!guestUid) return;
            const cur = this.getCurrentAuthUser();
            if (!cur) return;
            if (cur.uid === guestUid) return;

            const guest = await this.getUser(guestUid).catch(() => null);
            if (!guest) return;

            const current = await this.getUser(cur.uid).catch(() => null);
            const mergedQuestState = this._mergeQuestState(current?.questState, guest?.questState);

            await this.db.collection('users').doc(cur.uid).set(
                this._toFirestoreData({
                    questState: mergedQuestState,
                    // если у текущего профиля нет username — возьмём из гостя (но не "Гость")
                    username: (current?.username && String(current.username).trim() && String(current.username).trim().toLowerCase() !== 'гость')
                        ? current.username
                        : ((guest?.username && String(guest.username).trim() && String(guest.username).trim().toLowerCase() !== 'гость') ? guest.username : undefined),
                    updatedAt: new Date().toISOString()
                }) || {
                    questState: mergedQuestState,
                    updatedAt: new Date().toISOString()
                },
                { merge: true }
            );

            this._dlog('merged guest progress', { from: guestUid, to: cur.uid });
        } catch (e) {
            this._dlog('merge guest progress failed', e?.message || String(e));
        }
    }

    async _signInWithProviderWithFallback(provider) {
        await this.init();
        try {
            const res = await this.auth.signInWithPopup(provider);
            return res?.user || this.getCurrentAuthUser();
        } catch (e) {
            const code = e?.code || '';
            // Для 2FA/COOP popup может не завершиться корректно в некоторых окружениях → fallback на redirect только по явным ошибкам popup
            const shouldRedirect =
                code === 'auth/popup-blocked' ||
                code === 'auth/popup-closed-by-user' ||
                code === 'auth/operation-not-supported-in-this-environment';
            if (shouldRedirect && typeof this.auth.signInWithRedirect === 'function') {
                this._dlog('signInWithPopup failed -> signInWithRedirect', { code });
                await this.auth.signInWithRedirect(provider);
                return null; // будет redirect
            }
            throw e;
        }
    }

    _requireFirebaseCompat() {
        if (this.firebase && this.firebase.auth && this.firebase.firestore) return this.firebase;
        // fallback: иногда firebase есть только в текущем окне
        if (typeof window !== 'undefined' && window.firebase && window.firebase.auth && window.firebase.firestore) {
            this.firebase = window.firebase;
            return this.firebase;
        }
        throw new Error('Firebase compat SDK (window.firebase) недоступен в текущем контексте');
    }

    _toPlainJson(value) {
        // Гарантируем, что в Firestore уйдут только plain JSON типы
        if (value === null) return null;
        const t = typeof value;
        if (t === 'string' || t === 'number' || t === 'boolean') return value;
        if (t === 'undefined' || t === 'function' || t === 'symbol') return undefined;

        // Date
        if (value instanceof Date) return value.toISOString();

        // Firestore Timestamp-like
        if (value && typeof value === 'object' && typeof value.toDate === 'function') {
            try {
                const d = value.toDate();
                return d instanceof Date ? d.toISOString() : String(d);
            } catch (_) {
                return undefined;
            }
        }

        if (Array.isArray(value)) {
            const arr = value
                .map((v) => this._toPlainJson(v))
                .filter((v) => v !== undefined);
            return arr;
        }

        // plain object
        if (value && typeof value === 'object') {
            const out = {};
            for (const [k, v] of Object.entries(value)) {
                const pv = this._toPlainJson(v);
                if (pv !== undefined) out[k] = pv;
            }
            return out;
        }

        return undefined;
    }

    _toFirestoreData(value) {
        // Firestore compat SDK проверяет "plain object" через прототип в СВОЁМ realm.
        // В SPA/iframe это ломается, если объект создан в другом окне.
        // Поэтому: sanitize -> JSON stringify -> JSON.parse в realm, где находится Firestore.
        const safe = this._toPlainJson(value);
        if (safe === undefined) return undefined;

        const realm = this._firebaseRealm || window;
        try {
            return realm.JSON.parse(JSON.stringify(safe));
        } catch (_) {
            // как fallback — хотя бы вернём безопасный объект текущего realm
            return safe;
        }
    }

    // Валидация данных пользователя
    validateUserData(userData) {
        if (!userData || typeof userData !== 'object') {
            throw new Error('Неверные данные пользователя');
        }

        // Валидация username
        if (userData.username) {
            userData.username = String(userData.username).trim();
            if (userData.username.length === 0) {
                throw new Error('Имя пользователя не может быть пустым');
            }
            if (userData.username.length > 50) {
                userData.username = userData.username.substring(0, 50);
            }
        }

        // Валидация questState
        if (!userData.questState || typeof userData.questState !== 'object') {
            userData.questState = {
                tasks: {},
                completedQuests: []
            };
        }

        if (!userData.questState.tasks || typeof userData.questState.tasks !== 'object') {
            userData.questState.tasks = {};
        }

        if (!Array.isArray(userData.questState.completedQuests)) {
            userData.questState.completedQuests = [];
        }

        return userData;
    }

    // Получение текущего пользователя Firebase Auth
    getCurrentAuthUser() {
        return this.auth?.currentUser || null;
    }

    // Создание анонимного пользователя (гостевой вход)
    async createAnonymousUser() {
        try {
            await this.init();
        } catch (e) {
            this.initFailed = true;
            console.error('❌ Firebase не готов (проверьте `firebase_config.js`):', e);
            return null;
        }

        try {
            const userCredential = await this.auth.signInAnonymously();
            this._dlog('✅ Анонимный пользователь создан:', userCredential.user.uid);
            return userCredential.user;
        } catch (error) {
            console.error('❌ Ошибка создания анонимного пользователя:', error);
            throw error;
        }
    }

    // Привязка email к анонимному аккаунту (Link Account)
    async linkAccountWithEmail(email, password) {
        await this.init();

        const currentUser = this.auth.currentUser;
        if (!currentUser || !currentUser.isAnonymous) {
            throw new Error('Текущий пользователь не является анонимным');
        }

        try {
            const fb = this._requireFirebaseCompat();
            // Создаем credential для email/password
            const emailCredential = fb.auth.EmailAuthProvider.credential(email, password);

            // Привязываем email к анонимному аккаунту
            await currentUser.linkWithCredential(emailCredential);

            // Обновляем данные пользователя в Firestore
            await this.updateUserMetadata({
                email: email,
                isAnonymous: false,
                // Не используем FieldValue.serverTimestamp(), чтобы избежать несовместимости sentinel-объектов
                // между контекстами (SPA/iframe) — храним ISO строку.
                linkedAt: new Date().toISOString()
            });

            this._dlog('✅ Email успешно привязан к аккаунту');
            return this.auth.currentUser;
        } catch (error) {
            console.error('❌ Ошибка привязки email:', error);
            throw error;
        }
    }

    // Регистрация нового пользователя с email/password
    async registerWithEmail(email, password, username) {
        await this.init();

        try {
            const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);

            // Сохраняем username в Firestore
            await this.saveUser({
                id: userCredential.user.uid,
                username: username || email.split('@')[0],
                email: email,
                isAnonymous: false,
                createdAt: new Date().toISOString(),
                questState: {
                    tasks: {},
                    completedQuests: []
                }
            });

            this._dlog('✅ Пользователь зарегистрирован:', userCredential.user.uid);
            return userCredential.user;
        } catch (error) {
            console.error('❌ Ошибка регистрации:', error);
            throw error;
        }
    }

    // Вход с email/password
    async signInWithEmail(email, password) {
        await this.init();

        try {
            const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
            this._dlog('✅ Пользователь вошел:', userCredential.user.uid);
            return userCredential.user;
        } catch (error) {
            console.error('❌ Ошибка входа:', error);
            throw error;
        }
    }

    // Выход
    async signOut() {
        await this.init();

        try {
            await this.auth.signOut();
            this._dlog('✅ Пользователь вышел');
        } catch (error) {
            console.error('❌ Ошибка выхода:', error);
            throw error;
        }
    }

    // --- OAuth link для гостя (анонимного пользователя) ---
    async linkAccountWithGoogle() {
        await this.init();
        const fb = this._requireFirebaseCompat();

        const user = this.auth?.currentUser;
        if (!user) throw new Error('Пользователь не авторизован');

        const provider = new fb.auth.GoogleAuthProvider();

        // Проверяем, мобильное ли устройство
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                         (window.innerWidth <= 768);

        // На мобильных сразу используем redirect, popup часто не работает
        if (isMobile) {
            this._dlog('[oauth] google: mobile detected, using redirect flow');
            try { sessionStorage.removeItem('__oauth_redirect_handled'); } catch (_) {}
            if (user.isAnonymous) {
                try { sessionStorage.setItem('__oauth_guest_uid', user.uid); } catch (_) {}
                try { localStorage.setItem('__oauth_guest_uid', user.uid); } catch (_) {}
            }
            try { sessionStorage.setItem('__oauth_in_progress', '1'); } catch (_) {}
            try { localStorage.setItem('__oauth_in_progress', '1'); } catch (_) {}
            this._dlog('google auth: signInWithRedirect (mobile)', { guestUid: user.isAnonymous ? user.uid : null });
            await this.auth.signInWithRedirect(provider);
            return null; // redirect
        }

        // На desktop сначала пробуем popup (стабильнее). При явных проблемах popup — fallback на redirect.
        try {
            this._dlog('[oauth] google: try popup flow');
            const res = await this.auth.signInWithPopup(provider);
            const u = res?.user || this.getCurrentAuthUser();
            if (u) {
                // Если был гость — сохраним его uid для мержа прогресса
                if (user.isAnonymous && user.uid !== u.uid) {
                    await this._maybeMergeGuestProgressToCurrentUser(user.uid);
                }

                // Обновляем метаданные, чтобы снять гостевой режим
                if (!u.isAnonymous) {
                    const email = u.email || null;

                    // Проверяем существующий username в Firestore перед перезаписью
                    let existingUsername = null;
                    try {
                        const userDoc = await this.db.collection('users').doc(u.uid).get();
                        if (userDoc.exists) {
                            const userData = userDoc.data();
                            existingUsername = userData.username;
                        }
                    } catch (getError) {
                        this._dlog('popup: cannot get existing user', { uid: u.uid, error: getError?.message });
                    }

                    // НЕ перезаписываем, если уже есть валидный username
                    const hasValidUsername = existingUsername &&
                        existingUsername.trim() !== '' &&
                        existingUsername !== 'Гость' &&
                        existingUsername.toLowerCase() !== 'гость';

                    const updateData = {
                        email,
                        isAnonymous: false,
                        linkedAt: new Date().toISOString()
                    };

                    // Обновляем username только если его нет или он равен "Гость"
                    if (!hasValidUsername) {
                        const newUsername = u.displayName || (email ? email.split('@')[0] : '') || 'Пользователь';
                        updateData.username = newUsername;
                        this._dlog('popup: updating username', {
                            oldUsername: existingUsername,
                            newUsername: newUsername
                        });
                    } else {
                        this._dlog('popup: preserving existing username', {
                            username: existingUsername,
                            displayName: u.displayName
                        });
                    }

                    await this.updateUserMetadata(updateData);
                    await this._wait(150);
                }
            }
            return u;
        } catch (e) {
            const code = e?.code || '';
            const shouldRedirect =
                code === 'auth/popup-blocked' ||
                code === 'auth/popup-closed-by-user' ||
                code === 'auth/operation-not-supported-in-this-environment';

            if (!shouldRedirect) {
                throw e;
            }

            // Redirect fallback
            try { sessionStorage.removeItem('__oauth_redirect_handled'); } catch (_) {}
            if (user.isAnonymous) {
                try { sessionStorage.setItem('__oauth_guest_uid', user.uid); } catch (_) {}
                try { localStorage.setItem('__oauth_guest_uid', user.uid); } catch (_) {}
            }
            try { sessionStorage.setItem('__oauth_in_progress', '1'); } catch (_) {}
            try { localStorage.setItem('__oauth_in_progress', '1'); } catch (_) {}
            this._dlog('google auth: signInWithRedirect', { guestUid: user.isAnonymous ? user.uid : null, code });
            await this.auth.signInWithRedirect(provider);
            return null; // redirect
        }
    }

    async linkAccountWithFacebook() {
        await this.init();
        const fb = this._requireFirebaseCompat();

        const user = this.auth?.currentUser;
        if (!user) throw new Error('Пользователь не авторизован');

        const provider = new fb.auth.FacebookAuthProvider();

        // Проверяем, мобильное ли устройство
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                         (window.innerWidth <= 768);

        // На мобильных сразу используем redirect, popup часто не работает
        if (isMobile) {
            this._dlog('[oauth] facebook: mobile detected, using redirect flow');
            try { sessionStorage.removeItem('__oauth_redirect_handled'); } catch (_) {}
            if (user.isAnonymous) {
                try { sessionStorage.setItem('__oauth_guest_uid', user.uid); } catch (_) {}
                try { localStorage.setItem('__oauth_guest_uid', user.uid); } catch (_) {}
            }
            try { sessionStorage.setItem('__oauth_in_progress', '1'); } catch (_) {}
            try { localStorage.setItem('__oauth_in_progress', '1'); } catch (_) {}
            this._dlog('facebook auth: signInWithRedirect (mobile)', { guestUid: user.isAnonymous ? user.uid : null });
            await this.auth.signInWithRedirect(provider);
            return null; // redirect
        }

        // На desktop сначала пробуем popup (стабильнее). При явных проблемах popup — fallback на redirect.
        try {
            this._dlog('[oauth] facebook: try popup flow');
            const res = await this.auth.signInWithPopup(provider);
            const u = res?.user || this.getCurrentAuthUser();
            if (u) {
                // Если был гость — сохраним его uid для мержа прогресса
                if (user.isAnonymous && user.uid !== u.uid) {
                    await this._maybeMergeGuestProgressToCurrentUser(user.uid);
                }

                // Обновляем метаданные, чтобы снять гостевой режим
                if (!u.isAnonymous) {
                    const email = u.email || null;

                    // Проверяем существующий username в Firestore перед перезаписью
                    let existingUsername = null;
                    try {
                        const userDoc = await this.db.collection('users').doc(u.uid).get();
                        if (userDoc.exists) {
                            const userData = userDoc.data();
                            existingUsername = userData.username;
                        }
                    } catch (getError) {
                        this._dlog('popup: cannot get existing user', { uid: u.uid, error: getError?.message });
                    }

                    // НЕ перезаписываем, если уже есть валидный username
                    const hasValidUsername = existingUsername &&
                        existingUsername.trim() !== '' &&
                        existingUsername !== 'Гость' &&
                        existingUsername.toLowerCase() !== 'гость';

                    const updateData = {
                        email,
                        isAnonymous: false,
                        linkedAt: new Date().toISOString()
                    };

                    // Обновляем username только если его нет или он равен "Гость"
                    if (!hasValidUsername) {
                        const newUsername = u.displayName || (email ? email.split('@')[0] : '') || 'Пользователь';
                        updateData.username = newUsername;
                        this._dlog('popup: updating username', {
                            oldUsername: existingUsername,
                            newUsername: newUsername
                        });
                    } else {
                        this._dlog('popup: preserving existing username', {
                            username: existingUsername,
                            displayName: u.displayName
                        });
                    }

                    await this.updateUserMetadata(updateData);
                    await this._wait(150);
                }
            }
            return u;
        } catch (e) {
            const code = e?.code || '';
            const shouldRedirect =
                code === 'auth/popup-blocked' ||
                code === 'auth/popup-closed-by-user' ||
                code === 'auth/operation-not-supported-in-this-environment';

            if (!shouldRedirect) {
                throw e;
            }

            // Redirect fallback
            try { sessionStorage.removeItem('__oauth_redirect_handled'); } catch (_) {}
            if (user.isAnonymous) {
                try { sessionStorage.setItem('__oauth_guest_uid', user.uid); } catch (_) {}
                try { localStorage.setItem('__oauth_guest_uid', user.uid); } catch (_) {}
            }
            try { sessionStorage.setItem('__oauth_in_progress', '1'); } catch (_) {}
            try { localStorage.setItem('__oauth_in_progress', '1'); } catch (_) {}
            this._dlog('facebook auth: signInWithRedirect', { guestUid: user.isAnonymous ? user.uid : null, code });
            await this.auth.signInWithRedirect(provider);
            return null; // redirect
        }
    }

    // Получение IP-адреса пользователя
    async _getUserIP() {
        try {
            // Используем внешний сервис для получения IP
            const response = await fetch('https://api.ipify.org?format=json');
            if (response.ok) {
                const data = await response.json();
                return data.ip || null;
            }
        } catch (error) {
            this._dlog('getUserIP failed', { error: error?.message });
        }
        return null;
    }

    // Сохранение пользователя в Firestore
    async saveUser(userData) {
        await this.init();

        // Валидация данных
        const validatedData = this.validateUserData({ ...userData });

        // Если нет ID, используем текущего пользователя Firebase Auth
        if (!validatedData.id) {
            const currentUser = this.getCurrentAuthUser();
            if (!currentUser) {
                throw new Error('Пользователь не авторизован');
            }
            validatedData.id = currentUser.uid;
        }

        // Получаем IP-адрес (только при первом создании или если не указан)
        let userIP = validatedData.ipAddress || null;
        if (!userIP) {
            try {
                userIP = await this._getUserIP();
            } catch (ipError) {
                this._dlog('Failed to get IP', { error: ipError?.message });
            }
        }

        const authUser = this.getCurrentAuthUser();
        const userDoc = {
            username: validatedData.username || 'Гость',
            email: validatedData.email || null,
            // ISO строки надёжнее для статического сайта + SPA/iframe
            createdAt: validatedData.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            questState: this._toPlainJson(validatedData.questState) || { tasks: {}, completedQuests: [] },
            // Если isAnonymous не задан — берём из текущего authUser (если есть)
            isAnonymous: validatedData.isAnonymous !== undefined
                ? validatedData.isAnonymous
                : (authUser ? !!authUser.isAnonymous : true),
            // IP-адрес (сохраняем только если получили)
            ...(userIP ? { ipAddress: userIP } : {})
        };
        const firestoreDoc = this._toFirestoreData(userDoc) || userDoc;

        try {
            await this.db.collection('users').doc(validatedData.id).set(firestoreDoc, { merge: true });
            this._dlog('✅ Пользователь сохранен в Firestore:', validatedData.id);
            return validatedData.id;
        } catch (error) {
            if (String(error?.message || '').toLowerCase().includes('insufficient permissions')) {
                this._logPermissionDeniedOnce('saveUser');
            }
            console.error('❌ Ошибка сохранения пользователя:', error);
            throw error;
        }
    }

    // Обновление метаданных пользователя
    async updateUserMetadata(metadata) {
        await this.init();
        const safeMeta = (metadata && typeof metadata === 'object') ? (this._toPlainJson(metadata) || {}) : {};
        // Удаляем undefined поля (Firestore не принимает)
        const cleanedMeta = {};
        for (const [k, v] of Object.entries(safeMeta)) {
            if (v !== undefined) cleanedMeta[k] = v;
        }
        const firestoreMeta = this._toFirestoreData(cleanedMeta) || cleanedMeta;
        // Дополнительная защита: убираем undefined после сериализации
        const safeFirestoreMeta = {};
        for (const [k, v] of Object.entries(firestoreMeta)) {
            if (v !== undefined) safeFirestoreMeta[k] = v;
        }

        const currentUser = this.getCurrentAuthUser();
        if (!currentUser) {
            throw new Error('Пользователь не авторизован');
        }

        try {
            // update() падает, если документа ещё нет. set+merge безопаснее и для "гостя -> OAuth" (2FA тоже).
            let updatePayload = {
                ...safeFirestoreMeta,
                updatedAt: new Date().toISOString()
            };
            // Принудительно делаем plain-object в realm Firestore через JSON roundtrip,
            // чтобы убрать "custom Object" из другого окна/iframe.
            try {
                const realm = this._firebaseRealm || window;
                updatePayload = realm.JSON.parse(JSON.stringify(updatePayload));
            } catch (_) {
                try {
                    updatePayload = JSON.parse(JSON.stringify(updatePayload));
                } catch (_) {}
            }
            this._dlog('[userDatabase] updateUserMetadata: writing to Firestore', {
                uid: currentUser.uid,
                payload: updatePayload
            });
            await this.db.collection('users').doc(currentUser.uid).set(updatePayload, { merge: true });

            // Синхронизируем в leaderboard для публичного доступа
            // Пытаемся получить данные пользователя для синхронизации
            try {
                // Если username передан явно в metadata, используем его (приоритет над Firestore)
                const explicitUsername = safeFirestoreMeta.username;

                const userDoc = await this.db.collection('users').doc(currentUser.uid).get();
                if (userDoc.exists) {
                    const userData = userDoc.data();
                    // Используем явно переданный username, если он есть, иначе из Firestore
                    const usernameToUse = explicitUsername || userData.username || currentUser.displayName || currentUser.email?.split('@')[0] || 'Гость';
                    // Немедленная синхронизация для обновления метаданных (username, email)
                    await this._syncToLeaderboard(currentUser.uid, {
                        username: usernameToUse,
                        email: userData.email || null,
                        createdAt: userData.createdAt || null,
                        progress: userData.progress || { openedLocations: 0, openedBooks: 0 },
                        questState: userData.questState || { tasks: {} }
                    }, true); // immediate = true
                } else {
                    // Если документа нет, используем данные из auth или переданный username
                    const usernameToUse = explicitUsername || currentUser.displayName || currentUser.email?.split('@')[0] || 'Гость';
                    // Немедленная синхронизация для обновления метаданных
                    await this._syncToLeaderboard(currentUser.uid, {
                        username: usernameToUse,
                        email: null,
                        createdAt: null,
                        progress: { openedLocations: 0, openedBooks: 0 },
                        questState: { tasks: {} }
                    }, true); // immediate = true
                }
            } catch (syncError) {
                // Если не можем синхронизировать, не критично
                this._dlog('_syncToLeaderboard in updateUserMetadata failed', syncError?.message || String(syncError));
            }
        } catch (error) {
            console.error('❌ Ошибка обновления метаданных:', {
                uid: currentUser?.uid,
                meta: safeMeta,
                error: error?.message || String(error)
            });
            throw error;
        }
    }

    // Синхронизация данных пользователя в публичную коллекцию leaderboard
    async _syncToLeaderboard(userId, userData = null, immediate = false) {
        try {
            if (!userId) {
                console.error('[leaderboard] _syncToLeaderboard: userId is undefined!', { userId, hasUserData: !!userData, userDataUsername: userData?.username });
                return;
            }

            // Debounce для частых вызовов (например, при сохранении состояния квеста)
            // immediate = true для важных обновлений (username, email)
            if (!immediate) {
                // Очищаем предыдущий таймаут для этого userId
                if (this._leaderboardSyncTimeout) {
                    clearTimeout(this._leaderboardSyncTimeout);
                }

                // Сохраняем данные для отложенной синхронизации
                this._lastLeaderboardSync[userId] = userData;

                // Устанавливаем таймаут на 2 секунды
                this._leaderboardSyncTimeout = setTimeout(async () => {
                    const cachedData = this._lastLeaderboardSync[userId];
                    delete this._lastLeaderboardSync[userId];
                    if (cachedData) {
                        await this._syncToLeaderboardInternal(userId, cachedData);
                    }
                }, 2000);

                return; // Выходим, синхронизация произойдет через 2 секунды
            }

            // Немедленная синхронизация для важных обновлений
            await this._syncToLeaderboardInternal(userId, userData);
        } catch (error) {
            // Не критично, просто логируем
            console.error('[leaderboard] _syncToLeaderboard: ERROR', { userId, error: error?.message || String(error) });
            this._dlog('_syncToLeaderboard failed', error?.message || String(error));
        }
    }

    // Внутренняя функция синхронизации
    async _syncToLeaderboardInternal(userId, userData = null) {
        try {
            this._dlog('[leaderboard] _syncToLeaderboard START', { userId, hasUserData: !!userData, userDataUsername: userData?.username });

            // Если данные не переданы, пытаемся получить из Firestore
            let user = userData;
            if (!user) {
                try {
                    user = await this.getUser(userId);
                    this._dlog('[leaderboard] _syncToLeaderboard: got user from Firestore', { userId, username: user?.username });
                } catch (error) {
                    this._dlog('[leaderboard] _syncToLeaderboard: cannot get from Firestore, using auth', { userId, error: error?.message });
                    // Если не можем прочитать, используем данные из auth
                    const authUser = this.getCurrentAuthUser();
                    if (authUser && authUser.uid === userId) {
                        user = {
                            username: authUser.displayName || authUser.email?.split('@')[0] || 'Гость',
                            progress: { openedLocations: 0, openedBooks: 0 },
                            questState: { tasks: {} }
                        };
                        this._dlog('[leaderboard] _syncToLeaderboard: created user from auth', { userId, username: user.username });
                    } else {
                        this._dlog('[leaderboard] _syncToLeaderboard: no auth user, cannot sync', { userId });
                        return; // Не можем синхронизировать без данных
                    }
                }
            }
            if (!user) {
                this._dlog('[leaderboard] _syncToLeaderboard: no user data, returning', { userId });
                return;
            }

            // Определяем username: приоритет у переданного userData.username, затем Firestore, затем auth
            let finalUsername = null;
            const authUser = this.getCurrentAuthUser();
            const wasUserDataPassed = !!userData; // Запоминаем, были ли данные переданы явно

            this._dlog('[leaderboard] _syncToLeaderboard: determining username', {
                userId,
                userDataUsername: userData?.username,
                userUsername: user.username,
                wasUserDataPassed,
                authUserId: authUser?.uid,
                authDisplayName: authUser?.displayName,
                authEmail: authUser?.email
            });

            // Приоритет 1: Если данные переданы явно (userData), используем их username
            if (wasUserDataPassed && userData.username && userData.username !== 'Гость') {
                finalUsername = userData.username;
                this._dlog('[leaderboard] _syncToLeaderboard: using passed userData.username', { userId, finalUsername });
            }
            // Приоритет 2: username из Firestore (если не пустой и не 'Гость')
            else if (user.username && user.username !== 'Гость') {
                finalUsername = user.username;
                this._dlog('[leaderboard] _syncToLeaderboard: using Firestore username', { userId, finalUsername });
            }
            // Приоритет 3: Если username пустой или 'Гость', пытаемся взять из auth (только для текущего пользователя)
            else if (authUser && authUser.uid === userId) {
                const authUsername = authUser.displayName || authUser.email?.split('@')[0];
                if (authUsername) {
                    finalUsername = authUsername;
                    this._dlog('[leaderboard] _syncToLeaderboard: using auth username', { userId, finalUsername });
                } else {
                    finalUsername = 'Гость';
                    this._dlog('[leaderboard] _syncToLeaderboard: no auth username, using Гость', { userId });
                }
            }
            // Приоритет 4: Если передан userData с username (даже если 'Гость'), используем его
            else if (wasUserDataPassed && userData.username) {
                finalUsername = userData.username;
                this._dlog('[leaderboard] _syncToLeaderboard: using passed userData.username (even if Гость)', { userId, finalUsername });
            }
            // Fallback: 'Гость'
            else {
                finalUsername = 'Гость';
                this._dlog('[leaderboard] _syncToLeaderboard: fallback to Гость', { userId });
            }

            const leaderboardData = {
                userId: userId,
                username: finalUsername,
                email: user.email || null,
                createdAt: user.createdAt || null,
                openedLocations: user.progress?.openedLocations || 0,
                openedBooks: user.progress?.openedBooks || 0,
                tasks: user.questState?.tasks || {},
                updatedAt: new Date().toISOString()
            };

            this._dlog('[leaderboard] _syncToLeaderboard: writing to leaderboard', { userId, username: finalUsername, leaderboardData });
            const realm = this._firebaseRealm || window;
            const safeData = realm.JSON.parse(JSON.stringify(leaderboardData));

            await this.db.collection('leaderboard').doc(userId).set(safeData, { merge: true });
            this._dlog('[leaderboard] _syncToLeaderboard: SUCCESS', { userId, username: finalUsername });
        } catch (error) {
            // Не критично, просто логируем
            console.error('[leaderboard] _syncToLeaderboard: ERROR', { userId, error: error?.message || String(error) });
            this._dlog('_syncToLeaderboard failed', error?.message || String(error));
        }
    }

    // Синхронизация всех пользователей из users в leaderboard (если есть права)
    async syncAllUsersToLeaderboard() {
        try {
            this._dlog('[leaderboard] syncAllUsersToLeaderboard: starting...');
            const allUsers = await this.getAllUsers();
            this._dlog('[leaderboard] getAllUsers result:', Object.keys(allUsers || {}).length, 'users');
            if (!allUsers || Object.keys(allUsers).length === 0) {
                this._dlog('[leaderboard] no users to sync');
                return;
            }

            let synced = 0;
            for (const [userId, user] of Object.entries(allUsers)) {
                try {
                    const leaderboardData = {
                        userId: userId,
                        username: user.username || 'Гость',
                        openedLocations: user.progress?.openedLocations || 0,
                        openedBooks: user.progress?.openedBooks || 0,
                        tasks: user.questState?.tasks || {},
                        updatedAt: new Date().toISOString()
                    };

                    const realm = this._firebaseRealm || window;
                    const safeData = realm.JSON.parse(JSON.stringify(leaderboardData));

                    await this.db.collection('leaderboard').doc(userId).set(safeData, { merge: true });
                    synced++;
                    this._dlog(`[leaderboard] synced user ${userId}: ${user.username || 'Гость'}`);
                } catch (error) {
                    console.error(`[leaderboard] sync failed for ${userId}:`, error?.message || String(error));
                    this._dlog(`syncAllUsersToLeaderboard failed for ${userId}`, error?.message || String(error));
                }
            }
            this._dlog(`[leaderboard] syncAllUsersToLeaderboard: synced ${synced} users`);
        } catch (error) {
            console.error('[leaderboard] syncAllUsersToLeaderboard error:', error?.message || String(error));
            // Если нет прав на getAllUsers, просто игнорируем
            this._dlog('syncAllUsersToLeaderboard: no access to getAllUsers', error?.message || String(error));
        }
    }

    // Получение пользователя по ID
    async getUser(userId) {
        await this.init();

        try {
            const doc = await this.db.collection('users').doc(userId).get();

            if (!doc.exists) {
                return null;
            }

            const data = doc.data();
            return {
                id: doc.id,
                username: data.username || 'Гость',
                email: data.email || null,
                createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
                updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
                questState: data.questState || { tasks: {}, completedQuests: [] },
                isAnonymous: data.isAnonymous !== undefined ? data.isAnonymous : true
            };
        } catch (error) {
            if (String(error?.message || '').toLowerCase().includes('insufficient permissions')) {
                this._logPermissionDeniedOnce('getUser');
            }
            console.error('❌ Ошибка получения пользователя:', error);
            throw error;
        }
    }

    // Получение текущего пользователя
    async getCurrentUser() {
        await this.init();

        const currentUser = this.getCurrentAuthUser();
        if (!currentUser) {
            return null;
        }

        return await this.getUser(currentUser.uid);
    }

    // Получение всех пользователей (только для админа)
    async getAllUsers() {
        await this.init();

        try {
            const snapshot = await this.db.collection('users').get();
            const users = {};

            snapshot.forEach(doc => {
                const data = doc.data();
                users[doc.id] = {
                    id: doc.id,
                    username: data.username || 'Гость',
                    email: data.email || null,
                    createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
                    updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
                    questState: data.questState || { tasks: {}, completedQuests: [] },
                    isAnonymous: data.isAnonymous !== undefined ? data.isAnonymous : true,
                    ipAddress: data.ipAddress || null
                };
            });

            return users;
        } catch (error) {
            console.error('❌ Ошибка получения всех пользователей:', error);
            throw error;
        }
    }

    // Удаление пользователя
    async deleteUser(userId) {
        await this.init();

        try {
            await this.db.collection('users').doc(userId).delete();
            this._dlog('✅ Пользователь удален:', userId);
        } catch (error) {
            console.error('❌ Ошибка удаления пользователя:', error);
            throw error;
        }
    }

    // Сохранение состояния квеста
    async saveQuestState(questState) {
        await this.init();

        const currentUser = this.getCurrentAuthUser();
        if (!currentUser) {
            throw new Error('Пользователь не авторизован');
        }

        try {
            const safeQuestState = this._toPlainJson(questState) || { tasks: {}, completedQuests: [] };
            // set+merge устойчивее, чем update (и проще переживает создание документа)
            const payload = {
                questState: safeQuestState,
                updatedAt: new Date().toISOString()
            };
            const firestorePayload = this._toFirestoreData(payload) || payload;
            await this.db.collection('users').doc(currentUser.uid).set(firestorePayload, { merge: true });
            this._dlog('✅ Состояние квеста сохранено');

            // Синхронизируем в leaderboard
            // Пытаемся получить данные пользователя для синхронизации
            try {
                const userDoc = await this.db.collection('users').doc(currentUser.uid).get();
                if (userDoc.exists) {
                    const userData = userDoc.data();
                    // Отложенная синхронизация для сохранения состояния квеста (debounce)
                    await this._syncToLeaderboard(currentUser.uid, {
                        username: userData.username || currentUser.displayName || currentUser.email?.split('@')[0] || 'Гость',
                        email: userData.email || null,
                        createdAt: userData.createdAt || null,
                        progress: userData.progress || { openedLocations: 0, openedBooks: 0 },
                        questState: userData.questState || { tasks: {} }
                    }, false); // immediate = false - debounce
                } else {
                    // Если документа нет, используем данные из auth
                    // Отложенная синхронизация для сохранения состояния квеста (debounce)
                    await this._syncToLeaderboard(currentUser.uid, {
                        username: currentUser.displayName || currentUser.email?.split('@')[0] || 'Гость',
                        email: null,
                        createdAt: null,
                        progress: { openedLocations: 0, openedBooks: 0 },
                        questState: { tasks: {} }
                    }, false); // immediate = false - debounce
                }
            } catch (syncError) {
                // Если не можем синхронизировать, не критично
                this._dlog('_syncToLeaderboard in saveQuestState failed', syncError?.message || String(syncError));
            }
        } catch (error) {
            console.error('❌ Ошибка сохранения состояния квеста:', error);
            throw error;
        }
    }

    // Загрузка состояния квеста
    async loadQuestState() {
        await this.init();

        const currentUser = this.getCurrentAuthUser();
        if (!currentUser) {
            return { tasks: {}, completedQuests: [] };
        }

        try {
            const user = await this.getUser(currentUser.uid);
            return user?.questState || { tasks: {}, completedQuests: [] };
        } catch (error) {
            console.error('❌ Ошибка загрузки состояния квеста:', error);
            return { tasks: {}, completedQuests: [] };
        }
    }

    // Подписка на изменения состояния квеста (real-time)
    subscribeToQuestState(callback) {
        this.init().then(() => {
            const currentUser = this.getCurrentAuthUser();
            if (!currentUser) {
                callback({ tasks: {}, completedQuests: [] });
                return;
            }

            return this.db.collection('users').doc(currentUser.uid)
                .onSnapshot((doc) => {
                    if (doc.exists) {
                        const data = doc.data();
                        callback(data.questState || { tasks: {}, completedQuests: [] });
                    } else {
                        callback({ tasks: {}, completedQuests: [] });
                    }
                });
        });
    }
}

// Создаем глобальный экземпляр (идемпотентно, чтобы повторная загрузка скрипта не ломала состояние)
if (!window.userDatabase) {
    window.userDatabase = new UserDatabase();
}
