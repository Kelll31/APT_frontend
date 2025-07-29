import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

// Компоненты
import Card from '@/components/common/Card'
import Button from '@/components/common/Button'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import StatusIndicator from '@/components/common/StatusIndicator'
import ProgressBar from '@/components/common/ProgressBar'
import Modal from '@/components/common/Modal'
import NetworkMap from '@/components/features/Network/NetworkMap'
import DeviceCard from '@/components/features/Network/DeviceCard'
import TopologyView from '@/components/features/Network/TopologyView'

// Хуки
import { useNotifications } from '@/hooks/useNotifications'
import { useTheme } from '@/hooks/useTheme'
import { useWebSocket } from '@/hooks/useWebSocket'
import { useLocalStorage } from '@/hooks/useLocalStorage'

// Сервисы API
import { networkApi } from '@/services/networkApi'
import { reconApi } from '@/services/reconApi'

// Типы
import type { NetworkDevice, NetworkInterface, ScanProgress, ReconSettings } from '@/types/network'

// Утилиты
import { formatDuration, formatFileSize } from '@/utils/formatters'
import { validateNetworkRange } from '@/utils/validators'

// Интерфейсы
interface ReconStats {
    activeDevices: number;
    inactiveDevices: number;
    totalDevices: number;
    openPorts: number;
    scanTime: number;
    networksScanned: number;
    servicesDiscovered: number;
}

interface NetworkRange {
    id: string;
    name: string;
    range: string;
    description: string;
    suggested?: boolean;
}

const ReconPage: React.FC = () => {
    // URL параметры
    const [searchParams, setSearchParams] = useSearchParams();

    // Основное состояние
    const [isScanning, setIsScanning] = useState(false);
    const [scanProgress, setScanProgress] = useState<ScanProgress | null>(null);
    const [devices, setDevices] = useState<NetworkDevice[]>([]);
    const [networkInterfaces, setNetworkInterfaces] = useState<NetworkInterface[]>([]);
    const [reconStats, setReconStats] = useState<ReconStats>({
        activeDevices: 0,
        inactiveDevices: 0,
        totalDevices: 0,
        openPorts: 0,
        scanTime: 0,
        networksScanned: 0,
        servicesDiscovered: 0
    });

    // Настройки сканирования
    const [reconSettings, setReconSettings] = useLocalStorage<ReconSettings>('reconSettings', {
        selectedInterface: '',
        scanType: 'ping_sweep',
        networkRange: '',
        scanPorts: false,
        portRange: '1-1000',
        detectOS: false,
        detectServices: false,
        aggressiveMode: false,
        timeout: 3000,
        maxThreads: 50,
        excludeHosts: ''
    });

    // UI состояние
    const [selectedView, setSelectedView] = useState<'grid' | 'list' | 'topology'>('grid');
    const [selectedDevices, setSelectedDevices] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState('');
    const [deviceFilters, setDeviceFilters] = useState({
        status: 'all', // all, online, offline
        type: 'all', // all, router, server, workstation, mobile, iot
        manufacturer: 'all'
    });
    const [sortBy, setSortBy] = useState<'ip' | 'hostname' | 'lastSeen' | 'manufacturer'>('ip');
    const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
    const [showDeviceDetails, setShowDeviceDetails] = useState<NetworkDevice | null>(null);

    // Хуки
    const { theme } = useTheme();
    const { addNotification } = useNotifications();
    const { isConnected: wsConnected } = useWebSocket();

    // Предустановленные сетевые диапазоны
    const networkRanges = useMemo<NetworkRange[]>(() => [
        {
            id: 'local-192',
            name: 'Локальная сеть (192.168.x.x)',
            range: '192.168.1.0/24',
            description: 'Стандартная домашняя/офисная сеть',
            suggested: true
        },
        {
            id: 'local-10',
            name: 'Корпоративная сеть (10.x.x.x)',
            range: '10.0.0.0/24',
            description: 'Корпоративная сеть класса A'
        },
        {
            id: 'local-172',
            name: 'Приватная сеть (172.16.x.x)',
            range: '172.16.0.0/24',
            description: 'Приватная сеть класса B'
        },
        {
            id: 'custom',
            name: 'Пользовательский диапазон',
            range: '',
            description: 'Указать диапазон вручную'
        }
    ], []);

    // Загрузка сетевых интерфейсов при монтировании
    useEffect(() => {
        loadNetworkInterfaces();
        loadSavedDevices();

        // Восстанавливаем активное сканирование если есть
        const activeScanId = localStorage.getItem('activeReconScanId');
        if (activeScanId) {
            restoreActiveScan(activeScanId);
        }
    }, []);

    // WebSocket подписки
    useEffect(() => {
        if (wsConnected && isScanning) {
            // Подписываемся на события разведки
            const unsubscribe = setupReconWebSocketListeners();
            return unsubscribe;
        }
    }, [wsConnected, isScanning]);

    // Загрузка сетевых интерфейсов
    const loadNetworkInterfaces = useCallback(async () => {
        try {
            const interfaces = await networkApi.getInterfaces();
            setNetworkInterfaces(interfaces);

            // Автоматически выбираем активный интерфейс
            if (interfaces.length > 0 && !reconSettings.selectedInterface) {
                const activeInterface = interfaces.find(iface => iface.is_up && !iface.is_loopback) || interfaces[0];
                setReconSettings(prev => ({
                    ...prev,
                    selectedInterface: activeInterface.name,
                    networkRange: activeInterface.network || '192.168.1.0/24'
                }));
            }
        } catch (error) {
            console.error('Ошибка загрузки сетевых интерфейсов:', error);
            addNotification({
                type: 'error',
                title: 'Ошибка загрузки',
                message: 'Не удалось получить список сетевых интерфейсов'
            });
        }
    }, [reconSettings.selectedInterface, addNotification]);

    // Загрузка сохраненных устройств
    const loadSavedDevices = useCallback(async () => {
        try {
            const savedDevices = await reconApi.getDiscoveredDevices();
            setDevices(savedDevices);
            updateStatsFromDevices(savedDevices);
        } catch (error) {
            console.error('Ошибка загрузки устройств:', error);
        }
    }, []);

    // Восстановление активного сканирования
    const restoreActiveScan = useCallback(async (scanId: string) => {
        try {
            const scanStatus = await reconApi.getScanStatus(scanId);
            if (scanStatus.status === 'running') {
                setIsScanning(true);
                setScanProgress(scanStatus.progress);

                addNotification({
                    type: 'info',
                    title: 'Восстановлено сканирование',
                    message: 'Продолжение активного сканирования сети'
                });
            } else {
                localStorage.removeItem('activeReconScanId');
            }
        } catch (error) {
            localStorage.removeItem('activeReconScanId');
        }
    }, [addNotification]);

    // Настройка WebSocket слушателей
    const setupReconWebSocketListeners = useCallback(() => {
        // Здесь будет интеграция с WebSocket для получения событий разведки
        console.log('🔌 Настройка WebSocket слушателей для разведки');

        return () => {
            console.log('🔌 Отключение WebSocket слушателей разведки');
        };
    }, []);

    // Запуск сканирования сети
    const handleStartScan = useCallback(async () => {
        if (isScanning) {
            addNotification({
                type: 'warning',
                title: 'Сканирование активно',
                message: 'Дождитесь завершения текущего сканирования'
            });
            return;
        }

        // Валидация настроек
        if (!reconSettings.selectedInterface) {
            addNotification({
                type: 'error',
                title: 'Ошибка настроек',
                message: 'Выберите сетевой интерфейс'
            });
            return;
        }

        if (!reconSettings.networkRange) {
            addNotification({
                type: 'error',
                title: 'Ошибка настроек',
                message: 'Укажите сетевой диапазон для сканирования'
            });
            return;
        }

        // Валидация сетевого диапазона
        if (!validateNetworkRange(reconSettings.networkRange)) {
            addNotification({
                type: 'error',
                title: 'Неверный диапазон',
                message: 'Укажите корректный сетевой диапазон (например, 192.168.1.0/24)'
            });
            return;
        }

        try {
            setIsScanning(true);
            setScanProgress({ progress: 0, phase: 'Инициализация...', startTime: Date.now() });

            // Очищаем предыдущие результаты
            setDevices([]);
            setReconStats(prev => ({
                ...prev,
                activeDevices: 0,
                inactiveDevices: 0,
                totalDevices: 0,
                openPorts: 0
            }));

            const loadingNotification = addNotification({
                type: 'loading',
                title: 'Запуск сканирования',
                message: `Начинаем разведку сети ${reconSettings.networkRange}...`
            });

            const response = await reconApi.startNetworkScan(reconSettings);

            if (loadingNotification?.hide) {
                loadingNotification.hide();
            }

            if (response.success) {
                localStorage.setItem('activeReconScanId', response.scan_id);

                addNotification({
                    type: 'success',
                    title: 'Сканирование запущено',
                    message: `ID сканирования: ${response.scan_id}`,
                    actions: [{
                        label: 'Остановить',
                        icon: '🛑',
                        handler: () => handleStopScan()
                    }]
                });

                // Запускаем polling прогресса
                startProgressPolling(response.scan_id);
            } else {
                throw new Error(response.message || 'Неизвестная ошибка запуска');
            }
        } catch (error) {
            setIsScanning(false);
            setScanProgress(null);

            addNotification({
                type: 'error',
                title: 'Ошибка запуска',
                message: error instanceof Error ? error.message : 'Не удалось запустить сканирование'
            });
        }
    }, [isScanning, reconSettings, addNotification]);

    // Остановка сканирования
    const handleStopScan = useCallback(async () => {
        const activeScanId = localStorage.getItem('activeReconScanId');
        if (!activeScanId) return;

        try {
            await reconApi.stopScan(activeScanId);

            setIsScanning(false);
            setScanProgress(null);
            localStorage.removeItem('activeReconScanId');

            addNotification({
                type: 'info',
                title: 'Сканирование остановлено',
                message: 'Команда остановки отправлена'
            });
        } catch (error) {
            addNotification({
                type: 'error',
                title: 'Ошибка остановки',
                message: 'Не удалось остановить сканирование'
            });
        }
    }, [addNotification]);

    // Polling прогресса сканирования
    const startProgressPolling = useCallback((scanId: string) => {
        const pollInterval = setInterval(async () => {
            try {
                const status = await reconApi.getScanStatus(scanId);

                setScanProgress(status.progress);

                if (status.devices) {
                    setDevices(status.devices);
                    updateStatsFromDevices(status.devices);
                }

                if (status.status === 'completed' || status.status === 'failed') {
                    clearInterval(pollInterval);
                    setIsScanning(false);
                    localStorage.removeItem('activeReconScanId');

                    if (status.status === 'completed') {
                        addNotification({
                            type: 'success',
                            title: 'Сканирование завершено',
                            message: `Обнаружено устройств: ${status.devices?.length || 0}`
                        });
                    } else {
                        addNotification({
                            type: 'error',
                            title: 'Сканирование не удалось',
                            message: status.error || 'Неизвестная ошибка'
                        });
                    }
                }
            } catch (error) {
                console.error('Ошибка polling прогресса:', error);
                clearInterval(pollInterval);
                setIsScanning(false);
            }
        }, 2000);

        // Очистка при размонтировании
        return () => clearInterval(pollInterval);
    }, [addNotification]);

    // Обновление статистики из устройств
    const updateStatsFromDevices = useCallback((deviceList: NetworkDevice[]) => {
        const stats = deviceList.reduce((acc, device) => ({
            activeDevices: acc.activeDevices + (device.status === 'online' ? 1 : 0),
            inactiveDevices: acc.inactiveDevices + (device.status === 'offline' ? 1 : 0),
            totalDevices: acc.totalDevices + 1,
            openPorts: acc.openPorts + (device.openPorts?.length || 0),
            scanTime: Math.max(acc.scanTime, device.lastSeen ? Date.now() - new Date(device.lastSeen).getTime() : 0),
            networksScanned: acc.networksScanned,
            servicesDiscovered: acc.servicesDiscovered + (device.services?.length || 0)
        }), {
            activeDevices: 0,
            inactiveDevices: 0,
            totalDevices: 0,
            openPorts: 0,
            scanTime: 0,
            networksScanned: 1,
            servicesDiscovered: 0
        });

        setReconStats(stats);
    }, []);

    // Фильтрация устройств
    const filteredDevices = useMemo(() => {
        return devices.filter(device => {
            // Поиск
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const searchableFields = [
                    device.ip,
                    device.hostname,
                    device.manufacturer,
                    device.deviceType,
                    ...(device.services?.map(s => s.name) || [])
                ].filter(Boolean);

                if (!searchableFields.some(field => field.toLowerCase().includes(query))) {
                    return false;
                }
            }

            // Фильтр по статусу
            if (deviceFilters.status !== 'all' && device.status !== deviceFilters.status) {
                return false;
            }

            // Фильтр по типу
            if (deviceFilters.type !== 'all' && device.deviceType !== deviceFilters.type) {
                return false;
            }

            // Фильтр по производителю
            if (deviceFilters.manufacturer !== 'all' && device.manufacturer !== deviceFilters.manufacturer) {
                return false;
            }

            return true;
        });
    }, [devices, searchQuery, deviceFilters]);

    // Сортировка устройств
    const sortedDevices = useMemo(() => {
        return [...filteredDevices].sort((a, b) => {
            switch (sortBy) {
                case 'ip':
                    return a.ip.localeCompare(b.ip, undefined, { numeric: true });
                case 'hostname':
                    return (a.hostname || '').localeCompare(b.hostname || '');
                case 'lastSeen':
                    return new Date(b.lastSeen || 0).getTime() - new Date(a.lastSeen || 0).getTime();
                case 'manufacturer':
                    return (a.manufacturer || '').localeCompare(b.manufacturer || '');
                default:
                    return 0;
            }
        });
    }, [filteredDevices, sortBy]);

    // Обработчик выбора сетевого диапазона
    const handleNetworkRangeSelect = useCallback((rangeId: string) => {
        const selectedRange = networkRanges.find(range => range.id === rangeId);
        if (selectedRange && selectedRange.range) {
            setReconSettings(prev => ({
                ...prev,
                networkRange: selectedRange.range
            }));
        }
    }, [networkRanges]);

    // Обработчик экспорта результатов
    const handleExportResults = useCallback(async (format: 'json' | 'csv' | 'xml') => {
        try {
            const data = await reconApi.exportResults(devices, format);

            const blob = new Blob([data], {
                type: format === 'json' ? 'application/json' :
                    format === 'csv' ? 'text/csv' :
                        'application/xml'
            });

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `recon-results-${new Date().toISOString().split('T')[0]}.${format}`;
            a.click();
            URL.revokeObjectURL(url);

            addNotification({
                type: 'success',
                title: 'Экспорт завершен',
                message: `Результаты сохранены в формате ${format.toUpperCase()}`
            });
        } catch (error) {
            addNotification({
                type: 'error',
                title: 'Ошибка экспорта',
                message: 'Не удалось экспортировать результаты'
            });
        }
    }, [devices, addNotification]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 lg:p-6">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Заголовок страницы */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                            🗺️ Разведка сети
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Обнаружение и анализ устройств в локальной сети
                        </p>
                    </div>

                    <div className="flex items-center space-x-3 mt-4 lg:mt-0">
                        <StatusIndicator
                            status={wsConnected ? 'online' : 'offline'}
                            label={wsConnected ? 'WebSocket подключен' : 'WebSocket отключен'}
                        />
                        {devices.length > 0 && (
                            <div className="flex items-center space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleExportResults('json')}
                                >
                                    📁 Экспорт
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Статистика */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    <Card className="p-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {reconStats.activeDevices}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                Активных устройств
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                                {reconStats.inactiveDevices}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                Неактивных
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                {reconStats.openPorts}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                Открытых портов
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                {reconStats.servicesDiscovered}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                Сервисов
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4">
                        <div className="text-center">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {isScanning && scanProgress ? formatDuration((Date.now() - scanProgress.startTime) / 1000) :
                                    reconStats.scanTime > 0 ? formatDuration(reconStats.scanTime / 1000) : '0с'}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                Время сканирования
                            </div>
                        </div>
                    </Card>

                    <Card className="p-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                {reconStats.networksScanned}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                Сетей
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Основной контент */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                    {/* Настройки сканирования */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card>
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                                    ⚙️ Настройки сканирования
                                </h3>

                                <div className="space-y-4">
                                    {/* Сетевой интерфейс */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Сетевой интерфейс
                                        </label>
                                        <select
                                            value={reconSettings.selectedInterface}
                                            onChange={(e) => setReconSettings(prev => ({ ...prev, selectedInterface: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                            disabled={isScanning}
                                        >
                                            <option value="">Выберите интерфейс</option>
                                            {networkInterfaces.map(iface => (
                                                <option key={iface.name} value={iface.name}>
                                                    {iface.name} ({iface.ip}) {iface.is_up ? '🟢' : '🔴'}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Сетевой диапазон */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Сетевой диапазон
                                        </label>
                                        <div className="space-y-2">
                                            {networkRanges.map(range => (
                                                <label
                                                    key={range.id}
                                                    className="flex items-center space-x-2 cursor-pointer"
                                                >
                                                    <input
                                                        type="radio"
                                                        name="networkRange"
                                                        value={range.id}
                                                        checked={range.range === reconSettings.networkRange ||
                                                            (range.id === 'custom' && !networkRanges.some(r => r.range === reconSettings.networkRange))}
                                                        onChange={() => handleNetworkRangeSelect(range.id)}
                                                        disabled={isScanning}
                                                        className="text-blue-600"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                            {range.name} {range.suggested && '⭐'}
                                                        </div>
                                                        <div className="text-xs text-gray-600 dark:text-gray-400">
                                                            {range.description}
                                                        </div>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>

                                        {/* Пользовательский диапазон */}
                                        <input
                                            type="text"
                                            value={reconSettings.networkRange}
                                            onChange={(e) => setReconSettings(prev => ({ ...prev, networkRange: e.target.value }))}
                                            placeholder="192.168.1.0/24"
                                            className="mt-2 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                            disabled={isScanning}
                                        />
                                    </div>

                                    {/* Тип сканирования */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Тип сканирования
                                        </label>
                                        <select
                                            value={reconSettings.scanType}
                                            onChange={(e) => setReconSettings(prev => ({ ...prev, scanType: e.target.value as any }))}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                            disabled={isScanning}
                                        >
                                            <option value="ping_sweep">Ping сканирование</option>
                                            <option value="arp_scan">ARP сканирование</option>
                                            <option value="tcp_syn">TCP SYN сканирование</option>
                                            <option value="comprehensive">Комплексное сканирование</option>
                                        </select>
                                    </div>

                                    {/* Дополнительные опции */}
                                    <div className="space-y-3">
                                        <label className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                checked={reconSettings.scanPorts}
                                                onChange={(e) => setReconSettings(prev => ({ ...prev, scanPorts: e.target.checked }))}
                                                disabled={isScanning}
                                                className="rounded text-blue-600"
                                            />
                                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                                Сканировать порты
                                            </span>
                                        </label>

                                        <label className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                checked={reconSettings.detectServices}
                                                onChange={(e) => setReconSettings(prev => ({ ...prev, detectServices: e.target.checked }))}
                                                disabled={isScanning}
                                                className="rounded text-blue-600"
                                            />
                                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                                Определять сервисы
                                            </span>
                                        </label>

                                        <label className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                checked={reconSettings.detectOS}
                                                onChange={(e) => setReconSettings(prev => ({ ...prev, detectOS: e.target.checked }))}
                                                disabled={isScanning}
                                                className="rounded text-blue-600"
                                            />
                                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                                Определение ОС
                                            </span>
                                        </label>
                                    </div>

                                    {/* Расширенные настройки */}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                                        className="w-full"
                                    >
                                        {showAdvancedSettings ? '📦 Скрыть' : '🔧 Расширенные настройки'}
                                    </Button>

                                    {showAdvancedSettings && (
                                        <div className="space-y-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Таймаут (мс)
                                                </label>
                                                <input
                                                    type="number"
                                                    value={reconSettings.timeout}
                                                    onChange={(e) => setReconSettings(prev => ({ ...prev, timeout: parseInt(e.target.value) }))}
                                                    min={1000}
                                                    max={10000}
                                                    step={500}
                                                    disabled={isScanning}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Макс. потоков
                                                </label>
                                                <input
                                                    type="number"
                                                    value={reconSettings.maxThreads}
                                                    onChange={(e) => setReconSettings(prev => ({ ...prev, maxThreads: parseInt(e.target.value) }))}
                                                    min={1}
                                                    max={200}
                                                    disabled={isScanning}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                                />
                                            </div>

                                            {reconSettings.scanPorts && (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                        Диапазон портов
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={reconSettings.portRange}
                                                        onChange={(e) => setReconSettings(prev => ({ ...prev, portRange: e.target.value }))}
                                                        placeholder="1-1000,8080,8443"
                                                        disabled={isScanning}
                                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Кнопки управления */}
                                <div className="mt-6 flex space-x-3">
                                    {!isScanning ? (
                                        <Button
                                            onClick={handleStartScan}
                                            className="flex-1"
                                            disabled={!reconSettings.selectedInterface || !reconSettings.networkRange}
                                        >
                                            🚀 Запустить сканирование
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={handleStopScan}
                                            variant="outline"
                                            className="flex-1 text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                        >
                                            🛑 Остановить
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </Card>

                        {/* Прогресс сканирования */}
                        {isScanning && scanProgress && (
                            <Card>
                                <div className="p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                                        ⏳ Выполнение сканирования
                                    </h3>

                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                                                <span>{scanProgress.phase}</span>
                                                <span>{scanProgress.progress}%</span>
                                            </div>
                                            <ProgressBar
                                                progress={scanProgress.progress}
                                                className="h-2"
                                            />
                                        </div>

                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                            Время: {formatDuration((Date.now() - scanProgress.startTime) / 1000)}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        )}
                    </div>

                    {/* Результаты */}
                    <div className="lg:col-span-3 space-y-6">

                        {/* Управление результатами */}
                        <Card>
                            <div className="p-6">
                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                    <div className="flex items-center space-x-4">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                            🖥️ Обнаруженные устройства ({sortedDevices.length})
                                        </h3>

                                        {/* Переключатель вида */}
                                        <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                                            <button
                                                onClick={() => setSelectedView('grid')}
                                                className={`px-3 py-1 text-sm rounded-md transition-colors ${selectedView === 'grid'
                                                        ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                                                        : 'text-gray-600 dark:text-gray-400'
                                                    }`}
                                            >
                                                🔲 Сетка
                                            </button>
                                            <button
                                                onClick={() => setSelectedView('list')}
                                                className={`px-3 py-1 text-sm rounded-md transition-colors ${selectedView === 'list'
                                                        ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                                                        : 'text-gray-600 dark:text-gray-400'
                                                    }`}
                                            >
                                                📝 Список
                                            </button>
                                            <button
                                                onClick={() => setSelectedView('topology')}
                                                className={`px-3 py-1 text-sm rounded-md transition-colors ${selectedView === 'topology'
                                                        ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                                                        : 'text-gray-600 dark:text-gray-400'
                                                    }`}
                                            >
                                                🗺️ Топология
                                            </button>
                                        </div>
                                    </div>

                                    {/* Поиск и фильтры */}
                                    <div className="flex items-center space-x-3">
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Поиск устройств..."
                                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                        />

                                        <select
                                            value={deviceFilters.status}
                                            onChange={(e) => setDeviceFilters(prev => ({ ...prev, status: e.target.value }))}
                                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                        >
                                            <option value="all">Все статусы</option>
                                            <option value="online">Онлайн</option>
                                            <option value="offline">Офлайн</option>
                                        </select>

                                        <select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value as any)}
                                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                        >
                                            <option value="ip">Сортировка по IP</option>
                                            <option value="hostname">По имени хоста</option>
                                            <option value="lastSeen">По времени обнаружения</option>
                                            <option value="manufacturer">По производителю</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Отображение устройств */}
                        {sortedDevices.length === 0 ? (
                            <Card>
                                <div className="p-12 text-center">
                                    {isScanning ? (
                                        <div className="space-y-4">
                                            <LoadingSpinner size="lg" />
                                            <div className="space-y-2">
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                                    Сканирование сети...
                                                </h3>
                                                <p className="text-gray-600 dark:text-gray-400">
                                                    Поиск устройств в указанном диапазоне
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="text-6xl">🔍</div>
                                            <div className="space-y-2">
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                                    Нет обнаруженных устройств
                                                </h3>
                                                <p className="text-gray-600 dark:text-gray-400">
                                                    Запустите сканирование сети для обнаружения устройств
                                                </p>
                                            </div>
                                            <Button
                                                onClick={handleStartScan}
                                                disabled={!reconSettings.selectedInterface || !reconSettings.networkRange}
                                            >
                                                🚀 Начать сканирование
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        ) : (
                            <>
                                {/* Сетка устройств */}
                                {selectedView === 'grid' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                        {sortedDevices.map(device => (
                                            <DeviceCard
                                                key={device.ip}
                                                device={device}
                                                onSelect={(device) => setShowDeviceDetails(device)}
                                                isSelected={selectedDevices.has(device.ip)}
                                                onToggleSelect={(ip) => {
                                                    const newSelected = new Set(selectedDevices);
                                                    if (newSelected.has(ip)) {
                                                        newSelected.delete(ip);
                                                    } else {
                                                        newSelected.add(ip);
                                                    }
                                                    setSelectedDevices(newSelected);
                                                }}
                                            />
                                        ))}
                                    </div>
                                )}

                                {/* Список устройств */}
                                {selectedView === 'list' && (
                                    <Card>
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                                <thead className="bg-gray-50 dark:bg-gray-800">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                            IP адрес
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                            Hostname
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                            Статус
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                            MAC адрес
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                            Производитель
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                            Открытые порты
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                            Действия
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                                    {sortedDevices.map(device => (
                                                        <tr key={device.ip} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                {device.ip}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                                                {device.hostname || '-'}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <StatusIndicator
                                                                    status={device.status === 'online' ? 'online' : 'offline'}
                                                                    size="sm"
                                                                />
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 font-mono">
                                                                {device.macAddress || '-'}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                                                {device.manufacturer || '-'}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                                                {device.openPorts?.length || 0}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                                <button
                                                                    onClick={() => setShowDeviceDetails(device)}
                                                                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                                                >
                                                                    Подробнее
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </Card>
                                )}

                                {/* Топология сети */}
                                {selectedView === 'topology' && (
                                    <Card>
                                        <div className="p-6">
                                            <TopologyView devices={sortedDevices} />
                                        </div>
                                    </Card>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Модальное окно с деталями устройства */}
            {showDeviceDetails && (
                <Modal
                    isOpen={true}
                    onClose={() => setShowDeviceDetails(null)}
                    title={`Устройство ${showDeviceDetails.ip}`}
                    size="lg"
                >
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    IP адрес
                                </label>
                                <div className="text-sm text-gray-900 dark:text-gray-100 font-mono">
                                    {showDeviceDetails.ip}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Статус
                                </label>
                                <StatusIndicator
                                    status={showDeviceDetails.status === 'online' ? 'online' : 'offline'}
                                    label={showDeviceDetails.status === 'online' ? 'Онлайн' : 'Офлайн'}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Hostname
                                </label>
                                <div className="text-sm text-gray-900 dark:text-gray-100">
                                    {showDeviceDetails.hostname || 'Неизвестно'}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    MAC адрес
                                </label>
                                <div className="text-sm text-gray-900 dark:text-gray-100 font-mono">
                                    {showDeviceDetails.macAddress || 'Неизвестно'}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Производитель
                                </label>
                                <div className="text-sm text-gray-900 dark:text-gray-100">
                                    {showDeviceDetails.manufacturer || 'Неизвестно'}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Тип устройства
                                </label>
                                <div className="text-sm text-gray-900 dark:text-gray-100">
                                    {showDeviceDetails.deviceType || 'Неизвестно'}
                                </div>
                            </div>
                        </div>

                        {/* Открытые порты */}
                        {showDeviceDetails.openPorts && showDeviceDetails.openPorts.length > 0 && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Открытые порты ({showDeviceDetails.openPorts.length})
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {showDeviceDetails.openPorts.map(port => (
                                        <div
                                            key={port.port}
                                            className="px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-md text-sm text-center"
                                        >
                                            <div className="font-mono font-medium">{port.port}</div>
                                            <div className="text-xs text-gray-600 dark:text-gray-400">
                                                {port.protocol}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Сервисы */}
                        {showDeviceDetails.services && showDeviceDetails.services.length > 0 && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Обнаруженные сервисы
                                </label>
                                <div className="space-y-2">
                                    {showDeviceDetails.services.map((service, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-md"
                                        >
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-gray-100">
                                                    {service.name}
                                                </div>
                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                    Порт {service.port} • {service.version || 'Версия неизвестна'}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end space-x-3">
                            <Button
                                variant="outline"
                                onClick={() => setShowDeviceDetails(null)}
                            >
                                Закрыть
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default ReconPage;
