/**
 * IP Roast Enterprise - Attack Constructor Core Module v2.0
 * Конструктор модулей автоматизированного пентеста
 * Версия: 2.0.0-Pentest-Core
 * 
 * @description Центральный модуль для создания и управления сценариями пентеста
 * @author IP Roast Security Team
 * @requires Enhanced PageManager, SPA Architecture
 * @integrates canvas-manager, connection-manager, ui-manager
 */

console.log('🎯 Loading Attack Constructor Core v2.0.0-Pentest');

// =======================================================
// ОПРЕДЕЛЕНИЯ МОДУЛЕЙ АТАК
// =======================================================

/**
 * Библиотека модулей атак для автоматизированного пентеста
 */
const ATTACK_MODULES_LIBRARY = {
    // ========== РАЗВЕДКА (DISCOVERY) ==========
    'nmap-discovery': {
        id: 'nmap-discovery',
        name: 'Nmap Network Discovery',
        category: 'discovery',
        icon: '🔍',
        description: 'Сканирование сети для обнаружения активных хостов',
        difficulty: 'easy',
        estimated_time: '1-5 минут',
        parameters: {
            target_range: {
                type: 'string',
                label: 'Диапазон целей',
                placeholder: '192.168.1.0/24',
                required: true,
                validation: /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/
            },
            scan_type: {
                type: 'select',
                label: 'Тип сканирования',
                options: [
                    { value: 'ping', label: 'Ping Sweep (-sn)' },
                    { value: 'tcp_syn', label: 'TCP SYN (-sS)' },
                    { value: 'tcp_connect', label: 'TCP Connect (-sT)' },
                    { value: 'udp', label: 'UDP Scan (-sU)' }
                ],
                default: 'ping'
            },
            timing: {
                type: 'select',
                label: 'Скорость сканирования',
                options: [
                    { value: 'T0', label: 'Paranoid (T0)' },
                    { value: 'T1', label: 'Sneaky (T1)' },
                    { value: 'T2', label: 'Polite (T2)' },
                    { value: 'T3', label: 'Normal (T3)' },
                    { value: 'T4', label: 'Aggressive (T4)' }
                ],
                default: 'T3'
            },
            exclude_hosts: {
                type: 'string',
                label: 'Исключить хосты',
                placeholder: '192.168.1.1,192.168.1.254',
                required: false
            }
        },
        outputs: ['alive_hosts', 'network_topology', 'response_times'],
        requirements: ['network_access'],
        tags: ['nmap', 'discovery', 'scanning']
    },

    'port-scan': {
        id: 'port-scan',
        name: 'Port Scanning',
        category: 'discovery',
        icon: '🚪',
        description: 'Сканирование портов для выявления открытых сервисов',
        difficulty: 'easy',
        estimated_time: '2-10 минут',
        parameters: {
            targets: {
                type: 'string',
                label: 'Цели сканирования',
                placeholder: '192.168.1.1-254',
                required: true
            },
            port_range: {
                type: 'string',
                label: 'Диапазон портов',
                placeholder: '1-1000, 22,80,443,8080',
                default: '1-1000',
                required: true
            },
            scan_technique: {
                type: 'select',
                label: 'Техника сканирования',
                options: [
                    { value: 'syn', label: 'SYN Stealth' },
                    { value: 'connect', label: 'TCP Connect' },
                    { value: 'fin', label: 'FIN Scan' },
                    { value: 'null', label: 'NULL Scan' },
                    { value: 'xmas', label: 'XMAS Scan' }
                ],
                default: 'syn'
            },
            rate_limit: {
                type: 'number',
                label: 'Скорость (пакетов/сек)',
                min: 1,
                max: 10000,
                default: 1000
            }
        },
        outputs: ['open_ports', 'service_banners', 'os_fingerprint'],
        requirements: ['network_access'],
        tags: ['ports', 'services', 'scanning']
    },

    // ========== ПЕРЕЧИСЛЕНИЕ (ENUMERATION) ==========
    'ssh-enum': {
        id: 'ssh-enum',
        name: 'SSH Service Enumeration',
        category: 'enum',
        icon: '🔐',
        description: 'Перечисление SSH сервиса и сбор информации',
        difficulty: 'medium',
        estimated_time: '1-3 минуты',
        parameters: {
            target_host: {
                type: 'string',
                label: 'Целевой хост',
                placeholder: '192.168.1.100',
                required: true,
                validation: /^(\d{1,3}\.){3}\d{1,3}$/
            },
            port: {
                type: 'number',
                label: 'Порт SSH',
                min: 1,
                max: 65535,
                default: 22
            },
            timeout: {
                type: 'number',
                label: 'Timeout (сек)',
                min: 1,
                max: 60,
                default: 5
            },
            check_algorithms: {
                type: 'checkbox',
                label: 'Проверить алгоритмы шифрования',
                default: true
            },
            banner_grab: {
                type: 'checkbox',
                label: 'Захват баннера',
                default: true
            }
        },
        outputs: ['ssh_version', 'supported_algorithms', 'banner_info', 'auth_methods'],
        requirements: ['network_access'],
        tags: ['ssh', 'enumeration', 'banner']
    },

    'web-enum': {
        id: 'web-enum',
        name: 'Web Application Enumeration',
        category: 'enum',
        icon: '🌐',
        description: 'Перечисление веб-приложения и технологий',
        difficulty: 'medium',
        estimated_time: '3-10 минут',
        parameters: {
            target_url: {
                type: 'string',
                label: 'URL цели',
                placeholder: 'http://192.168.1.100',
                required: true,
                validation: /^https?:\/\/.+/
            },
            check_directories: {
                type: 'checkbox',
                label: 'Сканирование директорий',
                default: true
            },
            wordlist: {
                type: 'select',
                label: 'Словарь для брутфорса',
                options: [
                    { value: 'small', label: 'Малый (100 записей)' },
                    { value: 'medium', label: 'Средний (1000 записей)' },
                    { value: 'large', label: 'Большой (10000 записей)' }
                ],
                default: 'medium'
            },
            check_technologies: {
                type: 'checkbox',
                label: 'Определение технологий',
                default: true
            },
            follow_redirects: {
                type: 'checkbox',
                label: 'Следовать редиректам',
                default: true
            }
        },
        outputs: ['technologies', 'directories', 'files', 'headers', 'cookies'],
        requirements: ['network_access', 'http_client'],
        tags: ['web', 'http', 'enumeration']
    },

    // ========== BRUTEFORCE ==========
    'ssh-bruteforce': {
        id: 'ssh-bruteforce',
        name: 'SSH Bruteforce Attack',
        category: 'brute',
        icon: '🔨',
        description: 'Атака методом перебора SSH учетных данных',
        difficulty: 'medium',
        estimated_time: '5-30 минут',
        risk_level: 'medium',
        parameters: {
            target_host: {
                type: 'string',
                label: 'Целевой хост',
                placeholder: '192.168.1.100',
                required: true
            },
            port: {
                type: 'number',
                label: 'Порт SSH',
                default: 22,
                min: 1,
                max: 65535
            },
            username_list: {
                type: 'select',
                label: 'Список пользователей',
                options: [
                    { value: 'common', label: 'Общий список' },
                    { value: 'custom', label: 'Пользовательский' },
                    { value: 'single', label: 'Одиночный пользователь' }
                ],
                default: 'common'
            },
            username_custom: {
                type: 'textarea',
                label: 'Пользователи (по строке)',
                placeholder: 'admin\nroot\nuser',
                depends_on: { username_list: 'custom' }
            },
            single_username: {
                type: 'string',
                label: 'Имя пользователя',
                placeholder: 'admin',
                depends_on: { username_list: 'single' }
            },
            password_list: {
                type: 'select',
                label: 'Список паролей',
                options: [
                    { value: 'top100', label: 'Топ 100 паролей' },
                    { value: 'top1000', label: 'Топ 1000 паролей' },
                    { value: 'custom', label: 'Пользовательский' }
                ],
                default: 'top100'
            },
            password_custom: {
                type: 'textarea',
                label: 'Пароли (по строке)',
                placeholder: 'password\n123456\nadmin',
                depends_on: { password_list: 'custom' }
            },
            max_attempts: {
                type: 'number',
                label: 'Максимум попыток',
                min: 1,
                max: 10000,
                default: 100
            },
            delay: {
                type: 'number',
                label: 'Задержка (мс)',
                min: 0,
                max: 5000,
                default: 100
            },
            stop_on_success: {
                type: 'checkbox',
                label: 'Остановиться при успехе',
                default: true
            }
        },
        outputs: ['valid_credentials', 'failed_attempts', 'service_response'],
        requirements: ['network_access', 'legal_authorization'],
        warnings: ['Может заблокировать аккаунты', 'Генерирует много логов'],
        tags: ['ssh', 'bruteforce', 'credentials']
    },

    'ftp-bruteforce': {
        id: 'ftp-bruteforce',
        name: 'FTP Bruteforce Attack',
        category: 'brute',
        icon: '📁',
        description: 'Атака на FTP сервер методом перебора',
        difficulty: 'easy',
        estimated_time: '3-20 минут',
        risk_level: 'medium',
        parameters: {
            target_host: {
                type: 'string',
                label: 'Целевой хост',
                required: true
            },
            port: {
                type: 'number',
                label: 'Порт FTP',
                default: 21
            },
            username_list: {
                type: 'select',
                label: 'Пользователи',
                options: [
                    { value: 'common', label: 'Общий список' },
                    { value: 'single', label: 'Один пользователь' }
                ],
                default: 'common'
            },
            single_username: {
                type: 'string',
                label: 'Имя пользователя',
                placeholder: 'ftp',
                depends_on: { username_list: 'single' }
            },
            check_anonymous: {
                type: 'checkbox',
                label: 'Проверить anonymous доступ',
                default: true
            },
            password_list: {
                type: 'select',
                label: 'Словарь паролей',
                options: [
                    { value: 'common', label: 'Общие пароли' },
                    { value: 'empty', label: 'Пустые пароли' }
                ],
                default: 'common'
            },
            max_threads: {
                type: 'number',
                label: 'Потоков',
                min: 1,
                max: 50,
                default: 5
            }
        },
        outputs: ['ftp_credentials', 'anonymous_access', 'directory_listing'],
        requirements: ['network_access'],
        tags: ['ftp', 'bruteforce', 'anonymous']
    },

    // ========== ЭКСПЛУАТАЦИЯ (EXPLOITATION) ==========
    'default-credentials': {
        id: 'default-credentials',
        name: 'Default Credentials Check',
        category: 'exploit',
        icon: '🔑',
        description: 'Проверка стандартных учетных данных',
        difficulty: 'easy',
        estimated_time: '1-5 минут',
        risk_level: 'low',
        parameters: {
            target_host: {
                type: 'string',
                label: 'Целевой хост',
                required: true
            },
            services: {
                type: 'multiselect',
                label: 'Сервисы для проверки',
                options: [
                    { value: 'ssh', label: 'SSH (22)' },
                    { value: 'telnet', label: 'Telnet (23)' },
                    { value: 'ftp', label: 'FTP (21)' },
                    { value: 'http', label: 'HTTP (80)' },
                    { value: 'snmp', label: 'SNMP (161)' }
                ],
                default: ['ssh', 'http']
            },
            device_types: {
                type: 'multiselect',
                label: 'Типы устройств',
                options: [
                    { value: 'router', label: 'Маршрутизаторы' },
                    { value: 'switch', label: 'Коммутаторы' },
                    { value: 'camera', label: 'IP камеры' },
                    { value: 'printer', label: 'Принтеры' },
                    { value: 'iot', label: 'IoT устройства' }
                ],
                default: ['router', 'camera']
            },
            vendors: {
                type: 'multiselect',
                label: 'Производители',
                options: [
                    { value: 'cisco', label: 'Cisco' },
                    { value: 'dlink', label: 'D-Link' },
                    { value: 'tplink', label: 'TP-Link' },
                    { value: 'hikvision', label: 'Hikvision' },
                    { value: 'dahua', label: 'Dahua' }
                ],
                default: ['cisco', 'dlink']
            },
            quick_check: {
                type: 'checkbox',
                label: 'Быстрая проверка (топ 10)',
                default: false
            }
        },
        outputs: ['default_creds', 'vulnerable_services', 'device_fingerprint'],
        requirements: ['network_access'],
        tags: ['default', 'credentials', 'iot']
    },

    'iot-exploit': {
        id: 'iot-exploit',
        name: 'IoT Device Exploitation',
        category: 'exploit',
        icon: '📱',
        description: 'Эксплуатация уязвимостей IoT устройств',
        difficulty: 'hard',
        estimated_time: '5-15 минут',
        risk_level: 'high',
        parameters: {
            target_host: {
                type: 'string',
                label: 'Целевое устройство',
                required: true
            },
            device_type: {
                type: 'select',
                label: 'Тип устройства',
                options: [
                    { value: 'camera', label: 'IP Камера' },
                    { value: 'router', label: 'Маршрутизатор' },
                    { value: 'smart_tv', label: 'Smart TV' },
                    { value: 'printer', label: 'Принтер' },
                    { value: 'unknown', label: 'Неизвестно' }
                ],
                default: 'camera'
            },
            exploit_methods: {
                type: 'multiselect',
                label: 'Методы эксплуатации',
                options: [
                    { value: 'cve_check', label: 'Проверка CVE' },
                    { value: 'default_creds', label: 'Стандартные пароли' },
                    { value: 'firmware_bugs', label: 'Баги прошивки' },
                    { value: 'web_vulns', label: 'Веб уязвимости' }
                ],
                default: ['cve_check', 'default_creds']
            },
            payload_type: {
                type: 'select',
                label: 'Тип нагрузки',
                options: [
                    { value: 'info', label: 'Информационная' },
                    { value: 'shell', label: 'Reverse Shell' },
                    { value: 'download', label: 'Скачивание файлов' }
                ],
                default: 'info'
            },
            safe_mode: {
                type: 'checkbox',
                label: 'Безопасный режим',
                default: true,
                description: 'Только проверка, без активной эксплуатации'
            }
        },
        outputs: ['exploit_success', 'device_info', 'shell_access', 'files'],
        requirements: ['network_access', 'legal_authorization'],
        warnings: ['Может повредить устройство', 'Требует разрешения'],
        tags: ['iot', 'exploit', 'cve']
    },

    // ========== WEB АТАКИ ==========
    'web-sqli': {
        id: 'web-sqli',
        name: 'SQL Injection Testing',
        category: 'web',
        icon: '💉',
        description: 'Тестирование на SQL инъекции',
        difficulty: 'hard',
        estimated_time: '10-30 минут',
        risk_level: 'high',
        parameters: {
            target_url: {
                type: 'string',
                label: 'URL цели',
                placeholder: 'http://target.com/login.php',
                required: true
            },
            test_parameters: {
                type: 'multiselect',
                label: 'Тестируемые параметры',
                options: [
                    { value: 'get', label: 'GET параметры' },
                    { value: 'post', label: 'POST данные' },
                    { value: 'cookies', label: 'Cookies' },
                    { value: 'headers', label: 'HTTP заголовки' }
                ],
                default: ['get', 'post']
            },
            injection_types: {
                type: 'multiselect',
                label: 'Типы инъекций',
                options: [
                    { value: 'boolean', label: 'Boolean-based' },
                    { value: 'union', label: 'UNION-based' },
                    { value: 'time', label: 'Time-based' },
                    { value: 'error', label: 'Error-based' }
                ],
                default: ['boolean', 'union']
            },
            dbms_detect: {
                type: 'checkbox',
                label: 'Определение СУБД',
                default: true
            },
            risk_level: {
                type: 'select',
                label: 'Уровень риска',
                options: [
                    { value: 1, label: 'Низкий (только GET)' },
                    { value: 2, label: 'Средний (GET+POST)' },
                    { value: 3, label: 'Высокий (все методы)' }
                ],
                default: 1
            },
            custom_payloads: {
                type: 'textarea',
                label: 'Пользовательские payloads',
                placeholder: "' OR 1=1--\n' UNION SELECT null--"
            }
        },
        outputs: ['sqli_vulns', 'dbms_info', 'payloads_success', 'extracted_data'],
        requirements: ['network_access', 'legal_authorization'],
        warnings: ['Может повредить базу данных', 'Генерирует много запросов'],
        tags: ['web', 'sqli', 'database']
    },

    'web-xss': {
        id: 'web-xss',
        name: 'XSS Vulnerability Testing',
        category: 'web',
        icon: '🎭',
        description: 'Тестирование на Cross-Site Scripting',
        difficulty: 'medium',
        estimated_time: '5-15 минут',
        risk_level: 'medium',
        parameters: {
            target_url: {
                type: 'string',
                label: 'URL цели',
                required: true
            },
            xss_types: {
                type: 'multiselect',
                label: 'Типы XSS',
                options: [
                    { value: 'reflected', label: 'Reflected XSS' },
                    { value: 'stored', label: 'Stored XSS' },
                    { value: 'dom', label: 'DOM-based XSS' }
                ],
                default: ['reflected', 'stored']
            },
            test_vectors: {
                type: 'select',
                label: 'Набор векторов',
                options: [
                    { value: 'basic', label: 'Базовые (50 векторов)' },
                    { value: 'advanced', label: 'Продвинутые (200 векторов)' },
                    { value: 'custom', label: 'Пользовательские' }
                ],
                default: 'basic'
            },
            custom_vectors: {
                type: 'textarea',
                label: 'Пользовательские векторы',
                placeholder: '<script>alert("XSS")</script>',
                depends_on: { test_vectors: 'custom' }
            },
            form_testing: {
                type: 'checkbox',
                label: 'Тестирование форм',
                default: true
            },
            url_params: {
                type: 'checkbox',
                label: 'Тестирование URL параметров',
                default: true
            }
        },
        outputs: ['xss_vulns', 'vulnerable_params', 'successful_payloads'],
        requirements: ['network_access'],
        tags: ['web', 'xss', 'javascript']
    },

    // ========== POST-EXPLOITATION ==========
    'privilege-escalation': {
        id: 'privilege-escalation',
        name: 'Privilege Escalation Check',
        category: 'post',
        icon: '⬆️',
        description: 'Проверка возможностей повышения привилегий',
        difficulty: 'hard',
        estimated_time: '10-20 минут',
        risk_level: 'high',
        parameters: {
            target_system: {
                type: 'select',
                label: 'Целевая система',
                options: [
                    { value: 'linux', label: 'Linux' },
                    { value: 'windows', label: 'Windows' },
                    { value: 'auto', label: 'Автоопределение' }
                ],
                default: 'auto'
            },
            check_methods: {
                type: 'multiselect',
                label: 'Методы проверки',
                options: [
                    { value: 'sudo', label: 'Sudo права' },
                    { value: 'suid', label: 'SUID файлы' },
                    { value: 'cron', label: 'Cron задачи' },
                    { value: 'services', label: 'Уязвимые сервисы' },
                    { value: 'kernel', label: 'Kernel exploits' }
                ],
                default: ['sudo', 'suid', 'services']
            },
            deep_scan: {
                type: 'checkbox',
                label: 'Глубокое сканирование',
                default: false
            },
            exploit_suggestion: {
                type: 'checkbox',
                label: 'Предложить эксплойты',
                default: true
            }
        },
        outputs: ['escalation_paths', 'vulnerable_files', 'suggested_exploits'],
        requirements: ['system_access', 'legal_authorization'],
        warnings: ['Требует предварительный доступ к системе'],
        tags: ['privilege', 'escalation', 'post-exploit']
    },

    'data-collection': {
        id: 'data-collection',
        name: 'System Information Gathering',
        category: 'post',
        icon: '📊',
        description: 'Сбор информации о скомпрометированной системе',
        difficulty: 'medium',
        estimated_time: '3-10 минут',
        risk_level: 'low',
        parameters: {
            collection_scope: {
                type: 'multiselect',
                label: 'Область сбора',
                options: [
                    { value: 'system', label: 'Системная информация' },
                    { value: 'network', label: 'Сетевая конфигурация' },
                    { value: 'users', label: 'Пользователи и группы' },
                    { value: 'processes', label: 'Процессы' },
                    { value: 'files', label: 'Файловая система' }
                ],
                default: ['system', 'network', 'users']
            },
            sensitive_data: {
                type: 'checkbox',
                label: 'Поиск чувствительных данных',
                default: false
            },
            output_format: {
                type: 'select',
                label: 'Формат вывода',
                options: [
                    { value: 'json', label: 'JSON' },
                    { value: 'txt', label: 'Текст' },
                    { value: 'xml', label: 'XML' }
                ],
                default: 'json'
            }
        },
        outputs: ['system_info', 'network_config', 'user_accounts', 'installed_software'],
        requirements: ['system_access'],
        tags: ['information', 'gathering', 'enumeration']
    }
};

// =======================================================
// ОСНОВНОЙ КЛАСС ATTACK CONSTRUCTOR CORE
// =======================================================

/**
 * Основной класс конструктора модулей атак
 */
class AttackConstructorCore {
    constructor() {
        this.version = '2.0.0-Pentest-Core';
        this.buildDate = new Date().toISOString();
        this.isInitialized = false;

        // Состояние конструктора
        this.currentScenario = {
            id: null,
            name: 'Новый сценарий атаки',
            description: '',
            category: 'network',
            risk_level: 'medium',
            created: new Date().toISOString(),
            modules: [],
            connections: [],
            targets: {
                range: '',
                exclusions: [],
                credentials: {}
            },
            settings: {
                concurrency: 5,
                timeout: 30,
                safe_mode: true,
                auto_stop: true
            }
        };

        // Управление модулями атак
        this.attackModules = new Map();
        this.loadedModules = new Map();
        this.moduleCategories = new Map();

        // Canvas и соединения
        this.canvasNodes = new Map();
        this.connections = new Map();
        this.selectedNode = null;

        // Счетчики
        this.nextNodeId = 1;
        this.nextConnectionId = 1;

        // UI состояние
        this.currentTab = 'target';
        this.isExecuting = false;
        this.executionResults = new Map();

        // События
        this.eventHandlers = new Map();

        // Настройки
        this.settings = {
            canvas: {
                gridSize: 20,
                snapToGrid: true,
                autoLayout: false
            },
            execution: {
                maxConcurrency: 10,
                defaultTimeout: 30000,
                retryAttempts: 3
            },
            security: {
                requireConfirmation: true,
                logAllActions: true,
                safeMode: true
            }
        };

        console.log(`🎯 Attack Constructor Core v${this.version} инициализирован`);
    }

    /**
     * Инициализация Core модуля
     */
    async initialize() {
        if (this.isInitialized) {
            console.log('⚠️ Core уже инициализирован');
            return;
        }

        try {
            console.log('🚀 Инициализация Attack Constructor Core...');

            // Загружаем библиотеку модулей атак
            this.loadAttackModulesLibrary();

            // Настраиваем категории
            this.buildCategoryStructure();

            // Инициализируем системы
            this.initializeEventSystem();
            this.initializeValidation();
            this.setupSecurityPolicies();

            // Восстанавливаем состояние
            this.restoreState();

            this.isInitialized = true;
            console.log('✅ Attack Constructor Core инициализирован');

            this.emit('initialized', { version: this.version });

        } catch (error) {
            console.error('❌ Ошибка инициализации Core:', error);
            throw error;
        }
    }

    /**
     * Загрузка библиотеки модулей атак
     */
    loadAttackModulesLibrary() {
        console.log('📚 Загрузка библиотеки модулей атак...');

        Object.entries(ATTACK_MODULES_LIBRARY).forEach(([moduleId, module]) => {
            // Добавляем метаданные
            const enhancedModule = {
                ...module,
                instances: 0,
                lastUsed: null,
                enabled: true,
                loaded: new Date().toISOString()
            };

            this.attackModules.set(moduleId, enhancedModule);
        });

        console.log(`✅ Загружено ${this.attackModules.size} модулей атак`);
    }

    /**
     * Построение структуры категорий
     */
    buildCategoryStructure() {
        const categories = {
            'discovery': {
                name: 'Разведка',
                icon: '🔍',
                description: 'Обнаружение активных хостов и сервисов',
                color: '#2196F3',
                order: 1
            },
            'enum': {
                name: 'Перечисление',
                icon: '📋',
                description: 'Детальное исследование найденных сервисов',
                color: '#4CAF50',
                order: 2
            },
            'brute': {
                name: 'Bruteforce',
                icon: '🔨',
                description: 'Атаки методом перебора',
                color: '#FF9800',
                order: 3
            },
            'exploit': {
                name: 'Эксплуатация',
                icon: '💥',
                description: 'Эксплуатация найденных уязвимостей',
                color: '#F44336',
                order: 4
            },
            'web': {
                name: 'Веб-атаки',
                icon: '🌐',
                description: 'Атаки на веб-приложения',
                color: '#9C27B0',
                order: 5
            },
            'post': {
                name: 'Post-Exploitation',
                icon: '⚡',
                description: 'Действия после компрометации',
                color: '#607D8B',
                order: 6
            }
        };

        Object.entries(categories).forEach(([categoryId, category]) => {
            this.moduleCategories.set(categoryId, {
                ...category,
                modules: [],
                count: 0
            });
        });

        // Распределяем модули по категориям
        this.attackModules.forEach((module, moduleId) => {
            const category = this.moduleCategories.get(module.category);
            if (category) {
                category.modules.push(moduleId);
                category.count++;
            }
        });

        console.log(`📂 Создано ${this.moduleCategories.size} категорий модулей`);
    }

    /**
     * Инициализация системы событий
     */
    initializeEventSystem() {
        this.on = (event, handler) => {
            if (!this.eventHandlers.has(event)) {
                this.eventHandlers.set(event, []);
            }
            this.eventHandlers.get(event).push(handler);
        };

        this.emit = (event, data) => {
            if (this.eventHandlers.has(event)) {
                this.eventHandlers.get(event).forEach(handler => {
                    try {
                        handler(data);
                    } catch (error) {
                        console.error(`Ошибка в обработчике события ${event}:`, error);
                    }
                });
            }
        };

        console.log('📡 Система событий инициализирована');
    }

    /**
     * Инициализация валидации
     */
    initializeValidation() {
        this.validationRules = {
            scenario: {
                name: {
                    required: true,
                    minLength: 3,
                    maxLength: 100
                },
                modules: {
                    minCount: 1,
                    maxCount: 50
                }
            },
            module: {
                parameters: {
                    required: true,
                    validateType: true
                }
            },
            target: {
                range: {
                    required: true,
                    format: 'ip_range'
                }
            }
        };

        console.log('✅ Правила валидации установлены');
    }

    /**
     * Настройка политик безопасности
     */
    setupSecurityPolicies() {
        this.securityPolicies = {
            requireConfirmation: ['exploit', 'brute', 'post'],
            safeModeBlocked: ['privilege-escalation', 'data-exfiltration'],
            logRequired: ['all'],
            authRequired: ['exploit', 'post']
        };

        console.log('🔒 Политики безопасности настроены');
    }

    // =======================================================
    // УПРАВЛЕНИЕ МОДУЛЯМИ АТАК
    // =======================================================

    /**
     * Получение модуля атаки
     */
    getAttackModule(moduleId) {
        return this.attackModules.get(moduleId);
    }

    /**
     * Получение модулей по категории
     */
    getModulesByCategory(category) {
        return Array.from(this.attackModules.values())
            .filter(module => module.category === category);
    }

    /**
     * Поиск модулей
     */
    searchModules(query, filters = {}) {
        let results = Array.from(this.attackModules.values());

        // Поиск по тексту
        if (query) {
            const searchTerm = query.toLowerCase();
            results = results.filter(module =>
                module.name.toLowerCase().includes(searchTerm) ||
                module.description.toLowerCase().includes(searchTerm) ||
                module.tags.some(tag => tag.toLowerCase().includes(searchTerm))
            );
        }

        // Фильтры
        if (filters.category) {
            results = results.filter(module => module.category === filters.category);
        }

        if (filters.difficulty) {
            results = results.filter(module => module.difficulty === filters.difficulty);
        }

        if (filters.risk_level) {
            results = results.filter(module => module.risk_level === filters.risk_level);
        }

        return results;
    }

    /**
     * Добавление модуля на canvas
     */
    addModuleToCanvas(moduleId, x, y, parameters = {}) {
        const module = this.getAttackModule(moduleId);
        if (!module) {
            throw new Error(`Модуль ${moduleId} не найден`);
        }

        const nodeId = `node-${this.nextNodeId++}`;
        const node = {
            id: nodeId,
            moduleId,
            module,
            x: Math.round(x / this.settings.canvas.gridSize) * this.settings.canvas.gridSize,
            y: Math.round(y / this.settings.canvas.gridSize) * this.settings.canvas.gridSize,
            parameters: { ...this.getDefaultParameters(module), ...parameters },
            status: 'ready',
            results: null,
            created: new Date().toISOString()
        };

        this.canvasNodes.set(nodeId, node);

        // Добавляем в сценарий
        this.currentScenario.modules.push({
            nodeId,
            moduleId,
            parameters: node.parameters,
            position: { x: node.x, y: node.y }
        });

        // Обновляем статистику модуля
        module.instances++;
        module.lastUsed = new Date().toISOString();

        this.emit('moduleAdded', { nodeId, module, node });
        this.saveState();

        console.log(`📦 Модуль ${moduleId} добавлен на canvas: ${nodeId}`);
        return node;
    }

    /**
     * Получение параметров по умолчанию для модуля
     */
    getDefaultParameters(module) {
        const defaultParams = {};

        Object.entries(module.parameters || {}).forEach(([key, param]) => {
            if (param.default !== undefined) {
                defaultParams[key] = param.default;
            } else if (param.type === 'checkbox') {
                defaultParams[key] = false;
            } else if (param.type === 'multiselect') {
                defaultParams[key] = [];
            } else {
                defaultParams[key] = '';
            }
        });

        return defaultParams;
    }

    /**
     * Обновление параметров модуля
     */
    updateModuleParameters(nodeId, parameters) {
        const node = this.canvasNodes.get(nodeId);
        if (!node) {
            throw new Error(`Узел ${nodeId} не найден`);
        }

        // Валидация параметров
        const validation = this.validateModuleParameters(node.module, parameters);
        if (!validation.isValid) {
            throw new Error(`Ошибка валидации: ${validation.errors.join(', ')}`);
        }

        node.parameters = { ...node.parameters, ...parameters };
        node.status = 'configured';

        // Обновляем в сценарии
        const scenarioModule = this.currentScenario.modules.find(m => m.nodeId === nodeId);
        if (scenarioModule) {
            scenarioModule.parameters = node.parameters;
        }

        this.emit('moduleUpdated', { nodeId, parameters, node });
        this.saveState();

        return node;
    }

    /**
     * Валидация параметров модуля
     */
    validateModuleParameters(module, parameters) {
        const validation = {
            isValid: true,
            errors: [],
            warnings: []
        };

        Object.entries(module.parameters || {}).forEach(([key, param]) => {
            const value = parameters[key];

            // Проверка обязательных параметров
            if (param.required && (value === undefined || value === null || value === '')) {
                validation.errors.push(`Параметр "${param.label || key}" обязателен`);
                validation.isValid = false;
            }

            // Валидация регулярными выражениями
            if (value && param.validation && typeof param.validation === 'object' && param.validation.test) {
                if (!param.validation.test(value)) {
                    validation.errors.push(`Неверный формат параметра "${param.label || key}"`);
                    validation.isValid = false;
                }
            }

            // Валидация диапазонов
            if (param.type === 'number' && value !== undefined && value !== '') {
                const numValue = Number(value);
                if (isNaN(numValue)) {
                    validation.errors.push(`Параметр "${param.label || key}" должен быть числом`);
                    validation.isValid = false;
                } else {
                    if (param.min !== undefined && numValue < param.min) {
                        validation.errors.push(`Параметр "${param.label || key}" меньше минимального значения ${param.min}`);
                        validation.isValid = false;
                    }
                    if (param.max !== undefined && numValue > param.max) {
                        validation.errors.push(`Параметр "${param.label || key}" больше максимального значения ${param.max}`);
                        validation.isValid = false;
                    }
                }
            }
        });

        return validation;
    }

    /**
     * Удаление модуля с canvas
     */
    removeModuleFromCanvas(nodeId) {
        const node = this.canvasNodes.get(nodeId);
        if (!node) {
            return false;
        }

        // Удаляем связанные соединения
        const connectionsToRemove = Array.from(this.connections.values())
            .filter(conn => conn.from.nodeId === nodeId || conn.to.nodeId === nodeId);

        connectionsToRemove.forEach(conn => {
            this.removeConnection(conn.id);
        });

        // Удаляем узел
        this.canvasNodes.delete(nodeId);

        // Удаляем из сценария
        this.currentScenario.modules = this.currentScenario.modules
            .filter(m => m.nodeId !== nodeId);

        this.emit('moduleRemoved', { nodeId, node });
        this.saveState();

        console.log(`🗑️ Модуль удален: ${nodeId}`);
        return true;
    }

    // =======================================================
    // УПРАВЛЕНИЕ СОЕДИНЕНИЯМИ
    // =======================================================

    /**
     * Создание соединения между модулями
     */
    createConnection(fromNodeId, toNodeId, type = 'sequence') {
        const fromNode = this.canvasNodes.get(fromNodeId);
        const toNode = this.canvasNodes.get(toNodeId);

        if (!fromNode || !toNode) {
            throw new Error('Один из узлов не найден');
        }

        // Проверка на циклы
        if (this.wouldCreateCycle(fromNodeId, toNodeId)) {
            throw new Error('Соединение создаст циклическую зависимость');
        }

        const connectionId = `conn-${this.nextConnectionId++}`;
        const connection = {
            id: connectionId,
            from: { nodeId: fromNodeId },
            to: { nodeId: toNodeId },
            type, // 'sequence', 'parallel', 'conditional'
            condition: null,
            created: new Date().toISOString()
        };

        this.connections.set(connectionId, connection);

        // Добавляем в сценарий
        this.currentScenario.connections.push({
            id: connectionId,
            from: fromNodeId,
            to: toNodeId,
            type
        });

        this.emit('connectionCreated', { connectionId, connection });
        this.saveState();

        console.log(`🔗 Создано соединение: ${fromNodeId} -> ${toNodeId}`);
        return connection;
    }

    /**
     * Проверка на циклические зависимости
     */
    wouldCreateCycle(fromNodeId, toNodeId) {
        const visited = new Set();

        const hasPath = (startNode, targetNode) => {
            if (startNode === targetNode) return true;
            if (visited.has(startNode)) return false;

            visited.add(startNode);

            for (const connection of this.connections.values()) {
                if (connection.from.nodeId === startNode) {
                    if (hasPath(connection.to.nodeId, targetNode)) {
                        return true;
                    }
                }
            }

            return false;
        };

        return hasPath(toNodeId, fromNodeId);
    }

    /**
     * Удаление соединения
     */
    removeConnection(connectionId) {
        const connection = this.connections.get(connectionId);
        if (!connection) {
            return false;
        }

        this.connections.delete(connectionId);

        // Удаляем из сценария
        this.currentScenario.connections = this.currentScenario.connections
            .filter(c => c.id !== connectionId);

        this.emit('connectionRemoved', { connectionId, connection });
        this.saveState();

        return true;
    }

    // =======================================================
    // УПРАВЛЕНИЕ СЦЕНАРИЯМИ
    // =======================================================

    /**
     * Создание нового сценария
     */
    createNewScenario(name = 'Новый сценарий атаки') {
        // Сохраняем текущий сценарий если есть изменения
        this.saveState();

        // Очищаем canvas
        this.clearCanvas();

        // Создаем новый сценарий
        this.currentScenario = {
            id: `scenario-${Date.now()}`,
            name,
            description: '',
            category: 'network',
            risk_level: 'medium',
            created: new Date().toISOString(),
            modules: [],
            connections: [],
            targets: {
                range: '',
                exclusions: [],
                credentials: {}
            },
            settings: {
                concurrency: 5,
                timeout: 30,
                safe_mode: true,
                auto_stop: true
            }
        };

        this.emit('scenarioCreated', { scenario: this.currentScenario });
        console.log(`📋 Создан новый сценарий: ${name}`);
    }

    /**
     * Валидация сценария
     */
    validateScenario() {
        const validation = {
            isValid: true,
            errors: [],
            warnings: []
        };

        // Проверка базовых полей
        if (!this.currentScenario.name || this.currentScenario.name.trim().length < 3) {
            validation.errors.push('Имя сценария должно содержать минимум 3 символа');
            validation.isValid = false;
        }

        // Проверка модулей
        if (this.canvasNodes.size === 0) {
            validation.errors.push('Сценарий должен содержать хотя бы один модуль');
            validation.isValid = false;
        }

        // Проверка целей
        if (!this.currentScenario.targets.range) {
            validation.errors.push('Не указан диапазон целей');
            validation.isValid = false;
        }

        // Проверка параметров модулей
        for (const [nodeId, node] of this.canvasNodes) {
            const moduleValidation = this.validateModuleParameters(node.module, node.parameters);
            if (!moduleValidation.isValid) {
                validation.errors.push(`Модуль "${node.module.name}": ${moduleValidation.errors.join(', ')}`);
                validation.isValid = false;
            }
        }

        // Проверка безопасности
        const riskyModules = Array.from(this.canvasNodes.values())
            .filter(node => node.module.risk_level === 'high');

        if (riskyModules.length > 0 && !this.currentScenario.settings.safe_mode) {
            validation.warnings.push(`Сценарий содержит ${riskyModules.length} модулей высокого риска`);
        }

        // Проверка изолированных модулей
        const isolatedModules = this.findIsolatedModules();
        if (isolatedModules.length > 0 && this.canvasNodes.size > 1) {
            validation.warnings.push(`Найдено ${isolatedModules.length} изолированных модулей`);
        }

        return validation;
    }

    /**
     * Поиск изолированных модулей
     */
    findIsolatedModules() {
        const connectedNodes = new Set();

        this.connections.forEach(connection => {
            connectedNodes.add(connection.from.nodeId);
            connectedNodes.add(connection.to.nodeId);
        });

        return Array.from(this.canvasNodes.keys())
            .filter(nodeId => !connectedNodes.has(nodeId));
    }

    /**
     * Экспорт сценария
     */
    exportScenario(format = 'json') {
        const exportData = {
            version: this.version,
            exported: new Date().toISOString(),
            scenario: {
                ...this.currentScenario,
                modules: Array.from(this.canvasNodes.values()).map(node => ({
                    id: node.id,
                    moduleId: node.moduleId,
                    parameters: node.parameters,
                    position: { x: node.x, y: node.y }
                })),
                connections: Array.from(this.connections.values())
            }
        };

        switch (format) {
            case 'json':
                return JSON.stringify(exportData, null, 2);
            case 'yaml':
                // Простое YAML представление
                return this.convertToYaml(exportData);
            default:
                throw new Error(`Неподдерживаемый формат экспорта: ${format}`);
        }
    }

    /**
     * Импорт сценария
     */
    async importScenario(data, format = 'json') {
        try {
            let scenarioData;

            if (format === 'json') {
                scenarioData = typeof data === 'string' ? JSON.parse(data) : data;
            } else {
                throw new Error(`Неподдерживаемый формат импорта: ${format}`);
            }

            // Валидация импортируемых данных
            if (!scenarioData.scenario) {
                throw new Error('Неверный формат данных сценария');
            }

            // Очищаем canvas
            this.clearCanvas();

            // Загружаем сценарий
            this.currentScenario = { ...scenarioData.scenario };

            // Восстанавливаем модули
            if (scenarioData.scenario.modules) {
                for (const moduleData of scenarioData.scenario.modules) {
                    const module = this.getAttackModule(moduleData.moduleId);
                    if (module) {
                        const node = {
                            id: moduleData.id,
                            moduleId: moduleData.moduleId,
                            module,
                            x: moduleData.position.x,
                            y: moduleData.position.y,
                            parameters: moduleData.parameters,
                            status: 'ready',
                            results: null,
                            created: new Date().toISOString()
                        };
                        this.canvasNodes.set(moduleData.id, node);
                    }
                }
            }

            // Восстанавливаем соединения
            if (scenarioData.scenario.connections) {
                scenarioData.scenario.connections.forEach(connData => {
                    this.connections.set(connData.id, connData);
                });
            }

            this.emit('scenarioImported', { scenario: this.currentScenario });
            this.saveState();

            console.log('📥 Сценарий импортирован');
            return true;

        } catch (error) {
            console.error('❌ Ошибка импорта сценария:', error);
            throw error;
        }
    }

    // =======================================================
    // ВЫПОЛНЕНИЕ СЦЕНАРИЕВ
    // =======================================================

    /**
     * Запуск выполнения сценария
     */
    async executeScenario() {
        if (this.isExecuting) {
            throw new Error('Сценарий уже выполняется');
        }

        // Валидация перед запуском
        const validation = this.validateScenario();
        if (!validation.isValid) {
            throw new Error(`Ошибка валидации: ${validation.errors.join(', ')}`);
        }

        // Проверка подтверждения для опасных модулей
        if (this.requiresConfirmation()) {
            const confirmed = await this.requestExecutionConfirmation();
            if (!confirmed) {
                throw new Error('Выполнение отменено пользователем');
            }
        }

        console.log('🚀 Начало выполнения сценария:', this.currentScenario.name);
        this.isExecuting = true;

        try {
            // Построение плана выполнения
            const executionPlan = this.buildExecutionPlan();

            // Инициализация результатов
            this.executionResults.clear();

            // Эмитируем событие начала выполнения
            this.emit('executionStarted', {
                scenario: this.currentScenario,
                plan: executionPlan
            });

            // Выполняем план
            const results = await this.executeExecutionPlan(executionPlan);

            this.emit('executionCompleted', { results });
            console.log('✅ Сценарий выполнен успешно');

            return results;

        } catch (error) {
            console.error('❌ Ошибка выполнения сценария:', error);
            this.emit('executionFailed', { error });
            throw error;
        } finally {
            this.isExecuting = false;
        }
    }

    /**
     * Построение плана выполнения
     */
    buildExecutionPlan() {
        const plan = {
            stages: [],
            totalModules: this.canvasNodes.size,
            estimatedTime: 0
        };

        // Топологическая сортировка для определения порядка выполнения
        const sortedNodes = this.topologicalSort();

        // Группируем модули по стадиям выполнения
        let currentStage = [];
        let stageNumber = 1;

        sortedNodes.forEach(nodeId => {
            const node = this.canvasNodes.get(nodeId);

            // Проверяем зависимости
            const dependencies = this.getNodeDependencies(nodeId);
            const canExecuteNow = dependencies.every(depId =>
                plan.stages.some(stage =>
                    stage.modules.some(m => m.nodeId === depId)
                )
            );

            if (canExecuteNow || dependencies.length === 0) {
                currentStage.push({
                    nodeId,
                    module: node.module,
                    parameters: node.parameters,
                    estimatedTime: this.estimateModuleExecutionTime(node.module)
                });
            } else {
                // Начинаем новую стадию
                if (currentStage.length > 0) {
                    plan.stages.push({
                        stage: stageNumber++,
                        modules: [...currentStage],
                        parallel: currentStage.length > 1
                    });
                    currentStage = [];
                }

                currentStage.push({
                    nodeId,
                    module: node.module,
                    parameters: node.parameters,
                    estimatedTime: this.estimateModuleExecutionTime(node.module)
                });
            }
        });

        // Добавляем последнюю стадию
        if (currentStage.length > 0) {
            plan.stages.push({
                stage: stageNumber,
                modules: currentStage,
                parallel: currentStage.length > 1
            });
        }

        // Подсчитываем общее время
        plan.estimatedTime = plan.stages.reduce((total, stage) => {
            const stageTime = stage.parallel
                ? Math.max(...stage.modules.map(m => m.estimatedTime))
                : stage.modules.reduce((sum, m) => sum + m.estimatedTime, 0);
            return total + stageTime;
        }, 0);

        return plan;
    }

    /**
     * Топологическая сортировка узлов
     */
    topologicalSort() {
        const visited = new Set();
        const temp = new Set();
        const result = [];

        const visit = (nodeId) => {
            if (temp.has(nodeId)) {
                throw new Error('Обнаружена циклическая зависимость');
            }
            if (!visited.has(nodeId)) {
                temp.add(nodeId);

                // Обрабатываем зависимости
                this.getNodeDependencies(nodeId).forEach(depId => {
                    visit(depId);
                });

                temp.delete(nodeId);
                visited.add(nodeId);
                result.push(nodeId);
            }
        };

        // Обрабатываем все узлы
        this.canvasNodes.forEach((_, nodeId) => {
            if (!visited.has(nodeId)) {
                visit(nodeId);
            }
        });

        return result;
    }

    /**
     * Получение зависимостей узла
     */
    getNodeDependencies(nodeId) {
        return Array.from(this.connections.values())
            .filter(conn => conn.to.nodeId === nodeId)
            .map(conn => conn.from.nodeId);
    }

    /**
     * Оценка времени выполнения модуля
     */
    estimateModuleExecutionTime(module) {
        // Простая оценка на основе категории и сложности
        const baseTime = {
            'discovery': 60,    // 1 минута
            'enum': 120,        // 2 минуты
            'brute': 600,       // 10 минут
            'exploit': 300,     // 5 минут
            'web': 180,         // 3 минуты
            'post': 240         // 4 минуты
        };

        const complexityMultiplier = {
            'easy': 0.5,
            'medium': 1.0,
            'hard': 2.0
        };

        const base = baseTime[module.category] || 120;
        const multiplier = complexityMultiplier[module.difficulty] || 1.0;

        return Math.round(base * multiplier);
    }

    /**
     * Проверка необходимости подтверждения
     */
    requiresConfirmation() {
        return Array.from(this.canvasNodes.values()).some(node =>
            this.securityPolicies.requireConfirmation.includes(node.module.category) ||
            node.module.risk_level === 'high'
        );
    }

    /**
     * Запрос подтверждения выполнения
     */
    async requestExecutionConfirmation() {
        return new Promise((resolve) => {
            const riskyModules = Array.from(this.canvasNodes.values())
                .filter(node =>
                    this.securityPolicies.requireConfirmation.includes(node.module.category) ||
                    node.module.risk_level === 'high'
                );

            const message = `Сценарий содержит ${riskyModules.length} модулей высокого риска:\n\n` +
                riskyModules.map(node => `• ${node.module.name}`).join('\n') +
                '\n\nВы уверены, что хотите продолжить?';

            if (confirm(message)) {
                resolve(true);
            } else {
                resolve(false);
            }
        });
    }

    /**
     * Выполнение плана
     */
    async executeExecutionPlan(plan) {
        const results = {
            scenario: this.currentScenario.name,
            startTime: new Date().toISOString(),
            stages: [],
            totalModules: plan.totalModules,
            executedModules: 0,
            failedModules: 0,
            artifacts: new Map()
        };

        for (const stage of plan.stages) {
            console.log(`🏁 Выполнение стадии ${stage.stage} (${stage.modules.length} модулей)`);

            const stageResult = {
                stage: stage.stage,
                modules: [],
                parallel: stage.parallel,
                startTime: new Date().toISOString(),
                duration: 0
            };

            const stageStartTime = Date.now();

            if (stage.parallel) {
                // Параллельное выполнение
                const modulePromises = stage.modules.map(module =>
                    this.executeModule(module, results.artifacts)
                );

                const moduleResults = await Promise.allSettled(modulePromises);

                moduleResults.forEach((result, index) => {
                    const module = stage.modules[index];
                    if (result.status === 'fulfilled') {
                        stageResult.modules.push(result.value);
                        results.executedModules++;
                    } else {
                        stageResult.modules.push({
                            nodeId: module.nodeId,
                            status: 'failed',
                            error: result.reason?.message || 'Unknown error'
                        });
                        results.failedModules++;
                    }
                });
            } else {
                // Последовательное выполнение
                for (const module of stage.modules) {
                    try {
                        const moduleResult = await this.executeModule(module, results.artifacts);
                        stageResult.modules.push(moduleResult);
                        results.executedModules++;
                    } catch (error) {
                        stageResult.modules.push({
                            nodeId: module.nodeId,
                            status: 'failed',
                            error: error.message
                        });
                        results.failedModules++;

                        // Останавливаем выполнение при ошибке в последовательном режиме
                        if (this.currentScenario.settings.auto_stop) {
                            break;
                        }
                    }
                }
            }

            stageResult.endTime = new Date().toISOString();
            stageResult.duration = Date.now() - stageStartTime;
            results.stages.push(stageResult);

            // Эмитируем прогресс
            this.emit('executionProgress', {
                stage: stage.stage,
                completed: results.executedModules,
                total: results.totalModules,
                failed: results.failedModules
            });
        }

        results.endTime = new Date().toISOString();
        results.totalDuration = Date.now() - new Date(results.startTime).getTime();

        return results;
    }

    /**
     * Выполнение отдельного модуля (симуляция)
     */
    async executeModule(module, artifacts) {
        const startTime = Date.now();

        console.log(`⚡ Выполнение модуля: ${module.module.name}`);

        // Обновляем статус узла
        const node = this.canvasNodes.get(module.nodeId);
        if (node) {
            node.status = 'executing';
            this.emit('moduleStatusChanged', { nodeId: module.nodeId, status: 'executing' });
        }

        try {
            // Симуляция выполнения модуля
            const result = await this.simulateModuleExecution(module, artifacts);

            // Обновляем статус и результаты
            if (node) {
                node.status = result.success ? 'completed' : 'failed';
                node.results = result;
                this.emit('moduleStatusChanged', {
                    nodeId: module.nodeId,
                    status: node.status,
                    results: result
                });
            }

            // Сохраняем артефакты
            if (result.artifacts) {
                Object.entries(result.artifacts).forEach(([key, value]) => {
                    artifacts.set(`${module.nodeId}-${key}`, value);
                });
            }

            return {
                nodeId: module.nodeId,
                moduleName: module.module.name,
                status: result.success ? 'completed' : 'failed',
                duration: Date.now() - startTime,
                results: result,
                artifacts: Object.keys(result.artifacts || {})
            };

        } catch (error) {
            if (node) {
                node.status = 'failed';
                this.emit('moduleStatusChanged', { nodeId: module.nodeId, status: 'failed', error });
            }
            throw error;
        }
    }

    /**
     * Симуляция выполнения модуля
     */
    async simulateModuleExecution(module, artifacts) {
        // Искусственная задержка для симуляции
        const delay = Math.random() * 3000 + 1000; // 1-4 секунды
        await new Promise(resolve => setTimeout(resolve, delay));

        // Генерируем фиктивные результаты на основе типа модуля
        const result = {
            success: Math.random() > 0.1, // 90% успеха
            timestamp: new Date().toISOString(),
            module: module.module.name,
            parameters: module.parameters,
            artifacts: {}
        };

        // Генерируем артефакты на основе категории модуля
        switch (module.module.category) {
            case 'discovery':
                result.artifacts = {
                    discovered_hosts: this.generateDiscoveredHosts(),
                    network_info: this.generateNetworkInfo()
                };
                break;

            case 'enum':
                result.artifacts = {
                    service_info: this.generateServiceInfo(),
                    banners: this.generateBanners()
                };
                break;

            case 'brute':
                const credentialsFound = Math.random() > 0.7; // 30% шанс найти креды
                result.artifacts = {
                    credentials: credentialsFound ? this.generateCredentials() : [],
                    attempts: Math.floor(Math.random() * 100) + 10
                };
                break;

            case 'exploit':
                const exploitSuccess = Math.random() > 0.6; // 40% успех эксплуатации
                result.artifacts = {
                    exploit_success: exploitSuccess,
                    access_level: exploitSuccess ? 'user' : 'none',
                    vulnerabilities: this.generateVulnerabilities()
                };
                break;

            case 'web':
                result.artifacts = {
                    vulnerabilities: this.generateWebVulnerabilities(),
                    technologies: this.generateTechnologies()
                };
                break;

            case 'post':
                result.artifacts = {
                    system_info: this.generateSystemInfo(),
                    collected_data: this.generateCollectedData()
                };
                break;
        }

        return result;
    }

    // =======================================================
    // ГЕНЕРАТОРЫ ФИКТИВНЫХ ДАННЫХ
    // =======================================================

    generateDiscoveredHosts() {
        const hosts = [];
        const count = Math.floor(Math.random() * 10) + 1;

        for (let i = 0; i < count; i++) {
            hosts.push({
                ip: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
                status: 'up',
                response_time: Math.floor(Math.random() * 100) + 1,
                os_guess: ['Linux', 'Windows', 'Unknown'][Math.floor(Math.random() * 3)]
            });
        }

        return hosts;
    }

    generateNetworkInfo() {
        return {
            network_range: '192.168.1.0/24',
            gateway: '192.168.1.1',
            dns_servers: ['8.8.8.8', '1.1.1.1'],
            scan_time: new Date().toISOString()
        };
    }

    generateServiceInfo() {
        const services = ['ssh', 'http', 'https', 'ftp', 'telnet', 'smtp'];
        const ports = [22, 80, 443, 21, 23, 25];
        const result = [];

        const count = Math.floor(Math.random() * 5) + 1;
        for (let i = 0; i < count; i++) {
            const serviceIndex = Math.floor(Math.random() * services.length);
            result.push({
                service: services[serviceIndex],
                port: ports[serviceIndex],
                version: `${services[serviceIndex]} v${Math.floor(Math.random() * 5) + 1}.${Math.floor(Math.random() * 10)}`,
                state: 'open'
            });
        }

        return result;
    }

    generateBanners() {
        return [
            'SSH-2.0-OpenSSH_7.4',
            'HTTP/1.1 200 OK\nServer: Apache/2.4.41',
            '220 FTP server ready'
        ];
    }

    generateCredentials() {
        const usernames = ['admin', 'root', 'user', 'test'];
        const passwords = ['password', '123456', 'admin', 'qwerty'];

        return [{
            username: usernames[Math.floor(Math.random() * usernames.length)],
            password: passwords[Math.floor(Math.random() * passwords.length)],
            service: 'ssh',
            verified: true
        }];
    }

    generateVulnerabilities() {
        const vulns = [
            'CVE-2021-44228 (Log4Shell)',
            'CVE-2021-34527 (PrintNightmare)',
            'CVE-2020-1472 (Zerologon)'
        ];

        return [vulns[Math.floor(Math.random() * vulns.length)]];
    }

    generateWebVulnerabilities() {
        const webVulns = ['SQL Injection', 'XSS', 'CSRF', 'Directory Traversal'];
        return [webVulns[Math.floor(Math.random() * webVulns.length)]];
    }

    generateTechnologies() {
        return {
            server: 'Apache/2.4.41',
            language: 'PHP/7.4.3',
            framework: 'WordPress 5.8',
            database: 'MySQL'
        };
    }

    generateSystemInfo() {
        return {
            os: 'Ubuntu 20.04 LTS',
            kernel: '5.4.0-80-generic',
            architecture: 'x86_64',
            uptime: '15 days, 3 hours, 42 minutes'
        };
    }

    generateCollectedData() {
        return {
            users: ['root', 'admin', 'user1'],
            processes: 156,
            network_connections: 23,
            installed_packages: 1247
        };
    }

    // =======================================================
    // УТИЛИТАРНЫЕ МЕТОДЫ
    // =======================================================

    /**
     * Очистка canvas
     */
    clearCanvas() {
        this.canvasNodes.clear();
        this.connections.clear();
        this.selectedNode = null;

        this.currentScenario.modules = [];
        this.currentScenario.connections = [];

        this.emit('canvasCleared');
        console.log('🧹 Canvas очищен');
    }

    /**
     * Сохранение состояния
     */
    saveState() {
        try {
            const state = {
                version: this.version,
                timestamp: Date.now(),
                scenario: this.currentScenario,
                nodes: Array.from(this.canvasNodes.entries()),
                connections: Array.from(this.connections.entries()),
                settings: this.settings
            };

            localStorage.setItem('attack-constructor-state', JSON.stringify(state));
        } catch (error) {
            console.warn('⚠️ Не удалось сохранить состояние:', error);
        }
    }

    /**
     * Восстановление состояния
     */
    restoreState() {
        try {
            const savedState = localStorage.getItem('attack-constructor-state');
            if (!savedState) return;

            const state = JSON.parse(savedState);

            // Проверяем актуальность (не старше 24 часов)
            if (Date.now() - state.timestamp > 24 * 60 * 60 * 1000) {
                return;
            }

            // Восстанавливаем данные
            if (state.scenario) {
                this.currentScenario = state.scenario;
            }

            if (state.nodes) {
                this.canvasNodes = new Map(state.nodes);
            }

            if (state.connections) {
                this.connections = new Map(state.connections);
            }

            if (state.settings) {
                this.settings = { ...this.settings, ...state.settings };
            }

            console.log('🔄 Состояние восстановлено');
        } catch (error) {
            console.warn('⚠️ Не удалось восстановить состояние:', error);
        }
    }

    /**
     * Простое преобразование в YAML
     */
    convertToYaml(obj, indent = 0) {
        const spaces = '  '.repeat(indent);
        let yaml = '';

        for (const [key, value] of Object.entries(obj)) {
            if (value === null) {
                yaml += `${spaces}${key}: null\n`;
            } else if (typeof value === 'object' && !Array.isArray(value)) {
                yaml += `${spaces}${key}:\n`;
                yaml += this.convertToYaml(value, indent + 1);
            } else if (Array.isArray(value)) {
                yaml += `${spaces}${key}:\n`;
                value.forEach(item => {
                    if (typeof item === 'object') {
                        yaml += `${spaces}  -\n`;
                        yaml += this.convertToYaml(item, indent + 2);
                    } else {
                        yaml += `${spaces}  - ${item}\n`;
                    }
                });
            } else {
                yaml += `${spaces}${key}: ${value}\n`;
            }
        }

        return yaml;
    }

    /**
     * Получение отладочной информации
     */
    getDebugInfo() {
        return {
            version: this.version,
            isInitialized: this.isInitialized,
            isExecuting: this.isExecuting,
            canvasNodes: this.canvasNodes.size,
            connections: this.connections.size,
            currentScenario: this.currentScenario.name,
            attackModules: this.attackModules.size,
            categories: this.moduleCategories.size
        };
    }

    /**
     * Активация модуля
     */
    activate() {
        console.log('🟢 Attack Constructor Core активирован');
        this.emit('activated');
    }

    /**
     * Деактивация модуля
     */
    deactivate() {
        console.log('🟡 Attack Constructor Core деактивирован');
        this.emit('deactivated');
    }

    /**
     * Очистка ресурсов
     */
    cleanup() {
        console.log('🧹 Очистка Attack Constructor Core...');

        // Сохраняем состояние
        this.saveState();

        // Очищаем данные
        this.canvasNodes.clear();
        this.connections.clear();
        this.executionResults.clear();
        this.eventHandlers.clear();

        // Сбрасываем флаги
        this.isInitialized = false;
        this.isExecuting = false;

        console.log('✅ Attack Constructor Core очищен');
    }
}

// =======================================================
// ЭКСПОРТ И ГЛОБАЛЬНАЯ ИНТЕГРАЦИЯ
// =======================================================

// Создаем глобальный экземпляр
const signatureAnalysisConstructor = new AttackConstructorCore();

// Экспорт для ES6 модулей
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AttackConstructorCore,
        SignatureAnalysisConstructor: AttackConstructorCore,
        ATTACK_MODULES_LIBRARY
    };
}

// Глобальная доступность
if (typeof window !== 'undefined') {
    window.AttackConstructorCore = AttackConstructorCore;
    window.SignatureAnalysisConstructor = AttackConstructorCore;
    window.signatureConstructor = signatureAnalysisConstructor;

    // Для совместимости с attack-constructor-main.js
    window.attackConstructorCore = signatureAnalysisConstructor;
}

console.log('✅ Attack Constructor Core v2.0.0-Pentest loaded successfully');

/**
 * =======================================================
 * КОНЕЦ ФАЙЛА attack-constructor-core.js
 * 
 * IP Roast Enterprise - Attack Constructor Core Module v2.0
 * Центральный модуль конструктора модулей автоматизированного пентеста
 * Версия: 2.0.0-Pentest-Core
 * 
 * Ключевые возможности:
 * - Библиотека из 15+ модулей атак (разведка, эксплуатация, брутфорс)
 * - Визуальный конструктор сценариев с drag & drop
 * - Валидация и безопасное выполнение сценариев
 * - Система зависимостей и планирования выполнения
 * - Экспорт/импорт сценариев (JSON/YAML)
 * - Симуляция выполнения с реалистичными результатами
 * - Интеграция с SPA архитектурой IP_Roast
 * - Enterprise-уровень безопасности и надежности
 * =======================================================
 */
