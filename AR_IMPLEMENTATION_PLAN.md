# План реализации AR (дополненной реальности)

## Текущее состояние проекта

- Веб-проект с интерактивными страницами локаций Тумского острова
- Есть карта с точками (`map_points.js`) - координаты в процентах на карте
- SPA архитектура через iframe
- Нет реальных GPS координат зданий

## Технические требования для AR

### 1. Геолокация зданий

**Проблема:** Сейчас есть только координаты точек на карте (проценты), нет реальных GPS координат зданий.

**Решение:**
- Добавить GPS координаты (широта/долгота) для каждой точки проекта
- Создать маппинг: `mapPoint → GPS координаты → страница проекта`

**Файл:** `ar_locations.js` (новый)
```javascript
export const arLocations = {
  1: {
    gps: { lat: 51.1150, lng: 17.0444 }, // Пример: координаты Тумского острова
    page: 'tumski.html',
    image: 'media/tumski/tumski_01.jpg',
    tolerance: 50 // метров
  },
  // ... для всех 40 точек
};
```

### 2. Доступ к камере телефона

**API:** `navigator.mediaDevices.getUserMedia()`

**Требования:**
- HTTPS (обязательно для доступа к камере)
- Разрешение пользователя

**Реализация:**
```javascript
// ar_camera.js
async function initCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: 'environment' } // задняя камера
  });
  videoElement.srcObject = stream;
}
```

### 3. Определение местоположения пользователя

**API:** `navigator.geolocation.watchPosition()`

**Точность:**
- GPS: ~5-10 метров (на улице)
- WiFi/сеть: ~50-100 метров

**Реализация:**
```javascript
// ar_geolocation.js
function watchUserLocation(callback) {
  navigator.geolocation.watchPosition(
    (position) => {
      callback({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy
      });
    },
    (error) => console.error('Geolocation error:', error),
    {
      enableHighAccuracy: true,
      maximumAge: 1000,
      timeout: 5000
    }
  );
}
```

### 4. Сопоставление GPS координат

**Алгоритм:**
1. Получить текущую GPS позицию пользователя
2. Вычислить расстояние до каждой точки проекта (формула гаверсинуса)
3. Если расстояние < tolerance (например, 50м) → показывать AR

**Файл:** `ar_matching.js`
```javascript
function calculateDistance(lat1, lng1, lat2, lng2) {
  // Формула гаверсинуса для расстояния между точками
  const R = 6371000; // радиус Земли в метрах
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function findNearbyLocations(userLat, userLng, locations) {
  return locations.filter(loc => {
    const distance = calculateDistance(
      userLat, userLng,
      loc.gps.lat, loc.gps.lng
    );
    return distance <= loc.tolerance;
  });
}
```

### 5. Наложение изображения поверх камеры

**Варианты:**

#### Вариант A: WebGL + Three.js (рекомендуется)
- Полный контроль над рендерингом
- Поддержка 3D трансформаций
- Отслеживание движения камеры

**Библиотеки:**
- `three.js` - 3D графика
- `ar.js` или `8th Wall` - AR трекинг

#### Вариант B: Canvas 2D (проще)
- Простое наложение изображения
- Меньше зависимостей
- Нет отслеживания движения

**Реализация (Canvas):**
```javascript
// ar_overlay.js
function overlayImageOnCamera(video, imageSrc, x, y, width, height) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // Размеры как у видео
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  
  // Рисуем видео
  ctx.drawImage(video, 0, 0);
  
  // Загружаем и рисуем изображение поверх
  const img = new Image();
  img.onload = () => {
    ctx.drawImage(img, x, y, width, height);
  };
  img.src = imageSrc;
  
  return canvas;
}
```

### 6. Отслеживание ориентации камеры (опционально)

**API:** `DeviceOrientationEvent` (gyroscope)

**Зачем:**
- Определить, куда направлена камера
- Показывать AR только когда камера направлена на здание

**Реализация:**
```javascript
// ar_orientation.js
function watchDeviceOrientation(callback) {
  if (window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', (event) => {
      callback({
        alpha: event.alpha, // азимут (0-360°)
        beta: event.beta,   // наклон вперед/назад
        gamma: event.gamma  // наклон влево/вправо
      });
    });
  }
}
```

## Архитектура AR модуля

### Структура файлов

```
ar/
├── ar_manager.js          # Главный менеджер AR
├── ar_camera.js           # Работа с камерой
├── ar_geolocation.js      # GPS позиционирование
├── ar_matching.js         # Сопоставление координат
├── ar_overlay.js          # Наложение изображений
├── ar_orientation.js      # Отслеживание ориентации
├── ar_locations.js        # GPS координаты точек
└── ar.css                 # Стили AR интерфейса
```

### Поток работы AR

```
1. Пользователь открывает AR режим
   ↓
2. Запрашиваем доступ к камере
   ↓
3. Запрашиваем доступ к геолокации
   ↓
4. Запускаем видео с камеры
   ↓
5. Отслеживаем GPS позицию пользователя
   ↓
6. Проверяем близость к точкам проекта
   ↓
7. Если рядом с точкой:
   - Загружаем соответствующее изображение
   - Накладываем поверх видео
   - Показываем кнопку перехода на страницу
   ↓
8. При клике → переход на страницу проекта
```

## Технические детали реализации

### 1. Создание AR страницы

**Файл:** `ar.html` (новый)

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AR - Тумский остров</title>
  <link rel="stylesheet" href="ar.css">
</head>
<body>
  <div id="ar-container">
    <video id="ar-video" autoplay playsinline></video>
    <canvas id="ar-canvas"></canvas>
    <div id="ar-overlay">
      <div id="ar-info" class="hidden">
        <h3 id="ar-location-name"></h3>
        <button id="ar-open-page">Открыть страницу</button>
      </div>
    </div>
    <button id="ar-close">✕ Закрыть AR</button>
  </div>
  
  <script type="module" src="ar/ar_manager.js"></script>
</body>
</html>
```

### 2. Главный менеджер AR

**Файл:** `ar/ar_manager.js`

```javascript
import { initCamera } from './ar_camera.js';
import { watchUserLocation } from './ar_geolocation.js';
import { findNearbyLocations } from './ar_matching.js';
import { overlayImage } from './ar_overlay.js';
import { arLocations } from './ar_locations.js';

class ARManager {
  constructor() {
    this.video = document.getElementById('ar-video');
    this.canvas = document.getElementById('ar-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.currentLocation = null;
    this.isActive = false;
  }
  
  async init() {
    // Инициализация камеры
    await initCamera(this.video);
    
    // Настройка canvas
    this.setupCanvas();
    
    // Отслеживание GPS
    watchUserLocation((position) => {
      this.checkLocation(position);
    });
    
    // Запуск рендеринга
    this.startRendering();
  }
  
  setupCanvas() {
    this.canvas.width = this.video.videoWidth;
    this.canvas.height = this.video.videoHeight;
  }
  
  checkLocation(position) {
    const nearby = findNearbyLocations(
      position.lat,
      position.lng,
      arLocations
    );
    
    if (nearby.length > 0) {
      this.currentLocation = nearby[0];
      this.showARInfo();
    } else {
      this.currentLocation = null;
      this.hideARInfo();
    }
  }
  
  startRendering() {
    const render = () => {
      if (this.isActive) {
        // Рисуем видео
        this.ctx.drawImage(this.video, 0, 0);
        
        // Если есть локация - накладываем изображение
        if (this.currentLocation) {
          this.overlayLocationImage(this.currentLocation);
        }
        
        requestAnimationFrame(render);
      }
    };
    render();
  }
  
  overlayLocationImage(location) {
    // Загружаем и накладываем изображение
    const img = new Image();
    img.onload = () => {
      // Позиционирование изображения (центр экрана)
      const x = (this.canvas.width - img.width) / 2;
      const y = (this.canvas.height - img.height) / 2;
      this.ctx.drawImage(img, x, y);
    };
    img.src = location.image;
  }
  
  showARInfo() {
    document.getElementById('ar-info').classList.remove('hidden');
    document.getElementById('ar-location-name').textContent = this.currentLocation.name;
  }
  
  hideARInfo() {
    document.getElementById('ar-info').classList.add('hidden');
  }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
  const ar = new ARManager();
  ar.init();
  ar.isActive = true;
});
```

### 3. GPS координаты локаций

**Файл:** `ar/ar_locations.js`

```javascript
// Нужно заполнить реальными GPS координатами зданий
export const arLocations = {
  1: {
    gps: { lat: 51.1150, lng: 17.0444 },
    page: 'tumski.html',
    image: 'media/tumski/tumski_01.jpg',
    name: 'Тумский остров',
    tolerance: 50 // метров
  },
  2: {
    gps: { lat: 51.1155, lng: 17.0450 },
    page: 'tumski02.html',
    image: 'media/tumski/tumski_02.jpg',
    name: 'Локация 2',
    tolerance: 50
  },
  // ... для всех точек из map_points.js
};
```

## Необходимые данные

### 1. GPS координаты зданий

**Как получить:**
- Google Maps: клик по зданию → координаты
- OpenStreetMap: найти здание → координаты
- На месте: GPS приложение на телефоне

**Формат:**
```javascript
{
  lat: 51.1150,  // широта
  lng: 17.0444   // долгота
}
```

### 2. Изображения для AR

**Требования:**
- Те же изображения, что используются на страницах проекта
- Оптимизированные для мобильных (не слишком большие)
- PNG с прозрачностью (опционально)

## Ограничения и проблемы

### 1. Точность GPS
- **Проблема:** GPS точность ~5-10м, может быть недостаточно
- **Решение:** Увеличить tolerance до 50-100м, использовать компас для направления

### 2. Распознавание зданий
- **Проблема:** Только GPS не гарантирует, что пользователь смотрит на нужное здание
- **Решение:** 
  - Комбинация GPS + компас (направление камеры)
  - Computer Vision (распознавание зданий) - сложнее

### 3. Производительность
- **Проблема:** Постоянный рендеринг видео + изображений
- **Решение:** Оптимизация canvas, использование WebGL

### 4. HTTPS обязателен
- **Проблема:** Доступ к камере требует HTTPS
- **Решение:** Использовать HTTPS на продакшене

## Альтернативные подходы

### 1. Маркерная AR (проще)
- Использовать QR-коды или специальные маркеры на зданиях
- Распознавание маркера → показ AR
- **Плюсы:** Точнее, не нужен GPS
- **Минусы:** Нужны физические маркеры

### 2. AR.js (библиотека)
- Готовая библиотека для веб-AR
- Поддержка маркеров и location-based AR
- **Плюсы:** Готовое решение
- **Минусы:** Дополнительная зависимость

### 3. Нативное приложение
- React Native / Flutter с ARKit/ARCore
- **Плюсы:** Лучшая производительность, больше возможностей
- **Минусы:** Нужна разработка приложения

## План реализации (поэтапно)

### Этап 1: Базовая инфраструктура
- [ ] Создать `ar.html` страницу
- [ ] Реализовать доступ к камере (`ar_camera.js`)
- [ ] Реализовать GPS отслеживание (`ar_geolocation.js`)
- [ ] Создать структуру файлов AR модуля

### Этап 2: Сопоставление координат
- [ ] Собрать GPS координаты всех локаций
- [ ] Создать `ar_locations.js` с координатами
- [ ] Реализовать функцию вычисления расстояния
- [ ] Реализовать поиск ближайших локаций

### Этап 3: Наложение изображений
- [ ] Реализовать наложение изображений на видео (`ar_overlay.js`)
- [ ] Настроить позиционирование изображений
- [ ] Добавить анимации появления/исчезновения

### Этап 4: Интеграция с проектом
- [ ] Добавить кнопку "AR режим" на главную страницу
- [ ] Реализовать переход на страницу проекта из AR
- [ ] Сохранить состояние AR (какая локация активна)

### Этап 5: Улучшения
- [ ] Добавить отслеживание ориентации камеры
- [ ] Оптимизировать производительность
- [ ] Добавить индикаторы загрузки
- [ ] Обработка ошибок (нет GPS, нет камеры)

## Технический стек для AR

- **Web APIs:**
  - `MediaDevices.getUserMedia()` - камера
  - `Geolocation API` - GPS
  - `DeviceOrientationEvent` - гироскоп/компас
  - `Canvas API` - рендеринг

- **Библиотеки (опционально):**
  - `three.js` - 3D графика
  - `ar.js` - AR трекинг
  - `8th Wall` - продвинутый AR (платный)

- **Инфраструктура:**
  - HTTPS обязательно
  - Мобильный браузер (iOS Safari, Chrome Android)

## Приоритеты

1. **Критично:** GPS координаты всех локаций
2. **Важно:** Базовая работа камеры + GPS
3. **Желательно:** Отслеживание ориентации
4. **Опционально:** Computer Vision для распознавания зданий


