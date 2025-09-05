// Управление фоновым воспроизведением музыки и звуков на всех страницах
function ensureAudioElement(id, src, loop = false) {
    let audio = document.getElementById(id);
    if (!audio) {
        audio = document.createElement('audio');
        audio.id = id;
        audio.src = src;
        if (loop) audio.loop = true;
        document.body.appendChild(audio);
    }
    return audio;
}

// Создание iframe для непрерывного воспроизведения музыки
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
                
                // Пытаемся запустить музыку, если она не была явно поставлена на паузу
                if (savedPaused !== '1') {
                    console.log('🎵 iframe: пытаемся запустить музыку');
                    audio.play().catch((error) => {
                        console.log('🎵 iframe: ошибка воспроизведения', error);
                    });
                } else {
                    console.log('🎵 iframe: музыка была на паузе, не запускаем');
                }
                
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

    // Если раньше играло и не muted — запустить; иначе оставить паузу
    if (!paused && !isMuted) {
        const tryPlay = () => {
            audio.play().catch(() => {
                // Автовоспроизведение может быть заблокировано; стартнем по первому клику
                const starter = () => { audio.play().finally(() => document.removeEventListener('click', starter)); };
                document.addEventListener('click', starter, { once: true });
            });
        };
        if (audio.readyState >= 2) {
            tryPlay();
        } else {
            const onCanPlay = () => { tryPlay(); audio.removeEventListener('canplay', onCanPlay); };
            audio.addEventListener('canplay', onCanPlay, { once: true });
        }
    } else {
        try { audio.pause(); } catch (_) {}
    }
}

export function initBackgroundMusic() {
    console.log('🎵 Инициализация фоновой музыки...');
    // --- ГЛОБАЛЬНАЯ МУЗЫКА ЧЕРЕЗ IFRAME ---
    const musicIframe = createMusicIframe();
    const stepSound = ensureAudioElement('stepSound', 'media/step.wav');
    const musicHint = document.querySelector('#musicHint');
    const animationHint = document.querySelector('#animationHint');
    const isMuted = localStorage.getItem('soundMuted') === 'true';
    console.log('🎵 Состояние звука:', { isMuted, soundMuted: localStorage.getItem('soundMuted') });

    // Устанавливаем громкость для всех звуков
    if (stepSound) stepSound.volume = 0.7;
    if (mapSound) mapSound.volume = 0.7;

    // Принудительно выставляем mute для всех аудио-элементов
    if (stepSound) stepSound.muted = isMuted;
    if (mapSound) mapSound.muted = isMuted;
    
    // Добавляем глобальные функции для управления iframe музыкой
    window.muteIframeMusic = () => {
        if (musicIframe && musicIframe.contentWindow && musicIframe.contentWindow.musicAPI) {
            musicIframe.contentWindow.musicAPI.setMuted(true);
        }
    };
    
    window.unmuteIframeMusic = () => {
        if (musicIframe && musicIframe.contentWindow && musicIframe.contentWindow.musicAPI) {
            musicIframe.contentWindow.musicAPI.setMuted(false);
        }
    };

    // Управляем музыкой через iframe API
    const controlMusic = () => {
        console.log('🎵 controlMusic вызвана');
        if (musicIframe.contentWindow && musicIframe.contentWindow.musicAPI) {
            console.log('🎵 iframe API доступен');
            const api = musicIframe.contentWindow.musicAPI;
            console.log('🎵 iframe API методы:', Object.keys(api));
            api.setMuted(isMuted);
            
            // Восстанавливаем состояние при обновлении страницы
            const savedTime = localStorage.getItem('bgMusicTime');
            const savedPaused = localStorage.getItem('bgMusicPaused');
            
            if (savedTime && !isNaN(parseFloat(savedTime))) {
                api.setCurrentTime(parseFloat(savedTime));
            }
            
            // Всегда пытаемся запустить музыку, если не выключена
            if (!isMuted) {
                console.log('🎵 Пытаемся запустить музыку...', { isMuted, savedPaused });
                api.play().catch((error) => {
                    console.log('🎵 Ошибка воспроизведения:', error);
                    if (musicHint) {
                        musicHint.style.display = 'block';
                        setTimeout(() => {
                            musicHint.style.display = 'none';
                            if (animationHint) {
                                animationHint.style.display = 'block';
                                setTimeout(() => { animationHint.style.display = 'none'; }, 6000);
                            }
                        }, 6000);
                    }
                    const startMusicOnClick = () => {
                        api.play().finally(() => document.removeEventListener('click', startMusicOnClick));
                    };
                    document.addEventListener('click', startMusicOnClick, { once: true });
                });
            } else {
                console.log('🎵 Музыка отключена (muted)');
            }
        } else {
            // Если iframe еще не загрузился, ждем
            console.log('🎵 iframe API не доступен, ждем...', {
                contentWindow: !!musicIframe.contentWindow,
                musicAPI: !!(musicIframe.contentWindow && musicIframe.contentWindow.musicAPI)
            });
            setTimeout(controlMusic, 100);
        }
    };

    // Ждем загрузки iframe и управляем музыкой
    musicIframe.addEventListener('load', () => {
        console.log('🎵 iframe загружен, ждем немного для инициализации API');
        setTimeout(() => {
            controlMusic();
        }, 100);
    });
    
    musicIframe.addEventListener('error', (error) => {
        console.log('🎵 Ошибка загрузки iframe:', error);
    });
    
    if (musicIframe.contentDocument && musicIframe.contentDocument.readyState === 'complete') {
        console.log('🎵 iframe уже загружен, вызываем controlMusic');
        setTimeout(() => {
            controlMusic();
        }, 100);
    } else {
        console.log('🎵 iframe еще не загружен, ждем события load');
    }
    
    // Дополнительная проверка через 2 секунды на случай медленной загрузки
    setTimeout(() => {
        if (musicIframe.contentWindow && musicIframe.contentWindow.musicAPI) {
            console.log('🎵 Дополнительная проверка: iframe API доступен');
            controlMusic();
        } else {
            console.log('🎵 Дополнительная проверка: iframe API все еще недоступен');
        }
    }, 2000);

    // Универсальный обработчик для воспроизведения звука (с учётом mute)
    function playSound(sound) {
        if (!isMuted && sound) {
            sound.currentTime = 0;
            sound.play();
        }
    }

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