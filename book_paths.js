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

// Функция для получения следующего z-index
function getNextZIndex() {
    currentMaxZIndex = currentMaxZIndex >= 9 ? 3 : currentMaxZIndex + 1;
    return currentMaxZIndex;
}

// Функция для последовательной подсветки зон
async function highlightZonesSequentially(zones, currentIndex) {
    if (!zones || zones.length === 0) {
        console.warn('No zones provided for highlighting');
        return;
    }

    if (currentIndex >= zones.length) {
        console.log('Highlight sequence completed');
        return;
    }

    const zone = zones[currentIndex];
    console.log(`Highlighting zone ${currentIndex + 1}`, zone);
    console.log('Zone classes before highlight:', zone.className);
    
    // Добавляем класс подсветки
    zone.classList.add('highlight');
    console.log('Zone classes after adding highlight:', zone.className);
    
    // Запускаем следующую зону через 1200мс (до того, как текущая погаснет)
    if (currentIndex < zones.length - 1) {
        setTimeout(() => {
            highlightZonesSequentially(zones, currentIndex + 1);
        }, 1200); // Следующая зона начнет подсвечиваться за 400мс до того, как текущая погаснет
    }
    
    // Убираем подсветку текущей зоны через 1600мс
    setTimeout(() => {
        zone.classList.remove('highlight');
        console.log(`Removed highlight from zone ${currentIndex + 1}`);
        console.log('Zone classes after removing highlight:', zone.className);
    }, 1600);
}

// Экспортируем функцию для использования в HTML
window.showInitialHighlight = function() {
    console.log('Starting initial highlight animation');
    
    // Получаем зоны в правильном порядке (1, 2, 3, 4)
    const zones = [];
    for (let i = 1; i <= 4; i++) {
        const zone = document.querySelector(`.right-zones .book-zone.zone-${i}`);
        console.log(`Looking for zone-${i}, found:`, zone?.className);
        if (zone) {
            zones.push(zone);
        }
    }
    
    console.log('Zones array (classes):', zones.map(z => z.className));
    console.log(`Found ${zones.length} right zones to highlight`);
    
    if (zones.length === 0) {
        console.warn('No right zones found for highlighting');
        return;
    }

    // Проверяем, что зоны имеют правильные классы
    zones.forEach((zone, index) => {
        console.log(`Right zone ${index + 1} classes:`, zone.className);
    });

    // Сбрасываем все подсветки перед началом анимации
    zones.forEach(zone => {
        zone.classList.remove('highlight');
    });

    // Запускаем анимацию
    highlightZonesSequentially(zones, 0);
};

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

                    if (bookSound) {
                        bookSound.currentTime = 0;
                        bookSound.play();
                    }

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
                    
                    if (bookSound) {
                        bookSound.currentTime = 0;
                        bookSound.play();
                    }

                    // Обновляем видимость зон
                    const rightZones = document.querySelector('.right-zones');
                    const leftZones = document.querySelector('.left-zones');
                    updateZonesVisibility(rightZones, leftZones, [
                        { side: 'right', numbers: [2, 3, 4] }, // Справа видимы 2,3,4
                        { side: 'left', numbers: [1] }         // Слева видима только 1
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
                    
                    if (bookSound) {
                        bookSound.currentTime = 0;
                        bookSound.play();
                    }

                    // Обновляем видимость зон
                    const rightZones = document.querySelector('.right-zones');
                    const leftZones = document.querySelector('.left-zones');
                    updateZonesVisibility(rightZones, leftZones, [
                        { side: 'right', numbers: [3, 4] },    // Справа видимы 3,4
                        { side: 'left', numbers: [1, 2] }      // Слева видимы 1,2
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
                    
                    if (bookSound) {
                        bookSound.currentTime = 0;
                        bookSound.play();
                    }

                    // Обновляем видимость зон
                    const rightZones = document.querySelector('.right-zones');
                    const leftZones = document.querySelector('.left-zones');
                    updateZonesVisibility(rightZones, leftZones, [
                        { side: 'right', numbers: [4] },        // Справа видима только 4
                        { side: 'left', numbers: [1, 2, 3] }    // Слева видимы 1,2,3
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

                    if (bookSound) {
                        bookSound.currentTime = 0;
                        bookSound.play();
                    }

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
                    
                    if (bookSound) {
                        bookSound.currentTime = 0;
                        bookSound.play();
                    }

                    // Обновляем видимость зон
                    const rightZones = document.querySelector('.right-zones');
                    const leftZones = document.querySelector('.left-zones');
                    updateZonesVisibility(rightZones, leftZones, [
                        { side: 'right', numbers: [2, 3, 4] }, // Справа видимы 2,3,4
                        { side: 'left', numbers: [1] }         // Слева видима только 1
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
                    
                    if (bookSound) {
                        bookSound.currentTime = 0;
                        bookSound.play();
                    }

                    // Обновляем видимость зон
                    const rightZones = document.querySelector('.right-zones');
                    const leftZones = document.querySelector('.left-zones');
                    updateZonesVisibility(rightZones, leftZones, [
                        { side: 'right', numbers: [3, 4] },    // Справа видимы 3,4
                        { side: 'left', numbers: [1, 2] }      // Слева видимы 1,2
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
                    
                    if (bookSound) {
                        bookSound.currentTime = 0;
                        bookSound.play();
                    }

                    // Обновляем видимость зон
                    const rightZones = document.querySelector('.right-zones');
                    const leftZones = document.querySelector('.left-zones');
                    updateZonesVisibility(rightZones, leftZones, [
                        { side: 'right', numbers: [4] },        // Справа видима только 4
                        { side: 'left', numbers: [1, 2, 3] }    // Слева видимы 1,2,3
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