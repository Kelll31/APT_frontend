// frontend/src/stores/reportsStore.ts

/**
 * IP Roast Enterprise - Reports Store v3.0 ENTERPRISE
 * Centralized state management для системы отчетности с расширенными возможностями
 */

import { reactive, computed, ref, watch, nextTick } from 'vue';
import { defineStore } from 'pinia';

// ===== ТИПЫ ДАННЫХ ДЛЯ ОТЧЕТОВ =====

// Тип отчета
export type ReportType =
    | 'scan_report' | 'vulnerability_report' | 'compliance_report' | 'executive_summary'
    | 'technical_detail' | 'risk_assessment' | 'trend_analysis' | 'comparison_report'
    | 'audit_report' | 'penetration_test' | 'asset_inventory' | 'threat_intelligence';

// Формат отчета
export type ReportFormat = 'html' | 'pdf' | 'json' | 'xml' | 'csv' | 'excel' | 'word' | 'pptx';

// Статус отчета
export type ReportStatus =
    | 'generating' | 'completed' | 'failed' | 'archived' | 'scheduled'
    | 'pending_approval' | 'approved' | 'rejected' | 'published' | 'expired';

// Приоритет отчета
export type ReportPriority = 'low' | 'normal' | 'high' | 'critical' | 'urgent';

// Уровень конфиденциальности
export type ConfidentialityLevel = 'public' | 'internal' | 'confidential' | 'restricted' | 'top_secret';

// Основной интерфейс отчета
export interface Report {
    id: string;
    title: string;
    description?: string;
    type: ReportType;
    status: ReportStatus;
    priority: ReportPriority;

    // Метаданные
    scan_id?: string;
    template_id?: string;
    created_by: string;
    assigned_to?: string;
    created_at: string;
    updated_at?: string;
    scheduled_at?: string;
    completed_at?: string;
    published_at?: string;
    expires_at?: string;

    // Содержимое и данные
    data: ReportData;
    summary: ReportSummary;
    sections: ReportSection[];
    attachments: ReportAttachment[];

    // Настройки и конфигурация
    format: ReportFormat;
    template_settings?: TemplateSettings;
    generation_settings: GenerationSettings;
    distribution_settings?: DistributionSettings;

    // Безопасность и соответствие
    confidentiality_level: ConfidentialityLevel;
    access_controls: AccessControl[];
    compliance_frameworks: string[];
    retention_policy?: RetentionPolicy;

    // Enterprise функции
    tenant_id?: string;
    business_context?: BusinessContext;
    approval_workflow?: ApprovalWorkflow;
    audit_trail: AuditEntry[];

    // Метрики и аналитика
    metrics: ReportMetrics;
    quality_score?: number;
    feedback?: ReportFeedback[];

    // Статус генерации
    generation_progress?: number;
    generation_phase?: string;
    generation_errors?: GenerationError[];

    // Файлы и хранение
    file_path?: string;
    file_size?: number;
    file_hash?: string;
    download_count?: number;

    // Связи и зависимости
    parent_report_id?: string;
    child_reports?: string[];
    related_reports?: string[];

    // Пользовательские поля
    tags: string[];
    custom_fields?: Record<string, any>;

    // Кэширование и оптимизация
    cache_key?: string;
    last_accessed?: string;
    access_count?: number;
}

// Данные отчета
export interface ReportData {
    scan_results?: any;
    vulnerabilities?: Vulnerability[];
    assets?: Asset[];
    compliance_results?: ComplianceResult[];
    risk_assessments?: RiskAssessment[];
    charts?: Chart[];
    tables?: Table[];
    raw_data?: Record<string, any>;
    processed_data?: Record<string, any>;
    aggregations?: Aggregation[];
    trends?: TrendData[];
    comparisons?: ComparisonData[];
}

// Уязвимость
export interface Vulnerability {
    id: string;
    cve_id?: string;
    title: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    cvss_score?: number;
    cvss_vector?: string;
    affected_assets: string[];
    discovery_date: string;

    // Детали уязвимости
    category: string;
    cwe_id?: string;
    exploitability: 'not_exploitable' | 'difficult' | 'easy' | 'automated';
    proof_of_concept?: string;
    references: string[];

    // Исправление
    remediation: string;
    remediation_effort: 'low' | 'medium' | 'high';
    remediation_priority: number;
    patch_available: boolean;
    vendor_fix?: string;
    workaround?: string;

    // Бизнес-контекст
    business_impact: 'low' | 'medium' | 'high' | 'critical';
    data_exposure_risk: boolean;
    compliance_violations: string[];

    // Техническая информация
    attack_vector: 'local' | 'adjacent' | 'network' | 'physical';
    attack_complexity: 'low' | 'high';
    privileges_required: 'none' | 'low' | 'high';
    user_interaction: 'none' | 'required';

    // Метаданные
    false_positive_risk: number;
    verification_status: 'unverified' | 'verified' | 'false_positive';
    remediation_status: 'open' | 'in_progress' | 'fixed' | 'accepted_risk';

    // Временные метки
    first_detected: string;
    last_detected: string;
    remediation_deadline?: string;

    // Дополнительная информация
    tags: string[];
    custom_fields?: Record<string, any>;
}

// Актив
export interface Asset {
    id: string;
    name: string;
    type: 'server' | 'workstation' | 'mobile' | 'network_device' | 'application' | 'database' | 'other';
    ip_address?: string;
    hostname?: string;
    mac_address?: string;

    // Классификация
    criticality: 'low' | 'medium' | 'high' | 'critical';
    business_function: string;
    data_classification: ConfidentialityLevel;

    // Техническая информация
    operating_system?: string;
    version?: string;
    services: Service[];
    open_ports: number[];

    // Безопасность
    security_posture: number;
    vulnerability_count: number;
    last_scan_date?: string;
    compliance_status: string;

    // Метаданные
    owner: string;
    location: string;
    environment: 'production' | 'staging' | 'development' | 'testing';

    // Связи
    dependencies: string[];
    network_segment: string;

    tags: string[];
    custom_fields?: Record<string, any>;
}

// Сервис
export interface Service {
    name: string;
    port: number;
    protocol: 'tcp' | 'udp';
    version?: string;
    banner?: string;
    state: 'open' | 'closed' | 'filtered';
    confidence: number;
    vulnerabilities: string[];
}

// Результат соответствия
export interface ComplianceResult {
    framework: string;
    version: string;
    overall_score: number;
    status: 'compliant' | 'non_compliant' | 'partially_compliant';

    controls: ComplianceControl[];
    violations: ComplianceViolation[];
    recommendations: string[];

    assessment_date: string;
    assessor: string;
    next_review_date: string;

    certification_status?: 'certified' | 'pending' | 'expired' | 'suspended';
    audit_findings?: string[];

    custom_fields?: Record<string, any>;
}

// Контроль соответствия
export interface ComplianceControl {
    control_id: string;
    control_name: string;
    description: string;
    status: 'pass' | 'fail' | 'not_applicable' | 'partial';
    evidence: string[];
    implementation_notes?: string;
    responsible_party?: string;
    testing_date?: string;
}

// Нарушение соответствия
export interface ComplianceViolation {
    violation_id: string;
    control_id: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    evidence: string;
    remediation_plan: string;
    deadline?: string;
    status: 'open' | 'in_progress' | 'resolved' | 'accepted';
}

// Оценка рисков
export interface RiskAssessment {
    id: string;
    title: string;
    scope: string;
    methodology: string;

    overall_risk_level: 'low' | 'medium' | 'high' | 'critical';
    risk_score: number;

    threats: ThreatAssessment[];
    vulnerabilities: string[];
    controls: SecurityControl[];

    residual_risk: number;
    risk_appetite: number;
    risk_tolerance: number;

    recommendations: RiskRecommendation[];
    mitigation_strategies: MitigationStrategy[];

    assessment_date: string;
    assessor: string;
    review_date: string;

    custom_fields?: Record<string, any>;
}

// Оценка угроз
export interface ThreatAssessment {
    threat_id: string;
    threat_name: string;
    threat_type: string;
    likelihood: number;
    impact: number;
    risk_level: number;
    threat_sources: string[];
    attack_methods: string[];
    existing_controls: string[];
    control_effectiveness: number;
}

// Контроль безопасности
export interface SecurityControl {
    control_id: string;
    control_name: string;
    control_type: 'preventive' | 'detective' | 'corrective' | 'deterrent';
    implementation_status: 'not_implemented' | 'partially_implemented' | 'implemented' | 'optimized';
    effectiveness: number;
    cost: number;
    maintenance_effort: 'low' | 'medium' | 'high';
}

// Рекомендация по рискам
export interface RiskRecommendation {
    recommendation_id: string;
    title: string;
    description: string;
    risk_reduction: number;
    implementation_cost: number;
    priority: number;
    timeline: string;
    responsible_party?: string;
    dependencies?: string[];
}

// Стратегия митигации
export interface MitigationStrategy {
    strategy_id: string;
    name: string;
    description: string;
    target_risks: string[];
    approach: 'avoid' | 'mitigate' | 'transfer' | 'accept';
    implementation_plan: string;
    success_metrics: string[];
    monitoring_plan: string;
}

// График
export interface Chart {
    id: string;
    title: string;
    type: 'bar' | 'line' | 'pie' | 'doughnut' | 'scatter' | 'radar' | 'area' | 'histogram';
    data: ChartData;
    options: ChartOptions;
    description?: string;
    insights?: string[];
}

// Данные графика
export interface ChartData {
    labels: string[];
    datasets: ChartDataset[];
}

// Набор данных графика
export interface ChartDataset {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
    fill?: boolean;
}

// Опции графика
export interface ChartOptions {
    responsive: boolean;
    maintainAspectRatio: boolean;
    plugins?: Record<string, any>;
    scales?: Record<string, any>;
    animations?: Record<string, any>;
}

// Таблица
export interface Table {
    id: string;
    title: string;
    columns: TableColumn[];
    rows: TableRow[];
    summary?: TableSummary;
    pagination?: TablePagination;
    sorting?: TableSorting;
    filtering?: TableFiltering;
}

// Колонка таблицы
export interface TableColumn {
    key: string;
    title: string;
    type: 'text' | 'number' | 'date' | 'status' | 'progress' | 'link' | 'tag';
    sortable?: boolean;
    filterable?: boolean;
    width?: string;
    align?: 'left' | 'center' | 'right';
    format?: string;
}

// Строка таблицы
export interface TableRow {
    id: string;
    data: Record<string, any>;
    metadata?: Record<string, any>;
    actions?: TableAction[];
}

// Действие таблицы
export interface TableAction {
    id: string;
    label: string;
    icon?: string;
    action: string;
    enabled?: boolean;
    visible?: boolean;
}

// Сводка таблицы
export interface TableSummary {
    total_rows: number;
    summary_data?: Record<string, any>;
    aggregations?: Record<string, number>;
}

// Пагинация таблицы
export interface TablePagination {
    current_page: number;
    total_pages: number;
    page_size: number;
    total_items: number;
}

// Сортировка таблицы
export interface TableSorting {
    column: string;
    direction: 'asc' | 'desc';
}

// Фильтрация таблицы
export interface TableFiltering {
    filters: Record<string, any>;
    search_query?: string;
}

// Агрегация
export interface Aggregation {
    name: string;
    type: 'sum' | 'count' | 'average' | 'min' | 'max' | 'median' | 'percentile';
    field: string;
    value: number;
    unit?: string;
    description?: string;
}

// Данные трендов
export interface TrendData {
    metric: string;
    period: string;
    data_points: TrendDataPoint[];
    trend_direction: 'up' | 'down' | 'stable';
    change_percentage: number;
    forecast?: TrendDataPoint[];
}

// Точка данных тренда
export interface TrendDataPoint {
    timestamp: string;
    value: number;
    metadata?: Record<string, any>;
}

// Данные сравнения
export interface ComparisonData {
    comparison_type: 'before_after' | 'baseline' | 'peer' | 'target';
    baseline: Record<string, any>;
    current: Record<string, any>;
    differences: ComparisonDifference[];
    summary: string;
}

// Различие в сравнении
export interface ComparisonDifference {
    field: string;
    baseline_value: any;
    current_value: any;
    change: number;
    change_type: 'improvement' | 'degradation' | 'neutral';
    significance: 'low' | 'medium' | 'high';
}

// Сводка отчета
export interface ReportSummary {
    executive_summary: string;
    key_findings: string[];
    recommendations: string[];
    risk_level: 'low' | 'medium' | 'high' | 'critical';
    overall_score?: number;

    // Статистика
    total_assets?: number;
    total_vulnerabilities?: number;
    critical_vulnerabilities?: number;
    compliance_score?: number;

    // Основные метрики
    key_metrics: KeyMetric[];

    // Тренды
    trend_indicators: TrendIndicator[];

    // Действия
    immediate_actions: string[];
    long_term_actions: string[];
}

// Ключевая метрика
export interface KeyMetric {
    name: string;
    value: number;
    unit?: string;
    change?: number;
    trend: 'up' | 'down' | 'stable';
    status: 'good' | 'warning' | 'critical';
    description?: string;
}

// Индикатор тренда
export interface TrendIndicator {
    metric: string;
    current_value: number;
    previous_value: number;
    change_percentage: number;
    trend_status: 'improving' | 'stable' | 'declining';
}

// Секция отчета
export interface ReportSection {
    id: string;
    title: string;
    order: number;
    type: 'text' | 'chart' | 'table' | 'image' | 'list' | 'code' | 'metrics' | 'custom';
    content: any;
    visible: boolean;
    required: boolean;

    // Метаданные секции
    description?: string;
    author?: string;
    last_modified?: string;

    // Настройки отображения
    formatting?: SectionFormatting;
    conditional_display?: ConditionalDisplay;

    // Данные секции
    data_source?: string;
    data_query?: string;
    data_transformations?: string[];

    // Валидация
    validation_rules?: ValidationRule[];
    quality_checks?: QualityCheck[];

    custom_fields?: Record<string, any>;
}

// Форматирование секции
export interface SectionFormatting {
    template?: string;
    css_classes?: string[];
    inline_styles?: Record<string, string>;
    layout?: 'single_column' | 'two_column' | 'grid';
    page_break?: 'before' | 'after' | 'avoid';
}

// Условное отображение
export interface ConditionalDisplay {
    condition: string;
    show_if_true: boolean;
    fallback_content?: any;
}

// Правило валидации
export interface ValidationRule {
    rule_type: string;
    condition: string;
    error_message: string;
    warning_message?: string;
}

// Проверка качества
export interface QualityCheck {
    check_type: string;
    threshold: number;
    current_value?: number;
    status?: 'pass' | 'fail' | 'warning';
}

// Вложение отчета
export interface ReportAttachment {
    id: string;
    name: string;
    description?: string;
    file_path: string;
    file_size: number;
    mime_type: string;
    hash: string;

    // Метаданные
    created_by: string;
    created_at: string;
    last_accessed?: string;
    access_count?: number;

    // Права доступа
    access_controls: AccessControl[];
    download_permissions: string[];

    // Валидация
    virus_scan_status?: 'clean' | 'infected' | 'scanning' | 'unknown';
    content_validation?: 'valid' | 'invalid' | 'unknown';

    tags: string[];
    custom_fields?: Record<string, any>;
}

// Контроль доступа
export interface AccessControl {
    type: 'user' | 'group' | 'role' | 'permission';
    identifier: string;
    permissions: string[];
    conditions?: string[];
    expiry_date?: string;
}

// Настройки шаблона
export interface TemplateSettings {
    template_id: string;
    version: string;
    customizations: TemplateCustomization[];
    variable_overrides: Record<string, any>;
    section_overrides: Record<string, any>;
    styling_overrides: StylingOverrides;
    branding: BrandingSettings;
}

// Кастомизация шаблона
export interface TemplateCustomization {
    element_id: string;
    customization_type: 'content' | 'styling' | 'behavior' | 'visibility';
    changes: Record<string, any>;
    reason?: string;
}

// Переопределение стилей
export interface StylingOverrides {
    css_overrides: Record<string, string>;
    theme_overrides: Record<string, any>;
    color_scheme?: 'light' | 'dark' | 'auto';
    font_family?: string;
    font_size?: string;
}

// Настройки брендинга
export interface BrandingSettings {
    company_name: string;
    logo_url?: string;
    color_primary: string;
    color_secondary: string;
    header_template?: string;
    footer_template?: string;
    watermark?: WatermarkSettings;
}

// Настройки водяного знака
export interface WatermarkSettings {
    enabled: boolean;
    text?: string;
    image_url?: string;
    opacity: number;
    position: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    rotation?: number;
}

// Настройки генерации
export interface GenerationSettings {
    output_format: ReportFormat;
    include_raw_data: boolean;
    include_charts: boolean;
    include_attachments: boolean;
    compression_level: 'none' | 'low' | 'medium' | 'high';

    // Фильтры данных
    data_filters: DataFilter[];
    date_range?: DateRange;

    // Настройки качества
    image_quality: 'low' | 'medium' | 'high' | 'lossless';
    chart_resolution: number;

    // Производительность
    parallel_processing: boolean;
    memory_limit?: number;
    timeout?: number;

    // Кастомизация
    custom_css?: string;
    custom_javascript?: string;

    // Локализация
    language: string;
    timezone: string;
    date_format: string;
    number_format: string;
}

// Фильтр данных
export interface DataFilter {
    field: string;
    operator: 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than' | 'between' | 'in' | 'not_in';
    value: any;
    case_sensitive?: boolean;
}

// Диапазон дат
export interface DateRange {
    start_date: string;
    end_date: string;
    timezone?: string;
}

// Настройки распространения
export interface DistributionSettings {
    auto_distribute: boolean;
    distribution_list: DistributionEntry[];
    notification_settings: NotificationSettings;
    delivery_schedule?: DeliverySchedule;
    access_restrictions: AccessRestriction[];
}

// Запись распространения
export interface DistributionEntry {
    type: 'user' | 'group' | 'email' | 'webhook';
    identifier: string;
    delivery_method: 'email' | 'portal' | 'api' | 'ftp' | 'sftp';
    format_preference: ReportFormat;
    delivery_options?: Record<string, any>;
    notification_preferences?: string[];
}

// Настройки уведомлений
export interface NotificationSettings {
    notify_on_completion: boolean;
    notify_on_failure: boolean;
    notify_on_approval: boolean;
    notification_template?: string;
    custom_message?: string;
}

// Расписание доставки
export interface DeliverySchedule {
    immediate: boolean;
    scheduled_time?: string;
    recurring?: RecurringSchedule;
    conditions?: DeliveryCondition[];
}

// Повторяющееся расписание
export interface RecurringSchedule {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
    interval: number;
    days_of_week?: number[];
    day_of_month?: number;
    end_date?: string;
}

// Условие доставки
export interface DeliveryCondition {
    condition_type: string;
    condition_value: any;
    action: 'deliver' | 'skip' | 'delay';
}

// Ограничение доступа
export interface AccessRestriction {
    restriction_type: 'time_limit' | 'download_limit' | 'ip_restriction' | 'domain_restriction';
    parameters: Record<string, any>;
    enforcement_level: 'advisory' | 'enforced';
}

// Политика хранения
export interface RetentionPolicy {
    retention_period_days: number;
    archive_after_days?: number;
    auto_delete: boolean;
    backup_before_delete: boolean;
    compliance_holds: ComplianceHold[];
    disposal_method: 'secure_delete' | 'anonymize' | 'archive';
}

// Удержание соответствия
export interface ComplianceHold {
    hold_id: string;
    reason: string;
    start_date: string;
    end_date?: string;
    authority: string;
    override_retention: boolean;
}

// Бизнес-контекст
export interface BusinessContext {
    organization_id: string;
    department: string;
    business_unit: string;
    cost_center: string;
    budget_code?: string;

    // Заинтересованные стороны
    stakeholders: Stakeholder[];
    decision_makers: string[];
    technical_contacts: string[];

    // Бизнес-цели
    business_objectives: string[];
    success_metrics: string[];
    performance_indicators: KPI[];

    // Контекст проекта
    project_id?: string;
    project_phase?: string;
    milestone?: string;

    custom_fields?: Record<string, any>;
}

// Заинтересованная сторона
export interface Stakeholder {
    id: string;
    name: string;
    role: string;
    email: string;
    involvement_level: 'informed' | 'consulted' | 'accountable' | 'responsible';
    notification_preferences: string[];
}

// KPI
export interface KPI {
    id: string;
    name: string;
    description: string;
    target_value: number;
    current_value?: number;
    unit: string;
    measurement_frequency: string;
    owner: string;
}

// Workflow утверждения
export interface ApprovalWorkflow {
    workflow_id: string;
    workflow_name: string;
    steps: ApprovalStep[];
    current_step: number;
    status: 'pending' | 'in_progress' | 'approved' | 'rejected' | 'cancelled';

    // Конфигурация
    auto_approval_rules?: AutoApprovalRule[];
    escalation_rules?: EscalationRule[];
    notification_settings?: WorkflowNotificationSettings;

    // Аудит
    started_by: string;
    started_at: string;
    completed_at?: string;
    decision_history: DecisionHistory[];
}

// Шаг утверждения
export interface ApprovalStep {
    step_id: string;
    step_name: string;
    step_order: number;
    approver_type: 'user' | 'group' | 'role' | 'automatic';
    approver_ids: string[];
    approval_type: 'any' | 'all' | 'majority';

    // Статус
    status: 'pending' | 'approved' | 'rejected' | 'skipped';
    decision_date?: string;
    decision_by?: string;
    comments?: string;

    // Конфигурация
    required: boolean;
    timeout_hours?: number;
    timeout_action?: 'auto_approve' | 'auto_reject' | 'escalate';

    // Условия
    conditions?: StepCondition[];
    delegation_rules?: DelegationRule[];
}

// Правило автоутверждения
export interface AutoApprovalRule {
    rule_id: string;
    condition: string;
    action: 'approve' | 'reject' | 'skip';
    reason: string;
}

// Правило эскалации
export interface EscalationRule {
    trigger_condition: string;
    escalation_delay_hours: number;
    escalation_target: string;
    escalation_action: string;
}

// Настройки уведомлений workflow
export interface WorkflowNotificationSettings {
    notify_on_start: boolean;
    notify_on_step_complete: boolean;
    notify_on_approval: boolean;
    notify_on_rejection: boolean;
    notify_on_escalation: boolean;
    notification_channels: string[];
}

// История решений
export interface DecisionHistory {
    step_id: string;
    decision: 'approved' | 'rejected' | 'delegated' | 'escalated';
    decision_by: string;
    decision_date: string;
    comments?: string;
    metadata?: Record<string, any>;
}

// Условие шага
export interface StepCondition {
    condition_type: string;
    condition_value: any;
    required: boolean;
}

// Правило делегирования
export interface DelegationRule {
    delegate_from: string;
    delegate_to: string;
    conditions?: string[];
    start_date?: string;
    end_date?: string;
}

// Запись аудита
export interface AuditEntry {
    id: string;
    timestamp: string;
    user_id: string;
    action: string;
    resource: string;
    details: Record<string, any>;

    // Контекст
    ip_address?: string;
    user_agent?: string;
    session_id?: string;

    // Классификация
    severity: 'low' | 'medium' | 'high' | 'critical';
    category: string;

    // Результат
    result: 'success' | 'failure' | 'partial';
    error_message?: string;

    // Соответствие
    compliance_event: boolean;
    retention_required: boolean;
}

// Метрики отчета
export interface ReportMetrics {
    // Производительность генерации
    generation_time_seconds?: number;
    data_processing_time?: number;
    rendering_time?: number;

    // Размеры и объемы
    file_size_bytes?: number;
    data_volume_mb?: number;
    section_count?: number;
    page_count?: number;

    // Качество
    data_completeness_percentage?: number;
    accuracy_score?: number;
    validation_errors?: number;
    quality_warnings?: number;

    // Использование
    view_count?: number;
    download_count?: number;
    share_count?: number;
    print_count?: number;

    // Взаимодействие
    average_view_time?: number;
    bounce_rate?: number;
    engagement_score?: number;

    // Бизнес-метрики
    business_impact_score?: number;
    roi_calculation?: number;
    cost_to_generate?: number;
    value_delivered?: number;
}

// Обратная связь по отчету
export interface ReportFeedback {
    id: string;
    user_id: string;
    rating: number;
    comment?: string;
    feedback_type: 'quality' | 'usefulness' | 'accuracy' | 'completeness' | 'format';
    specific_sections?: string[];
    suggestions?: string[];
    created_at: string;
    anonymous: boolean;
}

// Ошибка генерации
export interface GenerationError {
    error_id: string;
    error_type: 'data_error' | 'template_error' | 'system_error' | 'validation_error';
    error_code?: string;
    error_message: string;
    error_details?: Record<string, any>;

    // Контекст
    section_id?: string;
    data_source?: string;
    timestamp: string;

    // Исправление
    resolution_status: 'open' | 'resolved' | 'ignored';
    resolution_action?: string;
    resolved_by?: string;
    resolved_at?: string;
}

// Шаблон отчета
export interface ReportTemplate {
    id: string;
    name: string;
    description: string;
    version: string;
    type: ReportType;

    // Конфигурация
    sections: ReportTemplateSection[];
    variables: TemplateVariable[];
    styling: TemplateStyling;
    metadata: TemplateMetadata;

    // Поведение
    generation_settings: GenerationSettings;
    validation_rules: ValidationRule[];
    business_rules: BusinessRule[];

    // Управление
    status: 'active' | 'inactive' | 'deprecated' | 'draft';
    created_by: string;
    created_at: string;
    updated_at?: string;

    // Использование
    usage_count: number;
    success_rate: number;
    average_generation_time: number;

    // Права доступа
    access_controls: AccessControl[];
    allowed_roles: string[];

    tags: string[];
    custom_fields?: Record<string, any>;
}

// Секция шаблона отчета
export interface ReportTemplateSection {
    id: string;
    name: string;
    type: string;
    order: number;
    required: boolean;

    // Конфигурация
    template_content: string;
    data_binding: DataBinding[];
    conditional_logic: ConditionalLogic[];

    // Настройки
    formatting: SectionFormatting;
    validation: SectionValidation;

    custom_fields?: Record<string, any>;
}

// Переменная шаблона
export interface TemplateVariable {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';
    description: string;
    default_value?: any;
    required: boolean;
    validation_pattern?: string;
    possible_values?: any[];
}

// Стилизация шаблона
export interface TemplateStyling {
    css_framework: string;
    theme: string;
    color_scheme: Record<string, string>;
    typography: TypographySettings;
    layout: LayoutSettings;
    responsive: boolean;
}

// Настройки типографики
export interface TypographySettings {
    font_family: string;
    font_sizes: Record<string, string>;
    line_heights: Record<string, number>;
    font_weights: Record<string, number>;
}

// Настройки макета
export interface LayoutSettings {
    page_size: string;
    orientation: 'portrait' | 'landscape';
    margins: MarginSettings;
    header_footer: HeaderFooterSettings;
}

// Настройки полей
export interface MarginSettings {
    top: string;
    right: string;
    bottom: string;
    left: string;
}

// Настройки верхнего/нижнего колонтитула
export interface HeaderFooterSettings {
    header_enabled: boolean;
    footer_enabled: boolean;
    header_content?: string;
    footer_content?: string;
    page_numbers: boolean;
    date_stamp: boolean;
}

// Метаданные шаблона
export interface TemplateMetadata {
    category: string;
    industry: string[];
    compliance_frameworks: string[];
    target_audience: string[];
    complexity_level: 'basic' | 'intermediate' | 'advanced' | 'expert';
    estimated_generation_time: number;
    data_requirements: DataRequirement[];
}

// Требование данных
export interface DataRequirement {
    data_type: string;
    required: boolean;
    description: string;
    source: string;
    format: string;
}

// Привязка данных
export interface DataBinding {
    source_field: string;
    target_field: string;
    transformation?: string;
    validation?: string;
    fallback_value?: any;
}

// Условная логика
export interface ConditionalLogic {
    condition: string;
    action: 'show' | 'hide' | 'modify' | 'replace';
    parameters?: Record<string, any>;
}

// Валидация секции
export interface SectionValidation {
    required_fields: string[];
    validation_rules: ValidationRule[];
    quality_checks: QualityCheck[];
    business_rules: BusinessRule[];
}

// Бизнес-правило
export interface BusinessRule {
    rule_id: string;
    rule_name: string;
    condition: string;
    action: string;
    parameters?: Record<string, any>;
    priority: number;
    enabled: boolean;
}

// Фильтры отчетов
export interface ReportFilters {
    // Основные фильтры
    types?: ReportType[];
    statuses?: ReportStatus[];
    priorities?: ReportPriority[];
    formats?: ReportFormat[];

    // Временные фильтры
    created_after?: string;
    created_before?: string;
    updated_after?: string;
    updated_before?: string;

    // Фильтры пользователей
    created_by?: string[];
    assigned_to?: string[];

    // Бизнес-фильтры
    tenant_id?: string;
    department?: string[];
    business_unit?: string[];

    // Контентные фильтры
    tags?: string[];
    scan_ids?: string[];
    template_ids?: string[];

    // Текстовый поиск
    search_query?: string;
    search_fields?: string[];

    // Фильтры соответствия
    compliance_frameworks?: string[];
    confidentiality_levels?: ConfidentialityLevel[];

    // Фильтры качества
    min_quality_score?: number;
    has_errors?: boolean;

    // Пользовательские фильтры
    custom_filters?: Record<string, any>;
}

// Настройки сортировки
export interface SortSettings {
    field: string;
    direction: 'asc' | 'desc';
    secondary_sort?: {
        field: string;
        direction: 'asc' | 'desc';
    };
}

// Настройки пагинации
export interface PaginationSettings {
    page: number;
    page_size: number;
    max_page_size: number;
}

// Настройки экспорта
export interface ExportSettings {
    format: 'json' | 'csv' | 'excel' | 'pdf';
    include_metadata: boolean;
    include_attachments: boolean;
    compression: 'none' | 'zip' | 'gzip';
    password_protected?: boolean;
    custom_fields?: string[];
}

// Статистика отчетов
export interface ReportsStatistics {
    // Общие счетчики
    total_reports: number;
    reports_by_status: Record<ReportStatus, number>;
    reports_by_type: Record<ReportType, number>;
    reports_by_format: Record<ReportFormat, number>;

    // Временная статистика
    reports_created_today: number;
    reports_created_this_week: number;
    reports_created_this_month: number;

    // Статистика генерации
    average_generation_time: number;
    successful_generations: number;
    failed_generations: number;
    generation_success_rate: number;

    // Статистика использования
    total_downloads: number;
    total_views: number;
    most_popular_templates: Array<{ template_id: string; usage_count: number }>;
    most_active_users: Array<{ user_id: string; report_count: number }>;

    // Статистика качества
    average_quality_score: number;
    reports_with_errors: number;
    average_feedback_rating: number;

    // Бизнес-статистика
    reports_by_department: Record<string, number>;
    compliance_report_coverage: Record<string, number>;
    cost_savings_achieved: number;

    // Тренды
    trends: TrendData[];
}

// ===== ОСНОВНОЕ ХРАНИЛИЩЕ ОТЧЕТОВ =====

export const useReportsStore = defineStore('reports', () => {
    // ===== СОСТОЯНИЕ =====

    // Отчеты
    const reports = ref<Map<string, Report>>(new Map());
    const archivedReports = ref<Map<string, Report>>(new Map());

    // Шаблоны
    const templates = ref<Map<string, ReportTemplate>>(new Map());

    // UI состояние
    const selectedReportId = ref<string | null>(null);
    const isLoading = ref(false);
    const isGenerating = ref(false);
    const generationProgress = ref(0);

    // Фильтры и поиск
    const filters = ref<ReportFilters>({});
    const sortSettings = ref<SortSettings>({ field: 'created_at', direction: 'desc' });
    const paginationSettings = ref<PaginationSettings>({ page: 1, page_size: 20, max_page_size: 100 });
    const searchQuery = ref('');

    // Статистика
    const statistics = ref<ReportsStatistics>({
        total_reports: 0,
        reports_by_status: {} as Record<ReportStatus, number>,
        reports_by_type: {} as Record<ReportType, number>,
        reports_by_format: {} as Record<ReportFormat, number>,
        reports_created_today: 0,
        reports_created_this_week: 0,
        reports_created_this_month: 0,
        average_generation_time: 0,
        successful_generations: 0,
        failed_generations: 0,
        generation_success_rate: 0,
        total_downloads: 0,
        total_views: 0,
        most_popular_templates: [],
        most_active_users: [],
        average_quality_score: 0,
        reports_with_errors: 0,
        average_feedback_rating: 0,
        reports_by_department: {},
        compliance_report_coverage: {},
        cost_savings_achieved: 0,
        trends: []
    });

    // Кэш и производительность
    const cache = ref<Map<string, any>>(new Map());
    const lastFetchTime = ref<string | null>(null);
    const cacheDuration = ref(300000); // 5 минут

    // Настройки
    const userPreferences = ref({
        defaultFormat: 'html' as ReportFormat,
        autoRefresh: true,
        refreshInterval: 30000,
        compactView: false,
        showPreview: true,
        defaultPageSize: 20
    });

    // ===== COMPUTED СВОЙСТВА =====

    // Отфильтрованные отчеты
    const filteredReports = computed(() => {
        let result = Array.from(reports.value.values());

        // Применяем фильтры
        if (filters.value.types?.length) {
            result = result.filter(r => filters.value.types!.includes(r.type));
        }

        if (filters.value.statuses?.length) {
            result = result.filter(r => filters.value.statuses!.includes(r.status));
        }

        if (filters.value.priorities?.length) {
            result = result.filter(r => filters.value.priorities!.includes(r.priority));
        }

        if (filters.value.formats?.length) {
            result = result.filter(r => filters.value.formats!.includes(r.format));
        }

        if (filters.value.created_after) {
            const afterDate = new Date(filters.value.created_after);
            result = result.filter(r => new Date(r.created_at) >= afterDate);
        }

        if (filters.value.created_before) {
            const beforeDate = new Date(filters.value.created_before);
            result = result.filter(r => new Date(r.created_at) <= beforeDate);
        }

        if (filters.value.created_by?.length) {
            result = result.filter(r => filters.value.created_by!.includes(r.created_by));
        }

        if (filters.value.assigned_to?.length) {
            result = result.filter(r => r.assigned_to && filters.value.assigned_to!.includes(r.assigned_to));
        }

        if (filters.value.tenant_id) {
            result = result.filter(r => r.tenant_id === filters.value.tenant_id);
        }

        if (filters.value.department?.length) {
            result = result.filter(r =>
                r.business_context?.department &&
                filters.value.department!.includes(r.business_context.department)
            );
        }

        if (filters.value.tags?.length) {
            result = result.filter(r =>
                filters.value.tags!.some(tag => r.tags.includes(tag))
            );
        }

        if (filters.value.scan_ids?.length) {
            result = result.filter(r =>
                r.scan_id && filters.value.scan_ids!.includes(r.scan_id)
            );
        }

        if (filters.value.template_ids?.length) {
            result = result.filter(r =>
                r.template_id && filters.value.template_ids!.includes(r.template_id)
            );
        }

        if (filters.value.compliance_frameworks?.length) {
            result = result.filter(r =>
                filters.value.compliance_frameworks!.some(framework =>
                    r.compliance_frameworks.includes(framework)
                )
            );
        }

        if (filters.value.confidentiality_levels?.length) {
            result = result.filter(r =>
                filters.value.confidentiality_levels!.includes(r.confidentiality_level)
            );
        }

        if (filters.value.min_quality_score !== undefined) {
            result = result.filter(r =>
                r.quality_score !== undefined && r.quality_score >= filters.value.min_quality_score!
            );
        }

        if (filters.value.has_errors !== undefined) {
            result = result.filter(r => {
                const hasErrors = r.generation_errors && r.generation_errors.length > 0;
                return hasErrors === filters.value.has_errors;
            });
        }

        // Текстовый поиск
        if (searchQuery.value.trim()) {
            const query = searchQuery.value.toLowerCase().trim();
            const searchFields = filters.value.search_fields || ['title', 'description', 'tags'];

            result = result.filter(report => {
                return searchFields.some(field => {
                    switch (field) {
                        case 'title':
                            return report.title.toLowerCase().includes(query);
                        case 'description':
                            return report.description?.toLowerCase().includes(query);
                        case 'tags':
                            return report.tags.some(tag => tag.toLowerCase().includes(query));
                        case 'content':
                            return JSON.stringify(report.data).toLowerCase().includes(query);
                        default:
                            return false;
                    }
                });
            });
        }

        // Сортировка
        result.sort((a, b) => {
            const { field, direction } = sortSettings.value;
            let aValue: any = getNestedValue(a, field);
            let bValue: any = getNestedValue(b, field);

            // Обработка дат
            if (field.includes('_at') || field.includes('_date')) {
                aValue = new Date(aValue || 0).getTime();
                bValue = new Date(bValue || 0).getTime();
            }

            // Обработка чисел
            if (typeof aValue === 'string' && !isNaN(Number(aValue))) {
                aValue = Number(aValue);
                bValue = Number(bValue);
            }

            let comparison = 0;
            if (aValue < bValue) comparison = -1;
            if (aValue > bValue) comparison = 1;

            return direction === 'desc' ? -comparison : comparison;
        });

        return result;
    });

    // Пагинированные отчеты
    const paginatedReports = computed(() => {
        const { page, page_size } = paginationSettings.value;
        const startIndex = (page - 1) * page_size;
        const endIndex = startIndex + page_size;

        return filteredReports.value.slice(startIndex, endIndex);
    });

    // Информация о пагинации
    const paginationInfo = computed(() => {
        const { page, page_size } = paginationSettings.value;
        const totalItems = filteredReports.value.length;
        const totalPages = Math.ceil(totalItems / page_size);

        return {
            currentPage: page,
            pageSize: page_size,
            totalItems,
            totalPages,
            hasNext: page < totalPages,
            hasPrevious: page > 1,
            startIndex: (page - 1) * page_size,
            endIndex: Math.min(page * page_size, totalItems)
        };
    });

    // Отчеты по статусам
    const reportsByStatus = computed(() => {
        const result: Record<ReportStatus, Report[]> = {
            generating: [],
            completed: [],
            failed: [],
            archived: [],
            scheduled: [],
            pending_approval: [],
            approved: [],
            rejected: [],
            published: [],
            expired: []
        };

        filteredReports.value.forEach(report => {
            if (result[report.status]) {
                result[report.status].push(report);
            }
        });

        return result;
    });

    // Отчеты по типам
    const reportsByType = computed(() => {
        const result: Record<ReportType, Report[]> = {
            scan_report: [],
            vulnerability_report: [],
            compliance_report: [],
            executive_summary: [],
            technical_detail: [],
            risk_assessment: [],
            trend_analysis: [],
            comparison_report: [],
            audit_report: [],
            penetration_test: [],
            asset_inventory: [],
            threat_intelligence: []
        };

        filteredReports.value.forEach(report => {
            if (result[report.type]) {
                result[report.type].push(report);
            }
        });

        return result;
    });

    // Недавние отчеты
    const recentReports = computed(() => {
        const now = new Date();
        const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        return filteredReports.value
            .filter(report => new Date(report.created_at) >= dayAgo)
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 10);
    });

    // Активные генерации
    const activeGenerations = computed(() => {
        return filteredReports.value.filter(report =>
            report.status === 'generating' &&
            report.generation_progress !== undefined &&
            report.generation_progress < 100
        );
    });

    // Отчеты требующие внимания
    const reportsNeedingAttention = computed(() => {
        return filteredReports.value.filter(report =>
            report.status === 'failed' ||
            report.status === 'pending_approval' ||
            (report.generation_errors && report.generation_errors.length > 0) ||
            (report.quality_score !== undefined && report.quality_score < 70)
        );
    });

    // Выбранный отчет
    const selectedReport = computed(() => {
        return selectedReportId.value ? reports.value.get(selectedReportId.value) : null;
    });

    // Доступные шаблоны
    const availableTemplates = computed(() => {
        return Array.from(templates.value.values())
            .filter(template => template.status === 'active')
            .sort((a, b) => a.name.localeCompare(b.name));
    });

    // ===== ДЕЙСТВИЯ =====

    /**
     * Загрузка отчетов
     */
    async function fetchReports(force = false): Promise<void> {
        if (isLoading.value && !force) return;

        // Проверяем кэш
        if (!force && lastFetchTime.value) {
            const timeSinceLastFetch = Date.now() - new Date(lastFetchTime.value).getTime();
            if (timeSinceLastFetch < cacheDuration.value) {
                return;
            }
        }

        try {
            isLoading.value = true;

            // Формируем параметры запроса
            const params = new URLSearchParams();

            // Добавляем фильтры
            if (filters.value.types?.length) {
                filters.value.types.forEach(type => params.append('types[]', type));
            }

            if (filters.value.statuses?.length) {
                filters.value.statuses.forEach(status => params.append('statuses[]', status));
            }

            if (filters.value.tenant_id) {
                params.append('tenant_id', filters.value.tenant_id);
            }

            // Добавляем пагинацию
            params.append('page', paginationSettings.value.page.toString());
            params.append('page_size', paginationSettings.value.page_size.toString());

            // Добавляем сортировку
            params.append('sort_by', sortSettings.value.field);
            params.append('sort_direction', sortSettings.value.direction);

            // Поиск
            if (searchQuery.value.trim()) {
                params.append('search', searchQuery.value.trim());
            }

            const response = await fetch(`/api/reports?${params.toString()}`);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            // Обновляем отчеты
            reports.value.clear();
            data.reports.forEach((report: Report) => {
                reports.value.set(report.id, report);
            });

            // Обновляем статистику
            if (data.statistics) {
                statistics.value = data.statistics;
            }

            lastFetchTime.value = new Date().toISOString();

        } catch (error) {
            console.error('Ошибка загрузки отчетов:', error);
            throw error;
        } finally {
            isLoading.value = false;
        }
    }

    /**
     * Загрузка конкретного отчета
     */
    async function fetchReport(reportId: string, force = false): Promise<Report> {
        if (!reportId) {
            throw new Error('Report ID is required');
        }

        // Проверяем кэш
        const cached = reports.value.get(reportId);
        if (!force && cached) {
            return cached;
        }

        try {
            const response = await fetch(`/api/reports/${encodeURIComponent(reportId)}`);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const report: Report = await response.json();

            // Обновляем в хранилище
            reports.value.set(report.id, report);

            return report;

        } catch (error) {
            console.error(`Ошибка загрузки отчета ${reportId}:`, error);
            throw error;
        }
    }

    /**
     * Создание отчета
     */
    async function createReport(reportData: Partial<Report>): Promise<string> {
        try {
            isGenerating.value = true;
            generationProgress.value = 0;

            const response = await fetch('/api/reports', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(reportData)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            const reportId = result.report_id || result.id;

            // Создаем запись отчета с начальным статусом
            const newReport: Report = {
                id: reportId,
                title: reportData.title || 'Новый отчет',
                type: reportData.type || 'scan_report',
                status: 'generating',
                priority: reportData.priority || 'normal',
                created_by: reportData.created_by || 'current_user',
                created_at: new Date().toISOString(),
                format: reportData.format || 'html',
                confidentiality_level: reportData.confidentiality_level || 'internal',
                access_controls: reportData.access_controls || [],
                compliance_frameworks: reportData.compliance_frameworks || [],
                audit_trail: [],
                tags: reportData.tags || [],
                data: reportData.data || {},
                summary: {
                    executive_summary: '',
                    key_findings: [],
                    recommendations: [],
                    risk_level: 'medium',
                    key_metrics: [],
                    trend_indicators: [],
                    immediate_actions: [],
                    long_term_actions: []
                },
                sections: reportData.sections || [],
                attachments: [],
                generation_settings: reportData.generation_settings || {
                    output_format: reportData.format || 'html',
                    include_raw_data: false,
                    include_charts: true,
                    include_attachments: true,
                    compression_level: 'medium',
                    data_filters: [],
                    image_quality: 'medium',
                    chart_resolution: 1200,
                    parallel_processing: true,
                    language: 'ru',
                    timezone: 'Europe/Moscow',
                    date_format: 'DD.MM.YYYY',
                    number_format: 'ru-RU'
                },
                metrics: {
                    generation_time_seconds: 0,
                    data_processing_time: 0,
                    rendering_time: 0,
                    file_size_bytes: 0,
                    data_volume_mb: 0,
                    section_count: 0,
                    page_count: 0,
                    data_completeness_percentage: 0,
                    accuracy_score: 0,
                    validation_errors: 0,
                    quality_warnings: 0,
                    view_count: 0,
                    download_count: 0,
                    share_count: 0,
                    print_count: 0,
                    average_view_time: 0,
                    bounce_rate: 0,
                    engagement_score: 0,
                    business_impact_score: 0,
                    roi_calculation: 0,
                    cost_to_generate: 0,
                    value_delivered: 0
                },
                generation_progress: 0,
                generation_phase: 'Инициализация...'
            };

            reports.value.set(reportId, newReport);

            // Начинаем отслеживание прогресса
            startProgressTracking(reportId);

            return reportId;

        } catch (error) {
            console.error('Ошибка создания отчета:', error);
            isGenerating.value = false;
            throw error;
        }
    }

    /**
     * Обновление отчета
     */
    async function updateReport(reportId: string, updates: Partial<Report>): Promise<void> {
        if (!reportId) {
            throw new Error('Report ID is required');
        }

        try {
            const response = await fetch(`/api/reports/${encodeURIComponent(reportId)}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updates)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const updatedReport: Report = await response.json();

            // Обновляем в хранилище
            reports.value.set(reportId, updatedReport);

        } catch (error) {
            console.error(`Ошибка обновления отчета ${reportId}:`, error);
            throw error;
        }
    }

    /**
     * Удаление отчета
     */
    async function deleteReport(reportId: string, permanent = false): Promise<void> {
        if (!reportId) {
            throw new Error('Report ID is required');
        }

        try {
            const url = `/api/reports/${encodeURIComponent(reportId)}${permanent ? '?permanent=true' : ''}`;
            const response = await fetch(url, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            if (permanent) {
                // Полное удаление
                reports.value.delete(reportId);
                archivedReports.value.delete(reportId);
            } else {
                // Перемещение в архив
                const report = reports.value.get(reportId);
                if (report) {
                    report.status = 'archived';
                    archivedReports.value.set(reportId, report);
                    reports.value.delete(reportId);
                }
            }

            // Если удаляемый отчет был выбран, сбрасываем выбор
            if (selectedReportId.value === reportId) {
                selectedReportId.value = null;
            }

        } catch (error) {
            console.error(`Ошибка удаления отчета ${reportId}:`, error);
            throw error;
        }
    }

    /**
     * Генерация отчета из шаблона
     */
    async function generateFromTemplate(
        templateId: string,
        parameters: Record<string, any> = {},
        options: Partial<GenerationSettings> = {}
    ): Promise<string> {
        if (!templateId) {
            throw new Error('Template ID is required');
        }

        try {
            const template = templates.value.get(templateId);
            if (!template) {
                // Загружаем шаблон если его нет в кэше
                await fetchTemplate(templateId);
            }

            const reportData: Partial<Report> = {
                title: parameters.title || template?.name || 'Отчет из шаблона',
                type: template?.type || 'scan_report',
                template_id: templateId,
                generation_settings: {
                    ...template?.generation_settings,
                    ...options
                },
                template_settings: {
                    template_id: templateId,
                    version: template?.version || '1.0',
                    customizations: [],
                    variable_overrides: parameters,
                    section_overrides: {},
                    styling_overrides: {
                        css_overrides: {},
                        theme_overrides: {}
                    },
                    branding: options.branding || template?.metadata.category === 'executive' ? {
                        company_name: 'IP Roast Enterprise',
                        color_primary: '#2563eb',
                        color_secondary: '#6b7280'
                    } : undefined
                },
                ...parameters
            };

            return await createReport(reportData);

        } catch (error) {
            console.error(`Ошибка генерации отчета из шаблона ${templateId}:`, error);
            throw error;
        }
    }

    /**
     * Экспорт отчета
     */
    async function exportReport(
        reportId: string,
        settings: ExportSettings
    ): Promise<Blob> {
        if (!reportId) {
            throw new Error('Report ID is required');
        }

        try {
            const params = new URLSearchParams();
            params.append('format', settings.format);
            params.append('include_metadata', settings.include_metadata.toString());
            params.append('include_attachments', settings.include_attachments.toString());
            params.append('compression', settings.compression);

            if (settings.custom_fields?.length) {
                settings.custom_fields.forEach(field =>
                    params.append('custom_fields[]', field)
                );
            }

            const response = await fetch(
                `/api/reports/${encodeURIComponent(reportId)}/export?${params.toString()}`,
                {
                    method: 'POST',
                    headers: settings.password_protected ? {
                        'X-Password-Protection': 'true'
                    } : {}
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const blob = await response.blob();

            // Обновляем счетчик скачиваний
            const report = reports.value.get(reportId);
            if (report) {
                report.download_count = (report.download_count || 0) + 1;
                report.metrics.download_count = report.download_count;
            }

            return blob;

        } catch (error) {
            console.error(`Ошибка экспорта отчета ${reportId}:`, error);
            throw error;
        }
    }

    /**
     * Загрузка шаблонов
     */
    async function fetchTemplates(force = false): Promise<void> {
        if (!force && templates.value.size > 0) return;

        try {
            const response = await fetch('/api/reports/templates');

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            templates.value.clear();
            data.templates.forEach((template: ReportTemplate) => {
                templates.value.set(template.id, template);
            });

        } catch (error) {
            console.error('Ошибка загрузки шаблонов:', error);
            throw error;
        }
    }

    /**
     * Загрузка конкретного шаблона
     */
    async function fetchTemplate(templateId: string): Promise<ReportTemplate> {
        if (!templateId) {
            throw new Error('Template ID is required');
        }

        try {
            const response = await fetch(`/api/reports/templates/${encodeURIComponent(templateId)}`);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const template: ReportTemplate = await response.json();

            templates.value.set(template.id, template);

            return template;

        } catch (error) {
            console.error(`Ошибка загрузки шаблона ${templateId}:`, error);
            throw error;
        }
    }

    /**
     * Отслеживание прогресса генерации
     */
    function startProgressTracking(reportId: string): void {
        const trackProgress = async () => {
            try {
                const report = await fetchReport(reportId, true);

                if (report.status === 'generating') {
                    generationProgress.value = report.generation_progress || 0;

                    // Продолжаем отслеживание
                    setTimeout(trackProgress, 2000);
                } else {
                    // Генерация завершена
                    isGenerating.value = false;
                    generationProgress.value = 100;

                    if (report.status === 'completed') {
                        // Успешное завершение
                        console.log(`Отчет ${reportId} успешно сгенерирован`);
                    } else if (report.status === 'failed') {
                        // Ошибка генерации
                        console.error(`Ошибка генерации отчета ${reportId}:`, report.generation_errors);
                    }
                }
            } catch (error) {
                console.error(`Ошибка отслеживания прогресса для отчета ${reportId}:`, error);
                isGenerating.value = false;
            }
        };

        trackProgress();
    }

    /**
     * Установка фильтров
     */
    function setFilters(newFilters: Partial<ReportFilters>): void {
        filters.value = { ...filters.value, ...newFilters };
        paginationSettings.value.page = 1; // Сбрасываем на первую страницу
    }

    /**
     * Очистка фильтров
     */
    function clearFilters(): void {
        filters.value = {};
        searchQuery.value = '';
        paginationSettings.value.page = 1;
    }

    /**
     * Установка сортировки
     */
    function setSorting(field: string, direction?: 'asc' | 'desc'): void {
        if (!direction) {
            // Переключаем направление если поле то же
            direction = sortSettings.value.field === field && sortSettings.value.direction === 'asc'
                ? 'desc'
                : 'asc';
        }

        sortSettings.value = { field, direction };
        paginationSettings.value.page = 1; // Сбрасываем на первую страницу
    }

    /**
     * Установка пагинации
     */
    function setPagination(page: number, pageSize?: number): void {
        if (pageSize) {
            paginationSettings.value.page_size = Math.min(pageSize, paginationSettings.value.max_page_size);
        }
        paginationSettings.value.page = Math.max(1, page);
    }

    /**
     * Выбор отчета
     */
    function selectReport(reportId: string | null): void {
        selectedReportId.value = reportId;
    }

    /**
     * Добавление обратной связи
     */
    async function addFeedback(
        reportId: string,
        feedback: Omit<ReportFeedback, 'id' | 'created_at'>
    ): Promise<void> {
        if (!reportId) {
            throw new Error('Report ID is required');
        }

        try {
            const response = await fetch(`/api/reports/${encodeURIComponent(reportId)}/feedback`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(feedback)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const newFeedback: ReportFeedback = await response.json();

            // Обновляем отчет
            const report = reports.value.get(reportId);
            if (report) {
                if (!report.feedback) {
                    report.feedback = [];
                }
                report.feedback.push(newFeedback);
            }

        } catch (error) {
            console.error(`Ошибка добавления обратной связи для отчета ${reportId}:`, error);
            throw error;
        }
    }

    /**
     * Обновление статистики
     */
    async function updateStatistics(): Promise<void> {
        try {
            const response = await fetch('/api/reports/statistics');

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const stats: ReportsStatistics = await response.json();
            statistics.value = stats;

        } catch (error) {
            console.error('Ошибка обновления статистики:', error);
            throw error;
        }
    }

    /**
     * Очистка кэша
     */
    function clearCache(pattern?: string): void {
        if (pattern) {
            for (const key of cache.value.keys()) {
                if (key.includes(pattern)) {
                    cache.value.delete(key);
                }
            }
        } else {
            cache.value.clear();
        }

        lastFetchTime.value = null;
    }

    /**
     * Сохранение пользовательских настроек
     */
    function saveUserPreferences(): void {
        try {
            localStorage.setItem('ip-roast-reports-preferences', JSON.stringify(userPreferences.value));
        } catch (error) {
            console.error('Ошибка сохранения настроек:', error);
        }
    }

    /**
     * Загрузка пользовательских настроек
     */
    function loadUserPreferences(): void {
        try {
            const saved = localStorage.getItem('ip-roast-reports-preferences');
            if (saved) {
                userPreferences.value = { ...userPreferences.value, ...JSON.parse(saved) };
            }
        } catch (error) {
            console.error('Ошибка загрузки настроек:', error);
        }
    }

    /**
     * Инициализация хранилища
     */
    function initialize(): void {
        loadUserPreferences();

        // Автосохранение настроек
        watch(userPreferences, saveUserPreferences, { deep: true });

        // Автообновление при изменении фильтров
        watch([filters, sortSettings, paginationSettings], () => {
            if (userPreferences.value.autoRefresh) {
                fetchReports();
            }
        }, { deep: true });

        // Автообновление статистики
        if (userPreferences.value.autoRefresh) {
            setInterval(() => {
                updateStatistics();
            }, userPreferences.value.refreshInterval);
        }
    }

    // ===== УТИЛИТАРНЫЕ ФУНКЦИИ =====

    /**
     * Получение вложенного значения из объекта
     */
    function getNestedValue(obj: any, path: string): any {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }

    // Инициализируем при создании
    initialize();

    // ===== ЭКСПОРТ ПУБЛИЧНОГО API =====

    return {
        // Состояние
        reports: readonly(reports),
        archivedReports: readonly(archivedReports),
        templates: readonly(templates),
        selectedReportId: readonly(selectedReportId),
        isLoading: readonly(isLoading),
        isGenerating: readonly(isGenerating),
        generationProgress: readonly(generationProgress),
        filters: readonly(filters),
        sortSettings: readonly(sortSettings),
        paginationSettings: readonly(paginationSettings),
        searchQuery,
        statistics: readonly(statistics),
        userPreferences,

        // Computed
        filteredReports,
        paginatedReports,
        paginationInfo,
        reportsByStatus,
        reportsByType,
        recentReports,
        activeGenerations,
        reportsNeedingAttention,
        selectedReport,
        availableTemplates,

        // Действия
        fetchReports,
        fetchReport,
        createReport,
        updateReport,
        deleteReport,
        generateFromTemplate,
        exportReport,
        fetchTemplates,
        fetchTemplate,
        setFilters,
        clearFilters,
        setSorting,
        setPagination,
        selectReport,
        addFeedback,
        updateStatistics,
        clearCache,
        saveUserPreferences,
        loadUserPreferences,
        initialize
    };
});

export default useReportsStore;
