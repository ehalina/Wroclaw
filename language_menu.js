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
`;

// Функции для работы с языковым меню
const LanguageMenu = {
    init() {
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
        // Проверяем сохраненное состояние звука
        const isMuted = localStorage.getItem('soundMuted') === 'true';
        const soundButton = document.querySelector('.sound-menu-button');
        if (soundButton) {
            if (isMuted) {
                soundButton.classList.add('muted');
                // Не вызываем muteAllSounds() здесь, так как это может помешать автозапуску музыки
                // Состояние будет применено после загрузки аудио элемента
            }
        }
        
        // Применяем состояние звука после небольшой задержки, чтобы аудио элемент успел загрузиться
        setTimeout(() => {
            if (isMuted) {
                this.muteAllSounds();
            }
        }, 1000);
    },

    toggleSound() {
        const soundButton = document.querySelector('.sound-menu-button');
        const isMuted = soundButton.classList.contains('muted');
        
        if (isMuted) {
            soundButton.classList.remove('muted');
            localStorage.setItem('soundMuted', 'false');
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
        const dropdown = document.querySelector('.language-dropdown');
        dropdown.classList.toggle('show');
    },

    async changeLang(lang) {
        await window.i18n.changeLang(lang);
        localStorage.setItem('selectedLanguage', lang);
        document.querySelector('.language-dropdown').classList.remove('show');
        this.updateActiveLanguage();

        // Обновляем текст подсказки на карте, если модалка открыта
        const mapModal = document.getElementById('map-modal');
        if (mapModal && mapModal.style.display === 'flex') {
            if (window.updateMapTooltipText) window.updateMapTooltipText();
        }
        
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
    }
};

// Экспортируем объект LanguageMenu
window.LanguageMenu = LanguageMenu; 