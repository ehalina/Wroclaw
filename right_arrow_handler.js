/**
 * Проверяет, включен ли звук
 * @returns {boolean} true если звук включен, false если выключен
 */
function isSoundEnabled() {
    const soundMuted = localStorage.getItem('soundMuted');
    // По умолчанию звук включен (если значение не установлено или 'false')
    return soundMuted !== 'true';
}

function setupRightArrowHandler(cursor, cursorArea, stepSound) {
    cursorArea.addEventListener('mousemove', function(e) {
        cursor.style.display = 'block';
        cursor.style.left = e.clientX - 32 + 'px';
        cursor.style.top = e.clientY - 32 + 'px';
    });

    cursorArea.addEventListener('mouseleave', function() {
        cursor.style.display = 'none';
    });

    cursorArea.addEventListener('click', function() {
        hideAllCursors();
        if (stepSound && isSoundEnabled()) {
            stepSound.currentTime = 0;
            stepSound.play();
        }
        setTimeout(() => {
            window.location.href = 'tumski_02.html';
        }, 300);
    });
} 