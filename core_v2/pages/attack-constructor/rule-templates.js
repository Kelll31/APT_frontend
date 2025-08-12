/**
 * IP Roast Enterprise 4.0 - Rule Templates Manager Module
 * Управление шаблонами правил с загрузкой из внешних JSON файлов
 * Версия: 4.0.0-Enhanced-Templates
 * 
 * @description Специализированный модуль для загрузки и управления шаблонами правил
 * @author IP Roast Security Team
 * @requires attack-constructor-core.js, canvas-manager.js, connection-manager.js
 * @integrates signature-components, rule-generator, ui-manager
 */

console.log('📋 Loading Rule Templates Manager v4.0.0-Enhanced');

/**
 * Основной класс для управления шаблонами правил
 */
class RuleTemplateManager {
    constructor(coreInstance, canvasManager, connectionManager) {
        this.version = '4.0.0-Enhanced-Templates';
        this.core = coreInstance;
        this.canvasManager = canvasManager;
        this.connectionManager = connectionManager;
        this.isInitialized = false;

        // Пути к шаблонам
        this.templatesBasePath = './pages/attack-constructor/templates/';
        this.templateIndexFile = 'index.json';

        // Хранилище шаблонов
        this.templates = new Map();
        this.templateIndex = null;
        this.templateCategories = new Map();

        // Кэширование
        this.loadCache = new Map();
        this.lastLoadTime = null;
        this.cacheExpiry = 5 * 60 * 1000; // 5 минут

        // Настройки загрузки
        this.loadingSettings = {
            retryAttempts: 3,
            retryDelay: 1000,
            timeout: 10000,
            validateSchema: true,
            autoReload: false
        };

        // Метрики
        this.metrics = {
            templatesLoaded: 0,
            loadTime: 0,
            loadErrors: 0,
            appliedTemplates: 0,
            lastError: null
        };

        // События
        this.eventHandlers = new Map();

        // Схема валидации шаблонов
        this.templateSchema = {
            required: ['id', 'name', 'version', 'components'],
            optional: ['description', 'author', 'category', 'tags', 'metadata', 'connections', 'settings']
        };

        console.log('📋 Rule Template Manager initialized');
    }

    /**
     * Инициализация Template Manager
     */
    async initialize() {
        try {
            console.log('🚀 Initializing Rule Template Manager...');

            await this.loadTemplateIndex();
            await this.loadAllTemplates();
            this.setupEventListeners();
            this.setupAutoReload();

            this.isInitialized = true;
            console.log('✅ Rule Template Manager initialized successfully');

        } catch (error) {
            console.error('❌ Rule Template Manager initialization failed:', error);
            this.metrics.lastError = error.message;
            throw error;
        }
    }

    /**
     * Загрузка индекса шаблонов
     */
    async loadTemplateIndex() {
        const startTime = performance.now();

        try {
            console.log('📂 Loading template index...');

            const indexPath = `${this.templatesBasePath}${this.templateIndexFile}`;
            const response = await this.fetchWithRetry(indexPath);

            if (!response.ok) {
                throw new Error(`Failed to load template index: ${response.status} ${response.statusText}`);
            }

            const indexData = await response.json();

            // Валидация индекса
            this.validateTemplateIndex(indexData);

            this.templateIndex = indexData;
            this.buildCategoryMap();

            const loadTime = performance.now() - startTime;
            console.log(`✅ Template index loaded in ${loadTime.toFixed(2)}ms`);

        } catch (error) {
            console.error('❌ Error loading template index:', error);

            // Fallback: создаем базовый индекс
            this.templateIndex = await this.createFallbackIndex();
            console.log('⚠️ Using fallback template index');
        }
    }

    /**
     * Загрузка всех шаблонов
     */
    async loadAllTemplates() {
        if (!this.templateIndex || !this.templateIndex.templates) {
            console.warn('⚠️ No template index available');
            return;
        }

        const startTime = performance.now();
        const templatePromises = [];

        console.log(`📦 Loading ${this.templateIndex.templates.length} templates...`);

        // Загружаем все шаблоны параллельно
        for (const templateInfo of this.templateIndex.templates) {
            templatePromises.push(this.loadSingleTemplate(templateInfo));
        }

        // Ждем загрузки всех шаблонов
        const results = await Promise.allSettled(templatePromises);

        // Анализируем результаты
        let successCount = 0;
        let errorCount = 0;

        results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                successCount++;
            } else {
                errorCount++;
                const templateInfo = this.templateIndex.templates[index];
                console.error(`❌ Failed to load template ${templateInfo.id}:`, result.reason);
            }
        });

        const totalTime = performance.now() - startTime;

        // Обновляем метрики
        this.metrics.templatesLoaded = successCount;
        this.metrics.loadErrors = errorCount;
        this.metrics.loadTime = totalTime;
        this.lastLoadTime = Date.now();

        console.log(`✅ Loaded ${successCount}/${this.templateIndex.templates.length} templates in ${totalTime.toFixed(2)}ms`);

        // Уведомляем о завершении загрузки
        this.emit('templatesLoaded', {
            total: this.templateIndex.templates.length,
            loaded: successCount,
            errors: errorCount,
            loadTime: totalTime
        });
    }

    /**
     * Загрузка одного шаблона
     */
    async loadSingleTemplate(templateInfo) {
        try {
            // Проверяем кэш
            if (this.loadCache.has(templateInfo.id)) {
                const cached = this.loadCache.get(templateInfo.id);
                if (Date.now() - cached.timestamp < this.cacheExpiry) {
                    console.log(`💾 Using cached template: ${templateInfo.id}`);
                    this.templates.set(templateInfo.id, cached.template);
                    return cached.template;
                }
            }

            // Загружаем шаблон из файла
            const templatePath = `${this.templatesBasePath}${templateInfo.file}`;
            const response = await this.fetchWithRetry(templatePath);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const templateData = await response.json();

            // Валидация шаблона
            if (this.loadingSettings.validateSchema) {
                this.validateTemplate(templateData);
            }

            // Обогащаем шаблон метаданными из индекса
            const enrichedTemplate = this.enrichTemplate(templateData, templateInfo);

            // Сохраняем в кэш и основное хранилище
            this.templates.set(templateInfo.id, enrichedTemplate);
            this.loadCache.set(templateInfo.id, {
                template: enrichedTemplate,
                timestamp: Date.now()
            });

            console.log(`📋 Loaded template: ${templateInfo.id}`);
            return enrichedTemplate;

        } catch (error) {
            console.error(`❌ Error loading template ${templateInfo.id}:`, error);
            throw new Error(`Failed to load template ${templateInfo.id}: ${error.message}`);
        }
    }

    /**
     * HTTP запрос с повторными попытками
     */
    async fetchWithRetry(url, options = {}) {
        let lastError;

        for (let attempt = 1; attempt <= this.loadingSettings.retryAttempts; attempt++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), this.loadingSettings.timeout);

                const response = await fetch(url, {
                    ...options,
                    signal: controller.signal
                });

                clearTimeout(timeoutId);
                return response;

            } catch (error) {
                lastError = error;
                console.warn(`⚠️ Attempt ${attempt}/${this.loadingSettings.retryAttempts} failed for ${url}:`, error.message);

                if (attempt < this.loadingSettings.retryAttempts) {
                    await new Promise(resolve => setTimeout(resolve, this.loadingSettings.retryDelay * attempt));
                }
            }
        }

        throw lastError;
    }

    /**
     * Валидация индекса шаблонов
     */
    validateTemplateIndex(indexData) {
        if (!indexData || typeof indexData !== 'object') {
            throw new Error('Invalid template index: not an object');
        }

        if (!Array.isArray(indexData.templates)) {
            throw new Error('Invalid template index: templates must be an array');
        }

        // Проверяем каждую запись в индексе
        indexData.templates.forEach((template, index) => {
            if (!template.id || !template.file) {
                throw new Error(`Invalid template entry at index ${index}: missing id or file`);
            }

            if (typeof template.id !== 'string' || typeof template.file !== 'string') {
                throw new Error(`Invalid template entry at index ${index}: id and file must be strings`);
            }
        });

        console.log('✅ Template index validation passed');
    }

    /**
     * Валидация шаблона
     */
    validateTemplate(template) {
        if (!template || typeof template !== 'object') {
            throw new Error('Invalid template: not an object');
        }

        // Проверяем обязательные поля
        for (const field of this.templateSchema.required) {
            if (!(field in template)) {
                throw new Error(`Invalid template: missing required field '${field}'`);
            }
        }

        // Валидация компонентов
        if (!Array.isArray(template.components)) {
            throw new Error('Invalid template: components must be an array');
        }

        template.components.forEach((component, index) => {
            if (!component.type || !component.parameters) {
                throw new Error(`Invalid component at index ${index}: missing type or parameters`);
            }
        });

        // Валидация соединений (если есть)
        if (template.connections && !Array.isArray(template.connections)) {
            throw new Error('Invalid template: connections must be an array');
        }

        console.log(`✅ Template ${template.id} validation passed`);
    }

    /**
     * Обогащение шаблона метаданными
     */
    enrichTemplate(templateData, templateInfo) {
        return {
            ...templateData,
            // Метаданные из индекса
            file: templateInfo.file,
            category: templateInfo.category || 'general',
            tags: templateInfo.tags || [],
            featured: templateInfo.featured || false,

            // Системные метаданные
            loadedAt: new Date().toISOString(),
            source: 'file',
            version: templateData.version || '1.0.0',

            // Дополнительная обработка
            complexity: this.calculateTemplateComplexity(templateData),
            estimatedApplyTime: this.estimateApplyTime(templateData)
        };
    }

    /**
     * Вычисление сложности шаблона
     */
    calculateTemplateComplexity(template) {
        const componentCount = template.components?.length || 0;
        const connectionCount = template.connections?.length || 0;

        let complexity = 'simple';

        if (componentCount > 8 || connectionCount > 6) {
            complexity = 'complex';
        } else if (componentCount > 4 || connectionCount > 3) {
            complexity = 'medium';
        }

        return complexity;
    }

    /**
     * Оценка времени применения шаблона
     */
    estimateApplyTime(template) {
        const baseTime = 500; // мс
        const componentTime = (template.components?.length || 0) * 100;
        const connectionTime = (template.connections?.length || 0) * 150;

        return baseTime + componentTime + connectionTime;
    }

    /**
     * Построение карты категорий
     */
    buildCategoryMap() {
        this.templateCategories.clear();

        if (!this.templateIndex?.templates) return;

        this.templateIndex.templates.forEach(template => {
            const category = template.category || 'general';

            if (!this.templateCategories.has(category)) {
                this.templateCategories.set(category, {
                    name: category,
                    templates: [],
                    count: 0
                });
            }

            const categoryData = this.templateCategories.get(category);
            categoryData.templates.push(template.id);
            categoryData.count++;
        });

        console.log(`📂 Built ${this.templateCategories.size} template categories`);
    }

    /**
     * Создание fallback индекса
     */
    async createFallbackIndex() {
        console.log('🔧 Creating fallback template index...');

        return {
            version: '1.0.0',
            name: 'Fallback Template Index',
            description: 'Auto-generated fallback index',
            created: new Date().toISOString(),
            templates: [
                {
                    id: 'basic-malware-detection',
                    name: 'Basic Malware Detection',
                    file: 'basic-malware-detection.json',
                    category: 'security',
                    description: 'Simple malware detection rule',
                    tags: ['malware', 'basic']
                },
                {
                    id: 'network-anomaly-detection',
                    name: 'Network Anomaly Detection',
                    file: 'network-anomaly-detection.json',
                    category: 'network',
                    description: 'Network traffic anomaly detection',
                    tags: ['network', 'anomaly']
                },
                {
                    id: 'file-integrity-monitoring',
                    name: 'File Integrity Monitoring',
                    file: 'file-integrity-monitoring.json',
                    category: 'file',
                    description: 'Monitor file changes and integrity',
                    tags: ['file', 'integrity']
                }
            ]
        };
    }

    // =======================================================
    // ПУБЛИЧНЫЕ МЕТОДЫ API
    // =======================================================

    /**
     * Получение всех шаблонов
     */
    getAllTemplates() {
        return Array.from(this.templates.values());
    }

    /**
     * Получение шаблона по ID
     */
    getTemplate(templateId) {
        return this.templates.get(templateId) || null;
    }

    /**
     * Получение шаблонов по категории
     */
    getTemplatesByCategory(category) {
        return Array.from(this.templates.values()).filter(
            template => template.category === category
        );
    }

    /**
     * Поиск шаблонов
     */
    searchTemplates(query, options = {}) {
        const {
            category = null,
            tags = [],
            complexity = null,
            featured = null
        } = options;

        let results = Array.from(this.templates.values());

        // Фильтр по запросу
        if (query && query.trim()) {
            const searchTerm = query.toLowerCase();
            results = results.filter(template =>
                template.name.toLowerCase().includes(searchTerm) ||
                template.description?.toLowerCase().includes(searchTerm) ||
                template.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
            );
        }

        // Фильтр по категории
        if (category) {
            results = results.filter(template => template.category === category);
        }

        // Фильтр по тегам
        if (tags.length > 0) {
            results = results.filter(template =>
                tags.some(tag => template.tags?.includes(tag))
            );
        }

        // Фильтр по сложности
        if (complexity) {
            results = results.filter(template => template.complexity === complexity);
        }

        // Фильтр по избранным
        if (featured !== null) {
            results = results.filter(template => template.featured === featured);
        }

        return results;
    }

    /**
     * Получение категорий шаблонов
     */
    getCategories() {
        return Array.from(this.templateCategories.values());
    }

    /**
     * Применение шаблона
     */
    async applyTemplate(templateId, options = {}) {
        const startTime = performance.now();

        try {
            console.log(`🎯 Applying template: ${templateId}`);

            const template = this.getTemplate(templateId);
            if (!template) {
                throw new Error(`Template not found: ${templateId}`);
            }

            // Подготавливаем опции
            const applyOptions = {
                clearCanvas: options.clearCanvas !== false, // по умолчанию true
                centerLayout: options.centerLayout !== false,
                validateComponents: options.validateComponents !== false,
                ...options
            };

            // Очищаем canvas если нужно
            if (applyOptions.clearCanvas && this.canvasManager) {
                this.canvasManager.clearCanvas();
            }

            // Применяем компоненты
            const appliedComponents = await this.applyTemplateComponents(
                template.components,
                applyOptions
            );

            // Применяем соединения
            const appliedConnections = await this.applyTemplateConnections(
                template.connections || [],
                appliedComponents,
                applyOptions
            );

            // Обновляем метаданные правила
            if (this.core?.currentRule) {
                this.updateRuleFromTemplate(template);
            }

            // Автоматическая компоновка если нужно
            if (applyOptions.centerLayout && this.canvasManager) {
                this.canvasManager.autoLayoutNodes();
            }

            const applyTime = performance.now() - startTime;

            // Обновляем метрики
            this.metrics.appliedTemplates++;

            // Уведомляем о применении
            this.emit('templateApplied', {
                templateId,
                template,
                components: appliedComponents.length,
                connections: appliedConnections.length,
                applyTime
            });

            console.log(`✅ Template ${templateId} applied in ${applyTime.toFixed(2)}ms`);

            return {
                success: true,
                template,
                components: appliedComponents,
                connections: appliedConnections,
                applyTime
            };

        } catch (error) {
            console.error(`❌ Error applying template ${templateId}:`, error);

            this.emit('templateApplyError', {
                templateId,
                error: error.message
            });

            throw error;
        }
    }

    /**
     * Применение компонентов шаблона
     */
    async applyTemplateComponents(components, options) {
        const appliedComponents = [];

        if (!this.canvasManager || !components) {
            return appliedComponents;
        }

        // Вычисляем начальную позицию
        let startX = options.startX || 100;
        let startY = options.startY || 100;
        const spacing = options.spacing || 250;

        for (let i = 0; i < components.length; i++) {
            const component = components[i];

            try {
                // Валидируем компонент если нужно
                if (options.validateComponents) {
                    this.validateTemplateComponent(component);
                }

                // Вычисляем позицию (сетка 3x3, потом вертикально)
                const col = i % 3;
                const row = Math.floor(i / 3);
                const x = startX + col * spacing;
                const y = startY + row * 150;

                // Добавляем компонент на canvas
                const result = this.canvasManager.addComponent(
                    component.type,
                    x,
                    y,
                    component.parameters || {}
                );

                if (result) {
                    appliedComponents.push({
                        templateIndex: i,
                        nodeId: result.nodeId,
                        componentType: component.type,
                        node: result.node
                    });
                }

            } catch (error) {
                console.error(`❌ Error applying component ${i}:`, error);

                if (options.strictMode) {
                    throw error;
                }
            }
        }

        console.log(`📦 Applied ${appliedComponents.length}/${components.length} components`);
        return appliedComponents;
    }

    /**
     * Применение соединений шаблона
     */
    async applyTemplateConnections(connections, appliedComponents, options) {
        const appliedConnections = [];

        if (!this.connectionManager || !connections || appliedComponents.length === 0) {
            return appliedConnections;
        }

        for (const connection of connections) {
            try {
                // Находим соответствующие узлы
                const fromComponent = appliedComponents[connection.from.index];
                const toComponent = appliedComponents[connection.to.index];

                if (!fromComponent || !toComponent) {
                    console.warn(`⚠️ Skipping connection: components not found`);
                    continue;
                }

                // Создаем соединение
                const connectionData = this.connectionManager.createConnectionData(
                    this.connectionManager.generateConnectionId(),
                    fromComponent.nodeId,
                    toComponent.nodeId,
                    connection.from.pointType || 'output',
                    connection.to.pointType || 'input'
                );

                // Устанавливаем оператор если указан
                if (connection.operator) {
                    connectionData.operator = connection.operator;
                }

                // Сохраняем и отрисовываем соединение
                this.connectionManager.connections.set(connectionData.id, connectionData);
                this.connectionManager.renderConnection(connectionData);

                appliedConnections.push(connectionData);

            } catch (error) {
                console.error(`❌ Error applying connection:`, error);

                if (options.strictMode) {
                    throw error;
                }
            }
        }

        console.log(`🔗 Applied ${appliedConnections.length}/${connections.length} connections`);
        return appliedConnections;
    }

    /**
     * Обновление правила из шаблона
     */
    updateRuleFromTemplate(template) {
        if (!this.core?.currentRule) return;

        // Обновляем базовые свойства
        if (template.name) {
            this.core.currentRule.name = template.name;
        }

        if (template.description) {
            this.core.currentRule.description = template.description;
        }

        if (template.settings) {
            Object.assign(this.core.currentRule, template.settings.rule || {});
        }

        // Уведомляем об обновлении
        this.core.emit?.('ruleUpdated', this.core.currentRule);

        console.log('📝 Rule metadata updated from template');
    }

    /**
     * Валидация компонента шаблона
     */
    validateTemplateComponent(component) {
        if (!component.type) {
            throw new Error('Component missing type');
        }

        // Проверяем, что такой тип компонента существует
        if (this.core?.signatureComponents && !this.core.signatureComponents.has(component.type)) {
            throw new Error(`Unknown component type: ${component.type}`);
        }

        if (!component.parameters || typeof component.parameters !== 'object') {
            throw new Error('Component missing or invalid parameters');
        }
    }

    /**
     * Создание шаблона из текущего состояния
     */
    async createTemplateFromCurrentState(templateData) {
        try {
            console.log('💾 Creating template from current state...');

            if (!this.canvasManager?.canvasNodes || this.canvasManager.canvasNodes.size === 0) {
                throw new Error('No components to create template from');
            }

            // Собираем компоненты
            const components = [];
            const nodeIdMap = new Map();
            let index = 0;

            this.canvasManager.canvasNodes.forEach((node) => {
                nodeIdMap.set(node.id, index);

                components.push({
                    type: node.componentId,
                    parameters: { ...node.parameters },
                    metadata: {
                        position: { ...node.position },
                        originalId: node.id
                    }
                });

                index++;
            });

            // Собираем соединения
            const connections = [];
            if (this.connectionManager?.connections) {
                this.connectionManager.connections.forEach((connection) => {
                    const fromIndex = nodeIdMap.get(connection.from.nodeId);
                    const toIndex = nodeIdMap.get(connection.to.nodeId);

                    if (fromIndex !== undefined && toIndex !== undefined) {
                        connections.push({
                            from: {
                                index: fromIndex,
                                pointType: connection.from.pointType
                            },
                            to: {
                                index: toIndex,
                                pointType: connection.to.pointType
                            },
                            operator: connection.operator || 'AND'
                        });
                    }
                });
            }

            // Создаем шаблон
            const template = {
                id: templateData.id || `template-${Date.now()}`,
                name: templateData.name || 'Custom Template',
                description: templateData.description || 'Template created from current state',
                version: '1.0.0',
                author: templateData.author || 'User',
                category: templateData.category || 'custom',
                tags: templateData.tags || ['custom'],
                created: new Date().toISOString(),
                components,
                connections,
                metadata: {
                    sourceRule: this.core?.currentRule?.name,
                    createdFrom: 'current-state',
                    ...templateData.metadata
                }
            };

            // Добавляем в коллекцию
            this.templates.set(template.id, template);

            // Уведомляем о создании
            this.emit('templateCreated', { template });

            console.log(`✅ Created template: ${template.id}`);
            return template;

        } catch (error) {
            console.error('❌ Error creating template:', error);
            throw error;
        }
    }

    /**
     * Экспорт шаблона в JSON
     */
    exportTemplate(templateId) {
        const template = this.getTemplate(templateId);
        if (!template) {
            throw new Error(`Template not found: ${templateId}`);
        }

        // Очищаем системные поля для экспорта
        const exportData = {
            ...template
        };

        delete exportData.loadedAt;
        delete exportData.source;
        delete exportData.complexity;
        delete exportData.estimatedApplyTime;
        delete exportData.file;

        const jsonString = JSON.stringify(exportData, null, 2);

        // Создаем blob и ссылку для скачивания
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `${template.id}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);

        console.log(`💾 Exported template: ${templateId}`);
        return jsonString;
    }

    /**
     * Импорт шаблона из JSON
     */
    async importTemplate(jsonData) {
        try {
            let template;

            if (typeof jsonData === 'string') {
                template = JSON.parse(jsonData);
            } else {
                template = jsonData;
            }

            // Валидация
            this.validateTemplate(template);

            // Обогащение
            const enrichedTemplate = this.enrichTemplate(template, {
                file: null,
                category: template.category || 'imported'
            });

            // Добавляем в коллекцию
            this.templates.set(template.id, enrichedTemplate);

            // Уведомляем об импорте
            this.emit('templateImported', { template: enrichedTemplate });

            console.log(`📥 Imported template: ${template.id}`);
            return enrichedTemplate;

        } catch (error) {
            console.error('❌ Error importing template:', error);
            throw error;
        }
    }

    // =======================================================
    // АВТООБНОВЛЕНИЕ И КЭШИРОВАНИЕ
    // =======================================================

    /**
     * Настройка автообновления
     */
    setupAutoReload() {
        if (!this.loadingSettings.autoReload) return;

        // Проверяем обновления каждые 30 секунд
        setInterval(async () => {
            try {
                await this.checkForUpdates();
            } catch (error) {
                console.error('❌ Error checking for updates:', error);
            }
        }, 30000);

        console.log('🔄 Auto-reload setup completed');
    }

    /**
     * Проверка обновлений
     */
    async checkForUpdates() {
        if (!this.lastLoadTime) return;

        try {
            // Проверяем изменения в индексе
            const indexPath = `${this.templatesBasePath}${this.templateIndexFile}`;
            const response = await fetch(indexPath, {
                method: 'HEAD',
                cache: 'no-cache'
            });

            if (response.ok) {
                const lastModified = response.headers.get('Last-Modified');
                if (lastModified) {
                    const modifiedTime = new Date(lastModified).getTime();
                    if (modifiedTime > this.lastLoadTime) {
                        console.log('🔄 Template updates detected, reloading...');
                        await this.reloadAllTemplates();
                    }
                }
            }

        } catch (error) {
            console.warn('⚠️ Error checking for updates:', error);
        }
    }

    /**
     * Перезагрузка всех шаблонов
     */
    async reloadAllTemplates() {
        try {
            console.log('🔄 Reloading all templates...');

            // Очищаем кэш
            this.loadCache.clear();
            this.templates.clear();

            // Перезагружаем
            await this.loadTemplateIndex();
            await this.loadAllTemplates();

            // Уведомляем о перезагрузке
            this.emit('templatesReloaded', {
                count: this.templates.size,
                timestamp: Date.now()
            });

            console.log('✅ Templates reloaded successfully');

        } catch (error) {
            console.error('❌ Error reloading templates:', error);
            throw error;
        }
    }

    /**
     * Очистка кэша
     */
    clearCache() {
        this.loadCache.clear();
        console.log('🗑️ Template cache cleared');
    }

    // =======================================================
    // ОБРАБОТЧИКИ СОБЫТИЙ
    // =======================================================

    /**
     * Настройка обработчиков событий
     */
    setupEventListeners() {
        // Слушаем события от других модулей
        if (this.core) {
            this.core.on?.('ruleUpdated', this.handleRuleUpdated.bind(this));
        }

        if (this.canvasManager) {
            this.canvasManager.on?.('canvasCleared', this.handleCanvasCleared.bind(this));
        }

        console.log('⚡ Template event listeners setup');
    }

    /**
     * Обработчик обновления правила
     */
    handleRuleUpdated(data) {
        // Можно добавить логику для автосохранения шаблонов
        console.log('📝 Rule updated in template manager context');
    }

    /**
     * Обработчик очистки canvas
     */
    handleCanvasCleared() {
        console.log('🧹 Canvas cleared - template state reset');
    }

    // =======================================================
    // УТИЛИТАРНЫЕ МЕТОДЫ
    // =======================================================

    /**
     * Получение статистики шаблонов
     */
    getTemplateStats() {
        const stats = {
            total: this.templates.size,
            categories: this.templateCategories.size,
            byCategory: {},
            byComplexity: { simple: 0, medium: 0, complex: 0 },
            featured: 0,
            metrics: { ...this.metrics }
        };

        // Статистика по категориям
        this.templateCategories.forEach((category, name) => {
            stats.byCategory[name] = category.count;
        });

        // Статистика по сложности
        this.templates.forEach(template => {
            stats.byComplexity[template.complexity]++;
            if (template.featured) {
                stats.featured++;
            }
        });

        return stats;
    }

    /**
     * Получение информации о загруженности
     */
    getLoadStatus() {
        return {
            isInitialized: this.isInitialized,
            templatesLoaded: this.templates.size,
            lastLoadTime: this.lastLoadTime,
            cacheSize: this.loadCache.size,
            metrics: this.metrics
        };
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
     * Активация Template Manager
     */
    activate() {
        if (!this.isInitialized) {
            console.warn('⚠️ Template Manager not initialized');
            return;
        }

        console.log('🟢 Template Manager activated');
        this.emit('activated');
    }

    /**
     * Деактивация Template Manager
     */
    deactivate() {
        console.log('🟡 Template Manager deactivated');
        this.emit('deactivated');
    }

    /**
     * Очистка ресурсов
     */
    cleanup() {
        console.log('🧹 Cleaning up Template Manager...');

        try {
            // Очищаем данные
            this.templates.clear();
            this.templateCategories.clear();
            this.loadCache.clear();

            // Очищаем обработчики событий
            this.eventHandlers.clear();

            // Сбрасываем состояние
            this.isInitialized = false;
            this.templateIndex = null;
            this.lastLoadTime = null;

            console.log('✅ Template Manager cleanup completed');

        } catch (error) {
            console.error('❌ Error during Template Manager cleanup:', error);
        }
    }
}

// =======================================================
// ЭКСПОРТ И ГЛОБАЛЬНАЯ ИНТЕГРАЦИЯ
// =======================================================

/**
 * Глобальная функция создания Template Manager
 */
function createRuleTemplateManager(coreInstance, canvasManager, connectionManager) {
    return new RuleTemplateManager(coreInstance, canvasManager, connectionManager);
}

// Экспорт для модульных систем
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        RuleTemplateManager,
        createRuleTemplateManager
    };
}

// ES6 экспорты
if (typeof window !== 'undefined') {
    window.RuleTemplateManager = RuleTemplateManager;
    window.createRuleTemplateManager = createRuleTemplateManager;

    // Для интеграции с модульной системой attack-constructor
    window.RuleTemplateManagerExports = {
        RuleTemplateManager,
        createRuleTemplateManager,
        version: '4.0.0-Enhanced-Templates'
    };
}

console.log('✅ Rule Template Manager v4.0.0-Enhanced loaded successfully');

/**
 * =======================================================
 * КОНЕЦ ФАЙЛА rule-templates.js
 * 
 * IP Roast Enterprise 4.0 - Rule Template Manager Module
 * Специализированный модуль для управления шаблонами правил
 * Версия: 4.0.0-Enhanced-Templates
 * 
 * Ключевые возможности:
 * - Асинхронная загрузка шаблонов из внешних JSON файлов
 * - Система индексирования и категоризации шаблонов
 * - Валидация схемы шаблонов и компонентов
 * - Кэширование с автоматическим обновлением
 * - Применение шаблонов с настраиваемыми опциями
 * - Создание шаблонов из текущего состояния
 * - Импорт/экспорт шаблонов в JSON формате
 * - Поиск и фильтрация шаблонов
 * - Интеграция с модульной архитектурой attack-constructor
 * - Enterprise-уровень надежности и производительности
 * =======================================================
 */
