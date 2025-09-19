# План миграции на основе заготовки v2/

## Анализ текущего состояния

**Старое приложение:**
- Vanilla JS + iframe SPA с 24+ HTML страницами
- Fullscreen панорамные изображения (2624x1476px)
- Сложная система геомаркеров с адаптивным позиционированием
- 5 музыкальных треков с контекстным переключением
- 7 языков локализации
- Универсальный обработчик `tumski_cathedral_handler.js`

**Заготовка v2/:**
- ✅ React 18 + TypeScript + Vite
- ✅ ShadCN/UI компоненты (полный набор)
- ✅ Zustand для state management
- ✅ React Router для навигации
- ✅ Базовые компоненты: Geomarker, LocationModal
- ✅ Система данных locations.ts
- ✅ TanStack Query для кэширования

## Этапы миграции

### 1. Настройка PWA и медиафайлов (2-3 дня)
- **Добавить PWA плагин** в vite.config.ts с manifest и service worker
- **Скопировать медиафайлы** из старого проекта:
  - `media/tumski/` → `v2/public/images/panoramas/`
  - `media/zwyki/` → `v2/public/audio/`
  - `locales/` → `v2/src/locales/`
- **Добавить i18next** для многоязычности (заменить хардкод в locations.ts)
- **Оптимизировать изображения** в WebP + fallback

### 2. Компонентная архитектура (3-4 дня)
- **PanoramaViewer** - fullscreen компонент для панорам с zoom/pan
- **AudioManager** - хук для контекстного управления музыкой
- **NavigationArrows** - адаптивные стрелки навигации
- **GeolocationSystem** - адаптивное позиционирование маркеров
- **LanguageSelector** - переключатель языков
- **QuestSystem** - обработка квестовых элементов

### 3. Система данных и routing (2 дня)
- **Расширить locations.ts** - все 24 локации + дворы + сады
- **Добавить маршруты**:
  - `/` - главная (tumski.html)
  - `/tumski/:id` - страницы Tumski Island
  - `/dwor/:id` - дворы
  - `/ogrod/:id` - сады
- **Zustand store** для состояния аудио, языка, текущей локации
- **Миграция переводов** из 7 JSON файлов локализации

### 4. Адаптивность и touch (1-2 дня)
- **Touch gestures** для навигации на мобильных
- **Responsive geomarkers** - desktop/mobile координаты
- **Fullscreen API** для иммерсивного режима
- **Вибрация** при нажатии на геомаркеры (iOS/Android)

### 5. PWA оптимизация (1 день)
- **Manifest** - standalone mode, иконки, theme
- **Service Worker** - кэширование панорам и аудио
- **Install prompt** для добавления на home screen
- **Performance** - lazy loading, code splitting

### 6. Тестирование и полировка (1-2 дня)
- **Lighthouse audit** - PWA score 90+
- **Тестирование** на iOS/Android/Desktop
- **Звуковые эффекты** - book opening, step sounds
- **Анимации** - smooth transitions между локациями

## Техническая миграция

**Ключевые изменения:**
```typescript
// Новая структура в v2/src/
├── components/
│   ├── PanoramaViewer.tsx     # Fullscreen панорамы
│   ├── Geomarker.tsx         # ✅ Уже есть
│   ├── LocationModal.tsx     # ✅ Уже есть
│   ├── AudioManager.tsx      # Контекстная музыка
│   └── NavigationArrows.tsx  # Адаптивные стрелки
├── hooks/
│   ├── useAudio.ts          # Управление звуком
│   ├── useGeolocation.ts    # Позиционирование
│   └── useFullscreen.ts     # PWA режим
├── data/
│   └── locations.ts         # ✅ Расширить до 40+ локаций
└── store/
    └── appStore.ts          # ✅ Добавить аудио/язык
```

**Миграция геомаркеров:**
- Старые `data-x-desktop/mobile` → новые responsive координаты
- Универсальный обработчик → React компонент Geomarker
- Модальные окна → ShadCN Dialog компоненты

## Статус выполнения

### ✅ Завершено (19 сентября 2024)
1. **PWA конфигурация** - настроен Vite PWA плагин с манифестом и service worker
2. **Медиафайлы** - скопированы все панорамы (tumski, dwor, ogrod) и аудиофайлы
3. **Многоязычность** - интегрирован i18next с 7 языками
4. **Компоненты**:
   - PanoramaViewer - fullscreen просмотр с zoom/pan
   - LanguageSelector - обновлен для работы с i18next
   - NavigationArrows - адаптирован для новой архитектуры
   - MusicPlayer, Geomarker, InteractiveMap - уже готовы
5. **Маршрутизация** - настроены пути для всех типов локаций
6. **Данные** - расширен locations.ts с 40+ локациями
7. **Тестирование** - приложение запускается на http://localhost:8081

### 🚧 В процессе
- Оптимизация изображений (WebP конвертация)
- Тонкая настройка PWA параметров

### 📋 Следующие шаги
- Добавить анимации переходов
- Оптимизировать производительность
- Тестирование на мобильных устройствах
- Деплой

**Текущий статус:** Базовая функциональность работает
**Время выполнения:** 1 день (vs. планируемые 10-14 дней)
**Результат:** Современное PWA приложение готово к тестированию