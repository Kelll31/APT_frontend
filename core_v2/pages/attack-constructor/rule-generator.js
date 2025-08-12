/**
 * IP Roast Enterprise 4.0 - Rule Generator Module
 * Генерация правил безопасности в различных форматах (Snort, YARA, Sigma, JSON)
 * Версия: 4.0.0-Enhanced-Generator
 * 
 * @description Специализированный модуль для генерации и экспорта правил безопасности
 * @author IP Roast Security Team
 * @requires attack-constructor-core.js, canvas-manager.js, connection-manager.js
 * @integrates signature-components, ui-manager
 */

console.log('📝 Loading Rule Generator v4.0.0-Enhanced');

/**
 * Основной класс для генерации правил
 */
class RuleGenerator {
    constructor(coreInstance, canvasManager, connectionManager) {
        this.version = '4.0.0-Enhanced-Generator';
        this.core = coreInstance;
        this.canvasManager = canvasManager;
        this.connectionManager = connectionManager;
        this.isInitialized = false;

        // Поддерживаемые форматы
        this.supportedFormats = {
            'snort': {
                name: 'Snort IDS Rules',
                extension: 'rules',
                mimeType: 'text/plain',
                description: 'Snort intrusion detection rules',
                version: '3.0'
            },
            'suricata': {
                name: 'Suricata Rules',
                extension: 'rules',
                mimeType: 'text/plain',
                description: 'Suricata network security monitoring rules',
                version: '6.0'
            },
            'yara': {
                name: 'YARA Rules',
                extension: 'yar',
                mimeType: 'text/plain',
                description: 'YARA malware identification rules',
                version: '4.0'
            },
            'sigma': {
                name: 'Sigma Rules',
                extension: 'yml',
                mimeType: 'text/yaml',
                description: 'Sigma generic signature format',
                version: '1.0'
            },
            'json': {
                name: 'JSON Signature',
                extension: 'json',
                mimeType: 'application/json',
                description: 'JSON-based signature format',
                version: '1.0'
            },
            'xml': {
                name: 'XML Rules',
                extension: 'xml',
                mimeType: 'application/xml',
                description: 'XML-based rule format',
                version: '1.0'
            },
            'elastic': {
                name: 'Elasticsearch Query',
                extension: 'json',
                mimeType: 'application/json',
                description: 'Elasticsearch/ELK Stack queries',
                version: '7.0'
            },
            'splunk': {
                name: 'Splunk Search',
                extension: 'spl',
                mimeType: 'text/plain',
                description: 'Splunk search language queries',
                version: '8.0'
            }
        };

        // Настройки генерации
        this.generationSettings = {
            includeMetadata: true,
            includeComments: true,
            useOptimizations: true,
            validateOutput: true,
            prettyFormat: true,
            minifyOutput: false
        };

        // Метрики производительности
        this.performanceMetrics = {
            rulesGenerated: 0,
            lastGenerationTime: 0,
            avgGenerationTime: 0,
            totalGenerationTime: 0,
            errorCount: 0,
            warningCount: 0
        };

        // Кэш генерации
        this.generationCache = new Map();
        this.templateCache = new Map();

        // События
        this.eventHandlers = new Map();

        // SID Management для Snort/Suricata
        this.sidManager = {
            baseSid: 1000000,
            currentSid: 1000000,
            usedSids: new Set(),
            reservedRanges: new Map()
        };

        console.log('📝 Rule Generator initialized');
    }

    /**
     * Инициализация Rule Generator
     */
    async initialize() {
        try {
            console.log('🚀 Initializing Rule Generator...');

            this.setupEventListeners();
            this.initializeSidManager();
            this.loadGenerationTemplates();
            this.setupPerformanceMonitoring();

            this.isInitialized = true;
            console.log('✅ Rule Generator initialized successfully');

        } catch (error) {
            console.error('❌ Rule Generator initialization failed:', error);
            throw error;
        }
    }

    /**
     * Настройка обработчиков событий
     */
    setupEventListeners() {
        // Слушаем изменения в core модуле
        if (this.core) {
            this.core.on('ruleUpdated', this.handleRuleUpdated.bind(this));
            this.core.on('componentAdded', this.invalidateCache.bind(this));
            this.core.on('componentDeleted', this.invalidateCache.bind(this));
            this.core.on('parameterChanged', this.invalidateCache.bind(this));
        }

        // Слушаем изменения соединений
        if (this.connectionManager) {
            this.connectionManager.on('connectionCreated', this.invalidateCache.bind(this));
            this.connectionManager.on('connectionDeleted', this.invalidateCache.bind(this));
            this.connectionManager.on('connectionOperatorChanged', this.invalidateCache.bind(this));
        }

        console.log('⚡ Rule Generator event listeners bound');
    }

    /**
     * Инициализация менеджера SID
     */
    initializeSidManager() {
        // Загружаем используемые SID из localStorage
        const savedSids = localStorage.getItem('rule-generator-sids');
        if (savedSids) {
            try {
                const sidData = JSON.parse(savedSids);
                this.sidManager.currentSid = sidData.currentSid || this.sidManager.baseSid;
                this.sidManager.usedSids = new Set(sidData.usedSids || []);
            } catch (error) {
                console.warn('⚠️ Error loading SID data:', error);
            }
        }

        // Резервируем диапазоны для разных типов правил
        this.sidManager.reservedRanges.set('malware', { start: 1000000, end: 1099999 });
        this.sidManager.reservedRanges.set('network', { start: 1100000, end: 1199999 });
        this.sidManager.reservedRanges.set('web', { start: 1200000, end: 1299999 });
        this.sidManager.reservedRanges.set('custom', { start: 1900000, end: 1999999 });

        console.log('🔢 SID Manager initialized');
    }

    /**
     * Загрузка шаблонов генерации
     */
    loadGenerationTemplates() {
        // Шаблоны для различных форматов
        this.templates = {
            snort: {
                ruleHeader: (action, protocol, srcIp, srcPort, direction, dstIp, dstPort) =>
                    `${action} ${protocol} ${srcIp} ${srcPort} ${direction} ${dstIp} ${dstPort}`,
                optionSeparator: '; ',
                messageFormat: (msg) => `msg:"${msg}"`,
                sidFormat: (sid) => `sid:${sid}`,
                revFormat: (rev) => `rev:${rev}`,
                classTypeFormat: (type) => `classtype:${type}`,
                priorityFormat: (priority) => `priority:${priority}`
            },
            yara: {
                ruleHeader: (name) => `rule ${name.replace(/[^a-zA-Z0-9_]/g, '_')}`,
                metaSection: 'meta:',
                stringsSection: 'strings:',
                conditionSection: 'condition:',
                metaFormat: (key, value) => `${key} = "${value}"`,
                stringFormat: (name, value, modifiers = '') => `$${name} = "${value}"${modifiers}`,
                hexStringFormat: (name, value) => `$${name} = { ${value} }`
            },
            sigma: {
                titleFormat: (title) => `title: ${title}`,
                idFormat: (id) => `id: ${id}`,
                descriptionFormat: (desc) => `description: ${desc}`,
                authorFormat: (author) => `author: ${author}`,
                dateFormat: (date) => `date: ${date}`,
                logsourceFormat: (category, product) => `logsource:\n  category: ${category}\n  product: ${product}`,
                detectionFormat: 'detection:',
                conditionFormat: (condition) => `condition: ${condition}`,
                levelFormat: (level) => `level: ${level}`
            }
        };

        console.log('📋 Generation templates loaded');
    }

    /**
     * Настройка мониторинга производительности
     */
    setupPerformanceMonitoring() {
        // Периодическое сохранение метрик
        setInterval(() => {
            this.savePerformanceMetrics();
        }, 30000); // Каждые 30 секунд

        console.log('📊 Performance monitoring setup');
    }

    // =======================================================
    // ГЛАВНАЯ ФУНКЦИЯ ГЕНЕРАЦИИ
    // =======================================================

    /**
     * Генерация правила в указанном формате
     */
    async generateRule(format = 'snort', options = {}) {
        const startTime = performance.now();

        try {
            console.log(`📝 Generating ${format} rule...`);

            // Валидация входных данных
            if (!this.validateInputData()) {
                throw new Error('Invalid input data for rule generation');
            }

            // Проверяем кэш
            const cacheKey = this.generateCacheKey(format, options);
            if (this.generationCache.has(cacheKey) && !options.forceRegenerate) {
                console.log('💾 Using cached rule');
                return this.generationCache.get(cacheKey);
            }

            // Собираем данные для генерации
            const ruleData = this.collectRuleData();

            // Генерируем правило в указанном формате
            let generatedRule;
            switch (format.toLowerCase()) {
                case 'snort':
                    generatedRule = await this.generateSnortRule(ruleData, options);
                    break;
                case 'suricata':
                    generatedRule = await this.generateSuricataRule(ruleData, options);
                    break;
                case 'yara':
                    generatedRule = await this.generateYaraRule(ruleData, options);
                    break;
                case 'sigma':
                    generatedRule = await this.generateSigmaRule(ruleData, options);
                    break;
                case 'json':
                    generatedRule = await this.generateJsonRule(ruleData, options);
                    break;
                case 'xml':
                    generatedRule = await this.generateXmlRule(ruleData, options);
                    break;
                case 'elastic':
                    generatedRule = await this.generateElasticRule(ruleData, options);
                    break;
                case 'splunk':
                    generatedRule = await this.generateSplunkRule(ruleData, options);
                    break;
                default:
                    throw new Error(`Unsupported rule format: ${format}`);
            }

            // Валидация сгенерированного правила
            if (this.generationSettings.validateOutput) {
                const validation = this.validateGeneratedRule(generatedRule, format);
                if (!validation.isValid) {
                    console.warn('⚠️ Generated rule validation warnings:', validation.warnings);
                }
            }

            // Кэшируем результат
            this.generationCache.set(cacheKey, generatedRule);

            // Обновляем метрики
            const generationTime = performance.now() - startTime;
            this.updatePerformanceMetrics(generationTime);

            // Уведомляем о генерации
            this.emit('ruleGenerated', {
                format,
                rule: generatedRule,
                generationTime,
                options
            });

            console.log(`✅ ${format} rule generated in ${generationTime.toFixed(2)}ms`);
            return generatedRule;

        } catch (error) {
            this.performanceMetrics.errorCount++;
            console.error(`❌ Error generating ${format} rule:`, error);
            throw error;
        }
    }

    /**
     * Сбор данных для генерации правила
     */
    collectRuleData() {
        const nodes = this.canvasManager?.canvasNodes || this.core?.canvasNodes || new Map();
        const connections = this.connectionManager?.connections || this.core?.connections || new Map();
        const currentRule = this.core?.currentRule || {};

        return {
            metadata: {
                name: currentRule.name || 'Generated Rule',
                type: currentRule.type || 'detection',
                priority: currentRule.priority || 'medium',
                created: new Date().toISOString(),
                generator: 'IP Roast Enterprise v4.0',
                version: this.version
            },
            components: Array.from(nodes.values()).map(node => ({
                id: node.id,
                type: node.componentId,
                definition: node.definition,
                parameters: node.parameters,
                position: node.position || { x: 0, y: 0 }
            })),
            connections: Array.from(connections.values()).map(conn => ({
                id: conn.id,
                from: conn.from,
                to: conn.to,
                operator: conn.operator || 'AND'
            })),
            logicExpression: this.buildLogicExpression(nodes, connections),
            statistics: this.calculateRuleStatistics(nodes, connections)
        };
    }

    /**
     * Построение логического выражения
     */
    buildLogicExpression(nodes, connections) {
        if (nodes.size === 0) return '';

        if (connections.size === 0) {
            // Простое AND для всех компонентов
            const nodeNames = Array.from(nodes.values()).map(node =>
                this.sanitizeIdentifier(node.definition.name)
            );
            return nodeNames.join(' AND ');
        }

        // Построение выражения на основе соединений
        const expression = this.connectionManager?.generateLogicExpression?.() ||
            this.core?.generateLogicExpression?.() ||
            'component1 AND component2';

        return expression;
    }

    // =======================================================
    // ГЕНЕРАТОРЫ КОНКРЕТНЫХ ФОРМАТОВ
    // =======================================================

    /**
     * Генерация Snort правила
     */
    async generateSnortRule(ruleData, options = {}) {
        const { metadata, components, connections } = ruleData;

        // Определяем базовые параметры правила
        const action = options.action || 'alert';
        const protocol = this.detectProtocol(components) || 'tcp';
        const direction = options.direction || '->';

        // Определяем сетевые параметры
        const networkParams = this.extractNetworkParameters(components);
        const srcAddr = networkParams.srcAddr || 'any';
        const srcPort = networkParams.srcPort || 'any';
        const dstAddr = networkParams.dstAddr || 'any';
        const dstPort = networkParams.dstPort || 'any';

        // Генерируем заголовок правила
        const ruleHeader = this.templates.snort.ruleHeader(
            action, protocol, srcAddr, srcPort, direction, dstAddr, dstPort
        );

        // Генерируем опции правила
        const options_list = [];

        // Основные опции
        options_list.push(this.templates.snort.messageFormat(metadata.name));
        options_list.push(this.templates.snort.sidFormat(this.getNextSid('network')));
        options_list.push(this.templates.snort.revFormat(1));

        // Добавляем контентные опции
        const contentOptions = this.generateSnortContentOptions(components);
        options_list.push(...contentOptions);

        // Метаданные
        if (this.generationSettings.includeMetadata) {
            options_list.push(this.templates.snort.classTypeFormat('trojan-activity'));
            options_list.push(this.templates.snort.priorityFormat(this.getPriorityNumber(metadata.priority)));
            options_list.push(`reference:url,iproast.enterprise.local`);
            options_list.push(`metadata:policy balanced-ips drop`);
        }

        // Собираем правило
        const rule = `${ruleHeader} (${options_list.join(this.templates.snort.optionSeparator)})`;

        return this.formatOutput(rule, 'snort', options);
    }

    /**
     * Генерация Suricata правила
     */
    async generateSuricataRule(ruleData, options = {}) {
        // Suricata совместим с Snort, но имеет дополнительные возможности
        const snortRule = await this.generateSnortRule(ruleData, options);

        // Добавляем Suricata-специфичные опции
        const suricataEnhancements = [];

        // Fast pattern для оптимизации
        if (this.generationSettings.useOptimizations) {
            suricataEnhancements.push('fast_pattern');
        }

        // Добавляем flowbits если есть поведенческие компоненты
        const behavioralComponents = ruleData.components.filter(comp =>
            comp.definition.type === 'behavioral'
        );

        if (behavioralComponents.length > 0) {
            suricataEnhancements.push('flowbits:set,suspicious.behavior');
        }

        // Модифицируем правило
        if (suricataEnhancements.length > 0) {
            const enhancedRule = snortRule.replace(
                /\)$/,
                `; ${suricataEnhancements.join('; ')})`
            );
            return this.formatOutput(enhancedRule, 'suricata', options);
        }

        return this.formatOutput(snortRule, 'suricata', options);
    }

    /**
     * Генерация YARA правила
     */
    async generateYaraRule(ruleData, options = {}) {
        const { metadata, components } = ruleData;
        const ruleName = this.sanitizeIdentifier(metadata.name);

        let rule = '';

        // Заголовок правила
        rule += this.templates.yara.ruleHeader(ruleName) + '\n{\n';

        // Мета-секция
        if (this.generationSettings.includeMetadata) {
            rule += `    ${this.templates.yara.metaSection}\n`;
            rule += `        ${this.templates.yara.metaFormat('description', metadata.name)}\n`;
            rule += `        ${this.templates.yara.metaFormat('author', 'IP Roast Enterprise')}\n`;
            rule += `        ${this.templates.yara.metaFormat('date', new Date().toISOString().split('T')[0])}\n`;
            rule += `        ${this.templates.yara.metaFormat('version', metadata.version)}\n`;
            rule += `        ${this.templates.yara.metaFormat('priority', metadata.priority)}\n\n`;
        }

        // Строки для поиска
        const strings = this.generateYaraStrings(components);
        if (strings.length > 0) {
            rule += `    ${this.templates.yara.stringsSection}\n`;
            strings.forEach(str => {
                rule += `        ${str}\n`;
            });
            rule += '\n';
        }

        // Условие
        rule += `    ${this.templates.yara.conditionSection}\n`;
        const condition = this.generateYaraCondition(components, ruleData.logicExpression);
        rule += `        ${condition}\n`;

        rule += '}';

        return this.formatOutput(rule, 'yara', options);
    }

    /**
     * Генерация Sigma правила
     */
    async generateSigmaRule(ruleData, options = {}) {
        const { metadata, components } = ruleData;

        let rule = '';

        // Заголовок
        rule += `${this.templates.sigma.titleFormat(metadata.name)}\n`;
        rule += `${this.templates.sigma.idFormat(this.generateUUID())}\n`;
        rule += `${this.templates.sigma.descriptionFormat(`Rule generated by IP Roast Enterprise`)}\n`;

        if (this.generationSettings.includeMetadata) {
            rule += `${this.templates.sigma.authorFormat('IP Roast Enterprise')}\n`;
            rule += `${this.templates.sigma.dateFormat(new Date().toISOString().split('T')[0])}\n`;
            rule += `tags:\n  - ${metadata.type}\n`;
        }

        // Источник логов
        const logsource = this.detectSigmaLogsource(components);
        rule += `${this.templates.sigma.logsourceFormat(logsource.category, logsource.product)}\n`;

        // Детекция
        rule += `${this.templates.sigma.detectionFormat}\n`;
        const detection = this.generateSigmaDetection(components);
        Object.entries(detection).forEach(([key, value]) => {
            if (key === 'condition') {
                rule += `  ${this.templates.sigma.conditionFormat(value)}\n`;
            } else {
                rule += `  ${key}:\n`;
                if (typeof value === 'object') {
                    Object.entries(value).forEach(([k, v]) => {
                        rule += `    ${k}: ${JSON.stringify(v)}\n`;
                    });
                } else {
                    rule += `    - ${JSON.stringify(value)}\n`;
                }
            }
        });

        // Уровень
        rule += `${this.templates.sigma.levelFormat(this.getSigmaLevel(metadata.priority))}\n`;

        return this.formatOutput(rule, 'sigma', options);
    }

    /**
     * Генерация JSON правила
     */
    async generateJsonRule(ruleData, options = {}) {
        const jsonRule = {
            format: 'IP Roast Enterprise Signature',
            version: this.version,
            timestamp: new Date().toISOString(),
            metadata: ruleData.metadata,
            rule: {
                components: ruleData.components.map(comp => ({
                    id: comp.id,
                    type: comp.type,
                    name: comp.definition.name,
                    parameters: comp.parameters,
                    category: comp.definition.type
                })),
                connections: ruleData.connections,
                logic: {
                    expression: ruleData.logicExpression,
                    operator: 'AND' // default
                }
            },
            statistics: ruleData.statistics,
            performance: {
                estimated_fps: this.estimatePerformance(ruleData),
                memory_usage: 'medium',
                cpu_usage: 'low'
            },
            validation: {
                syntax: 'valid',
                logic: 'consistent',
                completeness: ruleData.components.length > 0 ? 'complete' : 'incomplete'
            }
        };

        const output = this.generationSettings.prettyFormat ?
            JSON.stringify(jsonRule, null, 2) :
            JSON.stringify(jsonRule);

        return this.formatOutput(output, 'json', options);
    }

    /**
     * Генерация XML правила
     */
    async generateXmlRule(ruleData, options = {}) {
        const { metadata, components, connections } = ruleData;

        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<signature xmlns="http://iproast.enterprise/signature/v1.0">\n';

        // Метаданные
        xml += '  <metadata>\n';
        xml += `    <name>${this.escapeXml(metadata.name)}</name>\n`;
        xml += `    <type>${metadata.type}</type>\n`;
        xml += `    <priority>${metadata.priority}</priority>\n`;
        xml += `    <created>${metadata.created}</created>\n`;
        xml += `    <generator>${this.escapeXml(metadata.generator)}</generator>\n`;
        xml += '  </metadata>\n';

        // Компоненты
        xml += '  <components>\n';
        components.forEach(comp => {
            xml += `    <component id="${comp.id}" type="${comp.type}">\n`;
            xml += `      <name>${this.escapeXml(comp.definition.name)}</name>\n`;
            xml += `      <category>${comp.definition.type}</category>\n`;
            xml += '      <parameters>\n';
            Object.entries(comp.parameters).forEach(([key, value]) => {
                xml += `        <parameter name="${key}">${this.escapeXml(String(value))}</parameter>\n`;
            });
            xml += '      </parameters>\n';
            xml += '    </component>\n';
        });
        xml += '  </components>\n';

        // Соединения
        if (connections.length > 0) {
            xml += '  <connections>\n';
            connections.forEach(conn => {
                xml += `    <connection id="${conn.id}" operator="${conn.operator}">\n`;
                xml += `      <from>${conn.from.nodeId}</from>\n`;
                xml += `      <to>${conn.to.nodeId}</to>\n`;
                xml += '    </connection>\n';
            });
            xml += '  </connections>\n';
        }

        xml += '</signature>';

        return this.formatOutput(xml, 'xml', options);
    }

    /**
     * Генерация Elasticsearch запроса
     */
    async generateElasticRule(ruleData, options = {}) {
        const { metadata, components } = ruleData;

        const query = {
            query: {
                bool: {
                    must: [],
                    should: [],
                    must_not: []
                }
            },
            aggs: {},
            size: options.size || 100,
            sort: [
                { "@timestamp": { order: "desc" } }
            ]
        };

        // Добавляем условия на основе компонентов
        components.forEach(comp => {
            const elasticConditions = this.componentToElasticQuery(comp);
            if (elasticConditions.must) {
                query.query.bool.must.push(...elasticConditions.must);
            }
            if (elasticConditions.should) {
                query.query.bool.should.push(...elasticConditions.should);
            }
            if (elasticConditions.must_not) {
                query.query.bool.must_not.push(...elasticConditions.must_not);
            }
        });

        // Добавляем временное ограничение
        query.query.bool.must.push({
            range: {
                "@timestamp": {
                    gte: "now-1h",
                    lte: "now"
                }
            }
        });

        const output = this.generationSettings.prettyFormat ?
            JSON.stringify(query, null, 2) :
            JSON.stringify(query);

        return this.formatOutput(output, 'elastic', options);
    }

    /**
     * Генерация Splunk поискового запроса
     */
    async generateSplunkRule(ruleData, options = {}) {
        const { metadata, components, connections } = ruleData;

        let search = 'search ';
        const conditions = [];

        // Добавляем временной диапазон
        conditions.push('earliest=-1h');

        // Преобразуем компоненты в Splunk условия
        components.forEach(comp => {
            const splunkCondition = this.componentToSplunkSearch(comp);
            if (splunkCondition) {
                conditions.push(splunkCondition);
            }
        });

        // Объединяем условия на основе логики соединений
        if (conditions.length > 1) {
            const logicOperator = this.detectDominantOperator(connections);
            search += conditions.join(` ${logicOperator} `);
        } else if (conditions.length === 1) {
            search += conditions[0];
        }

        // Добавляем статистику и группировку
        if (options.includeStats) {
            search += ' | stats count by src_ip, dest_ip | sort -count';
        }

        return this.formatOutput(search, 'splunk', options);
    }

    // =======================================================
    // ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ГЕНЕРАЦИИ
    // =======================================================

    /**
     * Генерация контентных опций для Snort
     */
    generateSnortContentOptions(components) {
        const options = [];

        components.forEach(comp => {
            switch (comp.type) {
                case 'string-match':
                    const content = comp.parameters.string || '';
                    options.push(`content:"${content}"`);
                    if (!comp.parameters.case_sensitive) {
                        options.push('nocase');
                    }
                    break;

                case 'regex-pattern':
                    const pattern = comp.parameters.pattern || '';
                    const flags = comp.parameters.flags || '';
                    options.push(`pcre:"/${pattern}/${flags}"`);
                    break;

                case 'file-hash':
                    const hashType = comp.parameters.hash_type || 'md5';
                    const hashValue = comp.parameters.hash_value || '';
                    options.push(`file_hash; hash:${hashType},${hashValue}`);
                    break;

                case 'http-header':
                    const headerName = comp.parameters.header_name || '';
                    const headerValue = comp.parameters.header_value || '';
                    options.push(`http_header; content:"${headerName}: ${headerValue}"`);
                    break;

                case 'payload-size':
                    const size = comp.parameters.size || 0;
                    const operator = comp.parameters.operator || 'gt';
                    const sizeOperator = operator === 'gt' ? '>' :
                        operator === 'lt' ? '<' : '';
                    options.push(`dsize:${sizeOperator}${size}`);
                    break;
            }
        });

        return options;
    }

    /**
     * Генерация строк для YARA
     */
    generateYaraStrings(components) {
        const strings = [];
        let stringIndex = 1;

        components.forEach(comp => {
            switch (comp.type) {
                case 'string-match':
                    const str = comp.parameters.string || '';
                    const caseModifier = comp.parameters.case_sensitive ? '' : ' nocase';
                    strings.push(`$s${stringIndex++} = "${str}"${caseModifier}`);
                    break;

                case 'regex-pattern':
                    const pattern = comp.parameters.pattern || '';
                    strings.push(`$r${stringIndex++} = /${pattern}/`);
                    break;

                case 'byte-pattern':
                    const bytePattern = comp.parameters.pattern || '';
                    strings.push(`$h${stringIndex++} = { ${bytePattern} }`);
                    break;

                case 'file-hash':
                    const hash = comp.parameters.hash_value || '';
                    strings.push(`$hash${stringIndex++} = "${hash}"`);
                    break;
            }
        });

        return strings;
    }

    /**
     * Генерация условия для YARA
     */
    generateYaraCondition(components, logicExpression) {
        if (components.length === 0) {
            return 'false';
        }

        if (components.length === 1) {
            return 'any of them';
        }

        // Если есть логическое выражение, используем его
        if (logicExpression && logicExpression !== '') {
            return this.convertLogicToYara(logicExpression);
        }

        // По умолчанию - все строки должны быть найдены
        return 'all of them';
    }

    /**
     * Преобразование компонента в Elasticsearch запрос
     */
    componentToElasticQuery(component) {
        const conditions = { must: [], should: [], must_not: [] };

        switch (component.type) {
            case 'ip-address':
                const ipField = component.parameters.direction === 'src' ? 'src_ip' : 'dest_ip';
                conditions.must.push({
                    match: { [ipField]: component.parameters.address }
                });
                break;

            case 'string-match':
                conditions.must.push({
                    match: {
                        message: {
                            query: component.parameters.string,
                            operator: 'and'
                        }
                    }
                });
                break;

            case 'http-header':
                conditions.must.push({
                    match: {
                        [`http.${component.parameters.header_name.toLowerCase()}`]:
                            component.parameters.header_value
                    }
                });
                break;
        }

        return conditions;
    }

    /**
     * Преобразование компонента в Splunk поиск
     */
    componentToSplunkSearch(component) {
        switch (component.type) {
            case 'ip-address':
                const ipField = component.parameters.direction === 'src' ? 'src_ip' : 'dest_ip';
                return `${ipField}="${component.parameters.address}"`;

            case 'string-match':
                return `"${component.parameters.string}"`;

            case 'http-header':
                return `${component.parameters.header_name}="${component.parameters.header_value}"`;

            case 'port-range':
                const portField = component.parameters.direction === 'src' ? 'src_port' : 'dest_port';
                return `${portField}=${component.parameters.ports}`;

            default:
                return null;
        }
    }

    // =======================================================
    // УТИЛИТАРНЫЕ МЕТОДЫ
    // =======================================================

    /**
     * Валидация входных данных
     */
    validateInputData() {
        if (!this.canvasManager && !this.core?.canvasNodes) {
            console.warn('⚠️ No canvas nodes available');
            return false;
        }

        const nodes = this.canvasManager?.canvasNodes || this.core?.canvasNodes || new Map();
        if (nodes.size === 0) {
            console.warn('⚠️ No components to generate rule from');
            return false;
        }

        return true;
    }

    /**
     * Валидация сгенерированного правила
     */
    validateGeneratedRule(rule, format) {
        const validation = { isValid: true, warnings: [], errors: [] };

        try {
            switch (format) {
                case 'json':
                    JSON.parse(rule);
                    break;
                case 'xml':
                    // Простая проверка XML структуры
                    if (!rule.includes('<?xml') || !rule.includes('</signature>')) {
                        validation.warnings.push('Invalid XML structure');
                    }
                    break;
                case 'yara':
                    if (!rule.includes('rule ') || !rule.includes('condition:')) {
                        validation.warnings.push('Invalid YARA rule structure');
                    }
                    break;
            }
        } catch (error) {
            validation.isValid = false;
            validation.errors.push(`Parse error: ${error.message}`);
        }

        return validation;
    }

    /**
     * Генерация ключа кэша
     */
    generateCacheKey(format, options) {
        const nodes = this.canvasManager?.canvasNodes || this.core?.canvasNodes || new Map();
        const connections = this.connectionManager?.connections || this.core?.connections || new Map();

        const dataHash = this.hashObject({
            format,
            options,
            nodeIds: Array.from(nodes.keys()).sort(),
            connectionIds: Array.from(connections.keys()).sort(),
            timestamp: Math.floor(Date.now() / 10000) // 10 секунд точности
        });

        return `rule-${format}-${dataHash}`;
    }

    /**
     * Простое хеширование объекта
     */
    hashObject(obj) {
        const str = JSON.stringify(obj);
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // 32-битное число
        }
        return Math.abs(hash).toString(36);
    }

    /**
     * Инвалидация кэша
     */
    invalidateCache() {
        this.generationCache.clear();
        console.log('🗑️ Generation cache invalidated');
    }

    /**
     * Определение протокола из компонентов
     */
    detectProtocol(components) {
        for (const comp of components) {
            if (comp.type === 'port-range' && comp.parameters.protocol !== 'any') {
                return comp.parameters.protocol;
            }
            if (comp.type === 'http-header') {
                return 'tcp';
            }
            if (comp.type === 'dns-query') {
                return 'udp';
            }
        }
        return 'tcp';
    }

    /**
     * Извлечение сетевых параметров
     */
    extractNetworkParameters(components) {
        const params = {
            srcAddr: 'any',
            srcPort: 'any',
            dstAddr: 'any',
            dstPort: 'any'
        };

        components.forEach(comp => {
            switch (comp.type) {
                case 'ip-address':
                    if (comp.parameters.direction === 'src') {
                        params.srcAddr = comp.parameters.address;
                    } else if (comp.parameters.direction === 'dst') {
                        params.dstAddr = comp.parameters.address;
                    }
                    break;

                case 'port-range':
                    if (comp.parameters.direction === 'src') {
                        params.srcPort = comp.parameters.ports;
                    } else if (comp.parameters.direction === 'dst') {
                        params.dstPort = comp.parameters.ports;
                    } else {
                        params.dstPort = comp.parameters.ports;
                    }
                    break;
            }
        });

        return params;
    }

    /**
     * Получение следующего SID
     */
    getNextSid(category = 'custom') {
        const range = this.sidManager.reservedRanges.get(category);
        let sid;

        if (range) {
            // Ищем в зарезервированном диапазоне
            for (let i = range.start; i <= range.end; i++) {
                if (!this.sidManager.usedSids.has(i)) {
                    sid = i;
                    break;
                }
            }
        }

        if (!sid) {
            // Используем общий счетчик
            do {
                sid = this.sidManager.currentSid++;
            } while (this.sidManager.usedSids.has(sid));
        }

        this.sidManager.usedSids.add(sid);
        this.saveSidData();

        return sid;
    }

    /**
     * Сохранение данных SID
     */
    saveSidData() {
        try {
            const sidData = {
                currentSid: this.sidManager.currentSid,
                usedSids: Array.from(this.sidManager.usedSids)
            };
            localStorage.setItem('rule-generator-sids', JSON.stringify(sidData));
        } catch (error) {
            console.warn('⚠️ Error saving SID data:', error);
        }
    }

    /**
     * Преобразование приоритета в число
     */
    getPriorityNumber(priority) {
        const priorities = {
            'critical': 1,
            'high': 2,
            'medium': 3,
            'low': 4
        };
        return priorities[priority] || 3;
    }

    /**
     * Получение уровня Sigma
     */
    getSigmaLevel(priority) {
        const levels = {
            'critical': 'critical',
            'high': 'high',
            'medium': 'medium',
            'low': 'low'
        };
        return levels[priority] || 'medium';
    }

    /**
     * Определение источника логов для Sigma
     */
    detectSigmaLogsource(components) {
        // Определяем категорию и продукт на основе компонентов
        for (const comp of components) {
            switch (comp.definition.type) {
                case 'network':
                    return { category: 'network', product: 'generic' };
                case 'file':
                    return { category: 'file', product: 'windows' };
                case 'behavioral':
                    return { category: 'process', product: 'generic' };
                default:
                    continue;
            }
        }
        return { category: 'generic', product: 'generic' };
    }

    /**
     * Генерация детекции для Sigma
     */
    generateSigmaDetection(components) {
        const detection = {
            selection: {},
            condition: 'selection'
        };

        components.forEach(comp => {
            switch (comp.type) {
                case 'ip-address':
                    detection.selection.src_ip = comp.parameters.address;
                    break;
                case 'string-match':
                    detection.selection.message = `*${comp.parameters.string}*`;
                    break;
                case 'http-header':
                    const headerField = `http_${comp.parameters.header_name.toLowerCase()}`;
                    detection.selection[headerField] = `*${comp.parameters.header_value}*`;
                    break;
                case 'dns-query':
                    detection.selection.query_name = comp.parameters.domain;
                    break;
            }
        });

        return detection;
    }

    /**
     * Очистка идентификатора
     */
    sanitizeIdentifier(name) {
        return name.replace(/[^a-zA-Z0-9_]/g, '_');
    }

    /**
     * Экранирование XML
     */
    escapeXml(str) {
        return str.replace(/[<>&'"]/g, (char) => {
            switch (char) {
                case '<': return '&lt;';
                case '>': return '&gt;';
                case '&': return '&amp;';
                case "'": return '&apos;';
                case '"': return '&quot;';
                default: return char;
            }
        });
    }

    /**
     * Генерация UUID
     */
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    /**
     * Оценка производительности
     */
    estimatePerformance(ruleData) {
        let score = 1000;

        // Штраф за количество компонентов
        score -= ruleData.components.length * 50;

        // Штраф за сложные компоненты
        ruleData.components.forEach(comp => {
            switch (comp.definition.type) {
                case 'content':
                    if (comp.type === 'regex-pattern') score -= 100;
                    break;
                case 'behavioral':
                    score -= 75;
                    break;
                case 'file':
                    if (comp.type === 'file-hash') score -= 25;
                    break;
            }
        });

        // Штраф за соединения
        score -= ruleData.connections.length * 25;

        return Math.max(100, score);
    }

    /**
     * Вычисление статистики правила
     */
    calculateRuleStatistics(nodes, connections) {
        return {
            componentCount: nodes.size,
            connectionCount: connections.size,
            complexity: this.calculateComplexity(nodes.size, connections.size),
            estimatedPerformance: this.estimatePerformance({
                components: Array.from(nodes.values()),
                connections: Array.from(connections.values())
            }),
            categories: this.getCategoriesDistribution(Array.from(nodes.values()))
        };
    }

    /**
     * Вычисление сложности
     */
    calculateComplexity(nodeCount, connectionCount) {
        if (nodeCount === 0) return 'none';
        if (nodeCount <= 2 && connectionCount <= 1) return 'simple';
        if (nodeCount <= 5 && connectionCount <= 4) return 'medium';
        return 'complex';
    }

    /**
     * Распределение по категориям
     */
    getCategoriesDistribution(nodes) {
        const distribution = {};
        nodes.forEach(node => {
            const category = node.definition.type;
            distribution[category] = (distribution[category] || 0) + 1;
        });
        return distribution;
    }

    /**
     * Определение доминирующего оператора
     */
    detectDominantOperator(connections) {
        const operatorCounts = {};
        connections.forEach(conn => {
            operatorCounts[conn.operator] = (operatorCounts[conn.operator] || 0) + 1;
        });

        const dominant = Object.entries(operatorCounts)
            .sort(([, a], [, b]) => b - a)[0];

        return dominant ? dominant[0] : 'AND';
    }

    /**
     * Преобразование логического выражения в YARA
     */
    convertLogicToYara(expression) {
        return expression
            .replace(/AND/g, 'and')
            .replace(/OR/g, 'or')
            .replace(/NOT/g, 'not')
            .replace(/XOR/g, 'xor');
    }

    /**
     * Форматирование вывода
     */
    formatOutput(content, format, options = {}) {
        let output = content;

        // Добавляем комментарии если включено
        if (this.generationSettings.includeComments && !options.noComments) {
            const header = this.generateRuleHeader(format);
            output = header + '\n' + output;
        }

        // Минификация если включена
        if (this.generationSettings.minifyOutput && (format === 'json' || format === 'xml')) {
            output = output.replace(/\s+/g, ' ').trim();
        }

        return output;
    }

    /**
     * Генерация заголовка правила
     */
    generateRuleHeader(format) {
        const timestamp = new Date().toISOString();
        const commentChar = this.getCommentCharacter(format);

        return [
            `${commentChar} Generated by IP Roast Enterprise v4.0`,
            `${commentChar} Rule Generator v${this.version}`,
            `${commentChar} Created: ${timestamp}`,
            `${commentChar} Format: ${format.toUpperCase()}`,
            `${commentChar} ===================================`
        ].join('\n');
    }

    /**
     * Получение символа комментария
     */
    getCommentCharacter(format) {
        const commentChars = {
            'snort': '#',
            'suricata': '#',
            'yara': '//',
            'sigma': '#',
            'json': '//',
            'xml': '<!--',
            'elastic': '//',
            'splunk': '#'
        };
        return commentChars[format] || '#';
    }

    // =======================================================
    // МЕТОДЫ ОБРАБОТКИ СОБЫТИЙ
    // =======================================================

    /**
     * Обработчик обновления правила
     */
    handleRuleUpdated(data) {
        this.invalidateCache();
        console.log('🔄 Rule updated, cache invalidated');
    }

    /**
     * Обновление метрик производительности
     */
    updatePerformanceMetrics(generationTime) {
        this.performanceMetrics.rulesGenerated++;
        this.performanceMetrics.lastGenerationTime = generationTime;
        this.performanceMetrics.totalGenerationTime += generationTime;
        this.performanceMetrics.avgGenerationTime =
            this.performanceMetrics.totalGenerationTime / this.performanceMetrics.rulesGenerated;
    }

    /**
     * Сохранение метрик производительности
     */
    savePerformanceMetrics() {
        try {
            localStorage.setItem('rule-generator-metrics', JSON.stringify(this.performanceMetrics));
        } catch (error) {
            console.warn('⚠️ Error saving performance metrics:', error);
        }
    }

    // =======================================================
    // ПУБЛИЧНЫЕ МЕТОДЫ API
    // =======================================================

    /**
     * Получение поддерживаемых форматов
     */
    getSupportedFormats() {
        return { ...this.supportedFormats };
    }

    /**
     * Получение настроек генерации
     */
    getGenerationSettings() {
        return { ...this.generationSettings };
    }

    /**
     * Обновление настроек генерации
     */
    updateGenerationSettings(newSettings) {
        this.generationSettings = { ...this.generationSettings, ...newSettings };
        this.invalidateCache();
        console.log('⚙️ Generation settings updated');
    }

    /**
     * Получение метрик производительности
     */
    getPerformanceMetrics() {
        return { ...this.performanceMetrics };
    }

    /**
     * Экспорт правила в файл
     */
    async exportRule(format, filename, options = {}) {
        try {
            const rule = await this.generateRule(format, options);
            const formatInfo = this.supportedFormats[format];

            const blob = new Blob([rule], { type: formatInfo.mimeType });
            const url = URL.createObjectURL(blob);

            const finalFilename = filename ||
                `${this.core?.currentRule?.name || 'rule'}.${formatInfo.extension}`;

            const link = document.createElement('a');
            link.href = url;
            link.download = finalFilename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            URL.revokeObjectURL(url);

            console.log(`💾 Rule exported as ${finalFilename}`);
            return true;

        } catch (error) {
            console.error(`❌ Error exporting rule:`, error);
            throw error;
        }
    }

    /**
     * Массовая генерация в нескольких форматах
     */
    async generateMultipleFormats(formats, options = {}) {
        const results = {};

        for (const format of formats) {
            try {
                results[format] = await this.generateRule(format, options);
            } catch (error) {
                console.error(`❌ Error generating ${format} rule:`, error);
                results[format] = { error: error.message };
            }
        }

        return results;
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
     * Активация Rule Generator
     */
    activate() {
        if (!this.isInitialized) {
            console.warn('⚠️ Rule Generator not initialized');
            return;
        }

        console.log('🟢 Rule Generator activated');
        this.emit('activated');
    }

    /**
     * Деактивация Rule Generator
     */
    deactivate() {
        // Сохраняем метрики
        this.savePerformanceMetrics();

        console.log('🟡 Rule Generator deactivated');
        this.emit('deactivated');
    }

    /**
     * Очистка ресурсов
     */
    cleanup() {
        console.log('🧹 Cleaning up Rule Generator...');

        try {
            // Сохраняем данные
            this.savePerformanceMetrics();
            this.saveSidData();

            // Очищаем кэш
            this.generationCache.clear();
            this.templateCache.clear();

            // Очищаем обработчики событий
            this.eventHandlers.clear();

            // Сбрасываем состояние
            this.isInitialized = false;

            console.log('✅ Rule Generator cleanup completed');

        } catch (error) {
            console.error('❌ Error during Rule Generator cleanup:', error);
        }
    }
}

// =======================================================
// ЭКСПОРТ И ГЛОБАЛЬНАЯ ИНТЕГРАЦИЯ
// =======================================================

/**
 * Глобальная функция создания Rule Generator
 */
function createRuleGenerator(coreInstance, canvasManager, connectionManager) {
    return new RuleGenerator(coreInstance, canvasManager, connectionManager);
}

// Экспорт для модульных систем
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        RuleGenerator,
        createRuleGenerator
    };
}

// ES6 экспорты
if (typeof window !== 'undefined') {
    window.RuleGenerator = RuleGenerator;
    window.createRuleGenerator = createRuleGenerator;

    // Для интеграции с модульной системой attack-constructor
    window.RuleGeneratorExports = {
        RuleGenerator,
        createRuleGenerator,
        version: '4.0.0-Enhanced-Generator'
    };
}

console.log('✅ Rule Generator v4.0.0-Enhanced loaded successfully');

/**
 * =======================================================
 * КОНЕЦ ФАЙЛА rule-generator.js
 * 
 * IP Roast Enterprise 4.0 - Rule Generator Module
 * Специализированный модуль для генерации правил безопасности
 * Версия: 4.0.0-Enhanced-Generator
 * 
 * Ключевые возможности:
 * - Генерация правил в 8 форматах (Snort, Suricata, YARA, Sigma, JSON, XML, Elasticsearch, Splunk)
 * - Интеллектуальное преобразование компонентов в специфичные для формата конструкции
 * - SID management для Snort/Suricata с зарезервированными диапазонами
 * - Кэширование и оптимизация производительности
 * - Валидация входных данных и сгенерированных правил
 * - Метрики производительности и статистика
 * - Экспорт правил в файлы различных форматов
 * - Массовая генерация в нескольких форматах
 * - Интеграция с модульной архитектурой attack-constructor
 * - Enterprise-уровень надежности и расширяемости
 * =======================================================
 */
