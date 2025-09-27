#!/bin/bash

# Скрипт для комментирования всех console.log в файлах

# Находим все .js и .html файлы
find . -name "*.js" -o -name "*.html" | while read file; do
    if [ -f "$file" ]; then
        echo "Обрабатываем файл: $file"
        # Комментируем console.log (только те, что не закомментированы)
        sed -i '' 's/^[[:space:]]*console\.log(/    \/\/ console.log(/g' "$file"
        # Комментируем console.log в середине строки
        sed -i '' 's/console\.log(/\/\/ console.log(/g' "$file"
    fi
done

echo "Готово! Все console.log закомментированы."
