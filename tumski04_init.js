// Инициализация для tumski04.html
// Этот файл передает в tumski_cathedral_handler.js только существующие геометки

console.log('🟡 tumski04_init.js загружен');

// Проверяем наличие основных элементов
document.addEventListener('DOMContentLoaded', () => {
    const imageElement = document.querySelector('.image');
    const nextImageContainer = document.querySelector('.next-image-container');
    const scene = document.querySelector('.scene');
    
    console.log('🟡 Основные элементы найдены:', {
        image: !!imageElement,
        nextImageContainer: !!nextImageContainer,
        scene: !!scene
    });
    
    if (imageElement) {
        console.log('🟡 .image найден, стили:', {
            width: imageElement.style.width,
            height: imageElement.style.height,
            backgroundImage: window.getComputedStyle(imageElement).backgroundImage
        });
    }
});

document.addEventListener('DOMContentLoaded', async function() {
    console.log('🟡 tumski04_init.js: DOMContentLoaded сработал');
    
    // 1. Загрузка переводов и обновление контента
    try {
        await window.i18n.loadTranslations();
        window.i18n.updatePageContent();
        console.log('🟡 Переводы загружены и контент обновлен');
    } catch (error) {
        console.error('❌ Ошибка загрузки переводов:', error);
    }

    // 2. Подключение обработчика для существующих геометок
    import('./tumski_cathedral_handler.js').then(mod => {
        if (mod && typeof mod.setupUniversalGeoMarker === 'function') {
            // Геометка Собор Святого Иоанна Крестителя
            mod.setupUniversalGeoMarker({
                markerId: 'tumski_cathedral',
                i18nKey: 'tumski_cathedral'
            });
            
            // Геометка Соборная церковь Святого Креста и Св. Варфоломея
            mod.setupUniversalGeoMarker({
                markerId: 'katedra_koscielna',
                i18nKey: 'katedra_koscielna'
            });
        }
    });

    // 3. Инициализация языкового меню
    if (window.LanguageMenu && typeof window.LanguageMenu.init === 'function') {
        window.LanguageMenu.init();
    }

    // 4. Инициализация модального окна карты
    if (window.MapModal && typeof window.MapModal.init === 'function') {
        window.MapModal.init();
    }

    // 5. Применение общих стилей кнопок
    if (typeof applyCommonButtonStyles === 'function') {
        applyCommonButtonStyles();
    }

    // 6. Запуск фоновой музыки (универсальный модуль)
    import('./background_music.js').then(mod => {
        if (mod && typeof mod.initBackgroundMusic === 'function') {
            mod.initBackgroundMusic();
        }
    });

    // 7. Инициализация логики книги (универсальный модуль)
    if (window.BookPaths && typeof window.BookPaths.initBookHandlers === 'function') {
        window.BookPaths.initBookHandlers();
    }

    // 8. Инициализация кастомных курсоров
    const cursor = document.querySelector('.custom-cursor');
    const cursorArea = document.querySelector('.custom-cursor-area');
    const cursorProsto = document.querySelector('.custom-cursor-prosto');
    const cursorProstoArea = document.querySelector('.custom-cursor-prostoarea');
    
    // Вызов функции возврата картинки из зума по двойному клику
    if (typeof window.setupResetAnimation === 'function') {
        window.setupResetAnimation(document.querySelector('.image-container'));
    }
    
    // Создаем звук шага
    let stepSound;

    // Инициализируем обработчики курсоров
    import('./tumski_cathedral_handler.js').then(mod => {
        if (mod.createStepSound) {
            stepSound = mod.createStepSound();
        }
        
        if (cursor && cursorArea) {
            if (typeof window.setupRightArrowHandler === 'function') {
                window.setupRightArrowHandler(cursor, cursorArea, stepSound);
            }
        }
        
        if (cursorProsto && cursorProstoArea) {
            if (typeof window.setupForwardArrowHandler === 'function') {
                window.setupForwardArrowHandler(cursorProsto, cursorProstoArea, stepSound, () => {
                    // Переход на следующую страницу
                    const nextPage = cursorProsto.getAttribute('data-next-page');
                    if (nextPage) {
                        window.location.href = nextPage;
                    } else {
                        console.error('Не указана следующая страница в атрибуте data-next-page');
                    }
                });
            }
        }
        
        // Добавляем обработчик для стрелки назад
        const cursorBack = document.querySelector('.custom-cursor-back');
        const cursorBackArea = document.querySelector('.custom-cursor-backarea');
        
        if (cursorBack && cursorBackArea) {
            if (typeof window.setupBackArrowHandler === 'function') {
                window.setupBackArrowHandler(cursorBack, cursorBackArea, stepSound, () => {
                    // Переход на предыдущую страницу
                    const prevPage = cursorBack.getAttribute('data-prev-page');
                    if (prevPage) {
                        window.location.href = prevPage;
                    } else {
                        console.error('Не указана предыдущая страница в атрибуте data-prev-page');
                    }
                });
            }
        }
    });

    // 9. После всех инициализаций вызываем перенос геометок и стрелок
    import('./tumski_cathedral_handler.js').then(mod => {
        console.log('🟡 tumski_cathedral_handler.js загружен:', mod);
        
        if (mod && typeof mod.moveMarkersAndCursors === 'function') {
            mod.moveMarkersAndCursors();
            console.log('🟡 moveMarkersAndCursors выполнен');
        }
        
        // Позиционируем геометки и стрелки
        if (mod && typeof mod.positionMarkersOnBg === 'function') {
            mod.positionMarkersOnBg();
            console.log('🟡 positionMarkersOnBg выполнен');
            
            // После позиционирования вызываем stretchPaperaToTextWidth
            if (mod && typeof mod.stretchPaperaToTextWidth === 'function') {
                setTimeout(() => {
                    mod.stretchPaperaToTextWidth();
                    console.log('🟡 stretchPaperaToTextWidth после positionMarkersOnBg');
                }, 100);
            }
            
            // Дополнительные вызовы для гарантии
            setTimeout(() => {
                mod.positionMarkersOnBg();
                console.log('🟡 positionMarkersOnBg повторно выполнен через 500мс');
                
                // И снова вызываем stretchPaperaToTextWidth
                if (mod && typeof mod.stretchPaperaToTextWidth === 'function') {
                    setTimeout(() => {
                        mod.stretchPaperaToTextWidth();
                        console.log('🟡 stretchPaperaToTextWidth повторно после positionMarkersOnBg');
                    }, 100);
                }
            }, 500);
            
            setTimeout(() => {
                mod.positionMarkersOnBg();
                console.log('🟡 positionMarkersOnBg повторно выполнен через 1000мс');
                
                // И финальный вызов stretchPaperaToTextWidth
                if (mod && typeof mod.stretchPaperaToTextWidth === 'function') {
                    setTimeout(() => {
                        mod.stretchPaperaToTextWidth();
                        console.log('🟡 Финальный stretchPaperaToTextWidth');
                    }, 100);
                }
            }, 1000);
        }
        
        // Настраиваем отслеживание зума для геометок
        if (mod && typeof mod.setupZoomTracking === 'function') {
            mod.setupZoomTracking();
            console.log('🟡 setupZoomTracking выполнен');
        }
        
        // Растягиваем изображения papera по размеру текста
        if (mod && typeof mod.stretchPaperaToTextWidth === 'function') {
            // Диагностика элементов papera перед вызовом
            const paperaImages = document.querySelectorAll('.papera-image');
            console.log('🟡 Найдено элементов papera-image:', paperaImages.length);
            
            // Устанавливаем источник изображения для всех элементов papera
            paperaImages.forEach((img, index) => {
                if (!img.src || img.src === '') {
                    img.src = 'media/papera1.png';
                    console.log(`🟡 Установлен src для papera-image ${index}:`, img.src);
                }
            });
            
            paperaImages.forEach((img, index) => {
                console.log(`🟡 papera-image ${index}:`, {
                    src: img.src,
                    alt: img.alt,
                    width: img.style.width,
                    height: img.style.height,
                    display: img.style.display,
                    opacity: img.style.opacity,
                    visibility: img.style.visibility,
                    zIndex: img.style.zIndex
                });
            });
            
            mod.stretchPaperaToTextWidth();
            console.log('🟡 stretchPaperaToTextWidth выполнен');
            
            // Проверяем элементы papera после вызова
            setTimeout(() => {
                console.log('🟡 Проверяем papera после stretchPaperaToTextWidth:');
                paperaImages.forEach((img, index) => {
                    console.log(`🟡 papera-image ${index} после обработки:`, {
                        src: img.src,
                        width: img.style.width,
                        height: img.style.height,
                        display: img.style.display,
                        opacity: img.style.opacity,
                        visibility: img.style.visibility,
                        zIndex: img.style.zIndex
                    });
                });
            }, 100);
            
            // Повторный вызов через задержку для гарантии
            setTimeout(() => {
                mod.stretchPaperaToTextWidth();
                console.log('🟡 stretchPaperaToTextWidth повторно выполнен через 500мс');
            }, 500);
        }
    }).catch(error => {
        console.error('❌ Ошибка загрузки tumski_cathedral_handler.js:', error);
    });
    
    // 10. Принудительное применение стилей для мобильной версии
    if (window.innerWidth <= 700) {
        setTimeout(() => {
            const cursors = document.querySelectorAll('.custom-cursor, .custom-cursor-prosto, .custom-cursor-area, .custom-cursor-prostoarea');
            cursors.forEach(cursor => {
                cursor.style.opacity = '1';
                cursor.style.display = 'block';
                cursor.style.pointerEvents = 'auto';
                cursor.style.visibility = 'visible';
                cursor.style.zIndex = '9999';
            });
        }, 1000);
    }
    
    // 11. Добавляем обработчик изменения размера окна с debouncing
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        
        resizeTimeout = setTimeout(() => {
            import('./tumski_cathedral_handler.js').then(mod => {
                if (mod && typeof mod.positionMarkersOnBg === 'function') {
                    mod.positionMarkersOnBg();
                }
            }).catch(err => {
                console.error('Ошибка импорта модуля при resize:', err);
            });
        }, 100);
    });
    
    // 12. Добавляем обработчик события load для изображения
    window.addEventListener('load', () => {
        console.log('🟡 Событие load сработало');
        
        // Проверяем загрузку изображений
        const imageElement = document.querySelector('.image');
        const nextImageContainer = document.querySelector('.next-image-container');
        
        if (imageElement) {
            const computedStyle = window.getComputedStyle(imageElement);
            const backgroundImage = computedStyle.backgroundImage;
            console.log('🟡 Фоновое изображение .image:', backgroundImage);
        }
        
        if (nextImageContainer) {
            const computedStyle = window.getComputedStyle(nextImageContainer);
            const backgroundImage = computedStyle.backgroundImage;
            console.log('🟡 Фоновое изображение .next-image-container:', backgroundImage);
        }
        
        import('./tumski_cathedral_handler.js').then(mod => {
            if (mod && typeof mod.positionMarkersOnBg === 'function') {
                setTimeout(() => {
                    mod.positionMarkersOnBg();
                    console.log('🟡 positionMarkersOnBg выполнен после load');
                }, 200);
            }
        }).catch(err => {
            console.error('❌ Ошибка импорта модуля при load:', err);
        });
    });
});
