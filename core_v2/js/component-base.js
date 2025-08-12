/**
 * Базовый класс для всех компонентов системы
 * Обеспечивает единообразное управление жизненным циклом
 */
class ComponentBase {
    constructor(name) {
        this.name = name;
        this.isInitialized = false;
        this.isDestroyed = false;
        this.element = null;
        this.eventListeners = [];
        this.eventHandlers = new Map();
        this.childComponents = new Map();
        this.abortController = null;
    }

    /**
     * Инициализация компонента
     */
    async init() {
        if (this.isInitialized) {
            console.warn(`⚠️ ${this.name}: попытка повторной инициализации`);
            return;
        }
        
        if (this.isDestroyed) {
            throw new Error(`${this.name}: попытка инициализации уничтоженного компонента`);
        }
        
        try {
            console.log(`🚀 ${this.name}: начало инициализации`);
            
            // Создаем AbortController для отмены операций
            this.abortController = new AbortController();
            
            // Вызываем пользовательский метод инициализации
            await this.doInit();
            
            this.isInitialized = true;
            console.log(`✅ ${this.name}: инициализация завершена`);
            
            // Эмитируем событие инициализации
            this.emit('initialized');
            
        } catch (error) {
            console.error(`❌ ${this.name}: ошибка инициализации:`, error);
            await this.destroy();
            throw error;
        }
    }

    /**
     * Пользовательский метод инициализации (переопределить в дочернем классе)
     */
    async doInit() {
        // Переопределить в дочернем классе
    }

    /**
     * Уничтожение компонента
     */
    async destroy() {
        if (this.isDestroyed) {
            console.warn(`⚠️ ${this.name}: компонент уже уничтожен`);
            return;
        }
        
        try {
            console.log(`🗑️ ${this.name}: начало уничтожения`);
            
            // Отменяем все активные операции
            if (this.abortController) {
                this.abortController.abort();
            }
            
            // Уничтожаем дочерние компоненты
            for (const [childName, childComponent] of this.childComponents) {
                try {
                    await childComponent.destroy();
                    console.log(`✅ ${this.name}: дочерний компонент "${childName}" уничтожен`);
                } catch (error) {
                    console.error(`❌ ${this.name}: ошибка уничтожения дочернего компонента "${childName}":`, error);
                }
            }
            this.childComponents.clear();
            
            // Удаляем все обработчики событий
            this.removeAllEventListeners();
            
            // Вызываем пользовательский метод уничтожения
            await this.doDestroy();
            
            // Очищаем ссылки
            this.element = null;
            this.isDestroyed = true;
            this.isInitialized = false;
            
            console.log(`✅ ${this.name}: уничтожение завершено`);
            
        } catch (error) {
            console.error(`❌ ${this.name}: ошибка уничтожения:`, error);
            this.isDestroyed = true;
        }
    }

    /**
     * Пользовательский метод уничтожения (переопределить в дочернем классе)
     */
    async doDestroy() {
        // Переопределить в дочернем классе
    }

    /**
     * Добавление обработчика событий с автоматической очисткой
     */
    addEventListener(element, event, handler, options = {}) {
        const boundHandler = handler.bind(this);
        element.addEventListener(event, boundHandler, options);
        
        this.eventListeners.push({
            element,
            event,
            handler: boundHandler,
            options
        });
        
        return boundHandler;
    }

    /**
     * Удаление конкретного обработчика событий
     */
    removeEventListener(element, event, handler) {
        element.removeEventListener(event, handler);
        
        const index = this.eventListeners.findIndex(listener => 
            listener.element === element &&
            listener.event === event &&
            listener.handler === handler
        );
        
        if (index !== -1) {
            this.eventListeners.splice(index, 1);
        }
    }

    /**
     * Удаление всех обработчиков событий
     */
    removeAllEventListeners() {
        for (const listener of this.eventListeners) {
            try {
                listener.element.removeEventListener(listener.event, listener.handler, listener.options);
            } catch (error) {
                console.warn(`⚠️ ${this.name}: ошибка удаления обработчика событий:`, error);
            }
        }
        this.eventListeners.length = 0;
        console.log(`🧹 ${this.name}: все обработчики событий удалены`);
    }

    /**
     * Система внутренних событий компонента
     */
    on(event, handler) {
        if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, []);
        }
        this.eventHandlers.get(event).push(handler);
    }

    off(event, handler) {
        if (this.eventHandlers.has(event)) {
            const handlers = this.eventHandlers.get(event);
            const index = handlers.indexOf(handler);
            if (index !== -1) {
                handlers.splice(index, 1);
            }
        }
    }

    emit(event, data) {
        if (this.eventHandlers.has(event)) {
            const handlers = this.eventHandlers.get(event);
            handlers.forEach(handler => {
                try {
                    handler.call(this, data);
                } catch (error) {
                    console.error(`❌ ${this.name}: ошибка в обработчике события "${event}":`, error);
                }
            });
        }
    }

    /**
     * Добавление дочернего компонента
     */
    addChild(name, component) {
        if (this.childComponents.has(name)) {
            console.warn(`⚠️ ${this.name}: дочерний компонент "${name}" уже существует`);
            return;
        }
        
        this.childComponents.set(name, component);
        console.log(`➕ ${this.name}: добавлен дочерний компонент "${name}"`);
    }

    /**
     * Получение дочернего компонента
     */
    getChild(name) {
        return this.childComponents.get(name);
    }

    /**
     * Удаление дочернего компонента
     */
    async removeChild(name) {
        const child = this.childComponents.get(name);
        if (child) {
            await child.destroy();
            this.childComponents.delete(name);
            console.log(`➖ ${this.name}: удален дочерний компонент "${name}"`);
        }
    }

    /**
     * Создание AbortController для отмены операций
     */
    createAbortController() {
        const controller = new AbortController();
        
        // При уничтожении компонента отменяем все операции
        this.on('destroy', () => {
            controller.abort();
        });
        
        return controller;
    }

    /**
     * Безопасный поиск элемента DOM
     */
    findElement(selector) {
        if (this.element) {
            return this.element.querySelector(selector);
        }
        return document.querySelector(selector);
    }

    /**
     * Безопасный поиск множественных элементов DOM
     */
    findElements(selector) {
        if (this.element) {
            return this.element.querySelectorAll(selector);
        }
        return document.querySelectorAll(selector);
    }

    /**
     * Проверка состояния компонента
     */
    isReady() {
        return this.isInitialized && !this.isDestroyed;
    }

    /**
     * Получение информации о компоненте
     */
    getInfo() {
        return {
            name: this.name,
            isInitialized: this.isInitialized,
            isDestroyed: this.isDestroyed,
            hasElement: !!this.element,
            eventListeners: this.eventListeners.length,
            childComponents: Array.from(this.childComponents.keys())
        };
    }

    /**
     * Логирование с префиксом компонента
     */
    log(...args) {
        console.log(`[${this.name}]`, ...args);
    }

    warn(...args) {
        console.warn(`[${this.name}]`, ...args);
    }

    error(...args) {
        console.error(`[${this.name}]`, ...args);
    }
}

// Экспорт в глобальную область
window.ComponentBase = ComponentBase;
console.log('✅ ComponentBase загружен');