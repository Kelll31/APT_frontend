/**
 * IP Roast Enterprise 4.0 - API Client
 * Централизованный клиент для работы с API
 * Версия: Enterprise 4.0
 */

import { API_CONFIG, ERROR_MESSAGES, SUCCESS_MESSAGES } from './constants.js';
import { logger, createError, delay } from './helpers.js';

/**
 * Класс для API ошибок
 */
export class ApiError extends Error {
    constructor(message, status = 0, response = null, type = 'API_ERROR') {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.response = response;
        this.type = type;
        this.timestamp = new Date().toISOString();

        // Maintain proper stack trace
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ApiError);
        }
    }

    toJSON() {
        return {
            name: this.name,
            message: this.message,
            status: this.status,
            type: this.type,
            timestamp: this.timestamp,
            response: this.response ? {
                status: this.response.status,
                statusText: this.response.statusText,
                url: this.response.url
            } : null
        };
    }
}

/**
 * Основной класс API клиента
 */
export class ApiClient {
    constructor(baseURL = API_CONFIG.BASE_URL, options = {}) {
        this.baseURL = baseURL;
        this.timeout = options.timeout || API_CONFIG.TIMEOUT;
        this.retryCount = options.retryCount || API_CONFIG.RETRY_COUNT;
        this.retryDelay = options.retryDelay || API_CONFIG.RETRY_DELAY;

        // Заголовки по умолчанию
        this.defaultHeaders = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            ...options.headers
        };

        // Токен авторизации
        this.authToken = null;

        // Отслеживание запросов для отмены
        this.activeRequests = new Map();

        // Настройка перехватчиков
        this.interceptors = {
            request: [],
            response: []
        };

        // Кэш для GET запросов
        this.cache = new Map();
        this.cacheTimeout = options.cacheTimeout || API_CONFIG.CACHE_TIMEOUT;

        logger.debug('ApiClient initialized', { baseURL, timeout: this.timeout });
    }

    /**
     * Установка токена авторизации
     */
    setAuthToken(token) {
        this.authToken = token;
        if (token) {
            this.defaultHeaders['Authorization'] = `Bearer ${token}`;
            logger.debug('Auth token set');
        } else {
            delete this.defaultHeaders['Authorization'];
            logger.debug('Auth token removed');
        }
    }

    /**
     * Добавление перехватчика запросов
     */
    addRequestInterceptor(interceptor) {
        if (typeof interceptor === 'function') {
            this.interceptors.request.push(interceptor);
            logger.debug('Request interceptor added');
        }
    }

    /**
     * Добавление перехватчика ответов
     */
    addResponseInterceptor(interceptor) {
        if (typeof interceptor === 'function') {
            this.interceptors.response.push(interceptor);
            logger.debug('Response interceptor added');
        }
    }

    /**
     * Создание уникального ключа для запроса
     */
    createRequestKey(url, method, data) {
        return `${method.toUpperCase()}:${url}:${JSON.stringify(data || {})}`;
    }

    /**
     * Проверка кэша
     */
    checkCache(key) {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            logger.debug('Cache hit', { key });
            return cached.data;
        }

        if (cached) {
            this.cache.delete(key);
            logger.debug('Cache expired', { key });
        }

        return null;
    }

    /**
     * Сохранение в кэш
     */
    saveToCache(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
        logger.debug('Data cached', { key });
    }

    /**
     * Очистка устаревшего кэша
     */
    cleanupCache() {
        const now = Date.now();
        for (const [key, cached] of this.cache.entries()) {
            if (now - cached.timestamp >= this.cacheTimeout) {
                this.cache.delete(key);
            }
        }
    }

    /**
     * Основной метод для HTTP запросов
     */
    async request(endpoint, options = {}) {
        const {
            method = 'GET',
            data,
            headers = {},
            timeout = this.timeout,
            cache = method.toUpperCase() === 'GET',
            retry = true,
            signal
        } = options;

        const url = `${this.baseURL}${endpoint}`;
        const requestKey = this.createRequestKey(url, method, data);

        logger.debug('API request started', { method, endpoint, data });

        // Проверка кэша для GET запросов
        if (method.toUpperCase() === 'GET' && cache) {
            const cachedData = this.checkCache(requestKey);
            if (cachedData) {
                return cachedData;
            }
        }

        // Создание контроллера отмены запроса
        const controller = new AbortController();
        const requestSignal = signal || controller.signal;

        // Таймаут
        const timeoutId = setTimeout(() => {
            controller.abort();
            logger.warn('Request timed out', { endpoint, timeout });
        }, timeout);

        // Сохранение активного запроса
        this.activeRequests.set(requestKey, controller);

        try {
            // Подготовка заголовков
            const requestHeaders = {
                ...this.defaultHeaders,
                ...headers
            };

            // Подготовка конфигурации запроса
            let requestConfig = {
                method: method.toUpperCase(),
                headers: requestHeaders,
                signal: requestSignal
            };

            // Добавление тела запроса для не-GET запросов
            if (data && method.toUpperCase() !== 'GET') {
                if (data instanceof FormData) {
                    // Для FormData удаляем Content-Type, чтобы браузер установил его автоматически
                    delete requestConfig.headers['Content-Type'];
                    requestConfig.body = data;
                } else {
                    requestConfig.body = JSON.stringify(data);
                }
            }

            // Применение перехватчиков запросов
            for (const interceptor of this.interceptors.request) {
                try {
                    requestConfig = await interceptor(requestConfig);
                } catch (error) {
                    logger.error('Request interceptor error', error);
                }
            }

            // Выполнение запроса с повторными попытками
            let lastError;
            const maxRetries = retry ? this.retryCount : 1;

            for (let attempt = 1; attempt <= maxRetries; attempt++) {
                try {
                    logger.debug(`Request attempt ${attempt}/${maxRetries}`, { endpoint });

                    const response = await fetch(url, requestConfig);

                    clearTimeout(timeoutId);
                    this.activeRequests.delete(requestKey);

                    // Применение перехватчиков ответов
                    let processedResponse = response;
                    for (const interceptor of this.interceptors.response) {
                        try {
                            processedResponse = await interceptor(processedResponse.clone());
                        } catch (error) {
                            logger.error('Response interceptor error', error);
                        }
                    }

                    if (!processedResponse.ok) {
                        const errorMessage = await this.extractErrorMessage(processedResponse);
                        throw new ApiError(
                            errorMessage || `HTTP ${processedResponse.status}: ${processedResponse.statusText}`,
                            processedResponse.status,
                            processedResponse
                        );
                    }

                    // Парсинг ответа
                    const responseData = await this.parseResponse(processedResponse);

                    // Сохранение в кэш для GET запросов
                    if (method.toUpperCase() === 'GET' && cache) {
                        this.saveToCache(requestKey, responseData);
                    }

                    logger.debug('API request completed', { method, endpoint, status: processedResponse.status });
                    return responseData;

                } catch (error) {
                    lastError = error;

                    // Если это не последняя попытка и ошибка повторяемая
                    if (attempt < maxRetries && this.isRetryableError(error)) {
                        const delayMs = this.retryDelay * Math.pow(2, attempt - 1); // Exponential backoff
                        logger.warn(`Request failed, retrying in ${delayMs}ms`, {
                            endpoint,
                            attempt,
                            error: error.message
                        });
                        await delay(delayMs);
                        continue;
                    }

                    throw error;
                }
            }

            throw lastError;

        } catch (error) {
            clearTimeout(timeoutId);
            this.activeRequests.delete(requestKey);

            if (error.name === 'AbortError') {
                throw new ApiError(ERROR_MESSAGES.TIMEOUT_ERROR, 0, null, 'TIMEOUT');
            }

            if (error instanceof ApiError) {
                throw error;
            }

            // Обработка сетевых ошибок
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new ApiError(ERROR_MESSAGES.NETWORK_ERROR, 0, null, 'NETWORK_ERROR');
            }

            throw new ApiError(error.message || ERROR_MESSAGES.SERVER_ERROR, 0, null, 'UNKNOWN_ERROR');
        }
    }

    /**
     * Извлечение сообщения об ошибке из ответа
     */
    async extractErrorMessage(response) {
        try {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const errorData = await response.json();
                return errorData.message || errorData.error || errorData.detail;
            } else {
                const text = await response.text();
                return text || `HTTP ${response.status}`;
            }
        } catch {
            return `HTTP ${response.status}: ${response.statusText}`;
        }
    }

    /**
     * Парсинг ответа сервера
     */
    async parseResponse(response) {
        const contentType = response.headers.get('content-type');

        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        } else if (contentType && contentType.includes('text/')) {
            return await response.text();
        } else if (contentType && contentType.includes('application/octet-stream')) {
            return await response.blob();
        } else {
            // Попытка парсинга как JSON, если не получается - как текст
            const text = await response.text();
            try {
                return JSON.parse(text);
            } catch {
                return text;
            }
        }
    }

    /**
     * Проверка на повторяемую ошибку
     */
    isRetryableError(error) {
        if (error instanceof ApiError) {
            // Повторяем только для серверных ошибок или сетевых проблем
            return error.status >= 500 || error.status === 0 || error.type === 'NETWORK_ERROR';
        }

        // Повторяем для сетевых ошибок
        return error.name === 'NetworkError' || error.name === 'TypeError';
    }

    /**
     * Отмена запроса
     */
    cancelRequest(endpoint, method = 'GET', data) {
        const url = `${this.baseURL}${endpoint}`;
        const requestKey = this.createRequestKey(url, method, data);
        const controller = this.activeRequests.get(requestKey);

        if (controller) {
            controller.abort();
            this.activeRequests.delete(requestKey);
            logger.debug('Request cancelled', { endpoint, method });
            return true;
        }

        return false;
    }

    /**
     * Отмена всех активных запросов
     */
    cancelAllRequests() {
        const count = this.activeRequests.size;
        for (const [key, controller] of this.activeRequests) {
            controller.abort();
        }
        this.activeRequests.clear();
        logger.debug(`Cancelled ${count} active requests`);
    }

    /**
     * Очистка кэша
     */
    clearCache() {
        const count = this.cache.size;
        this.cache.clear();
        logger.debug(`Cleared ${count} cached responses`);
    }

    // ===========================================
    // МЕТОДЫ-ОБЁРТКИ ДЛЯ УДОБСТВА
    // ===========================================

    /**
     * GET запрос
     */
    async get(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'GET' });
    }

    /**
     * POST запрос
     */
    async post(endpoint, data, options = {}) {
        return this.request(endpoint, { ...options, method: 'POST', data, cache: false });
    }

    /**
     * PUT запрос
     */
    async put(endpoint, data, options = {}) {
        return this.request(endpoint, { ...options, method: 'PUT', data, cache: false });
    }

    /**
     * PATCH запрос
     */
    async patch(endpoint, data, options = {}) {
        return this.request(endpoint, { ...options, method: 'PATCH', data, cache: false });
    }

    /**
     * DELETE запрос
     */
    async delete(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'DELETE', cache: false });
    }

    /**
     * Загрузка файла
     */
    async upload(endpoint, fileOrFormData, options = {}) {
        let formData;

        if (fileOrFormData instanceof FormData) {
            formData = fileOrFormData;
        } else if (fileOrFormData instanceof File) {
            formData = new FormData();
            formData.append('file', fileOrFormData);
        } else {
            throw new Error('Expected File or FormData object');
        }

        // Дополнительные поля
        if (options.fields) {
            Object.entries(options.fields).forEach(([key, value]) => {
                formData.append(key, value);
            });
        }

        const uploadOptions = {
            ...options,
            method: 'POST',
            data: formData,
            cache: false,
            headers: {
                ...options.headers
                // Content-Type will be set automatically by the browser
            }
        };

        // Remove Content-Type header to let browser set it with boundary
        delete uploadOptions.headers['Content-Type'];

        return this.request(endpoint, uploadOptions);
    }

    /**
     * Скачивание файла
     */
    async download(endpoint, options = {}) {
        const downloadOptions = {
            ...options,
            headers: {
                'Accept': 'application/octet-stream',
                ...options.headers
            }
        };

        const response = await this.request(endpoint, downloadOptions);

        if (response instanceof Blob) {
            return response;
        }

        throw new Error('Response is not a downloadable file');
    }
}

/**
 * Создание экземпляра API клиента по умолчанию
 */
const defaultApiClient = new ApiClient();

// Добавляем глобальные перехватчики
defaultApiClient.addRequestInterceptor((config) => {
    // Добавляем timestamp для предотвращения кэширования
    if (config.method === 'GET') {
        const url = new URL(config.url || '', window.location.origin);
        url.searchParams.set('_t', Date.now().toString());
        config.url = url.toString();
    }
    return config;
});

defaultApiClient.addResponseInterceptor((response) => {
    // Логирование всех ответов
    logger.debug('API Response', {
        url: response.url,
        status: response.status,
        statusText: response.statusText
    });

    return response;
});

/**
 * Специализированные API методы для IP Roast
 */
export const IPRoastAPI = {
    // Аутентификация
    auth: {
        async login(credentials) {
            logger.info('Attempting login', { username: credentials.username });
            const response = await defaultApiClient.post('/auth/login', credentials);
            if (response.token) {
                defaultApiClient.setAuthToken(response.token);
            }
            return response;
        },

        async logout() {
            logger.info('Logging out');
            const response = await defaultApiClient.post('/auth/logout');
            defaultApiClient.setAuthToken(null);
            return response;
        },

        async refreshToken() {
            logger.debug('Refreshing token');
            return defaultApiClient.post('/auth/refresh');
        },

        async getProfile() {
            return defaultApiClient.get('/auth/profile');
        },

        async updateProfile(data) {
            logger.info('Updating profile');
            return defaultApiClient.put('/auth/profile', data);
        }
    },

    // Сканирование сети
    scanning: {
        async startScan(config) {
            logger.info('Starting scan', { config });
            return defaultApiClient.post('/scan/start', config);
        },

        async getScanStatus(scanId) {
            return defaultApiClient.get(`/scan/${scanId}/status`);
        },

        async getScanResults(scanId) {
            return defaultApiClient.get(`/scan/${scanId}/results`);
        },

        async stopScan(scanId) {
            logger.info('Stopping scan', { scanId });
            return defaultApiClient.post(`/scan/${scanId}/stop`);
        },

        async getScans(params = {}) {
            const query = new URLSearchParams(params).toString();
            return defaultApiClient.get(`/scans${query ? '?' + query : ''}`);
        },

        async deleteScan(scanId) {
            logger.info('Deleting scan', { scanId });
            return defaultApiClient.delete(`/scan/${scanId}`);
        }
    },

    // Сетевые устройства
    devices: {
        async getDevices(params = {}) {
            const query = new URLSearchParams(params).toString();
            return defaultApiClient.get(`/devices${query ? '?' + query : ''}`);
        },

        async getDevice(deviceId) {
            return defaultApiClient.get(`/devices/${deviceId}`);
        },

        async updateDevice(deviceId, data) {
            logger.info('Updating device', { deviceId });
            return defaultApiClient.put(`/devices/${deviceId}`, data);
        },

        async deleteDevice(deviceId) {
            logger.info('Deleting device', { deviceId });
            return defaultApiClient.delete(`/devices/${deviceId}`);
        },

        async getDeviceStatistics() {
            return defaultApiClient.get('/devices/stats');
        }
    },

    // Уязвимости
    vulnerabilities: {
        async getVulnerabilities(params = {}) {
            const query = new URLSearchParams(params).toString();
            return defaultApiClient.get(`/vulnerabilities${query ? '?' + query : ''}`);
        },

        async getVulnerability(vulnId) {
            return defaultApiClient.get(`/vulnerabilities/${vulnId}`);
        },

        async updateVulnerability(vulnId, data) {
            logger.info('Updating vulnerability status', { vulnId, status: data.status });
            return defaultApiClient.patch(`/vulnerabilities/${vulnId}`, data);
        },

        async getVulnerabilityStatistics() {
            return defaultApiClient.get('/vulnerabilities/stats');
        },

        async getCriticalVulnerabilities() {
            return defaultApiClient.get('/vulnerabilities/critical');
        }
    },

    // Модули атак
    attacks: {
        async getModules() {
            return defaultApiClient.get('/attack-modules');
        },

        async getModule(moduleId) {
            return defaultApiClient.get(`/attack-modules/${moduleId}`);
        },

        async runAttack(config) {
            logger.info('Running attack', { module: config.module, target: config.target });
            return defaultApiClient.post('/attacks/run', config);
        },

        async getAttackStatus(attackId) {
            return defaultApiClient.get(`/attacks/${attackId}/status`);
        },

        async getAttackResults(attackId) {
            return defaultApiClient.get(`/attacks/${attackId}/results`);
        },

        async stopAttack(attackId) {
            logger.info('Stopping attack', { attackId });
            return defaultApiClient.post(`/attacks/${attackId}/stop`);
        },

        async getAttackHistory(params = {}) {
            const query = new URLSearchParams(params).toString();
            return defaultApiClient.get(`/attacks/history${query ? '?' + query : ''}`);
        }
    },

    // Отчеты
    reports: {
        async getReports(params = {}) {
            const query = new URLSearchParams(params).toString();
            return defaultApiClient.get(`/reports${query ? '?' + query : ''}`);
        },

        async getReport(reportId) {
            return defaultApiClient.get(`/reports/${reportId}`);
        },

        async generateReport(config) {
            logger.info('Generating report', { type: config.type, format: config.format });
            return defaultApiClient.post('/reports/generate', config);
        },

        async downloadReport(reportId, format = 'pdf') {
            logger.info('Downloading report', { reportId, format });
            return defaultApiClient.download(`/reports/${reportId}/download?format=${format}`);
        },

        async deleteReport(reportId) {
            logger.info('Deleting report', { reportId });
            return defaultApiClient.delete(`/reports/${reportId}`);
        },

        async getReportTemplates() {
            return defaultApiClient.get('/reports/templates');
        }
    },

    // Системные настройки
    system: {
        async getSettings() {
            return defaultApiClient.get('/system/settings');
        },

        async updateSettings(settings) {
            logger.info('Updating system settings');
            return defaultApiClient.put('/system/settings', settings);
        },

        async getSystemStatus() {
            return defaultApiClient.get('/system/status');
        },

        async getLogs(params = {}) {
            const query = new URLSearchParams(params).toString();
            return defaultApiClient.get(`/system/logs${query ? '?' + query : ''}`);
        },

        async exportLogs(params = {}) {
            const query = new URLSearchParams(params).toString();
            return defaultApiClient.download(`/system/logs/export${query ? '?' + query : ''}`);
        },

        async getSystemInfo() {
            return defaultApiClient.get('/system/info');
        }
    },

    // Статистика и аналитика
    analytics: {
        async getDashboardStats() {
            return defaultApiClient.get('/analytics/dashboard');
        },

        async getNetworkTopology() {
            return defaultApiClient.get('/analytics/topology');
        },

        async getThreatIntelligence() {
            return defaultApiClient.get('/analytics/threats');
        },

        async getActivityFeed(params = {}) {
            const query = new URLSearchParams(params).toString();
            return defaultApiClient.get(`/analytics/activity${query ? '?' + query : ''}`);
        },

        async getSecurityMetrics(timeRange = '24h') {
            return defaultApiClient.get(`/analytics/security-metrics?range=${timeRange}`);
        },

        async getComplianceReport(framework = 'nist') {
            return defaultApiClient.get(`/analytics/compliance?framework=${framework}`);
        }
    },

    // Уведомления
    notifications: {
        async getNotifications(params = {}) {
            const query = new URLSearchParams(params).toString();
            return defaultApiClient.get(`/notifications${query ? '?' + query : ''}`);
        },

        async markAsRead(notificationId) {
            return defaultApiClient.patch(`/notifications/${notificationId}`, { read: true });
        },

        async markAllAsRead() {
            return defaultApiClient.post('/notifications/mark-all-read');
        },

        async deleteNotification(notificationId) {
            return defaultApiClient.delete(`/notifications/${notificationId}`);
        },

        async getUnreadCount() {
            return defaultApiClient.get('/notifications/unread-count');
        }
    }
};

// Настройка перехватчиков для обработки ошибок аутентификации
defaultApiClient.addResponseInterceptor((response) => {
    if (response.status === 401) {
        logger.warn('Authentication failed, clearing token');
        defaultApiClient.setAuthToken(null);
        // Можно добавить редирект на страницу входа
        // window.location.href = '/login';
    }
    return response;
});

// Периодическая очистка кэша
setInterval(() => {
    defaultApiClient.cleanupCache();
}, 60000); // Каждую минуту

// Экспорт для использования в других модулях - убрана дублирующая строка
export { defaultApiClient };

export default {
    ApiClient,
    ApiError,
    IPRoastAPI,
    defaultApiClient
};