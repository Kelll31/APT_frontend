/**
 * SPA Router с поддержкой истории браузера и глубоких ссылок
 * Интегрируется с PageManager для загрузки страниц
 */
class SPARouter extends ComponentBase {
    constructor() {
        super('SPARouter');
        
        // Таблица маршрутов
        this.routes = new Map();
        
        // Текущий маршрут
        this.currentRoute = null;
        
        // Конфигурация
        this.config = {
            baseUrl: '',
            hashMode: true, // true = #/page, false = /page
            defaultRoute: 'dashboard',
            scrollToTop: true
        };
        
        // Middleware для обработки маршрутов
        this.middleware = [];
        
        // PageManager
        this.pageManager = null;
    }

    async doInit() {
        console.log('🚀 Инициализация SPARouter');
        
        // Получаем экземпляр PageManager
        this.pageManager = window.pageManager;
        if (!this.pageManager) {
            throw new Error('PageManager не найден. Router требует PageManager.');
        }
        
        // Регистрируем базовые маршруты
        this.registerDefaultRoutes();
        
        // Настраиваем обработчики браузера
        this.setupBrowserHandlers();
        
        // Обрабатываем текущий URL
        await this.handleInitialRoute();
        
        console.log('✅ SPARouter инициализирован');
    }

    /**
     * Регистрация базовых маршрутов
     */
    registerDefaultRoutes() {
        // Основные страницы приложения
        this.addRoute('dashboard', {
            title: 'Панель управления',
            component: 'dashboard',
            requiresAuth: false
        });
        
        this.addRoute('scanner', {
            title: 'Модуль сканирования',
            component: 'scanner',
            requiresAuth: true
        });
        
        this.addRoute('attack-constructor', {
            title: 'Конструктор атак',
            component: 'attack-constructor',
            requiresAuth: true
        });
        
        this.addRoute('network-topology', {
            title: 'Топология сети',
            component: 'network-topology',
            requiresAuth: true
        });
        
        this.addRoute('reports', {
            title: 'Отчеты и аналитика',
            component: 'reports',
            requiresAuth: true
        });
        
        this.addRoute('settings', {
            title: 'Настройки системы',
            component: 'settings',
            requiresAuth: true
        });
        
        console.log(`✅ Зарегистрировано ${this.routes.size} маршрутов`);
    }

    /**
     * Добавление маршрута
     */
    addRoute(path, config) {
        const route = {
            path,
            title: config.title || path,
            component: config.component || path,
            requiresAuth: config.requiresAuth || false,
            middleware: config.middleware || [],
            params: config.params || {},
            meta: config.meta || {}
        };
        
        this.routes.set(path, route);
        console.log(`➕ Добавлен маршрут: ${path}`);
        
        return route;
    }

    /**
     * Настройка обработчиков браузера
     */
    setupBrowserHandlers() {
        // Обработчик кнопок "Назад/Вперед"
        this.addEventListener(window, 'popstate', (event) => {
            console.log('🔙 Браузер: событие popstate');
            this.handlePopState(event);
        });
        
        // Обработчик изменения хеша (если используется hashMode)
        if (this.config.hashMode) {
            this.addEventListener(window, 'hashchange', (event) => {
                console.log('🔗 Браузер: изменение hash');
                this.handleHashChange(event);
            });
        }
        
        // Перехват ссылок
        this.addEventListener(document, 'click', (event) => {
            this.handleLinkClick(event);
        });
        
        console.log('⚡ Обработчики браузера настроены');
    }

    /**
     * Обработка начального маршрута
     */
    async handleInitialRoute() {
        const initialPath = this.getCurrentPath();
        console.log(`🚀 Начальный маршрут: ${initialPath}`);
        
        if (initialPath && this.routes.has(initialPath)) {
            await this.navigateTo(initialPath, { replace: true });
        } else {
            await this.navigateTo(this.config.defaultRoute, { replace: true });
        }
    }

    /**
     * Получение текущего пути из URL
     */
    getCurrentPath() {
        if (this.config.hashMode) {
            // Режим с хешем: #/dashboard
            const hash = window.location.hash.substring(1);
            return hash.startsWith('/') ? hash.substring(1) : hash;
        } else {
            // Режим без хеша: /dashboard
            return window.location.pathname.substring(1);
        }
    }

    /**
     * Навигация к маршруту
     */
    async navigateTo(path, options = {}) {
        const { 
            replace = false, 
            params = {}, 
            skipHistory = false,
            force = false 
        } = options;
        
        console.log(`🧭 Навигация к: ${path}`);
        
        try {
            // Проверяем, не тот же ли это маршрут
            if (!force && this.currentRoute?.path === path) {
                console.log(`ℹ️ Уже находимся на маршруте: ${path}`);
                return;
            }
            
            // Находим маршрут
            const route = this.routes.get(path);
            if (!route) {
                throw new Error(`Маршрут "${path}" не найден`);
            }
            
            // Выполняем middleware "before" для текущего маршрута
            const canLeave = await this.runBeforeMiddleware(this.currentRoute);
            if (!canLeave) {
                console.log(`🚫 Навигация отменена middleware`);
                return false;
            }
            
            // Выполняем middleware "enter" для нового маршрута
            const canEnter = await this.runEnterMiddleware(route, params);
            if (!canEnter) {
                console.log(`🚫 Вход в маршрут отменен middleware`);
                return false;
            }
            
            // Обновляем историю браузера
            if (!skipHistory) {
                this.updateBrowserHistory(path, route, replace);
            }
            
            // Обновляем заголовок страницы
            this.updatePageTitle(route.title);
            
            // Загружаем страницу через PageManager
            await this.pageManager.loadPage(route.component);
            
            // Сохраняем текущий маршрут
            const previousRoute = this.currentRoute;
            this.currentRoute = {
                ...route,
                params,
                timestamp: Date.now()
            };
            
            // Прокрутка наверх если нужно
            if (this.config.scrollToTop) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
            
            // Эмитируем событие навигации
            this.emit('routeChanged', {
                from: previousRoute,
                to: this.currentRoute,
                path
            });
            
            console.log(`✅ Навигация завершена: ${path}`);
            return true;
            
        } catch (error) {
            console.error(`❌ Ошибка навигации к "${path}":`, error);
            this.emit('routeError', { path, error });
            
            // Попытка перейти на маршрут по умолчанию при ошибке
            if (path !== this.config.defaultRoute) {
                console.log(`🔄 Попытка перехода на маршрут по умолчанию`);
                return await this.navigateTo(this.config.defaultRoute, { replace: true });
            }
            
            throw error;
        }
    }

    /**
     * Добавление middleware
     */
    addMiddleware(middleware) {
        this.middleware.push(middleware);
        console.log(`➕ Добавлен middleware`);
    }

    /**
     * Выполнение middleware "before" (перед покиданием маршрута)
     */
    async runBeforeMiddleware(route) {
        if (!route) return true;
        
        // Глобальные middleware
        for (const middleware of this.middleware) {
            if (middleware.before) {
                const result = await middleware.before(route);
                if (result === false) {
                    console.log(`🚫 Middleware заблокировал покидание маршрута`);
                    return false;
                }
            }
        }
        
        // Маршрут-специфичные middleware
        for (const middleware of route.middleware || []) {
            if (middleware.before) {
                const result = await middleware.before(route);
                if (result === false) {
                    console.log(`🚫 Маршрутный middleware заблокировал покидание`);
                    return false;
                }
            }
        }
        
        return true;
    }

    /**
     * Выполнение middleware "enter" (перед входом в маршрут)
     */
    async runEnterMiddleware(route, params) {
        // Глобальные middleware
        for (const middleware of this.middleware) {
            if (middleware.enter) {
                const result = await middleware.enter(route, params);
                if (result === false) {
                    console.log(`🚫 Middleware заблокировал вход в маршрут`);
                    return false;
                }
            }
        }
        
        // Проверка авторизации
        if (route.requiresAuth && !this.isAuthenticated()) {
            console.log(`🚫 Требуется авторизация для: ${route.path}`);
            this.emit('authRequired', { route });
            return false;
        }
        
        // Маршрут-специфичные middleware
        for (const middleware of route.middleware || []) {
            if (middleware.enter) {
                const result = await middleware.enter(route, params);
                if (result === false) {
                    console.log(`🚫 Маршрутный middleware заблокировал вход`);
                    return false;
                }
            }
        }
        
        return true;
    }

    /**
     * Проверка авторизации (заглушка)
     */
    isAuthenticated() {
        // TODO: Реализовать проверку авторизации
        return true; // Пока всегда true
    }

    /**
     * Обновление истории браузера
     */
    updateBrowserHistory(path, route, replace) {
        const url = this.config.hashMode ? `#/${path}` : `/${path}`;
        
        const state = {
            path,
            title: route.title,
            timestamp: Date.now()
        };
        
        if (replace) {
            history.replaceState(state, route.title, url);
        } else {
            history.pushState(state, route.title, url);
        }
        
        console.log(`📚 История браузера обновлена: ${url}`);
    }

    /**
     * Обновление заголовка страницы
     */
    updatePageTitle(title) {
        document.title = `${title} | IP Roast Enterprise 4.0`;
    }

    /**
     * Обработка события popstate (кнопки Назад/Вперед)
     */
    async handlePopState(event) {
        const state = event.state;
        if (state && state.path) {
            await this.navigateTo(state.path, { skipHistory: true });
        } else {
            // Если состояния нет, пытаемся определить из URL
            const path = this.getCurrentPath();
            await this.navigateTo(path || this.config.defaultRoute, { skipHistory: true });
        }
    }

    /**
     * Обработка изменения хеша
     */
    async handleHashChange(event) {
        const path = this.getCurrentPath();
        if (path) {
            await this.navigateTo(path, { skipHistory: true });
        }
    }

    /**
     * Перехват кликов по ссылкам
     */
    handleLinkClick(event) {
        const link = event.target.closest('a[href]');
        if (!link) return;
        
        const href = link.getAttribute('href');
        
        // Игнорируем внешние ссылки
        if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) {
            return;
        }
        
        // Игнорируем ссылки с target="_blank"
        if (link.getAttribute('target') === '_blank') {
            return;
        }
        
        // Обрабатываем внутренние ссылки
        if (this.config.hashMode && href.startsWith('#/')) {
            event.preventDefault();
            const path = href.substring(2); // Убираем #/
            this.navigateTo(path);
        } else if (!this.config.hashMode && href.startsWith('/')) {
            event.preventDefault();
            const path = href.substring(1); // Убираем /
            this.navigateTo(path);
        }
    }

    /**
     * Программная навигация (для использования другими компонентами)
     */
    push(path, params = {}) {
        return this.navigateTo(path, { params });
    }

    replace(path, params = {}) {
        return this.navigateTo(path, { params, replace: true });
    }

    /**
     * Возврат назад
     */
    goBack() {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            this.navigateTo(this.config.defaultRoute);
        }
    }

    /**
     * Получение текущего маршрута
     */
    getCurrentRoute() {
        return this.currentRoute;
    }

    /**
     * Получение всех маршрутов
     */
    getAllRoutes() {
        return Array.from(this.routes.values());
    }

    /**
     * Проверка существования маршрута
     */
    hasRoute(path) {
        return this.routes.has(path);
    }

    /**
     * Очистка при уничтожении
     */
    async doDestroy() {
        console.log('🗑️ Уничтожение SPARouter');
        
        // Очищаем маршруты и middleware
        this.routes.clear();
        this.middleware.length = 0;
        this.currentRoute = null;
        this.pageManager = null;
    }
}

// Экспорт в глобальную область
window.SPARouter = SPARouter;
console.log('✅ SPARouter загружен');