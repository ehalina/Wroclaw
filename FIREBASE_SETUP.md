# Настройка Firebase для проекта Wroclaw Quest

## Шаг 1: Создание проекта Firebase

1. Перейдите на [Firebase Console](https://console.firebase.google.com/)
2. Нажмите "Add project" (Добавить проект)
3. Введите название проекта (например, "Wroclaw Quest")
4. Следуйте инструкциям для создания проекта

## Шаг 2: Включение Authentication

1. В Firebase Console перейдите в раздел **Authentication**
2. Нажмите "Get started"
3. Перейдите на вкладку **Sign-in method**
4. Включите **Anonymous** (Анонимный вход)
5. Включите **Email/Password** (Email/Пароль)
6. Включите **Google** (для сохранения через Google)
7. Включите **Facebook** (для сохранения через Facebook)

### Настройка Facebook Authentication

Для работы Facebook авторизации нужно:

1. **Создать приложение в Facebook Developers:**
   - Перейдите на [Facebook Developers](https://developers.facebook.com/)
   - Создайте новое приложение (тип: "Consumer")
   - Добавьте продукт "Facebook Login"

2. **Настроить OAuth Redirect URIs:**
   
   **Шаг 2.1: Добавить в Facebook Login Settings**
   - В Facebook Developers перейдите в ваше приложение
   - В боковом меню выберите **Products** → **Facebook Login**
   - Перейдите в **Settings** (настройки Facebook Login)
   - **ПРОКРУТИТЕ СТРАНИЦУ ВВЕРХ** - поле **Valid OAuth Redirect URIs** находится ВЫШЕ секции "Redirect URI Validator"
   - Найдите поле **Valid OAuth Redirect URIs** (обычно это текстовое поле или список)
   - Добавьте URI (каждый на новой строке):
     ```
     https://wroclaw-8f1bd.firebaseapp.com/__/auth/handler
     https://wroclaw-8f1bd.web.app/__/auth/handler
     http://localhost:8000/__/auth/handler
     ```
   - **ВАЖНО:** 
     - Копируйте URI точно, без пробелов в начале/конце
     - URI должен быть с протоколом `https://` (или `http://` для localhost)
     - Если поле не видно, попробуйте найти его в разделе **Settings** → **Basic** → **Add Platform** → **Website**
   - Нажмите **Save Changes** внизу страницы
   - Подождите 1-2 минуты и проверьте URI через "Redirect URI Validator"
   
   **Шаг 2.2: Проверить App Domains (опционально, но рекомендуется)**
   - Перейдите в **Settings** → **Basic** (основные настройки приложения)
   - Найдите поле **App Domains**
   - Добавьте домены (без протокола и пути):
     ```
     wroclaw-8f1bd.firebaseapp.com
     wroclaw-8f1bd.web.app
     localhost
     ```
   - Нажмите **Save Changes**
   
   **Шаг 2.3: Проверить режим приложения**
   - В **Settings** → **Basic** проверьте режим приложения
   - Если приложение в режиме **Development**:
     - Добавьте себя как тестового пользователя в **Roles** → **Test Users**
     - Или переключите приложение в **Production** (если готово к публикации)
   
   **Важно:**
   - Формат URI: `https://DOMAIN/__/auth/handler` (два подчеркивания перед `/auth/handler`)
   - После добавления URI подождите 1-2 минуты (Facebook может кэшировать настройки)
   - Если ошибка сохраняется, попробуйте очистить кэш браузера и перезагрузить страницу

3. **Получить App ID и App Secret:**
   - В настройках приложения найдите **App ID** и **App Secret**
   - Скопируйте их

4. **Настроить в Firebase Console:**
   - В Firebase Console → **Authentication** → **Sign-in method**
   - Включите **Facebook**
   - Вставьте **App ID** и **App Secret** из Facebook Developers
   - **ВАЖНО:** Убедитесь, что App ID и App Secret скопированы правильно (без пробелов)
   - Сохраните

5. **Если ошибка "invalid redirect URI" сохраняется:**
   
   **Вариант A: Попробуйте добавить URI без протокола**
   - В Facebook Developers → **Facebook Login** → **Settings** → **Valid OAuth Redirect URIs**
   - Попробуйте добавить без `https://`:
     ```
     wroclaw-8f1bd.firebaseapp.com/__/auth/handler
     wroclaw-8f1bd.web.app/__/auth/handler
     localhost:8000/__/auth/handler
     ```
   
   **Вариант B: Проверьте формат в Firebase Console**
   - Откройте Firebase Console → **Authentication** → **Sign-in method** → **Facebook**
   - В разделе "Authorized domains" должен быть указан `wroclaw-8f1bd.firebaseapp.com`
   - Если его нет, добавьте вручную в **Authentication** → **Settings** → **Authorized domains**
   
   **Вариант C: Используйте Site URL**
   - В Facebook Developers → **Settings** → **Basic**
   - Найдите поле **Site URL**
   - Добавьте: `https://wroclaw-8f1bd.firebaseapp.com`
   - Сохраните
   
   **Вариант D: Проверьте Client OAuth Login**
   - В Facebook Developers → **Facebook Login** → **Settings**
   - Убедитесь, что включен **Client OAuth Login** (должна быть галочка)
   - Убедитесь, что включен **Web OAuth Login** (должна быть галочка)

**Важно:**
- App Secret должен быть скрыт (не коммитьте в репозиторий)
- Для production используйте production App ID/Secret
- Для локальной разработки можно использовать тестовый App ID

### Настройка авторизованных доменов для OAuth

⚠️ **КРИТИЧНО для локальной разработки:**

Для работы OAuth (Google/Facebook) на локальных IP-адресах нужно добавить домены в список авторизованных:

1. В Firebase Console перейдите в **Authentication** → **Settings** (⚙️)
2. Прокрутите вниз до раздела **Authorized domains**
3. Нажмите **Add domain**
4. Добавьте следующие домены (для локальной разработки):
   - `192.168.100.20:8000` (ваш локальный IP и порт)
   - `localhost` (уже должен быть по умолчанию)
   - `127.0.0.1` (если используете)
   - Любые другие локальные IP, которые используете для разработки

**Важно:**
- Для production добавьте ваш реальный домен (например, `yourdomain.com`)
- Firebase автоматически добавляет `localhost` и ваш `authDomain` из конфигурации
- Локальные IP-адреса нужно добавлять вручную

## Шаг 3: Создание Firestore Database

1. В Firebase Console перейдите в раздел **Firestore Database**
2. Нажмите "Create database"
3. Выберите режим:
   - **Production mode** (для production)
   - **Test mode** (для разработки, менее безопасно)
4. Выберите регион (например, `europe-west`)
5. Нажмите "Enable"

## Шаг 4: Настройка правил безопасности Firestore

Перейдите в раздел **Firestore Database** → **Rules** и установите следующие правила:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Пользователи могут читать и писать только свои данные
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Админы могут читать все данные (опционально)
    // Для этого нужно добавить проверку на admin claim
    match /users/{userId} {
      allow read: if request.auth != null && 
        (request.auth.uid == userId || 
         request.auth.token.admin == true);
    }
  }
}
```

## Шаг 5: Получение конфигурации

1. В Firebase Console перейдите в **Project Settings** (⚙️)
2. Прокрутите вниз до раздела **Your apps**
3. Нажмите на иконку **Web** (`</>`)
4. Введите название приложения (например, "Wroclaw Quest Web")
5. Скопируйте конфигурацию

## Шаг 6: Обновление firebase_config.js

Откройте файл `firebase_config.js` и замените значения:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",                    // ← Замените
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",  // ← Замените
    projectId: "YOUR_PROJECT_ID",             // ← Замените
    storageBucket: "YOUR_PROJECT_ID.appspot.com",   // ← Замените
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",  // ← Замените
    appId: "YOUR_APP_ID"                       // ← Замените
};
```

## Шаг 7: Проверка работы

1. Откройте приложение в браузере
2. Откройте консоль разработчика (F12)
3. Должно появиться сообщение: `✅ Firebase инициализирован`
4. Должно появиться сообщение: `✅ Анонимный пользователь создан`

## Как это работает

### Анонимная аутентификация
- При первом посещении сайта автоматически создается анонимный пользователь
- Пользователь может сразу начать проходить квест
- Прогресс сохраняется в Firestore

### Привязка email (Link Account)
- Пользователь может привязать email к своему анонимному аккаунту
- После привязки аккаунт становится постоянным
- Прогресс сохраняется и доступен с любого устройства

### Админ-панель
- Откройте админ-панель: `Ctrl+Shift+A` (или `Cmd+Shift+A` на Mac)
- Или добавьте `?admin=true` в URL
- Просматривайте всех пользователей, экспортируйте данные, управляйте аккаунтами

## Безопасность

⚠️ **ВАЖНО:** 
- Не коммитьте `firebase_config.js` с реальными credentials в публичный репозиторий
- Используйте `.gitignore` для исключения файла или используйте переменные окружения
- Настройте правила Firestore для production
- Ограничьте доступ к админ-панели (можно добавить проверку на admin claim)

## Troubleshooting

### Ошибка: "Firebase не загружен"
- Убедитесь, что Firebase SDK скрипты подключены в HTML перед `firebase_config.js`
- Проверьте консоль браузера на наличие ошибок загрузки скриптов

### Ошибка: "Permission denied" в Firestore
- Проверьте правила безопасности Firestore

### Ошибка: "This domain is not authorized for OAuth operations"
- **Проблема:** Домен не добавлен в список авторизованных доменов Firebase
- **Решение:**
  1. Откройте Firebase Console → **Authentication** → **Settings** (⚙️)
  2. Прокрутите до раздела **Authorized domains**
  3. Нажмите **Add domain**
  4. Добавьте ваш домен/IP (например, `192.168.100.20:8000` для локальной разработки)
  5. Сохраните изменения
  6. Обновите страницу в браузере и попробуйте снова

**Для локальной разработки:**
- Добавьте все IP-адреса, которые используете (например, `192.168.1.100:8000`, `192.168.100.20:8000`)
- Можно использовать `localhost` или `127.0.0.1` (если не добавлены автоматически)

**Для production:**
- Добавьте ваш реальный домен (например, `yourdomain.com`, `www.yourdomain.com`)
- Убедитесь, что пользователь авторизован (`request.auth != null`)

### Анонимный пользователь не создается
- Проверьте, что Anonymous Auth включен в Firebase Console
- Проверьте консоль браузера на наличие ошибок

## Дополнительные ресурсы

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Auth Documentation](https://firebase.google.com/docs/auth)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)

