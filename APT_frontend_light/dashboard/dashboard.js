/**
 * IP Roast Frontend - Dashboard Controller
 * Главный контроллер панели управления корпоративной платформы кибербезопасности
 * Версия: Enterprise 1.0
 */

import { IPRoastAPI, ApiError } from '../shared/utils/api.js';
import {
    formatDate, formatFileSize, timeAgo, debounce, $, $$,
    addClass, removeClass, toggleClass, isValidIP, parsePortRange,
    Storage, generateUUID, deepClone
} from '../shared/utils/helpers.js';
import {
    SCAN_STATUS, DEVICE_STATUS, RISK_LEVELS, NOTIFICATION_TYPES,
    ERROR_MESSAGES, SUCCESS_MESSAGES, DEFAULT_UI_SETTINGS,
    ANIMATION_DURATION, THEMES, WEBSOCKET_CONFIG
} from '../shared/utils/constants.js';
import { OverviewWidget } from './overview.js';

/**
 * Главный класс контроллера дашборда
 */
export class DashboardController {
    constructor(options = {}) {
        this.options = {
            container: '#dashboard-container',
            autoRefresh: true,
            refreshInterval: 30000,
            enableWebSocket: true,
            maxActivityItems: 50,
            chartAnimations: true,
            ...options
        };

        // Компоненты дашборда
        this.widgets = new Map();
        this.charts = new Map();
        this.intervals = new Map();

        // WebSocket соединение
        this.websocket = null;
        this.wsReconnectAttempts = 0;

        // Данные состояния
        this.state = {
            isLoading: false,
            lastUpdate: null,
            stats: {},
            devices: [],
            scans: [],
            vulnerabilities: [],
            activityFeed: [],
            networkTopology: null,
            threatIntelligence: {}
        };

        // Кэш для оптимизации
        this.cache = {
            stats: { data: null, timestamp: 0, ttl: 30000 },
            devices: { data: null, timestamp: 0, ttl: 60000 },
            topology: { data: null, timestamp: 0, ttl: 300000 }
        };

        // Обработчики событий
        this.eventHandlers = new Map();

        // Настройки уведомлений
        this.notifications = {
            container: null,
            queue: [],
            maxVisible: 5
        };

        this.init();
    }

    /**
     * Инициализация дашборда
     */
    async init() {
        try {
            this.showLoader();

            // Создание DOM структуры
            await this.createDashboardStructure();

            // Инициализация виджетов
            await this.initializeWidgets();

            // Загрузка данных
            await this.loadInitialData();

            // Настройка обновлений в реальном времени
            this.setupRealTimeUpdates();

            // Инициализация WebSocket
            if (this.options.enableWebSocket) {
                this.initializeWebSocket();
            }

            // Настройка обработчиков событий
            this.setupEventHandlers();

            // Запуск автоматических обновлений
            if (this.options.autoRefresh) {
                this.startAutoRefresh();
            }

            this.hideLoader();
            this.showNotification('Дашборд загружен успешно', NOTIFICATION_TYPES.SUCCESS);

        } catch (error) {
            console.error('Ошибка инициализации дашборда:', error);
            this.hideLoader();
            this.showNotification('Ошибка загрузки дашборда', NOTIFICATION_TYPES.ERROR);
        }
    }

    /**
     * Настройка обновлений в реальном времени
     */
    setupRealTimeUpdates() {
        console.log('🔄 Настройка обновлений в реальном времени');

        // Настройка WebSocket подключения (если нужно)
        if (this.options.enableWebSocket) {
            this.setupWebSocketConnection();
        }

        // Настройка периодических обновлений
        if (this.options.autoRefresh) {
            this.setupPeriodicUpdates();
        }
    }

    /**
     * Настройка WebSocket подключения
     */
    setupWebSocketConnection() {
        // Заглушка для WebSocket
        console.log('🌐 WebSocket подключение (демо режим)');
    }

    /**
     * Настройка периодических обновлений
     */
    setupPeriodicUpdates() {
        if (this.intervals.has('autoRefresh')) return;

        const interval = setInterval(async () => {
            try {
                await this.refreshData();
            } catch (error) {
                console.error('Ошибка автообновления:', error);
            }
        }, this.options.refreshInterval);

        this.intervals.set('autoRefresh', interval);
    }

    /**
     * Обработка ошибок виджета
     */
    handleWidgetError(error) {
        console.error('❌ Ошибка виджета:', error);
        this.showNotification('Ошибка загрузки виджета', NOTIFICATION_TYPES.ERROR);
    }

    /**
     * Обновление списка сканирований
     */
    updateScansList(scans) {
        const scansList = document.querySelector('#scans-list');
        if (!scansList) return;

        if (!scans || scans.length === 0) {
            scansList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <p>Нет активных сканирований</p>
                <button class="btn btn-primary" onclick="startNewScan()">
                    Запустить сканирование
                </button>
            </div>
        `;
            return;
        }

        const scansHTML = scans.map(scan => `
        <div class="scan-item" data-scan-id="${scan.id}">
            <div class="scan-info">
                <h4>${scan.name || 'Сканирование #' + scan.id}</h4>
                <p>${scan.target}</p>
            </div>
            <div class="scan-status">
                <span class="status ${scan.status}">${this.getStatusText(scan.status)}</span>
                <small>${scan.progress || 0}%</small>
            </div>
        </div>
    `).join('');

        scansList.innerHTML = scansHTML;
    }

    /**
     * Получение текста статуса
     */
    getStatusText(status) {
        const statusMap = {
            'running': 'Выполняется',
            'completed': 'Завершено',
            'failed': 'Ошибка',
            'pending': 'Ожидание'
        };
        return statusMap[status] || status;
    }

    /**
     * Показать уведомление
     */
    showNotification(message, type = NOTIFICATION_TYPES.INFO) {
        console.log(`📢 ${type.toUpperCase()}: ${message}`);

        // Простая реализация уведомлений
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;

        // Добавляем в контейнер уведомлений
        let container = document.querySelector('#notifications-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notifications-container';
            container.className = 'notifications-container';
            document.body.appendChild(container);
        }

        container.appendChild(notification);

        // Автоматическое удаление через 5 секунд
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);

        // Обработчик закрытия
        notification.querySelector('.notification-close').addEventListener('click', () => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        });
    }

    /**
     * Обновление данных
     */
    async refreshData() {
        try {
            await Promise.allSettled([
                this.loadDashboardStats(),
                this.loadRecentScans()
            ]);
        } catch (error) {
            console.error('Ошибка обновления данных:', error);
        }
    }

    /**
     * Создание DOM структуры дашборда
     */
    async createDashboardStructure() {
        const container = $(this.options.container);
        if (!container) {
            throw new Error('Контейнер дашборда не найден');
        }

        container.innerHTML = `
            <div class="dashboard-wrapper">
                <!-- Заголовок дашборда -->
                <div class="dashboard-header">
                    <div class="dashboard-title">
                        <div class="title-content">
                            <h1>Панель безопасности</h1>
                            <p class="subtitle">Мониторинг сетевой безопасности в реальном времени</p>
                        </div>
                        <div class="header-actions">
                            <div class="status-indicator" id="connection-status">
                                <i class="fas fa-circle"></i>
                                <span>Подключено</span>
                            </div>
                            <button class="btn btn--secondary btn--sm" id="refresh-dashboard">
                                <i class="fas fa-sync-alt"></i>
                                Обновить
                            </button>
                            <button class="btn btn--secondary btn--sm" id="dashboard-settings">
                                <i class="fas fa-cog"></i>
                                Настройки
                            </button>
                        </div>
                    </div>
                    <div class="dashboard-tabs" id="dashboard-tabs">
                        <button class="tab-button active" data-tab="overview">
                            <i class="fas fa-tachometer-alt"></i>
                            Обзор
                        </button>
                        <button class="tab-button" data-tab="network">
                            <i class="fas fa-network-wired"></i>
                            Сеть
                        </button>
                        <button class="tab-button" data-tab="security">
                            <i class="fas fa-shield-alt"></i>
                            Безопасность
                        </button>
                        <button class="tab-button" data-tab="analytics">
                            <i class="fas fa-chart-line"></i>
                            Аналитика
                        </button>
                    </div>
                </div>

                <!-- Основной контент -->
                <div class="dashboard-content">
                    <!-- Вкладка Обзор -->
                    <div class="tab-content active" id="tab-overview">
                        <div id="overview-widget-container"></div>
                    </div>

                    <!-- Вкладка Сеть -->
                    <div class="tab-content" id="tab-network">
                        <div class="dashboard-grid">
                            <div class="widget-container">
                                <div class="card widget-card">
                                    <div class="card-header">
                                        <h3><i class="fas fa-sitemap"></i> Топология сети</h3>
                                        <div class="card-actions">
                                            <button class="btn btn--sm btn--secondary" id="topology-fullscreen">
                                                <i class="fas fa-expand"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <div class="card-body">
                                        <div id="network-topology-chart" class="chart-container"></div>
                                    </div>
                                </div>
                            </div>

                            <div class="widget-container">
                                <div class="card widget-card">
                                    <div class="card-header">
                                        <h3><i class="fas fa-list"></i> Активные устройства</h3>
                                        <div class="live-indicator">
                                            <i class="fas fa-circle"></i>
                                            <span>В реальном времени</span>
                                        </div>
                                    </div>
                                    <div class="card-body">
                                        <div id="active-devices-list" class="device-list custom-scrollbar"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Вкладка Безопасность -->
                    <div class="tab-content" id="tab-security">
                        <div class="dashboard-grid">
                            <div class="widget-container">
                                <div class="card widget-card">
                                    <div class="card-header">
                                        <h3><i class="fas fa-exclamation-triangle"></i> Критические уязвимости</h3>
                                        <div class="card-actions">
                                            <select class="form-control" id="vuln-filter">
                                                <option value="all">Все</option>
                                                <option value="critical">Критические</option>
                                                <option value="high">Высокие</option>
                                                <option value="medium">Средние</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="card-body">
                                        <div id="vulnerabilities-list" class="vulnerabilities-container custom-scrollbar"></div>
                                    </div>
                                </div>
                            </div>

                            <div class="widget-container">
                                <div class="card widget-card">
                                    <div class="card-header">
                                        <h3><i class="fas fa-chart-pie"></i> Распределение рисков</h3>
                                    </div>
                                    <div class="card-body">
                                        <div id="risk-distribution-chart" class="chart-container"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Вкладка Аналитика -->
                    <div class="tab-content" id="tab-analytics">
                        <div class="analytics-dashboard">
                            <div class="analytics-header">
                                <div class="time-range-selector">
                                    <label>Период:</label>
                                    <select class="form-control" id="analytics-period">
                                        <option value="1h">Последний час</option>
                                        <option value="24h" selected>Последние 24 часа</option>
                                        <option value="7d">Последняя неделя</option>
                                        <option value="30d">Последний месяц</option>
                                    </select>
                                </div>
                                <div class="export-actions">
                                    <button class="btn btn--secondary btn--sm" id="export-analytics">
                                        <i class="fas fa-download"></i>
                                        Экспорт
                                    </button>
                                </div>
                            </div>

                            <div class="analytics-grid">
                                <div class="chart-widget">
                                    <div class="card">
                                        <div class="card-header">
                                            <h3>Активность сканирования</h3>
                                        </div>
                                        <div class="card-body">
                                            <div id="scan-activity-chart" class="chart-container"></div>
                                        </div>
                                    </div>
                                </div>

                                <div class="chart-widget">
                                    <div class="card">
                                        <div class="card-header">
                                            <h3>Обнаружение угроз</h3>
                                        </div>
                                        <div class="card-body">
                                            <div id="threat-detection-chart" class="chart-container"></div>
                                        </div>
                                    </div>
                                </div>

                                <div class="chart-widget full-width">
                                    <div class="card">
                                        <div class="card-header">
                                            <h3>Временная шкала событий</h3>
                                        </div>
                                        <div class="card-body">
                                            <div id="events-timeline-chart" class="chart-container"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Боковая панель активности -->
                <div class="dashboard-sidebar" id="dashboard-sidebar">
                    <div class="sidebar-header">
                        <h3><i class="fas fa-bell"></i> Активность</h3>
                        <button class="btn btn--sm btn--secondary" id="clear-activity">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                    <div class="sidebar-content">
                        <div id="activity-feed" class="activity-feed custom-scrollbar"></div>
                    </div>
                </div>

                <!-- Плавающие элементы -->
                <div id="notifications-container" class="notifications-container"></div>

                <!-- Модальные окна -->
                <div id="dashboard-modals"></div>
            </div>
        `;

        // Инициализация контейнера уведомлений
        this.notifications.container = $('#notifications-container');
    }

    /**
     * Инициализация виджетов дашборда
     */
    async initializeWidgets() {
        // Инициализация виджета обзора
        const overviewContainer = $('#overview-widget-container');
        if (overviewContainer) {
            this.widgets.set('overview', new OverviewWidget({
                container: overviewContainer,
                onStatsUpdate: (stats) => this.handleStatsUpdate(stats),
                onError: (error) => this.handleWidgetError('overview', error)
            }));
        }

        // Инициализация других виджетов будет добавлена позже
        console.log('Виджеты инициализированы');
    }

    /**
     * Загрузка начальных данных
     */
    async loadInitialData() {
        const loadingTasks = [
            this.loadDashboardStats(),
            this.loadDevices(),
            this.loadRecentScans(),
            this.loadVulnerabilities(),
            this.loadActivityFeed()
        ];

        try {
            await Promise.allSettled(loadingTasks);
            this.state.lastUpdate = new Date();
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
            throw error;
        }
    }

    /**
     * Загрузка статистики дашборда
     */
    async loadDashboardStats() {
        try {
            const cached = this.getCachedData('stats');
            if (cached) {
                this.state.stats = cached;
                return;
            }

            const stats = await IPRoastAPI.analytics.getDashboardStats();
            this.state.stats = stats;
            this.setCachedData('stats', stats);

            // Обновление виджета обзора
            const overviewWidget = this.widgets.get('overview');
            if (overviewWidget) {
                overviewWidget.updateStats(stats);
            }

        } catch (error) {
            console.error('Ошибка загрузки статистики:', error);
            this.showNotification('Ошибка загрузки статистики', NOTIFICATION_TYPES.ERROR);
        }
    }

    /**
     * Загрузка устройств
     */
    async loadDevices() {
        try {
            const cached = this.getCachedData('devices');
            if (cached) {
                this.state.devices = cached;
                this.updateDevicesList();
                return;
            }

            const devices = await IPRoastAPI.devices.getDevices({
                status: DEVICE_STATUS.ACTIVE,
                limit: 100
            });

            this.state.devices = devices.items || [];
            this.setCachedData('devices', this.state.devices);
            this.updateDevicesList();

        } catch (error) {
            console.error('Ошибка загрузки устройств:', error);
            this.showNotification('Ошибка загрузки устройств', NOTIFICATION_TYPES.ERROR);
        }
    }

    /**
     * Загрузка последних сканирований
     */
    async loadRecentScans() {
        try {
            const scans = await IPRoastAPI.scanning.getScans({
                limit: 10,
                sort: 'created_at',
                order: 'desc'
            });

            this.state.scans = scans.items || [];
            this.updateScansList();

        } catch (error) {
            console.error('Ошибка загрузки сканирований:', error);
        }
    }

    /**
     * Загрузка уязвимостей
     */
    async loadVulnerabilities() {
        try {
            const vulnerabilities = await IPRoastAPI.vulnerabilities.getVulnerabilities({
                severity: [RISK_LEVELS.CRITICAL, RISK_LEVELS.HIGH],
                limit: 50
            });

            this.state.vulnerabilities = vulnerabilities.items || [];
            this.updateVulnerabilitiesList();

        } catch (error) {
            console.error('Ошибка загрузки уязвимостей:', error);
        }
    }

    /**
     * Загрузка ленты активности
     */
    async loadActivityFeed() {
        try {
            const activity = await IPRoastAPI.analytics.getActivityFeed({
                limit: this.options.maxActivityItems
            });

            this.state.activityFeed = activity.items || [];
            this.updateActivityFeed();

        } catch (error) {
            console.error('Ошибка загрузки активности:', error);
        }
    }

    /**
     * Обновление списка устройств
     */
    updateDevicesList() {
        const container = $('#active-devices-list');
        if (!container) return;

        if (this.state.devices.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-server"></i>
                    <h4>Устройства не найдены</h4>
                    <p>Запустите сканирование сети для обнаружения устройств</p>
                </div>
            `;
            return;
        }

        const devicesHTML = this.state.devices.map(device => `
            <div class="device-item" data-device-id="${device.id}">
                <div class="device-status">
                    <div class="status-indicator status-${device.status}"></div>
                </div>
                <div class="device-info">
                    <div class="device-ip">${device.ip}</div>
                    <div class="device-hostname">${device.hostname || 'Неизвестно'}</div>
                    <div class="device-os">${device.os || 'Неопределена'}</div>
                </div>
                <div class="device-stats">
                    <span class="ports-count">${device.open_ports || 0} портов</span>
                    <span class="last-seen">${timeAgo(device.last_seen)}</span>
                </div>
                <div class="device-actions">
                    <button class="btn btn--sm btn--secondary" onclick="dashboard.showDeviceDetails('${device.id}')">
                        <i class="fas fa-info-circle"></i>
                    </button>
                </div>
            </div>
        `).join('');

        container.innerHTML = devicesHTML;
    }

    /**
     * Обновление списка уязвимостей
     */
    updateVulnerabilitiesList() {
        const container = $('#vulnerabilities-list');
        if (!container) return;

        if (this.state.vulnerabilities.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-shield-alt"></i>
                    <h4>Уязвимости не найдены</h4>
                    <p>Система безопасна или требуется запуск сканирования</p>
                </div>
            `;
            return;
        }

        const vulnHTML = this.state.vulnerabilities.map(vuln => `
            <div class="vulnerability-item risk-${vuln.severity}">
                <div class="vuln-severity">
                    <span class="severity-badge severity-${vuln.severity}">
                        ${vuln.severity.toUpperCase()}
                    </span>
                </div>
                <div class="vuln-info">
                    <div class="vuln-title">${vuln.title}</div>
                    <div class="vuln-target">${vuln.target}</div>
                    <div class="vuln-cve">${vuln.cve || 'N/A'}</div>
                </div>
                <div class="vuln-score">
                    <span class="cvss-score">${vuln.cvss_score || 'N/A'}</span>
                </div>
                <div class="vuln-actions">
                    <button class="btn btn--sm btn--secondary" onclick="dashboard.showVulnerabilityDetails('${vuln.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </div>
        `).join('');

        container.innerHTML = vulnHTML;
    }

    /**
     * Обновление ленты активности
     */
    updateActivityFeed() {
        const container = $('#activity-feed');
        if (!container) return;

        if (this.state.activityFeed.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-history"></i>
                    <h4>Нет активности</h4>
                    <p>События будут появляться здесь</p>
                </div>
            `;
            return;
        }

        const activityHTML = this.state.activityFeed.map(item => `
            <div class="activity-item activity-${item.type}" data-activity-id="${item.id}">
                <div class="activity-icon">
                    <i class="${this.getActivityIcon(item.type)}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-title">${item.title}</div>
                    <div class="activity-description">${item.description}</div>
                    <div class="activity-time">${timeAgo(item.timestamp)}</div>
                </div>
                ${item.actionable ? `
                    <div class="activity-actions">
                        <button class="btn btn--sm btn--primary" onclick="dashboard.handleActivityAction('${item.id}')">
                            Действие
                        </button>
                    </div>
                ` : ''}
            </div>
        `).join('');

        container.innerHTML = activityHTML;
    }

    /**
     * Получение иконки для типа активности
     */
    getActivityIcon(type) {
        const icons = {
            'scan': 'fas fa-search',
            'vulnerability': 'fas fa-exclamation-triangle',
            'device': 'fas fa-server',
            'attack': 'fas fa-shield-alt',
            'system': 'fas fa-cog',
            'user': 'fas fa-user',
            'error': 'fas fa-times-circle',
            'success': 'fas fa-check-circle',
            'warning': 'fas fa-exclamation-triangle',
            'info': 'fas fa-info-circle'
        };
        return icons[type] || 'fas fa-circle';
    }

    /**
     * Настройка обработчиков событий
     */
    setupEventHandlers() {
        // Обработчик кнопки обновления
        const refreshBtn = $('#refresh-dashboard');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', debounce(() => {
                this.refreshDashboard();
            }, 1000));
        }

        // Обработчики вкладок
        const tabButtons = $$('.tab-button');
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Обработчик фильтра уязвимостей
        const vulnFilter = $('#vuln-filter');
        if (vulnFilter) {
            vulnFilter.addEventListener('change', (e) => {
                this.filterVulnerabilities(e.target.value);
            });
        }

        // Обработчик периода аналитики
        const analyticsFilter = $('#analytics-period');
        if (analyticsFilter) {
            analyticsFilter.addEventListener('change', (e) => {
                this.loadAnalytics(e.target.value);
            });
        }

        // Обработчик очистки активности
        const clearActivityBtn = $('#clear-activity');
        if (clearActivityBtn) {
            clearActivityBtn.addEventListener('click', () => {
                this.clearActivityFeed();
            });
        }

        // Глобальные обработчики
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                clearInterval(this.intervals.get('autoRefresh'));
            } else {
                this.setupPeriodicUpdates();
            }
        });
    }

    /**
     * Переключение вкладок
     */
    switchTab(tabId) {
        // Деактивация всех вкладок
        $$('.tab-button').forEach(btn => removeClass(btn, 'active'));
        $$('.tab-content').forEach(content => removeClass(content, 'active'));

        // Активация выбранной вкладки
        const activeButton = $(`[data-tab="${tabId}"]`);
        const activeContent = $(`#tab-${tabId}`);

        if (activeButton && activeContent) {
            addClass(activeButton, 'active');
            addClass(activeContent, 'active');

            // Загрузка данных для конкретной вкладки
            this.loadTabData(tabId);
        }
    }

    /**
     * Загрузка данных для конкретной вкладки
     */
    async loadTabData(tabId) {
        switch (tabId) {
            case 'network':
                await this.loadNetworkTopology();
                break;
            case 'security':
                await this.loadSecurityData();
                break;
            case 'analytics':
                await this.loadAnalytics('24h');
                break;
        }
    }

    /**
     * Загрузка топологии сети
     */
    async loadNetworkTopology() {
        try {
            const cached = this.getCachedData('topology');
            if (cached) {
                this.renderNetworkTopology(cached);
                return;
            }

            const topology = await IPRoastAPI.analytics.getNetworkTopology();
            this.state.networkTopology = topology;
            this.setCachedData('topology', topology);
            this.renderNetworkTopology(topology);

        } catch (error) {
            console.error('Ошибка загрузки топологии:', error);
            this.showNotification('Ошибка загрузки топологии сети', NOTIFICATION_TYPES.ERROR);
        }
    }

    /**
     * Отрисовка топологии сети
     */
    renderNetworkTopology(topology) {
        const container = $('#network-topology-chart');
        if (!container) return;

        // Здесь будет реализация визуализации топологии
        // Например, с использованием D3.js или другой библиотеки
        container.innerHTML = `
            <div class="topology-placeholder">
                <i class="fas fa-sitemap"></i>
                <h4>Топология сети</h4>
                <p>Обнаружено ${topology.nodes?.length || 0} узлов</p>
                <p>${topology.connections?.length || 0} соединений</p>
            </div>
        `;
    }

    /**
     * Инициализация WebSocket соединения
     */
    initializeWebSocket() {
        if (!window.WebSocket) {
            console.warn('WebSocket не поддерживается браузером');
            return;
        }

        const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}${WEBSOCKET_CONFIG.URL}`;

        try {
            this.websocket = new WebSocket(wsUrl);

            this.websocket.onopen = () => {
                console.log('WebSocket соединение установлено');
                this.wsReconnectAttempts = 0;
                this.updateConnectionStatus(true);
            };

            this.websocket.onmessage = (event) => {
                this.handleWebSocketMessage(event);
            };

            this.websocket.onclose = () => {
                console.log('WebSocket соединение закрыто');
                this.updateConnectionStatus(false);
                this.scheduleWebSocketReconnect();
            };

            this.websocket.onerror = (error) => {
                console.error('WebSocket ошибка:', error);
                this.updateConnectionStatus(false);
            };

        } catch (error) {
            console.error('Ошибка создания WebSocket:', error);
            this.updateConnectionStatus(false);
        }
    }

    /**
     * Обработка WebSocket сообщений
     */
    handleWebSocketMessage(event) {
        try {
            console.log('📨 Получено WebSocket сообщение:', event.data);

            let data;

            // Проверяем, является ли сообщение JSON
            if (typeof event.data === 'string') {
                try {
                    data = JSON.parse(event.data);
                } catch (parseError) {
                    // Если не JSON, обрабатываем как обычный текст
                    console.log('📝 Получено текстовое сообщение:', event.data);

                    // Обработка специальных текстовых сообщений
                    if (event.data === 'connected') {
                        console.log('✅ WebSocket соединение подтверждено');
                        this.showNotification('WebSocket подключен', NOTIFICATION_TYPES.SUCCESS);
                        return;
                    }

                    if (event.data === 'ping') {
                        // Отправляем pong обратно
                        if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
                            this.websocket.send('pong');
                        }
                        return;
                    }

                    if (event.data === 'pong') {
                        console.log('🏓 Получен pong от сервера');
                        return;
                    }

                    // Неизвестное текстовое сообщение
                    console.warn('⚠️ Неизвестное текстовое сообщение:', event.data);
                    return;
                }
            } else {
                data = event.data;
            }

            // Обработка JSON данных
            if (data && typeof data === 'object') {
                this.processWebSocketData(data);
            }

        } catch (error) {
            console.error('Ошибка обработки WebSocket сообщения:', error);
        }
    }

    /**
     * Обработка WebSocket данных
     */
    processWebSocketData(data) {
        try {
            console.log('🔄 Обработка WebSocket данных:', data);

            switch (data.type) {
                case 'stats_update':
                    this.updateDashboardStats(data.payload);
                    break;

                case 'scan_update':
                    this.updateScanStatus(data.payload);
                    break;

                case 'device_update':
                    this.updateDeviceStatus(data.payload);
                    break;

                case 'vulnerability_found':
                    this.handleNewVulnerability(data.payload);
                    break;

                case 'activity_event':
                    this.addActivityEvent(data.payload);
                    break;

                case 'notification':
                    this.showNotification(data.payload.message, data.payload.type || NOTIFICATION_TYPES.INFO);
                    break;

                default:
                    console.log('📊 Получены WebSocket данные:', data);
            }
        } catch (error) {
            console.error('Ошибка обработки WebSocket данных:', error);
        }
    }

    /**
     * Обновление статистики дашборда через WebSocket
     */
    updateDashboardStats(stats) {
        try {
            this.state.stats = { ...this.state.stats, ...stats };

            // Обновляем виджеты
            if (this.widgets.has('overview')) {
                const overviewWidget = this.widgets.get('overview');
                overviewWidget.updateStats(this.state.stats);
            }

            console.log('📈 WebSocket: Статистика обновлена');

        } catch (error) {
            console.error('Ошибка обновления статистики через WebSocket:', error);
        }
    }

    /**
     * Обновление статуса сканирования
     */
    updateScanStatus(scanData) {
        try {
            // Находим и обновляем сканирование в списке
            const scanIndex = this.state.scans.findIndex(scan => scan.id === scanData.id);
            if (scanIndex !== -1) {
                this.state.scans[scanIndex] = { ...this.state.scans[scanIndex], ...scanData };
            } else {
                this.state.scans.push(scanData);
            }

            // Обновляем интерфейс
            this.updateScansList(this.state.scans);

            // Показываем уведомление о важных изменениях
            if (scanData.status === 'completed') {
                this.showNotification(`Сканирование ${scanData.name || scanData.id} завершено`, NOTIFICATION_TYPES.SUCCESS);
            } else if (scanData.status === 'failed') {
                this.showNotification(`Сканирование ${scanData.name || scanData.id} завершилось с ошибкой`, NOTIFICATION_TYPES.ERROR);
            }

            console.log('🔍 WebSocket: Статус сканирования обновлен:', scanData);

        } catch (error) {
            console.error('Ошибка обновления статуса сканирования:', error);
        }
    }

    /**
     * Обновление статуса устройства
     */
    updateDeviceStatus(deviceData) {
        try {
            // Находим и обновляем устройство в списке
            const deviceIndex = this.state.devices.findIndex(device => device.ip === deviceData.ip);
            if (deviceIndex !== -1) {
                this.state.devices[deviceIndex] = { ...this.state.devices[deviceIndex], ...deviceData };
            } else {
                this.state.devices.push(deviceData);
            }

            // Обновляем интерфейс
            this.updateDevicesList(this.state.devices);

            console.log('🖥️ WebSocket: Статус устройства обновлен:', deviceData);

        } catch (error) {
            console.error('Ошибка обновления статуса устройства:', error);
        }
    }

    /**
     * Обработка новой уязвимости
     */
    handleNewVulnerability(vulnData) {
        try {
            this.state.vulnerabilities.push(vulnData);

            // Показываем уведомление о критических уязвимостях
            if (vulnData.severity === 'critical') {
                this.showNotification(
                    `Обнаружена критическая уязвимость: ${vulnData.name}`,
                    NOTIFICATION_TYPES.ERROR
                );
            }

            // Обновляем статистику
            this.updateVulnerabilityStats();

            console.log('🚨 WebSocket: Обнаружена новая уязвимость:', vulnData);

        } catch (error) {
            console.error('Ошибка обработки новой уязвимости:', error);
        }
    }

    /**
     * Добавление события в ленту активности
     */
    addActivityEvent(eventData) {
        try {
            // Добавляем в начало списка
            this.state.activityFeed.unshift(eventData);

            // Ограничиваем количество элементов
            if (this.state.activityFeed.length > this.options.maxActivityItems) {
                this.state.activityFeed = this.state.activityFeed.slice(0, this.options.maxActivityItems);
            }

            // Обновляем интерфейс
            this.updateActivityFeed();

            console.log('📝 WebSocket: Добавлено событие активности:', eventData);

        } catch (error) {
            console.error('Ошибка добавления события активности:', error);
        }
    }

    /**
     * Обновление статуса соединения
     */
    updateConnectionStatus(connected) {
        const statusIndicator = document.querySelector('#connection-status');
        if (!statusIndicator) return;

        const icon = statusIndicator.querySelector('i');
        const text = statusIndicator.querySelector('span');
        if (!icon || !text) return;

        if (connected) {
            removeClass(statusIndicator, 'disconnected');
            addClass(statusIndicator, 'connected');
            icon.className = 'fas fa-circle';
            text.textContent = 'Подключено';
        } else {
            removeClass(statusIndicator, 'connected');
            addClass(statusIndicator, 'disconnected');
            icon.className = 'fas fa-exclamation-circle';
            text.textContent = 'Отключено';
        }
    }


    /**
     * Планирование переподключения WebSocket
     */
    scheduleWebSocketReconnect() {
        if (this.wsReconnectAttempts < WEBSOCKET_CONFIG.MAX_RECONNECT_ATTEMPTS) {
            setTimeout(() => {
                this.wsReconnectAttempts++;
                console.log(`Попытка переподключения WebSocket #${this.wsReconnectAttempts}`);
                this.initializeWebSocket();
            }, WEBSOCKET_CONFIG.RECONNECT_INTERVAL);
        }
    }

    /**
     * Запуск автоматического обновления
     */
    startAutoRefresh() {
        // Основной интервал обновления
        this.intervals.set('main', setInterval(() => {
            this.refreshDashboard();
        }, this.options.refreshInterval));

        // Частое обновление активности
        this.intervals.set('activity', setInterval(() => {
            this.loadActivityFeed();
        }, 10000));
    }

    /**
     * Остановка автоматического обновления
     */
    stopAutoRefresh() {
        this.intervals.forEach((interval, key) => {
            clearInterval(interval);
            this.intervals.delete(key);
        });
    }

    /**
     * Обновление дашборда
     */
    async refreshDashboard() {
        if (this.state.isLoading) return;

        this.state.isLoading = true;
        this.showRefreshIndicator();

        try {
            // Очистка кэша для принудительного обновления
            this.clearCache();

            // Загрузка данных
            await this.loadInitialData();

            this.showNotification('Дашборд обновлен', NOTIFICATION_TYPES.SUCCESS);

        } catch (error) {
            console.error('Ошибка обновления дашборда:', error);
            this.showNotification('Ошибка обновления дашборда', NOTIFICATION_TYPES.ERROR);
        } finally {
            this.state.isLoading = false;
            this.hideRefreshIndicator();
        }
    }

    /**
     * Показ индикатора обновления
     */
    showRefreshIndicator() {
        const refreshBtn = $('#refresh-dashboard');
        if (refreshBtn) {
            const icon = refreshBtn.querySelector('i');
            addClass(icon, 'fa-spin');
            refreshBtn.disabled = true;
        }
    }

    /**
     * Скрытие индикатора обновления
     */
    hideRefreshIndicator() {
        const refreshBtn = $('#refresh-dashboard');
        if (refreshBtn) {
            const icon = refreshBtn.querySelector('i');
            removeClass(icon, 'fa-spin');
            refreshBtn.disabled = false;
        }
    }

    /**
     * Показ уведомления
     */
    showNotification(message, type = NOTIFICATION_TYPES.INFO, duration = 5000) {
        if (!this.notifications.container) return;

        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Обработчик закрытия
        notification.querySelector('.notification-close').addEventListener('click', () => {
            this.hideNotification(notification);
        });

        // Добавление в контейнер
        this.notifications.container.appendChild(notification);

        // Автоматическое скрытие
        if (duration > 0) {
            setTimeout(() => {
                this.hideNotification(notification);
            }, duration);
        }

        // Ограничение количества видимых уведомлений
        const notifications = this.notifications.container.querySelectorAll('.notification');
        if (notifications.length > this.notifications.maxVisible) {
            this.hideNotification(notifications[0]);
        }
    }

    /**
     * Скрытие уведомления
     */
    hideNotification(notification) {
        if (notification && notification.parentNode) {
            addClass(notification, 'notification--hiding');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }
    }

    /**
     * Получение иконки уведомления
     */
    getNotificationIcon(type) {
        const icons = {
            [NOTIFICATION_TYPES.SUCCESS]: 'fas fa-check-circle',
            [NOTIFICATION_TYPES.ERROR]: 'fas fa-exclamation-circle',
            [NOTIFICATION_TYPES.WARNING]: 'fas fa-exclamation-triangle',
            [NOTIFICATION_TYPES.INFO]: 'fas fa-info-circle'
        };
        return icons[type] || 'fas fa-bell';
    }

    /**
     * Работа с кэшем
     */
    getCachedData(key) {
        const cached = this.cache[key];
        if (cached && Date.now() - cached.timestamp < cached.ttl) {
            return cached.data;
        }
        return null;
    }

    setCachedData(key, data) {
        if (this.cache[key]) {
            this.cache[key].data = data;
            this.cache[key].timestamp = Date.now();
        }
    }

    clearCache() {
        Object.keys(this.cache).forEach(key => {
            this.cache[key].timestamp = 0;
        });
    }

    /**
     * Показ/скрытие загрузчика
     */
    showLoader() {
        // Реализация показа загрузчика
    }

    hideLoader() {
        // Реализация скрытия загрузчика
    }

    /**
     * Обработчики событий WebSocket
     */
    handleStatsUpdate(stats) {
        this.state.stats = { ...this.state.stats, ...stats };
        const overviewWidget = this.widgets.get('overview');
        if (overviewWidget) {
            overviewWidget.updateStats(this.state.stats);
        }
    }

    handleNewDevice(device) {
        this.state.devices.unshift(device);
        this.updateDevicesList();
        this.showNotification(`Обнаружено новое устройство: ${device.ip}`, NOTIFICATION_TYPES.INFO);
    }

    handleNewVulnerability(vulnerability) {
        this.state.vulnerabilities.unshift(vulnerability);
        this.updateVulnerabilitiesList();
        this.showNotification(`Найдена новая уязвимость: ${vulnerability.title}`, NOTIFICATION_TYPES.WARNING);
    }

    handleActivityUpdate(activity) {
        this.state.activityFeed.unshift(activity);
        if (this.state.activityFeed.length > this.options.maxActivityItems) {
            this.state.activityFeed.pop();
        }
        this.updateActivityFeed();
    }

    /**
     * Очистка ресурсов
     */
    destroy() {
        // Остановка интервалов
        this.stopAutoRefresh();

        // Закрытие WebSocket
        if (this.websocket) {
            this.websocket.close();
        }

        // Очистка виджетов
        this.widgets.forEach(widget => {
            if (widget.destroy) {
                widget.destroy();
            }
        });
        this.widgets.clear();

        // Очистка кэша
        this.clearCache();

        console.log('Dashboard контроллер уничтожен');
    }
}

// Глобальный экспорт для совместимости
window.DashboardController = DashboardController;
