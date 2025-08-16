"use client";

import React, { useState, useMemo, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

import {
    Network, Search, Filter, Download, Upload, Settings,
    Eye, EyeOff, MoreHorizontal, RefreshCw, ZoomIn, ZoomOut,
    Maximize, Minimize, RotateCcw, Play, Pause, Square,
    Layers, Palette, Grid, GitBranch, Circle, Move,
    Share, Save, FolderOpen, FileText, Image,
    ArrowLeft, ArrowRight, Home, Target, Radar,
    Activity, TrendingUp, BarChart3, PieChart, Info
} from 'lucide-react';

// Импорт данных и функций топологии
import {
    generateTopologyData,
    filterTopologyData,
    applyColorScheme,
    loadTopologyFromJson,
    loadTopologyFromCsv,
    exportTopologyToJson,
    exportTopologyToCsv,
    findShortestPath,
    analyzeNetworkSegments,
    topologyLayouts,
    colorSchemes,
    type TopologyData,
    type TopologyFilter,
    type TopologyLayout,
    type TopologyNode,
    type TopologyEdge
} from './data';

import { discoveredHosts, networkConnections, networkSegments } from '../hosts/data';

const NetworkTopologyPage = () => {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Основные состояния
    const [topologyData, setTopologyData] = useState<TopologyData>(() =>
        generateTopologyData(discoveredHosts, networkConnections, networkSegments)
    );

    const [selectedLayout, setSelectedLayout] = useState<TopologyLayout>(topologyLayouts[0]);
    const [selectedColorScheme, setSelectedColorScheme] = useState<keyof typeof colorSchemes>('default');

    // Состояние фильтров
    const [filter, setFilter] = useState<TopologyFilter>({
        showInactive: true,
        showUntrusted: true,
        minRiskScore: 0,
        maxRiskScore: 10,
        selectedDeviceTypes: [],
        selectedSegments: [],
        selectedCriticality: [],
        searchQuery: ''
    });

    // Состояния интерфейса
    const [selectedNode, setSelectedNode] = useState<TopologyNode | null>(null);
    const [selectedEdge, setSelectedEdge] = useState<TopologyEdge | null>(null);
    const [highlightedPath, setHighlightedPath] = useState<string[]>([]);
    const [isPlaying, setIsPlaying] = useState(true);
    const [zoomLevel, setZoomLevel] = useState(100);

    // Модальные окна
    const [showNodeDetails, setShowNodeDetails] = useState(false);
    const [showEdgeDetails, setShowEdgeDetails] = useState(false);
    const [showImportDialog, setShowImportDialog] = useState(false);
    const [showExportDialog, setShowExportDialog] = useState(false);
    const [showAnalytics, setShowAnalytics] = useState(false);

    // Отфильтрованные данные
    const filteredData = useMemo(() => {
        const filtered = filterTopologyData(topologyData, filter);
        return applyColorScheme(filtered, selectedColorScheme);
    }, [topologyData, filter, selectedColorScheme]);

    // Аналитика сегментов
    const segmentAnalytics = useMemo(() =>
        analyzeNetworkSegments(filteredData), [filteredData]
    );

    // Обработчики событий
    const handleNodeClick = useCallback((node: TopologyNode) => {
        setSelectedNode(node);
        setShowNodeDetails(true);
    }, []);

    const handleEdgeClick = useCallback((edge: TopologyEdge) => {
        setSelectedEdge(edge);
        setShowEdgeDetails(true);
    }, []);

    const handlePathHighlight = useCallback((sourceId: string, targetId: string) => {
        const path = findShortestPath(filteredData, sourceId, targetId);
        setHighlightedPath(path);
    }, [filteredData]);

    const handleFilterChange = useCallback((key: keyof TopologyFilter, value: any) => {
        setFilter(prev => ({ ...prev, [key]: value }));
    }, []);

    const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            let newData: TopologyData;

            if (file.name.endsWith('.json')) {
                newData = await loadTopologyFromJson(file);
            } else if (file.name.endsWith('.csv')) {
                newData = await loadTopologyFromCsv(file);
            } else {
                throw new Error('Unsupported file format');
            }

            setTopologyData(newData);
            setShowImportDialog(false);
        } catch (error) {
            alert(`Ошибка загрузки файла: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }, []);

    const handleExport = useCallback((format: 'json' | 'csv') => {
        const blob = format === 'json'
            ? exportTopologyToJson(filteredData)
            : exportTopologyToCsv(filteredData);

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `network-topology.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        setShowExportDialog(false);
    }, [filteredData]);

    const handleCheckboxChange = useCallback((setValue: React.Dispatch<React.SetStateAction<boolean>>) => {
        return (checked: boolean | 'indeterminate') => {
            if (checked !== 'indeterminate') {
                setValue(checked);
            }
        };
    }, []);

    return (
        <TooltipProvider>
            <div className="flex flex-col h-screen bg-background">
                {/* Header */}
                <div className="border-b bg-card">
                    <div className="flex items-center justify-between px-6 py-4">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" onClick={() => router.back()}>
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Назад
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => router.push('/security/network-discovery/hosts')}>
                                    <Home className="w-4 h-4 mr-2" />
                                    Хосты
                                </Button>
                            </div>

                            <Separator orientation="vertical" className="h-6" />

                            <div>
                                <h1 className="text-2xl font-bold flex items-center gap-2">
                                    <Network className="w-6 h-6 text-blue-600" />
                                    Топология сети
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    {filteredData.nodes.length} узлов, {filteredData.edges.length} связей
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => setShowAnalytics(true)}>
                                <BarChart3 className="w-4 h-4 mr-2" />
                                Аналитика
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setShowImportDialog(true)}>
                                <Upload className="w-4 h-4 mr-2" />
                                Импорт
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setShowExportDialog(true)}>
                                <Download className="w-4 h-4 mr-2" />
                                Экспорт
                            </Button>
                            <Button size="sm">
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Обновить
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar - Панель фильтров и настроек */}
                    <div className="w-80 border-r bg-card flex flex-col">
                        <div className="p-4 border-b">
                            <h3 className="font-medium flex items-center gap-2">
                                <Filter className="w-4 h-4" />
                                Фильтры и настройки
                            </h3>
                        </div>

                        <ScrollArea className="flex-1">
                            <div className="p-4 space-y-6">
                                {/* Поиск */}
                                <div className="space-y-2">
                                    <Label>Поиск</Label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Поиск узлов..."
                                            value={filter.searchQuery}
                                            onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>

                                {/* Фильтры отображения */}
                                <div className="space-y-3">
                                    <Label>Отображение</Label>
                                    <div className="space-y-2">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="show-inactive"
                                                checked={filter.showInactive}
                                                onCheckedChange={handleCheckboxChange((checked) =>
                                                    handleFilterChange('showInactive', checked))}
                                            />
                                            <Label htmlFor="show-inactive" className="text-sm">
                                                Показать неактивные узлы
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="show-untrusted"
                                                checked={filter.showUntrusted}
                                                onCheckedChange={handleCheckboxChange((checked) =>
                                                    handleFilterChange('showUntrusted', checked))}
                                            />
                                            <Label htmlFor="show-untrusted" className="text-sm">
                                                Показать ненадежные связи
                                            </Label>
                                        </div>
                                    </div>
                                </div>

                                {/* Диапазон риска */}
                                <div className="space-y-3">
                                    <Label>Уровень риска: {filter.minRiskScore} - {filter.maxRiskScore}</Label>
                                    <Slider
                                        value={[filter.minRiskScore, filter.maxRiskScore]}
                                        onValueChange={([min, max]) => {
                                            handleFilterChange('minRiskScore', min);
                                            handleFilterChange('maxRiskScore', max);
                                        }}
                                        min={0}
                                        max={10}
                                        step={0.1}
                                        className="w-full"
                                    />
                                </div>

                                {/* Фильтр по типу устройства */}
                                <div className="space-y-2">
                                    <Label>Типы устройств</Label>
                                    <div className="space-y-1">
                                        {['server', 'workstation', 'router', 'switch', 'printer', 'iot', 'firewall'].map(type => (
                                            <div key={type} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`device-${type}`}
                                                    checked={filter.selectedDeviceTypes.includes(type)}
                                                    onCheckedChange={(checked) => {
                                                        const newTypes = checked
                                                            ? [...filter.selectedDeviceTypes, type]
                                                            : filter.selectedDeviceTypes.filter(t => t !== type);
                                                        handleFilterChange('selectedDeviceTypes', newTypes);
                                                    }}
                                                />
                                                <Label htmlFor={`device-${type}`} className="text-sm capitalize">
                                                    {type}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Макет */}
                                <div className="space-y-2">
                                    <Label>Макет</Label>
                                    <Select value={selectedLayout.id} onValueChange={(value) => {
                                        const layout = topologyLayouts.find(l => l.id === value);
                                        if (layout) setSelectedLayout(layout);
                                    }}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {topologyLayouts.map(layout => (
                                                <SelectItem key={layout.id} value={layout.id}>
                                                    {layout.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground">
                                        {selectedLayout.description}
                                    </p>
                                </div>

                                {/* Цветовая схема */}
                                <div className="space-y-2">
                                    <Label>Цветовая схема</Label>
                                    <Select value={selectedColorScheme} onValueChange={setSelectedColorScheme}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.keys(colorSchemes).map(scheme => (
                                                <SelectItem key={scheme} value={scheme}>
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className="w-4 h-4 rounded border"
                                                            style={{ backgroundColor: colorSchemes[scheme as keyof typeof colorSchemes].critical }}
                                                        />
                                                        {scheme}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </ScrollArea>
                    </div>

                    {/* Main Content - График топологии */}
                    <div className="flex-1 flex flex-col">
                        {/* Toolbar */}
                        <div className="border-b bg-card px-4 py-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant={isPlaying ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setIsPlaying(!isPlaying)}
                                    >
                                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                    </Button>
                                    <Button variant="outline" size="sm">
                                        <Square className="w-4 h-4" />
                                    </Button>

                                    <Separator orientation="vertical" className="h-6 mx-2" />

                                    <Button variant="outline" size="sm" onClick={() => setZoomLevel(Math.min(200, zoomLevel + 25))}>
                                        <ZoomIn className="w-4 h-4" />
                                    </Button>
                                    <span className="text-sm min-w-[4rem] text-center">{zoomLevel}%</span>
                                    <Button variant="outline" size="sm" onClick={() => setZoomLevel(Math.max(25, zoomLevel - 25))}>
                                        <ZoomOut className="w-4 h-4" />
                                    </Button>

                                    <Button variant="outline" size="sm" onClick={() => setZoomLevel(100)}>
                                        <Target className="w-4 h-4" />
                                    </Button>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Badge className="bg-blue-100 text-blue-800">
                                        Узлов: {filteredData.nodes.length}
                                    </Badge>
                                    <Badge className="bg-blue-100 text-blue-800">
                                        Связей: {filteredData.edges.length}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        {/* График */}
                        <div className="flex-1 bg-muted/20 relative">
                            <div className="absolute inset-0 flex items-center justify-center">
                                {filteredData.nodes.length > 0 ? (
                                    <div className="text-center space-y-4">
                                        <Network className="w-16 h-16 text-muted-foreground mx-auto" />
                                        <div>
                                            <h3 className="text-lg font-medium">Интерактивный граф топологии</h3>
                                            <p className="text-muted-foreground">
                                                Здесь будет отображаться интерактивный граф сети
                                            </p>
                                            <p className="text-sm text-muted-foreground mt-2">
                                                Выбранный макет: <strong>{selectedLayout.name}</strong>
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Цветовая схема: <strong>{selectedColorScheme}</strong>
                                            </p>
                                        </div>

                                        {/* Простое представление узлов */}
                                        <div className="grid grid-cols-6 gap-4 mt-8 max-w-2xl">
                                            {filteredData.nodes.slice(0, 12).map(node => (
                                                <Tooltip key={node.id}>
                                                    <TooltipTrigger>
                                                        <div
                                                            className="w-12 h-12 rounded-full border-2 cursor-pointer hover:scale-110 transition-transform flex items-center justify-center"
                                                            style={{
                                                                backgroundColor: node.color,
                                                                borderColor: node.status === 'active' ? '#22c55e' : '#9ca3af'
                                                            }}
                                                            onClick={() => handleNodeClick(node)}
                                                        >
                                                            <span className="text-xs text-white font-bold">
                                                                {node.type.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <div className="text-sm">
                                                            <p><strong>{node.label}</strong></p>
                                                            <p>IP: {node.ip}</p>
                                                            <p>Тип: {node.type}</p>
                                                            <p>Статус: {node.status}</p>
                                                            <p>Риск: {node.riskScore.toFixed(1)}</p>
                                                        </div>
                                                    </TooltipContent>
                                                </Tooltip>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center space-y-4">
                                        <Network className="w-16 h-16 text-muted-foreground mx-auto opacity-50" />
                                        <div>
                                            <h3 className="text-lg font-medium">Нет данных для отображения</h3>
                                            <p className="text-muted-foreground">
                                                Измените фильтры или загрузите данные топологии
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Легенда */}
                            <div className="absolute bottom-4 left-4 bg-card rounded border p-3 space-y-2 min-w-[200px]">
                                <h4 className="font-medium text-sm">Легенда</h4>
                                <div className="space-y-1">
                                    {Object.entries(colorSchemes[selectedColorScheme]).map(([key, color]) => (
                                        <div key={key} className="flex items-center gap-2 text-xs">
                                            <div
                                                className="w-3 h-3 rounded border"
                                                style={{ backgroundColor: color }}
                                            />
                                            <span className="capitalize">{key}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Статистика */}
                            <div className="absolute bottom-4 right-4 bg-card rounded border p-3">
                                <div className="text-sm space-y-1">
                                    <div className="flex justify-between gap-4">
                                        <span>Активные:</span>
                                        <Badge className="bg-green-100 text-green-800">
                                            {filteredData.nodes.filter(n => n.status === 'active').length}
                                        </Badge>
                                    </div>
                                    <div className="flex justify-between gap-4">
                                        <span>Критичные:</span>
                                        <Badge className="bg-red-100 text-red-800">
                                            {filteredData.nodes.filter(n => n.criticality === 'critical').length}
                                        </Badge>
                                    </div>
                                    <div className="flex justify-between gap-4">
                                        <span>Уязвимые:</span>
                                        <Badge className="bg-orange-100 text-orange-800">
                                            {filteredData.nodes.filter(n => n.metadata.vulnerabilitiesCount > 0).length}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Hidden file input */}
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".json,.csv"
                    className="hidden"
                />

                {/* Диалог импорта */}
                <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Импорт топологии</DialogTitle>
                            <DialogDescription>
                                Загрузите файл с данными топологии сети (JSON или CSV)
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        if (fileInputRef.current) {
                                            fileInputRef.current.accept = '.json';
                                            fileInputRef.current.click();
                                        }
                                    }}
                                >
                                    <FileText className="w-4 h-4 mr-2" />
                                    JSON файл
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        if (fileInputRef.current) {
                                            fileInputRef.current.accept = '.csv';
                                            fileInputRef.current.click();
                                        }
                                    }}
                                >
                                    <FileText className="w-4 h-4 mr-2" />
                                    CSV файл
                                </Button>
                            </div>
                            <div className="text-sm text-muted-foreground">
                                <p>JSON: полные данные топологии с узлами и связями</p>
                                <p>CSV: список хостов для создания топологии</p>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowImportDialog(false)}>
                                Отмена
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Диалог экспорта */}
                <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Экспорт топологии</DialogTitle>
                            <DialogDescription>
                                Экспортировать данные топологии в файл
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <Button onClick={() => handleExport('json')}>
                                    <Download className="w-4 h-4 mr-2" />
                                    JSON формат
                                </Button>
                                <Button onClick={() => handleExport('csv')}>
                                    <Download className="w-4 h-4 mr-2" />
                                    CSV формат
                                </Button>
                            </div>
                            <div className="text-sm text-muted-foreground">
                                <p>Будут экспортированы отфильтрованные данные</p>
                                <p>Узлов: {filteredData.nodes.length}, Связей: {filteredData.edges.length}</p>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowExportDialog(false)}>
                                Отмена
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Диалог аналитики */}
                <Dialog open={showAnalytics} onOpenChange={setShowAnalytics}>
                    <DialogContent className="max-w-4xl">
                        <DialogHeader>
                            <DialogTitle>Аналитика сетевых сегментов</DialogTitle>
                            <DialogDescription>
                                Статистический анализ топологии сети
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-6">
                            {Object.entries(segmentAnalytics).map(([segment, stats]) => (
                                <Card key={segment}>
                                    <CardHeader>
                                        <CardTitle className="text-lg">{segment}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div>
                                                <p className="text-sm font-medium">Всего узлов</p>
                                                <p className="text-2xl font-bold">{stats.totalNodes}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">Активных</p>
                                                <p className="text-2xl font-bold text-green-600">{stats.activeNodes}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">Критичных</p>
                                                <p className="text-2xl font-bold text-red-600">{stats.criticalNodes}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">Средний риск</p>
                                                <p className="text-2xl font-bold text-orange-600">
                                                    {stats.avgRiskScore.toFixed(1)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-4">
                                            <p className="text-sm font-medium mb-2">Типы устройств:</p>
                                            <div className="flex flex-wrap gap-1">
                                                {stats.deviceTypes.map((type: string) => (
                                                    <Badge key={type} className="bg-blue-100 text-blue-800">
                                                        {type}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                        <DialogFooter>
                            <Button onClick={() => setShowAnalytics(false)}>
                                Закрыть
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Диалог деталей узла */}
                <Dialog open={showNodeDetails} onOpenChange={setShowNodeDetails}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Детали узла</DialogTitle>
                            <DialogDescription>
                                Подробная информация о сетевом устройстве
                            </DialogDescription>
                        </DialogHeader>
                        {selectedNode && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-medium">Имя</p>
                                        <p>{selectedNode.label}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">IP адрес</p>
                                        <p>{selectedNode.ip}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Тип</p>
                                        <p className="capitalize">{selectedNode.type}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Статус</p>
                                        <Badge className={selectedNode.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                            {selectedNode.status}
                                        </Badge>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Критичность</p>
                                        <Badge className="bg-red-100 text-red-800">
                                            {selectedNode.criticality}
                                        </Badge>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Оценка риска</p>
                                        <p>{selectedNode.riskScore.toFixed(1)}</p>
                                    </div>
                                </div>

                                {selectedNode.metadata && (
                                    <div className="space-y-2">
                                        <h4 className="font-medium">Дополнительная информация</h4>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            {selectedNode.metadata.os && (
                                                <div><strong>ОС:</strong> {selectedNode.metadata.os}</div>
                                            )}
                                            {selectedNode.metadata.vendor && (
                                                <div><strong>Производитель:</strong> {selectedNode.metadata.vendor}</div>
                                            )}
                                            <div><strong>Открытых портов:</strong> {selectedNode.metadata.openPorts}</div>
                                            <div><strong>Сервисов:</strong> {selectedNode.metadata.services}</div>
                                            <div><strong>Уязвимостей:</strong> {selectedNode.metadata.vulnerabilitiesCount}</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        <DialogFooter>
                            <Button onClick={() => setShowNodeDetails(false)}>
                                Закрыть
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </TooltipProvider>
    );
};

export default NetworkTopologyPage;
