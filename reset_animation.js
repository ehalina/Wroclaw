/**
 * Настраивает обработчик двойного клика для сброса анимации
 * @param {HTMLElement} container - Контейнер с анимацией
 */
function setupResetAnimation(container) {
    // Добавляем обработчик двойного клика
    document.addEventListener('dblclick', function(e) {
        // Проверяем, что клик не по элементам управления
        if (!e.target.closest('.back-link') && 
            !e.target.closest('.language-switcher') && 
            !e.target.closest('.book-overlay') && 
            !e.target.closest('.most-overlay')) {
            // Добавляем класс для сброса анимации
            container.classList.add('reset-animation');
            // Убираем класс через 100мс
            setTimeout(() => {
                container.classList.remove('reset-animation');
            }, 100);
        }
    });
} 