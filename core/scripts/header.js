/**
 * core/scripts/header.js
 * HeaderManager — Основной менеджer header для IP Roast Enterprise 4.0
 * 
 * Зависит от:
 * - window.ThemeManager (конструктор)
 * - window.NotificationSystem (конструктор)
 */
(function () {
    'use strict';

    // Проверяем, не был ли уже загружен HeaderManager
    if (typeof window.HeaderManager !== 'undefined') {
        console.log('⚠️ HeaderManager уже загружен, пропускаем инициализацию');
        return;
    }

    class HeaderManager {
        constructor() {
            // Основные элементы header
            this.elements = {
                header: document.getElementById('main-header'),
                pageTitle: document.getElementById('page-title'),
                breadcrumb: document.getElementById('breadcrumb'),
                notificationsBtn: document.getElementById('notifications-btn'),
                notificationsPopup: document.getElementById('notifications-popup'),
                fullscreenBtn: document.getElementById('fullscreen-btn'),
                userBtn: document.getElementById('user-btn'),
                userMenu: document.getElementById('user-menu'),
                themeToggleBtn: document.getElementById('theme-toggle-btn')
            };

            // Состояние header
            this.state = {
                isFullscreen: false,
                isUserMenuOpen: false
            };

            // Инициализация систем с проверками
            this.initializeSystems();
            this.init();
        }

        /**
         * Безопасная инициализация систем
         */
        initializeSystems() {
            // Проверяем доступность ThemeManager
            if (window.ThemeManager && typeof window.ThemeManager === 'function') {
                try {
                    this.themeManager = new window.ThemeManager();
                    console.log('✅ ThemeManager инициализирован в HeaderManager');
                } catch (error) {
                    console.error('❌ Ошибка создания ThemeManager:', error);
                    this.themeManager = null;
                }
            } else {
                console.warn('⚠️ ThemeManager не найден, создаем заглушку');
                this.themeManager = this.createThemeManagerStub();
            }

            // Проверяем доступность NotificationSystem
            if (window.NotificationSystem && typeof window.NotificationSystem === 'function') {
                try {
                    this.notifications = new window.NotificationSystem();
                    console.log('✅ NotificationSystem инициализирован в HeaderManager');
                } catch (error) {
                    console.error('❌ Ошибка создания NotificationSystem:', error);
                    this.notifications = null;
                }
            } else {
                console.warn('⚠️ NotificationSystem не найден, создаем заглушку');
                this.notifications = this.createNotificationSystemStub();
            }
        }

        /**
         * Заглушка для ThemeManager
         */
        createThemeManagerStub() {
            return {
                toggleTheme: () => {
                    console.warn('⚠️ ThemeManager заглушка: toggleTheme вызван');
                    // Простое переключение темы
                    const root = document.documentElement;
                    const currentTheme = root.getAttribute('data-theme') || 'light';
                    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
                    root.setAttribute('data-theme', newTheme);
                    root.style.colorScheme = newTheme;

                    // Обновляем кнопку
                    const btn = document.getElementById('theme-toggle-btn');
                    if (btn) {
                        btn.textContent = newTheme === 'light' ? '🌙' : '☀️';
                    }
                },
                getCurrentTheme: () => document.documentElement.getAttribute('data-theme') || 'light',
                setTheme: (theme) => {
                    document.documentElement.setAttribute('data-theme', theme);
                    document.documentElement.style.colorScheme = theme;
                }
            };
        }

        /**
         * Заглушка для NotificationSystem
         */
        createNotificationSystemStub() {
            return {
                show: (message, type = 'info') => {
                    console.warn('⚠️ NotificationSystem заглушка:', message, type);
                    // Простое уведомление через alert (временно)
                    if (type === 'error') {
                        alert(`Ошибка: ${message}`);
                    }
                    return Date.now().toString();
                },
                success: (message) => this.show(message, 'success'),
                error: (message) => this.show(message, 'error'),
                warning: (message) => this.show(message, 'warning'),
                info: (message) => this.show(message, 'info'),
                getLast: () => [],
                delete: () => { },
                clear: () => { },
                markAsRead: () => { },
                getUnreadCount: () => 0
            };
        }

        /**
         * Инициализация HeaderManager
         */
        init() {
            console.log('🚀 HeaderManager инициализируется...');

            if (!this.elements.header) {
                console.error('HeaderManager: элемент #main-header не найден');
                return;
            }

            this.setupEventListeners();
            this.setupFullscreen();
            this.updateNotificationBadge();

            console.log('✅ HeaderManager полностью инициализирован');
        }

        /**
         * ИСПРАВЛЕНО: Добавлен метод addNotification для совместимости с IPRoastApp
         */
        addNotification(options) {
            if (!this.notifications) {
                console.warn('⚠️ NotificationSystem недоступен');
                return null;
            }

            const { title, message, type = 'info' } = options;

            // Формируем сообщение с заголовком если есть
            const fullMessage = title ? `${title}: ${message}` : message;

            // Показываем уведомление через NotificationSystem
            return this.notifications.show(fullMessage, type, {
                title: title,
                closable: true,
                duration: type === 'error' ? 8000 : 5000
            });
        }

        /**
         * Обновление заголовка страницы
         */
        updatePageTitle(title) {
            if (this.elements.pageTitle) {
                this.elements.pageTitle.textContent = title;
                console.log(`📄 Заголовок страницы обновлен: ${title}`);
            }
        }

        /**
         * Установка состояния загрузки
         */
        setLoading(isLoading) {
            if (this.elements.header) {
                if (isLoading) {
                    this.elements.header.classList.add('loading');
                } else {
                    this.elements.header.classList.remove('loading');
                }
            }
        }

        /**
         * Настройка обработчиков событий
         */
        setupEventListeners() {
            // Переключение темы
            this.elements.themeToggleBtn?.addEventListener('click', e => {
                e.preventDefault();
                if (this.themeManager) {
                    this.themeManager.toggleTheme();
                }
            });

            // Dropdown уведомлений
            this.elements.notificationsBtn?.addEventListener('click', e => {
                e.preventDefault();
                this.toggleNotificationsPopup();
            });

            // Fullscreen
            this.elements.fullscreenBtn?.addEventListener('click', e => {
                e.preventDefault();
                this.toggleFullscreen();
            });

            // User menu
            this.elements.userBtn?.addEventListener('click', e => {
                e.preventDefault();
                this.toggleUserMenu();
            });

            // Закрытие при клике вне
            document.addEventListener('click', e => this.handleOutsideClick(e));

            // Escape
            document.addEventListener('keydown', e => {
                if (e.key === 'Escape') {
                    this.closeNotificationsPopup();
                    if (this.state.isUserMenuOpen) this.toggleUserMenu();
                }
            });

            console.log('⚡ Обработчики событий header настроены');
        }

        /**
         * Переключение dropdown уведомлений
         */
        toggleNotificationsPopup() {
            const popup = this.elements.notificationsPopup;
            if (!popup || !this.notifications) return;

            const list = this.notifications.getLast(10);
            const itemsHTML = list.length ? list.map(n => `
                <div class="notification-item" data-id="${n.id}">
                    <div class="icon">${this.getNotificationIcon(n.type)}</div>
                    <div class="body">
                        <div class="title">${n.title || 'Уведомление'}</div>
                        <div class="message">${n.message}</div>
                        <div class="time">${this.formatTime(n.timestamp)}</div>
                    </div>
                    <button class="delete-btn" onclick="window.headerManager?.deleteNotification('${n.id}')">&times;</button>
                </div>
            `).join('') : '<div style="padding: 16px; text-align: center; color: #666;">Нет уведомлений</div>';

            popup.innerHTML = `
                ${list.length ? '<button class="clear-all-btn" onclick="window.headerManager?.clearAllNotifications()">Очистить все</button>' : ''}
                ${itemsHTML}
            `;

            popup.classList.toggle('active');
        }

        /**
         * Закрытие popup уведомлений
         */
        closeNotificationsPopup() {
            if (this.elements.notificationsPopup) {
                this.elements.notificationsPopup.classList.remove('active');
            }
        }

        /**
         * Удаление уведомления
         */
        deleteNotification(id) {
            if (this.notifications) {
                this.notifications.delete(id);
                this.updateNotificationBadge();
                this.toggleNotificationsPopup(); // Обновляем popup
            }
        }

        /**
         * Очистка всех уведомлений
         */
        clearAllNotifications() {
            if (this.notifications) {
                this.notifications.clear();
                this.updateNotificationBadge();
                this.closeNotificationsPopup();
            }
        }

        /**
         * Переключение fullscreen режима
         */
        toggleFullscreen() {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().then(() => {
                    this.state.isFullscreen = true;
                    this.updateFullscreenButton();
                }).catch(err => {
                    console.warn('⚠️ Не удалось войти в fullscreen:', err);
                });
            } else {
                document.exitFullscreen().then(() => {
                    this.state.isFullscreen = false;
                    this.updateFullscreenButton();
                }).catch(err => {
                    console.warn('⚠️ Не удалось выйти из fullscreen:', err);
                });
            }
        }

        /**
         * Настройка fullscreen
         */
        setupFullscreen() {
            document.addEventListener('fullscreenchange', () => {
                this.state.isFullscreen = !!document.fullscreenElement;
                this.updateFullscreenButton();
            });
        }

        /**
         * Обновление кнопки fullscreen
         */
        updateFullscreenButton() {
            if (this.elements.fullscreenBtn) {
                const icon = this.state.isFullscreen ? '⛶' : '⛶';
                this.elements.fullscreenBtn.innerHTML = `<span class="btn-icon">${icon}</span>`;
                this.elements.fullscreenBtn.title = this.state.isFullscreen ? 'Выйти из полноэкранного режима' : 'Полноэкранный режим';
            }
        }

        /**
         * Переключение user menu
         */
        toggleUserMenu() {
            this.state.isUserMenuOpen = !this.state.isUserMenuOpen;

            if (this.elements.userBtn) {
                this.elements.userBtn.setAttribute('aria-expanded', this.state.isUserMenuOpen.toString());
            }

            if (this.elements.userMenu) {
                if (this.state.isUserMenuOpen) {
                    this.elements.userMenu.classList.add('active');
                } else {
                    this.elements.userMenu.classList.remove('active');
                }
            }
        }

        /**
         * Обновление бейджа уведомлений
         */
        updateNotificationBadge() {
            if (!this.elements.notificationsBtn || !this.notifications) return;

            const count = this.notifications.getUnreadCount();
            let badge = this.elements.notificationsBtn.querySelector('.notification-badge');

            if (count > 0) {
                if (!badge) {
                    badge = document.createElement('span');
                    badge.className = 'notification-badge';
                    this.elements.notificationsBtn.appendChild(badge);
                }
                badge.textContent = count > 99 ? '99+' : count.toString();
            } else if (badge) {
                badge.remove();
            }
        }

        /**
         * Обработка клика вне элементов
         */
        handleOutsideClick(e) {
            // Закрываем notifications popup
            if (this.elements.notificationsPopup &&
                this.elements.notificationsPopup.classList.contains('active') &&
                !this.elements.notificationsBtn?.contains(e.target) &&
                !this.elements.notificationsPopup.contains(e.target)) {
                this.closeNotificationsPopup();
            }

            // Закрываем user menu
            if (this.state.isUserMenuOpen &&
                !this.elements.userBtn?.contains(e.target) &&
                !this.elements.userMenu?.contains(e.target)) {
                this.toggleUserMenu();
            }
        }

        /**
         * Получение иконки уведомления
         */
        getNotificationIcon(type) {
            const icons = {
                'success': '✅',
                'error': '❌',
                'warning': '⚠️',
                'info': 'ℹ️'
            };
            return icons[type] || icons.info;
        }

        /**
         * Форматирование времени
         */
        formatTime(timestamp) {
            const now = new Date();
            const time = new Date(timestamp);
            const diff = now - time;

            if (diff < 60000) { // менее минуты
                return 'только что';
            } else if (diff < 3600000) { // менее часа
                return `${Math.floor(diff / 60000)} мин назад`;
            } else if (diff < 86400000) { // менее дня
                return `${Math.floor(diff / 3600000)} ч назад`;
            } else {
                return time.toLocaleDateString();
            }
        }

        /**
         * Уничтожение HeaderManager
         */
        destroy() {
            // Очищаем интервалы и слушатели
            console.log('🗑️ HeaderManager уничтожен');
        }
    }

    // Экспорт в глобальную область
    window.HeaderManager = HeaderManager;
    console.log('✅ HeaderManager модуль загружен (исправленная версия с addNotification)');
})();