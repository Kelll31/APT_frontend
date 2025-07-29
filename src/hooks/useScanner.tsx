import { useState, useEffect, useCallback, useRef } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useNotifications } from '@/hooks/useNotifications';
import { scannerApi } from '@/services/scannerApi';
import { validateScanTarget } from '@/utils/validators';
import type { ScanResult } from '@/types/scanner';

// Интерфейсы и типы
interface ValidationResult {
    isValid: boolean;
    errors?: string[];
}

export interface ExtraPortsInfo {
    state: string;
    count: number;
    reasons: Array<{
        reason: string;
        count: number;
    }>;
}


export interface ScanData {
    target: string;
    ports: string;
    profile: string;
    options: Record<string, any>;
}

export interface ScanProfile {
    name: string;
    description: string;
    ports: string;
    options: Record<string, any>;
    warnings: string[];
}

export interface ScanProgress {
    scanId: string;
    progress: number;
    stage: string;
    currentTarget?: string;
    foundPorts: number;
    totalTargets: number;
    completedTargets: number;
    estimatedTimeRemaining?: number;
}

export interface CurrentScan {
    id: string;
    target: string;
    status: 'running' | 'stopping' | 'completed' | 'failed';
    startTime: Date;
    progress?: ScanProgress;
}

export interface UseScannerState {
    // Основные состояния
    isScanning: boolean;
    isInitialized: boolean;
    isConnected: boolean;

    // Данные сканирования
    scanData: ScanData;
    currentScan: CurrentScan | null;
    scanHistory: ScanResult[];
    scanProgress: ScanProgress | null;

    // Профили сканирования
    availableProfiles: Record<string, ScanProfile>;
    selectedProfile: string;

    // Ошибки и статус
    error: string | null;
    lastValidationResult: ValidationResult | null;
}

export interface UseScannerActions {
    // Основные действия
    startScan: (data: ScanData) => Promise<boolean>;
    stopScan: () => Promise<void>;
    validateScanTarget: (target: string) => Promise<boolean>;
    // Управление данными
    updateScanData: (updates: Partial<ScanData>) => void;
    setSelectedProfile: (profile: string) => void;
    // Работа с историей
    loadScanHistory: () => Promise<void>;
    deleteScan: (scanId: string) => Promise<void>;
    exportScanResults: (scanId: string, format: 'json' | 'csv' | 'excel' | 'pdf') => Promise<void>; 
    // Утилиты
    clearError: () => void;
    resetState: () => void;
}

export interface UseScannerReturn extends UseScannerState, UseScannerActions { }

// Константы
const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:8080/scanner';

const DEFAULT_SCAN_DATA: ScanData = {
    target: '',
    ports: '1-1000',
    profile: 'balanced',
    options: {}
};

const DEFAULT_PROFILES: Record<string, ScanProfile> = {
    quick: {
        name: 'Быстрое сканирование',
        description: 'Сканирование основных портов',
        ports: '21,22,23,25,53,80,110,143,443,993,995',
        options: {
            timing_template: 4,
            enable_scripts: false,
            version_detection: false,
            os_detection: false
        },
        warnings: []
    },
    balanced: {
        name: 'Сбалансированное сканирование',
        description: 'Оптимальное соотношение скорости и точности',
        ports: '1-1000',
        options: {
            timing_template: 3,
            enable_scripts: true,
            version_detection: true,
            os_detection: false
        },
        warnings: ['Может занять несколько минут']
    },
    thorough: {
        name: 'Полное сканирование',
        description: 'Детальное сканирование всех портов',
        ports: '1-65535',
        options: {
            timing_template: 2,
            enable_scripts: true,
            version_detection: true,
            os_detection: true,
            traceroute: true
        },
        warnings: [
            'Может занять продолжительное время',
            'Высокая нагрузка на целевую систему',
            'Может быть обнаружено системами защиты'
        ]
    }
};

// Основной хук
export const useScanner = (): UseScannerReturn => {
    const { addNotification } = useNotifications();
    const { connectionStatus, sendJsonMessage, lastMessage, connect, disconnect } = useWebSocket(WS_URL);

    // Основные состояния
    const [state, setState] = useState<UseScannerState>({
        isScanning: false,
        isInitialized: false,
        isConnected: false,
        scanData: DEFAULT_SCAN_DATA,
        currentScan: null,
        scanHistory: [],
        scanProgress: null,
        availableProfiles: DEFAULT_PROFILES,
        selectedProfile: 'balanced',
        error: null,
        lastValidationResult: null
    });

    const initializationRef = useRef(false);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

    // Инициализация
    const initialize = useCallback(async () => {
        if (initializationRef.current) return;
        initializationRef.current = true;

        try {
            setState(prev => ({ ...prev, isInitialized: false, error: null }));

            // Подключаемся к WebSocket
            connect();

            // Загружаем историю сканирований
            await loadScanHistory();

            // Проверяем активные сканирования
            await checkActiveScan();

            setState(prev => ({ ...prev, isInitialized: true }));

            addNotification({
                type: 'success',
                category: 'system',
                priority: 'low',
                title: 'Сканер инициализирован',
                message: 'Система готова к работе'
            });
        } catch (error) {
            setState(prev => ({
                ...prev,
                error: 'Ошибка инициализации сканера',
                isInitialized: false
            }));

            addNotification({
                type: 'error',
                category: 'system',
                priority: 'high',
                title: 'Ошибка инициализации',
                message: 'Не удалось инициализировать сканер'
            });
        }
    }, [connect, addNotification]);

    // Проверка активного сканирования
    const checkActiveScan = useCallback(async () => {
        try {
            // Получаем историю с фильтром по активным сканированиям
            const historyResponse = await scannerApi.getScanHistory({
                status: 'running',
                limit: 10
            });

            // Правильный доступ к данным через свойство data с проверками на undefined
            if (historyResponse?.data?.scans && historyResponse.data.scans.length > 0) {
                const activeScan = historyResponse.data.scans[0];

                // Добавляем проверку на undefined перед использованием
                if (activeScan) {
                    setState(prev => ({
                        ...prev,
                        currentScan: {
                            id: activeScan.scan_id || '',
                            target: activeScan.target || '',
                            status: (activeScan.status as CurrentScan['status']) || 'running',
                            // Используем правильное поле для времени из EnterpriseScanResult
                            startTime: new Date(activeScan.started_at || Date.now())
                        },
                        isScanning: activeScan.status === 'running'
                    }));

                    addNotification({
                        type: 'info',
                        category: 'scan',
                        priority: 'normal',
                        title: 'Активное сканирование',
                        message: `Найдено активное сканирование: ${activeScan.target}`
                    });
                }
            }
        } catch (error) {
            console.error('Ошибка проверки активного сканирования:', error);
        }
    }, [addNotification]);

    // Загрузка истории сканирований
    const loadScanHistory = useCallback(async () => {
        try {
            const historyResponse = await scannerApi.getScanHistory({ limit: 50 });

            // Обрабатываем правильную структуру ApiResponse
            let scans: ScanResult[] = [];
            if (historyResponse && historyResponse.data) {
                // Данные находятся в свойстве data
                const responseData = historyResponse.data;

                if (responseData.scans && Array.isArray(responseData.scans)) {
                    scans = responseData.scans.map((scan: any): ScanResult => {
                        // Создаем базовый объект с обязательными полями
                        const scanResult: ScanResult = {
                            // Обязательные поля
                            ip: scan.target || scan.ip || '',
                            status: (scan.status === 'completed' ? 'up' : 'unknown') as 'up' | 'down' | 'filtered' | 'unknown',
                            reason: scan.reason || 'scan completed',
                            scanTime: scan.started_at || scan.start_time || scan.scanTime || new Date().toISOString(),
                            state: {
                                state: scan.status === 'completed' ? 'up' : 'unknown',
                                reason: scan.reason || 'scan completed',
                                reasonTtl: typeof scan.reasonTtl === 'number' ? scan.reasonTtl : 0
                            },
                            address: [
                                {
                                    addr: scan.target || scan.ip || '',
                                    addrtype: 'ipv4' as const,
                                    ...(scan.vendor && { vendor: scan.vendor })
                                }
                            ],
                            ports: {
                                // Используем spread оператор для условного добавления extraports
                                ...(scan.extra_ports ? {
                                    extraports: {
                                        state: scan.extra_ports.state || '',
                                        count: typeof scan.extra_ports.count === 'number' ? scan.extra_ports.count : 0,
                                        reasons: Array.isArray(scan.extra_ports.reasons) ?
                                            scan.extra_ports.reasons.map((reason: any) => ({
                                                reason: typeof reason === 'string' ? reason : (reason.reason || ''),
                                                count: typeof reason === 'object' && typeof reason.count === 'number' ? reason.count : 1
                                            })) : []
                                    }
                                } : {}),
                                ports: [
                                    // Объединяем все порты в один массив
                                    ...(Array.isArray(scan.open_ports) ? scan.open_ports.map((port: any) => ({
                                        portid: typeof port === 'number' ? port : (port.port || 0),
                                        protocol: 'tcp' as const,
                                        state: 'open' as const,
                                        reason: 'syn-ack',
                                        ...(typeof port === 'object' && {
                                            service: {
                                                name: port.service || 'unknown',
                                                method: 'probed' as const,
                                                conf: typeof port.confidence === 'number' ? port.confidence : 0,
                                                ...(port.product && { product: port.product }),
                                                ...(port.version && { version: port.version }),
                                                ...(Array.isArray(port.cpe) && { cpe: port.cpe })
                                            }
                                        })
                                    })) : []),
                                    ...(Array.isArray(scan.closed_ports) ? scan.closed_ports.map((port: any) => ({
                                        portid: typeof port === 'number' ? port : (port.port || 0),
                                        protocol: 'tcp' as const,
                                        state: 'closed' as const,
                                        reason: 'reset'
                                    })) : []),
                                    ...(Array.isArray(scan.filtered_ports) ? scan.filtered_ports.map((port: any) => ({
                                        portid: typeof port === 'number' ? port : (port.port || 0),
                                        protocol: 'tcp' as const,
                                        state: 'filtered' as const,
                                        reason: 'no-response'
                                    })) : [])
                                ]
                            },

                            // Условно добавляем необязательные поля только если данные валидны
                            ...(scan.hostname && { hostname: scan.hostname }),
                            ...(Array.isArray(scan.hostnames) && { hostnames: scan.hostnames }),
                            ...(typeof scan.reasonTtl === 'number' && { reasonTtl: scan.reasonTtl }),
                            ...(scan.mac_address && { mac: scan.mac_address }),
                            ...(scan.vendor && { vendor: scan.vendor }),
                            ...(typeof scan.distance === 'number' && { distance: scan.distance }),
                            ...(typeof scan.uptime === 'number' && { uptime: scan.uptime }),
                            ...(scan.lastBoot && { lastBoot: scan.lastBoot }),
                            ...(typeof scan.latency === 'number' && { latency: scan.latency }),
                            ...(scan.last_seen && { lastSeen: scan.last_seen }),
                            ...(scan.first_seen && { firstSeen: scan.first_seen }),
                            ...(scan.completed_at && { endTime: scan.completed_at }),

                            // Сложные объекты - создаем только если есть валидные данные
                            ...(scan.tcpSequence && {
                                tcpSequence: {
                                    index: typeof scan.tcpSequence.index === 'number' ? scan.tcpSequence.index : 0,
                                    difficulty: scan.tcpSequence.difficulty || 'unknown',
                                    values: Array.isArray(scan.tcpSequence.values) ? scan.tcpSequence.values : []
                                }
                            }),

                            ...(scan.ipIdSequence && {
                                ipIdSequence: {
                                    class: scan.ipIdSequence.class || 'unknown',
                                    values: Array.isArray(scan.ipIdSequence.values) ? scan.ipIdSequence.values : []
                                }
                            }),

                            ...(scan.tcpTsSequence && {
                                tcpTsSequence: {
                                    class: scan.tcpTsSequence.class || 'unknown',
                                    ...(Array.isArray(scan.tcpTsSequence.values) && { values: scan.tcpTsSequence.values })
                                }
                            }),

                            // ОС информация - только если есть валидные данные
                            ...(scan.operating_system && {
                                os: {
                                    accuracy: typeof scan.operating_system.accuracy === 'number' ? scan.operating_system.accuracy : 0,
                                    osClasses: Array.isArray(scan.operating_system.osClasses) ?
                                        scan.operating_system.osClasses.map((cls: any) => ({
                                            accuracy: typeof cls.accuracy === 'number' ? cls.accuracy : 0,
                                            ...(cls.type && { type: cls.type }),
                                            ...(cls.vendor && { vendor: cls.vendor }),
                                            ...(cls.osfamily && { osfamily: cls.osfamily }),
                                            ...(cls.osgen && { osgen: cls.osgen }),
                                            ...(Array.isArray(cls.cpe) && { cpe: cls.cpe })
                                        })) : [],
                                    osMatches: Array.isArray(scan.operating_system.osMatches) ?
                                        scan.operating_system.osMatches.map((match: any) => ({
                                            name: match.name || '',
                                            accuracy: typeof match.accuracy === 'number' ? match.accuracy : 0,
                                            line: typeof match.line === 'number' ? match.line : 0,
                                            osClasses: Array.isArray(match.osClasses) ?
                                                match.osClasses.map((cls: any) => ({
                                                    accuracy: typeof cls.accuracy === 'number' ? cls.accuracy : 0,
                                                    ...(cls.type && { type: cls.type }),
                                                    ...(cls.vendor && { vendor: cls.vendor }),
                                                    ...(cls.osfamily && { osfamily: cls.osfamily }),
                                                    ...(cls.osgen && { osgen: cls.osgen }),
                                                    ...(Array.isArray(cls.cpe) && { cpe: cls.cpe })
                                                })) : []
                                        })) : [],
                                    ...(scan.operating_system.name && { name: scan.operating_system.name }),
                                    ...(scan.operating_system.family && { family: scan.operating_system.family }),
                                    ...(scan.operating_system.generation && { generation: scan.operating_system.generation }),
                                    ...(scan.operating_system.type && { type: scan.operating_system.type }),
                                    ...(scan.operating_system.vendor && { vendor: scan.operating_system.vendor }),
                                    ...(typeof scan.operating_system.line === 'number' && { line: scan.operating_system.line }),
                                    ...(typeof scan.operating_system.used === 'boolean' && { used: scan.operating_system.used }),
                                    ...(Array.isArray(scan.operating_system.portUsed) && {
                                        portUsed: scan.operating_system.portUsed.map((port: any) => ({
                                            state: port.state || '',
                                            proto: port.proto || '',
                                            portid: typeof port.portid === 'number' ? port.portid : 0
                                        }))
                                    }),
                                    ...(scan.operating_system.fingerprint && { fingerprint: scan.operating_system.fingerprint })
                                }
                            }),

                            // Массивы портов - только если есть данные
                            ...(Array.isArray(scan.open_ports) && scan.open_ports.length > 0 && {
                                openPorts: scan.open_ports.map((port: any) => ({
                                    portid: typeof port === 'number' ? port : (port.port || 0),
                                    protocol: 'tcp' as const,
                                    state: 'open' as const,
                                    reason: 'syn-ack',
                                    service: {
                                        name: (typeof port === 'object' ? port.service : undefined) || 'unknown',
                                        method: 'probed' as const,
                                        conf: (typeof port === 'object' && typeof port.confidence === 'number') ? port.confidence : 0,
                                        ...(typeof port === 'object' && port.product && { product: port.product }),
                                        ...(typeof port === 'object' && port.version && { version: port.version }),
                                        ...(typeof port === 'object' && Array.isArray(port.cpe) && { cpe: port.cpe })
                                    }
                                }))
                            }),

                            ...(Array.isArray(scan.closed_ports) && scan.closed_ports.length > 0 && {
                                closedPorts: scan.closed_ports.map((port: any) => ({
                                    portid: typeof port === 'number' ? port : (port.port || 0),
                                    protocol: 'tcp' as const,
                                    state: 'closed' as const,
                                    reason: 'reset'
                                }))
                            }),

                            ...(Array.isArray(scan.filtered_ports) && scan.filtered_ports.length > 0 && {
                                filteredPorts: scan.filtered_ports.map((port: any) => ({
                                    portid: typeof port === 'number' ? port : (port.port || 0),
                                    protocol: 'tcp' as const,
                                    state: 'filtered' as const,
                                    reason: 'no-response'
                                }))
                            }),

                            // Дополнительные порты
                            ...(scan.extra_ports && {
                                extraPorts: {
                                    state: scan.extra_ports.state || '',
                                    count: typeof scan.extra_ports.count === 'number' ? scan.extra_ports.count : 0,
                                    reasons: Array.isArray(scan.extra_ports.reasons) ? scan.extra_ports.reasons : []
                                }
                            }),

                            // Traceroute
                            ...(Array.isArray(scan.traceroute) && {
                                traceroute: scan.traceroute.map((hop: any) => ({
                                    ttl: typeof hop.ttl === 'number' ? hop.ttl : 0,
                                    rtt: typeof hop.rtt === 'number' ? hop.rtt : 0,
                                    ip: hop.ip || '',
                                    ...(hop.hostname && { hostname: hop.hostname })
                                }))
                            }),

                            // Host скрипты
                            ...(Array.isArray(scan.host_scripts) && {
                                hostScripts: scan.host_scripts.map((script: any) => ({
                                    id: script.id || '',
                                    output: script.output || '',
                                    status: script.status || 'success',
                                    ...(script.elements && { elements: script.elements }),
                                    ...(script.args && { args: script.args }),
                                    ...(typeof script.executionTime === 'number' && { executionTime: script.executionTime }),
                                    ...(script.errorMessage && { errorMessage: script.errorMessage })
                                }))
                            }),

                            // Дополнительные данные
                            ...(scan.scripts && { scripts: scan.scripts }),
                            ...(Array.isArray(scan.vulnerabilities) && { vulnerabilities: scan.vulnerabilities }),
                            ...(Array.isArray(scan.services_found) && {
                                services: scan.services_found.map((service: any) => ({
                                    port: typeof service.port === 'number' ? service.port : 0,
                                    protocol: service.protocol || 'tcp',
                                    service: service.name || service.service || '',
                                    confidence: typeof service.confidence === 'number' ? service.confidence : 0,
                                    method: service.method || 'probed',
                                    ...(service.product && { product: service.product }),
                                    ...(service.version && { version: service.version }),
                                    ...(service.banner && { banner: service.banner }),
                                    ...(service.fingerprint && { fingerprint: service.fingerprint }),
                                    ...(Array.isArray(service.cpe) && { cpe: service.cpe }),
                                    ...(Array.isArray(service.vulnerabilities) && { vulnerabilities: service.vulnerabilities })
                                }))
                            }),
                            ...(Array.isArray(scan.certificates) && { certificates: scan.certificates }),
                            ...(Array.isArray(scan.web_technologies) && { webTechnologies: scan.web_technologies }),
                            ...(scan.reputation && { reputation: scan.reputation }),
                            ...(scan.geolocation && { geolocation: scan.geolocation }),
                            ...(scan.metadata && { metadata: scan.metadata })
                        };

                        return scanResult;
                    });
                }
            }

            setState(prev => ({ ...prev, scanHistory: scans }));
        } catch (error) {
            console.error('Ошибка загрузки истории:', error);
            setState(prev => ({ ...prev, scanHistory: [] }));
            addNotification({
                type: 'error',
                category: 'system',
                priority: 'normal',
                title: 'Ошибка загрузки',
                message: 'Не удалось загрузить историю сканирований'
            });
        }
    }, [addNotification]);


    // Валидация цели
    const validateScanTargetAction = useCallback(async (target: string): Promise<boolean> => {
        try {
            const localValidation = validateScanTarget(target);

            if (localValidation) {
                try {
                    // Используем правильный метод API
                    const apiResponse = await scannerApi.validateEnterpriseTarget(target, {
                        deep_validation: true,
                        business_context: undefined,
                        compliance_check: false,
                        threat_intelligence: false,
                        permission_check: true
                    });

                    // Получаем данные из правильного свойства
                    const validationData = apiResponse.data;
                    const result = localValidation && (validationData?.valid ?? true);

                    setState(prev => ({
                        ...prev,
                        lastValidationResult: {
                            isValid: result,
                            errors: result ? [] : [validationData?.message || 'Цель недоступна']
                        }
                    }));

                    if (!result && validationData) {
                        addNotification({
                            type: 'warning',
                            category: 'scan',
                            priority: 'normal',
                            title: 'Цель недоступна',
                            message: validationData.message || 'Указанная цель не отвечает на запросы'
                        });
                    }

                    return result;
                } catch (apiError) {
                    console.warn('API валидация недоступна, используем локальную проверку');
                    setState(prev => ({
                        ...prev,
                        lastValidationResult: { isValid: true, errors: [] }
                    }));
                    return true;
                }
            }

            setState(prev => ({
                ...prev,
                lastValidationResult: { isValid: false, errors: ['Невалидная цель'] }
            }));
            return false;
        } catch (error) {
            setState(prev => ({
                ...prev,
                lastValidationResult: { isValid: false, errors: ['Ошибка валидации'] }
            }));
            addNotification({
                type: 'error',
                category: 'scan',
                priority: 'normal',
                title: 'Ошибка валидации',
                message: 'Не удалось проверить доступность цели'
            });
            return false;
        }
    }, [addNotification]);

    // Запуск сканирования
    const startScan = useCallback(async (data: ScanData): Promise<boolean> => {
        if (state.isScanning) {
            addNotification({
                type: 'warning',
                category: 'scan',
                priority: 'normal',
                title: 'Сканирование активно',
                message: 'Дождитесь завершения текущего сканирования'
            });
            return false;
        }

        if (!data.target.trim()) {
            addNotification({
                type: 'error',
                category: 'scan',
                priority: 'normal',
                title: 'Не указана цель',
                message: 'Укажите цель для сканирования'
            });
            return false;
        }

        // Валидируем цель
        const isValidTarget = await validateScanTargetAction(data.target);
        if (!isValidTarget) {
            return false;
        }

        try {
            setState(prev => ({ ...prev, isScanning: true, error: null }));

            // Получаем профиль с проверкой на undefined
            const selectedProfile = state.availableProfiles?.[data.profile] || state.availableProfiles?.balanced || DEFAULT_PROFILES.balanced;
            if (!selectedProfile) {
                throw new Error('Выбранный профиль сканирования недоступен');
            }

            // Преобразуем данные в формат EnterpriseScanSettings
            const enterpriseSettings = {
                target: data.target,
                ports: data.ports,
                profile: data.profile as any,
                options: data.options,
                priority: 'normal' as const,
                tags: [],
                metadata: {}
            };

            // Используем правильный метод API
            const apiResponse = await scannerApi.startEnterpriseScan(enterpriseSettings);
            const scanResponse = apiResponse.data;

            if (scanResponse?.scan_id) {
                const newScan: CurrentScan = {
                    id: scanResponse.scan_id,
                    target: data.target,
                    status: 'running',
                    startTime: new Date()
                };

                setState(prev => ({
                    ...prev,
                    currentScan: newScan,
                    scanData: data
                }));

                // Отправляем через WebSocket для реального времени
                try {
                    sendJsonMessage({
                        action: 'start_scan',
                        data: enterpriseSettings,
                        scanId: scanResponse.scan_id
                    });
                } catch (wsError) {
                    console.warn('WebSocket недоступен, продолжаем без real-time обновлений');
                }

                addNotification({
                    type: 'success',
                    category: 'scan',
                    priority: 'low',
                    title: 'Сканирование запущено',
                    message: `Начато сканирование: ${data.target}`
                });

                return true;
            }

            throw new Error('Неудачный ответ от API');
        } catch (error) {
            setState(prev => ({ ...prev, isScanning: false }));
            addNotification({
                type: 'error',
                category: 'scan',
                priority: 'high',
                title: 'Ошибка запуска',
                message: error instanceof Error ? error.message : 'Не удалось запустить сканирование'
            });
            return false;
        }
    }, [state.isScanning, state.availableProfiles, validateScanTargetAction, sendJsonMessage, addNotification]);

    // Остановка сканирования
    const stopScan = useCallback(async () => {
        if (!state.currentScan) return;

        try {
            setState(prev => ({
                ...prev,
                currentScan: prev.currentScan ? {
                    ...prev.currentScan,
                    status: 'stopping'
                } : null
            }));

            await scannerApi.stopEnterpriseScan(state.currentScan.id, {
                force: false,
                save_partial_results: true,
                notify_stakeholders: false
            });

            try {
                sendJsonMessage({
                    action: 'stop_scan',
                    scanId: state.currentScan.id
                });
            } catch (wsError) {
                console.warn('WebSocket недоступен для отправки команды остановки');
            }

            addNotification({
                type: 'info',
                category: 'scan',
                priority: 'normal',
                title: 'Остановка сканирования',
                message: 'Команда остановки отправлена'
            });
        } catch (error) {
            addNotification({
                type: 'error',
                category: 'scan',
                priority: 'high',
                title: 'Ошибка остановки',
                message: 'Не удалось остановить сканирование'
            });
        }
    }, [state.currentScan, sendJsonMessage, addNotification]);

    // Обновление данных сканирования
    const updateScanData = useCallback((updates: Partial<ScanData>) => {
        setState(prev => ({
            ...prev,
            scanData: { ...prev.scanData, ...updates }
        }));
    }, []);

    // Выбор профиля
    const setSelectedProfile = useCallback((profile: string) => {
        // Добавляем проверку на существование availableProfiles
        if (state.availableProfiles && state.availableProfiles[profile]) {
            setState(prev => ({
                ...prev,
                selectedProfile: profile,
                scanData: {
                    ...prev.scanData,
                    profile,
                    ports: prev.availableProfiles?.[profile]?.ports || '1-1000'
                }
            }));
        } else {
            console.warn(`Профиль '${profile}' не найден в доступных профилях`);
            addNotification({
                type: 'warning',
                category: 'scan',
                priority: 'normal',
                title: 'Профиль не найден',
                message: `Профиль '${profile}' недоступен`
            });
        }
    }, [state.availableProfiles, addNotification]);

    // Удаление результата сканирования
    const deleteScan = useCallback(async (scanId: string) => {
        try {
            // Поскольку метода deleteScan нет в API, удаляем только локально
            setState(prev => ({
                ...prev,
                scanHistory: prev.scanHistory.filter((scan: any) => {
                    // Проверяем разные возможные поля ID
                    const itemId = scan.id || scan.scan_id || scan.scanId;
                    return itemId !== scanId;
                })
            }));

            addNotification({
                type: 'success',
                category: 'scan',
                priority: 'low',
                title: 'Удалено',
                message: 'Результаты удалены из локального списка'
            });
        } catch (error) {
            addNotification({
                type: 'error',
                category: 'scan',
                priority: 'normal',
                title: 'Ошибка удаления',
                message: 'Не удалось удалить результаты'
            });
        }
    }, [addNotification]);

    // Экспорт результатов
    const exportScanResults = useCallback(async (scanId: string, format: 'json' | 'csv' | 'excel' | 'pdf') => {
        try {
            const blob = await scannerApi.exportScanData({
                scan_ids: [scanId],
                format: format, // Теперь поддерживает только json, csv, excel, pdf
                include_metadata: true,
                include_raw_results: false
            });

            // Определяем расширение файла
            const fileExtension = format === 'excel' ? 'xlsx' : format;

            // Создаем ссылку для скачивания
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `scan_${scanId}.${fileExtension}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            addNotification({
                type: 'success',
                category: 'scan',
                priority: 'low',
                title: 'Экспорт завершен',
                message: `Результаты экспортированы в формате ${format.toUpperCase()}`
            });
        } catch (error) {
            addNotification({
                type: 'error',
                category: 'scan',
                priority: 'normal',
                title: 'Ошибка экспорта',
                message: 'Не удалось экспортировать результаты'
            });
        }
    }, [addNotification]);

    // Очистка ошибок
    const clearError = useCallback(() => {
        setState(prev => ({ ...prev, error: null }));
    }, []);

    // Сброс состояния
    const resetState = useCallback(() => {
        setState({
            isScanning: false,
            isInitialized: false,
            isConnected: false,
            scanData: DEFAULT_SCAN_DATA,
            currentScan: null,
            scanHistory: [],
            scanProgress: null,
            availableProfiles: DEFAULT_PROFILES,
            selectedProfile: 'balanced',
            error: null,
            lastValidationResult: null
        });
        initializationRef.current = false;
    }, []);

    // Обработка WebSocket сообщений
    useEffect(() => {
        if (!lastMessage) return;

        try {
            const message = JSON.parse(lastMessage.data);

            switch (message.type) {
                case 'scan_progress':
                    setState(prev => ({
                        ...prev,
                        scanProgress: message.data
                    }));
                    break;

                case 'scan_completed':
                    setState(prev => ({
                        ...prev,
                        isScanning: false,
                        currentScan: null,
                        scanProgress: null
                    }));

                    // Обновляем историю
                    loadScanHistory();

                    addNotification({
                        type: 'success',
                        category: 'scan',
                        priority: 'normal',
                        title: 'Сканирование завершено',
                        message: `Сканирование ${message.data.target} завершено успешно`
                    });
                    break;

                case 'scan_failed':
                    setState(prev => ({
                        ...prev,
                        isScanning: false,
                        currentScan: null,
                        scanProgress: null,
                        error: message.data.error
                    }));

                    addNotification({
                        type: 'error',
                        category: 'scan',
                        priority: 'high',
                        title: 'Сканирование не выполнено',
                        message: message.data.error || 'Произошла ошибка при сканировании'
                    });
                    break;

                case 'scan_stopped':
                    setState(prev => ({
                        ...prev,
                        isScanning: false,
                        currentScan: null,
                        scanProgress: null
                    }));

                    addNotification({
                        type: 'info',
                        category: 'scan',
                        priority: 'normal',
                        title: 'Сканирование остановлено',
                        message: 'Сканирование было остановлено пользователем'
                    });
                    break;
            }
        } catch (error) {
            console.error('Ошибка обработки WebSocket сообщения:', error);
        }
    }, [lastMessage, loadScanHistory, addNotification]);

    // Обновление статуса подключения
    useEffect(() => {
        setState(prev => ({
            ...prev,
            isConnected: connectionStatus === 'connected'
        }));

        // Переподключение при разрыве соединения
        if (connectionStatus === 'disconnected' && state.isInitialized) {
            reconnectTimeoutRef.current = setTimeout(() => {
                connect();
            }, 5000);
        }

        return () => {
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
        };
    }, [connectionStatus, connect, state.isInitialized]);

    // Инициализация при монтировании
    useEffect(() => {
        initialize();

        return () => {
            disconnect();
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
        };
    }, [initialize, disconnect]);

    // Возвращаем состояние и действия
    return {
        // Состояния
        ...state,

        // Действия
        startScan,
        stopScan,
        validateScanTarget: validateScanTargetAction,
        updateScanData,
        setSelectedProfile,
        loadScanHistory,
        deleteScan,
        exportScanResults,
        clearError,
        resetState
    };
};

export default useScanner;
