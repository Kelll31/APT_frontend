(function () {
    'use strict';

    // Проверяем, не был ли уже загружен PageLoader
    if (typeof window.PageLoader !== 'undefined') {
        console.log('⚠️ PageLoader уже загружен, пропускаем инициализацию');
        return;
    }

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
                pagesPath: '../pages', // Исправлено: убран '../'
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

            console.log('🔍 PageLoader элементы найдены:', {
                container: !!this.elements.container,
                content: !!this.elements.content,
                loading: !!this.elements.loading
            });
        }

        /**
         * Настройка обработчиков событий
         */
        setupEventListeners() {
            // Слушаем события навигации от sidebar
            document.addEventListener('sidebar-navigate', (e) => {
                const pageId = e.detail.page;
                console.log(`📄 Получено событие навигации: ${pageId}`);
                this.loadPage(pageId);
            });

            // Глобальный callback для совместимости
            window.onSidebarNavigate = (pageId) => {
                console.log(`📄 Глобальный callback навигации: ${pageId}`);
                this.loadPage(pageId);
            };

            console.log('⚡ PageLoader событийная система настроена');
        }

        /**
         * Загрузка страницы
         */
        async loadPage(pageId) {
            if (!pageId) {
                console.warn('⚠️ PageLoader: не указан ID страницы');
                return;
            }

            // Проверяем, не загружается ли уже эта страница
            if (this.loadingQueue.has(pageId)) {
                console.log(`⏳ Страница ${pageId} уже загружается`);
                return;
            }

            console.log(`📄 Начинаем загрузку страницы: ${pageId}`);

            try {
                this.loadingQueue.add(pageId);
                this.showLoading();

                // Эмитируем событие начала загрузки
                this.emit('pageLoadStart', { pageId });

                // Загружаем контент страницы
                const pageContent = await this.fetchPageContent(pageId);

                // Обновляем контент
                await this.updatePageContent(pageContent, pageId);

                this.currentPage = pageId;
                this.hideLoading();

                console.log(`✅ Страница ${pageId} успешно загружена`);

                // Эмитируем событие завершения загрузки
                this.emit('pageLoaded', { pageId, content: pageContent });

            } catch (error) {
                console.error(`❌ Ошибка загрузки страницы ${pageId}:`, error);
                this.showError(pageId, error);
                this.emit('pageError', { pageId, error });
            } finally {
                this.loadingQueue.delete(pageId);
            }
        }

        /**
         * Получение содержимого страницы
         */
        async fetchPageContent(pageId) {
            const pagePath = `${this.config.pagesPath}/${pageId}/${pageId}.html`;

            // Проверяем кэш
            if (this.config.cachePages && this.pageCache.has(pageId)) {
                console.log(`📦 Страница ${pageId} загружена из кэша`);
                return this.pageCache.get(pageId);
            }

            // Загружаем с сервера
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.config.loadTimeout);

            try {
                const response = await fetch(pagePath, {
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

                const content = await response.text();

                // Кэшируем результат
                if (this.config.cachePages) {
                    this.pageCache.set(pageId, content);
                }

                console.log(`🌐 Страница ${pageId} загружена с сервера`);
                return content;

            } catch (error) {
                clearTimeout(timeoutId);

                if (error.name === 'AbortError') {
                    throw new Error(`Время ожидания загрузки страницы ${pageId} истекло`);
                }

                throw error;
            }
        }

        /**
         * Обновление содержимого страницы
         */
        async updatePageContent(content, pageId) {
            if (!this.elements.content) {
                throw new Error('Контейнер для содержимого страницы не найден');
            }

            // Применяем переходы если включены
            if (this.config.enableTransitions) {
                this.elements.content.style.opacity = '0';

                setTimeout(() => {
                    this.elements.content.innerHTML = content;
                    this.elements.content.style.opacity = '1';

                    // Инициализируем скрипты на странице
                    this.initializePageScripts(pageId);
                }, 150);
            } else {
                this.elements.content.innerHTML = content;
                this.initializePageScripts(pageId);
            }
        }

        /**
         * Инициализация скриптов на загруженной странице
         */
        initializePageScripts(pageId) {
            if (!this.elements.content) return;

            // Выполняем встроенные скрипты
            const scripts = this.elements.content.querySelectorAll('script');
            scripts.forEach(script => {
                if (script.textContent.trim()) {
                    try {
                        new Function(script.textContent)();
                    } catch (error) {
                        console.warn(`⚠️ Ошибка выполнения скрипта на странице ${pageId}:`, error);
                    }
                }
            });

            // Ищем и выполняем page-specific функции инициализации
            const initFunctionName = `init${pageId.charAt(0).toUpperCase() + pageId.slice(1)}Page`;
            if (typeof window[initFunctionName] === 'function') {
                try {
                    window[initFunctionName]();
                    console.log(`✅ Выполнена функция инициализации: ${initFunctionName}`);
                } catch (error) {
                    console.warn(`⚠️ Ошибка инициализации страницы ${pageId}:`, error);
                }
            }
        }

        /**
         * Показать индикатор загрузки
         */
        showLoading() {
            if (this.elements.loading) {
                this.elements.loading.classList.add('active');
                this.elements.loading.style.display = 'flex';
            }

            if (this.elements.content) {
                this.elements.content.style.display = 'none';
            }
        }

        /**
         * Скрыть индикатор загрузки
         */
        hideLoading() {
            if (this.elements.loading) {
                this.elements.loading.classList.remove('active');
                this.elements.loading.style.display = 'none';
            }

            if (this.elements.content) {
                this.elements.content.style.display = 'block';
            }
        }

        /**
         * Показать ошибку загрузки
         */
        showError(pageId, error) {
            const errorHtml = `
                <div class="page-error">
                    <div class="error-icon">❌</div>
                    <h2 class="error-title">Ошибка загрузки страницы</h2>
                    <p class="error-message">
                        Не удалось загрузить содержимое страницы "${this.getPageTitle(pageId)}".
                    </p>
                    <div class="error-details">
                        <p><strong>ID страницы:</strong> <code>${pageId}</code></p>
                        <p><strong>Ошибка:</strong> ${error.message}</p>
                        <p><strong>Время:</strong> ${new Date().toLocaleString()}</p>
                    </div>
                    <div class="error-actions">
                        <button class="error-btn" onclick="window.pageLoader?.loadPage('${pageId}')">
                            Попробовать снова
                        </button>
                        <button class="error-btn secondary" onclick="window.pageLoader?.loadPage('dashboard')">
                            На главную
                        </button>
                    </div>
                </div>
            `;

            if (this.elements.content) {
                this.elements.content.innerHTML = errorHtml;
                this.elements.content.style.display = 'block';
            }

            this.hideLoading();
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
         * Очистка кэша
         */
        clearCache(pageId = null) {
            if (pageId) {
                this.pageCache.delete(pageId);
                console.log(`🗑️ Кэш страницы ${pageId} очищен`);
            } else {
                this.pageCache.clear();
                console.log('🗑️ Весь кэш страниц очищен');
            }
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
         * Получение статистики
         */
        getStats() {
            return {
                currentPage: this.currentPage,
                cachedPages: Array.from(this.pageCache.keys()),
                loadingPages: Array.from(this.loadingQueue),
                cacheSize: this.pageCache.size
            };
        }

        /**
         * Уничтожение загрузчика
         */
        destroy() {
            this.clearCache();
            this.loadingQueue.clear();
            this.eventListeners.clear();

            // Удаляем глобальный callback
            if (window.onSidebarNavigate) {
                delete window.onSidebarNavigate;
            }

            console.log('🗑️ PageLoader уничтожен');
        }
    }

    // Экспорт
    window.PageLoader = PageLoader;
    console.log('📄 PageLoader модуль загружен (исправленная версия)');

})();