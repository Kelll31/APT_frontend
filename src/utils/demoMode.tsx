// src/utils/demoMode.tsx

/**
 * IP Roast Frontend - Demo Mode Utilities v3.0
 * Симуляция API ответов для демонстрационного режима
 */

import { useState } from 'react';

// ===== ТИПЫ ДАННЫХ =====

export interface MockApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  timestamp: string;
  requestId: string;
  metadata?: {
    total?: number;
    page?: number;
    pageSize?: number;
    hasMore?: boolean;
  } | undefined;
}

export interface DemoDevice {
  id: string;
  ip: string;
  hostname: string;
  mac: string;
  vendor: string;
  os: string;
  status: 'online' | 'offline';
  ports: DemoPort[];
  vulnerabilities: DemoVulnerability[];
  lastSeen: string;
  riskScore: number;
  deviceType: string;
  location?: string | undefined;
}

export interface DemoPort {
  number: number;
  protocol: 'tcp' | 'udp';
  state: 'open' | 'closed' | 'filtered';
  service: string;
  version?: string | undefined;
  banner?: string | undefined;
}

export interface DemoVulnerability {
  id: string;
  cve: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  cvss: number;
  port?: number | undefined;
  service?: string | undefined;
  solution: string;
}

export interface DemoScanResult {
  id: string;
  target: string;
  status: 'running' | 'completed' | 'failed';
  progress: number;
  phase: string;
  startTime: string;
  endTime?: string | undefined;
  devices: DemoDevice[];
  totalDevices: number;
  vulnerabilities: DemoVulnerability[];
  riskScore: number;
}

export interface DemoReport {
  id: string;
  name: string;
  type: 'scan' | 'vulnerability' | 'compliance' | 'executive';
  description: string;
  createdAt: string;
  author: string;
  format: 'pdf' | 'html' | 'json' | 'xlsx';
  size: string;
  downloadUrl: string;
}

export interface DemoNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

// ===== КОНСТАНТЫ =====

const DEMO_VENDORS = [
  'Cisco', 'HP', 'Dell', 'Lenovo', 'Apple', 'Microsoft', 'VMware',
  'Intel', 'AMD', 'NVIDIA', 'Raspberry Pi Foundation', 'Unknown'
];

const DEMO_OS = [
  'Windows 10', 'Windows 11', 'Windows Server 2019', 'Windows Server 2022',
  'Ubuntu 20.04', 'Ubuntu 22.04', 'CentOS 7', 'CentOS 8', 'RHEL 8', 'RHEL 9',
  'macOS Monterey', 'macOS Ventura', 'iOS 15', 'iOS 16', 'Android 11', 'Android 12',
  'pfSense', 'OpenWrt', 'Unknown'
];

const DEMO_DEVICE_TYPES = [
  'Desktop', 'Laptop', 'Server', 'Router', 'Switch', 'Firewall',
  'Printer', 'Scanner', 'Camera', 'Phone', 'Tablet', 'IoT Device'
];

const DEMO_LOCATIONS = [
  'Офис A', 'Офис B', 'Дата-центр', 'Склад', 'Производство',
  'Удаленное подключение', 'DMZ', 'Гостевая сеть'
];

const DEMO_SERVICES = [
  { name: 'HTTP', ports: [80, 8080, 8000] },
  { name: 'HTTPS', ports: [443, 8443] },
  { name: 'SSH', ports: [22, 2222] },
  { name: 'FTP', ports: [21, 2121] },
  { name: 'Telnet', ports: [23] },
  { name: 'SMTP', ports: [25, 587] },
  { name: 'DNS', ports: [53] },
  { name: 'DHCP', ports: [67, 68] },
  { name: 'TFTP', ports: [69] },
  { name: 'POP3', ports: [110] },
  { name: 'IMAP', ports: [143] },
  { name: 'SNMP', ports: [161] },
  { name: 'SMB', ports: [445] },
  { name: 'MySQL', ports: [3306] },
  { name: 'PostgreSQL', ports: [5432] },
  { name: 'Redis', ports: [6379] },
  { name: 'MongoDB', ports: [27017] }
];

const DEMO_VULNERABILITIES = [
  {
    cve: 'CVE-2023-1234',
    title: 'Remote Code Execution in Web Server',
    description: 'A buffer overflow vulnerability allows remote code execution',
    severity: 'critical' as const,
    cvss: 9.8
  },
  {
    cve: 'CVE-2023-5678',
    title: 'SQL Injection in Database Interface',
    description: 'Improper input validation allows SQL injection attacks',
    severity: 'high' as const,
    cvss: 8.1
  },
  {
    cve: 'CVE-2023-9012',
    title: 'Cross-Site Scripting (XSS)',
    description: 'Stored XSS vulnerability in user input fields',
    severity: 'medium' as const,
    cvss: 6.1
  },
  {
    cve: 'CVE-2023-3456',
    title: 'Information Disclosure',
    description: 'Sensitive information exposed through error messages',
    severity: 'low' as const,
    cvss: 3.3
  }
];

const DEMO_ERRORS = [
  { message: 'Connection timeout', code: 'TIMEOUT' },
  { message: 'Access denied', code: 'ACCESS_DENIED' },
  { message: 'Network unreachable', code: 'NETWORK_ERROR' },
  { message: 'Service unavailable', code: 'SERVICE_ERROR' },
  { message: 'Invalid target', code: 'INVALID_TARGET' }
];

const DEMO_MESSAGES = [
  {
    type: 'info' as const,
    title: 'Сканирование запущено',
    message: 'Начато сканирование сети 192.168.1.0/24'
  },
  {
    type: 'success' as const,
    title: 'Сканирование завершено',
    message: 'Обнаружено 15 устройств, найдено 3 уязвимости'
  },
  {
    type: 'warning' as const,
    title: 'Высокий риск',
    message: 'Обнаружены критические уязвимости на сервере 192.168.1.100'
  },
  {
    type: 'error' as const,
    title: 'Ошибка сканирования',
    message: 'Не удается подключиться к целевому хосту'
  }
];

// ===== КЛАСС DEMO API =====

export class DemoApiManager {
  private static instance: DemoApiManager;
  private requestDelay: number = 1000;

  private constructor() { }

  static getInstance(): DemoApiManager {
    if (!DemoApiManager.instance) {
      DemoApiManager.instance = new DemoApiManager();
    }
    return DemoApiManager.instance;
  }

  setRequestDelay(delay: number): void {
    this.requestDelay = delay;
  }

  // Публичный метод для генерации ID
  generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async mockRequest<T>(
    data: T,
    options: { delay?: number; errorRate?: number } = {}
  ): Promise<MockApiResponse<T>> {
    const { delay = this.requestDelay } = options;

    // Симуляция задержки сети
    await new Promise(resolve => setTimeout(resolve, delay));

    // Симуляция случайных ошибок
    if (Math.random() < (options.errorRate || 0)) {
      const randomError = this.getRandomArrayItem(DEMO_ERRORS);
      if (!randomError) {
        throw new Error('No demo errors available');
      }

      const errorResponse: MockApiResponse<T> = {
        success: false,
        error: randomError.message,
        code: randomError.code,
        timestamp: new Date().toISOString(),
        requestId: this.generateId('req')
      };
      return errorResponse;
    }

    // Успешный ответ
    const metadata = Array.isArray(data) ? {
      total: data.length,
      page: 1,
      pageSize: data.length,
      hasMore: false
    } : undefined;

    const successResponse: MockApiResponse<T> = {
      success: true,
      data,
      timestamp: new Date().toISOString(),
      requestId: this.generateId('req'),
      metadata
    };
    return successResponse;
  }

  generateDemoDevice(): DemoDevice {
    const deviceType = this.getRandomArrayItem(DEMO_DEVICE_TYPES) || 'Unknown';
    const location = Math.random() > 0.3 ? this.getRandomArrayItem(DEMO_LOCATIONS) : undefined;

    return {
      id: this.generateId('device'),
      ip: this.generateRandomIP(),
      hostname: this.generateRandomHostname(),
      mac: this.generateRandomMAC(),
      vendor: this.getRandomArrayItem(DEMO_VENDORS) || 'Unknown',
      os: this.getRandomArrayItem(DEMO_OS) || 'Unknown',
      status: Math.random() > 0.1 ? 'online' : 'offline',
      ports: this.generateRandomPorts(),
      vulnerabilities: this.generateRandomVulnerabilities(),
      lastSeen: new Date(Date.now() - Math.random() * 86400000).toISOString(),
      riskScore: Math.floor(Math.random() * 100),
      deviceType,
      location
    };
  }

  generateDemoScanResult(target: string): DemoScanResult {
    const deviceCount = Math.floor(Math.random() * 20) + 5;
    const devices = Array.from({ length: deviceCount }, () => this.generateDemoDevice());
    const allVulnerabilities = devices.flatMap(device => device.vulnerabilities);
    const avgRiskScore = devices.reduce((sum, device) => sum + device.riskScore, 0) / devices.length;

    return {
      id: this.generateId('scan'),
      target,
      status: Math.random() > 0.1 ? 'completed' : 'running',
      progress: Math.floor(Math.random() * 101),
      phase: 'Port scanning',
      startTime: new Date(Date.now() - Math.random() * 3600000).toISOString(),
      endTime: Math.random() > 0.3 ? new Date().toISOString() : undefined,
      devices,
      totalDevices: deviceCount,
      vulnerabilities: allVulnerabilities,
      riskScore: Math.floor(avgRiskScore)
    };
  }

  generateDemoReport(): DemoReport {
    const reportTypes = ['scan', 'vulnerability', 'compliance', 'executive'] as const;
    const formats = ['pdf', 'html', 'json', 'xlsx'] as const;

    const selectedType = this.getRandomArrayItem([...reportTypes]);
    const selectedFormat = this.getRandomArrayItem([...formats]);

    if (!selectedType || !selectedFormat) {
      throw new Error('Failed to generate report type or format');
    }

    return {
      id: this.generateId('report'),
      name: `Security Report ${new Date().toLocaleDateString()}`,
      type: selectedType,
      description: 'Automated security assessment report',
      createdAt: new Date().toISOString(),
      author: 'IP Roast Scanner',
      format: selectedFormat,
      size: `${Math.floor(Math.random() * 5000) + 500} KB`,
      downloadUrl: `/api/reports/download/${this.generateId('file')}`
    };
  }

  generateDemoNotification(): DemoNotification {
    const randomMessage = this.getRandomArrayItem(DEMO_MESSAGES);
    if (!randomMessage) {
      throw new Error('No demo messages available');
    }

    return {
      id: this.generateId('notif'),
      type: randomMessage.type,
      title: randomMessage.title,
      message: randomMessage.message,
      timestamp: new Date().toISOString(),
      read: Math.random() > 0.7
    };
  }

  private generateRandomIP(): string {
    return `192.168.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
  }

  private generateRandomHostname(): string {
    const prefixes = ['web', 'db', 'mail', 'file', 'print', 'dev', 'test', 'prod'];
    const prefix = this.getRandomArrayItem(prefixes) || 'host';
    return `${prefix}-${Math.floor(Math.random() * 100).toString().padStart(3, '0')}`;
  }

  private generateRandomMAC(): string {
    return Array.from({ length: 6 }, () =>
      Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
    ).join(':');
  }

  private generateRandomPorts(): DemoPort[] {
    const portCount = Math.floor(Math.random() * 10) + 1;
    const ports: DemoPort[] = [];

    for (let i = 0; i < portCount; i++) {
      const service = this.getRandomArrayItem(DEMO_SERVICES);
      if (!service) continue;

      const servicePort = this.getRandomArrayItem(service.ports);
      if (servicePort === undefined) continue;

      ports.push({
        number: servicePort,
        protocol: Math.random() > 0.8 ? 'udp' : 'tcp',
        state: Math.random() > 0.1 ? 'open' : 'closed',
        service: service.name,
        version: Math.random() > 0.5 ? this.generateRandomVersion() : undefined,
        banner: Math.random() > 0.7 ? this.generateRandomBanner(service.name) : undefined
      });
    }

    return ports;
  }

  private generateRandomVulnerabilities(): DemoVulnerability[] {
    const vulnCount = Math.floor(Math.random() * 5);
    const vulns: DemoVulnerability[] = [];

    for (let i = 0; i < vulnCount; i++) {
      const baseVuln = this.getRandomArrayItem(DEMO_VULNERABILITIES);
      if (!baseVuln) continue;

      const service = this.getRandomArrayItem(DEMO_SERVICES);
      const servicePort = service ? this.getRandomArrayItem(service.ports) : undefined;

      vulns.push({
        id: this.generateId('vuln'),
        cve: baseVuln.cve,
        title: baseVuln.title,
        description: baseVuln.description,
        severity: baseVuln.severity,
        cvss: baseVuln.cvss,
        port: servicePort,
        service: service?.name,
        solution: this.generateRandomSolution()
      });
    }

    return vulns;
  }

  generateRandomVulnerability(): DemoVulnerability {
    const baseVuln = this.getRandomArrayItem(DEMO_VULNERABILITIES);
    if (!baseVuln) {
      throw new Error('No base vulnerabilities available');
    }

    return {
      id: this.generateId('vuln'),
      cve: baseVuln.cve,
      title: baseVuln.title,
      description: baseVuln.description,
      severity: baseVuln.severity,
      cvss: baseVuln.cvss,
      port: Math.floor(Math.random() * 65535) + 1,
      service: 'Unknown',
      solution: this.generateRandomSolution()
    };
  }

  private generateRandomVersion(): string {
    return `${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}`;
  }

  private generateRandomBanner(serviceName: string): string {
    const serviceBanners: Record<string, string[]> = {
      'HTTP': ['Apache/2.4.41', 'nginx/1.18.0', 'Microsoft-IIS/10.0'],
      'HTTPS': ['Apache/2.4.41', 'nginx/1.18.0', 'Microsoft-IIS/10.0'],
      'SSH': ['OpenSSH_8.2p1', 'OpenSSH_7.4', 'Dropbear_2019.78'],
      'FTP': ['vsftpd 3.0.3', 'FileZilla Server', 'ProFTPD 1.3.6'],
      'SMTP': ['Postfix smtpd', 'Microsoft ESMTP', 'Exim 4.93']
    };

    const banners = serviceBanners[serviceName] || ['Unknown Service'];
    return this.getRandomArrayItem(banners) || 'Unknown';
  }

  private generateRandomSolution(): string {
    const solutions = [
      'Update to the latest version',
      'Apply security patches',
      'Configure firewall rules',
      'Disable unnecessary services',
      'Implement access controls',
      'Enable encryption',
      'Review user permissions',
      'Monitor system logs'
    ];

    return this.getRandomArrayItem(solutions) || 'Contact vendor for updates';
  }

  private getRandomArrayItem<T>(array: T[]): T | undefined {
    if (array.length === 0) return undefined;
    return array[Math.floor(Math.random() * array.length)];
  }
}

// ===== ДЕМО ХУКИ =====

export interface DemoScanState {
  isScanning: boolean;
  progress: number;
  phase: string;
  result: DemoScanResult | null;
  error: string | null;
}

export const useDemoScan = () => {
  const [state, setState] = useState<DemoScanState>({
    isScanning: false,
    progress: 0,
    phase: '',
    result: null,
    error: null
  });

  const demoApi = DemoApiManager.getInstance();

  const startScan = async (target: string): Promise<MockApiResponse<{ scanId: string }>> => {
    setState(prev => ({
      ...prev,
      isScanning: true,
      progress: 0,
      phase: 'Initializing...',
      error: null
    }));

    // Симуляция процесса сканирования
    const scanId = demoApi.generateId('scan');
    const phases = [
      'Host discovery...',
      'Port scanning...',
      'Service detection...',
      'Vulnerability scanning...',
      'Generating report...'
    ];

    for (let i = 0; i < phases.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setState(prev => ({
        ...prev,
        progress: ((i + 1) / phases.length) * 100,
        phase: phases[i] || 'Processing...'
      }));
    }

    // Генерируем результат
    const result = demoApi.generateDemoScanResult(target);
    setState(prev => ({
      ...prev,
      isScanning: false,
      result,
      progress: 100,
      phase: 'Completed'
    }));

    return demoApi.mockRequest({ scanId });
  };

  const stopScan = () => {
    setState(prev => ({
      ...prev,
      isScanning: false,
      progress: 0,
      phase: '',
      error: 'Scan cancelled by user'
    }));
  };

  const resetScan = () => {
    setState({
      isScanning: false,
      progress: 0,
      phase: '',
      result: null,
      error: null
    });
  };

  return {
    ...state,
    startScan,
    stopScan,
    resetScan
  };
};

export const useDemoData = () => {
  const demoApi = DemoApiManager.getInstance();

  const generateDevices = (count: number): DemoDevice[] => {
    return Array.from({ length: count }, () => demoApi.generateDemoDevice());
  };

  const generateVulnerabilities = (count: number): DemoVulnerability[] => {
    return Array.from({ length: count }, () => demoApi.generateRandomVulnerability());
  };

  const generateReports = (count: number): DemoReport[] => {
    return Array.from({ length: count }, () => demoApi.generateDemoReport());
  };

  const generateNotifications = (count: number): DemoNotification[] => {
    return Array.from({ length: count }, () => demoApi.generateDemoNotification());
  };

  return {
    generateDevices,
    generateVulnerabilities,
    generateReports,
    generateNotifications,
    generateScanResult: (target: string) => demoApi.generateDemoScanResult(target)
  };
};

// ===== ЭКСПОРТ =====

export const demoApiManager = DemoApiManager.getInstance();

export default {
  DemoApiManager,
  demoApiManager,
  useDemoScan,
  useDemoData
};
