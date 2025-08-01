/**
 * IP_Roast 4.0 Enterprise Network Types
 * Типы для сетевого модуля и управления инфраструктурой
 */

// =============================================================================
// ОСНОВНЫЕ СЕТЕВЫЕ ТИПЫ
// =============================================================================

export interface NetworkDevice {
    id: string;
    ip: string;
    ipv6?: string;
    hostname?: string;
    hostnames?: string[];
    fqdn?: string;
    mac?: string;
    vendor?: string;

    // Классификация устройства
    type: DeviceType;
    category: DeviceCategory;
    subcategory?: string;

    // Статус и состояние
    status: DeviceStatus;
    lastStatus?: DeviceStatus;
    statusReason?: string;
    confidence: number;

    // Операционная система
    os?: OperatingSystem;

    // Сетевая информация
    network: NetworkInfo;

    // Временные метки
    firstSeen: string;
    lastSeen: string;
    lastScanned?: string;
    nextScan?: string;

    // Сервисы и порты
    openPorts: number[];
    services: NetworkService[];

    // Безопасность
    vulnerabilities: string[];
    threats: ThreatIndicator[];
    riskScore: number;
    securityStatus: SecurityStatus;

    // Производительность
    performance?: PerformanceMetrics;

    // Местоположение
    location?: DeviceLocation;

    // Отношения
    connections: DeviceConnection[];
    dependencies: DeviceDependency[];

    // Теги и метаданные
    tags: string[];
    labels: Record<string, string>;
    metadata: Record<string, any>;

    // Мониторинг
    monitoring: MonitoringConfig;

    // Управление
    management?: ManagementInfo;

    // Соответствие требованиям
    compliance?: ComplianceInfo;
}

export type DeviceType =
    | 'router'             // Маршрутизатор
    | 'switch'             // Коммутатор
    | 'firewall'           // Межсетевой экран
    | 'server'             // Сервер
    | 'workstation'        // Рабочая станция
    | 'laptop'             // Ноутбук
    | 'mobile'             // Мобильное устройство
    | 'tablet'             // Планшет
    | 'printer'            // Принтер
    | 'camera'             // IP-камера
    | 'phone'              // IP-телефон
    | 'access_point'       // Точка доступа Wi-Fi
    | 'nas'                // Сетевое хранилище
    | 'iot'                // IoT устройство
    | 'sensor'             // Датчик
    | 'controller'         // Контроллер
    | 'appliance'          // Сетевое устройство
    | 'virtual'            // Виртуальная машина
    | 'container'          // Контейнер
    | 'cloud'              // Облачный ресурс
    | 'unknown';           // Неизвестный тип

export type DeviceCategory =
    | 'infrastructure'     // Инфраструктура
    | 'endpoint'           // Конечная точка
    | 'security'           // Безопасность
    | 'storage'            // Хранение
    | 'communication'      // Связь
    | 'iot'                // Интернет вещей
    | 'virtualization'     // Виртуализация
    | 'cloud'              // Облако
    | 'other';             // Прочее

export type DeviceStatus =
    | 'online'             // В сети
    | 'offline'            // Не в сети
    | 'warning'            // Предупреждение
    | 'critical'           // Критическое состояние
    | 'unknown'            // Неизвестно
    | 'maintenance'        // Обслуживание
    | 'quarantine'         // Карантин
    | 'new'                // Новое устройство
    | 'decommissioned';    // Выведено из эксплуатации

export type SecurityStatus =
    | 'secure'             // Безопасно
    | 'vulnerable'         // Уязвимо
    | 'compromised'        // Скомпрометировано
    | 'suspicious'         // Подозрительно
    | 'unknown'            // Неизвестно
    | 'scanning'           // Сканируется
    | 'patching';          // Патчится

// =============================================================================
// ОПЕРАЦИОННЫЕ СИСТЕМЫ
// =============================================================================

export interface OperatingSystem {
    name: string;
    family: OSFamily;
    version?: string;
    build?: string;
    architecture?: string;
    kernel?: string;
    distribution?: string;

    // Точность определения
    confidence: number;
    method: 'fingerprint' | 'banner' | 'nmap' | 'manual' | 'snmp';

    // Детали
    details: OSDetails;

    // Безопасность
    security: OSSecurityInfo;

    // Поддержка
    support: OSSupportInfo;
}

export type OSFamily =
    | 'Windows'
    | 'Linux'
    | 'macOS'
    | 'iOS'
    | 'Android'
    | 'FreeBSD'
    | 'OpenBSD'
    | 'NetBSD'
    | 'Solaris'
    | 'AIX'
    | 'HP-UX'
    | 'VMware'
    | 'Cisco_IOS'
    | 'Juniper'
    | 'FortiOS'
    | 'pfSense'
    | 'Router'
    | 'Embedded'
    | 'Unknown';

export interface OSDetails {
    releaseDate?: string;
    endOfLife?: string;
    servicePackLevel?: string;
    patchLevel?: string;
    manufacturer?: string;
    productName?: string;
    cpuArchitecture?: string;
    installDate?: string;
    serialNumber?: string;
    licenseKey?: string;
}

export interface OSSecurityInfo {
    hasAntivirus?: boolean;
    antivirusProduct?: string;
    hasFirewall?: boolean;
    firewallStatus?: 'enabled' | 'disabled' | 'unknown';
    encryptionStatus?: 'enabled' | 'disabled' | 'partial' | 'unknown';
    lastSecurityUpdate?: string;
    pendingUpdates?: number;
    vulnerabilityCount: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface OSSupportInfo {
    vendor: string;
    supportStatus: 'supported' | 'extended' | 'unsupported' | 'unknown';
    endOfSupport?: string;
    endOfLife?: string;
    ltsVersion?: boolean;
}

// =============================================================================
// СЕТЕВАЯ ИНФОРМАЦИЯ
// =============================================================================

export interface NetworkInfo {
    // IP адресация
    ipv4: IPv4Info;
    ipv6?: IPv6Info;

    // Физический уровень
    physical: PhysicalNetworkInfo;

    // Канальный уровень
    dataLink: DataLinkInfo;

    // Сетевой уровень
    network: NetworkLayerInfo;

    // Производительность
    performance: NetworkPerformance;

    // Безопасность
    security: NetworkSecurityInfo;
}

export interface IPv4Info {
    address: string;
    netmask: string;
    cidr: number;
    network: string;
    broadcast?: string;
    gateway?: string;
    dhcp: boolean;
    dnsServers?: string[];
    domainSearch?: string[];

    // Классификация
    class: 'A' | 'B' | 'C' | 'D' | 'E';
    type: 'public' | 'private' | 'loopback' | 'multicast' | 'broadcast';
    scope: 'global' | 'site-local' | 'link-local' | 'node-local';
}

export interface IPv6Info {
    address: string;
    prefixLength: number;
    scope: 'global' | 'unique-local' | 'link-local' | 'multicast';
    type: 'unicast' | 'multicast' | 'anycast';
    autoConfig: boolean;
    temporary: boolean;
    preferred: boolean;
    gateway?: string;
    dnsServers?: string[];
}

export interface PhysicalNetworkInfo {
    interface: string;
    type: 'ethernet' | 'wifi' | 'bluetooth' | 'cellular' | 'fiber' | 'serial' | 'other';
    speed?: number; // Mbps
    duplex?: 'full' | 'half' | 'auto';
    mtu: number;

    // Wi-Fi специфичные
    ssid?: string;
    bssid?: string;
    channel?: number;
    frequency?: number; // MHz
    signalStrength?: number; // dBm
    encryption?: string;

    // Cellular специфичные
    carrier?: string;
    technology?: '2G' | '3G' | '4G' | '5G';
    imei?: string;
    imsi?: string;
}

export interface DataLinkInfo {
    macAddress: string;
    vendor: string;
    oui: string;

    // VLAN информация
    vlans: VLANInfo[];
    nativeVlan?: number;
    trunkPort?: boolean;

    // Spanning Tree
    spanningTree?: SpanningTreeInfo;

    // Link Aggregation
    bondingMode?: string;
    bondedInterfaces?: string[];
}

export interface VLANInfo {
    id: number;
    name: string;
    description?: string;
    subnet?: string;
    gateway?: string;
    type: 'access' | 'trunk' | 'hybrid';
    tagged: boolean;
}

export interface SpanningTreeInfo {
    enabled: boolean;
    protocol: 'STP' | 'RSTP' | 'MSTP' | 'PVST+';
    bridgeId: string;
    rootBridge: boolean;
    portStates: Record<string, 'forwarding' | 'blocking' | 'learning' | 'listening'>;
}

export interface NetworkLayerInfo {
    routing: RoutingInfo;
    arp: ARPEntry[];
    ndp?: NDPEntry[]; // IPv6 Neighbor Discovery

    // Протоколы
    protocols: string[];

    // QoS
    qos?: QoSInfo;
}

export interface RoutingInfo {
    defaultGateway?: string;
    routes: RouteEntry[];
    routingProtocols: string[];
    autonomousSystem?: number;
    bgpPeers?: BGPPeer[];
}

export interface RouteEntry {
    destination: string;
    gateway: string;
    interface: string;
    metric: number;
    protocol: string;
    type: 'static' | 'dynamic' | 'connected' | 'default';
}

export interface ARPEntry {
    ip: string;
    mac: string;
    interface: string;
    type: 'static' | 'dynamic';
    state: 'reachable' | 'stale' | 'delay' | 'probe' | 'failed';
}

export interface NDPEntry {
    ip: string;
    mac: string;
    interface: string;
    state: 'reachable' | 'stale' | 'delay' | 'probe' | 'incomplete';
    router: boolean;
}

export interface BGPPeer {
    ip: string;
    asn: number;
    state: 'idle' | 'connect' | 'active' | 'opensent' | 'openconfirm' | 'established';
    uptime?: number;
    prefixesReceived?: number;
    prefixesAdvertised?: number;
}

export interface QoSInfo {
    enabled: boolean;
    policies: QoSPolicy[];
    queues: QoSQueue[];
    shapers: QoSShaper[];
}

export interface QoSPolicy {
    name: string;
    direction: 'inbound' | 'outbound';
    classifiers: QoSClassifier[];
    actions: QoSAction[];
}

export interface QoSClassifier {
    protocol?: string;
    sourceIP?: string;
    destIP?: string;
    sourcePort?: number;
    destPort?: number;
    dscp?: number;
    priority?: number;
}

export interface QoSAction {
    type: 'mark' | 'police' | 'shape' | 'drop' | 'forward';
    value?: any;
}

export interface QoSQueue {
    id: number;
    name: string;
    priority: number;
    bandwidth?: number;
    algorithm: 'fifo' | 'wfq' | 'cbwfq' | 'pq';
}

export interface QoSShaper {
    name: string;
    rate: number; // bps
    burst?: number;
    interface: string;
}

// =============================================================================
// СЕТЕВЫЕ СЕРВИСЫ
// =============================================================================

export interface NetworkService {
    port: number;
    protocol: 'tcp' | 'udp' | 'sctp';
    state: PortState;
    service: string;
    product?: string;
    version?: string;
    extrainfo?: string;

    // Детекция
    detection: ServiceDetection;

    // Безопасность
    security: ServiceSecurity;

    // Производительность
    performance?: ServicePerformance;

    // Сертификаты (для HTTPS/TLS)
    certificates?: CertificateInfo[];

    // Веб-технологии
    webTechnology?: WebTechnology[];

    // Конфигурация
    configuration?: ServiceConfiguration;

    // Мониторинг
    monitoring: ServiceMonitoring;
}

export type PortState =
    | 'open'
    | 'closed'
    | 'filtered'
    | 'unfiltered'
    | 'open|filtered'
    | 'closed|filtered';

export interface ServiceDetection {
    method: 'banner' | 'probe' | 'fingerprint' | 'manual';
    confidence: number;
    fingerprint?: string;
    banner?: string;
    cpe?: string[];
    timestamp: string;
}

export interface ServiceSecurity {
    vulnerabilities: ServiceVulnerability[];
    encryptionSupported: boolean;
    encryptionStrong: boolean;
    authenticationRequired: boolean;
    defaultCredentials: boolean;
    exposureLevel: 'internal' | 'external' | 'dmz' | 'restricted';
    riskScore: number;
}

export interface ServiceVulnerability {
    cve: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    cvss: number;
    description: string;
    exploit?: boolean;
    patch?: string;
}

export interface ServicePerformance {
    responseTime: number;
    availability: number;
    throughput?: number;
    errorRate?: number;
    lastCheck: string;
}

export interface CertificateInfo {
    subject: CertificateSubject;
    issuer: CertificateSubject;
    serialNumber: string;
    fingerprint: string;
    algorithm: string;
    keySize: number;
    validFrom: string;
    validTo: string;
    expired: boolean;
    selfSigned: boolean;
    wildcard: boolean;
    san?: string[];
    chain: CertificateInfo[];
    ocspStatus?: 'good' | 'revoked' | 'unknown';
    crlStatus?: 'good' | 'revoked' | 'unknown';
}

export interface CertificateSubject {
    commonName: string;
    organization?: string;
    organizationalUnit?: string;
    locality?: string;
    stateOrProvince?: string;
    country?: string;
    emailAddress?: string;
}

export interface WebTechnology {
    name: string;
    version?: string;
    categories: string[];
    confidence: number;
    website?: string;
    cpe?: string;
    icon?: string;
    implies?: string[];
    excludes?: string[];
}

export interface ServiceConfiguration {
    configFiles?: string[];
    parameters?: Record<string, any>;
    authentication?: AuthenticationConfig;
    encryption?: EncryptionConfig;
    logging?: LoggingConfig;
    access?: AccessConfig;
}

export interface AuthenticationConfig {
    methods: string[];
    requiresAuth: boolean;
    multiFactorAuth?: boolean;
    passwordPolicy?: PasswordPolicy;
    sessionTimeout?: number;
}

export interface PasswordPolicy {
    minLength: number;
    complexity: boolean;
    expiration?: number;
    history?: number;
}

export interface EncryptionConfig {
    supported: boolean;
    algorithms: string[];
    keySize?: number;
    cipherSuites?: string[];
    protocols?: string[];
}

export interface LoggingConfig {
    enabled: boolean;
    level: string;
    destination?: string;
    retention?: number;
    format?: string;
}

export interface AccessConfig {
    allowedIPs?: string[];
    deniedIPs?: string[];
    maxConnections?: number;
    rateLimit?: number;
    timeRestrictions?: TimeRestriction[];
}

export interface TimeRestriction {
    days: string[];
    startTime: string;
    endTime: string;
    timezone?: string;
}

export interface ServiceMonitoring {
    enabled: boolean;
    interval: number;
    timeout: number;
    retries: number;
    checks: HealthCheck[];
    alerts: AlertRule[];
    metrics: ServiceMetric[];
}

export interface HealthCheck {
    type: 'ping' | 'tcp' | 'http' | 'https' | 'dns' | 'custom';
    config: Record<string, any>;
    lastResult: CheckResult;
    history: CheckResult[];
}

export interface CheckResult {
    timestamp: string;
    success: boolean;
    responseTime?: number;
    statusCode?: number;
    error?: string;
    details?: Record<string, any>;
}

export interface AlertRule {
    id: string;
    name: string;
    condition: string;
    threshold: number;
    severity: 'info' | 'warning' | 'error' | 'critical';
    enabled: boolean;
    recipients: string[];
}

export interface ServiceMetric {
    name: string;
    value: number;
    unit: string;
    timestamp: string;
    labels?: Record<string, string>;
}

// =============================================================================
// ТОПОЛОГИЯ СЕТИ
// =============================================================================

export interface NetworkTopology {
    id: string;
    name: string;
    description?: string;

    // Элементы топологии
    nodes: TopologyNode[];
    links: TopologyLink[];
    subnets: NetworkSubnet[];

    // Метаданные
    createdAt: string;
    updatedAt: string;
    discoveredBy: string;

    // Статистика
    statistics: TopologyStatistics;

    // Настройки отображения
    layout: TopologyLayout;

    // Фильтры
    filters: TopologyFilter[];
}

export interface TopologyNode {
    id: string;
    deviceId?: string;

    // Отображение
    label: string;
    type: NodeType;
    icon: string;
    color: string;
    size: number;

    // Позиция
    position: NodePosition;

    // Свойства
    properties: Record<string, any>;

    // Состояние
    status: NodeStatus;

    // Группировка
    group?: string;
    cluster?: string;

    // Взаимодействие
    selectable: boolean;
    draggable: boolean;

    // Анимация
    animation?: NodeAnimation;
}

export type NodeType =
    | 'device'
    | 'subnet'
    | 'internet'
    | 'cloud'
    | 'cluster'
    | 'virtual'
    | 'logical';

export interface NodePosition {
    x: number;
    y: number;
    z?: number;
    fixed?: boolean;
}

export type NodeStatus =
    | 'active'
    | 'inactive'
    | 'warning'
    | 'error'
    | 'unknown'
    | 'new'
    | 'changed';

export interface NodeAnimation {
    type: 'pulse' | 'bounce' | 'rotate' | 'scale';
    duration: number;
    infinite: boolean;
}

export interface TopologyLink {
    id: string;
    sourceId: string;
    targetId: string;

    // Тип связи
    type: LinkType;
    protocol?: string;

    // Отображение
    label?: string;
    color: string;
    width: number;
    style: 'solid' | 'dashed' | 'dotted';

    // Направленность
    directed: boolean;
    bidirectional: boolean;

    // Производительность
    bandwidth?: number;
    utilization?: number;
    latency?: number;
    packetLoss?: number;

    // Состояние
    status: LinkStatus;

    // Безопасность
    encrypted?: boolean;
    secure?: boolean;

    // Метрики
    metrics: LinkMetric[];

    // Анимация
    animation?: LinkAnimation;
}

export type LinkType =
    | 'ethernet'
    | 'wifi'
    | 'fiber'
    | 'vpn'
    | 'tunnel'
    | 'logical'
    | 'dependency'
    | 'flow';

export type LinkStatus =
    | 'up'
    | 'down'
    | 'degraded'
    | 'congested'
    | 'maintenance'
    | 'unknown';

export interface LinkMetric {
    name: string;
    value: number;
    unit: string;
    timestamp: string;
    threshold?: number;
}

export interface LinkAnimation {
    type: 'flow' | 'pulse' | 'dash';
    speed: number;
    direction: 'forward' | 'backward' | 'both';
}

export interface TopologyStatistics {
    totalNodes: number;
    totalLinks: number;
    nodeTypes: Record<NodeType, number>;
    linkTypes: Record<LinkType, number>;
    avgDegree: number;
    diameter: number;
    clustering: number;
    communities: number;
}

export interface TopologyLayout {
    algorithm: LayoutAlgorithm;
    parameters: Record<string, any>;

    // Настройки отображения
    showLabels: boolean;
    showIcons: boolean;
    showMetrics: boolean;
    showAnimation: boolean;

    // Масштабирование
    zoom: number;
    minZoom: number;
    maxZoom: number;

    // Панорамирование
    pan: { x: number; y: number };

    // Выделение
    highlight: HighlightConfig;

    // Фильтрация
    nodeFilter?: string;
    linkFilter?: string;
}

export type LayoutAlgorithm =
    | 'force-directed'
    | 'hierarchical'
    | 'circular'
    | 'grid'
    | 'manual'
    | 'geographic'
    | 'layered';

export interface HighlightConfig {
    selectedColor: string;
    hoveredColor: string;
    connectedColor: string;
    fadeOpacity: number;
}

export interface TopologyFilter {
    id: string;
    name: string;
    type: 'node' | 'link' | 'both';
    field: string;
    operator: string;
    value: any;
    enabled: boolean;
}

// =============================================================================
// СЕТЕВЫЕ СЕГМЕНТЫ И ПОДСЕТИ
// =============================================================================

export interface NetworkSegment {
    id: string;
    name: string;
    description?: string;

    // Сетевая конфигурация
    cidr: string;
    network: string;
    netmask: string;
    gateway?: string;

    // VLAN
    vlan?: VLANConfiguration;

    // Тип сегмента
    type: SegmentType;
    purpose: SegmentPurpose;

    // Устройства
    devices: NetworkDevice[];
    deviceCount: number;

    // Безопасность
    securityZone: SecurityZone;
    firewallRules: FirewallRule[];

    // Мониторинг
    monitoring: SegmentMonitoring;

    // Производительность
    performance: SegmentPerformance;

    // Соответствие
    compliance: SegmentCompliance;

    // Метаданные
    tags: string[];
    labels: Record<string, string>;
    createdAt: string;
    updatedAt: string;
}

export interface NetworkSubnet {
    id: string;
    cidr: string;
    network: string;
    broadcast: string;
    netmask: string;
    wildcardMask: string;

    // Диапазоны
    firstUsable: string;
    lastUsable: string;
    totalHosts: number;
    usableHosts: number;

    // Использование
    allocatedAddresses: number;
    availableAddresses: number;
    utilizationPercent: number;

    // Конфигурация
    dhcpEnabled: boolean;
    dhcpRange?: DHCPRange;
    dnsServers: string[];

    // Сегменты
    segments: NetworkSegment[];

    // Статистика
    statistics: SubnetStatistics;
}

export type SegmentType =
    | 'physical'
    | 'virtual'
    | 'logical'
    | 'overlay'
    | 'vpn'
    | 'cloud';

export type SegmentPurpose =
    | 'production'
    | 'development'
    | 'testing'
    | 'staging'
    | 'management'
    | 'guest'
    | 'iot'
    | 'voice'
    | 'video'
    | 'storage'
    | 'backup'
    | 'dmz'
    | 'quarantine'
    | 'other';

export interface VLANConfiguration {
    id: number;
    name: string;
    description?: string;
    type: 'access' | 'trunk' | 'hybrid';

    // Настройки
    mtu?: number;
    stp?: boolean;
    pvid?: number;

    // Порты
    accessPorts: string[];
    trunkPorts: string[];

    // Безопасность
    isolation?: boolean;
    privatevlan?: boolean;
}

export type SecurityZone =
    | 'trusted'
    | 'untrusted'
    | 'dmz'
    | 'guest'
    | 'management'
    | 'quarantine'
    | 'honeypot'
    | 'restricted';

export interface FirewallRule {
    id: string;
    name: string;
    enabled: boolean;

    // Условия
    source: FirewallAddress;
    destination: FirewallAddress;
    service: FirewallService;

    // Действие
    action: 'allow' | 'deny' | 'drop' | 'reject' | 'log';

    // Приоритет
    priority: number;

    // Логирование
    logging: boolean;
    logLevel?: string;

    // Статистика
    hitCount: number;
    lastHit?: string;

    // Метаданные
    description?: string;
    tags: string[];
    createdAt: string;
    createdBy: string;
}

export interface FirewallAddress {
    type: 'any' | 'host' | 'network' | 'range' | 'group';
    value: string;
    negate?: boolean;
}

export interface FirewallService {
    type: 'any' | 'tcp' | 'udp' | 'icmp' | 'custom';
    ports?: string;
    protocol?: string;
    negate?: boolean;
}

export interface DHCPRange {
    start: string;
    end: string;
    leaseTime: number;
    options: DHCPOption[];
}

export interface DHCPOption {
    code: number;
    name: string;
    value: string;
}

export interface SegmentMonitoring {
    enabled: boolean;
    interval: number;

    // Метрики
    bandwidthUsage: boolean;
    deviceCount: boolean;
    availabilityMonitoring: boolean;
    performanceMonitoring: boolean;
    securityMonitoring: boolean;

    // Пороги
    thresholds: MonitoringThreshold[];

    // Алерты
    alerts: SegmentAlert[];
}

export interface MonitoringThreshold {
    metric: string;
    operator: '>' | '<' | '>=' | '<=' | '==' | '!=';
    value: number;
    severity: 'info' | 'warning' | 'error' | 'critical';
    duration?: number;
}

export interface SegmentAlert {
    id: string;
    type: string;
    severity: 'info' | 'warning' | 'error' | 'critical';
    message: string;
    timestamp: string;
    acknowledged: boolean;
    resolved: boolean;
}

export interface SegmentPerformance {
    // Пропускная способность
    bandwidth: BandwidthMetrics;

    // Задержка
    latency: LatencyMetrics;

    // Пакеты
    packets: PacketMetrics;

    // Ошибки
    errors: ErrorMetrics;

    // Доступность
    availability: AvailabilityMetrics;
}

export interface BandwidthMetrics {
    total: number;
    used: number;
    available: number;
    utilization: number;
    peak: number;
    average: number;
    incoming: number;
    outgoing: number;
}

export interface LatencyMetrics {
    average: number;
    minimum: number;
    maximum: number;
    jitter: number;
    percentile95: number;
    percentile99: number;
}

export interface PacketMetrics {
    total: number;
    incoming: number;
    outgoing: number;
    dropped: number;
    retransmitted: number;
    duplicated: number;
    outOfOrder: number;
}

export interface ErrorMetrics {
    total: number;
    crcErrors: number;
    framingErrors: number;
    collisions: number;
    timeouts: number;
    checksumErrors: number;
}

export interface AvailabilityMetrics {
    uptime: number;
    downtime: number;
    availability: number;
    mtbf: number; // Mean Time Between Failures
    mttr: number; // Mean Time To Repair
    incidents: number;
}

export interface SegmentCompliance {
    frameworks: ComplianceFramework[];
    status: 'compliant' | 'non-compliant' | 'partial' | 'unknown';
    score: number;
    lastAssessment: string;
    nextAssessment?: string;
    issues: ComplianceIssue[];
}

export interface ComplianceFramework {
    name: string;
    version: string;
    requirements: ComplianceRequirement[];
}

export interface ComplianceRequirement {
    id: string;
    title: string;
    description: string;
    status: 'pass' | 'fail' | 'warning' | 'not-applicable';
    evidence?: string[];
    remediation?: string;
}

export interface ComplianceIssue {
    id: string;
    title: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    remediation: string;
    dueDate?: string;
    assignee?: string;
}

export interface SubnetStatistics {
    deviceTypes: Record<DeviceType, number>;
    operatingSystems: Record<string, number>;
    services: Record<string, number>;
    vulnerabilities: Record<string, number>;
    traffic: TrafficStatistics;
}

export interface TrafficStatistics {
    totalBytes: number;
    totalPackets: number;
    topProtocols: ProtocolStatistic[];
    topTalkers: HostStatistic[];
    topApplications: ApplicationStatistic[];
}

export interface ProtocolStatistic {
    protocol: string;
    bytes: number;
    packets: number;
    percentage: number;
}

export interface HostStatistic {
    ip: string;
    hostname?: string;
    bytes: number;
    packets: number;
    connections: number;
}

export interface ApplicationStatistic {
    application: string;
    bytes: number;
    sessions: number;
    percentage: number;
}

// =============================================================================
// МОНИТОРИНГ И ПРОИЗВОДИТЕЛЬНОСТЬ
// =============================================================================

export interface PerformanceMetrics {
    // Сетевые метрики
    network: NetworkPerformance;

    // Системные метрики
    system: SystemPerformance;

    // Метрики приложений
    applications: ApplicationPerformance[];

    // Метрики безопасности
    security: SecurityMetrics;

    // Временные метки
    timestamp: string;
    collectionInterval: number;
}

export interface NetworkPerformance {
    // Основные метрики
    bandwidth: BandwidthMetrics;
    latency: LatencyMetrics;
    throughput: ThroughputMetrics;

    // Качество связи
    quality: ConnectionQuality;

    // Интерфейсы
    interfaces: InterfaceMetrics[];

    // Протоколы
    protocols: ProtocolMetrics[];
}

export interface ThroughputMetrics {
    current: number;
    average: number;
    peak: number;
    minimum: number;
    direction: 'inbound' | 'outbound' | 'bidirectional';
}

export interface ConnectionQuality {
    score: number; // 0-100
    stability: number;
    reliability: number;
    jitter: number;
    packetLoss: number;
    signalToNoise?: number;
}

export interface InterfaceMetrics {
    name: string;
    type: string;
    speed: number;
    duplex: string;
    mtu: number;

    // Статистика
    bytesIn: number;
    bytesOut: number;
    packetsIn: number;
    packetsOut: number;
    errorsIn: number;
    errorsOut: number;
    dropsIn: number;
    dropsOut: number;

    // Состояние
    operationalStatus: 'up' | 'down' | 'testing' | 'unknown' | 'dormant' | 'notPresent' | 'lowerLayerDown';
    adminStatus: 'up' | 'down' | 'testing';

    // Использование
    utilization: number;
    peakUtilization: number;
    averageUtilization: number;
}

export interface ProtocolMetrics {
    protocol: string;
    bytesIn: number;
    bytesOut: number;
    packetsIn: number;
    packetsOut: number;
    sessions: number;
    errors: number;
}

export interface SystemPerformance {
    // CPU
    cpu: CPUMetrics;

    // Память
    memory: MemoryMetrics;

    // Диск
    disk: DiskMetrics[];

    // Процессы
    processes: ProcessMetrics[];

    // Система
    uptime: number;
    loadAverage: number[];

    // Температура
    temperature?: TemperatureMetrics;
}

export interface CPUMetrics {
    usage: number;
    cores: number;
    frequency: number;
    loadAverage1: number;
    loadAverage5: number;
    loadAverage15: number;

    // По ядрам
    coreUsage: number[];

    // По типам
    user: number;
    system: number;
    idle: number;
    iowait: number;
    irq: number;
    softirq: number;
}

export interface MemoryMetrics {
    total: number;
    used: number;
    free: number;
    available: number;
    usage: number;

    // Детализация
    buffers: number;
    cached: number;
    shared: number;

    // Swap
    swapTotal: number;
    swapUsed: number;
    swapFree: number;
    swapUsage: number;
}

export interface DiskMetrics {
    device: string;
    mountPoint: string;
    fileSystem: string;

    // Размер
    total: number;
    used: number;
    free: number;
    usage: number;

    // I/O
    readOps: number;
    writeOps: number;
    readBytes: number;
    writeBytes: number;
    readTime: number;
    writeTime: number;

    // Очередь
    queueLength: number;
    utilization: number;
}

export interface ProcessMetrics {
    pid: number;
    name: string;
    status: string;
    cpuUsage: number;
    memoryUsage: number;
    memoryRSS: number;
    memoryVMS: number;
    openFiles: number;
    threads: number;
    uptime: number;
    command?: string;
    user?: string;
}

export interface TemperatureMetrics {
    cpu: number;
    gpu?: number;
    motherboard?: number;
    sensors: SensorReading[];
}

export interface SensorReading {
    name: string;
    type: 'temperature' | 'voltage' | 'fan' | 'power';
    value: number;
    unit: string;
    critical?: number;
    warning?: number;
}

export interface ApplicationPerformance {
    name: string;
    version?: string;

    // Производительность
    responseTime: number;
    throughput: number;
    errorRate: number;
    availability: number;

    // Ресурсы
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    networkUsage: number;

    // Соединения
    connections: number;
    activeConnections: number;

    // Пользователи
    activeUsers: number;
    totalSessions: number;

    // Транзакции
    transactions: number;
    transactionTime: number;

    // Ошибки
    errors: ApplicationError[];
}

export interface ApplicationError {
    timestamp: string;
    level: 'debug' | 'info' | 'warning' | 'error' | 'critical';
    message: string;
    source?: string;
    stackTrace?: string;
    count: number;
}

export interface SecurityMetrics {
    // Угрозы
    threats: ThreatMetric[];

    // Инциденты
    incidents: SecurityIncident[];

    // Аномалии
    anomalies: SecurityAnomaly[];

    // Соответствие
    compliance: SecurityCompliance;

    // Оценка риска
    riskScore: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface ThreatMetric {
    type: string;
    count: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    lastSeen: string;
    trend: 'increasing' | 'decreasing' | 'stable';
}

export interface SecurityIncident {
    id: string;
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    status: 'open' | 'investigating' | 'resolved' | 'closed';
    description: string;
    timestamp: string;
    affectedSystems: string[];
    assignee?: string;
}

export interface SecurityAnomaly {
    id: string;
    type: string;
    description: string;
    confidence: number;
    severity: 'low' | 'medium' | 'high';
    timestamp: string;
    details: Record<string, any>;
}

export interface SecurityCompliance {
    overall: number;
    frameworks: Record<string, number>;
    policies: PolicyCompliance[];
    lastAssessment: string;
}

export interface PolicyCompliance {
    policy: string;
    status: 'compliant' | 'non-compliant' | 'partial';
    score: number;
    violations: number;
}

// =============================================================================
// ДОПОЛНИТЕЛЬНЫЕ ТИПЫ
// =============================================================================

export interface ThreatIndicator {
    type: 'ip' | 'domain' | 'hash' | 'url' | 'email' | 'mutex' | 'registry';
    value: string;
    source: string;
    confidence: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    tags: string[];
    firstSeen: string;
    lastSeen: string;
    description?: string;
    references?: string[];
}

export interface DeviceLocation {
    // Физическое местоположение
    building?: string;
    floor?: string;
    room?: string;
    rack?: string;
    position?: string;

    // Географическое местоположение
    latitude?: number;
    longitude?: number;
    address?: string;
    city?: string;
    country?: string;
    timezone?: string;

    // Логическое местоположение
    datacenter?: string;
    site?: string;
    zone?: string;
    cluster?: string;
}

export interface DeviceConnection {
    targetId: string;
    type: ConnectionType;
    protocol?: string;
    port?: number;
    status: ConnectionStatus;
    bandwidth?: number;
    latency?: number;
    established?: string;
    lastSeen?: string;
}

export type ConnectionType =
    | 'ethernet'
    | 'wifi'
    | 'bluetooth'
    | 'usb'
    | 'serial'
    | 'vpn'
    | 'tunnel'
    | 'application'
    | 'dependency';

export type ConnectionStatus =
    | 'active'
    | 'inactive'
    | 'intermittent'
    | 'unknown';

export interface DeviceDependency {
    targetId: string;
    type: DependencyType;
    criticality: 'low' | 'medium' | 'high' | 'critical';
    description?: string;
}

export type DependencyType =
    | 'power'
    | 'network'
    | 'service'
    | 'data'
    | 'application'
    | 'infrastructure';

export interface MonitoringConfig {
    enabled: boolean;
    interval: number;
    timeout: number;
    retries: number;

    // Типы мониторинга
    availability: boolean;
    performance: boolean;
    security: boolean;
    configuration: boolean;

    // Методы
    snmp: SNMPConfig;
    wmi: WMIConfig;
    ssh: SSHConfig;
    api: APIConfig;

    // Пороги
    thresholds: MonitoringThreshold[];

    // Уведомления
    notifications: NotificationConfig[];
}

export interface SNMPConfig {
    enabled: boolean;
    version: '1' | '2c' | '3';
    community?: string;
    port: number;
    timeout: number;
    retries: number;

    // SNMPv3
    username?: string;
    authProtocol?: 'MD5' | 'SHA';
    authPassword?: string;
    privProtocol?: 'DES' | 'AES';
    privPassword?: string;

    // OIDs
    oids: string[];
}

export interface WMIConfig {
    enabled: boolean;
    username: string;
    password: string;
    domain?: string;
    namespace: string;
    timeout: number;
}

export interface SSHConfig {
    enabled: boolean;
    username: string;
    password?: string;
    privateKey?: string;
    port: number;
    timeout: number;
    commands: string[];
}

export interface APIConfig {
    enabled: boolean;
    baseUrl: string;
    authentication: APIAuthentication;
    endpoints: APIEndpoint[];
    timeout: number;
    retries: number;
}

export interface APIAuthentication {
    type: 'none' | 'basic' | 'bearer' | 'api_key' | 'oauth2';
    credentials: Record<string, any>;
}

export interface APIEndpoint {
    path: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    parameters?: Record<string, any>;
    headers?: Record<string, string>;
}

export interface NotificationConfig {
    event: string;
    severity: 'info' | 'warning' | 'error' | 'critical';
    channels: NotificationChannel[];
    enabled: boolean;
    throttle?: number;
}

export interface NotificationChannel {
    type: 'email' | 'sms' | 'slack' | 'webhook' | 'snmp_trap';
    config: Record<string, any>;
}

export interface ManagementInfo {
    manageable: boolean;
    protocol: 'ssh' | 'telnet' | 'snmp' | 'wmi' | 'api' | 'web' | 'none';
    credentials?: DeviceCredentials;
    access: AccessInfo;
    configuration: ConfigurationInfo;
}

export interface DeviceCredentials {
    username: string;
    password?: string;
    privateKey?: string;
    certificate?: string;

    // Дополнительные методы аутентификации
    mfa?: boolean;
    token?: string;

    // Управление учетными записями
    privileged: boolean;
    domain?: string;

    // Безопасность
    encrypted: boolean;
    rotationPolicy?: CredentialRotationPolicy;
}

export interface CredentialRotationPolicy {
    enabled: boolean;
    interval: number; // days
    complexity: boolean;
    history: number;
    notification: boolean;
}

export interface AccessInfo {
    methods: AccessMethod[];
    restrictions: AccessRestriction[];
    lastAccess?: string;
    accessCount: number;
    failedAttempts: number;
}

export interface AccessMethod {
    type: 'console' | 'ssh' | 'telnet' | 'web' | 'snmp' | 'api';
    endpoint: string;
    port?: number;
    secure: boolean;
    available: boolean;
}

export interface AccessRestriction {
    type: 'ip' | 'time' | 'user' | 'method';
    rule: string;
    active: boolean;
}

export interface ConfigurationInfo {
    backup: ConfigurationBackup;
    versioning: ConfigurationVersioning;
    compliance: ConfigurationCompliance;
    drift: ConfigurationDrift;
}

export interface ConfigurationBackup {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly' | 'on_change';
    retention: number; // days
    location: string;
    encryption: boolean;
    lastBackup?: string;
    nextBackup?: string;
    backupCount: number;
}

export interface ConfigurationVersioning {
    enabled: boolean;
    currentVersion: string;
    versions: ConfigurationVersion[];
    changeTracking: boolean;
    approvalRequired: boolean;
}

export interface ConfigurationVersion {
    version: string;
    timestamp: string;
    author: string;
    comment?: string;
    changes: ConfigurationChange[];
    size: number;
    checksum: string;
}

export interface ConfigurationChange {
    section: string;
    type: 'add' | 'modify' | 'delete';
    oldValue?: string;
    newValue?: string;
    impact: 'low' | 'medium' | 'high';
}

export interface ConfigurationCompliance {
    baseline: string;
    status: 'compliant' | 'non-compliant' | 'unknown';
    score: number;
    violations: ComplianceViolation[];
    lastCheck: string;
}

export interface ComplianceViolation {
    rule: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    remediation: string;
    autoFix: boolean;
}

export interface ConfigurationDrift {
    detected: boolean;
    severity: 'low' | 'medium' | 'high';
    changes: ConfigurationChange[];
    lastCheck: string;
    autoRemediation: boolean;
}

export interface ComplianceInfo {
    frameworks: string[];
    status: 'compliant' | 'non-compliant' | 'partial' | 'unknown';
    score: number;
    lastAssessment: string;
    nextAssessment?: string;

    // Детали по фреймворкам
    details: ComplianceDetail[];

    // Нарушения
    violations: ComplianceViolation[];

    // Исправления
    remediations: ComplianceRemediation[];
}

export interface ComplianceDetail {
    framework: string;
    version: string;
    status: 'compliant' | 'non-compliant' | 'partial';
    score: number;
    requirements: ComplianceRequirement[];
}

export interface ComplianceRemediation {
    id: string;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    effort: 'low' | 'medium' | 'high';
    automated: boolean;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    dueDate?: string;
    assignee?: string;
}

// =============================================================================
// УТИЛИТЫ И КОНСТАНТЫ
// =============================================================================

export const DEVICE_TYPES: DeviceType[] = [
    'router', 'switch', 'firewall', 'server', 'workstation', 'laptop',
    'mobile', 'tablet', 'printer', 'camera', 'phone', 'access_point',
    'nas', 'iot', 'sensor', 'controller', 'appliance', 'virtual',
    'container', 'cloud', 'unknown'
];

export const DEVICE_CATEGORIES: DeviceCategory[] = [
    'infrastructure', 'endpoint', 'security', 'storage',
    'communication', 'iot', 'virtualization', 'cloud', 'other'
];

export const PORT_STATES: PortState[] = [
    'open', 'closed', 'filtered', 'unfiltered',
    'open|filtered', 'closed|filtered'
];

export const OS_FAMILIES: OSFamily[] = [
    'Windows', 'Linux', 'macOS', 'iOS', 'Android', 'FreeBSD',
    'OpenBSD', 'NetBSD', 'Solaris', 'AIX', 'HP-UX', 'VMware',
    'Cisco_IOS', 'Juniper', 'FortiOS', 'pfSense', 'Router',
    'Embedded', 'Unknown'
];

export const COMMON_PORTS: Record<number, string> = {
    21: 'FTP',
    22: 'SSH',
    23: 'Telnet',
    25: 'SMTP',
    53: 'DNS',
    67: 'DHCP Server',
    68: 'DHCP Client',
    80: 'HTTP',
    110: 'POP3',
    135: 'RPC Endpoint Mapper',
    139: 'NetBIOS Session Service',
    143: 'IMAP',
    161: 'SNMP',
    389: 'LDAP',
    443: 'HTTPS',
    445: 'SMB',
    993: 'IMAPS',
    995: 'POP3S',
    1433: 'Microsoft SQL Server',
    1521: 'Oracle',
    3306: 'MySQL',
    3389: 'RDP',
    5432: 'PostgreSQL',
    5900: 'VNC',
    6379: 'Redis',
    8080: 'HTTP Alternate',
    27017: 'MongoDB'
};

export const PRIVATE_IP_RANGES = [
    '10.0.0.0/8',
    '172.16.0.0/12',
    '192.168.0.0/16',
    '169.254.0.0/16', // Link-local
    '127.0.0.0/8'     // Loopback
];

// Функции-утилиты
export const isValidDeviceType = (type: string): type is DeviceType => {
    return DEVICE_TYPES.includes(type as DeviceType);
};

export const isValidPortState = (state: string): state is PortState => {
    return PORT_STATES.includes(state as PortState);
};

export const isPrivateIP = (ip: string): boolean => {
    // Простая проверка для наиболее распространенных диапазонов
    return ip.startsWith('10.') ||
        ip.startsWith('192.168.') ||
        (ip.startsWith('172.') &&
            parseInt(ip.split('.')[1]) >= 16 &&
            parseInt(ip.split('.')[1]) <= 31) ||
        ip.startsWith('127.');
};

export const getDeviceIcon = (type: DeviceType): string => {
    const icons: Record<DeviceType, string> = {
        router: '🔀',
        switch: '🔗',
        firewall: '🛡️',
        server: '🖥️',
        workstation: '💻',
        laptop: '💻',
        mobile: '📱',
        tablet: '📱',
        printer: '🖨️',
        camera: '📷',
        phone: '☎️',
        access_point: '📡',
        nas: '💾',
        iot: '🌐',
        sensor: '📊',
        controller: '🎮',
        appliance: '📦',
        virtual: '☁️',
        container: '📦',
        cloud: '☁️',
        unknown: '❓'
    };
    return icons[type] || '❓';
};

export const getStatusColor = (status: DeviceStatus): string => {
    const colors: Record<DeviceStatus, string> = {
        online: '#10b981',      // green
        offline: '#ef4444',     // red
        warning: '#f59e0b',     // yellow
        critical: '#dc2626',    // dark red
        unknown: '#6b7280',     // gray
        maintenance: '#8b5cf6', // purple
        quarantine: '#f97316',  // orange
        new: '#06b6d4',         // cyan
        decommissioned: '#64748b' // slate
    };
    return colors[status] || colors.unknown;
};

export const calculateNetworkSize = (cidr: string): number => {
    const prefixLength = parseInt(cidr.split('/')[1]);
    return Math.pow(2, 32 - prefixLength);
};

export const calculateUsableHosts = (cidr: string): number => {
    const totalHosts = calculateNetworkSize(cidr);
    return totalHosts <= 2 ? 0 : totalHosts - 2; // Вычитаем network и broadcast
};

export const ipToNumber = (ip: string): number => {
    return ip.split('.').reduce((acc, octet) => acc * 256 + parseInt(octet), 0);
};

export const numberToIP = (num: number): string => {
    return [
        (num >>> 24) & 255,
        (num >>> 16) & 255,
        (num >>> 8) & 255,
        num & 255
    ].join('.');
};

export const isIPInRange = (ip: string, cidr: string): boolean => {
    const [network, prefixLength] = cidr.split('/');
    const mask = ~(Math.pow(2, 32 - parseInt(prefixLength)) - 1);

    return (ipToNumber(ip) & mask) === (ipToNumber(network) & mask);
};

// =============================================================================
// ЭКСПОРТ ПО УМОЛЧАНИЮ
// =============================================================================

export default {
    DEVICE_TYPES,
    DEVICE_CATEGORIES,
    PORT_STATES,
    OS_FAMILIES,
    COMMON_PORTS,
    PRIVATE_IP_RANGES,
    isValidDeviceType,
    isValidPortState,
    isPrivateIP,
    getDeviceIcon,
    getStatusColor,
    calculateNetworkSize,
    calculateUsableHosts,
    ipToNumber,
    numberToIP,
    isIPInRange
};
