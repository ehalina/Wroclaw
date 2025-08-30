// Стили для кнопки карты и модального окна
const mapStyles = `
    .quest-confirm-dialog {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 2000;
        width: 400px;
        max-width: 90vw;
        background: url('media/watercolor/oldcard.jpg') center/cover;
        border-radius: 8px;
        box-shadow: 0 4px 32px rgba(0,0,0,0.4);
        padding: 30px;
        text-align: center;
        font-family: "Marck Script", cursive, serif;
        color: #5b4636;
        display: none;
    }

    .quest-confirm-dialog .dialog-text {
        font-size: 24px;
        margin-bottom: 25px;
        line-height: 1.4;
    }

    .quest-confirm-dialog .dialog-buttons {
        display: flex;
        justify-content: center;
        gap: 20px;
    }

    .quest-confirm-dialog button {
        padding: 10px 20px;
        border: 1px solid rgba(91, 70, 54, 0.2);
        border-radius: 6px;
        background: none;
        font-family: serif;
        color: #5b4636;
        cursor: pointer;
        transition: all 0.2s ease;
        font-size: 18px;
    }

    .quest-confirm-dialog button:hover {
        background: rgba(91, 70, 54, 0.1);
        transform: translateY(-1px);
    }

    .quest-confirm-dialog-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 1999;
        display: none;
    }

    .quest-flip-button {
        border: none !important;
        outline: none !important;
        box-shadow: none !important;
    }

    .quest-flip-button:focus,
    .quest-flip-button:focus-visible,
    .quest-flip-button:active {
        outline: none !important;
        box-shadow: none !important;
        border: none !important;
    }

    .quest-reset-button {
        transition: none !important;
        transition-delay: 0s !important;
    }
    .map-and-quest-buttons {
        position: fixed;
        top: 20px;
        left: 20px;
        display: flex;
        flex-direction: column;
        gap: 10px; /* Расстояние между кнопками */
        z-index: 1000;
    }

    .map-button, .quest-button {
        width: 64px;
        height: 64px;
        background: rgba(0, 0, 0, 0.7);
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: background 0.3s ease;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .map-button:hover, .quest-button:hover {
        background: rgba(0, 0, 0, 0.9);
    }

    .map-button img, .quest-button img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        display: block;
        border: none;
        border-radius: 4px;
    }

    /* Адаптивные стили для кнопок */
    @media (max-width: 768px) {
        .map-and-quest-buttons {
            top: 20px;
            left: 20px;
            gap: 10px;
        }

        .map-button, .quest-button {
            width: 64px;
            height: 64px;
            border-radius: 4px;
        }
    }

    @media (max-width: 480px) {
        .map-and-quest-buttons {
            top: 20px;
            left: 20px;
            gap: 10px;
        }

        .map-button, .quest-button {
            width: 64px;
            height: 64px;
            border-radius: 4px;
        }
    }

    #map-modal {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0,0,0,0.8);
        z-index: 2000;
        justify-content: center;
        align-items: center;
    }

    #map-modal > div {
        position: relative;
        width: 80vw;
        max-width: 900px;
    }

    #map-image {
        width: 100%;
        height: auto;
        display: block;
        border-radius: 12px;
    }

    #map-marker {
        position: absolute;
        width: 38px;
        height: 48px;
        pointer-events: none;
    }

    #map-tooltip {
        display: none;
        position: absolute;
        background: rgba(0,0,0,0.8);
        color: white;
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 14px;
        pointer-events: none;
        z-index: 1001;
    }

    #close-map-modal {
        position: absolute;
        top: 16px;
        right: 16px;
        background: none;
        border: none;
        color: white;
        font-size: 36px;
        cursor: pointer;
        z-index: 10;
    }

    #toggle-tooltips {
        position: absolute;
        top: 16px;
        right: 60px;
        background: rgba(0,0,0,0.7);
        border: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
        z-index: 10;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    /* Адаптивные стили для модального окна карты */
    @media (max-width: 768px) {
        #map-modal {
            justify-content: flex-start;
            align-items: flex-start;
            overflow: hidden;
        }
        
        #map-modal > div {
            width: 100vw;
            height: 100vh;
            max-width: none;
            position: relative;
            overflow-x: auto;
            overflow-y: hidden;
            display: flex;
            align-items: center;
            justify-content: flex-start;
            touch-action: pan-x;
            user-select: none;
            -webkit-user-select: none;
        }

        #map-image {
            border-radius: 0;
            flex-shrink: 0;
            /* Размеры будут установлены через JavaScript */
            touch-action: pan-x;
            user-select: none;
            -webkit-user-select: none;
            -webkit-touch-callout: none;
        }
        
        /* Скрываем скроллбары на мобильных устройствах */
        #map-modal > div::-webkit-scrollbar {
            display: none;
        }
        
        #map-modal > div {
            -ms-overflow-style: none;
            scrollbar-width: none;
            scroll-behavior: smooth;
            -webkit-overflow-scrolling: touch;
            overscroll-behavior-x: contain;
        }

        #map-marker {
            width: 76px;
            height: 96px;
            position: absolute;
            z-index: 1002;
            pointer-events: none;
            display: block;
        }

        #map-tooltip {
            font-size: 12px;
            padding: 6px 10px;
        }

        #close-map-modal {
            top: 10px;
            right: 10px;
            font-size: 24px;
            position: fixed;
            z-index: 2010;
        }

        #toggle-tooltips {
            top: 10px;
            right: 50px;
            font-size: 20px;
            position: fixed;
            z-index: 2010;
            width: 36px;
            height: 36px;
        }
    }

    @media (max-width: 480px) {
        #map-modal > div {
            width: 100vw;
            height: 100vh;
        }

        #map-image {
            border-radius: 0;
            /* Размеры будут установлены через JavaScript */
            touch-action: pan-x;
            user-select: none;
            -webkit-user-select: none;
            -webkit-touch-callout: none;
        }

        #map-marker {
            width: 52px;
            height: 72px;
            position: absolute;
            z-index: 1002;
            pointer-events: none;
            display: block;
        }

        #map-tooltip {
            font-size: 10px;
            padding: 4px 8px;
        }

        #close-map-modal {
            top: 8px;
            right: 8px;
            font-size: 20px;
        }

        #toggle-tooltips {
            top: 8px;
            right: 44px;
            font-size: 18px;
            width: 32px;
            height: 32px;
        }
    }

    /* Квест 1 */
    
    .book-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: none;
        justify-content: center;
        align-items: center;
        z-index: 1001;
    }

    .book-container {
        position: relative;
        width: 90vw;
        height: 90vh;
        max-width: 100vw;
        max-height: 100vh;
        display: flex;
        justify-content: center;
        align-items: flex-start;
        overflow: auto; /* Позволяет прокручивать, если что-то не влезает */
        box-sizing: border-box;
    }

    .book-image-content-wrapper {
        position: relative;
        width: 50%;
        height: 100%;
        max-width: 100%;
        max-height: 100%;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        align-items: center;
        background-color: #d2cdc4;
        box-sizing: border-box;
    }

    .book-image {
        /* Эти стили больше не нужны для quest.jpg */
        display: none; /* Скрываем старое изображение */
    }

    .quest-top-image,
    .quest-bottom-image {
        /* position: absolute; */ /* Убираем абсолютное позиционирование */
        /* z-index: 1; */ /* Убираем z-index */
        left: 0; /* Убираем позиционирование */
        width: 100%;
        max-width: 100%;
        height: auto;
        max-height: 30vh;
        display: block; /* Убедимся, что они блочные элементы */
        object-fit: contain;
        box-sizing: border-box;
    }

    .quest-top-image {
        /* top: 0; */
    }

    .quest-bottom-image {
        /* bottom: 0; */
    }

    .quest-left-image,
    .quest-right-image {
        display: none; /* Скрываем отдельные элементы, будем использовать как фон */
    }

    .book-content-area {
        position: relative;
        width: 100%;
        z-index: 2; /* Поверх фоновых картинок */
        /* Добавляем боковые фоновые изображения */
        background-image: url('media/book/quest_03.jpg'), url('media/book/quest_04.jpg');
        background-position: left top, right top; /* Позиционируем левое и правое изображение */
        background-size: auto 100%;
        background-repeat: no-repeat; /* Не повторяем изображения */
        background-color: #d2cdc4; /* Цвет фона */
        padding-left: 0px; /* Подберите значение по ширине боковой картинки */
        padding-right: 0px; /* Подберите значение по ширине боковой картинки */
       /*  box-sizing: border-box; Учитываем padding в общей ширине */
       background-origin: content-box, content-box; /* Позиционируем относительно content-box */
       background-clip: content-box, content-box; /* Обрезаем по content-box */
    }

    .book-title {
        width: 100%;
        padding: 20px;
        background: rgba(255, 255, 255, 0); /* Убираем или делаем прозрачным */
        z-index: 10;
        font-family: 'Roboto', sans-serif;
        font-weight: 200;
        font-style: italic;
        font-size: clamp(24px, 4vw, 32px);
        color: #333;
        text-align: center;
        margin: 0;
        box-sizing: border-box;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
    }

    .quest-tasks {
        width: 100%;
        padding: 20px;
        color: #333;
        font-family: 'Roboto', sans-serif;
        font-size: clamp(16px, 2.5vw, 20px);
        margin: 0;
        list-style: none;
        box-sizing: border-box;
        z-index: 2; /* Размещаем поверх изображения */
        /* Удаляем padding, так как боковые картинки теперь фон book-content-area */
        /* padding-left: 60px; */
        /* padding-right: 60px; */
    }

    .quest-tasks li {
        display: flex;
        align-items: center;
        margin-bottom: 15px;
        text-align: left;
        counter-increment: quest-item;
        background: rgba(255, 255, 255, 0); /* Убираем или делаем прозрачным */
        padding: 10px;
        border-radius: 4px;
    }

    .quest-tasks li::before {
        content: counter(quest-item) ". ";
        margin-right: 5px;
        font-weight: bold;
        flex-shrink: 0;
    }

    .quest-tasks li img {
        width: 35px;
        height: 35px;
        margin-right: 10px;
        flex-shrink: 0;
        object-fit: contain;
    }

    .quest-tasks li span {
        flex-grow: 1;
    }

    .book-image-content-wrapper::-webkit-scrollbar {
        width: 8px;
    }

    .book-image-content-wrapper::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.2);
        border-radius: 4px;
    }

    .book-image-content-wrapper::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.6);
        border-radius: 4px;
    }

    .book-content {
         /* Этот блок может содержать текст или другие элементы книги, если они будут нужны в будущем */
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        overflow-y: hidden;
        padding: 20px;
        box-sizing: border-box;
        text-align: center;
        transition: overflow-y 0.3s ease;
        pointer-events: none;
    }

     .book-content.show-scrollbar {
        overflow-y: auto;
        pointer-events: auto;
    }

    .quest-tasks::-webkit-scrollbar {
        width: 6px;
    }

    .quest-tasks::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.2); /* Светлый, полупрозрачный трек */
        border-radius: 3px;
    }

    .quest-tasks::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.6); /* Светлый, полупрозрачный ползунок */
        border-radius: 3px;
    }

    .book-content::-webkit-scrollbar {
        width: 6px;
    }

    .book-content::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.1);
        border-radius: 3px;
    }

    .book-content::-webkit-scrollbar-thumb {
        background: rgba(0, 0, 0, 0.3);
        border-radius: 3px;
    }

    .content-image {
        /* Стили для изображений внутри book-content, если они будут */
        max-width: 100%;
        height: auto;
        margin: 5px 0 20px 0;
        border-radius: 8px;
    }

    .scroll-indicator {
        position: absolute;
        bottom: 20px; /* Сдвигаем ниже, чтобы не перекрывать картинку */
        left: 50%;
        transform: translateX(-50%);
        color: #333;
        font-size: 16px;
        opacity: 0.7;
        z-index: 1003;
        cursor: pointer;
        transition: opacity 0.3s ease;
        pointer-events: auto;
    }

    .scroll-indicator:hover {
        opacity: 1;
    }

    .scroll-indicator::after {
        content: "▼";
        display: block;
    }

    .close-button {
        position: absolute;
        top: 20px;
        right: 20px;
        color: white;
        font-size: 24px;
        cursor: pointer;
        background: none;
        border: none;
        padding: 10px;
        z-index: 1002;
    }

    /* Most Overlay Styles */
    .most-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.8);
        display: none; /* по умолчанию скрыто, показываем через JS display:flex */
        justify-content: center;
        align-items: center;
        z-index: 1001;
    }

.most-container {
    aspect-ratio: 2 / 1.4;
    width: min(90vw, 1100px, calc(100vh * 2 / 1.4));
    height: min(90vh, calc(90vw * 1.4 / 2), 800px);
    max-width: 1100px;
    max-height: 90vh;
    background: none;
    display: flex;
    justify-content: center;
    align-items: center;
    box-sizing: border-box;
    overflow: auto;
}

.image-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: auto;
    height: 100%;
    max-width: 100%;
    max-height: 100%;
    box-sizing: border-box;
    position: relative;
}

.most-image {
    display: block;
    width: auto;
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    border-radius: 16px;
    box-shadow: 0 4px 32px rgba(0,0,0,0.2);
}

    .most-text-block {
        position: absolute;
        top: 8%;
        width: 35%;      /* ширина всегда % от image-wrapper */
        height: 80%;     /* высота всегда % от image-wrapper */
        min-width: 150px;
        min-height: 80px;
        max-width: 400px;
        max-height: 520px;
        overflow-y: auto;
        background: rgba(255,255,255,0.0);
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: flex-start;
        z-index: 10;
        padding: 16px 20px;
        box-sizing: border-box;
    }

    .most-text-block-left {
        left: 12%;
    }

    .most-text-block-right {
        right: 12%;
    }
    .most-title, .most-description {
        pointer-events: auto;
    }

    /* Оставляю только актуальные стили для .most-title и .most-description, отвечающие за модальное окно */
    .most-title {
        font-family: 'Marck Script', cursive;
        font-size: 2.2vw;
        font-weight: bold;
        color: #222;
        margin-bottom: 1.5vw;
        text-align: left;
        word-break: break-word;
        width: 100%;
        flex-shrink: 0;
    }

    .most-description {
        font-family: 'Roboto', sans-serif;
        font-size: 1.2vw;
        color: #222;
        text-align: left;
        line-height: 1.5;
        overflow-y: auto;
        word-break: break-word;
        width: 100%;
        flex: 1;
        min-height: 0;
    }

    .overlay-image,
    .additional-image,
    .book-31-image,
    .book-32-image {
        position: absolute;
        pointer-events: none;
        z-index: 1;
    }

    .overlay-image {
        object-position: left;
    }

    .book-zones {
        position: absolute;
        top: 0;
        width: 10%;
        height: 100%;
        pointer-events: none;
        z-index: 15;
    }

    .right-zones {
        right: 0;
    }

    .left-zones {
        left: 0;
    }

    .book-zone {
        position: absolute;
        width: 100%;
        background-color: transparent;
        cursor: pointer;
        pointer-events: auto;
        transition: all 0.7s ease-in-out;
    }

    .right-zones .book-zone {
        right: 0;
    }

    .left-zones .book-zone {
        left: 0;
    }

    .book-zone:hover,
    .book-zone.highlight {
        background-color: rgba(255, 255, 255, 0.45);
    }

    @keyframes highlightPulse {
        0% { 
            background-color: rgba(255, 255, 255, 0);
        }
        100% { 
            background-color: rgba(255, 255, 255, 0.45);
        }
    }

    .book-zone.highlight {
        animation: highlightPulse 0.5s ease-in-out forwards;
    }

    .zone {
        transition: all 0.1s ease-in-out;
    }
    
    .zone.highlight {
        background-color: rgba(255, 255, 255, 0.2);
        border: 2px solid rgba(255, 255, 255, 0.5);
        box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
    }

    /* Адаптивные стили для модального окна геометок */
    @media (max-width: 768px) {
        .book-zones {
            display: flex !important;
            flex-direction: column !important;
            align-items: stretch !important;
            justify-content: flex-start !important;
        }
        
        .book-zone {
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            position: static !important;
            top: auto !important;
            left: auto !important;
            right: auto !important;
            bottom: auto !important;
        }
        
        .overlay-image {
            height: 100% !important;
            width: 100% !important;
            max-height: 100vh !important;
            object-fit: contain !important;
            object-position: left !important;
        }
        .most-container {
            width: 100vw;
            height: 100vh;
            max-width: 100vw;
            max-height: 100vh;
            align-items: flex-start;
            justify-content: flex-start;
        }

        .image-wrapper {
            width: 100%;
            height: auto;
            align-items: flex-start;
            justify-content: flex-start;
            margin-top: 150px !important;
        }

        .most-image {
            width: 100%;
            height: auto;
            max-width: 100vw;
            max-height: 100vh;
        }

        .most-text-block {
            top: 8%;
            width: 32%;
            height: 80%;
            min-width: 100px;
            min-height: 60px;
            max-width: 200px;
            max-height: 350px;
            padding: 10px 12px;
            justify-content: flex-start;
            z-index: 10 !important;
        }

        .most-text-block-left {
            left: 12%;
        }

        .most-text-block-right {
            right: 15%;
        }

        .most-title {
            font-size: clamp(16px, 4vw, 20px);
            margin-bottom: 10px;
            flex-shrink: 0;
        }

        .most-description {
            font-size: clamp(12px, 3vw, 14px);
            line-height: 1.4;
            flex: 1;
            min-height: 0;
        }
    }

    @media (max-width: 480px) {
        .book-zones {
            display: flex !important;
            flex-direction: column !important;
            align-items: stretch !important;
            justify-content: flex-start !important;
        }
        
        .book-zone {
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            position: static !important;
            top: auto !important;
            left: auto !important;
            right: auto !important;
            bottom: auto !important;
        }
        
        .overlay-image {
            height: 100% !important;
            width: 100% !important;
            max-height: 100vh !important;
            object-fit: contain !important;
            object-position: left !important;
            z-index: 1 !important;
        }
        
        .most-container {
            width: 100vw;
            height: 100vh;
            max-width: 100vw;
            max-height: 100vh;
            align-items: flex-start;
            justify-content: flex-start;
        }

        .image-wrapper {
            width: 100%;
            height: auto;
            align-items: flex-start;
            justify-content: flex-start;
            margin-top: 100px !important;
        }

        .most-image {
            width: 100%;
            height: auto;
            max-width: 100vw;
            max-height: 100vh;
        }

        .most-text-block {
            top: 6%;
            width: 34%;
            height: 85%;
            min-width: 80px;
            min-height: 50px;
            max-width: 160px;
            max-height: 300px;
            padding: 6px 8px;
            z-index: 10 !important;
            justify-content: flex-start;
        }

        .most-text-block-left {
            left: 15%;
        }

        .most-text-block-right {
            right: 10%;
        }

        .most-title {
            font-size: clamp(14px, 5vw, 16px);
            margin-bottom: 8px;
            flex-shrink: 0;
        }

        .most-description {
            font-size: clamp(10px, 3.5vw, 12px);
            line-height: 1.3;
            flex: 1;
            min-height: 0;
        }
    }

`;

// Функция для получения координат текущей точки на карте
async function getCurrentMapPoint() {
    const imageContainer = document.querySelector('.image-container');
    const mapPoint = imageContainer ? parseInt(imageContainer.getAttribute('data-map-point')) : 1;
    const { getMapPointCoords } = await import('./map_points.js');
    return getMapPointCoords(mapPoint || 1);
}

// Функционал модального окна карты
const MapModal = {
    init() {
        // Добавляем стили на страницу
        const styleSheet = document.createElement("style");
        styleSheet.textContent = mapStyles;
        document.head.appendChild(styleSheet);

        // Создаем структуру модального окна и кнопок
        const modalHTML = `
            <div class="map-and-quest-buttons">
                <a href="" class="map-button" id="open-map-modal">
                    <img src="media/maps_i.jpg" alt="Карта">
                </a>
                <button class="quest-button" id="open-quest">
                     <img src="media/quest_i.jpg" alt="Квесты">
                </button>
            </div>
            <div id="map-modal">
                <div>
                    <img id="map-image" src="media/tumski/map.jpg" alt="Карта">
                    <img id="map-marker" src="media/mapmark.png" alt="Маркер">
                    <div id="map-tooltip"></div>
                    <button id="close-map-modal">×</button>
                    <button id="toggle-tooltips" style="display: none;">👁️</button>
                </div>
            </div>
            <!-- Book Overlay HTML (moved from tumski.html) -->
            <div class="book-overlay">
                <button class="close-button">×</button>
                <div class="book-container">/book/
                    <div class="book-image-content-wrapper">
                        <img src="media/book/quest_01.jpg" alt="Квест верх" class="quest-top-image">
                        <div class="book-content-area">
                            <h2 class="book-title"></h2>
                            <ul class="quest-tasks"></ul>
                            
                            <!-- Изображение льва теперь добавляется динамически в book-content-area -->
                        </div>
                        <img src="media/book/quest_02.jpg" alt="Квест низ" class="quest-bottom-image">
                        <!-- Боковые изображения теперь фон book-content-area -->
                    </div>
                    <div class="book-content">
                        <!-- Content will be added dynamically if needed -->
                    </div>
                    <div class="scroll-indicator"></div>
                </div>
            </div>
             <!-- Most Overlay HTML (moved from tumski.html) -->
            <div class="most-overlay">
                <button class="close-button">×</button>
                <div class="most-container">
                    <div class="image-wrapper">
                        <img src="" alt="Тумский мост" class="most-image" data-src="BOOK_IMAGE_02">
                        <img src="" alt="Overlay Image" class="overlay-image" style="display: none;">
                        <img src="" alt="Additional Image" class="additional-image" style="display: none;">
                        <img src="" alt="Book 31" class="book-31-image" style="display: none;">
                        <img src="" alt="Book 32" class="book-32-image" style="display: none;">
                        <div class="most-text-block most-text-block-left">
                            <div class="most-title"></div>
                            <div class="most-description"></div>
                        </div>
                        <div class="most-text-block most-text-block-right">
                            <div class="most-title"></div>
                            <div class="most-description"></div>
                        </div>
                        <div class="book-zones right-zones">
                            <div class="book-zone zone-1" data-zone="1"></div>
                            <div class="book-zone zone-2" data-zone="2"></div>
                            <div class="book-zone zone-3" data-zone="3"></div>
                            <div class="book-zone zone-4" data-zone="4"></div>
                        </div>
                        <div class="book-zones left-zones">
                            <div class="book-zone zone-1" data-zone="1"></div>
                            <div class="book-zone zone-2" data-zone="2"></div>
                            <div class="book-zone zone-3" data-zone="3"></div>
                            <div class="book-zone zone-4" data-zone="4"></div>
                        </div>
                    </div>
                </div>
            </div>
            <audio id="stepSound" src="media/step.wav"></audio>
            <audio id="mapSound" src="media/zwyki/bb6f2b8ec908f28.mp3"></audio>
            <audio id="bookSound" src="media/opening-a-book.wav"></audio>
            <audio id="sceneSound"></audio>
            <div class="quest-confirm-dialog-overlay"></div>
            <div class="quest-confirm-dialog">
                <div class="dialog-text"></div>
                <div class="dialog-buttons">
                    <button class="confirm-yes"></button>
                    <button class="confirm-no"></button>
                </div>
            </div>
        `;

        // Добавляем модальное окно и кнопки на страницу
        document.body.insertAdjacentHTML('afterbegin', modalHTML);

        // Удалены принудительные скрытия most-overlay, чтобы клики по геометкам могли открывать модалку

        // === Автоматическая ширина most-container по ширине most-image ===
        function adjustMostContainerWidth() {
            const mostImage = document.querySelector('.most-image');
            const mostContainer = document.querySelector('.most-container');
            if (mostImage && mostContainer) {
                const isMobile = window.innerWidth <= 768;
                if (isMobile) {
                    // На мобильных устройствах используем всю ширину экрана
                    mostContainer.style.width = '100vw';
                } else {
                    const naturalWidth = mostImage.naturalWidth;
                    // Максимум 90vw, минимум — ширина картинки
                    const maxWidth = Math.min(window.innerWidth * 0.9, naturalWidth);
                    mostContainer.style.width = maxWidth + 'px';
                }
            }
        }

        // === Автоматическая высота book-zone по высоте most-image ===
        function adjustBookZonesHeight() {
            if (window.innerWidth <= 768) {
                const mostImage = document.querySelector('.most-image');
                const bookZones = document.querySelectorAll('.book-zone');
                
                if (mostImage && bookZones.length > 0) {
                    const imageHeight = mostImage.offsetHeight;
                    const zoneHeight = imageHeight / 12;
                    
                    bookZones.forEach(zone => {
                        zone.style.height = zoneHeight + 'px';
                    });
                }
            }
        }
        
        // Делаем функцию глобально доступной
        window.adjustBookZonesHeight = adjustBookZonesHeight;
        // После загрузки изображения
        const mostImage = document.querySelector('.most-image');
        if (mostImage) {
            mostImage.addEventListener('load', () => {
                adjustMostContainerWidth();
                adjustBookZonesHeight();
            });
        }
        // И при изменении размера окна
        window.addEventListener('resize', () => {
            adjustMostContainerWidth();
            adjustBookZonesHeight();
            
            // Пересчитываем размер карты при изменении размера окна
            if (window.innerWidth <= 768) {
                const mapImage = document.getElementById('map-image');
                if (mapImage && mapImage.complete) {
                    MapModal.calculateImageSize(mapImage);
                }
                
                // Перепозиционируем маркер при изменении размера окна
                setTimeout(async () => {
                    try {
                        const coords = await getCurrentMapPoint();
                        if (coords) {
                            MapModal.positionMarker(coords);
                        }
                    } catch (error) {
                        // Ошибка при перепозиционировании маркера
                    }
                }, 200);
            }
        });

        // Получаем ссылки на элементы после их добавления в DOM
        const openMapBtn = document.getElementById('open-map-modal');
        const openQuestBtn = document.getElementById('open-quest');
        const mapModal = document.getElementById('map-modal');
        const closeMapBtn = document.getElementById('close-map-modal');
        const toggleTooltipsBtn = document.getElementById('toggle-tooltips');
        const mapImage = document.getElementById('map-image');
        const mapMarker = document.getElementById('map-marker');
        const mapTooltip = document.getElementById('map-tooltip');

        // Проверяем, что все элементы найдены
        if (!openMapBtn || !openQuestBtn || !mapModal || !closeMapBtn || !toggleTooltipsBtn || !mapImage || !mapMarker || !mapTooltip) {
            return; // Прекращаем выполнение, если элементы не найдены
        }

        openMapBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            mapModal.style.display = 'flex';
            // Проверяем глобальный mute
            const soundMenuBtn = document.querySelector('.sound-menu-button');
            const isMuted = soundMenuBtn && soundMenuBtn.classList.contains('muted');
            // Воспроизводим звук карты только если не muted
            if (!isMuted && window.playMapSound) {
                window.playMapSound();
            }
            // Воспроизводим звук открытия книги
            const bookSound = document.getElementById('bookSound');
            if (bookSound) bookSound.play();
            
            // Получаем номер точки из data-атрибута
            const imageContainer = document.querySelector('.image-container');
            const mapPoint = imageContainer ? parseInt(imageContainer.getAttribute('data-map-point')) : 1;
            
            const { getMapPointCoords, checkTooltipArea } = await import('./map_points.js');
            const coords = getMapPointCoords(mapPoint || 1); // Используем точку 1 как fallback
            
            // После загрузки изображения корректно позиционируем маркер
            mapImage.onload = function() {
                MapModal.positionMarker(coords);
            };
            
            // Если картинка уже загружена
            if (mapImage.complete) {
                MapModal.positionMarker(coords);
            }

            // Добавляем поддержку свайпов для мобильных устройств
            if (window.innerWidth <= 768) {
                MapModal.setupMobileSwipe();
                MapModal.adjustMapImageSize();
                
                // Убеждаемся, что маркер отображается на мобильных устройствах
                setTimeout(async () => {
                    try {
                        const coords = await getCurrentMapPoint();
                        if (coords) {
                            MapModal.positionMarker(coords);
                        }
                    } catch (error) {
                        // Ошибка при позиционировании маркера
                    }
                }, 300);
            }

            // === Обработчик движения мыши для подсказки (только для десктопа) ===
            if (window.innerWidth > 768) {
            // Сначала удалим старые обработчики, если они были
            mapImage.onmousemove = null;
            mapImage.onmouseleave = null;

            // Глобальная функция для обновления текста подсказки
            function camelToSnake(str) {
                return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
            }
            window.updateMapTooltipText = function(tooltipKey) {
                if (mapTooltip && mapTooltip.style.display === 'block') {
                    let key = camelToSnake(tooltipKey);
                    // Проверяем наличие i18n объекта перед использованием
                    let tooltipText = window.i18n ? window.i18n.t('map.' + key) : tooltipKey;
                    mapTooltip.textContent = tooltipText;
                }
            };

            mapImage.onmousemove = function(e) {
                const rect = mapImage.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                const tooltipKey = checkTooltipArea(x, y);
                if (tooltipKey) {
                    mapTooltip.style.display = 'block';
                    mapTooltip.style.left = `${e.clientX - rect.left + 20}px`;
                    mapTooltip.style.top = `${e.clientY - rect.top + 20}px`;
                    window.updateMapTooltipText(tooltipKey);
                } else {
                    mapTooltip.style.display = 'none';
                }
            };
            mapImage.onmouseleave = function() {
                mapTooltip.style.display = 'none';
            };
            } else {
                // Для мобильных устройств показываем кнопку переключения подсказок
                const toggleButton = document.getElementById('toggle-tooltips');
                if (toggleButton) {
                    toggleButton.style.display = 'flex';
                }
                // Показываем все подсказки по умолчанию
                setTimeout(() => {
                    MapModal.showAllTooltips();
                }, 100);
            }

            // Добавляем обработчик изменения языка для обновления текста подсказки
            document.addEventListener('languageChanged', function() {
                // Проверяем, открыто ли модальное окно и видна ли подсказка
                if (mapModal.style.display === 'flex' && mapTooltip.style.display === 'block') {
                     // Пытаемся обновить текст текущей подсказки, если возможно
                     // Это требует сохранения ключа подсказки, что сейчас не делается.
                     // Для простой реализации, можно просто скрыть/показать подсказку.
                     mapTooltip.style.display = 'none'; // Скрываем при смене языка
                     // В более сложной реализации здесь нужно было бы заново определить
                     // под какой областью курсор и показать подсказку с новым текстом.
                }
                
                // Обновляем мобильные подсказки при смене языка
                if (window.innerWidth <= 768) {
                    MapModal.showAllTooltips();
                }
            });
        });

        // TODO: Add click handler for openQuestBtn
        openQuestBtn.addEventListener('click', function() {
            const bookOverlay = document.querySelector(Common.COMMON_ELEMENTS.BOOK_OVERLAY);
            const bookContainer = bookOverlay.querySelector('.book-container');
            const bookTitle = bookOverlay.querySelector('.book-title');
            const bookSound = document.getElementById('bookSound');
            const container = document.querySelector(Common.COMMON_ELEMENTS.IMAGE_CONTAINER);
            const questTasksList = bookOverlay.querySelector('.quest-tasks');
            const bookImageContentWrapper = bookOverlay.querySelector('.book-image-content-wrapper');
            const bookContentArea = bookOverlay.querySelector('.book-content-area');

            if (!bookOverlay || !bookContainer || !bookTitle || !bookSound || !container || !questTasksList || !bookImageContentWrapper || !bookContentArea) {
                return;
            }

            // Очищаем список перед заполнением
            questTasksList.innerHTML = '';

            // Определяем номер и изображение активного квеста на странице (если есть)
            const activeQuestMark = document.querySelector('.map-mark[data-quest-number]');
            const loadQuestState = () => { try { const raw = JSON.parse(sessionStorage.getItem('questState') || '{}'); if (!raw.tasks) raw.tasks = {}; return raw; } catch (_) { return { tasks: {} }; } };
            const questState = loadQuestState();
            // Берем номер из активной метки, иначе fallback к последнему подготовленному или 1
            const currentQuestNumber = activeQuestMark ? parseInt(activeQuestMark.getAttribute('data-quest-number')) : (questState.__lastPreparedNumber || 1);
            const currentQuestImage = activeQuestMark ? activeQuestMark.getAttribute('data-quest-image') : '';

            // Загрузка состояния квестов из sessionStorage
            const isPrepared = !!(questState && questState.tasks && (questState.tasks[currentQuestNumber] === true || (questState.tasks[currentQuestNumber] && questState.tasks[currentQuestNumber].prepared)));
            const preparedImage = questState && questState.tasks && questState.tasks[currentQuestNumber] && questState.tasks[currentQuestNumber].image;

            // Удаляем предыдущее изображение tumski.jpeg, если оно есть
            const existingTitleImages = bookContentArea.querySelectorAll('img[src="media/watercolor/tumski.jpeg"]');
            existingTitleImages.forEach(img => img.remove());

            // Показываем модальное окно и сбрасываем прокрутку
            bookOverlay.style.display = 'flex';
            
            // Сбрасываем прокрутку контента к началу после того, как окно стало видимым
            setTimeout(() => {
                bookImageContentWrapper.scrollTop = 0;
                bookContentArea.scrollTop = 0;
            }, 0);

            // Воспроизводим звук книги
            if (bookSound) bookSound.play();

            // Заполняем список заданий
            for (let i = 1; i <= 12; i++) {
                const listItem = document.createElement('li');

                // Чекбоксы (обычный и яркий) с учетом состояния
                const checkboxContainer = document.createElement('div');
                checkboxContainer.style.display = 'inline-block';
                checkboxContainer.style.position = 'relative';
                checkboxContainer.style.width = '20px';
                checkboxContainer.style.height = '20px';
                checkboxContainer.style.marginRight = '10px';
                checkboxContainer.style.verticalAlign = 'middle';

                const checkboxImg = document.createElement('img');
                checkboxImg.src = 'media/checkbox0.png';
                checkboxImg.alt = 'Checkbox';
                checkboxImg.style.position = i === currentQuestNumber ? 'absolute' : 'relative';
                checkboxImg.style.width = '100%';
                checkboxImg.style.height = '100%';

                // Состояние подготовленности для конкретного пункта
                const isPreparedItemCheckbox = !!(questState && questState.tasks && (questState.tasks[i] === true || (questState.tasks[i] && questState.tasks[i].prepared)));

                // Всегда показываем яркую галочку для подготовленных пунктов
                if (isPreparedItemCheckbox || (i === currentQuestNumber && isPrepared)) {
                    const brightCheckbox = document.createElement('img');
                    brightCheckbox.src = 'media/checkbox1.png';
                    brightCheckbox.alt = 'Bright Checkbox';
                    brightCheckbox.style.position = 'relative';
                    brightCheckbox.style.width = '100%';
                    brightCheckbox.style.height = '100%';
                    brightCheckbox.style.opacity = '1';
                    brightCheckbox.dataset.brightCheckbox = 'true';
                    checkboxContainer.appendChild(checkboxImg);
                    checkboxContainer.appendChild(brightCheckbox);
                    checkboxImg.style.opacity = '0';
                } else {
                    checkboxContainer.appendChild(checkboxImg);
                }

                listItem.appendChild(checkboxContainer);

                // Текст задания с учетом состояния
                const taskTextSpan = document.createElement('span');
                taskTextSpan.textContent = window.i18n ? window.i18n.t(`quest.task${i}`) : `Задание ${i}`;
                if ((i === currentQuestNumber && isPrepared) || (questState && questState.tasks && questState.tasks[i])) {
                    taskTextSpan.style.color = '#8B4513';
                    taskTextSpan.style.fontWeight = 'bold';
                }
                listItem.appendChild(taskTextSpan);
                
                questTasksList.appendChild(listItem);

                // Определяем состояние подготовленности пункта
                const baseSrc = `media/watercolor/${i}.jpg`;
                const preparedImageItem = questState && questState.tasks && questState.tasks[i] && questState.tasks[i].image;
                const isPreparedItem = !!(questState && questState.tasks && (questState.tasks[i] === true || (questState.tasks[i] && questState.tasks[i].prepared)));
                const chosenImage = isPreparedItem ? (preparedImageItem || baseSrc) : baseSrc;
                
                // Рандомный угол для изображения
                const randomAngle = (Math.random() * 10 - 5).toFixed(1);

                // Если пункт уже подготовлен - сразу создаем flip-карточку, иначе обычное изображение
                if (!isPreparedItem) {
                    // Обычное изображение для неподготовленных пунктов
                    const taskImage = document.createElement('img');
                    taskImage.src = chosenImage;
                    taskImage.alt = `Задание ${i}`;
                    taskImage.classList.add('task-image');
                    taskImage.style.width = '100%';
                    taskImage.style.maxWidth = '400px';
                    taskImage.style.marginTop = '20px';
                    taskImage.style.marginBottom = '20px';
                    taskImage.style.display = 'block';
                    taskImage.style.marginLeft = 'auto';
                    taskImage.style.marginRight = 'auto';
                    taskImage.style.transform = `rotate(${randomAngle}deg)`;
                    taskImage.style.boxShadow = '5px 5px 10px rgba(0,0,0,0.5)';
                    taskImage.style.padding = '8px';
                    taskImage.style.background = '#fff';
                    taskImage.style.transition = 'all 0.3s ease';
                    taskImage.style.cursor = 'pointer';
                    taskImage.dataset.originalAngle = randomAngle;
                    taskImage.onmouseover = function() {
                        this.style.transform = 'rotate(0deg) scale(1.02)';
                        this.style.boxShadow = '8px 8px 15px rgba(0,0,0,0.6)';
                    };
                    taskImage.onmouseout = function() {
                        this.style.transform = `rotate(${this.dataset.originalAngle}deg)`;
                        this.style.boxShadow = '5px 5px 10px rgba(0,0,0,0.5)';
                    };
                    questTasksList.appendChild(taskImage);
                }
                
                // Если это подготовленный пункт — сразу создаем кнопки и flip-карточку
                if (isPreparedItem) {
                    // Кнопки звука и переворота рядом с текстом
                    const localSoundButton = document.createElement('button');
                    localSoundButton.className = 'quest-sound-button';
                    localSoundButton.style.opacity = '1';
                    localSoundButton.style.transition = 'opacity 0.5s ease, transform 120ms ease';
                    localSoundButton.style.background = 'none';
                    localSoundButton.style.border = 'none';
                    localSoundButton.style.cursor = 'pointer';
                    localSoundButton.style.padding = '0';
                    localSoundButton.style.marginLeft = '12px';
                    localSoundButton.style.display = 'inline-flex';
                    localSoundButton.style.verticalAlign = 'middle';
                    const soundIcon = document.createElement('img');
                    soundIcon.src = 'media/sound.jpg';
                    soundIcon.alt = 'Звук';
                    soundIcon.style.width = '28px';
                    soundIcon.style.height = '28px';
                    soundIcon.style.objectFit = 'contain';
                    soundIcon.style.filter = 'sepia(0.6) saturate(0.9) hue-rotate(330deg)';
                    localSoundButton.appendChild(soundIcon);

                    const flipButton = document.createElement('button');
                    flipButton.className = 'quest-flip-button';
                    flipButton.style.opacity = '1';
                    flipButton.style.transition = 'opacity 0.5s ease, transform 120ms ease';
                    flipButton.style.background = 'none';
                    flipButton.style.border = 'none';
                    flipButton.style.cursor = 'pointer';
                    flipButton.style.padding = '0';
                    flipButton.style.marginLeft = '8px';
                    flipButton.style.display = 'inline-flex';
                    flipButton.style.verticalAlign = 'middle';
                    const flipIcon = document.createElement('img');
                    flipIcon.src = 'media/revers.jpg';
                    flipIcon.alt = 'Перевернуть';
                    flipIcon.style.width = '28px';
                    flipIcon.style.height = '28px';
                    flipIcon.style.objectFit = 'contain';
                    flipIcon.style.filter = 'sepia(0.6) saturate(0.9) hue-rotate(330deg)';
                    flipButton.appendChild(flipIcon);

                    // Вставляем кнопки после текста пункта
                    listItem.appendChild(localSoundButton);
                    listItem.appendChild(flipButton);

                    // Создаем flip-карточку сразу
                    const questImageSrc = chosenImage;
                    
                    // Создаем временное изображение для получения пропорций (fallback к квадрату)
                    const tempImg = document.createElement('img');
                    tempImg.src = questImageSrc;
                    const buildFlip = (naturalW, naturalH) => {
                        const aspectRatio = naturalW > 0 ? (naturalH / naturalW) : 1;
                        
                        const flipScene = document.createElement('div');
                        flipScene.style.position = 'relative';
                        flipScene.style.width = '100%';
                        flipScene.style.maxWidth = '400px';
                        flipScene.style.marginTop = '20px';
                        flipScene.style.marginBottom = '20px';
                        flipScene.style.marginLeft = 'auto';
                        flipScene.style.marginRight = 'auto';
                        flipScene.style.perspective = '1000px';
                        flipScene.style.transform = `rotate(${randomAngle}deg)`;
                        flipScene.style.boxShadow = '5px 5px 10px rgba(0,0,0,0.5)';
                        flipScene.style.transition = 'all 0.3s ease';
                        flipScene.dataset.originalAngle = randomAngle;
                        flipScene.addEventListener('mouseover', function() {
                            this.style.transform = 'rotate(0deg) scale(1.02)';
                            this.style.boxShadow = '8px 8px 15px rgba(0,0,0,0.6)';
                        });
                        flipScene.addEventListener('mouseout', function() {
                            this.style.transform = `rotate(${this.dataset.originalAngle}deg)`;
                            this.style.boxShadow = '5px 5px 10px rgba(0,0,0,0.5)';
                        });

                        const ratioBox = document.createElement('div');
                        ratioBox.style.position = 'relative';
                        ratioBox.style.width = '100%';
                        ratioBox.style.paddingTop = (aspectRatio * 100) + '%';

                        const flipCard = document.createElement('div');
                        flipCard.style.position = 'absolute';
                        flipCard.style.top = '0';
                        flipCard.style.left = '0';
                        flipCard.style.right = '0';
                        flipCard.style.bottom = '0';
                        flipCard.style.transformStyle = 'preserve-3d';
                        flipCard.style.transition = 'transform 0.8s ease';
                        flipCard.style.cursor = 'pointer';

                        const front = document.createElement('div');
                        front.style.position = 'absolute';
                        front.style.top = '0';
                        front.style.left = '0';
                        front.style.right = '0';
                        front.style.bottom = '0';
                        front.style.backfaceVisibility = 'hidden';
                        const frontImg = document.createElement('img');
                        frontImg.src = questImageSrc;
                        frontImg.alt = 'Открытка (лицевая сторона)';
                        frontImg.style.width = '100%';
                        frontImg.style.height = '100%';
                        frontImg.style.objectFit = 'contain';
                        frontImg.style.display = 'block';
                        frontImg.style.padding = '8px';
                        frontImg.style.boxSizing = 'border-box';
                        frontImg.style.background = '#fff';
                        frontImg.style.borderRadius = '5px';
                        front.appendChild(frontImg);

                        // Если пункт 1 уже активирован — добавляем подпись "Ожидание" на лицевую сторону
                        if (i === 1 && isPreparedItem) {
                            const expectationText = document.createElement('div');
                            expectationText.textContent = (window.i18n ? window.i18n.t('quest.expectation') : 'Ожидание');
                            expectationText.style.position = 'absolute';
                            expectationText.style.bottom = '8px';
                            expectationText.style.left = '50%';
                            expectationText.style.transform = 'translateX(-50%)';
                            expectationText.style.color = '#e8dba3';
                            expectationText.style.fontSize = '30px';
                            expectationText.style.fontFamily = '"Marck Script", cursive, serif';
                            expectationText.style.fontWeight = 'normal';
                            expectationText.style.zIndex = '2';
                            front.appendChild(expectationText);
                        }

                        const back = document.createElement('div');
                        back.style.position = 'absolute';
                        back.style.top = '0';
                        back.style.left = '0';
                        back.style.right = '0';
                        back.style.bottom = '0';
                        back.style.transform = 'rotateY(180deg)';
                        back.style.backfaceVisibility = 'hidden';
                        back.style.overflow = 'hidden';
                        const backImg = document.createElement('img');
                        backImg.src = (i === 1) ? 'media/watercolor/lev.jpg' : 'media/watercolor/oldcard.jpg';
                        backImg.alt = 'Открытка (оборот)';
                        backImg.style.position = 'absolute';
                        backImg.style.top = '0';
                        backImg.style.left = '0';
                        backImg.style.width = '100%';
                        backImg.style.height = '100%';
                        backImg.style.display = 'block';
                        backImg.style.boxSizing = 'border-box';
                        
                        // Для lev.jpg добавляем белые поля, как у lev_02.jpg
                        if (i === 1) {
                            backImg.style.objectFit = 'contain';
                            backImg.style.padding = '8px';
                            backImg.style.background = '#fff';
                            backImg.style.borderRadius = '5px';
                        } else {
                            backImg.style.objectFit = 'fill';
                            backImg.style.padding = '0';
                            backImg.style.background = 'transparent';
                            backImg.style.borderRadius = '0';
                        }
                        back.appendChild(backImg);

                        // Добавим сверху текст (quest.back) поверх оборота
                        const backCard = document.createElement('div');
                        backCard.style.position = 'absolute';
                        backCard.style.top = '0';
                        backCard.style.left = '0';
                        backCard.style.right = '0';
                        backCard.style.zIndex = '2';
                        backCard.style.width = '100%';
                        backCard.style.display = 'flex';
                        backCard.style.flexDirection = 'column';
                        backCard.style.alignItems = 'center';
                        backCard.style.justifyContent = 'flex-start';
                        backCard.style.background = 'transparent';
                        backCard.style.border = 'none';
                        backCard.style.borderRadius = '0';
                        backCard.style.boxShadow = 'none';
                        backCard.style.padding = '8px';
                        backCard.style.boxSizing = 'border-box';
                        backCard.style.fontFamily = 'serif';
                        backCard.style.color = '#5b4636';
                        backCard.style.textAlign = 'center';
                        backCard.style.pointerEvents = 'none';
                        const backText = document.createElement('div');
                        backText.textContent = (window.i18n ? window.i18n.t(`quest.back${i}`) : '') || `Задание ${i}: подробности и заметки.`;
                        backText.style.lineHeight = '1.4';
                        backText.style.fontSize = '20px';
                        backText.style.fontFamily = '"Marck Script", cursive, serif';
                        backText.style.fontWeight = 'normal';
                        backText.style.whiteSpace = 'normal';
                        backText.style.wordBreak = 'break-word';
                        backText.style.hyphens = 'auto';
                        backText.style.maxWidth = '92%';
                        backText.style.margin = '8px auto 0';
                        back.appendChild(backImg);
                        back.appendChild(backCard);
                        backCard.appendChild(backText);

                        // Если пункт 1 уже активирован — добавляем подпись "Реальность" на оборот
                        if (i === 1 && isPreparedItem) {
                            const realityText = document.createElement('div');
                            realityText.textContent = (window.i18n ? window.i18n.t('quest.reality') : 'Реальность');
                            realityText.style.position = 'absolute';
                            realityText.style.bottom = '8px';
                            realityText.style.left = '50%';
                            realityText.style.transform = 'translateX(-50%)';
                            realityText.style.color = '#e8dba3';
                            realityText.style.fontSize = '30px';
                            realityText.style.fontFamily = '"Marck Script", cursive, serif';
                            realityText.style.fontWeight = 'normal';
                            realityText.style.zIndex = '2';
                            back.appendChild(realityText);
                        }

                        // Функция подгонки размера текста
                        const fitBackText = () => {
                            const minPx = 8;
                            const maxPx = 24;
                            let best = minPx;
                            const padding = 20; // увеличиваем отступы
                            
                            // Ждем, пока элементы получат размеры
                            if (!back.clientHeight || !back.clientWidth) {
                                setTimeout(fitBackText, 50);
                                return;
                            }
                            
                            const availableHeight = Math.max(0, back.clientHeight - padding);
                            const availableWidth = Math.max(0, back.clientWidth - padding);
                            
                            // Бинарный поиск оптимального размера шрифта
                            let low = minPx;
                            let high = maxPx;
                            
                            while (low <= high) {
                                const mid = Math.floor((low + high) / 2);
                                backText.style.fontSize = mid + 'px';
                                
                                // Принудительно пересчитываем layout
                                backText.offsetHeight;
                                
                                const fits = backText.scrollHeight <= availableHeight && backText.scrollWidth <= availableWidth;
                                if (fits) {
                                    best = mid;
                                    low = mid + 1;
                                } else {
                                    high = mid - 1;
                                }
                            }
                            backText.style.fontSize = best + 'px';
                        };

                        flipCard.appendChild(front);
                        flipCard.appendChild(back);

                        // Добавляем flip-сцену в список задач
                        // Гарантируем кликабельность всей сцены
                        flipScene.style.pointerEvents = 'auto';
                        flipScene.style.cursor = 'pointer';
                        frontImg.style.pointerEvents = 'auto';
                        backImg.style.pointerEvents = 'auto';

                        flipScene.appendChild(ratioBox);
                        ratioBox.appendChild(flipCard);
                        questTasksList.appendChild(flipScene);

                        // Запускаем подгонку размера текста после вставки в DOM
                        setTimeout(() => {
                            fitBackText();
                            // Подгон после загрузки изображения оборота
                            if (backImg.complete) {
                                fitBackText();
                            } else {
                                backImg.addEventListener('load', () => {
                                    setTimeout(fitBackText, 50);
                                });
                            }
                        }, 100);

                        // Звук и обработчики
                        const questSound = new Audio('media/zwyki/quest.mp3');
                        questSound.volume = 0.4;
                        const flipSound = new Audio('media/opening-a-book.wav');
                        const isGloballyMuted = () => {
                            const mainSoundButton = document.querySelector('.sound-menu-button');
                            return mainSoundButton ? mainSoundButton.classList.contains('muted') : false;
                        };
                        localSoundButton.addEventListener('click', () => {
                            if (questSound.paused) {
                                questSound.play();
                                soundIcon.style.opacity = '1';
                            } else {
                                questSound.pause();
                                soundIcon.style.opacity = '0.6';
                            }
                        });
                        let flipped = false;
                        const doFlip = () => {
                            flipped = !flipped;
                            flipCard.style.transform = flipped ? 'rotateY(180deg)' : 'rotateY(0deg)';
                            if (!isGloballyMuted()) { flipSound.currentTime = 0; flipSound.play(); }
                        };
                        flipCard.addEventListener('click', doFlip);
                        // Дополнительно реагируем на клик по всей сцене и по картинкам
                        flipScene.addEventListener('click', doFlip);
                        frontImg.addEventListener('click', (e) => { e.stopPropagation(); doFlip(); });
                        backImg.addEventListener('click', (e) => { e.stopPropagation(); doFlip(); });
                        flipButton.addEventListener('click', doFlip);
                    };
                    if (tempImg.complete) {
                        buildFlip(tempImg.naturalWidth, tempImg.naturalHeight);
                    } else {
                        tempImg.onload = () => buildFlip(tempImg.naturalWidth, tempImg.naturalHeight);
                        tempImg.onerror = () => buildFlip(0, 0);
                        // Fallback: если событие не пришло, строим квадрат
                        setTimeout(() => { if (!tempImg.complete) buildFlip(0, 0); }, 500);
                    }
                }
            }

            // Устанавливаем текст заголовка из локализации
            bookTitle.textContent = window.i18n ? window.i18n.t('quest.title1') : "Квест 1: Найди все тайны Тумского острова";
            bookTitle.style.display = 'block';
            // Добавляем кнопку очистки квеста рядом с заголовком
            (function ensureResetButton() {
                const parent = bookTitle.parentNode;
                if (!parent) return;
                const titleWrapper = document.createElement('div');
                titleWrapper.className = 'book-title-container';
                titleWrapper.style.display = 'flex';
                titleWrapper.style.alignItems = 'center';
                titleWrapper.style.justifyContent = 'center';
                titleWrapper.style.gap = '0';
                const existingReset = parent.querySelector('.quest-reset-button');
                if (existingReset) existingReset.remove();
                const resetBtn = document.createElement('button');
                resetBtn.className = 'quest-reset-button';
                resetBtn.textContent = (window.i18n ? window.i18n.t('quest.clearButton') : '') || 'Очистить квест';
                resetBtn.style.background = 'url("media/clear.jpg") center/contain no-repeat';
                resetBtn.style.width = '64px';
                resetBtn.style.height = '64px';
                resetBtn.style.fontSize = '0';
                resetBtn.style.border = 'none';
                resetBtn.style.borderRadius = '6px';
                resetBtn.style.padding = '6px 10px';
                resetBtn.style.cursor = 'pointer';
                resetBtn.style.fontFamily = 'serif';
                resetBtn.style.color = '#5b4636';
                resetBtn.style.boxShadow = 'inset 0 0 0 2px rgba(0,0,0,0.05)';
                resetBtn.title = (window.i18n ? window.i18n.t('quest.clearTooltip') : '') || 'Очистить результаты квеста';
                resetBtn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    const confirmText = window.i18n ? window.i18n.t('quest.clearConfirm') : 'Вы точно хотите очистить результаты квеста?';
                    const confirmed = await window.showQuestConfirmDialog(confirmText);
                    if (confirmed) {
                    try { sessionStorage.removeItem('questState'); } catch (_) {}
                    // Перерисовать модалку без закрытия и без анимаций/звуков
                    try {
                            // Находим текущий активный пункт перед очисткой
                            const activeItem = questTasksList.querySelector('li[data-target-item="true"]');
                            if (activeItem) {
                                // Ищем коричневый текст и его чёрный сосед до перерисовки
                                const brightText = activeItem.querySelector('span[data-bright-text="true"]');
                                const normalText = brightText ? brightText.previousElementSibling : activeItem.querySelector('span');
                                if (normalText) {
                                    normalText.style.display = '';
                                    normalText.style.position = 'relative';
                                    normalText.style.opacity = '1';
                                }
                                if (brightText) brightText.remove();
                            }
                        window.__quest_suppress_effects = true;
                        openQuestBtn.click();
                        setTimeout(() => { window.__quest_suppress_effects = false; }, 0);
                    } catch (_) {}
                    }
                });

                parent.replaceChild(titleWrapper, bookTitle);
                titleWrapper.appendChild(bookTitle);
                titleWrapper.appendChild(resetBtn);
            })();

            // Добавляем вводный текст
            renderQuestIntro(bookContentArea, questTasksList);

            // Добавляем картинку под заголовком, но перед вводным текстом
            const titleImage = document.createElement('img');
            titleImage.src = 'media/watercolor/tumski.jpeg';
            titleImage.alt = 'Тумский остров';
            titleImage.style.width = '100%';
            titleImage.style.maxWidth = '500px';
            titleImage.style.margin = '20px auto';
            titleImage.style.display = 'block';
            titleImage.style.borderRadius = '8px';
            titleImage.style.boxShadow = '3px 3px 8px rgba(0,0,0,0.3)';
            
            // Вставляем картинку после заголовка, но перед вводным текстом
            const questIntro = bookContentArea.querySelector('.quest-intro');
            if (questIntro) {
                bookContentArea.insertBefore(titleImage, questIntro);
            } else {
                bookContentArea.appendChild(titleImage);
            }
            
            // Для мобильной версии меняем порядок: сначала картинка, потом заголовок
            if (window.innerWidth <= 768) {
                // Перемещаем заголовок после картинки
                const bookTitle = bookContentArea.querySelector('.book-title');
                if (bookTitle && titleImage) {
                    titleImage.parentNode.insertBefore(bookTitle, titleImage.nextSibling);
                }
            }

            // Открываем модальное окно
            bookOverlay.style.display = 'flex';

            // Принудительное применение мобильных стилей
            if (window.innerWidth <= 768) {
                setTimeout(() => {
                    const bookContainer = bookOverlay.querySelector('.book-container');
                    const bookImageWrapper = bookOverlay.querySelector('.book-image-content-wrapper');
                    const bookContentArea = bookOverlay.querySelector('.book-content-area');
                    const bookTitle = bookOverlay.querySelector('.book-title');
                    const questTasks = bookOverlay.querySelector('.quest-tasks');
                    
                    if (bookContainer) {
                        bookContainer.style.width = '100vw';
                        bookContainer.style.height = '100vh';
                        bookContainer.style.flexDirection = 'column';
                        bookContainer.style.alignItems = 'center';
                        bookContainer.style.justifyContent = 'center';
                    }
                    
                    if (bookImageWrapper) {
                        bookImageWrapper.style.width = '100%';
                        bookImageWrapper.style.height = '100vh';
                        bookImageWrapper.style.maxHeight = '100vh';
                        bookImageWrapper.style.flex = 'none';
                        bookImageWrapper.style.position = 'relative';
                        bookImageWrapper.style.display = 'flex';
                        bookImageWrapper.style.flexDirection = 'column';
                        bookImageWrapper.style.alignItems = 'center';
                        bookImageWrapper.style.justifyContent = 'center';
                    }
                    
                    if (bookContentArea) {
                        bookContentArea.style.position = 'absolute';
                        bookContentArea.style.top = '0';
                        bookContentArea.style.left = '0';
                        bookContentArea.style.width = '100%';
                        bookContentArea.style.zIndex = '2';
                        bookContentArea.style.display = 'flex';
                        bookContentArea.style.flexDirection = 'column';
                        bookContentArea.style.alignItems = 'center';
                        bookContentArea.style.justifyContent = 'center';
                    }
                    
                    if (bookTitle) {
                        bookTitle.style.position = 'absolute';
                        bookTitle.style.top = window.innerWidth <= 480 ? '15%' : '20%';
                        bookTitle.style.left = '50%';
                        bookTitle.style.transform = 'translateX(-50%)';
                        bookTitle.style.zIndex = '10';
                        bookTitle.style.marginTop = '40px';
                    }
                    
                    if (questTasks) {
                        questTasks.style.top = window.innerWidth <= 480 ? '35%' : '40%';
                        questTasks.style.left = '50%';
                        questTasks.style.zIndex = '10';
                        questTasks.style.maxWidth = window.innerWidth <= 480 ? '85%' : '80%';
                    }
                }, 100);
            }

            // Воспроизведение звука книги
            if (bookSound) bookSound.play();
            
            // Скрываем элементы книги внутри модалки, которые не нужны для картинки квеста
            const contentImage = bookContainer.querySelector('.content-image');
            const bookText = bookContainer.querySelector('.book-text');
            const scrollIndicator = bookContainer.querySelector('.scroll-indicator');

            if (contentImage) contentImage.style.display = 'none';
            if (bookText) bookText.style.display = 'none';
            if (scrollIndicator) scrollIndicator.style.display = 'none';

            // Запускаем подсветку зон-кнопок только после появления их в DOM
            function tryShowHighlight() {
                const zones = document.querySelectorAll('.right-zones .book-zone');
                if (zones.length > 0 && window.showInitialHighlight) {
                    window.showInitialHighlight();
                } else {
                    setTimeout(tryShowHighlight, 50);
                }
            }
            tryShowHighlight();
        });

        closeMapBtn.addEventListener('click', function() {
            mapModal.style.display = 'none';
            // Останавливаем звук карты
            const mapSound = document.getElementById('mapSound');
            if (mapSound) mapSound.pause();
            if (mapSound) mapSound.currentTime = 0;
            
            // Удаляем обработчики свайпа
            const mapContainer = document.querySelector('#map-modal > div');
            if (mapContainer && mapContainer._removeSwipeListeners) {
                mapContainer._removeSwipeListeners();
            }
        });

        // Обработчик для кнопки переключения подсказок
        toggleTooltipsBtn.addEventListener('click', function() {
            const tooltips = document.querySelectorAll('.mobile-tooltip');
            const isVisible = tooltips.length > 0 && tooltips[0].style.display !== 'none';
            
            if (isVisible) {
                // Скрываем подсказки
                tooltips.forEach(tooltip => {
                    tooltip.style.display = 'none';
                });
                toggleTooltipsBtn.textContent = '👁️‍🗨️';
            } else {
                // Показываем подсказки
                tooltips.forEach(tooltip => {
                    tooltip.style.display = 'block';
                });
                toggleTooltipsBtn.textContent = '👁️';
            }
        });

        // Закрытие по клику вне карты
        mapModal.addEventListener('click', function(e) {
            if (e.target === mapModal) {
                mapModal.style.display = 'none';
                // Останавливаем звук карты
                const mapSound = document.getElementById('mapSound');
                 if (mapSound) mapSound.pause();
                 if (mapSound) mapSound.currentTime = 0;
                 
                 // Удаляем обработчики свайпа
                 const mapContainer = document.querySelector('#map-modal > div');
                 if (mapContainer && mapContainer._removeSwipeListeners) {
                     mapContainer._removeSwipeListeners();
                 }
            }
        });
    },

    positionMarker(coords) {
        const mapMarker = document.getElementById('map-marker');
        const mapImage = document.getElementById('map-image');
        // Проверяем, что элементы существуют
        if (!mapMarker || !mapImage) {
            return;
        }
        
        // Показываем маркер
        mapMarker.style.display = 'block';
        
        if (window.innerWidth <= 768) {
            // Для мобильных устройств
            const imageWidth = mapImage.offsetWidth;
            const imageHeight = mapImage.offsetHeight;
            
            // Преобразуем проценты в пиксели
            const markerX = (coords.x / 100) * imageWidth;
            const markerY = (coords.y / 100) * imageHeight;
            
            mapMarker.style.position = 'absolute';
            mapMarker.style.left = `${markerX}px`;
            mapMarker.style.top = `${markerY}px`;
            mapMarker.style.transform = 'translate(-50%, -50%)';
            mapMarker.style.zIndex = '1002';
            mapMarker.style.pointerEvents = 'none';
            
            // Убеждаемся, что маркер виден в области просмотра
            const container = document.querySelector('#map-modal > div');
            if (container) {
                const scrollLeft = Math.max(0, markerX - (window.innerWidth / 2));
                container.scrollLeft = scrollLeft;
            }
        } else {
            // Для десктопа оставляем процентное позиционирование
            mapMarker.style.left = `${coords.x}%`;
            mapMarker.style.top = `${coords.y}%`;
            mapMarker.style.transform = 'translate(-50%, -50%)';
        }
    },

    setupMobileSwipe() {
        const mapContainer = document.querySelector('#map-modal > div');
        const mapImage = document.getElementById('map-image');
        
        if (!mapContainer || !mapImage) return;
        
        let startX = 0;
        let startY = 0;
        let currentScrollLeft = 0;
        let isDragging = false;
        let lastTouchTime = 0;
        
        // Обработчик начала касания
        const handleTouchStart = (e) => {
            const touch = e.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;
            currentScrollLeft = mapContainer.scrollLeft;
            isDragging = true;
            lastTouchTime = Date.now();
            
            // Останавливаем любые анимации прокрутки
            mapContainer.style.scrollBehavior = 'auto';
        };
        
        // Обработчик движения пальца
        const handleTouchMove = (e) => {
            if (!isDragging) return;
            
            const touch = e.touches[0];
            const deltaX = startX - touch.clientX;
            const deltaY = startY - touch.clientY;
            
            // Если движение больше по горизонтали, чем по вертикали, то это свайп
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                const newScrollLeft = currentScrollLeft + deltaX;
                mapContainer.scrollLeft = newScrollLeft;
                e.preventDefault();
            }
        };
        
        // Обработчик окончания касания
        const handleTouchEnd = (e) => {
            if (!isDragging) return;
            
            isDragging = false;
            const touchEndTime = Date.now();
            const touchDuration = touchEndTime - lastTouchTime;
            
            // Восстанавливаем плавную прокрутку
            mapContainer.style.scrollBehavior = 'smooth';
            
            // Если касание было коротким, это может быть быстрый свайп
            if (touchDuration < 300) {
                const touch = e.changedTouches[0];
                const deltaX = startX - touch.clientX;
                
                // Если свайп был достаточно быстрым и длинным, добавляем инерцию
                if (Math.abs(deltaX) > 50) {
                    const velocity = deltaX / touchDuration;
                    const momentum = velocity * 100;
                    const targetScroll = mapContainer.scrollLeft + momentum;
                    
                    // Плавно прокручиваем к целевой позиции
                    mapContainer.scrollTo({
                        left: targetScroll,
                        behavior: 'smooth'
                    });
                }
            }
        };
        
        // Добавляем обработчики событий
        mapContainer.addEventListener('touchstart', handleTouchStart, { passive: false });
        mapContainer.addEventListener('touchmove', handleTouchMove, { passive: false });
        mapContainer.addEventListener('touchend', handleTouchEnd);
        
        // Удаляем обработчики при закрытии модального окна
        const removeListeners = () => {
            mapContainer.removeEventListener('touchstart', handleTouchStart);
            mapContainer.removeEventListener('touchmove', handleTouchMove);
            mapContainer.removeEventListener('touchend', handleTouchEnd);
        };
        
        // Сохраняем функцию удаления для использования при закрытии
        mapContainer._removeSwipeListeners = removeListeners;
    },

    adjustMapImageSize() {
        const mapImage = document.getElementById('map-image');
        if (!mapImage) return;
        
        // Ждем загрузки изображения
        if (mapImage.complete) {
            this.calculateImageSize(mapImage);
        } else {
            mapImage.onload = () => {
                this.calculateImageSize(mapImage);
            };
        }
    },

    calculateImageSize(mapImage) {
        const screenHeight = window.innerHeight;
        const screenWidth = window.innerWidth;
        const imageAspectRatio = mapImage.naturalWidth / mapImage.naturalHeight;
        
        // Рассчитываем высоту изображения, чтобы оно поместилось по высоте экрана
        const targetHeight = screenHeight;
        const targetWidth = targetHeight * imageAspectRatio;
        
        // Устанавливаем размеры
        mapImage.style.height = targetHeight + 'px';
        mapImage.style.width = targetWidth + 'px';
        mapImage.style.maxWidth = 'none';
        mapImage.style.maxHeight = 'none';
        mapImage.style.objectFit = 'none';
        mapImage.style.objectPosition = 'left center';
        
        // Перепозиционируем маркер после изменения размера изображения
        setTimeout(async () => {
            try {
                const { getMapPointCoords } = await import('./map_points.js');
                const coords = getMapPointCoords(1);
                if (coords) {
                    this.positionMarker(coords);
                }
            } catch (error) {
                // Ошибка при перепозиционировании маркера
            }
        }, 100);
    },

    async showAllTooltips() {
        try {
            const { tooltipPoints } = await import('./map_points.js');
            const mapImage = document.getElementById('map-image');
            const mapContainer = document.querySelector('#map-modal > div');
            
            if (!mapImage || !mapContainer || !tooltipPoints) {
                return;
            }
            
            // Очищаем старые подсказки
            const oldTooltips = mapContainer.querySelectorAll('.mobile-tooltip');
            oldTooltips.forEach(tooltip => tooltip.remove());
            
            // Создаем подсказки для всех точек
            const createdTooltips = [];
            
            Object.entries(tooltipPoints).forEach(([key, coords]) => {
                const tooltip = document.createElement('div');
                tooltip.className = 'mobile-tooltip';
                tooltip.style.position = 'absolute';
                
                // Пересчитываем координаты относительно реального размера карты
                const xPercent = coords.x / 100;
                const yPercent = coords.y / 100;
                
                // Сохраняем оригинальные координаты в data-атрибутах
                tooltip.dataset.xPercent = xPercent;
                tooltip.dataset.yPercent = yPercent;
                
                // Используем реальную ширину и высоту карты для расчета
                const xPos = mapImage.offsetWidth * xPercent;
                const yPos = (mapImage.offsetHeight * yPercent) + 25; // Опускаем подсказки на 15px ниже
                
                tooltip.style.left = `${xPos}px`;
                tooltip.style.top = `${yPos}px`;
                tooltip.style.transform = 'translate(-50%, -50%)';
                tooltip.style.background = 'rgba(0,0,0,0.8)';
                tooltip.style.color = 'white';
                tooltip.style.padding = '8px 12px';
                tooltip.style.borderRadius = '4px';
                tooltip.style.fontSize = '12px';
                tooltip.style.pointerEvents = 'none';
                tooltip.style.zIndex = '1003';
                tooltip.style.minWidth = '120px';
                tooltip.style.maxWidth = '200px';
                tooltip.style.textAlign = 'center';
                tooltip.style.whiteSpace = 'normal';
                tooltip.style.wordWrap = 'break-word';
                tooltip.style.lineHeight = '1.2';
                
                // Получаем текст подсказки
                const camelToSnake = (str) => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
                const keySnake = camelToSnake(key);
                const tooltipText = window.i18n ? window.i18n.t('map.' + keySnake) : key;
                tooltip.textContent = tooltipText;
                
                mapContainer.appendChild(tooltip);
                createdTooltips.push(tooltip);
            });
            
            // Проверяем и исправляем перекрытия
            this.fixTooltipOverlaps(createdTooltips);
            
            // Добавляем обработчик для обновления позиций при прокрутке
            mapContainer.addEventListener('scroll', () => {
                this.updateTooltipPositions();
            });
            
            // Добавляем обработчик для обновления позиций при изменении размера окна
            window.addEventListener('resize', () => {
                setTimeout(() => {
                    this.updateTooltipPositions();
                }, 100);
            });
            
        } catch (error) {
            // Ошибка при показе подсказок
        }
    },

    updateTooltipPositions() {
        const mapImage = document.getElementById('map-image');
        const mapContainer = document.querySelector('#map-modal > div');
        const tooltips = mapContainer.querySelectorAll('.mobile-tooltip');
        
        if (!mapImage || !mapContainer || tooltips.length === 0) return;
        
        tooltips.forEach(tooltip => {
            // Получаем оригинальные координаты из data-атрибутов
            const xPercent = parseFloat(tooltip.dataset.xPercent);
            const yPercent = parseFloat(tooltip.dataset.yPercent);
            
            if (isNaN(xPercent) || isNaN(yPercent)) return;
            
            // Пересчитываем позицию относительно реального размера карты
            const xPos = mapImage.offsetWidth * xPercent;
            const yPos = (mapImage.offsetHeight * yPercent) + 25; // Опускаем подсказки на 25px ниже
            
            tooltip.style.left = `${xPos}px`;
            tooltip.style.top = `${yPos}px`;
        });
        
        // Проверяем и исправляем перекрытия после обновления позиций
        this.fixTooltipOverlaps(Array.from(tooltips));
    },

    fixTooltipOverlaps(tooltips) {
        if (tooltips.length < 2) return;
        
        // Функция для получения размеров и позиции подсказки
        const getTooltipBounds = (tooltip) => {
            const rect = tooltip.getBoundingClientRect();
            const containerRect = tooltip.parentElement.getBoundingClientRect();
            
            return {
                left: rect.left - containerRect.left,
                top: rect.top - containerRect.top,
                right: rect.right - containerRect.left,
                bottom: rect.bottom - containerRect.top,
                width: rect.width,
                height: rect.height
            };
        };
        
        // Функция для проверки пересечения двух прямоугольников
        const isOverlapping = (rect1, rect2) => {
            return !(rect1.right < rect2.left || 
                    rect1.left > rect2.right || 
                    rect1.bottom < rect2.top || 
                    rect1.top > rect2.bottom);
        };
        
        // Проверяем каждую пару подсказок на перекрытие
        for (let i = 0; i < tooltips.length; i++) {
            for (let j = i + 1; j < tooltips.length; j++) {
                const tooltip1 = tooltips[i];
                const tooltip2 = tooltips[j];
                
                const bounds1 = getTooltipBounds(tooltip1);
                const bounds2 = getTooltipBounds(tooltip2);
                
                if (isOverlapping(bounds1, bounds2)) {
                    // Если есть перекрытие, сдвигаем вторую подсказку вниз
                    const currentTop = parseFloat(tooltip2.style.top);
                    const newTop = currentTop + bounds1.height + 10; // 10px отступ
                    
                    tooltip2.style.top = `${newTop}px`;
                    
                    // Обновляем границы для второй подсказки
                    bounds2.top = newTop;
                    bounds2.bottom = newTop + bounds2.height;
                }
            }
        }
    }
};

// Экспортируем функции для использования в других модулях
window.MapModal = MapModal;

// Добавляем CSS стили для мобильных подсказок
const style = document.createElement('style');
style.textContent = `
    .mobile-tooltip {
        box-shadow: 0 2px 8px rgba(0,0,0,0.3) !important;
        border: 1px solid rgba(255,255,255,0.2) !important;
        backdrop-filter: blur(2px) !important;
    }
`;
document.head.appendChild(style);

function renderQuestIntro(bookContentArea, questTasksList) {
    // Удалить старый intro, если есть
    const oldIntro = bookContentArea.querySelector('.quest-intro');
    if (oldIntro) oldIntro.remove();

    const introText = document.createElement('div');
    introText.className = 'quest-intro';
    introText.style.fontFamily = "'Roboto', sans-serif";
    introText.style.fontSize = "clamp(14px, 2vw, 18px)";
    introText.style.lineHeight = "1.6";
    introText.style.color = "#333";
    introText.style.margin = "20px 0";
    introText.style.padding = "0 40px";
    introText.style.textAlign = "justify";
    introText.style.fontStyle = "italic";
    const introRaw = window.i18n ? window.i18n.t('quest.intro') : "";
    introText.innerHTML = introRaw.split(/\n\n/).map(par => `<p>${par}</p>`).join('');
    bookContentArea.insertBefore(introText, questTasksList);
}

// === Очистка инлайновых стилей у .most-title и .most-description при открытии модального окна ===
function clearMostModalInlineStyles() {
    document.querySelectorAll('.most-title, .most-description').forEach(el => {
        el.removeAttribute('style');
    });
}

// Функция для показа кастомного диалога подтверждения
async function showQuestConfirmDialog(message) {
    return new Promise((resolve) => {
        const dialog = document.querySelector('.quest-confirm-dialog');
        const overlay = document.querySelector('.quest-confirm-dialog-overlay');
        const textEl = dialog.querySelector('.dialog-text');
        const yesBtn = dialog.querySelector('.confirm-yes');
        const noBtn = dialog.querySelector('.confirm-no');

        // Устанавливаем текст
        textEl.textContent = message;
        yesBtn.textContent = window.i18n ? window.i18n.t('quest.clearConfirmYes') : 'Да';
        noBtn.textContent = window.i18n ? window.i18n.t('quest.clearConfirmNo') : 'Нет';

        // Показываем диалог
        overlay.style.display = 'block';
        dialog.style.display = 'block';

        // Воспроизводим звук открытия книги
        const bookSound = document.getElementById('bookSound');
        if (bookSound) {
            bookSound.currentTime = 0;
            bookSound.play();
        }

        // Обработчики кнопок
        const handleYes = () => {
            cleanup();
            resolve(true);
        };

        const handleNo = () => {
            cleanup();
            resolve(false);
        };

        const handleOverlayClick = (e) => {
            if (e.target === overlay) {
                cleanup();
                resolve(false);
            }
        };

        // Функция очистки
        const cleanup = () => {
            dialog.style.display = 'none';
            overlay.style.display = 'none';
            yesBtn.removeEventListener('click', handleYes);
            noBtn.removeEventListener('click', handleNo);
            overlay.removeEventListener('click', handleOverlayClick);
        };

        // Добавляем обработчики
        yesBtn.addEventListener('click', handleYes);
        noBtn.addEventListener('click', handleNo);
        overlay.addEventListener('click', handleOverlayClick);
    });
}

// Делаем функцию глобально доступной
window.showQuestConfirmDialog = showQuestConfirmDialog;

// Экспортируем объект MapModal
window.MapModal = MapModal; 