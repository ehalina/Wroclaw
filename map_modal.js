// Стили для кнопки карты и модального окна
const mapStyles = `
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
        width: 48px;
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
        max-width: 100%;
        height: auto; /* Высота подстраивается под содержимое */
        overflow: visible; /* Изменено с hidden на visible */
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding-top: 80px;
        box-sizing: border-box;
    }

    /* Добавляем стили для нового контейнера изображения и контента */
    .book-image-content-wrapper {
        position: relative;
        display: block;
        max-width: 100%;
        max-height: 100%;
    }

    .book-image {
        width: 100%;
        height: 100vh;
        object-fit: contain;
        display: block;
    }

    .book-title {
        position: absolute;
        top: 40px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 10;
        font-family: 'Roboto', sans-serif;
        font-weight: 200;
        font-style: italic;
        font-size: clamp(24px, 4vw, 32px);
        color: #333;
        text-align: center;
        width: calc(100% - 10%); /* Уменьшим ширину, оставляя 5% с каждой стороны */
        max-width: 800px; /* Ограничим максимальную ширину */
        margin: 0 auto; /* Центрируем блок */
        padding: 0; /* Удалим горизонтальный паддинг, так как ширина теперь учитывает его */
        box-sizing: border-box; /* Учитываем паддинг в ширине */
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
    }

    .quest-tasks {
        position: absolute;
        top: 150px; /* Приблизительное начальное значение, будет скорректировано JS */
        left: 60%;
        transform: translateX(-50%);
        z-index: 10;
        width: calc(90% - 20px); /* Уменьшим ширину, чтобы оставить место для скроллбара */
        max-width: 700px; /* Ограничим максимальную ширину */
        color: #333;
        font-family: 'Roboto', sans-serif;
        font-size: clamp(16px, 2.5vw, 20px);
        padding: 0; /* Удалим горизонтальный паддинг, так как ширина теперь учитывает его */
        margin: 0;
        list-style: none;
        overflow-y: auto;
        max-height: calc(100vh - 230px);
        padding-right: calc(15px); /* Сохраняем место для скроллбара */
        box-sizing: border-box; /* Учитываем паддинг в ширине */
    }

    .quest-tasks li {
        display: flex; /* Используем flexbox для выравнивания чекбокса и текста */
        align-items: center; /* Выравниваем элементы по центру вертикально */
        margin-bottom: 10px; /* Отступ между пунктами списка */
        text-align: left;
        counter-increment: quest-item; /* Счетчик для нумерации */
    }

     .quest-tasks li::before {
        content: counter(quest-item) ". "; /* Добавляем номер пункта */
        margin-right: 5px; /* Уменьшаем отступ после номера */
        font-weight: bold;
        flex-shrink: 0; /* Предотвращаем сжимание номера */
        align-self: center; /* Выравниваем по центру */
     }

    .quest-tasks li img {
        width: 35px; /* Размер чекбокса */
        height: 35px;
        margin-right: 5px; /* Уменьшаем отступ после чекбокса */
        flex-shrink: 0; /* Предотвращаем сжимание чекбокса */
        object-fit: contain;
        vertical-align: middle; /* Явно указываем вертикальное выравнивание */
        align-self: center; /* Выравниваем по центру */
        transform: translateY(-1px); /* Небольшое смещение вверх для точного выравнивания */
    }

    .quest-tasks li span {
        /* Стили для текста задания */
        flex-grow: 1; /* Разрешаем тексту занимать доступное место */
        align-self: center; /* Выравниваем по центру */
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
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: none;
        justify-content: center;
        align-items: center;
        z-index: 1001;
    }

    .most-container {
        position: relative;
        width: 90%;
        height: 90vh;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .image-wrapper {
        position: relative;
        display: inline-block;
        max-width: 100%;
        max-height: 100%;
    }

    .most-image {
        display: block;
        max-width: 100%;
        max-height: 90vh;
        object-fit: contain;
    }

    .most-title {
        position: absolute;
        bottom: 40px;
        left: 50%;
        transform: translateX(-50%);
        color: white;
        font-family: 'Roboto', sans-serif;
        font-size: 32px;
        font-weight: 200;
        font-style: italic;
        text-align: center;
        background: rgba(0, 0, 0, 0.7);
        padding: 15px 30px;
        border-radius: 10px;
        white-space: nowrap;
    }

    .overlay-image,
    .additional-image,
    .book-31-image,
    .book-32-image {
        position: absolute;
        pointer-events: none;
    }

    .book-zones {
        position: absolute;
        top: 0;
        width: 10%;
        height: 100%;
        pointer-events: none;
        z-index: 2;
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

`;

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
                </div>
            </div>
            <!-- Book Overlay HTML (moved from tumski.html) -->
            <div class="book-overlay">
                <button class="close-button">×</button>
                <div class="book-container">
                    <!-- Добавляем новый контейнер для изображения и контента -->
                    <div class="book-image-content-wrapper">
                        <img src="" alt="Book" class="book-image">
                        <h2 class="book-title"></h2>
                        <ul class="quest-tasks"></ul>
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
                    <div class="most-title"></div>
                </div>
            </div>
            <audio id="stepSound" src="media/step.wav"></audio>
            <audio id="mapSound" src="media/zwyki/bb6f2b8ec908f28.mp3"></audio>
            <audio id="bookSound" src="media/opening-a-book.wav"></audio>
            <audio id="sceneSound"></audio>
        `;

        // Добавляем модальное окно и кнопки на страницу
        document.body.insertAdjacentHTML('afterbegin', modalHTML);

        // Получаем ссылки на элементы после их добавления в DOM
        const openMapBtn = document.getElementById('open-map-modal');
        const openQuestBtn = document.getElementById('open-quest');
        const mapModal = document.getElementById('map-modal');
        const closeMapBtn = document.getElementById('close-map-modal');
        const mapImage = document.getElementById('map-image');
        const mapMarker = document.getElementById('map-marker');
        const mapTooltip = document.getElementById('map-tooltip');

        // Проверяем, что все элементы найдены
        if (!openMapBtn || !openQuestBtn || !mapModal || !closeMapBtn || !mapImage || !mapMarker || !mapTooltip) {
            console.error("Не удалось найти один или несколько элементов модального окна карты или кнопок.");
            return; // Прекращаем выполнение, если элементы не найдены
        }

        openMapBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            mapModal.style.display = 'flex';
            // Воспроизводим звук карты
            const mapSound = document.getElementById('mapSound');
            if (mapSound) mapSound.play();
            
            // Воспроизводим звук открытия книги
            const bookSound = document.getElementById('bookSound');
            if (bookSound) bookSound.play();
            
            // Получаем координаты точки 1
            const { getMapPointCoords, checkTooltipArea } = await import('./map_points.js');
            const coords = getMapPointCoords(1);
            
            // После загрузки изображения корректно позиционируем маркер
            mapImage.onload = function() {
                MapModal.positionMarker(coords);
            };
            
            // Если картинка уже загружена
            if (mapImage.complete) {
                MapModal.positionMarker(coords);
            }

            // === Исправленный обработчик движения мыши для подсказки ===
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
            });
        });

        // TODO: Add click handler for openQuestBtn
        openQuestBtn.addEventListener('click', function() {
             // console.log('Quest button clicked!');
             // Добавьте здесь логику открытия модального окна квестов или другое действие
            const bookOverlay = document.querySelector(Common.COMMON_ELEMENTS.BOOK_OVERLAY);
            const bookContainer = bookOverlay.querySelector('.book-container'); // Получаем контейнер для контента книги
            const bookImage = bookOverlay.querySelector('.book-image');
            const bookTitle = bookOverlay.querySelector('.book-title'); // Получаем элемент заголовка книги
            const bookSound = document.getElementById('bookSound');
            const container = document.querySelector(Common.COMMON_ELEMENTS.IMAGE_CONTAINER);
            const questTasksList = bookOverlay.querySelector('.quest-tasks');

            if (!bookOverlay || !bookContainer || !bookImage || !bookTitle || !bookSound || !container || !questTasksList) {
                console.error("Не удалось найти элементы для открытия модального окна книги или списка заданий.");
                return;
            }

            // Очищаем список перед заполнением
            questTasksList.innerHTML = '';

            // Заполняем список заданий (пример, текст будет из локализации)
            for (let i = 1; i <= 12; i++) {
                const listItem = document.createElement('li');
                // Добавляем изображение чекбокса
                const checkboxImg = document.createElement('img');
                checkboxImg.src = 'media/checkbox0.png'; // Путь к изображению чекбокса
                checkboxImg.alt = 'Checkbox';
                listItem.appendChild(checkboxImg);
                
                // Добавляем текст задания из локализации
                const taskTextSpan = document.createElement('span');
                taskTextSpan.textContent = window.i18n ? window.i18n.t(`quest.task${i}`) : `Задание ${i}`; // Ключи локализации quest.task1, quest.task2 и т.д.
                listItem.appendChild(taskTextSpan);
                
                questTasksList.appendChild(listItem);
            }

            // Устанавливаем изображение для квеста
            bookImage.src = 'media/quest.jpg';

            // Устанавливаем текст заголовка из локализации
            bookTitle.textContent = window.i18n ? window.i18n.t('quest.title1') : "Квест 1: Найди все тайны Тумского острова";
            bookTitle.style.display = 'block'; // Показываем заголовок

            // Позиционируем список заданий после загрузки изображения
            bookImage.onload = function() {
                positionQuestTasks();
            };
            
            // Если изображение уже загружено (например, из кеша), вызываем функцию сразу
            if (bookImage.complete) {
                positionQuestTasks();
            }

            // Открываем модальное окно
            bookOverlay.style.display = 'flex';

            // Воспроизведение звука книги
            if (bookSound) bookSound.play();
            
            // Скрываем элементы книги внутри модалки, которые не нужны для картинки квеста
            const contentImage = bookContainer.querySelector('.content-image');
            const bookText = bookContainer.querySelector('.book-text');
            const scrollIndicator = bookContainer.querySelector('.scroll-indicator');

            if (contentImage) contentImage.style.display = 'none';
            if (bookText) bookText.style.display = 'none';
            if (scrollIndicator) scrollIndicator.style.display = 'none';

        });

        // Функция для позиционирования списка заданий
        function positionQuestTasks() {
            const bookOverlay = document.querySelector(Common.COMMON_ELEMENTS.BOOK_OVERLAY);
            const bookContainer = bookOverlay ? bookOverlay.querySelector('.book-container') : null;
            const bookImage = bookContainer ? bookContainer.querySelector('.book-image') : null;
            const bookTitle = bookContainer ? bookContainer.querySelector('.book-title') : null;
            const questTasksList = bookContainer ? bookContainer.querySelector('.quest-tasks') : null;

            if (bookOverlay && bookOverlay.style.display === 'flex' && bookImage && bookTitle && questTasksList) {
                const titleRect = bookTitle.getBoundingClientRect();
                const bookImageRect = bookImage.getBoundingClientRect();
                const tasksTop = titleRect.bottom - bookImageRect.top + 40; // Используем тот же отступ
                questTasksList.style.top = `${tasksTop}px`;
               
                // Рассчитываем максимальную высоту для списка заданий
                // Высота изображения минус расстояние от верха изображения до верха списка заданий, минус небольшой отступ снизу.
                const tasksMaxHeight = bookImageRect.height - (tasksTop * (bookImageRect.height / bookImageRect.width)) - 60; // Примерный расчет
                questTasksList.style.maxHeight = `${tasksMaxHeight}px`;
               
                // Убедимся, что overflow-y установлен в auto
                questTasksList.style.overflowY = 'auto';
            }
        }

        // Добавляем обработчик события изменения размера окна
        window.addEventListener('resize', positionQuestTasks); // Используем новую функцию

        closeMapBtn.addEventListener('click', function() {
            mapModal.style.display = 'none';
            // Останавливаем звук карты
            const mapSound = document.getElementById('mapSound');
            if (mapSound) mapSound.pause();
            if (mapSound) mapSound.currentTime = 0;
        });

        // Закрытие по клику вне карты
        mapModal.addEventListener('click', function(e) {
            if (e.target === mapModal) {
                mapModal.style.display = 'none';
                // Останавливаем звук карты
                const mapSound = document.getElementById('mapSound');
                 if (mapSound) mapSound.pause();
                 if (mapSound) mapSound.currentTime = 0;
            }
        });
    },

    positionMarker(coords) {
        const mapMarker = document.getElementById('map-marker');
        const mapImage = document.getElementById('map-image');
        // Проверяем, что элементы существуют
        if (!mapMarker || !mapImage) {
            console.error("Не удалось найти маркер или изображение карты для позиционирования.");
            return;
        }
        const rect = mapImage.getBoundingClientRect();
        // Координаты в процентах, маркер центрируем
        mapMarker.style.left = `${coords.x}%`;
        mapMarker.style.top = `${coords.y}%`;
        mapMarker.style.transform = 'translate(-50%, -50%)';
    }
};

// Экспортируем объект MapModal
window.MapModal = MapModal; 