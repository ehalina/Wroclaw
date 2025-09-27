// SPA интеграция для совместимости с существующими скриптами
// Этот файл обеспечивает совместимость tumski.html с SPA архитектурой

// Глобальные функции для инициализации элементов страницы
window.initializePageElements = function(pageContainer) {
    // console.log('🔧 Инициализация элементов страницы...');
    
    // Инициализируем позиционирование элементов
    initializeElementPositions(pageContainer);
    
    // Инициализируем обработчики событий
    initializeEventHandlers(pageContainer);
    
    // Регистрируем quest музыку в менеджере видимости, если она существует
    if (window.questMusic && window.visibilityAudioManager) {
        window.visibilityAudioManager.registerQuestMusic();
    }
};

window.initializeMapMarks = function(pageContainer) {
    // console.log('📍 Инициализация геометок...');
    
    const mapMarks = pageContainer.querySelectorAll('.map-mark-area');
    mapMarks.forEach(mark => {
        initializeMapMarkPosition(mark);
        setupMapMarkEvents(mark);
    });
};

window.initializeArrows = function(pageContainer) {
    // console.log('➡️ Инициализация стрелок...');
    
    const arrows = pageContainer.querySelectorAll('.custom-cursor-area, .custom-cursor-prostoarea, .custom-cursor-prosto-leftarea, .custom-cursor-backarea, .custom-cursor-leftarea, .custom-cursor-uparea');
    arrows.forEach(arrow => {
        initializeArrowPosition(arrow);
        setupArrowEvents(arrow);
    });
};

// Функция для инициализации позиций элементов
function initializeElementPositions(pageContainer) {
    // Инициализируем геометки
    const mapMarks = pageContainer.querySelectorAll('.map-mark-area');
    mapMarks.forEach(mark => {
        initializeMapMarkPosition(mark);
    });
    
    // Инициализируем стрелки
    const arrows = pageContainer.querySelectorAll('.custom-cursor-area, .custom-cursor-prostoarea, .custom-cursor-prosto-leftarea, .custom-cursor-backarea, .custom-cursor-leftarea, .custom-cursor-uparea');
    arrows.forEach(arrow => {
        initializeArrowPosition(arrow);
    });
}

// Функция для инициализации позиции геометки
function initializeMapMarkPosition(mapMarkArea) {
    const mapMark = mapMarkArea.querySelector('.map-mark');
    if (!mapMark) return;
    
    const xDesktop = mapMark.dataset.xDesktop;
    const yDesktop = mapMark.dataset.yDesktop;
    const xMobile = mapMark.dataset.xMobile;
    const yMobile = mapMark.dataset.yMobile;
    
    // Определяем, мобильное устройство или нет
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile && xMobile && yMobile) {
        mapMarkArea.style.left = `${xMobile}px`;
        mapMarkArea.style.top = `${yMobile}px`;
    } else if (xDesktop && yDesktop) {
        mapMarkArea.style.left = `${xDesktop}px`;
        mapMarkArea.style.top = `${yDesktop}px`;
    }
    
    // Устанавливаем позиционирование
    mapMarkArea.style.position = 'absolute';
    mapMarkArea.style.zIndex = '998';
}

// Функция для инициализации позиции стрелки
function initializeArrowPosition(arrowArea) {
    const xDesktop = arrowArea.dataset.xDesktop;
    const yDesktop = arrowArea.dataset.yDesktop;
    const xMobile = arrowArea.dataset.xMobile;
    const yMobile = arrowArea.dataset.yMobile;
    
    // Определяем, мобильное устройство или нет
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile && xMobile && yMobile) {
        arrowArea.style.left = `${xMobile}px`;
        arrowArea.style.top = `${yMobile}px`;
    } else if (xDesktop && yDesktop) {
        arrowArea.style.left = `${xDesktop}px`;
        arrowArea.style.top = `${yDesktop}px`;
    }
    
    // Устанавливаем позиционирование
    arrowArea.style.position = 'absolute';
    arrowArea.style.zIndex = '999';
}

// Функция для настройки событий геометок
function setupMapMarkEvents(mapMarkArea) {
    const mapMark = mapMarkArea.querySelector('.map-mark');
    if (!mapMark) return;
    
    // Обработчик клика по геометке
    mapMark.addEventListener('click', (e) => {
        e.preventDefault();
    // console.log('Клик по геометке:', mapMark.id);
        
        // Здесь можно добавить логику для обработки кликов по геометкам
        // Например, открытие модального окна или переход к другой странице
    });
    
    // Обработчики для hover эффектов
    mapMarkArea.addEventListener('mouseenter', () => {
        const paperaImage = mapMarkArea.querySelector('.papera-image');
        const tumskiText = mapMarkArea.querySelector('.tumski-text');
        
        if (paperaImage) paperaImage.style.opacity = '1';
        if (tumskiText) tumskiText.style.opacity = '1';
    });
    
    mapMarkArea.addEventListener('mouseleave', () => {
        const paperaImage = mapMarkArea.querySelector('.papera-image');
        const tumskiText = mapMarkArea.querySelector('.tumski-text');
        
        if (paperaImage) paperaImage.style.opacity = '0';
        if (tumskiText) tumskiText.style.opacity = '0';
    });
}

// Функция для настройки событий стрелок
function setupArrowEvents(arrowArea) {
    // Обработчик клика по области стрелки
    arrowArea.addEventListener('click', (e) => {
        e.preventDefault();
        
        const targetPage = arrowArea.dataset.prevPage || arrowArea.dataset.nextPage;
        if (targetPage && window.spaManager) {
    // console.log('Навигация к странице:', targetPage);
            window.spaManager.navigateToPage(targetPage);
        }
    });
    
    // Обработчики для hover эффектов стрелок
    const arrowElement = arrowArea.querySelector('.custom-cursor, .custom-cursor-prosto, .custom-cursor-prosto-left, .custom-cursor-back, .custom-cursor-left, .custom-cursor-up');
    
    if (arrowElement) {
        arrowArea.addEventListener('mouseenter', () => {
            arrowElement.style.opacity = '1';
        });
        
        arrowArea.addEventListener('mouseleave', () => {
            arrowElement.style.opacity = '0';
        });
    }
}

// Функция для инициализации обработчиков событий
function initializeEventHandlers(pageContainer) {
    // Обработчики для всех ссылок
    const links = pageContainer.querySelectorAll('a[href$=".html"]');
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const href = link.getAttribute('href');
            if (href && window.spaManager) {
                window.spaManager.navigateToPage(href);
            }
        });
    });
    
    // Обработчики для кнопок навигации
    const navButtons = pageContainer.querySelectorAll('[data-prev-page], [data-next-page]');
    navButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const targetPage = button.dataset.prevPage || button.dataset.nextPage;
            if (targetPage && window.spaManager) {
                window.spaManager.navigateToPage(targetPage);
            }
        });
    });
}

// Функция для обработки изменения размера окна
function handleResize() {
    // Переинициализируем позиции элементов при изменении размера окна
    const activePage = document.querySelector('.page-content.active');
    if (activePage) {
        initializeElementPositions(activePage);
    }
}

// Добавляем обработчик изменения размера окна
window.addEventListener('resize', handleResize);

// Функция для активации страницы
window.onPageActivated = function(pageName, pageContainer) {
    // console.log('📄 Активация страницы:', pageName);
    
    // Инициализируем элементы для активированной страницы
    initializeElementPositions(pageContainer);
    
    // Специфичная логика для разных страниц
    if (pageName === 'tumski.html') {
        initializeTumskiSpecific(pageContainer);
    }
};

// Специфичная инициализация для tumski.html
function initializeTumskiSpecific(pageContainer) {
    // console.log('🏰 Инициализация tumski-специфичной логики...');
    
    // Инициализируем анимации
    initializeAnimations(pageContainer);
    
    // Инициализируем звуки
    initializeSounds(pageContainer);
}

// Функция для инициализации анимаций
function initializeAnimations(pageContainer) {
    const imageContainer = pageContainer.querySelector('.image-container');
    if (imageContainer) {
        // Запускаем анимацию движения вперед
        imageContainer.style.animation = 'moveForward 40s linear infinite';
    }
}

// Функция для инициализации звуков
function initializeSounds(pageContainer) {
    // Инициализируем звуки для геометок
    const mapMarks = pageContainer.querySelectorAll('.map-mark-area');
    mapMarks.forEach(mark => {
        const audioId = mark.querySelector('audio')?.id;
        if (audioId) {
            const audio = document.getElementById(audioId);
            if (audio) {
                audio.volume = 0.7;
            }
        }
    });
}

// Экспортируем функции для использования в других модулях
export {
    initializePageElements,
    initializeMapMarks,
    initializeArrows,
    initializeElementPositions,
    initializeMapMarkPosition,
    initializeArrowPosition,
    setupMapMarkEvents,
    setupArrowEvents,
    initializeEventHandlers,
    handleResize
};
