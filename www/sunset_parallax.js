class SunsetParallax {
    constructor() {
        this.isPaused = false;
        this.direction = 1; // 1 = вперед, -1 = назад
        this.zoomSpeed = 0.3;
        this.initialScale = 1.2;
        // Уменьшаем maxScale для мобильных для экономии памяти
        this.maxScale = window.innerWidth <= 768 ? 2.0 : 3.0;
        this.animationStarted = false;
        
        this.pageContainer = document.querySelector('.page-container');
        this.parallaxContainer = document.querySelector('.parallax-container');
        this.layers = {
            sky: document.querySelector('.layer-sky'),
            horizon: document.querySelector('.layer-horizon'),
            buildings: document.querySelector('.layer-buildings')
        };
        
        this.parallaxScrollWrapper = document.querySelector('.parallax-scroll-wrapper');
        
        // Отключаем конфликтующий код
        this.disableConflictingStyles();
        
        this.init();
    }
    
    disableConflictingStyles() {
        // Отключаем все CSS-анимации на всех уровнях
        const elementsToCheck = [
            this.parallaxContainer,
            this.parallaxScrollWrapper,
            ...Object.values(this.layers),
            document.querySelector('.image-container'),
            document.querySelector('.image-scroll-wrapper'),
            document.querySelector('.image')
        ];
        
        elementsToCheck.forEach(element => {
            if (element) {
                // Отключаем CSS-анимации
                element.style.setProperty('animation', 'none', 'important');
                element.style.setProperty('animation-name', 'none', 'important');
                element.style.setProperty('animation-duration', 'none', 'important');
                element.style.setProperty('animation-timing-function', 'none', 'important');
                element.style.setProperty('animation-delay', 'none', 'important');
                element.style.setProperty('animation-iteration-count', 'none', 'important');
                element.style.setProperty('animation-direction', 'none', 'important');
                element.style.setProperty('animation-fill-mode', 'none', 'important');
                element.style.setProperty('animation-play-state', 'paused', 'important');
                
                // Удаляем конфликтующие классы
                element.classList.remove('zoom-transition', 'zoom-transition-Right', 'zoom-transition-Up');
                
                // Отключаем overflow и touch-action
                element.style.setProperty('overflow-x', 'hidden', 'important');
                element.style.setProperty('overflow-y', 'hidden', 'important');
                element.style.setProperty('touch-action', 'none', 'important');
                element.style.setProperty('-webkit-overflow-scrolling', 'auto', 'important');
                element.style.setProperty('scroll-behavior', 'auto', 'important');
                
                // Сбрасываем scroll позиции
                if (element.scrollLeft !== undefined) element.scrollLeft = 0;
                if (element.scrollTop !== undefined) element.scrollTop = 0;
            }
        });
        
        // Специально для слоев параллакса
        Object.values(this.layers).forEach(layer => {
            if (layer) {
                layer.style.setProperty('width', '100%', 'important');
                layer.style.setProperty('height', '100%', 'important');
                layer.style.setProperty('background-size', 'cover', 'important');
                layer.style.setProperty('background-position', 'center', 'important');
                layer.style.setProperty('transform-origin', 'center center', 'important');
                layer.style.setProperty('will-change', 'transform', 'important');
            }
        });
    }

    init() {
        this.preloadImages();
    }

    preloadImages() {
        const imageUrls = [
            'media/tumski/sunset/sunset1.webp',
            'media/tumski/sunset/sunset2.webp',
            'media/tumski/sunset/sunset3.jpg'
        ];

        let loadedCount = 0;
        const totalImages = imageUrls.length;

        imageUrls.forEach(url => {
            const img = new Image();
            img.onload = () => {
                loadedCount++;
                if (loadedCount === totalImages) {
                    this.startAnimation();
                }
            };
            img.src = url;
        });
    }

    startAnimation() {
        if (this.animationStarted) return;
        this.animationStarted = true;

        // Сбрасываем scroll позиции
        if (this.parallaxContainer) {
            this.parallaxContainer.scrollLeft = 0;
            this.parallaxContainer.scrollTop = 0;
        }

        // Принудительно отключаем все конфликтующие стили
        this.disableConflictingStyles();

        // Устанавливаем начальные масштабы
        Object.values(this.layers).forEach(layer => {
            if (layer) {
                gsap.set(layer, { scale: 1.0 });
            }
        });

        this.createTimeline();
    }

    createTimeline() {
        if (this.timeline) {
            this.timeline.kill();
        }

        this.timeline = gsap.timeline({
            ease: "none",
            repeat: -1,
            onUpdate: () => {
                // Без логов
            },
            onComplete: () => {
                this.direction *= -1;
                this.createTimeline();
            }
        });

        // Определяем масштабы в зависимости от направления
        // Уменьшаем масштабы на мобильных для экономии памяти
        const isMobile = window.innerWidth <= 768;
        const skyScale = this.direction === 1 ? [1, isMobile ? 1.5 : 2] : [isMobile ? 1.5 : 2, 1];
        const horizonScale = this.direction === 1 ? [1, isMobile ? 1.7 : 2.5] : [isMobile ? 1.7 : 2.5, 1];
        const buildingsScale = this.direction === 1 ? [1, isMobile ? 2.0 : 3] : [isMobile ? 2.0 : 3, 1];

        // Создаем анимацию для каждого слоя
        this.timeline.to(this.layers.sky, {
            scale: skyScale[1],
            duration: 66.67,
            ease: "none"
        }, 0);

        this.timeline.to(this.layers.horizon, {
            scale: horizonScale[1],
            duration: 66.67,
            ease: "none"
        }, 0);

        this.timeline.to(this.layers.buildings, {
            scale: buildingsScale[1],
            duration: 66.67,
            ease: "none"
        }, 0);

        this.timeline.play();
    }

    updateAnimation() {
        this.zoomSpeed = this.zoomSpeed === 0.3 ? 0.6 : 0.3;
        this.createTimeline();
    }

    toggleDirection() {
        this.direction *= -1;
        this.createTimeline();
    }

    restartParallax() {
        this.animationStarted = false;
        if (this.timeline) {
            this.timeline.kill();
        }
        this.startAnimation();
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    window.sunsetParallax = new SunsetParallax();
});
