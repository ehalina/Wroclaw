// Система управления аккаунтами пользователей через Firebase
// Использует Firebase Anonymous Auth для гостевых пользователей
// Поддерживает Link Account для превращения гостя в зарегистрированного

class UserAccountManager {
    constructor() {
        this.currentUser = null;
        this.firebaseReady = false;
        this._anonSignInRequested = false;
        this.init();
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
                if (firebaseUser) {
                    // Пользователь авторизован
                    this.currentUser = await window.userDatabase.getUser(firebaseUser.uid);
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
                        // Синхронизируем флаги с реальным Auth пользователем (важно при входе email-аккаунтом)
                        const needsSync =
                            (this.currentUser.isAnonymous !== firebaseUser.isAnonymous) ||
                            ((this.currentUser.email || null) !== (firebaseUser.email || null));

                        if (needsSync) {
                            try {
                                await window.userDatabase.updateUserMetadata({
                                    isAnonymous: firebaseUser.isAnonymous,
                                    email: firebaseUser.email || null
                                });
                                this.currentUser = await window.userDatabase.getUser(firebaseUser.uid);
                            } catch (e) {
                                // не критично, просто покажем по данным как есть
                            }
                        }
                    }
                    await this.loadUserQuestState();
                    await this.updateAccountButton();
                } else {
                    // Пользователь вышел - создаем анонимного
                    try {
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

        const title = document.createElement('h2');
        title.textContent = 'Аккаунт';
        title.style.cssText = `
            color: #8B4513;
            margin-bottom: 20px;
            font-size: 28px;
        `;

        const status = document.createElement('div');
        status.style.cssText = `
            color: #654321;
            margin-bottom: 20px;
            font-size: 16px;
            background: rgba(255, 255, 255, 0.65);
            border-radius: 8px;
            padding: 12px;
            border: 2px solid #8B4513;
        `;
        status.textContent = 'Загрузка профиля...';

        const body = document.createElement('div');

        const closeBtnTop = document.createElement('button');
        closeBtnTop.textContent = '✕';
        closeBtnTop.title = 'Закрыть';
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
        menuCard.appendChild(title);
        menuCard.appendChild(status);
        menuCard.appendChild(body);
        overlay.appendChild(menuCard);
        document.body.appendChild(overlay);

        const renderUser = (currentUser) => {
            body.innerHTML = '';

            const userInfo = document.createElement('div');
            userInfo.style.cssText = 'margin-bottom: 22px;';

            const userName = document.createElement('div');
            userName.textContent = currentUser.username || 'Пользователь';
            userName.style.cssText = `
                font-size: 24px;
                font-weight: bold;
                color: #654321;
                margin-bottom: 10px;
            `;

            const userEmail = document.createElement('div');
            userEmail.textContent = currentUser.email || (currentUser.isAnonymous ? 'Гостевой аккаунт' : '');
            userEmail.style.cssText = `
                font-size: 14px;
                color: #666;
                margin-bottom: 12px;
            `;

            const completedCount = Object.keys(currentUser.questState?.tasks || {}).length;
            const progress = document.createElement('div');
            progress.textContent = `Прогресс: ${completedCount}/13 задач`;
            progress.style.cssText = `
                font-size: 16px;
                color: #654321;
                margin-bottom: 10px;
            `;

            const uid = document.createElement('div');
            uid.style.cssText = 'font-size: 12px; color: #666;';
            uid.textContent = `ID: ${currentUser.id}`;

            userInfo.appendChild(userName);
            if (currentUser.email || currentUser.isAnonymous) userInfo.appendChild(userEmail);
            userInfo.appendChild(progress);
            userInfo.appendChild(uid);

            const buttonsContainer = document.createElement('div');
            buttonsContainer.style.cssText = 'display: flex; flex-direction: column; gap: 12px;';

            if (currentUser.isAnonymous) {
                const linkAccountBtn = document.createElement('button');
                linkAccountBtn.textContent = '🔗 Привязать email (сохранить прогресс навсегда)';
                linkAccountBtn.style.cssText = `
                    padding: 12px 16px;
                    background: #2196F3;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 16px;
                `;
                linkAccountBtn.onclick = () => {
                    overlay.remove();
                    this.showLinkAccountDialog();
                };
                buttonsContainer.appendChild(linkAccountBtn);
            } else {
                const ok = document.createElement('div');
                ok.textContent = '✅ Аккаунт привязан — прогресс сохраняется в облаке.';
                ok.style.cssText = 'color:#1b5e20; background: rgba(255,255,255,0.7); padding:10px; border-radius:8px; border:2px solid #8B4513;';
                buttonsContainer.appendChild(ok);
            }

            const signInBtn = document.createElement('button');
            signInBtn.textContent = 'Войти по email (на другом устройстве)';
            signInBtn.style.cssText = `
                padding: 12px 16px;
                background: #8B4513;
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 16px;
            `;
            signInBtn.onclick = () => {
                overlay.remove();
                this.showSignInDialog();
            };
            buttonsContainer.appendChild(signInBtn);

            const signOutBtn = document.createElement('button');
            signOutBtn.textContent = 'Выйти (создать нового гостя)';
            signOutBtn.style.cssText = `
                padding: 12px 16px;
                background: #d32f2f;
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 16px;
            `;
            signOutBtn.onclick = async () => {
                if (confirm('Выйти? После выхода автоматически создастся новый гостевой аккаунт.')) {
                    try {
                        await window.userDatabase.signOut();
                    } catch (e) {}
                    overlay.remove();
                }
            };
            buttonsContainer.appendChild(signOutBtn);

            const closeBtn = document.createElement('button');
            closeBtn.textContent = 'Закрыть';
            closeBtn.style.cssText = `
                padding: 12px 16px;
                background: rgba(0,0,0,0.65);
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 16px;
            `;
            closeBtn.onclick = () => overlay.remove();
            buttonsContainer.appendChild(closeBtn);

            body.appendChild(userInfo);
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
                status.textContent = 'Профиль не готов. Попробуйте через пару секунд.';
                const retry = document.createElement('button');
                retry.textContent = 'Повторить';
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
                body.innerHTML = '';
                body.appendChild(retry);
                return;
            }

            status.textContent = currentUser.isAnonymous
                ? 'Вы сейчас в гостевом режиме. Нажмите “Привязать email”, чтобы сохранить прогресс навсегда.'
                : 'Вы вошли в аккаунт. Прогресс сохраняется в облаке.';

            renderUser(currentUser);
        } catch (error) {
            console.error('Ошибка открытия меню аккаунта:', error);
            status.textContent = `Ошибка: ${error?.message || error}`;
            const retry = document.createElement('button');
            retry.textContent = 'Повторить';
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
            body.innerHTML = '';
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
        cancelBtn.onclick = () => overlay.remove();

        buttonsContainer.appendChild(linkBtn);
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
