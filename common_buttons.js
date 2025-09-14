// Общие стили кнопок
const COMMON_BUTTON_STYLES = {
    backLink: {
        style: {
            position: 'fixed',
            top: '20px',
            left: '20px',
            color: 'white',
            textDecoration: 'none',
            fontSize: '16px',
            zIndex: 1000,
            background: 'rgba(0, 0, 0, 0.7)',
            borderRadius: '4px',
            transition: 'background 0.3s ease'
        },
        hoverStyle: {
            background: 'rgba(0, 0, 0, 0.9)'
        }
    },
    closeButton: {
        style: {
            position: 'absolute',
            top: '20px',
            right: '20px',
            color: 'white',
            fontSize: '24px',
            cursor: 'pointer',
            background: 'rgba(0, 0, 0, 0.7)',
            border: '2px solid white',
            borderRadius: '50%',
            padding: '10px',
            zIndex: 1002,
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease'
        },
        hoverStyle: {
            background: 'rgba(0, 0, 0, 0.9)',
            transform: 'scale(1.1)'
        }
    }
};

// Функция для применения стилей к кнопкам
function applyCommonButtonStyles() {
    // Применяем стили к кнопке "Назад"
    const backLink = document.querySelector('.back-link');
    if (backLink) {
        Object.assign(backLink.style, COMMON_BUTTON_STYLES.backLink.style);
        backLink.addEventListener('mouseenter', () => {
            Object.assign(backLink.style, COMMON_BUTTON_STYLES.backLink.hoverStyle);
        });
        backLink.addEventListener('mouseleave', () => {
            Object.assign(backLink.style, COMMON_BUTTON_STYLES.backLink.style);
        });
    }

    // Применяем стили к кнопкам закрытия
    const closeButtons = document.querySelectorAll('.close-button');
    closeButtons.forEach(button => {
        Object.assign(button.style, COMMON_BUTTON_STYLES.closeButton.style);
        
        // Добавляем hover эффекты
        button.addEventListener('mouseenter', () => {
            Object.assign(button.style, COMMON_BUTTON_STYLES.closeButton.hoverStyle);
        });
        button.addEventListener('mouseleave', () => {
            Object.assign(button.style, COMMON_BUTTON_STYLES.closeButton.style);
        });
    });
}

// Экспортируем конфигурацию и функцию
window.CommonButtonStyles = COMMON_BUTTON_STYLES;
window.applyCommonButtonStyles = applyCommonButtonStyles; 