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
- Убедитесь, что пользователь авторизован (`request.auth != null`)

### Анонимный пользователь не создается
- Проверьте, что Anonymous Auth включен в Firebase Console
- Проверьте консоль браузера на наличие ошибок

## Дополнительные ресурсы

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Auth Documentation](https://firebase.google.com/docs/auth)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)

