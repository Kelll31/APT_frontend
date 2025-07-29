import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'

// Компоненты
import Card from '@/components/common/Card'
import Button from '@/components/common/Button'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import StatusIndicator from '@/components/common/StatusIndicator'
import ProgressBar from '@/components/common/ProgressBar'
import Modal from '@/components/common/Modal'
import ScanForm from '@/components/features/Scanner/ScanForm'
import ScanProgress from '@/components/features/Scanner/ScanProgress'
import ScanResults from '@/components/features/Scanner/ScanResults'
import PortList from '@/components/features/Scanner/PortList'

// Хуки
import { useScanner } from '@/hooks/useScanner'
import { useNotifications } from '@/hooks/useNotifications'
import { useTheme } from '@/hooks/useTheme'
import { useWebSocket } from '@/hooks/useWebSocket'
import { useLocalStorage } from '@/hooks/useLocalStorage'

// Сервисы
import { scannerApi } from '@/services/scannerApi'

// Типы
import type { ScanData, ScanResult, ScanProfile, ScanProgress as ScanProgressType } from '@/types/scanner'

// Утилиты
import { formatDuration, formatDate } from '@/utils/formatters'
import { validateTarget, validatePorts } from '@/utils/validators'

// Константы
import { SCAN_PROFILES } from '@/shared/constants/scan-profiles'

// Интерфейсы
interface ScannerPageState {
    selectedProfile: string;
    advancedSettingsOpen: boolean;
    showResultsModal: boolean;
    selectedResult: ScanResult | null;
    validationStatus: {
        isValid: boolean;
        message: string;
        checking: boolean;
    };
}

interface QuickAction {
    id: string;
    title: string;
    description: string;
    icon: string;
    target: string;
    profile: string;
    disabled?: boolean;
}

const ScannerPage: React.FC = () => {
    // URL параметры и навигация
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    // Основное состояние
    const [pageState, setPageState] = useState<ScannerPageState>({
        selectedProfile: 'balanced',
        advancedSettingsOpen: false,
        showResultsModal: false,
        selectedResult: null,
        validationStatus: {
            isValid: false,
            message: '',
            checking: false
        }
    });

    // Данные сканирования
    const [scanData, setScanData] = useLocalStorage<ScanData>('scannerFormData', {
        target: '',
        ports: 'common',
        profile: 'balanced',
        options: {
            timing_template: '3',
            enable_scripts: true,
            version_detection: true,
            os_detection: false,
            aggressive_mode: false,
            stealth_mode: false,
            no_resolve: false,
            max_retries: 2,
            scan_delay: 0,
            host_timeout: 30,
            max_parallel_hosts: 10,
            exclude_hosts: '',
            custom_scripts: '',
            extra_args: '',
            report_format: 'html'
        }
    });

    // Хуки
    const { theme } = useTheme();
    const { addNotification } = useNotifications();
    const { isConnected: wsConnected, connectionStatus } = useWebSocket();
    const {
        currentScan,
        isScanning,
        scanProgress,
        scanHistory,
        startScan,
        stopScan,
        getScanStatus,
        deleteScan
    } = useScanner();

    // Профили сканирования
    const scanProfiles = useMemo(() => ({
        quick: {
            name: "⚡ Быстрое сканирование",
            description: "Быстрое сканирование основных портов",
            ports: "common",
            options: {
                timing_template: "4",
                enable_scripts: false,
                version_detection: false,
                os_detection: false,
                aggressive_mode: false,
                stealth_mode: false,
                no_resolve: true,
                max_retries: 1,
                scan_delay: 0,
                host_timeout: 15,
                max_parallel_hosts: 20,
                exclude_hosts: "",
                custom_scripts: "",
                extra_args: "--min-rate 1000",
                report_format: "html"
            },
            warnings: ["Может пропустить некоторые сервисы"]
        },
        balanced: {
            name: "⚖️ Сбалансированное",
            description: "Оптимальный баланс скорости и точности",
            ports: "top-1000",
            options: {
                timing_template: "3",
                enable_scripts: true,
                version_detection: true,
                os_detection: false,
                aggressive_mode: false,
                stealth_mode: false,
                no_resolve: false,
                max_retries: 2,
                scan_delay: 0,
                host_timeout: 30,
                max_parallel_hosts: 10,
                exclude_hosts: "",
                custom_scripts: "http-title,ssl-cert",
                extra_args: "",
                report_format: "html"
            },
            warnings: []
        },
        thorough: {
            name: "🔍 Тщательное",
            description: "Детальное сканирование всех параметров",
            ports: "all",
            options: {
                timing_template: "2",
                enable_scripts: true,
                version_detection: true,
                os_detection: true,
                aggressive_mode: true,
                stealth_mode: false,
                no_resolve: false,
                max_retries: 3,
                scan_delay: 100,
                host_timeout: 60,
                max_parallel_hosts: 5,
                exclude_hosts: "",
                custom_scripts: "http-title,ssl-cert,ssh-hostkey,smb-os-discovery,dns-brute",
                extra_args: "--script-args=http.useragent='Mozilla/5.0 Scanner'",
                report_format: "html"
            },
            warnings: ["Длительное сканирование", "Может быть обнаружено системами защиты"]
        },
        stealth: {
            name: "🐱‍👤 Скрытное",
            description: "Максимально скрытное сканирование",
            ports: "common",
            options: {
                timing_template: "1",
                enable_scripts: false,
                version_detection: false,
                os_detection: false,
                aggressive_mode: false,
                stealth_mode: true,
                no_resolve: true,
                max_retries: 1,
                scan_delay: 1000,
                host_timeout: 120,
                max_parallel_hosts: 1,
                exclude_hosts: "",
                custom_scripts: "",
                extra_args: "-f --mtu 24 --data-length 25",
                report_format: "html"
            },
            warnings: ["Очень медленное сканирование", "Может занять несколько часов"]
        },
        aggressive: {
            name: "💥 Агрессивное",
            description: "Быстрое агрессивное сканирование",
            ports: "top-1000",
            options: {
                timing_template: "5",
                enable_scripts: true,
                version_detection: true,
                os_detection: true,
                aggressive_mode: true,
                stealth_mode: false,
                no_resolve: false,
                max_retries: 3,
                scan_delay: 0,
                host_timeout: 20,
                max_parallel_hosts: 50,
                exclude_hosts: "",
                custom_scripts: "vulners,vulscan,exploit",
                extra_args: "--min-rate 5000 --max-rate 10000",
                report_format: "html"
            },
            warnings: ["Высокая нагрузка на сеть", "Легко обнаруживается", "Может вызвать DoS"]
        }
    }), []);

    // Быстрые действия
    const quickActions = useMemo<QuickAction[]>(() => [
        {
            id: 'localhost',
            title: 'Локальный хост',
            description: 'Сканирование localhost (127.0.0.1)',
            icon: '🏠',
            target: '127.0.0.1',
            profile: 'quick'
        },
        {
            id: 'router',
            title: 'Роутер',
            description: 'Сканирование шлюза по умолчанию',
            icon: '🌐',
            target: '192.168.1.1',
            profile: 'balanced'
        },
        {
            id: 'google-dns',
            title: 'Google DNS',
            description: 'Проверка доступности 8.8.8.8',
            icon: '🔍',
            target: '8.8.8.8',
            profile: 'quick'
        },
        {
            id: 'cloudflare-dns',
            title: 'Cloudflare DNS',
            description: 'Проверка доступности 1.1.1.1',
            icon: '☁️',
            target: '1.1.1.1',
            profile: 'quick'
        }
    ], []);

    // Инициализация при монтировании
    useEffect(() => {
        initializeScannerPage();
    }, []);

    // Восстановление состояния из URL
    useEffect(() => {
        const target = searchParams.get('target');
        const profile = searchParams.get('profile');
        const ports = searchParams.get('ports');

        if (target) {
            setScanData(prev => ({ ...prev, target }));
            handleTargetValidation(target);
        }
        if (profile && scanProfiles[profile as keyof typeof scanProfiles]) {
            handleProfileChange(profile);
        }
        if (ports) {
            setScanData(prev => ({ ...prev, ports }));
        }
    }, [searchParams]);

    // WebSocket события
    useEffect(() => {
        if (wsConnected && isScanning) {
            const unsubscribe = setupScannerWebSocketListeners();
            return unsubscribe;
        }
    }, [wsConnected, isScanning]);

    // Инициализация страницы
    const initializeScannerPage = useCallback(async () => {
        try {
            console.log('🔧 Инициализация страницы сканера...');

            // Восстанавливаем активное сканирование если есть
            const activeScanId = localStorage.getItem('activeScanId');
            if (activeScanId && !isScanning) {
                await restoreActiveScan(activeScanId);
            }

            // Применяем сохраненный профиль
            if (scanData.profile) {
                handleProfileChange(scanData.profile, false);
            }

            console.log('✅ Страница сканера инициализирована');
        } catch (error) {
            console.error('❌ Ошибка инициализации страницы сканера:', error);
            addNotification({
                type: 'error',
                title: 'Ошибка инициализации',
                message: 'Не удалось инициализировать страницу сканера'
            });
        }
    }, [isScanning, scanData.profile, addNotification]);

    // Восстановление активного сканирования
    const restoreActiveScan = useCallback(async (scanId: string) => {
        try {
            const status = await getScanStatus(scanId);
            if (status.status === 'running') {
                addNotification({
                    type: 'info',
                    title: 'Восстановлено сканирование',
                    message: `Продолжение активного сканирования: ${scanId}`
                });
            } else {
                localStorage.removeItem('activeScanId');
            }
        } catch (error) {
            localStorage.removeItem('activeScanId');
        }
    }, [getScanStatus, addNotification]);

    // Настройка WebSocket слушателей
    const setupScannerWebSocketListeners = useCallback(() => {
        console.log('🔌 Настройка WebSocket слушателей для сканера');

        // Здесь будет интеграция с WebSocket для получения событий сканирования

        return () => {
            console.log('🔌 Отключение WebSocket слушателей сканера');
        };
    }, []);

    // Валидация цели
    const handleTargetValidation = useCallback(async (target: string) => {
        if (!target.trim()) {
            setPageState(prev => ({
                ...prev,
                validationStatus: { isValid: false, message: '', checking: false }
            }));
            return;
        }

        setPageState(prev => ({
            ...prev,
            validationStatus: { isValid: false, message: 'Проверка...', checking: true }
        }));

        try {
            const validation = validateTarget(target);
            if (!validation.isValid) {
                setPageState(prev => ({
                    ...prev,
                    validationStatus: {
                        isValid: false,
                        message: validation.message || 'Неверный формат цели',
                        checking: false
                    }
                }));
                return;
            }

            // Дополнительная проверка через API
            const response = await scannerApi.validateTarget(target);

            setPageState(prev => ({
                ...prev,
                validationStatus: {
                    isValid: response.valid,
                    message: response.message || (response.valid ? 'Цель доступна' : 'Цель недоступна'),
                    checking: false
                }
            }));

        } catch (error) {
            setPageState(prev => ({
                ...prev,
                validationStatus: {
                    isValid: false,
                    message: 'Ошибка проверки цели',
                    checking: false
                }
            }));
        }
    }, []);

    // Изменение профиля
    const handleProfileChange = useCallback((profile: string, updateUrl: boolean = true) => {
        if (!scanProfiles[profile as keyof typeof scanProfiles]) {
            console.warn(`Неизвестный профиль: ${profile}`);
            return;
        }

        const selectedProfile = scanProfiles[profile as keyof typeof scanProfiles];

        setScanData(prev => ({
            ...prev,
            profile,
            ports: selectedProfile.ports,
            options: { ...prev.options, ...selectedProfile.options }
        }));

        setPageState(prev => ({
            ...prev,
            selectedProfile: profile
        }));

        if (updateUrl) {
            const params = new URLSearchParams(searchParams);
            params.set('profile', profile);
            setSearchParams(params, { replace: true });
        }

        console.log(`🎯 Профиль изменен на: ${selectedProfile.name}`);
    }, [scanProfiles, searchParams, setSearchParams, setScanData]);

    // Обработчик запуска сканирования
    const handleStartScan = useCallback(async () => {
        if (isScanning) {
            addNotification({
                type: 'warning',
                title: 'Сканирование активно',
                message: 'Дождитесь завершения текущего сканирования'
            });
            return;
        }

        // Валидация данных
        if (!scanData.target.trim()) {
            addNotification({
                type: 'error',
                title: 'Ошибка валидации',
                message: 'Укажите цель для сканирования'
            });
            return;
        }

        if (!pageState.validationStatus.isValid) {
            addNotification({
                type: 'error',
                title: 'Неверная цель',
                message: 'Цель сканирования не прошла валидацию'
            });
            return;
        }

        try {
            const loadingNotification = addNotification({
                type: 'loading',
                title: 'Запуск сканирования',
                message: `Инициализация сканирования ${scanData.target}...`
            });

            await startScan(scanData);

            if (loadingNotification?.hide) {
                loadingNotification.hide();
            }

            addNotification({
                type: 'success',
                title: 'Сканирование запущено',
                message: `Цель: ${scanData.target}`,
                actions: [{
                    label: 'Остановить',
                    icon: '🛑',
                    handler: () => handleStopScan()
                }]
            });

            // Обновляем URL
            const params = new URLSearchParams();
            params.set('target', scanData.target);
            params.set('profile', scanData.profile);
            setSearchParams(params, { replace: true });

        } catch (error) {
            addNotification({
                type: 'error',
                title: 'Ошибка запуска',
                message: error instanceof Error ? error.message : 'Неизвестная ошибка'
            });
        }
    }, [isScanning, scanData, pageState.validationStatus.isValid, startScan, addNotification, setSearchParams]);

    // Обработчик остановки сканирования
    const handleStopScan = useCallback(async () => {
        try {
            await stopScan();

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
    }, [stopScan, addNotification]);

    // Обработчик быстрого действия
    const handleQuickAction = useCallback((action: QuickAction) => {
        setScanData(prev => ({
            ...prev,
            target: action.target
        }));

        handleProfileChange(action.profile);
        handleTargetValidation(action.target);

        addNotification({
            type: 'info',
            title: 'Быстрое действие',
            message: `Настройки применены для: ${action.title}`
        });
    }, [setScanData, handleProfileChange, handleTargetValidation, addNotification]);

    // Обработчик изменения данных формы
    const handleFormDataChange = useCallback((field: keyof ScanData, value: any) => {
        setScanData(prev => ({
            ...prev,
            [field]: value
        }));

        // Переключаемся на пользовательский профиль при изменении настроек
        if (field !== 'target' && field !== 'profile') {
            setPageState(prev => ({
                ...prev,
                selectedProfile: 'custom'
            }));
        }

        // Валидируем цель при изменении
        if (field === 'target') {
            handleTargetValidation(value);
        }
    }, [setScanData, handleTargetValidation]);

    // Обработчик изменения расширенных опций
    const handleOptionsChange = useCallback((option: string, value: any) => {
        setScanData(prev => ({
            ...prev,
            options: {
                ...prev.options,
                [option]: value
            }
        }));

        setPageState(prev => ({
            ...prev,
            selectedProfile: 'custom'
        }));
    }, [setScanData]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 lg:p-6">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Заголовок страницы */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                            🔍 Сканер портов
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Профессиональное сканирование портов и обнаружение сервисов
                        </p>
                    </div>

                    <div className="flex items-center space-x-3 mt-4 lg:mt-0">
                        <StatusIndicator
                            status={wsConnected ? 'online' : 'offline'}
                            label={wsConnected ? 'WebSocket подключен' : 'WebSocket отключен'}
                        />
                        {scanHistory && scanHistory.length > 0 && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate('/reports')}
                            >
                                📊 История ({scanHistory.length})
                            </Button>
                        )}
                    </div>
                </div>

                {/* Основной контент */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Левая колонка - Форма сканирования */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Быстрые действия */}
                        <Card>
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                                    ⚡ Быстрые действия
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {quickActions.map((action) => (
                                        <button
                                            key={action.id}
                                            onClick={() => handleQuickAction(action)}
                                            disabled={action.disabled || isScanning}
                                            className={`
                        p-4 text-left rounded-lg border-2 transition-all duration-200
                        ${action.disabled || isScanning
                                                    ? 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 cursor-not-allowed opacity-50'
                                                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md cursor-pointer'
                                                }
                      `}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className="text-2xl">{action.icon}</div>
                                                <div className="flex-1">
                                                    <div className="font-medium text-gray-900 dark:text-gray-100">
                                                        {action.title}
                                                    </div>
                                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                                        {action.description}
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </Card>

                        {/* Форма сканирования */}
                        <Card>
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
                                    🎯 Настройки сканирования
                                </h3>

                                <ScanForm
                                    scanData={scanData}
                                    selectedProfile={pageState.selectedProfile}
                                    availableProfiles={scanProfiles}
                                    validationStatus={pageState.validationStatus}
                                    advancedSettingsOpen={pageState.advancedSettingsOpen}
                                    isScanning={isScanning}
                                    onDataChange={handleFormDataChange}
                                    onOptionsChange={handleOptionsChange}
                                    onProfileChange={handleProfileChange}
                                    onTargetValidation={handleTargetValidation}
                                    onAdvancedToggle={() => setPageState(prev => ({
                                        ...prev,
                                        advancedSettingsOpen: !prev.advancedSettingsOpen
                                    }))}
                                />

                                {/* Кнопки управления */}
                                <div className="mt-6 flex space-x-3">
                                    {!isScanning ? (
                                        <Button
                                            onClick={handleStartScan}
                                            className="flex-1"
                                            disabled={!scanData.target.trim() || !pageState.validationStatus.isValid || pageState.validationStatus.checking}
                                        >
                                            🚀 Запустить сканирование
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={handleStopScan}
                                            variant="outline"
                                            className="flex-1 text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                        >
                                            🛑 Остановить сканирование
                                        </Button>
                                    )}

                                    <Button
                                        variant="outline"
                                        onClick={() => navigate('/recon')}
                                        disabled={isScanning}
                                    >
                                        🗺️ Разведка сети
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Правая колонка - Статус и результаты */}
                    <div className="space-y-6">

                        {/* Активное сканирование */}
                        {isScanning && currentScan ? (
                            <Card>
                                <div className="p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                                        ⏳ Активное сканирование
                                    </h3>

                                    <ScanProgress
                                        scan={currentScan}
                                        progress={scanProgress}
                                        showDetails={true}
                                        onStop={handleStopScan}
                                    />
                                </div>
                            </Card>
                        ) : (
                            /* Статистика сканирования */
                            <Card>
                                <div className="p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                                        📊 Статистика
                                    </h3>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                                {scanHistory?.length || 0}
                                            </div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                                Всего сканирований
                                            </div>
                                        </div>

                                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                                {scanHistory?.filter(scan => scan.status === 'completed').length || 0}
                                            </div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                                Завершено
                                            </div>
                                        </div>

                                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                                0
                                            </div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                                Найдено портов
                                            </div>
                                        </div>

                                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                                0
                                            </div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                                Сервисов
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        )}

                        {/* Последние результаты */}
                        {scanHistory && scanHistory.length > 0 && (
                            <Card>
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                            📝 Последние результаты
                                        </h3>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => navigate('/reports')}
                                        >
                                            Все результаты
                                        </Button>
                                    </div>

                                    <div className="space-y-3">
                                        {scanHistory.slice(0, 5).map((scan) => (
                                            <div
                                                key={scan.id}
                                                className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                                onClick={() => setPageState(prev => ({
                                                    ...prev,
                                                    showResultsModal: true,
                                                    selectedResult: scan
                                                }))}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <div className="font-medium text-gray-900 dark:text-gray-100">
                                                            {scan.target}
                                                        </div>
                                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                                            {formatDate(scan.created_at)}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <StatusIndicator
                                                            status={scan.status === 'completed' ? 'online' : scan.status === 'failed' ? 'offline' : 'warning'}
                                                            size="sm"
                                                        />
                                                        {scan.ports_found && (
                                                            <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                                                                {scan.ports_found} портов
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Card>
                        )}

                        {/* Профиль сканирования */}
                        <Card>
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                    🎯 Текущий профиль
                                </h3>

                                {pageState.selectedProfile !== 'custom' && scanProfiles[pageState.selectedProfile as keyof typeof scanProfiles] ? (
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">
                                                {scanProfiles[pageState.selectedProfile as keyof typeof scanProfiles].name}
                                            </span>
                                        </div>

                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {scanProfiles[pageState.selectedProfile as keyof typeof scanProfiles].description}
                                        </p>

                                        {scanProfiles[pageState.selectedProfile as keyof typeof scanProfiles].warnings.length > 0 && (
                                            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                                                <div className="flex items-start space-x-2">
                                                    <span className="text-yellow-600 dark:text-yellow-400">⚠️</span>
                                                    <div className="text-sm text-yellow-800 dark:text-yellow-200">
                                                        <div className="font-medium mb-1">Предупреждения:</div>
                                                        <ul className="list-disc list-inside space-y-1">
                                                            {scanProfiles[pageState.selectedProfile as keyof typeof scanProfiles].warnings.map((warning, index) => (
                                                                <li key={index}>{warning}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">🔧 Пользовательский профиль</span>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Настройки изменены вручную
                                        </p>
                                    </div>
                                )}

                                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                        <div className="flex justify-between">
                                            <span>Порты:</span>
                                            <span className="font-medium">{scanData.ports}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Тайминг:</span>
                                            <span className="font-medium">T{scanData.options.timing_template}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Скрипты:</span>
                                            <span className="font-medium">{scanData.options.enable_scripts ? 'Да' : 'Нет'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Системная информация */}
                        <Card>
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                    ℹ️ Информация
                                </h3>

                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">WebSocket:</span>
                                        <StatusIndicator
                                            status={wsConnected ? 'online' : 'offline'}
                                            size="sm"
                                            label={wsConnected ? 'Подключен' : 'Отключен'}
                                        />
                                    </div>

                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Тема:</span>
                                        <span className="font-medium text-gray-900 dark:text-gray-100 capitalize">
                                            {theme}
                                        </span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Версия:</span>
                                        <span className="font-medium text-gray-900 dark:text-gray-100">
                                            IP Roast v2.1.0
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Модальное окно с результатами */}
            {pageState.showResultsModal && pageState.selectedResult && (
                <Modal
                    isOpen={true}
                    onClose={() => setPageState(prev => ({
                        ...prev,
                        showResultsModal: false,
                        selectedResult: null
                    }))}
                    title={`Результаты сканирования: ${pageState.selectedResult.target}`}
                    size="xl"
                >
                    <ScanResults
                        scan={pageState.selectedResult}
                        onClose={() => setPageState(prev => ({
                            ...prev,
                            showResultsModal: false,
                            selectedResult: null
                        }))}
                        onExport={(format) => {
                            // Здесь будет логика экспорта результатов
                            addNotification({
                                type: 'success',
                                title: 'Экспорт',
                                message: `Результаты экспортированы в формате ${format.toUpperCase()}`
                            });
                        }}
                        onDelete={async () => {
                            try {
                                if (pageState.selectedResult) {
                                    await deleteScan(pageState.selectedResult.id);
                                    addNotification({
                                        type: 'success',
                                        title: 'Удалено',
                                        message: 'Результаты сканирования удалены'
                                    });
                                    setPageState(prev => ({
                                        ...prev,
                                        showResultsModal: false,
                                        selectedResult: null
                                    }));
                                }
                            } catch (error) {
                                addNotification({
                                    type: 'error',
                                    title: 'Ошибка',
                                    message: 'Не удалось удалить результаты'
                                });
                            }
                        }}
                    />
                </Modal>
            )}
        </div>
    );
};

export default ScannerPage;
