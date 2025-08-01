import React from 'react'
import ReactDOM from 'react-dom/client'
import { ErrorBoundary } from 'react-error-boundary'

// Основной компонент приложения
import App from './App.tsx'

// Глобальные стили
import './styles/globals.css'
import './styles/variables.css'
import './styles/components.css'
import './styles/themes/light.css'
import './styles/themes/dark.css'
import './styles/themes/auto.css'

// Провайдеры состояния
import { ThemeProvider } from './stores/themeStore'
import { NotificationProvider } from './stores/notificationStore.js'
import { SettingsProvider } from './stores/settingsStore.js'

// Менеджеры и сервисы
import { initializeIPRoastCore } from './utils/core-initializer'
import { validateEnvironment } from './utils/validators'
import { ErrorFallback } from './components/common/ErrorFallback'

// Типы
interface IPRoastWindow extends Window {
    __IP_ROAST_CONFIG__: {
        version: string;
        build: string;
        api: {
            baseUrl: string;
            timeout: number;
        };
        websocket: {
            url: string;
            namespace: string;
        };
        features: {
            notifications: boolean;
            analytics: boolean;
            errorReporting: boolean;
            performance: boolean;
        };
    };
    __BROWSER_SUPPORT__: {
        webSockets: boolean;
        localStorage: boolean;
        sessionStorage: boolean;
        fetch: boolean;
        promises: boolean;
        modules: boolean;
        intersectionObserver: boolean;
        resizeObserver: boolean;
    };
    hideInitialLoading?: () => void;
}

declare const window: IPRoastWindow;

// Конфигурация приложения
const APP_CONFIG = {
    version: '2.1.0',
    appName: 'IP Roast',
    environment: import.meta.env.MODE,
    apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000',
    wsUrl: import.meta.env.VITE_WS_URL || 'http://localhost:5000',
    enableDevTools: import.meta.env.DEV,
    performance: {
        enableMetrics: true,
        trackUserInteractions: false,
        trackErrors: true
    }
};

/**
 * Обработчик глобальных ошибок React
 */
function handleReactError(error: Error, errorInfo: { componentStack: string }) {
    console.error('🚨 React Error Boundary:', error, errorInfo);

    // Отправляем ошибку в систему аналитики (если включена)
    if (APP_CONFIG.performance.trackErrors) {
        try {
            // Здесь можно интегрировать с Sentry, LogRocket, etc.
            const errorData = {
                message: error.message,
                stack: error.stack,
                componentStack: errorInfo.componentStack,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                url: window.location.href,
                version: APP_CONFIG.version
            };

            console.error('📊 Error Analytics Data:', errorData);
        } catch (analyticsError) {
            console.warn('⚠️ Failed to send error analytics:', analyticsError);
        }
    }
}

/**
 * Инициализация системы производительности
 */
function initializePerformanceMonitoring() {
    if (!APP_CONFIG.performance.enableMetrics) return;

    // Core Web Vitals monitoring
    if ('PerformanceObserver' in window) {
        try {
            // Largest Contentful Paint (LCP)
            const lcpObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    console.log('📊 LCP:', entry);
                }
            });
            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

            // Cumulative Layout Shift (CLS)
            const clsObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (!(entry as any).hadRecentInput) {
                        console.log('📊 CLS:', entry);
                    }
                }
            });
            clsObserver.observe({ entryTypes: ['layout-shift'] });

            // First Input Delay (FID)
            const fidObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    console.log('📊 FID:', entry);
                }
            });
            fidObserver.observe({ entryTypes: ['first-input'] });

        } catch (error) {
            console.warn('⚠️ Performance monitoring setup failed:', error);
        }
    }
}

/**
 * Инициализация системы тем
 */
function initializeThemeSystem() {
    console.log('🎨 Инициализация системы тем...');

    try {
        // Загружаем сохраненные настройки
        const savedTheme = localStorage.getItem('theme') || 'auto';
        const savedAccent = localStorage.getItem('accent') || 'blue';
        const savedSize = localStorage.getItem('interfaceSize') || 'medium';
        const savedHighContrast = localStorage.getItem('highContrast') === 'true';

        // Применяем к документу
        document.documentElement.setAttribute('data-theme', savedTheme);
        document.documentElement.setAttribute('data-accent', savedAccent);
        document.documentElement.setAttribute('data-size', savedSize);
        document.documentElement.setAttribute('data-high-contrast', savedHighContrast.toString());

        // Обработка автоматической темы
        if (savedTheme === 'auto') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const updateAutoTheme = () => {
                const actualTheme = mediaQuery.matches ? 'dark' : 'light';
                document.documentElement.setAttribute('data-auto-theme', actualTheme);
            };

            updateAutoTheme();
            mediaQuery.addEventListener('change', updateAutoTheme);
        }

        console.log('✅ Система тем инициализирована');
    } catch (error) {
        console.error('❌ Ошибка инициализации системы тем:', error);
        // Fallback на светлую тему
        document.documentElement.setAttribute('data-theme', 'light');
        document.documentElement.setAttribute('data-accent', 'blue');
        document.documentElement.setAttribute('data-size', 'medium');
    }
}

/**
 * Инициализация системы горячих клавиш
 */
function initializeKeyboardShortcuts() {
    console.log('⌨️ Инициализация горячих клавиш...');

    document.addEventListener('keydown', (event) => {
        // Ctrl/Cmd + K - Фокус на поле поиска/цели
        if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
            event.preventDefault();
            const targetInput = document.querySelector('#targetInput') as HTMLInputElement;
            if (targetInput) {
                targetInput.focus();
                targetInput.select();
            }
        }

        // Ctrl/Cmd + Enter - Запуск сканирования
        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
            event.preventDefault();
            const startButton = document.querySelector('#startScanBtn') as HTMLButtonElement;
            if (startButton && !startButton.disabled) {
                startButton.click();
            }
        }

        // Escape - Остановка сканирования или закрытие модальных окон
        if (event.key === 'Escape') {
            const stopButton = document.querySelector('#stopScanBtn') as HTMLButtonElement;
            if (stopButton && !stopButton.disabled) {
                stopButton.click();
            }
        }

        // Ctrl/Cmd + Shift + D - Переключение темы
        if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'D') {
            event.preventDefault();
            const currentTheme = localStorage.getItem('theme') || 'auto';
            const themes = ['light', 'dark', 'auto'];
            const currentIndex = themes.indexOf(currentTheme);
            const nextTheme = themes[(currentIndex + 1) % themes.length];

            localStorage.setItem('theme', nextTheme);
            document.documentElement.setAttribute('data-theme', nextTheme);

            console.log(`🌓 Тема переключена на: ${nextTheme}`);
        }
    });

    console.log('✅ Горячие клавиши инициализированы');
}

/**
 * Настройка Service Worker для PWA
 */
async function initializeServiceWorker() {
    if ('serviceWorker' in navigator && import.meta.env.PROD) {
        try {
            console.log('🔧 Регистрация Service Worker...');

            const registration = await navigator.serviceWorker.register('/sw.js', {
                scope: '/'
            });

            console.log('✅ Service Worker зарегистрирован:', registration.scope);

            // Проверяем обновления
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                if (newWorker) {
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // Новая версия доступна
                            console.log('🆕 Новая версия приложения доступна');

                            // Можно показать уведомление пользователю
                            const event = new CustomEvent('sw-update-available', {
                                detail: { registration }
                            });
                            window.dispatchEvent(event);
                        }
                    });
                }
            });

        } catch (error) {
            console.warn('⚠️ Service Worker регистрация не удалась:', error);
        }
    }
}

/**
 * Инициализация обработчиков глобальных событий
 */
function initializeGlobalEventHandlers() {
    console.log('🌐 Инициализация глобальных обработчиков...');

    // Обработка видимости страницы
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            console.log('👁️ Страница стала видимой');
            // Можно обновить данные, восстановить WebSocket соединения и т.д.
            window.dispatchEvent(new CustomEvent('page-visible'));
        } else {
            console.log('🫥 Страница скрыта');
            window.dispatchEvent(new CustomEvent('page-hidden'));
        }
    });

    // Обработка онлайн/офлайн статуса
    window.addEventListener('online', () => {
        console.log('🌐 Соединение восстановлено');
        window.dispatchEvent(new CustomEvent('connection-restored'));
    });

    window.addEventListener('offline', () => {
        console.log('📴 Соединение потеряно');
        window.dispatchEvent(new CustomEvent('connection-lost'));
    });

    // Обработка перед закрытием страницы
    window.addEventListener('beforeunload', (event) => {
        // Проверяем, есть ли активное сканирование
        const isScanning = localStorage.getItem('activeScanId');
        if (isScanning) {
            event.preventDefault();
            event.returnValue = 'У вас есть активное сканирование. Вы уверены, что хотите покинуть страницу?';
            return event.returnValue;
        }
    });

    console.log('✅ Глобальные обработчики инициализированы');
}

/**
 * Основная функция инициализации приложения
 */
async function initializeApplication() {
    console.log('🚀 Инициализация IP Roast v' + APP_CONFIG.version);

    try {
        // 1. Проверяем браузерную поддержку
        const browserSupport = validateEnvironment();
        if (!browserSupport.isSupported) {
            console.error('❌ Браузер не поддерживается:', browserSupport.missing);
            throw new Error(`Браузер не поддерживается. Отсутствуют: ${browserSupport.missing.join(', ')}`);
        }

        // 2. Инициализируем системы
        initializeThemeSystem();
        initializeKeyboardShortcuts();
        initializeGlobalEventHandlers();
        initializePerformanceMonitoring();

        // 3. Инициализируем базовые сервисы IP Roast
        await initializeIPRoastCore({
            apiUrl: APP_CONFIG.apiUrl,
            wsUrl: APP_CONFIG.wsUrl,
            enableDevTools: APP_CONFIG.enableDevTools
        });

        // 4. Настраиваем Service Worker
        await initializeServiceWorker();

        console.log('✅ Инициализация завершена успешно');
        return true;

    } catch (error) {
        console.error('❌ Критическая ошибка инициализации:', error);
        throw error;
    }
}

/**
 * Основной компонент приложения с провайдерами
 */
const IPRoastApp: React.FC = () => {
    return (
        <ErrorBoundary
            FallbackComponent={ErrorFallback}
            onError={handleReactError}
            onReset={() => {
                // Перезагружаем страницу при сбросе ошибки
                window.location.reload();
            }}
        >
            <React.StrictMode>
                <ThemeProvider>
                    <SettingsProvider>
                        <NotificationProvider>
                            <App />
                        </NotificationProvider>
                    </SettingsProvider>
                </ThemeProvider>
            </React.StrictMode>
        </ErrorBoundary>
    );
};

/**
 * Запуск приложения
 */
async function bootstrap() {
    try {
        console.log('🎯 Запуск IP Roast Bootstrap...');

        // Получаем корневой элемент
        const rootElement = document.getElementById('root');
        if (!rootElement) {
            throw new Error('Корневой элемент #root не найден');
        }

        // Инициализируем приложение
        await initializeApplication();

        // Создаем React root и рендерим приложение
        const root = ReactDOM.createRoot(rootElement);

        root.render(<IPRoastApp />);

        // Скрываем экран загрузки
        setTimeout(() => {
            if (window.hideInitialLoading) {
                window.hideInitialLoading();
            }
        }, 500);

        console.log('🎉 IP Roast успешно запущен!');

        // Отправляем событие о готовности приложения
        window.dispatchEvent(new CustomEvent('ip-roast-ready', {
            detail: {
                version: APP_CONFIG.version,
                environment: APP_CONFIG.environment,
                timestamp: new Date().toISOString()
            }
        }));

    } catch (error) {
        console.error('💥 Критическая ошибка запуска приложения:', error);

        // Показываем fallback UI
        const rootElement = document.getElementById('root');
        if (rootElement) {
            rootElement.innerHTML = `
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 2rem;
          text-align: center;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: #f8fafc;
          color: #1f2937;
        ">
          <div style="
            background: white;
            padding: 3rem;
            border-radius: 1rem;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            max-width: 500px;
            width: 100%;
          ">
            <div style="font-size: 4rem; margin-bottom: 1rem;">🚨</div>
            <h1 style="margin: 0 0 1rem 0; font-size: 1.5rem; font-weight: 600;">
              Ошибка инициализации IP Roast
            </h1>
            <p style="margin: 0 0 2rem 0; color: #6b7280; line-height: 1.6;">
              Произошла критическая ошибка при загрузке приложения. 
              Пожалуйста, перезагрузите страницу или обратитесь к администратору.
            </p>
            <details style="text-align: left; margin-bottom: 2rem;">
              <summary style="cursor: pointer; color: #dc2626; font-weight: 500;">
                Техническая информация
              </summary>
              <pre style="
                margin-top: 1rem;
                padding: 1rem;
                background: #f3f4f6;
                border-radius: 0.5rem;
                font-size: 0.75rem;
                overflow: auto;
                color: #374151;
              ">${error.message}\n\n${error.stack || 'Stack trace недоступен'}</pre>
            </details>
            <button 
              onclick="window.location.reload()"
              style="
                background: #2563eb;
                color: white;
                border: none;
                padding: 0.75rem 2rem;
                border-radius: 0.5rem;
                font-weight: 500;
                cursor: pointer;
                transition: background 0.2s;
              "
              onmouseover="this.style.background='#1d4ed8'"
              onmouseout="this.style.background='#2563eb'"
            >
              🔄 Перезагрузить страницу
            </button>
          </div>
        </div>
      `;
        }

        // Скрываем экран загрузки даже при ошибке
        if (window.hideInitialLoading) {
            window.hideInitialLoading();
        }
    }
}

// Запуск после загрузки DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
} else {
    bootstrap();
}

// Hot Module Replacement для разработки
if (import.meta.hot) {
    import.meta.hot.accept('./App.tsx', () => {
        console.log('🔥 HMR: App компонент обновлен');
    });

    import.meta.hot.accept('./stores/themeStore', () => {
        console.log('🔥 HMR: Theme store обновлен');
    });

    import.meta.hot.accept('./stores/notificationStore', () => {
        console.log('🔥 HMR: Notification store обновлен');
    });
}

// Экспорт для доступа из DevTools
if (APP_CONFIG.enableDevTools) {
    (window as any).__IP_ROAST_DEBUG__ = {
        config: APP_CONFIG,
        version: APP_CONFIG.version,
        environment: APP_CONFIG.environment,
        reloadApp: () => window.location.reload(),
        clearStorage: () => {
            localStorage.clear();
            sessionStorage.clear();
            console.log('🧹 Storage очищен');
        },
        exportLogs: () => {
            const logs = JSON.stringify({
                config: APP_CONFIG,
                localStorage: { ...localStorage },
                sessionStorage: { ...sessionStorage },
                timestamp: new Date().toISOString()
            }, null, 2);

            const blob = new Blob([logs], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ip-roast-debug-${Date.now()}.json`;
            a.click();
            URL.revokeObjectURL(url);
        }
    };

    console.log('🛠️ Debug утилиты доступны как __IP_ROAST_DEBUG__');
}
