// frontend/src/services/networkApi.ts

/**
 * IP Roast - Network API Service v2.1.0
 * Специализированный API клиент для работы с сетевой функциональностью
 */

import { api } from './api';
import type {
    ApiResponse,
    NetworkInterface,
    NetworkDevice,
    PortInfo,
    ServiceInfo
} from './api';

// ===== ТИПЫ ДАННЫХ ДЛЯ СЕТЕВОЙ ФУНКЦИОНАЛЬНОСТИ =====

// Настройки сетевого сканирования
export interface NetworkScanSettings {
    interface: string;
    network_range: string;
    scan_type: 'ping' | 'arp' | 'tcp_syn' | 'comprehensive';
    timeout: number;
    threads: number;
    detect_os: boolean;
    detect_services: boolean;
    aggressive_mode: boolean;
    stealth_mode: boolean;
    custom_ports?: string;
    exclude_ranges?: string[];
    include_offline?: boolean;
}

// Результаты сетевого сканирования
export interface NetworkScanResult {
    scan_id: string;
    status: 'running' | 'completed' | 'failed' | 'cancelled';
    progress: number;
    phase: string;
    started_at: string;
    completed_at?: string;
    settings: NetworkScanSettings;
    devices_found: number;
    active_devices: number;
    total_hosts_scanned: number;
    scan_duration?: number;
    error_message?: string;
}

// Детальная информация об устройстве
export interface DetailedNetworkDevice extends NetworkDevice {
    ping_response_time?: number;
    tcp_ports?: PortInfo[];
    udp_ports?: PortInfo[];
    ssl_certificates?: SSLCertificate[];
    dns_records?: DNSRecord[];
    vulnerability_scan?: VulnerabilityScanResult;
    network_discovery?: {
        discovery_method: string;
        first_seen: string;
        last_updated: string;
        confidence_level: number;
    };
}

// SSL сертификат
export interface SSLCertificate {
    subject: string;
    issuer: string;
    valid_from: string;
    valid_to: string;
    fingerprint: string;
    serial_number: string;
    signature_algorithm: string;
    public_key_info: {
        algorithm: string;
        key_size: number;
    };
    extensions: string[];
    is_self_signed: boolean;
    is_expired: boolean;
    days_to_expiry: number;
}

// DNS запись
export interface DNSRecord {
    type: 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT' | 'PTR' | 'NS' | 'SOA';
    name: string;
    value: string;
    ttl?: number;
}

// Результат сканирования уязвимостей
export interface VulnerabilityScanResult {
    scan_id: string;
    device_ip: string;
    vulnerabilities: NetworkVulnerability[];
    scan_date: string;
    scan_tools: string[];
    confidence_score: number;
}

// Сетевая уязвимость
export interface NetworkVulnerability {
    id: string;
    name: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    affected_service?: string;
    affected_port?: number;
    cve_ids?: string[];
    cvss_score?: number;
    remediation?: string;
    references?: string[];
}

// Топология сети
export interface NetworkTopology {
    nodes: NetworkNode[];
    connections: NetworkConnection[];
    subnets: NetworkSubnet[];
    gateways: NetworkGateway[];
    last_updated: string;
    confidence_level: number;
}

// Узел сети
export interface NetworkNode {
    id: string;
    ip: string;
    hostname?: string;
    mac_address?: string;
    device_type: 'router' | 'switch' | 'server' | 'workstation' | 'mobile' | 'iot' | 'unknown';
    manufacturer?: string;
    role: 'gateway' | 'server' | 'client' | 'infrastructure';
    position?: {
        x: number;
        y: number;
    };
    services: ServiceInfo[];
    status: 'online' | 'offline' | 'unknown';
    last_seen: string;
}

// Соединение между узлами
export interface NetworkConnection {
    id: string;
    source_node: string;
    target_node: string;
    connection_type: 'direct' | 'routed' | 'switched' | 'wireless';
    protocol?: string;
    port?: number;
    bandwidth?: number;
    latency?: number;
    last_seen: string;
    confidence: number;
}

// Подсеть
export interface NetworkSubnet {
    id: string;
    network: string;
    netmask: string;
    cidr: string;
    gateway?: string;
    dns_servers?: string[];
    dhcp_range?: {
        start: string;
        end: string;
    };
    vlan_id?: number;
    nodes: string[];
    description?: string;
}

// Шлюз
export interface NetworkGateway {
    id: string;
    ip: string;
    hostname?: string;
    mac_address?: string;
    interfaces: NetworkInterface[];
    routing_table?: RoutingEntry[];
    firewall_rules?: FirewallRule[];
    status: 'online' | 'offline';
    last_seen: string;
}

// Запись маршрутизации
export interface RoutingEntry {
    destination: string;
    gateway: string;
    interface: string;
    metric: number;
    protocol: string;
}

// Правило файрвола
export interface FirewallRule {
    id: string;
    action: 'allow' | 'deny' | 'drop';
    protocol: string;
    source: string;
    destination: string;
    port?: string;
    description?: string;
    enabled: boolean;
}

// Статистика сети
export interface NetworkStatistics {
    total_devices: number;
    active_devices: number;
    device_types: Record<string, number>;
    manufacturers: Record<string, number>;
    operating_systems: Record<string, number>;
    open_ports_summary: Record<number, number>;
    top_services: Array<{
        service: string;
        count: number;
        ports: number[];
    }>;
    security_summary: {
        total_vulnerabilities: number;
        by_severity: Record<string, number>;
        exposed_services: string[];
        weak_passwords: number;
        unencrypted_services: number;
    };
    network_health: {
        score: number;
        issues: string[];
        recommendations: string[];
    };
}

// Настройки автоматического обнаружения
export interface AutoDiscoverySettings {
    enabled: boolean;
    scan_interval: number; // в минутах
    scan_types: string[];
    notification_on_new_device: boolean;
    notification_on_device_change: boolean;
    exclude_ranges: string[];
    monitor_dhcp: boolean;
    monitor_arp: boolean;
    archive_old_devices: boolean;
    archive_threshold_days: number;
}

// ===== ОСНОВНОЙ КЛАСС NETWORK API =====

class NetworkApiService {

    // ===== СЕТЕВЫЕ ИНТЕРФЕЙСЫ =====

    /**
     * Получение списка сетевых интерфейсов
     */
    async getInterfaces(): Promise<NetworkInterface[]> {
        const response = await api.get<{ interfaces: NetworkInterface[] }>('/api/network/interfaces');
        return response.interfaces || [];
    }

    /**
     * Получение деталей конкретного интерфейса
     */
    async getInterfaceDetails(interfaceName: string): Promise<NetworkInterface> {
        if (!interfaceName) {
            throw new Error('Interface name is required');
        }

        return api.get<NetworkInterface>(`/api/network/interfaces/${encodeURIComponent(interfaceName)}`);
    }

    /**
     * Обновление настроек сетевого интерфейса
     */
    async updateInterfaceSettings(
        interfaceName: string,
        settings: Partial<NetworkInterface>
    ): Promise<ApiResponse> {
        if (!interfaceName) {
            throw new Error('Interface name is required');
        }

        return api.put(`/api/network/interfaces/${encodeURIComponent(interfaceName)}`, settings);
    }

    // ===== ОБНАРУЖЕНИЕ УСТРОЙСТВ =====

    /**
     * Запуск сканирования сети
     */
    async startNetworkScan(settings: NetworkScanSettings): Promise<ApiResponse<{ scan_id: string }>> {
        this.validateNetworkScanSettings(settings);

        return api.post('/api/network/discover', settings, { timeout: 60000 });
    }

    /**
     * Получение статуса сканирования сети
     */
    async getNetworkScanStatus(scanId: string): Promise<NetworkScanResult> {
        if (!scanId) {
            throw new Error('Scan ID is required');
        }

        return api.get<NetworkScanResult>(`/api/network/discover/${encodeURIComponent(scanId)}/status`);
    }

    /**
     * Остановка сканирования сети
     */
    async stopNetworkScan(scanId: string): Promise<ApiResponse> {
        if (!scanId) {
            throw new Error('Scan ID is required');
        }

        return api.post(`/api/network/discover/${encodeURIComponent(scanId)}/stop`);
    }

    /**
     * Получение списка обнаруженных устройств
     */
    async getDiscoveredDevices(params: {
        scan_id?: string;
        interface?: string;
        subnet?: string;
        status?: 'online' | 'offline' | 'all';
        device_type?: string;
        limit?: number;
        offset?: number;
    } = {}): Promise<NetworkDevice[]> {
        const queryParams = new URLSearchParams();

        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                queryParams.append(key, String(value));
            }
        });

        const url = `/api/network/devices${queryParams.toString() ? `?${queryParams}` : ''}`;
        const response = await api.get<{ devices: NetworkDevice[] }>(url);

        return response.devices || [];
    }

    /**
     * Получение детальной информации об устройстве
     */
    async getDeviceDetails(deviceIp: string): Promise<DetailedNetworkDevice> {
        if (!deviceIp) {
            throw new Error('Device IP is required');
        }

        return api.get<DetailedNetworkDevice>(`/api/network/devices/${encodeURIComponent(deviceIp)}`);
    }

    /**
     * Обновление информации об устройстве
     */
    async updateDeviceInfo(
        deviceIp: string,
        updates: Partial<NetworkDevice>
    ): Promise<ApiResponse> {
        if (!deviceIp) {
            throw new Error('Device IP is required');
        }

        return api.put(`/api/network/devices/${encodeURIComponent(deviceIp)}`, updates);
    }

    /**
     * Удаление устройства из базы данных
     */
    async deleteDevice(deviceIp: string): Promise<ApiResponse> {
        if (!deviceIp) {
            throw new Error('Device IP is required');
        }

        return api.delete(`/api/network/devices/${encodeURIComponent(deviceIp)}`);
    }

    // ===== СКАНИРОВАНИЕ ПОРТОВ УСТРОЙСТВА =====

    /**
     * Запуск сканирования портов конкретного устройства
     */
    async scanDevicePorts(
        deviceIp: string,
        options: {
            ports?: string;
            scan_type?: 'tcp' | 'udp' | 'both';
            timing?: string;
            detect_services?: boolean;
        } = {}
    ): Promise<ApiResponse<{ scan_id: string }>> {
        if (!deviceIp) {
            throw new Error('Device IP is required');
        }

        return api.post(`/api/network/devices/${encodeURIComponent(deviceIp)}/scan-ports`, {
            target: deviceIp,
            ...options
        });
    }

    /**
     * Получение результатов сканирования портов устройства
     */
    async getDevicePortScanResults(
        deviceIp: string,
        scanId?: string
    ): Promise<{ ports: PortInfo[]; services: ServiceInfo[] }> {
        if (!deviceIp) {
            throw new Error('Device IP is required');
        }

        const url = scanId
            ? `/api/network/devices/${encodeURIComponent(deviceIp)}/ports?scan_id=${encodeURIComponent(scanId)}`
            : `/api/network/devices/${encodeURIComponent(deviceIp)}/ports`;

        return api.get(url);
    }

    // ===== ТОПОЛОГИЯ СЕТИ =====

    /**
     * Построение топологии сети
     */
    async buildNetworkTopology(params: {
        subnet?: string;
        depth?: number;
        include_offline?: boolean;
        auto_layout?: boolean;
    } = {}): Promise<NetworkTopology> {
        const queryParams = new URLSearchParams();

        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                queryParams.append(key, String(value));
            }
        });

        const url = `/api/network/topology${queryParams.toString() ? `?${queryParams}` : ''}`;
        return api.get<NetworkTopology>(url);
    }

    /**
     * Обновление позиций узлов в топологии
     */
    async updateTopologyLayout(
        nodes: Array<{ id: string; x: number; y: number }>
    ): Promise<ApiResponse> {
        return api.put('/api/network/topology/layout', { nodes });
    }

    /**
     * Экспорт топологии сети
     */
    async exportTopology(format: 'json' | 'svg' | 'png' | 'graphml'): Promise<Blob> {
        const response = await api.request<Blob>('/api/network/topology/export', {
            method: 'GET',
            headers: {
                'Accept': format === 'json' ? 'application/json' :
                    format === 'svg' ? 'image/svg+xml' :
                        format === 'png' ? 'image/png' :
                            'application/xml'
            }
        });

        return response;
    }

    // ===== АНАЛИЗ БЕЗОПАСНОСТИ СЕТИ =====

    /**
     * Запуск анализа безопасности сети
     */
    async startSecurityAnalysis(params: {
        subnet?: string;
        scan_types?: string[];
        aggressive_mode?: boolean;
    } = {}): Promise<ApiResponse<{ analysis_id: string }>> {
        return api.post('/api/network/security/analyze', params, { timeout: 300000 });
    }

    /**
     * Получение результатов анализа безопасности
     */
    async getSecurityAnalysisResults(analysisId: string): Promise<{
        analysis_id: string;
        status: string;
        vulnerabilities: NetworkVulnerability[];
        security_score: number;
        recommendations: string[];
        devices_analyzed: number;
        completion_date?: string;
    }> {
        if (!analysisId) {
            throw new Error('Analysis ID is required');
        }

        return api.get(`/api/network/security/analyze/${encodeURIComponent(analysisId)}/results`);
    }

    /**
     * Сканирование уязвимостей конкретного устройства
     */
    async scanDeviceVulnerabilities(
        deviceIp: string,
        options: {
            scan_type?: 'basic' | 'comprehensive';
            include_exploits?: boolean;
        } = {}
    ): Promise<VulnerabilityScanResult> {
        if (!deviceIp) {
            throw new Error('Device IP is required');
        }

        return api.post(
            `/api/network/devices/${encodeURIComponent(deviceIp)}/scan-vulnerabilities`,
            options,
            { timeout: 600000 }
        );
    }

    // ===== МОНИТОРИНГ И СТАТИСТИКА =====

    /**
     * Получение статистики сети
     */
    async getNetworkStatistics(params: {
        subnet?: string;
        timeframe?: '1h' | '24h' | '7d' | '30d';
        include_historical?: boolean;
    } = {}): Promise<NetworkStatistics> {
        const queryParams = new URLSearchParams();

        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) {
                queryParams.append(key, String(value));
            }
        });

        const url = `/api/network/statistics${queryParams.toString() ? `?${queryParams}` : ''}`;
        return api.get<NetworkStatistics>(url);
    }

    /**
     * Получение истории изменений устройств
     */
    async getDeviceHistory(
        deviceIp: string,
        params: {
            from_date?: string;
            to_date?: string;
            event_types?: string[];
        } = {}
    ): Promise<Array<{
        timestamp: string;
        event_type: string;
        description: string;
        old_value?: any;
        new_value?: any;
    }>> {
        if (!deviceIp) {
            throw new Error('Device IP is required');
        }

        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) {
                if (Array.isArray(value)) {
                    value.forEach(v => queryParams.append(key, v));
                } else {
                    queryParams.append(key, String(value));
                }
            }
        });

        const url = `/api/network/devices/${encodeURIComponent(deviceIp)}/history${queryParams.toString() ? `?${queryParams}` : ''}`;
        return api.get(url);
    }

    // ===== АВТОМАТИЧЕСКОЕ ОБНАРУЖЕНИЕ =====

    /**
     * Получение настроек автоматического обнаружения
     */
    async getAutoDiscoverySettings(): Promise<AutoDiscoverySettings> {
        return api.get<AutoDiscoverySettings>('/api/network/auto-discovery/settings');
    }

    /**
     * Обновление настроек автоматического обнаружения
     */
    async updateAutoDiscoverySettings(settings: Partial<AutoDiscoverySettings>): Promise<ApiResponse> {
        return api.put('/api/network/auto-discovery/settings', settings);
    }

    /**
     * Запуск автоматического обнаружения
     */
    async startAutoDiscovery(): Promise<ApiResponse> {
        return api.post('/api/network/auto-discovery/start');
    }

    /**
     * Остановка автоматического обнаружения
     */
    async stopAutoDiscovery(): Promise<ApiResponse> {
        return api.post('/api/network/auto-discovery/stop');
    }

    /**
     * Получение статуса автоматического обнаружения
     */
    async getAutoDiscoveryStatus(): Promise<{
        enabled: boolean;
        running: boolean;
        last_scan: string;
        next_scan: string;
        devices_discovered_today: number;
        errors: string[];
    }> {
        return api.get('/api/network/auto-discovery/status');
    }

    // ===== DNS И WHOIS =====

    /**
     * DNS lookup для домена или IP
     */
    async dnsLookup(
        target: string,
        recordTypes: string[] = ['A', 'AAAA', 'CNAME', 'MX', 'TXT']
    ): Promise<DNSRecord[]> {
        if (!target) {
            throw new Error('Target is required for DNS lookup');
        }

        return api.post<DNSRecord[]>('/api/network/dns/lookup', {
            target,
            record_types: recordTypes
        });
    }

    /**
     * Reverse DNS lookup
     */
    async reverseDnsLookup(ip: string): Promise<{
        ip: string;
        hostname?: string;
        records: DNSRecord[];
    }> {
        if (!ip) {
            throw new Error('IP address is required for reverse DNS lookup');
        }

        return api.post('/api/network/dns/reverse', { ip });
    }

    /**
     * WHOIS lookup
     */
    async whoisLookup(target: string): Promise<{
        domain: string;
        registrar?: string;
        creation_date?: string;
        expiration_date?: string;
        name_servers?: string[];
        contacts?: any;
        raw_data: string;
    }> {
        if (!target) {
            throw new Error('Target is required for WHOIS lookup');
        }

        return api.post('/api/network/whois', { target });
    }

    // ===== SSL/TLS АНАЛИЗ =====

    /**
     * Анализ SSL/TLS сертификата
     */
    async analyzeSslCertificate(
        hostname: string,
        port: number = 443
    ): Promise<SSLCertificate> {
        if (!hostname) {
            throw new Error('Hostname is required for SSL analysis');
        }

        return api.post('/api/network/ssl/analyze', { hostname, port });
    }

    /**
     * Получение цепочки SSL сертификатов
     */
    async getSslCertificateChain(
        hostname: string,
        port: number = 443
    ): Promise<SSLCertificate[]> {
        if (!hostname) {
            throw new Error('Hostname is required for SSL chain analysis');
        }

        return api.post('/api/network/ssl/chain', { hostname, port });
    }

    // ===== ЭКСПОРТ И ИМПОРТ =====

    /**
     * Экспорт данных сети
     */
    async exportNetworkData(
        format: 'json' | 'csv' | 'xml',
        options: {
            include_devices?: boolean;
            include_topology?: boolean;
            include_vulnerabilities?: boolean;
            subnet?: string;
        } = {}
    ): Promise<Blob> {
        const response = await api.request<Blob>('/api/network/export', {
            method: 'POST',
            body: { format, ...options },
            headers: {
                'Accept': format === 'json' ? 'application/json' :
                    format === 'csv' ? 'text/csv' :
                        'application/xml'
            }
        });

        return response;
    }

    /**
     * Импорт данных сети
     */
    async importNetworkData(
        file: File,
        options: {
            merge_strategy?: 'replace' | 'merge' | 'skip';
            validate_before_import?: boolean;
        } = {}
    ): Promise<ApiResponse<{
        devices_imported: number;
        devices_updated: number;
        devices_skipped: number;
        errors: string[];
    }>> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('options', JSON.stringify(options));

        return api.request('/api/network/import', {
            method: 'POST',
            body: formData,
            headers: {}, // Don't set Content-Type for FormData
            timeout: 300000
        });
    }

    // ===== УТИЛИТАРНЫЕ МЕТОДЫ =====

    /**
     * Валидация настроек сканирования сети
     */
    private validateNetworkScanSettings(settings: NetworkScanSettings): void {
        if (!settings.interface) {
            throw new Error('Network interface is required');
        }

        if (!settings.network_range) {
            throw new Error('Network range is required');
        }

        // Валидация CIDR нотации
        const cidrRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\/(?:[0-9]|[1-2][0-9]|3[0-2])$/;
        if (!cidrRegex.test(settings.network_range)) {
            throw new Error('Invalid network range format. Use CIDR notation (e.g., 192.168.1.0/24)');
        }

        if (settings.timeout < 1000 || settings.timeout > 30000) {
            throw new Error('Timeout must be between 1000 and 30000 milliseconds');
        }

        if (settings.threads < 1 || settings.threads > 500) {
            throw new Error('Thread count must be between 1 and 500');
        }
    }

    /**
     * Валидация IP адреса
     */
    validateIpAddress(ip: string): boolean {
        const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        return ipRegex.test(ip);
    }

    /**
     * Валидация сетевого диапазона
     */
    validateNetworkRange(range: string): boolean {
        // CIDR notation
        const cidrRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\/(?:[0-9]|[1-2][0-9]|3[0-2])$/;

        // Range notation (192.168.1.1-192.168.1.100)
        const rangeRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)-(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

        return cidrRegex.test(range) || rangeRegex.test(range) || this.validateIpAddress(range);
    }

    /**
     * Конвертация CIDR в диапазон IP адресов
     */
    cidrToIpRange(cidr: string): { start: string; end: string; count: number } {
        const [network, prefixLength] = cidr.split('/');
        const prefix = parseInt(prefixLength, 10);

        if (prefix < 0 || prefix > 32) {
            throw new Error('Invalid CIDR prefix length');
        }

        const networkParts = network.split('.').map(Number);
        const hostBits = 32 - prefix;
        const hostCount = Math.pow(2, hostBits);

        // Расчет начального IP
        const mask = 0xFFFFFFFF << hostBits;
        const networkInt = ((networkParts[0] << 24) | (networkParts[1] << 16) | (networkParts[2] << 8) | networkParts[3]) & mask;

        // Расчет конечного IP
        const broadcastInt = networkInt | (hostCount - 1);

        const intToIp = (int: number): string => {
            return [
                (int >>> 24) & 0xFF,
                (int >>> 16) & 0xFF,
                (int >>> 8) & 0xFF,
                int & 0xFF
            ].join('.');
        };

        return {
            start: intToIp(networkInt + 1), // Исключаем network address
            end: intToIp(broadcastInt - 1), // Исключаем broadcast address
            count: hostCount - 2
        };
    }

    /**
     * Получение статистики использования API
     */
    getApiStats(): {
        totalRequests: number;
        cacheHitRatio: number;
        averageResponseTime: number;
    } {
        return api.getStats();
    }

    /**
     * Очистка кэша сетевых данных
     */
    clearNetworkCache(): void {
        api.clearCache('network');
    }
}

// ===== ЭКСПОРТ =====

// Создание глобального экземпляра
export const networkApi = new NetworkApiService();

// Экспорт класса для создания дополнительных экземпляров
export { NetworkApiService };

// Экспорт всех типов
export type * from './networkApi';

// Удобные методы для импорта
export const {
    getInterfaces,
    getInterfaceDetails,
    updateInterfaceSettings,
    startNetworkScan,
    getNetworkScanStatus,
    stopNetworkScan,
    getDiscoveredDevices,
    getDeviceDetails,
    updateDeviceInfo,
    deleteDevice,
    scanDevicePorts,
    getDevicePortScanResults,
    buildNetworkTopology,
    updateTopologyLayout,
    exportTopology,
    startSecurityAnalysis,
    getSecurityAnalysisResults,
    scanDeviceVulnerabilities,
    getNetworkStatistics,
    getDeviceHistory,
    getAutoDiscoverySettings,
    updateAutoDiscoverySettings,
    startAutoDiscovery,
    stopAutoDiscovery,
    getAutoDiscoveryStatus,
    dnsLookup,
    reverseDnsLookup,
    whoisLookup,
    analyzeSslCertificate,
    getSslCertificateChain,
    exportNetworkData,
    importNetworkData,
    validateIpAddress,
    validateNetworkRange,
    cidrToIpRange,
    getApiStats,
    clearNetworkCache
} = networkApi;

// Экспорт для отладки в development режиме
if (import.meta.env.DEV) {
    (window as any).__NETWORK_API__ = networkApi;
    console.log('🔧 Network API доступен глобально как __NETWORK_API__');
}

export default networkApi;
