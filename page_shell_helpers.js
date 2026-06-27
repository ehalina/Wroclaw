function createElement(tagName, options = {}) {
    const element = document.createElement(tagName);

    if (options.className) {
        element.className = options.className;
    }

    if (options.id) {
        element.id = options.id;
    }

    if (options.attributes) {
        Object.entries(options.attributes).forEach(([name, value]) => {
            if (value !== undefined && value !== null) {
                element.setAttribute(name, String(value));
            }
        });
    }

    return element;
}

function setCoordinateData(element, coordinates = {}) {
    const coordinateAttrs = {
        xDesktop: 'data-x-desktop',
        yDesktop: 'data-y-desktop',
        xMobile: 'data-x-mobile',
        yMobile: 'data-y-mobile'
    };

    Object.entries(coordinateAttrs).forEach(([key, attr]) => {
        if (coordinates[key] !== undefined && coordinates[key] !== null) {
            element.setAttribute(attr, String(coordinates[key]));
        }
    });
}

function appendChildren(parent, children) {
    children.filter(Boolean).forEach((child) => parent.appendChild(child));
    return parent;
}

function createSceneShell(options = {}) {
    const scene = createElement('div', { className: 'scene' });
    const imageContainer = createElement('div', {
        className: 'image-container',
        attributes: {
            'data-map-point': options.mapPoint
        }
    });
    const imageScrollWrapper = createElement('div', { className: 'image-scroll-wrapper' });
    const image = createElement('div', { className: 'image' });
    const nextImageContainer = createElement('div', { className: 'next-image-container' });

    appendChildren(imageScrollWrapper, [image]);
    appendChildren(imageContainer, [imageScrollWrapper]);
    appendChildren(scene, [imageContainer, nextImageContainer]);

    return {
        scene,
        imageContainer,
        imageScrollWrapper,
        image,
        nextImageContainer
    };
}

const ROUTE_CURSOR_TYPES = {
    default: {
        cursorClass: 'custom-cursor',
        areaClass: 'custom-cursor-area',
        targetAttr: 'data-prev-page'
    },
    prosto: {
        cursorClass: 'custom-cursor-prosto',
        areaClass: 'custom-cursor-prostoarea',
        targetAttr: 'data-next-page'
    },
    left: {
        cursorClass: 'custom-cursor-left',
        areaClass: 'custom-cursor-leftarea',
        targetAttr: 'data-next-page'
    },
    back: {
        cursorClass: 'custom-cursor-back',
        areaClass: 'custom-cursor-backarea',
        targetAttr: 'data-prev-page'
    },
    prostoLeft: {
        cursorClass: 'custom-cursor-prosto-left',
        areaClass: 'custom-cursor-prosto-leftarea',
        targetAttr: 'data-next-page'
    }
};

function createRouteCursor(options = {}) {
    const type = ROUTE_CURSOR_TYPES[options.type || 'default'] || ROUTE_CURSOR_TYPES.default;
    const cursor = createElement('div', { className: options.cursorClass || type.cursorClass });
    const area = createElement('div', { className: options.areaClass || type.areaClass });
    const targetAttr = options.targetAttr || type.targetAttr;

    setCoordinateData(cursor, options.coordinates);
    setCoordinateData(area, options.areaCoordinates || options.coordinates);

    if (options.page) {
        cursor.setAttribute(targetAttr, options.page);
    }

    return {
        area,
        cursor,
        elements: [cursor, area]
    };
}

function resolveParent(target) {
    if (typeof target === 'string') {
        return document.querySelector(target);
    }

    return target || null;
}

function renderRouteCursors(target, cursors = []) {
    const parent = resolveParent(target);
    if (!parent) {
        return [];
    }

    return cursors.flatMap((cursorOptions) => {
        const routeCursor = createRouteCursor(cursorOptions);
        routeCursor.elements.forEach((element) => parent.appendChild(element));
        return routeCursor.elements;
    });
}

function createMarker(options = {}) {
    const root = createElement('div', { className: 'map-mark-area' });
    const marker = createElement('div', {
        className: 'map-mark',
        id: options.id
    });
    const contentWrapper = createElement('div', { className: 'content-wrapper' });
    const paperaImage = createElement('img', {
        className: 'papera-image',
        attributes: {
            alt: options.paperaAlt || 'Papera',
            src: options.paperaSrc
        }
    });
    const text = createElement('div', {
        className: 'tumski-text',
        id: options.textId,
        attributes: {
            'data-i18n': options.titleKey
        }
    });
    let audio = null;

    setCoordinateData(marker, options.coordinates);

    if (options.gnomeId) {
        marker.setAttribute('data-gnome-id', options.gnomeId);
    }

    if (options.questNumber !== undefined && options.questNumber !== null) {
        marker.setAttribute('data-quest-number', String(options.questNumber));
    }

    if (options.questImage) {
        marker.setAttribute('data-quest-image', options.questImage);
    }

    if (options.markerImageSrc) {
        marker.style.backgroundImage = `url("${options.markerImageSrc}")`;
    }

    appendChildren(contentWrapper, [paperaImage, text]);
    appendChildren(root, [marker, contentWrapper]);

    if (options.audioId) {
        audio = createElement('audio', {
            id: options.audioId,
            attributes: {
                src: options.audioSrc || 'media/opening-a-book.wav'
            }
        });
        root.appendChild(audio);
    }

    return {
        audio,
        contentWrapper,
        marker,
        paperaImage,
        root,
        text
    };
}

function resolveBefore(parent, before) {
    const marker = resolveParent(before);
    if (marker && marker.parentElement === parent) {
        return marker;
    }

    return null;
}

function renderMarkers(target, markers = [], options = {}) {
    const parent = resolveParent(target);
    if (!parent) {
        return [];
    }

    const before = resolveBefore(parent, options.before);

    return markers.map((markerOptions) => {
        const marker = createMarker(markerOptions);
        parent.insertBefore(marker.root, before);
        return marker;
    });
}

function renderConfiguredPage(config = {}) {
    const markers = renderMarkers(
        config.markerTarget || document.body,
        config.markers || [],
        {
            before: config.markerBefore || '.scene',
            ...(config.markerOptions || {})
        }
    );
    const routeElements = renderRouteCursors(config.routeTarget, config.routeCursors || []);

    return {
        markers,
        routeElements
    };
}

export const PageShellHelpers = {
    createMarker,
    createRouteCursor,
    createSceneShell,
    renderConfiguredPage,
    renderMarkers,
    renderRouteCursors,
    setCoordinateData
};

try {
    window.PageShellHelpers = PageShellHelpers;
} catch (_) {}
