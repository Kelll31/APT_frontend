// frontend/src/services/api.ts

/**
 * IP Roast - Типизированный API клиент v3.0.0 DEMO
 * Централизованная система для работы с API сервера (демо-версия с mock данными)
 */

// ===== ТИПЫ И ИНТЕРФЕЙСЫ =====

// Базовые типы ответов API
export interface ApiResponse<T = any> {
    success: boolean;
    status: 'success' | 'error' | 'warning';
    message?: string;
    data?: T;
    error?: string;
    timestamp?: string;
}

// Типы ошибок
export interface ApiErrorResponse {
    success: false;
    status: 'error';
    error: string;
    message: string;
    code?: string;
    details?: any;
    timestamp: string;
}

// Конфигурация API
export interface ApiConfig {
    baseUrl: string;
    timeout: number;
    retries: number;
    retryDelay: number;
    enableCache: boolean;
    enableRateLimit: boolean;
    demoMode: boolean;
    rateLimit: {
        requests: number;
        windowMs: number;
    };
}

// Типы для сканирования
export interface ScanData {
    target: string;
    ports: string;
    profile: string;
    options?: ScanOptions;
    custom_ports?: string;
}

export interface ScanOptions {
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
    report_format?: 'html' | 'json' | 'xml';
}

export interface ScanResult {
    id: string;
    target: string;
    status: 'running' | 'completed' | 'failed' | 'stopped';
    progress: number;
    phase?: string;
    created_at: string;
    completed_at?: string;
    results?: any;
    ports_found?: number;
    services_found?: number;
    vulnerabilities?: Vulnerability[];
    error?: string;
}

export interface ScanProgress {
    scan_id: string;
    progress: number;
    current_phase: string;
    message?: string;
    startTime: number;
    ports_found?: number;
    services_found?: number;
    eta?: number;
}

export interface ScanStatus {
    scan_id: string;
    status: 'running' | 'completed' | 'failed' | 'stopped';
    progress: ScanProgress;
    result?: ScanResult;
}

export interface StartScanResponse {
    success: boolean;
    status: 'success' | 'error';
    scan_id: string;
    message: string;
    estimated_duration?: number;
}

// Типы для валидации целей
export interface TargetValidation {
    valid: boolean;
    status: 'online' | 'offline' | 'unknown';
    message: string;
    details?: {
        ip?: string;
        hostname?: string;
        response_time?: number;
        resolved_ips?: string[];
        ports_detected?: number[];
        services?: string[];
    };
    cached?: boolean;
    timestamp: string;
}

// Типы для отчетов
export interface Report {
    id: string;
    title: string;
    target: string;
    status: 'completed' | 'processing' | 'failed';
    created_at: string;
    completed_at?: string;
    file_size?: number;
    format: 'html' | 'json' | 'xml' | 'pdf';
    scan_type: string;
    vulnerabilities: Vulnerability[];
    summary: ReportSummary;
    tags?: string[];
}

export interface ReportSummary {
    total_ports: number;
    open_ports: number;
    services_count: number;
    vulnerabilities_count: number;
    security_score: number;
    risk_level: 'low' | 'medium' | 'high' | 'critical';
}

export interface Vulnerability {
    id: string;
    name: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    solution?: string;
    port?: number;
    service?: string;
    cvss_score?: number;
    cve_ids?: string[];
}

// Типы для сетевой разведки
export interface NetworkInterface {
    name: string;
    ip: string;
    netmask: string;
    network?: string;
    is_up: boolean;
    is_loopback: boolean;
    mac_address?: string;
    type: string;
}

export interface NetworkDevice {
    ip: string;
    hostname?: string;
    mac_address?: string;
    manufacturer?: string;
    device_type?: string;
    status: 'online' | 'offline';
    response_time?: number;
    last_seen: string;
    open_ports?: PortInfo[];
    services?: ServiceInfo[];
    os_guess?: string;
}

export interface PortInfo {
    port: number;
    protocol: 'tcp' | 'udp';
    state: 'open' | 'closed' | 'filtered';
    service?: string;
    version?: string;
}

export interface ServiceInfo {
    name: string;
    port: number;
    protocol: string;
    version?: string;
    banner?: string;
}

export interface NetworkDiscoverySettings {
    interface: string;
    network_range: string;
    scan_type: 'ping' | 'arp' | 'tcp_syn';
    timeout: number;
    threads: number;
    detect_os: boolean;
    detect_services: boolean;
}

// Типы для настроек
export interface AppSettings {
    profile: UserProfile;
    security: SecuritySettings;
    scanning: ScanningSettings;
    notifications: NotificationSettings;
    appearance: AppearanceSettings;
}

export interface UserProfile {
    full_name: string;
    email: string;
    position: string;
    organization: string;
    timezone: string;
    language: string;
}

export interface SecuritySettings {
    totp_enabled: boolean;
    session_lifetime: number;
    auto_logout: boolean;
    login_notifications: boolean;
    api_keys: ApiKey[];
}

export interface ApiKey {
    id: string;
    name: string;
    key: string;
    permissions: string[];
    created_at: string;
    last_used?: string;
    is_active: boolean;
}

export interface ScanningSettings {
    default_profile: string;
    max_concurrent_scans: number;
    default_timeout: number;
    auto_save_results: boolean;
    enable_script_scan: boolean;
    default_ports: string;
}

export interface NotificationSettings {
    email_enabled: boolean;
    email_address: string;
    telegram_enabled: boolean;
    telegram_chat_id: string;
    webhook_url: string;
    notification_events: string[];
}

export interface AppearanceSettings {
    theme: 'light' | 'dark' | 'auto';
    accent: string;
    size: 'compact' | 'medium' | 'large';
    high_contrast: boolean;
}

// ===== MOCK DATA ДЛЯ ДЕМО =====

const MOCK_SCAN_RESULTS: ScanResult[] = [
    {
        id: 'scan_1',
        target: '192.168.1.1',
        status: 'completed',
        progress: 100,
        phase: 'completed',
        created_at: '2024-07-11T14:30:00Z',
        completed_at: '2024-07-11T14:35:00Z',
        ports_found: 5,
        services_found: 3,
        vulnerabilities: [
            {
                id: 'vuln_1',
                name: 'SSH Weak Cipher',
                severity: 'medium',
                description: 'SSH server supports weak encryption ciphers',
                solution: 'Update SSH configuration to disable weak ciphers',
                port: 22,
                service: 'SSH',
                cvss_score: 5.3
            }
        ]
    },
    {
        id: 'scan_2',
        target: 'example.com',
        status: 'running',
        progress: 45,
        phase: 'port_scanning',
        created_at: '2024-07-11T15:00:00Z',
        ports_found: 2,
        services_found: 1,
        vulnerabilities: []
    }
];

const MOCK_NETWORK_DEVICES: NetworkDevice[] = [
    {
        ip: '192.168.1.1',
        hostname: 'router.local',
        mac_address: '00:11:22:33:44:55',
        manufacturer: 'TP-Link',
        device_type: 'router',
        status: 'online',
        response_time: 15,
        last_seen: '2024-07-11T17:00:00Z',
        os_guess: 'Linux 3.x',
        open_ports: [
            { port: 22, protocol: 'tcp', state: 'open', service: 'SSH' },
            { port: 80, protocol: 'tcp', state: 'open', service: 'HTTP' },
            { port: 443, protocol: 'tcp', state: 'open', service: 'HTTPS' }
        ]
    },
    {
        ip: '192.168.1.100',
        hostname: 'server.local',
        mac_address: 'AA:BB:CC:DD:EE:FF',
        manufacturer: 'Dell Inc.',
        device_type: 'server',
        status: 'online',
        response_time: 8,
        last_seen: '2024-07-11T16:58:00Z',
        os_guess: 'Ubuntu 22.04'
    }
];

const MOCK_REPORTS: Report[] = [
    {
        id: 'report_1',
        title: 'Network Security Assessment',
        target: '192.168.1.0/24',
        status: 'completed',
        created_at: '2024-07-11T14:00:00Z',
        completed_at: '2024-07-11T14:30:00Z',
        file_size: 2048576,
        format: 'html',
        scan_type: 'comprehensive',
        vulnerabilities: MOCK_SCAN_RESULTS[0].vulnerabilities || [],
        summary: {
            total_ports: 1024,
            open_ports: 15,
            services_count: 8,
            vulnerabilities_count: 3,
            security_score: 7.2,
            risk_level: 'medium'
        },
        tags: ['network', 'internal', 'security']
    }
];

// ===== КЛАССЫ ОШИБОК =====

export class ApiError extends Error {
    public readonly status: number;
    public readonly endpoint: string;
    public readonly response?: any;
    public readonly timestamp: string;

    constructor(message: string, status: number, endpoint: string, response?: any) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.endpoint = endpoint;
        this.response = response;
        this.timestamp = new Date().toISOString();
    }

    isClientError(): boolean {
        return this.status >= 400 && this.status < 500;
    }

    isServerError(): boolean {
        return this.status >= 500;
    }

    isNetworkError(): boolean {
        return this.status === 0 || !this.status;
    }
}

export class ValidationError extends Error {
    public readonly field: string;
    public readonly value: any;

    constructor(message: string, field: string, value: any) {
        super(message);
        this.name = 'ValidationError';
        this.field = field;
        this.value = value;
    }
}

export class TimeoutError extends Error {
    public readonly timeout: number;

    constructor(message: string, timeout: number) {
        super(message);
        this.name = 'TimeoutError';
        this.timeout = timeout;
    }
}

// ===== ОСНОВНОЙ API КЛАСС =====

class ApiClient {
    private config: ApiConfig;
    private cache = new Map<string, { data: any; expires: number }>();
    private rateLimiter = {
        requests: 0,
        windowStart: Date.now()
    };
    private activeRequests = new Map<string, AbortController>();

    constructor(config?: Partial<ApiConfig>) {
        // Безопасное получение переменных окружения для демо
        const getEnvVar = (key: string, defaultValue: string): string => {
            if (typeof window !== 'undefined') {
                // Проверяем различные способы получения env переменных
                const windowEnv = (window as any).__ENV__;
                if (windowEnv && windowEnv[key]) {
                    return windowEnv[key];
                }

                // Fallback для Vite в dev режиме
                if ((window as any).__VITE_DEV__) {
                    return defaultValue;
                }
            }

            // Серверная сторона или fallback
            return defaultValue;
        };

        this.config = {
            baseUrl: getEnvVar('VITE_API_URL', 'http://localhost:5000'),
            timeout: 30000,
            retries: 3,
            retryDelay: 1000,
            enableCache: true,
            enableRateLimit: true,
            demoMode: getEnvVar('VITE_DEMO_MODE', 'true') === 'true',
            rateLimit: {
                requests: 100,
                windowMs: 60000
            },
            ...config
        };
    }

    // ===== УТИЛИТАРНЫЕ МЕТОДЫ =====

    private generateCacheKey(url: string, options: RequestInit = {}): string {
        const method = options.method || 'GET';
        const body = options.body || '';
        return `${method}:${url}:${btoa(String(body))}`;
    }

    private getFromCache<T>(key: string): T | null {
        if (!this.config.enableCache) return null;
        const cached = this.cache.get(key);
        if (!cached) return null;
        if (Date.now() > cached.expires) {
            this.cache.delete(key);
            return null;
        }
        return cached.data;
    }

    private setCache<T>(key: string, data: T, ttl = 5 * 60 * 1000): void {
        if (!this.config.enableCache) return;
        this.cache.set(key, {
            data,
            expires: Date.now() + ttl
        });
    }

    private checkRateLimit(): void {
        if (!this.config.enableRateLimit) return;
        const now = Date.now();
        if (now - this.rateLimiter.windowStart > this.config.rateLimit.windowMs) {
            this.rateLimiter.requests = 0;
            this.rateLimiter.windowStart = now;
        }

        if (this.rateLimiter.requests >= this.config.rateLimit.requests) {
            const waitTime = this.config.rateLimit.windowMs - (now - this.rateLimiter.windowStart);
            throw new ApiError(
                `Rate limit exceeded. Try again in ${Math.ceil(waitTime / 1000)} seconds`,
                429,
                'rate-limiter'
            );
        }

        this.rateLimiter.requests++;
    }

    private async withRetry<T>(fn: () => Promise<T>): Promise<T> {
        let lastError: Error;
        for (let attempt = 1; attempt <= this.config.retries; attempt++) {
            try {
                return await fn();
            } catch (error) {
                lastError = error as Error;
                if (error instanceof ApiError) {
                    // Не повторяем клиентские ошибки
                    if (error.isClientError()) {
                        throw error;
                    }
                }

                if (attempt === this.config.retries) {
                    break;
                }

                const delay = this.config.retryDelay * Math.pow(2, attempt - 1);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        throw lastError!;
    }

    private createAbortController(timeout: number): AbortController {
        const controller = new AbortController();
        setTimeout(() => controller.abort(), timeout);
        return controller;
    }

    // ===== DEMO МЕТОДЫ =====

    private async mockDelay<T>(data: T, delay = 1000): Promise<T> {
        if (!this.config.demoMode) return data;

        return new Promise((resolve) => {
            setTimeout(() => resolve(data), delay);
        });
    }

    private generateMockScanId(): string {
        return `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private generateMockReportId(): string {
        return `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // ===== БАЗОВЫЕ HTTP МЕТОДЫ =====

    private async request<T>(
        endpoint: string,
        options: Omit<RequestInit, 'method'> & {
            method?: string;
            timeout?: number;
            cache?: boolean;
        } = {}
    ): Promise<T> {
        // В demo режиме возвращаем mock данные для основных эндпоинтов
        if (this.config.demoMode) {
            return this.handleDemoRequest<T>(endpoint, options);
        }

        this.checkRateLimit();

        const {
            timeout = this.config.timeout,
            cache = true,
            method = 'GET',
            ...fetchOptions
        } = options;

        const url = endpoint.startsWith('http') ? endpoint : `${this.config.baseUrl}${endpoint}`;

        // Проверяем кэш для GET запросов
        if (method === 'GET' && cache) {
            const cacheKey = this.generateCacheKey(url, { ...fetchOptions, method });
            const cached = this.getFromCache<T>(cacheKey);
            if (cached) {
                return cached;
            }
        }

        return this.withRetry(async () => {
            const controller = this.createAbortController(timeout);
            const requestId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            this.activeRequests.set(requestId, controller);

            try {
                const response = await fetch(url, {
                    ...fetchOptions,
                    method,
                    signal: controller.signal,
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        ...fetchOptions.headers
                    }
                });

                this.activeRequests.delete(requestId);

                if (!response.ok) {
                    let errorData: any;
                    try {
                        errorData = await response.json();
                    } catch {
                        errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
                    }

                    throw new ApiError(
                        errorData.message || errorData.error || `HTTP ${response.status}`,
                        response.status,
                        endpoint,
                        errorData
                    );
                }

                const contentType = response.headers.get('content-type');
                let data: T;

                if (contentType?.includes('application/json')) {
                    data = await response.json();
                } else if (contentType?.includes('text/')) {
                    data = await response.text() as unknown as T;
                } else {
                    data = await response.blob() as unknown as T;
                }

                // Кэшируем GET запросы
                if (method === 'GET' && cache) {
                    const cacheKey = this.generateCacheKey(url, { ...fetchOptions, method });
                    this.setCache(cacheKey, data);
                }

                return data;
            } catch (error) {
                this.activeRequests.delete(requestId);
                if (error instanceof DOMException && error.name === 'AbortError') {
                    throw new TimeoutError(`Request timeout after ${timeout}ms`, timeout);
                }

                if (error instanceof ApiError) {
                    throw error;
                }

                throw new ApiError(
                    `Network error: ${(error as Error).message}`,
                    0,
                    endpoint
                );
            }
        });
    }

    private async handleDemoRequest<T>(endpoint: string, options: any): Promise<T> {
        console.log(`[DEMO] API Call: ${options.method || 'GET'} ${endpoint}`);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 700));

        // Route demo requests
        if (endpoint.includes('/api/scan/start')) {
            const scanId = this.generateMockScanId();
            return {
                success: true,
                status: 'success',
                scan_id: scanId,
                message: 'Scan started successfully',
                estimated_duration: 300
            } as unknown as T;
        }

        if (endpoint.includes('/api/scan/') && endpoint.includes('/status')) {
            const scanId = endpoint.split('/')[3];
            const progress = Math.min(100, Math.random() * 100);
            return {
                scan_id: scanId,
                status: progress === 100 ? 'completed' : 'running',
                progress: {
                    scan_id: scanId,
                    progress: progress,
                    current_phase: progress < 50 ? 'discovery' : progress < 80 ? 'port_scanning' : 'service_detection',
                    startTime: Date.now() - 30000,
                    ports_found: Math.floor(Math.random() * 10),
                    services_found: Math.floor(Math.random() * 5)
                }
            } as unknown as T;
        }

        if (endpoint.includes('/api/scans')) {
            return {
                scans: MOCK_SCAN_RESULTS,
                total: MOCK_SCAN_RESULTS.length
            } as unknown as T;
        }

        if (endpoint.includes('/api/reports')) {
            return {
                reports: MOCK_REPORTS,
                total: MOCK_REPORTS.length
            } as unknown as T;
        }

        if (endpoint.includes('/api/network/devices')) {
            return MOCK_NETWORK_DEVICES as unknown as T;
        }

        if (endpoint.includes('/api/network/interfaces')) {
            return [
                {
                    name: 'eth0',
                    ip: '192.168.1.100',
                    netmask: '255.255.255.0',
                    network: '192.168.1.0/24',
                    is_up: true,
                    is_loopback: false,
                    type: 'ethernet'
                }
            ] as unknown as T;
        }

        if (endpoint.includes('/api/scan/validate-target')) {
            return {
                valid: true,
                status: 'online',
                message: 'Target is reachable',
                details: {
                    ip: '192.168.1.1',
                    response_time: 25,
                    ports_detected: [22, 80, 443]
                },
                timestamp: new Date().toISOString()
            } as unknown as T;
        }

        if (endpoint.includes('/api/health')) {
            return {
                status: 'healthy',
                version: '4.0.0-demo',
                uptime: 86400,
                services: {
                    scanner: 'healthy',
                    database: 'healthy',
                    cache: 'healthy'
                }
            } as unknown as T;
        }

        // Default demo response
        return {
            success: true,
            status: 'success',
            message: 'Demo response',
            data: null,
            timestamp: new Date().toISOString()
        } as unknown as T;
    }

    // ===== PUBLIC HTTP МЕТОДЫ =====

    public async get<T>(endpoint: string, options: Omit<RequestInit, 'method'> & { timeout?: number; cache?: boolean } = {}): Promise<T> {
        return this.request<T>(endpoint, { ...options, method: 'GET' });
    }

    public async post<T>(endpoint: string, data?: any, options: Omit<RequestInit, 'method'> & { timeout?: number } = {}): Promise<T> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined
        });
    }

    public async put<T>(endpoint: string, data?: any, options: Omit<RequestInit, 'method'> & { timeout?: number } = {}): Promise<T> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined
        });
    }

    public async patch<T>(endpoint: string, data?: any, options: Omit<RequestInit, 'method'> & { timeout?: number } = {}): Promise<T> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'PATCH',
            body: data ? JSON.stringify(data) : undefined
        });
    }

    public async delete<T>(endpoint: string, options: Omit<RequestInit, 'method'> & { timeout?: number } = {}): Promise<T> {
        return this.request<T>(endpoint, { ...options, method: 'DELETE' });
    }

    // ===== МЕТОДЫ ДЛЯ СКАНИРОВАНИЯ =====

    /**
     * Запуск нового сканирования
     */
    public async startScan(scanData: ScanData): Promise<StartScanResponse> {
        this.validateScanData(scanData);
        return this.post<StartScanResponse>('/api/scan/start', scanData, { timeout: 60000 });
    }

    /**
     * Получение статуса сканирования
     */
    public async getScanStatus(scanId: string): Promise<ScanStatus> {
        if (!scanId) {
            throw new ValidationError('Scan ID is required', 'scanId', scanId);
        }
        return this.get<ScanStatus>(`/api/scan/${encodeURIComponent(scanId)}/status`);
    }

    /**
     * Остановка сканирования
     */
    public async stopScan(scanId: string): Promise<ApiResponse<boolean>> {
        if (!scanId) {
            throw new ValidationError('Scan ID is required', 'scanId', scanId);
        }
        return this.post<ApiResponse<boolean>>(`/api/scan/stop/${encodeURIComponent(scanId)}`);
    }

    /**
     * Получение результатов сканирования
     */
    public async getScanResults(scanId: string): Promise<ScanResult> {
        if (!scanId) {
            throw new ValidationError('Scan ID is required', 'scanId', scanId);
        }
        return this.get<ScanResult>(`/api/scan/${encodeURIComponent(scanId)}/results`);
    }

    /**
     * Валидация цели сканирования
     */
    public async validateTarget(target: string, force = false): Promise<TargetValidation> {
        if (!target?.trim()) {
            throw new ValidationError('Target is required', 'target', target);
        }

        return this.post<TargetValidation>('/api/scan/validate-target', {
            target: target.trim(),
            force
        }, { timeout: 10000 });
    }

    /**
     * Получение списка сканирований
     */
    public async getScans(params: {
        limit?: number;
        offset?: number;
        status?: string;
        target?: string;
    } = {}): Promise<{ scans: ScanResult[]; total: number }> {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) {
                queryParams.append(key, String(value));
            }
        });

        const url = `/api/scans${queryParams.toString() ? `?${queryParams}` : ''}`;
        return this.get<{ scans: ScanResult[]; total: number }>(url);
    }

    /**
     * Удаление сканирования
     */
    public async deleteScan(scanId: string): Promise<boolean> {
        if (!scanId) {
            throw new ValidationError('Scan ID is required', 'scanId', scanId);
        }

        // Очищаем кэш
        this.clearCache(scanId);
        return this.delete<boolean>(`/api/scans/${encodeURIComponent(scanId)}`);
    }

    // ===== МЕТОДЫ ДЛЯ ОТЧЕТОВ =====

    /**
     * Получение списка отчетов
     */
    public async getReports(params: {
        limit?: number;
        offset?: number;
        format?: string;
        severity?: string;
    } = {}): Promise<{ reports: Report[]; total: number }> {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) {
                queryParams.append(key, String(value));
            }
        });

        const url = `/api/reports${queryParams.toString() ? `?${queryParams}` : ''}`;
        return this.get<{ reports: Report[]; total: number }>(url);
    }

    /**
     * Получение деталей отчета
     */
    public async getReportDetails(reportId: string): Promise<Report> {
        if (!reportId) {
            throw new ValidationError('Report ID is required', 'reportId', reportId);
        }
        return this.get<Report>(`/api/reports/${encodeURIComponent(reportId)}`);
    }

    /**
     * Экспорт отчета
     */
    public async exportReport(reportId: string, format: 'html' | 'json' | 'xml' | 'pdf'): Promise<Blob> {
        if (!reportId) {
            throw new ValidationError('Report ID is required', 'reportId', reportId);
        }

        const response = await this.request<Blob>(`/api/reports/${encodeURIComponent(reportId)}/export`, {
            method: 'GET',
            headers: {
                'Accept': format === 'pdf' ? 'application/pdf' :
                    format === 'json' ? 'application/json' :
                        format === 'xml' ? 'application/xml' : 'text/html'
            }
        });
        return response;
    }

    /**
     * Удаление отчета
     */
    public async deleteReport(reportId: string): Promise<boolean> {
        if (!reportId) {
            throw new ValidationError('Report ID is required', 'reportId', reportId);
        }

        this.clearCache(reportId);
        return this.delete<boolean>(`/api/reports/${encodeURIComponent(reportId)}`);
    }

    // ===== МЕТОДЫ ДЛЯ СЕТЕВОЙ РАЗВЕДКИ =====

    /**
     * Получение сетевых интерфейсов
     */
    public async getNetworkInterfaces(): Promise<NetworkInterface[]> {
        return this.get<NetworkInterface[]>('/api/network/interfaces');
    }

    /**
     * Запуск обнаружения сети
     */
    public async startNetworkDiscovery(settings: NetworkDiscoverySettings): Promise<ApiResponse<string>> {
        return this.post<ApiResponse<string>>('/api/network/discover', settings, { timeout: 60000 });
    }

    /**
     * Получение обнаруженных устройств
     */
    public async getDiscoveredDevices(params: {
        scan_id?: string;
        interface?: string;
        limit?: number;
    } = {}): Promise<NetworkDevice[]> {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) {
                queryParams.append(key, String(value));
            }
        });

        const url = `/api/network/devices${queryParams.toString() ? `?${queryParams}` : ''}`;
        return this.get<NetworkDevice[]>(url);
    }

    // ===== МЕТОДЫ ДЛЯ НАСТРОЕК =====

    /**
     * Получение настроек приложения
     */
    public async getSettings(): Promise<AppSettings> {
        return this.get<AppSettings>('/api/settings');
    }

    /**
     * Обновление настроек приложения
     */
    public async updateSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
        this.clearCache('settings');
        return this.put<AppSettings>('/api/settings', settings);
    }

    /**
     * Получение профиля пользователя
     */
    public async getUserProfile(): Promise<UserProfile> {
        return this.get<UserProfile>('/api/settings/profile');
    }

    /**
     * Обновление профиля пользователя
     */
    public async updateUserProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
        this.clearCache('profile');
        return this.put<UserProfile>('/api/settings/profile', profile);
    }

    /**
     * Получение настроек безопасности
     */
    public async getSecuritySettings(): Promise<SecuritySettings> {
        return this.get<SecuritySettings>('/api/settings/security');
    }

    /**
     * Создание API ключа
     */
    public async createApiKey(data: { name: string; permissions: string[] }): Promise<ApiKey> {
        return this.post<ApiKey>('/api/settings/api-keys', data);
    }

    /**
     * Удаление API ключа
     */
    public async deleteApiKey(keyId: string): Promise<boolean> {
        if (!keyId) {
            throw new ValidationError('API Key ID is required', 'keyId', keyId);
        }
        return this.delete<boolean>(`/api/settings/api-keys/${encodeURIComponent(keyId)}`);
    }

    // ===== СИСТЕМНЫЕ МЕТОДЫ =====

    /**
     * Проверка здоровья API
     */
    public async healthCheck(): Promise<{
        status: 'healthy' | 'unhealthy';
        version: string;
        uptime: number;
        services: Record<string, any>;
    }> {
        return this.get('/api/health', { timeout: 5000 });
    }

    /**
     * Получение информации о системе
     */
    public async getSystemInfo(): Promise<{
        version: string;
        build: string;
        environment: string;
        features: string[];
    }> {
        return this.get('/api/system/info');
    }

    // ===== УТИЛИТАРНЫЕ МЕТОДЫ =====

    /**
     * Валидация данных сканирования
     */
    private validateScanData(scanData: ScanData): void {
        if (!scanData.target?.trim()) {
            throw new ValidationError('Target is required', 'target', scanData.target);
        }

        if (!scanData.ports?.trim()) {
            throw new ValidationError('Ports configuration is required', 'ports', scanData.ports);
        }

        if (!scanData.profile?.trim()) {
            throw new ValidationError('Scan profile is required', 'profile', scanData.profile);
        }

        // Валидация формата цели
        const target = scanData.target.trim();
        const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        const domainRegex = /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
        const cidrRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\/(?:[0-9]|[1-2][0-9]|3[0-2])$/;

        if (!ipRegex.test(target) && !domainRegex.test(target) && !cidrRegex.test(target)) {
            throw new ValidationError(
                'Invalid target format. Use IP address, domain, or CIDR notation',
                'target',
                target
            );
        }

        // Валидация кастомных портов
        if (scanData.ports === 'custom' && scanData.custom_ports) {
            const portsRegex = /^(\d+(-\d+)?)(,\d+(-\d+)?)*$/;
            if (!portsRegex.test(scanData.custom_ports)) {
                throw new ValidationError(
                    'Invalid ports format. Use: 80,443,8080-8090',
                    'custom_ports',
                    scanData.custom_ports
                );
            }
        }
    }

    /**
     * Очистка кэша
     */
    public clearCache(pattern?: string): void {
        if (pattern) {
            // Используем Array.from для итерации
            const keysToDelete = Array.from(this.cache.keys()).filter(key => key.includes(pattern));
            keysToDelete.forEach(key => this.cache.delete(key));
        } else {
            this.cache.clear();
        }
    }

    /**
     * Отмена всех активных запросов
     */
    public cancelAllRequests(): void {
        // Используем Array.from для безопасной итерации
        const activeRequestsArray = Array.from(this.activeRequests.entries());
        activeRequestsArray.forEach(([requestId, controller]) => {
            controller.abort();
            this.activeRequests.delete(requestId);
        });
    }

    /**
     * Получение статистики API
     */
    public getStats(): {
        cacheSize: number;
        activeRequests: number;
        rateLimitRemaining: number;
        demoMode: boolean;
    } {
        const now = Date.now();
        const windowTimeLeft = this.config.rateLimit.windowMs - (now - this.rateLimiter.windowStart);
        return {
            cacheSize: this.cache.size,
            activeRequests: this.activeRequests.size,
            rateLimitRemaining: windowTimeLeft > 0 ?
                this.config.rateLimit.requests - this.rateLimiter.requests :
                this.config.rateLimit.requests,
            demoMode: this.config.demoMode
        };
    }

    /**
     * Обновление конфигурации
     */
    public updateConfig(newConfig: Partial<ApiConfig>): void {
        this.config = { ...this.config, ...newConfig };
    }
}

// ===== ЭКСПОРТ =====

// Создание глобального экземпляра API клиента
export const api = new ApiClient();

// Экспорт класса для создания дополнительных экземпляров
export { ApiClient };

// Удобные методы для импорта
export const {
    get,
    post,
    put,
    patch,
    delete: del,
    startScan,
    getScanStatus,
    stopScan,
    getScanResults,
    validateTarget,
    getScans,
    deleteScan,
    getReports,
    getReportDetails,
    exportReport,
    deleteReport,
    getNetworkInterfaces,
    startNetworkDiscovery,
    getDiscoveredDevices,
    getSettings,
    updateSettings,
    getUserProfile,
    updateUserProfile,
    getSecuritySettings,
    createApiKey,
    deleteApiKey,
    healthCheck,
    getSystemInfo,
    clearCache,
    cancelAllRequests,
    getStats,
    updateConfig
} = api;

// Экспорт для отладки в development режиме
const isDev = (() => {
    try {
        return typeof window !== 'undefined' &&
            ((window as any).__VITE_DEV__ || location.hostname === 'localhost');
    } catch {
        return false;
    }
})();

if (isDev) {
    (window as any).__API_CLIENT__ = api;
    console.log('🔧 [DEMO] API Client доступен глобально как __API_CLIENT__');
}

// ===== ИНИЦИАЛИЗАЦИЯ СЕРВИСОВ =====

/**
 * Инициализация всех сервисов приложения
 */
export async function initializeServices(): Promise<{
    api: ApiClient;
    version: string;
    features: string[];
    health: boolean;
}> {
    try {
        console.log('🚀 Инициализация IP Roast сервисов...');

        // Проверка здоровья API
        const healthCheck = await api.healthCheck().catch(() => ({
            status: 'healthy' as const,
            version: '4.0.0-demo',
            uptime: 0,
            services: { demo: 'active' }
        }));

        // Обновление конфигурации для демо
        api.updateConfig({
            demoMode: true,
            enableCache: true,
            enableRateLimit: false
        });

        const result = {
            api,
            version: healthCheck.version,
            features: [
                'scanning',
                'reconnaissance',
                'reporting',
                'network_discovery',
                'vulnerability_assessment',
                'demo_mode'
            ],
            health: healthCheck.status === 'healthy'
        };

        console.log('✅ Сервисы инициализированы успешно', result);
        return result;

    } catch (error) {
        console.error('❌ Ошибка инициализации сервисов:', error);

        // Возвращаем минимальную конфигурацию для демо
        return {
            api,
            version: '4.0.0-demo',
            features: ['demo_mode'],
            health: false
        };
    }
}

/**
 * Проверка готовности сервисов
 */
export function checkServicesHealth(): Promise<boolean> {
    return initializeServices()
        .then(result => result.health)
        .catch(() => false);
}

// Экспорт для совместимости
export { api as default };


