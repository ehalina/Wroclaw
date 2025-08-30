class ParallaxZoomDemo {
    constructor() {
        this.container = document.querySelector('.parallax-container');
        this.layers = document.querySelectorAll('.parallax-layer');
        this.isZooming = false;
        this.zoomLevel = 1;
        this.mouseX = 0;
        this.mouseY = 0;
        this.targetMouseX = 0;
        this.targetMouseY = 0;
        this.animationId = null;
        
        // Параметры автополёта камеры к центру
        this.isFlying = true;
        this.cameraX = 0;   // начальный сдвиг по X (в условных единицах системы) - без смещения
        this.cameraY = 0;  // начальный сдвиг по Y - без смещения
        this.cameraZoom = 1.0; // текущий зум
        this.targetZoom = 1.15; // целевой зум
        this.flightAnimationId = null;
        
        this.init();
    }
    
    init() {
        // Обработчики событий
        this.container.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.container.addEventListener('mouseleave', () => this.handleMouseLeave());
        window.addEventListener('resize', () => this.handleResize());
        
        // Остановка полёта по двойному клику
        document.addEventListener('dblclick', () => {
            this.isFlying = false;
            this.isZooming = false;
            if (this.flightAnimationId) {
                cancelAnimationFrame(this.flightAnimationId);
                this.flightAnimationId = null;
            }
        });
        
        // Запускаем анимационный цикл
        this.animate();
        
        // Предзагрузка изображений
        this.preloadImages();
        
        // Автозапуск плавного полёта камеры к центру
        this.startAutoFlightToCenter();
        
        console.log('Параллакс инициализирован!');
    }
    
    preloadImages() {
        const images = [
            'media/tumski/sunset/sunset1.png',
            'media/tumski/sunset/sunset2.png', 
            'media/tumski/sunset/sunset3.jpg'
        ];
        
        images.forEach(src => {
            const img = new Image();
            img.src = src;
        });
    }
    
    handleMouseMove(e) {
        if (this.isZooming) return;
        
        const rect = this.container.getBoundingClientRect();
        const factor = this.isFlying ? 0.2 : 1; // во время полёта влияние меньше
        this.targetMouseX = ((e.clientX - rect.left) / rect.width - 0.1) * 5 * factor;
        this.targetMouseY = ((e.clientY - rect.top) / rect.height - 0.1) * 5 * factor;
    }
    
    handleMouseLeave() {
        this.targetMouseX = 0;
        this.targetMouseY = 0;
    }
    
    handleResize() {
        // Пересчитываем позиции при изменении размера окна
        this.updateLayers();
    }
    
    animate() {
        // Плавное следование мыши
        this.mouseX += (this.targetMouseX - this.mouseX) * 0.05;
        this.mouseY += (this.targetMouseY - this.mouseY) * 0.05;
        
        this.updateLayers();
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    updateLayers() {
        this.layers.forEach((layer, index) => {
            const speed = parseFloat(layer.dataset.speed);
            const isMobile = window.innerWidth <= 768;
            
            // Базовое положение от "камеры"
            const baseX = this.cameraX * speed * 10; // умножение для видимого эффекта
            const baseY = this.cameraY * speed * 10;
            
            // Эффект параллакса от движения мыши (уменьшаем на мобильных)
            const mouseParallaxX = this.mouseX * (isMobile ? 10 : 1) * speed;
            const mouseParallaxY = this.mouseY * (isMobile ? 10 : 1) * speed;
            
            // Текущий зум слоя на основе cameraZoom и глубины с разными скоростями
            let zoomScale = this.cameraZoom;
            if (index === 0) { // background - слой 3
                zoomScale = this.cameraZoom * (1 + 0.05 * speed); // скорость x
            } else if (index === 1) { // middle - слой 2
                zoomScale = this.cameraZoom * (1 + 0.1 * speed); // скорость 2x
            } else { // foreground - слой 1
                zoomScale = this.cameraZoom * (1 + 0.15 * speed); // скорость 3x
            }
            
            // Применяем трансформации
            let transform = `translate3d(${baseX + mouseParallaxX}px, ${baseY + mouseParallaxY}px, 0) scale(${zoomScale})`;
            
            // Добавляем базовую глубину для 3D эффекта
            if (index === 0) { // background
                transform = `translateZ(-500px) scale(1.3) translate3d(${baseX + mouseParallaxX}px, ${baseY + mouseParallaxY}px, 0) scale(${zoomScale})`;
            } else if (index === 1) { // middle
                transform = `translateZ(-75px) scale(1.075) translate3d(${baseX + mouseParallaxX}px, ${baseY + mouseParallaxY}px, 0) scale(${zoomScale})`;
            } else { // foreground
                transform = `translateZ(0) translate3d(${baseX + mouseParallaxX}px, ${mouseParallaxY}px, 0) scale(${zoomScale})`;
            }
            
            layer.style.transform = transform;
        });
    }
    
    triggerZoom() {
        console.log('Триггер зума активирован!');
        this.isZooming = true;
        
        // Добавляем класс для анимации
        this.layers.forEach(layer => {
            layer.classList.add('zooming');
        });
        
        // Создаем визуальный эффект
        this.createZoomEffect();
        
        // Убираем класс анимации через некоторое время
        setTimeout(() => {
            this.layers.forEach(layer => {
                layer.classList.remove('zooming');
            });
            this.isZooming = false;
        }, 1200);
    }
    
    createZoomEffect() {
        // Создаем визуальный эффект вспышки
        const flash = document.createElement('div');
        flash.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%);
            z-index: 9999;
            pointer-events: none;
            opacity: 0;
            animation: flashEffect 0.6s ease-out;
        `;
        
        // Добавляем стили анимации
        if (!document.getElementById('flash-styles')) {
            const style = document.createElement('style');
            style.id = 'flash-styles';
            style.textContent = `
                @keyframes flashEffect {
                    0% { opacity: 0; }
                    50% { opacity: 1; }
                    100% { opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(flash);
        
        // Удаляем элемент после анимации
        setTimeout(() => {
            if (flash.parentNode) {
                flash.parentNode.removeChild(flash);
            }
        }, 600);
    }
    
    // Публичные методы для внешнего управления
    manualZoom() {
        if (!this.isZooming) {
            this.triggerZoom();
        }
    }
    
    // Новый метод для эффекта полета камеры
    startCameraFlight() {
        if (this.isZooming) return;
        console.log('Запуск эффекта полета камеры');
        this.isZooming = true;
        this.flightAnimationId = null; // Для хранения ID анимации
        
        let progress = 0;
        const flightDuration = 60000; // 60 секунд для одного цикла, но будет повторяться
        const startTime = Date.now();
        
        const flightAnimation = () => {
            if (!this.isZooming) return; // Останавливаем, если пользователь прервал
            
            const currentTime = Date.now();
            progress = ((currentTime - startTime) / flightDuration) % 1; // Циклическое повторение
            
            // Эффект медленного движения камеры вверх и легкого зума
            this.targetMouseY = -5 + progress * 10; // Движение вверх
            this.zoomLevel = 1 + progress * 0.2; // Легкий зум
            
            this.layers.forEach((layer, index) => {
                const speed = parseFloat(layer.dataset.speed);
                const zoomScale = 1 + (0.1 * speed * this.zoomLevel);
                layer.style.transform = `translate3d(${this.mouseX}px, ${this.mouseY + this.targetMouseY}px, 0) scale(${zoomScale})`;
                
                // Добавляем базовую глубину для 3D эффекта
                if (index === 0) { // background
                    layer.style.transform = `translateZ(-500px) scale(1.3) translate3d(${this.mouseX}px, ${this.mouseY + this.targetMouseY}px, 0) scale(${zoomScale})`;
                } else if (index === 1) { // middle
                    layer.style.transform = `translateZ(-150px) scale(1.15) translate3d(${this.mouseX}px, ${this.mouseY + this.targetMouseY}px, 0) scale(${zoomScale})`;
                } else { // foreground
                    layer.style.transform = `translateZ(0) translate3d(${this.mouseX}px, ${this.mouseY + this.targetMouseY}px, 0) scale(${zoomScale})`;
                }
            });
            
            this.flightAnimationId = requestAnimationFrame(flightAnimation);
        };
        
        this.flightAnimationId = requestAnimationFrame(flightAnimation);
        
        // Добавляем обработчик двойного клика для остановки
        const stopFlight = () => {
            console.log('Двойной клик - остановка полета камеры');
            this.isZooming = false;
            this.zoomLevel = 1;
            this.targetMouseY = 0;
            if (this.flightAnimationId) {
                cancelAnimationFrame(this.flightAnimationId);
                this.flightAnimationId = null;
            }
            document.removeEventListener('dblclick', stopFlight);
        };
        document.addEventListener('dblclick', stopFlight);
    }
    
    startAutoFlightToCenter() {
        // Центрирование: медленно стремимся к (0,0) с лёгким увеличением до targetZoom
        const durationMs = 60000; // референсная длительность до центра (поведение бесконечное)
        const startTs = performance.now();
        const animateFlight = (ts) => {
            if (!this.isFlying) return;
            const t = Math.min((ts - startTs) / durationMs, 1);
            // easeOutCubic для плавности
            const ease = 1 - Math.pow(1 - t, 3);
            this.cameraX += (0 - this.cameraX) * 0.01; // плавное стремление к 0
            this.cameraY += (0 - this.cameraY) * 0.01;
            this.cameraZoom += (this.targetZoom - this.cameraZoom) * 0.005;
            this.flightAnimationId = requestAnimationFrame(animateFlight);
        };
        this.flightAnimationId = requestAnimationFrame(animateFlight);
    }
    
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        this.container.removeEventListener('mousemove', this.handleMouseMove);
        this.container.removeEventListener('mouseleave', this.handleMouseLeave);
        window.removeEventListener('resize', this.handleResize);
    }
}

// Инициализация после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    // Небольшая задержка для загрузки изображений
    setTimeout(() => {
        const parallax = new ParallaxZoomDemo();
        
        // Делаем доступным глобально для отладки
        window.parallaxDemo = parallax;
        
        // Кнопка больше не требуется: автополёт запускается автоматически
        
    }, 500);
});
