/**
 * Enhanced PageManager - Улучшенная система загрузки страниц
 * Поддерживает загрузку HTML, CSS и JS из папки pages/
 * Version: 3.1.0-Fixed (12 Aug 2025)
 * 
 * ИСПРАВЛЕНИЯ:
 * ✅ Добавлен метод registerPage для интеграции с модулями
 * ✅ Добавлена система управления жизненным циклом страниц
 * ✅ Улучшена обработка ошибок и событий
 */

class EnhancedPageManager extends ComponentBase {
    constructor() {
        super('EnhancedPageManager');

        // ===== НОВОЕ: Реестр зарегистрированных страниц =====
        this.registeredPages = new Map();
        this.pageInstances = new Map();

        // Кэш для всех ресурсов страниц
        this.cache = {
            html: new Map(),
            css: new Map(),
            js: new Map(),
            modules: new Map()
        };

        // Состояние загрузки
        this.loadingQueue = new Set();
        this.currentPageId = null;
        this.previousPageId = null;
        this.loadedStyles = new Set();
        this.loadedScripts = new Set();

        // Конфигурация
        this.config = {
            pagesPath: './pages',
            cachePages: true,
            loadTimeout: 15000,
            enableTransitions: true,
            transitionDuration: 300,
            enableScripts: true,
            enableStyles: true,
            cleanupOnNavigation: true
        };

        // DOM элементы
        this.elements = {
            container: null,
            content: null,
            loading: null,
            styleContainer: null
        };

        console.log('📄 Enhanced PageManager v3.1-Fixed создан');
    }

    /**
     * ===== НОВОЕ API: РЕГИСТРАЦИЯ СТРАНИЦ =====
     * Регистрирует страницу с её конфигурацией и хуками жизненного цикла
     */
    registerPage(pageId, config = {}) {
        try {
            const pageConfig = {
                title: config.title || pageId,
                module: config.module || null,
                activate: config.activate || (() => { }),
                deactivate: config.deactivate || (() => { }),
                cleanup: config.cleanup || (() => { }),
                initialized: false,
                ...config
            };

            this.registeredPages.set(pageId, pageConfig);

            // Если есть модуль, сохраняем его экземпляр
            if (config.module) {
                this.pageInstances.set(pageId, config.module);
            }

            console.log(`📋 Страница зарегистрирована: ${pageId}`, pageConfig);
            this.emit('pageRegistered', { pageId, config: pageConfig });

            return true;
        } catch (error) {
            console.error(`❌ Ошибка регистрации страницы ${pageId}:`, error);
            return false;
        }
    }

    /**
     * Получает конфигурацию зарегистрированной страницы
     */
    getPageConfig(pageId) {
        return this.registeredPages.get(pageId) || null;
    }

    /**
     * Получает экземпляр модуля страницы
     */
    getPageInstance(pageId) {
        return this.pageInstances.get(pageId) || null;
    }

    /**
     * Отменяет регистрацию страницы
     */
    unregisterPage(pageId) {
        const config = this.registeredPages.get(pageId);
        if (config) {
            // Вызываем cleanup перед удалением
            if (typeof config.cleanup === 'function') {
                try {
                    config.cleanup();
                } catch (error) {
                    console.warn(`⚠️ Ошибка cleanup при отмене регистрации ${pageId}:`, error);
                }
            }

            this.registeredPages.delete(pageId);
            this.pageInstances.delete(pageId);
            this.emit('pageUnregistered', { pageId });
            console.log(`🗑️ Страница отменена: ${pageId}`);
            return true;
        }
        return false;
    }

    /**
     * Инициализация менеджера страниц
     */
    async doInit() {
        try {
            this.findPageElements();
            this.setupStyleContainer();
            this.setupEventListeners();

            // Инициализируем базовые стили для переходов
            this.initializeTransitionStyles();

            console.log('✅ Enhanced PageManager инициализирован');
            this.emit('managerReady');
        } catch (error) {
            console.error('❌ Ошибка инициализации Enhanced PageManager:', error);
            throw error;
        }
    }

    /**
     * Поиск и создание элементов для страниц
     */
    findPageElements() {
        // Ищем контейнер для страниц
        this.elements.container = document.querySelector('#page-container') ||
            document.querySelector('.page-container');

        if (!this.elements.container) {
            const mainContent = document.querySelector('.main-content') ||
                document.querySelector('main') ||
                document.body;

            this.elements.container = document.createElement('div');
            this.elements.container.id = 'page-container';
            this.elements.container.className = 'page-container';
            mainContent.appendChild(this.elements.container);
            console.log('📄 Создан page-container');
        }

        // Создаем контент контейнер
        this.elements.content = this.elements.container.querySelector('#page-content') ||
            this.elements.container.querySelector('.page-content');

        if (!this.elements.content) {
            this.elements.content = document.createElement('div');
            this.elements.content.id = 'page-content';
            this.elements.content.className = 'page-content';
            this.elements.container.appendChild(this.elements.content);
        }

        // Создаем индикатор загрузки
        this.createLoadingIndicator();
    }

    /**
     * Создание контейнера для стилей страниц
     */
    setupStyleContainer() {
        this.elements.styleContainer = document.getElementById('page-styles-container');

        if (!this.elements.styleContainer) {
            this.elements.styleContainer = document.createElement('div');
            this.elements.styleContainer.id = 'page-styles-container';
            document.head.appendChild(this.elements.styleContainer);
        }
    }

    /**
     * Создание индикатора загрузки
     */
    createLoadingIndicator() {
        this.elements.loading = document.createElement('div');
        this.elements.loading.id = 'page-loading';
        this.elements.loading.className = 'page-loading hidden';
        this.elements.loading.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p class="loading-text">Загрузка страницы...</p>
            </div>
        `;
        this.elements.container.appendChild(this.elements.loading);
    }

    /**
     * Инициализация базовых стилей для переходов
     */
    initializeTransitionStyles() {
        const styleId = 'enhanced-page-manager-styles';
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .page-container {
                position: relative;
                width: 100%;
                min-height: 400px;
            }
            .page-content {
                transition: opacity ${this.config.transitionDuration}ms ease-in-out;
            }
            .page-loading {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                background: rgba(var(--bg-color-rgb, 255, 255, 255), 0.9);
                z-index: 1000;
                transition: opacity 200ms ease-in-out;
            }
            .page-loading.hidden {
                opacity: 0;
                pointer-events: none;
            }
            .loading-spinner {
                text-align: center;
            }
            .spinner {
                width: 40px;
                height: 40px;
                border: 3px solid rgba(var(--accent-color-rgb, 0, 123, 255), 0.2);
                border-top: 3px solid var(--accent-color, #007bff);
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 16px;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            .page-error {
                padding: 20px;
                background: #f8d7da;
                border: 1px solid #f5c6cb;
                border-radius: 8px;
                color: #721c24;
                margin: 20px;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Настройка слушателей событий
     */
    setupEventListeners() {
        // Слушаем изменения в истории браузера
        window.addEventListener('popstate', (event) => {
            if (event.state && event.state.pageId) {
                this.loadPage(event.state.pageId, { skipTransition: false });
            }
        });

        // Обработка ошибок загрузки ресурсов
        window.addEventListener('error', (event) => {
            if (event.target && event.target.src) {
                console.warn('⚠️ Ошибка загрузки ресурса:', event.target.src);
            }
        });
    }

    /**
     * ===== ОСНОВНОЙ МЕТОД ЗАГРУЗКИ СТРАНИЦЫ (УЛУЧШЕННЫЙ) =====
     */
    async loadPage(pageId, options = {}) {
        const { skipTransition = false, force = false, updateHistory = true } = options;

        // Проверяем, не загружается ли уже страница
        if (this.loadingQueue.has(pageId) && !force) {
            console.log(`⏳ Страница ${pageId} уже загружается`);
            return false;
        }

        // Если это текущая страница и не форсируем перезагрузку
        if (pageId === this.currentPageId && !force) {
            console.log(`✅ Страница ${pageId} уже активна`);
            return true;
        }

        this.loadingQueue.add(pageId);
        const previousPageConfig = this.getPageConfig(this.currentPageId);

        try {
            // Показываем индикатор загрузки
            if (!skipTransition) {
                this.showLoadingState();
            }

            // Очищаем предыдущую страницу если нужно
            if (this.config.cleanupOnNavigation && this.currentPageId) {
                await this.cleanupPage(this.currentPageId);
            }

            // Параллельная загрузка всех ресурсов
            const [html, css, js] = await Promise.all([
                this.loadPageHTML(pageId),
                this.loadPageCSS(pageId),
                this.loadPageJS(pageId)
            ]);

            // Применяем ресурсы по порядку
            if (css && this.config.enableStyles) {
                await this.applyPageStyles(pageId, css);
            }

            if (html) {
                await this.renderPageHTML(pageId, html, skipTransition);
            }

            if (js && this.config.enableScripts) {
                await this.executePageScript(pageId, js);
            }

            // ===== НОВОЕ: Управление жизненным циклом =====
            await this.handlePageLifecycle(pageId, previousPageConfig);

            // Обновляем историю браузера
            if (updateHistory && pageId !== this.currentPageId) {
                this.updateBrowserHistory(pageId);
            }

            // Скрываем индикатор загрузки
            if (!skipTransition) {
                this.hideLoadingState();
            }

            // Генерируем событие успешной загрузки
            this.emit('pageLoaded', {
                pageId,
                previousPageId: this.previousPageId,
                hasHTML: !!html,
                hasCSS: !!css,
                hasJS: !!js,
                loadTime: Date.now()
            });

            console.log(`✅ Страница «${pageId}» успешно загружена`);
            return true;

        } catch (error) {
            console.error(`❌ Ошибка загрузки страницы «${pageId}»:`, error);
            this.showErrorState(pageId, error);
            this.emit('pageError', { pageId, error, previousPageId: this.currentPageId });
            return false;
        } finally {
            this.loadingQueue.delete(pageId);
        }
    }

    /**
     * ===== НОВОЕ: Управление жизненным циклом страниц =====
     */
    async handlePageLifecycle(newPageId, previousPageConfig) {
        // Деактивируем предыдущую страницу
        if (previousPageConfig && this.currentPageId) {
            try {
                if (typeof previousPageConfig.deactivate === 'function') {
                    await previousPageConfig.deactivate();
                }
                this.emit('pageDeactivate', {
                    pageId: this.currentPageId,
                    nextPageId: newPageId
                });
            } catch (error) {
                console.warn(`⚠️ Ошибка при деактивации страницы ${this.currentPageId}:`, error);
            }
        }

        // Обновляем текущую страницу
        this.previousPageId = this.currentPageId;
        this.currentPageId = newPageId;

        // Активируем новую страницу
        const newPageConfig = this.getPageConfig(newPageId);
        if (newPageConfig) {
            try {
                if (typeof newPageConfig.activate === 'function') {
                    await newPageConfig.activate();
                }
                newPageConfig.initialized = true;
                this.emit('pageActivate', {
                    pageId: newPageId,
                    previousPageId: this.previousPageId
                });
            } catch (error) {
                console.warn(`⚠️ Ошибка при активации страницы ${newPageId}:`, error);
            }
        }
    }

    /**
     * Загрузка HTML файла страницы
     */
    async loadPageHTML(pageId) {
        if (this.config.cachePages && this.cache.html.has(pageId)) {
            return this.cache.html.get(pageId);
        }

        try {
            const response = await fetch(`${this.config.pagesPath}/${pageId}/${pageId}.html`, {
                cache: this.config.cachePages ? 'default' : 'no-cache'
            });

            if (!response.ok) {
                if (response.status === 404) {
                    console.log(`📄 HTML файл не найден для страницы: ${pageId}`);
                    return null;
                }
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const html = await response.text();

            if (this.config.cachePages) {
                this.cache.html.set(pageId, html);
            }

            return html;
        } catch (error) {
            console.warn(`⚠️ Не удалось загрузить HTML для ${pageId}:`, error.message);
            return null;
        }
    }

    /**
     * Загрузка CSS файла страницы
     */
    async loadPageCSS(pageId) {
        if (this.config.cachePages && this.cache.css.has(pageId)) {
            return this.cache.css.get(pageId);
        }

        try {
            const response = await fetch(`${this.config.pagesPath}/${pageId}/${pageId}.css`, {
                cache: this.config.cachePages ? 'default' : 'no-cache'
            });

            if (!response.ok) {
                if (response.status === 404) {
                    console.log(`🎨 CSS файл не найден для страницы: ${pageId}`);
                    return null;
                }
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const css = await response.text();

            if (this.config.cachePages) {
                this.cache.css.set(pageId, css);
            }

            return css;
        } catch (error) {
            console.warn(`⚠️ Не удалось загрузить CSS для ${pageId}:`, error.message);
            return null;
        }
    }

    /**
     * Загрузка JS файла страницы
     */
    async loadPageJS(pageId) {
        if (this.config.cachePages && this.cache.js.has(pageId)) {
            return this.cache.js.get(pageId);
        }

        try {
            const response = await fetch(`${this.config.pagesPath}/${pageId}/${pageId}.js`, {
                cache: this.config.cachePages ? 'default' : 'no-cache'
            });

            if (!response.ok) {
                if (response.status === 404) {
                    console.log(`⚙️ JS файл не найден для страницы: ${pageId}`);
                    return null;
                }
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const js = await response.text();

            if (this.config.cachePages) {
                this.cache.js.set(pageId, js);
            }

            return js;
        } catch (error) {
            console.warn(`⚠️ Не удалось загрузить JS для ${pageId}:`, error.message);
            return null;
        }
    }

    /**
     * Применение стилей страницы
     */
    async applyPageStyles(pageId, css) {
        if (this.loadedStyles.has(pageId)) {
            return; // Стили уже загружены
        }

        const styleElement = document.createElement('style');
        styleElement.id = `page-style-${pageId}`;
        styleElement.textContent = css;

        this.elements.styleContainer.appendChild(styleElement);
        this.loadedStyles.add(pageId);

        console.log(`🎨 Стили применены для страницы: ${pageId}`);
    }

    /**
     * Рендеринг HTML страницы
     */
    async renderPageHTML(pageId, html, skipTransition = false) {
        if (!this.elements.content) {
            throw new Error('Контейнер контента не найден');
        }

        if (this.config.enableTransitions && !skipTransition) {
            this.elements.content.style.opacity = '0';

            setTimeout(() => {
                this.elements.content.innerHTML = html;
                this.elements.content.style.opacity = '1';
            }, this.config.transitionDuration / 2);
        } else {
            this.elements.content.innerHTML = html;
        }

        console.log(`📄 HTML отрендерен для страницы: ${pageId}`);
    }

    /**
     * Выполнение JavaScript страницы
     */
    async executePageScript(pageId, js) {
        try {
            // Создаем контекст выполнения с доступом к pageManager
            const context = {
                pageId,
                pageManager: this,
                enhancedPageManager: this
            };

            // Выполняем скрипт в контексте
            const func = new Function('context', 'pageId', 'pageManager', 'enhancedPageManager', js);
            await func(context, pageId, this, this);

            console.log(`⚙️ JavaScript выполнен для страницы: ${pageId}`);
        } catch (error) {
            console.error(`❌ Ошибка выполнения JS для страницы ${pageId}:`, error);
            throw error;
        }
    }

    /**
     * Очистка ресурсов страницы
     */
    async cleanupPage(pageId) {
        try {
            // Удаляем стили страницы
            if (this.loadedStyles.has(pageId)) {
                const styleElement = document.getElementById(`page-style-${pageId}`);
                if (styleElement) {
                    styleElement.remove();
                }
                this.loadedStyles.delete(pageId);
            }

            // Вызываем cleanup хук страницы
            const pageConfig = this.getPageConfig(pageId);
            if (pageConfig && typeof pageConfig.cleanup === 'function') {
                try {
                    await pageConfig.cleanup();
                    this.emit('pageCleanup', { pageId });
                } catch (error) {
                    console.warn(`⚠️ Ошибка cleanup страницы ${pageId}:`, error);
                }
            }

            console.log(`🧹 Страница ${pageId} очищена`);
        } catch (error) {
            console.error(`❌ Ошибка очистки страницы ${pageId}:`, error);
        }
    }

    /**
     * Обновление истории браузера
     */
    updateBrowserHistory(pageId) {
        const pageConfig = this.getPageConfig(pageId);
        const title = pageConfig?.title || pageId;

        try {
            window.history.pushState(
                { pageId, timestamp: Date.now() },
                title,
                `#${pageId}`
            );
            document.title = `${title} | IP Roast Platform`;
        } catch (error) {
            console.warn('⚠️ Не удалось обновить историю браузера:', error);
        }
    }

    /**
     * Показать состояние загрузки
     */
    showLoadingState() {
        if (this.elements.loading) {
            this.elements.loading.classList.remove('hidden');
        }
    }

    /**
     * Скрыть состояние загрузки
     */
    hideLoadingState() {
        if (this.elements.loading) {
            setTimeout(() => {
                this.elements.loading.classList.add('hidden');
            }, 100);
        }
    }

    /**
     * Показать состояние ошибки
     */
    showErrorState(pageId, error) {
        const errorHtml = `
            <div class="page-error">
                <h3>❌ Ошибка загрузки страницы</h3>
                <p><strong>Страница:</strong> ${pageId}</p>
                <p><strong>Ошибка:</strong> ${error.message}</p>
                <p><strong>Время:</strong> ${new Date().toLocaleString()}</p>
                <button onclick="window.enhancedPageManager.loadPage('${pageId}', {force: true})" 
                        class="btn btn-primary">
                    🔄 Повторить попытку
                </button>
            </div>
        `;

        if (this.elements.content) {
            this.elements.content.innerHTML = errorHtml;
        }

        this.hideLoadingState();
    }

    /**
     * Получить информацию о текущем состоянии
     */
    getState() {
        return {
            currentPageId: this.currentPageId,
            previousPageId: this.previousPageId,
            registeredPages: Array.from(this.registeredPages.keys()),
            loadingQueue: Array.from(this.loadingQueue),
            loadedStyles: Array.from(this.loadedStyles),
            cacheSize: {
                html: this.cache.html.size,
                css: this.cache.css.size,
                js: this.cache.js.size
            }
        };
    }

    /**
     * Очистка кэша
     */
    clearCache() {
        this.cache.html.clear();
        this.cache.css.clear();
        this.cache.js.clear();
        this.cache.modules.clear();
        console.log('🧹 Кэш Enhanced PageManager очищен');
    }

    /**
     * Уничтожение менеджера
     */
    async destroy() {
        try {
            // Очищаем текущую страницу
            if (this.currentPageId) {
                await this.cleanupPage(this.currentPageId);
            }

            // Очищаем все зарегистрированные страницы
            for (const [pageId, config] of this.registeredPages) {
                if (typeof config.cleanup === 'function') {
                    try {
                        await config.cleanup();
                    } catch (error) {
                        console.warn(`⚠️ Ошибка cleanup при уничтожении ${pageId}:`, error);
                    }
                }
            }

            // Очищаем кэш и состояние
            this.clearCache();
            this.registeredPages.clear();
            this.pageInstances.clear();
            this.loadingQueue.clear();
            this.loadedStyles.clear();

            // Удаляем элементы
            if (this.elements.loading) {
                this.elements.loading.remove();
            }

            console.log('🗑️ Enhanced PageManager уничтожен');
        } catch (error) {
            console.error('❌ Ошибка при уничтожении Enhanced PageManager:', error);
        }
    }
}

// Глобальный экспорт
window.EnhancedPageManager = EnhancedPageManager;

// Автоматическая инициализация
document.addEventListener('DOMContentLoaded', () => {
    if (!window.enhancedPageManager) {
        console.log('🚀 Автоинициализация Enhanced PageManager...');
        setTimeout(async () => {
            try {
                window.enhancedPageManager = new EnhancedPageManager();
                await window.enhancedPageManager.init();
                console.log('✅ Enhanced PageManager автоматически инициализирован');
            } catch (error) {
                console.error('❌ Ошибка автоинициализации Enhanced PageManager:', error);
            }
        }, 100);
    }
});

console.log('✅ Enhanced PageManager v3.1-Fixed модуль загружен');
