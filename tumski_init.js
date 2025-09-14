// Инициализатор страницы tumski19: вызывает общий модуль и настраивает обработчики
document.addEventListener('DOMContentLoaded', async () => {
    // Эффект разворота камеры при загрузке tumski08.html
    const imageContainer = document.querySelector('.image-container');
    if (imageContainer) {
        console.log('🔄 Запускаем эффект разворота камеры при загрузке tumski08.html');
        
        // Останавливаем стандартную анимацию
        imageContainer.style.animationPlayState = 'paused';
        
        // Запускаем анимацию разворота
        imageContainer.classList.add('rotate-transition');
        
        // После завершения разворота запускаем стандартную анимацию движения
        setTimeout(() => {
            imageContainer.classList.remove('rotate-transition');
            imageContainer.style.animationPlayState = 'running';
        }, 1500);
    }

    // Инициализируем общие обработчики страницы (включая стрелки)
    try {
        const common = await import('./tumski_page_common.js');
        if (common && typeof common.initPageCommon === 'function') {
            console.log('🎵 Инициализируем обработчики стрелок для страницы:', window.location.pathname);
            await common.initPageCommon();
        }
    } catch (error) {
        console.error('🎵 Ошибка инициализации tumski_page_common:', error);
    }

    const playButton = document.getElementById('play-button');
    const video = document.getElementById('background-video');
    const image = document.querySelector('.image');
    
    console.log('Инициализация кнопки play:', { playButton: !!playButton, video: !!video, image: !!image });
    
    if (playButton && video && image) {
        playButton.addEventListener('click', () => {
            console.log('Клик по кнопке play зарегистрирован');
            video.style.opacity = '1';
            video.playbackRate = 0.2; // Установить скорость воспроизведения на 0.5
            video.play().then(() => {
                console.log('Видео начало воспроизведение');
            }).catch(err => {
                console.error('Ошибка при воспроизведении видео:', err);
            });
            image.style.zIndex = '0';
            video.style.zIndex = '1';
            playButton.style.display = 'none';
        });
        
        playButton.addEventListener('mousedown', () => {
            console.log('mousedown на кнопке play');
        });
        
        playButton.addEventListener('mouseup', () => {
            console.log('mouseup на кнопке play');
        });
        
        console.log('Обработчик клика для кнопки play добавлен');
    } else {
        console.error('Не все элементы найдены для кнопки play');
    }
});


