// Управление аудио при изменении видимости страницы
// Автоматически ставит на паузу все аудио при сворачивании браузера

class VisibilityAudioManager {
    constructor() {
        this.audioElements = new Set();
        this.pausedStates = new Map(); // Сохраняем состояние каждого аудио
        this.isInitialized = false;
        this.visibilityTimeout = null; // Таймер для задержки обработки
        this.lastVisibilityState = document.visibilityState; // Последнее состояние видимости
        this.hiddenStartTime = null; // Время, когда страница стала невидимой
        this._lastHasFocus = (typeof document.hasFocus === 'function') ? document.hasFocus() : true;
        this._focusPollInterval = null;
        
        this.init();
    }

    // Проверяем, можно ли безопасно возобновлять аудио (без триггера autoplay-блокировки)
    canResumeAudio() {
        try {
            // Глобальный флаг выключенного звука
            const muted = localStorage.getItem('soundMuted') === 'true';
            if (muted) return false;

            // Если есть SPA-менеджер — уважим его политику разблокировки
            if (window.spaManager) {
                if (typeof window.spaManager.isSoundEnabled === 'function' && !window.spaManager.isSoundEnabled()) {
                    return false;
                }
                if (window.spaManager.audioUnlocked === false) {
                    return false;
                }
            }

            // Если в глобале есть helper — используем
            if (typeof window.isSoundEnabled === 'function' && !window.isSoundEnabled()) {
                return false;
            }

            return true;
        } catch (_) {
            // В случае проблем — лучше НЕ пытаться играть автоматически
            return false;
        }
    }
    
    init() {
        if (this.isInitialized) return;
        
    // console.log('🎵 Инициализация менеджера видимости аудио');
        
        // Добавляем обработчик изменения видимости
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });
        
        // Добавляем обработчики для других событий сворачивания
        window.addEventListener('blur', () => {
            this.handlePageHidden();
        });
        
        window.addEventListener('focus', () => {
            this.handlePageVisible();
        });

        // Страховка: в некоторых браузерах window blur/focus может быть нестабильным.
        // Поэтому дополнительно отслеживаем фокус через document.hasFocus().
        if (!this._focusPollInterval && typeof document.hasFocus === 'function') {
            this._focusPollInterval = setInterval(() => {
                try {
                    const hasFocus = document.hasFocus();
                    if (hasFocus === this._lastHasFocus) return;

                    // Переход фокуса окна
                    if (!hasFocus) {
                        this.hiddenStartTime = Date.now();
                        this.handlePageHidden();
                    } else {
                        this.handlePageVisible();
                        this.hiddenStartTime = null;
                    }

                    this._lastHasFocus = hasFocus;
                } catch (_) {
                    // no-op
                }
            }, 250);
        }
        
        this.isInitialized = true;
    }
    
    // Регистрируем аудио элемент для отслеживания
    registerAudio(audioElement) {
        if (audioElement && audioElement.tagName === 'AUDIO') {
            // unifiedMusicPlayer обрабатывается отдельно только через visibilitychange
            // не добавляем его в audioElements, чтобы blur/focus не влияли на него
            if (audioElement.id === 'unifiedMusicPlayer') {
                return;
            }
            this.audioElements.add(audioElement);
    // console.log('🎵 Зарегистрирован аудио элемент:', audioElement.id || audioElement.src);
        }
    }
    
    // Удаляем аудио элемент из отслеживания
    unregisterAudio(audioElement) {
        if (audioElement) {
            this.audioElements.delete(audioElement);
            this.pausedStates.delete(audioElement);
        }
    }
    
    // Обработка изменения видимости страницы
    handleVisibilityChange() {
        const currentState = document.visibilityState;
        
        // Игнорируем, если состояние не изменилось
        if (currentState === this.lastVisibilityState) {
            return;
        }
        
        // Очищаем предыдущий таймер
        if (this.visibilityTimeout) {
            clearTimeout(this.visibilityTimeout);
        }
        
        // Добавляем задержку для предотвращения ложных срабатываний
        this.visibilityTimeout = setTimeout(() => {
            if (currentState === 'hidden') {
                this.hiddenStartTime = Date.now();
                this.handlePageHidden();
                // Для unifiedMusicPlayer обрабатываем только через visibilitychange
                this.handleUnifiedMusicPlayerHidden();
            } else if (currentState === 'visible') {
                this.handlePageVisible();
                // Для unifiedMusicPlayer обрабатываем только через visibilitychange
                this.handleUnifiedMusicPlayerVisible();
                this.hiddenStartTime = null;
            }
            this.lastVisibilityState = currentState;
        }, 100); // Задержка 100мс
    }
    
    // Обработка unifiedMusicPlayer при скрытии страницы (только через visibilitychange)
    handleUnifiedMusicPlayerHidden() {
        try {
            const audio = document.getElementById('unifiedMusicPlayer');
            if (audio && !audio.paused) {
                // Сохраняем текущее время воспроизведения
                if (!this.pausedStates.has(audio)) {
                    this.pausedStates.set(audio, {
                        currentTime: audio.currentTime,
                        wasPlaying: true,
                        isUnifiedPlayer: true
                    });
                }
                audio.pause();
            }
        } catch (_) {}
    }
    
    // Обработка unifiedMusicPlayer при показе страницы (только через visibilitychange)
    handleUnifiedMusicPlayerVisible() {
        try {
            const audio = document.getElementById('unifiedMusicPlayer');
            if (audio && this.pausedStates.has(audio)) {
                const state = this.pausedStates.get(audio);
                if (state && state.wasPlaying && state.isUnifiedPlayer) {
                    // Восстанавливаем время воспроизведения
                    audio.currentTime = state.currentTime;
                    
                    // Проверяем, не отключен ли звук
                    const isMuted = localStorage.getItem('soundMuted') === 'true';
                    if (!isMuted) {
                        // Возобновляем воспроизведение
                        audio.play().catch(() => {});
                    }
                }
                
                // Удаляем сохраненное состояние
                this.pausedStates.delete(audio);
            }
        } catch (_) {}
    }
    
    // Страница стала невидимой - ставим все аудио на паузу
    handlePageHidden() {
    // console.log('🎵 Страница потеряла фокус - ставим аудио на паузу');
        
        this.audioElements.forEach(audio => {
            // unifiedMusicPlayer обрабатывается отдельно только через visibilitychange
            if (audio && audio.id === 'unifiedMusicPlayer') {
                return;
            }
            
            if (audio && !audio.paused) {
                // Сохраняем текущее время воспроизведения
                this.pausedStates.set(audio, {
                    currentTime: audio.currentTime,
                    wasPlaying: true
                });
                
                audio.pause();
    // console.log('🎵 Аудио поставлено на паузу:', audio.id || audio.src);
            }
        });
        
        // Дополнительно проверяем quest музыку, если она существует
        if (window.questMusic && !window.questMusic.paused) {
            this.pausedStates.set(window.questMusic, {
                currentTime: window.questMusic.currentTime,
                wasPlaying: true
            });
            window.questMusic.pause();
    // console.log('🎵 Quest музыка поставлена на паузу');
        }
        
        // Останавливаем фоновую музыку из iframe
        if (window.musicIframe && window.musicIframe.contentWindow && window.musicIframe.contentWindow.musicAPI) {
            const api = window.musicIframe.contentWindow.musicAPI;
            if (!api.isPaused()) {
                // Сохраняем состояние фоновой музыки
                this.pausedStates.set(window.musicIframe, {
                    currentTime: api.getCurrentTime(),
                    wasPlaying: true,
                    isBackgroundMusic: true
                });
                api.pause();
    // console.log('🎵 Фоновая музыка (iframe) поставлена на паузу');
            }
        }
        
        // Останавливаем прямую фоновую музыку (для iOS)
        if (window.directMusicAudio && !window.directMusicAudio.paused) {
            this.pausedStates.set(window.directMusicAudio, {
                currentTime: window.directMusicAudio.currentTime,
                wasPlaying: true,
                isBackgroundMusic: true
            });
            window.directMusicAudio.pause();
    // console.log('🎵 Фоновая музыка (direct) поставлена на паузу');
        }
    }
    
    // Страница стала видимой - возобновляем воспроизведение
    handlePageVisible() {
        // Проверяем, что страница была скрыта достаточно долго (больше 200мс)
        if (this.hiddenStartTime && (Date.now() - this.hiddenStartTime) < 200) {
    // console.log('🎵 Страница была скрыта слишком короткое время, игнорируем handlePageVisible');
            return;
        }

        // Важно: не пытаемся автоматически play(), если звук выключен или аудио не разблокировано.
        // Иначе браузер (особенно iOS/Safari) может включить autoplay-блокировку после blur/focus.
        if (!this.canResumeAudio()) {
            // Сбрасываем сохраненные состояния, чтобы не копились и не пытались возобновляться снова
            this.pausedStates.clear();
            return;
        }
        
    // console.log('🎵 Страница получила фокус - возобновляем аудио');
        
        this.audioElements.forEach(audio => {
            // unifiedMusicPlayer обрабатывается отдельно только через visibilitychange
            if (audio && audio.id === 'unifiedMusicPlayer') {
                return;
            }
            
            if (audio && this.pausedStates.has(audio)) {
                const state = this.pausedStates.get(audio);
                
                if (state.wasPlaying) {
                    // Восстанавливаем время воспроизведения
                    audio.currentTime = state.currentTime;
                    
                    // Возобновляем воспроизведение
                    audio.play().then(() => {
    // console.log('🎵 Аудио возобновлено:', audio.id || audio.src);
                    }).catch(error => {
    // console.log('🎵 Ошибка при возобновлении аудио:', error);
                    });
                }
                
                // Удаляем сохраненное состояние
                this.pausedStates.delete(audio);
            }
        });
        
        // Дополнительно проверяем quest музыку
        if (window.questMusic && this.pausedStates.has(window.questMusic)) {
            const state = this.pausedStates.get(window.questMusic);
            
            if (state.wasPlaying) {
                window.questMusic.currentTime = state.currentTime;
                window.questMusic.play().then(() => {
    // console.log('🎵 Quest музыка возобновлена');
                }).catch(error => {
    // console.log('🎵 Ошибка при возобновлении quest музыки:', error);
                });
            }
            
            this.pausedStates.delete(window.questMusic);
        }
        
        // Возобновляем фоновую музыку из iframe
        if (window.musicIframe && this.pausedStates.has(window.musicIframe)) {
            const state = this.pausedStates.get(window.musicIframe);
            const api = window.musicIframe.contentWindow?.musicAPI;
            
            if (state.wasPlaying && api) {
                api.setCurrentTime(state.currentTime);
                api.play().catch(error => {
    // console.log('🎵 Ошибка при возобновлении фоновой музыки (iframe):', error);
                });
    // console.log('🎵 Фоновая музыка (iframe) возобновлена');
            }
            
            this.pausedStates.delete(window.musicIframe);
        }
        
        // Возобновляем прямую фоновую музыку (для iOS)
        if (window.directMusicAudio && this.pausedStates.has(window.directMusicAudio)) {
            const state = this.pausedStates.get(window.directMusicAudio);
            
            if (state.wasPlaying) {
                window.directMusicAudio.currentTime = state.currentTime;
                window.directMusicAudio.play().catch(error => {
    // console.log('🎵 Ошибка при возобновлении фоновой музыки (direct):', error);
                });
    // console.log('🎵 Фоновая музыка (direct) возобновлена');
            }
            
            this.pausedStates.delete(window.directMusicAudio);
        }
    }
    
    // Получить все аудио элементы на странице
    getAllAudioElements() {
        return document.querySelectorAll('audio');
    }
    
    // Автоматически зарегистрировать все существующие аудио элементы
    autoRegisterExistingAudio() {
        const allAudio = this.getAllAudioElements();
        allAudio.forEach(audio => {
            // unifiedMusicPlayer обрабатывается отдельно только через visibilitychange
            if (audio.id !== 'unifiedMusicPlayer') {
                this.registerAudio(audio);
            }
        });
        
        // Также регистрируем quest музыку, если она уже существует
        if (window.questMusic) {
            this.registerAudio(window.questMusic);
        }
        
    // console.log(`🎵 Автоматически зарегистрировано ${allAudio.length} аудио элементов`);
    }
    
    // Принудительная регистрация quest музыки
    registerQuestMusic() {
        if (window.questMusic) {
            this.registerAudio(window.questMusic);
    // console.log('🎵 Quest музыка принудительно зарегистрирована');
            return true;
        }
        return false;
    }
    
    // Очистка ресурсов
    destroy() {
        if (this.visibilityTimeout) {
            clearTimeout(this.visibilityTimeout);
            this.visibilityTimeout = null;
        }

        if (this._focusPollInterval) {
            clearInterval(this._focusPollInterval);
            this._focusPollInterval = null;
        }
        
        document.removeEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
        this.audioElements.clear();
        this.pausedStates.clear();
        this.isInitialized = false;
        
    // console.log('🎵 Менеджер видимости аудио уничтожен');
    }
}

// Создаем глобальный экземпляр менеджера
window.visibilityAudioManager = new VisibilityAudioManager();

// Автоматически регистрируем все аудио элементы при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    window.visibilityAudioManager.autoRegisterExistingAudio();
});

// Дополнительная проверка для SPA - периодически проверяем quest музыку
setInterval(() => {
    if (window.questMusic && window.visibilityAudioManager) {
        if (!window.visibilityAudioManager.audioElements.has(window.questMusic)) {
            window.visibilityAudioManager.registerQuestMusic();
        }
    }
}, 2000); // Проверяем каждые 2 секунды

// Также регистрируем аудио элементы, которые могут быть добавлены динамически
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
                // Проверяем, является ли добавленный узел аудио элементом
                if (node.tagName === 'AUDIO') {
                    // unifiedMusicPlayer обрабатывается отдельно только через visibilitychange
                    if (node.id !== 'unifiedMusicPlayer') {
                        window.visibilityAudioManager.registerAudio(node);
                    }
                }
                
                // Проверяем аудио элементы внутри добавленного узла
                const audioElements = node.querySelectorAll && node.querySelectorAll('audio');
                if (audioElements) {
                    audioElements.forEach(audio => {
                        // unifiedMusicPlayer обрабатывается отдельно только через visibilitychange
                        if (audio.id !== 'unifiedMusicPlayer') {
                            window.visibilityAudioManager.registerAudio(audio);
                        }
                    });
                }
            }
        });
    });
    
    // Периодически проверяем quest музыку
    if (window.questMusic && !window.visibilityAudioManager.audioElements.has(window.questMusic)) {
        window.visibilityAudioManager.registerQuestMusic();
    }
});

// Начинаем наблюдение за изменениями в DOM (после загрузки)
if (document.body) {
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
} else {
    document.addEventListener('DOMContentLoaded', () => {
        if (document.body) {
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    });
}

    // console.log('🎵 Менеджер видимости аудио загружен и готов к работе');
