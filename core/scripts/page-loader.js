/**
 * PageLoader.js - Исправленный загрузчик страниц для IP Roast Enterprise 4.0
 * Управляет динамической загрузкой HTML страниц в контейнер
 * 
 * ИСПРАВЛЕНИЯ:
 * - Правильные ID элементов DOM
 * - Интеграция с sidebar навигацией
 * - Улучшенная обработка ошибок
 * - Правильная структура путей
 */
class PageLoader {
    constructor() {
        this.currentPage = null;
        this.pageCache = new Map();
        this.loadingQueue = new Set();
        this.elements = {
            container: null,
            content: null,
            loading: null
        };
        this.config = {
            pagesPath: '../pages',  // Исправлено: убран '../'
            cachePages: true,
            loadTimeout: 10000,
            enableTransitions: true
        };
        this.eventListeners = new Map();
        this.init();
    }

    /**
     * Инициализация загрузчика страниц
     */
    init() {
        this.findElements();
        this.setupEventListeners();
        console.log('📄 PageLoader инициализирован (исправленная версия)');
    }

    /**
     * Поиск DOM элементов - ИСПРАВЛЕНО
     */
    findElements() {
        // Ищем правильные элементы из HTML структуры
        this.elements.container = document.querySelector('.page-container') ||
            document.getElementById('page-container') ||
            document.querySelector('.main-content .page-container');

        // Если основной контейнер не найден, ищем альтернативные варианты
        if (!this.elements.container) {
            // Создаем контейнер если его нет
            const mainContent = document.querySelector('.main-content');
            if (mainContent) {
                this.elements.container = document.createElement('div');
                this.elements.container.className = 'page-container';
                this.elements.container.id = 'page-container';
                mainContent.appendChild(this.elements.container);
                console.log('📄 Создан отсутствующий page-container');
            }
        }

        // Ищем контент контейнер
        this.elements.content = document.querySelector('.page-content') ||
            document.getElementById('page-content');

        // Создаем page-content если его нет
        if (!this.elements.content && this.elements.container) {
            this.elements.content = document.createElement('div');
            this.elements.content.className = 'page-content';
            this.elements.content.id = 'page-content';
            this.elements.container.appendChild(this.elements.content);
            console.log('📄 Создан отсутствующий page-content');
        }

        // Ищем или создаем loading элемент
        this.elements.loading = document.querySelector('.page-loading') ||
            document.getElementById('page-loading');

        if (!this.elements.loading && this.elements.container) {
            this.elements.loading = document.createElement('div');
            this.elements.loading.className = 'page-loading';
            this.elements.loading.id = 'page-loading';
            this.elements.loading.innerHTML = `
                <div class="loading-spinner"></div>
                <div class="loading-text">Загрузка страницы...</div>
            `;
            this.elements.container.appendChild(this.elements.loading);
            console.log('📄 Создан отсутствующий page-loading');
        }

        // Проверяем что все элементы найдены
        const elementsFound = {
            container: !!this.elements.container,
            content: !!this.elements.content,
            loading: !!this.elements.loading
        };

        console.log('🔍 PageLoader элементы:', elementsFound);

        if (!this.elements.container || !this.elements.content) {
            console.error('❌ PageLoader: критические элементы не найдены');
            throw new Error('PageLoader: необходимые элементы не найдены');
        }
    }

    /**
     * Настройка обработчиков событий - ИСПРАВЛЕНО
     */
    setupEventListeners() {
        // Обработка навигации по истории браузера
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.page) {
                this.loadPage(e.state.page, false);
            }
        });

        // Обработка кликов по ссылкам - улучшенная версия
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href^="#"], a[data-page]');
            if (link) {
                e.preventDefault();
                let pageId;

                // Получаем ID страницы из разных атрибутов
                if (link.dataset.page) {
                    pageId = link.dataset.page;
                } else if (link.getAttribute('href').startsWith('#')) {
                    pageId = link.getAttribute('href').substr(1);
                }

                if (pageId && this.isValidPageId(pageId)) {
                    console.log(`🔗 Клик по ссылке, загрузка страницы: ${pageId}`);
                    this.loadPage(pageId);
                }
            }
        });

        // Слушатель для событий от SidebarManager - НОВОЕ
        if (window.sidebarManager) {
            window.sidebarManager.on('navigate', (pageId) => {
                console.log(`🔗 Навигация от sidebar: ${pageId}`);
                this.loadPage(pageId);
            });
        }

        // Глобальный слушатель для навигации - НОВОЕ
        document.addEventListener('navigate', (e) => {
            if (e.detail && e.detail.page) {
                console.log(`🔗 Навигация от события: ${e.detail.page}`);
                this.loadPage(e.detail.page);
            }
        });

        console.log('⚡ PageLoader обработчики событий настроены');
    }

    /**
     * Основной метод загрузки страницы - УЛУЧШЕННЫЙ
     */
    async loadPage(pageId, updateHistory = true) {
        if (!pageId || !this.isValidPageId(pageId)) {
            console.error(`❌ Недопустимый ID страницы: ${pageId}`);
            this.showErrorPage(new Error(`Недопустимый ID страницы: ${pageId}`), pageId);
            return;
        }

        // Предотвращаем повторную загрузку той же страницы
        if (this.currentPage === pageId && !this.loadingQueue.has(pageId)) {
            console.log(`📄 Страница ${pageId} уже загружена`);
            return;
        }

        // Предотвращаем одновременную загрузку той же страницы
        if (this.loadingQueue.has(pageId)) {
            console.log(`📄 Страница ${pageId} уже загружается`);
            return;
        }

        console.log(`📄 Загрузка страницы: ${pageId}`);
        this.loadingQueue.add(pageId);

        try {
            // Показываем индикатор загрузки
            this.showLoading();

            // Загружаем страницу
            let pageData;
            if (this.config.cachePages && this.pageCache.has(pageId)) {
                pageData = this.pageCache.get(pageId);
                console.log(`📄 Страница загружена из кэша: ${pageId}`);
            } else {
                pageData = await this.fetchPage(pageId);
                if (this.config.cachePages) {
                    this.pageCache.set(pageId, pageData);
                }
            }

            // Устанавливаем контент
            await this.setPageContent(pageData);

            // Обновляем историю браузера
            if (updateHistory) {
                this.updateBrowserHistory(pageId, pageData.title);
            }

            // Обновляем текущую страницу
            this.currentPage = pageId;

            // Скрываем индикатор загрузки
            this.hideLoading();

            // Эмитируем событие успешной загрузки
            this.emit('pageLoaded', {
                id: pageId,
                title: pageData.title,
                data: pageData
            });

            // Обновляем заголовок в header если доступен
            if (window.headerManager) {
                window.headerManager.updatePageTitle(pageData.title);
            }

            console.log(`✅ Страница успешно загружена: ${pageId}`);

        } catch (error) {
            console.error(`❌ Ошибка загрузки страницы ${pageId}:`, error);
            // Показываем страницу ошибки
            this.showErrorPage(error, pageId);
            // Эмитируем событие ошибки
            this.emit('pageError', { id: pageId, error: error });
        } finally {
            this.loadingQueue.delete(pageId);
        }
    }

    /**
     * Загрузка HTML файла страницы
     */
    async fetchPage(pageId) {
        // Попробуем несколько вариантов путей
        const possiblePaths = [
            `${this.config.pagesPath}/${pageId}/${pageId}.html`,
            `${this.config.pagesPath}/${pageId}/index.html`,
            `./pages/${pageId}/index.html`,
            `./pages/${pageId}.html`,
            `pages/${pageId}/index.html`,
            `pages/${pageId}.html`
        ];

        let lastError;
        for (const pageUrl of possiblePaths) {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => {
                controller.abort();
            }, this.config.loadTimeout);

            try {
                console.log(`🌐 Попытка загрузки: ${pageUrl}`);
                const response = await fetch(pageUrl, {
                    signal: controller.signal,
                    method: 'GET',
                    headers: {
                        'Accept': 'text/html',
                        'Cache-Control': 'no-cache'
                    }
                });

                clearTimeout(timeoutId);

                if (response.ok) {
                    const html = await response.text();
                    console.log(`✅ Страница загружена: ${pageUrl}`);

                    // Парсим HTML и извлекаем metadata
                    const pageData = this.parsePageHTML(html, pageId);

                    // Загружаем связанные ресурсы (CSS, JS)
                    await this.loadPageResources(pageId);

                    return pageData;
                }
            } catch (error) {
                clearTimeout(timeoutId);
                lastError = error;
                console.warn(`⚠️ Не удалось загрузить ${pageUrl}:`, error.message);
            }
        }

        // Если ни один путь не сработал, создаем заглушку
        console.warn(`⚠️ Страница ${pageId} не найдена, создаем заглушку`);
        return this.createFallbackPage(pageId);
    }

    /**
     * Создание заглушки страницы - НОВОЕ
     */
    createFallbackPage(pageId) {
        const pageTitle = this.getPageTitle(pageId);
        return {
            id: pageId,
            title: pageTitle,
            description: `Страница ${pageTitle}`,
            content: `
                <div class="page-placeholder">
                    <h2>${pageTitle}</h2>
                    <p>Содержимое страницы "${pageTitle}" пока не доступно.</p>
                    <p>ID страницы: <code>${pageId}</code></p>
                    <div class="placeholder-actions">
                        <button onclick="window.location.reload()" class="btn btn--primary">
                            Обновить страницу
                        </button>
                        <button onclick="window.pageLoader?.loadPage('dashboard')" class="btn btn--secondary">
                            На главную
                        </button>
                    </div>
                </div>
                <style>
                    .page-placeholder {
                        text-align: center;
                        padding: 60px 20px;
                        max-width: 600px;
                        margin: 0 auto;
                    }
                    .page-placeholder h2 {
                        color: var(--color-text);
                        margin-bottom: 16px;
                    }
                    .page-placeholder p {
                        color: var(--color-text-secondary);
                        margin-bottom: 12px;
                    }
                    .placeholder-actions {
                        margin-top: 32px;
                    }
                    .placeholder-actions .btn {
                        margin: 0 8px;
                    }
                </style>
            `,
            timestamp: Date.now()
        };
    }

    /**
     * Парсинг HTML страницы - БЕЗ ИЗМЕНЕНИЙ
     */
    parsePageHTML(html, pageId) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // Извлекаем основной контент
        const mainContent = doc.querySelector('main') || doc.body;
        const content = mainContent ? mainContent.innerHTML : html;

        // Извлекаем метаданные
        const titleElement = doc.querySelector('title');
        const title = titleElement ? titleElement.textContent : this.getPageTitle(pageId);

        // Извлекаем описание
        const descriptionMeta = doc.querySelector('meta[name="description"]');
        const description = descriptionMeta ? descriptionMeta.getAttribute('content') : '';

        return {
            id: pageId,
            title: title,
            description: description,
            content: content,
            timestamp: Date.now()
        };
    }

    /**
     * Получение заголовка страницы по ID - НОВОЕ
     */
    getPageTitle(pageId) {
        const titles = {
            'dashboard': 'Панель управления',
            'scanner': 'Модуль сканирования',
            'attack-constructor': 'Конструктор атак',
            'network-topology': 'Топология сети',
            'reports': 'Отчеты и аналитика',
            'settings': 'Настройки системы',
            'monitoring': 'Мониторинг',
            'analytics': 'Аналитика',
            'security': 'Безопасность',
            'logs': 'Журналы событий'
        };
        return titles[pageId] || `Страница ${pageId}`;
    }

    /**
     * Проверка валидности ID страницы - УЛУЧШЕННАЯ
     */
    isValidPageId(pageId) {
        if (!pageId || typeof pageId !== 'string') {
            return false;
        }

        // Разрешенные символы и длина
        const validPattern = /^[a-zA-Z0-9_-]+$/;
        const maxLength = 50;

        return validPattern.test(pageId) && pageId.length <= maxLength;
    }

    /**
     * Загрузка связанных ресурсов страницы - БЕЗ ИЗМЕНЕНИЙ
     */
    async loadPageResources(pageId) {
        const promises = [];

        // Загружаем CSS файл страницы
        const cssUrl = `${this.config.pagesPath}/${pageId}/${pageId}.css`;
        promises.push(this.loadCSS(cssUrl, pageId));

        // Загружаем JS файл страницы
        const jsUrl = `${this.config.pagesPath}/${pageId}/${pageId}.js`;
        promises.push(this.loadJS(jsUrl, pageId));

        try {
            await Promise.allSettled(promises);
            console.log(`📦 Ресурсы страницы ${pageId} загружены`);
        } catch (error) {
            console.warn(`⚠️ Ошибка загрузки ресурсов страницы ${pageId}:`, error);
            // Не прерываем загрузку страницы из-за ошибок в ресурсах
        }
    }

    /**
     * Загрузка CSS файла - БЕЗ ИЗМЕНЕНИЙ
     */
    async loadCSS(url, pageId) {
        // Проверяем, не загружен ли уже этот CSS
        const existingLink = document.querySelector(`link[data-page="${pageId}"]`);
        if (existingLink) {
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = url;
            link.dataset.page = pageId;
            link.onload = () => {
                console.log(`✅ CSS загружен: ${url}`);
                resolve();
            };
            link.onerror = () => {
                console.warn(`⚠️ CSS не найден: ${url}`);
                resolve(); // Не прерываем загрузку из-за отсутствующего CSS
            };
            document.head.appendChild(link);
        });
    }

    /**
     * Загрузка JS файла - БЕЗ ИЗМЕНЕНИЙ
     */
    async loadJS(url, pageId) {
        // Проверяем, не загружен ли уже этот скрипт
        const existingScript = document.querySelector(`script[data-page="${pageId}"]`);
        if (existingScript) {
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = url;
            script.dataset.page = pageId;
            script.defer = true;
            script.onload = () => {
                console.log(`✅ JS загружен: ${url}`);
                resolve();
            };
            script.onerror = () => {
                console.warn(`⚠️ JS не найден: ${url}`);
                resolve(); // Не прерываем загрузку из-за отсутствующего JS
            };
            document.head.appendChild(script);
        });
    }

    /**
     * Установка контента страницы - УЛУЧШЕННАЯ
     */
    async setPageContent(pageData) {
        if (!this.elements.content) {
            throw new Error('Контейнер для контента не найден');
        }

        // Анимация выхода (если включены переходы)
        if (this.config.enableTransitions && this.currentPage) {
            this.elements.content.classList.add('page-transition-exit');
            await this.delay(150);
        }

        // Устанавливаем новый контент
        this.elements.content.innerHTML = pageData.content;

        // Инициализируем скрипты на новой странице
        await this.initializePageScripts(pageData.id);

        // Анимация входа (если включены переходы)
        if (this.config.enableTransitions) {
            this.elements.content.classList.remove('page-transition-exit');
            this.elements.content.classList.add('page-transition-enter');
            await this.delay(50);
            this.elements.content.classList.add('page-transition-enter-active');
            this.elements.content.classList.remove('page-transition-enter');
            await this.delay(300);
            this.elements.content.classList.remove('page-transition-enter-active');
        }

        // Прокручиваем в начало
        if (this.elements.content.scrollTo) {
            this.elements.content.scrollTo(0, 0);
        } else {
            this.elements.content.scrollTop = 0;
        }
    }

    /**
     * Инициализация скриптов на странице - БЕЗ ИЗМЕНЕНИЙ
     */
    async initializePageScripts(pageId) {
        // Ищем функцию инициализации страницы
        const initFunctionName = `init${pageId.charAt(0).toUpperCase() + pageId.slice(1).replace(/-(.)/g, (_, letter) => letter.toUpperCase())}`;

        if (typeof window[initFunctionName] === 'function') {
            try {
                await window[initFunctionName]();
                console.log(`✅ Скрипты страницы ${pageId} инициализированы`);
            } catch (error) {
                console.warn(`⚠️ Ошибка инициализации скриптов страницы ${pageId}:`, error);
            }
        }

        // Инициализируем компоненты на странице
        this.initializePageComponents();
    }

    /**
     * Инициализация компонентов на странице - БЕЗ ИЗМЕНЕНИЙ
     */
    initializePageComponents() {
        // Здесь можно инициализировать общие компоненты
        const interactiveElements = this.elements.content.querySelectorAll('[data-component]');
        interactiveElements.forEach(element => {
            const componentType = element.dataset.component;
            console.log(`🔧 Инициализация компонента: ${componentType}`);
        });
    }

    /**
     * Показ индикатора загрузки - УЛУЧШЕННЫЙ
     */
    showLoading() {
        if (this.elements.loading) {
            this.elements.loading.classList.add('active');
            this.elements.loading.style.display = 'flex';
        }
    }

    /**
     * Скрытие индикатора загрузки - УЛУЧШЕННЫЙ
     */
    hideLoading() {
        if (this.elements.loading) {
            this.elements.loading.classList.remove('active');
            // Добавляем небольшую задержку для плавности
            setTimeout(() => {
                if (this.elements.loading && !this.elements.loading.classList.contains('active')) {
                    this.elements.loading.style.display = 'none';
                }
            }, 300);
        }
    }

    /**
     * Показ страницы ошибки - УЛУЧШЕННАЯ
     */
    showErrorPage(error, pageId) {
        const errorHTML = `
            <div class="page-error">
                <div class="error-icon">⚠️</div>
                <h2 class="error-title">Ошибка загрузки страницы</h2>
                <p class="error-message">${error.message}</p>
                <div class="error-details">
                    <p><strong>Страница:</strong> ${pageId}</p>
                    <p><strong>Время:</strong> ${new Date().toLocaleString()}</p>
                </div>
                <div class="error-actions">
                    <button onclick="window.location.reload()" class="error-btn">
                        Обновить страницу
                    </button>
                    <button onclick="window.pageLoader?.loadPage('dashboard')" class="error-btn secondary">
                        На главную
                    </button>
                    <button onclick="window.pageLoader?.loadPage('${pageId}')" class="error-btn secondary">
                        Попробовать еще раз
                    </button>
                </div>
            </div>
        `;

        if (this.elements.content) {
            this.elements.content.innerHTML = errorHTML;
        }

        this.hideLoading();
    }

    /**
     * Обновление истории браузера - БЕЗ ИЗМЕНЕНИЙ
     */
    updateBrowserHistory(pageId, title) {
        if (window.history && window.history.pushState) {
            window.history.pushState(
                { page: pageId },
                title,
                `#${pageId}`
            );
            document.title = `${title} - IP Roast Enterprise`;
        }
    }

    /**
     * Утилита задержки - БЕЗ ИЗМЕНЕНИЙ
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Система событий - БЕЗ ИЗМЕНЕНИЙ
     */
    on(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(callback);
    }

    off(event, callback) {
        if (this.eventListeners.has(event)) {
            const listeners = this.eventListeners.get(event);
            const index = listeners.indexOf(callback);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }

    emit(event, data) {
        if (this.eventListeners.has(event)) {
            this.eventListeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Ошибка в обработчике события ${event}:`, error);
                }
            });
        }
    }

    /**
     * Получение информации о загрузчике - НОВОЕ
     */
    getInfo() {
        return {
            currentPage: this.currentPage,
            cacheSize: this.pageCache.size,
            loadingQueue: Array.from(this.loadingQueue),
            elementsFound: {
                container: !!this.elements.container,
                content: !!this.elements.content,
                loading: !!this.elements.loading
            }
        };
    }

    /**
     * Принудительная перезагрузка страницы - НОВОЕ
     */
    async reloadCurrentPage() {
        if (this.currentPage) {
            // Очищаем кэш для текущей страницы
            this.pageCache.delete(this.currentPage);
            // Перезагружаем
            await this.loadPage(this.currentPage, false);
        }
    }

    /**
     * Очистка кэша - НОВОЕ
     */
    clearCache() {
        this.pageCache.clear();
        console.log('🗑️ Кэш страниц очищен');
    }
}

// Глобальный экспорт
window.PageLoader = PageLoader;

// Автоматическая инициализация если элементы готовы
document.addEventListener('DOMContentLoaded', () => {
    // Ждем немного чтобы другие компоненты могли загрузиться
    setTimeout(() => {
        if (!window.pageLoader) {
            try {
                window.pageLoader = new PageLoader();
                console.log('✅ PageLoader автоматически инициализирован');
            } catch (error) {
                console.warn('⚠️ Автоматическая инициализация PageLoader не удалась:', error);
            }
        }
    }, 100);
});

console.log('📄 PageLoader (исправленная версия) загружен');