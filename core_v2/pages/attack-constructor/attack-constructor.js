/**
 * IP Roast Enterprise 4.0 - Attack Constructor Main Module
 * Главный файл инициализации и оркестрации конструктора сигнатурного анализа
 * Версия: 4.0.0-Enhanced-Main
 * 
 * @description Центральная точка входа для модульной архитектуры конструктора
 * @author IP Roast Security Team
 * @requires Enhanced PageManager, Core v2 Architecture
 * @integrates all attack-constructor modules
 */

console.log('🚀 IP Roast Enterprise - Attack Constructor Main Module v4.0.0-Enhanced');

// =======================================================
// МОДУЛЬНАЯ АРХИТЕКТУРА - ИМПОРТЫ И ЗАВИСИМОСТИ
// =======================================================

/**
 * Динамический импорт модулей конструктора
 * Используем lazy loading для оптимизации производительности
 */
class AttackConstructorModuleLoader {
    constructor() {
        this.loadedModules = new Map();
        this.moduleStatus = new Map();
        this.loadingPromises = new Map();
        this.basePath = './pages/attack-constructor/';

        console.log('📦 Module loader initialized');
    }

    /**
     * Асинхронная загрузка модуля с кэшированием
     */
    async loadModule(moduleName, retryCount = 3) {
        if (this.loadedModules.has(moduleName)) {
            return this.loadedModules.get(moduleName);
        }

        if (this.loadingPromises.has(moduleName)) {
            return this.loadingPromises.get(moduleName);
        }

        const loadPromise = this._loadModuleInternal(moduleName, retryCount);
        this.loadingPromises.set(moduleName, loadPromise);

        try {
            const module = await loadPromise;
            this.loadedModules.set(moduleName, module);
            this.moduleStatus.set(moduleName, 'loaded');
            console.log(`✅ Module loaded: ${moduleName}`);
            return module;
        } catch (error) {
            this.moduleStatus.set(moduleName, 'error');
            console.error(`❌ Failed to load module ${moduleName}:`, error);
            throw error;
        } finally {
            this.loadingPromises.delete(moduleName);
        }
    }

    async _loadModuleInternal(moduleName, retryCount) {
        const modulePath = `${this.basePath}${moduleName}.js`;

        for (let attempt = 1; attempt <= retryCount; attempt++) {
            try {
                this.moduleStatus.set(moduleName, 'loading');

                // Динамический импорт модуля
                const moduleScript = await this._loadScript(modulePath);

                // Возвращаем глобальный объект модуля или из window
                const moduleExport = window[this._getModuleExportName(moduleName)];

                if (!moduleExport) {
                    throw new Error(`Module export not found for ${moduleName}`);
                }

                return moduleExport;

            } catch (error) {
                console.warn(`⚠️ Module load attempt ${attempt}/${retryCount} failed for ${moduleName}:`, error);

                if (attempt === retryCount) {
                    throw error;
                }

                // Экспоненциальная задержка между попытками
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
            }
        }
    }

    _loadScript(src) {
        return new Promise((resolve, reject) => {
            // Проверяем, не загружен ли уже скрипт
            const existingScript = document.querySelector(`script[src="${src}"]`);
            if (existingScript) {
                resolve(existingScript);
                return;
            }

            const script = document.createElement('script');
            script.src = src;
            script.type = 'text/javascript';
            script.async = true;

            script.onload = () => {
                console.log(`📜 Script loaded: ${src}`);
                resolve(script);
            };

            script.onerror = (error) => {
                console.error(`❌ Script load error: ${src}`, error);
                reject(new Error(`Failed to load script: ${src}`));
            };

            document.head.appendChild(script);
        });
    }

    _getModuleExportName(moduleName) {
        // Стандартизированные имена экспортов согласно фактическим классам
        const exportNames = {
            // Основные модули Attack Constructor
            'attack-constructor-core': 'AttackConstructorCore',
            'signature-components': 'SignatureComponentsManager',
            'rule-templates': 'RuleTemplateManager',
            'canvas-manager': 'CanvasManager',
            'connection-manager': 'ConnectionManager',
            'rule-generator': 'RuleGenerator',
            'test-manager': 'TestManager',
            'ui-manager': 'UIManager',

            // Альтернативные имена для совместимости
            'connection-mgr': 'ConnectionManager',
            'rule-template': 'RuleTemplateManager',
            'sig-components': 'SignatureComponentsManager'
        };

        const exportName = exportNames[moduleName];
        if (!exportName) {
            console.warn(`⚠️ Unknown module: ${moduleName}, using fallback: ${moduleName}`);
            return moduleName;
        }

        console.log(`📦 Module "${moduleName}" → Export "${exportName}"`);
        return exportName;
    }

    /**
     * Загрузка всех необходимых модулей
     */
    async loadAllModules() {
        const coreModules = [
            'attack-constructor-core'
        ];

        const supportingModules = [
            'signature-components',
            'rule-templates',
            'canvas-manager',
            'connection-manager',
            'rule-generator',
            'test-manager',
            'ui-manager'
        ];

        console.log('📚 Loading core modules...');

        try {
            // Сначала загружаем основной модуль
            const coreResults = await Promise.all(
                coreModules.map(module => this.loadModule(module))
            );

            console.log('📚 Loading supporting modules...');

            // Затем загружаем поддерживающие модули (можно параллельно)
            const supportingResults = await Promise.allSettled(
                supportingModules.map(module => this.loadModule(module))
            );

            // Проверяем результаты загрузки поддерживающих модулей
            const failedModules = supportingResults
                .map((result, index) => ({ result, name: supportingModules[index] }))
                .filter(({ result }) => result.status === 'rejected')
                .map(({ name, result }) => ({ name, error: result.reason }));

            if (failedModules.length > 0) {
                console.warn('⚠️ Some supporting modules failed to load:', failedModules);
                // Не блокируем инициализацию из-за вспомогательных модулей
            }

            return {
                core: coreResults,
                supporting: supportingResults,
                failed: failedModules
            };

        } catch (error) {
            console.error('❌ Critical error loading core modules:', error);
            throw error;
        }
    }

    /**
     * Получение статуса загрузки модулей
     */
    getLoadingStatus() {
        const status = {};
        this.moduleStatus.forEach((status_val, module) => {
            status[module] = status_val;
        });
        return status;
    }
}

// =======================================================
// ОСНОВНОЙ КЛАСС ATTACK CONSTRUCTOR
// =======================================================

/**
 * Главный класс Attack Constructor - оркестратор всех модулей
 */
class AttackConstructor {
    constructor() {
        this.version = '4.0.0-Enhanced-Main';
        this.buildDate = new Date().toISOString();
        this.isInitialized = false;
        this.initStartTime = performance.now();

        // Менеджеры и модули
        this.moduleLoader = new AttackConstructorModuleLoader();
        this.core = null;
        this.modules = new Map();

        // Состояние приложения
        this.state = {
            currentPage: 'attack-constructor',
            isActive: false,
            hasUnsavedChanges: false,
            lastActivity: Date.now()
        };

        // События и обработчики
        this.eventHandlers = new Map();
        this.initializationPromise = null;

        console.log('🎯 Attack Constructor Main initialized');
    }

    /**
     * Основная функция инициализации
     */
    async initialize() {
        if (this.initializationPromise) {
            return this.initializationPromise;
        }

        this.initializationPromise = this._performInitialization();
        return this.initializationPromise;
    }

    async _performInitialization() {
        try {
            console.log('🚀 Starting Attack Constructor initialization...');

            // Этап 1: Проверка окружения
            this._validateEnvironment();

            // Этап 2: Загрузка всех модулей
            const loadResults = await this.moduleLoader.loadAllModules();
            console.log('📦 Modules loaded:', this.moduleLoader.getLoadingStatus());

            // Этап 3: Инициализация core модуля
            await this._initializeCore();

            // Этап 4: Инициализация вспомогательных модулей
            await this._initializeSupportingModules(loadResults);

            // Этап 5: Установка связей между модулями
            this._establishModuleConnections();

            // Этап 6: Регистрация глобальных обработчиков
            this._registerGlobalHandlers();

            // Этап 7: Интеграция с Enhanced PageManager
            this._integrateWithPageManager();

            // Этап 8: Установка мониторинга и отладки
            this._setupMonitoring();

            // Финализация
            this.isInitialized = true;
            this.state.isActive = true;

            const initTime = performance.now() - this.initStartTime;
            console.log(`✅ Attack Constructor initialized successfully in ${initTime.toFixed(2)}ms`);

            // Уведомляем о готовности
            this._notifyReady();

            return this;

        } catch (error) {
            console.error('❌ Attack Constructor initialization failed:', error);
            this._handleInitializationError(error);
            throw error;
        }
    }

    /**
     * Проверка окружения и предварительных условий
     */
    _validateEnvironment() {
        console.log('🔍 Validating environment...');

        // Проверка браузера
        if (typeof window === 'undefined') {
            throw new Error('Browser environment required');
        }

        // Проверка необходимых API
        const requiredAPIs = ['fetch', 'Promise', 'Map', 'Set', 'Symbol'];
        const missingAPIs = requiredAPIs.filter(api => typeof window[api] === 'undefined');

        if (missingAPIs.length > 0) {
            throw new Error(`Missing required APIs: ${missingAPIs.join(', ')}`);
        }

        // Проверка DOM готовности
        if (document.readyState === 'loading') {
            return new Promise(resolve => {
                document.addEventListener('DOMContentLoaded', resolve);
            });
        }

        // Проверка наличия базовых элементов DOM
        const requiredElements = ['rule-canvas', 'component-search'];
        const missingElements = requiredElements.filter(id => !document.getElementById(id));

        if (missingElements.length > 0) {
            console.warn('⚠️ Some DOM elements missing:', missingElements);
        }

        console.log('✅ Environment validation passed');
    }

    /**
     * Инициализация основного модуля
     */
    async _initializeCore() {
        console.log('🔧 Initializing core module...');

        try {
            // Получаем экземпляр core модуля из глобального пространства
            if (window.signatureConstructor) {
                this.core = window.signatureConstructor;
                console.log('✅ Core module found in global scope');
            } else if (window.SignatureAnalysisConstructor) {
                // Если класс доступен, создаем экземпляр
                this.core = new window.SignatureAnalysisConstructor();
                console.log('✅ Core module instantiated');
            } else {
                throw new Error('Core module not available');
            }

            // Проверяем готовность core модуля
            if (!this.core.isInitialized) {
                console.log('⏳ Waiting for core module initialization...');
                // Даем время для инициализации core модуля
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            this.modules.set('core', this.core);

        } catch (error) {
            console.error('❌ Core module initialization failed:', error);
            throw error;
        }
    }

    /**
     * Инициализация вспомогательных модулей
     */
    async _initializeSupportingModules(loadResults) {
        console.log('🔧 Initializing supporting modules...');

        const moduleConfigs = {
            'signature-components': {
                required: false,
                fallback: () => this.core?.signatureComponents || new Map()
            },
            'rule-templates': {
                required: false,
                fallback: () => ({})
            },
            'canvas-manager': {
                required: false,
                fallback: () => this.core // Core содержит canvas функциональность
            },
            'connection-manager': {
                required: false,
                fallback: () => this.core // Core содержит connection функциональность
            },
            'rule-generator': {
                required: false,
                fallback: () => this.core // Core содержит generation функциональность
            },
            'test-manager': {
                required: false,
                fallback: () => this.core // Core содержит test функциональность
            },
            'ui-manager': {
                required: false,
                fallback: () => this.core // Core содержит UI функциональность
            }
        };

        for (const [moduleName, config] of Object.entries(moduleConfigs)) {
            try {
                let moduleInstance = this.moduleLoader.loadedModules.get(moduleName);

                if (!moduleInstance && config.required) {
                    throw new Error(`Required module ${moduleName} not loaded`);
                }

                if (!moduleInstance) {
                    console.log(`📦 Using fallback for ${moduleName}`);
                    moduleInstance = config.fallback();
                }

                this.modules.set(moduleName, moduleInstance);
                console.log(`✅ Module ${moduleName} initialized`);

            } catch (error) {
                if (config.required) {
                    throw error;
                } else {
                    console.warn(`⚠️ Optional module ${moduleName} failed:`, error);
                }
            }
        }
    }

    /**
     * Установка связей между модулями
     */
    _establishModuleConnections() {
        console.log('🔗 Establishing module connections...');

        if (!this.core) {
            console.warn('⚠️ Core module not available for connections');
            return;
        }

        // Все функциональность уже интегрирована в core модуль
        // Устанавливаем ссылки для обратной совместимости

        const moduleAliases = {
            signatureComponents: this.core.signatureComponents,
            canvasManager: this.core,
            connectionManager: this.core,
            ruleGenerator: this.core,
            testManager: this.core,
            uiManager: this.core
        };

        Object.entries(moduleAliases).forEach(([alias, instance]) => {
            this[alias] = instance;
        });

        console.log('✅ Module connections established');
    }

    /**
     * Регистрация глобальных обработчиков
     */
    _registerGlobalHandlers() {
        console.log('🌐 Registering global handlers...');

        // Глобальные ссылки для HTML интеграции
        window.attackConstructor = this;
        window.signatureConstructor = this.core;

        // Обработчики жизненного цикла страницы
        window.addEventListener('beforeunload', (event) => {
            this._handleBeforeUnload(event);
        });

        window.addEventListener('unload', () => {
            this._handleUnload();
        });

        // Обработчик ошибок
        window.addEventListener('error', (event) => {
            this._handleGlobalError(event);
        });

        // Обработчик изменения видимости страницы
        document.addEventListener('visibilitychange', () => {
            this._handleVisibilityChange();
        });

        // Горячие клавиши (если core их не обрабатывает)
        this._setupKeyboardShortcuts();

        console.log('✅ Global handlers registered');
    }

    /**
     * Интеграция с Enhanced PageManager
     */
    _integrateWithPageManager() {
        console.log('📄 Integrating with Enhanced PageManager...');

        if (window.enhancedPageManager) {
            // Регистрируем обработчики жизненного цикла страниц
            window.enhancedPageManager.on('pageCleanup', (data) => {
                if (data.pageId === 'attack-constructor') {
                    this._handlePageCleanup();
                }
            });

            window.enhancedPageManager.on('pageActivate', (data) => {
                if (data.pageId === 'attack-constructor') {
                    this._handlePageActivate();
                }
            });

            window.enhancedPageManager.on('pageDeactivate', (data) => {
                if (data.pageId === 'attack-constructor') {
                    this._handlePageDeactivate();
                }
            });

            // Регистрируем страницу в PageManager
            window.enhancedPageManager.registerPage('attack-constructor', {
                title: 'Конструктор сигнатурного анализа',
                module: this,
                cleanup: () => this.cleanup(),
                activate: () => this.activate(),
                deactivate: () => this.deactivate()
            });

            console.log('✅ Enhanced PageManager integration completed');
        } else {
            console.warn('⚠️ Enhanced PageManager not found');
        }
    }

    /**
     * Настройка мониторинга и отладки
     */
    _setupMonitoring() {
        console.log('📊 Setting up monitoring...');

        // Мониторинг производительности
        this.performanceMetrics = {
            initTime: performance.now() - this.initStartTime,
            memoryUsage: performance.memory ? performance.memory.usedJSHeapSize : 'N/A',
            componentCount: this.core?.canvasNodes?.size || 0,
            connectionCount: this.core?.connections?.size || 0
        };

        // Периодическое обновление метрик
        this.metricsInterval = setInterval(() => {
            this._updateMetrics();
        }, 30000); // Каждые 30 секунд

        // Отладочная информация
        this.debug = {
            version: this.version,
            buildDate: this.buildDate,
            modules: Array.from(this.modules.keys()),
            state: this.state,
            core: this.core?.getDebugInfo?.() || 'N/A'
        };

        // Экспорт в глобальную область для отладки
        window.attackConstructorDebug = this.debug;

        console.log('✅ Monitoring setup completed');
    }

    /**
     * Уведомление о готовности модуля
     */
    _notifyReady() {
        // Отправляем событие готовности
        const readyEvent = new CustomEvent('attackConstructorReady', {
            detail: {
                version: this.version,
                initTime: performance.now() - this.initStartTime,
                modules: Array.from(this.modules.keys())
            }
        });

        document.dispatchEvent(readyEvent);

        // Уведомляем приложение
        if (window.app?.emit) {
            window.app.emit('moduleReady', {
                module: 'attack-constructor',
                version: this.version
            });
        }

        // Показываем уведомление пользователю
        if (window.app?.showSuccessNotification) {
            window.app.showSuccessNotification('Конструктор сигнатурного анализа готов к работе');
        }

        console.log('📢 Ready notification sent');
    }

    /**
     * Обработка ошибок инициализации
     */
    _handleInitializationError(error) {
        console.error('💥 Initialization error handler:', error);

        // Отправляем событие об ошибке
        const errorEvent = new CustomEvent('attackConstructorError', {
            detail: {
                error: error.message,
                stack: error.stack,
                timestamp: Date.now()
            }
        });

        document.dispatchEvent(errorEvent);

        // Уведомляем пользователя
        if (window.app?.showErrorNotification) {
            window.app.showErrorNotification(
                'Ошибка инициализации конструктора сигнатурного анализа. Попробуйте обновить страницу.'
            );
        }

        // Телеметрия
        if (window.app?.telemetry?.logError) {
            window.app.telemetry.logError('attack-constructor-init-error', {
                message: error.message,
                stack: error.stack,
                modules: this.moduleLoader.getLoadingStatus()
            });
        }
    }

    // =======================================================
    // МЕТОДЫ ЖИЗНЕННОГО ЦИКЛА
    // =======================================================

    /**
     * Активация модуля
     */
    activate() {
        console.log('🟢 Activating Attack Constructor...');

        this.state.isActive = true;
        this.state.lastActivity = Date.now();

        // Активируем core модуль
        if (this.core?.activate) {
            this.core.activate();
        }

        // Восстанавливаем состояние если есть
        this._restoreState();

        this.emit('activated');
    }

    /**
     * Деактивация модуля
     */
    deactivate() {
        console.log('🟡 Deactivating Attack Constructor...');

        this.state.isActive = false;

        // Сохраняем состояние
        this._saveState();

        // Деактивируем core модуль
        if (this.core?.deactivate) {
            this.core.deactivate();
        }

        this.emit('deactivated');
    }

    /**
     * Очистка ресурсов
     */
    cleanup() {
        console.log('🧹 Cleaning up Attack Constructor...');

        try {
            // Сохраняем состояние
            this._saveState();

            // Очищаем core модуль
            if (this.core?.cleanup) {
                this.core.cleanup();
            }

            // Очищаем интервалы
            if (this.metricsInterval) {
                clearInterval(this.metricsInterval);
            }

            // Очищаем обработчики событий
            this.eventHandlers.clear();

            // Очищаем модули
            this.modules.clear();

            // Очищаем глобальные ссылки
            if (window.attackConstructor === this) {
                window.attackConstructor = null;
            }

            this.isInitialized = false;
            this.state.isActive = false;

            console.log('✅ Cleanup completed');

        } catch (error) {
            console.error('❌ Error during cleanup:', error);
        }
    }

    // =======================================================
    // МЕТОДЫ УПРАВЛЕНИЯ СОСТОЯНИЕМ
    // =======================================================

    /**
     * Сохранение текущего состояния
     */
    _saveState() {
        try {
            const stateData = {
                version: this.version,
                timestamp: Date.now(),
                rule: this.core?.currentRule || null,
                nodes: this.core?.canvasNodes ? Array.from(this.core.canvasNodes.values()) : [],
                connections: this.core?.connections ? Array.from(this.core.connections.values()) : [],
                selectedTab: this.core?.currentTab || 'properties',
                hasUnsavedChanges: this.state.hasUnsavedChanges
            };

            localStorage.setItem('attack-constructor-state', JSON.stringify(stateData));
            console.log('💾 State saved');

        } catch (error) {
            console.error('❌ Error saving state:', error);
        }
    }

    /**
     * Восстановление сохраненного состояния
     */
    _restoreState() {
        try {
            const savedState = localStorage.getItem('attack-constructor-state');
            if (!savedState) return;

            const stateData = JSON.parse(savedState);

            // Проверяем актуальность состояния (не старше 24 часов)
            const ageHours = (Date.now() - stateData.timestamp) / (1000 * 60 * 60);
            if (ageHours > 24) {
                console.log('⏰ Saved state too old, ignoring');
                return;
            }

            console.log('🔄 Restoring saved state...');

            // Восстанавливаем состояние в core модуле
            if (this.core && stateData.rule) {
                // Логика восстановления будет зависеть от реализации core модуля
                console.log('📋 State restoration available');
            }

        } catch (error) {
            console.error('❌ Error restoring state:', error);
        }
    }

    // =======================================================
    // ОБРАБОТЧИКИ СОБЫТИЙ
    // =======================================================

    /**
     * Обработчик события beforeunload
     */
    _handleBeforeUnload(event) {
        if (this.state.hasUnsavedChanges) {
            const message = 'У вас есть несохраненные изменения. Покинуть страницу?';
            event.returnValue = message;
            return message;
        }
    }

    /**
     * Обработчик события unload
     */
    _handleUnload() {
        this._saveState();
    }

    /**
     * Обработчик глобальных ошибок
     */
    _handleGlobalError(event) {
        if (event.filename && event.filename.includes('attack-constructor')) {
            console.error('❌ Global error in Attack Constructor:', event.error);

            // Телеметрия
            if (window.app?.telemetry?.logError) {
                window.app.telemetry.logError('attack-constructor-runtime-error', {
                    message: event.message,
                    filename: event.filename,
                    lineno: event.lineno,
                    colno: event.colno,
                    stack: event.error?.stack
                });
            }
        }
    }

    /**
     * Обработчик изменения видимости страницы
     */
    _handleVisibilityChange() {
        if (document.hidden) {
            console.log('👁️ Page hidden - pausing activity');
            this._saveState();
        } else {
            console.log('👁️ Page visible - resuming activity');
            this.state.lastActivity = Date.now();
        }
    }

    /**
     * Обработчики жизненного цикла страниц
     */
    _handlePageCleanup() {
        console.log('🧹 Page cleanup triggered');
        this.cleanup();
    }

    _handlePageActivate() {
        console.log('🟢 Page activate triggered');
        this.activate();
    }

    _handlePageDeactivate() {
        console.log('🟡 Page deactivate triggered');
        this.deactivate();
    }

    /**
     * Настройка горячих клавиш
     */
    _setupKeyboardShortcuts() {
        // Горячие клавиши управляются core модулем
        console.log('⌨️ Keyboard shortcuts managed by core module');
    }

    // =======================================================
    // СИСТЕМА СОБЫТИЙ
    // =======================================================

    on(event, handler) {
        if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, []);
        }
        this.eventHandlers.get(event).push(handler);
    }

    off(event, handler) {
        if (this.eventHandlers.has(event)) {
            const handlers = this.eventHandlers.get(event);
            const index = handlers.indexOf(handler);
            if (index > -1) {
                handlers.splice(index, 1);
            }
        }
    }

    emit(event, data) {
        if (this.eventHandlers.has(event)) {
            this.eventHandlers.get(event).forEach(handler => {
                try {
                    handler(data);
                } catch (error) {
                    console.error(`Error in event handler for ${event}:`, error);
                }
            });
        }
    }

    // =======================================================
    // УТИЛИТАРНЫЕ МЕТОДЫ
    // =======================================================

    /**
     * Обновление метрик производительности
     */
    _updateMetrics() {
        if (performance.memory) {
            this.performanceMetrics.memoryUsage = performance.memory.usedJSHeapSize;
        }

        if (this.core) {
            this.performanceMetrics.componentCount = this.core.canvasNodes?.size || 0;
            this.performanceMetrics.connectionCount = this.core.connections?.size || 0;
        }

        this.performanceMetrics.lastUpdate = Date.now();
    }

    /**
     * Получение информации о состоянии модуля
     */
    getStatus() {
        return {
            version: this.version,
            isInitialized: this.isInitialized,
            isActive: this.state.isActive,
            modules: Array.from(this.modules.keys()),
            performance: this.performanceMetrics,
            core: this.core?.getDebugInfo?.() || null
        };
    }

    /**
     * Проксирование методов к core модулю
     */
    _setupCoreProxy() {
        const coreMethods = [
            'validateRule',
            'saveSignatureRule',
            'loadRuleTemplate',
            'runRuleTest',
            'generateRuleOutput',
            'clearRuleCanvas',
            'autoLayoutRule'
        ];

        coreMethods.forEach(method => {
            this[method] = (...args) => {
                if (this.core && typeof this.core[method] === 'function') {
                    return this.core[method](...args);
                } else {
                    console.warn(`⚠️ Core method ${method} not available`);
                    return null;
                }
            };
        });
    }
}

// =======================================================
// АВТОМАТИЧЕСКАЯ ИНИЦИАЛИЗАЦИЯ
// =======================================================

/**
 * Глобальный экземпляр Attack Constructor
 */
let attackConstructorInstance = null;

/**
 * Функция инициализации Attack Constructor
 */
async function initAttackConstructor() {
    console.log('🚀 Initializing Attack Constructor Main Module...');

    try {
        // Проверяем, не инициализирован ли уже
        if (attackConstructorInstance) {
            console.log('✅ Attack Constructor already initialized');
            return attackConstructorInstance;
        }

        // Создаем и инициализируем экземпляр
        attackConstructorInstance = new AttackConstructor();
        await attackConstructorInstance.initialize();

        // Устанавливаем прокси методы
        attackConstructorInstance._setupCoreProxy();

        // Глобальная доступность
        window.attackConstructor = attackConstructorInstance;

        return attackConstructorInstance;

    } catch (error) {
        console.error('❌ Attack Constructor initialization failed:', error);

        // Показываем пользователю критическую ошибку
        if (window.app?.showErrorNotification) {
            window.app.showErrorNotification(
                'Критическая ошибка загрузки конструктора сигнатурного анализа. Обратитесь к администратору.'
            );
        }

        throw error;
    }
}

/**
 * Функция проверки готовности DOM
 */
function waitForDOMReady() {
    return new Promise((resolve) => {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', resolve);
        } else {
            resolve();
        }
    });
}

/**
 * Автоматическая инициализация при загрузке
 */
(async () => {
    try {
        // Ждем готовности DOM
        await waitForDOMReady();

        // Небольшая задержка для загрузки других скриптов
        await new Promise(resolve => setTimeout(resolve, 100));

        // Инициализируем Attack Constructor
        await initAttackConstructor();

        console.log('🎉 Attack Constructor fully initialized and ready!');

    } catch (error) {
        console.error('💥 Critical initialization failure:', error);
    }
})();

// =======================================================
// ЭКСПОРТЫ И ГЛОБАЛЬНАЯ ИНТЕГРАЦИЯ
// =======================================================

// Экспорт для модульных систем
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AttackConstructor,
        AttackConstructorModuleLoader,
        initAttackConstructor
    };
}

// ES6 экспорты
if (typeof window !== 'undefined' && window.moduleSystem === 'es6') {
    window.AttackConstructorExports = {
        AttackConstructor,
        AttackConstructorModuleLoader,
        initAttackConstructor
    };
}

// =======================================================
// BACKWARD COMPATIBILITY & LEGACY SUPPORT
// =======================================================

/**
 * Обратная совместимость с предыдущими версиями
 */
if (typeof window !== 'undefined') {
    // Alias для старых версий
    window.SignatureConstructor = AttackConstructor;
    window.initSignatureConstructor = initAttackConstructor;

    // Event для интеграции с legacy кодом
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            const legacyEvent = new CustomEvent('signatureConstructorModuleLoaded', {
                detail: {
                    version: '4.0.0-Enhanced-Main',
                    timestamp: Date.now(),
                    legacy: true
                }
            });
            document.dispatchEvent(legacyEvent);
        }, 500);
    });
}

// =======================================================
// ФИНАЛИЗАЦИЯ МОДУЛЯ
// =======================================================

console.log('✅ Attack Constructor Main Module v4.0.0-Enhanced loaded successfully');

/**
 * =======================================================
 * КОНЕЦ ФАЙЛА attack-constructor.js
 * 
 * IP Roast Enterprise 4.0 - Attack Constructor Main Module
 * Центральная точка входа и оркестрации всей экосистемы
 * Версия: 4.0.0-Enhanced-Main
 * 
 * Ключевые возможности:
 * - Модульная архитектура с lazy loading
 * - Автоматическая инициализация и управление жизненным циклом
 * - Интеграция с Enhanced PageManager
 * - Обработка ошибок и восстановление состояния
 * - Мониторинг производительности и отладка
 * - Обратная совместимость с legacy кодом
 * - Enterprise-уровень надежности и масштабируемости
 * =======================================================
 */
