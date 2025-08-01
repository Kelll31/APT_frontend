// frontend/src/services/api.tsx

/**
 * IP Roast - Типизированный API клиент v4.0.0 ENTERPRISE
 * Централизованная система для работы с API сервера с полной типизацией
 */

import React from 'react';

// ===== ТИПЫ И ИНТЕРФЕЙСЫ =====

// Расширенные опции для API запросов
export interface ApiRequestOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';
    timeout?: number;
    responseType?: 'json' | 'blob' | 'text' | 'arrayBuffer';
    useCache?: boolean;
    retries?: number;
    retryDelay?: number;
    body?: BodyInit | null;
    headers?: HeadersInit;
    credentials?: RequestCredentials;
    mode?: RequestMode;
    redirect?: RequestRedirect;
    referrer?: string;
    referrerPolicy?: ReferrerPolicy;
    integrity?: string;
    keepalive?: boolean;
    signal?: AbortSignal;
    priority?: RequestPriority;
    cache?: RequestCache;
}

// Полная статистика API
export interface ApiStats {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    cacheSize: number;
    activeRequests: number;
    rateLimitRemaining: number;
    demoMode: boolean;
    cacheHitRatio: number;
    averageResponseTime: number;
    lastRequestTime: string | undefined;
    uptime: number;
}

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
    report_format?: 'html' | 'json' | 'xml' | 'pdf';
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
        created_at: '2025-07-18T14:30:00Z',
        completed_at: '2025-07-18T14:35:00Z',
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
        created_at: '2025-07-18T15:00:00Z',
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
        last_seen: '2025-07-18T17:00:00Z',
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
        last_seen: '2025-07-18T16:58:00Z',
        os_guess: 'Ubuntu 22.04'
    }
];

const MOCK_REPORTS: Report[] = [
    {
        id: 'report_1',
        title: 'Network Security Assessment',
        target: '192.168.1.0/24',
        status: 'completed',
        created_at: '2025-07-18T14:00:00Z',
        completed_at: '2025-07-18T14:30:00Z',
        file_size: 2048576,
        format: 'html',
        scan_type: 'comprehensive',
        vulnerabilities: MOCK_SCAN_RESULTS[0]?.vulnerabilities || [],
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
    private requestCount = 0;
    private successfulRequests = 0;
    private failedRequests = 0;
    private totalResponseTime = 0;
    private startTime = Date.now();

    constructor(config?: Partial<ApiConfig>) {
        // Безопасное получение переменных окружения
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

    private generateCacheKey(url: string, options: ApiRequestOptions = {}): string {
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

    private async withRetry<T>(fn: () => Promise<T>, retries?: number): Promise<T> {
        const maxRetries = retries || this.config.retries;
        let lastError: Error;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await fn();
            } catch (error) {
                lastError = error as Error;

                if (error instanceof ApiError && error.isClientError()) {
                    // Не повторяем клиентские ошибки
                    throw error;
                }

                if (attempt === maxRetries) {
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

    // ===== ОСНОВНОЙ МЕТОД REQUEST =====

    private async request<T>(
        endpoint: string,
        options: ApiRequestOptions = {}
    ): Promise<T> {
        // В demo режиме возвращаем mock данные
        if (this.config.demoMode) {
            return this.handleDemoRequest(endpoint, options);
        }

        this.checkRateLimit();

        const {
            timeout = this.config.timeout,
            // ИСПРАВЛЕНИЕ: Используем переименованное свойство
            useCache = true,
            responseType = 'json',
            retries = this.config.retries,
            retryDelay = this.config.retryDelay,
            ...fetchOptions
        } = options;

        const method = fetchOptions.method || 'GET';
        const url = endpoint.startsWith('http') ? endpoint : `${this.config.baseUrl}${endpoint}`;

        // ИСПРАВЛЕНИЕ: Используем переименованное свойство useCache
        if (method === 'GET' && useCache && responseType === 'json') {
            const cacheKey = this.generateCacheKey(url, fetchOptions);
            const cached = this.getFromCache<T>(cacheKey);
            if (cached) {
                return cached;
            }
        }

        return this.withRetry(async () => {
            const controller = this.createAbortController(timeout);
            const requestId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            this.activeRequests.set(requestId, controller);
            this.requestCount++;

            const startTime = performance.now();

            try {
                const response = await fetch(url, {
                    ...fetchOptions,
                    signal: controller.signal,
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': responseType === 'json' ? 'application/json' :
                            responseType === 'blob' ? 'application/octet-stream' :
                                responseType === 'text' ? 'text/plain' : '*/*',
                        ...fetchOptions.headers
                    }
                });

                const endTime = performance.now();
                this.totalResponseTime += (endTime - startTime);
                this.activeRequests.delete(requestId);

                if (!response.ok) {
                    let errorData: any;
                    try {
                        errorData = await response.json();
                    } catch {
                        errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
                    }

                    this.failedRequests++;
                    throw new ApiError(
                        errorData.message || errorData.error || `HTTP ${response.status}`,
                        response.status,
                        endpoint,
                        errorData
                    );
                }

                let data: T;

                // Обработка различных типов ответов
                switch (responseType) {
                    case 'blob':
                        data = await response.blob() as unknown as T;
                        break;
                    case 'text':
                        data = await response.text() as unknown as T;
                        break;
                    case 'arrayBuffer':
                        data = await response.arrayBuffer() as unknown as T;
                        break;
                    default:
                        data = await response.json();
                }

                // ИСПРАВЛЕНИЕ: Используем переименованное свойство
                if (method === 'GET' && useCache && responseType === 'json') {
                    const cacheKey = this.generateCacheKey(url, fetchOptions);
                    this.setCache(cacheKey, data);
                }

                this.successfulRequests++;
                return data;

            } catch (error) {
                this.activeRequests.delete(requestId);

                if (error instanceof DOMException && error.name === 'AbortError') {
                    throw new TimeoutError(`Request timeout after ${timeout}ms`, timeout);
                }

                if (error instanceof ApiError) {
                    throw error;
                }

                this.failedRequests++;
                throw new ApiError(
                    `Network error: ${(error as Error).message}`,
                    0,
                    endpoint
                );
            }
        }, retries);
    }


    private async handleDemoRequest<T>(endpoint: string, options: any): Promise<T> {
        console.log(`[DEMO] API Call: ${options.method || 'GET'} ${endpoint}`);

        // Маршрутизация demo запросов с использованием mockDelay

        // === СКАНИРОВАНИЕ ===
        if (endpoint.includes('/api/scan/start')) {
            const scanId = this.generateMockScanId();
            const response = {
                success: true,
                status: 'success',
                scan_id: scanId,
                message: 'Scan started successfully',
                estimated_duration: 300
            } as unknown as T;

            return this.mockDelay(response, 800);
        }

        if (endpoint.includes('/api/scan/') && endpoint.includes('/status')) {
            const scanId = endpoint.split('/')[3];
            const progress = Math.min(100, Math.random() * 100);
            const response = {
                scan_id: scanId,
                status: progress === 100 ? 'completed' : 'running',
                progress: {
                    scan_id: scanId,
                    progress: progress,
                    current_phase: progress < 30 ? 'discovery' :
                        progress < 60 ? 'port_scanning' :
                            progress < 90 ? 'service_detection' : 'vulnerability_analysis',
                    message: progress < 30 ? 'Обнаружение устройств...' :
                        progress < 60 ? 'Сканирование портов...' :
                            progress < 90 ? 'Определение сервисов...' : 'Анализ уязвимостей...',
                    startTime: Date.now() - 30000,
                    ports_found: Math.floor(Math.random() * 15) + 1,
                    services_found: Math.floor(Math.random() * 8) + 1,
                    eta: progress < 100 ? Math.floor((100 - progress) * 2000) : 0
                }
            } as unknown as T;

            return this.mockDelay(response, 400);
        }

        if (endpoint.includes('/api/scan/') && endpoint.includes('/results')) {
            const scanId = endpoint.split('/')[3];
            const mockResult = MOCK_SCAN_RESULTS.find(r => r.id === scanId) || MOCK_SCAN_RESULTS[0];

            return this.mockDelay(mockResult as unknown as T, 600);
        }

        if (endpoint.includes('/api/scan/stop/')) {
            const scanId = endpoint.split('/')[4];
            const response = {
                success: true,
                message: `Сканирование ${scanId} остановлено`,
                scan_id: scanId,
                status: 'stopped'
            } as unknown as T;

            return this.mockDelay(response, 300);
        }

        if (endpoint.includes('/api/scan/validate-target')) {
            const isValid = Math.random() > 0.1; // 90% успешных валидаций
            const response = {
                valid: isValid,
                status: isValid ? 'online' : 'offline',
                message: isValid ? 'Target is reachable' : 'Target is not reachable',
                details: isValid ? {
                    ip: '192.168.1.1',
                    hostname: 'target.local',
                    response_time: Math.floor(Math.random() * 50) + 10,
                    resolved_ips: ['192.168.1.1'],
                    ports_detected: [22, 80, 443, 8080],
                    services: ['SSH', 'HTTP', 'HTTPS', 'HTTP-Proxy']
                } : {
                    ip: null,
                    response_time: null,
                    error: 'Host unreachable'
                },
                cached: false,
                timestamp: new Date().toISOString()
            } as unknown as T;

            return this.mockDelay(response, 1200);
        }

        // === СПИСКИ СКАНИРОВАНИЙ ===
        if (endpoint.includes('/api/scans') && options.method !== 'DELETE') {
            const response = {
                scans: MOCK_SCAN_RESULTS,
                total: MOCK_SCAN_RESULTS.length,
                page: 1,
                per_page: 20,
                total_pages: 1
            } as unknown as T;

            return this.mockDelay(response, 500);
        }

        if (endpoint.includes('/api/scans/') && options.method === 'DELETE') {
            const scanId = endpoint.split('/')[3];
            const response = {
                success: true,
                message: `Сканирование ${scanId} удалено`,
                deleted_id: scanId
            } as unknown as T;

            return this.mockDelay(response, 400);
        }

        // === ОТЧЕТЫ ===
        if (endpoint.includes('/api/reports') && options.method === 'GET') {
            const response = {
                reports: MOCK_REPORTS,
                total: MOCK_REPORTS.length,
                page: 1,
                per_page: 20,
                total_pages: 1
            } as unknown as T;

            return this.mockDelay(response, 700);
        }

        if (endpoint.includes('/api/reports') && options.method === 'POST') {
            const reportId = this.generateMockReportId();
            const response = {
                success: true,
                report_id: reportId,
                message: 'Отчет создается...',
                status: 'processing',
                estimated_completion: new Date(Date.now() + 30000).toISOString()
            } as unknown as T;

            return this.mockDelay(response, 1000);
        }

        if (endpoint.includes('/api/reports/') && endpoint.includes('/export')) {
            const reportId = endpoint.split('/')[3];
            console.log(`Экспорт отчета: ${reportId}`);
            
            const mockBlob = new Blob(['Mock report content'], { type: 'application/pdf' });
            return this.mockDelay(mockBlob as unknown as T, 1500);
        }

        if (endpoint.includes('/api/reports/') && options.method === 'DELETE') {
            const reportId = endpoint.split('/')[3];
            const response = {
                success: true,
                message: `Отчет ${reportId} удален`,
                deleted_id: reportId
            } as unknown as T;

            return this.mockDelay(response, 350);
        }

        // Получение деталей отчета
        if (endpoint.includes('/api/reports/') && options.method === 'GET') {
            const reportId = endpoint.split('/')[3];
            const mockReport = MOCK_REPORTS.find(r => r.id === reportId) || MOCK_REPORTS[0];

            return this.mockDelay(mockReport as unknown as T, 450);
        }

        // === СЕТЕВАЯ РАЗВЕДКА ===
        if (endpoint.includes('/api/network/interfaces')) {
            const response = [
                {
                    name: 'eth0',
                    ip: '192.168.1.100',
                    netmask: '255.255.255.0',
                    network: '192.168.1.0/24',
                    is_up: true,
                    is_loopback: false,
                    mac_address: '00:11:22:33:44:55',
                    type: 'ethernet'
                },
                {
                    name: 'wlan0',
                    ip: '192.168.0.105',
                    netmask: '255.255.255.0',
                    network: '192.168.0.0/24',
                    is_up: true,
                    is_loopback: false,
                    mac_address: 'AA:BB:CC:DD:EE:FF',
                    type: 'wireless'
                },
                {
                    name: 'lo',
                    ip: '127.0.0.1',
                    netmask: '255.0.0.0',
                    network: '127.0.0.0/8',
                    is_up: true,
                    is_loopback: true,
                    type: 'loopback'
                }
            ] as unknown as T;

            return this.mockDelay(response, 300);
        }

        if (endpoint.includes('/api/network/discover')) {
            const discoveryId = `discovery_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const response = {
                success: true,
                discovery_id: discoveryId,
                message: 'Обнаружение сети запущено',
                estimated_duration: 120
            } as unknown as T;

            return this.mockDelay(response, 500);
        }

        if (endpoint.includes('/api/network/devices')) {
            const response = MOCK_NETWORK_DEVICES.map(device => ({
                ...device,
                // Добавляем случайные вариации для демо
                response_time: Math.floor(Math.random() * 50) + 5,
                last_seen: new Date(Date.now() - Math.random() * 3600000).toISOString()
            })) as unknown as T;

            return this.mockDelay(response, 800);
        }

        // === НАСТРОЙКИ ===
        if (endpoint.includes('/api/settings') && options.method === 'GET') {
            const response = {
                profile: {
                    full_name: 'IP Roast Admin',
                    email: 'admin@example.com',
                    position: 'Security Engineer',
                    organization: 'Example Corp',
                    timezone: 'Europe/Moscow',
                    language: 'ru'
                },
                security: {
                    totp_enabled: false,
                    session_lifetime: 3600,
                    auto_logout: true,
                    login_notifications: true,
                    api_keys: []
                },
                scanning: {
                    default_profile: 'balanced',
                    max_concurrent_scans: 3,
                    default_timeout: 30,
                    auto_save_results: true,
                    enable_script_scan: false,
                    default_ports: 'top-1000'
                },
                notifications: {
                    email_enabled: false,
                    email_address: '',
                    telegram_enabled: false,
                    telegram_chat_id: '',
                    webhook_url: '',
                    notification_events: ['scan_completed', 'scan_failed']
                },
                appearance: {
                    theme: 'dark',
                    accent: 'blue',
                    size: 'medium',
                    high_contrast: false
                }
            } as unknown as T;

            return this.mockDelay(response, 400);
        }

        if (endpoint.includes('/api/settings') && (options.method === 'PUT' || options.method === 'POST')) {
            const response = {
                success: true,
                message: 'Настройки обновлены',
                updated_at: new Date().toISOString()
            } as unknown as T;

            return this.mockDelay(response, 600);
        }

        // === API КЛЮЧИ ===
        if (endpoint.includes('/api/settings/api-keys') && options.method === 'POST') {
            const keyId = `key_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const response = {
                success: true,
                data: {
                    id: keyId,
                    name: 'Demo API Key',
                    key: `ipr_${Math.random().toString(36).substr(2, 32)}`,
                    permissions: ['read', 'write'],
                    created_at: new Date().toISOString(),
                    is_active: true
                },
                message: 'API ключ создан'
            } as unknown as T;

            return this.mockDelay(response, 500);
        }

        if (endpoint.includes('/api/settings/api-keys/') && options.method === 'DELETE') {
            const keyId = endpoint.split('/')[4];
            const response = {
                success: true,
                message: `API ключ ${keyId} удален`,
                deleted_id: keyId
            } as unknown as T;

            return this.mockDelay(response, 300);
        }

        // === СИСТЕМНЫЕ МЕТОДЫ ===
        if (endpoint.includes('/api/health')) {
            const response = {
                status: 'healthy',
                version: '4.0.0-enterprise-demo',
                build: 'demo-build-2025071803',
                uptime: Math.floor(Math.random() * 86400) + 3600,
                services: {
                    scanner: 'healthy',
                    database: 'healthy',
                    cache: 'healthy',
                    websocket: 'healthy',
                    storage: 'healthy'
                },
                system: {
                    cpu_usage: Math.floor(Math.random() * 30) + 10,
                    memory_usage: Math.floor(Math.random() * 40) + 20,
                    disk_usage: Math.floor(Math.random() * 50) + 30,
                    network_status: 'connected'
                }
            } as unknown as T;

            return this.mockDelay(response, 200);
        }

        if (endpoint.includes('/api/system/info')) {
            const response = {
                version: '4.0.0-enterprise',
                build: 'demo-build-2025071803',
                environment: 'demo',
                features: [
                    'network_scanning',
                    'vulnerability_assessment',
                    'reporting',
                    'real_time_monitoring',
                    'api_access',
                    'multi_tenant',
                    'enterprise_support'
                ],
                limits: {
                    max_concurrent_scans: 10,
                    max_targets_per_scan: 1000,
                    max_reports: 100,
                    storage_limit: '10GB'
                }
            } as unknown as T;

            return this.mockDelay(response, 300);
        }

        // === ДОПОЛНИТЕЛЬНЫЕ DEMO ЭНДПОИНТЫ ===

        // Статистика и метрики
        if (endpoint.includes('/api/stats') || endpoint.includes('/api/metrics')) {
            const response = {
                scans_today: Math.floor(Math.random() * 20) + 5,
                scans_this_week: Math.floor(Math.random() * 100) + 30,
                scans_this_month: Math.floor(Math.random() * 400) + 150,
                total_scans: Math.floor(Math.random() * 2000) + 500,
                vulnerabilities_found: Math.floor(Math.random() * 50) + 10,
                devices_discovered: Math.floor(Math.random() * 200) + 50,
                average_scan_time: Math.floor(Math.random() * 300) + 60,
                success_rate: Math.floor(Math.random() * 20) + 80
            } as unknown as T;

            return this.mockDelay(response, 500);
        }

        // Уведомления
        if (endpoint.includes('/api/notifications')) {
            const response = {
                notifications: [
                    {
                        id: 'notif_1',
                        type: 'info',
                        title: 'Сканирование завершено',
                        message: 'Сканирование сети 192.168.1.0/24 завершено успешно',
                        timestamp: new Date(Date.now() - 300000).toISOString(),
                        read: false
                    },
                    {
                        id: 'notif_2',
                        type: 'warning',
                        title: 'Обнаружена уязвимость',
                        message: 'На устройстве 192.168.1.10 обнаружена уязвимость высокого уровня',
                        timestamp: new Date(Date.now() - 600000).toISOString(),
                        read: false
                    }
                ],
                unread_count: 2
            } as unknown as T;

            return this.mockDelay(response, 300);
        }

        // Шаблоны отчетов
        if (endpoint.includes('/api/report-templates')) {
            const response = {
                templates: [
                    {
                        id: 'template_1',
                        name: 'Базовый отчет по безопасности',
                        description: 'Стандартный отчет с основными метриками безопасности',
                        type: 'security',
                        format: 'html'
                    },
                    {
                        id: 'template_2',
                        name: 'Детальный технический отчет',
                        description: 'Подробный отчет для технических специалистов',
                        type: 'technical',
                        format: 'pdf'
                    }
                ]
            } as unknown as T;

            return this.mockDelay(response, 400);
        }

        // === СТАНДАРТНЫЙ DEMO ОТВЕТ ===
        const response = {
            success: true,
            status: 'success',
            message: 'Demo response',
            data: {
                endpoint: endpoint,
                method: options.method || 'GET',
                timestamp: new Date().toISOString(),
                demo_mode: true
            },
            timestamp: new Date().toISOString()
        } as unknown as T;

        return this.mockDelay(response, 500);
    }


    // ===== PUBLIC HTTP МЕТОДЫ =====

    public async get<T>(
        endpoint: string,
        options: Omit<ApiRequestOptions, 'method'> = {}
    ): Promise<T> {
        return this.request<T>(endpoint, { ...options, method: 'GET' });
    }

    public async post<T>(
        endpoint: string,
        data?: any,
        options: Omit<ApiRequestOptions, 'method'> = {}
    ): Promise<T> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'POST',
            body: data ? JSON.stringify(data) : null
        });
    }

    public async put<T>(
        endpoint: string,
        data?: any,
        options: Omit<ApiRequestOptions, 'method'> = {}
    ): Promise<T> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'PUT',
            body: data ? JSON.stringify(data) : null
        });
    }

    public async patch<T>(
        endpoint: string,
        data?: any,
        options: Omit<ApiRequestOptions, 'method'> = {}
    ): Promise<T> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'PATCH',
            body: data ? JSON.stringify(data) : null
        });
    }

    public async delete<T>(
        endpoint: string,
        options: Omit<ApiRequestOptions, 'method'> = {}
    ): Promise<T> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'DELETE'
        });
    }

    // ===== МЕТОДЫ ДЛЯ СКАНИРОВАНИЯ =====

    /**
     * Запуск нового сканирования
     */
    public async startScan(scanData: ScanData): Promise<StartScanResponse> {
        this.validateScanData(scanData);
        return this.post('/api/scan/start', scanData, { timeout: 60000 });
    }

    /**
     * Получение статуса сканирования
     */
    public async getScanStatus(scanId: string): Promise<ScanStatus> {
        if (!scanId) {
            throw new ValidationError('Scan ID is required', 'scanId', scanId);
        }
        return this.get(`/api/scan/${encodeURIComponent(scanId)}/status`);
    }

    /**
     * Остановка сканирования
     */
    public async stopScan(scanId: string): Promise<ApiResponse<{ message: string }>> {
        if (!scanId) {
            throw new ValidationError('Scan ID is required', 'scanId', scanId);
        }
        return this.post(`/api/scan/stop/${encodeURIComponent(scanId)}`);
    }

    /**
     * Получение результатов сканирования
     */
    public async getScanResults(scanId: string): Promise<ScanResult> {
        if (!scanId) {
            throw new ValidationError('Scan ID is required', 'scanId', scanId);
        }
        return this.get(`/api/scan/${encodeURIComponent(scanId)}/results`);
    }

    /**
     * Валидация цели сканирования
     */
    public async validateTarget(target: string, force = false): Promise<TargetValidation> {
        if (!target?.trim()) {
            throw new ValidationError('Target is required', 'target', target);
        }
        return this.post('/api/scan/validate-target', {
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
        return this.get(url);
    }

    /**
     * Удаление сканирования
     */
    public async deleteScan(scanId: string): Promise<ApiResponse<{ message: string }>> {
        if (!scanId) {
            throw new ValidationError('Scan ID is required', 'scanId', scanId);
        }
        // Очищаем кэш
        this.clearCache(scanId);
        return this.delete(`/api/scans/${encodeURIComponent(scanId)}`);
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
        return this.get(url);
    }

    /**
     * Получение деталей отчета
     */
    public async getReportDetails(reportId: string): Promise<Report> {
        if (!reportId) {
            throw new ValidationError('Report ID is required', 'reportId', reportId);
        }
        return this.get(`/api/reports/${encodeURIComponent(reportId)}`);
    }

    /**
     * Экспорт отчета
     */
    public async exportReport(reportId: string, format: 'html' | 'json' | 'xml' | 'pdf'): Promise<Blob> {
        if (!reportId) {
            throw new ValidationError('Report ID is required', 'reportId', reportId);
        }

        return this.get(`/api/reports/${encodeURIComponent(reportId)}/export`, {
            responseType: 'blob',
            headers: {
                'Accept': format === 'pdf' ? 'application/pdf' :
                    format === 'json' ? 'application/json' :
                        format === 'xml' ? 'application/xml' : 'text/html'
            }
        });
    }

    /**
     * Удаление отчета
     */
    public async deleteReport(reportId: string): Promise<ApiResponse<{ message: string }>> {
        if (!reportId) {
            throw new ValidationError('Report ID is required', 'reportId', reportId);
        }
        this.clearCache(reportId);
        return this.delete(`/api/reports/${encodeURIComponent(reportId)}`);
    }

    // ===== МЕТОДЫ ДЛЯ СЕТЕВОЙ РАЗВЕДКИ =====

    /**
     * Получение сетевых интерфейсов
     */
    public async getNetworkInterfaces(): Promise<NetworkInterface[]> {
        return this.get('/api/network/interfaces');
    }

    /**
     * Запуск обнаружения сети
     */
    public async startNetworkDiscovery(settings: NetworkDiscoverySettings): Promise<ApiResponse<{ discovery_id: string }>> {
        return this.post('/api/network/discover', settings, { timeout: 60000 });
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
        return this.get(url);
    }

    // ===== МЕТОДЫ ДЛЯ НАСТРОЕК =====

    /**
     * Получение настроек приложения
     */
    public async getSettings(): Promise<AppSettings> {
        return this.get('/api/settings');
    }

    /**
     * Обновление настроек приложения
     */
    public async updateSettings(settings: Partial<AppSettings>): Promise<ApiResponse<{ message: string }>> {
        this.clearCache('settings');
        return this.put('/api/settings', settings);
    }

    /**
     * Получение профиля пользователя
     */
    public async getUserProfile(): Promise<UserProfile> {
        return this.get('/api/settings/profile');
    }

    /**
     * Обновление профиля пользователя
     */
    public async updateUserProfile(profile: Partial<UserProfile>): Promise<ApiResponse<{ message: string }>> {
        this.clearCache('profile');
        return this.put('/api/settings/profile', profile);
    }

    /**
     * Получение настроек безопасности
     */
    public async getSecuritySettings(): Promise<SecuritySettings> {
        return this.get('/api/settings/security');
    }

    /**
     * Создание API ключа
     */
    public async createApiKey(data: { name: string; permissions: string[] }): Promise<ApiResponse<ApiKey>> {
        return this.post('/api/settings/api-keys', data);
    }

    /**
     * Удаление API ключа
     */
    public async deleteApiKey(keyId: string): Promise<ApiResponse<{ message: string }>> {
        if (!keyId) {
            throw new ValidationError('API Key ID is required', 'keyId', keyId);
        }
        return this.delete(`/api/settings/api-keys/${encodeURIComponent(keyId)}`);
    }

    // ===== СИСТЕМНЫЕ МЕТОДЫ =====

    /**
     * Проверка здоровья API
     */
    public async healthCheck(): Promise<{
        status: 'healthy' | 'unhealthy';
        version: string;
        uptime: number;
        services: Record<string, string>;
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
        const activeRequestsArray = Array.from(this.activeRequests.entries());
        activeRequestsArray.forEach(([requestId, controller]) => {
            controller.abort();
            this.activeRequests.delete(requestId);
        });
    }

    /**
     * Получение статистики API
     */
    public getStats(): ApiStats {
        const now = Date.now();
        const windowTimeLeft = this.config.rateLimit.windowMs - (now - this.rateLimiter.windowStart);

        return {
            totalRequests: this.requestCount,
            successfulRequests: this.successfulRequests,
            failedRequests: this.failedRequests,
            cacheSize: this.cache.size,
            activeRequests: this.activeRequests.size,
            rateLimitRemaining: windowTimeLeft > 0 ?
                this.config.rateLimit.requests - this.rateLimiter.requests :
                this.config.rateLimit.requests,
            demoMode: this.config.demoMode,
            cacheHitRatio: this.requestCount > 0 ?
                (this.requestCount - this.successfulRequests - this.failedRequests) / this.requestCount : 0,
            averageResponseTime: this.requestCount > 0 ?
                this.totalResponseTime / this.requestCount : 0,
            lastRequestTime: this.requestCount > 0 ? new Date().toISOString() : undefined,
            uptime: now - this.startTime
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

// ===== ИСПРАВЛЕННЫЙ REACT ХУК =====

// React хук для использования API в компонентах
export const useApi = () => {
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<ApiError | null>(null);

    const makeRequest = React.useCallback(
        async (requestFn: () => Promise<any>): Promise<any> => {
            setIsLoading(true);
            setError(null);

            try {
                const result = await requestFn();
                return result;
            } catch (err) {
                const apiError = err instanceof ApiError ? err : new ApiError(
                    'Unknown error occurred',
                    0,
                    'unknown'
                );
                setError(apiError);
                return null;
            } finally {
                setIsLoading(false);
            }
        },
        []
    );

    return {
        isLoading,
        error,
        makeRequest,
        api
    };
};

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
    console.log('🔧 [IP Roast] API Client доступен глобально как __API_CLIENT__');
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
            version: '4.0.0-enterprise',
            uptime: 0,
            services: { demo: 'active' }
        }));

        // Обновление конфигурации
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
                'enterprise_mode'
            ],
            health: healthCheck.status === 'healthy'
        };

        console.log('✅ IP Roast сервисы инициализированы успешно', result);
        return result;

    } catch (error) {
        console.error('❌ Ошибка инициализации сервисов:', error);

        // Возвращаем минимальную конфигурацию для демо
        return {
            api,
            version: '4.0.0-enterprise',
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
