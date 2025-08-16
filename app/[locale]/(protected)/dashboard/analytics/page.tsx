"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useTranslations } from 'next-intl';
import {
  Shield, AlertTriangle, CheckCircle, TrendingUp, TrendingDown, Activity,
  Brain, Globe, Server, Database, Wifi, Clock, Users, MapPin,
  Zap, Eye, Info, RefreshCw, Calendar, FileText, Target,
  ExternalLink, ChevronRight, Settings, Bell, BarChart3,
  PieChart, LineChart, AlertCircle, XCircle, Play, Pause,
  Network, Monitor, HardDrive, Bug, Lock, Search, Filter,
  Download, Upload, Share2, MoreHorizontal, Maximize2,
  Minimize2, X, Plus, Edit, Trash2, Copy, Star,
  ChevronDown, ChevronUp, ArrowUpRight, ArrowDownRight,
  Code, Layers, Radio, Smartphone, Factory, Coins,
  Fingerprint, Key, Cloud, Router, Radar, Crosshair, Microscope
} from 'lucide-react';

// ===== ТИПЫ И ИНТЕРФЕЙСЫ =====
interface ScanHistoryItem {
  id: string;
  name: string;
  target: string;
  targetType: string;
  startTime: string;
  endTime: string;
  duration: string;
  status: 'completed' | 'failed' | 'cancelled' | 'error' | 'running' | 'queued' | 'paused';
  scanType: string;
  vulnerabilities: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    informational: number;
  };
  totalVulnerabilities: number;
  reportSize: string;
  reportUrl: string;
  user: string;
}

interface SecurityMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
  status: 'critical' | 'warning' | 'good' | 'neutral';
  category: string;
  icon: string;
  target?: number;
  lastUpdated: string;
  description?: string;
  details?: {
    change: string;
    period: string;
    forecast: string;
  };
}

interface ActiveScanSession {
  id: string;
  name: string;
  target: string;
  progress: number;
  status: 'running' | 'paused' | 'completed';
  startTime: string;
  estimatedTimeLeft: string;
  activeModules: string[];
  foundVulnerabilities: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  scanType: string;
  user: string;
}

interface VulnerabilityAlert {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  host: string;
  timestamp: string;
  status: 'new' | 'investigating' | 'resolved' | 'false_positive';
  cve?: string;
  cvss?: number;
  category: string;
  affectedServices: string[];
}

interface ThreatIntelligenceItem {
  id: string;
  indicator: string;
  type: 'ip' | 'domain' | 'hash' | 'url';
  threatType: string;
  confidence: number;
  lastSeen: string;
  source: string;
  description: string;
}

interface ComplianceStatus {
  framework: string;
  score: number;
  status: 'compliant' | 'partial' | 'non-compliant';
  lastAssessment: string;
  findings: number;
  requirements: {
    total: number;
    passed: number;
    failed: number;
    warning: number;
  };
}

// ===== ОСНОВНОЙ КОМПОНЕНТ =====
const AnalyticsDashboardPage = () => {
  const t = useTranslations('AnalyticsDashboard');
  const tCommon = useTranslations('Common');
  const tVuln = useTranslations('VulnerabilityScanner');

  // ===== СОСТОЯНИЯ =====
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Модальные окна
  const [selectedMetric, setSelectedMetric] = useState<SecurityMetric | null>(null);
  const [selectedVulnerability, setSelectedVulnerability] = useState<VulnerabilityAlert | null>(null);
  const [selectedScan, setSelectedScan] = useState<ActiveScanSession | null>(null);

  // Боковая панель
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarContent, setSidebarContent] = useState<'alerts' | 'scans' | 'reports' | 'threats' | null>(null);

  // ===== ТЕСТОВЫЕ ДАННЫЕ =====
  const scanHistoryData: ScanHistoryItem[] = [
    {
      id: '1',
      name: 'Комплексное сканирование корпоративной сети',
      target: '192.168.1.0/24',
      targetType: 'subnet',
      startTime: '2025-08-15T14:30:00Z',
      endTime: '2025-08-15T16:45:00Z',
      duration: '2ч 15мин',
      status: 'completed',
      scanType: 'full_scan',
      vulnerabilities: { critical: 3, high: 8, medium: 15, low: 12, informational: 25 },
      totalVulnerabilities: 63,
      reportSize: '2.4 MB',
      reportUrl: '/reports/scan-001.pdf',
      user: 'admin@company.com'
    },
    {
      id: '2',
      name: 'ИИ-анализ веб-приложения',
      target: 'https://app.company.com',
      targetType: 'url',
      startTime: '2025-08-16T10:00:00Z',
      endTime: '2025-08-16T11:30:00Z',
      duration: '1ч 30мин',
      status: 'running',
      scanType: 'ai_scan',
      vulnerabilities: { critical: 0, high: 2, medium: 4, low: 3, informational: 8 },
      totalVulnerabilities: 17,
      reportSize: '1.2 MB',
      reportUrl: '/reports/scan-002.pdf',
      user: 'security@company.com'
    },
    {
      id: '3',
      name: 'Аудит промышленной системы',
      target: '10.0.50.0/24',
      targetType: 'subnet',
      startTime: '2025-08-16T08:00:00Z',
      endTime: '2025-08-16T10:45:00Z',
      duration: '2ч 45мин',
      status: 'completed',
      scanType: 'industrial_scan',
      vulnerabilities: { critical: 7, high: 12, medium: 8, low: 4, informational: 15 },
      totalVulnerabilities: 46,
      reportSize: '3.8 MB',
      reportUrl: '/reports/scan-003.pdf',
      user: 'industrial@company.com'
    }
  ];

  const vulnerabilityAlerts: VulnerabilityAlert[] = [
    {
      id: 'alert-001',
      title: 'Critical SQL Injection Vulnerability',
      severity: 'critical',
      description: 'SQL injection vulnerability found in login form of web application',
      host: '192.168.1.10',
      timestamp: '2025-08-16T12:30:00Z',
      status: 'new',
      cve: 'CVE-2024-1234',
      cvss: 9.8,
      category: 'Injection Flaws',
      affectedServices: ['HTTP', 'MySQL']
    },
    {
      id: 'alert-002',
      title: 'Outdated OpenSSL Version Detected',
      severity: 'high',
      description: 'Server running vulnerable OpenSSL version 1.1.1f',
      host: '192.168.1.5',
      timestamp: '2025-08-16T11:45:00Z',
      status: 'investigating',
      cve: 'CVE-2023-5678',
      cvss: 7.5,
      category: 'Components with Known Vulnerabilities',
      affectedServices: ['HTTPS', 'SSL/TLS']
    },
    {
      id: 'alert-003',
      title: 'Weak Password Policy',
      severity: 'medium',
      description: 'System allows weak passwords that do not meet security standards',
      host: '192.168.1.15',
      timestamp: '2025-08-16T10:15:00Z',
      status: 'new',
      cvss: 5.3,
      category: 'Broken Authentication',
      affectedServices: ['Active Directory']
    },
    {
      id: 'alert-004',
      title: 'Unencrypted Database Connection',
      severity: 'high',
      description: 'Database connection not using SSL/TLS encryption',
      host: '192.168.1.25',
      timestamp: '2025-08-16T09:20:00Z',
      status: 'new',
      cvss: 7.2,
      category: 'Sensitive Data Exposure',
      affectedServices: ['PostgreSQL']
    }
  ];

  const activeScanSessions: ActiveScanSession[] = [
    {
      id: 'scan_001',
      name: 'Комплексный аудит корпоративной сети',
      target: '192.168.1.0/24',
      progress: 67,
      status: 'running',
      startTime: new Date(Date.now() - 3600000).toISOString(),
      estimatedTimeLeft: '45 мин',
      activeModules: ['port_discovery', 'vulnerability_discovery', 'neural_threat_detection'],
      foundVulnerabilities: { critical: 2, high: 8, medium: 15, low: 12 },
      scanType: 'full_scan',
      user: 'admin@company.com'
    },
    {
      id: 'scan_002',
      name: 'ИИ-анализ веб-приложения',
      target: 'https://app.company.com',
      progress: 23,
      status: 'running',
      startTime: new Date(Date.now() - 1800000).toISOString(),
      estimatedTimeLeft: '1ч 20мин',
      activeModules: ['web_application_scan', 'behavioral_analysis'],
      foundVulnerabilities: { critical: 0, high: 2, medium: 4, low: 3 },
      scanType: 'ai_scan',
      user: 'security@company.com'
    },
    {
      id: 'scan_003',
      name: 'Аудит беспроводной сети',
      target: 'Wi-Fi Infrastructure',
      progress: 85,
      status: 'running',
      startTime: new Date(Date.now() - 2700000).toISOString(),
      estimatedTimeLeft: '15 мин',
      activeModules: ['wireless_security_audit'],
      foundVulnerabilities: { critical: 1, high: 3, medium: 2, low: 5 },
      scanType: 'wireless_scan',
      user: 'wireless@company.com'
    }
  ];

  const threatIntelligence: ThreatIntelligenceItem[] = [
    {
      id: 'threat-001',
      indicator: '192.168.100.45',
      type: 'ip',
      threatType: 'Botnet C&C',
      confidence: 95,
      lastSeen: '2025-08-16T14:30:00Z',
      source: 'Internal Honeypot',
      description: 'IP address identified as botnet command and control server'
    },
    {
      id: 'threat-002',
      indicator: 'malicious-domain.example.com',
      type: 'domain',
      threatType: 'Phishing',
      confidence: 88,
      lastSeen: '2025-08-16T13:15:00Z',
      source: 'Threat Intel Feed',
      description: 'Domain used in recent phishing campaigns targeting corporate credentials'
    }
  ];

  const complianceStatus: ComplianceStatus[] = [
    {
      framework: 'OWASP Top 10',
      score: 85,
      status: 'partial',
      lastAssessment: '2025-08-15',
      findings: 12,
      requirements: { total: 10, passed: 7, failed: 2, warning: 1 }
    },
    {
      framework: 'PCI DSS',
      score: 78,
      status: 'partial',
      lastAssessment: '2025-08-14',
      findings: 8,
      requirements: { total: 12, passed: 8, failed: 3, warning: 1 }
    },
    {
      framework: 'NIST CSF',
      score: 92,
      status: 'compliant',
      lastAssessment: '2025-08-13',
      findings: 3,
      requirements: { total: 15, passed: 14, failed: 0, warning: 1 }
    }
  ];

  // ===== ВЫЧИСЛЯЕМЫЕ ЗНАЧЕНИЯ =====
  const scanStatistics = useMemo(() => ({
    totalScans: scanHistoryData.length,
    completedScans: scanHistoryData.filter((s: ScanHistoryItem) => s.status === 'completed').length,
    failedScans: scanHistoryData.filter((s: ScanHistoryItem) => s.status === 'failed').length,
    runningScans: scanHistoryData.filter((s: ScanHistoryItem) => s.status === 'running').length,
    totalVulnerabilities: scanHistoryData.reduce((sum: number, scan: ScanHistoryItem) => sum + scan.totalVulnerabilities, 0),
    criticalVulnerabilities: scanHistoryData.reduce((sum: number, scan: ScanHistoryItem) => sum + scan.vulnerabilities.critical, 0),
    highVulnerabilities: scanHistoryData.reduce((sum: number, scan: ScanHistoryItem) => sum + scan.vulnerabilities.high, 0),
    mediumVulnerabilities: scanHistoryData.reduce((sum: number, scan: ScanHistoryItem) => sum + scan.vulnerabilities.medium, 0),
    lowVulnerabilities: scanHistoryData.reduce((sum: number, scan: ScanHistoryItem) => sum + scan.vulnerabilities.low, 0)
  }), []);

  const securityMetrics: SecurityMetric[] = useMemo(() => [
    {
      id: 'active_scans',
      name: 'Активные сканирования',
      value: activeScanSessions.length,
      unit: 'шт',
      trend: 'up',
      trendPercentage: 15,
      status: 'good',
      category: 'performance',
      icon: 'Activity',
      target: 10,
      lastUpdated: new Date().toISOString(),
      description: 'Количество активных сканирований в системе',
      details: {
        change: '+2 за последний час',
        period: 'Последние 24 часа',
        forecast: 'Ожидается увеличение на 25%'
      }
    },
    {
      id: 'critical_vulns',
      name: t('critical_vulnerabilities'),
      value: scanStatistics.criticalVulnerabilities,
      unit: 'шт',
      trend: 'down',
      trendPercentage: -8,
      status: 'critical',
      category: 'vulnerabilities',
      icon: 'AlertTriangle',
      target: 0,
      lastUpdated: new Date().toISOString(),
      description: 'Критические уязвимости требующие немедленного внимания',
      details: {
        change: '-3 за последние 6 часов',
        period: 'Последние 7 дней',
        forecast: 'Прогнозируется снижение до 5'
      }
    },
    {
      id: 'high_vulns',
      name: t('high_risk_issues'),
      value: scanStatistics.highVulnerabilities,
      unit: 'шт',
      trend: 'down',
      trendPercentage: -5,
      status: 'warning',
      category: 'vulnerabilities',
      icon: 'Shield',
      target: 20,
      lastUpdated: new Date().toISOString(),
      description: 'Уязвимости высокого риска для устранения',
      details: {
        change: '-5 за последние 3 дня',
        period: 'Последние 30 дней',
        forecast: 'Стабилизация на уровне 15-20'
      }
    },
    {
      id: 'network_coverage',
      name: 'Покрытие сети',
      value: 94,
      unit: '%',
      trend: 'up',
      trendPercentage: 2,
      status: 'good',
      category: 'coverage',
      icon: 'Network',
      target: 100,
      lastUpdated: new Date().toISOString(),
      description: 'Процент покрытия сетевой инфраструктуры сканированием',
      details: {
        change: '+2% за последнюю неделю',
        period: 'Текущий месяц',
        forecast: 'Достижение 98% к концу месяца'
      }
    },
    {
      id: 'threat_intel',
      name: 'Индикаторы угроз',
      value: threatIntelligence.length,
      unit: 'шт',
      trend: 'up',
      trendPercentage: 12,
      status: 'warning',
      category: 'intelligence',
      icon: 'Eye',
      lastUpdated: new Date().toISOString(),
      description: 'Активные индикаторы компрометации',
      details: {
        change: '+' + threatIntelligence.filter(t => t.confidence > 80).length + ' высокой достоверности',
        period: 'Последние 24 часа',
        forecast: 'Мониторинг продолжается'
      }
    },
    {
      id: 'compliance_score',
      name: 'Средний балл соответствия',
      value: Math.round(complianceStatus.reduce((sum, c) => sum + c.score, 0) / complianceStatus.length),
      unit: '%',
      trend: 'up',
      trendPercentage: 3,
      status: 'good',
      category: 'compliance',
      icon: 'CheckCircle',
      target: 95,
      lastUpdated: new Date().toISOString(),
      description: 'Средняя оценка соответствия по всем стандартам',
      details: {
        change: '+3% за последний месяц',
        period: 'Все активные стандарты',
        forecast: 'Достижение 90% к концу квартала'
      }
    }
  ], [scanStatistics, t]);

  // ===== ФИЛЬТРАЦИЯ И ПОИСК =====
  const filteredAlerts = useMemo(() => {
    return vulnerabilityAlerts.filter(alert => {
      const matchesSearch = alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.host.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSeverity = selectedSeverity === 'all' || alert.severity === selectedSeverity;
      return matchesSearch && matchesSeverity;
    });
  }, [searchQuery, selectedSeverity]);

  // ===== АВТООБНОВЛЕНИЕ =====
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  // ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====
  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: React.ComponentType<any> } = {
      AlertTriangle, Shield, CheckCircle, Activity, Clock, Users,
      Target, Database, Globe, Server, Brain, Wifi, MapPin, Zap, Eye,
      Network, Monitor, HardDrive, Bug, Lock, Search, Settings, Info
    };
    return iconMap[iconName] || Shield;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'warning': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'good': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600 text-white';
      case 'high': return 'bg-orange-600 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getComplianceStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-green-600 text-white';
      case 'partial': return 'bg-yellow-500 text-black';
      case 'non-compliant': return 'bg-red-600 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const handleOpenSidebar = (content: 'alerts' | 'scans' | 'reports' | 'threats') => {
    setSidebarContent(content);
    setSidebarOpen(true);
  };

  const handleExportData = (type: 'pdf' | 'csv' | 'json') => {
    console.log(`Exporting data as ${type}`);
  };

  const handleRefreshData = async () => {
    setLoading(true);
    setLastUpdated(new Date());
    // Симуляция загрузки данных
    setTimeout(() => setLoading(false), 1000);
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <TooltipProvider>
      <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-all duration-300 ${isFullscreen ? 'p-2' : 'p-6'
        } space-y-6`}>

        {/* ===== ЗАГОЛОВОК ===== */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {t('widget_title')}
              </h1>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="p-2"
                  >
                    {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isFullscreen ? 'Выйти из полноэкранного режима' : 'Полноэкранный режим'}
                </TooltipContent>
              </Tooltip>

              <Badge className="bg-green-600 text-white animate-pulse">
                {t('widget_badge')}
              </Badge>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {t('widget_desc')}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Поиск */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск по уязвимостям..."
                className="pl-10 w-64"
              />
            </div>

            {/* Фильтр времени */}
            <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">1 час</SelectItem>
                <SelectItem value="24h">24 часа</SelectItem>
                <SelectItem value="7d">7 дней</SelectItem>
                <SelectItem value="30d">30 дней</SelectItem>
              </SelectContent>
            </Select>

            {/* Фильтр серьезности */}
            <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все</SelectItem>
                <SelectItem value="critical">Критические</SelectItem>
                <SelectItem value="high">Высокие</SelectItem>
                <SelectItem value="medium">Средние</SelectItem>
                <SelectItem value="low">Низкие</SelectItem>
              </SelectContent>
            </Select>

            {/* Меню экспорта */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Экспорт
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Экспорт данных</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleExportData('pdf')}>
                  <FileText className="h-4 w-4 mr-2" />
                  Экспорт в PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportData('csv')}>
                  <Download className="h-4 w-4 mr-2" />
                  Экспорт в CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportData('json')}>
                  <Code className="h-4 w-4 mr-2" />
                  Экспорт в JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Статус обновления */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              Обновлено: {lastUpdated.toLocaleTimeString()}
            </div>

            {/* Кнопки управления */}
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAutoRefresh(!autoRefresh)}
                    className={autoRefresh ? 'bg-green-50 border-green-200' : ''}
                  >
                    {autoRefresh ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {autoRefresh ? 'Остановить автообновление' : 'Включить автообновление'}
                </TooltipContent>
              </Tooltip>

              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshData}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Обновить
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenSidebar('alerts')}
                className="flex items-center gap-2"
              >
                <Bell className="h-4 w-4" />
                Уведомления
                {filteredAlerts.length > 0 && (
                  <Badge className="bg-red-600 text-white text-xs ml-1">
                    {filteredAlerts.length}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* ===== КРИТИЧЕСКИЕ АЛЕРТЫ ===== */}
        {scanStatistics.criticalVulnerabilities > 0 && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <div className="flex items-center justify-between">
                <div>
                  <strong>Внимание!</strong> Обнаружено {scanStatistics.criticalVulnerabilities} критических уязвимости(ей),
                  требующих немедленного реагирования.
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" className="p-0 h-auto text-red-700 underline ml-2">
                        Просмотреть детали
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                          Критические уязвимости
                        </DialogTitle>
                        <DialogDescription>
                          Список критических уязвимостей, требующих немедленного внимания
                        </DialogDescription>
                      </DialogHeader>
                      <ScrollArea className="max-h-96">
                        <div className="space-y-3">
                          {vulnerabilityAlerts
                            .filter(alert => alert.severity === 'critical')
                            .map((alert) => (
                              <div key={alert.id} className="p-4 border border-red-200 bg-red-50 rounded-lg">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Badge className={getSeverityColor(alert.severity)}>
                                        {alert.severity.toUpperCase()}
                                      </Badge>
                                      {alert.cve && (
                                        <Badge className="border border-gray-300 bg-white text-gray-700">
                                          {alert.cve}
                                        </Badge>
                                      )}
                                      {alert.cvss && (
                                        <Badge className="border border-gray-300 bg-white text-gray-700">
                                          CVSS: {alert.cvss}
                                        </Badge>
                                      )}
                                    </div>
                                    <h4 className="font-medium text-red-800 mb-1">{alert.title}</h4>
                                    <p className="text-sm text-red-600 mb-2">{alert.description}</p>
                                    <div className="text-xs text-red-500 space-y-1">
                                      <div>Host: {alert.host}</div>
                                      <div>Время: {formatTimestamp(alert.timestamp)}</div>
                                      <div>Сервисы: {alert.affectedServices.join(', ')}</div>
                                    </div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedVulnerability(alert)}
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                        </div>
                      </ScrollArea>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* ===== КЛЮЧЕВЫЕ МЕТРИКИ ===== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {securityMetrics.map((metric: SecurityMetric) => {
            const Icon = getIconComponent(metric.icon);
            const TrendIcon = metric.trend === 'up' ? TrendingUp : TrendingDown;

            return (
              <Dialog key={metric.id}>
                <DialogTrigger asChild>
                  <Card className={`${getStatusColor(metric.status)} border-2 cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <Icon className="h-8 w-8" />
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="sm" className="p-1">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              Подробнее
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Share2 className="h-4 w-4 mr-2" />
                              Поделиться
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="h-4 w-4 mr-2" />
                              Экспорт
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="mt-3">
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold">{metric.value}</span>
                          <span className="text-sm">{metric.unit}</span>
                        </div>

                        <p className="text-sm font-medium mt-1">{metric.name}</p>

                        <div className="flex items-center gap-1 mt-2 text-sm">
                          <TrendIcon className={`h-3 w-3 ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`} />
                          <span className={metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                            {metric.trendPercentage > 0 ? '+' : ''}{metric.trendPercentage}%
                          </span>
                        </div>
                      </div>

                      {metric.target && (
                        <div className="mt-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Цель: {metric.target}</span>
                            <span>{((metric.value / metric.target) * 100).toFixed(0)}%</span>
                          </div>
                          <Progress value={(metric.value / metric.target) * 100} className="h-1" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Icon className="h-5 w-5" />
                      {metric.name}
                    </DialogTitle>
                    <DialogDescription>{metric.description}</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <Label className="font-medium">Текущее значение</Label>
                        <p className="text-2xl font-bold">{metric.value} {metric.unit}</p>
                      </div>
                      <div>
                        <Label className="font-medium">Изменение</Label>
                        <p className={`text-lg font-semibold ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                          {metric.trendPercentage > 0 ? '+' : ''}{metric.trendPercentage}%
                        </p>
                      </div>
                    </div>

                    {metric.details && (
                      <div className="space-y-2 text-sm">
                        <div>
                          <Label className="font-medium">Изменение:</Label>
                          <p className="text-gray-600">{metric.details.change}</p>
                        </div>
                        <div>
                          <Label className="font-medium">Период:</Label>
                          <p className="text-gray-600">{metric.details.period}</p>
                        </div>
                        <div>
                          <Label className="font-medium">Прогноз:</Label>
                          <p className="text-gray-600">{metric.details.forecast}</p>
                        </div>
                      </div>
                    )}

                    {metric.target && (
                      <div>
                        <Label className="font-medium">Прогресс к цели</Label>
                        <div className="mt-2">
                          <Progress value={(metric.value / metric.target) * 100} className="h-2" />
                          <div className="flex justify-between text-xs mt-1">
                            <span>{metric.value}</span>
                            <span>{metric.target}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Экспорт данных
                    </Button>
                    <Button size="sm">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Подробный отчет
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            );
          })}
        </div>

        {/* ===== ОСНОВНОЙ КОНТЕНТ С ВКЛАДКАМИ ===== */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Обзор</TabsTrigger>
            <TabsTrigger value="scans">Сканирования</TabsTrigger>
            <TabsTrigger value="vulnerabilities">Уязвимости</TabsTrigger>
            <TabsTrigger value="threats">Угрозы</TabsTrigger>
            <TabsTrigger value="compliance">Соответствие</TabsTrigger>
            <TabsTrigger value="reports">Отчеты</TabsTrigger>
          </TabsList>

          {/* ===== ВКЛАДКА: ОБЗОР ===== */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Активные сканирования */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Активные сканирования ({activeScanSessions.length})
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenSidebar('scans')}
                  >
                    Все сканирования
                  </Button>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-80">
                    <div className="space-y-3">
                      {activeScanSessions.map((scan) => (
                        <div key={scan.id} className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{scan.name}</h4>
                              <p className="text-xs text-gray-500">{scan.target}</p>
                              <p className="text-xs text-gray-400">Пользователь: {scan.user}</p>
                            </div>
                            <Badge className={
                              scan.status === 'running' ? 'bg-blue-600 text-white' :
                                scan.status === 'paused' ? 'bg-yellow-500 text-black' :
                                  'bg-green-600 text-white'
                            }>
                              {scan.status}
                            </Badge>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                              <span>Прогресс: {scan.progress}%</span>
                              <span>Осталось: {scan.estimatedTimeLeft}</span>
                            </div>
                            <Progress value={scan.progress} className="h-2" />

                            <div className="flex gap-2 text-xs">
                              <span className="text-red-600">Критических: {scan.foundVulnerabilities.critical}</span>
                              <span className="text-orange-600">Высоких: {scan.foundVulnerabilities.high}</span>
                              <span className="text-yellow-600">Средних: {scan.foundVulnerabilities.medium}</span>
                            </div>
                          </div>
                        </div>
                      ))}

                      {activeScanSessions.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <Activity className="h-12 w-12 mx-auto mb-4 opacity-20" />
                          <p>Нет активных сканирований</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Последние уязвимости */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Последние уязвимости ({filteredAlerts.length})
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenSidebar('alerts')}
                  >
                    Все уведомления
                  </Button>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-80">
                    <div className="space-y-3">
                      {filteredAlerts.slice(0, 10).map((alert) => (
                        <div key={alert.id} className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-start gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge className={getSeverityColor(alert.severity)}>
                                  {alert.severity}
                                </Badge>
                                {alert.cvss && (
                                  <span className="text-xs text-gray-500">CVSS: {alert.cvss}</span>
                                )}
                              </div>
                              <h4 className="font-medium text-sm mb-1">{alert.title}</h4>
                              <p className="text-xs text-gray-600 mb-2">{alert.description}</p>
                              <div className="text-xs text-gray-500 space-y-1">
                                <div>Host: {alert.host}</div>
                                <div>Время: {formatTimestamp(alert.timestamp)}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {filteredAlerts.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <Shield className="h-12 w-12 mx-auto mb-4 opacity-20" />
                          <p>Нет активных уязвимостей</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Статистика по соответствию */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Статус соответствия стандартам
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {complianceStatus.map((compliance) => (
                    <div key={compliance.framework} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{compliance.framework}</h4>
                        <Badge className={getComplianceStatusColor(compliance.status)}>
                          {compliance.status}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Оценка: {compliance.score}%</span>
                          <span>Проблемы: {compliance.findings}</span>
                        </div>

                        <Progress value={compliance.score} className="h-2" />

                        <div className="text-xs text-gray-500 grid grid-cols-2 gap-2">
                          <div>✅ Пройдено: {compliance.requirements.passed}</div>
                          <div>❌ Провалено: {compliance.requirements.failed}</div>
                          <div>⚠️ Предупреждения: {compliance.requirements.warning}</div>
                          <div>📋 Всего: {compliance.requirements.total}</div>
                        </div>

                        <p className="text-xs text-gray-400">
                          Последняя проверка: {new Date(compliance.lastAssessment).toLocaleDateString('ru-RU')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ===== ВКЛАДКА: СКАНИРОВАНИЯ ===== */}
          <TabsContent value="scans" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {scanHistoryData.map((scan) => (
                <Card key={scan.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium">{scan.name}</h3>
                          <Badge className={
                            scan.status === 'completed' ? 'bg-green-600 text-white' :
                              scan.status === 'running' ? 'bg-blue-600 text-white' :
                                scan.status === 'failed' ? 'bg-red-600 text-white' :
                                  'bg-gray-600 text-white'
                          }>
                            {scan.status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <Label className="text-xs text-gray-500">Цель</Label>
                            <p>{scan.target}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-gray-500">Длительность</Label>
                            <p>{scan.duration}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-gray-500">Пользователь</Label>
                            <p>{scan.user}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-gray-500">Размер отчета</Label>
                            <p>{scan.reportSize}</p>
                          </div>
                        </div>

                        <div className="mt-3 flex gap-4 text-sm">
                          <span className="text-red-600">Критических: {scan.vulnerabilities.critical}</span>
                          <span className="text-orange-600">Высоких: {scan.vulnerabilities.high}</span>
                          <span className="text-yellow-600">Средних: {scan.vulnerabilities.medium}</span>
                          <span className="text-blue-600">Низких: {scan.vulnerabilities.low}</span>
                          <span className="text-gray-600">Всего: {scan.totalVulnerabilities}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Просмотр
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Отчет
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ===== ВКЛАДКА: УЯЗВИМОСТИ ===== */}
          <TabsContent value="vulnerabilities" className="space-y-4">
            <div className="space-y-4">
              {filteredAlerts.map((alert) => (
                <Card key={alert.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getSeverityColor(alert.severity)}>
                            {alert.severity.toUpperCase()}
                          </Badge>
                          {alert.cve && (
                            <Badge className="border border-gray-300 bg-white text-gray-700">
                              {alert.cve}
                            </Badge>
                          )}
                          {alert.cvss && (
                            <Badge className="border border-gray-300 bg-white text-gray-700">
                              CVSS: {alert.cvss}
                            </Badge>
                          )}
                          <Badge className={
                            alert.status === 'new' ? 'bg-red-100 text-red-800' :
                              alert.status === 'investigating' ? 'bg-yellow-100 text-yellow-800' :
                                alert.status === 'resolved' ? 'bg-green-100 text-green-800' :
                                  'bg-gray-100 text-gray-800'
                          }>
                            {alert.status}
                          </Badge>
                        </div>

                        <h3 className="font-medium mb-2">{alert.title}</h3>
                        <p className="text-gray-600 mb-3">{alert.description}</p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <Label className="text-xs text-gray-500">Хост</Label>
                            <p>{alert.host}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-gray-500">Категория</Label>
                            <p>{alert.category}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-gray-500">Сервисы</Label>
                            <p>{alert.affectedServices.join(', ')}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-gray-500">Обнаружено</Label>
                            <p>{formatTimestamp(alert.timestamp)}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Изменить статус
                        </Button>
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Детали
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ===== ВКЛАДКА: УГРОЗЫ ===== */}
          <TabsContent value="threats" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Индикаторы компрометации
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {threatIntelligence.map((threat) => (
                    <div key={threat.id} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={
                              threat.type === 'ip' ? 'bg-blue-100 text-blue-800' :
                                threat.type === 'domain' ? 'bg-green-100 text-green-800' :
                                  threat.type === 'hash' ? 'bg-purple-100 text-purple-800' :
                                    'bg-gray-100 text-gray-800'
                            }>
                              {threat.type.toUpperCase()}
                            </Badge>
                            <Badge className={
                              threat.confidence > 80 ? 'bg-red-100 text-red-800' :
                                threat.confidence > 60 ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-green-100 text-green-800'
                            }>
                              Достоверность: {threat.confidence}%
                            </Badge>
                          </div>

                          <h4 className="font-medium mb-1">{threat.indicator}</h4>
                          <p className="text-sm text-gray-600 mb-2">{threat.description}</p>

                          <div className="grid grid-cols-3 gap-4 text-xs">
                            <div>
                              <Label className="text-gray-500">Тип угрозы</Label>
                              <p>{threat.threatType}</p>
                            </div>
                            <div>
                              <Label className="text-gray-500">Источник</Label>
                              <p>{threat.source}</p>
                            </div>
                            <div>
                              <Label className="text-gray-500">Последнее обнаружение</Label>
                              <p>{formatTimestamp(threat.lastSeen)}</p>
                            </div>
                          </div>
                        </div>

                        <Button variant="outline" size="sm">
                          <Info className="h-4 w-4 mr-2" />
                          Подробнее
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ===== ВКЛАДКА: СООТВЕТСТВИЕ ===== */}
          <TabsContent value="compliance" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {complianceStatus.map((compliance) => (
                <Card key={compliance.framework}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{compliance.framework}</span>
                      <Badge className={getComplianceStatusColor(compliance.status)}>
                        {compliance.status}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm">Общая оценка</span>
                          <span className="font-bold">{compliance.score}%</span>
                        </div>
                        <Progress value={compliance.score} className="h-3" />
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="text-center p-2 bg-green-50 rounded">
                          <div className="text-lg font-bold text-green-600">{compliance.requirements.passed}</div>
                          <div className="text-xs text-green-700">Пройдено</div>
                        </div>
                        <div className="text-center p-2 bg-red-50 rounded">
                          <div className="text-lg font-bold text-red-600">{compliance.requirements.failed}</div>
                          <div className="text-xs text-red-700">Провалено</div>
                        </div>
                      </div>

                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Всего требований:</span>
                          <span>{compliance.requirements.total}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Предупреждения:</span>
                          <span className="text-yellow-600">{compliance.requirements.warning}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Проблемы:</span>
                          <span className="text-red-600">{compliance.findings}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Последняя проверка:</span>
                          <span>{new Date(compliance.lastAssessment).toLocaleDateString('ru-RU')}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <FileText className="h-4 w-4 mr-2" />
                          Отчет
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Обновить
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ===== ВКЛАДКА: ОТЧЕТЫ ===== */}
          <TabsContent value="reports" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {scanHistoryData.filter(scan => scan.status === 'completed').map((scan) => (
                <Card key={scan.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-medium text-sm">{scan.name}</h3>
                      <Badge className="bg-green-600 text-white text-xs">
                        {scan.reportSize}
                      </Badge>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Цель:</span>
                        <span>{scan.target}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Завершено:</span>
                        <span>{formatTimestamp(scan.endTime)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Длительность:</span>
                        <span>{scan.duration}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Уязвимости:</span>
                        <span>{scan.totalVulnerabilities}</span>
                      </div>
                    </div>

                    <Separator className="my-3" />

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Download className="h-4 w-4 mr-2" />
                        PDF
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Share2 className="h-4 w-4 mr-2" />
                        Поделиться
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* ===== БОКОВАЯ ПАНЕЛЬ ===== */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="right" className="w-96">
            <SheetHeader>
              <SheetTitle>
                {sidebarContent === 'alerts' && 'Уведомления о безопасности'}
                {sidebarContent === 'scans' && 'Мониторинг сканирований'}
                {sidebarContent === 'reports' && 'Отчеты'}
                {sidebarContent === 'threats' && 'Анализ угроз'}
              </SheetTitle>
              <SheetDescription>
                {sidebarContent === 'alerts' && 'Последние уведомления о найденных уязвимостях'}
                {sidebarContent === 'scans' && 'Статус активных и запланированных сканирований'}
                {sidebarContent === 'reports' && 'Доступные отчеты по безопасности'}
                {sidebarContent === 'threats' && 'Обнаруженные индикаторы компрометации'}
              </SheetDescription>
            </SheetHeader>

            <div className="mt-6">
              {sidebarContent === 'alerts' && (
                <ScrollArea className="h-[calc(100vh-200px)]">
                  <div className="space-y-3">
                    {filteredAlerts.map((alert) => (
                      <div key={alert.id} className="p-3 border rounded-lg">
                        <div className="flex items-start gap-2 mb-2">
                          <Badge className={getSeverityColor(alert.severity)}>
                            {alert.severity}
                          </Badge>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{alert.title}</p>
                            <p className="text-xs text-gray-500 mt-1">{alert.host}</p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline" className="w-full">
                          Подробнее
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}

              {sidebarContent === 'scans' && (
                <ScrollArea className="h-[calc(100vh-200px)]">
                  <div className="space-y-3">
                    {activeScanSessions.map((scan) => (
                      <div key={scan.id} className="p-3 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={scan.status === 'running' ? 'bg-blue-600 text-white' : 'bg-gray-600 text-white'}>
                            {scan.status}
                          </Badge>
                          <span className="text-sm font-medium">{scan.progress}%</span>
                        </div>
                        <p className="text-sm font-medium mb-1">{scan.name}</p>
                        <Progress value={scan.progress} className="h-1 mb-2" />
                        <p className="text-xs text-gray-500">{scan.target}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}

              {sidebarContent === 'threats' && (
                <ScrollArea className="h-[calc(100vh-200px)]">
                  <div className="space-y-3">
                    {threatIntelligence.map((threat) => (
                      <div key={threat.id} className="p-3 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-red-100 text-red-800 text-xs">
                            {threat.type}
                          </Badge>
                          <Badge className="bg-orange-100 text-orange-800 text-xs">
                            {threat.confidence}%
                          </Badge>
                        </div>
                        <p className="text-sm font-medium mb-1">{threat.indicator}</p>
                        <p className="text-xs text-gray-600 mb-2">{threat.threatType}</p>
                        <p className="text-xs text-gray-500">{threat.source}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </TooltipProvider>
  );
};

export default AnalyticsDashboardPage;
