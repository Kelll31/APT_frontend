/**
 * IP Roast Enterprise 4.0 - Fixed Main Application
 * Исправленное ядро приложения с полной функциональностью
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
} from './shared/utils/constants.js';

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
} from './shared/utils/helpers.js';

import { IPRoastAPI } from './shared/utils/api.js';

// Импорт компонентов
import { NavigationComponent } from './shared/components/navigation.js';
import { Modal, ConfirmModal } from './shared/components/modals.js';
import { Button, Spinner } from './shared/components/common.js';

// Импорт контроллеров модулей
import { DashboardController } from './dashboard/dashboard.js';

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
            sidebarCollapsed: false,
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
            sidebar: null,
            modals: new Map(),
            notifications: null
        };

        // WebSocket подключение
        this.websocket = null;
        this.websocketReconnectAttempts = 0;

        // API клиент
        this.api = IPRoastAPI;

        // Горячие клавиши
        this.hotkeys = new Map([
            ['ctrl+1', () => this.switchTab('dashboard')],
            ['ctrl+2', () => this.switchTab('scanner')],
            ['ctrl+3', () => this.switchTab('attack-constructor')],
            ['ctrl+4', () => this.switchTab('network-topology')],
            ['ctrl+5', () => this.switchTab('reports')],
            ['ctrl+6', () => this.switchTab('settings')],
            ['ctrl+shift+r', () => this.refreshCurrentModule()],
            ['ctrl+/', () => this.showHelpDialog()],
            ['escape', () => this.closeModals()]
        ]);

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

            // Инициализация WebSocket
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
            // Инициализация навигации
            this.setupNavigation();

            // Настройка sidebar
            this.setupSidebar();

            // Настройка header элементов
            this.setupHeader();

            // Настройка поиска
            this.setupSearch();

            // Настройка модальных окон
            this.setupModals();

            // Автоматическое открытие dashboard
            setTimeout(() => {
                this.switchTab('dashboard');
            }, 100);

            logger.info('🎨 Пользовательский интерфейс настроен');
        } catch (error) {
            throw createError('Ошибка настройки UI: ' + error.message, 500, 'UI_SETUP_ERROR');
        }
    }

    /**
     * Инициализация всех модулей
     */
    async initializeModules() {
        try {
            // 1. Dashboard (основной модуль, загружается сразу)
            logger.info('📊 Инициализация Dashboard...');
            const dashboardController = new DashboardController({
                container: '#dashboard-container .tab-content-inner',
                autoRefresh: this.settings.autoRefresh,
                refreshInterval: this.settings.refreshInterval,
                enableWebSocket: this.settings.enableWebSocket
            });

            this.modules.set('dashboard', dashboardController);
            this.state.loadedModules.add('dashboard');

            // 2. Остальные модули загружаем по требованию, но подготавливаем заглушки
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
                <button data-module="${id}">Загрузить ${this.getModuleTitle(id)}</button>
              </div>
            `;
                container.querySelector('button').addEventListener('click', () => {
                    this.loadStaticModule(id, container);
                });
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
            const response = await fetch(`pages/${moduleId}.html`);

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

            // Инициализируем функциональность модуля, если есть
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
     * Динамическая загрузка модуля
     */
    async loadModule(moduleId) {
        if (this.state.loadedModules.has(moduleId)) {
            return this.modules.get(moduleId);
        }

        const container = document.querySelector(`#${moduleId}-container .tab-content-inner`);
        if (!container) {
            logger.warn(`Container for module ${moduleId} not found`);
            return null;
        }

        try {
            // Показать спиннер загрузки
            this.showModuleLoading(container);

            let moduleController = null;

            switch (moduleId) {
                case 'scanner':
                    const { ScannerController } = await import('./scanner/scanner.js');
                    moduleController = new ScannerController({
                        container: `#${moduleId}-container .tab-content-inner`
                    });
                    break;

                case 'attack-constructor':
                    const { AttackModuleConstructor } = await import('./attack-constructor/AttackModuleConstructor.js');
                    moduleController = new AttackModuleConstructor({
                        container: `#${moduleId}-container .tab-content-inner`
                    });
                    break;

                case 'network-topology':
                    await this.loadNetworkTopologyModule(container);
                    break;

                case 'reports':
                    const { ReportsController } = await import('./reports/reports.js');
                    moduleController = new ReportsController({
                        container: `#${moduleId}-container .tab-content-inner`
                    });
                    break;

                case 'settings':
                    const { SettingsController } = await import('./settings/settings.js');
                    moduleController = new SettingsController(
                        `#${moduleId}-container .tab-content-inner`
                    );
                    break;

                default:
                    throw new Error(`Unknown module: ${moduleId}`);
            }

            if (moduleController) {
                this.modules.set(moduleId, moduleController);
                this.state.loadedModules.add(moduleId);
                this.state.moduleErrors.delete(moduleId);

                logger.info(`✅ Модуль ${moduleId} загружен`);
                this.showNotification(
                    `Модуль "${this.getModuleTitle(moduleId)}" загружен`,
                    NOTIFICATION_TYPES.INFO
                );

                this.emit('moduleLoaded', { moduleId, moduleController });
            }

            return moduleController;

        } catch (error) {
            logger.error(`❌ Ошибка загрузки модуля ${moduleId}:`, error);
            this.state.moduleErrors.set(moduleId, error);
            this.showModuleError(container, error.message);
            this.showNotification(
                ERROR_MESSAGES.MODULE_LOAD_ERROR + `: ${moduleId}`,
                NOTIFICATION_TYPES.ERROR
            );
            throw error;
        }
    }

    /**
     * Загрузка модуля топологии сети
     */
    async loadNetworkTopologyModule(container) {
        container.innerHTML = `
            <div class="topology-loading">
                <div class="topology-loading__content">
                    <h3>🌐 Визуализация топологии сети</h3>
                    <p>Загрузка модуля...</p>
                    <div class="spinner-lg"></div>
                </div>
            </div>
        `;

        // Симуляция загрузки
        await delay(1000);

        const { TopologyViewer } = await import('./network-topology/topology-viewer.js');
        const topologyViewer = new TopologyViewer(container);
        return topologyViewer;
    }

    /**
     * Показать спиннер загрузки модуля
     */
    showModuleLoading(container) {
        container.innerHTML = `
            <div class="module-loading">
                <div class="module-loading__content">
                    <div class="spinner-lg"></div>
                    <h3>Загрузка модуля...</h3>
                    <p>Пожалуйста, подождите</p>
                </div>
            </div>
        `;
    }

    /**
     * Показать ошибку загрузки модуля
     */
    showModuleError(container, message) {
        container.innerHTML = `
            <div class="module-error">
                <div class="module-error__content">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Ошибка загрузки модуля</h3>
                    <p>${message}</p>
                    <button class="btn btn--primary" onclick="location.reload()">
                        Перезагрузить страницу
                    </button>
                </div>
            </div>
        `;
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
            // Применение темы
            this.applyTheme(this.settings.theme);

            // Применение языка
            this.setLanguage(this.settings.language);

            // Состояние sidebar
            if (this.settings.sidebarCollapsed) {
                this.collapseSidebar();
            }

            // Активация текущей вкладки
            const savedTab = Storage.get(STORAGE_KEYS.CURRENT_TAB, 'dashboard');
            this.switchTab(savedTab);

            logger.info('⚙️ Пользовательские настройки применены');
        } catch (error) {
            logger.warn('Ошибка применения настроек:', error);
        }
    }

    /**
     * Запуск фоновых сервисов
     */
    async startServices() {
        try {
            // Запуск автообновления
            if (this.settings.autoRefresh) {
                this.startAutoRefresh();
            }

            // Запуск WebSocket
            if (this.settings.enableWebSocket) {
                this.connectWebSocket();
            }

            // Запуск мониторинга активности
            this.startActivityMonitoring();

            // Запуск системы уведомлений
            this.startNotificationSystem();

            logger.info('🔄 Фоновые сервисы запущены');
        } catch (error) {
            logger.warn('Ошибка запуска сервисов:', error);
        }
    }

    /**
     * Финализация загрузки
     */
    async finalizeBoot() {
        try {
            // Применение анимаций
            if (this.settings.enableAnimations) {
                document.body.classList.add('animations-enabled');
            }

            // Очистка старых данных
            this.cleanupOldData();

            // Регистрация Service Worker
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('/sw.js').catch(error => {
                    logger.warn('SW registration failed:', error);
                });
            }

            // Отправка события готовности
            this.emit('ready');
            logger.info('🎯 Финализация завершена');
        } catch (error) {
            logger.warn('Ошибка финализации:', error);
        }
    }

    /**
     * Инициализация системы уведомлений
     */
    initializeNotificationSystem() {
        // Создание контейнера для уведомлений
        if (!document.querySelector('.notification-container')) {
            const container = document.createElement('div');
            container.className = 'notification-container';
            container.style.cssText = `
                position: fixed;
                top: 80px;
                right: 24px;
                z-index: ${Z_INDEX.TOAST};
                display: flex;
                flex-direction: column;
                gap: 12px;
                max-width: 400px;
            `;
            document.body.appendChild(container);
            this.components.notifications = container;
        }
    }

    /**
     * Настройка обработчиков ошибок
     */
    setupErrorHandlers() {
        // Глобальные ошибки JavaScript
        window.addEventListener('error', (event) => {
            logger.error('Global error:', event.error);
            this.handleError(event.error, 'Global Error');
        });

        // Необработанные промисы
        window.addEventListener('unhandledrejection', (event) => {
            logger.error('Unhandled promise rejection:', event.reason);
            this.handleError(event.reason, 'Unhandled Promise');
            event.preventDefault();
        });
    }

    /**
     * Настройка системы событий
     */
    setupEventSystem() {
        // Слушаем события приложения
        this.on('error', (error) => {
            this.showNotification(error.message, NOTIFICATION_TYPES.ERROR);
        });

        this.on('warning', (message) => {
            this.showNotification(message, NOTIFICATION_TYPES.WARNING);
        });

        this.on('success', (message) => {
            this.showNotification(message, NOTIFICATION_TYPES.SUCCESS);
        });

        this.on('info', (message) => {
            this.showNotification(message, NOTIFICATION_TYPES.INFO);
        });
    }

    /**
     * Настройка горячих клавиш
     */
    setupHotkeys() {
        if (!this.settings.enableHotkeys) return;

        document.addEventListener('keydown', (event) => {
            const key = [];
            if (event.ctrlKey) key.push('ctrl');
            if (event.shiftKey) key.push('shift');
            if (event.altKey) key.push('alt');
            key.push(event.key.toLowerCase());

            const combo = key.join('+');
            const handler = this.hotkeys.get(combo);

            if (handler) {
                event.preventDefault();
                handler();
            }
        });
    }

    /**
     * Инициализация WebSocket
     */
    initializeWebSocket() {
        if (!this.settings.enableWebSocket) return;

        try {
            const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`;
            this.websocket = new WebSocket(wsUrl);

            this.websocket.onopen = () => {
                logger.info('🔌 WebSocket подключен');
                this.state.connectionStatus = CONNECTION_STATUS.CONNECTED;
                this.websocketReconnectAttempts = 0;
                this.emit('websocketConnected');
                this.updateConnectionStatus();
            };

            this.websocket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleWebSocketMessage(data);
                } catch (error) {
                    logger.error('Ошибка парсинга WebSocket сообщения:', error);
                }
            };

            this.websocket.onclose = () => {
                logger.warn('🔌 WebSocket отключен');
                this.state.connectionStatus = CONNECTION_STATUS.DISCONNECTED;
                this.emit('websocketDisconnected');
                this.updateConnectionStatus();
                this.scheduleWebSocketReconnect();
            };

            this.websocket.onerror = (error) => {
                logger.error('🔌 Ошибка WebSocket:', error);
                this.state.connectionStatus = CONNECTION_STATUS.ERROR;
                this.emit('websocketError', error);
                this.updateConnectionStatus();
            };

        } catch (error) {
            logger.error('Ошибка инициализации WebSocket:', error);
        }
    }

    /**
     * Подключение WebSocket
     */
    connectWebSocket() {
        if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
            return;
        }

        this.state.connectionStatus = CONNECTION_STATUS.CONNECTING;
        this.updateConnectionStatus();
        this.initializeWebSocket();
    }

    /**
     * Планирование переподключения WebSocket
     */
    scheduleWebSocketReconnect() {
        if (this.websocketReconnectAttempts >= 10) {
            logger.error('Максимальное количество попыток переподключения WebSocket превышено');
            return;
        }

        this.websocketReconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, this.websocketReconnectAttempts), 30000);

        setTimeout(() => {
            if (this.settings.enableWebSocket) {
                logger.info(`Попытка переподключения WebSocket #${this.websocketReconnectAttempts}`);
                this.state.connectionStatus = CONNECTION_STATUS.RECONNECTING;
                this.updateConnectionStatus();
                this.connectWebSocket();
            }
        }, delay);
    }

    /**
     * Обработка WebSocket сообщений
     */
    handleWebSocketMessage(data) {
        const { type, payload } = data;

        switch (type) {
            case WEBSOCKET_EVENTS.SCAN_UPDATE:
                this.emit('scanUpdate', payload);
                break;

            case WEBSOCKET_EVENTS.DEVICE_DISCOVERED:
                this.emit('deviceDiscovered', payload);
                this.showNotification(`Обнаружено новое устройство: ${payload.ip}`, NOTIFICATION_TYPES.INFO);
                break;

            case WEBSOCKET_EVENTS.VULNERABILITY_FOUND:
                this.emit('vulnerabilityFound', payload);
                this.showNotification(`Найдена уязвимость: ${payload.title}`, NOTIFICATION_TYPES.WARNING);
                break;

            case WEBSOCKET_EVENTS.SYSTEM_ALERT:
                this.emit('systemAlert', payload);
                this.showNotification(payload.message, NOTIFICATION_TYPES.ERROR);
                break;

            default:
                logger.debug('Неизвестный тип WebSocket сообщения:', type);
        }
    }

    /**
     * Настройка sidebar
     */
    setupSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const toggleBtn = document.querySelector('.sidebar-toggle');

        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                this.toggleSidebar();
            });
        }

        // Автоскрытие на мобильных
        if (window.innerWidth <= 768) {
            this.collapseSidebar();
        }
    }

    /**
     * Настройка header элементов
     */
    setupHeader() {
        // Кнопка уведомлений
        const notificationBtn = document.querySelector('.notification-btn');
        if (notificationBtn) {
            notificationBtn.addEventListener('click', () => {
                this.toggleNotificationPanel();
            });
        }

        // Кнопка смены темы
        const themeBtn = document.querySelector('.theme-btn');
        if (themeBtn) {
            themeBtn.addEventListener('click', () => {
                this.toggleTheme();
            });
        }

        // Кнопка пользователя
        const userBtn = document.querySelector('.user-btn');
        if (userBtn) {
            userBtn.addEventListener('click', () => {
                this.showUserMenu();
            });
        }
    }

    /**
     * Настройка поиска
     */
    setupSearch() {
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            const debouncedSearch = debounce((query) => {
                this.performSearch(query);
            }, 300);

            searchInput.addEventListener('input', (e) => {
                debouncedSearch(e.target.value);
            });
        }
    }

    /**
     * Настройка модальных окон
     */
    setupModals() {
        // Закрытие модалов по ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModals();
            }
        });

        // Закрытие модалов по клику вне
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModals();
            }
        });
    }

    /**
     * Настройка навигации
     */
    setupNavigation() {
        // Обработка кликов по навигационным элементам
        document.querySelectorAll('.nav-item[data-tab]').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const tabId = item.dataset.tab;
                this.switchTab(tabId);
            });
        });

        // Обработка кнопок загрузки модулей
        document.querySelectorAll('.module-load-btn[data-module]').forEach(button => {
            button.addEventListener('click', async (e) => {
                const moduleId = button.dataset.module;
                await this.loadStaticModule(moduleId, button);
            });
        });

        logger.info('🧭 Навигация настроена');
    }

    /**
     * Переключение вкладок
     */

    switchTab(tabId) {
        logger.info(`🔄 Переключение на таб: ${tabId}`);

        // Удаляем активные классы у всех элементов навигации
        document.querySelectorAll('.nav-item').forEach(item => {
            removeClass(item, 'active');
        });

        // Скрываем все контейнеры табов
        document.querySelectorAll('.tab-container').forEach(container => {
            removeClass(container, 'active');
            container.style.display = 'none';
        });

        // Активируем выбранный таб в навигации
        const activeNavItem = document.querySelector(`.nav-item[data-tab="${tabId}"]`);
        if (activeNavItem) {
            addClass(activeNavItem, 'active');
        }

        // Показываем соответствующий контейнер
        const targetContainer = document.getElementById(`${tabId}-container`);
        if (targetContainer) {
            addClass(targetContainer, 'active');
            targetContainer.style.display = 'block';

            // Автоматическая загрузка dashboard при первом открытии
            if (tabId === 'dashboard' && !this.state.loadedModules.has('dashboard')) {
                this.loadDashboardContent();
            }
        }

        // Обновляем состояние
        this.state.currentTab = tabId;
        this.emit('tabChanged', { tabId });

        // Сохраняем в localStorage
        Storage.set(STORAGE_KEYS.CURRENT_TAB, tabId);
    }

    /**
 * Загрузка содержимого dashboard
 */
    async loadDashboardContent() {
        const container = document.querySelector('#dashboard-container .tab-content-inner');
        if (!container) return;

        try {
            // Загружаем dashboard из pages/ или используем модуль dashboard
            const response = await fetch('pages/dashboard.html');

            if (response.ok) {
                const html = await response.text();
                container.innerHTML = html;
            } else {
                // Fallback к статическому содержимому
                container.innerHTML = `
                <div class="dashboard-content">
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-icon"><i class="fas fa-network-wired"></i></div>
                            <div class="stat-info">
                                <h3>Активные устройства</h3>
                                <div class="stat-value">247</div>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon"><i class="fas fa-exclamation-triangle"></i></div>
                            <div class="stat-info">
                                <h3>Критические уязвимости</h3>
                                <div class="stat-value">12</div>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon"><i class="fas fa-shield-alt"></i></div>
                            <div class="stat-info">
                                <h3>Защищенные хосты</h3>
                                <div class="stat-value">235</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="dashboard-widgets">
                        <div class="widget-grid">
                            <div class="widget">
                                <h3>Статус сети</h3>
                                <p>Все системы работают нормально</p>
                            </div>
                            <div class="widget">
                                <h3>Последние события</h3>
                                <p>Нет новых событий безопасности</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            }

            this.state.loadedModules.add('dashboard');
            logger.info('✅ Dashboard загружен');

        } catch (error) {
            logger.error('❌ Ошибка загрузки dashboard:', error);
            container.innerHTML = `
            <div class="module-error">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Ошибка загрузки панели управления</h3>
                <p>${error.message}</p>
            </div>
        `;
        }
    }


    /**
     * Переключение sidebar
     */
    toggleSidebar() {
        this.state.sidebarCollapsed = !this.state.sidebarCollapsed;

        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            toggleClass(sidebar, 'collapsed');
        }

        // Сохранить состояние
        this.settings.sidebarCollapsed = this.state.sidebarCollapsed;
        Storage.set(STORAGE_KEYS.SETTINGS, this.settings);

        this.emit('sidebarToggled', this.state.sidebarCollapsed);
    }

    /**
     * Свернуть sidebar
     */
    collapseSidebar() {
        this.state.sidebarCollapsed = true;
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            addClass(sidebar, 'collapsed');
        }
    }

    /**
     * Развернуть sidebar
     */
    expandSidebar() {
        this.state.sidebarCollapsed = false;
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            removeClass(sidebar, 'collapsed');
        }
    }

    /**
     * Показать уведомление
     */
    showNotification(message, type = NOTIFICATION_TYPES.INFO, duration = 5000) {
        const container = this.components.notifications;
        if (!container) return;

        const notification = document.createElement('div');
        const id = generateUUID();
        notification.className = `notification notification-${type}`;
        notification.dataset.id = id;

        notification.innerHTML = `
            <div class="notification-icon">
                <i class="fas ${this.getNotificationIcon(type)}"></i>
            </div>
            <div class="notification-content">
                <div class="notification-message">${message}</div>
                <div class="notification-time">${formatDate(new Date(), 'HH:mm:ss')}</div>
            </div>
            <button class="notification-close" type="button">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Обработчик закрытия
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            this.hideNotification(id);
        });

        // Показать уведомление
        container.appendChild(notification);
        setTimeout(() => addClass(notification, 'notification-show'), 10);

        // Автоскрытие
        if (duration > 0) {
            this.timeouts.set(id, setTimeout(() => {
                this.hideNotification(id);
            }, duration));
        }

        // Добавить в историю
        this.state.notifications.unshift({
            id,
            message,
            type,
            timestamp: new Date(),
            read: false
        });

        // Ограничить количество
        if (this.state.notifications.length > this.settings.maxNotifications) {
            this.state.notifications = this.state.notifications.slice(0, this.settings.maxNotifications);
        }

        this.state.unreadCount++;
        this.updateNotificationBadge();

        this.emit('notificationShown', { id, message, type });
    }

    /**
     * Скрыть уведомление
     */
    hideNotification(id) {
        const notification = document.querySelector(`[data-id="${id}"]`);
        if (notification) {
            removeClass(notification, 'notification-show');
            addClass(notification, 'notification-hide');
            setTimeout(() => notification.remove(), 300);
        }

        // Очистить таймер
        if (this.timeouts.has(id)) {
            clearTimeout(this.timeouts.get(id));
            this.timeouts.delete(id);
        }

        this.emit('notificationHidden', { id });
    }

    /**
     * Получить иконку для уведомления
     */
    getNotificationIcon(type) {
        const icons = {
            [NOTIFICATION_TYPES.SUCCESS]: 'fa-check-circle',
            [NOTIFICATION_TYPES.ERROR]: 'fa-exclamation-circle',
            [NOTIFICATION_TYPES.WARNING]: 'fa-exclamation-triangle',
            [NOTIFICATION_TYPES.INFO]: 'fa-info-circle'
        };
        return icons[type] || icons[NOTIFICATION_TYPES.INFO];
    }

    /**
     * Обновить индикатор уведомлений
     */
    updateNotificationBadge() {
        const badge = document.querySelector('.notification-badge');
        if (badge) {
            if (this.state.unreadCount > 0) {
                badge.textContent = this.state.unreadCount > 99 ? '99+' : this.state.unreadCount;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        }
    }

    /**
     * Переключение темы
     */
    toggleTheme() {
        const currentTheme = this.settings.theme;
        const newTheme = currentTheme === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT;
        this.applyTheme(newTheme);
    }

    /**
     * Применение темы
     */
    applyTheme(theme) {
        this.settings.theme = theme;
        document.documentElement.setAttribute('data-theme', theme);

        // Сохранить настройки
        Storage.set(STORAGE_KEYS.SETTINGS, this.settings);
        Storage.set(STORAGE_KEYS.THEME, theme);

        this.emit('themeChanged', theme);
        logger.debug(`Тема изменена на: ${theme}`);
    }

    /**
     * Установка языка
     */
    setLanguage(language) {
        this.settings.language = language;
        document.documentElement.lang = language;

        // Сохранить настройки
        Storage.set(STORAGE_KEYS.SETTINGS, this.settings);
        Storage.set(STORAGE_KEYS.LANGUAGE, language);

        this.emit('languageChanged', language);
        logger.debug(`Язык изменен на: ${language}`);
    }

    /**
     * Обновление статуса подключения
     */
    updateConnectionStatus() {
        const statusElement = document.querySelector('.connection-status');
        const indicatorElement = document.querySelector('.status-indicator');
        const textElement = document.querySelector('.status-text');

        if (statusElement && indicatorElement && textElement) {
            // Обновить индикатор
            indicatorElement.className = `status-indicator status-${this.state.connectionStatus}`;

            // Обновить текст
            const statusTexts = {
                [CONNECTION_STATUS.CONNECTED]: 'Подключено',
                [CONNECTION_STATUS.DISCONNECTED]: 'Отключено',
                [CONNECTION_STATUS.CONNECTING]: 'Подключение...',
                [CONNECTION_STATUS.RECONNECTING]: 'Переподключение...',
                [CONNECTION_STATUS.ERROR]: 'Ошибка'
            };

            textElement.textContent = statusTexts[this.state.connectionStatus] || 'Неизвестно';
        }
    }

    /**
     * Обновление прогресса загрузки
     */
    updateLoadingProgress(percent, message) {
        const bar = document.querySelector('.loading-progress-bar');
        const text = document.querySelector('.loading-text');
        if (bar) {
            bar.style.width = `${Math.min(Math.max(percent, 0), 100)}%`;
        }
        if (text && message) {
            text.textContent = message;
        }
    }

    /**
     * Скрыть экран загрузки
     */
    hideLoadingScreen() {
        const screen = document.getElementById('loading-screen');
        if (!screen) return;
        screen.classList.add('loading-screen--hidden');
        setTimeout(() => {
            if (screen.parentNode) {
                screen.parentNode.removeChild(screen);
            }
        }, 300);
    }

    /**
     * Запуск автообновления
     */
    startAutoRefresh() {
        if (this.intervals.has('autoRefresh')) return;

        const interval = setInterval(() => {
            this.refreshCurrentModule();
        }, this.settings.refreshInterval);

        this.intervals.set('autoRefresh', interval);
        logger.debug('Автообновление запущено');
    }

    /**
     * Остановка автообновления
     */
    stopAutoRefresh() {
        if (this.intervals.has('autoRefresh')) {
            clearInterval(this.intervals.get('autoRefresh'));
            this.intervals.delete('autoRefresh');
            logger.debug('Автообновление остановлено');
        }
    }

    /**
     * Обновление текущего модуля
     */
    refreshCurrentModule() {
        const currentModule = this.modules.get(this.state.currentTab);
        if (currentModule && typeof currentModule.refresh === 'function') {
            currentModule.refresh();
            logger.debug(`Модуль ${this.state.currentTab} обновлен`);
        }
    }

    /**
     * Запуск мониторинга активности
     */
    startActivityMonitoring() {
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];

        const updateActivity = debounce(() => {
            this.state.lastActivity = new Date();
        }, 1000);

        events.forEach(event => {
            document.addEventListener(event, updateActivity, true);
        });
    }

    /**
     * Запуск системы уведомлений
     */
    startNotificationSystem() {
        // Запрос разрешения на уведомления
        if (this.settings.enableNotifications && 'Notification' in window) {
            if (Notification.permission === 'default') {
                Notification.requestPermission();
            }
        }
    }

    /**
     * Очистка старых данных
     */
    cleanupOldData() {
        // Очистка старых уведомлений
        const cutoffDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 часа
        this.state.notifications = this.state.notifications.filter(
            notification => notification.timestamp > cutoffDate
        );

        // Очистка кэша API
        if (this.api && typeof this.api.clearCache === 'function') {
            this.api.clearCache();
        }
    }

    /**
     * Обработка критических ошибок
     */
    handleCriticalError(error) {
        logger.fatal('Критическая ошибка приложения:', error);

        // Показать экран ошибки
        document.body.innerHTML = `
            <div class="critical-error">
                <div class="critical-error__content">
                    <h1>❌ Критическая ошибка</h1>
                    <p>Не удалось инициализировать IP Roast Enterprise</p>
                    <pre>${error.message}</pre>
                    <button onclick="location.reload()" class="btn btn--primary">
                        Перезагрузить приложение
                    </button>
                </div>
            </div>
        `;

        this.emit('criticalError', error);
    }

    /**
     * Обработка ошибок
     */
    handleError(error, context = 'Unknown') {
        const appError = handleError(error, context);
        logger.error(`Error in ${context}:`, appError);
        this.emit('error', appError);
        return appError;
    }

    /**
     * Выполнение поиска
     */
    performSearch(query) {
        if (!query.trim()) return;

        logger.debug(`Поиск: ${query}`);
        this.emit('search', { query });

        // Здесь можно добавить логику поиска
    }

    /**
     * Показать диалог помощи
     */
    showHelpDialog() {
        const modal = new Modal('help-modal', {
            title: 'Горячие клавиши',
            content: this.getHelpContent()
        });

        modal.addButton('Закрыть', 'secondary', () => modal.close());
        modal.open();
    }

    /**
     * Получить содержимое помощи
     */
    getHelpContent() {
        const shortcuts = [
            ['Ctrl+1', 'Панель управления'],
            ['Ctrl+2', 'Модуль сканирования'],
            ['Ctrl+3', 'Конструктор атак'],
            ['Ctrl+4', 'Топология сети'],
            ['Ctrl+5', 'Отчеты'],
            ['Ctrl+6', 'Настройки'],
            ['Ctrl+Shift+R', 'Обновить модуль'],
            ['Ctrl+/', 'Показать помощь'],
            ['Escape', 'Закрыть модальные окна']
        ];

        return `
            <div class="help-shortcuts">
                ${shortcuts.map(([key, desc]) => `
                    <div class="shortcut-item">
                        <kbd>${key}</kbd>
                        <span>${desc}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    /**
     * Закрыть модальные окна
     */
    closeModals() {
        document.querySelectorAll('.modal--open').forEach(modal => {
            removeClass(modal, 'modal--open');
        });
    }

    /**
     * Переключение панели уведомлений
     */
    toggleNotificationPanel() {
        // Здесь можно добавить логику панели уведомлений
        logger.debug('Toggle notification panel');
    }

    /**
     * Показать меню пользователя
     */
    showUserMenu() {
        // Здесь можно добавить логику меню пользователя
        logger.debug('Show user menu');
    }

    /**
     * Уничтожение приложения
     */
    destroy() {
        // Очистка интервалов
        this.intervals.forEach(interval => clearInterval(interval));
        this.intervals.clear();

        // Очистка таймеров
        this.timeouts.forEach(timeout => clearTimeout(timeout));
        this.timeouts.clear();

        // Закрытие WebSocket
        if (this.websocket) {
            this.websocket.close();
        }

        // Уничтожение модулей
        this.modules.forEach(module => {
            if (typeof module.destroy === 'function') {
                module.destroy();
            }
        });
        this.modules.clear();

        // Очистка событий
        this.removeAllListeners();

        logger.info('🗑️ Приложение уничтожено');
    }
}

// Автоматическая инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    window.ipRoastApp = new IPRoastEnterpriseApp();

    // Глобальный доступ для отладки
    if (import.meta.env.DEV) {
        window.IPRoast = {
            app: window.ipRoastApp,
            logger,
            Storage,
            IPRoastAPI
        };
    }
});


// Экспорт для модульных систем
export default IPRoastEnterpriseApp;