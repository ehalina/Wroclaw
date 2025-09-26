// Текущий язык
let currentLang = 'ru';

// Кэш для переводов
let translations = {};

// Функция для загрузки переводов
async function loadTranslations(lang = 'ru') {
    try {
        const response = await fetch(`locales/${lang}/translations.json`);
        translations = await response.json();
        currentLang = lang;
        document.documentElement.lang = lang; // Обновляем атрибут lang у html
        
        // Обновляем глобальную переменную
        if (window.i18n) {
            window.i18n.translations = translations;
        }
        
        return translations;
    } catch (error) {
        // Ошибка загрузки переводов
        return {};
    }
}

// Функция для получения перевода
function t(key) {
    // Используем переводы из window.i18n.translations, если они есть
    const currentTranslations = window.i18n ? window.i18n.translations : translations;
    
    console.log('🌐 Ищем перевод для ключа:', key, 'в переводах:', currentTranslations ? 'загружены' : 'не загружены');
    
    // Сначала ищем плоский ключ
    if (currentTranslations && currentTranslations.hasOwnProperty(key)) {
        console.log('🌐 Найден плоский ключ:', key, '->', currentTranslations[key]);
        return currentTranslations[key];
    }
    // Если не найдено — ищем вложенный ключ
    const keys = key.split('.');
    let result = currentTranslations;
    for (const k of keys) {
        if (result && result[k]) {
            result = result[k];
        } else {
            console.log('🌐 Ключ не найден:', key, 'возвращаем ключ как есть');
            return key;
        }
    }
    console.log('🌐 Найден вложенный ключ:', key, '->', result);
    return result;
}

// Функция для смены языка
async function changeLang(lang) {
    console.log('🌐 Смена языка на:', lang);
    await loadTranslations(lang);
    console.log('🌐 Переводы загружены, обновляем контент...');
    updatePageContent();
    console.log('🌐 Контент обновлен');
    
    // Отправляем сообщение в SPA, если мы находимся в iframe
    if (window.sendLanguageChangeToSPA && typeof window.sendLanguageChangeToSPA === 'function') {
        window.sendLanguageChangeToSPA(lang);
    }
}

// Функция для обновления контента на странице
function updatePageContent() {
    console.log('🌐 Начинаем обновление контента страницы...');
    
    // Обновляем все элементы с атрибутом data-i18n
    const elementsWithI18n = document.querySelectorAll('[data-i18n]');
    console.log('🌐 Найдено элементов с data-i18n:', elementsWithI18n.length);
    
    elementsWithI18n.forEach(element => {
        const key = element.getAttribute('data-i18n');
        const newText = t(key);
        element.innerHTML = newText;
        console.log('🌐 Обновлен элемент:', key, '->', newText);
    });

    // Специально обновляем кнопку разблокировки аудио
    const audioUnlockText = document.querySelector('.audio-unlock-text[data-i18n]');
    if (audioUnlockText) {
        const newText = t('music.audio_unlock_text');
        audioUnlockText.innerHTML = newText;
        console.log('🌐 Обновлен текст кнопки разблокировки аудио:', newText);
    } else {
        // Дополнительная проверка: ищем кнопку по ID
        const audioUnlockButton = document.getElementById('audioUnlockButton');
        if (audioUnlockButton) {
            const textElement = audioUnlockButton.querySelector('.audio-unlock-text');
            if (textElement) {
                const newText = t('music.audio_unlock_text');
                textElement.innerHTML = newText;
                console.log('🌐 Обновлен текст кнопки разблокировки аудио (по ID):', newText);
            }
        } else {
            console.log('🌐 Кнопка разблокировки аудио не найдена на странице');
        }
    }
    
    // Дополнительная проверка для всех элементов с data-i18n="music.audio_unlock_text"
    const allAudioUnlockElements = document.querySelectorAll('[data-i18n="music.audio_unlock_text"]');
    allAudioUnlockElements.forEach((element, index) => {
        const newText = t('music.audio_unlock_text');
        element.innerHTML = newText;
        console.log(`🌐 Обновлен элемент ${index + 1} с music.audio_unlock_text:`, newText);
    });

    // Обновляем заголовки маркеров
    const mapMarkWyspa = document.getElementById('tumska_wyspa');
    const mapMarkMost = document.getElementById('tumski_most');
    const mapMarkCathedral = document.getElementById('tumski_cathedral');
    const mapMarkOgrodPapieski = document.getElementById('ogrod_papieski');
    const tumskiTexts = document.querySelectorAll('.tumski-text');

    if (mapMarkWyspa) {
        mapMarkWyspa.setAttribute('data-title', t('tumski.title'));
    }

    if (mapMarkMost) {
        mapMarkMost.setAttribute('data-title', t('tumski_most.title'));
    }

    if (mapMarkCathedral) {
        mapMarkCathedral.setAttribute('data-title', t('tumski_cathedral.title'));
    }

    if (mapMarkOgrodPapieski) {
        const title = t('ogrod_papieski.title');
        mapMarkOgrodPapieski.setAttribute('data-title', title);
        // Также обновляем текст в content-wrapper
        const contentWrapper = mapMarkOgrodPapieski.parentElement.querySelector('.content-wrapper');
        const textElem = contentWrapper?.querySelector('.tumski-text');
        if (textElem) {
            textElem.innerHTML = title;
        }
    }

    // Обновляем содержимое книги
    const bookTitle = document.querySelector('.book-title');
    const bookText = document.querySelector('.book-text');
    if (bookTitle && bookText) {
        const clickedMarkId = document.activeElement?.id || 'tumska_wyspa';
        let titleKey, descriptionKey;
        
        if (clickedMarkId === 'tumski_most') {
            titleKey = 'tumski_most.title';
            descriptionKey = 'tumski_most.description';
        } else if (clickedMarkId === 'tumski_cathedral') {
            titleKey = 'tumski_cathedral.title';
            descriptionKey = 'tumski_cathedral.description';
        } else {
            titleKey = 'tumski.title';
            descriptionKey = 'tumski.description';
        }
        
        bookTitle.innerHTML = t(titleKey);
        bookText.innerHTML = t(descriptionKey);
    }

    // Обновляем активный класс у кнопок переключения языка
    document.querySelectorAll('.language-option').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-lang') === currentLang);
    });
    
    // Обновляем размеры контейнеров после смены языка
    if (window.updateContentWrapperSizesAfterLanguageChange) {
        // Небольшая задержка для гарантии, что DOM обновился
        setTimeout(() => {
            window.updateContentWrapperSizesAfterLanguageChange();
        }, 100);
    }
}

// Экспортируем функции
window.i18n = {
    loadTranslations,
    t,
    changeLang,
    updatePageContent,
    getCurrentLang: () => currentLang,
    translations: translations
};

// Автоматически загружаем переводы и обновляем контент при загрузке страницы
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🌐 DOM загружен, загружаем переводы...');
    await loadTranslations('ru'); // Загружаем русские переводы по умолчанию
    console.log('🌐 Переводы загружены, обновляем контент...');
    updatePageContent();
}); 