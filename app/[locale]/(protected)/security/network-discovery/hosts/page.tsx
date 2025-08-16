"use client";

import React, { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

import {
    Network, Wifi, Search, Filter, Play, Pause, StopCircle,
    RefreshCw, Settings, Eye, EyeOff, MoreHorizontal, Trash2,
    Download, Upload, Database, Server, Printer, Shield,
    AlertTriangle, CheckCircle, Clock, Zap, Target, Radar,
    Activity, TrendingUp, TrendingDown, Gauge, PieChart,
    BarChart3, Globe, Router, Smartphone, Monitor, HardDrive,
    Cpu, MemoryStick, Key, Lock, Unlock, Fingerprint,
    MapPin, Building, Layers, Tag, User, Calendar, Info,
    ExternalLink, Copy, Edit, Save, X, Plus, Minus,
    ArrowUp, ArrowDown, ArrowRight, ChevronDown, ChevronUp,
    Signal, Bluetooth, Usb, Rss, Terminal
} from 'lucide-react';

// Импорт данных
import {
    discoveredHosts,
    hostDiscoveryMethods,
    topologyMappingMethods,
    networkSegments,
    calculateNetworkStatistics,
    getActiveHosts,
    getHostsBySegment,
    getHostsByDeviceType,
    getHostsByCriticality,
    getActiveHostDiscoveryMethods,
    getActiveTopologyMappingMethods,
    type NetworkHost,
    type HostDiscoveryMethod,
    type TopologyMappingMethod
} from './data';

const NetworkHostDiscoveryPage = () => {
    const router = useRouter();

    // Состояния для фильтрации и поиска
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [deviceTypeFilter, setDeviceTypeFilter] = useState('all');
    const [segmentFilter, setSegmentFilter] = useState('all');
    const [criticalityFilter, setCriticalityFilter] = useState('all');
    const [osFilter, setOsFilter] = useState('all');
    const [managedFilter, setManagedFilter] = useState('all');

    // Состояния для методов сканирования
    const [selectedMethods, setSelectedMethods] = useState<string[]>(
        getActiveHostDiscoveryMethods().map(m => m.id)
    );
    const [selectedTopologyMethods, setSelectedTopologyMethods] = useState<string[]>(
        getActiveTopologyMappingMethods().map(m => m.id)
    );

    // Состояния интерфейса
    const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
    const [selectedHosts, setSelectedHosts] = useState<string[]>([]);
    const [showInactiveHosts, setShowInactiveHosts] = useState(true);
    const [sortBy, setSortBy] = useState('hostname');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    // Состояния сканирования
    const [isScanning, setIsScanning] = useState(false);
    const [scanProgress, setScanProgress] = useState(0);
    const [scanningMethod, setScanningMethod] = useState('');
    const [scanResults, setScanResults] = useState<string[]>([]);

    // Модальные окна
    const [showMethodsDialog, setShowMethodsDialog] = useState(false);
    const [showHostDetailsDialog, setShowHostDetailsDialog] = useState(false);
    const [showScanConfigDialog, setShowScanConfigDialog] = useState(false);
    const [selectedHost, setSelectedHost] = useState<NetworkHost | null>(null);

    // Настройки сканирования
    const [scanTarget, setScanTarget] = useState('192.168.1.0/24');
    const [scanTimeout, setScanTimeout] = useState(30);
    const [maxConcurrentScans, setMaxConcurrentScans] = useState(50);
    const [enablePortScan, setEnablePortScan] = useState(true);
    const [enableServiceDetection, setEnableServiceDetection] = useState(true);
    const [enableOSDetection, setEnableOSDetection] = useState(false);

    // Вычисляемые значения
    const networkStats = useMemo(() => calculateNetworkStatistics(), []);

    const filteredHosts = useMemo(() => {
        let filtered = discoveredHosts.filter(host => {
            const matchesSearch =
                host.hostname.toLowerCase().includes(searchQuery.toLowerCase()) ||
                host.ip.toLowerCase().includes(searchQuery.toLowerCase()) ||
                host.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (host.os && host.os.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (host.vendor && host.vendor.toLowerCase().includes(searchQuery.toLowerCase()));

            const matchesStatus = statusFilter === 'all' || host.status === statusFilter;
            const matchesDeviceType = deviceTypeFilter === 'all' || host.deviceType === deviceTypeFilter;
            const matchesSegment = segmentFilter === 'all' || host.networkSegment === segmentFilter;
            const matchesCriticality = criticalityFilter === 'all' || host.criticality === criticalityFilter;
            const matchesOS = osFilter === 'all' || host.osFamily === osFilter;
            const matchesManaged = managedFilter === 'all' ||
                (managedFilter === 'managed' && host.isManaged) ||
                (managedFilter === 'unmanaged' && !host.isManaged);

            const showHost = showInactiveHosts || host.status === 'active';

            return matchesSearch && matchesStatus && matchesDeviceType && matchesSegment &&
                matchesCriticality && matchesOS && matchesManaged && showHost;
        });

        // Сортировка
        filtered.sort((a, b) => {
            let aValue: any = a[sortBy as keyof NetworkHost];
            let bValue: any = b[sortBy as keyof NetworkHost];

            if (typeof aValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }

            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        return filtered;
    }, [searchQuery, statusFilter, deviceTypeFilter, segmentFilter, criticalityFilter,
        osFilter, managedFilter, showInactiveHosts, sortBy, sortOrder]);

    // Обработчики событий
    const handleStartScan = useCallback(async () => {
        if (selectedMethods.length === 0) {
            alert('Выберите хотя бы один метод сканирования');
            return;
        }

        setIsScanning(true);
        setScanProgress(0);
        setScanResults([]);

        const totalMethods = selectedMethods.length;
        let completed = 0;

        for (const methodId of selectedMethods) {
            const method = hostDiscoveryMethods.find(m => m.id === methodId);
            if (!method) continue;

            setScanningMethod(method.name);

            // Симуляция сканирования
            for (let i = 0; i <= method.estimatedTimeSec; i += 5) {
                await new Promise(resolve => setTimeout(resolve, 100));
                const methodProgress = (i / method.estimatedTimeSec) * 100;
                const totalProgress = ((completed * 100 + methodProgress) / totalMethods);
                setScanProgress(Math.min(totalProgress, 100));

                if (!isScanning) break; // Остановка сканирования
            }

            // Добавление результатов
            setScanResults(prev => [...prev, `${method.name}: обнаружено ${Math.floor(Math.random() * 10 + 1)} хостов`]);
            completed++;
        }

        setIsScanning(false);
        setScanProgress(100);
        setScanningMethod('');
    }, [selectedMethods, isScanning]);

    const handleStopScan = useCallback(() => {
        setIsScanning(false);
        setScanProgress(0);
        setScanningMethod('');
    }, []);

    const handleMethodToggle = useCallback((methodId: string, checked: boolean) => {
        setSelectedMethods(prev =>
            checked
                ? [...prev, methodId]
                : prev.filter(id => id !== methodId)
        );
    }, []);

    const handleTopologyMethodToggle = useCallback((methodId: string, checked: boolean) => {
        setSelectedTopologyMethods(prev =>
            checked
                ? [...prev, methodId]
                : prev.filter(id => id !== methodId)
        );
    }, []);

    const handleHostSelect = useCallback((hostId: string, checked: boolean) => {
        setSelectedHosts(prev =>
            checked
                ? [...prev, hostId]
                : prev.filter(id => id !== hostId)
        );
    }, []);

    const handleCheckboxChange = useCallback((setValue: React.Dispatch<React.SetStateAction<boolean>>) => {
        return (checked: boolean | 'indeterminate') => {
            if (checked !== 'indeterminate') {
                setValue(checked);
            }
        };
    }, []);

    const getDeviceIcon = useCallback((deviceType: string) => {
        const iconMap: { [key: string]: React.ReactElement } = {
            server: <Server className="w-4 h-4" />,
            workstation: <Monitor className="w-4 h-4" />,
            router: <Router className="w-4 h-4" />,
            switch: <Network className="w-4 h-4" />,
            printer: <Printer className="w-4 h-4" />,
            mobile: <Smartphone className="w-4 h-4" />,
            iot: <Rss className="w-4 h-4" />,
            firewall: <Shield className="w-4 h-4" />,
            unknown: <HardDrive className="w-4 h-4" />
        };
        return iconMap[deviceType] || <HardDrive className="w-4 h-4" />;
    }, []);

    const getStatusIcon = useCallback((status: string) => {
        const iconMap: { [key: string]: React.ReactElement } = {
            active: <CheckCircle className="w-4 h-4 text-green-600" />,
            inactive: <Clock className="w-4 h-4 text-gray-600" />,
            unknown: <AlertTriangle className="w-4 h-4 text-yellow-600" />,
            unreachable: <X className="w-4 h-4 text-red-600" />
        };
        return iconMap[status] || <AlertTriangle className="w-4 h-4 text-gray-600" />;
    }, []);

    const getCriticalityColor = useCallback((criticality: string) => {
        const colorMap: { [key: string]: string } = {
            critical: 'bg-red-600 text-white',
            high: 'bg-orange-600 text-white',
            medium: 'bg-yellow-500 text-black',
            low: 'bg-green-600 text-white'
        };
        return colorMap[criticality] || 'bg-gray-500 text-white';
    }, []);

    const getRiskScoreColor = useCallback((score: number) => {
        if (score >= 8) return 'text-red-600';
        if (score >= 6) return 'text-orange-600';
        if (score >= 4) return 'text-yellow-600';
        return 'text-green-600';
    }, []);

    return (
        <TooltipProvider>
            <div className="space-y-6">
                {/* Заголовок */}
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                                <Radar className="w-8 h-8 text-white" />
                            </div>
                            Обнаружение сетевых хостов
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            Автоматизированное обнаружение и анализ устройств в сетевой инфраструктуре
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setShowScanConfigDialog(true)}
                        >
                            <Settings className="w-4 h-4 mr-2" />
                            Настройки сканирования
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setShowMethodsDialog(true)}
                        >
                            <Target className="w-4 h-4 mr-2" />
                            Методы обнаружения
                        </Button>
                        <Button
                            onClick={() => router.push('/security/network-discovery/topology')}
                        >
                            <Network className="w-4 h-4 mr-2" />
                            Перейти к топологии
                        </Button>
                    </div>
                </div>

                {/* Статистика */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Всего хостов</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <p className="text-2xl font-bold">{networkStats.totalHosts}</p>
                                        <Badge className="bg-blue-100 text-blue-800">
                                            <TrendingUp className="w-3 h-3 mr-1" />
                                            +5
                                        </Badge>
                                    </div>
                                </div>
                                <Database className="w-8 h-8 text-muted-foreground" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Активные</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <p className="text-2xl font-bold">{networkStats.activeHosts}</p>
                                        <Badge className="bg-green-100 text-green-800">
                                            <CheckCircle className="w-3 h-3 mr-1" />
                                            {networkStats.uptime}%
                                        </Badge>
                                    </div>
                                </div>
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Уязвимости</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <p className="text-2xl font-bold">{networkStats.totalVulnerabilities}</p>
                                        <Badge className="bg-red-100 text-red-800">
                                            <AlertTriangle className="w-3 h-3 mr-1" />
                                            {networkStats.hostsWithVulnerabilities}
                                        </Badge>
                                    </div>
                                </div>
                                <AlertTriangle className="w-8 h-8 text-red-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Средний риск</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <p className={`text-2xl font-bold ${getRiskScoreColor(networkStats.avgRiskScore)}`}>
                                            {networkStats.avgRiskScore}
                                        </p>
                                        <div className="w-16 h-2 bg-gray-200 rounded-full">
                                            <div
                                                className="h-2 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded-full"
                                                style={{ width: `${networkStats.avgRiskScore * 10}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <Gauge className="w-8 h-8 text-orange-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Управляемые</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <p className="text-2xl font-bold">{networkStats.managedHosts}</p>
                                        <Badge className="bg-purple-100 text-purple-800">
                                            <Key className="w-3 h-3 mr-1" />
                                            {Math.round((networkStats.managedHosts / networkStats.totalHosts) * 100)}%
                                        </Badge>
                                    </div>
                                </div>
                                <Settings className="w-8 h-8 text-purple-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Критичные</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <p className="text-2xl font-bold">{networkStats.criticalHosts}</p>
                                        <Badge className="bg-red-100 text-red-800">
                                            <Shield className="w-3 h-3 mr-1" />
                                            Высокий
                                        </Badge>
                                    </div>
                                </div>
                                <Shield className="w-8 h-8 text-red-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Панель управления сканированием */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Play className="w-5 h-5" />
                            Панель сканирования
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {isScanning ? (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="font-medium">Сканирование выполняется...</p>
                                        <p className="text-sm text-muted-foreground">{scanningMethod}</p>
                                    </div>
                                    <Button variant="outline" onClick={handleStopScan}>
                                        <StopCircle className="w-4 h-4 mr-2" />
                                        Остановить
                                    </Button>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Прогресс</span>
                                        <span>{Math.round(scanProgress)}%</span>
                                    </div>
                                    <Progress value={scanProgress} className="h-2" />
                                </div>
                                {scanResults.length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium">Результаты:</p>
                                        <ScrollArea className="h-24">
                                            {scanResults.map((result, index) => (
                                                <p key={index} className="text-sm text-muted-foreground">
                                                    {result}
                                                </p>
                                            ))}
                                        </ScrollArea>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <div className="flex-1">
                                    <Label htmlFor="scan-target">Целевая сеть</Label>
                                    <Input
                                        id="scan-target"
                                        value={scanTarget}
                                        onChange={(e) => setScanTarget(e.target.value)}
                                        placeholder="192.168.1.0/24"
                                        className="mt-1"
                                    />
                                </div>
                                <div className="flex items-center gap-2 pt-6">
                                    <Button onClick={handleStartScan} disabled={selectedMethods.length === 0}>
                                        <Play className="w-4 h-4 mr-2" />
                                        Начать сканирование
                                    </Button>
                                    <Button variant="outline">
                                        <RefreshCw className="w-4 h-4 mr-2" />
                                        Обновить
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Фильтры и поиск */}
                <Card>
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            <div className="flex flex-col lg:flex-row gap-4">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Поиск по имени, IP, тегам, ОС..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-2 flex-wrap">
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger className="w-[130px]">
                                            <SelectValue placeholder="Статус" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Все статусы</SelectItem>
                                            <SelectItem value="active">Активные</SelectItem>
                                            <SelectItem value="inactive">Неактивные</SelectItem>
                                            <SelectItem value="unknown">Неизвестно</SelectItem>
                                            <SelectItem value="unreachable">Недоступные</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <Select value={deviceTypeFilter} onValueChange={setDeviceTypeFilter}>
                                        <SelectTrigger className="w-[140px]">
                                            <SelectValue placeholder="Тип устройства" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Все типы</SelectItem>
                                            <SelectItem value="server">Серверы</SelectItem>
                                            <SelectItem value="workstation">Рабочие станции</SelectItem>
                                            <SelectItem value="router">Маршрутизаторы</SelectItem>
                                            <SelectItem value="switch">Коммутаторы</SelectItem>
                                            <SelectItem value="printer">Принтеры</SelectItem>
                                            <SelectItem value="iot">IoT устройства</SelectItem>
                                            <SelectItem value="firewall">Файрволы</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <Select value={criticalityFilter} onValueChange={setCriticalityFilter}>
                                        <SelectTrigger className="w-[120px]">
                                            <SelectValue placeholder="Критичность" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Все уровни</SelectItem>
                                            <SelectItem value="critical">Критичные</SelectItem>
                                            <SelectItem value="high">Высокие</SelectItem>
                                            <SelectItem value="medium">Средние</SelectItem>
                                            <SelectItem value="low">Низкие</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <span className="text-sm text-muted-foreground">
                                        Найдено: {filteredHosts.length} из {discoveredHosts.length} хостов
                                    </span>
                                    {selectedHosts.length > 0 && (
                                        <>
                                            <Separator orientation="vertical" className="h-4" />
                                            <span className="text-sm text-muted-foreground">
                                                Выбрано: {selectedHosts.length}
                                            </span>
                                            <Button variant="outline" size="sm">
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                Удалить выбранные
                                            </Button>
                                        </>
                                    )}
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="show-inactive"
                                            checked={showInactiveHosts}
                                            onCheckedChange={handleCheckboxChange(setShowInactiveHosts)}
                                        />
                                        <Label htmlFor="show-inactive" className="text-sm">
                                            Показать неактивные
                                        </Label>
                                    </div>

                                    <Separator orientation="vertical" className="h-6" />

                                    <div className="flex items-center bg-muted rounded-md p-1">
                                        <Button
                                            variant={viewMode === 'table' ? 'default' : 'ghost'}
                                            size="sm"
                                            onClick={() => setViewMode('table')}
                                        >
                                            <BarChart3 className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant={viewMode === 'cards' ? 'default' : 'ghost'}
                                            size="sm"
                                            onClick={() => setViewMode('cards')}
                                        >
                                            <PieChart className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Список хостов */}
                <Card>
                    <CardHeader>
                        <CardTitle>Обнаруженные хосты ({filteredHosts.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {filteredHosts.length > 0 ? (
                            viewMode === 'table' ? (
                                <ScrollArea className="h-[600px]">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-12">
                                                    <Checkbox
                                                        checked={selectedHosts.length === filteredHosts.length}
                                                        onCheckedChange={(checked) => {
                                                            if (checked && checked !== 'indeterminate') {
                                                                setSelectedHosts(filteredHosts.map(h => h.id));
                                                            } else {
                                                                setSelectedHosts([]);
                                                            }
                                                        }}
                                                    />
                                                </TableHead>
                                                <TableHead>Хост</TableHead>
                                                <TableHead>IP адрес</TableHead>
                                                <TableHead>Тип</TableHead>
                                                <TableHead>Статус</TableHead>
                                                <TableHead>ОС</TableHead>
                                                <TableHead>Сегмент</TableHead>
                                                <TableHead>Критичность</TableHead>
                                                <TableHead>Риск</TableHead>
                                                <TableHead>Порты</TableHead>
                                                <TableHead>Уязвимости</TableHead>
                                                <TableHead>Действия</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredHosts.map((host) => (
                                                <TableRow key={host.id} className={selectedHosts.includes(host.id) ? 'bg-muted/50' : ''}>
                                                    <TableCell>
                                                        <Checkbox
                                                            checked={selectedHosts.includes(host.id)}
                                                            onCheckedChange={(checked) => handleHostSelect(host.id, !!checked)}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            {getDeviceIcon(host.deviceType)}
                                                            <div>
                                                                <p className="font-medium">{host.hostname}</p>
                                                                <p className="text-sm text-muted-foreground">{host.description}</p>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="font-mono">{host.ip}</TableCell>
                                                    <TableCell>
                                                        <Badge className="bg-blue-100 text-blue-800">
                                                            {host.deviceType}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            {getStatusIcon(host.status)}
                                                            <span className="capitalize">{host.status}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="space-y-1">
                                                            {host.os && <p className="font-medium">{host.os}</p>}
                                                            {host.osVersion && <p className="text-sm text-muted-foreground">{host.osVersion}</p>}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className="bg-purple-100 text-purple-800">
                                                            {host.networkSegment || 'Unknown'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className={getCriticalityColor(host.criticality)}>
                                                            {host.criticality}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <span className={`font-medium ${getRiskScoreColor(host.riskScore)}`}>
                                                                {host.riskScore.toFixed(1)}
                                                            </span>
                                                            <div className="w-16 h-2 bg-gray-200 rounded-full">
                                                                <div
                                                                    className="h-2 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded-full"
                                                                    style={{ width: `${host.riskScore * 10}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-1">
                                                            <Badge className="bg-green-100 text-green-800">
                                                                {host.openPorts.filter(p => p.state === 'open').length}
                                                            </Badge>
                                                            <span className="text-sm text-muted-foreground">открыто</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {host.vulnerabilitiesCount > 0 ? (
                                                            <Badge className="bg-red-100 text-red-800">
                                                                <AlertTriangle className="w-3 h-3 mr-1" />
                                                                {host.vulnerabilitiesCount}
                                                            </Badge>
                                                        ) : (
                                                            <Badge className="bg-green-100 text-green-800">
                                                                <CheckCircle className="w-3 h-3 mr-1" />
                                                                0
                                                            </Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-1">
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => {
                                                                            setSelectedHost(host);
                                                                            setShowHostDetailsDialog(true);
                                                                        }}
                                                                    >
                                                                        <Eye className="w-4 h-4" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>Подробности</TooltipContent>
                                                            </Tooltip>

                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" size="sm">
                                                                        <MoreHorizontal className="w-4 h-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent>
                                                                    <DropdownMenuItem>
                                                                        <Terminal className="mr-2 h-4 w-4" />
                                                                        SSH подключение
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem>
                                                                        <Globe className="mr-2 h-4 w-4" />
                                                                        Веб-интерфейс
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem>
                                                                        <Target className="mr-2 h-4 w-4" />
                                                                        Сканировать порты
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem>
                                                                        <Edit className="mr-2 h-4 w-4" />
                                                                        Редактировать
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem className="text-red-600">
                                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                                        Удалить
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </ScrollArea>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {filteredHosts.map((host) => (
                                        <Card key={host.id} className={`hover:shadow-lg transition-shadow ${selectedHosts.includes(host.id) ? 'ring-2 ring-primary' : ''}`}>
                                            <CardHeader className="pb-3">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <Checkbox
                                                            checked={selectedHosts.includes(host.id)}
                                                            onCheckedChange={(checked) => handleHostSelect(host.id, !!checked)}
                                                        />
                                                        {getDeviceIcon(host.deviceType)}
                                                        <div>
                                                            <CardTitle className="text-lg">{host.hostname}</CardTitle>
                                                            <p className="text-sm text-muted-foreground font-mono">{host.ip}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        {getStatusIcon(host.status)}
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="space-y-3">
                                                <div className="flex items-center gap-2">
                                                    <Badge className="bg-blue-100 text-blue-800">
                                                        {host.deviceType}
                                                    </Badge>
                                                    <Badge className={getCriticalityColor(host.criticality)}>
                                                        {host.criticality}
                                                    </Badge>
                                                    {host.isManaged && (
                                                        <Badge className="bg-purple-100 text-purple-800">
                                                            <Key className="w-3 h-3 mr-1" />
                                                            Управляемый
                                                        </Badge>
                                                    )}
                                                </div>

                                                {host.os && (
                                                    <div className="space-y-1">
                                                        <p className="text-sm font-medium">{host.os}</p>
                                                        {host.osVersion && (
                                                            <p className="text-xs text-muted-foreground">{host.osVersion}</p>
                                                        )}
                                                    </div>
                                                )}

                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <p className="text-muted-foreground">Открытых портов</p>
                                                        <p className="font-medium">{host.openPorts.filter(p => p.state === 'open').length}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-muted-foreground">Уязвимости</p>
                                                        <p className={`font-medium ${host.vulnerabilitiesCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                            {host.vulnerabilitiesCount}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm text-muted-foreground">Оценка риска</span>
                                                        <span className={`font-medium ${getRiskScoreColor(host.riskScore)}`}>
                                                            {host.riskScore.toFixed(1)}
                                                        </span>
                                                    </div>
                                                    <div className="w-full h-2 bg-gray-200 rounded-full">
                                                        <div
                                                            className="h-2 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded-full"
                                                            style={{ width: `${host.riskScore * 10}%` }}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap gap-1">
                                                    {host.tags.slice(0, 3).map((tag) => (
                                                        <Badge key={tag} className="text-xs bg-gray-100 text-gray-800">
                                                            {tag}
                                                        </Badge>
                                                    ))}
                                                    {host.tags.length > 3 && (
                                                        <Badge className="text-xs bg-gray-100 text-gray-800">
                                                            +{host.tags.length - 3}
                                                        </Badge>
                                                    )}
                                                </div>

                                                <div className="flex justify-between pt-2 border-t">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedHost(host);
                                                            setShowHostDetailsDialog(true);
                                                        }}
                                                    >
                                                        <Eye className="w-4 h-4 mr-2" />
                                                        Детали
                                                    </Button>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="outline" size="sm">
                                                                <MoreHorizontal className="w-4 h-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent>
                                                            <DropdownMenuItem>
                                                                <Terminal className="mr-2 h-4 w-4" />
                                                                SSH подключение
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem>
                                                                <Target className="mr-2 h-4 w-4" />
                                                                Сканировать
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )
                        ) : (
                            <div className="text-center py-12">
                                <Network className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-2 text-sm font-semibold text-muted-foreground">
                                    Хосты не найдены
                                </h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Попробуйте изменить фильтры или запустить новое сканирование
                                </p>
                                <div className="mt-6">
                                    <Button onClick={handleStartScan}>
                                        <Play className="w-4 h-4 mr-2" />
                                        Начать сканирование
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Диалог методов обнаружения */}
                <Dialog open={showMethodsDialog} onOpenChange={setShowMethodsDialog}>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Методы обнаружения хостов</DialogTitle>
                            <DialogDescription>
                                Выберите методы для обнаружения устройств в сети
                            </DialogDescription>
                        </DialogHeader>

                        <Tabs defaultValue="host-discovery">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="host-discovery">Обнаружение хостов</TabsTrigger>
                                <TabsTrigger value="topology-mapping">Построение топологии</TabsTrigger>
                            </TabsList>

                            <TabsContent value="host-discovery" className="space-y-4">
                                <div className="grid gap-4">
                                    {hostDiscoveryMethods.map((method) => (
                                        <Card key={method.id} className="p-4">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start gap-3 flex-1">
                                                    <Checkbox
                                                        checked={selectedMethods.includes(method.id)}
                                                        onCheckedChange={(checked) => handleMethodToggle(method.id, !!checked)}
                                                    />
                                                    <div className="space-y-2 flex-1">
                                                        <div>
                                                            <h3 className="font-medium">{method.name}</h3>
                                                            <p className="text-sm text-muted-foreground">{method.description}</p>
                                                        </div>

                                                        <div className="flex items-center gap-4 text-xs">
                                                            <Badge className="bg-blue-100 text-blue-800">
                                                                {method.category}
                                                            </Badge>
                                                            <span>Точность: {method.accuracyRating}%</span>
                                                            <span>Время: {method.estimatedTimeSec}с</span>
                                                            <span>Скрытность: {method.stealthLevel}</span>
                                                            <Badge className={`${method.riskLevel === 'safe' ? 'bg-green-100 text-green-800' :
                                                                method.riskLevel === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                                                                    'bg-red-100 text-red-800'
                                                                }`}>
                                                                {method.riskLevel}
                                                            </Badge>
                                                        </div>

                                                        <div className="space-y-2">
                                                            <div>
                                                                <p className="text-xs font-medium">Обнаруживает:</p>
                                                                <div className="flex flex-wrap gap-1 mt-1">
                                                                    {method.detectedInfo.map((info, index) => (
                                                                        <Badge key={index} className="text-xs bg-gray-100 text-gray-800">
                                                                            {info}
                                                                        </Badge>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            {method.limitations.length > 0 && (
                                                                <div>
                                                                    <p className="text-xs font-medium text-orange-600">Ограничения:</p>
                                                                    <ul className="text-xs text-muted-foreground mt-1">
                                                                        {method.limitations.map((limitation, index) => (
                                                                            <li key={index}>• {limitation}</li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {method.sampleCommand && (
                                                            <div className="bg-muted p-2 rounded text-xs font-mono">
                                                                {method.sampleCommand}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </TabsContent>

                            <TabsContent value="topology-mapping" className="space-y-4">
                                <div className="grid gap-4">
                                    {topologyMappingMethods.map((method) => (
                                        <Card key={method.id} className="p-4">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start gap-3 flex-1">
                                                    <Checkbox
                                                        checked={selectedTopologyMethods.includes(method.id)}
                                                        onCheckedChange={(checked) => handleTopologyMethodToggle(method.id, !!checked)}
                                                    />
                                                    <div className="space-y-2 flex-1">
                                                        <div>
                                                            <h3 className="font-medium">{method.name}</h3>
                                                            <p className="text-sm text-muted-foreground">{method.description}</p>
                                                        </div>

                                                        <div className="flex items-center gap-4 text-xs">
                                                            <Badge className="bg-purple-100 text-purple-800">
                                                                {method.category}
                                                            </Badge>
                                                            <span>Точность: {method.accuracyRating}%</span>
                                                            <span>Время: {method.estimatedTimeSec}с</span>
                                                            {method.requiresCredentials && (
                                                                <Badge className="bg-orange-100 text-orange-800">
                                                                    <Key className="w-3 h-3 mr-1" />
                                                                    Требует доступ
                                                                </Badge>
                                                            )}
                                                        </div>

                                                        <div className="space-y-2">
                                                            <div>
                                                                <p className="text-xs font-medium">Определяет связи:</p>
                                                                <div className="flex flex-wrap gap-1 mt-1">
                                                                    {method.detectedRelationships.map((rel, index) => (
                                                                        <Badge key={index} className="text-xs bg-gray-100 text-gray-800">
                                                                            {rel}
                                                                        </Badge>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {method.sampleCommand && (
                                                            <div className="bg-muted p-2 rounded text-xs font-mono">
                                                                {method.sampleCommand}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </TabsContent>
                        </Tabs>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowMethodsDialog(false)}>
                                Отмена
                            </Button>
                            <Button onClick={() => setShowMethodsDialog(false)}>
                                Применить выбранные методы
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Диалог настроек сканирования */}
                <Dialog open={showScanConfigDialog} onOpenChange={setShowScanConfigDialog}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Настройки сканирования</DialogTitle>
                            <DialogDescription>
                                Конфигурация параметров обнаружения хостов
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="timeout">Таймаут (сек)</Label>
                                    <Input
                                        id="timeout"
                                        type="number"
                                        value={scanTimeout}
                                        onChange={(e) => setScanTimeout(Number(e.target.value))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="concurrent">Параллельные сканирования</Label>
                                    <Input
                                        id="concurrent"
                                        type="number"
                                        value={maxConcurrentScans}
                                        onChange={(e) => setMaxConcurrentScans(Number(e.target.value))}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="port-scan"
                                        checked={enablePortScan}
                                        onCheckedChange={handleCheckboxChange(setEnablePortScan)}
                                    />
                                    <Label htmlFor="port-scan">Включить сканирование портов</Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="service-detection"
                                        checked={enableServiceDetection}
                                        onCheckedChange={handleCheckboxChange(setEnableServiceDetection)}
                                    />
                                    <Label htmlFor="service-detection">Определение сервисов и версий</Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="os-detection"
                                        checked={enableOSDetection}
                                        onCheckedChange={handleCheckboxChange(setEnableOSDetection)}
                                    />
                                    <Label htmlFor="os-detection">Определение операционной системы</Label>
                                </div>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowScanConfigDialog(false)}>
                                Отмена
                            </Button>
                            <Button onClick={() => setShowScanConfigDialog(false)}>
                                Сохранить настройки
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Диалог детали хоста */}
                <Dialog open={showHostDetailsDialog} onOpenChange={setShowHostDetailsDialog}>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                {selectedHost && getDeviceIcon(selectedHost.deviceType)}
                                Детали хоста
                            </DialogTitle>
                            <DialogDescription>
                                Подробная информация об обнаруженном устройстве
                            </DialogDescription>
                        </DialogHeader>

                        {selectedHost && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="font-medium mb-2">Основная информация</h3>
                                            <div className="space-y-2 text-sm">
                                                <div><strong>Имя хоста:</strong> {selectedHost.hostname}</div>
                                                <div><strong>IP адрес:</strong> {selectedHost.ip}</div>
                                                <div><strong>MAC адрес:</strong> {selectedHost.macAddress || 'Неизвестно'}</div>
                                                <div><strong>Тип устройства:</strong> {selectedHost.deviceType}</div>
                                                <div><strong>Статус:</strong> {selectedHost.status}</div>
                                                <div><strong>Критичность:</strong> {selectedHost.criticality}</div>
                                                <div><strong>Оценка риска:</strong> <span className={getRiskScoreColor(selectedHost.riskScore)}>{selectedHost.riskScore.toFixed(1)}</span></div>
                                            </div>
                                        </div>

                                        {(selectedHost.vendor || selectedHost.model) && (
                                            <div>
                                                <h3 className="font-medium mb-2">Информация об устройстве</h3>
                                                <div className="space-y-2 text-sm">
                                                    {selectedHost.vendor && <div><strong>Производитель:</strong> {selectedHost.vendor}</div>}
                                                    {selectedHost.model && <div><strong>Модель:</strong> {selectedHost.model}</div>}
                                                    {selectedHost.serialNumber && <div><strong>Серийный номер:</strong> {selectedHost.serialNumber}</div>}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        {(selectedHost.os || selectedHost.osVersion) && (
                                            <div>
                                                <h3 className="font-medium mb-2">Операционная система</h3>
                                                <div className="space-y-2 text-sm">
                                                    {selectedHost.os && <div><strong>ОС:</strong> {selectedHost.os}</div>}
                                                    {selectedHost.osVersion && <div><strong>Версия:</strong> {selectedHost.osVersion}</div>}
                                                    {selectedHost.osFamily && <div><strong>Семейство:</strong> {selectedHost.osFamily}</div>}
                                                </div>
                                            </div>
                                        )}

                                        <div>
                                            <h3 className="font-medium mb-2">Сетевая информация</h3>
                                            <div className="space-y-2 text-sm">
                                                <div><strong>Сегмент:</strong> {selectedHost.networkSegment || 'Неизвестно'}</div>
                                                <div><strong>VLAN:</strong> {selectedHost.vlan || 'Не задано'}</div>
                                                <div><strong>Подсеть:</strong> {selectedHost.subnet || 'Неизвестно'}</div>
                                                <div><strong>Шлюз:</strong> {selectedHost.gatewayIp || 'Неизвестно'}</div>
                                                <div><strong>Время отклика:</strong> {selectedHost.responseTime || 0} мс</div>
                                                <div><strong>Управляемый:</strong> {selectedHost.isManaged ? 'Да' : 'Нет'}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-medium mb-2">Открытые порты ({selectedHost.openPorts.filter(p => p.state === 'open').length})</h3>
                                    <div className="max-h-32 overflow-y-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Порт</TableHead>
                                                    <TableHead>Протокол</TableHead>
                                                    <TableHead>Сервис</TableHead>
                                                    <TableHead>Версия</TableHead>
                                                    <TableHead>Состояние</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {selectedHost.openPorts
                                                    .filter(port => port.state === 'open')
                                                    .map((port, index) => (
                                                        <TableRow key={index}>
                                                            <TableCell className="font-mono">{port.number}</TableCell>
                                                            <TableCell>{port.protocol.toUpperCase()}</TableCell>
                                                            <TableCell>{port.service || 'Неизвестно'}</TableCell>
                                                            <TableCell>{port.version || '-'}</TableCell>
                                                            <TableCell>
                                                                <Badge className="bg-green-100 text-green-800">
                                                                    {port.state}
                                                                </Badge>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-medium mb-2">Сервисы</h3>
                                    <div className="grid grid-cols-1 gap-2">
                                        {selectedHost.services.map((service, index) => (
                                            <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                                                <div className="flex items-center gap-2">
                                                    <Badge className={service.isSecure ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                                        {service.isSecure ? <Lock className="w-3 h-3 mr-1" /> : <Unlock className="w-3 h-3 mr-1" />}
                                                        {service.name}
                                                    </Badge>
                                                    <span className="text-sm">:{service.port}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {service.version && (
                                                        <span className="text-xs text-muted-foreground">{service.version}</span>
                                                    )}
                                                    {service.vulnerabilities.length > 0 && (
                                                        <Badge className="bg-red-100 text-red-800">
                                                            <AlertTriangle className="w-3 h-3 mr-1" />
                                                            {service.vulnerabilities.length}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {selectedHost.location && (
                                    <div>
                                        <h3 className="font-medium mb-2">Местоположение</h3>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div><strong>Описание:</strong> {selectedHost.location.description}</div>
                                            <div><strong>Здание:</strong> {selectedHost.location.building}</div>
                                            <div><strong>Этаж:</strong> {selectedHost.location.floor}</div>
                                            <div><strong>Комната:</strong> {selectedHost.location.room}</div>
                                            <div><strong>Координаты:</strong> {selectedHost.location.latitude}, {selectedHost.location.longitude}</div>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <h3 className="font-medium mb-2">Теги</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedHost.tags.map((tag, index) => (
                                            <Badge key={index} className="bg-gray-100 text-gray-800">
                                                <Tag className="w-3 h-3 mr-1" />
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-medium mb-2">История</h3>
                                    <div className="space-y-2 text-sm">
                                        <div><strong>Первое обнаружение:</strong> {new Date(selectedHost.firstSeen).toLocaleString('ru-RU')}</div>
                                        <div><strong>Последнее обнаружение:</strong> {new Date(selectedHost.lastSeen).toLocaleString('ru-RU')}</div>
                                        <div><strong>Методы сканирования:</strong> {selectedHost.scanMethods.join(', ')}</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowHostDetailsDialog(false)}>
                                Закрыть
                            </Button>
                            <Button>
                                <Edit className="w-4 h-4 mr-2" />
                                Редактировать
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </TooltipProvider>
    );
};

export default NetworkHostDiscoveryPage;
