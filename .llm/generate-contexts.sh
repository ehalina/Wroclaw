#!/bin/bash
# Генерация модульных контекстов вместо одного большого

cd "$(dirname "$0")"

# 1. Только документация
prj2ctx . -o context-docs.md \
  --title "Wroclaw - Documentation Only" \
  --ignore "*.js" "*.html" "*.css" "*.json" "media/**" \
  --max-bytes-per-file 100000

# 2. Только ключевые JS модули
prj2ctx . -o context-core-js.md \
  --title "Wroclaw - Core JavaScript Modules" \
  --ignore "*.html" "*.css" "*.md" "media/**" "tumski*.js" "dwor*.js" "ogrod*.js" \
  --max-bytes-per-file 50000

# 3. Примеры страниц (1-2 примера каждого типа)
prj2ctx . -o context-pages-examples.md \
  --title "Wroclaw - Page Examples" \
  --ignore "tumski[2-9]*.html" "tumski1[0-9]*.html" "tumski2[0-4]*.html" \
           "dwor[2-9]*.html" "dwor1[0-3]*.html" \
           "ogrod[3-9]*.html" "ogrod1[2-3]*.html" \
           "*.md" "*.js" "media/**" \
  --max-bytes-per-file 100000

# 4. Локализация
prj2ctx . -o context-locales.md \
  --title "Wroclaw - Localization" \
  --ignore "*.js" "*.html" "*.css" "*.md" "media/**" \
  --max-bytes-per-file 50000

echo "✅ Модульные контексты созданы:"
echo "  - context-docs.md (документация)"
echo "  - context-core-js.md (ключевые модули)"
echo "  - context-pages-examples.md (примеры страниц)"
echo "  - context-locales.md (локализация)"






