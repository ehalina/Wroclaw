// Инициализация для tumski.html
// Этот файл передает в tumski_cathedral_handler.js все геометки, присутствующие на странице

import { getMapPointCoords } from './map_points.js';

document.addEventListener('DOMContentLoaded', async function() {
    // Получаем номер точки для текущей страницы
    const imageContainer = document.querySelector('.image-container');
    const mapPoint = parseInt(imageContainer.getAttribute('data-map-point')) || 1; // По умолчанию 1 для главной страницы
    const coords = getMapPointCoords(mapPoint);
    if (coords) {
        console.log(`Current map point coordinates: x=${coords.x}, y=${coords.y}`);
        // Сохраняем координаты в data-атрибутах для использования в других модулях
        imageContainer.setAttribute('data-map-x', coords.x);
        imageContainer.setAttribute('data-map-y', coords.y);
    }

    // 1. Загрузка переводов и обновление контента
    try {
        await window.i18n.loadTranslations();
        window.i18n.updatePageContent();
    } catch (error) {
        console.error('Error loading translations:', error);
    }

    // 2. Подключение обработчиков для всех геометок
    import('./tumski_cathedral_handler.js').then(mod => {
        if (mod && typeof mod.setupUniversalGeoMarker === 'function') {
            // Геометка Святая Ядвига
            mod.setupUniversalGeoMarker({
                markerId: 'swieta_jadwiga',
                i18nKey: 'swieta_jadwiga'
            });

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
                console.log(`Papera image ${index}:`, img.src, img.offsetWidth, img.offsetHeight);
            });

            mod.stretchPaperaToTextWidth();

            // Проверяем элементы papera после вызова
            setTimeout(() => {
                console.log('After stretchPaperaToTextWidth:');
            }, 100);

            // Повторный вызов через задержку для гарантии
            setTimeout(() => {
                mod.stretchPaperaToTextWidth();
            }, 500);
        }
    }).catch(error => {
        console.error('Error initializing tumski_cathedral_handler:', error);
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
                console.error('Error repositioning markers on resize:', err);
            });
        }, 100);
    });

    // 12. Добавляем обработчик события load для изображения
    window.addEventListener('load', () => {
        console.log('Window loaded, repositioning markers...');

        // Проверяем загрузку изображений
        const imageElement = document.querySelector('.image');
        const nextImageContainer = document.querySelector('.next-image-container');

        if (imageElement) {
            const computedStyle = window.getComputedStyle(imageElement);
            const backgroundImage = computedStyle.backgroundImage;
            console.log('Main image background:', backgroundImage);
        }

        if (nextImageContainer) {
            const computedStyle = window.getComputedStyle(nextImageContainer);
            const backgroundImage = computedStyle.backgroundImage;
            console.log('Next image background:', backgroundImage);
        }

        import('./tumski_cathedral_handler.js').then(mod => {
            if (mod && typeof mod.positionMarkersOnBg === 'function') {
                setTimeout(() => {
                    mod.positionMarkersOnBg();
                    console.log('Markers repositioned after window load');
                }, 200);
            }
        }).catch(err => {
            console.error('Error repositioning markers on load:', err);
        });
    });
});
