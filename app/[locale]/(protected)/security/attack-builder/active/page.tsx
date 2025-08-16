"use client";

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';

import {
    Play, Pause, Square, Eye, MoreHorizontal, AlertTriangle, CheckCircle,
    Clock, Zap, Target, Activity, Shield, RefreshCw, Download, Trash2,
    Filter, Search, Calendar, User, Settings, Terminal, TrendingUp,
    XCircle, PlayCircle, StopCircle, FileText, BarChart3
} from 'lucide-react';

// ===== ИНТЕРФЕЙСЫ =====

interface ActiveAttackLog {
    id: string;
    timestamp: string;
    level: 'info' | 'warning' | 'error' | 'success';
    message: string;
    details?: string;
}

interface ActiveAttack {
    id: string;
    name: string;
    templateId: string;
    templateName: string;
    target: string;
    targetType: 'web_application' | 'network_service' | 'database' | 'wireless' | 'social_engineering' | 'mobile' | 'cloud' | 'iot';
    status: 'running' | 'paused' | 'stopping' | 'completed' | 'failed';
    priority: 'low' | 'medium' | 'high' | 'critical';
    startTime: string;
    estimatedEndTime: string;
    progress: number;
    currentStep: string;
    totalSteps: number;
    completedSteps: number;
    executor: string;
    results: {
        vulnerabilitiesFound: number;
        successfulExploits: number;
        failedAttempts: number;
        dataExtracted: string;
    };
    logs: ActiveAttackLog[];
    category: 'web_application' | 'network_service' | 'database' | 'wireless' | 'social_engineering' | 'mobile' | 'cloud' | 'iot';
    riskLevel: 'safe' | 'moderate' | 'aggressive' | 'destructive';
    duration: string;
    lastActivity: string;
}

// ===== ТЕСТОВЫЕ ДАННЫЕ =====

const activeAttacksData: ActiveAttack[] = [
    {
        id: 'attack-001',
        name: 'SQL Injection Assessment - Production DB',
        templateId: 'template-001',
        templateName: 'SQL Injection Assessment',
        target: 'https://app.company.com',
        targetType: 'web_application',
        status: 'running',
        priority: 'high',
        startTime: '2025-08-16T14:30:00Z',
        estimatedEndTime: '2025-08-16T18:30:00Z',
        progress: 65,
        currentStep: 'SQL Injection Testing',
        totalSteps: 4,
        completedSteps: 2,
        executor: 'security@company.com',
        results: {
            vulnerabilitiesFound: 3,
            successfulExploits: 1,
            failedAttempts: 5,
            dataExtracted: '2.3 MB'
        },
        category: 'web_application',
        riskLevel: 'moderate',
        duration: '2ч 15мин',
        lastActivity: '30 сек назад',
        logs: [
            {
                id: 'log-001',
                timestamp: '2025-08-16T16:45:00Z',
                level: 'success',
                message: 'SQL инъекция обнаружена в параметре login',
                details: 'Parameter: username, Payload: \' OR 1=1--'
            },
            {
                id: 'log-002',
                timestamp: '2025-08-16T16:43:00Z',
                level: 'info',
                message: 'Тестирование параметра password',
                details: 'Trying various injection payloads'
            },
            {
                id: 'log-003',
                timestamp: '2025-08-16T16:40:00Z',
                level: 'warning',
                message: 'Rate limiting detected',
                details: 'Slowing down requests to avoid detection'
            }
        ]
    },
    {
        id: 'attack-002',
        name: 'Network Penetration - DMZ Infrastructure',
        templateId: 'template-002',
        templateName: 'Network Penetration Testing',
        target: '172.16.1.0/24',
        targetType: 'network_service',
        status: 'paused',
        priority: 'critical',
        startTime: '2025-08-16T13:00:00Z',
        estimatedEndTime: '2025-08-16T19:00:00Z',
        progress: 45,
        currentStep: 'Service Exploitation',
        totalSteps: 4,
        completedSteps: 1,
        executor: 'pentester@company.com',
        results: {
            vulnerabilitiesFound: 8,
            successfulExploits: 2,
            failedAttempts: 12,
            dataExtracted: '156 MB'
        },
        category: 'network_service',
        riskLevel: 'aggressive',
        duration: '3ч 45мин',
        lastActivity: '15 мин назад',
        logs: [
            {
                id: 'log-004',
                timestamp: '2025-08-16T16:30:00Z',
                level: 'info',
                message: 'Атака приостановлена пользователем',
                details: 'Manual pause by pentester@company.com'
            },
            {
                id: 'log-005',
                timestamp: '2025-08-16T16:25:00Z',
                level: 'success',
                message: 'Получен shell на 172.16.1.15',
                details: 'Exploit: MS17-010 EternalBlue'
            }
        ]
    },
    {
        id: 'attack-003',
        name: 'Cloud Security Assessment - AWS Infrastructure',
        templateId: 'template-005',
        templateName: 'Cloud Infrastructure Assessment',
        target: 'AWS Account: 123456789012',
        targetType: 'cloud',
        status: 'running',
        priority: 'medium',
        startTime: '2025-08-16T15:15:00Z',
        estimatedEndTime: '2025-08-16T19:15:00Z',
        progress: 25,
        currentStep: 'Misconfiguration Detection',
        totalSteps: 3,
        completedSteps: 0,
        executor: 'cloud@company.com',
        results: {
            vulnerabilitiesFound: 5,
            successfulExploits: 0,
            failedAttempts: 2,
            dataExtracted: '45 KB'
        },
        category: 'cloud',
        riskLevel: 'safe',
        duration: '1ч 30мин',
        lastActivity: '2 мин назад',
        logs: [
            {
                id: 'log-006',
                timestamp: '2025-08-16T16:40:00Z',
                level: 'warning',
                message: 'Обнаружена открытая S3 bucket',
                details: 'Bucket: company-backup-2024 (public read access)'
            }
        ]
    }
];

const ActiveAttacksPage = () => {
    const t = useTranslations('AttackBuilder');
    const router = useRouter();

    // ===== СОСТОЯНИЯ =====
    const [attacks, setAttacks] = useState<ActiveAttack[]>(activeAttacksData);
    const [selectedAttack, setSelectedAttack] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [priorityFilter, setPriorityFilter] = useState<string>('all');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [refreshInterval, setRefreshInterval] = useState(5);

    // ===== ЭФФЕКТЫ =====
    useEffect(() => {
        if (autoRefresh) {
            const interval = setInterval(() => {
                // Симуляция обновления данных
                setAttacks(prev => prev.map(attack => ({
                    ...attack,
                    progress: Math.min(100, attack.progress + Math.random() * 5),
                    lastActivity: 'Только что'
                })));
            }, refreshInterval * 1000);

            return () => clearInterval(interval);
        }
    }, [autoRefresh, refreshInterval]);

    // ===== ВЫЧИСЛЯЕМЫЕ ЗНАЧЕНИЯ =====
    const filteredAttacks = attacks.filter(attack => {
        const matchesSearch = attack.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            attack.target.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || attack.status === statusFilter;
        const matchesPriority = priorityFilter === 'all' || attack.priority === priorityFilter;
        const matchesCategory = categoryFilter === 'all' || attack.category === categoryFilter;

        return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
    });

    const statistics = {
        total: attacks.length,
        running: attacks.filter(a => a.status === 'running').length,
        paused: attacks.filter(a => a.status === 'paused').length,
        completed: attacks.filter(a => a.status === 'completed').length,
        failed: attacks.filter(a => a.status === 'failed').length,
        totalVulnerabilities: attacks.reduce((sum, a) => sum + a.results.vulnerabilitiesFound, 0),
        totalExploits: attacks.reduce((sum, a) => sum + a.results.successfulExploits, 0)
    };

    // ===== ОБРАБОТЧИКИ =====
    const handleAttackAction = (attackId: string, action: 'pause' | 'resume' | 'stop') => {
        setAttacks(prev => prev.map(attack =>
            attack.id === attackId
                ? {
                    ...attack,
                    status: action === 'pause' ? 'paused' : action === 'resume' ? 'running' : 'stopping',
                    lastActivity: 'Только что'
                }
                : attack
        ));
    };

    const handleViewDetails = (attackId: string) => {
        router.push(`/security/attack-builder/results/${attackId}`);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'running': return 'bg-green-100 text-green-800 border-green-300';
            case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'stopping': return 'bg-orange-100 text-orange-800 border-orange-300';
            case 'completed': return 'bg-blue-100 text-blue-800 border-blue-300';
            case 'failed': return 'bg-red-100 text-red-800 border-red-300';
            default: return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'critical': return 'bg-red-600 text-white';
            case 'high': return 'bg-orange-600 text-white';
            case 'medium': return 'bg-yellow-500 text-black';
            case 'low': return 'bg-green-600 text-white';
            default: return 'bg-gray-500 text-white';
        }
    };

    const getLogLevelColor = (level: string) => {
        switch (level) {
            case 'success': return 'text-green-600';
            case 'warning': return 'text-yellow-600';
            case 'error': return 'text-red-600';
            default: return 'text-blue-600';
        }
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Заголовок */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Activity className="w-8 h-8 text-primary" />
                        Активные атаки
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Мониторинг и управление выполняющимися атаками в реальном времени
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAutoRefresh(!autoRefresh)}
                        className={autoRefresh ? 'border-green-300 bg-green-50' : ''}
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
                        Авто-обновление
                    </Button>
                    <Button onClick={() => router.push('/security/attack-builder/create')}>
                        <Play className="w-4 h-4 mr-2" />
                        Новая атака
                    </Button>
                </div>
            </div>

            {/* Статистика */}
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{statistics.total}</div>
                            <div className="text-sm text-muted-foreground">Всего атак</div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{statistics.running}</div>
                            <div className="text-sm text-muted-foreground">Выполняется</div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-yellow-600">{statistics.paused}</div>
                            <div className="text-sm text-muted-foreground">Приостановлено</div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{statistics.completed}</div>
                            <div className="text-sm text-muted-foreground">Завершено</div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-red-600">{statistics.failed}</div>
                            <div className="text-sm text-muted-foreground">Неудачно</div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600">{statistics.totalVulnerabilities}</div>
                            <div className="text-sm text-muted-foreground">Уязвимостей</div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">{statistics.totalExploits}</div>
                            <div className="text-sm text-muted-foreground">Эксплойтов</div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Фильтры */}
            <Card>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div className="space-y-2">
                            <Label>Поиск</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Поиск атак..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Статус</Label>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Все статусы" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Все статусы</SelectItem>
                                    <SelectItem value="running">Выполняется</SelectItem>
                                    <SelectItem value="paused">Приостановлено</SelectItem>
                                    <SelectItem value="stopping">Останавливается</SelectItem>
                                    <SelectItem value="completed">Завершено</SelectItem>
                                    <SelectItem value="failed">Неудачно</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Приоритет</Label>
                            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Все приоритеты" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Все приоритеты</SelectItem>
                                    <SelectItem value="critical">Критический</SelectItem>
                                    <SelectItem value="high">Высокий</SelectItem>
                                    <SelectItem value="medium">Средний</SelectItem>
                                    <SelectItem value="low">Низкий</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Категория</Label>
                            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Все категории" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Все категории</SelectItem>
                                    <SelectItem value="web_application">Веб-приложения</SelectItem>
                                    <SelectItem value="network_service">Сетевые сервисы</SelectItem>
                                    <SelectItem value="database">Базы данных</SelectItem>
                                    <SelectItem value="cloud">Облачные сервисы</SelectItem>
                                    <SelectItem value="wireless">Беспроводные сети</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Интервал обновления</Label>
                            <Select value={refreshInterval.toString()} onValueChange={(v) => setRefreshInterval(Number(v))}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">1 сек</SelectItem>
                                    <SelectItem value="5">5 сек</SelectItem>
                                    <SelectItem value="10">10 сек</SelectItem>
                                    <SelectItem value="30">30 сек</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Список атак */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Список атак */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">
                        Активные атаки ({filteredAttacks.length})
                    </h2>
                    <ScrollArea className="h-[600px]">
                        <div className="space-y-3">
                            {filteredAttacks.map((attack) => (
                                <Card
                                    key={attack.id}
                                    className={`cursor-pointer transition-all hover:shadow-md ${selectedAttack === attack.id ? 'ring-2 ring-primary border-primary' : ''
                                        }`}
                                    onClick={() => setSelectedAttack(attack.id)}
                                >
                                    <CardContent className="pt-4">
                                        <div className="space-y-4">
                                            {/* Заголовок */}
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h3 className="font-semibold text-sm">{attack.name}</h3>
                                                    <p className="text-xs text-muted-foreground">
                                                        {attack.target}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge className={getPriorityColor(attack.priority)}>
                                                        {attack.priority}
                                                    </Badge>
                                                    <Badge className={getStatusColor(attack.status)}>
                                                        {attack.status === 'running' ? 'Выполняется' :
                                                            attack.status === 'paused' ? 'Приостановлено' :
                                                                attack.status === 'stopping' ? 'Останавливается' :
                                                                    attack.status === 'completed' ? 'Завершено' : 'Неудачно'}
                                                    </Badge>
                                                </div>
                                            </div>

                                            {/* Прогресс */}
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-xs">
                                                    <span>Прогресс: {attack.progress.toFixed(0)}%</span>
                                                    <span>{attack.completedSteps}/{attack.totalSteps} шагов</span>
                                                </div>
                                                <Progress value={attack.progress} className="h-2" />
                                                <div className="text-xs text-muted-foreground">
                                                    Текущий шаг: {attack.currentStep}
                                                </div>
                                            </div>

                                            {/* Результаты */}
                                            <div className="grid grid-cols-3 gap-2 text-xs">
                                                <div className="text-center">
                                                    <div className="font-semibold text-orange-600">
                                                        {attack.results.vulnerabilitiesFound}
                                                    </div>
                                                    <div className="text-muted-foreground">Уязвимости</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="font-semibold text-red-600">
                                                        {attack.results.successfulExploits}
                                                    </div>
                                                    <div className="text-muted-foreground">Эксплойты</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="font-semibold text-blue-600">
                                                        {attack.results.dataExtracted}
                                                    </div>
                                                    <div className="text-muted-foreground">Данные</div>
                                                </div>
                                            </div>

                                            {/* Управление */}
                                            <div className="flex items-center justify-between pt-2 border-t">
                                                <div className="text-xs text-muted-foreground">
                                                    <Clock className="w-3 h-3 inline mr-1" />
                                                    {attack.lastActivity}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    {attack.status === 'running' && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleAttackAction(attack.id, 'pause');
                                                            }}
                                                        >
                                                            <Pause className="w-3 h-3" />
                                                        </Button>
                                                    )}
                                                    {attack.status === 'paused' && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleAttackAction(attack.id, 'resume');
                                                            }}
                                                        >
                                                            <Play className="w-3 h-3" />
                                                        </Button>
                                                    )}
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleAttackAction(attack.id, 'stop');
                                                        }}
                                                    >
                                                        <Square className="w-3 h-3" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleViewDetails(attack.id);
                                                        }}
                                                    >
                                                        <Eye className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}

                            {filteredAttacks.length === 0 && (
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="text-center py-8">
                                            <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                            <h3 className="text-lg font-semibold mb-2">Активных атак не найдено</h3>
                                            <p className="text-muted-foreground mb-4">
                                                Попробуйте изменить фильтры или создать новую атаку
                                            </p>
                                            <Button onClick={() => router.push('/security/attack-builder/create')}>
                                                <Play className="w-4 h-4 mr-2" />
                                                Создать атаку
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </ScrollArea>
                </div>

                {/* Детали выбранной атаки */}
                <div>
                    {selectedAttack ? (
                        (() => {
                            const attack = attacks.find(a => a.id === selectedAttack);
                            if (!attack) return null;

                            return (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Target className="w-5 h-5" />
                                            Детали атаки
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <Tabs defaultValue="overview" className="w-full">
                                            <TabsList className="grid w-full grid-cols-3">
                                                <TabsTrigger value="overview">Обзор</TabsTrigger>
                                                <TabsTrigger value="logs">Логи</TabsTrigger>
                                                <TabsTrigger value="results">Результаты</TabsTrigger>
                                            </TabsList>

                                            <TabsContent value="overview" className="space-y-4">
                                                <div className="space-y-3">
                                                    <div>
                                                        <h4 className="font-semibold text-sm">Основная информация</h4>
                                                        <div className="text-sm text-muted-foreground space-y-1">
                                                            <div>Название: {attack.name}</div>
                                                            <div>Шаблон: {attack.templateName}</div>
                                                            <div>Цель: {attack.target}</div>
                                                            <div>Исполнитель: {attack.executor}</div>
                                                        </div>
                                                    </div>

                                                    <Separator />

                                                    <div>
                                                        <h4 className="font-semibold text-sm">Прогресс</h4>
                                                        <div className="space-y-2">
                                                            <Progress value={attack.progress} className="h-3" />
                                                            <div className="text-sm text-muted-foreground">
                                                                {attack.progress.toFixed(0)}% завершено
                                                            </div>
                                                            <div className="text-sm">
                                                                Текущий шаг: {attack.currentStep}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <Separator />

                                                    <div>
                                                        <h4 className="font-semibold text-sm">Время</h4>
                                                        <div className="text-sm text-muted-foreground space-y-1">
                                                            <div>Начало: {new Date(attack.startTime).toLocaleString()}</div>
                                                            <div>Ожидаемое завершение: {new Date(attack.estimatedEndTime).toLocaleString()}</div>
                                                            <div>Длительность: {attack.duration}</div>
                                                            <div>Последняя активность: {attack.lastActivity}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </TabsContent>

                                            <TabsContent value="logs">
                                                <ScrollArea className="h-[400px]">
                                                    <div className="space-y-2">
                                                        {attack.logs.map((log) => (
                                                            <div key={log.id} className="border rounded p-3 text-sm">
                                                                <div className="flex items-center justify-between mb-1">
                                                                    <span className={`font-medium ${getLogLevelColor(log.level)}`}>
                                                                        {log.level.toUpperCase()}
                                                                    </span>
                                                                    <span className="text-xs text-muted-foreground">
                                                                        {new Date(log.timestamp).toLocaleTimeString()}
                                                                    </span>
                                                                </div>
                                                                <div className="text-foreground">{log.message}</div>
                                                                {log.details && (
                                                                    <div className="text-xs text-muted-foreground mt-1">
                                                                        {log.details}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </ScrollArea>
                                            </TabsContent>

                                            <TabsContent value="results" className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <Card>
                                                        <CardContent className="pt-4">
                                                            <div className="text-center">
                                                                <div className="text-2xl font-bold text-orange-600">
                                                                    {attack.results.vulnerabilitiesFound}
                                                                </div>
                                                                <div className="text-sm text-muted-foreground">
                                                                    Уязвимости найдены
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                    <Card>
                                                        <CardContent className="pt-4">
                                                            <div className="text-center">
                                                                <div className="text-2xl font-bold text-red-600">
                                                                    {attack.results.successfulExploits}
                                                                </div>
                                                                <div className="text-sm text-muted-foreground">
                                                                    Успешные эксплойты
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                    <Card>
                                                        <CardContent className="pt-4">
                                                            <div className="text-center">
                                                                <div className="text-2xl font-bold text-gray-600">
                                                                    {attack.results.failedAttempts}
                                                                </div>
                                                                <div className="text-sm text-muted-foreground">
                                                                    Неудачные попытки
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                    <Card>
                                                        <CardContent className="pt-4">
                                                            <div className="text-center">
                                                                <div className="text-2xl font-bold text-blue-600">
                                                                    {attack.results.dataExtracted}
                                                                </div>
                                                                <div className="text-sm text-muted-foreground">
                                                                    Данные извлечены
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </div>

                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleViewDetails(attack.id)}
                                                    >
                                                        <FileText className="w-4 h-4 mr-2" />
                                                        Полный отчет
                                                    </Button>
                                                    <Button variant="outline" size="sm">
                                                        <Download className="w-4 h-4 mr-2" />
                                                        Экспорт
                                                    </Button>
                                                </div>
                                            </TabsContent>
                                        </Tabs>
                                    </CardContent>
                                </Card>
                            );
                        })()
                    ) : (
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-center py-16">
                                    <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">Выберите атаку</h3>
                                    <p className="text-muted-foreground">
                                        Кликните на атаку слева для просмотра деталей
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ActiveAttacksPage;
