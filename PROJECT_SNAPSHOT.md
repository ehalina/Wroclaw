# PROJECT SNAPSHOT — Текущее состояние проекта

*Последнее обновление: 2026-06-27*

> 📋 **Процесс обновления этого файла:** см. [`PROCESS.md`](./PROCESS.md)
>
> **⚠️ ВАЖНО:** Обновляй этот файл после завершения КАЖДОЙ фазы!

---

## 📊 Статус разработки

**Phase 1: MVP Core Features** [статус: ✅]
**Phase 2: Content & Localization** [статус: 🔄]
**Phase 3: Optimization & Polish** [статус: ⏳]

**Общий прогресс:** 75% (15/20 основных задач)

**Текущая фаза:** Phase 2 - Content & Localization

---

## 📦 Установленные зависимости

### Production:
- Capacitor runtime: `@capacitor/core`, `@capacitor/android`, `@capacitor/ios`

### Development:
- ESLint
- Playwright
- Capacitor CLI

**Примечание:** Web runtime остаётся vanilla JavaScript без frontend framework/build bundler; Node scripts используются для проверок и сборки Capacitor assets.

---

## 🗂️ Структура проекта

```
Wroclaw/
├── index.html ✅                    # SPA главная страница
├── tumski.html ✅                   # Основная страница локации 1
├── tumski02.html - tumski24.html ✅ # Остальные 23 локации
├── dwor*.html ✅                    # Страницы дворов (13 страниц)
├── ogrod*.html ✅                   # Страницы садов (11 страниц)
├── katedra_*.html ✅                # Страницы собора (2 страницы)
│
├── styles.css ✅                    # Общие стили
├── common_tumski.css ✅             # Общие стили для tumski
├── tumski*.css ✅                   # Специфичные стили (24 файла)
│
├── spa_message_contract.js ✅       # Safe postMessage contract
├── spa_config.js ✅                 # SPA registry/config
├── spa_lifecycle.js ✅              # SPA lifecycle helpers
├── spa_minimap_manager.js ✅        # MiniMapManager
├── spa_integration.js ✅            # Интеграция SPA
├── common_tumski.js ✅             # Общая логика tumski страниц
├── tumski_cathedral_handler.js ✅  # Обработчик геометок
├── quest_marker_handler.js ✅      # Обработчик квестов
├── i18n.js ✅                       # Система локализации
├── map_modal.js ✅                 # Модальные окна
├── language_menu.js ✅              # Меню языков
├── arrow_handlers.js ✅            # Обработчики навигации
├── Makefile ✅                      # Стандартизированные команды
├── scripts/ ✅                      # Static checks и Capacitor web build
│
├── locales/ ✅                      # Переводы (7 языков)
│   ├── ru/, pl/, en/, de/, cs/, be/, uk/
│   └── translations.json
│
├── media/ ✅                        # Медиа файлы
│   ├── tumski/ - изображения локаций
│   ├── book/ - изображения книжных зон
│   ├── zwyki/ - аудио треки
│   └── *.wav, *.png - звуки и иконки
│
└── Init/ ✅                         # Документация фреймворка
    ├── CLAUDE.md
    ├── PROJECT_INTAKE.md
    ├── ARCHITECTURE.md
    └── ...

Легенда:
✅ — реализовано и протестировано
🔄 — в процессе разработки
⏳ — ожидает выполнения
```

---

## ✅ Завершенные задачи

### Phase 1: MVP Core Features
1. ✅ SPA система навигации (SPAManager)
2. ✅ Система геометок с модальными окнами
3. ✅ Музыкальная система с переключением треков
4. ✅ Базовая локализация (i18n.js)
5. ✅ Адаптивный дизайн для desktop/mobile
6. ✅ Кастомные курсоры навигации
7. ✅ Квест-маркеры система
8. ✅ Capacitor Android/iOS wrapper
9. ✅ Refactoring safety net: ESLint, static checks, Playwright smoke
10. ✅ Stage 3 SPA shell helpers: message contract, config, lifecycle, MiniMapManager

---

## 🔜 Следующий этап: Phase 2

**Content & Localization**

### Задачи:
1. 🔄 Заполнить все 24 tumski страницы полным контентом
2. 🔄 Полная локализация всех строк интерфейса (7 языков)
3. ⏳ Проверка качества переводов
4. ⏳ Добавление недостающих геометок на страницах
5. ⏳ Оптимизация изображений для веба

**Примерное время:** ~20 часов

**Зависимости:** PROJECT_INTAKE.md заполнен, архитектура определена

---

## 🔧 Технологии

- **Frontend:** Vanilla JavaScript (ES6+ modules)
- **Styling:** Plain CSS с модульной структурой
- **Backend:** Нет (статический сайт)
- **Database:** Нет (данные в JSON файлах)
- **Deployment:** Static hosting (Netlify/GitHub Pages/Vercel)
- **Localization:** JSON-based i18n system

---

## 📝 Заметки

### Важные файлы конфигурации:
- `.migrationignore` — исключения для миграции документации
- Нет `.env` файлов (проект полностью статический)

### Важные документы:
- `PROCESS.md` — процесс обновления метафайлов после каждой фазы
- `BACKLOG.md` — детальный план задач (обновляется после каждой фазы)
- `CLAUDE.md` — контекст проекта для AI
- `PROJECT_SNAPSHOT.md` — этот файл, снапшот текущего состояния
- `PROJECT_RULES.md` — правила работы с кодом проекта
- `QUICK_RULES.md` — быстрые правила для промптов

### Build команды:
```bash
make dev
make test
make lint
make smoke
make build
make security
make audit
```

### Безопасность:
- Нет обработки чувствительных данных
- Статический контент без серверной логики
- Локализация через JSON (валидация структуры)

---

## 🎯 Цель MVP

**Минимальная версия продукта:**
Интерактивная экскурсия по Тумскому острову с базовой навигацией, геометками и локализацией для основных языков.

**Ожидаемое время до MVP:** ~30 часов (осталось ~10 часов)

**Ключевые функции MVP:**
- ✅ SPA навигация между локациями
- ✅ Геометки с модальными окнами
- ✅ Музыкальная система
- ✅ Базовая локализация
- 🔄 Полное заполнение контента всех страниц
- ⏳ Полная локализация всех строк
- ⏳ Оптимизация производительности

---

## 🔄 История обновлений

### 2026-06-27 - Refactoring Stage 3.4 выполнен
- `MiniMapManager` вынесен из `index.html` в `spa_minimap_manager.js`
- Добавлены smoke checks для `OPEN_MINI_MAP` и `OPEN_FULLSCREEN_MAP`
- Stage 3 SPA shell теперь разделён на message contract, config, lifecycle helpers и mini-map manager

### 2025-01-11 - Phase 2 начата
- Документация проекта создана
- PROJECT_INTAKE.md заполнен
- Структура проекта задокументирована
- Следующий этап: заполнение контента и локализация

### До 2025-01-11 - Phase 1 завершена
- Реализована SPA система
- Добавлены геометки и модальные окна
- Музыкальная система работает
- Базовая локализация функционирует
- Прогресс: 75% (15/20)

---

## 📊 Модули и их статус

| Модуль | Статус | Зависимости | Тестирование |
|--------|--------|-------------|--------------|
| SPAManager | ✅ Готов | Нет | ✅ Passed |
| GeoMarker System | ✅ Готов | SPAManager | ✅ Passed |
| Quest Marker System | ✅ Готов | GeoMarker | ✅ Passed |
| i18n System | ✅ Готов | Нет | ✅ Passed |
| Music System | ✅ Готов | SPAManager | ✅ Passed |
| Modal System | ✅ Готов | Нет | ✅ Passed |
| Navigation System | ✅ Готов | SPAManager | ✅ Passed |
| SPA Message Contract | ✅ Готов | SPAManager | ✅ Smoke |
| SPA Config/Lifecycle Helpers | ✅ Готов | SPAManager | ✅ Smoke |
| MiniMapManager | ✅ Готов | SPAManager, Map Points | ✅ Smoke |
| Content (Pages) | 🔄 В работе | Все модули | ⏳ Pending |
| Localization (Full) | 🔄 В работе | i18n | ⏳ Pending |
| Optimization | ⏳ Ожидает | Все модули | ⏳ Pending |

---

## 🚨 Блокеры и проблемы

### Текущие блокеры:
- Нет критических блокеров

### Решенные проблемы:
- [x] Проблема с воспроизведением аудио на iOS - решено через разблокировку по клику
- [x] Конфликты курсоров между страницами - решено через унификацию в SPA
- [x] Проблемы с позиционированием на мобильных - решено через адаптивные data-атрибуты

---

## 📈 Метрики проекта

**Файлы:**
- HTML страниц: 51 (tumski + dwor + ogrod + katedra)
- JavaScript модулей: 15+
- CSS файлов: 30+
- JSON переводов: 7 языков × ~200+ строк

**Локализации:**
- ru (русский) - ✅ 100%
- pl (польский) - 🔄 80%
- en (английский) - 🔄 75%
- de (немецкий) - 🔄 70%
- cs (чешский) - 🔄 65%
- be (белорусский) - 🔄 60%
- uk (украинский) - 🔄 60%

**Контент:**
- Геометок реализовано: ~50+
- Квест-маркеров: ~10+
- Аудио треков: 5 (town, birds, kostel, hang, quest)
- Звуковых эффектов: 2 (step, opening-a-book)

---

*Этот файл — SINGLE SOURCE OF TRUTH для текущего состояния проекта*
*Обновляй после каждой фазы согласно PROCESS.md!*
