// Интерфейсы для конструктора атак

export interface AttackVector {
    id: string;
    name: string;
    description: string;
    category: 'network' | 'web' | 'social' | 'physical' | 'wireless' | 'cloud' | 'iot' | 'mobile' | 'system';
    severity: 'low' | 'medium' | 'high' | 'critical';
    icon: string;
    estimatedTime: string;
    complexity: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    stealth: 'noisy' | 'moderate' | 'quiet' | 'silent';
    enabled: boolean;
    requiresCredentials?: boolean;
    prerequisites?: string[];
    payloads: string[];
    techniques: string[];
    mitreId?: string;
    references: string[];
}

export interface AttackTarget {
    id: string;
    type: 'single_host' | 'ip_range' | 'domain' | 'subnet' | 'url' | 'network_segment' | 'asset_group';
    value: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    notes?: string;
    ports?: number[];
    services?: string[];
    os?: string;
    vulnerabilities?: string[];
}

export interface AttackCredentials {
    username: string;
    password: string;
    domain: string;
    sshKey?: string;
    apiToken?: string;
    certificates?: string[];
    customHeaders: { [key: string]: string };
    authMethod: 'password' | 'key' | 'token' | 'certificate' | 'kerberos';
}

export interface AttackPayload {
    id: string;
    name: string;
    type: 'shell' | 'meterpreter' | 'beacon' | 'custom';
    platform: 'windows' | 'linux' | 'macos' | 'android' | 'ios' | 'web';
    encoder?: string;
    format: 'exe' | 'dll' | 'elf' | 'apk' | 'jar' | 'ps1' | 'py' | 'js';
    content: string;
    obfuscated: boolean;
}

export interface AttackConfiguration {
    id: string;
    name: string;
    description: string;
    category: string;
    objectives: string[];
    targets: AttackTarget[];
    vectors: string[];
    credentials: AttackCredentials;
    payloads: AttackPayload[];
    schedule: {
        type: 'immediate' | 'scheduled' | 'conditional';
        datetime?: string;
        conditions?: string[];
        timezone: string;
    };
    constraints: {
        timeLimit: number;
        stealthLevel: 'noisy' | 'moderate' | 'quiet' | 'silent';
        maxAttempts: number;
        avoidDetection: boolean;
        preserveEvidence: boolean;
        cleanupAfter: boolean;
    };
    notifications: {
        onStart: boolean;
        onSuccess: boolean;
        onFailure: boolean;
        onDetection: boolean;
        channels: string[];
        emailAddresses: string[];
        webhookUrl?: string;
    };
    tags: string[];
    createdBy: string;
    createdAt: string;
    lastModified: string;
}

export interface AttackTemplate {
    id: string;
    name: string;
    description: string;
    category: string;
    vectors: string[];
    defaultTargets: AttackTarget[];
    estimatedTime: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    tags: string[];
}

export interface AttackModule {
    id: string;
    name: string;
    description: string;
    category: string;
    type: 'exploit' | 'auxiliary' | 'payload' | 'encoder' | 'nop' | 'post';
    platform: string[];
    targets: string[];
    options: { [key: string]: any };
    references: string[];
    disclosure_date?: string;
    cvss_score?: number;
}

// Данные векторов атак
export const attackVectors: AttackVector[] = [
    // Сетевые атаки
    {
        id: 'port_scanning',
        name: 'Port Scanning & Service Discovery',
        description: 'Сканирование открытых портов и идентификация запущенных сервисов',
        category: 'network',
        severity: 'low',
        icon: 'Target',
        estimatedTime: '5-15 мин',
        complexity: 'beginner',
        stealth: 'moderate',
        enabled: false,
        payloads: ['nmap', 'masscan', 'rustscan', 'zmap'],
        techniques: ['T1046'],
        mitreId: 'T1046',
        references: [
            'https://attack.mitre.org/techniques/T1046/',
            'https://nmap.org/book/man.html'
        ]
    },
    {
        id: 'network_sniffing',
        name: 'Network Traffic Interception',
        description: 'Перехват и анализ сетевого трафика для получения чувствительной информации',
        category: 'network',
        severity: 'high',
        icon: 'Activity',
        estimatedTime: '30-120 мин',
        complexity: 'intermediate',
        stealth: 'quiet',
        enabled: false,
        payloads: ['wireshark', 'tcpdump', 'ettercap', 'bettercap'],
        techniques: ['T1040'],
        mitreId: 'T1040',
        references: [
            'https://attack.mitre.org/techniques/T1040/',
            'https://www.wireshark.org/docs/'
        ]
    },
    {
        id: 'arp_spoofing',
        name: 'ARP Spoofing Attack',
        description: 'Атака подмены ARP-таблиц для перехвата трафика в локальной сети',
        category: 'network',
        severity: 'high',
        icon: 'Network',
        estimatedTime: '10-30 мин',
        complexity: 'intermediate',
        stealth: 'moderate',
        enabled: false,
        payloads: ['arpspoof', 'bettercap', 'ettercap', 'driftnet'],
        techniques: ['T1557.002'],
        mitreId: 'T1557.002',
        references: [
            'https://attack.mitre.org/techniques/T1557/002/',
            'https://github.com/bettercap/bettercap'
        ]
    },
    {
        id: 'dns_poisoning',
        name: 'DNS Cache Poisoning',
        description: 'Подмена DNS-записей для перенаправления трафика',
        category: 'network',
        severity: 'high',
        icon: 'Globe',
        estimatedTime: '15-45 мин',
        complexity: 'advanced',
        stealth: 'quiet',
        enabled: false,
        payloads: ['dnsspoof', 'ettercap', 'bettercap'],
        techniques: ['T1584.001'],
        mitreId: 'T1584.001',
        references: [
            'https://attack.mitre.org/techniques/T1584/001/'
        ]
    },

    // Веб-атаки
    {
        id: 'sql_injection',
        name: 'SQL Injection Attack',
        description: 'Внедрение SQL-кода для компрометации базы данных',
        category: 'web',
        severity: 'critical',
        icon: 'Database',
        estimatedTime: '15-60 мин',
        complexity: 'intermediate',
        stealth: 'moderate',
        enabled: false,
        requiresCredentials: false,
        payloads: ['sqlmap', 'union_injection', 'blind_injection', 'time_based'],
        techniques: ['T1190'],
        mitreId: 'T1190',
        references: [
            'https://attack.mitre.org/techniques/T1190/',
            'https://owasp.org/www-project-top-ten/2017/A1_2017-Injection'
        ]
    },
    {
        id: 'xss_attack',
        name: 'Cross-Site Scripting (XSS)',
        description: 'Внедрение вредоносного JavaScript кода в веб-приложения',
        category: 'web',
        severity: 'high',
        icon: 'Code',
        estimatedTime: '10-45 мин',
        complexity: 'beginner',
        stealth: 'quiet',
        enabled: false,
        payloads: ['reflected_xss', 'stored_xss', 'dom_xss', 'blind_xss'],
        techniques: ['T1189'],
        mitreId: 'T1189',
        references: [
            'https://attack.mitre.org/techniques/T1189/',
            'https://owasp.org/www-project-top-ten/2017/A7_2017-Cross-Site_Scripting_(XSS)'
        ]
    },
    {
        id: 'csrf_attack',
        name: 'Cross-Site Request Forgery',
        description: 'Принуждение пользователя к выполнению нежелательных действий',
        category: 'web',
        severity: 'medium',
        icon: 'Shield',
        estimatedTime: '20-60 мин',
        complexity: 'intermediate',
        stealth: 'quiet',
        enabled: false,
        payloads: ['csrf_form', 'csrf_json', 'csrf_ajax'],
        techniques: ['T1189'],
        mitreId: 'T1189',
        references: [
            'https://owasp.org/www-community/attacks/csrf'
        ]
    },
    {
        id: 'directory_traversal',
        name: 'Directory Traversal Attack',
        description: 'Обход ограничений доступа к файловой системе',
        category: 'web',
        severity: 'high',
        icon: 'FileText',
        estimatedTime: '5-20 мин',
        complexity: 'beginner',
        stealth: 'quiet',
        enabled: false,
        payloads: ['path_traversal', 'null_byte_injection', 'url_encoding'],
        techniques: ['T1083'],
        mitreId: 'T1083',
        references: [
            'https://attack.mitre.org/techniques/T1083/',
            'https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/05-Authorization_Testing/01-Testing_Directory_Traversal_File_Include'
        ]
    },
    {
        id: 'file_upload_bypass',
        name: 'File Upload Vulnerability',
        description: 'Загрузка вредоносных файлов через уязвимости загрузки',
        category: 'web',
        severity: 'critical',
        icon: 'Upload',
        estimatedTime: '15-40 мин',
        complexity: 'intermediate',
        stealth: 'moderate',
        enabled: false,
        payloads: ['webshell', 'reverse_shell', 'polyglot_file'],
        techniques: ['T1190'],
        mitreId: 'T1190',
        references: [
            'https://owasp.org/www-community/vulnerabilities/Unrestricted_File_Upload'
        ]
    },

    // Беспроводные атаки
    {
        id: 'wifi_cracking',
        name: 'WiFi Password Cracking',
        description: 'Взлом паролей беспроводных сетей WPA/WPA2/WPA3',
        category: 'wireless',
        severity: 'high',
        icon: 'Wifi',
        estimatedTime: '30-300 мин',
        complexity: 'intermediate',
        stealth: 'moderate',
        enabled: false,
        payloads: ['wpa2_crack', 'wps_attack', 'evil_twin', 'pmkid_attack'],
        techniques: ['T1557'],
        mitreId: 'T1557',
        references: [
            'https://attack.mitre.org/techniques/T1557/',
            'https://hashcat.net/wiki/doku.php?id=cracking_wpawpa2'
        ]
    },
    {
        id: 'bluetooth_attack',
        name: 'Bluetooth Exploitation',
        description: 'Атаки на Bluetooth устройства и протоколы',
        category: 'wireless',
        severity: 'medium',
        icon: 'Radio',
        estimatedTime: '20-60 мин',
        complexity: 'advanced',
        stealth: 'quiet',
        enabled: false,
        payloads: ['bluejacking', 'bluesnarfing', 'bluebugging', 'btlejack'],
        techniques: ['T1011'],
        mitreId: 'T1011',
        references: [
            'https://attack.mitre.org/techniques/T1011/'
        ]
    },
    {
        id: 'rogue_ap',
        name: 'Rogue Access Point',
        description: 'Создание поддельной точки доступа для перехвата трафика',
        category: 'wireless',
        severity: 'high',
        icon: 'Router',
        estimatedTime: '15-45 мин',
        complexity: 'intermediate',
        stealth: 'moderate',
        enabled: false,
        payloads: ['hostapd', 'airbase-ng', 'wifipineapple'],
        techniques: ['T1557.002'],
        mitreId: 'T1557.002',
        references: [
            'https://attack.mitre.org/techniques/T1557/002/'
        ]
    },

    // Социальная инженерия
    {
        id: 'phishing_campaign',
        name: 'Email Phishing Campaign',
        description: 'Создание поддельных email-сообщений для кражи учетных данных',
        category: 'social',
        severity: 'high',
        icon: 'Mail',
        estimatedTime: '60-240 мин',
        complexity: 'intermediate',
        stealth: 'quiet',
        enabled: false,
        payloads: ['email_template', 'landing_page', 'credential_harvester'],
        techniques: ['T1566.001'],
        mitreId: 'T1566.001',
        references: [
            'https://attack.mitre.org/techniques/T1566/001/'
        ]
    },
    {
        id: 'spear_phishing',
        name: 'Spear Phishing Attack',
        description: 'Целенаправленные фишинговые атаки на конкретных лиц',
        category: 'social',
        severity: 'critical',
        icon: 'Target',
        estimatedTime: '120-480 мин',
        complexity: 'advanced',
        stealth: 'silent',
        enabled: false,
        payloads: ['personalized_email', 'malicious_attachment', 'social_profiling'],
        techniques: ['T1566.001'],
        mitreId: 'T1566.001',
        references: [
            'https://attack.mitre.org/techniques/T1566/001/'
        ]
    },
    {
        id: 'pretexting',
        name: 'Social Engineering Pretexting',
        description: 'Получение информации через обман и манипуляции',
        category: 'social',
        severity: 'medium',
        icon: 'Brain',
        estimatedTime: '30-120 мин',
        complexity: 'advanced',
        stealth: 'silent',
        enabled: false,
        payloads: ['phone_script', 'persona_profile', 'information_gathering'],
        techniques: ['T1598'],
        mitreId: 'T1598',
        references: [
            'https://attack.mitre.org/techniques/T1598/'
        ]
    },
    {
        id: 'baiting_attack',
        name: 'Physical Baiting',
        description: 'Размещение зараженных устройств для компрометации систем',
        category: 'physical',
        severity: 'high',
        icon: 'HardDrive',
        estimatedTime: '60-180 мин',
        complexity: 'intermediate',
        stealth: 'quiet',
        enabled: false,
        payloads: ['usb_dropper', 'malicious_cd', 'infected_device'],
        techniques: ['T1091'],
        mitreId: 'T1091',
        references: [
            'https://attack.mitre.org/techniques/T1091/'
        ]
    },

    // Облачные атаки
    {
        id: 'cloud_misconfiguration',
        name: 'Cloud Misconfiguration Exploit',
        description: 'Эксплуатация неправильных настроек облачных сервисов',
        category: 'cloud',
        severity: 'critical',
        icon: 'Cloud',
        estimatedTime: '20-90 мин',
        complexity: 'advanced',
        stealth: 'quiet',
        enabled: false,
        payloads: ['s3_bucket_enum', 'iam_escalation', 'metadata_extraction'],
        techniques: ['T1078.004'],
        mitreId: 'T1078.004',
        references: [
            'https://attack.mitre.org/techniques/T1078/004/'
        ]
    },
    {
        id: 'container_escape',
        name: 'Container Escape',
        description: 'Побег из контейнера для получения доступа к хост-системе',
        category: 'cloud',
        severity: 'critical',
        icon: 'Box',
        estimatedTime: '30-120 мин',
        complexity: 'expert',
        stealth: 'quiet',
        enabled: false,
        payloads: ['privileged_container', 'docker_socket', 'kernel_exploit'],
        techniques: ['T1611'],
        mitreId: 'T1611',
        references: [
            'https://attack.mitre.org/techniques/T1611/'
        ]
    },
    {
        id: 'serverless_attack',
        name: 'Serverless Function Exploit',
        description: 'Атаки на serverless функции и их окружение',
        category: 'cloud',
        severity: 'high',
        icon: 'Zap',
        estimatedTime: '45-150 мин',
        complexity: 'advanced',
        stealth: 'quiet',
        enabled: false,
        payloads: ['function_poisoning', 'cold_start_abuse', 'secret_extraction'],
        techniques: ['T1525'],
        mitreId: 'T1525',
        references: [
            'https://attack.mitre.org/techniques/T1525/'
        ]
    },

    // IoT атаки
    {
        id: 'iot_exploitation',
        name: 'IoT Device Exploitation',
        description: 'Компрометация устройств интернета вещей',
        category: 'iot',
        severity: 'high',
        icon: 'Cpu',
        estimatedTime: '45-180 мин',
        complexity: 'expert',
        stealth: 'quiet',
        enabled: false,
        payloads: ['firmware_analysis', 'protocol_fuzzing', 'default_credentials'],
        techniques: ['T1190'],
        mitreId: 'T1190',
        references: [
            'https://attack.mitre.org/techniques/T1190/'
        ]
    },
    {
        id: 'zigbee_attack',
        name: 'ZigBee Protocol Attack',
        description: 'Атаки на устройства использующие протокол ZigBee',
        category: 'iot',
        severity: 'medium',
        icon: 'Zap',
        estimatedTime: '60-240 мин',
        complexity: 'expert',
        stealth: 'silent',
        enabled: false,
        payloads: ['zigbee_sniffer', 'key_extraction', 'mesh_disruption'],
        techniques: ['T1557'],
        mitreId: 'T1557',
        references: [
            'https://research.nccgroup.com/2016/07/29/zigbee-exploited/'
        ]
    },

    // Мобильные атаки
    {
        id: 'mobile_app_attack',
        name: 'Mobile Application Security Test',
        description: 'Анализ и эксплуатация уязвимостей мобильных приложений',
        category: 'mobile',
        severity: 'high',
        icon: 'Smartphone',
        estimatedTime: '60-300 мин',
        complexity: 'advanced',
        stealth: 'silent',
        enabled: false,
        payloads: ['apk_analysis', 'runtime_manipulation', 'certificate_pinning'],
        techniques: ['T1475'],
        mitreId: 'T1475',
        references: [
            'https://attack.mitre.org/techniques/T1475/'
        ]
    },
    {
        id: 'sms_phishing',
        name: 'SMS Phishing (Smishing)',
        description: 'Фишинговые атаки через SMS сообщения',
        category: 'mobile',
        severity: 'medium',
        icon: 'MessageSquare',
        estimatedTime: '30-90 мин',
        complexity: 'beginner',
        stealth: 'quiet',
        enabled: false,
        payloads: ['sms_template', 'malicious_link', 'app_download'],
        techniques: ['T1566.003'],
        mitreId: 'T1566.003',
        references: [
            'https://attack.mitre.org/techniques/T1566/003/'
        ]
    },

    // Системные атаки
    {
        id: 'privilege_escalation',
        name: 'Privilege Escalation',
        description: 'Повышение привилегий в скомпрометированной системе',
        category: 'system',
        severity: 'critical',
        icon: 'ArrowUp',
        estimatedTime: '20-90 мин',
        complexity: 'advanced',
        stealth: 'moderate',
        enabled: false,
        requiresCredentials: true,
        payloads: ['kernel_exploit', 'dll_hijacking', 'service_abuse'],
        techniques: ['T1068', 'T1574'],
        mitreId: 'T1068',
        references: [
            'https://attack.mitre.org/techniques/T1068/',
            'https://attack.mitre.org/techniques/T1574/'
        ]
    },
    {
        id: 'lateral_movement',
        name: 'Lateral Movement',
        description: 'Перемещение по сети для расширения доступа',
        category: 'system',
        severity: 'high',
        icon: 'ArrowRight',
        estimatedTime: '30-180 мин',
        complexity: 'advanced',
        stealth: 'quiet',
        enabled: false,
        requiresCredentials: true,
        payloads: ['psexec', 'wmi', 'rdp', 'ssh_tunneling'],
        techniques: ['T1021'],
        mitreId: 'T1021',
        references: [
            'https://attack.mitre.org/techniques/T1021/'
        ]
    },
    {
        id: 'persistence_backdoor',
        name: 'Persistence & Backdoor',
        description: 'Установка механизмов постоянного доступа',
        category: 'system',
        severity: 'critical',
        icon: 'Lock',
        estimatedTime: '15-60 мин',
        complexity: 'intermediate',
        stealth: 'quiet',
        enabled: false,
        requiresCredentials: true,
        payloads: ['registry_persistence', 'scheduled_task', 'service_creation'],
        techniques: ['T1053', 'T1547'],
        mitreId: 'T1053',
        references: [
            'https://attack.mitre.org/techniques/T1053/',
            'https://attack.mitre.org/techniques/T1547/'
        ]
    }
];

// Шаблоны атак
export const attackTemplates: AttackTemplate[] = [
    {
        id: 'basic_pentest',
        name: 'Базовый пентест',
        description: 'Стандартный сценарий тестирования на проникновение для начинающих',
        category: 'reconnaissance',
        vectors: ['port_scanning', 'network_sniffing', 'sql_injection', 'xss_attack'],
        defaultTargets: [],
        estimatedTime: '2-4 часа',
        difficulty: 'beginner',
        tags: ['основы', 'обучение', 'веб-безопасность']
    },
    {
        id: 'advanced_apt_simulation',
        name: 'Симуляция APT атаки',
        description: 'Комплексная многоэтапная атака имитирующая действия APT группы',
        category: 'lateral_movement',
        vectors: ['spear_phishing', 'privilege_escalation', 'lateral_movement', 'persistence_backdoor'],
        defaultTargets: [],
        estimatedTime: '8-12 часов',
        difficulty: 'expert',
        tags: ['APT', 'многоэтапная', 'персистентность']
    },
    {
        id: 'web_app_audit',
        name: 'Аудит веб-приложения',
        description: 'Комплексная проверка безопасности веб-приложения',
        category: 'initial_access',
        vectors: ['sql_injection', 'xss_attack', 'csrf_attack', 'directory_traversal', 'file_upload_bypass'],
        defaultTargets: [],
        estimatedTime: '4-6 часов',
        difficulty: 'intermediate',
        tags: ['веб-приложения', 'OWASP', 'инъекции']
    },
    {
        id: 'wireless_assessment',
        name: 'Аудит беспроводной безопасности',
        description: 'Тестирование безопасности беспроводных сетей',
        category: 'initial_access',
        vectors: ['wifi_cracking', 'bluetooth_attack', 'rogue_ap'],
        defaultTargets: [],
        estimatedTime: '3-5 часов',
        difficulty: 'intermediate',
        tags: ['беспроводные сети', 'WiFi', 'Bluetooth']
    },
    {
        id: 'social_engineering_test',
        name: 'Тест социальной инженерии',
        description: 'Проверка устойчивости персонала к атакам социальной инженерии',
        category: 'initial_access',
        vectors: ['phishing_campaign', 'spear_phishing', 'pretexting', 'baiting_attack'],
        defaultTargets: [],
        estimatedTime: '1-3 дня',
        difficulty: 'advanced',
        tags: ['социальная инженерия', 'фишинг', 'осведомленность']
    },
    {
        id: 'cloud_security_test',
        name: 'Тест безопасности облака',
        description: 'Аудит безопасности облачной инфраструктуры',
        category: 'privilege_escalation',
        vectors: ['cloud_misconfiguration', 'container_escape', 'serverless_attack'],
        defaultTargets: [],
        estimatedTime: '4-8 часов',
        difficulty: 'advanced',
        tags: ['облако', 'контейнеры', 'serverless']
    },
    {
        id: 'iot_security_audit',
        name: 'Аудит IoT безопасности',
        description: 'Тестирование безопасности устройств интернета вещей',
        category: 'initial_access',
        vectors: ['iot_exploitation', 'zigbee_attack'],
        defaultTargets: [],
        estimatedTime: '6-10 часов',
        difficulty: 'expert',
        tags: ['IoT', 'встроенные системы', 'протоколы']
    },
    {
        id: 'mobile_security_test',
        name: 'Тест мобильной безопасности',
        description: 'Комплексная проверка безопасности мобильных приложений',
        category: 'initial_access',
        vectors: ['mobile_app_attack', 'sms_phishing'],
        defaultTargets: [],
        estimatedTime: '4-6 часов',
        difficulty: 'advanced',
        tags: ['мобильные приложения', 'Android', 'iOS']
    }
];

// Категории атак
export const attackCategories = [
    {
        id: 'reconnaissance',
        name: 'Разведка',
        description: 'Сбор информации о цели',
        icon: 'Search',
        color: 'bg-blue-100 text-blue-800',
        techniques: ['T1595', 'T1592', 'T1590']
    },
    {
        id: 'initial_access',
        name: 'Первоначальный доступ',
        description: 'Получение первоначального доступа к системе',
        icon: 'Key',
        color: 'bg-green-100 text-green-800',
        techniques: ['T1189', 'T1190', 'T1566']
    },
    {
        id: 'execution',
        name: 'Выполнение',
        description: 'Запуск вредоносного кода',
        icon: 'Play',
        color: 'bg-purple-100 text-purple-800',
        techniques: ['T1059', 'T1203', 'T1204']
    },
    {
        id: 'persistence',
        name: 'Закрепление',
        description: 'Поддержание присутствия в системе',
        icon: 'Anchor',
        color: 'bg-yellow-100 text-yellow-800',
        techniques: ['T1053', 'T1547', 'T1543']
    },
    {
        id: 'privilege_escalation',
        name: 'Повышение привилегий',
        description: 'Получение более высоких привилегий',
        icon: 'ArrowUp',
        color: 'bg-orange-100 text-orange-800',
        techniques: ['T1068', 'T1134', 'T1574']
    },
    {
        id: 'defense_evasion',
        name: 'Обход защиты',
        description: 'Избежание обнаружения',
        icon: 'EyeOff',
        color: 'bg-indigo-100 text-indigo-800',
        techniques: ['T1027', 'T1055', 'T1112']
    },
    {
        id: 'credential_access',
        name: 'Доступ к учетным данным',
        description: 'Кража имен пользователей и паролей',
        icon: 'CreditCard',
        color: 'bg-pink-100 text-pink-800',
        techniques: ['T1003', 'T1110', 'T1558']
    },
    {
        id: 'discovery',
        name: 'Обнаружение',
        description: 'Изучение окружения',
        icon: 'Compass',
        color: 'bg-teal-100 text-teal-800',
        techniques: ['T1083', 'T1057', 'T1018']
    },
    {
        id: 'lateral_movement',
        name: 'Латеральное движение',
        description: 'Перемещение по сети',
        icon: 'ArrowRight',
        color: 'bg-cyan-100 text-cyan-800',
        techniques: ['T1021', 'T1080', 'T1091']
    },
    {
        id: 'collection',
        name: 'Сбор',
        description: 'Сбор интересующих данных',
        icon: 'Package',
        color: 'bg-lime-100 text-lime-800',
        techniques: ['T1005', 'T1039', 'T1113']
    },
    {
        id: 'command_and_control',
        name: 'Командование и управление',
        description: 'Связь с контролируемыми системами',
        icon: 'Satellite',
        color: 'bg-emerald-100 text-emerald-800',
        techniques: ['T1071', 'T1090', 'T1095']
    },
    {
        id: 'exfiltration',
        name: 'Кража данных',
        description: 'Вынос данных из сети',
        icon: 'Download',
        color: 'bg-red-100 text-red-800',
        techniques: ['T1041', 'T1052', 'T1567']
    },
    {
        id: 'impact',
        name: 'Воздействие',
        description: 'Нарушение работы или уничтожение',
        icon: 'Zap',
        color: 'bg-gray-100 text-gray-800',
        techniques: ['T1485', 'T1486', 'T1499']
    }
];

// Платформы
export const platforms = [
    { id: 'windows', name: 'Windows', icon: 'Monitor' },
    { id: 'linux', name: 'Linux', icon: 'Terminal' },
    { id: 'macos', name: 'macOS', icon: 'Laptop' },
    { id: 'android', name: 'Android', icon: 'Smartphone' },
    { id: 'ios', name: 'iOS', icon: 'Smartphone' },
    { id: 'web', name: 'Web', icon: 'Globe' },
    { id: 'cloud', name: 'Cloud', icon: 'Cloud' },
    { id: 'network', name: 'Network', icon: 'Network' }
];

// Уровни сложности
export const complexityLevels = [
    { id: 'beginner', name: 'Начинающий', color: 'border-green-300 bg-green-50 text-green-800' },
    { id: 'intermediate', name: 'Средний', color: 'border-yellow-300 bg-yellow-50 text-yellow-800' },
    { id: 'advanced', name: 'Продвинутый', color: 'border-orange-300 bg-orange-50 text-orange-800' },
    { id: 'expert', name: 'Эксперт', color: 'border-red-300 bg-red-50 text-red-800' }
];

// Уровни скрытности
export const stealthLevels = [
    { id: 'silent', name: 'Бесшумно', color: 'border-blue-300 bg-blue-50 text-blue-800' },
    { id: 'quiet', name: 'Тихо', color: 'border-green-300 bg-green-50 text-green-800' },
    { id: 'moderate', name: 'Умеренно', color: 'border-yellow-300 bg-yellow-50 text-yellow-800' },
    { id: 'noisy', name: 'Шумно', color: 'border-red-300 bg-red-50 text-red-800' }
];

// Приоритеты
export const priorityLevels = [
    { id: 'low', name: 'Низкий', color: 'bg-green-600 text-white' },
    { id: 'medium', name: 'Средний', color: 'bg-yellow-500 text-black' },
    { id: 'high', name: 'Высокий', color: 'bg-orange-600 text-white' },
    { id: 'critical', name: 'Критический', color: 'bg-red-600 text-white' }
];

// Статистика
export const attackStatistics = {
    totalVectors: attackVectors.length,
    categories: attackCategories.length,
    templates: attackTemplates.length,
    byCategory: {
        network: attackVectors.filter(v => v.category === 'network').length,
        web: attackVectors.filter(v => v.category === 'web').length,
        social: attackVectors.filter(v => v.category === 'social').length,
        wireless: attackVectors.filter(v => v.category === 'wireless').length,
        cloud: attackVectors.filter(v => v.category === 'cloud').length,
        iot: attackVectors.filter(v => v.category === 'iot').length,
        mobile: attackVectors.filter(v => v.category === 'mobile').length,
        system: attackVectors.filter(v => v.category === 'system').length
    },
    bySeverity: {
        critical: attackVectors.filter(v => v.severity === 'critical').length,
        high: attackVectors.filter(v => v.severity === 'high').length,
        medium: attackVectors.filter(v => v.severity === 'medium').length,
        low: attackVectors.filter(v => v.severity === 'low').length
    },
    byComplexity: {
        expert: attackVectors.filter(v => v.complexity === 'expert').length,
        advanced: attackVectors.filter(v => v.complexity === 'advanced').length,
        intermediate: attackVectors.filter(v => v.complexity === 'intermediate').length,
        beginner: attackVectors.filter(v => v.complexity === 'beginner').length
    }
};

// Утилитарные функции
export const getVectorsByCategory = (category: string): AttackVector[] => {
    return attackVectors.filter(vector => vector.category === category);
};

export const getVectorById = (id: string): AttackVector | undefined => {
    return attackVectors.find(vector => vector.id === id);
};

export const getTemplateById = (id: string): AttackTemplate | undefined => {
    return attackTemplates.find(template => template.id === id);
};

export const calculateTotalTime = (vectorIds: string[]): string => {
    const vectors = vectorIds.map(id => getVectorById(id)).filter(Boolean) as AttackVector[];
    if (vectors.length === 0) return '0 мин';

    const totalMinutes = vectors.reduce((total, vector) => {
        const timeRange = vector.estimatedTime.split('-');
        const maxTime = parseInt(timeRange[timeRange.length - 1]);
        return total + maxTime;
    }, 0);

    if (totalMinutes >= 60) {
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return `${hours}ч ${minutes}мин`;
    }
    return `${totalMinutes} мин`;
};

export const calculateRiskLevel = (vectorIds: string[]): 'low' | 'medium' | 'high' | 'critical' => {
    const vectors = vectorIds.map(id => getVectorById(id)).filter(Boolean) as AttackVector[];
    if (vectors.length === 0) return 'low';

    const criticalCount = vectors.filter(v => v.severity === 'critical').length;
    const highCount = vectors.filter(v => v.severity === 'high').length;

    if (criticalCount > 0) return 'critical';
    if (highCount > 1) return 'high';
    if (highCount > 0) return 'medium';
    return 'low';
};

export const validateAttackConfiguration = (config: Partial<AttackConfiguration>): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!config.name?.trim()) {
        errors.push('Название атаки обязательно');
    }

    if (!config.category) {
        errors.push('Категория атаки обязательна');
    }

    if (!config.targets || config.targets.length === 0) {
        errors.push('Необходимо добавить хотя бы одну цель');
    }

    if (!config.vectors || config.vectors.length === 0) {
        errors.push('Необходимо выбрать хотя бы один вектор атаки');
    }

    if (config.schedule?.type === 'scheduled' && !config.schedule.datetime) {
        errors.push('Для запланированной атаки необходимо указать время');
    }

    return {
        valid: errors.length === 0,
        errors
    };
};

// Экспорт по умолчанию
export default {
    attackVectors,
    attackTemplates,
    attackCategories,
    platforms,
    complexityLevels,
    stealthLevels,
    priorityLevels,
    attackStatistics
};
