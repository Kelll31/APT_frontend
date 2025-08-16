// Интерфейсы для описания хостов и сетевых связей

export interface NetworkHost {
    id: string;
    hostname: string;
    ip: string;
    macAddress?: string;
    os?: string;
    osVersion?: string;
    osFamily?: 'Windows' | 'Linux' | 'macOS' | 'Unix' | 'IoT' | 'Unknown';
    status: 'active' | 'inactive' | 'unknown' | 'unreachable';
    openPorts: Port[];
    services: Service[];
    lastSeen: string;
    firstSeen: string;
    vulnerabilitiesCount: number;
    riskScore: number; // 0-10
    location?: {
        latitude: number;
        longitude: number;
        description?: string;
        building?: string;
        floor?: string;
        room?: string;
    };
    tags: string[];
    deviceType: 'server' | 'workstation' | 'router' | 'switch' | 'printer' | 'mobile' | 'iot' | 'firewall' | 'unknown';
    vendor?: string;
    model?: string;
    serialNumber?: string;
    networkSegment?: string;
    vlan?: number;
    subnet?: string;
    gatewayIp?: string;
    dnsServers?: string[];
    responseTime?: number; // ms
    isManaged: boolean;
    owner?: string;
    description?: string;
    criticality: 'low' | 'medium' | 'high' | 'critical';
    complianceStatus?: 'compliant' | 'non-compliant' | 'unknown';
    lastScanned?: string;
    scanMethods: string[];
    additionalInfo: Record<string, any>;
}

export interface Port {
    number: number;
    protocol: 'tcp' | 'udp';
    state: 'open' | 'closed' | 'filtered';
    service?: string;
    version?: string;
    banner?: string;
    lastDetected: string;
}

export interface Service {
    name: string;
    port: number;
    protocol: 'tcp' | 'udp';
    version?: string;
    banner?: string;
    isSecure: boolean;
    vulnerabilities: string[];
    lastUpdated?: string;
    configuration?: Record<string, any>;
}

export interface NetworkConnection {
    id: string;
    sourceHostId: string;
    targetHostId: string;
    protocol: 'tcp' | 'udp' | 'icmp' | 'arp' | 'http' | 'https' | 'ssh' | 'ftp' | 'custom';
    sourcePort?: number;
    targetPort?: number;
    connectionStatus: 'established' | 'listening' | 'closed' | 'time_wait' | 'syn_sent';
    connectionType: 'direct' | 'routed' | 'vpn' | 'tunnel';
    bandwidthMbps?: number;
    latencyMs?: number;
    packetLoss?: number; // percentage
    lastDetected: string;
    firstDetected: string;
    frequency: number; // connections per hour
    dataTransferred?: number; // bytes
    description?: string;
    isEncrypted: boolean;
    trustLevel: 'trusted' | 'untrusted' | 'unknown';
    metadata: Record<string, any>;
}

export interface NetworkSegment {
    id: string;
    name: string;
    cidr: string;
    vlanId?: number;
    description?: string;
    securityLevel: 'public' | 'dmz' | 'internal' | 'restricted' | 'isolated';
    hostCount: number;
    activeHostCount: number;
    gatewayIp?: string;
    dnsServers: string[];
    dhcpRange?: {
        start: string;
        end: string;
    };
    tags: string[];
}

// Методы обнаружения хостов
export interface HostDiscoveryMethod {
    id: string;
    name: string;
    description: string;
    category: 'passive' | 'active' | 'hybrid';
    estimatedTimeSec: number;
    accuracyRating: number; // 0-100
    stealthLevel: 'low' | 'medium' | 'high'; // насколько метод заметен
    isActive: boolean;
    requiresCredentials: boolean;
    requiresPrivileges: boolean;
    supportedProtocols: string[];
    detectedInfo: string[]; // что может обнаружить
    limitations: string[];
    sampleCommand?: string;
    riskLevel: 'safe' | 'moderate' | 'aggressive';
    cost: number; // ресурсозатратность 1-5
}

// Методы построения топологии сети
export interface TopologyMappingMethod {
    id: string;
    name: string;
    description: string;
    category: 'layer2' | 'layer3' | 'application' | 'hybrid';
    requiresCredentials: boolean;
    requiresPrivileges: boolean;
    estimatedTimeSec: number;
    accuracyRating: number; // 0-100
    isActive: boolean;
    supportedDeviceTypes: string[];
    detectedRelationships: string[];
    sampleCommand?: string;
    limitations: string[];
    riskLevel: 'safe' | 'moderate' | 'aggressive';
}

// Методы обнаружения хостов
export const hostDiscoveryMethods: HostDiscoveryMethod[] = [
    {
        id: 'ping_sweep',
        name: 'ICMP Ping Sweep',
        description: 'Отправка ICMP Echo запросов для обнаружения активных хостов в сети',
        category: 'active',
        estimatedTimeSec: 30,
        accuracyRating: 75,
        stealthLevel: 'low',
        isActive: true,
        requiresCredentials: false,
        requiresPrivileges: false,
        supportedProtocols: ['icmp'],
        detectedInfo: ['IP адрес', 'статус доступности', 'время отклика'],
        limitations: ['Блокируется файрволами', 'ICMP может быть отключен'],
        sampleCommand: 'ping -c 1 192.168.1.1-254',
        riskLevel: 'safe',
        cost: 1
    },
    {
        id: 'arp_scan',
        name: 'ARP Discovery',
        description: 'Обнаружение устройств через ARP-запросы в локальной сети',
        category: 'active',
        estimatedTimeSec: 15,
        accuracyRating: 95,
        stealthLevel: 'high',
        isActive: true,
        requiresCredentials: false,
        requiresPrivileges: true,
        supportedProtocols: ['arp'],
        detectedInfo: ['IP адрес', 'MAC адрес', 'производитель устройства'],
        limitations: ['Работает только в локальной сети', 'Требует привилегии'],
        sampleCommand: 'arp-scan --localnet',
        riskLevel: 'safe',
        cost: 1
    },
    {
        id: 'tcp_syn_scan',
        name: 'TCP SYN Port Scan',
        description: 'Быстрое сканирование TCP портов с помощью SYN-пакетов',
        category: 'active',
        estimatedTimeSec: 120,
        accuracyRating: 90,
        stealthLevel: 'medium',
        isActive: false,
        requiresCredentials: false,
        requiresPrivileges: true,
        supportedProtocols: ['tcp'],
        detectedInfo: ['Открытые порты', 'сервисы', 'версии'],
        limitations: ['Требует привилегии', 'Может быть обнаружен IDS'],
        sampleCommand: 'nmap -sS 192.168.1.0/24',
        riskLevel: 'moderate',
        cost: 3
    },
    {
        id: 'udp_scan',
        name: 'UDP Port Scan',
        description: 'Сканирование UDP портов для обнаружения сервисов',
        category: 'active',
        estimatedTimeSec: 300,
        accuracyRating: 70,
        stealthLevel: 'medium',
        isActive: false,
        requiresCredentials: false,
        requiresPrivileges: true,
        supportedProtocols: ['udp'],
        detectedInfo: ['UDP сервисы', 'SNMP', 'DNS', 'DHCP'],
        limitations: ['Медленное', 'Много ложных срабатываний'],
        sampleCommand: 'nmap -sU --top-ports 100 192.168.1.0/24',
        riskLevel: 'moderate',
        cost: 4
    },
    {
        id: 'snmp_walk',
        name: 'SNMP Discovery',
        description: 'Обнаружение и опрос устройств через SNMP протокол',
        category: 'active',
        estimatedTimeSec: 60,
        accuracyRating: 95,
        stealthLevel: 'low',
        isActive: false,
        requiresCredentials: true,
        requiresPrivileges: false,
        supportedProtocols: ['snmp'],
        detectedInfo: ['Детальная информация об устройстве', 'интерфейсы', 'маршрутизация'],
        limitations: ['Требует community string', 'Не все устройства поддерживают'],
        sampleCommand: 'snmpwalk -v2c -c public 192.168.1.1',
        riskLevel: 'safe',
        cost: 2
    },
    {
        id: 'netbios_scan',
        name: 'NetBIOS/SMB Discovery',
        description: 'Обнаружение Windows хостов через NetBIOS и SMB',
        category: 'active',
        estimatedTimeSec: 45,
        accuracyRating: 85,
        stealthLevel: 'low',
        isActive: false,
        requiresCredentials: false,
        requiresPrivileges: false,
        supportedProtocols: ['netbios', 'smb'],
        detectedInfo: ['Имена хостов', 'домены', 'общие ресурсы'],
        limitations: ['Только Windows', 'Может быть отключен'],
        sampleCommand: 'nbtscan 192.168.1.0/24',
        riskLevel: 'safe',
        cost: 2
    },
    {
        id: 'dhcp_discovery',
        name: 'DHCP Lease Analysis',
        description: 'Анализ DHCP аренд для определения активных хостов',
        category: 'passive',
        estimatedTimeSec: 10,
        accuracyRating: 90,
        stealthLevel: 'high',
        isActive: false,
        requiresCredentials: true,
        requiresPrivileges: false,
        supportedProtocols: ['dhcp'],
        detectedInfo: ['IP адрес', 'MAC адрес', 'имя хоста', 'время аренды'],
        limitations: ['Требует доступ к DHCP серверу', 'Только DHCP клиенты'],
        sampleCommand: 'dhcp-lease-list',
        riskLevel: 'safe',
        cost: 1
    },
    {
        id: 'dns_zone_transfer',
        name: 'DNS Zone Transfer',
        description: 'Попытка получения полной зоны DNS для обнаружения хостов',
        category: 'active',
        estimatedTimeSec: 20,
        accuracyRating: 100,
        stealthLevel: 'low',
        isActive: false,
        requiresCredentials: false,
        requiresPrivileges: false,
        supportedProtocols: ['dns'],
        detectedInfo: ['Все записи DNS', 'субдомены', 'mail серверы'],
        limitations: ['Редко работает', 'Требует неправильной конфигурации'],
        sampleCommand: 'dig @dns-server domain.com AXFR',
        riskLevel: 'safe',
        cost: 1
    },
    {
        id: 'passive_listening',
        name: 'Passive Network Monitoring',
        description: 'Пассивное прослушивание сетевого трафика для обнаружения хостов',
        category: 'passive',
        estimatedTimeSec: 600,
        accuracyRating: 95,
        stealthLevel: 'high',
        isActive: false,
        requiresCredentials: false,
        requiresPrivileges: true,
        supportedProtocols: ['all'],
        detectedInfo: ['Весь сетевой трафик', 'коммуникации', 'протоколы'],
        limitations: ['Требует времени', 'Нужен сетевой интерфейс в promiscuous режиме'],
        sampleCommand: 'tcpdump -i eth0 -n',
        riskLevel: 'safe',
        cost: 5
    }
];

// Методы построения топологии сети
export const topologyMappingMethods: TopologyMappingMethod[] = [
    {
        id: 'port_correlation',
        name: 'Port Scan Correlation',
        description: 'Определение связей между хостами на основе анализа открытых портов и сервисов',
        category: 'application',
        requiresCredentials: false,
        requiresPrivileges: false,
        estimatedTimeSec: 90,
        accuracyRating: 70,
        isActive: true,
        supportedDeviceTypes: ['all'],
        detectedRelationships: ['клиент-сервер', 'peer-to-peer'],
        sampleCommand: 'nmap -p 1-65535 --open 192.168.1.0/24',
        limitations: ['Не показывает физические связи', 'Только логические связи'],
        riskLevel: 'moderate'
    },
    {
        id: 'snmp_topology',
        name: 'SNMP Topology Discovery',
        description: 'Построение физической топологии через SNMP (MIB-II, LLDP, CDP)',
        category: 'layer2',
        requiresCredentials: true,
        requiresPrivileges: false,
        estimatedTimeSec: 120,
        accuracyRating: 95,
        isActive: false,
        supportedDeviceTypes: ['router', 'switch', 'managed devices'],
        detectedRelationships: ['физические связи', 'VLAN', 'spanning tree'],
        sampleCommand: 'snmpwalk -v2c -c public 192.168.1.1 1.3.6.1.2.1.2.2',
        limitations: ['Только управляемые устройства', 'Требует SNMP community'],
        riskLevel: 'safe'
    },
    {
        id: 'cdp_lldp_discovery',
        name: 'CDP/LLDP Discovery',
        description: 'Обнаружение соседних устройств через протоколы CDP и LLDP',
        category: 'layer2',
        requiresCredentials: true,
        requiresPrivileges: false,
        estimatedTimeSec: 30,
        accuracyRating: 98,
        isActive: false,
        supportedDeviceTypes: ['cisco', 'switch', 'router'],
        detectedRelationships: ['непосредственные соседи', 'физические порты'],
        sampleCommand: 'snmpwalk -v2c -c public switch 1.3.6.1.4.1.9.9.23.1.2.1.1.6',
        limitations: ['Только Cisco (CDP)', 'Не все устройства поддерживают'],
        riskLevel: 'safe'
    },
    {
        id: 'traceroute_mapping',
        name: 'Traceroute Path Discovery',
        description: 'Построение маршрутов до хостов для определения топологии layer 3',
        category: 'layer3',
        requiresCredentials: false,
        requiresPrivileges: false,
        estimatedTimeSec: 180,
        accuracyRating: 80,
        isActive: false,
        supportedDeviceTypes: ['router', 'layer3 switch'],
        detectedRelationships: ['маршруты', 'шлюзы', 'hop-by-hop пути'],
        sampleCommand: 'traceroute -n 192.168.1.1',
        limitations: ['Может быть заблокирован', 'Не показывает все пути'],
        riskLevel: 'safe'
    },
    {
        id: 'arp_table_analysis',
        name: 'ARP Table Analysis',
        description: 'Анализ ARP таблиц устройств для построения связей layer 2',
        category: 'layer2',
        requiresCredentials: true,
        requiresPrivileges: false,
        estimatedTimeSec: 60,
        accuracyRating: 85,
        isActive: false,
        supportedDeviceTypes: ['router', 'switch', 'server'],
        detectedRelationships: ['MAC-IP привязки', 'локальные сегменты'],
        sampleCommand: 'snmpwalk -v2c -c public 192.168.1.1 1.3.6.1.2.1.4.22.1.2',
        limitations: ['Только локальные сегменты', 'Временные записи'],
        riskLevel: 'safe'
    },
    {
        id: 'spanning_tree_analysis',
        name: 'Spanning Tree Analysis',
        description: 'Анализ протокола Spanning Tree для определения топологии коммутаторов',
        category: 'layer2',
        requiresCredentials: true,
        requiresPrivileges: false,
        estimatedTimeSec: 45,
        accuracyRating: 90,
        isActive: false,
        supportedDeviceTypes: ['switch'],
        detectedRelationships: ['spanning tree топология', 'root bridge', 'blocked ports'],
        sampleCommand: 'snmpwalk -v2c -c public switch 1.3.6.1.2.1.17.2.15',
        limitations: ['Только коммутаторы', 'Сложная интерпретация'],
        riskLevel: 'safe'
    },
    {
        id: 'flow_analysis',
        name: 'Network Flow Analysis',
        description: 'Анализ NetFlow/sFlow данных для построения карты коммуникаций',
        category: 'application',
        requiresCredentials: true,
        requiresPrivileges: false,
        estimatedTimeSec: 300,
        accuracyRating: 95,
        isActive: false,
        supportedDeviceTypes: ['router', 'switch', 'firewall'],
        detectedRelationships: ['потоки данных', 'bandwidth usage', 'application flows'],
        limitations: ['Требует настройку NetFlow', 'Большой объем данных'],
        riskLevel: 'safe'
    },
    {
        id: 'active_probe',
        name: 'Active Network Probing',
        description: 'Активное зондирование сети для выявления маршрутизации и связей',
        category: 'hybrid',
        requiresCredentials: false,
        requiresPrivileges: true,
        estimatedTimeSec: 240,
        accuracyRating: 75,
        isActive: false,
        supportedDeviceTypes: ['all'],
        detectedRelationships: ['реальные пути', 'load balancing', 'failover paths'],
        sampleCommand: 'paris-traceroute target',
        limitations: ['Может быть заметен', 'Требует специальные инструменты'],
        riskLevel: 'moderate'
    }
];

// Пример обнаруженных хостов
export const discoveredHosts: NetworkHost[] = [
    {
        id: 'host-001',
        hostname: 'dc-srv-01.company.local',
        ip: '192.168.1.10',
        macAddress: '00:1A:2B:3C:4D:5E',
        os: 'Windows Server 2022',
        osVersion: '21H2',
        osFamily: 'Windows',
        status: 'active',
        openPorts: [
            { number: 22, protocol: 'tcp', state: 'open', service: 'ssh', version: 'OpenSSH 8.1', lastDetected: '2025-08-16T15:30:00Z' },
            { number: 80, protocol: 'tcp', state: 'open', service: 'http', version: 'nginx 1.20.1', lastDetected: '2025-08-16T15:30:00Z' },
            { number: 443, protocol: 'tcp', state: 'open', service: 'https', version: 'nginx 1.20.1', lastDetected: '2025-08-16T15:30:00Z' },
            { number: 3389, protocol: 'tcp', state: 'open', service: 'rdp', lastDetected: '2025-08-16T15:30:00Z' }
        ],
        services: [
            { name: 'ssh', port: 22, protocol: 'tcp', version: 'OpenSSH 8.1', isSecure: true, vulnerabilities: [] },
            { name: 'web-server', port: 80, protocol: 'tcp', version: 'nginx 1.20.1', isSecure: false, vulnerabilities: ['CVE-2021-23017'] },
            { name: 'web-server-ssl', port: 443, protocol: 'tcp', version: 'nginx 1.20.1', isSecure: true, vulnerabilities: [] }
        ],
        lastSeen: '2025-08-16T15:30:00Z',
        firstSeen: '2025-08-10T09:00:00Z',
        vulnerabilitiesCount: 1,
        riskScore: 6.5,
        location: {
            latitude: 55.7558,
            longitude: 37.6176,
            description: 'Moscow Data Center',
            building: 'Building A',
            floor: '3',
            room: 'Server Room 1'
        },
        tags: ['production', 'web-server', 'domain-controller'],
        deviceType: 'server',
        vendor: 'Dell',
        model: 'PowerEdge R740',
        serialNumber: 'SRV001234',
        networkSegment: 'DMZ',
        vlan: 100,
        subnet: '192.168.1.0/24',
        gatewayIp: '192.168.1.1',
        dnsServers: ['8.8.8.8', '8.8.4.4'],
        responseTime: 2,
        isManaged: true,
        owner: 'IT Department',
        description: 'Primary domain controller and web server',
        criticality: 'critical',
        complianceStatus: 'compliant',
        lastScanned: '2025-08-16T15:30:00Z',
        scanMethods: ['ping_sweep', 'tcp_syn_scan', 'snmp_walk'],
        additionalInfo: {
            uptime: '45 days',
            cpuCores: 16,
            ramGB: 64,
            diskGB: 2000
        }
    },
    {
        id: 'host-002',
        hostname: 'ws-user-23.company.local',
        ip: '192.168.1.101',
        macAddress: '00:1F:2E:3D:4C:5B',
        os: 'Windows 11',
        osVersion: '22H2',
        osFamily: 'Windows',
        status: 'active',
        openPorts: [
            { number: 135, protocol: 'tcp', state: 'open', service: 'rpc', lastDetected: '2025-08-16T15:28:00Z' },
            { number: 139, protocol: 'tcp', state: 'open', service: 'netbios-ssn', lastDetected: '2025-08-16T15:28:00Z' },
            { number: 445, protocol: 'tcp', state: 'open', service: 'smb', lastDetected: '2025-08-16T15:28:00Z' }
        ],
        services: [
            { name: 'rpc', port: 135, protocol: 'tcp', isSecure: false, vulnerabilities: [] },
            { name: 'smb', port: 445, protocol: 'tcp', isSecure: false, vulnerabilities: ['CVE-2020-0796'] }
        ],
        lastSeen: '2025-08-16T15:28:00Z',
        firstSeen: '2025-08-15T08:30:00Z',
        vulnerabilitiesCount: 1,
        riskScore: 4.2,
        tags: ['office', 'end-user', 'accounting'],
        deviceType: 'workstation',
        vendor: 'Lenovo',
        model: 'ThinkPad T14',
        networkSegment: 'Internal',
        vlan: 200,
        subnet: '192.168.1.0/24',
        gatewayIp: '192.168.1.1',
        responseTime: 1,
        isManaged: true,
        owner: 'John Doe',
        description: 'Accounting department workstation',
        criticality: 'medium',
        complianceStatus: 'compliant',
        lastScanned: '2025-08-16T15:28:00Z',
        scanMethods: ['arp_scan', 'netbios_scan'],
        additionalInfo: {
            user: 'john.doe',
            domain: 'company.local',
            lastLogin: '2025-08-16T08:00:00Z'
        }
    },
    {
        id: 'host-003',
        hostname: 'printer-hp-01',
        ip: '192.168.1.50',
        macAddress: '00:1B:2A:3D:4E:5F',
        osFamily: 'Unknown',
        status: 'active',
        openPorts: [
            { number: 9100, protocol: 'tcp', state: 'open', service: 'jetdirect', lastDetected: '2025-08-16T15:25:00Z' },
            { number: 80, protocol: 'tcp', state: 'open', service: 'http', lastDetected: '2025-08-16T15:25:00Z' },
            { number: 161, protocol: 'udp', state: 'open', service: 'snmp', lastDetected: '2025-08-16T15:25:00Z' }
        ],
        services: [
            { name: 'printer', port: 9100, protocol: 'tcp', isSecure: false, vulnerabilities: [] },
            { name: 'web-interface', port: 80, protocol: 'tcp', isSecure: false, vulnerabilities: [] },
            { name: 'snmp', port: 161, protocol: 'udp', isSecure: false, vulnerabilities: [] }
        ],
        lastSeen: '2025-08-16T15:25:00Z',
        firstSeen: '2025-07-20T10:00:00Z',
        vulnerabilitiesCount: 0,
        riskScore: 2.1,
        tags: ['office', 'printer', 'network-device'],
        deviceType: 'printer',
        vendor: 'HP',
        model: 'LaserJet Pro M404n',
        serialNumber: 'HP1234567',
        networkSegment: 'Office',
        vlan: 300,
        subnet: '192.168.1.0/24',
        responseTime: 5,
        isManaged: false,
        description: 'Office network printer',
        criticality: 'low',
        complianceStatus: 'unknown',
        lastScanned: '2025-08-16T15:25:00Z',
        scanMethods: ['ping_sweep', 'snmp_walk'],
        additionalInfo: {
            paperStatus: 'OK',
            tonerLevel: '65%',
            pagesTotal: 15420
        }
    },
    {
        id: 'host-004',
        hostname: 'fw-perimeter-01',
        ip: '192.168.1.1',
        macAddress: '00:0C:29:12:34:56',
        os: 'pfSense',
        osVersion: '2.6.0',
        osFamily: 'Unix',
        status: 'active',
        openPorts: [
            { number: 22, protocol: 'tcp', state: 'open', service: 'ssh', lastDetected: '2025-08-16T15:30:00Z' },
            { number: 80, protocol: 'tcp', state: 'open', service: 'http', lastDetected: '2025-08-16T15:30:00Z' },
            { number: 443, protocol: 'tcp', state: 'open', service: 'https', lastDetected: '2025-08-16T15:30:00Z' }
        ],
        services: [
            { name: 'ssh-mgmt', port: 22, protocol: 'tcp', isSecure: true, vulnerabilities: [] },
            { name: 'web-admin', port: 443, protocol: 'tcp', isSecure: true, vulnerabilities: [] }
        ],
        lastSeen: '2025-08-16T15:30:00Z',
        firstSeen: '2025-06-01T12:00:00Z',
        vulnerabilitiesCount: 0,
        riskScore: 8.5,
        tags: ['security', 'firewall', 'gateway', 'critical'],
        deviceType: 'firewall',
        vendor: 'Netgate',
        model: 'SG-3100',
        networkSegment: 'Perimeter',
        isManaged: true,
        owner: 'Network Team',
        description: 'Main perimeter firewall',
        criticality: 'critical',
        complianceStatus: 'compliant',
        lastScanned: '2025-08-16T15:30:00Z',
        scanMethods: ['tcp_syn_scan'],
        additionalInfo: {
            firewallRules: 145,
            activeConnections: 2341,
            throughputMbps: 850
        }
    },
    {
        id: 'host-005',
        hostname: 'iot-camera-lobby',
        ip: '192.168.1.150',
        macAddress: '00:12:34:56:78:9A',
        osFamily: 'IoT',
        status: 'active',
        openPorts: [
            { number: 80, protocol: 'tcp', state: 'open', service: 'http', lastDetected: '2025-08-16T15:20:00Z' },
            { number: 554, protocol: 'tcp', state: 'open', service: 'rtsp', lastDetected: '2025-08-16T15:20:00Z' }
        ],
        services: [
            { name: 'web-interface', port: 80, protocol: 'tcp', isSecure: false, vulnerabilities: ['CVE-2021-32934'] },
            { name: 'video-stream', port: 554, protocol: 'tcp', isSecure: false, vulnerabilities: [] }
        ],
        lastSeen: '2025-08-16T15:20:00Z',
        firstSeen: '2025-08-01T14:00:00Z',
        vulnerabilitiesCount: 1,
        riskScore: 5.8,
        location: {
            latitude: 55.7558,
            longitude: 37.6176,
            description: 'Main lobby',
            building: 'Building A',
            floor: '1'
        },
        tags: ['iot', 'camera', 'security', 'lobby'],
        deviceType: 'iot',
        vendor: 'Hikvision',
        model: 'DS-2CD2042WD-I',
        networkSegment: 'IoT',
        vlan: 400,
        isManaged: false,
        description: 'Security camera in main lobby',
        criticality: 'low',
        complianceStatus: 'non-compliant',
        lastScanned: '2025-08-16T15:20:00Z',
        scanMethods: ['ping_sweep', 'tcp_syn_scan'],
        additionalInfo: {
            resolution: '4MP',
            nightVision: true,
            recordingStatus: 'active'
        }
    }
];

// Связи между хостами
export const networkConnections: NetworkConnection[] = [
    {
        id: 'conn-001',
        sourceHostId: 'host-002',
        targetHostId: 'host-001',
        protocol: 'tcp',
        sourcePort: 52341,
        targetPort: 22,
        connectionStatus: 'established',
        connectionType: 'direct',
        bandwidthMbps: 100,
        latencyMs: 2,
        packetLoss: 0,
        lastDetected: '2025-08-16T15:31:00Z',
        firstDetected: '2025-08-16T08:30:00Z',
        frequency: 5,
        dataTransferred: 1024000,
        description: 'SSH connection from workstation to server',
        isEncrypted: true,
        trustLevel: 'trusted',
        metadata: {
            sessionDuration: '7h 1m',
            authMethod: 'key-based'
        }
    },
    {
        id: 'conn-002',
        sourceHostId: 'host-002',
        targetHostId: 'host-003',
        protocol: 'tcp',
        sourcePort: 45123,
        targetPort: 9100,
        connectionStatus: 'established',
        connectionType: 'direct',
        bandwidthMbps: 10,
        latencyMs: 1,
        lastDetected: '2025-08-16T15:32:00Z',
        firstDetected: '2025-08-16T15:30:00Z',
        frequency: 1,
        dataTransferred: 56780,
        description: 'Print job from workstation to printer',
        isEncrypted: false,
        trustLevel: 'trusted',
        metadata: {
            printJob: 'document.pdf',
            pages: 5
        }
    },
    {
        id: 'conn-003',
        sourceHostId: 'host-001',
        targetHostId: 'host-004',
        protocol: 'tcp',
        sourcePort: 443,
        targetPort: 34567,
        connectionStatus: 'established',
        connectionType: 'direct',
        bandwidthMbps: 1000,
        latencyMs: 1,
        lastDetected: '2025-08-16T15:31:00Z',
        firstDetected: '2025-08-16T00:00:00Z',
        frequency: 100,
        description: 'Regular traffic through firewall',
        isEncrypted: true,
        trustLevel: 'trusted',
        metadata: {
            firewallRule: 'ALLOW_DMZ_TO_INTERNAL'
        }
    },
    {
        id: 'conn-004',
        sourceHostId: 'host-005',
        targetHostId: 'host-001',
        protocol: 'tcp',
        sourcePort: 1234,
        targetPort: 80,
        connectionStatus: 'established',
        connectionType: 'routed',
        bandwidthMbps: 50,
        latencyMs: 5,
        lastDetected: '2025-08-16T15:25:00Z',
        firstDetected: '2025-08-16T00:00:00Z',
        frequency: 24,
        description: 'Camera video stream to recording server',
        isEncrypted: false,
        trustLevel: 'untrusted',
        metadata: {
            streamType: 'RTSP',
            quality: '4MP',
            fps: 25
        }
    }
];

// Сегменты сети
export const networkSegments: NetworkSegment[] = [
    {
        id: 'segment-001',
        name: 'DMZ',
        cidr: '192.168.1.0/26',
        vlanId: 100,
        description: 'Demilitarized Zone for public-facing servers',
        securityLevel: 'dmz',
        hostCount: 5,
        activeHostCount: 4,
        gatewayIp: '192.168.1.1',
        dnsServers: ['8.8.8.8', '8.8.4.4'],
        tags: ['production', 'public-facing']
    },
    {
        id: 'segment-002',
        name: 'Internal Network',
        cidr: '192.168.1.64/26',
        vlanId: 200,
        description: 'Internal corporate network for workstations',
        securityLevel: 'internal',
        hostCount: 45,
        activeHostCount: 32,
        gatewayIp: '192.168.1.65',
        dnsServers: ['192.168.1.10'],
        dhcpRange: {
            start: '192.168.1.70',
            end: '192.168.1.120'
        },
        tags: ['internal', 'workstations']
    },
    {
        id: 'segment-003',
        name: 'Office Devices',
        cidr: '192.168.1.128/26',
        vlanId: 300,
        description: 'Printers and office equipment',
        securityLevel: 'internal',
        hostCount: 8,
        activeHostCount: 6,
        gatewayIp: '192.168.1.129',
        dnsServers: ['192.168.1.10'],
        tags: ['office', 'printers']
    },
    {
        id: 'segment-004',
        name: 'IoT Network',
        cidr: '192.168.1.192/26',
        vlanId: 400,
        description: 'Internet of Things devices network',
        securityLevel: 'restricted',
        hostCount: 15,
        activeHostCount: 12,
        gatewayIp: '192.168.1.193',
        dnsServers: ['8.8.8.8'],
        tags: ['iot', 'isolated']
    }
];

// Функции для работы с данными

export const getHostByIp = (ip: string): NetworkHost | undefined => {
    return discoveredHosts.find(host => host.ip === ip);
};

export const getHostById = (id: string): NetworkHost | undefined => {
    return discoveredHosts.find(host => host.id === id);
};

export const getActiveHosts = (): NetworkHost[] => {
    return discoveredHosts.filter(host => host.status === 'active');
};

export const getHostsBySegment = (segment: string): NetworkHost[] => {
    return discoveredHosts.filter(host => host.networkSegment === segment);
};

export const getHostsByDeviceType = (deviceType: string): NetworkHost[] => {
    return discoveredHosts.filter(host => host.deviceType === deviceType);
};

export const getHostsByCriticality = (criticality: string): NetworkHost[] => {
    return discoveredHosts.filter(host => host.criticality === criticality);
};

export const getConnectionsForHost = (hostId: string): NetworkConnection[] => {
    return networkConnections.filter(conn =>
        conn.sourceHostId === hostId || conn.targetHostId === hostId
    );
};

export const getActiveConnections = (): NetworkConnection[] => {
    return networkConnections.filter(conn => conn.connectionStatus === 'established');
};

export const addDiscoveredHost = (host: NetworkHost): void => {
    const existingIndex = discoveredHosts.findIndex(h => h.id === host.id);
    if (existingIndex >= 0) {
        discoveredHosts[existingIndex] = { ...discoveredHosts[existingIndex], ...host };
    } else {
        discoveredHosts.push(host);
    }
};

export const updateHostStatus = (hostId: string, status: NetworkHost['status']): void => {
    const host = discoveredHosts.find(h => h.id === hostId);
    if (host) {
        host.status = status;
        host.lastSeen = new Date().toISOString();
    }
};

export const addNetworkConnection = (connection: NetworkConnection): void => {
    const existingIndex = networkConnections.findIndex(c => c.id === connection.id);
    if (existingIndex >= 0) {
        networkConnections[existingIndex] = connection;
    } else {
        networkConnections.push(connection);
    }
};

export const getActiveHostDiscoveryMethods = (): HostDiscoveryMethod[] => {
    return hostDiscoveryMethods.filter(method => method.isActive);
};

export const getActiveTopologyMappingMethods = (): TopologyMappingMethod[] => {
    return topologyMappingMethods.filter(method => method.isActive);
};

export const getMethodsByCategory = (category: string): HostDiscoveryMethod[] => {
    return hostDiscoveryMethods.filter(method => method.category === category);
};

export const getTopologyMethodsByCategory = (category: string): TopologyMappingMethod[] => {
    return topologyMappingMethods.filter(method => method.category === category);
};

export const calculateNetworkStatistics = () => {
    const totalHosts = discoveredHosts.length;
    const activeHosts = getActiveHosts().length;
    const totalConnections = networkConnections.length;
    const activeConnections = getActiveConnections().length;

    const hostsWithVulnerabilities = discoveredHosts.filter(h => h.vulnerabilitiesCount > 0).length;
    const totalVulnerabilities = discoveredHosts.reduce((sum, h) => sum + h.vulnerabilitiesCount, 0);

    const avgRiskScore = discoveredHosts.reduce((sum, h) => sum + h.riskScore, 0) / totalHosts;

    const deviceTypeDistribution = discoveredHosts.reduce((acc, host) => {
        acc[host.deviceType] = (acc[host.deviceType] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const segmentDistribution = discoveredHosts.reduce((acc, host) => {
        const segment = host.networkSegment || 'unknown';
        acc[segment] = (acc[segment] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return {
        totalHosts,
        activeHosts,
        inactiveHosts: totalHosts - activeHosts,
        totalConnections,
        activeConnections,
        hostsWithVulnerabilities,
        totalVulnerabilities,
        avgRiskScore: Math.round(avgRiskScore * 10) / 10,
        deviceTypeDistribution,
        segmentDistribution,
        uptime: Math.round((activeHosts / totalHosts) * 100),
        managedHosts: discoveredHosts.filter(h => h.isManaged).length,
        criticalHosts: discoveredHosts.filter(h => h.criticality === 'critical').length
    };
};

export const generateTopologyData = () => {
    const nodes = discoveredHosts.map(host => ({
        id: host.id,
        label: host.hostname || host.ip,
        ip: host.ip,
        type: host.deviceType,
        status: host.status,
        riskScore: host.riskScore,
        criticality: host.criticality,
        group: host.networkSegment || 'unknown',
        size: Math.max(10, host.vulnerabilitiesCount * 2 + 10),
        color: getHostColor(host),
        metadata: {
            os: host.os,
            vendor: host.vendor,
            model: host.model,
            openPorts: host.openPorts.length,
            services: host.services.length
        }
    }));

    const edges = networkConnections.map(conn => ({
        id: conn.id,
        source: conn.sourceHostId,
        target: conn.targetHostId,
        protocol: conn.protocol,
        status: conn.connectionStatus,
        bandwidth: conn.bandwidthMbps,
        latency: conn.latencyMs,
        encrypted: conn.isEncrypted,
        weight: Math.max(1, Math.log(conn.frequency || 1)),
        color: getConnectionColor(conn),
        metadata: conn.metadata
    }));

    return { nodes, edges };
};

const getHostColor = (host: NetworkHost): string => {
    if (host.status !== 'active') return '#94a3b8'; // gray for inactive

    switch (host.criticality) {
        case 'critical': return '#dc2626'; // red
        case 'high': return '#ea580c'; // orange
        case 'medium': return '#ca8a04'; // yellow
        case 'low': return '#16a34a'; // green
        default: return '#6366f1'; // blue
    }
};

const getConnectionColor = (conn: NetworkConnection): string => {
    if (!conn.isEncrypted) return '#ef4444'; // red for unencrypted
    if (conn.trustLevel === 'untrusted') return '#f97316'; // orange for untrusted
    return '#10b981'; // green for secure
};

// Экспорт всего
export default {
    discoveredHosts,
    networkConnections,
    networkSegments,
    hostDiscoveryMethods,
    topologyMappingMethods,
    getHostByIp,
    getHostById,
    getActiveHosts,
    getHostsBySegment,
    getHostsByDeviceType,
    getConnectionsForHost,
    getActiveConnections,
    addDiscoveredHost,
    updateHostStatus,
    addNetworkConnection,
    getActiveHostDiscoveryMethods,
    getActiveTopologyMappingMethods,
    getMethodsByCategory,
    getTopologyMethodsByCategory,
    calculateNetworkStatistics,
    generateTopologyData
};
