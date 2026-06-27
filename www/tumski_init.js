// Загружаем базу данных перед инициализацией
if (!document.querySelector('script[src="user_database.js"]')) {
    const dbScript = document.createElement('script');
    dbScript.src = 'user_database.js';
    document.head.appendChild(dbScript);
}

const TUMSKI_INIT_DEBUG_STORAGE_KEYS = ['DEBUG_TUMSKI_INIT', '__tumski_init_debug'];

function isTumskiInitDebugEnabled() {
    try {
        if (window.DEBUG_TUMSKI_INIT === true || window.DEBUG_TUMSKI_INIT === '1' || window.DEBUG_TUMSKI_INIT === 'true') {
            return true;
        }

        return TUMSKI_INIT_DEBUG_STORAGE_KEYS.some((key) => {
            const value = localStorage.getItem(key);
            return value === '1' || value === 'true';
        });
    } catch (_) {
        return false;
    }
}

function debugWarn(...args) {
    if (isTumskiInitDebugEnabled()) {
        console.warn(...args);
    }
}

const TURN_TRANSITION_PAGE = 'tumski08.html';
const TURN_TRANSITION_DURATION_MS = 1500;
let turnTransitionTimer = null;

function getCurrentPageName() {
    return (window.location.pathname.split('/').pop() || '').split('?')[0];
}

function runTurnTransitionForPage(pageName = getCurrentPageName()) {
    if (pageName !== TURN_TRANSITION_PAGE) {
        return;
    }

    const imageContainer = document.querySelector('.image-container');
    if (!imageContainer) {
        return;
    }

    if (turnTransitionTimer !== null) {
        window.clearTimeout(turnTransitionTimer);
        turnTransitionTimer = null;
    }

    // Перезапускаем анимацию, даже если страница уже была загружена в SPA-кеше
    imageContainer.style.animationPlayState = 'paused';
    imageContainer.classList.remove('rotate-transition');
    void imageContainer.offsetWidth;
    imageContainer.classList.add('rotate-transition');

    turnTransitionTimer = window.setTimeout(() => {
        imageContainer.classList.remove('rotate-transition');
        imageContainer.style.animationPlayState = 'running';
        turnTransitionTimer = null;
    }, TURN_TRANSITION_DURATION_MS);
}

function isSpaParentMessage(event) {
    if (!event || !window.parent || window.parent === window) {
        return false;
    }

    return event.source === window.parent;
}

// Инициализатор страницы tumski19: вызывает общий модуль и настраивает обработчики
document.addEventListener('DOMContentLoaded', async () => {
    // Эффект разворота камеры при загрузке / повторной активации tumski08.html
    runTurnTransitionForPage();

    window.addEventListener('message', (event) => {
        if (!isSpaParentMessage(event)) {
            return;
        }

        const data = event.data;
        if (!data || typeof data !== 'object') {
            return;
        }

        if (data.type === 'PAGE_SHOWN') {
            const shownPage = data.pageName || getCurrentPageName();
            if (shownPage === TURN_TRANSITION_PAGE || !data.pageName) {
                runTurnTransitionForPage(shownPage);
            }
        }
    });

    // Инициализируем общие обработчики страницы (включая стрелки)
    try {
        const common = await import('./tumski_page_common.js');
        if (common && typeof common.initPageCommon === 'function') {
            // console.log('🎵 Инициализируем обработчики стрелок для страницы:', window.location.pathname);
            await common.initPageCommon();
        }
    } catch (error) {
        console.error('🎵 Ошибка инициализации tumski_page_common:', error);
    }

    const playButton = document.getElementById('play-button');
    const video = document.getElementById('background-video');
    const image = document.querySelector('.image');

    // console.log('Инициализация кнопки play:', { playButton: !!playButton, video: !!video, image: !!image });

    if (!playButton && !video) {
        return;
    }

    if (!playButton || !video || !image) {
        debugWarn('Не все элементы найдены для кнопки play', {
            image: Boolean(image),
            playButton: Boolean(playButton),
            video: Boolean(video)
        });
        return;
    }

    playButton.addEventListener('click', () => {
        // console.log('Клик по кнопке play зарегистрирован');
        video.style.opacity = '1';
        video.playbackRate = 0.2; // Установить скорость воспроизведения на 0.5
        video.play().then(() => {
            // console.log('Видео начало воспроизведение');
        }).catch(err => {
            console.error('Ошибка при воспроизведении видео:', err);
        });
        image.style.zIndex = '0';
        video.style.zIndex = '1';
        playButton.style.display = 'none';
    });

    playButton.addEventListener('mousedown', () => {
        // console.log('mousedown на кнопке play');
    });

    playButton.addEventListener('mouseup', () => {
        // console.log('mouseup на кнопке play');
    });

    // console.log('Обработчик клика для кнопки play добавлен');
});
