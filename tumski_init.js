// Инициализация для tumski.html
// Используем общий код из common_tumski.js

import { initializeTumskiPage, initializeArrowHandlers } from './common_tumski.js';

document.addEventListener('DOMContentLoaded', async function() {
    // Конфигурация геометок для этой страницы
    const geometries = [
        { markerId: 'swieta_jadwiga', i18nKey: 'swieta_jadwiga' },
        { markerId: 'tumski', i18nKey: 'tumski' },
        { markerId: 'tumski_cathedral', i18nKey: 'tumski_cathedral' },
        { markerId: 'tumski_most', i18nKey: 'tumski_most' },
        { markerId: 'katedra_koscielna', i18nKey: 'katedra_koscielna' }
    ];

    // Инициализируем страницу с общим кодом
    await initializeTumskiPage({
        geometries,
        customInit: () => {
            // Дополнительная инициализация для этой страницы
            initializeArrowHandlers([
                {
                    type: 'desktop',
                    cursor: document.querySelector('.custom-cursor'),
                    cursorArea: document.querySelector('.custom-cursor-area'),
                    handlerType: 'setupRightArrowHandler',
                    callback: () => {
                        const prevPage = document.querySelector('.custom-cursor').getAttribute('data-prev-page');
                        if (prevPage) {
                            window.location.href = prevPage;
                        }
                    }
                },
                {
                    type: 'desktop',
                    cursor: document.querySelector('.custom-cursor-prosto'),
                    cursorArea: document.querySelector('.custom-cursor-prostoarea'),
                    handlerType: 'setupForwardArrowHandler',
                    callback: () => {
                        const nextPage = document.querySelector('.custom-cursor-prosto').getAttribute('data-next-page');
                        if (nextPage) {
                            window.location.href = nextPage;
                        }
                    }
                }
            ]);
        }
    });
});
