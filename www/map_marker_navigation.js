(function () {
    'use strict';

    const DEFAULT_SECONDARY_PAGE_DELAY_MS = 100;

    function normalizePages(page) {
        return (Array.isArray(page) ? page : [page]).filter(Boolean);
    }

    function getSpaManager(root) {
        try {
            if (root && root.SPAManager && typeof root.SPAManager.loadPage === 'function') {
                return root.SPAManager;
            }
        } catch (_) {}

        return null;
    }

    function getParentWindow(root) {
        try {
            if (root && root.parent && root.parent !== root) {
                return root.parent;
            }
        } catch (_) {}

        return null;
    }

    function findNavigationTarget(root) {
        const localManager = getSpaManager(root);
        if (localManager) {
            return {
                manager: localManager,
                mode: 'spa',
                root
            };
        }

        const parentRoot = getParentWindow(root);
        const parentManager = getSpaManager(parentRoot);
        if (parentManager) {
            return {
                manager: parentManager,
                mode: 'parent-spa',
                root: parentRoot
            };
        }

        return null;
    }

    function setNavigateViaMapFlag(root, storageOverride) {
        try {
            const storage = storageOverride || root.sessionStorage;
            storage.setItem('navigateViaMap', '1');
        } catch (_) {}
    }

    function loadPagesWithManager(target, pages, secondaryDelayMs) {
        target.manager.loadPage(pages[0]);

        if (pages.length > 1) {
            setTimeout(() => {
                const delayedManager = getSpaManager(target.root);
                if (delayedManager) {
                    delayedManager.loadPage(pages[1]);
                }
            }, secondaryDelayMs);
        }
    }

    function navigateWithLocation(root, page, locationOverride) {
        const locationTarget = locationOverride || root.location || location;
        locationTarget.href = page;
    }

    function navigate(page, options = {}) {
        const root = options.root || window;
        const pages = normalizePages(page);
        const firstPage = pages[0];

        if (!firstPage) {
            return {
                mode: 'noop',
                page: ''
            };
        }

        setNavigateViaMapFlag(root, options.sessionStorage);

        try {
            const target = findNavigationTarget(root);
            if (target) {
                loadPagesWithManager(
                    target,
                    pages,
                    options.secondaryDelayMs ?? DEFAULT_SECONDARY_PAGE_DELAY_MS
                );
                return {
                    mode: target.mode,
                    page: firstPage,
                    pages: [...pages]
                };
            }

            navigateWithLocation(root, firstPage, options.location);
            return {
                mode: 'location',
                page: firstPage,
                pages: [...pages]
            };
        } catch (_) {
            navigateWithLocation(root, firstPage, options.location);
            return {
                mode: 'location',
                page: firstPage,
                pages: [...pages]
            };
        }
    }

    window.MapMarkerNavigation = {
        navigate,
        normalizePages
    };
}());
