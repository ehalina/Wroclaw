// Конфигурация Firebase
// ВАЖНО: Замените эти значения на ваши реальные credentials из Firebase Console
// Получить можно здесь: https://console.firebase.google.com/
// Project Settings → General → Your apps → Web app

// ВАЖНО:
// Этот проект подключает Firebase через CDN (compat) в `index.html`:
// - firebase-app-compat.js
// - firebase-auth-compat.js
// - firebase-firestore-compat.js
//
// Поэтому тут НЕ должно быть `import ...` (это ломает загрузку как обычного script).
//
// Вставьте сюда ваш firebaseConfig из Firebase Console → Project settings → General → Your apps (Web)
const firebaseConfig = {
  apiKey: "AIzaSyDYDgShZLQdNbkADM832ovF2fCZNJI3tOQ",
  authDomain: "wroclaw-8f1bd.firebaseapp.com",
  projectId: "wroclaw-8f1bd",
  storageBucket: "wroclaw-8f1bd.firebasestorage.app",
  messagingSenderId: "28233557745",
  appId: "1:28233557745:web:eb8a4ec2f2a84e7961eb50",
  measurementId: "G-75RWVQJZGK"
};

// Инициализация Firebase
// Используем compat версию для совместимости
(function() {
    function hasPlaceholders(cfg) {
        if (!cfg || typeof cfg !== 'object') return true;
        return Object.values(cfg).some((v) => typeof v === 'string' && v.includes('YOUR_'));
    }

    function logSetupHint() {
        console.error(
            '❌ Firebase не инициализирован: в `firebase_config.js` стоят плейсхолдеры (YOUR_API_KEY и т.д.).\n' +
            'Откройте Firebase Console → Project Settings → General → Your apps (Web) и вставьте реальную конфигурацию.\n' +
            'Инструкция: откройте файл `FIREBASE_SETUP.md`.'
        );
    }

    // Ждем загрузки Firebase SDK
    function initFirebase() {
        if (hasPlaceholders(firebaseConfig)) {
            window.firebaseInitError = 'Firebase config placeholders detected';
            logSetupHint();
            return;
        }

        if (typeof firebase !== 'undefined' && firebase.initializeApp) {
            try {
                // Не реинициализируем, если уже есть app
                if (firebase.apps && firebase.apps.length) {
                    // already initialized
                } else {
                    firebase.initializeApp(firebaseConfig);
                }
                
                // Инициализируем сервисы
                window.firebaseAuth = firebase.auth();
                window.firebaseFirestore = firebase.firestore();
                
                console.log('✅ Firebase инициализирован');
            } catch (error) {
                window.firebaseInitError = String(error?.message || error);
                console.error('❌ Ошибка инициализации Firebase:', error);
            }
        } else {
            // Повторяем попытку через 100ms
            setTimeout(initFirebase, 100);
        }
    }
    
    // Запускаем инициализацию
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initFirebase);
    } else {
        initFirebase();
    }
})();

