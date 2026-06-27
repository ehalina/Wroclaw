// Стили для кнопки карты и модального окна
const MAP_MODAL_STYLE_ID = 'map-modal-styles';
const MAP_MODAL_MOBILE_TOOLTIP_STYLE_ID = 'map-modal-mobile-tooltip-styles';
const MAP_MARKER_NAVIGATION_SCRIPT_ID = 'map-marker-navigation-script';
const VISITED_MARKERS_SCRIPT_ID = 'visited-markers-script';
const QUEST_OVERLAY_SCRIPT_ID = 'quest-overlay-script';

let mapMarkerNavigationPromise = null;
let visitedMarkersPromise = null;
let questOverlayPromise = null;

const mobileTooltipStyles = `
    .mobile-tooltip {
        box-shadow: 0 2px 8px rgba(0,0,0,0.3) !important;
        border: 1px solid rgba(255,255,255,0.2) !important;
        backdrop-filter: blur(2px) !important;
    }
`;

function ensureStyleElement(id, cssText) {
    let styleElement = document.getElementById(id);
    if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = id;
        document.head.appendChild(styleElement);
    }

    if (styleElement.textContent !== cssText) {
        styleElement.textContent = cssText;
    }

    return styleElement;
}

function ensureMapModalStyles() {
    let linkElement = document.getElementById(MAP_MODAL_STYLE_ID);
    if (linkElement && linkElement.tagName.toLowerCase() !== 'link') {
        linkElement.remove();
        linkElement = null;
    }

    if (!linkElement) {
        linkElement = document.createElement('link');
        linkElement.id = MAP_MODAL_STYLE_ID;
        linkElement.rel = 'stylesheet';
        document.head.appendChild(linkElement);
    }

    if (linkElement.getAttribute('href') !== 'map_modal.css') {
        linkElement.href = 'map_modal.css';
    }

    return linkElement;
}

function ensureMobileTooltipStyles() {
    ensureStyleElement(MAP_MODAL_MOBILE_TOOLTIP_STYLE_ID, mobileTooltipStyles);
}

function getMapMarkerNavigation() {
    if (window.MapMarkerNavigation && typeof window.MapMarkerNavigation.navigate === 'function') {
        return window.MapMarkerNavigation;
    }

    return null;
}

function ensureMapMarkerNavigationScript() {
    const navigation = getMapMarkerNavigation();
    if (navigation) {
        return Promise.resolve(navigation);
    }

    if (mapMarkerNavigationPromise) {
        return mapMarkerNavigationPromise;
    }

    mapMarkerNavigationPromise = new Promise((resolve, reject) => {
        let scriptElement = document.getElementById(MAP_MARKER_NAVIGATION_SCRIPT_ID);

        const resolveIfReady = () => {
            const loadedNavigation = getMapMarkerNavigation();
            if (loadedNavigation) {
                resolve(loadedNavigation);
                return;
            }

            scriptElement.remove();
            mapMarkerNavigationPromise = null;
            reject(new Error('Map marker navigation script did not expose MapMarkerNavigation.'));
        };

        const rejectLoad = () => {
            scriptElement.remove();
            mapMarkerNavigationPromise = null;
            reject(new Error('Map marker navigation script failed to load.'));
        };

        if (!scriptElement) {
            scriptElement = document.createElement('script');
            scriptElement.id = MAP_MARKER_NAVIGATION_SCRIPT_ID;
            scriptElement.src = 'map_marker_navigation.js';
            scriptElement.async = true;
            scriptElement.addEventListener('load', resolveIfReady, { once: true });
            scriptElement.addEventListener('error', rejectLoad, { once: true });
            document.head.appendChild(scriptElement);
            return;
        }

        scriptElement.addEventListener('load', resolveIfReady, { once: true });
        scriptElement.addEventListener('error', rejectLoad, { once: true });
    });

    return mapMarkerNavigationPromise;
}

function fallbackMarkerNavigation(page) {
    const pages = (Array.isArray(page) ? page : [page]).filter(Boolean);
    const firstPage = pages[0];

    if (!firstPage) {
        return;
    }

    try {
        sessionStorage.setItem('navigateViaMap', '1');
    } catch (_) {}

    location.href = firstPage;
}

function navigateToMarkerPage(page) {
    ensureMapMarkerNavigationScript()
        .then((navigation) => {
            navigation.navigate(page);
        })
        .catch(() => {
            fallbackMarkerNavigation(page);
        });
}

function getVisitedMarkers() {
    if (window.VisitedMarkers &&
        typeof window.VisitedMarkers.saveVisitedPageIfNeeded === 'function' &&
        typeof window.VisitedMarkers.renderVisitedMarkers === 'function') {
        return window.VisitedMarkers;
    }

    return null;
}

function ensureVisitedMarkersScript() {
    const visitedMarkers = getVisitedMarkers();
    if (visitedMarkers) {
        return Promise.resolve(visitedMarkers);
    }

    if (visitedMarkersPromise) {
        return visitedMarkersPromise;
    }

    visitedMarkersPromise = new Promise((resolve, reject) => {
        let scriptElement = document.getElementById(VISITED_MARKERS_SCRIPT_ID);

        const resolveIfReady = () => {
            const loadedVisitedMarkers = getVisitedMarkers();
            if (loadedVisitedMarkers) {
                resolve(loadedVisitedMarkers);
                return;
            }

            scriptElement.remove();
            visitedMarkersPromise = null;
            reject(new Error('Visited markers script did not expose VisitedMarkers.'));
        };

        const rejectLoad = () => {
            scriptElement.remove();
            visitedMarkersPromise = null;
            reject(new Error('Visited markers script failed to load.'));
        };

        if (!scriptElement) {
            scriptElement = document.createElement('script');
            scriptElement.id = VISITED_MARKERS_SCRIPT_ID;
            scriptElement.src = 'visited_markers.js';
            scriptElement.async = true;
            scriptElement.addEventListener('load', resolveIfReady, { once: true });
            scriptElement.addEventListener('error', rejectLoad, { once: true });
            document.head.appendChild(scriptElement);
            return;
        }

        scriptElement.addEventListener('load', resolveIfReady, { once: true });
        scriptElement.addEventListener('error', rejectLoad, { once: true });
    });

    return visitedMarkersPromise;
}

function getQuestOverlay() {
    if (window.QuestOverlay &&
        typeof window.QuestOverlay.open === 'function' &&
        typeof window.QuestOverlay.renderQuestIntro === 'function' &&
        typeof window.QuestOverlay.showQuestConfirmDialog === 'function') {
        return window.QuestOverlay;
    }

    return null;
}

function ensureQuestOverlayScript() {
    const questOverlay = getQuestOverlay();
    if (questOverlay) {
        return Promise.resolve(questOverlay);
    }

    if (questOverlayPromise) {
        return questOverlayPromise;
    }

    questOverlayPromise = new Promise((resolve, reject) => {
        let scriptElement = document.getElementById(QUEST_OVERLAY_SCRIPT_ID);

        const resolveIfReady = () => {
            const loadedQuestOverlay = getQuestOverlay();
            if (loadedQuestOverlay) {
                resolve(loadedQuestOverlay);
                return;
            }

            scriptElement.remove();
            questOverlayPromise = null;
            reject(new Error('Quest overlay script did not expose QuestOverlay.'));
        };

        const rejectLoad = () => {
            scriptElement.remove();
            questOverlayPromise = null;
            reject(new Error('Quest overlay script failed to load.'));
        };

        if (!scriptElement) {
            scriptElement = document.createElement('script');
            scriptElement.id = QUEST_OVERLAY_SCRIPT_ID;
            scriptElement.src = 'quest_overlay.js';
            scriptElement.async = true;
            scriptElement.addEventListener('load', resolveIfReady, { once: true });
            scriptElement.addEventListener('error', rejectLoad, { once: true });
            document.head.appendChild(scriptElement);
            return;
        }

        scriptElement.addEventListener('load', resolveIfReady, { once: true });
        scriptElement.addEventListener('error', rejectLoad, { once: true });
    });

    return questOverlayPromise;
}

function getMapModalTemplate() {
    return `
            <div class="map-and-quest-buttons">
                <button class="quest-button" id="open-quest">
                     <img src="media/quest_i.jpg" alt="Квесты">
                </button>
            </div>
            <a href="" class="map-button" id="open-map-modal">
                <img src="media/maps_i.jpg" alt="Карта">
            </a>
            <div id="map-modal">
                <div>
                    <img id="map-image" src="media/tumski/map.jpg" alt="Карта">
                    <img id="map-marker" src="media/mapmark.png" alt="Маркер">
                    <div class="visited-markers-layer" id="visited-markers-layer"></div>
                    <div id="map-tooltip"></div>
                    <button id="close-map-modal">×</button>
                    <button id="toggle-tooltips" style="display: none;">👁️</button>
                </div>
            </div>
            <!-- Book Overlay HTML (moved from tumski.html) -->
            <div class="book-overlay">
                <button class="close-button">×</button>
                <div class="book-container">/book/
                    <div class="book-image-content-wrapper">
                        <img src="media/book/quest_01.jpg" alt="Квест верх" class="quest-top-image">
                        <div class="book-content-area">
                            <h2 class="book-title"></h2>
                            <ul class="quest-tasks"></ul>

                            <!-- Изображение льва теперь добавляется динамически в book-content-area -->
                        </div>
                        <img src="media/book/quest_02.jpg" alt="Квест низ" class="quest-bottom-image">
                        <!-- Боковые изображения теперь фон book-content-area -->
                    </div>
                    <div class="book-content">
                        <!-- Content will be added dynamically if needed -->
                    </div>
                    <div class="scroll-indicator"></div>
                </div>
            </div>
             <!-- Most Overlay HTML (moved from tumski.html) -->
            <div class="most-overlay">
                <button class="close-button">×</button>
                <div class="most-container">
                    <div class="image-wrapper">
                        <img src="" alt="Тумский мост" class="most-image" data-src="BOOK_IMAGE_02">
                        <img src="" alt="Overlay Image" class="overlay-image" style="display: none;">
                        <img src="" alt="Additional Image" class="additional-image" style="display: none;">
                        <img src="" alt="Book 31" class="book-31-image" style="display: none;">
                        <img src="" alt="Book 32" class="book-32-image" style="display: none;">
                        <div class="most-text-block most-text-block-left">
                            <div class="most-title"></div>
                            <div class="most-description"></div>
                        </div>
                        <div class="most-text-block most-text-block-right">
                            <div class="most-title"></div>
                            <div class="most-description"></div>
                        </div>
                        <div class="book-zones right-zones">
                            <div class="book-zone zone-1" data-zone="1"></div>
                            <div class="book-zone zone-2" data-zone="2"></div>
                            <div class="book-zone zone-3" data-zone="3"></div>
                            <div class="book-zone zone-4" data-zone="4"></div>
                        </div>
                        <div class="book-zones left-zones">
                            <div class="book-zone zone-1" data-zone="1"></div>
                            <div class="book-zone zone-2" data-zone="2"></div>
                            <div class="book-zone zone-3" data-zone="3"></div>
                            <div class="book-zone zone-4" data-zone="4"></div>
                        </div>
                    </div>
                </div>
            </div>
            <audio id="stepSound" src="media/step.wav"></audio>
            <audio id="mapSound" src="media/zwyki/bb6f2b8ec908f28.mp3"></audio>
            <audio id="bookSound" src="media/opening-a-book.wav"></audio>
            <audio id="sceneSound"></audio>
            <div class="quest-confirm-dialog-overlay"></div>
            <div class="quest-confirm-dialog">
                <div class="dialog-text"></div>
                <div class="dialog-buttons">
                    <button class="confirm-yes"></button>
                    <button class="confirm-no"></button>
                </div>
            </div>
        `;
}

function ensureMapModalDom() {
    if (!document.getElementById('map-modal')) {
        document.body.insertAdjacentHTML('afterbegin', getMapModalTemplate());
    }
}

function getMapMessageType(name, fallback) {
    return window.SpaMessages?.TYPES?.[name] || fallback;
}

function getMapMessageTargetOrigin() {
    if (window.SpaMessages && typeof window.SpaMessages.getTargetOrigin === 'function') {
        return window.SpaMessages.getTargetOrigin();
    }

    return window.location.origin && window.location.origin !== 'null' ? window.location.origin : '*';
}

function parseMapMessage(event) {
    if (window.SpaMessages && typeof window.SpaMessages.parseMessage === 'function') {
        return window.SpaMessages.parseMessage(event.data);
    }

    if (event.data && typeof event.data === 'object' && typeof event.data.type === 'string') {
        return event.data;
    }

    return null;
}

function isTrustedParentMapMessage(event) {
    return !window.SpaMessages ||
        (typeof window.SpaMessages.isTrustedParentMessage === 'function' &&
            window.SpaMessages.isTrustedParentMessage(event));
}

function postMapMessageToParent(type, payload = {}) {
    if (!window.parent || window.parent === window) {
        return false;
    }

    if (window.SpaMessages && typeof window.SpaMessages.postToParent === 'function') {
        return window.SpaMessages.postToParent(type, payload);
    }

    window.parent.postMessage({ ...payload, type }, getMapMessageTargetOrigin());
    return true;
}

// Функция для получения координат текущей точки на карте
async function getCurrentMapPoint() {
    const imageContainer = document.querySelector('.image-container');
    const mapPoint = imageContainer ? parseInt(imageContainer.getAttribute('data-map-point')) : 1;
    const { getMapPointCoords } = await import('./map_points.js');
    return getMapPointCoords(mapPoint || 1);
}

async function saveVisitedPageIfNeeded() {
    try {
        const visitedMarkers = await ensureVisitedMarkersScript();
        await visitedMarkers.saveVisitedPageIfNeeded();
    } catch (_) {}
}

// Функционал модального окна карты
const MapModal = {
    init() {
        ensureMapModalStyles();
        ensureMapModalDom();
        ensureMapMarkerNavigationScript().catch(() => {});
        ensureVisitedMarkersScript().catch(() => {});
        ensureQuestOverlayScript().catch(() => {});

        // Зафиксировать посещение текущей страницы
        saveVisitedPageIfNeeded().catch(() => {});

        if (this._initialized) {
            return;
        }

        // Удалены принудительные скрытия most-overlay, чтобы клики по геометкам могли открывать модалку

        // === Автоматическая ширина most-container по ширине most-image ===
        function adjustMostContainerWidth() {
            const mostImage = document.querySelector('.most-image');
            const mostContainer = document.querySelector('.most-container');
            if (mostImage && mostContainer) {
                const isMobile = window.innerWidth <= 768;
                if (isMobile) {
                    // На мобильных устройствах используем всю ширину экрана
                    mostContainer.style.width = '100vw';
                } else {
                    const naturalWidth = mostImage.naturalWidth;
                    // Максимум 90vw, минимум — ширина картинки
                    const maxWidth = Math.min(window.innerWidth * 0.9, naturalWidth);
                    mostContainer.style.width = maxWidth + 'px';
                }
            }
        }

        // === Автоматическая высота book-zone по высоте most-image ===
        function adjustBookZonesHeight() {
            if (window.innerWidth <= 768) {
                const mostImage = document.querySelector('.most-image');
                const bookZones = document.querySelectorAll('.book-zone');
                
                if (mostImage && bookZones.length > 0) {
                    const imageHeight = mostImage.offsetHeight;
                    const zoneHeight = imageHeight / 12;
                    
                    bookZones.forEach(zone => {
                        zone.style.height = zoneHeight + 'px';
                    });
                }
            }
        }
        
        // Делаем функцию глобально доступной
        window.adjustBookZonesHeight = adjustBookZonesHeight;
        // После загрузки изображения
        const mostImage = document.querySelector('.most-image');
        if (mostImage) {
            mostImage.addEventListener('load', () => {
                adjustMostContainerWidth();
                adjustBookZonesHeight();
            });
        }
        // И при изменении размера окна
        window.addEventListener('resize', () => {
            adjustMostContainerWidth();
            adjustBookZonesHeight();
            
            // Пересчитываем размер карты при изменении размера окна
            if (window.innerWidth <= 768) {
                const mapImage = document.getElementById('map-image');
                if (mapImage && mapImage.complete) {
                    MapModal.calculateImageSize(mapImage);
                }
                
                // Перепозиционируем маркер при изменении размера окна
                setTimeout(async () => {
                    try {
                        const coords = await getCurrentMapPoint();
                        if (coords) {
                            MapModal.positionMarker(coords);
                        }
                    } catch (error) {
                        // Ошибка при перепозиционировании маркера
                    }
                }, 200);
                // Обновляем позиции меток посещённых страниц
                setTimeout(() => { MapModal.renderVisitedMarkers(); }, 240);
            }
        });

        // Получаем ссылки на элементы после их добавления в DOM
        const openMapBtn = document.getElementById('open-map-modal');
        const openQuestBtn = document.getElementById('open-quest');
        const mapModal = document.getElementById('map-modal');
        const closeMapBtn = document.getElementById('close-map-modal');
        const toggleTooltipsBtn = document.getElementById('toggle-tooltips');
        const mapImage = document.getElementById('map-image');
        const mapMarker = document.getElementById('map-marker');
        const mapTooltip = document.getElementById('map-tooltip');

        // Проверяем, что все элементы найдены
        if (!openMapBtn || !openQuestBtn || !mapModal || !closeMapBtn || !toggleTooltipsBtn || !mapImage || !mapMarker || !mapTooltip) {
            return; // Прекращаем выполнение, если элементы не найдены
        }

        this._initialized = true;

        // Функция для открытия полноэкранной модалки карты
        const openFullscreenMap = async function() {
            mapModal.style.display = 'flex';
            
            // Отключаем language-menu при открытии модалки карты
            if (window.LanguageMenu && typeof window.LanguageMenu.disableMenu === 'function') {
                window.LanguageMenu.disableMenu();
            }
            
            // Проверяем глобальный mute
            const soundMenuBtn = document.querySelector('.sound-menu-button');
            const isMuted = soundMenuBtn && soundMenuBtn.classList.contains('muted');
            // Воспроизводим звук карты только если не muted
            if (!isMuted && window.playMapSound) {
                window.playMapSound();
            }
            // Воспроизводим звук открытия книги только если звук включен
            const bookSound = document.getElementById('bookSound');
            if (bookSound && window.isSoundEnabled && window.isSoundEnabled()) {
                bookSound.currentTime = 0;
                bookSound.play().catch(/* console.log */);
            }
            
            // Получаем номер точки из data-атрибута
            const imageContainer = document.querySelector('.image-container');
            const mapPoint = imageContainer ? parseInt(imageContainer.getAttribute('data-map-point')) : 1;
            
            const { getMapPointCoords, checkTooltipArea } = await import('./map_points.js');
            const coords = getMapPointCoords(mapPoint || 1); // Используем точку 1 как fallback
            
            // После загрузки изображения корректно позиционируем маркер
            mapImage.onload = function() {
                MapModal.positionMarker(coords);
                MapModal.renderVisitedMarkers();
            };
            
            // Если картинка уже загружена
            if (mapImage.complete) {
                MapModal.positionMarker(coords);
                MapModal.renderVisitedMarkers();
            }

            // Добавляем поддержку свайпов для мобильных устройств
            if (window.innerWidth <= 768) {
                MapModal.setupMobileSwipe();
                MapModal.adjustMapImageSize();
                
                // Убеждаемся, что маркер отображается на мобильных устройствах
                setTimeout(async () => {
                    try {
                        const coords = await getCurrentMapPoint();
                        if (coords) {
                            MapModal.positionMarker(coords);
                        }
                    } catch (error) {
                        // Ошибка при позиционировании маркера
                    }
                }, 300);
            }

            // === Обработчик движения мыши для подсказки (только для десктопа) ===
            if (window.innerWidth > 768) {
            // Сначала удалим старые обработчики, если они были
            mapImage.onmousemove = null;
            mapImage.onmouseleave = null;

            // Глобальная функция для обновления текста подсказки
            function camelToSnake(str) {
                return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
            }
            window.updateMapTooltipText = function(tooltipKey) {
                if (mapTooltip && mapTooltip.style.display === 'block') {
                    let key = camelToSnake(tooltipKey);
                    // Проверяем наличие i18n объекта перед использованием
                    let tooltipText = window.i18n ? window.i18n.t('map.' + key) : tooltipKey;
                    mapTooltip.textContent = tooltipText;
                }
            };

            mapImage.onmousemove = function(e) {
                const rect = mapImage.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                const tooltipKey = checkTooltipArea(x, y);
                if (tooltipKey) {
                    mapTooltip.style.display = 'block';
                    mapTooltip.style.left = `${e.clientX - rect.left + 20}px`;
                    mapTooltip.style.top = `${e.clientY - rect.top + 20}px`;
                    window.updateMapTooltipText(tooltipKey);
                } else {
                    mapTooltip.style.display = 'none';
                }
            };
            mapImage.onmouseleave = function() {
                mapTooltip.style.display = 'none';
            };
            } else {
                // Для мобильных устройств показываем кнопку переключения подсказок
                const toggleButton = document.getElementById('toggle-tooltips');
                if (toggleButton) {
                    toggleButton.style.display = 'flex';
                }
                // Подсказки не показываем по умолчанию - только по нажатию на кнопку
            }

            // === Для планшетов (hover: none, но экран шире мобильного) ===
            if (window.matchMedia('(hover: none) and (pointer: coarse) and (min-width: 768px)').matches) {
                // Показываем кнопку переключения подсказок
                const toggleButton = document.getElementById('toggle-tooltips');
                if (toggleButton) {
                    toggleButton.style.display = 'flex';
                }
                // Подсказки не показываем по умолчанию - только по нажатию на кнопку
            }

            // Добавляем обработчик изменения языка для обновления текста подсказки
            document.addEventListener('languageChanged', function() {
                // Проверяем, открыто ли модальное окно и видна ли подсказка
                if (mapModal.style.display === 'flex' && mapTooltip.style.display === 'block') {
                     // Пытаемся обновить текст текущей подсказки, если возможно
                     // Это требует сохранения ключа подсказки, что сейчас не делается.
                     // Для простой реализации, можно просто скрыть/показать подсказку.
                     mapTooltip.style.display = 'none'; // Скрываем при смене языка
                     // В более сложной реализации здесь нужно было бы заново определить
                     // под какой областью курсор и показать подсказку с новым текстом.
                }
                
                // Обновляем мобильные подсказки при смене языка только если они уже показаны
                if (window.innerWidth <= 768) {
                    const tooltips = document.querySelectorAll('.mobile-tooltip');
                    const isVisible = tooltips.length > 0 && tooltips[0].style.display !== 'none';
                    if (isVisible) {
                        MapModal.showAllTooltips();
                    }
                }
                
                // Обновляем подсказки на планшетах при смене языка только если они уже показаны
                if (window.matchMedia('(hover: none) and (pointer: coarse) and (min-width: 768px)').matches) {
                    const tooltips = document.querySelectorAll('.mobile-tooltip');
                    const isVisible = tooltips.length > 0 && tooltips[0].style.display !== 'none';
                    if (isVisible) {
                        MapModal.showAllTooltips();
                    }
                }
            });
        };
        
        // Делаем функцию доступной глобально для кнопки "развернуть" на мини-карте
        window.openFullscreenMap = openFullscreenMap;
        
        // Обработчик сообщений от родительского окна для открытия полноэкранной карты
        window.addEventListener('message', (event) => {
            const message = parseMapMessage(event);
            if (
                message &&
                message.type === getMapMessageType('OPEN_FULLSCREEN_MAP', 'OPEN_FULLSCREEN_MAP') &&
                isTrustedParentMapMessage(event)
            ) {
                openFullscreenMap();
            }
        });
        
        // Обработчик для кнопки карты - открывает мини-карту
        // Проверяем, находимся ли мы в iframe или в главном окне
        if (window.parent !== window) {
            // Мы в iframe - отправляем сообщение в родительское окно
            openMapBtn.addEventListener('click', async function(e) {
                e.preventDefault();
                postMapMessageToParent(getMapMessageType('OPEN_MINI_MAP', 'OPEN_MINI_MAP'), {
                    source: 'iframe'
                });
            });
        } else {
            // Мы в главном окне - обрабатываем напрямую
            openMapBtn.addEventListener('click', async function(e) {
                e.preventDefault();
                if (window.miniMapManager) {
                    window.miniMapManager.expand();
                }
            });
        }

        openQuestBtn.addEventListener('click', function() {
            ensureQuestOverlayScript()
                .then((questOverlay) => {
                    questOverlay.open({ triggerButton: openQuestBtn });
                })
                .catch(() => {});
        });

        closeMapBtn.addEventListener('click', function() {
            mapModal.style.display = 'none';
            
            // Включаем language-menu при закрытии модалки карты
            if (window.LanguageMenu && typeof window.LanguageMenu.enableMenu === 'function') {
                window.LanguageMenu.enableMenu();
            }
            
            // Останавливаем звук карты
            const mapSound = document.getElementById('mapSound');
            if (mapSound) mapSound.pause();
            if (mapSound) mapSound.currentTime = 0;
            
            // Удаляем обработчики свайпа
            const mapContainer = document.querySelector('#map-modal > div');
            if (mapContainer && mapContainer._removeSwipeListeners) {
                mapContainer._removeSwipeListeners();
            }
        });

        // Обработчик для кнопки переключения подсказок
        toggleTooltipsBtn.addEventListener('click', async function() {
            const tooltips = document.querySelectorAll('.mobile-tooltip');
            const isVisible = tooltips.length > 0 && tooltips[0].style.display !== 'none';
            
            if (isVisible) {
                // Скрываем подсказки
                tooltips.forEach(tooltip => {
                    tooltip.style.display = 'none';
                });
                toggleTooltipsBtn.textContent = '👁️‍🗨️';
            } else {
                // Если подсказок еще нет, создаем их
                if (tooltips.length === 0) {
                    await MapModal.showAllTooltips();
                    // После создания перечитываем список подсказок
                    const newTooltips = document.querySelectorAll('.mobile-tooltip');
                    if (newTooltips.length > 0) {
                        // Подсказки созданы и видны (display по умолчанию 'block')
                        toggleTooltipsBtn.textContent = '👁️';
                    }
                } else {
                    // Показываем существующие подсказки
                    tooltips.forEach(tooltip => {
                        tooltip.style.display = 'block';
                    });
                    toggleTooltipsBtn.textContent = '👁️';
                }
            }
        });

        // Закрытие по клику вне карты
        mapModal.addEventListener('click', function(e) {
            if (e.target === mapModal) {
                mapModal.style.display = 'none';
                
                // Включаем language-menu при закрытии модалки карты
                if (window.LanguageMenu && typeof window.LanguageMenu.enableMenu === 'function') {
                    window.LanguageMenu.enableMenu();
                }
                
                // Останавливаем звук карты
                const mapSound = document.getElementById('mapSound');
                if (mapSound) mapSound.pause();
                if (mapSound) mapSound.currentTime = 0;
                
                // Удаляем обработчики свайпа
                const mapContainer = document.querySelector('#map-modal > div');
                if (mapContainer && mapContainer._removeSwipeListeners) {
                    mapContainer._removeSwipeListeners();
                }
            }
        });

        // Обработчики для quest модального окна теперь в SPA интеграции
        // (index.html setupQuestModalHandlers)
    },

    positionMarker(coords) {
        const mapMarker = document.getElementById('map-marker');
        const mapImage = document.getElementById('map-image');
        // Проверяем, что элементы существуют
        if (!mapMarker || !mapImage) {
            return;
        }
        
        // Показываем маркер
        mapMarker.style.display = 'block';
        
        if (window.innerWidth <= 768) {
            // Для мобильных устройств
            const imageWidth = mapImage.offsetWidth;
            const imageHeight = mapImage.offsetHeight;
            
            // Преобразуем проценты в пиксели
            const markerX = (coords.x / 100) * imageWidth;
            const markerY = (coords.y / 100) * imageHeight;
            
            mapMarker.style.position = 'absolute';
            mapMarker.style.left = `${markerX}px`;
            mapMarker.style.top = `${markerY}px`;
            mapMarker.style.transform = 'translate(-50%, -50%)';
            mapMarker.style.zIndex = '1002';
            mapMarker.style.pointerEvents = 'none';
            
            // Убеждаемся, что маркер виден в области просмотра
            const container = document.querySelector('#map-modal > div');
            if (container) {
                const scrollLeft = Math.max(0, markerX - (window.innerWidth / 2));
                container.scrollLeft = scrollLeft;
            }
        } else {
            // Для десктопа оставляем процентное позиционирование
            mapMarker.style.left = `${coords.x}%`;
            mapMarker.style.top = `${coords.y}%`;
            mapMarker.style.transform = 'translate(-50%, -50%)';
        }
    },

    async renderVisitedMarkers() {
        try {
            const visitedMarkers = await ensureVisitedMarkersScript();
            return await visitedMarkers.renderVisitedMarkers({
                attachMarkerHandlers: (marker, page, isSmallScreen) => {
                    this.attachMarkerHandlers(marker, page, isSmallScreen);
                }
            });
        } catch (_) {}
    },

    /**
     * Назначает обработчики для маркера:
     * - на мобильных/планшетах первый клик показывает/скрывает превью,
     *   клик по самому превью ведёт на страницу
     * - на десктопе клик по маркеру сразу ведёт на страницу
     */
    attachMarkerHandlers(marker, page, isSmallScreen) {
        const previewSrc = this.getPreviewImageForPage(page);

        // Создаём превью, если есть источник
        let previewEl = null;
        if (previewSrc) {
            previewEl = document.createElement('div');
            previewEl.className = 'map-preview-image';
            previewEl.style.backgroundImage = `url('${previewSrc}')`;
            marker.appendChild(previewEl);

            previewEl.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleMarkerClick(page);
            });
        }

        marker._previewEl = previewEl;
        marker._previewVisible = false;

        marker.addEventListener('click', (e) => {
            e.stopPropagation();

            // На маленьких экранах сначала показываем/скрываем превью
            if (isSmallScreen && previewEl) {
                if (marker._previewVisible) {
                    previewEl.style.display = 'none';
                    marker._previewVisible = false;
                } else {
                    // Прячем предыдущее открытое превью
                    if (this._openPreviewMarker && this._openPreviewMarker._previewEl) {
                        this._openPreviewMarker._previewEl.style.display = 'none';
                        this._openPreviewMarker._previewVisible = false;
                    }
                    previewEl.style.display = 'block';
                    marker._previewVisible = true;
                    this._openPreviewMarker = marker;
                }
                return;
            }

            // Десктоп или нет превью — сразу навигация
            this.handleMarkerClick(page);
        });
    },

    /**
     * Возвращает путь к превью‑картинке для страницы.
     * По соглашению: берём файл из подпапки thumbs относительно оригинальной картинки.
     * Пока настроено только для tumski07.html → tumski_08.jpg.
     */
    getPreviewImageForPage(page) {
        const baseImages = {
            'tumski07.html': 'media/tumski/tumski_08.jpg',
        };

        const original = baseImages[page];
        if (!original) return null;

        // media/tumski/tumski_08.jpg -> media/tumski/thumbs/tumski_08.jpg
        const parts = original.split('/');
        if (parts.length < 3) return original;
        const folder = parts[0]; // media
        const sub = parts[1];    // tumski
        const file = parts.slice(2).join('/');
        return `${folder}/${sub}/thumbs/${file}`;
    },

    handleMarkerClick(page) {
        const pages = (Array.isArray(page) ? page : [page]).filter(Boolean);
        const firstPage = pages[0];

        if (!firstPage) {
            return;
        }

        // Закрываем модалку карты и выполняем стандартную очистку
        try {
            const mapModalEl = document.getElementById('map-modal');
            if (mapModalEl) mapModalEl.style.display = 'none';
            if (window.LanguageMenu && typeof window.LanguageMenu.enableMenu === 'function') {
                window.LanguageMenu.enableMenu();
            }
            const mapContainer = document.querySelector('#map-modal > div');
            if (mapContainer && mapContainer._removeSwipeListeners) {
                mapContainer._removeSwipeListeners();
            }
            const mapSound = document.getElementById('mapSound');
            if (mapSound) { mapSound.pause(); mapSound.currentTime = 0; }
        } catch (_) {}

        navigateToMarkerPage(pages);
    },

    setupMobileSwipe() {
        const mapContainer = document.querySelector('#map-modal > div');
        const mapImage = document.getElementById('map-image');
        
        if (!mapContainer || !mapImage) return;
        
        let startX = 0;
        let startY = 0;
        let currentScrollLeft = 0;
        let isDragging = false;
        let lastTouchTime = 0;
        
        // Обработчик начала касания
        const handleTouchStart = (e) => {
            const touch = e.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;
            currentScrollLeft = mapContainer.scrollLeft;
            isDragging = true;
            lastTouchTime = Date.now();
            
            // Останавливаем любые анимации прокрутки
            mapContainer.style.scrollBehavior = 'auto';
        };
        
        // Обработчик движения пальца
        const handleTouchMove = (e) => {
            if (!isDragging) return;
            
            const touch = e.touches[0];
            const deltaX = startX - touch.clientX;
            const deltaY = startY - touch.clientY;
            
            // Если движение больше по горизонтали, чем по вертикали, то это свайп
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                const newScrollLeft = currentScrollLeft + deltaX;
                mapContainer.scrollLeft = newScrollLeft;
                e.preventDefault();
            }
        };
        
        // Обработчик окончания касания
        const handleTouchEnd = (e) => {
            if (!isDragging) return;
            
            isDragging = false;
            const touchEndTime = Date.now();
            const touchDuration = touchEndTime - lastTouchTime;
            
            // Восстанавливаем плавную прокрутку
            mapContainer.style.scrollBehavior = 'smooth';
            
            // Если касание было коротким, это может быть быстрый свайп
            if (touchDuration < 300) {
                const touch = e.changedTouches[0];
                const deltaX = startX - touch.clientX;
                
                // Если свайп был достаточно быстрым и длинным, добавляем инерцию
                if (Math.abs(deltaX) > 50) {
                    const velocity = deltaX / touchDuration;
                    const momentum = velocity * 100;
                    const targetScroll = mapContainer.scrollLeft + momentum;
                    
                    // Плавно прокручиваем к целевой позиции
                    mapContainer.scrollTo({
                        left: targetScroll,
                        behavior: 'smooth'
                    });
                }
            }
        };
        
        // Добавляем обработчики событий
        mapContainer.addEventListener('touchstart', handleTouchStart, { passive: false });
        mapContainer.addEventListener('touchmove', handleTouchMove, { passive: false });
        mapContainer.addEventListener('touchend', handleTouchEnd);
        
        // Удаляем обработчики при закрытии модального окна
        const removeListeners = () => {
            mapContainer.removeEventListener('touchstart', handleTouchStart);
            mapContainer.removeEventListener('touchmove', handleTouchMove);
            mapContainer.removeEventListener('touchend', handleTouchEnd);
        };
        
        // Сохраняем функцию удаления для использования при закрытии
        mapContainer._removeSwipeListeners = removeListeners;
    },

    adjustMapImageSize() {
        const mapImage = document.getElementById('map-image');
        if (!mapImage) return;
        
        // Ждем загрузки изображения
        if (mapImage.complete) {
            this.calculateImageSize(mapImage);
        } else {
            mapImage.onload = () => {
                this.calculateImageSize(mapImage);
            };
        }
    },

    calculateImageSize(mapImage) {
        const screenHeight = window.innerHeight;
        const screenWidth = window.innerWidth;
        const imageAspectRatio = mapImage.naturalWidth / mapImage.naturalHeight;
        
        // Рассчитываем высоту изображения, чтобы оно поместилось по высоте экрана
        const targetHeight = screenHeight;
        const targetWidth = targetHeight * imageAspectRatio;
        
        // Устанавливаем размеры
        mapImage.style.height = targetHeight + 'px';
        mapImage.style.width = targetWidth + 'px';
        mapImage.style.maxWidth = 'none';
        mapImage.style.maxHeight = 'none';
        mapImage.style.objectFit = 'none';
        mapImage.style.objectPosition = 'left center';
        
        // Перепозиционируем маркер после изменения размера изображения
        setTimeout(async () => {
            try {
                const { getMapPointCoords } = await import('./map_points.js');
                const coords = getMapPointCoords(1);
                if (coords) {
                    this.positionMarker(coords);
                }
            } catch (error) {
                // Ошибка при перепозиционировании маркера
            }
        }, 100);
    },

    async showAllTooltips() {
        try {
            const { tooltipPoints } = await import('./map_points.js');
            const mapImage = document.getElementById('map-image');
            const mapContainer = document.querySelector('#map-modal > div');
            
            if (!mapImage || !mapContainer || !tooltipPoints) {
                return;
            }
            
            // Очищаем старые подсказки
            const oldTooltips = mapContainer.querySelectorAll('.mobile-tooltip');
            oldTooltips.forEach(tooltip => tooltip.remove());
            
            // Создаем подсказки для всех точек
            const createdTooltips = [];
            
            // Определяем, является ли устройство планшетом
            const isTablet = window.matchMedia('(hover: none) and (pointer: coarse) and (min-width: 768px)').matches;
            
            Object.entries(tooltipPoints).forEach(([key, coords]) => {
                const tooltip = document.createElement('div');
                tooltip.className = 'mobile-tooltip';
                tooltip.style.position = 'absolute';
                
                // Получаем координаты для текущего типа устройства
                const isMobile = window.innerWidth <= 768;
                let deviceCoords;
                if (isMobile) {
                    deviceCoords = coords.mobile || coords.desktop;
                } else if (isTablet) {
                    deviceCoords = coords.tablet || coords.desktop;
                } else {
                    deviceCoords = coords.desktop;
                }
                
                // Пересчитываем координаты относительно реального размера карты
                const xPercent = deviceCoords.x / 100;
                const yPercent = deviceCoords.y / 100;
                
                // Сохраняем оригинальные координаты в data-атрибутах
                tooltip.dataset.xPercent = xPercent;
                tooltip.dataset.yPercent = yPercent;
                
                let xPos, yPos;
                
                if (isTablet) {
                    // Для планшетов используем размеры изображения и его offset в контейнере
                    const imageWidth = mapImage.offsetWidth;
                    const imageHeight = mapImage.offsetHeight;
                    
                    // Получаем позицию изображения относительно контейнера через offset
                    const imageOffsetX = mapImage.offsetLeft;
                    const imageOffsetY = mapImage.offsetTop;
                    
                    // Рассчитываем позицию подсказки относительно изображения
                    const imageX = imageWidth * xPercent;
                    const imageY = imageHeight * yPercent;
                    
                    // Добавляем смещение изображения в контейнере
                    xPos = imageOffsetX + imageX + 30; // Сдвигаем вправо на 10px
                    yPos = imageOffsetY + imageY - 40; // Сдвигаем вверх на 10px
                } else {
                    // Для мобильных устройств используем размеры изображения
                    xPos = mapImage.offsetWidth * xPercent;
                    yPos = mapImage.offsetHeight * yPercent; // Убираем фиксированное смещение
                }
                
                tooltip.style.left = `${xPos}px`;
                tooltip.style.top = `${yPos}px`;
                tooltip.style.transform = 'translate(-50%, -50%)';
                tooltip.style.background = 'rgba(0,0,0,0.8)';
                tooltip.style.color = 'white';
                tooltip.style.padding = '8px 12px';
                tooltip.style.borderRadius = '4px';
                tooltip.style.fontSize = '12px';
                tooltip.style.pointerEvents = 'none';
                tooltip.style.zIndex = '1003';
                tooltip.style.minWidth = '120px';
                tooltip.style.maxWidth = '200px';
                tooltip.style.textAlign = 'center';
                tooltip.style.whiteSpace = 'normal';
                tooltip.style.wordWrap = 'break-word';
                tooltip.style.lineHeight = '1.2';
                
                // Получаем текст подсказки
                const camelToSnake = (str) => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
                const keySnake = camelToSnake(key);
                const tooltipText = window.i18n ? window.i18n.t('map.' + keySnake) : key;
                tooltip.textContent = tooltipText;
                
                mapContainer.appendChild(tooltip);
                createdTooltips.push(tooltip);
            });
            
            // Проверяем и исправляем перекрытия
            this.fixTooltipOverlaps(createdTooltips);
            
            // Добавляем обработчик для обновления позиций при прокрутке
            mapContainer.addEventListener('scroll', () => {
                this.updateTooltipPositions();
            });
            
            // Добавляем обработчик для обновления позиций при изменении размера окна
            window.addEventListener('resize', () => {
                setTimeout(() => {
                    this.updateTooltipPositions();
                }, 100);
            });
            
        } catch (error) {
            // Ошибка при показе подсказок
        }
    },

    updateTooltipPositions() {
        const mapImage = document.getElementById('map-image');
        const mapContainer = document.querySelector('#map-modal > div');
        const tooltips = mapContainer.querySelectorAll('.mobile-tooltip');
        
        if (!mapImage || !mapContainer || tooltips.length === 0) return;
        
        // Определяем, является ли устройство планшетом
        const isTablet = window.matchMedia('(hover: none) and (pointer: coarse) and (min-width: 768px)').matches;
        
        tooltips.forEach(tooltip => {
            // Получаем оригинальные координаты из data-атрибутов
            const xPercent = parseFloat(tooltip.dataset.xPercent);
            const yPercent = parseFloat(tooltip.dataset.yPercent);
            
            if (isNaN(xPercent) || isNaN(yPercent)) return;
            
            let xPos, yPos;
            
            if (isTablet) {
                // Для планшетов используем размеры изображения и его offset в контейнере
                const imageWidth = mapImage.offsetWidth;
                const imageHeight = mapImage.offsetHeight;
                
                // Получаем позицию изображения относительно контейнера через offset
                const imageOffsetX = mapImage.offsetLeft;
                const imageOffsetY = mapImage.offsetTop;
                
                // Рассчитываем позицию подсказки относительно изображения
                const imageX = imageWidth * xPercent;
                const imageY = imageHeight * yPercent;
                
                // Добавляем смещение изображения в контейнере
                xPos = imageOffsetX + imageX + 10; // Сдвигаем вправо на 10px
                yPos = imageOffsetY + imageY - 10; // Сдвигаем вверх на 10px
            } else {
                // Для мобильных устройств используем размеры изображения
                xPos = mapImage.offsetWidth * xPercent;
                yPos = mapImage.offsetHeight * yPercent; // Убираем фиксированное смещение
            }
            
            tooltip.style.left = `${xPos}px`;
            tooltip.style.top = `${yPos}px`;
        });
        
        // Проверяем и исправляем перекрытия после обновления позиций
        this.fixTooltipOverlaps(Array.from(tooltips));
    },

    fixTooltipOverlaps(tooltips) {
        if (tooltips.length < 2) return;
        
        // Функция для получения размеров и позиции подсказки
        const getTooltipBounds = (tooltip) => {
            const rect = tooltip.getBoundingClientRect();
            const containerRect = tooltip.parentElement.getBoundingClientRect();
            
            return {
                left: rect.left - containerRect.left,
                top: rect.top - containerRect.top,
                right: rect.right - containerRect.left,
                bottom: rect.bottom - containerRect.top,
                width: rect.width,
                height: rect.height
            };
        };
        
        // Функция для проверки пересечения двух прямоугольников
        const isOverlapping = (rect1, rect2) => {
            return !(rect1.right < rect2.left || 
                    rect1.left > rect2.right || 
                    rect1.bottom < rect2.top || 
                    rect1.top > rect2.bottom);
        };
        
        // Проверяем каждую пару подсказок на перекрытие
        for (let i = 0; i < tooltips.length; i++) {
            for (let j = i + 1; j < tooltips.length; j++) {
                const tooltip1 = tooltips[i];
                const tooltip2 = tooltips[j];
                
                const bounds1 = getTooltipBounds(tooltip1);
                const bounds2 = getTooltipBounds(tooltip2);
                
                if (isOverlapping(bounds1, bounds2)) {
                    // Если есть перекрытие, сдвигаем вторую подсказку вниз
                    const currentTop = parseFloat(tooltip2.style.top);
                    const newTop = currentTop + bounds1.height + 10; // 10px отступ
                    
                    tooltip2.style.top = `${newTop}px`;
                    
                    // Обновляем границы для второй подсказки
                    bounds2.top = newTop;
                    bounds2.bottom = newTop + bounds2.height;
                }
            }
        }
    }
};

// Экспортируем функции для использования в других модулях
window.MapModal = MapModal;

ensureMobileTooltipStyles();

function renderQuestIntro(bookContentArea, questTasksList) {
    const questOverlay = getQuestOverlay();
    if (questOverlay && typeof questOverlay.renderQuestIntro === 'function') {
        return questOverlay.renderQuestIntro(bookContentArea, questTasksList);
    }

    return undefined;
}

// === Очистка инлайновых стилей у .most-title и .most-description при открытии модального окна ===
function clearMostModalInlineStyles() {
    document.querySelectorAll('.most-title, .most-description').forEach(el => {
        el.removeAttribute('style');
    });
}

// Функция для показа кастомного диалога подтверждения
async function showQuestConfirmDialog(message) {
    const questOverlay = await ensureQuestOverlayScript();
    return questOverlay.showQuestConfirmDialog(message);
}

// Делаем функцию глобально доступной
window.showQuestConfirmDialog = showQuestConfirmDialog;

// Экспортируем объект MapModal
window.MapModal = MapModal; 
