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
    // Добавляем обработчик двойного клика
    document.addEventListener('dblclick', function(e) {
        // Проверяем, что клик не по элементам управления
        if (!e.target.closest('.back-link') && 
            !e.target.closest('.language-switcher') && 
            !e.target.closest('.book-overlay') && 
            !e.target.closest('.most-overlay')) {
            // Добавляем класс для сброса анимации
            container.classList.add('reset-animation');
            // Убираем класс через 100мс
            setTimeout(() => {
                container.classList.remove('reset-animation');
            }, 100);
        }
    });
}

// Общие функции для работы со стрелками
function setupRightArrowHandler(cursor, cursorArea, stepSound, nextPageCallback) {
    // Проверяем наличие необходимых элементов
    if (!cursor || !cursorArea) {
        console.error('Элементы стрелки вправо не найдены');
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
            
            if (stepSound) {
                stepSound.currentTime = 0;
                stepSound.play();
            }
            
            // Получаем элементы для анимации
            const imageContainer = document.querySelector('.image-container');
            const currentImage = document.querySelector('.image');
            const nextImageContainer = document.querySelector('.next-image-container');
            
            if (!imageContainer || !currentImage || !nextImageContainer) {
                console.error('Не все элементы для анимации найдены');
                return;
            }

            // Запускаем анимацию перехода
            imageContainer.style.animationPlayState = 'paused';
            imageContainer.classList.add('zoom-transition');
            
            // Запускаем анимацию fade
            setTimeout(() => {
                currentImage.classList.add('fade-out');
                nextImageContainer.classList.add('fade-in');
                
                // Вызываем callback для перехода на следующую страницу
                setTimeout(() => {
                    if (typeof nextPageCallback === 'function') {
                        nextPageCallback();
                    }
                }, 500);
            }, 1000);
        } catch (error) {
            console.error('Ошибка при обработке клика:', error);
        }
    });
}

function setupForwardArrowHandler(cursorProsto, cursorProstoArea, stepSound, nextPageCallback) {
    // Проверяем наличие необходимых элементов
    if (!cursorProsto || !cursorProstoArea) {
        console.error('Элементы стрелки прямо не найдены');
        return;
    }

    // Обработчик движения мыши над областью курсора
    cursorProstoArea.addEventListener('mousemove', function(e) {
        const rect = this.getBoundingClientRect();
        if (e.clientX >= rect.left && e.clientX <= rect.right &&
            e.clientY >= rect.top && e.clientY <= rect.bottom) {
            cursorProsto.style.opacity = '1';
            cursorProsto.style.left = e.clientX - 32 + 'px';
            cursorProsto.style.top = e.clientY - 32 + 'px';
        } else {
            cursorProsto.style.opacity = '0';
        }
    });

    // Обработчик движения мыши по всему документу
    document.addEventListener('mousemove', function(e) {
        const rect = cursorProstoArea.getBoundingClientRect();
        if (!(e.clientX >= rect.left && e.clientX <= rect.right &&
            e.clientY >= rect.top && e.clientY <= rect.bottom)) {
            cursorProsto.style.opacity = '0';
        }
    });

    // Скрываем курсор при уходе мыши из области
    cursorProstoArea.addEventListener('mouseleave', function() {
        cursorProsto.style.opacity = '0';
    });

    // Обработчик клика по стрелке прямо
    cursorProstoArea.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();

        try {
            hideAllCursors();
            
            if (stepSound) {
                stepSound.currentTime = 0;
                stepSound.play();
            }
            
            // Получаем элементы для анимации
            const imageContainer = document.querySelector('.image-container');
            const currentImage = document.querySelector('.image');
            const nextImageContainer = document.querySelector('.next-image-container');
            
            if (!imageContainer || !currentImage || !nextImageContainer) {
                console.error('Не все элементы для анимации найдены');
                return;
            }

            // Показываем следующее изображение
            nextImageContainer.style.opacity = '1';
            
            // Добавляем класс для анимации
            imageContainer.classList.add('zoom-transition');
            
            // После завершения анимации переходим на следующую страницу
            setTimeout(() => {
                if (typeof nextPageCallback === 'function') {
                    nextPageCallback();
                }
            }, 1500);
            
        } catch (error) {
            console.error('Ошибка при обработке клика по стрелке прямо:', error);
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
        if (stepSound) {
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
    bookSound.currentTime = 0;
    bookSound.play();
    window.i18n.updatePageContent();
    bookOverlay.style.display = 'flex';
    container.style.animationPlayState = 'paused';
    bookContent.scrollTop = 0;
    setTimeout(toggleScrollIndicator, 100);
}

function openMost(bookSound, mostOverlay, container, mostTitle) {
    bookSound.currentTime = 0;
    bookSound.play();
    mostOverlay.style.display = 'flex';
    container.style.animationPlayState = 'paused';
    mostTitle.textContent = window.i18n.t('tumski_most.title');
}

function resumeAnimation(bookOverlay, mostOverlay, container) {
    bookOverlay.style.display = 'none';
    mostOverlay.style.display = 'none';
    container.style.animationPlayState = 'running';
}

// Общие функции для работы с языком
function toggleLanguageDropdown() {
    const dropdown = document.querySelector(COMMON_ELEMENTS.LANGUAGE_DROPDOWN);
    dropdown.classList.toggle('show');

    document.addEventListener('click', function closeDropdown(e) {
        if (!e.target.closest(COMMON_ELEMENTS.LANGUAGE_SWITCHER)) {
            dropdown.classList.remove('show');
            document.removeEventListener('click', closeDropdown);
        }
    });
}

async function changeLang(lang) {
    await window.i18n.changeLang(lang);
    document.querySelector(COMMON_ELEMENTS.LANGUAGE_DROPDOWN).classList.remove('show');
    updateActiveLanguage();
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
    document.querySelectorAll('.custom-cursor, .custom-cursor-area, .custom-cursor-prosto, .custom-cursor-prostoarea, .custom-cursor-back, .custom-cursor-backarea').forEach(element => {
        element.classList.add('hide-cursors');
    });
}

// Экспорт функций и констант
window.Common = {
    COMMON_ELEMENTS,
    setupResetAnimation,
    setupRightArrowHandler,
    setupForwardArrowHandler,
    setupBackArrowHandler,
    openBook,
    openMost,
    resumeAnimation,
    toggleLanguageDropdown,
    changeLang,
    updateActiveLanguage,
    setupScrollHandlers,
    hideAllCursors
}; 