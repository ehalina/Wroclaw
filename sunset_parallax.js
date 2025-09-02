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
        this.setupResizeHandler();
    }

    setupControls() {
        const zoomSpeedSlider = document.getElementById('zoomSpeed');
        const zoomSpeedValue = document.getElementById('zoomSpeedValue');
        const pauseBtn = document.getElementById('pauseBtn');
        const resetBtn = document.getElementById('resetBtn');
        const directionBtn = document.getElementById('directionBtn');

        if (zoomSpeedSlider) {
            zoomSpeedSlider.addEventListener('input', (e) => {
                this.zoomSpeed = parseFloat(e.target.value);
                if (zoomSpeedValue) {
                    zoomSpeedValue.textContent = this.zoomSpeed.toFixed(1);
                }
                this.updateAnimation();
            });
        }

        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => {
                this.togglePause();
            });
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetAnimation();
            });
        }

        if (directionBtn) {
            directionBtn.addEventListener('click', () => {
                this.toggleDirection();
            });
            directionBtn.textContent = this.direction === 1 ? 'Вперед' : 'Назад';
        }
    }

    preloadImages() {
        const images = [
            'media/tumski/sunset/sunset1.png',
            'media/tumski/sunset/sunset2.png',
            'media/tumski/sunset/sunset3.jpg'
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
        // Проверяем, мобильное ли устройство
        const isMobile = window.innerWidth <= 768;
        console.log('🔍 SunsetParallax Debug:', {
            windowWidth: window.innerWidth,
            isMobile: isMobile,
            pageContainer: this.pageContainer,
            parallaxContainer: this.parallaxContainer,
            layers: this.layers
        });
        
        if (isMobile) {
            // На мобильных устройствах отключаем анимацию зума
            console.log('📱 Mobile detected - disabling zoom animation');
            this.setupMobileTouchScroll();
            return;
        }
        
        console.log('🖥️ Desktop detected - starting zoom animation');
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
            repeat: -1,
            yoyo: true,
            onRepeat: () => {
                // Переключаем направление при достижении максимального/минимального зума
                this.direction *= -1;
                const directionBtn = document.getElementById('directionBtn');
                if (directionBtn) {
                    directionBtn.textContent = this.direction === 1 ? 'Вперед' : 'Назад';
                }
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

        // Устанавливаем направление воспроизведения согласно текущему состоянию
        this.timeline.reversed(this.direction === -1);

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
        
        // Меняем направление без пересоздания анимации
        if (this.timeline) {
            this.timeline.reversed(this.direction === -1);
        } else {
            this.createTimeline();
        }
    }

    setupMobileTouchScroll() {
        console.log('📱 Setting up mobile touch scroll');
        const imageScrollWrapper = document.querySelector('.image-scroll-wrapper');
        const image = document.querySelector('.image');
        
        if (imageScrollWrapper) {
            const wrapperStyles = window.getComputedStyle(imageScrollWrapper);
            const imageStyles = window.getComputedStyle(image);
            
            console.log('📱 Mobile elements found:', {
                imageScrollWrapper: imageScrollWrapper,
                image: image,
                wrapperOverflowX: wrapperStyles.overflowX,
                wrapperOverflowY: wrapperStyles.overflowY,
                wrapperWidth: wrapperStyles.width,
                wrapperHeight: wrapperStyles.height,
                imageWidth: imageStyles.width,
                imageHeight: imageStyles.height,
                imageDisplay: imageStyles.display,
                wrapperTouchAction: wrapperStyles.touchAction,
                wrapperWebkitOverflowScrolling: wrapperStyles.webkitOverflowScrolling
            });
            
            // Проверяем, есть ли контент для скролла
            console.log('📱 Scroll dimensions:', {
                scrollWidth: imageScrollWrapper.scrollWidth,
                clientWidth: imageScrollWrapper.clientWidth,
                scrollHeight: imageScrollWrapper.scrollHeight,
                clientHeight: imageScrollWrapper.clientHeight,
                canScrollHorizontally: imageScrollWrapper.scrollWidth > imageScrollWrapper.clientWidth
            });
            
            // Добавляем обработчики для отладки
            imageScrollWrapper.addEventListener('touchstart', (e) => {
                console.log('👆 Touch start detected', {
                    touches: e.touches.length,
                    clientX: e.touches[0]?.clientX,
                    clientY: e.touches[0]?.clientY
                });
            });
            
            imageScrollWrapper.addEventListener('touchmove', (e) => {
                console.log('👆 Touch move detected', {
                    touches: e.touches.length,
                    clientX: e.touches[0]?.clientX,
                    clientY: e.touches[0]?.clientY,
                    preventDefault: e.defaultPrevented
                });
            });
            
            imageScrollWrapper.addEventListener('scroll', (e) => {
                console.log('📜 Scroll detected:', {
                    scrollLeft: e.target.scrollLeft,
                    scrollTop: e.target.scrollTop
                });
            });
            
            // Принудительно устанавливаем стили (перезаписываем все inline стили)
            imageScrollWrapper.style.cssText = `
                width: 100vw !important;
                height: 100vh !important;
                overflow-x: auto !important;
                overflow-y: hidden !important;
                -webkit-overflow-scrolling: touch !important;
                touch-action: pan-x !important;
                white-space: nowrap !important;
                border: 2px solid yellow !important;
                background: rgba(255, 255, 0, 0.1) !important;
                position: relative !important;
            `;
            
            // Принудительно устанавливаем стили для image
            image.style.cssText = `
                width: 300vw !important;
                height: 100vh !important;
                background-size: auto 100% !important;
                background-repeat: no-repeat !important;
                background-position: left top !important;
                display: block !important;
                position: relative !important;
                border: 2px solid red !important;
                background: rgba(255, 0, 0, 0.1) !important;
                pointer-events: auto !important;
            `;
            
            // Исправляем .page-container, который блокирует скролл
            const pageContainer = document.querySelector('.page-container');
            if (pageContainer) {
                pageContainer.style.cssText = `
                    width: 100vw !important;
                    height: 100vh !important;
                    max-width: none !important;
                    overflow: visible !important;
                    position: relative !important;
                    background: transparent !important;
                `;
            }
            
            // Отключаем все обработчики событий на родительских элементах, которые могут блокировать скролл
            const scene = document.querySelector('.scene');
            const imageContainer = document.querySelector('.image-container');
            
            if (scene) {
                scene.style.cssText = `
                    display: flex !important;
                    justify-content: center !important;
                    align-items: center !important;
                    width: 100vw !important;
                    height: 100vh !important;
                    position: relative !important;
                    overflow: visible !important;
                `;
            }
            
            if (imageContainer) {
                imageContainer.style.cssText = `
                    display: flex !important;
                    justify-content: center !important;
                    align-items: center !important;
                    width: 100% !important;
                    height: 100% !important;
                    overflow: visible !important;
                `;
            }
            
            // Принудительно создаем контент для скролла, если его нет
            if (imageScrollWrapper.scrollWidth <= imageScrollWrapper.clientWidth) {
                console.log('📱 No scrollable content detected, creating artificial content');
                
                // Создаем реальный контент для увеличения ширины
                if (!image.querySelector('.scroll-content')) {
                    const scrollContent = document.createElement('div');
                    scrollContent.className = 'scroll-content';
                    scrollContent.style.width = '300vw';
                    scrollContent.style.height = '100vh';
                    scrollContent.style.display = 'inline-block';
                    scrollContent.style.position = 'relative';
                    scrollContent.style.pointerEvents = 'none';
                    scrollContent.style.zIndex = '-1';
                    scrollContent.style.background = 'transparent';
                    scrollContent.innerHTML = '&nbsp;'; // Невидимый контент
                    image.appendChild(scrollContent);
                }
                
                // Принудительно устанавливаем размеры через CSS (уже установлены выше через cssText)
                // Дополнительно убеждаемся, что размеры правильные
                image.style.minWidth = '300vw';
                image.style.width = '300vw';
                
                // Принудительно обновляем размеры wrapper
                imageScrollWrapper.style.width = '100vw';
                imageScrollWrapper.style.minWidth = '100vw';
                
                // Принудительно устанавливаем размеры для scroll-content
                const scrollContent = image.querySelector('.scroll-content');
                if (scrollContent) {
                    scrollContent.style.cssText = `
                        width: 300vw !important;
                        height: 100vh !important;
                        display: inline-block !important;
                        position: relative !important;
                        pointer-events: none !important;
                        z-index: -1 !important;
                        background: transparent !important;
                    `;
                }
                
                // Проверяем размеры после изменений
                setTimeout(() => {
                    console.log('📱 After content creation:', {
                        imageWidth: image.offsetWidth,
                        wrapperWidth: imageScrollWrapper.offsetWidth,
                        scrollWidth: imageScrollWrapper.scrollWidth,
                        clientWidth: imageScrollWrapper.clientWidth,
                        canScroll: imageScrollWrapper.scrollWidth > imageScrollWrapper.clientWidth
                    });
                }, 100);
            }
            
            // Добавляем тестовый скролл для проверки
            setTimeout(() => {
                console.log('📱 Testing scroll functionality');
                imageScrollWrapper.scrollLeft = 50;
                setTimeout(() => {
                    console.log('📱 Test scroll result:', {
                        scrollLeft: imageScrollWrapper.scrollLeft,
                        maxScrollLeft: imageScrollWrapper.scrollWidth - imageScrollWrapper.clientWidth
                    });
                    imageScrollWrapper.scrollLeft = 0; // Возвращаем в начало
                }, 100);
            }, 200);
            
            console.log('📱 Applied forced styles to wrapper and image');
        }
    }

    setupResizeHandler() {
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                console.log('🔄 Window resized, restarting animation');
                // Останавливаем текущую анимацию
                if (this.timeline) {
                    this.timeline.kill();
                }
                // Перезапускаем анимацию с учетом нового размера
                this.startAnimation();
            }, 250);
        });
    }
}

// Инициализация после загрузки страницы
document.addEventListener('DOMContentLoaded', () => {
    window.sunsetParallax = new SunsetParallax();
});


