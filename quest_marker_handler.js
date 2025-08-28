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
        const suppressEffects = !!window.__quest_suppress_effects;
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

        // Состояние квеста в сессии (сохранение готовности для повторных открытий)
        const loadQuestState = () => {
            try {
                const raw = JSON.parse(sessionStorage.getItem('questState') || '{}');
                if (!raw.tasks) {
                    raw.tasks = {};
                }
                return raw;
            } catch (_) { return { tasks: {} }; }
        };
        const saveQuestState = (state) => {
            try { sessionStorage.setItem('questState', JSON.stringify(state)); } catch (_) {}
        };
        const questState = loadQuestState();
        const tasksPrepared = questState.tasks || {};
        const isPrepared = !!tasksPrepared[questNumber];

        // Очищаем список перед заполнением
        questTasksList.innerHTML = '';

        // Единая длительность плавного проявления (в мс)
        const revealDurationMs = 5000;

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
            // Для текущего квеста и уже анимированных пунктов checkbox0 должен быть absolute (чтобы быть под checkbox1)
            // Для неактивных пунктов - relative
            const shouldBeAbsolute = i === questNumber || tasksPrepared[i];
            checkboxImg.style.position = shouldBeAbsolute ? 'absolute' : 'relative';
            

            checkboxImg.style.width = '100%';
            checkboxImg.style.height = '100%';
            checkboxImg.style.transition = `opacity ${revealDurationMs}ms ease-in-out`;
            

            
            if (i === questNumber || tasksPrepared[i]) {
                const brightCheckbox = document.createElement('img');
                brightCheckbox.src = 'media/checkbox1.png';
                brightCheckbox.alt = 'Bright Checkbox';
                brightCheckbox.style.position = 'relative';
                brightCheckbox.style.width = '100%';
                brightCheckbox.style.height = '100%';
                const isThisPrepared = i === questNumber ? isPrepared : !!tasksPrepared[i];
                brightCheckbox.style.opacity = isThisPrepared ? '1' : (i === questNumber ? '0' : '0');
                brightCheckbox.style.transition = isThisPrepared || i !== questNumber ? 'none' : `opacity ${revealDurationMs}ms ease-in-out`;
                brightCheckbox.dataset.brightCheckbox = 'true';
                
                checkboxContainer.appendChild(checkboxImg);
                checkboxContainer.appendChild(brightCheckbox);
                if (isThisPrepared) {
                    checkboxImg.style.opacity = '0';
                    checkboxImg.style.transition = 'none';
                }
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
            taskTextSpan.style.transition = `opacity ${revealDurationMs}ms ease-in-out`;

            if (i === questNumber) {
                // Если подавляем эффекты (очистка) и пункт не подготовлен — показываем чёрный текст без анимации
                if (suppressEffects && !isPrepared) {
                    taskTextContainer.appendChild(taskTextSpan);
                } else {
                    // Нормальный сценарий: прячем чёрный текст и анимируем коричневый
                    taskTextSpan.style.display = 'none';
                    const brightTextSpan = document.createElement('span');
                    brightTextSpan.textContent = window.i18n ? window.i18n.t(`quest.task${i}`) : `Задание ${i}`;
                    brightTextSpan.style.position = 'relative';
                    brightTextSpan.style.fontWeight = 'bold';
                    brightTextSpan.style.color = isPrepared ? '#8B4513' : '#000';
                    brightTextSpan.style.opacity = isPrepared ? '1' : '0';
                    brightTextSpan.style.transition = isPrepared ? 'none' : `opacity ${revealDurationMs}ms ease-in-out`;
                    brightTextSpan.dataset.brightText = 'true';
                    taskTextContainer.appendChild(taskTextSpan);
                    taskTextContainer.appendChild(brightTextSpan);
                }
            } else {
                taskTextContainer.appendChild(taskTextSpan);
                if (tasksPrepared[i]) {
                    taskTextSpan.style.color = '#8B4513';
                    taskTextSpan.style.fontWeight = 'bold';

                    // Показываем кнопки звука и переворота рядом с названием для уже подготовленных пунктов
                    const localSoundButton = document.createElement('button');
                    localSoundButton.className = 'quest-sound-button';
                    localSoundButton.style.opacity = '1';
                    localSoundButton.style.transition = 'opacity 0.5s ease, transform 120ms ease';
                    localSoundButton.style.background = 'none';
                    localSoundButton.style.border = 'none';
                    localSoundButton.style.cursor = 'pointer';
                    localSoundButton.style.padding = '0';
                    localSoundButton.style.marginLeft = '12px';
                    localSoundButton.style.display = 'inline-flex';
                    localSoundButton.style.verticalAlign = 'middle';
                    const soundIcon = document.createElement('img');
                    soundIcon.src = 'media/sound.jpg';
                    soundIcon.alt = 'Звук';
                    soundIcon.style.width = '28px';
                    soundIcon.style.height = '28px';
                    soundIcon.style.objectFit = 'contain';
                    soundIcon.style.filter = 'sepia(0.6) saturate(0.9) hue-rotate(330deg)';
                    localSoundButton.appendChild(soundIcon);

                    const flipButton = document.createElement('button');
                    flipButton.className = 'quest-flip-button';
                    flipButton.style.opacity = '1';
                    flipButton.style.transition = 'opacity 0.5s ease, transform 120ms ease';
                    flipButton.style.background = 'none';
                    flipButton.style.border = 'none';
                    flipButton.style.cursor = 'pointer';
                    flipButton.style.padding = '0';
                    flipButton.style.marginLeft = '8px';
                    flipButton.style.display = 'inline-flex';
                    flipButton.style.verticalAlign = 'middle';
                    const flipIcon = document.createElement('img');
                    flipIcon.src = 'media/revers.jpg';
                    flipIcon.alt = 'Перевернуть';
                    flipIcon.style.width = '28px';
                    flipIcon.style.height = '28px';
                    flipIcon.style.objectFit = 'contain';
                    flipIcon.style.filter = 'sepia(0.6) saturate(0.9) hue-rotate(330deg)';
                    flipButton.appendChild(flipIcon);

                    taskTextContainer.appendChild(localSoundButton);
                    taskTextContainer.appendChild(flipButton);

                    // Локальная логика звука: независимо от глобального mute
                    localSoundButton.addEventListener('click', () => {
                        if (questSound.paused) {
                            questSound.play();
                            soundIcon.style.opacity = '1';
                            soundIcon.style.filter = 'sepia(0.6) saturate(0.9) hue-rotate(330deg)';
                        } else {
                            questSound.pause();
                            soundIcon.style.opacity = '0.6';
                            soundIcon.style.filter = 'grayscale(0.3) sepia(0.4) saturate(0.6) hue-rotate(330deg)';
                        }
                    });
                    // Сохраняем ссылки на кнопки для дальнейшей привязки к flip-карточке ниже
                    taskTextContainer.dataset.hasPreparedControls = 'true';
                }
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
                img.style.boxSizing = 'border-box';
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
                targetImage.style.opacity = isPrepared ? '1' : '0';
                targetImage.style.filter = isPrepared ? 'blur(0)' : 'blur(8px)';
                targetImage.style.transform = isPrepared ? 'scale(1)' : 'scale(0.985)';
                targetImage.style.transition = isPrepared ? 'none' : `opacity ${revealDurationMs}ms cubic-bezier(0.22, 0.61, 0.36, 1), filter ${revealDurationMs}ms cubic-bezier(0.22, 0.61, 0.36, 1), transform ${revealDurationMs}ms cubic-bezier(0.22, 0.61, 0.36, 1)`;
                // Для уже подготовленного пункта не показываем старую картинку
                if (!isPrepared) {
                    imageContainer.appendChild(baseImage);
                }
                imageContainer.appendChild(targetImage);

                // Сохраняем ссылку на целевое изображение для последующей анимации
                imageContainer.dataset.targetImage = 'true';
            } else {
                // Для уже подготовленных пунктов: показываем цветную картинку и готовим flip-карточку
                if (tasksPrepared[i]) {
                    const preparedInfo = tasksPrepared[i];
                    const preparedSrc = (preparedInfo && preparedInfo.image) ? preparedInfo.image : `media/watercolor/${i}.jpg`;

                    const preparedImg = document.createElement('img');
                    preparedImg.src = preparedSrc;
                    preparedImg.alt = `Задание ${i} (цветное)`;
                    preparedImg.classList.add('task-image');
                    preparedImg.style.width = '100%';
                    preparedImg.style.display = 'block';
                    preparedImg.style.padding = '8px';
                    preparedImg.style.boxSizing = 'border-box';
                    preparedImg.style.background = '#fff';
                    preparedImg.style.borderRadius = '5px';
                    preparedImg.style.position = 'relative';
                    preparedImg.style.opacity = '1';
                    preparedImg.style.filter = 'blur(0)';
                    preparedImg.style.transform = 'scale(1)';

                    // Не добавляем базовую картинку, сразу показываем цветную
                    imageContainer.appendChild(preparedImg);

                    // После вставки заменяем на flip-карточку
                    const buildFlipFrom = () => {
                        const host = preparedImg;
                        const aspectRatio = host.naturalWidth > 0 ? (host.naturalHeight / host.naturalWidth) : 0.66;
                        const flipScene = document.createElement('div');
                        flipScene.style.position = 'relative';
                        flipScene.style.width = '100%';
                        flipScene.style.maxWidth = imageContainer.style.maxWidth || '400px';
                        flipScene.style.marginTop = imageContainer.style.marginTop || '20px';
                        flipScene.style.marginBottom = imageContainer.style.marginBottom || '20px';
                        flipScene.style.marginLeft = imageContainer.style.marginLeft || 'auto';
                        flipScene.style.marginRight = imageContainer.style.marginRight || 'auto';
                        flipScene.style.perspective = '1000px';
                        const originalAngle = imageContainer.dataset.originalAngle || '0';
                        flipScene.style.transform = `rotate(${originalAngle}deg)`;
                        flipScene.style.boxShadow = imageContainer.style.boxShadow || '5px 5px 10px rgba(0,0,0,0.5)';
                        flipScene.style.transition = 'all 0.3s ease';
                        flipScene.dataset.originalAngle = originalAngle;
                        flipScene.addEventListener('mouseover', function() {
                            this.style.transform = 'rotate(0deg) scale(1.02)';
                            this.style.boxShadow = '8px 8px 15px rgba(0,0,0,0.6)';
                        });
                        flipScene.addEventListener('mouseout', function() {
                            this.style.transform = `rotate(${this.dataset.originalAngle}deg)`;
                            this.style.boxShadow = '5px 5px 10px rgba(0,0,0,0.5)';
                        });

                        const ratioBox = document.createElement('div');
                        ratioBox.style.position = 'relative';
                        ratioBox.style.width = '100%';
                        ratioBox.style.paddingTop = (aspectRatio * 100) + '%';

                        const flipCard = document.createElement('div');
                        flipCard.style.position = 'absolute';
                        flipCard.style.top = '0';
                        flipCard.style.left = '0';
                        flipCard.style.right = '0';
                        flipCard.style.bottom = '0';
                        flipCard.style.transformStyle = 'preserve-3d';
                        flipCard.style.transition = 'transform 0.8s ease';
                        flipCard.style.cursor = 'pointer';

                        const front = document.createElement('div');
                        front.style.position = 'absolute';
                        front.style.top = '0';
                        front.style.left = '0';
                        front.style.right = '0';
                        front.style.bottom = '0';
                        front.style.backfaceVisibility = 'hidden';
                        const frontImg = document.createElement('img');
                        frontImg.src = preparedSrc;
                        frontImg.alt = 'Открытка (лицевая сторона)';
                        frontImg.style.width = '100%';
                        frontImg.style.height = '100%';
                        frontImg.style.objectFit = 'contain';
                        frontImg.style.display = 'block';
                        frontImg.style.padding = '8px';
                        frontImg.style.boxSizing = 'border-box';
                        frontImg.style.background = '#fff';
                        frontImg.style.borderRadius = '5px';
                        front.appendChild(frontImg);

                        const back = document.createElement('div');
                        back.style.position = 'absolute';
                        back.style.top = '0';
                        back.style.left = '0';
                        back.style.right = '0';
                        back.style.bottom = '0';
                        back.style.transform = 'rotateY(180deg)';
                        back.style.backfaceVisibility = 'hidden';
                        back.style.overflow = 'hidden';
                        const backImg = document.createElement('img');
                        backImg.src = (markerId === 'mysterious_lion_quest' || questNumber === 1 || (questImage && questImage.indexOf('lev') !== -1)) ? 'media/watercolor/lev.jpg' : 'media/watercolor/oldcard.jpg';
                        backImg.alt = 'Открытка (оборот)';
                        backImg.style.position = 'absolute';
                        backImg.style.top = '0';
                        backImg.style.left = '0';
                        backImg.style.width = '100%';
                        backImg.style.height = '100%';
                        backImg.style.objectFit = 'fill';
                        backImg.style.display = 'block';
                        backImg.style.padding = '0';
                        backImg.style.boxSizing = 'border-box';
                        backImg.style.background = 'transparent';
                        backImg.style.borderRadius = '0';

                        const backCard = document.createElement('div');
                        backCard.style.position = 'absolute';
                        backCard.style.top = '0';
                        backCard.style.left = '0';
                        backCard.style.right = '0';
                        backCard.style.zIndex = '2';
                        backCard.style.width = '100%';
                        backCard.style.display = 'flex';
                        backCard.style.flexDirection = 'column';
                        backCard.style.alignItems = 'center';
                        backCard.style.justifyContent = 'flex-start';
                        backCard.style.background = 'transparent';
                        backCard.style.border = 'none';
                        backCard.style.borderRadius = '0';
                        backCard.style.boxShadow = 'none';
                        backCard.style.padding = '8px';
                        backCard.style.boxSizing = 'border-box';
                        backCard.style.fontFamily = 'serif';
                        backCard.style.color = '#5b4636';
                        backCard.style.textAlign = 'center';
                        backCard.style.pointerEvents = 'none';
                        const backText = document.createElement('div');
                        backText.textContent = (window.i18n ? window.i18n.t(`quest.back${i}`) : '') || `Задание ${i}: подробности и заметки.`;
                        backText.style.lineHeight = '1.4';
                        backText.style.fontSize = '20px';
                        backText.style.fontFamily = '"Marck Script", cursive, serif';
                        backText.style.fontWeight = 'normal';
                        backText.style.whiteSpace = 'normal';
                        backText.style.wordBreak = 'break-word';
                        backText.style.hyphens = 'auto';
                        backText.style.maxWidth = '92%';
                        backText.style.margin = '8px auto 0';
                        back.appendChild(backImg);
                        back.appendChild(backCard);
                        backCard.appendChild(backText);

                        flipCard.appendChild(front);
                        flipCard.appendChild(back);

                        // Заменяем контейнер картинок на flip-сцену
                        const parentForCard = imageContainer.parentNode;
                        if (parentForCard) {
                            parentForCard.replaceChild(flipScene, imageContainer);
                            // Гарантируем кликабельность всей сцены
                            flipScene.style.pointerEvents = 'auto';
                            flipScene.style.cursor = 'pointer';
                            frontImg.style.pointerEvents = 'auto';
                            backImg.style.pointerEvents = 'auto';
                            flipScene.appendChild(ratioBox);
                            ratioBox.appendChild(flipCard);
                        }

                        // Звуки
                        const flipSound = new Audio('media/opening-a-book.wav');
                        let flipped = false;
                        const doFlip = () => {
                            flipped = !flipped;
                            flipCard.style.transform = flipped ? 'rotateY(180deg)' : 'rotateY(0deg)';
                            const mainSoundButton = document.querySelector('.sound-menu-button');
                            const isGloballyMuted = mainSoundButton ? mainSoundButton.classList.contains('muted') : false;
                            if (!isGloballyMuted) {
                                flipSound.currentTime = 0;
                                flipSound.play();
                            }
                        };
                        flipCard.addEventListener('click', doFlip);
                        // Переворот по клику в любой точке сцены и по самим изображениям
                        flipScene.addEventListener('click', doFlip);
                        frontImg.addEventListener('click', (e) => { e.stopPropagation(); doFlip(); });
                        backImg.addEventListener('click', (e) => { e.stopPropagation(); doFlip(); });

                        // Найдем кнопки рядом с текстом (если мы их уже создали) и привяжем к flip
                        const possibleContainer = taskTextContainer;
                        if (possibleContainer && possibleContainer.dataset.hasPreparedControls === 'true') {
                            const soundBtn = possibleContainer.querySelector('.quest-sound-button');
                            const flipBtn = possibleContainer.querySelector('.quest-flip-button');
                            if (flipBtn) {
                                flipBtn.addEventListener('click', doFlip);
                            }
                        }
                    };
                    if (preparedImg.complete) buildFlipFrom(); else preparedImg.addEventListener('load', buildFlipFrom);
                } else {
                    imageContainer.appendChild(baseImage);
                }
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

        // Добавляем кнопку очистки квеста рядом с заголовком
        (function ensureResetButton() {
            const parent = bookTitle.parentNode;
            if (!parent) return;
            // Упаковываем заголовок и кнопку в общий контейнер
            const titleWrapper = document.createElement('div');
            titleWrapper.className = 'book-title-container';
            titleWrapper.style.display = 'flex';
            titleWrapper.style.alignItems = 'center';
            titleWrapper.style.justifyContent = 'center';
            titleWrapper.style.gap = '0';

            const existingReset = parent.querySelector('.quest-reset-button');
            if (existingReset) existingReset.remove();
            const resetBtn = document.createElement('button');
            resetBtn.className = 'quest-reset-button';
            resetBtn.textContent = (window.i18n ? window.i18n.t('quest.clearButton') : '') || 'Очистить квест';
            resetBtn.style.background = 'url("media/clear.jpg") center/contain no-repeat';
            resetBtn.style.width = '64px';
            resetBtn.style.height = '64px';
            resetBtn.style.fontSize = '0';
            resetBtn.style.border = 'none';
            resetBtn.style.borderRadius = '6px';
            resetBtn.style.padding = '6px 10px';
            resetBtn.style.cursor = 'pointer';
            resetBtn.style.fontFamily = 'serif';
            resetBtn.style.color = '#5b4636';
            resetBtn.style.boxShadow = 'inset 0 0 0 2px rgba(0,0,0,0.05)';
            resetBtn.style.transition = 'none';
            resetBtn.style.transitionDelay = '0s';
            resetBtn.title = (window.i18n ? window.i18n.t('quest.clearTooltip') : '') || 'Очистить результаты квеста';
            resetBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const confirmText = window.i18n ? window.i18n.t('quest.clearConfirm') : 'Вы точно хотите очистить результаты квеста?';
                const confirmed = await window.showQuestConfirmDialog(confirmText);
                if (confirmed) {
                    try { sessionStorage.removeItem('questState'); } catch (_) {}
                    // Перерисовываем содержимое без закрытия модалки и без анимаций/звуков
                    if (questTasksList) {
                        // Находим текущий активный пункт перед очисткой
                        const activeItem = questTasksList.querySelector('li[data-target-item="true"]');
                        if (activeItem) {
                            // Ищем коричневый текст и его чёрный сосед до перерисовки
                            const brightText = activeItem.querySelector('span[data-bright-text="true"]');
                            const normalText = brightText ? brightText.previousElementSibling : activeItem.querySelector('span');
                            if (normalText) {
                                normalText.style.display = '';
                                normalText.style.position = 'relative';
                                normalText.style.opacity = '1';
                            }
                            if (brightText) brightText.remove();
                        }
                    }
                    window.__quest_suppress_effects = true;
                    openQuest().finally(() => { window.__quest_suppress_effects = false; });
                }
            });

            parent.replaceChild(titleWrapper, bookTitle);
            titleWrapper.appendChild(bookTitle);
            titleWrapper.appendChild(resetBtn);
        })();

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
        if (!isSoundMuted && !suppressEffects) {
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
        if (suppressEffects) {
            // Не запускаем прокрутку и анимации при тихом сбросе
        } else setTimeout(() => {
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
                            targetImage.style.filter = 'blur(0)';
                            targetImage.style.transform = 'scale(1)';
                            
                            // Находим целевой пункт списка и запускаем анимацию текста и галочки
                            const targetListItem = questTasksList.querySelector('li[data-target-item="true"]');
                            if (targetListItem) {
                                // Анимируем галочку
                                const brightCheckbox = targetListItem.querySelector('img[data-bright-checkbox="true"]');
                                if (brightCheckbox) {
                                    if (!isPrepared) brightCheckbox.style.opacity = '1';
                                    // Плавно скрываем старую галочку
                                    const oldCheckbox = brightCheckbox.previousElementSibling;
                                    if (oldCheckbox) {
                                        if (!isPrepared) oldCheckbox.style.opacity = '0';
                                    }
                                }
                                
                                // Анимируем текст
                                const brightText = targetListItem.querySelector('span[data-bright-text="true"]');
                                if (brightText) {
                                    const text = brightText.textContent;
                                    brightText.textContent = ''; // Очищаем текст
                                    brightText.style.opacity = '1';
                                    
                                    if (!isPrepared) {
                                        // Проявляем только коричневые буквы по одной
                                    [...text].forEach((char, index) => {
                                        const span = document.createElement('span');
                                        span.textContent = char;
                                            span.style.color = '#8B4513';
                                        span.style.opacity = '0';
                                        span.style.transition = 'opacity 0.3s ease';
                                        brightText.appendChild(span);
                                        setTimeout(() => {
                                            span.style.opacity = '1';
                                        }, 100 * index);
                                    });
                                    } else {
                                        const span = document.createElement('span');
                                        span.textContent = text;
                                        span.style.color = '#8B4513';
                                        brightText.appendChild(span);
                                    }

                                    // Создаем кнопку звука рядом с заголовком целевого пункта
                                    const localSoundButton = document.createElement('button');
                                    localSoundButton.className = 'quest-sound-button';
                                    localSoundButton.style.opacity = '0';
                                    localSoundButton.style.transition = 'opacity 0.5s ease, transform 120ms ease';
                                    localSoundButton.style.background = 'none';
                                    localSoundButton.style.border = 'none';
                                    localSoundButton.style.cursor = 'pointer';
                                    localSoundButton.style.padding = '0';
                                    localSoundButton.style.marginLeft = '12px';
                                    localSoundButton.style.display = 'flex';
                                    localSoundButton.style.alignItems = 'center';

                                    // Иконка звука (ретро)
                                    const soundIcon = document.createElement('img');
                                    soundIcon.src = 'media/sound.jpg';
                                    soundIcon.alt = 'Звук';
                                    soundIcon.style.width = '28px';
                                    soundIcon.style.height = '28px';
                                    soundIcon.style.display = 'block';
                                    soundIcon.style.objectFit = 'contain';
                                    soundIcon.style.filter = 'sepia(0.6) saturate(0.9) hue-rotate(330deg)';
                                    localSoundButton.appendChild(soundIcon);

                                    // Кнопка переворота рядом со звуком
                                    const flipButton = document.createElement('button');
                                    flipButton.className = 'quest-flip-button';
                                    flipButton.style.opacity = '0';
                                    flipButton.style.transition = 'opacity 0.5s ease, transform 120ms ease';
                                    flipButton.style.background = 'none';
                                    flipButton.style.border = 'none';
                                    flipButton.style.cursor = 'pointer';
                                    flipButton.style.padding = '0';
                                    flipButton.style.marginLeft = '8px';
                                    flipButton.style.display = 'flex';
                                    flipButton.style.alignItems = 'center';

                                    // Иконка переворота (ретро)
                                    const flipIcon = document.createElement('img');
                                    flipIcon.src = 'media/revers.jpg';
                                    flipIcon.alt = 'Перевернуть';
                                    flipIcon.style.width = '28px';
                                    flipIcon.style.height = '28px';
                                    flipIcon.style.display = 'block';
                                    flipIcon.style.objectFit = 'contain';
                                    flipIcon.style.filter = 'sepia(0.6) saturate(0.9) hue-rotate(330deg)';
                                    flipButton.appendChild(flipIcon);

                                    // Создаем контейнер для заголовка и кнопок в одну линию
                                    const titleButtonsContainer = document.createElement('div');
                                    titleButtonsContainer.style.display = 'flex';
                                    titleButtonsContainer.style.alignItems = 'center';
                                    titleButtonsContainer.style.gap = '8px';
                                    
                                    // Перемещаем brightText в контейнер
                                    if (brightText.parentElement) {
                                        const parent = brightText.parentElement;
                                        titleButtonsContainer.appendChild(brightText);
                                        titleButtonsContainer.appendChild(localSoundButton);
                                        titleButtonsContainer.appendChild(flipButton);
                                        parent.appendChild(titleButtonsContainer);
                                    }

                                    // Показываем кнопки после окончания анимации букв или сразу если уже подготовлено
                                    const buttonsDelay = isPrepared ? 0 : Math.max(0, text.length * 100 - 100);
                                    setTimeout(() => {
                                        localSoundButton.style.opacity = '1';
                                        flipButton.style.opacity = '1';
                                    }, buttonsDelay);

                                    // Обработчик клика по кнопке звука
                                    localSoundButton.addEventListener('click', () => {
                                        // Игнорируем глобальные настройки звука - кнопка всегда работает
                                        if (questSound.paused) {
                                            questSound.play();
                                            // активный вид
                                            soundIcon.style.opacity = '1';
                                            soundIcon.style.filter = 'sepia(0.6) saturate(0.9) hue-rotate(330deg)';
                                        } else {
                                            questSound.pause();
                                            // «приглушённый» вид
                                            soundIcon.style.opacity = '0.6';
                                            soundIcon.style.filter = 'grayscale(0.3) sepia(0.4) saturate(0.6) hue-rotate(330deg)';
                                        }
                                    });

                                    // Подготовка эффекта переворота открытки после проявления картинки и текста
                                    const flipHost = targetContainer; // используем контейнер целевого изображения
                                    if (flipHost && !flipHost.dataset.flipPrepared) {
                                        flipHost.dataset.flipPrepared = 'true';

                                        const totalRevealDelayMs = isPrepared ? 0 : Math.max(800, text.length * 100 + 500);

                                        setTimeout(() => {
                                            // Создаем обертку для 3D-переворота
                                            const flipScene = document.createElement('div');
                                            flipScene.style.position = 'relative';
                                            // Сохраняем адаптивную ширину как у исходного контейнера
                                            // Вычисляем соотношение сторон по натуральным размерам целевого изображения
                        const targetImgEl = targetContainer.querySelector('img:last-child');
                        const naturalW = targetImgEl && targetImgEl.naturalWidth ? targetImgEl.naturalWidth : 0;
                        const naturalH = targetImgEl && targetImgEl.naturalHeight ? targetImgEl.naturalHeight : 0;
                        const aspectRatio = naturalW > 0 ? (naturalH / naturalW) : 1;
                                            flipScene.style.width = '100%';
                                            flipScene.style.maxWidth = flipHost.style.maxWidth || '';
                                            flipScene.style.margin = flipHost.style.margin || '20px auto';
                                            flipScene.style.perspective = '1000px';

                                            // Восстанавливаем визуальные эффекты (тот же наклон, тени, hover)
                                            const originalAngle = flipHost.dataset.originalAngle || '0';
                                            flipScene.style.transform = `rotate(${originalAngle}deg)`;
                                            flipScene.style.boxShadow = '5px 5px 10px rgba(0,0,0,0.5)';
                                            flipScene.style.transition = 'all 0.3s ease';
                                            flipScene.dataset.originalAngle = originalAngle;
                                            flipScene.addEventListener('mouseover', function() {
                                                this.style.transform = 'rotate(0deg) scale(1.02)';
                                                this.style.boxShadow = '8px 8px 15px rgba(0,0,0,0.6)';
                                            });
                                            flipScene.addEventListener('mouseout', function() {
                                                this.style.transform = `rotate(${this.dataset.originalAngle}deg)`;
                                                this.style.boxShadow = '5px 5px 10px rgba(0,0,0,0.5)';
                                            });

                                            // Внутренняя обертка с сохранением соотношения сторон
                                            const ratioBox = document.createElement('div');
                                            ratioBox.style.position = 'relative';
                                            ratioBox.style.width = '100%';
                                            ratioBox.style.paddingTop = (aspectRatio * 100) + '%';

                                            const flipCard = document.createElement('div');
                                            flipCard.style.position = 'absolute';
                                            flipCard.style.top = '0';
                                            flipCard.style.left = '0';
                                            flipCard.style.right = '0';
                                            flipCard.style.bottom = '0';
                                            flipCard.style.transformStyle = 'preserve-3d';
                                            flipCard.style.transition = 'transform 0.8s ease';
                                            flipCard.style.cursor = 'pointer';

                                            // Лицевая сторона (используем уже проявленное цветное изображение)
                                            const front = document.createElement('div');
                                            front.style.position = 'absolute';
                                            front.style.top = '0';
                                            front.style.left = '0';
                                            front.style.right = '0';
                                            front.style.bottom = '0';
                                            front.style.backfaceVisibility = 'hidden';

                                            const frontImg = document.createElement('img');
                                            frontImg.src = questImage;
                                            frontImg.alt = targetImage.alt || 'Открытка (лицевая сторона)';
                                            frontImg.style.width = '100%';
                                            frontImg.style.height = '100%';
                                            frontImg.style.objectFit = 'contain';
                                            frontImg.style.display = 'block';
                                            frontImg.style.padding = '8px';
                                            frontImg.style.boxSizing = 'border-box';
                                            frontImg.style.background = '#fff';
                                            frontImg.style.borderRadius = '5px';
                                            front.appendChild(frontImg);

                                            // Обратная сторона (как оборот открытки)
                                            const back = document.createElement('div');
                                            back.style.position = 'absolute';
                                            back.style.top = '0';
                                            back.style.left = '0';
                                            back.style.right = '0';
                                            back.style.bottom = '0';
                                            back.style.transform = 'rotateY(180deg)';
                                            back.style.backfaceVisibility = 'hidden';
                                            back.style.overflow = 'hidden';

        							// Блок текста (старый текст сверху)
                                            const backCard = document.createElement('div');
                                            backCard.style.position = 'absolute';
                                            backCard.style.top = '0';
                                            backCard.style.left = '0';
                                            backCard.style.right = '0';
                                            backCard.style.zIndex = '2';
                                            backCard.style.width = '100%';
                                            backCard.style.display = 'flex';
                                            backCard.style.flexDirection = 'column';
                                            backCard.style.alignItems = 'center';
                                            backCard.style.justifyContent = 'flex-start';
                                            backCard.style.background = 'transparent';
                                            backCard.style.border = 'none';
                                            backCard.style.borderRadius = '0';
                                            backCard.style.boxShadow = 'none';
                                            backCard.style.padding = '8px';
                                            backCard.style.boxSizing = 'border-box';
                                            backCard.style.fontFamily = 'serif';
                                            backCard.style.color = '#5b4636';
                                            backCard.style.textAlign = 'center';
                                            backCard.style.pointerEvents = 'none';

                                            const backText = document.createElement('div');
                                            backText.textContent = (window.i18n ? window.i18n.t(`quest.back${questNumber}`) : '') || `Задание ${questNumber}: подробности и заметки.`;
                                            backText.style.lineHeight = '1.4';
                                            backText.style.fontSize = '20px';
                                            backText.style.fontFamily = '"Marck Script", cursive, serif';
                                            backText.style.fontWeight = 'normal';

                                            backCard.appendChild(backText);
                                            // Картинка oldcard.jpg снизу, без белых полей
                                            const backImg = document.createElement('img');
                                            backImg.alt = 'Открытка (оборот)';
                                            backImg.style.position = 'absolute';
                                            backImg.style.top = '0';
                                            backImg.style.left = '0';
                                            backImg.style.width = '100%';
                                            backImg.style.height = '100%';
                                            backImg.style.objectFit = 'fill';
                                            backImg.style.display = 'block';
                                            backImg.style.padding = '0';
                                            backImg.style.boxSizing = 'border-box';
                                            backImg.style.background = 'transparent';
                                            backImg.style.borderRadius = '0';
                                            backImg.style.zIndex = '1';
                                            backImg.src = (markerId === 'mysterious_lion_quest' || questNumber === 1 || (questImage && questImage.indexOf('lev') !== -1)) ? 'media/watercolor/lev.jpg' : 'media/watercolor/oldcard.jpg';
                                            back.appendChild(backImg);
                                            back.appendChild(backCard);

                                            // Адаптивный текст: всегда вписывается в открытку
                                            backText.style.whiteSpace = 'normal';
                                            backText.style.wordBreak = 'break-word';
                                            backText.style.hyphens = 'auto';
                                            backText.style.maxWidth = '92%';
                                            backText.style.margin = '8px auto 0';

                                            const fitBackText = () => {
                                                const minPx = 10;
                                                const computed = parseFloat(window.getComputedStyle(backText).fontSize) || 20;
                                                const maxPx = Math.max(minPx, Math.round(computed));
                                                let low = minPx;
                                                let high = maxPx;
                                                let best = minPx;
                                                const padding = 16;
                                                const availableHeight = Math.max(0, back.clientHeight - padding);
                                                const availableWidth = Math.max(0, back.clientWidth - padding);
                                                while (low <= high) {
                                                    const mid = Math.floor((low + high) / 2);
                                                    backText.style.fontSize = mid + 'px';
                                                    const fits = backText.scrollHeight <= availableHeight && backText.scrollWidth <= availableWidth;
                                                    if (fits) {
                                                        best = mid;
                                                        low = mid + 1;
                                                    } else {
                                                        high = mid - 1;
                                                    }
                                                }
                                                backText.style.fontSize = best + 'px';
                                            };
                                            // Инициализация после вставки в DOM
                                            setTimeout(fitBackText, 0);
                                            // Подгон после загрузки изображения оборота
                                            backImg.addEventListener('load', fitBackText);
                                            if (backImg.complete) setTimeout(fitBackText, 0);
                                            if (typeof ResizeObserver !== 'undefined') {
                                                const ro = new ResizeObserver(() => fitBackText());
                                                ro.observe(back);
                                            } else {
                                                window.addEventListener('resize', fitBackText);
                                            }

                                            // Собираем карточку
                                            flipCard.appendChild(front);
                                            flipCard.appendChild(back);
                                            
                                            // Заменяем текущий imageContainer на flip-сцену (сохраняем внешний стиль)
                                            const parentForCard = flipHost.parentNode;
                                            if (parentForCard) {
                                                parentForCard.replaceChild(flipScene, flipHost);
                                                flipScene.appendChild(ratioBox);
                                                ratioBox.appendChild(flipCard);
                                            }

                                            // Звук переворота открытки
                                            const flipSound = new Audio('media/opening-a-book.wav');
                                            const playFlipSound = () => {
                                                const mainSoundButton = document.querySelector('.sound-menu-button');
                                                const isGloballyMuted = mainSoundButton ? mainSoundButton.classList.contains('muted') : false;
                                                if (!isGloballyMuted) {
                                                    flipSound.currentTime = 0;
                                                    flipSound.play();
                                                }
                                            };

                                            // Гарантируем кликабельность всей сцены
                                            flipScene.style.pointerEvents = 'auto';
                                            flipScene.style.cursor = 'pointer';
                                            frontImg.style.pointerEvents = 'auto';
                                            backImg.style.pointerEvents = 'auto';

                                            // Обработчик переворота по клику
                                            let flipped = false;
                                            flipCard.addEventListener('click', () => {
                                                flipped = !flipped;
                                                flipCard.style.transform = flipped ? 'rotateY(180deg)' : 'rotateY(0deg)';
                                                playFlipSound();
                                            });

                                            // Переворот по клику в любой точке сцены и по самим изображениям
                                            flipScene.addEventListener('click', () => {
                                                flipped = !flipped;
                                                flipCard.style.transform = flipped ? 'rotateY(180deg)' : 'rotateY(0deg)';
                                                playFlipSound();
                                            });
                                            frontImg.addEventListener('click', (e) => { e.stopPropagation(); flipped = !flipped; flipCard.style.transform = flipped ? 'rotateY(180deg)' : 'rotateY(0deg)'; playFlipSound(); });
                                            backImg.addEventListener('click', (e) => { e.stopPropagation(); flipped = !flipped; flipCard.style.transform = flipped ? 'rotateY(180deg)' : 'rotateY(0deg)'; playFlipSound(); });

                                            // Клик по кнопке переворота делает то же, что и клик по карточке
                                            flipButton.addEventListener('click', () => {
                                                flipped = !flipped;
                                                flipCard.style.transform = flipped ? 'rotateY(180deg)' : 'rotateY(0deg)';
                                                playFlipSound();
                                            });

                                            // Hover-эффекты для ретро-кнопок
                                            const addRetroHover = (btn, withBorder = true) => {
                                                btn.addEventListener('mouseover', () => {
                                                    btn.style.transform = 'translateY(-1px)';
                                                    if (withBorder) {
                                                        btn.style.boxShadow = '0 2px 6px rgba(0,0,0,0.15), inset 0 0 0 2px rgba(0,0,0,0.05)';
                                                    }
                                                });
                                                btn.addEventListener('mouseout', () => {
                                                    btn.style.transform = 'translateY(0)';
                                                    if (withBorder) {
                                                        btn.style.boxShadow = 'inset 0 0 0 2px rgba(0,0,0,0.05)';
                                                    }
                                                });
                                            };
                                            addRetroHover(localSoundButton, false); // без обводки
                                            addRetroHover(flipButton, true); // с обводкой
                                        }, totalRevealDelayMs);
                                        
                                        // Сохраняем состояние как подготовленное и запоминаем последний подготовленный пункт
                                        const current = loadQuestState();
                                        current.tasks = current.tasks || {};
                                        current.tasks[questNumber] = { prepared: true, image: questImage };
                                        current.__lastPreparedNumber = questNumber;
                                        saveQuestState(current);
                                    }
                                    
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