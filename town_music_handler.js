// Универсальный обработчик для страниц с town.mp3
// Используется на страницах, где должна играть town.mp3

// Функция для переключения музыки на town.mp3
function switchToTownMusic() {
    // console.log('🏘️ Переключение музыки на town.mp3');
    
    // Используем глобальную функцию для плавного переключения
    if (window.switchMusicSource) {
        window.switchMusicSource('media/zwyki/town.mp3');
    } else {
    // console.log('🏘️ switchMusicSource недоступна, ждем...');
        setTimeout(switchToTownMusic, 100);
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // console.log('🏘️ Страница загружена, переключаем музыку на town.mp3');
    
    // Небольшая задержка для инициализации основного background_music.js
    setTimeout(() => {
        switchToTownMusic();
    }, 500);
});

// Экспортируем функцию для возможного использования извне
window.switchToTownMusic = switchToTownMusic;
