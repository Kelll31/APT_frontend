/**
 * PageManager - Управление загрузкой и отображением страниц в SPA
 */
class PageManager extends ComponentBase {
    constructor() {
        super('PageManager');
        
        this.cache = new Map();
        this.loadingQueue = new Set();
        this.currentPageId = null;
        this.previousPageId = null;
        
        this.config = {
            pagesPath: './pages',
            cachePages: true,
            loadTimeout: 10000,
            enableTransitions: true,
            transitionDuration: 300
        };
        
        this.elements = {
            container: null,
            content: null,
            loading: null
        };
        
        console.log('📄 PageManager создан');
    }

    /**
     * Инициализация менеджера страниц
     */
    async doInit() {
        this.findPageElements();
        this.setupPageContainer();
        this.setupEventListeners();
        
        console.log('✅ PageManager инициализирован');
    }

    /**
     * Поиск элементов для отображения страниц
     */
    findPageElements() {
        // Ищем контейнер для страниц
        this.elements.container = document.querySelector('#page-container') || 
                                 document.querySelector('.page-container') ||
                                 document.querySelector('.main-content .page-container');
        
        // Если основной контейнер не найден, создаем его
        if (!this.elements.container) {
            const mainContent = document.querySelector('.main-content');
            if (mainContent) {
                this.elements.container = document.createElement('div');
                this.elements.container.id = 'page-container';
                this.elements.container.className = 'page-container';
                mainContent.appendChild(this.elements.container);
                console.log('📄 Создан page-container');
            } else {
                throw new Error('Не найден .main-content для создания page-container');
            }
        }

        // Ищем контейнер для контента страницы
        this.elements.content = this.elements.container.querySelector('#page-content') ||
                               this.elements.container.querySelector('.page-content');
        
        if (!this.elements.content) {
            this.elements.content = document.createElement('div');
            this.elements.content.id = 'page-content';
            this.elements.content.className = 'page-content';
            this.elements.container.appendChild(this.elements.content);
            console.log('📄 Создан page-content');
        }

        // Создаем индикатор загрузки
        this.createLoadingIndicator();
        
        console.log('🔍 Элементы страниц найдены/созданы');
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
            </div>
            <div class="loading-text">Загрузка страницы...</div>
        `;
        
        this.elements.container.appendChild(this.elements.loading);
    }

    /**
     * Настройка контейнера страниц
     */
    setupPageContainer() {
        if (!this.elements.container) return;

        // Добавляем CSS классы для анимаций
        this.elements.container.classList.add('spa-page-container');
        
        if (this.config.enableTransitions) {
            this.elements.container.style.transition = `opacity ${this.config.transitionDuration}ms ease-in-out`;
        }

        // Добавляем стили
        this.injectPageStyles();
    }

    /**
     * Внедрение необходимых стилей
     */
    injectPageStyles() {
        const styleId = 'page-manager-styles';
        if (document.getElementById(styleId)) return;

        const styles = `
            <style id="${styleId}">
                .spa-page-container {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    min-height: 400px;
                }
                
                .page-content {
                    width: 100%;
                    height: 100%;
                    opacity: 1;
                    transform: translateY(0);
                    transition: opacity 300ms ease-in-out, transform 300ms ease-in-out;
                }
                
                .page-content.page-entering {
                    opacity: 0;
                    transform: translateY(20px);
                }
                
                .page-content.page-exiting {
                    opacity: 0;
                    transform: translateY(-20px);
                }
                
                .page-loading {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 16px;
                    z-index: 10;
                }
                
                .page-loading.hidden {
                    display: none;
                }
                
                .loading-spinner {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .spinner {
                    width: 32px;
                    height: 32px;
                    border: 3px solid var(--color-border, #e0e0e0);
                    border-top: 3px solid var(--color-primary, #218a8d);
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                .loading-text {
                    font-size: 14px;
                    color: var(--color-text-secondary, #666);
                }
                
                .page-error {
                    padding: 32px;
                    text-align: center;
                    background: var(--color-surface, #fff);
                    border: 1px solid var(--color-border, #e0e0e0);
                    border-radius: 8px;
                    margin: 20px;
                }
                
                .page-error h2 {
                    color: var(--color-error, #d32f2f);
                    margin-bottom: 16px;
                }
                
                .page-error p {
                    color: var(--color-text-secondary, #666);
                    margin-bottom: 8px;
                }
            </style>
        `;

        document.head.insertAdjacentHTML('beforeend', styles);
    }

    /**
     * Настройка обработчиков событий
     */
    setupEventListeners() {
        // Обработка кликов по ссылкам с data-page
        this.addEventListener(document, 'click', (event) => {
            const pageLink = event.target.closest('[data-page]');
            if (pageLink) {
                event.preventDefault();
                const pageId = pageLink.dataset.page;
                this.loadPage(pageId);
            }
        });

        console.log('⚡ Обработчики PageManager настроены');
    }

    /**
     * Загрузка страницы
     */
    async loadPage(pageId, options = {}) {
        if (!pageId) {
            console.error('❌ PageId не указан');
            return false;
        }

        if (this.loadingQueue.has(pageId)) {
            console.log(`⏳ Страница ${pageId} уже загружается`);
            return false;
        }

        if (pageId === this.currentPageId && !options.force) {
            console.log(`📍 Уже на странице: ${pageId}`);
            return true;
        }

        console.log(`📄 Загрузка страницы: ${pageId}`);

        this.loadingQueue.add(pageId);
        this.showLoadingIndicator();

        try {
            // Получаем HTML страницы
            const pageHTML = await this.fetchPageHTML(pageId);
            
            // Применяем переход между страницами
            if (this.config.enableTransitions) {
                await this.performPageTransition(pageHTML, pageId);
            } else {
                this.renderPage(pageHTML, pageId);
            }

            this.previousPageId = this.currentPageId;
            this.currentPageId = pageId;

            // Инициализируем скрипты на странице
            await this.initializePageScripts(pageId);

            // Эмитируем событие успешной загрузки
            this.emit('pageLoaded', {
                pageId,
                previousPageId: this.previousPageId,
                html: pageHTML,
                timestamp: Date.now()
            });

            console.log(`✅ Страница ${pageId} загружена успешно`);
            return true;

        } catch (error) {
            console.error(`❌ Ошибка загрузки страницы ${pageId}:`, error);
            
            this.showPageError(pageId, error);
            
            this.emit('pageError', {
                pageId,
                error,
                timestamp: Date.now()
            });

            return false;

        } finally {
            this.loadingQueue.delete(pageId);
            this.hideLoadingIndicator();
        }
    }

    /**
     * Получение HTML страницы
     */
    async fetchPageHTML(pageId) {
        // Проверяем кэш
        if (this.config.cachePages && this.cache.has(pageId)) {
            console.log(`📦 Страница ${pageId} загружена из кэша`);
            return this.cache.get(pageId);
        }

        // Загружаем с сервера
        const pageURL = `${this.config.pagesPath}/${pageId}.html`;
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.loadTimeout);

        try {
            const response = await fetch(pageURL, {
                signal: controller.signal,
                headers: {
                    'Accept': 'text/html',
                    'Cache-Control': 'no-cache'
                }
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const html = await response.text();

            // Сохраняем в кэш
            if (this.config.cachePages) {
                this.cache.set(pageId, html);
            }

            console.log(`🌐 Страница ${pageId} загружена с сервера`);
            return html;

        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error(`Тайм-аут загрузки страницы ${pageId}`);
            }
            throw error;
        }
    }

    /**
     * Выполнение перехода между страницами с анимацией
     */
    async performPageTransition(newHTML, pageId) {
        const content = this.elements.content;
        
        if (!content) {
            this.renderPage(newHTML, pageId);
            return;
        }

        // Фаза выхода текущей страницы
        if (this.currentPageId) {
            content.classList.add('page-exiting');
            
            await new Promise(resolve => 
                setTimeout(resolve, this.config.transitionDuration / 2)
            );
        }

        // Рендерим новую страницу
        this.renderPage(newHTML, pageId);

        // Фаза входа новой страницы
        content.classList.remove('page-exiting');
        content.classList.add('page-entering');

        // Запускаем анимацию входа
        requestAnimationFrame(() => {
            content.classList.remove('page-entering');
        });
    }

    /**
     * Отображение страницы
     */
    renderPage(html, pageId) {
        if (!this.elements.content) {
            console.error('❌ Контейнер для контента не найден');
            return;
        }

        this.elements.content.innerHTML = html;
        this.elements.content.setAttribute('data-page', pageId);

        // Прокручиваем к началу страницы
        if (this.elements.container) {
            this.elements.container.scrollTop = 0;
        }
    }

    /**
     * Инициализация скриптов на странице
     */
    async initializePageScripts(pageId) {
        // Выполняем inline скрипты в загруженном контенте
        const scripts = this.elements.content.querySelectorAll('script');
        
        for (const script of scripts) {
            if (script.src) {
                // Внешний скрипт
                await this.loadExternalScript(script.src);
            } else if (script.textContent.trim()) {
                // Inline скрипт
                try {
                    new Function(script.textContent)();
                } catch (error) {
                    console.warn(`⚠️ Ошибка выполнения inline скрипта на странице ${pageId}:`, error);
                }
            }
        }

        // Ищем функцию инициализации страницы
        const initFunctionName = `init${pageId.charAt(0).toUpperCase() + pageId.slice(1)}Page`;
        if (typeof window[initFunctionName] === 'function') {
            try {
                await window[initFunctionName](this.elements.content);
                console.log(`✅ Выполнена инициализация ${initFunctionName}`);
            } catch (error) {
                console.warn(`⚠️ Ошибка инициализации ${initFunctionName}:`, error);
            }
        }

        // Эмитируем событие готовности скриптов страницы
        this.emit('pageScriptsReady', { pageId });
    }

    /**
     * Загрузка внешнего скрипта
     */
    loadExternalScript(src) {
        return new Promise((resolve, reject) => {
            // Проверяем, не загружен ли уже скрипт
            if (document.querySelector(`script[src="${src}"]`)) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = () => reject(new Error(`Не удалось загрузить скрипт: ${src}`));
            
            document.head.appendChild(script);
        });
    }

    /**
     * Показ индикатора загрузки
     */
    showLoadingIndicator() {
        if (this.elements.loading) {
            this.elements.loading.classList.remove('hidden');
        }
    }

    /**
     * Скрытие индикатора загрузки
     */
    hideLoadingIndicator() {
        if (this.elements.loading) {
            this.elements.loading.classList.add('hidden');
        }
    }

    /**
     * Показ ошибки загрузки страницы
     */
    showPageError(pageId, error) {
        const errorHTML = `
            <div class="page-error">
                <h2>⚠️ Ошибка загрузки страницы</h2>
                <p><strong>Страница:</strong> ${pageId}</p>
                <p><strong>Ошибка:</strong> ${error.message}</p>
                <p><strong>Время:</strong> ${new Date().toLocaleString()}</p>
                <button onclick="window.app?.pageManager?.loadPage('${pageId}', { force: true })" 
                        class="btn btn--primary">
                    Попробовать снова
                </button>
                <button onclick="window.app?.navigateToPage('dashboard')" 
                        class="btn btn--secondary">
                    Вернуться на главную
                </button>
            </div>
        `;

        this.renderPage(errorHTML, `error-${pageId}`);
    }

    /**
     * Получение текущей страницы
     */
    getCurrentPageId() {
        return this.currentPageId;
    }

    /**
     * Получение предыдущей страницы
     */
    getPreviousPageId() {
        return this.previousPageId;
    }

    /**
     * Проверка, загружается ли страница
     */
    isPageLoading(pageId) {
        return this.loadingQueue.has(pageId);
    }

    /**
     * Проверка, есть ли страница в кэше
     */
    isPageCached(pageId) {
        return this.cache.has(pageId);
    }

    /**
     * Очистка кэша
     */
    clearCache() {
        this.cache.clear();
        console.log('🗑️ Кэш страниц очищен');
    }

    /**
     * Очистка кэша конкретной страницы
     */
    clearPageCache(pageId) {
        if (this.cache.has(pageId)) {
            this.cache.delete(pageId);
            console.log(`🗑️ Кэш страницы ${pageId} очищен`);
            return true;
        }
        return false;
    }

    /**
     * Получение статистики кэша
     */
    getCacheStats() {
        return {
            size: this.cache.size,
            pages: Array.from(this.cache.keys()),
            loadingQueue: Array.from(this.loadingQueue),
            currentPage: this.currentPageId,
            previousPage: this.previousPageId
        };
    }

    /**
     * Предзагрузка страницы
     */
    async preloadPage(pageId) {
        if (this.cache.has(pageId) || this.loadingQueue.has(pageId)) {
            return;
        }

        try {
            console.log(`📦 Предзагрузка страницы: ${pageId}`);
            await this.fetchPageHTML(pageId);
            console.log(`✅ Страница ${pageId} предзагружена`);
        } catch (error) {
            console.warn(`⚠️ Ошибка предзагрузки страницы ${pageId}:`, error);
        }
    }

    /**
     * Предзагрузка нескольких страниц
     */
    async preloadPages(pageIds) {
        const promises = pageIds.map(pageId => this.preloadPage(pageId));
        await Promise.allSettled(promises);
    }

    /**
     * Перезагрузка текущей страницы
     */
    async reloadCurrentPage() {
        if (!this.currentPageId) {
            console.warn('⚠️ Нет текущей страницы для перезагрузки');
            return false;
        }

        // Очищаем кэш текущей страницы
        this.clearPageCache(this.currentPageId);
        
        // Перезагружаем страницу
        return await this.loadPage(this.currentPageId, { force: true });
    }

    /**
     * Получение информации о странице
     */
    getPageInfo() {
        return {
            current: this.currentPageId,
            previous: this.previousPageId,
            loading: Array.from(this.loadingQueue),
            cached: Array.from(this.cache.keys()),
            config: this.config
        };
    }

    /**
     * Уничтожение менеджера страниц
     */
    async doDestroy() {
        // Очищаем кэш
        this.clearCache();
        
        // Очищаем очереди
        this.loadingQueue.clear();
        
        // Сбрасываем состояние
        this.currentPageId = null;
        this.previousPageId = null;
        
        console.log('🗑️ PageManager уничтожен');
    }
}

// Экспорт в глобальную область
window.PageManager = PageManager;

console.log('📄 PageManager загружен');