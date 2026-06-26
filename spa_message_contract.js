(function initSpaMessageContract(global) {
    'use strict';

    const TYPES = Object.freeze({
        AUDIO_UNLOCKED: 'AUDIO_UNLOCKED',
        AUDIO_UNLOCK_CLICKED: 'AUDIO_UNLOCK_CLICKED',
        LANGUAGE_CHANGE: 'LANGUAGE_CHANGE',
        LANGUAGE_CHANGE_FROM_IFRAME: 'LANGUAGE_CHANGE_FROM_IFRAME',
        OPEN_FULLSCREEN_MAP: 'OPEN_FULLSCREEN_MAP',
        OPEN_MINI_MAP: 'OPEN_MINI_MAP',
        PAGE_HASH: 'PAGE_HASH',
        PAGE_SHOWN: 'PAGE_SHOWN',
        SOUND_CONTROL: 'soundControl',
        SPA_NAVIGATE: 'SPA_NAVIGATE'
    });

    const allowedTypes = new Set(Object.values(TYPES));

    function getTargetOrigin() {
        const origin = global.location?.origin;
        return origin && origin !== 'null' ? origin : '*';
    }

    function isAllowedOrigin(event) {
        if (!event) return false;

        const targetOrigin = getTargetOrigin();
        if (targetOrigin === '*') {
            return event.origin === 'null' || event.origin === '';
        }

        return event.origin === targetOrigin;
    }

    function parseMessage(data) {
        if (!data || typeof data !== 'object' || Array.isArray(data)) {
            return null;
        }

        if (typeof data.type !== 'string' || !allowedTypes.has(data.type)) {
            return null;
        }

        return data;
    }

    function isActiveIframeSource(event, getActiveIframe) {
        if (!event || typeof getActiveIframe !== 'function') {
            return false;
        }

        const activeIframe = getActiveIframe();
        return Boolean(
            activeIframe &&
            activeIframe.contentWindow &&
            event.source === activeIframe.contentWindow
        );
    }

    function isParentSource(event) {
        return Boolean(
            event &&
            global.parent &&
            global.parent !== global &&
            event.source === global.parent
        );
    }

    function isTrustedActiveIframeMessage(event, getActiveIframe) {
        return isAllowedOrigin(event) && isActiveIframeSource(event, getActiveIframe);
    }

    function isTrustedParentMessage(event) {
        return isAllowedOrigin(event) && isParentSource(event);
    }

    function createMessage(type, payload = {}) {
        if (!allowedTypes.has(type)) {
            throw new Error(`Unknown SPA message type: ${type}`);
        }

        return {
            ...payload,
            type
        };
    }

    function postToFrame(iframe, type, payload = {}) {
        if (!iframe || !iframe.contentWindow) {
            return false;
        }

        iframe.contentWindow.postMessage(createMessage(type, payload), getTargetOrigin());
        return true;
    }

    function postToParent(type, payload = {}) {
        if (!global.parent || global.parent === global) {
            return false;
        }

        global.parent.postMessage(createMessage(type, payload), getTargetOrigin());
        return true;
    }

    global.SpaMessages = Object.freeze({
        TYPES,
        getTargetOrigin,
        isAllowedOrigin,
        isActiveIframeSource,
        isParentSource,
        isTrustedActiveIframeMessage,
        isTrustedParentMessage,
        parseMessage,
        postToFrame,
        postToParent
    });
})(window);
