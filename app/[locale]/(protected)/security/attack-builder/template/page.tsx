"use client";

import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  AlertTriangle, Shield, Zap, Brain, Target, Clock, CheckCircle, Settings, Save, Play,
  Calendar, Info, Wifi, Database, Globe, Network, Lock, Eye, Cpu, FileText,
  Activity, Search, Layers, Radio, Smartphone, Factory, Coins, Code, Bug,
  Fingerprint, Key, Server, Cloud, Router, Radar, Crosshair, Microscope,
  ChevronDown, ChevronUp, HelpCircle, Loader2, Monitor, HardDrive, Plus,
  Edit, Trash2, Copy, Star, MoreHorizontal, Filter, Download, Upload,
  ExternalLink, TrendingUp, Users, Calendar as CalendarIcon
} from 'lucide-react';

// ===== ТИПЫ И ИНТЕРФЕЙСЫ =====
interface AttackStep {
  id: string;
  name: string;
  description: string;
  type: 'reconnaissance' | 'scanning' | 'enumeration' | 'exploitation' | 'post_exploitation' | 'covering_tracks';
  payload?: string;
  parameters: { [key: string]: any };
  estimatedTime: string;
  riskLevel: 'safe' | 'moderate' | 'aggressive' | 'destructive';
}

interface AttackTemplate {
  id: string;
  name: string;
  description: string;
  category: 'web_application' | 'network_service' | 'database' | 'wireless' | 'social_engineering' | 'mobile' | 'cloud' | 'iot';
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  severity: 'low' | 'medium' | 'high' | 'critical';
  tags: string[];
  steps: AttackStep[];
  targetTypes: string[];
  requirements: string[];
  estimatedDuration: string;
  successRate: number;
  isDefault: boolean;
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
  lastUsed?: string;
  usageCount: number;
  rating: number;
  downloads: number;
}

// ===== ТЕСТОВЫЕ ДАННЫЕ =====
const attackTemplatesData: AttackTemplate[] = [
  {
    id: 'template-001',
    name: 'SQL Injection Assessment',
    description: 'Комплексная проверка веб-приложения на уязвимости SQL-инъекций с использованием различных техник',
    category: 'web_application',
    difficulty: 'intermediate',
    severity: 'high',
    tags: ['sql', 'injection', 'web', 'database', 'owasp'],
    targetTypes: ['Web Application', 'API'],
    requirements: ['Доступ к веб-приложению', 'Burp Suite или аналог'],
    estimatedDuration: '2-4 часа',
    successRate: 85,
    isDefault: true,
    isPublic: true,
    createdBy: 'SecurityTeam',
    createdAt: '2025-01-15T10:00:00Z',
    lastUsed: '2025-08-15T14:30:00Z',
    usageCount: 247,
    rating: 4.7,
    downloads: 1250,
    steps: [
      {
        id: 'step-001',
        name: 'Reconnaissance',
        description: 'Сбор информации о целевом приложении',
        type: 'reconnaissance',
        parameters: { passive: true, tools: ['nmap', 'dirb'] },
        estimatedTime: '30 мин',
        riskLevel: 'safe'
      },
      {
        id: 'step-002',
        name: 'Parameter Discovery',
        description: 'Поиск параметров для тестирования',
        type: 'scanning',
        parameters: { automated: true, manual: true },
        estimatedTime: '45 мин',
        riskLevel: 'safe'
      },
      {
        id: 'step-003',
        name: 'SQL Injection Testing',
        description: 'Тестирование найденных параметров на SQL-инъекции',
        type: 'exploitation',
        payload: "' OR 1=1--",
        parameters: { payloads: ['union', 'boolean', 'time-based'] },
        estimatedTime: '2-3 часа',
        riskLevel: 'moderate'
      }
    ]
  },
  {
    id: 'template-002',
    name: 'Network Penetration Testing',
    description: 'Полноценный пентест сетевой инфраструктуры с повышением привилегий',
    category: 'network_service',
    difficulty: 'advanced',
    severity: 'critical',
    tags: ['network', 'pentest', 'privilege-escalation', 'lateral-movement'],
    targetTypes: ['Network Range', 'Server Infrastructure'],
    requirements: ['Nmap', 'Metasploit', 'Сетевой доступ'],
    estimatedDuration: '1-3 дня',
    successRate: 78,
    isDefault: true,
    isPublic: true,
    createdBy: 'PentestTeam',
    createdAt: '2025-02-10T09:00:00Z',
    lastUsed: '2025-08-14T11:20:00Z',
    usageCount: 156,
    rating: 4.9,
    downloads: 890,
    steps: [
      {
        id: 'step-004',
        name: 'Network Discovery',
        description: 'Обнаружение активных хостов в сети',
        type: 'reconnaissance',
        parameters: { ping_sweep: true, arp_scan: true },
        estimatedTime: '1 час',
        riskLevel: 'safe'
      },
      {
        id: 'step-005',
        name: 'Port Scanning',
        description: 'Сканирование портов на обнаруженных хостах',
        type: 'scanning',
        parameters: { tcp_scan: true, udp_scan: false, stealth: true },
        estimatedTime: '2-4 часа',
        riskLevel: 'safe'
      },
      {
        id: 'step-006',
        name: 'Service Exploitation',
        description: 'Эксплуатация уязвимых сервисов',
        type: 'exploitation',
        parameters: { metasploit: true, manual_exploits: true },
        estimatedTime: '4-8 часов',
        riskLevel: 'aggressive'
      }
    ]
  },
  {
    id: 'template-003',
    name: 'Wireless Security Assessment',
    description: 'Аудит безопасности беспроводных сетей WPA/WPA2/WPA3',
    category: 'wireless',
    difficulty: 'intermediate',
    severity: 'medium',
    tags: ['wifi', 'wireless', 'wpa', 'handshake', 'evil-twin'],
    targetTypes: ['Wireless Network', 'Access Points'],
    requirements: ['Wireless adapter', 'Aircrack-ng', 'Hashcat'],
    estimatedDuration: '3-6 часов',
    successRate: 65,
    isDefault: false,
    isPublic: true,
    createdBy: 'WirelessExpert',
    createdAt: '2025-03-05T14:00:00Z',
    lastUsed: '2025-08-12T16:45:00Z',
    usageCount: 89,
    rating: 4.3,
    downloads: 445,
    steps: [
      {
        id: 'step-007',
        name: 'Wireless Reconnaissance',
        description: 'Поиск и анализ беспроводных сетей',
        type: 'reconnaissance',
        parameters: { passive_monitoring: true, channel_hopping: true },
        estimatedTime: '30 мин',
        riskLevel: 'safe'
      },
      {
        id: 'step-008',
        name: 'Handshake Capture',
        description: 'Захват WPA handshake для дальнейшего анализа',
        type: 'scanning',
        parameters: { deauth_attack: true, patience_mode: true },
        estimatedTime: '1-2 часа',
        riskLevel: 'moderate'
      }
    ]
  },
  {
    id: 'template-004',
    name: 'Social Engineering Campaign',
    description: 'Комплексная кампания социальной инженерии с фишингом и pretexting',
    category: 'social_engineering',
    difficulty: 'expert',
    severity: 'high',
    tags: ['phishing', 'social-engineering', 'pretexting', 'vishing'],
    targetTypes: ['Organization', 'Employees'],
    requirements: ['Email infrastructure', 'Phone system', 'Social media research'],
    estimatedDuration: '1-2 недели',
    successRate: 92,
    isDefault: false,
    isPublic: false,
    createdBy: 'SocialEngTeam',
    createdAt: '2025-04-20T08:00:00Z',
    lastUsed: '2025-08-10T12:30:00Z',
    usageCount: 23,
    rating: 4.8,
    downloads: 67,
    steps: [
      {
        id: 'step-009',
        name: 'Target Research',
        description: 'Сбор информации о целевой организации и сотрудниках',
        type: 'reconnaissance',
        parameters: { osint: true, social_media: true, linkedin: true },
        estimatedTime: '2-3 дня',
        riskLevel: 'safe'
      },
      {
        id: 'step-010',
        name: 'Phishing Campaign',
        description: 'Создание и отправка фишинговых писем',
        type: 'exploitation',
        parameters: { email_templates: true, landing_pages: true },
        estimatedTime: '3-5 дней',
        riskLevel: 'moderate'
      }
    ]
  },
  {
    id: 'template-005',
    name: 'Cloud Infrastructure Assessment',
    description: 'Аудит безопасности облачной инфраструктуры AWS/Azure/GCP',
    category: 'cloud',
    difficulty: 'advanced',
    severity: 'high',
    tags: ['cloud', 'aws', 'azure', 'gcp', 'misconfig', 's3'],
    targetTypes: ['Cloud Environment', 'Container Infrastructure'],
    requirements: ['Cloud credentials', 'CLI tools', 'Scanner tools'],
    estimatedDuration: '2-4 дня',
    successRate: 88,
    isDefault: false,
    isPublic: true,
    createdBy: 'CloudSecTeam',
    createdAt: '2025-05-15T11:00:00Z',
    lastUsed: '2025-08-08T09:15:00Z',
    usageCount: 134,
    rating: 4.6,
    downloads: 723,
    steps: [
      {
        id: 'step-011',
        name: 'Cloud Enumeration',
        description: 'Перечисление ресурсов и сервисов',
        type: 'enumeration',
        parameters: { automated_tools: true, api_enumeration: true },
        estimatedTime: '4-6 часов',
        riskLevel: 'safe'
      },
      {
        id: 'step-012',
        name: 'Misconfiguration Detection',
        description: 'Поиск неправильных конфигураций',
        type: 'scanning',
        parameters: { security_groups: true, iam_policies: true, storage: true },
        estimatedTime: '6-8 часов',
        riskLevel: 'safe'
      }
    ]
  },
  {
    id: 'template-006',
    name: 'IoT Device Penetration Test',
    description: 'Тестирование безопасности IoT устройств и протоколов',
    category: 'iot',
    difficulty: 'expert',
    severity: 'medium',
    tags: ['iot', 'mqtt', 'coap', 'zigbee', 'firmware'],
    targetTypes: ['IoT Devices', 'Smart Home', 'Industrial IoT'],
    requirements: ['Hardware tools', 'Protocol analyzers', 'Firmware tools'],
    estimatedDuration: '3-5 дней',
    successRate: 71,
    isDefault: false,
    isPublic: true,
    createdBy: 'IoTSecTeam',
    createdAt: '2025-06-01T13:00:00Z',
    lastUsed: '2025-08-05T15:20:00Z',
    usageCount: 45,
    rating: 4.4,
    downloads: 289,
    steps: [
      {
        id: 'step-013',
        name: 'Device Discovery',
        description: 'Обнаружение IoT устройств в сети',
        type: 'reconnaissance',
        parameters: { network_scan: true, protocol_analysis: true },
        estimatedTime: '2-3 часа',
        riskLevel: 'safe'
      },
      {
        id: 'step-014',
        name: 'Firmware Analysis',
        description: 'Анализ прошивки устройств',
        type: 'enumeration',
        parameters: { static_analysis: true, dynamic_analysis: true },
        estimatedTime: '1-2 дня',
        riskLevel: 'safe'
      }
    ]
  }
];

const AttackTemplatesPage = () => {
  const t = useTranslations('AttackBuilder');
  const tCommon = useTranslations('Common');
  const router = useRouter();

  // ===== СОСТОЯНИЯ =====
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'rating' | 'downloads' | 'recent'>('rating');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(false);

  // Модальные окна
  const [selectedTemplate, setSelectedTemplate] = useState<AttackTemplate | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Форма создания/редактирования
  const [formData, setFormData] = useState<Partial<AttackTemplate>>({
    name: '',
    description: '',
    category: 'web_application',
    difficulty: 'beginner',
    severity: 'medium',
    tags: [],
    steps: [],
    targetTypes: [],
    requirements: []
  });

  // ===== ФИЛЬТРАЦИЯ И СОРТИРОВКА =====
  const filteredAndSortedTemplates = useMemo(() => {
    let filtered = attackTemplatesData.filter(template => {
      const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === 'all' || template.difficulty === selectedDifficulty;
      const matchesSeverity = selectedSeverity === 'all' || template.severity === selectedSeverity;

      return matchesSearch && matchesCategory && matchesDifficulty && matchesSeverity;
    });

    // Сортировка
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'rating':
          return b.rating - a.rating;
        case 'downloads':
          return b.downloads - a.downloads;
        case 'recent':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchQuery, selectedCategory, selectedDifficulty, selectedSeverity, sortBy]);

  // ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-orange-100 text-orange-800';
      case 'expert': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    const iconMap: { [key: string]: React.ComponentType<any> } = {
      web_application: Globe,
      network_service: Network,
      database: Database,
      wireless: Wifi,
      social_engineering: Users,
      mobile: Smartphone,
      cloud: Cloud,
      iot: Radio
    };
    return iconMap[category] || Shield;
  };

  const formatUsageCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  const handleUseTemplate = (template: AttackTemplate) => {
    router.push(`/security/attack-builder/new?template=${template.id}`);
  };

  const handleCreateTemplate = () => {
    setFormData({
      name: '',
      description: '',
      category: 'web_application',
      difficulty: 'beginner',
      severity: 'medium',
      tags: [],
      steps: [],
      targetTypes: [],
      requirements: []
    });
    setIsCreateDialogOpen(true);
  };

  const handleEditTemplate = (template: AttackTemplate) => {
    setFormData(template);
    setIsEditDialogOpen(true);
  };

  const handleSaveTemplate = async () => {
    setLoading(true);
    try {
      // Симуляция сохранения
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsCreateDialogOpen(false);
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Error saving template:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
              }`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 space-y-6">

        {/* ===== ЗАГОЛОВОК ===== */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t('attack_templates')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Готовые шаблоны для автоматизации тестирования безопасности
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            >
              {viewMode === 'grid' ? <Layers className="h-4 w-4 mr-2" /> : <Target className="h-4 w-4 mr-2" />}
              {viewMode === 'grid' ? 'Список' : 'Сетка'}
            </Button>

            <Button onClick={handleCreateTemplate} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Создать шаблон
            </Button>
          </div>
        </div>

        {/* ===== ФИЛЬТРЫ И ПОИСК ===== */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Поиск */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Поиск шаблонов по названию, описанию или тегам..."
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Фильтры */}
              <div className="flex gap-3">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Категория" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все категории</SelectItem>
                    <SelectItem value="web_application">Веб-приложения</SelectItem>
                    <SelectItem value="network_service">Сетевые сервисы</SelectItem>
                    <SelectItem value="database">База данных</SelectItem>
                    <SelectItem value="wireless">Беспроводные</SelectItem>
                    <SelectItem value="social_engineering">Соц. инженерия</SelectItem>
                    <SelectItem value="mobile">Мобильные</SelectItem>
                    <SelectItem value="cloud">Облачные</SelectItem>
                    <SelectItem value="iot">IoT</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Сложность" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все уровни</SelectItem>
                    <SelectItem value="beginner">Начальный</SelectItem>
                    <SelectItem value="intermediate">Средний</SelectItem>
                    <SelectItem value="advanced">Продвинутый</SelectItem>
                    <SelectItem value="expert">Экспертный</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Сортировка" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rating">По рейтингу</SelectItem>
                    <SelectItem value="downloads">По загрузкам</SelectItem>
                    <SelectItem value="recent">По дате</SelectItem>
                    <SelectItem value="name">По названию</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ===== СТАТИСТИКА ===== */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Всего шаблонов</p>
                  <p className="text-2xl font-bold">{attackTemplatesData.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Star className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Средний рейтинг</p>
                  <p className="text-2xl font-bold">4.6</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Download className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Загрузок</p>
                  <p className="text-2xl font-bold">3.7k</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Найдено</p>
                  <p className="text-2xl font-bold">{filteredAndSortedTemplates.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ===== СПИСОК ШАБЛОНОВ ===== */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedTemplates.map((template) => {
              const CategoryIcon = getCategoryIcon(template.category);

              return (
                <Card key={template.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <CategoryIcon className="h-5 w-5 text-blue-600" />
                        <Badge className={getDifficultyColor(template.difficulty)}>
                          {template.difficulty}
                        </Badge>
                        <Badge className={getSeverityColor(template.severity)}>
                          {template.severity}
                        </Badge>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="p-1">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleUseTemplate(template)}>
                            <Play className="h-4 w-4 mr-2" />
                            Использовать
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setSelectedTemplate(template)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Подробнее
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditTemplate(template)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Редактировать
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="h-4 w-4 mr-2" />
                            Дублировать
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Удалить
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <CardTitle className="text-lg">{template.name}</CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {template.description}
                    </p>

                    <div className="flex flex-wrap gap-1">
                      {template.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} className="text-xs bg-gray-100 text-gray-700">
                          {tag}
                        </Badge>
                      ))}
                      {template.tags.length > 3 && (
                        <Badge className="text-xs bg-gray-100 text-gray-700">
                          +{template.tags.length - 3}
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Шаги:</span>
                        <span>{template.steps.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Длительность:</span>
                        <span>{template.estimatedDuration}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Успешность:</span>
                        <span>{template.successRate}%</span>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      {renderStars(template.rating)}
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span>{formatUsageCount(template.downloads)} ⬇</span>
                        <span>{formatUsageCount(template.usageCount)} 🔄</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleUseTemplate(template)}
                        className="flex-1"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Использовать
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setSelectedTemplate(template)}
                      >
                        <Info className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="space-y-0">
                {filteredAndSortedTemplates.map((template, index) => {
                  const CategoryIcon = getCategoryIcon(template.category);

                  return (
                    <div
                      key={template.id}
                      className={`p-4 flex items-center justify-between hover:bg-gray-50 ${index !== filteredAndSortedTemplates.length - 1 ? 'border-b' : ''
                        }`}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <CategoryIcon className="h-6 w-6 text-blue-600" />

                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">{template.name}</h3>
                            <Badge className={getDifficultyColor(template.difficulty)}>
                              {template.difficulty}
                            </Badge>
                            <Badge className={getSeverityColor(template.severity)}>
                              {template.severity}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-1">
                            {template.description}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <span>{template.steps.length} шагов</span>
                            <span>{template.estimatedDuration}</span>
                            <span>{template.successRate}% успех</span>
                            {renderStars(template.rating)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleUseTemplate(template)}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Использовать
                        </Button>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSelectedTemplate(template)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Подробнее
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditTemplate(template)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Редактировать
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="h-4 w-4 mr-2" />
                              Дублировать
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ===== ПУСТОЕ СОСТОЯНИЕ ===== */}
        {filteredAndSortedTemplates.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Search className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">Шаблоны не найдены</h3>
              <p className="text-gray-600 mb-4">
                Попробуйте изменить критерии поиска или создайте новый шаблон
              </p>
              <Button onClick={handleCreateTemplate}>
                <Plus className="h-4 w-4 mr-2" />
                Создать шаблон
              </Button>
            </CardContent>
          </Card>
        )}

        {/* ===== ДИАЛОГ ПОДРОБНОСТЕЙ ШАБЛОНА ===== */}
        <Dialog open={!!selectedTemplate} onOpenChange={() => setSelectedTemplate(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            {selectedTemplate && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    {React.createElement(getCategoryIcon(selectedTemplate.category), {
                      className: "h-5 w-5 text-blue-600"
                    })}
                    {selectedTemplate.name}
                  </DialogTitle>
                  <DialogDescription>
                    {selectedTemplate.description}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Категория</Label>
                      <p className="text-sm capitalize">{selectedTemplate.category.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Сложность</Label>
                      <Badge className={getDifficultyColor(selectedTemplate.difficulty)}>
                        {selectedTemplate.difficulty}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Серьезность</Label>
                      <Badge className={getSeverityColor(selectedTemplate.severity)}>
                        {selectedTemplate.severity}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Длительность</Label>
                      <p className="text-sm">{selectedTemplate.estimatedDuration}</p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Теги</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedTemplate.tags.map((tag) => (
                        <Badge key={tag} className="text-xs bg-gray-100 text-gray-700">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Требования</Label>
                    <ul className="text-sm list-disc list-inside mt-1 space-y-1">
                      {selectedTemplate.requirements.map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Шаги выполнения ({selectedTemplate.steps.length})</Label>
                    <div className="space-y-3 mt-2">
                      {selectedTemplate.steps.map((step, index) => (
                        <div key={step.id} className="border rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className="bg-blue-100 text-blue-800">
                              Шаг {index + 1}
                            </Badge>
                            <Badge className={`${step.riskLevel === 'safe' ? 'bg-green-100 text-green-800' :
                                step.riskLevel === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                                  step.riskLevel === 'aggressive' ? 'bg-orange-100 text-orange-800' :
                                    'bg-red-100 text-red-800'
                              }`}>
                              {step.riskLevel}
                            </Badge>
                            <span className="text-sm text-gray-500">{step.estimatedTime}</span>
                          </div>
                          <h4 className="font-medium">{step.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                          {step.payload && (
                            <div className="mt-2">
                              <Label className="text-xs font-medium">Payload:</Label>
                              <code className="block text-xs bg-gray-100 p-2 rounded mt-1">
                                {step.payload}
                              </code>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-sm text-gray-500">Рейтинг</p>
                      {renderStars(selectedTemplate.rating)}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Загрузки</p>
                      <p className="font-medium">{selectedTemplate.downloads.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Использований</p>
                      <p className="font-medium">{selectedTemplate.usageCount.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setSelectedTemplate(null)}>
                    Закрыть
                  </Button>
                  <Button onClick={() => handleUseTemplate(selectedTemplate)}>
                    <Play className="h-4 w-4 mr-2" />
                    Использовать шаблон
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default AttackTemplatesPage;
