// Обработчик для страницы ogrod03.html - переключение музыки на birds.mp3
import { initBackgroundMusic } from './background_music.js';

// Функция для переключения музыки на birds.mp3
function switchToBirdsMusic() {
    console.log('🐦 Переключение музыки на birds.mp3 для страницы ogrod03');
    
    const musicIframe = window.musicIframe;
    if (musicIframe && musicIframe.contentWindow && musicIframe.contentWindow.musicAPI) {
        try {
            const api = musicIframe.contentWindow.musicAPI;
            
            // Сохраняем текущее время воспроизведения и состояние звука
            const currentTime = api.getCurrentTime();
            const isPaused = api.isPaused();
            const isMuted = localStorage.getItem('soundMuted') === 'true';
            console.log('🐦 Состояние звука:', { isMuted, soundMuted: localStorage.getItem('soundMuted') });
            
            // Создаем новый iframe с birds.mp3
            const newIframe = document.createElement('iframe');
            newIframe.style.display = 'none';
            newIframe.style.position = 'fixed';
            newIframe.style.top = '-9999px';
            newIframe.style.left = '-9999px';
            newIframe.style.width = '1px';
            newIframe.style.height = '1px';
            newIframe.style.border = 'none';
            
            // Создаем HTML для iframe с birds.mp3
            const iframeHTML = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>Birds Music Player</title>
                </head>
                <body>
                    <audio id="persistentMusic" src="media/zwyki/birds.mp3" loop></audio>
                    <script>
                        const audio = document.getElementById('persistentMusic');
                        audio.volume = 0.5;
                        
                        // Восстанавливаем состояние при загрузке
                        const savedTime = localStorage.getItem('bgMusicTime');
                        const savedPaused = localStorage.getItem('bgMusicPaused');
                        console.log('🐦 iframe: восстановление состояния', { savedTime, savedPaused });
                        
                        if (savedTime) {
                            audio.addEventListener('loadedmetadata', () => {
                                audio.currentTime = parseFloat(savedTime);
                            });
                        }
                        
                        // Проверяем состояние звука из localStorage
                        const soundMuted = localStorage.getItem('soundMuted') === 'true';
                        audio.muted = soundMuted;
                        
                        if (savedPaused !== '1' && !soundMuted) {
                            console.log('🐦 iframe: пытаемся запустить музыку birds');
                            audio.play().catch((error) => {
                                console.log('🐦 iframe: ошибка воспроизведения', error);
                            });
                        } else {
                            console.log('🐦 iframe: музыка была на паузе или звук отключен, не запускаем');
                        }
                        
                        // Сохраняем состояние каждые 2 секунды
                        setInterval(() => {
                            localStorage.setItem('bgMusicTime', audio.currentTime);
                            localStorage.setItem('bgMusicPaused', audio.paused ? '1' : '0');
                        }, 2000);
                        
                        // API для управления из родительского окна
                        window.musicAPI = {
                            play: () => {
                                console.log('🐦 iframe API: play вызван');
                                return audio.play();
                            },
                            pause: () => {
                                console.log('🐦 iframe API: pause вызван');
                                return audio.pause();
                            },
                            setVolume: (vol) => {
                                console.log('🐦 iframe API: setVolume', vol);
                                audio.volume = vol;
                            },
                            setMuted: (muted) => {
                                console.log('🐦 iframe API: setMuted', muted);
                                audio.muted = muted;
                            },
                            getCurrentTime: () => audio.currentTime,
                            setCurrentTime: (time) => { 
                                console.log('🐦 iframe API: setCurrentTime', time);
                                audio.currentTime = time; 
                            },
                            isPaused: () => audio.paused
                        };
                        console.log('🐦 iframe API создан');
                    </script>
                </body>
                </html>
            `;
            
            // Удаляем старый iframe
            if (window.musicIframe) {
                document.body.removeChild(window.musicIframe);
            }
            
            // Добавляем новый iframe
            document.body.appendChild(newIframe);
            newIframe.srcdoc = iframeHTML;
            window.musicIframe = newIframe;
            
            // Обновляем глобальные функции для работы с новым iframe
            window.muteIframeMusic = () => {
                if (window.musicIframe && window.musicIframe.contentWindow && window.musicIframe.contentWindow.musicAPI) {
                    window.musicIframe.contentWindow.musicAPI.setMuted(true);
                }
            };
            
            window.unmuteIframeMusic = () => {
                if (window.musicIframe && window.musicIframe.contentWindow && window.musicIframe.contentWindow.musicAPI) {
                    window.musicIframe.contentWindow.musicAPI.setMuted(false);
                }
            };
            
            console.log('🐦 iframe с birds.mp3 создан и добавлен в DOM');
            
            // Восстанавливаем состояние после загрузки
            newIframe.addEventListener('load', () => {
                setTimeout(() => {
                    if (newIframe.contentWindow && newIframe.contentWindow.musicAPI) {
                        const api = newIframe.contentWindow.musicAPI;
                        api.setCurrentTime(currentTime);
                        api.setMuted(isMuted);
                        if (!isPaused && !isMuted) {
                            api.play().catch(console.log);
                        }
                        
                        // Обновляем глобальные функции после загрузки iframe
                        window.muteIframeMusic = () => {
                            if (window.musicIframe && window.musicIframe.contentWindow && window.musicIframe.contentWindow.musicAPI) {
                                window.musicIframe.contentWindow.musicAPI.setMuted(true);
                            }
                        };
                        
                        window.unmuteIframeMusic = () => {
                            if (window.musicIframe && window.musicIframe.contentWindow && window.musicIframe.contentWindow.musicAPI) {
                                window.musicIframe.contentWindow.musicAPI.setMuted(false);
                            }
                        };
                        
                        console.log('🐦 Глобальные функции обновлены для birds.mp3');
                    }
                }, 100);
            });
            
        } catch (error) {
            console.error('🐦 Ошибка при переключении музыки:', error);
        }
    } else {
        console.log('🐦 iframe API недоступен, ждем...');
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
