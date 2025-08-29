// Минимальный инициализатор страницы tumski02: вызывает общий модуль
document.addEventListener('DOMContentLoaded', async function() {
    try {
        const common = await import('./tumski_page_common.js');
        if (common && typeof common.initPageCommon === 'function') {
            await common.initPageCommon();
        }
    } catch (_) {}
});


