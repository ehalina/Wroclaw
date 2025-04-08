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
        return translations;
    } catch (error) {
        console.error('Ошибка загрузки переводов:', error);
        return {};
    }
}

// Функция для получения перевода
function t(key) {
    const keys = key.split('.');
    let result = translations;
    for (const k of keys) {
        if (result && result[k]) {
            result = result[k];
        } else {
            return key;
        }
    }
    return result;
}

// Функция для смены языка
async function changeLang(lang) {
    await loadTranslations(lang);
    updatePageContent();
}

// Функция для обновления контента на странице
function updatePageContent() {
    // Обновляем все элементы с атрибутом data-i18n
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        element.textContent = t(key);
    });

    // Обновляем заголовки маркеров
    const mapMarkWyspa = document.getElementById('tumska_wyspa');
    const mapMarkMost = document.getElementById('tumski_most');
    const tumskiTexts = document.querySelectorAll('.tumski-text');

    if (mapMarkWyspa) {
        mapMarkWyspa.setAttribute('data-title', t('tumski.title'));
    }

    if (mapMarkMost) {
        mapMarkMost.setAttribute('data-title', t('tumski_most.title'));
    }

    // Обновляем содержимое книги
    const bookTitle = document.querySelector('.book-title');
    const bookText = document.querySelector('.book-text');
    if (bookTitle && bookText) {
        const clickedMarkId = document.activeElement?.id || 'tumska_wyspa';
        const titleKey = clickedMarkId === 'tumski_most' ? 'tumski_most.title' : 'tumski.title';
        const descriptionKey = clickedMarkId === 'tumski_most' ? 'tumski_most.description' : 'tumski.description';
        
        bookTitle.textContent = t(titleKey);
        bookText.textContent = t(descriptionKey);
    }

    // Обновляем активный класс у кнопок переключения языка
    document.querySelectorAll('.language-option').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-lang') === currentLang);
    });
}

// Экспортируем функции
window.i18n = {
    loadTranslations,
    t,
    changeLang,
    updatePageContent,
    getCurrentLang: () => currentLang
}; 