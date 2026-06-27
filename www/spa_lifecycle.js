(function initSpaLifecycle(global) {
    'use strict';

    const DEFAULT_SELECTORS = Object.freeze({
        activePage: '.page-content.active',
        iframe: 'iframe',
        spaContainer: '#spa-container'
    });

    function selector(name, fallback) {
        return global.SpaConfig?.SELECTORS?.[name] || DEFAULT_SELECTORS[name] || fallback;
    }

    function splitPageReference(pageName) {
        const requestedPageName = typeof pageName === 'string' ? pageName : '';
        const parts = requestedPageName.split('#');

        if (parts.length === 1) {
            return Object.freeze({
                hash: '',
                pageName: requestedPageName,
                requestedPageName
            });
        }

        return Object.freeze({
            hash: parts.slice(1).join('#'),
            pageName: parts[0],
            requestedPageName
        });
    }

    function getPageContainerId(pageName) {
        return `page-${String(pageName || '').replace('.html', '')}`;
    }

    function createPageIframe(pageName, timestamp = Date.now()) {
        const iframe = global.document.createElement('iframe');
        iframe.src = `${pageName}?t=${timestamp}`;
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = 'none';
        iframe.style.position = 'absolute';
        iframe.style.top = '0';
        iframe.style.left = '0';
        iframe.style.zIndex = '1';
        return iframe;
    }

    function createPageContainer(pageName, iframe) {
        const pageContainer = global.document.createElement('div');
        pageContainer.className = 'page-content';
        pageContainer.id = getPageContainerId(pageName);

        if (iframe) {
            pageContainer.appendChild(iframe);
        }

        return pageContainer;
    }

    function getSpaContainer(root = global.document) {
        return root?.querySelector?.(selector('spaContainer', '#spa-container')) || null;
    }

    function getIframeFromPage(pageContainer) {
        return pageContainer?.querySelector?.(selector('iframe', 'iframe')) || null;
    }

    function getActivePage(root = global.document) {
        return root?.querySelector?.(selector('activePage', '.page-content.active')) || null;
    }

    function getActiveIframe(root = global.document) {
        return getIframeFromPage(getActivePage(root));
    }

    global.SpaLifecycle = Object.freeze({
        createPageContainer,
        createPageIframe,
        getActiveIframe,
        getActivePage,
        getIframeFromPage,
        getPageContainerId,
        getSpaContainer,
        splitPageReference
    });
})(window);
