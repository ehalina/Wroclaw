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
        stepSound.currentTime = 0;
        stepSound.play();
        setTimeout(() => {
            window.location.href = 'tumski_02.html';
        }, 300);
    });
} 