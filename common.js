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
            const nextImageContainer = document.querySelector('.next-image-container-Right');
            
            console.log('Элементы для анимации:', {
                imageContainer: !!imageContainer,
                currentImage: !!currentImage,
                nextImageContainer: !!nextImageContainer,
                nextImageContainerStyle: nextImageContainer ? window.getComputedStyle(nextImageContainer) : null,
                nextImageContainerBackground: nextImageContainer ? window.getComputedStyle(nextImageContainer).backgroundImage : null
            });

            if (!imageContainer || !currentImage || !nextImageContainer) {
                console.error('Не все элементы для анимации найдены');
                return;
            }

            // Показываем следующее изображение
            nextImageContainer.style.opacity = '1';
            console.log('Установлена opacity = 1 для nextImageContainer');
            
            // Запускаем анимацию перехода
            imageContainer.style.animationPlayState = 'paused';
            imageContainer.classList.add('zoom-transition-Right');
            console.log('Добавлен класс zoom-transition-Right');
            
            // После завершения анимации переходим на следующую страницу
            setTimeout(() => {
                console.log('Текущее состояние элементов:', {
                    imageContainerClass: imageContainer.className,
                    nextImageContainerOpacity: window.getComputedStyle(nextImageContainer).opacity,
                    nextImageContainerVisibility: window.getComputedStyle(nextImageContainer).visibility
                });
                
                if (typeof nextPageCallback === 'function') {
                    nextPageCallback();
                }
            }, 1500);
            
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

function setupUpArrowHandler(cursor, cursorArea, stepSound, nextPageCallback) {
    // Проверяем наличие необходимых элементов
    if (!cursor || !cursorArea) {
        console.error('Элементы стрелки вверх не найдены');
        return;
    }

    console.log('Инициализация обработчика стрелки вверх:', {
        cursor: cursor,
        cursorArea: cursorArea
    });

    // Обработчик движения мыши над областью курсора
    cursorArea.addEventListener('mousemove', function(e) {
        const rect = this.getBoundingClientRect();
        console.log('Движение мыши в области стрелки вверх:', {
            mouseX: e.clientX,
            mouseY: e.clientY,
            rectLeft: rect.left,
            rectRight: rect.right,
            rectTop: rect.top,
            rectBottom: rect.bottom
        });

        if (e.clientX >= rect.left && e.clientX <= rect.right &&
            e.clientY >= rect.top && e.clientY <= rect.bottom) {
            cursor.style.opacity = '1';
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
            console.log('Стрелка вверх показана:', {
                left: cursor.style.left,
                top: cursor.style.top,
                opacity: cursor.style.opacity
            });
        }
    });

    // Скрываем курсор при уходе мыши из области
    cursorArea.addEventListener('mouseleave', function() {
        cursor.style.opacity = '0';
        console.log('Курсор скрыт при выходе из области');
    });

    // Обработчик клика
    cursor.addEventListener('click', handleClick);
    cursorArea.addEventListener('click', handleClick);

    function handleClick(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('Клик по стрелке вверх');

        try {
            hideAllCursors();
            
            if (stepSound) {
                stepSound.currentTime = 0;
                stepSound.play();
            }
            
            // Получаем элементы для анимации
            const imageContainer = document.querySelector('.image-container');
            const currentImage = document.querySelector('.image');
            const nextImageContainer = document.querySelector('.next-image-container-Up');
            
            console.log('Элементы для анимации вверх:', {
                imageContainer: !!imageContainer,
                currentImage: !!currentImage,
                nextImageContainer: !!nextImageContainer
            });

            if (!imageContainer || !currentImage || !nextImageContainer) {
                console.error('Не все элементы для анимации вверх найдены');
                return;
            }

            // Показываем следующее изображение
            nextImageContainer.style.opacity = '1';
            
            // Запускаем анимацию перехода
            imageContainer.style.animationPlayState = 'paused';
            imageContainer.classList.add('zoom-transition-Up');
            
            // После завершения анимации переходим на следующую страницу
            setTimeout(() => {
                if (typeof nextPageCallback === 'function') {
                    nextPageCallback();
                }
            }, 1500);
            
        } catch (error) {
            console.error('Ошибка при обработке клика:', error);
        }
    }
}

// Общие функции для работы с книгой
function openBook(bookSound, bookOverlay, container, bookContent, toggleScrollIndicator) {
    console.log('openBook вызван, src:', bookOverlay.querySelector('.book-image')?.src);
    console.log('Функция openBook вызвана');
    console.log('Параметры:', {
        bookSound: !!bookSound,
        bookOverlay: !!bookOverlay,
        container: !!container,
        bookContent: !!bookContent,
        toggleScrollIndicator: !!toggleScrollIndicator
    });
    
    if (window.playMapSound) window.playMapSound();
    bookOverlay.style.display = 'flex';
    container.style.animationPlayState = 'paused';
    bookContent.scrollTop = 0;
    setTimeout(toggleScrollIndicator, 100);
    
    console.log('Книга открыта, display установлен в flex');
}

function openMost(bookSound, mostOverlay, container, mostTitle) {
    if (window.playMapSound) window.playMapSound();
    mostOverlay.style.display = 'flex';
    container.style.animationPlayState = 'paused';
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
    document.querySelectorAll('.custom-cursor, .custom-cursor-area, .custom-cursor-prosto, .custom-cursor-prostoarea, .custom-cursor-back, .custom-cursor-backarea').forEach(element => {
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
    console.log('Открытие Тумский остров', {bookOverlay, bookSound});
    if (!bookOverlay.style.display || bookOverlay.style.display === 'none') {
        const bookTitle = bookOverlay.querySelector('.book-title');
        const bookText = bookOverlay.querySelector('.book-text');
        const bookImage = bookOverlay.querySelector('.book-image');
        // Устанавливаем изображение книги
        if (bookImage) {
            bookImage.src = 'media/book/book.jpg';
            console.log('bookImage.src установлен (остров):', bookImage.src);
        }
        // Устанавливаем заголовок и текст из переводов
        if (window.i18n && typeof window.i18n.t === 'function') {
            const titleText = window.i18n.t('tumski.title');
            const descriptionText = window.i18n.t('tumski.description');
                    if (bookTitle) bookTitle.innerHTML = titleText;
        if (bookText) bookText.innerHTML = descriptionText;
            console.log('Текст установлен (остров):', {titleText, descriptionText});
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
    console.log('Открытие Тумский мост', {mostOverlay, bookSound});
    if (!mostOverlay.style.display || mostOverlay.style.display === 'none') {
        // Устанавливаем заголовок из переводов
        if (window.i18n && typeof window.i18n.t === 'function') {
            const titleText = window.i18n.t('tumski_most.title');
            if (mostTitle) mostTitle.innerHTML = titleText;
            console.log('Текст установлен (мост):', {titleText});
        }
        Common.openMost(bookSound, mostOverlay, container, mostTitle);
    }
}

// Экспорт функций и констант
window.Common = {
    COMMON_ELEMENTS,
    setupResetAnimation,
    setupRightArrowHandler,
    setupForwardArrowHandler,
    setupBackArrowHandler,
    setupUpArrowHandler,
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