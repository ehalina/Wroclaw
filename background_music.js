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
    const isMuted = localStorage.getItem('soundMuted') === 'true';
    console.log('🎵 Состояние звука:', { isMuted, soundMuted: localStorage.getItem('soundMuted') });

    // Устанавливаем громкость для всех звуков
    if (stepSound) stepSound.volume = 0.7;
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
            targetMusic = 'media/zwyki/birds.mp3';
        } else if (currentPage.includes('tumski21.html')) {
            targetMusic = ''; // Отключаем музыку для tumski21.html, оставляем только hang.mp3
        } else if (currentPage.includes('tumski19.html')) {
            targetMusic = 'media/zwyki/kostel.mp3'; // Включаем kostel для tumski19.html
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
            console.log('🎵 Пытаемся запустить музыку...', { isMuted, savedPaused });
            
            // Принудительный запуск музыки при перезагрузке страницы
            const forcePlayMusic = () => {
                console.log('🎵 Принудительный запуск музыки...');
                musicAPI.play().then(() => {
                    console.log('🎵 Музыка успешно запущена');
                }).catch((error) => {
                    console.log('🎵 Ошибка принудительного воспроизведения:', error);
                    // Если автовоспроизведение заблокировано, показываем подсказку
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
                });
            };
            
            // Пытаемся запустить сразу
            musicAPI.play().catch((error) => {
                console.log('🎵 Ошибка воспроизведения:', error);
                
                // Если автовоспроизведение заблокировано, пробуем принудительно через небольшую задержку
                setTimeout(() => {
                    forcePlayMusic();
                }, 500);
                
                // Также показываем подсказку пользователю
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
            });
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

    // Принудительный запуск музыки при полной загрузке страницы
    const forceMusicOnLoad = () => {
        console.log('🎵 Принудительный запуск музыки при загрузке страницы');
        
        // Проверяем текущую страницу
        const currentPage = window.location.pathname;
        if (currentPage.includes('tumski21.html')) {
            console.log('🎵 Страница tumski21.html - не запускаем town.mp3');
            return;
        }
        
        const isMuted = localStorage.getItem('soundMuted') === 'true';
        
        if (!isMuted) {
            console.log('🎵 Звук включен, принудительно запускаем музыку');
            musicAPI.play().catch((error) => {
                console.log('🎵 Ошибка принудительного запуска:', error);
            });
        }
    };

    // Запускаем принудительно после полной загрузки страницы
    if (document.readyState === 'complete') {
        setTimeout(forceMusicOnLoad, 1000);
    } else {
        window.addEventListener('load', () => {
            setTimeout(forceMusicOnLoad, 1000);
        });
    }

    // Эмуляция клика в нулевом пикселе для запуска фоновой музыки
    function simulateClickForMusic() {
        console.log('🎵 Эмулируем клик для запуска музыки');
        
        // Проверяем текущую страницу
        const currentPage = window.location.pathname;
        if (currentPage.includes('tumski21.html')) {
            console.log('🎵 Страница tumski21.html - не эмулируем клик');
            return;
        }
        
        // Проверяем, включен ли звук
        const isSoundEnabled = localStorage.getItem('soundMuted') !== 'true';
        if (!isSoundEnabled) {
            console.log('🎵 Звук отключен - не эмулируем клик');
            return;
        }
        
        // Создаем и отправляем событие клика в нулевом пикселе
        const clickEvent = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true,
            clientX: 0,
            clientY: 0,
            screenX: 0,
            screenY: 0
        });
        
        // Отправляем событие на document
        document.dispatchEvent(clickEvent);
        console.log('🎵 Клик эмулирован в координатах (0,0)');
    }

    // Запускаем эмуляцию клика с небольшой задержкой после инициализации
    document.addEventListener("DOMContentLoaded", () => {
        simulateClickForMusic();
    });
    

    // Универсальный обработчик для воспроизведения звука (с учётом mute)
    function playSound(sound) {
        if (!isMuted && sound) {
            sound.currentTime = 0;
            sound.play();
        }
    }

    // Глобальный обработчик клика для запуска фоновой музыки
    const globalMusicClickHandler = (event) => {
        // Проверяем текущую страницу
        const currentPage = window.location.pathname;
        if (currentPage.includes('tumski21.html')) {
            return; // Не запускаем town.mp3 на tumski21.html
        }
        
        // Проверяем, включен ли звук
        const isSoundEnabled = localStorage.getItem('soundMuted') !== 'true';
        
        if (isSoundEnabled) {
            // Проверяем, не играет ли уже музыка
            if (musicAPI.isPaused()) {
                console.log('🎵 Запуск музыки по глобальному клику');
                musicAPI.play().catch((error) => {
                    console.log('🎵 Ошибка запуска музыки по глобальному клику:', error);
                });
            }
        }
    };

    // Добавляем глобальный обработчик клика на документ
    document.addEventListener('click', globalMusicClickHandler);

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
                    
                    // Небольшая задержка перед воспроизведением, чтобы избежать проигрывания старой музыки
                    setTimeout(() => {
                        if (!isMuted) {
                            audio.play().catch(console.log);
                        }
                    }, 100);
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
                        
                        // Небольшая задержка перед воспроизведением, чтобы избежать проигрывания старой музыки
                        setTimeout(() => {
                            if (!isPaused && !isMuted) {
                                audio.play().catch(console.log);
                            }
                        }, 100);
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

// --- Специальная обработка для iOS устройств ---
if (isIOS()) {
    console.log('🎵 iOS: инициализируем специальную обработку');
    
    // Добавляем обработчики для различных типов взаимодействия на iOS
    const iosInteractionEvents = ['touchstart', 'touchend', 'click', 'keydown'];
    
    iosInteractionEvents.forEach(eventType => {
        document.addEventListener(eventType, () => {
            if (window.directMusicAudio && window.directMusicAudio.paused) {
                const isSoundEnabled = localStorage.getItem('soundMuted') !== 'true';
                if (isSoundEnabled) {
                    console.log('🎵 iOS: запуск музыки по взаимодействию', eventType);
                    window.directMusicAudio.play().catch(console.log);
                }
            }
        }, { once: true, passive: true });
    });
    
    // Специальная обработка для переключения между страницами на iOS
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    history.pushState = function(...args) {
        originalPushState.apply(history, args);
        setTimeout(() => {
            if (window.directMusicAudio) {
                const isSoundEnabled = localStorage.getItem('soundMuted') !== 'true';
                if (isSoundEnabled && window.directMusicAudio.paused) {
                    console.log('🎵 iOS: запуск музыки после pushState');
                    window.directMusicAudio.play().catch(console.log);
                }
            }
        }, 100);
    };
    
    history.replaceState = function(...args) {
        originalReplaceState.apply(history, args);
        setTimeout(() => {
            if (window.directMusicAudio) {
                const isSoundEnabled = localStorage.getItem('soundMuted') !== 'true';
                if (isSoundEnabled && window.directMusicAudio.paused) {
                    console.log('🎵 iOS: запуск музыки после replaceState');
                    window.directMusicAudio.play().catch(console.log);
                }
            }
        }, 100);
    };
    
    // Обработка события popstate (назад/вперед в браузере)
    window.addEventListener('popstate', () => {
        setTimeout(() => {
            if (window.directMusicAudio) {
                const isSoundEnabled = localStorage.getItem('soundMuted') !== 'true';
                if (isSoundEnabled && window.directMusicAudio.paused) {
                    console.log('🎵 iOS: запуск музыки после popstate');
                    window.directMusicAudio.play().catch(console.log);
                }
            }
        }, 100);
    });
    
    // Обработка фокуса окна (возврат на вкладку)
    window.addEventListener('focus', () => {
        setTimeout(() => {
            if (window.directMusicAudio) {
                const isSoundEnabled = localStorage.getItem('soundMuted') !== 'true';
                if (isSoundEnabled && window.directMusicAudio.paused) {
                    console.log('🎵 iOS: запуск музыки после фокуса окна');
                    window.directMusicAudio.play().catch(console.log);
                }
            }
        }, 100);
    });
    
    // Обработка видимости страницы
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            setTimeout(() => {
                if (window.directMusicAudio) {
                    const isSoundEnabled = localStorage.getItem('soundMuted') !== 'true';
                    if (isSoundEnabled && window.directMusicAudio.paused) {
                        console.log('🎵 iOS: запуск музыки после возврата видимости');
                        window.directMusicAudio.play().catch(console.log);
                    }
                }
            }, 100);
        }
    });
} 