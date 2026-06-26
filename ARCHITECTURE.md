# Project Architecture

**Project:** Wroclaw - Interactive Tumski Island Tour
**Version:** 0.1.0
**Last Updated:** 2025-01-11

---

> **🏗️ Authoritative Source:** This is the SINGLE SOURCE OF TRUTH for:
> - WHY we chose specific technologies (technology choices, design principles)
> - HOW the system is structured (modules, layers, components)
> - Modularity philosophy and patterns
> - Design principles and architecture patterns
>
> **⚠️ NOT for operational checklists:**
> ❌ Don't store detailed implementation tasks here (→ BACKLOG.md)
> ❌ Don't store sprint checklists here (→ BACKLOG.md)
> ❌ Don't store "Phase 1: do X, Y, Z" task lists here (→ BACKLOG.md)
>
> **This file = Reference (WHY & HOW)**
> **BACKLOG.md = Action Plan (WHAT to do now)**
>
> Other files (CLAUDE.md, PROJECT_INTAKE.md) link here, don't duplicate.

## 📊 Technology Stack

### Frontend
```
- Framework: Vanilla JavaScript (ES6+ modules) - без фреймворков
- Language: JavaScript (ES6+)
- Build Tool: Нет для web runtime; Node script копирует runtime-файлы в `www/` для Capacitor
- State Management: localStorage для настроек пользователя (язык, звук)
- UI/CSS: Plain CSS с модульной структурой
- Icons: Custom PNG иконки (media/)
- Routing: SPA system через iframe и history API
```

**Почему Vanilla JS:**
- ✅ Минимальные зависимости (быстрая загрузка)
- ✅ Полный контроль над производительностью
- ✅ Простота поддержки и понимания кода
- ✅ Не требует сборки (прямая работа с файлами)
- ✅ Легко расширять новыми модулями

### Backend & Infrastructure
```
- Database: Нет (данные в JSON файлах локализации)
- Authentication: Firebase client SDK присутствует для optional user/admin features; собственного backend auth нет
- API Type: Нет API (статический контент)
- File Storage: Локальная файловая система (media/)
- Hosting: Static hosting (Netlify / GitHub Pages / Vercel)
- Native wrapper: Capacitor 8 для Android/iOS
```

**Почему статический сайт:**
- ✅ Быстрая загрузка без сервера
- ✅ Бесплатный хостинг на GitHub Pages/Netlify
- ✅ Нет проблем с масштабированием
- ✅ Простота деплоя (push в git)
- ✅ Безопасность (нет серверной логики)

### Key Dependencies
```json
{
  "@capacitor/core": "Native runtime bridge",
  "@capacitor/android": "Android platform",
  "@capacitor/ios": "iOS platform",
  "@capacitor/cli": "Capacitor project sync and native tooling"
}
```

**Внешние ресурсы:**
- Google Fonts: Marck Script, Roboto (для типографики)
- Все остальное самодостаточно

---

## 🗂️ Project Structure

```
Wroclaw/
├── index.html               # SPA главная страница (SPAManager)
├── tumski.html             # Основная страница локации 1
├── tumski02.html - tumski24.html  # 23 дополнительные локации
├── dwor*.html              # Страницы дворов (13 страниц)
├── ogrod*.html             # Страницы садов (11 страниц)
├── katedra_*.html          # Страницы собора (2 страницы)
│
├── styles.css              # Общие стили
├── common_tumski.css       # Общие стили для tumski страниц
├── tumski*.css             # Специфичные стили для каждой страницы
├── common_buttons.js       # Общие функции кнопок
│
├── spa_integration.js      # SPA интеграция для совместимости
├── common_tumski.js        # Общая логика tumski страниц (ES6 module)
├── tumski_cathedral_handler.js  # Универсальный обработчик геометок (ES6 module)
├── quest_marker_handler.js # Обработчик квест-маркеров (ES6 module)
├── i18n.js                 # Система локализации
├── map_modal.js            # Модальные окна для геометок
├── language_menu.js        # Меню переключения языка
├── arrow_handlers.js        # Обработчики навигационных стрелок
├── book_paths.js           # Обработчики книжных зон
├── map_points.js           # Инициализация точек на карте
├── visibility_audio_manager.js  # Управление видимостью аудио
├── scripts/build-capacitor-web.mjs  # Копирование runtime-файлов в www/
├── capacitor.config.json    # Конфигурация Capacitor
├── package.json             # Capacitor зависимости и npm scripts
├── Makefile                 # Стандартизированные команды проекта
├── android/                 # Capacitor Android project
├── ios/                     # Capacitor iOS project
│
├── locales/                # Локализация (7 языков)
│   ├── ru/
│   │   └── translations.json
│   ├── pl/, en/, de/, cs/, be/, uk/  # Остальные языки
│
├── media/                  # Медиа файлы
│   ├── tumski/            # Изображения локаций
│   ├── book/               # Изображения книжных зон
│   ├── zwyki/              # Аудио треки (town, birds, kostel, hang, quest)
│   ├── *.wav               # Звуковые эффекты
│   └── *.png               # Иконки и курсоры
│
└── Init/                   # Документация фреймворка
    ├── CLAUDE.md
    ├── PROJECT_INTAKE.md
    └── ...
```

---

## 🏗️ Core Architecture Decisions

### 0. Native wrapper через Capacitor

**Decision:** Использовать Capacitor 8 как тонкую нативную оболочку вокруг существующего статического SPA.

**Reasoning:**
- ✅ Сохраняет текущую vanilla JS архитектуру без миграции на Vite/React
- ✅ Позволяет собирать Android/iOS из тех же HTML/CSS/JS assets
- ✅ Нативные проекты остаются стандартными Android Studio / Xcode проектами
- ✅ `www/` генерируется отдельно, чтобы не копировать документацию и служебные файлы в app bundle

**Implementation:**
- Source of truth для web runtime остаётся в корне проекта.
- `scripts/build-capacitor-web.mjs` копирует HTML/CSS/JS, `media/`, `locales/`, `thumbs/` и runtime assets в `www/`.
- `capacitor.config.json` использует `webDir: "www"`.
- `make cap-sync` пересобирает `www/` и синхронизирует `android/` и `ios/`.
- Android command-line build требует JDK 21; `make android-debug` задаёт `CAPACITOR_JAVA_HOME`.

### 1. SPA Architecture через iframe

**Decision:** Использование iframe для загрузки страниц внутри index.html вместо полной замены DOM

**Reasoning:**
- ✅ Полная изоляция страниц (не конфликтуют стили/скрипты)
- ✅ Простота реализации (каждая страница независима)
- ✅ Кэширование страниц в браузере
- ✅ Сохранение состояния каждой страницы

**Alternatives considered:**
- ❌ Полная замена DOM через fetch/innerHTML - сложнее управление состоянием, конфликты скриптов
- ❌ React/Vue роутинг - избыточно для статического контента, требует сборку

**Implementation:**
```javascript
// index.html содержит SPAManager
class SPAManager {
  async loadPage(pageName) {
    const iframe = document.createElement('iframe');
    iframe.src = `${pageName}?t=${timestamp}`;
    // iframe загружается и встраивается в SPA контейнер
  }
}
```

### 1.1. SPA message contract

**Decision:** Все новые `postMessage`-потоки между `index.html` и iframe-страницами проходят через `spa_message_contract.js`.

**Reasoning:**
- ✅ Явный список допустимых message types
- ✅ Проверка `event.origin` для same-origin iframe shell
- ✅ Проверка `event.source`: parent принимает сообщения только от active iframe, iframe принимает команды только от parent
- ✅ Совместимость с текущими payload без смены navigation/audio/language behavior

**Implementation:**
- `spa_message_contract.js` публикует `window.SpaMessages`.
- Parent -> iframe использует `SpaMessages.postToFrame(iframe, type, payload)`.
- Iframe -> parent использует `SpaMessages.postToParent(type, payload)`.
- Listener-ы сначала вызывают `parseMessage(data)`, затем проверяют source/origin guard.
- Для opaque/file origin сохраняется fallback target `'*'`; для нормального web/Capacitor origin используется `window.location.origin`.

### 1.2. Маркеры посещённых страниц на карте

**Decision:** Сохраняем факт первого посещения страницы и показываем на карте кликабельную метку в координатах точки страницы. Клик по метке переносит пользователя на соответствующую страницу.

**Reasoning:**
- ✅ Быстрая визуальная навигация по уже открытым локациям
- ✅ Прогресс пользователя виден прямо на карте
- ✅ Минимальные зависимости: хранение в `localStorage`

**Implementation:**
- Сохранение: при инициализации страницы считываем `data-map-point` у `.image-container` и сохраняем `{ page, point, title }` в `localStorage.visitedPages`.
- Отрисовка: при открытии карты (`map_modal.js`) создаём слой `#visited-markers-layer` и для каждой посещённой страницы ставим `.visited-marker` в координатах точки (`getMapPointCoords`).
- Навигация: по клику — `SPAManager.loadPage(page)` если доступен, иначе `location.href = page`.
- Адаптация: проценты для desktop, пересчёт в пиксели для mobile, обновление позиций на `resize`.

**Locations:**
- `map_modal.js` — сохранение посещения, рендер и позиционирование маркеров, переход по клику.
- `map_points.js` — источник координат точек.


### 2. ES6 Modules для модульной архитектуры

**Decision:** Использование ES6 import/export для разделения логики на модули

**Reasoning:**
- ✅ Явные зависимости между модулями
- ✅ Изоляция кода (нет глобальных переменных)
- ✅ Динамическая загрузка модулей (lazy loading)
- ✅ Поддержка нативно в современных браузерах

**Alternatives considered:**
- ❌ Global functions/objects - конфликты имен, сложно отслеживать зависимости
- ❌ CommonJS require - требует сборку

### 3. Универсальный обработчик геометок

**Decision:** Один `tumski_cathedral_handler.js` обрабатывает все геометки через универсальную функцию `setupUniversalGeoMarker()`

**Reasoning:**
- ✅ Единая логика для всех геометок (DRY принцип)
- ✅ Простое добавление новых геометок (вызов одной функции)
- ✅ Централизованное исправление багов
- ✅ Меньше дублирования кода

**Alternatives considered:**
- ❌ Отдельный обработчик для каждой геометки - дублирование кода, сложнее поддержка
- ❌ Инлайн обработчики в HTML - сложнее управлять, нет переиспользования

**Implementation:**
```javascript
// common_tumski.js
import { setupUniversalGeoMarker } from './tumski_cathedral_handler.js';

geometries.forEach(geometry => {
  setupUniversalGeoMarker({
    markerId: 'tumski_cathedral',
    i18nKey: 'tumski_cathedral'
  });
});
```

---

### Template для новых решений:

```markdown
### N. [Название решения]

**Decision:** [Краткое описание решения]
**Reasoning:**
- ✅ [Преимущество 1]
- ✅ [Преимущество 2]

**Alternatives considered:**
- ❌ [Отвергнутая альтернатива] - [причина]

**Data structure/Implementation:**
[Код или структура данных]
```

---

## 🔧 Key Services & Components

### [Сервис/Компонент #1]
**Purpose:** [Назначение]
**Location:** `[путь к файлу]`

**Key methods/features:**
```typescript
- method1() → описание
- method2() → описание
- feature1 → описание
```

**Architectural features:**
- [Особенность 1]
- [Особенность 2]

**Example usage:**
```typescript
// Пример использования
```

---

### Template для документирования сервисов:

```markdown
### [Service Name]
**Purpose:** [Что делает]
**Location:** `[file path]`

**Key methods:**
- method() → [описание]

**Features:**
- [Особенность]

**Example:**
[код]
```

---

## 📡 Data Flow & Integration Patterns

### 1. [User Flow #1 - например "User Login"]
```
User Action →
├── Step 1
├── Step 2
├── Step 3
└── Final Result
```

**Detailed flow:**
1. [Шаг 1 детально]
2. [Шаг 2 детально]
3. [Шаг 3 детально]

### 2. [User Flow #2]
```
[Диаграмма потока]
```

---

### Template для документирования потоков:

```markdown
### N. [Flow Name]
[ASCII диаграмма]

**Detailed:**
1. [Шаг]
2. [Шаг]
```

---

## 🎯 Development Standards

### Code Organization
- [ЗАПОЛНИТЬ: стандарты организации кода]
- **1 component = 1 file** (если применимо)
- **Services in lib/** for reusability
- **TypeScript strict mode** - no `any` (except justified exceptions)
- **Naming:** [соглашения по именованию]

### Database Patterns
[ЗАПОЛНИТЬ: если есть база данных]
- **Primary Keys:** [UUID/Auto-increment/etc]
- **Relationships:** [как организованы связи]
- **Migrations:** [как применяются миграции]
- **Security:** [RLS/Permissions/etc]

### Error Handling
- **Try/catch** in async functions
- **User-friendly** error messages (на русском/английском)
- **Console logging** for debugging
- **Fallback states** in UI

### Performance Optimizations
- [ЗАПОЛНИТЬ: специфичные для проекта оптимизации]
- **[Оптимизация 1]**
- **[Оптимизация 2]**
- **[Оптимизация 3]**

---

## 🧩 Module Architecture

> **Философия:** Модульная архитектура - основа эффективной разработки с ИИ-агентами

### Зачем нужна модульность?

**Критические преимущества для работы с ИИ:**

1. **Экономия токенов и денег**
   - ИИ загружает только нужный модуль (100-200 строк)
   - Вместо всего проекта (1000+ строк)
   - Запросы выполняются быстрее и дешевле

2. **Простота разработки и тестирования**
   - Каждый модуль = отдельная задача
   - Легко проверить работу модуля изолированно
   - ИИ лучше понимает узкие задачи

3. **Параллельная работа**
   - Можно разрабатывать разные модули одновременно
   - Ускоряет итерацию

4. **Управляемость проекта**
   - Легко найти и исправить ошибки
   - Понятная структура для команды
   - Простое добавление новых функций

### Принцип модульности

**Приложение = Набор маленьких кубиков (LEGO)**

```
┌─────────────────────────────────────────────┐
│           Приложение                        │
├─────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │   Auth   │  │ Database │  │   API    │ │
│  │  Module  │  │  Module  │  │  Module  │ │
│  └──────────┘  └──────────┘  └──────────┘ │
│                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │  Screen  │  │  Screen  │  │  Screen  │ │
│  │    1     │  │    2     │  │    3     │ │
│  └──────────┘  └──────────┘  └──────────┘ │
│                                             │
│  ┌──────────┐  ┌──────────┐                │
│  │ Business │  │ Business │                │
│  │  Logic 1 │  │  Logic 2 │                │
│  └──────────┘  └──────────┘                │
└─────────────────────────────────────────────┘
```

Каждый модуль:
- Решает **одну узкую задачу**
- Имеет **чёткий вход и выход**
- Работает как **"черный ящик"** для других модулей
- Может быть **протестирован отдельно**

---

### Типичные модули проекта

[ЗАПОЛНИТЬ по мере разработки, но вот типичная структура:]

#### 1. Модуль аутентификации
**Purpose:** Регистрация, вход, восстановление пароля
**Location:** `src/lib/auth/` или `src/features/auth/`
**Независимость:** Полностью самостоятельный, не зависит от бизнес-логики
**Интеграция:** Через Auth Provider или Context

**Компоненты:**
- LoginForm
- RegisterForm
- PasswordResetForm
- AuthProvider

---

#### 2. Модуль базы данных
**Purpose:** Работа с базой данных
**Location:** `src/lib/db/` или `src/lib/supabase/`
**Независимость:** Изолированная работа с БД
**Интеграция:** Через клиент (Supabase/Firebase/Prisma)

**Функции:**
- Подключение к БД
- CRUD операции
- Queries и mutations

---

#### 3. Модули экранов/страниц
**Purpose:** Отдельный экран = отдельный модуль
**Location:** `src/pages/` или `src/app/`
**Независимость:** Каждая страница независима

**Примеры:**
- HomePage
- DashboardPage
- SettingsPage
- ProfilePage

---

#### 4. Модули бизнес-логики
**Purpose:** Уникальная логика вашего приложения
**Location:** `src/features/` или `src/lib/business/`

**Примеры:**
- PaymentProcessor
- BookingSystem
- RatingCalculator
- NotificationManager

---

#### 5. Backend/API модуль
**Purpose:** Связь между фронтендом и базой данных
**Location:** `src/app/api/` или `src/lib/api/`
**Независимость:** Самостоятельный слой между UI и DB

**Функции:**
- API routes/endpoints
- Business logic на сервере
- Валидация данных

---

### Процесс разработки по модулям

**Последовательность (рекомендуется):**

1. **База данных** → Схема, таблицы, связи
2. **Аутентификация** → Регистрация, вход
3. **Backend/API** → Эндпоинты для работы с данными
4. **Экраны по одному** → HomePage → Dashboard → Settings...
5. **Бизнес-логика** → Уникальные функции вашего приложения

**Правило:** Один модуль → Тестирование → Следующий модуль

---

### Пример модуля (Документация)

### [Module Name - например "User Authentication"]
**Purpose:** [Что делает модуль]

**Location:** `[путь к файлам модуля]`

**Components:**
- `Component1.tsx` - [описание]
- `Component2.tsx` - [описание]
- `service.ts` - [логика модуля]

**Dependencies:**
- [Внешние зависимости: библиотеки, сервисы]

**Integration with other modules:**
- [Как этот модуль взаимодействует с другими]

**Input/Output:**
```typescript
// Вход
interface ModuleInput {
  // ...
}

// Выход
interface ModuleOutput {
  // ...
}
```

**Example usage:**
```typescript
// Пример использования модуля
import { useAuth } from './auth-module';

const { user, login, logout } = useAuth();
```

**Testing:**
- [Как тестируется модуль]

---

### Ваши модули проекта

[ЗАПОЛНИТЬ по мере разработки - добавляйте каждый модуль сюда]

#### Module 1: [Name]
[Документация]

#### Module 2: [Name]
[Документация]

---

## 🗄️ Database Schema

[ЗАПОЛНИТЬ: структура базы данных]

### Tables Overview
```
[table_name_1]
├── id: uuid (PK)
├── field1: type
└── field2: type

[table_name_2]
├── id: uuid (PK)
└── foreign_key: uuid (FK → table_name_1)
```

### Relationships
- [Описание связей между таблицами]

### Indexes
- [Какие индексы созданы и зачем]

### Security
- [RLS policies или другие меры безопасности]

---

## 🔐 Security Architecture

[ЗАПОЛНИТЬ: меры безопасности]

### Authentication
- **Method:** [OAuth/JWT/Session/etc]
- **Provider:** [Auth0/Supabase/Custom/etc]
- **Flow:** [Описание процесса аутентификации]

### Authorization
- **Model:** [RBAC/ABAC/Custom/etc]
- **Implementation:** [Как проверяются права доступа]

### Data Protection
- **At Rest:** [Шифрование данных]
- **In Transit:** [HTTPS/TLS]
- **API Keys:** [Как хранятся]
- **Sensitive Data:** [Как обрабатываются]

### Security Headers
```javascript
// Пример настройки security headers
```

---

## 🚀 Deployment Architecture

[ЗАПОЛНИТЬ: архитектура деплоя]

### Environments
- **Development:** [localhost/dev server]
- **Staging:** [URL/описание]
- **Production:** [URL/описание]

### CI/CD Pipeline
```
[Описание процесса деплоя]
Code → Tests → Build → Deploy
```

### Environment Variables
```env
# Required
VAR_NAME=description

# Optional
OPTIONAL_VAR=description
```

---

## 📊 State Management Architecture

[ЗАПОЛНИТЬ: как организовано управление состоянием]

### Global State
```typescript
// Структура глобального состояния
interface AppState {
  [ЗАПОЛНИТЬ]
}
```

### Local State
[Когда использовать локальное состояние]

### State Update Patterns
```typescript
// Примеры паттернов обновления состояния
```

---

## 🔄 Evolution & Migration Strategy

### Approach to Changes
1. **Document decision** in this file
2. **Database changes** → Create migration script
3. **Backward compatibility** when possible
4. **Feature flags** for experimental functionality

### Migration Pattern
```
Planning → Implementation → Testing → Documentation → Deployment
    ↓           ↓              ↓           ↓            ↓
ARCHITECTURE  Code+Tests    Manual QA   Update docs   Git push
```

### Version History
- **[VERSION]** - [DATE] - [Changes summary]
- [Добавляйте по мере развития]

---

## 🧪 Module Testing - Изолированное тестирование

> **Зачем:** Каждый модуль должен работать независимо от остальных. Это экономит время и токены при разработке с AI.

### Принцип модульного тестирования:

**❌ Плохо:**
```
Тестирую весь проект сразу →
Непонятно где ошибка →
AI загружает весь код →
Долго, дорого
```

**✅ Хорошо:**
```
Тестирую один модуль →
Ошибка локализована →
AI видит только 1 модуль →
Быстро, дёшево
```

### Как тестировать модуль изолированно:

#### Шаг 1: Создать тестовую страницу

```typescript
// src/test/[ModuleName]Test.tsx
import { [ModuleName] } from '../modules/[module-name]/[ModuleName]';

function [ModuleName]Test() {
  return (
    <div className="p-8">
      <h1>Testing: [ModuleName]</h1>
      <[ModuleName] />
    </div>
  );
}

export default [ModuleName]Test;
```

#### Шаг 2: Временно подключить в App

```typescript
// src/App.tsx (временно)
import [ModuleName]Test from './test/[ModuleName]Test';

function App() {
  return <[ModuleName]Test />;
}
```

#### Шаг 3: Проверить функциональность

**Чеклист для тестирования модуля:**
- [ ] Модуль отображается без ошибок
- [ ] Основной функционал работает
- [ ] Edge cases обработаны
- [ ] Error states показываются правильно
- [ ] Loading states работают
- [ ] UI responsive (если применимо)

#### Шаг 4: Вернуть App к исходному виду

После тестирования:
- Восстановить `App.tsx`
- Удалить test файл или оставить для документации
- Сделать commit с результатами

### Критерии готовности модуля:

Модуль считается **готовым** когда:

#### Базовые критерии:
- [ ] Все файлы модуля созданы (component, hook, types)
- [ ] Код компилируется без ошибок TypeScript
- [ ] Нет ESLint warnings (или обоснованы)
- [ ] Модуль протестирован изолированно

#### Функциональные критерии:
- [ ] Основной функционал реализован
- [ ] Edge cases обработаны
- [ ] Error handling добавлен
- [ ] Loading states реализованы
- [ ] Валидация данных работает

#### Документация:
- [ ] Интерфейс модуля задокументирован
- [ ] Зависимости указаны
- [ ] Примеры использования есть (если нужно)

#### Мета-файлы:
- [ ] BACKLOG.md — задачи отмечены ✅
- [ ] PROJECT_SNAPSHOT.md — модуль добавлен
- [ ] PROCESS.md — чеклист выполнен

### Граф зависимостей модулей:

**Важно:** Разрабатывай модули в правильном порядке!

```
Независимые модули (сначала):
├─ UI Components (Button, Input, etc.)
├─ Utility Modules (encryption, validation)
└─ API Clients (без UI)

Зависимые модули (потом):
├─ Feature Modules
│   └─ depends on: UI Components, Utilities
└─ Integration Modules
    └─ depends on: Feature Modules
```

**Как определить порядок:**
1. Нарисуй граф зависимостей
2. Начни с модулей без входящих стрелок
3. Переходи к следующему уровню только после готовности предыдущего

### Экономия токенов через модульное тестирование:

**Пример:** Проект с 5 модулями

**Без изоляции:**
```
Тестируешь весь проект:
→ AI читает все 5 модулей (2000 строк)
→ ~8000 токенов × 3 итерации = 24k токенов
→ Стоимость: ~$0.24
```

**С изоляцией:**
```
Тестируешь каждый модуль отдельно:
→ AI читает 1 модуль (400 строк)
→ ~1500 токенов × 3 итерации × 5 модулей = 22.5k токенов
→ НО! Меньше итераций (быстрее находишь баги)
→ Реально: ~1500 × 2 × 5 = 15k токенов
→ Стоимость: ~$0.15

Экономия: ~40%! + Быстрее разработка!
```

### Template для документирования тестов:

```markdown
## Тестирование [Module Name]

### Тест 1: [Название функциональности]
- **Действие:** [что делаем]
- **Ожидаемый результат:** [что должно произойти]
- **Статус:** [x] Passed / [ ] Failed
- **Баги:** [если найдены]

### Тест 2: [Edge case]
- **Действие:** [что делаем]
- **Ожидаемый результат:** [что должно произойти]
- **Статус:** [x] Passed / [ ] Failed

### Итог:
- ✅ Модуль готов к интеграции
- ⏸️ Требуются доработки: [список]
```

---

## 📚 Related Documentation

- **BACKLOG.md** - Current implementation status and roadmap
- **PROJECT_SNAPSHOT.md** - Current project state snapshot
- **PROCESS.md** - Documentation update process after each phase
- **DEVELOPMENT_PLAN_TEMPLATE.md** - Planning methodology
- **AGENTS.md** - AI assistant working instructions
- **WORKFLOW.md** - Development processes and sprint workflow
- **README.md** - User-facing project information

---

## 📝 Architecture Decision Records (ADR)

[Опционально: для документирования важных архитектурных решений]

### ADR-001: [Decision Title]
**Date:** [DATE]
**Status:** [Accepted/Deprecated/Superseded]
**Context:** [Почему нужно было принять решение]
**Decision:** [Что решили]
**Consequences:** [К чему это привело]

---

## 🎨 Design Patterns Used

[ЗАПОЛНИТЬ: какие паттерны проектирования используются]

- **[Pattern Name]** - [Где используется и зачем]
- Примеры:
  - **Repository Pattern** - в `lib/repositories/`
  - **Factory Pattern** - в `lib/factories/`
  - **Observer Pattern** - в state management

---

## 📝 Notes for Customization

Когда заполняете этот файл для конкретного проекта:

1. **Замените все [ЗАПОЛНИТЬ]** на актуальную информацию
2. **Удалите секции** которые не применимы к вашему проекту
3. **Добавьте новые секции** специфичные для вашего проекта
4. **Обновляйте документ** при каждом архитектурном изменении
5. **Используйте диаграммы** где нужно (Mermaid/ASCII)
6. **Удалите эту секцию** после первичного заполнения

---

*This document maintained in current state for effective development*
*Last updated: [DATE]*
