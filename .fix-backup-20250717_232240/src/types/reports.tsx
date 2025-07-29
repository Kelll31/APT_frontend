/**
 * IP_Roast 4.0 Enterprise Reports Types
 * Типы для системы отчетности и аналитики
 */

import { ScanResult, Vulnerability, ScanSession } from './scanner';
import { NetworkDevice, NetworkSegment } from './network';

// =============================================================================
// ОСНОВНЫЕ ТИПЫ ОТЧЕТОВ
// =============================================================================

export type ReportType =
    | 'executive'        // Исполнительный отчет для руководства
    | 'technical'        // Технический отчет для IT-специалистов
    | 'compliance'       // Отчет по соответствию стандартам
    | 'vulnerability'    // Отчет по уязвимостям
    | 'network'          // Отчет по сетевой инфраструктуре
    | 'security'         // Отчет по безопасности
    | 'trend'            // Трендовый отчет
    | 'comparison'       // Сравнительный отчет
    | 'audit'            // Аудиторский отчет
    | 'custom';          // Пользовательский отчет

export type ReportFormat =
    | 'pdf'              // PDF документ
    | 'html'             // HTML страница
    | 'docx'             // Microsoft Word
    | 'xlsx'             // Microsoft Excel
    | 'pptx'             // Microsoft PowerPoint
    | 'json'             // JSON данные
    | 'csv'              // CSV таблица
    | 'xml'              // XML документ
    | 'txt'              // Текстовый файл
    | 'rtf';             // Rich Text Format

export type ReportStatus =
    | 'draft'            // Черновик
    | 'generating'       // Генерируется
    | 'ready'            // Готов
    | 'scheduled'        // Запланирован
    | 'failed'           // Ошибка генерации
    | 'expired'          // Истек срок действия
    | 'archived';        // Архивирован

export type ReportPriority = 'low' | 'medium' | 'high' | 'critical';

// =============================================================================
// ИНТЕРФЕЙСЫ ОТЧЕТОВ
// =============================================================================

export interface Report {
    id: string;
    name: string;
    description?: string;
    type: ReportType;
    format: ReportFormat;
    status: ReportStatus;
    priority: ReportPriority;

    // Метаданные
    createdAt: string;
    updatedAt: string;
    generatedAt?: string;
    expiresAt?: string;

    // Создатель и права доступа
    createdBy: string;
    modifiedBy?: string;
    sharedWith: string[];
    permissions: ReportPermission[];

    // Настройки
    config: ReportConfig;
    template: ReportTemplate;

    // Данные и результаты
    dataSource: ReportDataSource;
    content?: ReportContent;

    // Файлы и экспорт
    files: ReportFile[];
    downloadUrl?: string;
    thumbnailUrl?: string;

    // Планирование
    schedule?: ReportSchedule;

    // Статистика
    statistics: ReportStatistics;

    // Теги и категории
    tags: string[];
    category?: string;

    // Безопасность
    classified: boolean;
    encryptionLevel?: 'none' | 'standard' | 'high';
    watermark?: boolean;

    // Метаданные
    metadata: Record<string, any>;
}

export interface ReportConfig {
    // Основные настройки
    title: string;
    subtitle?: string;
    logo?: string;

    // Временной диапазон
    dateRange: {
        start: string;
        end: string;
        timezone?: string;
    };

    // Фильтры данных
    filters: ReportFilter[];

    // Разделы отчета
    sections: ReportSection[];

    // Форматирование
    formatting: ReportFormatting;

    // Настройки экспорта
    export: ReportExportSettings;

    // Локализация
    language: string;
    locale: string;

    // Брендинг
    branding: ReportBranding;

    // Безопасность
    security: ReportSecuritySettings;
}

export interface ReportTemplate {
    id: string;
    name: string;
    description: string;
    type: ReportType;
    version: string;

    // Автор и метаданные
    author: string;
    organization?: string;
    createdAt: string;
    updatedAt: string;

    // Настройки
    isBuiltIn: boolean;
    isPublic: boolean;
    category: string;
    tags: string[];

    // Структура
    layout: TemplateLayout;
    sections: TemplateSectionDefinition[];
    variables: TemplateVariable[];

    // Стили
    styles: TemplateStyles;

    // Требования
    requirements: TemplateRequirement[];

    // Статистика использования
    usageCount: number;
    rating?: number;
    reviews: TemplateReview[];

    // Совместимость
    compatibility: {
        minVersion: string;
        maxVersion?: string;
        supportedFormats: ReportFormat[];
    };
}

// =============================================================================
// ИСТОЧНИКИ ДАННЫХ
// =============================================================================

export interface ReportDataSource {
    type: 'scan' | 'multiple_scans' | 'network' | 'vulnerability' | 'custom' | 'api';

    // Основные источники
    scanIds?: string[];
    networkIds?: string[];
    vulnerabilityIds?: string[];

    // Временные фильтры
    timeRange?: {
        start: string;
        end: string;
        timezone?: string;
    };

    // Фильтры данных
    filters?: {
        hostFilters?: HostFilter[];
        portFilters?: PortFilter[];
        serviceFilters?: ServiceFilter[];
        vulnerabilityFilters?: VulnerabilityFilter[];
        networkFilters?: NetworkFilter[];
    };

    // Агрегация
    aggregation?: {
        groupBy: string[];
        metrics: string[];
        functions: AggregationFunction[];
    };

    // Внешние источники
    externalSources?: ExternalDataSource[];

    // Кэширование
    cache?: {
        enabled: boolean;
        ttl: number;
        key?: string;
    };
}

export interface HostFilter {
    field: 'ip' | 'hostname' | 'os' | 'status' | 'lastSeen';
    operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'regex' | 'in' | 'range';
    value: any;
    negate?: boolean;
}

export interface PortFilter {
    field: 'port' | 'protocol' | 'service' | 'state' | 'version';
    operator: 'equals' | 'contains' | 'in' | 'range' | 'regex';
    value: any;
    negate?: boolean;
}

export interface ServiceFilter {
    field: 'name' | 'version' | 'product' | 'cpe';
    operator: 'equals' | 'contains' | 'regex' | 'in';
    value: any;
    negate?: boolean;
}

export interface VulnerabilityFilter {
    field: 'severity' | 'cvss' | 'cve' | 'category' | 'status' | 'exploitable';
    operator: 'equals' | 'gte' | 'lte' | 'in' | 'contains';
    value: any;
    negate?: boolean;
}

export interface NetworkFilter {
    field: 'segment' | 'subnet' | 'vlan' | 'location';
    operator: 'equals' | 'contains' | 'in';
    value: any;
    negate?: boolean;
}

export interface AggregationFunction {
    field: string;
    function: 'count' | 'sum' | 'avg' | 'min' | 'max' | 'distinct' | 'percentile';
    params?: Record<string, any>;
}

export interface ExternalDataSource {
    id: string;
    type: 'api' | 'database' | 'file' | 'webhook';
    name: string;
    config: Record<string, any>;
    authentication?: {
        type: 'none' | 'api_key' | 'bearer' | 'basic' | 'oauth2';
        credentials: Record<string, any>;
    };
    mapping: DataMapping[];
}

export interface DataMapping {
    sourceField: string;
    targetField: string;
    transformation?: string;
    defaultValue?: any;
}

// =============================================================================
// СОДЕРЖИМОЕ ОТЧЕТА
// =============================================================================

export interface ReportContent {
    // Основная информация
    metadata: ReportMetadata;

    // Исполнительное резюме
    executiveSummary?: ExecutiveSummary;

    // Основные разделы
    sections: ReportSectionContent[];

    // Приложения
    appendices?: ReportAppendix[];

    // Заключение
    conclusion?: ReportConclusion;

    // Рекомендации
    recommendations?: ReportRecommendation[];

    // Глоссарий
    glossary?: GlossaryEntry[];
}

export interface ReportMetadata {
    title: string;
    subtitle?: string;
    author: string;
    organization: string;
    generatedAt: string;
    version: string;
    confidentiality: 'public' | 'internal' | 'confidential' | 'restricted';

    // Покрываемый период
    reportPeriod: {
        start: string;
        end: string;
        timezone: string;
    };

    // Область охвата
    scope: {
        networks: string[];
        hosts: number;
        services: number;
        scans: number;
    };

    // Статистика
    statistics: {
        totalPages: number;
        totalCharts: number;
        totalTables: number;
        dataPoints: number;
    };

    // Подписи и одобрения
    approvals?: ReportApproval[];

    // Дистрибуция
    distribution?: ReportDistribution[];
}

export interface ExecutiveSummary {
    overview: string;
    keyFindings: string[];
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    riskScore: number;
    trends: TrendIndicator[];
    recommendations: string[];
    nextSteps: string[];
}

export interface TrendIndicator {
    metric: string;
    current: number;
    previous: number;
    trend: 'up' | 'down' | 'stable';
    change: number;
    changePercent: number;
}

// =============================================================================
// РАЗДЕЛЫ ОТЧЕТА
// =============================================================================

export interface ReportSection {
    id: string;
    type: ReportSectionType;
    title: string;
    order: number;
    enabled: boolean;
    required?: boolean;
    config?: Record<string, any>;
}

export type ReportSectionType =
    | 'cover_page'           // Титульная страница
    | 'table_of_contents'    // Содержание
    | 'executive_summary'    // Исполнительное резюме
    | 'methodology'          // Методология
    | 'scope'                // Область охвата
    | 'findings'             // Результаты
    | 'vulnerabilities'      // Уязвимости
    | 'network_overview'     // Обзор сети
    | 'host_details'         // Детали хостов
    | 'service_analysis'     // Анализ сервисов
    | 'risk_assessment'      // Оценка рисков
    | 'compliance_status'    // Статус соответствия
    | 'trends'               // Тренды
    | 'recommendations'      // Рекомендации
    | 'action_plan'          // План действий
    | 'appendix'             // Приложение
    | 'glossary'             // Глоссарий
    | 'charts'               // Графики
    | 'tables'               // Таблицы
    | 'raw_data'             // Сырые данные
    | 'custom';              // Пользовательский

export interface ReportSectionContent {
    sectionId: string;
    title: string;
    content: SectionContentItem[];
    pageBreak?: boolean;
    conditional?: boolean;
    condition?: string;
}

export interface SectionContentItem {
    type: 'text' | 'chart' | 'table' | 'image' | 'list' | 'metrics' | 'map' | 'timeline';
    content: any;
    order: number;
    style?: Record<string, any>;
    responsive?: boolean;
}

// =============================================================================
// ВИЗУАЛИЗАЦИЯ И ГРАФИКИ
// =============================================================================

export interface ChartDefinition {
    id: string;
    type: ChartType;
    title: string;
    subtitle?: string;

    // Данные
    dataQuery: DataQuery;

    // Конфигурация
    config: ChartConfig;

    // Стили
    styling: ChartStyling;

    // Интерактивность
    interactive?: boolean;
    drill_down?: boolean;

    // Экспорт
    exportable?: boolean;
    formats?: string[];
}

export type ChartType =
    | 'bar'                  // Столбчатая диаграмма
    | 'line'                 // Линейный график
    | 'pie'                  // Круговая диаграмма
    | 'donut'                // Кольцевая диаграмма
    | 'area'                 // Диаграмма с областями
    | 'scatter'              // Точечная диаграмма
    | 'heatmap'              // Тепловая карта
    | 'treemap'              // Древовидная карта
    | 'network_graph'        // Сетевой граф
    | 'sankey'               // Диаграмма Санки
    | 'funnel'               // Воронка
    | 'gauge'                // Шкала/спидометр
    | 'radar'                // Радарная диаграмма
    | 'timeline'             // Временная шкала
    | 'geographic';          // Географическая карта

export interface DataQuery {
    source: string;
    fields: string[];
    filters?: QueryFilter[];
    groupBy?: string[];
    orderBy?: OrderBy[];
    limit?: number;
    aggregations?: QueryAggregation[];
}

export interface QueryFilter {
    field: string;
    operator: string;
    value: any;
}

export interface OrderBy {
    field: string;
    direction: 'asc' | 'desc';
}

export interface QueryAggregation {
    field: string;
    function: string;
    alias?: string;
}

export interface ChartConfig {
    // Оси
    xAxis?: AxisConfig;
    yAxis?: AxisConfig;

    // Легенда
    legend?: LegendConfig;

    // Цвета
    colors?: string[];
    colorScheme?: string;

    // Размеры
    width?: number;
    height?: number;
    responsive?: boolean;

    // Анимации
    animations?: boolean;
    animationDuration?: number;

    // Специфичные настройки
    chartSpecific?: Record<string, any>;
}

export interface AxisConfig {
    label?: string;
    format?: string;
    scale?: 'linear' | 'log' | 'time';
    min?: number;
    max?: number;
    ticks?: number;
    grid?: boolean;
}

export interface LegendConfig {
    show: boolean;
    position: 'top' | 'bottom' | 'left' | 'right';
    align?: 'start' | 'center' | 'end';
}

export interface ChartStyling {
    theme?: string;
    fontFamily?: string;
    fontSize?: number;
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
    padding?: number;
    margins?: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
}

// =============================================================================
// ПЛАНИРОВАНИЕ И АВТОМАТИЗАЦИЯ
// =============================================================================

export interface ReportSchedule {
    id: string;
    name: string;
    enabled: boolean;

    // Расписание
    frequency: ScheduleFrequency;
    cronExpression?: string;
    timezone: string;

    // Временные ограничения
    startDate?: string;
    endDate?: string;
    maxExecutions?: number;

    // Выполнение
    nextRun?: string;
    lastRun?: string;
    executionCount: number;

    // Настройки
    config: ScheduleConfig;

    // Уведомления
    notifications: ScheduleNotification[];

    // История
    history: ScheduleExecution[];
}

export type ScheduleFrequency =
    | 'once'                 // Однократно
    | 'hourly'               // Каждый час
    | 'daily'                // Ежедневно
    | 'weekly'               // Еженедельно
    | 'monthly'              // Ежемесячно
    | 'quarterly'            // Ежеквартально
    | 'yearly'               // Ежегодно
    | 'custom';              // По расписанию cron

export interface ScheduleConfig {
    // Обновление данных
    refreshData: boolean;

    // Автоматическая отправка
    autoSend: boolean;
    recipients: ScheduleRecipient[];

    // Хранение
    retention: {
        keepCount?: number;
        keepDays?: number;
        autoArchive?: boolean;
    };

    // Условия выполнения
    conditions?: ScheduleCondition[];

    // Настройки выполнения
    execution: {
        timeout: number;
        retryCount: number;
        retryDelay: number;
    };
}

export interface ScheduleRecipient {
    type: 'email' | 'webhook' | 'ftp' | 'sftp' | 'api';
    address: string;
    config?: Record<string, any>;
    format?: ReportFormat;
}

export interface ScheduleCondition {
    type: 'data_available' | 'threshold' | 'change_detection' | 'custom';
    config: Record<string, any>;
}

export interface ScheduleNotification {
    event: 'success' | 'failure' | 'warning' | 'start';
    channels: NotificationChannel[];
    template?: string;
    enabled: boolean;
}

export interface NotificationChannel {
    type: 'email' | 'slack' | 'teams' | 'webhook' | 'sms';
    config: Record<string, any>;
}

export interface ScheduleExecution {
    id: string;
    startTime: string;
    endTime?: string;
    status: 'running' | 'completed' | 'failed' | 'cancelled';
    duration?: number;
    reportId?: string;
    error?: string;
    logs?: string[];
}

// =============================================================================
// ШАБЛОНЫ И ФОРМАТИРОВАНИЕ
// =============================================================================

export interface TemplateLayout {
    pageSize: 'A4' | 'A3' | 'Letter' | 'Legal' | 'Custom';
    orientation: 'portrait' | 'landscape';
    margins: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };

    // Разметка страницы
    header?: TemplateHeader;
    footer?: TemplateFooter;

    // Структура
    sections: LayoutSection[];

    // Стили
    defaultStyles: TemplateStyles;
}

export interface TemplateHeader {
    enabled: boolean;
    height: number;
    content: TemplateContent[];
    style?: Record<string, any>;
}

export interface TemplateFooter {
    enabled: boolean;
    height: number;
    content: TemplateContent[];
    style?: Record<string, any>;
    showPageNumbers?: boolean;
    pageNumberFormat?: string;
}

export interface LayoutSection {
    id: string;
    type: string;
    layout: 'single' | 'two_column' | 'three_column' | 'grid' | 'flex';
    order: number;
    spacing?: number;
    breakBefore?: boolean;
    breakAfter?: boolean;
}

export interface TemplateSectionDefinition {
    id: string;
    name: string;
    description: string;
    type: ReportSectionType;
    required: boolean;
    order: number;

    // Конфигурация
    config: SectionConfig;

    // Условия отображения
    conditions?: TemplateCondition[];

    // Валидация
    validation?: SectionValidation[];
}

export interface SectionConfig {
    title?: string;
    subtitle?: string;
    showTitle?: boolean;
    pageBreak?: boolean;

    // Контент
    contentTypes: string[];
    maxItems?: number;
    minItems?: number;

    // Стили
    styles?: Record<string, any>;

    // Специфичные настройки
    sectionSpecific?: Record<string, any>;
}

export interface TemplateCondition {
    field: string;
    operator: string;
    value: any;
    logic?: 'and' | 'or';
}

export interface SectionValidation {
    rule: string;
    message: string;
    severity: 'error' | 'warning' | 'info';
}

export interface TemplateVariable {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array';
    description: string;
    defaultValue?: any;
    required?: boolean;
    validation?: VariableValidation;
    options?: VariableOption[];
}

export interface VariableValidation {
    min?: number;
    max?: number;
    pattern?: string;
    customValidator?: string;
}

export interface VariableOption {
    label: string;
    value: any;
    description?: string;
}

export interface TemplateStyles {
    // Типография
    typography: {
        headings: HeadingStyle[];
        body: TextStyle;
        captions: TextStyle;
        code: TextStyle;
    };

    // Цвета
    colors: {
        primary: string;
        secondary: string;
        accent: string;
        background: string;
        text: string;
        border: string;
    };

    // Компоненты
    components: {
        tables: TableStyle;
        charts: ChartStyle;
        lists: ListStyle;
        callouts: CalloutStyle;
    };
}

export interface HeadingStyle {
    level: 1 | 2 | 3 | 4 | 5 | 6;
    fontSize: string;
    fontWeight: string;
    color: string;
    margin: string;
    lineHeight: string;
}

export interface TextStyle {
    fontSize: string;
    fontWeight: string;
    color: string;
    lineHeight: string;
    margin?: string;
}

export interface TableStyle {
    border: string;
    headerBackground: string;
    headerColor: string;
    stripedRows: boolean;
    rowBackground: string;
    alternateBackground: string;
    padding: string;
}

export interface ChartStyle {
    colorScheme: string[];
    background: string;
    gridColor: string;
    textColor: string;
    fontSize: string;
}

export interface ListStyle {
    bulletType: string;
    indentation: string;
    spacing: string;
}

export interface CalloutStyle {
    info: CalloutVariant;
    warning: CalloutVariant;
    error: CalloutVariant;
    success: CalloutVariant;
}

export interface CalloutVariant {
    background: string;
    border: string;
    icon: string;
    textColor: string;
}

export interface TemplateContent {
    type: 'text' | 'image' | 'variable' | 'date' | 'page_number';
    content: string;
    style?: Record<string, any>;
    align?: 'left' | 'center' | 'right';
}

export interface TemplateRequirement {
    type: 'data_source' | 'scan_type' | 'permission' | 'feature' | 'plugin';
    value: string;
    description?: string;
    optional?: boolean;
}

export interface TemplateReview {
    userId: string;
    userName: string;
    rating: number;
    comment: string;
    date: string;
    helpful: number;
}

// =============================================================================
// ФОРМАТИРОВАНИЕ И ЭКСПОРТ
// =============================================================================

export interface ReportFormatting {
    // Страница
    pageSettings: PageSettings;

    // Типография
    fonts: FontSettings;

    // Цвета
    colorScheme: ColorScheme;

    // Пространство
    spacing: SpacingSettings;

    // Таблицы
    tables: TableFormatting;

    // Изображения
    images: ImageFormatting;
}

export interface PageSettings {
    size: string;
    orientation: string;
    margins: Margins;
    background?: string;
    watermark?: WatermarkSettings;
}

export interface Margins {
    top: number;
    right: number;
    bottom: number;
    left: number;
    units: 'mm' | 'cm' | 'in' | 'pt';
}

export interface WatermarkSettings {
    enabled: boolean;
    text?: string;
    image?: string;
    opacity: number;
    position: 'center' | 'diagonal' | 'top-right' | 'bottom-left';
    size: number;
}

export interface FontSettings {
    primary: string;
    secondary: string;
    monospace: string;
    sizes: {
        title: number;
        heading1: number;
        heading2: number;
        heading3: number;
        body: number;
        caption: number;
        small: number;
    };
}

export interface ColorScheme {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
    info: string;
}

export interface SpacingSettings {
    sectionSpacing: number;
    paragraphSpacing: number;
    lineHeight: number;
    listIndentation: number;
}

export interface TableFormatting {
    border: boolean;
    borderColor: string;
    borderWidth: number;
    headerBackground: string;
    stripedRows: boolean;
    cellPadding: number;
    fontSize: number;
}

export interface ImageFormatting {
    maxWidth: number;
    maxHeight: number;
    quality: number;
    format: 'original' | 'png' | 'jpg' | 'webp';
    compression: number;
}

export interface ReportExportSettings {
    // Форматы
    enabledFormats: ReportFormat[];
    defaultFormat: ReportFormat;

    // Безопасность
    passwordProtection?: boolean;
    encryptionLevel?: 'none' | 'standard' | 'high';
    digitalSignature?: boolean;

    // Метаданные
    includeMetadata: boolean;
    author?: string;
    keywords?: string[];
    subject?: string;

    // Оптимизация
    compression: boolean;
    imageOptimization: boolean;

    // Доступность
    accessibility: boolean;
    alternativeText: boolean;
    structuredDocument: boolean;
}

export interface ReportBranding {
    // Логотип
    logo?: BrandingLogo;

    // Цвета
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;

    // Организация
    organizationName: string;
    organizationAddress?: string;
    organizationContact?: string;

    // Кастомизация
    customCSS?: string;
    customHeader?: string;
    customFooter?: string;

    // Водяной знак
    watermark?: WatermarkSettings;
}

export interface BrandingLogo {
    url: string;
    position: 'header' | 'footer' | 'cover';
    size: 'small' | 'medium' | 'large' | 'custom';
    width?: number;
    height?: number;
    align: 'left' | 'center' | 'right';
}

// =============================================================================
// ФАЙЛЫ И ХРАНЕНИЕ
// =============================================================================

export interface ReportFile {
    id: string;
    filename: string;
    format: ReportFormat;
    size: number;
    path: string;
    url?: string;

    // Метаданные
    createdAt: string;
    checksum: string;
    mimeType: string;

    // Безопасность
    encrypted: boolean;
    signed: boolean;

    // Доступ
    downloadCount: number;
    lastDownloaded?: string;
    expiresAt?: string;

    // Статус
    status: 'generating' | 'ready' | 'error' | 'expired';
    error?: string;
}

export interface ReportStorage {
    provider: 'local' | 's3' | 'azure' | 'gcp' | 'ftp';
    config: Record<string, any>;
    retention: StorageRetention;
    security: StorageSecurity;
}

export interface StorageRetention {
    defaultRetentionDays: number;
    maxRetentionDays: number;
    autoArchive: boolean;
    archiveAfterDays: number;
    autoDelete: boolean;
    deleteAfterDays: number;
}

export interface StorageSecurity {
    encryptionAtRest: boolean;
    encryptionInTransit: boolean;
    accessLogging: boolean;
    auditTrail: boolean;
    backupStrategy: 'none' | 'daily' | 'weekly' | 'monthly';
}

// =============================================================================
// ПРАВА ДОСТУПА И БЕЗОПАСНОСТЬ
// =============================================================================

export interface ReportPermission {
    userId: string;
    role: ReportRole;
    permissions: Permission[];
    grantedAt: string;
    grantedBy: string;
    expiresAt?: string;
}

export type ReportRole =
    | 'owner'                // Владелец
    | 'editor'               // Редактор
    | 'viewer'               // Читатель
    | 'analyst'              // Аналитик
    | 'auditor'              // Аудитор
    | 'guest';               // Гость

export type Permission =
    | 'read'                 // Чтение
    | 'write'                // Запись
    | 'delete'               // Удаление
    | 'share'                // Предоставление доступа
    | 'export'               // Экспорт
    | 'schedule'             // Планирование
    | 'template_edit'        // Редактирование шаблонов
    | 'admin';               // Администрирование

export interface ReportSecuritySettings {
    // Классификация
    classification: 'public' | 'internal' | 'confidential' | 'restricted' | 'top_secret';

    // Контроль доступа
    accessControl: {
        enabled: boolean;
        defaultRole: ReportRole;
        inheritFromSource: boolean;
        requireApproval: boolean;
    };

    // Аудит
    audit: {
        logAccess: boolean;
        logExports: boolean;
        logSharing: boolean;
        retentionDays: number;
    };

    // Шифрование
    encryption: {
        enabled: boolean;
        algorithm: string;
        keyRotation: boolean;
        keyRotationDays: number;
    };

    // Водяные знаки
    watermarking: {
        enabled: boolean;
        includeUserId: boolean;
        includeTimestamp: boolean;
        includeIPAddress: boolean;
    };

    // DLP (Data Loss Prevention)
    dlp: {
        enabled: boolean;
        scanContent: boolean;
        blockSensitiveData: boolean;
        alertOnViolation: boolean;
    };
}

// =============================================================================
// СТАТИСТИКА И АНАЛИТИКА
// =============================================================================

export interface ReportStatistics {
    // Использование
    views: number;
    downloads: number;
    shares: number;
    exports: number;

    // Временные метрики
    firstViewed?: string;
    lastViewed?: string;
    totalViewTime: number;
    averageViewTime: number;

    // Пользователи
    uniqueViewers: number;
    topViewers: UserStatistic[];

    // Производительность
    generationTime: number;
    dataProcessingTime: number;
    renderingTime: number;

    // Размеры
    dataSize: number;
    fileSize: number;

    // Ошибки
    errorCount: number;
    lastError?: string;

    // Оценки
    rating?: number;
    ratingCount: number;
    feedback: ReportFeedback[];
}

export interface UserStatistic {
    userId: string;
    userName: string;
    views: number;
    downloads: number;
    lastActivity: string;
}

export interface ReportFeedback {
    id: string;
    userId: string;
    userName: string;
    rating: number;
    comment?: string;
    category: 'content' | 'design' | 'performance' | 'usability' | 'other';
    createdAt: string;
    helpful: number;
    status: 'pending' | 'approved' | 'rejected';
}

// =============================================================================
// ИНТЕГРАЦИИ И API
// =============================================================================

export interface ReportIntegration {
    id: string;
    name: string;
    type: IntegrationType;
    enabled: boolean;
    config: IntegrationConfig;
    authentication: IntegrationAuth;
    mapping: IntegrationMapping;
}

export type IntegrationType =
    | 'siem'                 // SIEM системы (Splunk, QRadar, ArcSight)
    | 'ticketing'            // Системы тикетов (Jira, ServiceNow)
    | 'grc'                  // GRC платформы (Archer, MetricStream)
    | 'vulnerability'        // Системы управления уязвимостями
    | 'threat_intelligence'  // Threat Intelligence платформы
    | 'email'                // Email системы
    | 'collaboration'        // Collaboration tools (Slack, Teams)
    | 'database'             // Базы данных
    | 'data_warehouse'       // Хранилища данных
    | 'bi_platform'          // BI платформы (Tableau, PowerBI)
    | 'api'                  // REST/GraphQL API
    | 'webhook';             // Webhooks

export interface IntegrationConfig {
    endpoint?: string;
    version?: string;
    timeout: number;
    retryAttempts: number;
    rateLimiting?: {
        enabled: boolean;
        requestsPerMinute: number;
    };
    customHeaders?: Record<string, string>;
    customParameters?: Record<string, any>;
}

export interface IntegrationAuth {
    type: 'none' | 'api_key' | 'bearer_token' | 'basic_auth' | 'oauth2' | 'certificate';
    credentials: Record<string, any>;
    refreshToken?: string;
    expiresAt?: string;
}

export interface IntegrationMapping {
    fieldMappings: FieldMapping[];
    transformations: DataTransformation[];
    filters: IntegrationFilter[];
}

export interface FieldMapping {
    sourceField: string;
    targetField: string;
    required: boolean;
    defaultValue?: any;
    validation?: string;
}

export interface DataTransformation {
    field: string;
    operation: 'format' | 'calculate' | 'lookup' | 'custom';
    parameters: Record<string, any>;
}

export interface IntegrationFilter {
    field: string;
    operator: string;
    value: any;
    condition: 'include' | 'exclude';
}

// =============================================================================
// ДОПОЛНИТЕЛЬНЫЕ ТИПЫ
// =============================================================================

export interface ReportFilter {
    id: string;
    name: string;
    field: string;
    operator: FilterOperator;
    value: any;
    dataType: 'string' | 'number' | 'date' | 'boolean' | 'array';
    required?: boolean;
    description?: string;
}

export type FilterOperator =
    | 'equals' | 'not_equals'
    | 'contains' | 'not_contains'
    | 'starts_with' | 'ends_with'
    | 'greater_than' | 'less_than'
    | 'greater_than_or_equal' | 'less_than_or_equal'
    | 'between' | 'not_between'
    | 'in' | 'not_in'
    | 'is_null' | 'is_not_null'
    | 'regex' | 'not_regex';

export interface ReportAppendix {
    id: string;
    title: string;
    type: 'raw_data' | 'detailed_findings' | 'methodology' | 'glossary' | 'references' | 'custom';
    content: any;
    order: number;
    pageBreak: boolean;
}

export interface ReportConclusion {
    summary: string;
    keyTakeaways: string[];
    futureConsiderations: string[];
    contact: {
        name: string;
        email: string;
        phone?: string;
        organization: string;
    };
}

export interface ReportRecommendation {
    id: string;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    category: string;
    effort: 'low' | 'medium' | 'high';
    impact: 'low' | 'medium' | 'high';
    timeline: string;
    cost?: 'low' | 'medium' | 'high';
    owner?: string;
    resources?: string[];
    dependencies?: string[];
    status?: 'proposed' | 'approved' | 'in_progress' | 'completed' | 'rejected';
}

export interface GlossaryEntry {
    term: string;
    definition: string;
    category?: string;
    aliases?: string[];
    relatedTerms?: string[];
}

export interface ReportApproval {
    approver: string;
    role: string;
    status: 'pending' | 'approved' | 'rejected';
    comment?: string;
    timestamp?: string;
    signature?: string;
}

export interface ReportDistribution {
    recipient: string;
    method: 'email' | 'portal' | 'api' | 'print' | 'secure_link';
    format: ReportFormat;
    delivered: boolean;
    deliveredAt?: string;
    readConfirmation?: boolean;
    readAt?: string;
}

// =============================================================================
// КОНСТАНТЫ И УТИЛИТЫ
// =============================================================================

export const REPORT_TYPES: ReportType[] = [
    'executive',
    'technical',
    'compliance',
    'vulnerability',
    'network',
    'security',
    'trend',
    'comparison',
    'audit',
    'custom'
];

export const REPORT_FORMATS: ReportFormat[] = [
    'pdf',
    'html',
    'docx',
    'xlsx',
    'pptx',
    'json',
    'csv',
    'xml',
    'txt',
    'rtf'
];

export const CHART_TYPES: ChartType[] = [
    'bar',
    'line',
    'pie',
    'donut',
    'area',
    'scatter',
    'heatmap',
    'treemap',
    'network_graph',
    'sankey',
    'funnel',
    'gauge',
    'radar',
    'timeline',
    'geographic'
];

export const DEFAULT_COLOR_SCHEMES = {
    security: ['#ef4444', '#f97316', '#eab308', '#22d3ee', '#10b981'],
    network: ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'],
    vulnerability: ['#7f1d1d', '#dc2626', '#f97316', '#eab308', '#22c55e'],
    status: ['#10b981', '#f59e0b', '#ef4444', '#6b7280']
};

// Функции-утилиты
export const isValidReportType = (type: string): type is ReportType => {
    return REPORT_TYPES.includes(type as ReportType);
};

export const isValidReportFormat = (format: string): format is ReportFormat => {
    return REPORT_FORMATS.includes(format as ReportFormat);
};

export const isValidChartType = (type: string): type is ChartType => {
    return CHART_TYPES.includes(type as ChartType);
};

export const getReportFileExtension = (format: ReportFormat): string => {
    const extensions: Record<ReportFormat, string> = {
        pdf: '.pdf',
        html: '.html',
        docx: '.docx',
        xlsx: '.xlsx',
        pptx: '.pptx',
        json: '.json',
        csv: '.csv',
        xml: '.xml',
        txt: '.txt',
        rtf: '.rtf'
    };
    return extensions[format];
};

export const getReportMimeType = (format: ReportFormat): string => {
    const mimeTypes: Record<ReportFormat, string> = {
        pdf: 'application/pdf',
        html: 'text/html',
        docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        json: 'application/json',
        csv: 'text/csv',
        xml: 'application/xml',
        txt: 'text/plain',
        rtf: 'application/rtf'
    };
    return mimeTypes[format];
};

// =============================================================================
// ЭКСПОРТ ПО УМОЛЧАНИЮ
// =============================================================================

export default {
    REPORT_TYPES,
    REPORT_FORMATS,
    CHART_TYPES,
    DEFAULT_COLOR_SCHEMES,
    isValidReportType,
    isValidReportFormat,
    isValidChartType,
    getReportFileExtension,
    getReportMimeType
};
