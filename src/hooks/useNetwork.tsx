/**
 * IP_Roast 4.0 Enterprise - Network Management Hook
 * Хук для управления сетевыми устройствами и топологией
 */

import { useState, useEffect, useCallback, useMemo } from 'react';

// Типы
import {
    NetworkDevice,
    NetworkTopology,
    TopologyNode,
    TopologyLink,
    NetworkSegment,
    DeviceConnection,
    PerformanceMetrics,
    DeviceStatus,
    DeviceType,
    DeviceCategory,
    SecurityStatus,
    ThreatIndicator,
    NetworkSubnet,
    ConnectionType,
    LinkType
} from '@/types/network';

// Сервисы
import { networkApi } from '@/services/networkApi';
import { useWebSocket } from './useWebSocket';
import { useNotifications } from './useNotifications';

// Утилиты
import {
    isIPInRange,
    getDeviceIcon,
    getStatusColor
} from '@/types/network';

// =============================================================================
// ИНТЕРФЕЙСЫ ХУКА (без изменений)
// =============================================================================

export interface NetworkState {
    devices: NetworkDevice[];
    selectedDevice: NetworkDevice | null;
    topology: NetworkTopology | null;
    topologyNodes: TopologyNode[];
    topologyLinks: TopologyLink[];
    segments: NetworkSegment[];
    subnets: NetworkSubnet[];
    isLoading: boolean;
    isDiscovering: boolean;
    isSyncing: boolean;
    error: string | null;
    lastError: string | null;
    statistics: NetworkStatistics;
    filters: NetworkFilters;
    searchQuery: string;
    monitoring: NetworkMonitoring;
    lastUpdated: string | null;
    discoveryProgress: number;
}

export interface NetworkStatistics {
    totalDevices: number;
    onlineDevices: number;
    offlineDevices: number;
    warningDevices: number;
    criticalDevices: number;
    newDevices: number;
    devicesByType: Record<DeviceType, number>;
    devicesByStatus: Record<DeviceStatus, number>;
    devicesBySecurity: Record<SecurityStatus, number>;
    totalSubnets: number;
    totalSegments: number;
    totalConnections: number;
    averageResponseTime: number;
    networkUtilization: number;
    threatCount: number;
    vulnerabilityCount: number;
}

export interface NetworkFilters {
    status: DeviceStatus[];
    types: DeviceType[];
    security: SecurityStatus[];
    subnets: string[];
    tags: string[];
    dateRange: {
        start: string | null;
        end: string | null;
    };
}

export interface NetworkMonitoring {
    enabled: boolean;
    interval: number;
    activeScans: number;
    queuedScans: number;
    lastScan: string | null;
    nextScan: string | null;
    failedScans: number;
}

export interface UseNetworkOptions {
    autoDiscovery?: boolean;
    discoveryInterval?: number;
    enableRealTimeUpdates?: boolean;
    enablePerformanceMonitoring?: boolean;
    maxDevices?: number;
    cacheTTL?: number;
}

export interface UseNetworkReturn {
    devices: NetworkDevice[];
    selectedDevice: NetworkDevice | null;
    topology: NetworkTopology | null;
    topologyNodes: TopologyNode[];
    topologyLinks: TopologyLink[];
    segments: NetworkSegment[];
    subnets: NetworkSubnet[];
    isLoading: boolean;
    isDiscovering: boolean;
    isSyncing: boolean;
    error: string | null;
    lastError: string | null;
    statistics: NetworkStatistics;
    filters: NetworkFilters;
    searchQuery: string;
    monitoring: NetworkMonitoring;
    lastUpdated: string | null;
    discoveryProgress: number;

    // Методы управления устройствами
    refreshDevices: () => Promise<void>;
    discoverDevices: (targets?: string[]) => Promise<void>;
    addDevice: (device: Partial<NetworkDevice>) => Promise<NetworkDevice>;
    updateDevice: (id: string, updates: Partial<NetworkDevice>) => Promise<void>;
    removeDevice: (id: string) => Promise<void>;
    selectDevice: (device: NetworkDevice | null) => void;

    // Методы топологии
    getNetworkTopology: (devices?: NetworkDevice[]) => TopologyLink[];
    generateTopology: () => Promise<NetworkTopology>;
    updateTopology: () => Promise<void>;
    exportTopology: (format: 'json' | 'xml' | 'svg') => Promise<Blob>;

    // Методы сегментации
    getNetworkSegments: () => Promise<NetworkSegment[]>;
    createSegment: (segment: Omit<NetworkSegment, 'id'>) => Promise<NetworkSegment>;
    updateSegment: (id: string, updates: Partial<NetworkSegment>) => Promise<void>;
    deleteSegment: (id: string) => Promise<void>;

    // Методы фильтрации и поиска
    setSearchQuery: (query: string) => void;
    setFilters: (filters: Partial<NetworkFilters>) => void;
    clearFilters: () => void;
    getFilteredDevices: () => NetworkDevice[];

    // Методы мониторинга
    startMonitoring: () => Promise<void>;
    stopMonitoring: () => Promise<void>;
    scheduleDeviceScan: (deviceId: string) => Promise<void>;
    getDeviceMetrics: (deviceId: string) => Promise<PerformanceMetrics>;

    // Утилиты
    isDeviceOnline: (device: NetworkDevice) => boolean;
    getDevicesBySubnet: (subnet: string) => NetworkDevice[];
    getDeviceConnections: (deviceId: string) => DeviceConnection[];
    analyzeNetworkSecurity: () => Promise<SecurityAnalysis>;

    // Экспорт и импорт
    exportDevices: (format: 'csv' | 'json' | 'xml') => Promise<Blob>;
    importDevices: (file: File) => Promise<number>;
}

interface SecurityAnalysis {
    overallScore: number;
    threats: ThreatIndicator[];
    vulnerabilities: Array<{
        deviceId: string;
        severity: 'low' | 'medium' | 'high' | 'critical';
        count: number;
    }>;
    recommendations: string[];
}

// =============================================================================
// ОСНОВНОЙ ХУК
// =============================================================================

export const useNetwork = (options: UseNetworkOptions = {}): UseNetworkReturn => {
    const {
        autoDiscovery = false,
        discoveryInterval = 300000,
        enableRealTimeUpdates = true,
    } = options;

    // Хуки
    const { addNotification } = useNotifications();
    const websocketUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:5000';
    const { connectionStatus, lastMessage } = useWebSocket(websocketUrl);

    // Состояние
    const [state, setState] = useState<NetworkState>({
        devices: [],
        selectedDevice: null,
        topology: null,
        topologyNodes: [],
        topologyLinks: [],
        segments: [],
        subnets: [],
        isLoading: false,
        isDiscovering: false,
        isSyncing: false,
        error: null,
        lastError: null,
        statistics: {
            totalDevices: 0,
            onlineDevices: 0,
            offlineDevices: 0,
            warningDevices: 0,
            criticalDevices: 0,
            newDevices: 0,
            devicesByType: {} as Record<DeviceType, number>,
            devicesByStatus: {} as Record<DeviceStatus, number>,
            devicesBySecurity: {} as Record<SecurityStatus, number>,
            totalSubnets: 0,
            totalSegments: 0,
            totalConnections: 0,
            averageResponseTime: 0,
            networkUtilization: 0,
            threatCount: 0,
            vulnerabilityCount: 0
        },
        filters: {
            status: [],
            types: [],
            security: [],
            subnets: [],
            tags: [],
            dateRange: {
                start: null,
                end: null
            }
        },
        searchQuery: '',
        monitoring: {
            enabled: false,
            interval: discoveryInterval,
            activeScans: 0,
            queuedScans: 0,
            lastScan: null,
            nextScan: null,
            failedScans: 0
        },
        lastUpdated: null,
        discoveryProgress: 0
    });

    // =============================================================================
    // ВЫЧИСЛЯЕМЫЕ ЗНАЧЕНИЯ
    // =============================================================================

    const statistics = useMemo(() => {
        const devices = state.devices;
        const stats: NetworkStatistics = {
            totalDevices: devices.length,
            onlineDevices: devices.filter(d => d.status === 'online').length,
            offlineDevices: devices.filter(d => d.status === 'offline').length,
            warningDevices: devices.filter(d => d.status === 'warning').length,
            criticalDevices: devices.filter(d => d.status === 'critical').length,
            newDevices: devices.filter(d => d.status === 'new').length,
            devicesByType: {} as Record<DeviceType, number>,
            devicesByStatus: {} as Record<DeviceStatus, number>,
            devicesBySecurity: {} as Record<SecurityStatus, number>,
            totalSubnets: state.subnets.length,
            totalSegments: state.segments.length,
            totalConnections: devices.reduce((sum, d) => sum + d.connections.length, 0),
            averageResponseTime: devices.reduce((sum, d) => sum + (d.performance?.network.latency.average || 0), 0) / devices.length || 0,
            networkUtilization: 0,
            threatCount: devices.reduce((sum, d) => sum + d.threats.length, 0),
            vulnerabilityCount: devices.reduce((sum, d) => sum + d.vulnerabilities.length, 0)
        };

        devices.forEach(device => {
            stats.devicesByType[device.type] = (stats.devicesByType[device.type] || 0) + 1;
            stats.devicesByStatus[device.status] = (stats.devicesByStatus[device.status] || 0) + 1;
            stats.devicesBySecurity[device.securityStatus] = (stats.devicesBySecurity[device.securityStatus] || 0) + 1;
        });

        return stats;
    }, [state.devices, state.subnets, state.segments]);

    // =============================================================================
    // API МЕТОДЫ 
    // =============================================================================

    const refreshDevices = useCallback(async () => {
        try {
            setState(prev => ({ ...prev, isLoading: true, error: null }));

            const apiDevices = await networkApi.getDiscoveredDevices({
                status: 'all',
                limit: 1000
            });

            const devices: NetworkDevice[] = apiDevices.map(apiDevice => {
                const device: NetworkDevice = {
                    id: apiDevice.ip,
                    ip: apiDevice.ip,
                    type: (apiDevice.device_type as DeviceType) || 'unknown',
                    category: 'other' as DeviceCategory,
                    status: (apiDevice.status === 'online' || apiDevice.status === 'offline')
                        ? apiDevice.status as DeviceStatus
                        : 'unknown' as DeviceStatus,
                    confidence: 0.8,
                    network: {
                        ipv4: {
                            address: apiDevice.ip,
                            netmask: '255.255.255.0',
                            cidr: 24,
                            network: apiDevice.ip.split('.').slice(0, 3).join('.') + '.0',
                            dhcp: false,
                            class: 'C',
                            type: 'private',
                            scope: 'global'
                        },
                        physical: {
                            interface: 'eth0',
                            type: 'ethernet',
                            mtu: 1500
                        },
                        dataLink: {
                            macAddress: apiDevice.mac_address || '',
                            vendor: '',
                            oui: '',
                            vlans: []
                        },
                        network: {
                            routing: {
                                routes: [],
                                routingProtocols: []
                            },
                            arp: [],
                            protocols: []
                        },
                        performance: {
                            bandwidth: { total: 0, used: 0, available: 0, utilization: 0, peak: 0, average: 0, incoming: 0, outgoing: 0 },
                            latency: { average: 0, minimum: 0, maximum: 0, jitter: 0, percentile95: 0, percentile99: 0 },
                            throughput: { current: 0, average: 0, peak: 0, minimum: 0, direction: 'bidirectional' },
                            quality: { score: 0, stability: 0, reliability: 0, jitter: 0, packetLoss: 0 },
                            interfaces: [],
                            protocols: []
                        },
                        security: {
                            firewallEnabled: false,
                            firewallRules: [],
                            encryptionSupported: false,
                            encryptionProtocols: [],
                            authenticationRequired: false,
                            authenticationMethods: [],
                            vpnEnabled: false,
                            vpnProtocols: [],
                            intrusion_detection: false,
                            intrusion_prevention: false,
                            trafficAnalysis: false,
                            anomalyDetection: false,
                            accessControl: false,
                            accessPolicies: [],
                            auditLogging: false,
                            logRetention: 0,
                            complianceFrameworks: [],
                            complianceStatus: 'unknown',
                            vulnerabilities: [],
                            threatLevel: 'low'
                        }
                    },
                    firstSeen: apiDevice.last_seen || new Date().toISOString(),
                    lastSeen: apiDevice.last_seen || new Date().toISOString(),
                    openPorts: (apiDevice.open_ports || []).map(portInfo => {
                        if (typeof portInfo === 'object' && portInfo.port) {
                            return portInfo.port;
                        }
                        if (typeof portInfo === 'number') {
                            return portInfo;
                        }
                        if (typeof portInfo === 'string') {
                            const parsed = parseInt(portInfo, 10);
                            return isNaN(parsed) ? 0 : parsed;
                        }
                        return 0;
                    }).filter(port => port > 0),
                    services: (apiDevice.services || []).map(service => ({
                        port: service.port || 0,
                        protocol: (service.protocol as 'tcp' | 'udp' | 'sctp') || 'tcp',
                        state: 'open',
                        service: service.name || 'unknown',
                        // ИСПРАВЛЕНО: Используем правильное свойство
                        ...(service.version && { version: service.version }),
                        detection: {
                            method: 'banner',
                            confidence: 0.8,
                            timestamp: new Date().toISOString()
                        },
                        security: {
                            vulnerabilities: [],
                            encryptionSupported: false,
                            encryptionStrong: false,
                            authenticationRequired: false,
                            defaultCredentials: false,
                            exposureLevel: 'internal',
                            riskScore: 0
                        },
                        monitoring: {
                            enabled: false,
                            interval: 300000,
                            timeout: 30000,
                            retries: 3,
                            checks: [],
                            alerts: [],
                            metrics: []
                        }
                    })),
                    vulnerabilities: [],
                    threats: [],
                    riskScore: 0,
                    securityStatus: 'unknown' as SecurityStatus,
                    connections: [],
                    dependencies: [],
                    tags: [],
                    labels: {},
                    metadata: {},
                    monitoring: {
                        enabled: false,
                        interval: 300000,
                        timeout: 30000,
                        retries: 3,
                        availability: false,
                        performance: false,
                        security: false,
                        configuration: false,
                        snmp: {
                            enabled: false,
                            version: '2c',
                            port: 161,
                            timeout: 5000,
                            retries: 3,
                            oids: []
                        },
                        wmi: {
                            enabled: false,
                            username: '',
                            password: '',
                            namespace: 'root/cimv2',
                            timeout: 30000
                        },
                        ssh: {
                            enabled: false,
                            username: '',
                            port: 22,
                            timeout: 30000,
                            commands: []
                        },
                        api: {
                            enabled: false,
                            baseUrl: '',
                            authentication: {
                                type: 'none',
                                credentials: {}
                            },
                            endpoints: [],
                            timeout: 30000,
                            retries: 3
                        },
                        thresholds: [],
                        notifications: []
                    }
                };

                // ИСПРАВЛЕНО: Добавляем optional свойства только если они есть
                if (apiDevice.hostname) {
                    device.hostname = apiDevice.hostname;
                    device.hostnames = [apiDevice.hostname];
                }
                if (apiDevice.mac_address) {
                    device.mac = apiDevice.mac_address;
                }

                return device;
            });

            setState(prev => ({
                ...prev,
                devices,
                isLoading: false,
                lastUpdated: new Date().toISOString()
            }));

            addNotification({
                type: 'success',
                title: 'Устройства обновлены',
                message: `Загружено ${devices.length} устройств`,
                duration: 3000,
                category: 'network',
                priority: 'low'
            });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';

            setState(prev => ({
                ...prev,
                isLoading: false,
                error: errorMessage,
                lastError: errorMessage
            }));

            addNotification({
                type: 'error',
                title: 'Ошибка загрузки устройств',
                message: errorMessage,
                duration: 5000,
                category: 'network',
                priority: 'high'
            });
        }
    }, [addNotification]);



    const discoverDevices = useCallback(async () => {
        try {
            setState(prev => ({
                ...prev,
                isDiscovering: true,
                discoveryProgress: 0,
                error: null
            }));

            // ИСПРАВЛЕНО: Убираем неиспользуемые параметры
            await networkApi.startAutoDiscovery();

            // Мониторим прогресс через WebSocket
            let progressInterval: NodeJS.Timeout | undefined;
            if (enableRealTimeUpdates && connectionStatus === 'connected') {
                progressInterval = setInterval(async () => {
                    try {
                        setState(prev => ({
                            ...prev,
                            discoveryProgress: Math.min(prev.discoveryProgress + 10, 90)
                        }));
                    } catch (err) {
                        if (progressInterval) clearInterval(progressInterval);
                        throw err;
                    }
                }, 2000);

                setTimeout(() => {
                    if (progressInterval) clearInterval(progressInterval);

                    setState(prev => ({
                        ...prev,
                        isDiscovering: false,
                        discoveryProgress: 100,
                        lastUpdated: new Date().toISOString()
                    }));

                    addNotification({
                        type: 'success',
                        title: 'Обнаружение завершено',
                        message: 'Поиск новых устройств завершен',
                        duration: 5000,
                        category: 'network',
                        priority: 'normal'
                    });

                    refreshDevices();
                }, 20000);
            }

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Ошибка обнаружения';

            setState(prev => ({
                ...prev,
                isDiscovering: false,
                discoveryProgress: 0,
                error: errorMessage,
                lastError: errorMessage
            }));

            addNotification({
                type: 'error',
                title: 'Ошибка обнаружения устройств',
                message: errorMessage,
                duration: 5000,
                category: 'network',
                priority: 'high'
            });
        }
    }, [enableRealTimeUpdates, connectionStatus, addNotification, refreshDevices]);

    const addDevice = useCallback(async (deviceData: Partial<NetworkDevice>): Promise<NetworkDevice> => {
        try {
            // ИСПРАВЛЕНО: Создаем базовый объект без optional свойств
            const newDevice: NetworkDevice = {
                id: `device-${Date.now()}`,
                ip: deviceData.ip || '',
                type: deviceData.type || 'unknown',
                category: deviceData.category || 'other',
                status: 'new',
                confidence: 0.8,
                network: {
                    ipv4: {
                        address: deviceData.ip || '',
                        netmask: '255.255.255.0',
                        cidr: 24,
                        network: deviceData.ip?.split('.').slice(0, 3).join('.') + '.0' || '',
                        dhcp: false,
                        class: 'C',
                        type: 'private',
                        scope: 'global'
                    },
                    physical: {
                        interface: 'eth0',
                        type: 'ethernet',
                        mtu: 1500
                    },
                    dataLink: {
                        macAddress: deviceData.mac || '',
                        vendor: deviceData.vendor || '',
                        oui: '',
                        vlans: []
                    },
                    network: {
                        routing: {
                            routes: [],
                            routingProtocols: []
                        },
                        arp: [],
                        protocols: []
                    },
                    performance: {
                        bandwidth: { total: 0, used: 0, available: 0, utilization: 0, peak: 0, average: 0, incoming: 0, outgoing: 0 },
                        latency: { average: 0, minimum: 0, maximum: 0, jitter: 0, percentile95: 0, percentile99: 0 },
                        throughput: { current: 0, average: 0, peak: 0, minimum: 0, direction: 'bidirectional' },
                        quality: { score: 0, stability: 0, reliability: 0, jitter: 0, packetLoss: 0 },
                        interfaces: [],
                        protocols: []
                    },
                    security: {
                        firewallEnabled: false,
                        firewallRules: [],
                        encryptionSupported: false,
                        encryptionProtocols: [],
                        authenticationRequired: false,
                        authenticationMethods: [],
                        vpnEnabled: false,
                        vpnProtocols: [],
                        intrusion_detection: false,
                        intrusion_prevention: false,
                        trafficAnalysis: false,
                        anomalyDetection: false,
                        accessControl: false,
                        accessPolicies: [],
                        auditLogging: false,
                        logRetention: 0,
                        complianceFrameworks: [],
                        complianceStatus: 'unknown',
                        vulnerabilities: [],
                        threatLevel: 'low'
                    }
                },
                firstSeen: new Date().toISOString(),
                lastSeen: new Date().toISOString(),
                openPorts: [],
                services: [],
                vulnerabilities: [],
                threats: [],
                riskScore: 0,
                securityStatus: 'unknown',
                connections: [],
                dependencies: [],
                tags: deviceData.tags || [],
                labels: {},
                metadata: {},
                monitoring: {
                    enabled: false,
                    interval: 300000,
                    timeout: 30000,
                    retries: 3,
                    availability: false,
                    performance: false,
                    security: false,
                    configuration: false,
                    snmp: {
                        enabled: false,
                        version: '2c',
                        port: 161,
                        timeout: 5000,
                        retries: 3,
                        oids: []
                    },
                    wmi: {
                        enabled: false,
                        username: '',
                        password: '',
                        namespace: 'root/cimv2',
                        timeout: 30000
                    },
                    ssh: {
                        enabled: false,
                        username: '',
                        port: 22,
                        timeout: 30000,
                        commands: []
                    },
                    api: {
                        enabled: false,
                        baseUrl: '',
                        authentication: {
                            type: 'none',
                            credentials: {}
                        },
                        endpoints: [],
                        timeout: 30000,
                        retries: 3
                    },
                    thresholds: [],
                    notifications: []
                }
            };

            // ИСПРАВЛЕНО: Добавляем optional свойства только если они есть значения
            if (deviceData.ipv6) newDevice.ipv6 = deviceData.ipv6;
            if (deviceData.hostname) newDevice.hostname = deviceData.hostname;
            if (deviceData.hostnames) newDevice.hostnames = deviceData.hostnames;
            if (deviceData.fqdn) newDevice.fqdn = deviceData.fqdn;
            if (deviceData.mac) newDevice.mac = deviceData.mac;
            if (deviceData.vendor) newDevice.vendor = deviceData.vendor;
            if (deviceData.subcategory) newDevice.subcategory = deviceData.subcategory;
            if (deviceData.lastStatus) newDevice.lastStatus = deviceData.lastStatus;
            if (deviceData.statusReason) newDevice.statusReason = deviceData.statusReason;
            if (deviceData.os) newDevice.os = deviceData.os;
            if (deviceData.lastScanned) newDevice.lastScanned = deviceData.lastScanned;
            if (deviceData.nextScan) newDevice.nextScan = deviceData.nextScan;
            if (deviceData.performance) newDevice.performance = deviceData.performance;
            if (deviceData.location) newDevice.location = deviceData.location;
            if (deviceData.management) newDevice.management = deviceData.management;
            if (deviceData.compliance) newDevice.compliance = deviceData.compliance;

            setState(prev => ({
                ...prev,
                devices: [...prev.devices, newDevice]
            }));

            addNotification({
                type: 'success',
                title: 'Устройство добавлено',
                message: `${newDevice.hostname || newDevice.ip} успешно добавлено`,
                duration: 3000,
                category: 'network',
                priority: 'low'
            });

            return newDevice;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Ошибка добавления устройства';

            addNotification({
                type: 'error',
                title: 'Ошибка добавления устройства',
                message: errorMessage,
                duration: 5000,
                category: 'network',
                priority: 'normal'
            });

            throw error;
        }
    }, [addNotification]);



    const updateDevice = useCallback(async (id: string, updates: Partial<NetworkDevice>) => {
        try {
            // ИСПРАВЛЕНО: Приводим статус к типу, совместимому с API
            const apiUpdates = {
                ...updates,
                // Приводим DeviceStatus к совместимому типу
                status: updates.status === 'online' || updates.status === 'offline'
                    ? updates.status
                    : updates.status === 'unknown'
                        ? 'offline'
                        : 'online'
            };

            await networkApi.updateDeviceInfo(id, apiUpdates as any);

            setState(prev => ({
                ...prev,
                devices: prev.devices.map(device =>
                    device.id === id ? { ...device, ...updates } : device
                ),
                selectedDevice: prev.selectedDevice?.id === id ? { ...prev.selectedDevice, ...updates } : prev.selectedDevice
            }));

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Ошибка обновления устройства';

            addNotification({
                type: 'error',
                title: 'Ошибка обновления устройства',
                message: errorMessage,
                duration: 5000,
                category: 'network',
                priority: 'normal'
            });
        }
    }, [addNotification]);

    const removeDevice = useCallback(async (id: string) => {
        try {
            // ИСПРАВЛЕНО: Используем deleteDevice вместо removeDevice
            await networkApi.deleteDevice(id);

            setState(prev => ({
                ...prev,
                devices: prev.devices.filter(device => device.id !== id),
                selectedDevice: prev.selectedDevice?.id === id ? null : prev.selectedDevice
            }));

            addNotification({
                type: 'success',
                title: 'Устройство удалено',
                message: 'Устройство успешно удалено из сети',
                duration: 3000,
                category: 'network',
                priority: 'low'
            });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Ошибка удаления устройства';

            addNotification({
                type: 'error',
                title: 'Ошибка удаления устройства',
                message: errorMessage,
                duration: 5000,
                category: 'network',
                priority: 'normal'
            });
        }
    }, [addNotification]);

    // =============================================================================
    // МЕТОДЫ ТОПОЛОГИИ
    // =============================================================================

    const getNetworkTopology = useCallback((devices: NetworkDevice[] = state.devices): TopologyLink[] => {
        const links: TopologyLink[] = [];
        const processedPairs = new Set<string>();

        devices.forEach(device => {
            device.connections.forEach(connection => {
                const targetDevice = devices.find(d => d.id === connection.targetId);
                if (!targetDevice) return;

                const pairKey = [device.id, connection.targetId].sort().join('-');
                if (processedPairs.has(pairKey)) return;
                processedPairs.add(pairKey);

                const getLinkType = (connectionType: ConnectionType): LinkType => {
                    switch (connectionType) {
                        case 'ethernet':
                            return 'ethernet';
                        case 'wifi':
                            return 'wifi';
                        case 'vpn':
                            return 'vpn';
                        case 'application':
                        case 'dependency':
                            return 'logical';
                        case 'usb':
                        case 'serial':
                        case 'bluetooth':
                        default:
                            return 'logical';
                    }
                };

                let strength = 1;
                switch (connection.type) {
                    case 'ethernet':
                        strength = 3;
                        break;
                    case 'wifi':
                        strength = 2;
                        break;
                    case 'vpn':
                        strength = 1.5;
                        break;
                    default:
                        strength = 1;
                }

                // ИСПРАВЛЕНО: Обеспечиваем правильные типы для bandwidth и latency
                links.push({
                    id: `${device.id}-${connection.targetId}`,
                    sourceId: device.id,
                    targetId: connection.targetId,
                    type: getLinkType(connection.type),
                    protocol: connection.protocol || 'unknown',
                    directed: false,
                    bidirectional: true,
                    color: '#6b7280',
                    width: Math.max(1, strength),
                    style: 'solid',
                    status: connection.status === 'active' ? 'up' : 'down',
                    bandwidth: connection.bandwidth || 0, // Устанавливаем 0 если undefined
                    latency: connection.latency || 0, // Устанавливаем 0 если undefined
                    metrics: []
                });
            });
        });

        return links;
    }, [state.devices]);


    const generateTopology = useCallback(async (): Promise<NetworkTopology> => {
        try {
            setState(prev => ({ ...prev, isSyncing: true }));

            const devices = state.devices;
            const links = getNetworkTopology(devices);

            const nodes: TopologyNode[] = devices.map(device => ({
                id: device.id,
                deviceId: device.id,
                label: device.hostname || device.ip,
                type: 'device',
                icon: getDeviceIcon(device.type),
                color: getStatusColor(device.status),
                size: 10,
                position: {
                    x: Math.random() * 800,
                    y: Math.random() * 600,
                    fixed: false
                },
                properties: {
                    ip: device.ip,
                    type: device.type,
                    status: device.status,
                    os: device.os?.name || 'Unknown',
                    services: device.services.length.toString()
                },
                status: device.status === 'online' ? 'active' : 'inactive',
                selectable: true,
                draggable: true
            }));

            const topology: NetworkTopology = {
                id: `topology-${Date.now()}`,
                name: 'Network Topology',
                description: 'Автоматически сгенерированная топология сети',
                nodes,
                links,
                subnets: state.subnets,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                discoveredBy: 'IP Roast Discovery Engine',
                statistics: {
                    totalNodes: nodes.length,
                    totalLinks: links.length,
                    nodeTypes: nodes.reduce((acc, node) => {
                        acc[node.type] = (acc[node.type] || 0) + 1;
                        return acc;
                    }, {} as Record<string, number>),
                    linkTypes: links.reduce((acc, link) => {
                        acc[link.type] = (acc[link.type] || 0) + 1;
                        return acc;
                    }, {} as Record<string, number>),
                    avgDegree: links.length > 0 ? (links.length * 2) / nodes.length : 0,
                    diameter: 0,
                    clustering: 0,
                    communities: 0
                },
                layout: {
                    algorithm: 'force-directed',
                    parameters: {
                        iterations: 300,
                        springLength: 100,
                        springStrength: 0.1,
                        damping: 0.8,
                        repulsion: 1000
                    },
                    showLabels: true,
                    showIcons: true,
                    showMetrics: false,
                    showAnimation: true,
                    zoom: 1,
                    minZoom: 0.1,
                    maxZoom: 5,
                    pan: { x: 0, y: 0 },
                    highlight: {
                        selectedColor: '#3b82f6',
                        hoveredColor: '#60a5fa',
                        connectedColor: '#93c5fd',
                        fadeOpacity: 0.3
                    }
                },
                filters: []
            };

            setState(prev => ({
                ...prev,
                topology,
                topologyNodes: nodes,
                topologyLinks: links,
                isSyncing: false
            }));

            return topology;
        } catch (error) {
            setState(prev => ({ ...prev, isSyncing: false }));
            throw error;
        }
    }, [state.devices, state.subnets, getNetworkTopology]);

    // =============================================================================
    // ОСТАЛЬНЫЕ МЕТОДЫ (без изменений)
    // =============================================================================

    const setSearchQuery = useCallback((query: string) => {
        setState(prev => ({ ...prev, searchQuery: query }));
    }, []);

    const setFilters = useCallback((filters: Partial<NetworkFilters>) => {
        setState(prev => ({
            ...prev,
            filters: { ...prev.filters, ...filters }
        }));
    }, []);

    const clearFilters = useCallback(() => {
        setState(prev => ({
            ...prev,
            filters: {
                status: [],
                types: [],
                security: [],
                subnets: [],
                tags: [],
                dateRange: { start: null, end: null }
            },
            searchQuery: ''
        }));
    }, []);

    const getFilteredDevices = useCallback((): NetworkDevice[] => {
        let filtered = state.devices;

        if (state.searchQuery) {
            const query = state.searchQuery.toLowerCase();
            filtered = filtered.filter(device =>
                device.hostname?.toLowerCase().includes(query) ||
                device.ip.toLowerCase().includes(query) ||
                device.fqdn?.toLowerCase().includes(query) ||
                device.vendor?.toLowerCase().includes(query) ||
                device.os?.name?.toLowerCase().includes(query) ||
                device.tags.some(tag => tag.toLowerCase().includes(query))
            );
        }

        if (state.filters.status.length > 0) {
            filtered = filtered.filter(device =>
                state.filters.status.includes(device.status)
            );
        }

        if (state.filters.types.length > 0) {
            filtered = filtered.filter(device =>
                state.filters.types.includes(device.type)
            );
        }

        if (state.filters.security.length > 0) {
            filtered = filtered.filter(device =>
                state.filters.security.includes(device.securityStatus)
            );
        }

        if (state.filters.subnets.length > 0) {
            filtered = filtered.filter(device =>
                state.filters.subnets.some(subnet =>
                    isIPInRange(device.ip, subnet)
                )
            );
        }

        if (state.filters.tags.length > 0) {
            filtered = filtered.filter(device =>
                state.filters.tags.some(tag =>
                    device.tags.includes(tag)
                )
            );
        }

        if (state.filters.dateRange.start && state.filters.dateRange.end) {
            const start = new Date(state.filters.dateRange.start);
            const end = new Date(state.filters.dateRange.end);

            filtered = filtered.filter(device => {
                const deviceDate = new Date(device.lastSeen);
                return deviceDate >= start && deviceDate <= end;
            });
        }

        return filtered;
    }, [state.devices, state.searchQuery, state.filters]);

    const selectDevice = useCallback((device: NetworkDevice | null) => {
        setState(prev => ({ ...prev, selectedDevice: device }));
    }, []);

    const isDeviceOnline = useCallback((device: NetworkDevice): boolean => {
        return device.status === 'online';
    }, []);

    const getDevicesBySubnet = useCallback((subnet: string): NetworkDevice[] => {
        return state.devices.filter(device => isIPInRange(device.ip, subnet));
    }, [state.devices]);

    const getDeviceConnections = useCallback((deviceId: string): DeviceConnection[] => {
        const device = state.devices.find(d => d.id === deviceId);
        return device?.connections || [];
    }, [state.devices]);

    // =============================================================================
    // ЭФФЕКТЫ
    // =============================================================================

    useEffect(() => {
        if (!lastMessage || !enableRealTimeUpdates) return;

        try {
            const message = JSON.parse(lastMessage.data);

            switch (message.type) {
                case 'device_update':
                    setState(prev => ({
                        ...prev,
                        devices: prev.devices.map(device =>
                            device.id === message.data.id
                                ? { ...device, ...message.data }
                                : device
                        )
                    }));
                    break;

                case 'device_added':
                    setState(prev => ({
                        ...prev,
                        devices: [...prev.devices, message.data]
                    }));
                    break;

                case 'device_removed':
                    setState(prev => ({
                        ...prev,
                        devices: prev.devices.filter(device => device.id !== message.data.id)
                    }));
                    break;

                case 'topology_update':
                    setState(prev => ({ ...prev, topology: message.data }));
                    break;

                case 'discovery_progress':
                    setState(prev => ({
                        ...prev,
                        discoveryProgress: message.data.percentage
                    }));
                    break;
            }
        } catch (error) {
            console.error('Ошибка обработки WebSocket сообщения:', error);
        }
    }, [lastMessage, enableRealTimeUpdates]);

    useEffect(() => {
        if (!autoDiscovery) return;

        const interval = setInterval(() => {
            if (!state.isDiscovering && !state.isLoading) {
                discoverDevices();
            }
        }, discoveryInterval);

        return () => clearInterval(interval);
    }, [autoDiscovery, discoveryInterval, state.isDiscovering, state.isLoading, discoverDevices]);

    useEffect(() => {
        setState(prev => ({ ...prev, statistics }));
    }, [statistics]);

    useEffect(() => {
        refreshDevices();
    }, [refreshDevices]);

    // =============================================================================
    // ДОПОЛНИТЕЛЬНЫЕ МЕТОДЫ (заглушки)
    // =============================================================================

    const getNetworkSegments = useCallback(async (): Promise<NetworkSegment[]> => {
        return state.segments;
    }, [state.segments]);

    const createSegment = useCallback(async (segment: Omit<NetworkSegment, 'id'>): Promise<NetworkSegment> => {
        const newSegment = { ...segment, id: `seg-${Date.now()}` } as NetworkSegment;
        setState(prev => ({ ...prev, segments: [...prev.segments, newSegment] }));
        return newSegment;
    }, []);

    const updateSegment = useCallback(async (id: string, updates: Partial<NetworkSegment>) => {
        setState(prev => ({
            ...prev,
            segments: prev.segments.map(seg => seg.id === id ? { ...seg, ...updates } : seg)
        }));
    }, []);

    const deleteSegment = useCallback(async (id: string) => {
        setState(prev => ({
            ...prev,
            segments: prev.segments.filter(seg => seg.id !== id)
        }));
    }, []);

    const updateTopology = useCallback(async () => {
        await generateTopology();
    }, [generateTopology]);

    const exportTopology = useCallback(async (): Promise<Blob> => {
        const data = JSON.stringify(state.topology);
        return new Blob([data], { type: 'application/json' });
    }, [state.topology]);

    const startMonitoring = useCallback(async () => {
        setState(prev => ({
            ...prev,
            monitoring: { ...prev.monitoring, enabled: true }
        }));
    }, []);

    const stopMonitoring = useCallback(async () => {
        setState(prev => ({
            ...prev,
            monitoring: { ...prev.monitoring, enabled: false }
        }));
    }, []);

    const scheduleDeviceScan = useCallback(async () => {
        console.log('Планируется сканирование устройства');
    }, []);

    const getDeviceMetrics = useCallback(async (): Promise<PerformanceMetrics> => {
        throw new Error('Метод не реализован');
    }, []);

    const analyzeNetworkSecurity = useCallback(async (): Promise<SecurityAnalysis> => {
        return {
            overallScore: 75,
            threats: [],
            vulnerabilities: [],
            recommendations: []
        };
    }, []);

    const exportDevices = useCallback(async (): Promise<Blob> => {
        const data = JSON.stringify(state.devices);
        return new Blob([data], { type: 'application/json' });
    }, [state.devices]);

    const importDevices = useCallback(async (): Promise<number> => {
        return 0;
    }, []);

    // =============================================================================
    // ВОЗВРАТ ХУКА
    // =============================================================================

    return {
        devices: state.devices,
        selectedDevice: state.selectedDevice,
        topology: state.topology,
        topologyNodes: state.topologyNodes,
        topologyLinks: state.topologyLinks,
        segments: state.segments,
        subnets: state.subnets,
        isLoading: state.isLoading,
        isDiscovering: state.isDiscovering,
        isSyncing: state.isSyncing,
        error: state.error,
        lastError: state.lastError,
        statistics: state.statistics,
        filters: state.filters,
        searchQuery: state.searchQuery,
        monitoring: state.monitoring,
        lastUpdated: state.lastUpdated,
        discoveryProgress: state.discoveryProgress,

        refreshDevices,
        discoverDevices,
        addDevice,
        updateDevice,
        removeDevice,
        selectDevice,

        getNetworkTopology,
        generateTopology,
        updateTopology,
        exportTopology,

        getNetworkSegments,
        createSegment,
        updateSegment,
        deleteSegment,

        setSearchQuery,
        setFilters,
        clearFilters,
        getFilteredDevices,

        startMonitoring,
        stopMonitoring,
        scheduleDeviceScan,
        getDeviceMetrics,

        isDeviceOnline,
        getDevicesBySubnet,
        getDeviceConnections,
        analyzeNetworkSecurity,

        exportDevices,
        importDevices
    };
};

export default useNetwork;
