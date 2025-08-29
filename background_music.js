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

let mapSound = null;

export function initBackgroundMusic() {
    // Создаём только основные аудио-элементы
    const backgroundMusic = ensureAudioElement('backgroundMusic', 'media/zwyki/town.mp3', true);
    const stepSound = ensureAudioElement('stepSound', 'media/step.wav');
    const musicHint = document.querySelector('#musicHint');
    const animationHint = document.querySelector('#animationHint');
    const isMuted = localStorage.getItem('soundMuted') === 'true';

    // Устанавливаем громкость для всех звуков
    if (backgroundMusic) backgroundMusic.volume = 0.5;
    if (stepSound) stepSound.volume = 0.7;
    if (mapSound) mapSound.volume = 0.7;

    // Принудительно выставляем mute для всех аудио-элементов
    if (backgroundMusic) backgroundMusic.muted = isMuted;
    if (stepSound) stepSound.muted = isMuted;
    if (mapSound) mapSound.muted = isMuted;

    // Фоновая музыка
    if (backgroundMusic && !isMuted) {
        backgroundMusic.play().catch(error => {
            if (musicHint) {
                musicHint.style.display = 'block';
                setTimeout(() => {
                    musicHint.style.display = 'none';
                    // После скрытия подсказки музыки показываем подсказку анимации
                    if (animationHint) {
                        animationHint.style.display = 'block';
                        setTimeout(() => {
                            animationHint.style.display = 'none';
                        }, 6000);
                    }
                }, 6000);
            }
            // Пробуем воспроизвести при первом клике пользователя
            const startMusicOnClick = () => {
                backgroundMusic.play().then(() => {
                    document.removeEventListener('click', startMusicOnClick);
                });
            };
            document.addEventListener('click', startMusicOnClick, { once: true });
        });
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
        // Создаем звук карты только при первом вызове
        if (!mapSound) {
            mapSound = ensureAudioElement('mapSound', 'media/zwyki/bb6f2b8ec908f28.mp3');
            mapSound.volume = 0.7;
            mapSound.muted = isMuted;
        }
        playSound(mapSound);
    };
} 