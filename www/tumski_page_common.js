// Общий модуль инициализации страниц Tumski (03,04,05,06,17,18 и главная)
// Выполняет загрузку переводов, инициализацию общих модулей,
// навешивает обработчики на стрелки, квест-метки и настраивает позиционирование

import './spa_message_contract.js';
import { MapDebug } from './map_debug.js';

const SPA_MESSAGE_TYPES = window.SpaMessages?.TYPES || {};

function pageMessageType(name, fallback) {
    return SPA_MESSAGE_TYPES[name] || fallback;
}

function parseTrustedParentMessage(event) {
    if (!window.SpaMessages) {
        return event.data && typeof event.data === 'object' ? event.data : null;
    }

    if (!window.SpaMessages.isTrustedParentMessage(event)) {
        return null;
    }

    return window.SpaMessages.parseMessage(event.data);
}

function isPortraitMobileViewport() {
    return window.innerWidth <= 700 && window.innerHeight > window.innerWidth;
}

function centerScrollableElement(element) {
    if (!element) {
        return;
    }

    const maxScrollLeft = element.scrollWidth - element.clientWidth;
    if (maxScrollLeft <= 0) {
        return;
    }

    element.scrollLeft = Math.round(maxScrollLeft / 2);
}

function centerMobileSceneScroll() {
    if (!isPortraitMobileViewport()) {
        return;
    }

    document.querySelectorAll('.image-scroll-wrapper, .parallax-container').forEach(centerScrollableElement);
}

function scheduleMobileSceneScrollCentering() {
    centerMobileSceneScroll();
    window.setTimeout(centerMobileSceneScroll, 50);
    window.setTimeout(centerMobileSceneScroll, 250);
}

function setupMobileSceneScrollCentering() {
    scheduleMobileSceneScrollCentering();

    if (window.__mobileSceneScrollCenteringResizeHooked) {
        return;
    }

    window.__mobileSceneScrollCenteringResizeHooked = true;
    let resizeTimer = null;
    window.addEventListener('resize', () => {
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(scheduleMobileSceneScrollCentering, 100);
    });
}

/**
 * Проверяет, включен ли звук
 * @returns {boolean} true если звук включен, false если выключен
 */
function isSoundEnabled() {
    // Сначала проверяем состояние кнопки звука (приоритет)
    const soundButton = document.querySelector('.sound-menu-button');
    if (soundButton) {
        return !soundButton.classList.contains('muted');
    }
    
    // Если кнопка не найдена, проверяем localStorage
    const soundMuted = localStorage.getItem('soundMuted');
    // По умолчанию звук включен (если значение не установлено или 'false')
    return soundMuted !== 'true';
}

export async function initPageCommon() {
    // console.log('🎵 initPageCommon вызван для страницы:', window.location.pathname);
    try {
        // 1) I18n
        if (window.i18n && typeof window.i18n.loadTranslations === 'function') {
            try {
                await window.i18n.loadTranslations();
                if (typeof window.i18n.updatePageContent === 'function') {
                    window.i18n.updatePageContent();
                }
            } catch (_) {}
        }

        // Добавляем обработчик сообщений для смены языка из SPA
        window.addEventListener('message', (event) => {
            const message = parseTrustedParentMessage(event);
            if (!message) {
                return;
            }

            if (message.type === pageMessageType('LANGUAGE_CHANGE', 'LANGUAGE_CHANGE')) {
                // console.log('🌐 Получено сообщение о смене языка:', event.data.lang);
                if (window.i18n && typeof window.i18n.changeLang === 'function') {
                    window.i18n.changeLang(message.lang);
                }
            }
            
            // Обработка hash, переданного из SPA
            if (message.type === pageMessageType('PAGE_HASH', 'PAGE_HASH') && message.hash) {
                const hash = message.hash;
                MapDebug.log('[tumski_page_common] Получен PAGE_HASH от SPA:', hash);
                // Сохраняем hash для последующей обработки после инициализации гномов
                window.__pendingGnomeHash = hash;
                
                // Если гномы уже инициализированы, обрабатываем hash сразу
                setTimeout(async () => {
                    try {
                        const gnomeMarks = Array.from(document.querySelectorAll('.map-mark[data-gnome-id]'));
                        if (gnomeMarks.length > 0) {
                                MapDebug.log('[tumski_page_common] Гномы уже инициализированы, обрабатываем hash сразу');
                            const gnomeMod = await import('./gnome_marker_handler.js');
                            if (hash === 'patsa_vatsa' && gnomeMod && typeof gnomeMod.openGnomePopupDirectly === 'function') {
                                MapDebug.log('[tumski_page_common] Открываем попап Паца-Ваца через postMessage');
                                gnomeMod.openGnomePopupDirectly({
                                    gnomeId: 'patsa_vatsa',
                                    imageSrc: 'media/krasnolud/krasnal_tumski14.jpg'
                                });
                            }
                        }
                    } catch (err) {
                        MapDebug.error('[tumski_page_common] Ошибка при обработке hash через postMessage:', err);
                    }
                }, 500);
            }
            
            // Обработка сообщения о показе страницы - повторная инициализация стрелок
            if (message.type === pageMessageType('PAGE_SHOWN', 'PAGE_SHOWN')) {
                MapDebug.log('[tumski_page_common] Получен PAGE_SHOWN, повторная инициализация стрелок для:', message.pageName);
                // Повторно инициализируем стрелки через небольшую задержку
                setTimeout(() => {
                    try {
                        // Проверяем, что мы на правильной странице
                        const currentPage = window.location.pathname.split('/').pop() || '';
                        const expectedPage = message.pageName || '';
                        MapDebug.log('[tumski_page_common] Текущая страница:', currentPage, 'Ожидаемая:', expectedPage);
                        
                        // Получаем stepSound если он есть
                        let stepSound = null;
                        try {
                            const stepSoundEl = document.getElementById('stepSound');
                            if (stepSoundEl) {
                                stepSound = stepSoundEl;
                            }
                        } catch (_) {}
                        
                        // Проверяем наличие стрелок на странице
                        const arrows = document.querySelectorAll('[data-next-page], [data-prev-page]');
                        MapDebug.log('[tumski_page_common] Найдено стрелок на странице:', arrows.length);
                        
                        // Проверяем наличие гномов на странице
                        const gnomes = document.querySelectorAll('.map-mark[data-gnome-id]');
                        MapDebug.log('[tumski_page_common] Найдено гномов на странице:', gnomes.length);
                        gnomes.forEach(gnome => {
                            const gnomeId = gnome.getAttribute('data-gnome-id');
                            MapDebug.log('[tumski_page_common] Гном на странице:', gnomeId, 'ID:', gnome.id);
                        });
                        
                        // Настраиваем стрелки заново (функция уже доступна в этом модуле)
                        setupAllArrows(stepSound);
                        MapDebug.log('[tumski_page_common] Стрелки повторно инициализированы');
                    } catch (err) {
                        MapDebug.error('[tumski_page_common] Ошибка при повторной инициализации стрелок:', err);
                    }
                }, 200);
            }
        });


        // Функция для отправки сообщения о смене языка в основное окно SPA
        window.sendLanguageChangeToSPA = function(lang) {
            // console.log('🌐 Отправляем сообщение о смене языка в SPA:', lang);
            if (window.parent && window.parent !== window) {
                window.SpaMessages.postToParent(pageMessageType('LANGUAGE_CHANGE_FROM_IFRAME', 'LANGUAGE_CHANGE_FROM_IFRAME'), {
                    lang: lang
                });
            }
        };


        // 2) Сохраним координаты текущей точки карты (если указана)
        try {
            const imageContainer = document.querySelector('.image-container');
            if (imageContainer && imageContainer.hasAttribute('data-map-point')) {
                const mapPoint = parseInt(imageContainer.getAttribute('data-map-point')) || 1;
                const { getMapPointCoords } = await import('./map_points.js');
                const coords = getMapPointCoords(mapPoint);
                if (coords) {
                    imageContainer.setAttribute('data-map-x', String(coords.x));
                    imageContainer.setAttribute('data-map-y', String(coords.y));
                }
            }
        } catch (_) {}

        // 3) Общие UI-модули
        // Инициализируем языковое меню для всех устройств
        try { 
            if (window.LanguageMenu && typeof window.LanguageMenu.init === 'function') {
                window.LanguageMenu.init();
            }
        } catch (_) {}
        try { if (window.MapModal && typeof window.MapModal.init === 'function') window.MapModal.init(); } catch (_) {}
        try { if (typeof window.applyCommonButtonStyles === 'function') window.applyCommonButtonStyles(); } catch (_) {}
        // Фоновая музыка управляется через SPA
        try { if (window.BookPaths && typeof window.BookPaths.initBookHandlers === 'function') window.BookPaths.initBookHandlers(); } catch (_) {}

        // 4) Возврат из зума (если есть)
        try {
            if (typeof window.setupResetAnimation === 'function') {
                const container = document.querySelector('.image-container');
                if (container) window.setupResetAnimation(container);
            }
        } catch (_) {}

        // 5) Создаём звук шага (если доступно)
        let stepSound;
        try {
            const cathedral = await import('./tumski_cathedral_handler.js');
            if (cathedral && cathedral.createStepSound) {
                stepSound = cathedral.createStepSound();
            }
        } catch (_) {}

        // 6) Стрелки: навесим обработчики, если элементы присутствуют
        // console.log('🎵 Настраиваем обработчики стрелок...');
        setupAllArrows(stepSound);
        setupMobileSceneScrollCentering();

        // Если пришли через карту, мягко простимулируем появление курсора
        try {
            const viaMap = sessionStorage.getItem('navigateViaMap') === '1';
            if (viaMap) {
                sessionStorage.removeItem('navigateViaMap');
                const areaLeft = document.querySelector('.custom-cursor-leftarea');
                if (areaLeft) {
                    const rect = areaLeft.getBoundingClientRect();
                    const evt = new MouseEvent('mousemove', {
                        bubbles: true,
                        clientX: Math.round(rect.left + rect.width / 2),
                        clientY: Math.round(rect.top + rect.height / 2)
                    });
                    areaLeft.dispatchEvent(evt);
                }
            }
        } catch (_) {}

        // 7) Квест-метки (унифицировано): ищем любые .map-mark с data-quest-number
        try {
            const questMarks = Array.from(document.querySelectorAll('.map-mark[data-quest-number]'));
            if (questMarks.length > 0) {
                const questMod = await import('./quest_marker_handler.js');
                // Добавим glow-стили один раз
                try { ensureQuestGlowStyles(); } catch (_) {}
                for (const el of questMarks) {
                    try {
                        const markerId = el.id;
                        const questNumber = parseInt(el.getAttribute('data-quest-number'));
                        const questImage = el.getAttribute('data-quest-image') || '';
                        if (markerId && questNumber && questMod && typeof questMod.setupQuestGeoMarker === 'function') {
                            questMod.setupQuestGeoMarker({ markerId, questNumber, questImage });
                            el.classList.add('quest-marker-glow');
                            // Маркер успешно инициализирован (используется как флаг для ленивой инициализации по клику)
                            try { el.dataset.questHandlerInitialized = '1'; } catch (_) {}
                        }
                    } catch (_) {}
                }
            }
        } catch (_) {}
        
        // 7.1) Страховка: лениво инициализируем квест-маркер по клику/тапу,
        // если по какой-то причине шаг (7) не успел/не отработал.
        // Важно: обработчик в capture, чтобы сработать даже при клике по перекрывающим слоям.
        try {
            if (!window.__questDelegatedInitHooked) {
                window.__questDelegatedInitHooked = true;
                let inProgress = false;
                const delegatedQuestHandler = async (e) => {
                    const debugQuest = MapDebug.isEnabled();
                    if (inProgress) return;
                    const target = e && e.target && e.target.closest
                        ? e.target.closest('.map-mark[data-quest-number], .map-mark-area')
                        : null;
                    if (!target) return;

                    const mark = target.classList.contains('map-mark')
                        ? target
                        : (target.querySelector ? target.querySelector('.map-mark[data-quest-number]') : null);
                    if (!mark) return;
                    if (!mark.hasAttribute('data-quest-number')) return;

                    if (debugQuest) {
                        try {
                            MapDebug.log('delegatedQuestHandler hit', {
                                event: e?.type,
                                target: e?.target?.className || e?.target?.tagName,
                                markId: mark.id,
                                questNumber: mark.getAttribute('data-quest-number'),
                                hasOpenQuest: typeof mark.__openQuest === 'function',
                                initializedFlag: mark.dataset ? mark.dataset.questHandlerInitialized : undefined
                            });
                        } catch (_) {}
                    }

                    // Уже инициализировано — ничего не делаем только если реально можно открыть квест
                    if (mark.dataset && mark.dataset.questHandlerInitialized && typeof mark.__openQuest === 'function') return;

                    const markerId = mark.id;
                    const questNumber = parseInt(mark.getAttribute('data-quest-number'));
                    const questImage = mark.getAttribute('data-quest-image') || '';
                    if (!markerId || !questNumber) return;

                    // Инициализируем и сразу же повторяем клик, чтобы открыть квест.
                    inProgress = true;
                    try {
                        try { e.preventDefault(); } catch (_) {}
                        try { e.stopPropagation(); } catch (_) {}
                        const questMod = await import('./quest_marker_handler.js');
                        if (debugQuest) {
                            MapDebug.log('delegatedQuestHandler imported quest_marker_handler.js', {
                                hasSetup: !!questMod && typeof questMod.setupQuestGeoMarker === 'function'
                            });
                        }

                        if (questMod && typeof questMod.setupQuestGeoMarker === 'function') {
                            questMod.setupQuestGeoMarker({ markerId, questNumber, questImage });
                            try { mark.classList.add('quest-marker-glow'); } catch (_) {}
                            try { mark.dataset.questHandlerInitialized = '1'; } catch (_) {}

                            if (debugQuest) {
                                MapDebug.log('delegatedQuestHandler after setupQuestGeoMarker', {
                                    markId: mark.id,
                                    hasOpenQuest: typeof mark.__openQuest === 'function'
                                });
                            }

                            // Открываем квест напрямую (не через synthetic click)
                            setTimeout(() => {
                                try {
                                    if (typeof mark.__openQuest === 'function') {
                                        mark.__openQuest(e);
                                    } else {
                                        // Фоллбек: попробуем обычный клик
                                        mark.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
                                    }
                                } catch (err) {
                                    if (debugQuest) MapDebug.error('delegatedQuestHandler open attempt failed', err);
                                }
                            }, 0);
                        } else if (debugQuest) {
                            MapDebug.warn('delegatedQuestHandler: setupQuestGeoMarker not found', questMod);
                        }
                    } catch (err) {
                        if (debugQuest) MapDebug.error('delegatedQuestHandler failed', err);
                    } finally {
                        setTimeout(() => { inProgress = false; }, 0);
                    }
                };

                // На тач-устройствах click может не срабатывать — слушаем также touchend (capture)
                document.addEventListener('click', delegatedQuestHandler, true);
                document.addEventListener('touchend', delegatedQuestHandler, { capture: true, passive: false });
            }
        } catch (_) {}
        
        // 7.2) Геометки-гномы: .map-mark с data-gnome-id
        try {
            const gnomeMarks = Array.from(document.querySelectorAll('.map-mark[data-gnome-id]'));
            if (gnomeMarks.length > 0) {
                const gnomeMod = await import('./gnome_marker_handler.js');
                if (gnomeMod && typeof gnomeMod.setupGnomeGeoMarker === 'function') {
                    for (const el of gnomeMarks) {
                        try {
                            const markerId = el.id;
                            const gnomeId = el.getAttribute('data-gnome-id') || markerId || '';
                            const imageSrc = el.getAttribute('data-gnome-image') || '';
                            const title = el.getAttribute('data-gnome-title') || '';
                            const description = el.getAttribute('data-gnome-description') || '';
                            if (!markerId || !gnomeId) continue;
                            gnomeMod.setupGnomeGeoMarker({
                                markerId,
                                gnomeId,
                                imageSrc: imageSrc || undefined,
                                title: title || undefined,
                                description: description || undefined
                            });
                        } catch (_) {}
                    }
                    
                    // Проверяем hash для автоматического открытия попапа гнома
                    try {
                        // Проверяем hash из URL или из сообщения SPA
                        let hash = window.location.hash.replace('#', '') || '';
                        if (window.__pendingGnomeHash) {
                            hash = window.__pendingGnomeHash;
                            delete window.__pendingGnomeHash;
                        }
                        MapDebug.log('[tumski_page_common] Проверка hash:', hash);
                        if (hash) {
                            // Специальная обработка для гнома Паца-Ваца на странице minsk01.html
                            if (hash === 'patsa_vatsa') {
                                MapDebug.log('[tumski_page_common] Найден hash patsa_vatsa, открываем попап');
                                // Открываем попап Паца-Ваца напрямую (hash уже указывает, что мы на нужной странице)
                                setTimeout(() => {
                                    try {
                                        MapDebug.log('[tumski_page_common] Вызываем openGnomePopupDirectly, gnomeMod:', !!gnomeMod);
                                        if (gnomeMod && typeof gnomeMod.openGnomePopupDirectly === 'function') {
                                            MapDebug.log('[tumski_page_common] openGnomePopupDirectly найден, вызываем');
                                            gnomeMod.openGnomePopupDirectly({
                                                gnomeId: 'patsa_vatsa',
                                                imageSrc: 'media/krasnolud/krasnal_tumski14.jpg'
                                            });
                                        } else {
                                            MapDebug.warn('[tumski_page_common] openGnomePopupDirectly не найден, используем fallback');
                                            // Fallback: создаем временный маркер
                                            const tempMarker = document.createElement('div');
                                            tempMarker.id = 'gnome_patsa_vatsa_temp';
                                            tempMarker.setAttribute('data-gnome-id', 'patsa_vatsa');
                                            tempMarker.style.display = 'none';
                                            document.body.appendChild(tempMarker);
                                            
                                            gnomeMod.setupGnomeGeoMarker({
                                                markerId: 'gnome_patsa_vatsa_temp',
                                                gnomeId: 'patsa_vatsa',
                                                imageSrc: 'media/krasnolud/krasnal_tumski14.jpg'
                                            });
                                            
                                            setTimeout(() => {
                                                const marker = document.getElementById('gnome_patsa_vatsa_temp');
                                                if (marker) {
                                                    marker.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
                                                }
                                            }, 200);
                                        }
                                    } catch (err) {
                                        MapDebug.error('Ошибка при открытии попапа Паца-Ваца:', err);
                                    }
                                }, 800);
                                return; // Выходим, чтобы не проверять другие гномы
                            }
                            
                            // Обычная обработка для других гномов
                            const targetGnome = gnomeMarks.find(el => {
                                const gnomeId = el.getAttribute('data-gnome-id') || '';
                                return gnomeId === hash || el.id === hash;
                            });
                            
                            if (targetGnome) {
                                // Небольшая задержка для полной инициализации
                                setTimeout(() => {
                                    try {
                                        const markerId = targetGnome.id;
                                        const gnomeId = targetGnome.getAttribute('data-gnome-id') || markerId || '';
                                        // Имитируем клик для открытия попапа
                                        if (markerId && gnomeId) {
                                            const marker = document.getElementById(markerId);
                                            if (marker) {
                                                marker.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
                                            }
                                        }
                                    } catch (err) {
                                        MapDebug.error('Ошибка при автоматическом открытии попапа гнома:', err);
                                    }
                                }, 300);
                            }
                        }
                    } catch (_) {}
                }
            }
        } catch (_) {}
        
        // 8) Универсальные геометки: все .map-mark без data-quest-number и без data-gnome-id
        try {
            const marks = Array.from(document.querySelectorAll('.map-mark'))
                .filter(el => !el.hasAttribute('data-quest-number') && !el.hasAttribute('data-gnome-id'));
            if (marks.length > 0) {
                const cathedral = await import('./tumski_cathedral_handler.js');
                if (cathedral && typeof cathedral.setupUniversalGeoMarker === 'function') {
                    for (const el of marks) {
                        const markerId = el.id || '';
                        if (!markerId) continue;
                        // По умолчанию ключ локализации совпадает с id
                        cathedral.setupUniversalGeoMarker({ markerId, i18nKey: markerId });
                    }
                }
            }
        } catch (_) {}

        // 9) Позиционирование геометок/стрелок и прочие сервисные вызовы
        try {
            const cathedral = await import('./tumski_cathedral_handler.js');
            if (cathedral && typeof cathedral.moveMarkersAndCursors === 'function') cathedral.moveMarkersAndCursors();
            if (cathedral && typeof cathedral.positionMarkersOnBg === 'function') {
                // Добавляем задержку для предотвращения рекурсии
                setTimeout(() => {
                    cathedral.positionMarkersOnBg();
                }, 50);
            }
            
            // Устанавливаем src для papera-изображений и растягиваем их
            const paperaImages = document.querySelectorAll('.papera-image');
            paperaImages.forEach(img => {
                if (!img.src || img.src === '') {
                    img.src = 'media/papera1.png';
                }
            });
            
            if (cathedral && typeof cathedral.stretchPaperaToTextWidth === 'function') {
                cathedral.stretchPaperaToTextWidth();
                setTimeout(() => cathedral.stretchPaperaToTextWidth(), 100);
                setTimeout(() => cathedral.stretchPaperaToTextWidth(), 500);
            }
            
            if (cathedral && typeof cathedral.setupZoomTracking === 'function') {
                cathedral.setupZoomTracking();
            }

            // Перепозиционирование на resize (с защитой от рекурсии)
            let resizeTimeout;
            let isPositioning = false;
            window.addEventListener('resize', () => {
                if (isPositioning) return; // Предотвращаем множественные вызовы
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(() => {
                    if (!isPositioning) {
                        isPositioning = true;
                        try { 
                            if (cathedral && typeof cathedral.positionMarkersOnBg === 'function') {
                                cathedral.positionMarkersOnBg();
                            }
                        } catch (_) {}
                        setTimeout(() => { isPositioning = false; }, 100);
                    }
                }, 100);
            });

            // И после полной загрузки окна (с защитой от рекурсии)
            window.addEventListener('load', () => {
                if (isPositioning) return;
                setTimeout(() => {
                    if (!isPositioning) {
                        isPositioning = true;
                        try { 
                            if (cathedral && typeof cathedral.positionMarkersOnBg === 'function') {
                                cathedral.positionMarkersOnBg();
                            }
                        } catch (_) {}
                        setTimeout(() => { isPositioning = false; }, 100);
                    }
                }, 200);
            });
        } catch (_) {}

        // 10) Принудительно показываем стрелки на мобильных
        forceShowCursorsOnMobile();
    } catch (_) {
        // no-op: инициализация должна быть максимально устойчивой
    }
}

function ensureQuestGlowStyles() {
    const styleId = 'quest-marker-glow-styles';
    if (document.getElementById(styleId)) return;
    const s = document.createElement('style');
    s.id = styleId;
    s.textContent = `
        @keyframes markerGlowPulse { 0% { transform: scale(1); } 50% { transform: scale(1.04); } 100% { transform: scale(1); } }
        @keyframes markerHaloPulse { 0% { box-shadow: 0 0 14px rgba(139,69,19,.45), 0 0 26px rgba(139,69,19,.25);} 50% { box-shadow: 0 0 24px rgba(139,69,19,.85), 0 0 44px rgba(139,69,19,.55);} 100% { box-shadow: 0 0 14px rgba(139,69,19,.45), 0 0 26px rgba(139,69,19,.25);} }
        .quest-marker-glow { position: relative; animation: markerGlowPulse 1.8s ease-in-out infinite; display: inline-block; background-position: center center; background-repeat: no-repeat; background-size: contain; z-index: 1002; }
        .quest-marker-glow::after { content: ''; position: absolute; top: 50%; left: 50%; width: calc(100% + 20px); height: calc(100% + 20px); transform: translate(-50%, -50%); border-radius: 50%; pointer-events: none; animation: markerHaloPulse 1.8s ease-in-out infinite; z-index: 1002; }
        @media (prefers-reduced-motion: reduce) { .quest-marker-glow, .quest-marker-glow::after { animation: none !important; } }
    `;
    document.head.appendChild(s);
}

export function setupAllArrows(stepSound) {
    // console.log('🎵 setupAllArrows: ищем элементы стрелок...');
    try {
        const cursorRight = document.querySelector('.custom-cursor');
        const areaRight = document.querySelector('.custom-cursor-area');
        const cursorProsto = document.querySelector('.custom-cursor-prosto');
        const areaProsto = document.querySelector('.custom-cursor-prostoarea');
        const cursorBack = document.querySelector('.custom-cursor-back');
        const areaBack = document.querySelector('.custom-cursor-backarea');
        const cursorLeft = document.querySelector('.custom-cursor-left');
        const areaLeft = document.querySelector('.custom-cursor-leftarea');
        const cursorProstoLeft = document.querySelector('.custom-cursor-prosto-left');
        const areaProstoLeft = document.querySelector('.custom-cursor-prosto-leftarea');
        
        // console.log('🎵 Найденные элементы стрелок:', {
        //     cursorBack: !!cursorBack,
        //     areaBack: !!areaBack,
        //     cursorLeft: !!cursorLeft,
        //     areaLeft: !!areaLeft
        // });

        const TURN_TRANSITION_IMAGE_HINTS = Object.freeze(['strelka_rondo_l.png']);
        const getCurrentPageName = () => {
            return (window.location.pathname.split('/').pop() || '').split('#')[0].split('?')[0];
        };

        const hasRouteTurnTransition = (targetPage) => {
            if (!window.parent || window.parent === window || !targetPage) {
                return false;
            }

            const configProvider = window.parent.SpaConfig?.getPageTransitionConfig;
            if (typeof configProvider !== 'function') {
                return false;
            }

            return Boolean(configProvider(targetPage, {
                sourcePage: getCurrentPageName()
            }));
        };

        const buildTurnTransitionOptions = (cursorEl, targetPage) => {
            if (!cursorEl || typeof window.getComputedStyle !== 'function') {
                return {};
            }

            const image = window.getComputedStyle(cursorEl)
                .getPropertyValue('background-image')
                .toLowerCase();

            if (image && image !== 'none' && TURN_TRANSITION_IMAGE_HINTS.some((hint) => image.includes(hint))) {
                return {
                    transition: {
                        turnTransition: true
                    }
                };
            }

            if (hasRouteTurnTransition(targetPage)) {
                return {
                    transition: {
                        turnTransition: true
                    }
                };
            }

            return {};
        };

        const navigateWithTransition = (targetPage, cursorEl) => {
            const transitionOptions = buildTurnTransitionOptions(cursorEl, targetPage);
            if (window.parent && window.parent !== window && window.parent.spaManager) {
                window.parent.spaManager.navigateToPage(targetPage, transitionOptions);
            } else {
                setTimeout(() => { window.location.href = targetPage; }, 0);
            }
        };

        // Fallback обработчик клика (для мобильных), читает data-* со стрелки
        const attachDirectNav = (cursorEl, areaEl, attrName) => {
            if (!cursorEl || !areaEl) return;
            const handler = () => {
                const url = cursorEl.getAttribute(attrName);
                if (!url) return;
                if (stepSound && isSoundEnabled()) {
                    try { stepSound.currentTime = 0; stepSound.play().catch(()=>{}); } catch(_) {}
                }

                navigateWithTransition(url, cursorEl);
            };
            ['click','touchend'].forEach(ev => {
                cursorEl.addEventListener(ev, handler);
                areaEl.addEventListener(ev, handler);
            });
        };

        // Право (data-prev-page на .custom-cursor)
        if (cursorRight && areaRight && typeof window.setupRightArrowHandler === 'function') {
            window.setupRightArrowHandler(cursorRight, areaRight, stepSound);
        }

        // Вперёд (data-next-page на .custom-cursor-prosto)
        if (cursorProsto && areaProsto && typeof window.setupForwardArrowHandler === 'function') {
            window.setupForwardArrowHandler(cursorProsto, areaProsto, stepSound, () => {
                const next = cursorProsto.getAttribute('data-next-page');
                if (next) {
                    // Специальная логика для tumski18.html -> tumski19.html
                    const currentPage = window.location.pathname.split('/').pop();
                    if (currentPage === 'tumski18.html' && next === 'tumski19.html') {
                        // console.log('🎵 Специальная логика для tumski18 -> tumski19: переключаем музыку');
                        
                        // Проверяем, находимся ли мы в SPA
                        if (window.parent && window.parent !== window && window.parent.spaManager) {
                            // Переключаем музыку на kostel через SPA
                            // console.log('🎵 Переключаем музыку на kostel через SPA');
                            window.parent.spaManager.switchTrack('kostel');
                            
                            // console.log('🎵 Переход через SPA:', next);
                            window.parent.spaManager.navigateToPage(next, buildTurnTransitionOptions(cursorProsto, next));
                        } else {
                            // console.log('🎵 Обычный переход:', next);
                            window.location.href = next;
                        }
                    } else if (currentPage === 'tumski20.html' && next === 'tumski21.html') {
                        // console.log('🎵 Специальная логика для tumski20 -> tumski21: переключаем музыку');
                        
                        // Проверяем, находимся ли мы в SPA
                        if (window.parent && window.parent !== window && window.parent.spaManager) {
                            // Переключаем музыку на hang через SPA
                            // console.log('🎵 Переключаем музыку на hang через SPA');
                            window.parent.spaManager.switchTrack('hang');
                            
                            // console.log('🎵 Переход через SPA:', next);
                            window.parent.spaManager.navigateToPage(next, buildTurnTransitionOptions(cursorProsto, next));
                        } else {
                            // console.log('🎵 Обычный переход:', next);
                            window.location.href = next;
                        }
                    } else if (currentPage === 'tumski15.html' && next === 'ogrod13.html') {
                        // console.log('🎵 Специальная логика для tumski15 -> ogrod13: переключаем музыку');
                        
                        // Проверяем, находимся ли мы в SPA
                        if (window.parent && window.parent !== window && window.parent.spaManager) {
                            // Переключаем музыку на birds через SPA
                            // console.log('🎵 Переключаем музыку на birds через SPA');
                            window.parent.spaManager.switchTrack('birds');
                            
                            // console.log('🎵 Переход через SPA:', next);
                            window.parent.spaManager.navigateToPage(next, buildTurnTransitionOptions(cursorProsto, next));
                        } else {
                            // console.log('🎵 Обычный переход:', next);
                            window.location.href = next;
                        }
                    } else {
                        // Обычная логика для других переходов
                        navigateWithTransition(next, cursorProsto);
                    }
                }
            });
            // attachDirectNav(cursorProsto, areaProsto, 'data-next-page'); // Удалено: мешало анимации перехода
        }

        // Назад (data-prev-page на .custom-cursor-back)
        // console.log('🎵 Проверяем стрелку назад:', {
        //     cursorBack: !!cursorBack,
        //     areaBack: !!areaBack,
        //     setupBackArrowHandler: typeof window.setupBackArrowHandler,
        //     dataPrevPage: cursorBack ? cursorBack.getAttribute('data-prev-page') : 'нет cursorBack',
        //     currentPage: window.location.pathname
        // });
        
        if (cursorBack && areaBack && typeof window.setupBackArrowHandler === 'function') {
            window.setupBackArrowHandler(cursorBack, areaBack, stepSound, () => {
                const prev = cursorBack.getAttribute('data-prev-page');
                if (prev) {
                    // Проверяем, находимся ли мы в SPA
                    if (window.parent && window.parent !== window && window.parent.spaManager) {
                        window.parent.spaManager.navigateToPage(prev, buildTurnTransitionOptions(cursorBack, prev));
                    } else {
                        window.location.href = prev;
                    }
                }
            });
            attachDirectNav(cursorBack, areaBack, 'data-prev-page');
        } else {
            // console.log('🎵 Стрелка назад не настроена - отсутствуют элементы или функция');
        }

        // Влево (data-next-page на .custom-cursor-left)
        if (cursorLeft && areaLeft && typeof window.setupLeftArrowHandler === 'function') {
            window.setupLeftArrowHandler(cursorLeft, areaLeft, stepSound, () => {
                const next = cursorLeft.getAttribute('data-next-page');
                if (next) {
                    // Проверяем, находимся ли мы в SPA
                    if (window.parent && window.parent !== window && window.parent.spaManager) {
                        // console.log('🎵 Переход через SPA:', next);
                        window.parent.spaManager.navigateToPage(next, buildTurnTransitionOptions(cursorLeft, next));
                    } else {
                        // console.log('🎵 Обычный переход:', next);
                        window.location.href = next;
                    }
                }
            });
            attachDirectNav(cursorLeft, areaLeft, 'data-next-page');
        }

        // Прямо влево (data-next-page на .custom-cursor-prosto-left)
        if (cursorProstoLeft && areaProstoLeft && typeof window.setupForwardLeftArrowHandler === 'function') {
            window.setupForwardLeftArrowHandler(cursorProstoLeft, areaProstoLeft, stepSound, () => {
                const next = cursorProstoLeft.getAttribute('data-next-page');
                if (next) {
                    // Проверяем, находимся ли мы в SPA
                    if (window.parent && window.parent !== window && window.parent.spaManager) {
                        // console.log('🎵 Переход через SPA:', next);
                        window.parent.spaManager.navigateToPage(next, buildTurnTransitionOptions(cursorProstoLeft, next));
                    } else {
                        // console.log('🎵 Обычный переход:', next);
                        window.location.href = next;
                    }
                }
            });
        }

        // Вверх (data-next-page на .custom-cursor-up)
        const cursorUp = document.querySelector('.custom-cursor-up');
        const areaUp = document.querySelector('.custom-cursor-uparea');
        if (cursorUp && areaUp && typeof window.setupUpArrowHandler === 'function') {
            window.setupUpArrowHandler(cursorUp, areaUp, stepSound);
        }
    } catch (_) {}
}

function forceShowCursorsOnMobile() {
    try {
        if (window.innerWidth > 700) return;
        const selectors = [
            '.custom-cursor', '.custom-cursor-area',
            '.custom-cursor-prosto', '.custom-cursor-prostoarea',
            '.custom-cursor-prosto-left', '.custom-cursor-prosto-leftarea',
            '.custom-cursor-back', '.custom-cursor-backarea',
            '.custom-cursor-left', '.custom-cursor-leftarea',
            '.custom-cursor-up', '.custom-cursor-uparea'
        ];
        document.querySelectorAll(selectors.join(',')).forEach(el => {
            try {
                el.style.opacity = '1';
                el.style.display = 'block';
                el.style.pointerEvents = 'auto';
                el.style.visibility = 'visible';
                el.style.zIndex = '9999';
            } catch(_) {}
        });
    } catch (_) {}
}

// Делаем функцию isSoundEnabled доступной глобально
window.isSoundEnabled = isSoundEnabled;
window.centerMobileSceneScroll = centerMobileSceneScroll;
