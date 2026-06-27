(function initSpaLoadingState(global) {
    'use strict';

    const DEFAULT_ERROR_MESSAGE = 'Loading failed. Please try again.';
    const DEFAULT_LOADING_MESSAGE = 'Loading...';
    const LOADING_OVERLAY_SELECTOR = '#loadingOverlay';

    function getDocument(root) {
        if (!root) {
            return global.document || null;
        }

        if (root.nodeType === 9) {
            return root;
        }

        return root.ownerDocument || global.document || null;
    }

    function getOverlay(root) {
        const doc = getDocument(root);
        return doc?.querySelector?.(LOADING_OVERLAY_SELECTOR) || null;
    }

    function getMessageNode(root) {
        const overlay = getOverlay(root);
        return overlay?.firstElementChild || overlay;
    }

    function setMessage(message, root) {
        const messageNode = getMessageNode(root);
        if (!messageNode) {
            return false;
        }

        messageNode.textContent = message;
        return true;
    }

    function setHidden(hidden, root) {
        const overlay = getOverlay(root);
        if (!overlay) {
            return false;
        }

        overlay.classList.toggle('hidden', hidden);
        return true;
    }

    function show(root, message = DEFAULT_LOADING_MESSAGE) {
        setMessage(message, root);
        return setHidden(false, root);
    }

    function hide(root) {
        setMessage(DEFAULT_LOADING_MESSAGE, root);
        return setHidden(true, root);
    }

    function showError(root, message = DEFAULT_ERROR_MESSAGE) {
        setMessage(message, root);
        return setHidden(false, root);
    }

    function isVisible(root) {
        const overlay = getOverlay(root);
        if (!overlay) {
            return false;
        }

        const doc = getDocument(root);
        const style = doc?.defaultView?.getComputedStyle?.(overlay);
        return Boolean(style && style.display !== 'none' && style.visibility !== 'hidden');
    }

    global.SpaLoadingState = {
        DEFAULT_ERROR_MESSAGE,
        DEFAULT_LOADING_MESSAGE,
        LOADING_OVERLAY_SELECTOR,
        getOverlay,
        hide,
        isVisible,
        setMessage,
        show,
        showError
    };
})(window);
