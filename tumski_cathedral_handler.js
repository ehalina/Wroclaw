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
    // Находим все map-mark-area
    const mapMarkAreas = document.querySelectorAll('.map-mark-area');
    
    mapMarkAreas.forEach((mapMarkArea, index) => {
        try {
            // Находим map-mark и content-wrapper
            const mapMark = mapMarkArea.querySelector('.map-mark');
            const contentWrapper = mapMarkArea.querySelector('.content-wrapper');
            
            if (!mapMark || !contentWrapper) {
                return;
            }
            
            // Получаем новый размер текста после смены языка
            const textElem = contentWrapper.querySelector('.tumski-text');
            if (!textElem) {
                return;
            }
            
            const newTextWidth = textElem.offsetWidth;
            const mapMarkHeight = mapMark.clientHeight;
            
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
            
        } catch (error) {
            // Ошибка при обновлении маркера
        }
    });
}

// Функция для принудительного обновления размеров контейнеров
function forceUpdateContentWrapperSizes() {
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
            }
            
        } catch (error) {
            // Ошибка при создании расширенной области для маркера
        }
    });
}

// Функция для принудительного обновления расширенных областей
function forceUpdateExtendedHoverAreas() {
    // Удаляем все существующие расширенные области
    const existingAreas = document.querySelectorAll('.extended-hover-area');
    existingAreas.forEach(area => area.remove());
    
    // Создаем новые расширенные области
    createExtendedHoverArea();
}

// Функция для обновления размеров расширенных областей
function updateExtendedHoverAreaSizes() {
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
            
        } catch (error) {
            // Ошибка при обновлении области
        }
    });
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
    const bookSoundKatedraKoscielna = document.querySelector('#bookSoundKoscielna');
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

    setupCustomHandler(katedraKoscielnaTxt, mapMarkKatedraKoscielna, bookSoundKatedraKoscielna, mostOverlay, container, mostTitle, 'katedra_koscielna');
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
export function setupUniversalGeoMarker({ markerId, i18nKey, position }) {
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
    
    // Обновляем текст геометки при инициализации
    if (textElem && window.i18n && typeof window.i18n.t === 'function') {
        const title = window.i18n.t(i18nKey + '.title');
        textElem.innerHTML = title;
    }
    
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
            
            const titleText = window.i18n.t(i18nKey + '.title');
            const descriptionKey = i18nKey + '.book02.zone1.text';
            const descriptionText = window.i18n.t(descriptionKey);
            
            mostTitles.forEach(title => {
                title.innerHTML = titleText;
            });
            
            mostDescriptions.forEach(description => {
                description.innerHTML = descriptionText;
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
    const mapMarkAreas = document.querySelectorAll('.map-mark-area');
    
    mapMarkAreas.forEach((mapMarkArea, index) => {
        try {
            const contentWrapper = mapMarkArea.querySelector('.content-wrapper');
            const paperaImage = contentWrapper?.querySelector('.papera-image');
            const textElem = contentWrapper?.querySelector('.tumski-text');
            
            if (!paperaImage || !textElem) {
                return;
            }
            
            // Получаем ширину текста и высоту map-mark
            const textWidth = textElem.offsetWidth;
            const mapMark = mapMarkArea.querySelector('.map-mark');
            const mapMarkHeight = mapMark ? mapMark.offsetHeight : 80;
            
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
            const containerWidth = textWidth + 20;
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
            }

        } catch (error) {
            // Ошибка растягивания papera
        }
    });
} 

// Функция для перемещения геометок и стрелок внутрь .image на мобильных и обратно на десктопе
export function moveMarkersAndCursors() {
    const isMobile = window.innerWidth <= 700;
    const image = document.querySelector('.image');
    const scene = document.querySelector('.scene');
    // Собираем все map-mark-area и cursor-areas
    const elements = Array.from(document.querySelectorAll('.map-mark-area, .custom-cursor-area, .custom-cursor-prostoarea, .custom-cursor-prosto-leftarea, .custom-cursor-backarea, .custom-cursor-leftarea'));
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
    const imageBlock = document.querySelector('.image');
    const imageContainer = document.querySelector('.image-container');
    if (!imageBlock || !imageContainer) {
        return;
    }
    
    // Проверяем, что изображение загружено
    const computedStyle = window.getComputedStyle(imageBlock);
    const backgroundImage = computedStyle.backgroundImage;
    
    // Если изображение еще не загружено, ждем немного и повторяем
    if (backgroundImage === 'none' || backgroundImage === '') {
        setTimeout(() => {
            positionMarkersOnBg();
        }, 100);
        return;
    }
    
    // Определяем, мобильная ли версия
    const isMobile = window.innerWidth <= 1366;

    // Геометки и стрелки должны иметь data-x-desktop/data-y-desktop или data-x-mobile/data-y-mobile
    const markers = document.querySelectorAll('[data-x-desktop][data-y-desktop], [data-x-mobile][data-y-mobile]');
    
    markers.forEach((marker, index) => {
        try {
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
                // Для десктопа: улучшенная логика позиционирования
                // 1. Получаем элемент .image
                const imageElement = document.querySelector('.image');
                if (!imageElement) {
                    return;
                }
                
                // Получаем фоновое изображение
                const computedStyle = window.getComputedStyle(imageElement);
                const backgroundImage = computedStyle.backgroundImage;
                
                // Проверяем, что фоновое изображение загружено
                if (backgroundImage === 'none' || backgroundImage === '') {
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
                
                // 4. Вычисляем масштаб для background-size: contain
                const scale = containerHeight / originalHeight;
                
                // 5. Реальные размеры отображаемой картинки
                const realImageWidth = originalWidth * scale;
                const realImageHeight = originalHeight * scale;
                
                // 6. Вычисляем координаты геометки для реального размера изображения
                const scaledX = originalX * scale;
                const scaledY = originalY * scale;

                // 7. Вычисляем отступ от левого края до картинки (улучшенная логика)
                const imageLeftOffset = (containerWidth - realImageWidth) / 2;
                const imageTopOffset = (containerHeight - realImageHeight) / 2;
                
                // 8. Проверяем, что отступы корректны
                if (imageLeftOffset < 0 || imageTopOffset < 0) {
                    // Отрицательные отступы
                }
                
                // 9. Финальные координаты геометки
                const finalX = imageLeftOffset + scaledX;
                const finalY = imageTopOffset + scaledY;
                
                marker.style.setProperty('position', 'absolute', 'important');
                marker.style.setProperty('left', Math.max(0, finalX) + 'px', 'important');
                marker.style.setProperty('top', Math.max(0, finalY) + 'px', 'important');
            }
            
            // Для map-mark-area элементов изменяем порядок элементов в зависимости от позиции
            if (marker.classList.contains('map-mark-area') && !isMobile) {
                const contentWrapper = marker.querySelector('.content-wrapper');
                if (contentWrapper) {
                    reorderGeoMarkerElements(contentWrapper, marker);
                }
            }
        } catch (error) {
            // Ошибка позиционирования маркера
        }
    });
    
    // После позиционирования маркеров позиционируем content-wrapper относительно map-mark
    positionContentWrapperRelativeToMapMark();
    
    // Растягиваем картинки papera по размеру текста
    stretchPaperaToTextWidth();
    
    // Дополнительно вызываем stretchPaperaToTextWidth через небольшую задержку для гарантии
    setTimeout(() => {
        stretchPaperaToTextWidth();
    }, 200);
    
    // Перемещаем геометки и стрелки в зависимости от размера экрана
    moveMarkersAndCursors();
    
    // Создаем расширенные области для геометок после позиционирования
    createExtendedHoverArea();
}

// Функция для позиционирования content-wrapper относительно map-mark
export function positionContentWrapperRelativeToMapMark() {
    // Находим все map-mark-area элементы
    const mapMarkAreas = document.querySelectorAll('.map-mark-area');
    
    mapMarkAreas.forEach((mapMarkArea, index) => {
        try {
            // Находим map-mark внутри map-mark-area
            const mapMark = mapMarkArea.querySelector('.map-mark');
            const contentWrapper = mapMarkArea.querySelector('.content-wrapper');
            
            if (!mapMark || !contentWrapper) {
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
            
            // Применяем позиционирование к content-wrapper
            contentWrapper.style.setProperty('left', contentWrapperX + 'px', 'important');
            contentWrapper.style.setProperty('top', contentWrapperY + 'px', 'important');
            contentWrapper.style.setProperty('position', 'absolute', 'important');
            
            // Устанавливаем высоту content-wrapper равной высоте map-mark
            const mapMarkHeight = mapMark.clientHeight;
            contentWrapper.style.setProperty('height', mapMarkHeight + 'px', 'important');
            contentWrapper.style.setProperty('min-height', mapMarkHeight + 'px', 'important');
            
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
            // Ошибка позиционирования content-wrapper для маркера
        }
    });
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
    const arrows = document.querySelectorAll('.custom-cursor-area, .custom-cursor-prostoarea, .custom-cursor-prosto-leftarea');
    
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
    const imageContainer = document.querySelector('.image-container');
    if (!imageContainer) {
        return;
    }
    
    // Создаем наблюдатель за изменениями стилей
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                // Проверяем, изменилась ли трансформация
                const currentTransform = imageContainer.style.transform;
                if (currentTransform && currentTransform !== 'none') {
                    applyZoomTransformToMarkers();
                    // Также пересчитываем позиции геометок
                    positionMarkersOnBg();
                } else {
                    // Сбрасываем трансформацию стрелок
                    const arrows = document.querySelectorAll('.custom-cursor-area, .custom-cursor-prostoarea, .custom-cursor-prosto-leftarea');
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
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const hasZoomClass = imageContainer.classList.contains('zoom-transition') || 
                                   imageContainer.classList.contains('zoom-transition-Right') || 
                                   imageContainer.classList.contains('zoom-transition-Up');
                
                if (hasZoomClass) {
                    // Применяем трансформацию с небольшой задержкой для завершения анимации
                    setTimeout(() => {
                        applyZoomTransformToMarkers();
                        // Также пересчитываем позиции геометок
                        positionMarkersOnBg();
                    }, 100);
                } else {
                    // Сбрасываем трансформацию
                    const arrows = document.querySelectorAll('.custom-cursor-area, .custom-cursor-prostoarea, .custom-cursor-prosto-leftarea');
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
            window.updateContentWrapperSizesAfterLanguageChange();
        }
        if (window.updateExtendedHoverAreaSizes) {
            window.updateExtendedHoverAreaSizes();
        }
    }, 250);
});

// Функция для принудительного пересчета позиций при изменении размера окна
export function recalculatePositionsOnResize() {
    // Ждем немного, чтобы браузер успел перерисовать
    setTimeout(() => {
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
        const arrows = document.querySelectorAll('.custom-cursor-area, .custom-cursor-prostoarea, .custom-cursor-prosto-leftarea');
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

// Универсальный tumski_cathedral_handler.js - инициализация происходит в файлах tumski*_init.js