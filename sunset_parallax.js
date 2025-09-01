class SunsetParallax {
    constructor() {
        this.isPaused = false;
        this.direction = 1; // 1 = вперед, -1 = назад
        this.zoomSpeed = 0.3;
        this.initialScale = 1.2;
        this.maxScale = 3.0;
        
        this.pageContainer = document.querySelector('.page-container');
        this.parallaxContainer = document.querySelector('.parallax-container');
        this.layers = {
            sky: document.querySelector('.layer-sky'),
            horizon: document.querySelector('.layer-horizon'),
            buildings: document.querySelector('.layer-buildings')
        };
        
        this.init();
    }

    init() {
        this.setupControls();
        this.preloadImages();
        this.startAnimation();
    }

    setupControls() {
        const zoomSpeedSlider = document.getElementById('zoomSpeed');
        const zoomSpeedValue = document.getElementById('zoomSpeedValue');
        const pauseBtn = document.getElementById('pauseBtn');
        const resetBtn = document.getElementById('resetBtn');
        const directionBtn = document.getElementById('directionBtn');

        zoomSpeedSlider.addEventListener('input', (e) => {
            this.zoomSpeed = parseFloat(e.target.value);
            zoomSpeedValue.textContent = this.zoomSpeed.toFixed(1);
            this.updateAnimation();
        });

        pauseBtn.addEventListener('click', () => {
            this.togglePause();
        });

        resetBtn.addEventListener('click', () => {
            this.resetAnimation();
        });

        directionBtn.addEventListener('click', () => {
            this.toggleDirection();
        });
    }

    preloadImages() {
        const images = [
            'media/tumski/sunset/sunset1.png',
            'media/tumski/sunset/sunset2.png',
            'media/tumski/sunset/sunset3.png'
        ];

        let loadedCount = 0;
        const totalImages = images.length;

        images.forEach(src => {
            const img = new Image();
            img.onload = () => {
                loadedCount++;
                if (loadedCount === totalImages) {
                    document.querySelector('.loading').style.display = 'none';
                    this.startAnimation();
                }
            };
            img.onerror = () => {
                console.error(`Ошибка загрузки изображения: ${src}`);
                loadedCount++;
                if (loadedCount === totalImages) {
                    document.querySelector('.loading').style.display = 'none';
                    this.startAnimation();
                }
            };
            img.src = src;
        });
    }

    startAnimation() {
        // Устанавливаем начальные масштабы для полного покрытия экрана
        gsap.set(this.pageContainer, { scale: 1.0, transformOrigin: '50% 50%' });
        gsap.set(this.parallaxContainer, { scale: 1.0, transformOrigin: '50% 50%' });
        gsap.set(this.layers.sky, { scale: 1.0 });
        gsap.set(this.layers.horizon, { scale: 1.0 });
        gsap.set(this.layers.buildings, { scale: 1.0 });

        this.createTimeline();
    }

    createTimeline() {
        // Очищаем предыдущую анимацию
        if (this.timeline) {
            this.timeline.kill();
        }

        this.timeline = gsap.timeline({
            ease: "none",
            onComplete: () => {
                // Автоматически переключаем направление при завершении анимации
                this.direction *= -1;
                const directionBtn = document.getElementById('directionBtn');
                if (this.direction === 1) {
                    directionBtn.textContent = 'Вперед';
                } else {
                    directionBtn.textContent = 'Назад';
                }
                // Перезапускаем анимацию с новым направлением
                this.createTimeline();
            }
        });

        // Определяем начальные и конечные значения масштаба в зависимости от направления
        const skyScale = this.direction === 1 ? [1.0, 2.0] : [2.0, 1.0];
        const horizonScale = this.direction === 1 ? [1.0, 2.5] : [2.5, 1.0];
        const buildingsScale = this.direction === 1 ? [1.0, 3.0] : [3.0, 1.0];
        const containerScale = this.direction === 1 ? [1.0, 1.6] : [1.6, 1.0];

        // Анимация для неба (почти статично)
        this.timeline.to(this.layers.sky, {
            scale: skyScale[1],
            duration: 20 / this.zoomSpeed,
            ease: "none"
        }, 0);

        // Анимация для горизонта (медленнее)
        this.timeline.to(this.layers.horizon, {
            scale: horizonScale[1],
            duration: 20 / this.zoomSpeed,
            ease: "none"
        }, 0);

        // Анимация для зданий (быстрее всего)
        this.timeline.to(this.layers.buildings, {
            scale: buildingsScale[1],
            duration: 20 / this.zoomSpeed,
            ease: "none"
        }, 0);

        if (this.isPaused) {
            this.timeline.pause();
        }
    }

    updateAnimation() {
        if (this.timeline) {
            this.createTimeline();
        }
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        const pauseBtn = document.getElementById('pauseBtn');
        
        if (this.isPaused) {
            this.timeline.pause();
            pauseBtn.textContent = 'Продолжить';
        } else {
            this.timeline.resume();
            pauseBtn.textContent = 'Пауза';
        }
    }

    resetAnimation() {
        this.timeline.restart();
        this.timeline.pause();
        this.isPaused = true;
        document.getElementById('pauseBtn').textContent = 'Продолжить';
    }
    
    restartParallax() {
        this.timeline.restart();
        this.isPaused = false;
        document.getElementById('pauseBtn').textContent = 'Пауза';
    }

    toggleDirection() {
        this.direction *= -1;
        const directionBtn = document.getElementById('directionBtn');
        
        if (this.direction === 1) {
            directionBtn.textContent = 'Вперед';
        } else {
            directionBtn.textContent = 'Назад';
        }
        
        // Перезапускаем анимацию с новым направлением
        this.createTimeline();
    }
}

// Инициализация после загрузки страницы
document.addEventListener('DOMContentLoaded', () => {
    window.sunsetParallax = new SunsetParallax();
});


