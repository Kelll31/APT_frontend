export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
    timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface ApiError {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
}

export interface RequestConfig {
    timeout?: number;
    retries?: number;
    headers?: Record<string, string>;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface ApiEndpoint {
    method: HttpMethod;
    path: string;
    requiresAuth?: boolean;
}

// Common request/response types
export interface HealthCheck {
    status: 'healthy' | 'unhealthy';
    services: {
        [serviceName: string]: 'up' | 'down';
    };
    timestamp: string;
    uptime: number;
}

export interface ValidationError {
    field: string;
    message: string;
    value?: any;
}
