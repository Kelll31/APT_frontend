// src/stores/settingsStore.tsx

/**
 * IP Roast Enterprise - Settings Store v3.0 ENTERPRISE
 * Centralized state management для системы настроек с расширенными возможностями
 * Построен на React + Zustand для IP Roast Frontend
 */

import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { persist, createJSONStorage } from 'zustand/middleware';

// ===== ТИПЫ ДАННЫХ ДЛЯ НАСТРОЕК =====

// Основные категории настроек
export type SettingsCategory =
    | 'profile' | 'security' | 'scanning' | 'notifications' | 'integrations'
    | 'reports' | 'appearance' | 'schedule' | 'backup' | 'audit';

// Темы оформления
export type ThemeMode = 'light' | 'dark' | 'auto';

// Языки интерфейса
export type Language = 'ru' | 'en' | 'es' | 'fr' | 'de' | 'zh' | 'ja';

// Часовые пояса
export type Timezone =
    | 'UTC' | 'Europe/Moscow' | 'Europe/London' | 'America/New_York'
    | 'America/Los_Angeles' | 'Asia/Tokyo' | 'Asia/Shanghai' | 'Australia/Sydney';

// Размеры интерфейса
export type UISize = 'compact' | 'medium' | 'large';

// Акцентные цвета
export type AccentColor = 'blue' | 'green' | 'red' | 'purple' | 'orange' | 'teal';

// Профиль пользователя
export interface UserProfile {
    // Персональная информация
    full_name: string;
    email: string;
    position?: string;
    department?: string;
    organization?: string;
    avatar_url?: string;

    // Контактная информация
    phone?: string;
    telegram?: string;

    // Региональные настройки
    timezone: Timezone;
    language: Language;
    date_format: 'DD.MM.YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
    time_format: '24h' | '12h';

    // Профиль сканирования по умолчанию
    default_scan_profile: string;

    // Роли и права
    roles: string[];
    permissions: string[];

    // Предпочтения
    preferences: UserPreferences;

    // Метаданные
    created_at: string;
    updated_at: string;
    last_login?: string;
    login_count: number;

    // Enterprise поля
    employee_id?: string;
    cost_center?: string;
    manager?: string;
    team?: string;
    custom_fields?: Record<string, any>;
}

// Предпочтения пользователя
export interface UserPreferences {
    // Уведомления
    email_notifications: boolean;
    push_notifications: boolean;
    desktop_notifications: boolean;
    sound_notifications: boolean;

    // Интерфейс
    show_tooltips: boolean;
    show_welcome_screen: boolean;
    auto_refresh_enabled: boolean;
    auto_refresh_interval: number;

    // Сканирование
    auto_start_validation: boolean;
    show_advanced_options: boolean;
    remember_scan_settings: boolean;

    // Отчеты
    default_report_format: string;
    auto_download_reports: boolean;

    // Безопасность
    auto_logout_enabled: boolean;
    auto_logout_timeout: number;

    // Аналитика
    collect_usage_stats: boolean;
    share_anonymous_data: boolean;
}

// Настройки безопасности
export interface SecuritySettings {
    // Двухфакторная аутентификация
    totp_enabled: boolean;
    totp_secret?: string;
    totp_backup_codes?: string[];

    // Время жизни сессии
    session_lifetime: number;
    remember_me_enabled: boolean;

    // Автоматический выход
    auto_logout_enabled: boolean;
    auto_logout_timeout: number;

    // IP ограничения
    ip_whitelist_enabled: boolean;
    allowed_ip_ranges: string[];

    // Политика паролей
    password_policy: PasswordPolicy;

    // API ключи
    api_keys: APIKey[];

    // Активные сессии
    active_sessions: ActiveSession[];

    // События безопасности
    security_events: SecurityEvent[];

    // Дополнительная защита
    require_approval_for_changes: boolean;
    encryption_enabled: boolean;
    secure_headers_enabled: boolean;

    // Мониторинг
    failed_login_threshold: number;
    lockout_duration: number;

    // Уведомления безопасности
    notify_on_login: boolean;
    notify_on_password_change: boolean;
    notify_on_suspicious_activity: boolean;
}

// Политика паролей
export interface PasswordPolicy {
    min_length: number;
    require_uppercase: boolean;
    require_lowercase: boolean;
    require_numbers: boolean;
    require_special_chars: boolean;
    password_history_count: number;
    max_age_days: number;
}

// API ключ
export interface APIKey {
    id: string;
    name: string;
    key_preview: string;
    permissions: string[];
    created_at: string;
    last_used?: string;
    usage_count: number;
    expires_at?: string;
    is_active: boolean;
    ip_restrictions?: string[];
    rate_limit?: {
        requests_per_hour: number;
        requests_per_day: number;
    };
}

// Активная сессия
export interface ActiveSession {
    id: string;
    device_info: {
        browser: string;
        os: string;
        device_type: string;
    };
    ip_address: string;
    location?: {
        country: string;
        city: string;
    };
    created_at: string;
    last_activity: string;
    is_current: boolean;
}

// Событие безопасности
export interface SecurityEvent {
    id: string;
    type: 'login' | 'logout' | 'password_change' | 'failed_login' | 'suspicious_activity';
    description: string;
    ip_address: string;
    user_agent: string;
    timestamp: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    resolved: boolean;
}

// Настройки сканирования
export interface ScanningSettings {
    // Базовые настройки
    default_timeout: number;
    max_concurrent_scans: number;
    default_ports: string;
    timing_template: string;

    // Политики сканирования
    scan_policies: ScanPolicy[];

    // Модули и скрипты
    enabled_modules: string[];
    custom_scripts: string[];

    // Производительность
    resource_limits: ResourceLimits;

    // Автоматизация
    auto_schedule_enabled: boolean;
    auto_retry_failed: boolean;
    auto_cleanup_old_scans: boolean;

    // Валидация
    strict_target_validation: boolean;
    allow_private_ranges: boolean;
    blacklisted_ranges: string[];

    // Уведомления
    notify_on_completion: boolean;
    notify_on_critical_findings: boolean;

    // Интеграции
    webhook_on_completion: boolean;
    webhook_url?: string;

    // Кэширование
    cache_scan_results: boolean;
    cache_duration_hours: number;

    // Архивирование
    auto_archive_completed: boolean;
    archive_after_days: number;
}

// Политика сканирования
export interface ScanPolicy {
    id: string;
    name: string;
    description: string;
    target_patterns: string[];
    allowed_ports: string[];
    blocked_ports: string[];
    max_scan_duration: number;
    requires_approval: boolean;
    auto_apply_conditions: string[];
    priority: number;
    enabled: boolean;
}

// Ограничения ресурсов
export interface ResourceLimits {
    max_cpu_percent: number;
    max_memory_mb: number;
    max_network_mbps: number;
    max_parallel_hosts: number;
    scan_rate_limit: number;
}

// Настройки уведомлений
export interface NotificationSettings {
    // Глобальные настройки
    enabled: boolean;
    quiet_hours: QuietHours;

    // Каналы уведомлений
    channels: NotificationChannel[];

    // Правила уведомлений
    rules: NotificationRule[];

    // Шаблоны уведомлений
    templates: NotificationTemplate[];

    // Группировка
    group_similar: boolean;
    group_timeout_minutes: number;

    // Приоритизация
    priority_filters: PriorityFilter[];

    // Throttling
    rate_limiting: NotificationRateLimit;

    // Эскалация
    escalation_rules: EscalationRule[];
}

// Часы тишины
export interface QuietHours {
    enabled: boolean;
    start_time: string;
    end_time: string;
    timezone: Timezone;
    days_of_week: number[];
    emergency_override: boolean;
}

// Канал уведомлений
export interface NotificationChannel {
    id: string;
    type: 'email' | 'slack' | 'telegram' | 'webhook' | 'sms' | 'teams' | 'discord';
    name: string;
    enabled: boolean;
    configuration: Record<string, any>;
    filters: NotificationFilter[];
    retry_policy: RetryPolicy;
    health_check: HealthCheck;
}

// Фильтр уведомлений
export interface NotificationFilter {
    field: string;
    operator: 'equals' | 'contains' | 'starts_with' | 'regex' | 'greater_than' | 'less_than';
    value: any;
    case_sensitive?: boolean;
}

// Политика повторов
export interface RetryPolicy {
    max_attempts: number;
    initial_delay_ms: number;
    max_delay_ms: number;
    backoff_multiplier: number;
}

// Проверка здоровья
export interface HealthCheck {
    enabled: boolean;
    interval_minutes: number;
    timeout_ms: number;
    failure_threshold: number;
}

// Правило уведомления
export interface NotificationRule {
    id: string;
    name: string;
    conditions: RuleCondition[];
    actions: RuleAction[];
    priority: number;
    enabled: boolean;
}

// Условие правила
export interface RuleCondition {
    field: string;
    operator: string;
    value: any;
    and_conditions?: RuleCondition[];
    or_conditions?: RuleCondition[];
}

// Действие правила
export interface RuleAction {
    type: 'send' | 'suppress' | 'modify' | 'delay' | 'escalate';
    channels?: string[];
    template?: string;
    delay_minutes?: number;
    modification?: Record<string, any>;
}

// Шаблон уведомления
export interface NotificationTemplate {
    id: string;
    name: string;
    subject: string;
    body: string;
    variables: string[];
    format: 'text' | 'html' | 'markdown';
    language: Language;
}

// Фильтр приоритета
export interface PriorityFilter {
    condition: string;
    priority: 'low' | 'normal' | 'high' | 'urgent';
    channels: string[];
}

// Ограничение скорости уведомлений
export interface NotificationRateLimit {
    enabled: boolean;
    max_per_minute: number;
    max_per_hour: number;
    max_per_day: number;
    burst_limit: number;
}

// Правило эскалации
export interface EscalationRule {
    id: string;
    trigger_after_minutes: number;
    conditions: string[];
    escalate_to: string[];
    message_template: string;
}

// Настройки интеграций
export interface IntegrationSettings {
    // SIEM интеграции
    siem_integrations: SIEMIntegration[];

    // Системы тикетов
    ticketing_systems: TicketingSystem[];

    // Облачные сервисы
    cloud_services: CloudService[];

    // Vulnerability Management
    vuln_management: VulnManagementSystem[];

    // Threat Intelligence
    threat_intel: ThreatIntelSource[];

    // API интеграции
    api_integrations: APIIntegration[];

    // Middleware
    middleware_config: MiddlewareConfig;
}

// SIEM интеграция
export interface SIEMIntegration {
    id: string;
    name: string;
    type: 'splunk' | 'elastic' | 'qradar' | 'sentinel' | 'sumo_logic' | 'custom';
    enabled: boolean;
    configuration: {
        endpoint: string;
        api_key: string;
        index?: string;
        source_type?: string;
        custom_fields?: Record<string, any>;
    };
    data_mapping: DataMapping[];
    filters: IntegrationFilter[];
    batch_size: number;
    sync_interval_minutes: number;
}

// Система тикетов
export interface TicketingSystem {
    id: string;
    name: string;
    type: 'jira' | 'servicenow' | 'remedy' | 'freshservice' | 'custom';
    enabled: boolean;
    configuration: {
        base_url: string;
        username: string;
        password: string;
        project_key?: string;
        ticket_type?: string;
        priority_mapping?: Record<string, string>;
    };
    auto_create_tickets: boolean;
    ticket_templates: TicketTemplate[];
}

// Облачный сервис
export interface CloudService {
    id: string;
    name: string;
    type: 'aws' | 'azure' | 'gcp' | 'custom';
    enabled: boolean;
    configuration: {
        region?: string;
        access_key?: string;
        secret_key?: string;
        subscription_id?: string;
        tenant_id?: string;
        service_account?: string;
    };
    services: string[];
    sync_interval_hours: number;
}

// Система управления уязвимостями
export interface VulnManagementSystem {
    id: string;
    name: string;
    type: 'qualys' | 'rapid7' | 'tenable' | 'openvas' | 'custom';
    enabled: boolean;
    configuration: {
        api_url: string;
        username: string;
        password: string;
        scan_template?: string;
    };
    auto_import_scans: boolean;
    sync_interval_hours: number;
}

// Источник Threat Intelligence
export interface ThreatIntelSource {
    id: string;
    name: string;
    type: 'misp' | 'otx' | 'virustotal' | 'custom_feed' | 'commercial';
    enabled: boolean;
    configuration: {
        api_url?: string;
        api_key?: string;
        feed_url?: string;
        format?: 'stix' | 'json' | 'csv' | 'xml';
    };
    indicators: string[];
    update_interval_hours: number;
}

// API интеграция
export interface APIIntegration {
    id: string;
    name: string;
    description: string;
    endpoint: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    headers: Record<string, string>;
    auth_type: 'none' | 'basic' | 'bearer' | 'api_key' | 'oauth2';
    auth_config: Record<string, any>;
    enabled: boolean;
    triggers: IntegrationTrigger[];
}

// Триггер интеграции
export interface IntegrationTrigger {
    event: string;
    conditions: string[];
    payload_template: string;
    retry_on_failure: boolean;
}

// Маппинг данных
export interface DataMapping {
    source_field: string;
    target_field: string;
    transformation?: string;
    default_value?: any;
}

// Фильтр интеграции
export interface IntegrationFilter {
    field: string;
    operator: string;
    value: any;
    enabled: boolean;
}

// Шаблон тикета
export interface TicketTemplate {
    name: string;
    summary: string;
    description: string;
    priority: string;
    component?: string;
    labels?: string[];
}

// Конфигурация middleware
export interface MiddlewareConfig {
    request_timeout: number;
    retry_attempts: number;
    circuit_breaker_enabled: boolean;
    rate_limit_per_minute: number;
    logging_level: 'debug' | 'info' | 'warn' | 'error';
}

// Настройки отчетов
export interface ReportSettings {
    // Форматы по умолчанию
    default_formats: string[];
    auto_generate: boolean;

    // Шаблоны отчетов
    templates: ReportTemplate[];

    // Планирование
    scheduled_reports: ScheduledReport[];

    // Хранение
    storage_settings: StorageSettings;

    // Брендинг
    branding: BrandingSettings;

    // Распространение
    distribution_lists: DistributionList[];

    // Архивирование
    archive_settings: ArchiveSettings;
}

// Шаблон отчета
export interface ReportTemplate {
    id: string;
    name: string;
    description: string;
    format: string;
    sections: ReportSection[];
    variables: TemplateVariable[];
    styling: TemplateStyling;
    access_control: string[];
}

// Секция отчета
export interface ReportSection {
    id: string;
    name: string;
    type: 'text' | 'chart' | 'table' | 'image';
    order: number;
    content: any;
    conditions?: string[];
}

// Переменная шаблона
export interface TemplateVariable {
    name: string;
    type: 'string' | 'number' | 'date' | 'boolean';
    default_value?: any;
    required: boolean;
    description: string;
}

// Стилизация шаблона
export interface TemplateStyling {
    theme: string;
    colors: Record<string, string>;
    fonts: Record<string, string>;
    layout: string;
}

// Запланированный отчет
export interface ScheduledReport {
    id: string;
    name: string;
    template_id: string;
    schedule: ScheduleConfig;
    parameters: Record<string, any>;
    recipients: string[];
    enabled: boolean;
    last_run?: string;
    next_run: string;
}

// Конфигурация расписания - ИСПРАВЛЕНО: добавлен 'quarterly'
export interface ScheduleConfig {
    type: 'once' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'cron';
    interval?: number;
    days_of_week?: number[];
    day_of_month?: number;
    time: string;
    timezone: Timezone;
    cron_expression?: string;
}

// Настройки хранения
export interface StorageSettings {
    local_storage_path: string;
    cloud_storage_enabled: boolean;
    cloud_provider?: 'aws_s3' | 'azure_blob' | 'gcp_storage';
    cloud_config?: Record<string, any>;
    compression_enabled: boolean;
    encryption_enabled: boolean;
    max_file_size_mb: number;
}

// Настройки брендинга
export interface BrandingSettings {
    company_name: string;
    logo_url?: string;
    header_text?: string;
    footer_text?: string;
    primary_color: string;
    secondary_color: string;
    font_family: string;
    watermark_enabled: boolean;
    watermark_text?: string;
}

// Список рассылки
export interface DistributionList {
    id: string;
    name: string;
    description: string;
    recipients: Recipient[];
    default_format: string;
    encryption_required: boolean;
}

// Получатель
export interface Recipient {
    type: 'email' | 'user' | 'group';
    identifier: string;
    name: string;
    formats: string[];
}

// Настройки архивирования
export interface ArchiveSettings {
    enabled: boolean;
    archive_after_days: number;
    compression_level: 'low' | 'medium' | 'high';
    delete_after_archive: boolean;
    archive_location: string;
}

// Настройки внешнего вида
export interface AppearanceSettings {
    // Тема
    theme: ThemeMode;
    custom_themes: CustomTheme[];

    // Цвета
    accent_color: AccentColor;
    custom_colors: CustomColorScheme;

    // Размеры
    ui_size: UISize;
    font_size: number;
    line_height: number;

    // Макет
    sidebar_collapsed: boolean;
    show_sidebar: boolean;
    compact_mode: boolean;

    // Доступность
    high_contrast: boolean;
    reduced_motion: boolean;
    screen_reader_mode: boolean;

    // Локализация
    language: Language;
    rtl_enabled: boolean;

    // Персонализация
    custom_css?: string;
    favicon_url?: string;

    // Анимации
    animations_enabled: boolean;
    transition_duration: number;
}

// Пользовательская тема
export interface CustomTheme {
    id: string;
    name: string;
    colors: Record<string, string>;
    css_variables: Record<string, string>;
    is_dark: boolean;
}

// Пользовательская цветовая схема
export interface CustomColorScheme {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    info: string;
    background: string;
    surface: string;
    text_primary: string;
    text_secondary: string;
}

// Настройки расписания
export interface ScheduleSettings {
    // Автоматические сканирования
    auto_scans: AutoScanConfig[];

    // Обновления системы
    system_updates: UpdateConfig;

    // Очистка данных
    cleanup_tasks: CleanupTask[];

    // Бэкапы
    backup_schedule: BackupSchedule;

    // Мониторинг
    health_checks: HealthCheckConfig[];

    // Отчеты
    report_generation: ReportGenerationConfig;

    // Maintenance окна
    maintenance_windows: MaintenanceWindow[];
}

// Конфигурация автосканирования
export interface AutoScanConfig {
    id: string;
    name: string;
    targets: string[];
    scan_profile: string;
    schedule: ScheduleConfig;
    enabled: boolean;
    notify_on_completion: boolean;
    notify_on_failure: boolean;
    max_duration_hours: number;
    retry_on_failure: boolean;
}

// Конфигурация обновлений
export interface UpdateConfig {
    auto_update_enabled: boolean;
    update_channel: 'stable' | 'beta' | 'nightly';
    schedule: ScheduleConfig;
    backup_before_update: boolean;
    rollback_on_failure: boolean;
    notification_settings: {
        notify_before_update: boolean;
        notify_after_update: boolean;
        notification_channels: string[];
    };
}

// Задача очистки
export interface CleanupTask {
    id: string;
    name: string;
    type: 'logs' | 'temp_files' | 'old_scans' | 'cache' | 'custom';
    schedule: ScheduleConfig;
    retention_days: number;
    size_threshold_mb?: number;
    custom_script?: string;
    enabled: boolean;
}

// Расписание бэкапов
export interface BackupSchedule {
    enabled: boolean;
    schedule: ScheduleConfig;
    backup_types: BackupType[];
    storage_location: string;
    compression_enabled: boolean;
    encryption_enabled: boolean;
    retention_days: number;
    verify_backup: boolean;
}

// Тип бэкапа
export interface BackupType {
    type: 'full' | 'incremental' | 'differential';
    includes: string[];
    excludes: string[];
}

// Конфигурация проверки здоровья
export interface HealthCheckConfig {
    id: string;
    name: string;
    type: 'http' | 'tcp' | 'database' | 'disk_space' | 'memory' | 'custom';
    schedule: ScheduleConfig;
    endpoint?: string;
    threshold: number;
    unit: string;
    alert_on_failure: boolean;
    retry_attempts: number;
    timeout_seconds: number;
}

// Конфигурация генерации отчетов
export interface ReportGenerationConfig {
    enabled: boolean;
    schedule: ScheduleConfig;
    report_types: string[];
    output_formats: string[];
    distribution_lists: string[];
    cleanup_old_reports: boolean;
    retention_days: number;
}

// Окно обслуживания
export interface MaintenanceWindow {
    id: string;
    name: string;
    description: string;
    start_time: string;
    end_time: string;
    timezone: Timezone;
    recurrence: 'once' | 'daily' | 'weekly' | 'monthly';
    actions: MaintenanceAction[];
    notification_before_minutes: number;
    enabled: boolean;
}

// Действие обслуживания
export interface MaintenanceAction {
    type: 'stop_scans' | 'backup' | 'update' | 'restart' | 'custom_script';
    parameters?: Record<string, any>;
    order: number;
}

// Настройки резервного копирования
export interface BackupSettings {
    // Автоматическое резервное копирование
    auto_backup: AutoBackupConfig;

    // Ручные бэкапы
    manual_backups: ManualBackup[];

    // Настройки восстановления
    restore_settings: RestoreSettings;

    // Экспорт/импорт
    export_import: ExportImportSettings;

    // Облачное хранение
    cloud_storage: CloudStorageConfig;

    // Валидация
    backup_validation: BackupValidationConfig;
}

// Конфигурация автобэкапа
export interface AutoBackupConfig {
    enabled: boolean;
    schedule: ScheduleConfig;
    backup_scope: BackupScope;
    retention_policy: RetentionPolicy;
    notification_settings: BackupNotificationSettings;
}

// Область бэкапа
export interface BackupScope {
    include_database: boolean;
    include_files: boolean;
    include_settings: boolean;
    include_reports: boolean;
    include_logs: boolean;
    custom_paths: string[];
    exclude_patterns: string[];
}

// Политика хранения
export interface RetentionPolicy {
    daily_backups: number;
    weekly_backups: number;
    monthly_backups: number;
    yearly_backups: number;
    max_total_backups: number;
}

// Настройки уведомлений бэкапа
export interface BackupNotificationSettings {
    notify_on_success: boolean;
    notify_on_failure: boolean;
    notification_channels: string[];
    include_statistics: boolean;
}

// Ручной бэкап
export interface ManualBackup {
    id: string;
    name: string;
    description: string;
    created_at: string;
    created_by: string;
    size_mb: number;
    scope: BackupScope;
    status: 'creating' | 'completed' | 'failed' | 'corrupted';
    file_path: string;
    checksum: string;
}

// Настройки восстановления
export interface RestoreSettings {
    allow_partial_restore: boolean;
    backup_before_restore: boolean;
    verify_before_restore: boolean;
    notification_settings: RestoreNotificationSettings;
    rollback_settings: RollbackSettings;
}

// Настройки уведомлений восстановления
export interface RestoreNotificationSettings {
    notify_on_start: boolean;
    notify_on_completion: boolean;
    notify_on_failure: boolean;
    notification_channels: string[];
}

// Настройки отката
export interface RollbackSettings {
    enabled: boolean;
    auto_rollback_on_failure: boolean;
    rollback_timeout_minutes: number;
    keep_rollback_point: boolean;
}

// Настройки экспорта/импорта
export interface ExportImportSettings {
    export_formats: string[];
    include_sensitive_data: boolean;
    encryption_enabled: boolean;
    compression_level: 'none' | 'low' | 'medium' | 'high';
    split_large_files: boolean;
    max_file_size_mb: number;
}

// Конфигурация облачного хранения
export interface CloudStorageConfig {
    enabled: boolean;
    provider: 'aws_s3' | 'azure_blob' | 'gcp_storage' | 'dropbox' | 'custom';
    configuration: CloudProviderConfig;
    sync_settings: CloudSyncSettings;
    security_settings: CloudSecuritySettings;
}

// Конфигурация облачного провайдера
export interface CloudProviderConfig {
    // AWS S3
    aws_access_key?: string;
    aws_secret_key?: string;
    aws_region?: string;
    s3_bucket?: string;

    // Azure Blob
    azure_account_name?: string;
    azure_account_key?: string;
    azure_container?: string;

    // Google Cloud Storage
    gcp_project_id?: string;
    gcp_service_account?: string;
    gcs_bucket?: string;

    // Общие
    endpoint_url?: string;
    custom_headers?: Record<string, string>;
}

// Настройки синхронизации с облаком
export interface CloudSyncSettings {
    auto_sync: boolean;
    sync_interval_hours: number;
    bandwidth_limit_mbps?: number;
    retry_failed_uploads: boolean;
    verify_uploads: boolean;
}

// Настройки безопасности облака
export interface CloudSecuritySettings {
    encryption_enabled: boolean;
    encryption_key?: string;
    access_logging: boolean;
    ip_restrictions: string[];
    require_mfa: boolean;
}

// Конфигурация валидации бэкапов
export interface BackupValidationConfig {
    enabled: boolean;
    validation_schedule: ScheduleConfig;
    integrity_checks: IntegrityCheck[];
    test_restore: boolean;
    notification_on_failure: boolean;
}

// Проверка целостности
export interface IntegrityCheck {
    type: 'checksum' | 'file_count' | 'size' | 'custom';
    parameters: Record<string, any>;
    critical: boolean;
}

// Настройки аудита
export interface AuditSettings {
    // Конфигурация аудита
    audit_config: AuditConfig;

    // Логирование
    logging_settings: LoggingSettings;

    // Соответствие требованиям
    compliance_settings: ComplianceSettings;

    // Аналитика
    analytics_settings: AnalyticsSettings;

    // Мониторинг
    monitoring_settings: MonitoringSettings;

    // Оповещения
    alert_settings: AlertSettings;
}

// Конфигурация аудита
export interface AuditConfig {
    enabled: boolean;
    audit_all_actions: boolean;
    audit_levels: AuditLevel[];
    retention_days: number;
    real_time_monitoring: boolean;
    anonymize_sensitive_data: boolean;
    include_request_bodies: boolean;
    include_response_bodies: boolean;
}

// Уровень аудита
export interface AuditLevel {
    category: string;
    level: 'none' | 'basic' | 'detailed' | 'full';
    events: string[];
    custom_fields: string[];
}

// Настройки логирования
export interface LoggingSettings {
    log_level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
    structured_logging: boolean;
    log_rotation: LogRotationConfig;
    remote_logging: RemoteLoggingConfig[];
    log_enrichment: LogEnrichmentConfig;
}

// Конфигурация ротации логов
export interface LogRotationConfig {
    enabled: boolean;
    max_file_size_mb: number;
    max_files_count: number;
    compress_old_files: boolean;
    delete_old_files_days: number;
}

// Конфигурация удаленного логирования
export interface RemoteLoggingConfig {
    enabled: boolean;
    type: 'syslog' | 'elasticsearch' | 'splunk' | 'fluentd' | 'custom';
    endpoint: string;
    protocol: 'tcp' | 'udp' | 'http' | 'https';
    authentication: Record<string, any>;
    buffer_size: number;
    retry_attempts: number;
}

// Конфигурация обогащения логов
export interface LogEnrichmentConfig {
    include_user_context: boolean;
    include_session_info: boolean;
    include_request_id: boolean;
    include_geo_location: boolean;
    custom_fields: Record<string, any>;
}

// Настройки соответствия
export interface ComplianceSettings {
    enabled_frameworks: ComplianceFramework[];
    automatic_reporting: boolean;
    evidence_collection: EvidenceCollectionConfig;
    policy_enforcement: PolicyEnforcementConfig;
    assessment_schedule: ScheduleConfig;
}

// Framework соответствия
export interface ComplianceFramework {
    name: string;
    version: string;
    enabled: boolean;
    controls: ComplianceControl[];
    reporting_frequency: 'monthly' | 'quarterly' | 'annually';
    contact_person: string;
}

// Контроль соответствия
export interface ComplianceControl {
    control_id: string;
    name: string;
    description: string;
    automated_check: boolean;
    check_frequency: string;
    evidence_required: string[];
    responsible_party: string;
}

// Конфигурация сбора доказательств
export interface EvidenceCollectionConfig {
    automatic_collection: boolean;
    storage_location: string;
    encryption_enabled: boolean;
    retention_years: number;
    digital_signatures: boolean;
}

// Конфигурация применения политик
export interface PolicyEnforcementConfig {
    strict_mode: boolean;
    auto_remediation: boolean;
    violation_notifications: boolean;
    escalation_enabled: boolean;
    grace_period_hours: number;
}

// Настройки аналитики
export interface AnalyticsSettings {
    enabled: boolean;
    data_collection: DataCollectionConfig;
    reporting: AnalyticsReportingConfig;
    privacy_settings: PrivacySettings;
    dashboard_config: DashboardConfig;
}

// Конфигурация сбора данных
export interface DataCollectionConfig {
    collect_usage_stats: boolean;
    collect_performance_metrics: boolean;
    collect_error_reports: boolean;
    collect_user_behavior: boolean;
    sampling_rate: number;
    data_retention_days: number;
}

// Конфигурация отчетности аналитики
export interface AnalyticsReportingConfig {
    automated_reports: boolean;
    report_frequency: 'daily' | 'weekly' | 'monthly';
    report_recipients: string[];
    include_recommendations: boolean;
    trend_analysis: boolean;
}

// Настройки приватности
export interface PrivacySettings {
    anonymize_user_data: boolean;
    anonymize_ip_addresses: boolean;
    respect_do_not_track: boolean;
    cookie_consent_required: boolean;
    data_processing_consent: boolean;
}

// Конфигурация дашборда
export interface DashboardConfig {
    default_widgets: DashboardWidget[];
    custom_widgets: DashboardWidget[];
    refresh_interval_seconds: number;
    auto_refresh_enabled: boolean;
    theme: string;
}

// Виджет дашборда
export interface DashboardWidget {
    id: string;
    type: 'chart' | 'metric' | 'table' | 'alert' | 'custom';
    title: string;
    position: WidgetPosition;
    size: WidgetSize;
    configuration: Record<string, any>;
    data_source: string;
    refresh_interval?: number;
}

// Позиция виджета
export interface WidgetPosition {
    x: number;
    y: number;
    z_index?: number;
}

// Размер виджета
export interface WidgetSize {
    width: number;
    height: number;
    min_width?: number;
    min_height?: number;
}

// Настройки мониторинга
export interface MonitoringSettings {
    system_monitoring: SystemMonitoringConfig;
    application_monitoring: AppMonitoringConfig;
    network_monitoring: NetworkMonitoringConfig;
    security_monitoring: SecurityMonitoringConfig;
    performance_monitoring: PerformanceMonitoringConfig;
}

// Конфигурация мониторинга системы
export interface SystemMonitoringConfig {
    enabled: boolean;
    metrics: SystemMetric[];
    alert_thresholds: AlertThreshold[];
    collection_interval_seconds: number;
    retention_days: number;
}

// Системная метрика
export interface SystemMetric {
    name: string;
    type: 'cpu' | 'memory' | 'disk' | 'network' | 'custom';
    enabled: boolean;
    unit: string;
    collection_method: string;
}

// Порог оповещения
export interface AlertThreshold {
    metric: string;
    operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
    value: number;
    duration_minutes: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
}

// Конфигурация мониторинга приложения
export interface AppMonitoringConfig {
    enabled: boolean;
    trace_sampling_rate: number;
    error_tracking: boolean;
    performance_tracking: boolean;
    user_session_tracking: boolean;
    custom_events: CustomEvent[];
}

// Пользовательское событие
export interface CustomEvent {
    name: string;
    description: string;
    properties: EventProperty[];
    enabled: boolean;
}

// Свойство события
export interface EventProperty {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'date';
    required: boolean;
}

// Конфигурация мониторинга сети
export interface NetworkMonitoringConfig {
    enabled: boolean;
    monitor_bandwidth: boolean;
    monitor_latency: boolean;
    monitor_packet_loss: boolean;
    endpoints: NetworkEndpoint[];
    alert_conditions: NetworkAlertCondition[];
}

// Сетевая конечная точка
export interface NetworkEndpoint {
    name: string;
    host: string;
    port?: number;
    protocol: 'tcp' | 'udp' | 'http' | 'https' | 'icmp';
    check_interval_seconds: number;
    timeout_seconds: number;
    enabled: boolean;
}

// Условие сетевого оповещения
export interface NetworkAlertCondition {
    endpoint: string;
    condition: 'down' | 'slow' | 'packet_loss' | 'timeout';
    threshold?: number;
    duration_minutes: number;
}

// Конфигурация мониторинга безопасности
export interface SecurityMonitoringConfig {
    enabled: boolean;
    intrusion_detection: boolean;
    anomaly_detection: boolean;
    threat_detection: boolean;
    behavioral_analysis: boolean;
    security_rules: SecurityRule[];
}

// Правило безопасности
export interface SecurityRule {
    id: string;
    name: string;
    description: string;
    rule_type: 'signature' | 'anomaly' | 'behavioral' | 'ml';
    severity: 'low' | 'medium' | 'high' | 'critical';
    enabled: boolean;
    conditions: SecurityCondition[];
    actions: SecurityAction[];
}

// Условие безопасности
export interface SecurityCondition {
    field: string;
    operator: string;
    value: any;
    case_sensitive?: boolean;
}

// Действие безопасности
export interface SecurityAction {
    type: 'alert' | 'block' | 'quarantine' | 'log' | 'custom';
    parameters: Record<string, any>;
}

// Конфигурация мониторинга производительности
export interface PerformanceMonitoringConfig {
    enabled: boolean;
    apm_enabled: boolean;
    profiling_enabled: boolean;
    metrics: PerformanceMetric[];
    sampling_rate: number;
    retention_days: number;
}

// Метрика производительности
export interface PerformanceMetric {
    name: string;
    type: 'counter' | 'gauge' | 'histogram' | 'timer';
    description: string;
    unit: string;
    enabled: boolean;
    tags: string[];
}

// Настройки оповещений
export interface AlertSettings {
    global_settings: GlobalAlertSettings;
    alert_rules: AlertRule[];
    notification_channels: string[];
    escalation_policies: EscalationPolicy[];
    maintenance_mode: MaintenanceModeConfig;
}

// Глобальные настройки оповещений
export interface GlobalAlertSettings {
    enabled: boolean;
    default_severity: string;
    group_similar_alerts: boolean;
    alert_timeout_minutes: number;
    auto_resolve_alerts: boolean;
    require_acknowledgment: boolean;
}

// Правило оповещения
export interface AlertRule {
    id: string;
    name: string;
    description: string;
    conditions: AlertCondition[];
    actions: AlertAction[];
    severity: string;
    enabled: boolean;
    schedule?: ScheduleConfig;
}

// Условие оповещения
export interface AlertCondition {
    metric: string;
    operator: string;
    threshold: number;
    duration_minutes: number;
    aggregation?: 'avg' | 'sum' | 'min' | 'max' | 'count';
}

// Действие оповещения
export interface AlertAction {
    type: 'notification' | 'webhook' | 'script' | 'ticket';
    target: string;
    template?: string;
    delay_minutes?: number;
}

// Политика эскалации
export interface EscalationPolicy {
    id: string;
    name: string;
    steps: EscalationStep[];
    repeat_escalation: boolean;
    escalation_timeout_minutes: number;
}

// Шаг эскалации
export interface EscalationStep {
    step_number: number;
    delay_minutes: number;
    targets: string[];
    action_type: 'notify' | 'assign' | 'escalate';
}

// Конфигурация режима обслуживания
export interface MaintenanceModeConfig {
    enabled: boolean;
    start_time?: string;
    end_time?: string;
    suppress_all_alerts: boolean;
    allowed_severities: string[];
    notification_message: string;
}

// Добавляем недостающие свойства в интерфейс SettingsState
export interface SettingsState {
    // Основные настройки
    userProfile: UserProfile;
    securitySettings: SecuritySettings;
    scanningSettings: ScanningSettings;
    notificationSettings: NotificationSettings;
    integrationSettings: IntegrationSettings;
    reportSettings: ReportSettings;
    appearanceSettings: AppearanceSettings;
    scheduleSettings: ScheduleSettings;
    backupSettings: BackupSettings;
    auditSettings: AuditSettings;

    // UI состояние
    currentCategory: SettingsCategory;
    isLoading: boolean;
    isSaving: boolean;
    hasUnsavedChanges: boolean;
    validationErrors: Record<string, string[]>;

    // Кэш оригинальных значений
    originalValues: Record<string, any>;

    // Метаданные
    lastSaved: string;
    saveInProgress: boolean;
    dataVersions: Record<string, number>;
}

// Исправленный интерфейс действий настроек с добавлением всех отсутствующих методов
export interface SettingsActions {
    // Основные действия
    loadSettings: (category?: SettingsCategory) => Promise<void>;
    saveSettings: (category?: SettingsCategory) => Promise<void>;
    resetToDefaults: (category: SettingsCategory) => Promise<void>;

    // Валидация
    validateSettings: (category?: SettingsCategory) => boolean;

    // Импорт/экспорт
    exportSettings: (categories?: SettingsCategory[], format?: 'json' | 'yaml') => Promise<Blob>;
    importSettings: (file: File, mergeStrategy?: 'replace' | 'merge') => Promise<void>;

    // UI управление
    switchCategory: (category: SettingsCategory) => void;
    discardChanges: (category?: SettingsCategory) => void;

    // Применение настроек
    applyAppearanceSettings: () => void;

    // Утилиты
    getCategoryData: (category: SettingsCategory) => any;
    hasChangesInCategory: (category: SettingsCategory) => boolean;

    // Персистентность
    saveState: () => void;
    loadState: () => void;

    // Инициализация
    initialize: () => void;

    // Приватные методы (теперь публичные для использования в интерфейсе)
    loadCategorySettings: (category: SettingsCategory) => Promise<void>;
    saveCategorySettings: (category: SettingsCategory) => Promise<void>;
    updateCategoryFromResponse: (category: SettingsCategory, data: any) => void;
    saveOriginalValues: () => void;
    validateCategoryData: (category: SettingsCategory, data: any) => { isValid: boolean; errors: string[] };
    validateCategory: (category: SettingsCategory) => void;
    sanitizeDataForAPI: (data: any) => any;
    calculateChecksum: (data: any) => string;
    getDataVersion: (category: SettingsCategory) => number;
    updateDataVersion: (category: SettingsCategory, version: number) => void;
    getAuthToken: () => string;
    generateRequestId: () => string;
    shouldRetryError: (error: Error) => boolean;
    getCategoryDisplayName: (category: SettingsCategory) => string;
    logSettingsChange: (category: SettingsCategory, action: string, details: any) => void;
    notifySuccess: (title: string, message: string) => void;
    notifyError: (title: string, message: string) => void;
    getCurrentUser: () => string;
    getSessionId: () => string;
    updateCustomCSS: (css: string) => void;
}

// Объединенный интерфейс хранилища
export type SettingsStore = SettingsState & SettingsActions;

// ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====

// Генерация ID
const generateId = (prefix: string): string => {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Валидация email
const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Начальное состояние
const initialState: SettingsState = {
    userProfile: {
        full_name: '',
        email: '',
        timezone: 'Europe/Moscow',
        language: 'ru',
        date_format: 'DD.MM.YYYY',
        time_format: '24h',
        default_scan_profile: 'balanced',
        roles: [],
        permissions: [],
        preferences: {
            email_notifications: true,
            push_notifications: true,
            desktop_notifications: true,
            sound_notifications: true,
            show_tooltips: true,
            show_welcome_screen: true,
            auto_refresh_enabled: true,
            auto_refresh_interval: 30000,
            auto_start_validation: true,
            show_advanced_options: false,
            remember_scan_settings: true,
            default_report_format: 'html',
            auto_download_reports: false,
            auto_logout_enabled: true,
            auto_logout_timeout: 3600,
            collect_usage_stats: true,
            share_anonymous_data: false
        },
        created_at: '',
        updated_at: '',
        login_count: 0
    },

    securitySettings: {
        totp_enabled: false,
        session_lifetime: 3600,
        remember_me_enabled: true,
        auto_logout_enabled: true,
        auto_logout_timeout: 3600,
        ip_whitelist_enabled: false,
        allowed_ip_ranges: [],
        password_policy: {
            min_length: 8,
            require_uppercase: true,
            require_lowercase: true,
            require_numbers: true,
            require_special_chars: true,
            password_history_count: 5,
            max_age_days: 90
        },
        api_keys: [],
        active_sessions: [],
        security_events: [],
        require_approval_for_changes: false,
        encryption_enabled: true,
        secure_headers_enabled: true,
        failed_login_threshold: 5,
        lockout_duration: 1800,
        notify_on_login: true,
        notify_on_password_change: true,
        notify_on_suspicious_activity: true
    },

    scanningSettings: {
        default_timeout: 30000,
        max_concurrent_scans: 5,
        default_ports: 'common',
        timing_template: '3',
        scan_policies: [],
        enabled_modules: ['nmap', 'nikto', 'openvas'],
        custom_scripts: [],
        resource_limits: {
            max_cpu_percent: 80,
            max_memory_mb: 2048,
            max_network_mbps: 100,
            max_parallel_hosts: 50,
            scan_rate_limit: 1000
        },
        auto_schedule_enabled: false,
        auto_retry_failed: true,
        auto_cleanup_old_scans: true,
        strict_target_validation: true,
        allow_private_ranges: true,
        blacklisted_ranges: [],
        notify_on_completion: true,
        notify_on_critical_findings: true,
        webhook_on_completion: false,
        cache_scan_results: true,
        cache_duration_hours: 24,
        auto_archive_completed: true,
        archive_after_days: 30
    },

    notificationSettings: {
        enabled: true,
        quiet_hours: {
            enabled: false,
            start_time: '22:00',
            end_time: '08:00',
            timezone: 'Europe/Moscow',
            days_of_week: [1, 2, 3, 4, 5],
            emergency_override: true
        },
        channels: [],
        rules: [],
        templates: [],
        group_similar: true,
        group_timeout_minutes: 5,
        priority_filters: [],
        rate_limiting: {
            enabled: true,
            max_per_minute: 10,
            max_per_hour: 100,
            max_per_day: 1000,
            burst_limit: 20
        },
        escalation_rules: []
    },

    integrationSettings: {
        siem_integrations: [],
        ticketing_systems: [],
        cloud_services: [],
        vuln_management: [],
        threat_intel: [],
        api_integrations: [],
        middleware_config: {
            request_timeout: 30000,
            retry_attempts: 3,
            circuit_breaker_enabled: true,
            rate_limit_per_minute: 100,
            logging_level: 'info'
        }
    },

    reportSettings: {
        default_formats: ['html', 'pdf'],
        auto_generate: true,
        templates: [],
        scheduled_reports: [],
        storage_settings: {
            local_storage_path: '/var/lib/ip-roast/reports',
            cloud_storage_enabled: false,
            compression_enabled: true,
            encryption_enabled: true,
            max_file_size_mb: 100
        },
        branding: {
            company_name: 'IP Roast Enterprise',
            primary_color: '#2563eb',
            secondary_color: '#6b7280',
            font_family: 'Inter, sans-serif',
            watermark_enabled: false
        },
        distribution_lists: [],
        archive_settings: {
            enabled: true,
            archive_after_days: 90,
            compression_level: 'medium',
            delete_after_archive: false,
            archive_location: '/var/lib/ip-roast/archive'
        }
    },

    appearanceSettings: {
        theme: 'dark',
        custom_themes: [],
        accent_color: 'blue',
        custom_colors: {
            primary: '#2563eb',
            secondary: '#6b7280',
            success: '#16a34a',
            warning: '#ea580c',
            error: '#dc2626',
            info: '#0891b2',
            background: '#111827',
            surface: '#1f2937',
            text_primary: '#f9fafb',
            text_secondary: '#d1d5db'
        },
        ui_size: 'medium',
        font_size: 14,
        line_height: 1.5,
        sidebar_collapsed: false,
        show_sidebar: true,
        compact_mode: false,
        high_contrast: false,
        reduced_motion: false,
        screen_reader_mode: false,
        language: 'ru',
        rtl_enabled: false,
        animations_enabled: true,
        transition_duration: 300
    },

    scheduleSettings: {
        auto_scans: [],
        system_updates: {
            auto_update_enabled: false,
            update_channel: 'stable',
            schedule: {
                type: 'weekly',
                days_of_week: [0],
                time: '02:00',
                timezone: 'Europe/Moscow'
            },
            backup_before_update: true,
            rollback_on_failure: true,
            notification_settings: {
                notify_before_update: true,
                notify_after_update: true,
                notification_channels: ['email']
            }
        },
        cleanup_tasks: [],
        backup_schedule: {
            enabled: true,
            schedule: {
                type: 'daily',
                time: '03:00',
                timezone: 'Europe/Moscow'
            },
            backup_types: [{
                type: 'incremental',
                includes: ['database', 'settings', 'reports'],
                excludes: ['logs', 'temp']
            }],
            storage_location: '/var/backup/ip-roast',
            compression_enabled: true,
            encryption_enabled: true,
            retention_days: 30,
            verify_backup: true
        },
        health_checks: [],
        report_generation: {
            enabled: true,
            schedule: {
                type: 'daily',
                time: '06:00',
                timezone: 'Europe/Moscow'
            },
            report_types: ['daily_summary'],
            output_formats: ['html', 'pdf'],
            distribution_lists: [],
            cleanup_old_reports: true,
            retention_days: 90
        },
        maintenance_windows: []
    },

    backupSettings: {
        auto_backup: {
            enabled: true,
            schedule: {
                type: 'daily',
                time: '03:00',
                timezone: 'Europe/Moscow'
            },
            backup_scope: {
                include_database: true,
                include_files: true,
                include_settings: true,
                include_reports: false,
                include_logs: false,
                custom_paths: [],
                exclude_patterns: ['*.tmp', '*.log']
            },
            retention_policy: {
                daily_backups: 7,
                weekly_backups: 4,
                monthly_backups: 12,
                yearly_backups: 5,
                max_total_backups: 100
            },
            notification_settings: {
                notify_on_success: false,
                notify_on_failure: true,
                notification_channels: ['email'],
                include_statistics: true
            }
        },
        manual_backups: [],
        restore_settings: {
            allow_partial_restore: true,
            backup_before_restore: true,
            verify_before_restore: true,
            notification_settings: {
                notify_on_start: true,
                notify_on_completion: true,
                notify_on_failure: true,
                notification_channels: ['email']
            },
            rollback_settings: {
                enabled: true,
                auto_rollback_on_failure: true,
                rollback_timeout_minutes: 30,
                keep_rollback_point: true
            }
        },
        export_import: {
            export_formats: ['json', 'xml'],
            include_sensitive_data: false,
            encryption_enabled: true,
            compression_level: 'medium',
            split_large_files: true,
            max_file_size_mb: 100
        },
        cloud_storage: {
            enabled: false,
            provider: 'aws_s3',
            configuration: {},
            sync_settings: {
                auto_sync: false,
                sync_interval_hours: 24,
                retry_failed_uploads: true,
                verify_uploads: true
            },
            security_settings: {
                encryption_enabled: true,
                access_logging: true,
                ip_restrictions: [],
                require_mfa: false
            }
        },
        backup_validation: {
            enabled: true,
            validation_schedule: {
                type: 'weekly',
                days_of_week: [0],
                time: '04:00',
                timezone: 'Europe/Moscow'
            },
            integrity_checks: [{
                type: 'checksum',
                parameters: {},
                critical: true
            }],
            test_restore: false,
            notification_on_failure: true
        }
    },

    auditSettings: {
        audit_config: {
            enabled: true,
            audit_all_actions: false,
            audit_levels: [{
                category: 'security',
                level: 'full',
                events: ['login', 'logout', 'password_change', 'permission_change'],
                custom_fields: []
            }],
            retention_days: 365,
            real_time_monitoring: true,
            anonymize_sensitive_data: true,
            include_request_bodies: false,
            include_response_bodies: false
        },
        logging_settings: {
            log_level: 'info',
            structured_logging: true,
            log_rotation: {
                enabled: true,
                max_file_size_mb: 100,
                max_files_count: 10,
                compress_old_files: true,
                delete_old_files_days: 30
            },
            remote_logging: [],
            log_enrichment: {
                include_user_context: true,
                include_session_info: true,
                include_request_id: true,
                include_geo_location: false,
                custom_fields: {}
            }
        },
        compliance_settings: {
            enabled_frameworks: [],
            automatic_reporting: false,
            evidence_collection: {
                automatic_collection: true,
                storage_location: '/var/lib/ip-roast/evidence',
                encryption_enabled: true,
                retention_years: 7,
                digital_signatures: false
            },
            policy_enforcement: {
                strict_mode: false,
                auto_remediation: false,
                violation_notifications: true,
                escalation_enabled: true,
                grace_period_hours: 24
            },
            assessment_schedule: {
                type: 'quarterly',
                time: '09:00',
                timezone: 'Europe/Moscow'
            }
        },
        analytics_settings: {
            enabled: true,
            data_collection: {
                collect_usage_stats: true,
                collect_performance_metrics: true,
                collect_error_reports: true,
                collect_user_behavior: false,
                sampling_rate: 0.1,
                data_retention_days: 90
            },
            reporting: {
                automated_reports: true,
                report_frequency: 'monthly',
                report_recipients: [],
                include_recommendations: true,
                trend_analysis: true
            },
            privacy_settings: {
                anonymize_user_data: true,
                anonymize_ip_addresses: true,
                respect_do_not_track: true,
                cookie_consent_required: false,
                data_processing_consent: false
            },
            dashboard_config: {
                default_widgets: [],
                custom_widgets: [],
                refresh_interval_seconds: 60,
                auto_refresh_enabled: true,
                theme: 'dark'
            }
        },
        monitoring_settings: {
            system_monitoring: {
                enabled: true,
                metrics: [],
                alert_thresholds: [],
                collection_interval_seconds: 60,
                retention_days: 30
            },
            application_monitoring: {
                enabled: true,
                trace_sampling_rate: 0.1,
                error_tracking: true,
                performance_tracking: true,
                user_session_tracking: false,
                custom_events: []
            },
            network_monitoring: {
                enabled: false,
                monitor_bandwidth: true,
                monitor_latency: true,
                monitor_packet_loss: true,
                endpoints: [],
                alert_conditions: []
            },
            security_monitoring: {
                enabled: true,
                intrusion_detection: true,
                anomaly_detection: true,
                threat_detection: true,
                behavioral_analysis: false,
                security_rules: []
            },
            performance_monitoring: {
                enabled: true,
                apm_enabled: false,
                profiling_enabled: false,
                metrics: [],
                sampling_rate: 0.1,
                retention_days: 30
            }
        },
        alert_settings: {
            global_settings: {
                enabled: true,
                default_severity: 'medium',
                group_similar_alerts: true,
                alert_timeout_minutes: 60,
                auto_resolve_alerts: true,
                require_acknowledgment: false
            },
            alert_rules: [],
            notification_channels: [],
            escalation_policies: [],
            maintenance_mode: {
                enabled: false,
                suppress_all_alerts: true,
                allowed_severities: ['critical'],
                notification_message: 'Система находится в режиме обслуживания'
            }
        }
    },

    currentCategory: 'profile',
    isLoading: false,
    isSaving: false,
    hasUnsavedChanges: false,
    validationErrors: {},
    originalValues: {},
    lastSaved: '',
    saveInProgress: false,
    dataVersions: {}
};

// ===== ZUSTAND ХРАНИЛИЩЕ =====

export const useSettingsStore = create<SettingsStore>()(
    persist(
        subscribeWithSelector((set, get) => ({
            ...initialState,

            // Основные действия
            loadSettings: async (category?: SettingsCategory) => {
                try {
                    set({ isLoading: true });

                    if (category) {
                        await get().loadCategorySettings(category);
                    } else {
                        // Загружаем все категории
                        const categories: SettingsCategory[] = [
                            'profile', 'security', 'scanning', 'notifications', 'integrations',
                            'reports', 'appearance', 'schedule', 'backup', 'audit'
                        ];

                        await Promise.all(
                            categories.map(cat => get().loadCategorySettings(cat))
                        );
                    }

                    // Сохраняем оригинальные значения
                    get().saveOriginalValues();
                    set({ hasUnsavedChanges: false });
                } catch (error) {
                    console.error('Ошибка загрузки настроек:', error);
                    throw error;
                } finally {
                    set({ isLoading: false });
                }
            },

            loadCategorySettings: async (category: SettingsCategory) => {
                try {
                    // Симуляция API вызова
                    await new Promise(resolve => setTimeout(resolve, 500));

                    // В реальном проекте здесь был бы API запрос
                    const response = await fetch(`/api/settings/${category}`);
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }

                    const data = await response.json();
                    get().updateCategoryFromResponse(category, data);
                } catch (error) {
                    // Fallback - используем начальные значения
                    console.warn(`Не удалось загрузить настройки ${category}, используются значения по умолчанию`);
                }
            },

            saveSettings: async (category?: SettingsCategory) => {
                try {
                    set({ isSaving: true, saveInProgress: true });

                    // Валидация перед сохранением
                    if (!get().validateSettings(category)) {
                        throw new Error('Настройки содержат ошибки валидации');
                    }

                    if (category) {
                        await get().saveCategorySettings(category);
                    } else {
                        // Сохраняем все измененные категории
                        const categories: SettingsCategory[] = [
                            'profile', 'security', 'scanning', 'notifications', 'integrations',
                            'reports', 'appearance', 'schedule', 'backup', 'audit'
                        ];

                        for (const cat of categories) {
                            if (get().hasChangesInCategory(cat)) {
                                await get().saveCategorySettings(cat);
                            }
                        }
                    }

                    // Обновляем оригинальные значения
                    get().saveOriginalValues();
                    set({
                        hasUnsavedChanges: false,
                        lastSaved: new Date().toISOString()
                    });
                } catch (error) {
                    console.error('Ошибка сохранения настроек:', error);
                    throw error;
                } finally {
                    set({ isSaving: false, saveInProgress: false });
                }
            },

            saveCategorySettings: async (category: SettingsCategory) => {
                try {
                    const data = get().getCategoryData(category);

                    // Валидация данных перед отправкой
                    const validationResult = get().validateCategoryData(category, data);
                    if (!validationResult.isValid) {
                        throw new Error(`Validation failed: ${validationResult.errors.join(', ')}`);
                    }

                    // Подготовка данных для отправки
                    const payload = {
                        category,
                        data: get().sanitizeDataForAPI(data),
                        timestamp: new Date().toISOString(),
                        version: get().getDataVersion(category),
                        checksum: get().calculateChecksum(data)
                    };

                    // Попытка сохранения с retry логикой
                    let lastError: Error | null = null;
                    let attempt = 0;
                    const maxAttempts = 3;

                    while (attempt < maxAttempts) {
                        try {
                            attempt++;

                            // Симуляция задержки между попытками
                            if (attempt > 1) {
                                await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
                            }

                            const response = await fetch(`/api/settings/${category}`, {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${get().getAuthToken()}`,
                                    'X-Request-ID': get().generateRequestId(),
                                    'X-Client-Version': '3.0.0'
                                },
                                body: JSON.stringify(payload)
                            });

                            if (!response.ok) {
                                const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
                                // Обработка специфических ошибок
                                switch (response.status) {
                                    case 409:
                                        throw new Error(`Conflict: ${errorData.message}. Please refresh and try again.`);
                                    case 422:
                                        throw new Error(`Validation error: ${errorData.message}`);
                                    case 403:
                                        throw new Error('Insufficient permissions to save settings');
                                    case 429:
                                        throw new Error('Rate limit exceeded. Please try again later.');
                                    default:
                                        throw new Error(`HTTP ${response.status}: ${errorData.message || response.statusText}`);
                                }
                            }

                            const result = await response.json();

                            // Обновляем локальное состояние из ответа сервера
                            get().updateCategoryFromResponse(category, result.data || result);

                            // Обновляем версию данных
                            get().updateDataVersion(category, result.version);

                            // Логируем успешное сохранение
                            get().logSettingsChange(category, 'saved', {
                                attempt,
                                responseTime: Date.now() - new Date(payload.timestamp).getTime(),
                                dataSize: JSON.stringify(payload).length
                            });

                            // Отправляем уведомление об успешном сохранении
                            get().notifySuccess(
                                'Настройки сохранены',
                                `Настройки категории "${get().getCategoryDisplayName(category)}" успешно сохранены`
                            );

                            // Выходим из цикла retry при успешном сохранении
                            break;
                        } catch (error) {
                            lastError = error as Error;

                            // Логируем неудачную попытку
                            get().logSettingsChange(category, 'save_failed', {
                                attempt,
                                error: lastError.message,
                                willRetry: attempt < maxAttempts
                            });

                            // Если это последняя попытка, прерываем цикл
                            if (attempt === maxAttempts) {
                                break;
                            }

                            // Проверяем, стоит ли повторять попытку
                            if (get().shouldRetryError(lastError)) {
                                continue;
                            } else {
                                // Для некоторых ошибок нет смысла повторять
                                break;
                            }
                        }
                    }

                    // Если все попытки неудачны, бросаем последнюю ошибку
                    if (lastError) {
                        get().notifyError(
                            'Ошибка сохранения',
                            `Не удалось сохранить настройки: ${lastError.message}`
                        );
                        throw lastError;
                    }
                } catch (error) {
                    console.error(`❌ Ошибка сохранения настроек категории ${category}:`, error);

                    // Обновляем состояние ошибки
                    set((state) => ({
                        validationErrors: {
                            ...state.validationErrors,
                            [category]: [(error as Error).message]
                        }
                    }));

                    // Логируем критическую ошибку
                    get().logSettingsChange(category, 'save_error', {
                        error: (error as Error).message,
                        stack: (error as Error).stack
                    });

                    throw error;
                }
            },

            resetToDefaults: async (category: SettingsCategory) => {
                try {
                    const response = await fetch(`/api/settings/${category}/defaults`);
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }

                    const defaults = await response.json();
                    get().updateCategoryFromResponse(category, defaults);
                    set({ hasUnsavedChanges: true });

                    console.log(`✅ Настройки категории ${category} сброшены к значениям по умолчанию`);
                } catch (error) {
                    console.error(`❌ Ошибка сброса настроек категории ${category}:`, error);
                    throw error;
                }
            },

            validateSettings: (category?: SettingsCategory) => {
                set({ validationErrors: {} });

                if (category) {
                    get().validateCategory(category);
                } else {
                    // Валидируем все категории
                    const categories: SettingsCategory[] = [
                        'profile', 'security', 'scanning', 'notifications', 'integrations',
                        'reports', 'appearance', 'schedule', 'backup', 'audit'
                    ];
                    categories.forEach(cat => get().validateCategory(cat));
                }

                return Object.keys(get().validationErrors).length === 0;
            },

            exportSettings: async (
                categories: SettingsCategory[] = ['profile', 'security', 'scanning', 'notifications', 'integrations', 'reports', 'appearance', 'schedule', 'backup', 'audit'],
                format: 'json' | 'yaml' = 'json'
            ) => {
                try {
                    const exportData: Record<string, any> = {};

                    categories.forEach(category => {
                        exportData[category] = get().getCategoryData(category);
                    });

                    // Добавляем метаданные
                    exportData._metadata = {
                        export_date: new Date().toISOString(),
                        export_version: '3.0',
                        categories_included: categories,
                        user: get().getCurrentUser()
                    };

                    let content: string;
                    let mimeType: string;

                    if (format === 'json') {
                        content = JSON.stringify(exportData, null, 2);
                        mimeType = 'application/json';
                    } else {
                        // YAML экспорт (fallback to JSON)
                        content = JSON.stringify(exportData, null, 2);
                        mimeType = 'application/x-yaml';
                    }

                    return new Blob([content], { type: mimeType });
                } catch (error) {
                    console.error('❌ Ошибка экспорта настроек:', error);
                    throw error;
                }
            },

            importSettings: async (file: File, mergeStrategy: 'replace' | 'merge' = 'merge') => {
                try {
                    const content = await file.text();
                    const importData = JSON.parse(content);

                    // Валидация импортируемых данных
                    if (!importData._metadata) {
                        throw new Error('Файл не содержит метаданных экспорта');
                    }

                    const categories = importData._metadata.categories_included || [];

                    for (const category of categories) {
                        if (importData[category]) {
                            if (mergeStrategy === 'replace') {
                                get().updateCategoryFromResponse(category, importData[category]);
                            } else {
                                // Merge strategy
                                const currentData = get().getCategoryData(category);
                                const mergedData = { ...currentData, ...importData[category] };
                                get().updateCategoryFromResponse(category, mergedData);
                            }
                        }
                    }

                    set({ hasUnsavedChanges: true });
                    console.log('✅ Настройки импортированы успешно');
                } catch (error) {
                    console.error('❌ Ошибка импорта настроек:', error);
                    throw error;
                }
            },

            applyAppearanceSettings: () => {
                const settings = get().appearanceSettings;

                // Применяем тему
                document.documentElement.setAttribute('data-theme', settings.theme);

                // Применяем акцентный цвет
                document.documentElement.setAttribute('data-accent', settings.accent_color);

                // Применяем размер UI
                document.documentElement.setAttribute('data-size', settings.ui_size);

                // Применяем кастомные CSS переменные
                const root = document.documentElement;
                root.style.setProperty('--font-size-base', `${settings.font_size}px`);
                root.style.setProperty('--line-height-base', settings.line_height.toString());

                // Применяем кастомные цвета
                Object.entries(settings.custom_colors).forEach(([key, value]) => {
                    root.style.setProperty(`--color-${key.replace('_', '-')}`, value);
                });

                // Применяем настройки доступности
                document.body.classList.toggle('high-contrast', settings.high_contrast);
                document.body.classList.toggle('reduced-motion', settings.reduced_motion);

                // Применяем кастомный CSS
                if (settings.custom_css) {
                    get().updateCustomCSS(settings.custom_css);
                }

                console.log('✅ Настройки внешнего вида применены');
            },

            switchCategory: (category: SettingsCategory) => {
                set({ currentCategory: category });

                // Загружаем настройки категории если они еще не загружены
                if (!get().hasChangesInCategory(category)) {
                    get().loadCategorySettings(category).catch((error: any) => {
                        console.error(`Ошибка загрузки категории ${category}:`, error);
                    });
                }
            },

            discardChanges: (category?: SettingsCategory) => {
                if (category) {
                    // Восстанавливаем оригинальные значения для конкретной категории
                    const original = get().originalValues[category];
                    if (original) {
                        get().updateCategoryFromResponse(category, original);
                    }
                } else {
                    // Восстанавливаем все оригинальные значения
                    Object.entries(get().originalValues).forEach(([cat, data]) => {
                        get().updateCategoryFromResponse(cat as SettingsCategory, data);
                    });
                }

                set({ hasUnsavedChanges: false, validationErrors: {} });
            },

            getCategoryData: (category: SettingsCategory) => {
                const state = get();
                switch (category) {
                    case 'profile': return state.userProfile;
                    case 'security': return state.securitySettings;
                    case 'scanning': return state.scanningSettings;
                    case 'notifications': return state.notificationSettings;
                    case 'integrations': return state.integrationSettings;
                    case 'reports': return state.reportSettings;
                    case 'appearance': return state.appearanceSettings;
                    case 'schedule': return state.scheduleSettings;
                    case 'backup': return state.backupSettings;
                    case 'audit': return state.auditSettings;
                    default: return {};
                }
            },

            hasChangesInCategory: (category: SettingsCategory) => {
                const current = get().getCategoryData(category);
                const original = get().originalValues[category];
                return JSON.stringify(current) !== JSON.stringify(original);
            },

            saveState: () => {
                try {
                    const state = get();
                    const stateToSave = {
                        userProfile: state.userProfile,
                        securitySettings: state.securitySettings,
                        scanningSettings: state.scanningSettings,
                        notificationSettings: state.notificationSettings,
                        integrationSettings: state.integrationSettings,
                        reportSettings: state.reportSettings,
                        appearanceSettings: state.appearanceSettings,
                        scheduleSettings: state.scheduleSettings,
                        backupSettings: state.backupSettings,
                        auditSettings: state.auditSettings,
                        lastSaved: state.lastSaved
                    };
                    localStorage.setItem('ip-roast-settings-state', JSON.stringify(stateToSave));
                } catch (error) {
                    console.error('❌ Ошибка сохранения состояния настроек:', error);
                }
            },

            loadState: () => {
                try {
                    const savedState = localStorage.getItem('ip-roast-settings-state');
                    if (!savedState) return;

                    const state = JSON.parse(savedState);
                    set((currentState) => ({
                        userProfile: state.userProfile ? { ...currentState.userProfile, ...state.userProfile } : currentState.userProfile,
                        securitySettings: state.securitySettings ? { ...currentState.securitySettings, ...state.securitySettings } : currentState.securitySettings,
                        scanningSettings: state.scanningSettings ? { ...currentState.scanningSettings, ...state.scanningSettings } : currentState.scanningSettings,
                        notificationSettings: state.notificationSettings ? { ...currentState.notificationSettings, ...state.notificationSettings } : currentState.notificationSettings,
                        integrationSettings: state.integrationSettings ? { ...currentState.integrationSettings, ...state.integrationSettings } : currentState.integrationSettings,
                        reportSettings: state.reportSettings ? { ...currentState.reportSettings, ...state.reportSettings } : currentState.reportSettings,
                        appearanceSettings: state.appearanceSettings ? { ...currentState.appearanceSettings, ...state.appearanceSettings } : currentState.appearanceSettings,
                        scheduleSettings: state.scheduleSettings ? { ...currentState.scheduleSettings, ...state.scheduleSettings } : currentState.scheduleSettings,
                        backupSettings: state.backupSettings ? { ...currentState.backupSettings, ...state.backupSettings } : currentState.backupSettings,
                        auditSettings: state.auditSettings ? { ...currentState.auditSettings, ...state.auditSettings } : currentState.auditSettings,
                        lastSaved: state.lastSaved || currentState.lastSaved
                    }));
                } catch (error) {
                    console.error('❌ Ошибка загрузки состояния настроек:', error);
                }
            },

            initialize: () => {
                const store = get();
                store.loadState();
                store.applyAppearanceSettings();
            },

            // Приватные методы для внутреннего использования
            validateCategoryData: (category: SettingsCategory, data: any) => {
                const errors: string[] = [];

                switch (category) {
                    case 'profile':
                        if (!data.full_name?.trim()) errors.push('Full name is required');
                        if (!data.email?.trim()) errors.push('Email is required');
                        if (data.email && !isValidEmail(data.email)) errors.push('Invalid email format');
                        break;
                    case 'security':
                        if (data.session_lifetime < 300) errors.push('Session lifetime must be at least 5 minutes');
                        if (data.password_policy?.min_length < 6) errors.push('Password min length must be at least 6');
                        if (data.api_keys?.length > 50) errors.push('Too many API keys (max 50)');
                        break;
                    case 'scanning':
                        if (data.default_timeout < 1000) errors.push('Default timeout must be at least 1000ms');
                        if (data.max_concurrent_scans < 1) errors.push('Max concurrent scans must be at least 1');
                        if (data.resource_limits?.max_cpu_percent > 100) errors.push('CPU limit cannot exceed 100%');
                        break;
                    case 'notifications':
                        if (data.channels?.length === 0) errors.push('At least one notification channel required');
                        data.channels?.forEach((channel: any, index: number) => {
                            if (!channel.name?.trim()) errors.push(`Channel ${index + 1} name is required`);
                            if (channel.type === 'email' && !channel.configuration?.smtp_server) {
                                errors.push(`SMTP server required for email channel "${channel.name}"`);
                            }
                        });
                        break;
                    case 'integrations':
                        data.siem_integrations?.forEach((integration: any, index: number) => {
                            if (!integration.configuration?.endpoint) {
                                errors.push(`SIEM integration ${index + 1} endpoint is required`);
                            }
                        });
                        break;
                    case 'reports':
                        if (data.storage_settings?.max_file_size_mb < 1) {
                            errors.push('Max file size must be at least 1MB');
                        }
                        if (data.scheduled_reports?.length > 100) {
                            errors.push('Too many scheduled reports (max 100)');
                        }
                        break;
                    case 'appearance':
                        if (data.font_size < 8 || data.font_size > 32) {
                            errors.push('Font size must be between 8 and 32');
                        }
                        if (data.line_height < 1 || data.line_height > 3) {
                            errors.push('Line height must be between 1 and 3');
                        }
                        break;
                    case 'schedule':
                        data.auto_scans?.forEach((scan: any, index: number) => {
                            if (!scan.name?.trim()) errors.push(`Auto scan ${index + 1} name is required`);
                            if (!scan.targets?.length) errors.push(`Auto scan "${scan.name}" must have targets`);
                        });
                        break;
                    case 'backup':
                        if (data.auto_backup?.retention_policy?.daily_backups < 1) {
                            errors.push('Daily backups retention must be at least 1');
                        }
                        if (data.cloud_storage?.enabled && !data.cloud_storage?.configuration?.endpoint) {
                            errors.push('Cloud storage endpoint required when enabled');
                        }
                        break;
                    case 'audit':
                        if (data.audit_config?.retention_days < 1) {
                            errors.push('Audit retention must be at least 1 day');
                        }
                        if (data.logging_settings?.log_level &&
                            !['debug', 'info', 'warn', 'error', 'fatal'].includes(data.logging_settings.log_level)) {
                            errors.push('Invalid log level');
                        }
                        break;
                }

                return {
                    isValid: errors.length === 0,
                    errors
                };
            },

            validateCategory: (category: SettingsCategory) => {
                const data = get().getCategoryData(category);
                const validation = get().validateCategoryData(category, data);

                if (!validation.isValid) {
                    set((state) => ({
                        validationErrors: {
                            ...state.validationErrors,
                            [category]: validation.errors
                        }
                    }));
                }
            },

            sanitizeDataForAPI: (data: any) => {
                // Удаляем чувствительные данные и временные поля
                const sanitized = JSON.parse(JSON.stringify(data));

                // Рекурсивно удаляем поля с паролями и токенами
                const removeSecrets = (obj: any): any => {
                    if (typeof obj !== 'object' || obj === null) return obj;

                    Object.keys(obj).forEach(key => {
                        if (typeof obj[key] === 'string' &&
                            (key.toLowerCase().includes('password') ||
                                key.toLowerCase().includes('secret') ||
                                key.toLowerCase().includes('token'))) {
                            obj[key] = '[REDACTED]';
                        } else if (typeof obj[key] === 'object') {
                            removeSecrets(obj[key]);
                        }
                    });
                    return obj;
                };

                return removeSecrets(sanitized);
            },

            calculateChecksum: (data: any) => {
                // Простой checksum для проверки целостности данных
                const str = JSON.stringify(data);
                let hash = 0;
                for (let i = 0; i < str.length; i++) {
                    const char = str.charCodeAt(i);
                    hash = ((hash << 5) - hash) + char;
                    hash = hash & hash; // Convert to 32-bit integer
                }
                return hash.toString(16);
            },

            getDataVersion: (category: SettingsCategory) => {
                const state = get();
                return state.dataVersions[category] || 1;
            },

            updateDataVersion: (category: SettingsCategory, version: number) => {
                set((state) => ({
                    dataVersions: {
                        ...state.dataVersions,
                        [category]: version
                    }
                }));
            },

            getAuthToken: () => {
                return localStorage.getItem('auth_token') || '';
            },

            generateRequestId: () => {
                return generateId('req');
            },

            shouldRetryError: (error: Error) => {
                // Определяем, стоит ли повторять запрос при данной ошибке
                const retryableErrors = [
                    'Network error',
                    'timeout',
                    'Rate limit exceeded',
                    'Server temporarily unavailable'
                ];

                return retryableErrors.some(pattern =>
                    error.message.toLowerCase().includes(pattern.toLowerCase())
                );
            },

            getCategoryDisplayName: (category: SettingsCategory) => {
                const displayNames = {
                    profile: 'Профиль',
                    security: 'Безопасность',
                    scanning: 'Сканирование',
                    notifications: 'Уведомления',
                    integrations: 'Интеграции',
                    reports: 'Отчеты',
                    appearance: 'Внешний вид',
                    schedule: 'Расписание',
                    backup: 'Резервное копирование',
                    audit: 'Аудит'
                };
                return displayNames[category] || category;
            },

            logSettingsChange: (category: SettingsCategory, action: string, details: any) => {
                const logEntry = {
                    timestamp: new Date().toISOString(),
                    category,
                    action,
                    details,
                    user: get().getCurrentUser(),
                    session: get().getSessionId()
                };

                console.log(`[Settings] ${action}:`, logEntry);

                // В реальном приложении здесь была бы отправка в систему логирования
                try {
                    fetch('/api/audit/log', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(logEntry)
                    }).catch(error => {
                        console.warn('Failed to send audit log:', error);
                    });
                } catch (error) {
                    console.warn('Failed to create audit log:', error);
                }
            },

            notifySuccess: (title: string, message: string) => {
                // Интеграция с системой уведомлений
                if (typeof window !== 'undefined' && (window as any).showNotification) {
                    (window as any).showNotification({
                        type: 'success',
                        title,
                        message,
                        duration: 3000
                    });
                }
            },

            notifyError: (title: string, message: string) => {
                // Интеграция с системой уведомлений
                if (typeof window !== 'undefined' && (window as any).showNotification) {
                    (window as any).showNotification({
                        type: 'error',
                        title,
                        message,
                        duration: 5000,
                        persistent: true
                    });
                }
            },

            getCurrentUser: () => {
                const state = get();
                return state.userProfile?.full_name || 'Unknown';
            },

            getSessionId: () => {
                return sessionStorage.getItem('session_id') || 'unknown';
            },

            updateCategoryFromResponse: (category: SettingsCategory, data: any) => {
                set((state) => {
                    const updates: any = {};

                    switch (category) {
                        case 'profile':
                            updates.userProfile = { ...state.userProfile, ...data };
                            break;
                        case 'security':
                            updates.securitySettings = { ...state.securitySettings, ...data };
                            break;
                        case 'scanning':
                            updates.scanningSettings = { ...state.scanningSettings, ...data };
                            break;
                        case 'notifications':
                            updates.notificationSettings = { ...state.notificationSettings, ...data };
                            break;
                        case 'integrations':
                            updates.integrationSettings = { ...state.integrationSettings, ...data };
                            break;
                        case 'reports':
                            updates.reportSettings = { ...state.reportSettings, ...data };
                            break;
                        case 'appearance':
                            updates.appearanceSettings = { ...state.appearanceSettings, ...data };
                            break;
                        case 'schedule':
                            updates.scheduleSettings = { ...state.scheduleSettings, ...data };
                            break;
                        case 'backup':
                            updates.backupSettings = { ...state.backupSettings, ...data };
                            break;
                        case 'audit':
                            updates.auditSettings = { ...state.auditSettings, ...data };
                            break;
                    }

                    return { ...state, ...updates };
                });

                // Применяем настройки внешнего вида если обновилась эта категория
                if (category === 'appearance') {
                    setTimeout(() => {
                        get().applyAppearanceSettings();
                    }, 0);
                }
            },

            saveOriginalValues: () => {
                const state = get();
                set({
                    originalValues: {
                        profile: JSON.parse(JSON.stringify(state.userProfile)),
                        security: JSON.parse(JSON.stringify(state.securitySettings)),
                        scanning: JSON.parse(JSON.stringify(state.scanningSettings)),
                        notifications: JSON.parse(JSON.stringify(state.notificationSettings)),
                        integrations: JSON.parse(JSON.stringify(state.integrationSettings)),
                        reports: JSON.parse(JSON.stringify(state.reportSettings)),
                        appearance: JSON.parse(JSON.stringify(state.appearanceSettings)),
                        schedule: JSON.parse(JSON.stringify(state.scheduleSettings)),
                        backup: JSON.parse(JSON.stringify(state.backupSettings)),
                        audit: JSON.parse(JSON.stringify(state.auditSettings))
                    }
                });
            },

            updateCustomCSS: (css: string) => {
                let styleElement = document.getElementById('custom-settings-css');
                if (!styleElement) {
                    styleElement = document.createElement('style');
                    styleElement.id = 'custom-settings-css';
                    document.head.appendChild(styleElement);
                }
                styleElement.textContent = css;
            }
        })),
        {
            name: 'ip-roast-settings-store',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                userProfile: state.userProfile,
                securitySettings: state.securitySettings,
                scanningSettings: state.scanningSettings,
                notificationSettings: state.notificationSettings,
                integrationSettings: state.integrationSettings,
                reportSettings: state.reportSettings,
                appearanceSettings: state.appearanceSettings,
                scheduleSettings: state.scheduleSettings,
                backupSettings: state.backupSettings,
                auditSettings: state.auditSettings,
                lastSaved: state.lastSaved
            })
        }
    )
);

// ===== REACT CONTEXT И PROVIDER =====

export interface SettingsContextType {
    store: SettingsStore;
    isLoading: boolean;
    isSaving: boolean;
    hasUnsavedChanges: boolean;
    validationErrors: Record<string, string[]>;
    currentCategory: SettingsCategory;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export interface SettingsProviderProps {
    children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
    const store = useSettingsStore();

    // Инициализация при монтировании
    useEffect(() => {
        store.initialize();
    }, []);

    const contextValue: SettingsContextType = {
        store,
        isLoading: store.isLoading,
        isSaving: store.isSaving,
        hasUnsavedChanges: store.hasUnsavedChanges,
        validationErrors: store.validationErrors,
        currentCategory: store.currentCategory
    };

    return (
        <SettingsContext.Provider value={contextValue}>
            {children}
        </SettingsContext.Provider>
    );
};

// ===== CUSTOM HOOK =====

export const useSettings = (): SettingsContextType => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};

// ===== ЭКСПОРТ ПО УМОЛЧАНИЮ =====

export default useSettingsStore;
