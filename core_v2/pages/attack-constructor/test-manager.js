/**
 * IP Roast Enterprise 4.0 - Test Manager Module
 * Тестирование и валидация правил сигнатурного анализа
 * Версия: 4.0.0-Enhanced-Testing
 * 
 * @description Специализированный модуль для тестирования правил и компонентов
 * @author IP Roast Security Team
 * @requires attack-constructor-core.js, canvas-manager.js, connection-manager.js
 * @integrates rule-generator, signature-components, ui-manager
 */

console.log('🧪 Loading Test Manager v4.0.0-Enhanced');

/**
 * Основной класс для управления тестированием
 */
class TestManager {
    constructor(coreInstance, canvasManager, connectionManager, ruleGenerator) {
        this.version = '4.0.0-Enhanced-Testing';
        this.core = coreInstance;
        this.canvasManager = canvasManager;
        this.connectionManager = connectionManager;
        this.ruleGenerator = ruleGenerator;
        this.isInitialized = false;

        // Состояние тестирования
        this.isTestRunning = false;
        this.currentTest = null;
        this.testResults = new Map();
        this.testHistory = [];

        // Типы тестов
        this.testTypes = {
            'component-validation': {
                name: 'Валидация компонентов',
                description: 'Проверка корректности параметров компонентов',
                category: 'validation',
                priority: 'high'
            },
            'rule-syntax': {
                name: 'Синтаксис правила',
                description: 'Проверка синтаксической корректности правила',
                category: 'syntax',
                priority: 'high'
            },
            'logic-validation': {
                name: 'Логическая валидация',
                description: 'Проверка логической целостности соединений',
                category: 'logic',
                priority: 'high'
            },
            'performance-test': {
                name: 'Тест производительности',
                description: 'Оценка производительности правила',
                category: 'performance',
                priority: 'medium'
            },
            'data-simulation': {
                name: 'Симуляция данных',
                description: 'Тестирование на синтетических данных',
                category: 'simulation',
                priority: 'medium'
            },
            'format-generation': {
                name: 'Генерация форматов',
                description: 'Тестирование генерации в различные форматы',
                category: 'generation',
                priority: 'low'
            },
            'false-positive': {
                name: 'Ложные срабатывания',
                description: 'Анализ вероятности ложных срабатываний',
                category: 'accuracy',
                priority: 'medium'
            },
            'coverage-analysis': {
                name: 'Анализ покрытия',
                description: 'Оценка покрытия угроз правилом',
                category: 'coverage',
                priority: 'low'
            }
        };

        // Источники тестовых данных
        this.dataSources = {
            'sample': {
                name: 'Образцы данных',
                description: 'Встроенные тестовые образцы',
                available: true
            },
            'generated': {
                name: 'Сгенерированные данные',
                description: 'Автоматически сгенерированные тестовые данные',
                available: true
            },
            'upload': {
                name: 'Загруженный файл',
                description: 'Пользовательские тестовые данные',
                available: true
            },
            'live': {
                name: 'Живой трафик',
                description: 'Реальный сетевой трафик (требует настройки)',
                available: false
            }
        };

        // Настройки тестирования
        this.testSettings = {
            timeout: 30000, // 30 секунд
            maxDataSize: 10 * 1024 * 1024, // 10MB
            simulationIterations: 1000,
            performanceThreshold: 100, // ms
            accuracyThreshold: 0.95,
            enableDetailedLogs: true,
            autoSaveResults: true
        };

        // Метрики тестирования
        this.testMetrics = {
            totalTests: 0,
            passedTests: 0,
            failedTests: 0,
            skippedTests: 0,
            avgTestTime: 0,
            totalTestTime: 0,
            lastTestTime: null
        };

        // Кэширование и производительность
        this.validationCache = new Map();
        this.testDataCache = new Map();
        this.resultCache = new Map();

        // События
        this.eventHandlers = new Map();
        this.testEventListeners = new Map();

        console.log('🧪 Test Manager initialized');
    }

    /**
     * Инициализация Test Manager
     */
    async initialize() {
        try {
            console.log('🚀 Initializing Test Manager...');

            this.setupEventListeners();
            this.initializeTestData();
            this.setupValidationRules();
            this.initializeUI();
            this.loadTestHistory();

            this.isInitialized = true;
            console.log('✅ Test Manager initialized successfully');

        } catch (error) {
            console.error('❌ Test Manager initialization failed:', error);
            throw error;
        }
    }

    /**
     * Настройка обработчиков событий
     */
    setupEventListeners() {
        // События от core модуля
        if (this.core) {
            this.core.on?.('ruleUpdated', this.handleRuleUpdated.bind(this));
            this.core.on?.('componentAdded', this.handleComponentChange.bind(this));
            this.core.on?.('componentDeleted', this.handleComponentChange.bind(this));
            this.core.on?.('parameterChanged', this.handleParameterChange.bind(this));
        }

        // События от canvas manager
        if (this.canvasManager) {
            this.canvasManager.on?.('nodePositionChanged', this.handleNodeChange.bind(this));
            this.canvasManager.on?.('canvasCleared', this.handleCanvasCleared.bind(this));
        }

        // События от connection manager
        if (this.connectionManager) {
            this.connectionManager.on?.('connectionCreated', this.handleConnectionChange.bind(this));
            this.connectionManager.on?.('connectionDeleted', this.handleConnectionChange.bind(this));
            this.connectionManager.on?.('connectionOperatorChanged', this.handleConnectionChange.bind(this));
        }

        console.log('⚡ Test Manager event listeners bound');
    }

    /**
     * Инициализация тестовых данных
     */
    initializeTestData() {
        console.log('📊 Initializing test data...');

        // Встроенные тестовые образцы
        this.sampleData = {
            'network-traffic': {
                name: 'Сетевой трафик',
                data: this.generateNetworkTrafficSamples(),
                size: 1000
            },
            'malware-samples': {
                name: 'Образцы malware',
                data: this.generateMalwareSamples(),
                size: 500
            },
            'log-entries': {
                name: 'Лог записи',
                data: this.generateLogEntriesSamples(),
                size: 2000
            },
            'file-samples': {
                name: 'Файловые образцы',
                data: this.generateFileSamples(),
                size: 300
            }
        };

        console.log('✅ Test data initialized');
    }

    /**
     * Настройка правил валидации
     */
    setupValidationRules() {
        this.validationRules = {
            // Правила для компонентов
            components: {
                'ip-address': (params) => this.validateIpAddress(params),
                'port-range': (params) => this.validatePortRange(params),
                'file-hash': (params) => this.validateFileHash(params),
                'regex-pattern': (params) => this.validateRegexPattern(params),
                'string-match': (params) => this.validateStringMatch(params)
            },

            // Правила для соединений
            connections: {
                maxInputs: 10,
                maxOutputs: 10,
                allowCycles: false,
                allowSelfConnect: false
            },

            // Правила для правил
            rules: {
                minComponents: 1,
                maxComponents: 50,
                maxConnections: 100,
                requiredFields: ['name', 'type', 'priority']
            }
        };

        console.log('✅ Validation rules setup');
    }

    /**
     * Инициализация UI элементов
     */
    initializeUI() {
        // Привязываем обработчики к элементам управления тестами
        const testButtons = {
            'run-all-tests': () => this.runAllTests(),
            'run-validation': () => this.runTest('component-validation'),
            'run-syntax-check': () => this.runTest('rule-syntax'),
            'run-performance': () => this.runTest('performance-test'),
            'run-simulation': () => this.runTest('data-simulation')
        };

        Object.entries(testButtons).forEach(([buttonId, handler]) => {
            const button = document.getElementById(buttonId);
            if (button) {
                button.addEventListener('click', handler);
            }
        });

        // Источники данных
        const dataSourceSelect = document.getElementById('test-data-source');
        if (dataSourceSelect) {
            dataSourceSelect.addEventListener('change', (e) => {
                this.handleDataSourceChange(e.target.value);
            });
        }

        // Загрузка файлов
        const fileInput = document.getElementById('test-data-file');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                this.handleFileUpload(e.target.files[0]);
            });
        }

        console.log('🎛️ Test UI initialized');
    }

    /**
     * Загрузка истории тестов
     */
    loadTestHistory() {
        try {
            const savedHistory = localStorage.getItem('test-manager-history');
            if (savedHistory) {
                this.testHistory = JSON.parse(savedHistory);
                console.log(`📚 Loaded ${this.testHistory.length} test records`);
            }
        } catch (error) {
            console.warn('⚠️ Error loading test history:', error);
        }
    }

    // =======================================================
    // ОСНОВНЫЕ МЕТОДЫ ТЕСТИРОВАНИЯ
    // =======================================================

    /**
     * Запуск всех тестов
     */
    async runAllTests() {
        if (this.isTestRunning) {
            console.warn('⚠️ Test already in progress');
            return;
        }

        console.log('🧪 Running all tests...');
        const startTime = performance.now();

        try {
            this.isTestRunning = true;
            this.updateTestUI('running');

            const testSuite = {
                id: this.generateTestId(),
                name: 'Полный набор тестов',
                timestamp: new Date().toISOString(),
                tests: [],
                results: {
                    total: 0,
                    passed: 0,
                    failed: 0,
                    skipped: 0,
                    warnings: 0
                },
                duration: 0
            };

            // Выполняем тесты по приоритету
            const testOrder = this.getTestExecutionOrder();

            for (const testType of testOrder) {
                try {
                    const testResult = await this.runSingleTest(testType, testSuite.id);
                    testSuite.tests.push(testResult);
                    testSuite.results.total++;

                    if (testResult.status === 'passed') {
                        testSuite.results.passed++;
                    } else if (testResult.status === 'failed') {
                        testSuite.results.failed++;
                    } else {
                        testSuite.results.skipped++;
                    }

                    testSuite.results.warnings += testResult.warnings?.length || 0;

                    // Обновляем прогресс
                    this.updateTestProgress(testSuite);

                } catch (error) {
                    console.error(`❌ Test ${testType} failed:`, error);
                    testSuite.tests.push({
                        type: testType,
                        status: 'error',
                        error: error.message,
                        duration: 0
                    });
                    testSuite.results.failed++;
                    testSuite.results.total++;
                }
            }

            testSuite.duration = performance.now() - startTime;

            // Сохраняем результаты
            this.saveTestResults(testSuite);
            this.addToHistory(testSuite);

            // Обновляем метрики
            this.updateTestMetrics(testSuite);

            // Показываем результаты
            this.displayTestResults(testSuite);

            console.log(`✅ All tests completed in ${testSuite.duration.toFixed(2)}ms`);

            return testSuite;

        } finally {
            this.isTestRunning = false;
            this.updateTestUI('idle');
        }
    }

    /**
     * Запуск отдельного теста
     */
    async runTest(testType) {
        if (!this.testTypes[testType]) {
            throw new Error(`Unknown test type: ${testType}`);
        }

        console.log(`🧪 Running test: ${testType}`);
        const result = await this.runSingleTest(testType);

        // Отображаем результат
        this.displaySingleTestResult(result);

        return result;
    }

    /**
     * Выполнение одного теста
     */
    async runSingleTest(testType, suiteId = null) {
        const testDefinition = this.testTypes[testType];
        const startTime = performance.now();

        const testResult = {
            id: this.generateTestId(),
            suiteId,
            type: testType,
            name: testDefinition.name,
            category: testDefinition.category,
            status: 'running',
            startTime: new Date().toISOString(),
            duration: 0,
            results: {},
            errors: [],
            warnings: [],
            details: {}
        };

        try {
            // Выполняем конкретный тест
            switch (testType) {
                case 'component-validation':
                    await this.runComponentValidation(testResult);
                    break;
                case 'rule-syntax':
                    await this.runRuleSyntaxTest(testResult);
                    break;
                case 'logic-validation':
                    await this.runLogicValidation(testResult);
                    break;
                case 'performance-test':
                    await this.runPerformanceTest(testResult);
                    break;
                case 'data-simulation':
                    await this.runDataSimulation(testResult);
                    break;
                case 'format-generation':
                    await this.runFormatGeneration(testResult);
                    break;
                case 'false-positive':
                    await this.runFalsePositiveTest(testResult);
                    break;
                case 'coverage-analysis':
                    await this.runCoverageAnalysis(testResult);
                    break;
                default:
                    throw new Error(`Test implementation not found: ${testType}`);
            }

            // Определяем итоговый статус
            if (testResult.errors.length > 0) {
                testResult.status = 'failed';
            } else if (testResult.warnings.length > 0) {
                testResult.status = 'warning';
            } else {
                testResult.status = 'passed';
            }

        } catch (error) {
            testResult.status = 'error';
            testResult.errors.push({
                type: 'execution_error',
                message: error.message,
                stack: error.stack
            });
        }

        testResult.duration = performance.now() - startTime;
        testResult.endTime = new Date().toISOString();

        // Уведомляем о завершении теста
        this.emit('testCompleted', testResult);

        return testResult;
    }

    // =======================================================
    // РЕАЛИЗАЦИЯ КОНКРЕТНЫХ ТЕСТОВ
    // =======================================================

    /**
     * Валидация компонентов
     */
    async runComponentValidation(testResult) {
        console.log('🔍 Running component validation...');

        const nodes = this.canvasManager?.canvasNodes || this.core?.canvasNodes || new Map();
        const validationResults = {
            totalComponents: nodes.size,
            validComponents: 0,
            invalidComponents: 0,
            componentResults: []
        };

        if (nodes.size === 0) {
            testResult.warnings.push({
                type: 'no_components',
                message: 'Нет компонентов для валидации'
            });
            testResult.results = validationResults;
            return;
        }

        // Проверяем каждый компонент
        for (const [nodeId, node] of nodes) {
            const componentResult = {
                nodeId,
                componentType: node.componentId,
                componentName: node.definition?.name || 'Unknown',
                isValid: true,
                errors: [],
                warnings: []
            };

            try {
                // Проверяем параметры компонента
                await this.validateComponentParameters(node, componentResult);

                // Проверяем специфичную валидацию для типа компонента
                await this.validateComponentType(node, componentResult);

                if (componentResult.errors.length > 0) {
                    componentResult.isValid = false;
                    validationResults.invalidComponents++;
                    testResult.errors.push(...componentResult.errors);
                } else {
                    validationResults.validComponents++;
                }

                if (componentResult.warnings.length > 0) {
                    testResult.warnings.push(...componentResult.warnings);
                }

            } catch (error) {
                componentResult.isValid = false;
                componentResult.errors.push({
                    type: 'validation_error',
                    message: `Ошибка валидации компонента: ${error.message}`
                });
                validationResults.invalidComponents++;
            }

            validationResults.componentResults.push(componentResult);
        }

        testResult.results = validationResults;
        console.log(`✅ Component validation completed: ${validationResults.validComponents}/${validationResults.totalComponents} valid`);
    }

    /**
     * Тест синтаксиса правила
     */
    async runRuleSyntaxTest(testResult) {
        console.log('📝 Running rule syntax test...');

        const syntaxResults = {
            ruleNameValid: true,
            ruleTypeValid: true,
            rulePriorityValid: true,
            hasComponents: false,
            hasConnections: false,
            syntaxScore: 0
        };

        const currentRule = this.core?.currentRule || {};

        // Проверяем имя правила
        if (!currentRule.name || currentRule.name.trim().length === 0) {
            syntaxResults.ruleNameValid = false;
            testResult.errors.push({
                type: 'rule_name',
                message: 'Не указано имя правила'
            });
        } else if (currentRule.name.length < 3) {
            syntaxResults.ruleNameValid = false;
            testResult.warnings.push({
                type: 'rule_name_short',
                message: 'Имя правила слишком короткое (менее 3 символов)'
            });
        }

        // Проверяем тип правила
        const validTypes = ['detection', 'prevention', 'monitoring', 'analysis'];
        if (!validTypes.includes(currentRule.type)) {
            syntaxResults.ruleTypeValid = false;
            testResult.errors.push({
                type: 'rule_type',
                message: `Недопустимый тип правила: ${currentRule.type}`
            });
        }

        // Проверяем приоритет
        const validPriorities = ['low', 'medium', 'high', 'critical'];
        if (!validPriorities.includes(currentRule.priority)) {
            syntaxResults.rulePriorityValid = false;
            testResult.warnings.push({
                type: 'rule_priority',
                message: `Неизвестный приоритет: ${currentRule.priority}`
            });
        }

        // Проверяем наличие компонентов
        const nodes = this.canvasManager?.canvasNodes || this.core?.canvasNodes || new Map();
        syntaxResults.hasComponents = nodes.size > 0;

        if (!syntaxResults.hasComponents) {
            testResult.errors.push({
                type: 'no_components',
                message: 'Правило не содержит компонентов'
            });
        }

        // Проверяем соединения
        const connections = this.connectionManager?.connections || this.core?.connections || new Map();
        syntaxResults.hasConnections = connections.size > 0;

        if (nodes.size > 1 && !syntaxResults.hasConnections) {
            testResult.warnings.push({
                type: 'no_connections',
                message: 'Компоненты не соединены между собой'
            });
        }

        // Вычисляем общий балл синтаксиса
        syntaxResults.syntaxScore = this.calculateSyntaxScore(syntaxResults);

        testResult.results = syntaxResults;
        console.log(`✅ Rule syntax test completed with score: ${syntaxResults.syntaxScore}/100`);
    }

    /**
     * Валидация логики
     */
    async runLogicValidation(testResult) {
        console.log('🔗 Running logic validation...');

        const logicResults = {
            hasCircularDependencies: false,
            orphanedComponents: [],
            invalidConnections: [],
            logicalConsistency: true,
            logicScore: 0
        };

        const nodes = this.canvasManager?.canvasNodes || this.core?.canvasNodes || new Map();
        const connections = this.connectionManager?.connections || this.core?.connections || new Map();

        // Проверка на циклические зависимости
        logicResults.hasCircularDependencies = this.detectCircularDependencies(nodes, connections);
        if (logicResults.hasCircularDependencies) {
            testResult.errors.push({
                type: 'circular_dependencies',
                message: 'Обнаружены циклические зависимости в логике правила'
            });
        }

        // Поиск изолированных компонентов
        logicResults.orphanedComponents = this.findOrphanedComponents(nodes, connections);
        if (logicResults.orphanedComponents.length > 0) {
            testResult.warnings.push({
                type: 'orphaned_components',
                message: `Найдено ${logicResults.orphanedComponents.length} изолированных компонентов`
            });
        }

        // Проверка валидности соединений
        for (const [connId, connection] of connections) {
            const validationResult = this.validateConnection(connection, nodes);
            if (!validationResult.isValid) {
                logicResults.invalidConnections.push({
                    connectionId: connId,
                    errors: validationResult.errors
                });
            }
        }

        if (logicResults.invalidConnections.length > 0) {
            testResult.errors.push({
                type: 'invalid_connections',
                message: `Найдено ${logicResults.invalidConnections.length} некорректных соединений`
            });
        }

        // Общая оценка логической согласованности
        logicResults.logicalConsistency =
            !logicResults.hasCircularDependencies &&
            logicResults.invalidConnections.length === 0;

        logicResults.logicScore = this.calculateLogicScore(logicResults);

        testResult.results = logicResults;
        console.log(`✅ Logic validation completed with score: ${logicResults.logicScore}/100`);
    }

    /**
     * Тест производительности
     */
    async runPerformanceTest(testResult) {
        console.log('⚡ Running performance test...');

        const performanceResults = {
            ruleComplexity: 'unknown',
            estimatedProcessingTime: 0,
            memoryUsage: 0,
            scalabilityScore: 0,
            optimizationSuggestions: []
        };

        const nodes = this.canvasManager?.canvasNodes || this.core?.canvasNodes || new Map();
        const connections = this.connectionManager?.connections || this.core?.connections || new Map();

        // Анализ сложности правила
        performanceResults.ruleComplexity = this.calculateRuleComplexity(nodes, connections);

        // Оценка времени обработки
        performanceResults.estimatedProcessingTime = this.estimateProcessingTime(nodes, connections);

        if (performanceResults.estimatedProcessingTime > this.testSettings.performanceThreshold) {
            testResult.warnings.push({
                type: 'slow_performance',
                message: `Оценочное время обработки превышает порог: ${performanceResults.estimatedProcessingTime}ms`
            });
        }

        // Оценка использования памяти
        performanceResults.memoryUsage = this.estimateMemoryUsage(nodes, connections);

        // Масштабируемость
        performanceResults.scalabilityScore = this.calculateScalabilityScore(nodes, connections);

        // Рекомендации по оптимизации
        performanceResults.optimizationSuggestions = this.generateOptimizationSuggestions(nodes, connections);

        testResult.results = performanceResults;
        console.log(`✅ Performance test completed - Complexity: ${performanceResults.ruleComplexity}`);
    }

    /**
     * Симуляция данных
     */
    async runDataSimulation(testResult) {
        console.log('🎲 Running data simulation...');

        const simulationResults = {
            totalIterations: this.testSettings.simulationIterations,
            successfulMatches: 0,
            falsePositives: 0,
            falseNegatives: 0,
            accuracy: 0,
            precision: 0,
            recall: 0,
            details: []
        };

        try {
            // Получаем тестовые данные
            const testData = await this.getTestData();

            if (!testData || testData.length === 0) {
                testResult.warnings.push({
                    type: 'no_test_data',
                    message: 'Нет доступных тестовых данных для симуляции'
                });
                testResult.results = simulationResults;
                return;
            }

            // Запускаем симуляцию
            for (let i = 0; i < Math.min(simulationResults.totalIterations, testData.length); i++) {
                const dataPoint = testData[i];
                const matchResult = await this.simulateRuleMatch(dataPoint);

                simulationResults.details.push(matchResult);

                if (matchResult.matched && matchResult.expectedMatch) {
                    simulationResults.successfulMatches++;
                } else if (matchResult.matched && !matchResult.expectedMatch) {
                    simulationResults.falsePositives++;
                } else if (!matchResult.matched && matchResult.expectedMatch) {
                    simulationResults.falseNegatives++;
                }
            }

            // Вычисляем метрики
            const totalPositive = simulationResults.successfulMatches + simulationResults.falsePositives;
            const totalRelevant = simulationResults.successfulMatches + simulationResults.falseNegatives;
            const totalTested = simulationResults.details.length;

            simulationResults.accuracy = totalTested > 0 ?
                (simulationResults.successfulMatches + (totalTested - totalPositive - simulationResults.falseNegatives)) / totalTested : 0;

            simulationResults.precision = totalPositive > 0 ?
                simulationResults.successfulMatches / totalPositive : 0;

            simulationResults.recall = totalRelevant > 0 ?
                simulationResults.successfulMatches / totalRelevant : 0;

            // Проверяем пороги
            if (simulationResults.accuracy < this.testSettings.accuracyThreshold) {
                testResult.warnings.push({
                    type: 'low_accuracy',
                    message: `Точность ниже порога: ${(simulationResults.accuracy * 100).toFixed(2)}%`
                });
            }

        } catch (error) {
            testResult.errors.push({
                type: 'simulation_error',
                message: `Ошибка симуляции: ${error.message}`
            });
        }

        testResult.results = simulationResults;
        console.log(`✅ Data simulation completed - Accuracy: ${(simulationResults.accuracy * 100).toFixed(2)}%`);
    }

    /**
     * Тест генерации форматов
     */
    async runFormatGeneration(testResult) {
        console.log('📝 Running format generation test...');

        if (!this.ruleGenerator) {
            testResult.errors.push({
                type: 'no_generator',
                message: 'Rule Generator не доступен'
            });
            return;
        }

        const formatResults = {
            supportedFormats: [],
            successfulFormats: [],
            failedFormats: [],
            generationTime: {},
            totalTime: 0
        };

        const formats = Object.keys(this.ruleGenerator.supportedFormats || {});
        formatResults.supportedFormats = formats;

        const startTime = performance.now();

        // Тестируем генерацию в каждом формате
        for (const format of formats) {
            try {
                const genStartTime = performance.now();
                const generatedRule = await this.ruleGenerator.generateRule(format, { forceRegenerate: true });
                const genTime = performance.now() - genStartTime;

                formatResults.generationTime[format] = genTime;

                if (generatedRule && generatedRule.trim().length > 0) {
                    formatResults.successfulFormats.push(format);
                } else {
                    formatResults.failedFormats.push({
                        format,
                        reason: 'Пустое правило'
                    });
                }

            } catch (error) {
                formatResults.failedFormats.push({
                    format,
                    reason: error.message
                });
            }
        }

        formatResults.totalTime = performance.now() - startTime;

        // Проверяем результаты
        if (formatResults.failedFormats.length > 0) {
            testResult.errors.push({
                type: 'generation_failures',
                message: `Не удалось сгенерировать ${formatResults.failedFormats.length} форматов`
            });
        }

        if (formatResults.successfulFormats.length === 0) {
            testResult.errors.push({
                type: 'no_successful_generation',
                message: 'Не удалось сгенерировать правило ни в одном формате'
            });
        }

        testResult.results = formatResults;
        console.log(`✅ Format generation test completed: ${formatResults.successfulFormats.length}/${formats.length} successful`);
    }

    /**
     * Анализ ложных срабатываний
     */
    async runFalsePositiveTest(testResult) {
        console.log('🎯 Running false positive test...');

        const fpResults = {
            falsePositiveRate: 0,
            riskLevel: 'unknown',
            commonCauses: [],
            recommendations: []
        };

        // Анализируем компоненты на предмет вероятности ложных срабатываний
        const nodes = this.canvasManager?.canvasNodes || this.core?.canvasNodes || new Map();
        let totalRisk = 0;
        let riskFactors = [];

        for (const [nodeId, node] of nodes) {
            const componentRisk = this.analyzeFalsePositiveRisk(node);
            totalRisk += componentRisk.score;

            if (componentRisk.factors.length > 0) {
                riskFactors.push({
                    nodeId,
                    componentName: node.definition?.name,
                    factors: componentRisk.factors
                });
            }
        }

        // Вычисляем общий уровень риска
        const avgRisk = nodes.size > 0 ? totalRisk / nodes.size : 0;
        fpResults.falsePositiveRate = Math.min(avgRisk / 100, 1.0);

        if (fpResults.falsePositiveRate < 0.1) {
            fpResults.riskLevel = 'low';
        } else if (fpResults.falsePositiveRate < 0.3) {
            fpResults.riskLevel = 'medium';
        } else {
            fpResults.riskLevel = 'high';
            testResult.warnings.push({
                type: 'high_false_positive_risk',
                message: 'Высокий риск ложных срабатываний'
            });
        }

        // Сбор общих причин
        fpResults.commonCauses = this.identifyCommonFPCauses(riskFactors);
        fpResults.recommendations = this.generateFPRecommendations(fpResults.riskLevel, fpResults.commonCauses);

        testResult.results = fpResults;
        console.log(`✅ False positive test completed - Risk level: ${fpResults.riskLevel}`);
    }

    /**
     * Анализ покрытия угроз
     */
    async runCoverageAnalysis(testResult) {
        console.log('🛡️ Running coverage analysis...');

        const coverageResults = {
            threatCategories: [],
            coverageScore: 0,
            gaps: [],
            strengths: []
        };

        const nodes = this.canvasManager?.canvasNodes || this.core?.canvasNodes || new Map();

        // Определяем покрываемые категории угроз
        const threatMapping = this.mapComponentsToThreats(nodes);
        coverageResults.threatCategories = Object.keys(threatMapping);

        // Анализируем покрытие по каждой категории
        Object.entries(threatMapping).forEach(([category, components]) => {
            const categoryScore = this.calculateCategoryScore(category, components);

            if (categoryScore > 0.7) {
                coverageResults.strengths.push({
                    category,
                    score: categoryScore,
                    components: components.length
                });
            } else if (categoryScore < 0.3) {
                coverageResults.gaps.push({
                    category,
                    score: categoryScore,
                    recommendation: `Добавить больше компонентов для категории "${category}"`
                });
            }
        });

        // Общая оценка покрытия
        const totalCategories = Object.keys(threatMapping).length;
        const strongCategories = coverageResults.strengths.length;

        coverageResults.coverageScore = totalCategories > 0 ? strongCategories / totalCategories : 0;

        if (coverageResults.gaps.length > 0) {
            testResult.warnings.push({
                type: 'coverage_gaps',
                message: `Обнаружено ${coverageResults.gaps.length} пробелов в покрытии угроз`
            });
        }

        testResult.results = coverageResults;
        console.log(`✅ Coverage analysis completed - Score: ${(coverageResults.coverageScore * 100).toFixed(2)}%`);
    }

    // =======================================================
    // ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ВАЛИДАЦИИ
    // =======================================================

    /**
     * Валидация параметров компонента
     */
    async validateComponentParameters(node, result) {
        const definition = node.definition;
        const parameters = node.parameters || {};

        if (!definition.parameters) return;

        // Проверяем каждый параметр
        Object.entries(definition.parameters).forEach(([paramName, paramConfig]) => {
            const value = parameters[paramName];

            // Проверка обязательных параметров
            if (paramConfig.required && (value === undefined || value === null || value === '')) {
                result.errors.push({
                    type: 'missing_required_parameter',
                    message: `Обязательный параметр "${paramName}" не заполнен`
                });
            }

            // Проверка типов данных
            if (value !== undefined && value !== null && value !== '') {
                const validationError = this.validateParameterType(paramName, value, paramConfig);
                if (validationError) {
                    result.errors.push(validationError);
                }
            }

            // Проверка диапазонов для числовых параметров
            if (paramConfig.type === 'number' && typeof value === 'number') {
                if (paramConfig.min !== undefined && value < paramConfig.min) {
                    result.warnings.push({
                        type: 'parameter_below_minimum',
                        message: `Параметр "${paramName}" меньше минимального значения ${paramConfig.min}`
                    });
                }

                if (paramConfig.max !== undefined && value > paramConfig.max) {
                    result.warnings.push({
                        type: 'parameter_above_maximum',
                        message: `Параметр "${paramName}" больше максимального значения ${paramConfig.max}`
                    });
                }
            }
        });
    }

    /**
     * Валидация типа компонента
     */
    async validateComponentType(node, result) {
        const componentId = node.componentId;

        if (this.validationRules.components[componentId]) {
            try {
                const isValid = await this.validationRules.components[componentId](node.parameters);
                if (!isValid) {
                    result.errors.push({
                        type: 'component_validation_failed',
                        message: `Специфичная валидация компонента ${componentId} не прошла`
                    });
                }
            } catch (error) {
                result.errors.push({
                    type: 'component_validation_error',
                    message: `Ошибка валидации компонента ${componentId}: ${error.message}`
                });
            }
        }
    }

    /**
     * Валидация типа параметра
     */
    validateParameterType(paramName, value, config) {
        switch (config.type) {
            case 'string':
                if (typeof value !== 'string') {
                    return {
                        type: 'invalid_parameter_type',
                        message: `Параметр "${paramName}" должен быть строкой`
                    };
                }
                break;

            case 'number':
                if (typeof value !== 'number' || isNaN(value)) {
                    return {
                        type: 'invalid_parameter_type',
                        message: `Параметр "${paramName}" должен быть числом`
                    };
                }
                break;

            case 'boolean':
                if (typeof value !== 'boolean') {
                    return {
                        type: 'invalid_parameter_type',
                        message: `Параметр "${paramName}" должен быть булевым значением`
                    };
                }
                break;

            case 'select':
                if (config.options && !config.options.includes(value)) {
                    return {
                        type: 'invalid_select_option',
                        message: `Параметр "${paramName}" содержит недопустимое значение. Допустимые: ${config.options.join(', ')}`
                    };
                }
                break;
        }

        return null;
    }

    // =======================================================
    // ГЕНЕРАЦИЯ ТЕСТОВЫХ ДАННЫХ
    // =======================================================

    /**
     * Генерация образцов сетевого трафика
     */
    generateNetworkTrafficSamples() {
        const samples = [];
        const ips = ['192.168.1.1', '10.0.0.1', '172.16.0.1', '8.8.8.8', '1.1.1.1'];
        const ports = [80, 443, 22, 21, 25, 53, 8080, 3389];
        const protocols = ['TCP', 'UDP', 'ICMP'];

        for (let i = 0; i < 1000; i++) {
            samples.push({
                id: i,
                timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
                src_ip: ips[Math.floor(Math.random() * ips.length)],
                dst_ip: ips[Math.floor(Math.random() * ips.length)],
                src_port: ports[Math.floor(Math.random() * ports.length)],
                dst_port: ports[Math.floor(Math.random() * ports.length)],
                protocol: protocols[Math.floor(Math.random() * protocols.length)],
                size: Math.floor(Math.random() * 10000),
                flags: ['SYN', 'ACK', 'FIN'][Math.floor(Math.random() * 3)],
                payload: this.generateRandomPayload(),
                expectedMatch: Math.random() > 0.8 // 20% ожидаемых совпадений
            });
        }

        return samples;
    }

    /**
     * Генерация образцов malware
     */
    generateMalwareSamples() {
        const samples = [];
        const fileTypes = ['.exe', '.dll', '.scr', '.bat', '.vbs'];
        const malwareNames = ['trojan', 'virus', 'worm', 'backdoor', 'rootkit'];

        for (let i = 0; i < 500; i++) {
            const fileType = fileTypes[Math.floor(Math.random() * fileTypes.length)];
            samples.push({
                id: i,
                filename: `${malwareNames[Math.floor(Math.random() * malwareNames.length)]}${i}${fileType}`,
                size: Math.floor(Math.random() * 1000000) + 1000,
                hash_md5: this.generateRandomHash('md5'),
                hash_sha1: this.generateRandomHash('sha1'),
                hash_sha256: this.generateRandomHash('sha256'),
                pe_signature: Math.random() > 0.5,
                entropy: Math.random() * 8,
                expectedMatch: Math.random() > 0.7 // 30% ожидаемых совпадений
            });
        }

        return samples;
    }

    /**
     * Генерация записей логов
     */
    generateLogEntriesSamples() {
        const samples = [];
        const logLevels = ['INFO', 'WARN', 'ERROR', 'DEBUG'];
        const sources = ['auth', 'kernel', 'network', 'application'];

        for (let i = 0; i < 2000; i++) {
            samples.push({
                id: i,
                timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
                level: logLevels[Math.floor(Math.random() * logLevels.length)],
                source: sources[Math.floor(Math.random() * sources.length)],
                message: this.generateRandomLogMessage(),
                user: `user${Math.floor(Math.random() * 100)}`,
                ip: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
                expectedMatch: Math.random() > 0.85 // 15% ожидаемых совпадений
            });
        }

        return samples;
    }

    /**
     * Генерация файловых образцов
     */
    generateFileSamples() {
        const samples = [];
        const extensions = ['.txt', '.doc', '.pdf', '.jpg', '.zip'];
        const mimeTypes = ['text/plain', 'application/msword', 'application/pdf', 'image/jpeg', 'application/zip'];

        for (let i = 0; i < 300; i++) {
            const extIndex = Math.floor(Math.random() * extensions.length);
            samples.push({
                id: i,
                filename: `file${i}${extensions[extIndex]}`,
                size: Math.floor(Math.random() * 5000000),
                mime_type: mimeTypes[extIndex],
                created: new Date(Date.now() - Math.random() * 86400000 * 30).toISOString(),
                hash: this.generateRandomHash('sha256'),
                magic_bytes: this.generateRandomMagicBytes(),
                expectedMatch: Math.random() > 0.6 // 40% ожидаемых совпадений
            });
        }

        return samples;
    }

    // =======================================================
    // УТИЛИТАРНЫЕ МЕТОДЫ
    // =======================================================

    /**
     * Симуляция совпадения правила с данными
     */
    async simulateRuleMatch(dataPoint) {
        // Упрощенная симуляция - в реальности здесь была бы сложная логика
        const nodes = this.canvasManager?.canvasNodes || this.core?.canvasNodes || new Map();

        let matchScore = 0;
        let totalComponents = 0;

        for (const [nodeId, node] of nodes) {
            totalComponents++;

            // Симулируем проверку компонента против данных
            const componentMatch = this.simulateComponentMatch(node, dataPoint);
            if (componentMatch) {
                matchScore++;
            }
        }

        const matchThreshold = totalComponents * 0.5; // 50% компонентов должны совпасть
        const matched = matchScore >= matchThreshold;

        return {
            dataPointId: dataPoint.id,
            matched,
            expectedMatch: dataPoint.expectedMatch,
            matchScore,
            totalComponents,
            confidence: totalComponents > 0 ? matchScore / totalComponents : 0
        };
    }

    /**
     * Симуляция совпадения компонента
     */
    simulateComponentMatch(node, dataPoint) {
        const componentType = node.componentId;
        const parameters = node.parameters || {};

        // Простая симуляция на основе типа компонента
        switch (componentType) {
            case 'ip-address':
                return dataPoint.src_ip === parameters.address || dataPoint.dst_ip === parameters.address;

            case 'port-range':
                const port = parseInt(parameters.ports);
                return dataPoint.src_port === port || dataPoint.dst_port === port;

            case 'string-match':
                const searchString = parameters.string || '';
                return dataPoint.payload?.includes(searchString) ||
                    dataPoint.message?.includes(searchString);

            case 'file-hash':
                return dataPoint.hash === parameters.hash_value ||
                    dataPoint.hash_md5 === parameters.hash_value ||
                    dataPoint.hash_sha1 === parameters.hash_value ||
                    dataPoint.hash_sha256 === parameters.hash_value;

            default:
                // Для неизвестных типов возвращаем случайный результат
                return Math.random() > 0.5;
        }
    }

    /**
     * Получение тестовых данных
     */
    async getTestData() {
        // В зависимости от выбранного источника данных
        const dataSource = document.getElementById('test-data-source')?.value || 'sample';

        switch (dataSource) {
            case 'sample':
                return this.getMixedSampleData();
            case 'generated':
                return this.generateTestData();
            case 'upload':
                return this.getUploadedData();
            default:
                return this.getMixedSampleData();
        }
    }

    /**
     * Получение смешанных образцов данных
     */
    getMixedSampleData() {
        const allSamples = [
            ...this.sampleData['network-traffic'].data.slice(0, 200),
            ...this.sampleData['malware-samples'].data.slice(0, 100),
            ...this.sampleData['log-entries'].data.slice(0, 300),
            ...this.sampleData['file-samples'].data.slice(0, 100)
        ];

        // Перемешиваем массив
        return allSamples.sort(() => Math.random() - 0.5);
    }

    /**
     * Вычисление порядка выполнения тестов
     */
    getTestExecutionOrder() {
        return Object.keys(this.testTypes).sort((a, b) => {
            const priorityA = this.testTypes[a].priority;
            const priorityB = this.testTypes[b].priority;

            const priorityOrder = { high: 0, medium: 1, low: 2 };
            return priorityOrder[priorityA] - priorityOrder[priorityB];
        });
    }

    /**
     * Генерация ID теста
     */
    generateTestId() {
        return `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Генерация случайного хеша
     */
    generateRandomHash(type) {
        const lengths = { md5: 32, sha1: 40, sha256: 64 };
        const length = lengths[type] || 32;
        const chars = '0123456789abcdef';

        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    /**
     * Генерация случайного payload
     */
    generateRandomPayload() {
        const patterns = [
            'GET /index.html HTTP/1.1',
            'POST /login.php HTTP/1.1',
            'User-Agent: Mozilla/5.0',
            'malicious_script.exe',
            'SELECT * FROM users',
            'alert("XSS")',
            'cmd.exe /c whoami'
        ];

        return patterns[Math.floor(Math.random() * patterns.length)];
    }

    /**
     * Генерация случайного сообщения лога
     */
    generateRandomLogMessage() {
        const messages = [
            'User login successful',
            'Failed login attempt',
            'File access denied',
            'Network connection established',
            'Service started',
            'Error processing request',
            'Suspicious activity detected',
            'System shutdown initiated'
        ];

        return messages[Math.floor(Math.random() * messages.length)];
    }

    /**
     * Генерация magic bytes
     */
    generateRandomMagicBytes() {
        const magicBytes = [
            '4D5A', // PE
            '504B', // ZIP
            '7F454C46', // ELF
            'FFD8FFE0', // JPEG
            '89504E47', // PNG
            '25504446' // PDF
        ];

        return magicBytes[Math.floor(Math.random() * magicBytes.length)];
    }

    // =======================================================
    // РАСЧЕТЫ И АНАЛИЗ
    // =======================================================

    /**
     * Вычисление балла синтаксиса
     */
    calculateSyntaxScore(syntaxResults) {
        let score = 100;

        if (!syntaxResults.ruleNameValid) score -= 20;
        if (!syntaxResults.ruleTypeValid) score -= 15;
        if (!syntaxResults.rulePriorityValid) score -= 10;
        if (!syntaxResults.hasComponents) score -= 30;
        if (!syntaxResults.hasConnections) score -= 15;

        return Math.max(0, score);
    }

    /**
     * Вычисление балла логики
     */
    calculateLogicScore(logicResults) {
        let score = 100;

        if (logicResults.hasCircularDependencies) score -= 40;
        if (logicResults.orphanedComponents.length > 0) score -= logicResults.orphanedComponents.length * 5;
        if (logicResults.invalidConnections.length > 0) score -= logicResults.invalidConnections.length * 10;

        return Math.max(0, score);
    }

    /**
     * Вычисление сложности правила
     */
    calculateRuleComplexity(nodes, connections) {
        const nodeCount = nodes.size;
        const connectionCount = connections.size;

        if (nodeCount <= 2 && connectionCount <= 1) return 'simple';
        if (nodeCount <= 5 && connectionCount <= 4) return 'medium';
        if (nodeCount <= 10 && connectionCount <= 8) return 'complex';
        return 'very_complex';
    }

    /**
     * Оценка времени обработки
     */
    estimateProcessingTime(nodes, connections) {
        let baseTime = 10; // базовое время в мс

        // Добавляем время за каждый компонент
        nodes.forEach(node => {
            switch (node.definition?.type) {
                case 'network': baseTime += 5; break;
                case 'file': baseTime += 15; break;
                case 'content': baseTime += 20; break;
                case 'behavioral': baseTime += 30; break;
                case 'temporal': baseTime += 10; break;
                default: baseTime += 10;
            }
        });

        // Добавляем время за соединения
        baseTime += connections.size * 2;

        return Math.round(baseTime);
    }

    /**
     * Оценка использования памяти
     */
    estimateMemoryUsage(nodes, connections) {
        let baseMemory = 1024; // базовая память в байтах

        // Память для каждого компонента
        baseMemory += nodes.size * 512;

        // Память для соединений
        baseMemory += connections.size * 256;

        return Math.round(baseMemory);
    }

    /**
     * Вычисление балла масштабируемости
     */
    calculateScalabilityScore(nodes, connections) {
        const complexity = this.calculateRuleComplexity(nodes, connections);
        const scores = {
            'simple': 100,
            'medium': 80,
            'complex': 60,
            'very_complex': 40
        };

        return scores[complexity] || 50;
    }

    /**
     * Генерация рекомендаций по оптимизации
     */
    generateOptimizationSuggestions(nodes, connections) {
        const suggestions = [];

        if (nodes.size > 10) {
            suggestions.push('Рассмотрите разделение правила на несколько более простых');
        }

        if (connections.size > 8) {
            suggestions.push('Упростите логические соединения между компонентами');
        }

        // Анализ типов компонентов
        const behaviorComponents = Array.from(nodes.values()).filter(n => n.definition?.type === 'behavioral');
        if (behaviorComponents.length > 3) {
            suggestions.push('Слишком много поведенческих компонентов может снизить производительность');
        }

        return suggestions;
    }

    // =======================================================
    // ОБНОВЛЕНИЕ UI
    // =======================================================

    /**
     * Обновление UI тестирования
     */
    updateTestUI(state) {
        const testSection = document.querySelector('.test-controls');
        if (!testSection) return;

        switch (state) {
            case 'running':
                testSection.classList.add('testing-in-progress');
                document.querySelectorAll('.test-button').forEach(btn => {
                    btn.disabled = true;
                });
                break;

            case 'idle':
                testSection.classList.remove('testing-in-progress');
                document.querySelectorAll('.test-button').forEach(btn => {
                    btn.disabled = false;
                });
                break;
        }
    }

    /**
     * Обновление прогресса тестирования
     */
    updateTestProgress(testSuite) {
        const progressBar = document.querySelector('.test-progress-bar');
        if (progressBar && testSuite.tests.length > 0) {
            const progress = (testSuite.tests.length / Object.keys(this.testTypes).length) * 100;
            progressBar.style.width = `${progress}%`;
        }

        const statusText = document.querySelector('.test-status');
        if (statusText) {
            statusText.textContent = `Выполнено тестов: ${testSuite.tests.length}/${Object.keys(this.testTypes).length}`;
        }
    }

    /**
     * Отображение результатов тестов
     */
    displayTestResults(testSuite) {
        const resultsContainer = document.getElementById('test-results');
        if (!resultsContainer) return;

        const results = testSuite.results;
        const successRate = results.total > 0 ? (results.passed / results.total) * 100 : 0;

        resultsContainer.innerHTML = `
            <div class="test-summary">
                <h3>Результаты тестирования</h3>
                <div class="test-stats">
                    <div class="stat-item">
                        <span class="stat-label">Всего тестов:</span>
                        <span class="stat-value">${results.total}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Пройдено:</span>
                        <span class="stat-value success">${results.passed}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Провалено:</span>
                        <span class="stat-value error">${results.failed}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Предупреждения:</span>
                        <span class="stat-value warning">${results.warnings}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Успешность:</span>
                        <span class="stat-value">${successRate.toFixed(1)}%</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Время:</span>
                        <span class="stat-value">${testSuite.duration.toFixed(2)}ms</span>
                    </div>
                </div>
            </div>
            
            <div class="test-details">
                ${testSuite.tests.map(test => this.renderTestResult(test)).join('')}
            </div>
        `;
    }

    /**
     * Рендеринг результата отдельного теста
     */
    renderTestResult(testResult) {
        const statusClass = `test-result-${testResult.status}`;
        const statusIcon = {
            'passed': '✅',
            'failed': '❌',
            'warning': '⚠️',
            'error': '💥',
            'skipped': '⏭️'
        }[testResult.status] || '❓';

        return `
            <div class="test-result ${statusClass}">
                <div class="test-result-header">
                    <span class="test-status-icon">${statusIcon}</span>
                    <span class="test-name">${testResult.name}</span>
                    <span class="test-duration">${testResult.duration.toFixed(2)}ms</span>
                </div>
                
                ${testResult.errors?.length > 0 ? `
                    <div class="test-errors">
                        <h5>Ошибки:</h5>
                        <ul>
                            ${testResult.errors.map(error => `<li>${error.message}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
                
                ${testResult.warnings?.length > 0 ? `
                    <div class="test-warnings">
                        <h5>Предупреждения:</h5>
                        <ul>
                            ${testResult.warnings.map(warning => `<li>${warning.message}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
                
                ${Object.keys(testResult.results || {}).length > 0 ? `
                    <div class="test-result-details">
                        <button class="toggle-details" onclick="this.nextElementSibling.style.display = this.nextElementSibling.style.display === 'none' ? 'block' : 'none'">
                            Показать детали
                        </button>
                        <div class="test-details-content" style="display: none;">
                            <pre>${JSON.stringify(testResult.results, null, 2)}</pre>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Отображение результата одного теста
     */
    displaySingleTestResult(testResult) {
        console.log(`🧪 Test ${testResult.name} completed:`, testResult.status);

        // Показываем быстрое уведомление
        if (window.app?.showNotification) {
            const message = `Тест "${testResult.name}": ${testResult.status}`;
            const type = testResult.status === 'passed' ? 'success' :
                testResult.status === 'warning' ? 'warning' : 'error';

            window.app.showNotification(message, type);
        }
    }

    // =======================================================
    // ОБРАБОТЧИКИ СОБЫТИЙ
    // =======================================================

    /**
     * Обработчик обновления правила
     */
    handleRuleUpdated(data) {
        // Сбрасываем кэш валидации при изменении правила
        this.validationCache.clear();
        this.resultCache.clear();

        console.log('📝 Rule updated - validation cache cleared');
    }

    /**
     * Обработчик изменения компонентов
     */
    handleComponentChange(data) {
        // Инвалидируем кэш тестов
        this.validationCache.clear();
        this.resultCache.clear();

        console.log('🧩 Component changed - test cache cleared');
    }

    /**
     * Обработчик изменения параметров
     */
    handleParameterChange(data) {
        // Очищаем кэш валидации для конкретного компонента
        const nodeId = data.componentId;
        if (nodeId) {
            this.validationCache.delete(nodeId);
        }

        console.log('⚙️ Parameter changed - component cache cleared');
    }

    /**
     * Обработчик изменения узлов
     */
    handleNodeChange(data) {
        console.log('🎨 Node changed - triggering validation update');
    }

    /**
     * Обработчик очистки canvas
     */
    handleCanvasCleared() {
        // Очищаем все кэши
        this.validationCache.clear();
        this.resultCache.clear();
        this.testDataCache.clear();

        console.log('🧹 Canvas cleared - all test caches cleared');
    }

    /**
     * Обработчик изменения источника данных
     */
    handleDataSourceChange(dataSource) {
        console.log(`📊 Data source changed to: ${dataSource}`);

        // Очищаем кэш данных
        this.testDataCache.clear();

        // Обновляем UI в зависимости от источника
        const fileInput = document.getElementById('test-data-file');
        const uploadSection = document.querySelector('.file-upload-section');

        if (fileInput && uploadSection) {
            if (dataSource === 'upload') {
                uploadSection.style.display = 'block';
            } else {
                uploadSection.style.display = 'none';
            }
        }
    }

    /**
     * Обработчик загрузки файла
     */
    async handleFileUpload(file) {
        if (!file) return;

        console.log(`📁 Uploading test data file: ${file.name}`);

        try {
            const text = await file.text();
            let data;

            // Пытаемся парсить как JSON
            try {
                data = JSON.parse(text);
            } catch {
                // Если не JSON, создаем простой формат
                data = text.split('\n').map((line, index) => ({
                    id: index,
                    content: line.trim(),
                    expectedMatch: false // пользователь должен будет указать
                })).filter(item => item.content.length > 0);
            }

            // Сохраняем в кэш
            this.testDataCache.set('uploaded', data);

            console.log(`✅ Uploaded ${data.length} test data entries`);

        } catch (error) {
            console.error('❌ Error uploading file:', error);

            if (window.app?.showErrorNotification) {
                window.app.showErrorNotification(`Ошибка загрузки файла: ${error.message}`);
            }
        }
    }

    // =======================================================
    // СОХРАНЕНИЕ И ИСТОРИЯ
    // =======================================================

    /**
     * Сохранение результатов тестов
     */
    saveTestResults(testSuite) {
        try {
            this.testResults.set(testSuite.id, testSuite);

            // Сохраняем последние результаты в localStorage
            localStorage.setItem('test-manager-last-results', JSON.stringify(testSuite));

            console.log(`💾 Test results saved: ${testSuite.id}`);

        } catch (error) {
            console.error('❌ Error saving test results:', error);
        }
    }

    /**
     * Добавление в историю
     */
    addToHistory(testSuite) {
        const historyEntry = {
            id: testSuite.id,
            timestamp: testSuite.timestamp,
            name: testSuite.name,
            results: testSuite.results,
            duration: testSuite.duration
        };

        this.testHistory.unshift(historyEntry);

        // Ограничиваем историю 50 записями
        if (this.testHistory.length > 50) {
            this.testHistory = this.testHistory.slice(0, 50);
        }

        // Сохраняем историю
        try {
            localStorage.setItem('test-manager-history', JSON.stringify(this.testHistory));
        } catch (error) {
            console.warn('⚠️ Error saving test history:', error);
        }
    }

    /**
     * Обновление метрик тестирования
     */
    updateTestMetrics(testSuite) {
        this.testMetrics.totalTests += testSuite.results.total;
        this.testMetrics.passedTests += testSuite.results.passed;
        this.testMetrics.failedTests += testSuite.results.failed;
        this.testMetrics.skippedTests += testSuite.results.skipped;

        const totalTime = this.testMetrics.totalTestTime + testSuite.duration;
        const totalTests = this.testMetrics.totalTests;

        this.testMetrics.avgTestTime = totalTests > 0 ? totalTime / totalTests : 0;
        this.testMetrics.totalTestTime = totalTime;
        this.testMetrics.lastTestTime = testSuite.timestamp;
    }

    // =======================================================
    // ДОПОЛНИТЕЛЬНЫЕ МЕТОДЫ ВАЛИДАЦИИ
    // =======================================================

    /**
     * Валидация IP адреса
     */
    validateIpAddress(params) {
        const address = params.address;
        if (!address) return false;

        // Простая проверка IP адреса или CIDR
        const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(?:\/(?:[0-9]|[1-2][0-9]|3[0-2]))?$/;
        return ipRegex.test(address);
    }

    /**
     * Валидация диапазона портов
     */
    validatePortRange(params) {
        const ports = params.ports;
        if (!ports) return false;

        const portRegex = /^(\d+(-\d+)?)(,\d+(-\d+)?)*$/;
        return portRegex.test(ports);
    }

    /**
     * Валидация хеша файла
     */
    validateFileHash(params) {
        const hashValue = params.hash_value;
        const hashType = params.hash_type;

        if (!hashValue || !hashType) return false;

        const hashRegex = {
            md5: /^[a-fA-F0-9]{32}$/,
            sha1: /^[a-fA-F0-9]{40}$/,
            sha256: /^[a-fA-F0-9]{64}$/
        };

        return hashRegex[hashType]?.test(hashValue) || false;
    }

    /**
     * Валидация регулярного выражения
     */
    validateRegexPattern(params) {
        const pattern = params.pattern;
        if (!pattern) return false;

        try {
            new RegExp(pattern, params.flags || '');
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Валидация строкового совпадения
     */
    validateStringMatch(params) {
        const string = params.string;
        return string && string.length > 0;
    }

    // =======================================================
    // ПУБЛИЧНЫЕ МЕТОДЫ API
    // =======================================================

    /**
     * Получение статистики тестирования
     */
    getTestMetrics() {
        return { ...this.testMetrics };
    }

    /**
     * Получение истории тестов
     */
    getTestHistory() {
        return [...this.testHistory];
    }

    /**
     * Получение поддерживаемых типов тестов
     */
    getSupportedTestTypes() {
        return { ...this.testTypes };
    }

    /**
     * Получение настроек тестирования
     */
    getTestSettings() {
        return { ...this.testSettings };
    }

    /**
     * Обновление настроек тестирования
     */
    updateTestSettings(newSettings) {
        this.testSettings = { ...this.testSettings, ...newSettings };
        console.log('⚙️ Test settings updated');
    }

    // =======================================================
    // СИСТЕМА СОБЫТИЙ
    // =======================================================

    /**
     * Подписка на событие
     */
    on(event, handler) {
        if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, []);
        }
        this.eventHandlers.get(event).push(handler);
    }

    /**
     * Отписка от события
     */
    off(event, handler) {
        if (this.eventHandlers.has(event)) {
            const handlers = this.eventHandlers.get(event);
            const index = handlers.indexOf(handler);
            if (index > -1) {
                handlers.splice(index, 1);
            }
        }
    }

    /**
     * Генерация события
     */
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
    // МЕТОДЫ ЖИЗНЕННОГО ЦИКЛА
    // =======================================================

    /**
     * Активация Test Manager
     */
    activate() {
        if (!this.isInitialized) {
            console.warn('⚠️ Test Manager not initialized');
            return;
        }

        console.log('🟢 Test Manager activated');
        this.emit('activated');
    }

    /**
     * Деактивация Test Manager
     */
    deactivate() {
        // Прерываем выполняющиеся тесты
        if (this.isTestRunning) {
            console.log('⏸️ Stopping running tests...');
            this.isTestRunning = false;
        }

        console.log('🟡 Test Manager deactivated');
        this.emit('deactivated');
    }

    /**
     * Очистка ресурсов
     */
    cleanup() {
        console.log('🧹 Cleaning up Test Manager...');

        try {
            // Прерываем тесты
            this.isTestRunning = false;
            this.currentTest = null;

            // Сохраняем последние результаты
            if (this.testResults.size > 0) {
                const lastResults = Array.from(this.testResults.values()).pop();
                this.saveTestResults(lastResults);
            }

            // Очищаем кэши
            this.validationCache.clear();
            this.testDataCache.clear();
            this.resultCache.clear();

            // Очищаем обработчики событий
            this.eventHandlers.clear();
            this.testEventListeners.clear();

            // Очищаем данные
            this.testResults.clear();

            // Сбрасываем состояние
            this.isInitialized = false;

            console.log('✅ Test Manager cleanup completed');

        } catch (error) {
            console.error('❌ Error during Test Manager cleanup:', error);
        }
    }
}

// =======================================================
// ЭКСПОРТ И ГЛОБАЛЬНАЯ ИНТЕГРАЦИЯ
// =======================================================

/**
 * Глобальная функция создания Test Manager
 */
function createTestManager(coreInstance, canvasManager, connectionManager, ruleGenerator) {
    return new TestManager(coreInstance, canvasManager, connectionManager, ruleGenerator);
}

// Экспорт для модульных систем
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        TestManager,
        createTestManager
    };
}

// ES6 экспорты
if (typeof window !== 'undefined') {
    window.TestManager = TestManager;
    window.createTestManager = createTestManager;

    // Для интеграции с модульной системой attack-constructor
    window.TestManagerExports = {
        TestManager,
        createTestManager,
        version: '4.0.0-Enhanced-Testing'
    };

    // Глобальный экземпляр для HTML интеграции
    window.testManager = null;
}

console.log('✅ Test Manager v4.0.0-Enhanced loaded successfully');

/**
 * =======================================================
 * КОНЕЦ ФАЙЛА test-manager.js
 * 
 * IP Roast Enterprise 4.0 - Test Manager Module
 * Специализированный модуль для тестирования и валидации правил
 * Версия: 4.0.0-Enhanced-Testing
 * 
 * Ключевые возможности:
 * - 8 типов комплексного тестирования (валидация, синтаксис, логика, производительность, симуляция, генерация, FP-анализ, покрытие)
 * - Автоматическая генерация и загрузка тестовых данных
 * - Валидация компонентов и параметров с детальными отчетами
 * - Симуляция работы правил на синтетических данных
 * - Анализ производительности и оптимизация
 * - Оценка ложных срабатываний и покрытия угроз
 * - Интерактивные отчеты с детальной статистикой
 * - История тестирования и метрики качества
 * - Интеграция с модульной архитектурой attack-constructor
 * - Enterprise-уровень тестирования и QA автоматизации
 * =======================================================
 */
