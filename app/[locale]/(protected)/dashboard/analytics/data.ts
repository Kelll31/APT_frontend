// app/[locale]/(protected)/dashboard/analytics/data.ts

// Основные интерфейсы для аналитики безопасности
export interface SecurityMetric {
    id: string;
    name: string;
    value: number;
    unit: string;
    trend: 'up' | 'down' | 'stable';
    trendPercentage: number;
    status: 'critical' | 'warning' | 'good' | 'neutral';
    category: 'vulnerabilities' | 'performance' | 'compliance' | 'incidents' | 'coverage';
    icon: string;
    target?: number;
    lastUpdated: string;
}

export interface VulnerabilityTrend {
    date: string;
    critical: number;
    high: number;
    medium: number;
    low: number;
    informational: number;
    total: number;
}

export interface ComplianceFramework {
    id: string;
    name: string;
    description: string;
    compliancePercentage: number;
    status: 'compliant' | 'non_compliant' | 'partial';
    totalControls: number;
    implementedControls: number;
    criticalGaps: number;
    lastAssessment: string;
    categories: {
        name: string;
        percentage: number;
        status: 'compliant' | 'non_compliant' | 'partial';
    }[];
}

export interface SecurityIncident {
    id: string;
    title: string;
    description: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    type: 'system_compromise' | 'malware' | 'phishing' | 'data_breach' | 'ddos' | 'insider_threat' | 'policy_violation';
    status: 'open' | 'investigating' | 'resolved' | 'closed';
    detectedAt: string;
    resolvedAt?: string;
    assignee: string;
    affectedSystems: string[];
    timeToDetection: number; // minutes
    timeToResolution?: number; // minutes
    impactScore: number;
    evidenceCount: number;
}

export interface AIPrediction {
    id: string;
    type: 'vulnerability_forecast' | 'threat_prediction' | 'incident_likelihood' | 'compliance_trend';
    prediction: {
        value: string;
        confidence: number;
        timeframe: string;
    };
    factors: {
        name: string;
        weight: number;
        impact: 'positive' | 'negative' | 'neutral';
    }[];
    recommendations: string[];
    modelVersion: string;
    accuracy: number;
    createdAt: string;
}

export interface GeographicalThreat {
    countryCode: string;
    country: string;
    threatLevel: 'critical' | 'high' | 'medium' | 'low';
    activeThreats: number;
    blockedAttempts: number;
    malwareSignatures: number;
    threatTypes: {
        type: string;
        count: number;
    }[];
    lastUpdated: string;
}

export interface IntegrationHealth {
    id: string;
    name: string;
    type: 'vulnerability_scanner' | 'siem' | 'endpoint_protection' | 'network_monitor' | 'threat_intelligence';
    status: 'healthy' | 'degraded' | 'down' | 'maintenance';
    uptime: number;
    responseTime: number;
    lastCheck: string;
    version: string;
    criticalErrors: number;
}

export interface AssetInventory {
    id: string;
    name: string;
    type: 'server' | 'workstation' | 'network_device' | 'mobile' | 'iot' | 'virtual';
    ipAddress: string;
    os: string;
    riskScore: number;
    vulnerabilityCount: {
        critical: number;
        high: number;
        medium: number;
        low: number;
        total: number;
    };
    lastScan: string;
    complianceStatus: 'compliant' | 'non_compliant' | 'unknown';
}

export interface UserActivityMetrics {
    id: string;
    period: string;
    activeUsers: number;
    failedLogins: number;
    suspiciousActivities: number;
    privilegedAccess: number;
    dataAccess: {
        sensitive: number;
        confidential: number;
        public: number;
    };
    anomalies: number;
}

// Данные для аналитического дашборда
export const analyticsData = {
    // Ключевые метрики безопасности
    securityMetrics: [
        {
            id: 'critical_vulns',
            name: 'Критические уязвимости',
            value: 12,
            unit: 'шт',
            trend: 'down' as const,
            trendPercentage: -8,
            status: 'critical' as const,
            category: 'vulnerabilities' as const,
            icon: 'AlertTriangle',
            target: 0,
            lastUpdated: '2025-08-16T14:24:00Z'
        },
        {
            id: 'high_vulns',
            name: 'Высокие уязвимости',
            value: 34,
            unit: 'шт',
            trend: 'down' as const,
            trendPercentage: -5,
            status: 'warning' as const,
            category: 'vulnerabilities' as const,
            icon: 'Shield',
            target: 20,
            lastUpdated: '2025-08-16T14:24:00Z'
        },
        {
            id: 'scans_completed',
            name: 'Завершенных сканирований',
            value: 1247,
            unit: 'шт',
            trend: 'up' as const,
            trendPercentage: 23,
            status: 'good' as const,
            category: 'performance' as const,
            icon: 'CheckCircle',
            target: 1200,
            lastUpdated: '2025-08-16T14:24:00Z'
        },
        {
            id: 'compliance_score',
            name: 'Соответствие стандартам',
            value: 87,
            unit: '%',
            trend: 'up' as const,
            trendPercentage: 3,
            status: 'good' as const,
            category: 'compliance' as const,
            icon: 'CheckCircle',
            target: 95,
            lastUpdated: '2025-08-16T14:24:00Z'
        },
        {
            id: 'active_incidents',
            name: 'Активные инциденты',
            value: 5,
            unit: 'шт',
            trend: 'stable' as const,
            trendPercentage: 0,
            status: 'warning' as const,
            category: 'incidents' as const,
            icon: 'AlertTriangle',
            target: 0,
            lastUpdated: '2025-08-16T14:24:00Z'
        },
        {
            id: 'coverage_score',
            name: 'Покрытие сканированием',
            value: 94,
            unit: '%',
            trend: 'up' as const,
            trendPercentage: 2,
            status: 'good' as const,
            category: 'coverage' as const,
            icon: 'Target',
            target: 100,
            lastUpdated: '2025-08-16T14:24:00Z'
        }
    ] as SecurityMetric[],

    // Тренды уязвимостей
    vulnerabilityTrends: [
        {
            date: '2025-08-09',
            critical: 15,
            high: 42,
            medium: 67,
            low: 89,
            informational: 123,
            total: 336
        },
        {
            date: '2025-08-10',
            critical: 13,
            high: 39,
            medium: 65,
            low: 91,
            informational: 125,
            total: 333
        },
        {
            date: '2025-08-11',
            critical: 14,
            high: 37,
            medium: 68,
            low: 88,
            informational: 127,
            total: 334
        },
        {
            date: '2025-08-12',
            critical: 12,
            high: 35,
            medium: 64,
            low: 92,
            informational: 129,
            total: 332
        },
        {
            date: '2025-08-13',
            critical: 11,
            high: 38,
            medium: 66,
            low: 90,
            informational: 131,
            total: 336
        },
        {
            date: '2025-08-14',
            critical: 13,
            high: 36,
            medium: 63,
            low: 94,
            informational: 133,
            total: 339
        },
        {
            date: '2025-08-15',
            critical: 12,
            high: 34,
            medium: 61,
            low: 96,
            informational: 135,
            total: 338
        }
    ] as VulnerabilityTrend[],

    // Фреймворки соответствия
    complianceFrameworks: [
        {
            id: 'iso_27001',
            name: 'ISO 27001',
            description: 'Международный стандарт по управлению информационной безопасностью',
            compliancePercentage: 89.5,
            status: 'partial' as const,
            totalControls: 114,
            implementedControls: 102,
            criticalGaps: 3,
            lastAssessment: '2025-08-10T09:00:00Z',
            categories: [
                { name: 'Политики безопасности', percentage: 95, status: 'compliant' as const },
                { name: 'Управление активами', percentage: 87, status: 'partial' as const },
                { name: 'Контроль доступа', percentage: 92, status: 'compliant' as const },
                { name: 'Криптография', percentage: 78, status: 'partial' as const }
            ]
        },
        {
            id: 'pci_dss',
            name: 'PCI DSS',
            description: 'Стандарт безопасности данных индустрии платежных карт',
            compliancePercentage: 94.2,
            status: 'compliant' as const,
            totalControls: 78,
            implementedControls: 74,
            criticalGaps: 1,
            lastAssessment: '2025-08-08T15:30:00Z',
            categories: [
                { name: 'Сетевая безопасность', percentage: 96, status: 'compliant' as const },
                { name: 'Защита данных', percentage: 93, status: 'compliant' as const },
                { name: 'Мониторинг', percentage: 92, status: 'compliant' as const }
            ]
        },
        {
            id: 'gdpr',
            name: 'GDPR',
            description: 'Общий регламент по защите данных ЕС',
            compliancePercentage: 82.1,
            status: 'partial' as const,
            totalControls: 47,
            implementedControls: 39,
            criticalGaps: 5,
            lastAssessment: '2025-08-12T11:15:00Z',
            categories: [
                { name: 'Согласие и права субъектов', percentage: 85, status: 'partial' as const },
                { name: 'Защита данных', percentage: 79, status: 'partial' as const },
                { name: 'Уведомление о нарушениях', percentage: 88, status: 'compliant' as const }
            ]
        }
    ] as ComplianceFramework[],

    // Инциденты безопасности
    securityIncidents: [
        {
            id: 'inc_001',
            title: 'Подозрительная сетевая активность',
            description: 'Обнаружены множественные попытки несанкционированного доступа к серверу БД',
            severity: 'high' as const,
            type: 'system_compromise' as const,
            status: 'investigating' as const,
            detectedAt: '2025-08-16T12:45:00Z',
            assignee: 'security@company.com',
            affectedSystems: ['db-prod-01', 'web-srv-02'],
            timeToDetection: 15,
            impactScore: 7.8,
            evidenceCount: 23
        },
        {
            id: 'inc_002',
            title: 'Обнаружена вредоносная программа',
            description: 'Антивирус обнаружил троян на рабочей станции пользователя',
            severity: 'medium' as const,
            type: 'malware' as const,
            status: 'resolved' as const,
            detectedAt: '2025-08-15T16:20:00Z',
            resolvedAt: '2025-08-15T18:30:00Z',
            assignee: 'soc@company.com',
            affectedSystems: ['ws-user-045'],
            timeToDetection: 8,
            timeToResolution: 130,
            impactScore: 4.2,
            evidenceCount: 12
        },
        {
            id: 'inc_003',
            title: 'Фишинговая атака на сотрудников',
            description: 'Массовая рассылка поддельных писем от имени IT-департамента',
            severity: 'critical' as const,
            type: 'phishing' as const,
            status: 'open' as const,
            detectedAt: '2025-08-16T09:15:00Z',
            assignee: 'incident@company.com',
            affectedSystems: ['email-srv', 'user-workstations'],
            timeToDetection: 45,
            impactScore: 8.9,
            evidenceCount: 34
        }
    ] as SecurityIncident[],

    // Прогнозы ИИ
    aiPredictions: [
        {
            id: 'pred_001',
            type: 'vulnerability_forecast' as const,
            prediction: {
                value: '18 новых уязвимостей',
                confidence: 87.5,
                timeframe: 'следующие 7 дней'
            },
            factors: [
                { name: 'Исторические данные', weight: 0.4, impact: 'negative' as const },
                { name: 'Активность патчей', weight: 0.3, impact: 'positive' as const },
                { name: 'Новые CVE', weight: 0.3, impact: 'negative' as const }
            ],
            recommendations: [
                'Ускорить развертывание критических патчей',
                'Увеличить частоту сканирования',
                'Усилить мониторинг новых CVE'
            ],
            modelVersion: 'v2.1.3',
            accuracy: 92.1,
            createdAt: '2025-08-16T14:00:00Z'
        },
        {
            id: 'pred_002',
            type: 'threat_prediction' as const,
            prediction: {
                value: '65% вероятность атаки',
                confidence: 73.2,
                timeframe: 'следующие 48 часов'
            },
            factors: [
                { name: 'Геополитическая обстановка', weight: 0.35, impact: 'negative' as const },
                { name: 'Активность в Dark Web', weight: 0.25, impact: 'negative' as const },
                { name: 'Уровень защиты', weight: 0.4, impact: 'positive' as const }
            ],
            recommendations: [
                'Повысить уровень мониторинга',
                'Активировать дополнительные средства защиты',
                'Уведомить команду реагирования'
            ],
            modelVersion: 'v1.8.2',
            accuracy: 78.9,
            createdAt: '2025-08-16T13:30:00Z'
        }
    ] as AIPrediction[],

    // Географическое распределение угроз
    geographicalThreats: [
        {
            countryCode: 'CN',
            country: 'Китай',
            threatLevel: 'critical' as const,
            activeThreats: 147,
            blockedAttempts: 15672,
            malwareSignatures: 892,
            threatTypes: [
                { type: 'APT', count: 23 },
                { type: 'Malware', count: 89 },
                { type: 'Botnet', count: 35 }
            ],
            lastUpdated: '2025-08-16T14:20:00Z'
        },
        {
            countryCode: 'RU',
            country: 'Россия',
            threatLevel: 'high' as const,
            activeThreats: 98,
            blockedAttempts: 12043,
            malwareSignatures: 634,
            threatTypes: [
                { type: 'Ransomware', count: 34 },
                { type: 'Phishing', count: 42 },
                { type: 'DDoS', count: 22 }
            ],
            lastUpdated: '2025-08-16T14:20:00Z'
        },
        {
            countryCode: 'US',
            country: 'США',
            threatLevel: 'medium' as const,
            activeThreats: 45,
            blockedAttempts: 7821,
            malwareSignatures: 267,
            threatTypes: [
                { type: 'Scanning', count: 28 },
                { type: 'Brute Force', count: 12 },
                { type: 'Web Attack', count: 5 }
            ],
            lastUpdated: '2025-08-16T14:20:00Z'
        }
    ] as GeographicalThreat[],

    // Состояние интеграций
    integrations: [
        {
            id: 'int_001',
            name: 'Nessus Scanner',
            type: 'vulnerability_scanner' as const,
            status: 'healthy' as const,
            uptime: 99.8,
            responseTime: 145,
            lastCheck: '2025-08-16T14:22:00Z',
            version: '10.6.2',
            criticalErrors: 0
        },
        {
            id: 'int_002',
            name: 'Splunk SIEM',
            type: 'siem' as const,
            status: 'healthy' as const,
            uptime: 99.95,
            responseTime: 89,
            lastCheck: '2025-08-16T14:22:00Z',
            version: '9.1.1',
            criticalErrors: 0
        },
        {
            id: 'int_003',
            name: 'CrowdStrike EDR',
            type: 'endpoint_protection' as const,
            status: 'degraded' as const,
            uptime: 97.2,
            responseTime: 267,
            lastCheck: '2025-08-16T14:22:00Z',
            version: '7.14.0',
            criticalErrors: 2
        },
        {
            id: 'int_004',
            name: 'Cisco Network Monitor',
            type: 'network_monitor' as const,
            status: 'healthy' as const,
            uptime: 99.1,
            responseTime: 334,
            lastCheck: '2025-08-16T14:22:00Z',
            version: '15.2.4',
            criticalErrors: 0
        }
    ] as IntegrationHealth[],

    // Критические активы
    criticalAssets: [
        {
            id: 'asset_001',
            name: 'Database Server Primary',
            type: 'server' as const,
            ipAddress: '192.168.1.10',
            os: 'Ubuntu 20.04 LTS',
            riskScore: 8.7,
            vulnerabilityCount: {
                critical: 2,
                high: 5,
                medium: 12,
                low: 8,
                total: 27
            },
            lastScan: '2025-08-15T22:00:00Z',
            complianceStatus: 'partial' as const
        },
        {
            id: 'asset_002',
            name: 'Web Server DMZ',
            type: 'server' as const,
            ipAddress: '203.0.113.15',
            os: 'CentOS 8',
            riskScore: 6.3,
            vulnerabilityCount: {
                critical: 1,
                high: 3,
                medium: 8,
                low: 15,
                total: 27
            },
            lastScan: '2025-08-16T02:30:00Z',
            complianceStatus: 'compliant' as const
        },
        {
            id: 'asset_003',
            name: 'Domain Controller',
            type: 'server' as const,
            ipAddress: '192.168.1.5',
            os: 'Windows Server 2019',
            riskScore: 9.1,
            vulnerabilityCount: {
                critical: 3,
                high: 7,
                medium: 15,
                low: 12,
                total: 37
            },
            lastScan: '2025-08-15T20:15:00Z',
            complianceStatus: 'non_compliant' as const
        }
    ] as AssetInventory[]
};

// Конфигурация дашборда
export const DASHBOARD_CONFIG = {
    refreshIntervals: {
        metrics: 30000, // 30 секунд
        charts: 60000,  // 1 минута
        incidents: 15000 // 15 секунд
    },
    thresholds: {
        critical: 90,
        high: 75,
        medium: 50,
        low: 25
    },
    colors: {
        critical: '#DC2626',
        high: '#EA580C',
        medium: '#D97706',
        low: '#16A34A',
        info: '#2563EB'
    }
};

// Вспомогательные функции
export const calculateTotalRisk = (): number => {
    const metrics = analyticsData.securityMetrics;
    const riskMetrics = metrics.filter(m =>
        m.category === 'vulnerabilities' || m.category === 'incidents'
    );

    if (riskMetrics.length === 0) return 0;

    return riskMetrics.reduce((sum, metric) => {
        let weight = 1;
        if (metric.status === 'critical') weight = 3;
        else if (metric.status === 'warning') weight = 2;

        return sum + (metric.value * weight);
    }, 0) / riskMetrics.length;
};

export const getSecurityTrend = (): 'improving' | 'declining' | 'stable' => {
    const trends = analyticsData.vulnerabilityTrends;
    if (trends.length < 2) return 'stable';

    const latest = trends[trends.length - 1];
    const previous = trends[trends.length - 2];

    const latestScore = latest.critical * 4 + latest.high * 3 + latest.medium * 2 + latest.low;
    const previousScore = previous.critical * 4 + previous.high * 3 + previous.medium * 2 + previous.low;

    if (latestScore < previousScore) return 'improving';
    if (latestScore > previousScore) return 'declining';
    return 'stable';
};

export const getComplianceOverall = (): number => {
    const frameworks = analyticsData.complianceFrameworks;
    if (frameworks.length === 0) return 0;

    return frameworks.reduce((sum, framework) =>
        sum + framework.compliancePercentage, 0
    ) / frameworks.length;
};

export const filterMetricsByCategory = (category: string): SecurityMetric[] => {
    return analyticsData.securityMetrics.filter(m => m.category === category);
};

export const getActiveIncidentsCount = (): number => {
    return analyticsData.securityIncidents.filter(i =>
        i.status === 'open' || i.status === 'investigating'
    ).length;
};

export const getCriticalIncidentsCount = (): number => {
    return analyticsData.securityIncidents.filter(i =>
        i.severity === 'critical' && (i.status === 'open' || i.status === 'investigating')
    ).length;
};

export const getPredictionsByType = (type: string): AIPrediction[] => {
    return analyticsData.aiPredictions.filter(p => p.type === type);
};

export const getAssetsByRiskLevel = (minRisk: number): AssetInventory[] => {
    return analyticsData.criticalAssets.filter(a => a.riskScore >= minRisk);
};

export const getIntegrationsByStatus = (status: string): IntegrationHealth[] => {
    return analyticsData.integrations.filter(i => i.status === status);
};

export default analyticsData;
