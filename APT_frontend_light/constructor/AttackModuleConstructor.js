/**
 * IP ROAST 4.0 - Attack Module Constructor
 * Конструктор модулей атак на чистом JavaScript
 * @version 4.0.0
 * @author IP Roast Development Team
 */

class AttackModuleConstructor {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.options = {
            theme: 'dark',
            readOnly: false,
            showLibrary: true,
            showProperties: true,
            ...options
        };

        // Состояния
        this.workflowModules = [];
        this.connections = [];
        this.selectedModuleId = null;
        this.draggingModule = null;
        this.connecting = null;
        this.searchQuery = '';
        this.selectedCategory = 'all';
        this.isExecuting = false;
        this.validationErrors = [];
        this.zoomLevel = 1;
        this.canvasOffset = { x: 0, y: 0 };
        this.history = [];
        this.historyIndex = -1;

        // Bind methods
        this.boundHandleDragStart = this.handleDragStart.bind(this);
        this.boundHandleDragOver = this.handleDragOver.bind(this);
        this.boundHandleDrop = this.handleDrop.bind(this);

        this.init();
    }

    // Полная библиотека из 25 модулей в 8 категориях
    MODULE_CATEGORIES = [
        {
            id: 'signature_analysis',
            name: 'Сигнатурный анализ',
            color: '#3B82F6',
            modules: [
                {
                    id: 'sig_scanner',
                    name: 'Сканер сигнатур',
                    description: 'Базовое сканирование и анализ отпечатков сервисов',
                    icon: 'fas fa-search',
                    inputs: ['target'],
                    outputs: ['signatures'],
                    settings: {
                        target: { type: 'text', label: 'IP/Диапазон цели', required: true, default: '192.168.1.0/24' },
                        timeout: { type: 'number', label: 'Таймаут (сек)', default: 30, min: 1, max: 300 },
                        threads: { type: 'number', label: 'Количество потоков', default: 10, min: 1, max: 100 }
                    }
                },
                {
                    id: 'service_detector',
                    name: 'Детектор сервисов',
                    description: 'Интеллектуальная идентификация типов сервисов',
                    icon: 'fas fa-network-wired',
                    inputs: ['signatures'],
                    outputs: ['services'],
                    settings: {
                        deep_scan: { type: 'checkbox', label: 'Глубокое сканирование', default: false },
                        service_db: { type: 'select', label: 'База сервисов', options: ['standard', 'extended', 'custom'], default: 'standard' }
                    }
                },
                {
                    id: 'vuln_matcher',
                    name: 'Сопоставитель уязвимостей',
                    description: 'Автоматический поиск CVE для обнаруженных сервисов',
                    icon: 'fas fa-shield-alt',
                    inputs: ['services'],
                    outputs: ['vulnerabilities'],
                    settings: {
                        cve_database: { type: 'select', label: 'База CVE', options: ['nvd', 'mitre', 'exploit-db'], default: 'nvd' },
                        severity_filter: { type: 'select', label: 'Фильтр критичности', options: ['all', 'high', 'critical'], default: 'all' }
                    }
                }
            ]
        },
        {
            id: 'intelligence',
            name: 'Интеллектуальные модули',
            color: '#8B5CF6',
            modules: [
                {
                    id: 'decision_engine',
                    name: 'Движок принятия решений',
                    description: 'Центральный ИИ-модуль системы',
                    icon: 'fas fa-brain',
                    inputs: ['vulnerabilities', 'context'],
                    outputs: ['decisions', 'priorities'],
                    settings: {
                        ai_model: { type: 'select', label: 'ИИ модель', options: ['neural_net', 'decision_tree', 'ensemble'], default: 'neural_net' },
                        confidence_threshold: { type: 'range', label: 'Порог уверенности', min: 0, max: 1, step: 0.1, default: 0.7 }
                    }
                },
                {
                    id: 'adaptive_selector',
                    name: 'Адаптивный селектор',
                    description: 'Динамический выбор стратегии атак',
                    icon: 'fas fa-user-secret',
                    inputs: ['decisions'],
                    outputs: ['strategy'],
                    settings: {
                        adaptation_mode: { type: 'select', label: 'Режим адаптации', options: ['conservative', 'aggressive', 'balanced'], default: 'balanced' },
                        learning_rate: { type: 'range', label: 'Скорость обучения', min: 0.01, max: 1, step: 0.01, default: 0.1 }
                    }
                },
                {
                    id: 'priority_analyzer',
                    name: 'Анализатор приоритетов',
                    description: 'Ранжирование целей по критичности',
                    icon: 'fas fa-list-ol',
                    inputs: ['strategy', 'vulnerabilities'],
                    outputs: ['ranked_targets'],
                    settings: {
                        ranking_algorithm: { type: 'select', label: 'Алгоритм ранжирования', options: ['cvss', 'custom', 'risk_based'], default: 'cvss' },
                        business_impact: { type: 'checkbox', label: 'Учитывать бизнес-влияние', default: true }
                    }
                }
            ]
        },
        {
            id: 'reconnaissance',
            name: 'Разведка',
            color: '#10B981',
            modules: [
                {
                    id: 'osint_collector',
                    name: 'OSINT сборщик',
                    description: 'Сбор открытой разведывательной информации',
                    icon: 'fas fa-globe',
                    inputs: ['target'],
                    outputs: ['osint_data'],
                    settings: {
                        sources: { type: 'multiselect', label: 'Источники OSINT', options: ['shodan', 'censys', 'google', 'social_media'], default: ['shodan', 'google'] },
                        depth: { type: 'select', label: 'Глубина поиска', options: ['surface', 'deep', 'comprehensive'], default: 'surface' }
                    }
                },
                {
                    id: 'dns_enum',
                    name: 'DNS перечисление',
                    description: 'Перечисление DNS записей и субдоменов',
                    icon: 'fas fa-database',
                    inputs: ['target'],
                    outputs: ['dns_records'],
                    settings: {
                        record_types: { type: 'multiselect', label: 'Типы записей', options: ['A', 'AAAA', 'MX', 'TXT', 'NS', 'CNAME'], default: ['A', 'MX'] },
                        subdomain_bruteforce: { type: 'checkbox', label: 'Брутфорс субдоменов', default: true }
                    }
                },
                {
                    id: 'social_engineer',
                    name: 'Социальная инженерия',
                    description: 'Модуль социальной инженерии и фишинга',
                    icon: 'fas fa-mask',
                    inputs: ['osint_data'],
                    outputs: ['social_vectors'],
                    settings: {
                        attack_vectors: { type: 'multiselect', label: 'Векторы атак', options: ['phishing', 'pretexting', 'baiting'], default: ['phishing'] },
                        target_roles: { type: 'multiselect', label: 'Целевые роли', options: ['admin', 'user', 'support'], default: ['admin', 'user'] }
                    }
                }
            ]
        },
        {
            id: 'attacks',
            name: 'Модули атак',
            color: '#EF4444',
            modules: [
                {
                    id: 'web_attacks',
                    name: 'Веб-атаки',
                    description: 'SQL-инъекции, XSS, CSRF атаки',
                    icon: 'fas fa-bug',
                    inputs: ['web_services'],
                    outputs: ['web_exploits'],
                    settings: {
                        attack_types: { type: 'multiselect', label: 'Типы атак', options: ['sql_injection', 'xss', 'csrf', 'lfi', 'rfi'], default: ['sql_injection', 'xss'] },
                        payload_complexity: { type: 'select', label: 'Сложность пэйлоадов', options: ['basic', 'advanced', 'obfuscated'], default: 'basic' }
                    }
                },
                {
                    id: 'network_attacks',
                    name: 'Сетевые атаки',
                    description: 'Buffer overflow, DoS, протокольные атаки',
                    icon: 'fas fa-bomb',
                    inputs: ['network_services'],
                    outputs: ['network_exploits'],
                    settings: {
                        protocols: { type: 'multiselect', label: 'Протоколы', options: ['tcp', 'udp', 'icmp', 'arp'], default: ['tcp', 'udp'] },
                        attack_intensity: { type: 'select', label: 'Интенсивность атак', options: ['low', 'medium', 'high'], default: 'medium' }
                    }
                },
                {
                    id: 'auth_bypass',
                    name: 'Обход аутентификации',
                    description: 'Брутфорс, словарные атаки, обход аутентификации',
                    icon: 'fas fa-key',
                    inputs: ['auth_services'],
                    outputs: ['credentials'],
                    settings: {
                        methods: { type: 'multiselect', label: 'Методы', options: ['bruteforce', 'dictionary', 'rainbow_tables'], default: ['dictionary'] },
                        wordlists: { type: 'select', label: 'Словари', options: ['common', 'rockyou', 'custom'], default: 'common' }
                    }
                },
                {
                    id: 'privilege_escalation',
                    name: 'Повышение привилегий',
                    description: 'Эскалация прав в системе',
                    icon: 'fas fa-arrow-up',
                    inputs: ['credentials', 'system_info'],
                    outputs: ['elevated_access'],
                    settings: {
                        os_type: { type: 'select', label: 'Тип ОС', options: ['windows', 'linux', 'macos', 'auto'], default: 'auto' },
                        escalation_methods: { type: 'multiselect', label: 'Методы эскалации', options: ['kernel_exploits', 'suid', 'sudo', 'services'], default: ['sudo', 'services'] }
                    }
                }
            ]
        },
        {
            id: 'post_exploitation',
            name: 'Пост-эксплуатация',
            color: '#F59E0B',
            modules: [
                {
                    id: 'data_extraction',
                    name: 'Извлечение данных',
                    description: 'Извлечение и экфильтрация конфиденциальных данных',
                    icon: 'fas fa-file-export',
                    inputs: ['elevated_access'],
                    outputs: ['extracted_data'],
                    settings: {
                        data_types: { type: 'multiselect', label: 'Типы данных', options: ['documents', 'databases', 'passwords', 'certificates'], default: ['documents'] },
                        extraction_method: { type: 'select', label: 'Метод извлечения', options: ['direct', 'encrypted', 'steganography'], default: 'direct' }
                    }
                },
                {
                    id: 'lateral_movement',
                    name: 'Латеральное движение',
                    description: 'Распространение по сети',
                    icon: 'fas fa-project-diagram',
                    inputs: ['elevated_access', 'network_topology'],
                    outputs: ['additional_access'],
                    settings: {
                        movement_techniques: { type: 'multiselect', label: 'Техники движения', options: ['pass_the_hash', 'wmi', 'psexec', 'ssh_tunneling'], default: ['wmi'] },
                        stealth_level: { type: 'select', label: 'Уровень скрытности', options: ['low', 'medium', 'high'], default: 'medium' }
                    }
                },
                {
                    id: 'persistence',
                    name: 'Поддержание доступа',
                    description: 'Закрепление в системе для долговременного доступа',
                    icon: 'fas fa-anchor',
                    inputs: ['elevated_access'],
                    outputs: ['persistent_access'],
                    settings: {
                        persistence_methods: { type: 'multiselect', label: 'Методы закрепления', options: ['services', 'registry', 'scheduled_tasks', 'backdoors'], default: ['services'] },
                        persistence_level: { type: 'select', label: 'Уровень закрепления', options: ['user', 'system', 'kernel'], default: 'system' }
                    }
                }
            ]
        },
        {
            id: 'evasion',
            name: 'Модули уклонения',
            color: '#6366F1',
            modules: [
                {
                    id: 'av_evasion',
                    name: 'Обход антивирусов',
                    description: 'Обход антивирусного ПО и EDR систем',
                    icon: 'fas fa-eye-slash',
                    inputs: ['payloads'],
                    outputs: ['evasive_payloads'],
                    settings: {
                        evasion_techniques: { type: 'multiselect', label: 'Техники обхода', options: ['polymorphism', 'encryption', 'packing', 'obfuscation'], default: ['encryption'] },
                        target_av: { type: 'multiselect', label: 'Целевые антивирусы', options: ['windows_defender', 'kaspersky', 'norton', 'mcafee'], default: ['windows_defender'] }
                    }
                },
                {
                    id: 'traffic_obfuscation',
                    name: 'Обфускация трафика',
                    description: 'Сокрытие сетевого трафика от систем мониторинга',
                    icon: 'fas fa-user-ninja',
                    inputs: ['network_traffic'],
                    outputs: ['obfuscated_traffic'],
                    settings: {
                        obfuscation_methods: { type: 'multiselect', label: 'Методы обфускации', options: ['encryption', 'steganography', 'protocol_tunneling'], default: ['encryption'] },
                        cover_protocols: { type: 'multiselect', label: 'Протоколы-прикрытия', options: ['http', 'https', 'dns', 'icmp'], default: ['https'] }
                    }
                },
                {
                    id: 'anti_forensics',
                    name: 'Анти-форензика',
                    description: 'Противодействие криминалистическому анализу',
                    icon: 'fas fa-eraser',
                    inputs: ['system_state'],
                    outputs: ['cleaned_system'],
                    settings: {
                        cleanup_level: { type: 'select', label: 'Уровень очистки', options: ['basic', 'thorough', 'military'], default: 'basic' },
                        artifact_removal: { type: 'multiselect', label: 'Удаление артефактов', options: ['logs', 'registry', 'temp_files', 'memory_dumps'], default: ['logs'] }
                    }
                }
            ]
        },
        {
            id: 'analytics',
            name: 'Аналитические модули',
            color: '#14B8A6',
            modules: [
                {
                    id: 'vuln_assessor',
                    name: 'Оценщик уязвимостей',
                    description: 'Анализ и оценка найденных уязвимостей',
                    icon: 'fas fa-exclamation-triangle',
                    inputs: ['vulnerabilities', 'exploits'],
                    outputs: ['risk_assessment'],
                    settings: {
                        assessment_framework: { type: 'select', label: 'Фреймворк оценки', options: ['cvss', 'owasp', 'nist'], default: 'cvss' },
                        business_context: { type: 'checkbox', label: 'Учитывать бизнес-контекст', default: true }
                    }
                },
                {
                    id: 'report_generator',
                    name: 'Генератор отчетов',
                    description: 'Автоматическая генерация детальных отчетов',
                    icon: 'fas fa-file-alt',
                    inputs: ['all_data'],
                    outputs: ['reports'],
                    settings: {
                        report_format: { type: 'multiselect', label: 'Форматы отчетов', options: ['pdf', 'html', 'docx', 'json'], default: ['html'] },
                        detail_level: { type: 'select', label: 'Уровень детализации', options: ['executive', 'technical', 'comprehensive'], default: 'technical' }
                    }
                },
                {
                    id: 'visualizer',
                    name: 'Визуализатор',
                    description: 'Создание интерактивных диаграмм и графиков',
                    icon: 'fas fa-chart-network',
                    inputs: ['network_topology', 'attack_paths'],
                    outputs: ['visualizations'],
                    settings: {
                        visualization_types: { type: 'multiselect', label: 'Типы визуализации', options: ['network_graph', 'attack_tree', 'timeline', 'heatmap'], default: ['network_graph'] },
                        interactive: { type: 'checkbox', label: 'Интерактивная визуализация', default: true }
                    }
                }
            ]
        },
        {
            id: 'system',
            name: 'Системные модули',
            color: '#6B7280',
            modules: [
                {
                    id: 'payload_generator',
                    name: 'Генератор пэйлоадов',
                    description: 'Создание пользовательских эксплойтов и пэйлоадов',
                    icon: 'fas fa-code',
                    inputs: ['exploit_templates'],
                    outputs: ['custom_payloads'],
                    settings: {
                        payload_types: { type: 'multiselect', label: 'Типы пэйлоадов', options: ['shellcode', 'meterpreter', 'custom_binary'], default: ['shellcode'] },
                        encoding: { type: 'select', label: 'Кодировка', options: ['none', 'base64', 'hex', 'custom'], default: 'none' }
                    }
                },
                {
                    id: 'encoder',
                    name: 'Кодировщик',
                    description: 'Кодирование и шифрование данных и команд',
                    icon: 'fas fa-lock',
                    inputs: ['raw_data'],
                    outputs: ['encoded_data'],
                    settings: {
                        encoding_methods: { type: 'multiselect', label: 'Методы кодирования', options: ['base64', 'hex', 'url', 'unicode'], default: ['base64'] },
                        encryption: { type: 'select', label: 'Шифрование', options: ['none', 'aes', 'rsa', 'custom'], default: 'none' }
                    }
                },
                {
                    id: 'config_manager',
                    name: 'Менеджер конфигураций',
                    description: 'Управление настройками и конфигурациями модулей',
                    icon: 'fas fa-cogs',
                    inputs: ['module_configs'],
                    outputs: ['optimized_configs'],
                    settings: {
                        auto_optimization: { type: 'checkbox', label: 'Автоматическая оптимизация', default: false },
                        config_profiles: { type: 'multiselect', label: 'Профили конфигурации', options: ['stealth', 'aggressive', 'balanced'], default: ['balanced'] }
                    }
                }
            ]
        }
    ];

    WORKFLOW_TEMPLATES = [
        {
            id: 'basic_pentest',
            name: 'Базовый пентест',
            description: 'Стандартная последовательность для тестирования на проникновение',
            modules: [
                { moduleId: 'sig_scanner', position: { x: 100, y: 100 } },
                { moduleId: 'service_detector', position: { x: 350, y: 100 } },
                { moduleId: 'vuln_matcher', position: { x: 600, y: 100 } },
                { moduleId: 'decision_engine', position: { x: 850, y: 100 } }
            ],
            connections: [
                { from: 0, to: 1 },
                { from: 1, to: 2 },
                { from: 2, to: 3 }
            ],
            estimatedTime: "15 минут"
        },
        {
            id: 'advanced_apt',
            name: 'Продвинутая APT симуляция',
            description: 'Комплексная имитация APT-атаки с полным жизненным циклом',
            modules: [
                { moduleId: 'osint_collector', position: { x: 100, y: 50 } },
                { moduleId: 'social_engineer', position: { x: 350, y: 50 } },
                { moduleId: 'web_attacks', position: { x: 600, y: 50 } },
                { moduleId: 'privilege_escalation', position: { x: 850, y: 50 } },
                { moduleId: 'lateral_movement', position: { x: 600, y: 200 } },
                { moduleId: 'persistence', position: { x: 850, y: 200 } },
                { moduleId: 'data_extraction', position: { x: 1100, y: 200 } },
                { moduleId: 'anti_forensics', position: { x: 1100, y: 350 } }
            ],
            connections: [
                { from: 0, to: 1 },
                { from: 1, to: 2 },
                { from: 2, to: 3 },
                { from: 3, to: 4 },
                { from: 4, to: 5 },
                { from: 5, to: 6 },
                { from: 6, to: 7 }
            ],
            estimatedTime: "2 часа"
        },
        {
            id: 'stealth_recon',
            name: 'Скрытная разведка',
            description: 'Пассивная разведка с минимальным следом',
            modules: [
                { moduleId: 'osint_collector', position: { x: 100, y: 100 } },
                { moduleId: 'dns_enum', position: { x: 350, y: 100 } },
                { moduleId: 'traffic_obfuscation', position: { x: 600, y: 100 } },
                { moduleId: 'visualizer', position: { x: 850, y: 100 } }
            ],
            connections: [
                { from: 0, to: 1 },
                { from: 1, to: 2 },
                { from: 2, to: 3 }
            ],
            estimatedTime: "30 минут"
        }
    ];

    init() {
        this.render();
        this.setupEventListeners();
        this.loadDefaultTemplate();
    }

    generateUUID() {
        return 'module_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36);
    }

    render() {
        this.container.innerHTML = `
      <div class="attack-module-constructor ${this.options.theme}">
        ${this.renderToolbar()}
        <div class="constructor-content">
          ${this.renderModuleLibrary()}
          ${this.renderCanvas()}
          ${this.renderPropertiesPanel()}
        </div>
      </div>
    `;
    }

    renderToolbar() {
        return `
      <div class="constructor-toolbar">
        <div class="toolbar-section">
          <button class="tool-btn" id="toggle-library" title="Переключить библиотеку модулей">
            <i class="fas fa-list"></i>
          </button>
          <button class="tool-btn" id="toggle-properties" title="Переключить панель свойств">
            <i class="fas fa-cog"></i>
          </button>
          <div class="toolbar-divider"></div>
          <button class="tool-btn" id="undo-btn" title="Отменить">
            <i class="fas fa-undo"></i>
          </button>
          <button class="tool-btn" id="redo-btn" title="Повторить">
            <i class="fas fa-redo"></i>
          </button>
          <div class="toolbar-divider"></div>
          <button class="tool-btn" id="export-btn" title="Экспорт workflow">
            <i class="fas fa-download"></i>
          </button>
          <button class="tool-btn" id="import-btn" title="Импорт workflow">
            <i class="fas fa-upload"></i>
          </button>
          <input type="file" id="import-file" accept=".json" style="display: none;">
        </div>
        <div class="toolbar-section">
          <div class="zoom-controls">
            <button class="tool-btn" id="zoom-out" title="Уменьшить масштаб">-</button>
            <span class="zoom-level">100%</span>
            <button class="tool-btn" id="zoom-in" title="Увеличить масштаб">+</button>
          </div>
          <div class="toolbar-divider"></div>
          <button class="execute-btn" id="execute-workflow" title="Выполнить workflow">
            <i class="fas fa-play"></i>
            <span>Выполнить</span>
          </button>
        </div>
      </div>
    `;
    }

    renderModuleLibrary() {
        return `
      <div class="module-library ${this.options.showLibrary ? '' : 'hidden'}">
        <div class="library-header">
          <h3>Библиотека модулей</h3>
          <div class="library-controls">
            <input type="text" id="search-modules" placeholder="Поиск модулей..." class="search-modules">
            <select id="category-filter" class="category-filter">
              <option value="all">Все категории</option>
              ${this.MODULE_CATEGORIES.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="module-categories" id="module-categories">
          ${this.renderModuleCategories()}
        </div>
        <div class="template-section">
          <h4>Шаблоны Workflow</h4>
          <div class="template-list">
            ${this.WORKFLOW_TEMPLATES.map(template => `
              <div class="template-item" data-template-id="${template.id}" title="${template.description}">
                <div class="template-name">${template.name}</div>
                <div class="template-description">${template.description}</div>
                <div class="template-stats">${template.modules.length} модулей • ${template.estimatedTime}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
    }

    renderModuleCategories() {
        return this.MODULE_CATEGORIES.map(category => `
      <div class="module-category">
        <div class="category-header" style="border-left-color: ${category.color}">
          <span>${category.name}</span>
          <span class="module-count">(${category.modules.length})</span>
        </div>
        <div class="module-list">
          ${category.modules.map(module => `
            <div class="module-item" 
                 draggable="true" 
                 data-module-id="${module.id}"
                 data-category-id="${category.id}"
                 title="${module.description}">
              <div class="module-icon" style="color: ${category.color}">
                <i class="${module.icon}"></i>
              </div>
              <div class="module-content">
                <div class="module-name">${module.name}</div>
                <div class="module-description">${module.description}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');
    }

    renderCanvas() {
        return `
      <div class="canvas-area">
        <div class="canvas-toolbar">
          <div class="toolbar-group">
            <button class="tool-btn" id="clear-canvas" title="Очистить канвас">
              <i class="fas fa-trash"></i>
            </button>
            <button class="tool-btn" id="auto-layout" title="Автоматическая компоновка">
              <i class="fas fa-sitemap"></i>
            </button>
            <button class="tool-btn" id="fit-to-screen" title="Вместить в экран">
              <i class="fas fa-expand-arrows-alt"></i>
            </button>
          </div>
          <div class="toolbar-info">
            <span>Модулей: <span id="module-count">0</span></span>
            <span>Соединений: <span id="connection-count">0</span></span>
            <span id="execution-status" class="execution-status"></span>
          </div>
        </div>
        <div class="canvas-container">
          <div class="canvas" id="workflow-canvas">
            <svg class="connections-svg" id="connections-svg">
              <defs>
                <marker id="arrow" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
                  <path d="M0,0 L10,5 L0,10 Z" fill="var(--color-teal-400)" />
                </marker>
              </defs>
            </svg>
            <div class="canvas-placeholder" id="canvas-placeholder">
              <i class="fas fa-project-diagram placeholder-icon"></i>
              <h4>Перетащите модули сюда</h4>
              <p>Создайте свой workflow, перетащив модули из библиотеки</p>
              <div class="placeholder-actions">
                <button class="btn btn--secondary" id="load-template-btn">
                  <i class="fas fa-plus"></i>
                  Загрузить шаблон
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    }

    renderPropertiesPanel() {
        return `
      <div class="properties-panel ${this.options.showProperties ? '' : 'hidden'}">
        <div class="panel-header">
          <h3>Свойства модуля</h3>
          <div class="panel-actions">
            <div class="validation-indicator" id="validation-indicator"></div>
            <button class="tool-btn" id="panel-close" title="Скрыть панель">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
        <div class="panel-content" id="properties-content">
          <div class="no-selection">
            <i class="fas fa-cog no-selection-icon"></i>
            <p>Выберите модуль для настройки</p>
            <div class="quick-tips">
              <h5>Быстрые советы:</h5>
              <ul>
                <li>Перетащите модули на канвас</li>
                <li>Соедините модули стрелками</li>
                <li>Настройте параметры каждого модуля</li>
                <li>Запустите workflow</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    `;
    }

    setupEventListeners() {
        // Toolbar events
        this.setupToolbarEvents();

        // Search and filter
        this.setupSearchAndFilter();

        // Template loading
        this.setupTemplateEvents();

        // Drag and drop
        this.setupDragAndDrop();

        // Canvas events
        this.setupCanvasEvents();

        // Properties panel events
        this.setupPropertiesEvents();

        // Keyboard shortcuts
        this.setupKeyboardShortcuts();
    }

    setupToolbarEvents() {
        document.getElementById('toggle-library')?.addEventListener('click', () => {
            this.toggleLibrary();
        });

        document.getElementById('toggle-properties')?.addEventListener('click', () => {
            this.toggleProperties();
        });

        document.getElementById('execute-workflow')?.addEventListener('click', () => {
            this.executeWorkflow();
        });

        document.getElementById('clear-canvas')?.addEventListener('click', () => {
            this.clearCanvas();
        });

        document.getElementById('auto-layout')?.addEventListener('click', () => {
            this.autoLayout();
        });

        document.getElementById('fit-to-screen')?.addEventListener('click', () => {
            this.fitToScreen();
        });

        document.getElementById('zoom-in')?.addEventListener('click', () => {
            this.zoomIn();
        });

        document.getElementById('zoom-out')?.addEventListener('click', () => {
            this.zoomOut();
        });

        document.getElementById('export-btn')?.addEventListener('click', () => {
            this.exportWorkflow();
        });

        document.getElementById('import-btn')?.addEventListener('click', () => {
            document.getElementById('import-file')?.click();
        });

        document.getElementById('import-file')?.addEventListener('change', (e) => {
            this.importWorkflow(e);
        });

        document.getElementById('undo-btn')?.addEventListener('click', () => {
            this.undo();
        });

        document.getElementById('redo-btn')?.addEventListener('click', () => {
            this.redo();
        });
    }

    setupSearchAndFilter() {
        document.getElementById('search-modules')?.addEventListener('input', (e) => {
            this.searchQuery = e.target.value;
            this.filterModules();
        });

        document.getElementById('category-filter')?.addEventListener('change', (e) => {
            this.selectedCategory = e.target.value;
            this.filterModules();
        });
    }

    setupTemplateEvents() {
        document.querySelectorAll('.template-item').forEach(item => {
            item.addEventListener('click', () => {
                const templateId = item.dataset.templateId;
                this.loadTemplate(templateId);
            });
        });

        document.getElementById('load-template-btn')?.addEventListener('click', () => {
            this.loadTemplate('basic_pentest');
        });
    }

    setupDragAndDrop() {
        const canvas = document.getElementById('workflow-canvas');

        // Module drag start
        document.querySelectorAll('.module-item').forEach(item => {
            item.addEventListener('dragstart', this.boundHandleDragStart);
        });

        // Canvas drop events
        canvas.addEventListener('dragover', this.boundHandleDragOver);
        canvas.addEventListener('drop', this.boundHandleDrop);
    }

    handleDragStart(e) {
        const moduleId = e.target.closest('.module-item').dataset.moduleId;
        const categoryId = e.target.closest('.module-item').dataset.categoryId;

        this.draggingModule = this.findModuleDefinition(moduleId, categoryId);
        e.dataTransfer.effectAllowed = 'copy';
        e.dataTransfer.setData('text/plain', moduleId);

        // Visual feedback
        e.target.closest('.module-item').classList.add('dragging');
    }

    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    }

    handleDrop(e) {
        e.preventDefault();

        // Remove dragging visual feedback
        document.querySelectorAll('.module-item').forEach(item => {
            item.classList.remove('dragging');
        });

        if (!this.draggingModule) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const position = {
            x: (e.clientX - rect.left - this.canvasOffset.x) / this.zoomLevel,
            y: (e.clientY - rect.top - this.canvasOffset.y) / this.zoomLevel
        };

        this.addModuleToWorkflow(this.draggingModule, position);
        this.draggingModule = null;
    }

    setupCanvasEvents() {
        const canvas = document.getElementById('workflow-canvas');

        // Click to deselect
        canvas.addEventListener('click', (e) => {
            if (e.target === canvas) {
                this.deselectAllModules();
            }
        });

        // Wheel zoom
        canvas.addEventListener('wheel', (e) => {
            e.preventDefault();

            if (e.deltaY > 0) {
                this.zoomOut();
            } else {
                this.zoomIn();
            }
        });
    }

    setupPropertiesEvents() {
        document.getElementById('panel-close')?.addEventListener('click', () => {
            this.toggleProperties();
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'z':
                        e.preventDefault();
                        if (e.shiftKey) {
                            this.redo();
                        } else {
                            this.undo();
                        }
                        break;
                    case 's':
                        e.preventDefault();
                        this.exportWorkflow();
                        break;
                    case 'o':
                        e.preventDefault();
                        document.getElementById('import-file')?.click();
                        break;
                }
            } else if (e.key === 'Delete' && this.selectedModuleId) {
                this.removeModule(this.selectedModuleId);
            } else if (e.key === 'Escape') {
                this.deselectAllModules();
            }
        });
    }

    findModuleDefinition(moduleId, categoryId) {
        const category = this.MODULE_CATEGORIES.find(cat => cat.id === categoryId);
        return category?.modules.find(mod => mod.id === moduleId);
    }

    findModuleDefinitionById(moduleId) {
        for (const category of this.MODULE_CATEGORIES) {
            const module = category.modules.find(m => m.id === moduleId);
            if (module) return { module, category };
        }
        return null;
    }

    addModuleToWorkflow(moduleDefinition, position) {
        const id = this.generateUUID();
        const categoryData = this.MODULE_CATEGORIES.find(cat =>
            cat.modules.some(mod => mod.id === moduleDefinition.id)
        );

        const newModule = {
            id,
            moduleId: moduleDefinition.id,
            name: moduleDefinition.name,
            description: moduleDefinition.description,
            icon: moduleDefinition.icon,
            color: categoryData?.color || '#6B7280',
            category: categoryData?.id || 'unknown',
            position: position || { x: 100, y: 100 },
            settings: this.getDefaultSettings(moduleDefinition),
            status: 'configured',
            inputs: moduleDefinition.inputs || [],
            outputs: moduleDefinition.outputs || []
        };

        this.workflowModules.push(newModule);
        this.renderWorkflowModule(newModule);
        this.updateStats();
        this.hideCanvasPlaceholder();
        this.saveToHistory();

        // Show notification
        this.showNotification(`Модуль "${newModule.name}" добавлен в workflow`, 'success');
    }

    renderWorkflowModule(module) {
        const canvas = document.getElementById('workflow-canvas');
        const moduleElement = document.createElement('div');
        moduleElement.className = 'workflow-module';
        moduleElement.dataset.moduleId = module.id;
        moduleElement.style.left = module.position.x + 'px';
        moduleElement.style.top = module.position.y + 'px';
        moduleElement.style.borderColor = module.color;

        moduleElement.innerHTML = `
      <div class="module-header">
        <div class="module-icon" style="color: ${module.color}">
          <i class="${module.icon}"></i>
        </div>
        <div class="module-title">
          <span>${module.name}</span>
          <div class="status-indicator ${module.status}" title="Статус: ${module.status}"></div>
        </div>
        <button class="remove-btn" title="Удалить модуль">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="module-body">
        <div class="module-description">${module.description}</div>
        <div class="module-ports">
          <div class="input-ports">
            ${module.inputs.map((input, index) => `
              <div class="port input-port" data-port-type="input" data-port-index="${index}" title="Вход: ${input}"></div>
            `).join('')}
          </div>
          <div class="output-ports">
            ${module.outputs.map((output, index) => `
              <div class="port output-port" data-port-type="output" data-port-index="${index}" title="Выход: ${output}"></div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

        // Events
        moduleElement.addEventListener('click', (e) => {
            e.stopPropagation();
            this.selectModule(module.id);
        });

        moduleElement.querySelector('.remove-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.removeModule(module.id);
        });

        // Port connection events
        moduleElement.querySelectorAll('.port').forEach(port => {
            port.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handlePortClick(module.id, port);
            });
        });

        // Make draggable
        this.makeModuleDraggable(moduleElement, module);

        canvas.appendChild(moduleElement);
    }

    makeModuleDraggable(element, module) {
        let isDragging = false;
        let startPos = { x: 0, y: 0 };
        let lastPos = { x: module.position.x, y: module.position.y };

        const header = element.querySelector('.module-header');

        header.addEventListener('mousedown', (e) => {
            if (e.target.closest('.remove-btn') || e.target.closest('.port')) return;

            isDragging = true;
            startPos = {
                x: e.clientX - module.position.x,
                y: e.clientY - module.position.y
            };

            element.style.zIndex = '1000';
            element.classList.add('dragging');

            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            const newPos = {
                x: Math.max(0, e.clientX - startPos.x),
                y: Math.max(0, e.clientY - startPos.y)
            };

            module.position = newPos;
            element.style.left = newPos.x + 'px';
            element.style.top = newPos.y + 'px';

            this.updateConnections();
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                element.style.zIndex = '';
                element.classList.remove('dragging');

                // Save to history if position actually changed
                if (lastPos.x !== module.position.x || lastPos.y !== module.position.y) {
                    this.saveToHistory();
                    lastPos = { x: module.position.x, y: module.position.y };
                }
            }
        });
    }

    handlePortClick(moduleId, portElement) {
        const portType = portElement.dataset.portType;

        if (this.connecting) {
            // Complete connection
            if (this.connecting.moduleId !== moduleId) {
                if (this.connecting.portType === 'output' && portType === 'input') {
                    this.addConnection(this.connecting.moduleId, moduleId);
                } else if (this.connecting.portType === 'input' && portType === 'output') {
                    this.addConnection(moduleId, this.connecting.moduleId);
                }
            }
            this.connecting = null;
            this.clearConnectionHighlights();
        } else {
            // Start connection
            this.connecting = {
                moduleId,
                portType,
                element: portElement
            };
            portElement.classList.add('connecting');
        }
    }

    addConnection(fromModuleId, toModuleId) {
        // Check if connection already exists
        const existingConnection = this.connections.find(
            conn => conn.from === fromModuleId && conn.to === toModuleId
        );

        if (existingConnection) {
            this.showNotification('Соединение уже существует', 'warning');
            return;
        }

        const connectionId = this.generateUUID();
        const newConnection = {
            id: connectionId,
            from: fromModuleId,
            to: toModuleId
        };

        this.connections.push(newConnection);
        this.renderConnection(newConnection);
        this.updateStats();
        this.saveToHistory();

        this.showNotification('Соединение создано', 'success');
    }

    renderConnection(connection) {
        const svg = document.getElementById('connections-svg');
        const fromModule = this.workflowModules.find(m => m.id === connection.from);
        const toModule = this.workflowModules.find(m => m.id === connection.to);

        if (!fromModule || !toModule) return;

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('class', 'connection-line');
        line.setAttribute('data-connection-id', connection.id);
        line.setAttribute('stroke', 'var(--color-teal-400)');
        line.setAttribute('stroke-width', '2');
        line.setAttribute('marker-end', 'url(#arrow)');

        // Calculate positions
        this.updateConnectionLine(line, fromModule, toModule);

        // Click to remove
        line.addEventListener('click', (e) => {
            e.stopPropagation();
            this.removeConnection(connection.id);
        });

        svg.appendChild(line);
    }

    updateConnectionLine(line, fromModule, toModule) {
        const startX = fromModule.position.x + 200; // Module width
        const startY = fromModule.position.y + 60;  // Module height / 2
        const endX = toModule.position.x;
        const endY = toModule.position.y + 60;

        line.setAttribute('x1', startX);
        line.setAttribute('y1', startY);
        line.setAttribute('x2', endX);
        line.setAttribute('y2', endY);
    }

    updateConnections() {
        this.connections.forEach(connection => {
            const line = document.querySelector(`[data-connection-id="${connection.id}"]`);
            const fromModule = this.workflowModules.find(m => m.id === connection.from);
            const toModule = this.workflowModules.find(m => m.id === connection.to);

            if (line && fromModule && toModule) {
                this.updateConnectionLine(line, fromModule, toModule);
            }
        });
    }

    removeConnection(connectionId) {
        this.connections = this.connections.filter(conn => conn.id !== connectionId);

        const line = document.querySelector(`[data-connection-id="${connectionId}"]`);
        line?.remove();

        this.updateStats();
        this.saveToHistory();
    }

    clearConnectionHighlights() {
        document.querySelectorAll('.port.connecting').forEach(port => {
            port.classList.remove('connecting');
        });
    }

    selectModule(moduleId) {
        // Deselect all modules
        this.deselectAllModules();

        // Select current module
        const moduleElement = document.querySelector(`[data-module-id="${moduleId}"]`);
        moduleElement?.classList.add('selected');

        this.selectedModuleId = moduleId;
        this.showModuleProperties(moduleId);
    }

    deselectAllModules() {
        document.querySelectorAll('.workflow-module').forEach(mod => {
            mod.classList.remove('selected');
        });

        this.selectedModuleId = null;
        this.showNoSelection();
    }

    showModuleProperties(moduleId) {
        const module = this.workflowModules.find(m => m.id === moduleId);
        if (!module) return;

        const moduleDefinition = this.findModuleDefinitionById(module.moduleId);
        const content = document.getElementById('properties-content');

        if (!moduleDefinition?.module.settings) {
            content.innerHTML = `
        <div class="no-settings">
          <div class="module-info">
            <h4>${module.name}</h4>
            <p>${module.description}</p>
          </div>
          <div class="module-meta">
            <div class="meta-item">
              <span class="meta-label">Категория:</span>
              <span class="meta-value">${moduleDefinition?.category.name || 'Неизвестно'}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Статус:</span>
              <span class="meta-value status-${module.status}">${this.getStatusLabel(module.status)}</span>
            </div>
          </div>
          <p class="no-settings-text">У данного модуля нет настраиваемых параметров</p>
        </div>
      `;
            return;
        }

        content.innerHTML = `
      <div class="module-properties">
        <div class="module-info">
          <h4>${module.name}</h4>
          <p>${module.description}</p>
        </div>
        <div class="module-meta">
          <div class="meta-item">
            <span class="meta-label">Категория:</span>
            <span class="meta-value">${moduleDefinition?.category.name || 'Неизвестно'}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Статус:</span>
            <span class="meta-value status-${module.status}">${this.getStatusLabel(module.status)}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Входы:</span>
            <span class="meta-value">${module.inputs.join(', ') || 'Нет'}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Выходы:</span>
            <span class="meta-value">${module.outputs.join(', ') || 'Нет'}</span>
          </div>
        </div>
        <div class="settings-form">
          <h5>Настройки модуля</h5>
          ${this.renderModuleSettings(moduleDefinition.module.settings, module.settings)}
        </div>
        <div class="module-actions">
          <button class="btn btn--danger btn--small" onclick="window.attackConstructor.removeModule('${moduleId}')">
            <i class="fas fa-trash"></i>
            Удалить модуль
          </button>
        </div>
      </div>
    `;

        this.setupSettingsEvents(moduleId);
    }

    getStatusLabel(status) {
        const labels = {
            'configured': 'Настроен',
            'running': 'Выполняется',
            'completed': 'Завершен',
            'error': 'Ошибка'
        };
        return labels[status] || status;
    }

    renderModuleSettings(settingsDefinition, currentSettings) {
        return Object.entries(settingsDefinition).map(([key, config]) => {
            const value = currentSettings[key] !== undefined ? currentSettings[key] : config.default;

            switch (config.type) {
                case 'text':
                    return `
            <div class="setting-field">
              <label for="setting-${key}">${config.label}</label>
              <input type="text" id="setting-${key}" data-setting="${key}" value="${value || ''}" 
                     placeholder="${config.placeholder || ''}" 
                     ${config.required ? 'required' : ''}>
            </div>
          `;

                case 'number':
                    return `
            <div class="setting-field">
              <label for="setting-${key}">${config.label}</label>
              <input type="number" id="setting-${key}" data-setting="${key}" value="${value || ''}" 
                     min="${config.min || ''}" max="${config.max || ''}" 
                     ${config.required ? 'required' : ''}>
            </div>
          `;

                case 'select':
                    return `
            <div class="setting-field">
              <label for="setting-${key}">${config.label}</label>
              <select id="setting-${key}" data-setting="${key}" ${config.required ? 'required' : ''}>
                <option value="">Выберите значение</option>
                ${config.options.map(option =>
                        `<option value="${option}" ${value === option ? 'selected' : ''}>${option}</option>`
                    ).join('')}
              </select>
            </div>
          `;

                case 'checkbox':
                    return `
            <div class="setting-field">
              <label class="checkbox-label">
                <input type="checkbox" id="setting-${key}" data-setting="${key}" ${value ? 'checked' : ''}>
                <span class="checkmark"></span>
                ${config.label}
              </label>
            </div>
          `;

                case 'range':
                    return `
            <div class="setting-field">
              <label for="setting-${key}">${config.label}</label>
              <div class="range-input">
                <input type="range" id="setting-${key}" data-setting="${key}" 
                       min="${config.min}" max="${config.max}" 
                       step="${config.step}" value="${value}">
                <span class="range-value">${value}</span>
              </div>
            </div>
          `;

                case 'multiselect':
                    const selectedValues = Array.isArray(value) ? value : [];
                    return `
            <div class="setting-field">
              <label>${config.label}</label>
              <div class="multiselect">
                ${config.options.map(option => `
                  <label class="multiselect-option">
                    <input type="checkbox" data-setting="${key}" value="${option}" 
                           ${selectedValues.includes(option) ? 'checked' : ''}>
                    <span>${option}</span>
                  </label>
                `).join('')}
              </div>
            </div>
          `;

                default:
                    return '';
            }
        }).join('');
    }

    setupSettingsEvents(moduleId) {
        const settingsInputs = document.querySelectorAll('#properties-content [data-setting]');

        settingsInputs.forEach(input => {
            input.addEventListener('change', () => {
                this.updateModuleSetting(moduleId, input.dataset.setting, input);
            });

            if (input.type === 'range') {
                input.addEventListener('input', () => {
                    const valueDisplay = input.parentElement.querySelector('.range-value');
                    if (valueDisplay) {
                        valueDisplay.textContent = input.value;
                    }
                    this.updateModuleSetting(moduleId, input.dataset.setting, input);
                });
            }
        });
    }

    updateModuleSetting(moduleId, settingKey, input) {
        const module = this.workflowModules.find(m => m.id === moduleId);
        if (!module) return;

        let value;

        if (input.type === 'checkbox') {
            if (input.closest('.multiselect')) {
                // Handle multiselect
                const multiselectInputs = input.closest('.multiselect').querySelectorAll(`[data-setting="${settingKey}"]`);
                value = Array.from(multiselectInputs)
                    .filter(inp => inp.checked)
                    .map(inp => inp.value);
            } else {
                // Handle single checkbox
                value = input.checked;
            }
        } else if (input.type === 'number' || input.type === 'range') {
            value = parseFloat(input.value);
        } else {
            value = input.value;
        }

        module.settings[settingKey] = value;

        // Update module status to indicate it has been modified
        if (module.status === 'completed') {
            module.status = 'configured';
            this.updateModuleStatus(moduleId, 'configured');
        }
    }

    updateModuleStatus(moduleId, status) {
        const module = this.workflowModules.find(m => m.id === moduleId);
        if (module) {
            module.status = status;

            const moduleElement = document.querySelector(`[data-module-id="${moduleId}"]`);
            const statusIndicator = moduleElement?.querySelector('.status-indicator');
            if (statusIndicator) {
                statusIndicator.className = `status-indicator ${status}`;
                statusIndicator.title = `Статус: ${this.getStatusLabel(status)}`;
            }
        }
    }

    removeModule(moduleId) {
        // Remove connections
        this.connections = this.connections.filter(conn => {
            if (conn.from === moduleId || conn.to === moduleId) {
                const line = document.querySelector(`[data-connection-id="${conn.id}"]`);
                line?.remove();
                return false;
            }
            return true;
        });

        // Remove module
        this.workflowModules = this.workflowModules.filter(m => m.id !== moduleId);

        const moduleElement = document.querySelector(`[data-module-id="${moduleId}"]`);
        moduleElement?.remove();

        if (this.selectedModuleId === moduleId) {
            this.selectedModuleId = null;
            this.showNoSelection();
        }

        this.updateStats();
        this.showCanvasPlaceholderIfEmpty();
        this.saveToHistory();

        this.showNotification('Модуль удален', 'info');
    }

    clearCanvas() {
        if (this.workflowModules.length === 0) {
            this.showNotification('Канвас уже пуст', 'info');
            return;
        }

        this.workflowModules = [];
        this.connections = [];
        this.selectedModuleId = null;

        document.querySelectorAll('.workflow-module').forEach(mod => mod.remove());
        document.getElementById('connections-svg').innerHTML = `
      <defs>
        <marker id="arrow" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto">
          <path d="M0,0 L10,5 L0,10 Z" fill="var(--color-teal-400)" />
        </marker>
      </defs>
    `;

        this.showNoSelection();
        this.updateStats();
        this.showCanvasPlaceholder();
        this.saveToHistory();

        this.showNotification('Канвас очищен', 'success');
    }

    autoLayout() {
        if (this.workflowModules.length === 0) {
            this.showNotification('Нет модулей для размещения', 'warning');
            return;
        }

        // Simple grid layout
        const cols = Math.ceil(Math.sqrt(this.workflowModules.length));
        const spacing = { x: 250, y: 150 };
        const startPos = { x: 100, y: 100 };

        this.workflowModules.forEach((module, index) => {
            const row = Math.floor(index / cols);
            const col = index % cols;

            const newPosition = {
                x: startPos.x + col * spacing.x,
                y: startPos.y + row * spacing.y
            };

            module.position = newPosition;

            const moduleElement = document.querySelector(`[data-module-id="${module.id}"]`);
            if (moduleElement) {
                moduleElement.style.left = newPosition.x + 'px';
                moduleElement.style.top = newPosition.y + 'px';
            }
        });

        this.updateConnections();
        this.saveToHistory();
        this.showNotification('Автоматическая компоновка применена', 'success');
    }

    fitToScreen() {
        if (this.workflowModules.length === 0) return;

        // Calculate bounding box
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

        this.workflowModules.forEach(module => {
            minX = Math.min(minX, module.position.x);
            minY = Math.min(minY, module.position.y);
            maxX = Math.max(maxX, module.position.x + 200); // Module width
            maxY = Math.max(maxY, module.position.y + 120); // Module height
        });

        const canvas = document.getElementById('workflow-canvas');
        const containerRect = canvas.getBoundingClientRect();

        const contentWidth = maxX - minX;
        const contentHeight = maxY - minY;

        const scaleX = (containerRect.width - 100) / contentWidth;
        const scaleY = (containerRect.height - 100) / contentHeight;

        this.zoomLevel = Math.min(scaleX, scaleY, 1);
        this.canvasOffset = {
            x: -minX * this.zoomLevel + 50,
            y: -minY * this.zoomLevel + 50
        };

        this.updateZoomDisplay();
        this.showNotification('Вид подогнан к экрану', 'success');
    }

    zoomIn() {
        this.zoomLevel = Math.min(this.zoomLevel * 1.1, 3);
        this.updateZoomDisplay();
    }

    zoomOut() {
        this.zoomLevel = Math.max(this.zoomLevel * 0.9, 0.1);
        this.updateZoomDisplay();
    }

    updateZoomDisplay() {
        const zoomDisplay = document.querySelector('.zoom-level');
        if (zoomDisplay) {
            zoomDisplay.textContent = Math.round(this.zoomLevel * 100) + '%';
        }
    }

    loadTemplate(templateId) {
        const template = this.WORKFLOW_TEMPLATES.find(t => t.id === templateId);
        if (!template) return;

        this.clearCanvas();

        // Add modules
        const moduleInstances = [];
        template.modules.forEach((moduleTemplate, index) => {
            const moduleData = this.findModuleDefinitionById(moduleTemplate.moduleId);
            if (moduleData) {
                const id = this.generateUUID();
                const module = {
                    id,
                    moduleId: moduleTemplate.moduleId,
                    name: moduleData.module.name,
                    description: moduleData.module.description,
                    icon: moduleData.module.icon,
                    color: moduleData.category.color,
                    category: moduleData.category.id,
                    position: moduleTemplate.position,
                    settings: this.getDefaultSettings(moduleData.module),
                    status: 'configured',
                    inputs: moduleData.module.inputs || [],
                    outputs: moduleData.module.outputs || []
                };

                this.workflowModules.push(module);
                this.renderWorkflowModule(module);
                moduleInstances.push(module);
            }
        });

        // Add connections
        template.connections.forEach(connTemplate => {
            const fromModule = moduleInstances[connTemplate.from];
            const toModule = moduleInstances[connTemplate.to];

            if (fromModule && toModule) {
                this.addConnection(fromModule.id, toModule.id);
            }
        });

        this.updateStats();
        this.hideCanvasPlaceholder();
        this.saveToHistory();

        this.showNotification(`Шаблон "${template.name}" загружен`, 'success');
    }

    executeWorkflow() {
        if (this.workflowModules.length === 0) {
            this.showNotification('Добавьте модули в workflow для выполнения', 'warning');
            return;
        }

        if (this.isExecuting) {
            this.showNotification('Workflow уже выполняется', 'info');
            return;
        }

        this.isExecuting = true;
        const executeBtn = document.getElementById('execute-workflow');
        const executionStatus = document.getElementById('execution-status');

        executeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Выполняется...</span>';
        executeBtn.disabled = true;

        executionStatus.innerHTML = '<i class="fas fa-play"></i> Выполнение workflow...';
        executionStatus.className = 'execution-status running';

        // Reset all modules to configured state
        this.workflowModules.forEach(module => {
            this.updateModuleStatus(module.id, 'configured');
        });

        // Simulate execution
        let currentIndex = 0;
        const executeNext = () => {
            if (currentIndex < this.workflowModules.length) {
                const module = this.workflowModules[currentIndex];

                // Update status to running
                this.updateModuleStatus(module.id, 'running');

                // Simulate processing time
                const processingTime = 1000 + Math.random() * 2000;

                setTimeout(() => {
                    // Random success/error for demonstration
                    const success = Math.random() > 0.1; // 90% success rate
                    const newStatus = success ? 'completed' : 'error';

                    this.updateModuleStatus(module.id, newStatus);

                    if (!success) {
                        this.showNotification(`Ошибка в модуле "${module.name}"`, 'error');
                    }

                    currentIndex++;
                    executeNext();
                }, processingTime);
            } else {
                // Execution complete
                this.isExecuting = false;
                executeBtn.innerHTML = '<i class="fas fa-play"></i> <span>Выполнить</span>';
                executeBtn.disabled = false;

                const completedModules = this.workflowModules.filter(m => m.status === 'completed').length;
                const errorModules = this.workflowModules.filter(m => m.status === 'error').length;

                if (errorModules > 0) {
                    executionStatus.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Завершено с ошибками (${completedModules}/${this.workflowModules.length})`;
                    executionStatus.className = 'execution-status error';
                    this.showNotification(`Workflow завершен с ошибками (${errorModules} модулей)`, 'warning');
                } else {
                    executionStatus.innerHTML = `<i class="fas fa-check"></i> Успешно завершено (${completedModules}/${this.workflowModules.length})`;
                    executionStatus.className = 'execution-status completed';
                    this.showNotification('Workflow выполнен успешно!', 'success');
                }

                // Clear status after 5 seconds
                setTimeout(() => {
                    executionStatus.innerHTML = '';
                    executionStatus.className = 'execution-status';
                }, 5000);
            }
        };

        executeNext();
    }

    exportWorkflow() {
        const workflow = {
            version: '4.0.0',
            timestamp: new Date().toISOString(),
            modules: this.workflowModules.map(m => ({
                id: m.id,
                moduleId: m.moduleId,
                name: m.name,
                position: m.position,
                settings: m.settings,
                status: m.status
            })),
            connections: this.connections,
            metadata: {
                totalModules: this.workflowModules.length,
                totalConnections: this.connections.length,
                categories: [...new Set(this.workflowModules.map(m => m.category))]
            }
        };

        const dataStr = JSON.stringify(workflow, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `ip-roast-workflow-${Date.now()}.json`;
        link.click();

        URL.revokeObjectURL(url);

        this.showNotification('Workflow экспортирован', 'success');
    }

    importWorkflow(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const workflow = JSON.parse(e.target.result);

                // Validate workflow format
                if (!workflow.modules || !Array.isArray(workflow.modules)) {
                    throw new Error('Неверный формат файла workflow');
                }

                this.clearCanvas();

                // Import modules
                workflow.modules.forEach(moduleData => {
                    const moduleDefinition = this.findModuleDefinitionById(moduleData.moduleId);
                    if (moduleDefinition) {
                        const module = {
                            id: moduleData.id || this.generateUUID(),
                            moduleId: moduleData.moduleId,
                            name: moduleData.name,
                            description: moduleDefinition.module.description,
                            icon: moduleDefinition.module.icon,
                            color: moduleDefinition.category.color,
                            category: moduleDefinition.category.id,
                            position: moduleData.position || { x: 100, y: 100 },
                            settings: { ...this.getDefaultSettings(moduleDefinition.module), ...moduleData.settings },
                            status: 'configured',
                            inputs: moduleDefinition.module.inputs || [],
                            outputs: moduleDefinition.module.outputs || []
                        };

                        this.workflowModules.push(module);
                        this.renderWorkflowModule(module);
                    }
                });

                // Import connections
                if (workflow.connections && Array.isArray(workflow.connections)) {
                    workflow.connections.forEach(connData => {
                        if (this.workflowModules.find(m => m.id === connData.from) &&
                            this.workflowModules.find(m => m.id === connData.to)) {
                            this.connections.push({
                                id: connData.id || this.generateUUID(),
                                from: connData.from,
                                to: connData.to
                            });
                            this.renderConnection(this.connections[this.connections.length - 1]);
                        }
                    });
                }

                this.updateStats();
                this.hideCanvasPlaceholder();
                this.saveToHistory();

                this.showNotification('Workflow импортирован успешно', 'success');

            } catch (error) {
                console.error('Ошибка импорта:', error);
                this.showNotification('Ошибка импорта файла', 'error');
            }
        };

        reader.readAsText(file);
    }

    saveToHistory() {
        const state = {
            modules: JSON.parse(JSON.stringify(this.workflowModules)),
            connections: JSON.parse(JSON.stringify(this.connections)),
            timestamp: Date.now()
        };

        // Remove future states if we're not at the end
        this.history = this.history.slice(0, this.historyIndex + 1);

        // Add new state
        this.history.push(state);

        // Limit history size
        if (this.history.length > 50) {
            this.history.shift();
        } else {
            this.historyIndex++;
        }

        this.updateUndoRedoButtons();
    }

    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.restoreState(this.history[this.historyIndex]);
            this.showNotification('Действие отменено', 'info');
        }
    }

    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.restoreState(this.history[this.historyIndex]);
            this.showNotification('Действие повторено', 'info');
        }
    }

    restoreState(state) {
        // Clear current state
        document.querySelectorAll('.workflow-module').forEach(el => el.remove());
        document.querySelectorAll('.connection-line').forEach(el => el.remove());

        // Restore modules
        this.workflowModules = JSON.parse(JSON.stringify(state.modules));
        this.workflowModules.forEach(module => {
            this.renderWorkflowModule(module);
        });

        // Restore connections
        this.connections = JSON.parse(JSON.stringify(state.connections));
        this.connections.forEach(connection => {
            this.renderConnection(connection);
        });

        this.updateStats();
        this.selectedModuleId = null;
        this.showNoSelection();

        if (this.workflowModules.length === 0) {
            this.showCanvasPlaceholder();
        } else {
            this.hideCanvasPlaceholder();
        }

        this.updateUndoRedoButtons();
    }

    updateUndoRedoButtons() {
        const undoBtn = document.getElementById('undo-btn');
        const redoBtn = document.getElementById('redo-btn');

        if (undoBtn) undoBtn.disabled = this.historyIndex <= 0;
        if (redoBtn) redoBtn.disabled = this.historyIndex >= this.history.length - 1;
    }

    toggleLibrary() {
        this.options.showLibrary = !this.options.showLibrary;
        const library = document.querySelector('.module-library');
        library.classList.toggle('hidden', !this.options.showLibrary);
    }

    toggleProperties() {
        this.options.showProperties = !this.options.showProperties;
        const panel = document.querySelector('.properties-panel');
        panel.classList.toggle('hidden', !this.options.showProperties);
    }

    filterModules() {
        const categories = document.getElementById('module-categories');
        categories.innerHTML = this.renderFilteredModuleCategories();
        this.setupDragAndDrop();
    }

    renderFilteredModuleCategories() {
        return this.MODULE_CATEGORIES.map(category => {
            const filteredModules = category.modules.filter(module => {
                const matchesSearch = this.searchQuery === '' ||
                    module.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                    module.description.toLowerCase().includes(this.searchQuery.toLowerCase());

                const matchesCategory = this.selectedCategory === 'all' || category.id === this.selectedCategory;

                return matchesSearch && matchesCategory;
            });

            if (filteredModules.length === 0) return '';

            return `
        <div class="module-category">
          <div class="category-header" style="border-left-color: ${category.color}">
            <span>${category.name}</span>
            <span class="module-count">(${filteredModules.length})</span>
          </div>
          <div class="module-list">
            ${filteredModules.map(module => `
              <div class="module-item" 
                   draggable="true" 
                   data-module-id="${module.id}"
                   data-category-id="${category.id}"
                   title="${module.description}">
                <div class="module-icon" style="color: ${category.color}">
                  <i class="${module.icon}"></i>
                </div>
                <div class="module-content">
                  <div class="module-name">${module.name}</div>
                  <div class="module-description">${module.description}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
        }).join('');
    }

    getDefaultSettings(moduleDefinition) {
        const settings = {};
        if (moduleDefinition.settings) {
            Object.entries(moduleDefinition.settings).forEach(([key, config]) => {
                if (config.default !== undefined) {
                    settings[key] = config.default;
                }
            });
        }
        return settings;
    }

    updateStats() {
        const moduleCountEl = document.getElementById('module-count');
        const connectionCountEl = document.getElementById('connection-count');

        if (moduleCountEl) moduleCountEl.textContent = this.workflowModules.length;
        if (connectionCountEl) connectionCountEl.textContent = this.connections.length;
    }

    hideCanvasPlaceholder() {
        const placeholder = document.getElementById('canvas-placeholder');
        if (placeholder) placeholder.style.display = 'none';
    }

    showCanvasPlaceholder() {
        const placeholder = document.getElementById('canvas-placeholder');
        if (placeholder) placeholder.style.display = 'block';
    }

    showCanvasPlaceholderIfEmpty() {
        if (this.workflowModules.length === 0) {
            this.showCanvasPlaceholder();
        }
    }

    showNoSelection() {
        const content = document.getElementById('properties-content');
        if (content) {
            content.innerHTML = `
        <div class="no-selection">
          <i class="fas fa-cog no-selection-icon"></i>
          <p>Выберите модуль для настройки</p>
          <div class="quick-tips">
            <h5>Быстрые советы:</h5>
            <ul>
              <li>Перетащите модули на канвас</li>
              <li>Соедините модули стрелками</li>
              <li>Настройте параметры каждого модуля</li>
              <li>Запустите workflow</li>
            </ul>
          </div>
        </div>
      `;
        }
    }

    showNotification(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
      <i class="fas ${this.getNotificationIcon(type)}"></i>
      <span>${message}</span>
      <button class="notification-close"><i class="fas fa-times"></i></button>
    `;

        document.body.appendChild(notification);

        // Auto remove
        setTimeout(() => {
            notification.remove();
        }, duration);

        // Manual close
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
    }

    getNotificationIcon(type) {
        switch (type) {
            case 'success': return 'fa-check-circle';
            case 'warning': return 'fa-exclamation-triangle';
            case 'error': return 'fa-times-circle';
            default: return 'fa-info-circle';
        }
    }

    loadDefaultTemplate() {
        // Load basic pentest template by default after a short delay
        setTimeout(() => {
            this.loadTemplate('basic_pentest');
        }, 1000);
    }

    // Public API methods
    getWorkflowData() {
        return {
            modules: this.workflowModules,
            connections: this.connections
        };
    }

    setWorkflowData(data) {
        this.clearCanvas();

        if (data.modules) {
            data.modules.forEach(moduleData => {
                const moduleDefinition = this.findModuleDefinitionById(moduleData.moduleId);
                if (moduleDefinition) {
                    this.addModuleToWorkflow(moduleDefinition.module, moduleData.position);
                }
            });
        }

        if (data.connections) {
            data.connections.forEach(connData => {
                this.addConnection(connData.from, connData.to);
            });
        }
    }

    destroy() {
        // Clean up event listeners
        document.removeEventListener('keydown', this.setupKeyboardShortcuts);
        this.container.innerHTML = '';
    }
}

// Export for global use
window.AttackModuleConstructor = AttackModuleConstructor;

// Global instance reference for inline event handlers
window.attackConstructor = null;
