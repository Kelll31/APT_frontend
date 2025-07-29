import React, { useState, useCallback, useMemo } from 'react';
import {
    Settings,
    Download,
    Trash2,
    AlertCircle,
    Search
} from 'lucide-react';

// Импорты компонентов
import { ScanForm } from '@/components/features/Scanner/ScanForm';
import { ScanProgress } from '@/components/features/Scanner/ScanProgress';
import { ScanResults } from '@/components/features/Scanner/ScanResults';
import { ScanStatusIndicator } from '@/components/common/StatusIndicator';
import { Button } from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import LoadingSpinner from '@/components/common/LoadingSpinner';

// Импорты хуков и сервисов
import { useScanner } from '@/hooks/useScanner';
import { useNotifications } from '@/hooks/useNotifications';
import { useWebSocket } from '@/hooks/useWebSocket';
import { scannerApi } from '@/services/scannerApi';

// Импорты типов из правильных источников
import type {
    ScanResult,
    ScanOptions,
    ScanProgress as ScanProgressType
} from '@/services/api';

// Интерфейс профиля сканирования для UI
interface ScanProfile {
    name: string;
    description: string;
    ports: string;
    options: ScanOptions;
    warnings: string[];
}

// Создать интерфейс ScanProgress
interface ScanProgress {
    // Свойства из хука useScanner
    percentage: number;
    phase: string;
    estimated_time?: number;

    // Свойства из API сервиса
    scan_id: string;
    current_phase: string;
    startTime: string;

    // Общие свойства
    message?: string;
    details?: Record<string, any>;
}

// Интерфейс сканирования
interface ScanResult {
    // Существующие свойства из API
    id: string;
    target: string;
    progress: number;
    created_at: string;

    // Дополнительные свойства, используемые в компоненте
    ip: string;
    state: 'up' | 'down' | 'filtered' | 'unknown';
    scanTime: string;
    openPorts: number[];
    reason?: string;
    status: 'completed' | 'running' | 'failed' | 'pending';
    ports?: Array<{
        port: number;
        state: string;
        service?: string;
        version?: string;
    }>;
}

// Профили сканирования на основе базовых ScanOptions[1]
const scanProfiles: Record<string, ScanProfile> = {
    quick: {
        name: 'Быстрое сканирование',
        description: 'Быстрая проверка основных портов и сервисов',
        ports: 'common',
        options: {
            timing_template: 'T4',
            enable_scripts: false,
            version_detection: false,
            os_detection: false,
            aggressive_mode: false,
            stealth_mode: false,
            no_resolve: true,
            max_retries: 1,
            scan_delay: 0,
            host_timeout: 30,
            max_parallel_hosts: 50,
            exclude_hosts: '',
            custom_scripts: '',
            extra_args: '',
            report_format: 'json'
        },
        warnings: []
    },
    balanced: {
        name: 'Сбалансированное сканирование',
        description: 'Оптимальное соотношение скорости и детализации',
        ports: '1-1000',
        options: {
            timing_template: 'T3',
            enable_scripts: true,
            version_detection: true,
            os_detection: false,
            aggressive_mode: false,
            stealth_mode: false,
            no_resolve: false,
            max_retries: 2,
            scan_delay: 0,
            host_timeout: 60,
            max_parallel_hosts: 25,
            exclude_hosts: '',
            custom_scripts: '',
            extra_args: '',
            report_format: 'json'
        },
        warnings: ['Среднее время выполнения']
    },
    thorough: {
        name: 'Подробное сканирование',
        description: 'Детальный анализ всех портов и сервисов',
        ports: '1-65535',
        options: {
            timing_template: 'T2',
            enable_scripts: true,
            version_detection: true,
            os_detection: true,
            aggressive_mode: false,
            stealth_mode: false,
            no_resolve: false,
            max_retries: 3,
            scan_delay: 0,
            host_timeout: 120,
            max_parallel_hosts: 10,
            exclude_hosts: '',
            custom_scripts: '',
            extra_args: '',
            report_format: 'json'
        },
        warnings: ['Длительное время выполнения', 'Высокая нагрузка на сеть']
    },
    stealth: {
        name: 'Скрытное сканирование',
        description: 'Незаметное сканирование с минимальным следом',
        ports: 'common',
        options: {
            timing_template: 'T1',
            enable_scripts: false,
            version_detection: false,
            os_detection: false,
            aggressive_mode: false,
            stealth_mode: true,
            no_resolve: true,
            max_retries: 1,
            scan_delay: 1000,
            host_timeout: 180,
            max_parallel_hosts: 5,
            exclude_hosts: '',
            custom_scripts: '',
            extra_args: '-f -D',
            report_format: 'json'
        },
        warnings: ['Очень медленное выполнение', 'Может быть обнаружено современными IDS']
    },
    aggressive: {
        name: 'Агрессивное сканирование',
        description: 'Максимально быстрое и подробное сканирование',
        ports: '1-65535',
        options: {
            timing_template: 'T5',
            enable_scripts: true,
            version_detection: true,
            os_detection: true,
            aggressive_mode: true,
            stealth_mode: false,
            no_resolve: false,
            max_retries: 1,
            scan_delay: 0,
            host_timeout: 15,
            max_parallel_hosts: 100,
            exclude_hosts: '',
            custom_scripts: '',
            extra_args: '-A',
            report_format: 'json'
        },
        warnings: ['Высокая вероятность обнаружения', 'Может перегрузить целевую сеть']
    }
};

interface PageState {
    selectedProfile: string;
    isSettingsOpen: boolean;
    selectedResult: ScanResult | null;
    isExporting: boolean;
    wsConnected: boolean;
}

export const ScannerPage: React.FC = () => {
    // Хуки - используем реальные свойства из useScanner
    const {
        scanData,
        updateScanData,
        isScanning,
        scanHistory,
        scanProgress,
        startScan,
        stopScan,
        deleteScan
    } = useScanner();

    const { addNotification } = useNotifications();
    const { connectionStatus } = useWebSocket('ws://localhost:8080/ws');

    // Состояние страницы
    const [pageState, setPageState] = useState<PageState>({
        selectedProfile: 'balanced',
        isSettingsOpen: false,
        selectedResult: null,
        isExporting: false,
        wsConnected: false
    });

    // Вычисляемые значения
    const wsConnected = useMemo(() => {
        return connectionStatus === 'connected';
    }, [connectionStatus]);

    const canStartScan = useMemo(() => {
        return !isScanning && wsConnected && scanData.target.trim() !== '';
    }, [isScanning, wsConnected, scanData.target]);

    // Функции валидации
    const validateTarget = useCallback((target: string): { isValid: boolean; errors: string[] } => {
        const errors: string[] = [];

        if (!target.trim()) {
            errors.push('Цель сканирования не может быть пустой');
            return { isValid: false, errors };
        }

        const ipPattern = /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/;
        const rangePattern = /^(\d{1,3}\.){3}\d{1,3}-(\d{1,3}\.){3}\d{1,3}$/;
        const hostnamePattern = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (!ipPattern.test(target) && !rangePattern.test(target) && !hostnamePattern.test(target)) {
            errors.push('Неверный формат цели. Используйте IP, CIDR, диапазон или доменное имя');
        }

        return { isValid: errors.length === 0, errors };
    }, []);

    const validatePorts = useCallback((ports: string): { isValid: boolean; errors: string[] } => {
        const errors: string[] = [];

        if (ports === 'common' || ports === 'all') {
            return { isValid: true, errors };
        }

        const portPattern = /^(\d+(-\d+)?,?)+$/;
        if (!portPattern.test(ports.replace(/\s/g, ''))) {
            errors.push('Неверный формат портов. Используйте: 80,443,1000-2000');
        }

        return { isValid: errors.length === 0, errors };
    }, []);

    // Обработчики событий
    const handleProfileChange = useCallback((profileKey: string) => {
        const profile = scanProfiles[profileKey];
        if (!profile) return;

        updateScanData({
            profile: profileKey,
            ports: profile.ports,
            options: profile.options
        });

        setPageState((prev: PageState) => ({
            ...prev,
            selectedProfile: profileKey
        }));
    }, [updateScanData]);

    const handleTargetChange = useCallback((target: string) => {
        updateScanData({ target });
    }, [updateScanData]);

    const handlePortsChange = useCallback((ports: string) => {
        updateScanData({ ports });
    }, [updateScanData]);

    const handleCustomPortsChange = useCallback((customPorts: string) => {
        updateScanData({ ports: customPorts });
    }, [updateScanData]);

    const handleOptionsChange = useCallback((options: Partial<ScanOptions>) => {
        updateScanData({
            options: { ...scanData.options, ...options }
        });
    }, [updateScanData, scanData.options]);

    const handleStartScan = useCallback(async () => {
        const targetValidation = validateTarget(scanData.target);
        if (!targetValidation.isValid) {
            addNotification({
                type: 'error',
                title: 'Ошибка валидации',
                message: targetValidation.errors.join(', '),
                category: 'system',
                priority: 'high'
            });
            return;
        }

        const portsValidation = validatePorts(scanData.ports);
        if (!portsValidation.isValid) {
            addNotification({
                type: 'warning',
                title: 'Предупреждение',
                message: portsValidation.errors.join(', '),
                category: 'system',
                priority: 'normal'
            });
            return;
        }

        try {
            addNotification({
                type: 'info',
                title: 'Сканирование запущено',
                message: `Начато сканирование цели: ${scanData.target}`,
                category: 'system',
                priority: 'normal'
            });

            await startScan(scanData);
        } catch (error) {
            addNotification({
                type: 'error',
                title: 'Ошибка запуска',
                message: error instanceof Error ? error.message : 'Неизвестная ошибка',
                category: 'system',
                priority: 'high'
            });
        }
    }, [scanData, validateTarget, validatePorts, addNotification, startScan]);

    const handleStopScan = useCallback(async () => {
        try {
            await stopScan();
            addNotification({
                type: 'info',
                title: 'Сканирование остановлено',
                message: 'Сканирование успешно остановлено пользователем',
                category: 'system',
                priority: 'low'
            });
        } catch (error) {
            addNotification({
                type: 'error',
                title: 'Ошибка остановки',
                message: error instanceof Error ? error.message : 'Не удалось остановить сканирование',
                category: 'system',
                priority: 'high'
            });
        }
    }, [stopScan, addNotification]);

    const handleClearResults = useCallback(async () => {
        try {
            if (scanHistory.length > 0) {
                await Promise.all(scanHistory.map(scan => deleteScan(scan.ip)));
            }
            addNotification({
                type: 'info',
                title: 'Результаты очищены',
                message: 'История сканирований успешно очищена',
                category: 'system',
                priority: 'low'
            });
        } catch (error) {
            addNotification({
                type: 'error',
                title: 'Ошибка очистки',
                message: error instanceof Error ? error.message : 'Не удалось очистить результаты',
                category: 'system',
                priority: 'normal'
            });
        }
    }, [deleteScan, scanHistory, addNotification]);



    const handleExportResult = useCallback(async (format: 'json' | 'csv' | 'excel' | 'pdf', result: ScanResult) => {
        setPageState((prev: PageState) => ({ ...prev, isExporting: true }));

        try {
            // Используем правильный API метод exportScanData
            const blob = await scannerApi.exportScanData({
                scan_ids: [result.ip], // Используем поле ip как идентификатор
                format: format,
                include_metadata: true,
                include_raw_results: true,
                filters: {
                    target: result.ip,
                    state: result.state,
                    scan_time: result.scanTime
                }
            });

            // Определяем расширение файла
            const fileExtension = format === 'excel' ? 'xlsx' : format;

            // Создаем ссылку для скачивания
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `scan_${result.ip}_${Date.now()}.${fileExtension}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            addNotification({
                type: 'success',
                title: 'Экспорт завершен',
                message: `Результаты экспортированы в формате ${format.toUpperCase()}`,
                category: 'system',
                priority: 'low'
            });
        } catch (error) {
            addNotification({
                type: 'error',
                title: 'Ошибка экспорта',
                message: error instanceof Error ? error.message : 'Не удалось экспортировать результаты',
                category: 'system',
                priority: 'normal'
            });
        } finally {
            setPageState((prev: PageState) => ({ ...prev, isExporting: false }));
        }
    }, [addNotification]);




    const handleDeleteResult = useCallback(async (result: ScanResult) => {
        try {
            await deleteScan(result.id);

            addNotification({
                type: 'info',
                title: 'Результат удален',
                message: 'Результат сканирования успешно удален',
                category: 'system',
                priority: 'low'
            });
        } catch (error) {
            addNotification({
                type: 'error',
                title: 'Ошибка удаления',
                message: error instanceof Error ? error.message : 'Не удалось удалить результат',
                category: 'system',
                priority: 'normal'
            });
        }
    }, [deleteScan, addNotification]);

    // Действия для панели инструментов
    const toolbarActions = useMemo(() => [
        {
            id: 'start',
            label: canStartScan ? 'Запустить сканирование' : 'Недоступно',
            action: handleStartScan,
            variant: 'primary' as const,
            disabled: !canStartScan
        },
        {
            id: 'stop',
            label: 'Остановить',
            action: handleStopScan,
            variant: 'danger' as const,
            disabled: !isScanning
        },
        {
            id: 'clear',
            label: 'Очистить результаты',
            action: handleClearResults,
            variant: 'secondary' as const,
            disabled: scanHistory.length === 0
        }
    ], [canStartScan, handleStartScan, isScanning, handleStopScan, handleClearResults, scanHistory.length]);

    // Функция форматирования даты
    const formatDate = (timestamp: string | number) => {
        return new Date(timestamp).toLocaleString('ru-RU');
    };

    // Создание совместимого объекта прогресса для компонента ScanProgress
    const createProgressData = (progress: ScanProgressType): any => {
        return {
            status: 'running',
            percentage: progress.progress || 0,
            hostsScanned: 0,
            hostsTotal: 1,
            portsScanned: progress.ports_found || 0,
            portsTotal: 65535,
            currentHost: scanData.target,
            currentPort: 0,
            startTime: progress.startTime || Date.now(),
            estimatedTimeRemaining: progress.eta || 0,
            scanSpeed: 0,
            errors: [],
            warnings: [],
            phase: progress.current_phase || 'scanning',
            threads: 1,
            packetsPerSecond: 0,
            bytesTransferred: 0,
            vulnerability_count: 0,
            service_detection_progress: 0,
            os_detection_progress: 0,
            script_scan_progress: 0
        };
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Заголовок страницы */}
            <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                Профессиональное сканирование портов и обнаружение сервисов
                            </h1>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                {scanProfiles[pageState.selectedProfile]?.description || 'Выберите профиль сканирования'}
                            </p>
                            {scanProfiles[pageState.selectedProfile]?.warnings && scanProfiles[pageState.selectedProfile].warnings.length > 0 && (
                                <div className="mt-2 flex items-center space-x-2">
                                    <AlertCircle className="h-4 w-4 text-amber-500" />
                                    <span className="text-sm text-amber-600 dark:text-amber-400">
                                        {scanProfiles[pageState.selectedProfile].warnings.join(', ')}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Статус соединения */}
                        <div className="flex items-center space-x-4">
                            <ScanStatusIndicator
                                isActive={wsConnected}
                                className={wsConnected ? 'text-green-500' : 'text-red-500'}
                            />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                {wsConnected ? 'Подключено' : 'Отключено'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Основной контент */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Левая панель - Форма сканирования */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                        Параметры сканирования
                                    </h2>
                                    <button
                                        onClick={() => setPageState((prev: PageState) => ({ ...prev, isSettingsOpen: true }))}
                                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                    >
                                        <Settings className="h-5 w-5" />
                                    </button>
                                </div>

                                {/* Используем правильные пропсы для ScanForm */}
                                <ScanForm
                                    selectedProfile={pageState.selectedProfile}
                                    availableProfiles={scanProfiles}
                                    onTargetChange={handleTargetChange}
                                    onPortsChange={handlePortsChange}
                                    onProfileChange={handleProfileChange}
                                    onCustomPortsChange={handleCustomPortsChange}
                                    onOptionsChange={handleOptionsChange}
                                    onStart={handleStartScan}
                                    isScanning={isScanning}
                                    disabled={!wsConnected}
                                />

                                {/* Панель действий */}
                                <div className="mt-6 space-y-3">
                                    {toolbarActions.map(action => (
                                        <Button
                                            key={action.id}
                                            onClick={action.action}
                                            variant={action.variant}
                                            disabled={action.disabled}
                                            className="w-full"
                                        >
                                            {action.label}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Правая панель - Прогресс и результаты */}
                    <div className="lg:col-span-2">
                        {/* Прогресс сканирования */}
                        {(isScanning || scanProgress) && (
                            <div className="mb-8">
                                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                                    <div className="p-6">
                                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                            Прогресс сканирования
                                        </h2>
                                        {scanProgress && (
                                            <ScanProgress
                                                progress={createProgressData(scanProgress)}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Результаты сканирования */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                        Результаты сканирования
                                    </h2>
                                    {scanHistory.length > 0 && (
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                                Всего: {scanHistory.length}
                                            </span>
                                            <button
                                                onClick={handleClearResults}
                                                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                                title="Очистить все результаты"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {scanHistory.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                            Нет результатов сканирования
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-400">
                                            Запустите сканирование, чтобы увидеть результаты здесь
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {scanHistory.map((result: ScanResult) => (
                                            <div
                                                key={result.ip} // Используем ip вместо id
                                                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                            >
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="flex-shrink-0">
                                                            <ScanStatusIndicator
                                                                isActive={result.state === 'up'} // Используем state вместо status
                                                                className={result.state === 'up' ? 'text-green-500' :
                                                                    result.state === 'down' ? 'text-red-500' : 'text-yellow-500'}
                                                            />
                                                        </div>
                                                        <div>
                                                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                                                {result.ip} {/* Используем ip вместо target */}
                                                            </h4>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                {formatDate(result.scanTime)} {/* Используем scanTime вместо created_at */}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                                            Портов: {Array.isArray(result.openPorts) ? result.openPorts.length : 0} {/* Правильный подсчет портов */}
                                                        </span>
                                                        <button
                                                            onClick={() => setPageState((prev: PageState) => ({ ...prev, selectedResult: result }))}
                                                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                                                        >
                                                            Подробнее
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Краткая информация о результате */}
                                                <div className="grid grid-cols-3 gap-4 text-sm">
                                                    <div>
                                                        <span className="text-gray-500 dark:text-gray-400">Статус:</span>
                                                        <span className={`ml-2 ${result.state === 'up' ? 'text-green-600 dark:text-green-400' :
                                                            result.state === 'down' ? 'text-red-600 dark:text-red-400' :
                                                                'text-yellow-600 dark:text-yellow-400'
                                                            }`}>
                                                            {result.state === 'up' ? 'Онлайн' :
                                                                result.state === 'down' ? 'Офлайн' :
                                                                    result.state === 'filtered' ? 'Фильтрован' : 'Неизвестно'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500 dark:text-gray-400">Причина:</span>
                                                        <span className="ml-2 text-gray-900 dark:text-white">
                                                            {result.reason || 'Не указана'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <ScanStatusIndicator
                                                            isActive={pageState.wsConnected}
                                                            className={pageState.wsConnected ? 'text-green-500' : 'text-red-500'}
                                                        />
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                                            {pageState.wsConnected ? 'Синхронизировано' : 'Не синхронизировано'}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Кнопки действий */}
                                                <div className="mt-3 flex items-center space-x-2">
                                                    <button
                                                        onClick={() => handleExportResult('json', result)}
                                                        disabled={pageState.isExporting}
                                                        className="inline-flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                                                    >
                                                        <Download className="h-3 w-3 mr-1" />
                                                        JSON
                                                    </button>
                                                    <button
                                                        onClick={() => handleExportResult('csv', result)}
                                                        disabled={pageState.isExporting}
                                                        className="inline-flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                                                    >
                                                        <Download className="h-3 w-3 mr-1" />
                                                        CSV
                                                    </button>
                                                    <button
                                                        onClick={() => handleExportResult('excel', result)}
                                                        disabled={pageState.isExporting}
                                                        className="inline-flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                                                    >
                                                        <Download className="h-3 w-3 mr-1" />
                                                        Excel
                                                    </button>
                                                    <button
                                                        onClick={() => handleExportResult('pdf', result)}
                                                        disabled={pageState.isExporting}
                                                        className="inline-flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                                                    >
                                                        <Download className="h-3 w-3 mr-1" />
                                                        PDF
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteResult(result)}
                                                        className="inline-flex items-center px-3 py-1 border border-red-300 dark:border-red-600 rounded-md text-xs font-medium text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30"
                                                    >
                                                        <Trash2 className="h-3 w-3 mr-1" />
                                                        Удалить
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Модальное окно с подробными результатами */}
            {pageState.selectedResult && (
                <Modal
                    isOpen={true}
                    onClose={() => setPageState((prev: PageState) => ({ ...prev, selectedResult: null }))}
                    title={`Результаты сканирования: ${pageState.selectedResult.ip}`} {/* Используем ip вместо target */}
                    size="lg"
                >
                    <ScanResults
                        results={[pageState.selectedResult]}
                        onExport={(format: 'json' | 'csv' | 'excel' | 'pdf') => handleExportResult(format, pageState.selectedResult!)}
                    />
                </Modal>
            )}


            {/* Индикатор загрузки при экспорте */}
            {pageState.isExporting && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 flex items-center space-x-3">
                        <LoadingSpinner size="sm" />
                        <span className="text-gray-900 dark:text-white">Экспорт данных...</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ScannerPage;
