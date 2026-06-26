(function initSpaConfig(global) {
    'use strict';

    const PAGE_ORDER = Object.freeze([
        'tumski.html',
        'tumski02.html',
        'tumski03.html',
        'tumski04.html',
        'tumski05.html',
        'tumski06.html',
        'tumski07.html',
        'tumski08.html',
        'tumski09.html',
        'tumski10.html',
        'tumski11.html',
        'tumski12.html',
        'tumski13.html',
        'tumski14.html',
        'tumski15.html',
        'tumski16.html',
        'tumski17.html',
        'tumski18.html',
        'tumski19.html',
        'tumski20.html',
        'tumski21.html',
        'tumski22.html',
        'tumski23.html',
        'tumski24.html'
    ]);

    const START_PAGE = PAGE_ORDER[0];

    const SELECTORS = Object.freeze({
        spaContainer: '#spa-container',
        activePage: '.page-content.active',
        activeIframe: '.page-content.active iframe',
        iframe: 'iframe'
    });

    const AUDIO_TRACKS = Object.freeze({
        BIRDS: 'birds',
        DEFAULT: 'town',
        HANG: 'hang',
        KOSTEL: 'kostel',
        MINSK: 'minsk'
    });

    const AUDIO_ROUTE_POLICY = Object.freeze([
        Object.freeze({
            track: AUDIO_TRACKS.MINSK,
            pages: Object.freeze(['minsk01.html', 'minsk02.html'])
        }),
        Object.freeze({
            track: AUDIO_TRACKS.KOSTEL,
            pages: Object.freeze(['tumski19.html'])
        }),
        Object.freeze({
            track: AUDIO_TRACKS.HANG,
            pages: Object.freeze(['tumski21.html'])
        }),
        Object.freeze({
            track: AUDIO_TRACKS.BIRDS,
            pages: Object.freeze([
                'ogrod02.html',
                'ogrod03.html',
                'ogrod04.html',
                'ogrod05.html',
                'ogrod06.html',
                'ogrod07.html',
                'ogrod08.html',
                'ogrod09.html',
                'ogrod12.html',
                'ogrod13.html'
            ])
        })
    ]);

    function normalizePageName(pageName) {
        if (typeof pageName !== 'string') {
            return '';
        }

        return pageName.split('#')[0].split('?')[0];
    }

    function getPageOrder() {
        return PAGE_ORDER.slice();
    }

    function getPageIndex(pageName) {
        return PAGE_ORDER.indexOf(normalizePageName(pageName));
    }

    function getPreviousPage(pageName) {
        const currentIndex = getPageIndex(pageName);
        return currentIndex > 0 ? PAGE_ORDER[currentIndex - 1] : null;
    }

    function getNextPage(pageName) {
        const currentIndex = getPageIndex(pageName);
        return currentIndex >= 0 && currentIndex < PAGE_ORDER.length - 1
            ? PAGE_ORDER[currentIndex + 1]
            : null;
    }

    function getAudioTrackForPage(pageName) {
        const normalizedPageName = normalizePageName(pageName);
        const route = AUDIO_ROUTE_POLICY.find((candidate) => (
            candidate.pages.some((page) => normalizedPageName.includes(page))
        ));

        return route ? route.track : AUDIO_TRACKS.DEFAULT;
    }

    global.SpaConfig = Object.freeze({
        AUDIO_ROUTE_POLICY,
        AUDIO_TRACKS,
        PAGE_ORDER,
        SELECTORS,
        START_PAGE,
        getAudioTrackForPage,
        getNextPage,
        getPageIndex,
        getPageOrder,
        getPreviousPage
    });
})(window);
