/**
 * IP Roast Enterprise 4.0 - Fixed Main Application
 * Исправленное ядро приложения с устранением всех ошибок
 * Версия: Enterprise 4.0 (Fixed)
 */

// Импорты
import {
    APP_INFO,
    THEMES,
    NOTIFICATION_TYPES,
    DEFAULT_UI_SETTINGS,
    ANIMATION_DURATION,
    STORAGE_KEYS,
    UI_STATES,
    SUCCESS_MESSAGES,
    ERROR_MESSAGES,
    WEBSOCKET_EVENTS,
    CONNECTION_STATUS,
    Z_INDEX
} from '../shared/utils/constants.js';

import {
    EventEmitter,
    logger,
    Storage,
    formatDate,
    timeAgo,
    debounce,
    generateUUID,
    addClass,
    removeClass,
    toggleClass,
    delay,
    AppError,
    createError,
    handleError
} from '../shared/utils/helpers.js';

import { IPRoastAPI } from '../shared/utils/api.js';

// Импорт компонентов
import { NavigationComponent } from '../shared/components/navigation.js';
import { Modal, ConfirmModal } from '../shared/components/modals.js';
import { Button, Spinner } from '../shared/components/common.js';
import { SidebarComponent } from './shared/components/sidebar.js';

// Импорт mocks данных
import { DashboardDataLoader } from './mocks/dashboard-data-loader.js';

// Импорт контроллеров модулей
let DashboardController = null;

/**
 * Главный класс Enterprise приложения IP Roast
 */
class IPRoastEnterpriseApp extends EventEmitter {
    constructor() {
        super();

        // Информация о приложении
        this.version = APP_INFO.VERSION;
        this.buildDate = APP_INFO.BUILD_DATE;
        this.edition = 'Enterprise';

        // Состояние приложения
        this.state = {
            isInitialized: false,
            currentTab: 'dashboard',
            isLoading: true,
            connectionStatus: CONNECTION_STATUS.DISCONNECTED,

            // Пользователь
            user: {
                name: 'Администратор',
                role: 'Security Analyst',
                permissions: ['admin', 'scan', 'report', 'attack', 'settings'],
                avatar: null
            },

            // Подключение
            lastActivity: new Date(),

            // Уведомления
            notifications: [],
            unreadCount: 0,

            // Модули
            loadedModules: new Set(['dashboard']),
            moduleErrors: new Map()
        };

        // Контроллеры модулей
        this.modules = new Map();

        // Таймеры и интервалы
        this.intervals = new Map();
        this.timeouts = new Map();

        // Настройки приложения
        this.settings = {
            ...DEFAULT_UI_SETTINGS,
            ...Storage.get(STORAGE_KEYS.SETTINGS, {})
        };

        // Компоненты UI
        this.components = {
            navigation: null,
            modals: new Map(),
            notifications: null,
            sidebar: null
        };

        // WebSocket подключение
        this.websocket = null;
        this.websocketReconnectAttempts = 0;

        // API клиент
        this.api = IPRoastAPI;

        // Горячие клавиши
        this.hotkeys = new Map([
            ['ctrl+shift+r', this.refreshCurrentModule.bind(this)],
            ['ctrl+/', this.showHelpDialog.bind(this)],
            ['escape', this.closeModals.bind(this)],
            ['ctrl+alt+n', this.showNotificationCenter.bind(this)],
            ['f5', this.refreshCurrentModule.bind(this)]
        ]);

        // Привязка контекста методов для предотвращения ошибок bind
        this.handleResize = debounce(this.handleResize.bind(this), 250);
        this.handleKeydown = this.handleKeydown.bind(this);
        this.handleError = this.handleError.bind(this);
        this.handleCriticalError = this.handleCriticalError.bind(this);

        logger.info(`🚀 Инициализация IP Roast ${this.edition} ${this.version}`);
        this.init();
    }

    /**
     * Главная инициализация приложения
     */
    async init() {
        try {
            this.updateLoadingProgress(5, 'Инициализация ядра...');
            await this.initializeCore();

            this.updateLoadingProgress(15, 'Настройка интерфейса...');
            await this.setupUI();

            this.updateLoadingProgress(25, 'Загрузка модулей...');
            await this.initializeModules();

            this.updateLoadingProgress(60, 'Применение настроек...');
            await this.applyUserSettings();

            this.updateLoadingProgress(80, 'Запуск сервисов...');
            await this.startServices();

            this.updateLoadingProgress(95, 'Завершение загрузки...');
            await this.finalizeBoot();

            this.updateLoadingProgress(100, 'Готово!');

            // Скрыть экран загрузки
            setTimeout(() => {
                this.hideLoadingScreen();
                this.state.isInitialized = true;
                this.showNotification(SUCCESS_MESSAGES.APP_INITIALIZED, NOTIFICATION_TYPES.SUCCESS);
                this.emit('initialized');
                logger.info('✅ IP Roast Enterprise инициализирован');
            }, 800);

        } catch (error) {
            logger.error('❌ Критическая ошибка инициализации:', error);
            this.handleCriticalError(error);
        }
    }

    /**
     * Инициализация основных систем
     */
    async initializeCore() {
        try {
            // Инициализация системы уведомлений
            this.initializeNotificationSystem();

            // Настройка обработчиков ошибок
            this.setupErrorHandlers();

            // Инициализация системы событий
            this.setupEventSystem();

            // Настройка горячих клавиш
            this.setupHotkeys();

            // Инициализация WebSocket (безопасно)
            this.initializeWebSocket();

            logger.info('🔧 Ядро системы инициализировано');
        } catch (error) {
            throw createError('Ошибка инициализации ядра: ' + error.message, 500, 'CORE_INIT_ERROR');
        }
    }

    /**
     * Настройка пользовательского интерфейса
     */
    async setupUI() {
        try {
            // Инициализация sidebar 
            this.setupSidebar();

            // Инициализация навигации
            this.setupNavigation();

            // Настройка header элементов
            this.setupHeader();

            // Настройка поиска
            this.setupSearch();

            // Настройка модальных окон
            this.setupModals();

            // Настройка drag and drop
            this.setupDragAndDrop();

            // Настройка контекстного меню
            this.setupContextMenu();

            // Настройка уведомлений
            this.setupNotificationUI();

            logger.info('🎨 Пользовательский интерфейс настроен');
        } catch (error) {
            throw createError('Ошибка настройки UI: ' + error.message, 500, 'UI_SETUP_ERROR');
        }
    }

    /**
     * Настройка sidebar компонента
     */
    setupSidebar() {
        try {
            // Инициализация sidebar компонента
            this.components.sidebar = new SidebarComponent({
                container: '.sidebar',
                persistState: true,
                autoCollapse: true,
                mobileBreakpoint: 1024
            });

            // Подключение к событиям sidebar
            this.components.sidebar.on('navigate', (data) => {
                // Переключение вкладки при клике в sidebar
                this.switchTab(data.tab);
                logger.info(`Навигация через sidebar к: ${data.tab}`);
            });

            this.components.sidebar.on('collapsed', () => {
                logger.debug('Sidebar свернут');
                this.emit('sidebarCollapsed');
            });

            this.components.sidebar.on('expanded', () => {
                logger.debug('Sidebar развернут');
                this.emit('sidebarExpanded');
            });

            this.components.sidebar.on('error', (error) => {
                logger.error('Ошибка sidebar:', error);
                this.handleError(new Error(`Sidebar error: ${error.message}`));
            });

            logger.debug('✅ Sidebar компонент настроен');
        } catch (error) {
            logger.error('❌ Ошибка настройки sidebar:', error);
            // Не прерываем инициализацию из-за ошибки sidebar
        }
    }

    /**
     * Инициализация всех модулей
     */
    async initializeModules() {
        try {
            logger.info('📊 Инициализация Dashboard...');

            // Безопасная инициализация Dashboard
            try {
                // Динамический импорт Dashboard контроллера
                const dashboardController = new DashboardController({
                    container: '#dashboard-container .tab-content-inner',
                    autoRefresh: this.settings.autoRefresh,
                    refreshInterval: this.settings.refreshInterval,
                    enableWebSocket: this.settings.enableWebSocket
                });

                this.modules.set('dashboard', dashboardController);
                this.state.loadedModules.add('dashboard');

                logger.info('📥 Инициализация загрузчика данных...');
                this.dashboardDataLoader = new DashboardDataLoader();

                if (DashboardCtrl) {
                    const dashboardController = new DashboardCtrl({
                        container: '#dashboard-container .tab-content-inner',
                        autoRefresh: this.settings.autoRefresh,
                        refreshInterval: this.settings.refreshInterval,
                        enableWebSocket: this.settings.enableWebSocket
                    });
                    this.modules.set('dashboard', dashboardController);
                }
            } catch (error) {
                logger.warn('Ошибка инициализации Dashboard контроллера:', error.message);
            }

            this.state.loadedModules.add('dashboard');

            // Подготавливаем заглушки для остальных модулей
            await this.prepareModuleStubs();

            logger.info('📦 Модули инициализированы');
        } catch (error) {
            throw createError('Ошибка инициализации модулей: ' + error.message, 500, 'MODULE_INIT_ERROR');
        }
    }

    /**
     * Подготовка заглушек модулей
     */
    async prepareModuleStubs() {
        const modules = ['scanner', 'attack-constructor', 'network-topology', 'reports', 'settings'];
        modules.forEach(id => {
            const container = document.querySelector(`#${id}-container .tab-content-inner`);
            if (container) {
                container.innerHTML = `
                    <div class="module-placeholder">
                        <div class="placeholder-content">
                            <i class="fas fa-${this.getModuleIcon(id)} placeholder-icon"></i>
                            <h3>${this.getModuleTitle(id)}</h3>
                            <p>Нажмите для загрузки модуля</p>
                            <button class="btn btn--primary module-load-btn" data-module="${id}">
                                <i class="fas fa-play"></i>
                                Загрузить модуль
                            </button>
                        </div>
                    </div>
                `;

                const button = container.querySelector('button');
                if (button) {
                    button.addEventListener('click', () => {
                        this.loadStaticModule(id);
                    });
                }
            }
        });
    }

    /**
     * Загрузка статического модуля из pages/
     */
    async loadStaticModule(moduleId, buttonElement = null) {
        logger.info(`📄 Загрузка статического модуля: ${moduleId}`);

        const container = document.querySelector(`#${moduleId}-container .tab-content-inner`);
        if (!container) {
            logger.error(`Контейнер для модуля ${moduleId} не найден`);
            return;
        }

        try {
            // Показать индикатор загрузки
            if (buttonElement) {
                buttonElement.disabled = true;
                buttonElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Загрузка...';
            }

            container.innerHTML = `
                <div class="module-loading">
                    <div class="loading-spinner"></div>
                    <p>Загрузка модуля ${this.getModuleTitle(moduleId)}...</p>
                </div>
            `;

            // Загружаем HTML из папки pages/
            const response = await fetch(`/pages/${moduleId}.html`);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const html = await response.text();

            // Добавляем небольшую задержку для плавности
            await delay(300);

            // Вставляем загруженный контент
            container.innerHTML = html;

            // Отмечаем модуль как загруженный
            this.state.loadedModules.add(moduleId);

            // Инициализируем функциональность модуля
            this.initializeModuleFunctionality(moduleId);

            // Показать уведомление об успехе
            this.showNotification(
                `Модуль "${this.getModuleTitle(moduleId)}" успешно загружен`,
                NOTIFICATION_TYPES.SUCCESS
            );

            logger.info(`✅ Модуль ${moduleId} загружен из pages/${moduleId}.html`);

        } catch (error) {
            logger.error(`❌ Ошибка загрузки модуля ${moduleId}:`, error);

            // Показать ошибку в контейнере
            container.innerHTML = `
                <div class="module-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Ошибка загрузки модуля</h3>
                    <p>${error.message}</p>
                    <button class="btn btn--primary retry-btn" onclick="window.ipRoastApp.loadStaticModule('${moduleId}')">
                        <i class="fas fa-redo"></i>
                        Попробовать снова
                    </button>
                </div>
            `;

            // Показать уведомление об ошибке
            this.showNotification(
                `Ошибка загрузки модуля: ${error.message}`,
                NOTIFICATION_TYPES.ERROR
            );

        } finally {
            // Восстанавливаем кнопку
            if (buttonElement) {
                buttonElement.disabled = false;
                buttonElement.innerHTML = '<i class="fas fa-play"></i> Загрузить модуль';
            }
        }
    }

    /**
     * Инициализация функциональности модуля
     */
    initializeModuleFunctionality(moduleId) {
        // Добавить специфичную логику для каждого модуля
        switch (moduleId) {
            case 'scanner':
                this.initializeScannerModule();
                break;
            case 'attack-constructor':
                this.initializeAttackConstructorModule();
                break;
            case 'network-topology':
                this.initializeTopologyModule();
                break;
            case 'reports':
                this.initializeReportsModule();
                break;
            case 'settings':
                this.initializeSettingsModule();
                break;
        }
    }

    /**
     * Заглушки для инициализации модулей
     */
    initializeScannerModule() {
        console.log('Scanner module functionality initialized');
    }

    initializeAttackConstructorModule() {
        console.log('Attack Constructor module functionality initialized');
    }

    initializeTopologyModule() {
        console.log('Topology module functionality initialized');
    }

    initializeReportsModule() {
        console.log('Reports module functionality initialized');
    }

    initializeSettingsModule() {
        console.log('Settings module functionality initialized');
    }

    /**
     * Получить иконку модуля
     */
    getModuleIcon(moduleId) {
        const icons = {
            'dashboard': 'tachometer-alt',
            'scanner': 'search',
            'attack-constructor': 'hammer',
            'network-topology': 'project-diagram',
            'reports': 'chart-bar',
            'settings': 'cog'
        };
        return icons[moduleId] || 'cube';
    }

    /**
     * Получить название модуля для отображения
     */
    getModuleTitle(moduleId) {
        const titles = {
            'dashboard': 'Панель управления',
            'scanner': 'Модуль сканирования',
            'attack-constructor': 'Конструктор атак',
            'network-topology': 'Топология сети',
            'reports': 'Отчеты и аналитика',
            'settings': 'Настройки системы'
        };
        return titles[moduleId] || moduleId;
    }

    /**
     * Применение пользовательских настроек
     */
    async applyUserSettings() {
        try {
            // Применить тему
            this.applyTheme(this.settings.theme || 'auto');

            // Применить языковые настройки
            this.applyLocale(this.settings.locale || 'ru');

            // Применить настройки уведомлений
            if (this.settings.notifications) {
                this.applyNotificationSettings(this.settings.notifications);
            }

            // Применить настройки автообновления
            if (this.settings.autoRefresh) {
                this.applyAutoRefreshSettings(this.settings.autoRefresh);
            }

            logger.info('⚙️ Пользовательские настройки применены');
        } catch (error) {
            logger.warn('Ошибка применения настроек:', error);
        }
    }

    /**
     * Запуск сервисов
     */
    async startServices() {
        try {
            // Запуск службы мониторинга
            this.startMonitoringService();

            // Запуск службы автосохранения
            this.startAutoSaveService();

            // Запуск службы обновлений
            this.startUpdateService();

            // Запуск службы аналитики
            this.startAnalyticsService();

            logger.info('🔄 Сервисы запущены');
        } catch (error) {
            logger.warn('Ошибка запуска сервисов:', error);
        }
    }

    /**
     * Финализация загрузки
     */
    async finalizeBoot() {
        try {
            // Восстановление состояния приложения
            this.restoreApplicationState();

            // Проверка готовности sidebar
            if (this.components.sidebar) {
                logger.info(`🔧 Sidebar готов: ${this.components.sidebar.isReady()}`);
                logger.info(`🔧 Sidebar состояние:`, this.components.sidebar.getState());
            }

            // Проверка обновлений
            this.checkForUpdates();

            // Отправка события готовности
            this.emit('ready');

            logger.info('🏁 Загрузка завершена');
        } catch (error) {
            logger.warn('Ошибка финализации:', error);
        }
    }

    /**
     * Настройка навигации
     */
    setupNavigation() {
        try {
            this.components.navigation = new NavigationComponent({
                container: '.navigation',
                onTabChange: (tabId) => this.switchTab(tabId)
            });
            logger.debug('Navigation компонент инициализирован');
        } catch (error) {
            logger.warn('Ошибка инициализации навигации:', error);
        }
    }

    /**
     * Настройка header элементов
     */
    setupHeader() {
        // Настройка пользовательского меню
        const userMenu = document.querySelector('.user-menu');
        if (userMenu) {
            userMenu.addEventListener('click', () => this.toggleUserMenu());
        }

        // Настройка кнопки уведомлений
        const notificationBtn = document.querySelector('.notification-btn');
        if (notificationBtn) {
            notificationBtn.addEventListener('click', () => this.toggleNotificationCenter());
        }

        // Настройка кнопки настроек
        const settingsBtn = document.querySelector('.settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => this.openSettingsModal());
        }
    }

    /**
     * Настройка поиска
     */
    setupSearch() {
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.addEventListener('input', debounce((e) => {
                this.handleGlobalSearch(e.target.value);
            }, 300));

            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    this.executeSearch(e.target.value);
                }
            });
        }
    }

    /**
     * Настройка модальных окон
     */
    setupModals() {
        this.components.modals.set('confirm', new ConfirmModal());
        this.components.modals.set('info', new Modal());
        this.components.modals.set('settings', new Modal({
            size: 'large',
            title: 'Настройки системы'
        }));
    }

    /**
     * Настройка drag and drop
     */
    setupDragAndDrop() {
        document.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        document.addEventListener('drop', (e) => {
            e.preventDefault();
            this.handleFileDrop(e);
        });
    }

    /**
     * Настройка контекстного меню
     */
    setupContextMenu() {
        document.addEventListener('contextmenu', (e) => {
            const contextTarget = e.target.closest('[data-context-menu]');
            if (contextTarget) {
                e.preventDefault();
                this.showContextMenu(e, contextTarget);
            }
        });
    }

    /**
     * Настройка UI уведомлений
     */
    setupNotificationUI() {
        // Создание контейнера для уведомлений если не существует
        if (!document.querySelector('.notification-container')) {
            const container = document.createElement('div');
            container.className = 'notification-container';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: ${Z_INDEX.NOTIFICATION};
                pointer-events: none;
            `;
            document.body.appendChild(container);
        }
    }

    /**
     * Инициализация системы уведомлений
     */
    initializeNotificationSystem() {
        this.state.notifications = [];
        this.state.unreadCount = 0;

        // Настройка таймера для старых уведомлений
        this.intervals.set('notificationCleanup', setInterval(() => {
            this.cleanupOldNotifications();
        }, 60000)); // каждую минуту
    }

    /**
     * Показать уведомление
     */
    showNotification(message, type = NOTIFICATION_TYPES.INFO, options = {}) {
        const notification = {
            id: generateUUID(),
            message,
            type,
            timestamp: new Date(),
            duration: options.duration || 5000,
            persistent: options.persistent || false,
            actions: options.actions || []
        };

        this.state.notifications.push(notification);
        this.state.unreadCount++;

        this.displayNotification(notification);
        this.updateNotificationBadge();

        // Автоудаление (если не постоянное)
        if (!notification.persistent) {
            setTimeout(() => {
                this.removeNotification(notification.id);
            }, notification.duration);
        }

        this.emit('notificationAdded', notification);
        return notification;
    }

    /**
     * Отображение уведомления
     */
    displayNotification(notification) {
        const container = document.querySelector('.notification-container');
        if (!container) return;

        const element = document.createElement('div');
        element.className = `notification notification--${notification.type}`;
        element.setAttribute('data-notification-id', notification.id);

        element.innerHTML = `
            <div class="notification__content">
                <div class="notification__message">${notification.message}</div>
                <button class="notification__close" onclick="window.ipRoastApp.removeNotification('${notification.id}')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        // Добавляем анимацию появления
        element.style.transform = 'translateX(100%)';
        element.style.opacity = '0';
        container.appendChild(element);

        // Анимация появления
        requestAnimationFrame(() => {
            element.style.transition = 'all 0.3s ease';
            element.style.transform = 'translateX(0)';
            element.style.opacity = '1';
            element.style.pointerEvents = 'auto';
        });
    }

    /**
     * Удаление уведомления
     */
    removeNotification(id) {
        const element = document.querySelector(`[data-notification-id="${id}"]`);
        if (element) {
            element.style.transform = 'translateX(100%)';
            element.style.opacity = '0';
            setTimeout(() => {
                element.remove();
            }, 300);
        }

        this.state.notifications = this.state.notifications.filter(n => n.id !== id);
        this.updateNotificationBadge();
        this.emit('notificationRemoved', id);
    }

    /**
     * Обновление бейджа уведомлений
     */
    updateNotificationBadge() {
        const badge = document.querySelector('.notification-badge');
        if (badge) {
            const count = this.state.unreadCount;
            badge.textContent = count > 99 ? '99+' : count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        }
    }

    /**
     * Очистка старых уведомлений
     */
    cleanupOldNotifications() {
        const now = new Date();
        const maxAge = 24 * 60 * 60 * 1000; // 24 часа

        this.state.notifications = this.state.notifications.filter(notification => {
            return now - notification.timestamp < maxAge;
        });
    }

    /**
     * Настройка обработчиков ошибок
     */
    setupErrorHandlers() {
        window.addEventListener('error', (event) => {
            logger.error('Глобальная ошибка:', event.error);
            this.handleError(event.error);
        });

        window.addEventListener('unhandledrejection', (event) => {
            logger.error('Необработанное отклонение Promise:', event.reason);
            this.handleError(event.reason);
        });
    }

    /**
     * Настройка системы событий
     */
    setupEventSystem() {
        // Подписка на основные события
        this.on('error', this.handleError);
        this.on('moduleError', this.handleModuleError.bind(this));
        this.on('connectionLost', this.handleConnectionLost.bind(this));
        this.on('connectionRestored', this.handleConnectionRestored.bind(this));
    }

    /**
     * Настройка горячих клавиш
     */
    setupHotkeys() {
        document.addEventListener('keydown', (e) => {
            if (this.isModalOpen() || this.isInputFocused()) {
                return; // Игнорировать горячие клавиши в модальных окнах или полях ввода
            }

            const key = this.getHotkeyString(e);
            const handler = this.hotkeys.get(key);

            if (handler && typeof handler === 'function') {
                e.preventDefault();
                handler();
            }
        });
    }

    /**
     * Получение строки горячей клавиши
     */
    getHotkeyString(event) {
        const keys = [];

        if (event.ctrlKey) keys.push('ctrl');
        if (event.shiftKey) keys.push('shift');
        if (event.altKey) keys.push('alt');

        keys.push(event.key.toLowerCase());

        return keys.join('+');
    }

    /**
     * Проверка открытых модальных окон
     */
    isModalOpen() {
        return document.querySelector('.modal--active') !== null;
    }

    /**
     * Проверка фокуса на полях ввода
     */
    isInputFocused() {
        const activeElement = document.activeElement;
        return activeElement && (
            activeElement.tagName === 'INPUT' ||
            activeElement.tagName === 'TEXTAREA' ||
            activeElement.contentEditable === 'true'
        );
    }

    /**
     * Инициализация WebSocket
     */
    initializeWebSocket() {
        if (!this.settings.enableWebSocket) {
            logger.info('WebSocket отключен в настройках');
            return;
        }

        try {
            // Безопасная инициализация WebSocket
            if (typeof WebSocket !== 'undefined' && this.api && this.api.getWebSocketUrl) {
                const wsUrl = this.api.getWebSocketUrl();
                this.websocket = new WebSocket(wsUrl);

                this.websocket.onopen = () => {
                    logger.info('✅ WebSocket подключен');
                    this.state.connectionStatus = CONNECTION_STATUS.CONNECTED;
                    this.websocketReconnectAttempts = 0;
                    this.emit('connectionRestored');
                };

                this.websocket.onmessage = (event) => {
                    this.handleWebSocketMessage(event);
                };

                this.websocket.onclose = () => {
                    logger.warn('⚠️ WebSocket соединение закрыто');
                    this.state.connectionStatus = CONNECTION_STATUS.DISCONNECTED;
                    this.scheduleWebSocketReconnect();
                    this.emit('connectionLost');
                };

                this.websocket.onerror = (error) => {
                    logger.error('❌ Ошибка WebSocket:', error);
                    this.handleWebSocketError(error);
                };
            } else {
                logger.warn('WebSocket не поддерживается или API недоступен');
            }

        } catch (error) {
            logger.error('Ошибка инициализации WebSocket:', error);
        }
    }

    /**
     * Обработка сообщений WebSocket
     */
    handleWebSocketMessage(event) {
        try {
            const data = JSON.parse(event.data);

            switch (data.type) {
                case WEBSOCKET_EVENTS.SCAN_UPDATE:
                    this.handleScanUpdate(data.payload);
                    break;
                case WEBSOCKET_EVENTS.SYSTEM_ALERT:
                    this.handleSystemAlert(data.payload);
                    break;
                case WEBSOCKET_EVENTS.MODULE_UPDATE:
                    this.handleModuleUpdate(data.payload);
                    break;
                default:
                    logger.debug('Неизвестный тип WebSocket сообщения:', data.type);
            }
        } catch (error) {
            logger.error('Ошибка обработки WebSocket сообщения:', error);
        }
    }

    /**
     * Планирование переподключения WebSocket
     */
    scheduleWebSocketReconnect() {
        if (this.websocketReconnectAttempts >= 5) {
            logger.error('Превышено максимальное количество попыток переподключения WebSocket');
            return;
        }

        const delay = Math.min(1000 * Math.pow(2, this.websocketReconnectAttempts), 30000);
        this.websocketReconnectAttempts++;

        setTimeout(() => {
            logger.info(`Попытка переподключения WebSocket #${this.websocketReconnectAttempts}`);
            this.initializeWebSocket();
        }, delay);
    }

    /**
     * Переключение вкладок
     */
    switchTab(tabId) {
        if (!tabId) {
            logger.warn('Не указан ID вкладки для переключения');
            return;
        }

        try {
            // Обновляем состояние
            const previousTab = this.state.currentTab;
            this.state.currentTab = tabId;

            // Скрываем все вкладки
            const allTabs = document.querySelectorAll('.tab-container');
            allTabs.forEach(tab => {
                tab.classList.remove('active');
            });

            // Показываем нужную вкладку
            const targetTab = document.querySelector(`#${tabId}-container`);
            if (targetTab) {
                targetTab.classList.add('active');
                this.loadModuleIfNeeded(tabId);
                logger.info(`Переключено на вкладку: ${tabId}`);
            }
        } catch (error) {
            logger.error('Ошибка переключения вкладки:', error);
            this.handleError(error);
        }
    }

    /**
     * Динамическая загрузка модуля при необходимости
     */
    async loadModuleIfNeeded(moduleId) {
        try {
            // Проверяем, загружен ли уже модуль
            if (this.state.loadedModules.has(moduleId)) {
                logger.debug(`Модуль ${moduleId} уже загружен`);
                return;
            }

            // Для dashboard модуль уже инициализирован
            if (moduleId === 'dashboard') {
                return;
            }

            logger.info(`Загрузка модуля: ${moduleId}`);

            // Помечаем как загруженный
            this.state.loadedModules.add(moduleId);

            // Инициализируем заглушку для модуля
            const container = document.querySelector(`#${moduleId}-container .tab-content-inner`);
            if (container && !container.hasChildNodes()) {
                await this.initializeModuleStub(moduleId);
            }

        } catch (error) {
            logger.error(`Ошибка загрузки модуля ${moduleId}:`, error);
            this.state.moduleErrors.set(moduleId, error);
        }
    }

    /**
     * Инициализация заглушки модуля
     */
    async initializeModuleStub(moduleId) {
        const container = document.querySelector(`#${moduleId}-container .tab-content-inner`);
        if (!container) return;

        const moduleTitle = this.getModuleTitle(moduleId);
        container.innerHTML = `
        <div class="module-placeholder">
            <div class="module-placeholder-icon">
                <i class="fas fa-cube"></i>
            </div>
            <h3>Модуль "${moduleTitle}"</h3>
            <p>Модуль готов к использованию</p>
            <button class="btn btn--primary" onclick="console.log('Модуль ${moduleId} активирован')">
                Начать работу
            </button>
        </div>
    `;
    }


    /**
     * Программное управление sidebar
     */
    toggleSidebar() {
        if (this.components.sidebar && this.components.sidebar.isReady()) {
            this.components.sidebar.toggle();
        }
    }

    /**
     * Сворачивание sidebar
     */
    collapseSidebar() {
        if (this.components.sidebar && this.components.sidebar.isReady()) {
            this.components.sidebar.collapse();
        }
    }

    /**
     * Разворачивание sidebar
     */
    expandSidebar() {
        if (this.components.sidebar && this.components.sidebar.isReady()) {
            this.components.sidebar.expand();
        }
    }

    /**
     * Обновление бейджей в sidebar
     */
    updateSidebarBadge(tabId, count) {
        if (this.components.sidebar && this.components.sidebar.isReady()) {
            this.components.sidebar.updateBadge(tabId, count);
        }
    }


    /**
     * Обновление прогресса загрузки
     */
    updateLoadingProgress(progress, message) {
        const progressBar = document.querySelector('.loading-progress');
        const progressText = document.querySelector('.loading-text');

        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }

        if (progressText) {
            progressText.textContent = message;
        }

        logger.debug(`Загрузка: ${progress}% - ${message}`);
    }

    /**
     * Скрытие экрана загрузки
     */
    hideLoadingScreen() {
        const loadingScreen = document.querySelector('.loading-screen');
        if (loadingScreen) {
            addClass(loadingScreen, 'loading-screen--hidden');
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }
    }

    /**
     * Применение темы
     */
    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);

        if (theme === 'auto') {
            // Автоматическое определение темы по системным настройкам
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            theme = prefersDark ? 'dark' : 'light';
        }

        Storage.set(STORAGE_KEYS.THEME, theme);
        logger.debug(`Применена тема: ${theme}`);
        this.emit('themeChanged', { theme });
    }

    /**
     * Применение локали
     */
    applyLocale(locale) {
        document.documentElement.setAttribute('lang', locale);
        Storage.set(STORAGE_KEYS.LOCALE, locale);
        logger.debug(`Применена локаль: ${locale}`);
        this.emit('localeChanged', { locale });
    }

    /**
     * Применение настроек уведомлений
     */
    applyNotificationSettings(settings) {
        // Логика применения настроек уведомлений
        logger.debug('Настройки уведомлений применены:', settings);
    }

    /**
     * Применение настроек автообновления
     */
    applyAutoRefreshSettings(enabled) {
        if (enabled) {
            // Запуск автообновления
            this.intervals.set('autoRefresh', setInterval(() => {
                this.refreshCurrentModule();
            }, this.settings.refreshInterval || 30000));
        } else {
            // Остановка автообновления
            const interval = this.intervals.get('autoRefresh');
            if (interval) {
                clearInterval(interval);
                this.intervals.delete('autoRefresh');
            }
        }
        logger.debug(`Автообновление: ${enabled ? 'включено' : 'выключено'}`);
    }

    /**
     * Запуск службы мониторинга
     */
    startMonitoringService() {
        this.intervals.set('monitoring', setInterval(() => {
            this.performSystemCheck();
        }, 30000)); // каждые 30 секунд
    }

    /**
     * Запуск службы автосохранения
     */
    startAutoSaveService() {
        this.intervals.set('autosave', setInterval(() => {
            this.saveApplicationState();
        }, 60000)); // каждую минуту
    }

    /**
     * Запуск службы обновлений
     */
    startUpdateService() {
        this.intervals.set('updates', setInterval(() => {
            this.checkForUpdates();
        }, 3600000)); // каждый час
    }

    /**
     * Запуск службы аналитики
     */
    startAnalyticsService() {
        this.intervals.set('analytics', setInterval(() => {
            this.collectAnalytics();
        }, 300000)); // каждые 5 минут
    }

    /**
     * Выполнение системной проверки
     */
    async performSystemCheck() {
        try {
            if (this.api && this.api.system && this.api.system.getSystemStatus) {
                const status = await this.api.system.getSystemStatus();
                this.updateSystemStatus(status);
            }
        } catch (error) {
            logger.warn('Ошибка проверки системного статуса:', error);
        }
    }

    /**
     * Обновление системного статуса
     */
    updateSystemStatus(status) {
        // Логика обновления статуса системы
        this.emit('systemStatusUpdated', status);
    }

    /**
     * Сохранение состояния приложения
     */
    saveApplicationState() {
        try {
            const state = {
                currentTab: this.state.currentTab,
                loadedModules: Array.from(this.state.loadedModules),
                timestamp: new Date().toISOString(),
                version: this.version
            };

            Storage.set(STORAGE_KEYS.APP_STATE, state);
            logger.debug('Состояние приложения сохранено');
        } catch (error) {
            logger.warn('Ошибка сохранения состояния:', error);
        }
    }

    /**
     * Восстановление состояния приложения
     */
    restoreApplicationState() {
        try {
            const savedState = Storage.get(STORAGE_KEYS.APP_STATE);
            if (savedState && savedState.version === this.version) {
                this.state.currentTab = savedState.currentTab || 'dashboard';
                logger.debug('Состояние приложения восстановлено');
            }
        } catch (error) {
            logger.warn('Ошибка восстановления состояния:', error);
        }
    }

    /**
     * Проверка обновлений
     */
    async checkForUpdates() {
        try {
            if (this.api && this.api.system && this.api.system.checkForUpdates) {
                const updateInfo = await this.api.system.checkForUpdates();
                if (updateInfo && updateInfo.hasUpdate) {
                    this.showUpdateNotification(updateInfo);
                }
            }
        } catch (error) {
            logger.debug('Ошибка проверки обновлений:', error);
        }
    }

    /**
     * Показать уведомление об обновлении
     */
    showUpdateNotification(updateInfo) {
        this.showNotification(
            `Доступно обновление: ${updateInfo.version}`,
            NOTIFICATION_TYPES.INFO,
            { persistent: true }
        );
    }

    /**
     * Сбор аналитики
     */
    collectAnalytics() {
        try {
            const analytics = {
                timestamp: new Date().toISOString(),
                currentTab: this.state.currentTab,
                loadedModules: Array.from(this.state.loadedModules),
                userAgent: navigator.userAgent,
                version: this.version
            };

            // Отправка аналитики (безопасно)
            if (this.api && this.api.analytics && this.api.analytics.sendAnalytics) {
                this.api.analytics.sendAnalytics(analytics).catch(error => {
                    logger.debug('Ошибка отправки аналитики:', error);
                });
            }
        } catch (error) {
            logger.debug('Ошибка сбора аналитики:', error);
        }
    }

    /**
     * Обновление текущего модуля
     */
    refreshCurrentModule() {
        const moduleController = this.modules.get(this.state.currentTab);
        if (moduleController && typeof moduleController.refresh === 'function') {
            moduleController.refresh();
        }

        logger.info(`Обновление модуля: ${this.state.currentTab}`);
        this.emit('moduleRefreshed', { module: this.state.currentTab });
    }

    /**
     * Показать диалог помощи
     */
    showHelpDialog() {
        const modal = this.components.modals.get('info');
        if (modal) {
            modal.show({
                title: 'Справка',
                content: this.getHelpContent(),
                size: 'large'
            });
        }
    }

    /**
     * Получить содержимое справки
     */
    getHelpContent() {
        return `
            <div class="help-content">
                <h3>Горячие клавиши</h3>
                <ul>
                    <li><kbd>Ctrl+Shift+R</kbd> - Обновить текущий модуль</li>
                    <li><kbd>Ctrl+/</kbd> - Показать справку</li>
                    <li><kbd>Esc</kbd> - Закрыть модальные окна</li>
                    <li><kbd>F5</kbd> - Обновить модуль</li>
                </ul>
                
                <h3>О приложении</h3>
                <p>IP Roast Enterprise ${this.version}</p>
                <p>Дата сборки: ${formatDate(this.buildDate)}</p>
            </div>
        `;
    }

    /**
     * Закрыть все модальные окна
     */
    closeModals() {
        this.components.modals.forEach(modal => {
            if (modal.isOpen && modal.isOpen()) {
                modal.close();
            }
        });
    }

    /**
     * Показать центр уведомлений
     */
    showNotificationCenter() {
        // Логика показа центра уведомлений
        logger.debug('Показ центра уведомлений');
    }

    /**
     * Переключение центра уведомлений
     */
    toggleNotificationCenter() {
        // Логика переключения центра уведомлений
        logger.debug('Переключение центра уведомлений');
    }

    /**
     * Переключение пользовательского меню
     */
    toggleUserMenu() {
        const userMenu = document.querySelector('.user-menu-dropdown');
        if (userMenu) {
            toggleClass(userMenu, 'active');
        }
    }

    /**
     * Открытие модального окна настроек
     */
    openSettingsModal() {
        const modal = this.components.modals.get('settings');
        if (modal) {
            modal.show();
        }
    }

    /**
     * Обработка глобального поиска
     */
    handleGlobalSearch(query) {
        if (query.length > 2) {
            logger.debug(`Поиск: ${query}`);
            this.emit('search', { query });
        }
    }

    /**
     * Выполнение поиска
     */
    executeSearch(query) {
        logger.info(`Выполнение поиска: ${query}`);
        // Логика выполнения поиска
    }

    /**
     * Обработка drop файлов
     */
    handleFileDrop(event) {
        const files = Array.from(event.dataTransfer.files);
        logger.debug('Файлы перетащены:', files.map(f => f.name));
        // Логика обработки файлов
    }

    /**
     * Показать контекстное меню
     */
    showContextMenu(event, target) {
        logger.debug('Показ контекстного меню для:', target);
        // Логика показа контекстного меню
    }

    /**
     * Обработка изменения размера окна
     */
    handleResize() {
        logger.debug('Изменение размера окна');
        this.emit('resize', {
            width: window.innerWidth,
            height: window.innerHeight
        });
    }

    /**
     * Обработка нажатий клавиш
     */
    handleKeydown(event) {
        // Логика обработки специальных клавиш
        if (event.key === 'F12') {
            logger.debug('F12 нажата');
        }
    }

    /**
     * Обработка ошибок модулей
     */
    handleModuleError(error) {
        logger.error('Ошибка модуля:', error);
        this.showNotification(
            `Ошибка модуля: ${error.module || 'неизвестно'}`,
            NOTIFICATION_TYPES.ERROR
        );
    }

    /**
     * Обработка потери соединения
     */
    handleConnectionLost() {
        logger.warn('Соединение потеряно');
        this.showNotification(
            'Соединение с сервером потеряно',
            NOTIFICATION_TYPES.WARNING,
            { persistent: true }
        );
    }

    /**
     * Обработка восстановления соединения
     */
    handleConnectionRestored() {
        logger.info('Соединение восстановлено');
        this.showNotification(
            'Соединение с сервером восстановлено',
            NOTIFICATION_TYPES.SUCCESS
        );
    }

    /**
     * Обработка обновления сканирования
     */
    handleScanUpdate(payload) {
        logger.debug('Обновление сканирования:', payload);
        this.emit('scanUpdate', payload);
    }

    /**
     * Обработка системного оповещения
     */
    handleSystemAlert(payload) {
        logger.warn('Системное оповещение:', payload);
        this.showNotification(
            payload.message || 'Системное оповещение',
            NOTIFICATION_TYPES.WARNING
        );
    }

    /**
     * Обработка обновления модуля
     */
    handleModuleUpdate(payload) {
        logger.debug('Обновление модуля:', payload);
        this.emit('moduleUpdate', payload);
    }

    /**
     * Обработка ошибок WebSocket
     */
    handleWebSocketError(error) {
        logger.error('Ошибка WebSocket:', error);
    }

    /**
     * Обработка критических ошибок
     */
    handleCriticalError(error) {
        logger.error('💥 Критическая ошибка приложения:', error);

        // Показать экран критической ошибки
        this.showCriticalErrorScreen(error);

        // Попытаться отправить отчет об ошибке (безопасно)
        this.sendErrorReport(error);
    }

    /**
     * Показать экран критической ошибки
     */
    showCriticalErrorScreen(error) {
        document.body.innerHTML = `
            <div class="critical-error-screen" style="
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                padding: 2rem;
                background: #f8f9fa;
                font-family: system-ui, sans-serif;
            ">
                <div class="critical-error-content" style="
                    text-align: center;
                    max-width: 600px;
                    background: white;
                    padding: 3rem;
                    border-radius: 8px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                ">
                    <div class="error-icon" style="font-size: 4rem; color: #dc3545; margin-bottom: 1rem;">
                        ⚠️
                    </div>
                    <h1 style="color: #343a40; margin-bottom: 1rem;">Критическая ошибка приложения</h1>
                    <p class="error-message" style="color: #6c757d; margin-bottom: 1rem;">${error.message}</p>
                    <p class="error-details" style="color: #6c757d; margin-bottom: 2rem;">
                        Приложение не может продолжить работу. Пожалуйста, перезагрузите страницу.
                    </p>
                    <div class="error-actions">
                        <button class="btn btn--primary" onclick="location.reload()" style="
                            background: #007bff;
                            color: white;
                            border: none;
                            padding: 0.75rem 1.5rem;
                            border-radius: 4px;
                            cursor: pointer;
                            margin-right: 1rem;
                        ">
                            🔄 Перезагрузить приложение
                        </button>
                        <button class="btn btn--secondary" onclick="console.log('Отчет об ошибке:', '${error.message}')" style="
                            background: #6c757d;
                            color: white;
                            border: none;
                            padding: 0.75rem 1.5rem;
                            border-radius: 4px;
                            cursor: pointer;
                        ">
                            🐛 Показать детали ошибки
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * ИСПРАВЛЕННАЯ отправка отчета об ошибке
     */
    async sendErrorReport(error) {
        try {
            // Безопасная отправка отчета
            const errorReport = {
                error: error.message,
                stack: error.stack,
                timestamp: new Date().toISOString(),
                version: this.version,
                userAgent: navigator.userAgent,
                currentTab: this.state.currentTab,
                loadedModules: Array.from(this.state.loadedModules)
            };

            // Проверяем доступность API и метода
            if (this.api &&
                this.api.system &&
                typeof this.api.system.sendErrorReport === 'function') {

                await this.api.system.sendErrorReport(errorReport);
                logger.info('✅ Отчет об ошибке отправлен');
            } else {
                // Если API недоступен, сохраняем локально
                logger.warn('API недоступен, сохраняем отчет локально');
                Storage.set('errorReport_' + Date.now(), errorReport);
            }

        } catch (reportError) {
            logger.error('Ошибка отправки отчета об ошибке:', reportError.message);

            // Сохраняем отчет локально как fallback
            try {
                const errorReport = {
                    originalError: error.message,
                    reportError: reportError.message,
                    timestamp: new Date().toISOString()
                };
                Storage.set('failedErrorReport_' + Date.now(), errorReport);
            } catch (storageError) {
                console.error('Невозможно сохранить отчет об ошибке:', storageError);
            }
        }
    }

    /**
     * Обработка обычных ошибок
     */
    handleError(error) {
        logger.error('⚠️ Ошибка приложения:', error);
        this.showNotification(
            `Ошибка: ${error.message}`,
            NOTIFICATION_TYPES.ERROR,
            { duration: 10000 }
        );
    }

    /**
 * Уничтожение приложения
 */
    destroy() {
        logger.info('🗑️ Уничтожение приложения...');

        // Очистка интервалов
        this.intervals.forEach((interval, key) => {
            clearInterval(interval);
            logger.debug(`Интервал ${key} очищен`);
        });

        // Очистка таймаутов
        this.timeouts.forEach((timeout, key) => {
            clearTimeout(timeout);
            logger.debug(`Таймаут ${key} очищен`);
        });

        // Закрытие WebSocket
        if (this.websocket) {
            this.websocket.close();
            logger.debug('WebSocket соединение закрыто');
        }

        // Уничтожение модулей
        this.modules.forEach((module, id) => {
            if (typeof module.destroy === 'function') {
                module.destroy();
                logger.debug(`Модуль ${id} уничтожен`);
            }
        });

        // Уничтожение компонентов UI (включая sidebar)
        if (this.components.sidebar && typeof this.components.sidebar.destroy === 'function') {
            this.components.sidebar.destroy();
            logger.debug('Sidebar компонент уничтожен');
        }

        Object.values(this.components).forEach(component => {
            if (component && typeof component.destroy === 'function') {
                component.destroy();
            }
        });

        // Удаление всех слушателей событий
        this.removeAllListeners();

        logger.info('✅ Приложение успешно уничтожено');
    }
}

// Глобальная инициализация
window.ipRoastApp = null;

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.ipRoastApp = new IPRoastEnterpriseApp();

        // Глобальный доступ для отладки в development режиме
        if (localStorage.getItem('debug') === 'true') {
            window.app = window.ipRoastApp;
            window.logger = logger;
        }

    } catch (error) {
        console.error('❌ Критическая ошибка инициализации приложения:', error);

        // Показать базовую ошибку если все сломано
        document.body.innerHTML = `
            <div style="
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                font-family: system-ui, sans-serif;
                background: #f8f9fa;
            ">
                <div style="text-align: center; padding: 2rem;">
                    <h1 style="color: #dc3545;">Ошибка загрузки приложения</h1>
                    <p style="color: #6c757d;">${error.message}</p>
                    <button onclick="location.reload()" style="
                        background: #007bff;
                        color: white;
                        border: none;
                        padding: 0.75rem 1.5rem;
                        border-radius: 4px;
                        cursor: pointer;
                    ">Перезагрузить</button>
                </div>
            </div>
        `;
    }
});

// Экспорт для модульной системы
export default IPRoastEnterpriseApp;
