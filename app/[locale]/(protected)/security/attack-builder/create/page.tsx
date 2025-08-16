"use client";
import React, { useState, useRef, useCallback, useEffect } from 'react';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    AlertTriangle, Shield, Zap, Brain, Target, Clock, CheckCircle, Settings, Save, Play,
    Calendar, Info, Wifi, Database, Globe, Network, Lock, Eye, Cpu, FileText,
    Activity, Search, Layers, Radio, Smartphone, Factory, Coins, Code, Bug,
    Fingerprint, Key, Server, Cloud, Router, Radar, Crosshair, Microscope,
    ChevronDown, ChevronUp, HelpCircle, Loader2, Monitor, HardDrive, Sword,
    Skull, Bomb, Flame, Tornado, Hammer, Wrench, Cog, Plus, Minus, RotateCcw,
    ArrowRight, ArrowDown, Trash2, Copy, Edit, Move, X, MessageSquare, Mail,
    Upload, Box, Anchor, EyeOff, CreditCard, Compass, Package, Satellite, Download,
    Terminal, Laptop, MousePointer, Link,
    // Добавляем недостающие иконки
    Share2, MoreVertical, Heart, Grid3X3, List, ChevronRight, MoreHorizontal,
    BarChart3, AlertCircle, Circle, Puzzle, BookOpen, Users, Shuffle, Camera,
    Grid, Edit3, EyeIcon
} from 'lucide-react';


// Импорт данных
import { attackVectors, attackCategories, AttackVector } from './data';

// Типы и интерфейсы
interface Position {
    x: number;
    y: number;
}

interface KillChainModule {
    id: string;
    name: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    complexity?: string;
    category: string;
    icon: string;
    position: { x: number; y: number };
    order: number;
    estimatedTime: string;
    isDragging?: boolean;
    enabled?: boolean;
    status?: 'completed' | 'running' | 'error' | 'pending' | 'configured' | 'ready';
    executionProgress?: number;
    payloads?: string[];
    prerequisites?: string[];
}

interface Connection {
    id: string;
    fromId: string;
    toId: string;
    color?: string;
    type?: 'default' | 'success' | 'error' | 'sequence' | 'parallel' | 'conditional';
    label?: string;
    isHighlighted?: boolean;
    isAnimated?: boolean;
}


interface AttackChain {
    id: string;
    name: string;
    description: string;
    modules: KillChainModule[];
    connections: Connection[];
    objectives: string[];
    estimatedDuration: string;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

interface DragItem {
    type: 'MODULE' | 'CHAIN_MODULE';
    vectorId?: string;
    moduleId?: string;
    vector?: AttackVector;
    module?: KillChainModule;
}

interface TempConnection {
    fromId: string;
    currentPos: { x: number; y: number };
    startPos: { x: number; y: number };
}

interface CanvasState {
    modules: KillChainModule[];
    connections: Connection[];
    selectedModules: string[];
    isDragging: boolean;
    dragModuleId: string | null;
    dragStartPos: { x: number; y: number } | null;
    scale: number;
    offset: { x: number; y: number };
    connectionMode: boolean;
    tempConnection: TempConnection | null;
    isSelecting?: boolean;
    selectionStart?: { x: number; y: number };
    selectionEnd?: { x: number; y: number };
    showGrid?: boolean;
}

const CreateAttackPage = () => {
    const t = useTranslations('AttackBuilder');
    const tCommon = useTranslations('Common');
    const router = useRouter();

    // Основные состояния
    const [attackName, setAttackName] = useState('');
    const [attackDescription, setAttackDescription] = useState('');
    const [attackObjectives, setAttackObjectives] = useState<string[]>([]);
    const [newObjective, setNewObjective] = useState('');

    // Состояния для kill-chain
    const [killChain, setKillChain] = useState<AttackChain>({
        id: 'chain-1',
        name: '',
        description: '',
        modules: [],
        connections: [],
        objectives: [],
        estimatedDuration: '0 мин',
        riskLevel: 'low'
    });

    // Canvas состояния
    const [canvasState, setCanvasState] = useState<CanvasState>({
        modules: [],
        connections: [],
        selectedModules: [],
        isDragging: false,
        dragModuleId: null,
        dragStartPos: null,
        scale: 1,
        offset: { x: 0, y: 0 },
        connectionMode: false,
        tempConnection: null,
        isSelecting: false,
        selectionStart: { x: 0, y: 0 },
        selectionEnd: { x: 0, y: 0 },
        showGrid: true
    });

    // Поиск и фильтрация
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    // Состояния UI
    const [selectedModule, setSelectedModule] = useState<KillChainModule | null>(null);
    const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('builder');
    const [severityFilter, setSeverityFilter] = useState('all');
    const [complexityFilter, setComplexityFilter] = useState('all');
    const [showFavorites, setShowFavorites] = useState(false);
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [favoriteModules, setFavoriteModules] = useState<string[]>([]);
    const [dragPreview, setDragPreview] = useState<any>(null);
    const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
    const [validationStatus, setValidationStatus] = useState<'valid' | 'warning' | 'error' | null>(null);
    const [highlightedModules, setHighlightedModules] = useState<string[]>([]);
    const [hoveredModule, setHoveredModule] = useState<string | null>(null);

    // Refs
    const dragItemRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);

    // Вспомогательные функции
    // Функция переключения избранного
    const toggleFavorite = useCallback((id: string) => {
        setFavoriteModules(prev =>
            prev.includes(id)
                ? prev.filter(fav => fav !== id)
                : [...prev, id]
        );
    }, []);

    // Функция переключения категорий
    const toggleCategory = useCallback((id: string) => {
        setExpandedCategories(prev =>
            prev.includes(id)
                ? prev.filter(cat => cat !== id)
                : [...prev, id]
        );
    }, []);

    // Функция получения цвета сложности
    const getComplexityColor = useCallback((complexity: string) => {
        switch (complexity) {
            case 'beginner': return 'bg-green-100 text-green-800 border-green-200';
            case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'advanced': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'expert': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    }, []);

    // Обработчик колесика мыши для масштабирования
    const handleCanvasWheel = useCallback((e: React.WheelEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;

        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const delta = -e.deltaY * 0.001;

        setCanvasState(prev => {
            const newScale = Math.min(Math.max(prev.scale + delta, 0.3), 2);
            const scaleFactor = newScale / prev.scale;

            return {
                ...prev,
                scale: newScale,
                offset: {
                    x: prev.offset.x + (mouseX - prev.offset.x) * (1 - scaleFactor),
                    y: prev.offset.y + (mouseY - prev.offset.y) * (1 - scaleFactor)
                }
            };
        });
    }, []);

    // Переменные для сглаженного drag’n’drop
    const dragInfo = useRef<{
        moduleId: string;
        startMouse: { x: number; y: number };
        startPos: { x: number; y: number };
        moveHandler?: (e: MouseEvent) => void;
        upHandler?: () => void;
    } | null>(null);

    // Обработчик двойного клика для сброса масштаба
    const handleCanvasDoubleClick = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setCanvasState(prev => ({
            ...prev,
            scale: 1,
            offset: { x: 0, y: 0 }
        }));
    }, []);

    // Расчет статистики цепочки
    const calculateChainStats = useCallback(() => {
        const totalMinutes = killChain.modules.reduce((sum, m) => {
            const nums = m.estimatedTime.match(/\d+/g);
            const max = nums ? parseInt(nums[nums.length - 1], 10) : 0;
            return sum + max;
        }, 0);

        const severities = killChain.modules.map(m => m.severity);
        const criticalCount = severities.filter(s => s === 'critical').length;
        const highCount = severities.filter(s => s === 'high').length;

        let riskLevel: AttackChain['riskLevel'] = 'low';
        if (criticalCount > 0) riskLevel = 'critical';
        else if (highCount > 1) riskLevel = 'high';
        else if (highCount === 1) riskLevel = 'medium';

        const estimatedDuration =
            totalMinutes >= 60
                ? `${Math.floor(totalMinutes / 60)}ч ${totalMinutes % 60}мин`
                : `${totalMinutes} мин`;

        setKillChain(prev => ({
            ...prev,
            estimatedDuration,
            riskLevel
        }));
    }, [killChain.modules]);

    // Обработчик мыши на модуле
    const handleModuleMouseDown = useCallback((e: React.MouseEvent, moduleId: string) => {
        e.stopPropagation();

        // Connection mode: start or complete connection
        if (canvasState.connectionMode) {
            if (!canvasState.tempConnection) {
                const mod = killChain.modules.find(m => m.id === moduleId);
                if (mod) {
                    const center = {
                        x: (mod.position.x + 70) * canvasState.scale + canvasState.offset.x,
                        y: (mod.position.y + 40) * canvasState.scale + canvasState.offset.y
                    };
                    setCanvasState(prev => ({
                        ...prev,
                        tempConnection: { fromId: moduleId, startPos: center, currentPos: center }
                    }));
                }
            } else {
                const fromId = canvasState.tempConnection.fromId;
                if (fromId !== moduleId) {
                    const newConn: Connection = {
                        id: `${fromId}-${moduleId}`,
                        fromId,
                        toId: moduleId,
                        type: 'default'
                    };
                    setKillChain(prev => ({ ...prev, connections: [...prev.connections, newConn] }));
                }
                setCanvasState(prev => ({ ...prev, tempConnection: null }));
            }
            return;
        }

        // Normal drag
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;

        const mod = killChain.modules.find(m => m.id === moduleId);
        if (!mod) return;

        const startMouse = { x: e.clientX, y: e.clientY };
        const startPos = { x: mod.position.x, y: mod.position.y };

        setCanvasState(prev => ({
            ...prev,
            isDragging: true,
            dragModuleId: moduleId,
            dragStartPos: startMouse,
            selectedModules: [moduleId]
        }));
        setSelectedModule(mod);

        const handleMouseMove = (moveEvent: MouseEvent) => {
            const dx = (moveEvent.clientX - startMouse.x) / canvasState.scale;
            const dy = (moveEvent.clientY - startMouse.y) / canvasState.scale;
            const newPos = { x: startPos.x + dx, y: startPos.y + dy };

            setKillChain(prev => ({
                ...prev,
                modules: prev.modules.map(m =>
                    m.id === moduleId ? { ...m, position: newPos } : m
                )
            }));
        };

        const handleMouseUp = () => {
            setCanvasState(prev => ({
                ...prev,
                isDragging: false,
                dragModuleId: null,
                dragStartPos: null
            }));
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            calculateChainStats();
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }, [
        canvasState.connectionMode,
        canvasState.tempConnection,
        canvasState.scale,
        killChain.modules,
        calculateChainStats
    ]);


    // Автоматическое размещение узлов
    const autoLayoutNodes = useCallback(() => {
        if (killChain.modules.length === 0) return;

        setKillChain(prev => ({
            ...prev,
            modules: prev.modules.map((module, index) => ({
                ...module,
                position: {
                    x: 200 + (index % 3) * 250,
                    y: 100 + Math.floor(index / 3) * 150
                }
            }))
        }));
    }, [killChain.modules.length]);

    // Экспорт как изображение
    const exportAsImage = useCallback(async () => {
        // Реализация экспорта canvas как изображения
        console.log('Экспорт изображения...');
    }, []);

    // Валидация цепочки
    const validateChain = useCallback(() => {
        if (killChain.modules.length === 0) {
            setValidationStatus('error');
            return;
        }

        if (killChain.connections.length === 0 && killChain.modules.length > 1) {
            setValidationStatus('warning');
            return;
        }

        setValidationStatus('valid');
    }, [killChain.modules.length, killChain.connections.length]);

    // Удаление модуля из цепочки
    const removeModuleFromChain = useCallback((moduleId: string) => {
        setKillChain(prev => ({
            ...prev,
            modules: prev.modules.filter(m => m.id !== moduleId),
            connections: prev.connections.filter(conn =>
                conn.fromId !== moduleId && conn.toId !== moduleId
            )
        }));

        if (selectedModule?.id === moduleId) {
            setSelectedModule(null);
        }
    }, [selectedModule?.id]);

    const getIconComponent = (iconName: string) => {
        const iconMap: { [key: string]: React.ComponentType<any> } = {
            Target, Shield, Zap, Brain, Clock, CheckCircle, Settings, Save, Play,
            Calendar, Info, Wifi, Database, Globe, Network, Lock, Eye, Cpu, FileText,
            Activity, Search, Layers, Radio, Smartphone, Factory, Coins, Code, Bug,
            Fingerprint, Key, Server, Cloud, Router, Radar, Crosshair, Microscope,
            Monitor, HardDrive, Sword, Skull, Bomb, Flame, Tornado, Hammer, Wrench, Cog,
            MessageSquare, Mail, Upload, Box, Anchor, EyeOff, CreditCard, Compass,
            Package, Satellite, Download, Terminal, Laptop
        };
        return iconMap[iconName] || Shield;
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical': return 'bg-red-600 text-white';
            case 'high': return 'bg-orange-600 text-white';
            case 'medium': return 'bg-yellow-500 text-black';
            case 'low': return 'bg-green-600 text-white';
            default: return 'bg-gray-500 text-white';
        }
    };

    const getCategoryColor = (category: string) => {
        const categoryColors: { [key: string]: string } = {
            network: 'bg-blue-100 text-blue-800 border-blue-200',
            web: 'bg-green-100 text-green-800 border-green-200',
            social: 'bg-purple-100 text-purple-800 border-purple-200',
            physical: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            wireless: 'bg-orange-100 text-orange-800 border-orange-200',
            cloud: 'bg-indigo-100 text-indigo-800 border-indigo-200',
            iot: 'bg-pink-100 text-pink-800 border-pink-200',
            mobile: 'bg-teal-100 text-teal-800 border-teal-200',
            system: 'bg-cyan-100 text-cyan-800 border-cyan-200'
        };
        return categoryColors[category] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    // Исправленная функция фильтрации векторов по категориям
    const getVectorsByCategory = useCallback((categoryId: string): AttackVector[] => {
        if (categoryId === 'all') {
            return attackVectors;
        }

        // Прямое соответствие по vector.category
        const directMatch = attackVectors.filter(vector => {
            // Проверяем прямое соответствие категории вектора
            if (vector.category === categoryId) return true;

            // Дополнительное мапирование MITRE ATT&CK категорий к категориям векторов
            const categoryMapping: { [key: string]: string[] } = {
                reconnaissance: ['network'],
                initial_access: ['network', 'web', 'social', 'wireless', 'iot', 'mobile', 'physical'],
                execution: ['system', 'web'],
                persistence: ['system'],
                privilege_escalation: ['system', 'cloud'],
                defense_evasion: ['system'],
                credential_access: ['system', 'network'],
                discovery: ['network', 'system'],
                lateral_movement: ['system', 'network'],
                collection: ['system'],
                command_and_control: ['network'],
                exfiltration: ['network'],
                impact: ['system']
            };

            const mappedCategories = categoryMapping[categoryId] || [];
            return mappedCategories.includes(vector.category);
        });

        return directMatch;
    }, []);

    // Фильтрация векторов атак
    const filteredVectors = attackVectors.filter(vector => {
        const matchesSearch = vector.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            vector.description.toLowerCase().includes(searchQuery.toLowerCase());

        let matchesCategory = true;
        if (selectedCategory !== 'all') {
            const categoryVectors = getVectorsByCategory(selectedCategory);
            matchesCategory = categoryVectors.some(v => v.id === vector.id);
        }

        return matchesSearch && matchesCategory;
    });

    // Функции для работы с canvas
    const getMousePosition = useCallback((e: React.MouseEvent): Position => {
        if (!canvasRef.current) return { x: 0, y: 0 };

        const rect = canvasRef.current.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left - canvasState.offset.x) / canvasState.scale,
            y: (e.clientY - rect.top - canvasState.offset.y) / canvasState.scale
        };
    }, [canvasState.offset, canvasState.scale]);

    const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => {
        if (canvasState.tempConnection && canvasRef.current) {
            const rect = canvasRef.current.getBoundingClientRect();
            const currentPos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
            setCanvasState(prev => ({
                ...prev,
                tempConnection: { ...prev.tempConnection!, currentPos }
            }));
        }
    }, [canvasState.tempConnection]);


    const handleCanvasMouseUp = useCallback(() => {
        setCanvasState(prev => ({
            ...prev,
            isDragging: false
        }));
    }, []);

    // Drag and Drop функции
    const handleDragStart = useCallback((e: React.DragEvent, item: DragItem) => {
        setDraggedItem(item);
        e.dataTransfer.effectAllowed = 'copy';

        if (dragItemRef.current) {
            e.dataTransfer.setDragImage(dragItemRef.current, 50, 30);
        }
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();

        if (!draggedItem || !canvasRef.current) return;

        const mousePos = getMousePosition(e as any);

        if (draggedItem.type === 'MODULE' && draggedItem.vector) {
            addModuleToChain(draggedItem.vector, mousePos);
        }

        setDraggedItem(null);
    }, [draggedItem, getMousePosition]);



    // Функции для работы с модулями
    const addModuleToChain = useCallback(
        (vector: AttackVector, position: Position) => {
            const newModule: KillChainModule = {
                id: `module-${Date.now()}`,
                name: vector.name,
                category: vector.category,
                severity: vector.severity,
                icon: vector.icon,
                position,
                order: killChain.modules.length + 1,
                estimatedTime: vector.estimatedTime,
                status: 'pending'
            };

            setKillChain(prev => ({
                ...prev,
                modules: [...prev.modules, newModule]
            }));

            calculateChainStats();
        },
        [killChain.modules.length, calculateChainStats]
    );

    // Функции для работы с соединениями
    const startConnection = useCallback((moduleId: string) => {
        setCanvasState(prev => ({
            ...prev,
            connectionMode: true,
            tempConnection: {
                fromId: moduleId,
                startPos: { x: 0, y: 0 },
                currentPos: { x: 0, y: 0 }
            }
        }));
    }, []);


    const completeConnection = useCallback((toModuleId: string) => {
        if (!canvasState.tempConnection || canvasState.tempConnection.fromId === toModuleId) {
            setCanvasState(prev => ({
                ...prev,
                connectionMode: false,
                tempConnection: null
            }));
            return;
        }

        // Проверяем, что соединение еще не существует
        const existingConnection = killChain.connections.find(conn =>
            (conn.fromId === canvasState.tempConnection!.fromId && conn.toId === toModuleId) ||
            (conn.fromId === toModuleId && conn.toId === canvasState.tempConnection!.fromId)
        );

        if (!existingConnection) {
            const newConnection: Connection = {
                id: `connection-${Date.now()}`,
                fromId: canvasState.tempConnection.fromId,
                toId: toModuleId,
                type: 'sequence',
                color: '#3b82f6'
            };

            setKillChain(prev => ({
                ...prev,
                connections: [...prev.connections, newConnection]
            }));
        }

        setCanvasState(prev => ({
            ...prev,
            connectionMode: false,
            tempConnection: null
        }));

        calculateChainStats();
    }, [canvasState.tempConnection, killChain.connections]);

    const removeConnection = useCallback((connectionId: string) => {
        setKillChain(prev => ({
            ...prev,
            connections: prev.connections.filter(c => c.id !== connectionId)
        }));
        calculateChainStats();
    }, []);




    // Добавление/удаление целей
    const addObjective = useCallback(() => {
        if (newObjective && !attackObjectives.includes(newObjective)) {
            setAttackObjectives([...attackObjectives, newObjective]);
            setNewObjective('');
        }
    }, [newObjective, attackObjectives]);

    const removeObjective = useCallback((objective: string) => {
        setAttackObjectives(attackObjectives.filter(o => o !== objective));
    }, [attackObjectives]);

    // Очистка цепочки
    const clearChain = useCallback(() => {
        setKillChain(prev => ({
            ...prev,
            modules: [],
            connections: []
        }));
        setSelectedModule(null);
        setCanvasState(prev => ({
            ...prev,
            selectedModules: [],
            connectionMode: false,
            tempConnection: null
        }));
    }, []);

    // Эффекты
    useEffect(() => {
        calculateChainStats();
    }, [killChain.modules, calculateChainStats]);

    return (
        <TooltipProvider>
            <div className="max-w-full mx-auto p-6 space-y-6">
                {/* Заголовок */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-2xl flex items-center gap-2">
                                    <Sword className="w-6 h-6 text-red-600" />
                                    Конструктор Kill-Chain атак
                                </CardTitle>
                                <p className="text-muted-foreground mt-1">
                                    Визуальное создание последовательности атак методом drag-and-drop
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge className="bg-green-100 text-green-700 border border-green-300">
                                    <Brain className="w-4 h-4 mr-1" />
                                    AI-Powered
                                </Badge>
                                <Badge className="bg-blue-100 text-blue-700 border border-blue-300">
                                    Модулей: {killChain.modules.length}
                                </Badge>
                                <Badge className={`${getSeverityColor(killChain.riskLevel)} border-0`}>
                                    Риск: {killChain.riskLevel.toUpperCase()}
                                </Badge>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid grid-cols-3 w-full">
                        <TabsTrigger value="builder" className="text-sm">
                            <Layers className="w-4 h-4 mr-2" />
                            Конструктор
                        </TabsTrigger>
                        <TabsTrigger value="config" className="text-sm">
                            <Settings className="w-4 h-4 mr-2" />
                            Настройки
                        </TabsTrigger>
                        <TabsTrigger value="preview" className="text-sm">
                            <Eye className="w-4 h-4 mr-2" />
                            Предпросмотр
                        </TabsTrigger>
                    </TabsList>

                    {/* Конструктор Kill-Chain - Максимально продвинутая версия */}
                    <TabsContent value="builder" className="space-y-6">
                        {/* Верхняя панель управления */}
                        <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-700">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Live Builder
                                    </span>
                                </div>

                                <Separator orientation="vertical" className="h-6" />

                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                        Last saved: {new Date().toLocaleTimeString()}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" className="hover:bg-blue-50 dark:hover:bg-blue-900/20">
                                    <Download className="w-4 h-4 mr-1" />
                                    Export JSON
                                </Button>
                                <Button variant="outline" size="sm" className="hover:bg-green-50 dark:hover:bg-green-900/20">
                                    <Upload className="w-4 h-4 mr-1" />
                                    Import
                                </Button>
                                <Button variant="outline" size="sm" className="hover:bg-purple-50 dark:hover:bg-purple-900/20">
                                    <Share2 className="w-4 h-4 mr-1" />
                                    Share
                                </Button>
                                <Button size="sm" className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700">
                                    <Save className="w-4 h-4 mr-1" />
                                    Save Chain
                                </Button>
                            </div>
                        </div>

                        {/* Основной интерфейс конструктора */}
                        <div className="grid grid-cols-12 gap-6">
                            {/* Панель модулей атак - Расширенная версия */}
                            <Card className="col-span-4 h-fit">
                                <CardHeader className="pb-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 bg-blue-500 rounded-lg">
                                                <Puzzle className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg">Attack Modules</CardTitle>
                                                <p className="text-sm text-muted-foreground">
                                                    {filteredVectors.length} modules available
                                                </p>
                                            </div>
                                        </div>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem>
                                                    <Plus className="w-4 h-4 mr-2" />
                                                    Create Custom Module
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <BookOpen className="w-4 h-4 mr-2" />
                                                    Module Library
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <Settings className="w-4 h-4 mr-2" />
                                                    Module Settings
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    {/* Расширенный поиск и фильтры */}
                                    <div className="space-y-3 pt-3">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                            <Input
                                                placeholder="Search modules, techniques, or MITRE IDs..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="pl-10 h-9"
                                            />
                                            {searchQuery && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                                                    onClick={() => setSearchQuery('')}
                                                >
                                                    <X className="w-3 h-3" />
                                                </Button>
                                            )}
                                        </div>

                                        <div className="flex gap-2">
                                            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                                <SelectTrigger className="h-9 flex-1">
                                                    <SelectValue placeholder="All categories" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">
                                                        <div className="flex items-center gap-2">
                                                            <Globe className="w-4 h-4" />
                                                            All Categories
                                                        </div>
                                                    </SelectItem>
                                                    {attackCategories.map(category => {
                                                        const CategoryIcon = getIconComponent(category.icon);
                                                        return (
                                                            <SelectItem key={category.id} value={category.id}>
                                                                <div className="flex items-center gap-2">
                                                                    <CategoryIcon className="w-4 h-4" />
                                                                    {category.name}
                                                                </div>
                                                            </SelectItem>
                                                        );
                                                    })}
                                                </SelectContent>
                                            </Select>

                                            <Select value={severityFilter} onValueChange={setSeverityFilter}>
                                                <SelectTrigger className="h-9 w-32">
                                                    <SelectValue placeholder="Severity" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All Levels</SelectItem>
                                                    <SelectItem value="critical">Critical</SelectItem>
                                                    <SelectItem value="high">High</SelectItem>
                                                    <SelectItem value="medium">Medium</SelectItem>
                                                    <SelectItem value="low">Low</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="flex gap-2">
                                            <Select value={complexityFilter} onValueChange={setComplexityFilter}>
                                                <SelectTrigger className="h-9 flex-1">
                                                    <SelectValue placeholder="Complexity" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All Levels</SelectItem>
                                                    <SelectItem value="beginner">Beginner</SelectItem>
                                                    <SelectItem value="intermediate">Intermediate</SelectItem>
                                                    <SelectItem value="advanced">Advanced</SelectItem>
                                                    <SelectItem value="expert">Expert</SelectItem>
                                                </SelectContent>
                                            </Select>

                                            <Button
                                                variant={showFavorites ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => setShowFavorites(!showFavorites)}
                                                className="h-9"
                                            >
                                                <Heart className={`w-4 h-4 ${showFavorites ? 'fill-current' : ''}`} />
                                            </Button>

                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
                                                className="h-9"
                                            >
                                                {viewMode === 'list' ? <Grid className="w-4 h-4" /> : <List className="w-4 h-4" />}
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="p-0">
                                    <ScrollArea className="h-96">
                                        {selectedCategory !== 'all' ? (
                                            // Показываем векторы выбранной категории
                                            <div className="p-4">
                                                <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-2' : 'space-y-2'}>
                                                    {filteredVectors.map(vector => {
                                                        const Icon = getIconComponent(vector.icon);
                                                        const isFavorite = favoriteModules.includes(vector.id);

                                                        return (
                                                            <Tooltip key={vector.id}>
                                                                <TooltipTrigger asChild>
                                                                    <div
                                                                        draggable
                                                                        onDragStart={(e) => {
                                                                            setDragPreview(vector);
                                                                            handleDragStart(e, {
                                                                                type: 'MODULE',
                                                                                vector
                                                                            });
                                                                        }}
                                                                        onDragEnd={() => setDragPreview(null)}
                                                                        className={`relative p-3 border-2 rounded-xl cursor-move transition-all duration-200 group hover:shadow-md hover:scale-[1.02] ${dragPreview?.id === vector.id
                                                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                                            : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                                                                            } ${vector.enabled ? '' : 'opacity-50'}`}
                                                                    >
                                                                        <div className="flex items-start gap-3">
                                                                            <div className={`p-2 rounded-lg shrink-0 ${getCategoryColor(vector.category)}`}>
                                                                                <Icon className="w-4 h-4 text-white" />
                                                                            </div>

                                                                            <div className="flex-1 min-w-0">
                                                                                <div className="flex items-center justify-between mb-1">
                                                                                    <p className="text-sm font-semibold truncate">
                                                                                        {vector.name}
                                                                                    </p>
                                                                                    <Button
                                                                                        variant="ghost"
                                                                                        size="sm"
                                                                                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                                        onClick={(e) => {
                                                                                            e.stopPropagation();
                                                                                            toggleFavorite(vector.id);
                                                                                        }}
                                                                                    >
                                                                                        <Heart className={`w-3 h-3 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                                                                                    </Button>
                                                                                </div>

                                                                                <div className="flex items-center gap-2 mb-2">
                                                                                    <Badge className={`${getSeverityColor(vector.severity)} text-xs px-1.5 py-0.5`}>
                                                                                        {vector.severity.toUpperCase()}
                                                                                    </Badge>
                                                                                    <Badge className={`${getComplexityColor(vector.complexity)} text-xs px-1.5 py-0.5`}>
                                                                                        {vector.complexity}
                                                                                    </Badge>
                                                                                </div>

                                                                                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                                                                    <div className="flex items-center gap-1">
                                                                                        <Clock className="w-3 h-3" />
                                                                                        {vector.estimatedTime}
                                                                                    </div>
                                                                                    {vector.mitreId && (
                                                                                        <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                                                                                            <Shield className="w-3 h-3" />
                                                                                            {vector.mitreId}
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        {/* Индикатор drag */}
                                                                        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                                                        </div>
                                                                    </div>
                                                                </TooltipTrigger>
                                                                <TooltipContent side="right" className="max-w-sm">
                                                                    <div className="space-y-2">
                                                                        <div className="flex items-center gap-2">
                                                                            <Icon className="w-4 h-4" />
                                                                            <p className="font-semibold">{vector.name}</p>
                                                                        </div>
                                                                        <p className="text-sm">{vector.description}</p>
                                                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                                                            <div>Complexity: <span className="font-medium">{vector.complexity}</span></div>
                                                                            <div>Stealth: <span className="font-medium">{vector.stealth}</span></div>
                                                                            <div>Time: <span className="font-medium">{vector.estimatedTime}</span></div>
                                                                            <div>Severity: <span className="font-medium">{vector.severity}</span></div>
                                                                        </div>
                                                                        {vector.prerequisites && (
                                                                            <div>
                                                                                <p className="text-xs font-medium mb-1">Prerequisites:</p>
                                                                                <ul className="text-xs list-disc list-inside">
                                                                                    {vector.prerequisites.map((req, i) => (
                                                                                        <li key={i}>{req}</li>
                                                                                    ))}
                                                                                </ul>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ) : (
                                            // Показываем все категории с их векторами
                                            <div className="space-y-1">
                                                {attackCategories.map(category => {
                                                    const categoryVectors = filteredVectors.filter(vector =>
                                                        getVectorsByCategory(category.id).some(v => v.id === vector.id)
                                                    );

                                                    if (categoryVectors.length === 0) return null;

                                                    const CategoryIcon = getIconComponent(category.icon);
                                                    const isExpanded = expandedCategories.includes(category.id);

                                                    return (
                                                        <div key={category.id}>
                                                            <div
                                                                className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                                                                onClick={() => toggleCategory(category.id)}
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div className={`p-2 rounded-lg ${category.color}`}>
                                                                        <CategoryIcon className="w-4 h-4 text-white" />
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-semibold text-sm">{category.name}</p>
                                                                        <p className="text-xs text-gray-500">{category.description}</p>
                                                                    </div>
                                                                </div>

                                                                <div className="flex items-center gap-2">
                                                                    <Badge className="bg-gray-100 text-gray-700 text-xs px-2 py-1">
                                                                        {categoryVectors.length}
                                                                    </Badge>
                                                                    {isExpanded ? (
                                                                        <ChevronDown className="w-4 h-4 text-gray-400" />
                                                                    ) : (
                                                                        <ChevronRight className="w-4 h-4 text-gray-400" />
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <Collapsible open={isExpanded}>
                                                                <CollapsibleContent className="px-4 pb-2">
                                                                    <div className="space-y-2">
                                                                        {categoryVectors.map(vector => {
                                                                            const Icon = getIconComponent(vector.icon);
                                                                            const isFavorite = favoriteModules.includes(vector.id);

                                                                            return (
                                                                                <Tooltip key={vector.id}>
                                                                                    <TooltipTrigger asChild>
                                                                                        <div
                                                                                            draggable
                                                                                            onDragStart={(e) => {
                                                                                                setDragPreview(vector);
                                                                                                handleDragStart(e, {
                                                                                                    type: 'MODULE',
                                                                                                    vectorId: vector.id,
                                                                                                    vector
                                                                                                });
                                                                                            }}
                                                                                            onDragEnd={() => setDragPreview(null)}
                                                                                            className="relative p-3 border-2 rounded-xl cursor-move transition-all duration-200 group hover:shadow-md hover:scale-[1.01] border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600"
                                                                                        >
                                                                                            <div className="flex items-start gap-3">
                                                                                                <Icon className="w-4 h-4 text-gray-600 dark:text-gray-400 shrink-0 mt-0.5" />

                                                                                                <div className="flex-1 min-w-0">
                                                                                                    <div className="flex items-center justify-between mb-1">
                                                                                                        <p className="text-sm font-medium truncate">{vector.name}</p>
                                                                                                        <Button
                                                                                                            variant="ghost"
                                                                                                            size="sm"
                                                                                                            className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100"
                                                                                                            onClick={(e) => {
                                                                                                                e.stopPropagation();
                                                                                                                toggleFavorite(vector.id);
                                                                                                            }}
                                                                                                        >
                                                                                                            <Heart className={`w-3 h-3 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                                                                                                        </Button>
                                                                                                    </div>

                                                                                                    <div className="flex items-center gap-2 flex-wrap">
                                                                                                        <Badge className={`${getSeverityColor(vector.severity)} text-xs px-1 py-0`}>
                                                                                                            {vector.severity}
                                                                                                        </Badge>
                                                                                                        <span className="text-xs text-gray-500">{vector.estimatedTime}</span>
                                                                                                        {vector.mitreId && (
                                                                                                            <span className="text-xs text-blue-600 dark:text-blue-400">
                                                                                                                {vector.mitreId}
                                                                                                            </span>
                                                                                                        )}
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    </TooltipTrigger>
                                                                                    <TooltipContent side="right" className="max-w-sm">
                                                                                        <div className="space-y-2">
                                                                                            <div className="flex items-center gap-2">
                                                                                                <Icon className="w-4 h-4" />
                                                                                                <p className="font-semibold">{vector.name}</p>
                                                                                            </div>
                                                                                            <p className="text-sm">{vector.description}</p>
                                                                                            <div className="grid grid-cols-2 gap-2 text-xs">
                                                                                                <div>Complexity: <span className="font-medium">{vector.complexity}</span></div>
                                                                                                <div>Stealth: <span className="font-medium">{vector.stealth}</span></div>
                                                                                            </div>
                                                                                        </div>
                                                                                    </TooltipContent>
                                                                                </Tooltip>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                </CollapsibleContent>
                                                            </Collapsible>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </ScrollArea>
                                </CardContent>

                                <div className="p-4 border-t bg-gray-50 dark:bg-gray-800/50">
                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <span>Total: {filteredVectors.length} modules</span>
                                        <span>Enabled: {filteredVectors.filter(v => v.enabled).length}</span>
                                    </div>
                                </div>
                            </Card>

                            {/* Kill-Chain Canvas - Максимально продвинутая версия */}
                            <Card className="col-span-8">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
                                                <Target className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg">Kill-Chain Canvas</CardTitle>
                                                <p className="text-sm text-muted-foreground">
                                                    Design your attack sequence with visual flow
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-1 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-full">
                                                <Zap className="w-3 h-3 text-blue-500" />
                                                <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                                                    Auto-Layout
                                                </span>
                                            </div>

                                            <Separator orientation="vertical" className="h-6" />

                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setCanvasState(prev => ({
                                                    ...prev,
                                                    connectionMode: !prev.connectionMode,
                                                    tempConnection: null
                                                }))}
                                                className={`transition-all ${canvasState.connectionMode
                                                    ? 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600'
                                                    : 'hover:bg-blue-50 dark:hover:bg-blue-900/20'
                                                    }`}
                                            >
                                                <Link className="w-4 h-4 mr-1" />
                                                {canvasState.connectionMode ? 'Exit Connection' : 'Connect Nodes'}
                                            </Button>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="outline" size="sm">
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48">
                                                    <DropdownMenuItem onClick={() => autoLayoutNodes()}>
                                                        <Shuffle className="w-4 h-4 mr-2" />
                                                        Auto-arrange Nodes
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => exportAsImage()}>
                                                        <Camera className="w-4 h-4 mr-2" />
                                                        Export as Image
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => validateChain()}>
                                                        <CheckCircle className="w-4 h-4 mr-2" />
                                                        Validate Chain
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={clearChain} className="text-red-600">
                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                        Clear All
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="p-0 relative">
                                    <div
                                        ref={canvasRef}
                                        className="relative bg-white dark:bg-gray-900 border-2 border-dashed border-gray-300 dark:border-gray-700 overflow-hidden transition-all duration-300"
                                        style={{
                                            height: '600px',
                                            cursor: canvasState.isDragging ? 'grabbing' : canvasState.connectionMode ? 'crosshair' : 'default',
                                            backgroundImage: canvasState.showGrid ? `
          radial-gradient(circle at 1px 1px, rgb(156 163 175 / 0.3) 1px, transparent 0)
        ` : 'none',
                                            backgroundSize: canvasState.showGrid ? '20px 20px' : 'auto',
                                            touchAction: 'none', // Добавить это для предотвращения touch событий
                                            userSelect: 'none'    // Предотвратить выделение текста
                                        }}
                                        onDragOver={handleDragOver}
                                        onDrop={handleDrop}
                                        onMouseUp={handleCanvasMouseUp}
                                        onMouseLeave={handleCanvasMouseUp}
                                        onDoubleClick={handleCanvasDoubleClick}
                                    >
                                        <style jsx>{`
  .canvas-container {
    touch-action: none;
    user-select: none;
    overscroll-behavior: contain;
  }
`}</style>
                                        {/* Canvas Background Pattern */}
                                        <div
                                            className="absolute inset-0 opacity-20 dark:opacity-10 transition-all duration-300"
                                            style={{
                                                backgroundImage: canvasState.showGrid ? `
                linear-gradient(to right, rgb(156 163 175) 1px, transparent 1px),
                linear-gradient(to bottom, rgb(156 163 175) 1px, transparent 1px)
              ` : 'none',
                                                backgroundSize: '20px 20px',
                                                transform: `translate(${canvasState.offset.x}px, ${canvasState.offset.y}px) scale(${canvasState.scale})`,
                                                transformOrigin: '0 0'
                                            }}
                                        />

                                        {/* Minimap */}
                                        {killChain.modules.length > 0 && (
                                            <div className="absolute top-4 right-4 w-32 h-20 bg-white dark:bg-gray-800 border rounded-lg shadow-lg p-2 opacity-80 hover:opacity-100 transition-opacity">
                                                <div className="text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">Minimap</div>
                                                <div className="relative w-full h-full bg-gray-100 dark:bg-gray-700 rounded">
                                                    {killChain.modules.map(module => (
                                                        <div
                                                            key={module.id}
                                                            className="absolute w-1 h-1 bg-blue-500 rounded-full"
                                                            style={{
                                                                left: `${(module.position.x / 1000) * 100}%`,
                                                                top: `${(module.position.y / 600) * 100}%`
                                                            }}
                                                        />
                                                    ))}
                                                    {/* Viewport indicator */}
                                                    <div
                                                        className="absolute border border-red-400 bg-red-400/10"
                                                        style={{
                                                            left: `${(-canvasState.offset.x / (1000 * canvasState.scale)) * 100}%`,
                                                            top: `${(-canvasState.offset.y / (600 * canvasState.scale)) * 100}%`,
                                                            width: `${(100 / canvasState.scale)}%`,
                                                            height: `${(100 / canvasState.scale)}%`
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* SVG Layer for Connections */}
                                        <svg
                                            ref={svgRef}
                                            className="absolute inset-0 pointer-events-none"
                                            style={{ zIndex: 5 }}
                                        >
                                            <defs>
                                                <marker
                                                    id="arrowhead-default"
                                                    markerWidth="12"
                                                    markerHeight="8"
                                                    refX="11"
                                                    refY="4"
                                                    orient="auto"
                                                >
                                                    <polygon points="0 0, 12 4, 0 8" fill="#3b82f6" />
                                                </marker>

                                                <marker
                                                    id="arrowhead-success"
                                                    markerWidth="12"
                                                    markerHeight="8"
                                                    refX="11"
                                                    refY="4"
                                                    orient="auto"
                                                >
                                                    <polygon points="0 0, 12 4, 0 8" fill="#22c55e" />
                                                </marker>

                                                <marker
                                                    id="arrowhead-error"
                                                    markerWidth="12"
                                                    markerHeight="8"
                                                    refX="11"
                                                    refY="4"
                                                    orient="auto"
                                                >
                                                    <polygon points="0 0, 12 4, 0 8" fill="#ef4444" />
                                                </marker>

                                                {/* Gradient definitions */}
                                                <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                                                    <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.9" />
                                                    <stop offset="100%" stopColor="#06b6d4" stopOpacity="1" />
                                                </linearGradient>

                                                <filter id="glowFilter">
                                                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                                                    <feMerge>
                                                        <feMergeNode in="coloredBlur" />
                                                        <feMergeNode in="SourceGraphic" />
                                                    </feMerge>
                                                </filter>
                                            </defs>

                                            {/* Connection Lines */}
                                            {killChain.connections.map(connection => {
                                                const fromModule = killChain.modules.find(m => m.id === connection.fromId);
                                                const toModule = killChain.modules.find(m => m.id === connection.toId);

                                                if (!fromModule || !toModule) return null;

                                                const fromX = (fromModule.position.x + 70) * canvasState.scale + canvasState.offset.x;
                                                const fromY = (fromModule.position.y + 40) * canvasState.scale + canvasState.offset.y;
                                                const toX = (toModule.position.x + 70) * canvasState.scale + canvasState.offset.x;
                                                const toY = (toModule.position.y + 40) * canvasState.scale + canvasState.offset.y;

                                                const midX = (fromX + toX) / 2;
                                                const midY = Math.min(fromY, toY) - 40;

                                                const connectionType = connection.type || 'default';
                                                const markerEnd = `url(#arrowhead-${connectionType})`;

                                                return (
                                                    <g key={connection.id}>
                                                        {/* Main connection path */}
                                                        <path
                                                            d={`M ${fromX} ${fromY} Q ${midX} ${midY} ${toX} ${toY}`}
                                                            stroke={connectionType === 'success' ? '#22c55e' : connectionType === 'error' ? '#ef4444' : 'url(#connectionGradient)'}
                                                            strokeWidth={connection.isHighlighted ? "4" : "3"}
                                                            fill="none"
                                                            markerEnd={markerEnd}
                                                            className={`transition-all duration-300 ${connection.isHighlighted ? 'filter-[url(#glowFilter)]' : ''}`}
                                                            style={{
                                                                opacity: connection.isAnimated ? '0.8' : '1',
                                                                strokeDasharray: connection.isAnimated ? '8,4' : 'none',
                                                                animation: connection.isAnimated ? 'dash 2s linear infinite' : 'none'
                                                            }}
                                                        />

                                                        {/* Connection label */}
                                                        {connection.label && (
                                                            <text
                                                                x={midX}
                                                                y={midY - 5}
                                                                textAnchor="middle"
                                                                className="text-xs fill-gray-600 dark:fill-gray-300"
                                                                style={{ fontSize: `${12 * canvasState.scale}px` }}
                                                            >
                                                                {connection.label}
                                                            </text>
                                                        )}

                                                        {/* Delete button */}
                                                        <g className="pointer-events-auto cursor-pointer" onClick={() => removeConnection(connection.id)}>
                                                            <circle
                                                                cx={midX}
                                                                cy={midY}
                                                                r="12"
                                                                fill="white"
                                                                stroke="#ef4444"
                                                                strokeWidth="2"
                                                                className="hover:fill-red-50 transition-colors drop-shadow-md"
                                                            />
                                                            <path
                                                                d={`M ${midX - 4} ${midY - 4} L ${midX + 4} ${midY + 4} M ${midX + 4} ${midY - 4} L ${midX - 4} ${midY + 4}`}
                                                                stroke="#ef4444"
                                                                strokeWidth="2"
                                                                className="pointer-events-none"
                                                            />
                                                        </g>
                                                    </g>
                                                );
                                            })}

                                            {/* Temporary connection */}
                                            {canvasState.tempConnection && (
                                                <g>
                                                    <path
                                                        d={`M ${canvasState.tempConnection.startPos.x} ${canvasState.tempConnection.startPos.y} L ${canvasState.tempConnection.currentPos.x} ${canvasState.tempConnection.currentPos.y}`}
                                                        stroke="#3b82f6"
                                                        strokeWidth="3"
                                                        strokeDasharray="8,4"
                                                        fill="none"
                                                        className="animate-pulse"
                                                    />
                                                    <circle
                                                        cx={canvasState.tempConnection.currentPos.x}
                                                        cy={canvasState.tempConnection.currentPos.y}
                                                        r="4"
                                                        fill="#3b82f6"
                                                        className="animate-ping"
                                                    />
                                                </g>
                                            )}

                                            {/* Selection rectangle */}
                                            {canvasState.isSelecting && canvasState.selectionStart && canvasState.selectionEnd && (
                                                <rect
                                                    x={Math.min(canvasState.selectionStart.x, canvasState.selectionEnd.x)}
                                                    y={Math.min(canvasState.selectionStart.y, canvasState.selectionEnd.y)}
                                                    width={Math.abs(canvasState.selectionEnd.x - canvasState.selectionStart.x)}
                                                    height={Math.abs(canvasState.selectionEnd.y - canvasState.selectionStart.y)}
                                                    fill="rgba(59, 130, 246, 0.1)"
                                                    stroke="#3b82f6"
                                                    strokeWidth="2"
                                                    strokeDasharray="4,4"
                                                />
                                            )}
                                        </svg>

                                        {/* Module Nodes */}
                                        {killChain.modules.map(module => {
                                            const Icon = getIconComponent(module.icon);
                                            const isSelected = canvasState.selectedModules.includes(module.id);
                                            const isDragging = canvasState.dragModuleId === module.id;
                                            const isHighlighted = highlightedModules.includes(module.id);

                                            return (
                                                <div
                                                    key={module.id}
                                                    className={`absolute transition-all duration-300 cursor-move z-20 ${isDragging ? 'z-50' : ''
                                                        }`}
                                                    style={{
                                                        left: module.position.x * canvasState.scale + canvasState.offset.x,
                                                        top: module.position.y * canvasState.scale + canvasState.offset.y,
                                                        transform: `scale(${canvasState.scale}) ${isDragging ? 'rotate(2deg) scale(1.05)' : ''}`,
                                                        transformOrigin: 'center'
                                                    }}
                                                    onMouseDown={(e) => handleModuleMouseDown(e, module.id)}
                                                    onMouseEnter={() => setHoveredModule(module.id)}
                                                    onMouseLeave={() => setHoveredModule(null)}
                                                    onDoubleClick={() => setSelectedModule(module)}
                                                >
                                                    <div className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 min-w-[140px] transition-all duration-200 ${isSelected
                                                        ? 'ring-4 ring-blue-400 dark:ring-blue-500 shadow-2xl shadow-blue-200 dark:shadow-blue-900/50'
                                                        : isHighlighted
                                                            ? 'ring-2 ring-yellow-400 shadow-yellow-200'
                                                            : 'hover:shadow-xl hover:scale-105'
                                                        } ${isDragging ? 'opacity-80' : ''} ${canvasState.connectionMode ? 'hover:ring-2 hover:ring-green-400' : ''
                                                        } border-2 ${getSeverityColor(module.severity).includes('red') ? 'border-red-300' :
                                                            getSeverityColor(module.severity).includes('orange') ? 'border-orange-300' :
                                                                getSeverityColor(module.severity).includes('yellow') ? 'border-yellow-300' :
                                                                    'border-green-300'
                                                        }`}>

                                                        {/* Module Icon */}
                                                        <div className={`p-3 rounded-xl mb-3 ${getCategoryColor(module.category)}`}>
                                                            <Icon className="w-6 h-6 text-white" />
                                                        </div>

                                                        {/* Module Info */}
                                                        <div className="space-y-2">
                                                            <h4 className="text-sm font-semibold truncate text-gray-900 dark:text-white">
                                                                {module.name}
                                                            </h4>

                                                            <div className="flex flex-wrap gap-1">
                                                                <Badge className={`${getSeverityColor(module.severity)} text-xs px-2 py-0.5`}>
                                                                    {module.severity.toUpperCase()}
                                                                </Badge>
                                                                <Badge className="bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 text-xs px-2 py-0.5">
                                                                    {module.estimatedTime}
                                                                </Badge>
                                                            </div>

                                                            {/* Progress bar for execution */}
                                                            {module.executionProgress !== undefined && (
                                                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                                                    <div
                                                                        className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                                                                        style={{ width: `${module.executionProgress}%` }}
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Order Badge */}
                                                        <div className="absolute -top-3 -left-3 w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                                                            {module.order}
                                                        </div>

                                                        {/* Status Indicator */}
                                                        <div className={`absolute -top-2 -right-2 w-4 h-4 rounded-full border-2 border-white ${module.status === 'completed' ? 'bg-green-500' :
                                                            module.status === 'running' ? 'bg-blue-500 animate-pulse' :
                                                                module.status === 'error' ? 'bg-red-500' :
                                                                    'bg-gray-400'
                                                            }`} />

                                                        {/* Delete Button */}
                                                        <button
                                                            className="absolute -top-2 -right-8 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110 shadow-lg"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                removeModuleFromChain(module.id);
                                                            }}
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>

                                                        {/* Connection Mode Indicators */}
                                                        {canvasState.connectionMode && (
                                                            <>
                                                                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-lg animate-pulse" />
                                                                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-orange-500 rounded-full border-2 border-white shadow-lg animate-pulse" />
                                                                <div className="absolute top-1/2 -left-1 transform -translate-y-1/2 w-3 h-3 bg-purple-500 rounded-full border-2 border-white shadow-lg animate-pulse" />
                                                                <div className="absolute top-1/2 -right-1 transform -translate-y-1/2 w-3 h-3 bg-cyan-500 rounded-full border-2 border-white shadow-lg animate-pulse" />
                                                            </>
                                                        )}

                                                        {/* Module Type Indicator */}
                                                        <div className="absolute top-2 right-2">
                                                            {module.category === 'network' && <Globe className="w-3 h-3 text-blue-500" />}
                                                            {module.category === 'web' && <Code className="w-3 h-3 text-green-500" />}
                                                            {module.category === 'system' && <Server className="w-3 h-3 text-purple-500" />}
                                                            {module.category === 'social' && <Users className="w-3 h-3 text-orange-500" />}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        {/* Empty State */}
                                        {killChain.modules.length === 0 && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="text-center space-y-6 p-8">
                                                    <div className="relative">
                                                        <div className="w-24 h-24 border-4 border-dashed border-gray-300 dark:border-gray-600 rounded-full flex items-center justify-center mx-auto">
                                                            <Target className="w-12 h-12 text-gray-400" />
                                                        </div>
                                                        <div className="absolute inset-0 w-24 h-24 border-4 border-blue-500 rounded-full animate-ping opacity-20 mx-auto" />
                                                    </div>

                                                    <div>
                                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                                            Build Your Attack Chain
                                                        </h3>
                                                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                                                            Drag and drop modules from the left panel to create your kill-chain sequence
                                                        </p>

                                                        <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                                                <span>Drag modules here</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-2 h-2 bg-green-500 rounded-full" />
                                                                <span>Connect with arrows</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-2 h-2 bg-purple-500 rounded-full" />
                                                                <span>Configure each step</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Connection Mode Helper */}
                                        {canvasState.connectionMode && (
                                            <div className="absolute top-4 left-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-700 rounded-xl p-4 shadow-lg max-w-sm animate-in slide-in-from-left duration-500">
                                                <div className="flex items-start gap-3">
                                                    <div className="p-2 bg-blue-500 rounded-lg shrink-0">
                                                        <Link className="w-4 h-4 text-white" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                                                            Connection Mode Active
                                                        </p>
                                                        <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                                                            Click on two modules to create a connection
                                                        </p>
                                                        <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
                                                            <div className="flex items-center gap-1">
                                                                <div className="w-2 h-2 bg-green-500 rounded-full" />
                                                                <span>Entry point</span>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <div className="w-2 h-2 bg-orange-500 rounded-full" />
                                                                <span>Exit point</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Drag Preview */}
                                        {dragPreview && (
                                            <div
                                                className="absolute pointer-events-none z-50 bg-white dark:bg-gray-800 border-2 border-blue-500 rounded-xl shadow-xl p-3 min-w-[120px] opacity-80"
                                                style={{
                                                    left: dragPreview.position?.x || 0,
                                                    top: dragPreview.position?.y || 0
                                                }}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div className={`p-2 rounded-lg ${getCategoryColor(dragPreview.category)}`}>
                                                        {React.createElement(getIconComponent(dragPreview.icon), { className: "w-4 h-4 text-white" })}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium">{dragPreview.name}</p>
                                                        <Badge className={`${getSeverityColor(dragPreview.severity)} text-xs mt-1`}>
                                                            {dragPreview.severity}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Canvas Controls */}
                                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                                        {/* Left Controls */}
                                        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setCanvasState(prev => ({
                                                    ...prev,
                                                    scale: Math.max(0.3, prev.scale - 0.1)
                                                }))}
                                                disabled={canvasState.scale <= 0.3}
                                                className="h-8 w-8 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </Button>

                                            <div className="flex items-center gap-2 px-3">
                                                <span className="text-sm font-semibold min-w-[50px] text-center">
                                                    {Math.round(canvasState.scale * 100)}%
                                                </span>
                                            </div>

                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setCanvasState(prev => ({
                                                    ...prev,
                                                    scale: Math.min(2, prev.scale + 0.1)
                                                }))}
                                                disabled={canvasState.scale >= 2}
                                                className="h-8 w-8 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </Button>

                                            <Separator orientation="vertical" className="h-6" />

                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setCanvasState(prev => ({
                                                    ...prev,
                                                    scale: 1,
                                                    offset: { x: 0, y: 0 }
                                                }))}
                                                className="h-8 px-3 hover:bg-green-50 dark:hover:bg-green-900/20"
                                            >
                                                <RotateCcw className="w-4 h-4 mr-1" />
                                                Reset
                                            </Button>

                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    if (killChain.modules.length > 0) {
                                                        const bounds = killChain.modules.reduce((acc, module) => ({
                                                            minX: Math.min(acc.minX, module.position.x),
                                                            maxX: Math.max(acc.maxX, module.position.x + 140),
                                                            minY: Math.min(acc.minY, module.position.y),
                                                            maxY: Math.max(acc.maxY, module.position.y + 100)
                                                        }), { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity });

                                                        const centerX = (bounds.minX + bounds.maxX) / 2;
                                                        const centerY = (bounds.minY + bounds.maxY) / 2;
                                                        const canvasRect = canvasRef.current?.getBoundingClientRect();

                                                        if (canvasRect) {
                                                            setCanvasState(prev => ({
                                                                ...prev,
                                                                scale: 0.8,
                                                                offset: {
                                                                    x: canvasRect.width / 2 - centerX * 0.8,
                                                                    y: canvasRect.height / 2 - centerY * 0.8
                                                                }
                                                            }));
                                                        }
                                                    }
                                                }}
                                                disabled={killChain.modules.length === 0}
                                                className="h-8 px-3 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                                            >
                                                <Target className="w-4 h-4 mr-1" />
                                                Fit All
                                            </Button>
                                        </div>

                                        {/* Right Stats */}
                                        <div className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    {killChain.modules.length} Modules
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-green-500 rounded-full" />
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    {killChain.connections.length} Links
                                                </span>
                                            </div>

                                            {killChain.modules.length > 0 && (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 bg-orange-500 rounded-full" />
                                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        ~{killChain.estimatedDuration}
                                                    </span>
                                                </div>
                                            )}

                                            {validationStatus && (
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${validationStatus === 'valid' ? 'bg-green-500' :
                                                        validationStatus === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                                                        }`} />
                                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        {validationStatus === 'valid' ? 'Valid' :
                                                            validationStatus === 'warning' ? 'Warnings' : 'Errors'}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Нижняя панель: Настройки модуля + Временная шкала */}
                        <div className="grid grid-cols-12 gap-6">
                            {/* Настройки выбранного модуля */}
                            <Card className="col-span-5">
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-green-500 rounded-lg">
                                            <Settings className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">
                                                {selectedModule ? `Configure ${selectedModule.name}` : 'Module Configuration'}
                                            </CardTitle>
                                            <p className="text-sm text-muted-foreground">
                                                {selectedModule ? 'Customize execution parameters' : 'Select a module to configure'}
                                            </p>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent>
                                    {selectedModule ? (
                                        <Tabs defaultValue="basic" className="w-full">
                                            <TabsList className="grid w-full grid-cols-4">
                                                <TabsTrigger value="basic">Basic</TabsTrigger>
                                                <TabsTrigger value="advanced">Advanced</TabsTrigger>
                                                <TabsTrigger value="payloads">Payloads</TabsTrigger>
                                                <TabsTrigger value="conditions">Conditions</TabsTrigger>
                                            </TabsList>

                                            <TabsContent value="basic" className="space-y-4 mt-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <Label className="text-sm font-medium">Priority Level</Label>
                                                        <Select defaultValue="normal">
                                                            <SelectTrigger className="h-9">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="low">🟢 Low Priority</SelectItem>
                                                                <SelectItem value="normal">🟡 Normal Priority</SelectItem>
                                                                <SelectItem value="high">🟠 High Priority</SelectItem>
                                                                <SelectItem value="critical">🔴 Critical Priority</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    <div>
                                                        <Label className="text-sm font-medium">Execution Timeout</Label>
                                                        <div className="flex items-center gap-2">
                                                            <Input type="number" defaultValue="30" className="h-9 flex-1" />
                                                            <span className="text-sm text-gray-500">minutes</span>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <Label className="text-sm font-medium">Max Attempts</Label>
                                                        <Input type="number" defaultValue="3" min="1" max="10" className="h-9" />
                                                    </div>

                                                    <div>
                                                        <Label className="text-sm font-medium">Delay Between Attempts</Label>
                                                        <div className="flex items-center gap-2">
                                                            <Input type="number" defaultValue="5" className="h-9 flex-1" />
                                                            <span className="text-sm text-gray-500">seconds</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <Separator />

                                                <div className="space-y-3">
                                                    <Label className="text-sm font-medium">Execution Options</Label>

                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <Label className="text-sm">Continue on failure</Label>
                                                                <p className="text-xs text-gray-500">Keep executing even if this module fails</p>
                                                            </div>
                                                            <Switch defaultChecked />
                                                        </div>

                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <Label className="text-sm">Verbose logging</Label>
                                                                <p className="text-xs text-gray-500">Enable detailed execution logs</p>
                                                            </div>
                                                            <Switch defaultChecked />
                                                        </div>

                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <Label className="text-sm">Cleanup on exit</Label>
                                                                <p className="text-xs text-gray-500">Remove artifacts after execution</p>
                                                            </div>
                                                            <Switch />
                                                        </div>

                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <Label className="text-sm">Stealth mode</Label>
                                                                <p className="text-xs text-gray-500">Minimize detection signatures</p>
                                                            </div>
                                                            <Switch />
                                                        </div>
                                                    </div>
                                                </div>
                                            </TabsContent>

                                            <TabsContent value="advanced" className="space-y-4 mt-4">
                                                <div className="space-y-4">
                                                    <div>
                                                        <Label className="text-sm font-medium">Custom Parameters</Label>
                                                        <Textarea
                                                            placeholder="Add custom command-line parameters..."
                                                            className="h-20 resize-none"
                                                        />
                                                    </div>

                                                    <div>
                                                        <Label className="text-sm font-medium">Environment Variables</Label>
                                                        <div className="space-y-2">
                                                            {[1, 2].map(i => (
                                                                <div key={i} className="flex items-center gap-2">
                                                                    <Input placeholder="Variable name" className="h-9 flex-1" />
                                                                    <Input placeholder="Value" className="h-9 flex-1" />
                                                                    <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                                                                        <X className="w-4 h-4" />
                                                                    </Button>
                                                                </div>
                                                            ))}
                                                            <Button variant="outline" size="sm" className="w-full">
                                                                <Plus className="w-4 h-4 mr-1" />
                                                                Add Variable
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <Label className="text-sm font-medium">Resource Limits</Label>
                                                        <div className="grid grid-cols-2 gap-4 mt-2">
                                                            <div>
                                                                <Label className="text-xs">CPU Limit (%)</Label>
                                                                <Input type="number" defaultValue="50" max="100" className="h-8" />
                                                            </div>
                                                            <div>
                                                                <Label className="text-xs">Memory Limit (MB)</Label>
                                                                <Input type="number" defaultValue="1024" className="h-8" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </TabsContent>

                                            <TabsContent value="payloads" className="space-y-4 mt-4">
                                                <div>
                                                    <div className="flex items-center justify-between mb-3">
                                                        <Label className="text-sm font-medium">Available Payloads</Label>
                                                        <Button variant="outline" size="sm">
                                                            <Upload className="w-4 h-4 mr-1" />
                                                            Upload Custom
                                                        </Button>
                                                    </div>

                                                    <div className="space-y-2">
                                                        {selectedModule.payloads?.map((payload, index) => (
                                                            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                                                <div className="flex items-center gap-3">
                                                                    <input type="checkbox" className="w-4 h-4" defaultChecked={index === 0} />
                                                                    <div>
                                                                        <p className="text-sm font-medium">{payload}</p>
                                                                        <p className="text-xs text-gray-500">
                                                                            {payload.includes('injection') ? 'SQL Injection payload' :
                                                                                payload.includes('xss') ? 'Cross-site scripting payload' :
                                                                                    payload.includes('shell') ? 'Remote shell payload' :
                                                                                        'Generic attack payload'}
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                <div className="flex items-center gap-2">
                                                                    <Button variant="ghost" size="sm">
                                                                        <Edit3 className="w-4 h-4" />
                                                                    </Button>
                                                                    <Button variant="ghost" size="sm">
                                                                        <Eye className="w-4 h-4" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        )) || (
                                                                <p className="text-sm text-gray-500 text-center py-4">
                                                                    No payloads available for this module
                                                                </p>
                                                            )}
                                                    </div>
                                                </div>
                                            </TabsContent>

                                            <TabsContent value="conditions" className="space-y-4 mt-4">
                                                <div className="space-y-4">
                                                    <div>
                                                        <Label className="text-sm font-medium">Prerequisites</Label>
                                                        <div className="space-y-2 mt-2">
                                                            {selectedModule.prerequisites?.map((prereq, index) => (
                                                                <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                                                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                                                    <span className="text-sm">{prereq}</span>
                                                                </div>
                                                            )) || (
                                                                    <p className="text-sm text-gray-500">No prerequisites required</p>
                                                                )}
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <Label className="text-sm font-medium">Success Conditions</Label>
                                                        <Textarea
                                                            placeholder="Define when this module should be considered successful..."
                                                            className="h-16 resize-none"
                                                        />
                                                    </div>

                                                    <div>
                                                        <Label className="text-sm font-medium">Failure Handling</Label>
                                                        <Select defaultValue="continue">
                                                            <SelectTrigger className="h-9">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="continue">Continue to next module</SelectItem>
                                                                <SelectItem value="retry">Retry this module</SelectItem>
                                                                <SelectItem value="fallback">Use fallback module</SelectItem>
                                                                <SelectItem value="abort">Abort entire chain</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                            </TabsContent>
                                        </Tabs>
                                    ) : (
                                        <div className="flex items-center justify-center h-64 text-gray-500">
                                            <div className="text-center space-y-3">
                                                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto">
                                                    <Settings className="w-8 h-8 text-gray-400" />
                                                </div>
                                                <div>
                                                    <p className="text-lg font-medium mb-1">No Module Selected</p>
                                                    <p className="text-sm">Click on a module in the canvas to configure it</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Временная шкала выполнения */}
                            <Card className="col-span-7">
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-purple-500 rounded-lg">
                                            <Clock className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">Execution Timeline</CardTitle>
                                            <p className="text-sm text-muted-foreground">
                                                Visualize the attack sequence and timing
                                            </p>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent>
                                    {killChain.modules.length > 0 ? (
                                        <div className="space-y-4">
                                            {/* Timeline Header */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <Button variant="outline" size="sm">
                                                        <Play className="w-4 h-4 mr-1" />
                                                        Simulate
                                                    </Button>
                                                    <Button variant="outline" size="sm">
                                                        <BarChart3 className="w-4 h-4 mr-1" />
                                                        Analyze
                                                    </Button>
                                                    <Button variant="outline" size="sm">
                                                        <Download className="w-4 h-4 mr-1" />
                                                        Export Timeline
                                                    </Button>
                                                </div>

                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <span>Total Duration: </span>
                                                    <Badge className="bg-blue-100 text-blue-800 px-2 py-1">
                                                        {killChain.estimatedDuration}
                                                    </Badge>
                                                </div>
                                            </div>

                                            {/* Timeline Visualization */}
                                            <div className="relative">
                                                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                    {killChain.modules.map((module, index) => {
                                                        const totalTime = killChain.modules.reduce((acc, m) => {
                                                            const time = parseInt(m.estimatedTime.split('-')[1]) || 30;
                                                            return acc + time;
                                                        }, 0);
                                                        const moduleTime = parseInt(module.estimatedTime.split('-')[1]) || 30;
                                                        const width = (moduleTime / totalTime) * 100;

                                                        return (
                                                            <div
                                                                key={module.id}
                                                                className={`h-full inline-block ${getSeverityColor(module.severity)}`}
                                                                style={{ width: `${width}%` }}
                                                                title={`${module.name} - ${module.estimatedTime}`}
                                                            />
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Module Details */}
                                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                                {killChain.modules
                                                    .sort((a, b) => a.order - b.order)
                                                    .map((module, index) => {
                                                        const Icon = getIconComponent(module.icon);
                                                        const prevModulesTime = killChain.modules
                                                            .filter(m => m.order < module.order)
                                                            .reduce((acc, m) => acc + (parseInt(m.estimatedTime.split('-')[1]) || 30), 0);

                                                        return (
                                                            <div
                                                                key={module.id}
                                                                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${selectedModule?.id === module.id
                                                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                                                    }`}
                                                                onClick={() => setSelectedModule(module)}
                                                            >
                                                                <div className="flex items-center gap-2 flex-1">
                                                                    <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                                                        {module.order}
                                                                    </div>

                                                                    <div className={`p-2 rounded-lg ${getCategoryColor(module.category)}`}>
                                                                        <Icon className="w-4 h-4 text-white" />
                                                                    </div>

                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-sm font-medium truncate">{module.name}</p>
                                                                        <div className="flex items-center gap-2 mt-1">
                                                                            <Badge className={`${getSeverityColor(module.severity)} text-xs`}>
                                                                                {module.severity}
                                                                            </Badge>
                                                                            <span className="text-xs text-gray-500">
                                                                                {module.estimatedTime}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="text-right text-sm text-gray-500">
                                                                    <div>Start: T+{prevModulesTime}m</div>
                                                                    <div>End: T+{prevModulesTime + (parseInt(module.estimatedTime.split('-')[1]) || 30)}m</div>
                                                                </div>

                                                                <div className="flex flex-col items-center gap-1">
                                                                    {module.status === 'completed' && <CheckCircle className="w-4 h-4 text-green-500" />}
                                                                    {module.status === 'running' && <Clock className="w-4 h-4 text-blue-500 animate-spin" />}
                                                                    {module.status === 'error' && <AlertCircle className="w-4 h-4 text-red-500" />}
                                                                    {!module.status && <Circle className="w-4 h-4 text-gray-400" />}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                            </div>

                                            {/* Risk Assessment */}
                                            <div className="border-t pt-4">
                                                <div className="grid grid-cols-4 gap-4 text-center">
                                                    <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                                        <div className="text-2xl font-bold text-red-700 dark:text-red-400">
                                                            {killChain.modules.filter(m => m.severity === 'critical').length}
                                                        </div>
                                                        <div className="text-xs text-red-600 dark:text-red-400">Critical</div>
                                                    </div>

                                                    <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                                                        <div className="text-2xl font-bold text-orange-700 dark:text-orange-400">
                                                            {killChain.modules.filter(m => m.severity === 'high').length}
                                                        </div>
                                                        <div className="text-xs text-orange-600 dark:text-orange-400">High</div>
                                                    </div>

                                                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                                        <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">
                                                            {killChain.modules.filter(m => m.severity === 'medium').length}
                                                        </div>
                                                        <div className="text-xs text-yellow-600 dark:text-yellow-400">Medium</div>
                                                    </div>

                                                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                                        <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                                                            {killChain.modules.filter(m => m.severity === 'low').length}
                                                        </div>
                                                        <div className="text-xs text-green-600 dark:text-green-400">Low</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center h-64 text-gray-500">
                                            <div className="text-center space-y-3">
                                                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto">
                                                    <Clock className="w-8 h-8 text-gray-400" />
                                                </div>
                                                <div>
                                                    <p className="text-lg font-medium mb-1">No Timeline Available</p>
                                                    <p className="text-sm">Add modules to see the execution timeline</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>


                    {/* Настройки атаки */}
                    <TabsContent value="config" className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            {/* Основные параметры */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Основные параметры</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="attack-name">Название атаки *</Label>
                                        <Input
                                            id="attack-name"
                                            placeholder="Введите название атаки"
                                            value={attackName}
                                            onChange={(e) => setAttackName(e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="attack-description">Описание</Label>
                                        <Textarea
                                            id="attack-description"
                                            placeholder="Описание целей и задач атаки"
                                            value={attackDescription}
                                            onChange={(e) => setAttackDescription(e.target.value)}
                                            rows={3}
                                        />
                                    </div>

                                    <div>
                                        <Label>Цели атаки</Label>
                                        <div className="flex gap-2 mt-1">
                                            <Input
                                                placeholder="Добавить цель"
                                                value={newObjective}
                                                onChange={(e) => setNewObjective(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && addObjective()}
                                            />
                                            <Button onClick={addObjective} size="sm">
                                                <Plus className="w-4 h-4" />
                                            </Button>
                                        </div>

                                        {attackObjectives.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {attackObjectives.map((objective, index) => (
                                                    <Badge key={index} className="gap-1 bg-secondary text-secondary-foreground">
                                                        {objective}
                                                        <button onClick={() => removeObjective(objective)}>
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Параметры выполнения */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Параметры выполнения</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label>Приоритет выполнения</Label>
                                        <Select defaultValue="normal">
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="low">Низкий</SelectItem>
                                                <SelectItem value="normal">Обычный</SelectItem>
                                                <SelectItem value="high">Высокий</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label>Уровень скрытности</Label>
                                        <Select defaultValue="moderate">
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="silent">Бесшумно</SelectItem>
                                                <SelectItem value="quiet">Тихо</SelectItem>
                                                <SelectItem value="moderate">Умеренно</SelectItem>
                                                <SelectItem value="noisy">Шумно</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label>Максимальное время выполнения (часы)</Label>
                                        <Input type="number" defaultValue="24" min="1" max="168" />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-sm">Продолжать при ошибках</Label>
                                            <input type="checkbox" className="w-4 h-4" defaultChecked />
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <Label className="text-sm">Автоматическая очистка</Label>
                                            <input type="checkbox" className="w-4 h-4" />
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <Label className="text-sm">Подробное логирование</Label>
                                            <input type="checkbox" className="w-4 h-4" defaultChecked />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Цели атаки */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Цели атаки</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label>Тип цели</Label>
                                        <Select defaultValue="ip_range">
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="single_host">Один хост</SelectItem>
                                                <SelectItem value="ip_range">Диапазон IP</SelectItem>
                                                <SelectItem value="domain">Домен</SelectItem>
                                                <SelectItem value="subnet">Подсеть</SelectItem>
                                                <SelectItem value="url">URL</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label>Значение цели</Label>
                                        <Input placeholder="192.168.1.0/24" />
                                    </div>

                                    <div>
                                        <Label>Приоритет цели</Label>
                                        <Select defaultValue="medium">
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="low">Низкий</SelectItem>
                                                <SelectItem value="medium">Средний</SelectItem>
                                                <SelectItem value="high">Высокий</SelectItem>
                                                <SelectItem value="critical">Критический</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label>Заметки</Label>
                                        <Textarea placeholder="Дополнительная информация о цели" rows={3} />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Уведомления */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Уведомления</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-sm">При начале атаки</Label>
                                            <input type="checkbox" className="w-4 h-4" defaultChecked />
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <Label className="text-sm">При успешном завершении</Label>
                                            <input type="checkbox" className="w-4 h-4" defaultChecked />
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <Label className="text-sm">При ошибке</Label>
                                            <input type="checkbox" className="w-4 h-4" defaultChecked />
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <Label className="text-sm">При обнаружении</Label>
                                            <input type="checkbox" className="w-4 h-4" defaultChecked />
                                        </div>
                                    </div>

                                    <Separator />

                                    <div>
                                        <Label>Email для уведомлений</Label>
                                        <Input placeholder="admin@company.com" type="email" />
                                    </div>

                                    <div>
                                        <Label>Webhook URL</Label>
                                        <Input placeholder="https://api.company.com/webhooks/security" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Предпросмотр */}
                    <TabsContent value="preview" className="space-y-6">
                        <div className="grid grid-cols-3 gap-6">
                            {/* Обзор атаки */}
                            <Card className="col-span-2">
                                <CardHeader>
                                    <CardTitle className="text-lg">Обзор атаки</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div>
                                            <Label className="font-medium">Название:</Label>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {attackName || 'Не указано'}
                                            </p>
                                        </div>

                                        <div>
                                            <Label className="font-medium">Модули в цепочке:</Label>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {killChain.modules.length}
                                            </p>
                                        </div>

                                        <div>
                                            <Label className="font-medium">Ожидаемое время выполнения:</Label>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {killChain.estimatedDuration}
                                            </p>
                                        </div>

                                        <div>
                                            <Label className="font-medium">Уровень риска:</Label>
                                            <Badge className={`${getSeverityColor(killChain.riskLevel)} mt-1`}>
                                                {killChain.riskLevel.toUpperCase()}
                                            </Badge>
                                        </div>

                                        <div>
                                            <Label className="font-medium">Цели:</Label>
                                            {attackObjectives.length === 0 ? (
                                                <p className="text-sm text-gray-500 italic mt-1">
                                                    Цели не определены
                                                </p>
                                            ) : (
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {attackObjectives.map((objective, index) => (
                                                        <Badge key={index} className="text-xs border border-border bg-background">
                                                            {objective}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Статистика */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Статистика</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="text-center p-4 bg-blue-50 rounded">
                                            <div className="text-2xl font-bold text-blue-700">
                                                {killChain.modules.length}
                                            </div>
                                            <div className="text-sm text-blue-600">Модулей</div>
                                        </div>

                                        <div className="text-center p-4 bg-green-50 rounded">
                                            <div className="text-2xl font-bold text-green-700">
                                                {killChain.connections.length}
                                            </div>
                                            <div className="text-sm text-green-600">Связей</div>
                                        </div>

                                        <div className="text-center p-4 bg-orange-50 rounded">
                                            <div className="text-2xl font-bold text-orange-700">
                                                {killChain.modules.filter(m => m.severity === 'critical').length}
                                            </div>
                                            <div className="text-sm text-orange-600">Критических</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Последовательность выполнения */}
                            <Card className="col-span-3">
                                <CardHeader>
                                    <CardTitle className="text-lg">Последовательность выполнения</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {killChain.modules.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500">
                                            <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                            <p>Модули не добавлены</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {killChain.modules
                                                .sort((a, b) => a.order - b.order)
                                                .map((module) => {
                                                    const Icon = getIconComponent(module.icon);
                                                    return (
                                                        <div key={module.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                                            <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                                                {module.order}
                                                            </div>
                                                            <div className={`p-2 rounded-full ${getCategoryColor(module.category)}`}>
                                                                <Icon className="w-4 h-4" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium truncate">{module.name}</p>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <Badge className={`${getSeverityColor(module.severity)} text-xs`}>
                                                                        {module.severity}
                                                                    </Badge>
                                                                    <span className="text-xs text-gray-500">{module.estimatedTime}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>

                {/* Нижняя панель с действиями */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                {error && (
                                    <Alert className="border-red-200 bg-red-50">
                                        <AlertTriangle className="w-4 h-4 text-red-600" />
                                        <AlertDescription className="text-red-800">
                                            {error}
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                <Button variant="outline" onClick={() => router.back()}>
                                    Отмена
                                </Button>

                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        // Сохранить как черновик
                                        console.log('Saving draft...');
                                    }}
                                    disabled={loading}
                                >
                                    <Save className="w-4 h-4 mr-1" />
                                    Сохранить черновик
                                </Button>

                                <Button
                                    onClick={() => {
                                        // Валидация и сохранение
                                        if (!attackName.trim()) {
                                            setError('Название атаки обязательно');
                                            return;
                                        }

                                        if (killChain.modules.length === 0) {
                                            setError('Необходимо добавить хотя бы один модуль');
                                            return;
                                        }

                                        setLoading(true);
                                        // Здесь будет логика сохранения
                                        setTimeout(() => {
                                            setLoading(false);
                                            console.log('Attack chain saved:', {
                                                name: attackName,
                                                description: attackDescription,
                                                objectives: attackObjectives,
                                                chain: killChain
                                            });
                                        }, 2000);
                                    }}
                                    disabled={loading || killChain.modules.length === 0}
                                >
                                    {loading ? (
                                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                    ) : (
                                        <Play className="w-4 h-4 mr-1" />
                                    )}
                                    Создать атаку
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Скрытый элемент для drag preview */}
                <div
                    ref={dragItemRef}
                    className="fixed -top-96 left-0 bg-white border-2 border-blue-400 rounded-lg shadow-lg p-2 flex items-center gap-2 pointer-events-none"
                    style={{ zIndex: 9999 }}
                >
                    <Shield className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium">Attack Module</span>
                </div>
            </div>
        </TooltipProvider>
    );
};

export default CreateAttackPage;
