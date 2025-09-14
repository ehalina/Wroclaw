// Общий модуль инициализации страниц Tumski (03,04,05,06,17,18 и главная)
// Выполняет загрузку переводов, инициализацию общих модулей,
// навешивает обработчики на стрелки, квест-метки и настраивает позиционирование

export async function initPageCommon() {
    console.log('🎵 initPageCommon вызван для страницы:', window.location.pathname);
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
        try { if (window.LanguageMenu && typeof window.LanguageMenu.init === 'function') window.LanguageMenu.init(); } catch (_) {}
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
        console.log('🎵 Настраиваем обработчики стрелок...');
        setupAllArrows(stepSound);

        // 7) Квест-метки (унифицировано): ищем любые .map-mark с data-quest-number
        try {
            const questMarks = Array.from(document.querySelectorAll('.map-mark[data-quest-number]'));
            if (questMarks.length > 0) {
                const questMod = await import('./quest_marker_handler.js');
                // Добавим glow-стили один раз
                ensureQuestGlowStyles();
                for (const el of questMarks) {
                    try {
                        const markerId = el.id;
                        const questNumber = parseInt(el.getAttribute('data-quest-number'));
                        const questImage = el.getAttribute('data-quest-image') || '';
                        if (markerId && questNumber && questMod && typeof questMod.setupQuestGeoMarker === 'function') {
                            questMod.setupQuestGeoMarker({ markerId, questNumber, questImage });
                            el.classList.add('quest-marker-glow');
                        }
                    } catch (_) {}
                }
            }
        } catch (_) {}

        // 8) Универсальные геометки: все .map-mark без data-quest-number
        try {
            const marks = Array.from(document.querySelectorAll('.map-mark'))
                .filter(el => !el.hasAttribute('data-quest-number'));
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
        .quest-marker-glow { position: relative; animation: markerGlowPulse 1.8s ease-in-out infinite; display: inline-block; background-position: center center; background-repeat: no-repeat; background-size: contain; }
        .quest-marker-glow::after { content: ''; position: absolute; top: 50%; left: 50%; width: calc(100% + 20px); height: calc(100% + 20px); transform: translate(-50%, -50%); border-radius: 50%; pointer-events: none; animation: markerHaloPulse 1.8s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .quest-marker-glow, .quest-marker-glow::after { animation: none !important; } }
    `;
    document.head.appendChild(s);
}

function setupAllArrows(stepSound) {
    console.log('🎵 setupAllArrows: ищем элементы стрелок...');
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
        
        console.log('🎵 Найденные элементы стрелок:', {
            cursorBack: !!cursorBack,
            areaBack: !!areaBack,
            cursorLeft: !!cursorLeft,
            areaLeft: !!areaLeft
        });
        

        // Fallback обработчик клика (для мобильных), читает data-* со стрелки
        const attachDirectNav = (cursorEl, areaEl, attrName) => {
            if (!cursorEl || !areaEl) return;
            const handler = () => {
                const url = cursorEl.getAttribute(attrName);
                if (!url) return;
                if (stepSound) {
                    try { stepSound.currentTime = 0; stepSound.play().catch(()=>{}); } catch(_) {}
                }
                
                // Проверяем, находимся ли мы в SPA
                if (window.parent && window.parent !== window && window.parent.SPAManager) {
                    console.log('🎵 Fallback навигация через SPA:', url);
                    window.parent.SPAManager.navigateToPage(url);
                } else {
                    console.log('🎵 Fallback обычная навигация:', url);
                    setTimeout(() => { window.location.href = url; }, 0);
                }
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
                    // Проверяем, находимся ли мы в SPA
                    if (window.parent && window.parent !== window && window.parent.SPAManager) {
                        console.log('🎵 Переход через SPA:', next);
                        window.parent.SPAManager.navigateToPage(next);
                    } else {
                        console.log('🎵 Обычный переход:', next);
                        window.location.href = next;
                    }
                }
            });
            // attachDirectNav(cursorProsto, areaProsto, 'data-next-page'); // Удалено: мешало анимации перехода
        }

        // Назад (data-prev-page на .custom-cursor-back)
        console.log('🎵 Проверяем стрелку назад:', {
            cursorBack: !!cursorBack,
            areaBack: !!areaBack,
            setupBackArrowHandler: typeof window.setupBackArrowHandler,
            dataPrevPage: cursorBack ? cursorBack.getAttribute('data-prev-page') : 'нет cursorBack'
        });
        
        if (cursorBack && areaBack && typeof window.setupBackArrowHandler === 'function') {
            window.setupBackArrowHandler(cursorBack, areaBack, stepSound, () => {
                const prev = cursorBack.getAttribute('data-prev-page');
                if (prev) {
                    // Проверяем, находимся ли мы в SPA
                    if (window.parent && window.parent !== window && window.parent.SPAManager) {
                        window.parent.SPAManager.navigateToPage(prev);
                    } else {
                        window.location.href = prev;
                    }
                }
            });
            attachDirectNav(cursorBack, areaBack, 'data-prev-page');
        } else {
            console.log('🎵 Стрелка назад не настроена - отсутствуют элементы или функция');
        }

        // Влево (data-next-page на .custom-cursor-left)
        if (cursorLeft && areaLeft && typeof window.setupLeftArrowHandler === 'function') {
            window.setupLeftArrowHandler(cursorLeft, areaLeft, stepSound, () => {
                const next = cursorLeft.getAttribute('data-next-page');
                if (next) {
                    // Проверяем, находимся ли мы в SPA
                    if (window.parent && window.parent !== window && window.parent.SPAManager) {
                        console.log('🎵 Переход через SPA:', next);
                        window.parent.SPAManager.navigateToPage(next);
                    } else {
                        console.log('🎵 Обычный переход:', next);
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
                    if (window.parent && window.parent !== window && window.parent.SPAManager) {
                        console.log('🎵 Переход через SPA:', next);
                        window.parent.SPAManager.navigateToPage(next);
                    } else {
                        console.log('🎵 Обычный переход:', next);
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


