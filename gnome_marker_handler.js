// Универсальный обработчик для геометок "Гном"
// Ожидаемые атрибуты на .map-mark:
// - data-gnome-id           — уникальный ID гнома (для прогресса), по умолчанию marker.id
// - data-gnome-title        — заголовок (имя гнома), опционально
// - data-gnome-description  — текст описания, опционально
// - data-gnome-image        — путь к картинке гнома; по умолчанию media/krasnolud/krasnal_<page>.jpg

function safeJsonParse(str, fallback) {
    try {
        return JSON.parse(str);
    } catch (_) {
        return fallback;
    }
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

    const resolvedImage = resolveGnomeImage({
        marker,
        gnomeId: effectiveGnomeId,
        explicitImage: imageSrc
    });
    const resolvedTitle = title || resolveGnomeTitle({ marker, gnomeId: effectiveGnomeId });
    const resolvedDescription = description || resolveGnomeDescription({ marker, gnomeId: effectiveGnomeId });

    const openGnome = (e) => {
        try {
            if (e && typeof e.preventDefault === 'function') e.preventDefault();
            if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
        } catch (_) {}

        // 1) Обновляем прогресс пользователя
        trackGnomeFound(effectiveGnomeId);

        // 2) Строим попап с подложкой oldgard
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
            padding: 28px 24px 24px 24px;
            display: flex;
            flex-direction: column;
            gap: 16px;
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
            margin-bottom: 8px;
            text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.35);
        `;

        const contentWrapper = overlayDoc.createElement('div');
        contentWrapper.className = 'gnome-content';
        contentWrapper.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 16px;
        `;

        const textBlock = overlayDoc.createElement('div');
        textBlock.className = 'gnome-description';
        textBlock.style.cssText = `
            font-size: clamp(16px, 2.4vw, 20px);
            line-height: 1.6;
            padding: 16px 18px;
        `;
        if (resolvedDescription) {
            // Позволяем разработчику использовать простой HTML в описании при необходимости
            textBlock.innerHTML = resolvedDescription;
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

        if (resolvedImage) {
            const img = overlayDoc.createElement('img');
            img.className = 'gnome-image';
            img.src = resolvedImage;
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

