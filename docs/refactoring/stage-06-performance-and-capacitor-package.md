# Stage 6 - Performance и Capacitor package

## Цель

Снизить вес сборки и стабилизировать поведение в WebView без ухудшения визуального качества.

## Контекст

Текущий `make build` собирает `www/` размером около `138.2 MB`. В `BACKLOG.md` Performance Optimization уже находится в активных задачах Phase 2.

## Scope

Входит:

- inventory тяжелых ассетов;
- проверка неиспользуемых runtime файлов;
- image optimization plan;
- lazy/preload policy;
- audio lifecycle review;
- loading states;
- Capacitor smoke.

Не входит:

- потеря качества ключевых изображений без review;
- удаление ассетов без доказательства неиспользования;
- изменение художественного направления.

## Шаги

1. Составить asset size report.
   - Топ изображений по размеру.
   - Топ аудио по размеру.
   - Что попадает в `www`.
   - Что реально referenced.

2. Разделить assets по назначению.
   - Background/fullscreen;
   - thumbnails;
   - icons/UI;
   - book/quest art;
   - audio;
   - unused candidates.

3. Ввести package budget.
   - Общий размер `www`;
   - размер critical path;
   - max размер одного изображения;
   - исключения с причиной.

4. Оптимизировать изображения партиями.
   - Сначала obvious duplicates/unreferenced.
   - Потом thumbnails.
   - Потом fullscreen assets с screenshot comparison.

5. Проверить loading states.
   - На медленной загрузке не должно быть пустого экрана.
   - Ошибки ассетов должны быть диагностируемыми.

6. Проверить audio lifecycle.
   - Audio unlock;
   - route transition;
   - stop/pause per page;
   - отсутствие дублированных audio nodes после SPA navigation.

7. Capacitor validation.
   - Web build;
   - mobile viewport;
   - Android/iOS build only when requested and environment ready.

## Проверки

```bash
make test
make build
make security
```

Дополнительно:

- asset size report before/after;
- browser screenshot comparison для оптимизированных сцен;
- mobile viewport smoke;
- audio unlock smoke.

## Done

- Есть понятный asset budget.
- `www/` стал меньше или имеет документированное объяснение размера.
- Нет active missing assets.
- Loading states покрывают медленные загрузки.
- Audio behavior не регрессировал.

## Stop signals

- Невозможно визуально проверить оптимизированные изображения.
- Сжатие портит ключевые сцены.
- Capacitor build требует внешних действий/подписей/SDK, не готовых в окружении.

