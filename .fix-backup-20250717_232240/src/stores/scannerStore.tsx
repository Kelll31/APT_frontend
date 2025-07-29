// frontend/src/stores/scannerStore.ts

/**
 * IP Roast Enterprise - Scanner Store v3.0 ENTERPRISE
 * Centralized state management для системы сканирования с расширенными возможностями
 */

import { reactive, computed, ref, watch, nextTick } from 'vue';
import { defineStore } from 'pinia';

// ===== ТИПЫ ДАННЫХ ДЛЯ СКАНИРОВАНИЯ =====

// Статус сканирования
export type ScanStatus =
    | 'idle' | 'validating' | 'starting' | 'running' | 'paused'
    | 'stopping' | 'completed' | 'failed' | 'cancelled' | 'timeout';

// Тип сканирования
export type ScanType =
    | 'network_discovery' | 'port_scan' | 'vulnerability_scan' | 'compliance_scan'
    | 'penetration_test' | 'asset_discovery' | 'threat_hunting' | 'custom';

// Профиль сканирования
export type ScanProfile = 'quick' | 'balanced' | 'thorough' | 'stealth' | 'aggressive' | 'custom';

// Приоритет сканирования
export type ScanPriority = 'low' | 'normal' | 'high' | 'critical' | 'emergency';

// Фаза сканирования
export type ScanPhase =
    | 'initialization' | 'target_validation' | 'host_discovery' | 'port_scanning'
    | 'service_detection' | 'vulnerability_assessment' | 'compliance_check'
    | 'report_generation' | 'cleanup' | 'completed';

// Основной интерфейс сканирования
export interface Scan {
    id: string;
    title?: string;
    target: string;
    type: ScanType;
    profile: ScanProfile;
    status: ScanStatus;
    priority: ScanPriority;

    // Временные метки
    created_at: string;
    started_at?: string;
    completed_at?: string;
    last_updated: string;

    // Прогресс и состояние
    progress: number;
    phase: ScanPhase;
    phase_message?: string;
    estimated_completion?: string;
    estimated_duration?: number;
    actual_duration?: number;

    // Конфигурация сканирования
    settings: ScanSettings;
    options: ScanOptions;

    // Результаты
    results: ScanResults;
    statistics: ScanStatistics;

    // Ошибки и предупреждения
    errors: ScanError[];
    warnings: ScanWarning[];

    // Метаданные
    created_by: string;
    tenant_id?: string;
    tags: string[];
    metadata: Record<string, any>;

    // Enterprise функции
    business_context?: BusinessContext;
    compliance_frameworks?: string[];
    approval_required?: boolean;
    approval_status?: 'pending' | 'approved' | 'rejected';

    // Интеграции
    webhook_url?: string;
    notification_channels?: string[];
    report_formats?: string[];

    // Производительность
    resource_usage?: ResourceUsage;
    performance_metrics?: PerformanceMetrics;
}

// Настройки сканирования
export interface ScanSettings {
    // Основные настройки
    ports: string;
    custom_ports?: string;
    timing_template: string;
    max_retries: number;
    timeout: number;

    // Расширенные настройки
    parallel_hosts: number;
    scan_delay: number;
    host_timeout: number;
    exclude_hosts?: string;

    // Скрипты и детекция
    enable_scripts: boolean;
    custom_scripts?: string;
    version_detection: boolean;
    os_detection: boolean;

    // Режимы сканирования
    aggressive_mode: boolean;
    stealth_mode: boolean;
    no_resolve: boolean;

    // Дополнительные параметры
    extra_args?: string;
    report_format: 'html' | 'json' | 'xml' | 'pdf' | 'csv';

    // Enterprise настройки
    compliance_checks?: boolean;
    threat_intelligence?: boolean;
    vulnerability_correlation?: boolean;
    asset_discovery?: boolean;
    behavioral_analysis?: boolean;
}

// Опции сканирования
export interface ScanOptions {
    // Валидация цели
    validate_target: boolean;
    force_scan: boolean;

    // Уведомления
    notify_on_completion: boolean;
    notify_on_errors: boolean;

    // Автоматизация
    auto_generate_report: boolean;
    auto_upload_results: boolean;

    // Интеграции
    siem_integration: boolean;
    vulnerability_management: boolean;

    // Безопасность
    encrypt_results: boolean;
    anonymize_data: boolean;

    // Производительность  
    adaptive_timing: boolean;
    bandwidth_optimization: boolean;
    resource_limiting: boolean;
}

// Результаты сканирования
export interface ScanResults {
    // Основные результаты
    hosts_discovered: number;
    ports_found: number;
    services_identified: number;
    vulnerabilities_detected: number;

    // Детальные результаты
    hosts: DiscoveredHost[];
    open_ports: PortInfo[];
    services: ServiceInfo[];
    vulnerabilities: VulnerabilityInfo[];

    // Анализ безопасности
    security_score: number;
    risk_level: 'low' | 'medium' | 'high' | 'critical';
    attack_surface: AttackSurfaceAnalysis;

    // Соответствие стандартам
    compliance_results?: ComplianceResults;

    // Расширенная аналитика
    threat_landscape?: ThreatLandscape;
    asset_classification?: AssetClassification[];
    network_topology?: NetworkTopology;

    // Сводная информация
    executive_summary: string;
    key_findings: string[];
    recommendations: string[];

    // Файлы результатов
    report_files: ReportFile[];
    raw_data_files: DataFile[];
}

// Обнаруженный хост
export interface DiscoveredHost {
    ip_address: string;
    hostname?: string;
    mac_address?: string;
    status: 'up' | 'down' | 'filtered';

    // Сетевая информация
    ping_response_time?: number;
    ttl?: number;

    // Идентификация
    os_detection?: OSInfo;
    device_type?: 'server' | 'workstation' | 'router' | 'printer' | 'mobile' | 'iot' | 'unknown';
    vendor?: string;

    // Открытые порты и сервисы
    open_ports: number[];
    filtered_ports: number[];
    services: ServiceInfo[];

    // Безопасность
    vulnerabilities: VulnerabilityInfo[];
    security_score: number;
    risk_level: 'low' | 'medium' | 'high' | 'critical';

    // Классификация
    business_criticality?: 'low' | 'medium' | 'high' | 'critical';
    data_classification?: 'public' | 'internal' | 'confidential' | 'restricted';

    // Метаданные
    first_seen: string;
    last_seen: string;
    tags: string[];
}

// Информация о порте
export interface PortInfo {
    host: string;
    port: number;
    protocol: 'tcp' | 'udp';
    state: 'open' | 'closed' | 'filtered' | 'unfiltered' | 'open|filtered' | 'closed|filtered';
    service?: string;
    version?: string;
    banner?: string;
    confidence: number;

    // Безопасность
    vulnerabilities: string[];
    security_risk: 'low' | 'medium' | 'high' | 'critical';

    // Дополнительная информация
    tunnel?: string;
    method?: string;
    extra_info?: string;
}

// Информация о сервисе
export interface ServiceInfo {
    host: string;
    port: number;
    protocol: string;
    name: string;
    version?: string;
    product?: string;

    // Детали сервиса
    banner?: string;
    fingerprint?: string;
    cpe?: string;

    // Безопасность
    vulnerabilities: VulnerabilityInfo[];
    exploits: ExploitInfo[];
    misconfigurations: MisconfigurationInfo[];

    // Сертификаты (для TLS сервисов)
    ssl_certificate?: SSLCertificateInfo;

    // Метаданные
    confidence: number;
    method: string;
    last_verified: string;
}

// Информация об уязвимости
export interface VulnerabilityInfo {
    id: string;
    cve_id?: string;
    title: string;
    description: string;
    severity: 'info' | 'low' | 'medium' | 'high' | 'critical';

    // Оценка рисков
    cvss_score?: number;
    cvss_vector?: string;
    risk_score: number;
    exploitability: 'not_exploitable' | 'difficult' | 'easy' | 'functional';

    // Затронутые системы
    affected_hosts: string[];
    affected_services: string[];

    // Классификация
    category: string;
    cwe_id?: string;
    attack_vector: 'local' | 'adjacent' | 'network' | 'physical';

    // Исправление
    remediation: string;
    patch_available: boolean;
    vendor_advisory?: string;
    workaround?: string;

    // Дополнительная информация
    references: string[];
    published_date?: string;
    discovered_date: string;

    // Бизнес-контекст
    business_impact: 'low' | 'medium' | 'high' | 'critical';
    data_exposure_risk: boolean;
    compliance_impact: string[];

    // Верификация
    verified: boolean;
    false_positive_risk: number;
    verification_method?: string;
}

// Информация об эксплойте
export interface ExploitInfo {
    id: string;
    name: string;
    type: 'remote' | 'local' | 'web' | 'client';
    reliability: 'poor' | 'average' | 'good' | 'excellent';
    platform: string[];

    // Метаданные
    author?: string;
    published_date?: string;
    last_updated?: string;
    references: string[];

    // Доступность
    public_available: boolean;
    metasploit_module?: string;
    exploit_db_id?: string;
}

// Информация о неправильной конфигурации
export interface MisconfigurationInfo {
    id: string;
    title: string;
    description: string;
    severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
    category: string;

    // Детали
    current_value: string;
    recommended_value: string;
    remediation_steps: string[];

    // Соответствие стандартам
    compliance_frameworks: string[];
    control_references: string[];
}

// SSL сертификат
export interface SSLCertificateInfo {
    subject: string;
    issuer: string;
    valid_from: string;
    valid_to: string;
    serial_number: string;
    fingerprint: string;

    // Анализ безопасности
    self_signed: boolean;
    expired: boolean;
    weak_signature: boolean;
    key_size: number;

    // Альтернативные имена
    subject_alternative_names: string[];

    // Цепочка сертификатов
    certificate_chain: string[];
}

// Информация об ОС
export interface OSInfo {
    name?: string;
    version?: string;
    family: 'windows' | 'linux' | 'unix' | 'macos' | 'embedded' | 'unknown';
    architecture?: string;
    confidence: number;

    // Детали детекции
    fingerprints: string[];
    tcp_sequence?: string;
    ip_id_sequence?: string;

    // Дополнительная информация
    device_type?: string;
    vendor?: string;
    cpe?: string;
}

// Анализ поверхности атаки
export interface AttackSurfaceAnalysis {
    total_exposed_services: number;
    critical_exposures: number;
    internet_facing_services: number;
    legacy_systems: number;

    // Категории рисков
    network_risks: AttackVector[];
    service_risks: AttackVector[];
    configuration_risks: AttackVector[];

    // Рекомендации по снижению рисков
    mitigation_priorities: MitigationPriority[];
}

// Вектор атаки
export interface AttackVector {
    vector: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    likelihood: 'low' | 'medium' | 'high';
    impact: 'low' | 'medium' | 'high' | 'critical';
    affected_assets: string[];
    mitigation_steps: string[];
}

// Приоритет митигации
export interface MitigationPriority {
    action: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    effort: 'low' | 'medium' | 'high';
    impact: 'low' | 'medium' | 'high';
    timeline: string;
    responsible_team?: string;
}

// Результаты соответствия
export interface ComplianceResults {
    frameworks: ComplianceFramework[];
    overall_score: number;
    compliance_gaps: ComplianceGap[];
    remediation_plan: RemediationItem[];
}

// Framework соответствия
export interface ComplianceFramework {
    name: string;
    version: string;
    score: number;
    status: 'compliant' | 'non_compliant' | 'partially_compliant';
    controls_tested: number;
    controls_passed: number;
    controls_failed: number;

    // Детали контролей
    control_results: ControlResult[];
}

// Результат контроля
export interface ControlResult {
    control_id: string;
    control_name: string;
    status: 'pass' | 'fail' | 'warning' | 'not_applicable';
    evidence: string[];
    remediation_notes?: string;
}

// Пробел в соответствии
export interface ComplianceGap {
    framework: string;
    control_id: string;
    gap_description: string;
    risk_level: 'low' | 'medium' | 'high' | 'critical';
    remediation_required: string;
    estimated_effort: string;
}

// Элемент исправления
export interface RemediationItem {
    item_id: string;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    effort: 'low' | 'medium' | 'high';
    timeline: string;
    responsible_team: string;
    dependencies: string[];
}

// Ландшафт угроз
export interface ThreatLandscape {
    active_threats: ThreatIndicator[];
    threat_actors: ThreatActor[];
    attack_patterns: AttackPattern[];
    iocs: IOCInfo[];
    threat_intelligence_sources: string[];
}

// Индикатор угрозы
export interface ThreatIndicator {
    type: 'ip' | 'domain' | 'hash' | 'signature';
    value: string;
    confidence: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    source: string;
    first_seen: string;
    last_seen: string;
    context: string;
}

// Актор угрозы
export interface ThreatActor {
    name: string;
    aliases: string[];
    motivation: string[];
    sophistication: 'low' | 'medium' | 'high' | 'expert';
    target_sectors: string[];
    ttps: string[];
    attribution_confidence: number;
}

// Паттерн атаки
export interface AttackPattern {
    pattern_id: string;
    name: string;
    description: string;
    kill_chain_phases: string[];
    techniques: string[];
    mitigations: string[];
}

// Информация об IOC
export interface IOCInfo {
    indicator: string;
    type: string;
    malware_families: string[];
    campaigns: string[];
    confidence: number;
    last_seen: string;
}

// Классификация активов
export interface AssetClassification {
    host: string;
    asset_type: 'server' | 'workstation' | 'network_device' | 'mobile' | 'iot' | 'unknown';
    business_function: string;
    criticality: 'low' | 'medium' | 'high' | 'critical';
    data_classification: 'public' | 'internal' | 'confidential' | 'restricted';
    compliance_scope: string[];
    owner: string;
    location: string;
}

// Топология сети
export interface NetworkTopology {
    subnets: SubnetInfo[];
    vlans: VLANInfo[];
    routing_information: RoutingInfo[];
    security_zones: SecurityZone[];
}

// Информация о подсети
export interface SubnetInfo {
    network: string;
    mask: string;
    gateway?: string;
    hosts_count: number;
    active_hosts: number;
    vlan_id?: number;
}

// Информация о VLAN
export interface VLANInfo {
    vlan_id: number;
    name?: string;
    description?: string;
    hosts: string[];
    security_level: 'public' | 'dmz' | 'internal' | 'secure';
}

// Информация о маршрутизации
export interface RoutingInfo {
    destination: string;
    gateway: string;
    interface: string;
    metric: number;
}

// Зона безопасности
export interface SecurityZone {
    name: string;
    description: string;
    security_level: 'public' | 'dmz' | 'internal' | 'secure' | 'restricted';
    subnets: string[];
    access_controls: string[];
}

// Файл отчета
export interface ReportFile {
    filename: string;
    format: string;
    size: number;
    path: string;
    generated_at: string;
    checksum: string;
}

// Файл данных
export interface DataFile {
    filename: string;
    type: 'raw' | 'processed' | 'logs';
    format: string;
    size: number;
    path: string;
    compressed: boolean;
}

// Статистика сканирования
export interface ScanStatistics {
    // Временные метрики
    total_time: number;
    discovery_time: number;
    scanning_time: number;
    analysis_time: number;

    // Производительность
    hosts_per_second: number;
    ports_per_second: number;
    packets_sent: number;
    packets_received: number;

    // Покрытие
    targets_scanned: number;
    targets_responsive: number;
    coverage_percentage: number;

    // Результаты
    findings_count: number;
    critical_findings: number;
    high_findings: number;
    medium_findings: number;
    low_findings: number;

    // Качество
    false_positive_rate: number;
    confidence_score: number;
    accuracy_metrics: AccuracyMetrics;
}

// Метрики точности
export interface AccuracyMetrics {
    precision: number;
    recall: number;
    f1_score: number;
    detection_rate: number;
}

// Ошибка сканирования
export interface ScanError {
    id: string;
    type: 'network' | 'target' | 'configuration' | 'system' | 'permission';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    details?: string;
    timestamp: string;
    context?: Record<string, any>;
    resolution_suggestions?: string[];
}

// Предупреждение сканирования
export interface ScanWarning {
    id: string;
    type: 'performance' | 'coverage' | 'configuration' | 'security';
    message: string;
    details?: string;
    timestamp: string;
    impact: 'low' | 'medium' | 'high';
    recommendations?: string[];
}

// Бизнес-контекст
export interface BusinessContext {
    organization: string;
    department: string;
    project?: string;
    cost_center?: string;
    business_owner: string;
    technical_contact: string;
    criticality: 'low' | 'medium' | 'high' | 'critical';
    compliance_requirements: string[];
    data_classification: 'public' | 'internal' | 'confidential' | 'restricted';
    maintenance_window?: string;
}

// Использование ресурсов
export interface ResourceUsage {
    cpu_percent: number;
    memory_mb: number;
    network_bandwidth_mbps: number;
    disk_io_ops: number;
    max_concurrent_connections: number;
    threads_used: number;
}

// Метрики производительности
export interface PerformanceMetrics {
    response_times: ResponseTimeMetrics;
    throughput_metrics: ThroughputMetrics;
    resource_efficiency: ResourceEfficiency;
    scalability_metrics: ScalabilityMetrics;
}

// Метрики времени отклика
export interface ResponseTimeMetrics {
    average_response_time: number;
    min_response_time: number;
    max_response_time: number;
    percentile_95: number;
    percentile_99: number;
}

// Метрики пропускной способности
export interface ThroughputMetrics {
    requests_per_second: number;
    data_processed_mb: number;
    concurrent_connections: number;
    queue_length: number;
}

// Эффективность ресурсов
export interface ResourceEfficiency {
    cpu_efficiency: number;
    memory_efficiency: number;
    network_efficiency: number;
    overall_efficiency: number;
}

// Метрики масштабируемости
export interface ScalabilityMetrics {
    max_targets_handled: number;
    degradation_point: number;
    linear_scalability_factor: number;
    bottleneck_components: string[];
}

// Профиль сканирования
export interface ScanProfileDefinition {
    id: ScanProfile;
    name: string;
    description: string;
    icon: string;
    recommended: boolean;

    // Настройки по умолчанию
    default_settings: ScanSettings;
    locked_settings: string[];

    // Метаданные профиля
    use_cases: string[];
    warnings: string[];
    estimated_duration: string;
    resource_requirements: 'low' | 'medium' | 'high';

    // Ограничения
    max_hosts?: number;
    max_ports?: number;
    timeout_multiplier: number;
}

// Валидация цели
export interface TargetValidation {
    target: string;
    valid: boolean;
    status: 'online' | 'offline' | 'filtered' | 'unknown';
    message: string;

    // Детали валидации
    response_time?: number;
    resolved_ip?: string;
    hostname?: string;
    open_ports?: number[];
    detected_services?: string[];

    // Метаданные
    validated_at: string;
    validation_method: string;
    confidence: number;

    // Предупреждения
    warnings?: string[];
    recommendations?: string[];
}

// Шаблон сканирования
export interface ScanTemplate {
    id: string;
    name: string;
    description: string;
    type: ScanType;
    profile: ScanProfile;

    // Настройки шаблона
    settings: ScanSettings;
    options: ScanOptions;

    // Метаданные
    created_by: string;
    created_at: string;
    updated_at: string;
    usage_count: number;

    // Права доступа
    is_public: boolean;
    shared_with: string[];

    // Категоризация
    tags: string[];
    category: string;
    compliance_frameworks: string[];
}

// Очередь сканирования
export interface ScanQueue {
    id: string;
    name: string;
    description?: string;
    priority: ScanPriority;

    // Настройки очереди
    max_concurrent_scans: number;
    auto_start: boolean;

    // Статистика
    total_scans: number;
    pending_scans: number;
    running_scans: number;
    completed_scans: number;
    failed_scans: number;

    // Управление
    is_active: boolean;
    created_at: string;
    last_processed: string;
}

// Планировщик сканирования
export interface ScanSchedule {
    id: string;
    name: string;
    description?: string;

    // Настройки расписания
    scan_template_id: string;
    target_list: string[];
    cron_expression: string;
    timezone: string;

    // Состояние
    is_active: boolean;
    next_run: string;
    last_run?: string;

    // История выполнения
    execution_history: ScheduleExecution[];

    // Настройки уведомлений
    notification_settings: NotificationSettings;
}

// Выполнение расписания
export interface ScheduleExecution {
    execution_id: string;
    scheduled_time: string;
    actual_time: string;
    scan_id?: string;
    status: 'success' | 'failed' | 'skipped';
    error_message?: string;
    duration?: number;
}

// Настройки уведомлений
export interface NotificationSettings {
    on_completion: boolean;
    on_failure: boolean;
    on_critical_findings: boolean;
    channels: NotificationChannel[];
    custom_recipients?: string[];
}

// Канал уведомлений
export interface NotificationChannel {
    type: 'email' | 'slack' | 'webhook' | 'sms';
    configuration: Record<string, any>;
    enabled: boolean;
}

// Фильтры сканирования
export interface ScanFilters {
    status?: ScanStatus[];
    type?: ScanType[];
    profile?: ScanProfile[];
    priority?: ScanPriority[];
    created_by?: string[];
    date_from?: string;
    date_to?: string;
    target_pattern?: string;
    tags?: string[];
    has_errors?: boolean;
    has_findings?: boolean;
    compliance_frameworks?: string[];
}

// Статистика сканнера
export interface ScannerStatistics {
    // Общие счетчики
    total_scans: number;
    active_scans: number;
    completed_scans: number;
    failed_scans: number;

    // Счетчики по периодам
    scans_today: number;
    scans_this_week: number;
    scans_this_month: number;

    // Производительность
    average_scan_duration: number;
    success_rate: number;
    throughput_per_hour: number;

    // Находки
    total_vulnerabilities: number;
    critical_vulnerabilities: number;
    total_hosts_discovered: number;
    total_services_identified: number;

    // Ресурсы
    cpu_usage_average: number;
    memory_usage_average: number;
    network_usage_average: number;

    // Топ списки
    most_scanned_targets: Array<{ target: string; count: number }>;
    most_used_profiles: Array<{ profile: ScanProfile; count: number }>;
    most_common_vulnerabilities: Array<{ vulnerability: string; count: number }>;
}

// ===== ОСНОВНОЕ ХРАНИЛИЩЕ СКАНЕРА =====

export const useScannerStore = defineStore('scanner', () => {
    // ===== СОСТОЯНИЕ =====

    // Активные сканирования
    const activeScans = ref<Map<string, Scan>>(new Map());

    // История сканирований
    const scanHistory = ref<Map<string, Scan>>(new Map());

    // Текущее выбранное сканирование
    const currentScanId = ref<string | null>(null);

    // Профили сканирования
    const scanProfiles = ref<Map<ScanProfile, ScanProfileDefinition>>(new Map());

    // Шаблоны сканирования
    const scanTemplates = ref<Map<string, ScanTemplate>>(new Map());

    // Очереди сканирования
    const scanQueues = ref<Map<string, ScanQueue>>(new Map());

    // Расписания сканирования
    const scanSchedules = ref<Map<string, ScanSchedule>>(new Map());

    // Настройки по умолчанию
    const defaultSettings = ref<ScanSettings>({
        ports: 'common',
        timing_template: '3',
        max_retries: 2,
        timeout: 30000,
        parallel_hosts: 10,
        scan_delay: 0,
        host_timeout: 30000,
        enable_scripts: true,
        version_detection: true,
        os_detection: false,
        aggressive_mode: false,
        stealth_mode: false,
        no_resolve: false,
        report_format: 'html',
        compliance_checks: false,
        threat_intelligence: false,
        vulnerability_correlation: true,
        asset_discovery: true,
        behavioral_analysis: false
    });

    // Опции по умолчанию
    const defaultOptions = ref<ScanOptions>({
        validate_target: true,
        force_scan: false,
        notify_on_completion: true,
        notify_on_errors: true,
        auto_generate_report: true,
        auto_upload_results: false,
        siem_integration: false,
        vulnerability_management: false,
        encrypt_results: false,
        anonymize_data: false,
        adaptive_timing: true,
        bandwidth_optimization: true,
        resource_limiting: true
    });

    // Фильтры
    const filters = ref<ScanFilters>({});

    // UI состояние
    const isScanning = ref(false);
    const isValidating = ref(false);
    const selectedProfile = ref<ScanProfile>('balanced');
    const showAdvancedSettings = ref(false);

    // Валидация целей
    const targetValidations = ref<Map<string, TargetValidation>>(new Map());

    // Статистика
    const statistics = ref<ScannerStatistics>({
        total_scans: 0,
        active_scans: 0,
        completed_scans: 0,
        failed_scans: 0,
        scans_today: 0,
        scans_this_week: 0,
        scans_this_month: 0,
        average_scan_duration: 0,
        success_rate: 0,
        throughput_per_hour: 0,
        total_vulnerabilities: 0,
        critical_vulnerabilities: 0,
        total_hosts_discovered: 0,
        total_services_identified: 0,
        cpu_usage_average: 0,
        memory_usage_average: 0,
        network_usage_average: 0,
        most_scanned_targets: [],
        most_used_profiles: [],
        most_common_vulnerabilities: []
    });

    // WebSocket подключение
    const wsConnected = ref(false);
    const wsReconnecting = ref(false);

    // Таймеры и интервалы
    const updateTimers = ref<Map<string, NodeJS.Timeout>>(new Map());
    const cleanupInterval = ref<NodeJS.Timeout | null>(null);

    // ===== COMPUTED СВОЙСТВА =====

    // Отфильтрованные сканирования
    const filteredScans = computed(() => {
        let scans = Array.from(activeScans.value.values());

        // Применяем фильтры
        if (filters.value.status?.length) {
            scans = scans.filter(scan => filters.value.status!.includes(scan.status));
        }

        if (filters.value.type?.length) {
            scans = scans.filter(scan => filters.value.type!.includes(scan.type));
        }

        if (filters.value.profile?.length) {
            scans = scans.filter(scan => filters.value.profile!.includes(scan.profile));
        }

        if (filters.value.priority?.length) {
            scans = scans.filter(scan => filters.value.priority!.includes(scan.priority));
        }

        if (filters.value.created_by?.length) {
            scans = scans.filter(scan => filters.value.created_by!.includes(scan.created_by));
        }

        if (filters.value.target_pattern) {
            const pattern = filters.value.target_pattern.toLowerCase();
            scans = scans.filter(scan => scan.target.toLowerCase().includes(pattern));
        }

        if (filters.value.tags?.length) {
            scans = scans.filter(scan =>
                filters.value.tags!.some(tag => scan.tags.includes(tag))
            );
        }

        if (filters.value.has_errors !== undefined) {
            scans = scans.filter(scan =>
                (scan.errors.length > 0) === filters.value.has_errors
            );
        }

        if (filters.value.has_findings !== undefined) {
            scans = scans.filter(scan =>
                (scan.results.vulnerabilities_detected > 0) === filters.value.has_findings
            );
        }

        if (filters.value.date_from) {
            const fromDate = new Date(filters.value.date_from);
            scans = scans.filter(scan => new Date(scan.created_at) >= fromDate);
        }

        if (filters.value.date_to) {
            const toDate = new Date(filters.value.date_to);
            scans = scans.filter(scan => new Date(scan.created_at) <= toDate);
        }

        return scans.sort((a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
    });

    // Текущее сканирование
    const currentScan = computed(() => {
        return currentScanId.value ? activeScans.value.get(currentScanId.value) : null;
    });

    // Активные сканирования по статусу
    const scansByStatus = computed(() => {
        const result: Record<ScanStatus, Scan[]> = {
            idle: [],
            validating: [],
            starting: [],
            running: [],
            paused: [],
            stopping: [],
            completed: [],
            failed: [],
            cancelled: [],
            timeout: []
        };

        Array.from(activeScans.value.values()).forEach(scan => {
            if (result[scan.status]) {
                result[scan.status].push(scan);
            }
        });

        return result;
    });

    // Запущенные сканирования
    const runningScan = computed(() => {
        return Array.from(activeScans.value.values()).find(scan =>
            ['validating', 'starting', 'running'].includes(scan.status)
        );
    });

    // Недавние сканирования
    const recentScans = computed(() => {
        const allScans = [...Array.from(activeScans.value.values()), ...Array.from(scanHistory.value.values())];
        return allScans
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 10);
    });

    // Сканирования с критическими находками
    const criticalFindings = computed(() => {
        return Array.from(activeScans.value.values()).filter(scan =>
            scan.results.vulnerabilities.some(vuln => vuln.severity === 'critical')
        );
    });

    // Доступные профили
    const availableProfiles = computed(() => {
        return Array.from(scanProfiles.value.values())
            .sort((a, b) => a.name.localeCompare(b.name));
    });

    // Активные очереди
    const activeQueues = computed(() => {
        return Array.from(scanQueues.value.values())
            .filter(queue => queue.is_active)
            .sort((a, b) => a.priority.localeCompare(b.priority));
    });

    // ===== ДЕЙСТВИЯ =====

    /**
     * Создание нового сканирования
     */
    async function createScan(
        target: string,
        type: ScanType = 'port_scan',
        profile: ScanProfile = 'balanced',
        customSettings?: Partial<ScanSettings>,
        customOptions?: Partial<ScanOptions>
    ): Promise<string> {
        if (!target.trim()) {
            throw new Error('Target is required');
        }

        const scanId = generateScanId();
        const now = new Date().toISOString();

        // Получаем профиль
        const profileDef = scanProfiles.value.get(profile);
        if (!profileDef) {
            throw new Error(`Unknown profile: ${profile}`);
        }

        // Создаем сканирование
        const scan: Scan = {
            id: scanId,
            target: target.trim(),
            type,
            profile,
            status: 'idle',
            priority: 'normal',
            created_at: now,
            last_updated: now,
            progress: 0,
            phase: 'initialization',
            settings: { ...profileDef.default_settings, ...customSettings },
            options: { ...defaultOptions.value, ...customOptions },
            results: createEmptyResults(),
            statistics: createEmptyStatistics(),
            errors: [],
            warnings: [],
            created_by: getCurrentUser(),
            tags: [],
            metadata: {}
        };

        // Добавляем в активные сканирования
        activeScans.value.set(scanId, scan);

        // Обновляем статистику
        updateStatistics();

        console.log(`📋 Создано сканирование: ${scanId}`);
        return scanId;
    }

    /**
     * Запуск сканирования
     */
    async function startScan(scanId: string): Promise<void> {
        const scan = activeScans.value.get(scanId);
        if (!scan) {
            throw new Error(`Scan not found: ${scanId}`);
        }

        if (scan.status !== 'idle') {
            throw new Error(`Cannot start scan in status: ${scan.status}`);
        }

        try {
            console.log(`🚀 Запуск сканирования: ${scanId}`);

            // Обновляем статус
            updateScanStatus(scanId, 'starting', 'Инициализация сканирования...');

            // Валидируем цель если нужно
            if (scan.options.validate_target) {
                updateScanStatus(scanId, 'validating', 'Валидация цели...');
                const validation = await validateTarget(scan.target);

                if (!validation.valid && !scan.options.force_scan) {
                    throw new Error(`Target validation failed: ${validation.message}`);
                }

                if (validation.warnings?.length) {
                    scan.warnings.push(...validation.warnings.map(warning => ({
                        id: generateId(),
                        type: 'configuration' as const,
                        message: warning,
                        timestamp: new Date().toISOString(),
                        impact: 'medium' as const
                    })));
                }
            }

            // Отправляем запрос на запуск через API
            const response = await sendScanRequest(scan);

            // Обновляем сканирование с данными ответа
            scan.started_at = new Date().toISOString();
            scan.last_updated = scan.started_at;
            updateScanStatus(scanId, 'running', 'Сканирование выполняется...');

            // Подключаемся к WebSocket комнате для получения обновлений
            if (wsConnected.value) {
                await subscribeToScanUpdates(scanId);
            }

            // Запускаем таймер обновления
            startScanTimer(scanId);

            // Обновляем глобальное состояние
            isScanning.value = true;
            currentScanId.value = scanId;

            console.log(`✅ Сканирование запущено: ${scanId}`);

        } catch (error) {
            console.error(`❌ Ошибка запуска сканирования ${scanId}:`, error);
            updateScanStatus(scanId, 'failed', `Ошибка запуска: ${error.message}`);

            // Добавляем ошибку
            scan.errors.push({
                id: generateId(),
                type: 'system',
                severity: 'critical',
                message: error.message,
                timestamp: new Date().toISOString()
            });

            throw error;
        }
    }

    /**
     * Остановка сканирования
     */
    async function stopScan(scanId: string): Promise<void> {
        const scan = activeScans.value.get(scanId);
        if (!scan) {
            throw new Error(`Scan not found: ${scanId}`);
        }

        if (!['running', 'paused'].includes(scan.status)) {
            throw new Error(`Cannot stop scan in status: ${scan.status}`);
        }

        try {
            console.log(`🛑 Остановка сканирования: ${scanId}`);

            updateScanStatus(scanId, 'stopping', 'Остановка сканирования...');

            // Отправляем запрос на остановку
            await sendStopRequest(scanId);

            // Очищаем таймер
            clearScanTimer(scanId);

            // Отключаемся от обновлений
            await unsubscribeFromScanUpdates(scanId);

            updateScanStatus(scanId, 'cancelled', 'Сканирование остановлено пользователем');

            // Обновляем глобальное состояние
            if (currentScanId.value === scanId) {
                isScanning.value = false;
                currentScanId.value = null;
            }

            console.log(`✅ Сканирование остановлено: ${scanId}`);

        } catch (error) {
            console.error(`❌ Ошибка остановки сканирования ${scanId}:`, error);

            scan.errors.push({
                id: generateId(),
                type: 'system',
                severity: 'high',
                message: `Ошибка остановки: ${error.message}`,
                timestamp: new Date().toISOString()
            });

            throw error;
        }
    }

    /**
     * Пауза сканирования
     */
    async function pauseScan(scanId: string): Promise<void> {
        const scan = activeScans.value.get(scanId);
        if (!scan) {
            throw new Error(`Scan not found: ${scanId}`);
        }

        if (scan.status !== 'running') {
            throw new Error(`Cannot pause scan in status: ${scan.status}`);
        }

        try {
            await sendPauseRequest(scanId);
            updateScanStatus(scanId, 'paused', 'Сканирование приостановлено');
            console.log(`⏸️ Сканирование приостановлено: ${scanId}`);
        } catch (error) {
            console.error(`❌ Ошибка приостановки сканирования ${scanId}:`, error);
            throw error;
        }
    }

    /**
     * Возобновление сканирования
     */
    async function resumeScan(scanId: string): Promise<void> {
        const scan = activeScans.value.get(scanId);
        if (!scan) {
            throw new Error(`Scan not found: ${scanId}`);
        }

        if (scan.status !== 'paused') {
            throw new Error(`Cannot resume scan in status: ${scan.status}`);
        }

        try {
            await sendResumeRequest(scanId);
            updateScanStatus(scanId, 'running', 'Сканирование возобновлено');
            console.log(`▶️ Сканирование возобновлено: ${scanId}`);
        } catch (error) {
            console.error(`❌ Ошибка возобновления сканирования ${scanId}:`, error);
            throw error;
        }
    }

    /**
     * Удаление сканирования
     */
    async function deleteScan(scanId: string, moveToHistory = true): Promise<void> {
        const scan = activeScans.value.get(scanId);
        if (!scan) {
            throw new Error(`Scan not found: ${scanId}`);
        }

        // Останавливаем сканирование если оно активно
        if (['running', 'paused'].includes(scan.status)) {
            await stopScan(scanId);
        }

        try {
            // Отправляем запрос на удаление
            await sendDeleteRequest(scanId);

            // Перемещаем в историю или удаляем
            if (moveToHistory) {
                scanHistory.value.set(scanId, scan);
            }

            // Удаляем из активных
            activeScans.value.delete(scanId);

            // Очищаем таймеры
            clearScanTimer(scanId);

            // Обновляем текущее сканирование
            if (currentScanId.value === scanId) {
                currentScanId.value = null;
                isScanning.value = false;
            }

            console.log(`🗑️ Сканирование удалено: ${scanId}`);

        } catch (error) {
            console.error(`❌ Ошибка удаления сканирования ${scanId}:`, error);
            throw error;
        }
    }

    /**
     * Валидация цели
     */
    async function validateTarget(target: string, force = false): Promise<TargetValidation> {
        if (!target.trim()) {
            throw new Error('Target is required');
        }

        const normalizedTarget = target.trim();

        // Проверяем кэш если не форсируем
        if (!force && targetValidations.value.has(normalizedTarget)) {
            const cached = targetValidations.value.get(normalizedTarget)!;
            // Кэш действителен 5 минут
            if (Date.now() - new Date(cached.validated_at).getTime() < 300000) {
                return cached;
            }
        }

        try {
            isValidating.value = true;
            console.log(`🔍 Валидация цели: ${normalizedTarget}`);

            const response = await sendValidationRequest(normalizedTarget, force);

            const validation: TargetValidation = {
                target: normalizedTarget,
                valid: response.valid,
                status: response.status,
                message: response.message,
                response_time: response.response_time,
                resolved_ip: response.resolved_ip,
                hostname: response.hostname,
                open_ports: response.open_ports,
                detected_services: response.detected_services,
                validated_at: new Date().toISOString(),
                validation_method: response.validation_method || 'ping',
                confidence: response.confidence || 0.8,
                warnings: response.warnings,
                recommendations: response.recommendations
            };

            // Сохраняем в кэш
            targetValidations.value.set(normalizedTarget, validation);

            console.log(`✅ Валидация завершена: ${normalizedTarget} - ${validation.valid ? 'валидна' : 'невалидна'}`);
            return validation;

        } catch (error) {
            console.error(`❌ Ошибка валидации цели ${normalizedTarget}:`, error);

            const validation: TargetValidation = {
                target: normalizedTarget,
                valid: false,
                status: 'unknown',
                message: `Ошибка валидации: ${error.message}`,
                validated_at: new Date().toISOString(),
                validation_method: 'error',
                confidence: 0
            };

            targetValidations.value.set(normalizedTarget, validation);
            return validation;

        } finally {
            isValidating.value = false;
        }
    }

    /**
     * Обновление прогресса сканирования
     */
    function updateScanProgress(scanId: string, progress: number, phase?: ScanPhase, message?: string): void {
        const scan = activeScans.value.get(scanId);
        if (!scan) return;

        scan.progress = Math.max(0, Math.min(100, progress));
        scan.last_updated = new Date().toISOString();

        if (phase) {
            scan.phase = phase;
        }

        if (message) {
            scan.phase_message = message;
        }

        // Обновляем расчетное время завершения
        if (scan.progress > 0 && scan.started_at) {
            const elapsed = Date.now() - new Date(scan.started_at).getTime();
            const estimated = (elapsed / scan.progress) * (100 - scan.progress);
            scan.estimated_completion = new Date(Date.now() + estimated).toISOString();
        }

        console.log(`📊 Обновлен прогресс сканирования ${scanId}: ${progress}% (${phase || scan.phase})`);
    }

    /**
     * Обновление результатов сканирования
     */
    function updateScanResults(scanId: string, results: Partial<ScanResults>): void {
        const scan = activeScans.value.get(scanId);
        if (!scan) return;

        // Объединяем результаты
        scan.results = { ...scan.results, ...results };
        scan.last_updated = new Date().toISOString();

        // Обновляем статистику
        if (results.hosts_discovered !== undefined) {
            scan.statistics.targets_responsive = results.hosts_discovered;
        }

        if (results.vulnerabilities_detected !== undefined) {
            scan.statistics.findings_count = results.vulnerabilities_detected;

            // Подсчитываем критические находки
            if (results.vulnerabilities) {
                scan.statistics.critical_findings = results.vulnerabilities.filter(v => v.severity === 'critical').length;
                scan.statistics.high_findings = results.vulnerabilities.filter(v => v.severity === 'high').length;
                scan.statistics.medium_findings = results.vulnerabilities.filter(v => v.severity === 'medium').length;
                scan.statistics.low_findings = results.vulnerabilities.filter(v => v.severity === 'low').length;
            }
        }

        console.log(`📈 Обновлены результаты сканирования ${scanId}`);
    }

    /**
     * Завершение сканирования
     */
    function completeScan(scanId: string, finalResults?: Partial<ScanResults>): void {
        const scan = activeScans.value.get(scanId);
        if (!scan) return;

        try {
            // Обновляем финальные результаты
            if (finalResults) {
                updateScanResults(scanId, finalResults);
            }

            // Обновляем статус и временные метки
            scan.status = 'completed';
            scan.progress = 100;
            scan.phase = 'completed';
            scan.completed_at = new Date().toISOString();
            scan.last_updated = scan.completed_at;

            // Рассчитываем продолжительность
            if (scan.started_at) {
                scan.actual_duration = new Date(scan.completed_at).getTime() - new Date(scan.started_at).getTime();
            }

            // Очищаем таймеры
            clearScanTimer(scanId);

            // Отключаемся от обновлений
            unsubscribeFromScanUpdates(scanId);

            // Обновляем глобальное состояние
            if (currentScanId.value === scanId) {
                isScanning.value = false;
            }

            // Автогенерация отчета если включена
            if (scan.options.auto_generate_report) {
                generateScanReport(scanId).catch(error => {
                    console.error(`❌ Ошибка автогенерации отчета для ${scanId}:`, error);
                });
            }

            // Обновляем статистику
            updateStatistics();

            console.log(`✅ Сканирование завершено: ${scanId}`);

        } catch (error) {
            console.error(`❌ Ошибка завершения сканирования ${scanId}:`, error);
        }
    }

    /**
     * Установка фильтров
     */
    function setFilters(newFilters: Partial<ScanFilters>): void {
        filters.value = { ...filters.value, ...newFilters };
    }

    /**
     * Очистка фильтров
     */
    function clearFilters(): void {
        filters.value = {};
    }

    /**
     * Создание шаблона из сканирования
     */
    async function createTemplateFromScan(scanId: string, templateName: string, description?: string): Promise<string> {
        const scan = activeScans.value.get(scanId);
        if (!scan) {
            throw new Error(`Scan not found: ${scanId}`);
        }

        const templateId = generateId();
        const template: ScanTemplate = {
            id: templateId,
            name: templateName,
            description: description || `Шаблон создан из сканирования ${scanId}`,
            type: scan.type,
            profile: scan.profile,
            settings: { ...scan.settings },
            options: { ...scan.options },
            created_by: getCurrentUser(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            usage_count: 0,
            is_public: false,
            shared_with: [],
            tags: [...scan.tags],
            category: 'custom',
            compliance_frameworks: scan.compliance_frameworks || []
        };

        scanTemplates.value.set(templateId, template);

        console.log(`📋 Создан шаблон ${templateId} из сканирования ${scanId}`);
        return templateId;
    }

    /**
     * Генерация отчета сканирования
     */
    async function generateScanReport(scanId: string, format = 'html'): Promise<string> {
        const scan = activeScans.value.get(scanId);
        if (!scan) {
            throw new Error(`Scan not found: ${scanId}`);
        }

        try {
            console.log(`📄 Генерация отчета для сканирования ${scanId} в формате ${format}`);

            const response = await sendReportRequest(scanId, format);

            // Добавляем файл отчета к результатам
            const reportFile: ReportFile = {
                filename: response.filename,
                format: format,
                size: response.size,
                path: response.path,
                generated_at: new Date().toISOString(),
                checksum: response.checksum
            };

            scan.results.report_files.push(reportFile);

            console.log(`✅ Отчет сгенерирован: ${response.filename}`);
            return response.path;

        } catch (error) {
            console.error(`❌ Ошибка генерации отчета для ${scanId}:`, error);
            throw error;
        }
    }

    /**
     * Обновление статистики
     */
    function updateStatistics(): void {
        const allScans = Array.from(activeScans.value.values());

        statistics.value.total_scans = allScans.length;
        statistics.value.active_scans = allScans.filter(s => ['running', 'starting', 'validating'].includes(s.status)).length;
        statistics.value.completed_scans = allScans.filter(s => s.status === 'completed').length;
        statistics.value.failed_scans = allScans.filter(s => s.status === 'failed').length;

        // Статистика по периодам
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        statistics.value.scans_today = allScans.filter(s => new Date(s.created_at) >= today).length;
        statistics.value.scans_this_week = allScans.filter(s => new Date(s.created_at) >= thisWeek).length;
        statistics.value.scans_this_month = allScans.filter(s => new Date(s.created_at) >= thisMonth).length;

        // Средняя продолжительность
        const completedScans = allScans.filter(s => s.status === 'completed' && s.actual_duration);
        if (completedScans.length > 0) {
            const totalDuration = completedScans.reduce((sum, s) => sum + (s.actual_duration || 0), 0);
            statistics.value.average_scan_duration = totalDuration / completedScans.length;
        }

        // Коэффициент успешности
        const finishedScans = allScans.filter(s => ['completed', 'failed'].includes(s.status));
        if (finishedScans.length > 0) {
            statistics.value.success_rate = (statistics.value.completed_scans / finishedScans.length) * 100;
        }

        // Общая статистика находок
        statistics.value.total_vulnerabilities = allScans.reduce((sum, s) => sum + s.results.vulnerabilities_detected, 0);
        statistics.value.critical_vulnerabilities = allScans.reduce((sum, s) =>
            sum + s.results.vulnerabilities.filter(v => v.severity === 'critical').length, 0
        );
        statistics.value.total_hosts_discovered = allScans.reduce((sum, s) => sum + s.results.hosts_discovered, 0);
        statistics.value.total_services_identified = allScans.reduce((sum, s) => sum + s.results.services_identified, 0);
    }

    // ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====

    /**
     * Обновление статуса сканирования
     */
    function updateScanStatus(scanId: string, status: ScanStatus, message?: string): void {
        const scan = activeScans.value.get(scanId);
        if (!scan) return;

        scan.status = status;
        scan.last_updated = new Date().toISOString();

        if (message) {
            scan.phase_message = message;
        }

        console.log(`📍 Статус сканирования ${scanId}: ${status}${message ? ` - ${message}` : ''}`);
    }

    /**
     * Запуск таймера обновления сканирования
     */
    function startScanTimer(scanId: string): void {
        clearScanTimer(scanId);

        const timer = setInterval(async () => {
            try {
                await updateScanFromAPI(scanId);
            } catch (error) {
                console.error(`❌ Ошибка обновления сканирования ${scanId}:`, error);
                clearScanTimer(scanId);
            }
        }, 2000);

        updateTimers.value.set(scanId, timer);
    }

    /**
     * Очистка таймера сканирования
     */
    function clearScanTimer(scanId: string): void {
        const timer = updateTimers.value.get(scanId);
        if (timer) {
            clearInterval(timer);
            updateTimers.value.delete(scanId);
        }
    }

    /**
     * Создание пустых результатов
     */
    function createEmptyResults(): ScanResults {
        return {
            hosts_discovered: 0,
            ports_found: 0,
            services_identified: 0,
            vulnerabilities_detected: 0,
            hosts: [],
            open_ports: [],
            services: [],
            vulnerabilities: [],
            security_score: 0,
            risk_level: 'low',
            attack_surface: {
                total_exposed_services: 0,
                critical_exposures: 0,
                internet_facing_services: 0,
                legacy_systems: 0,
                network_risks: [],
                service_risks: [],
                configuration_risks: [],
                mitigation_priorities: []
            },
            executive_summary: '',
            key_findings: [],
            recommendations: [],
            report_files: [],
            raw_data_files: []
        };
    }

    /**
     * Создание пустой статистики
     */
    function createEmptyStatistics(): ScanStatistics {
        return {
            total_time: 0,
            discovery_time: 0,
            scanning_time: 0,
            analysis_time: 0,
            hosts_per_second: 0,
            ports_per_second: 0,
            packets_sent: 0,
            packets_received: 0,
            targets_scanned: 0,
            targets_responsive: 0,
            coverage_percentage: 0,
            findings_count: 0,
            critical_findings: 0,
            high_findings: 0,
            medium_findings: 0,
            low_findings: 0,
            false_positive_rate: 0,
            confidence_score: 0,
            accuracy_metrics: {
                precision: 0,
                recall: 0,
                f1_score: 0,
                detection_rate: 0
            }
        };
    }

    /**
     * Генерация ID сканирования
     */
    function generateScanId(): string {
        return `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Генерация обычного ID
     */
    function generateId(): string {
        return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Получение текущего пользователя
     */
    function getCurrentUser(): string {
        // TODO: Интеграция с системой аутентификации
        return 'current_user';
    }

    // ===== API ИНТЕГРАЦИЯ =====

    /**
     * Отправка запроса на запуск сканирования
     */
    async function sendScanRequest(scan: Scan): Promise<any> {
        const response = await fetch('/api/scan/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                target: scan.target,
                type: scan.type,
                profile: scan.profile,
                settings: scan.settings,
                options: scan.options,
                metadata: {
                    scan_id: scan.id,
                    ...scan.metadata
                }
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Отправка запроса на остановку
     */
    async function sendStopRequest(scanId: string): Promise<any> {
        const response = await fetch(`/api/scan/stop/${encodeURIComponent(scanId)}`, {
            method: 'POST'
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Отправка запроса на паузу
     */
    async function sendPauseRequest(scanId: string): Promise<any> {
        const response = await fetch(`/api/scan/pause/${encodeURIComponent(scanId)}`, {
            method: 'POST'
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Отправка запроса на возобновление
     */
    async function sendResumeRequest(scanId: string): Promise<any> {
        const response = await fetch(`/api/scan/resume/${encodeURIComponent(scanId)}`, {
            method: 'POST'
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Отправка запроса на удаление
     */
    async function sendDeleteRequest(scanId: string): Promise<any> {
        const response = await fetch(`/api/scan/${encodeURIComponent(scanId)}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Отправка запроса на валидацию
     */
    async function sendValidationRequest(target: string, force: boolean): Promise<any> {
        const response = await fetch('/api/scan/validate-target', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ target, force })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Отправка запроса на генерацию отчета
     */
    async function sendReportRequest(scanId: string, format: string): Promise<any> {
        const response = await fetch(`/api/scan/${encodeURIComponent(scanId)}/report`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ format })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Обновление сканирования из API
     */
    async function updateScanFromAPI(scanId: string): Promise<void> {
        try {
            const response = await fetch(`/api/scan/${encodeURIComponent(scanId)}/status`);

            if (!response.ok) {
                if (response.status === 404) {
                    // Сканирование не найдено, удаляем из локального состояния
                    activeScans.value.delete(scanId);
                    clearScanTimer(scanId);
                    return;
                }
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            // Обновляем сканирование с данными из API
            const scan = activeScans.value.get(scanId);
            if (scan) {
                updateScanProgress(scanId, data.progress, data.phase, data.phase_message);

                if (data.results) {
                    updateScanResults(scanId, data.results);
                }

                if (data.status && data.status !== scan.status) {
                    if (data.status === 'completed') {
                        completeScan(scanId, data.results);
                    } else {
                        updateScanStatus(scanId, data.status, data.phase_message);
                    }
                }

                if (data.errors?.length) {
                    scan.errors.push(...data.errors);
                }

                if (data.warnings?.length) {
                    scan.warnings.push(...data.warnings);
                }
            }

        } catch (error) {
            console.error(`❌ Ошибка обновления сканирования ${scanId} из API:`, error);
            throw error;
        }
    }

    // ===== WEBSOCKET ИНТЕГРАЦИЯ =====

    /**
     * Подписка на обновления сканирования через WebSocket
     */
    async function subscribeToScanUpdates(scanId: string): Promise<void> {
        // TODO: Интеграция с WebSocket менеджером
        console.log(`🔌 Подписка на обновления сканирования: ${scanId}`);
    }

    /**
     * Отписка от обновлений сканирования
     */
    async function unsubscribeFromScanUpdates(scanId: string): Promise<void> {
        // TODO: Интеграция с WebSocket менеджером
        console.log(`🔌 Отписка от обновлений сканирования: ${scanId}`);
    }

    // ===== ИНИЦИАЛИЗАЦИЯ =====

    /**
     * Инициализация профилей сканирования
     */
    function initializeProfiles(): void {
        const profiles: ScanProfileDefinition[] = [
            {
                id: 'quick',
                name: '⚡ Быстрое сканирование',
                description: 'Быстрое сканирование основных портов',
                icon: '⚡',
                recommended: true,
                default_settings: {
                    ...defaultSettings.value,
                    ports: 'common',
                    timing_template: '4',
                    enable_scripts: false,
                    version_detection: false,
                    os_detection: false,
                    parallel_hosts: 20,
                    max_retries: 1
                },
                locked_settings: ['timing_template', 'max_retries'],
                use_cases: ['Быстрая проверка доступности', 'Предварительная разведка'],
                warnings: ['Может пропустить некоторые сервисы'],
                estimated_duration: '1-5 минут',
                resource_requirements: 'low',
                max_hosts: 1000,
                timeout_multiplier: 0.5
            },
            {
                id: 'balanced',
                name: '⚖️ Сбалансированное',
                description: 'Оптимальный баланс скорости и точности',
                icon: '⚖️',
                recommended: true,
                default_settings: {
                    ...defaultSettings.value,
                    ports: 'top-1000',
                    timing_template: '3',
                    enable_scripts: true,
                    version_detection: true,
                    os_detection: false,
                    parallel_hosts: 10,
                    max_retries: 2
                },
                locked_settings: [],
                use_cases: ['Регулярное сканирование', 'Оценка безопасности'],
                warnings: [],
                estimated_duration: '5-15 минут',
                resource_requirements: 'medium',
                timeout_multiplier: 1.0
            },
            {
                id: 'thorough',
                name: '🔍 Тщательное',
                description: 'Детальное сканирование всех параметров',
                icon: '🔍',
                recommended: true,
                default_settings: {
                    ...defaultSettings.value,
                    ports: 'all',
                    timing_template: '2',
                    enable_scripts: true,
                    version_detection: true,
                    os_detection: true,
                    aggressive_mode: true,
                    parallel_hosts: 5,
                    max_retries: 3
                },
                locked_settings: ['timing_template', 'os_detection', 'aggressive_mode'],
                use_cases: ['Глубокий анализ', 'Аудит безопасности'],
                warnings: ['Длительное сканирование', 'Может быть обнаружено системами защиты'],
                estimated_duration: '30-120 минут',
                resource_requirements: 'high',
                timeout_multiplier: 2.0
            },
            {
                id: 'stealth',
                name: '🥷 Скрытное',
                description: 'Максимально скрытное сканирование',
                icon: '🥷',
                recommended: false,
                default_settings: {
                    ...defaultSettings.value,
                    ports: 'common',
                    timing_template: '1',
                    enable_scripts: false,
                    version_detection: false,
                    os_detection: false,
                    stealth_mode: true,
                    parallel_hosts: 1,
                    scan_delay: 1000,
                    max_retries: 1
                },
                locked_settings: ['timing_template', 'stealth_mode', 'parallel_hosts'],
                use_cases: ['Пентестинг', 'Скрытная разведка'],
                warnings: ['Очень медленное сканирование', 'Может занять несколько часов'],
                estimated_duration: '2-8 часов',
                resource_requirements: 'low',
                timeout_multiplier: 4.0
            },
            {
                id: 'aggressive',
                name: '💥 Агрессивное',
                description: 'Быстрое агрессивное сканирование',
                icon: '💥',
                recommended: false,
                default_settings: {
                    ...defaultSettings.value,
                    ports: 'top-1000',
                    timing_template: '5',
                    enable_scripts: true,
                    version_detection: true,
                    os_detection: true,
                    aggressive_mode: true,
                    parallel_hosts: 50,
                    max_retries: 3
                },
                locked_settings: ['timing_template', 'aggressive_mode'],
                use_cases: ['Быстрая оценка', 'Тестирование производительности'],
                warnings: ['Высокая нагрузка на сеть', 'Легко обнаруживается', 'Может вызвать DoS'],
                estimated_duration: '2-10 минут',
                resource_requirements: 'high',
                timeout_multiplier: 0.3
            },
            {
                id: 'custom',
                name: '🔧 Пользовательское',
                description: 'Настройки определены пользователем',
                icon: '🔧',
                recommended: false,
                default_settings: defaultSettings.value,
                locked_settings: [],
                use_cases: ['Специфические требования', 'Экспериментальные настройки'],
                warnings: ['Требует экспертных знаний'],
                estimated_duration: 'Зависит от настроек',
                resource_requirements: 'medium',
                timeout_multiplier: 1.0
            }
        ];

        profiles.forEach(profile => {
            scanProfiles.value.set(profile.id, profile);
        });

        console.log('✅ Профили сканирования инициализированы');
    }

    /**
     * Инициализация очистки
     */
    function initializeCleanup(): void {
        cleanupInterval.value = setInterval(() => {
            // Очищаем старые валидации (старше 1 часа)
            const oneHourAgo = Date.now() - 60 * 60 * 1000;
            for (const [target, validation] of targetValidations.value) {
                if (new Date(validation.validated_at).getTime() < oneHourAgo) {
                    targetValidations.value.delete(target);
                }
            }

            // Перемещаем завершенные сканирования в историю (старше 24 часов)
            const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
            for (const [scanId, scan] of activeScans.value) {
                if (['completed', 'failed', 'cancelled'].includes(scan.status) &&
                    new Date(scan.last_updated).getTime() < oneDayAgo) {
                    scanHistory.value.set(scanId, scan);
                    activeScans.value.delete(scanId);
                    clearScanTimer(scanId);
                }
            }

            // Ограничиваем размер истории (максимум 1000 записей)
            if (scanHistory.value.size > 1000) {
                const oldestScans = Array.from(scanHistory.value.entries())
                    .sort((a, b) => new Date(a[1].created_at).getTime() - new Date(b[1].created_at).getTime())
                    .slice(0, scanHistory.value.size - 1000);

                oldestScans.forEach(([scanId]) => scanHistory.value.delete(scanId));
            }

        }, 60000); // Каждую минуту
    }

    /**
     * Сохранение состояния
     */
    function saveState(): void {
        try {
            const state = {
                activeScans: Array.from(activeScans.value.entries()),
                scanHistory: Array.from(scanHistory.value.entries()).slice(-100), // Сохраняем только последние 100
                defaultSettings: defaultSettings.value,
                defaultOptions: defaultOptions.value,
                selectedProfile: selectedProfile.value,
                showAdvancedSettings: showAdvancedSettings.value
            };

            localStorage.setItem('scanner-store-state', JSON.stringify(state));
        } catch (error) {
            console.error('❌ Ошибка сохранения состояния scanner store:', error);
        }
    }

    /**
     * Загрузка состояния
     */
    function loadState(): void {
        try {
            const savedState = localStorage.getItem('scanner-store-state');
            if (!savedState) return;

            const state = JSON.parse(savedState);

            if (state.activeScans) {
                activeScans.value = new Map(state.activeScans);
            }

            if (state.scanHistory) {
                scanHistory.value = new Map(state.scanHistory);
            }

            if (state.defaultSettings) {
                defaultSettings.value = { ...defaultSettings.value, ...state.defaultSettings };
            }

            if (state.defaultOptions) {
                defaultOptions.value = { ...defaultOptions.value, ...state.defaultOptions };
            }

            if (state.selectedProfile) {
                selectedProfile.value = state.selectedProfile;
            }

            if (state.showAdvancedSettings !== undefined) {
                showAdvancedSettings.value = state.showAdvancedSettings;
            }

            console.log('✅ Состояние scanner store загружено');

        } catch (error) {
            console.error('❌ Ошибка загрузки состояния scanner store:', error);
        }
    }

    /**
     * Инициализация хранилища
     */
    function initialize(): void {
        console.log('🚀 Инициализация Scanner Store...');

        initializeProfiles();
        loadState();
        initializeCleanup();

        // Автосохранение состояния
        watch(
            [activeScans, scanHistory, defaultSettings, defaultOptions, selectedProfile, showAdvancedSettings],
            () => saveState(),
            { deep: true }
        );

        console.log('✅ Scanner Store инициализирован');
    }

    // Инициализируем при создании
    initialize();

    // ===== ЭКСПОРТ ПУБЛИЧНОГО API =====

    return {
        // Состояние
        activeScans: readonly(activeScans),
        scanHistory: readonly(scanHistory),
        currentScanId: readonly(currentScanId),
        scanProfiles: readonly(scanProfiles),
        scanTemplates,
        scanQueues,
        scanSchedules,
        defaultSettings,
        defaultOptions,
        filters: readonly(filters),
        isScanning: readonly(isScanning),
        isValidating: readonly(isValidating),
        selectedProfile,
        showAdvancedSettings,
        targetValidations: readonly(targetValidations),
        statistics: readonly(statistics),
        wsConnected: readonly(wsConnected),
        wsReconnecting: readonly(wsReconnecting),

        // Computed
        filteredScans,
        currentScan,
        scansByStatus,
        runningScan,
        recentScans,
        criticalFindings,
        availableProfiles,
        activeQueues,

        // Действия
        createScan,
        startScan,
        stopScan,
        pauseScan,
        resumeScan,
        deleteScan,
        validateTarget,
        updateScanProgress,
        updateScanResults,
        completeScan,
        setFilters,
        clearFilters,
        createTemplateFromScan,
        generateScanReport,
        updateStatistics,
        saveState,
        loadState,
        initialize
    };
});

export default useScannerStore;
