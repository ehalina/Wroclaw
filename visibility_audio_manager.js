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
        
        this.init();
    }
    
    init() {
        if (this.isInitialized) return;
        
        console.log('🎵 Инициализация менеджера видимости аудио');
        
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
        
        this.isInitialized = true;
    }
    
    // Регистрируем аудио элемент для отслеживания
    registerAudio(audioElement) {
        if (audioElement && audioElement.tagName === 'AUDIO') {
            this.audioElements.add(audioElement);
            console.log('🎵 Зарегистрирован аудио элемент:', audioElement.id || audioElement.src);
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
            } else if (currentState === 'visible') {
                this.handlePageVisible();
                this.hiddenStartTime = null;
            }
            this.lastVisibilityState = currentState;
        }, 100); // Задержка 100мс
    }
    
    // Страница стала невидимой - ставим все аудио на паузу
    handlePageHidden() {
        // Дополнительная проверка: убеждаемся, что страница действительно невидима
        if (document.visibilityState !== 'hidden') {
            console.log('🎵 Страница не невидима, игнорируем handlePageHidden');
            return;
        }
        
        console.log('🎵 Страница стала невидимой - ставим аудио на паузу');
        
        this.audioElements.forEach(audio => {
            if (audio && !audio.paused) {
                // Сохраняем текущее время воспроизведения
                this.pausedStates.set(audio, {
                    currentTime: audio.currentTime,
                    wasPlaying: true
                });
                
                audio.pause();
                console.log('🎵 Аудио поставлено на паузу:', audio.id || audio.src);
            }
        });
        
        // Дополнительно проверяем quest музыку, если она существует
        if (window.questMusic && !window.questMusic.paused) {
            this.pausedStates.set(window.questMusic, {
                currentTime: window.questMusic.currentTime,
                wasPlaying: true
            });
            window.questMusic.pause();
            console.log('🎵 Quest музыка поставлена на паузу');
        }
    }
    
    // Страница стала видимой - возобновляем воспроизведение
    handlePageVisible() {
        // Дополнительная проверка: убеждаемся, что страница действительно видима
        if (document.visibilityState !== 'visible') {
            console.log('🎵 Страница не видима, игнорируем handlePageVisible');
            return;
        }
        
        // Проверяем, что страница была скрыта достаточно долго (больше 200мс)
        if (this.hiddenStartTime && (Date.now() - this.hiddenStartTime) < 200) {
            console.log('🎵 Страница была скрыта слишком короткое время, игнорируем handlePageVisible');
            return;
        }
        
        console.log('🎵 Страница стала видимой - возобновляем аудио');
        
        this.audioElements.forEach(audio => {
            if (audio && this.pausedStates.has(audio)) {
                const state = this.pausedStates.get(audio);
                
                if (state.wasPlaying) {
                    // Восстанавливаем время воспроизведения
                    audio.currentTime = state.currentTime;
                    
                    // Возобновляем воспроизведение
                    audio.play().then(() => {
                        console.log('🎵 Аудио возобновлено:', audio.id || audio.src);
                    }).catch(error => {
                        console.log('🎵 Ошибка при возобновлении аудио:', error);
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
                    console.log('🎵 Quest музыка возобновлена');
                }).catch(error => {
                    console.log('🎵 Ошибка при возобновлении quest музыки:', error);
                });
            }
            
            this.pausedStates.delete(window.questMusic);
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
            this.registerAudio(audio);
        });
        
        // Также регистрируем quest музыку, если она уже существует
        if (window.questMusic) {
            this.registerAudio(window.questMusic);
        }
        
        console.log(`🎵 Автоматически зарегистрировано ${allAudio.length} аудио элементов`);
    }
    
    // Принудительная регистрация quest музыки
    registerQuestMusic() {
        if (window.questMusic) {
            this.registerAudio(window.questMusic);
            console.log('🎵 Quest музыка принудительно зарегистрирована');
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
        
        document.removeEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
        this.audioElements.clear();
        this.pausedStates.clear();
        this.isInitialized = false;
        
        console.log('🎵 Менеджер видимости аудио уничтожен');
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
                    window.visibilityAudioManager.registerAudio(node);
                }
                
                // Проверяем аудио элементы внутри добавленного узла
                const audioElements = node.querySelectorAll && node.querySelectorAll('audio');
                if (audioElements) {
                    audioElements.forEach(audio => {
                        window.visibilityAudioManager.registerAudio(audio);
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

// Начинаем наблюдение за изменениями в DOM
observer.observe(document.body, {
    childList: true,
    subtree: true
});

console.log('🎵 Менеджер видимости аудио загружен и готов к работе');
