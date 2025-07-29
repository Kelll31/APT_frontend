// frontend/src/services/websocket.ts

/**
 * IP Roast Enterprise - WebSocket Service v3.0 ENTERPRISE
 * Современный WebSocket клиент с полной типизацией и расширенными возможностями
 */

// ===== ТИПЫ ДАННЫХ ДЛЯ WEBSOCKET =====

// Базовые типы событий
export type WebSocketEventType =
    | 'connected' | 'disconnected' | 'reconnecting' | 'error'
    | 'scan_progress' | 'scan_completed' | 'scan_stopped' | 'scan_error' | 'scan_status'
    | 'scan_joined' | 'scan_left' | 'scan_not_found'
    | 'active_scans' | 'server_connected' | 'server_error'
    | 'pong_received' | 'heartbeat' | 'rate_limit'
    | 'notification' | 'system_message' | 'user_message';

// Состояние подключения
export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';

// Настройки WebSocket
export interface WebSocketConfig {
    url?: string;
    namespace?: string;
    autoConnect?: boolean;
    reconnection?: boolean;
    reconnectionAttempts?: number;
    reconnectionDelay?: number;
    maxReconnectionDelay?: number;
    reconnectionDelayGrowFactor?: number;
    timeout?: number;
    heartbeatInterval?: number;
    transports?: ('polling' | 'websocket')[];
    upgrade?: boolean;
    forceNew?: boolean;
    query?: Record<string, any>;
    auth?: Record<string, any>;
    compression?: boolean;
    enableLogging?: boolean;
}

// Событие WebSocket
export interface WebSocketEvent<T = any> {
    type: WebSocketEventType;
    data: T;
    timestamp: string;
    source: 'client' | 'server';
    id?: string;
}

// Обработчик событий
export type EventHandler<T = any> = (data: T) => void | Promise<void>;

// Информация о подключении
export interface ConnectionInfo {
    id?: string;
    url: string;
    namespace: string;
    connected: boolean;
    connecting: boolean;
    state: ConnectionState;
    lastConnected?: string;
    lastDisconnected?: string;
    totalReconnects: number;
    uptime: number;
    transport?: string;
    authenticated?: boolean;
    permissions?: string[];
}

// Статистика WebSocket
export interface WebSocketStats {
    totalConnections: number;
    successfulConnections: number;
    failedConnections: number;
    totalMessages: number;
    messagesSent: number;
    messagesReceived: number;
    reconnectAttempts: number;
    currentUptime: number;
    totalUptime: number;
    averageLatency: number;
    lastLatency: number;
    errorCount: number;
    lastError?: string;
}

// Данные сканирования
export interface ScanProgressData {
    scan_id: string;
    progress: number;
    current_phase: string;
    message?: string;
    hosts_scanned?: number;
    ports_found?: number;
    services_found?: number;
    vulnerabilities_found?: number;
    estimated_time_remaining?: number;
    error_message?: string;
}

// Завершение сканирования
export interface ScanCompletedData {
    scan_id: string;
    status: 'completed' | 'failed' | 'cancelled';
    duration: number;
    results_summary: {
        hosts_discovered: number;
        ports_found: number;
        services_identified: number;
        vulnerabilities_detected: number;
        security_score?: number;
    };
    report_url?: string;
    next_steps?: string[];
}

// Ошибка сканирования
export interface ScanErrorData {
    scan_id: string;
    error_type: string;
    error_message: string;
    error_code?: string;
    timestamp: string;
    recoverable: boolean;
    suggested_action?: string;
}

// Активные сканирования
export interface ActiveScansData {
    count: number;
    scans: Array<{
        scan_id: string;
        target: string;
        status: string;
        progress: number;
        started_at: string;
        estimated_completion?: string;
    }>;
    system_load: {
        cpu: number;
        memory: number;
        active_threads: number;
    };
}

// Данные присоединения к сканированию
export interface JoinScanData {
    scan_id: string;
    status: 'joined' | 'already_joined' | 'not_found' | 'access_denied';
    message: string;
    scan_info?: {
        target: string;
        status: string;
        progress: number;
        started_at: string;
    };
}

// Системное сообщение
export interface SystemMessage {
    type: 'info' | 'warning' | 'error' | 'maintenance';
    title: string;
    message: string;
    action_required?: boolean;
    actions?: Array<{
        label: string;
        action: string;
        style?: 'primary' | 'secondary' | 'danger';
    }>;
    expires_at?: string;
}

// Уведомление
export interface NotificationData {
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    title: string;
    message: string;
    persistent?: boolean;
    actions?: Array<{
        label: string;
        action: string;
        style?: string;
    }>;
    metadata?: Record<string, any>;
}


// Ping/Pong данные
export interface PingPongData {
    client_time: string;
    server_time?: string | undefined;
    latency?: number | undefined;
    client_id?: string | undefined;
    uptime?: number | undefined;
}

// Настройки подписки
export interface SubscriptionSettings {
    events?: WebSocketEventType[];
    scan_types?: string[];
    notification_levels?: string[];
    rate_limit?: number;
    buffer_size?: number;
}

// Комната WebSocket
export interface WebSocketRoom {
    name: string;
    type: 'scan' | 'user' | 'global' | 'system';
    participants?: number;
    permissions?: string[];
    metadata?: Record<string, any>;
}

// Аутентификация
export interface WebSocketAuth {
    token?: string;
    user_id?: string;
    session_id?: string;
    permissions?: string[];
    expires_at?: string;
}

// ===== ОСНОВНОЙ КЛАСС WEBSOCKET SERVICE =====

/**
 * Современный WebSocket сервис с полной типизацией
 */
export class WebSocketService {
    private socket: any = null;
    private config: Required<WebSocketConfig>;
    private eventHandlers = new Map<WebSocketEventType, Set<EventHandler>>();
    private connectionInfo: ConnectionInfo;
    private stats: WebSocketStats;
    private heartbeatTimer?: NodeJS.Timeout | undefined;
    private connectionTimeout?: NodeJS.Timeout | undefined;
    private reconnectTimer?: NodeJS.Timeout | undefined;
    private messageQueue: Array<{ event: string; data: any; callback?: Function }> = [];
    private latencyMeasurements: number[] = [];
    private currentScanId?: string | undefined;
    private subscribedRooms = new Set<string>();
    private authData?: WebSocketAuth | undefined;
    private connectionPromise?: Promise<boolean> | undefined;
    private lastPingTime = 0;

    // Значения по умолчанию
    private readonly defaultConfig: Required<WebSocketConfig> = {
        url: window.location.protocol === 'https:' ? 'wss://localhost' : 'ws://localhost',
        namespace: '/scan-progress',
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        maxReconnectionDelay: 30000,
        reconnectionDelayGrowFactor: 1.5,
        timeout: 10000,
        heartbeatInterval: 30000,
        transports: ['websocket', 'polling'],
        upgrade: true,
        forceNew: false,
        query: {},
        auth: {},
        compression: true,
        enableLogging: true
    };

    constructor(config: WebSocketConfig = {}) {
        this.config = { ...this.defaultConfig, ...config };

        // Инициализация состояния
        this.connectionInfo = {
            url: this.config.url + this.config.namespace,
            namespace: this.config.namespace,
            connected: false,
            connecting: false,
            state: 'disconnected',
            totalReconnects: 0,
            uptime: 0
        };

        this.stats = {
            totalConnections: 0,
            successfulConnections: 0,
            failedConnections: 0,
            totalMessages: 0,
            messagesSent: 0,
            messagesReceived: 0,
            reconnectAttempts: 0,
            currentUptime: 0,
            totalUptime: 0,
            averageLatency: 0,
            lastLatency: 0,
            errorCount: 0
        };

        // Автоподключение
        if (this.config.autoConnect) {
            this.connect();
        }

        this.log('WebSocketService инициализирован');
    }

    // ===== УПРАВЛЕНИЕ ПОДКЛЮЧЕНИЕМ =====

    /**
     * Подключение к WebSocket серверу
     */
    async connect(): Promise<boolean> {
        if (this.connectionInfo.connected || this.connectionInfo.connecting) {
            this.log('Соединение уже установлено или устанавливается');
            return this.connectionInfo.connected;
        }

        // Если уже есть активная попытка подключения
        if (this.connectionPromise) {
            return this.connectionPromise;
        }

        this.connectionPromise = this._performConnection();
        return this.connectionPromise;
    }

    /**
     * Выполнение подключения
     */
    private async _performConnection(): Promise<boolean> {
        return new Promise<boolean>((resolve, _reject) => {
            try {
                // Проверяем наличие Socket.IO
                if (typeof window === 'undefined' || !window.io) {
                    const error = 'Socket.IO library not loaded';
                    this.handleError(error);
                    resolve(false);
                    return;
                }

                this.log('Подключение к WebSocket...');
                this.connectionInfo.connecting = true;
                this.connectionInfo.state = 'connecting';
                this.stats.totalConnections++;

                // Настройки Socket.IO
                const socketOptions = {
                    transports: this.config.transports,
                    timeout: this.config.timeout,
                    forceNew: this.config.forceNew,
                    upgrade: this.config.upgrade,
                    compression: this.config.compression,
                    autoConnect: false,
                    reconnection: false, // Управляем переподключением сами
                    query: {
                        ...this.config.query,
                        version: '3.0',
                        client: 'enterprise-web',
                        timestamp: Date.now().toString(),
                        ...(this.authData?.token ? { auth_token: this.authData.token } : {})
                    },
                    auth: {
                        ...this.config.auth,
                        ...(this.authData || {})
                    }
                };

                // Создаем соединение
                this.socket = window.io(this.config.url + this.config.namespace, socketOptions);

                // Таймаут подключения
                this.connectionTimeout = setTimeout(() => {
                    if (!this.connectionInfo.connected) {
                        this.log('Таймаут подключения', 'warning');
                        this.handleConnectionError('Connection timeout');
                        resolve(false);
                    }
                }, this.config.timeout);

                this.setupEventHandlers(resolve);

                // Подключаемся
                this.socket.connect();

            } catch (error) {
                this.handleError(`Connection error: ${error}`);
                resolve(false);
            }
        }).finally(() => {
            this.connectionPromise = undefined;
        });
    }

    /**
     * Настройка обработчиков событий Socket.IO
     */
    private setupEventHandlers(resolve: Function): void {
        if (!this.socket) return;

        // === СИСТЕМНЫЕ СОБЫТИЯ ===
        this.socket.on('connect', () => {
            this.log('WebSocket подключен успешно');
            if (this.connectionTimeout) {
                clearTimeout(this.connectionTimeout);
                this.connectionTimeout = undefined;
            }

            this.connectionInfo.connected = true;
            this.connectionInfo.connecting = false;
            this.connectionInfo.state = 'connected';
            this.connectionInfo.lastConnected = new Date().toISOString();
            this.connectionInfo.id = this.socket.id;
            this.connectionInfo.transport = this.socket.io.engine?.transport?.name;

            this.stats.successfulConnections++;
            this.stats.currentUptime = Date.now();

            this.startHeartbeat();
            this.processMessageQueue();
            this.restoreSubscriptions();

            this.emit('connected', {
                id: this.socket.id,
                transport: this.connectionInfo.transport,
                timestamp: this.connectionInfo.lastConnected
            });

            resolve(true);
        });

        this.socket.on('disconnect', (reason: string) => {
            this.log(`WebSocket отключен: ${reason}`, 'warning');
            this.connectionInfo.connected = false;
            this.connectionInfo.connecting = false;
            this.connectionInfo.state = 'disconnected';
            this.connectionInfo.lastDisconnected = new Date().toISOString();

            if (this.stats.currentUptime) {
                this.stats.totalUptime += Date.now() - this.stats.currentUptime;
                this.stats.currentUptime = 0;
            }

            this.stopHeartbeat();
            this.emit('disconnected', { reason, timestamp: this.connectionInfo.lastDisconnected });

            // Автоматическое переподключение
            if (reason !== 'io client disconnect' && this.config.reconnection) {
                this.scheduleReconnect();
            }

            if (this.connectionTimeout) {
                clearTimeout(this.connectionTimeout);
                this.connectionTimeout = undefined;
            }

            resolve(false);
        });

        this.socket.on('connect_error', (error: any) => {
            this.log(`Ошибка подключения: ${error.message || error}`, 'error');
            this.handleConnectionError(error.message || error.toString());
            resolve(false);
        });

        // === СОБЫТИЯ ПРИЛОЖЕНИЯ ===
        // Подтверждение подключения от сервера
        this.socket.on('connected', (data: any) => {
            this.log('Получено подтверждение от сервера');
            this.connectionInfo.authenticated = data.authenticated;
            this.connectionInfo.permissions = data.permissions;
            this.emit('server_connected', data);
        });

        // События сканирования
        this.socket.on('scan_progress', (data: ScanProgressData) => {
            this.log(`Прогресс сканирования ${data.scan_id}: ${data.progress}%`);
            this.stats.messagesReceived++;
            this.emit('scan_progress', data);
        });

        this.socket.on('scan_completed', (data: ScanCompletedData) => {
            this.log(`Сканирование ${data.scan_id} завершено`);
            this.emit('scan_completed', data);
        });

        this.socket.on('scan_stopped', (data: any) => {
            this.log(`Сканирование ${data.scan_id} остановлено`);
            this.emit('scan_stopped', data);
        });

        this.socket.on('scan_error', (data: ScanErrorData) => {
            this.log(`Ошибка сканирования ${data.scan_id}: ${data.error_message}`, 'error');
            this.emit('scan_error', data);
        });

        this.socket.on('scan_status', (data: any) => {
            this.log(`Статус сканирования: ${data.scan_id}`);
            this.emit('scan_status', data);
        });

        // События комнат
        this.socket.on('join_success', (data: JoinScanData) => {
            this.log(`Присоединился к сканированию: ${data.scan_id}`);
            this.currentScanId = data.scan_id;
            this.subscribedRooms.add(`scan:${data.scan_id}`);
            this.emit('scan_joined', data);
        });

        this.socket.on('leave_success', (data: any) => {
            this.log(`Покинул сканирование: ${data.scan_id}`);
            if (this.currentScanId === data.scan_id) {
                this.currentScanId = undefined;
            }
            this.subscribedRooms.delete(`scan:${data.scan_id}`);
            this.emit('scan_left', data);
        });

        this.socket.on('scan_not_found', (data: any) => {
            this.log(`Сканирование не найдено: ${data.scan_id}`, 'warning');
            this.emit('scan_not_found', data);
        });

        // Активные сканирования
        this.socket.on('active_scans', (data: ActiveScansData) => {
            this.log(`Активные сканирования: ${data.count}`);
            this.emit('active_scans', data);
        });

        // Уведомления
        this.socket.on('notification', (data: NotificationData) => {
            this.log(`Уведомление: ${data.title}`);
            this.emit('notification', data);
        });

        this.socket.on('system_message', (data: SystemMessage) => {
            this.log(`Системное сообщение: ${data.title}`);
            this.emit('system_message', data);
        });

        // Ping/Pong
        this.socket.on('pong', (data: PingPongData) => {
            const latency = Date.now() - this.lastPingTime;
            this.updateLatency(latency);
            this.emit('pong_received', { ...data, latency });
        });

        // Ошибки сервера
        this.socket.on('error', (data: any) => {
            this.log(`Ошибка сервера: ${data.message || data}`, 'error');
            this.stats.errorCount++;
            this.stats.lastError = data.message || data.toString();
            this.emit('server_error', data);
        });

        // Rate limiting
        this.socket.on('rate_limit', (data: any) => {
            this.log(`Rate limit: ${data.message}`, 'warning');
            this.emit('rate_limit', data);
        });
    }

    /**
     * Отключение от WebSocket
     */
    disconnect(): void {
        this.log('Отключение WebSocket...');
        this.stopHeartbeat();
        this.clearReconnectTimer();

        if (this.connectionTimeout) {
            clearTimeout(this.connectionTimeout);
            this.connectionTimeout = undefined;
        }

        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }

        this.connectionInfo.connected = false;
        this.connectionInfo.connecting = false;
        this.connectionInfo.state = 'disconnected';
        this.currentScanId = undefined;
        this.subscribedRooms.clear();
        this.messageQueue = [];

        this.emit('disconnected', { reason: 'client_disconnect', timestamp: new Date().toISOString() });
    }

    // ===== ПЕРЕПОДКЛЮЧЕНИЕ =====

    /**
     * Планирование переподключения
     */
    private scheduleReconnect(): void {
        if (this.connectionInfo.totalReconnects >= this.config.reconnectionAttempts) {
            this.log('Превышено максимальное количество попыток переподключения', 'error');
            this.connectionInfo.state = 'error';
            this.emit('error', {
                message: 'Max reconnection attempts exceeded',
                attempts: this.connectionInfo.totalReconnects
            });
            return;
        }

        const delay = Math.min(
            this.config.reconnectionDelay * Math.pow(this.config.reconnectionDelayGrowFactor, this.connectionInfo.totalReconnects),
            this.config.maxReconnectionDelay
        );

        this.log(`Переподключение через ${delay}ms (попытка ${this.connectionInfo.totalReconnects + 1}/${this.config.reconnectionAttempts})`);
        this.connectionInfo.state = 'reconnecting';
        this.emit('reconnecting', {
            attempt: this.connectionInfo.totalReconnects + 1,
            delay,
            maxAttempts: this.config.reconnectionAttempts
        });

        this.reconnectTimer = setTimeout(() => {
            this.connectionInfo.totalReconnects++;
            this.stats.reconnectAttempts++;
            this.connect();
        }, delay);
    }

    /**
     * Очистка таймера переподключения
     */
    private clearReconnectTimer(): void {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = undefined;
        }
    }

    // ===== HEARTBEAT =====

    /**
     * Запуск heartbeat
     */
    private startHeartbeat(): void {
        this.stopHeartbeat();
        this.heartbeatTimer = setInterval(() => {
            if (this.connectionInfo.connected) {
                this.ping();
            }
        }, this.config.heartbeatInterval);
    }

    /**
     * Остановка heartbeat
     */
    private stopHeartbeat(): void {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = undefined;
        }
    }

    /**
     * Ping сервера
     */
    ping(data: Partial<PingPongData> = {}): boolean {
        if (!this.isConnected()) {
            return false;
        }

        this.lastPingTime = Date.now();
        const pingData: PingPongData = {
            client_time: new Date().toISOString(),
            client_id: this.connectionInfo.id,
            uptime: this.getUptime(),
            ...data
        };

        return this.send('ping', pingData);
    }

    /**
     * Обновление измерений задержки
     */
    private updateLatency(latency: number): void {
        this.stats.lastLatency = latency;
        this.latencyMeasurements.push(latency);

        // Сохраняем только последние 10 измерений
        if (this.latencyMeasurements.length > 10) {
            this.latencyMeasurements = this.latencyMeasurements.slice(-10);
        }

        this.stats.averageLatency = this.latencyMeasurements.reduce((a, b) => a + b, 0) / this.latencyMeasurements.length;
    }

    // ===== ОТПРАВКА СООБЩЕНИЙ =====

    /**
     * Отправка сообщения
     */
    send(event: string, data: any = {}, callback?: Function): boolean {
        if (!this.isConnected()) {
            // Добавляем в очередь если не подключены
            this.messageQueue.push({ event, data, ...(callback ? { callback } : {}) });
            return false;
        }

        try {
            this.log(`Отправка события: ${event}`);
            if (callback) {
                this.socket.emit(event, data, callback);
            } else {
                this.socket.emit(event, data);
            }

            this.stats.messagesSent++;
            this.stats.totalMessages++;
            return true;
        } catch (error) {
            this.handleError(`Failed to send message: ${error}`);
            return false;
        }
    }

    /**
     * Обработка очереди сообщений
     */
    private processMessageQueue(): void {
        if (!this.isConnected() || this.messageQueue.length === 0) {
            return;
        }

        this.log(`Обработка очереди сообщений: ${this.messageQueue.length} шт.`);
        const queue = [...this.messageQueue];
        this.messageQueue = [];

        queue.forEach(({ event, data, callback }) => {
            this.send(event, data, callback);
        });
    }

    // ===== УПРАВЛЕНИЕ КОМНАТАМИ =====

    /**
     * Присоединение к сканированию
     */
    joinScan(scanId: string): boolean {
        if (!scanId) {
            this.log('Scan ID is required for joinScan', 'error');
            return false;
        }

        this.log(`Присоединение к сканированию: ${scanId}`);
        return this.send('join_scan', { scan_id: scanId });
    }

    /**
     * Покидание сканирования
     */
    leaveScan(scanId?: string): boolean {
        const targetScanId = scanId || this.currentScanId;
        if (!targetScanId) {
            this.log('No active scan to leave', 'warning');
            return false;
        }

        this.log(`Покидание сканирования: ${targetScanId}`);
        return this.send('leave_scan', { scan_id: targetScanId });
    }

    /**
     * Присоединение к комнате
     */
    joinRoom(roomName: string, roomType: 'scan' | 'user' | 'global' | 'system' = 'global'): boolean {
        const roomKey = `${roomType}:${roomName}`;
        this.subscribedRooms.add(roomKey);
        return this.send('join_room', {
            room: roomName,
            type: roomType
        });
    }

    /**
     * Покидание комнаты
     */
    leaveRoom(roomName: string, roomType: 'scan' | 'user' | 'global' | 'system' = 'global'): boolean {
        const roomKey = `${roomType}:${roomName}`;
        this.subscribedRooms.delete(roomKey);
        return this.send('leave_room', {
            room: roomName,
            type: roomType
        });
    }

    /**
     * Восстановление подписок после переподключения
     */
    private restoreSubscriptions(): void {
        if (this.subscribedRooms.size === 0) {
            return;
        }

        this.log(`Восстановление подписок: ${this.subscribedRooms.size} шт.`);
        this.subscribedRooms.forEach(roomKey => {
            const [type, name] = roomKey.split(':', 2);
            if (type === 'scan' && name) {
                this.joinScan(name);
            } else if (name) {
                this.joinRoom(name, type as any);
            }
        });
    }

    // ===== УПРАВЛЕНИЕ СКАНИРОВАНИЕМ =====

    /**
     * Получение статуса сканирования
     */
    getScanStatus(scanId: string): boolean {
        if (!scanId) {
            this.log('Scan ID is required for getScanStatus', 'error');
            return false;
        }

        return this.send('get_scan_status', { scan_id: scanId });
    }

    /**
     * Остановка сканирования
     */
    stopScan(scanId: string): boolean {
        if (!scanId) {
            this.log('Scan ID is required for stopScan', 'error');
            return false;
        }

        this.log(`Остановка сканирования: ${scanId}`);
        return this.send('stop_scan', { scan_id: scanId });
    }

    /**
     * Получение списка активных сканирований
     */
    getActiveScans(): boolean {
        return this.send('get_active_scans');
    }

    /**
     * Подписка на обновления
     */
    subscribe(settings: SubscriptionSettings = {}): boolean {
        return this.send('subscribe_updates', settings);
    }

    /**
     * Отписка от обновлений
     */
    unsubscribe(settings: SubscriptionSettings = {}): boolean {
        return this.send('unsubscribe_updates', settings);
    }

    // ===== АУТЕНТИФИКАЦИЯ =====

    /**
     * Установка данных аутентификации
     */
    setAuth(authData: WebSocketAuth): void {
        this.authData = authData;
        if (this.isConnected()) {
            this.send('authenticate', authData);
        }
    }

    /**
     * Очистка аутентификации
     */
    clearAuth(): void {
        this.authData = undefined;
        if (this.isConnected()) {
            this.send('unauthenticate');
        }
    }

    // ===== СОБЫТИЯ =====

    /**
     * Подписка на событие
     */
    on<T = any>(eventType: WebSocketEventType, handler: EventHandler<T>): () => void {
        if (!this.eventHandlers.has(eventType)) {
            this.eventHandlers.set(eventType, new Set());
        }

        this.eventHandlers.get(eventType)!.add(handler);

        return () => {
            const handlers = this.eventHandlers.get(eventType);
            if (handlers) {
                handlers.delete(handler);
            }
        };
    }

    /**
     * Отписка от события
     */
    off<T = any>(eventType: WebSocketEventType, handler?: EventHandler<T>): void {
        if (!handler) {
            this.eventHandlers.delete(eventType);
            return;
        }

        const handlers = this.eventHandlers.get(eventType);
        if (handlers) {
            handlers.delete(handler);
        }
    }

    /**
     * Однократная подписка на событие
     */
    once<T = any>(eventType: WebSocketEventType, handler: EventHandler<T>): () => void {
        const wrappedHandler = (data: T) => {
            handler(data);
            this.off(eventType, wrappedHandler);
        };
        return this.on(eventType, wrappedHandler);
    }

    /**
     * Генерация события
     */
    private emit<T = any>(eventType: WebSocketEventType, data: T): void {
        const handlers = this.eventHandlers.get(eventType);
        if (!handlers || handlers.size === 0) {
            return;
        }

        this.log(`Событие: ${eventType}`);

        handlers.forEach(handler => {
            try {
                handler(data);
            } catch (error) {
                this.handleError(`Event handler error for ${eventType}: ${error}`);
            }
        });
    }

    // ===== СОСТОЯНИЕ И ИНФОРМАЦИЯ =====

    /**
     * Проверка подключения
     */
    isConnected(): boolean {
        return this.connectionInfo.connected && this.socket?.connected === true;
    }

    /**
     * Проверка процесса подключения
     */
    isConnecting(): boolean {
        return this.connectionInfo.connecting;
    }

    /**
     * Получение информации о подключении
     */
    getConnectionInfo(): ConnectionInfo {
        return {
            ...this.connectionInfo,
            uptime: this.getUptime()
        };
    }

    /**
     * Получение статистики
     */
    getStats(): WebSocketStats {
        return {
            ...this.stats,
            currentUptime: this.getUptime()
        };
    }

    /**
     * Получение времени работы
     */
    getUptime(): number {
        if (!this.stats.currentUptime) {
            return 0;
        }
        return Date.now() - this.stats.currentUptime;
    }

    /**
     * Получение текущего состояния
     */
    getState(): ConnectionState {
        return this.connectionInfo.state;
    }

    /**
     * Получение ID текущего сканирования
     */
    getCurrentScanId(): string | undefined {
        return this.currentScanId;
    }

    /**
     * Получение подписанных комнат
     */
    getSubscribedRooms(): string[] {
        return Array.from(this.subscribedRooms);
    }

    // ===== УТИЛИТЫ =====

    /**
     * Обработка ошибок
     */
    private handleError(error: string | Error): void {
        const errorMessage = error instanceof Error ? error.message : error;
        this.log(errorMessage, 'error');
        this.stats.errorCount++;
        this.stats.lastError = errorMessage;
        this.emit('error', { message: errorMessage, timestamp: new Date().toISOString() });
    }

    /**
     * Обработка ошибок подключения
     */
    private handleConnectionError(error: string): void {
        this.connectionInfo.connecting = false;
        this.connectionInfo.state = 'error';
        this.stats.failedConnections++;

        if (this.connectionTimeout) {
            clearTimeout(this.connectionTimeout);
            this.connectionTimeout = undefined;
        }

        this.handleError(`Connection error: ${error}`);
    }

    /**
     * Логирование
     */
    private log(message: string, level: 'info' | 'warning' | 'error' = 'info', data?: any): void {
        if (!this.config.enableLogging) {
            return;
        }

        const prefix = '🔌 WebSocket';
        const timestamp = new Date().toISOString();

        switch (level) {
            case 'info':
                console.log(`${prefix} [${timestamp}] ${message}`, data || '');
                break;
            case 'warning':
                console.warn(`${prefix} [${timestamp}] ${message}`, data || '');
                break;
            case 'error':
                console.error(`${prefix} [${timestamp}] ${message}`, data || '');
                break;
        }
    }

    /**
     * Сброс статистики
     */
    resetStats(): void {
        this.stats = {
            totalConnections: 0,
            successfulConnections: 0,
            failedConnections: 0,
            totalMessages: 0,
            messagesSent: 0,
            messagesReceived: 0,
            reconnectAttempts: 0,
            currentUptime: this.isConnected() ? Date.now() : 0,
            totalUptime: 0,
            averageLatency: 0,
            lastLatency: 0,
            errorCount: 0
        };
        this.latencyMeasurements = [];
    }

    /**
     * Обновление конфигурации
     */
    updateConfig(newConfig: Partial<WebSocketConfig>): void {
        this.config = { ...this.config, ...newConfig };
        this.connectionInfo.url = this.config.url + this.config.namespace;
    }

    /**
     * Очистка ресурсов
     */
    cleanup(): void {
        this.log('Очистка WebSocket ресурсов...');
        this.disconnect();
        this.eventHandlers.clear();
        this.messageQueue = [];
        this.subscribedRooms.clear();
        this.authData = undefined;

        if (this.connectionTimeout) {
            clearTimeout(this.connectionTimeout);
        }

        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
        }
    }

    /**
     * Получение информации для отладки
     */
    getDebugInfo(): any {
        return {
            config: this.config,
            connectionInfo: this.getConnectionInfo(),
            stats: this.getStats(),
            eventHandlers: Array.from(this.eventHandlers.keys()),
            messageQueueSize: this.messageQueue.length,
            subscribedRooms: this.getSubscribedRooms(),
            socketState: this.socket ? {
                connected: this.socket.connected,
                id: this.socket.id,
                transport: this.socket.io?.engine?.transport?.name
            } : null,
            authData: this.authData ? { ...this.authData, token: '[HIDDEN]' } : null
        };
    }
}

// ===== ФАБРИКА И ЭКСПОРТ =====

/**
 * Создание экземпляра WebSocket сервиса
 */
export function createWebSocketService(config?: WebSocketConfig): WebSocketService {
    return new WebSocketService(config);
}

/**
 * Глобальный экземпляр WebSocket сервиса
 */
export const websocketService = createWebSocketService();

// Экспорт для отладки в development режиме
if (import.meta.env.DEV) {
    (window as any).__WEBSOCKET_SERVICE__ = websocketService;
    console.log('🔧 WebSocket Service доступен глобально как __WEBSOCKET_SERVICE__');
}

export default websocketService;
