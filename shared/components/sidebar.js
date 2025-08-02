/**
 * IP Roast Enterprise 4.0 - Fixed Sidebar Component
 * Исправленная адаптивная боковая панель навигации
 * Версия: Enterprise 4.0 (Fixed)
 */

import { EventEmitter, logger, Storage, debounce, addClass, removeClass, toggleClass } from '../utils/helpers.js';
import { STORAGE_KEYS, MODULES, ANIMATION_DURATION } from '../utils/constants.js';

export class SidebarComponent extends EventEmitter {
    constructor(options = {}) {
        super();
        this.options = {
            container: '.sidebar',
            toggleButton: '.sidebar__toggle',
            desktopToggleButton: '.sidebar__desktop-toggle',
            overlay: '.sidebar__overlay',
            persistState: true,
            autoCollapse: true,
            mobileBreakpoint: 1024,
            animationDuration: ANIMATION_DURATION.NORMAL,
            ...options
        };

        // Состояние компонента
        this.state = {
            isCollapsed: false,
            isOpen: false,
            isMobile: false,
            isAnimating: false,
            activeTab: 'dashboard'
        };

        // DOM элементы
        this.elements = {
            sidebar: null,
            toggle: null,
            desktopToggle: null,
            overlay: null,
            navItems: null,
            statusItems: null
        };

        // Обработчики событий
        this.handlers = {
            resize: debounce(this.handleResize.bind(this), 250),
            keydown: this.handleKeydown.bind(this),
            clickOutside: this.handleClickOutside.bind(this)
        };

        this.init();
    }

    /**
     * Инициализация компонента
     */
    async init() {
        try {
            logger.info('🔧 Инициализация Sidebar компонента');
            await this.findElements();
            this.loadState();
            this.setupEventListeners();
            this.checkMobileView();
            this.updateView();
            this.setupNavigation();
            this.setupSystemStatus();
            logger.info('✅ Sidebar компонент инициализирован успешно');
            this.emit('initialized');
        } catch (error) {
            logger.error('❌ Ошибка инициализации Sidebar:', error);
            throw error;
        }
    }

    /**
     * Поиск DOM элементов
     */
    async findElements() {
        this.elements.sidebar = document.querySelector(this.options.container);
        if (!this.elements.sidebar) {
            throw new Error(`Sidebar container не найден: ${this.options.container}`);
        }

        this.elements.toggle = this.elements.sidebar.querySelector(this.options.toggleButton);
        this.elements.overlay = document.querySelector(this.options.overlay);
        this.elements.navItems = this.elements.sidebar.querySelectorAll('.nav-item');
        this.elements.statusItems = this.elements.sidebar.querySelectorAll('.status-item');

        // Создаем desktop toggle если не существует
        this.createDesktopToggle();
    }

    /**
     * ИСПРАВЛЕННАЯ функция создания desktop toggle
     */
    createDesktopToggle() {
        // Удаляем существующий toggle если есть
        const existingToggle = document.querySelector(this.options.desktopToggleButton);
        if (existingToggle) {
            existingToggle.remove();
        }

        const toggle = document.createElement('button');
        toggle.className = 'sidebar__desktop-toggle';
        toggle.innerHTML = '☰'; // Простая иконка меню
        toggle.title = 'Развернуть меню';
        toggle.setAttribute('aria-label', 'Развернуть боковое меню');
        toggle.style.display = 'none'; // Скрываем по умолчанию

        // Добавляем в body
        document.body.appendChild(toggle);
        this.elements.desktopToggle = toggle;

        logger.debug('Desktop toggle создан');
    }

    /**
     * Настройка обработчиков событий
     */
    setupEventListeners() {
        // Toggle кнопки
        if (this.elements.toggle) {
            this.elements.toggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggle();
            });
            logger.debug('Mobile toggle обработчик добавлен');
        }

        if (this.elements.desktopToggle) {
            this.elements.desktopToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.expand();
            });
            logger.debug('Desktop toggle обработчик добавлен');
        }

        // Overlay для мобильных
        if (this.elements.overlay) {
            this.elements.overlay.addEventListener('click', () => this.close());
        }

        // Глобальные события
        window.addEventListener('resize', this.handlers.resize);
        document.addEventListener('keydown', this.handlers.keydown);
        document.addEventListener('click', this.handlers.clickOutside);

        // Навигационные элементы
        this.elements.navItems.forEach(item => {
            const link = item.querySelector('.nav-link');
            if (link) {
                link.addEventListener('click', (e) => this.handleNavClick(e, item));
            }
        });
    }

    /**
     * Настройка навигации
     */
    setupNavigation() {
        // Добавляем data-tooltip для collapsed состояния
        this.elements.navItems.forEach(item => {
            const link = item.querySelector('.nav-link');
            const text = item.querySelector('.nav-text');
            if (link && text) {
                link.setAttribute('data-tooltip', text.textContent.trim());
            }
        });

        // Устанавливаем активную вкладку
        this.setActiveTab(this.state.activeTab);
    }

    /**
     * Настройка системного статуса
     */
    setupSystemStatus() {
        // Обновляем статус каждые 30 секунд
        this.updateSystemStatus();
        this.statusInterval = setInterval(() => {
            this.updateSystemStatus();
        }, 30000);
    }

    /**
     * Обновление системного статуса
     */
    updateSystemStatus() {
        const statusData = {
            system: Math.random() > 0.1 ? 'OK' : 'WARNING',
            network: Math.random() > 0.05 ? 'Connected' : 'Disconnected',
            security: Math.random() > 0.02 ? 'Protected' : 'Alert'
        };

        this.elements.statusItems.forEach(item => {
            const label = item.querySelector('.status-label');
            const value = item.querySelector('.status-value');

            if (label && value) {
                const statusType = label.textContent.toLowerCase();
                if (statusData[statusType]) {
                    value.textContent = statusData[statusType];

                    // Обновляем CSS классы
                    value.className = 'status-value';
                    if (statusData[statusType] === 'OK' || statusData[statusType] === 'Connected' || statusData[statusType] === 'Protected') {
                        addClass(value, 'status-healthy');
                    } else if (statusData[statusType] === 'WARNING') {
                        addClass(value, 'status-warning');
                    } else {
                        addClass(value, 'status-error');
                    }
                }
            }
        });
    }

    /**
     * Обработка клика по навигации
     */
    handleNavClick(e, item) {
        e.preventDefault();
        const tabId = item.dataset.tab;
        if (!tabId) return;

        this.setActiveTab(tabId);
        this.emit('navigate', { tab: tabId, item });

        // На мобильных закрываем меню после клика
        if (this.state.isMobile) {
            this.close();
        }
    }

    /**
     * Установка активной вкладки
     */
    setActiveTab(tabId) {
        this.state.activeTab = tabId;

        this.elements.navItems.forEach(item => {
            if (item.dataset.tab === tabId) {
                addClass(item, 'active');
            } else {
                removeClass(item, 'active');
            }
        });

        this.saveState();
    }

    /**
     * Обработка изменения размера окна
     */
    handleResize() {
        const wasMobile = this.state.isMobile;
        this.checkMobileView();

        if (wasMobile !== this.state.isMobile) {
            this.handleMobileChange();
        }
    }

    /**
     * Проверка мобильного вида
     */
    checkMobileView() {
        this.state.isMobile = window.innerWidth <= this.options.mobileBreakpoint;
        if (this.state.isMobile) {
            addClass(this.elements.sidebar, 'sidebar--mobile');
        } else {
            removeClass(this.elements.sidebar, 'sidebar--mobile');
        }
    }

    /**
     * Обработка смены между мобильным и десктопным видом
     */
    handleMobileChange() {
        if (this.state.isMobile) {
            // Переход на мобильный - закрываем меню
            this.close();
            this.hideDesktopToggle();
        } else {
            // Переход на десктоп - восстанавливаем состояние
            this.loadState();
            this.updateView();
        }
    }

    /**
     * Обработка нажатий клавиш
     */
    handleKeydown(e) {
        // ESC закрывает меню на мобильных
        if (e.key === 'Escape' && this.state.isMobile && this.state.isOpen) {
            this.close();
        }

        // Ctrl+B переключает меню на десктопе
        if (e.ctrlKey && e.key === 'b' && !this.state.isMobile) {
            e.preventDefault();
            this.toggle();
        }
    }

    /**
     * Обработка клика вне меню
     */
    handleClickOutside(e) {
        if (this.state.isMobile && this.state.isOpen &&
            !this.elements.sidebar.contains(e.target) &&
            !this.elements.toggle?.contains(e.target)) {
            this.close();
        }
    }

    /**
     * ИСПРАВЛЕННАЯ функция переключения состояния
     */
    toggle() {
        if (this.state.isMobile) {
            this.state.isOpen ? this.close() : this.open();
        } else {
            this.state.isCollapsed ? this.expand() : this.collapse();
        }
    }

    /**
     * Открытие меню (мобильные)
     */
    open() {
        if (!this.state.isMobile || this.state.isOpen || this.state.isAnimating) return;

        this.state.isOpen = true;
        this.state.isAnimating = true;

        addClass(this.elements.sidebar, 'sidebar--open');
        addClass(this.elements.sidebar, 'sidebar--opening');

        if (this.elements.overlay) {
            addClass(this.elements.overlay, 'sidebar__overlay--visible');
        }

        setTimeout(() => {
            this.state.isAnimating = false;
            removeClass(this.elements.sidebar, 'sidebar--opening');
        }, this.options.animationDuration);

        this.emit('opened');
        logger.debug('Sidebar opened (mobile)');
    }

    /**
     * Закрытие меню (мобильные)
     */
    close() {
        if (!this.state.isMobile || !this.state.isOpen || this.state.isAnimating) return;

        this.state.isOpen = false;
        this.state.isAnimating = true;

        addClass(this.elements.sidebar, 'sidebar--closing');

        if (this.elements.overlay) {
            removeClass(this.elements.overlay, 'sidebar__overlay--visible');
        }

        setTimeout(() => {
            this.state.isAnimating = false;
            removeClass(this.elements.sidebar, 'sidebar--open');
            removeClass(this.elements.sidebar, 'sidebar--closing');
        }, this.options.animationDuration);

        this.emit('closed');
        logger.debug('Sidebar closed (mobile)');
    }

    /**
     * ИСПРАВЛЕННАЯ функция сворачивания меню (десктоп)
     */
    collapse() {
        if (this.state.isMobile || this.state.isCollapsed) return;

        this.state.isCollapsed = true;
        addClass(this.elements.sidebar, 'sidebar--collapsed');

        // Показываем desktop toggle
        this.showDesktopToggle();

        if (this.elements.desktopToggle) {
            this.elements.desktopToggle.title = 'Развернуть меню';
        }

        this.saveState();
        this.emit('collapsed');
        logger.debug('Sidebar collapsed (desktop)');
    }

    /**
     * ИСПРАВЛЕННАЯ функция разворачивания меню (десктоп)
     */
    expand() {
        if (this.state.isMobile || !this.state.isCollapsed) return;

        this.state.isCollapsed = false;
        removeClass(this.elements.sidebar, 'sidebar--collapsed');

        // Скрываем desktop toggle
        this.hideDesktopToggle();

        if (this.elements.desktopToggle) {
            this.elements.desktopToggle.title = 'Свернуть меню';
        }

        this.saveState();
        this.emit('expanded');
        logger.debug('Sidebar expanded (desktop)');
    }

    /**
     * НОВАЯ функция для показа desktop toggle
     */
    showDesktopToggle() {
        if (this.elements.desktopToggle && !this.state.isMobile) {
            this.elements.desktopToggle.style.display = 'flex';
            logger.debug('Desktop toggle показан');
        }
    }

    /**
     * НОВАЯ функция для скрытия desktop toggle
     */
    hideDesktopToggle() {
        if (this.elements.desktopToggle) {
            this.elements.desktopToggle.style.display = 'none';
            logger.debug('Desktop toggle скрыт');
        }
    }

    /**
     * ИСПРАВЛЕННАЯ функция обновления отображения
     */
    updateView() {
        if (this.state.isMobile) {
            // Мобильная логика
            if (this.state.isOpen) {
                addClass(this.elements.sidebar, 'sidebar--open');
            } else {
                removeClass(this.elements.sidebar, 'sidebar--open');
            }
            this.hideDesktopToggle();
        } else {
            // Десктопная логика
            if (this.state.isCollapsed) {
                addClass(this.elements.sidebar, 'sidebar--collapsed');
                this.showDesktopToggle();
            } else {
                removeClass(this.elements.sidebar, 'sidebar--collapsed');
                this.hideDesktopToggle();
            }
        }
    }

    /**
     * Сохранение состояния
     */
    saveState() {
        if (this.options.persistState) {
            const state = {
                isCollapsed: this.state.isCollapsed,
                activeTab: this.state.activeTab
            };
            Storage.set(STORAGE_KEYS.SIDEBAR_STATE, state);
        }
    }

    /**
     * Загрузка состояния
     */
    loadState() {
        if (this.options.persistState) {
            const saved = Storage.get(STORAGE_KEYS.SIDEBAR_STATE);
            if (saved) {
                this.state.isCollapsed = saved.isCollapsed || false;
                this.state.activeTab = saved.activeTab || 'dashboard';
            }
        }
    }

    /**
     * Получение текущего состояния
     */
    getState() {
        return { ...this.state };
    }

    /**
     * Программное управление
     */
    setCollapsed(collapsed) {
        if (this.state.isMobile) return;

        if (collapsed) {
            this.collapse();
        } else {
            this.expand();
        }
    }

    /**
     * Обновление бейджей
     */
    updateBadge(tabId, value) {
        const item = this.elements.sidebar.querySelector(`[data-tab="${tabId}"]`);
        if (!item) return;

        let badge = item.querySelector('.nav-badge');

        if (value) {
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'nav-badge';
                item.querySelector('.nav-link').appendChild(badge);
            }
            badge.textContent = value;
        } else if (badge) {
            badge.remove();
        }
    }

    /**
     * Уничтожение компонента
     */
    destroy() {
        // Удаляем обработчики событий
        window.removeEventListener('resize', this.handlers.resize);
        document.removeEventListener('keydown', this.handlers.keydown);
        document.removeEventListener('click', this.handlers.clickOutside);

        // Очищаем интервалы
        if (this.statusInterval) {
            clearInterval(this.statusInterval);
        }

        // Удаляем desktop toggle если создавали
        if (this.elements.desktopToggle) {
            this.elements.desktopToggle.remove();
        }

        // Очищаем состояние
        this.removeAllListeners();
        logger.info('🗑️ Sidebar компонент уничтожен');
    }
}

// Экспорт для использования в приложении
export default SidebarComponent;
