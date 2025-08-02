// shared/utils/page-loader.js

/**
 * Класс для загрузки страниц и управления навигацией по табам
 * Работает с существующей HTML структурой приложения IP Roast Enterprise
 */
export class PageLoader {
    constructor() {
        this.loadedPages = new Set();
        this.currentTab = null;
        this.isLoading = false;

        // DOM элементы
        this.mainContent = null;
        this.navItems = null;

        // Инициализация после загрузки DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    /**
     * Инициализация загрузчика страниц
     */
    init() {
        try {
            // Находим основные элементы
            this.mainContent = document.getElementById('main-content');
            this.navItems = document.querySelectorAll('.nav-item[data-tab]');

            if (!this.mainContent) {
                console.error('PageLoader: main-content container not found');
                return;
            }

            if (this.navItems.length === 0) {
                console.warn('PageLoader: no navigation items found');
            }

            // Настраиваем обработчики событий
            this.initEventListeners();

            // Загружаем сохраненную вкладку или dashboard по умолчанию
            const savedTab = localStorage.getItem('currentTab') || 'dashboard';
            this.loadPage(savedTab);

            console.log('✅ PageLoader initialized successfully');
        } catch (error) {
            console.error('❌ PageLoader initialization failed:', error);
        }
    }

    /**
     * Настройка обработчиков событий
     */
    initEventListeners() {
        this.navItems.forEach(navItem => {
            navItem.addEventListener('click', this.onNavClick.bind(this));
        });
    }

    /**
     * Обработчик клика по навигации
     */
    onNavClick(event) {
        event.preventDefault();

        const tabId = event.currentTarget.dataset.tab;
        if (!tabId) {
            console.warn('PageLoader: no tab ID found in clicked element');
            return;
        }

        // Предотвращаем повторную загрузку той же страницы
        if (this.currentTab === tabId && this.loadedPages.has(tabId)) {
            return;
        }

        this.loadPage(tabId);
    }

    /**
     * Загружает HTML-файл страницы в main-content
     * @param {string} tabId - ID вкладки для загрузки
     * @param {Function} onSuccess - callback при успешной загрузке
     * @param {Function} onError - callback при ошибке
     * @returns {Promise<boolean>} - результат загрузки
     */
    async loadPage(tabId, onSuccess = null, onError = null) {
        if (!this.mainContent) {
            console.error('PageLoader: main-content container not found');
            return false;
        }

        if (this.isLoading) {
            console.log('PageLoader: already loading, skipping request');
            return false;
        }

        this.isLoading = true;

        try {
            // Обновляем активную навигацию
            this.activateNavigation(tabId);

            // Если страница уже загружена, просто активируем её
            if (this.loadedPages.has(tabId) && this.currentTab === tabId) {
                this.isLoading = false;
                if (onSuccess) onSuccess();
                return true;
            }

            // Показываем индикатор загрузки
            this.showLoadingIndicator(tabId);

            // Загружаем HTML файл
            const response = await fetch(`APT_frontend/pages/${tabId}.html`);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const html = await response.text();

            // Проверяем, что HTML не пустой
            if (!html.trim()) {
                throw new Error('Загруженный файл пуст');
            }

            // Небольшая задержка для плавности UI
            await this.delay(200);

            // Вставляем загруженный контент
            this.mainContent.innerHTML = html;

            // Отмечаем страницу как загруженную
            this.loadedPages.add(tabId);
            this.currentTab = tabId;

            // Сохраняем выбранную вкладку
            localStorage.setItem('currentTab', tabId);

            console.log(`✅ Page ${tabId} loaded successfully`);

            // Вызываем callback успеха
            if (onSuccess) onSuccess();

            // Инициализируем функциональность страницы
            this.initializePageFunctionality(tabId);

            return true;

        } catch (error) {
            console.error(`❌ Failed to load page ${tabId}:`, error);

            // Показываем ошибку
            this.showErrorMessage(tabId, error.message);

            // Вызываем callback ошибки
            if (onError) onError(error);

            return false;
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Показывает индикатор загрузки
     */
    showLoadingIndicator(tabId) {
        const moduleTitle = this.getModuleTitle(tabId);

        this.mainContent.innerHTML = `
            <div class="module-loading">
                <div class="loading-container">
                    <div class="loading-spinner"></div>
                    <h3 class="loading-title">Загрузка модуля</h3>
                    <p class="loading-text">${moduleTitle}</p>
                    <div class="loading-progress">
                        <div class="progress-bar"></div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Показывает сообщение об ошибке
     */
    showErrorMessage(tabId, errorMessage) {
        const moduleTitle = this.getModuleTitle(tabId);

        this.mainContent.innerHTML = `
            <div class="module-error">
                <div class="error-container">
                    <div class="error-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h3 class="error-title">Ошибка загрузки модуля</h3>
                    <p class="error-subtitle">${moduleTitle}</p>
                    <p class="error-message">${errorMessage}</p>
                    <div class="error-actions">
                        <button class="btn btn--primary retry-btn" onclick="window.pageLoader.loadPage('${tabId}')">
                            <i class="fas fa-redo"></i>
                            Попробовать снова
                        </button>
                        <button class="btn btn--secondary home-btn" onclick="window.pageLoader.loadPage('dashboard')">
                            <i class="fas fa-home"></i>
                            На главную
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Обновляет активную навигацию
     */
    activateNavigation(tabId) {
        this.navItems.forEach(navItem => {
            const isActive = navItem.dataset.tab === tabId;
            navItem.classList.toggle('active', isActive);

            // Обновляем ARIA атрибуты для доступности
            navItem.setAttribute('aria-selected', isActive.toString());
        });
    }

    /**
     * Инициализирует функциональность загруженной страницы
     */
    initializePageFunctionality(tabId) {
        // Можно добавить специфичную инициализацию для каждого модуля
        switch (tabId) {
            case 'dashboard':
                this.initializeDashboard();
                break;
            case 'scanner':
                this.initializeScanner();
                break;
            case 'attack-constructor':
                this.initializeAttackConstructor();
                break;
            case 'network-topology':
                this.initializeNetworkTopology();
                break;
            case 'reports':
                this.initializeReports();
                break;
            case 'settings':
                this.initializeSettings();
                break;
        }
    }

    /**
     * Инициализация функциональности Dashboard
     */
    initializeDashboard() {
        // Поиск и инициализация интерактивных элементов
        const refreshBtn = document.querySelector('.refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                console.log('Dashboard refresh requested');
                // Здесь можно добавить логику обновления данных
            });
        }

        // Инициализация автообновления
        const autoRefreshToggle = document.querySelector('#autoRefresh');
        if (autoRefreshToggle) {
            autoRefreshToggle.addEventListener('change', (e) => {
                console.log('Auto refresh:', e.target.checked);
            });
        }

        console.log('Dashboard functionality initialized');
    }

    /**
     * Заглушки для инициализации других модулей
     */
    initializeScanner() {
        console.log('Scanner functionality initialized');
    }

    initializeAttackConstructor() {
        console.log('Attack Constructor functionality initialized');
    }

    initializeNetworkTopology() {
        console.log('Network Topology functionality initialized');
    }

    initializeReports() {
        console.log('Reports functionality initialized');
    }

    initializeSettings() {
        console.log('Settings functionality initialized');
    }

    /**
     * Получить название модуля для отображения
     */
    getModuleTitle(tabId) {
        const titles = {
            'dashboard': 'Панель управления',
            'scanner': 'Модуль сканирования',
            'attack-constructor': 'Конструктор атак',
            'network-topology': 'Топология сети',
            'reports': 'Отчеты и аналитика',
            'settings': 'Настройки системы'
        };
        return titles[tabId] || `Модуль ${tabId}`;
    }

    /**
     * Вспомогательная функция задержки
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Перезагрузка текущей страницы
     */
    reloadCurrentPage() {
        if (this.currentTab) {
            this.loadedPages.delete(this.currentTab);
            this.loadPage(this.currentTab);
        }
    }

    /**
     * Получить текущий активный таб
     */
    getCurrentTab() {
        return this.currentTab;
    }

    /**
     * Проверить, загружена ли страница
     */
    isPageLoaded(tabId) {
        return this.loadedPages.has(tabId);
    }

    /**
     * Очистка загруженных страниц
     */
    clearCache() {
        this.loadedPages.clear();
        console.log('Page cache cleared');
    }

    /**
     * Уничтожение загрузчика страниц
     */
    destroy() {
        // Удаляем обработчики событий
        this.navItems.forEach(navItem => {
            navItem.removeEventListener('click', this.onNavClick.bind(this));
        });

        // Очищаем данные
        this.loadedPages.clear();
        this.currentTab = null;
        this.mainContent = null;
        this.navItems = null;

        console.log('PageLoader destroyed');
    }
}

/**
 * Функция для совместимости со старым кодом
 * @param {string} tabId - ID вкладки
 * @param {string} containerSelector - селектор контейнера (игнорируется)
 * @param {Function} onSuccess - callback успеха
 * @param {Function} onError - callback ошибки
 */
export async function loadPage(tabId, containerSelector, onSuccess, onError) {
    if (!window.pageLoader) {
        window.pageLoader = new PageLoader();
    }
    return window.pageLoader.loadPage(tabId, onSuccess, onError);
}

// Создаем глобальный экземпляр для доступа из любой части приложения
let pageLoaderInstance = null;

// Инициализируем загрузчик после загрузки DOM
if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            pageLoaderInstance = new PageLoader();
            window.pageLoader = pageLoaderInstance;
        });
    } else {
        pageLoaderInstance = new PageLoader();
        window.pageLoader = pageLoaderInstance;
    }
}

// Экспорт по умолчанию
export default PageLoader;
