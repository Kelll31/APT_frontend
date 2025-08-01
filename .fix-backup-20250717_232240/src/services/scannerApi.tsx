// frontend/src/services/scannerApi.ts

/**
 * IP Roast Enterprise - Scanner API Service v3.0 ENTERPRISE
 * Корпоративный API клиент для функций сканирования с расширенными возможностями
 */

import { api } from './api';
import type {
    ApiResponse,
    PortInfo,
    ServiceInfo,
    Vulnerability
} from './api';

// ===== ENTERPRISE ТИПЫ ДАННЫХ ДЛЯ СКАНИРОВАНИЯ =====

// Базовые настройки Enterprise сканирования
export interface EnterpriseScanSettings {
    target: string;
    ports: string;
    profile: 'quick' | 'balanced' | 'thorough' | 'stealth' | 'aggressive' | 'compliance' | 'threat_hunting' | 'custom';
    options?: EnterpriseScanOptions;
    custom_ports?: string;

    // Enterprise расширения
    tenant_id?: string;
    business_context?: BusinessScanContext;
    compliance_frameworks?: string[];
    threat_intelligence?: ThreatIntelligenceSettings;
    machine_learning?: MLScanSettings;
    automation?: AutomationSettings;
    integration?: IntegrationSettings;
    priority: 'low' | 'normal' | 'high' | 'critical' | 'emergency';
    tags?: string[];
    metadata?: Record<string, any>;
    resource_allocation?: ResourceAllocation;
    notification_settings?: ScanNotificationSettings;
    approval_workflow?: ApprovalWorkflowSettings;
}

// Enterprise опции сканирования
export interface EnterpriseScanOptions {
    // Базовые опции
    timing_template?: string;
    enable_scripts?: boolean;
    version_detection?: boolean;
    os_detection?: boolean;
    aggressive_mode?: boolean;
    stealth_mode?: boolean;
    no_resolve?: boolean;
    max_retries?: number;
    scan_delay?: number;
    host_timeout?: number;
    max_parallel_hosts?: number;
    exclude_hosts?: string;
    custom_scripts?: string;
    extra_args?: string;
    report_format?: 'html' | 'json' | 'xml' | 'pdf' | 'excel';

    // Enterprise опции
    enable_threat_detection?: boolean;
    enable_vulnerability_correlation?: boolean;
    enable_asset_discovery?: boolean;
    enable_compliance_checks?: boolean;
    enable_behavioral_analysis?: boolean;
    enable_ml_analysis?: boolean;
    deep_packet_inspection?: boolean;
    advanced_fingerprinting?: boolean;
    exploit_verification?: boolean;
    zero_day_detection?: boolean;
    lateral_movement_detection?: boolean;
    evasion_techniques?: string[];
    custom_payloads?: CustomPayload[];
    performance_profiling?: boolean;
    bandwidth_optimization?: boolean;
    distributed_scanning?: boolean;
    scan_coordination?: ScanCoordination;
}

// Бизнес-контекст сканирования
export interface BusinessScanContext {
    organization_id: string;
    business_unit: string;
    department: string;
    cost_center: string;
    project_code?: string;
    owner: string;
    stakeholders: string[];
    environment: 'production' | 'staging' | 'development' | 'testing' | 'disaster_recovery';
    criticality: 'low' | 'medium' | 'high' | 'critical';
    data_classification: 'public' | 'internal' | 'confidential' | 'restricted';
    regulatory_scope: string[];
    maintenance_window?: MaintenanceWindow;
    business_impact?: BusinessImpactSettings;
    sla_requirements?: SLARequirements;
}

// Окно обслуживания
export interface MaintenanceWindow {
    start_time: string;
    end_time: string;
    timezone: string;
    recurrence?: 'daily' | 'weekly' | 'monthly';
    exceptions?: string[];
    notifications?: string[];
}

// Настройки бизнес-воздействия
export interface BusinessImpactSettings {
    availability_impact: 'low' | 'medium' | 'high' | 'critical';
    performance_impact: 'low' | 'medium' | 'high' | 'critical';
    financial_impact_per_hour?: number;
    max_acceptable_downtime?: number;
    peak_usage_hours?: string[];
    dependent_systems?: string[];
}

// Требования SLA
export interface SLARequirements {
    max_scan_duration?: number;
    max_performance_impact?: number;
    availability_requirement?: number;
    response_time_requirement?: number;
    notification_requirements?: string[];
    escalation_procedures?: EscalationProcedure[];
}

// Процедура эскалации
export interface EscalationProcedure {
    trigger_condition: string;
    escalation_level: number;
    contacts: string[];
    actions: string[];
    timeframe: number;
}

// Настройки Threat Intelligence
export interface ThreatIntelligenceSettings {
    enabled: boolean;
    sources: TISource[];
    ioc_enrichment: boolean;
    threat_actor_attribution: boolean;
    campaign_correlation: boolean;
    real_time_feeds: boolean;
    historical_analysis: boolean;
    custom_indicators?: CustomIndicator[];
    confidence_threshold?: number;
    severity_threshold?: string;
}

// Источник TI
export interface TISource {
    name: string;
    type: 'commercial' | 'open_source' | 'government' | 'internal';
    priority: number;
    enabled: boolean;
    api_key?: string;
    feed_url?: string;
    update_frequency?: number;
}

// Кастомный индикатор
export interface CustomIndicator {
    type: 'ip' | 'domain' | 'hash' | 'signature' | 'behavior';
    value: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    confidence: number;
    tags: string[];
    expiry_date?: string;
}

// Настройки ML сканирования
export interface MLScanSettings {
    enabled: boolean;
    models: MLModel[];
    anomaly_detection: boolean;
    pattern_recognition: boolean;
    predictive_analysis: boolean;
    auto_classification: boolean;
    behavioral_baseline: boolean;
    adaptive_scanning: boolean;
    confidence_threshold?: number;
    learning_mode?: 'supervised' | 'unsupervised' | 'reinforcement';
}

// ML модель
export interface MLModel {
    id: string;
    name: string;
    type: 'classification' | 'regression' | 'clustering' | 'anomaly_detection';
    version: string;
    enabled: boolean;
    confidence_threshold: number;
    training_data_size?: number;
    accuracy?: number;
    last_trained?: string;
}

// Настройки автоматизации
export interface AutomationSettings {
    auto_schedule?: ScheduleSettings;
    auto_remediation?: RemediationSettings;
    auto_reporting?: AutoReportingSettings;
    auto_escalation?: AutoEscalationSettings;
    workflow_triggers?: WorkflowTrigger[];
    conditional_logic?: ConditionalLogic[];
}

// Настройки расписания
export interface ScheduleSettings {
    enabled: boolean;
    frequency: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'quarterly';
    interval: number;
    start_date: string;
    end_date?: string;
    timezone: string;
    maintenance_windows?: MaintenanceWindow[];
    conditions?: ScheduleCondition[];
}

// Условие расписания
export interface ScheduleCondition {
    type: 'system_load' | 'network_usage' | 'business_hours' | 'custom';
    operator: 'less_than' | 'greater_than' | 'equals' | 'between';
    value: number | string;
    action: 'proceed' | 'delay' | 'skip' | 'notify';
}

// Настройки исправления
export interface RemediationSettings {
    auto_remediation: boolean;
    remediation_workflows: RemediationWorkflow[];
    approval_required: boolean;
    risk_threshold: string;
    test_mode: boolean;
    rollback_capability: boolean;
}

// Workflow исправления
export interface RemediationWorkflow {
    id: string;
    name: string;
    trigger_conditions: string[];
    actions: RemediationAction[];
    approval_chain?: string[];
    testing_requirements?: string[];
    rollback_plan?: string[];
}

// Действие исправления
export interface RemediationAction {
    type: 'patch' | 'configure' | 'isolate' | 'monitor' | 'notify';
    target: string;
    parameters: Record<string, any>;
    timeout: number;
    retry_count: number;
    validation_checks: string[];
}

// Настройки авто-отчетности
export interface AutoReportingSettings {
    enabled: boolean;
    report_templates: string[];
    distribution_lists: string[];
    triggers: ReportTrigger[];
    schedule?: ScheduleSettings;
    formats: string[];
    custom_metrics?: string[];
}

// Триггер отчета
export interface ReportTrigger {
    event: 'scan_completed' | 'vulnerabilities_found' | 'threshold_exceeded' | 'schedule';
    conditions: string[];
    report_type: string;
    recipients: string[];
    priority: 'low' | 'normal' | 'high' | 'urgent';
}

// Настройки авто-эскалации
export interface AutoEscalationSettings {
    enabled: boolean;
    escalation_matrix: EscalationRule[];
    notification_channels: string[];
    response_timeouts: Record<string, number>;
}

// Правило эскалации
export interface EscalationRule {
    trigger: string;
    severity_threshold: string;
    time_threshold: number;
    escalation_path: string[];
    actions: string[];
}

// Триггер workflow
export interface WorkflowTrigger {
    id: string;
    name: string;
    event: string;
    conditions: string[];
    actions: string[];
    enabled: boolean;
}

// Условная логика
export interface ConditionalLogic {
    id: string;
    condition: string;
    true_action: string;
    false_action: string;
    variables: Record<string, any>;
}

// Настройки интеграции
export interface IntegrationSettings {
    siem_integration?: SIEMIntegration;
    soar_integration?: SOARIntegration;
    ticketing_integration?: TicketingIntegration;
    cmdb_integration?: CMDBIntegration;
    vulnerability_management?: VulnManagementIntegration;
    threat_intelligence?: TIIntegration;
    orchestration?: OrchestrationIntegration;
}

// SIEM интеграция
export interface SIEMIntegration {
    enabled: boolean;
    platform: 'splunk' | 'elastic' | 'qradar' | 'sentinel' | 'custom';
    endpoint: string;
    api_key?: string;
    event_mapping: Record<string, string>;
    real_time_streaming: boolean;
    batch_upload: boolean;
    custom_parsers?: string[];
}

// SOAR интеграция
export interface SOARIntegration {
    enabled: boolean;
    platform: 'phantom' | 'demisto' | 'resilient' | 'custom';
    endpoint: string;
    api_key?: string;
    playbook_mapping: Record<string, string>;
    auto_execution: boolean;
    approval_workflow?: string;
}

// Ticketing интеграция
export interface TicketingIntegration {
    enabled: boolean;
    platform: 'jira' | 'servicenow' | 'remedy' | 'custom';
    endpoint: string;
    credentials: Record<string, string>;
    ticket_templates: TicketTemplate[];
    auto_creation: boolean;
    priority_mapping: Record<string, string>;
}

// Шаблон тикета
export interface TicketTemplate {
    severity: string;
    template: string;
    assignee?: string;
    priority: string;
    category: string;
    custom_fields?: Record<string, any>;
}

// CMDB интеграция
export interface CMDBIntegration {
    enabled: boolean;
    platform: 'servicenow' | 'device42' | 'lansweeper' | 'custom';
    endpoint: string;
    credentials: Record<string, string>;
    asset_sync: boolean;
    relationship_mapping: boolean;
    auto_discovery_sync: boolean;
}

// Интеграция управления уязвимостями
export interface VulnManagementIntegration {
    enabled: boolean;
    platform: 'qualys' | 'rapid7' | 'tenable' | 'custom';
    endpoint: string;
    api_key?: string;
    vulnerability_sync: boolean;
    asset_correlation: boolean;
    remediation_tracking: boolean;
}

// TI интеграция
export interface TIIntegration {
    enabled: boolean;
    feeds: TIFeed[];
    enrichment_apis: TIEnrichmentAPI[];
    custom_feeds?: CustomTIFeed[];
}

// TI фид
export interface TIFeed {
    name: string;
    url: string;
    format: 'stix' | 'json' | 'xml' | 'csv';
    update_frequency: number;
    api_key?: string;
    enabled: boolean;
}

// TI enrichment API
export interface TIEnrichmentAPI {
    name: string;
    endpoint: string;
    api_key?: string;
    supported_types: string[];
    rate_limit?: number;
    enabled: boolean;
}

// Кастомный TI фид
export interface CustomTIFeed {
    name: string;
    source: string;
    parser: string;
    validation_rules: string[];
    transformation_rules?: string[];
}

// Интеграция оркестрации
export interface OrchestrationIntegration {
    enabled: boolean;
    workflows: OrchestrationWorkflow[];
    event_bus?: EventBusSettings;
    api_gateway?: APIGatewaySettings;
}

// Workflow оркестрации
export interface OrchestrationWorkflow {
    id: string;
    name: string;
    trigger: string;
    steps: WorkflowStep[];
    error_handling: ErrorHandlingSettings;
    monitoring: WorkflowMonitoring;
}

// Шаг workflow
export interface WorkflowStep {
    id: string;
    name: string;
    type: 'scan' | 'analysis' | 'notification' | 'integration' | 'decision';
    parameters: Record<string, any>;
    dependencies?: string[];
    timeout?: number;
    retry_policy?: RetryPolicy;
}

// Политика повторов
export interface RetryPolicy {
    max_attempts: number;
    delay_strategy: 'fixed' | 'exponential' | 'linear';
    base_delay: number;
    max_delay: number;
}

// Настройки обработки ошибок
export interface ErrorHandlingSettings {
    strategy: 'fail_fast' | 'continue' | 'retry' | 'escalate';
    notification_channels: string[];
    fallback_actions?: string[];
    log_level: 'debug' | 'info' | 'warn' | 'error';
}

// Мониторинг workflow
export interface WorkflowMonitoring {
    metrics_collection: boolean;
    performance_tracking: boolean;
    alerting_rules: AlertingRule[];
    dashboard_config?: DashboardConfig;
}

// Правило оповещения
export interface AlertingRule {
    metric: string;
    operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
    threshold: number;
    duration: number;
    channels: string[];
}

// Конфигурация дашборда
export interface DashboardConfig {
    widgets: DashboardWidget[];
    refresh_interval: number;
    filters?: DashboardFilter[];
}

// Виджет дашборда
export interface DashboardWidget {
    type: 'chart' | 'table' | 'metric' | 'status';
    title: string;
    data_source: string;
    configuration: Record<string, any>;
}

// Фильтр дашборда
export interface DashboardFilter {
    field: string;
    type: 'select' | 'date' | 'text';
    options?: string[];
}

// Настройки Event Bus
export interface EventBusSettings {
    enabled: boolean;
    broker_type: 'kafka' | 'rabbitmq' | 'redis' | 'custom';
    connection_string: string;
    topics: EventTopic[];
    serialization: 'json' | 'avro' | 'protobuf';
}

// Топик событий
export interface EventTopic {
    name: string;
    events: string[];
    partitions?: number;
    retention?: number;
    compression?: string;
}

// Настройки API Gateway
export interface APIGatewaySettings {
    enabled: boolean;
    endpoint: string;
    authentication: 'oauth' | 'api_key' | 'jwt' | 'basic';
    rate_limiting: RateLimitingSettings;
    transformation_rules?: TransformationRule[];
}

// Настройки ограничения скорости
export interface RateLimitingSettings {
    requests_per_minute: number;
    burst_capacity: number;
    throttling_strategy: 'reject' | 'queue' | 'delay';
}

// Правило трансформации
export interface TransformationRule {
    pattern: string;
    transformation: string;
    enabled: boolean;
}

// Выделение ресурсов
export interface ResourceAllocation {
    cpu_cores?: number;
    memory_gb?: number;
    network_bandwidth_mbps?: number;
    storage_gb?: number;
    gpu_units?: number;
    scan_agents?: number;
    priority_queue?: string;
    resource_pool?: string;
    cost_center?: string;
    budget_limit?: number;
}

// Настройки уведомлений сканирования
export interface ScanNotificationSettings {
    channels: NotificationChannel[];
    events: NotificationEvent[];
    escalation_rules: NotificationEscalationRule[];
    templates: NotificationTemplate[];
    quiet_hours?: QuietHours;
}

// Канал уведомлений
export interface NotificationChannel {
    type: 'email' | 'slack' | 'teams' | 'webhook' | 'sms' | 'push';
    configuration: Record<string, any>;
    enabled: boolean;
    priority: number;
    fallback_channels?: string[];
}

// Событие уведомления
export interface NotificationEvent {
    event: string;
    severity_threshold?: string;
    conditions?: string[];
    recipients: string[];
    channels: string[];
    template: string;
}

// Правило эскалации уведомлений
export interface NotificationEscalationRule {
    trigger_condition: string;
    escalation_delay: number;
    escalation_levels: EscalationLevel[];
}

// Уровень эскалации
export interface EscalationLevel {
    level: number;
    recipients: string[];
    channels: string[];
    actions?: string[];
}

// Шаблон уведомления
export interface NotificationTemplate {
    id: string;
    name: string;
    type: string;
    subject_template: string;
    body_template: string;
    variables: string[];
}

// Тихие часы
export interface QuietHours {
    enabled: boolean;
    start_time: string;
    end_time: string;
    timezone: string;
    exceptions?: string[];
    emergency_override?: boolean;
}

// Настройки workflow утверждения
export interface ApprovalWorkflowSettings {
    required: boolean;
    workflow_id: string;
    approvers: ApproverSettings[];
    auto_approval_conditions?: string[];
    timeout_actions?: TimeoutAction[];
}

// Настройки утверждающего
export interface ApproverSettings {
    user_id: string;
    role: string;
    order: number;
    required: boolean;
    delegation_rules?: DelegationRule[];
}

// Правило делегирования
export interface DelegationRule {
    condition: string;
    delegate_to: string;
    notification_required: boolean;
}

// Действие по тайм-ауту
export interface TimeoutAction {
    timeout_hours: number;
    action: 'auto_approve' | 'auto_reject' | 'escalate' | 'notify';
    parameters?: Record<string, any>;
}

// Кастомный payload
export interface CustomPayload {
    id: string;
    name: string;
    type: 'exploit' | 'scanner' | 'fingerprint';
    payload: string;
    target_services: string[];
    risk_level: 'low' | 'medium' | 'high' | 'critical';
    validation_required?: boolean;
}

// Координация сканирования
export interface ScanCoordination {
    distributed_scanning: boolean;
    agent_allocation: AgentAllocation[];
    load_balancing: LoadBalancingSettings;
    coordination_strategy: 'centralized' | 'distributed' | 'hybrid';
    synchronization_points?: string[];
}

// Выделение агентов
export interface AgentAllocation {
    agent_pool: string;
    target_percentage: number;
    geographic_preference?: string;
    capability_requirements?: string[];
}

// Настройки балансировки нагрузки
export interface LoadBalancingSettings {
    algorithm: 'round_robin' | 'weighted' | 'least_connections' | 'performance_based';
    health_check_interval: number;
    failover_strategy: 'automatic' | 'manual' | 'none';
}

// Результаты Enterprise сканирования
export interface EnterpriseScanResult {
    scan_id: string;
    tenant_id?: string;
    status: 'running' | 'completed' | 'failed' | 'stopped' | 'pending_approval' | 'scheduled';
    progress: number;
    phase: string;
    started_at: string;
    completed_at?: string;
    duration?: number;
    settings: EnterpriseScanSettings;

    // Базовые результаты
    target: string;
    ports_found: number;
    services_found: number;
    vulnerabilities: EnterpriseVulnerability[];

    // Enterprise результаты
    threat_intelligence: ThreatIntelligenceResult;
    compliance_results: ComplianceResult[];
    ml_analysis: MLAnalysisResult;
    business_impact: BusinessImpactResult;
    risk_assessment: RiskAssessmentResult;
    asset_discovery: AssetDiscoveryResult;
    behavioral_analysis: BehavioralAnalysisResult;

    // Метаданные
    scan_metadata: ScanMetadata;
    performance_metrics: PerformanceMetrics;
    quality_metrics: QualityMetrics;
    cost_metrics: CostMetrics;

    // Интеграции
    integration_results: IntegrationResult[];
    workflow_results: WorkflowResult[];

    // Ошибки и предупреждения
    errors: ScanError[];
    warnings: ScanWarning[];

    // Аудит
    audit_trail: AuditEntry[];
}

// Enterprise уязвимость
export interface EnterpriseVulnerability extends Vulnerability {
    // Базовые поля из Vulnerability
    threat_context?: ThreatContext;
    business_impact?: VulnerabilityBusinessImpact;
    exploit_intelligence?: ExploitIntelligence;
    remediation_intelligence?: RemediationIntelligence;
    compliance_mapping?: ComplianceMapping[];
    risk_factors?: RiskFactor[];
    asset_context?: AssetContext;
    ml_classification?: MLClassification;
    correlation_data?: CorrelationData;
}

// Контекст угрозы
export interface ThreatContext {
    threat_actors: string[];
    campaigns: string[];
    ttps: string[];
    geolocation_risks: string[];
    industry_targeting: string[];
    recent_activity: boolean;
    trending_status: 'rising' | 'stable' | 'declining';
}

// Бизнес-воздействие уязвимости
export interface VulnerabilityBusinessImpact {
    financial_risk: number;
    operational_risk: string;
    reputational_risk: string;
    regulatory_risk: string;
    affected_business_processes: string[];
    data_at_risk: string[];
    downtime_estimate: number;
    recovery_cost_estimate: number;
}

// Информация об эксплойтах
export interface ExploitIntelligence {
    public_exploits: number;
    weaponized_exploits: number;
    exploit_kits: string[];
    recent_exploits: boolean;
    exploit_difficulty: 'trivial' | 'easy' | 'medium' | 'hard';
    exploit_availability: 'none' | 'proof_of_concept' | 'functional' | 'weaponized';
}

// Информация об исправлении
export interface RemediationIntelligence {
    patch_available: boolean;
    patch_complexity: 'low' | 'medium' | 'high';
    patch_testing_required: boolean;
    workarounds: string[];
    mitigation_strategies: string[];
    vendor_guidance: string[];
    remediation_timeline: string;
    rollback_plan: string[];
}

// Маппинг соответствия
export interface ComplianceMapping {
    framework: string;
    control_id: string;
    control_title: string;
    violation_severity: string;
    remediation_requirement: string;
    deadline?: string;
}

// Фактор риска
export interface RiskFactor {
    factor: string;
    weight: number;
    value: string;
    impact: 'increases' | 'decreases' | 'neutral';
    description: string;
}

// Контекст актива
export interface AssetContext {
    asset_criticality: 'low' | 'medium' | 'high' | 'critical';
    asset_classification: string;
    business_function: string;
    data_types: string[];
    network_exposure: string;
    access_patterns: string[];
    dependencies: string[];
    backup_status: string;
}

// ML классификация
export interface MLClassification {
    predicted_severity: string;
    confidence_score: number;
    classification_model: string;
    feature_importance: Record<string, number>;
    anomaly_score?: number;
    risk_prediction?: number;
}

// Данные корреляции
export interface CorrelationData {
    related_vulnerabilities: string[];
    attack_chain_position: string;
    correlation_confidence: number;
    correlation_type: 'temporal' | 'spatial' | 'technical' | 'behavioral';
    related_incidents: string[];
}

// Результат Threat Intelligence
export interface ThreatIntelligenceResult {
    indicators_found: ThreatIndicator[];
    threat_landscape: ThreatLandscape;
    attribution_analysis: AttributionAnalysis;
    campaign_correlation: CampaignCorrelation[];
    risk_context: ThreatRiskContext;
    actionable_intelligence: ActionableIntelligence[];
}

// Индикатор угрозы
export interface ThreatIndicator {
    type: string;
    value: string;
    confidence: number;
    severity: string;
    source: string;
    first_seen: string;
    last_seen: string;
    context: string;
    related_campaigns: string[];
    mitigation_advice: string[];
}

// Ландшафт угроз
export interface ThreatLandscape {
    active_threats: ActiveThreat[];
    emerging_threats: EmergingThreat[];
    threat_trends: ThreatTrend[];
    geographic_distribution: GeographicThreat[];
}

// Активная угроза
export interface ActiveThreat {
    threat_id: string;
    name: string;
    description: string;
    severity: string;
    ttps: string[];
    indicators: string[];
    mitigation_strategies: string[];
}

// Возникающая угроза
export interface EmergingThreat {
    threat_id: string;
    name: string;
    description: string;
    probability: number;
    potential_impact: string;
    timeline: string;
    preparation_actions: string[];
}

// Тренд угроз
export interface ThreatTrend {
    trend_name: string;
    direction: 'increasing' | 'decreasing' | 'stable';
    velocity: number;
    affected_sectors: string[];
    prediction_confidence: number;
}

// Географическая угроза
export interface GeographicThreat {
    region: string;
    threat_level: string;
    dominant_threats: string[];
    regulatory_context: string[];
}

// Анализ атрибуции
export interface AttributionAnalysis {
    suspected_actors: SuspectedActor[];
    attribution_confidence: number;
    analysis_method: string;
    supporting_evidence: string[];
    alternative_theories: string[];
}

// Подозреваемый актор
export interface SuspectedActor {
    actor_id: string;
    name: string;
    aliases: string[];
    motivation: string[];
    sophistication: string;
    attribution_confidence: number;
    recent_activity: boolean;
}

// Корреляция кампании
export interface CampaignCorrelation {
    campaign_id: string;
    name: string;
    confidence: number;
    overlap_indicators: string[];
    temporal_correlation: boolean;
    tactical_similarity: number;
}

// Контекст угрозы риска
export interface ThreatRiskContext {
    overall_threat_level: string;
    risk_factors: string[];
    protective_factors: string[];
    recommendations: string[];
    monitoring_priorities: string[];
}

// Действенная разведка
export interface ActionableIntelligence {
    intelligence_type: string;
    action_required: string;
    priority: string;
    timeline: string;
    responsible_party: string;
    success_metrics: string[];
}

// Результат соответствия
export interface ComplianceResult {
    framework: string;
    version: string;
    overall_score: number;
    status: 'compliant' | 'non_compliant' | 'partially_compliant';
    controls_assessed: number;
    controls_passed: number;
    controls_failed: number;
    critical_violations: ComplianceViolation[];
    remediation_plan: ComplianceRemediationPlan;
    certification_status: CertificationStatus;
    next_assessment: string;
}

// Нарушение соответствия
export interface ComplianceViolation {
    control_id: string;
    control_title: string;
    violation_type: string;
    severity: string;
    description: string;
    evidence: string[];
    remediation_required: string;
    deadline?: string;
    responsible_party?: string;
}

// План исправления соответствия
export interface ComplianceRemediationPlan {
    total_actions: number;
    estimated_effort: string;
    estimated_cost: number;
    timeline: string;
    priority_actions: RemediationAction[];
    dependencies: string[];
    success_criteria: string[];
}

// Статус сертификации
export interface CertificationStatus {
    certification_name: string;
    current_status: string;
    expiry_date?: string;
    renewal_required: boolean;
    gaps_to_address: string[];
    audit_findings: string[];
}

// Результат ML анализа
export interface MLAnalysisResult {
    models_applied: MLModelResult[];
    anomalies_detected: MLAnomaly[];
    predictions: MLPrediction[];
    classifications: MLClassificationResult[];
    insights: MLInsight[];
    recommendations: MLRecommendation[];
    confidence_metrics: MLConfidenceMetrics;
}

// Результат ML модели
export interface MLModelResult {
    model_id: string;
    model_name: string;
    execution_time: number;
    accuracy_score: number;
    predictions_made: number;
    anomalies_found: number;
    confidence_distribution: Record<string, number>;
}

// ML аномалия
export interface MLAnomaly {
    anomaly_id: string;
    type: string;
    severity: number;
    description: string;
    affected_entities: string[];
    detection_confidence: number;
    baseline_deviation: number;
    similar_patterns: string[];
    recommended_actions: string[];
}

// ML предсказание
export interface MLPrediction {
    prediction_id: string;
    target: string;
    prediction_type: string;
    predicted_value: string;
    confidence: number;
    probability_distribution: Record<string, number>;
    influencing_factors: Record<string, number>;
    time_horizon: string;
}

// Результат ML классификации
export interface MLClassificationResult {
    entity: string;
    classification: string;
    confidence: number;
    alternative_classifications: Array<{
        classification: string;
        confidence: number;
    }>;
    feature_importance: Record<string, number>;
    explanation: string;
}

// ML инсайт
export interface MLInsight {
    insight_type: string;
    title: string;
    description: string;
    impact_level: string;
    supporting_data: Record<string, any>;
    actionability: string;
    confidence: number;
}

// ML рекомендация
export interface MLRecommendation {
    recommendation_id: string;
    category: string;
    title: string;
    description: string;
    rationale: string;
    implementation_difficulty: string;
    expected_impact: string;
    priority_score: number;
}

// Метрики уверенности ML
export interface MLConfidenceMetrics {
    overall_confidence: number;
    model_agreement: number;
    data_quality_score: number;
    feature_completeness: number;
    temporal_stability: number;
}

// Результат бизнес-воздействия
export interface BusinessImpactResult {
    overall_impact_score: number;
    financial_impact: FinancialImpactAnalysis;
    operational_impact: OperationalImpactAnalysis;
    strategic_impact: StrategicImpactAnalysis;
    regulatory_impact: RegulatoryImpactAnalysis;
    recommendations: BusinessRecommendation[];
    cost_benefit_analysis: CostBenefitAnalysis;
}

// Анализ финансового воздействия
export interface FinancialImpactAnalysis {
    potential_loss: number;
    downtime_cost: number;
    recovery_cost: number;
    opportunity_cost: number;
    insurance_coverage: number;
    risk_adjusted_cost: number;
    currency: string;
    confidence_interval: {
        lower: number;
        upper: number;
    };
}

// Анализ операционного воздействия
export interface OperationalImpactAnalysis {
    affected_processes: string[];
    service_disruption_risk: string;
    performance_degradation: number;
    recovery_time_estimate: number;
    alternative_procedures: string[];
    resource_requirements: string[];
}

// Анализ стратегического воздействия
export interface StrategicImpactAnalysis {
    strategic_objectives_at_risk: string[];
    competitive_disadvantage: string;
    innovation_impact: string;
    partnership_risks: string[];
    long_term_consequences: string[];
}

// Анализ регулятивного воздействия
export interface RegulatoryImpactAnalysis {
    applicable_regulations: string[];
    potential_violations: string[];
    penalty_exposure: number;
    reporting_requirements: string[];
    audit_implications: string[];
}

// Бизнес-рекомендация
export interface BusinessRecommendation {
    recommendation_id: string;
    category: string;
    title: string;
    description: string;
    business_justification: string;
    implementation_cost: number;
    expected_roi: number;
    timeline: string;
    risk_mitigation: string[];
    success_metrics: string[];
}

// Анализ затрат и выгод
export interface CostBenefitAnalysis {
    implementation_cost: number;
    annual_savings: number;
    payback_period: number;
    net_present_value: number;
    roi_percentage: number;
    risk_adjusted_roi: number;
    sensitivity_analysis: SensitivityAnalysis[];
}

// Анализ чувствительности
export interface SensitivityAnalysis {
    variable: string;
    low_scenario: number;
    base_scenario: number;
    high_scenario: number;
    impact_on_roi: number;
}

// Результат оценки рисков
export interface RiskAssessmentResult {
    overall_risk_score: number;
    risk_level: 'low' | 'medium' | 'high' | 'critical';
    risk_categories: RiskCategoryResult[];
    threat_analysis: ThreatAnalysisResult;
    vulnerability_analysis: VulnerabilityAnalysisResult;
    impact_analysis: ImpactAnalysisResult;
    likelihood_analysis: LikelihoodAnalysisResult;
    risk_matrix: RiskMatrixResult;
    mitigation_strategies: MitigationStrategy[];
    residual_risk: ResidualRiskResult;
}

// Результат категории рисков
export interface RiskCategoryResult {
    category: string;
    risk_score: number;
    trend: 'increasing' | 'stable' | 'decreasing';
    contributing_factors: string[];
    mitigation_effectiveness: number;
}

// Результат анализа угроз
export interface ThreatAnalysisResult {
    identified_threats: IdentifiedThreat[];
    threat_landscape_analysis: ThreatLandscapeAnalysis;
    threat_intelligence_correlation: ThreatIntelligenceCorrelation[];
}

// Идентифицированная угроза
export interface IdentifiedThreat {
    threat_id: string;
    threat_name: string;
    threat_type: string;
    likelihood: number;
    impact: number;
    risk_score: number;
    threat_sources: string[];
    attack_vectors: string[];
    existing_controls: string[];
    control_effectiveness: number;
}

// Анализ ландшафта угроз
export interface ThreatLandscapeAnalysis {
    dominant_threats: string[];
    emerging_threats: string[];
    threat_trends: string[];
    geographic_considerations: string[];
    industry_specific_threats: string[];
}

// Корреляция Threat Intelligence
export interface ThreatIntelligenceCorrelation {
    threat_id: string;
    intelligence_sources: string[];
    correlation_confidence: number;
    attribution_indicators: string[];
    campaign_associations: string[];
}

// Результат анализа уязвимостей
export interface VulnerabilityAnalysisResult {
    total_vulnerabilities: number;
    vulnerability_distribution: Record<string, number>;
    critical_vulnerabilities: CriticalVulnerability[];
    vulnerability_trends: VulnerabilityTrend[];
    patch_analysis: PatchAnalysis;
    zero_day_assessment: ZeroDayAssessment;
}

// Критическая уязвимость
export interface CriticalVulnerability {
    vulnerability_id: string;
    cvss_score: number;
    exploit_availability: string;
    patch_status: string;
    business_impact: string;
    remediation_priority: number;
}

// Тренд уязвимостей
export interface VulnerabilityTrend {
    period: string;
    vulnerabilities_discovered: number;
    vulnerabilities_patched: number;
    mean_time_to_patch: number;
    vulnerability_backlog: number;
}

// Анализ патчей
export interface PatchAnalysis {
    patches_available: number;
    patches_applied: number;
    patch_lag_average: number;
    critical_patches_pending: number;
    patch_success_rate: number;
}

// Оценка нулевого дня
export interface ZeroDayAssessment {
    zero_day_risk_score: number;
    vulnerable_products: string[];
    mitigation_strategies: string[];
    monitoring_recommendations: string[];
}

// Результат анализа воздействия
export interface ImpactAnalysisResult {
    impact_categories: ImpactCategory[];
    cascading_effects: CascadingEffect[];
    recovery_analysis: RecoveryAnalysis;
    business_continuity_impact: BusinessContinuityImpact;
}

// Категория воздействия
export interface ImpactCategory {
    category: string;
    impact_score: number;
    description: string;
    affected_assets: string[];
    mitigation_options: string[];
}

// Каскадный эффект
export interface CascadingEffect {
    initial_impact: string;
    cascading_impacts: string[];
    amplification_factor: number;
    time_to_cascade: number;
    prevention_strategies: string[];
}

// Анализ восстановления
export interface RecoveryAnalysis {
    recovery_time_objective: number;
    recovery_point_objective: number;
    recovery_strategies: string[];
    resource_requirements: string[];
    recovery_cost_estimate: number;
}

// Воздействие на непрерывность бизнеса
export interface BusinessContinuityImpact {
    critical_processes_affected: string[];
    service_level_impact: string;
    customer_impact: string;
    supplier_impact: string;
    regulatory_reporting_impact: string;
}

// Результат анализа вероятности
export interface LikelihoodAnalysisResult {
    overall_likelihood: number;
    likelihood_factors: LikelihoodFactor[];
    historical_analysis: HistoricalAnalysis;
    threat_intelligence_input: ThreatIntelligenceInput[];
    environmental_factors: EnvironmentalFactor[];
}

// Фактор вероятности
export interface LikelihoodFactor {
    factor: string;
    weight: number;
    score: number;
    rationale: string;
    data_sources: string[];
}

// Исторический анализ
export interface HistoricalAnalysis {
    similar_incidents: number;
    incident_frequency: number;
    trend_analysis: string;
    pattern_recognition: string[];
    seasonal_variations: string[];
}

// Ввод Threat Intelligence
export interface ThreatIntelligenceInput {
    source: string;
    threat_activity_level: string;
    targeting_evidence: string[];
    campaign_activity: string[];
    indicator_overlap: number;
}

// Фактор окружения
export interface EnvironmentalFactor {
    factor: string;
    current_state: string;
    risk_contribution: string;
    mitigation_available: boolean;
}

// Результат матрицы рисков
export interface RiskMatrixResult {
    risk_matrix: RiskMatrixCell[][];
    risk_distribution: Record<string, number>;
    risk_appetite_comparison: RiskAppetiteComparison;
    heat_map_data: HeatMapData[];
}

// Ячейка матрицы рисков
export interface RiskMatrixCell {
    likelihood: number;
    impact: number;
    risk_level: string;
    risk_count: number;
    representative_risks: string[];
}

// Сравнение аппетита к риску
export interface RiskAppetiteComparison {
    risks_within_appetite: number;
    risks_exceeding_appetite: number;
    appetite_threshold: number;
    recommendations: string[];
}

// Данные тепловой карты
export interface HeatMapData {
    category: string;
    subcategory: string;
    risk_score: number;
    color_intensity: number;
    drill_down_data: string[];
}

// Стратегия митигации
export interface MitigationStrategy {
    strategy_id: string;
    name: string;
    description: string;
    applicable_risks: string[];
    implementation_cost: number;
    effectiveness_rating: number;
    implementation_timeline: string;
    resource_requirements: string[];
    success_metrics: string[];
    dependencies: string[];
}

// Результат остаточного риска
export interface ResidualRiskResult {
    residual_risk_score: number;
    residual_risk_level: string;
    unmitigated_risks: UnmitigatedRisk[];
    monitoring_requirements: MonitoringRequirement[];
    acceptance_criteria: AcceptanceCriteria[];
}

// Немитигированный риск
export interface UnmitigatedRisk {
    risk_id: string;
    reason_unmitigated: string;
    acceptance_rationale: string;
    compensating_controls: string[];
    monitoring_plan: string;
}

// Требование мониторинга
export interface MonitoringRequirement {
    risk_category: string;
    monitoring_frequency: string;
    key_indicators: string[];
    alert_thresholds: Record<string, number>;
    responsible_party: string;
}

// Критерии принятия
export interface AcceptanceCriteria {
    risk_category: string;
    acceptance_threshold: number;
    approval_required: boolean;
    review_frequency: string;
    escalation_criteria: string[];
}

// Результат обнаружения активов
export interface AssetDiscoveryResult {
    assets_discovered: DiscoveredAsset[];
    asset_classification: AssetClassificationResult[];
    network_topology: NetworkTopologyResult;
    asset_dependencies: AssetDependency[];
    asset_inventory_update: AssetInventoryUpdate;
}

// Обнаруженный актив
export interface DiscoveredAsset {
    asset_id: string;
    ip_address: string;
    hostname?: string;
    mac_address?: string;
    asset_type: string;
    operating_system?: string;
    services: DiscoveredService[];
    open_ports: PortInfo[];
    discovery_method: string;
    confidence_score: number;
    last_seen: string;
    business_context?: AssetBusinessContext;
}

// Обнаруженный сервис
export interface DiscoveredService {
    service_name: string;
    port: number;
    protocol: string;
    version?: string;
    banner?: string;
    confidence: number;
    security_implications: string[];
}

// Результат классификации активов
export interface AssetClassificationResult {
    asset_id: string;
    classification: string;
    confidence: number;
    classification_criteria: string[];
    business_function: string;
    data_sensitivity: string;
    compliance_requirements: string[];
}

// Бизнес-контекст актива
export interface AssetBusinessContext {
    business_owner: string;
    business_function: string;
    criticality_level: string;
    data_types: string[];
    compliance_scope: string[];
    maintenance_window: string;
}

// Результат топологии сети
export interface NetworkTopologyResult {
    network_segments: NetworkSegment[];
    routing_topology: RoutingTopology;
    security_boundaries: SecurityBoundary[];
    communication_flows: CommunicationFlow[];
}

// Сегмент сети
export interface NetworkSegment {
    segment_id: string;
    network_range: string;
    segment_type: string;
    security_zone: string;
    assets: string[];
    access_controls: string[];
}

// Топология маршрутизации
export interface RoutingTopology {
    routers: RouterInfo[];
    routing_tables: RoutingTable[];
    network_paths: NetworkPath[];
}

// Информация о маршрутизаторе
export interface RouterInfo {
    router_id: string;
    ip_address: string;
    interfaces: RouterInterface[];
    routing_protocols: string[];
    configuration_summary: string;
}

// Интерфейс маршрутизатора
export interface RouterInterface {
    interface_name: string;
    ip_address: string;
    network: string;
    status: string;
    bandwidth: number;
}

// Таблица маршрутизации
export interface RoutingTable {
    router_id: string;
    routes: RouteEntry[];
    default_gateway: string;
}

// Запись маршрута
export interface RouteEntry {
    destination: string;
    gateway: string;
    interface: string;
    metric: number;
    protocol: string;
}

// Сетевой путь
export interface NetworkPath {
    source: string;
    destination: string;
    hops: string[];
    latency: number;
    bandwidth: number;
    reliability: number;
}

// Граница безопасности
export interface SecurityBoundary {
    boundary_id: string;
    type: string;
    source_zone: string;
    destination_zone: string;
    security_controls: string[];
    access_policies: string[];
}

// Поток коммуникации
export interface CommunicationFlow {
    flow_id: string;
    source_asset: string;
    destination_asset: string;
    protocol: string;
    port: number;
    data_volume: number;
    frequency: string;
    security_classification: string;
}

// Зависимость активов
export interface AssetDependency {
    asset_id: string;
    depends_on: string[];
    dependency_type: string;
    criticality: string;
    failure_impact: string;
}

// Обновление инвентаря активов
export interface AssetInventoryUpdate {
    assets_added: number;
    assets_updated: number;
    assets_removed: number;
    discrepancies_found: InventoryDiscrepancy[];
    recommendations: string[];
}

// Расхождение в инвентаре
export interface InventoryDiscrepancy {
    discrepancy_type: string;
    asset_id: string;
    expected_value: string;
    actual_value: string;
    impact_assessment: string;
    recommended_action: string;
}

// Результат поведенческого анализа
export interface BehavioralAnalysisResult {
    baseline_established: boolean;
    behavioral_patterns: BehavioralPattern[];
    anomalies_detected: BehavioralAnomaly[];
    user_behavior_analysis: UserBehaviorAnalysis[];
    network_behavior_analysis: NetworkBehaviorAnalysis;
    recommendations: BehavioralRecommendation[];
}

// Поведенческий паттерн
export interface BehavioralPattern {
    pattern_id: string;
    pattern_type: string;
    description: string;
    frequency: string;
    entities_involved: string[];
    risk_level: string;
    deviation_threshold: number;
}

// Поведенческая аномалия
export interface BehavioralAnomaly {
    anomaly_id: string;
    type: string;
    severity: string;
    description: string;
    affected_entities: string[];
    detection_time: string;
    baseline_deviation: number;
    risk_indicators: string[];
    recommended_actions: string[];
}

// Анализ поведения пользователя
export interface UserBehaviorAnalysis {
    user_id: string;
    normal_patterns: string[];
    anomalous_activities: string[];
    risk_score: number;
    access_pattern_changes: string[];
    privilege_usage_analysis: string;
}

// Анализ поведения сети
export interface NetworkBehaviorAnalysis {
    traffic_patterns: TrafficPattern[];
    protocol_usage: ProtocolUsage[];
    connection_patterns: ConnectionPattern[];
    bandwidth_analysis: BandwidthAnalysis;
    geographic_patterns: GeographicPattern[];
}

// Паттерн трафика
export interface TrafficPattern {
    pattern_name: string;
    source_networks: string[];
    destination_networks: string[];
    protocols: string[];
    time_patterns: string[];
    volume_characteristics: string;
}

// Использование протокола
export interface ProtocolUsage {
    protocol: string;
    usage_percentage: number;
    normal_range: {
        min: number;
        max: number;
    };
    current_usage: number;
    trend: string;
}

// Паттерн соединения
export interface ConnectionPattern {
    pattern_type: string;
    source_pattern: string;
    destination_pattern: string;
    frequency: string;
    duration_characteristics: string;
    security_implications: string[];
}

// Анализ пропускной способности
export interface BandwidthAnalysis {
    peak_usage_times: string[];
    average_utilization: number;
    bandwidth_trends: string[];
    congestion_points: string[];
    optimization_opportunities: string[];
}

// Географический паттерн
export interface GeographicPattern {
    region: string;
    traffic_volume: number;
    connection_types: string[];
    risk_assessment: string;
    anomalous_activity: boolean;
}

// Поведенческая рекомендация
export interface BehavioralRecommendation {
    recommendation_type: string;
    title: string;
    description: string;
    implementation_priority: string;
    expected_benefits: string[];
    implementation_steps: string[];
}

// Метаданные сканирования
export interface ScanMetadata {
    scan_version: string;
    scanning_engine: string;
    rule_sets_used: string[];
    plugins_enabled: string[];
    configuration_hash: string;
    data_sources: string[];
    external_integrations: string[];
    compliance_frameworks: string[];
    custom_configurations: Record<string, any>;
}

// Метрики производительности
export interface PerformanceMetrics {
    total_scan_time: number;
    network_discovery_time: number;
    port_scanning_time: number;
    service_detection_time: number;
    vulnerability_assessment_time: number;
    report_generation_time: number;
    throughput_metrics: ThroughputMetrics;
    resource_utilization: ResourceUtilization;
    efficiency_metrics: EfficiencyMetrics;
}

// Метрики пропускной способности
export interface ThroughputMetrics {
    hosts_per_minute: number;
    ports_per_minute: number;
    requests_per_second: number;
    data_processed_mb: number;
    network_bandwidth_used: number;
}

// Использование ресурсов
export interface ResourceUtilization {
    cpu_utilization: ResourceUsage;
    memory_utilization: ResourceUsage;
    network_utilization: ResourceUsage;
    storage_utilization: ResourceUsage;
    agent_utilization?: AgentUtilization[];
}

// Использование ресурса
export interface ResourceUsage {
    average: number;
    peak: number;
    allocation: number;
    efficiency: number;
}

// Использование агента
export interface AgentUtilization {
    agent_id: string;
    cpu_usage: number;
    memory_usage: number;
    network_usage: number;
    tasks_processed: number;
    errors_encountered: number;
}

// Метрики эффективности
export interface EfficiencyMetrics {
    scan_accuracy: number;
    false_positive_rate: number;
    false_negative_rate: number;
    coverage_percentage: number;
    duplication_rate: number;
    optimization_score: number;
}

// Метрики качества
export interface QualityMetrics {
    data_completeness: number;
    data_accuracy: number;
    result_consistency: number;
    validation_score: number;
    confidence_scores: ConfidenceScore[];
    quality_gates_passed: number;
    quality_issues: QualityIssue[];
}

// Оценка уверенности
export interface ConfidenceScore {
    metric: string;
    score: number;
    factors: string[];
    validation_method: string;
}

// Проблема качества
export interface QualityIssue {
    issue_type: string;
    severity: string;
    description: string;
    affected_data: string[];
    remediation_suggestion: string;
}

// Метрики стоимости
export interface CostMetrics {
    total_cost: number;
    cost_breakdown: CostBreakdown;
    cost_efficiency: CostEfficiency;
    budget_utilization: BudgetUtilization;
    cost_optimization_opportunities: CostOptimization[];
}

// Разбивка стоимости
export interface CostBreakdown {
    infrastructure_cost: number;
    licensing_cost: number;
    operational_cost: number;
    human_resources_cost: number;
    external_services_cost: number;
    opportunity_cost: number;
}

// Эффективность затрат
export interface CostEfficiency {
    cost_per_asset: number;
    cost_per_vulnerability: number;
    cost_per_hour: number;
    roi_calculation: number;
    value_delivered: number;
}

// Использование бюджета
export interface BudgetUtilization {
    budget_allocated: number;
    budget_used: number;
    budget_remaining: number;
    utilization_percentage: number;
    projected_overage: number;
}

// Оптимизация затрат
export interface CostOptimization {
    opportunity_type: string;
    potential_savings: number;
    implementation_effort: string;
    risk_impact: string;
    recommendation: string;
}

// Результат интеграции
export interface IntegrationResult {
    integration_type: string;
    integration_name: string;
    status: 'success' | 'partial' | 'failed';
    data_synchronized: number;
    errors_encountered: IntegrationError[];
    performance_metrics: IntegrationPerformance;
    validation_results: ValidationResult[];
}

// Ошибка интеграции
export interface IntegrationError {
    error_type: string;
    error_message: string;
    affected_records: number;
    timestamp: string;
    resolution_suggestion: string;
}

// Производительность интеграции
export interface IntegrationPerformance {
    execution_time: number;
    throughput: number;
    error_rate: number;
    retry_count: number;
    success_rate: number;
}

// Результат валидации
export interface ValidationResult {
    validation_rule: string;
    passed: boolean;
    details: string;
    affected_records: number;
    remediation_required: boolean;
}

// Результат workflow
export interface WorkflowResult {
    workflow_id: string;
    workflow_name: string;
    execution_status: 'completed' | 'failed' | 'partial' | 'running';
    steps_executed: WorkflowStepResult[];
    execution_time: number;
    outputs: Record<string, any>;
    errors: WorkflowError[];
}

// Результат шага workflow
export interface WorkflowStepResult {
    step_id: string;
    step_name: string;
    status: 'success' | 'failed' | 'skipped';
    execution_time: number;
    input_data: Record<string, any>;
    output_data: Record<string, any>;
    error_message?: string;
}

// Ошибка workflow
export interface WorkflowError {
    step_id: string;
    error_type: string;
    error_message: string;
    timestamp: string;
    recovery_action?: string;
}

// Ошибка сканирования
export interface ScanError {
    error_id: string;
    error_type: 'network' | 'configuration' | 'permission' | 'resource' | 'integration';
    severity: 'low' | 'medium' | 'high' | 'critical';
    error_message: string;
    affected_targets: string[];
    timestamp: string;
    context: Record<string, any>;
    resolution_suggestion: string;
    error_code?: string;
}

// Предупреждение сканирования
export interface ScanWarning {
    warning_id: string;
    warning_type: string;
    severity: 'info' | 'warning';
    message: string;
    affected_targets: string[];
    timestamp: string;
    recommendations: string[];
}

// Запись аудита
export interface AuditEntry {
    entry_id: string;
    timestamp: string;
    user_id: string;
    action: string;
    resource: string;
    details: Record<string, any>;
    ip_address: string;
    user_agent: string;
    session_id: string;
    result: 'success' | 'failure';
    risk_score?: number;
}

// Настройки планирования сканирования
export interface ScanScheduleSettings {
    schedule_id?: string;
    enabled: boolean;
    name: string;
    description?: string;
    scan_settings: EnterpriseScanSettings;
    schedule: ScheduleConfiguration;
    notifications: ScheduleNotificationSettings;
    conditions?: ScheduleCondition[];
    retry_policy?: ScheduleRetryPolicy;
    concurrency_control?: ConcurrencyControl;
}

// Конфигурация расписания
export interface ScheduleConfiguration {
    type: 'one_time' | 'recurring';
    start_date: string;
    end_date?: string;
    timezone: string;
    recurrence?: RecurrenceSettings;
    blackout_periods?: BlackoutPeriod[];
}

// Настройки повторения
export interface RecurrenceSettings {
    frequency: 'minutely' | 'hourly' | 'daily' | 'weekly' | 'monthly';
    interval: number;
    days_of_week?: number[];
    days_of_month?: number[];
    hours?: number[];
    minutes?: number[];
}

// Период блокировки
export interface BlackoutPeriod {
    name: string;
    start_time: string;
    end_time: string;
    timezone: string;
    recurrence?: RecurrenceSettings;
    reason?: string;
}

// Настройки уведомлений расписания
export interface ScheduleNotificationSettings {
    notify_on_start: boolean;
    notify_on_completion: boolean;
    notify_on_failure: boolean;
    notification_channels: string[];
    custom_recipients?: string[];
}

// Политика повторов расписания
export interface ScheduleRetryPolicy {
    enabled: boolean;
    max_retries: number;
    retry_delay: number;
    exponential_backoff: boolean;
    retry_conditions: string[];
}

// Контроль параллелизма
export interface ConcurrencyControl {
    max_concurrent_scans: number;
    queue_management: 'fifo' | 'priority' | 'resource_based';
    resource_allocation: ResourceAllocation;
    conflict_resolution: 'skip' | 'queue' | 'override';
}

// Конфигурация пакетного сканирования
export interface BatchScanConfiguration {
    batch_id?: string;
    name: string;
    description?: string;
    targets: BatchTarget[];
    scan_template: EnterpriseScanSettings;
    execution_strategy: BatchExecutionStrategy;
    coordination: BatchCoordination;
    reporting: BatchReportingSettings;
    notifications: BatchNotificationSettings;
}

// Цель пакета
export interface BatchTarget {
    target_id: string;
    target: string;
    priority: number;
    custom_settings?: Partial<EnterpriseScanSettings>;
    dependencies?: string[];
    tags?: string[];
}

// Стратегия выполнения пакета
export interface BatchExecutionStrategy {
    execution_mode: 'sequential' | 'parallel' | 'mixed';
    max_parallel_scans: number;
    dependency_handling: 'respect' | 'ignore' | 'adaptive';
    failure_handling: 'stop_all' | 'continue' | 'stop_dependents';
    progress_tracking: boolean;
}

// Координация пакета
export interface BatchCoordination {
    distributed_execution: boolean;
    agent_allocation: AgentAllocation[];
    load_balancing: LoadBalancingSettings;
    resource_sharing: boolean;
    synchronization_points?: string[];
}

// Настройки отчетности пакета
export interface BatchReportingSettings {
    individual_reports: boolean;
    consolidated_report: boolean;
    report_templates: string[];
    custom_analytics?: string[];
    comparison_analysis?: boolean;
}

// Настройки уведомлений пакета
export interface BatchNotificationSettings {
    progress_notifications: boolean;
    completion_notifications: boolean;
    failure_notifications: boolean;
    milestone_notifications: string[];
    notification_frequency: 'per_scan' | 'milestone' | 'completion_only';
}

// ===== ОСНОВНОЙ ENTERPRISE КЛАСС SCANNER API =====

class EnterpriseScannerApiService {

    // ===== ОСНОВНЫЕ МЕТОДЫ СКАНИРОВАНИЯ =====

    /**
     * Запуск Enterprise сканирования
     */
    async startEnterpriseScan(settings: EnterpriseScanSettings): Promise<ApiResponse<{ scan_id: string; estimated_duration?: number }>> {
        this.validateEnterpriseScanSettings(settings);

        return api.post('/api/enterprise/scanner/start', settings, { timeout: 120000 });
    }

    /**
     * Получение статуса Enterprise сканирования
     */
    async getEnterpriseScanStatus(scanId: string): Promise<EnterpriseScanResult> {
        if (!scanId) {
            throw new Error('Scan ID is required');
        }

        return api.get<EnterpriseScanResult>(`/api/enterprise/scanner/${encodeURIComponent(scanId)}/status`);
    }

    /**
     * Остановка Enterprise сканирования
     */
    async stopEnterpriseScan(
        scanId: string,
        options: {
            force?: boolean;
            save_partial_results?: boolean;
            notify_stakeholders?: boolean;
        } = {}
    ): Promise<ApiResponse> {
        if (!scanId) {
            throw new Error('Scan ID is required');
        }

        return api.post(`/api/enterprise/scanner/${encodeURIComponent(scanId)}/stop`, options);
    }

    /**
     * Пауза/возобновление сканирования
     */
    async pauseResumeScan(
        scanId: string,
        action: 'pause' | 'resume',
        options: {
            reason?: string;
            duration?: number;
            notify?: boolean;
        } = {}
    ): Promise<ApiResponse> {
        if (!scanId) {
            throw new Error('Scan ID is required');
        }

        return api.post(`/api/enterprise/scanner/${encodeURIComponent(scanId)}/${action}`, options);
    }

    /**
     * Получение детальных результатов сканирования
     */
    async getDetailedScanResults(
        scanId: string,
        options: {
            include_raw_data?: boolean;
            include_ml_analysis?: boolean;
            include_threat_intel?: boolean;
            include_compliance?: boolean;
            include_business_impact?: boolean;
            format?: 'summary' | 'detailed' | 'comprehensive';
        } = {}
    ): Promise<EnterpriseScanResult> {
        if (!scanId) {
            throw new Error('Scan ID is required');
        }

        const queryParams = new URLSearchParams();
        Object.entries(options).forEach(([key, value]) => {
            if (value !== undefined) {
                queryParams.append(key, String(value));
            }
        });

        const url = `/api/enterprise/scanner/${encodeURIComponent(scanId)}/results${queryParams.toString() ? `?${queryParams}` : ''}`;
        return api.get<EnterpriseScanResult>(url);
    }

    // ===== ПАКЕТНОЕ СКАНИРОВАНИЕ =====

    /**
     * Запуск пакетного сканирования
     */
    async startBatchScan(configuration: BatchScanConfiguration): Promise<ApiResponse<{ batch_id: string; scan_ids: string[] }>> {
        return api.post('/api/enterprise/scanner/batch', configuration, { timeout: 180000 });
    }

    /**
     * Получение статуса пакетного сканирования
     */
    async getBatchScanStatus(batchId: string): Promise<{
        batch_id: string;
        status: 'running' | 'completed' | 'failed' | 'cancelled';
        progress: {
            total_scans: number;
            completed_scans: number;
            failed_scans: number;
            running_scans: number;
            overall_progress: number;
        };
        scan_statuses: Array<{
            scan_id: string;
            target: string;
            status: string;
            progress: number;
        }>;
        estimated_completion?: string;
    }> {
        if (!batchId) {
            throw new Error('Batch ID is required');
        }

        return api.get(`/api/enterprise/scanner/batch/${encodeURIComponent(batchId)}/status`);
    }

    /**
     * Управление пакетным сканированием
     */
    async manageBatchScan(
        batchId: string,
        action: 'pause' | 'resume' | 'stop' | 'priority_change',
        parameters: Record<string, any> = {}
    ): Promise<ApiResponse> {
        if (!batchId) {
            throw new Error('Batch ID is required');
        }

        return api.post(`/api/enterprise/scanner/batch/${encodeURIComponent(batchId)}/${action}`, parameters);
    }

    // ===== ПЛАНИРОВАНИЕ СКАНИРОВАНИЯ =====

    /**
     * Создание расписания сканирования
     */
    async createScanSchedule(settings: ScanScheduleSettings): Promise<ApiResponse<{ schedule_id: string }>> {
        return api.post('/api/enterprise/scanner/schedule', settings);
    }

    /**
     * Получение расписаний сканирования
     */
    async getScanSchedules(params: {
        tenant_id?: string;
        status?: 'active' | 'inactive' | 'all';
        limit?: number;
        offset?: number;
    } = {}): Promise<{
        schedules: ScanScheduleSettings[];
        total_count: number;
        next_executions: Array<{
            schedule_id: string;
            next_execution: string;
            scan_count: number;
        }>;
    }> {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) {
                queryParams.append(key, String(value));
            }
        });

        const url = `/api/enterprise/scanner/schedule${queryParams.toString() ? `?${queryParams}` : ''}`;
        return api.get(url);
    }

    /**
     * Обновление расписания сканирования
     */
    async updateScanSchedule(scheduleId: string, updates: Partial<ScanScheduleSettings>): Promise<ApiResponse> {
        if (!scheduleId) {
            throw new Error('Schedule ID is required');
        }

        return api.put(`/api/enterprise/scanner/schedule/${encodeURIComponent(scheduleId)}`, updates);
    }

    /**
     * Удаление расписания сканирования
     */
    async deleteScanSchedule(scheduleId: string): Promise<ApiResponse> {
        if (!scheduleId) {
            throw new Error('Schedule ID is required');
        }

        return api.delete(`/api/enterprise/scanner/schedule/${encodeURIComponent(scheduleId)}`);
    }

    /**
     * Управление расписанием
     */
    async manageScanSchedule(
        scheduleId: string,
        action: 'enable' | 'disable' | 'trigger_now' | 'skip_next',
        options: Record<string, any> = {}
    ): Promise<ApiResponse> {
        if (!scheduleId) {
            throw new Error('Schedule ID is required');
        }

        return api.post(`/api/enterprise/scanner/schedule/${encodeURIComponent(scheduleId)}/${action}`, options);
    }

    // ===== ВАЛИДАЦИЯ И ТЕСТИРОВАНИЕ =====

    /**
     * Валидация Enterprise цели
     */
    async validateEnterpriseTarget(
        target: string,
        options: {
            deep_validation?: boolean;
            business_context?: BusinessScanContext;
            compliance_check?: boolean;
            threat_intelligence?: boolean;
            permission_check?: boolean;
        } = {}
    ): Promise<{
        valid: boolean;
        status: 'online' | 'offline' | 'filtered' | 'unknown';
        message: string;
        details: {
            ip_resolution?: string;
            response_time?: number;
            open_ports?: number[];
            services?: string[];
            risk_assessment?: string;
            compliance_status?: string;
            business_classification?: string;
            threat_indicators?: string[];
            scanning_permissions?: boolean;
        };
        warnings?: string[];
        recommendations?: string[];
    }> {
        if (!target) {
            throw new Error('Target is required');
        }

        return api.post('/api/enterprise/scanner/validate-target', {
            target,
            options
        }, { timeout: 30000 });
    }

    /**
     * Тестирование конфигурации сканирования
     */
    async testScanConfiguration(
        settings: EnterpriseScanSettings,
        testMode: 'dry_run' | 'connectivity' | 'permissions' | 'full_test'
    ): Promise<{
        test_id: string;
        status: 'passed' | 'failed' | 'warning';
        results: Array<{
            test_name: string;
            status: 'passed' | 'failed' | 'warning';
            message: string;
            details?: Record<string, any>;
        }>;
        recommendations?: string[];
        estimated_scan_time?: number;
        resource_requirements?: ResourceAllocation;
    }> {
        return api.post('/api/enterprise/scanner/test-configuration', {
            settings,
            test_mode: testMode
        }, { timeout: 60000 });
    }

    // ===== ШАБЛОНЫ И ПРОФИЛИ =====

    /**
     * Получение шаблонов сканирования
     */
    async getScanTemplates(params: {
        category?: string;
        compliance_framework?: string;
        tenant_id?: string;
        include_custom?: boolean;
    } = {}): Promise<Array<{
        template_id: string;
        name: string;
        description: string;
        category: string;
        settings: EnterpriseScanSettings;
        usage_count: number;
        last_modified: string;
        compliance_frameworks: string[];
        recommended_for: string[];
    }>> {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) {
                queryParams.append(key, String(value));
            }
        });

        const url = `/api/enterprise/scanner/templates${queryParams.toString() ? `?${queryParams}` : ''}`;
        const response = await api.get<{ templates: any[] }>(url);
        return response.templates || [];
    }

    /**
     * Создание шаблона сканирования
     */
    async createScanTemplate(template: {
        name: string;
        description: string;
        category: string;
        settings: EnterpriseScanSettings;
        compliance_frameworks?: string[];
        tags?: string[];
    }): Promise<ApiResponse<{ template_id: string }>> {
        return api.post('/api/enterprise/scanner/templates', template);
    }

    /**
     * Обновление шаблона сканирования
     */
    async updateScanTemplate(templateId: string, updates: Record<string, any>): Promise<ApiResponse> {
        if (!templateId) {
            throw new Error('Template ID is required');
        }

        return api.put(`/api/enterprise/scanner/templates/${encodeURIComponent(templateId)}`, updates);
    }

    /**
     * Удаление шаблона сканирования
     */
    async deleteScanTemplate(templateId: string): Promise<ApiResponse> {
        if (!templateId) {
            throw new Error('Template ID is required');
        }

        return api.delete(`/api/enterprise/scanner/templates/${encodeURIComponent(templateId)}`);
    }

    // ===== УПРАВЛЕНИЕ АГЕНТАМИ =====

    /**
     * Получение списка агентов сканирования
     */
    async getScanAgents(params: {
        status?: 'online' | 'offline' | 'busy' | 'maintenance';
        location?: string;
        capabilities?: string[];
        tenant_id?: string;
    } = {}): Promise<Array<{
        agent_id: string;
        name: string;
        status: string;
        location: string;
        capabilities: string[];
        current_load: number;
        max_capacity: number;
        version: string;
        last_heartbeat: string;
        assigned_scans: string[];
        performance_metrics: {
            uptime: number;
            success_rate: number;
            average_scan_time: number;
            error_rate: number;
        };
    }>> {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) {
                if (Array.isArray(value)) {
                    value.forEach(v => queryParams.append(key, v));
                } else {
                    queryParams.append(key, String(value));
                }
            }
        });

        const url = `/api/enterprise/scanner/agents${queryParams.toString() ? `?${queryParams}` : ''}`;
        const response = await api.get<{ agents: any[] }>(url);
        return response.agents || [];
    }

    /**
     * Управление агентами сканирования
     */
    async manageScanAgent(
        agentId: string,
        action: 'start' | 'stop' | 'restart' | 'maintenance' | 'update',
        parameters: Record<string, any> = {}
    ): Promise<ApiResponse> {
        if (!agentId) {
            throw new Error('Agent ID is required');
        }

        return api.post(`/api/enterprise/scanner/agents/${encodeURIComponent(agentId)}/${action}`, parameters);
    }

    /**
     * Распределение нагрузки между агентами
     */
    async balanceAgentLoad(
        strategy: 'round_robin' | 'least_loaded' | 'geographic' | 'capability_based',
        parameters: {
            target_utilization?: number;
            geographic_preference?: string;
            capability_requirements?: string[];
            force_rebalance?: boolean;
        } = {}
    ): Promise<ApiResponse<{
        rebalancing_plan: Array<{
            scan_id: string;
            current_agent: string;
            target_agent: string;
            reason: string;
        }>;
        estimated_improvement: number;
    }>> {
        return api.post('/api/enterprise/scanner/agents/balance', {
            strategy,
            parameters
        });
    }

    // ===== АНАЛИТИКА И МОНИТОРИНГ =====

    /**
 * Получение аналитики сканирования
 */
    async getScanAnalytics(params: {
        time_range?: string;
        tenant_id?: string;
        scan_types?: string[];
        group_by?: 'day' | 'week' | 'month';
        metrics?: string[];
    } = {}): Promise<{
        summary: {
            total_scans: number;
            successful_scans: number;
            failed_scans: number;
            average_duration: number;
            total_vulnerabilities: number;
            most_common_issues: string[];
            improvement_trends: Array<{
                metric: string;
                change_percent: number;
                trend: 'up' | 'down' | 'stable';
            }>;
        };
        time_series: Array<{
            date: string;
            scans_count: number;
            success_rate: number;
            average_duration: number;
            vulnerabilities_found: number;
            performance_score: number;
        }>;
        scan_types_breakdown: Array<{
            scan_type: string;
            count: number;
            success_rate: number;
            average_duration: number;
            vulnerabilities_per_scan: number;
        }>;
        vulnerability_trends: Array<{
            severity: string;
            count: number;
            trend: 'increasing' | 'decreasing' | 'stable';
            change_percent: number;
        }>;
        performance_metrics: {
            cpu_utilization: number;
            memory_usage: number;
            network_efficiency: number;
            agent_performance: Array<{
                agent_id: string;
                utilization: number;
                success_rate: number;
                average_scan_time: number;
            }>;
        };
        recommendations: Array<{
            type: 'performance' | 'security' | 'operational';
            priority: 'low' | 'medium' | 'high' | 'critical';
            description: string;
            impact: string;
            implementation: string;
        }>;
    }> {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) {
                if (Array.isArray(value)) {
                    value.forEach(v => queryParams.append(key, v));
                } else {
                    queryParams.append(key, String(value));
                }
            }
        });

        const url = `/api/enterprise/scanner/analytics${queryParams.toString() ? `?${queryParams}` : ''}`;
        return api.get(url);
    }

    /**
     * Получение метрик производительности
     */
    async getPerformanceMetrics(params: {
        scan_id?: string;
        time_range?: string;
        granularity?: 'minute' | 'hour' | 'day';
        include_predictions?: boolean;
    } = {}): Promise<{
        overall_performance: {
            efficiency_score: number;
            resource_utilization: number;
            throughput: number;
            error_rate: number;
        };
        resource_metrics: {
            cpu_usage: Array<{ timestamp: string; value: number }>;
            memory_usage: Array<{ timestamp: string; value: number }>;
            network_usage: Array<{ timestamp: string; value: number }>;
            storage_usage: Array<{ timestamp: string; value: number }>;
        };
        scanning_metrics: {
            scan_speed: Array<{ timestamp: string; hosts_per_minute: number }>;
            accuracy_rate: Array<{ timestamp: string; value: number }>;
            completion_rate: Array<{ timestamp: string; value: number }>;
        };
        predictions?: {
            next_hour_performance: number;
            resource_requirements: ResourceAllocation;
            bottleneck_predictions: string[];
        };
    }> {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) {
                queryParams.append(key, String(value));
            }
        });

        const url = `/api/enterprise/scanner/performance${queryParams.toString() ? `?${queryParams}` : ''}`;
        return api.get(url);
    }

    /**
     * Получение истории сканирований
     */
    async getScanHistory(params: {
        tenant_id?: string;
        target?: string;
        scan_type?: string;
        status?: string;
        date_from?: string;
        date_to?: string;
        limit?: number;
        offset?: number;
        include_details?: boolean;
    } = {}): Promise<{
        scans: EnterpriseScanResult[];
        total_count: number;
        pagination: {
            current_page: number;
            total_pages: number;
            has_next: boolean;
            has_previous: boolean;
        };
        aggregations: {
            by_status: Record<string, number>;
            by_type: Record<string, number>;
            by_target: Record<string, number>;
            timeline: Array<{
                date: string;
                count: number;
            }>;
        };
    }> {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) {
                queryParams.append(key, String(value));
            }
        });

        const url = `/api/enterprise/scanner/history${queryParams.toString() ? `?${queryParams}` : ''}`;
        return api.get(url);
    }

    /**
     * Экспорт данных сканирования
     */
    async exportScanData(
        exportParams: {
            scan_ids?: string[];
            format: 'json' | 'csv' | 'excel' | 'pdf';
            include_metadata?: boolean;
            include_raw_results?: boolean;
            template?: string;
            filters?: Record<string, any>;
        }
    ): Promise<Blob> {
        const response = await api.request<Blob>('/api/enterprise/scanner/export', {
            method: 'POST',
            body: exportParams,
            headers: {
                'Accept': exportParams.format === 'json' ? 'application/json' :
                    exportParams.format === 'csv' ? 'text/csv' :
                        exportParams.format === 'excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' :
                            'application/pdf'
            }
        });

        return response;
    }

    /**
     * Клонирование сканирования
     */
    async cloneScan(
        scanId: string,
        modifications: {
            new_target?: string;
            new_settings?: Partial<EnterpriseScanSettings>;
            schedule?: ScheduleConfiguration;
        } = {}
    ): Promise<ApiResponse<{ scan_id: string }>> {
        if (!scanId) {
            throw new Error('Scan ID is required');
        }

        return api.post(`/api/enterprise/scanner/${encodeURIComponent(scanId)}/clone`, modifications);
    }

    /**
     * Сравнение результатов сканирований
     */
    async compareScans(
        scanIds: string[],
        options: {
            comparison_type?: 'vulnerabilities' | 'services' | 'ports' | 'full';
            highlight_changes?: boolean;
            include_recommendations?: boolean;
        } = {}
    ): Promise<{
        comparison_id: string;
        scans_compared: Array<{
            scan_id: string;
            target: string;
            scan_date: string;
            status: string;
        }>;
        differences: {
            vulnerabilities: {
                added: EnterpriseVulnerability[];
                removed: EnterpriseVulnerability[];
                modified: Array<{
                    before: EnterpriseVulnerability;
                    after: EnterpriseVulnerability;
                    changes: string[];
                }>;
            };
            services: {
                added: ServiceInfo[];
                removed: ServiceInfo[];
                modified: ServiceInfo[];
            };
            ports: {
                added: PortInfo[];
                removed: PortInfo[];
                status_changed: Array<{
                    port: number;
                    old_status: string;
                    new_status: string;
                }>;
            };
        };
        summary: {
            total_changes: number;
            security_impact: 'improved' | 'degraded' | 'unchanged';
            recommendations: string[];
        };
        detailed_analysis: {
            risk_change: number;
            new_attack_vectors: string[];
            closed_attack_vectors: string[];
            compliance_impact: string[];
        };
    }> {
        if (!scanIds || scanIds.length < 2) {
            throw new Error('At least 2 scan IDs are required for comparison');
        }

        return api.post('/api/enterprise/scanner/compare', {
            scan_ids: scanIds,
            options
        });
    }

    // ===== КОНФИГУРАЦИЯ И УПРАВЛЕНИЕ =====

    /**
     * Получение конфигурации сканера
     */
    async getScannerConfiguration(): Promise<{
        global_settings: {
            max_concurrent_scans: number;
            default_timeout: number;
            rate_limiting: boolean;
            security_policies: string[];
        };
        scan_policies: Array<{
            policy_id: string;
            name: string;
            description: string;
            rules: string[];
            applies_to: string[];
        }>;
        integration_settings: IntegrationSettings;
        notification_settings: ScanNotificationSettings;
        performance_tuning: {
            cpu_allocation: number;
            memory_allocation: number;
            network_optimization: boolean;
            caching_strategy: string;
        };
    }> {
        return api.get('/api/enterprise/scanner/configuration');
    }

    /**
     * Обновление конфигурации сканера
     */
    async updateScannerConfiguration(
        updates: {
            global_settings?: Record<string, any>;
            scan_policies?: Array<{ policy_id: string; changes: Record<string, any> }>;
            integration_settings?: Partial<IntegrationSettings>;
            notification_settings?: Partial<ScanNotificationSettings>;
            performance_tuning?: Record<string, any>;
        }
    ): Promise<ApiResponse> {
        return api.put('/api/enterprise/scanner/configuration', updates);
    }

    /**
     * Получение статистики использования ресурсов
     */
    async getResourceUsage(params: {
        time_range?: string;
        granularity?: 'minute' | 'hour' | 'day';
        include_predictions?: boolean;
    } = {}): Promise<{
        current_usage: {
            cpu_percent: number;
            memory_percent: number;
            network_mbps: number;
            storage_gb: number;
            active_scans: number;
        };
        historical_data: Array<{
            timestamp: string;
            cpu_percent: number;
            memory_percent: number;
            network_mbps: number;
            active_scans: number;
        }>;
        limits: {
            max_cpu_percent: number;
            max_memory_gb: number;
            max_network_mbps: number;
            max_concurrent_scans: number;
        };
        recommendations: Array<{
            type: 'scaling' | 'optimization' | 'configuration';
            description: string;
            impact: string;
            implementation_cost: string;
        }>;
        predictions?: {
            next_hour: ResourceUsage;
            next_day: ResourceUsage;
            bottlenecks: string[];
        };
    }> {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) {
                queryParams.append(key, String(value));
            }
        });

        const url = `/api/enterprise/scanner/resources${queryParams.toString() ? `?${queryParams}` : ''}`;
        return api.get(url);
    }

    // ===== БЕЗОПАСНОСТЬ И АУДИТ =====

    /**
     * Получение журнала аудита
     */
    async getAuditLog(params: {
        start_date?: string;
        end_date?: string;
        user_id?: string;
        action_type?: string;
        resource_type?: string;
        severity?: string;
        limit?: number;
        offset?: number;
    } = {}): Promise<{
        audit_entries: Array<{
            entry_id: string;
            timestamp: string;
            user_id: string;
            user_name: string;
            action: string;
            resource_type: string;
            resource_id: string;
            details: Record<string, any>;
            ip_address: string;
            user_agent: string;
            result: 'success' | 'failure' | 'error';
            severity: 'low' | 'medium' | 'high' | 'critical';
        }>;
        total_count: number;
        summary: {
            by_action: Record<string, number>;
            by_user: Record<string, number>;
            by_result: Record<string, number>;
            by_severity: Record<string, number>;
        };
    }> {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) {
                queryParams.append(key, String(value));
            }
        });

        const url = `/api/enterprise/scanner/audit${queryParams.toString() ? `?${queryParams}` : ''}`;
        return api.get(url);
    }

    /**
     * Проверка соответствия безопасности
     */
    async performSecurityCompliance(
        frameworks: string[] = ['iso27001', 'nist', 'pci-dss']
    ): Promise<{
        compliance_id: string;
        frameworks_checked: string[];
        overall_score: number;
        results: Array<{
            framework: string;
            score: number;
            status: 'compliant' | 'non_compliant' | 'partially_compliant';
            findings: Array<{
                control_id: string;
                control_name: string;
                status: 'pass' | 'fail' | 'warning';
                description: string;
                remediation: string;
                priority: 'low' | 'medium' | 'high' | 'critical';
            }>;
        }>;
        recommendations: Array<{
            priority: 'low' | 'medium' | 'high' | 'critical';
            framework: string;
            description: string;
            implementation_steps: string[];
            estimated_effort: string;
        }>;
        certification_status: Array<{
            framework: string;
            certification_level: string;
            gaps_to_certification: string[];
            estimated_timeline: string;
        }>;
    }> {
        return api.post('/api/enterprise/scanner/compliance', {
            frameworks
        }, { timeout: 300000 });
    }

    // ===== ИНТЕГРАЦИЯ С ВНЕШНИМИ СИСТЕМАМИ =====

    /**
     * Синхронизация с внешними системами
     */
    async syncWithExternalSystems(
        syncConfig: {
            systems: Array<{
                system_type: 'siem' | 'soar' | 'cmdb' | 'ticketing' | 'threat_intel';
                system_id: string;
                sync_direction: 'push' | 'pull' | 'bidirectional';
                data_types: string[];
                filters?: Record<string, any>;
            }>;
            schedule?: ScheduleConfiguration;
            notification_settings?: {
                on_success: boolean;
                on_failure: boolean;
                recipients: string[];
            };
        }
    ): Promise<ApiResponse<{
        sync_id: string;
        systems_configured: number;
        estimated_sync_time: string;
    }>> {
        return api.post('/api/enterprise/scanner/sync', syncConfig);
    }

    /**
     * Получение статуса синхронизации
     */
    async getSyncStatus(syncId: string): Promise<{
        sync_id: string;
        status: 'running' | 'completed' | 'failed' | 'cancelled';
        progress: number;
        systems_sync_status: Array<{
            system_id: string;
            system_type: string;
            status: string;
            records_processed: number;
            last_sync: string;
            errors: string[];
        }>;
        overall_progress: {
            total_records: number;
            processed_records: number;
            failed_records: number;
            success_rate: number;
        };
    }> {
        if (!syncId) {
            throw new Error('Sync ID is required');
        }

        return api.get(`/api/enterprise/scanner/sync/${encodeURIComponent(syncId)}/status`);
    }

    // ===== МАШИННОЕ ОБУЧЕНИЕ И ИИ =====

    /**
     * Обучение моделей машинного обучения
     */
    async trainMLModels(
        trainingConfig: {
            model_types: string[];
            training_data_filters: Record<string, any>;
            validation_split: number;
            hyperparameters?: Record<string, any>;
            auto_deploy?: boolean;
        }
    ): Promise<ApiResponse<{
        training_job_id: string;
        models_scheduled: string[];
        estimated_training_time: string;
    }>> {
        return api.post('/api/enterprise/scanner/ml/train', trainingConfig, {
            timeout: 600000 // 10 минут
        });
    }

    /**
     * Получение статуса обучения ML
     */
    async getMLTrainingStatus(jobId: string): Promise<{
        job_id: string;
        status: 'queued' | 'training' | 'validating' | 'completed' | 'failed';
        progress: number;
        models_status: Array<{
            model_name: string;
            model_type: string;
            training_progress: number;
            current_epoch?: number;
            total_epochs?: number;
            current_loss?: number;
            validation_accuracy?: number;
            status: string;
        }>;
        performance_metrics?: {
            training_accuracy: number;
            validation_accuracy: number;
            f1_score: number;
            precision: number;
            recall: number;
        };
    }> {
        if (!jobId) {
            throw new Error('Job ID is required');
        }

        return api.get(`/api/enterprise/scanner/ml/train/${encodeURIComponent(jobId)}/status`);
    }

    /**
     * Получение предсказаний от ML моделей
     */
    async getMLPredictions(
        scanId: string,
        options: {
            model_types?: string[];
            confidence_threshold?: number;
            include_explanations?: boolean;
        } = {}
    ): Promise<{
        scan_id: string;
        predictions: Array<{
            model_name: string;
            model_type: string;
            predictions: Array<{
                target: string;
                prediction: string;
                confidence: number;
                probability_distribution?: Record<string, number>;
                explanation?: string;
                features_used?: string[];
            }>;
            model_confidence: number;
            prediction_time: string;
        }>;
        aggregated_insights: {
            high_confidence_predictions: number;
            anomalies_detected: number;
            risk_assessment: {
                overall_risk: 'low' | 'medium' | 'high' | 'critical';
                risk_factors: string[];
                recommendations: string[];
            };
        };
    }> {
        if (!scanId) {
            throw new Error('Scan ID is required');
        }

        return api.post(`/api/enterprise/scanner/${encodeURIComponent(scanId)}/ml/predict`, options);
    }

    // ===== УТИЛИТАРНЫЕ МЕТОДЫ =====

    /**
     * Валидация Enterprise настроек сканирования
     */
    private validateEnterpriseScanSettings(settings: EnterpriseScanSettings): void {
        if (!settings.target?.trim()) {
            throw new Error('Target is required');
        }

        if (!settings.ports?.trim()) {
            throw new Error('Ports configuration is required');
        }

        if (!settings.profile?.trim()) {
            throw new Error('Scan profile is required');
        }

        // Валидация формата цели
        const target = settings.target.trim();
        if (!this.validateNetworkTarget(target)) {
            throw new Error('Invalid target format. Use IP address, domain, or CIDR notation');
        }

        // Валидация кастомных портов
        if (settings.ports === 'custom' && settings.custom_ports) {
            if (!this.validatePortRange(settings.custom_ports)) {
                throw new Error('Invalid ports format. Use: 80,443,8080-8090');
            }
        }

        // Enterprise валидации
        if (settings.tenant_id && !this.validateTenantId(settings.tenant_id)) {
            throw new Error('Invalid tenant ID format');
        }

        if (settings.resource_allocation) {
            this.validateResourceAllocation(settings.resource_allocation);
        }

        if (settings.business_context) {
            this.validateBusinessContext(settings.business_context);
        }
    }

    /**
     * Валидация сетевой цели
     */
    private validateNetworkTarget(target: string): boolean {
        // IP адрес
        const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

        // Домен
        const domainRegex = /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;

        // CIDR
        const cidrRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\/(?:[0-9]|[1-2][0-9]|3[0-2])$/;

        // Диапазон IP
        const rangeRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)-(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

        return ipRegex.test(target) || domainRegex.test(target) || cidrRegex.test(target) || rangeRegex.test(target);
    }

    /**
     * Валидация диапазона портов
     */
    private validatePortRange(portRange: string): boolean {
        const portRegex = /^(\d+(-\d+)?)(,\d+(-\d+)?)*$/;

        if (!portRegex.test(portRange)) {
            return false;
        }

        const parts = portRange.split(',');
        for (const part of parts) {
            if (part.includes('-')) {
                const [start, end] = part.split('-').map(Number);
                if (start < 1 || end > 65535 || start > end) {
                    return false;
                }
            } else {
                const port = Number(part);
                if (port < 1 || port > 65535) {
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * Валидация Tenant ID
     */
    private validateTenantId(tenantId: string): boolean {
        return /^[a-zA-Z0-9_-]+$/.test(tenantId);
    }

    /**
     * Валидация выделения ресурсов
     */
    private validateResourceAllocation(allocation: ResourceAllocation): void {
        if (allocation.cpu_cores && (allocation.cpu_cores < 1 || allocation.cpu_cores > 64)) {
            throw new Error('CPU cores must be between 1 and 64');
        }

        if (allocation.memory_gb && (allocation.memory_gb < 1 || allocation.memory_gb > 256)) {
            throw new Error('Memory must be between 1 and 256 GB');
        }

        if (allocation.budget_limit && allocation.budget_limit < 0) {
            throw new Error('Budget limit cannot be negative');
        }
    }

    /**
     * Валидация бизнес-контекста
     */
    private validateBusinessContext(context: BusinessScanContext): void {
        if (!context.organization_id?.trim()) {
            throw new Error('Organization ID is required in business context');
        }

        if (!context.business_unit?.trim()) {
            throw new Error('Business unit is required in business context');
        }

        if (!context.owner?.trim()) {
            throw new Error('Owner is required in business context');
        }

        const validEnvironments = ['production', 'staging', 'development', 'testing', 'disaster_recovery'];
        if (!validEnvironments.includes(context.environment)) {
            throw new Error(`Invalid environment. Must be one of: ${validEnvironments.join(', ')}`);
        }

        const validCriticalities = ['low', 'medium', 'high', 'critical'];
        if (!validCriticalities.includes(context.criticality)) {
            throw new Error(`Invalid criticality. Must be one of: ${validCriticalities.join(', ')}`);
        }
    }

    /**
     * Получение статистики использования API
     */
    getEnterpriseApiStats(): {
        totalRequests: number;
        scanRequests: number;
        templateRequests: number;
        agentRequests: number;
        analyticsRequests: number;
        mlRequests: number;
        cacheHitRatio: number;
        averageResponseTime: number;
    } {
        const baseStats = api.getStats();
        return {
            ...baseStats,
            scanRequests: 0, // Эти метрики будут собираться отдельно
            templateRequests: 0,
            agentRequests: 0,
            analyticsRequests: 0,
            mlRequests: 0
        };
    }

    /**
     * Очистка кэша сканера
     */
    clearScannerCache(pattern?: string): void {
        if (pattern) {
            api.clearCache(`scanner-${pattern}`);
        } else {
            api.clearCache('scanner');
        }
    }

    /**
     * Проверка доступности Enterprise функций
     */
    async checkEnterpriseFeatures(): Promise<{
        ml_scanning: boolean;
        threat_intelligence: boolean;
        compliance_scanning: boolean;
        advanced_reporting: boolean;
        api_integrations: boolean;
        multi_tenant: boolean;
        custom_policies: boolean;
        priority_support: boolean;
    }> {
        try {
            const response = await api.get('/api/enterprise/scanner/features');
            return response.features;
        } catch (error) {
            console.warn('⚠️ Не удалось проверить Enterprise функции:', error);
            return {
                ml_scanning: false,
                threat_intelligence: false,
                compliance_scanning: false,
                advanced_reporting: false,
                api_integrations: false,
                multi_tenant: false,
                custom_policies: false,
                priority_support: false
            };
        }
    }

    /**
     * Получение информации о лицензии
     */
    async getLicenseInfo(): Promise<{
        license_type: 'community' | 'professional' | 'enterprise';
        features_enabled: string[];
        usage_limits: {
            max_concurrent_scans: number;
            max_targets_per_scan: number;
            max_scan_history: number;
            api_rate_limit: number;
        };
        current_usage: {
            concurrent_scans: number;
            monthly_scans: number;
            api_calls_today: number;
        };
        expiry_date?: string;
        support_level: 'community' | 'email' | 'priority' | '24x7';
    }> {
        return api.get('/api/enterprise/scanner/license');
    }

    /**
     * Экспорт конфигурации
     */
    async exportConfiguration(
        options: {
            include_templates?: boolean;
            include_schedules?: boolean;
            include_integrations?: boolean;
            include_ml_models?: boolean;
            format?: 'json' | 'yaml' | 'xml';
        } = {}
    ): Promise<Blob> {
        const response = await api.request<Blob>('/api/enterprise/scanner/configuration/export', {
            method: 'POST',
            body: options,
            headers: {
                'Accept': options.format === 'yaml' ? 'application/x-yaml' :
                    options.format === 'xml' ? 'application/xml' :
                        'application/json'
            }
        });

        return response;
    }

    /**
     * Импорт конфигурации
     */
    async importConfiguration(
        file: File,
        options: {
            merge_strategy?: 'replace' | 'merge' | 'skip_existing';
            validate_before_import?: boolean;
            backup_current?: boolean;
        } = {}
    ): Promise<ApiResponse<{
        imported_items: number;
        skipped_items: number;
        failed_items: number;
        backup_id?: string;
        warnings: string[];
    }>> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('options', JSON.stringify(options));

        return api.request('/api/enterprise/scanner/configuration/import', {
            method: 'POST',
            body: formData,
            headers: {}, // Не устанавливаем Content-Type для FormData
            timeout: 300000 // 5 минут
        });
    }
}

// ===== ЭКСПОРТ =====

// Создание глобального экземпляра Enterprise Scanner API
export const enterpriseScannerApi = new EnterpriseScannerApiService();

// Экспорт класса для создания дополнительных экземпляров
export { EnterpriseScannerApiService };

// Экспорт всех типов
export type * from './scannerApi';

// Удобные методы для импорта основных функций
export const {
    startEnterpriseScan,
    getEnterpriseScanStatus,
    stopEnterpriseScan,
    pauseResumeScan,
    getDetailedScanResults,
    startBatchScan,
    getBatchScanStatus,
    manageBatchScan,
    createScanSchedule,
    getScanSchedules,
    updateScanSchedule,
    deleteScanSchedule,
    manageScanSchedule,
    validateEnterpriseTarget,
    testScanConfiguration,
    getScanTemplates,
    createScanTemplate,
    updateScanTemplate,
    deleteScanTemplate,
    getScanAgents,
    manageScanAgent,
    balanceAgentLoad,
    getScanAnalytics,
    getPerformanceMetrics,
    getScanHistory,
    exportScanData,
    cloneScan,
    compareScans,
    getScannerConfiguration,
    updateScannerConfiguration,
    getResourceUsage,
    getAuditLog,
    performSecurityCompliance,
    syncWithExternalSystems,
    getSyncStatus,
    trainMLModels,
    getMLTrainingStatus,
    getMLPredictions,
    checkEnterpriseFeatures,
    getLicenseInfo,
    exportConfiguration,
    importConfiguration,
    getEnterpriseApiStats,
    clearScannerCache
} = enterpriseScannerApi;

// Экспорт для отладки в development режиме
if (import.meta.env.DEV) {
    (window as any).__ENTERPRISE_SCANNER_API__ = enterpriseScannerApi;
    console.log('🔧 Enterprise Scanner API доступен глобально как __ENTERPRISE_SCANNER_API__');
}

export const scannerApi = new EnterpriseScannerApiService();
export default scannerApi;