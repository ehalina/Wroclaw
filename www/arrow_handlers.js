/**
 * Определяет, является ли устройство тач-устройством на основе CSS-медиа-запросов
 * @returns {boolean} true если устройство поддерживает hover и fine pointer (десктоп), false если тач-устройство
 */
function isDesktopDevice() {
    return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}

const ARROW_DEBUG_STORAGE_KEYS = ['DEBUG_ARROWS', '__arrow_debug'];

function isArrowDebugEnabled() {
    try {
        if (window.DEBUG_ARROWS === true || window.DEBUG_ARROWS === '1' || window.DEBUG_ARROWS === 'true') {
            return true;
        }

        return ARROW_DEBUG_STORAGE_KEYS.some((key) => {
            const value = localStorage.getItem(key);
            return value === '1' || value === 'true';
        });
    } catch (_) {
        return false;
    }
}

function debugLog(...args) {
    if (isArrowDebugEnabled()) {
        console.log(...args);
    }
}

function debugWarn(...args) {
    if (isArrowDebugEnabled()) {
        console.warn(...args);
    }
}

function preventDefaultIfCancelable(event) {
    if (event && event.cancelable) {
        event.preventDefault();
    }
}

function playAudioQuietly(audio) {
    if (!audio) {
        return;
    }

    try {
        const playResult = audio.play();
        if (playResult && typeof playResult.catch === 'function') {
            playResult.catch(() => {});
        }
    } catch (_) {
        // Expected for some autoplay/user-gesture edge cases.
    }
}

/**
 * Скрывает все курсоры на странице, добавляя класс hide-cursors
 */
function hideAllCursors() {
    document.querySelectorAll('.custom-cursor, .custom-cursor-area, .custom-cursor-prosto, .custom-cursor-prostoarea, .custom-cursor-prosto-left, .custom-cursor-prosto-leftarea, .custom-cursor-back, .custom-cursor-backarea, .custom-cursor-left, .custom-cursor-leftarea, .custom-cursor-up, .custom-cursor-uparea').forEach(element => {
        element.classList.add('hide-cursors');
    });
}

/**
 * Проверяет, включен ли звук
 * @returns {boolean} true если звук включен, false если выключен
 */
function isSoundEnabled() {
    const soundMuted = localStorage.getItem('soundMuted');
    // По умолчанию звук включен (если значение не установлено или 'false')
    return soundMuted !== 'true';
}

/**
 * Настраивает обработчик для стрелки вправо
 * @param {HTMLElement} cursor - Элемент курсора
 * @param {HTMLElement} cursorArea - Область курсора
 * @param {HTMLAudioElement} stepSound - Звук шага
 * @param {Function} onRightClick - Callback-функция для обработки клика
 */
function setupRightArrowHandler(cursor, cursorArea, stepSound, onRightClick) {
    // Проверяем наличие необходимых элементов
    if (!cursor || !cursorArea) {
        return;
    }

    // Используем CSS-медиа-запросы для определения типа устройства
    const isMobile = !isDesktopDevice();
    debugLog('🔵 setupRightArrowHandler: isMobile =', isMobile, 'isDesktopDevice() =', isDesktopDevice());

    if (!isMobile) {
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
    } else {
        // Для мобильных устройств показываем курсор всегда
        cursor.style.opacity = '1';
        cursor.style.display = 'block';
        cursorArea.style.pointerEvents = 'auto';
        cursorArea.style.opacity = '1';
        cursorArea.style.display = 'block';
    }

    // Флаг для блокировки click после touchend на мобильных
    let touchHandled = false;
    let lastTouchTime = 0;

    // Блокируем click на мобильных в capture phase (до всех других обработчиков)
    // Проверяем в момент события, а не при инициализации
        cursorArea.addEventListener('click', function(e) {
        const isMobileNow = !isDesktopDevice();
            const timeSinceTouch = Date.now() - lastTouchTime;
        if (isMobileNow) {
            debugLog('🔵 RIGHT CLICK (CAPTURE): БЛОКИРУЕМ на мобильном, timeSinceTouch =', timeSinceTouch);
            preventDefaultIfCancelable(e);
            e.stopPropagation();
            e.stopImmediatePropagation();
            return false;
        }
        }, { capture: true, passive: false });

    cursor.addEventListener('click', function(e) {
        const isMobileNow = !isDesktopDevice();
        const timeSinceTouch = Date.now() - lastTouchTime;
        if (isMobileNow) {
            debugLog('🔵 RIGHT CURSOR CLICK (CAPTURE): БЛОКИРУЕМ на мобильном, timeSinceTouch =', timeSinceTouch);
            preventDefaultIfCancelable(e);
            e.stopPropagation();
            e.stopImmediatePropagation();
            return false;
        }
    }, { capture: true, passive: false });

    // Обработчик клика по стрелке вправо (только для десктопа)
    cursorArea.addEventListener('click', function(e) {
        const isMobileNow = !isDesktopDevice();
        debugLog('🔵 RIGHT CLICK: isMobileNow =', isMobileNow, 'touchHandled =', touchHandled);

        // На мобильных устройствах блокируем click - используем только touchend
        if (isMobileNow || touchHandled) {
            debugLog('🔵 RIGHT CLICK: БЛОКИРУЕМ click на мобильном или touchHandled=true');
            preventDefaultIfCancelable(e);
            e.stopPropagation();
            e.stopImmediatePropagation();
            touchHandled = false; // Сбрасываем флаг
            return false;
        }

        debugLog('🔵 RIGHT CLICK: Обрабатываем click (десктоп)');
        preventDefaultIfCancelable(e);
        e.stopPropagation();

        try {
            hideAllCursors();

            if (stepSound && isSoundEnabled()) {
                stepSound.currentTime = 0;
                playAudioQuietly(stepSound);
            }

            setTimeout(() => {
                if (typeof onRightClick === 'function') {
                    onRightClick();
                } else {
                    // Fallback: используем атрибут data-prev-page или переходим на index.html
                    const prevPage = cursor.getAttribute('data-prev-page');
                    if (prevPage) {
                        // Проверяем, находимся ли мы в SPA
                        if (window.parent && window.parent !== window && window.parent.spaManager) {
                            window.parent.spaManager.navigateToPage(prevPage);
                        } else {
                            window.location.href = prevPage;
                        }
                    } else {
                        window.location.href = 'index.html';
                    }
                }
            }, 300);

        } catch (error) {
            console.error('❌ Ошибка при обработке клика по стрелке вправо:', error);
        }
    });

    // Добавляем обработчик касания для мобильных устройств (двойной клик)
    if (isMobile) {
        const handleSingleTouch = (e) => {
            preventDefaultIfCancelable(e);
            e.stopPropagation();
            e.stopImmediatePropagation();
            lastTouchTime = Date.now();

            if (touchHandled) {
                return;
            }

            touchHandled = true;
            setTimeout(() => {
                touchHandled = false;
            }, 500);

            try {
                debugLog('🔵 RIGHT TOUCHEND: Выполняем действие');
                hideAllCursors();

                if (stepSound && isSoundEnabled()) {
                    stepSound.currentTime = 0;
                    playAudioQuietly(stepSound);
                }

                setTimeout(() => {
                    if (typeof onRightClick === 'function') {
                        onRightClick();
                    } else {
                        // Fallback: используем атрибут data-prev-page или переходим на index.html
                        const prevPage = cursor.getAttribute('data-prev-page');
                        if (prevPage) {
                            // Проверяем, находимся ли мы в SPA
                            if (window.parent && window.parent !== window && window.parent.spaManager) {
                                window.parent.spaManager.navigateToPage(prevPage);
                            } else {
                                window.location.href = prevPage;
                            }
                        } else {
                            window.location.href = 'index.html';
                        }
                    }
                }, 300);

            } catch (error) {
                console.error('❌ Ошибка при обработке касания по стрелке вправо:', error);
            }
        };

        // Обработчики для области курсора
        cursorArea.addEventListener('touchstart', function(e) {
            preventDefaultIfCancelable(e);
            cursor.style.opacity = '1';
            lastTouchTime = Date.now();
            debugLog('🔵 RIGHT AREA TOUCHSTART: lastTouchTime =', lastTouchTime);
        });

        cursorArea.addEventListener('touchend', handleSingleTouch);

        // Обработчики для самого элемента курсора
        cursor.addEventListener('touchstart', function(e) {
            preventDefaultIfCancelable(e);
            cursor.style.opacity = '1';
            lastTouchTime = Date.now();
            debugLog('🔵 RIGHT CURSOR TOUCHSTART: lastTouchTime =', lastTouchTime);
        });

        cursor.addEventListener('touchend', handleSingleTouch);
    }
}

/* СТАРЫЙ КОД - ЗАКОММЕНТИРОВАН
function setupRightArrowHandler(cursor, cursorArea, stepSound, onRightClick) {
    // Используем CSS-медиа-запросы для определения типа устройства
    const isMobile = !isDesktopDevice();

    debugLog('🔵 setupRightArrowHandler вызван, isMobile:', isMobile);

    if (!isMobile) {
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
    } else {
        // Для мобильных устройств показываем курсор всегда
        cursor.style.opacity = '1';
        cursor.style.display = 'block';
        cursorArea.style.pointerEvents = 'auto';
        cursorArea.style.opacity = '1';
        cursorArea.style.display = 'block';

    }

    // Обработчик клика по стрелке вправо
    cursorArea.addEventListener('click', function(e) {
        // На мобильных устройствах ВСЕГДА блокируем click
        // Все взаимодействия обрабатываются через touchend (двойной клик)
        // ВАЖНО: проверяем isDesktopDevice() в момент события, не используем cached isMobile
        if (!isDesktopDevice()) {
            preventDefaultIfCancelable(e);
            e.stopPropagation();
            e.stopImmediatePropagation();
            return false;
        }

        preventDefaultIfCancelable(e);
        e.stopPropagation();

        try {
            debugLog('🟡 Скрываем все курсоры');
            hideAllCursors();

            if (stepSound && isSoundEnabled()) {
                stepSound.currentTime = 0;
                playAudioQuietly(stepSound);
            }

            setTimeout(() => {
                if (onRightClick && typeof onRightClick === 'function') {
                    onRightClick();
                } else {
                    // Fallback: используем атрибут data-prev-page или переходим на index.html
                    const prevPage = cursor.getAttribute('data-prev-page');
                    if (prevPage) {
                        window.location.href = prevPage;
                    } else {
                        window.location.href = 'index.html';
                    }
                }
            }, 300);

        } catch (error) {
            console.error('❌ Ошибка при обработке клика по стрелке вправо:', error);
        }
    });

    // Добавляем обработчик касания для мобильных устройств (двойной клик)
    if (isMobile) {
        let touchCount = 0;
        let touchTimer = null;

        cursorArea.addEventListener('touchstart', function(e) {
            preventDefaultIfCancelable(e);
            cursor.style.opacity = '1';
        });

        cursorArea.addEventListener('touchend', function(e) {
            preventDefaultIfCancelable(e);
            e.stopPropagation();
            e.stopImmediatePropagation();
            touchCount++;

            if (touchCount === 1) {
                touchTimer = setTimeout(() => {
                    touchCount = 0;
                }, 400);
                return;
            } else if (touchCount === 2) {
                clearTimeout(touchTimer);
                touchCount = 0;

                hideAllCursors();
                if (stepSound && isSoundEnabled()) {
                    stepSound.currentTime = 0;
                    playAudioQuietly(stepSound);
                }
                setTimeout(() => {
                    if (onRightClick && typeof onRightClick === 'function') {
                        onRightClick();
                    } else {
                        // Fallback: используем атрибут data-prev-page или переходим на index.html
                        const prevPage = cursor.getAttribute('data-prev-page');
                        if (prevPage) {
                            window.location.href = prevPage;
                        } else {
                            window.location.href = 'index.html';
                        }
                    }
                }, 300);
            } else {
                touchCount = 0;
                return;
            }
        });
    }
}
*/

/**
 * Настраивает обработчик для стрелки прямо
 * @param {HTMLElement} cursorProsto - Элемент курсора прямо
 * @param {HTMLElement} cursorProstoArea - Область курсора прямо
 * @param {HTMLAudioElement} stepSound - Звук шага
 * @param {Function} onForwardClick - Callback-функция для обработки клика
 */
function setupForwardArrowHandler(cursorProsto, cursorProstoArea, stepSound, onForwardClick) {
    // Проверяем наличие необходимых элементов
    if (!cursorProsto || !cursorProstoArea) {
        return;
    }

    // Используем CSS-медиа-запросы для определения типа устройства
    const isMobile = !isDesktopDevice();
    const hasSpaNavigation = () => window.parent && window.parent !== window && window.parent.spaManager;
    debugLog('🟢 setupForwardArrowHandler: isMobile =', isMobile);

    if (!isMobile) {
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
    } else {
        // Для мобильных устройств показываем курсор всегда
        cursorProsto.style.opacity = '1';
        cursorProsto.style.display = 'block';
        cursorProstoArea.style.pointerEvents = 'auto';
        cursorProstoArea.style.opacity = '1';
        cursorProstoArea.style.display = 'block';

    }

    // Флаг для блокировки click после touchend на мобильных
    let touchHandled = false;
    let lastTouchTime = 0;

    // Блокируем click на мобильных в capture phase (до всех других обработчиков)
    // Проверяем в момент события, а не при инициализации
        cursorProstoArea.addEventListener('click', function(e) {
        const isMobileNow = !isDesktopDevice();
            const timeSinceTouch = Date.now() - lastTouchTime;
        if (isMobileNow) {
            debugLog('🟢 FORWARD CLICK (CAPTURE): БЛОКИРУЕМ на мобильном, timeSinceTouch =', timeSinceTouch);
            preventDefaultIfCancelable(e);
            e.stopPropagation();
            e.stopImmediatePropagation();
            return false;
        }
        }, { capture: true, passive: false });

    cursorProsto.addEventListener('click', function(e) {
        const isMobileNow = !isDesktopDevice();
        const timeSinceTouch = Date.now() - lastTouchTime;
        if (isMobileNow) {
            debugLog('🟢 FORWARD CURSOR CLICK (CAPTURE): БЛОКИРУЕМ на мобильном, timeSinceTouch =', timeSinceTouch);
            preventDefaultIfCancelable(e);
            e.stopPropagation();
            e.stopImmediatePropagation();
            return false;
        }
    }, { capture: true, passive: false });

    // Обработчик клика по стрелке прямо
    cursorProstoArea.addEventListener('click', function(e) {
        const isMobileNow = !isDesktopDevice();
        debugLog('🟢 FORWARD CLICK: isMobileNow =', isMobileNow, 'touchHandled =', touchHandled);

        // На мобильных устройствах блокируем click - используем только touchend
        if (isMobileNow || touchHandled) {
            debugLog('🟢 FORWARD CLICK: БЛОКИРУЕМ click на мобильном или touchHandled=true');
            preventDefaultIfCancelable(e);
            e.stopPropagation();
            e.stopImmediatePropagation();
            touchHandled = false; // Сбрасываем флаг
            return false;
        }

        debugLog('🟢 FORWARD CLICK: Обрабатываем click (десктоп)');
        preventDefaultIfCancelable(e);
        e.stopPropagation();

        try {
    // console.log('🟡 Скрываем все курсоры');
            hideAllCursors();

            if (stepSound && isSoundEnabled()) {
    // console.log('🟡 Воспроизводим звук шага');
                stepSound.currentTime = 0;
                playAudioQuietly(stepSound);
            }

            if (hasSpaNavigation()) {
                if (typeof onForwardClick === 'function') {
                    window.requestAnimationFrame(onForwardClick);
                }
                return;
            }

            // Получаем элементы для анимации
    // console.log('🟡 Ищем элементы для анимации...');
            const imageContainer = document.querySelector('.image-container');
            const currentImage = document.querySelector('.image');
            const nextImageContainer = document.querySelector('.next-image-container');

    // console.log('🟡 Найденные элементы:', {
    //     imageContainer: !!imageContainer,
    //     currentImage: !!currentImage,
    //     nextImageContainer: !!nextImageContainer
    // });

            if (!imageContainer || !currentImage || !nextImageContainer) {
                console.error('❌ Не все элементы найдены, прерываем выполнение');
                return;
            }

            // Определяем следующую страницу и загружаем соответствующее изображение
            const nextPage = cursorProsto.getAttribute('data-next-page');
    // console.log('🟡 Следующая страница:', nextPage);

    // console.log('🟡 Запускаем анимацию перехода');
            // Сначала запускаем анимацию перехода
            imageContainer.style.animationPlayState = 'paused';

    // console.log('🟡 Применяем стандартную анимацию зума');
            imageContainer.classList.add('zoom-transition');

            if (nextPage === 'tumski03.html') {
                // Для tumski03.html загружаем соответствующее изображение
                if (isMobile) {
                    // В мобильной версии загружаем изображение, вписанное по высоте
                    nextImageContainer.style.backgroundImage = 'url("media/tumski/tumski_03.jpg")';
                    nextImageContainer.style.backgroundPosition = 'left top';
                    nextImageContainer.style.backgroundSize = 'auto 100%';
    // console.log('🟡 Мобильная версия: загружено изображение tumski_03.jpg, вписанное по высоте');
                } else {
                    // В десктопной версии загружаем полное изображение
                    nextImageContainer.style.backgroundImage = 'url("media/tumski/tumski_03.jpg")';
                    nextImageContainer.style.backgroundPosition = 'center center';
                    nextImageContainer.style.backgroundSize = 'contain';
    // console.log('🟡 Десктопная версия: загружено полное изображение tumski_03.jpg');
                }
            } else if (nextPage === 'tumski_02.html') {
                // Для tumski_02.html загружаем соответствующее изображение
                if (isMobile) {
                    // В мобильной версии загружаем изображение, вписанное по высоте
                    nextImageContainer.style.backgroundImage = 'url("media/tumski/tumski_02.jpg")';
                    nextImageContainer.style.backgroundPosition = 'left top';
                    nextImageContainer.style.backgroundSize = 'auto 100%';
    // console.log('🟡 Мобильная версия: загружено изображение tumski_02.jpg, вписанное по высоте');
                } else {
                    nextImageContainer.style.backgroundImage = 'url("media/tumski/tumski_02.jpg")';
                    nextImageContainer.style.backgroundPosition = 'center center';
                    nextImageContainer.style.backgroundSize = 'contain';
    // console.log('🟡 Десктопная версия: загружено полное изображение tumski_02.jpg');
                }
            } else if (nextPage === 'tumski04.html') {
                // Для tumski04.html загружаем соответствующее изображение
                if (isMobile) {
                    // В мобильной версии загружаем изображение, вписанное по высоте
                    nextImageContainer.style.backgroundImage = 'url("media/tumski/tumski_04.jpg")';
                    nextImageContainer.style.backgroundPosition = 'left top';
                    nextImageContainer.style.backgroundSize = 'auto 100%';
    // console.log('🟡 Мобильная версия: загружено изображение tumski_04.jpg, вписанное по высоте');
                } else {
                    // В десктопной версии загружаем полное изображение
                    nextImageContainer.style.backgroundImage = 'url("media/tumski/tumski_04.jpg")';
                    nextImageContainer.style.backgroundPosition = 'center center';
                    nextImageContainer.style.backgroundSize = 'contain';
    // console.log('🟡 Десктопная версия: загружено полное изображение tumski_04.jpg');
                }
            } else if (nextPage === 'tumski05.html') {
                // Для tumski05.html загружаем соответствующее изображение
                if (isMobile) {
                    // В мобильной версии загружаем изображение, вписанное по высоте
                    nextImageContainer.style.backgroundImage = 'url("media/tumski/tumski_05.jpg")';
                    nextImageContainer.style.backgroundPosition = 'left top';
                    nextImageContainer.style.backgroundSize = 'auto 100%';
    // console.log('🟡 Мобильная версия: загружено изображение tumski_05.jpg, вписанное по высоте');
                } else {
                    // В десктопной версии загружаем полное изображение
                    nextImageContainer.style.backgroundImage = 'url("media/tumski/tumski_05.jpg")';
                    nextImageContainer.style.backgroundPosition = 'center center';
                    nextImageContainer.style.backgroundSize = 'contain';
    // console.log('🟡 Десктопная версия: загружено полное изображение tumski_05.jpg');
                }
            } else if (nextPage === 'tumski14.html') {
                // Для tumski14.html загружаем соответствующее изображение
                if (isMobile) {
                    // В мобильной версии загружаем изображение, вписанное по высоте
                    nextImageContainer.style.backgroundImage = 'url("media/tumski/tumski_14.jpg")';
                    nextImageContainer.style.backgroundPosition = 'left top';
                    nextImageContainer.style.backgroundSize = 'auto 100%';
    // console.log('🟡 Мобильная версия: загружено изображение tumski_14.jpg, вписанное по высоте');
                } else {
                    // В десктопной версии загружаем полное изображение
                    nextImageContainer.style.backgroundImage = 'url("media/tumski/tumski_14.jpg")';
                    nextImageContainer.style.backgroundPosition = 'center center';
                    nextImageContainer.style.backgroundSize = 'contain';
    // console.log('🟡 Десктопная версия: загружено полное изображение tumski_14.jpg');
                }
            } else if (nextPage === 'tumski08.html') {
                // Для tumski08.html загружаем соответствующее изображение с эффектом разворота
                if (isMobile) {
                    // В мобильной версии загружаем изображение, вписанное по высоте
                    nextImageContainer.style.backgroundImage = 'url("media/tumski/tumski_08.jpg")';
                    nextImageContainer.style.backgroundPosition = 'left top';
                    nextImageContainer.style.backgroundSize = 'auto 100%';
    // console.log('🟡 Мобильная версия: загружено изображение tumski_08.jpg, вписанное по высоте');
                } else {
                    // В десктопной версии загружаем полное изображение
                    nextImageContainer.style.backgroundImage = 'url("media/tumski/tumski_08.jpg")';
                    nextImageContainer.style.backgroundPosition = 'center center';
                    nextImageContainer.style.backgroundSize = 'contain';
    // console.log('🟡 Десктопная версия: загружено полное изображение tumski_08.jpg');
                }
            } else if (nextPage === 'tumski22.html') {
                // Для tumski22.html загружаем соответствующее изображение
                if (isMobile) {
                    // В мобильной версии загружаем изображение, вписанное по высоте
                    nextImageContainer.style.backgroundImage = 'url("media/tumski/tumski_22.jpg")';
                    nextImageContainer.style.backgroundPosition = 'left top';
                    nextImageContainer.style.backgroundSize = 'auto 100%';
    // console.log('🟡 Мобильная версия: загружено изображение tumski_22.jpg, вписанное по высоте');
                } else {
                    // В десктопной версии загружаем полное изображение
                    nextImageContainer.style.backgroundImage = 'url("media/tumski/tumski_22.jpg")';
                    nextImageContainer.style.backgroundPosition = 'center center';
                    nextImageContainer.style.backgroundSize = 'contain';
    // console.log('🟡 Десктопная версия: загружено полное изображение tumski_22.jpg');
                }
            } else if (nextPage === 'tumski07.html') {
                // Для tumski07.html (переход с pk02.html или tumski08.html) загружаем tumski_07.jpg
                if (isMobile) {
                    // В мобильной версии загружаем изображение, вписанное по высоте
                    nextImageContainer.style.backgroundImage = 'url("media/tumski/tumski_07.jpg")';
                    nextImageContainer.style.backgroundPosition = 'left top';
                    nextImageContainer.style.backgroundSize = 'auto 100%';
    // console.log('🟡 Мобильная версия: загружено изображение tumski_07.jpg, вписанное по высоте');
                } else {
                    // В десктопной версии загружаем полное изображение
                    nextImageContainer.style.backgroundImage = 'url("media/tumski/tumski_07.jpg")';
                    nextImageContainer.style.backgroundPosition = 'center center';
                    nextImageContainer.style.backgroundSize = 'contain';
    // console.log('🟡 Десктопная версия: загружено полное изображение tumski_07.jpg');
                }
            }

    // console.log('🟡 Сразу начинаем плавно показывать next-image-container');
            // Сразу начинаем плавно показывать следующее изображение
            nextImageContainer.style.opacity = '1';

    // console.log('🟡 Запускаем таймер для перехода на следующую страницу через 1500мс');
            // Через 1500мс (время анимации) переходим на следующую страницу
            setTimeout(() => {
    // console.log('🟡 Таймер сработал, вызываем onForwardClick callback');
                if (typeof onForwardClick === 'function') {
                    onForwardClick();
                } else {
                    debugWarn('⚠️ onForwardClick не является функцией');
                }
            }, 1500);

        } catch (error) {
            console.error('❌ Ошибка при обработке клика по стрелке прямо:', error);
        }
    });

    // Добавляем обработчик касания для мобильных устройств (одинарный тап)
    if (isMobile) {
        const handleSingleTouch = (e) => {
            preventDefaultIfCancelable(e);
            e.stopPropagation();
            e.stopImmediatePropagation();
            lastTouchTime = Date.now();

            if (touchHandled) {
                return;
            }

            touchHandled = true;
            setTimeout(() => {
                touchHandled = false;
            }, 500);

            try {
                debugLog('🟢 FORWARD TOUCHEND: Выполняем действие');
                hideAllCursors();

                if (stepSound && isSoundEnabled()) {
                    stepSound.currentTime = 0;
                    playAudioQuietly(stepSound);
                }

                if (hasSpaNavigation()) {
                    if (typeof onForwardClick === 'function') {
                        window.requestAnimationFrame(onForwardClick);
                    }
                    return;
                }

                // Получаем элементы для анимации
                const imageContainer = document.querySelector('.image-container');
                const currentImage = document.querySelector('.image');
                const nextImageContainer = document.querySelector('.next-image-container');

                            if (!imageContainer || !currentImage || !nextImageContainer) {
                    console.error('❌ Не все элементы найдены, прерываем выполнение');
                return;
            }

                // Определяем следующую страницу и загружаем соответствующее изображение
                const nextPage = cursorProsto.getAttribute('data-next-page');
    // console.log('🟡 Следующая страница (touchend):', nextPage);

    // console.log('🟡 Запускаем анимацию перехода');
                // Сначала запускаем анимацию перехода
                imageContainer.style.animationPlayState = 'paused';

    // console.log('🟡 Применяем стандартную анимацию зума (touchend)');
                imageContainer.classList.add('zoom-transition');

                if (nextPage === 'tumski03.html') {
                    // Для tumski03.html загружаем соответствующее изображение
                    if (isMobile) {
                        // В мобильной версии загружаем изображение, вписанное по высоте
                        nextImageContainer.style.backgroundImage = 'url("media/tumski/tumski_03.jpg")';
                        nextImageContainer.style.backgroundPosition = 'left top';
                        nextImageContainer.style.backgroundSize = 'auto 100%';
    // console.log('🟡 Мобильная версия (touchend): загружено изображение tumski_03.jpg, вписанное по высоте');
                    } else {
                        // В десктопной версии загружаем полное изображение
                        nextImageContainer.style.backgroundImage = 'url("media/tumski/tumski_03.jpg")';
                        nextImageContainer.style.backgroundPosition = 'center center';
                        nextImageContainer.style.backgroundSize = 'contain';
    // console.log('🟡 Десктопная версия (touchend): загружено полное изображение tumski_03.jpg');
                    }
                } else if (nextPage === 'tumski_02.html') {
                    // Для tumski_02.html загружаем соответствующее изображение
                    if (isMobile) {
                        // В мобильной версии загружаем изображение, вписанное по высоте
                        nextImageContainer.style.backgroundImage = 'url("media/tumski/tumski_02.jpg")';
                        nextImageContainer.style.backgroundPosition = 'left top';
                        nextImageContainer.style.backgroundSize = 'auto 100%';
    // console.log('🟡 Мобильная версия (touchend): загружено изображение tumski_02.jpg, вписанное по высоте');
                    } else {
                        nextImageContainer.style.backgroundImage = 'url("media/tumski/tumski_02.jpg")';
                        nextImageContainer.style.backgroundPosition = 'center center';
                        nextImageContainer.style.backgroundSize = 'contain';
    // console.log('🟡 Десктопная версия (touchend): загружено полное изображение tumski_02.jpg');
                    }
                } else if (nextPage === 'tumski04.html') {
                    // Для tumski04.html загружаем соответствующее изображение
                    if (isMobile) {
                        // В мобильной версии загружаем изображение, вписанное по высоте
                        nextImageContainer.style.backgroundImage = 'url("media/tumski/tumski_04.jpg")';
                        nextImageContainer.style.backgroundPosition = 'left top';
                        nextImageContainer.style.backgroundSize = 'auto 100%';
    // console.log('🟡 Мобильная версия (touchend): загружено изображение tumski_04.jpg, вписанное по высоте');
                    } else {
                        // В десктопной версии загружаем полное изображение
                        nextImageContainer.style.backgroundImage = 'url("media/tumski/tumski_04.jpg")';
                        nextImageContainer.style.backgroundPosition = 'center center';
                        nextImageContainer.style.backgroundSize = 'contain';
    // console.log('🟡 Десктопная версия (touchend): загружено полное изображение tumski_04.jpg');
                    }
                } else if (nextPage === 'tumski05.html') {
                    // Для tumski05.html загружаем соответствующее изображение
                    if (isMobile) {
                        // В мобильной версии загружаем изображение, вписанное по высоте
                        nextImageContainer.style.backgroundImage = 'url("media/tumski/tumski_05.jpg")';
                        nextImageContainer.style.backgroundPosition = 'left top';
                        nextImageContainer.style.backgroundSize = 'auto 100%';
    // console.log('🟡 Мобильная версия (touchend): загружено изображение tumski_05.jpg, вписанное по высоте');
                    } else {
                        // В десктопной версии загружаем полное изображение
                        nextImageContainer.style.backgroundImage = 'url("media/tumski/tumski_05.jpg")';
                        nextImageContainer.style.backgroundPosition = 'center center';
                        nextImageContainer.style.backgroundSize = 'contain';
    // console.log('🟡 Десктопная версия (touchend): загружено полное изображение tumski_05.jpg');
                    }
                } else if (nextPage === 'tumski08.html') {
                    // Для tumski08.html загружаем соответствующее изображение с эффектом разворота
                    if (isMobile) {
                        // В мобильной версии загружаем изображение, вписанное по высоте
                        nextImageContainer.style.backgroundImage = 'url("media/tumski/tumski_08.jpg")';
                        nextImageContainer.style.backgroundPosition = 'left top';
                        nextImageContainer.style.backgroundSize = 'auto 100%';
    // console.log('🟡 Мобильная версия (touchend): загружено изображение tumski_08.jpg, вписанное по высоте');
                    } else {
                        // В десктопной версии загружаем полное изображение
                        nextImageContainer.style.backgroundImage = 'url("media/tumski/tumski_08.jpg")';
                        nextImageContainer.style.backgroundPosition = 'center center';
                        nextImageContainer.style.backgroundSize = 'contain';
    // console.log('🟡 Десктопная версия (touchend): загружено полное изображение tumski_08.jpg');
                    }
                } else if (nextPage === 'tumski22.html') {
                    // Для tumski22.html загружаем соответствующее изображение
                    if (isMobile) {
                        // В мобильной версии загружаем изображение, вписанное по высоте
                        nextImageContainer.style.backgroundImage = 'url("media/tumski/tumski_22.jpg")';
                        nextImageContainer.style.backgroundPosition = 'left top';
                        nextImageContainer.style.backgroundSize = 'auto 100%';
    // console.log('🟡 Мобильная версия (touchend): загружено изображение tumski_22.jpg, вписанное по высоте');
                    } else {
                        // В десктопной версии загружаем полное изображение
                        nextImageContainer.style.backgroundImage = 'url("media/tumski/tumski_22.jpg")';
                        nextImageContainer.style.backgroundPosition = 'center center';
                        nextImageContainer.style.backgroundSize = 'contain';
    // console.log('🟡 Десктопная версия (touchend): загружено полное изображение tumski_22.jpg');
                    }
                } else if (nextPage === 'tumski07.html') {
                    // Для tumski07.html (переход с pk02.html или tumski08.html) загружаем tumski_07.jpg
                    if (isMobile) {
                        // В мобильной версии загружаем изображение, вписанное по высоте
                        nextImageContainer.style.backgroundImage = 'url("media/tumski/tumski_07.jpg")';
                        nextImageContainer.style.backgroundPosition = 'left top';
                        nextImageContainer.style.backgroundSize = 'auto 100%';
    // console.log('🟡 Мобильная версия (touchend): загружено изображение tumski_07.jpg, вписанное по высоте');
                    } else {
                        // В десктопной версии загружаем полное изображение
                        nextImageContainer.style.backgroundImage = 'url("media/tumski/tumski_07.jpg")';
                        nextImageContainer.style.backgroundPosition = 'center center';
                        nextImageContainer.style.backgroundSize = 'contain';
    // console.log('🟡 Десктопная версия (touchend): загружено полное изображение tumski_07.jpg');
                    }
                }

    // console.log('🟡 Сразу начинаем плавно показывать next-image-container');
                // Сразу начинаем плавно показывать следующее изображение
                nextImageContainer.style.opacity = '1';

    // console.log('🟡 Запускаем таймер для перехода на следующую страницу через 1500мс');
                // Через 1500мс (время анимации) переходим на следующую страницу
                setTimeout(() => {
    // console.log('🟡 Таймер сработал, вызываем onForwardClick callback');
                    if (typeof onForwardClick === 'function') {
                        onForwardClick();
                    } else {
                        debugWarn('⚠️ onForwardClick не является функцией');
                    }
                }, 1500);

                    } catch (error) {
                console.error('❌ Ошибка при обработке касания по стрелке прямо:', error);
        }
        };

        // Обработчики для области курсора
        cursorProstoArea.addEventListener('touchstart', function(e) {
            preventDefaultIfCancelable(e);
            cursorProsto.style.opacity = '1';
            lastTouchTime = Date.now();
            debugLog('🟢 FORWARD AREA TOUCHSTART: lastTouchTime =', lastTouchTime);
        });

        cursorProstoArea.addEventListener('touchend', handleSingleTouch);

        // Обработчики для самого элемента курсора
        cursorProsto.addEventListener('touchstart', function(e) {
            preventDefaultIfCancelable(e);
            cursorProsto.style.opacity = '1';
            lastTouchTime = Date.now();
            debugLog('🟢 FORWARD CURSOR TOUCHSTART: lastTouchTime =', lastTouchTime);
        });

        cursorProsto.addEventListener('touchend', handleSingleTouch);
    }
}

/**
 * Настраивает обработчик для стрелки влево
 * @param {HTMLElement} cursorLeft - Элемент курсора влево
 * @param {HTMLElement} cursorLeftArea - Область курсора влево
 * @param {HTMLAudioElement} stepSound - Звук шага
 * @param {Function} onLeftClick - Callback-функция для обработки клика
 */
function setupLeftArrowHandler(cursorLeft, cursorLeftArea, stepSound, onLeftClick) {
    // Используем CSS-медиа-запросы для определения типа устройства
    const isMobile = !isDesktopDevice();

    if (!isMobile) {
    // console.log('🟡 Настройка обработчиков для десктопной версии стрелки влево');

        // Обработчик движения мыши над областью курсора
        cursorLeftArea.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
    // console.log('🟡 Движение мыши над областью стрелки влево:', {
    //     mouseX: e.clientX,
    //     mouseY: e.clientY,
    //     area: {
    //         left: rect.left,
    //         right: rect.right,
    //         top: rect.top,
    //         bottom: rect.bottom
    //     }
    // });

            if (e.clientX >= rect.left && e.clientX <= rect.right &&
                e.clientY >= rect.top && e.clientY <= rect.bottom) {
                cursorLeft.style.opacity = '1';
                cursorLeft.style.left = e.clientX - 32 + 'px';
                cursorLeft.style.top = e.clientY - 32 + 'px';
                cursorLeft.style.display = 'block';
                cursorLeft.style.visibility = 'visible';
                cursorLeft.style.pointerEvents = 'auto';
            } else {
                cursorLeft.style.opacity = '0';
            }
        });

        // Глобальный обработчик движения мыши
        const mouseMoveHandler = function(e) {
            const rect = cursorLeftArea.getBoundingClientRect();
            if (!(e.clientX >= rect.left && e.clientX <= rect.right &&
                e.clientY >= rect.top && e.clientY <= rect.bottom)) {
                cursorLeft.style.opacity = '0';
            }
        };

        document.addEventListener('mousemove', mouseMoveHandler);

        // Скрываем курсор при уходе мыши из области
        cursorLeftArea.addEventListener('mouseleave', function() {
            cursorLeft.style.opacity = '0';
        });

        // Очистка обработчиков при уничтожении
        window.addEventListener('pagehide', function() {
            document.removeEventListener('mousemove', mouseMoveHandler);
        }, { once: true });
    } else {
        // Для мобильных устройств показываем курсор всегда
        cursorLeft.style.opacity = '1';
        cursorLeft.style.display = 'block';
        cursorLeftArea.style.pointerEvents = 'auto';
        cursorLeftArea.style.opacity = '1';
        cursorLeftArea.style.display = 'block';
    }

    // Флаг для блокировки click после touchend на мобильных
    let touchHandled = false;
    let lastTouchTime = 0;

    // Блокируем click на мобильных в capture phase (до всех других обработчиков)
    // Проверяем в момент события, а не при инициализации
        cursorLeftArea.addEventListener('click', function(e) {
        const isMobileNow = !isDesktopDevice();
            const timeSinceTouch = Date.now() - lastTouchTime;
        if (isMobileNow) {
            debugLog('🟠 LEFT CLICK (CAPTURE): БЛОКИРУЕМ на мобильном, timeSinceTouch =', timeSinceTouch);
            preventDefaultIfCancelable(e);
            e.stopPropagation();
            e.stopImmediatePropagation();
            return false;
        }
        }, { capture: true, passive: false });

    cursorLeft.addEventListener('click', function(e) {
        const isMobileNow = !isDesktopDevice();
        const timeSinceTouch = Date.now() - lastTouchTime;
        if (isMobileNow) {
            debugLog('🟠 LEFT CURSOR CLICK (CAPTURE): БЛОКИРУЕМ на мобильном, timeSinceTouch =', timeSinceTouch);
            preventDefaultIfCancelable(e);
            e.stopPropagation();
            e.stopImmediatePropagation();
            return false;
        }
    }, { capture: true, passive: false });

    // Обработчик клика по стрелке влево (только для десктопа)
    cursorLeftArea.addEventListener('click', function(e) {
        const isMobileNow = !isDesktopDevice();
        debugLog('🟠 LEFT CLICK: isMobileNow =', isMobileNow, 'touchHandled =', touchHandled);

        // На мобильных устройствах отключаем click событие
        if (isMobileNow || touchHandled) {
            debugLog('🟠 LEFT CLICK: БЛОКИРУЕМ click на мобильном или touchHandled=true');
            preventDefaultIfCancelable(e);
            e.stopPropagation();
            e.stopImmediatePropagation();
            touchHandled = false; // Сбрасываем флаг
            return false;
        }

        debugLog('🟠 LEFT CLICK: Обрабатываем click (десктоп)');
        preventDefaultIfCancelable(e);
        hideAllCursors();
        if (stepSound && isSoundEnabled()) {
            stepSound.currentTime = 0;
            playAudioQuietly(stepSound);
        }
        setTimeout(() => {
            if (onLeftClick && typeof onLeftClick === 'function') {
                onLeftClick();
            } else {
                // Fallback: используем атрибут data-next-page или переходим на index.html
                const nextPage = cursorLeft.getAttribute('data-next-page');
                if (nextPage) {
                    window.location.href = nextPage;
                } else {
                    window.location.href = 'index.html';
                }
            }
        }, 300);
    });

    // Добавляем обработчик касания для мобильных устройств (одинарный тап)
    if (isMobile) {
        const handleSingleTouch = (e) => {
            preventDefaultIfCancelable(e);
            e.stopPropagation();
            e.stopImmediatePropagation();
            lastTouchTime = Date.now();

            if (touchHandled) {
                return;
            }

            touchHandled = true;
            setTimeout(() => {
                touchHandled = false;
            }, 500);

            try {
                debugLog('🟠 LEFT TOUCHEND: Выполняем действие');
                hideAllCursors();

                if (stepSound && isSoundEnabled()) {
                    stepSound.currentTime = 0;
                    playAudioQuietly(stepSound);
                }

                setTimeout(() => {
                    if (onLeftClick && typeof onLeftClick === 'function') {
                        onLeftClick();
                    } else {
                        // Fallback: используем атрибут data-next-page или переходим на index.html
                        const nextPage = cursorLeft.getAttribute('data-next-page');
                        if (nextPage) {
                            // Проверяем, находимся ли мы в SPA
                            if (window.parent && window.parent !== window && window.parent.spaManager) {
                                window.parent.spaManager.navigateToPage(nextPage);
                            } else {
                            window.location.href = nextPage;
                            }
                        } else {
                            window.location.href = 'index.html';
                        }
                    }
                }, 300);

            } catch (error) {
                console.error('❌ Ошибка при обработке касания по стрелке влево:', error);
            }
        };

        // Обработчики для области курсора
        cursorLeftArea.addEventListener('touchstart', function(e) {
            preventDefaultIfCancelable(e);
            cursorLeft.style.opacity = '1';
            lastTouchTime = Date.now();
            debugLog('🟠 LEFT AREA TOUCHSTART: lastTouchTime =', lastTouchTime);
        });

        cursorLeftArea.addEventListener('touchend', handleSingleTouch);

        // Обработчики для самого элемента курсора
        cursorLeft.addEventListener('touchstart', function(e) {
            preventDefaultIfCancelable(e);
            cursorLeft.style.opacity = '1';
            lastTouchTime = Date.now();
            debugLog('🟠 LEFT CURSOR TOUCHSTART: lastTouchTime =', lastTouchTime);
        });

        cursorLeft.addEventListener('touchend', handleSingleTouch);
    }
}

/**
 * Настраивает обработчик для стрелки назад
 * @param {HTMLElement} cursorBack - Элемент курсора назад
 * @param {HTMLElement} cursorBackArea - Область курсора назад
 * @param {HTMLAudioElement} stepSound - Звук шага
 * @param {Function} onBackClick - Callback-функция для обработки клика
 */
function setupBackArrowHandler(cursorBack, cursorBackArea, stepSound, onBackClick) {
    // Используем CSS-медиа-запросы для определения типа устройства
    const isMobile = !isDesktopDevice();

    // Обработчик движения мыши над областью курсора (только для десктопа)
    cursorBackArea.addEventListener('mousemove', function(e) {
        // На мобильных устройствах отключаем mouse события
        if (isMobile) {
            return;
        }

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

    // Обработчик движения мыши по всему документу (только для десктопа)
    document.addEventListener('mousemove', function(e) {
        // На мобильных устройствах отключаем mouse события
        if (isMobile) {
            return;
        }

        const rect = cursorBackArea.getBoundingClientRect();
        if (!(e.clientX >= rect.left && e.clientX <= rect.right &&
            e.clientY >= rect.top && e.clientY <= rect.bottom)) {
            cursorBack.style.opacity = '0';
        }
    });

    // Скрываем курсор при уходе мыши из области (только для десктопа)
    cursorBackArea.addEventListener('mouseleave', function() {
        // На мобильных устройствах отключаем mouse события
        if (isMobile) {
            return;
        }

        cursorBack.style.opacity = '0';
    });

    // Флаг для блокировки click после touchend на мобильных
    let touchHandled = false;
    let lastTouchTime = 0;

    // Блокируем click на мобильных в capture phase (до всех других обработчиков)
    if (isMobile) {
        cursorBackArea.addEventListener('click', function(e) {
            const timeSinceTouch = Date.now() - lastTouchTime;
            debugLog('🔴 BACK CLICK (CAPTURE): БЛОКИРУЕМ на мобильном, timeSinceTouch =', timeSinceTouch);
            preventDefaultIfCancelable(e);
            e.stopPropagation();
            e.stopImmediatePropagation();
            return false;
        }, { capture: true, passive: false });
    }

    // Обработчик клика по стрелке назад (только для десктопа)
    cursorBackArea.addEventListener('click', function(e) {
        debugLog('🔴 BACK CLICK: isMobile =', isMobile, 'touchHandled =', touchHandled);

        // На мобильных устройствах отключаем click событие
        if (isMobile || touchHandled) {
            debugLog('🔴 BACK CLICK: БЛОКИРУЕМ click на мобильном или touchHandled=true');
            preventDefaultIfCancelable(e);
            e.stopPropagation();
            e.stopImmediatePropagation();
            touchHandled = false; // Сбрасываем флаг
            return false;
        }

        debugLog('🔴 BACK CLICK: Обрабатываем click (десктоп)');
        hideAllCursors();
        if (stepSound && isSoundEnabled()) {
            stepSound.currentTime = 0;
            playAudioQuietly(stepSound);
        }

        setTimeout(() => {
            onBackClick();
        }, 300);
    });

    // Обработчик touch по стрелке назад (мобильные устройства, одинарный тап)
    if (isMobile) {
        cursorBackArea.addEventListener('touchstart', function(e) {
            preventDefaultIfCancelable(e);
            lastTouchTime = Date.now();
            debugLog('🔴 BACK AREA TOUCHSTART: lastTouchTime =', lastTouchTime);
        });

        cursorBack.addEventListener('touchstart', function(e) {
            preventDefaultIfCancelable(e);
            lastTouchTime = Date.now();
            debugLog('🔴 BACK CURSOR TOUCHSTART: lastTouchTime =', lastTouchTime);
        });

        const handleSingleAreaTouch = (e) => {
            preventDefaultIfCancelable(e);
            e.stopPropagation();
            e.stopImmediatePropagation();
            lastTouchTime = Date.now();

            if (touchHandled) {
                return;
            }

            touchHandled = true;
            setTimeout(() => {
                touchHandled = false;
            }, 500);

            debugLog('🔴 BACK AREA TOUCHEND: Выполняем действие после одиночного касания');
            try {
                hideAllCursors();
                if (stepSound && isSoundEnabled()) {
                    stepSound.currentTime = 0;
                    playAudioQuietly(stepSound);
                }

                setTimeout(() => {
                    onBackClick();
                }, 300);
            } catch (error) {
                console.error('❌ Ошибка при обработке касания по стрелке назад (area):', error);
            }
        };

        const handleSingleCursorTouch = (e) => {
            preventDefaultIfCancelable(e);
            e.stopPropagation();
            e.stopImmediatePropagation();
            lastTouchTime = Date.now();

            if (touchHandled) {
                return;
            }

            touchHandled = true;
            setTimeout(() => {
                touchHandled = false;
            }, 500);

            debugLog('🔴 BACK CURSOR TOUCHEND: Выполняем действие после одиночного касания');
            try {
                hideAllCursors();
                if (stepSound && isSoundEnabled()) {
                    stepSound.currentTime = 0;
                    playAudioQuietly(stepSound);
                }

                setTimeout(() => {
                    onBackClick();
                }, 300);
            } catch (error) {
                console.error('❌ Ошибка при обработке касания по стрелке назад (cursor):', error);
            }
        };

        cursorBackArea.addEventListener('touchend', handleSingleAreaTouch);
        cursorBack.addEventListener('touchend', handleSingleCursorTouch);
    }
}

/**
 * Настраивает обработчик для стрелки прямо влево
 * @param {HTMLElement} cursorProstoLeft - Элемент курсора прямо влево
 * @param {HTMLElement} cursorProstoLeftArea - Область курсора прямо влево
 * @param {HTMLAudioElement} stepSound - Звук шага
 * @param {Function} onForwardLeftClick - Callback-функция для обработки клика
 */
function setupForwardLeftArrowHandler(cursorProstoLeft, cursorProstoLeftArea, stepSound, onForwardLeftClick) {
    // Проверяем наличие необходимых элементов
    if (!cursorProstoLeft || !cursorProstoLeftArea) {
        return;
    }

    // Используем CSS-медиа-запросы для определения типа устройства
    const isMobile = !isDesktopDevice();
    const hasSpaNavigation = () => window.parent && window.parent !== window && window.parent.spaManager;
    debugLog('🟡 setupForwardLeftArrowHandler: isMobile =', isMobile);

    if (!isMobile) {
        // Обработчик движения мыши над областью курсора
        cursorProstoLeftArea.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            if (e.clientX >= rect.left && e.clientX <= rect.right &&
                e.clientY >= rect.top && e.clientY <= rect.bottom) {
                cursorProstoLeft.style.opacity = '1';
                cursorProstoLeft.style.left = e.clientX - 32 + 'px';
                cursorProstoLeft.style.top = e.clientY - 32 + 'px';
            } else {
                cursorProstoLeft.style.opacity = '0';
            }
        });

        // Обработчик движения мыши по всему документу
        document.addEventListener('mousemove', function(e) {
            const rect = cursorProstoLeftArea.getBoundingClientRect();
            if (!(e.clientX >= rect.left && e.clientX <= rect.right &&
                e.clientY >= rect.top && e.clientY <= rect.bottom)) {
                cursorProstoLeft.style.opacity = '0';
            }
        });

        // Скрываем курсор при уходе мыши из области
        cursorProstoLeftArea.addEventListener('mouseleave', function() {
            cursorProstoLeft.style.opacity = '0';
        });
    } else {
        // Для мобильных устройств показываем курсор всегда
        cursorProstoLeft.style.opacity = '1';
        cursorProstoLeft.style.display = 'block';
        cursorProstoLeftArea.style.pointerEvents = 'auto';
        cursorProstoLeftArea.style.opacity = '1';
        cursorProstoLeftArea.style.display = 'block';
    }

    // Флаг для блокировки click после touchend на мобильных
    let touchHandled = false;
    let lastTouchTime = 0;

    // Блокируем click на мобильных в capture phase (до всех других обработчиков)
    // Проверяем в момент события, а не при инициализации
        cursorProstoLeftArea.addEventListener('click', function(e) {
        const isMobileNow = !isDesktopDevice();
            const timeSinceTouch = Date.now() - lastTouchTime;
        if (isMobileNow) {
            debugLog('🟡 FORWARD-LEFT CLICK (CAPTURE): БЛОКИРУЕМ на мобильном, timeSinceTouch =', timeSinceTouch);
            preventDefaultIfCancelable(e);
            e.stopPropagation();
            e.stopImmediatePropagation();
            return false;
        }
        }, { capture: true, passive: false });

    cursorProstoLeft.addEventListener('click', function(e) {
        const isMobileNow = !isDesktopDevice();
        const timeSinceTouch = Date.now() - lastTouchTime;
        if (isMobileNow) {
            debugLog('🟡 FORWARD-LEFT CURSOR CLICK (CAPTURE): БЛОКИРУЕМ на мобильном, timeSinceTouch =', timeSinceTouch);
            preventDefaultIfCancelable(e);
            e.stopPropagation();
            e.stopImmediatePropagation();
            return false;
        }
    }, { capture: true, passive: false });

    // Обработчик клика по стрелке прямо влево
    cursorProstoLeftArea.addEventListener('click', function(e) {
        const isMobileNow = !isDesktopDevice();
        debugLog('🟡 FORWARD-LEFT CLICK: isMobileNow =', isMobileNow, 'touchHandled =', touchHandled);

        // На мобильных устройствах блокируем click - используем только touchend
        if (isMobileNow || touchHandled) {
            debugLog('🟡 FORWARD-LEFT CLICK: БЛОКИРУЕМ click на мобильном или touchHandled=true');
            preventDefaultIfCancelable(e);
            e.stopPropagation();
            e.stopImmediatePropagation();
            touchHandled = false; // Сбрасываем флаг
            return false;
        }

        debugLog('🟡 FORWARD-LEFT CLICK: Обрабатываем click (десктоп)');
        preventDefaultIfCancelable(e);
        e.stopPropagation();

        try {
    // console.log('🟡 Скрываем все курсоры');
            hideAllCursors();

            if (stepSound && isSoundEnabled()) {
    // console.log('🟡 Воспроизводим звук шага');
                stepSound.currentTime = 0;
                playAudioQuietly(stepSound);
            }

            if (hasSpaNavigation()) {
                if (typeof onForwardLeftClick === 'function') {
                    window.requestAnimationFrame(onForwardLeftClick);
                }
                return;
            }

            // Получаем элементы для анимации
    // console.log('🟡 Ищем элементы для анимации...');
            const imageContainer = document.querySelector('.image-container');
            const currentImage = document.querySelector('.image');
            const nextImageContainer = document.querySelector('.next-image-container');

    // console.log('🟡 Найденные элементы:', {
    //     imageContainer: !!imageContainer,
    //     currentImage: !!currentImage,
    //     nextImageContainer: !!nextImageContainer
    // });

            if (!imageContainer || !currentImage || !nextImageContainer) {
                console.error('❌ Не все элементы найдены, прерываем выполнение');
                return;
            }

    // console.log('🟡 Запускаем анимацию перехода (zoom-transition)');
            // Сначала запускаем анимацию перехода
            imageContainer.style.animationPlayState = 'paused';
            imageContainer.classList.add('zoom-transition');

            // Определяем следующую страницу и загружаем соответствующее изображение
            const nextPage = cursorProstoLeft.getAttribute('data-next-page');
    // console.log('🟡 Следующая страница:', nextPage);

            if (nextPage === 'pk01.html') {
                // Для pk01.html загружаем соответствующее изображение
                if (isMobile) {
                    // В мобильной версии загружаем изображение, вписанное по высоте
                    nextImageContainer.style.backgroundImage = 'url("media/tumski/pk_01.jpg")';
                    nextImageContainer.style.backgroundPosition = 'left top';
                    nextImageContainer.style.backgroundSize = 'auto 100%';
    // console.log('🟡 Мобильная версия: загружено изображение pk_01.jpg, вписанное по высоте');
                } else {
                    // В десктопной версии загружаем полное изображение
                    nextImageContainer.style.backgroundImage = 'url("media/tumski/pk_01.jpg")';
                    nextImageContainer.style.backgroundPosition = 'center center';
                    nextImageContainer.style.backgroundSize = 'contain';
    // console.log('🟡 Десктопная версия: загружено полное изображение pk_01.jpg');
                }
            } else if (nextPage === 'ogrod08.html') {
                // Для ogrod08.html загружаем соответствующее изображение
                if (isMobile) {
                    // В мобильной версии загружаем изображение, вписанное по высоте
                    nextImageContainer.style.backgroundImage = 'url("media/tumski/ogrud_08.jpg")';
                    nextImageContainer.style.backgroundPosition = 'left top';
                    nextImageContainer.style.backgroundSize = 'auto 100%';
    // console.log('🟡 Мобильная версия: загружено изображение ogrud_08.jpg, вписанное по высоте');
                } else {
                    // В десктопной версии загружаем полное изображение
                    nextImageContainer.style.backgroundImage = 'url("media/tumski/ogrud_08.jpg")';
                    nextImageContainer.style.backgroundPosition = 'center center';
                    nextImageContainer.style.backgroundSize = 'contain';
    // console.log('🟡 Десктопная версия: загружено полное изображение ogrud_08.jpg');
                }
            } else if (nextPage === 'tumski15.html') {
                // Для tumski15.html загружаем соответствующее изображение
                if (isMobile) {
                    // В мобильной версии загружаем изображение, вписанное по высоте
                    nextImageContainer.style.backgroundImage = 'url("media/tumski/tumski_15.jpg")';
                    nextImageContainer.style.backgroundPosition = 'left top';
                    nextImageContainer.style.backgroundSize = 'auto 100%';
    // console.log('🟡 Мобильная версия: загружено изображение tumski_15.jpg, вписанное по высоте');
                } else {
                    // В десктопной версии загружаем полное изображение
                    nextImageContainer.style.backgroundImage = 'url("media/tumski/tumski_15.jpg")';
                    nextImageContainer.style.backgroundPosition = 'center center';
                    nextImageContainer.style.backgroundSize = 'contain';
    // console.log('🟡 Десктопная версия: загружено полное изображение tumski_15.jpg');
                }
            } else if (nextPage === 'dwor01.html') {
                // Для dwor01.html (переход с pk02.html) загружаем dwor_01.jpg (по требованию)
                if (isMobile) {
                    // В мобильной версии загружаем изображение, вписанное по высоте
                    nextImageContainer.style.backgroundImage = 'url("media/tumski/dwor_01.jpg")';
                    nextImageContainer.style.backgroundPosition = 'left top';
                    nextImageContainer.style.backgroundSize = 'auto 100%';
    // console.log('🟡 Мобильная версия: загружено изображение dwor_01.jpg, вписанное по высоте');
                } else {
                    // В десктопной версии загружаем полное изображение
                    nextImageContainer.style.backgroundImage = 'url("media/tumski/dwor_01.jpg")';
                    nextImageContainer.style.backgroundPosition = 'center center';
                    nextImageContainer.style.backgroundSize = 'contain';
    // console.log('🟡 Десктопная версия: загружено полное изображение dwor_01.jpg');
                }
            } else if (nextPage === 'tumski09.html') {
                // Для tumski09.html (переход с tumski08.html) загружаем tumski_09.jpg
                if (isMobile) {
                    // В мобильной версии загружаем изображение, вписанное по высоте
                    nextImageContainer.style.backgroundImage = 'url("media/tumski/tumski_09.jpg")';
                    nextImageContainer.style.backgroundPosition = 'left top';
                    nextImageContainer.style.backgroundSize = 'auto 100%';
    // console.log('🟡 Мобильная версия: загружено изображение tumski_09.jpg, вписанное по высоте');
                } else {
                    // В десктопной версии загружаем полное изображение
                    nextImageContainer.style.backgroundImage = 'url("media/tumski/tumski_09.jpg")';
                    nextImageContainer.style.backgroundPosition = 'center center';
                    nextImageContainer.style.backgroundSize = 'contain';
    // console.log('🟡 Десктопная версия: загружено полное изображение tumski_09.jpg');
                }
            }

    // console.log('🟡 Сразу начинаем плавно показывать next-image-container');
            // Сразу начинаем плавно показывать следующее изображение
            nextImageContainer.style.opacity = '1';

    // console.log('🟡 Запускаем таймер для перехода на следующую страницу через 1500мс');
            // Через 1500мс (время анимации) переходим на следующую страницу
            setTimeout(() => {
    // console.log('🟡 Таймер сработал, вызываем onForwardLeftClick callback');
                if (typeof onForwardLeftClick === 'function') {
                    onForwardLeftClick();
                } else {
                    debugWarn('⚠️ onForwardLeftClick не является функцией');
                }
            }, 1500);

        } catch (error) {
            console.error('❌ Ошибка при обработке клика по стрелке прямо влево:', error);
        }
    });

    // Добавляем обработчик касания для мобильных устройств (одинарный тап)
    if (isMobile) {
        // Функция предзагрузки изображения
        const preloadImage = () => {
            try {
                const nextImageContainer = document.querySelector('.next-image-container');
                if (nextImageContainer) {
                    const nextPage = cursorProstoLeft.getAttribute('data-next-page');
                    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
                    if (currentPage === 'pk02.html' && nextPage === 'dwor01.html') {
                        nextImageContainer.style.backgroundImage = 'url("media/tumski/dwor_01.jpg")';
                        nextImageContainer.style.backgroundPosition = 'left top';
                        nextImageContainer.style.backgroundSize = 'auto 100%';
                        nextImageContainer.style.display = 'block';
                    }
                }
            } catch (_) {}
        };

        const executeForwardLeftTouchNavigation = () => {
            if (touchHandled) {
                return;
            }

            touchHandled = true;
            setTimeout(() => {
                touchHandled = false;
            }, 500);

            try {
                hideAllCursors();

                if (stepSound && isSoundEnabled()) {
                    stepSound.currentTime = 0;
                    playAudioQuietly(stepSound);
                }

                if (hasSpaNavigation()) {
                    if (typeof onForwardLeftClick === 'function') {
                        window.requestAnimationFrame(onForwardLeftClick);
                    }
                    return;
                }

                // Получаем элементы для анимации
                const imageContainer = document.querySelector('.image-container');
                const currentImage = document.querySelector('.image');
                const nextImageContainer = document.querySelector('.next-image-container');

                if (!imageContainer || !currentImage || !nextImageContainer) {
                    console.error('❌ Не все элементы найдены, прерываем выполнение');
                    return;
                }

                // Сначала запускаем анимацию перехода
                imageContainer.style.animationPlayState = 'paused';
                imageContainer.classList.add('zoom-transition');

                // Определяем следующую страницу и загружаем соответствующее изображение
                const nextPage = cursorProstoLeft.getAttribute('data-next-page');

                if (nextPage === 'pk01.html') {
                    // Для pk01.html загружаем соответствующее изображение
                    nextImageContainer.style.backgroundImage = 'url("media/tumski/pk_01.jpg")';
                    nextImageContainer.style.backgroundPosition = isMobile ? 'left top' : 'center center';
                    nextImageContainer.style.backgroundSize = isMobile ? 'auto 100%' : 'contain';
                } else if (nextPage === 'ogrod08.html') {
                    // Для ogrod08.html загружаем соответствующее изображение
                    nextImageContainer.style.backgroundImage = 'url("media/tumski/ogrud_08.jpg")';
                    nextImageContainer.style.backgroundPosition = isMobile ? 'left top' : 'center center';
                    nextImageContainer.style.backgroundSize = isMobile ? 'auto 100%' : 'contain';
                } else if (nextPage === 'tumski15.html') {
                    // Для tumski15.html загружаем соответствующее изображение
                    nextImageContainer.style.backgroundImage = 'url("media/tumski/tumski_15.jpg")';
                    nextImageContainer.style.backgroundPosition = isMobile ? 'left top' : 'center center';
                    nextImageContainer.style.backgroundSize = isMobile ? 'auto 100%' : 'contain';
                } else if (nextPage === 'dwor01.html') {
                    // Для dwor01.html (переход с pk02.html) загружаем dwor_01.jpg
                    nextImageContainer.style.backgroundImage = 'url("media/tumski/dwor_01.jpg")';
                    nextImageContainer.style.backgroundPosition = isMobile ? 'left top' : 'center center';
                    nextImageContainer.style.backgroundSize = isMobile ? 'auto 100%' : 'contain';
                } else if (nextPage === 'tumski09.html') {
                    // Для tumski09.html (переход с tumski08.html) загружаем tumski_09.jpg
                    nextImageContainer.style.backgroundImage = 'url("media/tumski/tumski_09.jpg")';
                    nextImageContainer.style.backgroundPosition = isMobile ? 'left top' : 'center center';
                    nextImageContainer.style.backgroundSize = isMobile ? 'auto 100%' : 'contain';
                }

                // Сразу начинаем плавно показывать следующее изображение
                nextImageContainer.style.opacity = '1';

                // Через 1500мс (время анимации) переходим на следующую страницу
                setTimeout(() => {
                    if (typeof onForwardLeftClick === 'function') {
                        onForwardLeftClick();
                    } else {
                        debugWarn('⚠️ onForwardLeftClick не является функцией');
                    }
                }, 1500);

            } catch (error) {
                console.error('❌ Ошибка при обработке касания по стрелке прямо влево:', error);
            }
        };

        const handleSingleTouch = (e) => {
            preventDefaultIfCancelable(e);
            e.stopPropagation();
            e.stopImmediatePropagation();
            lastTouchTime = Date.now();
            preloadImage();
            executeForwardLeftTouchNavigation();
        };

        // Обработчики для области курсора
        cursorProstoLeftArea.addEventListener('touchstart', function(e) {
            preventDefaultIfCancelable(e);
            cursorProstoLeft.style.opacity = '1';
            lastTouchTime = Date.now();
            debugLog('🟡 FORWARD-LEFT AREA TOUCHSTART: lastTouchTime =', lastTouchTime);
            preloadImage();
        });

        cursorProstoLeftArea.addEventListener('touchend', handleSingleTouch);

        // Обработчики для самого элемента курсора
        cursorProstoLeft.addEventListener('touchstart', function(e) {
            preventDefaultIfCancelable(e);
            cursorProstoLeft.style.opacity = '1';
            lastTouchTime = Date.now();
            debugLog('🟡 FORWARD-LEFT CURSOR TOUCHSTART: lastTouchTime =', lastTouchTime);
            preloadImage();
        });

        cursorProstoLeft.addEventListener('touchend', handleSingleTouch);
    }
}

/**
 * Настраивает обработчик для стрелки вверх
 * @param {HTMLElement} cursor - Элемент курсора
 * @param {HTMLElement} cursorArea - Область курсора
 * @param {HTMLAudioElement} stepSound - Звук шага
 */
function setupUpArrowHandler(cursor, cursorArea, stepSound) {
    // Используем CSS-медиа-запросы для определения типа устройства
    const isMobile = !isDesktopDevice();

    if (!isMobile) {
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
    } else {
        // Для мобильных устройств показываем курсор всегда
        cursor.style.opacity = '1';
        cursor.style.display = 'block';
        cursorArea.style.pointerEvents = 'auto';
        cursorArea.style.opacity = '1';
        cursorArea.style.display = 'block';
    }

    // Обработчик клика по стрелке вверх (только для десктопа)
    cursorArea.addEventListener('click', function(e) {
        // На мобильных устройствах отключаем click событие
        if (isMobile) {
            preventDefaultIfCancelable(e);
            e.stopPropagation();
            return;
        }

        preventDefaultIfCancelable(e);
        hideAllCursors();
        if (stepSound && isSoundEnabled()) {
            stepSound.currentTime = 0;
            playAudioQuietly(stepSound);
        }

        const nextPage = cursor.getAttribute('data-next-page');
        if (nextPage) {
            setTimeout(() => {
                window.location.href = nextPage;
            }, 300);
        }
    });

    // Добавляем обработчик касания для мобильных устройств (одинарный тап)
    if (isMobile) {
        let touchHandled = false;
        let lastTouchTime = 0;

        const handleSingleTouch = (e) => {
            preventDefaultIfCancelable(e);
            e.stopPropagation();
            e.stopImmediatePropagation();
            lastTouchTime = Date.now();

            if (touchHandled) {
                return;
            }

            touchHandled = true;
            setTimeout(() => {
                touchHandled = false;
            }, 500);

            hideAllCursors();
            if (stepSound && isSoundEnabled()) {
                stepSound.currentTime = 0;
                playAudioQuietly(stepSound);
            }

            const nextPage = cursor.getAttribute('data-next-page');
            if (nextPage) {
                setTimeout(() => {
                    window.location.href = nextPage;
                }, 300);
            }
        };

        cursorArea.addEventListener('touchstart', function(e) {
            preventDefaultIfCancelable(e);
            cursor.style.opacity = '1';
        });

        cursorArea.addEventListener('touchend', handleSingleTouch);
    }
}

// Экспортируем функции в глобальную область видимости
window.isDesktopDevice = isDesktopDevice;
window.setupRightArrowHandler = setupRightArrowHandler;
window.setupForwardArrowHandler = setupForwardArrowHandler;
window.setupForwardLeftArrowHandler = setupForwardLeftArrowHandler;
window.setupBackArrowHandler = setupBackArrowHandler;
window.setupLeftArrowHandler = setupLeftArrowHandler;
window.setupUpArrowHandler = setupUpArrowHandler;
window.hideAllCursors = hideAllCursors;

/* Функция для принудительного обновления mapMarks (аналогично hideAllCursors)
function updateMapMarksVisibility() {
    // Используем CSS-медиа-запросы для определения типа устройства
    const isMobile = !isDesktopDevice();

    const mapMarks = document.querySelectorAll('.map-mark');
    const mapMarkAreas = document.querySelectorAll('.map-mark-area');
    const paperaImages = document.querySelectorAll('.papera-image');
    const tumskiTexts = document.querySelectorAll('.tumski-text');

    mapMarks.forEach(mark => {
        if (isMobile) {
            mark.style.opacity = '1';
            mark.style.display = 'block';
            mark.style.pointerEvents = 'auto';
            mark.style.visibility = 'visible';
        } else {
            mark.style.opacity = '0';
            mark.style.display = 'block';
            mark.style.visibility = 'visible';
        }
    });

    mapMarkAreas.forEach(area => {
        if (isMobile) {
            area.style.pointerEvents = 'auto';
            area.style.opacity = '1';
            area.style.display = 'block';
            area.style.visibility = 'visible';
        }
    });

    paperaImages.forEach(img => {
        if (isMobile) {
            img.style.opacity = '1';
            img.style.display = 'block';
            img.style.pointerEvents = 'auto';
            img.style.visibility = 'visible';
        } else {
            img.style.opacity = '0';
            img.style.display = 'block';
            img.style.visibility = 'visible';
        }
    });

    tumskiTexts.forEach(text => {
        if (isMobile) {
            text.style.opacity = '1';
            text.style.display = 'block';
            text.style.pointerEvents = 'auto';
            text.style.visibility = 'visible';
        } else {
            text.style.opacity = '0';
            text.style.display = 'block';
            text.style.visibility = 'visible';
        }
    });
}

window.updateMapMarksVisibility = updateMapMarksVisibility; */

// Обработчик изменения размера окна для корректной работы на мобильных устройствах
window.addEventListener('resize', function() {
    // Используем CSS-медиа-запросы для определения типа устройства
    const isMobile = !isDesktopDevice();

    const cursors = document.querySelectorAll('.custom-cursor, .custom-cursor-prosto, .custom-cursor-prosto-left, .custom-cursor-left, .custom-cursor-up');
    const cursorAreas = document.querySelectorAll('.custom-cursor-area, .custom-cursor-prostoarea, .custom-cursor-prosto-leftarea, .custom-cursor-leftarea, .custom-cursor-uparea');

    cursors.forEach(cursor => {
        if (isMobile) {
            cursor.style.opacity = '1';
            cursor.style.display = 'block';
        } else {
            cursor.style.opacity = '0';
        }
    });

    cursorAreas.forEach(area => {
        if (isMobile) {
            area.style.pointerEvents = 'auto';
            area.style.opacity = '1';
            area.style.display = 'block';
        }
    });

    // Обработка mapMarks для корректной работы на мобильных устройствах
    // updateMapMarksVisibility(); // Функция закомментирована
});
