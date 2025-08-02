/**
 * topology-viewer.js - Контроллер просмотрщика топологии сети IP_Roast
 * Энтерпрайз-версия для корпоративной платформы кибербезопасности
 * Версия: Enterprise 1.0
 * 
 * Интегрирует все компоненты топологии:
 * - NetworkTopologyController (карта сети)
 * - NetworkGraphController (граф сети) 
 * - DeviceDetailsController (детали устройств)
 */

import { IPRoastAPI } from '../../shared/utils/api.js';
import {
    $, $$, addClass, removeClass, toggleClass,
    formatDate, timeAgo, debounce, generateUUID,
    Storage
} from '../../shared/utils/helpers.js';
import {
    DEVICE_STATUS, THEMES, ANIMATION_DURATION,
    NOTIFICATION_TYPES, DEFAULT_UI_SETTINGS
} from '../../shared/utils/constants.js';

// Импорт дочерних контроллеров
import { NetworkTopologyController } from './network-map.js';
import { NetworkGraphController } from './network-graph.js';
import { DeviceDetailsController } from './device-details.js';

export class TopologyViewerController {
    constructor(options = {}) {
        this.options = {
            container: '#topology-viewer-container',
            autoRefresh: true,
            refreshInterval: 30000,
            defaultView: 'map',
            showSidebar: true,
            showProperties: true,
            enableSearch: true,
            enableFilters: true,
            ...options
        };

        // Состояние приложения
        this.state = {
            isInitialized: false,
            currentView: this.options.defaultView, // 'map' | 'graph'
            selectedDevice: null,
            selectedSegment: null,
            searchQuery: '',
            filters: {
                deviceTypes: [],
                status: [],
                segments: []
            },
            sidebarCollapsed: false,
            propertiesVisible: false,
            isLoading: false
        };

        // Данные
        this.data = {
            devices: new Map(),
            segments: new Map(),
            connections: new Map(),
            tree: {
                devices: [],
                segments: []
            }
        };

        // Дочерние контроллеры
        this.controllers = {
            map: null,
            graph: null,
            details: null
        };

        // DOM элементы
        this.elements = {};

        // Обработчики событий
        this.eventHandlers = new Map();
        this.refreshTimer = null;

        console.log('🗺️ Topology Viewer Controller инициализирован');
        this.init();
    }

    /**
     * Инициализация контроллера
     */
    async init() {
        try {
            this.container = $(this.options.container);
            if (!this.container) {
                throw new Error(`Контейнер ${this.options.container} не найден`);
            }

            // Показать загрузку
            this.showLoading(true, 'Инициализация просмотрщика топологии...');

            // Инициализация UI
            await this.initializeUI();

            // Настройка событий
            this.setupEventHandlers();

            // Загрузка данных
            await this.loadData();

            // Инициализация дочерних контроллеров
            await this.initializeControllers();

            // Автообновление
            if (this.options.autoRefresh) {
                this.startAutoRefresh();
            }

            this.state.isInitialized = true;
            this.showLoading(false);

            this.emit('initialized');
            console.log('✅ Topology Viewer успешно инициализирован');

        } catch (error) {
            console.error('❌ Ошибка инициализации Topology Viewer:', error);
            this.showError('Ошибка инициализации просмотрщика топологии');
            this.showLoading(false);
        }
    }

    /**
     * Инициализация пользовательского интерфейса
     */
    async initializeUI() {
        this.container.innerHTML = `
            <div class="topology-viewer">
                <!-- Sidebar -->
                <div class="topology-sidebar" id="topology-sidebar">
                    <div class="sidebar-header">
                        <h3 class="sidebar-title">Топология сети</h3>
                        <button class="sidebar-toggle-btn" id="sidebar-toggle">
                            <i class="fas fa-chevron-left"></i>
                        </button>
                    </div>
                    
                    <div class="sidebar-content">
                        <!-- Поиск -->
                        <div class="topology-search-section">
                            <div class="topology-search-container">
                                <input type="text" 
                                       class="topology-search-input" 
                                       id="topology-search"
                                       placeholder="Поиск устройств и сегментов...">
                                <i class="topology-search-icon fas fa-search"></i>
                                <button class="topology-search-clear" id="search-clear" style="display: none;">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        </div>

                        <!-- Дерево топологии -->
                        <div class="topology-tree" id="topology-tree">
                            <!-- Будет заполнено динамически -->
                        </div>
                    </div>
                </div>

                <!-- Основная область -->
                <div class="topology-main">
                    <!-- Заголовок -->
                    <div class="topology-header">
                        <div class="topology-breadcrumb" id="topology-breadcrumb">
                            <span class="breadcrumb-item active">Топология</span>
                        </div>
                        
                        <div class="topology-actions">
                            <!-- Поиск в заголовке -->
                            <div class="topology-search">
                                <input type="text" 
                                       class="topology-search-input" 
                                       id="header-search"
                                       placeholder="Поиск...">
                                <i class="topology-search-icon fas fa-search"></i>
                            </div>
                            
                            <!-- Переключение видов -->
                            <button class="topology-filter-btn" id="view-toggle">
                                <i class="fas fa-sitemap"></i>
                                <span>Граф</span>
                            </button>
                            
                            <!-- Обновление -->
                            <button class="topology-filter-btn" id="refresh-btn">
                                <i class="fas fa-sync-alt"></i>
                                <span>Обновить</span>
                            </button>
                        </div>
                    </div>

                    <!-- Canvas -->
                    <div class="topology-canvas" id="topology-canvas">
                        <!-- Здесь будут загружаться map или graph -->
                        <div class="topology-loading" id="topology-loading" style="display: none;">
                            <div class="topology-loading-spinner"></div>
                            <div class="topology-loading-text">Загрузка топологии...</div>
                        </div>
                        
                        <div class="topology-empty" id="topology-empty" style="display: none;">
                            <i class="topology-empty-icon fas fa-network-wired"></i>
                            <h3 class="topology-empty-title">Топология не найдена</h3>
                            <p class="topology-empty-description">
                                Нет данных для отображения сетевой топологии
                            </p>
                        </div>
                    </div>

                    <!-- Панель управления -->
                    <div class="topology-controls" id="topology-controls">
                        <button class="topology-control-btn" id="zoom-in" title="Увеличить">
                            <i class="fas fa-plus"></i>
                        </button>
                        <button class="topology-control-btn" id="zoom-out" title="Уменьшить">
                            <i class="fas fa-minus"></i>
                        </button>
                        <div class="topology-zoom-level" id="zoom-level">100%</div>
                        <button class="topology-control-btn" id="fit-screen" title="Вписать в экран">
                            <i class="fas fa-expand-arrows-alt"></i>
                        </button>
                        <button class="topology-control-btn" id="center-view" title="Центрировать">
                            <i class="fas fa-crosshairs"></i>
                        </button>
                    </div>
                </div>

                <!-- Панель свойств -->
                <div class="topology-properties hidden" id="topology-properties">
                    <div class="properties-header">
                        <h4 class="properties-title">Свойства</h4>
                        <button class="properties-close-btn" id="properties-close">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="properties-content" id="properties-content">
                        <!-- Содержимое будет загружаться динамически -->
                    </div>
                </div>
            </div>
        `;

        // Получение ссылок на элементы
        this.elements = {
            sidebar: $('#topology-sidebar'),
            sidebarToggle: $('#sidebar-toggle'),
            searchInput: $('#topology-search'),
            searchClear: $('#search-clear'),
            headerSearch: $('#header-search'),
            tree: $('#topology-tree'),
            breadcrumb: $('#topology-breadcrumb'),
            viewToggle: $('#view-toggle'),
            refreshBtn: $('#refresh-btn'),
            canvas: $('#topology-canvas'),
            loading: $('#topology-loading'),
            empty: $('#topology-empty'),
            controls: $('#topology-controls'),
            properties: $('#topology-properties'),
            propertiesContent: $('#properties-content'),
            propertiesClose: $('#properties-close'),
            zoomLevel: $('#zoom-level')
        };
    }

    /**
     * Настройка обработчиков событий
     */
    setupEventHandlers() {
        // Переключение sidebar
        this.elements.sidebarToggle?.addEventListener('click', () => {
            this.toggleSidebar();
        });

        // Поиск
        const searchHandler = debounce((query) => {
            this.handleSearch(query);
        }, 300);

        this.elements.searchInput?.addEventListener('input', (e) => {
            const query = e.target.value;
            searchHandler(query);
            this.toggleSearchClear(query);
        });

        this.elements.headerSearch?.addEventListener('input', (e) => {
            const query = e.target.value;
            searchHandler(query);
            // Синхронизация с sidebar поиском
            if (this.elements.searchInput) {
                this.elements.searchInput.value = query;
            }
        });

        // Очистка поиска
        this.elements.searchClear?.addEventListener('click', () => {
            this.clearSearch();
        });

        // Переключение видов
        this.elements.viewToggle?.addEventListener('click', () => {
            this.toggleView();
        });

        // Обновление
        this.elements.refreshBtn?.addEventListener('click', () => {
            this.refresh();
        });

        // Закрытие панели свойств
        this.elements.propertiesClose?.addEventListener('click', () => {
            this.hideProperties();
        });

        // Управление масштабированием
        $('#zoom-in')?.addEventListener('click', () => this.zoomIn());
        $('#zoom-out')?.addEventListener('click', () => this.zoomOut());
        $('#fit-screen')?.addEventListener('click', () => this.fitToScreen());
        $('#center-view')?.addEventListener('click', () => this.centerView());

        // Клики по дереву
        this.elements.tree?.addEventListener('click', (e) => {
            this.handleTreeClick(e);
        });

        // Развертывание/свертывание секций дерева
        this.elements.tree?.addEventListener('click', (e) => {
            const header = e.target.closest('.tree-section-header');
            if (header) {
                const section = header.closest('.tree-section');
                toggleClass(section, 'collapsed');
            }
        });

        // Изменение размера окна
        window.addEventListener('resize', debounce(() => {
            this.handleResize();
        }, 250));

        // Глобальные клавиши
        document.addEventListener('keydown', (e) => {
            this.handleKeyboard(e);
        });
    }

    /**
     * Загрузка данных
     */
    async loadData() {
        try {
            this.showLoading(true, 'Загрузка данных топологии...');

            // Параллельная загрузка данных
            const [topologyData, devicesData] = await Promise.all([
                IPRoastAPI.analytics.getNetworkTopology(),
                IPRoastAPI.devices.getDevices()
            ]);

            // Обработка данных устройств
            this.processDevicesData(devicesData.devices || devicesData);

            // Обработка данных топологии
            this.processTopologyData(topologyData);

            // Построение дерева
            this.buildTree();

            console.log('✅ Данные топологии загружены:', {
                devices: this.data.devices.size,
                segments: this.data.segments.size,
                connections: this.data.connections.size
            });

        } catch (error) {
            console.error('❌ Ошибка загрузки данных топологии:', error);
            this.showError('Ошибка загрузки данных топологии');
            throw error;
        }
    }

    /**
     * Обработка данных устройств
     */
    processDevicesData(devices) {
        this.data.devices.clear();

        if (!Array.isArray(devices)) return;

        devices.forEach(device => {
            // Нормализация данных устройства
            const normalizedDevice = {
                id: device.id,
                name: device.name || device.hostname || 'Неизвестное устройство',
                type: device.type || 'unknown',
                ip: device.ip || device.ipAddress || '',
                status: device.status || 'unknown',
                lastSeen: device.lastSeen || device.last_seen,
                interfaces: device.interfaces || [],
                specs: device.specs || [],
                security: device.security || {},
                x: device.x || Math.random() * 800,
                y: device.y || Math.random() * 600,
                ...device
            };

            this.data.devices.set(device.id, normalizedDevice);
        });
    }

    /**
     * Обработка данных топологии
     */
    processTopologyData(topology) {
        // Обработка сегментов
        if (topology.segments) {
            this.data.segments.clear();
            topology.segments.forEach(segment => {
                this.data.segments.set(segment.id, segment);
            });
        }

        // Обработка соединений
        if (topology.connections) {
            this.data.connections.clear();
            topology.connections.forEach(connection => {
                this.data.connections.set(connection.id, connection);
            });
        }

        // Обновление координат устройств из топологии
        if (topology.devices) {
            topology.devices.forEach(device => {
                const existing = this.data.devices.get(device.id);
                if (existing) {
                    existing.x = device.x || existing.x;
                    existing.y = device.y || existing.y;
                }
            });
        }
    }

    /**
     * Построение дерева навигации
     */
    buildTree() {
        const treeData = this.prepareTreeData();
        this.renderTree(treeData);
    }

    /**
     * Подготовка данных для дерева
     */
    prepareTreeData() {
        // Группировка устройств по типам
        const devicesByType = new Map();
        this.data.devices.forEach(device => {
            if (!devicesByType.has(device.type)) {
                devicesByType.set(device.type, []);
            }
            devicesByType.get(device.type).push(device);
        });

        // Группировка сегментов по типам
        const segmentsByType = new Map();
        this.data.segments.forEach(segment => {
            if (!segmentsByType.has(segment.type)) {
                segmentsByType.set(segment.type, []);
            }
            segmentsByType.get(segment.type).push(segment);
        });

        return {
            devices: devicesByType,
            segments: segmentsByType
        };
    }

    /**
     * Отрисовка дерева
     */
    renderTree(treeData) {
        if (!this.elements.tree) return;

        let html = '';

        // Секция устройств
        if (treeData.devices.size > 0) {
            html += this.renderTreeSection('devices', 'Устройства', treeData.devices);
        }

        // Секция сегментов
        if (treeData.segments.size > 0) {
            html += this.renderTreeSection('segments', 'Сегменты сети', treeData.segments);
        }

        this.elements.tree.innerHTML = html;
    }

    /**
     * Отрисовка секции дерева
     */
    renderTreeSection(sectionType, title, itemsMap) {
        const totalItems = Array.from(itemsMap.values()).reduce((sum, items) => sum + items.length, 0);

        let html = `
            <div class="tree-section" data-type="${sectionType}">
                <div class="tree-section-header">
                    <h4 class="tree-section-title">${title}</h4>
                    <span class="tree-section-count">${totalItems}</span>
                    <i class="tree-section-toggle fas fa-chevron-down"></i>
                </div>
                <div class="tree-items">
        `;

        // Отрисовка групп
        itemsMap.forEach((items, type) => {
            if (items.length === 0) return;

            html += `
                <div class="tree-item-group" data-group="${type}">
                    <div class="tree-item-group-header">
                        <span class="tree-item-group-title">${this.getTypeDisplayName(type)}</span>
                        <span class="tree-item-group-count">${items.length}</span>
                    </div>
                    <div class="tree-item-group-items">
            `;

            // Отрисовка элементов
            items.forEach(item => {
                html += this.renderTreeItem(item, sectionType);
            });

            html += `
                    </div>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;

        return html;
    }

    /**
     * Отрисовка элемента дерева
     */
    renderTreeItem(item, sectionType) {
        const statusClass = item.status || 'unknown';
        const iconClass = this.getItemIcon(item.type, sectionType);

        return `
            <div class="tree-item ${item.type}" 
                 data-id="${item.id}" 
                 data-type="${sectionType}"
                 data-item-type="${item.type}">
                <div class="tree-item-icon">
                    <i class="${iconClass}"></i>
                </div>
                <div class="tree-item-info">
                    <div class="tree-item-name">${item.name}</div>
                    <div class="tree-item-details">${item.ip || item.description || ''}</div>
                </div>
                <div class="tree-item-status ${statusClass}"></div>
            </div>
        `;
    }

    /**
     * Получение отображаемого названия типа
     */
    getTypeDisplayName(type) {
        const typeNames = {
            router: 'Маршрутизаторы',
            switch: 'Коммутаторы',
            firewall: 'Межсетевые экраны',
            server: 'Серверы',
            endpoint: 'Рабочие станции',
            vlan: 'VLAN',
            subnet: 'Подсети',
            dmz: 'DMZ',
            unknown: 'Неизвестные'
        };
        return typeNames[type] || type.charAt(0).toUpperCase() + type.slice(1);
    }

    /**
     * Получение иконки для элемента
     */
    getItemIcon(type, sectionType) {
        const icons = {
            devices: {
                router: 'fas fa-route',
                switch: 'fas fa-network-wired',
                firewall: 'fas fa-shield-alt',
                server: 'fas fa-server',
                endpoint: 'fas fa-desktop',
                unknown: 'fas fa-question-circle'
            },
            segments: {
                vlan: 'fas fa-sitemap',
                subnet: 'fas fa-layer-group',
                dmz: 'fas fa-shield-alt',
                unknown: 'fas fa-circle'
            }
        };

        return icons[sectionType]?.[type] || 'fas fa-circle';
    }

    /**
     * Инициализация дочерних контроллеров
     */
    async initializeControllers() {
        try {
            // Загрузка начального вида
            if (this.state.currentView === 'map') {
                await this.loadMapView();
            } else {
                await this.loadGraphView();
            }

        } catch (error) {
            console.error('❌ Ошибка инициализации контроллеров:', error);
            this.showError('Ошибка инициализации видов топологии');
        }
    }

    /**
     * Загрузка вида карты
     */
    async loadMapView() {
        try {
            // Очистка canvas
            this.elements.canvas.innerHTML = `
                <div class="network-map-viewport">
                    <div class="map-canvas" id="map-canvas"></div>
                </div>
            `;

            // Создание контроллера карты
            this.controllers.map = new NetworkTopologyController({
                container: '.topology-canvas'
            });

            // Подписка на события карты
            this.setupMapEvents();

            console.log('✅ Вид карты загружен');

        } catch (error) {
            console.error('❌ Ошибка загрузки вида карты:', error);
            throw error;
        }
    }

    /**
     * Загрузка вида графа
     */
    async loadGraphView() {
        try {
            // Очистка canvas
            this.elements.canvas.innerHTML = '';

            // Создание контроллера графа
            this.controllers.graph = new NetworkGraphController({
                container: '.topology-canvas'
            });

            // Подписка на события графа
            this.setupGraphEvents();

            console.log('✅ Вид графа загружен');

        } catch (error) {
            console.error('❌ Ошибка загрузки вида графа:', error);
            throw error;
        }
    }

    /**
     * Настройка событий карты
     */
    setupMapEvents() {
        // Реализация событий для карты
        // TODO: Добавить обработчики событий карты
    }

    /**
     * Настройка событий графа
     */
    setupGraphEvents() {
        // Реализация событий для графа
        // TODO: Добавить обработчики событий графа
    }

    /**
     * Обработка клика по дереву
     */
    handleTreeClick(e) {
        const treeItem = e.target.closest('.tree-item');
        if (!treeItem) return;

        const itemId = treeItem.dataset.id;
        const itemType = treeItem.dataset.type;
        const deviceType = treeItem.dataset.itemType;

        // Обновление выбора
        this.selectTreeItem(treeItem);

        // Обновление хлебных крошек
        this.updateBreadcrumb(itemType, treeItem.querySelector('.tree-item-name').textContent);

        // Показ деталей
        this.showItemDetails(itemId, itemType, deviceType);

        // Фокус на элементе в основном виде
        this.focusOnItem(itemId, itemType);
    }

    /**
     * Выбор элемента в дереве
     */
    selectTreeItem(item) {
        // Снятие предыдущего выбора
        $$('.tree-item.selected').forEach(el => {
            removeClass(el, 'selected');
        });

        // Установка нового выбора
        addClass(item, 'selected');
    }

    /**
     * Обновление хлебных крошек
     */
    updateBreadcrumb(itemType, itemName) {
        if (!this.elements.breadcrumb) return;

        const typeNames = {
            devices: 'Устройства',
            segments: 'Сегменты'
        };

        this.elements.breadcrumb.innerHTML = `
            <span class="breadcrumb-item">Топология</span>
            <span class="breadcrumb-separator">/</span>
            <span class="breadcrumb-item">${typeNames[itemType] || itemType}</span>
            <span class="breadcrumb-separator">/</span>
            <span class="breadcrumb-item active">${itemName}</span>
        `;
    }

    /**
     * Показ деталей элемента
     */
    async showItemDetails(itemId, itemType, deviceType) {
        try {
            if (itemType === 'devices') {
                await this.showDeviceDetails(itemId);
            } else if (itemType === 'segments') {
                await this.showSegmentDetails(itemId);
            }
        } catch (error) {
            console.error('❌ Ошибка показа деталей элемента:', error);
            this.showError('Ошибка загрузки деталей элемента');
        }
    }

    /**
     * Показ деталей устройства
     */
    async showDeviceDetails(deviceId) {
        try {
            // Очистка предыдущего контроллера деталей
            if (this.controllers.details) {
                this.controllers.details = null;
            }

            // Очистка контейнера свойств
            this.elements.propertiesContent.innerHTML = '';

            // Создание нового контроллера деталей
            this.controllers.details = new DeviceDetailsController({
                container: '.topology-properties .properties-content',
                deviceId: deviceId
            });

            // Показ панели свойств
            this.showProperties();

            console.log('✅ Детали устройства загружены:', deviceId);

        } catch (error) {
            console.error('❌ Ошибка загрузки деталей устройства:', error);
            this.elements.propertiesContent.innerHTML = `
                <div class="properties-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Ошибка загрузки деталей устройства</p>
                </div>
            `;
            this.showProperties();
        }
    }

    /**
     * Показ деталей сегмента
     */
    async showSegmentDetails(segmentId) {
        const segment = this.data.segments.get(segmentId);
        if (!segment) return;

        this.elements.propertiesContent.innerHTML = `
            <div class="properties-section">
                <h5 class="properties-section-title">Информация о сегменте</h5>
                <div class="properties-list">
                    <div class="properties-item">
                        <span class="properties-label">Название:</span>
                        <span class="properties-value">${segment.name || segment.label}</span>
                    </div>
                    <div class="properties-item">
                        <span class="properties-label">Тип:</span>
                        <span class="properties-value">${segment.type}</span>
                    </div>
                    <div class="properties-item">
                        <span class="properties-label">Описание:</span>
                        <span class="properties-value">${segment.description || 'Не указано'}</span>
                    </div>
                </div>
            </div>
        `;

        this.showProperties();
    }

    /**
     * Показ панели свойств
     */
    showProperties() {
        removeClass(this.elements.properties, 'hidden');
        this.state.propertiesVisible = true;
    }

    /**
     * Скрытие панели свойств
     */
    hideProperties() {
        addClass(this.elements.properties, 'hidden');
        this.state.propertiesVisible = false;

        // Снятие выбора в дереве
        $$('.tree-item.selected').forEach(el => {
            removeClass(el, 'selected');
        });

        // Сброс хлебных крошек
        this.elements.breadcrumb.innerHTML = '<span class="breadcrumb-item active">Топология</span>';
    }

    /**
     * Фокус на элементе в основном виде
     */
    focusOnItem(itemId, itemType) {
        // TODO: Реализовать фокус на элементе в карте/графе
        console.log('Фокус на элементе:', itemId, itemType);
    }

    /**
     * Переключение sidebar
     */
    toggleSidebar() {
        toggleClass(this.elements.sidebar, 'collapsed');
        this.state.sidebarCollapsed = !this.state.sidebarCollapsed;

        // Обновление иконки
        const icon = this.elements.sidebarToggle.querySelector('i');
        if (this.state.sidebarCollapsed) {
            icon.className = 'fas fa-chevron-right';
        } else {
            icon.className = 'fas fa-chevron-left';
        }

        // Сохранение состояния
        Storage.set('topologyViewerSidebarCollapsed', this.state.sidebarCollapsed);
    }

    /**
     * Переключение видов
     */
    async toggleView() {
        try {
            this.showLoading(true, 'Переключение вида...');

            // Переключение состояния
            this.state.currentView = this.state.currentView === 'map' ? 'graph' : 'map';

            // Обновление кнопки
            const icon = this.elements.viewToggle.querySelector('i');
            const text = this.elements.viewToggle.querySelector('span');

            if (this.state.currentView === 'map') {
                icon.className = 'fas fa-sitemap';
                text.textContent = 'Граф';
                await this.loadMapView();
            } else {
                icon.className = 'fas fa-map';
                text.textContent = 'Карта';
                await this.loadGraphView();
            }

            this.showLoading(false);
            console.log('✅ Вид переключен на:', this.state.currentView);

        } catch (error) {
            console.error('❌ Ошибка переключения вида:', error);
            this.showError('Ошибка переключения вида');
            this.showLoading(false);
        }
    }

    /**
     * Обработка поиска
     */
    handleSearch(query) {
        this.state.searchQuery = query.toLowerCase();
        this.filterTree();
    }

    /**
     * Фильтрация дерева
     */
    filterTree() {
        const query = this.state.searchQuery;

        $$('.tree-item').forEach(item => {
            const name = item.querySelector('.tree-item-name')?.textContent.toLowerCase() || '';
            const details = item.querySelector('.tree-item-details')?.textContent.toLowerCase() || '';

            const matches = name.includes(query) || details.includes(query);
            item.style.display = matches ? '' : 'none';
        });

        // Показ/скрытие групп и секций
        $$('.tree-item-group').forEach(group => {
            const visibleItems = group.querySelectorAll('.tree-item:not([style*="display: none"])');
            group.style.display = visibleItems.length > 0 ? '' : 'none';
        });

        $$('.tree-section').forEach(section => {
            const visibleGroups = section.querySelectorAll('.tree-item-group:not([style*="display: none"])');
            section.style.display = visibleGroups.length > 0 ? '' : 'none';
        });
    }

    /**
     * Переключение кнопки очистки поиска
     */
    toggleSearchClear(query) {
        if (this.elements.searchClear) {
            this.elements.searchClear.style.display = query ? 'flex' : 'none';
        }
    }

    /**
     * Очистка поиска
     */
    clearSearch() {
        this.elements.searchInput.value = '';
        this.elements.headerSearch.value = '';
        this.state.searchQuery = '';
        this.toggleSearchClear('');
        this.filterTree();
    }

    /**
     * Обновление данных
     */
    async refresh() {
        try {
            // Анимация кнопки обновления
            const icon = this.elements.refreshBtn.querySelector('i');
            addClass(icon, 'fa-spin');

            await this.loadData();

            // Перезагрузка текущего вида
            if (this.state.currentView === 'map') {
                await this.loadMapView();
            } else {
                await this.loadGraphView();
            }

            removeClass(icon, 'fa-spin');
            console.log('✅ Данные топологии обновлены');

        } catch (error) {
            console.error('❌ Ошибка обновления:', error);
            this.showError('Ошибка обновления данных');

            const icon = this.elements.refreshBtn.querySelector('i');
            removeClass(icon, 'fa-spin');
        }
    }

    /**
     * Управление масштабированием
     */
    zoomIn() {
        // TODO: Реализовать увеличение масштаба
        console.log('Zoom In');
    }

    zoomOut() {
        // TODO: Реализовать уменьшение масштаба
        console.log('Zoom Out');
    }

    fitToScreen() {
        // TODO: Реализовать вписывание в экран
        console.log('Fit to Screen');
    }

    centerView() {
        // TODO: Реализовать центрирование
        console.log('Center View');
    }

    /**
     * Обработка изменения размера
     */
    handleResize() {
        // TODO: Реализовать обработку изменения размера
        console.log('Handle Resize');
    }

    /**
     * Обработка клавиатуры
     */
    handleKeyboard(e) {
        // Ctrl+F - фокус на поиск
        if (e.ctrlKey && e.key === 'f') {
            e.preventDefault();
            this.elements.searchInput?.focus();
        }

        // Escape - закрытие панелей
        if (e.key === 'Escape') {
            if (this.state.propertiesVisible) {
                this.hideProperties();
            }
        }
    }

    /**
     * Запуск автообновления
     */
    startAutoRefresh() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
        }

        this.refreshTimer = setInterval(() => {
            if (this.state.isInitialized && !this.state.isLoading) {
                this.refresh();
            }
        }, this.options.refreshInterval);

        console.log(`🔄 Автообновление запущено (${this.options.refreshInterval}ms)`);
    }

    /**
     * Остановка автообновления
     */
    stopAutoRefresh() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
            this.refreshTimer = null;
            console.log('⏹️ Автообновление остановлено');
        }
    }

    /**
     * Показ/скрытие загрузки
     */
    showLoading(show, message = 'Загрузка...') {
        this.state.isLoading = show;

        if (show) {
            this.elements.loading.style.display = 'flex';
            this.elements.empty.style.display = 'none';
            if (message && this.elements.loading.querySelector('.topology-loading-text')) {
                this.elements.loading.querySelector('.topology-loading-text').textContent = message;
            }
        } else {
            this.elements.loading.style.display = 'none';
        }
    }

    /**
     * Показ ошибки
     */
    showError(message) {
        console.error('Topology Viewer Error:', message);

        // TODO: Интеграция с системой уведомлений
        if (window.IPRoastApp && window.IPRoastApp.showNotification) {
            window.IPRoastApp.showNotification(message, NOTIFICATION_TYPES.ERROR);
        }
    }

    /**
     * Эмиссия событий
     */
    emit(eventName, data = {}) {
        const event = new CustomEvent(`topologyViewer:${eventName}`, {
            detail: { ...data, controller: this }
        });
        document.dispatchEvent(event);
    }

    /**
     * Уничтожение контроллера
     */
    destroy() {
        // Остановка автообновления
        this.stopAutoRefresh();

        // Уничтожение дочерних контроллеров
        Object.values(this.controllers).forEach(controller => {
            if (controller && typeof controller.destroy === 'function') {
                controller.destroy();
            }
        });

        // Очистка состояния
        this.state.isInitialized = false;
        this.data.devices.clear();
        this.data.segments.clear();
        this.data.connections.clear();

        console.log('🗑️ Topology Viewer уничтожен');
    }
}

// Автоинициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('#topology-viewer-container');
    if (container) {
        window.topologyViewer = new TopologyViewerController({
            container: '#topology-viewer-container'
        });
    }
});
