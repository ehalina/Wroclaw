// Админ-панель для управления пользователями и данными
// Доступ через специальную комбинацию клавиш или URL параметр

class AdminPanel {
    constructor() {
        this.isVisible = false;
        this.init();
    }

    init() {
        // Проверяем URL параметр для доступа к админ-панели
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('admin') === 'true') {
            this.showPanel();
        }

        // Комбинация клавиш для открытия админ-панели: Ctrl+Shift+A
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'A') {
                e.preventDefault();
                this.togglePanel();
            }
        });
    }

    togglePanel() {
        if (this.isVisible) {
            this.hidePanel();
        } else {
            this.showPanel();
        }
    }

    showPanel() {
        if (this.isVisible) return;
        this.isVisible = true;

        const overlay = document.createElement('div');
        overlay.id = 'admin-panel-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 30000;
            font-family: Arial, sans-serif;
        `;

        const panel = document.createElement('div');
        panel.id = 'admin-panel';
        panel.style.cssText = `
            position: relative;
            max-width: 900px;
            width: 95%;
            max-height: 90vh;
            background: #1a1a1a;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
            overflow-y: auto;
            color: #fff;
        `;

        const header = document.createElement('div');
        header.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 15px;
        `;

        const title = document.createElement('h2');
        title.textContent = '🔐 Админ-панель';
        title.style.cssText = `
            margin: 0;
            color: #4CAF50;
            font-size: 24px;
        `;

        const closeBtn = document.createElement('button');
        closeBtn.textContent = '✕ Закрыть';
        closeBtn.style.cssText = `
            padding: 10px 20px;
            background: #d32f2f;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
        `;
        closeBtn.onclick = () => this.hidePanel();

        header.appendChild(title);
        header.appendChild(closeBtn);

        // Статистика
        const statsSection = document.createElement('div');
        statsSection.id = 'admin-stats';
        statsSection.style.cssText = 'margin-bottom: 30px;';

        // Список пользователей
        const usersSection = document.createElement('div');
        usersSection.id = 'admin-users';
        usersSection.style.cssText = 'margin-bottom: 30px;';

        // Кнопки управления
        const actionsSection = document.createElement('div');
        actionsSection.style.cssText = `
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            margin-bottom: 20px;
            padding-top: 20px;
            border-top: 2px solid #333;
        `;

        const exportBtn = document.createElement('button');
        exportBtn.textContent = '📥 Экспорт данных';
        exportBtn.style.cssText = `
            padding: 12px 24px;
            background: #2196F3;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
        `;
        exportBtn.onclick = () => this.exportData();

        const importBtn = document.createElement('button');
        importBtn.textContent = '📤 Импорт данных';
        importBtn.style.cssText = `
            padding: 12px 24px;
            background: #FF9800;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
        `;
        importBtn.onclick = () => this.importData();

        const clearBtn = document.createElement('button');
        clearBtn.textContent = '🗑️ Очистить все данные';
        clearBtn.style.cssText = `
            padding: 12px 24px;
            background: #d32f2f;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
        `;
        clearBtn.onclick = () => this.clearAllData();

        const refreshBtn = document.createElement('button');
        refreshBtn.textContent = '🔄 Обновить';
        refreshBtn.style.cssText = `
            padding: 12px 24px;
            background: #4CAF50;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
        `;
        refreshBtn.onclick = () => this.loadUsers();

        const syncLeaderboardBtn = document.createElement('button');
        syncLeaderboardBtn.textContent = '📊 Синхронизировать рейтинг';
        syncLeaderboardBtn.style.cssText = `
            padding: 12px 24px;
            background: #9C27B0;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
        `;
        syncLeaderboardBtn.onclick = () => this.syncLeaderboard();

        actionsSection.appendChild(exportBtn);
        actionsSection.appendChild(importBtn);
        actionsSection.appendChild(clearBtn);
        actionsSection.appendChild(refreshBtn);
        actionsSection.appendChild(syncLeaderboardBtn);

        panel.appendChild(header);
        panel.appendChild(statsSection);
        panel.appendChild(usersSection);
        panel.appendChild(actionsSection);

        overlay.appendChild(panel);
        document.body.appendChild(overlay);

        this.loadUsers();
    }

    hidePanel() {
        const overlay = document.getElementById('admin-panel-overlay');
        if (overlay) {
            overlay.remove();
            this.isVisible = false;
        }
    }

    async loadUsers() {
        const statsSection = document.getElementById('admin-stats');
        const usersSection = document.getElementById('admin-users');

        if (!window.userDatabase) {
            statsSection.innerHTML = '<p style="color: #f44336;">База данных не загружена</p>';
            return;
        }

        try {
            // Инициализируем БД если нужно
            await window.userDatabase.init();

            const users = await window.userDatabase.getAllUsers();
            const userIds = Object.keys(users);

            // Статистика
            let totalTasks = 0;
            let completedQuests = 0;
            userIds.forEach(userId => {
                const user = users[userId];
                if (user.questState && user.questState.tasks) {
                    totalTasks += Object.keys(user.questState.tasks).length;
                }
                if (user.questState && user.questState.completedQuests) {
                    completedQuests += user.questState.completedQuests.length;
                }
            });

            statsSection.innerHTML = `
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px;">
                    <div style="background: #2a2a2a; padding: 15px; border-radius: 5px;">
                        <div style="font-size: 12px; color: #aaa; margin-bottom: 5px;">Всего пользователей</div>
                        <div style="font-size: 24px; font-weight: bold; color: #4CAF50;">${userIds.length}</div>
                    </div>
                    <div style="background: #2a2a2a; padding: 15px; border-radius: 5px;">
                        <div style="font-size: 12px; color: #aaa; margin-bottom: 5px;">Выполнено задач</div>
                        <div style="font-size: 24px; font-weight: bold; color: #2196F3;">${totalTasks}</div>
                    </div>
                    <div style="background: #2a2a2a; padding: 15px; border-radius: 5px;">
                        <div style="font-size: 12px; color: #aaa; margin-bottom: 5px;">Завершено квестов</div>
                        <div style="font-size: 24px; font-weight: bold; color: #FF9800;">${completedQuests}</div>
                    </div>
                </div>
            `;

            // Список пользователей
            if (userIds.length === 0) {
                usersSection.innerHTML = '<p style="color: #aaa; text-align: center; padding: 20px;">Пользователи не найдены</p>';
                return;
            }

            const usersTable = document.createElement('table');
            usersTable.style.cssText = `
                width: 100%;
                border-collapse: collapse;
                background: #2a2a2a;
                border-radius: 5px;
                overflow: hidden;
            `;

            const thead = document.createElement('thead');
            thead.innerHTML = `
                <tr style="background: #333;">
                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid #444;">Имя</th>
                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid #444;">ID</th>
                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid #444;">Создан</th>
                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid #444;">Прогресс</th>
                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid #444;">Действия</th>
                </tr>
            `;

            const tbody = document.createElement('tbody');
            
            userIds.forEach(userId => {
                const user = users[userId];
                const completedCount = Object.keys(user.questState?.tasks || {}).length;
                const progress = `${completedCount}/13`;
                const progressPercent = Math.round((completedCount / 13) * 100);

                const row = document.createElement('tr');
                row.style.cssText = 'border-bottom: 1px solid #333;';
                row.innerHTML = `
                    <td style="padding: 12px;">${this.escapeHtml(user.username)}</td>
                    <td style="padding: 12px; font-family: monospace; font-size: 12px; color: #aaa;">${userId.substring(0, 20)}...</td>
                    <td style="padding: 12px; font-size: 12px; color: #aaa;">${new Date(user.createdAt).toLocaleDateString('ru-RU')}</td>
                    <td style="padding: 12px;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div style="flex: 1; background: #333; height: 20px; border-radius: 10px; overflow: hidden;">
                                <div style="background: #4CAF50; height: 100%; width: ${progressPercent}%; transition: width 0.3s;"></div>
                            </div>
                            <span style="font-size: 12px; color: #aaa;">${progress}</span>
                        </div>
                    </td>
                    <td style="padding: 12px;">
                        <button onclick="window.adminPanel.viewUser('${userId}')" style="padding: 6px 12px; background: #2196F3; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 12px; margin-right: 5px;">Просмотр</button>
                        <button onclick="window.adminPanel.deleteUser('${userId}')" style="padding: 6px 12px; background: #d32f2f; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 12px;">Удалить</button>
                    </td>
                `;
                tbody.appendChild(row);
            });

            usersTable.appendChild(thead);
            usersTable.appendChild(tbody);
            usersSection.innerHTML = '';
            usersSection.appendChild(usersTable);

        } catch (error) {
            console.error('Ошибка загрузки пользователей:', error);
            statsSection.innerHTML = `<p style="color: #f44336;">Ошибка: ${error.message}</p>`;
        }
    }

    async viewUser(userId) {
        if (!window.userDatabase) return;

        try {
            const user = await window.userDatabase.getUser(userId);
            if (!user) {
                alert('Пользователь не найден');
                return;
            }

            const modal = document.createElement('div');
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: rgba(0, 0, 0, 0.95);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 31000;
            `;

            const content = document.createElement('div');
            content.style.cssText = `
                background: #1a1a1a;
                padding: 30px;
                border-radius: 10px;
                max-width: 600px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
                color: #fff;
            `;

            const completedTasks = Object.keys(user.questState?.tasks || {});
            const tasksList = completedTasks.map(taskNum => `Задача ${taskNum}`).join(', ') || 'Нет выполненных задач';

            content.innerHTML = `
                <h3 style="color: #4CAF50; margin-top: 0;">Данные пользователя</h3>
                <div style="margin-bottom: 20px;">
                    <strong>Имя:</strong> ${this.escapeHtml(user.username)}<br>
                    <strong>ID:</strong> <code style="background: #2a2a2a; padding: 2px 6px; border-radius: 3px;">${user.id}</code><br>
                    <strong>Создан:</strong> ${new Date(user.createdAt).toLocaleString('ru-RU')}<br>
                    <strong>Обновлен:</strong> ${user.updatedAt ? new Date(user.updatedAt).toLocaleString('ru-RU') : 'Нет данных'}<br>
                </div>
                <div style="margin-bottom: 20px;">
                    <strong>Выполнено задач:</strong> ${completedTasks.length}/13<br>
                    <strong>Завершено квестов:</strong> ${user.questState?.completedQuests?.length || 0}<br>
                    <strong>Список задач:</strong> ${tasksList}
                </div>
                <div style="margin-bottom: 20px;">
                    <strong>Полные данные (JSON):</strong>
                    <pre style="background: #2a2a2a; padding: 15px; border-radius: 5px; overflow-x: auto; font-size: 12px; max-height: 300px; overflow-y: auto;">${JSON.stringify(user, null, 2)}</pre>
                </div>
                <button onclick="this.closest('div[style*=\"position: fixed\"]').remove()" style="padding: 10px 20px; background: #d32f2f; color: white; border: none; border-radius: 5px; cursor: pointer;">Закрыть</button>
            `;

            modal.appendChild(content);
            document.body.appendChild(modal);
        } catch (error) {
            alert('Ошибка загрузки данных пользователя: ' + error.message);
        }
    }

    async deleteUser(userId) {
        if (!confirm('Вы уверены, что хотите удалить этого пользователя?')) {
            return;
        }

        try {
            if (window.userDatabase) {
                await window.userDatabase.deleteUser(userId);
            }
            this.loadUsers();
        } catch (error) {
            alert('Ошибка удаления пользователя: ' + error.message);
        }
    }

    async exportData() {
        if (!window.userDatabase) {
            alert('База данных не загружена');
            return;
        }

        try {
            const users = await window.userDatabase.getAllUsers();
            const exportData = {
                version: '1.0',
                exportDate: new Date().toISOString(),
                users: users,
                metadata: {
                    totalUsers: Object.keys(users).length
                }
            };

            const dataStr = JSON.stringify(exportData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `wroclaw-quest-users-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            URL.revokeObjectURL(url);

            alert(`Экспортировано ${Object.keys(users).length} пользователей`);
        } catch (error) {
            alert('Ошибка экспорта данных: ' + error.message);
        }
    }

    async importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                const text = await file.text();
                const importData = JSON.parse(text);

                if (!importData.users || typeof importData.users !== 'object') {
                    alert('Неверный формат файла');
                    return;
                }

                if (!confirm(`Импортировать ${Object.keys(importData.users).length} пользователей? Существующие данные будут перезаписаны.`)) {
                    return;
                }

                let imported = 0;
                for (const userId in importData.users) {
                    try {
                        const userData = importData.users[userId];
                        // Убеждаемся, что ID сохранен
                        userData.id = userId;
                        await window.userDatabase.saveUser(userData);
                        imported++;
                    } catch (error) {
                        console.error(`Ошибка импорта пользователя ${userId}:`, error);
                    }
                }

                alert(`Импортировано ${imported} пользователей`);
                this.loadUsers();
            } catch (error) {
                alert('Ошибка импорта данных: ' + error.message);
            }
        };
        input.click();
    }

    async clearAllData() {
        if (!confirm('ВНИМАНИЕ! Это удалит ВСЕ данные пользователей. Продолжить?')) {
            return;
        }

        if (!confirm('Вы абсолютно уверены? Это действие нельзя отменить!')) {
            return;
        }

        try {
            if (window.userDatabase) {
                await window.userDatabase.init();
                
                // Получаем всех пользователей и удаляем их
                const users = await window.userDatabase.getAllUsers();
                const deletePromises = Object.keys(users).map(userId => 
                    window.userDatabase.deleteUser(userId).catch(err => {
                        console.error(`Ошибка удаления пользователя ${userId}:`, err);
                    })
                );
                
                await Promise.all(deletePromises);
            }

            alert('Все данные удалены');
            this.loadUsers();
        } catch (error) {
            alert('Ошибка очистки данных: ' + error.message);
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    async syncLeaderboard() {
        if (!window.userDatabase) {
            alert('База данных не загружена');
            return;
        }

        const btn = event?.target;
        if (btn) {
            btn.disabled = true;
            btn.textContent = '⏳ Синхронизация...';
        }

        try {
            await window.userDatabase.init();
            await window.userDatabase.syncAllUsersToLeaderboard();
            alert('✅ Рейтинг синхронизирован! Все пользователи обновлены в leaderboard.');
            if (btn) {
                btn.disabled = false;
                btn.textContent = '📊 Синхронизировать рейтинг';
            }
        } catch (error) {
            console.error('Ошибка синхронизации рейтинга:', error);
            alert('❌ Ошибка синхронизации: ' + (error?.message || String(error)));
            if (btn) {
                btn.disabled = false;
                btn.textContent = '📊 Синхронизировать рейтинг';
            }
        }
    }
}

// Создаем глобальный экземпляр админ-панели
window.adminPanel = new AdminPanel();

