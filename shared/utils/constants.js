/**
 * IP Roast Enterprise 4.0 - Fixed Constants
 * Исправленные константы и конфигурация
 * Версия: Enterprise 4.0 (Fixed)
 */

/**
 * ===========================
 * СИСТЕМНЫЕ КОНСТАНТЫ
 * ===========================
 */

// Информация о приложении
export const APP_INFO = {
    NAME: 'IP Roast Enterprise',
    VERSION: '4.0.0',
    DESCRIPTION: 'Корпоративная платформа автоматизированной оценки безопасности',
    BUILD_DATE: '2025-02-15',
    AUTHOR: 'IP Roast Team',
    LICENSE: 'Enterprise',
    EDITION: 'Enterprise'
};

// API конфигурация
export const API_CONFIG = {
    BASE_URL: '/api',
    VERSION: 'v1',
    TIMEOUT: 30000, // 30 секунд
    RETRY_COUNT: 3,
    RETRY_DELAY: 1000,
    CACHE_TIMEOUT: 300000 // 5 минут
};

// WebSocket конфигурация
export const WEBSOCKET_CONFIG = {
    URL: '/ws',
    RECONNECT_INTERVAL: 5000,
    MAX_RECONNECT_ATTEMPTS: 10,
    HEARTBEAT_INTERVAL: 30000
};

/**
 * ===========================
 * КЛЮЧИ ЛОКАЛЬНОГО ХРАНИЛИЩА
 * ===========================
 */

export const STORAGE_KEYS = {
    SETTINGS: 'ipRoast:settings',
    THEME: 'ipRoast:theme',
    LANGUAGE: 'ipRoast:language',
    CURRENT_TAB: 'ipRoast:currentTab',
    SIDEBAR_STATE: 'ipRoast:sidebarState',
    USER_PREFERENCES: 'ipRoast:userPreferences',
    CACHE: 'ipRoast:cache',
    SESSION: 'ipRoast:session',
    SIDEBAR_STATE: 'ipRoast:sidebarState',
    NOTIFICATIONS: 'ipRoast:notifications'
};

/**
 * ===========================
 * ПОЛЬЗОВАТЕЛЬСКИЙ ИНТЕРФЕЙС
 * ===========================
 */

// Размеры экранов для адаптивности
export const BREAKPOINTS = {
    XS: 0,
    SM: 640,
    MD: 768,
    LG: 1024,
    XL: 1280,
    XXL: 1536
};

// Длительности анимаций
export const ANIMATION_DURATION = {
    FAST: 150,
    NORMAL: 250,
    SLOW: 350,
    SLOWER: 500
};

// Размеры компонентов
export const COMPONENT_SIZES = {
    SMALL: 'sm',
    MEDIUM: 'md',
    LARGE: 'lg',
    EXTRA_LARGE: 'xl'
};

// Темы оформления
export const THEMES = {
    LIGHT: 'light',
    DARK: 'dark',
    CYBERPUNK: 'cyberpunk',
    HIGH_CONTRAST: 'high-contrast',
    HIGH_CONTRAST_DARK: 'high-contrast-dark',
    AUTO: 'auto',
    SYSTEM: 'system'
};

// Доступные языки
export const LANGUAGES = {
    RU: 'ru',
    EN: 'en'
};

// Состояния UI
export const UI_STATES = {
    LOADING: 'loading',
    LOADED: 'loaded',
    ERROR: 'error',
    EMPTY: 'empty'
};

// Z-индексы
export const Z_INDEX = {
    DROPDOWN: 1000,
    STICKY: 1020,
    FIXED: 1030,
    MODAL_BACKDROP: 1040,
    MODAL: 1050,
    POPOVER: 1060,
    TOOLTIP: 1070,
    TOAST: 1080
};

// Настройки UI по умолчанию
export const DEFAULT_UI_SETTINGS = {
    theme: THEMES.LIGHT,
    language: LANGUAGES.RU,
    autoRefresh: true,
    refreshInterval: 30000,
    enableNotifications: true,
    enableWebSocket: true,
    enableSounds: false,
    enableAnimations: true,
    enableHotkeys: true,
    sidebarCollapsed: false,
    maxNotifications: 50,
    timezone: 'Europe/Moscow'
};

/**
 * ===========================
 * СТАТУСЫ ПОДКЛЮЧЕНИЯ
 * ===========================
 */

export const CONNECTION_STATUS = {
    CONNECTED: 'connected',
    DISCONNECTED: 'disconnected',
    CONNECTING: 'connecting',
    RECONNECTING: 'reconnecting',
    ERROR: 'error'
};

/**
 * ===========================
 * СЕТЕВЫЕ КОНСТАНТЫ
 * ===========================
 */

// Типы сканирования
export const SCAN_TYPES = {
    PING_SWEEP: 'ping_sweep',
    PORT_SCAN: 'port_scan',
    SERVICE_SCAN: 'service_scan',
    VULNERABILITY_SCAN: 'vulnerability_scan',
    FULL_SCAN: 'full_scan',
    CUSTOM_SCAN: 'custom_scan'
};

// Статусы сканирования
export const SCAN_STATUS = {
    PENDING: 'pending',
    RUNNING: 'running',
    PAUSED: 'paused',
    COMPLETED: 'completed',
    FAILED: 'failed',
    CANCELLED: 'cancelled',
    TIMEOUT: 'timeout'
};

// Статусы устройств
export const DEVICE_STATUS = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    UNKNOWN: 'unknown',
    OFFLINE: 'offline',
    FILTERED: 'filtered'
};

// Уровни риска
export const RISK_LEVELS = {
    CRITICAL: 'critical',
    HIGH: 'high',
    MEDIUM: 'medium',
    LOW: 'low',
    INFO: 'info',
    NONE: 'none'
};

// Типы протоколов
export const PROTOCOLS = {
    TCP: 'tcp',
    UDP: 'udp',
    ICMP: 'icmp',
    ARP: 'arp',
    HTTP: 'http',
    HTTPS: 'https',
    SSH: 'ssh',
    FTP: 'ftp',
    TELNET: 'telnet',
    SMTP: 'smtp',
    POP3: 'pop3',
    IMAP: 'imap',
    DNS: 'dns',
    DHCP: 'dhcp',
    SNMP: 'snmp',
    RDP: 'rdp',
    VNC: 'vnc'
};

// Стандартные порты
export const COMMON_PORTS = {
    FTP: 21,
    SSH: 22,
    TELNET: 23,
    SMTP: 25,
    DNS: 53,
    HTTP: 80,
    POP3: 110,
    IMAP: 143,
    HTTPS: 443,
    SMB: 445,
    SMTP_SSL: 465,
    IMAP_SSL: 993,
    POP3_SSL: 995,
    MYSQL: 3306,
    RDP: 3389,
    POSTGRESQL: 5432,
    HTTP_ALT: 8080,
    HTTPS_ALT: 8443,
    SNMP: 161,
    LDAP: 389,
    LDAPS: 636
};

// Типы IP адресов
export const IP_TYPES = {
    PUBLIC: 'public',
    PRIVATE: 'private',
    LOOPBACK: 'loopback',
    MULTICAST: 'multicast',
    LINK_LOCAL: 'link-local',
    INVALID: 'invalid',
    IPV4: 'ipv4',
    IPV6: 'ipv6'
};

// Частные сети (RFC 1918)
export const PRIVATE_NETWORKS = [
    '10.0.0.0/8',
    '172.16.0.0/12',
    '192.168.0.0/16',
    '127.0.0.0/8',
    '169.254.0.0/16'
];

/**
 * ===========================
 * МОДУЛИ АТАК
 * ===========================
 */

// Категории модулей атак
export const ATTACK_CATEGORIES = {
    RECONNAISSANCE: 'reconnaissance',
    SCANNING: 'scanning',
    ENUMERATION: 'enumeration',
    EXPLOITATION: 'exploitation',
    POST_EXPLOITATION: 'post_exploitation',
    LATERAL_MOVEMENT: 'lateral_movement',
    PERSISTENCE: 'persistence',
    PRIVILEGE_ESCALATION: 'privilege_escalation',
    DEFENSE_EVASION: 'defense_evasion',
    CREDENTIAL_ACCESS: 'credential_access',
    DISCOVERY: 'discovery',
    COLLECTION: 'collection',
    EXFILTRATION: 'exfiltration',
    IMPACT: 'impact'
};

// Статусы атак
export const ATTACK_STATUS = {
    QUEUED: 'queued',
    RUNNING: 'running',
    SUCCESS: 'success',
    FAILED: 'failed',
    CANCELLED: 'cancelled',
    TIMEOUT: 'timeout',
    PARTIAL: 'partial'
};

// Типы полезной нагрузки
export const PAYLOAD_TYPES = {
    SHELLCODE: 'shellcode',
    EXECUTABLE: 'executable',
    SCRIPT: 'script',
    WEB_SHELL: 'web_shell',
    REVERSE_SHELL: 'reverse_shell',
    BIND_SHELL: 'bind_shell',
    METERPRETER: 'meterpreter',
    CUSTOM: 'custom'
};

/**
 * ===========================
 * УЯЗВИМОСТИ
 * ===========================
 */

// Системы оценки уязвимостей
export const VULNERABILITY_SCORING = {
    CVSS_V2: 'cvss_v2',
    CVSS_V3: 'cvss_v3',
    CVSS_V4: 'cvss_v4',
    CUSTOM: 'custom'
};

// Типы уязвимостей
export const VULNERABILITY_TYPES = {
    BUFFER_OVERFLOW: 'buffer_overflow',
    SQL_INJECTION: 'sql_injection',
    XSS: 'xss',
    CSRF: 'csrf',
    LFI: 'lfi',
    RFI: 'rfi',
    XXE: 'xxe',
    SSRF: 'ssrf',
    DESERIALIZATION: 'deserialization',
    PRIVILEGE_ESCALATION: 'privilege_escalation',
    WEAK_AUTHENTICATION: 'weak_authentication',
    INFORMATION_DISCLOSURE: 'information_disclosure',
    DENIAL_OF_SERVICE: 'denial_of_service',
    MISCONFIGURATION: 'misconfiguration',
    CRYPTO_WEAKNESS: 'crypto_weakness',
    PATH_TRAVERSAL: 'path_traversal'
};

// Статусы уязвимостей
export const VULNERABILITY_STATUS = {
    OPEN: 'open',
    CONFIRMED: 'confirmed',
    FALSE_POSITIVE: 'false_positive',
    FIXED: 'fixed',
    ACCEPTED_RISK: 'accepted_risk',
    MITIGATED: 'mitigated',
    WONT_FIX: 'wont_fix'
};

/**
 * ===========================
 * ОТЧЕТЫ
 * ===========================
 */

// Типы отчетов
export const REPORT_TYPES = {
    VULNERABILITY_ASSESSMENT: 'vulnerability_assessment',
    PENETRATION_TEST: 'penetration_test',
    NETWORK_SCAN: 'network_scan',
    COMPLIANCE: 'compliance',
    EXECUTIVE_SUMMARY: 'executive_summary',
    TECHNICAL_DETAILS: 'technical_details',
    CUSTOM: 'custom'
};

// Форматы отчетов
export const REPORT_FORMATS = {
    PDF: 'pdf',
    HTML: 'html',
    JSON: 'json',
    XML: 'xml',
    CSV: 'csv',
    DOCX: 'docx',
    XLSX: 'xlsx'
};

// Статусы отчетов
export const REPORT_STATUS = {
    GENERATING: 'generating',
    COMPLETED: 'completed',
    FAILED: 'failed',
    CANCELLED: 'cancelled',
    QUEUED: 'queued'
};

/**
 * ===========================
 * УВЕДОМЛЕНИЯ
 * ===========================
 */

// Типы уведомлений
export const NOTIFICATION_TYPES = {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info'
};

// Позиции уведомлений
export const NOTIFICATION_POSITIONS = {
    TOP_RIGHT: 'top-right',
    TOP_LEFT: 'top-left',
    TOP_CENTER: 'top-center',
    BOTTOM_RIGHT: 'bottom-right',
    BOTTOM_LEFT: 'bottom-left',
    BOTTOM_CENTER: 'bottom-center'
};

/**
 * ===========================
 * СОБЫТИЯ И ЛОГИ
 * ===========================
 */

// Уровни логирования
export const LOG_LEVELS = {
    DEBUG: 'debug',
    INFO: 'info',
    WARN: 'warn',
    ERROR: 'error',
    FATAL: 'fatal'
};

// Типы событий
export const EVENT_TYPES = {
    USER_ACTION: 'user_action',
    SYSTEM_EVENT: 'system_event',
    SECURITY_EVENT: 'security_event',
    SCAN_EVENT: 'scan_event',
    ATTACK_EVENT: 'attack_event',
    ERROR_EVENT: 'error_event',
    API_EVENT: 'api_event'
};

// События WebSocket
export const WEBSOCKET_EVENTS = {
    SCAN_UPDATE: 'scan_update',
    DEVICE_DISCOVERED: 'device_discovered',
    VULNERABILITY_FOUND: 'vulnerability_found',
    ATTACK_COMPLETE: 'attack_complete',
    SYSTEM_ALERT: 'system_alert',
    USER_ACTIVITY: 'user_activity',
    CONNECTION_STATUS: 'connection_status'
};

// Категории событий безопасности
export const SECURITY_EVENT_CATEGORIES = {
    AUTHENTICATION: 'authentication',
    AUTHORIZATION: 'authorization',
    DATA_ACCESS: 'data_access',
    CONFIGURATION_CHANGE: 'configuration_change',
    SUSPICIOUS_ACTIVITY: 'suspicious_activity',
    VULNERABILITY_DETECTED: 'vulnerability_detected',
    ATTACK_ATTEMPT: 'attack_attempt',
    INTRUSION_DETECTED: 'intrusion_detected'
};

/**
 * ===========================
 * ОПЕРАЦИОННЫЕ СИСТЕМЫ
 * ===========================
 */

// Типы операционных систем
export const OS_TYPES = {
    WINDOWS: 'windows',
    LINUX: 'linux',
    MACOS: 'macos',
    UNIX: 'unix',
    BSD: 'bsd',
    ANDROID: 'android',
    IOS: 'ios',
    EMBEDDED: 'embedded',
    NETWORK_DEVICE: 'network_device',
    UNKNOWN: 'unknown'
};

// Семейства Windows
export const WINDOWS_FAMILIES = {
    WINDOWS_XP: 'Windows XP',
    WINDOWS_VISTA: 'Windows Vista',
    WINDOWS_7: 'Windows 7',
    WINDOWS_8: 'Windows 8',
    WINDOWS_10: 'Windows 10',
    WINDOWS_11: 'Windows 11',
    WINDOWS_SERVER_2003: 'Windows Server 2003',
    WINDOWS_SERVER_2008: 'Windows Server 2008',
    WINDOWS_SERVER_2012: 'Windows Server 2012',
    WINDOWS_SERVER_2016: 'Windows Server 2016',
    WINDOWS_SERVER_2019: 'Windows Server 2019',
    WINDOWS_SERVER_2022: 'Windows Server 2022'
};

// Семейства Linux
export const LINUX_FAMILIES = {
    UBUNTU: 'Ubuntu',
    DEBIAN: 'Debian',
    CENTOS: 'CentOS',
    RHEL: 'Red Hat Enterprise Linux',
    FEDORA: 'Fedora',
    SUSE: 'SUSE',
    ARCH: 'Arch Linux',
    KALI: 'Kali Linux',
    ALPINE: 'Alpine Linux',
    AMAZON_LINUX: 'Amazon Linux',
    MINT: 'Linux Mint',
    MANJARO: 'Manjaro'
};

/**
 * ===========================
 * РЕГУЛЯРНЫЕ ВЫРАЖЕНИЯ
 * ===========================
 */

// Паттерны для валидации
export const REGEX_PATTERNS = {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    IPV4: /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
    IPV6: /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/,
    MAC_ADDRESS: /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/,
    HOSTNAME: /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/,
    URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
    DOMAIN: /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/,
    PORT: /^([1-9][0-9]{0,3}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])$/,
    SUBNET: /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\/([0-9]|[1-2][0-9]|3[0-2])$/,
    CVE: /^CVE-\d{4}-\d{4,}$/,
    PASSWORD_STRONG: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
};

/**
 * ===========================
 * ЛИМИТЫ И ОГРАНИЧЕНИЯ
 * ===========================
 */

// Лимиты пагинации
export const PAGINATION_LIMITS = {
    MIN: 10,
    DEFAULT: 25,
    MAX: 100
};

// Лимиты загрузки файлов
export const FILE_UPLOAD_LIMITS = {
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
    MAX_SIZE_FORMATTED: '10MB',
    ALLOWED_TYPES: [
        'image/jpeg',
        'image/png',
        'image/gif',
        'text/plain',
        'text/csv',
        'application/json',
        'application/xml',
        'application/pdf',
        'application/zip'
    ],
    ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.txt', '.csv', '.json', '.xml', '.pdf', '.zip']
};

// Лимиты сканирования
export const SCAN_LIMITS = {
    MAX_HOSTS: 1000,
    MAX_PORTS: 65535,
    MAX_CONCURRENT_SCANS: 5,
    TIMEOUT_MIN: 1,
    TIMEOUT_MAX: 3600, // 1 час
    THREADS_MIN: 1,
    THREADS_MAX: 100,
    RATE_LIMIT_MIN: 1,
    RATE_LIMIT_MAX: 1000
};

/**
 * ===========================
 * СООБЩЕНИЯ
 * ===========================
 */

// Стандартные сообщения об ошибках
export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Ошибка сети. Проверьте подключение к интернету.',
    TIMEOUT_ERROR: 'Превышено время ожидания запроса.',
    AUTHENTICATION_ERROR: 'Ошибка аутентификации. Проверьте учетные данные.',
    AUTHORIZATION_ERROR: 'Недостаточно прав для выполнения операции.',
    VALIDATION_ERROR: 'Ошибка валидации данных.',
    SERVER_ERROR: 'Внутренняя ошибка сервера.',
    NOT_FOUND_ERROR: 'Запрашиваемый ресурс не найден.',
    CONFLICT_ERROR: 'Конфликт данных.',
    RATE_LIMIT_ERROR: 'Превышен лимит запросов.',
    MAINTENANCE_ERROR: 'Система находится на техническом обслуживании.',
    INVALID_INPUT: 'Некорректные входные данные.',
    PERMISSION_DENIED: 'Доступ запрещен.',
    SESSION_EXPIRED: 'Сессия истекла. Необходимо войти в систему заново.',
    MODULE_LOAD_ERROR: 'Ошибка загрузки модуля',
    WEBSOCKET_ERROR: 'Ошибка WebSocket подключения',
    CRITICAL_ERROR: 'Критическая ошибка системы'
};

// Сообщения об успехе
export const SUCCESS_MESSAGES = {
    DATA_SAVED: 'Данные успешно сохранены.',
    DATA_UPDATED: 'Данные успешно обновлены.',
    DATA_DELETED: 'Данные успешно удалены.',
    SCAN_STARTED: 'Сканирование успешно запущено.',
    SCAN_COMPLETED: 'Сканирование завершено.',
    REPORT_GENERATED: 'Отчет успешно сгенерирован.',
    SETTINGS_SAVED: 'Настройки сохранены.',
    LOGIN_SUCCESS: 'Вход в систему выполнен успешно.',
    LOGOUT_SUCCESS: 'Выход из системы выполнен успешно.',
    PASSWORD_CHANGED: 'Пароль успешно изменен.',
    EMAIL_SENT: 'Сообщение отправлено.',
    FILE_UPLOADED: 'Файл успешно загружен.',
    MODULE_LOADED: 'Модуль успешно загружен.',
    CONNECTION_ESTABLISHED: 'Подключение успешно установлено.',
    APP_INITIALIZED: 'IP Roast Enterprise успешно инициализирован.'
};

// Предупреждающие сообщения
export const WARNING_MESSAGES = {
    UNSAVED_CHANGES: 'У вас есть несохраненные изменения.',
    WEAK_PASSWORD: 'Пароль недостаточно надежен.',
    LARGE_FILE: 'Файл имеет большой размер и может долго загружаться.',
    OLD_BROWSER: 'Ваш браузер устарел. Рекомендуется обновление.',
    NETWORK_SLOW: 'Медленное сетевое соединение.',
    STORAGE_FULL: 'Локальное хранилище заполнено.',
    SESSION_TIMEOUT: 'Сессия скоро истечет.'
};

// Информационные сообщения
export const INFO_MESSAGES = {
    LOADING: 'Загрузка...',
    PROCESSING: 'Обработка...',
    CONNECTING: 'Подключение...',
    SAVING: 'Сохранение...',
    DELETING: 'Удаление...',
    UPLOADING: 'Загрузка файла...',
    DOWNLOADING: 'Скачивание...',
    SEARCHING: 'Поиск...',
    GENERATING: 'Генерация...',
    SCANNING: 'Сканирование...'
};

/**
 * ===========================
 * КОНФИГУРАЦИЯ МОДУЛЕЙ
 * ===========================
 */

// Доступные модули
export const MODULES = {
    DASHBOARD: 'dashboard',
    SCANNER: 'scanner',
    ATTACK_CONSTRUCTOR: 'attack-constructor',
    NETWORK_TOPOLOGY: 'network-topology',
    REPORTS: 'reports',
    SETTINGS: 'settings'
};

// Состояния модулей
export const MODULE_STATES = {
    NOT_LOADED: 'not_loaded',
    LOADING: 'loading',
    LOADED: 'loaded',
    ERROR: 'error',
    INITIALIZING: 'initializing',
    READY: 'ready'
};

/**
 * ===========================
 * ДОПОЛНИТЕЛЬНЫЕ КОНСТАНТЫ
 * ===========================
 */

// Форматы дат
export const DATE_FORMATS = {
    SHORT: 'DD.MM.YYYY',
    LONG: 'DD.MM.YYYY HH:mm:ss',
    TIME: 'HH:mm:ss',
    ISO: 'YYYY-MM-DDTHH:mm:ss.sssZ'
};

// Единицы измерения
export const UNITS = {
    BYTES: ['B', 'KB', 'MB', 'GB', 'TB', 'PB'],
    TIME: ['мс', 'с', 'мин', 'ч', 'дн'],
    NETWORK: ['b/s', 'Kb/s', 'Mb/s', 'Gb/s']
};

// Цвета для статусов
export const STATUS_COLORS = {
    SUCCESS: '#10B981',
    ERROR: '#EF4444',
    WARNING: '#F59E0B',
    INFO: '#3B82F6',
    NEUTRAL: '#6B7280'
};

// Иконки для типов файлов
export const FILE_ICONS = {
    'pdf': 'fa-file-pdf',
    'doc': 'fa-file-word',
    'docx': 'fa-file-word',
    'xls': 'fa-file-excel',
    'xlsx': 'fa-file-excel',
    'ppt': 'fa-file-powerpoint',
    'pptx': 'fa-file-powerpoint',
    'txt': 'fa-file-alt',
    'csv': 'fa-file-csv',
    'json': 'fa-file-code',
    'xml': 'fa-file-code',
    'html': 'fa-file-code',
    'css': 'fa-file-code',
    'js': 'fa-file-code',
    'zip': 'fa-file-archive',
    'rar': 'fa-file-archive',
    '7z': 'fa-file-archive',
    'jpg': 'fa-file-image',
    'jpeg': 'fa-file-image',
    'png': 'fa-file-image',
    'gif': 'fa-file-image',
    'svg': 'fa-file-image',
    'mp4': 'fa-file-video',
    'avi': 'fa-file-video',
    'mov': 'fa-file-video',
    'mp3': 'fa-file-audio',
    'wav': 'fa-file-audio',
    'default': 'fa-file'
};

// Экспорт всех констант как объект по умолчанию
export default {
    APP_INFO,
    API_CONFIG,
    WEBSOCKET_CONFIG,
    STORAGE_KEYS,
    BREAKPOINTS,
    ANIMATION_DURATION,
    COMPONENT_SIZES,
    THEMES,
    LANGUAGES,
    UI_STATES,
    Z_INDEX,
    DEFAULT_UI_SETTINGS,
    CONNECTION_STATUS,
    SCAN_TYPES,
    SCAN_STATUS,
    DEVICE_STATUS,
    RISK_LEVELS,
    PROTOCOLS,
    COMMON_PORTS,
    IP_TYPES,
    PRIVATE_NETWORKS,
    ATTACK_CATEGORIES,
    ATTACK_STATUS,
    PAYLOAD_TYPES,
    VULNERABILITY_SCORING,
    VULNERABILITY_TYPES,
    VULNERABILITY_STATUS,
    REPORT_TYPES,
    REPORT_FORMATS,
    REPORT_STATUS,
    NOTIFICATION_TYPES,
    NOTIFICATION_POSITIONS,
    LOG_LEVELS,
    EVENT_TYPES,
    WEBSOCKET_EVENTS,
    SECURITY_EVENT_CATEGORIES,
    OS_TYPES,
    WINDOWS_FAMILIES,
    LINUX_FAMILIES,
    REGEX_PATTERNS,
    PAGINATION_LIMITS,
    FILE_UPLOAD_LIMITS,
    SCAN_LIMITS,
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
    WARNING_MESSAGES,
    INFO_MESSAGES,
    MODULES,
    MODULE_STATES,
    DATE_FORMATS,
    UNITS,
    STATUS_COLORS,
    FILE_ICONS
};