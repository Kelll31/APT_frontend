// src/services/reconApi.ts
/**
 * IP Roast Enterprise - Reconnaissance API Service v3.0 ENTERPRISE
 * Корпоративный API клиент для функций разведки с расширенными возможностями
 * Построен для React + TypeScript архитектуры
 */

import { api } from './api';
import type {
    ApiResponse,
    NetworkDevice,
    NetworkInterface,
} from './api';

// ===== ENTERPRISE ТИПЫ ДАННЫХ =====

export interface ComplianceCheckSettings {
    frameworks: string[];
    targets: string[];
    deep_scan?: boolean;
    custom_rules?: string[];
    notification_settings?: {
        on_completion: boolean;
        recipients: string[];
    };
}

export interface ReconExportSettings {
    format: 'json' | 'csv' | 'xml' | 'excel';
    include_metadata?: boolean;
    include_raw_data?: boolean;
    filters?: Record<string, any>;
    compression?: boolean;
}

export interface ReconReportSettings {
    template: string;
    title: string;
    format: 'html' | 'pdf' | 'docx';
    sections: string[];
    custom_branding?: boolean;
    recipients?: string[];
}

export interface MLAnalysisSettings {
    models: string[];
    analysis_types: string[];
    confidence_threshold?: number;
    include_predictions?: boolean;
    training_data_filters?: Record<string, any>;
}

export interface MLModelSettings {
    model_type: string;
    training_data: any;
    hyperparameters?: Record<string, any>;
    validation_split?: number;
    epochs?: number;
}

export interface BusinessImpactSettings {
    assessment_scope: string[];
    impact_categories: string[];
    time_horizon: string;
    risk_tolerance: string;
    stakeholders: string[];
}

export interface IntegrationConfig {
    endpoint: string;
    api_key?: string;
    authentication_type: 'api_key' | 'oauth' | 'basic' | 'custom';
    custom_headers?: Record<string, string>;
    timeout?: number;
    retry_policy?: {
        max_attempts: number;
        delay: number;
    };
}

export interface ThreatIntelligenceFilters {
    threat_types?: string[];
    severity_levels?: ('low' | 'medium' | 'high' | 'critical')[];
    date_from?: string;
    date_to?: string;
    sources?: string[];
    ioc_types?: string[];
    confidence_threshold?: number;
    tags?: string[];
    limit?: number;
    offset?: number;
}

export interface DeviceFilters {
    device_types?: string[];
    ip_ranges?: string[];
    mac_addresses?: string[];
    operating_systems?: string[];
    manufacturers?: string[];
    status?: ('online' | 'offline' | 'unknown')[];
    vulnerability_levels?: ('none' | 'low' | 'medium' | 'high' | 'critical')[];
    last_seen_after?: string;
    last_seen_before?: string;
    tags?: string[];
    limit?: number;
    offset?: number;
}

// Базовые настройки разведки (расширенные)
export interface EnterpriseReconSettings {
    selectedInterface: string;
    networkRange: string;
    scanType: 'ping_sweep' | 'arp_scan' | 'tcp_syn' | 'udp_scan' | 'comprehensive' | 'threat_hunting' | 'compliance_scan';
    scanPorts: boolean;
    portRange: string;
    detectOS: boolean;
    detectServices: boolean;
    aggressiveMode: boolean;
    stealthMode: boolean;
    timeout: number;
    maxThreads: number;
    excludeHosts: string;

    // Enterprise расширения
    enableThreatIntelligence: boolean;
    enableMachineLearning: boolean;
    enableBehavioralAnalysis: boolean;
    enableComplianceChecks: boolean;
    enableAssetClassification: boolean;
    enableVulnerabilityCorrelation: boolean;
    customRulesets: string[];
    enterpriseIntegrations: EnterpriseIntegration[];
    tenantId?: string;
    businessContext?: BusinessContext;
    complianceFrameworks: string[];
    riskClassification: RiskClassification;
}

// Интеграции Enterprise
export interface EnterpriseIntegration {
    id: string;
    type: 'siem' | 'soar' | 'cmdb' | 'threat_intel' | 'asset_management' | 'vulnerability_management';
    name: string;
    endpoint: string;
    apiKey?: string;
    enabled: boolean;
    configuration: Record<string, any>;
    lastSync?: string;
    syncStatus: 'success' | 'error' | 'pending';
}

// Бизнес-контекст
export interface BusinessContext {
    organizationId: string;
    department: string;
    businessUnit: string;
    environment: 'production' | 'staging' | 'development' | 'testing';
    criticality: 'low' | 'medium' | 'high' | 'critical';
    owner: string;
    contactEmail: string;
    businessHours: string;
    maintenanceWindows: string[];
    tags: string[];
    customFields: Record<string, any>;
}

// Классификация рисков
export interface RiskClassification {
    dataClassification: 'public' | 'internal' | 'confidential' | 'restricted';
    assetValue: 'low' | 'medium' | 'high' | 'critical';
    businessImpact: 'low' | 'medium' | 'high' | 'critical';
    regulatoryRequirements: string[];
    riskTolerance: 'low' | 'medium' | 'high';
}

// Enterprise результаты разведки
export interface EnterpriseReconResult {
    scan_id: string;
    status: 'running' | 'completed' | 'failed' | 'cancelled';
    progress: number;
    phase: string;
    started_at: string;
    completed_at?: string;
    settings: EnterpriseReconSettings;
    devices_discovered: EnterpriseNetworkDevice[];
    statistics: EnterpriseReconStatistics;
    network_map?: EnterpriseNetworkTopology;
    threat_intelligence?: ThreatIntelligenceData;
    compliance_results?: ComplianceResults;
    ml_insights?: MachineLearningInsights;
    business_analysis?: BusinessImpactAnalysis;
    error_message?: string;
}

// Enterprise устройство
export interface EnterpriseNetworkDevice extends NetworkDevice {
    // Базовые поля из NetworkDevice уже включены
    asset_classification?: AssetClassification;
    threat_indicators?: ThreatIndicator[];
    compliance_status?: ComplianceStatus;
    business_context?: BusinessContext;
    risk_score?: number;
    vulnerability_exposure?: VulnerabilityExposure;
    behavioral_profile?: BehavioralProfile;
    ml_predictions?: MachineLearningPrediction[];
    enterprise_tags?: string[];
    siem_events?: SIEMEvent[];
    related_assets?: string[];
    patch_status?: PatchStatus;
    configuration_drift?: ConfigurationDrift;
    network_segmentation?: NetworkSegmentation;
}

// Классификация активов
export interface AssetClassification {
    category: 'server' | 'workstation' | 'mobile' | 'iot' | 'network' | 'security' | 'industrial';
    subcategory: string;
    function: string;
    vendor: string;
    model: string;
    asset_value: 'low' | 'medium' | 'high' | 'critical';
    data_types: string[];
    owner: string;
    custodian: string;
    location: string;
    confidence_score: number;
    ml_classification?: {
        predicted_type: string;
        confidence: number;
        features_used: string[];
    };
}

// Индикаторы угроз
export interface ThreatIndicator {
    id: string;
    type: 'ip' | 'domain' | 'hash' | 'signature' | 'behavior';
    value: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    source: string;
    first_seen: string;
    last_seen: string;
    confidence: number;
    context: string;
    mitigation: string;
    iocs: IOC[];
}

// Индикаторы компрометации
export interface IOC {
    type: string;
    value: string;
    source: string;
    timestamp: string;
    tlp: 'white' | 'green' | 'amber' | 'red';
}

// Статус соответствия
export interface ComplianceStatus {
    framework: string;
    status: 'compliant' | 'non_compliant' | 'partial' | 'unknown';
    score: number;
    findings: ComplianceFinding[];
    last_assessment: string;
    next_assessment: string;
}

// Результат соответствия
export interface ComplianceFinding {
    rule_id: string;
    rule_name: string;
    status: 'pass' | 'fail' | 'warning' | 'info';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    remediation: string;
    reference: string;
}

// Уязвимости
export interface VulnerabilityExposure {
    critical_count: number;
    high_count: number;
    medium_count: number;
    low_count: number;
    total_score: number;
    top_vulnerabilities: VulnerabilityInfo[];
    patch_priority: PatchPriority[];
    exploitability_score: number;
}

// Информация об уязвимости
export interface VulnerabilityInfo {
    cve_id: string;
    cvss_score: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    affected_services: string[];
    exploit_available: boolean;
    patch_available: boolean;
    first_discovered: string;
    last_updated: string;
}

// Приоритет патчей
export interface PatchPriority {
    patch_id: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    affected_systems: string[];
    business_impact: string;
    recommended_window: string;
}

// Поведенческий профиль
export interface BehavioralProfile {
    baseline_established: boolean;
    normal_traffic_patterns: TrafficPattern[];
    anomalies_detected: BehavioralAnomaly[];
    risk_indicators: RiskIndicator[];
    last_analysis: string;
    confidence_level: number;
}

// Шаблон трафика
export interface TrafficPattern {
    protocol: string;
    port: number;
    direction: 'inbound' | 'outbound' | 'internal';
    volume: number;
    frequency: number;
    time_pattern: string;
    peers: string[];
}

// Поведенческая аномалия
export interface BehavioralAnomaly {
    id: string;
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    detected_at: string;
    confidence: number;
    baseline_deviation: number;
    potential_indicators: string[];
}

// Индикатор риска
export interface RiskIndicator {
    type: string;
    value: string;
    risk_level: 'low' | 'medium' | 'high' | 'critical';
    context: string;
    mitigation: string;
}

// Предсказание машинного обучения
export interface MachineLearningPrediction {
    model_name: string;
    prediction_type: string;
    confidence: number;
    result: any;
    features_used: string[];
    model_version: string;
    prediction_time: string;
}

// SIEM событие
export interface SIEMEvent {
    event_id: string;
    timestamp: string;
    event_type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    source: string;
    description: string;
    raw_data: string;
    correlated_events: string[];
}

// Статус патчей
export interface PatchStatus {
    os_patches: PatchInfo[];
    software_patches: PatchInfo[];
    security_patches: PatchInfo[];
    last_update: string;
    update_policy: string;
    pending_reboots: boolean;
}

// Информация о патче
export interface PatchInfo {
    patch_id: string;
    title: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    installed: boolean;
    install_date?: string;
    requires_reboot: boolean;
    kb_article?: string;
}

// Дрейф конфигурации
export interface ConfigurationDrift {
    baseline_date: string;
    current_date: string;
    drift_detected: boolean;
    changes: ConfigurationChange[];
    drift_score: number;
    compliance_impact: string;
}

// Изменение конфигурации
export interface ConfigurationChange {
    component: string;
    setting: string;
    old_value: string;
    new_value: string;
    change_date: string;
    change_source: string;
    impact: 'low' | 'medium' | 'high' | 'critical';
}

// Сегментация сети
export interface NetworkSegmentation {
    segment_id: string;
    segment_name: string;
    security_zone: string;
    access_rules: AccessRule[];
    isolation_level: 'none' | 'partial' | 'full';
    monitoring_level: 'basic' | 'enhanced' | 'full';
}

// Правило доступа
export interface AccessRule {
    rule_id: string;
    source: string;
    destination: string;
    protocol: string;
    port: string;
    action: 'allow' | 'deny' | 'log';
    direction: 'inbound' | 'outbound' | 'any';
}

// Статистика разведки
export interface EnterpriseReconStatistics {
    total_hosts_scanned: number;
    active_hosts_found: number;
    services_discovered: number;
    vulnerabilities_found: number;
    threats_detected: number;
    compliance_violations: number;
    asset_classification_rate: number;
    ml_prediction_accuracy: number;
    scan_duration: number;
    data_processed: number;

    // Breakdown по типам
    device_types: Record<string, number>;
    os_distribution: Record<string, number>;
    service_distribution: Record<string, number>;
    vulnerability_distribution: Record<string, number>;
    risk_distribution: Record<string, number>;

    // Метрики производительности
    performance_metrics: {
        hosts_per_second: number;
        network_utilization: number;
        cpu_usage: number;
        memory_usage: number;
        accuracy_metrics: AccuracyMetrics;
    };
}

// Метрики точности
export interface AccuracyMetrics {
    os_detection_accuracy: number;
    service_detection_accuracy: number;
    vulnerability_detection_accuracy: number;
    asset_classification_accuracy: number;
    threat_detection_accuracy: number;
    false_positive_rate: number;
    false_negative_rate: number;
}

// Сетевая топология
export interface EnterpriseNetworkTopology {
    topology_id: string;
    generated_at: string;
    nodes: TopologyNode[];
    edges: TopologyEdge[];
    subnets: SubnetInfo[];
    vlans: VLANInfo[];
    routing_table: RoutingEntry[];
    security_zones: SecurityZone[];
    network_diagram: NetworkDiagram;
}

// Узел топологии
export interface TopologyNode {
    node_id: string;
    ip_address: string;
    hostname?: string;
    mac_address?: string;
    node_type: 'host' | 'router' | 'switch' | 'firewall' | 'server' | 'workstation';
    position: { x: number; y: number };
    properties: Record<string, any>;
    connections: string[];
    security_posture: SecurityPosture;
}

// Ребро топологии
export interface TopologyEdge {
    edge_id: string;
    source: string;
    target: string;
    connection_type: 'direct' | 'routed' | 'vpn' | 'wireless';
    bandwidth?: number;
    latency?: number;
    protocol?: string;
    security_level: 'low' | 'medium' | 'high';
}

// Информация о подсети
export interface SubnetInfo {
    subnet_id: string;
    network: string;
    mask: string;
    gateway: string;
    dns_servers: string[];
    dhcp_range?: string;
    vlan_id?: number;
    security_zone: string;
    host_count: number;
}

// Информация о VLAN
export interface VLANInfo {
    vlan_id: number;
    name: string;
    description: string;
    subnets: string[];
    trunk_ports: string[];
    access_ports: string[];
    security_policies: string[];
}

// Запись маршрутизации
export interface RoutingEntry {
    destination: string;
    gateway: string;
    interface: string;
    metric: number;
    protocol: string;
    administrative_distance: number;
}

// Зона безопасности
export interface SecurityZone {
    zone_id: string;
    name: string;
    description: string;
    security_level: 'dmz' | 'internal' | 'external' | 'restricted';
    member_subnets: string[];
    policies: SecurityPolicy[];
    monitoring_rules: MonitoringRule[];
}

// Политика безопасности
export interface SecurityPolicy {
    policy_id: string;
    name: string;
    rules: SecurityRule[];
    enforcement_mode: 'monitor' | 'enforce' | 'block';
    last_updated: string;
}

// Правило безопасности
export interface SecurityRule {
    rule_id: string;
    priority: number;
    source_zone: string;
    destination_zone: string;
    protocol: string;
    port: string;
    action: 'allow' | 'deny' | 'inspect';
    logging: boolean;
}

// Правило мониторинга
export interface MonitoringRule {
    rule_id: string;
    name: string;
    condition: string;
    action: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    enabled: boolean;
}

// Диаграмма сети
export interface NetworkDiagram {
    diagram_id: string;
    format: 'svg' | 'png' | 'json';
    data: string;
    layout: 'hierarchical' | 'circular' | 'force' | 'grid';
    zoom_level: number;
    annotations: DiagramAnnotation[];
}

// Аннотация диаграммы
export interface DiagramAnnotation {
    annotation_id: string;
    position: { x: number; y: number };
    text: string;
    type: 'warning' | 'info' | 'error' | 'success';
    target_node?: string;
}

// Поза безопасности
export interface SecurityPosture {
    security_score: number;
    vulnerabilities: VulnerabilityInfo[];
    misconfigurations: MisconfigurationInfo[];
    compliance_status: ComplianceStatus;
    threat_level: 'low' | 'medium' | 'high' | 'critical';
    recommendations: SecurityRecommendation[];
}

// Информация о неправильной конфигурации
export interface MisconfigurationInfo {
    config_id: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    current_value: string;
    recommended_value: string;
    impact: string;
    remediation: string;
}

// Рекомендация по безопасности
export interface SecurityRecommendation {
    recommendation_id: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    steps: string[];
    estimated_effort: string;
    business_impact: string;
}

// Данные разведки угроз
export interface ThreatIntelligenceData {
    providers: ThreatIntelProvider[];
    indicators: ThreatIndicator[];
    campaigns: ThreatCampaign[];
    actors: ThreatActor[];
    ttps: TTP[];
    risk_assessment: ThreatRiskAssessment;
    contextual_analysis: ContextualThreatAnalysis;
}

// Провайдер разведки угроз
export interface ThreatIntelProvider {
    provider_id: string;
    name: string;
    type: 'commercial' | 'open_source' | 'government' | 'community';
    reliability: 'low' | 'medium' | 'high' | 'very_high';
    last_updated: string;
    indicators_count: number;
    active: boolean;
}

// Кампания угроз
export interface ThreatCampaign {
    campaign_id: string;
    name: string;
    description: string;
    first_seen: string;
    last_seen: string;
    actors: string[];
    targets: string[];
    ttps: string[];
    confidence: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
}

// Актор угроз
export interface ThreatActor {
    actor_id: string;
    name: string;
    aliases: string[];
    type: 'nation_state' | 'criminal' | 'hacktivist' | 'terrorist' | 'insider';
    motivation: string[];
    capabilities: string[];
    targets: string[];
    ttps: string[];
    attribution_confidence: number;
}

// Тактики, техники и процедуры
export interface TTP {
    ttp_id: string;
    mitre_id: string;
    name: string;
    description: string;
    tactic: string;
    technique: string;
    sub_technique?: string;
    platforms: string[];
    detection_methods: string[];
    mitigation_methods: string[];
}

// Оценка угрозы
export interface ThreatRiskAssessment {
    overall_risk: 'low' | 'medium' | 'high' | 'critical';
    risk_factors: RiskFactor[];
    threat_landscape: ThreatLandscape;
    recommendations: ThreatRecommendation[];
    risk_matrix: RiskMatrix;
}

// Фактор риска
export interface RiskFactor {
    factor: string;
    impact: 'low' | 'medium' | 'high' | 'critical';
    likelihood: 'low' | 'medium' | 'high' | 'critical';
    mitigation: string;
    residual_risk: 'low' | 'medium' | 'high' | 'critical';
}

// Ландшафт угроз
export interface ThreatLandscape {
    active_campaigns: number;
    targeted_sectors: string[];
    common_attack_vectors: string[];
    trending_malware: string[];
    geographic_distribution: Record<string, number>;
    temporal_patterns: TemporalPattern[];
}

// Временной паттерн
export interface TemporalPattern {
    time_period: string;
    activity_level: 'low' | 'medium' | 'high' | 'critical';
    primary_ttps: string[];
    target_types: string[];
}

// Рекомендация по угрозам
export interface ThreatRecommendation {
    recommendation_id: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    category: 'prevention' | 'detection' | 'response' | 'recovery';
    title: string;
    description: string;
    implementation_steps: string[];
    resources_required: string[];
    timeline: string;
    success_metrics: string[];
}

// Матрица рисков
export interface RiskMatrix {
    matrix_id: string;
    dimensions: string[];
    cells: RiskCell[];
    thresholds: RiskThreshold[];
    color_scheme: Record<string, string>;
}

// Ячейка риска
export interface RiskCell {
    coordinates: number[];
    risk_level: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    count: number;
    examples: string[];
}

// Пороговое значение риска
export interface RiskThreshold {
    level: 'low' | 'medium' | 'high' | 'critical';
    min_score: number;
    max_score: number;
    color: string;
    actions: string[];
}

// Контекстуальный анализ угроз
export interface ContextualThreatAnalysis {
    analysis_id: string;
    analysis_date: string;
    context_factors: ContextFactor[];
    threat_scenarios: ThreatScenario[];
    attack_paths: AttackPath[];
    defense_gaps: DefenseGap[];
    strategic_recommendations: StrategicRecommendation[];
}

// Фактор контекста
export interface ContextFactor {
    factor_type: string;
    factor_value: string;
    relevance: 'low' | 'medium' | 'high' | 'critical';
    impact_areas: string[];
    mitigation_strategies: string[];
}

// Сценарий угрозы
export interface ThreatScenario {
    scenario_id: string;
    name: string;
    description: string;
    likelihood: 'low' | 'medium' | 'high' | 'critical';
    impact: 'low' | 'medium' | 'high' | 'critical';
    risk_score: number;
    attack_vectors: string[];
    prerequisites: string[];
    indicators: string[];
    timeline: ScenarioTimeline[];
}

// Временная линия сценария
export interface ScenarioTimeline {
    phase: string;
    duration: string;
    activities: string[];
    indicators: string[];
    detection_opportunities: string[];
}

// Путь атаки
export interface AttackPath {
    path_id: string;
    name: string;
    description: string;
    steps: AttackStep[];
    success_probability: number;
    detection_probability: number;
    mitigation_effectiveness: number;
}

// Шаг атаки
export interface AttackStep {
    step_id: string;
    phase: string;
    technique: string;
    description: string;
    prerequisites: string[];
    outcomes: string[];
    detection_methods: string[];
    mitigation_controls: string[];
}

// Пробел в защите
export interface DefenseGap {
    gap_id: string;
    category: 'people' | 'process' | 'technology';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    affected_scenarios: string[];
    remediation_options: RemediationOption[];
}

// Вариант устранения
export interface RemediationOption {
    option_id: string;
    name: string;
    description: string;
    cost: 'low' | 'medium' | 'high' | 'very_high';
    complexity: 'low' | 'medium' | 'high' | 'very_high';
    effectiveness: 'low' | 'medium' | 'high' | 'very_high';
    timeline: string;
    dependencies: string[];
}

// Стратегическая рекомендация
export interface StrategicRecommendation {
    recommendation_id: string;
    category: 'governance' | 'architecture' | 'operations' | 'culture';
    priority: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    business_case: string;
    implementation_roadmap: RoadmapPhase[];
    success_metrics: string[];
    roi_analysis: ROIAnalysis;
}

// Фаза дорожной карты
export interface RoadmapPhase {
    phase_id: string;
    name: string;
    duration: string;
    objectives: string[];
    deliverables: string[];
    dependencies: string[];
    resources: string[];
    risks: string[];
}

// Анализ ROI
export interface ROIAnalysis {
    initial_investment: number;
    ongoing_costs: number;
    risk_reduction_value: number;
    operational_savings: number;
    compliance_benefits: number;
    payback_period: string;
    net_present_value: number;
}

// Результаты соответствия
export interface ComplianceResults {
    frameworks: ComplianceFrameworkResult[];
    overall_score: number;
    compliance_level: 'non_compliant' | 'partially_compliant' | 'mostly_compliant' | 'fully_compliant';
    critical_findings: ComplianceFinding[];
    recommendations: ComplianceRecommendation[];
    next_assessment_date: string;
    certification_status: CertificationStatus[];
}

// Результат по фреймворку
export interface ComplianceFrameworkResult {
    framework_id: string;
    name: string;
    version: string;
    score: number;
    status: 'compliant' | 'non_compliant' | 'partial' | 'unknown';
    controls_assessed: number;
    controls_passed: number;
    controls_failed: number;
    findings: ComplianceFinding[];
    evidence: ComplianceEvidence[];
}

// Рекомендация по соответствию
export interface ComplianceRecommendation {
    recommendation_id: string;
    framework: string;
    control_id: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    current_state: string;
    desired_state: string;
    implementation_steps: string[];
    effort_estimate: string;
    risk_reduction: string;
}

// Доказательство соответствия
export interface ComplianceEvidence {
    evidence_id: string;
    type: 'document' | 'configuration' | 'log' | 'screenshot' | 'attestation';
    title: string;
    description: string;
    source: string;
    collection_date: string;
    validity_period: string;
    digital_signature?: string;
    hash?: string;
}

// Статус сертификации
export interface CertificationStatus {
    certification_id: string;
    name: string;
    status: 'active' | 'expired' | 'pending' | 'revoked';
    issue_date: string;
    expiry_date: string;
    certifying_body: string;
    scope: string;
    limitations: string[];
}

// Инсайты машинного обучения
export interface MachineLearningInsights {
    models_used: MLModelInfo[];
    predictions: MLPrediction[];
    anomaly_detection: AnomalyDetectionResult[];
    pattern_analysis: PatternAnalysisResult[];
    behavioral_analysis: BehavioralAnalysisResult[];
    risk_modeling: RiskModelingResult[];
    recommendations: MLRecommendation[];
    model_performance: MLPerformanceMetrics;
}

// Информация о модели ML
export interface MLModelInfo {
    model_id: string;
    name: string;
    type: 'classification' | 'regression' | 'clustering' | 'anomaly_detection' | 'deep_learning';
    version: string;
    training_date: string;
    accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
    features: string[];
    target_variable: string;
}

// Предсказание ML
export interface MLPrediction {
    prediction_id: string;
    model_id: string;
    target: string;
    prediction: any;
    confidence: number;
    probability_distribution?: Record<string, number>;
    feature_importance: FeatureImportance[];
    explanation: string;
    uncertainty_measure: number;
}

// Важность признака
export interface FeatureImportance {
    feature_name: string;
    importance_score: number;
    contribution_direction: 'positive' | 'negative';
    impact_description: string;
}

// Результат обнаружения аномалий
export interface AnomalyDetectionResult {
    anomaly_id: string;
    type: 'statistical' | 'behavioral' | 'temporal' | 'contextual';
    severity: 'low' | 'medium' | 'high' | 'critical';
    confidence: number;
    description: string;
    affected_entities: string[];
    detection_time: string;
    baseline_period: string;
    deviation_metrics: DeviationMetrics;
    root_cause_analysis: RootCauseAnalysis;
}

// Метрики отклонения
export interface DeviationMetrics {
    metric_name: string;
    baseline_value: number;
    observed_value: number;
    deviation_percentage: number;
    standard_deviations: number;
    statistical_significance: number;
}

// Анализ первопричины
export interface RootCauseAnalysis {
    primary_cause: string;
    contributing_factors: string[];
    evidence: string[];
    confidence_level: number;
    remediation_suggestions: string[];
}

// Результат анализа паттернов
export interface PatternAnalysisResult {
    pattern_id: string;
    name: string;
    type: 'sequential' | 'associative' | 'temporal' | 'spatial';
    frequency: number;
    confidence: number;
    support: number;
    lift: number;
    pattern_description: string;
    business_significance: string;
    actionable_insights: string[];
}

// Результат поведенческого анализа
export interface BehavioralAnalysisResult {
    analysis_id: string;
    entity_type: 'user' | 'device' | 'application' | 'network';
    entity_id: string;
    behavior_profile: BehaviorProfile;
    risk_indicators: BehaviorRiskIndicator[];
    trend_analysis: TrendAnalysis;
    peer_comparison: PeerComparison;
}

// Профиль поведения
export interface BehaviorProfile {
    profile_id: string;
    creation_date: string;
    last_updated: string;
    baseline_period: string;
    behavioral_metrics: BehavioralMetric[];
    normal_patterns: NormalPattern[];
    seasonal_variations: SeasonalVariation[];
}

// Поведенческая метрика
export interface BehavioralMetric {
    metric_name: string;
    metric_type: 'volume' | 'frequency' | 'duration' | 'pattern';
    baseline_value: number;
    current_value: number;
    variance: number;
    trend: 'increasing' | 'decreasing' | 'stable' | 'volatile';
}

// Нормальный паттерн
export interface NormalPattern {
    pattern_name: string;
    pattern_type: string;
    frequency: string;
    duration: string;
    characteristics: Record<string, any>;
    confidence: number;
}

// Сезонные вариации
export interface SeasonalVariation {
    variation_type: 'daily' | 'weekly' | 'monthly' | 'yearly';
    pattern_description: string;
    amplitude: number;
    phase: string;
    statistical_significance: number;
}

// Индикатор поведенческого риска
export interface BehaviorRiskIndicator {
    indicator_id: string;
    risk_type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    evidence: string[];
    confidence: number;
    first_observed: string;
    last_observed: string;
    trend: string;
}

// Анализ тренда
export interface TrendAnalysis {
    trend_direction: 'upward' | 'downward' | 'stable' | 'cyclical';
    trend_strength: number;
    trend_significance: number;
    forecast_horizon: string;
    predicted_values: ForecastPoint[];
    confidence_intervals: ConfidenceInterval[];
}

// Точка прогноза
export interface ForecastPoint {
    timestamp: string;
    predicted_value: number;
    confidence: number;
    prediction_interval: [number, number];
}

// Доверительный интервал
export interface ConfidenceInterval {
    confidence_level: number;
    lower_bound: number;
    upper_bound: number;
}

// Сравнение с коллегами
export interface PeerComparison {
    peer_group: string;
    peer_count: number;
    percentile_ranking: number;
    comparative_metrics: ComparativeMetric[];
    outlier_analysis: OutlierAnalysis;
    benchmarking_insights: string[];
}

// Сравнительная метрика
export interface ComparativeMetric {
    metric_name: string;
    entity_value: number;
    peer_average: number;
    peer_median: number;
    peer_percentile_75: number;
    peer_percentile_25: number;
    ranking: number;
    z_score: number;
}

// Анализ выбросов
export interface OutlierAnalysis {
    is_outlier: boolean;
    outlier_type: 'statistical' | 'contextual' | 'behavioral';
    outlier_score: number;
    outlier_explanation: string;
    similar_entities: string[];
}

// Результат моделирования рисков
export interface RiskModelingResult {
    model_id: string;
    risk_score: number;
    risk_level: 'low' | 'medium' | 'high' | 'critical';
    risk_factors: ModelRiskFactor[];
    scenario_analysis: ScenarioAnalysis[];
    sensitivity_analysis: SensitivityAnalysis;
    monte_carlo_simulation: MonteCarloResult;
    risk_mitigation_options: RiskMitigationOption[];
}

// Фактор риска модели
export interface ModelRiskFactor {
    factor_name: string;
    factor_weight: number;
    factor_value: number;
    contribution_to_risk: number;
    factor_type: 'vulnerability' | 'threat' | 'asset' | 'control';
    uncertainty_level: number;
}

// Анализ сценариев
export interface ScenarioAnalysis {
    scenario_name: string;
    scenario_probability: number;
    scenario_impact: number;
    scenario_risk_score: number;
    key_assumptions: string[];
    outcome_distribution: OutcomeDistribution;
}

// Распределение исходов
export interface OutcomeDistribution {
    distribution_type: 'normal' | 'lognormal' | 'uniform' | 'triangular' | 'beta';
    parameters: Record<string, number>;
    percentiles: Record<string, number>;
    expected_value: number;
    standard_deviation: number;
}

// Анализ чувствительности
export interface SensitivityAnalysis {
    most_sensitive_factors: string[];
    sensitivity_coefficients: SensitivityCoefficient[];
    tornado_diagram_data: TornadoDiagramData;
    interaction_effects: InteractionEffect[];
}

// Коэффициент чувствительности
export interface SensitivityCoefficient {
    factor_name: string;
    coefficient: number;
    confidence_interval: [number, number];
    significance_level: number;
}

// Данные диаграммы торнадо
export interface TornadoDiagramData {
    factor_impacts: FactorImpact[];
    base_case_value: number;
    impact_range: [number, number];
}

// Воздействие фактора
export interface FactorImpact {
    factor_name: string;
    low_impact: number;
    high_impact: number;
    impact_range: number;
}

// Эффект взаимодействия
export interface InteractionEffect {
    factor_pair: [string, string];
    interaction_coefficient: number;
    interaction_type: 'synergistic' | 'antagonistic' | 'independent';
    significance: number;
}

// Результат Монте-Карло
export interface MonteCarloResult {
    simulation_runs: number;
    convergence_achieved: boolean;
    result_statistics: ResultStatistics;
    risk_distribution: RiskDistribution;
    confidence_levels: ConfidenceLevel[];
    var_analysis: VaRAnalysis;
}

// Статистика результатов
export interface ResultStatistics {
    mean: number;
    median: number;
    standard_deviation: number;
    skewness: number;
    kurtosis: number;
    minimum: number;
    maximum: number;
    percentiles: Record<string, number>;
}

// Распределение рисков
export interface RiskDistribution {
    distribution_data: DistributionPoint[];
    probability_density: ProbabilityDensityPoint[];
    cumulative_distribution: CumulativeDistributionPoint[];
}

// Точка распределения
export interface DistributionPoint {
    value: number;
    frequency: number;
    probability: number;
}

// Точка плотности вероятности
export interface ProbabilityDensityPoint {
    value: number;
    density: number;
}

// Точка кумулятивного распределения
export interface CumulativeDistributionPoint {
    value: number;
    cumulative_probability: number;
}

// Уровень доверия
export interface ConfidenceLevel {
    confidence_percentage: number;
    lower_bound: number;
    upper_bound: number;
    interval_width: number;
}

// VaR анализ
export interface VaRAnalysis {
    confidence_levels: number[];
    var_values: number[];
    expected_shortfall: number[];
    tail_risk_metrics: TailRiskMetrics;
}

// Метрики хвостового риска
export interface TailRiskMetrics {
    tail_var: number;
    tail_expectation: number;
    extreme_value_threshold: number;
    tail_index: number;
}

// Вариант снижения рисков
export interface RiskMitigationOption {
    option_id: string;
    name: string;
    description: string;
    mitigation_type: 'accept' | 'avoid' | 'transfer' | 'mitigate';
    effectiveness: number;
    cost: number;
    implementation_time: string;
    residual_risk: number;
    cost_benefit_ratio: number;
    implementation_steps: string[];
}

// Рекомендация ML
export interface MLRecommendation {
    recommendation_id: string;
    category: 'security' | 'performance' | 'compliance' | 'optimization';
    priority: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    rationale: string;
    supporting_evidence: string[];
    confidence: number;
    potential_impact: string;
    implementation_guidance: string[];
    success_metrics: string[];
}

// Метрики производительности ML
export interface MLPerformanceMetrics {
    overall_accuracy: number;
    precision_by_class: Record<string, number>;
    recall_by_class: Record<string, number>;
    f1_score_by_class: Record<string, number>;
    confusion_matrix: ConfusionMatrix;
    roc_auc: number;
    pr_auc: number;
    log_loss: number;
    feature_importance_stability: number;
    model_drift_detection: ModelDriftDetection;
}

// Матрица ошибок
export interface ConfusionMatrix {
    true_positives: number;
    true_negatives: number;
    false_positives: number;
    false_negatives: number;
    classification_report: ClassificationReport;
}

// Отчет о классификации
export interface ClassificationReport {
    classes: string[];
    precision: number[];
    recall: number[];
    f1_score: number[];
    support: number[];
    accuracy: number;
    macro_avg: ClassificationMetrics;
    weighted_avg: ClassificationMetrics;
}

// Метрики классификации
export interface ClassificationMetrics {
    precision: number;
    recall: number;
    f1_score: number;
    support: number;
}

// Обнаружение дрейфа модели
export interface ModelDriftDetection {
    drift_detected: boolean;
    drift_score: number;
    drift_type: 'concept' | 'data' | 'prediction';
    drift_explanation: string;
    recommended_actions: string[];
    last_retrain_date: string;
    performance_degradation: number;
}

// Анализ бизнес-воздействия
export interface BusinessImpactAnalysis {
    analysis_id: string;
    analysis_date: string;
    business_metrics: BusinessMetric[];
    risk_quantification: RiskQuantification;
    cost_analysis: CostAnalysis;
    operational_impact: OperationalImpact;
    strategic_implications: StrategicImplication[];
    stakeholder_analysis: StakeholderAnalysis;
    decision_support: DecisionSupport;
}

// Бизнес-метрика
export interface BusinessMetric {
    metric_id: string;
    name: string;
    category: 'financial' | 'operational' | 'customer' | 'risk' | 'compliance';
    current_value: number;
    baseline_value: number;
    target_value: number;
    variance: number;
    trend: 'improving' | 'declining' | 'stable' | 'volatile';
    business_significance: string;
    kpi_alignment: string[];
}

// Квантификация рисков
export interface RiskQuantification {
    financial_risk: FinancialRisk;
    operational_risk: OperationalRisk;
    reputational_risk: ReputationalRisk;
    regulatory_risk: RegulatoryRisk;
    strategic_risk: StrategicRisk;
    aggregated_risk: AggregatedRisk;
}

// Финансовый риск
export interface FinancialRisk {
    potential_loss: number;
    revenue_impact: number;
    cost_impact: number;
    cash_flow_impact: number;
    market_value_impact: number;
    probability_distribution: ProbabilityDistribution;
    time_horizon: string;
}

// Распределение вероятностей
export interface ProbabilityDistribution {
    distribution_type: string;
    parameters: Record<string, number>;
    percentiles: Record<string, number>;
    expected_value: number;
    confidence_intervals: ConfidenceInterval[];
}

// Операционный риск
export interface OperationalRisk {
    service_disruption_risk: number;
    productivity_impact: number;
    customer_satisfaction_impact: number;
    supply_chain_risk: number;
    human_resource_impact: number;
    recovery_time_objective: string;
    recovery_point_objective: string;
}

// Репутационный риск
export interface ReputationalRisk {
    brand_value_impact: number;
    customer_trust_impact: number;
    media_attention_probability: number;
    social_media_sentiment_impact: number;
    stakeholder_confidence_impact: number;
    recovery_timeline: string;
}

// Регуляторный риск
export interface RegulatoryRisk {
    compliance_violation_probability: number;
    potential_fines: number;
    regulatory_action_probability: number;
    license_revocation_risk: number;
    audit_frequency_increase: number;
    regulatory_frameworks_affected: string[];
}

// Стратегический риск
export interface StrategicRisk {
    competitive_advantage_impact: number;
    market_position_impact: number;
    innovation_capability_impact: number;
    partnership_risk: number;
    growth_opportunity_impact: number;
    strategic_objective_alignment: string[];
}

// Агрегированный риск
export interface AggregatedRisk {
    total_risk_score: number;
    risk_level: 'low' | 'medium' | 'high' | 'critical';
    risk_appetite_alignment: string;
    risk_capacity_utilization: number;
    diversification_benefits: number;
    correlation_effects: CorrelationEffect[];
}

// Эффект корреляции
export interface CorrelationEffect {
    risk_pair: [string, string];
    correlation_coefficient: number;
    correlation_type: 'positive' | 'negative' | 'independent';
    diversification_benefit: number;
}

// Анализ стоимости
export interface CostAnalysis {
    direct_costs: DirectCost[];
    indirect_costs: IndirectCost[];
    opportunity_costs: OpportunityCost[];
    total_cost_of_ownership: number;
    cost_benefit_analysis: CostBenefitAnalysis;
    sensitivity_analysis: CostSensitivityAnalysis;
}

// Прямые расходы
export interface DirectCost {
    cost_category: string;
    cost_amount: number;
    frequency: 'one_time' | 'monthly' | 'quarterly' | 'annually';
    cost_driver: string;
    variance_risk: number;
    cost_justification: string;
}

// Косвенные расходы
export interface IndirectCost {
    cost_category: string;
    cost_amount: number;
    allocation_method: string;
    cost_driver: string;
    impact_areas: string[];
    measurement_uncertainty: number;
}

// Альтернативные расходы
export interface OpportunityCost {
    opportunity_description: string;
    foregone_value: number;
    probability_of_realization: number;
    time_sensitivity: string;
    strategic_importance: string;
}

// Анализ затрат и выгод
export interface CostBenefitAnalysis {
    total_costs: number;
    total_benefits: number;
    net_present_value: number;
    internal_rate_of_return: number;
    payback_period: string;
    benefit_cost_ratio: number;
    break_even_analysis: BreakEvenAnalysis;
}

// Анализ безубыточности
export interface BreakEvenAnalysis {
    break_even_point: number;
    break_even_time: string;
    contribution_margin: number;
    fixed_costs: number;
    variable_costs: number;
    sensitivity_factors: string[];
}

// Анализ чувствительности стоимости
export interface CostSensitivityAnalysis {
    sensitive_cost_drivers: string[];
    cost_elasticity: CostElasticity[];
    scenario_analysis: CostScenarioAnalysis[];
    monte_carlo_results: CostMonteCarloResult;
}

// Эластичность стоимости
export interface CostElasticity {
    cost_driver: string;
    elasticity_coefficient: number;
    elasticity_type: 'elastic' | 'inelastic' | 'unitary';
    confidence_interval: [number, number];
}

// Анализ сценариев стоимости
export interface CostScenarioAnalysis {
    scenario_name: string;
    scenario_probability: number;
    total_cost: number;
    cost_variance: number;
    key_assumptions: string[];
    risk_factors: string[];
}

// Результат Монте-Карло для стоимости
export interface CostMonteCarloResult {
    simulation_runs: number;
    mean_cost: number;
    cost_distribution: CostDistribution;
    confidence_levels: CostConfidenceLevel[];
    risk_metrics: CostRiskMetrics;
}

// Распределение стоимости
export interface CostDistribution {
    percentiles: Record<string, number>;
    probability_density: ProbabilityDensityPoint[];
    cumulative_distribution: CumulativeDistributionPoint[];
}

// Уровень доверия по стоимости
export interface CostConfidenceLevel {
    confidence_percentage: number;
    cost_lower_bound: number;
    cost_upper_bound: number;
    interval_width: number;
}

// Метрики риска стоимости
export interface CostRiskMetrics {
    cost_at_risk: number;
    expected_shortfall: number;
    probability_of_overrun: number;
    maximum_likely_cost: number;
}

// Операционное воздействие
export interface OperationalImpact {
    process_impacts: ProcessImpact[];
    resource_impacts: ResourceImpact[];
    performance_impacts: PerformanceImpact[];
    service_level_impacts: ServiceLevelImpact[];
    capacity_impacts: CapacityImpact[];
    efficiency_metrics: EfficiencyMetrics;
}

// Воздействие на процесс
export interface ProcessImpact {
    process_name: string;
    impact_type: 'disruption' | 'delay' | 'quality' | 'capacity';
    impact_severity: 'low' | 'medium' | 'high' | 'critical';
    impact_duration: string;
    affected_stakeholders: string[];
    mitigation_options: string[];
    recovery_actions: string[];
}

// Воздействие на ресурсы
export interface ResourceImpact {
    resource_type: 'human' | 'financial' | 'technological' | 'physical';
    resource_name: string;
    impact_description: string;
    availability_impact: number;
    utilization_impact: number;
    cost_impact: number;
    alternatives_available: string[];
}

// Воздействие на производительность
export interface PerformanceImpact {
    performance_metric: string;
    baseline_value: number;
    projected_value: number;
    impact_percentage: number;
    confidence_level: number;
    measurement_method: string;
    improvement_potential: number;
}

// Воздействие на уровень сервиса
export interface ServiceLevelImpact {
    service_name: string;
    sla_metric: string;
    current_performance: number;
    target_performance: number;
    projected_performance: number;
    customer_impact: string;
    penalty_costs: number;
}

// Воздействие на мощность
export interface CapacityImpact {
    capacity_type: string;
    current_capacity: number;
    required_capacity: number;
    capacity_gap: number;
    scaling_options: ScalingOption[];
    investment_required: number;
}

// Вариант масштабирования
export interface ScalingOption {
    option_name: string;
    capacity_increase: number;
    implementation_time: string;
    cost: number;
    risk_level: 'low' | 'medium' | 'high' | 'critical';
    dependencies: string[];
}

// Метрики эффективности
export interface EfficiencyMetrics {
    productivity_metrics: ProductivityMetric[];
    quality_metrics: QualityMetric[];
    cost_efficiency: CostEfficiencyMetric[];
    time_efficiency: TimeEfficiencyMetric[];
    resource_utilization: ResourceUtilizationMetric[];
}

// Метрика производительности
export interface ProductivityMetric {
    metric_name: string;
    current_value: number;
    benchmark_value: number;
    target_value: number;
    improvement_potential: number;
    measurement_unit: string;
}

// Метрика качества
export interface QualityMetric {
    metric_name: string;
    current_score: number;
    target_score: number;
    quality_dimension: string;
    improvement_actions: string[];
    measurement_frequency: string;
}

// Метрика эффективности затрат
export interface CostEfficiencyMetric {
    metric_name: string;
    cost_per_unit: number;
    benchmark_cost: number;
    efficiency_ratio: number;
    improvement_opportunities: string[];
    cost_drivers: string[];
}

// Метрика временной эффективности
export interface TimeEfficiencyMetric {
    metric_name: string;
    cycle_time: number;
    target_time: number;
    time_savings_potential: number;
    bottlenecks: string[];
    optimization_opportunities: string[];
}

// Метрика использования ресурсов
export interface ResourceUtilizationMetric {
    resource_type: string;
    utilization_rate: number;
    optimal_utilization: number;
    efficiency_gap: number;
    optimization_actions: string[];
    cost_impact: number;
}

// Стратегическое влияние
export interface StrategicImplication {
    implication_id: string;
    category: 'market_position' | 'competitive_advantage' | 'innovation' | 'partnerships' | 'growth';
    impact_level: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    strategic_objectives_affected: string[];
    time_horizon: 'short_term' | 'medium_term' | 'long_term';
    probability: number;
    potential_responses: StrategicResponse[];
}

// Стратегический ответ
export interface StrategicResponse {
    response_id: string;
    response_type: 'reactive' | 'proactive' | 'adaptive';
    description: string;
    resource_requirements: string[];
    timeline: string;
    success_probability: number;
    risk_level: 'low' | 'medium' | 'high' | 'critical';
}

// Анализ заинтересованных сторон
export interface StakeholderAnalysis {
    stakeholder_groups: StakeholderGroup[];
    impact_assessment: StakeholderImpactAssessment[];
    communication_plan: CommunicationPlan;
    engagement_strategy: EngagementStrategy;
    conflict_resolution: ConflictResolution[];
}

// Группа заинтересованных сторон
export interface StakeholderGroup {
    group_id: string;
    name: string;
    type: 'internal' | 'external';
    influence_level: 'low' | 'medium' | 'high' | 'critical';
    interest_level: 'low' | 'medium' | 'high' | 'critical';
    attitude: 'supportive' | 'neutral' | 'resistant';
    key_concerns: string[];
    success_criteria: string[];
}

// Оценка воздействия на заинтересованные стороны
export interface StakeholderImpactAssessment {
    stakeholder_group: string;
    impact_areas: string[];
    impact_severity: 'low' | 'medium' | 'high' | 'critical';
    impact_probability: number;
    mitigation_strategies: string[];
    communication_requirements: string[];
}

// План коммуникации
export interface CommunicationPlan {
    communication_objectives: string[];
    key_messages: KeyMessage[];
    communication_channels: CommunicationChannel[];
    timeline: CommunicationTimeline[];
    feedback_mechanisms: string[];
    success_metrics: string[];
}

// Ключевое сообщение
export interface KeyMessage {
    message_id: string;
    target_audience: string;
    core_message: string;
    supporting_points: string[];
    delivery_method: string;
    frequency: string;
    success_metrics: string[];
}

// Канал связи
export interface CommunicationChannel {
    channel_id: string;
    channel_type: 'email' | 'meeting' | 'portal' | 'newsletter' | 'presentation';
    target_audience: string[];
    frequency: string;
    effectiveness_rating: number;
    cost: number;
}

// Временная шкала коммуникации
export interface CommunicationTimeline {
    phase: string;
    start_date: string;
    end_date: string;
    activities: string[];
    deliverables: string[];
    responsible_parties: string[];
}

// Стратегия вовлечения
export interface EngagementStrategy {
    strategy_objectives: string[];
    engagement_levels: EngagementLevel[];
    engagement_activities: EngagementActivity[];
    success_metrics: string[];
    resource_requirements: string[];
}

// Уровень вовлечения
export interface EngagementLevel {
    level_name: string;
    description: string;
    stakeholder_groups: string[];
    engagement_methods: string[];
    success_indicators: string[];
}

// Активность вовлечения
export interface EngagementActivity {
    activity_id: string;
    activity_name: string;
    description: string;
    target_stakeholders: string[];
    timeline: string;
    resources_required: string[];
    expected_outcomes: string[];
}

// Разрешение конфликта
export interface ConflictResolution {
    conflict_id: string;
    stakeholders_involved: string[];
    conflict_description: string;
    root_causes: string[];
    resolution_strategies: string[];
    mediation_requirements: string[];
    success_criteria: string[];
}

// Поддержка принятия решений
export interface DecisionSupport {
    decision_points: DecisionPoint[];
    decision_criteria: DecisionCriteria[];
    alternatives_analysis: AlternativeAnalysis[];
    recommendation: DecisionRecommendation;
    risk_assessment: DecisionRiskAssessment;
    implementation_roadmap: ImplementationRoadmap;
}

// Точка принятия решений
export interface DecisionPoint {
    decision_id: string;
    decision_name: string;
    decision_type: 'strategic' | 'operational' | 'tactical';
    urgency: 'low' | 'medium' | 'high' | 'critical';
    stakeholders: string[];
    information_requirements: string[];
    deadline: string;
}

// Критерии принятия решений
export interface DecisionCriteria {
    criteria_id: string;
    criteria_name: string;
    weight: number;
    measurement_scale: string;
    acceptable_threshold: number;
    evaluation_method: string;
}

// Анализ альтернатив
export interface AlternativeAnalysis {
    alternative_id: string;
    alternative_name: string;
    description: string;
    evaluation_scores: EvaluationScore[];
    total_score: number;
    ranking: number;
    pros: string[];
    cons: string[];
    assumptions: string[];
}

// Оценочный балл
export interface EvaluationScore {
    criteria_id: string;
    raw_score: number;
    weighted_score: number;
    confidence_level: number;
    justification: string;
}

// Рекомендация по решению
export interface DecisionRecommendation {
    recommended_alternative: string;
    rationale: string;
    confidence_level: number;
    key_benefits: string[];
    key_risks: string[];
    success_factors: string[];
    implementation_considerations: string[];
}

// Оценка рисков решения
export interface DecisionRiskAssessment {
    decision_risks: DecisionRisk[];
    mitigation_strategies: RiskMitigationStrategy[];
    contingency_plans: ContingencyPlan[];
    monitoring_requirements: string[];
}

// Риск решения
export interface DecisionRisk {
    risk_id: string;
    risk_description: string;
    probability: 'low' | 'medium' | 'high' | 'critical';
    impact: 'low' | 'medium' | 'high' | 'critical';
    risk_score: number;
    risk_category: string;
    early_warning_indicators: string[];
}

// Стратегия снижения рисков
export interface RiskMitigationStrategy {
    strategy_id: string;
    target_risks: string[];
    strategy_description: string;
    implementation_steps: string[];
    resource_requirements: string[];
    effectiveness_rating: number;
    cost: number;
}

// План действий в чрезвычайных ситуациях
export interface ContingencyPlan {
    plan_id: string;
    trigger_conditions: string[];
    response_actions: string[];
    responsible_parties: string[];
    timeline: string;
    resource_requirements: string[];
    communication_plan: string;
}

// Дорожная карта реализации
export interface ImplementationRoadmap {
    phases: ImplementationPhase[];
    milestones: Milestone[];
    dependencies: Dependency[];
    critical_path: string[];
    resource_allocation: ResourceAllocation[];
    risk_mitigation: ImplementationRiskMitigation[];
}

// Фаза реализации
export interface ImplementationPhase {
    phase_id: string;
    phase_name: string;
    description: string;
    start_date: string;
    end_date: string;
    objectives: string[];
    deliverables: string[];
    success_criteria: string[];
    resources_required: string[];
}

// Веха
export interface Milestone {
    milestone_id: string;
    name: string;
    description: string;
    target_date: string;
    success_criteria: string[];
    dependencies: string[];
    approval_required: boolean;
    stakeholders: string[];
}

// Зависимость
export interface Dependency {
    dependency_id: string;
    predecessor: string;
    successor: string;
    dependency_type: 'finish_to_start' | 'start_to_start' | 'finish_to_finish' | 'start_to_finish';
    lag_time: string;
    critical: boolean;
}

// Выделение ресурсов
export interface ResourceAllocation {
    resource_type: string;
    resource_name: string;
    allocation_percentage: number;
    phases: string[];
    cost: number;
    availability_constraints: string[];
}

// Снижение рисков реализации
export interface ImplementationRiskMitigation {
    risk_id: string;
    mitigation_actions: string[];
    responsible_party: string;
    timeline: string;
    success_metrics: string[];
    fallback_options: string[];
}

// ===== API КЛАСС =====

/**
 * Enterprise Reconnaissance API Client
 * Класс для взаимодействия с API разведки с enterprise функциональностью
 */
export class EnterpriseReconnaissanceApiService {
    private apiClient: typeof api;
    private enterpriseEndpoint: string;

    constructor(apiClient: typeof api) {
        this.apiClient = apiClient;
        this.enterpriseEndpoint = '/api/enterprise/recon';
    }

    /**
    * Утилитарная функция для создания успешного ответа
    */
    private createSuccessResponse<T>(data: T, message: string): ApiResponse<T> {
        return {
            success: true,
            status: 'success',
            data,
            message,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Утилитарная функция для создания ответа с ошибкой
     */
    private createErrorResponse<T>(error: unknown, message: string): ApiResponse<T> {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
            success: false,
            status: 'error',
            error: errorMessage,
            message,
            timestamp: new Date().toISOString()
        };
    }

    // ===== ОСНОВНЫЕ МЕТОДЫ РАЗВЕДКИ =====

    /**
     * Получение списка сетевых интерфейсов
     */
    async getNetworkInterfaces(): Promise<ApiResponse<NetworkInterface[]>> {
        try {
            const response = await api.get<NetworkInterface[]>('/api/enterprise/recon/network/interfaces');

            return {
                success: true,
                status: 'success',
                data: response,
                message: 'Network interfaces retrieved successfully'
            };
        } catch (error) {
            console.error('Failed to get network interfaces:', error);
            const errorMessage = (error as any).message || 'Unknown error';

            return {
                success: false,
                status: 'error',
                error: errorMessage,
                message: 'Failed to retrieve network interfaces'
            };
        }
    }

    /**
     * Запуск enterprise разведки
     */
    async startNetworkScan(settings: EnterpriseReconSettings): Promise<ApiResponse<{ scan_id: string }>> {
        try {
            const response = await api.post<{ scan_id: string }>('/api/enterprise/recon/network/scan', settings);

            return {
                success: true,
                status: 'success',
                data: response,
                message: 'Network scan started successfully'
            };
        } catch (error) {
            console.error('Failed to start network scan:', error);
            const errorMessage = (error as any).message || 'Unknown error';
            return {
                success: false,
                status: 'error',
                error: errorMessage,
                message: 'Failed to start network scan'
            };
        }
    }

    /**
     * Получение статуса enterprise разведки
     */
    async getEnterpriseReconStatus(scanId: string): Promise<ApiResponse<EnterpriseReconResult>> {
        try {
            const response = await this.apiClient.get<EnterpriseReconResult>(
                `${this.enterpriseEndpoint}/status/${scanId}`
            );
            return {
                success: true,
                status: 'success',
                data: response,
                message: 'Статус enterprise разведки получен успешно'
            };
        } catch (error) {
            return {
                success: false,
                status: 'error',
                error: error instanceof Error ? error.message : 'Unknown error',
                message: 'Не удалось получить статус enterprise разведки'
            };
        }
    }

    /**
     * Остановка enterprise разведки
     */
    async stopScan(scanId: string): Promise<ApiResponse<void>> {
        try {
            await api.post(`/api/enterprise/recon/scan/${encodeURIComponent(scanId)}/stop`);
            return {
                success: true,
                status: 'success',
                message: 'Scan stopped successfully'
            };
        } catch (error) {
            console.error('Failed to stop scan:', error);
            return this.createErrorResponse(error, 'Failed to stop scan');
        }
    }

    /**
     * Запуск compliance проверки
     */
    async runComplianceCheck(checkSettings: ComplianceCheckSettings): Promise<ApiResponse<{ check_id: string }>> {
        try {
            const response = await api.post<{ check_id: string }>('/api/enterprise/recon/compliance/check', checkSettings);
            return {
                success: true,
                status: 'success',
                data: response,
                message: 'Compliance check started successfully'
            };
        } catch (error) {
            console.error('Failed to start compliance check:', error);
            return {
                success: false,
                status: 'error',
                error: error instanceof Error ? error.message : 'Unknown error',
                message: 'Failed to start compliance check'
            };
        }
    }

    /**
     * Получение результатов enterprise разведки
     */
    async getScanResults(scanId: string): Promise<ApiResponse<EnterpriseReconResult>> {
        try {
            const response = await api.get<EnterpriseReconResult>(`/api/enterprise/recon/scan/${encodeURIComponent(scanId)}/results`);
            return this.createSuccessResponse(response, 'Scan results retrieved successfully');
        } catch (error) {
            console.error('Failed to get scan results:', error);
            return this.createErrorResponse(error, 'Failed to retrieve scan results');
        }
    }

    // ===== МЕТОДЫ THREAT INTELLIGENCE =====

    /**
     * Получение данных threat intelligence
     */
    async getThreatIntelligence(filters: ThreatIntelligenceFilters = {}): Promise<ApiResponse<ThreatIntelligenceData>> {
        try {
            const queryParams = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    if (Array.isArray(value)) {
                        value.forEach(v => queryParams.append(key, String(v)));
                    } else {
                        queryParams.append(key, String(value));
                    }
                }
            });

            const url = `/api/enterprise/recon/threat-intelligence${queryParams.toString() ? `?${queryParams}` : ''}`;
            const response = await api.get<ThreatIntelligenceData>(url);
            return this.createSuccessResponse(response, 'Threat intelligence data retrieved successfully');
        } catch (error) {
            console.error('Failed to get threat intelligence:', error);
            return this.createErrorResponse(error, 'Failed to retrieve threat intelligence');
        }
    }

    /**
 * Получение устройств с фильтрами
 */
    async getEnterpriseDevices(filters: DeviceFilters = {}): Promise<ApiResponse<EnterpriseNetworkDevice[]>> {
        try {
            const queryParams = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    if (Array.isArray(value)) {
                        value.forEach(v => queryParams.append(key, String(v)));
                    } else {
                        queryParams.append(key, String(value));
                    }
                }
            });

            const url = `/api/enterprise/recon/devices${queryParams.toString() ? `?${queryParams}` : ''}`;
            const response = await api.get<EnterpriseNetworkDevice[]>(url);
            return this.createSuccessResponse(response, 'Enterprise devices retrieved successfully');
        } catch (error) {
            console.error('Failed to get enterprise devices:', error);
            return this.createErrorResponse(error, 'Failed to retrieve enterprise devices');
        }
    }

    /**
     * Экспорт данных разведки
     */
    async exportReconData(exportSettings: ReconExportSettings): Promise<ApiResponse<void>> {
        try {
            await api.post('/api/enterprise/recon/export', exportSettings);
            return {
                success: true,
                status: 'success',
                message: 'Export initiated successfully'
            };
        } catch (error) {
            console.error('Failed to export recon data:', error);
            return {
                success: false,
                status: 'error',
                error: error instanceof Error ? error.message : String(error),
                message: 'Failed to export reconnaissance data'
            };
        }
    }

    /**
     * Генерация отчета
     */
    async generateReconReport(reportSettings: ReconReportSettings): Promise<ApiResponse<{ report_id: string; download_url: string }>> {
        try {
            const response = await api.post<{ report_id: string; download_url: string }>('/api/enterprise/recon/reports/generate', reportSettings);
            return {
                success: true,
                status: 'success',
                data: response,
                message: 'Report generation started successfully'
            };
        } catch (error) {
            console.error('Failed to generate recon report:', error);
            return {
                success: false,
                status: 'error',
                error: error instanceof Error ? error.message : String(error),
                message: 'Failed to generate reconnaissance report'
            };
        }
    }

    /**
     * Получение статуса задачи
     */
    async getTaskStatus(taskId: string): Promise<ApiResponse<{ status: string; progress: number }>> {
        try {
            const response = await api.get<{ status: string; progress: number }>(`/api/enterprise/recon/tasks/${encodeURIComponent(taskId)}/status`);
            return {
                success: true,
                status: 'success',
                data: response,
                message: 'Task status retrieved successfully'
            };
        } catch (error) {
            console.error('Failed to get task status:', error);
            return {
                success: false,
                status: 'error',
                error: error instanceof Error ? error.message : String(error),
                message: 'Failed to retrieve task status'
            };
        }
    }

    /**
     * Обновление threat intelligence
     */
    async updateThreatIntelligence(sources?: string[]): Promise<ApiResponse<void>> {
        try {
            await this.apiClient.post(`${this.enterpriseEndpoint}/threat-intelligence/update`, {
                sources
            });
            return {
                success: true,
                status: 'success',
                message: 'Threat intelligence обновлен успешно'
            };
        } catch (error) {
            return {
                success: false,
                status: 'error',
                error: error instanceof Error ? error.message : 'Unknown error',
                message: 'Не удалось обновить threat intelligence'
            };
        }
    }

    // ===== МЕТОДЫ COMPLIANCE =====

    /**
     * Запуск проверки соответствия
     */
    async startComplianceCheck(
        scanId: string,
        frameworks: string[]
    ): Promise<ApiResponse<{ check_id: string }>> {
        try {
            const response = await this.apiClient.post<{ check_id: string }>(
                `${this.enterpriseEndpoint}/compliance/start`,
                { scan_id: scanId, frameworks }
            );
            return {
                success: true,
                status: 'success',
                data: response,
                message: 'Проверка соответствия запущена успешно'
            };
        } catch (error) {
            return {
                success: false,
                status: 'error',
                error: error instanceof Error ? error.message : String(error),
                message: 'Не удалось запустить проверку соответствия'
            };
        }
    }


    /**
     * Получение результатов соответствия
     */
    async getComplianceResults(checkId: string): Promise<ApiResponse<ComplianceResults>> {
        try {
            const response = await api.get<ComplianceResults>(`/api/enterprise/recon/compliance/${encodeURIComponent(checkId)}/results`);
            return this.createSuccessResponse(response, 'Compliance results retrieved successfully');
        } catch (error) {
            console.error('Failed to get compliance results:', error);
            return this.createErrorResponse(error, 'Failed to retrieve compliance results');
        }
    }

    /**
     * Получение ML инсайтов
     */
    async getMLInsights(analysisSettings: MLAnalysisSettings): Promise<ApiResponse<MachineLearningInsights>> {
        try {
            const response = await api.post<MachineLearningInsights>('/api/enterprise/recon/ml/insights', analysisSettings);
            return this.createSuccessResponse(response, 'ML insights generated successfully');
        } catch (error) {
            console.error('Failed to get ML insights:', error);
            return this.createErrorResponse(error, 'Failed to generate ML insights');
        }
    }

    /**
     * Тренировка ML модели
     */
    async trainMLModel(modelSettings: MLModelSettings): Promise<ApiResponse<{ model_id: string }>> {
        try {
            const response = await api.post<{ model_id: string }>('/api/enterprise/recon/ml/train', modelSettings);
            return {
                success: true,
                status: 'success',
                data: response,
                message: 'ML model training started successfully'
            };
        } catch (error) {
            console.error('Failed to start ML model training:', error);
            return {
                success: false,
                status: 'error',
                error: error instanceof Error ? error.message : String(error),
                message: 'Failed to start ML model training'
            };
        }
    }

    /**
     * Анализ бизнес-воздействия
     */
    async analyzeBusinessImpact(impactSettings: BusinessImpactSettings): Promise<ApiResponse<BusinessImpactAnalysis>> {
        try {
            const response = await api.post<BusinessImpactAnalysis>('/api/enterprise/recon/business-impact', impactSettings);
            return {
                success: true,
                status: 'success',
                data: response,
                message: 'Business impact analysis completed successfully'
            };
        } catch (error) {
            console.error('Failed to analyze business impact:', error);
            return {
                success: false,
                status: 'error',
                error: error instanceof Error ? error.message : String(error),
                message: 'Failed to analyze business impact'
            };
        }
    }


    // ===== МЕТОДЫ MACHINE LEARNING =====

    /**
     * Получение ML инсайтов
     */
    async getMachineLearningInsights(scanId: string): Promise<ApiResponse<MachineLearningInsights>> {
        try {
            const response = await this.apiClient.get<MachineLearningInsights>(
                `${this.enterpriseEndpoint}/ml/insights/${scanId}`
            );
            return {
                success: true,
                status: 'success',
                data: response,
                message: 'ML инсайты получены успешно'
            };
        } catch (error) {
            return {
                success: false,
                status: 'error',
                error: error instanceof Error ? error.message : 'Unknown error',
                message: 'Не удалось получить ML инсайты'
            };
        }
    }

    /**
     * Обучение ML модели
     */
    async trainMachineLearningModel(
        modelType: string,
        trainingData: any
    ): Promise<ApiResponse<{ model_id: string }>> {
        try {
            const response = await this.apiClient.post<{ model_id: string }>(
                `${this.enterpriseEndpoint}/ml/train`,
                { model_type: modelType, training_data: trainingData }
            );
            return {
                success: true,
                status: 'success',
                data: response,
                message: 'ML модель обучена успешно'
            };
        } catch (error) {
            return {
                success: false,
                status: 'error',
                error: error instanceof Error ? error.message : String(error),
                message: 'Не удалось обучить ML модель'
            };
        }
    }

    // ===== МЕТОДЫ BUSINESS ANALYSIS =====

    /**
     * Получение бизнес-анализа
     */
    async getBusinessAnalysis(scanId: string): Promise<ApiResponse<BusinessImpactAnalysis>> {
        try {
            const response = await this.apiClient.get<BusinessImpactAnalysis>(
                `${this.enterpriseEndpoint}/business/analysis/${scanId}`
            );
            return {
                success: true,
                status: 'success',
                data: response,
                message: 'Бизнес-анализ получен успешно'
            };
        } catch (error) {
            return {
                success: false,
                status: 'error',
                error: error instanceof Error ? error.message : String(error),
                message: 'Не удалось получить бизнес-анализ'
            };
        }
    }

    // ===== МЕТОДЫ ИНТЕГРАЦИЙ =====

    /**
     * Получение списка интеграций
     */
    async getIntegrations(): Promise<ApiResponse<EnterpriseIntegration[]>> {
        try {
            const response = await api.get<EnterpriseIntegration[]>('/api/enterprise/recon/integrations');
            return this.createSuccessResponse(response, 'Integrations retrieved successfully');
        } catch (error) {
            console.error('Failed to get integrations:', error);
            return this.createErrorResponse(error, 'Failed to retrieve integrations');
        }
    }

    /**
     * Конфигурирование интеграции
     */
    async configureIntegration(integrationId: string, config: IntegrationConfig): Promise<ApiResponse<{ status: string; message: string }>> {
        try {
            const response = await api.post<{ status: string; message: string }>(`/api/enterprise/recon/integrations/${encodeURIComponent(integrationId)}/configure`, config);
            return {
                success: true,
                status: 'success',
                data: response,
                message: 'Integration configured successfully'
            };
        } catch (error) {
            console.error('Failed to configure integration:', error);
            return {
                success: false,
                status: 'error',
                error: error instanceof Error ? error.message : String(error),
                message: 'Failed to configure integration'
            };
        }
    }
    /**
     * Тестирование интеграции
     */
    async testIntegration(integrationId: string): Promise<ApiResponse<{ status: string; message: string }>> {
        try {
            const response = await this.apiClient.post<{ status: string; message: string }>(
                `${this.enterpriseEndpoint}/integrations/${encodeURIComponent(integrationId)}/test`
            );
            return {
                success: true,
                status: 'success',
                data: response,
                message: 'Интеграция протестирована успешно'
            };
        } catch (error) {
            return {
                success: false,
                status: 'error',
                error: error instanceof Error ? error.message : String(error),
                message: 'Не удалось протестировать интеграцию'
            };
        }
    }

    // ===== МЕТОДЫ ASSET MANAGEMENT =====

    /**
     * Получение инвентаризации активов
     */
    async getAssetInventory(
        filters?: {
            categories?: string[];
            owners?: string[];
            locations?: string[];
            riskLevels?: string[];
        }
    ): Promise<ApiResponse<EnterpriseNetworkDevice[]>> {
        try {
            const queryParams = new URLSearchParams();
            if (filters) {
                Object.entries(filters).forEach(([key, value]) => {
                    if (value && Array.isArray(value)) {
                        value.forEach(v => queryParams.append(key, v));
                    }
                });
            }

            const url = `${this.enterpriseEndpoint}/assets/inventory${queryParams.toString() ? `?${queryParams}` : ''}`;
            const response = await this.apiClient.get<EnterpriseNetworkDevice[]>(url);

            return {
                success: true,
                status: 'success',
                data: response,
                message: 'Инвентаризация активов получена успешно'
            };
        } catch (error) {
            return {
                success: false,
                status: 'error',
                error: error instanceof Error ? error.message : 'Unknown error',
                message: 'Не удалось получить инвентаризацию активов'
            };
        }
    }

    /**
     * Обновление классификации актива
     */
    async updateAssetClassification(
        assetId: string,
        classification: AssetClassification
    ): Promise<ApiResponse<void>> {
        try {
            await this.apiClient.put(
                `${this.enterpriseEndpoint}/assets/${encodeURIComponent(assetId)}/classification`,
                classification
            );
            return {
                success: true,
                status: 'success',
                message: 'Классификация актива обновлена успешно'
            };
        } catch (error) {
            return {
                success: false,
                status: 'error',
                error: error instanceof Error ? error.message : String(error),
                message: 'Не удалось обновить классификацию актива'
            };
        }
    }

    // ===== МЕТОДЫ REPORTING =====

    /**
     * Генерация enterprise отчета
     */
    async generateEnterpriseReport(
        scanId: string,
        format: 'pdf' | 'html' | 'json' | 'excel',
        sections?: string[]
    ): Promise<ApiResponse<{ report_id: string; download_url: string }>> {
        try {
            const response = await this.apiClient.post<{ report_id: string; download_url: string }>(
                `${this.enterpriseEndpoint}/reports/generate`,
                { scan_id: scanId, format, sections }
            );
            return {
                success: true,
                status: 'success',
                data: response,
                message: 'Enterprise отчет сгенерирован успешно'
            };
        } catch (error) {
            return {
                success: false,
                status: 'error',
                error: error instanceof Error ? error.message : String(error),
                message: 'Не удалось сгенерировать enterprise отчет'
            };
        }
    }

    /**
     * Получение статуса генерации отчета
     */
    async getReportStatus(reportId: string): Promise<ApiResponse<{ status: string; progress: number }>> {
        try {
            const response = await this.apiClient.get<{ status: string; progress: number }>(
                `${this.enterpriseEndpoint}/reports/status/${encodeURIComponent(reportId)}`
            );
            return {
                success: true,
                status: 'success',
                data: response,
                message: 'Статус отчета получен успешно'
            };
        } catch (error) {
            return {
                success: false,
                status: 'error',
                error: error instanceof Error ? error.message : String(error),
                message: 'Не удалось получить статус отчета'
            };
        }
    }

    // ===== УТИЛИТАРНЫЕ МЕТОДЫ =====

    /**
     * Получение настроек по умолчанию
     */
    getDefaultSettings(): EnterpriseReconSettings {
        return {
            // Базовые настройки
            selectedInterface: '',
            networkRange: '192.168.1.0/24',
            scanType: 'comprehensive',
            scanPorts: true,
            portRange: '1-65535',
            detectOS: true,
            detectServices: true,
            aggressiveMode: false,
            stealthMode: false,
            timeout: 30000,
            maxThreads: 50,
            excludeHosts: '',

            // Enterprise расширения
            enableThreatIntelligence: true,
            enableMachineLearning: true,
            enableBehavioralAnalysis: false,
            enableComplianceChecks: true,
            enableAssetClassification: true,
            enableVulnerabilityCorrelation: true,
            customRulesets: ['default', 'enterprise', 'security'],

            // Интеграции по умолчанию
            enterpriseIntegrations: [
                {
                    id: 'default_siem',
                    type: 'siem',
                    name: 'Default SIEM Integration',
                    endpoint: '',
                    enabled: false,
                    configuration: {},
                    syncStatus: 'pending'
                }
            ],

            // Бизнес-контекст по умолчанию
            businessContext: {
                organizationId: '',
                department: 'IT Security',
                businessUnit: 'Infrastructure',
                environment: 'production',
                criticality: 'medium',
                owner: '',
                contactEmail: '',
                businessHours: '09:00-18:00',
                maintenanceWindows: ['02:00-04:00'],
                tags: ['network', 'security', 'assessment'],
                customFields: {}
            },

            // Классификация рисков
            riskClassification: {
                dataClassification: 'internal',
                assetValue: 'medium',
                businessImpact: 'medium',
                regulatoryRequirements: ['GDPR', 'SOX'],
                riskTolerance: 'medium'
            },

            // Фреймворки соответствия
            complianceFrameworks: ['PCI-DSS', 'ISO27001', 'NIST']
        };
    }

    /**
     * Валидация настроек разведки
     */
    validateSettings(settings: EnterpriseReconSettings): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        // Валидация базовых настроек
        if (!settings.networkRange) {
            errors.push('Не указан диапазон сети для сканирования');
        }

        if (settings.timeout < 1000) {
            errors.push('Таймаут должен быть не менее 1000 мс');
        }

        if (settings.maxThreads < 1 || settings.maxThreads > 1000) {
            errors.push('Количество потоков должно быть от 1 до 1000');
        }

        // Валидация сетевого диапазона
        if (settings.networkRange) {
            const cidrRegex = /^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/;
            const rangeRegex = /^(\d{1,3}\.){3}\d{1,3}-(\d{1,3}\.){3}\d{1,3}$/;
            const singleIpRegex = /^(\d{1,3}\.){3}\d{1,3}$/;

            if (!cidrRegex.test(settings.networkRange) &&
                !rangeRegex.test(settings.networkRange) &&
                !singleIpRegex.test(settings.networkRange)) {
                errors.push('Неверный формат диапазона сети');
            }
        }

        // Валидация портов
        if (settings.scanPorts && settings.portRange) {
            const portRegex = /^(\d+(-\d+)?)(,\d+(-\d+)?)*$/;
            if (!portRegex.test(settings.portRange.replace(/\s/g, ''))) {
                errors.push('Неверный формат диапазона портов');
            }
        }

        // Валидация enterprise настроек
        if (settings.enterpriseIntegrations) {
            settings.enterpriseIntegrations.forEach((integration, index) => {
                if (!integration.name) {
                    errors.push(`Интеграция ${index + 1}: не указано имя`);
                }
                if (integration.enabled && !integration.endpoint) {
                    errors.push(`Интеграция "${integration.name}": не указан endpoint для активной интеграции`);
                }
            });
        }

        // Валидация бизнес-контекста
        if (settings.businessContext) {
            if (!settings.businessContext.owner) {
                errors.push('Не указан владелец в бизнес-контексте');
            }
            if (!settings.businessContext.contactEmail) {
                errors.push('Не указан контактный email в бизнес-контексте');
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Оптимизация настроек для производительности
     */
    optimizeSettings(settings: EnterpriseReconSettings, targetType: 'speed' | 'accuracy' | 'stealth'): EnterpriseReconSettings {
        const optimized = { ...settings };

        switch (targetType) {
            case 'speed':
                optimized.timeout = 5000;
                optimized.maxThreads = 100;
                optimized.aggressiveMode = true;
                optimized.stealthMode = false;
                optimized.detectOS = false;
                optimized.enableBehavioralAnalysis = false;
                optimized.enableMachineLearning = false;
                break;

            case 'accuracy':
                optimized.timeout = 60000;
                optimized.maxThreads = 20;
                optimized.aggressiveMode = false;
                optimized.stealthMode = false;
                optimized.detectOS = true;
                optimized.detectServices = true;
                optimized.enableBehavioralAnalysis = true;
                optimized.enableMachineLearning = true;
                optimized.enableVulnerabilityCorrelation = true;
                break;

            case 'stealth':
                optimized.timeout = 30000;
                optimized.maxThreads = 5;
                optimized.aggressiveMode = false;
                optimized.stealthMode = true;
                optimized.enableThreatIntelligence = false;
                break;
        }

        return optimized;
    }

    /**
     * Получение предустановленных профилей
     */
    getPresetProfiles(): Array<{ id: string; name: string; description: string; settings: Partial<EnterpriseReconSettings> }> {
        return [
            {
                id: 'quick_scan',
                name: 'Быстрое сканирование',
                description: 'Быстрая разведка для получения общего обзора сети',
                settings: {
                    scanType: 'ping_sweep',
                    timeout: 5000,
                    maxThreads: 50,
                    detectOS: false,
                    detectServices: false,
                    enableMachineLearning: false,
                    enableBehavioralAnalysis: false
                }
            },
            {
                id: 'comprehensive_scan',
                name: 'Полное сканирование',
                description: 'Детальная разведка с использованием всех возможностей',
                settings: {
                    scanType: 'comprehensive',
                    timeout: 60000,
                    maxThreads: 20,
                    detectOS: true,
                    detectServices: true,
                    enableMachineLearning: true,
                    enableBehavioralAnalysis: true,
                    enableVulnerabilityCorrelation: true,
                    enableComplianceChecks: true
                }
            },
            {
                id: 'stealth_scan',
                name: 'Скрытое сканирование',
                description: 'Незаметная разведка с минимальным воздействием на сеть',
                settings: {
                    scanType: 'tcp_syn',
                    timeout: 30000,
                    maxThreads: 5,
                    stealthMode: true,
                    aggressiveMode: false,
                    enableThreatIntelligence: false
                }
            },
            {
                id: 'compliance_scan',
                name: 'Сканирование соответствия',
                description: 'Специализированное сканирование для проверки соответствия стандартам',
                settings: {
                    scanType: 'compliance_scan',
                    enableComplianceChecks: true,
                    enableAssetClassification: true,
                    complianceFrameworks: ['PCI-DSS', 'ISO27001', 'NIST', 'GDPR']
                }
            },
            {
                id: 'threat_hunting',
                name: 'Поиск угроз',
                description: 'Активный поиск индикаторов компрометации и угроз',
                settings: {
                    scanType: 'threat_hunting',
                    enableThreatIntelligence: true,
                    enableMachineLearning: true,
                    enableBehavioralAnalysis: true,
                    customRulesets: ['threat_hunting', 'ioc_detection', 'behavioral_analysis']
                }
            }
        ];
    }
}

// ===== СОЗДАНИЕ ЭКЗЕМПЛЯРА API =====

// Создаем и экспортируем экземпляр API
export const reconApi = new EnterpriseReconnaissanceApiService(api);

// ===== ДОПОЛНИТЕЛЬНЫЕ UTILITY ФУНКЦИИ =====

/**
 * Преобразование базовых настроек в enterprise
 */
export function upgradeToEnterpriseSettings(basicSettings: any): EnterpriseReconSettings {
    const defaultSettings = reconApi.getDefaultSettings();

    return {
        ...defaultSettings,
        // Переносим базовые настройки
        selectedInterface: basicSettings.selectedInterface || defaultSettings.selectedInterface,
        networkRange: basicSettings.networkRange || defaultSettings.networkRange,
        scanType: basicSettings.scanType || defaultSettings.scanType,
        scanPorts: basicSettings.scanPorts ?? defaultSettings.scanPorts,
        portRange: basicSettings.portRange || defaultSettings.portRange,
        detectOS: basicSettings.detectOS ?? defaultSettings.detectOS,
        detectServices: basicSettings.detectServices ?? defaultSettings.detectServices,
        aggressiveMode: basicSettings.aggressiveMode ?? defaultSettings.aggressiveMode,
        stealthMode: basicSettings.stealthMode ?? defaultSettings.stealthMode,
        timeout: basicSettings.timeout || defaultSettings.timeout,
        maxThreads: basicSettings.maxThreads || defaultSettings.maxThreads,
        excludeHosts: basicSettings.excludeHosts || defaultSettings.excludeHosts
    };
}

/**
 * Валидация IP адреса или диапазона
 */
export function validateNetworkRange(range: string): boolean {
    // CIDR нотация (192.168.1.0/24)
    const cidrRegex = /^(\d{1,3}\.){3}\d{1,3}\/([0-9]|[1-2][0-9]|3[0-2])$/;

    // Диапазон IP (192.168.1.1-192.168.1.254)
    const rangeRegex = /^(\d{1,3}\.){3}\d{1,3}-(\d{1,3}\.){3}\d{1,3}$/;

    // Одиночный IP
    const singleIpRegex = /^(\d{1,3}\.){3}\d{1,3}$/;

    // Список IP через запятую
    const listRegex = /^(\d{1,3}\.){3}\d{1,3}(,\s*(\d{1,3}\.){3}\d{1,3})*$/;

    if (cidrRegex.test(range) || rangeRegex.test(range) || singleIpRegex.test(range) || listRegex.test(range)) {
        // Дополнительная проверка валидности октетов
        const ips = range.split(/[,\/-]/).map(ip => ip.trim());
        return ips.every(ip => {
            if (ip.includes('.')) {
                const octets = ip.split('.');
                return octets.length === 4 && octets.every(octet => {
                    const num = parseInt(octet, 10);
                    return num >= 0 && num <= 255;
                });
            }
            return true; // Для CIDR маски или номеров портов
        });
    }

    return false;
}

/**
 * Валидация диапазона портов
 */
export function validatePortRange(portRange: string): boolean {
    try {
        const parts = portRange.split(',');

        for (const part of parts) {
            const trimmedPart = part.trim();

            if (trimmedPart.includes('-')) {
                // Проверка диапазона
                const [startStr, endStr] = trimmedPart.split('-');
                const start = parseInt(startStr?.trim() || '0', 10);
                const end = parseInt(endStr?.trim() || '0', 10);

                if (isNaN(start) || isNaN(end) || start < 1 || start > 65535 || end < 1 || end > 65535 || start > end) {
                    return false;
                }
            } else {
                // Проверка отдельного порта
                const port = parseInt(trimmedPart, 10);
                if (isNaN(port) || port < 1 || port > 65535) {
                    return false;
                }
            }
        }

        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Форматирование времени выполнения
 */
export function formatDuration(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
        return `${hours}ч ${minutes % 60}м ${seconds % 60}с`;
    } else if (minutes > 0) {
        return `${minutes}м ${seconds % 60}с`;
    } else {
        return `${seconds}с`;
    }
}

/**
 * Генерация отчета по результатам разведки
 */
export function generateReconSummary(result: EnterpriseReconResult): string {
    const duration = formatDuration(result.statistics.scan_duration);
    const devicesFound = result.devices_discovered.length;
    const vulnerabilitiesFound = result.statistics.vulnerabilities_found;
    const threatsDetected = result.statistics.threats_detected;

    let summary = `🔍 **Разведка завершена**\n\n`;
    summary += `**Основные результаты:**\n`;
    summary += `• Длительность: ${duration}\n`;
    summary += `• Найдено устройств: ${devicesFound}\n`;
    summary += `• Обнаружено уязвимостей: ${vulnerabilitiesFound}\n`;
    summary += `• Выявлено угроз: ${threatsDetected}\n\n`;

    if (result.compliance_results) {
        summary += `**Соответствие стандартам:**\n`;
        summary += `• Общий балл: ${result.compliance_results.overall_score}%\n`;
        summary += `• Статус: ${result.compliance_results.compliance_level}\n\n`;
    }

    if (result.threat_intelligence) {
        summary += `**Анализ угроз:**\n`;
        summary += `• Активных кампаний: ${result.threat_intelligence.campaigns.length}\n`;
        summary += `• Индикаторов угроз: ${result.threat_intelligence.indicators.length}\n\n`;
    }

    if (result.ml_insights) {
        summary += `**Машинное обучение:**\n`;
        summary += `• Использовано моделей: ${result.ml_insights.models_used.length}\n`;
        summary += `• Точность предсказаний: ${result.ml_insights.model_performance.overall_accuracy}%\n\n`;
    }

    return summary;
}

/**
 * Экспорт настроек в JSON
 */
export function exportSettingsToJSON(settings: EnterpriseReconSettings): string {
    return JSON.stringify(settings, null, 2);
}

/**
 * Импорт настроек из JSON
 */
export function importSettingsFromJSON(json: string): EnterpriseReconSettings {
    try {
        const imported = JSON.parse(json);
        const defaultSettings = reconApi.getDefaultSettings();

        // Объединяем с настройками по умолчанию для обеспечения совместимости
        return {
            ...defaultSettings,
            ...imported
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new Error(`Ошибка импорта настроек: ${errorMessage}`);
    }
}

/**
 * Получение рекомендуемых настроек на основе сетевого окружения
 */
export function getRecommendedSettings(networkInfo: {
    networkSize: 'small' | 'medium' | 'large' | 'enterprise';
    securityLevel: 'low' | 'medium' | 'high' | 'critical';
    environment: 'development' | 'staging' | 'production';
}): Partial<EnterpriseReconSettings> {
    const recommendations: Partial<EnterpriseReconSettings> = {};

    // Настройки на основе размера сети
    switch (networkInfo.networkSize) {
        case 'small':
            recommendations.maxThreads = 10;
            recommendations.timeout = 15000;
            break;
        case 'medium':
            recommendations.maxThreads = 25;
            recommendations.timeout = 30000;
            break;
        case 'large':
            recommendations.maxThreads = 50;
            recommendations.timeout = 45000;
            break;
        case 'enterprise':
            recommendations.maxThreads = 100;
            recommendations.timeout = 60000;
            recommendations.enableMachineLearning = true;
            recommendations.enableBehavioralAnalysis = true;
            break;
    }

    // Настройки на основе уровня безопасности
    switch (networkInfo.securityLevel) {
        case 'low':
            recommendations.aggressiveMode = true;
            recommendations.enableThreatIntelligence = false;
            break;
        case 'medium':
            recommendations.enableThreatIntelligence = true;
            recommendations.enableComplianceChecks = true;
            break;
        case 'high':
            recommendations.enableThreatIntelligence = true;
            recommendations.enableComplianceChecks = true;
            recommendations.enableVulnerabilityCorrelation = true;
            break;
        case 'critical':
            recommendations.stealthMode = true;
            recommendations.enableThreatIntelligence = true;
            recommendations.enableComplianceChecks = true;
            recommendations.enableVulnerabilityCorrelation = true;
            recommendations.enableBehavioralAnalysis = true;
            break;
    }

    // Настройки на основе окружения
    switch (networkInfo.environment) {
        case 'development':
            recommendations.aggressiveMode = true;
            recommendations.enableComplianceChecks = false;
            break;
        case 'staging':
            recommendations.enableComplianceChecks = true;
            break;
        case 'production':
            recommendations.stealthMode = true;
            recommendations.enableComplianceChecks = true;
            recommendations.enableAssetClassification = true;
            break;
    }

    return recommendations;
}

// ===== КОНСТАНТЫ =====

export const RECON_SCAN_TYPES = {
    PING_SWEEP: 'ping_sweep',
    ARP_SCAN: 'arp_scan',
    TCP_SYN: 'tcp_syn',
    UDP_SCAN: 'udp_scan',
    COMPREHENSIVE: 'comprehensive',
    THREAT_HUNTING: 'threat_hunting',
    COMPLIANCE_SCAN: 'compliance_scan'
} as const;

export const RECON_PRIORITIES = {
    LOW: 'low',
    NORMAL: 'normal',
    HIGH: 'high',
    CRITICAL: 'critical',
    EMERGENCY: 'emergency'
} as const;

export const COMPLIANCE_FRAMEWORKS = {
    PCI_DSS: 'PCI-DSS',
    ISO27001: 'ISO27001',
    NIST: 'NIST',
    GDPR: 'GDPR',
    SOX: 'SOX',
    HIPAA: 'HIPAA',
    SOC2: 'SOC2'
} as const;

// Метрики риска стоимости
export interface CostRiskMetrics {
    cost_at_risk: number;
    expected_shortfall: number;
    probability_of_overrun: number;
    maximum_likely_cost: number;
    budget_variance: number;
    cost_volatility: number;
}

// ===== ЭКСПОРТ ПО УМОЛЧАНИЮ =====

export default reconApi;
