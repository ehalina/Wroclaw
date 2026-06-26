(function () {
    'use strict';

    function open(options = {}) {
        const openQuestBtn = options.triggerButton || document.getElementById('open-quest');
        const bookOverlay = document.querySelector(Common.COMMON_ELEMENTS.BOOK_OVERLAY);
        const bookContainer = bookOverlay.querySelector('.book-container');
        const bookTitle = bookOverlay.querySelector('.book-title');
        const bookSound = document.getElementById('bookSound');
        const container = document.querySelector(Common.COMMON_ELEMENTS.IMAGE_CONTAINER);
        const questTasksList = bookOverlay.querySelector('.quest-tasks');
        const bookImageContentWrapper = bookOverlay.querySelector('.book-image-content-wrapper');
        const bookContentArea = bookOverlay.querySelector('.book-content-area');

        if (!bookOverlay || !bookContainer || !bookTitle || !bookSound || !container || !questTasksList || !bookImageContentWrapper || !bookContentArea) {
            return;
        }

        // Очищаем список перед заполнением
        questTasksList.innerHTML = '';

        // Определяем номер и изображение активного квеста на странице (если есть)
        const activeQuestMark = document.querySelector('.map-mark[data-quest-number]');
        const loadQuestState = () => { try { const raw = JSON.parse(sessionStorage.getItem('questState') || '{}'); if (!raw.tasks) raw.tasks = {}; return raw; } catch (_) { return { tasks: {} }; } };
        const questState = loadQuestState();
        // Берем номер из активной метки, иначе fallback к последнему подготовленному или 1
        const currentQuestNumber = activeQuestMark ? parseInt(activeQuestMark.getAttribute('data-quest-number')) : (questState.__lastPreparedNumber || 1);
        const currentQuestImage = activeQuestMark ? activeQuestMark.getAttribute('data-quest-image') : '';

        // Загрузка состояния квестов из sessionStorage
        const isPrepared = !!(questState && questState.tasks && (questState.tasks[currentQuestNumber] === true || (questState.tasks[currentQuestNumber] && questState.tasks[currentQuestNumber].prepared)));
        const preparedImage = questState && questState.tasks && questState.tasks[currentQuestNumber] && questState.tasks[currentQuestNumber].image;

        // Удаляем предыдущее изображение tumski.jpeg, если оно есть
        const existingTitleImages = bookContentArea.querySelectorAll('img[src="media/watercolor/tumski.jpeg"]');
        existingTitleImages.forEach(img => img.remove());

        // Показываем модальное окно и сбрасываем прокрутку
        bookOverlay.style.display = 'flex';

        // Отключаем language-menu при открытии модалки
        if (window.LanguageMenu && typeof window.LanguageMenu.disableMenu === 'function') {
            window.LanguageMenu.disableMenu();
        }

        // Сбрасываем прокрутку контента к началу после того, как окно стало видимым
        setTimeout(() => {
            bookImageContentWrapper.scrollTop = 0;
            bookContentArea.scrollTop = 0;
        }, 0);

        // Воспроизводим звук книги только если звук включен
        if (bookSound && window.isSoundEnabled && window.isSoundEnabled()) {
            bookSound.currentTime = 0;
            bookSound.play().catch(/* console.log */);
        }

        // Заполняем список заданий
        for (let i = 1; i <= 13; i++) {
            const listItem = document.createElement('li');

            // Чекбоксы (обычный и яркий) с учетом состояния
            const checkboxContainer = document.createElement('div');
            checkboxContainer.style.display = 'inline-block';
            checkboxContainer.style.position = 'relative';
            checkboxContainer.style.width = '20px';
            checkboxContainer.style.height = '20px';
            checkboxContainer.style.marginRight = '10px';
            checkboxContainer.style.verticalAlign = 'middle';

            const checkboxImg = document.createElement('img');
            checkboxImg.src = 'media/checkbox0.png';
            checkboxImg.alt = 'Checkbox';
            checkboxImg.style.position = i === currentQuestNumber ? 'absolute' : 'relative';
            checkboxImg.style.width = '100%';
            checkboxImg.style.height = '100%';

            // Состояние подготовленности для конкретного пункта
            const isPreparedItemCheckbox = !!(questState && questState.tasks && (questState.tasks[i] === true || (questState.tasks[i] && questState.tasks[i].prepared)));

            // Всегда показываем яркую галочку для подготовленных пунктов
            if (isPreparedItemCheckbox || (i === currentQuestNumber && isPrepared)) {
                const brightCheckbox = document.createElement('img');
                brightCheckbox.src = 'media/checkbox1.png';
                brightCheckbox.alt = 'Bright Checkbox';
                brightCheckbox.style.position = 'relative';
                brightCheckbox.style.width = '100%';
                brightCheckbox.style.height = '100%';
                brightCheckbox.style.opacity = '1';
                brightCheckbox.dataset.brightCheckbox = 'true';
                checkboxContainer.appendChild(checkboxImg);
                checkboxContainer.appendChild(brightCheckbox);
                checkboxImg.style.opacity = '0';
            } else {
                checkboxContainer.appendChild(checkboxImg);
            }

            listItem.appendChild(checkboxContainer);

            // Текст задания с учетом состояния
            const taskTextSpan = document.createElement('span');
            taskTextSpan.textContent = window.i18n ? window.i18n.t(`quest.task${i}`) : `Задание ${i}`;
            if ((i === currentQuestNumber && isPrepared) || (questState && questState.tasks && questState.tasks[i])) {
                taskTextSpan.style.color = '#8B4513';
                taskTextSpan.style.fontWeight = 'bold';
            }
            listItem.appendChild(taskTextSpan);

            questTasksList.appendChild(listItem);

            // Определяем состояние подготовленности пункта
            const baseSrc = `media/watercolor/${i}.jpg`;
            const preparedImageItem = questState && questState.tasks && questState.tasks[i] && questState.tasks[i].image;
            const isPreparedItem = !!(questState && questState.tasks && (questState.tasks[i] === true || (questState.tasks[i] && questState.tasks[i].prepared)));
            const chosenImage = isPreparedItem ? (preparedImageItem || baseSrc) : baseSrc;

            // Рандомный угол для изображения
            const randomAngle = (Math.random() * 10 - 5).toFixed(1);

            // Если пункт уже подготовлен - сразу создаем flip-карточку, иначе обычное изображение
            if (!isPreparedItem) {
                // Обычное изображение для неподготовленных пунктов
                const taskImage = document.createElement('img');
                taskImage.src = chosenImage;
                taskImage.alt = `Задание ${i}`;
                taskImage.classList.add('task-image');
                taskImage.style.width = '100%';
                taskImage.style.maxWidth = '400px';
                taskImage.style.marginTop = '20px';
                taskImage.style.marginBottom = '20px';
                taskImage.style.display = 'block';
                taskImage.style.marginLeft = 'auto';
                taskImage.style.marginRight = 'auto';
                taskImage.style.transform = `rotate(${randomAngle}deg)`;
                taskImage.style.boxShadow = '5px 5px 10px rgba(0,0,0,0.5)';
                taskImage.style.padding = '8px';
                taskImage.style.background = '#fff';
                taskImage.style.transition = 'all 0.3s ease';
                taskImage.style.cursor = 'pointer';
                taskImage.dataset.originalAngle = randomAngle;
                taskImage.onmouseover = function() {
                    this.style.transform = 'rotate(0deg) scale(1.02)';
                    this.style.boxShadow = '8px 8px 15px rgba(0,0,0,0.6)';
                };
                taskImage.onmouseout = function() {
                    this.style.transform = `rotate(${this.dataset.originalAngle}deg)`;
                    this.style.boxShadow = '5px 5px 10px rgba(0,0,0,0.5)';
                };
                questTasksList.appendChild(taskImage);
            }

            // Если это подготовленный пункт — сразу создаем кнопки и flip-карточку
            if (isPreparedItem) {
                // Кнопки звука и переворота рядом с текстом
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

                // Вставляем кнопки после текста пункта
                listItem.appendChild(localSoundButton);
                listItem.appendChild(flipButton);

                // Создаем flip-карточку сразу
                const questImageSrc = chosenImage;

                // Создаем временное изображение для получения пропорций (fallback к квадрату)
                const tempImg = document.createElement('img');
                tempImg.src = questImageSrc;
                const buildFlip = (naturalW, naturalH) => {
                    const aspectRatio = naturalW > 0 ? (naturalH / naturalW) : 1;

                    const flipScene = document.createElement('div');
                    flipScene.style.position = 'relative';
                    flipScene.style.width = '100%';
                    flipScene.style.maxWidth = '400px';
                    flipScene.style.marginTop = '20px';
                    flipScene.style.marginBottom = '20px';
                    flipScene.style.marginLeft = 'auto';
                    flipScene.style.marginRight = 'auto';
                    flipScene.style.perspective = '1000px';
                    flipScene.style.transform = `rotate(${randomAngle}deg)`;
                    flipScene.style.boxShadow = '5px 5px 10px rgba(0,0,0,0.5)';
                    flipScene.style.transition = 'all 0.3s ease';
                    flipScene.dataset.originalAngle = randomAngle;
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
                    frontImg.src = questImageSrc;
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

                    // Если пункт 1 уже активирован — добавляем подпись "Ожидание" на лицевую сторону
                    if (i === 1 && isPreparedItem) {
                        const expectationText = document.createElement('div');
                        expectationText.textContent = (window.i18n ? window.i18n.t('quest.expectation') : 'Ожидание');
                        expectationText.style.position = 'absolute';
                        expectationText.style.bottom = '8px';
                        expectationText.style.left = '50%';
                        expectationText.style.transform = 'translateX(-50%)';
                        expectationText.style.color = '#e8dba3';
                        expectationText.style.fontSize = '30px';
                        expectationText.style.fontFamily = '"Marck Script", cursive, serif';
                        expectationText.style.fontWeight = 'normal';
                        expectationText.style.zIndex = '2';
                        front.appendChild(expectationText);
                    }

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
                    backImg.src = (i === 1) ? 'media/watercolor/lev.jpg' : 'media/watercolor/oldcard.jpg';
                    backImg.alt = 'Открытка (оборот)';
                    backImg.style.position = 'absolute';
                    backImg.style.top = '0';
                    backImg.style.left = '0';
                    backImg.style.width = '100%';
                    backImg.style.height = '100%';
                    backImg.style.display = 'block';
                    backImg.style.boxSizing = 'border-box';

                    // Для lev.jpg добавляем белые поля, как у lev_02.jpg
                    if (i === 1) {
                        backImg.style.objectFit = 'contain';
                        backImg.style.padding = '8px';
                        backImg.style.background = '#fff';
                        backImg.style.borderRadius = '5px';
                    } else {
                        backImg.style.objectFit = 'fill';
                        backImg.style.padding = '0';
                        backImg.style.background = 'transparent';
                        backImg.style.borderRadius = '0';
                    }
                    back.appendChild(backImg);

                    // Добавим сверху текст (quest.back) поверх оборота
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

                    // Если пункт 1 уже активирован — добавляем подпись "Реальность" на оборот
                    if (i === 1 && isPreparedItem) {
                        const realityText = document.createElement('div');
                        realityText.textContent = (window.i18n ? window.i18n.t('quest.reality') : 'Реальность');
                        realityText.style.position = 'absolute';
                        realityText.style.bottom = '8px';
                        realityText.style.left = '50%';
                        realityText.style.transform = 'translateX(-50%)';
                        realityText.style.color = '#e8dba3';
                        realityText.style.fontSize = '30px';
                        realityText.style.fontFamily = '"Marck Script", cursive, serif';
                        realityText.style.fontWeight = 'normal';
                        realityText.style.zIndex = '2';
                        back.appendChild(realityText);
                    }

                    // Функция подгонки размера текста
                    const fitBackText = () => {
                        const minPx = 8;
                        const maxPx = 24;
                        let best = minPx;
                        const padding = 20; // увеличиваем отступы

                        // Ждем, пока элементы получат размеры
                        if (!back.clientHeight || !back.clientWidth) {
                            setTimeout(fitBackText, 50);
                            return;
                        }

                        const availableHeight = Math.max(0, back.clientHeight - padding);
                        const availableWidth = Math.max(0, back.clientWidth - padding);

                        // Бинарный поиск оптимального размера шрифта
                        let low = minPx;
                        let high = maxPx;

                        while (low <= high) {
                            const mid = Math.floor((low + high) / 2);
                            backText.style.fontSize = mid + 'px';

                            // Принудительно пересчитываем layout
                            backText.offsetHeight;

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

                    flipCard.appendChild(front);
                    flipCard.appendChild(back);

                    // Добавляем flip-сцену в список задач
                    // Гарантируем кликабельность всей сцены
                    flipScene.style.pointerEvents = 'auto';
                    flipScene.style.cursor = 'pointer';
                    frontImg.style.pointerEvents = 'auto';
                    backImg.style.pointerEvents = 'auto';

                    flipScene.appendChild(ratioBox);
                    ratioBox.appendChild(flipCard);
                    questTasksList.appendChild(flipScene);

                    // Запускаем подгонку размера текста после вставки в DOM
                    setTimeout(() => {
                        fitBackText();
                        // Подгон после загрузки изображения оборота
                        if (backImg.complete) {
                            fitBackText();
                        } else {
                            backImg.addEventListener('load', () => {
                                setTimeout(fitBackText, 50);
                            });
                        }
                    }, 100);

                    // Звук и обработчики
                    const questSound = new Audio('media/zwyki/quest.mp3');
                    questSound.volume = 0.4;

                    // Регистрируем quest звук в менеджере видимости
                    if (window.visibilityAudioManager) {
                        window.visibilityAudioManager.registerAudio(questSound);
                    }
                    const flipSound = new Audio('media/opening-a-book.wav');
                    const isGloballyMuted = () => {
                        const mainSoundButton = document.querySelector('.sound-menu-button');
                        return mainSoundButton ? mainSoundButton.classList.contains('muted') : false;
                    };
                    localSoundButton.addEventListener('click', () => {
                        if (questSound.paused) {
                            questSound.play();
                            soundIcon.style.opacity = '1';
                        } else {
                            questSound.pause();
                            soundIcon.style.opacity = '0.6';
                        }
                    });
                    let flipped = false;
                    const doFlip = () => {
                        flipped = !flipped;
                        flipCard.style.transform = flipped ? 'rotateY(180deg)' : 'rotateY(0deg)';
                        if (!isGloballyMuted()) { flipSound.currentTime = 0; flipSound.play(); }
                    };
                    flipCard.addEventListener('click', doFlip);
                    // Дополнительно реагируем на клик по всей сцене и по картинкам
                    flipScene.addEventListener('click', doFlip);
                    frontImg.addEventListener('click', (e) => { e.stopPropagation(); doFlip(); });
                    backImg.addEventListener('click', (e) => { e.stopPropagation(); doFlip(); });
                    flipButton.addEventListener('click', doFlip);
                };
                if (tempImg.complete) {
                    buildFlip(tempImg.naturalWidth, tempImg.naturalHeight);
                } else {
                    tempImg.onload = () => buildFlip(tempImg.naturalWidth, tempImg.naturalHeight);
                    tempImg.onerror = () => buildFlip(0, 0);
                    // Fallback: если событие не пришло, строим квадрат
                    setTimeout(() => { if (!tempImg.complete) buildFlip(0, 0); }, 500);
                }
            }
        }

        // Устанавливаем текст заголовка из локализации
        bookTitle.textContent = window.i18n ? window.i18n.t('quest.title1') : "Квест 1: Найди все тайны Тумского острова";
        bookTitle.style.display = 'block';
        // Добавляем кнопку очистки квеста рядом с заголовком
        (function ensureResetButton() {
            const parent = bookTitle.parentNode;
            if (!parent) return;
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
            resetBtn.title = (window.i18n ? window.i18n.t('quest.clearTooltip') : '') || 'Очистить результаты квеста';
            resetBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const confirmText = window.i18n ? window.i18n.t('quest.clearConfirm') : 'Вы точно хотите очистить результаты квеста?';
                const confirmed = await window.showQuestConfirmDialog(confirmText);
                if (confirmed) {
                try { sessionStorage.removeItem('questState'); } catch (_) {}
                // Перерисовать модалку без закрытия и без анимаций/звуков
                try {
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
                    window.__quest_suppress_effects = true;
                    openQuestBtn.click();
                    setTimeout(() => { window.__quest_suppress_effects = false; }, 0);
                } catch (_) {}
                }
            });

            parent.replaceChild(titleWrapper, bookTitle);
            titleWrapper.appendChild(bookTitle);
            titleWrapper.appendChild(resetBtn);
        })();

        // Добавляем вводный текст
        renderQuestIntro(bookContentArea, questTasksList);

        // Добавляем картинку под заголовком, но перед вводным текстом
        const titleImage = document.createElement('img');
        titleImage.src = 'media/watercolor/tumski.jpeg';
        titleImage.alt = 'Тумский остров';
        titleImage.style.width = '100%';
        titleImage.style.maxWidth = '500px';
        titleImage.style.margin = '20px auto';
        titleImage.style.display = 'block';
        titleImage.style.borderRadius = '8px';
        titleImage.style.boxShadow = '3px 3px 8px rgba(0,0,0,0.3)';

        // Вставляем картинку после заголовка, но перед вводным текстом
        const questIntro = bookContentArea.querySelector('.quest-intro');
        if (questIntro) {
            bookContentArea.insertBefore(titleImage, questIntro);
        } else {
            bookContentArea.appendChild(titleImage);
        }

        // Для мобильной версии меняем порядок: сначала картинка, потом заголовок
        if (window.innerWidth <= 768) {
            // Перемещаем заголовок после картинки
            const bookTitle = bookContentArea.querySelector('.book-title');
            if (bookTitle && titleImage) {
                titleImage.parentNode.insertBefore(bookTitle, titleImage.nextSibling);
            }
        }

        // Открываем модальное окно
        bookOverlay.style.display = 'flex';

        // Отключаем language-menu при открытии модалки
        if (window.LanguageMenu && typeof window.LanguageMenu.disableMenu === 'function') {
            window.LanguageMenu.disableMenu();
        }

        // Принудительное применение мобильных стилей
        if (window.innerWidth <= 768) {
            setTimeout(() => {
                const bookContainer = bookOverlay.querySelector('.book-container');
                const bookImageWrapper = bookOverlay.querySelector('.book-image-content-wrapper');
                const bookContentArea = bookOverlay.querySelector('.book-content-area');
                const bookTitle = bookOverlay.querySelector('.book-title');
                const questTasks = bookOverlay.querySelector('.quest-tasks');

                if (bookContainer) {
                    bookContainer.style.width = '100vw';
                    bookContainer.style.height = '100vh';
                    bookContainer.style.flexDirection = 'column';
                    bookContainer.style.alignItems = 'center';
                    bookContainer.style.justifyContent = 'center';
                }

                if (bookImageWrapper) {
                    bookImageWrapper.style.width = '100%';
                    bookImageWrapper.style.height = '100vh';
                    bookImageWrapper.style.maxHeight = '100vh';
                    bookImageWrapper.style.flex = 'none';
                    bookImageWrapper.style.position = 'relative';
                    bookImageWrapper.style.display = 'flex';
                    bookImageWrapper.style.flexDirection = 'column';
                    bookImageWrapper.style.alignItems = 'center';
                    bookImageWrapper.style.justifyContent = 'center';
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

                if (questTasks) {
                    questTasks.style.top = window.innerWidth <= 480 ? '35%' : '40%';
                    questTasks.style.left = '50%';
                    questTasks.style.zIndex = '10';
                    questTasks.style.maxWidth = window.innerWidth <= 480 ? '85%' : '80%';
                }
            }, 100);
        }

        // Воспроизведение звука книги только если звук включен
        if (bookSound && window.isSoundEnabled && window.isSoundEnabled()) {
            bookSound.currentTime = 0;
            bookSound.play().catch(/* console.log */);
        }

        // Скрываем элементы книги внутри модалки, которые не нужны для картинки квеста
        const contentImage = bookContainer.querySelector('.content-image');
        const bookText = bookContainer.querySelector('.book-text');
        const scrollIndicator = bookContainer.querySelector('.scroll-indicator');

        if (contentImage) contentImage.style.display = 'none';
        if (bookText) bookText.style.display = 'none';
        if (scrollIndicator) scrollIndicator.style.display = 'none';

        // Запускаем подсветку зон-кнопок только после появления их в DOM
        function tryShowHighlight() {
            const zones = document.querySelectorAll('.right-zones .book-zone');
            if (zones.length > 0 && window.showInitialHighlight) {
                window.showInitialHighlight();
            } else {
                setTimeout(tryShowHighlight, 50);
            }
        }
        tryShowHighlight();
    }

    function renderQuestIntro(bookContentArea, questTasksList) {
        // Удалить старый intro, если есть
        const oldIntro = bookContentArea.querySelector('.quest-intro');
        if (oldIntro) oldIntro.remove();

        const introText = document.createElement('div');
        introText.className = 'quest-intro';
        introText.style.fontFamily = "'Roboto', sans-serif";
        introText.style.fontSize = "clamp(14px, 2vw, 18px)";
        introText.style.lineHeight = "1.6";
        introText.style.color = "#333";
        introText.style.margin = "20px 0";
        introText.style.padding = "0 40px";
        introText.style.textAlign = "justify";
        introText.style.fontStyle = "italic";
        const introRaw = window.i18n ? window.i18n.t('quest.intro') : "";
        introText.innerHTML = introRaw.split(/\n\n/).map(par => `<p>${par}</p>`).join('');
        bookContentArea.insertBefore(introText, questTasksList);
    }

    // Функция для показа кастомного диалога подтверждения
    async function showQuestConfirmDialog(message) {
        return new Promise((resolve) => {
            const dialog = document.querySelector('.quest-confirm-dialog');
            const overlay = document.querySelector('.quest-confirm-dialog-overlay');
            const textEl = dialog.querySelector('.dialog-text');
            const yesBtn = dialog.querySelector('.confirm-yes');
            const noBtn = dialog.querySelector('.confirm-no');

            // Устанавливаем текст
            textEl.textContent = message;
            yesBtn.textContent = window.i18n ? window.i18n.t('quest.clearConfirmYes') : 'Да';
            noBtn.textContent = window.i18n ? window.i18n.t('quest.clearConfirmNo') : 'Нет';

            // Показываем диалог
            overlay.style.display = 'block';
            dialog.style.display = 'block';

            // Воспроизводим звук открытия книги только если звук включен
            const bookSound = document.getElementById('bookSound');
            if (bookSound && window.isSoundEnabled && window.isSoundEnabled()) {
                bookSound.currentTime = 0;
                bookSound.play().catch(/* console.log */);
            }

            // Обработчики кнопок
            const handleYes = () => {
                cleanup();
                resolve(true);
            };

            const handleNo = () => {
                cleanup();
                resolve(false);
            };

            const handleOverlayClick = (e) => {
                if (e.target === overlay) {
                    cleanup();
                    resolve(false);
                }
            };

            // Функция очистки
            const cleanup = () => {
                dialog.style.display = 'none';
                overlay.style.display = 'none';
                yesBtn.removeEventListener('click', handleYes);
                noBtn.removeEventListener('click', handleNo);
                overlay.removeEventListener('click', handleOverlayClick);
            };

            // Добавляем обработчики
            yesBtn.addEventListener('click', handleYes);
            noBtn.addEventListener('click', handleNo);
            overlay.addEventListener('click', handleOverlayClick);
        });
    }

    // Делаем функцию глобально доступной
    window.showQuestConfirmDialog = showQuestConfirmDialog;

    window.QuestOverlay = {
        open,
        renderQuestIntro,
        showQuestConfirmDialog
    };
    window.renderQuestIntro = renderQuestIntro;
    window.showQuestConfirmDialog = showQuestConfirmDialog;
}());
