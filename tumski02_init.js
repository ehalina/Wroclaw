// Инициализация для tumski.html
// Этот файл передает в tumski_cathedral_handler.js все геометки, присутствующие на странице



document.addEventListener('DOMContentLoaded', async function() {

    
    // 1. Загрузка переводов и обновление контента
    try {
        await window.i18n.loadTranslations();
        window.i18n.updatePageContent();

    } catch (error) {

    }

    // 2. Подключение обработчика для всех геометок
    import('./tumski_cathedral_handler.js').then(mod => {
        if (mod && typeof mod.setupUniversalGeoMarker === 'function') {

            // Геометка Тумский остров
            mod.setupUniversalGeoMarker({
                markerId: 'tumski',
                i18nKey: 'tumski'
            });
            
            // Геометка Собор Святого Иоанна Крестителя
            mod.setupUniversalGeoMarker({
                markerId: 'tumski_cathedral',
                i18nKey: 'tumski_cathedral'
            });
            
            // Геометка Тумский мост
            mod.setupUniversalGeoMarker({
                markerId: 'tumski_most',
                i18nKey: 'tumski_most'
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
    const cursorLeft = document.querySelector('.custom-cursor-left');
    const cursorLeftArea = document.querySelector('.custom-cursor-leftarea');
    
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
        
        if (cursorLeft && cursorLeftArea) {
            if (typeof window.setupLeftArrowHandler === 'function') {
                window.setupLeftArrowHandler(cursorLeft, cursorLeftArea, stepSound, () => {
                    // Переход на следующую страницу
                    const nextPage = cursorLeft.getAttribute('data-next-page');
                    if (nextPage) {
                        window.location.href = nextPage;
                    }
                });
            }
        }
    });

    // 9. После всех инициализаций вызываем перенос геометок и стрелок
    import('./tumski_cathedral_handler.js').then(mod => {

        
        if (mod && typeof mod.moveMarkersAndCursors === 'function') {
            mod.moveMarkersAndCursors();

        }
        
        // Позиционируем геометки и стрелки
        if (mod && typeof mod.positionMarkersOnBg === 'function') {
            mod.positionMarkersOnBg();

            
            // После позиционирования вызываем stretchPaperaToTextWidth
            if (mod && typeof mod.stretchPaperaToTextWidth === 'function') {
                setTimeout(() => {
                    mod.stretchPaperaToTextWidth();

                }, 100);
            }
            
            // Дополнительные вызовы для гарантии
            setTimeout(() => {
                mod.positionMarkersOnBg();

                
                // И снова вызываем stretchPaperaToTextWidth
                if (mod && typeof mod.stretchPaperaToTextWidth === 'function') {
                    setTimeout(() => {
                        mod.stretchPaperaToTextWidth();

                    }, 100);
                }
            }, 500);
            
            setTimeout(() => {
                mod.positionMarkersOnBg();

                
                // И финальный вызов stretchPaperaToTextWidth
                if (mod && typeof mod.stretchPaperaToTextWidth === 'function') {
                    setTimeout(() => {
                        mod.stretchPaperaToTextWidth();

                    }, 100);
                }
            }, 1000);
        }
        
        // Настраиваем отслеживание зума для геометок
        if (mod && typeof mod.setupZoomTracking === 'function') {
            mod.setupZoomTracking();

        }
        
        // Растягиваем изображения papera по размеру текста
        if (mod && typeof mod.stretchPaperaToTextWidth === 'function') {
            // Диагностика элементов papera перед вызовом
            const paperaImages = document.querySelectorAll('.papera-image');

            
            // Устанавливаем источник изображения для всех элементов papera
            paperaImages.forEach((img, index) => {
                if (!img.src || img.src === '') {
                    img.src = 'media/papera1.png';

                }
            });
            
            paperaImages.forEach((img, index) => {

            });
            
            mod.stretchPaperaToTextWidth();

            
            // Проверяем элементы papera после вызова
            setTimeout(() => {

            }, 100);
            
            // Повторный вызов через задержку для гарантии
            setTimeout(() => {
                mod.stretchPaperaToTextWidth();

            }, 500);
        }
    }).catch(error => {

    });
    
    // 10. Принудительное применение стилей для мобильной версии
    if (window.innerWidth <= 700) {
        setTimeout(() => {
            const cursors = document.querySelectorAll('.custom-cursor-left, .custom-cursor-leftarea');
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

            });
        }, 100);
    });
    
    // 12. Добавляем обработчик события load для изображения
    window.addEventListener('load', () => {

        
        // Проверяем загрузку изображений
        const imageElement = document.querySelector('.image');
        const nextImageContainer = document.querySelector('.next-image-container');
        
        if (imageElement) {
            const computedStyle = window.getComputedStyle(imageElement);
            const backgroundImage = computedStyle.backgroundImage;

        }
        
        if (nextImageContainer) {
            const computedStyle = window.getComputedStyle(nextImageContainer);
            const backgroundImage = computedStyle.backgroundImage;

        }
        
        import('./tumski_cathedral_handler.js').then(mod => {
            if (mod && typeof mod.positionMarkersOnBg === 'function') {
                setTimeout(() => {
                    mod.positionMarkersOnBg();

                }, 200);
            }
        }).catch(err => {

        });
    });
});
