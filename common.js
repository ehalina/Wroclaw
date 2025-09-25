/**
 * Проверяет, включен ли звук
 * @returns {boolean} true если звук включен, false если выключен
 */
function isSoundEnabled() {
    // Сначала проверяем состояние кнопки звука (приоритет)
    const soundButton = document.querySelector('.sound-menu-button');
    if (soundButton) {
        return !soundButton.classList.contains('muted');
    }
    
    // Если кнопка не найдена, проверяем localStorage
    const soundMuted = localStorage.getItem('soundMuted');
    // По умолчанию звук включен (если значение не установлено или 'false')
    return soundMuted !== 'true';
}

// Общие константы
const COMMON_ELEMENTS = {
    SCENE: '.scene',
    IMAGE_CONTAINER: '.image-container',
    NEXT_IMAGE_CONTAINER: '.next-image-container',
    IMAGE: '.image',
    CURSOR: '.custom-cursor',
    CURSOR_AREA: '.custom-cursor-area',
    CURSOR_PROSTO: '.custom-cursor-prosto',
    CURSOR_PROSTO_AREA: '.custom-cursor-prostoarea',
    CURSOR_BACK: '.custom-cursor-back',
    CURSOR_BACK_AREA: '.custom-cursor-backarea',
    BOOK_OVERLAY: '.book-overlay',
    MOST_OVERLAY: '.most-overlay',
    CLOSE_BUTTON: '.close-button',
    BOOK_CONTENT: '.book-content',
    SCROLL_INDICATOR: '.scroll-indicator',
    LANGUAGE_SWITCHER: '.language-switcher',
    LANGUAGE_BUTTON: '.language-button',
    LANGUAGE_DROPDOWN: '.language-dropdown',
    LANGUAGE_OPTION: '.language-option'
};

// Общие функции для работы с анимацией
function setupResetAnimation(container) {
    let doubleClickTimeout;
    
    // Добавляем обработчик двойного клика
    document.addEventListener('dblclick', function(e) {
        // Проверяем, что клик не по элементам управления
        if (!e.target.closest('.back-link') && 
            !e.target.closest('.language-switcher') && 
            !e.target.closest('.book-overlay') && 
            !e.target.closest('.most-overlay')) {
            
            // Предотвращаем множественные срабатывания
            clearTimeout(doubleClickTimeout);
            
            // Добавляем класс для сброса анимации
            container.classList.add('reset-animation');
            
            // Убираем класс через 100мс
            setTimeout(() => {
                container.classList.remove('reset-animation');
            }, 100);
            
            // Дополнительная защита: принудительно обновляем mapMarks после двойного тапа
            doubleClickTimeout = setTimeout(() => {
                if (window.updateMapMarksVisibility) {
                    console.log('🔄 Принудительное обновление mapMarks после двойного тапа');
                    window.updateMapMarksVisibility();
                }
            }, 200);
        }
    });
}

// Общие функции для работы со стрелками
function setupRightArrowHandler(cursor, cursorArea, stepSound, nextPageCallback) {
    // Проверяем наличие необходимых элементов
    if (!cursor || !cursorArea) {
        return;
    }

    // Обработчик движения мыши над областью курсора
    cursorArea.addEventListener('mousemove', function(e) {
        const rect = this.getBoundingClientRect();
        if (e.clientX >= rect.left && e.clientX <= rect.right &&
            e.clientY >= rect.top && e.clientY <= rect.bottom) {
            cursor.style.opacity = '1';
            cursor.style.left = e.clientX - 32 + 'px';
            cursor.style.top = e.clientY - 32 + 'px';
        } else {
            cursor.style.opacity = '0';
        }
    });

    // Обработчик движения мыши по всему документу
    document.addEventListener('mousemove', function(e) {
        const rect = cursorArea.getBoundingClientRect();
        if (!(e.clientX >= rect.left && e.clientX <= rect.right &&
            e.clientY >= rect.top && e.clientY <= rect.bottom)) {
            cursor.style.opacity = '0';
        }
    });

    // Скрываем курсор при уходе мыши из области
    cursorArea.addEventListener('mouseleave', function() {
        cursor.style.opacity = '0';
    });

    // Обработчик клика по стрелке вправо
    cursorArea.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();

        try {
            hideAllCursors();
            
            if (stepSound && isSoundEnabled()) {
                stepSound.currentTime = 0;
                stepSound.play();
            }
            
            // Получаем элементы для анимации
            const imageContainer = document.querySelector('.image-container');
            const currentImage = document.querySelector('.image');
            const nextImageContainer = document.querySelector('.next-image-container-Right');
            


            if (!imageContainer || !currentImage || !nextImageContainer) {
                return;
            }

            // Показываем следующее изображение
            nextImageContainer.style.opacity = '1';
            
            // Запускаем анимацию перехода
            imageContainer.style.animationPlayState = 'paused';
            imageContainer.classList.add('zoom-transition-Right');
            
            // После завершения анимации переходим на следующую страницу
            setTimeout(() => {
                if (typeof nextPageCallback === 'function') {
                    nextPageCallback();
                }
            }, 1500);
            
        } catch (error) {
            // Ошибка при обработке клика
        }
    });
}



function setupBackArrowHandler(cursorBack, cursorBackArea, stepSound, prevPageCallback) {
    // Обработчик движения мыши над областью курсора
    cursorBackArea.addEventListener('mousemove', function(e) {
        const rect = this.getBoundingClientRect();
        if (e.clientX >= rect.left && e.clientX <= rect.right &&
            e.clientY >= rect.top && e.clientY <= rect.bottom) {
            cursorBack.style.opacity = '1';
            cursorBack.style.left = e.clientX - 32 + 'px';
            cursorBack.style.top = e.clientY - 32 + 'px';
        } else {
            cursorBack.style.opacity = '0';
        }
    });

    // Обработчик движения мыши по всему документу
    document.addEventListener('mousemove', function(e) {
        const rect = cursorBackArea.getBoundingClientRect();
        if (!(e.clientX >= rect.left && e.clientX <= rect.right &&
            e.clientY >= rect.top && e.clientY <= rect.bottom)) {
            cursorBack.style.opacity = '0';
        }
    });

    // Скрываем курсор при уходе мыши из области
    cursorBackArea.addEventListener('mouseleave', function() {
        cursorBack.style.opacity = '0';
    });

    // Обработчик клика по стрелке назад
    cursorBackArea.addEventListener('click', function() {
        hideAllCursors();
        if (stepSound && isSoundEnabled()) {
            stepSound.currentTime = 0;
            stepSound.play();
        }
        
        setTimeout(() => {
            if (typeof prevPageCallback === 'function') {
                prevPageCallback();
            }
        }, 300);
    });
}


// Общие функции для работы с книгой
function openBook(bookSound, bookOverlay, container, bookContent, toggleScrollIndicator) {
    
    if (window.playMapSound) window.playMapSound();
    
    // Воспроизводим звук открытия книги только если звук включен
    if (bookSound && isSoundEnabled()) {
        bookSound.currentTime = 0;
        bookSound.play().catch(console.log);
    }
    
    bookOverlay.style.display = 'flex';
    container.style.animationPlayState = 'paused';
    bookContent.scrollTop = 0;
    setTimeout(toggleScrollIndicator, 100);
    
    // Отключаем language-menu при открытии модалки
    if (window.LanguageMenu && typeof window.LanguageMenu.disableMenu === 'function') {
        window.LanguageMenu.disableMenu();
    }
    
    // Добавляем смещение для мобильной версии
    if (window.innerWidth <= 768) {
        const bookContentArea = bookOverlay.querySelector('.book-content-area');
        if (bookContentArea) {
            bookContentArea.style.top = '1000px';
        }
    }
}

function openMost(bookSound, mostOverlay, container, mostTitle) {
    if (window.playMapSound) window.playMapSound();
    
    // Воспроизводим звук открытия книги только если звук включен
    if (bookSound && isSoundEnabled()) {
        bookSound.currentTime = 0;
        bookSound.play().catch(console.log);
    }
    
    mostOverlay.style.display = 'flex';
    container.style.animationPlayState = 'paused';
    
    // Отключаем language-menu при открытии модалки
    if (window.LanguageMenu && typeof window.LanguageMenu.disableMenu === 'function') {
        window.LanguageMenu.disableMenu();
    }
}

function resumeAnimation(bookOverlay, mostOverlay, container) {
    bookOverlay.style.display = 'none';
    mostOverlay.style.display = 'none';
    container.style.animationPlayState = 'running';
    
    // Включаем language-menu при закрытии модалки
    if (window.LanguageMenu && typeof window.LanguageMenu.enableMenu === 'function') {
        window.LanguageMenu.enableMenu();
    }
    
    // Сбрасываем сдвиг для планшетов при закрытии модалки
    const isTablet = window.matchMedia('(hover: none) and (pointer: coarse) and (min-width: 768px)').matches;
    if (isTablet) {
        const closeButton = bookOverlay.querySelector('.close-button');
        const mapQuestButtons = document.querySelector('.map-and-quest-buttons');
        const languageMenu = document.querySelector('.language-menu');
        
        if (closeButton) {
            closeButton.style.transform = '';
        }
        if (mapQuestButtons) {
            // Сдвигаем меню вниз на половину высоты кнопки и оставляем в этом положении
            const buttonHeight = 70; // Высота кнопки (64px + отступы)
            const offset = buttonHeight / 2; // Половина высоты кнопки (35px)
            mapQuestButtons.style.transform = `translateY(${offset}px)`;
        }
        if (languageMenu) {
            // Сдвигаем language-menu вниз на половину высоты кнопки и оставляем в этом положении
            const buttonHeight = 70; // Высота кнопки (64px + отступы)
            const offset = buttonHeight / 2; // Половина высоты кнопки (35px)
            languageMenu.style.transform = `translateY(${offset}px)`;
        }
    }
}

// Общие функции для работы с языком
function toggleLanguageDropdown() {
    const dropdown = document.querySelector(COMMON_ELEMENTS.LANGUAGE_DROPDOWN);
    dropdown.classList.toggle('show');

    // Добавляем обработчик закрытия только один раз
    if (!toggleLanguageDropdown._handlerAdded) {
        document.addEventListener('click', function closeDropdown(e) {
            // Если клик вне language-switcher, закрываем меню
            if (!e.target.closest(COMMON_ELEMENTS.LANGUAGE_SWITCHER)) {
                dropdown.classList.remove('show');
            }
        });
        toggleLanguageDropdown._handlerAdded = true;
    }
}

async function changeLang(lang) {
    await window.i18n.changeLang(lang);
    document.querySelector(COMMON_ELEMENTS.LANGUAGE_DROPDOWN).classList.remove('show');
    this.updateActiveLanguage();

    // Обновляем текст подсказки на карте, если модалка открыта
    const mapModal = document.getElementById('map-modal');
    if (mapModal && mapModal.style.display === 'flex') {
        if (window.updateMapTooltipText) window.updateMapTooltipText();
    }
}

function updateActiveLanguage() {
    const currentLang = window.i18n.getCurrentLang();
    document.querySelectorAll(COMMON_ELEMENTS.LANGUAGE_OPTION).forEach(option => {
        option.classList.toggle('active', option.getAttribute('data-lang') === currentLang);
    });
}

// Общие функции для работы с прокруткой
function setupScrollHandlers(bookContent, scrollIndicator) {
    let autoScrollInterval;

    function toggleScrollIndicator() {
        if (bookContent.scrollHeight > bookContent.clientHeight) {
            scrollIndicator.style.display = 'block';
        } else {
            scrollIndicator.style.display = 'none';
        }
    }

    scrollIndicator.addEventListener('mouseenter', function() {
        bookContent.classList.add('show-scrollbar');
    });

    scrollIndicator.addEventListener('mouseleave', function() {
        if (!autoScrollInterval) {
            bookContent.classList.remove('show-scrollbar');
        }
    });

    scrollIndicator.addEventListener('click', function() {
        if (autoScrollInterval) {
            clearInterval(autoScrollInterval);
            autoScrollInterval = null;
            bookContent.classList.remove('show-scrollbar');
        } else {
            bookContent.classList.add('show-scrollbar');
            autoScrollInterval = setInterval(() => {
                if (bookContent.scrollTop + bookContent.clientHeight >= bookContent.scrollHeight) {
                    clearInterval(autoScrollInterval);
                    autoScrollInterval = null;
                    bookContent.classList.remove('show-scrollbar');
                    return;
                }
                bookContent.scrollTop += 1;
            }, 30);
        }
    });

    bookContent.addEventListener('wheel', function() {
        bookContent.classList.add('show-scrollbar');
        clearTimeout(this.scrollTimeout);
        this.scrollTimeout = setTimeout(() => {
            if (!autoScrollInterval) {
                bookContent.classList.remove('show-scrollbar');
            }
        }, 2000);
    });

    bookContent.addEventListener('scroll', function() {
        if (bookContent.scrollTop + bookContent.clientHeight >= bookContent.scrollHeight - 20) {
            scrollIndicator.style.display = 'none';
        }
    });

    bookContent.addEventListener('click', function() {
        if (autoScrollInterval) {
            clearInterval(autoScrollInterval);
            autoScrollInterval = null;
        }
    });

    return { toggleScrollIndicator };
}

// Функция для скрытия всех курсоров
function hideAllCursors() {
    document.querySelectorAll('.custom-cursor, .custom-cursor-area, .custom-cursor-prosto, .custom-cursor-prostoarea, .custom-cursor-back, .custom-cursor-backarea, .custom-cursor-up, .custom-cursor-uparea').forEach(element => {
        element.classList.add('hide-cursors');
    });
}

// Глобальная функция для обновления текста подсказки на карте
window.updateMapTooltipText = function() {
    const mapTooltip = document.getElementById('map-tooltip');
    if (mapTooltip && mapTooltip.style.display === 'block') {
        let tooltipText = 'Тумский мост';
        if (window.i18n && typeof window.i18n.t === 'function') {
            tooltipText = window.i18n.t('map.tumski_bridge');
        }
        mapTooltip.innerHTML = tooltipText;
    }
};

// Функция для обработки кликов по тексту и геометке "Тумский остров"
function setupTumskiIslandHandler(tumskiText, tumskiMark, bookSound, bookOverlay, container, bookContent, toggleScrollIndicator) {
    // Обработчик для текста "Тумский остров"
    if (tumskiText) {
        tumskiText.addEventListener('click', () => {
            openTumskiIslandBook(bookSound, bookOverlay, container, bookContent, toggleScrollIndicator);
        });
    }

    // Обработчик для геометки "Тумский остров"
    if (tumskiMark) {
        tumskiMark.addEventListener('click', () => {
            openTumskiIslandBook(bookSound, bookOverlay, container, bookContent, toggleScrollIndicator);
        });
    }
}

// Функция для открытия книги "Тумский остров"
function openTumskiIslandBook(bookSound, bookOverlay, container, bookContent, toggleScrollIndicator) {
    if (!bookOverlay.style.display || bookOverlay.style.display === 'none') {
        const bookTitle = bookOverlay.querySelector('.book-title');
        const bookText = bookOverlay.querySelector('.book-text');
        const bookImage = bookOverlay.querySelector('.book-image');
        // Устанавливаем изображение книги
        if (bookImage) {
            bookImage.src = 'media/book/book.jpg';
        }
        // Устанавливаем заголовок и текст из переводов
        if (window.i18n && typeof window.i18n.t === 'function') {
            const titleText = window.i18n.t('tumski.title');
            const descriptionText = window.i18n.t('tumski.description');
                    if (bookTitle) bookTitle.innerHTML = titleText;
        if (bookText) bookText.innerHTML = descriptionText;
        }
        Common.openBook(bookSound, bookOverlay, container, bookContent, toggleScrollIndicator);
    }
}

// Функция для обработки кликов по тексту и геометке "Тумский мост"
function setupTumskiMostHandler(tumskiMostText, tumskiMostMark, bookSound, mostOverlay, container, mostTitle) {
    if (tumskiMostText) {
        tumskiMostText.addEventListener('click', () => {
            openTumskiMostOverlay(bookSound, mostOverlay, container, mostTitle);
        });
    }
    if (tumskiMostMark) {
        tumskiMostMark.addEventListener('click', () => {
            openTumskiMostOverlay(bookSound, mostOverlay, container, mostTitle);
        });
    }
}

function openTumskiMostOverlay(bookSound, mostOverlay, container, mostTitle) {
    if (!mostOverlay.style.display || mostOverlay.style.display === 'none') {
        // Устанавливаем заголовок из переводов
        if (window.i18n && typeof window.i18n.t === 'function') {
            const titleText = window.i18n.t('tumski_most.title');
            if (mostTitle) mostTitle.innerHTML = titleText;
        }
        Common.openMost(bookSound, mostOverlay, container, mostTitle);
    }
}

// Экспорт функций и констант
window.Common = {
    COMMON_ELEMENTS,
    setupResetAnimation,
    setupRightArrowHandler,
    setupBackArrowHandler,
    setupTumskiIslandHandler,
    setupTumskiMostHandler,
    openBook,
    openMost,
    resumeAnimation,
    toggleLanguageDropdown,
    changeLang,
    updateActiveLanguage,
    setupScrollHandlers,
    hideAllCursors
};

// Делаем функцию isSoundEnabled доступной глобально
window.isSoundEnabled = isSoundEnabled; 