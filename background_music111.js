// Управление фоновым воспроизведением музыки и звуков на всех страницах
function ensureAudioElement(id, src, loop = false) {
    let audio = document.getElementById(id);
    if (!audio) {
        audio = document.createElement('audio');
        audio.id = id;
        audio.src = src;
        if (loop) audio.loop = true;
        // Добавляем атрибуты для лучшей совместимости с iOS
        audio.preload = 'auto';
        audio.playsInline = true;
        audio.webkitPlaysInline = true;
        document.body.appendChild(audio);
    }
    return audio;
}

// Определяем iOS устройство
function isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
           (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

// Определяем Chrome на iOS
function isIOSChrome() {
    return isIOS() && /CriOS/.test(navigator.userAgent);
}

// Создание прямого аудио элемента для iOS (вместо iframe)
function createDirectAudioElement() {
    if (window.directMusicAudio) {
        console.log('🎵 Прямой аудио элемент уже существует, возвращаем существующий');
        return window.directMusicAudio;
    }
    console.log('🎵 Создаем прямой аудио элемент для iOS');
    
    const audio = document.createElement('audio');
    audio.id = 'persistentMusic';
    audio.src = 'media/zwyki/town.mp3';
    audio.loop = true;
    audio.preload = 'auto';
    audio.playsInline = true;
    audio.webkitPlaysInline = true;
    audio.volume = 0.5;
    
    // Сохраняем состояние каждые 2 секунды
    setInterval(() => {
        localStorage.setItem('bgMusicTime', audio.currentTime);
        localStorage.setItem('bgMusicPaused', audio.paused ? '1' : '0');
    }, 2000);
    
    document.body.appendChild(audio);
    window.directMusicAudio = audio;
    console.log('🎵 Прямой аудио элемент создан и добавлен в DOM');
    return audio;
}

// Создание iframe для непрерывного воспроизведения музыки (для не-iOS устройств)
function createMusicIframe() {
    if (window.musicIframe) {
        console.log('🎵 iframe уже существует, возвращаем существующий');
        return window.musicIframe;
    }
    console.log('🎵 Создаем новый iframe для музыки');
    
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.style.position = 'fixed';
    iframe.style.top = '-9999px';
    iframe.style.left = '-9999px';
    iframe.style.width = '1px';
    iframe.style.height = '1px';
    iframe.style.border = 'none';
    
    // Создаем HTML для iframe с аудио
    const iframeHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Music Player</title>
        </head>
        <body>
            <audio id="persistentMusic" src="media/zwyki/town.mp3" loop></audio>
            <script>
                const audio = document.getElementById('persistentMusic');
                audio.volume = 0.5;
                
                // Восстанавливаем состояние при загрузке
                const savedTime = localStorage.getItem('bgMusicTime');
                const savedPaused = localStorage.getItem('bgMusicPaused');
                console.log('🎵 iframe: восстановление состояния', { savedTime, savedPaused });
                
                if (savedTime) {
                    audio.addEventListener('loadedmetadata', () => {
                        audio.currentTime = parseFloat(savedTime);
                    });
                }
                
                // Автозапуск отключен - управляется через SPA
                console.log('🎵 iframe: автозапуск отключен - управляется через SPA');
                
                // Сохраняем состояние каждые 2 секунды
                setInterval(() => {
                    localStorage.setItem('bgMusicTime', audio.currentTime);
                    localStorage.setItem('bgMusicPaused', audio.paused ? '1' : '0');
                }, 2000);
                
                // API для управления из родительского окна
                window.musicAPI = {
                    play: () => {
                        console.log('🎵 iframe API: play вызван');
                        return audio.play();
                    },
                    pause: () => {
                        console.log('🎵 iframe API: pause вызван');
                        return audio.pause();
                    },
                    setVolume: (vol) => {
                        console.log('🎵 iframe API: setVolume', vol);
                        audio.volume = vol;
                    },
                    setMuted: (muted) => {
                        console.log('🎵 iframe API: setMuted', muted);
                        audio.muted = muted;
                    },
                    getCurrentTime: () => audio.currentTime,
                    setCurrentTime: (time) => { 
                        console.log('🎵 iframe API: setCurrentTime', time);
                        audio.currentTime = time; 
                    },
                    isPaused: () => audio.paused
                };
                console.log('🎵 iframe API создан');
            </script>
        </body>
        </html>
    `;
    
    document.body.appendChild(iframe);
    iframe.srcdoc = iframeHTML;
    
    window.musicIframe = iframe;
    console.log('🎵 iframe создан и добавлен в DOM');
    return iframe;
}

let mapSound = null;

// --- Сохранение и восстановление состояния фоновой музыки ---
function saveBackgroundMusicState() {
    const iframe = window.musicIframe;
    if (iframe && iframe.contentWindow && iframe.contentWindow.musicAPI) {
        try {
            const api = iframe.contentWindow.musicAPI;
            localStorage.setItem('bgMusicTime', String(api.getCurrentTime() || 0));
            localStorage.setItem('bgMusicPaused', api.isPaused() ? '1' : '0');
        } catch (_) {}
    }
}
window.saveBackgroundMusicState = saveBackgroundMusicState;

function getSavedBackgroundMusicState() {
    const timeStr = localStorage.getItem('bgMusicTime');
    const pausedStr = localStorage.getItem('bgMusicPaused');
    const time = timeStr != null ? parseFloat(timeStr) : NaN;
    const paused = pausedStr === '1';
    return { time, paused };
}

function restoreBackgroundMusicState(audio, isMuted) {
    const { time, paused } = getSavedBackgroundMusicState();

    // Отключаем автозапуск у возможного заранее созданного <audio autoplay>
    audio.autoplay = false;
    audio.removeAttribute('autoplay');
    audio.preload = 'auto';

    const setTime = () => {
        if (!isNaN(time) && isFinite(time)) {
            try { audio.currentTime = Math.max(0, time); } catch (_) {}
        }
    };

    if (audio.readyState >= 1) {
        setTime();
    } else {
        const onMeta = () => { setTime(); audio.removeEventListener('loadedmetadata', onMeta); };
        audio.addEventListener('loadedmetadata', onMeta, { once: true });
    }

    // Автозапуск отключен - управляется через SPA
    console.log('🎵 Прямой аудио элемент: автозапуск отключен - управляется через SPA');
    try { audio.pause(); } catch (_) {}
}

export function initBackgroundMusic() {
    console.log('🎵 Инициализация фоновой музыки...');
    console.log('🎵 Устройство:', { isIOS: isIOS(), isIOSChrome: isIOSChrome() });
    
    // Выбираем метод воспроизведения в зависимости от устройства
    let musicPlayer;
    if (isIOS()) {
        console.log('🎵 Используем прямой аудио элемент для iOS');
        musicPlayer = createDirectAudioElement();
    } else {
        console.log('🎵 Используем iframe для не-iOS устройств');
        musicPlayer = createMusicIframe();
    }
    
    const stepSound = ensureAudioElement('stepSound', 'media/step.wav');
    const musicHint = document.querySelector('#musicHint');
    const animationHint = document.querySelector('#animationHint');
    const soundMuted = localStorage.getItem('soundMuted');
    const isMuted = soundMuted === 'true';
    console.log('🎵 Состояние звука:', { isMuted, soundMuted, isSoundEnabled: soundMuted !== 'true' });

    // Устанавливаем громкость для всех звуков
    if (stepSound) stepSound.volume = 1.0; // Максимальная громкость для step.wav
    if (mapSound) mapSound.volume = 0.7;

    // Принудительно выставляем mute для всех аудио-элементов
    if (stepSound) stepSound.muted = isMuted;
    if (mapSound) mapSound.muted = isMuted;
    
    // Создаем универсальный API для управления музыкой
    const musicAPI = {
        play: () => {
            if (isIOS()) {
                return musicPlayer.play();
            } else {
                return musicPlayer.contentWindow.musicAPI.play();
            }
        },
        pause: () => {
            if (isIOS()) {
                return musicPlayer.pause();
            } else {
                return musicPlayer.contentWindow.musicAPI.pause();
            }
        },
        setVolume: (vol) => {
            if (isIOS()) {
                musicPlayer.volume = vol;
            } else {
                musicPlayer.contentWindow.musicAPI.setVolume(vol);
            }
        },
        setMuted: (muted) => {
            if (isIOS()) {
                musicPlayer.muted = muted;
            } else {
                musicPlayer.contentWindow.musicAPI.setMuted(muted);
            }
        },
        getCurrentTime: () => {
            if (isIOS()) {
                return musicPlayer.currentTime;
            } else {
                return musicPlayer.contentWindow.musicAPI.getCurrentTime();
            }
        },
        setCurrentTime: (time) => {
            if (isIOS()) {
                musicPlayer.currentTime = time;
            } else {
                musicPlayer.contentWindow.musicAPI.setCurrentTime(time);
            }
        },
        isPaused: () => {
            if (isIOS()) {
                return musicPlayer.paused;
            } else {
                return musicPlayer.contentWindow.musicAPI.isPaused();
            }
        },
        setSrc: (src) => {
            if (isIOS()) {
                musicPlayer.src = src;
                musicPlayer.load();
            } else {
                const audio = musicPlayer.contentDocument.getElementById('persistentMusic');
                if (audio) {
                    audio.src = src;
                    audio.load();
                }
            }
        }
    };
    
    // Добавляем глобальные функции для управления музыкой
    window.muteIframeMusic = () => {
        musicAPI.setMuted(true);
    };
    
    window.unmuteIframeMusic = () => {
        musicAPI.setMuted(false);
    };

    // Управляем музыкой через универсальный API
    const controlMusic = () => {
        console.log('🎵 controlMusic вызвана');
        
        // Проверяем, инициализирована ли SPA
        if (typeof window.spaMusicStopped === 'undefined') {
            console.log('🎵 SPA еще не инициализирована, ждем...');
            setTimeout(controlMusic, 100);
            return;
        }
        
        // Проверяем, не остановила ли SPA музыку для специальных страниц
        if (window.spaMusicStopped) {
            console.log('🎵 SPA остановила музыку для специальной страницы, не запускаем town.mp3');
            return;
        }
        
        // Для iOS проверяем готовность прямого аудио элемента
        if (isIOS()) {
            if (musicPlayer.readyState >= 1) {
                console.log('🎵 Прямой аудио элемент готов');
                musicAPI.setMuted(isMuted);
            } else {
                console.log('🎵 Прямой аудио элемент еще не готов, ждем...');
                setTimeout(controlMusic, 100);
                return;
            }
        } else {
            // Для не-iOS проверяем готовность iframe API
            if (musicPlayer.contentWindow && musicPlayer.contentWindow.musicAPI) {
                console.log('🎵 iframe API доступен');
                musicAPI.setMuted(isMuted);
            } else {
                console.log('🎵 iframe API не доступен, ждем...');
                setTimeout(controlMusic, 100);
                return;
            }
        }
        
        // Восстанавливаем состояние при обновлении страницы
        const savedTime = localStorage.getItem('bgMusicTime');
        const savedPaused = localStorage.getItem('bgMusicPaused');
        
        if (savedTime && !isNaN(parseFloat(savedTime))) {
            musicAPI.setCurrentTime(parseFloat(savedTime));
        }
        
        // Проверяем, нужно ли переключать музыку на основе текущей страницы
        const currentPage = window.location.pathname;
        let targetMusic = 'media/zwyki/town.mp3'; // По умолчанию
        
        // Определяем нужную музыку на основе страницы
        if (currentPage.includes('ogrod03.html') || 
            currentPage.includes('ogrod04.html') || 
            currentPage.includes('ogrod05.html') || 
            currentPage.includes('ogrod06.html') || 
            currentPage.includes('ogrod07.html') || 
            currentPage.includes('ogrod08.html') || 
            currentPage.includes('ogrod09.html')) {
            // Позволяем SPA управлять музыкой для ogrod страниц
            console.log('🎵 Позволяем SPA управлять музыкой (ogrod03-ogrod09)');
            return;
        } else if (currentPage.includes('tumski21.html')) {
            // Позволяем SPA управлять музыкой для tumski21
            console.log('🎵 Позволяем SPA управлять музыкой (tumski21)');
            return;
        } else if (currentPage.includes('tumski20.html')) {
            // Позволяем SPA управлять музыкой для tumski20
            console.log('🎵 Позволяем SPA управлять музыкой (tumski20)');
            return;
        } else if (currentPage.includes('tumski19.html')) {
            // Позволяем SPA управлять музыкой для tumski19
            console.log('🎵 Позволяем SPA управлять музыкой (tumski19)');
            return;
        } else {
            // Для всех остальных страниц используем town.mp3
            targetMusic = 'media/zwyki/town.mp3';
        }
        
        // Если нужно переключить музыку, делаем это
        if (targetMusic === '') {
            musicAPI.pause();
            console.log('🎵 Музыка отключена для текущей страницы');
        } else {
            const currentSrc = isIOS() ? musicPlayer.src : musicPlayer.contentDocument.getElementById('persistentMusic').src;
            if (!currentSrc.includes(targetMusic.split('/').pop())) {
                console.log('🎵 Переключаем музыку с', currentSrc, 'на', targetMusic);
                musicAPI.setSrc(targetMusic);
                return; // Выходим, чтобы не запускать старую музыку
            } else {
                console.log('🎵 Правильная музыка уже загружена:', targetMusic);
                // Если правильная музыка уже загружена, просто убеждаемся что она играет
                if (!isMuted && musicAPI.isPaused()) {
                    console.log('🎵 Возобновляем воспроизведение правильной музыки');
                    musicAPI.play().catch(console.log);
                }
                return; // Выходим, не нужно ничего больше делать
            }
        }
        
        // Всегда пытаемся запустить музыку, если не выключена и targetMusic не пустой
        if (!isMuted && targetMusic !== '') {
            console.log('🎵 Автозапуск отключен - управляется через SPA');
        } else {
            console.log('🎵 Музыка отключена (muted)');
        }
    };

    // Инициализируем музыку в зависимости от устройства
    if (isIOS()) {
        // Для iOS используем прямую инициализацию
        console.log('🎵 iOS: инициализируем прямой аудио элемент');
        musicPlayer.addEventListener('loadedmetadata', () => {
            console.log('🎵 iOS: метаданные загружены');
            controlMusic();
        });
        
        // Если метаданные уже загружены
        if (musicPlayer.readyState >= 1) {
            setTimeout(controlMusic, 100);
        }
    } else {
        // Для не-iOS используем iframe
        musicPlayer.addEventListener('load', () => {
            console.log('🎵 iframe загружен, ждем немного для инициализации API');
            setTimeout(() => {
                controlMusic();
            }, 100);
        });
        
        musicPlayer.addEventListener('error', (error) => {
            console.log('🎵 Ошибка загрузки iframe:', error);
        });
        
        if (musicPlayer.contentDocument && musicPlayer.contentDocument.readyState === 'complete') {
            console.log('🎵 iframe уже загружен, вызываем controlMusic');
            setTimeout(() => {
                controlMusic();
            }, 100);
        } else {
            console.log('🎵 iframe еще не загружен, ждем события load');
        }
        
        // Дополнительная проверка через 2 секунды на случай медленной загрузки
        setTimeout(() => {
            if (musicPlayer.contentWindow && musicPlayer.contentWindow.musicAPI) {
                console.log('🎵 Дополнительная проверка: iframe API доступен');
                controlMusic();
            } else {
                console.log('🎵 Дополнительная проверка: iframe API все еще недоступен');
            }
        }, 2000);
    }

    // Принудительный запуск музыки отключен - управляется через SPA
    console.log('🎵 Принудительный запуск музыки отключен - управляется через SPA');

    // Эмуляция клика отключена - управляется через SPA
    console.log('🎵 Эмуляция клика отключена - управляется через SPA');
    

    // Универсальный обработчик для воспроизведения звука (с учётом mute)
    function playSound(sound) {
        if (!isMuted && sound) {
            sound.currentTime = 0;
            sound.play();
        }
    }

    // Глобальный обработчик клика отключен - управляется через SPA
    console.log('🎵 Глобальный обработчик клика отключен - управляется через SPA');

    // Глобальные функции для воспроизведения шагов и карты
    window.playStepSound = () => playSound(stepSound);
    window.playMapSound = () => {
        if (!mapSound) {
            mapSound = ensureAudioElement('mapSound', 'media/zwyki/bb6f2b8ec908f28.mp3');
            mapSound.volume = 0.7;
            mapSound.muted = isMuted;
        }
        playSound(mapSound);
    };

    // Сохраняем состояние при сворачивании/уходе со страницы
    const saveIfHidden = () => { if (document.hidden) saveBackgroundMusicState(); };
    document.addEventListener('visibilitychange', saveIfHidden);
    window.addEventListener('pagehide', saveBackgroundMusicState);
    window.addEventListener('beforeunload', saveBackgroundMusicState);
}

// Функция для плавного переключения музыки без прерывания
function switchMusicSource(newSrc) {
    console.log('🎵 Переключение музыки на:', newSrc);
    
    try {
        // Сохраняем текущее состояние
        const isMuted = localStorage.getItem('soundMuted') === 'true';
        
        // Сначала останавливаем ВСЮ музыку
        console.log('🎵 Останавливаем всю музыку перед переключением');
        if (window.musicIframe && window.musicIframe.contentWindow && window.musicIframe.contentWindow.musicAPI) {
            window.musicIframe.contentWindow.musicAPI.pause();
        }
        if (window.directMusicAudio) {
            window.directMusicAudio.pause();
        }
        
        // Принудительно останавливаем все аудио элементы на странице
        const allAudioElements = document.querySelectorAll('audio');
        allAudioElements.forEach(audio => {
            audio.pause();
            audio.currentTime = 0;
        });
        
        // Также останавливаем аудио в iframe
        if (window.musicIframe && window.musicIframe.contentDocument) {
            const iframeAudioElements = window.musicIframe.contentDocument.querySelectorAll('audio');
            iframeAudioElements.forEach(audio => {
                audio.pause();
                audio.currentTime = 0;
            });
        }
        
        if (isIOS()) {
            // Для iOS используем прямой аудио элемент
            const audio = window.directMusicAudio;
            if (audio) {
                // Сначала ставим на паузу, чтобы избежать проигрывания старой музыки
                audio.pause();
                
                // Плавно переключаем на новый источник
                audio.src = newSrc;
                audio.load(); // Перезагружаем аудио с новым источником
                
                // Восстанавливаем состояние после загрузки
                audio.addEventListener('loadedmetadata', () => {
                    // Для разных музыкальных треков не восстанавливаем время, начинаем с начала
                    audio.currentTime = 0;
                    audio.muted = isMuted;
                    
                    // Увеличенная задержка перед воспроизведением, чтобы избежать проигрывания старой музыки
                    setTimeout(() => {
                        if (!isMuted) {
                            audio.play().catch(console.log);
                        }
                    }, 300);
                }, { once: true });
                
                console.log('🎵 Музыка переключена на', newSrc, 'без прерывания (iOS)');
            } else {
                console.log('🎵 Прямой аудио элемент не найден');
            }
        } else {
            // Для не-iOS используем iframe
            const musicIframe = window.musicIframe;
            if (musicIframe && musicIframe.contentWindow && musicIframe.contentWindow.musicAPI) {
                const api = musicIframe.contentWindow.musicAPI;
                
                // Сохраняем текущее состояние
                const isPaused = api.isPaused();
                
                // Обновляем источник музыки в iframe
                const audio = musicIframe.contentDocument.getElementById('persistentMusic');
                if (audio) {
                    // Сначала ставим на паузу, чтобы избежать проигрывания старой музыки
                    audio.pause();
                    
                    // Плавно переключаем на новый источник
                    audio.src = newSrc;
                    audio.load(); // Перезагружаем аудио с новым источником
                    
                    // Восстанавливаем состояние после загрузки
                    audio.addEventListener('loadedmetadata', () => {
                        // Для разных музыкальных треков не восстанавливаем время, начинаем с начала
                        audio.currentTime = 0;
                        audio.muted = isMuted;
                        
                        // Увеличенная задержка перед воспроизведением, чтобы избежать проигрывания старой музыки
                        setTimeout(() => {
                            if (!isPaused && !isMuted) {
                                audio.play().catch(console.log);
                            }
                        }, 300);
                    }, { once: true });
                    
                    console.log('🎵 Музыка переключена на', newSrc, 'без прерывания (iframe)');
                } else {
                    console.log('🎵 Аудио элемент не найден в iframe');
                }
            } else {
                console.log('🎵 iframe API недоступен для переключения музыки');
            }
        }
    } catch (error) {
        console.error('🎵 Ошибка при переключении музыки:', error);
    }
}

// Глобальная функция для переключения музыки
window.switchMusicSource = switchMusicSource;

// --- Глобальное сохранение состояния музыки при переходах ---
function globalMusicStateSaver(e) {
    let el = e.target;
    while (el && el !== document.body) {
        if (
            (el.tagName === 'A' && el.href) ||
            (el.tagName === 'BUTTON' && (el.type === 'submit' || el.type === 'button' || el.onclick)) ||
            (el.dataset && (el.dataset.prevPage || el.dataset.nextPage))
        ) {
            if (window.saveBackgroundMusicState) window.saveBackgroundMusicState();
            break;
        }
        el = el.parentElement;
    }
}
document.addEventListener('click', globalMusicStateSaver, true);

// --- Специальная обработка для iOS устройств отключена - управляется через SPA ---
console.log('🎵 iOS обработчики отключены - управляется через SPA'); 