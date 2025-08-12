/**
 * Enhanced PageManager - Улучшенная система загрузки страниц
 * Поддерживает загрузку HTML, CSS и JS из папки pages/
 * Version: 3.0.0
 */
class EnhancedPageManager extends ComponentBase {
    constructor() {
        super('EnhancedPageManager');

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

        console.log('📄 Enhanced PageManager v3.0 создан');
    }

    /**
     * Инициализация менеджера страниц
     */
    async doInit() {
        this.findPageElements();
        this.setupStyleContainer();
        this.setupEventListeners();
        console.log('✅ Enhanced PageManager инициализирован');
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
            <div class="loading-content">
                <div class="loading-spinner">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-dasharray="31.416" stroke-dashoffset="31.416">
                            <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
                            <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite"/>
                        </circle>
                    </svg>
                </div>
                <p class="loading-text">Загрузка страницы...</p>
            </div>
        `;
        this.elements.container.appendChild(this.elements.loading);
    }

    /**
     * Настройка обработчиков событий
     */
    setupEventListeners() {
        // Слушаем события навигации от SPANavigator
        document.addEventListener('navigationStart', (e) => {
            this.handleNavigationStart(e.detail);
        });

        // Слушаем завершение навигации
        document.addEventListener('navigationComplete', (e) => {
            this.handleNavigationComplete(e.detail);
        });
    }

    /**
     * Загрузка страницы
     */
    async loadPage(pageId, options = {}) {
        const {
            skipTransition = false,
            force = false
        } = options;

        // Проверяем, не загружается ли уже эта страница
        if (this.loadingQueue.has(pageId) && !force) {
            console.log(`⏳ Страница "${pageId}" уже загружается`);
            return false;
        }

        // Проверяем, не та же ли это страница
        if (pageId === this.currentPageId && !force) {
            console.log(`📍 Страница "${pageId}" уже загружена`);
            return true;
        }

        console.log(`🚀 Загрузка страницы: "${pageId}"`);

        this.loadingQueue.add(pageId);

        try {
            // Показываем индикатор загрузки
            if (!skipTransition) {
                this.showLoadingState();
            }

            // Очищаем предыдущую страницу если нужно
            if (this.config.cleanupOnNavigation && this.currentPageId) {
                await this.cleanupPage(this.currentPageId);
            }

            // Загружаем ресурсы страницы параллельно
            const [htmlContent, cssContent, jsContent] = await Promise.all([
                this.loadPageHTML(pageId),
                this.loadPageCSS(pageId),
                this.loadPageJS(pageId)
            ]);

            // Применяем стили первыми
            if (cssContent && this.config.enableStyles) {
                await this.applyPageStyles(pageId, cssContent);
            }

            // Рендерим HTML контент
            if (htmlContent) {
                await this.renderPageHTML(pageId, htmlContent, skipTransition);
            }

            // Загружаем и выполняем скрипты
            if (jsContent && this.config.enableScripts) {
                await this.executePageScript(pageId, jsContent);
            }

            // Обновляем состояние
            this.previousPageId = this.currentPageId;
            this.currentPageId = pageId;

            // Скрываем загрузку
            if (!skipTransition) {
                this.hideLoadingState();
            }

            // Эмитируем событие успешной загрузки
            this.emit('pageLoaded', {
                pageId,
                previousPageId: this.previousPageId,
                hasHTML: !!htmlContent,
                hasCSS: !!cssContent,
                hasJS: !!jsContent
            });

            console.log(`✅ Страница "${pageId}" успешно загружена`);
            return true;

        } catch (error) {
            console.error(`❌ Ошибка загрузки страницы "${pageId}":`, error);
            this.showErrorState(pageId, error);
            this.emit('pageError', { pageId, error });
            return false;
        } finally {
            this.loadingQueue.delete(pageId);
        }
    }

    /**
     * Загрузка HTML содержимого страницы
     */
    async loadPageHTML(pageId) {
        if (this.cache.html.has(pageId) && this.config.cachePages) {
            console.log(`📄 HTML для "${pageId}" загружен из кэша`);
            return this.cache.html.get(pageId);
        }

        try {
            const htmlPath = `${this.config.pagesPath}/${pageId}/${pageId}.html`;
            const response = await fetch(htmlPath, {
                method: 'GET',
                headers: { 'Accept': 'text/html' }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const htmlContent = await response.text();

            if (this.config.cachePages) {
                this.cache.html.set(pageId, htmlContent);
            }

            console.log(`📄 HTML для "${pageId}" загружен`);
            return htmlContent;

        } catch (error) {
            console.warn(`⚠️ Не удалось загрузить HTML для "${pageId}":`, error.message);
            return null;
        }
    }

    /**
     * Загрузка CSS стилей страницы
     */
    async loadPageCSS(pageId) {
        if (this.cache.css.has(pageId) && this.config.cachePages) {
            console.log(`🎨 CSS для "${pageId}" загружен из кэша`);
            return this.cache.css.get(pageId);
        }

        try {
            const cssPath = `${this.config.pagesPath}/${pageId}/${pageId}.css`;
            const response = await fetch(cssPath, {
                method: 'GET',
                headers: { 'Accept': 'text/css' }
            });

            if (!response.ok) {
                // CSS не обязателен, не выбрасываем ошибку
                console.log(`📝 CSS файл для "${pageId}" не найден или пуст`);
                return null;
            }

            const cssContent = await response.text();

            // Проверяем, что CSS не пустой
            if (cssContent.trim().length === 0) {
                console.log(`📝 CSS файл для "${pageId}" пуст`);
                return null;
            }

            if (this.config.cachePages) {
                this.cache.css.set(pageId, cssContent);
            }

            console.log(`🎨 CSS для "${pageId}" загружен`);
            return cssContent;

        } catch (error) {
            console.log(`📝 CSS для "${pageId}" недоступен:`, error.message);
            return null;
        }
    }

    /**
     * Загрузка JavaScript кода страницы
     */
    async loadPageJS(pageId) {
        if (this.cache.js.has(pageId) && this.config.cachePages) {
            console.log(`⚡ JS для "${pageId}" загружен из кэша`);
            return this.cache.js.get(pageId);
        }

        try {
            const jsPath = `${this.config.pagesPath}/${pageId}/${pageId}.js`;
            const response = await fetch(jsPath, {
                method: 'GET',
                headers: { 'Accept': 'application/javascript' }
            });

            if (!response.ok) {
                // JS не обязателен
                console.log(`📝 JS файл для "${pageId}" не найден или пуст`);
                return null;
            }

            const jsContent = await response.text();

            // Проверяем, что JS не пустой
            if (jsContent.trim().length === 0) {
                console.log(`📝 JS файл для "${pageId}" пуст`);
                return null;
            }

            if (this.config.cachePages) {
                this.cache.js.set(pageId, jsContent);
            }

            console.log(`⚡ JS для "${pageId}" загружен`);
            return jsContent;

        } catch (error) {
            console.log(`📝 JS для "${pageId}" недоступен:`, error.message);
            return null;
        }
    }

    /**
     * Применение CSS стилей страницы
     */
    async applyPageStyles(pageId, cssContent) {
        try {
            // Удаляем старые стили этой страницы
            const existingStyle = document.getElementById(`page-style-${pageId}`);
            if (existingStyle) {
                existingStyle.remove();
                this.loadedStyles.delete(pageId);
            }

            // Создаем новый style элемент
            const styleElement = document.createElement('style');
            styleElement.id = `page-style-${pageId}`;
            styleElement.setAttribute('data-page', pageId);
            styleElement.textContent = cssContent;

            this.elements.styleContainer.appendChild(styleElement);
            this.loadedStyles.add(pageId);

            console.log(`🎨 Стили для "${pageId}" применены`);

        } catch (error) {
            console.error(`❌ Ошибка применения стилей для "${pageId}":`, error);
        }
    }

    /**
     * Рендеринг HTML содержимого
     */
    async renderPageHTML(pageId, htmlContent, skipTransition = false) {
        try {
            if (this.config.enableTransitions && !skipTransition) {
                this.elements.content.style.transition = `opacity ${this.config.transitionDuration}ms ease`;
                this.elements.content.style.opacity = '0';

                await new Promise(resolve => setTimeout(resolve, this.config.transitionDuration / 2));
            }

            // Устанавливаем HTML содержимое
            this.elements.content.innerHTML = htmlContent;
            this.elements.content.setAttribute('data-page', pageId);

            if (this.config.enableTransitions && !skipTransition) {
                this.elements.content.style.opacity = '1';

                await new Promise(resolve => setTimeout(resolve, this.config.transitionDuration / 2));
                this.elements.content.style.transition = '';
            }

            console.log(`📄 HTML для "${pageId}" отрендерен`);

        } catch (error) {
            console.error(`❌ Ошибка рендеринга HTML для "${pageId}":`, error);
        }
    }

    /**
     * Выполнение JavaScript кода страницы
     */
    async executePageScript(pageId, jsContent) {
        try {
            // Создаем безопасную среду выполнения
            const scriptContext = {
                pageId,
                pageContainer: this.elements.content,
                pageManager: this,
                console: console
            };

            // Оборачиваем код в функцию для изоляции
            const wrappedCode = `
                (function(pageId, pageContainer, pageManager, console) {
                    'use strict';
                    ${jsContent}
                })(pageId, pageContainer, pageManager, console);
            `;

            // Выполняем код
            const scriptFunction = new Function(
                'pageId', 'pageContainer', 'pageManager', 'console',
                wrappedCode
            );

            await scriptFunction(
                scriptContext.pageId,
                scriptContext.pageContainer,
                scriptContext.pageManager,
                scriptContext.console
            );

            this.loadedScripts.add(pageId);
            console.log(`⚡ Скрипт для "${pageId}" выполнен`);

        } catch (error) {
            console.error(`❌ Ошибка выполнения скрипта для "${pageId}":`, error);
        }
    }

    /**
     * Очистка ресурсов предыдущей страницы
     */
    async cleanupPage(pageId) {
        try {
            // Удаляем стили страницы
            if (this.loadedStyles.has(pageId)) {
                const styleElement = document.getElementById(`page-style-${pageId}`);
                if (styleElement) {
                    styleElement.remove();
                    this.loadedStyles.delete(pageId);
                }
            }

            // Эмитируем событие очистки для скриптов страницы
            this.emit('pageCleanup', { pageId });

            console.log(`🧹 Страница "${pageId}" очищена`);

        } catch (error) {
            console.error(`❌ Ошибка очистки страницы "${pageId}":`, error);
        }
    }

    /**
     * Показ состояния загрузки
     */
    showLoadingState() {
        if (this.elements.loading) {
            this.elements.loading.classList.remove('hidden');
            this.elements.loading.style.display = 'flex';
        }
    }

    /**
     * Скрытие состояния загрузки
     */
    hideLoadingState() {
        if (this.elements.loading) {
            this.elements.loading.classList.add('hidden');
            setTimeout(() => {
                if (this.elements.loading.classList.contains('hidden')) {
                    this.elements.loading.style.display = 'none';
                }
            }, 300);
        }
    }

    /**
     * Показ состояния ошибки
     */
    showErrorState(pageId, error) {
        this.hideLoadingState();

        const errorHTML = `
            <div class="page-error">
                <div class="error-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                        <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
                        <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
                    </svg>
                </div>
                <h3>Ошибка загрузки страницы</h3>
                <p><strong>Страница:</strong> ${pageId}</p>
                <p><strong>Ошибка:</strong> ${error.message}</p>
                <p><strong>Время:</strong> ${new Date().toLocaleString()}</p>
                <button class="btn btn--primary" onclick="pageManager.loadPage('${pageId}', { force: true })">
                    Попробовать снова
                </button>
            </div>
        `;

        this.elements.content.innerHTML = errorHTML;
    }

    /**
     * Обработка начала навигации
     */
    handleNavigationStart(detail) {
        console.log(`🧭 Обработка начала навигации:`, detail);
    }

    /**
     * Обработка завершения навигации  
     */
    handleNavigationComplete(detail) {
        console.log(`🧭 Обработка завершения навигации:`, detail);
    }

    /**
     * Получение текущей страницы
     */
    getCurrentPage() {
        return this.currentPageId;
    }

    /**
     * Получение предыдущей страницы
     */
    getPreviousPage() {
        return this.previousPageId;
    }

    /**
     * Очистка всего кэша
     */
    clearCache() {
        this.cache.html.clear();
        this.cache.css.clear();
        this.cache.js.clear();
        this.cache.modules.clear();
        console.log('🗑️ Кэш PageManager очищен');
    }

    /**
     * Получение статистики кэша
     */
    getCacheStats() {
        return {
            html: this.cache.html.size,
            css: this.cache.css.size,
            js: this.cache.js.size,
            modules: this.cache.modules.size,
            loadedStyles: this.loadedStyles.size,
            loadedScripts: this.loadedScripts.size
        };
    }

    /**
     * Пре-загрузка страницы
     */
    async preloadPage(pageId) {
        if (this.cache.html.has(pageId) && this.cache.css.has(pageId) && this.cache.js.has(pageId)) {
            console.log(`📦 Страница "${pageId}" уже предварительно загружена`);
            return true;
        }

        console.log(`📦 Предварительная загрузка страницы: "${pageId}"`);

        try {
            await Promise.all([
                this.loadPageHTML(pageId),
                this.loadPageCSS(pageId),
                this.loadPageJS(pageId)
            ]);

            console.log(`✅ Страница "${pageId}" предварительно загружена`);
            return true;

        } catch (error) {
            console.error(`❌ Ошибка предварительной загрузки "${pageId}":`, error);
            return false;
        }
    }

    /**
     * Уничтожение менеджера
     */
    async doDestroy() {
        // Очищаем все загруженные стили
        this.loadedStyles.forEach(pageId => {
            const styleElement = document.getElementById(`page-style-${pageId}`);
            if (styleElement) {
                styleElement.remove();
            }
        });

        // Очищаем кэш
        this.clearCache();

        // Очищаем состояние
        this.loadingQueue.clear();
        this.loadedStyles.clear();
        this.loadedScripts.clear();

        console.log('🗑️ Enhanced PageManager уничтожен');
    }
}

// Экспорт в глобальную область
window.EnhancedPageManager = EnhancedPageManager;
console.log('✅ Enhanced PageManager v3.0 загружен');