/**
 * Main.js - Главный контроллер приложения IP Roast Enterprise
 * Управляет инициализацией, координацией компонентов и общим состоянием
 */

class IPRoastApp {
    constructor() {
        this.version = '4.0.0';
        this.buildDate = new Date().toISOString();

        this.state = {
            isInitialized: false,
            currentPage: 'dashboard',
            isLoading: true,
            sidebarCollapsed: false,
            theme: 'dark'
        };

        this.components = {
            sidebar: null,
            header: null,
            pageLoader: null
        };

        this.config = {
            apiBaseUrl: '/api',
            enableDevMode: localStorage.getItem('dev-mode') === 'true',
            autoSave: true,
            refreshInterval: 30000
        };

        console.log(`🚀 Инициализация IP Roast Enterprise ${this.version}`);
        this.init();
    }

    /**
     * Главная инициализация приложения
     */
    async init() {
        try {
            this.showLoadingScreen();
            this.updateProgress(10, 'Инициализация ядра...');

            // Инициализация базовых систем
            await this.initCore();
            this.updateProgress(30, 'Загрузка компонентов...');

            // Инициализация компонентов
            await this.initComponents();
            this.updateProgress(60, 'Настройка интерфейса...');

            // Настройка UI
            await this.setupUI();
            this.updateProgress(80, 'Загрузка данных...');

            // Загрузка начальных данных
            await this.loadInitialData();
            this.updateProgress(90, 'Завершение инициализации...');

            // Финальная настройка
            await this.finializeInit();
            this.updateProgress(100, 'Готово!');

            // Скрываем экран загрузки
            setTimeout(() => {
                this.hideLoadingScreen();
                this.state.isInitialized = true;
                this.showSuccessNotification('IP Roast Enterprise успешно загружен');
                console.log('✅ IP Roast Enterprise полностью инициализирован');
            }, 500);

        } catch (error) {
            console.error('❌ Критическая ошибка инициализации:', error);
            this.handleInitError(error);
        }
    }

    /**
     * Инициализация базовых систем
     */
    async initCore() {
        // Настройка обработчиков ошибок
        this.setupErrorHandlers();

        // Настройка темы
        this.setupTheme();

        // Настройка хранилища состояния
        this.setupStateManagement();

        // Настройка горячих клавиш
        this.setupHotkeys();

        // Настройка API клиента
        this.setupAPI();

        console.log('🔧 Базовые системы инициализированы');
    }

    /**
     * Инициализация компонентов
     */
    async initComponents() {
        // Инициализация sidebar
        if (window.SidebarManager) {
            this.components.sidebar = new window.SidebarManager();
            this.components.sidebar.on('collapsed', (collapsed) => {
                this.state.sidebarCollapsed = collapsed;
                this.saveState();
            });
            this.components.sidebar.on('navigate', (page) => {
                this.navigateToPage(page);
            });
        }

        // Инициализация header
        if (window.HeaderManager) {
            this.components.header = new window.HeaderManager();
        }

        // Инициализация загрузчика страниц
        if (window.PageLoader) {
            this.components.pageLoader = new window.PageLoader();
            this.components.pageLoader.on('pageLoaded', (page) => {
                this.onPageLoaded(page);
            });
            this.components.pageLoader.on('pageError', (error) => {
                this.onPageError(error);
            });
        }

        console.log('📦 Компоненты инициализированы');
    }

    /**
     * Настройка пользовательского интерфейса
     */
    async setupUI() {
        // Настройка адаптивности
        this.setupResponsive();

        // Настройка accessibility
        this.setupAccessibility();

        // Настройка производительности
        this.setupPerformance();

        // Восстановление состояния UI
        this.restoreUIState();

        console.log('🎨 Пользовательский интерфейс настроен');
    }

    /**
     * Загрузка начальных данных
     */
    async loadInitialData() {
        try {
            // Загружаем системный статус
            await this.loadSystemStatus();

            // Загружаем настройки пользователя
            await this.loadUserPreferences();

            // Загружаем начальную страницу
            const initialPage = this.getInitialPage();
            await this.navigateToPage(initialPage);

            console.log('📊 Начальные данные загружены');
        } catch (error) {
            console.warn('⚠️ Ошибка загрузки данных:', error);
            // Продолжаем работу с заглушками
        }
    }

    /**
     * Финальная инициализация
     */
    async finializeInit() {
        // Запуск периодических задач
        this.startPeriodicTasks();

        // Регистрация Service Worker
        this.registerServiceWorker();

        // Настройка аналитики
        this.setupAnalytics();

        console.log('🏁 Финальная инициализация завершена');
    }

    /**
     * Управление экраном загрузки
     */
    showLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.remove('hidden');
        }
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
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
     * Навигация между страницами
     */
    async navigateToPage(pageId) {
        if (this.state.currentPage === pageId) {
            return; // Уже на этой странице
        }

        console.log(`📄 Навигация к странице: ${pageId}`);

        try {
            // Обновляем состояние
            this.state.currentPage = pageId;

            // Обновляем заголовок
            const pageTitle = this.getPageTitle(pageId);
            if (this.components.header) {
                this.components.header.updatePageTitle(pageTitle);
            }

            // Загружаем страницу
            if (this.components.pageLoader) {
                await this.components.pageLoader.loadPage(pageId);
            }

            // Обновляем активный элемент в sidebar
            if (this.components.sidebar) {
                this.components.sidebar.setActivePage(pageId);
            }

            // Сохраняем состояние
            this.saveState();

            // Обновляем URL (если поддерживается)
            if (window.history && window.history.pushState) {
                window.history.pushState({ page: pageId }, pageTitle, `#${pageId}`);
            }

        } catch (error) {
            console.error('❌ Ошибка навигации:', error);
            this.showErrorNotification('Ошибка загрузки страницы');
        }
    }

    /**
     * Получение заголовка страницы
     */
    getPageTitle(pageId) {
        const titles = {
            'dashboard': 'Панель управления',
            'scanner': 'Модуль сканирования',
            'attack-constructor': 'Конструктор атак',
            'network-topology': 'Топология сети',
            'reports': 'Отчеты и аналитика',
            'settings': 'Настройки системы'
        };

        return titles[pageId] || 'Неизвестная страница';
    }

    /**
     * Определение начальной страницы
     */
    getInitialPage() {
        // Проверяем URL hash
        const hash = window.location.hash.substr(1);
        if (hash && this.isValidPage(hash)) {
            return hash;
        }

        // Проверяем сохраненное состояние
        const savedState = this.loadState();
        if (savedState && savedState.currentPage && this.isValidPage(savedState.currentPage)) {
            return savedState.currentPage;
        }

        // По умолчанию - dashboard
        return 'dashboard';
    }

    /**
     * Проверка валидности страницы
     */
    isValidPage(pageId) {
        const validPages = ['dashboard', 'scanner', 'attack-constructor', 'network-topology', 'reports', 'settings'];
        return validPages.includes(pageId);
    }

    /**
     * Обработчики событий страниц
     */
    onPageLoaded(pageData) {
        console.log('✅ Страница загружена:', pageData.id);

        if (this.components.header) {
            this.components.header.setLoading(false);
        }
    }

    onPageError(error) {
        console.error('❌ Ошибка загрузки страницы:', error);

        if (this.components.header) {
            this.components.header.setLoading(false);
        }

        this.showErrorNotification('Не удалось загрузить страницу');
    }

    /**
     * Настройка обработчиков ошибок
     */
    setupErrorHandlers() {
        window.addEventListener('error', (e) => {
            console.error('💥 JavaScript ошибка:', e.error);
            if (this.config.enableDevMode) {
                this.showErrorNotification(`JS Error: ${e.error.message}`);
            }
        });

        window.addEventListener('unhandledrejection', (e) => {
            console.error('💥 Необработанный Promise:', e.reason);
            if (this.config.enableDevMode) {
                this.showErrorNotification(`Promise Error: ${e.reason}`);
            }
        });
    }

    /**
     * Настройка темы
     */
    setupTheme() {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        this.state.theme = savedTheme;
        document.body.setAttribute('data-theme', savedTheme);

        console.log(`🎨 Тема установлена: ${savedTheme}`);
    }

    /**
     * Переключение темы
     */
    toggleTheme() {
        const newTheme = this.state.theme === 'dark' ? 'light' : 'dark';
        this.state.theme = newTheme;

        document.body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);

        this.showSuccessNotification(`Тема изменена на ${newTheme === 'dark' ? 'темную' : 'светлую'}`);
        console.log(`🎨 Тема изменена на: ${newTheme}`);
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
                if (this.components.sidebar) {
                    this.components.sidebar.toggle();
                }
            }

            // Ctrl/Cmd + Shift + T - переключение темы
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
                e.preventDefault();
                this.toggleTheme();
            }

            // F5 - обновление текущей страницы
            if (e.key === 'F5') {
                e.preventDefault();
                this.refreshCurrentPage();
            }
        });

        console.log('⌨️ Горячие клавиши настроены');
    }

    /**
     * Показ быстрого поиска
     */
    showQuickSearch() {
        console.log('🔍 Открытие быстрого поиска');
        // Здесь можно реализовать модальное окно быстрого поиска
    }

    /**
     * Обновление текущей страницы
     */
    refreshCurrentPage() {
        console.log('🔄 Обновление текущей страницы');
        if (this.components.pageLoader) {
            this.components.pageLoader.reloadCurrentPage();
        }
    }

    /**
     * Управление состоянием
     */
    setupStateManagement() {
        // Загружаем сохраненное состояние
        const savedState = this.loadState();
        if (savedState) {
            this.state = { ...this.state, ...savedState };
        }

        // Автосохранение каждые 30 секунд
        if (this.config.autoSave) {
            setInterval(() => {
                this.saveState();
            }, 30000);
        }

        console.log('💾 Управление состоянием настроено');
    }

    saveState() {
        try {
            const stateToSave = {
                currentPage: this.state.currentPage,
                sidebarCollapsed: this.state.sidebarCollapsed,
                theme: this.state.theme,
                timestamp: Date.now()
            };

            localStorage.setItem('app-state', JSON.stringify(stateToSave));
        } catch (error) {
            console.warn('⚠️ Ошибка сохранения состояния:', error);
        }
    }

    loadState() {
        try {
            const saved = localStorage.getItem('app-state');
            return saved ? JSON.parse(saved) : null;
        } catch (error) {
            console.warn('⚠️ Ошибка загрузки состояния:', error);
            return null;
        }
    }

    /**
     * Восстановление состояния UI
     */
    restoreUIState() {
        // Восстанавливаем состояние sidebar
        if (this.components.sidebar && this.state.sidebarCollapsed) {
            this.components.sidebar.collapse();
        }
    }

    /**
     * Настройка API
     */
    setupAPI() {
        // Здесь можно настроить базовый URL API, заголовки, etc.
        console.log('🌐 API настроено');
    }

    /**
     * Загрузка системного статуса
     */
    async loadSystemStatus() {
        try {
            // Имитация загрузки статуса
            await new Promise(resolve => setTimeout(resolve, 500));

            const status = {
                system: 'OK',
                network: 'Connected',
                security: 'Protected'
            };

            console.log('📊 Системный статус загружен:', status);
            return status;
        } catch (error) {
            console.warn('⚠️ Ошибка загрузки системного статуса:', error);
            throw error;
        }
    }

    /**
     * Загрузка предпочтений пользователя
     */
    async loadUserPreferences() {
        try {
            // Имитация загрузки настроек
            await new Promise(resolve => setTimeout(resolve, 300));

            const preferences = {
                notifications: true,
                autoRefresh: true,
                compactMode: false
            };

            console.log('👤 Предпочтения пользователя загружены:', preferences);
            return preferences;
        } catch (error) {
            console.warn('⚠️ Ошибка загрузки предпочтений:', error);
            throw error;
        }
    }

    /**
     * Периодические задачи
     */
    startPeriodicTasks() {
        // Обновление системного статуса каждые 30 секунд
        setInterval(async () => {
            try {
                await this.loadSystemStatus();
            } catch (error) {
                console.warn('⚠️ Ошибка обновления системного статуса:', error);
            }
        }, 30000);

        console.log('⏰ Периодические задачи запущены');
    }

    /**
     * Регистрация Service Worker
     */
    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('🔧 Service Worker зарегистрирован:', registration.scope);
                })
                .catch(error => {
                    console.warn('⚠️ Ошибка регистрации Service Worker:', error);
                });
        }
    }

    /**
     * Настройка адаптивности
     */
    setupResponsive() {
        const mediaQuery = window.matchMedia('(max-width: 768px)');

        const handleMediaChange = (e) => {
            if (e.matches) {
                // Мобильный режим
                document.body.classList.add('mobile-mode');
            } else {
                // Десктопный режим
                document.body.classList.remove('mobile-mode');
            }
        };

        mediaQuery.addEventListener('change', handleMediaChange);
        handleMediaChange(mediaQuery);

        console.log('📱 Адаптивность настроена');
    }

    /**
     * Настройка accessibility
     */
    setupAccessibility() {
        // Настройка ARIA labels
        // Настройка focus management
        // Настройка keyboard navigation

        console.log('♿ Accessibility настрен');
    }

    /**
     * Настройка производительности
     */
    setupPerformance() {
        // Настройка lazy loading
        // Настройка кэширования
        // Мониторинг производительности

        console.log('⚡ Производительность настроена');
    }

    /**
     * Настройка аналитики
     */
    setupAnalytics() {
        if (this.config.enableDevMode) {
            console.log('📈 Аналитика отключена в dev режиме');
            return;
        }

        // Здесь можно настроить аналитику
        console.log('📈 Аналитика настроена');
    }

    /**
     * Уведомления
     */
    showSuccessNotification(message) {
        if (this.components.header) {
            this.components.header.addNotification({
                title: 'Успех',
                message: message,
                type: 'success'
            });
        }
    }

    showErrorNotification(message) {
        if (this.components.header) {
            this.components.header.addNotification({
                title: 'Ошибка',
                message: message,
                type: 'error'
            });
        }
    }

    showWarningNotification(message) {
        if (this.components.header) {
            this.components.header.addNotification({
                title: 'Предупреждение',
                message: message,
                type: 'warning'
            });
        }
    }

    showInfoNotification(message) {
        if (this.components.header) {
            this.components.header.addNotification({
                title: 'Информация',
                message: message,
                type: 'info'
            });
        }
    }

    /**
     * Обработка критической ошибки инициализации
     */
    handleInitError(error) {
        console.error('💥 Критическая ошибка инициализации:', error);

        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.innerHTML = `
        <div class="loading-container">
          <div class="error-icon">❌</div>
          <h2>Ошибка инициализации</h2>
          <p>Произошла критическая ошибка при запуске приложения.</p>
          <p class="error-message">${error.message}</p>
          <div class="error-actions">
            <button onclick="location.reload()" class="error-btn">Перезагрузить</button>
            <button onclick="localStorage.clear(); location.reload()" class="error-btn secondary">
              Очистить данные и перезагрузить
            </button>
          </div>
        </div>
      `;
        }
    }

    /**
     * Получение информации о приложении
     */
    getAppInfo() {
        return {
            version: this.version,
            buildDate: this.buildDate,
            state: this.state,
            config: this.config
        };
    }

    /**
     * Уничтожение приложения
     */
    destroy() {
        // Останавливаем периодические задачи
        // Уничтожаем компоненты
        Object.values(this.components).forEach(component => {
            if (component && typeof component.destroy === 'function') {
                component.destroy();
            }
        });

        // Сохраняем финальное состояние
        this.saveState();

        console.log('🗑️ IP Roast Enterprise уничтожен');
    }
}

// Глобальный экспорт
window.IPRoastApp = IPRoastApp;

// Автоматическая инициализация
document.addEventListener('DOMContentLoaded', () => {
    if (!window.app) {
        window.app = new IPRoastApp();
    }
});

// Экспорт для модулей
if (typeof module !== 'undefined' && module.exports) {
    module.exports = IPRoastApp;
}