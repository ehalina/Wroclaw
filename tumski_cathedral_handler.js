// Константы для медиафайлов
const MEDIA_PATHS = {
    PAPERA_IMAGE: 'media/papera1.png',
    STEP_SOUND: 'media/step.wav'
};

// Функция для определения, находится ли геометка в правой половине экрана
function isInRightHalf(marker) {
    if (!marker) return false;
    
    // Получаем координату X для десктопной версии
    const xDesktop = parseFloat(marker.dataset.xDesktop);
    
    // Для десктопа используем старые координаты, но проверяем относительно половины изображения (2624/2 = 1312)
    // Если координата X больше половины ширины оригинального изображения, то элемент находится в правой половине
    return xDesktop > 1312;
}

// Функция для изменения порядка элементов в зависимости от позиции
function reorderGeoMarkerElements(contentWrapper, marker) {
    if (!contentWrapper || !marker) return;
    
    const textElem = contentWrapper.querySelector('.tumski-text');
    const paperaImg = contentWrapper.querySelector('.papera-image');
    const mapMark = contentWrapper.parentElement.querySelector('.map-mark');
    
    if (!textElem || !paperaImg || !mapMark) return;
    
    const isRightHalf = isInRightHalf(marker);
    
    if (isRightHalf) {
        // Для правой половины: текст → papera → геометка
        // Сначала очищаем контейнер
        contentWrapper.innerHTML = '';
        
        // Добавляем элементы в нужном порядке
        contentWrapper.appendChild(textElem);
        contentWrapper.appendChild(paperaImg);
        
        // Перемещаем геометку в конец
        contentWrapper.parentElement.appendChild(mapMark);
    } else {
        // Для левой половины: геометка → papera → текст (стандартный порядок)
        // Сначала очищаем контейнер
        contentWrapper.innerHTML = '';
        
        // Перемещаем геометку в начало
        contentWrapper.parentElement.insertBefore(mapMark, contentWrapper);
        
        // Добавляем элементы в стандартном порядке
        contentWrapper.appendChild(paperaImg);
        contentWrapper.appendChild(textElem);
    }
}

// Функция для обновления размеров контейнеров после смены языка
function updateContentWrapperSizesAfterLanguageChange() {
    console.log('Обновляем размеры контейнеров после смены языка...');
    
    // Находим все map-mark-area
    const mapMarkAreas = document.querySelectorAll('.map-mark-area');
    
    mapMarkAreas.forEach((mapMarkArea, index) => {
        try {
            // Находим map-mark и content-wrapper
            const mapMark = mapMarkArea.querySelector('.map-mark');
            const contentWrapper = mapMarkArea.querySelector('.content-wrapper');
            
            if (!mapMark || !contentWrapper) {
                console.log(`Маркер ${index}: map-mark или content-wrapper не найден`);
                return;
            }
            
            // Получаем новый размер текста после смены языка
            const textElem = contentWrapper.querySelector('.tumski-text');
            if (!textElem) {
                console.log(`Маркер ${index}: tumski-text не найден`);
                return;
            }
            
            const newTextWidth = textElem.offsetWidth;
            const mapMarkHeight = mapMark.clientHeight;
            
            console.log(`Маркер ${index}: новый размер текста: ${newTextWidth}px, высота map-mark: ${mapMarkHeight}px`);
            
            // Обновляем размеры контейнера под новый текст
            const containerWidth = newTextWidth + 20; // Ширина текста + небольшой отступ
            
            contentWrapper.style.setProperty('width', containerWidth + 'px', 'important');
            contentWrapper.style.setProperty('min-width', containerWidth + 'px', 'important');
            contentWrapper.style.setProperty('max-width', 'none', 'important');
            contentWrapper.style.setProperty('overflow', 'visible', 'important');
            
            // Обновляем высоту контейнера равной высоте map-mark
            contentWrapper.style.setProperty('height', mapMarkHeight + 'px', 'important');
            contentWrapper.style.setProperty('min-height', mapMarkHeight + 'px', 'important');
            
            // Обновляем размеры изображения
            const paperaImage = contentWrapper.querySelector('.papera-image');
            if (paperaImage) {
                paperaImage.style.setProperty('width', '100%', 'important');
                paperaImage.style.setProperty('height', '100%', 'important');
                paperaImage.style.setProperty('min-width', '100%', 'important');
                paperaImage.style.setProperty('min-height', '100%', 'important');
                paperaImage.style.setProperty('max-width', 'none', 'important');
                paperaImage.style.setProperty('max-height', 'none', 'important');
                paperaImage.style.setProperty('object-fit', 'cover', 'important');
            }
            
            console.log(`Маркер ${index}: контейнер обновлен до ${containerWidth}x${mapMarkHeight}px после смены языка`);
            
        } catch (error) {
            console.error(`Ошибка при обновлении маркера ${index}:`, error);
        }
    });
    
    console.log('Обновление размеров контейнеров после смены языка завершено');
}

// Функция для принудительного обновления размеров контейнеров
function forceUpdateContentWrapperSizes() {
    console.log('Принудительно обновляем размеры контейнеров...');
    
    // Сначала обновляем позиции маркеров
    if (window.positionMarkersOnBg) {
        window.positionMarkersOnBg();
    }
    
    // Затем обновляем размеры контейнеров
    if (window.updateContentWrapperSizesAfterLanguageChange) {
        setTimeout(() => {
            window.updateContentWrapperSizesAfterLanguageChange();
        }, 100);
    }
}

// Функция для создания расширенной области вокруг геометки
function createExtendedHoverArea() {
    console.log('Создаем расширенные области для геометок...');
    
    const mapMarks = document.querySelectorAll('.map-mark');
    
    mapMarks.forEach((mapMark, index) => {
        try {
            // Проверяем, есть ли уже расширенная область
            let extendedArea = mapMark.querySelector('.extended-hover-area');
            
            if (!extendedArea) {
                // Создаем расширенную область
                extendedArea = document.createElement('div');
                extendedArea.className = 'extended-hover-area';
                
                // Получаем размеры map-mark для правильного позиционирования
                const mapMarkWidth = mapMark.offsetWidth;
                const mapMarkHeight = mapMark.offsetHeight;
                
                // Вычисляем размеры расширенной области
                const extendedSize = window.innerWidth > 700 ? 80 : 60; // Размер расширения в зависимости от устройства
                
                extendedArea.style.cssText = `
                    position: absolute;
                    top: -${extendedSize}px;
                    left: -${extendedSize}px;
                    width: ${mapMarkWidth + (extendedSize * 2)}px;
                    height: ${mapMarkHeight + (extendedSize * 2)}px;
                    background: transparent;
                    border-radius: 50%;
                    pointer-events: auto;
                    z-index: 997;
                    transition: background 0.3s ease;
                    cursor: pointer;
                `;
                
                // Добавляем в начало map-mark
                mapMark.insertBefore(extendedArea, mapMark.firstChild);
                
                // Добавляем обработчики событий
                extendedArea.addEventListener('mouseenter', () => {
                    // Показываем геометрию при наведении на расширенную область
                    const tumskiText = mapMark.closest('.map-mark-area')?.querySelector('.tumski-text');
                    const paperaImage = mapMark.closest('.map-mark-area')?.querySelector('.papera-image');
                    
                    if (tumskiText) tumskiText.style.opacity = '1';
                    if (paperaImage) paperaImage.style.opacity = '1';
                    
                    // Добавляем визуальный эффект
                    extendedArea.style.background = 'rgba(255, 255, 255, 0.08)';
                });
                
                extendedArea.addEventListener('mouseleave', () => {
                    // Скрываем геометрию при уходе курсора
                    const tumskiText = mapMark.closest('.map-mark-area')?.querySelector('.tumski-text');
                    const paperaImage = mapMark.closest('.map-mark-area')?.querySelector('.papera-image');
                    
                    if (tumskiText) tumskiText.style.opacity = '0';
                    if (paperaImage) paperaImage.style.opacity = '0';
                    
                    // Убираем визуальный эффект
                    extendedArea.style.background = 'transparent';
                });
                
                console.log(`Маркер ${index}: создана расширенная область для активации`);
            }
            
        } catch (error) {
            console.error(`Ошибка при создании расширенной области для маркера ${index}:`, error);
        }
    });
    
    console.log('Создание расширенных областей для геометок завершено');
}

// Функция для принудительного обновления расширенных областей
function forceUpdateExtendedHoverAreas() {
    console.log('Принудительно обновляем расширенные области для геометок...');
    
    // Удаляем все существующие расширенные области
    const existingAreas = document.querySelectorAll('.extended-hover-area');
    existingAreas.forEach(area => area.remove());
    
    // Создаем новые расширенные области
    createExtendedHoverArea();
    
    console.log('Обновление расширенных областей завершено');
}

// Функция для обновления размеров расширенных областей
function updateExtendedHoverAreaSizes() {
    console.log('Обновляем размеры расширенных областей...');
    
    const extendedAreas = document.querySelectorAll('.extended-hover-area');
    
    extendedAreas.forEach((extendedArea, index) => {
        try {
            const mapMark = extendedArea.closest('.map-mark');
            if (!mapMark) return;
            
            const mapMarkWidth = mapMark.offsetWidth;
            const mapMarkHeight = mapMark.offsetHeight;
            const extendedSize = window.innerWidth > 700 ? 80 : 60; // Размер расширения в зависимости от устройства
            
            // Обновляем размеры и позиционирование
            extendedArea.style.top = `-${extendedSize}px`;
            extendedArea.style.left = `-${extendedSize}px`;
            extendedArea.style.width = `${mapMarkWidth + (extendedSize * 2)}px`;
            extendedArea.style.height = `${mapMarkHeight + (extendedSize * 2)}px`;
            
            console.log(`Область ${index}: обновлены размеры до ${mapMarkWidth + (extendedSize * 2)}x${mapMarkHeight + (extendedSize * 2)}px`);
            
        } catch (error) {
            console.error(`Ошибка при обновлении области ${index}:`, error);
        }
    });
    
    console.log('Обновление размеров расширенных областей завершено');
}

// Обработчик для геометки "Собор Святого Иоанна Крестителя"
export function setupTumskiCathedralHandler() {
    const tumskiCathedralTxt = document.querySelector('#tumski-cathedral-text');
    const katedrakoscielnaTxt = document.querySelector('#katedrakoscielna-text');
    const mapMarkCathedral = document.querySelector('#tumski_cathedral');
    const bookSound3 = document.querySelector('#bookSound3');
    const mostOverlay = document.querySelector('.most-overlay');
    const container = document.querySelector('.image-container');
    const mostTitle = mostOverlay.querySelector('.most-title');

    function setupCustomHandler(textElem, markElem, soundElem, overlay, container, titleElem, i18nKey) {
        if (!textElem || !markElem) return;
        [textElem, markElem].forEach(el => {
            el.addEventListener('click', () => {
                if (soundElem) soundElem.play();
                overlay.style.display = 'flex';
                // container.classList.add('zoom-transition'); // Зум убран для геометки
                
                // Обновляем оба текстовых блока (левый и правый)
                const mostTitles = overlay.querySelectorAll('.most-title');
                mostTitles.forEach(title => {
                    title.innerHTML = window.i18n.t(i18nKey + '.title');
                });
                
                // Можно добавить описание, если нужно

                // Добавить запуск подсветки зон:
                if (window.showInitialHighlight) window.showInitialHighlight();
                
                // Устанавливаем активную геометку
                window.activeGeoMarker = 'tumski_cathedral';
                
                // Устанавливаем активную геометку
                window.activeGeoMarker = 'tumski_cathedral';
                
                // Инициализируем текст для зоны 1 при открытии модального окна
                if (typeof window.updateModalText === 'function') {
                    setTimeout(() => {
                        window.updateModalText(1);
                    }, 100);
                }
            });
        });
    }

    setupCustomHandler(tumskiCathedralTxt, mapMarkCathedral, bookSound3, mostOverlay, container, mostTitle, 'tumski_cathedral');
}

// Обработчик для геометки "Соборная церковь Святого Креста и Св. Варфоломея"
export function setupKatedraKoscielnaHandler() {
    const katedraKoscielnaTxt = document.querySelector('#katedra-koscielna-text');
    const mapMarkKatedraKoscielna = document.querySelector('#katedra_koscielna');
    const bookSoundKatedraKoscielna = document.querySelector('#katedra_koscielna').parentElement.querySelector('audio');
    const bookSound3 = document.querySelector('#bookSound3');
    const mostOverlay = document.querySelector('.most-overlay');
    const container = document.querySelector('.image-container');
    const mostTitle = mostOverlay.querySelector('.most-title');

    function setupCustomHandler(textElem, markElem, soundElem, overlay, container, titleElem, i18nKey) {
        if (!textElem || !markElem) return;
        [textElem, markElem].forEach(el => {
            el.addEventListener('click', () => {
                if (soundElem) soundElem.play();
                overlay.style.display = 'flex';
                // container.classList.add('zoom-transition'); // Зум убран для геометки
                
                // Обновляем оба текстовых блока (левый и правый)
                const mostTitles = overlay.querySelectorAll('.most-title');
                mostTitles.forEach(title => {
                    title.innerHTML = window.i18n.t(i18nKey + '.title');
                });
                
                // Можно добавить описание, если нужно

                // Добавить запуск подсветки зон:
                if (window.showInitialHighlight) window.showInitialHighlight();
                
                // Устанавливаем активную геометку
                window.activeGeoMarker = 'katedra_koscielna';
                
                // Устанавливаем активную геометку
                window.activeGeoMarker = 'katedra_koscielna';
                
                // Инициализируем текст для зоны 1 при открытии модального окна
                if (typeof window.updateModalText === 'function') {
                    setTimeout(() => {
                        window.updateModalText(1);
                    }, 100);
                }
            });
        });
    }

    setupCustomHandler(katedraKoscielnaTxt, mapMarkKatedraKoscielna, bookSoundKatedraKoscielna, mostOverlay, container, 'katedra_koscielna');
}
/*
// Специальный обработчик для геометки "Соборная церковь Святого Креста и Св. Варфоломея"
export function setupKatedraKoscielnaHandler() {
    const katedraKoscielnaTxt = document.querySelector('#katedra-koscielna-text');
    const mapMarkKatedraKoscielna = document.querySelector('#katedra_koscielna');
    const bookSoundKatedraKoscielna = document.querySelector('#katedra_koscielna').parentElement.querySelector('audio');
    const mostOverlay = document.querySelector('.most-overlay');
    const container = document.querySelector('.image-container');

    function setupCustomHandler(textElem, markElem, soundElem, overlay, container, i18nKey) {
        if (!textElem || !markElem) return;
        [textElem, markElem].forEach(el => {
            el.addEventListener('click', () => {
                if (soundElem) {
                    soundElem.currentTime = 0;
                    soundElem.play();
                }
                overlay.style.display = 'flex';
                
                // Очищаем inline стили модального окна
                if (typeof window.clearMostModalInlineStyles === 'function') {
                    window.clearMostModalInlineStyles();
                }
                
                // Обновляем оба текстовых блока (левый и правый)
                const mostTitles = overlay.querySelectorAll('.most-title');
                const mostDescriptions = overlay.querySelectorAll('.most-description');
                
                mostTitles.forEach(title => {
                    title.textContent = window.i18n.t(i18nKey + '.title');
                });
                
                mostDescriptions.forEach(description => {
                    description.textContent = window.i18n.t(i18nKey + '.description');
                });
                
                // Запускаем подсветку зон
                if (window.showInitialHighlight) window.showInitialHighlight();
                
                // Устанавливаем активную геометку
                window.activeGeoMarker = i18nKey;
                
                // Инициализируем текст для зоны 1 при открытии модального окна
                if (typeof window.updateModalText === 'function') {
                    setTimeout(() => {
                        window.updateModalText(1);
                    }, 100);
                }
                
                // Вызываем функцию для расчета высоты зон
                if (typeof window.adjustBookZonesHeight === 'function') {
                    setTimeout(() => window.adjustBookZonesHeight(), 100);
                }
            });
        });
    }

    setupCustomHandler(katedraKoscielnaTxt, mapMarkKatedraKoscielna, bookSoundKatedraKoscielna, mostOverlay, container, 'katedra_koscielna');
}
*/
// Универсальный обработчик для геометок
export function setupUniversalGeoMarker({ markerId, i18nKey, position }) {ч
    const marker = document.getElementById(markerId);
    const mostOverlay = document.querySelector('.most-overlay');
    const mostTitle = mostOverlay.querySelector('.most-title');
    const mostDescription = mostOverlay.querySelector('.most-description');
    const container = document.querySelector('.image-container');
    if (!marker) return;

    // На мобильных явно делаем геометку видимой и кликабельной
    if (window.innerWidth <= 700) {
        marker.parentElement.style.display = 'block';
        marker.parentElement.style.pointerEvents = 'auto';
        marker.style.display = 'block';
        marker.style.pointerEvents = 'auto';
        marker.style.opacity = '1';
    }
    
    // --- Картинка papera1.png под текстом ---
    const contentWrapper = marker.parentElement.querySelector('.content-wrapper');
    const textElem = contentWrapper.querySelector('.tumski-text');
    let paperaImg = contentWrapper.querySelector('.papera-image');
    if (!paperaImg) {
        paperaImg = document.createElement('img');
        paperaImg.className = 'papera-image';
        paperaImg.src = MEDIA_PATHS.PAPERA_IMAGE;
        paperaImg.alt = 'Papera';
        // Вставляем ПОД текстом
        contentWrapper.appendChild(paperaImg);
    }
    
    // Изменяем порядок элементов в зависимости от позиции (если position передан)
    if (position) {
        reorderGeoMarkerElements(contentWrapper, marker);
    }
    // Стили для растяжения картинки по ширине текста
    paperaImg.style.width = textElem ? (textElem.offsetWidth + 'px') : '100%';
    paperaImg.style.height = '50px';
    paperaImg.style.display = 'block';
    paperaImg.style.objectFit = 'contain';
    paperaImg.style.margin = '0 auto';
    paperaImg.style.position = 'relative';
    paperaImg.style.top = '1px';

    // --- Обработчик клика ---
    function openModal() {
        // Ищем audio внутри родителя marker
        let soundElem = null;
        if (marker && marker.parentElement) {
            soundElem = marker.parentElement.querySelector('audio');
        }
        if (soundElem) {
            soundElem.currentTime = 0;
            soundElem.play();
        }
        mostOverlay.style.display = 'flex';
        if (typeof window.clearMostModalInlineStyles === 'function') {
            window.clearMostModalInlineStyles();
        }
        // Вызываем функцию для расчета высоты зон
        if (typeof window.adjustBookZonesHeight === 'function') {
            setTimeout(() => window.adjustBookZonesHeight(), 100);
        }
        if (window.i18n && typeof window.i18n.t === 'function') {
            // Обновляем оба текстовых блока (левый и правый)
            const mostTitles = mostOverlay.querySelectorAll('.most-title');
            const mostDescriptions = mostOverlay.querySelectorAll('.most-description');
            
            mostTitles.forEach(title => {
                title.innerHTML = window.i18n.t(i18nKey + '.title');
            });
            
            mostDescriptions.forEach(description => {
                description.innerHTML = window.i18n.t(i18nKey + '.description');
            });
        }
        // Добавляю запуск подсветки зон:
        if (window.showInitialHighlight) window.showInitialHighlight();
        
        // Устанавливаем активную геометку на основе i18nKey
        window.activeGeoMarker = i18nKey;
        
        // Инициализируем текст для зоны 1 при открытии модального окна
        if (typeof window.updateModalText === 'function') {
            setTimeout(() => {
                window.updateModalText(1);
            }, 100);
        }
    }
    marker.addEventListener('click', openModal);
    if (textElem) textElem.addEventListener('click', openModal);
}

// Функция для создания звука шага
export function createStepSound() {
    const stepSound = new Audio(MEDIA_PATHS.STEP_SOUND);
    stepSound.volume = 0.3;
    return stepSound;
}

// Функция для установки источника изображения papera
export function setPaperaImageSource(element) {
    if (element) {
        element.src = MEDIA_PATHS.PAPERA_IMAGE;
    }
}

// Функция для растягивания картинки papera по размеру текста
export function stretchPaperaToTextWidth() {
    console.log('=== stretchPaperaToTextWidth НАЧАЛО ===');
    
    const mapMarkAreas = document.querySelectorAll('.map-mark-area');
    
    mapMarkAreas.forEach((mapMarkArea, index) => {
        try {
            const contentWrapper = mapMarkArea.querySelector('.content-wrapper');
            const paperaImage = contentWrapper?.querySelector('.papera-image');
            const textElem = contentWrapper?.querySelector('.tumski-text');
            
            if (!paperaImage || !textElem) {
                console.log(`Маркер ${index}: papera-image или tumski-text не найден`);
                return;
            }
            
            // Получаем ширину текста и высоту map-mark
            const textWidth = textElem.offsetWidth;
            const mapMark = mapMarkArea.querySelector('.map-mark');
            const mapMarkHeight = mapMark ? mapMark.offsetHeight : 80; // fallback к 80px если map-mark не найден
            
            console.log(`Маркер ${index}: ширина текста: ${textWidth}px, высота map-mark: ${mapMarkHeight}px`);
            
            // Растягиваем картинку по ширине и высоте контейнера
            paperaImage.style.setProperty('width', '100%', 'important');
            paperaImage.style.setProperty('height', '100%', 'important');
            paperaImage.style.setProperty('display', 'block', 'important');
            paperaImage.style.setProperty('object-fit', 'cover', 'important');
            paperaImage.style.setProperty('margin', '0', 'important');
            paperaImage.style.setProperty('position', 'relative', 'important');
            paperaImage.style.setProperty('top', '0', 'important');
            paperaImage.style.setProperty('opacity', '1', 'important');
            paperaImage.style.setProperty('flex-shrink', '0', 'important');
            paperaImage.style.setProperty('z-index', '1', 'important');
            paperaImage.style.setProperty('min-width', '100%', 'important');
            paperaImage.style.setProperty('min-height', '100%', 'important');
            paperaImage.style.setProperty('max-width', 'none', 'important');
            paperaImage.style.setProperty('max-height', 'none', 'important');
            
            // Обновляем размеры контейнера чтобы он вмещал содержимое
            const containerWidth = textWidth + 20; // Ширина изображения + небольшой отступ
            contentWrapper.style.setProperty('width', containerWidth + 'px', 'important');
            contentWrapper.style.setProperty('min-width', containerWidth + 'px', 'important');
            contentWrapper.style.setProperty('max-width', 'none', 'important');
            contentWrapper.style.setProperty('overflow', 'visible', 'important');
            
            // Устанавливаем высоту content-wrapper равной высоте map-mark
            const mapMarkElement = contentWrapper.closest('.map-mark');
            if (mapMarkElement) {
                const mapMarkHeight = mapMarkElement.clientHeight;
                contentWrapper.style.setProperty('height', mapMarkHeight + 'px', 'important');
                contentWrapper.style.setProperty('min-height', mapMarkHeight + 'px', 'important');
                console.log(`Маркер ${index}: content-wrapper установлена высота ${mapMarkHeight}px (равна map-mark)`);
            }
            
            console.log(`Маркер ${index}: papera-image растянута до 100% ширины контейнера, контейнер расширен до ${containerWidth}px`);
            
        } catch (error) {
            console.error(`Ошибка растягивания papera для маркера ${index}:`, error);
        }
    });
    
    console.log('=== stretchPaperaToTextWidth КОНЕЦ ===');
} 

// Функция для перемещения геометок и стрелок внутрь .image на мобильных и обратно на десктопе
export function moveMarkersAndCursors() {
    const isMobile = window.innerWidth <= 700;
    const image = document.querySelector('.image');
    const scene = document.querySelector('.scene');
    // Собираем все map-mark-area и cursor-areas
    const elements = Array.from(document.querySelectorAll('.map-mark-area, .custom-cursor-area, .custom-cursor-prostoarea'));
    if (isMobile) {
        elements.forEach(el => {
            if (el && el.parentElement !== image) {
                image.appendChild(el);
            }
        });
    } else {
        elements.forEach(el => {
            if (el && el.parentElement !== scene) {
                scene.appendChild(el);
            }
        });
    }
}

// Универсальная функция для позиционирования геометок и стрелок по координатам картинки
export function positionMarkersOnBg() {
    console.log('=== positionMarkersOnBg НАЧАЛО ===');
    console.log('positionMarkersOnBg вызвана, размер окна:', window.innerWidth, 'x', window.innerHeight);
    
    const imageBlock = document.querySelector('.image');
    console.log('Размеры контейнера YYY:', imageBlock.clientWidth, 'x', imageBlock.clientHeight);

    const imageContainer = document.querySelector('.image-container');
    if (!imageBlock || !imageContainer) {
        console.log('Не найдены imageBlock или imageContainer');
        return;
    }
    
    // Проверяем, что изображение загружено
    const computedStyle = window.getComputedStyle(imageBlock);
    const backgroundImage = computedStyle.backgroundImage;
    //console.log('Фоновое изображение:', backgroundImage);
    
    // Если изображение еще не загружено, ждем немного и повторяем
    if (backgroundImage === 'none' || backgroundImage === '') {
        console.log('Изображение еще не загружено, повторяем через 100мс');
        setTimeout(() => {
            positionMarkersOnBg();
        }, 100);
        return;
    }
    
    // Определяем, мобильная ли версия
    const isMobile = window.innerWidth <= 700;
    //console.log('isMobile:', isMobile, 'Размеры контейнера:', imageContainer.clientWidth, 'x', imageContainer.clientHeight);

    // Геометки и стрелки должны иметь data-x-desktop/data-y-desktop или data-x-mobile/data-y-mobile
    const markers = document.querySelectorAll('[data-x-desktop][data-y-desktop], [data-x-mobile][data-y-mobile]');
    //console.log('Найдено маркеров:', markers.length);
    
    markers.forEach((marker, index) => {
        try {
            /*
            console.log(`=== Обработка маркера ${index} ===`);
                        
            // Выводим информацию о маркере для отладки
            console.log(`Маркер ${index}:`, {
                className: marker.className,
                id: marker.id,
                tagName: marker.tagName
            });
            */
            // Выбираем координаты в зависимости от размера экрана
            let x, y;
            if (isMobile) {
                // Для мобильных используем старую логику с размерами картинки
                const imgNaturalWidth = 2624;
                const imgNaturalHeight = 1824;
                const blockWidth = imageBlock.clientWidth;
                const blockHeight = imageBlock.clientHeight;
                const scale = blockHeight / imgNaturalHeight;
                const bgWidth = imgNaturalWidth * scale;
                const bgLeft = 0;
                
                x = parseFloat(marker.dataset.xMobile);
                y = parseFloat(marker.dataset.yMobile);
                
                const left = bgLeft + (x * scale) - (marker.clientWidth / 2);
                const top = (y * scale) - (marker.clientHeight / 2);
                
                // Применяем стили с !important через setProperty
                marker.style.setProperty('left', left + 'px', 'important');
                marker.style.setProperty('top', top + 'px', 'important');
            } else {
                console.log('НОВЫЙ МАРКЕР:', index);
                // Для десктопа: улучшенная логика позиционирования
                // 1. Получаем элемент .image
                const imageElement = document.querySelector('.image');
                if (!imageElement) {
                    console.log('Элемент .image не найден');
                    return;
                }
                
                // Получаем фоновое изображение
                const computedStyle = window.getComputedStyle(imageElement);
                const backgroundImage = computedStyle.backgroundImage;
                console.log('Фоновое изображение:', backgroundImage);
                
                // Проверяем, что фоновое изображение загружено
                if (backgroundImage === 'none' || backgroundImage === '') {
                    console.log('Фоновое изображение еще не загружено');
                    return;
                }
                
                // 2. Получаем размеры контейнера .image
                const containerWidth = imageElement.clientWidth;
                const containerHeight = imageElement.clientHeight;
                
                // 3. Исходные размеры изображения и координаты
                const originalWidth = 2624;
                const originalHeight = 1824;
                const originalX = parseFloat(marker.dataset.xDesktop);
                const originalY = parseFloat(marker.dataset.yDesktop);
                //const originalX = parseFloat(marker.getBoundingClientRect().left.toFixed(2));
                //const originalY = parseFloat(marker.getBoundingClientRect().top.toFixed(2));
                
                console.log('Позиция Маркера {index} QQQ:', originalX, 'x', originalY);

                console.log('Размеры контейнера XXX:', containerWidth, 'x', containerHeight);
                console.log(`Маркер ${index}: исходные координаты: x=${originalX}, y=${originalY}`);
                //console.log(`Маркер ${index}: размеры контейнера: ${containerWidth}x${containerHeight}`);
                
                // 4. Вычисляем масштаб для background-size: contain
                //const scaleX = containerWidth / originalWidth;
                //const scaleY = containerHeight / originalHeight;
                const scale = containerHeight / originalHeight;
                
                // 5. Реальные размеры отображаемой картинки
                const realImageWidth = originalWidth * scale;
                const realImageHeight = originalHeight * scale;
                
                console.log(`Маркер ${index}: масштаб scale: ${scale}`);
                //console.log(`Маркер ${index}:  масштаб: ${scale.toFixed(4)}, реальные размеры картинки: ${realImageWidth.toFixed(2)}x${realImageHeight.toFixed(2)}`);
                
                // 6. Вычисляем координаты геометки для реального размера изображения
                const scaledX = originalX * scale;
                const scaledY = originalY * scale;
                
                console.log(`Маркер ZZZ ${index}: координаты для реального размера: x=${scaledX.toFixed(2)}, y=${scaledY.toFixed(2)}`);
                if (index == 2) {
                    const b = true;
                }

                // 7. Вычисляем отступ от левого края до картинки (улучшенная логика)
                const imageLeftOffset = (containerWidth - realImageWidth) / 2;
                const imageTopOffset = (containerHeight - realImageHeight) / 2;
                
                //console.log(`Маркер ${index}: отступы картинки: left=${imageLeftOffset.toFixed(2)}, top=${imageTopOffset.toFixed(2)}`);
                
                // 8. Проверяем, что отступы корректны
                if (imageLeftOffset < 0 || imageTopOffset < 0) {
                    console.warn(`Маркер ${index}: Отрицательные отступы! left=${imageLeftOffset}, top=${imageTopOffset}`);
                }
                
                // 9. Финальные координаты геометки
                const finalX = imageLeftOffset + scaledX;
                const finalY = imageTopOffset + scaledY;
                
                marker.style.setProperty('position', 'absolute', 'important');
                marker.style.setProperty('left', Math.max(0, finalX) + 'px', 'important');
                marker.style.setProperty('top', Math.max(0, finalY) + 'px', 'important');


                console.log(`Маркер ${index}: финальные координаты: x=${finalX.toFixed(2)}, y=${finalY.toFixed(2)}`);

                /*                
                // 10. Проверяем, что координаты находятся в пределах контейнера
                if (finalX < 0 || finalX > containerWidth || finalY < 0 || finalY > containerHeight) {
                    console.warn(`Маркер ${index}: Координаты вне контейнера! x=${finalX}, y=${finalY}, контейнер: ${containerWidth}x${containerHeight}`);
                }
                
                // 11. Находим сам маркер внутри блока
                const markerElement = marker.querySelector('.map-mark') || marker;
                
                // 12. Позиционируем map-mark по центру
                const markerLeft = finalX - (markerElement.clientWidth / 2);
                const markerTop = finalY - (markerElement.clientHeight / 2);
                
                console.log(`Маркер ${index}: позиция map-mark: left=${markerLeft.toFixed(2)}, top=${markerTop.toFixed(2)}`);
                
                // 13. Позиционируем map-mark-area относительно map-mark
                const areaLeft = markerLeft - (marker.clientWidth - markerElement.clientWidth);// / 2;
                const areaTop = markerTop - (marker.clientHeight - markerElement.clientHeight);// / 2;
                
                console.log(`Маркер ${index}: позиция map-mark-area: left=${areaLeft.toFixed(2)}, top=${areaTop.toFixed(2)}`);
                
                // 14. Применяем стили с дополнительными проверками
                marker.style.setProperty('position', 'absolute', 'important');
                marker.style.setProperty('left', Math.max(0, areaLeft) + 'px', 'important');
                marker.style.setProperty('top', Math.max(0, areaTop) + 'px', 'important');

                console.log(`Маркер ${index}: применены стили: left=${Math.max(0, areaLeft).toFixed(2)}px, top=${Math.max(0, areaTop).toFixed(2)}px`);
                */
                
            }
            
            // Для map-mark-area элементов изменяем порядок элементов в зависимости от позиции
            if (marker.classList.contains('map-mark-area') && !isMobile) {
                const contentWrapper = marker.querySelector('.content-wrapper');
                if (contentWrapper) {
                    reorderGeoMarkerElements(contentWrapper, marker);
                }
            }
        } catch (error) {
            console.error(`Ошибка позиционирования маркера ${index}:`, error);
        }
    });
    
    // После позиционирования маркеров позиционируем content-wrapper относительно map-mark
    positionContentWrapperRelativeToMapMark();
    
    // Растягиваем картинки papera по размеру текста
    stretchPaperaToTextWidth();
    
    // Дополнительно вызываем stretchPaperaToTextWidth через небольшую задержку для гарантии
    setTimeout(() => {
        console.log('Дополнительный вызов stretchPaperaToTextWidth через задержку');
        stretchPaperaToTextWidth();
    }, 200);
    
    // Перемещаем геометки и стрелки в зависимости от размера экрана
    moveMarkersAndCursors();
    
    // Создаем расширенные области для геометок после позиционирования
    createExtendedHoverArea();
    
    console.log('=== positionMarkersOnBg КОНЕЦ ===');
}

// Функция для позиционирования content-wrapper относительно map-mark
export function positionContentWrapperRelativeToMapMark() {
    console.log('=== positionContentWrapperRelativeToMapMark НАЧАЛО ===');
    
    // Находим все map-mark-area элементы
    const mapMarkAreas = document.querySelectorAll('.map-mark-area');
    
    mapMarkAreas.forEach((mapMarkArea, index) => {
        try {
            // Находим map-mark внутри map-mark-area
            const mapMark = mapMarkArea.querySelector('.map-mark');
            const contentWrapper = mapMarkArea.querySelector('.content-wrapper');
            
            if (!mapMark || !contentWrapper) {
                console.log(`Маркер ${index}: map-mark или content-wrapper не найден`);
                return;
            }
            
            // Получаем координаты map-mark
            const mapMarkRect = mapMark.getBoundingClientRect();
            const mapMarkAreaRect = mapMarkArea.getBoundingClientRect();
            
            // Вычисляем относительную позицию map-mark внутри map-mark-area
            const mapMarkX = mapMarkRect.left - mapMarkAreaRect.left;
            const mapMarkY = mapMarkRect.top - mapMarkAreaRect.top;
            const mapMarkWidth = mapMark.clientWidth;
            
            // Небольшой отступ (например, 10px)
            const offset = 10;
            
            // Вычисляем координаты для content-wrapper
            const contentWrapperX = mapMarkX + mapMarkWidth + offset;
            const contentWrapperY = mapMarkY; // Такая же Y координата, как у map-mark
            
            console.log(`Маркер ${index}: map-mark X: ${mapMarkX}, Y: ${mapMarkY}, ширина: ${mapMarkWidth}, content-wrapper X: ${contentWrapperX}, Y: ${contentWrapperY}`);
            
            // Применяем позиционирование к content-wrapper
            contentWrapper.style.setProperty('left', contentWrapperX + 'px', 'important');
            contentWrapper.style.setProperty('top', contentWrapperY + 'px', 'important');
            contentWrapper.style.setProperty('position', 'absolute', 'important');
            
            // Устанавливаем высоту content-wrapper равной высоте map-mark
            const mapMarkHeight = mapMark.clientHeight;
            contentWrapper.style.setProperty('height', mapMarkHeight + 'px', 'important');
            contentWrapper.style.setProperty('min-height', mapMarkHeight + 'px', 'important');
            
            console.log(`Маркер ${index}: content-wrapper установлена высота ${mapMarkHeight}px (равна map-mark)`);
            
            // Убеждаемся, что papera-image видима в десктопной версии
            const paperaImage = contentWrapper.querySelector('.papera-image');
            if (paperaImage && window.innerWidth > 700) {
                // Не перезаписываем ширину, если она уже установлена по размеру текста
                if (!paperaImage.style.width || paperaImage.style.width === '280px' || paperaImage.style.width === '0px') {
                    paperaImage.style.setProperty('width', '100%', 'important');
                }
                paperaImage.style.setProperty('height', '100%', 'important');
                paperaImage.style.setProperty('object-fit', 'cover', 'important');
                paperaImage.style.setProperty('opacity', '1', 'important');
                paperaImage.style.setProperty('margin', '0', 'important');
                paperaImage.style.setProperty('top', '0', 'important');
                paperaImage.style.setProperty('z-index', '1', 'important');
                paperaImage.style.setProperty('min-width', '100%', 'important');
                paperaImage.style.setProperty('min-height', '100%', 'important');
                paperaImage.style.setProperty('max-width', 'none', 'important');
                paperaImage.style.setProperty('max-height', 'none', 'important');
                
                // Обновляем размеры контейнера чтобы он вмещал содержимое
                const textElem = contentWrapper.querySelector('.tumski-text');
                const textWidth = textElem ? textElem.offsetWidth : 280;
                const containerWidth = textWidth + 20; // Ширина изображения + небольшой отступ
                contentWrapper.style.setProperty('width', containerWidth + 'px', 'important');
                contentWrapper.style.setProperty('min-width', containerWidth + 'px', 'important');
                contentWrapper.style.setProperty('max-width', 'none', 'important');
                contentWrapper.style.setProperty('overflow', 'visible', 'important');
            }
            
        } catch (error) {
            console.error(`Ошибка позиционирования content-wrapper для маркера ${index}:`, error);
        }
    });
    
    console.log('=== positionContentWrapperRelativeToMapMark КОНЕЦ ===');
}

// Функция для применения трансформации зума к геометкам
export function applyZoomTransformToMarkers() {
    // При zoom эффекте приостанавливаем анимацию moveForward для меток
    const markers = document.querySelectorAll('.map-mark-area');
    markers.forEach(marker => {
        marker.style.animationPlayState = 'paused';
    });
    
    // Пересчитываем позиции геометок при любых изменениях
    positionMarkersOnBg();
    
    // Для стрелок применяем трансформацию напрямую
    const imageContainer = document.querySelector('.image-container');
    if (!imageContainer) return;
    
    const transform = window.getComputedStyle(imageContainer).transform;
    const arrows = document.querySelectorAll('.custom-cursor-area, .custom-cursor-prostoarea');
    
    arrows.forEach(arrow => {
        arrow.style.transform = transform;
        
        // Для мобильной версии не применяем трансформацию
        if (window.innerWidth <= 700) {
            arrow.style.transform = 'none';
        }
    });
}

// Функция для отслеживания изменений трансформации изображения
export function setupZoomTracking() {
    console.log('setupZoomTracking вызвана');
    
    const imageContainer = document.querySelector('.image-container');
    if (!imageContainer) {
        console.log('Элемент .image-container не найден');
        return;
    }
    
    console.log('Элемент .image-container найден:', imageContainer);
    
    // Создаем наблюдатель за изменениями стилей
    const observer = new MutationObserver((mutations) => {
        console.log('MutationObserver сработал, mutations:', mutations.length);
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                console.log('Изменение стиля обнаружено');
                // Проверяем, изменилась ли трансформация
                const currentTransform = imageContainer.style.transform;
                console.log('Текущая трансформация:', currentTransform);
                if (currentTransform && currentTransform !== 'none') {
                    console.log('Вызываем applyZoomTransformToMarkers для стилей');
                    applyZoomTransformToMarkers();
                    // Также пересчитываем позиции геометок
                    positionMarkersOnBg();
                } else {
                    console.log('Сбрасываем трансформацию');
                    // Сбрасываем трансформацию стрелок
                    const arrows = document.querySelectorAll('.custom-cursor-area, .custom-cursor-prostoarea');
                    arrows.forEach(arrow => {
                        arrow.style.transform = 'none';
                    });
                    
                    // Возобновляем анимацию moveForward для меток
                    const markers = document.querySelectorAll('.map-mark-area');
                    markers.forEach(marker => {
                        marker.style.animationPlayState = 'running';
                    });
                    
                    // Пересчитываем позиции геометок
                    positionMarkersOnBg();
                }
            }
        });
    });
    
    // Начинаем наблюдение за изменениями стилей
    observer.observe(imageContainer, {
        attributes: true,
        attributeFilter: ['style']
    });
    
    // Также отслеживаем изменения через CSS классы
    const classObserver = new MutationObserver((mutations) => {
        console.log('ClassObserver сработал, mutations:', mutations.length);
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                console.log('Изменение класса обнаружено');
                const hasZoomClass = imageContainer.classList.contains('zoom-transition') || 
                                   imageContainer.classList.contains('zoom-transition-Right') || 
                                   imageContainer.classList.contains('zoom-transition-Up');
                
                console.log('Классы контейнера:', imageContainer.className);
                console.log('Есть класс зума:', hasZoomClass);
                
                if (hasZoomClass) {
                    console.log('Вызываем applyZoomTransformToMarkers для классов');
                    // Применяем трансформацию с небольшой задержкой для завершения анимации
                    setTimeout(() => {
                        console.log('Выполняем applyZoomTransformToMarkers после задержки');
                        applyZoomTransformToMarkers();
                        // Также пересчитываем позиции геометок
                        positionMarkersOnBg();
                    }, 100);
                } else {
                    console.log('Сбрасываем трансформацию для классов');
                    // Сбрасываем трансформацию
                    const arrows = document.querySelectorAll('.custom-cursor-area, .custom-cursor-prostoarea');
                    arrows.forEach(arrow => {
                        arrow.style.transform = 'none';
                    });
                    
                    // Возобновляем анимацию moveForward для меток
                    const markers = document.querySelectorAll('.map-mark-area');
                    markers.forEach(marker => {
                        marker.style.animationPlayState = 'running';
                    });
                    
                    // Пересчитываем позиции геометок
                    positionMarkersOnBg();
                }
            }
        });
    });
    
    // Начинаем наблюдение за изменениями классов
    classObserver.observe(imageContainer, {
        attributes: true,
        attributeFilter: ['class']
    });
    console.log('Наблюдение за классами установлено');
    
    // Начинаем наблюдение за изменениями стилей
    observer.observe(imageContainer, {
        attributes: true,
        attributeFilter: ['style']
    });
    console.log('Наблюдение за стилями установлено');
}

// Экспортируем функции в глобальную область видимости
if (typeof window !== 'undefined') {
    window.applyZoomTransformToMarkers = applyZoomTransformToMarkers;
    window.setupZoomTracking = setupZoomTracking;
    window.positionMarkersOnBg = positionMarkersOnBg;
    window.positionContentWrapperRelativeToMapMark = positionContentWrapperRelativeToMapMark;
    window.stretchPaperaToTextWidth = stretchPaperaToTextWidth;
    window.updateContentWrapperSizesAfterLanguageChange = updateContentWrapperSizesAfterLanguageChange;
    window.forceUpdateContentWrapperSizes = forceUpdateContentWrapperSizes;
    window.forceUpdateExtendedHoverAreas = forceUpdateExtendedHoverAreas;
    window.updateExtendedHoverAreaSizes = updateExtendedHoverAreaSizes;
    window.setupKatedraKoscielnaHandler = setupKatedraKoscielnaHandler;
}

// Добавляем обработчик изменения размера окна
window.addEventListener('resize', function() {
    // Небольшая задержка для стабилизации размера
    clearTimeout(window.resizeTimeout);
    window.resizeTimeout = setTimeout(() => {
        if (window.updateContentWrapperSizesAfterLanguageChange) {
            console.log('Обновляем размеры контейнеров после изменения размера окна...');
            window.updateContentWrapperSizesAfterLanguageChange();
        }
        if (window.updateExtendedHoverAreaSizes) {
            console.log('Обновляем размеры расширенных областей после изменения размера окна...');
            window.updateExtendedHoverAreaSizes();
        }
    }, 250);
});

// Функция для принудительного пересчета позиций при изменении размера окна
export function recalculatePositionsOnResize() {
    console.log('recalculatePositionsOnResize вызвана');
    
    // Ждем немного, чтобы браузер успел перерисовать
    setTimeout(() => {
        console.log('Выполняем пересчет позиций после изменения размера');
        positionMarkersOnBg();
    }, 50);
}

// Функция для сброса зума/анимации
export function setupMobileResetAnimation() {
    if (window.innerWidth > 700) return; // Только для мобильных
    const imageContainer = document.querySelector('.image-container');
    if (!imageContainer) return;
    // Сброс по одиночному тачу вне элементов управления
    document.addEventListener('touchend', function(e) {
        // Игнорируем, если тап по элементам управления
        if (
            e.target.closest('.back-link') ||
            e.target.closest('.language-switcher') ||
            e.target.closest('.book-overlay') ||
            e.target.closest('.most-overlay')
        ) return;
        imageContainer.classList.remove('zoom-transition', 'zoom-transition-Right', 'zoom-transition-Up');
        imageContainer.classList.add('reset-animation');
        
        // Сбрасываем трансформацию стрелок
        const arrows = document.querySelectorAll('.custom-cursor-area, .custom-cursor-prostoarea');
        arrows.forEach(arrow => {
            arrow.style.transform = 'none';
        });
        
        // Возобновляем анимацию moveForward для меток
        const markers = document.querySelectorAll('.map-mark-area');
        markers.forEach(marker => {
            marker.style.animationPlayState = 'running';
        });
        
        // Пересчитываем позиции геометок
        positionMarkersOnBg();
        
        setTimeout(() => {
            imageContainer.classList.remove('reset-animation');
        }, 100);
    });
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log('tumski_cathedral_handler.js: DOM загружен, инициализируем...');
    
    // Создаем расширенные области для геометок
    createExtendedHoverArea();
    
    // Экспортируем функции в глобальную область видимости
    window.moveMarkersAndCursors = moveMarkersAndCursors;
    window.positionMarkersOnBg = positionMarkersOnBg;
    window.positionContentWrapperRelativeToMapMark = positionContentWrapperRelativeToMapMark;
    window.stretchPaperaToTextWidth = stretchPaperaToTextWidth;
    window.setupMobileResetAnimation = setupMobileResetAnimation;
    window.setupZoomTracking = setupZoomTracking;
    window.setupKatedraKoscielnaHandler = setupKatedraKoscielnaHandler;
});

// Удаляем дублирующий блок, так как инициализация теперь происходит в HTML-файле 