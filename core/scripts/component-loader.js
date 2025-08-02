/**
 * ComponentLoader.js - Динамический загрузчик HTML компонентов
 * IP Roast Enterprise 4.0
 */

class ComponentLoader {
    constructor() {
        this.cache = new Map();
        this.loadingPromises = new Map();
        this.config = {
            timeout: 10000,
            retryCount: 3,
            retryDelay: 1000
        };
    }

    /**
     * Загрузка одного компонента
     */
    async loadComponent(path, containerId, options = {}) {
        const cacheKey = `${path}:${containerId}`;

        // Проверяем, не загружается ли уже этот компонент
        if (this.loadingPromises.has(cacheKey)) {
            return this.loadingPromises.get(cacheKey);
        }

        const loadPromise = this._loadComponentInternal(path, containerId, options);
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
    async _loadComponentInternal(path, containerId, options) {
        const { useCache = true, transform = null } = options;

        try {
            let html;

            // Проверяем кэш
            if (useCache && this.cache.has(path)) {
                html = this.cache.get(path);
                console.log(`📦 Component loaded from cache: ${path}`);
            } else {
                // Загружаем с сервера
                html = await this._fetchWithRetry(path);

                if (useCache) {
                    this.cache.set(path, html);
                }
                console.log(`🌐 Component loaded from server: ${path}`);
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

            // Инициализируем скрипты в загруженном компоненте
            await this._initializeComponentScripts(container);

            console.log(`✅ Component successfully loaded: ${path} -> ${containerId}`);
            return { path, containerId, html };

        } catch (error) {
            console.error(`❌ Error loading component ${path}:`, error);
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
    async _initializeComponentScripts(container) {
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

        // Эмитируем событие о готовности компонента
        container.dispatchEvent(new CustomEvent('componentReady', {
            detail: { container }
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
            this.loadComponent(comp.path, comp.container, comp.options || {})
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
    async preloadComponents(paths) {
        const promises = paths.map(async path => {
            try {
                const html = await this._fetchWithRetry(path);
                this.cache.set(path, html);
                console.log(`📦 Preloaded: ${path}`);
            } catch (error) {
                console.warn(`⚠️ Preload failed for ${path}:`, error.message);
            }
        });

        await Promise.allSettled(promises);
    }

    /**
     * Очистка кэша
     */
    clearCache(path = null) {
        if (path) {
            this.cache.delete(path);
            console.log(`🗑️ Cache cleared for: ${path}`);
        } else {
            this.cache.clear();
            console.log('🗑️ All cache cleared');
        }
    }

    /**
     * Получение статистики
     */
    getStats() {
        return {
            cacheSize: this.cache.size,
            cachedComponents: Array.from(this.cache.keys()),
            loadingInProgress: this.loadingPromises.size
        };
    }
}

// Экспорт
window.ComponentLoader = ComponentLoader;

console.log('🔧 ComponentLoader loaded');
