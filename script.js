document.addEventListener('DOMContentLoaded', () => {
    const video = document.querySelector('.background');
    const audio = document.getElementById('citySounds');
    
    audio.volume = 0.3;

    // Функция для воспроизведения звука
    function playAudio() {
        audio.play().catch(error => {
            console.log('Ошибка воспроизведения:', error);
        });
    }

    // Воспроизводим звук при первом взаимодействии пользователя
    document.addEventListener('click', playAudio, { once: true });
    
    // Показываем подсказку пользователю
    const hint = document.createElement('div');
    hint.className = 'audio-hint';
    hint.textContent = 'Кликните в любом месте для воспроизведения звука';
    document.body.appendChild(hint);

    // Убираем подсказку после клика
    document.addEventListener('click', () => {
        hint.style.display = 'none';
    }, { once: true });

    // Добавляем эффект параллакса при движении мыши
    const scene = document.querySelector('.scene');
    let mouseX = 0;
    let mouseY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;

        scene.style.transform = `
            scale(1.1)
            translateX(${mouseX * 20}px)
            translateY(${mouseY * 20}px)
        `;
    });
}); 