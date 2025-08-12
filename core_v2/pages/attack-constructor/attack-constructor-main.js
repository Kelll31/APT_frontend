/**
 * IP Roast Enterprise 4.0 - Attack Constructor Main Integration
 * Главный файл интеграции всех модулей конструктора атак
 * Version: 4.1.0-Complete-Production
 */

console.log('🏗️ Loading Attack Constructor Complete System v4.1.0');

class AttackConstructorMainSystem {
    constructor() {
        this.version = '4.1.0-Complete-Production';
        this.modules = new Map();
        this.isInitialized = false;
        this.core = null;

        // Состояние системы
        this.state = {
            currentScenario: null,
            activeNodes: new Map(),
            connections: new Map(),
            selectedTool: null,
            isExecuting: false
        };

        console.log('🎯 Attack Constructor Main System initialized');
    }

    /**
     * Полная инициализация всех модулей
     */
    async initialize() {
        try {
            console.log('🚀 Starting complete system initialization...');

            // 1. Инициализация Core модуля
            await this.initializeCore();

            // 2. Загрузка UI Manager
            await this.initializeUIManager();

            // 3. Загрузка Canvas Manager
            await this.initializeCanvasManager();

            // 4. Загрузка Connection Manager
            await this.initializeConnectionManager();

            // 5. Загрузка Signature Components
            await this.initializeSignatureComponents();

            // 6. Загрузка Rule Templates
            await this.initializeRuleTemplates();

            // 7. Загрузка Rule Generator
            await this.initializeRuleGenerator();

            // 8. Загрузка Test Manager
            await this.initializeTestManager();

            // 9. Интеграция модулей
            this.integrateModules();

            // 10. Настройка UI
            await this.setupUserInterface();

            this.isInitialized = true;
            console.log('✅ Complete system initialization successful!');

            // Уведомляем о готовности
            this.notifySystemReady();

        } catch (error) {
            console.error('❌ System initialization failed:', error);
            throw error;
        }
    }

    /**
     * Инициализация Core модуля
     */
    async initializeCore() {
        console.log('🔧 Initializing Core Module...');

        if (window.AttackConstructorCore) {
            this.core = new window.AttackConstructorCore();
            await this.core.initialize();
        } else if (window.signatureConstructor) {
            this.core = window.signatureConstructor;
        } else {
            throw new Error('Core module not available');
        }

        this.modules.set('core', this.core);
        console.log('✅ Core Module initialized');
    }

    /**
     * Инициализация UI Manager
     */
    async initializeUIManager() {
        console.log('🎨 Initializing UI Manager...');

        const uiManager = new UIManager(this.core);
        await uiManager.initialize();

        // Настройка основных панелей
        uiManager.setupToolboxPanel();
        uiManager.setupPropertiesPanel();
        uiManager.setupResultsPanel();
        uiManager.setupMenuSystem();

        this.modules.set('uiManager', uiManager);
        console.log('✅ UI Manager initialized');
    }

    /**
     * Инициализация Canvas Manager
     */
    async initializeCanvasManager() {
        console.log('🖼️ Initializing Canvas Manager...');

        const canvasManager = new CanvasManager('rule-canvas');
        await canvasManager.initialize();

        // Настройка canvas
        canvasManager.setupGrid();
        canvasManager.setupZoomControls();
        canvasManager.setupDragAndDrop();

        this.modules.set('canvasManager', canvasManager);
        console.log('✅ Canvas Manager initialized');
    }

    /**
     * Инициализация Connection Manager
     */
    async initializeConnectionManager() {
        console.log('🔗 Initializing Connection Manager...');

        const connectionManager = new ConnectionManager(
            this.modules.get('canvasManager')
        );
        await connectionManager.initialize();

        this.modules.set('connectionManager', connectionManager);
        console.log('✅ Connection Manager initialized');
    }

    /**
     * Инициализация Signature Components
     */
    async initializeSignatureComponents() {
        console.log('📦 Initializing Signature Components...');

        const sigComponents = new SignatureComponentsManager();
        await sigComponents.initialize();

        // Загрузка компонентов атак
        await sigComponents.loadAttackModules();

        this.modules.set('signatureComponents', sigComponents);
        console.log('✅ Signature Components initialized');
    }

    /**
     * Инициализация Rule Templates
     */
    async initializeRuleTemplates() {
        console.log('📋 Initializing Rule Templates...');

        const ruleTemplates = new RuleTemplateManager();
        await ruleTemplates.initialize();

        // Загрузка шаблонов
        await ruleTemplates.loadTemplatesFromDirectory('./templates/');

        this.modules.set('ruleTemplates', ruleTemplates);
        console.log('✅ Rule Templates initialized');
    }

    /**
     * Инициализация Rule Generator
     */
    async initializeRuleGenerator() {
        console.log('⚙️ Initializing Rule Generator...');

        const ruleGenerator = new RuleGenerator(this.core);
        await ruleGenerator.initialize();

        this.modules.set('ruleGenerator', ruleGenerator);
        console.log('✅ Rule Generator initialized');
    }

    /**
     * Инициализация Test Manager
     */
    async initializeTestManager() {
        console.log('🧪 Initializing Test Manager...');

        const testManager = new TestManager(this.core);
        await testManager.initialize();

        this.modules.set('testManager', testManager);
        console.log('✅ Test Manager initialized');
    }

    /**
     * Интеграция всех модулей
     */
    integrateModules() {
        console.log('🔗 Integrating all modules...');

        const canvas = this.modules.get('canvasManager');
        const connections = this.modules.get('connectionManager');
        const ui = this.modules.get('uiManager');
        const components = this.modules.get('signatureComponents');

        // Связываем Canvas и Connections
        canvas.setConnectionManager(connections);
        connections.setCanvas(canvas);

        // Связываем UI с остальными модулями
        ui.setCanvasManager(canvas);
        ui.setConnectionManager(connections);
        ui.setSignatureComponents(components);

        // Настраиваем обработчики событий между модулями
        this.setupModuleEventHandlers();

        console.log('✅ Module integration completed');
    }

    /**
     * Настройка обработчиков событий между модулями
     */
    setupModuleEventHandlers() {
        const canvas = this.modules.get('canvasManager');
        const ui = this.modules.get('uiManager');
        const components = this.modules.get('signatureComponents');

        // События Canvas -> UI
        canvas.on('nodeSelected', (node) => {
            ui.updatePropertiesPanel(node);
        });

        canvas.on('nodeAdded', (node) => {
            ui.updateNodeCount();
        });

        // События UI -> Canvas
        ui.on('toolSelected', (tool) => {
            canvas.setActiveTool(tool);
        });

        // События компонентов
        components.on('componentDropped', (component, position) => {
            canvas.addNode(component, position);
        });
    }

    /**
     * Настройка пользовательского интерфейса
     */
    async setupUserInterface() {
        console.log('🎨 Setting up user interface...');

        const ui = this.modules.get('uiManager');
        const components = this.modules.get('signatureComponents');
        const templates = this.modules.get('ruleTemplates');

        // Заполнение панели инструментов
        await ui.populateToolbox(components.getAllComponents());

        // Заполнение шаблонов
        await ui.populateTemplates(templates.getAllTemplates());

        // Настройка меню действий
        ui.setupActionMenu([
            {
                id: 'new-scenario',
                label: 'Новый сценарий',
                action: () => this.createNewScenario()
            },
            {
                id: 'save-scenario',
                label: 'Сохранить сценарий',
                action: () => this.saveCurrentScenario()
            },
            {
                id: 'load-scenario',
                label: 'Загрузить сценарий',
                action: () => this.loadScenario()
            },
            {
                id: 'execute-scenario',
                label: 'Выполнить сценарий',
                action: () => this.executeScenario()
            }
        ]);

        console.log('✅ User interface setup completed');
    }

    /**
     * Создание нового сценария атак
     */
    createNewScenario() {
        console.log('📋 Creating new attack scenario...');

        const canvas = this.modules.get('canvasManager');
        canvas.clearCanvas();

        this.state.currentScenario = {
            id: `scenario_${Date.now()}`,
            name: 'Новый сценарий атак',
            description: '',
            created: new Date(),
            modules: [],
            connections: []
        };

        // Обновляем UI
        const ui = this.modules.get('uiManager');
        ui.updateScenarioInfo(this.state.currentScenario);
    }

    /**
     * Сохранение текущего сценария
     */
    async saveCurrentScenario() {
        console.log('💾 Saving current scenario...');

        if (!this.state.currentScenario) {
            alert('Нет активного сценария для сохранения');
            return;
        }

        const canvas = this.modules.get('canvasManager');
        const connections = this.modules.get('connectionManager');

        // Собираем данные сценария
        const scenarioData = {
            ...this.state.currentScenario,
            modules: canvas.getAllNodes(),
            connections: connections.getAllConnections(),
            savedAt: new Date()
        };

        // Сохраняем в localStorage (в production можно использовать API)
        const scenarioKey = `attack_scenario_${scenarioData.id}`;
        localStorage.setItem(scenarioKey, JSON.stringify(scenarioData));

        alert('Сценарий успешно сохранен!');
    }

    /**
     * Выполнение сценария атак
     */
    async executeScenario() {
        console.log('🚀 Executing attack scenario...');

        if (this.state.isExecuting) {
            alert('Сценарий уже выполняется');
            return;
        }

        const canvas = this.modules.get('canvasManager');
        const testManager = this.modules.get('testManager');
        const ui = this.modules.get('uiManager');

        const nodes = canvas.getAllNodes();
        if (nodes.length === 0) {
            alert('Добавьте модули атак в сценарий');
            return;
        }

        try {
            this.state.isExecuting = true;
            ui.showExecutionProgress();

            // Валидация сценария
            const validation = await this.validateScenario();
            if (!validation.isValid) {
                throw new Error(`Ошибка валидации: ${validation.errors.join(', ')}`);
            }

            // Выполнение через Test Manager
            const results = await testManager.executeScenario({
                nodes,
                connections: this.modules.get('connectionManager').getAllConnections()
            });

            // Отображение результатов
            ui.displayExecutionResults(results);

        } catch (error) {
            console.error('❌ Scenario execution failed:', error);
            alert(`Ошибка выполнения: ${error.message}`);
        } finally {
            this.state.isExecuting = false;
            ui.hideExecutionProgress();
        }
    }

    /**
     * Валидация сценария перед выполнением
     */
    async validateScenario() {
        const canvas = this.modules.get('canvasManager');
        const connections = this.modules.get('connectionManager');

        const validation = {
            isValid: true,
            errors: [],
            warnings: []
        };

        const nodes = canvas.getAllNodes();

        // Проверка наличия узлов
        if (nodes.length === 0) {
            validation.errors.push('Сценарий должен содержать хотя бы один модуль');
            validation.isValid = false;
        }

        // Проверка конфигурации узлов
        for (const node of nodes) {
            if (!node.isConfigured) {
                validation.errors.push(`Модуль "${node.name}" не сконфигурирован`);
                validation.isValid = false;
            }
        }

        // Проверка связей
        const nodeConnections = connections.getAllConnections();
        if (nodes.length > 1 && nodeConnections.length === 0) {
            validation.warnings.push('Модули не связаны между собой');
        }

        return validation;
    }

    /**
     * Уведомление о готовности системы
     */
    notifySystemReady() {
        // Отправляем событие готовности
        const event = new CustomEvent('attackConstructorSystemReady', {
            detail: {
                version: this.version,
                modules: Array.from(this.modules.keys()),
                timestamp: Date.now()
            }
        });

        document.dispatchEvent(event);

        // Показываем уведомление пользователю
        if (window.app?.showSuccessNotification) {
            window.app.showSuccessNotification(
                'Конструктор атак полностью загружен и готов к работе!'
            );
        }
    }

    /**
     * Получение статуса системы
     */
    getSystemStatus() {
        return {
            version: this.version,
            isInitialized: this.isInitialized,
            modules: Object.fromEntries(
                Array.from(this.modules.entries()).map(([name, module]) => [
                    name,
                    {
                        loaded: !!module,
                        initialized: module.isInitialized || false
                    }
                ])
            ),
            state: this.state
        };
    }
}

// Создаем и экспортируем глобальный экземпляр
window.attackConstructorMainSystem = new AttackConstructorMainSystem();

// Автоматическая инициализация
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await window.attackConstructorMainSystem.initialize();
    } catch (error) {
        console.error('Failed to initialize Attack Constructor System:', error);
    }
});
