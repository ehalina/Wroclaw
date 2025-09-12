/**
 * Скрипт для тестирования стилей в консоли браузера
 * Выполните этот код в консоли для отладки
 */

function testInputDetection() {
    console.log('=== ТЕСТ ОПРЕДЕЛЕНИЯ ТИПА ВВОДА ===');
    
    // Проверяем data-атрибут
    const inputType = document.documentElement.getAttribute('data-input-type');
    console.log('Data input type:', inputType);
    
    // Проверяем классы
    const htmlClasses = document.documentElement.className;
    console.log('HTML classes:', htmlClasses);
    
    // Проверяем элементы
    const cursors = document.querySelectorAll('.custom-cursor, .custom-cursor-prosto, .custom-cursor-prosto-left, .custom-cursor-back, .custom-cursor-left, .custom-cursor-up');
    const paperaImages = document.querySelectorAll('.papera-image');
    const tumskiTexts = document.querySelectorAll('.tumski-text');
    
    console.log('Found elements:', {
        cursors: cursors.length,
        paperaImages: paperaImages.length,
        tumskiTexts: tumskiTexts.length
    });
    
    // Проверяем стили первого курсора
    if (cursors.length > 0) {
        const firstCursor = cursors[0];
        const computedStyle = getComputedStyle(firstCursor);
        console.log('First cursor styles:', {
            opacity: computedStyle.opacity,
            pointerEvents: computedStyle.pointerEvents,
            display: computedStyle.display,
            visibility: computedStyle.visibility,
            classes: firstCursor.className
        });
    }
    
    // Проверяем стили первой papera
    if (paperaImages.length > 0) {
        const firstPapera = paperaImages[0];
        const computedStyle = getComputedStyle(firstPapera);
        console.log('First papera styles:', {
            opacity: computedStyle.opacity,
            display: computedStyle.display,
            visibility: computedStyle.visibility,
            classes: firstPapera.className
        });
    }
    
    // Принудительно применяем стили
    console.log('=== ПРИНУДИТЕЛЬНОЕ ПРИМЕНЕНИЕ СТИЛЕЙ ===');
    
    if (inputType === 'desktop') {
        cursors.forEach(cursor => {
            cursor.style.opacity = '0';
            cursor.style.pointerEvents = 'none';
            cursor.classList.add('desktop-mode');
            cursor.classList.remove('touch-mode');
        });
        
        paperaImages.forEach(img => {
            img.style.opacity = '0';
            img.classList.add('desktop-mode');
            img.classList.remove('touch-mode');
        });
        
        tumskiTexts.forEach(text => {
            text.style.opacity = '0';
            text.classList.add('desktop-mode');
            text.classList.remove('touch-mode');
        });
        
        console.log('Applied desktop styles');
    } else if (inputType === 'touch') {
        cursors.forEach(cursor => {
            cursor.style.opacity = '1';
            cursor.style.pointerEvents = 'auto';
            cursor.classList.add('touch-mode');
            cursor.classList.remove('desktop-mode');
        });
        
        paperaImages.forEach(img => {
            img.style.opacity = '1';
            img.classList.add('touch-mode');
            img.classList.remove('desktop-mode');
        });
        
        tumskiTexts.forEach(text => {
            text.style.opacity = '1';
            text.classList.add('touch-mode');
            text.classList.remove('desktop-mode');
        });
        
        console.log('Applied touch styles');
    }
    
    console.log('=== ТЕСТ ЗАВЕРШЕН ===');
}

// Автоматически запускаем тест
testInputDetection();

// Экспортируем функцию для ручного вызова
window.testInputDetection = testInputDetection;
