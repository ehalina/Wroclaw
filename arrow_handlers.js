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
    // Обработчик движения мыши над областью курсора
    cursorArea.addEventListener('mousemove', function(e) {
        cursor.style.display = 'block';
        cursor.style.left = e.clientX - 32 + 'px';
        cursor.style.top = e.clientY - 32 + 'px';
    });

    // Скрываем курсор при уходе мыши из области
    cursorArea.addEventListener('mouseleave', function() {
        cursor.style.display = 'none';
    });

    // Обработчик клика по стрелке вправо
    cursorArea.addEventListener('click', function() {
        hideAllCursors();
        stepSound.currentTime = 0;
        stepSound.play();
        setTimeout(() => {
            window.location.href = 'tumski_02.html';
        }, 300);
    });
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

            // Запускаем анимацию перехода
            imageContainer.style.animationPlayState = 'paused';
            imageContainer.classList.add('zoom-transition');
            
            // Запускаем анимацию fade
            setTimeout(() => {
                currentImage.classList.add('fade-out');
                nextImageContainer.classList.add('fade-in');
                
                // Вызываем callback для перехода на следующую страницу
                setTimeout(() => {
                    onForwardClick();
                }, 500);
            }, 1000);
        } catch (error) {
            console.error('Ошибка при обработке клика:', error);
        }
    });
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