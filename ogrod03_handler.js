// Обработчик для страницы ogrod03.html - переключение музыки на birds.mp3
import { initBackgroundMusic } from './background_music.js';

// Функция для переключения музыки на birds.mp3
function switchToBirdsMusic() {
    console.log('🐦 Переключение музыки на birds.mp3 для страницы ogrod03');
    
    // Используем глобальную функцию для плавного переключения
    if (window.switchMusicSource) {
        window.switchMusicSource('media/zwyki/birds.mp3');
    } else {
        console.log('🐦 switchMusicSource недоступна, ждем...');
        setTimeout(switchToBirdsMusic, 100);
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    console.log('🐦 Страница ogrod03 загружена, переключаем музыку на birds.mp3');
    
    // Небольшая задержка для инициализации основного background_music.js
    setTimeout(() => {
        switchToBirdsMusic();
    }, 500);
});

// Экспортируем функцию для возможного использования извне
window.switchToBirdsMusic = switchToBirdsMusic;
