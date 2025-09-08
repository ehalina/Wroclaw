/**
 * Скрывает все курсоры на странице, добавляя класс hide-cursors
 */
function hideAllCursors() {
    document.querySelectorAll('.custom-cursor, .custom-cursor-area, .custom-cursor-prosto, .custom-cursor-prostoarea, .custom-cursor-prosto-left, .custom-cursor-prosto-leftarea, .custom-cursor-back, .custom-cursor-backarea, .custom-cursor-left, .custom-cursor-leftarea, .custom-cursor-up, .custom-cursor-uparea').forEach(element => {
        element.classList.add('hide-cursors');
    });
}

/**
 * Настраивает обработчик для стрелки вправо
 * @param {HTMLElement} cursor - Элемент курсора
 * @param {HTMLElement} cursorArea - Область курсора
 * @param {HTMLAudioElement} stepSound - Звук шага
 */
function setupRightArrowHandler(cursor, cursorArea, stepSound, onRightClick) {
    const isMobile = window.innerWidth <= 700;
    
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

    // Обработчик клика по стрелке вправо (работает и на десктопе, и на мобильных)
    cursorArea.addEventListener('click', function(e) {
        e.preventDefault();
        hideAllCursors();
        if (stepSound) {
            stepSound.currentTime = 0;
            stepSound.play();
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
    });
    
    // Добавляем обработчик касания для мобильных устройств
    if (isMobile) {
        cursorArea.addEventListener('touchstart', function(e) {
            e.preventDefault();
            cursor.style.opacity = '1';
        });
        
        cursorArea.addEventListener('touchend', function(e) {
            e.preventDefault();
            hideAllCursors();
            if (stepSound) {
                stepSound.currentTime = 0;
                stepSound.play();
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
        });
    }
}

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

    const isMobile = window.innerWidth <= 700;
    
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

    // Обработчик клика по стрелке прямо
    cursorProstoArea.addEventListener('click', function(e) {
        console.log('🟡 Клик по стрелке прямо - обработчик из arrow_handlers.js запущен');
        e.preventDefault();
        e.stopPropagation();

        try {
            console.log('🟡 Скрываем все курсоры');
            hideAllCursors();
            
            if (stepSound) {
                console.log('🟡 Воспроизводим звук шага');
                stepSound.currentTime = 0;
                stepSound.play();
            }
            
            // Получаем элементы для анимации
            console.log('🟡 Ищем элементы для анимации...');
            const imageContainer = document.querySelector('.image-container');
            const currentImage = document.querySelector('.image');
            const nextImageContainer = document.querySelector('.next-image-container');
            
            console.log('🟡 Найденные элементы:', {
                imageContainer: !!imageContainer,
                currentImage: !!currentImage,
                nextImageContainer: !!nextImageContainer
            });
            
            if (!imageContainer || !currentImage || !nextImageContainer) {
                console.error('❌ Не все элементы найдены, прерываем выполнение');
                return;
            }

            // Определяем следующую страницу и загружаем соответствующее изображение
            const nextPage = cursorProsto.getAttribute('data-next-page');
            console.log('🟡 Следующая страница:', nextPage);

            console.log('🟡 Запускаем анимацию перехода');
            // Сначала запускаем анимацию перехода
            imageContainer.style.animationPlayState = 'paused';
            
            console.log('🟡 Применяем стандартную анимацию зума');
            imageContainer.classList.add('zoom-transition');
            
            if (nextPage === 'tumski03.html') {
                // Для tumski03.html загружаем соответствующее изображение
                if (isMobile) {
                    // В мобильной версии загружаем изображение, вписанное по высоте
                    nextImageContainer.style.backgroundImage = 'url("media/tumski/tumski_03.jpg")';
                    nextImageContainer.style.backgroundPosition = 'left top';
                    nextImageContainer.style.backgroundSize = 'auto 100%';
                    console.log('🟡 Мобильная версия: загружено изображение tumski_03.jpg, вписанное по высоте');
                } else {
                    // В десктопной версии загружаем полное изображение
                    nextImageContainer.style.backgroundImage = 'url("media/tumski/tumski_03.jpg")';
                    nextImageContainer.style.backgroundPosition = 'center center';
                    nextImageContainer.style.backgroundSize = 'contain';
                    console.log('🟡 Десктопная версия: загружено полное изображение tumski_03.jpg');
                }
            } else if (nextPage === 'tumski_02.html') {
                // Для tumski_02.html загружаем соответствующее изображение
                if (isMobile) {
                    // В мобильной версии загружаем изображение, вписанное по высоте
                    nextImageContainer.style.backgroundImage = 'url("media/tumski/tumski_02.jpg")';
                    nextImageContainer.style.backgroundPosition = 'left top';
                    nextImageContainer.style.backgroundSize = 'auto 100%';
                    console.log('🟡 Мобильная версия: загружено изображение tumski_02.jpg, вписанное по высоте');
                } else {
                    nextImageContainer.style.backgroundImage = 'url("media/tumski/tumski_02.jpg")';
                    nextImageContainer.style.backgroundPosition = 'center center';
                    nextImageContainer.style.backgroundSize = 'contain';
                    console.log('🟡 Десктопная версия: загружено полное изображение tumski_02.jpg');
                }
            } else if (nextPage === 'tumski04.html') {
                // Для tumski04.html загружаем соответствующее изображение
                if (isMobile) {
                    // В мобильной версии загружаем изображение, вписанное по высоте
                    nextImageContainer.style.backgroundImage = 'url("media/tumski/tumski_04.jpg")';
                    nextImageContainer.style.backgroundPosition = 'left top';
                    nextImageContainer.style.backgroundSize = 'auto 100%';
                    console.log('🟡 Мобильная версия: загружено изображение tumski_04.jpg, вписанное по высоте');
                } else {
                    // В десктопной версии загружаем полное изображение
                    nextImageContainer.style.backgroundImage = 'url("media/tumski/tumski_04.jpg")';
                    nextImageContainer.style.backgroundPosition = 'center center';
                    nextImageContainer.style.backgroundSize = 'contain';
                    console.log('🟡 Десктопная версия: загружено полное изображение tumski_04.jpg');
                }
            } else if (nextPage === 'tumski05.html') {
                // Для tumski05.html загружаем соответствующее изображение
                if (isMobile) {
                    // В мобильной версии загружаем изображение, вписанное по высоте
                    nextImageContainer.style.backgroundImage = 'url("media/tumski/tumski_05.jpg")';
                    nextImageContainer.style.backgroundPosition = 'left top';
                    nextImageContainer.style.backgroundSize = 'auto 100%';
                    console.log('🟡 Мобильная версия: загружено изображение tumski_05.jpg, вписанное по высоте');
                } else {
                    // В десктопной версии загружаем полное изображение
                    nextImageContainer.style.backgroundImage = 'url("media/tumski/tumski_05.jpg")';
                    nextImageContainer.style.backgroundPosition = 'center center';
                    nextImageContainer.style.backgroundSize = 'contain';
                    console.log('🟡 Десктопная версия: загружено полное изображение tumski_05.jpg');
                }
            } else if (nextPage === 'tumski14.html') {
                // Для tumski14.html загружаем соответствующее изображение
                if (isMobile) {
                    // В мобильной версии загружаем изображение, вписанное по высоте
                    nextImageContainer.style.backgroundImage = 'url("media/tumski/tumski_14.jpg")';
                    nextImageContainer.style.backgroundPosition = 'left top';
                    nextImageContainer.style.backgroundSize = 'auto 100%';
                    console.log('🟡 Мобильная версия: загружено изображение tumski_14.jpg, вписанное по высоте');
                } else {
                    // В десктопной версии загружаем полное изображение
                    nextImageContainer.style.backgroundImage = 'url("media/tumski/tumski_14.jpg")';
                    nextImageContainer.style.backgroundPosition = 'center center';
                    nextImageContainer.style.backgroundSize = 'contain';
                    console.log('🟡 Десктопная версия: загружено полное изображение tumski_14.jpg');
                }
            } else if (nextPage === 'tumski08.html') {
                // Для tumski08.html загружаем соответствующее изображение с эффектом разворота
                if (isMobile) {
                    // В мобильной версии загружаем изображение, вписанное по высоте
                    nextImageContainer.style.backgroundImage = 'url("media/tumski/tumski_08.jpg")';
                    nextImageContainer.style.backgroundPosition = 'left top';
                    nextImageContainer.style.backgroundSize = 'auto 100%';
                    console.log('🟡 Мобильная версия: загружено изображение tumski_08.jpg, вписанное по высоте');
                } else {
                    // В десктопной версии загружаем полное изображение
                    nextImageContainer.style.backgroundImage = 'url("media/tumski/tumski_08.jpg")';
                    nextImageContainer.style.backgroundPosition = 'center center';
                    nextImageContainer.style.backgroundSize = 'contain';
                    console.log('🟡 Десктопная версия: загружено полное изображение tumski_08.jpg');
                }
            } else if (nextPage === 'tumski22.html') {
                // Для tumski22.html загружаем соответствующее изображение
                if (isMobile) {
                    // В мобильной версии загружаем изображение, вписанное по высоте
                    nextImageContainer.style.backgroundImage = 'url("media/tumski/tumski_22.jpg")';
                    nextImageContainer.style.backgroundPosition = 'left top';
                    nextImageContainer.style.backgroundSize = 'auto 100%';
                    console.log('🟡 Мобильная версия: загружено изображение tumski_22.jpg, вписанное по высоте');
                } else {
                    // В десктопной версии загружаем полное изображение
                    nextImageContainer.style.backgroundImage = 'url("media/tumski/tumski_22.jpg")';
                    nextImageContainer.style.backgroundPosition = 'center center';
                    nextImageContainer.style.backgroundSize = 'contain';
                    console.log('🟡 Десктопная версия: загружено полное изображение tumski_22.jpg');
                }
            }
            
            console.log('🟡 Сразу начинаем плавно показывать next-image-container');
            // Сразу начинаем плавно показывать следующее изображение
            nextImageContainer.style.opacity = '1';
            
            console.log('🟡 Запускаем таймер для перехода на следующую страницу через 1500мс');
            // Через 1500мс (время анимации) переходим на следующую страницу
            setTimeout(() => {
                console.log('🟡 Таймер сработал, вызываем onForwardClick callback');
                if (typeof onForwardClick === 'function') {
                    onForwardClick();
                } else {
                    console.warn('⚠️ onForwardClick не является функцией');
                }
            }, 1500);
            
        } catch (error) {
            console.error('❌ Ошибка при обработке клика по стрелке прямо:', error);
        }
    });
    
    // Добавляем обработчик касания для мобильных устройств
    if (isMobile) {
        cursorProstoArea.addEventListener('touchstart', function(e) {
            e.preventDefault();
            cursorProsto.style.opacity = '1';
        });
        
        cursorProstoArea.addEventListener('touchend', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            try {
                console.log('🟡 Касание по стрелке прямо - обработчик из arrow_handlers.js запущен');
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
                    console.error('❌ Не все элементы найдены, прерываем выполнение');
                return;
            }

                // Определяем следующую страницу и загружаем соответствующее изображение
                const nextPage = cursorProsto.getAttribute('data-next-page');
                console.log('🟡 Следующая страница (touchend):', nextPage);

                console.log('🟡 Запускаем анимацию перехода');
                // Сначала запускаем анимацию перехода
                imageContainer.style.animationPlayState = 'paused';
                
                console.log('🟡 Применяем стандартную анимацию зума (touchend)');
                imageContainer.classList.add('zoom-transition');
                
                if (nextPage === 'tumski03.html') {
                    // Для tumski03.html загружаем соответствующее изображение
                    if (isMobile) {
                        // В мобильной версии загружаем изображение, вписанное по высоте
                        nextImageContainer.style.backgroundImage = 'url("media/tumski/tumski_03.jpg")';
                        nextImageContainer.style.backgroundPosition = 'left top';
                        nextImageContainer.style.backgroundSize = 'auto 100%';
                        console.log('🟡 Мобильная версия (touchend): загружено изображение tumski_03.jpg, вписанное по высоте');
                    } else {
                        // В десктопной версии загружаем полное изображение
                        nextImageContainer.style.backgroundImage = 'url("media/tumski/tumski_03.jpg")';
                        nextImageContainer.style.backgroundPosition = 'center center';
                        nextImageContainer.style.backgroundSize = 'contain';
                        console.log('🟡 Десктопная версия (touchend): загружено полное изображение tumski_03.jpg');
                    }
                } else if (nextPage === 'tumski_02.html') {
                    // Для tumski_02.html загружаем соответствующее изображение
                    if (isMobile) {
                        // В мобильной версии загружаем изображение, вписанное по высоте
                        nextImageContainer.style.backgroundImage = 'url("media/tumski/tumski_02.jpg")';
                        nextImageContainer.style.backgroundPosition = 'left top';
                        nextImageContainer.style.backgroundSize = 'auto 100%';
                        console.log('🟡 Мобильная версия (touchend): загружено изображение tumski_02.jpg, вписанное по высоте');
                    } else {
                        nextImageContainer.style.backgroundImage = 'url("media/tumski/tumski_02.jpg")';
                        nextImageContainer.style.backgroundPosition = 'center center';
                        nextImageContainer.style.backgroundSize = 'contain';
                        console.log('🟡 Десктопная версия (touchend): загружено полное изображение tumski_02.jpg');
                    }
                } else if (nextPage === 'tumski04.html') {
                    // Для tumski04.html загружаем соответствующее изображение
                    if (isMobile) {
                        // В мобильной версии загружаем изображение, вписанное по высоте
                        nextImageContainer.style.backgroundImage = 'url("media/tumski/tumski_04.jpg")';
                        nextImageContainer.style.backgroundPosition = 'left top';
                        nextImageContainer.style.backgroundSize = 'auto 100%';
                        console.log('🟡 Мобильная версия (touchend): загружено изображение tumski_04.jpg, вписанное по высоте');
                    } else {
                        // В десктопной версии загружаем полное изображение
                        nextImageContainer.style.backgroundImage = 'url("media/tumski/tumski_04.jpg")';
                        nextImageContainer.style.backgroundPosition = 'center center';
                        nextImageContainer.style.backgroundSize = 'contain';
                        console.log('🟡 Десктопная версия (touchend): загружено полное изображение tumski_04.jpg');
                    }
                } else if (nextPage === 'tumski05.html') {
                    // Для tumski05.html загружаем соответствующее изображение
                    if (isMobile) {
                        // В мобильной версии загружаем изображение, вписанное по высоте
                        nextImageContainer.style.backgroundImage = 'url("media/tumski/tumski_05.jpg")';
                        nextImageContainer.style.backgroundPosition = 'left top';
                        nextImageContainer.style.backgroundSize = 'auto 100%';
                        console.log('🟡 Мобильная версия (touchend): загружено изображение tumski_05.jpg, вписанное по высоте');
                    } else {
                        // В десктопной версии загружаем полное изображение
                        nextImageContainer.style.backgroundImage = 'url("media/tumski/tumski_05.jpg")';
                        nextImageContainer.style.backgroundPosition = 'center center';
                        nextImageContainer.style.backgroundSize = 'contain';
                        console.log('🟡 Десктопная версия (touchend): загружено полное изображение tumski_05.jpg');
                    }
                } else if (nextPage === 'tumski08.html') {
                    // Для tumski08.html загружаем соответствующее изображение с эффектом разворота
                    if (isMobile) {
                        // В мобильной версии загружаем изображение, вписанное по высоте
                        nextImageContainer.style.backgroundImage = 'url("media/tumski/tumski_08.jpg")';
                        nextImageContainer.style.backgroundPosition = 'left top';
                        nextImageContainer.style.backgroundSize = 'auto 100%';
                        console.log('🟡 Мобильная версия (touchend): загружено изображение tumski_08.jpg, вписанное по высоте');
                    } else {
                        // В десктопной версии загружаем полное изображение
                        nextImageContainer.style.backgroundImage = 'url("media/tumski/tumski_08.jpg")';
                        nextImageContainer.style.backgroundPosition = 'center center';
                        nextImageContainer.style.backgroundSize = 'contain';
                        console.log('🟡 Десктопная версия (touchend): загружено полное изображение tumski_08.jpg');
                    }
                } else if (nextPage === 'tumski22.html') {
                    // Для tumski22.html загружаем соответствующее изображение
                    if (isMobile) {
                        // В мобильной версии загружаем изображение, вписанное по высоте
                        nextImageContainer.style.backgroundImage = 'url("media/tumski/tumski_22.jpg")';
                        nextImageContainer.style.backgroundPosition = 'left top';
                        nextImageContainer.style.backgroundSize = 'auto 100%';
                        console.log('🟡 Мобильная версия (touchend): загружено изображение tumski_22.jpg, вписанное по высоте');
                    } else {
                        // В десктопной версии загружаем полное изображение
                        nextImageContainer.style.backgroundImage = 'url("media/tumski/tumski_22.jpg")';
                        nextImageContainer.style.backgroundPosition = 'center center';
                        nextImageContainer.style.backgroundSize = 'contain';
                        console.log('🟡 Десктопная версия (touchend): загружено полное изображение tumski_22.jpg');
                    }
                }
                
                console.log('🟡 Сразу начинаем плавно показывать next-image-container');
                // Сразу начинаем плавно показывать следующее изображение
                nextImageContainer.style.opacity = '1';
                
                console.log('🟡 Запускаем таймер для перехода на следующую страницу через 1500мс');
                // Через 1500мс (время анимации) переходим на следующую страницу
                setTimeout(() => {
                    console.log('🟡 Таймер сработал, вызываем onForwardClick callback');
                    if (typeof onForwardClick === 'function') {
                        onForwardClick();
                    } else {
                        console.warn('⚠️ onForwardClick не является функцией');
                    }
                }, 1500);
                
                    } catch (error) {
                console.error('❌ Ошибка при обработке касания по стрелке прямо:', error);
        }
        });
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
    const isMobile = window.innerWidth <= 700;
    
    if (!isMobile) {
        console.log('🟡 Настройка обработчиков для десктопной версии стрелки влево');
        
        // Обработчик движения мыши над областью курсора
        cursorLeftArea.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            console.log('🟡 Движение мыши над областью стрелки влево:', {
                mouseX: e.clientX,
                mouseY: e.clientY,
                area: {
                    left: rect.left,
                    right: rect.right,
                    top: rect.top,
                    bottom: rect.bottom
                }
            });
            
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
        window.addEventListener('unload', function() {
            document.removeEventListener('mousemove', mouseMoveHandler);
        });
    } else {
        // Для мобильных устройств показываем курсор всегда
        cursorLeft.style.opacity = '1';
        cursorLeft.style.display = 'block';
        cursorLeftArea.style.pointerEvents = 'auto';
        cursorLeftArea.style.opacity = '1';
        cursorLeftArea.style.display = 'block';
    }

    // Обработчик клика по стрелке влево
    cursorLeftArea.addEventListener('click', function(e) {
        e.preventDefault();
        hideAllCursors();
        if (stepSound) {
            stepSound.currentTime = 0;
            stepSound.play();
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
    
    // Добавляем обработчик касания для мобильных устройств
    if (isMobile) {
        cursorLeftArea.addEventListener('touchstart', function(e) {
            e.preventDefault();
            cursorLeft.style.opacity = '1';
        });
        
        cursorLeftArea.addEventListener('touchend', function(e) {
            e.preventDefault();
            hideAllCursors();
            if (stepSound) {
                stepSound.currentTime = 0;
                stepSound.play();
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
    
    // Обработчик движения мыши над областью курсора (только для десктопа)
    cursorBackArea.addEventListener('mousemove', function(e) {
        // На мобильных устройствах отключаем mouse события
        if (window.innerWidth <= 700) {
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
        if (window.innerWidth <= 700) {
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
        if (window.innerWidth <= 700) {
            return;
        }
        
        cursorBack.style.opacity = '0';
    });

    // Обработчик клика по стрелке назад (только для десктопа)
    cursorBackArea.addEventListener('click', function(e) {
        // На мобильных устройствах отключаем click событие
        if (window.innerWidth <= 700) {
            return;
        }
        
        hideAllCursors();
        if (stepSound) {
            stepSound.currentTime = 0;
            stepSound.play();
        }
        
        setTimeout(() => {
            onBackClick();
        }, 300);
    });

    // Обработчик touch по стрелке назад (мобильные устройства)
    cursorBackArea.addEventListener('touchend', function(e) {
        e.preventDefault(); // Предотвращаем стандартное поведение
        hideAllCursors();
        if (stepSound) {
            stepSound.currentTime = 0;
            stepSound.play();
        }
        
        setTimeout(() => {
            onBackClick();
        }, 300);
    });

    cursorBack.addEventListener('touchend', function(e) {
        e.preventDefault(); // Предотвращаем стандартное поведение
        hideAllCursors();
        if (stepSound) {
            stepSound.currentTime = 0;
            stepSound.play();
        }
        
        setTimeout(() => {
            onBackClick();
        }, 300);
    });
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

    const isMobile = window.innerWidth <= 700;
    
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

    // Обработчик клика по стрелке прямо влево
    cursorProstoLeftArea.addEventListener('click', function(e) {
        console.log('🟡 Клик по стрелке прямо влево - обработчик из arrow_handlers.js запущен');
        e.preventDefault();
        e.stopPropagation();

        try {
            console.log('🟡 Скрываем все курсоры');
            hideAllCursors();
            
            if (stepSound) {
                console.log('🟡 Воспроизводим звук шага');
                stepSound.currentTime = 0;
                stepSound.play();
            }
            
            // Получаем элементы для анимации
            console.log('🟡 Ищем элементы для анимации...');
            const imageContainer = document.querySelector('.image-container');
            const currentImage = document.querySelector('.image');
            const nextImageContainer = document.querySelector('.next-image-container');
            
            console.log('🟡 Найденные элементы:', {
                imageContainer: !!imageContainer,
                currentImage: !!currentImage,
                nextImageContainer: !!nextImageContainer
            });
            
            if (!imageContainer || !currentImage || !nextImageContainer) {
                console.error('❌ Не все элементы найдены, прерываем выполнение');
                return;
            }

            console.log('🟡 Запускаем анимацию перехода (zoom-transition)');
            // Сначала запускаем анимацию перехода
            imageContainer.style.animationPlayState = 'paused';
            imageContainer.classList.add('zoom-transition');
            
            // Определяем следующую страницу и загружаем соответствующее изображение
            const nextPage = cursorProstoLeft.getAttribute('data-next-page');
            console.log('🟡 Следующая страница:', nextPage);
            
            if (nextPage === 'pk01.html') {
                // Для pk01.html загружаем соответствующее изображение
                if (isMobile) {
                    // В мобильной версии загружаем изображение, вписанное по высоте
                    nextImageContainer.style.backgroundImage = 'url("media/tumski/pk_01.jpg")';
                    nextImageContainer.style.backgroundPosition = 'left top';
                    nextImageContainer.style.backgroundSize = 'auto 100%';
                    console.log('🟡 Мобильная версия: загружено изображение pk_01.jpg, вписанное по высоте');
                } else {
                    // В десктопной версии загружаем полное изображение
                    nextImageContainer.style.backgroundImage = 'url("media/tumski/pk_01.jpg")';
                    nextImageContainer.style.backgroundPosition = 'center center';
                    nextImageContainer.style.backgroundSize = 'contain';
                    console.log('🟡 Десктопная версия: загружено полное изображение pk_01.jpg');
                }
            } else if (nextPage === 'ogrod08.html') {
                // Для ogrod08.html загружаем соответствующее изображение
                if (isMobile) {
                    // В мобильной версии загружаем изображение, вписанное по высоте
                    nextImageContainer.style.backgroundImage = 'url("media/tumski/ogrud_08.jpg")';
                    nextImageContainer.style.backgroundPosition = 'left top';
                    nextImageContainer.style.backgroundSize = 'auto 100%';
                    console.log('🟡 Мобильная версия: загружено изображение ogrud_08.jpg, вписанное по высоте');
                } else {
                    // В десктопной версии загружаем полное изображение
                    nextImageContainer.style.backgroundImage = 'url("media/tumski/ogrud_08.jpg")';
                    nextImageContainer.style.backgroundPosition = 'center center';
                    nextImageContainer.style.backgroundSize = 'contain';
                    console.log('🟡 Десктопная версия: загружено полное изображение ogrud_08.jpg');
                }
            } else if (nextPage === 'tumski15.html') {
                // Для tumski15.html загружаем соответствующее изображение
                if (isMobile) {
                    // В мобильной версии загружаем изображение, вписанное по высоте
                    nextImageContainer.style.backgroundImage = 'url("media/tumski/tumski_15.jpg")';
                    nextImageContainer.style.backgroundPosition = 'left top';
                    nextImageContainer.style.backgroundSize = 'auto 100%';
                    console.log('🟡 Мобильная версия: загружено изображение tumski_15.jpg, вписанное по высоте');
                } else {
                    // В десктопной версии загружаем полное изображение
                    nextImageContainer.style.backgroundImage = 'url("media/tumski/tumski_15.jpg")';
                    nextImageContainer.style.backgroundPosition = 'center center';
                    nextImageContainer.style.backgroundSize = 'contain';
                    console.log('🟡 Десктопная версия: загружено полное изображение tumski_15.jpg');
                }
            }
            
            console.log('🟡 Сразу начинаем плавно показывать next-image-container');
            // Сразу начинаем плавно показывать следующее изображение
            nextImageContainer.style.opacity = '1';
            
            console.log('🟡 Запускаем таймер для перехода на следующую страницу через 1500мс');
            // Через 1500мс (время анимации) переходим на следующую страницу
            setTimeout(() => {
                console.log('🟡 Таймер сработал, вызываем onForwardLeftClick callback');
                if (typeof onForwardLeftClick === 'function') {
                    onForwardLeftClick();
                } else {
                    console.warn('⚠️ onForwardLeftClick не является функцией');
                }
            }, 1500);
            
        } catch (error) {
            console.error('❌ Ошибка при обработке клика по стрелке прямо влево:', error);
        }
    });
    
    // Добавляем обработчик касания для мобильных устройств
    if (isMobile) {
        cursorProstoLeftArea.addEventListener('touchstart', function(e) {
            e.preventDefault();
            cursorProstoLeft.style.opacity = '1';
        });
        
        cursorProstoLeftArea.addEventListener('touchend', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            try {
                console.log('🟡 Касание по стрелке прямо влево - обработчик из arrow_handlers.js запущен');
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
                    console.error('❌ Не все элементы найдены, прерываем выполнение');
                    return;
                }

                console.log('🟡 Запускаем анимацию перехода (zoom-transition)');
                // Сначала запускаем анимацию перехода
                imageContainer.style.animationPlayState = 'paused';
                imageContainer.classList.add('zoom-transition');
                
                // Определяем следующую страницу и загружаем соответствующее изображение
                const nextPage = cursorProstoLeft.getAttribute('data-next-page');
                console.log('🟡 Следующая страница (touchend):', nextPage);
                
                if (nextPage === 'pk01.html') {
                    // Для pk01.html загружаем соответствующее изображение
                    if (isMobile) {
                        // В мобильной версии загружаем изображение, вписанное по высоте
                        nextImageContainer.style.backgroundImage = 'url("media/tumski/pk_01.jpg")';
                        nextImageContainer.style.backgroundPosition = 'left top';
                        nextImageContainer.style.backgroundSize = 'auto 100%';
                        console.log('🟡 Мобильная версия (touchend): загружено изображение pk_01.jpg, вписанное по высоте');
                    } else {
                        // В десктопной версии загружаем полное изображение
                        nextImageContainer.style.backgroundImage = 'url("media/tumski/pk_01.jpg")';
                        nextImageContainer.style.backgroundPosition = 'center center';
                        nextImageContainer.style.backgroundSize = 'contain';
                        console.log('🟡 Десктопная версия (touchend): загружено полное изображение pk_01.jpg');
                    }
                } else if (nextPage === 'ogrod08.html') {
                    // Для ogrod08.html загружаем соответствующее изображение
                    if (isMobile) {
                        // В мобильной версии загружаем изображение, вписанное по высоте
                        nextImageContainer.style.backgroundImage = 'url("media/tumski/ogrud_08.jpg")';
                        nextImageContainer.style.backgroundPosition = 'left top';
                        nextImageContainer.style.backgroundSize = 'auto 100%';
                        console.log('🟡 Мобильная версия (touchend): загружено изображение ogrud_08.jpg, вписанное по высоте');
                    } else {
                        // В десктопной версии загружаем полное изображение
                        nextImageContainer.style.backgroundImage = 'url("media/tumski/ogrud_08.jpg")';
                        nextImageContainer.style.backgroundPosition = 'center center';
                        nextImageContainer.style.backgroundSize = 'contain';
                        console.log('🟡 Десктопная версия (touchend): загружено полное изображение ogrud_08.jpg');
                    }
                } else if (nextPage === 'tumski15.html') {
                    // Для tumski15.html загружаем соответствующее изображение
                    if (isMobile) {
                        // В мобильной версии загружаем изображение, вписанное по высоте
                        nextImageContainer.style.backgroundImage = 'url("media/tumski/tumski_15.jpg")';
                        nextImageContainer.style.backgroundPosition = 'left top';
                        nextImageContainer.style.backgroundSize = 'auto 100%';
                        console.log('🟡 Мобильная версия (touchend): загружено изображение tumski_15.jpg, вписанное по высоте');
                    } else {
                        // В десктопной версии загружаем полное изображение
                        nextImageContainer.style.backgroundImage = 'url("media/tumski/tumski_15.jpg")';
                        nextImageContainer.style.backgroundPosition = 'center center';
                        nextImageContainer.style.backgroundSize = 'contain';
                        console.log('🟡 Десктопная версия (touchend): загружено полное изображение tumski_15.jpg');
                    }
                }
                
                console.log('🟡 Сразу начинаем плавно показывать next-image-container');
                // Сразу начинаем плавно показывать следующее изображение
                nextImageContainer.style.opacity = '1';
                
                console.log('🟡 Запускаем таймер для перехода на следующую страницу через 1500мс');
                // Через 1500мс (время анимации) переходим на следующую страницу
                setTimeout(() => {
                    console.log('🟡 Таймер сработал, вызываем onForwardLeftClick callback');
                    if (typeof onForwardLeftClick === 'function') {
                        onForwardLeftClick();
                    } else {
                        console.warn('⚠️ onForwardLeftClick не является функцией');
                    }
                }, 1500);
                
            } catch (error) {
                console.error('❌ Ошибка при обработке касания по стрелке прямо влево:', error);
            }
        });
    }
}

/**
 * Настраивает обработчик для стрелки вверх
 * @param {HTMLElement} cursor - Элемент курсора
 * @param {HTMLElement} cursorArea - Область курсора
 * @param {HTMLAudioElement} stepSound - Звук шага
 */
function setupUpArrowHandler(cursor, cursorArea, stepSound) {
    const isMobile = window.innerWidth <= 700;
    
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

    // Обработчик клика по стрелке вверх
    cursorArea.addEventListener('click', function(e) {
        e.preventDefault();
        hideAllCursors();
        if (stepSound) {
            stepSound.currentTime = 0;
            stepSound.play();
        }
        
        const nextPage = cursor.getAttribute('data-next-page');
        if (nextPage) {
            setTimeout(() => {
                window.location.href = nextPage;
            }, 300);
        }
    });
}

// Экспортируем функции в глобальную область видимости
window.setupRightArrowHandler = setupRightArrowHandler;
window.setupForwardArrowHandler = setupForwardArrowHandler;
window.setupForwardLeftArrowHandler = setupForwardLeftArrowHandler;
window.setupBackArrowHandler = setupBackArrowHandler;
window.setupLeftArrowHandler = setupLeftArrowHandler;
window.setupUpArrowHandler = setupUpArrowHandler;
window.hideAllCursors = hideAllCursors;

// Обработчик изменения размера окна для корректной работы на мобильных устройствах
window.addEventListener('resize', function() {
    const isMobile = window.innerWidth <= 700;
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
}); 