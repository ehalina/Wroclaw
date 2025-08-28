# Рефакторинг tumski файлов

## Обзор

Произведен рефакторинг всех `tumski*.js` и `tumski*.css` файлов для устранения дублирования кода.

## Созданные общие файлы

### 1. `common_tumski.js`
Содержит общую логику инициализации для всех tumski страниц:
- Загрузка переводов
- Инициализация геометок и квестов
- Инициализация языкового меню
- Инициализация модального окна карты
- Применение общих стилей кнопок
- Запуск фоновой музыки
- Инициализация логики книги
- Позиционирование геометок и стрелок
- Обработчики изменения размера окна
- Обработчики события load
- Инициализация обработчиков стрелок

### 2. `common_tumski.css`
Содержит общие стили для всех tumski страниц:
- Анимации (`zoomForward`, `moveForward`)
- Стили для `.image`, `.next-image-container`
- Стили для всех типов стрелок
- Стили для геометок (`.map-mark-area`, `.map-mark`)
- Стили для `.papera-image`, `.content-wrapper`
- Мобильные стили (медиа-запросы)

## Как использовать

### JavaScript файлы

Вместо дублирования кода в каждом `tumski*_init.js`, используйте:

```javascript
import { initializeTumskiPage, initializeArrowHandlers } from './common_tumski.js';

document.addEventListener('DOMContentLoaded', async function() {
    // Конфигурация геометок для этой страницы
    const geometries = [
        { markerId: 'tumski_cathedral', i18nKey: 'tumski_cathedral' },
        { markerId: 'katedra_koscielna', i18nKey: 'katedra_koscielna' }
    ];

    // Конфигурация квестов (если есть)
    const quests = [
        { markerId: 'quest_marker', questNumber: 1, questImage: 'path/to/image.jpg' }
    ];

    // Инициализируем страницу с общим кодом
    await initializeTumskiPage({
        geometries,
        quests,
        customInit: () => {
            // Дополнительная инициализация для этой страницы
            initializeArrowHandlers([
                {
                    type: 'desktop',
                    cursor: document.querySelector('.custom-cursor'),
                    cursorArea: document.querySelector('.custom-cursor-area'),
                    handlerType: 'setupRightArrowHandler',
                    callback: () => {
                        // Логика перехода
                    }
                }
            ]);
        }
    });
});
```

### CSS файлы

Вместо дублирования стилей в каждом `tumski*.css`, используйте:

```html
<link rel="stylesheet" href="common_tumski.css">
<link rel="stylesheet" href="tumski*.css">
```

В `tumski*.css` оставляйте только специфичные для страницы стили:
- Фоновые изображения
- Специфичные позиции стрелок
- Уникальные стили

## Преимущества рефакторинга

1. **Устранение дублирования**: Код не повторяется в 20+ файлах
2. **Легкость поддержки**: Изменения в общем коде применяются ко всем страницам
3. **Консистентность**: Все страницы используют одинаковую логику и стили
4. **Читаемость**: Каждый файл содержит только специфичную логику
5. **Масштабируемость**: Легко добавлять новые страницы

## Структура файлов после рефакторинга

```
tumski/
├── common_tumski.js          # Общая JavaScript логика
├── common_tumski.css         # Общие CSS стили
├── tumski.html              # HTML с подключенным общим CSS
├── tumski.css               # Только специфичные стили
├── tumski_init.js           # Использует общую логику
├── tumski02.html
├── tumski02.css             # Только специфичные стили
├── tumski02_init.js         # Использует общую логику
└── ...                      # Аналогично для остальных файлов
```

## Миграция существующих файлов

Для миграции существующих файлов:

1. **JavaScript**: Заменить содержимое на использование `initializeTumskiPage`
2. **CSS**: Убрать дублирующийся код, оставить специфичные стили
3. **HTML**: Добавить подключение `common_tumski.css`

## Пример миграции

### До рефакторинга (tumski02_init.js):
```javascript
// 50+ строк дублирующегося кода
document.addEventListener('DOMContentLoaded', async function() {
    // 1. Загрузка переводов...
    // 2. Подключение обработчиков...
    // 3. Инициализация языкового меню...
    // ... и так далее
});
```

### После рефакторинга:
```javascript
import { initializeTumskiPage } from './common_tumski.js';

document.addEventListener('DOMContentLoaded', async function() {
    await initializeTumskiPage({
        geometries: [
            { markerId: 'tumski', i18nKey: 'tumski' }
        ]
    });
});
```

## Примечания

- Все общие функции экспортируются из `common_tumski.js`
- CSS файлы подключаются в правильном порядке: сначала общие, потом специфичные
- Обработчики стрелок настраиваются через `initializeArrowHandlers`
- Дополнительная логика добавляется через `customInit` callback
