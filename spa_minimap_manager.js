(function initSpaMiniMapManager(global) {
    'use strict';

    const MESSAGE_TYPES = Object.freeze({
        OPEN_FULLSCREEN_MAP: 'OPEN_FULLSCREEN_MAP',
        SPA_NAVIGATE: 'SPA_NAVIGATE'
    });

    function createDefaultMiniMapDependencies(root = global) {
        const getActiveIframe = () => root.spaManager?.getActiveIframe?.() || null;

        return {
            document: root.document,
            getActiveIframe,
            getCurrentPage: () => root.spaManager?.currentPage || '',
            importMapPoints: () => import('./map_points.js'),
            isTrustedActiveIframeMessage: (event) => (
                root.SpaMessages?.isTrustedActiveIframeMessage?.(event, getActiveIframe) || false
            ),
            messageType: (name, fallback) => root.SpaMessages?.TYPES?.[name] || fallback,
            navigateToPage: (page) => {
                if (root.SPAManager && typeof root.SPAManager.loadPage === 'function') {
                    root.SPAManager.loadPage(page);
                    return;
                }

                root.location.href = page;
            },
            parseMessage: (event) => root.SpaMessages?.parseMessage?.(event.data) || null,
            postToIframe: (iframe, type, payload) => root.SpaMessages?.postToFrame?.(iframe, type, payload) || false,
            root
        };
    }

    class MiniMapManager {
        constructor(dependencies = {}) {
            this.deps = {
                ...createDefaultMiniMapDependencies(global),
                ...dependencies
            };

            this.root = this.deps.root || global;
            this.document = this.deps.document || this.root.document;
            this.container = null;
            this.expandBtn = null;
            this.closeBtn = null;
            this.mapImage = null;
            this.mapMarker = null;
            this.visitedMarkers = null;
            this.currentState = 'collapsed';
            this.init();
        }

        init() {
            let lastPage = '';
            this.root.setInterval(() => {
                if (this.currentState === 'mini' && this.container) {
                    const currentPage = this.deps.getCurrentPage();
                    if (currentPage && currentPage !== lastPage) {
                        lastPage = currentPage;
                        this.root.setTimeout(() => this.updateMap(), 500);
                    }
                }
            }, 500);

            this.root.addEventListener('message', (event) => {
                const message = this.deps.parseMessage(event);
                if (
                    message &&
                    message.type === this.deps.messageType('SPA_NAVIGATE', MESSAGE_TYPES.SPA_NAVIGATE) &&
                    this.currentState === 'mini' &&
                    this.deps.isTrustedActiveIframeMessage(event)
                ) {
                    this.root.setTimeout(() => this.updateMap(), 500);
                }
            });

            this.root.addEventListener('resize', () => {
                if (this.currentState === 'mini' && this.container) {
                    this.root.setTimeout(() => this.updateMap(), 100);
                }
            });
        }

        createMiniMap() {
            if (this.container) return;

            this.container = this.document.createElement('div');
            this.container.id = 'mini-map-container';
            this.container.className = 'mini-map-container mini-map-mini';

            const header = this.document.createElement('div');
            header.className = 'mini-map-header';

            this.expandBtn = this.document.createElement('button');
            this.expandBtn.id = 'mini-map-expand';
            this.expandBtn.className = 'mini-map-expand';
            this.expandBtn.title = 'Развернуть в полный экран';
            this.expandBtn.textContent = '⛶';

            this.closeBtn = this.document.createElement('button');
            this.closeBtn.id = 'mini-map-close';
            this.closeBtn.className = 'mini-map-close';
            this.closeBtn.title = 'Свернуть';
            this.closeBtn.textContent = '−';

            header.appendChild(this.expandBtn);
            header.appendChild(this.closeBtn);

            const content = this.document.createElement('div');
            content.className = 'mini-map-content';

            this.mapImage = this.document.createElement('img');
            this.mapImage.id = 'mini-map-image';
            this.mapImage.src = 'media/tumski/map.jpg';
            this.mapImage.alt = 'Карта';

            this.mapMarker = this.document.createElement('img');
            this.mapMarker.id = 'mini-map-marker';
            this.mapMarker.src = 'media/mapmark.png';
            this.mapMarker.alt = 'Маркер';
            this.mapMarker.style.display = 'none';

            this.visitedMarkers = this.document.createElement('div');
            this.visitedMarkers.id = 'mini-map-visited-markers';
            this.visitedMarkers.className = 'mini-map-visited-markers';

            content.appendChild(this.mapImage);
            content.appendChild(this.mapMarker);
            content.appendChild(this.visitedMarkers);

            this.container.appendChild(header);
            this.container.appendChild(content);

            this.document.body.appendChild(this.container);
            this.setupEventHandlers();
        }

        setupEventHandlers() {
            if (!this.container) return;

            if (this.expandBtn) {
                const newExpandBtn = this.expandBtn.cloneNode(true);
                this.expandBtn.parentNode.replaceChild(newExpandBtn, this.expandBtn);
                this.expandBtn = newExpandBtn;

                this.expandBtn.addEventListener('click', (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    this.openFullscreenMap();
                });
            }

            if (this.closeBtn) {
                const newCloseBtn = this.closeBtn.cloneNode(true);
                this.closeBtn.parentNode.replaceChild(newCloseBtn, this.closeBtn);
                this.closeBtn = newCloseBtn;

                this.closeBtn.addEventListener('click', (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    this.collapse();
                });
            }
        }

        collapse() {
            if (!this.container) return;

            this.container.remove();
            this.container = null;
            this.currentState = 'collapsed';
        }

        expand() {
            const activeIframe = this.deps.getActiveIframe();
            if (activeIframe) {
                try {
                    const iframeSrc = activeIframe.src || '';
                    if (iframeSrc.includes('tumski21.html')) {
                        console.log('🗺️ Мини-карта отключена на странице tumski21 для экономии памяти');
                        return;
                    }
                } catch (error) {
                    // Cross-origin access can fail in embedded contexts.
                }
            }

            if (!this.container) {
                this.createMiniMap();
            }

            this.container.className = 'mini-map-container mini-map-mini';
            this.currentState = 'mini';
            this.root.setTimeout(() => this.updateMap(), 500);
        }

        openFullscreenMap() {
            this.collapse();

            const activeIframe = this.deps.getActiveIframe();
            if (activeIframe) {
                try {
                    this.deps.postToIframe(
                        activeIframe,
                        this.deps.messageType('OPEN_FULLSCREEN_MAP', MESSAGE_TYPES.OPEN_FULLSCREEN_MAP),
                        { source: 'parent' }
                    );
                } catch (error) {
                    // Cross-origin access can fail in embedded contexts.
                }
            }
        }

        async updateMap() {
            if (this.currentState === 'collapsed') return;

            try {
                const activeIframe = this.deps.getActiveIframe();
                if (!activeIframe) {
                    const currentPage = this.deps.getCurrentPage();
                    if (currentPage) {
                        const visited = JSON.parse(this.root.localStorage.getItem('visitedPages') || '{}');
                        const pageData = visited[currentPage];
                        if (pageData && pageData.point) {
                            const { getMapPointCoords } = await this.deps.importMapPoints();
                            const coords = getMapPointCoords(pageData.point);
                            if (coords && this.mapMarker) {
                                this.mapMarker.style.display = 'block';
                                this.mapMarker.style.left = `${coords.x}%`;
                                this.mapMarker.style.top = `${coords.y}%`;
                            }
                        }
                        await this.renderVisitedMarkers(null);
                    }
                    return;
                }

                let iframeDoc;
                try {
                    iframeDoc = activeIframe.contentDocument || activeIframe.contentWindow.document;
                } catch (error) {
                    await this.renderVisitedMarkers(null);
                    return;
                }

                const imageContainer = iframeDoc.querySelector('.image-container');
                const mapPoint = imageContainer ? parseInt(imageContainer.getAttribute('data-map-point')) : 1;
                const { getMapPointCoords } = await this.deps.importMapPoints();
                const coords = getMapPointCoords(mapPoint || 1);

                if (coords && this.mapMarker) {
                    this.mapMarker.style.display = 'block';
                    this.mapMarker.style.left = `${coords.x}%`;
                    this.mapMarker.style.top = `${coords.y}%`;
                }

                await this.renderVisitedMarkers(iframeDoc);
            } catch (error) {
                // Keep mini-map failures non-fatal for the SPA shell.
            }
        }

        async renderVisitedMarkers(iframeDoc) {
            if (!this.visitedMarkers) return;

            try {
                this.visitedMarkers.innerHTML = '';

                const visited = JSON.parse(this.root.localStorage.getItem('visitedPages') || '{}');
                const entries = Object.values(visited);
                if (!entries.length) return;

                const activeIframe = this.deps.getActiveIframe();
                let currentPage = '';
                if (activeIframe) {
                    try {
                        const src = activeIframe.src.split('?')[0];
                        currentPage = src.split('/').pop() || '';
                    } catch (error) {}
                }

                const { getMapPointCoords, isDoublePoint } = await this.deps.importMapPoints();
                const entriesByPoint = {};

                for (const entry of entries) {
                    if (!entry || !entry.point) continue;
                    if (!entriesByPoint[entry.point]) {
                        entriesByPoint[entry.point] = [];
                    }
                    entriesByPoint[entry.point].push(entry);
                }

                for (const [pointNum, pointEntries] of Object.entries(entriesByPoint)) {
                    const point = parseInt(pointNum);
                    const coords = getMapPointCoords(point);
                    if (!coords) continue;

                    const isDouble = isDoublePoint(point);
                    const markerDiameter = 10;

                    if (isDouble && pointEntries.length > 1) {
                        this.renderDoubleVisitedMarker(pointEntries, coords, markerDiameter);
                    } else {
                        this.renderSingleVisitedMarker(pointEntries[0], coords, currentPage);
                    }
                }
            } catch (error) {}
        }

        renderDoubleVisitedMarker(pointEntries, coords, markerDiameter) {
            const firstEntry = pointEntries[0];
            const secondEntry = pointEntries[1];

            const marker1 = this.document.createElement('div');
            marker1.className = 'mini-map-visited-marker mini-map-visited-marker-double-light';
            marker1.title = firstEntry.title || firstEntry.page;
            marker1.style.left = `${coords.x}%`;
            marker1.style.top = `calc(${coords.y}% - ${markerDiameter / 2}px)`;
            marker1.addEventListener('click', (event) => {
                event.stopPropagation();
                this.deps.navigateToPage(firstEntry.page);
            });
            this.visitedMarkers.appendChild(marker1);

            const marker2 = this.document.createElement('div');
            marker2.className = 'mini-map-visited-marker mini-map-visited-marker-double-dark';
            marker2.title = secondEntry.title || secondEntry.page;
            marker2.style.left = `${coords.x}%`;
            marker2.style.top = `calc(${coords.y}% + ${markerDiameter / 2}px)`;
            marker2.addEventListener('click', (event) => {
                event.stopPropagation();
                this.deps.navigateToPage(secondEntry.page);
            });
            this.visitedMarkers.appendChild(marker2);
        }

        renderSingleVisitedMarker(entry, coords, currentPage) {
            const marker = this.document.createElement('div');
            marker.className = 'mini-map-visited-marker' + (entry.page === currentPage ? ' current-page' : '');
            marker.title = entry.title || entry.page;
            marker.style.left = `${coords.x}%`;
            marker.style.top = `${coords.y}%`;

            marker.addEventListener('click', (event) => {
                event.stopPropagation();
                this.deps.navigateToPage(entry.page);
            });

            this.visitedMarkers.appendChild(marker);
        }
    }

    global.SpaMiniMap = Object.freeze({
        MiniMapManager,
        createDefaultMiniMapDependencies
    });
})(window);
