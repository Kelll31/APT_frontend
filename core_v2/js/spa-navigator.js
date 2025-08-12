/**
 * SPANavigator - Система навигации для SPA приложения
 */
class SPANavigator extends ComponentBase {
    constructor() {
        super('SPANavigator');
        
        this.currentRoute = null;
        this.routes = new Map();
        this.history = [];
        this.maxHistoryLength = 50;
        
        this.config = {
            useHashRouting: true,
            enableBrowserHistory: true,
            defaultRoute: 'dashboard',
            enableTransitions: true
        };
        
        console.log('🧭 SPANavigator создан');
    }

    /**
     * Инициализация навигатора
     */
    async doInit() {
        this.setupRoutes();
        this.setupEventListeners();
        this.handleInitialRoute();
        
        console.log('✅ SPANavigator инициализирован');
    }

    /**
     * Настройка маршрутов
     */
    setupRoutes() {
        const routes = [
            'dashboard',
            'scanner', 
            'attack-constructor',
            'network-topology',
            'reports',
            'settings'
        ];
        
        routes.forEach(route => {
            this.routes.set(route, {
                id: route,
                title: this.getPageTitle(route),
                isActive: false
            });
        });
        
        console.log('🗺️ Маршруты настроены:', Array.from(this.routes.keys()));
    }

    /**
     * Настройка обработчиков событий
     */
    setupEventListeners() {
        // История браузера
        if (this.config.enableBrowserHistory) {
            this.addEventListener(window, 'popstate', (event) => {
                const route = this.getRouteFromURL();
                if (route && route !== this.currentRoute) {
                    this.navigateTo(route, { skipHistory: true });
                }
            });
        }
        
        // Hash изменения
        if (this.config.useHashRouting) {
            this.addEventListener(window, 'hashchange', (event) => {
                const route = this.getRouteFromHash();
                if (route && route !== this.currentRoute) {
                    this.navigateTo(route, { skipHistory: true });
                }
            });
        }
        
        // Клики по навигационным ссылкам
        this.addEventListener(document, 'click', (event) => {
            const navLink = event.target.closest('[data-navigate]');
            if (navLink) {
                event.preventDefault();
                const route = navLink.dataset.navigate;
                if (route) {
                    this.navigateTo(route);
                }
            }
        });
        
        console.log('⚡ SPANavigator события настроены');
    }

    /**
     * Обработка начального маршрута
     */
    handleInitialRoute() {
        let initialRoute = this.getRouteFromURL() || this.getRouteFromHash();
        
        if (!initialRoute || !this.routes.has(initialRoute)) {
            initialRoute = this.config.defaultRoute;
        }
        
        this.navigateTo(initialRoute, { skipHistory: true });
        console.log(`🚀 Начальный маршрут: ${initialRoute}`);
    }

    /**
     * Навигация к указанному маршруту
     */
    async navigateTo(route, options = {}) {
        if (!route || !this.routes.has(route)) {
            console.warn(`⚠️ Неизвестный маршрут: ${route}`);
            return false;
        }
        
        if (route === this.currentRoute && !options.force) {
            console.log(`📍 Уже на странице: ${route}`);
            return true;
        }
        
        console.log(`🧭 Навигация: ${this.currentRoute} → ${route}`);
        
        try {
            // Сохраняем в историю
            if (!options.skipHistory) {
                this.addToHistory(route);
                this.updateBrowserURL(route);
            }
            
            // Обновляем состояние маршрутов
            this.updateRoutesState(route);
            
            // Эмитируем событие начала навигации
            this.emit('navigationStart', {
                from: this.currentRoute,
                to: route,
                timestamp: Date.now()
            });
            
            // Загружаем страницу через PageManager
            if (window.app && window.app.pageManager) {
                await window.app.pageManager.loadPage(route);
            } else {
                throw new Error('PageManager не найден');
            }
            
            // Обновляем активные состояния в UI
            this.updateNavigationUI(route);
            
            // Обновляем заголовок страницы
            this.updatePageTitle(route);
            
            const previousRoute = this.currentRoute;
            this.currentRoute = route;
            
            // Эмитируем событие завершения навигации
            this.emit('navigationComplete', {
                from: previousRoute,
                to: route,
                timestamp: Date.now()
            });
            
            console.log(`✅ Навигация завершена: ${route}`);
            return true;
            
        } catch (error) {
            console.error(`❌ Ошибка навигации к "${route}":`, error);
            
            // Эмитируем событие ошибки
            this.emit('navigationError', {
                route,
                error,
                timestamp: Date.now()
            });
            
            return false;
        }
    }

    /**
     * Обновление состояния маршрутов
     */
    updateRoutesState(activeRoute) {
        this.routes.forEach((route, id) => {
            route.isActive = (id === activeRoute);
        });
    }

    /**
     * Обновление UI навигации
     */
    updateNavigationUI(activeRoute) {
        // Обновляем sidebar если доступен
        if (window.app && window.app.sidebarManager) {
            window.app.sidebarManager.setActivePage(activeRoute);
        }
        
        // Обновляем активные классы в навигационных элементах
        const navItems = document.querySelectorAll('[data-navigate]');
        navItems.forEach(item => {
            const itemRoute = item.dataset.navigate;
            if (itemRoute === activeRoute) {
                item.classList.add('active');
                item.setAttribute('aria-current', 'page');
            } else {
                item.classList.remove('active');
                item.removeAttribute('aria-current');
            }
        });
        
        // Обновляем breadcrumb если есть
        this.updateBreadcrumb(activeRoute);
    }

    /**
     * Обновление breadcrumb
     */
    updateBreadcrumb(route) {
        const breadcrumb = document.getElementById('breadcrumb');
        if (!breadcrumb) return;
        
        const routeInfo = this.routes.get(route);
        if (!routeInfo) return;
        
        breadcrumb.innerHTML = `
            <div class="breadcrumb">
                <span class="breadcrumb-item">
                    <a href="#" data-navigate="dashboard">Главная</a>
                </span>
                ${route !== 'dashboard' ? `
                    <span class="breadcrumb-separator">/</span>
                    <span class="breadcrumb-item active">${routeInfo.title}</span>
                ` : ''}
            </div>
        `;
    }

    /**
     * Обновление заголовка страницы
     */
    updatePageTitle(route) {
        const routeInfo = this.routes.get(route);
        if (!routeInfo) return;
        
        // Обновляем title документа
        document.title = `${routeInfo.title} - IP Roast Enterprise 4.0`;
        
        // Обновляем заголовок в header если есть
        if (window.app && window.app.headerManager) {
            window.app.headerManager.updatePageTitle(routeInfo.title);
        }
        
        const pageTitleElement = document.getElementById('page-title');
        if (pageTitleElement) {
            pageTitleElement.textContent = routeInfo.title;
        }
    }

    /**
     * Добавление в историю
     */
    addToHistory(route) {
        // Удаляем дубликаты из конца истории
        const lastIndex = this.history.lastIndexOf(route);
        if (lastIndex === this.history.length - 1) {
            return;
        }
        
        this.history.push(route);
        
        // Ограничиваем размер истории
        if (this.history.length > this.maxHistoryLength) {
            this.history = this.history.slice(-this.maxHistoryLength);
        }
    }

    /**
     * Обновление URL браузера
     */
    updateBrowserURL(route) {
        if (!this.config.enableBrowserHistory) return;
        
        try {
            const url = this.config.useHashRouting 
                ? `#${route}`
                : `/${route}`;
                
            const routeInfo = this.routes.get(route);
            const title = routeInfo ? routeInfo.title : route;
            
            if (this.config.useHashRouting) {
                window.location.hash = route;
            } else {
                window.history.pushState({ route }, title, url);
            }
        } catch (error) {
            console.warn('⚠️ Ошибка обновления URL:', error);
        }
    }

    /**
     * Получение маршрута из URL
     */
    getRouteFromURL() {
        const path = window.location.pathname;
        const route = path.substring(1) || this.config.defaultRoute;
        return this.routes.has(route) ? route : null;
    }

    /**
     * Получение маршрута из hash
     */
    getRouteFromHash() {
        const hash = window.location.hash.substring(1);
        return this.routes.has(hash) ? hash : null;
    }

    /**
     * Получение заголовка страницы
     */
    getPageTitle(route) {
        const titles = {
            'dashboard': 'Панель управления',
            'scanner': 'Модуль сканирования',
            'attack-constructor': 'Конструктор атак',
            'network-topology': 'Топология сети',
            'reports': 'Отчеты и аналитика',
            'settings': 'Настройки системы'
        };
        
        return titles[route] || 'Неизвестная страница';
    }

    /**
     * Возврат на предыдущую страницу
     */
    goBack() {
        if (this.history.length < 2) {
            console.log('📍 Нет предыдущей страницы в истории');
            return false;
        }
        
        // Убираем текущую страницу
        this.history.pop();
        
        // Переходим к предыдущей
        const previousRoute = this.history.pop();
        return this.navigateTo(previousRoute);
    }

    /**
     * Переход вперед (если есть история)
     */
    goForward() {
        // В данной реализации forward история не поддерживается
        // Можно расширить функциональность при необходимости
        console.log('📍 Переход вперед не поддерживается');
        return false;
    }

    /**
     * Получение текущего маршрута
     */
    getCurrentRoute() {
        return this.currentRoute;
    }

    /**
     * Получение истории навигации
     */
    getHistory() {
        return [...this.history];
    }

    /**
     * Проверка, можно ли вернуться назад
     */
    canGoBack() {
        return this.history.length > 1;
    }

    /**
     * Получение доступных маршрутов
     */
    getAvailableRoutes() {
        return Array.from(this.routes.keys());
    }

    /**
     * Получение информации о маршруте
     */
    getRouteInfo(route) {
        return this.routes.get(route);
    }

    /**
     * Проверка, активен ли маршрут
     */
    isRouteActive(route) {
        return this.currentRoute === route;
    }

    /**
     * Очистка истории
     */
    clearHistory() {
        this.history = [];
        console.log('🗑️ История навигации очищена');
    }

    /**
     * Получение статистики навигации
     */
    getStats() {
        return {
            currentRoute: this.currentRoute,
            availableRoutes: this.getAvailableRoutes(),
            history: this.getHistory(),
            canGoBack: this.canGoBack(),
            config: this.config
        };
    }

    /**
     * Уничтожение навигатора
     */
    async doDestroy() {
        this.clearHistory();
        this.routes.clear();
        
        console.log('🗑️ SPANavigator уничтожен');
    }
}

// Экспорт в глобальную область
window.SPANavigator = SPANavigator;

console.log('🧭 SPANavigator загружен');