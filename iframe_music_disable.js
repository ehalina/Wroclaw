// Скрипт для отключения музыки в iframe
// Этот скрипт загружается в iframe и отключает все музыкальные системы

// console.log('🎵 iframe_music_disable.js загружен - отключаем музыку в iframe');

// Отключаем инициализацию фоновой музыки
if (window.initBackgroundMusic) {
    window.initBackgroundMusic = () => {
        // console.log('🎵 Музыка в iframe отключена (управляется из SPA)');
    };
}

// Отключаем все аудио элементы
document.addEventListener('DOMContentLoaded', () => {
    const audioElements = document.querySelectorAll('audio');
    audioElements.forEach(audio => {
        audio.pause();
        audio.muted = true;
        audio.volume = 0;
        // console.log('🎵 Аудио элемент отключен:', audio.id || audio.src);
    });
});

// Отключаем глобальные функции управления музыкой
window.muteIframeMusic = () => {
    // console.log('🎵 Музыка в iframe уже отключена');
};

window.unmuteIframeMusic = () => {
    // console.log('🎵 Музыка в iframe отключена (управляется из SPA)');
};

window.switchMusicSource = () => {
    // console.log('🎵 Переключение музыки в iframe отключено (управляется из SPA)');
};

// Отключаем обработчики кликов для музыки
document.addEventListener('click', (event) => {
    // Предотвращаем запуск музыки по клику в iframe
    if (event.target.closest('[data-music]') || event.target.closest('.music-hint')) {
        event.preventDefault();
        event.stopPropagation();
        // console.log('🎵 Клик по музыкальному элементу заблокирован в iframe');
    }
}, true);

// Отключаем все скрипты, связанные с музыкой
const scripts = document.querySelectorAll('script[src*="background_music"], script[src*="town_music"]');
scripts.forEach(script => {
    script.remove();
    // console.log('🎵 Музыкальный скрипт удален из iframe:', script.src);
});

// console.log('🎵 Музыка в iframe полностью отключена');
