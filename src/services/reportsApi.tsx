// frontend/src/services/reportsApi.ts

/**
 * IP Roast Enterprise - Reports API Service v3.0 ENTERPRISE
 * Корпоративный API клиент для функций отчетности с расширенными возможностями
 */

import { api } from './api';
import type {
    ApiResponse,
    Report,
} from './api';

// ===== ENTERPRISE ТИПЫ ДАННЫХ ДЛЯ ОТЧЕТНОСТИ =====

// Базовые типы Enterprise отчетов
export interface EnterpriseReport extends Report {
    // Базовые поля из Report
    enterprise_metadata?: EnterpriseReportMetadata;
    business_context?: BusinessContext;
    compliance_mapping?: ComplianceMapping;
    risk_assessment?: RiskAssessment;
    executive_summary?: ExecutiveSummary;
    stakeholder_notifications?: StakeholderNotification[];
    approval_workflow?: ApprovalWorkflow;
    distribution_list?: DistributionList;
    retention_policy?: RetentionPolicy;
    audit_trail?: AuditTrailEntry[];
    data_lineage?: DataLineage;
    quality_metrics?: QualityMetrics;
    sla_compliance?: SLACompliance;
}

// Метаданные Enterprise отчета
export interface EnterpriseReportMetadata {
    report_type: 'security_assessment' | 'compliance_audit' | 'risk_analysis' | 'executive_dashboard' | 'technical_deep_dive' | 'business_impact';
    classification: 'public' | 'internal' | 'confidential' | 'restricted';
    sensitivity_level: 'low' | 'medium' | 'high' | 'critical';
    tenant_id: string;
    business_unit: string;
    department: string;
    cost_center: string;
    project_code?: string;
    regulation_scope: string[];
    data_retention_days: number;
    encryption_required: boolean;
    watermarking_enabled: boolean;
    access_controls: AccessControl[];
    custom_attributes: Record<string, any>;
}

// Контроль доступа
export interface AccessControl {
    type: 'user' | 'group' | 'role' | 'attribute';
    identifier: string;
    permissions: string[];
    conditions?: string[];
    expiry_date?: string;
    source: string;
}

// Бизнес-контекст отчета
export interface BusinessContext {
    organization_id: string;
    business_unit: string;
    department: string;
    owner: string;
    stakeholders: Stakeholder[];
    business_objectives: string[];
    kpis: KPI[];
    budget_allocation?: number;
    criticality: 'low' | 'medium' | 'high' | 'critical';
    business_hours: string;
    escalation_contacts: Contact[];
    related_projects: string[];
    strategic_alignment: StrategicAlignment;
}

// Заинтересованная сторона
export interface Stakeholder {
    id: string;
    name: string;
    role: string;
    email: string;
    notification_preferences: NotificationPreference[];
    access_level: 'read' | 'comment' | 'approve' | 'admin';
    delegation_rules?: string[];
}

// Настройки уведомлений
export interface NotificationPreference {
    event_type: string;
    channel: 'email' | 'slack' | 'teams' | 'webhook' | 'sms';
    frequency: 'immediate' | 'digest' | 'weekly' | 'monthly';
    conditions?: string[];
}

// KPI метрика
export interface KPI {
    id: string;
    name: string;
    description: string;
    target_value: number;
    actual_value?: number;
    unit: string;
    trend: 'improving' | 'stable' | 'declining';
    calculation_method: string;
    data_source: string;
}

// Контакт
export interface Contact {
    name: string;
    email: string;
    phone?: string;
    role: string;
    escalation_level: number;
}

// Стратегическое соответствие
export interface StrategicAlignment {
    strategic_goals: string[];
    business_drivers: string[];
    competitive_factors: string[];
    market_conditions: string[];
    regulatory_environment: string[];
}

// Маппинг соответствия
export interface ComplianceMapping {
    frameworks: ComplianceFramework[];
    regulations: RegulationRequirement[];
    standards: IndustryStandard[];
    internal_policies: InternalPolicy[];
    audit_requirements: AuditRequirement[];
    certification_status: CertificationStatus[];
    gap_analysis: GapAnalysis;
}

// Framework соответствия
export interface ComplianceFramework {
    id: string;
    name: string;
    version: string;
    scope: string[];
    controls: ControlMapping[];
    assessment_date: string;
    next_review: string;
    status: 'compliant' | 'non_compliant' | 'partially_compliant' | 'not_assessed';
    evidence_repository: string;
}

// Маппинг контролей
export interface ControlMapping {
    control_id: string;
    control_name: string;
    requirement: string;
    implementation_status: 'implemented' | 'partially_implemented' | 'not_implemented' | 'not_applicable';
    test_results: TestResult[];
    evidence: Evidence[];
    responsible_party: string;
    remediation_plan?: string;
}

// Результат тестирования
export interface TestResult {
    test_id: string;
    test_name: string;
    test_date: string;
    result: 'pass' | 'fail' | 'warning' | 'not_tested';
    score?: number;
    findings: string[];
    recommendations: string[];
    tester: string;
}

// Доказательство
export interface Evidence {
    id: string;
    type: 'document' | 'screenshot' | 'log' | 'certificate' | 'policy' | 'procedure';
    title: string;
    description: string;
    location: string;
    hash: string;
    timestamp: string;
    collector: string;
}

// Регулятивное требование
export interface RegulationRequirement {
    regulation: string;
    section: string;
    requirement: string;
    applicability: 'mandatory' | 'recommended' | 'optional';
    deadline?: string;
    penalty_risk: 'low' | 'medium' | 'high' | 'critical';
    compliance_status: 'compliant' | 'non_compliant' | 'in_progress';
}

// Отраслевой стандарт
export interface IndustryStandard {
    standard: string;
    version: string;
    adoption_level: 'full' | 'partial' | 'planned' | 'not_adopted';
    benefits: string[];
    implementation_cost: number;
    timeline: string;
}

// Внутренняя политика
export interface InternalPolicy {
    policy_id: string;
    policy_name: string;
    version: string;
    effective_date: string;
    review_date: string;
    compliance_level: number;
    violations: PolicyViolation[];
}

// Нарушение политики
export interface PolicyViolation {
    violation_id: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    detected_date: string;
    remediation_status: 'open' | 'in_progress' | 'resolved' | 'accepted_risk';
    assigned_to: string;
}

// Требование аудита
export interface AuditRequirement {
    audit_type: 'internal' | 'external' | 'regulatory' | 'certification';
    frequency: string;
    scope: string[];
    auditor: string;
    last_audit: string;
    next_audit: string;
    findings: AuditFinding[];
}

// Находка аудита
export interface AuditFinding {
    finding_id: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    category: string;
    description: string;
    recommendation: string;
    status: 'open' | 'in_progress' | 'resolved' | 'accepted';
    target_date: string;
    responsible_party: string;
}

// Статус сертификации
export interface CertificationStatus {
    certification: string;
    status: 'certified' | 'expired' | 'pending' | 'suspended';
    valid_from?: string;
    valid_to?: string;
    issuing_authority: string;
    scope: string[];
}

// Анализ пробелов
export interface GapAnalysis {
    gaps_identified: Gap[];
    prioritization_matrix: PrioritizationMatrix;
    remediation_roadmap: RemediationRoadmap;
    resource_requirements: ResourceRequirement[];
}

// Пробел в соответствии
export interface Gap {
    gap_id: string;
    description: string;
    impact: 'low' | 'medium' | 'high' | 'critical';
    effort: 'low' | 'medium' | 'high';
    timeline: string;
    dependencies: string[];
}

// Матрица приоритизации
export interface PrioritizationMatrix {
    high_impact_low_effort: string[];
    high_impact_high_effort: string[];
    low_impact_low_effort: string[];
    low_impact_high_effort: string[];
}

// Дорожная карта исправления
export interface RemediationRoadmap {
    phases: RemediationPhase[];
    milestones: Milestone[];
    dependencies: Dependency[];
    success_criteria: string[];
}

// Фаза исправления
export interface RemediationPhase {
    phase_id: string;
    name: string;
    description: string;
    start_date: string;
    end_date: string;
    deliverables: string[];
    success_metrics: string[];
}

// Веха
export interface Milestone {
    milestone_id: string;
    name: string;
    date: string;
    dependencies: string[];
    success_criteria: string[];
}

// Зависимость
export interface Dependency {
    dependency_id: string;
    type: 'technical' | 'resource' | 'regulatory' | 'business';
    description: string;
    impact: 'blocking' | 'high' | 'medium' | 'low';
    mitigation: string;
}

// Требование ресурсов
export interface ResourceRequirement {
    resource_type: 'human' | 'technology' | 'financial' | 'external';
    description: string;
    quantity: number;
    duration: string;
    cost: number;
    availability: string;
}

// Оценка рисков
export interface RiskAssessment {
    overall_risk_score: number;
    risk_level: 'low' | 'medium' | 'high' | 'critical';
    risk_categories: RiskCategory[];
    threat_landscape: ThreatLandscape;
    vulnerability_analysis: VulnerabilityAnalysis;
    impact_analysis: ImpactAnalysis;
    likelihood_assessment: LikelihoodAssessment;
    risk_treatment: RiskTreatment;
    residual_risk: ResidualRisk;
}

// Категория рисков
export interface RiskCategory {
    category: string;
    risks: RiskItem[];
    category_score: number;
    trend: 'increasing' | 'stable' | 'decreasing';
}

// Элемент риска
export interface RiskItem {
    risk_id: string;
    title: string;
    description: string;
    likelihood: number;
    impact: number;
    risk_score: number;
    category: string;
    affected_assets: string[];
    threat_sources: string[];
    vulnerabilities: string[];
    existing_controls: string[];
    control_effectiveness: number;
}

// Ландшафт угроз
export interface ThreatLandscape {
    threat_actors: ThreatActor[];
    attack_vectors: AttackVector[];
    threat_trends: ThreatTrend[];
    intelligence_sources: IntelligenceSource[];
}

// Субъект угроз
export interface ThreatActor {
    actor_id: string;
    name: string;
    type: 'nation_state' | 'cybercriminal' | 'hacktivist' | 'insider' | 'terrorist';
    sophistication: 'low' | 'medium' | 'high' | 'expert';
    motivation: string[];
    capabilities: string[];
    targets: string[];
    ttp: string[];
}

// Вектор атаки
export interface AttackVector {
    vector_id: string;
    name: string;
    description: string;
    complexity: 'low' | 'medium' | 'high';
    prevalence: number;
    detection_difficulty: 'easy' | 'medium' | 'hard' | 'very_hard';
    mitigation_strategies: string[];
}

// Тренд угроз
export interface ThreatTrend {
    trend_id: string;
    name: string;
    description: string;
    timeframe: string;
    impact_sectors: string[];
    growth_rate: number;
    indicators: string[];
}

// Источник разведданных
export interface IntelligenceSource {
    source_id: string;
    name: string;
    type: 'commercial' | 'open_source' | 'government' | 'industry' | 'internal';
    reliability: number;
    coverage: string[];
    update_frequency: string;
}

// Анализ уязвимостей
export interface VulnerabilityAnalysis {
    total_vulnerabilities: number;
    by_severity: Record<string, number>;
    by_category: Record<string, number>;
    trending_vulnerabilities: TrendingVulnerability[];
    zero_day_risks: ZeroDayRisk[];
    patch_status: PatchStatus;
    exploit_availability: ExploitAvailability;
}

// Трендовая уязвимость
export interface TrendingVulnerability {
    cve_id: string;
    title: string;
    severity: string;
    cvss_score: number;
    exploitation_trend: 'increasing' | 'stable' | 'decreasing';
    affected_systems: number;
    patch_available: boolean;
    exploit_in_wild: boolean;
}

// Риск нулевого дня
export interface ZeroDayRisk {
    product: string;
    vendor: string;
    risk_score: number;
    indicators: string[];
    mitigation_options: string[];
}

// Статус патчей
export interface PatchStatus {
    total_patches_available: number;
    critical_patches_pending: number;
    patches_applied_30d: number;
    average_patch_time: number;
    patch_compliance_rate: number;
}

// Доступность эксплойтов
export interface ExploitAvailability {
    public_exploits: number;
    commercial_exploits: number;
    weaponized_exploits: number;
    exploit_kits: string[];
}

// Анализ воздействия
export interface ImpactAnalysis {
    financial_impact: FinancialImpact;
    operational_impact: OperationalImpact;
    reputational_impact: ReputationalImpact;
    regulatory_impact: RegulatoryImpact;
    strategic_impact: StrategicImpact;
}

// Финансовое воздействие
export interface FinancialImpact {
    direct_costs: DirectCost[];
    indirect_costs: IndirectCost[];
    opportunity_costs: OpportunityCost[];
    insurance_coverage: InsuranceCoverage;
    total_exposure: number;
    currency: string;
}

// Прямые затраты
export interface DirectCost {
    category: string;
    amount: number;
    probability: number;
    timeframe: string;
    confidence_level: string;
}

// Косвенные затраты
export interface IndirectCost {
    category: string;
    amount: number;
    calculation_method: string;
    assumptions: string[];
}

// Альтернативные затраты
export interface OpportunityCost {
    missed_opportunity: string;
    estimated_value: number;
    timeframe: string;
}

// Страховое покрытие
export interface InsuranceCoverage {
    cyber_liability: number;
    business_interruption: number;
    errors_omissions: number;
    total_coverage: number;
    deductibles: number;
}

// Операционное воздействие
export interface OperationalImpact {
    affected_processes: AffectedProcess[];
    downtime_estimates: DowntimeEstimate[];
    recovery_metrics: RecoveryMetric[];
    business_continuity: BusinessContinuity;
}

// Затронутый процесс
export interface AffectedProcess {
    process_name: string;
    criticality: 'low' | 'medium' | 'high' | 'critical';
    dependencies: string[];
    recovery_priority: number;
    rto: number; // Recovery Time Objective
    rpo: number; // Recovery Point Objective
}

// Оценка простоя
export interface DowntimeEstimate {
    scenario: string;
    duration_hours: number;
    probability: number;
    cost_per_hour: number;
}

// Метрика восстановления
export interface RecoveryMetric {
    metric_name: string;
    target_value: number;
    current_capability: number;
    gap: number;
    improvement_plan: string;
}

// Непрерывность бизнеса
export interface BusinessContinuity {
    plan_exists: boolean;
    last_tested: string;
    test_results: string;
    plan_effectiveness: number;
    improvement_areas: string[];
}

// Репутационное воздействие
export interface ReputationalImpact {
    stakeholder_groups: StakeholderGroup[];
    media_exposure: MediaExposure;
    social_sentiment: SocialSentiment;
    brand_impact: BrandImpact;
}

// Группа заинтересованных сторон
export interface StakeholderGroup {
    group_name: string;
    impact_level: 'low' | 'medium' | 'high' | 'critical';
    communication_strategy: string;
    key_messages: string[];
}

// Медиа освещение
export interface MediaExposure {
    anticipated_coverage: 'local' | 'national' | 'international';
    message_control: 'high' | 'medium' | 'low';
    response_strategy: string;
}

// Социальные настроения
export interface SocialSentiment {
    platforms_monitored: string[];
    sentiment_tracking: boolean;
    response_protocols: string[];
}

// Воздействие на бренд
export interface BrandImpact {
    brand_value_at_risk: number;
    recovery_timeframe: string;
    mitigation_strategies: string[];
}

// Регулятивное воздействие
export interface RegulatoryImpact {
    applicable_regulations: ApplicableRegulation[];
    potential_violations: PotentialViolation[];
    reporting_requirements: ReportingRequirement[];
    penalty_exposure: PenaltyExposure;
}

// Применимое регулирование
export interface ApplicableRegulation {
    regulation: string;
    jurisdiction: string;
    relevance: 'high' | 'medium' | 'low';
    compliance_status: 'compliant' | 'at_risk' | 'non_compliant';
}

// Потенциальное нарушение
export interface PotentialViolation {
    regulation: string;
    violation_type: string;
    likelihood: number;
    severity: 'minor' | 'moderate' | 'major' | 'severe';
}

// Требование отчетности
export interface ReportingRequirement {
    regulation: string;
    notification_timeframe: string;
    reporting_details: string[];
    responsible_party: string;
}

// Штрафное воздействие
export interface PenaltyExposure {
    minimum_penalty: number;
    maximum_penalty: number;
    factors_affecting_penalty: string[];
    mitigation_factors: string[];
}

// Стратегическое воздействие
export interface StrategicImpact {
    strategic_objectives: StrategicObjective[];
    competitive_position: CompetitivePosition;
    market_opportunities: MarketOpportunity[];
    innovation_impact: InnovationImpact;
}

// Стратегическая цель
export interface StrategicObjective {
    objective: string;
    impact_level: 'low' | 'medium' | 'high' | 'critical';
    mitigation_options: string[];
}

// Конкурентная позиция
export interface CompetitivePosition {
    current_position: string;
    at_risk_advantages: string[];
    recovery_strategy: string;
}

// Рыночная возможность
export interface MarketOpportunity {
    opportunity: string;
    value: number;
    timeframe: string;
    requirements: string[];
}

// Воздействие на инновации
export interface InnovationImpact {
    affected_initiatives: string[];
    delayed_projects: string[];
    resource_reallocation: string[];
}

// Оценка вероятности
export interface LikelihoodAssessment {
    threat_frequency: ThreatFrequency[];
    vulnerability_exploitability: VulnerabilityExploitability[];
    historical_incidents: HistoricalIncident[];
    industry_benchmarks: IndustryBenchmark[];
}

// Частота угроз
export interface ThreatFrequency {
    threat_type: string;
    frequency_per_year: number;
    trend: 'increasing' | 'stable' | 'decreasing';
    confidence_level: string;
}

// Эксплуатируемость уязвимости
export interface VulnerabilityExploitability {
    vulnerability_type: string;
    exploitability_score: number;
    attack_complexity: 'low' | 'medium' | 'high';
    required_privileges: string;
}

// Исторический инцидент
export interface HistoricalIncident {
    incident_id: string;
    date: string;
    incident_type: string;
    impact: string;
    lessons_learned: string[];
}

// Отраслевой бенчмарк
export interface IndustryBenchmark {
    industry: string;
    metric: string;
    benchmark_value: number;
    source: string;
    date: string;
}

// Обработка рисков
export interface RiskTreatment {
    risk_appetite: RiskAppetite;
    treatment_strategies: TreatmentStrategy[];
    control_implementations: ControlImplementation[];
    monitoring_plans: MonitoringPlan[];
}

// Аппетит к риску
export interface RiskAppetite {
    overall_appetite: 'low' | 'medium' | 'high';
    by_category: Record<string, string>;
    thresholds: RiskThreshold[];
    review_frequency: string;
}

// Порог риска
export interface RiskThreshold {
    category: string;
    acceptable_level: number;
    tolerance_level: number;
    escalation_level: number;
}

// Стратегия обработки
export interface TreatmentStrategy {
    risk_id: string;
    strategy: 'accept' | 'avoid' | 'mitigate' | 'transfer';
    rationale: string;
    implementation_plan: string;
    timeline: string;
    responsible_party: string;
    budget: number;
}

// Реализация контроля
export interface ControlImplementation {
    control_id: string;
    control_type: 'preventive' | 'detective' | 'corrective' | 'compensating';
    implementation_status: 'planned' | 'in_progress' | 'implemented' | 'verified';
    effectiveness_rating: number;
    cost: number;
    maintenance_requirements: string[];
}

// План мониторинга
export interface MonitoringPlan {
    plan_id: string;
    objectives: string[];
    metrics: MonitoringMetric[];
    frequency: string;
    responsible_party: string;
    reporting_schedule: string;
}

// Метрика мониторинга
export interface MonitoringMetric {
    metric_name: string;
    measurement_method: string;
    target_value: number;
    alert_thresholds: AlertThreshold[];
}

// Порог оповещения
export interface AlertThreshold {
    level: 'info' | 'warning' | 'critical';
    value: number;
    action_required: string;
}

// Остаточный риск
export interface ResidualRisk {
    residual_risk_score: number;
    residual_risk_level: 'low' | 'medium' | 'high' | 'critical';
    unmitigated_risks: UnmitigatedRisk[];
    continuous_monitoring: boolean;
    review_schedule: string;
}

// Немитигированный риск
export interface UnmitigatedRisk {
    risk_id: string;
    reason: string;
    acceptance_rationale: string;
    compensating_controls: string[];
    monitoring_requirements: string[];
}

// Исполнительное резюме
export interface ExecutiveSummary {
    executive_overview: string;
    key_findings: KeyFinding[];
    recommendations: ExecutiveRecommendation[];
    action_items: ActionItem[];
    kpi_dashboard: KPIDashboard;
    trend_analysis: TrendAnalysis;
    comparative_analysis: ComparativeAnalysis;
    investment_recommendations: InvestmentRecommendation[];
}

// Ключевая находка
export interface KeyFinding {
    finding_id: string;
    title: string;
    summary: string;
    impact: 'low' | 'medium' | 'high' | 'critical';
    urgency: 'low' | 'medium' | 'high' | 'immediate';
    category: string;
    evidence: string[];
    business_implication: string;
}

// Рекомендация для руководства
export interface ExecutiveRecommendation {
    recommendation_id: string;
    title: string;
    description: string;
    business_rationale: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    investment_required: number;
    expected_roi: number;
    implementation_timeline: string;
    success_metrics: string[];
    risk_of_inaction: string;
}

// Действие
export interface ActionItem {
    action_id: string;
    title: string;
    description: string;
    responsible_party: string;
    due_date: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    dependencies: string[];
    success_criteria: string[];
    status: 'not_started' | 'in_progress' | 'completed' | 'blocked';
}

// KPI Дашборд
export interface KPIDashboard {
    security_posture_score: number;
    compliance_percentage: number;
    risk_trend: 'improving' | 'stable' | 'degrading';
    incident_frequency: number;
    mttr: number; // Mean Time To Recovery
    cost_of_security: number;
    investment_efficiency: number;
}

// Анализ трендов
export interface TrendAnalysis {
    timeframe: string;
    security_trends: SecurityTrend[];
    compliance_trends: ComplianceTrend[];
    risk_trends: RiskTrend[];
    cost_trends: CostTrend[];
}

// Тренд безопасности
export interface SecurityTrend {
    metric: string;
    current_value: number;
    previous_value: number;
    trend_direction: 'up' | 'down' | 'stable';
    trend_significance: 'significant' | 'moderate' | 'minimal';
    contributing_factors: string[];
}

// Тренд соответствия
export interface ComplianceTrend {
    framework: string;
    current_score: number;
    previous_score: number;
    improvement_rate: number;
    key_improvements: string[];
    remaining_gaps: string[];
}

// Тренд рисков
export interface RiskTrend {
    risk_category: string;
    current_level: number;
    previous_level: number;
    emerging_risks: string[];
    mitigated_risks: string[];
}

// Тренд затрат
export interface CostTrend {
    cost_category: string;
    current_spend: number;
    budget_variance: number;
    efficiency_metrics: EfficiencyMetric[];
    optimization_opportunities: string[];
}

// Метрика эффективности
export interface EfficiencyMetric {
    metric_name: string;
    value: number;
    benchmark: number;
    performance_rating: 'excellent' | 'good' | 'fair' | 'poor';
}

// Сравнительный анализ
export interface ComparativeAnalysis {
    peer_benchmarks: PeerBenchmark[];
    industry_averages: IndustryAverage[];
    best_practices: BestPractice[];
    competitive_insights: CompetitiveInsight[];
}

// Peer бенчмарк
export interface PeerBenchmark {
    metric: string;
    our_value: number;
    peer_average: number;
    peer_best: number;
    our_percentile: number;
    gap_analysis: string;
}

// Отраслевое среднее
export interface IndustryAverage {
    metric: string;
    industry_average: number;
    our_value: number;
    variance: number;
    industry_trend: string;
}

// Лучшая практика
export interface BestPractice {
    practice_id: string;
    title: string;
    description: string;
    implementation_effort: 'low' | 'medium' | 'high';
    expected_benefit: string;
    adoption_timeline: string;
}

// Конкурентные инсайты
export interface CompetitiveInsight {
    insight_type: string;
    description: string;
    strategic_implication: string;
    recommended_action: string;
}

// Рекомендация по инвестициям
export interface InvestmentRecommendation {
    investment_id: string;
    title: string;
    description: string;
    investment_amount: number;
    expected_roi: number;
    payback_period: string;
    risk_reduction_value: number;
    business_enablement_value: number;
    implementation_complexity: 'low' | 'medium' | 'high';
    strategic_alignment: number;
    recommendation_priority: 'low' | 'medium' | 'high' | 'critical';
}

// Уведомление заинтересованной стороны
export interface StakeholderNotification {
    stakeholder_id: string;
    notification_type: 'report_ready' | 'action_required' | 'deadline_approaching' | 'status_update';
    channel: 'email' | 'slack' | 'teams' | 'webhook' | 'dashboard';
    message: string;
    scheduled_time?: string;
    delivery_status: 'pending' | 'sent' | 'delivered' | 'failed';
    response_required: boolean;
    response_deadline?: string;
}

// Workflow утверждения
export interface ApprovalWorkflow {
    workflow_id: string;
    steps: ApprovalStep[];
    current_step: number;
    status: 'pending' | 'in_progress' | 'approved' | 'rejected' | 'cancelled';
    created_by: string;
    created_at: string;
    completed_at?: string;
    approval_criteria: ApprovalCriteria;
}

// Шаг утверждения
export interface ApprovalStep {
    step_id: string;
    step_order: number;
    approver_type: 'user' | 'group' | 'role';
    approver_id: string;
    approval_type: 'single' | 'majority' | 'unanimous';
    status: 'pending' | 'approved' | 'rejected' | 'skipped';
    decision_date?: string;
    comments?: string;
    delegation_rules?: string[];
}

// Критерии утверждения
export interface ApprovalCriteria {
    auto_approval_conditions?: string[];
    escalation_rules: EscalationRule[];
    timeout_actions: TimeoutAction[];
    notification_settings: WorkflowNotificationSetting[];
}

// Правило эскалации
export interface EscalationRule {
    condition: string;
    escalation_target: string;
    escalation_delay: number;
    escalation_type: 'parallel' | 'sequential';
}

// Действие по тайм-ауту
export interface TimeoutAction {
    timeout_duration: number;
    action: 'auto_approve' | 'auto_reject' | 'escalate' | 'notify';
    target?: string;
}

// Настройка уведомлений workflow
export interface WorkflowNotificationSetting {
    event: string;
    recipients: string[];
    channels: string[];
    template: string;
}

// Список распространения
export interface DistributionList {
    internal_recipients: InternalRecipient[];
    external_recipients: ExternalRecipient[];
    distribution_rules: DistributionRule[];
    access_controls: DistributionAccessControl[];
}

// Внутренний получатель
export interface InternalRecipient {
    user_id: string;
    name: string;
    email: string;
    role: string;
    department: string;
    access_level: 'view' | 'comment' | 'edit' | 'admin';
    delivery_preferences: DeliveryPreference[];
}

// Внешний получатель
export interface ExternalRecipient {
    recipient_id: string;
    name: string;
    email: string;
    organization: string;
    relationship: 'vendor' | 'partner' | 'client' | 'regulator' | 'auditor';
    data_sharing_agreement: string;
    access_restrictions: string[];
}

// Правило распространения
export interface DistributionRule {
    rule_id: string;
    condition: string;
    recipients: string[];
    format: string;
    delivery_method: string;
    timing: string;
}

// Контроль доступа распространения
export interface DistributionAccessControl {
    control_type: 'watermark' | 'drm' | 'expiry' | 'view_limit' | 'download_restriction';
    parameters: Record<string, any>;
    enforcement_level: 'advisory' | 'enforced';
}

// Предпочтения доставки
export interface DeliveryPreference {
    format: 'pdf' | 'html' | 'docx' | 'pptx' | 'json';
    delivery_method: 'email' | 'portal' | 'api' | 'print';
    scheduling: 'immediate' | 'scheduled' | 'on_demand';
    quality: 'summary' | 'standard' | 'detailed' | 'comprehensive';
}

// Политика хранения
export interface RetentionPolicy {
    retention_period_days: number;
    archive_after_days: number;
    purge_after_days: number;
    legal_hold_exempt: boolean;
    backup_requirements: BackupRequirement[];
    disposal_method: 'secure_delete' | 'physical_destruction' | 'cryptographic_erasure';
    compliance_requirements: string[];
}

// Требование резервного копирования
export interface BackupRequirement {
    backup_type: 'full' | 'incremental' | 'differential';
    frequency: string;
    retention_period: number;
    storage_location: string;
    encryption_required: boolean;
}

// Запись аудиторского следа
export interface AuditTrailEntry {
    entry_id: string;
    timestamp: string;
    user_id: string;
    action: string;
    resource: string;
    details: Record<string, any>;
    ip_address: string;
    user_agent: string;
    session_id: string;
    result: 'success' | 'failure' | 'partial';
    risk_score?: number;
}

// Родословная данных
export interface DataLineage {
    data_sources: DataSource[];
    transformations: DataTransformation[];
    dependencies: DataDependency[];
    quality_controls: DataQualityControl[];
    refresh_schedule: RefreshSchedule;
}

// Источник данных
export interface DataSource {
    source_id: string;
    name: string;
    type: 'database' | 'api' | 'file' | 'stream' | 'manual';
    location: string;
    last_updated: string;
    data_quality_score: number;
    reliability_rating: number;
    freshness: string;
}

// Трансформация данных
export interface DataTransformation {
    transformation_id: string;
    name: string;
    type: 'aggregation' | 'filtering' | 'enrichment' | 'calculation' | 'validation';
    logic: string;
    input_sources: string[];
    output_targets: string[];
    error_handling: string;
}

// Зависимость данных
export interface DataDependency {
    dependency_id: string;
    source_table: string;
    target_table: string;
    relationship_type: 'one_to_one' | 'one_to_many' | 'many_to_many';
    criticality: 'low' | 'medium' | 'high' | 'critical';
}

// Контроль качества данных
export interface DataQualityControl {
    control_id: string;
    name: string;
    type: 'completeness' | 'accuracy' | 'consistency' | 'timeliness' | 'validity';
    threshold: number;
    current_score: number;
    remediation_action: string;
}

// Расписание обновления
export interface RefreshSchedule {
    schedule_type: 'real_time' | 'batch' | 'on_demand';
    frequency: string;
    dependencies: string[];
    sla_requirements: SLARequirement[];
}

// Требование SLA
export interface SLARequirement {
    metric: string;
    target_value: number;
    measurement_period: string;
    penalty_clause?: string;
}

// Метрики качества
export interface QualityMetrics {
    data_quality_score: number;
    report_accuracy: number;
    timeliness_score: number;
    completeness_percentage: number;
    consistency_rating: number;
    reliability_index: number;
    user_satisfaction: number;
    error_rate: number;
    validation_results: ValidationResult[];
}

// Результат валидации
export interface ValidationResult {
    validation_id: string;
    rule_name: string;
    result: 'pass' | 'fail' | 'warning';
    score: number;
    details: string;
    remediation_suggestion?: string;
}

// Соответствие SLA
export interface SLACompliance {
    sla_id: string;
    service_level_agreements: ServiceLevelAgreement[];
    compliance_percentage: number;
    violations: SLAViolation[];
    performance_trends: PerformanceTrend[];
}

// Соглашение об уровне сервиса
export interface ServiceLevelAgreement {
    sla_id: string;
    metric: string;
    target: number;
    current_performance: number;
    measurement_period: string;
    status: 'met' | 'missed' | 'at_risk';
}

// Нарушение SLA
export interface SLAViolation {
    violation_id: string;
    sla_metric: string;
    violation_date: string;
    severity: 'minor' | 'major' | 'critical';
    impact: string;
    root_cause: string;
    remediation_action: string;
}

// Тренд производительности
export interface PerformanceTrend {
    metric: string;
    trend_direction: 'improving' | 'stable' | 'degrading';
    trend_rate: number;
    contributing_factors: string[];
}

// Настройки автоматизации отчетов
export interface ReportAutomationSettings {
    automation_id: string;
    report_template_id: string;
    schedule: ScheduleConfiguration;
    data_sources: AutomationDataSource[];
    generation_rules: GenerationRule[];
    distribution_automation: DistributionAutomation;
    quality_gates: QualityGate[];
    error_handling: ErrorHandling;
    monitoring: AutomationMonitoring;
}

// Конфигурация расписания
export interface ScheduleConfiguration {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual' | 'event_driven';
    specific_times: string[];
    timezone: string;
    exclusions: ScheduleExclusion[];
    dependencies: ScheduleDependency[];
}

// Исключение из расписания
export interface ScheduleExclusion {
    exclusion_type: 'date' | 'day_of_week' | 'holiday' | 'maintenance_window';
    values: string[];
    recurrence?: string;
}

// Зависимость расписания
export interface ScheduleDependency {
    dependency_type: 'data_availability' | 'system_status' | 'approval' | 'external_trigger';
    condition: string;
    timeout: number;
    fallback_action: string;
}

// Источник данных автоматизации
export interface AutomationDataSource {
    source_id: string;
    connection_string: string;
    query_template: string;
    refresh_strategy: 'full' | 'incremental' | 'delta';
    caching_policy: CachingPolicy;
    error_handling: string;
}

// Политика кэширования
export interface CachingPolicy {
    cache_duration: number;
    invalidation_triggers: string[];
    storage_location: string;
    compression_enabled: boolean;
}

// Правило генерации
export interface GenerationRule {
    rule_id: string;
    condition: string;
    action: 'generate' | 'skip' | 'defer' | 'escalate';
    parameters: Record<string, any>;
    priority: number;
}

// Автоматизация распространения
export interface DistributionAutomation {
    auto_distribute: boolean;
    distribution_rules: AutoDistributionRule[];
    approval_workflows: string[];
    notification_settings: AutoNotificationSetting[];
}

// Правило авто-распространения
export interface AutoDistributionRule {
    rule_id: string;
    condition: string;
    recipients: string[];
    format: string;
    delivery_method: string;
    timing_offset: number;
}

// Настройка авто-уведомлений
export interface AutoNotificationSetting {
    event: string;
    template: string;
    recipients: string[];
    channels: string[];
    conditions?: string[];
}

// Ворота качества
export interface QualityGate {
    gate_id: string;
    name: string;
    criteria: QualityCriteria[];
    action_on_failure: 'block' | 'warn' | 'proceed' | 'escalate';
    notification_settings: string[];
}

// Критерии качества
export interface QualityCriteria {
    criterion_id: string;
    metric: string;
    operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'between';
    threshold: number | number[];
    weight: number;
}

// Обработка ошибок
export interface ErrorHandling {
    retry_policy: RetryPolicy;
    escalation_rules: ErrorEscalationRule[];
    fallback_actions: FallbackAction[];
    notification_settings: ErrorNotificationSetting[];
}

// Политика повторов
export interface RetryPolicy {
    max_attempts: number;
    delay_strategy: 'fixed' | 'exponential' | 'linear';
    base_delay: number;
    max_delay: number;
    retry_conditions: string[];
}

// Правило эскалации ошибок
export interface ErrorEscalationRule {
    error_type: string;
    severity_threshold: 'low' | 'medium' | 'high' | 'critical';
    escalation_target: string;
    escalation_delay: number;
}

// Действие по умолчанию
export interface FallbackAction {
    trigger_condition: string;
    action_type: 'use_cached' | 'use_default' | 'manual_intervention' | 'skip';
    parameters: Record<string, any>;
}

// Настройка уведомлений об ошибках
export interface ErrorNotificationSetting {
    error_level: 'warning' | 'error' | 'critical';
    recipients: string[];
    channels: string[];
    template: string;
    throttling: ThrottlingRule;
}

// Правило ограничения
export interface ThrottlingRule {
    max_notifications: number;
    time_window: number;
    escalation_after: number;
}

// Мониторинг автоматизации
export interface AutomationMonitoring {
    health_checks: HealthCheck[];
    performance_metrics: PerformanceMetric[];
    alerting_rules: AlertingRule[];
    dashboard_config: DashboardConfig;
}

// Проверка здоровья
export interface HealthCheck {
    check_id: string;
    name: string;
    type: 'connectivity' | 'data_quality' | 'performance' | 'security';
    frequency: string;
    timeout: number;
    expected_result: any;
    alert_threshold: number;
}

// Метрика производительности
export interface PerformanceMetric {
    metric_id: string;
    name: string;
    measurement_method: string;
    aggregation_method: 'avg' | 'sum' | 'min' | 'max' | 'count';
    target_value?: number;
    alert_thresholds: number[];
}

// Правило оповещения
export interface AlertingRule {
    rule_id: string;
    condition: string;
    severity: 'info' | 'warning' | 'error' | 'critical';
    notification_channels: string[];
    suppression_rules?: SuppressionRule[];
}

// Правило подавления
export interface SuppressionRule {
    condition: string;
    duration: number;
    reason: string;
}

// Конфигурация дашборда
export interface DashboardConfig {
    dashboard_id: string;
    widgets: DashboardWidget[];
    refresh_interval: number;
    filters: DashboardFilter[];
    permissions: DashboardPermission[];
}

// Виджет дашборда
export interface DashboardWidget {
    widget_id: string;
    type: 'chart' | 'table' | 'metric' | 'alert' | 'status';
    title: string;
    data_source: string;
    configuration: Record<string, any>;
    position: { x: number; y: number; width: number; height: number };
}

// Фильтр дашборда
export interface DashboardFilter {
    filter_id: string;
    name: string;
    type: 'date' | 'select' | 'text' | 'number';
    options?: string[];
    default_value?: any;
}

// Разрешения дашборда
export interface DashboardPermission {
    user_id: string;
    permission: 'view' | 'edit' | 'admin';
    restrictions?: string[];
}

// Шаблон отчета
export interface ReportTemplate {
    template_id: string;
    name: string;
    description: string;
    version: string;
    category: 'security' | 'compliance' | 'risk' | 'operational' | 'financial' | 'executive';
    template_type: 'standard' | 'custom' | 'regulatory' | 'industry_specific';
    target_audience: 'technical' | 'management' | 'executive' | 'regulatory' | 'external';
    sections: ReportSection[];
    styling: ReportStyling;
    data_requirements: DataRequirement[];
    generation_settings: GenerationSettings;
    compliance_mappings: string[];
    approval_required: boolean;
    retention_policy: string;
}

// Секция отчета
export interface ReportSection {
    section_id: string;
    title: string;
    type: 'summary' | 'detailed' | 'charts' | 'tables' | 'appendix';
    order: number;
    required: boolean;
    data_bindings: DataBinding[];
    formatting: SectionFormatting;
    conditional_rendering: ConditionalRendering[];
}

// Привязка данных
export interface DataBinding {
    binding_id: string;
    data_source: string;
    query: string;
    transformations: string[];
    caching_strategy: 'none' | 'session' | 'persistent';
}

// Форматирование секции
export interface SectionFormatting {
    layout: 'single_column' | 'two_column' | 'grid' | 'free_form';
    styling: Record<string, any>;
    pagination: boolean;
    page_break_before?: boolean;
}

// Условный рендеринг
export interface ConditionalRendering {
    condition: string;
    action: 'show' | 'hide' | 'highlight' | 'modify';
    parameters?: Record<string, any>;
}

// Стилизация отчета
export interface ReportStyling {
    theme: string;
    color_scheme: ColorScheme;
    typography: Typography;
    branding: Branding;
    layout_settings: LayoutSettings;
}

// Цветовая схема
export interface ColorScheme {
    primary_color: string;
    secondary_color: string;
    accent_colors: string[];
    status_colors: StatusColors;
}

// Цвета статусов
export interface StatusColors {
    success: string;
    warning: string;
    error: string;
    info: string;
    critical: string;
}

// Типография
export interface Typography {
    font_family: string;
    heading_fonts: string[];
    body_font_size: number;
    line_height: number;
    font_weights: Record<string, number>;
}

// Брендинг
export interface Branding {
    logo_url: string;
    company_name: string;
    color_palette: string[];
    watermark_settings: WatermarkSettings;
}

// Настройки водяного знака
export interface WatermarkSettings {
    enabled: boolean;
    text: string;
    opacity: number;
    position: 'center' | 'corner' | 'header' | 'footer';
    font_size: number;
}

// Настройки макета
export interface LayoutSettings {
    page_size: 'A4' | 'letter' | 'legal' | 'A3';
    orientation: 'portrait' | 'landscape';
    margins: Margins;
    header_footer: HeaderFooter;
}

// Поля
export interface Margins {
    top: number;
    bottom: number;
    left: number;
    right: number;
}

// Верхний и нижний колонтитулы
export interface HeaderFooter {
    header_enabled: boolean;
    footer_enabled: boolean;
    header_content: string;
    footer_content: string;
    page_numbers: boolean;
    date_time: boolean;
}

// Требование данных
export interface DataRequirement {
    requirement_id: string;
    name: string;
    type: 'mandatory' | 'optional' | 'conditional';
    data_source: string;
    query_template: string;
    validation_rules: ValidationRule[];
    refresh_frequency: string;
}

// Правило валидации
export interface ValidationRule {
    rule_id: string;
    field: string;
    validation_type: 'presence' | 'format' | 'range' | 'custom';
    parameters: Record<string, any>;
    error_message: string;
}

// Настройки генерации
export interface GenerationSettings {
    output_formats: string[];
    parallel_processing: boolean;
    resource_limits: ResourceLimits;
    caching_enabled: boolean;
    optimization_level: 'fast' | 'balanced' | 'quality';
}

// Ограничения ресурсов
export interface ResourceLimits {
    max_memory_mb: number;
    max_execution_time_seconds: number;
    max_concurrent_generations: number;
    priority_level: 'low' | 'normal' | 'high' | 'critical';
}

// ===== ОСНОВНОЙ ENTERPRISE КЛАСС REPORTS API =====

class EnterpriseReportsApiService {
    // ===== ОСНОВНЫЕ МЕТОДЫ ОТЧЕТНОСТИ =====

    /**
     * Получение списка Enterprise отчетов
     */
    async getEnterpriseReports(params: {
        tenant_id?: string;
        business_unit?: string;
        report_type?: string;
        classification?: string;
        status?: string;
        date_from?: string;
        date_to?: string;
        tags?: string[];
        compliance_framework?: string;
        risk_level?: string;
        limit?: number;
        offset?: number;
        sort_by?: string;
        sort_order?: 'asc' | 'desc';
    } = {}): Promise<{
        reports: EnterpriseReport[];
        total_count: number;
        summary: {
            by_type: Record<string, number>;
            by_status: Record<string, number>;
            by_classification: Record<string, number>;
            by_risk_level: Record<string, number>;
        };
        metrics: {
            avg_generation_time: number;
            quality_score: number;
            compliance_rate: number;
        };
    }> {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                if (Array.isArray(value)) {
                    value.forEach(v => queryParams.append(key, v));
                } else {
                    queryParams.append(key, String(value));
                }
            }
        });

        const url = `/api/enterprise/reports${queryParams.toString() ? `?${queryParams}` : ''}`;
        return api.get(url);
    }

    /**
     * Получение детальной информации о Enterprise отчете
     */
    async getEnterpriseReportDetails(
        reportId: string,
        options: {
            include_metadata?: boolean;
            include_audit_trail?: boolean;
            include_lineage?: boolean;
            include_quality_metrics?: boolean;
            access_level?: 'summary' | 'standard' | 'detailed' | 'full';
        } = {}
    ): Promise<EnterpriseReport> {
        if (!reportId) {
            throw new Error('Report ID is required');
        }

        const queryParams = new URLSearchParams();
        Object.entries(options).forEach(([key, value]) => {
            if (value !== undefined) {
                queryParams.append(key, String(value));
            }
        });

        const url = `/api/enterprise/reports/${encodeURIComponent(reportId)}${queryParams.toString() ? `?${queryParams}` : ''}`;
        return api.get(url);
    }

    /**
     * Создание Enterprise отчета
     */
    async createEnterpriseReport(
        reportData: {
            template_id: string;
            name: string;
            description?: string;
            business_context: BusinessContext;
            data_sources: string[];
            parameters?: Record<string, any>;
            generation_settings?: Partial<GenerationSettings>;
            distribution_list?: DistributionList;
            approval_workflow?: string;
            schedule?: ScheduleConfiguration;
        }
    ): Promise<ApiResponse<EnterpriseReport>> {
        return api.post('/api/enterprise/reports', reportData, { timeout: 120000 });
    }

    /**
     * Обновление Enterprise отчета
     */
    async updateEnterpriseReport(
        reportId: string,
        updates: Partial<EnterpriseReport>
    ): Promise<EnterpriseReport> {
        if (!reportId) {
            throw new Error('Report ID is required');
        }

        return api.put(`/api/enterprise/reports/${encodeURIComponent(reportId)}`, updates);
    }

    /**
     * Удаление Enterprise отчета
     */
    async deleteEnterpriseReport(
        reportId: string,
        options: {
            force?: boolean;
            retain_audit_trail?: boolean;
            notify_stakeholders?: boolean;
        } = {}
    ): Promise<ApiResponse<{ message: string }>> {
        if (!reportId) {
            throw new Error('Report ID is required');
        }

        return api.delete(`/api/enterprise/reports/${encodeURIComponent(reportId)}`, {
            body: JSON.stringify(options),
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    // ===== ГЕНЕРАЦИЯ ОТЧЕТОВ =====

    /**
     * Запуск генерации Enterprise отчета
     */
    async generateEnterpriseReport(
        templateId: string,
        parameters: {
            report_name: string;
            data_filters?: Record<string, any>;
            output_formats?: string[];
            priority?: 'low' | 'normal' | 'high' | 'urgent';
            deadline?: string;
            custom_sections?: string[];
            stakeholder_context?: BusinessContext;
        }
    ): Promise<ApiResponse<{ generation_id: string; estimated_completion: string }>> {
        return api.post('/api/enterprise/reports/generate', {
            template_id: templateId,
            ...parameters
        }, { timeout: 300000 });
    }

    /**
     * Получение статуса генерации отчета
     */
    async getReportGenerationStatus(generationId: string): Promise<{
        generation_id: string;
        status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
        progress: number;
        current_phase: string;
        estimated_completion?: string;
        error_message?: string;
        quality_metrics?: QualityMetrics;
        warnings?: string[];
    }> {
        if (!generationId) {
            throw new Error('Generation ID is required');
        }

        return api.get(`/api/enterprise/reports/generation/${encodeURIComponent(generationId)}/status`);
    }

    /**
     * Отмена генерации отчета
     */
    async cancelReportGeneration(generationId: string): Promise<boolean> {
        if (!generationId) {
            throw new Error('Generation ID is required');
        }

        return api.post(`/api/enterprise/reports/generation/${encodeURIComponent(generationId)}/cancel`);
    }

    // ===== ШАБЛОНЫ ОТЧЕТОВ =====

    /**
     * Получение списка шаблонов отчетов
     */
    async getReportTemplates(params: {
        category?: string;
        target_audience?: string;
        compliance_framework?: string;
        industry?: string;
        include_custom?: boolean;
    } = {}): Promise<ReportTemplate[]> {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) {
                queryParams.append(key, String(value));
            }
        });

        const url = `/api/enterprise/reports/templates${queryParams.toString() ? `?${queryParams}` : ''}`;
        const response = await api.get<{ templates: ReportTemplate[] }>(url);
        return response.templates || [];
    }

    /**
     * Создание кастомного шаблона отчета
     */
    async createReportTemplate(template: Omit<ReportTemplate, 'template_id'>): Promise<ApiResponse<ReportTemplate>> {
        return api.post('/api/enterprise/reports/templates', template);
    }

    /**
     * Обновление шаблона отчета
     */
    async updateReportTemplate(templateId: string, updates: Partial<ReportTemplate>): Promise<ReportTemplate> {
        if (!templateId) {
            throw new Error('Template ID is required');
        }

        return api.put(`/api/enterprise/reports/templates/${encodeURIComponent(templateId)}`, updates);
    }

    /**
     * Клонирование шаблона отчета
     */
    async cloneReportTemplate(
        templateId: string,
        newName: string,
        modifications?: Partial<ReportTemplate>
    ): Promise<ApiResponse<ReportTemplate>> {
        if (!templateId) {
            throw new Error('Template ID is required');
        }

        return api.post(`/api/enterprise/reports/templates/${encodeURIComponent(templateId)}/clone`, {
            name: newName,
            modifications
        });
    }

    // ===== АВТОМАТИЗАЦИЯ ОТЧЕТНОСТИ =====

    /**
     * Настройка автоматизации отчетов
     */
    async configureReportAutomation(settings: ReportAutomationSettings): Promise<ApiResponse<ReportAutomationSettings>> {
        return api.post('/api/enterprise/reports/automation', settings);
    }

    /**
     * Получение настроек автоматизации
     */
    async getReportAutomationSettings(automationId: string): Promise<ReportAutomationSettings> {
        if (!automationId) {
            throw new Error('Automation ID is required');
        }

        return api.get(`/api/enterprise/reports/automation/${encodeURIComponent(automationId)}`);
    }

    /**
     * Управление автоматизацией отчетов
     */
    async manageReportAutomation(
        automationId: string,
        action: 'start' | 'stop' | 'pause' | 'resume',
        options?: Record<string, any>
    ): Promise<boolean> {
        if (!automationId) {
            throw new Error('Automation ID is required');
        }

        return api.post(`/api/enterprise/reports/automation/${encodeURIComponent(automationId)}/${action}`, options);
    }

    /**
     * Получение истории автоматизации
     */
    async getAutomationHistory(
        automationId: string,
        params: {
            from_date?: string;
            to_date?: string;
            status?: string;
            limit?: number;
        } = {}
    ): Promise<{
        executions: Array<{
            execution_id: string;
            start_time: string;
            end_time?: string;
            status: string;
            reports_generated: number;
            errors: string[];
            metrics: Record<string, any>;
        }>;
        summary: {
            total_executions: number;
            success_rate: number;
            average_duration: number;
            total_reports_generated: number;
        };
    }> {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) {
                queryParams.append(key, String(value));
            }
        });

        const url = `/api/enterprise/reports/automation/${encodeURIComponent(automationId)}/history${queryParams.toString() ? `?${queryParams}` : ''}`;
        return api.get(url);
    }

    // ===== COMPLIANCE И GOVERNANCE =====

    /**
     * Генерация отчета соответствия
     */
    async generateComplianceReport(
        framework: string,
        options: {
            scope?: string[];
            assessment_date?: string;
            include_gaps?: boolean;
            include_roadmap?: boolean;
            format?: 'executive' | 'detailed' | 'technical';
            certification_focus?: boolean;
        } = {}
    ): Promise<ApiResponse<{ generation_id: string; estimated_completion: string }>> {
        return api.post('/api/enterprise/reports/compliance', {
            framework,
            options
        }, { timeout: 600000 });
    }

    /**
     * Создание executive отчета
     */
    async generateExecutiveReport(
        reportType: 'security_posture' | 'risk_dashboard' | 'compliance_status' | 'business_impact' | 'investment_analysis',
        parameters: {
            timeframe: string;
            business_context: BusinessContext;
            include_financial_metrics?: boolean;
            include_risk_analysis?: boolean;
            include_compliance_status?: boolean;
            include_strategic_recommendations?: boolean;
            include_kpi_dashboard?: boolean;
            include_trend_analysis?: boolean;
            include_comparative_analysis?: boolean;
            include_investment_roadmap?: boolean;
            executive_audience?: 'ceo' | 'cto' | 'ciso' | 'cfo' | 'board' | 'investors';
            confidentiality_level?: 'public' | 'internal' | 'confidential' | 'restricted';
            presentation_format?: 'detailed' | 'summary' | 'slides' | 'dashboard';
            output_formats?: ('pdf' | 'pptx' | 'docx' | 'html' | 'json')[];
            branding_template?: string;
            custom_sections?: string[];
            data_sources?: string[];
            benchmark_comparisons?: string[];
            priority_focus_areas?: string[];
            distribution_list?: string[];
            approval_workflow?: string;
            deadline?: string;
        }
    ): Promise<ApiResponse<{
        report_id: string;
        generation_id: string;
        status: 'queued' | 'processing' | 'completed' | 'failed';
        estimated_completion: string;
        report_metadata: {
            report_type: string;
            target_audience: string;
            confidentiality_level: string;
            sections_included: string[];
            data_sources_used: string[];
            generation_timestamp: string;
            validity_period: string;
        };
        preview_available: boolean;
        download_links?: {
            format: string;
            url: string;
            expires_at: string;
        }[];
        executive_summary?: ExecutiveSummary;
        quality_metrics?: QualityMetrics;
        approval_status?: {
            required: boolean;
            current_step: number;
            total_steps: number;
            pending_approvers: string[];
        };
    }>> {
        try {
            // Валидация входных параметров
            if (!reportType) {
                throw new Error('Report type is required');
            }

            if (!parameters.timeframe) {
                throw new Error('Timeframe is required');
            }

            if (!parameters.business_context) {
                throw new Error('Business context is required');
            }

            // Валидация временного диапазона
            const validTimeframes = ['last_30_days', 'last_90_days', 'last_6_months', 'last_year', 'ytd', 'custom'];
            if (!validTimeframes.includes(parameters.timeframe) && !parameters.timeframe.includes('to')) {
                throw new Error(`Invalid timeframe. Must be one of: ${validTimeframes.join(', ')} or custom range`);
            }

            // Установка значений по умолчанию
            const reportConfig = {
                report_type: reportType,
                timeframe: parameters.timeframe,
                business_context: parameters.business_context,
                include_financial_metrics: parameters.include_financial_metrics ?? true,
                include_risk_analysis: parameters.include_risk_analysis ?? true,
                include_compliance_status: parameters.include_compliance_status ?? true,
                include_strategic_recommendations: parameters.include_strategic_recommendations ?? true,
                include_kpi_dashboard: parameters.include_kpi_dashboard ?? true,
                include_trend_analysis: parameters.include_trend_analysis ?? true,
                include_comparative_analysis: parameters.include_comparative_analysis ?? true,
                include_investment_roadmap: parameters.include_investment_roadmap ?? true,
                executive_audience: parameters.executive_audience ?? 'ciso',
                confidentiality_level: parameters.confidentiality_level ?? 'internal',
                presentation_format: parameters.presentation_format ?? 'detailed',
                output_formats: parameters.output_formats ?? ['pdf', 'pptx'],
                branding_template: parameters.branding_template ?? 'default_executive',
                custom_sections: parameters.custom_sections ?? [],
                data_sources: parameters.data_sources ?? [],
                benchmark_comparisons: parameters.benchmark_comparisons ?? [],
                priority_focus_areas: parameters.priority_focus_areas ?? [],
                distribution_list: parameters.distribution_list ?? [],
                approval_workflow: parameters.approval_workflow,
                deadline: parameters.deadline,
                generation_metadata: {
                    requested_by: 'current_user', // Получать из контекста аутентификации
                    requested_at: new Date().toISOString(),
                    priority: parameters.deadline ? 'high' : 'normal',
                    estimated_pages: this.estimateReportPages(reportType, parameters),
                    estimated_generation_time: this.estimateGenerationTime(reportType, parameters)
                }
            };

            // Проверка разрешений и доступа
            const accessValidation = await this.validateExecutiveReportAccess(reportType, parameters.business_context);
            if (!accessValidation.permitted) {
                throw new Error(`Access denied: ${accessValidation.reason}`);
            }

            // Проверка доступности данных
            const dataAvailability = await this.validateDataAvailability(reportConfig);
            if (!dataAvailability.sufficient) {
                console.warn('Insufficient data for complete report generation', dataAvailability.missing_sources);
            }

            // Создание задачи генерации отчета
            const generationRequest = {
                ...reportConfig,
                tenant_id: parameters.business_context.organization_id,
                request_id: `exec_report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                data_availability: dataAvailability,
                quality_requirements: {
                    minimum_data_completeness: 0.85,
                    maximum_staleness_hours: 24,
                    required_validation_checks: ['data_integrity', 'compliance_alignment', 'accuracy_verification']
                }
            };

            // Отправка запроса на генерацию
            const response = await api.post<{
                report_id: string;
                generation_id: string;
                status: string;
                estimated_completion: string;
                queue_position?: number;
            }>('/api/enterprise/reports/executive/generate', generationRequest, {
                timeout: 30000,
                headers: {
                    'Content-Type': 'application/json',
                    'X-Report-Priority': parameters.deadline ? 'high' : 'normal',
                    'X-Report-Type': reportType,
                    'X-Executive-Audience': parameters.executive_audience ?? 'ciso'
                }
            });

            await this.logExecutiveReportRequest(reportType, parameters, response.generation_id)
            // Инициализация мониторинга прогресса
            const progressMonitoring = this.initializeProgressMonitoring(response.generation_id);
            console.log('Progress monitoring initialized:', progressMonitoring);

            // Настройка уведомлений
            if (parameters.distribution_list && parameters.distribution_list.length > 0) {
                await this.configureGenerationNotifications(response.generation_id, parameters.distribution_list);
            }

            // Инициализация workflow утверждения, если требуется
            let approvalStatus;
            if (parameters.approval_workflow) {
                approvalStatus = await this.initializeApprovalWorkflow(
                    response.report_id,
                    parameters.approval_workflow,
                    parameters.business_context
                );
            }

            // Формирование ответа
            const result: {
                report_id: string;
                generation_id: string;
                status: 'queued' | 'processing' | 'completed' | 'failed';
                estimated_completion: string;
                report_metadata: {
                    report_type: string;
                    target_audience: string;
                    confidentiality_level: string;
                    sections_included: string[];
                    data_sources_used: string[];
                    generation_timestamp: string;
                    validity_period: string;
                };
                preview_available: boolean;
                download_links?: { format: string; url: string; expires_at: string; }[];
                executive_summary?: ExecutiveSummary;
                quality_metrics?: QualityMetrics;
                approval_status?: {
                    required: boolean;
                    current_step: number;
                    total_steps: number;
                    pending_approvers: string[];
                };
            } = {
                report_id: response.report_id,
                generation_id: response.generation_id,
                status: response.status as 'queued' | 'processing' | 'completed' | 'failed',
                estimated_completion: response.estimated_completion,
                report_metadata: {
                    report_type: reportType,
                    target_audience: parameters.executive_audience ?? 'ciso',
                    confidentiality_level: parameters.confidentiality_level ?? 'internal',
                    sections_included: this.determineSectionsIncluded(reportConfig),
                    data_sources_used: dataAvailability.available_sources,
                    generation_timestamp: new Date().toISOString(),
                    validity_period: this.calculateValidityPeriod(reportType, parameters.timeframe)
                },
                preview_available: false
            };

            // Условно добавляем опциональные свойства
            if (approvalStatus) {
                result.approval_status = {
                    required: true,
                    current_step: 1,
                    total_steps: approvalStatus.total_steps,
                    pending_approvers: approvalStatus.pending_approvers
                };
            }


            return {
                success: true,
                status: 'success',
                data: result,
                message: `Executive report generation initiated. Generation ID: ${response.generation_id}`,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            console.error('Executive report generation failed:', error);

            const apiError = error as any;

            if (apiError.response?.status === 403) {
                throw new Error('Insufficient permissions to generate executive reports');
            } else if (apiError.response?.status === 429) {
                throw new Error('Rate limit exceeded. Please try again later');
            } else if (apiError.response?.status === 507) {
                throw new Error('Insufficient storage space for report generation');
            } else if (apiError.code === 'ECONNABORTED') {
                throw new Error('Request timeout. Report generation may take longer than expected');
            } else if (apiError.message?.includes('validation')) {
                throw new Error(`Validation failed: ${apiError.message}`);
            } else {
                const errorMessage = apiError.message || 'Unknown error';
                throw new Error(`Executive report generation failed: ${errorMessage}`);
            }
        }
    }

    // ===== ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ДЛЯ EXECUTIVE ОТЧЕТОВ =====

    /**
     * Оценка количества страниц отчета
     */
    private estimateReportPages(reportType: string, parameters: any): number {
        const basePages: Record<string, number> = {
            'security_posture': 25,
            'risk_dashboard': 20,
            'compliance_status': 30,
            'business_impact': 35,
            'investment_analysis': 40
        };

        let pages = basePages[reportType] || 25;

        // Корректировка на основе включенных секций
        if (parameters.include_trend_analysis) pages += 5;
        if (parameters.include_comparative_analysis) pages += 8;
        if (parameters.include_investment_roadmap) pages += 10;
        if (parameters.custom_sections?.length > 0) pages += parameters.custom_sections.length * 3;

        return pages;
    }

    /**
     * Оценка времени генерации
     */
    private estimateGenerationTime(reportType: string, parameters: any): number {
        const baseTime: Record<string, number> = {
            'security_posture': 300, // 5 минут
            'risk_dashboard': 180, // 3 минуты
            'compliance_status': 420, // 7 минут
            'business_impact': 480, // 8 минут
            'investment_analysis': 600 // 10 минут
        };

        let time = baseTime[reportType] || 300;

        // Корректировка на основе сложности
        if (parameters.include_comparative_analysis) time += 120;
        if (parameters.benchmark_comparisons?.length > 0) time += 60;
        if (parameters.output_formats?.length > 2) time += 30;

        return time;
    }

    /**
     * Валидация доступа к генерации executive отчетов
     */
    private async validateExecutiveReportAccess(
        reportType: string,
        businessContext: BusinessContext
    ): Promise<{ permitted: boolean; reason?: string }> {
        try {
            const response = await api.get<{ permitted: boolean; reason?: string }>(
                `/api/enterprise/reports/executive/access-validation?report_type=${reportType}&org_id=${businessContext.organization_id}`
            );
            return response; // response уже правильного типа
        } catch (error) {
            console.error('Access validation failed:', error);
            return { permitted: false, reason: 'Access validation failed' };
        }
    }

    /**
     * Валидация доступности данных
     */
    private async validateDataAvailability(reportConfig: any): Promise<{
        sufficient: boolean;
        available_sources: string[];
        missing_sources: string[];
        data_completeness: number;
    }> {
        try {
            const response = await api.post<{
                sufficient: boolean;
                available_sources: string[];
                missing_sources: string[];
                data_completeness: number;
            }>('/api/enterprise/reports/data-availability', {
                report_type: reportConfig.report_type,
                timeframe: reportConfig.timeframe,
                required_sources: reportConfig.data_sources,
                business_context: reportConfig.business_context
            });
            return response; // response уже правильного типа
        } catch (error) {
            console.error('Data availability validation failed:', error);
            return {
                sufficient: false,
                available_sources: [],
                missing_sources: reportConfig.data_sources || [],
                data_completeness: 0
            };
        }
    }

    /**
     * Определение включенных секций отчета
     */
    private determineSectionsIncluded(reportConfig: any): string[] {
        const sections = ['executive_summary'];

        if (reportConfig.include_financial_metrics) sections.push('financial_metrics');
        if (reportConfig.include_risk_analysis) sections.push('risk_analysis');
        if (reportConfig.include_compliance_status) sections.push('compliance_status');
        if (reportConfig.include_strategic_recommendations) sections.push('strategic_recommendations');
        if (reportConfig.include_kpi_dashboard) sections.push('kpi_dashboard');
        if (reportConfig.include_trend_analysis) sections.push('trend_analysis');
        if (reportConfig.include_comparative_analysis) sections.push('comparative_analysis');
        if (reportConfig.include_investment_roadmap) sections.push('investment_roadmap');

        return sections.concat(reportConfig.custom_sections || []);
    }

    /**
     * Расчет периода валидности отчета
     */
    private calculateValidityPeriod(reportType: string, _timeframe: string): string {
        const validityPeriods: Record<string, string> = {
            'security_posture': '30 days',
            'risk_dashboard': '14 days',
            'compliance_status': '90 days',
            'business_impact': '60 days',
            'investment_analysis': '180 days'
        };

        return validityPeriods[reportType] || '30 days';
    }

    /**
     * Инициализация мониторинга прогресса
     */
    private initializeProgressMonitoring(generationId: string): any {
        // Инициализация WebSocket подключения для мониторинга прогресса
        console.log(`Initializing progress monitoring for generation ${generationId}`);

        return {
            generation_id: generationId,
            websocket_endpoint: `/ws/reports/generation/${generationId}`,
            polling_interval: 10000,
            timeout: 3600000 // 1 час
        };
    }

    /**
     * Настройка уведомлений о генерации
     */
    private async configureGenerationNotifications(
        generationId: string,
        distributionList: string[]
    ): Promise<void> {
        try {
            await api.post('/api/enterprise/reports/notifications/configure', {
                generation_id: generationId,
                recipients: distributionList,
                events: ['generation_started', 'generation_completed', 'generation_failed'],
                channels: ['email', 'webhook']
            });
        } catch (error) {
            console.error('Failed to configure notifications:', error);
        }
    }

    /**
     * Инициализация workflow утверждения
     */
    private async initializeApprovalWorkflow(
        reportId: string,
        workflowId: string,
        businessContext: BusinessContext
    ): Promise<{ total_steps: number; pending_approvers: string[] }> {
        try {
            // ИСПРАВЛЕНИЕ: Явная типизация response
            const response = await api.post<{
                data: {
                    total_steps: number;
                    pending_approvers: string[];
                    workflow_status: string;
                    estimated_duration: number;
                };
                success: boolean;
                message: string;
            }>('/api/enterprise/reports/approval/initialize', {
                report_id: reportId,
                workflow_id: workflowId,
                business_context: businessContext
            });

            return response.data;
        } catch (error) {
            console.error('Failed to initialize approval workflow:', error);
            return { total_steps: 0, pending_approvers: [] };
        }
    }

    /**
     * Логирование запроса executive отчета
     */
    private async logExecutiveReportRequest(
        reportType: string,
        parameters: any,
        generationId: string
    ): Promise<void> {
        try {
            await api.post('/api/enterprise/audit/log', {
                event_type: 'executive_report_requested',
                report_type: reportType,
                generation_id: generationId,
                business_context: parameters.business_context,
                requested_by: 'current_user', // Получать из контекста
                timestamp: new Date().toISOString(),
                metadata: {
                    timeframe: parameters.timeframe,
                    output_formats: parameters.output_formats,
                    confidentiality_level: parameters.confidentiality_level
                }
            });
        } catch (error) {
            console.error('Failed to log executive report request:', error);
        }
    }

    // ===== МЕТОДЫ УПРАВЛЕНИЯ EXECUTIVE ОТЧЕТАМИ =====

    /**
     * Получение статуса генерации executive отчета
     */
    async getExecutiveReportStatus(generationId: string): Promise<ApiResponse<any>> {
        try {
            if (!generationId) {
                throw new Error('Generation ID is required');
            }

            const response = await api.get<any>(`/api/enterprise/reports/executive/generation/${encodeURIComponent(generationId)}/status`);

            return {
                success: true,
                status: 'success',
                data: response, // response уже содержит нужные данные
                message: 'Executive report status retrieved successfully',
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Failed to get executive report status:', error);
            const errorMessage = (error as any).message || 'Unknown error';
            throw new Error(`Failed to retrieve report status: ${errorMessage}`);
        }
    }

    /**
     * Скачивание executive отчета
     */
    async downloadExecutiveReport(
        reportId: string,
        format: 'pdf' | 'pptx' | 'docx' | 'html' | 'json' = 'pdf'
    ): Promise<ApiResponse<any>> {
        try {
            if (!reportId) {
                throw new Error('Report ID is required');
            }

            const queryParams = new URLSearchParams({ format });
            const response = await api.get<any>(`/api/enterprise/reports/executive/${encodeURIComponent(reportId)}/download?${queryParams}`, {
                headers: {
                    'Accept': 'application/json'
                }
            });

            return {
                success: true,
                status: 'success',
                data: response, // response уже содержит нужные данные
                message: `Executive report download link generated for format: ${format}`,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Failed to generate download link:', error);
            const errorMessage = (error as any).message || 'Unknown error';
            throw new Error(`Failed to generate download link: ${errorMessage}`);
        }
    }
}

// ===== ЭКСПОРТ ЕДИНСТВЕННОГО ЭКЗЕМПЛЯРА =====

/**
 * Singleton экземпляр Enterprise Reports API Service
 */
export const enterpriseReportsApi = new EnterpriseReportsApiService();

/**
 * Экспорт по умолчанию для совместимости
 */
export const reportsApi = new EnterpriseReportsApiService();
export default reportsApi;
