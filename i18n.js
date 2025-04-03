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
    // Обновляем заголовок маркера
    const mapMark = document.getElementById('tumski');
    if (mapMark) {
        mapMark.setAttribute('data-title', t('tumski.title'));
    }

    // Обновляем содержимое книги
    const bookTitle = document.querySelector('.book-title');
    const bookText = document.querySelector('.book-text');
    if (bookTitle && bookText) {
        bookTitle.textContent = t('tumski.title');
        bookText.textContent = t('tumski.description');
    }

    // Обновляем активный класс у кнопок переключения языка
    document.querySelectorAll('.language-switcher button').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-lang') === currentLang);
    });
}

// Экспортируем функции
window.i18n = {
    loadTranslations,
    t,
    changeLang,
    updatePageContent
}; 