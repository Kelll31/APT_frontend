/**
 * Attack Constructor Main Integration Module
 * Интегрирует все модули Attack Constructor для работы в SPA
 * Version: 2.0.0-SPA-Ready
 */

class AttackConstructorApp {
    constructor() {
        this.version = '2.0.0-SPA-Ready';
        this.modules = new Map();
        this.isInitialized = false;
        this.initPromise = null;

        console.log(`🎯 Attack Constructor App v${this.version} создан`);
    }

    /**
     * Инициализация всех модулей
     */
    async initialize() {
        if (this.initPromise) {
            return this.initPromise;
        }

        if (this.isInitialized) {
            console.log('✅ Attack Constructor уже инициализирован');
            return true;
        }

        this.initPromise = this._performInitialization();
        return this.initPromise;
    }

    /**
     * Выполнение инициализации
     */
    async _performInitialization() {
        try {
            console.log('🚀 Начало инициализации Attack Constructor...');

            // 1. Загружаем Core (приоритетный модуль)
            await this.loadCoreModule();

            // 2. Загружаем UI Manager для интерфейса
            await this.loadUIManager();

            // 3. Загружаем Canvas Manager для визуализации
            await this.loadCanvasManager();

            // 4. Загружаем остальные модули
            await this.loadSupportingModules();

            // 5. Инициализируем модули в правильном порядке
            await this.initializeModules();

            // 6. Настраиваем взаимосвязи
            this.setupModuleConnections();

            this.isInitialized = true;
            console.log('✅ Attack Constructor полностью инициализирован');

            // Эмитируем событие готовности
            this.emit('initialized');

            return true;

        } catch (error) {
            console.error('❌ Ошибка инициализации Attack Constructor:', error);
            this.isInitialized = false;
            throw error;
        }
    }

    /**
     * Загрузка Core модуля
     */
    async loadCoreModule() {
        try {
            // Загружаем скрипт если еще не загружен
            if (!window.SignatureAnalysisConstructor) {
                await this.loadScript('./pages/attack-constructor/attack-constructor-core.js');
            }

            if (window.SignatureAnalysisConstructor) {
                const core = new window.SignatureAnalysisConstructor();
                this.modules.set('core', core);
                console.log('✅ Core модуль загружен');
            } else {
                throw new Error('SignatureAnalysisConstructor не найден после загрузки скрипта');
            }
        } catch (error) {
            console.error('❌ Ошибка загрузки Core модуля:', error);
            throw error;
        }
    }

    /**
     * Загрузка UI Manager
     */
    async loadUIManager() {
        try {
            if (!window.UIManager) {
                await this.loadScript('./pages/attack-constructor/ui-manager.js');
            }

            if (window.UIManager) {
                const uiManager = new window.UIManager();
                this.modules.set('ui', uiManager);
                console.log('✅ UI Manager загружен');
            } else {
                throw new Error('UIManager не найден');
            }
        } catch (error) {
            console.error('❌ Ошибка загрузки UI Manager:', error);
            throw error;
        }
    }

    /**
     * Загрузка Canvas Manager
     */
    async loadCanvasManager() {
        try {
            if (!window.CanvasManager) {
                await this.loadScript('./pages/attack-constructor/canvas-manager.js');
            }

            if (window.CanvasManager) {
                const canvasManager = new window.CanvasManager();
                this.modules.set('canvas', canvasManager);
                console.log('✅ Canvas Manager загружен');
            } else {
                throw new Error('CanvasManager не найден');
            }
        } catch (error) {
            console.error('❌ Ошибка загрузки Canvas Manager:', error);
            throw error;
        }
    }

    /**
     * Загрузка поддерживающих модулей
     */
    async loadSupportingModules() {
        const moduleConfigs = [
            { key: 'connection', file: 'connection-manager.js', className: 'ConnectionManager' },
            { key: 'rules', file: 'rule-generator.js', className: 'RuleGenerator' },
            { key: 'templates', file: 'rule-templates.js', className: 'RuleTemplateManager' },
            { key: 'components', file: 'signature-components.js', className: 'SignatureComponentsManager' },
            { key: 'test', file: 'test-manager.js', className: 'TestManager' }
        ];

        for (const config of moduleConfigs) {
            try {
                if (!window[config.className]) {
                    await this.loadScript(`./pages/attack-constructor/${config.file}`);
                }

                if (window[config.className]) {
                    const instance = new window[config.className]();
                    this.modules.set(config.key, instance);
                    console.log(`✅ ${config.className} загружен`);
                } else {
                    console.warn(`⚠️ ${config.className} не найден, пропускаем`);
                }
            } catch (error) {
                console.warn(`⚠️ Ошибка загрузки ${config.className}:`, error);
            }
        }
    }

    /**
     * Инициализация модулей
     */
    async initializeModules() {
        const initOrder = ['core', 'ui', 'canvas', 'connection', 'components', 'templates', 'rules', 'test'];

        for (const moduleKey of initOrder) {
            const module = this.modules.get(moduleKey);
            if (module && typeof module.initialize === 'function') {
                try {
                    await module.initialize();
                    console.log(`✅ Модуль ${moduleKey} инициализирован`);
                } catch (error) {
                    console.warn(`⚠️ Ошибка инициализации модуля ${moduleKey}:`, error);
                }
            }
        }
    }

    /**
     * Настройка связей между модулями
     */
    setupModuleConnections() {
        const core = this.modules.get('core');
        if (!core) return;

        // Связываем все модули с Core
        this.modules.forEach((module, key) => {
            if (key !== 'core' && module) {
                core[key + 'Manager'] = module;
                if (module.setCore && typeof module.setCore === 'function') {
                    module.setCore(core);
                }
            }
        });

        console.log('🔗 Связи между модулями настроены');
    }

    /**
     * Динамическая загрузка скрипта
     */
    loadScript(src) {
        return new Promise((resolve, reject) => {
            // Проверяем, не загружен ли уже скрипт
            const existingScript = document.querySelector(`script[src="${src}"]`);
            if (existingScript) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = src;
            script.async = true;

            script.onload = () => {
                console.log(`📄 Скрипт загружен: ${src}`);
                resolve();
            };

            script.onerror = (error) => {
                console.error(`❌ Ошибка загрузки скрипта: ${src}`, error);
                reject(new Error(`Failed to load script: ${src}`));
            };

            document.head.appendChild(script);
        });
    }

    /**
     * Получение модуля
     */
    getModule(key) {
        return this.modules.get(key);
    }

    /**
     * Получение Core модуля
     */
    getCore() {
        return this.modules.get('core');
    }

    /**
     * Система событий
     */
    emit(event, data) {
        const customEvent = new CustomEvent(`attackConstructor:${event}`, {
            detail: { ...data, app: this }
        });
        document.dispatchEvent(customEvent);
    }

    /**
     * Получение статуса
     */
    getStatus() {
        return {
            version: this.version,
            isInitialized: this.isInitialized,
            modules: Array.from(this.modules.keys()),
            moduleCount: this.modules.size
        };
    }

    /**
     * Уничтожение
     */
    async destroy() {
        console.log('🗑️ Уничтожение Attack Constructor App...');

        // Уничтожаем все модули
        for (const [key, module] of this.modules) {
            if (module && typeof module.destroy === 'function') {
                try {
                    await module.destroy();
                } catch (error) {
                    console.warn(`⚠️ Ошибка уничтожения модуля ${key}:`, error);
                }
            }
        }

        this.modules.clear();
        this.isInitialized = false;
        this.initPromise = null;

        console.log('✅ Attack Constructor App уничтожен');
    }
}

// Глобальная инициализация для SPA
let attackConstructorApp = null;

async function initializeAttackConstructor() {
    if (attackConstructorApp) {
        console.log('✅ Attack Constructor уже инициализирован');
        return attackConstructorApp;
    }

    try {
        attackConstructorApp = new AttackConstructorApp();
        await attackConstructorApp.initialize();

        // Делаем доступным глобально
        window.attackConstructorApp = attackConstructorApp;

        return attackConstructorApp;
    } catch (error) {
        console.error('❌ Ошибка инициализации Attack Constructor:', error);
        throw error;
    }
}

// Экспорт для ES6 модулей
export { AttackConstructorApp, initializeAttackConstructor };

// Глобальный доступ для legacy кода
window.AttackConstructorApp = AttackConstructorApp;
window.initializeAttackConstructor = initializeAttackConstructor;

// Автоинициализация при загрузке
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('📄 DOM загружен, Attack Constructor готов к инициализации');
    });
} else {
    console.log('📄 DOM уже загружен, Attack Constructor готов к инициализации');
}

console.log('✅ Attack Constructor Main загружен');
