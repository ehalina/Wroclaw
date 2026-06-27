import { PageShellHelpers } from './page_shell_helpers.js';

const MARKERS = [
    {
        id: 'kleck_gate',
        coordinates: {
            xDesktop: 1200,
            yDesktop: 100,
            xMobile: 1500,
            yMobile: 200
        },
        titleKey: 'kleck_gate.title',
        textId: 'kleck-gate-text',
        audioId: 'bookSoundKleckGate'
    }
];

const ROUTE_CURSORS = [
    {
        type: 'prosto',
        page: 'dwor03.html',
        coordinates: {
            xDesktop: 1000,
            yDesktop: 1200,
            xMobile: 1900,
            yMobile: 1000
        }
    },
    {
        type: 'back',
        page: 'dwor01.html',
        coordinates: {
            xDesktop: 100,
            yDesktop: 1500,
            xMobile: 1900,
            yMobile: 1600
        },
        areaCoordinates: {
            xDesktop: 100,
            yDesktop: 1400,
            xMobile: 1900,
            yMobile: 1600
        }
    }
];

PageShellHelpers.renderConfiguredPage({
    markers: MARKERS,
    routeCursors: ROUTE_CURSORS,
    routeTarget: '.image-container[data-map-point="40"] .image'
});
