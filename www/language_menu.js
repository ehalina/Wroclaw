// Стили для языкового меню
const languageMenuStyles = `
    .language-menu {
        position: fixed;
        top: 20px; /* выравнивание с кнопкой карты */
        right: 20px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        z-index: 1000;
    }

    .language-menu-button, .sound-menu-button, .account-menu-button {
        width: 64px;
        height: 64px;
        background: rgba(0, 0, 0, 0.7);
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: background 0.3s ease;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
    }

    .language-menu-button:hover, .sound-menu-button:hover, .account-menu-button:hover {
        background: rgba(0, 0, 0, 0.9);
    }

    .language-menu-button img, .sound-menu-button img, .account-menu-button img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        border-radius: 4px;
    }

    .sound-menu-button.muted img {
        opacity: 0.5;
    }

    .language-dropdown {
        position: absolute;
        top: 100%;
        right: 0; /* Выравнивание по правому краю родительского элемента */
        background: rgba(255, 246, 228, 0.9);
        border-radius: 8px;
        padding: 8px 0;
        margin-top: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        display: none;
        flex-direction: column;
        min-width: 100px;
    }

    .language-dropdown.show {
        display: flex;
    }

    .language-option {
        padding: 8px 16px;
        cursor: pointer;
        transition: background 0.2s ease; 
        text-align: center;
        color: #333;
        text-decoration: none;
    }

    .language-option:hover {
        background: rgba(0, 0, 0, 0.1);
    }

    .language-option.active {
        font-weight: bold;
        color: #111;
        text-decoration: underline;
        background: rgba(0, 0, 0, 0.05); 
    }

    .language-menu.disabled {
        opacity: 0.3;
        transition: opacity 0.3s ease;
    }

    .language-menu.disabled .language-menu-button,
    .language-menu.disabled .sound-menu-button {
        cursor: not-allowed;
        opacity: 0.3;
        pointer-events: none;
    }

    /* Важно: даже когда меню отключено (например, во время сцен/оверлеев),
       кнопка аккаунта должна оставаться кликабельной */
    .language-menu.disabled .account-menu-button {
        pointer-events: auto;
        opacity: 1;
        cursor: pointer;
    }
`;

function getMessageType(name, fallback) {
    return window.SpaMessages?.TYPES?.[name] || fallback;
}

function getMessageTargetOrigin() {
    if (window.SpaMessages && typeof window.SpaMessages.getTargetOrigin === 'function') {
        return window.SpaMessages.getTargetOrigin();
    }

    return window.location.origin && window.location.origin !== 'null' ? window.location.origin : '*';
}

function postMessageToParent(type, payload = {}) {
    if (!window.parent || window.parent === window) {
        return false;
    }

    if (window.SpaMessages && typeof window.SpaMessages.postToParent === 'function') {
        return window.SpaMessages.postToParent(type, payload);
    }

    window.parent.postMessage({ ...payload, type }, getMessageTargetOrigin());
    return true;
}

function postMessageToIframe(iframe, type, payload = {}) {
    if (!iframe || !iframe.contentWindow) {
        return false;
    }

    if (window.SpaMessages && typeof window.SpaMessages.postToFrame === 'function') {
        return window.SpaMessages.postToFrame(iframe, type, payload);
    }

    iframe.contentWindow.postMessage({ ...payload, type }, getMessageTargetOrigin());
    return true;
}

const LANGUAGE_AUDIO_DEBUG_STORAGE_KEYS = ['DEBUG_AUDIO', '__audio_debug'];

function isLanguageAudioDebugEnabled() {
    try {
        if (window.DEBUG_AUDIO === true || window.DEBUG_AUDIO === '1' || window.DEBUG_AUDIO === 'true') {
            return true;
        }

        return LANGUAGE_AUDIO_DEBUG_STORAGE_KEYS.some((key) => {
            const value = localStorage.getItem(key);
            return value === '1' || value === 'true';
        });
    } catch (_) {
        return false;
    }
}

function handleLanguageMenuAudioPlayRejection(context, error) {
    if (isLanguageAudioDebugEnabled()) {
        console.warn(`🎵 [language audio] play() rejected: ${context}`, error);
    }
}

const QuestAudio = (() => {
    const ELEMENT_ID = 'questMusic';
    const TRACK_NAME = 'quest';
    const DEFAULT_SOURCE = 'media/zwyki/quest.mp3';
    const DEFAULT_VOLUME = 0.7;

    function getQuestSource(contextWindow = window) {
        const config = contextWindow.SpaConfig || window.SpaConfig;
        if (config && typeof config.getAudioSourceForTrack === 'function') {
            return config.getAudioSourceForTrack(TRACK_NAME) || DEFAULT_SOURCE;
        }

        return DEFAULT_SOURCE;
    }

    function registerWithVisibilityManager(audio, contextWindow = window) {
        const manager = contextWindow.visibilityAudioManager || window.visibilityAudioManager;
        if (manager && typeof manager.registerAudio === 'function') {
            manager.registerAudio(audio);
        }
    }

    function getOrCreateSharedQuestMusic(options = {}) {
        const contextWindow = options.contextWindow || window;
        const contextDocument = options.contextDocument || contextWindow.document || document;
        let questMusic = contextWindow.questMusic || contextDocument.getElementById(ELEMENT_ID);

        if (!questMusic) {
            questMusic = contextDocument.createElement('audio');
            questMusic.id = ELEMENT_ID;
            questMusic.src = getQuestSource(contextWindow);
            (contextDocument.body || contextDocument.documentElement).appendChild(questMusic);
        } else if (!questMusic.getAttribute('src')) {
            questMusic.src = getQuestSource(contextWindow);
        }

        questMusic.loop = true;
        questMusic.preload = 'auto';
        questMusic.volume = typeof options.volume === 'number' ? options.volume : DEFAULT_VOLUME;
        contextWindow.questMusic = questMusic;
        registerWithVisibilityManager(questMusic, contextWindow);

        return questMusic;
    }

    function primeSharedQuestMusic(options = {}) {
        const questMusic = getOrCreateSharedQuestMusic(options);

        try {
            questMusic.muted = false;
            questMusic.volume = typeof options.volume === 'number' ? options.volume : DEFAULT_VOLUME;
            questMusic.load();
            questMusic.currentTime = 0;
            questMusic.play().then(() => {
                questMusic.pause();
                questMusic.currentTime = 0;
            }).catch((error) => {
                handleLanguageMenuAudioPlayRejection('questMusic prime', error);
            });
        } catch (error) {
            // Browser autoplay policies can reject priming; playback remains user-gesture driven.
        }

        return questMusic;
    }

    function attachSharedQuestMusicToFrame(frameOrDocument, options = {}) {
        const questMusic = options.prime
            ? primeSharedQuestMusic(options)
            : getOrCreateSharedQuestMusic(options);
        const frameWindow = frameOrDocument?.contentWindow || frameOrDocument?.defaultView || null;

        if (frameWindow) {
            frameWindow.questMusic = questMusic;
        }

        return questMusic;
    }

    function pauseSharedQuestMusic() {
        const questMusic = window.questMusic || document.getElementById(ELEMENT_ID);
        if (questMusic) {
            questMusic.pause();
        }
    }

    return {
        attachSharedQuestMusicToFrame,
        getOrCreateSharedQuestMusic,
        pauseSharedQuestMusic,
        primeSharedQuestMusic
    };
})();

window.QuestAudio = window.QuestAudio || QuestAudio;

// Функции для работы с языковым меню
const LanguageMenu = {
    musicInitialized: false,
    
    init() {
        // Проверяем, не инициализировано ли уже меню
        if (document.querySelector('.language-menu')) {
    // console.log('🔧 Language menu уже инициализирован, пропускаем повторную инициализацию');
            return;
        }

        // Добавляем стили на страницу
        const styleSheet = document.createElement("style");
        styleSheet.textContent = languageMenuStyles;
        document.head.appendChild(styleSheet);

        // Восстанавливаем язык из localStorage, если есть
        const savedLang = localStorage.getItem('selectedLanguage');
        if (savedLang && window.i18n && window.i18n.getCurrentLang && window.i18n.getCurrentLang() !== savedLang) {
            window.i18n.changeLang(savedLang);
        }

        // Создаем структуру меню
        const menuHTML = `
            <div class="language-menu">
                <button class="language-menu-button" onclick="LanguageMenu.toggleDropdown()">
                    <img src="media/local.jpg" alt="Language" class="language-icon">
                </button>
                <button class="sound-menu-button muted" onclick="LanguageMenu.toggleSound()">
                    <img src="media/sound.jpg" alt="Sound" class="sound-icon">
                </button>
                <button class="account-menu-button" title="Аккаунт">
                    <img src="media/user.jpg" alt="Account" class="account-icon">
                </button>
                <div class="language-dropdown">
                    <a href="#" class="language-option" data-lang="pl" onclick="LanguageMenu.changeLang('pl')">PL</a>
                    <a href="#" class="language-option" data-lang="ru" onclick="LanguageMenu.changeLang('ru')">RU</a>
                    <a href="#" class="language-option" data-lang="be" onclick="LanguageMenu.changeLang('be')">BE</a>
                    <a href="#" class="language-option" data-lang="uk" onclick="LanguageMenu.changeLang('uk')">UK</a>
                    <a href="#" class="language-option" data-lang="en" onclick="LanguageMenu.changeLang('en')">EN</a>
                    <a href="#" class="language-option" data-lang="de" onclick="LanguageMenu.changeLang('de')">DE</a>
                    <a href="#" class="language-option" data-lang="cs" onclick="LanguageMenu.changeLang('cs')">CS</a>
                </div>
            </div>
        `;

        // Добавляем меню на страницу
        document.body.insertAdjacentHTML('beforeend', menuHTML);

        // Добавляем обработчик для кнопки аккаунта
        const accountButton = document.querySelector('.account-menu-button');
        if (accountButton) {
            accountButton.addEventListener('click', () => {
                // Важно: если звук уже включен, делаем "ещё одну активацию" в рамках user-gesture,
                // чтобы браузер не блокировал аудио после открытия оверлеев/меню.
                this.reactivateSoundIfEnabled();
                this.showAccountMenu();
            });
        }

        // Создаем кнопку разблокировки аудио динамически
    // console.log('🎵 Вызываем createAudioUnlockButton()');
        this.createAudioUnlockButton();

        // Добавляем обработчик клика вне меню
        document.addEventListener('click', function(e) {
            const dropdown = document.querySelector('.language-dropdown');
            const menuButton = document.querySelector('.language-menu-button');
            
            if (!e.target.closest('.language-menu')) {
                dropdown.classList.remove('show');
            }
        });

        // Обновляем активный язык
        this.updateActiveLanguage();

        // Инициализируем состояние звука
        this.initSoundState();
    },

    initSoundState() {
        // Проверяем, была ли уже показана подсказка
        const hintShown = localStorage.getItem('soundHintShown') === 'true';
        
        // Проверяем сохраненное состояние звука
        const isMuted = localStorage.getItem('soundMuted') === 'true';
        const soundButton = document.querySelector('.sound-menu-button');
        
        if (soundButton) {
            // По умолчанию кнопка звука выключена при первой загрузке
            if (!hintShown) {
                // Первая загрузка - принудительно выключаем звук
                soundButton.classList.add('muted');
                localStorage.setItem('soundMuted', 'true');
    // console.log('🔇 Первая загрузка - звук выключен по умолчанию');
                // Добавляем задержку, чтобы страница полностью загрузилась
                setTimeout(() => {
                    this.showSoundHint();
                }, 1500);
            } else {
                // Восстанавливаем сохраненное состояние
                if (isMuted) {
                    soundButton.classList.add('muted');
    // console.log('🔇 Восстанавливаем сохраненное состояние - звук выключен');
                } else {
                    soundButton.classList.remove('muted');
    // console.log('🔊 Восстанавливаем сохраненное состояние - звук включен');
                }
            }
        }
        
        // Принудительно обновляем визуальное состояние кнопки
        this.updateSoundButtonVisualState();
        
        // Применяем состояние звука после небольшой задержки, чтобы аудио элемент успел загрузиться
        setTimeout(() => {
            const currentMuted = localStorage.getItem('soundMuted') === 'true';
            if (currentMuted) {
                this.muteAllSounds();
            } else {
                // Если звук не отключен, инициализируем звуки геометок
                this.initializeGeoMarkerSounds();
            }
        }, 1000);
    },

    updateSoundButtonVisualState() {
        const soundButton = document.querySelector('.sound-menu-button');
        if (soundButton) {
            const isMuted = localStorage.getItem('soundMuted') === 'true';
            if (isMuted) {
                soundButton.classList.add('muted');
    // console.log('🔇 Обновляем визуальное состояние - звук выключен');
            } else {
                soundButton.classList.remove('muted');
    // console.log('🔊 Обновляем визуальное состояние - звук включен');
            }
        }
    },

    toggleSound() {
        // Проверяем, не отключено ли меню
        if (this.isMenuDisabled()) {
    // console.log('🚫 Language menu отключен, игнорируем клик по кнопке звука');
            return;
        }
        
        const soundButton = document.querySelector('.sound-menu-button');
        const isMuted = soundButton.classList.contains('muted');
        
        if (isMuted) {
            soundButton.classList.remove('muted');
            localStorage.setItem('soundMuted', 'false');
            
            // Инициализируем звуки геометок при первом включении звука
    // console.log('🎵 Включаем звук - инициализируем звуки геометок...');
            this.initializeGeoMarkerSounds();
            
            // Принудительно инициализируем звуки в iframe при первом клике
            this.forceInitializeIframeSounds();
            
            // Управляем музыкой через SPA
            this.manageSPAMusic('unmute');
            
            this.unmuteAllSounds();
        } else {
            soundButton.classList.add('muted');
            localStorage.setItem('soundMuted', 'true');
            
            // Управляем музыкой через SPA
            this.manageSPAMusic('mute');
            
            this.muteAllSounds();
        }
        
        // Принудительно обновляем визуальное состояние после изменения
        this.updateSoundButtonVisualState();
    },

    // Если звук включен — повторно активируем аудио в рамках текущего user-gesture (клик по account)
    reactivateSoundIfEnabled() {
        try {
            const soundButton = document.querySelector('.sound-menu-button');
            const isMuted = localStorage.getItem('soundMuted') === 'true';
            const isButtonMuted = soundButton ? soundButton.classList.contains('muted') : true;

            // "Активна" = звук включен (не muted)
            if (!soundButton || isMuted || isButtonMuted) return;

            // Повторно применяем состояние "unmute" без переключения в mute
            this.manageSPAMusic('unmute');
            this.unmuteAllSounds();

            // Если есть SPA-менеджер — попытаться разблокировать аудио (в user-gesture это легально)
            if (window.spaManager && typeof window.spaManager.unlockAudio === 'function') {
                window.spaManager.unlockAudio();
            }

            // На всякий случай пытаемся возобновить unified audio player
            if (window.spaManager && typeof window.spaManager.getUnifiedAudioPlayer === 'function') {
                const audio = window.spaManager.getUnifiedAudioPlayer();
                if (audio && audio.paused) audio.play().catch(() => {});
            }

            // iOS direct audio fallback
            if (window.directMusicAudio && window.directMusicAudio.paused) {
                window.directMusicAudio.play().catch(() => {});
            }
        } catch (_) {
            // no-op
        }
    },

    manageSPAMusic(action) {
        // Отправляем сообщение в родительское окно SPA для управления музыкой
        if (window.parent && window.parent !== window) {
    // console.log('🎵 Отправляем сообщение в SPA для управления музыкой:', action);
            postMessageToParent(getMessageType('SOUND_CONTROL', 'soundControl'), {
                action: action,
                source: 'languageMenu'
            });
        } else {
            // Если мы не в iframe, управляем музыкой напрямую
    // console.log('🎵 Управляем музыкой напрямую (не в iframe):', action);
            if (action === 'unmute') {
                this.unmuteSPAMusic();
            } else {
                this.muteSPAMusic();
            }
        }
    },

    muteSPAMusic() {
        // Останавливаем фоновую музыку SPA (town.mp3)
        const backgroundMusic = document.querySelector('#backgroundMusic');
        if (backgroundMusic) {
            backgroundMusic.pause();
        }
        
        // Останавливаем kostel музыку SPA
        const kostelMusic = document.querySelector('#kostelMusic');
        if (kostelMusic) {
            kostelMusic.pause();
        }
        
        // Останавливаем birds музыку SPA
        const birdsMusic = document.querySelector('#birdsMusic');
        if (birdsMusic) {
            birdsMusic.pause();
        }
        
        // Останавливаем hang музыку SPA
        const hangMusic = document.querySelector('#hangMusic');
        if (hangMusic) {
            hangMusic.pause();
        }
        
        // Останавливаем quest музыку SPA
        window.QuestAudio.pauseSharedQuestMusic();
    },

    unmuteSPAMusic() {
        // Если музыка еще не инициализирована, инициализируем town и kostel
        if (!this.musicInitialized) {
    // console.log('🎵 Первая инициализация музыки - запускаем town и kostel в фоне');
            this.startTownMusic();
        } else {
            // Используем SPA менеджер для правильного переключения музыки
            if (window.spaManager && typeof window.spaManager.switchMusicForPage === 'function') {
                const currentPage = window.spaManager.currentPage;
                if (currentPage) {
    // console.log('🎵 Используем SPA менеджер для переключения музыки на странице:', currentPage);
                    window.spaManager.switchMusicForPage(currentPage);
                } else {
    // console.log('🎵 SPA менеджер не найден, запускаем town музыку напрямую');
                    this.startTownMusic();
                }
            } else {
    // console.log('🎵 SPA менеджер не найден, запускаем town музыку напрямую');
                this.startTownMusic();
            }
        }
    },
    
    startTownMusic() {
        // Запускаем обычную фоновую музыку (town.mp3)
        const backgroundMusic = document.querySelector('#backgroundMusic');
        if (backgroundMusic) {
            // Добавляем обработчик зацикливания, если его еще нет
            if (!backgroundMusic.hasAttribute('data-loop-handler-added')) {
                backgroundMusic.addEventListener('ended', () => {
                    const isMuted = localStorage.getItem('soundMuted') === 'true';
                    if (!isMuted) {
                        backgroundMusic.currentTime = 0;
                        backgroundMusic.play().catch((error) => handleLanguageMenuAudioPlayRejection('town loop', error));
                    }
                });
                backgroundMusic.setAttribute('data-loop-handler-added', 'true');
            }
            
            backgroundMusic.currentTime = 0;
            backgroundMusic.play().catch((error) => handleLanguageMenuAudioPlayRejection('town start', error));
    // console.log('🎵 Запускаем фоновую музыку');
            
            // После успешного запуска town музыки инициализируем kostel в фоне
            if (!this.musicInitialized) {
                this.initializeKostelInBackground();
                this.musicInitialized = true;
            }
        }
    },
    
    initializeKostelInBackground() {
    // console.log('🎵 Инициализируем kostel, birds и hang музыку в фоне...');
        
        // Инициализируем kostel музыку
        const kostelMusic = document.querySelector('#kostelMusic');
        if (kostelMusic) {
            // Добавляем обработчик зацикливания, если его еще нет
            if (!kostelMusic.hasAttribute('data-loop-handler-added')) {
                kostelMusic.addEventListener('ended', () => {
                    const isMuted = localStorage.getItem('soundMuted') === 'true';
                    if (!isMuted) {
                        kostelMusic.currentTime = 0;
                        kostelMusic.play().catch((error) => handleLanguageMenuAudioPlayRejection('kostel loop', error));
                    }
                });
                kostelMusic.setAttribute('data-loop-handler-added', 'true');
            }
            
            // Инициализируем kostel музыку, но сразу ставим на паузу
            kostelMusic.currentTime = 0;
            kostelMusic.volume = 0.7;
            
            // Принудительно инициализируем kostel музыку для iOS
            kostelMusic.play().then(() => {
                kostelMusic.pause();
    // console.log('🎵 Kostel музыка инициализирована и поставлена на паузу');
            }).catch(error => {
    // console.log('🎵 Ошибка инициализации kostel музыки:', error);
            });
        } else {
    // console.log('🎵 Элемент kostelMusic не найден');
        }
        
        // Инициализируем birds музыку
        const birdsMusic = document.querySelector('#birdsMusic');
        if (birdsMusic) {
            // Добавляем обработчик зацикливания, если его еще нет
            if (!birdsMusic.hasAttribute('data-loop-handler-added')) {
                birdsMusic.addEventListener('ended', () => {
                    const isMuted = localStorage.getItem('soundMuted') === 'true';
                    if (!isMuted) {
                        birdsMusic.currentTime = 0;
                        birdsMusic.play().catch((error) => handleLanguageMenuAudioPlayRejection('birds loop', error));
                    }
                });
                birdsMusic.setAttribute('data-loop-handler-added', 'true');
            }
            
            // Инициализируем birds музыку, но сразу ставим на паузу
            birdsMusic.currentTime = 0;
            birdsMusic.volume = 0.7;
            
            // Принудительно инициализируем birds музыку для iOS
            birdsMusic.play().then(() => {
                birdsMusic.pause();
    // console.log('🎵 Birds музыка инициализирована и поставлена на паузу');
            }).catch(error => {
    // console.log('🎵 Ошибка инициализации birds музыки:', error);
            });
        } else {
    // console.log('🎵 Элемент birdsMusic не найден');
        }
        
        // Инициализируем hang музыку
        const hangMusic = document.querySelector('#hangMusic');
        if (hangMusic) {
            // Добавляем обработчик зацикливания, если его еще нет
            if (!hangMusic.hasAttribute('data-loop-handler-added')) {
                hangMusic.addEventListener('ended', () => {
                    const isMuted = localStorage.getItem('soundMuted') === 'true';
                    if (!isMuted) {
                        hangMusic.currentTime = 0;
                        hangMusic.play().catch((error) => handleLanguageMenuAudioPlayRejection('hang loop', error));
                    }
                });
                hangMusic.setAttribute('data-loop-handler-added', 'true');
            }
            
            // Инициализируем hang музыку, но сразу ставим на паузу
            hangMusic.currentTime = 0;
            hangMusic.volume = 0.7;
            
            // Принудительно инициализируем hang музыку для iOS
            hangMusic.play().then(() => {
                hangMusic.pause();
    // console.log('🎵 Hang музыка инициализирована и поставлена на паузу');
            }).catch(error => {
    // console.log('🎵 Ошибка инициализации hang музыки:', error);
            });
        } else {
    // console.log('🎵 Элемент hangMusic не найден');
        }
    },

    muteAllSounds() {
        const sounds = document.querySelectorAll('audio');
        sounds.forEach(sound => {
            sound.muted = true;
        });
        
        // Отключаем iframe музыку
        if (window.muteIframeMusic) {
            window.muteIframeMusic();
        }
        
        // Останавливаем фоновую музыку SPA (town.mp3)
        const backgroundMusic = document.querySelector('#backgroundMusic');
        if (backgroundMusic) {
            backgroundMusic.pause();
        }
        
        // Останавливаем kostel музыку SPA
        const kostelMusic = document.querySelector('#kostelMusic');
        if (kostelMusic) {
            kostelMusic.pause();
        }
    },

    unmuteAllSounds() {
        const sounds = document.querySelectorAll('audio');
        sounds.forEach(sound => {
            sound.muted = false;
        });
        
        // Инициализируем звуки opening-a-book.wav для геометок
        this.initializeGeoMarkerSounds();
        
        // Включаем iframe музыку
        if (window.unmuteIframeMusic) {
            window.unmuteIframeMusic();
        }
        
        // Определяем, какая музыка должна играть на основе текущей страницы
        const currentPage = window.spaManager ? window.spaManager.currentPage : null;
        
        if (currentPage && currentPage.includes('tumski19.html')) {
            // Запускаем kostel.mp3 для tumski19
            const kostelMusic = document.querySelector('#kostelMusic');
            if (kostelMusic) {
                // Добавляем обработчик зацикливания, если его еще нет
                if (!kostelMusic.hasAttribute('data-loop-handler-added')) {
                    kostelMusic.addEventListener('ended', () => {
                        const isMuted = localStorage.getItem('soundMuted') === 'true';
                        if (!isMuted) {
                            kostelMusic.currentTime = 0;
                            kostelMusic.play().catch((error) => handleLanguageMenuAudioPlayRejection('kostel loop', error));
                        }
                    });
                    kostelMusic.setAttribute('data-loop-handler-added', 'true');
                }
                
                kostelMusic.play().catch((error) => handleLanguageMenuAudioPlayRejection('kostel unmute', error));
            }
        } else if (currentPage && currentPage.includes('tumski21.html')) {
            // Запускаем hang.mp3 для tumski21
            const hangMusic = document.querySelector('#hangMusic');
            if (hangMusic) {
                // Добавляем обработчик зацикливания, если его еще нет
                if (!hangMusic.hasAttribute('data-loop-handler-added')) {
                    hangMusic.addEventListener('ended', () => {
                        const isMuted = localStorage.getItem('soundMuted') === 'true';
                        if (!isMuted) {
                            hangMusic.currentTime = 0;
                            hangMusic.play().catch((error) => handleLanguageMenuAudioPlayRejection('hang loop', error));
                        }
                    });
                    hangMusic.setAttribute('data-loop-handler-added', 'true');
                }
                
                hangMusic.play().catch((error) => handleLanguageMenuAudioPlayRejection('hang unmute', error));
            }
        } else {
            // Запускаем town.mp3 для остальных страниц
            const backgroundMusic = document.querySelector('#backgroundMusic');
            if (backgroundMusic) {
                // Добавляем обработчик зацикливания, если его еще нет
                if (!backgroundMusic.hasAttribute('data-loop-handler-added')) {
                    backgroundMusic.addEventListener('ended', () => {
                        const isMuted = localStorage.getItem('soundMuted') === 'true';
                        if (!isMuted) {
                            backgroundMusic.currentTime = 0;
                            backgroundMusic.play().catch((error) => handleLanguageMenuAudioPlayRejection('town loop', error));
                        }
                    });
                    backgroundMusic.setAttribute('data-loop-handler-added', 'true');
                }
                
                backgroundMusic.play().catch((error) => handleLanguageMenuAudioPlayRejection('town unmute', error));
            }
        }
    },

    toggleDropdown() {
        // Проверяем, не отключено ли меню
        if (this.isMenuDisabled()) {
    // console.log('🚫 Language menu отключен, игнорируем клик');
            return;
        }
        
        const dropdown = document.querySelector('.language-dropdown');
        dropdown.classList.toggle('show');
    },

    async changeLang(lang) {
        // Проверяем, не отключено ли меню
        if (this.isMenuDisabled()) {
    // console.log('🚫 Language menu отключен, игнорируем смену языка');
            return;
        }
        
        await window.i18n.changeLang(lang);
        localStorage.setItem('selectedLanguage', lang);
        document.querySelector('.language-dropdown').classList.remove('show');
        this.updateActiveLanguage();

        // Отправляем сообщение о смене языка в iframe
        this.sendLanguageChangeToIframe(lang);

        // Обновляем текст подсказки на карте, если модалка открыта
        const mapModal = document.getElementById('map-modal');
        if (mapModal && mapModal.style.display === 'flex') {
            if (window.updateMapTooltipText) window.updateMapTooltipText();
        }
        
        // Обновляем локализацию в активном iframe
        this.updateIframeLocalization(lang);
        
        // Дополнительно обновляем размеры контейнеров после смены языка
        if (window.updateContentWrapperSizesAfterLanguageChange) {
            // Увеличиваем задержку для гарантии, что все переводы загрузились
            setTimeout(() => {
                window.updateContentWrapperSizesAfterLanguageChange();
            }, 200);
        }
    },

    updateActiveLanguage() {
        const currentLang = window.i18n.getCurrentLang();
        document.querySelectorAll('.language-option').forEach(option => {
            option.classList.toggle('active', option.getAttribute('data-lang') === currentLang);
        });
    },

    updateIframeLocalization(lang) {
    // console.log('🌐 Обновляем локализацию в iframe для языка:', lang);
        
        // Находим активный iframe
        const activeIframe = this.getActiveIframe();
        if (!activeIframe) {
    // console.log('🌐 Активный iframe не найден');
            return;
        }
        
        try {
            const iframeDoc = activeIframe.contentDocument || activeIframe.contentWindow.document;
            
            // Отправляем сообщение в iframe для обновления локализации
            if (iframeDoc && iframeDoc.defaultView) {
                // Пытаемся вызвать функцию обновления локализации в iframe
                if (typeof iframeDoc.defaultView.i18n !== 'undefined' && 
                    typeof iframeDoc.defaultView.i18n.changeLang === 'function') {
    // console.log('🌐 Вызываем changeLang в iframe');
                    iframeDoc.defaultView.i18n.changeLang(lang);
                } else {
    // console.log('🌐 i18n не найден в iframe, отправляем сообщение');
                    // Отправляем сообщение через postMessage
                    postMessageToIframe(activeIframe, getMessageType('LANGUAGE_CHANGE', 'LANGUAGE_CHANGE'), {
                        lang: lang
                    });
                }
            }
        } catch (error) {
    // console.log('🌐 Ошибка доступа к iframe:', error);
            // Fallback: отправляем сообщение через postMessage
            try {
                postMessageToIframe(activeIframe, getMessageType('LANGUAGE_CHANGE', 'LANGUAGE_CHANGE'), {
                    lang: lang
                });
            } catch (postError) {
    // console.log('🌐 Ошибка отправки сообщения в iframe:', postError);
            }
        }
    },

    sendLanguageChangeToIframe(lang) {
    // console.log('🌐 Отправляем сообщение о смене языка в iframe:', lang);
        
        // Находим активный iframe
        const activeIframe = this.getActiveIframe();
        if (!activeIframe) {
    // console.log('🌐 Активный iframe не найден для отправки сообщения');
            return;
        }
        
        try {
            // Отправляем сообщение через postMessage
            postMessageToIframe(activeIframe, getMessageType('LANGUAGE_CHANGE', 'LANGUAGE_CHANGE'), {
                lang: lang
            });
    // console.log('🌐 Сообщение отправлено в iframe');
        } catch (error) {
    // console.log('🌐 Ошибка отправки сообщения в iframe:', error);
        }
    },

    showSoundHint() {
        // Получаем текст подсказки из локализации
        const hintText = window.i18n ? window.i18n.t('music.enable_sound_hint') : 'Включить звуки';
        
        // Находим кнопку звука и language-menu
        const soundButton = document.querySelector('.sound-menu-button');
        const languageMenu = document.querySelector('.language-menu');
        
        if (!soundButton || !languageMenu) {
    // console.log('⚠️ Не найдены элементы для показа подсказки');
            return;
        }
        
        // Получаем позицию language-menu
        const menuRect = languageMenu.getBoundingClientRect();
        
        // Создаем элемент подсказки
        const hint = document.createElement('div');
        hint.className = 'sound-hint';
        hint.textContent = hintText;
        hint.style.cssText = `
            position: fixed;
            top: ${menuRect.bottom + 10}px;
            left: ${menuRect.left}px;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 8px 16px;
            border-radius: 6px;
            z-index: 10001;
            font-size: 13px;
            text-align: center;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
            white-space: nowrap;
            opacity: 0;
            transform: translateY(-10px);
            transition: all 0.5s ease-in-out;
            pointer-events: none;
        `;
        
        // Добавляем подсказку на страницу
        document.body.appendChild(hint);
        
        // Медленно проявляем подсказку
        setTimeout(() => {
            hint.style.opacity = '1';
            hint.style.transform = 'translateY(0)';
        }, 100);
        
        // Отмечаем, что подсказка была показана
        localStorage.setItem('soundHintShown', 'true');
        
        // Держим подсказку 2 секунды, затем медленно исчезаем
        setTimeout(() => {
            hint.style.opacity = '0';
            hint.style.transform = 'translateY(-10px)';
            
            // Удаляем подсказку после анимации исчезновения
            setTimeout(() => {
                if (hint.parentNode) {
                    hint.remove();
                }
            }, 500);
        }, 2000);
    },

    initializeGeoMarkerSounds() {
    // console.log('🎵 Инициализируем звуки геометок...');
        
        // Находим все аудио элементы с opening-a-book.wav
        const geoMarkerSounds = document.querySelectorAll('audio[src*="opening-a-book.wav"]');
    // console.log('🎵 Найдено звуков геометок:', geoMarkerSounds.length);
        
        geoMarkerSounds.forEach((audio, index) => {
            try {
                // Устанавливаем правильный источник звука
                if (!audio.src || !audio.src.includes('opening-a-book.wav')) {
                    audio.src = 'media/opening-a-book.wav';
                }
                
                // Предзагружаем звук
                audio.preload = 'auto';
                audio.load();
                
                // Принудительно инициализируем звук для обхода блокировки браузера
                audio.muted = false;
                audio.volume = 1.0;
                
                // Принудительно воспроизводим короткий звук для инициализации
                audio.currentTime = 0;
                audio.play().then(() => {
                    // Сразу ставим на паузу и сбрасываем время
                    audio.pause();
                    audio.currentTime = 0;
    // console.log(`🎵 Звук геометки ${index + 1} принудительно инициализирован:`, audio.src);
                }).catch(error => {
    // console.log(`🎵 Ошибка принудительной инициализации звука геометки:`, error);
                });
                
                // Дополнительно ставим на паузу сразу после play() для гарантии
                setTimeout(() => {
                    audio.pause();
                    audio.currentTime = 0;
                }, 10);
            } catch (error) {
    // console.log('🎵 Ошибка инициализации звука геометки:', error);
            }
        });
        
        // Quest музыка инициализируется только при открытии геометки квеста
        
        // Также инициализируем звуки в iframe, если он загружен
        const activeIframe = this.getActiveIframe();
        if (activeIframe) {
            try {
                const iframeDoc = activeIframe.contentDocument || activeIframe.contentWindow.document;
                const iframeSounds = iframeDoc.querySelectorAll('audio[src*="opening-a-book.wav"]');
                
    // console.log('🎵 Найдено звуков геометок в iframe:', iframeSounds.length);
                
                iframeSounds.forEach((audio, index) => {
                    try {
                        if (!audio.src || !audio.src.includes('opening-a-book.wav')) {
                            audio.src = 'media/opening-a-book.wav';
                        }
                        audio.preload = 'auto';
                        audio.load();
                        
                        // Принудительно инициализируем звук для обхода блокировки браузера
                        audio.muted = false;
                        audio.volume = 1.0;
                        
    // console.log(`🎵 Звук геометки в iframe ${index + 1} инициализирован:`, audio.src);
                    } catch (error) {
    // console.log('🎵 Ошибка инициализации звука геометки в iframe:', error);
                    }
                });
                
                // Quest музыка в iframe инициализируется только при открытии геометки квеста
            } catch (error) {
    // console.log('🎵 Не удалось получить доступ к iframe для инициализации звуков:', error);
            }
        }
        
        // Дополнительно: инициализируем звуки во всех iframe на странице
        const allIframes = document.querySelectorAll('iframe');
        allIframes.forEach((iframe, iframeIndex) => {
            try {
                const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                const iframeSounds = iframeDoc.querySelectorAll('audio[src*="opening-a-book.wav"]');
                
                if (iframeSounds.length > 0) {
    // console.log(`🎵 Инициализируем звуки в iframe ${iframeIndex + 1}:`, iframeSounds.length);
                    
                    iframeSounds.forEach((audio, index) => {
                        try {
                            if (!audio.src || !audio.src.includes('opening-a-book.wav')) {
                                audio.src = 'media/opening-a-book.wav';
                            }
                            audio.preload = 'auto';
                            audio.load();
                            audio.muted = false;
                            audio.volume = 1.0;
                            
    // console.log(`🎵 Звук геометки в iframe ${iframeIndex + 1}, звук ${index + 1} инициализирован:`, audio.src);
                        } catch (error) {
    // console.log('🎵 Ошибка инициализации звука геометки в iframe:', error);
                        }
                    });
                }
                
                // Quest музыка в iframe инициализируется только при открытии геометки квеста
            } catch (error) {
    // console.log('🎵 Не удалось получить доступ к iframe для инициализации звуков:', error);
            }
        });
    },

    initializeQuestMusic() {
    // console.log('🎵 Инициализируем музыку quest...');
        window.QuestAudio.primeSharedQuestMusic();
    },

    getActiveIframe() {
        // Находим активную страницу и её iframe
        const activePage = document.querySelector('.page-content.active');
        if (activePage) {
            const iframe = activePage.querySelector('iframe');
            return iframe;
        }
        return null;
    },

    forceInitializeIframeSounds() {
    // console.log('🎵 Принудительно инициализируем звуки в iframe...');
        
        // Инициализируем звуки во всех iframe на странице
        const allIframes = document.querySelectorAll('iframe');
    // console.log('🎵 Найдено iframe:', allIframes.length);
        
        allIframes.forEach((iframe, iframeIndex) => {
            try {
                const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                const iframeSounds = iframeDoc.querySelectorAll('audio[src*="opening-a-book.wav"]');
                
                if (iframeSounds.length > 0) {
    // console.log(`🎵 Принудительно инициализируем звуки в iframe ${iframeIndex + 1}:`, iframeSounds.length);
                    
                    iframeSounds.forEach((audio, index) => {
                        try {
                            if (!audio.src || !audio.src.includes('opening-a-book.wav')) {
                                audio.src = 'media/opening-a-book.wav';
                            }
                            audio.preload = 'auto';
                            audio.load();
                            audio.muted = false;
                            audio.volume = 1.0;
                            
                            // Принудительно воспроизводим короткий звук для инициализации
                            audio.currentTime = 0;
                            audio.play().then(() => {
                                // Сразу ставим на паузу и сбрасываем время
                                audio.pause();
                                audio.currentTime = 0;
    // console.log(`🎵 Звук геометки в iframe ${iframeIndex + 1}, звук ${index + 1} принудительно инициализирован`);
                            }).catch(error => {
    // console.log(`🎵 Ошибка принудительной инициализации звука в iframe:`, error);
                            });
                            
                            // Дополнительно ставим на паузу сразу после play() для гарантии
                            setTimeout(() => {
                                audio.pause();
                                audio.currentTime = 0;
                            }, 10);
                            
                        } catch (error) {
    // console.log('🎵 Ошибка принудительной инициализации звука геометки в iframe:', error);
                        }
                    });
                }
                
                // Также инициализируем quest музыку в iframe
                this.initializeQuestMusicInIframe(iframeDoc, iframeIndex + 1);
            } catch (error) {
    // console.log('🎵 Не удалось получить доступ к iframe для принудительной инициализации звуков:', error);
            }
        });
        
        // Quest музыка инициализируется только при открытии геометки квеста
    },

    initializeQuestMusicInIframe(iframeDoc, iframeIndex) {
    // console.log(`🎵 Инициализируем quest музыку в iframe ${iframeIndex}...`);
        
        try {
            window.QuestAudio.attachSharedQuestMusicToFrame(iframeDoc, { prime: true });
    // console.log(`🎵 Quest музыка передана в iframe ${iframeIndex}`);
        } catch (error) {
    // console.log(`🎵 Ошибка инициализации quest музыки в iframe ${iframeIndex}:`, error);
        }
    },

    disableMenu() {
        const menu = document.querySelector('.language-menu');
        if (menu) {
            menu.classList.add('disabled');
    // console.log('🚫 Language menu отключен');
        } else {
    // console.log('⚠️ Language menu не найден для отключения');
        }
    },

    enableMenu() {
        const menu = document.querySelector('.language-menu');
        if (menu) {
            menu.classList.remove('disabled');
    // console.log('✅ Language menu включен');
        } else {
    // console.log('⚠️ Language menu не найден для включения');
        }
    },

    isMenuDisabled() {
        const menu = document.querySelector('.language-menu');
        return menu ? menu.classList.contains('disabled') : false;
    },

    // Создает кнопку разблокировки аудио
    createAudioUnlockButton() {
    // console.log('🎵 createAudioUnlockButton() вызван');
        
        // Проверяем, что мы на главной SPA странице (index.html)
        const isMainSPAPage = document.getElementById('spa-container') !== null;
        if (!isMainSPAPage) {
    // console.log('🎵 Не главная SPA страница, пропускаем создание кнопки разблокировки аудио');
            return;
        }
        
        // Проверяем, не создана ли уже кнопка
        if (document.getElementById('audioUnlockButton')) {
    // console.log('🎵 Кнопка разблокировки аудио уже существует');
            return;
        }
        
    // console.log('🎵 Создаем новую кнопку разблокировки аудио');

        // Создаем HTML для кнопки
        const buttonHTML = `
            <div id="audioUnlockButton" class="audio-unlock-button" style="display: none;">
                <div class="audio-unlock-content">
                    <div class="audio-unlock-icon">🎵</div>
                    <div class="audio-unlock-text" data-i18n="music.audio_unlock_text">Нажмите для включения музыки</div>
                </div>
            </div>
        `;

        // Добавляем кнопку на страницу
        document.body.insertAdjacentHTML('beforeend', buttonHTML);

        // Добавляем обработчик клика
        const audioUnlockButton = document.getElementById('audioUnlockButton');
    // console.log('🔍 Создана кнопка разблокировки аудио:', audioUnlockButton);
        
        if (audioUnlockButton) {
    // console.log('✅ Кнопка разблокировки аудио создана, добавляем обработчик');
            const self = this; // Сохраняем ссылку на объект LanguageMenu
            
            // Создаем обработчик
            this.handleAudioUnlockClick = function() {
    // console.log('🎵 Клик по кнопке разблокировки аудио в SPA');
                
                // Активируем кнопку звука в SPA
                const soundButton = document.querySelector('.sound-menu-button');
    // console.log('🔍 Поиск кнопки звука:', soundButton);
                
                if (soundButton) {
    // console.log('✅ Кнопка звука найдена, активируем...');
                    soundButton.classList.remove('muted');
                    localStorage.setItem('soundMuted', 'false');
    // console.log('🔊 Кнопка звука в SPA активирована, классы:', soundButton.className);
                } else {
    // console.log('❌ Кнопка звука не найдена!');
                }
                
                // Вызываем функцию включения звука из LanguageMenu
                self.unmuteAllSounds();
                
                // Отправляем сообщение в iframe для активации кнопки звука там
                const activeIframe = document.querySelector('iframe');
                if (activeIframe) {
                    try {
                        postMessageToIframe(activeIframe, getMessageType('AUDIO_UNLOCK_CLICKED', 'AUDIO_UNLOCK_CLICKED'), {
                            action: 'unmute'
                        });
    // console.log('🎵 Сообщение отправлено в iframe для активации звука');
                    } catch (error) {
    // console.log('🎵 Ошибка отправки сообщения в iframe:', error);
                    }
                }
                
                // Скрываем кнопку разблокировки аудио
                audioUnlockButton.style.display = 'none';
    // console.log('🎵 Кнопка разблокировки аудио в SPA скрыта');
            };
            
            // Добавляем обработчик
            audioUnlockButton.addEventListener('click', this.handleAudioUnlockClick);
        } else {
    // console.log('❌ Не удалось создать кнопку разблокировки аудио!');
        }
    },

    // Показать меню аккаунта
    showAccountMenu() {
        this.ensureAccountManagerReady(() => {
            if (window.userAccountManager && typeof window.userAccountManager.showAccountMenu === 'function') {
                window.userAccountManager.showAccountMenu();
            }
        });
    },

    // Гарантирует, что user_account.js загружен и менеджер доступен
    ensureAccountManagerReady(callback) {
        // Если уже есть менеджер — сразу выполняем
        if (window.userAccountManager) {
            callback && callback();
            return;
        }

        // Если класс доступен, но экземпляр не создан — создаем
        if (!window.userAccountManager && window.UserAccountManager) {
            try {
                window.userAccountManager = new window.UserAccountManager();
                callback && callback();
                return;
            } catch (err) {
                console.error('Не удалось создать экземпляр userAccountManager', err);
            }
        }

        // Проверяем, не загружаем ли уже скрипт
        let loader = document.querySelector('script[data-user-account-loader]');
        if (!loader) {
            loader = document.createElement('script');
            loader.src = 'user_account.js';
            loader.dataset.userAccountLoader = '1';
            loader.onload = () => {
                // Небольшая задержка, чтобы инициализировался менеджер
                setTimeout(() => callback && window.userAccountManager && callback(), 0);
            };
            loader.onerror = () => {
                console.error('Не удалось загрузить user_account.js');
            };
            document.head.appendChild(loader);
        } else {
            // Если уже грузится — пробуем позже
            setTimeout(() => {
                if (window.userAccountManager) {
                    callback && callback();
                }
            }, 150);
        }
    }
};

// Экспортируем объект LanguageMenu
window.LanguageMenu = LanguageMenu;
