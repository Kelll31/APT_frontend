// src/utils/mockData.ts
export const mockScanResults = {
  target: '192.168.1.1',
  ports: [
    { port: 22, service: 'SSH', status: 'open', version: 'OpenSSH 8.2' },
    { port: 80, service: 'HTTP', status: 'open', version: 'Apache 2.4' },
    { port: 443, service: 'HTTPS', status: 'open', version: 'Apache 2.4' }
  ],
  vulnerabilities: [
    { id: 'CVE-2023-1234', severity: 'high', title: 'Buffer Overflow' },
    { id: 'CVE-2023-5678', severity: 'medium', title: 'XSS Vulnerability' }
  ]
};

export const mockNetworkDevices = [
  { id: '1', name: 'Router', type: 'router', ip: '192.168.1.1', status: 'online' },
  { id: '2', name: 'Server', type: 'server', ip: '192.168.1.10', status: 'online' },
  { id: '3', name: 'Workstation', type: 'device', ip: '192.168.1.50', status: 'offline' }
];
