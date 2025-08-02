/**
 * IP Roast Enterprise 4.0 - Main Application Controller
 * Полный контроллер приложения с поддержкой всех модулей
 * Версия: Enterprise 4.0.0
 */

// Import core utilities
import { IPRoastAPI } from './shared/utils/api.js';
import { NOTIFICATION_TYPES, THEMES, DEFAULT_UI_SETTINGS, ANIMATION_DURATION } from './shared/utils/constants.js';
import { formatDate, timeAgo, debounce, Storage, generateUUID, addClass, removeClass, toggleClass } from './shared/utils/helpers.js';

// Import shared components
import { NavigationComponent } from './shared/components/navigation.js';
import { Modal, ConfirmModal } from './shared/components/modals.js';
import { Button, Spinner } from './shared/components/common.js';

// Import module controllers
import { DashboardController } from './dashboard/dashboard.js';

/**
 * Главный класс Enterprise приложения IP Roast
 */
class IPRoastEnterpriseApp {
    constructor() {
        // Информация о приложении
        this.version = '4.0.0';
        this.buildDate = '2024-12-15';
        this.edition = 'Enterprise';

        // Состояние приложения
        this.state = {
            isInitialized: false,
            currentTab: 'dashboard',
            isLoading: true,
            sidebarCollapsed: false,

            // Пользователь
            user: {
                name: 'Администратор',
                role: 'Security Analyst',
                permissions: ['admin', 'scan', 'report', 'attack', 'settings'],
                avatar: null
            },

            // Подключение
            connectionStatus: 'connected',
            lastActivity: new Date(),

            // Уведомления
            notifications: [],
            unreadCount: 0
        };

        // Контроллеры модулей
        this.modules = new Map();
        this.loadedModules = new Set();

        // Таймеры и интервалы
        this.intervals = new Map();

        // Настройки приложения
        this.settings = {
            theme: THEMES.DARK,
            autoRefresh: true,
            refreshInterval: 30000,
            enableNotifications: true,
            enableWebSocket: true,
            enableSounds: false,
            maxNotifications: 50,
            language: 'ru',
            timezone: 'Europe/Moscow',
            ...Storage.get('ipRoastSettings', {})
        };

        // Компоненты UI
        this.components = {
            navigation: null,
            sidebar: null,
            modals: new Map(),
            notifications: null
        };

        // Горячие клавиши
        this.hotkeys = new Map([
            ['Ctrl+1', () => this.switchTab('dashboard')],
            ['Ctrl+2', () => this.switchTab('scanner')],
            ['Ctrl+3', () => this.switchTab('attack-constructor')],
            ['Ctrl+4', () => this.switchTab('network-topology')],
            ['Ctrl+5', () => this.switchTab('reports')],
            ['Ctrl+6', () => this.switchTab('settings')],
            ['Ctrl+Shift+R', () => this.refreshCurrentModule()],
            ['Ctrl+/', () => this.showHelpDialog()],
            ['Escape', () => this.closeModals()]
        ]);

        console.log(`🚀 Инициализация IP Roast ${this.edition} ${this.version}`);
        this.init();
    }

    /**
     * Главная инициализация приложения
     */
    async init() {
        try {
            // Показываем прогресс загрузки
            this.updateLoadingProgress(5, 'Инициализация ядра...');

            // Инициализация основных систем
            await this.initializeCore();
            this.updateLoadingProgress(15, 'Настройка интерфейса...');

            // Настройка UI компонентов
            await this.setupUI();
            this.updateLoadingProgress(25, 'Загрузка модулей...');

            // Инициализация модулей
            await this.initializeModules();
            this.updateLoadingProgress(60, 'Применение настроек...');

            // Применение пользовательских настроек
            await this.applyUserSettings();
            this.updateLoadingProgress(80, 'Запуск сервисов...');

            // Запуск фоновых сервисов
            await this.startServices();
            this.updateLoadingProgress(95, 'Завершение загрузки...');

            // Финализация
            await this.finalizeBoot();
            this.updateLoadingProgress(100, 'Готово!');

            // Скрыть экран загрузки
            setTimeout(() => {
                this.hideLoadingScreen();
                this.state.isInitialized = true;
                this.showNotification('IP Roast Enterprise успешно загружен', NOTIFICATION_TYPES.SUCCESS);
                console.log('✅ IP Roast Enterprise инициализирован');
            }, 800);

        } catch (error) {
            console.error('❌ Критическая ошибка инициализации:', error);
            this.handleCriticalError(error);
        }
    }

    /**
     * Инициализация основных систем
     */
    async initializeCore() {
        // Инициализация системы уведомлений
        this.initializeNotificationSystem();

        // Настройка обработчиков ошибок
        this.setupErrorHandlers();

        // Инициализация системы событий
        this.setupEventSystem();

        // Настройка горячих клавиш
        this.setupHotkeys();

        console.log('🔧 Ядро системы инициализировано');
    }

    /**
     * Настройка пользовательского интерфейса
     */
    async setupUI() {
        // Инициализация навигации
        this.components.navigation = new NavigationComponent({
            container: '#nav-menu',
            onNavigate: (tab) => this.switchTab(tab)
        });

        // Настройка sidebar
        this.setupSidebar();

        // Настройка header элементов
        this.setupHeader();

        // Настройка поиска
        this.setupSearch();

        console.log('🎨 Пользовательский интерфейс настроен');
    }

    /**
     * Инициализация всех модулей
     */
    async initializeModules() {
        try {
            // 1. Dashboard (основной модуль, загружается сразу)
            console.log('📊 Инициализация Dashboard...');
            const dashboardController = new DashboardController({
                container: '#dashboard-container .tab-content-inner',
                autoRefresh: this.settings.autoRefresh,
                refreshInterval: this.settings.refreshInterval,
                enableWebSocket: this.settings.enableWebSocket
            });
            this.modules.set('dashboard', dashboardController);
            this.loadedModules.add('dashboard');

            // 2. Остальные модули загружаем по требованию, но подготавливаем заглушки
            await this.prepareModuleStubs();

            console.log('📦 Модули инициализированы');

        } catch (error) {
            console.error('❌ Ошибка инициализации модулей:', error);
            throw error;
        }
    }

    /**
     * Подготовка заглушек модулей
     */
    async prepareModuleStubs() {
        const moduleStubs = [
            'scanner',
            'attack-constructor',
            'network-topology',
            'reports',
            'settings'
        ];

        moduleStubs.forEach(moduleId => {
            const container = document.querySelector(`#${moduleId}-container .tab-content-inner`);
            if (container && container.querySelector('.module-placeholder')) {
                // Добавляем интерактивности к placeholder
                const placeholder = container.querySelector('.module-placeholder');
                placeholder.style.cursor = 'pointer';
                placeholder.addEventListener('click', () => {
                    this.loadModule(moduleId);
                });
            }
        });
    }

    /**
     * Динамическая загрузка модуля
     */
    async loadModule(moduleId) {
        if (this.loadedModules.has(moduleId)) {
            return this.modules.get(moduleId);
        }

        const container = document.querySelector(`#${moduleId}-container .tab-content-inner`);
        if (!container) return null;

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
            }

            if (moduleController) {
                this.modules.set(moduleId, moduleController);
                this.loadedModules.add(moduleId);
                console.log(`✅ Модуль ${moduleId} загружен`);

                this.showNotification(
                    `Модуль "${this.getModuleTitle(moduleId)}" загружен`,
                    NOTIFICATION_TYPES.INFO
                );
            }

            return moduleController;

        } catch (error) {
            console.error(`❌ Ошибка загрузки модуля ${moduleId}:`, error);
            this.showModuleError(container, error.message);
            throw error;
        }
    }

    /**
     * Загрузка модуля топологии сети
     */
    async loadNetworkTopologyModule(container) {
        container.innerHTML = `
            <div class="network-topology-module">
                <div class="topology-header">
                    <h2>
                        <i class="fas fa-project-diagram"></i>
                        Топология сети
                    </h2>
                    <div class="topology-controls">
                        <button class="btn btn-primary" onclick="window.ipRoastApp.refreshTopology()">
                            <i class="fas fa-sync-alt"></i>
                            Обновить карту
                        </button>
                    </div>
                </div>
                
                <div class="topology-filters">
                    <div class="filter-group">
                        <label>Тип устройства:</label>
                        <select class="filter-select">
                            <option value="all">Все устройства</option>
                            <option value="router">Маршрутизаторы</option>
                            <option value="switch">Коммутаторы</option>
                            <option value="server">Серверы</option>
                            <option value="workstation">Рабочие станции</option>
                        </select>
                    </div>
                    
                    <div class="filter-group">
                        <label>Статус:</label>
                        <select class="filter-select">
                            <option value="all">Все статусы</option>
                            <option value="active">Активные</option>
                            <option value="inactive">Неактивные</option>
                        </select>
                    </div>
                </div>
                
                <div class="topology-content">
                    <div class="network-map" id="network-map">
                        <div class="map-placeholder">
                            <i class="fas fa-sitemap"></i>
                            <h3>Карта сети</h3>
                            <p>Визуализация топологии сети и подключенных устройств</p>
                            <button class="btn btn-secondary" onclick="window.ipRoastApp.startTopologyDiscovery()">
                                Запустить обнаружение
                            </button>
                        </div>
                    </div>
                    
                    <div class="device-list" id="device-list">
                        <h3>Обнаруженные устройства</h3>
                        <div class="devices-grid">
                            <div class="device-card">
                                <div class="device-icon">
                                    <i class="fas fa-server"></i>
                                </div>
                                <div class="device-info">
                                    <div class="device-name">Router-01</div>
                                    <div class="device-ip">192.168.1.1</div>
                                </div>
                                <div class="device-status active">Активен</div>
                            </div>
                            
                            <div class="device-card">
                                <div class="device-icon">
                                    <i class="fas fa-desktop"></i>
                                </div>
                                <div class="device-info">
                                    <div class="device-name">Workstation-01</div>
                                    <div class="device-ip">192.168.1.100</div>
                                </div>
                                <div class="device-status active">Активен</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="topology-stats">
                    <div class="stat-card">
                        <div class="stat-value">12</div>
                        <div class="stat-label">Активных устройств</div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-value">3</div>
                        <div class="stat-label">Подсетей</div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-value">98%</div>
                        <div class="stat-label">Доступность сети</div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Переключение между вкладками
     */
    async switchTab(tabId) {
        if (this.state.currentTab === tabId) return;

        console.log(`🔄 Переключение на вкладку: ${tabId}`);

        // Скрыть текущий контент
        const currentTab = document.querySelector('.tab-content.active');
        if (currentTab) {
            removeClass(currentTab, 'active');
        }

        // Обновить навигацию
        document.querySelectorAll('.nav-item').forEach(item => {
            removeClass(item, 'active');
        });

        const navItem = document.querySelector(`[data-tab="${tabId}"]`);
        if (navItem) {
            addClass(navItem, 'active');
        }

        // Показать новый контент
        const newTab = document.querySelector(`#${tabId}-container`);
        if (newTab) {
            addClass(newTab, 'active');

            // Загрузить модуль если еще не загружен
            if (!this.loadedModules.has(tabId)) {
                await this.loadModule(tabId);
            }
        }

        this.state.currentTab = tabId;

        // Обновить title страницы
        document.title = `${this.getModuleTitle(tabId)} - IP Roast Enterprise`;

        // Сохранить в истории
        this.updateUrlHash(tabId);
    }

    /**
     * Настройка sidebar
     */
    setupSidebar() {
        const sidebarToggle = document.getElementById('sidebar-toggle');
        const sidebar = document.getElementById('app-sidebar');

        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                this.toggleSidebar();
            });
        }

        // Восстановить состояние sidebar
        const savedState = Storage.get('sidebarCollapsed', false);
        if (savedState) {
            this.state.sidebarCollapsed = true;
            addClass(sidebar, 'collapsed');
        }
    }

    /**
     * Переключение sidebar
     */
    toggleSidebar() {
        const sidebar = document.getElementById('app-sidebar');
        const app = document.getElementById('app');

        this.state.sidebarCollapsed = !this.state.sidebarCollapsed;

        if (this.state.sidebarCollapsed) {
            addClass(sidebar, 'collapsed');
            addClass(app, 'sidebar-collapsed');
        } else {
            removeClass(sidebar, 'collapsed');
            removeClass(app, 'sidebar-collapsed');
        }

        // Сохранить состояние
        Storage.set('sidebarCollapsed', this.state.sidebarCollapsed);
    }

    /**
     * Настройка header элементов
     */
    setupHeader() {
        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }

        // User menu
        const userAvatar = document.getElementById('user-avatar');
        const userDropdown = document.getElementById('user-dropdown');

        if (userAvatar && userDropdown) {
            userAvatar.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleClass(userDropdown, 'show');
            });

            // Закрытие при клике вне меню
            document.addEventListener('click', () => {
                removeClass(userDropdown, 'show');
            });

            // Обработка действий меню
            userDropdown.addEventListener('click', (e) => {
                const action = e.target.closest('[data-action]')?.dataset.action;
                if (action) {
                    this.handleUserAction(action);
                }
            });
        }

        // Notification bell
        const notificationBell = document.getElementById('notification-bell');
        if (notificationBell) {
            notificationBell.addEventListener('click', () => {
                this.toggleNotificationPanel();
            });
        }

        // Connection status
        this.updateConnectionStatus();
    }

    /**
     * Настройка поиска
     */
    setupSearch() {
        const searchInput = document.querySelector('.search-input');
        const searchSuggestions = document.getElementById('search-suggestions');

        if (searchInput) {
            searchInput.addEventListener('input', debounce(async (e) => {
                const query = e.target.value.trim();
                if (query.length > 2) {
                    await this.performSearch(query);
                } else {
                    searchSuggestions.style.display = 'none';
                }
            }, 300));

            // Обработка Enter
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    this.executeSearch(searchInput.value);
                }
            });
        }
    }

    /**
     * Выполнение поиска
     */
    async performSearch(query) {
        try {
            // Здесь будет интеграция с API поиска
            const suggestions = [
                { type: 'ip', value: '192.168.1.1', label: 'Router-01' },
                { type: 'device', value: 'server-01', label: 'Server-01 (Ubuntu)' },
                { type: 'cve', value: 'CVE-2023-1234', label: 'Critical RCE vulnerability' }
            ];

            this.showSearchSuggestions(suggestions);
        } catch (error) {
            console.error('Ошибка поиска:', error);
        }
    }

    /**
     * Показ предложений поиска
     */
    showSearchSuggestions(suggestions) {
        const searchSuggestions = document.getElementById('search-suggestions');

        if (suggestions.length === 0) {
            searchSuggestions.style.display = 'none';
            return;
        }

        const suggestionsHTML = suggestions.map(item => `
            <div class="search-suggestion" data-type="${item.type}" data-value="${item.value}">
                <i class="fas fa-${this.getSearchIcon(item.type)}"></i>
                <span class="suggestion-label">${item.label}</span>
                <span class="suggestion-value">${item.value}</span>
            </div>
        `).join('');

        searchSuggestions.innerHTML = suggestionsHTML;
        searchSuggestions.style.display = 'block';

        // Обработка клика по предложению
        searchSuggestions.addEventListener('click', (e) => {
            const suggestion = e.target.closest('.search-suggestion');
            if (suggestion) {
                this.selectSearchSuggestion(suggestion.dataset.type, suggestion.dataset.value);
            }
        });
    }

    /**
     * Получение иконки для типа поиска
     */
    getSearchIcon(type) {
        const icons = {
            'ip': 'globe',
            'device': 'server',
            'cve': 'exclamation-triangle',
            'port': 'door-open',
            'user': 'user'
        };
        return icons[type] || 'search';
    }

    /**
     * Переключение темы
     */
    toggleTheme() {
        const themes = [THEMES.DARK, THEMES.LIGHT, THEMES.CYBERPUNK];
        const currentIndex = themes.indexOf(this.settings.theme);
        const nextIndex = (currentIndex + 1) % themes.length;
        const newTheme = themes[nextIndex];

        this.setTheme(newTheme);
    }

    /**
     * Установка темы
     */
    setTheme(theme) {
        this.settings.theme = theme;
        document.documentElement.setAttribute('data-theme', theme);

        // Обновить иконку
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            const icon = themeToggle.querySelector('i');
            const themeIcons = {
                [THEMES.LIGHT]: 'fas fa-sun',
                [THEMES.DARK]: 'fas fa-moon',
                [THEMES.CYBERPUNK]: 'fas fa-magic'
            };
            icon.className = themeIcons[theme] || 'fas fa-palette';
        }

        // Сохранить настройки
        this.saveSettings();

        this.showNotification(`Тема изменена на "${theme}"`, NOTIFICATION_TYPES.INFO);
    }

    /**
     * Система уведомлений
     */
    initializeNotificationSystem() {
        // Создать контейнер если его нет
        let container = document.getElementById('notifications-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notifications-container';
            container.className = 'notifications-container';
            document.body.appendChild(container);
        }

        this.components.notifications = container;
    }

    /**
     * Показать уведомление
     */
    showNotification(message, type = NOTIFICATION_TYPES.INFO, duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="notification-icon fas ${this.getNotificationIcon(type)}"></i>
                <div class="notification-body">
                    <div class="notification-message">${message}</div>
                    <div class="notification-time">${formatDate(new Date(), 'HH:mm:ss')}</div>
                </div>
                <button class="notification-close" title="Закрыть">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        // Обработчик закрытия
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            this.removeNotification(notification);
        });

        // Добавить в контейнер
        this.components.notifications.appendChild(notification);

        // Анимация появления
        setTimeout(() => addClass(notification, 'show'), 10);

        // Автоматическое удаление
        if (duration > 0) {
            setTimeout(() => {
                this.removeNotification(notification);
            }, duration);
        }

        // Добавить в состояние
        this.state.notifications.unshift({
            id: generateUUID(),
            message,
            type,
            timestamp: new Date(),
            read: false
        });

        // Обновить счетчик
        this.updateNotificationCounter();

        // Ограничить количество
        this.limitNotifications();
    }

    /**
     * Удаление уведомления
     */
    removeNotification(notificationElement) {
        addClass(notificationElement, 'removing');
        setTimeout(() => {
            if (notificationElement.parentNode) {
                notificationElement.parentNode.removeChild(notificationElement);
            }
        }, ANIMATION_DURATION.NORMAL);
    }

    /**
     * Получение иконки уведомления
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
     * Настройка горячих клавиш
     */
    setupHotkeys() {
        document.addEventListener('keydown', (e) => {
            const key = this.getHotkeyString(e);
            const handler = this.hotkeys.get(key);

            if (handler) {
                e.preventDefault();
                handler();
            }
        });
    }

    /**
     * Получение строки горячей клавиши
     */
    getHotkeyString(e) {
        const parts = [];
        if (e.ctrlKey) parts.push('Ctrl');
        if (e.shiftKey) parts.push('Shift');
        if (e.altKey) parts.push('Alt');
        parts.push(e.key);
        return parts.join('+');
    }

    /**
     * Применение пользовательских настроек
     */
    async applyUserSettings() {
        // Применить тему
        this.setTheme(this.settings.theme);

        // Восстановить состояние sidebar
        if (this.settings.sidebarCollapsed) {
            this.toggleSidebar();
        }

        // Настроить автообновление
        if (this.settings.autoRefresh) {
            this.startAutoRefresh();
        }

        console.log('⚙️ Настройки применены');
    }

    /**
     * Запуск фоновых сервисов
     */
    async startServices() {
        // Запуск мониторинга подключения
        this.startConnectionMonitoring();

        // Запуск отслеживания активности
        this.startActivityTracking();

        // Запуск периодических задач
        this.startPeriodicTasks();

        console.log('⚡ Фоновые сервисы запущены');
    }

    /**
     * Финализация загрузки
     */
    async finalizeBoot() {
        // Обработка URL хэша
        this.handleUrlHash();

        // Инициализация WebSocket если включен
        if (this.settings.enableWebSocket) {
            // WebSocket инициализация будет в dashboard контроллере
        }

        // Загрузка начальных данных
        await this.loadInitialData();

        console.log('🎯 Загрузка завершена');
    }

    /**
     * Загрузка начальных данных
     */
    async loadInitialData() {
        try {
            // Получить профиль пользователя
            const profile = await IPRoastAPI.auth.getProfile();
            if (profile && profile.success) {
                this.state.user = { ...this.state.user, ...profile.data };
                this.updateUserDisplay();
            }

            // Получить системный статус
            const status = await IPRoastAPI.system.getSystemStatus();
            if (status && status.success) {
                this.updateSystemStatus(status.data);
            }

        } catch (error) {
            console.warn('Не удалось загрузить начальные данные:', error);
            // Не критично, продолжаем работу
        }
    }

    /**
     * Утилиты для загрузки
     */
    updateLoadingProgress(percent, text) {
        const progressBar = document.getElementById('loading-progress-bar');
        const progressText = document.getElementById('loading-progress-text');

        if (progressBar) {
            progressBar.style.width = `${percent}%`;
        }

        if (progressText) {
            progressText.textContent = text;
        }
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        const app = document.getElementById('app');

        if (loadingScreen) {
            addClass(loadingScreen, 'hidden');
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }

        if (app) {
            app.style.display = 'flex';
        }
    }

    /**
     * Вспомогательные методы
     */
    getModuleTitle(moduleId) {
        const titles = {
            'dashboard': 'Панель управления',
            'scanner': 'Сканирование сети',
            'attack-constructor': 'Конструктор атак',
            'network-topology': 'Топология сети',
            'reports': 'Отчеты и аналитика',
            'settings': 'Настройки системы'
        };
        return titles[moduleId] || moduleId;
    }

    showModuleLoading(container) {
        container.innerHTML = `
            <div class="module-loading">
                <div class="loading-spinner">
                    <div class="spinner-ring"></div>
                </div>
                <p>Загрузка модуля...</p>
            </div>
        `;
    }

    showModuleError(container, message) {
        container.innerHTML = `
            <div class="module-error">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Ошибка загрузки модуля</h3>
                <p>${message}</p>
                <button class="btn btn-primary" onclick="location.reload()">
                    Перезагрузить страницу
                </button>
            </div>
        `;
    }

    handleCriticalError(error) {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.innerHTML = `
                <div class="loading-content">
                    <div class="error-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h2>Ошибка запуска приложения</h2>
                    <p>Не удалось инициализировать IP Roast Enterprise</p>
                    <div class="error-details">
                        <code>${error.message}</code>
                    </div>
                    <button onclick="location.reload()" class="btn btn-primary">
                        Перезагрузить страницу
                    </button>
                </div>
                <div class="loading-footer">
                    <span>Если проблема повторяется, обратитесь к администратору</span>
                </div>
            `;
        }
    }

    updateUrlHash(tab) {
        if (history.pushState) {
            history.pushState(null, null, `#${tab}`);
        }
    }

    handleUrlHash() {
        const hash = window.location.hash.substr(1);
        if (hash && document.querySelector(`#${hash}-container`)) {
            this.switchTab(hash);
        }
    }

    saveSettings() {
        Storage.set('ipRoastSettings', this.settings);
    }

    // Заглушки для методов, которые будут реализованы
    startAutoRefresh() { console.log('🔄 Автообновление запущено'); }
    startConnectionMonitoring() { console.log('📶 Мониторинг подключения запущен'); }
    startActivityTracking() { console.log('👤 Отслеживание активности запущено'); }
    startPeriodicTasks() { console.log('⏰ Периодические задачи запущены'); }
    updateUserDisplay() { console.log('👤 Отображение пользователя обновлено'); }
    updateSystemStatus(status) { console.log('💡 Статус системы обновлен:', status); }
    updateConnectionStatus() { console.log('📶 Статус подключения обновлен'); }
    updateNotificationCounter() { console.log('🔔 Счетчик уведомлений обновлен'); }
    limitNotifications() { console.log('📝 Ограничение уведомлений применено'); }
    toggleNotificationPanel() { console.log('🔔 Панель уведомлений переключена'); }
    handleUserAction(action) { console.log('👤 Действие пользователя:', action); }
    selectSearchSuggestion(type, value) { console.log('🔍 Выбрано предложение:', type, value); }
    executeSearch(query) { console.log('🔍 Выполнен поиск:', query); }
    refreshCurrentModule() { console.log('🔄 Обновление текущего модуля'); }
    showHelpDialog() { console.log('❓ Показ справки'); }
    closeModals() { console.log('❌ Закрытие модальных окон'); }
    refreshTopology() { console.log('🗺️ Обновление топологии'); }
    startTopologyDiscovery() { console.log('🔍 Запуск обнаружения топологии'); }
    setupEventSystem() { console.log('📡 Система событий настроена'); }
    setupErrorHandlers() { console.log('⚠️ Обработчики ошибок настроены'); }
}

// Инициализация приложения после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    window.ipRoastApp = new IPRoastEnterpriseApp();
});

// Экспорт для использования в других модулях
export { IPRoastEnterpriseApp };
