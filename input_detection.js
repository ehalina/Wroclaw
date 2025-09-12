/**
 * Скрипт определения типа ввода по возможностям указателя
 * Решает проблему с планшетами, где сайт открывается в десктопной версии
 * но нет возможности наведения курсора
 */

(function() {
    'use strict';
    
    // Проверяем, есть ли уже data-атрибут (избегаем повторной инициализации)
    if (document.documentElement.hasAttribute('data-input-type-detected')) {
        return;
    }
    
    /**
     * Определяет тип ввода устройства
     * @returns {string} 'desktop' | 'touch'
     */
    function detectInputType() {
        // Проверяем поддержку медиа-запросов
        if (window.matchMedia) {
            // Устройства с hover и точным указателем (мышь/трекпад)
            if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
                return 'desktop';
            }
            
            // Устройства без hover или с грубым указателем (touch/стилус)
            if (window.matchMedia('(hover: none) or (pointer: coarse)').matches) {
                return 'touch';
            }
        }
        
        // Fallback для старых браузеров
        // Проверяем размер экрана и наличие touch событий
        const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        const isSmallScreen = window.innerWidth <= 768;
        
        // Если есть touch И маленький экран - мобильное устройство
        if (hasTouch && isSmallScreen) {
            return 'touch';
        }
        
        // Если есть touch но большой экран - гибридное устройство (приоритет десктопу)
        if (hasTouch && !isSmallScreen) {
            return 'desktop';
        }
        
        // По умолчанию считаем десктопом
        return 'desktop';
    }
    
    /**
     * Применяет соответствующий режим к документу
     * @param {string} inputType - тип ввода
     */
    function applyInputMode(inputType) {
        const html = document.documentElement;
        
        // Удаляем старые классы
        html.classList.remove('input-desktop', 'input-touch');
        
        // Добавляем новый класс
        html.classList.add(`input-${inputType}`);
        
        // Добавляем data-атрибут для CSS
        html.setAttribute('data-input-type', inputType);
        
        // Помечаем, что определение уже выполнено
        html.setAttribute('data-input-type-detected', 'true');
        
        // Сохраняем в localStorage для переиспользования
        try {
            localStorage.setItem('input-type', inputType);
        } catch (e) {
            // Игнорируем ошибки localStorage
        }
        
        console.log(`Input type detected: ${inputType}`);
        console.log('Device info:', {
            hasTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
            screenWidth: window.innerWidth,
            hoverSupport: window.matchMedia ? window.matchMedia('(hover: hover)').matches : 'unknown',
            pointerFine: window.matchMedia ? window.matchMedia('(pointer: fine)').matches : 'unknown'
        });
    }
    
    /**
     * Принудительно применяет стили в зависимости от типа ввода
     * @param {string} inputType - тип ввода
     */
    function applyStylesByInputType(inputType) {
        // Ждем загрузки DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => applyStylesByInputType(inputType));
            return;
        }
        
        // Применяем стили с задержкой, чтобы все элементы успели загрузиться
        setTimeout(() => {
            const cursors = document.querySelectorAll('.custom-cursor, .custom-cursor-prosto, .custom-cursor-prosto-left, .custom-cursor-back, .custom-cursor-left, .custom-cursor-up');
            const cursorAreas = document.querySelectorAll('.custom-cursor-area, .custom-cursor-prostoarea, .custom-cursor-prosto-leftarea, .custom-cursor-backarea, .custom-cursor-leftarea, .custom-cursor-uparea');
            const paperaImages = document.querySelectorAll('.papera-image');
            const tumskiTexts = document.querySelectorAll('.tumski-text');
            const mapMarks = document.querySelectorAll('.map-mark');
            
            console.log(`Applying ${inputType} styles to:`, {
                cursors: cursors.length,
                cursorAreas: cursorAreas.length,
                paperaImages: paperaImages.length,
                tumskiTexts: tumskiTexts.length,
                mapMarks: mapMarks.length
            });
            
            if (inputType === 'desktop') {
                // Десктопный режим - элементы по наведению
                cursors.forEach(cursor => {
                    cursor.style.opacity = '0';
                    cursor.style.pointerEvents = 'none';
                    cursor.style.display = 'block';
                    cursor.style.visibility = 'visible';
                });
                
                cursorAreas.forEach(area => {
                    area.style.pointerEvents = 'auto';
                });
                
                paperaImages.forEach(img => {
                    img.style.opacity = '0';
                    img.style.transition = 'opacity 0.3s ease';
                    img.style.visibility = 'visible';
                    img.style.display = 'block';
                });
                
                tumskiTexts.forEach(text => {
                    text.style.opacity = '0';
                    text.style.transition = 'opacity 0.3s ease';
                    text.style.visibility = 'visible';
                    text.style.display = 'block';
                });
                
                mapMarks.forEach(mark => {
                    mark.style.opacity = '0';
                    mark.style.transition = 'opacity 0.3s ease';
                    mark.style.visibility = 'visible';
                    mark.style.display = 'block';
                });
                
                // Добавляем обработчики hover для десктопного режима
                addHoverHandlers();
            } else {
                // Тач-режим - элементы всегда видны
                cursors.forEach(cursor => {
                    cursor.style.opacity = '1';
                    cursor.style.pointerEvents = 'auto';
                    cursor.style.display = 'block';
                    cursor.style.visibility = 'visible';
                });
                
                cursorAreas.forEach(area => {
                    area.style.opacity = '1';
                    area.style.pointerEvents = 'auto';
                    area.style.display = 'block';
                    area.style.visibility = 'visible';
                });
                
                paperaImages.forEach(img => {
                    img.style.opacity = '1';
                    img.style.display = 'block';
                    img.style.pointerEvents = 'auto';
                    img.style.visibility = 'visible';
                });
                
                tumskiTexts.forEach(text => {
                    text.style.opacity = '1';
                    text.style.display = 'block';
                    text.style.pointerEvents = 'auto';
                    text.style.visibility = 'visible';
                });
                
                mapMarks.forEach(mark => {
                    mark.style.opacity = '1';
                    mark.style.display = 'block';
                    mark.style.pointerEvents = 'auto';
                    mark.style.visibility = 'visible';
                });
                
                // Удаляем обработчики hover для тач-режима
                removeHoverHandlers();
            }
        }, 100);
    }
    
    /**
     * Добавляет обработчики hover для десктопного режима
     * НЕ добавляем обработчики, так как arrow_handlers.js уже управляет hover эффектами
     */
    function addHoverHandlers() {
        // Не добавляем обработчики, так как arrow_handlers.js уже управляет hover эффектами
        // Просто убеждаемся, что стили применены правильно
        console.log('Hover effects are handled by arrow_handlers.js, skipping custom handlers');
    }
    
    /**
     * Удаляет обработчики hover
     */
    function removeHoverHandlers() {
        const cursorAreas = document.querySelectorAll('.custom-cursor-area, .custom-cursor-prostoarea, .custom-cursor-prosto-leftarea, .custom-cursor-backarea, .custom-cursor-leftarea, .custom-cursor-uparea');
        
        cursorAreas.forEach(area => {
            if (area._hoverHandlers) {
                area.removeEventListener('mouseenter', area._hoverHandlers.showCursor);
                area.removeEventListener('mouseleave', area._hoverHandlers.hideCursor);
                delete area._hoverHandlers;
            }
        });
    }
    
    /**
     * Проверяет, нужно ли переключить режим
     * @param {string} currentType - текущий тип
     * @returns {boolean}
     */
    function shouldSwitchMode(currentType) {
        // Проверяем, есть ли переопределение в localStorage
        try {
            const override = localStorage.getItem('input-type-override');
            if (override && (override === 'desktop' || override === 'touch')) {
                return override !== currentType;
            }
        } catch (e) {
            // Игнорируем ошибки localStorage
        }
        
        return false;
    }
    
    /**
     * Инициализирует определение типа ввода
     */
    function init() {
        // Проверяем, есть ли сохраненный тип
        let inputType = 'desktop';
        try {
            const saved = localStorage.getItem('input-type');
            if (saved && (saved === 'desktop' || saved === 'touch')) {
                inputType = saved;
            } else {
                inputType = detectInputType();
            }
        } catch (e) {
            inputType = detectInputType();
        }
        
        // Применяем режим
        applyInputMode(inputType);
        
        // Проверяем, нужно ли переключить режим
        if (shouldSwitchMode(inputType)) {
            const newType = inputType === 'desktop' ? 'touch' : 'desktop';
            applyInputMode(newType);
        }
    }
    
    // Запускаем инициализацию
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Дополнительная проверка через 1 секунду
    setTimeout(() => {
        const inputType = document.documentElement.getAttribute('data-input-type');
        if (inputType) {
            console.log('Re-applying styles after 1 second...');
            applyStylesByInputType(inputType);
        }
    }, 1000);
    
    // Добавляем обработчик изменения размера окна
    window.addEventListener('resize', () => {
        const currentType = document.documentElement.getAttribute('data-input-type');
        if (currentType) {
            // Переопределяем тип ввода при изменении размера
            const newType = detectInputType();
            if (newType !== currentType) {
                applyInputMode(newType);
            } else {
                // Применяем стили заново
                applyStylesByInputType(currentType);
            }
        }
    });
    
    // Экспортируем функции для внешнего использования
    window.InputDetection = {
        detectInputType,
        applyInputMode,
        applyStylesByInputType,
        getCurrentMode: () => document.documentElement.getAttribute('data-input-type')
    };
    
})();