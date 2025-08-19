// Пути к изображениям книг
const BOOK_PATHS = {
    BOOK_IMAGE: 'media/book/book.jpg',
    BOOK_IMAGE_02: 'media/book/book02.jpg',
    BOOK_IMAGE_13: 'media/book/book13.jpg',
    BOOK_IMAGE_22: 'media/book/book22.jpg',
    BOOK_IMAGE_31: 'media/book/book31.jpg',
    BOOK_IMAGE_32: 'media/book/book32.jpg',
    BOOK_IMAGE_42: 'media/book/book42.jpg',
    BOOK_IMAGE_41: 'media/book/book41.jpg'
};

// Отслеживание z-index для изображений (в диапазоне 3-9)
let currentMaxZIndex = 3;

// Флаг для отслеживания первого открытия
let isFirstOpen = true;

// Глобальная переменная для отслеживания активной геометки
window.activeGeoMarker = null;

// Функция для получения следующего z-index
function getNextZIndex() {
    currentMaxZIndex = currentMaxZIndex >= 9 ? 3 : currentMaxZIndex + 1;
    return currentMaxZIndex;
}

// Функция для последовательной подсветки зон
async function highlightZonesSequentially(zones, currentIndex) {
    if (!zones || zones.length === 0) {
        return;
    }

    if (currentIndex >= zones.length) {
        return;
    }

    const zone = zones[currentIndex];
    
    // Добавляем класс подсветки
    zone.classList.add('highlight');
    
    // Запускаем следующую зону через 1200мс (до того, как текущая погаснет)
    if (currentIndex < zones.length - 1) {
        setTimeout(() => {
            highlightZonesSequentially(zones, currentIndex + 1);
        }, 1200); // Следующая зона начнет подсвечиваться за 400мс до того, как текущая погаснет
    }
    
    // Убираем подсветку текущей зоны через 1600мс
    setTimeout(() => {
        zone.classList.remove('highlight');
    }, 1600);
}

// Экспортируем функцию для использования в HTML
window.showInitialHighlight = function() {
    
    // Принудительно открываем книгу на ZONE_1 при запуске подсветки
    if (window.forceOpenBookOnZone1) {
        window.forceOpenBookOnZone1();
    }
    
    // Получаем зоны в правильном порядке (1, 2, 3, 4)
    const zones = [];
    for (let i = 1; i <= 4; i++) {
        const zone = document.querySelector(`.right-zones .book-zone.zone-${i}`);
        if (zone) {
            zones.push(zone);
        }
    }
    
    if (zones.length === 0) {
        return;
    }

    // Сбрасываем все подсветки перед началом анимации
    zones.forEach(zone => {
        zone.classList.remove('highlight');
    });

    // Запускаем анимацию
    highlightZonesSequentially(zones, 0);
};

// Функция для обновления текста в модальном окне
function updateModalText(zoneNumber) {
    // console.log('updateModalText вызвана с зоной:', zoneNumber);
    // console.log('Стек вызовов:', new Error().stack);
    
    let rightTextBlock = document.querySelector('.most-text-block-right');
    let leftTextBlock = document.querySelector('.most-text-block-left');
    
    // Если блоки не найдены, попробуем найти их в модальном окне
    if (!rightTextBlock || !leftTextBlock) {
        const mostOverlay = document.querySelector('.most-overlay');
        if (mostOverlay) {
            const rightBlock = mostOverlay.querySelector('.most-text-block-right');
            const leftBlock = mostOverlay.querySelector('.most-text-block-left');
            if (rightBlock) rightTextBlock = rightBlock;
            if (leftBlock) leftTextBlock = leftBlock;
        }
    }
    
    if (!rightTextBlock || !leftTextBlock) {
        // console.log('Текстовые блоки не найдены');
        // console.log('rightTextBlock:', rightTextBlock);
        // console.log('leftTextBlock:', leftTextBlock);
        return;
    }
    
    // console.log('Структура правого блока:', rightTextBlock.innerHTML);
    // console.log('Структура левого блока:', leftTextBlock.innerHTML);
    
    // Получаем текущий язык
    const currentLang = window.currentLanguage || 'ru';
    
    // Определяем, какая секция активна в зависимости от того, какая геометка была нажата
    let section = 'tumski_most'; // по умолчанию
    
    // Используем глобальную переменную для определения активной геометки
    if (window.activeGeoMarker) {
        // console.log('Активная геометка из глобальной переменной:', window.activeGeoMarker);
        
        if (window.activeGeoMarker === 'tumski_cathedral') {
            section = 'tumski_cathedral';
        } else if (window.activeGeoMarker === 'tumski_most') {
            section = 'tumski_most';
        } else if (window.activeGeoMarker === 'katedra_koscielna') {
            section = 'katedra_koscielna';
        } else if (window.activeGeoMarker === 'tumski') {
            section = 'tumski';
        } else if (window.activeGeoMarker === 'swieta_jadwiga') {
            section = 'swieta_jadwiga';
        } else if (window.activeGeoMarker === 'jan_nepomuk') {
            section = 'jan_nepomuk';
        }
    } else {
        // Fallback: проверяем DOM элементы
        const activeMarker = document.querySelector('.map-mark-area.active') || 
                            document.querySelector('.map-mark-area:hover') ||
                            document.querySelector('#tumski_most') ||
                            document.querySelector('#tumski_cathedral');
        
        if (activeMarker) {
            const markerId = activeMarker.id || activeMarker.getAttribute('data-marker-id');
            // console.log('Активная геометка из DOM:', markerId);
            
            if (markerId === 'tumski_cathedral' || markerId === 'tumski_cathedral-text') {
                section = 'tumski_cathedral';
            } else if (markerId === 'tumski_most' || markerId === 'tumski_most-text') {
                section = 'tumski_most';
            } else if (markerId === 'katedra_koscielna' || markerId === 'katedra_koscielna-text') {
                section = 'katedra_koscielna';
            } else if (markerId === 'tumski' || markerId === 'tumski-text') {
                section = 'tumski';
            } else if (markerId === 'swieta_jadwiga' || markerId === 'swieta_jadwiga-text') {
                section = 'swieta_jadwiga';
            } else if (markerId === 'jan_nepomuk' || markerId === 'jan-nepomuk-text' || markerId === 'jan_nepomuk-text') {
                section = 'jan_nepomuk';
            }
        }
    }
    
    // console.log('Используется секция переводов:', section);
    
    // Получаем переводы
    let translations = null;
    if (window.i18n && window.i18n.t) {
        // Получаем переводы через функцию t
        const testKey = 'tumski.title';
        const testTranslation = window.i18n.t(testKey);
        if (testTranslation !== testKey) {
            // Если переводы загружены, используем их
            translations = window.i18n.translations || {};
        }
    }
    
    // Если переводы не найдены, попробуем получить их напрямую
    if (!translations) {
        if (window.translations) {
            translations = window.translations;
        }
    }
    
    if (translations && translations[section] && translations[section].book02) {
        const bookData = translations[section].book02;
        // console.log('Найдены переводы для секции:', section, 'bookData:', bookData);
        
        // Обновляем правый текст
        const rightZoneKey = `zone${zoneNumber}`;
        // console.log('Ищем правый ключ:', rightZoneKey);
        if (bookData[rightZoneKey]) {
            const rightTitle = rightTextBlock.querySelector('.most-title');
            const rightText = rightTextBlock.querySelector('.most-description');
            
            // console.log('Элементы правого блока:', { rightTitle, rightText });
            // console.log('Обновляем правый текст:', bookData[rightZoneKey]);
            
            if (rightTitle) {
                rightTitle.innerHTML = bookData[rightZoneKey].title || '';
                // console.log('Правый заголовок обновлен:', rightTitle.innerHTML);
            } else {
                // console.log('Правый заголовок не найден');
            }
            
            if (rightText) {
                rightText.innerHTML = bookData[rightZoneKey].text || '';
                // console.log('Правый текст обновлен:', rightText.innerHTML);
            } else {
                // console.log('Правый текст не найден');
            }
        } else {
            // console.log('Правый ключ не найден:', rightZoneKey);
        }
        
        // Обновляем левый текст
        const leftZoneKey = `zone${zoneNumber}-2`;
        // console.log('Ищем левый ключ:', leftZoneKey);
        if (bookData[leftZoneKey]) {
            const leftTitle = leftTextBlock.querySelector('.most-title');
            const leftText = leftTextBlock.querySelector('.most-description');
            
            // console.log('Элементы левого блока:', { leftTitle, leftText });
            // console.log('Обновляем левый текст:', bookData[leftZoneKey]);
            
            if (leftTitle) {
                leftTitle.innerHTML = bookData[leftZoneKey].title || '';
                // console.log('Левый заголовок обновлен:', leftTitle.innerHTML);
            } else {
                // console.log('Левый заголовок не найден');
            }
            
            if (leftText) {
                leftText.innerHTML = bookData[leftZoneKey].text || '';
                // console.log('Левый текст обновлен:', leftText.innerHTML);
            } else {
                // console.log('Левый текст не найден');
            }
        } else {
            // console.log('Левый ключ не найден:', leftZoneKey);
        }
    } else {
        // console.log('Переводы не найдены. translations:', translations, 'section:', section);
    }
}

// Функция для принудительного открытия книги на ZONE_1 при открытии любой геометки
function forceOpenBookOnZone1() {
    // console.log('forceOpenBookOnZone1: Принудительно открываем книгу на ZONE_1');
    
    // Скрываем все изображения, чтобы показать базовое изображение книги
    const overlayImg = document.querySelector('.overlay-image');
    const additionalImg = document.querySelector('.additional-image');
    const book31Img = document.querySelector('.book-31-image');
    const book32Img = document.querySelector('.book-32-image');
    
    if (overlayImg) overlayImg.style.display = 'none';
    if (additionalImg) additionalImg.style.display = 'none';
    if (book31Img) {
        book31Img.style.display = 'none';
        book31Img.src = window.BookPaths.BOOK_IMAGE_31;
    }
    if (book32Img) book32Img.style.display = 'none';
    
    // Обновляем видимость зон - показываем только правые зоны, левые скрываем
    const rightZones = document.querySelector('.right-zones');
    const leftZones = document.querySelector('.left-zones');
    if (rightZones && leftZones) {
        updateZonesVisibility(rightZones, leftZones, [
            { side: 'right', numbers: [1, 2, 3, 4] }, // Справа видимы все зоны
            { side: 'left', numbers: [] }             // Слева все скрыты
        ]);
    }
    
    // Обновляем текст для зоны 1
    updateModalText(1);
    
    // console.log('forceOpenBookOnZone1: Книга открыта на ZONE_1');
}

// Функция для управления видимостью зон
function updateZonesVisibility(rightZones, leftZones, visibleZones) {
    // Скрываем все зоны
    const allZones = [...rightZones.children, ...leftZones.children];
    allZones.forEach(zone => {
        zone.style.display = 'none';
    });

    // Показываем нужные зоны
    visibleZones.forEach(({side, numbers}) => {
        const container = side === 'right' ? rightZones : leftZones;
        numbers.forEach(num => {
            const zone = container.querySelector(`.zone-${num}`);
            if (zone) {
                zone.style.display = 'block';
            }
        });
    });
}

// Настройки зон-кнопок
const BOOK_ZONES_CONFIG = {
    rightContainer: {
        top: '0',
        right: '0',
        width: '10%',
        height: '100%',
        position: 'absolute'
    },
    leftContainer: {
        top: '0',
        left: '0',
        width: '10%',
        height: '100%',
        position: 'absolute'
    },
    zones: {
        right: {
            ZONE_1: {
                top: '4%',
                height: '7%',
                onClick: (overlayImg, additionalImg, book31Img, book32Img, bookSound) => {
                    // Скрываем все изображения
                    if (overlayImg) overlayImg.style.display = 'none';
                    if (additionalImg) additionalImg.style.display = 'none';
                    if (book31Img) {
                        book31Img.style.display = 'none';
                        book31Img.src = window.BookPaths.BOOK_IMAGE_31;
                    }
                    if (book32Img) book32Img.style.display = 'none';

                    if (window.playMapSound) window.playMapSound();

                    // Обновляем текст для зоны 1
                    updateModalText(1);

                    // Обновляем видимость зон
                    const rightZones = document.querySelector('.right-zones');
                    const leftZones = document.querySelector('.left-zones');
                    updateZonesVisibility(rightZones, leftZones, [
                        { side: 'right', numbers: [1, 2, 3, 4] }, // Справа видимы все
                        { side: 'left', numbers: [] }             // Слева все скрыты
                    ]);
                }
            },
            ZONE_2: {
                top: '11%',
                height: '7%',
                overlayImage: {
                    src: 'BOOK_IMAGE_13',
                    style: {
                        position: 'absolute',
                        top: '0',
                        left: '0',
                        height: '100%',
                        width: 'auto',
                        objectFit: 'contain',
                        display: 'none',
                        zIndex: 3
                    }
                },
                additionalImage: {
                    src: 'BOOK_IMAGE_22',
                    style: {
                        position: 'absolute',
                        top: '0',
                        right: '0',
                        height: 'auto',
                        maxHeight: '33%',
                        width: 'auto',
                        objectFit: 'contain',
                        display: 'none',
                        zIndex: 3
                    }
                },
                onClick: (overlayImg, additionalImg, book31Img, book32Img, bookSound) => {
                    // Сначала скрываем все изображения
                    if (overlayImg) overlayImg.style.display = 'none';
                    if (additionalImg) additionalImg.style.display = 'none';
                    if (book31Img) {
                        book31Img.style.display = 'none';
                        book31Img.src = window.BookPaths.BOOK_IMAGE_31;
                    }
                    if (book32Img) book32Img.style.display = 'none';

                    // Затем показываем только нужные
                    if (overlayImg) {
                        overlayImg.style.display = 'block';
                        // Применяем правильные стили для мобильных устройств
                        if (window.innerWidth <= 768) {
                            overlayImg.style.height = 'auto';
                            overlayImg.style.width = '100%';
                            overlayImg.style.maxHeight = '100vh';
                        } else {
                            overlayImg.style.height = '100%';
                            overlayImg.style.width = 'auto';
                            overlayImg.style.maxHeight = '';
                        }
                    }
                    if (additionalImg) {
                        additionalImg.src = window.BookPaths.BOOK_IMAGE_22;
                        additionalImg.style.display = 'block';
                    }
                    
                    if (window.playMapSound) window.playMapSound();

                    // Обновляем текст для зоны 2
                    updateModalText(2);

                    // Обновляем видимость зон
                    const rightZones = document.querySelector('.right-zones');
                    const leftZones = document.querySelector('.left-zones');
                    updateZonesVisibility(rightZones, leftZones, [
                        { side: 'right', numbers: [1, 2, 3, 4] }, // Справа видимы все зоны на своих местах
                        { side: 'left', numbers: [1] }             // Слева видима только 1
                    ]);
                }
            },
            ZONE_3: {
                top: '18%',
                height: '7%',
                overlayImage: {
                    src: 'BOOK_IMAGE_13',
                    style: {
                        position: 'absolute',
                        top: '0',
                        left: '0',
                        height: '100%',
                        width: 'auto',
                        objectFit: 'contain',
                        display: 'none',
                        zIndex: 3
                    }
                },
                additionalImages: [
                    {
                        src: 'BOOK_IMAGE_31',
                        style: {
                            position: 'absolute',
                            top: '0',
                            left: '0',
                            height: 'auto',
                            maxHeight: '33%',
                            width: 'auto',
                            objectFit: 'contain',
                            display: 'none',
                            zIndex: 3
                        }
                    },
                    {
                        src: 'BOOK_IMAGE_32',
                        style: {
                            position: 'absolute',
                            top: '0',
                            right: '0',
                            height: 'auto',
                            maxHeight: '33%',
                            width: 'auto',
                            objectFit: 'contain',
                            display: 'none',
                            zIndex: 3
                        }
                    }
                ],
                onClick: (overlayImg, additionalImg, book31Img, book32Img, bookSound) => {
                    // Сначала скрываем все изображения
                    if (overlayImg) overlayImg.style.display = 'none';
                    if (additionalImg) {
                        additionalImg.style.display = 'none';
                        additionalImg.src = window.BookPaths.BOOK_IMAGE_22;
                    }
                    if (book31Img) {
                        book31Img.style.display = 'none';
                        book31Img.src = window.BookPaths.BOOK_IMAGE_31;
                    }

                    // Затем показываем только нужные
                    if (overlayImg) overlayImg.style.display = 'block';
                    if (book31Img) book31Img.style.display = 'block';
                    if (book32Img) book32Img.style.display = 'block';
                    
                    if (window.playMapSound) window.playMapSound();

                    // Обновляем видимость зон
                    const rightZones = document.querySelector('.right-zones');
                    const leftZones = document.querySelector('.left-zones');
                    updateZonesVisibility(rightZones, leftZones, [
                        { side: 'right', numbers: [1, 2, 3, 4] }, // Справа видимы все зоны на своих местах
                        { side: 'left', numbers: [1, 2] }          // Слева видимы 1,2
                    ]);
                }
            },
            ZONE_4: {
                top: '25%',
                height: '7%',
                overlayImage: {
                    src: 'BOOK_IMAGE_13',
                    style: {
                        position: 'absolute',
                        top: '0',
                        left: '0',
                        height: '100%',
                        width: 'auto',
                        objectFit: 'contain',
                        display: 'none',
                        zIndex: 3
                    }
                },
                additionalImages: [
                    {
                        src: 'BOOK_IMAGE_41',
                        style: {
                            position: 'absolute',
                            top: '0',
                            left: '0',
                            height: 'auto',
                            maxHeight: '33%',
                            width: 'auto',
                            objectFit: 'contain',
                            display: 'none',
                            zIndex: 3
                        }
                    },
                    {
                        src: 'BOOK_IMAGE_42',
                        style: {
                            position: 'absolute',
                            top: '0',
                            right: '0',
                            height: 'auto',
                            maxHeight: '33%',
                            width: 'auto',
                            objectFit: 'contain',
                            display: 'none',
                            zIndex: 3
                        }
                    }
                ],
                onClick: (overlayImg, additionalImg, book31Img, book32Img, bookSound) => {
                    // Сначала скрываем все изображения
                    if (overlayImg) overlayImg.style.display = 'none';
                    if (additionalImg) additionalImg.style.display = 'none';
                    if (book31Img) book31Img.style.display = 'none';
                    if (book32Img) book32Img.style.display = 'none';

                    // Затем показываем только нужные
                    if (overlayImg) overlayImg.style.display = 'block';
                    if (book31Img) {
                        book31Img.src = window.BookPaths.BOOK_IMAGE_41;
                        book31Img.style.display = 'block';
                    }
                    if (additionalImg) {
                        additionalImg.src = window.BookPaths.BOOK_IMAGE_42;
                        additionalImg.style.display = 'block';
                    }
                    
                    if (window.playMapSound) window.playMapSound();

                    // Обновляем видимость зон
                    const rightZones = document.querySelector('.right-zones');
                    const leftZones = document.querySelector('.left-zones');
                    updateZonesVisibility(rightZones, leftZones, [
                        { side: 'right', numbers: [1, 2, 3, 4] }, // Справа видимы все зоны на своих местах
                        { side: 'left', numbers: [1, 2, 3] }      // Слева видимы 1,2,3
                    ]);
                }
            }
        },
        left: {
            ZONE_1: {
                top: '4%',
                height: '7%',
                onClick: (overlayImg, additionalImg, book31Img, book32Img, bookSound) => {
                    // Скрываем все изображения
                    if (overlayImg) overlayImg.style.display = 'none';
                    if (additionalImg) additionalImg.style.display = 'none';
                    if (book31Img) {
                        book31Img.style.display = 'none';
                        book31Img.src = window.BookPaths.BOOK_IMAGE_31;
                    }
                    if (book32Img) book32Img.style.display = 'none';

                    if (window.playMapSound) window.playMapSound();

                    // Обновляем текст для зоны 1
                    updateModalText(1);

                    // Обновляем видимость зон
                    const rightZones = document.querySelector('.right-zones');
                    const leftZones = document.querySelector('.left-zones');
                    updateZonesVisibility(rightZones, leftZones, [
                        { side: 'right', numbers: [1, 2, 3, 4] }, // Справа видимы все
                        { side: 'left', numbers: [] }             // Слева все скрыты
                    ]);
                }
            },
            ZONE_2: {
                top: '11%',
                height: '7%',
                overlayImage: {
                    src: 'BOOK_IMAGE_13',
                    style: {
                        position: 'absolute',
                        top: '0',
                        left: '0',
                        height: '100%',
                        width: 'auto',
                        objectFit: 'contain',
                        display: 'none',
                        zIndex: 3
                    }
                },
                additionalImage: {
                    src: 'BOOK_IMAGE_22',
                    style: {
                        position: 'absolute',
                        top: '0',
                        right: '0',
                        height: 'auto',
                        maxHeight: '33%',
                        width: 'auto',
                        objectFit: 'contain',
                        display: 'none',
                        zIndex: 3
                    }
                },
                onClick: (overlayImg, additionalImg, book31Img, book32Img, bookSound) => {
                    // Сначала скрываем все изображения
                    if (overlayImg) overlayImg.style.display = 'none';
                    if (additionalImg) additionalImg.style.display = 'none';
                    if (book31Img) {
                        book31Img.style.display = 'none';
                        book31Img.src = window.BookPaths.BOOK_IMAGE_31;
                    }
                    if (book32Img) book32Img.style.display = 'none';

                    // Затем показываем только нужные
                    if (overlayImg) overlayImg.style.display = 'block';
                    if (additionalImg) {
                        additionalImg.src = window.BookPaths.BOOK_IMAGE_22;
                        additionalImg.style.display = 'block';
                    }
                    
                    if (window.playMapSound) window.playMapSound();

                    // Обновляем видимость зон
                    const rightZones = document.querySelector('.right-zones');
                    const leftZones = document.querySelector('.left-zones');
                    updateZonesVisibility(rightZones, leftZones, [
                        { side: 'right', numbers: [1, 2, 3, 4] }, // Справа видимы все зоны на своих местах
                        { side: 'left', numbers: [1] }             // Слева видима только 1
                    ]);
                }
            },
            ZONE_3: {
                top: '18%',
                height: '7%',
                overlayImage: {
                    src: 'BOOK_IMAGE_13',
                    style: {
                        position: 'absolute',
                        top: '0',
                        left: '0',
                        height: '100%',
                        width: 'auto',
                        objectFit: 'contain',
                        display: 'none',
                        zIndex: 3
                    }
                },
                additionalImages: [
                    {
                        src: 'BOOK_IMAGE_31',
                        style: {
                            position: 'absolute',
                            top: '0',
                            left: '0',
                            height: 'auto',
                            maxHeight: '33%',
                            width: 'auto',
                            objectFit: 'contain',
                            display: 'none',
                            zIndex: 3
                        }
                    },
                    {
                        src: 'BOOK_IMAGE_32',
                        style: {
                            position: 'absolute',
                            top: '0',
                            right: '0',
                            height: 'auto',
                            maxHeight: '33%',
                            width: 'auto',
                            objectFit: 'contain',
                            display: 'none',
                            zIndex: 3
                        }
                    }
                ],
                onClick: (overlayImg, additionalImg, book31Img, book32Img, bookSound) => {
                    // Сначала скрываем все изображения
                    if (overlayImg) overlayImg.style.display = 'none';
                    if (additionalImg) {
                        additionalImg.style.display = 'none';
                        additionalImg.src = window.BookPaths.BOOK_IMAGE_22;
                    }
                    if (book31Img) {
                        book31Img.style.display = 'none';
                        book31Img.src = window.BookPaths.BOOK_IMAGE_31;
                    }

                    // Затем показываем только нужные
                    if (overlayImg) overlayImg.style.display = 'block';
                    if (book31Img) book31Img.style.display = 'block';
                    if (book32Img) book32Img.style.display = 'block';
                    
                    if (window.playMapSound) window.playMapSound();

                    // Обновляем видимость зон
                    const rightZones = document.querySelector('.right-zones');
                    const leftZones = document.querySelector('.left-zones');
                    updateZonesVisibility(rightZones, leftZones, [
                        { side: 'right', numbers: [1, 2, 3, 4] }, // Справа видимы все зоны на своих местах
                        { side: 'left', numbers: [1, 2] }          // Слева видимы 1,2
                    ]);
                }
            },
            ZONE_4: {
                top: '25%',
                height: '7%',
                overlayImage: {
                    src: 'BOOK_IMAGE_13',
                    style: {
                        position: 'absolute',
                        top: '0',
                        left: '0',
                        height: '100%',
                        width: 'auto',
                        objectFit: 'contain',
                        display: 'none',
                        zIndex: 3
                    }
                },
                additionalImages: [
                    {
                        src: 'BOOK_IMAGE_41',
                        style: {
                            position: 'absolute',
                            top: '0',
                            left: '0',
                            height: 'auto',
                            maxHeight: '33%',
                            width: 'auto',
                            objectFit: 'contain',
                            display: 'none',
                            zIndex: 3
                        }
                    },
                    {
                        src: 'BOOK_IMAGE_42',
                        style: {
                            position: 'absolute',
                            top: '0',
                            right: '0',
                            height: 'auto',
                            maxHeight: '33%',
                            width: 'auto',
                            objectFit: 'contain',
                            display: 'none',
                            zIndex: 3
                        }
                    }
                ],
                onClick: (overlayImg, additionalImg, book31Img, book32Img, bookSound) => {
                    // Сначала скрываем все изображения
                    if (overlayImg) overlayImg.style.display = 'none';
                    if (additionalImg) additionalImg.style.display = 'none';
                    if (book31Img) book31Img.style.display = 'none';
                    if (book32Img) book32Img.style.display = 'none';

                    // Затем показываем только нужные
                    if (overlayImg) overlayImg.style.display = 'block';
                    if (book31Img) {
                        book31Img.src = window.BookPaths.BOOK_IMAGE_41;
                        book31Img.style.display = 'block';
                    }
                    if (additionalImg) {
                        additionalImg.src = window.BookPaths.BOOK_IMAGE_42;
                        additionalImg.style.display = 'block';
                    }
                    
                    if (window.playMapSound) window.playMapSound();

                    // Обновляем видимость зон
                    const rightZones = document.querySelector('.right-zones');
                    const leftZones = document.querySelector('.left-zones');
                    updateZonesVisibility(rightZones, leftZones, [
                        { side: 'right', numbers: [1, 2, 3, 4] }, // Справа видимы все зоны на своих местах
                        { side: 'left', numbers: [1, 2, 3] }      // Слева видимы 1,2,3
                    ]);
                }
            }
        }
    },
    styles: {
        container: {
            position: 'absolute',
            pointerEvents: 'none',
            zIndex: 10
        },
        zone: {
            position: 'absolute',
            width: '100%',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            pointerEvents: 'auto',
            transition: 'background-color 0.3s ease',
            zIndex: 10
        },
        zoneHover: {
            backgroundColor: 'rgba(255, 255, 255, 0.3)'
        },
        zoneColors: {
            ZONE_1: 'rgba(255, 0, 0, 0.0)',
            ZONE_2: 'rgba(0, 0, 255, 0.0)',
            ZONE_3: 'rgba(255, 255, 0, 0.0)',
            ZONE_4: 'rgba(0, 255, 0, 0.0)'
        }
    }
};

// Конфигурация кнопок
const BUTTONS_CONFIG = {
    backLink: {
        style: {
            position: 'fixed',
            top: '20px',
            left: '20px',
            color: 'white',
            textDecoration: 'none',
            fontSize: '16px',
            zIndex: 1000,
            background: 'rgba(0, 0, 0, 0.7)',
            padding: '10px 20px',
            borderRadius: '4px',
            transition: 'background 0.3s ease'
        },
        hoverStyle: {
            background: 'rgba(0, 0, 0, 0.9)'
        }
    },
    closeButton: {
        style: {
            position: 'absolute',
            top: '20px',
            right: '20px',
            color: 'white',
            fontSize: '24px',
            cursor: 'pointer',
            background: 'none',
            border: 'none',
            padding: '10px',
            zIndex: 1002
        }
    },
    languageButton: {
        style: {
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0',
            position: 'relative'
        },
        iconStyle: {
            width: '32px',
            height: '32px',
            filter: 'drop-shadow(2px 2px 2px rgba(0, 0, 0, 0.5))',
            transition: 'transform 0.2s ease'
        },
        hoverStyle: {
            transform: 'scale(1.1)'
        }
    },
    languageDropdown: {
        style: {
            position: 'absolute',
            top: '100%',
            right: '0',
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '8px',
            padding: '8px 0',
            marginTop: '8px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
            display: 'none',
            flexDirection: 'column',
            minWidth: '100px'
        },
        optionStyle: {
            padding: '8px 16px',
            cursor: 'pointer',
            transition: 'background 0.2s ease',
            textAlign: 'center',
            color: '#333',
            textDecoration: 'none'
        },
        optionHoverStyle: {
            background: 'rgba(0, 0, 0, 0.1)'
        },
        optionActiveStyle: {
            fontWeight: 'bold',
            background: 'rgba(0, 0, 0, 0.05)'
        }
    }
};

// Экспортируем константы
window.BookPaths = BOOK_PATHS;
window.BookZonesConfig = BOOK_ZONES_CONFIG;
// Экспортируем конфигурацию кнопок
window.ButtonsConfig = BUTTONS_CONFIG;
// Экспортируем функцию обновления текста
window.updateModalText = updateModalText;
// Экспортируем функцию принудительного открытия на ZONE_1
window.forceOpenBookOnZone1 = forceOpenBookOnZone1;

window.BookPaths.initBookHandlers = function() {
    // Установка путей к изображениям книг
    document.querySelector('.most-image').src = window.BookPaths.BOOK_IMAGE_02;

    // Принудительно открываем книгу на ZONE_1 при инициализации
    setTimeout(() => {
        forceOpenBookOnZone1();
    }, 100);

    // Инициализация дополнительных изображений
    const overlayImg = document.querySelector('.overlay-image');
    const additionalImg = document.querySelector('.additional-image');
    const book31Img = document.querySelector('.book-31-image');
    const book32Img = document.querySelector('.book-32-image');
    const config = window.BookZonesConfig;

    // Инициализация изображений для зоны 2
    if (config.zones.right.ZONE_2.overlayImage) {
        overlayImg.src = window.BookPaths[config.zones.right.ZONE_2.overlayImage.src];
        const overlayStyle = { ...config.zones.right.ZONE_2.overlayImage.style };
        
        // Для мобильных устройств изменяем стили
        if (window.innerWidth <= 768) {
            overlayStyle.height = 'auto';
            overlayStyle.width = '100%';
            overlayStyle.maxHeight = '100vh';
        }
        
        Object.assign(overlayImg.style, overlayStyle);
    }
    if (config.zones.right.ZONE_2.additionalImage) {
        additionalImg.src = window.BookPaths[config.zones.right.ZONE_2.additionalImage.src];
        Object.assign(additionalImg.style, config.zones.right.ZONE_2.additionalImage.style);
    }

    // Инициализация изображений для зоны 3
    const zone3Config = config.zones.right.ZONE_3;
    if (zone3Config.overlayImage) {
        overlayImg.src = window.BookPaths[zone3Config.overlayImage.src];
        Object.assign(overlayImg.style, zone3Config.overlayImage.style);
    }
    if (zone3Config.additionalImages) {
        book31Img.src = window.BookPaths[zone3Config.additionalImages[0].src];
        Object.assign(book31Img.style, zone3Config.additionalImages[0].style);
        book32Img.src = window.BookPaths[zone3Config.additionalImages[1].src];
        Object.assign(book32Img.style, zone3Config.additionalImages[1].style);
    }

    // Стили контейнеров зон
    const rightZones = document.querySelector('.right-zones');
    Object.assign(rightZones.style, config.rightContainer);
    Object.assign(rightZones.style, config.styles.container);
    const leftZones = document.querySelector('.left-zones');
    Object.assign(leftZones.style, config.leftContainer);
    Object.assign(leftZones.style, config.styles.container);

    // Функция для инициализации зон
    function setupZones(container, side) {
        container.querySelectorAll('.book-zone').forEach((zone, index) => {
            const zoneNumber = index + 1;
            const zoneConfig = config.zones[side][`ZONE_${zoneNumber}`];
            const zoneStyles = config.styles.zone;
            const zoneColor = config.styles.zoneColors[`ZONE_${zoneNumber}`];
            const bookSound = document.querySelector(`#bookSound${zoneNumber}`);
            Object.assign(zone.style, zoneStyles);
            zone.style.top = zoneConfig.top;
            zone.style.height = zoneConfig.height;
            zone.style.backgroundColor = zoneColor;
            zone.addEventListener('mouseenter', () => {
                zone.style.backgroundColor = config.styles.zoneHover.backgroundColor;
            });
            zone.addEventListener('mouseleave', () => {
                zone.style.backgroundColor = zoneColor;
            });
            zone.addEventListener('click', () => {
                if (zoneConfig.onClick) {
                    zoneConfig.onClick(overlayImg, additionalImg, book31Img, book32Img, bookSound);
                }
            });
        });
    }
    setupZones(rightZones, 'right');
    setupZones(leftZones, 'left');

    // Обработчик изменения размера окна для overlay-image
    function updateOverlayImageStyles() {
        const overlayImg = document.querySelector('.overlay-image');
        if (overlayImg && config.zones.right.ZONE_2.overlayImage) {
            const overlayStyle = { ...config.zones.right.ZONE_2.overlayImage.style };
            
            // Для мобильных устройств изменяем стили
            if (window.innerWidth <= 768) {
                overlayStyle.height = 'auto';
                overlayStyle.width = '100%';
                overlayStyle.maxHeight = '100vh';
            }
            
            Object.assign(overlayImg.style, overlayStyle);
        }
    }
    
    window.addEventListener('resize', updateOverlayImageStyles);

    // Обработчики для модалок и закрытия
    const bookOverlay = document.querySelector('.book-overlay');
    const mostOverlay = document.querySelector('.most-overlay');
    const closeButtons = document.querySelectorAll('.close-button');
    const container = document.querySelector('.image-container');
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Сбрасываем активную геометку при закрытии
            window.activeGeoMarker = null;
            
            if (window.Common && typeof window.Common.resumeAnimation === 'function') {
                window.Common.resumeAnimation(bookOverlay, mostOverlay, container);
            }
            container.classList.remove('zoom-transition');
            container.style.animation = 'none';
            container.offsetHeight;
            container.style.animation = null;
        });
    });
    [bookOverlay, mostOverlay].forEach(overlay => {
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                // Сбрасываем активную геометку при закрытии
                window.activeGeoMarker = null;
                
                if (window.Common && typeof window.Common.resumeAnimation === 'function') {
                    window.Common.resumeAnimation(bookOverlay, mostOverlay, container);
                }
                container.classList.remove('zoom-transition');
                container.style.animation = 'none';
                container.offsetHeight;
                container.style.animation = null;
            }
        });
    });
    
    // Добавляем обработчик для автоматического сброса к ZONE_1 при открытии модального окна
    if (mostOverlay) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    const display = mostOverlay.style.display;
                    if (display === 'flex') {
                        // console.log('Модальное окно открыто, сбрасываем к ZONE_1');
                        // Небольшая задержка для корректного отображения
                        setTimeout(() => {
                            forceOpenBookOnZone1();
                        }, 50);
                    }
                }
            });
        });
        
        observer.observe(mostOverlay, {
            attributes: true,
            attributeFilter: ['style']
        });
    }

    // Скролл и индикатор
    const bookContent = document.querySelector('.book-content');
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (window.Common && typeof window.Common.setupScrollHandlers === 'function') {
        window.Common.setupScrollHandlers(bookContent, scrollIndicator);
    };

    // Функция для обновления всех зон с вызовом updateModalText
    function updateAllZonesWithText() {
        // console.log('updateAllZonesWithText вызвана');
        // Обновляем ZONE_3 в секции right
        const zone3Right = config.zones.right.ZONE_3;
        const originalOnClick3 = zone3Right.onClick;
        zone3Right.onClick = (overlayImg, additionalImg, book31Img, book32Img, bookSound) => {
            // console.log('ZONE_3 onClick вызван');
            originalOnClick3(overlayImg, additionalImg, book31Img, book32Img, bookSound);
            // console.log('Вызываем updateModalText(3)');
            updateModalText(3);
        };

        // Обновляем ZONE_4 в секции right
        const zone4Right = config.zones.right.ZONE_4;
        const originalOnClick4 = zone4Right.onClick;
        zone4Right.onClick = (overlayImg, additionalImg, book31Img, book32Img, bookSound) => {
            originalOnClick4(overlayImg, additionalImg, book31Img, book32Img, bookSound);
            updateModalText(4);
        };

        // Обновляем ZONE_2 в секции left
        const zone2Left = config.zones.left.ZONE_2;
        const originalOnClick2Left = zone2Left.onClick;
        zone2Left.onClick = (overlayImg, additionalImg, book31Img, book32Img, bookSound) => {
            originalOnClick2Left(overlayImg, additionalImg, book31Img, book32Img, bookSound);
            updateModalText(2);
        };

        // Обновляем ZONE_3 в секции left
        const zone3Left = config.zones.left.ZONE_3;
        const originalOnClick3Left = zone3Left.onClick;
        zone3Left.onClick = (overlayImg, additionalImg, book31Img, book32Img, bookSound) => {
            originalOnClick3Left(overlayImg, additionalImg, book31Img, book32Img, bookSound);
            updateModalText(3);
        };

        // Обновляем ZONE_4 в секции left
        const zone4Left = config.zones.left.ZONE_4;
        const originalOnClick4Left = zone4Left.onClick;
        zone4Left.onClick = (overlayImg, additionalImg, book31Img, book32Img, bookSound) => {
            originalOnClick4Left(overlayImg, additionalImg, book31Img, book32Img, bookSound);
            updateModalText(4);
        };
        
        // Обновляем ZONE_1 в обеих секциях, чтобы они сбрасывали к базовому состоянию
        const zone1Right = config.zones.right.ZONE_1;
        const originalOnClick1Right = zone1Right.onClick;
        zone1Right.onClick = (overlayImg, additionalImg, book31Img, book32Img, bookSound) => {
            originalOnClick1Right(overlayImg, additionalImg, book31Img, book32Img, bookSound);
            // При клике на ZONE_1 сбрасываем к базовому состоянию
            forceOpenBookOnZone1();
        };
        
        const zone1Left = config.zones.left.ZONE_1;
        const originalOnClick1Left = zone1Left.onClick;
        zone1Left.onClick = (overlayImg, additionalImg, book31Img, book32Img, bookSound) => {
            originalOnClick1Left(overlayImg, additionalImg, book31Img, book32Img, bookSound);
            // При клике на ZONE_1 сбрасываем к базовому состоянию
            forceOpenBookOnZone1();
        };
    }

    // Вызываем функцию обновления
    updateAllZonesWithText();
}; 