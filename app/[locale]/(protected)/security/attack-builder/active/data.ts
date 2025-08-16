// ===== ИНТЕРФЕЙСЫ =====

export interface ActiveAttackLog {
    id: string;
    timestamp: string;
    level: 'info' | 'warning' | 'error' | 'success' | 'debug';
    message: string;
    details?: string;
    source?: string;
    category?: 'system' | 'attack' | 'network' | 'auth' | 'data';
}

export interface AttackStep {
    id: string;
    name: string;
    description: string;
    status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
    startTime?: string;
    endTime?: string;
    duration?: string;
    progress: number;
    results?: {
        success: boolean;
        data?: any;
        error?: string;
    };
}

export interface AttackTarget {
    id: string;
    type: 'web_application' | 'network_service' | 'database' | 'wireless' | 'social_engineering' | 'mobile' | 'cloud' | 'iot';
    address: string;
    port?: number;
    protocol?: string;
    description?: string;
    credentials?: {
        username?: string;
        password?: string;
        token?: string;
    };
}

export interface AttackResults {
    vulnerabilitiesFound: number;
    successfulExploits: number;
    failedAttempts: number;
    dataExtracted: string;
    compromisedSystems: number;
    accessLevel: 'none' | 'limited' | 'user' | 'admin' | 'root';
    persistenceAchieved: boolean;
    lateralMovement: boolean;
}

export interface AttackConfiguration {
    id: string;
    templateId: string;
    templateName: string;
    attackType: string;
    payload: string;
    executionMode: 'stealth' | 'aggressive' | 'balanced' | 'custom';
    timeouts: {
        step: number;
        total: number;
        retry: number;
    };
    options: {
        evasion: boolean;
        antiDetection: boolean;
        cleanup: boolean;
        logging: boolean;
    };
}

export interface ActiveAttack {
    id: string;
    name: string;
    description?: string;
    templateId: string;
    templateName: string;
    target: AttackTarget;
    status: 'queued' | 'initializing' | 'running' | 'paused' | 'stopping' | 'completed' | 'failed' | 'cancelled';
    priority: 'low' | 'medium' | 'high' | 'critical';
    startTime: string;
    estimatedEndTime: string;
    actualEndTime?: string;
    progress: number;
    currentStep: string;
    totalSteps: number;
    completedSteps: number;
    steps: AttackStep[];
    executor: string;
    results: AttackResults;
    logs: ActiveAttackLog[];
    configuration: AttackConfiguration;
    riskLevel: 'safe' | 'moderate' | 'aggressive' | 'destructive';
    duration: string;
    lastActivity: string;
    notifications: {
        email: boolean;
        webhook: boolean;
        realtime: boolean;
    };
    tags: string[];
    metadata: {
        createdAt: string;
        updatedAt: string;
        version: string;
        environment: 'development' | 'testing' | 'staging' | 'production';
    };
}

export interface AttackStatistics {
    total: number;
    running: number;
    paused: number;
    completed: number;
    failed: number;
    cancelled: number;
    queued: number;
    totalVulnerabilities: number;
    totalExploits: number;
    totalDataExtracted: string;
    averageDuration: string;
    successRate: number;
}

export interface AttackTemplate {
    id: string;
    name: string;
    description: string;
    category: 'web' | 'network' | 'wireless' | 'social' | 'physical' | 'cloud' | 'mobile';
    attackType: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    estimatedTime: string;
    steps: Omit<AttackStep, 'id' | 'status' | 'startTime' | 'endTime' | 'duration' | 'progress' | 'results'>[];
    requiredTools: string[];
    prerequisites: string[];
    riskLevel: 'safe' | 'moderate' | 'aggressive' | 'destructive';
    tags: string[];
}

// ===== ДАННЫЕ ШАГОВ АТАК =====

export const attackStepsData: { [key: string]: AttackStep[] } = {
    'attack-001': [
        {
            id: 'step-001-1',
            name: 'Reconnaissance',
            description: 'Сбор информации о цели',
            status: 'completed',
            startTime: '2025-08-16T14:30:00Z',
            endTime: '2025-08-16T14:45:00Z',
            duration: '15мин',
            progress: 100,
            results: {
                success: true,
                data: {
                    openPorts: [80, 443, 22, 3306],
                    services: ['nginx', 'mysql', 'ssh'],
                    technologies: ['PHP', 'MySQL', 'Linux']
                }
            }
        },
        {
            id: 'step-001-2',
            name: 'Vulnerability Scanning',
            description: 'Поиск уязвимостей в обнаруженных сервисах',
            status: 'completed',
            startTime: '2025-08-16T14:45:00Z',
            endTime: '2025-08-16T15:30:00Z',
            duration: '45мин',
            progress: 100,
            results: {
                success: true,
                data: {
                    vulnerabilities: ['SQL Injection', 'XSS', 'Weak Authentication'],
                    severity: ['Critical', 'High', 'Medium']
                }
            }
        },
        {
            id: 'step-001-3',
            name: 'SQL Injection Testing',
            description: 'Тестирование SQL инъекций',
            status: 'running',
            startTime: '2025-08-16T15:30:00Z',
            progress: 65,
            results: {
                success: true,
                data: {
                    injection_points: ['login form', 'search parameter'],
                    extracted_data: ['user credentials', 'database schema']
                }
            }
        },
        {
            id: 'step-001-4',
            name: 'Privilege Escalation',
            description: 'Попытка повышения привилегий',
            status: 'pending',
            progress: 0
        }
    ],
    'attack-002': [
        {
            id: 'step-002-1',
            name: 'Network Discovery',
            description: 'Сканирование сети и обнаружение хостов',
            status: 'completed',
            startTime: '2025-08-16T13:00:00Z',
            endTime: '2025-08-16T13:30:00Z',
            duration: '30мин',
            progress: 100,
            results: {
                success: true,
                data: {
                    alive_hosts: 45,
                    open_ports: 234,
                    services: ['SMB', 'RDP', 'HTTP', 'HTTPS', 'SSH']
                }
            }
        },
        {
            id: 'step-002-2',
            name: 'Service Exploitation',
            description: 'Эксплуатация уязвимых сервисов',
            status: 'running', // ИСПРАВЛЕНО: изменено с 'paused' на 'running'
            startTime: '2025-08-16T13:30:00Z',
            progress: 45,
            results: {
                success: true,
                data: {
                    compromised_hosts: ['172.16.1.15', '172.16.1.23'],
                    exploitation_method: 'MS17-010 EternalBlue'
                }
            }
        },
        {
            id: 'step-002-3',
            name: 'Post-Exploitation',
            description: 'Закрепление в системе и сбор данных',
            status: 'pending',
            progress: 0
        }
    ]
};

// ===== ОСНОВНЫЕ ДАННЫЕ АКТИВНЫХ АТАК =====

export const activeAttacksData: ActiveAttack[] = [
    {
        id: 'attack-001',
        name: 'SQL Injection Assessment - Production DB',
        description: 'Комплексная оценка безопасности производственной базы данных через веб-интерфейс',
        templateId: 'template-001',
        templateName: 'SQL Injection Assessment',
        target: {
            id: 'target-001',
            type: 'web_application',
            address: 'https://app.company.com',
            port: 443,
            protocol: 'HTTPS',
            description: 'Корпоративное веб-приложение'
        },
        status: 'running',
        priority: 'high',
        startTime: '2025-08-16T14:30:00Z',
        estimatedEndTime: '2025-08-16T18:30:00Z',
        progress: 65,
        currentStep: 'SQL Injection Testing',
        totalSteps: 4,
        completedSteps: 2,
        steps: attackStepsData['attack-001'],
        executor: 'security@company.com',
        results: {
            vulnerabilitiesFound: 3,
            successfulExploits: 1,
            failedAttempts: 5,
            dataExtracted: '2.3 MB',
            compromisedSystems: 1,
            accessLevel: 'user',
            persistenceAchieved: false,
            lateralMovement: false
        },
        configuration: {
            id: 'config-001',
            templateId: 'template-001',
            templateName: 'SQL Injection Assessment',
            attackType: 'sql_injection',
            payload: 'UNION SELECT injection',
            executionMode: 'balanced',
            timeouts: {
                step: 30,
                total: 240,
                retry: 3
            },
            options: {
                evasion: true,
                antiDetection: true,
                cleanup: true,
                logging: true
            }
        },
        riskLevel: 'moderate',
        duration: '2ч 15мин',
        lastActivity: '30 сек назад',
        notifications: {
            email: true,
            webhook: false,
            realtime: true
        },
        tags: ['sql-injection', 'web-app', 'database', 'critical'],
        metadata: {
            createdAt: '2025-08-16T14:30:00Z',
            updatedAt: '2025-08-16T16:45:00Z',
            version: '1.0',
            environment: 'production'
        },
        logs: [
            {
                id: 'log-001',
                timestamp: '2025-08-16T16:45:00Z',
                level: 'success',
                message: 'SQL инъекция обнаружена в параметре login',
                details: 'Parameter: username, Payload: \' OR 1=1--',
                source: 'sql_injection_module',
                category: 'attack'
            },
            {
                id: 'log-002',
                timestamp: '2025-08-16T16:43:00Z',
                level: 'info',
                message: 'Тестирование параметра password',
                details: 'Trying various injection payloads',
                source: 'sql_injection_module',
                category: 'attack'
            },
            {
                id: 'log-003',
                timestamp: '2025-08-16T16:40:00Z',
                level: 'warning',
                message: 'Rate limiting detected',
                details: 'Slowing down requests to avoid detection',
                source: 'rate_limiter',
                category: 'system'
            },
            {
                id: 'log-004',
                timestamp: '2025-08-16T16:35:00Z',
                level: 'debug',
                message: 'Payload crafted: admin\' OR 1=1--',
                details: 'Attempting bypass authentication',
                source: 'payload_generator',
                category: 'attack'
            }
        ]
    },
    {
        id: 'attack-002',
        name: 'Network Penetration - DMZ Infrastructure',
        description: 'Тестирование на проникновение в DMZ сегмент корпоративной сети',
        templateId: 'template-002',
        templateName: 'Network Penetration Testing',
        target: {
            id: 'target-002',
            type: 'network_service',
            address: '172.16.1.0/24',
            description: 'DMZ сегмент сети'
        },
        status: 'paused',
        priority: 'critical',
        startTime: '2025-08-16T13:00:00Z',
        estimatedEndTime: '2025-08-16T19:00:00Z',
        progress: 45,
        currentStep: 'Service Exploitation',
        totalSteps: 4,
        completedSteps: 1,
        steps: attackStepsData['attack-002'],
        executor: 'pentester@company.com',
        results: {
            vulnerabilitiesFound: 8,
            successfulExploits: 2,
            failedAttempts: 12,
            dataExtracted: '156 MB',
            compromisedSystems: 2,
            accessLevel: 'admin',
            persistenceAchieved: true,
            lateralMovement: true
        },
        configuration: {
            id: 'config-002',
            templateId: 'template-002',
            templateName: 'Network Penetration Testing',
            attackType: 'network_penetration',
            payload: 'EternalBlue exploit',
            executionMode: 'aggressive',
            timeouts: {
                step: 60,
                total: 360,
                retry: 2
            },
            options: {
                evasion: false,
                antiDetection: false,
                cleanup: false,
                logging: true
            }
        },
        riskLevel: 'aggressive',
        duration: '3ч 45мин',
        lastActivity: '15 мин назад',
        notifications: {
            email: true,
            webhook: true,
            realtime: true
        },
        tags: ['network', 'smb', 'lateral-movement', 'eternalblue'],
        metadata: {
            createdAt: '2025-08-16T13:00:00Z',
            updatedAt: '2025-08-16T16:30:00Z',
            version: '1.2',
            environment: 'production'
        },
        logs: [
            {
                id: 'log-005',
                timestamp: '2025-08-16T16:30:00Z',
                level: 'info',
                message: 'Атака приостановлена пользователем',
                details: 'Manual pause by pentester@company.com',
                source: 'system',
                category: 'system'
            },
            {
                id: 'log-006',
                timestamp: '2025-08-16T16:25:00Z',
                level: 'success',
                message: 'Получен shell на 172.16.1.15',
                details: 'Exploit: MS17-010 EternalBlue, Access: SYSTEM',
                source: 'exploit_module',
                category: 'attack'
            },
            {
                id: 'log-007',
                timestamp: '2025-08-16T16:20:00Z',
                level: 'success',
                message: 'SMB vulnerability confirmed',
                details: 'Host: 172.16.1.15, Vulnerability: MS17-010',
                source: 'vulnerability_scanner',
                category: 'attack'
            }
        ]
    },
    {
        id: 'attack-003',
        name: 'Cloud Security Assessment - AWS Infrastructure',
        description: 'Оценка безопасности облачной инфраструктуры AWS',
        templateId: 'template-005',
        templateName: 'Cloud Infrastructure Assessment',
        target: {
            id: 'target-003',
            type: 'cloud',
            address: 'AWS Account: 123456789012',
            description: 'Производственная среда AWS'
        },
        status: 'running',
        priority: 'medium',
        startTime: '2025-08-16T15:15:00Z',
        estimatedEndTime: '2025-08-16T19:15:00Z',
        progress: 25,
        currentStep: 'Misconfiguration Detection',
        totalSteps: 3,
        completedSteps: 0,
        steps: [
            {
                id: 'step-003-1',
                name: 'Misconfiguration Detection',
                description: 'Поиск неправильных конфигураций в AWS',
                status: 'running',
                startTime: '2025-08-16T15:15:00Z',
                progress: 25
            },
            {
                id: 'step-003-2',
                name: 'IAM Policy Analysis',
                description: 'Анализ политик доступа IAM',
                status: 'pending',
                progress: 0
            },
            {
                id: 'step-003-3',
                name: 'Data Exposure Check',
                description: 'Проверка на утечки данных',
                status: 'pending',
                progress: 0
            }
        ],
        executor: 'cloud@company.com',
        results: {
            vulnerabilitiesFound: 5,
            successfulExploits: 0,
            failedAttempts: 2,
            dataExtracted: '45 KB',
            compromisedSystems: 0,
            accessLevel: 'none',
            persistenceAchieved: false,
            lateralMovement: false
        },
        configuration: {
            id: 'config-003',
            templateId: 'template-005',
            templateName: 'Cloud Infrastructure Assessment',
            attackType: 'cloud_assessment',
            payload: 'AWS CLI enumeration',
            executionMode: 'stealth',
            timeouts: {
                step: 45,
                total: 240,
                retry: 1
            },
            options: {
                evasion: true,
                antiDetection: true,
                cleanup: true,
                logging: true
            }
        },
        riskLevel: 'safe',
        duration: '1ч 30мин',
        lastActivity: '2 мин назад',
        notifications: {
            email: false,
            webhook: true,
            realtime: false
        },
        tags: ['cloud', 'aws', 's3', 'iam', 'misconfiguration'],
        metadata: {
            createdAt: '2025-08-16T15:15:00Z',
            updatedAt: '2025-08-16T16:40:00Z',
            version: '1.0',
            environment: 'production'
        },
        logs: [
            {
                id: 'log-008',
                timestamp: '2025-08-16T16:40:00Z',
                level: 'warning',
                message: 'Обнаружена открытая S3 bucket',
                details: 'Bucket: company-backup-2024 (public read access)',
                source: 's3_scanner',
                category: 'attack'
            },
            {
                id: 'log-009',
                timestamp: '2025-08-16T16:35:00Z',
                level: 'info',
                message: 'Сканирование IAM политик',
                details: 'Found 45 users, 12 groups, 23 roles',
                source: 'iam_analyzer',
                category: 'attack'
            },
            {
                id: 'log-010',
                timestamp: '2025-08-16T16:30:00Z',
                level: 'debug',
                message: 'Подключение к AWS API',
                details: 'Region: us-east-1, Account: 123456789012',
                source: 'aws_connector',
                category: 'system'
            }
        ]
    }
];

// ===== ШАБЛОНЫ АТАК =====

export const attackTemplates: AttackTemplate[] = [
    {
        id: 'template-001',
        name: 'SQL Injection Assessment',
        description: 'Комплексная оценка уязвимостей SQL инъекций',
        category: 'web',
        attackType: 'sql_injection',
        difficulty: 'intermediate',
        estimatedTime: '2-4 часа',
        steps: [
            {
                name: 'Reconnaissance',
                description: 'Сбор информации о веб-приложении'
                // ИСПРАВЛЕНО: убрано progress: 0
            },
            {
                name: 'Parameter Discovery',
                description: 'Поиск параметров для тестирования'
                // ИСПРАВЛЕНО: убрано progress: 0
            },
            {
                name: 'SQL Injection Testing',
                description: 'Тестирование SQL инъекций'
                // ИСПРАВЛЕНО: убрано progress: 0
            },
            {
                name: 'Data Extraction',
                description: 'Извлечение данных из БД'
                // ИСПРАВЛЕНО: убрано progress: 0
            }
        ],
        requiredTools: ['SQLMap', 'Burp Suite', 'Custom Scripts'],
        prerequisites: ['Web Application Access', 'Target URL'],
        riskLevel: 'moderate',
        tags: ['sql', 'web', 'database', 'injection']
    },
    {
        id: 'template-002',
        name: 'Network Penetration Testing',
        description: 'Тестирование на проникновение в сетевую инфраструктуру',
        category: 'network',
        attackType: 'network_penetration',
        difficulty: 'advanced',
        estimatedTime: '4-8 часов',
        steps: [
            {
                name: 'Network Discovery',
                description: 'Обнаружение активных хостов'
                // ИСПРАВЛЕНО: убрано progress: 0
            },
            {
                name: 'Port Scanning',
                description: 'Сканирование портов и сервисов'
                // ИСПРАВЛЕНО: убрано progress: 0
            },
            {
                name: 'Vulnerability Assessment',
                description: 'Поиск уязвимостей'
                // ИСПРАВЛЕНО: убрано progress: 0
            },
            {
                name: 'Exploitation',
                description: 'Эксплуатация найденных уязвимостей'
                // ИСПРАВЛЕНО: убрано progress: 0
            }
        ],
        requiredTools: ['Nmap', 'Metasploit', 'Nessus', 'Custom Exploits'],
        prerequisites: ['Network Access', 'Target Range'],
        riskLevel: 'aggressive',
        tags: ['network', 'exploitation', 'lateral-movement']
    }
];

// ===== СТАТИСТИКА =====

export const attackStatistics: AttackStatistics = {
    total: activeAttacksData.length,
    running: activeAttacksData.filter(a => a.status === 'running').length,
    paused: activeAttacksData.filter(a => a.status === 'paused').length,
    completed: activeAttacksData.filter(a => a.status === 'completed').length,
    failed: activeAttacksData.filter(a => a.status === 'failed').length,
    cancelled: activeAttacksData.filter(a => a.status === 'cancelled').length,
    queued: activeAttacksData.filter(a => a.status === 'queued').length,
    totalVulnerabilities: activeAttacksData.reduce((sum, a) => sum + a.results.vulnerabilitiesFound, 0),
    totalExploits: activeAttacksData.reduce((sum, a) => sum + a.results.successfulExploits, 0),
    totalDataExtracted: activeAttacksData.reduce((sum, a) => {
        const value = parseFloat(a.results.dataExtracted.replace(/[^\d.]/g, ''));
        return sum + (isNaN(value) ? 0 : value);
    }, 0).toFixed(1) + ' MB',
    averageDuration: '2ч 30мин',
    successRate: 78.5
};

// ===== КОНСТАНТЫ =====

export const ATTACK_STATUS_COLORS = {
    queued: 'bg-gray-100 text-gray-800 border-gray-300',
    initializing: 'bg-blue-100 text-blue-800 border-blue-300',
    running: 'bg-green-100 text-green-800 border-green-300',
    paused: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    stopping: 'bg-orange-100 text-orange-800 border-orange-300',
    completed: 'bg-blue-100 text-blue-800 border-blue-300',
    failed: 'bg-red-100 text-red-800 border-red-300',
    cancelled: 'bg-gray-100 text-gray-800 border-gray-300'
} as const;

export const PRIORITY_COLORS = {
    low: 'bg-green-600 text-white',
    medium: 'bg-yellow-500 text-black',
    high: 'bg-orange-600 text-white',
    critical: 'bg-red-600 text-white'
} as const;

export const LOG_LEVEL_COLORS = {
    debug: 'text-gray-600',
    info: 'text-blue-600',
    warning: 'text-yellow-600',
    error: 'text-red-600',
    success: 'text-green-600'
} as const;

export const RISK_LEVEL_COLORS = {
    safe: 'border border-green-300 bg-green-50 text-green-800',
    moderate: 'border border-yellow-300 bg-yellow-50 text-yellow-800',
    aggressive: 'border border-orange-300 bg-orange-50 text-orange-800',
    destructive: 'border border-red-300 bg-red-50 text-red-800'
} as const;

// ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====

export const getAttackById = (id: string): ActiveAttack | undefined => {
    return activeAttacksData.find(attack => attack.id === id);
};

export const getAttacksByStatus = (status: ActiveAttack['status']): ActiveAttack[] => {
    return activeAttacksData.filter(attack => attack.status === status);
};

export const getAttacksByPriority = (priority: ActiveAttack['priority']): ActiveAttack[] => {
    return activeAttacksData.filter(attack => attack.priority === priority);
};

export const getAttacksByExecutor = (executor: string): ActiveAttack[] => {
    return activeAttacksData.filter(attack => attack.executor === executor);
};

export const getAttackProgress = (attack: ActiveAttack): number => {
    if (attack.totalSteps === 0) return 0;
    return Math.round((attack.completedSteps / attack.totalSteps) * 100);
};

export const formatDuration = (startTime: string, endTime?: string): string => {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const diffMs = end.getTime() - start.getTime();

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
        return `${hours}ч ${minutes}мин`;
    }
    return `${minutes}мин`;
};

export const getLastActivityText = (timestamp: string): string => {
    const now = new Date();
    const last = new Date(timestamp);
    const diffMs = now.getTime() - last.getTime();

    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}ч назад`;
    if (minutes > 0) return `${minutes} мин назад`;
    return `${seconds} сек назад`;
};

export const updateAttackProgress = (attackId: string, progress: number): void => {
    const attack = activeAttacksData.find(a => a.id === attackId);
    if (attack) {
        attack.progress = progress;
        attack.lastActivity = new Date().toISOString();
    }
};

export const addAttackLog = (attackId: string, log: Omit<ActiveAttackLog, 'id'>): void => {
    const attack = activeAttacksData.find(a => a.id === attackId);
    if (attack) {
        const newLog: ActiveAttackLog = {
            ...log,
            id: `log-${Date.now()}`
        };
        attack.logs.unshift(newLog);
        attack.lastActivity = new Date().toISOString();
    }
};

export const getAttackTemplateById = (id: string): AttackTemplate | undefined => {
    return attackTemplates.find(template => template.id === id);
};

export const getAvailableTargetTypes = (): string[] => {
    return ['web_application', 'network_service', 'database', 'wireless', 'social_engineering', 'mobile', 'cloud', 'iot'];
};

export const getAvailableAttackTypes = (): string[] => {
    // ИСПРАВЛЕНО: используем Array.from для совместимости с разными версиями TypeScript
    return Array.from(new Set(attackTemplates.map(template => template.attackType)));
};

// ===== ЭКСПОРТ ПО УМОЛЧАНИЮ =====

export default {
    activeAttacksData,
    attackTemplates,
    attackStatistics,
    ATTACK_STATUS_COLORS,
    PRIORITY_COLORS,
    LOG_LEVEL_COLORS,
    RISK_LEVEL_COLORS
};
