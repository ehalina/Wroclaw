// Общий JavaScript код для всех tumski страниц
// Выносим дублирующийся код в отдельный файл

/**
 * Проверяет, включен ли звук
 * @returns {boolean} true если звук включен, false если выключен
 */
function isSoundEnabled() {
    const soundMuted = localStorage.getItem('soundMuted');
    // По умолчанию звук включен (если значение не установлено или 'false')
    return soundMuted !== 'true';
}

// Функции позиционирования для планшетов перенесены в common.js

/**
 * Общая инициализация для всех tumski страниц
 * @param {Object} options - опции инициализации
 * @param {Array} options.geometries - массив геометок для инициализации
 * @param {Array} options.quests - массив квестов для инициализации
 * @param {Function} options.customInit - дополнительная инициализация
 */
export async function initializeTumskiPage(options = {}) {
    const { geometries = [], quests = [], customInit } = options;
    
    // 1. Загрузка переводов и обновление контента
    try {
        await window.i18n.loadTranslations();
        window.i18n.updatePageContent();
    } catch (error) {
        console.error('Ошибка загрузки переводов:', error);
    }

    // 2. Подключение обработчиков для геометок
    try {
        const [cathedralMod, questMod] = await Promise.all([
            import('./tumski_cathedral_handler.js'),
            import('./quest_marker_handler.js')
        ]);

        // Инициализация универсальных геометок
        if (cathedralMod && typeof cathedralMod.setupUniversalGeoMarker === 'function') {
            geometries.forEach(geometry => {
                cathedralMod.setupUniversalGeoMarker(geometry);
            });
        }

        // Инициализация квестов
        if (questMod && typeof questMod.setupQuestGeoMarker === 'function') {
            quests.forEach(quest => {
                const questElement = document.getElementById(quest.markerId);
                if (questElement) {
                    questMod.setupQuestGeoMarker({
                        markerId: quest.markerId,
                        questNumber: parseInt(questElement.getAttribute('data-quest-number')),
                        questImage: questElement.getAttribute('data-quest-image')
                    });
                    
                    // Добавляем эффект свечения для геометки квеста
                    addQuestGlowEffect(questElement);
                }
            });
        }
    } catch (error) {
        console.error('Ошибка инициализации геометок:', error);
    }

    // 3. Инициализация языкового меню (только в главном окне SPA)
    if (window.parent === window && window.LanguageMenu && typeof window.LanguageMenu.init === 'function' && !document.querySelector('.language-menu')) {
        window.LanguageMenu.init();
    }

    // 4. Инициализация модального окна карты (только в главном окне SPA)
    if (window.parent === window && window.MapModal && typeof window.MapModal.init === 'function' && !document.querySelector('.map-and-quest-buttons')) {
        window.MapModal.init();
    }

    // 5. Применение общих стилей кнопок
    if (typeof applyCommonButtonStyles === 'function') {
        applyCommonButtonStyles();
    }

    // 6. Фоновая музыка управляется через SPA
    // console.log('🎵 Фоновая музыка управляется через SPA');

    // 7. Инициализация логики книги
    if (window.BookPaths && typeof window.BookPaths.initBookHandlers === 'function') {
        window.BookPaths.initBookHandlers();
    }

    // 8. Вызов функции возврата картинки из зума по двойному клику
    if (typeof window.setupResetAnimation === 'function') {
        window.setupResetAnimation(document.querySelector('.image-container'));
    }

    // 9. После всех инициализаций вызываем перенос геометок и стрелок
    try {
        const cathedralMod = await import('./tumski_cathedral_handler.js');
        
        if (cathedralMod && typeof cathedralMod.moveMarkersAndCursors === 'function') {
            cathedralMod.moveMarkersAndCursors();
        }
        
        // Позиционируем геометки и стрелки
        if (cathedralMod && typeof cathedralMod.positionMarkersOnBg === 'function') {
            await positionMarkersWithRetry(cathedralMod);
        }
        
        // Настраиваем отслеживание зума для геометок
        if (cathedralMod && typeof cathedralMod.setupZoomTracking === 'function') {
            cathedralMod.setupZoomTracking();
        }
        
        // Растягиваем изображения papera по размеру текста
        if (cathedralMod && typeof cathedralMod.stretchPaperaToTextWidth === 'function') {
            await stretchPaperaWithRetry(cathedralMod);
        }
    } catch (error) {
        console.error('Ошибка позиционирования элементов:', error);
    }

    // 10. Принудительное применение стилей в зависимости от типа ввода
    const inputType = document.documentElement.getAttribute('data-input-type') || 'desktop';
    // console.log('Current input type:', inputType);
    
    // Применяем стили через общий скрипт определения типа ввода
    if (window.InputDetection && typeof window.InputDetection.applyInputMode === 'function') {
        setTimeout(() => {
            window.InputDetection.applyInputMode(inputType);
        }, 500);
    } else if (inputType === 'touch') {
        setTimeout(() => {
            applyMobileStyles();
        }, 1000);
    }

    // 11. Добавляем обработчик изменения размера окна с debouncing
    addResizeHandler();

    // 12. Добавляем обработчик события load для изображения
    addLoadHandler();

    // 13. Позиционирование для планшетов теперь обрабатывается в tumski_cathedral_handler.js

    // 14. Вызываем дополнительную инициализацию если предоставлена
    if (customInit && typeof customInit === 'function') {
        customInit();
    }
}

/**
 * Позиционирование геометок с повторными попытками  */
 
async function positionMarkersWithRetry(cathedralMod) {
    cathedralMod.positionMarkersOnBg();
    
    // Дополнительные вызовы для гарантии
    setTimeout(() => {
        cathedralMod.positionMarkersOnBg();
    }, 500);
    
    setTimeout(() => {
        cathedralMod.positionMarkersOnBg();
    }, 1000);
} 

/**
 * Растягивание papera с повторными попытками
 */
async function stretchPaperaWithRetry(cathedralMod) {
    // Устанавливаем источник изображения для всех элементов papera
    const paperaImages = document.querySelectorAll('.papera-image');
    paperaImages.forEach(img => {
        if (!img.src || img.src === '') {
            img.src = 'media/papera1.png';
        }
    });
    
    cathedralMod.stretchPaperaToTextWidth();
    
    // Повторные вызовы через задержку для гарантии
    setTimeout(() => {
        cathedralMod.stretchPaperaToTextWidth();
    }, 100);
    
    setTimeout(() => {
        cathedralMod.stretchPaperaToTextWidth();
    }, 500);
}

/**
 * Добавление эффекта свечения для квестов
 */
function addQuestGlowEffect(questElement) {
    try {
        const styleId = 'quest-marker-glow-styles';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
                @keyframes markerGlowPulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.04); }
                    100% { transform: scale(1); }
                }

                @keyframes markerHaloPulse {
                    0% { box-shadow: 0 0 14px rgba(139, 69, 19, 0.45), 0 0 26px rgba(139, 69, 19, 0.25); }
                    50% { box-shadow: 0 0 24px rgba(139, 69, 19, 0.85), 0 0 44px rgba(139, 69, 19, 0.55); }
                    100% { box-shadow: 0 0 14px rgba(139, 69, 19, 0.45), 0 0 26px rgba(139, 69, 19, 0.25); }
                }

                .quest-marker-glow {
                    position: relative;
                    animation: markerGlowPulse 1.8s ease-in-out infinite;
                    display: inline-block;
                    background-position: center center;
                    background-repeat: no-repeat;
                    background-size: contain;
                    z-index: 1002;
                }

                .quest-marker-glow::after {
                    content: '';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: calc(100% + 20px);
                    height: calc(100% + 20px);
                    transform: translate(-50%, -50%);
                    border-radius: 50%;
                    pointer-events: none;
                    animation: markerHaloPulse 1.8s ease-in-out infinite;
                    z-index: 1002;
                }

                @media (prefers-reduced-motion: reduce) {
                    .quest-marker-glow, .quest-marker-glow::after {
                        animation: none !important;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        questElement.classList.add('quest-marker-glow');
    } catch (error) {
        console.error('Ошибка добавления эффекта свечения:', error);
    }
}

/**
 * Применение стилей для тач-устройств
 */
function applyMobileStyles() {
    const cursors = document.querySelectorAll('.custom-cursor, .custom-cursor-prosto, .custom-cursor-back, .custom-cursor-left, .custom-cursor-up, .custom-cursor-area, .custom-cursor-backarea, .custom-cursor-leftarea, .custom-cursor-uparea, .custom-cursor-prostoarea');
    cursors.forEach(cursor => {
        cursor.style.opacity = '1';
        cursor.style.display = 'block';
        cursor.style.pointerEvents = 'auto';
        cursor.style.visibility = 'visible';
        cursor.style.zIndex = '9999';
    });
    
    // Также показываем геометки для тач-устройств
    const markers = document.querySelectorAll('.map-mark-area, .map-mark, .papera-image, .tumski-text');
    markers.forEach(marker => {
        marker.style.opacity = '1';
        marker.style.display = 'block';
        marker.style.pointerEvents = 'auto';
        marker.style.visibility = 'visible';
    });
}

/**
 * Добавление обработчика изменения размера окна
 */
function addResizeHandler() {
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        
        resizeTimeout = setTimeout(async () => {
            try {
                const cathedralMod = await import('./tumski_cathedral_handler.js');
                if (cathedralMod && typeof cathedralMod.positionMarkersOnBg === 'function') {
                    cathedralMod.positionMarkersOnBg();
                }
                
                // Позиционирование для планшетов теперь обрабатывается в tumski_cathedral_handler.js
                // Дополнительно позиционируем стрелки по центру областей для планшетов
                if (window.positionCursorsInCenterOfAreas && window.matchMedia('(hover: none) and (pointer: coarse) and (min-width: 768px)').matches) {
                    setTimeout(() => {
                        window.positionCursorsInCenterOfAreas();
                    }, 200);
                }
            } catch (error) {
                console.error('Ошибка обработки изменения размера:', error);
            }
        }, 100);
    });
}

/**
 * Добавление обработчика события load
 */
function addLoadHandler() {
    window.addEventListener('load', async () => {
        try {
            const cathedralMod = await import('./tumski_cathedral_handler.js');
            if (cathedralMod && typeof cathedralMod.positionMarkersOnBg === 'function') {
                setTimeout(() => {
                    cathedralMod.positionMarkersOnBg();
                }, 200);
            }
        } catch (error) {
            console.error('Ошибка обработки события load:', error);
        }
    });
}

/**
 * Инициализация обработчиков стрелок
 */
export async function initializeArrowHandlers(arrowConfigs = []) {
    try {
        const cathedralMod = await import('./tumski_cathedral_handler.js');
        const stepSound = cathedralMod.createStepSound ? cathedralMod.createStepSound() : null;
        
        arrowConfigs.forEach(config => {
            const { type, cursor, cursorArea, handlerType, callback } = config;
            
            if (cursor && cursorArea) {
                // Определяем тип ввода по data-атрибуту
                const inputType = document.documentElement.getAttribute('data-input-type') || 'desktop';
                
                if (inputType === 'touch') {
                    // Тач: клик только по самому изображению стрелки
                    const handleClick = (e) => {
                        if (e) {
                            e.preventDefault();
                            e.stopPropagation();
                        }
                        if (stepSound && isSoundEnabled()) {
                            stepSound.play().then(() => {
                                if (callback) callback();
                            }).catch(() => {
                                if (callback) callback();
                            });
                        } else {
                            if (callback) callback();
                        }
                    };

                    // Навешиваем только на сам элемент курсора (картинку стрелки)
                    cursor.addEventListener('click', handleClick);
                    cursor.addEventListener('touchend', handleClick);
                } else {
                    // Десктопные обработчики
                    if (typeof window[handlerType] === 'function') {
                        window[handlerType](cursor, cursorArea, stepSound, callback);
                    }
                }
            }
        });
    } catch (error) {
        console.error('Ошибка инициализации обработчиков стрелок:', error);
    }
}
