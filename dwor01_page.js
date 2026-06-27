import { PageShellHelpers } from './page_shell_helpers.js';

const MARKERS = [
    {
        id: 'black_klotska_quest',
        coordinates: {
            xDesktop: 1220,
            yDesktop: 650,
            xMobile: 1350,
            yMobile: 700
        },
        paperaSrc: 'media/papera1.png',
        titleKey: 'quest.task9',
        audioId: 'bookSoundBlackKlotska',
        questNumber: 9,
        questImage: 'media/tumski/dwor_08.jpg'
    },
    {
        id: 'kleck_gate',
        coordinates: {
            xDesktop: 1500,
            yDesktop: 950,
            xMobile: 1500,
            yMobile: 900
        },
        titleKey: 'kleck_gate.title',
        textId: 'kleck-gate-text',
        audioId: 'bookSoundKleckGate'
    }
];

const ROUTE_CURSORS = [
    {
        type: 'prosto',
        page: 'dwor02.html',
        coordinates: {
            xDesktop: 1000,
            yDesktop: 1200,
            xMobile: 1300,
            yMobile: 1200
        }
    },
    {
        type: 'back',
        page: 'pk02.html',
        coordinates: {
            xDesktop: 100,
            yDesktop: 1500,
            xMobile: 1400,
            yMobile: 1600
        },
        areaCoordinates: {
            xDesktop: 100,
            yDesktop: 1400,
            xMobile: 1400,
            yMobile: 1600
        }
    }
];

PageShellHelpers.renderMarkers(document.body, MARKERS, { before: '.scene' });
PageShellHelpers.renderRouteCursors('.image-container[data-map-point="40"] .image', ROUTE_CURSORS);
