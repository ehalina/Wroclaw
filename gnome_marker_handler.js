// Универсальный обработчик для геометок "Гном"
// Ожидаемые атрибуты на .map-mark:
// - data-gnome-id           — уникальный ID гнома (для прогресса), по умолчанию marker.id
// - data-gnome-title        — заголовок (имя гнома), опционально
// - data-gnome-description  — текст описания, опционально
// - data-gnome-image        — путь к картинке гнома; по умолчанию media/krasnolud/krasnal_<page>.jpg

import { MapDebug } from './map_debug.js';

function safeJsonParse(str, fallback) {
    try {
        return JSON.parse(str);
    } catch (_) {
        return fallback;
    }
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function sanitizeGnomeDescription(value) {
    if (window.i18n && typeof window.i18n.sanitizeRichTranslation === 'function') {
        return window.i18n.sanitizeRichTranslation(value);
    }

    return escapeHtml(value).replace(/&lt;br\s*\/?&gt;/gi, '<br>');
}

function trackGnomeLocally(gnomeId) {
    if (!gnomeId) return;
    try {
        const raw = localStorage.getItem('foundGnomes') || '{}';
        const store = safeJsonParse(raw, {}) || {};
        if (!store[gnomeId]) {
            store[gnomeId] = Date.now();
            localStorage.setItem('foundGnomes', JSON.stringify(store));
        }
    } catch (_) {}
}

function trackGnomeFound(gnomeId) {
    if (!gnomeId) return;
    try {
        if (window.userAccountManager && typeof window.userAccountManager.trackGnomeFound === 'function') {
            window.userAccountManager.trackGnomeFound(gnomeId);
        } else {
            trackGnomeLocally(gnomeId);
        }
    } catch (_) {
        trackGnomeLocally(gnomeId);
    }
}

function resolveGnomeImage({ marker, gnomeId, explicitImage }) {
    if (explicitImage) return explicitImage;
    try {
        const attrImg = marker?.getAttribute?.('data-gnome-image');
        if (attrImg) return attrImg;
    } catch (_) {}

    let pageName = '';
    try {
        const path = window.location && window.location.pathname
            ? window.location.pathname.split('/').pop()
            : '';
        pageName = (path || '').replace('.html', '');
    } catch (_) {}

    const base = gnomeId || pageName;
    if (!base) return '';
    return `media/krasnolud/krasnal_${base}.jpg`;
}

function resolveGnomeTitle({ marker, gnomeId }) {
    try {
        const fromAttr = marker?.getAttribute?.('data-gnome-title');
        if (fromAttr && fromAttr.trim()) return fromAttr.trim();
    } catch (_) {}

    try {
        if (window.i18n && typeof window.i18n.t === 'function') {
            const key = `gnomes.${gnomeId}.title`;
            const v = window.i18n.t(key);
            if (v && v !== key) return v;
        }
    } catch (_) {}

    return gnomeId ? `Гном ${gnomeId}` : 'Гном';
}

function resolveGnomeDescription({ marker, gnomeId }) {
    try {
        const fromAttr = marker?.getAttribute?.('data-gnome-description');
        if (fromAttr && fromAttr.trim()) return fromAttr;
    } catch (_) {}

    try {
        if (window.i18n && typeof window.i18n.t === 'function') {
            const key = `gnomes.${gnomeId}.description`;
            const v = window.i18n.t(key);
            if (v && v !== key) return v;
        }
    } catch (_) {}

    return '';
}

function getOverlayDocument() {
    let doc = document;
    try {
        if (window.parent && window.parent !== window && window.parent.document) {
            doc = window.parent.document;
        }
    } catch (_) {}
    return doc;
}

export function setupGnomeGeoMarker({ markerId, gnomeId, imageSrc, title, description }) {
    const marker = document.getElementById(markerId);
    if (!marker) return;

    const effectiveGnomeId =
        gnomeId ||
        marker.getAttribute('data-gnome-id') ||
        marker.id ||
        '';

    const openGnome = (e) => {
        try {
            if (e && typeof e.preventDefault === 'function') e.preventDefault();
            if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
        } catch (_) {}

        // 1) Обновляем прогресс пользователя
        trackGnomeFound(effectiveGnomeId);

        // Специальная обработка для гнома Паца-Ваца
        if (effectiveGnomeId === 'patsa_vatsa') {
            // Проверяем, находимся ли мы уже на странице minsk01.html
            // В SPA контексте проверяем через parent window или hash
            let isOnMinsk01 = false;
            try {
                const currentPage = window.location.pathname.split('/').pop() || '';
                const currentHash = window.location.hash.replace('#', '') || '';
                const parentLocation = window.parent && window.parent !== window ? window.parent.location : null;
                const parentHash = parentLocation ? (parentLocation.hash || '').replace('#', '') : '';
                
                isOnMinsk01 = currentPage === 'minsk01.html' || 
                              currentHash === 'minsk01.html' ||
                              parentHash === 'minsk01.html' ||
                              parentHash.includes('minsk01');
            } catch (_) {
                // Если нет доступа к parent, проверяем текущую страницу
                const currentPage = window.location.pathname.split('/').pop() || '';
                const currentHash = window.location.hash.replace('#', '') || '';
                isOnMinsk01 = currentPage === 'minsk01.html' || currentHash === 'minsk01.html';
            }
            
            if (isOnMinsk01) {
                // Если уже на странице minsk01.html, открываем попап
                MapDebug.log('🟡 [gnome_marker_handler] Уже на minsk01.html, открываем попап');
                // Продолжаем выполнение функции для создания попапа
            } else {
                // Если не на странице minsk01.html, перенаправляем на неё с параметром для открытия попапа
                MapDebug.log('🟡 [gnome_marker_handler] Переход на minsk01.html#patsa_vatsa');
                try {
                    // Пытаемся открыть через SPA менеджер (если доступен)
                    if (window.parent && window.parent !== window && window.parent.spaManager) {
                        MapDebug.log('✅ [gnome_marker_handler] Используем parent.spaManager');
                        window.parent.spaManager.loadPage('minsk01.html#patsa_vatsa');
                    } else if (window.spaManager) {
                        MapDebug.log('✅ [gnome_marker_handler] Используем window.spaManager');
                        window.spaManager.loadPage('minsk01.html#patsa_vatsa');
                    } else {
                        MapDebug.log('⚠️ [gnome_marker_handler] Fallback: обычная навигация');
                        // Fallback: обычная навигация
                        window.location.href = 'minsk01.html#patsa_vatsa';
                    }
                } catch (err) {
                    console.error('❌ [gnome_marker_handler] Ошибка при открытии страницы minsk01.html:', err);
                    // Fallback: обычная навигация
                    try {
                        window.location.href = 'minsk01.html#patsa_vatsa';
                    } catch (_) {}
                }
                return;
            }
        }

        // 2) Получаем актуальные переводы (динамически при открытии попапа)
        const resolvedImage = resolveGnomeImage({
            marker,
            gnomeId: effectiveGnomeId,
            explicitImage: imageSrc
        });
        const resolvedTitle = title || resolveGnomeTitle({ marker, gnomeId: effectiveGnomeId });
        const resolvedDescription = description || resolveGnomeDescription({ marker, gnomeId: effectiveGnomeId });

        // 3) Строим попап с подложкой oldgard
        const overlayDoc = getOverlayDocument();

        // Удаляем предыдущий попап гнома, если есть
        try {
            const existing = overlayDoc.querySelector('.gnome-overlay');
            if (existing && existing.parentNode) {
                existing.parentNode.removeChild(existing);
            }
        } catch (_) {}

        const overlay = overlayDoc.createElement('div');
        overlay.className = 'gnome-overlay';
        overlay.style.cssText = `
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.75);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            box-sizing: border-box;
        `;

        const card = overlayDoc.createElement('div');
        card.className = 'gnome-card';
        card.style.cssText = `
            position: relative;
            max-width: 720px;
            width: 100%;
            max-height: 100%;
            background: url('media/watercolor/oldcard.jpg') center/cover no-repeat;
            border-radius: 16px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
            padding: 20px 24px 20px 24px;
            display: flex;
            flex-direction: column;
            gap: 12px;
            overflow: auto;
            font-family: "Marck Script", cursive, serif;
            color: #5b4636;
        `;

        const titleEl = overlayDoc.createElement('div');
        titleEl.className = 'gnome-title';
        titleEl.textContent = resolvedTitle;
        titleEl.style.cssText = `
            font-size: clamp(22px, 3.2vw, 30px);
            text-align: center;
            margin-bottom: 4px;
            text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.35);
        `;

        const contentWrapper = overlayDoc.createElement('div');
        contentWrapper.className = 'gnome-content';
        contentWrapper.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 12px;
        `;

        const textBlock = overlayDoc.createElement('div');
        textBlock.className = 'gnome-description';
        textBlock.style.cssText = `
            font-size: clamp(16px, 2.4vw, 20px);
            line-height: 1.3;
            padding: 12px 14px;
        `;
        if (resolvedDescription) {
            textBlock.innerHTML = sanitizeGnomeDescription(resolvedDescription);
        } else {
            textBlock.textContent = '';
        }

        const imageWrapper = overlayDoc.createElement('div');
        imageWrapper.className = 'gnome-image-wrapper';
        imageWrapper.style.cssText = `
            display: flex;
            justify-content: center;
            align-items: center;
        `;

        // Специальная обработка для "Синей козы" - показываем koza.jpg
        const imageToShow = effectiveGnomeId === 'blue_goat' ? 'media/krasnolud/koza.jpg' : resolvedImage;

        if (imageToShow) {
            const img = overlayDoc.createElement('img');
            img.className = 'gnome-image';
            img.src = imageToShow;
            img.alt = resolvedTitle || 'Gnome';
            img.style.cssText = `
                max-width: 80%;
                max-height: 45vh;
                border-radius: 12px;
                box-shadow: 0 8px 18px rgba(0, 0, 0, 0.45);
                object-fit: contain;
            `;
            imageWrapper.appendChild(img);
        }

        contentWrapper.appendChild(textBlock);
        contentWrapper.appendChild(imageWrapper);

        // Добавляем кнопку "Вернуться во Вроцлав" для гнома Крафтера
        if (effectiveGnomeId === 'crafter') {
            const navButton = overlayDoc.createElement('button');
            navButton.type = 'button';
            navButton.className = 'gnome-nav-button';
            
            // Получаем текст кнопки из переводов
            let buttonText = 'Вернуться во Вроцлав';
            try {
                if (window.i18n && typeof window.i18n.t === 'function') {
                    const key = 'gnomes.crafter.backToWroclaw';
                    const translated = window.i18n.t(key);
                    if (translated && translated !== key) {
                        buttonText = translated;
                    }
                }
            } catch (_) {}
            
            navButton.textContent = buttonText;
            navButton.style.cssText = `
                padding: 12px 24px;
                margin-top: 8px;
                border: none;
                border-radius: 8px;
                background: rgba(91, 70, 54, 0.85);
                color: #fff;
                font-family: "Marck Script", cursive, serif;
                font-size: clamp(18px, 2.5vw, 22px);
                cursor: pointer;
                transition: background 0.3s ease;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
            `;
            
            navButton.addEventListener('mouseenter', () => {
                navButton.style.background = 'rgba(91, 70, 54, 1)';
            });
            navButton.addEventListener('mouseleave', () => {
                navButton.style.background = 'rgba(91, 70, 54, 0.85)';
            });
            
            navButton.addEventListener('click', () => {
                // Переключаем музыку на town.mp3 в SPA при возврате во Вроцлав
                try {
                    if (window.parent && window.parent !== window && window.parent.spaManager) {
                        const isMuted = window.parent.localStorage.getItem('soundMuted') === 'true';
                        if (!isMuted) {
                            window.parent.spaManager.switchTrack('town');
                        }
                    }
                } catch (err) {
                    console.error('Ошибка при переключении музыки на town:', err);
                }
                
                // Закрываем попап
                closeOverlay();
                
                // Переходим на tumski14.html через SPA менеджер
                try {
                    if (window.parent && window.parent !== window && window.parent.spaManager) {
                        window.parent.spaManager.loadPage('tumski14.html');
                    } else if (window.spaManager) {
                        window.spaManager.loadPage('tumski14.html');
                    } else {
                        // Fallback: обычная навигация
                        window.location.href = 'tumski14.html';
                    }
                } catch (err) {
                    console.error('Ошибка при переходе на tumski14.html:', err);
                    // Fallback: обычная навигация
                    try {
                        window.location.href = 'tumski14.html';
                    } catch (_) {}
                }
            });
            
            contentWrapper.appendChild(navButton);
        }

        const closeBtn = overlayDoc.createElement('button');
        closeBtn.type = 'button';
        closeBtn.className = 'gnome-close-button';
        closeBtn.textContent = '×';
        closeBtn.style.cssText = `
            position: absolute;
            top: 10px;
            right: 14px;
            width: 32px;
            height: 32px;
            border-radius: 16px;
            border: none;
            background: rgba(0, 0, 0, 0.45);
            color: #fff;
            font-size: 20px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        const closeOverlay = () => {
            try {
                if (overlay && overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
            } catch (_) {}
        };

        closeBtn.addEventListener('click', closeOverlay);
        overlay.addEventListener('click', (evt) => {
            if (evt.target === overlay) closeOverlay();
        });

        try {
            overlayDoc.body.appendChild(overlay);
        } catch (_) {}

        card.appendChild(closeBtn);
        card.appendChild(titleEl);
        card.appendChild(contentWrapper);
        overlay.appendChild(card);
    };

    // Основной клик по самой геометке
    marker.addEventListener('click', openGnome);

    // Делаем обработчик доступным для отладочных сценариев
    try { marker.__openGnome = openGnome; } catch (_) {}

    // Привязываем обработчик к элементу с названием гнома на странице
    try {
        // Ищем элемент по data-i18n атрибуту (более надежно)
        const titleKey = `gnomes.${effectiveGnomeId}.title`;
        const titleElement = document.querySelector(`[data-i18n="${titleKey}"]`);
        if (titleElement) {
            titleElement.style.cursor = 'pointer';
            titleElement.addEventListener('click', openGnome);
        } else {
            // Fallback: ищем по id (gnome-{gnomeId}-text, заменяя подчеркивания на дефисы)
            const idSuffix = effectiveGnomeId.replace(/_/g, '-');
            const titleElementById = document.getElementById(`gnome-${idSuffix}-text`);
            if (titleElementById) {
                titleElementById.style.cursor = 'pointer';
                titleElementById.addEventListener('click', openGnome);
            }
        }
    } catch (_) {}

    // На мобильных/планшетах расширенная кликабельная область создаётся отдельным модулем,
    // поэтому здесь ничего дополнительно не делаем.
}

// Экспортируемая функция для прямого открытия попапа гнома без маркера
export function openGnomePopupDirectly({ gnomeId, imageSrc, title, description }) {
    MapDebug.log('🟡 [openGnomePopupDirectly] Вызвана с параметрами:', { gnomeId, imageSrc, title, description });
    if (!gnomeId) {
        console.error('❌ [openGnomePopupDirectly] gnomeId не передан');
        return;
    }
    
    // Создаем временный маркер для использования существующей логики
    const tempMarker = document.createElement('div');
    tempMarker.id = `gnome_${gnomeId}_temp_${Date.now()}`;
    tempMarker.setAttribute('data-gnome-id', gnomeId);
    tempMarker.style.display = 'none';
    document.body.appendChild(tempMarker);
    MapDebug.log('🟡 [openGnomePopupDirectly] Создан временный маркер:', tempMarker.id);
    
    // Используем существующую функцию setupGnomeGeoMarker
    setupGnomeGeoMarker({
        markerId: tempMarker.id,
        gnomeId: gnomeId,
        imageSrc: imageSrc,
        title: title,
        description: description
    });
    MapDebug.log('🟡 [openGnomePopupDirectly] setupGnomeGeoMarker вызван');
    
    // Открываем попап программно
    setTimeout(() => {
        try {
            const marker = document.getElementById(tempMarker.id);
            MapDebug.log('🟡 [openGnomePopupDirectly] Ищем маркер:', tempMarker.id, 'найден:', !!marker);
            if (marker) {
                MapDebug.log('✅ [openGnomePopupDirectly] Открываем попап через клик');
                marker.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
            } else {
                console.error('❌ [openGnomePopupDirectly] Маркер не найден после создания');
            }
        } catch (err) {
            console.error('❌ [openGnomePopupDirectly] Ошибка при открытии попапа гнома:', err);
        }
    }, 100);
}
