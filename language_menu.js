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

    .language-menu-button, .sound-menu-button {
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
    }

    .language-menu-button:hover, .sound-menu-button:hover {
        background: rgba(0, 0, 0, 0.9);
    }

    .language-menu-button img, .sound-menu-button img {
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
        pointer-events: none;
        opacity: 0.3;
        transition: opacity 0.3s ease;
    }

    .language-menu.disabled .language-menu-button,
    .language-menu.disabled .sound-menu-button {
        cursor: not-allowed;
        opacity: 0.3;
        pointer-events: none;
    }
`;

// Функции для работы с языковым меню
const LanguageMenu = {
    init() {
        // Проверяем, не инициализировано ли уже меню
        if (document.querySelector('.language-menu')) {
            console.log('🔧 Language menu уже инициализирован, пропускаем повторную инициализацию');
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
                <button class="sound-menu-button" onclick="LanguageMenu.toggleSound()">
                    <img src="media/sound.jpg" alt="Sound" class="sound-icon">
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
                soundButton.classList.add('muted');
                localStorage.setItem('soundMuted', 'true');
                // Добавляем небольшую задержку, чтобы локализация успела загрузиться
                setTimeout(() => {
                    this.showSoundHint();
                }, 500);
            } else if (isMuted) {
                soundButton.classList.add('muted');
            }
        }
        
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

    toggleSound() {
        // Проверяем, не отключено ли меню
        if (this.isMenuDisabled()) {
            console.log('🚫 Language menu отключен, игнорируем клик по кнопке звука');
            return;
        }
        
        const soundButton = document.querySelector('.sound-menu-button');
        const isMuted = soundButton.classList.contains('muted');
        
        if (isMuted) {
            soundButton.classList.remove('muted');
            localStorage.setItem('soundMuted', 'false');
            
        // Инициализируем звуки геометок при первом включении звука
        console.log('🎵 Включаем звук - инициализируем звуки геометок...');
        this.initializeGeoMarkerSounds();
        
        // Принудительно инициализируем звуки в iframe при первом клике
        this.forceInitializeIframeSounds();
        
        this.unmuteAllSounds();
        } else {
            soundButton.classList.add('muted');
            localStorage.setItem('soundMuted', 'true');
            this.muteAllSounds();
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
                            kostelMusic.play().catch(console.log);
                        }
                    });
                    kostelMusic.setAttribute('data-loop-handler-added', 'true');
                }
                
                kostelMusic.play().catch(console.log);
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
                            hangMusic.play().catch(console.log);
                        }
                    });
                    hangMusic.setAttribute('data-loop-handler-added', 'true');
                }
                
                hangMusic.play().catch(console.log);
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
                            backgroundMusic.play().catch(console.log);
                        }
                    });
                    backgroundMusic.setAttribute('data-loop-handler-added', 'true');
                }
                
                backgroundMusic.play().catch(console.log);
            }
        }
    },

    toggleDropdown() {
        // Проверяем, не отключено ли меню
        if (this.isMenuDisabled()) {
            console.log('🚫 Language menu отключен, игнорируем клик');
            return;
        }
        
        const dropdown = document.querySelector('.language-dropdown');
        dropdown.classList.toggle('show');
    },

    async changeLang(lang) {
        // Проверяем, не отключено ли меню
        if (this.isMenuDisabled()) {
            console.log('🚫 Language menu отключен, игнорируем смену языка');
            return;
        }
        
        await window.i18n.changeLang(lang);
        localStorage.setItem('selectedLanguage', lang);
        document.querySelector('.language-dropdown').classList.remove('show');
        this.updateActiveLanguage();

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
        console.log('🌐 Обновляем локализацию в iframe для языка:', lang);
        
        // Находим активный iframe
        const activeIframe = this.getActiveIframe();
        if (!activeIframe) {
            console.log('🌐 Активный iframe не найден');
            return;
        }
        
        try {
            const iframeDoc = activeIframe.contentDocument || activeIframe.contentWindow.document;
            
            // Отправляем сообщение в iframe для обновления локализации
            if (iframeDoc && iframeDoc.defaultView) {
                // Пытаемся вызвать функцию обновления локализации в iframe
                if (typeof iframeDoc.defaultView.i18n !== 'undefined' && 
                    typeof iframeDoc.defaultView.i18n.changeLang === 'function') {
                    console.log('🌐 Вызываем changeLang в iframe');
                    iframeDoc.defaultView.i18n.changeLang(lang);
                } else {
                    console.log('🌐 i18n не найден в iframe, отправляем сообщение');
                    // Отправляем сообщение через postMessage
                    activeIframe.contentWindow.postMessage({
                        type: 'LANGUAGE_CHANGE',
                        lang: lang
                    }, '*');
                }
            }
        } catch (error) {
            console.log('🌐 Ошибка доступа к iframe:', error);
            // Fallback: отправляем сообщение через postMessage
            try {
                activeIframe.contentWindow.postMessage({
                    type: 'LANGUAGE_CHANGE',
                    lang: lang
                }, '*');
            } catch (postError) {
                console.log('🌐 Ошибка отправки сообщения в iframe:', postError);
            }
        }
    },

    showSoundHint() {
        // Получаем текст подсказки из локализации
        const hintText = window.i18n ? window.i18n.t('music.enable_sound_hint') : 'Включить звуки';
        
        // Создаем элемент подсказки
        const hint = document.createElement('div');
        hint.className = 'sound-hint';
        hint.textContent = hintText;
        hint.style.cssText = `
            position: fixed;
            top: 20px;
            right: 90px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px 20px;
            border-radius: 8px;
            z-index: 10001;
            font-size: 14px;
            text-align: center;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
            animation: fadeInOut 3s ease-in-out;
        `;
        
        // Добавляем CSS анимацию
        if (!document.querySelector('#sound-hint-styles')) {
            const style = document.createElement('style');
            style.id = 'sound-hint-styles';
            style.textContent = `
                @keyframes fadeInOut {
                    0% { opacity: 0; transform: translateY(-10px); }
                    20% { opacity: 1; transform: translateY(0); }
                    80% { opacity: 1; transform: translateY(0); }
                    100% { opacity: 0; transform: translateY(-10px); }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Добавляем подсказку на страницу
        document.body.appendChild(hint);
        
        // Отмечаем, что подсказка была показана
        localStorage.setItem('soundHintShown', 'true');
        
        // Удаляем подсказку через 3 секунды
        setTimeout(() => {
            if (hint.parentNode) {
                hint.remove();
            }
        }, 3000);
    },

    initializeGeoMarkerSounds() {
        console.log('🎵 Инициализируем звуки геометок...');
        
        // Находим все аудио элементы с opening-a-book.wav
        const geoMarkerSounds = document.querySelectorAll('audio[src*="opening-a-book.wav"]');
        console.log('🎵 Найдено звуков геометок:', geoMarkerSounds.length);
        
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
                    audio.pause();
                    audio.currentTime = 0;
                    console.log(`🎵 Звук геометки ${index + 1} принудительно инициализирован:`, audio.src);
                }).catch(error => {
                    console.log(`🎵 Ошибка принудительной инициализации звука геометки:`, error);
                });
            } catch (error) {
                console.log('🎵 Ошибка инициализации звука геометки:', error);
            }
        });
        
        // Также инициализируем звуки в iframe, если он загружен
        const activeIframe = this.getActiveIframe();
        if (activeIframe) {
            try {
                const iframeDoc = activeIframe.contentDocument || activeIframe.contentWindow.document;
                const iframeSounds = iframeDoc.querySelectorAll('audio[src*="opening-a-book.wav"]');
                
                console.log('🎵 Найдено звуков геометок в iframe:', iframeSounds.length);
                
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
                        
                        console.log(`🎵 Звук геометки в iframe ${index + 1} инициализирован:`, audio.src);
                    } catch (error) {
                        console.log('🎵 Ошибка инициализации звука геометки в iframe:', error);
                    }
                });
            } catch (error) {
                console.log('🎵 Не удалось получить доступ к iframe для инициализации звуков:', error);
            }
        }
        
        // Дополнительно: инициализируем звуки во всех iframe на странице
        const allIframes = document.querySelectorAll('iframe');
        allIframes.forEach((iframe, iframeIndex) => {
            try {
                const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                const iframeSounds = iframeDoc.querySelectorAll('audio[src*="opening-a-book.wav"]');
                
                if (iframeSounds.length > 0) {
                    console.log(`🎵 Инициализируем звуки в iframe ${iframeIndex + 1}:`, iframeSounds.length);
                    
                    iframeSounds.forEach((audio, index) => {
                        try {
                            if (!audio.src || !audio.src.includes('opening-a-book.wav')) {
                                audio.src = 'media/opening-a-book.wav';
                            }
                            audio.preload = 'auto';
                            audio.load();
                            audio.muted = false;
                            audio.volume = 1.0;
                            
                            console.log(`🎵 Звук геометки в iframe ${iframeIndex + 1}, звук ${index + 1} инициализирован:`, audio.src);
                        } catch (error) {
                            console.log('🎵 Ошибка инициализации звука геометки в iframe:', error);
                        }
                    });
                }
            } catch (error) {
                console.log('🎵 Не удалось получить доступ к iframe для инициализации звуков:', error);
            }
        });
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
        console.log('🎵 Принудительно инициализируем звуки в iframe...');
        
        // Инициализируем звуки во всех iframe на странице
        const allIframes = document.querySelectorAll('iframe');
        console.log('🎵 Найдено iframe:', allIframes.length);
        
        allIframes.forEach((iframe, iframeIndex) => {
            try {
                const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                const iframeSounds = iframeDoc.querySelectorAll('audio[src*="opening-a-book.wav"]');
                
                if (iframeSounds.length > 0) {
                    console.log(`🎵 Принудительно инициализируем звуки в iframe ${iframeIndex + 1}:`, iframeSounds.length);
                    
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
                                audio.pause();
                                audio.currentTime = 0;
                                console.log(`🎵 Звук геометки в iframe ${iframeIndex + 1}, звук ${index + 1} принудительно инициализирован`);
                            }).catch(error => {
                                console.log(`🎵 Ошибка принудительной инициализации звука в iframe:`, error);
                            });
                            
                        } catch (error) {
                            console.log('🎵 Ошибка принудительной инициализации звука геометки в iframe:', error);
                        }
                    });
                }
            } catch (error) {
                console.log('🎵 Не удалось получить доступ к iframe для принудительной инициализации звуков:', error);
            }
        });
    },

    disableMenu() {
        const menu = document.querySelector('.language-menu');
        if (menu) {
            menu.classList.add('disabled');
            console.log('🚫 Language menu отключен');
        } else {
            console.log('⚠️ Language menu не найден для отключения');
        }
    },

    enableMenu() {
        const menu = document.querySelector('.language-menu');
        if (menu) {
            menu.classList.remove('disabled');
            console.log('✅ Language menu включен');
        } else {
            console.log('⚠️ Language menu не найден для включения');
        }
    },

    isMenuDisabled() {
        const menu = document.querySelector('.language-menu');
        return menu ? menu.classList.contains('disabled') : false;
    }
};

// Экспортируем объект LanguageMenu
window.LanguageMenu = LanguageMenu; 