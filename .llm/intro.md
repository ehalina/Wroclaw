# Wroclaw Interactive Tour - Full Project Context

## 📍 О проекте

Интерактивный тур по острову Тумский (Wroclaw, Poland) - веб-приложение для виртуальной экскурсии с использованием панорамных изображений, геометок, квестов и мультиязычной поддержки.

## 🏗️ Архитектура

- **Тип:** Статический SPA (Single Page Application)
- **Framework:** Vanilla JavaScript ES6+ (без внешних фреймворков)
- **Routing:** iframe-based navigation через SPAManager
- **Localization:** 7 языков (ru, pl, en, de, cs, be, uk)
- **Hosting:** Static hosting (GitHub Pages / Netlify / Vercel)

## 📚 Ключевая документация

Перед работой с кодом **обязательно прочитай:**

1. **AGENTS.md** - Инструкции для AI-агентов, паттерны разработки
2. **ARCHITECTURE.md** - Архитектурные решения, WHY & HOW
3. **BACKLOG.md** - SINGLE SOURCE OF TRUTH для задач и статусов
4. **README.md** - User-facing документация

## 🎯 Текущий статус

**Phase:** Development - Content & Localization
**Completion:** ~75% MVP features

### ✅ Completed:
- SPA Navigation System
- GeoMarker System (universal handler)
- Music System (5 tracks)
- i18n Localization (7 languages)
- Quest Marker System
- Responsive Design
- Custom Cursors

### 🚧 In Progress:
- Content completion (24 tumski pages)
- Full localization (all 7 languages)
- Performance optimization

## 🔑 Ключевые модули

- `spa_integration.js` - SPA система
- `tumski_cathedral_handler.js` - Универсальный обработчик геометок
- `quest_marker_handler.js` - Квест маркеры
- `i18n.js` - Система локализации
- `map_modal.js` - Модальные окна карты
- `common_tumski.js` - Общая логика страниц

## 📂 Структура страниц

- 50+ HTML страниц локаций:
  - tumski*.html (24 страницы острова)
  - dwor*.html (13 дворов)
  - ogrod*.html (11 садов)
  - katedra_*.html (2 собора)

---

**🤖 Для AI-агентов:**
- Всегда читай AGENTS.md перед началом работы
- Проверяй BACKLOG.md для текущих задач
- Следуй модульной архитектуре (ES6 modules)
- Обновляй документацию после изменений






