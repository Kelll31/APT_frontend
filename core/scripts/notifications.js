/**
 * core/scripts/notifications.js
 * NotificationSystem — Система уведомлений для IP Roast Enterprise 4.0
 * Экспортируется как window.NotificationSystem
 */

(function () {
    'use strict';

    class NotificationSystem {
        constructor() {
            this.notifications = new Map();
            this.toastContainer = null;
            this.defaults = {
                duration: 5000,
                persistent: false,
                closable: true,
                progress: true,
                sound: false
            };
            this.maxNotifications = 50; // Увеличиваем лимит для истории
            this.init();
        }

        /**
         * Инициализация системы уведомлений
         */
        init() {
            console.log('🔔 NotificationSystem инициализируется...');
            this.createToastContainer();
            this.setupEventListeners();
            console.log('✅ NotificationSystem инициализирован');
        }

        /**
         * Создание контейнера для toast уведомлений
         */
        createToastContainer() {
            if (this.toastContainer) return;

            this.toastContainer = document.createElement('div');
            this.toastContainer.className = 'toast-container';
            this.toastContainer.setAttribute('aria-live', 'polite');
            this.toastContainer.setAttribute('aria-label', 'Notifications');

            // Стили контейнера
            this.toastContainer.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        pointer-events: none;
      `;

            document.body.appendChild(this.toastContainer);
        }

        /**
         * Настройка обработчиков событий
         */
        setupEventListeners() {
            // Закрытие уведомлений по Escape
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.closeAll();
                }
            });

            // Пауза при смене вкладки
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    this.pauseAll();
                } else {
                    this.resumeAll();
                }
            });
        }

        /**
         * Показ уведомления
         */
        show(message, type = 'info', options = {}) {
            const config = { ...this.defaults, ...options };
            const id = this.generateId();

            const notification = {
                id,
                message,
                type,
                title: config.title,
                timestamp: new Date(),
                duration: config.duration,
                persistent: config.persistent,
                closable: config.closable,
                progress: config.progress,
                actions: config.actions || [],
                onClose: config.onClose,
                onClick: config.onClick,
                read: false
            };

            // Ограничиваем количество уведомлений в истории
            if (this.notifications.size >= this.maxNotifications) {
                const oldestId = Array.from(this.notifications.keys())[0];
                this.notifications.delete(oldestId);
            }

            this.notifications.set(id, notification);
            this.renderToast(notification);

            // Автозакрытие
            if (!notification.persistent && notification.duration > 0) {
                setTimeout(() => {
                    this.close(id);
                }, notification.duration);
            }

            // Звук
            if (config.sound) {
                this.playNotificationSound(type);
            }

            console.log(`🔔 Показано уведомление: ${message} (${type})`);
            return id;
        }

        /**
         * Рендер toast уведомления
         */
        renderToast(notification) {
            const toast = document.createElement('div');
            toast.className = `toast toast-${notification.type}`;
            toast.setAttribute('data-id', notification.id);
            toast.setAttribute('role', 'alert');
            toast.setAttribute('aria-live', 'assertive');

            // Стили toast
            toast.style.cssText = `
        pointer-events: auto;
        margin-bottom: 10px;
        min-width: 300px;
        max-width: 400px;
        padding: 16px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        background: var(--toast-bg, #fff);
        border: 1px solid var(--toast-border, #e0e0e0);
        color: var(--toast-text, #333);
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 14px;
        line-height: 1.4;
        position: relative;
        overflow: hidden;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
      `;

            if (notification.progress && !notification.persistent) {
                toast.classList.add('with-progress');
            }

            const icon = this.getIcon(notification.type);

            let actionsHTML = '';
            if (notification.actions && notification.actions.length > 0) {
                actionsHTML = `
          <div class="toast-actions" style="margin-top: 12px; display: flex; gap: 8px;">
            ${notification.actions.map(action =>
                    `<button class="toast-action" data-action="${action.id}" style="
                padding: 6px 12px;
                border: 1px solid #ddd;
                border-radius: 4px;
                background: #f5f5f5;
                color: #333;
                cursor: pointer;
                font-size: 12px;
              ">${action.label}</button>`
                ).join('')}
          </div>
        `;
            }

            toast.innerHTML = `
        <div class="toast-content" style="display: flex; align-items: flex-start;">
          <div class="toast-icon" style="margin-right: 12px; font-size: 18px; flex-shrink: 0;">${icon}</div>
          <div class="toast-body" style="flex: 1;">
            ${notification.title ? `<div class="toast-title" style="font-weight: 600; margin-bottom: 4px;">${notification.title}</div>` : ''}
            <div class="toast-message">${notification.message}</div>
            ${actionsHTML}
          </div>
          ${notification.closable ? `<button class="toast-close" aria-label="Close" style="
            position: absolute;
            top: 8px;
            right: 8px;
            background: none;
            border: none;
            font-size: 18px;
            cursor: pointer;
            color: #666;
            line-height: 1;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 4px;
          ">×</button>` : ''}
        </div>
        ${notification.progress && !notification.persistent ? `<div class="toast-progress" style="
          position: absolute;
          bottom: 0;
          left: 0;
          height: 3px;
          background: ${this.getProgressColor(notification.type)};
          animation: toastProgress ${notification.duration}ms linear forwards;
        "></div>` : ''}
      `;

            // Добавляем CSS анимации если их нет
            if (!document.querySelector('#toast-animations')) {
                const style = document.createElement('style');
                style.id = 'toast-animations';
                style.textContent = `
          @keyframes toastProgress {
            from { width: 100%; }
            to { width: 0%; }
          }
          .toast-show {
            opacity: 1 !important;
            transform: translateX(0) !important;
          }
          .toast-hide {
            opacity: 0 !important;
            transform: translateX(100%) !important;
          }
        `;
                document.head.appendChild(style);
            }

            // Обработчики событий
            if (notification.closable) {
                const closeBtn = toast.querySelector('.toast-close');
                closeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.close(notification.id);
                });
            }

            if (notification.onClick) {
                toast.addEventListener('click', notification.onClick);
            }

            // Обработка действий
            notification.actions.forEach(action => {
                const actionBtn = toast.querySelector(`[data-action="${action.id}"]`);
                if (actionBtn) {
                    actionBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        if (action.handler) {
                            action.handler(notification);
                        }
                        if (action.closeOnClick !== false) {
                            this.close(notification.id);
                        }
                    });
                }
            });

            this.toastContainer.appendChild(toast);

            // Анимация появления
            requestAnimationFrame(() => {
                toast.classList.add('toast-show');
            });
        }

        /**
         * Закрытие уведомления
         */
        close(id) {
            const notification = this.notifications.get(id);
            if (!notification) return;

            const toast = this.toastContainer.querySelector(`[data-id="${id}"]`);
            if (toast) {
                toast.classList.remove('toast-show');
                toast.classList.add('toast-hide');

                setTimeout(() => {
                    if (toast.parentNode) {
                        toast.parentNode.removeChild(toast);
                    }
                }, 300);
            }

            // Не удаляем из Map - оставляем в истории
            if (notification.onClose) {
                notification.onClose(notification);
            }

            console.log(`🔔 Уведомление закрыто: ${id}`);
        }

        /**
         * Закрытие всех активных уведомлений
         */
        closeAll() {
            const activeToasts = this.toastContainer.querySelectorAll('.toast');
            activeToasts.forEach(toast => {
                const id = toast.getAttribute('data-id');
                this.close(id);
            });
            console.log('🔔 Все уведомления закрыты');
        }

        /**
         * Получение последних N уведомлений для dropdown
         */
        getLast(count = 10) {
            const items = Array.from(this.notifications.values())
                .sort((a, b) => b.timestamp - a.timestamp)
                .slice(0, count);

            return items.map(n => ({
                id: n.id,
                message: n.message,
                title: n.title,
                type: n.type,
                icon: this.getIcon(n.type),
                time: this.formatTime(n.timestamp),
                read: n.read
            }));
        }

        /**
         * Удаление уведомления
         */
        delete(id) {
            this.close(id);
            this.notifications.delete(id);
            console.log(`🗑️ Уведомление удалено: ${id}`);
        }

        /**
         * Очистка всех уведомлений
         */
        clear() {
            this.closeAll();
            this.notifications.clear();
            console.log('🗑️ Все уведомления очищены');
        }

        /**
         * Отметка как прочитанное
         */
        markAsRead(id) {
            const notification = this.notifications.get(id);
            if (notification) {
                notification.read = true;
            }
        }

        /**
         * Получение количества непрочитанных
         */
        getUnreadCount() {
            return Array.from(this.notifications.values()).filter(n => !n.read).length;
        }

        /**
         * Генерация ID
         */
        generateId() {
            return `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        }

        /**
         * Иконки для типов уведомлений
         */
        getIcon(type) {
            const icons = {
                success: '✅',
                error: '❌',
                warning: '⚠️',
                info: 'ℹ️'
            };
            return icons[type] || icons.info;
        }

        /**
         * Цвета прогресс-бара
         */
        getProgressColor(type) {
            const colors = {
                success: '#10b981',
                error: '#ef4444',
                warning: '#f59e0b',
                info: '#3b82f6'
            };
            return colors[type] || colors.info;
        }

        /**
         * Форматирование времени
         */
        formatTime(timestamp) {
            const now = new Date();
            const diff = now - timestamp;

            if (diff < 60000) return 'Только что';
            if (diff < 3600000) return `${Math.floor(diff / 60000)} мин назад`;
            if (diff < 86400000) return `${Math.floor(diff / 3600000)} ч назад`;

            return timestamp.toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        }

        /**
         * Воспроизведение звука
         */
        playNotificationSound(type) {
            try {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                const frequencies = {
                    success: 800,
                    error: 400,
                    warning: 600,
                    info: 500
                };

                oscillator.frequency.value = frequencies[type] || frequencies.info;
                oscillator.type = 'sine';

                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.3);
            } catch (error) {
                console.warn('⚠️ Не удалось воспроизвести звук уведомления:', error);
            }
        }

        pauseAll() {
            console.log('⏸️ Уведомления приостановлены');
        }

        resumeAll() {
            console.log('▶️ Уведомления возобновлены');
        }

        // Shortcuts
        success(message, options) { return this.show(message, 'success', options); }
        error(message, options) { return this.show(message, 'error', { ...options, persistent: true, duration: 8000 }); }
        warning(message, options) { return this.show(message, 'warning', { ...options, duration: 6000 }); }
        info(message, options) { return this.show(message, 'info', options); }

        /**
         * Уничтожение системы
         */
        destroy() {
            this.closeAll();
            if (this.toastContainer) {
                this.toastContainer.remove();
            }
            this.notifications.clear();
            console.log('🗑️ NotificationSystem уничтожен');
        }
    }

    // Экспорт как конструктор в глобальную область
    window.NotificationSystem = NotificationSystem;
    console.log('🔔 NotificationSystem загружен и доступен как window.NotificationSystem');

})();
