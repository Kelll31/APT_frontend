/**
 * IP Roast Frontend - Constants
 * Константы и конфигурация для корпоративной платформы кибербезопасности
 * Версия: Lite 1.0
 */

/**
 * ===========================
 * СИСТЕМНЫЕ КОНСТАНТЫ
 * ===========================
 */

// Информация о приложении
export const APP_INFO = {
    NAME: 'IP Roast',
    VERSION: '1.0.0',
    DESCRIPTION: 'Корпоративная платформа автоматизированной оценки безопасности',
    BUILD_DATE: '2025-01-15',
    AUTHOR: 'IP Roast Team',
    LICENSE: 'Enterprise'
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
    FULL_SCAN: 'full_scan'
};

// Статусы сканирования
export const SCAN_STATUS = {
    PENDING: 'pending',
    RUNNING: 'running',
    PAUSED: 'paused',
    COMPLETED: 'completed',
    FAILED: 'failed',
    CANCELLED: 'cancelled'
};

// Статусы устройств
export const DEVICE_STATUS = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    UNKNOWN: 'unknown',
    OFFLINE: 'offline'
};

// Уровни риска
export const RISK_LEVELS = {
    CRITICAL: 'critical',
    HIGH: 'high',
    MEDIUM: 'medium',
    LOW: 'low',
    INFO: 'info'
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
    SNMP: 'snmp'
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
    HTTPS_ALT: 8443
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
    '192.168.0.0/16'
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
    TIMEOUT: 'timeout'
};

// Типы полезной нагрузки
export const PAYLOAD_TYPES = {
    SHELLCODE: 'shellcode',
    EXECUTABLE: 'executable',
    SCRIPT: 'script',
    WEB_SHELL: 'web_shell',
    REVERSE_SHELL: 'reverse_shell',
    BIND_SHELL: 'bind_shell'
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
    CVSS_V4: 'cvss_v4'
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
    MISCONFIGURATION: 'misconfiguration'
};

// Статусы уязвимостей
export const VULNERABILITY_STATUS = {
    OPEN: 'open',
    CONFIRMED: 'confirmed',
    FALSE_POSITIVE: 'false_positive',
    FIXED: 'fixed',
    ACCEPTED_RISK: 'accepted_risk',
    MITIGATED: 'mitigated'
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
    TECHNICAL_DETAILS: 'technical_details'
};

// Форматы отчетов
export const REPORT_FORMATS = {
    PDF: 'pdf',
    HTML: 'html',
    JSON: 'json',
    XML: 'xml',
    CSV: 'csv',
    DOCX: 'docx'
};

// Статусы отчетов
export const REPORT_STATUS = {
    GENERATING: 'generating',
    COMPLETED: 'completed',
    FAILED: 'failed',
    CANCELLED: 'cancelled'
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
    ERROR_EVENT: 'error_event'
};

// Категории событий безопасности
export const SECURITY_EVENT_CATEGORIES = {
    AUTHENTICATION: 'authentication',
    AUTHORIZATION: 'authorization',
    DATA_ACCESS: 'data_access',
    CONFIGURATION_CHANGE: 'configuration_change',
    SUSPICIOUS_ACTIVITY: 'suspicious_activity',
    VULNERABILITY_DETECTED: 'vulnerability_detected',
    ATTACK_ATTEMPT: 'attack_attempt'
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
    AMAZON_LINUX: 'Amazon Linux'
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
    PASSWORD_STRONG: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
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
    ALLOWED_TYPES: [
        'image/jpeg',
        'image/png',
        'image/gif',
        'text/plain',
        'text/csv',
        'application/json',
        'application/xml',
        'application/pdf'
    ]
};

// Лимиты сканирования
export const SCAN_LIMITS = {
    MAX_HOSTS: 1000,
    MAX_PORTS: 65535,
    MAX_CONCURRENT_SCANS: 5,
    TIMEOUT_MIN: 1,
    TIMEOUT_MAX: 3600, // 1 час
    THREADS_MIN: 1,
    THREADS_MAX: 100
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
    SESSION_EXPIRED: 'Сессия истекла. Необходимо войти в систему заново.'
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
    OPERATION_COMPLETED: 'Операция выполнена успешно.'
};

/**
 * ===========================
 * НАСТРОЙКИ ПО УМОЛЧАНИЮ
 * ===========================
 */

// Настройки пользовательского интерфейса
export const DEFAULT_UI_SETTINGS = {
    theme: THEMES.DARK,
    language: LANGUAGES.RU,
    notifications: true,
    autoRefresh: true,
    refreshInterval: 30000, // 30 секунд
    pageSize: PAGINATION_LIMITS.DEFAULT,
    dateFormat: 'DD.MM.YYYY HH:mm:ss',
    timezone: 'Europe/Moscow'
};

// Настройки сканирования по умолчанию
export const DEFAULT_SCAN_SETTINGS = {
    timeout: 5000,
    threads: 10,
    retries: 2,
    pingBeforeScan: true,
    detectOS: true,
    detectServices: true,
    scanTcpPorts: true,
    scanUdpPorts: false,
    commonPortsOnly: true,
    followRedirects: true,
    userAgent: 'IP Roast Scanner 1.0'
};

// Настройки безопасности по умолчанию
export const DEFAULT_SECURITY_SETTINGS = {
    sessionTimeout: 3600000, // 1 час
    maxLoginAttempts: 5,
    lockoutDuration: 300000, // 5 минут
    passwordMinLength: 8,
    passwordRequireNumbers: true,
    passwordRequireSymbols: true,
    passwordRequireUppercase: true,
    passwordRequireLowercase: true,
    twoFactorEnabled: false,
    auditLogging: true,
    encryptSensitiveData: true
};

/**
 * ===========================
 * ЭКСПОРТ КОНСТАНТ
 * ===========================
 */

// Объединение всех констант для удобного экспорта
export const CONSTANTS = {
    APP_INFO,
    API_CONFIG,
    WEBSOCKET_CONFIG,
    BREAKPOINTS,
    ANIMATION_DURATION,
    COMPONENT_SIZES,
    THEMES,
    LANGUAGES,
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
    DEFAULT_UI_SETTINGS,
    DEFAULT_SCAN_SETTINGS,
    DEFAULT_SECURITY_SETTINGS
};

// Экспорт для Node.js и браузера
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONSTANTS;
} else {
    window.CONSTANTS = CONSTANTS;
}