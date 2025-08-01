import React, { useState, useEffect, useCallback } from 'react';
import Card from '../components/common/Card';
import { Button } from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';
import StatusIndicator from '../components/common/StatusIndicator';
import { useTheme } from '../hooks/useTheme';
import { useNotifications } from '../hooks/useNotifications';

// Интерфейсы типов
interface ScanSettings {
    maxThreads: number;
    timeout: number;
    retryAttempts: number;
    defaultPorts: string;
    aggressiveMode: boolean;
    stealthMode: boolean;
    rateLimitEnabled: boolean;
    rateLimit: number;
}

interface NotificationSettings {
    emailEnabled: boolean;
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPassword: string;
    emailRecipients: string[];
    webhookEnabled: boolean;
    webhookUrl: string;
    telegramEnabled: boolean;
    telegramBotToken: string;
    telegramChatId: string;
    slackEnabled: boolean;
    slackWebhookUrl: string;
}

interface SecuritySettings {
    sessionTimeout: number;
    maxFailedLogins: number;
    passwordMinLength: number;
    requireUppercase: boolean;
    requireNumbers: boolean;
    requireSymbols: boolean;
    mfaEnabled: boolean;
    allowedIpRanges: string[];
    apiRateLimit: number;
    auditLogEnabled: boolean;
}

interface ReportSettings {
    autoGenerate: boolean;
    defaultFormat: 'html' | 'pdf' | 'json' | 'xml';
    includeScreenshots: boolean;
    compressReports: boolean;
    retentionDays: number;
    customTemplate: boolean;
    logoEnabled: boolean;
    watermarkEnabled: boolean;
}

interface IntegrationSettings {
    splunk: {
        enabled: boolean;
        host: string;
        port: number;
        token: string;
        index: string;
    };
    elasticsearch: {
        enabled: boolean;
        host: string;
        port: number;
        index: string;
        username: string;
        password: string;
    };
    siem: {
        enabled: boolean;
        endpoint: string;
        apiKey: string;
    };
}

interface ThemeSettings {
    mode: 'light' | 'dark' | 'auto';
    primaryColor: string;
    fontSize: 'small' | 'medium' | 'large';
    sidebarCollapsed: boolean;
    animationsEnabled: boolean;
    compactMode: boolean;
}

interface ApiKey {
    id: string;
    name: string;
    key: string;
    permissions: string[];
    createdAt: string;
    lastUsed?: string;
    isActive: boolean;
    expiresAt?: string;
}

interface SystemSettings {
    scanning: ScanSettings;
    notifications: NotificationSettings;
    security: SecuritySettings;
    reporting: ReportSettings;
    integrations: IntegrationSettings;
    theme: ThemeSettings;
}

const SettingsPage: React.FC = () => {
    // Основное состояние
    const [settings, setSettings] = useState<SystemSettings | null>(null);
    const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('scanning');

    // Модальные окна
    const [showApiKeyModal, setShowApiKeyModal] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);

    // Формы
    const [newApiKeyName, setNewApiKeyName] = useState('');
    const [newApiKeyPermissions, setNewApiKeyPermissions] = useState<string[]>([]);
    const [newEmailRecipient, setNewEmailRecipient] = useState('');

    // Хуки
    const { theme } = useTheme();
    const { addNotification } = useNotifications();

    // Константы
    const availablePermissions = [
        'scan:read', 'scan:write', 'scan:execute',
        'reports:read', 'reports:write', 'reports:export',
        'settings:read', 'settings:write',
        'users:read', 'users:write',
        'api:manage'
    ];


    // Эффекты
    useEffect(() => {
        loadSettings();
        loadApiKeys();
    }, []);

    // Функции загрузки
    const loadSettings = async (): Promise<void> => {
        try {
            setLoading(true);

            // Имитация загрузки настроек
            const mockSettings: SystemSettings = {
                scanning: {
                    maxThreads: 50,
                    timeout: 5000,
                    retryAttempts: 3,
                    defaultPorts: '21,22,23,25,53,80,110,111,135,139,143,443,993,995,1723,3306,3389,5432,5900,8080',
                    aggressiveMode: false,
                    stealthMode: true,
                    rateLimitEnabled: true,
                    rateLimit: 100
                },
                notifications: {
                    emailEnabled: false,
                    smtpHost: '',
                    smtpPort: 587,
                    smtpUser: '',
                    smtpPassword: '',
                    emailRecipients: [],
                    webhookEnabled: false,
                    webhookUrl: '',
                    telegramEnabled: false,
                    telegramBotToken: '',
                    telegramChatId: '',
                    slackEnabled: false,
                    slackWebhookUrl: ''
                },
                security: {
                    sessionTimeout: 30,
                    maxFailedLogins: 5,
                    passwordMinLength: 8,
                    requireUppercase: true,
                    requireNumbers: true,
                    requireSymbols: false,
                    mfaEnabled: false,
                    allowedIpRanges: [],
                    apiRateLimit: 1000,
                    auditLogEnabled: true
                },
                reporting: {
                    autoGenerate: true,
                    defaultFormat: 'html',
                    includeScreenshots: false,
                    compressReports: true,
                    retentionDays: 30,
                    customTemplate: false,
                    logoEnabled: true,
                    watermarkEnabled: false
                },
                integrations: {
                    splunk: {
                        enabled: false,
                        host: '',
                        port: 8088,
                        token: '',
                        index: 'ip_roast'
                    },
                    elasticsearch: {
                        enabled: false,
                        host: '',
                        port: 9200,
                        index: 'ip-roast-logs',
                        username: '',
                        password: ''
                    },
                    siem: {
                        enabled: false,
                        endpoint: '',
                        apiKey: ''
                    }
                },
                theme: {
                    mode: theme as 'light' | 'dark' | 'auto',
                    primaryColor: '#10b981',
                    fontSize: 'medium',
                    sidebarCollapsed: false,
                    animationsEnabled: true,
                    compactMode: false
                }
            };

            setSettings(mockSettings);
        } catch (error) {
            addNotification({
                type: 'error',
                category: 'system',
                priority: 'high',
                message: 'Ошибка загрузки',
                description: 'Не удалось загрузить настройки системы'
            });
        } finally {
            setLoading(false);
        }
    };

    const loadApiKeys = async (): Promise<void> => {
        try {
            // Имитация загрузки API ключей
            const mockApiKeys: ApiKey[] = [
                {
                    id: '1',
                    name: 'Production API',
                    key: 'sk_live_abcd1234...',
                    permissions: ['scan:read', 'scan:write', 'reports:read'],
                    createdAt: '2024-01-15',
                    lastUsed: '2024-07-19',
                    isActive: true
                },
                {
                    id: '2',
                    name: 'Development API',
                    key: 'sk_test_efgh5678...',
                    permissions: ['scan:read', 'reports:read'],
                    createdAt: '2024-02-01',
                    isActive: true
                }
            ];

            setApiKeys(mockApiKeys);
        } catch (error) {
            addNotification({
                type: 'error',
                category: 'system',
                priority: 'normal',
                message: 'Ошибка загрузки API ключей',
                description: 'Не удалось загрузить список API ключей'
            });
        }
    };

    // Обработчики изменений
    const handleSettingChange = useCallback(<K extends keyof SystemSettings>(
        section: K,
        key: keyof SystemSettings[K],
        value: any
    ) => {
        if (!settings) return;

        setSettings(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                [section]: {
                    ...prev[section],
                    [key]: value
                }
            };
        });
    }, [settings]);

    const handleSaveSettings = async (): Promise<void> => {
        if (!settings) return;

        try {
            setSaving(true);

            // Имитация сохранения
            await new Promise(resolve => setTimeout(resolve, 1000));

            addNotification({
                type: 'success',
                category: 'system',
                priority: 'low',
                message: 'Настройки сохранены',
                description: 'Все изменения успешно применены'
            });
        } catch (error) {
            addNotification({
                type: 'error',
                category: 'system',
                priority: 'high',
                message: 'Ошибка сохранения',
                description: 'Не удалось сохранить настройки'
            });
        } finally {
            setSaving(false);
        }
    };

    // API ключи
    const handleCreateApiKey = async (): Promise<void> => {
        if (!newApiKeyName.trim() || newApiKeyPermissions.length === 0) {
            addNotification({
                type: 'warning',
                category: 'user',
                priority: 'normal',
                message: 'Неполные данные',
                description: 'Укажите название и выберите разрешения'
            });
            return;
        }

        try {
            const newKey: ApiKey = {
                id: Date.now().toString(),
                name: newApiKeyName,
                key: `sk_${Math.random().toString(36).substring(2)}`,
                permissions: newApiKeyPermissions,
                createdAt: new Date().toISOString().substring(0, 10),
                isActive: true
            };

            setApiKeys(prev => [...prev, newKey]);
            setNewApiKeyName('');
            setNewApiKeyPermissions([]);
            setShowApiKeyModal(false);

            addNotification({
                type: 'success',
                category: 'system',
                priority: 'normal',
                message: 'API ключ создан',
                description: 'Новый ключ доступен для использования'
            });
        } catch (error) {
            addNotification({
                type: 'error',
                category: 'system',
                priority: 'high',
                message: 'Ошибка создания ключа'
            });
        }
    };

    const handleDeleteApiKey = (keyId: string): void => {
        setApiKeys(prev => prev.filter(key => key.id !== keyId));
        addNotification({
            type: 'success',
            category: 'system',
            priority: 'low',
            message: 'API ключ удален'
        });
    };

    const handleToggleApiKey = (keyId: string): void => {
        setApiKeys(prev =>
            prev.map(key =>
                key.id === keyId ? { ...key, isActive: !key.isActive } : key
            )
        );
    };

    // Управление списками
    const addEmailRecipient = (): void => {
        if (!settings || !newEmailRecipient.trim()) return;

        handleSettingChange('notifications', 'emailRecipients', [
            ...settings.notifications.emailRecipients,
            newEmailRecipient.trim()
        ]);
        setNewEmailRecipient('');
    };

    const removeEmailRecipient = (index: number): void => {
        if (!settings) return;

        const updated = settings.notifications.emailRecipients.filter((_, i) => i !== index);
        handleSettingChange('notifications', 'emailRecipients', updated);
    };


    // Экспорт/импорт
    const handleExportSettings = (): void => {
        if (!settings) return;

        const dataStr = JSON.stringify(settings, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `ip-roast-settings-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        addNotification({
            type: 'success',
            category: 'system',
            priority: 'low',
            message: 'Настройки импортированы',
            description: 'Файл с настройками успешно загружен'
        });
    };

    const handleResetSettings = async (): Promise<void> => {
        try {
            setSaving(true);
            await loadSettings(); // Перезагрузка настроек по умолчанию
            setShowResetModal(false);

            addNotification({
                type: 'success',
                category: 'system',
                priority: 'normal',
                message: 'Настройки сброшены',
                description: 'Все настройки возвращены к значениям по умолчанию'
            });
        } catch (error) {
            addNotification({
                type: 'error',
                category: 'system',
                priority: 'high',
                message: 'Ошибка сброса настроек'
            });
        } finally {
            setSaving(false);
        }
    };

    // Рендеринг
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-900">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (!settings) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-900">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-white mb-2">
                        Ошибка загрузки настроек
                    </h2>
                    <p className="text-gray-400 mb-4">
                        Не удалось загрузить конфигурацию системы
                    </p>
                    <Button variant="primary" onClick={loadSettings}>
                        Попробовать снова
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <div className="container mx-auto px-4 py-6">
                {/* Заголовок */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">
                                Настройки системы
                            </h1>
                            <p className="text-gray-400">
                                Конфигурация IP Roast Security Platform
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <StatusIndicator
                                status="success"
                                text="Система работает"
                                size="sm"
                            />
                            <Button
                                variant="secondary"
                                onClick={handleExportSettings}
                            >
                                Экспорт
                            </Button>
                            <Button
                                variant="primary"
                                onClick={handleSaveSettings}
                                loading={saving}
                            >
                                Сохранить все
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Навигация по вкладкам */}
                <div className="mb-6">
                    <nav className="flex space-x-1 bg-gray-800 p-1 rounded-lg">
                        {[
                            { id: 'scanning', label: 'Сканирование', icon: '🔍' },
                            { id: 'notifications', label: 'Уведомления', icon: '📧' },
                            { id: 'security', label: 'Безопасность', icon: '🛡️' },
                            { id: 'reporting', label: 'Отчеты', icon: '📊' },
                            { id: 'integrations', label: 'Интеграции', icon: '🔗' },
                            { id: 'theme', label: 'Интерфейс', icon: '🎨' },
                            { id: 'api', label: 'API', icon: '⚙️' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === tab.id
                                    ? 'bg-emerald-600 text-white'
                                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                                    }`}
                            >
                                <span>{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Содержимое вкладок */}
                <div className="space-y-6">
                    {/* Вкладка: Сканирование */}
                    {activeTab === 'scanning' && (
                        <Card className="p-6">
                            <h2 className="text-xl font-semibold mb-4">Настройки сканирования</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Максимальное количество потоков
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="500"
                                        value={settings.scanning.maxThreads}
                                        onChange={(e) => handleSettingChange('scanning', 'maxThreads', parseInt(e.target.value) || 1)}
                                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Таймаут подключения (мс)
                                    </label>
                                    <input
                                        type="number"
                                        min="100"
                                        max="60000"
                                        value={settings.scanning.timeout}
                                        onChange={(e) => handleSettingChange('scanning', 'timeout', parseInt(e.target.value) || 1000)}
                                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Количество повторов
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="10"
                                        value={settings.scanning.retryAttempts}
                                        onChange={(e) => handleSettingChange('scanning', 'retryAttempts', parseInt(e.target.value) || 0)}
                                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Лимит скорости (запросов/сек)
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="1000"
                                        value={settings.scanning.rateLimit}
                                        onChange={(e) => handleSettingChange('scanning', 'rateLimit', parseInt(e.target.value) || 100)}
                                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                        disabled={!settings.scanning.rateLimitEnabled}
                                    />
                                </div>
                            </div>

                            <div className="mt-6">
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Порты по умолчанию
                                </label>
                                <input
                                    type="text"
                                    value={settings.scanning.defaultPorts}
                                    onChange={(e) => handleSettingChange('scanning', 'defaultPorts', e.target.value)}
                                    placeholder="21,22,23,25,53,80,443,3389"
                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                />
                                <p className="text-sm text-gray-500 mt-1">
                                    Список портов через запятую для сканирования по умолчанию
                                </p>
                            </div>

                            <div className="mt-6 space-y-4">
                                <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                                    <div>
                                        <div className="font-medium text-white">Агрессивный режим</div>
                                        <div className="text-sm text-gray-400">
                                            Более интенсивное сканирование с повышенным риском обнаружения
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={settings.scanning.aggressiveMode}
                                            onChange={(e) => handleSettingChange('scanning', 'aggressiveMode', e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                                    <div>
                                        <div className="font-medium text-white">Скрытный режим</div>
                                        <div className="text-sm text-gray-400">
                                            Минимизирует вероятность обнаружения системами защиты
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={settings.scanning.stealthMode}
                                            onChange={(e) => handleSettingChange('scanning', 'stealthMode', e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                                    <div>
                                        <div className="font-medium text-white">Ограничение скорости</div>
                                        <div className="text-sm text-gray-400">
                                            Ограничивает количество запросов в секунду
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={settings.scanning.rateLimitEnabled}
                                            onChange={(e) => handleSettingChange('scanning', 'rateLimitEnabled', e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                                    </label>
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* Вкладка: Уведомления */}
                    {activeTab === 'notifications' && (
                        <div className="space-y-6">
                            {/* Email уведомления */}
                            <Card className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold">Email уведомления</h3>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={settings.notifications.emailEnabled}
                                            onChange={(e) => handleSettingChange('notifications', 'emailEnabled', e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                                    </label>
                                </div>

                                {settings.notifications.emailEnabled && (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                                    SMTP Сервер
                                                </label>
                                                <input
                                                    type="text"
                                                    value={settings.notifications.smtpHost}
                                                    onChange={(e) => handleSettingChange('notifications', 'smtpHost', e.target.value)}
                                                    placeholder="smtp.gmail.com"
                                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                                    Порт
                                                </label>
                                                <input
                                                    type="number"
                                                    value={settings.notifications.smtpPort}
                                                    onChange={(e) => handleSettingChange('notifications', 'smtpPort', parseInt(e.target.value) || 587)}
                                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                                    Пользователь
                                                </label>
                                                <input
                                                    type="text"
                                                    value={settings.notifications.smtpUser}
                                                    onChange={(e) => handleSettingChange('notifications', 'smtpUser', e.target.value)}
                                                    placeholder="user@domain.com"
                                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                                    Пароль
                                                </label>
                                                <input
                                                    type="password"
                                                    value={settings.notifications.smtpPassword}
                                                    onChange={(e) => handleSettingChange('notifications', 'smtpPassword', e.target.value)}
                                                    placeholder="••••••••"
                                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                Получатели
                                            </label>
                                            <div className="space-y-2">
                                                {settings.notifications.emailRecipients.map((email, index) => (
                                                    <div key={index} className="flex items-center justify-between bg-gray-800 p-3 rounded-md">
                                                        <span className="text-gray-300">{email}</span>
                                                        <Button
                                                            variant="danger"
                                                            size="sm"
                                                            onClick={() => removeEmailRecipient(index)}
                                                        >
                                                            Удалить
                                                        </Button>
                                                    </div>
                                                ))}
                                                <div className="flex gap-2">
                                                    <input
                                                        type="email"
                                                        value={newEmailRecipient}
                                                        onChange={(e) => setNewEmailRecipient(e.target.value)}
                                                        placeholder="admin@company.com"
                                                        className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                                        onKeyPress={(e) => e.key === 'Enter' && addEmailRecipient()}
                                                    />
                                                    <Button
                                                        variant="secondary"
                                                        onClick={addEmailRecipient}
                                                        disabled={!newEmailRecipient.trim()}
                                                    >
                                                        Добавить
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </Card>

                            {/* Webhook уведомления */}
                            <Card className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold">Webhook уведомления</h3>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={settings.notifications.webhookEnabled}
                                            onChange={(e) => handleSettingChange('notifications', 'webhookEnabled', e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                                    </label>
                                </div>

                                {settings.notifications.webhookEnabled && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Webhook URL
                                        </label>
                                        <input
                                            type="url"
                                            value={settings.notifications.webhookUrl}
                                            onChange={(e) => handleSettingChange('notifications', 'webhookUrl', e.target.value)}
                                            placeholder="https://hooks.slack.com/services/..."
                                            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                        />
                                    </div>
                                )}
                            </Card>
                        </div>
                    )}

                    {/* Вкладка: API */}
                    {activeTab === 'api' && (
                        <div className="space-y-6">
                            <Card className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h2 className="text-xl font-semibold">API Ключи</h2>
                                        <p className="text-gray-400 text-sm">
                                            Управление доступом к API интерфейсу
                                        </p>
                                    </div>
                                    <Button
                                        variant="primary"
                                        onClick={() => setShowApiKeyModal(true)}
                                    >
                                        Создать ключ
                                    </Button>
                                </div>

                                <div className="space-y-3">
                                    {apiKeys.map((key) => (
                                        <div key={key.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-medium text-white">{key.name}</h3>
                                                    <span className={`px-2 py-1 text-xs rounded-full ${key.isActive
                                                        ? 'bg-green-900 text-green-300'
                                                        : 'bg-gray-700 text-gray-400'
                                                        }`}>
                                                        {key.isActive ? 'Активен' : 'Отключен'}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-gray-400 mb-2">
                                                    <code className="bg-gray-700 px-2 py-1 rounded text-xs">
                                                        {key.key}
                                                    </code>
                                                </div>
                                                <div className="flex flex-wrap gap-1">
                                                    {key.permissions.map((permission) => (
                                                        <span
                                                            key={permission}
                                                            className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded"
                                                        >
                                                            {permission}
                                                        </span>
                                                    ))}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-2">
                                                    Создан: {key.createdAt}
                                                    {key.lastUsed && ` • Использовался: ${key.lastUsed}`}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 ml-4">
                                                <Button
                                                    variant={key.isActive ? "warning" : "success"}
                                                    size="sm"
                                                    onClick={() => handleToggleApiKey(key.id)}
                                                >
                                                    {key.isActive ? 'Отключить' : 'Включить'}
                                                </Button>
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    onClick={() => handleDeleteApiKey(key.id)}
                                                >
                                                    Удалить
                                                </Button>
                                            </div>
                                        </div>
                                    ))}

                                    {apiKeys.length === 0 && (
                                        <div className="text-center py-8 text-gray-400">
                                            <p>API ключи не созданы</p>
                                            <p className="text-sm">Создайте первый ключ для доступа к API</p>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </div>
                    )}
                </div>

                {/* Кнопки действий внизу страницы */}
                <div className="mt-8 flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="secondary"
                            onClick={handleExportSettings}
                        >
                            📁 Экспорт настроек
                        </Button>
                        <Button
                            variant="warning"
                            onClick={() => setShowResetModal(true)}
                        >
                            🔄 Сбросить к умолчаниям
                        </Button>
                    </div>
                    <div className="text-sm text-gray-400">
                        Последнее изменение: {new Date().toLocaleDateString('ru-RU')}
                    </div>
                </div>
            </div>

            {/* Модальные окна */}
            {showApiKeyModal && (
                <Modal
                    isOpen={showApiKeyModal}
                    onClose={() => setShowApiKeyModal(false)}
                    title="Создать API ключ"
                >
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Название ключа
                            </label>
                            <input
                                type="text"
                                value={newApiKeyName}
                                onChange={(e) => setNewApiKeyName(e.target.value)}
                                placeholder="Производственный API"
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Разрешения
                            </label>
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {availablePermissions.map((permission) => (
                                    <label key={permission} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={newApiKeyPermissions.includes(permission)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setNewApiKeyPermissions(prev => [...prev, permission]);
                                                } else {
                                                    setNewApiKeyPermissions(prev => prev.filter(p => p !== permission));
                                                }
                                            }}
                                            className="mr-2 rounded"
                                        />
                                        <span className="text-sm text-gray-300">{permission}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button
                                variant="secondary"
                                onClick={() => setShowApiKeyModal(false)}
                            >
                                Отмена
                            </Button>
                            <Button
                                variant="primary"
                                onClick={handleCreateApiKey}
                                disabled={!newApiKeyName.trim() || newApiKeyPermissions.length === 0}
                            >
                                Создать ключ
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}

            {showResetModal && (
                <Modal
                    isOpen={showResetModal}
                    onClose={() => setShowResetModal(false)}
                    title="Подтвердите сброс настроек"
                >
                    <div className="space-y-4">
                        <div className="p-4 bg-yellow-900/20 border border-yellow-700 rounded-lg">
                            <p className="text-yellow-400 font-medium mb-2">⚠️ Внимание!</p>
                            <p className="text-yellow-300 text-sm">
                                Все настройки будут возвращены к значениям по умолчанию.
                                Это действие нельзя отменить.
                            </p>
                        </div>

                        <p className="text-gray-300">
                            Будут сброшены следующие разделы:
                        </p>
                        <ul className="list-disc list-inside text-sm text-gray-400 space-y-1">
                            <li>Настройки сканирования</li>
                            <li>Конфигурация уведомлений</li>
                            <li>Параметры безопасности</li>
                            <li>Настройки отчетов</li>
                            <li>Интеграции</li>
                            <li>Настройки интерфейса</li>
                        </ul>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button
                                variant="secondary"
                                onClick={() => setShowResetModal(false)}
                            >
                                Отмена
                            </Button>
                            <Button
                                variant="danger"
                                onClick={handleResetSettings}
                                loading={saving}
                            >
                                Подтвердить сброс
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default SettingsPage;
