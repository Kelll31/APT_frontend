// src/stores/scannerStore.tsx

/**
 * IP Roast Enterprise - Scanner Store v3.0
 * Centralized state management для модуля сканирования сети
 * Построен на React + Zustand
 */

import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { persist, createJSONStorage } from 'zustand/middleware';

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

// ===== СОСТОЯНИЕ ХРАНИЛИЩА =====

export interface ScannerState {
    // Активные сканирования
    activeScans: Map<string, Scan>;

    // История сканирований
    scanHistory: Map<string, Scan>;

    // Текущее выбранное сканирование
    currentScanId: string | null;

    // Профили сканирования
    scanProfiles: Map<ScanProfile, ScanProfileDefinition>;

    // Шаблоны сканирования
    scanTemplates: Map<string, ScanTemplate>;

    // Очереди сканирования
    scanQueues: Map<string, ScanQueue>;

    // Расписания сканирования
    scanSchedules: Map<string, ScanSchedule>;

    // Настройки по умолчанию
    defaultSettings: ScanSettings;

    // Опции по умолчанию
    defaultOptions: ScanOptions;

    // Фильтры
    filters: ScanFilters;

    // UI состояние
    isScanning: boolean;
    isValidating: boolean;
    selectedProfile: ScanProfile;
    showAdvancedSettings: boolean;

    // Валидация целей
    targetValidations: Map<string, TargetValidation>;

    // Статистика
    statistics: ScannerStatistics;

    // WebSocket подключение
    wsConnected: boolean;
    wsReconnecting: boolean;

    // Таймеры и интервалы
    updateTimers: Map<string, NodeJS.Timeout>;
    cleanupInterval: NodeJS.Timeout | null;
}

// Действия сканера
export interface ScannerActions {
    // Управление сканированиями
    createScan: (
        target: string,
        type?: ScanType,
        profile?: ScanProfile,
        customSettings?: Partial<ScanSettings>,
        customOptions?: Partial<ScanOptions>
    ) => Promise<string>;
    startScan: (scanId: string) => Promise<void>;
    stopScan: (scanId: string) => Promise<void>;
    pauseScan: (scanId: string) => Promise<void>;
    resumeScan: (scanId: string) => Promise<void>;
    deleteScan: (scanId: string, moveToHistory?: boolean) => Promise<void>;

    // Валидация
    validateTarget: (target: string, force?: boolean) => Promise<TargetValidation>;

    // Обновления
    updateScanProgress: (scanId: string, progress: number, phase?: ScanPhase, message?: string) => void;
    updateScanResults: (scanId: string, results: Partial<ScanResults>) => void;
    completeScan: (scanId: string, finalResults?: Partial<ScanResults>) => void;

    // Фильтрация
    setFilters: (filters: Partial<ScanFilters>) => void;
    clearFilters: () => void;

    // Шаблоны
    createTemplateFromScan: (scanId: string, templateName: string, description?: string) => Promise<string>;

    // Отчеты
    generateScanReport: (scanId: string, format?: string) => Promise<string>;

    // Утилиты
    updateStatistics: () => void;
    saveState: () => void;
    loadState: () => void;
    initialize: () => void;

    // Внутренние методы
    updateScanStatus: (scanId: string, status: ScanStatus, message?: string) => void;
    startScanTimer: (scanId: string) => void;
    clearScanTimer: (scanId: string) => void;
    createEmptyResults: () => ScanResults;
    createEmptyStatistics: () => ScanStatistics;
    generateScanId: () => string;
    generateId: () => string;
    getCurrentUser: () => string;

    // API методы (добавлены все отсутствующие)
    sendScanRequest: (scan: Scan) => Promise<any>;
    sendStopRequest: (scanId: string) => Promise<any>;
    sendPauseRequest: (scanId: string) => Promise<any>;
    sendResumeRequest: (scanId: string) => Promise<any>;
    sendDeleteRequest: (scanId: string) => Promise<any>;
    sendValidationRequest: (target: string, force: boolean) => Promise<any>;
    sendReportRequest: (scanId: string, format: string) => Promise<any>;
    updateScanFromAPI: (scanId: string) => Promise<void>;

    // WebSocket методы (добавлены все отсутствующие)
    subscribeToScanUpdates: (scanId: string) => Promise<void>;
    unsubscribeFromScanUpdates: (scanId: string) => Promise<void>;

    // Инициализация (добавлены все отсутствующие)
    initializeProfiles: () => void;
    initializeCleanup: () => void;
}

// Объединенный интерфейс хранилища
export type ScannerStore = ScannerState & ScannerActions;

// Начальное состояние
const initialState: ScannerState = {
    activeScans: new Map(),
    scanHistory: new Map(),
    currentScanId: null,
    scanProfiles: new Map(),
    scanTemplates: new Map(),
    scanQueues: new Map(),
    scanSchedules: new Map(),
    defaultSettings: {
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
    },
    defaultOptions: {
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
    },
    filters: {},
    isScanning: false,
    isValidating: false,
    selectedProfile: 'balanced',
    showAdvancedSettings: false,
    targetValidations: new Map(),
    statistics: {
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
    },
    wsConnected: false,
    wsReconnecting: false,
    updateTimers: new Map(),
    cleanupInterval: null
};

// ===== ZUSTAND ХРАНИЛИЩЕ =====

export const useScannerStore = create<ScannerStore>()(
    persist(
        subscribeWithSelector((set, get) => ({
            ...initialState,

            // ===== ОСНОВНЫЕ ДЕЙСТВИЯ =====

            createScan: async (
                target: string,
                type: ScanType = 'port_scan',
                profile: ScanProfile = 'balanced',
                customSettings?: Partial<ScanSettings>,
                customOptions?: Partial<ScanOptions>
            ) => {
                if (!target.trim()) {
                    throw new Error('Target is required');
                }

                const scanId = get().generateScanId();
                const now = new Date().toISOString();

                // Получаем профиль
                const profileDef = get().scanProfiles.get(profile);
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
                    options: { ...get().defaultOptions, ...customOptions },
                    results: get().createEmptyResults(),
                    statistics: get().createEmptyStatistics(),
                    errors: [],
                    warnings: [],
                    created_by: get().getCurrentUser(),
                    tags: [],
                    metadata: {}
                };

                // Добавляем в активные сканирования
                set((state) => {
                    const newActiveScans = new Map(state.activeScans);
                    newActiveScans.set(scanId, scan);
                    return { activeScans: newActiveScans };
                });

                // Обновляем статистику
                get().updateStatistics();

                console.log(`📋 Создано сканирование: ${scanId}`);
                return scanId;
            },

            startScan: async (scanId: string) => {
                const scan = get().activeScans.get(scanId);
                if (!scan) {
                    throw new Error(`Scan not found: ${scanId}`);
                }

                if (scan.status !== 'idle') {
                    throw new Error(`Cannot start scan in status: ${scan.status}`);
                }

                try {
                    console.log(`🚀 Запуск сканирования: ${scanId}`);

                    // Обновляем статус
                    get().updateScanStatus(scanId, 'starting', 'Инициализация сканирования...');

                    // Валидируем цель если нужно
                    if (scan.options.validate_target) {
                        get().updateScanStatus(scanId, 'validating', 'Валидация цели...');
                        const validation = await get().validateTarget(scan.target);

                        if (!validation.valid && !scan.options.force_scan) {
                            throw new Error(`Target validation failed: ${validation.message}`);
                        }

                        if (validation.warnings?.length) {
                            const updatedScan = get().activeScans.get(scanId);
                            if (updatedScan) {
                                updatedScan.warnings.push(...validation.warnings.map(warning => ({
                                    id: get().generateId(),
                                    type: 'configuration' as const,
                                    message: warning,
                                    timestamp: new Date().toISOString(),
                                    impact: 'medium' as const
                                })));
                            }
                        }
                    }

                    // Отправляем запрос на запуск через API
                    await get().sendScanRequest(scan);

                    // Обновляем сканирование с данными ответа
                    set((state) => {
                        const newActiveScans = new Map(state.activeScans);
                        const scanToUpdate = newActiveScans.get(scanId);
                        if (scanToUpdate) {
                            scanToUpdate.started_at = new Date().toISOString();
                            scanToUpdate.last_updated = scanToUpdate.started_at;
                        }
                        return {
                            activeScans: newActiveScans,
                            isScanning: true,
                            currentScanId: scanId
                        };
                    });

                    get().updateScanStatus(scanId, 'running', 'Сканирование выполняется...');

                    // Подключаемся к WebSocket комнате для получения обновлений
                    if (get().wsConnected) {
                        await get().subscribeToScanUpdates(scanId);
                    }

                    // Запускаем таймер обновления
                    get().startScanTimer(scanId);

                    console.log(`✅ Сканирование запущено: ${scanId}`);
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                    console.error(`❌ Ошибка запуска сканирования ${scanId}:`, errorMessage);

                    get().updateScanStatus(scanId, 'failed', `Ошибка запуска: ${errorMessage}`);

                    // Добавляем ошибку
                    const scan = get().activeScans.get(scanId);
                    if (scan) {
                        scan.errors.push({
                            id: get().generateId(),
                            type: 'system',
                            severity: 'critical',
                            message: errorMessage,
                            timestamp: new Date().toISOString()
                        });
                    }

                    throw error;
                }
            },

            stopScan: async (scanId: string) => {
                const scan = get().activeScans.get(scanId);
                if (!scan) {
                    throw new Error(`Scan not found: ${scanId}`);
                }

                if (!['running', 'paused'].includes(scan.status)) {
                    throw new Error(`Cannot stop scan in status: ${scan.status}`);
                }

                try {
                    console.log(`🛑 Остановка сканирования: ${scanId}`);
                    get().updateScanStatus(scanId, 'stopping', 'Остановка сканирования...');

                    // Отправляем запрос на остановку
                    await get().sendStopRequest(scanId);

                    // Очищаем таймер
                    get().clearScanTimer(scanId);

                    // Отключаемся от обновлений
                    await get().unsubscribeFromScanUpdates(scanId);

                    get().updateScanStatus(scanId, 'cancelled', 'Сканирование остановлено пользователем');

                    // Обновляем глобальное состояние
                    set((state) => ({
                        isScanning: state.currentScanId === scanId ? false : state.isScanning,
                        currentScanId: state.currentScanId === scanId ? null : state.currentScanId
                    }));

                    console.log(`✅ Сканирование остановлено: ${scanId}`);
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                    console.error(`❌ Ошибка остановки сканирования ${scanId}:`, errorMessage);

                    const scan = get().activeScans.get(scanId);
                    if (scan) {
                        scan.errors.push({
                            id: get().generateId(),
                            type: 'system',
                            severity: 'high',
                            message: `Ошибка остановки: ${errorMessage}`,
                            timestamp: new Date().toISOString()
                        });
                    }

                    throw error;
                }
            },

            pauseScan: async (scanId: string) => {
                const scan = get().activeScans.get(scanId);
                if (!scan) {
                    throw new Error(`Scan not found: ${scanId}`);
                }

                if (scan.status !== 'running') {
                    throw new Error(`Cannot pause scan in status: ${scan.status}`);
                }

                try {
                    await get().sendPauseRequest(scanId);
                    get().updateScanStatus(scanId, 'paused', 'Сканирование приостановлено');
                    console.log(`⏸️ Сканирование приостановлено: ${scanId}`);
                } catch (error) {
                    console.error(`❌ Ошибка приостановки сканирования ${scanId}:`, error);
                    throw error;
                }
            },

            resumeScan: async (scanId: string) => {
                const scan = get().activeScans.get(scanId);
                if (!scan) {
                    throw new Error(`Scan not found: ${scanId}`);
                }

                if (scan.status !== 'paused') {
                    throw new Error(`Cannot resume scan in status: ${scan.status}`);
                }

                try {
                    await get().sendResumeRequest(scanId);
                    get().updateScanStatus(scanId, 'running', 'Сканирование возобновлено');
                    console.log(`▶️ Сканирование возобновлено: ${scanId}`);
                } catch (error) {
                    console.error(`❌ Ошибка возобновления сканирования ${scanId}:`, error);
                    throw error;
                }
            },

            deleteScan: async (scanId: string, moveToHistory = true) => {
                const scan = get().activeScans.get(scanId);
                if (!scan) {
                    throw new Error(`Scan not found: ${scanId}`);
                }

                // Останавливаем сканирование если оно активно
                if (['running', 'paused'].includes(scan.status)) {
                    await get().stopScan(scanId);
                }

                try {
                    // Отправляем запрос на удаление
                    await get().sendDeleteRequest(scanId);

                    set((state) => {
                        const newActiveScans = new Map(state.activeScans);
                        const newScanHistory = new Map(state.scanHistory);

                        // Перемещаем в историю или удаляем
                        if (moveToHistory) {
                            newScanHistory.set(scanId, scan);
                        }

                        // Удаляем из активных
                        newActiveScans.delete(scanId);

                        return {
                            activeScans: newActiveScans,
                            scanHistory: newScanHistory,
                            currentScanId: state.currentScanId === scanId ? null : state.currentScanId,
                            isScanning: state.currentScanId === scanId ? false : state.isScanning
                        };
                    });

                    // Очищаем таймеры
                    get().clearScanTimer(scanId);

                    console.log(`🗑️ Сканирование удалено: ${scanId}`);
                } catch (error) {
                    console.error(`❌ Ошибка удаления сканирования ${scanId}:`, error);
                    throw error;
                }
            },

            validateTarget: async (target: string, force = false) => {
                if (!target.trim()) {
                    throw new Error('Target is required');
                }

                const normalizedTarget = target.trim();

                // Проверяем кэш если не форсируем
                if (!force && get().targetValidations.has(normalizedTarget)) {
                    const cached = get().targetValidations.get(normalizedTarget)!;
                    // Кэш действителен 5 минут
                    if (Date.now() - new Date(cached.validated_at).getTime() < 300000) {
                        return cached;
                    }
                }

                try {
                    set({ isValidating: true });
                    console.log(`🔍 Валидация цели: ${normalizedTarget}`);

                    const response = await get().sendValidationRequest(normalizedTarget, force);

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
                    set((state) => {
                        const newTargetValidations = new Map(state.targetValidations);
                        newTargetValidations.set(normalizedTarget, validation);
                        return { targetValidations: newTargetValidations };
                    });

                    console.log(`✅ Валидация завершена: ${normalizedTarget} - ${validation.valid ? 'валидна' : 'невалидна'}`);
                    return validation;
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                    console.error(`❌ Ошибка валидации цели ${normalizedTarget}:`, errorMessage);

                    const validation: TargetValidation = {
                        target: normalizedTarget,
                        valid: false,
                        status: 'unknown',
                        message: `Ошибка валидации: ${errorMessage}`,
                        validated_at: new Date().toISOString(),
                        validation_method: 'error',
                        confidence: 0
                    };

                    set((state) => {
                        const newTargetValidations = new Map(state.targetValidations);
                        newTargetValidations.set(normalizedTarget, validation);
                        return { targetValidations: newTargetValidations };
                    });

                    return validation;
                } finally {
                    set({ isValidating: false });
                }
            },

            // ===== ОБНОВЛЕНИЯ СОСТОЯНИЯ =====

            updateScanProgress: (scanId: string, progress: number, phase?: ScanPhase, message?: string) => {
                set((state) => {
                    const newActiveScans = new Map(state.activeScans);
                    const scan = newActiveScans.get(scanId);

                    if (scan) {
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
                    }

                    return { activeScans: newActiveScans };
                });

                console.log(`📊 Обновлен прогресс сканирования ${scanId}: ${progress}% (${phase || 'unknown'})`);
            },

            updateScanResults: (scanId: string, results: Partial<ScanResults>) => {
                set((state) => {
                    const newActiveScans = new Map(state.activeScans);
                    const scan = newActiveScans.get(scanId);

                    if (scan) {
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
                    }

                    return { activeScans: newActiveScans };
                });

                console.log(`📈 Обновлены результаты сканирования ${scanId}`);
            },

            completeScan: (scanId: string, finalResults?: Partial<ScanResults>) => {
                const scan = get().activeScans.get(scanId);
                if (!scan) return;

                try {
                    // Обновляем финальные результаты
                    if (finalResults) {
                        get().updateScanResults(scanId, finalResults);
                    }

                    set((state) => {
                        const newActiveScans = new Map(state.activeScans);
                        const scanToComplete = newActiveScans.get(scanId);

                        if (scanToComplete) {
                            // Обновляем статус и временные метки
                            scanToComplete.status = 'completed';
                            scanToComplete.progress = 100;
                            scanToComplete.phase = 'completed';
                            scanToComplete.completed_at = new Date().toISOString();
                            scanToComplete.last_updated = scanToComplete.completed_at;

                            // Рассчитываем продолжительность
                            if (scanToComplete.started_at) {
                                scanToComplete.actual_duration = new Date(scanToComplete.completed_at).getTime() - new Date(scanToComplete.started_at).getTime();
                            }
                        }

                        return {
                            activeScans: newActiveScans,
                            isScanning: state.currentScanId === scanId ? false : state.isScanning
                        };
                    });

                    // Очищаем таймеры
                    get().clearScanTimer(scanId);

                    // Отключаемся от обновлений
                    get().unsubscribeFromScanUpdates(scanId);

                    // Автогенерация отчета если включена
                    if (scan.options.auto_generate_report) {
                        get().generateScanReport(scanId).catch((error) => {
                            console.error(`❌ Ошибка автогенерации отчета для ${scanId}:`, error);
                        });
                    }

                    // Обновляем статистику
                    get().updateStatistics();

                    console.log(`✅ Сканирование завершено: ${scanId}`);
                } catch (error) {
                    console.error(`❌ Ошибка завершения сканирования ${scanId}:`, error);
                }
            },

            // ===== ФИЛЬТРАЦИЯ =====

            setFilters: (newFilters: Partial<ScanFilters>) => {
                set((state) => ({
                    filters: { ...state.filters, ...newFilters }
                }));
            },

            clearFilters: () => {
                set({ filters: {} });
            },

            // ===== ШАБЛОНЫ И ОТЧЕТЫ =====

            createTemplateFromScan: async (scanId: string, templateName: string, description?: string) => {
                const scan = get().activeScans.get(scanId);
                if (!scan) {
                    throw new Error(`Scan not found: ${scanId}`);
                }

                const templateId = get().generateId();
                const template: ScanTemplate = {
                    id: templateId,
                    name: templateName,
                    description: description || `Шаблон создан из сканирования ${scanId}`,
                    type: scan.type,
                    profile: scan.profile,
                    settings: { ...scan.settings },
                    options: { ...scan.options },
                    created_by: get().getCurrentUser(),
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    usage_count: 0,
                    is_public: false,
                    shared_with: [],
                    tags: [...scan.tags],
                    category: 'custom',
                    compliance_frameworks: scan.compliance_frameworks || []
                };

                set((state) => {
                    const newScanTemplates = new Map(state.scanTemplates);
                    newScanTemplates.set(templateId, template);
                    return { scanTemplates: newScanTemplates };
                });

                console.log(`📋 Создан шаблон ${templateId} из сканирования ${scanId}`);
                return templateId;
            },

            generateScanReport: async (scanId: string, format = 'html') => {
                const scan = get().activeScans.get(scanId);
                if (!scan) {
                    throw new Error(`Scan not found: ${scanId}`);
                }

                try {
                    console.log(`📄 Генерация отчета для сканирования ${scanId} в формате ${format}`);
                    const response = await get().sendReportRequest(scanId, format);

                    // Добавляем файл отчета к результатам
                    const reportFile: ReportFile = {
                        filename: response.filename,
                        format: format,
                        size: response.size,
                        path: response.path,
                        generated_at: new Date().toISOString(),
                        checksum: response.checksum
                    };

                    set((state) => {
                        const newActiveScans = new Map(state.activeScans);
                        const scanToUpdate = newActiveScans.get(scanId);
                        if (scanToUpdate) {
                            scanToUpdate.results.report_files.push(reportFile);
                        }
                        return { activeScans: newActiveScans };
                    });

                    console.log(`✅ Отчет сгенерирован: ${response.filename}`);
                    return response.path;
                } catch (error) {
                    console.error(`❌ Ошибка генерации отчета для ${scanId}:`, error);
                    throw error;
                }
            },

            // ===== СТАТИСТИКА =====

            updateStatistics: () => {
                const allScans = Array.from(get().activeScans.values());

                set((state) => ({
                    statistics: {
                        ...state.statistics,
                        total_scans: allScans.length,
                        active_scans: allScans.filter(s => ['running', 'starting', 'validating'].includes(s.status)).length,
                        completed_scans: allScans.filter(s => s.status === 'completed').length,
                        failed_scans: allScans.filter(s => s.status === 'failed').length,
                        // Дополнительная статистика будет обновлена здесь
                    }
                }));
            },

            // ===== УТИЛИТЫ =====

            saveState: () => {
                try {
                    const state = get();
                    const stateToSave = {
                        activeScans: Array.from(state.activeScans.entries()),
                        scanHistory: Array.from(state.scanHistory.entries()).slice(-100), // Сохраняем только последние 100
                        defaultSettings: state.defaultSettings,
                        defaultOptions: state.defaultOptions,
                        selectedProfile: state.selectedProfile,
                        showAdvancedSettings: state.showAdvancedSettings
                    };
                    localStorage.setItem('scanner-store-state', JSON.stringify(stateToSave));
                } catch (error) {
                    console.error('❌ Ошибка сохранения состояния scanner store:', error);
                }
            },

            loadState: () => {
                try {
                    const savedState = localStorage.getItem('scanner-store-state');
                    if (!savedState) return;

                    const state = JSON.parse(savedState);

                    set((currentState) => ({
                        activeScans: state.activeScans ? new Map(state.activeScans) : currentState.activeScans,
                        scanHistory: state.scanHistory ? new Map(state.scanHistory) : currentState.scanHistory,
                        defaultSettings: state.defaultSettings ? { ...currentState.defaultSettings, ...state.defaultSettings } : currentState.defaultSettings,
                        defaultOptions: state.defaultOptions ? { ...currentState.defaultOptions, ...state.defaultOptions } : currentState.defaultOptions,
                        selectedProfile: state.selectedProfile || currentState.selectedProfile,
                        showAdvancedSettings: state.showAdvancedSettings !== undefined ? state.showAdvancedSettings : currentState.showAdvancedSettings
                    }));

                    console.log('✅ Состояние scanner store загружено');
                } catch (error) {
                    console.error('❌ Ошибка загрузки состояния scanner store:', error);
                }
            },

            initialize: () => {
                console.log('🚀 Инициализация Scanner Store...');
                get().initializeProfiles();
                get().loadState();
                get().initializeCleanup();
                console.log('✅ Scanner Store инициализирован');
            },

            // ===== ВНУТРЕННИЕ МЕТОДЫ =====

            updateScanStatus: (scanId: string, status: ScanStatus, message?: string) => {
                set((state) => {
                    const newActiveScans = new Map(state.activeScans);
                    const scan = newActiveScans.get(scanId);

                    if (scan) {
                        scan.status = status;
                        scan.last_updated = new Date().toISOString();
                        if (message) {
                            scan.phase_message = message;
                        }
                    }

                    return { activeScans: newActiveScans };
                });

                console.log(`📍 Статус сканирования ${scanId}: ${status}${message ? ` - ${message}` : ''}`);
            },

            startScanTimer: (scanId: string) => {
                get().clearScanTimer(scanId);

                const timer = setInterval(async () => {
                    try {
                        await get().updateScanFromAPI(scanId);
                    } catch (error) {
                        console.error(`❌ Ошибка обновления сканирования ${scanId}:`, error);
                        get().clearScanTimer(scanId);
                    }
                }, 2000);

                set((state) => {
                    const newUpdateTimers = new Map(state.updateTimers);
                    newUpdateTimers.set(scanId, timer);
                    return { updateTimers: newUpdateTimers };
                });
            },

            clearScanTimer: (scanId: string) => {
                const timer = get().updateTimers.get(scanId);
                if (timer) {
                    clearInterval(timer);
                    set((state) => {
                        const newUpdateTimers = new Map(state.updateTimers);
                        newUpdateTimers.delete(scanId);
                        return { updateTimers: newUpdateTimers };
                    });
                }
            },

            createEmptyResults: () => ({
                hosts_discovered: 0,
                ports_found: 0,
                services_identified: 0,
                vulnerabilities_detected: 0,
                hosts: [],
                open_ports: [],
                services: [],
                vulnerabilities: [],
                security_score: 0,
                risk_level: 'low' as const,
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
            }),

            createEmptyStatistics: () => ({
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
            }),

            generateScanId: () => `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,

            generateId: () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,

            getCurrentUser: () => 'current_user', // TODO: Интеграция с системой аутентификации

            // ===== API МЕТОДЫ =====

            sendScanRequest: async (scan: Scan) => {
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
            },

            sendStopRequest: async (scanId: string) => {
                const response = await fetch(`/api/scan/stop/${encodeURIComponent(scanId)}`, {
                    method: 'POST'
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                return response.json();
            },

            sendPauseRequest: async (scanId: string) => {
                const response = await fetch(`/api/scan/pause/${encodeURIComponent(scanId)}`, {
                    method: 'POST'
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                return response.json();
            },

            sendResumeRequest: async (scanId: string) => {
                const response = await fetch(`/api/scan/resume/${encodeURIComponent(scanId)}`, {
                    method: 'POST'
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                return response.json();
            },

            sendDeleteRequest: async (scanId: string) => {
                const response = await fetch(`/api/scan/${encodeURIComponent(scanId)}`, {
                    method: 'DELETE'
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                return response.json();
            },

            sendValidationRequest: async (target: string, force: boolean) => {
                const response = await fetch('/api/scan/validate-target', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ target, force })
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                return response.json();
            },

            sendReportRequest: async (scanId: string, format: string) => {
                const response = await fetch(`/api/scan/${encodeURIComponent(scanId)}/report`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ format })
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                return response.json();
            },

            updateScanFromAPI: async (scanId: string) => {
                try {
                    const response = await fetch(`/api/scan/${encodeURIComponent(scanId)}/status`);

                    if (!response.ok) {
                        if (response.status === 404) {
                            // Сканирование не найдено, удаляем из локального состояния
                            set((state) => {
                                const newActiveScans = new Map(state.activeScans);
                                newActiveScans.delete(scanId);
                                return { activeScans: newActiveScans };
                            });
                            get().clearScanTimer(scanId);
                            return;
                        }
                        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }

                    const data = await response.json();

                    // Обновляем сканирование с данными из API
                    const scan = get().activeScans.get(scanId);
                    if (scan) {
                        get().updateScanProgress(scanId, data.progress, data.phase, data.phase_message);

                        if (data.results) {
                            get().updateScanResults(scanId, data.results);
                        }

                        if (data.status && data.status !== scan.status) {
                            if (data.status === 'completed') {
                                get().completeScan(scanId, data.results);
                            } else {
                                get().updateScanStatus(scanId, data.status, data.phase_message);
                            }
                        }

                        if (data.errors?.length) {
                            set((state) => {
                                const newActiveScans = new Map(state.activeScans);
                                const scanToUpdate = newActiveScans.get(scanId);
                                if (scanToUpdate) {
                                    scanToUpdate.errors.push(...data.errors);
                                }
                                return { activeScans: newActiveScans };
                            });
                        }

                        if (data.warnings?.length) {
                            set((state) => {
                                const newActiveScans = new Map(state.activeScans);
                                const scanToUpdate = newActiveScans.get(scanId);
                                if (scanToUpdate) {
                                    scanToUpdate.warnings.push(...data.warnings);
                                }
                                return { activeScans: newActiveScans };
                            });
                        }
                    }
                } catch (error) {
                    console.error(`❌ Ошибка обновления сканирования ${scanId} из API:`, error);
                    throw error;
                }
            },

            // ===== WEBSOCKET МЕТОДЫ =====

            subscribeToScanUpdates: async (scanId: string) => {
                // TODO: Интеграция с WebSocket менеджером
                console.log(`🔌 Подписка на обновления сканирования: ${scanId}`);
            },

            unsubscribeFromScanUpdates: async (scanId: string) => {
                // TODO: Интеграция с WebSocket менеджером
                console.log(`🔌 Отписка от обновлений сканирования: ${scanId}`);
            },

            // ===== ИНИЦИАЛИЗАЦИЯ =====

            initializeProfiles: () => {
                const profiles: ScanProfileDefinition[] = [
                    {
                        id: 'quick',
                        name: '⚡ Быстрое сканирование',
                        description: 'Быстрое сканирование основных портов',
                        icon: '⚡',
                        recommended: true,
                        default_settings: {
                            ...get().defaultSettings,
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
                            ...get().defaultSettings,
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
                ];

                set(() => {
                    const newScanProfiles = new Map();
                    profiles.forEach(profile => {
                        newScanProfiles.set(profile.id, profile);
                    });
                    return { scanProfiles: newScanProfiles };
                });

                console.log('✅ Профили сканирования инициализированы');
            },

            initializeCleanup: () => {
                const cleanupInterval = setInterval(() => {
                    // Очищаем старые валидации (старше 1 часа)
                    const oneHourAgo = Date.now() - 60 * 60 * 1000;

                    set((state) => {
                        const newTargetValidations = new Map(state.targetValidations);
                        for (const [target, validation] of newTargetValidations) {
                            if (new Date(validation.validated_at).getTime() < oneHourAgo) {
                                newTargetValidations.delete(target);
                            }
                        }
                        return { targetValidations: newTargetValidations };
                    });

                    // Дополнительная очистка...
                }, 60000); // Каждую минуту

                set({ cleanupInterval });
            }
        })),
        {
            name: 'ip-roast-scanner-store',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                defaultSettings: state.defaultSettings,
                defaultOptions: state.defaultOptions,
                selectedProfile: state.selectedProfile,
                showAdvancedSettings: state.showAdvancedSettings,
                filters: state.filters
            })
        }
    )
);

// ===== REACT CONTEXT И PROVIDER =====

export interface ScannerContextType {
    store: ScannerStore;
    filteredScans: Scan[];
    currentScan: Scan | null;
    isScanning: boolean;
    statistics: ScannerStatistics;
}

const ScannerContext = createContext<ScannerContextType | undefined>(undefined);

export interface ScannerProviderProps {
    children: ReactNode;
}

export const ScannerProvider: React.FC<ScannerProviderProps> = ({ children }) => {
    const store = useScannerStore();

    // Инициализация при монтировании
    useEffect(() => {
        store.initialize();
    }, []);

    // Вычисляемые значения
    const filteredScans = Array.from(store.activeScans.values())
        .filter(scan => {
            // Применяем фильтры
            if (store.filters.status?.length && !store.filters.status.includes(scan.status)) return false;
            if (store.filters.type?.length && !store.filters.type.includes(scan.type)) return false;
            if (store.filters.profile?.length && !store.filters.profile.includes(scan.profile)) return false;
            if (store.filters.target_pattern) {
                const pattern = store.filters.target_pattern.toLowerCase();
                if (!scan.target.toLowerCase().includes(pattern)) return false;
            }
            return true;
        })
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const currentScan = store.currentScanId ? store.activeScans.get(store.currentScanId) || null : null;

    const contextValue: ScannerContextType = {
        store,
        filteredScans,
        currentScan,
        isScanning: store.isScanning,
        statistics: store.statistics
    };

    return (
        <ScannerContext.Provider value={contextValue}>
            {children}
        </ScannerContext.Provider>
    );
};

// ===== CUSTOM HOOK =====

export const useScanner = (): ScannerContextType => {
    const context = useContext(ScannerContext);
    if (context === undefined) {
        throw new Error('useScanner must be used within a ScannerProvider');
    }
    return context;
};

// ===== ЭКСПОРТ ПО УМОЛЧАНИЮ =====

export default useScannerStore;
