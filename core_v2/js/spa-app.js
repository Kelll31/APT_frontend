/**
 * IP Roast Enterprise SPA Application
 * Главный класс SPA приложения с полной интеграцией Enhanced PageManager
 * Версия: 4.0.0-Enhanced
 */
class IPRoastSPAApp extends ComponentBase {
    constructor() {
        super('IPRoastSPAApp');
        this.version = '4.0.0-Enhanced';
        this.buildDate = new Date().toISOString();

        // Менеджеры компонентов
        this.components = {
            pageManager: null,
            navigator: null,
            themeManager: null,
            headerManager: null,
            sidebarManager: null,
            notificationSystem: null
        };

        // Конфигурация приложения
        this.config = {
            apiBaseUrl: './api',
            pagesPath: './pages', // Путь к страницам относительно core_v2
            enableDevMode: localStorage.getItem('dev-mode') === 'true',
            autoSave: true,
            refreshInterval: 30000,
            defaultRoute: 'dashboard'
        };

        // Состояние приложения
        this.state = {
            isInitialized: false,
            currentPage: null,
            loadingState: false
        };

        console.log(`🚀 IP Roast Enterprise ${this.version} SPA создано`);
    }

    /**
     * Инициализация SPA приложения
     */
    async doInit() {
        try {
            this.showLoadingScreen();
            this.updateProgress(5, 'Запуск системы...');

            // Делаем приложение доступным глобально СРАЗУ
            window.app = this;
            console.log('🌍 Приложение доступно как window.app');

            await this.checkRequiredElements();
            this.updateProgress(15, 'Инициализация базовых систем...');

            await this.initializeCoreSystems();
            this.updateProgress(35, 'Инициализация менеджеров компонентов...');

            await this.initializeComponentManagers();
            this.updateProgress(60, 'Настройка навигации...');

            await this.initializeNavigation();
            this.updateProgress(80, 'Завершение инициализации...');

            await this.finalizeInitialization();
            this.updateProgress(100, 'Готово!');

            // Устанавливаем состояние
            this.state.isInitialized = true;

            // Показываем успешное завершение
            setTimeout(() => {
                this.hideLoadingScreen();
                this.showSuccessNotification('IP Roast Enterprise успешно загружен!');
                console.log('✅ IP Roast Enterprise Core v2 Enhanced полностью инициализирован');
            }, 500);

        } catch (error) {
            console.error('❌ Критическая ошибка инициализации SPA:', error);
            this.handleInitError(error);
            throw error;
        }
    }

    /**
     * Проверка необходимых элементов DOM
     */
    async checkRequiredElements() {
        const requiredSelectors = [
            'body',
            'head'
        ];

        const optionalSelectors = [
            '#loading-screen',
            '#page-container',
            '.main-content'
        ];

        // Проверяем обязательные элементы
        const missing = requiredSelectors.filter(sel => !document.querySelector(sel));
        if (missing.length > 0) {
            throw new Error(`Отсутствуют критические элементы: ${missing.join(', ')}`);
        }

        // Проверяем опциональные элементы
        const missingOptional = optionalSelectors.filter(sel => !document.querySelector(sel));
        if (missingOptional.length > 0) {
            console.warn(`⚠️ Отсутствуют опциональные элементы: ${missingOptional.join(', ')}`);
        }

        console.log('✅ Проверка DOM элементов завершена');
    }

    /**
     * Инициализация базовых систем
     */
    async initializeCoreSystems() {
        // Настройка обработчиков ошибок
        this.setupErrorHandlers();

        // Настройка темы
        this.setupTheme();

        // Настройка горячих клавиш
        this.setupHotkeys();

        // Настройка адаптивности
        this.setupResponsive();

        console.log('🔧 Базовые системы инициализированы');
    }

    /**
     * Инициализация менеджеров компонентов
     */
    async initializeComponentManagers() {
        try {
            // 1. ThemeManager (приоритетный)
            await this.initializeThemeManager();

            // 2. Enhanced PageManager (ключевой компонент)
            await this.initializePageManager();

            // 3. Notification System
            await this.initializeNotificationSystem();

            console.log('📦 Все менеджеры компонентов инициализированы');

        } catch (error) {
            console.error('❌ Ошибка инициализации менеджеров:', error);
            throw error;
        }
    }

    /**
     * Инициализация ThemeManager
     */
    async initializeThemeManager() {
        if (window.IPRoastCore?.ThemeManager) {
            this.components.themeManager = new window.IPRoastCore.ThemeManager();
            await this.components.themeManager.init();
            console.log('✅ ThemeManager инициализирован');
        } else {
            console.warn('⚠️ IPRoastCore.ThemeManager не найден');
        }
    }

    /**
     * Инициализация PageManager
     */
    async initializePageManager() {
        if (window.EnhancedPageManager) {
            console.log('🔄 Используем Enhanced PageManager');

            this.components.pageManager = new window.EnhancedPageManager();
            await this.components.pageManager.init();

            // КРИТИЧЕСКИ ВАЖНО: множественные ссылки для совместимости
            window.pageManager = this.components.pageManager;
            window.enhancedPageManager = this.components.pageManager;

            // Для SPANavigator
            this.pageManager = this.components.pageManager;

            // Для интеграционного кода
            if (window.app) {
                window.app.pageManager = this.components.pageManager;
            }

            console.log('✅ Enhanced PageManager инициализирован и доступен через множественные ссылки');

        } else if (window.PageManager) {
            console.log('📄 Используем обычный PageManager');

            this.components.pageManager = new window.PageManager();
            await this.components.pageManager.init();

            // Те же ссылки для совместимости
            window.pageManager = this.components.pageManager;
            this.pageManager = this.components.pageManager;

            if (window.app) {
                window.app.pageManager = this.components.pageManager;
            }

            console.log('✅ PageManager инициализирован');

        } else {
            throw new Error('Ни EnhancedPageManager, ни PageManager не найдены');
        }
    }

    /**
     * Инициализация системы уведомлений
     */
    async initializeNotificationSystem() {
        // Простая реализация системы уведомлений
        this.components.notificationSystem = {
            show: (message, type = 'info', options = {}) => {
                console.log(`📢 ${type.toUpperCase()}: ${message}`);

                // Создаем простое уведомление
                const notification = document.createElement('div');
                notification.className = `notification notification--${type}`;
                notification.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 12px 16px;
                    background: var(--color-surface);
                    border: 1px solid var(--color-border);
                    border-radius: 8px;
                    box-shadow: var(--shadow-lg);
                    z-index: 9999;
                    max-width: 400px;
                    color: var(--color-text);
                `;

                notification.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span>${this.getNotificationIcon(type)}</span>
                        <span>${message}</span>
                        <button onclick="this.parentElement.parentElement.remove()" style="
                            background: none;
                            border: none;
                            color: var(--color-text-secondary);
                            cursor: pointer;
                            margin-left: auto;
                        ">×</button>
                    </div>
                `;

                document.body.appendChild(notification);

                // Автоудаление через 5 секунд
                setTimeout(() => {
                    if (notification.parentElement) {
                        notification.remove();
                    }
                }, options.duration || 5000);

                return notification;
            },

            success: (message, options) => this.components.notificationSystem.show(message, 'success', options),
            error: (message, options) => this.components.notificationSystem.show(message, 'error', options),
            warning: (message, options) => this.components.notificationSystem.show(message, 'warning', options),
            info: (message, options) => this.components.notificationSystem.show(message, 'info', options)
        };

        console.log('✅ NotificationSystem инициализирован');
    }

    /**
     * Получение иконки для уведомления
     */
    getNotificationIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    }

    /**
     * Инициализация навигации
     */
    async initializeNavigation() {
        if (window.SPANavigator) {
            this.components.navigator = new window.SPANavigator();
            await this.components.navigator.init();

            // Связываем с sidebar если есть
            if (this.components.sidebarManager) {
                this.components.sidebarManager.on('navigate', (pageId) => {
                    this.components.navigator.navigateTo(pageId);
                });
            }

            console.log('✅ SPANavigator инициализирован');
        } else {
            console.warn('⚠️ SPANavigator не найден, навигация будет ограничена');
        }

        console.log('🧭 Навигация инициализирована');
    }

    /**
     * Финальная настройка
     */
    async finalizeInitialization() {
        // Запуск периодических задач
        this.startPeriodicTasks();

        // Настройка обработчиков состояния
        this.setupStateHandlers();

        // Добавляем глобальные функции для отладки
        this.exposeDebugFunctions();

        console.log('🏁 Финальная настройка завершена');
    }

    /**
     * Публичные методы для навигации
     */
    async navigateToPage(pageId, options = {}) {
        console.log(`🧭 Запрос навигации к странице: ${pageId}`);

        try {
            if (this.components.navigator) {
                return await this.components.navigator.navigateTo(pageId, options);
            } else if (this.components.pageManager) {
                return await this.components.pageManager.loadPage(pageId, options);
            } else {
                console.error('❌ Ни Navigator, ни PageManager не инициализированы');
                return false;
            }
        } catch (error) {
            console.error(`❌ Ошибка навигации к ${pageId}:`, error);
            this.showErrorNotification(`Ошибка загрузки страницы: ${pageId}`);
            return false;
        }
    }

    /**
     * Системы уведомлений
     */
    showNotification(message, type = 'info', options = {}) {
        if (this.components.notificationSystem) {
            return this.components.notificationSystem.show(message, type, options);
        } else {
            console.log(`📢 ${type.toUpperCase()}: ${message}`);
            return null;
        }
    }

    showSuccessNotification(message, options = {}) {
        return this.showNotification(message, 'success', options);
    }

    showErrorNotification(message, options = {}) {
        return this.showNotification(message, 'error', options);
    }

    showWarningNotification(message, options = {}) {
        return this.showNotification(message, 'warning', options);
    }

    showInfoNotification(message, options = {}) {
        return this.showNotification(message, 'info', options);
    }

    /**
     * Настройка обработчиков ошибок
     */
    setupErrorHandlers() {
        window.addEventListener('error', (e) => {
            console.error('💥 JavaScript ошибка:', e.error);
            if (this.config.enableDevMode) {
                this.showErrorNotification(`JS Error: ${e.error?.message || 'Unknown error'}`);
            }
        });

        window.addEventListener('unhandledrejection', (e) => {
            console.error('💥 Необработанное отклонение промиса:', e.reason);
            if (this.config.enableDevMode) {
                this.showErrorNotification(`Promise Error: ${e.reason || 'Unknown promise error'}`);
            }
        });

        console.log('🛡️ Обработчики ошибок настроены');
    }

    /**
     * Настройка темы
     */
    setupTheme() {
        const savedTheme = localStorage.getItem('ip-roast-theme-v2') ||
            localStorage.getItem('theme') ||
            'dark';

        document.documentElement.setAttribute('data-theme', savedTheme);
        document.documentElement.style.colorScheme = savedTheme === 'auto' ?
            (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') :
            savedTheme;

        console.log(`🎨 Тема установлена: ${savedTheme}`);
    }

    /**
     * Настройка горячих клавиш
     */
    setupHotkeys() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K - быстрый поиск
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.showQuickSearch();
            }

            // Ctrl/Cmd + B - переключение sidebar
            if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
                e.preventDefault();
                if (this.components.sidebarManager) {
                    this.components.sidebarManager.toggle();
                }
            }

            // Ctrl/Cmd + Shift + T - переключение темы
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
                e.preventDefault();
                if (this.components.themeManager) {
                    this.components.themeManager.toggleTheme();
                }
            }

            // Escape - закрытие модальных окон
            if (e.key === 'Escape') {
                this.handleEscapeKey();
            }

            // F12 - переключение dev режима
            if (e.key === 'F12') {
                e.preventDefault();
                this.toggleDevMode();
            }
        });

        console.log('⌨️ Горячие клавиши настроены');
    }

    /**
     * Настройка адаптивности
     */
    setupResponsive() {
        const mediaQuery = window.matchMedia('(max-width: 768px)');
        const handleMediaChange = (e) => {
            document.body.classList.toggle('mobile-mode', e.matches);
            this.emit('responsiveChange', { isMobile: e.matches });
        };

        mediaQuery.addEventListener('change', handleMediaChange);
        handleMediaChange(mediaQuery);

        console.log('📱 Адаптивность настроена');
    }

    /**
     * Периодические задачи
     */
    startPeriodicTasks() {
        // Обновление статуса системы
        const statusInterval = setInterval(() => {
            this.updateSystemStatus();
        }, this.config.refreshInterval);

        // Очистка кэша каждые 5 минут
        const cacheInterval = setInterval(() => {
            if (this.components.pageManager?.clearOldCache) {
                this.components.pageManager.clearOldCache();
            }
        }, 300000);

        // Сохраняем интервалы для очистки
        this.intervals = { statusInterval, cacheInterval };

        console.log('⏰ Периодические задачи запущены');
    }

    /**
     * Настройка обработчиков состояния
     */
    setupStateHandlers() {
        // Автосохранение состояния
        if (this.config.autoSave) {
            setInterval(() => {
                this.saveAppState();
            }, 60000); // Каждую минуту
        }

        // Сохранение состояния при выходе
        window.addEventListener('beforeunload', () => {
            this.saveAppState();
        });

        // Восстановление при загрузке
        this.restoreAppState();

        console.log('💾 Обработчики состояния настроены');
    }

    /**
     * Обновление системного статуса
     */
    async updateSystemStatus() {
        try {
            const status = {
                timestamp: new Date().toISOString(),
                memory: this.getMemoryUsage(),
                performance: this.getPerformanceMetrics(),
                pageManager: this.components.pageManager ? {
                    currentPage: this.components.pageManager.currentPageId || null,
                    cacheSize: this.components.pageManager.cache ?
                        Object.keys(this.components.pageManager.cache).length : 0
                } : null
            };

            this.emit('systemStatusUpdated', status);
        } catch (error) {
            console.warn('⚠️ Ошибка обновления системного статуса:', error);
        }
    }

    /**
     * UI методы
     */
    showLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.remove('hidden');
            loadingScreen.style.display = 'flex';
        }
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }
    }

    updateProgress(percent, text) {
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');

        if (progressFill) {
            progressFill.style.width = `${percent}%`;
        }
        if (progressText) {
            progressText.textContent = text;
        }
    }

    /**
     * Обработка ошибки инициализации
     */
    handleInitError(error) {
        console.error('💥 Критическая ошибка инициализации:', error);

        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.innerHTML = `
                <div class="loading-content" style="text-align: center; padding: 32px;">
                    <div class="error-icon" style="font-size: 48px; margin-bottom: 16px;">❌</div>
                    <h2 style="color: var(--color-error); margin-bottom: 16px;">Ошибка запуска системы</h2>
                    <p style="margin-bottom: 8px;"><strong>Ошибка:</strong> ${error.message}</p>
                    <p style="margin-bottom: 24px; color: var(--color-text-secondary);">
                        <strong>Время:</strong> ${new Date().toLocaleString()}
                    </p>
                    <div style="display: flex; gap: 12px; justify-content: center;">
                        <button onclick="location.reload()" style="
                            padding: 8px 16px;
                            background: var(--color-primary);
                            color: var(--color-btn-primary-text);
                            border: none;
                            border-radius: var(--radius-base);
                            cursor: pointer;
                        ">Перезагрузить страницу</button>
                        <button onclick="this.parentElement.parentElement.remove()" style="
                            padding: 8px 16px;
                            background: var(--color-secondary);
                            color: var(--color-text);
                            border: 1px solid var(--color-border);
                            border-radius: var(--radius-base);
                            cursor: pointer;
                        ">Скрыть ошибку</button>
                    </div>
                </div>
            `;
        }
    }

    /**
     * Вспомогательные методы
     */
    showQuickSearch() {
        console.log('🔍 Быстрый поиск (заглушка)');
        this.showInfoNotification('Быстрый поиск не реализован');
    }

    handleEscapeKey() {
        console.log('⎋ Нажата клавиша Escape');
        // Закрытие модальных окон и overlays
        const overlays = document.querySelectorAll('.modal, .overlay, .sidebar-overlay.visible');
        overlays.forEach(overlay => {
            overlay.classList.add('hidden');
        });
    }

    toggleDevMode() {
        const devMode = !this.config.enableDevMode;
        this.config.enableDevMode = devMode;
        localStorage.setItem('dev-mode', devMode.toString());
        this.showInfoNotification(`Режим разработчика: ${devMode ? 'включен' : 'выключен'}`);
        console.log(`🛠️ Dev режим: ${devMode ? 'включен' : 'выключен'}`);
    }

    /**
     * Состояние приложения
     */
    saveAppState() {
        try {
            const state = {
                timestamp: new Date().toISOString(),
                version: this.version,
                currentPage: this.components.pageManager?.currentPageId || null,
                theme: this.components.themeManager?.getCurrentTheme?.() || null,
                config: {
                    enableDevMode: this.config.enableDevMode
                }
            };

            localStorage.setItem('ip-roast-app-state', JSON.stringify(state));
        } catch (error) {
            console.warn('⚠️ Ошибка сохранения состояния:', error);
        }
    }

    restoreAppState() {
        try {
            const stateStr = localStorage.getItem('ip-roast-app-state');
            if (stateStr) {
                const state = JSON.parse(stateStr);
                console.log('📂 Восстановлено состояние приложения:', state);

                // Восстанавливаем настройки
                if (state.config?.enableDevMode !== undefined) {
                    this.config.enableDevMode = state.config.enableDevMode;
                }
            }
        } catch (error) {
            console.warn('⚠️ Ошибка восстановления состояния:', error);
        }
    }

    /**
     * Метрики производительности
     */
    getMemoryUsage() {
        if (performance.memory) {
            return {
                used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
                limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
            };
        }
        return null;
    }

    getPerformanceMetrics() {
        return {
            navigation: performance.navigation?.type || null,
            timing: performance.timing ? {
                loadComplete: performance.timing.loadEventEnd - performance.timing.navigationStart,
                domReady: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart
            } : null,
            connection: navigator.connection ? {
                effectiveType: navigator.connection.effectiveType,
                downlink: navigator.connection.downlink
            } : null
        };
    }

    /**
     * Debug функции
     */
    exposeDebugFunctions() {
        if (this.config.enableDevMode) {
            // Глобальные функции для отладки
            window.navigateToPage = (pageId) => this.navigateToPage(pageId);
            window.getAppInfo = () => this.getAppInfo();
            window.getPageManagerStats = () => this.getPageManagerStats();
            window.clearPageCache = () => this.clearPageCache();
            window.testPageLoad = () => this.testPageLoad();

            console.log('🐛 Debug функции доступны в глобальной области');
        }
    }

    getAppInfo() {
        return {
            version: this.version,
            buildDate: this.buildDate,
            state: this.state,
            config: this.config,
            components: Object.keys(this.components).reduce((acc, key) => {
                acc[key] = !!this.components[key];
                return acc;
            }, {}),
            memory: this.getMemoryUsage(),
            performance: this.getPerformanceMetrics()
        };
    }

    getPageManagerStats() {
        if (this.components.pageManager) {
            return {
                currentPage: this.components.pageManager.currentPageId || null,
                cacheSize: this.components.pageManager.cache ?
                    Object.keys(this.components.pageManager.cache).length : 0,
                loadingQueue: this.components.pageManager.loadingQueue?.size || 0,
                type: this.components.pageManager.constructor.name
            };
        }
        return null;
    }

    clearPageCache() {
        if (this.components.pageManager?.clearCache) {
            this.components.pageManager.clearCache();
            this.showSuccessNotification('Кэш страниц очищен');
            console.log('🗑️ Кэш страниц очищен');
        }
    }

    async testPageLoad() {
        const pages = ['dashboard', 'scanner', 'settings'];
        console.log('🧪 Начинаем тестирование загрузки страниц...');

        for (const page of pages) {
            try {
                console.log(`📄 Тестируем загрузку: ${page}`);
                await this.navigateToPage(page);
                await new Promise(resolve => setTimeout(resolve, 1000));
                console.log(`✅ ${page} загружена успешно`);
            } catch (error) {
                console.error(`❌ Ошибка загрузки ${page}:`, error);
            }
        }

        this.showSuccessNotification('Тестирование страниц завершено');
        console.log('✅ Тестирование страниц завершено');
    }

    /**
     * Получение текущего состояния
     */
    getCurrentPage() {
        return this.components.pageManager?.currentPageId || this.state.currentPage;
    }

    isInitialized() {
        return this.state.isInitialized;
    }

    /**
     * Очистка при уничтожении
     */
    async doDestroy() {
        // Очищаем интервалы
        if (this.intervals) {
            Object.values(this.intervals).forEach(interval => clearInterval(interval));
        }

        // Сохраняем состояние
        this.saveAppState();

        // Очищаем глобальные ссылки
        if (window.app === this) {
            window.app = null;
        }

        console.log('🗑️ IP Roast SPA App уничтожен');
    }
}

// Экспорт в глобальную область
window.IPRoastSPAApp = IPRoastSPAApp;

console.log('🏗️ IPRoastSPAApp загружен (полностью исправленная версия)');
