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

let turnTransitionTimer = null;
const PAGE_TRANSITION_CONFIG_SOURCE = (() => {
    const sourceConfig = window.SpaConfig || (window.parent && window.parent !== window ? window.parent.SpaConfig : null);
    return (sourceConfig && typeof sourceConfig.getPageTransitionConfig === 'function')
        ? sourceConfig
        : null;
})();

function getPageTransitionConfig(pageName, transitionContext = {}) {
    if (!PAGE_TRANSITION_CONFIG_SOURCE) {
        return null;
    }

    return PAGE_TRANSITION_CONFIG_SOURCE.getPageTransitionConfig(pageName, {
        document: window.document,
        window,
        transition: transitionContext && transitionContext.transition,
        sourcePage: transitionContext && transitionContext.sourcePage
    });
}

function getCurrentPageName() {
    return (window.location.pathname.split('/').pop() || '').split('?')[0];
}

function runTurnTransitionForPage(pageName = getCurrentPageName()) {
    const config = getPageTransitionConfig(pageName);
    if (!config) {
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
    imageContainer.classList.remove(config.animationClass);
    void imageContainer.offsetWidth;
    imageContainer.classList.add(config.animationClass);

    turnTransitionTimer = window.setTimeout(() => {
        imageContainer.classList.remove(config.animationClass);
        imageContainer.style.animationPlayState = 'running';
        turnTransitionTimer = null;
    }, config.durationMs);
}

function isSpaParentMessage(event) {
    if (!event || !window.parent || window.parent === window) {
        return false;
    }

    return event.source === window.parent;
}

// Инициализатор страницы: запускает общий модуль и настраивает обработчики
document.addEventListener('DOMContentLoaded', async () => {
    // Эффект разворота камеры при загрузке / повторной активации страницы
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
            const transitionContext = data
                ? {
                    transition: data.transition || null,
                    sourcePage: data.sourcePage || null
                }
                : null;

            if (getPageTransitionConfig(shownPage, transitionContext)) {
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
