// Обработчик для страницы ogrod02.html - переключение музыки на town.mp3
import { initBackgroundMusic } from './background_music.js';

// Функция для переключения музыки на town.mp3
function switchToTownMusic() {
    // console.log('🏘️ Переключение музыки на town.mp3 для страницы ogrod02');
    
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
    // console.log('🏘️ Страница ogrod02 загружена, переключаем музыку на town.mp3');
    
    // Небольшая задержка для инициализации основного background_music.js
    setTimeout(() => {
        switchToTownMusic();
    }, 500);
});

// Экспортируем функцию для возможного использования извне
window.switchToTownMusic = switchToTownMusic;
