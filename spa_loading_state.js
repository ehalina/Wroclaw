(function initSpaLoadingState(global) {
    'use strict';

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

    function setHidden(hidden, root) {
        const overlay = getOverlay(root);
        if (!overlay) {
            return false;
        }

        overlay.classList.toggle('hidden', hidden);
        return true;
    }

    function show(root) {
        return setHidden(false, root);
    }

    function hide(root) {
        return setHidden(true, root);
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
        LOADING_OVERLAY_SELECTOR,
        getOverlay,
        hide,
        isVisible,
        show
    };
})(window);
