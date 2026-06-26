(function () {
    'use strict';

    const STORAGE_KEY = 'visitedPages';
    const MARKER_DIAMETER = 18;

    function getRoot(options) {
        return options.root || window;
    }

    function getDocument(options, root) {
        return options.document || root.document || document;
    }

    function getLocalStorage(options, root) {
        return options.localStorage || root.localStorage || localStorage;
    }

    function importMapPoints(options) {
        if (typeof options.importMapPoints === 'function') {
            return options.importMapPoints();
        }

        return import('./map_points.js');
    }

    function getVisitedPages(options = {}) {
        const root = getRoot(options);
        const storage = getLocalStorage(options, root);

        try {
            const parsed = JSON.parse(storage.getItem(STORAGE_KEY) || '{}');
            return parsed && typeof parsed === 'object' ? parsed : {};
        } catch (_) {
            return {};
        }
    }

    function setVisitedPages(store, options = {}) {
        const root = getRoot(options);
        const storage = getLocalStorage(options, root);
        storage.setItem(STORAGE_KEY, JSON.stringify(store));
    }

    function pageNameFromPath(pathname) {
        return pathname ? pathname.split('/').pop() || '' : '';
    }

    function getCurrentPageName(options = {}) {
        const root = getRoot(options);
        let page = '';

        try {
            page = pageNameFromPath(root.location?.pathname || '');
        } catch (_) {}

        if (!page || page === 'index.html') {
            try {
                const href = root.location?.href || '';
                if (href && href !== 'about:blank') {
                    const url = new URL(href);
                    page = pageNameFromPath(url.pathname);
                }
            } catch (_) {}
        }

        if ((!page || page === 'index.html') && root.frameElement) {
            try {
                if (root.frameElement.src) {
                    const iframeSrc = root.frameElement.src.split('?')[0];
                    page = pageNameFromPath(iframeSrc);
                }
            } catch (_) {}
        }

        page = page.split('?')[0].split('#')[0];
        return (page || 'index.html').trim();
    }

    async function saveVisitedPageIfNeeded(options = {}) {
        try {
            const root = getRoot(options);
            const doc = getDocument(options, root);
            const imageContainer = doc.querySelector('.image-container');
            const mapPointAttr = imageContainer ? imageContainer.getAttribute('data-map-point') : null;
            const mapPoint = mapPointAttr ? parseInt(mapPointAttr) : null;

            if (!mapPoint || Number.isNaN(mapPoint)) {
                return;
            }

            const page = getCurrentPageName({ ...options, root, document: doc });
            const store = getVisitedPages({ ...options, root });

            if (store[page]) {
                if (store[page].point !== mapPoint) {
                    store[page].point = mapPoint;
                    store[page].title = doc.title || page;
                    setVisitedPages(store, { ...options, root });
                }
                return;
            }

            const { isDoublePoint } = await importMapPoints(options);
            const isDouble = isDoublePoint(mapPoint);

            if (!isDouble) {
                for (const [storedPage, data] of Object.entries(store)) {
                    if (data && data.point === mapPoint && storedPage !== page) {
                        delete store[storedPage];
                    }
                }
            }

            store[page] = {
                point: mapPoint,
                page,
                title: doc.title || page
            };
            setVisitedPages(store, { ...options, root });
        } catch (_) {}
    }

    function groupEntriesByPoint(entries) {
        const entriesByPoint = {};

        for (const entry of entries) {
            if (!entry || !entry.point) {
                continue;
            }

            if (!entriesByPoint[entry.point]) {
                entriesByPoint[entry.point] = [];
            }

            entriesByPoint[entry.point].push(entry);
        }

        return entriesByPoint;
    }

    function positionVisitedMarker(marker, coords, mapImage, root, mobileYOffset, desktopTop) {
        if (root.innerWidth <= 768) {
            const imageWidth = mapImage.offsetWidth;
            const imageHeight = mapImage.offsetHeight;
            const x = (coords.x / 100) * imageWidth;
            const y = (coords.y / 100) * imageHeight + mobileYOffset;
            marker.style.left = `${x}px`;
            marker.style.top = `${y}px`;
            return;
        }

        marker.style.left = `${coords.x}%`;
        marker.style.top = desktopTop;
    }

    function createVisitedMarker(doc, entry, className) {
        const marker = doc.createElement('div');
        marker.className = className;
        marker.title = entry.title || entry.page;
        return marker;
    }

    function attachMarker(options, marker, page, isSmallScreen) {
        if (typeof options.attachMarkerHandlers === 'function') {
            options.attachMarkerHandlers(marker, page, isSmallScreen);
        }
    }

    async function renderVisitedMarkers(options = {}) {
        try {
            const root = getRoot(options);
            const doc = getDocument(options, root);
            const layer = doc.getElementById(options.layerId || 'visited-markers-layer');
            const mapImage = doc.getElementById(options.mapImageId || 'map-image');

            if (!layer || !mapImage) {
                return { markerCount: 0 };
            }

            layer.innerHTML = '';

            const visited = getVisitedPages({ ...options, root });
            const entries = Object.values(visited);
            if (!entries.length) {
                return { markerCount: 0 };
            }

            const { getMapPointCoords, isDoublePoint } = await importMapPoints(options);
            const isSmallScreen = root.innerWidth <= 1024;
            const currentPage = getCurrentPageName({ ...options, root, document: doc });
            const entriesByPoint = groupEntriesByPoint(entries);
            let markerCount = 0;

            for (const [pointNum, pointEntries] of Object.entries(entriesByPoint)) {
                const point = parseInt(pointNum);
                const coords = getMapPointCoords(point);
                if (!coords) {
                    continue;
                }

                if (isDoublePoint(point) && pointEntries.length > 1) {
                    const firstEntry = pointEntries[0];
                    const marker1 = createVisitedMarker(
                        doc,
                        firstEntry,
                        'visited-marker visited-marker-double-light'
                    );
                    positionVisitedMarker(
                        marker1,
                        coords,
                        mapImage,
                        root,
                        15 - MARKER_DIAMETER / 2,
                        `calc(${coords.y}% + 15px - ${MARKER_DIAMETER / 2}px)`
                    );
                    attachMarker(options, marker1, firstEntry.page, isSmallScreen);
                    layer.appendChild(marker1);
                    markerCount += 1;

                    const secondEntry = pointEntries[1];
                    const marker2 = createVisitedMarker(
                        doc,
                        secondEntry,
                        'visited-marker visited-marker-double-dark'
                    );
                    positionVisitedMarker(
                        marker2,
                        coords,
                        mapImage,
                        root,
                        15 + MARKER_DIAMETER / 2,
                        `calc(${coords.y}% + 15px + ${MARKER_DIAMETER / 2}px)`
                    );
                    attachMarker(options, marker2, secondEntry.page, isSmallScreen);
                    layer.appendChild(marker2);
                    markerCount += 1;
                    continue;
                }

                const entry = pointEntries[0];
                const marker = createVisitedMarker(
                    doc,
                    entry,
                    'visited-marker' + (entry.page === currentPage ? ' current-page' : '')
                );
                positionVisitedMarker(marker, coords, mapImage, root, 15, `calc(${coords.y}% + 15px)`);
                attachMarker(options, marker, entry.page, isSmallScreen);
                layer.appendChild(marker);
                markerCount += 1;
            }

            return { markerCount };
        } catch (_) {
            return { markerCount: 0 };
        }
    }

    window.VisitedMarkers = {
        getCurrentPageName,
        getVisitedPages,
        renderVisitedMarkers,
        saveVisitedPageIfNeeded
    };
}());
