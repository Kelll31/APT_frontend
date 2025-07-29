import React, { Suspense, useEffect, useState, useCallback } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { ErrorBoundary } from 'react-error-boundary'

// Layout компоненты
import Layout from './components/layout/Layout'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'

// Страницы
import HomePage from './pages/HomePage'
import ScannerPage from './pages/ScannerPage'
import ReconPage from './pages/ReconPage'
import ReportsPage from './pages/ReportsPage'
import SettingsPage from './pages/SettingsPage'
import NotFoundPage from './pages/NotFoundPage'

// Общие компоненты
import LoadingSpinner from './components/common/LoadingSpinner'
import ErrorFallback from './components/common/ErrorFallback'
import Toast from './components/common/Toast'

// Хуки и утилиты
import { useTheme } from './hooks/useTheme'
import { useNotifications } from './hooks/useNotifications'
import { useWebSocket } from './hooks/useWebSocket'
import { useLocalStorage } from './hooks/useLocalStorage'

// Сервисы
import { initializeServices } from './services/api'
import { validateEnvironment } from './utils/validators'
import { ErrorLogger } from './utils/helpers'

// Типы
import type { AppState, User, ScanStatus } from './types/api'

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

// Контекст приложения
const AppContext = React.createContext<AppContextValue | null>(null);

export const useApp = () => {
    const context = React.useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within AppProvider');
    }
    return context;
};

// Компонент для восстановления маршрута
const RouteRestore: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const location = useLocation();
    const [lastRoute, setLastRoute] = useLocalStorage(STORAGE_KEYS.LAST_ROUTE, ROUTES.HOME);

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-2xl shadow-lg">
                <svg
                    className="w-10 h-10 text-white animate-pulse"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                </svg>
            </div>
            <div className="space-y-2">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Загрузка IP Roast
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                    Инициализация системы безопасности...
                </p>
            </div>
            <LoadingSpinner size="lg" />
        </div>
    </div>
);

// Компонент маршрутов
const AppRoutes: React.FC = () => {
    const { notifications } = useNotifications();

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
    const { isConnected: wsConnected, connectionStatus } = useWebSocket();

    // Локальное хранилище для настроек
    const [userPreferences, setUserPreferences] = useLocalStorage(STORAGE_KEYS.USER_PREFERENCES, {
        theme: 'auto',
        notifications: true,
        autoSave: true,
        language: 'ru'
    });

    // Информация о сборке
    const buildInfo = {
        version: import.meta.env.VITE_APP_VERSION || '2.1.0',
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
            await initializeServices({
                apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000',
                wsUrl: import.meta.env.VITE_WS_URL || 'http://localhost:5000',
                enableDevMode: import.meta.env.DEV
            });

            // 3. Восстанавливаем пользовательские настройки
            if (userPreferences.theme && userPreferences.theme !== theme) {
                setTheme(userPreferences.theme);
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
                duration: 3000
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
                duration: 0 // Не скрывать автоматически
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
            duration: 0
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
            <AppContext.Provider value={contextValue}>
                <ErrorFallback
                    error={new Error('Критическая ошибка приложения')}
                    resetError={handleErrorReset}
                    buildInfo={buildInfo}
                />
            </AppContext.Provider>
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
                        <div
                            className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200"
                            data-theme={theme}
                        >
                            {/* Заголовок */}
                            <Header
                                wsConnected={wsConnected}
                                connectionStatus={connectionStatus}
                                currentScan={appState.currentScan}
                            />

                            {/* Основной контент */}
                            <main className="flex-1">
                                <Layout>
                                    <Suspense fallback={
                                        <div className="flex items-center justify-center min-h-96">
                                            <LoadingSpinner size="lg" />
                                        </div>
                                    }>
                                        <AppRoutes />
                                    </Suspense>
                                </Layout>
                            </main>

                            {/* Футер */}
                            <Footer buildInfo={buildInfo} />

                            {/* Система уведомлений */}
                            <div className="fixed bottom-4 right-4 z-50 space-y-2">
                                {notifications.map(notification => (
                                    <Toast
                                        key={notification.id}
                                        {...notification}
                                        onClose={() => removeNotification(notification.id)}
                                    />
                                ))}
                            </div>

                            {/* Индикатор соединения WebSocket */}
                            {!wsConnected && (
                                <div className="fixed top-16 right-4 z-40">
                                    <div className="bg-yellow-100 dark:bg-yellow-900 border border-yellow-400 dark:border-yellow-600 text-yellow-800 dark:text-yellow-200 px-3 py-2 rounded-lg shadow-lg text-sm">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                                            <span>Переподключение...</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Debug панель для разработки */}
                            {import.meta.env.DEV && (
                                <div className="fixed bottom-4 left-4 z-50">
                                    <div className="bg-black bg-opacity-75 text-white text-xs p-2 rounded font-mono">
                                        <div>WS: {wsConnected ? '🟢' : '🔴'}</div>
                                        <div>Theme: {theme}</div>
                                        <div>Build: {buildInfo.version}</div>
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
