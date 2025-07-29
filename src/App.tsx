import React, { Suspense, useEffect, useState, useCallback } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { ErrorBoundary, FallbackProps } from 'react-error-boundary'

// Layout компоненты
import Layout from './components/layout/Layout'
import { Header } from './components/layout/Header'
// import Footer from './components/layout/Footer' // Закомментировано до создания модуля

// Страницы
// import HomePage from './pages/HomePage' // Закомментировано, так как не используется
import ScannerPage from './pages/ScannerPage'
import ReconPage from './pages/ReconPage'
import ReportsPage from './pages/ReportsPage'
import SettingsPage from './pages/SettingsPage'
import NotFoundPage from './pages/NotFoundPage'

// Общие компоненты
import LoadingSpinner from './components/common/LoadingSpinner'
// import ErrorFallback from './components/common/ErrorFallback' // Закомментировано до создания
import Toast from './components/common/Toast'

// Хуки и утилиты
import { useTheme } from './hooks/useTheme'
import { useNotifications } from './hooks/useNotifications'
import { useWebSocket } from './hooks/useWebSocket'
import { useLocalStorage } from './hooks/useLocalStorage'

// Сервисы
import { initializeServices } from './services/api'

// Типы (добавляем недостающие интерфейсы)
interface AppState {
    isInitialized: boolean;
    isLoading: boolean;
    hasError: boolean;
    user: User | null;
    currentScan: ScanStatus | null;
}

interface User {
    id: string;
    username: string;
    role: string;
    email?: string;
}

interface ScanStatus {
    id: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    progress?: number;
    target?: string;
    startTime?: string;
}

// Константы
const ROUTES = {
    HOME: '/',
    SCANNER: '/scanner',
    RECON: '/recon',
    REPORTS: '/reports',
    SETTINGS: '/settings'
} as const;

const STORAGE_KEYS = {
    LAST_ROUTE: 'lastRoute',
    USER_PREFERENCES: 'userPreferences',
    APP_STATE: 'appState'
} as const;

// Интерфейсы
interface AppContextValue {
    isInitialized: boolean;
    isLoading: boolean;
    user: User | null;
    currentScan: ScanStatus | null;
    appVersion: string;
    buildInfo: {
        version: string;
        buildTime: string;
        gitHash: string;
    };
}

interface UserPreferences {
    theme: string;
    notifications: boolean;
    autoSave: boolean;
    language: string;
}

// Контекст приложения
const AppContext = React.createContext<AppContextValue | null>(null);

export const useApp = () => {
    const context = React.useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within AppProvider');
    }
    return context;
};

// Функция валидации окружения (создаем недостающую)
const validateEnvironment = () => {
    const missing: string[] = [];
    const checks = {
        fetch: typeof fetch !== 'undefined',
        localStorage: typeof localStorage !== 'undefined',
        sessionStorage: typeof sessionStorage !== 'undefined',
        WebSocket: typeof WebSocket !== 'undefined'
    };

    Object.entries(checks).forEach(([key, available]) => {
        if (!available) {
            missing.push(key);
        }
    });

    return {
        isSupported: missing.length === 0,
        missing
    };
};

// Утилита для логирования ошибок (создаем недостающую)
const ErrorLogger = {
    logError: (error: Error | unknown, context: string, metadata?: Record<string, any>) => {
        const errorData = {
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : null,
            context,
            metadata,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        };

        console.error(`[${context}]`, errorData);

        // В продакшене здесь можно отправлять на сервер мониторинга
        if (import.meta.env.PROD) {
            // Отправка на сервер логирования
        }
    }
};

// Простой компонент ErrorFallback
const ErrorFallback: React.FC<FallbackProps> = ({ error, resetErrorBoundary }) => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Произошла ошибка
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
                {error.message}
            </p>
            <div className="space-y-2">
                <button
                    onClick={resetErrorBoundary}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    Попробовать снова
                </button>
                <button
                    onClick={() => window.location.reload()}
                    className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    Перезагрузить страницу
                </button>
            </div>

            {/* Детали ошибки для разработки */}
            {import.meta.env.DEV && (
                <details className="mt-4 text-left">
                    <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                        Детали ошибки (dev)
                    </summary>
                    <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded overflow-auto max-h-32">
                        {error.stack}
                    </pre>
                </details>
            )}
        </div>
    </div>
);

// Компонент для восстановления маршрута
const RouteRestore: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const location = useLocation();
    const [lastRoute, setLastRoute] = useLocalStorage<string>(STORAGE_KEYS.LAST_ROUTE, ROUTES.HOME);

    useEffect(() => {
        // Сохраняем текущий маршрут
        if (location.pathname !== lastRoute) {
            setLastRoute(location.pathname);
        }
    }, [location.pathname, lastRoute, setLastRoute]);

    return <>{children}</>;
};

// Компонент загрузки приложения
const AppLoader: React.FC = () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
            <LoadingSpinner size="lg" />
            <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
                Загрузка IP Roast
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
                Инициализация системы безопасности...
            </p>
        </div>
    </div>
);

// Компонент маршрутов  
const AppRoutes: React.FC = () => {
    return (
        <Routes>
            {/* Главная страница - редирект на сканер */}
            <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.SCANNER} replace />} />

            {/* Основные страницы */}
            <Route
                path={ROUTES.SCANNER}
                element={
                    <Suspense fallback={<LoadingSpinner />}>
                        <ScannerPage />
                    </Suspense>
                }
            />

            <Route
                path={ROUTES.RECON}
                element={
                    <Suspense fallback={<LoadingSpinner />}>
                        <ReconPage />
                    </Suspense>
                }
            />

            <Route
                path={ROUTES.REPORTS}
                element={
                    <Suspense fallback={<LoadingSpinner />}>
                        <ReportsPage />
                    </Suspense>
                }
            />

            <Route
                path={ROUTES.SETTINGS}
                element={
                    <Suspense fallback={<LoadingSpinner />}>
                        <SettingsPage />
                    </Suspense>
                }
            />

            {/* 404 страница */}
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
};

// Главный компонент приложения
const App: React.FC = () => {
    // Состояние приложения
    const [appState, setAppState] = useState<AppState>({
        isInitialized: false,
        isLoading: true,
        hasError: false,
        user: null,
        currentScan: null
    });

    // Хуки
    const { theme, toggleTheme, setTheme } = useTheme();
    const { notifications, addNotification, removeNotification } = useNotifications();
    const websocketUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:5000';
    const { connectionStatus } = useWebSocket(websocketUrl);

    // Проверяем подключение WebSocket
    const wsConnected = connectionStatus === 'connected';

    // Локальное хранилище для настроек
    const [userPreferences, setUserPreferences] = useLocalStorage<UserPreferences>(
        STORAGE_KEYS.USER_PREFERENCES,
        {
            theme: 'auto',
            notifications: true,
            autoSave: true,
            language: 'ru'
        }
    );

    // Информация о сборке
    const buildInfo = {
        version: import.meta.env.VITE_APP_VERSION || '4.0.0',
        buildTime: import.meta.env.VITE_BUILD_TIME || new Date().toISOString(),
        gitHash: import.meta.env.VITE_GIT_HASH || 'unknown'
    };

    // Инициализация приложения
    const initializeApp = useCallback(async () => {
        try {
            console.log('🚀 Инициализация IP Roast App...');

            // 1. Проверяем совместимость браузера
            const environmentCheck = validateEnvironment();
            if (!environmentCheck.isSupported) {
                throw new Error(`Браузер не поддерживается: ${environmentCheck.missing.join(', ')}`);
            }

            // 2. Инициализируем сервисы
            await initializeServices();

            // 3. Восстанавливаем пользовательские настройки
            if (userPreferences.theme && userPreferences.theme !== theme) {
                setTheme(userPreferences.theme as any);
            }

            // 4. Проверяем наличие активного сканирования
            const activeScanId = localStorage.getItem('activeScanId');
            if (activeScanId) {
                console.log(`🔍 Обнаружено активное сканирование: ${activeScanId}`);
                // Здесь можно восстановить состояние сканирования
            }

            // 5. Обновляем состояние
            setAppState(prev => ({
                ...prev,
                isInitialized: true,
                isLoading: false,
                hasError: false
            }));

            // 6. Показываем уведомление о готовности
            addNotification({
                type: 'success',
                title: 'IP Roast готов',
                message: 'Система успешно загружена и готова к работе',
                duration: 3000,
                category: 'system',
                priority: 'low'
            });

            console.log('✅ IP Roast App успешно инициализирован');
        } catch (error) {
            console.error('❌ Ошибка инициализации приложения:', error);

            setAppState(prev => ({
                ...prev,
                isLoading: false,
                hasError: true
            }));

            addNotification({
                type: 'error',
                title: 'Ошибка инициализации',
                message: error instanceof Error ? error.message : 'Неизвестная ошибка',
                duration: 0,
                category: 'system',
                priority: 'high'
            });

            // Логируем ошибку
            ErrorLogger.logError(error, 'APP_INITIALIZATION');
        }
    }, [theme, setTheme, userPreferences, addNotification]);

    // Обработчик ошибок приложения
    const handleAppError = useCallback((error: Error, errorInfo: any) => {
        console.error('🚨 Критическая ошибка приложения:', error, errorInfo);

        ErrorLogger.logError(error, 'APP_CRITICAL', {
            componentStack: errorInfo.componentStack,
            buildInfo,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
        });

        addNotification({
            type: 'error',
            title: 'Критическая ошибка',
            message: 'Произошла неожиданная ошибка. Попробуйте перезагрузить страницу.',
            duration: 0,
            category: 'system',
            priority: 'high'
        });
    }, [addNotification, buildInfo]);

    // Обработчик восстановления после ошибки
    const handleErrorReset = useCallback(() => {
        setAppState(prev => ({
            ...prev,
            hasError: false,
            isLoading: true
        }));

        // Перезапускаем инициализацию
        setTimeout(initializeApp, 1000);
    }, [initializeApp]);

    // Контекстное значение
    const contextValue: AppContextValue = {
        isInitialized: appState.isInitialized,
        isLoading: appState.isLoading,
        user: appState.user,
        currentScan: appState.currentScan,
        appVersion: buildInfo.version,
        buildInfo
    };

    // Эффект инициализации
    useEffect(() => {
        initializeApp();
    }, [initializeApp]);

    // Эффект для обработки горячих клавиш
    useEffect(() => {
        const handleKeyboard = (event: KeyboardEvent) => {
            // Ctrl/Cmd + Shift + D - переключение темы
            if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'D') {
                event.preventDefault();
                toggleTheme();
            }

            // Ctrl/Cmd + K - фокус на поиск
            if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
                event.preventDefault();
                const targetInput = document.getElementById('targetInput') as HTMLInputElement;
                if (targetInput) {
                    targetInput.focus();
                    targetInput.select();
                }
            }
        };

        document.addEventListener('keydown', handleKeyboard);
        return () => document.removeEventListener('keydown', handleKeyboard);
    }, [toggleTheme]);

    // Эффект для обработки видимости страницы
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                console.log('👁️ Страница стала видимой');
                // Можно обновить данные или восстановить соединения
            } else {
                console.log('🫥 Страница скрыта');
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, []);

    // Сохраняем настройки пользователя при изменении
    useEffect(() => {
        setUserPreferences(prev => ({
            ...prev,
            theme
        }));
    }, [theme, setUserPreferences]);

    // Мониторинг состояния WebSocket
    useEffect(() => {
        if (wsConnected) {
            console.log('🌐 WebSocket подключен');
        } else {
            console.log('🔌 WebSocket отключен');
        }
    }, [wsConnected]);

    // Если произошла критическая ошибка
    if (appState.hasError) {
        return (
            <ErrorFallback
                error={new Error('Критическая ошибка приложения')}
                resetErrorBoundary={handleErrorReset}
            />
        );
    }

    // Если приложение еще загружается
    if (appState.isLoading || !appState.isInitialized) {
        return <AppLoader />;
    }

    // Основной рендер приложения
    return (
        <ErrorBoundary
            FallbackComponent={ErrorFallback}
            onError={handleAppError}
            onReset={handleErrorReset}
        >
            <AppContext.Provider value={contextValue}>
                <Router>
                    <RouteRestore>
                        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
                            {/* Заголовок */}
                            <Header />

                            {/* Основной контент */}
                            <Layout>
                                <main className="flex-1">
                                    <AppRoutes />
                                </main>
                            </Layout>

                            {/* Футер - закомментирован до создания модуля */}
                            {/* <Footer /> */}

                            {/* Система уведомлений */}
                            <div className="fixed top-4 right-4 z-50 space-y-2">
                                {notifications.map(notification => {
                                    // Преобразуем недопустимые типы в допустимые
                                    const getValidToastType = (type: string): 'success' | 'error' | 'warning' | 'info' => {
                                        switch (type) {
                                            case 'success':
                                            case 'error':
                                            case 'warning':
                                            case 'info':
                                                return type;
                                            case 'security':
                                                return 'warning';
                                            case 'system':
                                                return 'info';
                                            default:
                                                return 'info';
                                        }
                                    };

                                    return (
                                        <Toast
                                            key={notification.id}
                                            type={getValidToastType(notification.type)}
                                            title={notification.title}
                                            message={notification.message}
                                            duration={notification.duration}
                                            onClose={() => removeNotification(notification.id)}
                                        />
                                    );
                                })}
                            </div>

                            {/* Индикатор соединения WebSocket */}
                            {!wsConnected && (
                                <div className="fixed bottom-4 left-4 bg-yellow-500 text-white px-3 py-1 rounded-lg text-sm shadow-lg">
                                    <div className="flex items-center space-x-2">
                                        <div className="animate-spin w-3 h-3 border border-white border-t-transparent rounded-full"></div>
                                        <span>Переподключение...</span>
                                    </div>
                                </div>
                            )}

                            {/* Debug панель для разработки */}
                            {import.meta.env.DEV && (
                                <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white p-2 rounded text-xs font-mono shadow-lg">
                                    <div className="space-y-1">
                                        <div className="flex items-center space-x-2">
                                            <span>WS:</span>
                                            <span className={wsConnected ? 'text-green-400' : 'text-red-400'}>
                                                {wsConnected ? '🟢 Connected' : '🔴 Disconnected'}
                                            </span>
                                        </div>
                                        <div>Theme: <span className="text-blue-400">{theme}</span></div>
                                        <div>Build: <span className="text-purple-400">{buildInfo.version}</span></div>
                                        <div className="text-xs text-gray-400 pt-1 border-t border-gray-600">
                                            IP Roast Enterprise v4.0
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Индикатор состояния приложения */}
                            {appState.isInitialized && (
                                <div className="fixed top-4 left-4 z-40">
                                    <div className="flex items-center space-x-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-lg text-sm shadow-sm">
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                        <span>Система готова</span>
                                    </div>
                                </div>
                            )}

                            {/* Индикатор активного сканирования */}
                            {appState.currentScan && appState.currentScan.status === 'running' && (
                                <div className="fixed top-16 left-4 z-40">
                                    <div className="flex items-center space-x-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-lg text-sm shadow-sm">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                        <span>Сканирование активно</span>
                                        {appState.currentScan.progress && (
                                            <span className="font-mono">
                                                {Math.round(appState.currentScan.progress)}%
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </RouteRestore>
                </Router>
            </AppContext.Provider>
        </ErrorBoundary>
    );
};

// Экспорт контекста для использования в других компонентах
export { AppContext };

// Экспорт по умолчанию
export default App;
