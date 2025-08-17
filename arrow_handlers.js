/**
 * Скрывает все курсоры на странице, добавляя класс hide-cursors
 */
function hideAllCursors() {
    document.querySelectorAll('.custom-cursor, .custom-cursor-area, .custom-cursor-prosto, .custom-cursor-prostoarea, .custom-cursor-back, .custom-cursor-backarea').forEach(element => {
        element.classList.add('hide-cursors');
    });
}

/**
 * Настраивает обработчик для стрелки вправо
 * @param {HTMLElement} cursor - Элемент курсора
 * @param {HTMLElement} cursorArea - Область курсора
 * @param {HTMLAudioElement} stepSound - Звук шага
 */
function setupRightArrowHandler(cursor, cursorArea, stepSound) {
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
            window.location.href = 'tumski_02.html';
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
                window.location.href = 'tumski_02.html';
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

            console.log('🟡 Запускаем анимацию перехода (zoom-transition)');
            // Сначала запускаем анимацию перехода
            imageContainer.style.animationPlayState = 'paused';
            imageContainer.classList.add('zoom-transition');
            
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

                console.log('🟡 Запускаем анимацию перехода (zoom-transition)');
                // Сначала запускаем анимацию перехода
                imageContainer.style.animationPlayState = 'paused';
                imageContainer.classList.add('zoom-transition');
                
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
 * Настраивает обработчик для стрелки назад
 * @param {HTMLElement} cursorBack - Элемент курсора назад
 * @param {HTMLElement} cursorBackArea - Область курсора назад
 * @param {HTMLAudioElement} stepSound - Звук шага
 * @param {Function} onBackClick - Callback-функция для обработки клика
 */
function setupBackArrowHandler(cursorBack, cursorBackArea, stepSound, onBackClick) {
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
            onBackClick();
        }, 300);
    });
}

// Экспортируем функции в глобальную область видимости
window.setupRightArrowHandler = setupRightArrowHandler;
window.setupForwardArrowHandler = setupForwardArrowHandler;
window.setupBackArrowHandler = setupBackArrowHandler;
window.hideAllCursors = hideAllCursors;

// Обработчик изменения размера окна для корректной работы на мобильных устройствах
window.addEventListener('resize', function() {
    const isMobile = window.innerWidth <= 700;
    const cursors = document.querySelectorAll('.custom-cursor, .custom-cursor-prosto');
    
    cursors.forEach(cursor => {
        if (isMobile) {
            cursor.style.opacity = '1';
        } else {
            cursor.style.opacity = '0';
        }
    });
}); 