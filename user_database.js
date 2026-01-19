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

            console.log('✅ Firebase Firestore инициализирован');
        })().finally(() => {
            // оставляем promise только на время инициализации
            this._initPromise = null;
        });

        return this._initPromise;
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
            console.log('✅ Анонимный пользователь создан:', userCredential.user.uid);
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

            console.log('✅ Email успешно привязан к аккаунту');
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

            console.log('✅ Пользователь зарегистрирован:', userCredential.user.uid);
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
            console.log('✅ Пользователь вошел:', userCredential.user.uid);
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
            console.log('✅ Пользователь вышел');
        } catch (error) {
            console.error('❌ Ошибка выхода:', error);
            throw error;
        }
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
                : (authUser ? !!authUser.isAnonymous : true)
        };
        const firestoreDoc = this._toFirestoreData(userDoc) || userDoc;

        try {
            await this.db.collection('users').doc(validatedData.id).set(firestoreDoc, { merge: true });
            console.log('✅ Пользователь сохранен в Firestore:', validatedData.id);
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
        const firestoreMeta = this._toFirestoreData(safeMeta) || safeMeta;
        
        const currentUser = this.getCurrentAuthUser();
        if (!currentUser) {
            throw new Error('Пользователь не авторизован');
        }

        try {
            await this.db.collection('users').doc(currentUser.uid).update({
                ...firestoreMeta,
                updatedAt: new Date().toISOString()
            });
        } catch (error) {
            console.error('❌ Ошибка обновления метаданных:', error);
            throw error;
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
                    isAnonymous: data.isAnonymous !== undefined ? data.isAnonymous : true
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
            console.log('✅ Пользователь удален:', userId);
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
            console.log('✅ Состояние квеста сохранено');
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
