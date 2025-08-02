/**
 * Enhanced ComponentLoader.js - Модульный загрузчик HTML компонентов
 * IP Roast Enterprise 4.0
 */

class ComponentLoader {
    constructor() {
        this.cache = new Map();
        this.loadingPromises = new Map();
        this.loadedComponents = new Set();

        this.config = {
            timeout: 10000,
            retryCount: 3,
            retryDelay: 1000,
            componentsPath: './components'
        };

        this.eventListeners = new Map();
        console.log('🔧 ComponentLoader enhanced version initialized');
    }

    /**
     * Загрузка одного компонента
     */
    async loadComponent(componentName, containerId, options = {}) {
        const cacheKey = `${componentName}:${containerId}`;

        // Проверяем, не загружается ли уже этот компонент
        if (this.loadingPromises.has(cacheKey)) {
            return this.loadingPromises.get(cacheKey);
        }

        const loadPromise = this._loadComponentInternal(componentName, containerId, options);
        this.loadingPromises.set(cacheKey, loadPromise);

        try {
            const result = await loadPromise;
            this.loadingPromises.delete(cacheKey);
            return result;
        } catch (error) {
            this.loadingPromises.delete(cacheKey);
            throw error;
        }
    }

    /**
     * Внутренний метод загрузки компонента
     */
    async _loadComponentInternal(componentName, containerId, options) {
        const { useCache = true, transform = null, initializeJS = true } = options;
        const componentPath = `${this.config.componentsPath}/${componentName}.html`;

        try {
            let html;

            // Проверяем кэш
            if (useCache && this.cache.has(componentPath)) {
                html = this.cache.get(componentPath);
                console.log(`📦 Component loaded from cache: ${componentName}`);
            } else {
                // Загружаем с сервера
                html = await this._fetchWithRetry(componentPath);
                if (useCache) {
                    this.cache.set(componentPath, html);
                }
                console.log(`🌐 Component loaded from server: ${componentName}`);
            }

            // Применяем трансформацию если есть
            if (transform && typeof transform === 'function') {
                html = transform(html);
            }

            // Вставляем в DOM
            const container = document.getElementById(containerId);
            if (!container) {
                throw new Error(`Container with id "${containerId}" not found`);
            }

            container.innerHTML = html;
            this.loadedComponents.add(componentName);

            // Инициализируем скрипты в загруженном компоненте
            if (initializeJS) {
                await this._initializeComponentScripts(container, componentName);
            }

            // Эмитируем событие загрузки компонента
            this.emit('componentLoaded', {
                name: componentName,
                containerId,
                html
            });

            console.log(`✅ Component successfully loaded: ${componentName} -> ${containerId}`);
            return { path: componentPath, containerId, html, componentName };

        } catch (error) {
            console.error(`❌ Error loading component ${componentName}:`, error);
            throw error;
        }
    }

    /**
     * Загрузка с повторными попытками
     */
    async _fetchWithRetry(path) {
        let lastError;

        for (let i = 0; i < this.config.retryCount; i++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

                const response = await fetch(path, {
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

                return await response.text();

            } catch (error) {
                lastError = error;
                console.warn(`⚠️ Attempt ${i + 1} failed for ${path}:`, error.message);

                if (i < this.config.retryCount - 1) {
                    await new Promise(resolve => setTimeout(resolve, this.config.retryDelay));
                }
            }
        }

        throw lastError;
    }

    /**
     * Инициализация скриптов в загруженном компоненте
     */
    async _initializeComponentScripts(container, componentName) {
        // Находим и выполняем inline скрипты
        const scripts = container.querySelectorAll('script');
        for (const script of scripts) {
            if (script.src) {
                // Внешний скрипт
                await this._loadExternalScript(script.src);
            } else if (script.textContent.trim()) {
                // Inline скрипт
                try {
                    new Function(script.textContent)();
                } catch (error) {
                    console.warn('⚠️ Error executing inline script:', error);
                }
            }
        }

        // Ищем и инициализируем компонент-специфичные функции
        const initFunctionName = `init${componentName.charAt(0).toUpperCase() + componentName.slice(1)}Component`;
        if (typeof window[initFunctionName] === 'function') {
            try {
                await window[initFunctionName](container);
                console.log(`✅ Component script initialized: ${initFunctionName}`);
            } catch (error) {
                console.warn(`⚠️ Error initializing component script ${initFunctionName}:`, error);
            }
        }

        // Эмитируем событие о готовности компонента
        container.dispatchEvent(new CustomEvent('componentReady', {
            detail: { container, componentName }
        }));
    }

    /**
     * Загрузка внешнего скрипта
     */
    _loadExternalScript(src) {
        return new Promise((resolve, reject) => {
            // Проверяем, не загружен ли уже скрипт
            if (document.querySelector(`script[src="${src}"]`)) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
            document.head.appendChild(script);
        });
    }

    /**
     * Загрузка множественных компонентов
     */
    async loadComponents(components) {
        const promises = components.map(comp =>
            this.loadComponent(comp.name, comp.container, comp.options || {})
        );

        try {
            const results = await Promise.allSettled(promises);
            const successful = results.filter(r => r.status === 'fulfilled');
            const failed = results.filter(r => r.status === 'rejected');

            console.log(`📦 Components loaded: ${successful.length}/${components.length} successful`);

            if (failed.length > 0) {
                console.warn('⚠️ Some components failed to load:',
                    failed.map(f => f.reason.message)
                );
            }

            return {
                successful: successful.map(r => r.value),
                failed: failed.map(r => r.reason)
            };

        } catch (error) {
            console.error('❌ Critical error loading components:', error);
            throw error;
        }
    }

    /**
     * Предзагрузка компонентов
     */
    async preloadComponents(componentNames) {
        const promises = componentNames.map(async name => {
            try {
                const path = `${this.config.componentsPath}/${name}.html`;
                const html = await this._fetchWithRetry(path);
                this.cache.set(path, html);
                console.log(`📦 Preloaded: ${name}`);
            } catch (error) {
                console.warn(`⚠️ Preload failed for ${name}:`, error.message);
            }
        });

        await Promise.allSettled(promises);
    }

    /**
     * Перезагрузка компонента
     */
    async reloadComponent(componentName, containerId) {
        const cacheKey = `${this.config.componentsPath}/${componentName}.html`;

        // Очищаем кэш для этого компонента
        this.cache.delete(cacheKey);
        this.loadedComponents.delete(componentName);

        console.log(`🔄 Reloading component: ${componentName}`);

        // Загружаем заново
        return await this.loadComponent(componentName, containerId);
    }

    /**
     * Проверка загружен ли компонент
     */
    isComponentLoaded(componentName) {
        return this.loadedComponents.has(componentName);
    }

    /**
     * Удаление компонента из DOM и кэша
     */
    unloadComponent(componentName, containerId = null) {
        // Удаляем из кэша
        const cacheKey = `${this.config.componentsPath}/${componentName}.html`;
        this.cache.delete(cacheKey);
        this.loadedComponents.delete(componentName);

        // Удаляем из DOM если указан контейнер
        if (containerId) {
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = '';
            }
        }

        console.log(`🗑️ Component unloaded: ${componentName}`);
    }

    /**
     * Очистка кэша
     */
    clearCache(componentName = null) {
        if (componentName) {
            const cacheKey = `${this.config.componentsPath}/${componentName}.html`;
            this.cache.delete(cacheKey);
            this.loadedComponents.delete(componentName);
            console.log(`🗑️ Cache cleared for: ${componentName}`);
        } else {
            this.cache.clear();
            this.loadedComponents.clear();
            console.log('🗑️ All cache cleared');
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
            cacheSize: this.cache.size,
            cachedComponents: Array.from(this.cache.keys()),
            loadedComponents: Array.from(this.loadedComponents),
            loadingInProgress: this.loadingPromises.size
        };
    }

    /**
     * Уничтожение загрузчика
     */
    destroy() {
        this.clearCache();
        this.loadingPromises.clear();
        this.eventListeners.clear();
        console.log('🗑️ ComponentLoader destroyed');
    }
}

// Глобальный экспорт
window.ComponentLoader = ComponentLoader;

// Инициализация компонентов для IP Roast Enterprise
class IPRoastComponentManager {
    constructor() {
        this.loader = new ComponentLoader();
        this.requiredComponents = [
            { name: 'sidebar', container: 'sidebar-container' },
            { name: 'header', container: 'header-container' }
        ];
    }

    /**
     * Загрузка всех основных компонентов
     */
    async loadAllComponents() {
        console.log('🚀 Loading IP Roast Enterprise components...');

        try {
            const results = await this.loader.loadComponents(this.requiredComponents);

            console.log('✅ All components loaded successfully');

            // Инициализируем компоненты после загрузки
            await this.initializeLoadedComponents();

            return results;

        } catch (error) {
            console.error('❌ Failed to load components:', error);
            throw error;
        }
    }

    /**
     * Инициализация загруженных компонентов
     */
    async initializeLoadedComponents() {
        // Ждем небольшую задержку для полной инициализации DOM
        await new Promise(resolve => setTimeout(resolve, 100));

        // Инициализируем SidebarManager если доступен
        if (window.SidebarManager && this.loader.isComponentLoaded('sidebar')) {
            window.sidebarManager = new window.SidebarManager();
            console.log('✅ Sidebar component initialized');
        }

        // Инициализируем HeaderManager если доступен
        if (window.HeaderManager && this.loader.isComponentLoaded('header')) {
            window.headerManager = new window.HeaderManager();
            console.log('✅ Header component initialized');
        }
    }

    /**
     * Получение загрузчика
     */
    getLoader() {
        return this.loader;
    }
}

// Экспорт менеджера компонентов
window.IPRoastComponentManager = IPRoastComponentManager;

console.log('🔧 Enhanced ComponentLoader with IP Roast integration loaded');