/**
 * IP Roast Enterprise 4.0 - Notification System
 * Modular toast notifications with enterprise features
 */

class NotificationSystem {
    constructor() {
        this.container = null;
        this.notifications = new Map();
        this.defaults = {
            duration: 5000,
            persistent: false,
            closable: true,
            progress: true,
            sound: false
        };
        this.init();
    }

    /**
     * Initialize the notification system
     */
    init() {
        this.createContainer();
        this.setupEventListeners();
        console.log('🔔 IP Roast Notification System initialized');
    }

    /**
     * Create the toast container
     */
    createContainer() {
        if (this.container) return;

        this.container = document.createElement('div');
        this.container.className = 'toast-container';
        this.container.setAttribute('aria-live', 'polite');
        this.container.setAttribute('aria-label', 'Notifications');
        document.body.appendChild(this.container);
    }

    /**
     * Setup global event listeners
     */
    setupEventListeners() {
        // Close notifications on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAll();
            }
        });

        // Handle visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAll();
            } else {
                this.resumeAll();
            }
        });
    }

    /**
     * Show a notification
     * @param {string} message - The notification message
     * @param {string} type - The notification type (success, error, warning, info)
     * @param {object} options - Additional options
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
            onClick: config.onClick
        };

        this.notifications.set(id, notification);
        this.render(notification);

        // Auto-close if not persistent
        if (!notification.persistent && notification.duration > 0) {
            setTimeout(() => {
                this.close(id);
            }, notification.duration);
        }

        // Play sound if enabled
        if (config.sound) {
            this.playNotificationSound(type);
        }

        return id;
    }

    /**
     * Render a notification
     */
    render(notification) {
        const toast = document.createElement('div');
        toast.className = `toast ${notification.type}`;
        toast.setAttribute('data-id', notification.id);
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');

        // Add progress class if enabled
        if (notification.progress && !notification.persistent) {
            toast.classList.add('with-progress');
        }

        const icon = this.getIcon(notification.type);

        toast.innerHTML = `
            <div class="toast-icon">${icon}</div>
            <div class="toast-content">
                ${notification.title ? `<div class="toast-title">${this.escapeHtml(notification.title)}</div>` : ''}
                <div class="toast-message">${this.escapeHtml(notification.message)}</div>
                ${this.renderActions(notification.actions)}
            </div>
            ${notification.closable ? `<button class="toast-close" aria-label="Close notification">&times;</button>` : ''}
            ${notification.progress && !notification.persistent ? `
                <div class="toast-progress">
                    <div class="toast-progress-bar" style="animation-duration: ${notification.duration}ms"></div>
                </div>
            ` : ''}
        `;

        // Add event listeners
        this.addToastEventListeners(toast, notification);

        // Insert at the top of container
        this.container.insertBefore(toast, this.container.firstChild);

        // Animate in
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });
    }

    /**
     * Add event listeners to toast
     */
    addToastEventListeners(toast, notification) {
        // Close button
        const closeBtn = toast.querySelector('.toast-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.close(notification.id);
            });
        }

        // Click handler
        if (notification.onClick) {
            toast.addEventListener('click', () => {
                notification.onClick(notification);
            });
            toast.style.cursor = 'pointer';
        }

        // Action buttons
        const actionBtns = toast.querySelectorAll('.toast-action');
        actionBtns.forEach((btn, index) => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = notification.actions[index];
                if (action.handler) {
                    action.handler(notification);
                }
                if (action.closeOnClick !== false) {
                    this.close(notification.id);
                }
            });
        });
    }

    /**
     * Render action buttons
     */
    renderActions(actions) {
        if (!actions || actions.length === 0) return '';

        const buttons = actions.map(action =>
            `<button class="toast-action ${action.primary ? 'toast-action--primary' : ''}">${this.escapeHtml(action.text)}</button>`
        ).join('');

        return `<div class="toast-actions">${buttons}</div>`;
    }

    /**
     * Close a notification
     */
    close(id) {
        const notification = this.notifications.get(id);
        if (!notification) return;

        const toast = this.container.querySelector(`[data-id="${id}"]`);
        if (!toast) return;

        // Animate out
        toast.classList.remove('show');

        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
            this.notifications.delete(id);

            // Call onClose callback
            if (notification.onClose) {
                notification.onClose(notification);
            }
        }, 300);
    }

    /**
     * Close all notifications
     */
    closeAll() {
        Array.from(this.notifications.keys()).forEach(id => {
            this.close(id);
        });
    }

    /**
     * Pause all notifications
     */
    pauseAll() {
        const toasts = this.container.querySelectorAll('.toast');
        toasts.forEach(toast => {
            const progressBar = toast.querySelector('.toast-progress-bar');
            if (progressBar) {
                progressBar.style.animationPlayState = 'paused';
            }
        });
    }

    /**
     * Resume all notifications
     */
    resumeAll() {
        const toasts = this.container.querySelectorAll('.toast');
        toasts.forEach(toast => {
            const progressBar = toast.querySelector('.toast-progress-bar');
            if (progressBar) {
                progressBar.style.animationPlayState = 'running';
            }
        });
    }

    /**
     * Get icon for notification type
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
     * Play notification sound
     */
    playNotificationSound(type) {
        // Create audio context if supported
        if (window.AudioContext || window.webkitAudioContext) {
            try {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                // Different frequencies for different types
                const frequencies = {
                    success: 800,
                    error: 400,
                    warning: 600,
                    info: 500
                };

                oscillator.frequency.setValueAtTime(frequencies[type] || 500, audioContext.currentTime);
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.1);
            } catch (error) {
                console.warn('Could not play notification sound:', error);
            }
        }
    }

    /**
     * Generate unique ID
     */
    generateId() {
        return `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Get notification count
     */
    getCount() {
        return this.notifications.size;
    }

    /**
     * Check if notifications are supported
     */
    isSupported() {
        return typeof document !== 'undefined' && document.body;
    }

    /**
     * Destroy the notification system
     */
    destroy() {
        this.closeAll();
        if (this.container && this.container.parentNode) {
            this.container.remove();
        }
        this.container = null;
        this.notifications.clear();
    }
}

// Create global instance
const notifications = new NotificationSystem();

// Export convenience methods
window.notify = {
    success: (message, options) => notifications.show(message, 'success', options),
    error: (message, options) => notifications.show(message, 'error', options),
    warning: (message, options) => notifications.show(message, 'warning', options),
    info: (message, options) => notifications.show(message, 'info', options),
    show: (message, type, options) => notifications.show(message, type, options),
    close: (id) => notifications.close(id),
    closeAll: () => notifications.closeAll(),
    getCount: () => notifications.getCount()
};

// Also export the class for advanced usage
window.NotificationSystem = NotificationSystem;
window.notifications = notifications;

// Auto-initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('🚀 IP Roast Enterprise Notifications ready');
    });
} else {
    console.log('🚀 IP Roast Enterprise Notifications ready');
}
