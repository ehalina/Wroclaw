// Обработчик для геометки "Собор Святого Иоанна Крестителя"
export function setupTumskiCathedralHandler() {
    const tumskiCathedralTxt = document.querySelector('#tumski-cathedral-text');
    const mapMarkCathedral = document.querySelector('#tumski_cathedral');
    const bookSound3 = document.querySelector('#bookSound3');
    const mostOverlay = document.querySelector('.most-overlay');
    const container = document.querySelector('.image-container');
    const mostTitle = mostOverlay.querySelector('.most-title');

    function setupCustomHandler(textElem, markElem, soundElem, overlay, container, titleElem, i18nKey) {
        if (!textElem || !markElem) return;
        [textElem, markElem].forEach(el => {
            el.addEventListener('click', () => {
                if (soundElem) soundElem.play();
                overlay.style.display = 'flex';
                // container.classList.add('zoom-transition'); // Зум убран для геометки
                titleElem.textContent = window.i18n.t(i18nKey + '.title');
                // Можно добавить описание, если нужно
            });
        });
    }

    setupCustomHandler(tumskiCathedralTxt, mapMarkCathedral, bookSound3, mostOverlay, container, mostTitle, 'tumski_cathedral');
}

// Универсальный обработчик для геометок
export function setupUniversalGeoMarker({ markerId, i18nKey, position }) {
    const marker = document.getElementById(markerId);
    const mostOverlay = document.querySelector('.most-overlay');
    const mostTitle = mostOverlay.querySelector('.most-title');
    const mostDescription = mostOverlay.querySelector('.most-description');
    const container = document.querySelector('.image-container');
    if (!marker) return;

    // Устанавливаем позицию геометки
    if (position) {
        Object.assign(marker.parentElement.style, position);
    }

    // --- Картинка papera1.png под текстом ---
    const contentWrapper = marker.parentElement.querySelector('.content-wrapper');
    const textElem = contentWrapper.querySelector('.tumski-text');
    let paperaImg = contentWrapper.querySelector('.papera-image');
    if (!paperaImg) {
        paperaImg = document.createElement('img');
        paperaImg.className = 'papera-image';
        paperaImg.src = 'media/papera1.png';
        paperaImg.alt = 'Papera';
        // Вставляем ПОД текстом
        contentWrapper.appendChild(paperaImg);
    }
    // Стили для растяжения картинки по ширине текста
    paperaImg.style.width = textElem ? (textElem.offsetWidth + 'px') : '100%';
    paperaImg.style.height = '40px';
    paperaImg.style.display = 'block';
    paperaImg.style.objectFit = 'contain';
    paperaImg.style.margin = '0 auto';
    paperaImg.style.position = 'relative';
    paperaImg.style.top = '8px';

    // --- Обработчик клика ---
    function openModal() {
        mostOverlay.style.display = 'flex';
        if (window.i18n && typeof window.i18n.t === 'function') {
            mostTitle.textContent = window.i18n.t(i18nKey + '.title');
            mostDescription.textContent = window.i18n.t(i18nKey + '.description');
        }
    }
    marker.addEventListener('click', openModal);
    if (textElem) textElem.addEventListener('click', openModal);
} 