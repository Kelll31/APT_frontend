(function () {
    'use strict';

    // Проверяем, не был ли уже загружен IPRoastApp
    if (typeof window.IPRoastApp !== 'undefined') {
        console.log('⚠️ IPRoastApp уже загружен, пропускаем инициализацию');
        return;
    }

    class IPRoastApp {
        constructor() {
            this.version = '4.0.0';
            this.buildDate = new Date().toISOString();
            this.state = {
                isInitialized: false,
                currentPage: 'dashboard',
                isLoading: true,
                sidebarCollapsed: false,
                theme: 'dark',
                componentsLoaded: false
            };

            this.components = {
                sidebar: null,
                header: null,
                pageLoader: null,
                componentLoader: null
            };

            this.config = {
                apiBaseUrl: '/api',
                enableDevMode: localStorage.getItem('dev-mode') === 'true',
                autoSave: true,
                refreshInterval: 30000,
                componentPaths: {
                    header: 'components/header.html',
                    sidebar: 'components/sidebar.html'
                }
            };

            console.log(`🚀 Инициализация IP Roast Enterprise ${this.version} (Модульная версия)`);
            // НЕ вызываем init() в конструкторе - будем инициализировать извне
        }

        /**
         * Главная инициализация приложения
         * Теперь вызывается ПОСЛЕ загрузки компонентов
         */
        async init() {
            try {
                this.showLoadingScreen();
                this.updateProgress(10, 'Инициализация ядра...');

                // Проверяем, что компоненты уже загружены
                if (!this.checkComponentsExist()) {
                    throw new Error('Компоненты HTML не найдены в DOM. Инициализация невозможна.');
                }

                this.updateProgress(30, 'Инициализация базовых систем...');
                await this.initCore();

                this.updateProgress(50, 'Инициализация компонентов...');
                await this.initComponents();

                this.updateProgress(70, 'Настройка интерфейса...');
                await this.setupUI();

                this.updateProgress(85, 'Загрузка данных...');
                await this.loadInitialData();

                this.updateProgress(95, 'Завершение инициализации...');
                await this.finializeInit();

                this.updateProgress(100, 'Готово!');

                // Скрываем экран загрузки
                setTimeout(() => {
                    this.hideLoadingScreen();
                    this.state.isInitialized = true;
                    this.showSuccessNotification('IP Roast Enterprise успешно загружен');
                    console.log('✅ IP Roast Enterprise полностью инициализирован (компоненты готовы)');
                }, 500);

            } catch (error) {
                console.error('❌ Критическая ошибка инициализации:', error);
                this.handleInitError(error);
            }
        }

        /**
         * Проверка существования компонентов в DOM
         */
        checkComponentsExist() {
            const headerContainer = document.getElementById('header-container');
            const sidebarContainer = document.getElementById('sidebar-container');
            const mainHeader = document.getElementById('main-header');
            const sidebar = document.getElementById('sidebar');

            const exists = {
                headerContainer: !!headerContainer,
                sidebarContainer: !!sidebarContainer,
                mainHeader: !!mainHeader,
                sidebar: !!sidebar,
                headerContent: !!(headerContainer && headerContainer.children.length > 0),
                sidebarContent: !!(sidebarContainer && sidebarContainer.children.length > 0)
            };

            console.log('🔍 Проверка компонентов в DOM:', exists);

            return exists.headerContainer &&
                exists.sidebarContainer &&
                exists.headerContent &&
                exists.sidebarContent &&
                exists.mainHeader &&
                exists.sidebar;
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
         * Компоненты HTML уже загружены, инициализируем JavaScript менеджеры
         */
        async initComponents() {
            // Инициализация sidebar ТОЛЬКО если элементы найдены
            const sidebarElement = document.getElementById('sidebar');
            if (sidebarElement && window.SidebarManager) {
                try {
                    this.components.sidebar = new window.SidebarManager();

                    // Настраиваем обработчики событий
                    this.components.sidebar.on('collapsed', (collapsed) => {
                        this.state.sidebarCollapsed = collapsed;
                        this.saveState();
                    });

                    this.components.sidebar.on('navigate', (page) => {
                        this.navigateToPage(page);
                    });

                    console.log('✅ SidebarManager инициализирован');
                } catch (error) {
                    console.error('❌ Ошибка инициализации SidebarManager:', error);
                }
            } else {
                console.warn('⚠️ SidebarManager не может быть инициализирован - элементы не найдены');
            }

            // Инициализация header ТОЛЬКО если элементы найдены
            const headerElement = document.getElementById('main-header');
            if (headerElement && window.HeaderManager) {
                try {
                    this.components.header = new window.HeaderManager();
                    console.log('✅ HeaderManager инициализирован');
                } catch (error) {
                    console.error('❌ Ошибка инициализации HeaderManager:', error);
                }
            } else {
                console.warn('⚠️ HeaderManager не может быть инициализирован - элементы не найдены');
            }

            // Инициализация загрузчика страниц
            if (window.PageLoader) {
                try {
                    this.components.pageLoader = new window.PageLoader();

                    this.components.pageLoader.on('pageLoaded', (page) => {
                        this.onPageLoaded(page);
                    });

                    this.components.pageLoader.on('pageError', (error) => {
                        this.onPageError(error);
                    });

                    console.log('✅ PageLoader инициализирован');
                } catch (error) {
                    console.error('❌ Ошибка инициализации PageLoader:', error);
                }
            } else {
                console.warn('⚠️ PageLoader не найден');
            }

            console.log('📦 Компоненты инициализированы');
        }

        /**
         * Настройка UI
         */
        async setupUI() {
            this.setupResponsive();
            this.setupAccessibility();
            this.setupPerformance();
            this.restoreUIState();
            console.log('🎨 Пользовательский интерфейс настроен');
        }

        /**
         * Загрузка начальных данных
         */
        async loadInitialData() {
            try {
                await this.loadSystemStatus();
                await this.loadUserPreferences();

                const initialPage = this.getInitialPage();
                await this.navigateToPage(initialPage);

                console.log('📊 Начальные данные загружены');
            } catch (error) {
                console.warn('⚠️ Ошибка загрузки данных:', error);
            }
        }

        /**
         * Финальная инициализация
         */
        async finializeInit() {
            this.startPeriodicTasks();
            this.registerServiceWorker();
            this.setupAnalytics();
            console.log('🏁 Финальная инициализация завершена');
        }

        /**
         * Показ экрана загрузки
         */
        showLoadingScreen() {
            const loadingScreen = document.getElementById('loading-screen');
            if (loadingScreen) {
                loadingScreen.classList.remove('hidden');
            }
        }

        /**
         * Скрытие экрана загрузки
         */
        hideLoadingScreen() {
            const loadingScreen = document.getElementById('loading-screen');
            if (loadingScreen) {
                loadingScreen.classList.add('hidden');
            }
        }

        /**
         * Обновление прогресса загрузки
         */
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
         * Показ уведомления об успехе
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

        /**
         * Показ уведомления об ошибке
         */
        showErrorNotification(message) {
            if (this.components.header) {
                this.components.header.addNotification({
                    title: 'Ошибка',
                    message: message,
                    type: 'error'
                });
            }
        }

        /**
         * Навигация к странице
         */
        async navigateToPage(pageId) {
            if (this.state.currentPage === pageId) return;

            console.log(`📄 Навигация к странице: ${pageId}`);

            try {
                this.state.currentPage = pageId;

                const pageTitle = this.getPageTitle(pageId);
                if (this.components.header) {
                    this.components.header.updatePageTitle(pageTitle);
                }

                if (this.components.pageLoader) {
                    await this.components.pageLoader.loadPage(pageId);
                }

                if (this.components.sidebar) {
                    this.components.sidebar.setActivePage(pageId);
                }

                this.saveState();

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
         * Настройка обработчиков ошибок
         */
        setupErrorHandlers() {
            window.addEventListener('error', (e) => {
                console.error('💥 JavaScript ошибка:', e.error);
                if (this.config.enableDevMode) {
                    this.showErrorNotification(`JS Error: ${e.error.message}`);
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
         * Настройка горячих клавиш
         */
        setupHotkeys() {
            document.addEventListener('keydown', (e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                    e.preventDefault();
                    this.showQuickSearch();
                }

                if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
                    e.preventDefault();
                    if (this.components.sidebar) {
                        this.components.sidebar.toggle();
                    }
                }
            });

            console.log('⌨️ Горячие клавиши настроены');
        }

        /**
         * Настройка управления состоянием
         */
        setupStateManagement() {
            const savedState = this.loadState();
            if (savedState) {
                this.state = { ...this.state, ...savedState };
            }

            if (this.config.autoSave) {
                setInterval(() => {
                    this.saveState();
                }, 30000);
            }

            console.log('💾 Управление состоянием настроено');
        }

        /**
         * Сохранение состояния
         */
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

        /**
         * Загрузка состояния
         */
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
         * Настройка API
         */
        setupAPI() {
            console.log('🌐 API настроено');
        }

        /**
         * Загрузка системного статуса
         */
        async loadSystemStatus() {
            await new Promise(resolve => setTimeout(resolve, 500));
            const status = {
                system: 'OK',
                network: 'Connected',
                security: 'Protected'
            };
            console.log('📊 Системный статус загружен:', status);
            return status;
        }

        /**
         * Загрузка предпочтений пользователя
         */
        async loadUserPreferences() {
            await new Promise(resolve => setTimeout(resolve, 300));
            const preferences = {
                notifications: true,
                autoRefresh: true,
                compactMode: false
            };
            console.log('👤 Предпочтения пользователя загружены:', preferences);
            return preferences;
        }

        /**
         * Получение начальной страницы
         */
        getInitialPage() {
            const hash = window.location.hash.substr(1);
            if (hash && this.isValidPage(hash)) {
                return hash;
            }

            const savedState = this.loadState();
            if (savedState && savedState.currentPage && this.isValidPage(savedState.currentPage)) {
                return savedState.currentPage;
            }

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
         * Запуск периодических задач
         */
        startPeriodicTasks() {
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
                    document.body.classList.add('mobile-mode');
                } else {
                    document.body.classList.remove('mobile-mode');
                }
            };

            mediaQuery.addEventListener('change', handleMediaChange);
            handleMediaChange(mediaQuery);

            console.log('📱 Адаптивность настроена');
        }

        /**
         * Настройка доступности
         */
        setupAccessibility() {
            console.log('♿ Accessibility настроен');
        }

        /**
         * Настройка производительности
         */
        setupPerformance() {
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
            console.log('📈 Аналитика настроена');
        }

        /**
         * Восстановление состояния UI
         */
        restoreUIState() {
            // Восстанавливаем состояние sidebar
            if (this.components.sidebar) {
                if (this.state.sidebarCollapsed) {
                    this.components.sidebar.collapse();
                } else {
                    this.components.sidebar.expand();
                }
            }

            // Сворачиваем header, если sidebar свернут
            if (this.state.sidebarCollapsed && this.components.header) {
                if (typeof this.components.header.collapse === 'function') {
                    this.components.header.collapse();
                }
            }
        }

        /**
         * Обработчики событий компонентов
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
         * Показ быстрого поиска
         */
        showQuickSearch() {
            console.log('🔍 Открытие быстрого поиска');
        }

        /**
         * Обработка критических ошибок инициализации
         */
        handleInitError(error) {
            console.error('💥 Критическая ошибка инициализации:', error);

            const loadingScreen = document.getElementById('loading-screen');
            if (loadingScreen) {
                loadingScreen.innerHTML = `
                    <div class="loading-container">
                        <div class="loading-logo">
                            <div class="logo-icon">❌</div>
                            <div class="logo-text">
                                <h1>Ошибка инициализации</h1>
                                <span>IP Roast Enterprise ${this.version}</span>
                            </div>
                        </div>
                        <div class="error-details">
                            <p><strong>Ошибка:</strong> ${error.message}</p>
                            <p><strong>Время:</strong> ${new Date().toLocaleString()}</p>
                        </div>
                        <div class="error-actions">
                            <button class="error-btn" onclick="location.reload()">
                                Перезагрузить страницу
                            </button>
                        </div>
                    </div>
                `;
            }
        }
    }

    // Экспорт
    window.IPRoastApp = IPRoastApp;
    console.log('✅ IPRoastApp класс загружен (исправленная версия)');

})();