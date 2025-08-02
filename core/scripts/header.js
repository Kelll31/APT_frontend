/**
 * Header.js - Управление адаптивным header и его функциональностью
 * IP Roast Enterprise 4.0
 */

class HeaderManager {
    constructor() {
        this.elements = {
            header: null,
            pageTitle: null,
            breadcrumb: null,
            notificationsBtn: null,
            fullscreenBtn: null,
            userBtn: null,
            userMenu: null
        };

        this.state = {
            isFullscreen: false,
            notificationsCount: 0,
            isUserMenuOpen: false
        };

        this.notifications = [];
        this.init();
    }

    /**
     * Инициализация header менеджера
     */
    init() {
        this.findElements();
        this.setupEventListeners();
        this.updateNotificationBadge();
        this.setupFullscreen();
        this.startPeriodicUpdates();

        console.log('✅ Header менеджер инициализирован');
    }

    /**
     * Поиск DOM элементов
     */
    findElements() {
        // Не ищем через header-container, напрямую ищем ID-шники
        this.elements.header = document.getElementById('main-header');
        this.elements.pageTitle = document.getElementById('page-title');
        this.elements.breadcrumb = document.getElementById('breadcrumb');
        this.elements.notificationsBtn = document.getElementById('notifications-btn');
        this.elements.fullscreenBtn = document.getElementById('fullscreen-btn');
        this.elements.userBtn = document.getElementById('user-btn');
        this.elements.userMenu = document.getElementById('user-menu');

        if (!this.elements.header) {
            console.error('❌ HeaderManager: элемент #main-header не найден');
            return;
        }
        console.log('🔍 Header элементы найдены');
    }

    /**
     * Настройка обработчиков событий
     */
    setupEventListeners() {
        // Кнопка уведомлений
        if (this.elements.notificationsBtn) {
            this.elements.notificationsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleNotifications();
            });
        }

        // Кнопка полноэкранного режима
        if (this.elements.fullscreenBtn) {
            this.elements.fullscreenBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleFullscreen();
            });
        }

        // Меню пользователя
        if (this.elements.userBtn) {
            this.elements.userBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleUserMenu();
            });
        }

        // Слушатель изменения полноэкранного режима
        document.addEventListener('fullscreenchange', () => {
            this.handleFullscreenChange();
        });

        // Закрытие меню при клике вне
        document.addEventListener('click', (e) => {
            this.handleClickOutside(e);
        });

        // Клавиатурные шортакты
        document.addEventListener('keydown', (e) => {
            this.handleKeydown(e);
        });

        console.log('⚡ Header обработчики событий настроены');
    }

    /**
     * Обновление заголовка страницы
     */
    updatePageTitle(title, subtitle = null) {
        if (this.elements.pageTitle) {
            this.elements.pageTitle.textContent = title;
            document.title = `${title} - IP Roast Enterprise`;
        }

        this.updateBreadcrumb(title, subtitle);
        console.log(`📄 Заголовок обновлен: ${title}`);
    }

    /**
     * Обновление breadcrumb навигации
     */
    updateBreadcrumb(current, parent = null) {
        if (!this.elements.breadcrumb) return;

        const breadcrumbItems = [];

        // Главная всегда первая
        breadcrumbItems.push({
            text: 'Главная',
            active: false,
            href: '#dashboard'
        });

        // Родительский элемент если есть
        if (parent) {
            breadcrumbItems.push({
                text: parent,
                active: false,
                href: '#'
            });
        }

        // Текущая страница
        breadcrumbItems.push({
            text: current,
            active: true,
            href: null
        });

        // Создаем HTML
        const breadcrumbHTML = breadcrumbItems.map((item, index) => {
            const isLast = index === breadcrumbItems.length - 1;
            const itemHTML = item.active ?
                `<span class="breadcrumb-item active">${item.text}</span>` :
                `<a href="${item.href}" class="breadcrumb-item">${item.text}</a>`;

            const separatorHTML = isLast ? '' : '<span class="breadcrumb-separator">/</span>';

            return itemHTML + separatorHTML;
        }).join('');

        this.elements.breadcrumb.innerHTML = breadcrumbHTML;
    }

    /**
     * Управление уведомлениями
     */
    addNotification(notification) {
        const id = Date.now().toString();
        const newNotification = {
            id,
            title: notification.title,
            message: notification.message,
            type: notification.type || 'info',
            timestamp: new Date(),
            read: false
        };

        this.notifications.unshift(newNotification);

        // Ограничиваем количество уведомлений
        if (this.notifications.length > 50) {
            this.notifications = this.notifications.slice(0, 50);
        }

        this.updateNotificationBadge();
        this.showToast(newNotification);

        console.log('🔔 Добавлено уведомление:', newNotification.title);
    }

    /**
     * Показ toast уведомления
     */
    showToast(notification) {
        const toast = this.createToastElement(notification);
        const container = this.getToastContainer();

        container.appendChild(toast);

        // Анимация появления
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        // Автоматическое скрытие
        setTimeout(() => {
            this.hideToast(toast);
        }, 5000);
    }

    /**
     * Создание элемента toast
     */
    createToastElement(notification) {
        const toast = document.createElement('div');
        toast.className = `toast ${notification.type}`;
        toast.dataset.id = notification.id;

        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        toast.innerHTML = `
      <div class="toast-icon">${icons[notification.type] || icons.info}</div>
      <div class="toast-content">
        <div class="toast-title">${notification.title}</div>
        <div class="toast-message">${notification.message}</div>
      </div>
      <button class="toast-close" aria-label="Закрыть">×</button>
    `;

        // Обработчик закрытия
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            this.hideToast(toast);
        });

        return toast;
    }

    /**
     * Скрытие toast
     */
    hideToast(toast) {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }

    /**
     * Получение контейнера для toast
     */
    getToastContainer() {
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        return container;
    }

    /**
     * Обновление бейджа уведомлений
     */
    updateNotificationBadge() {
        const unreadCount = this.notifications.filter(n => !n.read).length;
        this.state.notificationsCount = unreadCount;

        if (this.elements.notificationsBtn) {
            const badge = this.elements.notificationsBtn.querySelector('.notification-badge');
            if (badge) {
                if (unreadCount > 0) {
                    badge.textContent = unreadCount > 99 ? '99+' : unreadCount.toString();
                    badge.style.display = 'flex';
                } else {
                    badge.style.display = 'none';
                }
            }
        }
    }

    /**
     * Переключение панели уведомлений
     */
    toggleNotifications() {
        // Здесь можно открыть модальное окно или выдвижную панель с уведомлениями
        console.log('🔔 Открытие панели уведомлений');

        // Помечаем все уведомления как прочитанные
        this.notifications.forEach(n => n.read = true);
        this.updateNotificationBadge();

        // Пример: создание простого списка уведомлений
        this.showNotificationsModal();
    }

    /**
     * Показ модального окна с уведомлениями
     */
    showNotificationsModal() {
        const modal = document.createElement('div');
        modal.className = 'notifications-modal';
        modal.innerHTML = `
      <div class="modal-overlay">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Уведомления</h3>
            <button class="modal-close">×</button>
          </div>
          <div class="modal-body">
            ${this.renderNotificationsList()}
          </div>
        </div>
      </div>
    `;

        document.body.appendChild(modal);

        // Обработчики закрытия
        const closeBtn = modal.querySelector('.modal-close');
        const overlay = modal.querySelector('.modal-overlay');

        closeBtn.addEventListener('click', () => this.closeModal(modal));
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) this.closeModal(modal);
        });

        requestAnimationFrame(() => {
            modal.classList.add('show');
        });
    }

    /**
     * Рендер списка уведомлений
     */
    renderNotificationsList() {
        if (this.notifications.length === 0) {
            return '<div class="empty-notifications">Нет уведомлений</div>';
        }

        return this.notifications.slice(0, 10).map(notification => `
      <div class="notification-item ${notification.type}">
        <div class="notification-header">
          <span class="notification-title">${notification.title}</span>
          <span class="notification-time">${this.formatTime(notification.timestamp)}</span>
        </div>
        <div class="notification-message">${notification.message}</div>
      </div>
    `).join('');
    }

    /**
     * Форматирование времени
     */
    formatTime(timestamp) {
        const now = new Date();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);

        if (minutes < 1) return 'только что';
        if (minutes < 60) return `${minutes} мин назад`;

        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} ч назад`;

        const days = Math.floor(hours / 24);
        return `${days} дн назад`;
    }

    /**
     * Закрытие модального окна
     */
    closeModal(modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }, 300);
    }

    /**
     * Управление полноэкранным режимом
     */
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.warn('Не удалось войти в полноэкранный режим:', err);
            });
        } else {
            document.exitFullscreen().catch(err => {
                console.warn('Не удалось выйти из полноэкранного режима:', err);
            });
        }
    }

    /**
     * Настройка полноэкранного режима
     */
    setupFullscreen() {
        if (!document.fullscreenEnabled) {
            if (this.elements.fullscreenBtn) {
                this.elements.fullscreenBtn.style.display = 'none';
            }
        }
    }

    /**
     * Обработка изменения полноэкранного режима
     */
    handleFullscreenChange() {
        this.state.isFullscreen = !!document.fullscreenElement;

        if (this.elements.fullscreenBtn) {
            const icon = this.elements.fullscreenBtn.querySelector('.btn-icon');
            if (icon) {
                icon.textContent = this.state.isFullscreen ? '⛶' : '⛶';
            }
        }

        console.log('🖥️ Полноэкранный режим:', this.state.isFullscreen);
    }

    /**
     * Переключение меню пользователя
     */
    toggleUserMenu() {
        this.state.isUserMenuOpen = !this.state.isUserMenuOpen;

        if (this.elements.userBtn) {
            this.elements.userBtn.setAttribute('aria-expanded', this.state.isUserMenuOpen.toString());
        }

        if (this.state.isUserMenuOpen) {
            this.showUserMenu();
        } else {
            this.hideUserMenu();
        }
    }

    /**
     * Показ меню пользователя
     */
    showUserMenu() {
        // Удаляем существующее меню
        this.hideUserMenu();

        const menu = document.createElement('div');
        menu.className = 'user-dropdown-menu';
        menu.innerHTML = `
      <div class="user-menu-item">
        <span class="menu-icon">👤</span>
        <span class="menu-text">Профиль</span>
      </div>
      <div class="user-menu-item">
        <span class="menu-icon">⚙️</span>
        <span class="menu-text">Настройки</span>
      </div>
      <div class="user-menu-item">
        <span class="menu-icon">🌙</span>
        <span class="menu-text">Темная тема</span>
      </div>
      <div class="user-menu-divider"></div>
      <div class="user-menu-item">
        <span class="menu-icon">🚪</span>
        <span class="menu-text">Выход</span>
      </div>
    `;

        // Позиционируем меню
        const userBtn = this.elements.userBtn;
        const rect = userBtn.getBoundingClientRect();
        menu.style.position = 'fixed';
        menu.style.top = `${rect.bottom + 8}px`;
        menu.style.right = `${window.innerWidth - rect.right}px`;
        menu.style.zIndex = '9999';

        document.body.appendChild(menu);

        // Анимация появления
        requestAnimationFrame(() => {
            menu.classList.add('show');
        });

        this.elements.userMenu = menu;
    }

    /**
     * Скрытие меню пользователя
     */
    hideUserMenu() {
        if (this.elements.userMenu) {
            this.elements.userMenu.remove();
            this.elements.userMenu = null;
        }
        this.state.isUserMenuOpen = false;

        if (this.elements.userBtn) {
            this.elements.userBtn.setAttribute('aria-expanded', 'false');
        }
    }

    /**
     * Обработка клика вне элементов
     */
    handleClickOutside(e) {
        // Закрытие меню пользователя
        if (this.state.isUserMenuOpen &&
            !this.elements.userBtn?.contains(e.target) &&
            !this.elements.userMenu?.contains(e.target)) {
            this.hideUserMenu();
        }
    }

    /**
     * Обработка нажатий клавиш
     */
    handleKeydown(e) {
        // F11 - полноэкранный режим
        if (e.key === 'F11') {
            e.preventDefault();
            this.toggleFullscreen();
        }

        // Escape - закрытие меню
        if (e.key === 'Escape') {
            if (this.state.isUserMenuOpen) {
                this.hideUserMenu();
            }
        }
    }

    /**
     * Периодические обновления
     */
    startPeriodicUpdates() {
        // Обновляем время в уведомлениях каждую минуту
        setInterval(() => {
            const modal = document.querySelector('.notifications-modal');
            if (modal) {
                const body = modal.querySelector('.modal-body');
                if (body) {
                    body.innerHTML = this.renderNotificationsList();
                }
            }
        }, 60000);
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
     * Получение состояния header
     */
    getState() {
        return {
            ...this.state,
            notificationsCount: this.notifications.filter(n => !n.read).length
        };
    }

    /**
     * Уничтожение header менеджера
     */
    destroy() {
        // Удаляем обработчики событий
        document.removeEventListener('fullscreenchange', this.handleFullscreenChange);
        document.removeEventListener('click', this.handleClickOutside);
        document.removeEventListener('keydown', this.handleKeydown);

        // Очищаем элементы
        this.hideUserMenu();

        console.log('🗑️ Header менеджер уничтожен');
    }
}

// Экспорт
window.HeaderManager = HeaderManager;

// Автоинициализация
document.addEventListener('DOMContentLoaded', () => {
    if (!window.headerManager) {
        window.headerManager = new HeaderManager();
    }
});