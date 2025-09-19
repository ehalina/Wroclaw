# Фоновые эффекты и параллакс

## Обзор

В проекте реализованы два основных компонента для создания иммерсивных фоновых эффектов:

### 1. ParallaxBackground
Базовый компонент с параллакс эффектом и приближением.

**Основные параметры:**
- `intensity` - интенсивность параллакса (0.1-0.5)
- `direction` - направление параллакса ('horizontal', 'vertical', 'both')
- `speed` - скорость реакции на движение мыши (0.5-2.0)
- `zoomEffect` - включить эффект приближения (true/false)
- `zoomDuration` - длительность приближения в миллисекундах (по умолчанию 10000)
- `zoomAmount` - количество приближения (0.1 = 10%)
- `layers` - количество слоев для глубины (1-5)

### 2. ImmersiveBackground
Продвинутый компонент с дополнительными эффектами.

**Дополнительные параметры:**
- `breathingEffect` - эффект "дыхания" фона (true/false)
- `breathingSpeed` - скорость дыхания в миллисекундах (по умолчанию 8000)

## Использование

### В PanoramaViewer
```tsx
<ParallaxBackground
  imageUrl={imagePath}
  alt={`Panorama of ${location.name}`}
  intensity={0.3}
  direction="both"
  speed={1.5}
  enabled={!isDragging}
  overlay={false}
  layers={2}
  zoomEffect={true}
  zoomDuration={10000}
  zoomAmount={0.1}
  className="w-full h-full"
>
  {/* Геомаркеры и другой контент */}
</ParallaxBackground>
```

### На главной странице
```tsx
<ParallaxBackground
  imageUrl="/images/panoramas/tumski_01.jpg"
  alt="Tumski Island Panorama"
  intensity={0.4}
  direction="both"
  speed={1.5}
  enabled={true}
  overlay={true}
  overlayOpacity={0.5}
  layers={3}
  zoomEffect={true}
  zoomDuration={10000}
  zoomAmount={0.1}
  className="absolute inset-0"
/>
```

## Эффекты

### Параллакс
- Реагирует на движение мыши/касания
- Создает ощущение глубины
- Не влияет на UI элементы (кнопки, текст)

### Приближение (Zoom)
- **Плавное увеличение фона на 10% за 10 секунд**
- **Срабатывает при каждой смене локации**
- Создает эффект погружения
- Останавливается после завершения
- Перезапускается при переходе к новой локации

### Дыхание (Breathing)
- Легкое покачивание фона
- Начинается после завершения приближения
- Создает живую атмосферу

### Переходы между локациями
- Плавная анимация смены изображений
- Автоматический перезапуск zoom эффекта
- Задержка 100мс для плавного перехода
- Принудительное обновление через React key

## Производительность

- Использует `will-change` для оптимизации
- `transform3d` для аппаратного ускорения
- `requestAnimationFrame` для плавной анимации
- Отключение эффектов при перетаскивании

## CSS классы

- `.parallax-optimized` - оптимизация производительности
- `.parallax-smooth` - плавные переходы
- `.animate-zoom-immersive` - анимация приближения
