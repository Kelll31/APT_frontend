/**
 * IP Roast Frontend - API Client
 * Централизованный клиент для работы с API корпоративной платформы кибербезопасности
 * Версия: Lite 1.0
 */

class ApiClient {
    constructor(baseURL = '/api', options = {}) {
        this.baseURL = baseURL;
        this.timeout = options.timeout || 30000;
        this.retryCount = options.retryCount || 3;
        this.retryDelay = options.retryDelay || 1000;

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
        this.cacheTimeout = options.cacheTimeout || 300000; // 5 минут
    }

    /**
     * Установка токена авторизации
     */
    setAuthToken(token) {
        this.authToken = token;
        if (token) {
            this.defaultHeaders['Authorization'] = `Bearer ${token}`;
        } else {
            delete this.defaultHeaders['Authorization'];
        }
    }

    /**
     * Добавление перехватчика запросов
     */
    addRequestInterceptor(interceptor) {
        this.interceptors.request.push(interceptor);
    }

    /**
     * Добавление перехватчика ответов
     */
    addResponseInterceptor(interceptor) {
        this.interceptors.response.push(interceptor);
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
            return cached.data;
        }
        this.cache.delete(key);
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
            cache = true,
            retry = true,
            signal
        } = options;

        const url = `${this.baseURL}${endpoint}`;

        // Создание уникального ключа запроса
        const requestKey = this.createRequestKey(url, method, data);

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
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        // Сохранение активного запроса
        this.activeRequests.set(requestKey, controller);

        try {
            // Подготовка заголовков
            const requestHeaders = {
                ...this.defaultHeaders,
                ...headers
            };

            // Применение перехватчиков запросов
            let requestConfig = {
                method: method.toUpperCase(),
                headers: requestHeaders,
                signal: requestSignal
            };

            if (data && method.toUpperCase() !== 'GET') {
                requestConfig.body = JSON.stringify(data);
            }

            // Применение перехватчиков запросов
            for (const interceptor of this.interceptors.request) {
                requestConfig = await interceptor(requestConfig);
            }

            // Выполнение запроса с повторными попытками
            let lastError;
            const maxRetries = retry ? this.retryCount : 1;

            for (let attempt = 1; attempt <= maxRetries; attempt++) {
                try {
                    const response = await fetch(url, requestConfig);

                    clearTimeout(timeoutId);
                    this.activeRequests.delete(requestKey);

                    // Применение перехватчиков ответов
                    let processedResponse = response;
                    for (const interceptor of this.interceptors.response) {
                        processedResponse = await interceptor(processedResponse);
                    }

                    if (!processedResponse.ok) {
                        throw new ApiError(
                            `HTTP ${processedResponse.status}: ${processedResponse.statusText}`,
                            processedResponse.status,
                            processedResponse
                        );
                    }

                    // Парсинг ответа
                    const contentType = processedResponse.headers.get('content-type');
                    let responseData;

                    if (contentType && contentType.includes('application/json')) {
                        responseData = await processedResponse.json();
                    } else if (contentType && contentType.includes('text/')) {
                        responseData = await processedResponse.text();
                    } else {
                        responseData = await processedResponse.blob();
                    }

                    // Сохранение в кэш для GET запросов
                    if (method.toUpperCase() === 'GET' && cache) {
                        this.saveToCache(requestKey, responseData);
                    }

                    return responseData;

                } catch (error) {
                    lastError = error;

                    // Если это не последняя попытка и ошибка повторяемая
                    if (attempt < maxRetries && this.isRetryableError(error)) {
                        await this.delay(this.retryDelay * attempt);
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
                throw new ApiError('Запрос был отменен', 0, null, 'CANCELED');
            }

            throw error;
        }
    }

    /**
     * Проверка на повторяемую ошибку
     */
    isRetryableError(error) {
        if (error instanceof ApiError) {
            // Повторяем только для серверных ошибок
            return error.status >= 500 || error.status === 0;
        }

        // Повторяем для сетевых ошибок
        return error.name === 'NetworkError' || error.name === 'TypeError';
    }

    /**
     * Задержка
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
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
            return true;
        }

        return false;
    }

    /**
     * Отмена всех активных запросов
     */
    cancelAllRequests() {
        for (const [key, controller] of this.activeRequests) {
            controller.abort();
        }
        this.activeRequests.clear();
    }

    /**
     * Очистка кэша
     */
    clearCache() {
        this.cache.clear();
    }

    // Методы-обёртки для удобства

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
        return this.request(endpoint, { ...options, method: 'POST', data });
    }

    /**
     * PUT запрос
     */
    async put(endpoint, data, options = {}) {
        return this.request(endpoint, { ...options, method: 'PUT', data });
    }

    /**
     * PATCH запрос
     */
    async patch(endpoint, data, options = {}) {
        return this.request(endpoint, { ...options, method: 'PATCH', data });
    }

    /**
     * DELETE запрос
     */
    async delete(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'DELETE' });
    }

    /**
     * Загрузка файла
     */
    async upload(endpoint, file, options = {}) {
        const formData = new FormData();
        formData.append('file', file);

        // Дополнительные поля
        if (options.fields) {
            Object.entries(options.fields).forEach(([key, value]) => {
                formData.append(key, value);
            });
        }

        const uploadHeaders = { ...options.headers };
        delete uploadHeaders['Content-Type']; // Браузер установит автоматически

        return this.request(endpoint, {
            ...options,
            method: 'POST',
            headers: uploadHeaders,
            body: formData
        });
    }
}

/**
 * Класс для API ошибок
 */
class ApiError extends Error {
    constructor(message, status = 0, response = null, type = 'API_ERROR') {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.response = response;
        this.type = type;
        this.timestamp = new Date().toISOString();
    }

    toJSON() {
        return {
            name: this.name,
            message: this.message,
            status: this.status,
            type: this.type,
            timestamp: this.timestamp
        };
    }
}

/**
 * Создание экземпляра API клиента по умолчанию
 */
const defaultApiClient = new ApiClient();

/**
 * Специализированные API методы для IP Roast
 */
const IPRoastAPI = {
    // Аутентификация
    auth: {
        async login(credentials) {
            return defaultApiClient.post('/auth/login', credentials);
        },

        async logout() {
            return defaultApiClient.post('/auth/logout');
        },

        async refreshToken() {
            return defaultApiClient.post('/auth/refresh');
        },

        async getProfile() {
            return defaultApiClient.get('/auth/profile');
        }
    },

    // Сканирование сети
    scanning: {
        async startScan(config) {
            return defaultApiClient.post('/scan/start', config);
        },

        async getScanStatus(scanId) {
            return defaultApiClient.get(`/scan/${scanId}/status`);
        },

        async getScanResults(scanId) {
            return defaultApiClient.get(`/scan/${scanId}/results`);
        },

        async stopScan(scanId) {
            return defaultApiClient.post(`/scan/${scanId}/stop`);
        },

        async getScans(params = {}) {
            const query = new URLSearchParams(params).toString();
            return defaultApiClient.get(`/scans${query ? '?' + query : ''}`);
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
            return defaultApiClient.put(`/devices/${deviceId}`, data);
        },

        async deleteDevice(deviceId) {
            return defaultApiClient.delete(`/devices/${deviceId}`);
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
            return defaultApiClient.patch(`/vulnerabilities/${vulnId}`, data);
        }
    },

    // Модули атак
    attacks: {
        async getModules() {
            return defaultApiClient.get('/attack-modules');
        },

        async runAttack(config) {
            return defaultApiClient.post('/attacks/run', config);
        },

        async getAttackStatus(attackId) {
            return defaultApiClient.get(`/attacks/${attackId}/status`);
        },

        async getAttackResults(attackId) {
            return defaultApiClient.get(`/attacks/${attackId}/results`);
        },

        async stopAttack(attackId) {
            return defaultApiClient.post(`/attacks/${attackId}/stop`);
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
            return defaultApiClient.post('/reports/generate', config);
        },

        async downloadReport(reportId, format = 'pdf') {
            return defaultApiClient.get(`/reports/${reportId}/download?format=${format}`, {
                headers: { 'Accept': 'application/octet-stream' }
            });
        },

        async deleteReport(reportId) {
            return defaultApiClient.delete(`/reports/${reportId}`);
        }
    },

    // Системные настройки
    system: {
        async getSettings() {
            return defaultApiClient.get('/system/settings');
        },

        async updateSettings(settings) {
            return defaultApiClient.put('/system/settings', settings);
        },

        async getSystemStatus() {
            return defaultApiClient.get('/system/status');
        },

        async getLogs(params = {}) {
            const query = new URLSearchParams(params).toString();
            return defaultApiClient.get(`/system/logs${query ? '?' + query : ''}`);
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
        }
    }
};

// Экспорт для использования в других модулях
export { ApiClient, ApiError, IPRoastAPI };