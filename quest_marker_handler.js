// Универсальный обработчик для геометок с квестами
export function setupQuestGeoMarker({ markerId, questNumber, questImage }) {
    const marker = document.getElementById(markerId);
    if (!marker) return;

    // Находим родительский элемент map-mark-area и в нем ищем название геометки
    const markArea = marker.closest('.map-mark-area');
    const markerTitle = markArea ? markArea.querySelector('.tumski-text') : null;

    // Добавляем обработчик на значок геометки
    marker.addEventListener('click', openQuest);

    // Добавляем обработчик на название геометки, если оно найдено
    if (markerTitle) {
        markerTitle.style.cursor = 'pointer';
        markerTitle.addEventListener('click', openQuest);
    }

    // Функция обработчик для открытия квеста
    async function openQuest() {
        const bookOverlay = document.querySelector('.book-overlay');
        const bookContainer = bookOverlay.querySelector('.book-container');
        const bookTitle = bookOverlay.querySelector('.book-title');
        const bookSound = document.getElementById('bookSound');
        const questTasksList = bookOverlay.querySelector('.quest-tasks');
        const bookImageContentWrapper = bookOverlay.querySelector('.book-image-content-wrapper');
        const bookContentArea = bookOverlay.querySelector('.book-content-area');

        if (!bookOverlay || !bookContainer || !bookTitle || !bookSound || !questTasksList || !bookImageContentWrapper || !bookContentArea) {
            return;
        }

        // Очищаем список перед заполнением
        questTasksList.innerHTML = '';

        // Заполняем список заданий
        for (let i = 1; i <= 12; i++) {
            const listItem = document.createElement('li');
               
            // Создаем контейнер для галочки
            const checkboxContainer = document.createElement('div');
            checkboxContainer.style.display = 'inline-block';
            checkboxContainer.style.position = 'relative';
            checkboxContainer.style.width = '20px';
            checkboxContainer.style.height = '20px';
            checkboxContainer.style.marginRight = '10px';
            checkboxContainer.style.verticalAlign = 'middle';

            // Создаем обе галочки (обычную и яркую)
            const checkboxImg = document.createElement('img');
            checkboxImg.src = 'media/checkbox0.png';
            checkboxImg.alt = 'Checkbox';
            checkboxImg.style.position = i === questNumber ? 'absolute' : 'relative';
            checkboxImg.style.width = '100%';
            checkboxImg.style.height = '100%';
            checkboxImg.style.transition = 'opacity 3s ease-in';
            
            if (i === questNumber) {
                const brightCheckbox = document.createElement('img');
                brightCheckbox.src = 'media/checkbox1.jpg';
                brightCheckbox.alt = 'Bright Checkbox';
                brightCheckbox.style.position = 'relative';
                brightCheckbox.style.width = '100%';
                brightCheckbox.style.height = '100%';
                brightCheckbox.style.opacity = '0';
                brightCheckbox.style.transition = 'opacity 3s ease-in';
                brightCheckbox.dataset.brightCheckbox = 'true';
                
                checkboxContainer.appendChild(checkboxImg);
                checkboxContainer.appendChild(brightCheckbox);
            } else {
                checkboxContainer.appendChild(checkboxImg);
            }
            
            listItem.appendChild(checkboxContainer);

            // Создаем контейнер для текста
            const taskTextContainer = document.createElement('div');
            taskTextContainer.style.display = 'inline-block';
            taskTextContainer.style.position = 'relative';
            taskTextContainer.style.verticalAlign = 'middle';

            // Создаем оба текста (обычный и жирный)
            const taskTextSpan = document.createElement('span');
            taskTextSpan.textContent = window.i18n ? window.i18n.t(`quest.task${i}`) : `Задание ${i}`;
            taskTextSpan.style.position = i === questNumber ? 'absolute' : 'relative';
            taskTextSpan.style.transition = 'opacity 3s ease-in';
            
            if (i === questNumber) {
                const brightTextSpan = document.createElement('span');
                brightTextSpan.textContent = window.i18n ? window.i18n.t(`quest.task${i}`) : `Задание ${i}`;
                brightTextSpan.style.position = 'relative';
                brightTextSpan.style.fontWeight = 'bold';
                brightTextSpan.style.color = '#000';
                brightTextSpan.style.opacity = '0';
                brightTextSpan.style.transition = 'opacity 3s ease-in';
                brightTextSpan.dataset.brightText = 'true';
                
                taskTextContainer.appendChild(taskTextSpan);
                taskTextContainer.appendChild(brightTextSpan);
            } else {
                taskTextContainer.appendChild(taskTextSpan);
            }
            
            listItem.appendChild(taskTextContainer);
            
            // Если это целевой пункт, сохраняем ссылку для анимации
            if (i === questNumber) {
                listItem.dataset.targetItem = 'true';
            }
            
            questTasksList.appendChild(listItem);

            // Создаем контейнер для изображений
            const imageContainer = document.createElement('div');
            imageContainer.style.position = 'relative';
            imageContainer.style.width = '100%';
            imageContainer.style.maxWidth = '400px';
            imageContainer.style.marginTop = '20px';
            imageContainer.style.marginBottom = '20px';
            imageContainer.style.marginLeft = 'auto';
            imageContainer.style.marginRight = 'auto';

            // Функция для применения общих стилей к изображению
            const applyImageStyles = (img) => {
                img.classList.add('task-image');
                img.style.width = '100%';
                img.style.display = 'block';
                img.style.padding = '8px';
                img.style.background = '#fff';
                img.style.borderRadius = '5px';
            };

            // Создаем базовое изображение
            const baseImage = document.createElement('img');
            baseImage.src = `media/watercolor/${i}.jpg`;
            baseImage.alt = `Задание ${i}`;
            applyImageStyles(baseImage);
            baseImage.style.position = i === questNumber ? 'absolute' : 'relative';
            baseImage.style.top = '0';
            baseImage.style.left = '0';

            // Если это целевой пункт, создаем изображение для анимации
            if (i === questNumber) {
                const targetImage = document.createElement('img');
                targetImage.src = questImage;
                targetImage.alt = `Задание ${i} (цветное)`;
                applyImageStyles(targetImage);
                targetImage.style.position = 'relative';
                targetImage.style.opacity = '0';
                targetImage.style.transition = 'opacity 3s ease-in';

                imageContainer.appendChild(baseImage);
                imageContainer.appendChild(targetImage);

                // Сохраняем ссылку на целевое изображение для последующей анимации
                imageContainer.dataset.targetImage = 'true';
            } else {
                imageContainer.appendChild(baseImage);
            }

            // Применяем стили к контейнеру
            const randomAngle = (Math.random() * 10 - 5).toFixed(1);
            imageContainer.style.transform = `rotate(${randomAngle}deg)`;
            imageContainer.style.boxShadow = '5px 5px 10px rgba(0,0,0,0.5)';
            imageContainer.style.transition = 'all 0.3s ease';
            imageContainer.style.cursor = 'pointer';
            
            // Сохраняем случайный угол
            imageContainer.dataset.originalAngle = randomAngle;
                
            imageContainer.onmouseover = function() {
                this.style.transform = 'rotate(0deg) scale(1.02)';
                this.style.boxShadow = '8px 8px 15px rgba(0,0,0,0.6)';
            };
            imageContainer.onmouseout = function() {
                this.style.transform = `rotate(${this.dataset.originalAngle}deg)`;
                this.style.boxShadow = '5px 5px 10px rgba(0,0,0,0.5)';
            };
                
            questTasksList.appendChild(imageContainer);
        }

        // Если ранее уже оборачивали заголовок, разворачиваем контейнер, чтобы не дублировать элементы
        const existingTitleContainer = bookContentArea.querySelector('.book-title-container');
        if (existingTitleContainer) {
            const existingTitle = existingTitleContainer.querySelector('.book-title');
            if (existingTitle) {
                existingTitleContainer.replaceWith(existingTitle);
            } else {
                existingTitleContainer.remove();
            }
        }

        // Обновляем текст заголовка (без кнопки звука)
        bookTitle.textContent = window.i18n ? window.i18n.t('quest.title1') : "Квест 1: Найди все тайны Тумского острова";
        bookTitle.style.display = 'block';

        // Добавляем вводный текст
        if (typeof renderQuestIntro === 'function') {
            renderQuestIntro(bookContentArea, questTasksList);
        }

        // Удаляем предыдущее изображение tumski.jpeg, если оно есть
        const existingTitleImages = bookContentArea.querySelectorAll('img[src="media/watercolor/tumski.jpeg"]');
        existingTitleImages.forEach(img => img.remove());

        // Добавляем картинку под заголовком
        const titleImage = document.createElement('img');
        titleImage.src = 'media/watercolor/tumski.jpeg';
        titleImage.alt = 'Тумский остров';
        titleImage.style.width = '100%';
        titleImage.style.maxWidth = '500px';
        titleImage.style.margin = '20px auto';
        titleImage.style.display = 'block';
        titleImage.style.borderRadius = '8px';
        titleImage.style.boxShadow = '3px 3px 8px rgba(0,0,0,0.3)';
        
        // Вставляем картинку после заголовка
        const questIntro = bookContentArea.querySelector('.quest-intro');
        if (questIntro) {
            bookContentArea.insertBefore(titleImage, questIntro);
        } else {
            bookContentArea.appendChild(titleImage);
        }

        // Проверяем состояние общего звука на странице
        const mainSoundButton = document.querySelector('.sound-menu-button');
        const isSoundMuted = mainSoundButton ? mainSoundButton.classList.contains('muted') : false;

        // Создаем аудио элемент для звука квеста
        const questSound = new Audio('media/zwyki/quest.mp3');
        questSound.loop = true; // Зацикливаем воспроизведение

        // Открываем модальное окно
        bookOverlay.style.display = 'flex';

        // Сбрасываем прокрутку контента к началу после того, как окно стало видимым
        setTimeout(() => {
            bookImageContentWrapper.scrollTop = 0;
            bookContentArea.scrollTop = 0;
        }, 0);

        // Воспроизводим звуки только если звук не выключен глобально
        if (!isSoundMuted) {
            if (bookSound) bookSound.play();
            questSound.play();
        }

        // Функция для остановки звука
        const stopQuestSound = () => {
            questSound.pause();
            questSound.currentTime = 0;
        };

        // Добавляем обработчик для закрытия модального окна кнопкой
        const closeButton = bookOverlay.querySelector('.close-button');
        if (closeButton) {
            closeButton.addEventListener('click', stopQuestSound);
        }

        // Добавляем обработчик для закрытия по клику вне окна
        bookOverlay.addEventListener('click', (event) => {
            // Проверяем, был ли клик вне контейнера книги
            if (event.target === bookOverlay) {
                stopQuestSound();
            }
        });

        // После открытия окна прокручиваем к нужному пункту и запускаем анимацию
        setTimeout(() => {
            const targetContainer = questTasksList.children[questNumber * 2 - 1]; // Получаем контейнер с изображениями
            if (targetContainer && targetContainer.dataset.targetImage) {
                // Прокручиваем так, чтобы изображение было в центре
                targetContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                //Добавляем дополнительную прокрутку, чтобы показать и текст пункта сверху
                setTimeout(() => {
                    // Запускаем анимацию проявления изображения
                    const targetImage = targetContainer.querySelector('img:last-child');
                    if (targetImage) {
                        // Запускаем все анимации одновременно
                        setTimeout(() => {
                            // Проявляем новое изображение
                            targetImage.style.opacity = '1';
                            
                            // Находим целевой пункт списка и запускаем анимацию текста и галочки
                            const targetListItem = questTasksList.querySelector('li[data-target-item="true"]');
                            if (targetListItem) {
                                // Анимируем галочку
                                const brightCheckbox = targetListItem.querySelector('img[data-bright-checkbox="true"]');
                                if (brightCheckbox) {
                                    brightCheckbox.style.opacity = '1';
                                    // Плавно скрываем старую галочку
                                    const oldCheckbox = brightCheckbox.previousElementSibling;
                                    if (oldCheckbox) {
                                        oldCheckbox.style.opacity = '0';
                                    }
                                }
                                
                                // Анимируем текст
                                const brightText = targetListItem.querySelector('span[data-bright-text="true"]');
                                if (brightText) {
                                    const text = brightText.textContent;
                                    brightText.textContent = ''; // Очищаем текст
                                    brightText.style.opacity = '1';
                                    
                                    // Создаем span для каждой буквы
                                    [...text].forEach((char, index) => {
                                        const span = document.createElement('span');
                                        span.textContent = char;
                                        span.style.color = '#8B4513'; // Коричневый цвет
                                        span.style.opacity = '0';
                                        span.style.transition = 'opacity 0.3s ease';
                                        brightText.appendChild(span);
                                        
                                        // Анимируем каждую букву с задержкой
                                        setTimeout(() => {
                                            span.style.opacity = '1';
                                        }, 100 * index);
                                    });

                                    // Создаем кнопку звука рядом с заголовком целевого пункта
                                    const localSoundButton = document.createElement('button');
                                    localSoundButton.className = 'quest-sound-button';
                                    localSoundButton.innerHTML = '🔊';
                                    localSoundButton.style.opacity = '0';
                                    localSoundButton.style.transition = 'opacity 0.5s ease';
                                    localSoundButton.style.background = 'none';
                                    localSoundButton.style.border = 'none';
                                    localSoundButton.style.fontSize = '20px';
                                    localSoundButton.style.cursor = 'pointer';
                                    localSoundButton.style.padding = '4px';
                                    localSoundButton.style.marginLeft = '8px';

                                    // Вставляем кнопку сразу после brightText
                                    if (brightText.parentElement) {
                                        brightText.parentElement.insertBefore(localSoundButton, brightText.nextSibling);
                                    }

                                    // Показываем кнопку после окончания анимации букв
                                    setTimeout(() => {
                                        localSoundButton.style.opacity = '1';
                                    }, Math.max(0, text.length * 100 - 100));

                                    // Обработчик клика по кнопке звука
                                    localSoundButton.addEventListener('click', () => {
                                        const mainSoundButton = document.querySelector('.sound-menu-button');
                                        const isGloballyMuted = mainSoundButton ? mainSoundButton.classList.contains('muted') : false;
                                        if (isGloballyMuted) return;
                                        if (questSound.paused) {
                                            questSound.play();
                                            localSoundButton.innerHTML = '🔊';
                                        } else {
                                            questSound.pause();
                                            localSoundButton.innerHTML = '🔈';
                                        }
                                    });
                                    
                                    // Плавно скрываем старый текст
                                    const oldText = brightText.previousElementSibling;
                                    if (oldText) {
                                        oldText.style.opacity = '0';
                                    }
                                }
                            }
                        }, 500); // Небольшая задержка перед началом анимации
                    }
                }, 1000);
            }
        }, 1000);

        // Принудительное применение мобильных стилей
        if (window.innerWidth <= 768) {
            setTimeout(() => {
                if (bookContainer) {
                    bookContainer.style.width = '100vw';
                    bookContainer.style.height = '100vh';
                    bookContainer.style.flexDirection = 'column';
                    bookContainer.style.alignItems = 'center';
                    bookContainer.style.justifyContent = 'center';
                }
                
                if (bookImageContentWrapper) {
                    bookImageContentWrapper.style.width = '100%';
                    bookImageContentWrapper.style.height = '100vh';
                    bookImageContentWrapper.style.maxHeight = '100vh';
                    bookImageContentWrapper.style.flex = 'none';
                    bookImageContentWrapper.style.position = 'relative';
                    bookImageContentWrapper.style.display = 'flex';
                    bookImageContentWrapper.style.flexDirection = 'column';
                    bookImageContentWrapper.style.alignItems = 'center';
                    bookImageContentWrapper.style.justifyContent = 'center';
                }
                
                if (bookContentArea) {
                    bookContentArea.style.position = 'absolute';
                    bookContentArea.style.top = '0';
                    bookContentArea.style.left = '0';
                    bookContentArea.style.width = '100%';
                    bookContentArea.style.zIndex = '2';
                    bookContentArea.style.display = 'flex';
                    bookContentArea.style.flexDirection = 'column';
                    bookContentArea.style.alignItems = 'center';
                    bookContentArea.style.justifyContent = 'center';
                }
                
                if (bookTitle) {
                    bookTitle.style.position = 'absolute';
                    bookTitle.style.top = window.innerWidth <= 480 ? '15%' : '20%';
                    bookTitle.style.left = '50%';
                    bookTitle.style.transform = 'translateX(-50%)';
                    bookTitle.style.zIndex = '10';
                    bookTitle.style.marginTop = '40px';
                }
                
                if (questTasksList) {
                    questTasksList.style.top = window.innerWidth <= 480 ? '35%' : '40%';
                    questTasksList.style.left = '50%';
                    questTasksList.style.zIndex = '10';
                    questTasksList.style.maxWidth = window.innerWidth <= 480 ? '85%' : '80%';
                }
            }, 100);
        }
    }
}