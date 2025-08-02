/**
 * PageLoader.js - Загрузчик страниц для системы "монитора"
 * Управляет динамической загрузкой HTML страниц в контейнер
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
            pagesPath: '../pages',
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
        console.log('📄 PageLoader инициализирован');
    }

    /**
     * Поиск DOM элементов
     */
    findElements() {
        this.elements.container = document.getElementById('page-container');
        this.elements.content = document.getElementById('page-content');
        this.elements.loading = document.getElementById('page-loading');

        if (!this.elements.container || !this.elements.content) {
            throw new Error('PageLoader: необходимые элементы не найдены');
        }
    }

    /**
     * Настройка обработчиков событий
     */
    setupEventListeners() {
        // Обработка навигации по истории браузера
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.page) {
                this.loadPage(e.state.page, false);
            }
        });

        // Обработка кликов по ссылкам
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href^="#"]');
            if (link) {
                e.preventDefault();
                const pageId = link.getAttribute('href').substr(1);
                if (pageId && this.isValidPageId(pageId)) {
                    this.loadPage(pageId);
                }
            }
        });
    }

    /**
     * Основной метод загрузки страницы
     */
    async loadPage(pageId, updateHistory = true) {
        if (!pageId || !this.isValidPageId(pageId)) {
            throw new Error(`Недопустимый ID страницы: ${pageId}`);
        }

        // Предотвращаем повторную загрузку той же страницы
        if (this.currentPage === pageId && !this.loadingQueue.has(pageId)) {
            return;
        }

        // Предотвращаем одновременную загрузку той же страницы
        if (this.loadingQueue.has(pageId)) {
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

            console.log(`✅ Страница успешно загружена: ${pageId}`);

        } catch (error) {
            console.error(`❌ Ошибка загрузки страницы ${pageId}:`, error);

            // Показываем страницу ошибки
            this.showErrorPage(error, pageId);

            // Эмитируем событие ошибки
            this.emit('pageError', {
                id: pageId,
                error: error
            });

        } finally {
            this.loadingQueue.delete(pageId);
        }
    }

    /**
     * Загрузка HTML файла страницы
     */
    async fetchPage(pageId) {
        const pageUrl = `${this.config.pagesPath}/${pageId}/index.html`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
            controller.abort();
        }, this.config.loadTimeout);

        try {
            console.log(`🌐 Загрузка HTML: ${pageUrl}`);

            const response = await fetch(pageUrl, {
                signal: controller.signal,
                method: 'GET',
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

            // Парсим HTML и извлекаем metadata
            const pageData = this.parsePageHTML(html, pageId);

            // Загружаем связанные ресурсы (CSS, JS)
            await this.loadPageResources(pageId);

            return pageData;

        } catch (error) {
            clearTimeout(timeoutId);

            if (error.name === 'AbortError') {
                throw new Error(`Таймаут загрузки страницы: ${pageId}`);
            }

            throw error;
        }
    }

    /**
     * Парсинг HTML страницы
     */
    parsePageHTML(html, pageId) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // Извлекаем основной контент
        const mainContent = doc.querySelector('main') || doc.body;
        const content = mainContent ? mainContent.innerHTML : html;

        // Извлекаем метаданные
        const titleElement = doc.querySelector('title');
        const title = titleElement ? titleElement.textContent : this.getDefaultPageTitle(pageId);

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
     * Загрузка связанных ресурсов страницы (CSS, JS)
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
     * Загрузка CSS файла
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
     * Загрузка JS файла
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
     * Установка контента страницы
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
        this.elements.content.scrollTop = 0;
    }

    /**
     * Инициализация скриптов на странице
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
     * Инициализация компонентов на странице
     */
    initializePageComponents() {
        // Здесь можно инициализировать общие компоненты
        // Например, tooltips, modals, формы и т.д.

        const interactiveElements = this.elements.content.querySelectorAll('[data-component]');
        interactiveElements.forEach(element => {
            const componentType = element.dataset.component;
            // Инициализация компонента по типу
            console.log(`🔧 Инициализация компонента: ${componentType}`);
        });
    }

    /**
     * Показ индикатора загрузки
     */
    showLoading() {
        if (this.elements.loading) {
            this.elements.loading.classList.add('active');
        }
    }

    /**
     * Скрытие индикатора загрузки
     */
    hideLoading() {
        if (this.elements.loading) {
            this.elements.loading.classList.remove('active');
        }
    }

    /**
     * Показ страницы ошибки
     */
    showErrorPage(error, pageId) {
        const errorHTML = `
      <div class="page-error">
        <div class="error-icon">❌</div>
        <h2 class="error-title">Ошибка загрузки страницы</h2>
        <p class="error-message">Не удалось загрузить страницу "${this.getDefaultPageTitle(pageId)}"</p>
        <p class="error-detail">${error.message}</p>
        <div class="error-actions">
          <button class="error-btn" onclick="window.app?.components?.pageLoader?.reloadCurrentPage()">
            Попробовать снова
          </button>
          <button class="error-btn secondary" onclick="window.app?.navigateToPage('dashboard')">
            На главную
          </button>
        </div>
      </div>
    `;

        this.elements.content.innerHTML = errorHTML;
        this.hideLoading();
    }

    /**
     * Обновление истории браузера
     */
    updateBrowserHistory(pageId, title) {
        const url = `#${pageId}`;
        const state = { page: pageId };

        if (window.history && window.history.pushState) {
            window.history.pushState(state, title, url);
            document.title = `${title} - IP Roast Enterprise`;
        }
    }

    /**
     * Получение заголовка страницы по умолчанию
     */
    getDefaultPageTitle(pageId) {
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
     * Проверка валидности ID страницы
     */
    isValidPageId(pageId) {
        const validPages = ['dashboard', 'scanner', 'attack-constructor', 'network-topology', 'reports', 'settings'];
        return validPages.includes(pageId);
    }

    /**
     * Перезагрузка текущей страницы
     */
    async reloadCurrentPage() {
        if (!this.currentPage) return;

        console.log(`🔄 Перезагрузка страницы: ${this.currentPage}`);

        // Очищаем кэш для текущей страницы
        this.pageCache.delete(this.currentPage);

        // Загружаем заново
        await this.loadPage(this.currentPage, false);
    }

    /**
     * Очистка кэша страниц
     */
    clearCache() {
        this.pageCache.clear();
        console.log('🗑️ Кэш страниц очищен');
    }

    /**
     * Предзагрузка страницы
     */
    async preloadPage(pageId) {
        if (!this.isValidPageId(pageId) || this.pageCache.has(pageId)) {
            return;
        }

        try {
            console.log(`📄 Предзагрузка страницы: ${pageId}`);
            const pageData = await this.fetchPage(pageId);
            this.pageCache.set(pageId, pageData);
        } catch (error) {
            console.warn(`⚠️ Ошибка предзагрузки страницы ${pageId}:`, error);
        }
    }

    /**
     * Утилита для задержки
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Система событий
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
     * Получение информации о загрузчике
     */
    getInfo() {
        return {
            currentPage: this.currentPage,
            cachedPages: Array.from(this.pageCache.keys()),
            loadingQueue: Array.from(this.loadingQueue),
            config: this.config
        };
    }

    /**
     * Уничтожение загрузчика
     */
    destroy() {
        // Удаляем обработчики событий
        window.removeEventListener('popstate', this.handlePopState);
        document.removeEventListener('click', this.handleLinkClick);

        // Очищаем кэш
        this.clearCache();

        // Удаляем загруженные стили страниц
        document.querySelectorAll('link[data-page]').forEach(link => {
            link.remove();
        });

        // Удаляем загруженные скрипты страниц
        document.querySelectorAll('script[data-page]').forEach(script => {
            script.remove();
        });

        // Очищаем слушатели событий
        this.eventListeners.clear();

        console.log('🗑️ PageLoader уничтожен');
    }
}

// Экспорт
window.PageLoader = PageLoader;

// Автоинициализация
document.addEventListener('DOMContentLoaded', () => {
    if (!window.pageLoader) {
        window.pageLoader = new PageLoader();
    }
});