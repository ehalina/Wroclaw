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
    if (window.musicIframe) return window.musicIframe;
    
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
                
                if (savedTime) {
                    audio.addEventListener('loadedmetadata', () => {
                        audio.currentTime = parseFloat(savedTime);
                    });
                }
                
                if (savedPaused !== '1') {
                    audio.play().catch(() => {});
                }
                
                // Сохраняем состояние каждые 2 секунды
                setInterval(() => {
                    localStorage.setItem('bgMusicTime', audio.currentTime);
                    localStorage.setItem('bgMusicPaused', audio.paused ? '1' : '0');
                }, 2000);
                
                // API для управления из родительского окна
                window.musicAPI = {
                    play: () => audio.play(),
                    pause: () => audio.pause(),
                    setVolume: (vol) => audio.volume = vol,
                    setMuted: (muted) => audio.muted = muted,
                    getCurrentTime: () => audio.currentTime,
                    isPaused: () => audio.paused
                };
            </script>
        </body>
        </html>
    `;
    
    document.body.appendChild(iframe);
    iframe.srcdoc = iframeHTML;
    
    window.musicIframe = iframe;
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
    // --- ГЛОБАЛЬНАЯ МУЗЫКА ЧЕРЕЗ IFRAME ---
    const musicIframe = createMusicIframe();
    const stepSound = ensureAudioElement('stepSound', 'media/step.wav');
    const musicHint = document.querySelector('#musicHint');
    const animationHint = document.querySelector('#animationHint');
    const isMuted = localStorage.getItem('soundMuted') === 'true';

    // Устанавливаем громкость для всех звуков
    if (stepSound) stepSound.volume = 0.7;
    if (mapSound) mapSound.volume = 0.7;

    // Принудительно выставляем mute для всех аудио-элементов
    if (stepSound) stepSound.muted = isMuted;
    if (mapSound) mapSound.muted = isMuted;

    // Управляем музыкой через iframe API
    const controlMusic = () => {
        if (musicIframe.contentWindow && musicIframe.contentWindow.musicAPI) {
            const api = musicIframe.contentWindow.musicAPI;
            api.setMuted(isMuted);
            
            if (!isMuted) {
                api.play().catch(() => {
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
            }
        } else {
            // Если iframe еще не загрузился, ждем
            setTimeout(controlMusic, 100);
        }
    };

    // Ждем загрузки iframe и управляем музыкой
    musicIframe.addEventListener('load', controlMusic);
    if (musicIframe.contentDocument && musicIframe.contentDocument.readyState === 'complete') {
        controlMusic();
    }

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