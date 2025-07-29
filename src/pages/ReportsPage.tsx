import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'

// Компоненты
import Card from '@/components/common/Card'
import Button from '@/components/common/Button'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import StatusIndicator from '@/components/common/StatusIndicator'
import ProgressBar from '@/components/common/ProgressBar'
import Modal from '@/components/common/Modal'
import Toast from '@/components/common/Toast'
import ReportsList from '@/components/features/Reports/ReportsList'
import ReportViewer from '@/components/features/Reports/ReportViewer'
import ReportExport from '@/components/features/Reports/ReportExport'
import VulnerabilityCard from '@/components/features/Reports/VulnerabilityCard'

// Хуки
import { useReports } from '@/hooks/useReports'
import { useNotifications } from '@/hooks/useNotifications'
import { useTheme } from '@/hooks/useTheme'
import { useWebSocket } from '@/hooks/useWebSocket'
import { useLocalStorage } from '@/hooks/useLocalStorage'

// Сервисы
import { reportsApi } from '@/services/reportsApi'

// Типы
import type { Report, ReportFilter, ReportStats, Vulnerability, ScanResult } from '@/types/reports'

// Утилиты
import { formatDuration, formatFileSize, formatDate } from '@/utils/formatters'

// Интерфейсы
interface ReportsPageState {
    selectedReport: Report | null;
    selectedVulnerabilities: Set<string>;
    showExportModal: boolean;
    showDeleteConfirm: boolean;
    reportToDelete: Report | null;
    bulkActions: {
        enabled: boolean;
        selectedReports: Set<string>;
    };
}

interface SortConfig {
    field: 'date' | 'target' | 'severity' | 'vulnerabilities' | 'size';
    direction: 'asc' | 'desc';
}

const ReportsPage: React.FC = () => {
    // URL параметры и навигация
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    // Основное состояние
    const [pageState, setPageState] = useState<ReportsPageState>({
        selectedReport: null,
        selectedVulnerabilities: new Set(),
        showExportModal: false,
        showDeleteConfirm: false,
        reportToDelete: null,
        bulkActions: {
            enabled: false,
            selectedReports: new Set()
        }
    });

    // Фильтры и поиск
    const [filters, setFilters] = useLocalStorage<ReportFilter>('reportsFilters', {
        search: '',
        severity: 'all',
        status: 'all',
        dateRange: 'all',
        target: '',
        vulnerabilityType: 'all',
        tags: []
    });

    // Сортировка
    const [sortConfig, setSortConfig] = useState<SortConfig>({
        field: 'date',
        direction: 'desc'
    });

    // UI состояние
    const [viewMode, setViewMode] = useState<'grid' | 'list' | 'detailed'>('grid');
    const [showFilters, setShowFilters] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [reportStats, setReportStats] = useState<ReportStats>({
        totalReports: 0,
        totalVulnerabilities: 0,
        criticalVulnerabilities: 0,
        highVulnerabilities: 0,
        mediumVulnerabilities: 0,
        lowVulnerabilities: 0,
        averageScore: 0,
        recentScans: 0,
        storageUsed: 0
    });

    // Хуки
    const { theme } = useTheme();
    const { addNotification } = useNotifications();
    const { isConnected: wsConnected } = useWebSocket();
    const {
        reports,
        isLoading: reportsLoading,
        loadReports,
        deleteReport,
        exportReport,
        totalReports
    } = useReports();

    // Загрузка данных при монтировании
    useEffect(() => {
        initializeReportsPage();
    }, []);

    // Обновление URL при изменении фильтров
    useEffect(() => {
        updateURLParams();
    }, [filters, sortConfig, viewMode]);

    // WebSocket подписки
    useEffect(() => {
        if (wsConnected) {
            const unsubscribe = setupReportsWebSocketListeners();
            return unsubscribe;
        }
    }, [wsConnected]);

    // Инициализация страницы
    const initializeReportsPage = useCallback(async () => {
        try {
            setIsLoading(true);

            // Восстанавливаем состояние из URL
            restoreStateFromURL();

            // Параллельная загрузка данных
            await Promise.allSettled([
                loadReports(),
                loadReportStats(),
                checkStorageUsage()
            ]);

        } catch (error) {
            console.error('Ошибка инициализации страницы отчетов:', error);
            addNotification({
                type: 'error',
                title: 'Ошибка загрузки',
                message: 'Не удалось загрузить данные отчетов'
            });
        } finally {
            setIsLoading(false);
        }
    }, [loadReports, addNotification]);

    // Восстановление состояния из URL
    const restoreStateFromURL = useCallback(() => {
        const search = searchParams.get('search') || '';
        const severity = searchParams.get('severity') || 'all';
        const status = searchParams.get('status') || 'all';
        const view = searchParams.get('view') as 'grid' | 'list' | 'detailed' || 'grid';
        const sort = searchParams.get('sort') || 'date';
        const order = searchParams.get('order') as 'asc' | 'desc' || 'desc';

        if (search || severity !== 'all' || status !== 'all') {
            setFilters(prev => ({
                ...prev,
                search,
                severity,
                status
            }));
        }

        setViewMode(view);
        setSortConfig({
            field: sort as SortConfig['field'],
            direction: order
        });
    }, [searchParams]);

    // Обновление URL параметров
    const updateURLParams = useCallback(() => {
        const params = new URLSearchParams();

        if (filters.search) params.set('search', filters.search);
        if (filters.severity !== 'all') params.set('severity', filters.severity);
        if (filters.status !== 'all') params.set('status', filters.status);
        if (viewMode !== 'grid') params.set('view', viewMode);
        if (sortConfig.field !== 'date') params.set('sort', sortConfig.field);
        if (sortConfig.direction !== 'desc') params.set('order', sortConfig.direction);

        setSearchParams(params, { replace: true });
    }, [filters, viewMode, sortConfig, setSearchParams]);

    // Загрузка статистики отчетов
    const loadReportStats = useCallback(async () => {
        try {
            const stats = await reportsApi.getReportStats();
            setReportStats(stats);
        } catch (error) {
            console.error('Ошибка загрузки статистики отчетов:', error);
        }
    }, []);

    // Проверка использования хранилища
    const checkStorageUsage = useCallback(async () => {
        try {
            const usage = await reportsApi.getStorageUsage();
            setReportStats(prev => ({
                ...prev,
                storageUsed: usage.used
            }));
        } catch (error) {
            console.error('Ошибка получения информации о хранилище:', error);
        }
    }, []);

    // Настройка WebSocket слушателей
    const setupReportsWebSocketListeners = useCallback(() => {
        console.log('🔌 Настройка WebSocket слушателей для отчетов');

        // Здесь будет интеграция с WebSocket для получения уведомлений о новых отчетах

        return () => {
            console.log('🔌 Отключение WebSocket слушателей отчетов');
        };
    }, []);

    // Фильтрация отчетов
    const filteredReports = useMemo(() => {
        if (!reports) return [];

        return reports.filter(report => {
            // Поиск
            if (filters.search) {
                const searchTerm = filters.search.toLowerCase();
                const searchableFields = [
                    report.target,
                    report.scanType,
                    report.title,
                    ...(report.tags || [])
                ].filter(Boolean);

                if (!searchableFields.some(field =>
                    field.toLowerCase().includes(searchTerm)
                )) {
                    return false;
                }
            }

            // Фильтр по серьезности
            if (filters.severity !== 'all') {
                const maxSeverity = Math.max(
                    ...report.vulnerabilities.map(v => v.severity === 'critical' ? 4 :
                        v.severity === 'high' ? 3 :
                            v.severity === 'medium' ? 2 : 1)
                );
                const requiredLevel = filters.severity === 'critical' ? 4 :
                    filters.severity === 'high' ? 3 :
                        filters.severity === 'medium' ? 2 : 1;

                if (maxSeverity < requiredLevel) {
                    return false;
                }
            }

            // Фильтр по статусу
            if (filters.status !== 'all' && report.status !== filters.status) {
                return false;
            }

            // Фильтр по цели
            if (filters.target && !report.target.includes(filters.target)) {
                return false;
            }

            // Фильтр по дате
            if (filters.dateRange !== 'all') {
                const reportDate = new Date(report.createdAt);
                const now = new Date();
                const daysDiff = (now.getTime() - reportDate.getTime()) / (1000 * 60 * 60 * 24);

                switch (filters.dateRange) {
                    case 'today':
                        if (daysDiff > 1) return false;
                        break;
                    case 'week':
                        if (daysDiff > 7) return false;
                        break;
                    case 'month':
                        if (daysDiff > 30) return false;
                        break;
                }
            }

            return true;
        });
    }, [reports, filters]);

    // Сортировка отчетов
    const sortedReports = useMemo(() => {
        return [...filteredReports].sort((a, b) => {
            let comparison = 0;

            switch (sortConfig.field) {
                case 'date':
                    comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                    break;
                case 'target':
                    comparison = a.target.localeCompare(b.target);
                    break;
                case 'severity':
                    const getSeverityWeight = (report: Report) => {
                        return Math.max(...report.vulnerabilities.map(v =>
                            v.severity === 'critical' ? 4 :
                                v.severity === 'high' ? 3 :
                                    v.severity === 'medium' ? 2 : 1
                        ));
                    };
                    comparison = getSeverityWeight(a) - getSeverityWeight(b);
                    break;
                case 'vulnerabilities':
                    comparison = a.vulnerabilities.length - b.vulnerabilities.length;
                    break;
                case 'size':
                    comparison = (a.fileSize || 0) - (b.fileSize || 0);
                    break;
            }

            return sortConfig.direction === 'asc' ? comparison : -comparison;
        });
    }, [filteredReports, sortConfig]);

    // Обработчик изменения фильтров
    const handleFilterChange = useCallback((key: keyof ReportFilter, value: any) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    }, [setFilters]);

    // Обработчик изменения сортировки
    const handleSortChange = useCallback((field: SortConfig['field']) => {
        setSortConfig(prev => ({
            field,
            direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    }, []);

    // Обработчик просмотра отчета
    const handleViewReport = useCallback((report: Report) => {
        setPageState(prev => ({
            ...prev,
            selectedReport: report
        }));
    }, []);

    // Обработчик экспорта отчета
    const handleExportReport = useCallback(async (report: Report, format: 'pdf' | 'json' | 'csv' | 'xml') => {
        try {
            const loadingNotification = addNotification({
                type: 'loading',
                title: 'Экспорт отчета',
                message: `Подготовка файла ${format.toUpperCase()}...`
            });

            const result = await exportReport(report.id, format);

            if (loadingNotification?.hide) {
                loadingNotification.hide();
            }

            // Создаем ссылку для скачивания
            const blob = new Blob([result.data], { type: result.mimeType });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = result.filename;
            link.click();
            URL.revokeObjectURL(url);

            addNotification({
                type: 'success',
                title: 'Экспорт завершен',
                message: `Отчет сохранен как ${result.filename}`
            });
        } catch (error) {
            addNotification({
                type: 'error',
                title: 'Ошибка экспорта',
                message: error instanceof Error ? error.message : 'Не удалось экспортировать отчет'
            });
        }
    }, [exportReport, addNotification]);

    // Обработчик удаления отчета
    const handleDeleteReport = useCallback(async (report: Report) => {
        setPageState(prev => ({
            ...prev,
            showDeleteConfirm: true,
            reportToDelete: report
        }));
    }, []);

    // Подтверждение удаления отчета
    const confirmDeleteReport = useCallback(async () => {
        if (!pageState.reportToDelete) return;

        try {
            await deleteReport(pageState.reportToDelete.id);

            addNotification({
                type: 'success',
                title: 'Отчет удален',
                message: `Отчет для ${pageState.reportToDelete.target} удален успешно`
            });

            // Обновляем статистику
            await loadReportStats();
        } catch (error) {
            addNotification({
                type: 'error',
                title: 'Ошибка удаления',
                message: 'Не удалось удалить отчет'
            });
        } finally {
            setPageState(prev => ({
                ...prev,
                showDeleteConfirm: false,
                reportToDelete: null
            }));
        }
    }, [pageState.reportToDelete, deleteReport, addNotification, loadReportStats]);

    // Групповые операции
    const handleBulkDelete = useCallback(async () => {
        const selectedIds = Array.from(pageState.bulkActions.selectedReports);
        if (selectedIds.length === 0) return;

        try {
            const loadingNotification = addNotification({
                type: 'loading',
                title: 'Удаление отчетов',
                message: `Удаление ${selectedIds.length} отчетов...`
            });

            await Promise.all(selectedIds.map(id => deleteReport(id)));

            if (loadingNotification?.hide) {
                loadingNotification.hide();
            }

            addNotification({
                type: 'success',
                title: 'Отчеты удалены',
                message: `Успешно удалено ${selectedIds.length} отчетов`
            });

            // Сбрасываем выделение
            setPageState(prev => ({
                ...prev,
                bulkActions: {
                    enabled: false,
                    selectedReports: new Set()
                }
            }));

            await loadReportStats();
        } catch (error) {
            addNotification({
                type: 'error',
                title: 'Ошибка удаления',
                message: 'Не удалось удалить некоторые отчеты'
            });
        }
    }, [pageState.bulkActions.selectedReports, deleteReport, addNotification, loadReportStats]);

    // Обработчик очистки фильтров
    const clearFilters = useCallback(() => {
        setFilters({
            search: '',
            severity: 'all',
            status: 'all',
            dateRange: 'all',
            target: '',
            vulnerabilityType: 'all',
            tags: []
        });
    }, [setFilters]);

    // Рендер загрузки
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center space-y-4">
                    <LoadingSpinner size="xl" />
                    <div className="space-y-2">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                            Загрузка отчетов
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Получение данных о результатах сканирования...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 lg:p-6">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Заголовок страницы */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                            📊 Отчеты сканирования
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Управление и анализ результатов тестирования безопасности
                        </p>
                    </div>

                    <div className="flex items-center space-x-3 mt-4 lg:mt-0">
                        <StatusIndicator
                            status={wsConnected ? 'online' : 'offline'}
                            label={wsConnected ? 'Обновления в реальном времени' : 'Offline режим'}
                        />

                        {pageState.bulkActions.enabled && pageState.bulkActions.selectedReports.size > 0 && (
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    Выбрано: {pageState.bulkActions.selectedReports.size}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleBulkDelete}
                                    className="text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                    🗑️ Удалить выбранные
                                </Button>
                            </div>
                        )}

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPageState(prev => ({ ...prev, showExportModal: true }))}
                            disabled={sortedReports.length === 0}
                        >
                            📁 Экспорт
                        </Button>
                    </div>
                </div>

                {/* Статистика */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                    <Card className="p-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                {reportStats.totalReports}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                Всего отчетов
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                                {reportStats.criticalVulnerabilities}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                Критических
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                {reportStats.highVulnerabilities}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                Высоких
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                                {reportStats.mediumVulnerabilities}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                Средних
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {reportStats.lowVulnerabilities}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                Низких
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4">
                        <div className="text-center">
                            <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                                {reportStats.averageScore.toFixed(1)}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                Средний балл
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                                {reportStats.recentScans}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                За неделю
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4">
                        <div className="text-center">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {formatFileSize(reportStats.storageUsed)}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                Хранилище
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Панель управления */}
                <Card>
                    <div className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

                            {/* Поиск и фильтры */}
                            <div className="flex flex-col sm:flex-row gap-4 flex-1">
                                <div className="relative flex-1">
                                    <input
                                        type="text"
                                        value={filters.search}
                                        onChange={(e) => handleFilterChange('search', e.target.value)}
                                        placeholder="Поиск по цели, типу сканирования или тегам..."
                                        className="
                      w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 
                      rounded-lg bg-white dark:bg-gray-800 
                      text-gray-900 dark:text-gray-100
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                      placeholder-gray-400 dark:placeholder-gray-500
                    "
                                    />
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-400">🔍</span>
                                    </div>
                                </div>

                                <select
                                    value={filters.severity}
                                    onChange={(e) => handleFilterChange('severity', e.target.value)}
                                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                >
                                    <option value="all">Все уровни</option>
                                    <option value="critical">Критические</option>
                                    <option value="high">Высокие</option>
                                    <option value="medium">Средние</option>
                                    <option value="low">Низкие</option>
                                </select>

                                <select
                                    value={filters.status}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                >
                                    <option value="all">Все статусы</option>
                                    <option value="completed">Завершенные</option>
                                    <option value="processing">Обрабатываются</option>
                                    <option value="failed">С ошибками</option>
                                </select>

                                <select
                                    value={filters.dateRange}
                                    onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                >
                                    <option value="all">Все время</option>
                                    <option value="today">Сегодня</option>
                                    <option value="week">Неделя</option>
                                    <option value="month">Месяц</option>
                                </select>
                            </div>

                            {/* Управление отображением */}
                            <div className="flex items-center space-x-3">
                                {(filters.search || filters.severity !== 'all' || filters.status !== 'all' || filters.dateRange !== 'all') && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={clearFilters}
                                    >
                                        ✕ Очистить
                                    </Button>
                                )}

                                <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`px-3 py-1 text-sm rounded-md transition-colors ${viewMode === 'grid'
                                                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                                                : 'text-gray-600 dark:text-gray-400'
                                            }`}
                                    >
                                        🔲 Сетка
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`px-3 py-1 text-sm rounded-md transition-colors ${viewMode === 'list'
                                                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                                                : 'text-gray-600 dark:text-gray-400'
                                            }`}
                                    >
                                        📝 Список
                                    </button>
                                    <button
                                        onClick={() => setViewMode('detailed')}
                                        className={`px-3 py-1 text-sm rounded-md transition-colors ${viewMode === 'detailed'
                                                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                                                : 'text-gray-600 dark:text-gray-400'
                                            }`}
                                    >
                                        📄 Детально
                                    </button>
                                </div>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPageState(prev => ({
                                        ...prev,
                                        bulkActions: {
                                            ...prev.bulkActions,
                                            enabled: !prev.bulkActions.enabled
                                        }
                                    }))}
                                >
                                    {pageState.bulkActions.enabled ? '✕ Отменить выделение' : '☑️ Множественный выбор'}
                                </Button>
                            </div>
                        </div>

                        {/* Сортировка */}
                        <div className="mt-4 flex items-center space-x-4">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Сортировать по:</span>
                            {(['date', 'target', 'severity', 'vulnerabilities', 'size'] as const).map(field => (
                                <button
                                    key={field}
                                    onClick={() => handleSortChange(field)}
                                    className={`text-sm font-medium transition-colors ${sortConfig.field === field
                                            ? 'text-blue-600 dark:text-blue-400'
                                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                                        }`}
                                >
                                    {field === 'date' && 'Дате'}
                                    {field === 'target' && 'Цели'}
                                    {field === 'severity' && 'Серьезности'}
                                    {field === 'vulnerabilities' && 'Уязвимостям'}
                                    {field === 'size' && 'Размеру'}
                                    {sortConfig.field === field && (
                                        <span className="ml-1">
                                            {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </Card>

                {/* Результаты */}
                {reportsLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <LoadingSpinner size="lg" />
                    </div>
                ) : sortedReports.length === 0 ? (
                    <Card>
                        <div className="p-12 text-center">
                            <div className="text-6xl mb-4">📊</div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                {filters.search || filters.severity !== 'all' || filters.status !== 'all' || filters.dateRange !== 'all'
                                    ? 'Отчеты не найдены'
                                    : 'Нет отчетов сканирования'
                                }
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                {filters.search || filters.severity !== 'all' || filters.status !== 'all' || filters.dateRange !== 'all'
                                    ? 'Попробуйте изменить критерии поиска или очистить фильтры'
                                    : 'Запустите сканирование для создания первого отчета'
                                }
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                {(filters.search || filters.severity !== 'all' || filters.status !== 'all' || filters.dateRange !== 'all') && (
                                    <Button onClick={clearFilters}>
                                        ✕ Очистить фильтры
                                    </Button>
                                )}
                                <Button onClick={() => navigate('/scanner')}>
                                    🔍 Начать сканирование
                                </Button>
                            </div>
                        </div>
                    </Card>
                ) : (
                    <ReportsList
                        reports={sortedReports}
                        viewMode={viewMode}
                        bulkSelection={{
                            enabled: pageState.bulkActions.enabled,
                            selectedIds: pageState.bulkActions.selectedReports,
                            onSelectionChange: (reportId, selected) => {
                                setPageState(prev => {
                                    const newSelected = new Set(prev.bulkActions.selectedReports);
                                    if (selected) {
                                        newSelected.add(reportId);
                                    } else {
                                        newSelected.delete(reportId);
                                    }
                                    return {
                                        ...prev,
                                        bulkActions: {
                                            ...prev.bulkActions,
                                            selectedReports: newSelected
                                        }
                                    };
                                });
                            }
                        }}
                        onViewReport={handleViewReport}
                        onExportReport={handleExportReport}
                        onDeleteReport={handleDeleteReport}
                    />
                )}

                {/* Пагинация */}
                {sortedReports.length > 0 && (
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            Показано {sortedReports.length} из {totalReports} отчетов
                        </div>
                        {totalReports > sortedReports.length && (
                            <Button
                                variant="outline"
                                onClick={() => {
                                    // Здесь будет логика загрузки дополнительных отчетов
                                }}
                            >
                                Показать больше
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {/* Модальное окно просмотра отчета */}
            {pageState.selectedReport && (
                <Modal
                    isOpen={true}
                    onClose={() => setPageState(prev => ({ ...prev, selectedReport: null }))}
                    title={`Отчет: ${pageState.selectedReport.target}`}
                    size="xl"
                >
                    <ReportViewer
                        report={pageState.selectedReport}
                        onExport={(format) => handleExportReport(pageState.selectedReport!, format)}
                        onClose={() => setPageState(prev => ({ ...prev, selectedReport: null }))}
                    />
                </Modal>
            )}

            {/* Модальное окно экспорта */}
            {pageState.showExportModal && (
                <Modal
                    isOpen={true}
                    onClose={() => setPageState(prev => ({ ...prev, showExportModal: false }))}
                    title="Экспорт отчетов"
                >
                    <ReportExport
                        reports={sortedReports}
                        onExport={(reports, format) => {
                            // Массовый экспорт отчетов
                            reports.forEach(report => handleExportReport(report, format));
                            setPageState(prev => ({ ...prev, showExportModal: false }));
                        }}
                        onClose={() => setPageState(prev => ({ ...prev, showExportModal: false }))}
                    />
                </Modal>
            )}

            {/* Модальное окно подтверждения удаления */}
            {pageState.showDeleteConfirm && pageState.reportToDelete && (
                <Modal
                    isOpen={true}
                    onClose={() => setPageState(prev => ({
                        ...prev,
                        showDeleteConfirm: false,
                        reportToDelete: null
                    }))}
                    title="Подтверждение удаления"
                >
                    <div className="space-y-4">
                        <p className="text-gray-600 dark:text-gray-400">
                            Вы уверены, что хотите удалить отчет для <strong>{pageState.reportToDelete.target}</strong>?
                        </p>

                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                            <div className="flex items-start space-x-3">
                                <span className="text-yellow-600 dark:text-yellow-400 text-lg">⚠️</span>
                                <div>
                                    <h4 className="font-medium text-yellow-800 dark:text-yellow-200">
                                        Внимание
                                    </h4>
                                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                                        Это действие нельзя отменить. Все данные сканирования будут потеряны навсегда.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3">
                            <Button
                                variant="outline"
                                onClick={() => setPageState(prev => ({
                                    ...prev,
                                    showDeleteConfirm: false,
                                    reportToDelete: null
                                }))}
                            >
                                Отменить
                            </Button>
                            <Button
                                onClick={confirmDeleteReport}
                                className="bg-red-600 hover:bg-red-700 text-white"
                            >
                                🗑️ Удалить отчет
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default ReportsPage;
