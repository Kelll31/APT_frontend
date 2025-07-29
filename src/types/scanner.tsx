/**
 * IP_Roast 4.0 Enterprise Scanner Types
 * Типы для модуля сканирования сети и безопасности
 */

// =============================================================================
// ОСНОВНЫЕ ТИПЫ СКАНИРОВАНИЯ
// =============================================================================

export interface ScanRequest {
    targets: string;
    scanType: 'quick' | 'comprehensive' | 'custom' | 'stealth' | 'udp' | 'ping' | 'tcp-connect' | 'syn' | 'ack' | 'fin' | 'null' | 'xmas';
    ports?: string;
    timing: 'paranoid' | 'sneaky' | 'polite' | 'normal' | 'aggressive' | 'insane';
    aggressive?: boolean;
    osDetection?: boolean;
    serviceDetection?: boolean;
    versionDetection?: boolean;
    scripts?: boolean;
    scriptArgs?: Record<string, string>;
    excludeHosts?: string[];
    includeHosts?: string[];
    outputFormat?: 'normal' | 'xml' | 'json' | 'grepable';
    randomizeHosts?: boolean;
    fragmentPackets?: boolean;
    spoofMac?: string;
    spoofSource?: string;
    decoys?: string[];
    sourcePort?: number;
    dataLength?: number;
    ttl?: number;
    mtu?: number;
    scanDelay?: number;
    maxRetries?: number;
    hostTimeout?: number;
    scanFlags?: string;
    scanTechniques?: string[];
    interface?: string;
    privileged?: boolean;
    resume?: string;
    appendOutput?: boolean;
    reason?: boolean;
    verbose?: number;
    debug?: number;
    packet_trace?: boolean;
    open?: boolean;
    allPorts?: boolean;
    fastMode?: boolean;
    topPorts?: number;
    portRatio?: number;
    customNseScripts?: string[];
    dnsResolution?: boolean;
    reverseDns?: boolean;
    systemDns?: boolean;
    dnsServers?: string[];
    traceroute?: boolean;
    maxHostgroup?: number;
    minHostgroup?: number;
    maxParallelism?: number;
    minParallelism?: number;
    maxRttTimeout?: number;
    minRttTimeout?: number;
    initialRttTimeout?: number;
    maxScanDelay?: number;
    minScanDelay?: number;
    defeatRstRatelimit?: boolean;
    defeatIcmpRatelimit?: boolean;
    maxRate?: number;
    minRate?: number;
    sendEth?: boolean;
    sendIp?: boolean;
    badSum?: boolean;
    adler32?: boolean;
    ipOptions?: string;
    mtuDiscovery?: boolean;
    scanType6?: boolean;
}

export interface ScanProgress {
    scanId: string;
    status: 'queued' | 'initializing' | 'running' | 'completed' | 'cancelled' | 'failed' | 'paused' | 'resumed';
    percentage: number;
    hostsScanned: number;
    hostsTotal: number;
    hostsUp: number;
    hostsDown: number;
    hostsFiltered: number;
    openPorts: number;
    closedPorts: number;
    filteredPorts: number;
    vulnerabilities: number;
    elapsedTime: number;
    estimatedTime?: number;
    scanRate: number;
    currentHost?: string;
    currentHostIndex?: number;
    currentActivity?: string;
    currentPort?: number;
    currentService?: string;
    phase: 'discovery' | 'port_scan' | 'service_detection' | 'os_detection' | 'script_scan' | 'vuln_scan' | 'reporting';
    bytesReceived: number;
    bytesSent: number;
    packetsReceived: number;
    packetsSent: number;
    errors: ScanError[];
    warnings: ScanWarning[];
    recentDiscoveries?: ScanDiscovery[];
    statistics?: ScanStatistics;
    performance?: PerformanceMetrics;
}

export interface ScanError {
    timestamp: string;
    level: 'error' | 'critical';
    message: string;
    host?: string;
    port?: number;
    code?: string;
    details?: any;
}

export interface ScanWarning {
    timestamp: string;
    message: string;
    host?: string;
    port?: number;
    suggestion?: string;
}

export interface ScanDiscovery {
    timestamp: string;
    host: string;
    type: 'host_up' | 'port_open' | 'service_detected' | 'os_detected' | 'vulnerability_found' | 'script_result';
    description: string;
    port?: number;
    service?: string;
    details?: any;
    severity?: 'info' | 'low' | 'medium' | 'high' | 'critical';
}

export interface ScanStatistics {
    totalHosts: number;
    aliveHosts: number;
    deadHosts: number;
    totalPorts: number;
    openPorts: number;
    closedPorts: number;
    filteredPorts: number;
    uniqueServices: number;
    uniqueOperatingSystems: number;
    vulnerabilitiesFound: number;
    averageResponseTime: number;
    maxResponseTime: number;
    minResponseTime: number;
    packetsPerSecond: number;
    hostsPerMinute: number;
}

export interface PerformanceMetrics {
    cpuUsage: number;
    memoryUsage: number;
    networkUtilization: number;
    ioOperations: number;
    threadsActive: number;
    bandwidthUsed: number;
}

// =============================================================================
// РЕЗУЛЬТАТЫ СКАНИРОВАНИЯ
// =============================================================================

export interface ScanResult {
    ip: string;
    hostname?: string;
    hostnames?: string[];
    status: 'up' | 'down' | 'filtered' | 'unknown';
    reason: string;
    reasonTtl?: number;
    mac?: string;
    vendor?: string;
    distance?: number;
    uptime?: number;
    lastBoot?: string;
    tcpSequence?: TcpSequenceInfo;
    ipIdSequence?: IpIdSequenceInfo;
    tcpTsSequence?: TcpTsSequenceInfo;
    os?: OperatingSystemInfo;
    openPorts?: OpenPort[];
    closedPorts?: ClosedPort[];
    filteredPorts?: FilteredPort[];
    extraPorts?: ExtraPortsInfo;
    traceroute?: TracerouteHop[];
    hostScripts?: NmapScript[];
    latency?: number;
    lastSeen?: string;
    firstSeen?: string;
    scanTime: string;
    endTime?: string;
    state: HostState;
    address: AddressInfo[];
    ports: PortInfo;
    scripts?: Record<string, NmapScript>;
    vulnerabilities?: Vulnerability[];
    services?: ServiceInfo[];
    certificates?: CertificateInfo[];
    webTechnologies?: WebTechnology[];
    reputation?: ReputationInfo;
    geolocation?: GeolocationInfo;
    metadata?: Record<string, any>;
}

export interface HostState {
    state: 'up' | 'down' | 'unknown' | 'skipped';
    reason: string;
    reasonTtl: number;
}

export interface AddressInfo {
    addr: string;
    addrtype: 'ipv4' | 'ipv6' | 'mac';
    vendor?: string;
}

export interface PortInfo {
    extraports?: ExtraPortsInfo;
    ports: (OpenPort | ClosedPort | FilteredPort)[];
}

export interface ExtraPortsInfo {
    state: string;
    count: number;
    reasons: Array<{
        reason: string;
        count: number;
    }>;
}

export interface OpenPort {
    portid: number;
    protocol: 'tcp' | 'udp' | 'sctp';
    state: 'open' | 'open|filtered';
    reason: string;
    reasonTtl?: number;
    service: ServiceDetection;
    scripts?: NmapScript[];
    owner?: string;
}

export interface ClosedPort {
    portid: number;
    protocol: 'tcp' | 'udp' | 'sctp';
    state: 'closed';
    reason: string;
    reasonTtl?: number;
}

export interface FilteredPort {
    portid: number;
    protocol: 'tcp' | 'udp' | 'sctp';
    state: 'filtered' | 'unfiltered' | 'closed|filtered';
    reason: string;
    reasonTtl?: number;
}

export interface ServiceDetection {
    name: string;
    product?: string;
    version?: string;
    extrainfo?: string;
    hostname?: string;
    ostype?: string;
    devicetype?: string;
    servicefp?: string;
    tunnel?: string;
    proto?: string;
    rpcnum?: number;
    lowver?: string;
    highver?: string;
    method: 'table' | 'probed' | 'detection';
    conf: number;
    cpe?: string[];
}

export interface ServiceInfo {
    port: number;
    protocol: string;
    service: string;
    product?: string;
    version?: string;
    confidence: number;
    method: string;
    banner?: string;
    fingerprint?: string;
    cpe?: string[];
    vulnerabilities?: string[];
}

export interface NmapScript {
    id: string;
    output: string;
    elements?: Record<string, any>;
    args?: Record<string, string>;
    executionTime?: number;
    status: 'success' | 'error' | 'timeout';
    errorMessage?: string;
}

export interface TracerouteHop {
    ttl: number;
    rtt: number;
    ip: string;
    hostname?: string;
}

export interface OperatingSystemInfo {
    name?: string;
    family?: string;
    generation?: string;
    type?: string;
    vendor?: string;
    accuracy: number;
    line?: number;
    used?: boolean;
    osClasses: OsClass[];
    osMatches: OsMatch[];
    portUsed?: PortUsed[];
    fingerprint?: string;
}

export interface OsClass {
    type?: string;
    vendor?: string;
    osfamily?: string;
    osgen?: string;
    accuracy: number;
    cpe?: string[];
}

export interface OsMatch {
    name: string;
    accuracy: number;
    line: number;
    osClasses: OsClass[];
}

export interface PortUsed {
    state: string;
    proto: string;
    portid: number;
}

export interface TcpSequenceInfo {
    index: number;
    difficulty: string;
    values: number[];
}

export interface IpIdSequenceInfo {
    class: string;
    values: number[];
}

export interface TcpTsSequenceInfo {
    class: string;
    values?: number[];
}

// =============================================================================
// УЯЗВИМОСТИ И БЕЗОПАСНОСТЬ
// =============================================================================

export interface Vulnerability {
    id: string;
    cveId?: string;
    cweId?: string;
    title: string;
    description: string;
    severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
    cvssScore?: number;
    cvssVector?: string;
    cvssVersion?: '2.0' | '3.0' | '3.1';
    baseScore?: number;
    temporalScore?: number;
    environmentalScore?: number;
    attackVector?: 'network' | 'adjacent' | 'local' | 'physical';
    attackComplexity?: 'low' | 'high';
    privilegesRequired?: 'none' | 'low' | 'high';
    userInteraction?: 'none' | 'required';
    scope?: 'unchanged' | 'changed';
    confidentialityImpact?: 'none' | 'low' | 'high';
    integrityImpact?: 'none' | 'low' | 'high';
    availabilityImpact?: 'none' | 'low' | 'high';
    references?: VulnerabilityReference[];
    solution?: string;
    workaround?: string;
    affectedPorts?: number[];
    affectedServices?: string[];
    exploitAvailable?: boolean;
    exploitMaturity?: 'unproven' | 'proof-of-concept' | 'functional' | 'high';
    exploitCode?: string;
    metasploitModules?: string[];
    tags?: string[];
    publishedDate?: string;
    modifiedDate?: string;
    discoveredDate?: string;
    disclosureDate?: string;
    source: 'nmap' | 'nessus' | 'openvas' | 'custom' | 'manual';
    verified: boolean;
    falsePositive: boolean;
    riskAccepted: boolean;
    notes?: string;
    evidences?: Evidence[];
}

export interface VulnerabilityReference {
    type: 'cve' | 'bid' | 'osvdb' | 'secunia' | 'xf' | 'url' | 'other';
    value: string;
    url?: string;
}

export interface Evidence {
    type: 'screenshot' | 'log' | 'packet' | 'code' | 'output';
    description: string;
    data: string;
    timestamp: string;
}

// =============================================================================
// СЕССИИ И ШАБЛОНЫ СКАНИРОВАНИЯ
// =============================================================================

export interface ScanSession {
    id: string;
    name: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
    startedAt?: string;
    completedAt?: string;
    status: 'draft' | 'active' | 'completed' | 'archived' | 'failed';
    request: ScanRequest;
    progress?: ScanProgress;
    results: ScanResult[];
    vulnerabilities: Vulnerability[];
    summary?: ScanSummary;
    reports?: ScanReport[];
    tags?: string[];
    priority: 'low' | 'medium' | 'high' | 'critical';
    recurring?: RecurringConfig;
    notifications?: NotificationConfig;
    metadata?: Record<string, any>;
    createdBy: string;
    modifiedBy?: string;
    sharedWith?: string[];
    permissions?: Permission[];
    retention?: RetentionPolicy;
}

export interface ScanSummary {
    totalHosts: number;
    aliveHosts: number;
    totalPorts: number;
    openPorts: number;
    totalVulnerabilities: number;
    criticalVulnerabilities: number;
    highVulnerabilities: number;
    mediumVulnerabilities: number;
    lowVulnerabilities: number;
    infoVulnerabilities: number;
    uniqueServices: number;
    operatingSystems: string[];
    scanDuration: number;
    dataVolume: number;
    topServices: Array<{
        service: string;
        count: number;
        ports: number[];
    }>;
    topVulnerabilities: Array<{
        cveId: string;
        count: number;
        severity: string;
    }>;
    riskScore: number;
    complianceStatus?: ComplianceStatus;
}

export interface ScanTemplate {
    id: string;
    name: string;
    description: string;
    config: ScanRequest;
    category: 'network' | 'web' | 'wireless' | 'database' | 'cloud' | 'iot' | 'mobile' | 'custom';
    subcategory?: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    estimatedDuration: number;
    isBuiltIn: boolean;
    isPublic: boolean;
    version: string;
    author: string;
    createdAt: string;
    updatedAt: string;
    tags: string[];
    requirements?: string[];
    prerequisites?: string[];
    limitations?: string[];
    usageCount: number;
    rating?: number;
    reviews?: TemplateReview[];
    changelog?: TemplateChange[];
}

export interface TemplateReview {
    userId: string;
    rating: number;
    comment: string;
    createdAt: string;
}

export interface TemplateChange {
    version: string;
    changes: string[];
    author: string;
    date: string;
}

export interface RecurringConfig {
    enabled: boolean;
    schedule: 'daily' | 'weekly' | 'monthly' | 'custom';
    cronExpression?: string;
    nextRun?: string;
    lastRun?: string;
    maxRuns?: number;
    runCount: number;
}

export interface NotificationConfig {
    onStart: boolean;
    onComplete: boolean;
    onError: boolean;
    onHighSeverityVuln: boolean;
    channels: NotificationChannel[];
    customRules?: NotificationRule[];
}

export interface NotificationChannel {
    type: 'email' | 'slack' | 'webhook' | 'sms' | 'teams';
    enabled: boolean;
    config: Record<string, any>;
}

export interface NotificationRule {
    condition: string;
    action: 'notify' | 'escalate' | 'stop_scan';
    channels: string[];
    message?: string;
}

export interface Permission {
    userId: string;
    role: 'owner' | 'editor' | 'viewer';
    permissions: ('read' | 'write' | 'delete' | 'share' | 'execute')[];
}

export interface RetentionPolicy {
    keepResults: number; // days
    keepReports: number; // days
    autoArchive: boolean;
    autoDelete: boolean;
}

// =============================================================================
// ОТЧЕТЫ И ЭКСПОРТ
// =============================================================================

export interface ScanReport {
    id: string;
    scanId: string;
    type: 'executive' | 'technical' | 'compliance' | 'vulnerability' | 'custom';
    format: 'pdf' | 'html' | 'docx' | 'xml' | 'json' | 'csv';
    title: string;
    description?: string;
    template: string;
    data: any;
    generatedAt: string;
    generatedBy: string;
    size: number;
    downloadUrl?: string;
    status: 'generating' | 'ready' | 'error';
    error?: string;
    expiresAt?: string;
    shared: boolean;
    password?: string;
}

export interface ReportTemplate {
    id: string;
    name: string;
    description: string;
    type: 'executive' | 'technical' | 'compliance' | 'vulnerability' | 'custom';
    format: 'pdf' | 'html' | 'docx';
    content: ReportSection[];
    styles?: ReportStyles;
    variables?: ReportVariable[];
    isBuiltIn: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface ReportSection {
    id: string;
    type: 'text' | 'table' | 'chart' | 'image' | 'list' | 'summary';
    title: string;
    content: any;
    order: number;
    visible: boolean;
    conditions?: string[];
}

export interface ReportStyles {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    fontSize: number;
    headerImage?: string;
    footerText?: string;
}

export interface ReportVariable {
    name: string;
    type: 'string' | 'number' | 'date' | 'boolean';
    defaultValue: any;
    description: string;
}

// =============================================================================
// ДОПОЛНИТЕЛЬНЫЕ ТИПЫ
// =============================================================================

export interface PortScanStats {
    totalPorts: number;
    openPorts: number;
    closedPorts: number;
    filteredPorts: number;
    commonServices: Array<{
        service: string;
        count: number;
        ports: number[];
    }>;
    riskDistribution: {
        critical: number;
        high: number;
        medium: number;
        low: number;
        info: number;
    };
    protocolDistribution: {
        tcp: number;
        udp: number;
        sctp: number;
    };
}

export interface NetworkRange {
    start: string;
    end: string;
    cidr?: string;
    description?: string;
    excludes?: string[];
}

export interface ScannerConfig {
    maxConcurrentScans: number;
    maxTargetsPerScan: number;
    defaultTimeout: number;
    maxTimeout: number;
    allowedNetworks: NetworkRange[];
    blockedNetworks: NetworkRange[];
    rateLimiting: {
        enabled: boolean;
        requestsPerSecond: number;
        burstSize: number;
    };
    securitySettings: {
        requireApproval: boolean;
        logAllActivity: boolean;
        encryptResults: boolean;
        anonymizeData: boolean;
    };
}

export interface CertificateInfo {
    subject: string;
    issuer: string;
    serialNumber: string;
    notBefore: string;
    notAfter: string;
    fingerprint: string;
    algorithm: string;
    keySize: number;
    expired: boolean;
    selfSigned: boolean;
    chain: string[];
    vulnerabilities?: string[];
}

export interface WebTechnology {
    name: string;
    version?: string;
    categories: string[];
    confidence: number;
    website?: string;
    cpe?: string;
    icon?: string;
}

export interface ReputationInfo {
    source: string;
    score: number;
    category: 'clean' | 'suspicious' | 'malicious' | 'unknown';
    details?: string;
    lastUpdated: string;
}

export interface GeolocationInfo {
    ip: string;
    country?: string;
    countryCode?: string;
    region?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
    isp?: string;
    org?: string;
    timezone?: string;
    asn?: string;
    asnOrg?: string;
}

export interface ComplianceStatus {
    framework: 'pci-dss' | 'hipaa' | 'sox' | 'iso27001' | 'nist' | 'custom';
    status: 'compliant' | 'non-compliant' | 'partial' | 'unknown';
    score: number;
    requirements: ComplianceRequirement[];
    lastAssessment: string;
}

export interface ComplianceRequirement {
    id: string;
    title: string;
    description: string;
    status: 'pass' | 'fail' | 'warning' | 'not-applicable';
    details?: string;
    evidence?: string[];
    remediation?: string;
}

export interface ScannerPluginInfo {
    id: string;
    name: string;
    version: string;
    author: string;
    description: string;
    capabilities: string[];
    requirements: string[];
    enabled: boolean;
    config?: Record<string, any>;
}

export interface ScanQueue {
    id: string;
    name: string;
    priority: number;
    maxConcurrent: number;
    currentlyRunning: number;
    pending: string[];
    completed: string[];
    failed: string[];
    paused: boolean;
}

// =============================================================================
// ВСПОМОГАТЕЛЬНЫЕ ТИПЫ И ENUMS
// =============================================================================

export type ScanType = ScanRequest['scanType'];
export type ScanStatus = ScanProgress['status'];
export type PortState = OpenPort['state'] | ClosedPort['state'] | FilteredPort['state'];
export type VulnerabilitySeverity = Vulnerability['severity'];
export type ScanPhase = ScanProgress['phase'];

export const SCAN_TYPES = [
    'quick',
    'comprehensive',
    'custom',
    'stealth',
    'udp',
    'ping',
    'tcp-connect',
    'syn',
    'ack',
    'fin',
    'null',
    'xmas'
] as const;

export const TIMING_TEMPLATES = [
    'paranoid',
    'sneaky',
    'polite',
    'normal',
    'aggressive',
    'insane'
] as const;

export const VULNERABILITY_SEVERITIES = [
    'info',
    'low',
    'medium',
    'high',
    'critical'
] as const;

export const PORT_STATES = [
    'open',
    'closed',
    'filtered',
    'unfiltered',
    'open|filtered',
    'closed|filtered'
] as const;

export const SCAN_PHASES = [
    'discovery',
    'port_scan',
    'service_detection',
    'os_detection',
    'script_scan',
    'vuln_scan',
    'reporting'
] as const;

// =============================================================================
// ФУНКЦИИ-УТИЛИТЫ ТИПОВ
// =============================================================================

export const isValidScanType = (type: string): type is ScanType => {
    return SCAN_TYPES.includes(type as ScanType);
};

export const isValidTiming = (timing: string): timing is ScanRequest['timing'] => {
    return TIMING_TEMPLATES.includes(timing as any);
};

export const isValidSeverity = (severity: string): severity is VulnerabilitySeverity => {
    return VULNERABILITY_SEVERITIES.includes(severity as VulnerabilitySeverity);
};

export const getSeverityWeight = (severity: VulnerabilitySeverity): number => {
    const weights = { info: 1, low: 2, medium: 3, high: 4, critical: 5 };
    return weights[severity];
};

export const getRiskScore = (vulnerabilities: Vulnerability[]): number => {
    if (vulnerabilities.length === 0) return 0;

    const totalWeight = vulnerabilities.reduce((sum, vuln) => {
        return sum + getSeverityWeight(vuln.severity);
    }, 0);

    return Math.min(Math.round((totalWeight / vulnerabilities.length) * 20), 100);
};

// =============================================================================
// КОНСТАНТЫ
// =============================================================================

export const DEFAULT_PORTS = {
    TCP_TOP_100: "7,9,13,21-23,25-26,37,53,79-81,88,106,110-111,113,119,135,139,143-144,179,199,389,427,443-445,465,513-515,543-544,548,554,587,631,646,873,990,993,995,1025-1029,1110,1433,1720,1723,1755,1900,2000-2001,2049,2121,2717,3000,3128,3306,3389,3986,4899,5000,5009,5051,5060,5101,5190,5357,5432,5631,5666,5800,5900,6000-6001,6646,7070,8000,8008-8009,8080-8081,8443,8888,9100,9999-10000,32768,49152-49157",
    TCP_TOP_1000: "1,3-4,6-7,9,13,17,19-26,30,32-33,37,42-43,49,53,70,79-85,88-90,99-100,106,109-111,113,119,125,135,139,143-144,146,161,163,179,199,211-212,222,254-256,259,264,280,301,306,311,340,366,389,406-407,416,417,425,427,443-445,458,464-465,481,497,500,512-515,524,541,543-545,548,554-555,563,587,593,616-617,625,631,636,646,648,666-668,683,687,691,700,705,711,714,720,722,726,749,765,777,783,787,800-801,808,843,873,880,888,898,900-903,911-912,981,987,990,992-993,995,999-1002,1007,1009-1011,1021-1100,1102,1104-1108,1110-1114,1117,1119,1121-1124,1126,1130-1132,1137-1138,1141,1145,1147-1149,1151-1152,1154,1163-1166,1169,1174-1175,1183,1185-1187,1192,1198-1199,1201,1213,1216-1218,1233-1234,1236,1244,1247-1248,1259,1271-1272,1277,1287,1296,1300-1301,1309-1311,1322,1328,1334,1352,1417,1433-1434,1443,1455,1461,1494,1500-1501,1503,1521,1524,1533,1556,1580,1583,1594,1600,1641,1658,1666,1687-1688,1700,1717-1721,1723,1755,1761,1782-1783,1801,1805,1812,1839-1840,1862-1864,1875,1900,1914,1935,1947,1971-1972,1974,1984,1998-2010,2013,2020-2022,2030,2033-2035,2038,2040-2043,2045-2049,2065,2068,2099-2100,2103,2105-2107,2111,2119,2121,2126,2135,2144,2160-2161,2170,2179,2190-2191,2196,2200,2222,2251,2260,2288,2301,2323,2366,2381-2383,2393-2394,2399,2401,2492,2500,2522,2525,2557,2601-2602,2604-2605,2607-2608,2638,2701-2702,2710,2717-2718,2725,2800,2809,2811,2869,2875,2909-2910,2920,2967-2968,2998,3000-3001,3003,3005-3007,3011,3013,3017,3030-3031,3052,3071,3077,3128,3168,3211,3221,3260-3261,3268-3269,3283,3300-3301,3306,3322-3325,3333,3351,3367,3369-3372,3389-3390,3404,3476,3493,3517,3527,3546,3551,3580,3659,3689-3690,3703,3737,3766,3784,3800-3801,3809,3814,3826-3828,3851,3869,3871,3878,3880,3889,3905,3914,3918,3920,3945,3971,3986,3995,3998,4000-4006,4045,4111,4125-4126,4129,4224,4242,4279,4321,4343,4443-4446,4449,4550,4567,4662,4848,4899-4900,4998,5000-5004,5009,5030,5033,5050-5051,5054,5060-5061,5080,5087,5100-5102,5120,5190,5200,5214,5221-5222,5225-5226,5269,5280,5298,5357,5405,5414,5431-5432,5440,5500,5510,5544,5550,5555,5560,5566,5631,5633,5666,5678-5679,5718,5730,5800-5802,5810-5811,5815,5822,5825,5850,5859,5862,5877,5900-5904,5906-5907,5910-5911,5915,5922,5925,5950,5952,5959-5963,5987-5989,5998-6007,6009,6025,6059,6100-6101,6106,6112,6123,6129,6156,6346,6389,6502,6510,6543,6547,6565-6567,6580,6646,6666-6669,6689,6692,6699,6779,6788-6789,6792,6839,6881,6901,6969,7000-7002,7004,7007,7019,7025,7070,7100,7103,7106,7200-7201,7402,7435,7443,7496,7512,7625,7627,7676,7741,7777-7778,7800,7911,7920-7921,7937-7938,7999-8002,8007-8011,8021-8022,8031,8042,8045,8080-8090,8093,8099-8100,8180-8181,8192-8194,8200,8222,8254,8290-8292,8300,8333,8383,8400,8402,8443,8500,8600,8649,8651-8652,8654,8701,8800,8873,8888,8899,8994,9000-9003,9009-9011,9040,9050,9071,9080-9081,9090-9091,9099-9103,9110-9111,9200,9207,9220,9290,9415,9418,9485,9500,9502-9503,9535,9575,9593-9595,9618,9666,9876-9878,9898,9900,9917,9929,9943-9944,9968,9998-10004,10009-10010,10012,10024-10025,10082,10180,10215,10243,10566,10616-10617,10621,10626,10628-10629,10778,11110-11111,11967,12000,12174,12265,12345,13456,13722,13782-13783,14000,14238,14441-14442,15000,15002-15004,15660,15742,16000-16001,16012,16016,16018,16080,16113,16992-16993,17877,17988,18040,18101,18988,19101,19283,19315,19350,19780,19801,19842,20000,20005,20031,20221-20222,20828,21571,22939,23502,24444,24800,25734-25735,26214,27000,27352-27353,27355-27356,27715,28201,30000,30718,30951,31038,31337,32768-32785,33354,33899,34571-34573,35500,38292,40193,40911,41511,42510,44176,44442-44443,44501,45100,48080,49152-49161,49163,49165,49167,49175-49176,49400,49999-50003,50006,50300,50389,50500,50636,50800,51103,51493,52673,52822,52848,52869,54045,54328,55055-55056,55555,55600,56737-56738,57294,57797,58080,60020,60443,61532,61900,62078,63331,64623,64680,65000,65129,65389",
    UDP_TOP_100: "7,9,17,19,49,53,67-69,80,88,111,120,123,135-139,158,161-162,177,192,199,389,407,427,443,445,464,497,500,514-515,518,520,593,623,626,631,749-751,996-999,1022-1023,1025-1030,1433-1434,1645-1646,1701,1718-1719,1812-1813,1900,2000,2048-2049,2222-2223,2746,3230-3235,3283,3401,3456,3703,4444,4500,5000,5060,5093,5351,5353,5355,5500,5632,6000-6001,6346,7,9,17,19,49,53,67-69,80,88,111,120,123,135-139,158,161-162,177,192,199,389,407,427,443,445,464,497,500,514-515,518,520,593,623,626,631,749-751,996-999,1022-1023,1025-1030,1433-1434,1645-1646,1701,1718-1719,1812-1813,1900,2000,2048-2049,2222-2223,2746,3230-3235,3283,3401,3456,3703,4444,4500,5000,5060,5093,5351,5353,5355,5500,5632,6000-6001,6346"
};

export const COMMON_SERVICES: Record<number, string> = {
    21: 'FTP',
    22: 'SSH',
    23: 'Telnet',
    25: 'SMTP',
    53: 'DNS',
    80: 'HTTP',
    110: 'POP3',
    135: 'RPC',
    139: 'NetBIOS',
    143: 'IMAP',
    443: 'HTTPS',
    445: 'SMB',
    993: 'IMAPS',
    995: 'POP3S',
    3389: 'RDP',
    5432: 'PostgreSQL',
    3306: 'MySQL',
    1433: 'MSSQL',
    6379: 'Redis',
    27017: 'MongoDB'
};

export default {
    SCAN_TYPES,
    TIMING_TEMPLATES,
    VULNERABILITY_SEVERITIES,
    PORT_STATES,
    SCAN_PHASES,
    DEFAULT_PORTS,
    COMMON_SERVICES,
    isValidScanType,
    isValidTiming,
    isValidSeverity,
    getSeverityWeight,
    getRiskScore
};
