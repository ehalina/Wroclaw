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
            padding: '10px 20px',
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
            background: 'none',
            border: 'none',
            padding: '10px',
            zIndex: 1002
        }
    },
    languageButton: {
        style: {
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0',
            position: 'relative'
        },
        iconStyle: {
            width: '32px',
            height: '32px',
            filter: 'drop-shadow(2px 2px 2px rgba(0, 0, 0, 0.5))',
            transition: 'transform 0.2s ease'
        },
        hoverStyle: {
            transform: 'scale(1.1)'
        }
    },
    languageDropdown: {
        style: {
            position: 'absolute',
            top: '100%',
            right: '0',
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '8px',
            padding: '8px 0',
            marginTop: '8px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
            display: 'none',
            flexDirection: 'column',
            minWidth: '100px'
        },
        optionStyle: {
            padding: '8px 16px',
            cursor: 'pointer',
            transition: 'background 0.2s ease',
            textAlign: 'center',
            color: '#333',
            textDecoration: 'none'
        },
        optionHoverStyle: {
            background: 'rgba(0, 0, 0, 0.1)'
        },
        optionActiveStyle: {
            fontWeight: 'bold',
            background: 'rgba(0, 0, 0, 0.05)'
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
    });

    // Применяем стили к кнопке переключения языка
    const languageButton = document.querySelector('.language-button');
    if (languageButton) {
        Object.assign(languageButton.style, COMMON_BUTTON_STYLES.languageButton.style);
        const languageIcon = languageButton.querySelector('.language-icon');
        if (languageIcon) {
            Object.assign(languageIcon.style, COMMON_BUTTON_STYLES.languageButton.iconStyle);
            languageButton.addEventListener('mouseenter', () => {
                Object.assign(languageIcon.style, COMMON_BUTTON_STYLES.languageButton.hoverStyle);
            });
            languageButton.addEventListener('mouseleave', () => {
                Object.assign(languageIcon.style, COMMON_BUTTON_STYLES.languageButton.iconStyle);
            });
        }
    }

    // Применяем стили к выпадающему меню языка
    const languageDropdown = document.querySelector('.language-dropdown');
    if (languageDropdown) {
        Object.assign(languageDropdown.style, COMMON_BUTTON_STYLES.languageDropdown.style);
        const languageOptions = languageDropdown.querySelectorAll('.language-option');
        languageOptions.forEach(option => {
            Object.assign(option.style, COMMON_BUTTON_STYLES.languageDropdown.optionStyle);
            option.addEventListener('mouseenter', () => {
                Object.assign(option.style, COMMON_BUTTON_STYLES.languageDropdown.optionHoverStyle);
            });
            option.addEventListener('mouseleave', () => {
                Object.assign(option.style, COMMON_BUTTON_STYLES.languageDropdown.optionStyle);
            });
        });
    }
}

// Экспортируем конфигурацию и функцию
window.CommonButtonStyles = COMMON_BUTTON_STYLES;
window.applyCommonButtonStyles = applyCommonButtonStyles; 