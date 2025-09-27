# Позиционирование для планшетов

## Описание

Реализована упрощенная логика позиционирования элементов для планшетов: **планшеты используют десктопную логику позиционирования** вместо мобильной.

## Реализованная логика

### JavaScript (tumski_cathedral_handler.js)

Изменена логика определения типа устройства:
```javascript
// Для планшетов используем десктопную логику
const isTablet = window.matchMedia('(hover: none) and (pointer: coarse) and (min-width: 768px)').matches;
const isMobile = !window.matchMedia('(hover: hover)').matches && !isTablet;
```

**Результат:**
- **Мобильные устройства** (`isMobile = true`) - используют мобильную логику с `data-x-mobile`/`data-y-mobile`
- **Планшеты** (`isTablet = true`) - используют десктопную логику с `data-x-desktop`/`data-y-desktop`
- **Десктоп** (`isMobile = false, isTablet = false`) - используют десктопную логику с `data-x-desktop`/`data-y-desktop`

### CSS (common_tumski.css)

Добавлен медиа-запрос для планшетов:
```css
@media (hover: none) and (pointer: coarse) and (min-width: 768px) {
    /* Стили для планшетов - только для интерактивных элементов */
    /* Стили .image-container и .image НЕ изменяются */
}
```

## Автоматическое применение

Корректировка позиций применяется автоматически через существующую функцию `positionMarkersOnBg()` в `tumski_cathedral_handler.js`:

1. **При загрузке страницы** - через `initializeTumskiPage()` в `common_tumski.js`
2. **При изменении размера окна** - с debouncing 100ms
3. **Доступна на всех страницах** - где подключен `tumski_cathedral_handler.js`

## Отладочные логи

Добавлены логи для отслеживания работы:
- `📱 Определение типа устройства` - показывает все условия медиа-запроса
- `📱 Мобильная логика для маркера` - когда используется мобильная логика
- `🖥️ Десктопная логика для маркера (включая планшеты)` - когда используется десктопная логика

## Дополнительная логика для планшетов

### Позиционирование стрелок по центру областей

Для планшетов добавлена специальная логика позиционирования стрелок по центру их областей:

```javascript
function positionCursorsInCenterOfAreas() {
    // Позиционирует стрелки по центру их областей
    // custom-cursor-left → custom-cursor-leftarea
    // custom-cursor-right → custom-cursor-rightarea
    // custom-cursor-up → custom-cursor-uparea
    // custom-cursor-back → custom-cursor-backarea
    // custom-cursor-prosto → custom-cursor-prostoarea
    // custom-cursor-prosto-left → custom-cursor-prosto-leftarea
}
```

**Логика:**
1. Находит стрелку (например, `.custom-cursor-left`)
2. Находит соответствующую область (например, `.custom-cursor-leftarea`)
3. Вычисляет центр области
4. Позиционирует стрелку по центру области

## Поддерживаемые элементы

- ✅ Кастомные курсоры с атрибутами `data-x-desktop`/`data-y-desktop` и `data-x-mobile`/`data-y-mobile`
- ✅ Все геометки (включая квест-геометки) с атрибутами `data-x-desktop`/`data-y-desktop` и `data-x-mobile`/`data-y-mobile`
- ✅ Стрелки навигации (позиционируются по центру областей для планшетов)
- ✅ Все страницы, где подключен `tumski_cathedral_handler.js`

## Совместимость

- Работает на всех страницах проекта
- Не влияет на десктопную и мобильную версии
- Планшеты автоматически используют более точную десктопную логику позиционирования