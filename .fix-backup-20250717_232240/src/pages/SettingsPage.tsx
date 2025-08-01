import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

// Компоненты
import Card from '@/components/common/Card'
import Button from '@/components/common/Button'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import StatusIndicator from '@/components/common/StatusIndicator'
import Modal from '@/components/common/Modal'
import Toast from '@/components/common/Toast'

// Хуки
import { useTheme } from '@/hooks/useTheme'
import { useNotifications } from '@/hooks/useNotifications'
import { useLocalStorage } from '@/hooks/useLocalStorage'

// Утилиты
import { formatDate, formatFileSize } from '@/utils/formatters'

// Типы
interface SettingsSection {
    id: string;
    title: string;
    icon: string;
    description: string;
}

interface UserProfile {
    fullName: string;
    email: string;
    position: string;
    organization: string;
    timezone: string;
    language: string;
    avatar?: string;
}

interface SecuritySettings {
    totpEnabled: boolean;
    sessionLifetime: number;
    autoLogout: boolean;
    loginNotifications: boolean;
    deviceTracking: boolean;
    apiKeys: ApiKey[];
}

interface ApiKey {
    id: string;
    name: string;
    key: string;
    permissions: string[];
    createdAt: string;
    lastUsed?: string;
    isActive: boolean;
}

interface ScanningSettings {
    defaultProfile: string;
    maxConcurrentScans: number;
    defaultTimeout: number;
    autoSaveResults: boolean;
    enableScriptScan: boolean;
    defaultPorts: string;
    excludedRanges: string[];
}

interface NotificationSettings {
    emailNotifications: boolean;
    emailAddress: string;
    telegramEnabled: boolean;
    telegramChatId: string;
    webhookUrl: string;
    notificationEvents: string[];
    quietHours: {
        enabled: boolean;
        startTime: string;
        endTime: string;
    };
}

interface ThemeSettings {
    theme: 'light' | 'dark' | 'auto';
    accent: string;
    size: 'compact' | 'medium' | 'large';
    fontSize: number;
    highContrast: boolean;
    animations: boolean;
}

const SettingsPage: React.FC = () => {
    // URL параметры
    const [searchParams, setSearchParams] = useSearchParams();

    // Активная секция
    const [activeSection, setActiveSection] = useState(searchParams.get('section') || 'profile');

    // Состояние загрузки
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Состояние настроек
    const [userProfile, setUserProfile] = useLocalStorage<UserProfile>('userProfile', {
        fullName: '',
        email: '',
        position: '',
        organization: '',
        timezone: 'Europe/Moscow',
        language: 'ru'
    });

    const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
        totpEnabled: false,
        sessionLifetime: 7,
        autoLogout: false,
        loginNotifications: true,
        deviceTracking: true,
        apiKeys: []
    });

    const [scanningSettings, setScanningSettings] = useLocalStorage<ScanningSettings>('scanningSettings', {
        defaultProfile: 'balanced',
        maxConcurrentScans: 3,
        defaultTimeout: 300,
        autoSaveResults: true,
        enableScriptScan: true,
        defaultPorts: 'common',
        excludedRanges: []
    });

    const [notificationSettings, setNotificationSettings] = useLocalStorage<NotificationSettings>('notificationSettings', {
        emailNotifications: false,
        emailAddress: '',
        telegramEnabled: false,
        telegramChatId: '',
        webhookUrl: '',
        notificationEvents: ['scan_completed', 'vulnerabilities_found'],
        quietHours: {
            enabled: false,
            startTime: '22:00',
            endTime: '08:00'
        }
    });

    const [themeSettings, setThemeSettings] = useLocalStorage<ThemeSettings>('themeSettings', {
        theme: 'auto',
        accent: 'blue',
        size: 'medium',
        fontSize: 14,
        highContrast: false,
        animations: true
    });

    // Модальные окна
    const [showResetModal, setShowResetModal] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [showApiKeyModal, setShowApiKeyModal] = useState(false);
    const [editingApiKey, setEditingApiKey] = useState<ApiKey | null>(null);

    // Хуки
    const { theme, setTheme } = useTheme();
    const { addNotification } = useNotifications();

    // Секции настроек
    const settingsSections = useMemo<SettingsSection[]>(() => [
        {
            id: 'profile',
            title: 'Профиль',
            icon: '👤',
            description: 'Личная информация и основные настройки'
        },
        {
            id: 'security',
            title: 'Безопасность',
            icon: '🔐',
            description: 'Двухфакторная аутентификация и API ключи'
        },
        {
            id: 'scanning',
            title: 'Сканирование',
            icon: '🔍',
            description: 'Настройки по умолчанию для сканирования'
        },
        {
            id: 'notifications',
            title: 'Уведомления',
            icon: '🔔',
            description: 'Email, Telegram и webhook уведомления'
        },
        {
            id: 'appearance',
            title: 'Внешний вид',
            icon: '🎨',
            description: 'Темы, цвета и размеры интерфейса'
        },
        {
            id: 'integrations',
            title: 'Интеграции',
            icon: '🔗',
            description: 'Подключение внешних сервисов'
        },
        {
            id: 'backup',
            title: 'Резервное копирование',
            icon: '💾',
            description: 'Экспорт и импорт настроек'
        },
        {
            id: 'system',
            title: 'Система',
            icon: '⚙️',
            description: 'Системная информация и диагностика'
        }
    ], []);

    // Инициализация
    useEffect(() => {
        initializeSettings();
    }, []);

    // Обновление URL при смене секции
    useEffect(() => {
        const params = new URLSearchParams();
        if (activeSection !== 'profile') {
            params.set('section', activeSection);
        }
        setSearchParams(params, { replace: true });
    }, [activeSection, setSearchParams]);

    // Инициализация настроек
    const initializeSettings = useCallback(async () => {
        try {
            setIsLoading(true);

            // Загружаем настройки с сервера
            await Promise.allSettled([
                loadUserProfile(),
                loadSecuritySettings(),
                loadSystemInfo()
            ]);

        } catch (error) {
            console.error('Ошибка загрузки настроек:', error);
            addNotification({
                type: 'error',
                title: 'Ошибка загрузки',
                message: 'Не удалось загрузить некоторые настройки'
            });
        } finally {
            setIsLoading(false);
        }
    }, [addNotification]);

    // Загрузка профиля пользователя
    const loadUserProfile = useCallback(async () => {
        try {
            // Здесь будет API запрос
            // const response = await fetch('/api/settings/profile');
            // const data = await response.json();
            // setUserProfile(data);
        } catch (error) {
            console.error('Ошибка загрузки профиля:', error);
        }
    }, []);

    // Загрузка настроек безопасности
    const loadSecuritySettings = useCallback(async () => {
        try {
            // Здесь будет API запрос
            // const response = await fetch('/api/settings/security');
            // const data = await response.json();
            // setSecuritySettings(data);
        } catch (error) {
            console.error('Ошибка загрузки настроек безопасности:', error);
        }
    }, []);

    // Загрузка системной информации
    const loadSystemInfo = useCallback(async () => {
        try {
            // Здесь будет API запрос для системной информации
        } catch (error) {
            console.error('Ошибка загрузки системной информации:', error);
        }
    }, []);

    // Сохранение настроек
    const saveSettings = useCallback(async (section: string) => {
        try {
            setIsSaving(true);

            // Определяем какие настройки сохранять
            let dataToSave: any;
            let endpoint: string;

            switch (section) {
                case 'profile':
                    dataToSave = userProfile;
                    endpoint = '/api/settings/profile';
                    break;
                case 'security':
                    dataToSave = securitySettings;
                    endpoint = '/api/settings/security';
                    break;
                case 'scanning':
                    dataToSave = scanningSettings;
                    endpoint = '/api/settings/scanning';
                    break;
                case 'notifications':
                    dataToSave = notificationSettings;
                    endpoint = '/api/settings/notifications';
                    break;
                case 'appearance':
                    dataToSave = themeSettings;
                    endpoint = '/api/settings/appearance';
                    // Применяем тему сразу
                    setTheme(themeSettings.theme);
                    break;
                default:
                    throw new Error('Неизвестная секция настроек');
            }

            // Здесь будет API запрос
            // await fetch(endpoint, {
            //   method: 'PUT',
            //   headers: { 'Content-Type': 'application/json' },
            //   body: JSON.stringify(dataToSave)
            // });

            addNotification({
                type: 'success',
                title: 'Настройки сохранены',
                message: `Настройки секции "${settingsSections.find(s => s.id === section)?.title}" обновлены`
            });

        } catch (error) {
            addNotification({
                type: 'error',
                title: 'Ошибка сохранения',
                message: error instanceof Error ? error.message : 'Не удалось сохранить настройки'
            });
        } finally {
            setIsSaving(false);
        }
    }, [userProfile, securitySettings, scanningSettings, notificationSettings, themeSettings, settingsSections, addNotification, setTheme]);

    // Обработчик переключения секции
    const handleSectionChange = useCallback((sectionId: string) => {
        setActiveSection(sectionId);
    }, []);

    // Обработчик сброса настроек
    const handleResetSettings = useCallback(async () => {
        try {
            // Сбрасываем все настройки к значениям по умолчанию
            localStorage.removeItem('userProfile');
            localStorage.removeItem('scanningSettings');
            localStorage.removeItem('notificationSettings');
            localStorage.removeItem('themeSettings');

            // Перезагружаем страницу для применения изменений
            window.location.reload();

        } catch (error) {
            addNotification({
                type: 'error',
                title: 'Ошибка сброса',
                message: 'Не удалось сбросить настройки'
            });
        }
    }, [addNotification]);

    // Обработчик экспорта настроек
    const handleExportSettings = useCallback(() => {
        try {
            const settings = {
                userProfile,
                scanningSettings,
                notificationSettings,
                themeSettings,
                exportDate: new Date().toISOString(),
                version: '2.1.0'
            };

            const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `ip-roast-settings-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            URL.revokeObjectURL(url);

            addNotification({
                type: 'success',
                title: 'Настройки экспортированы',
                message: 'Файл настроек сохранен на ваше устройство'
            });

        } catch (error) {
            addNotification({
                type: 'error',
                title: 'Ошибка экспорта',
                message: 'Не удалось экспортировать настройки'
            });
        }
    }, [userProfile, scanningSettings, notificationSettings, themeSettings, addNotification]);

    // Обработчик импорта настроек
    const handleImportSettings = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const settings = JSON.parse(e.target?.result as string);

                // Валидируем структуру
                if (!settings.version || !settings.userProfile) {
                    throw new Error('Неверный формат файла настроек');
                }

                // Применяем настройки
                if (settings.userProfile) setUserProfile(settings.userProfile);
                if (settings.scanningSettings) setScanningSettings(settings.scanningSettings);
                if (settings.notificationSettings) setNotificationSettings(settings.notificationSettings);
                if (settings.themeSettings) {
                    setThemeSettings(settings.themeSettings);
                    setTheme(settings.themeSettings.theme);
                }

                addNotification({
                    type: 'success',
                    title: 'Настройки импортированы',
                    message: 'Настройки успешно загружены из файла'
                });

            } catch (error) {
                addNotification({
                    type: 'error',
                    title: 'Ошибка импорта',
                    message: 'Не удалось прочитать файл настроек'
                });
            }
        };
        reader.readAsText(file);
    }, [setUserProfile, setScanningSettings, setNotificationSettings, setThemeSettings, setTheme, addNotification]);

    // Обработчик создания API ключа
    const handleCreateApiKey = useCallback(async (keyData: Partial<ApiKey>) => {
        try {
            const newKey: ApiKey = {
                id: `key_${Date.now()}`,
                name: keyData.name || 'Новый ключ',
                key: `iprs_${Math.random().toString(36).substr(2, 32)}`,
                permissions: keyData.permissions || ['read'],
                createdAt: new Date().toISOString(),
                isActive: true
            };

            setSecuritySettings(prev => ({
                ...prev,
                apiKeys: [...prev.apiKeys, newKey]
            }));

            addNotification({
                type: 'success',
                title: 'API ключ создан',
                message: 'Новый API ключ успешно создан'
            });

            setShowApiKeyModal(false);

        } catch (error) {
            addNotification({
                type: 'error',
                title: 'Ошибка создания ключа',
                message: 'Не удалось создать API ключ'
            });
        }
    }, [addNotification]);

    // Рендер загрузки
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center space-y-4">
                    <LoadingSpinner size="xl" />
                    <div className="space-y-2">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                            Загрузка настроек
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Получение конфигурации системы...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 lg:p-6">
            <div className="max-w-7xl mx-auto">

                {/* Заголовок страницы */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                        ⚙️ Настройки системы
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Полная конфигурация IP Roast Security Platform
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                    {/* Навигация по секциям */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-6">
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                    Разделы настроек
                                </h3>

                                <nav className="space-y-2">
                                    {settingsSections.map((section) => (
                                        <button
                                            key={section.id}
                                            onClick={() => handleSectionChange(section.id)}
                                            className={`
                        w-full text-left p-3 rounded-lg transition-all duration-200
                        ${activeSection === section.id
                                                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-l-4 border-blue-500'
                                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                                                }
                      `}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <span className="text-lg">{section.icon}</span>
                                                <div className="flex-1">
                                                    <div className="font-medium">{section.title}</div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                        {section.description}
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </nav>
                            </div>
                        </Card>
                    </div>

                    {/* Содержимое секций */}
                    <div className="lg:col-span-3 space-y-6">

                        {/* Секция: Профиль */}
                        {activeSection === 'profile' && (
                            <Card>
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                            👤 Профиль пользователя
                                        </h2>
                                        <Button
                                            onClick={() => saveSettings('profile')}
                                            disabled={isSaving}
                                        >
                                            {isSaving ? 'Сохранение...' : 'Сохранить'}
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Полное имя
                                            </label>
                                            <input
                                                type="text"
                                                value={userProfile.fullName}
                                                onChange={(e) => setUserProfile(prev => ({ ...prev, fullName: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                                placeholder="Введите ваше имя"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Email адрес
                                            </label>
                                            <input
                                                type="email"
                                                value={userProfile.email}
                                                onChange={(e) => setUserProfile(prev => ({ ...prev, email: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                                placeholder="user@example.com"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Должность
                                            </label>
                                            <input
                                                type="text"
                                                value={userProfile.position}
                                                onChange={(e) => setUserProfile(prev => ({ ...prev, position: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                                placeholder="Специалист по информационной безопасности"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Организация
                                            </label>
                                            <input
                                                type="text"
                                                value={userProfile.organization}
                                                onChange={(e) => setUserProfile(prev => ({ ...prev, organization: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                                placeholder="Название организации"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Часовой пояс
                                            </label>
                                            <select
                                                value={userProfile.timezone}
                                                onChange={(e) => setUserProfile(prev => ({ ...prev, timezone: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                            >
                                                <option value="Europe/Moscow">Москва (UTC+3)</option>
                                                <option value="Europe/Kiev">Киев (UTC+2)</option>
                                                <option value="Europe/London">Лондон (UTC+0)</option>
                                                <option value="America/New_York">Нью-Йорк (UTC-5)</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Язык интерфейса
                                            </label>
                                            <select
                                                value={userProfile.language}
                                                onChange={(e) => setUserProfile(prev => ({ ...prev, language: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                            >
                                                <option value="ru">Русский</option>
                                                <option value="en">English</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        )}

                        {/* Секция: Безопасность */}
                        {activeSection === 'security' && (
                            <div className="space-y-6">
                                <Card>
                                    <div className="p-6">
                                        <div className="flex items-center justify-between mb-6">
                                            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                                🔐 Настройки безопасности
                                            </h2>
                                            <Button
                                                onClick={() => saveSettings('security')}
                                                disabled={isSaving}
                                            >
                                                {isSaving ? 'Сохранение...' : 'Сохранить'}
                                            </Button>
                                        </div>

                                        <div className="space-y-6">
                                            {/* Двухфакторная аутентификация */}
                                            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                                                    Двухфакторная аутентификация
                                                </h3>

                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-gray-700 dark:text-gray-300">
                                                            Включить TOTP аутентификацию
                                                        </p>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                            Дополнительная защита вашей учетной записи
                                                        </p>
                                                    </div>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={securitySettings.totpEnabled}
                                                            onChange={(e) => setSecuritySettings(prev => ({
                                                                ...prev,
                                                                totpEnabled: e.target.checked
                                                            }))}
                                                            className="sr-only peer"
                                                        />
                                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                                    </label>
                                                </div>
                                            </div>

                                            {/* Настройки сессии */}
                                            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                                                    Управление сессиями
                                                </h3>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                            Время жизни сессии (дни)
                                                        </label>
                                                        <select
                                                            value={securitySettings.sessionLifetime}
                                                            onChange={(e) => setSecuritySettings(prev => ({
                                                                ...prev,
                                                                sessionLifetime: parseInt(e.target.value)
                                                            }))}
                                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                                        >
                                                            <option value={1}>1 день</option>
                                                            <option value={7}>7 дней</option>
                                                            <option value={30}>30 дней</option>
                                                            <option value={90}>90 дней</option>
                                                        </select>
                                                    </div>

                                                    <div className="space-y-3">
                                                        <label className="flex items-center space-x-2">
                                                            <input
                                                                type="checkbox"
                                                                checked={securitySettings.autoLogout}
                                                                onChange={(e) => setSecuritySettings(prev => ({
                                                                    ...prev,
                                                                    autoLogout: e.target.checked
                                                                }))}
                                                                className="rounded text-blue-600"
                                                            />
                                                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                                                Автоматический выход при бездействии
                                                            </span>
                                                        </label>

                                                        <label className="flex items-center space-x-2">
                                                            <input
                                                                type="checkbox"
                                                                checked={securitySettings.loginNotifications}
                                                                onChange={(e) => setSecuritySettings(prev => ({
                                                                    ...prev,
                                                                    loginNotifications: e.target.checked
                                                                }))}
                                                                className="rounded text-blue-600"
                                                            />
                                                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                                                Уведомления о входах
                                                            </span>
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>

                                {/* API ключи */}
                                <Card>
                                    <div className="p-6">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                                🔑 API ключи
                                            </h3>
                                            <Button
                                                onClick={() => setShowApiKeyModal(true)}
                                            >
                                                + Создать ключ
                                            </Button>
                                        </div>

                                        {securitySettings.apiKeys.length === 0 ? (
                                            <div className="text-center py-8">
                                                <div className="text-gray-400 text-4xl mb-4">🔑</div>
                                                <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                                                    Нет API ключей
                                                </h4>
                                                <p className="text-gray-600 dark:text-gray-400">
                                                    Создайте API ключ для интеграции с внешними системами
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {securitySettings.apiKeys.map((key) => (
                                                    <div key={key.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex-1">
                                                                <div className="font-medium text-gray-900 dark:text-gray-100">
                                                                    {key.name}
                                                                </div>
                                                                <div className="text-sm text-gray-600 dark:text-gray-400 space-x-4">
                                                                    <span>Создан: {formatDate(key.createdAt)}</span>
                                                                    {key.lastUsed && (
                                                                        <span>Последнее использование: {formatDate(key.lastUsed)}</span>
                                                                    )}
                                                                </div>
                                                                <div className="mt-2">
                                                                    <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                                                        {key.key.substring(0, 20)}...
                                                                    </code>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <StatusIndicator
                                                                    status={key.isActive ? 'online' : 'offline'}
                                                                    size="sm"
                                                                />
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => setEditingApiKey(key)}
                                                                >
                                                                    Редактировать
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            </div>
                        )}

                        {/* Секция: Сканирование */}
                        {activeSection === 'scanning' && (
                            <Card>
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                            🔍 Настройки сканирования
                                        </h2>
                                        <Button
                                            onClick={() => saveSettings('scanning')}
                                            disabled={isSaving}
                                        >
                                            {isSaving ? 'Сохранение...' : 'Сохранить'}
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Профиль по умолчанию
                                            </label>
                                            <select
                                                value={scanningSettings.defaultProfile}
                                                onChange={(e) => setScanningSettings(prev => ({
                                                    ...prev,
                                                    defaultProfile: e.target.value
                                                }))}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                            >
                                                <option value="quick">⚡ Быстрое</option>
                                                <option value="balanced">⚖️ Сбалансированное</option>
                                                <option value="thorough">🔍 Тщательное</option>
                                                <option value="stealth">🐱‍👤 Скрытное</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Максимум одновременных сканирований
                                            </label>
                                            <input
                                                type="number"
                                                min={1}
                                                max={10}
                                                value={scanningSettings.maxConcurrentScans}
                                                onChange={(e) => setScanningSettings(prev => ({
                                                    ...prev,
                                                    maxConcurrentScans: parseInt(e.target.value)
                                                }))}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Таймаут по умолчанию (секунды)
                                            </label>
                                            <input
                                                type="number"
                                                min={30}
                                                max={3600}
                                                value={scanningSettings.defaultTimeout}
                                                onChange={(e) => setScanningSettings(prev => ({
                                                    ...prev,
                                                    defaultTimeout: parseInt(e.target.value)
                                                }))}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Порты по умолчанию
                                            </label>
                                            <select
                                                value={scanningSettings.defaultPorts}
                                                onChange={(e) => setScanningSettings(prev => ({
                                                    ...prev,
                                                    defaultPorts: e.target.value
                                                }))}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                            >
                                                <option value="common">Популярные порты</option>
                                                <option value="top-1000">Топ 1000 портов</option>
                                                <option value="all">Все порты</option>
                                                <option value="custom">Пользовательские</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="mt-6 space-y-4">
                                        <label className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                checked={scanningSettings.autoSaveResults}
                                                onChange={(e) => setScanningSettings(prev => ({
                                                    ...prev,
                                                    autoSaveResults: e.target.checked
                                                }))}
                                                className="rounded text-blue-600"
                                            />
                                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                                Автоматически сохранять результаты сканирования
                                            </span>
                                        </label>

                                        <label className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                checked={scanningSettings.enableScriptScan}
                                                onChange={(e) => setScanningSettings(prev => ({
                                                    ...prev,
                                                    enableScriptScan: e.target.checked
                                                }))}
                                                className="rounded text-blue-600"
                                            />
                                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                                Включать скрипты NSE по умолчанию
                                            </span>
                                        </label>
                                    </div>
                                </div>
                            </Card>
                        )}

                        {/* Секция: Уведомления */}
                        {activeSection === 'notifications' && (
                            <Card>
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                            🔔 Настройки уведомлений
                                        </h2>
                                        <Button
                                            onClick={() => saveSettings('notifications')}
                                            disabled={isSaving}
                                        >
                                            {isSaving ? 'Сохранение...' : 'Сохранить'}
                                        </Button>
                                    </div>

                                    <div className="space-y-6">
                                        {/* Email уведомления */}
                                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                                                📧 Email уведомления
                                            </h3>

                                            <div className="space-y-4">
                                                <label className="flex items-center space-x-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={notificationSettings.emailNotifications}
                                                        onChange={(e) => setNotificationSettings(prev => ({
                                                            ...prev,
                                                            emailNotifications: e.target.checked
                                                        }))}
                                                        className="rounded text-blue-600"
                                                    />
                                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                                        Включить email уведомления
                                                    </span>
                                                </label>

                                                {notificationSettings.emailNotifications && (
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                            Email адрес для уведомлений
                                                        </label>
                                                        <input
                                                            type="email"
                                                            value={notificationSettings.emailAddress}
                                                            onChange={(e) => setNotificationSettings(prev => ({
                                                                ...prev,
                                                                emailAddress: e.target.value
                                                            }))}
                                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                                            placeholder="notifications@example.com"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Telegram уведомления */}
                                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                                                📱 Telegram уведомления
                                            </h3>

                                            <div className="space-y-4">
                                                <label className="flex items-center space-x-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={notificationSettings.telegramEnabled}
                                                        onChange={(e) => setNotificationSettings(prev => ({
                                                            ...prev,
                                                            telegramEnabled: e.target.checked
                                                        }))}
                                                        className="rounded text-blue-600"
                                                    />
                                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                                        Включить Telegram уведомления
                                                    </span>
                                                </label>

                                                {notificationSettings.telegramEnabled && (
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                            Chat ID Telegram
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={notificationSettings.telegramChatId}
                                                            onChange={(e) => setNotificationSettings(prev => ({
                                                                ...prev,
                                                                telegramChatId: e.target.value
                                                            }))}
                                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                                            placeholder="@username или chat_id"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Типы событий */}
                                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                                                📋 События для уведомлений
                                            </h3>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {[
                                                    { id: 'scan_completed', label: 'Завершение сканирования' },
                                                    { id: 'vulnerabilities_found', label: 'Обнаружение уязвимостей' },
                                                    { id: 'scan_failed', label: 'Ошибки сканирования' },
                                                    { id: 'system_alerts', label: 'Системные уведомления' }
                                                ].map((event) => (
                                                    <label key={event.id} className="flex items-center space-x-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={notificationSettings.notificationEvents.includes(event.id)}
                                                            onChange={(e) => {
                                                                const newEvents = e.target.checked
                                                                    ? [...notificationSettings.notificationEvents, event.id]
                                                                    : notificationSettings.notificationEvents.filter(id => id !== event.id);
                                                                setNotificationSettings(prev => ({
                                                                    ...prev,
                                                                    notificationEvents: newEvents
                                                                }));
                                                            }}
                                                            className="rounded text-blue-600"
                                                        />
                                                        <span className="text-sm text-gray-700 dark:text-gray-300">
                                                            {event.label}
                                                        </span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Тихие часы */}
                                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                                                🌙 Тихие часы
                                            </h3>

                                            <div className="space-y-4">
                                                <label className="flex items-center space-x-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={notificationSettings.quietHours.enabled}
                                                        onChange={(e) => setNotificationSettings(prev => ({
                                                            ...prev,
                                                            quietHours: { ...prev.quietHours, enabled: e.target.checked }
                                                        }))}
                                                        className="rounded text-blue-600"
                                                    />
                                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                                        Включить тихие часы
                                                    </span>
                                                </label>

                                                {notificationSettings.quietHours.enabled && (
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                                Начало
                                                            </label>
                                                            <input
                                                                type="time"
                                                                value={notificationSettings.quietHours.startTime}
                                                                onChange={(e) => setNotificationSettings(prev => ({
                                                                    ...prev,
                                                                    quietHours: { ...prev.quietHours, startTime: e.target.value }
                                                                }))}
                                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                                Окончание
                                                            </label>
                                                            <input
                                                                type="time"
                                                                value={notificationSettings.quietHours.endTime}
                                                                onChange={(e) => setNotificationSettings(prev => ({
                                                                    ...prev,
                                                                    quietHours: { ...prev.quietHours, endTime: e.target.value }
                                                                }))}
                                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        )}

                        {/* Секция: Внешний вид */}
                        {activeSection === 'appearance' && (
                            <Card>
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                            🎨 Настройки внешнего вида
                                        </h2>
                                        <Button
                                            onClick={() => saveSettings('appearance')}
                                            disabled={isSaving}
                                        >
                                            {isSaving ? 'Сохранение...' : 'Сохранить'}
                                        </Button>
                                    </div>

                                    <div className="space-y-6">
                                        {/* Выбор темы */}
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                                                🌓 Цветовая тема
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                {[
                                                    { id: 'light', name: 'Светлая', icon: '☀️', description: 'Классическое светлое оформление' },
                                                    { id: 'dark', name: 'Темная', icon: '🌙', description: 'Темное оформление для работы ночью' },
                                                    { id: 'auto', name: 'Авто', icon: '🌗', description: 'Переключение по системным настройкам' }
                                                ].map((themeOption) => (
                                                    <label
                                                        key={themeOption.id}
                                                        className={`
                              relative p-4 border-2 rounded-lg cursor-pointer transition-all
                              ${themeSettings.theme === themeOption.id
                                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                                            }
                            `}
                                                    >
                                                        <input
                                                            type="radio"
                                                            name="theme"
                                                            value={themeOption.id}
                                                            checked={themeSettings.theme === themeOption.id}
                                                            onChange={(e) => setThemeSettings(prev => ({
                                                                ...prev,
                                                                theme: e.target.value as any
                                                            }))}
                                                            className="sr-only"
                                                        />
                                                        <div className="flex items-center space-x-3">
                                                            <span className="text-2xl">{themeOption.icon}</span>
                                                            <div>
                                                                <div className="font-medium text-gray-900 dark:text-gray-100">
                                                                    {themeOption.name}
                                                                </div>
                                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                                    {themeOption.description}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Акцентный цвет */}
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                                                🎯 Акцентный цвет
                                            </h3>
                                            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                                                {[
                                                    { id: 'blue', name: 'Синий', color: 'bg-blue-500' },
                                                    { id: 'green', name: 'Зеленый', color: 'bg-green-500' },
                                                    { id: 'red', name: 'Красный', color: 'bg-red-500' },
                                                    { id: 'purple', name: 'Фиолетовый', color: 'bg-purple-500' },
                                                    { id: 'orange', name: 'Оранжевый', color: 'bg-orange-500' },
                                                    { id: 'teal', name: 'Бирюзовый', color: 'bg-teal-500' }
                                                ].map((accent) => (
                                                    <label
                                                        key={accent.id}
                                                        className={`
                              relative p-3 border-2 rounded-lg cursor-pointer transition-all
                              ${themeSettings.accent === accent.id
                                                                ? 'border-gray-900 dark:border-gray-100'
                                                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                                            }
                            `}
                                                    >
                                                        <input
                                                            type="radio"
                                                            name="accent"
                                                            value={accent.id}
                                                            checked={themeSettings.accent === accent.id}
                                                            onChange={(e) => setThemeSettings(prev => ({
                                                                ...prev,
                                                                accent: e.target.value
                                                            }))}
                                                            className="sr-only"
                                                        />
                                                        <div className="text-center">
                                                            <div className={`w-8 h-8 ${accent.color} rounded-full mx-auto mb-2`}></div>
                                                            <div className="text-xs text-gray-600 dark:text-gray-400">
                                                                {accent.name}
                                                            </div>
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Размер интерфейса */}
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                                                📏 Размер интерфейса
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                {[
                                                    { id: 'compact', name: 'Компактный', description: 'Больше информации на экране' },
                                                    { id: 'medium', name: 'Средний', description: 'Оптимальный размер' },
                                                    { id: 'large', name: 'Крупный', description: 'Увеличенные элементы' }
                                                ].map((sizeOption) => (
                                                    <label
                                                        key={sizeOption.id}
                                                        className={`
                              relative p-4 border-2 rounded-lg cursor-pointer transition-all
                              ${themeSettings.size === sizeOption.id
                                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                                            }
                            `}
                                                    >
                                                        <input
                                                            type="radio"
                                                            name="size"
                                                            value={sizeOption.id}
                                                            checked={themeSettings.size === sizeOption.id}
                                                            onChange={(e) => setThemeSettings(prev => ({
                                                                ...prev,
                                                                size: e.target.value as any
                                                            }))}
                                                            className="sr-only"
                                                        />
                                                        <div>
                                                            <div className="font-medium text-gray-900 dark:text-gray-100">
                                                                {sizeOption.name}
                                                            </div>
                                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                                                {sizeOption.description}
                                                            </div>
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Дополнительные настройки */}
                                        <div className="space-y-4">
                                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                                ⚙️ Дополнительные настройки
                                            </h3>

                                            <div className="space-y-3">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Размер шрифта: {themeSettings.fontSize}px
                                                    </label>
                                                    <input
                                                        type="range"
                                                        min={12}
                                                        max={18}
                                                        value={themeSettings.fontSize}
                                                        onChange={(e) => setThemeSettings(prev => ({
                                                            ...prev,
                                                            fontSize: parseInt(e.target.value)
                                                        }))}
                                                        className="w-full"
                                                    />
                                                </div>

                                                <label className="flex items-center space-x-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={themeSettings.highContrast}
                                                        onChange={(e) => setThemeSettings(prev => ({
                                                            ...prev,
                                                            highContrast: e.target.checked
                                                        }))}
                                                        className="rounded text-blue-600"
                                                    />
                                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                                        Высокий контраст (для лучшей читаемости)
                                                    </span>
                                                </label>

                                                <label className="flex items-center space-x-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={themeSettings.animations}
                                                        onChange={(e) => setThemeSettings(prev => ({
                                                            ...prev,
                                                            animations: e.target.checked
                                                        }))}
                                                        className="rounded text-blue-600"
                                                    />
                                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                                        Анимации интерфейса
                                                    </span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        )}

                        {/* Секция: Резервное копирование */}
                        {activeSection === 'backup' && (
                            <Card>
                                <div className="p-6">
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                                        💾 Резервное копирование и восстановление
                                    </h2>

                                    <div className="space-y-6">
                                        {/* Экспорт настроек */}
                                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                                                📤 Экспорт настроек
                                            </h3>
                                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                                Создайте резервную копию всех настроек приложения
                                            </p>
                                            <Button onClick={handleExportSettings}>
                                                📁 Экспортировать настройки
                                            </Button>
                                        </div>

                                        {/* Импорт настроек */}
                                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                                                📥 Импорт настроек
                                            </h3>
                                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                                Восстановите настройки из файла резервной копии
                                            </p>
                                            <div className="flex items-center space-x-4">
                                                <label className="cursor-pointer">
                                                    <input
                                                        type="file"
                                                        accept=".json"
                                                        onChange={handleImportSettings}
                                                        className="hidden"
                                                    />
                                                    <span className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                                                        📂 Выбрать файл
                                                    </span>
                                                </label>
                                            </div>
                                        </div>

                                        {/* Сброс настроек */}
                                        <div className="border border-red-200 dark:border-red-800 rounded-lg p-4">
                                            <h3 className="text-lg font-medium text-red-900 dark:text-red-100 mb-4">
                                                🔄 Сброс настроек
                                            </h3>
                                            <p className="text-red-600 dark:text-red-400 mb-4">
                                                ⚠️ Внимание! Это действие сбросит все настройки к значениям по умолчанию
                                            </p>
                                            <Button
                                                onClick={() => setShowResetModal(true)}
                                                className="bg-red-600 hover:bg-red-700 text-white"
                                            >
                                                🗑️ Сбросить все настройки
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        )}

                        {/* Секция: Система */}
                        {activeSection === 'system' && (
                            <Card>
                                <div className="p-6">
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                                        ⚙️ Системная информация
                                    </h2>

                                    <div className="space-y-6">
                                        {/* Информация о приложении */}
                                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                                                📱 Информация о приложении
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600 dark:text-gray-400">Версия:</span>
                                                    <span className="font-medium">IP Roast v2.1.0</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600 dark:text-gray-400">Сборка:</span>
                                                    <span className="font-medium">2025.01.15</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600 dark:text-gray-400">Браузер:</span>
                                                    <span className="font-medium">{navigator.userAgent.split(' ')[0]}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600 dark:text-gray-400">Платформа:</span>
                                                    <span className="font-medium">{navigator.platform}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Использование хранилища */}
                                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                                                💾 Использование хранилища
                                            </h3>
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-600 dark:text-gray-400">LocalStorage:</span>
                                                    <span className="font-medium">
                                                        {formatFileSize(JSON.stringify(localStorage).length)}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-600 dark:text-gray-400">Настройки:</span>
                                                    <span className="font-medium">
                                                        {Object.keys(localStorage).filter(key => key.startsWith('ip-roast')).length} записей
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Диагностика */}
                                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                                                🔧 Диагностика
                                            </h3>
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-600 dark:text-gray-400">WebSocket поддержка:</span>
                                                    <StatusIndicator
                                                        status={typeof WebSocket !== 'undefined' ? 'online' : 'offline'}
                                                        size="sm"
                                                    />
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-600 dark:text-gray-400">LocalStorage:</span>
                                                    <StatusIndicator
                                                        status={typeof Storage !== 'undefined' ? 'online' : 'offline'}
                                                        size="sm"
                                                    />
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-600 dark:text-gray-400">Service Worker:</span>
                                                    <StatusIndicator
                                                        status={'serviceWorker' in navigator ? 'online' : 'offline'}
                                                        size="sm"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        )}
                    </div>
                </div>
            </div>

            {/* Модальное окно сброса настроек */}
            {showResetModal && (
                <Modal
                    isOpen={true}
                    onClose={() => setShowResetModal(false)}
                    title="Подтверждение сброса настроек"
                >
                    <div className="space-y-4">
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                            <div className="flex items-start space-x-3">
                                <span className="text-red-600 dark:text-red-400 text-xl">⚠️</span>
                                <div>
                                    <h4 className="font-medium text-red-800 dark:text-red-200">
                                        Внимание! Это действие нельзя отменить
                                    </h4>
                                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                                        Все настройки будут сброшены к значениям по умолчанию.
                                        Рекомендуем создать резервную копию перед продолжением.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <p className="text-gray-600 dark:text-gray-400">
                            Будут сброшены следующие настройки:
                        </p>
                        <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            <li>Профиль пользователя</li>
                            <li>Настройки сканирования</li>
                            <li>Уведомления</li>
                            <li>Внешний вид и тема</li>
                            <li>Локальные данные</li>
                        </ul>

                        <div className="flex justify-end space-x-3 pt-4">
                            <Button
                                variant="outline"
                                onClick={() => setShowResetModal(false)}
                            >
                                Отменить
                            </Button>
                            <Button
                                onClick={() => {
                                    handleResetSettings();
                                    setShowResetModal(false);
                                }}
                                className="bg-red-600 hover:bg-red-700 text-white"
                            >
                                🔄 Сбросить настройки
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Модальное окно создания API ключа */}
            {showApiKeyModal && (
                <Modal
                    isOpen={true}
                    onClose={() => setShowApiKeyModal(false)}
                    title="Создание API ключа"
                >
                    <ApiKeyForm
                        onSubmit={handleCreateApiKey}
                        onCancel={() => setShowApiKeyModal(false)}
                    />
                </Modal>
            )}
        </div>
    );
};

// Компонент формы создания API ключа
interface ApiKeyFormProps {
    onSubmit: (keyData: Partial<ApiKey>) => void;
    onCancel: () => void;
}

const ApiKeyForm: React.FC<ApiKeyFormProps> = ({ onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        name: '',
        permissions: ['read'] as string[]
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.name.trim()) {
            onSubmit(formData);
        }
    };

    const togglePermission = (permission: string) => {
        setFormData(prev => ({
            ...prev,
            permissions: prev.permissions.includes(permission)
                ? prev.permissions.filter(p => p !== permission)
                : [...prev.permissions, permission]
        }));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Название ключа
                </label>
                <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    placeholder="Мой API ключ"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Разрешения
                </label>
                <div className="space-y-2">
                    {[
                        { id: 'read', label: 'Чтение' },
                        { id: 'write', label: 'Запись' },
                        { id: 'scan', label: 'Запуск сканирования' },
                        { id: 'admin', label: 'Администрирование' }
                    ].map((permission) => (
                        <label key={permission.id} className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={formData.permissions.includes(permission.id)}
                                onChange={() => togglePermission(permission.id)}
                                className="rounded text-blue-600"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                {permission.label}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
                <Button variant="outline" onClick={onCancel}>
                    Отменить
                </Button>
                <Button type="submit">
                    🔑 Создать ключ
                </Button>
            </div>
        </form>
    );
};

export default SettingsPage;
