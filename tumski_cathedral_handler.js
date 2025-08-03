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

// Обработчик для геометки "Собор Святого Иоанна Крестителя"
export function setupTumskiCathedralHandler() {
    const tumskiCathedralTxt = document.querySelector('#tumski-cathedral-text');
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
                    title.textContent = window.i18n.t(i18nKey + '.title');
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
  /*  // Стили для растяжения картинки по ширине текста
    paperaImg.style.width = textElem ? (textElem.offsetWidth + 'px') : '100%';
    paperaImg.style.height = '50px';
    paperaImg.style.display = 'block';
    paperaImg.style.objectFit = 'contain';
    paperaImg.style.margin = '0 auto';
    paperaImg.style.position = 'relative';
    paperaImg.style.top = '1px';
*/

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
                title.textContent = window.i18n.t(i18nKey + '.title');
            });
            
            mostDescriptions.forEach(description => {
                description.textContent = window.i18n.t(i18nKey + '.description');
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
    
    // Добавляем глобальный обработчик для отслеживания изменений стилей
    if (!window.markerStyleTracker) {
        window.markerStyleTracker = new Map();
        
        // Перехватываем setProperty для отслеживания изменений
        const originalSetProperty = CSSStyleDeclaration.prototype.setProperty;
        CSSStyleDeclaration.prototype.setProperty = function(property, value, priority) {
            if (property === 'left' || property === 'top') {
                const element = this.ownerNode;
                if (element && (element.classList.contains('map-mark-area') || element.classList.contains('custom-cursor-area'))) {
                    console.warn(`ПЕРЕХВАЧЕНО изменение стиля ${property}=${value} для элемента:`, element.className, element);
                }
            }
            return originalSetProperty.call(this, property, value, priority);
        };
    }
    const imageBlock = document.querySelector('.image');
    const imageContainer = document.querySelector('.image-container');
    if (!imageBlock || !imageContainer) {
        console.log('Не найдены imageBlock или imageContainer');
        return;
    }
    
    // Определяем, мобильная ли версия
    const isMobile = window.innerWidth <= 700;
    console.log('isMobile:', isMobile, 'Размеры контейнера:', imageContainer.clientWidth, 'x', imageContainer.clientHeight);

    // Геометки и стрелки должны иметь data-x-desktop/data-y-desktop или data-x-mobile/data-y-mobile
    const markers = document.querySelectorAll('[data-x-desktop][data-y-desktop], [data-x-mobile][data-y-mobile]');
    console.log('Найдено маркеров:', markers.length);
    
    // Проверяем все элементы с атрибутами координат
    const allElementsWithCoords = document.querySelectorAll('[data-x-desktop], [data-y-desktop], [data-x-mobile], [data-y-mobile]');
    console.log('Всего элементов с координатами:', allElementsWithCoords.length);
    allElementsWithCoords.forEach((el, index) => {
        console.log(`Элемент ${index}:`, {
            className: el.className,
            id: el.id,
            dataXDesktop: el.dataset.xDesktop,
            dataYDesktop: el.dataset.yDesktop,
            dataXMobile: el.dataset.xMobile,
            dataYMobile: el.dataset.yMobile
        });
    });
    
    markers.forEach((marker, index) => {
        try {
            console.log(`=== Обработка маркера ${index} ===`);
            
            // Выводим информацию о маркере для отладки
            console.log(`Маркер ${index}:`, {
                className: marker.className,
                id: marker.id,
                tagName: marker.tagName
            });
            
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
            // Для десктопа: новая логика позиционирования
                           // 1. Получаем элемент .image
            const imageElement = document.querySelector('.image');
            if (!imageElement) {
                console.log('Элемент .image не найден');
                return;
            }
            
            // 2. Получаем размеры контейнера .image
            const containerWidth = imageElement.clientWidth;
            const containerHeight = imageElement.clientHeight;
            
            // Получаем позицию родительского элемента .scene
            const sceneElement = document.querySelector('.scene');
            const sceneRect = sceneElement ? sceneElement.getBoundingClientRect() : { left: 0, top: 0 };
            
            console.log(`Маркер ${index}: размеры контейнера: ${containerWidth}x${containerHeight}`);
            console.log(`Маркер ${index}: позиция .scene: left=${sceneRect.left.toFixed(2)}, top=${sceneRect.top.toFixed(2)}`);
            
            // 3. Исходные размеры изображения и координаты
            const originalWidth = 2624;
            const originalHeight = 1824;
            const originalX = parseFloat(marker.dataset.xDesktop);
            const originalY = parseFloat(marker.dataset.yDesktop);
            
            console.log(`Маркер ${index}: исходные координаты: x=${originalX}, y=${originalY}`);
            
            // 4. Вычисляем масштаб для background-size: contain
            const scaleX = containerWidth / originalWidth;
            const scaleY = containerHeight / originalHeight;
            const scale = Math.min(scaleX, scaleY);
            
            // 5. Реальные размеры отображаемой картинки
            const realImageWidth = originalWidth * scale;
            const realImageHeight = originalHeight * scale;
                
                                                       console.log(`Маркер ${index}: масштаб: ${scale.toFixed(4)}, реальные размеры картинки: ${realImageWidth.toFixed(2)}x${realImageHeight.toFixed(2)}`);
            
            // Дополнительная отладочная информация
            console.log('Детали контейнеров:', {
                imageContainer: `${imageContainer.clientWidth}x${imageContainer.clientHeight}`,
                imageElement: `${imageElement.clientWidth}x${imageElement.clientHeight}`,
                window: `${window.innerWidth}x${window.innerHeight}`
            });
                
                // Дополнительная отладочная информация
                console.log('Детали контейнеров:', {
                    imageContainer: `${imageContainer.clientWidth}x${imageContainer.clientHeight}`,
                    imageElement: `${imageElement.clientWidth}x${imageElement.clientHeight}`,
                    window: `${window.innerWidth}x${window.innerHeight}`
                });
                
                            // 6. Вычисляем координаты геометки для реального размера изображения
            const scaledX = originalX * scale;
            const scaledY = originalY * scale;
            
            console.log(`Маркер ${index}: координаты для реального размера: x=${scaledX.toFixed(2)}, y=${scaledY.toFixed(2)}`);
            
            // 7. Вычисляем отступ от левого края до картинки
            const imageLeftOffset = (containerWidth - realImageWidth) / 2;
            const imageTopOffset = (containerHeight - realImageHeight) / 2;
            
            console.log(`Маркер ${index}: отступы картинки: left=${imageLeftOffset.toFixed(2)}, top=${imageTopOffset.toFixed(2)}`);
            
            // 8. Финальные координаты геометки (относительно .scene)
            const finalX = imageLeftOffset + scaledX;
            const finalY = imageTopOffset + scaledY;
            
            // Корректируем координаты с учетом позиции .scene относительно окна
            // Поскольку .scene имеет тот же размер, что и окно браузера, коррекция не нужна
            const correctedX = finalX;
            const correctedY = finalY;
            
            console.log(`Маркер ${index}: финальные координаты: x=${finalX.toFixed(2)}, y=${finalY.toFixed(2)}`);
            console.log(`Маркер ${index}: скорректированные координаты: x=${correctedX.toFixed(2)}, y=${correctedY.toFixed(2)}`);
            
            // Проверяем, находится ли маркер на картинке
            const isOnImageX = correctedX >= imageLeftOffset && correctedX <= (imageLeftOffset + realImageWidth);
            const isOnImageY = correctedY >= imageTopOffset && correctedY <= (imageTopOffset + realImageHeight);
            console.log(`Маркер ${index}: на картинке по X: ${isOnImageX}, по Y: ${isOnImageY}`);
            console.log(`Маркер ${index}: границы картинки X: ${imageLeftOffset.toFixed(2)} - ${(imageLeftOffset + realImageWidth).toFixed(2)}, Y: ${imageTopOffset.toFixed(2)} - ${(imageTopOffset + realImageHeight).toFixed(2)}`);
            
            // 9. Находим сам маркер внутри блока
            const markerElement = marker.querySelector('.map-mark') || marker;
            
            // 10. Позиционируем map-mark по центру (используем скорректированные координаты)
            const markerLeft = correctedX - (markerElement.clientWidth / 2);
            const markerTop = correctedY - (markerElement.clientHeight / 2);
            
            console.log(`Маркер ${index}: позиция map-mark: left=${markerLeft.toFixed(2)}, top=${markerTop.toFixed(2)}`);
            
            // 11. Позиционируем map-mark-area относительно map-mark
            const areaLeft = markerLeft - (marker.clientWidth - markerElement.clientWidth) / 2;
            const areaTop = markerTop - (marker.clientHeight - markerElement.clientHeight) / 2;
            
            console.log(`Маркер ${index}: позиция map-mark-area: left=${areaLeft.toFixed(2)}, top=${areaTop.toFixed(2)}`);
            
                            // 12. Применяем стили
                marker.style.setProperty('position', 'absolute', 'important');
                marker.style.setProperty('left', finalLeft + 'px', 'important');
                marker.style.setProperty('top', finalTop + 'px', 'important');
            
                            console.log(`Маркер ${index}: применены стили: left=${finalLeft.toFixed(2)}px, top=${finalTop.toFixed(2)}px`);
            
            // Проверяем, не изменились ли стили после применения
            setTimeout(() => {
                const computedLeft = window.getComputedStyle(marker).left;
                const computedTop = window.getComputedStyle(marker).top;
                console.log(`Маркер ${index}: вычисленные стили через 100мс: left=${computedLeft}, top=${computedTop}`);
                
                if (computedLeft !== `${areaLeft}px` || computedTop !== `${areaTop}px`) {
                    console.warn(`Маркер ${index}: СТИЛИ ПЕРЕОПРЕДЕЛЕНЫ! Ожидалось: left=${areaLeft}px, top=${areaTop}px, Получено: left=${computedLeft}, top=${computedTop}`);
                    
                    // Проверяем inline стили
                    const inlineLeft = marker.style.left;
                    const inlineTop = marker.style.top;
                    console.warn(`Маркер ${index}: inline стили: left=${inlineLeft}, top=${inlineTop}`);
                    
                    // Проверяем CSS правила
                    const cssRules = window.getComputedStyle(marker);
                    console.warn(`Маркер ${index}: CSS position=${cssRules.position}, z-index=${cssRules.zIndex}`);
                }
            }, 100);
            
            // Дополнительная проверка через 500мс
            setTimeout(() => {
                const computedLeft = window.getComputedStyle(marker).left;
                const computedTop = window.getComputedStyle(marker).top;
                console.log(`Маркер ${index}: вычисленные стили через 500мс: left=${computedLeft}, top=${computedTop}`);
            }, 500);
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
    console.log('=== positionMarkersOnBg КОНЕЦ ===');
}

// Функция для применения трансформации зума к геометкам
export function applyZoomTransformToMarkers() {
    // Просто пересчитываем позиции геометок при любых изменениях
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
        
        // Пересчитываем позиции геометок
        positionMarkersOnBg();
        
        setTimeout(() => {
            imageContainer.classList.remove('reset-animation');
        }, 100);
    });
}

// Для автоматического запуска из tumski.html
if (typeof window !== 'undefined') {
    // Экспортируем функции в глобальную область видимости
    window.moveMarkersAndCursors = moveMarkersAndCursors;
    window.positionMarkersOnBg = positionMarkersOnBg;
    window.setupMobileResetAnimation = setupMobileResetAnimation;
    window.setupZoomTracking = setupZoomTracking;
} 

// Удаляем дублирующий блок, так как инициализация теперь происходит в HTML-файле 