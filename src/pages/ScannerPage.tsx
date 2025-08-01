import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Layout компоненты
import Layout from '../components/layout/Layout';

// Компоненты Scanner  
import ScanForm from '../components/features/Scanner/ScanForm';
import ScanProgress from '../components/features/Scanner/ScanProgress';
import ScanResults from '../components/features/Scanner/ScanResults';

// Общие компоненты
import LoadingSpinner from '../components/common/LoadingSpinner';

// Хуки
import { useScanner } from '../hooks/useScanner';
import { useNotifications } from '../hooks/useNotifications';
import { useWebSocket } from '../hooks/useWebSocket';

// ИСПРАВЛЕНИЕ: Используем только существующие типы из scanner.tsx
import type {
    ScanRequest,
    ScanProgress as ScanProgressType
} from '../types/scanner';

// ИСПРАВЛЕНИЕ: Определяем отсутствующие типы локально
interface ScanData {
    target: string;
    ports: string;
    profile: string;
    options: Record<string, any>;
}


// Интерфейс состояния страницы
interface ScannerPageState {
    currentView: 'form' | 'progress' | 'results' | 'history';
    isLoading: boolean;
    error: string | null;
}

const ScannerPage: React.FC = () => {
    // Состояние страницы
    const [pageState, setPageState] = useState<ScannerPageState>({
        currentView: 'form',
        isLoading: false,
        error: null,
    });

    // Хуки - ИСПРАВЛЕНИЕ: убираем неиспользуемые переменные
    const { addNotification } = useNotifications();
    const {
        scanData,
        currentScan,
        scanHistory,
        scanProgress,
        isScanning,
        isInitialized,
        error: scannerError,
        startScan,
        stopScan,
        validateScanTarget,
        exportScanResults,
    } = useScanner();

    // WebSocket подключение
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8080';
    const { connectionStatus } = useWebSocket(wsUrl, {
        shouldConnect: isInitialized,
    });

    // ИСПРАВЛЕНИЕ: Обработчик для ScanForm
    const handleScanSubmit = useCallback(async (scanRequest: ScanRequest) => {
        try {
            setPageState(prev => ({ ...prev, isLoading: true, error: null }));

            // Преобразуем ScanRequest в ScanData для useScanner
            const scanSettings: ScanData = {
                target: scanRequest.targets,
                ports: scanRequest.ports || '1-1000',
                profile: scanRequest.scanType === 'quick' ? 'quick' :
                    scanRequest.scanType === 'comprehensive' ? 'thorough' : 'balanced',
                options: {
                    timing_template: scanRequest.timing === 'paranoid' ? 1 :
                        scanRequest.timing === 'sneaky' ? 2 :
                            scanRequest.timing === 'polite' ? 3 :
                                scanRequest.timing === 'normal' ? 4 :
                                    scanRequest.timing === 'aggressive' ? 5 : 6,
                    enable_scripts: scanRequest.scripts || false,
                    version_detection: scanRequest.serviceDetection || false,
                    os_detection: scanRequest.osDetection || false
                }
            };

            // Валидация цели
            const isValid = await validateScanTarget(scanSettings.target);
            if (!isValid) {
                throw new Error('Недопустимая цель сканирования');
            }

            // Запуск сканирования
            await startScan(scanSettings);

            addNotification({
                type: 'success',
                category: 'scan',
                priority: 'normal',
                title: 'Сканирование запущено',
                message: `Начато сканирование ${scanSettings.target}`
            });

            setPageState(prev => ({
                ...prev,
                currentView: 'progress',
                isLoading: false
            }));

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
            setPageState(prev => ({
                ...prev,
                error: errorMessage,
                isLoading: false
            }));

            addNotification({
                type: 'error',
                category: 'scan',
                priority: 'high',
                title: 'Ошибка запуска сканирования',
                message: errorMessage
            });
        }
    }, [validateScanTarget, startScan, addNotification]);

    const handleStopScan = useCallback(async () => {
        if (!currentScan?.id) return;

        try {
            await stopScan();

            addNotification({
                type: 'warning',
                category: 'scan',
                priority: 'normal',
                title: 'Сканирование остановлено',
                message: 'Сканирование было прервано пользователем'
            });

            setPageState(prev => ({ ...prev, currentView: 'form' }));
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Ошибка остановки сканирования';
            addNotification({
                type: 'error',
                category: 'scan',
                priority: 'high',
                title: 'Ошибка остановки',
                message: errorMessage
            });
        }
    }, [currentScan, stopScan, addNotification]);

    const handleViewResults = useCallback(() => {
        setPageState(prev => ({ ...prev, currentView: 'results' }));
    }, []);

    const handleExportResults = useCallback(async (format: 'json' | 'csv' | 'xml') => {
        if (!currentScan?.id) return;

        try {
            const exportFormat = format === 'xml' ? 'json' : format;
            await exportScanResults(currentScan.id, exportFormat as 'json' | 'csv' | 'excel' | 'pdf');

            addNotification({
                type: 'success',
                category: 'scan',
                priority: 'normal',
                title: 'Экспорт завершен',
                message: `Результаты экспортированы в формате ${format.toUpperCase()}`
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Ошибка экспорта';
            addNotification({
                type: 'error',
                category: 'scan',
                priority: 'high',
                title: 'Ошибка экспорта',
                message: errorMessage
            });
        }
    }, [currentScan, exportScanResults, addNotification]);

    // ИСПРАВЛЕНИЕ: Адаптер для ScanProgress с правильной типизацией
    const adaptedProgress = useMemo((): ScanProgressType | null => {
        if (!scanProgress) return null;

        // Создаем объект с обязательными полями согласно типу ScanProgressType
        const baseProgress: ScanProgressType = {
            scanId: scanProgress.scanId || 'unknown',
            status: 'running' as const,
            percentage: scanProgress.progress || 0,
            hostsScanned: scanProgress.completedTargets || 0,
            hostsTotal: scanProgress.totalTargets || 1,
            hostsUp: scanProgress.completedTargets || 0,
            hostsDown: 0,
            hostsFiltered: 0,
            openPorts: scanProgress.foundPorts || 0,
            closedPorts: 0,
            filteredPorts: 0,
            vulnerabilities: 0,
            elapsedTime: Math.floor((Date.now() - (currentScan?.startTime?.getTime() || Date.now())) / 1000),
            scanRate: scanProgress.completedTargets ? scanProgress.completedTargets / Math.max(1, Math.floor((Date.now() - (currentScan?.startTime?.getTime() || Date.now())) / 1000)) : 0,
            currentHost: scanProgress.currentTarget || scanData.target,
            currentHostIndex: scanProgress.completedTargets || 0,
            currentActivity: scanProgress.stage || 'Сканирование',
            currentPort: 0,
            currentService: '',
            phase: 'port_scan' as const,
            bytesReceived: 0,
            bytesSent: 0,
            packetsReceived: 0,
            packetsSent: 0,
            errors: [],
            warnings: [],
            recentDiscoveries: [],
            statistics: {
                totalHosts: scanProgress.totalTargets || 1,
                aliveHosts: scanProgress.completedTargets || 0,
                deadHosts: 0,
                totalPorts: 1000,
                openPorts: scanProgress.foundPorts || 0,
                closedPorts: 0,
                filteredPorts: 0,
                uniqueServices: 0,
                uniqueOperatingSystems: 0,
                vulnerabilitiesFound: 0,
                averageResponseTime: 0,
                maxResponseTime: 0,
                minResponseTime: 0,
                packetsPerSecond: 0,
                hostsPerMinute: scanProgress.completedTargets ? (scanProgress.completedTargets / Math.max(1, Math.floor((Date.now() - (currentScan?.startTime?.getTime() || Date.now())) / 60000))) : 0
            },
            performance: {
                cpuUsage: 0,
                memoryUsage: 0,
                networkUtilization: 0,
                ioOperations: 0,
                threadsActive: 0,
                bandwidthUsed: 0
            }
        };

        // Условно добавляем опциональные свойства для exactOptionalPropertyTypes
        const result: ScanProgressType = { ...baseProgress };

        if (scanProgress.estimatedTimeRemaining !== undefined &&
            scanProgress.estimatedTimeRemaining !== null &&
            typeof scanProgress.estimatedTimeRemaining === 'number') {
            result.estimatedTime = scanProgress.estimatedTimeRemaining;
        }

        return result;
    }, [scanProgress, scanData.target, currentScan?.startTime]);

    // Отслеживание завершения сканирования
    useEffect(() => {
        if (currentScan?.status === 'completed') {
            setPageState(prev => ({ ...prev, currentView: 'results' }));

            addNotification({
                type: 'success',
                category: 'scan',
                priority: 'normal',
                title: 'Сканирование завершено',
                message: `Сканирование ${scanData.target} успешно завершено`
            });
        } else if (currentScan?.status === 'failed') {
            setPageState(prev => ({ ...prev, currentView: 'form' }));

            addNotification({
                type: 'error',
                category: 'scan',
                priority: 'high',
                title: 'Сканирование не удалось',
                message: 'Сканирование завершилось с ошибкой'
            });
        }
    }, [currentScan?.status, scanData.target, addNotification]);

    // Обработка ошибок сканера
    useEffect(() => {
        if (scannerError) {
            setPageState(prev => ({ ...prev, error: scannerError }));
        }
    }, [scannerError]);

    // Загрузка при инициализации
    if (!isInitialized) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <LoadingSpinner size="lg" />
                    <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            Инициализация сканера
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300">
                            Подготовка системы к работе...
                        </p>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="space-y-6">
                {/* Заголовок страницы */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Сканер сети
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300">
                            Обнаружение устройств и анализ безопасности сети
                        </p>
                    </div>

                    {/* Индикатор подключения */}
                    <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${connectionStatus === 'connected'
                            ? 'bg-green-500'
                            : 'bg-red-500'
                            }`} />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                            {connectionStatus === 'connected' ? 'Подключено' : 'Отключено'}
                        </span>
                    </div>
                </div>

                {/* Навигация по разделам */}
                <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="-mb-px flex space-x-8">
                        {[
                            { key: 'form', label: 'Новое сканирование', icon: '🔍' },
                            { key: 'progress', label: 'Прогресс', icon: '⏳', disabled: !isScanning },
                            { key: 'results', label: 'Результаты', icon: '📊', disabled: !currentScan },
                            { key: 'history', label: 'История', icon: '📚' },
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                disabled={tab.disabled}
                                onClick={() => setPageState(prev => ({ ...prev, currentView: tab.key as any }))}
                                className={`
                  py-2 px-1 border-b-2 font-medium text-sm transition-colors
                  ${pageState.currentView === tab.key
                                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                    }
                  ${tab.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
                            >
                                <span className="mr-2">{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Отображение ошибок */}
                {pageState.error && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4"
                    >
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <span className="text-red-400">⚠️</span>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                                    Ошибка сканирования
                                </h3>
                                <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                                    {pageState.error}
                                </p>
                            </div>
                            <div className="ml-auto pl-3">
                                <button
                                    onClick={() => setPageState(prev => ({ ...prev, error: null }))}
                                    className="text-red-400 hover:text-red-600 transition-colors"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Основной контент */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={pageState.currentView}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        {pageState.currentView === 'form' && (
                            <ScanForm
                                onSubmit={handleScanSubmit}
                                loading={pageState.isLoading || isScanning}
                            />
                        )}

                        {pageState.currentView === 'progress' && adaptedProgress && (
                            <ScanProgress
                                progress={adaptedProgress}
                                onCancel={handleStopScan}
                                onViewResults={handleViewResults}
                            />
                        )}

                        {pageState.currentView === 'results' && scanHistory && scanHistory.length > 0 && (
                            <ScanResults
                                results={scanHistory}
                                onExport={handleExportResults}
                            />
                        )}

                        {pageState.currentView === 'history' && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    История сканирований
                                </h2>

                                {scanHistory && scanHistory.length > 0 ? (
                                    <div className="space-y-4">
                                        {scanHistory.map((scan, index) => (
                                            <div
                                                key={index}
                                                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-white">
                                                            {scan.ip}
                                                        </p>
                                                        <p className="text-sm text-gray-600 dark:text-gray-300">
                                                            {scan.scanTime}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${scan.status === 'up'
                                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                            }`}>
                                                            {scan.status === 'up' ? 'Онлайн' : 'Офлайн'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="text-gray-400 text-6xl mb-4">📚</div>
                                        <p className="text-gray-600 dark:text-gray-300">
                                            История сканирований пуста
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Информационная панель */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                            Активное сканирование
                        </h3>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {isScanning ? '1' : '0'}
                        </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                            Всего сканирований
                        </h3>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {scanHistory?.length || 0}
                        </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                            Статус подключения
                        </h3>
                        <p className={`text-2xl font-bold ${connectionStatus === 'connected'
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                            }`}>
                            {connectionStatus === 'connected' ? '🟢' : '🔴'}
                        </p>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default ScannerPage;
