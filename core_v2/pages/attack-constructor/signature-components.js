/**
 * IP Roast Enterprise 4.0 - Signature Components Manager Module
 * Управление библиотекой компонентов сигнатурного анализа
 * Версия: 4.0.0-Enhanced-Components
 * 
 * @description Специализированный модуль для управления библиотекой сигнатурных компонентов
 * @author IP Roast Security Team
 * @requires attack-constructor-core.js
 * @integrates canvas-manager, ui-manager, rule-generator
 */

console.log('🧩 Loading Signature Components Manager v4.0.0-Enhanced');

/**
 * Основной класс для управления компонентами сигнатурного анализа
 */
class SignatureComponentsManager {
    constructor(coreInstance) {
        this.version = '4.0.0-Enhanced-Components';
        this.core = coreInstance;
        this.isInitialized = false;

        // Библиотека компонентов
        this.components = new Map();
        this.categories = new Map();
        this.componentsByType = new Map();

        // Состояние поиска и фильтрации
        this.searchQuery = '';
        this.selectedCategory = '';
        this.visibleComponents = new Set();

        // Метрики использования
        this.usageMetrics = {
            totalComponents: 0,
            popularComponents: new Map(),
            recentlyUsed: [],
            searchQueries: [],
            categoryUsage: new Map()
        };

        // Настройки
        this.settings = {
            enableSearch: true,
            enableDragDrop: true,
            showComponentTooltips: true,
            groupByCategory: true,
            maxRecentComponents: 10,
            searchDebounceTime: 300
        };

        // Кэширование и производительность
        this.renderCache = new Map();
        this.searchCache = new Map();
        this.lastRenderTime = 0;

        // События
        this.eventHandlers = new Map();
        this.debounceTimers = new Map();

        console.log('🧩 Signature Components Manager initialized');
    }

    /**
     * Инициализация Components Manager
     */
    async initialize() {
        try {
            console.log('🚀 Initializing Signature Components Manager...');

            this.loadComponentDefinitions();
            this.buildCategoryStructure();
            this.setupEventListeners();
            this.setupDragAndDrop();
            this.initializeSearch();
            this.renderComponentLibrary();

            this.isInitialized = true;
            console.log('✅ Signature Components Manager initialized successfully');

        } catch (error) {
            console.error('❌ Signature Components Manager initialization failed:', error);
            throw error;
        }
    }

    /**
     * Загрузка определений компонентов из core модуля
     */
    loadComponentDefinitions() {
        console.log('📚 Loading component definitions...');

        if (!this.core?.signatureComponents) {
            console.warn('⚠️ No component definitions found in core module');
            return;
        }

        // Копируем компоненты из core модуля с дополнительными метаданными
        this.core.signatureComponents.forEach((definition, componentId) => {
            const enhancedComponent = {
                ...definition,
                // Метрики использования
                usageCount: 0,
                lastUsed: null,
                avgRating: 0,

                // Дополнительные свойства
                isDeprecated: false,
                isExperimental: false,
                requiredVersion: '4.0.0',

                // Метаданные для UI
                displayOrder: this.getComponentDisplayOrder(definition.type),
                searchKeywords: this.generateSearchKeywords(definition),
                complexity: this.calculateComponentComplexity(definition)
            };

            this.components.set(componentId, enhancedComponent);
        });

        this.usageMetrics.totalComponents = this.components.size;
        console.log(`✅ Loaded ${this.components.size} component definitions`);
    }

    /**
     * Построение структуры категорий
     */
    buildCategoryStructure() {
        console.log('📂 Building category structure...');

        // Очищаем существующие категории
        this.categories.clear();
        this.componentsByType.clear();

        // Определяем категории и их метаданные
        const categoryDefinitions = {
            'network': {
                name: 'Сетевые компоненты',
                icon: '🌐',
                description: 'Анализ сетевого трафика и протоколов',
                color: '#2196F3',
                order: 1
            },
            'file': {
                name: 'Файловые компоненты',
                icon: '📁',
                description: 'Анализ файлов и их содержимого',
                color: '#4CAF50',
                order: 2
            },
            'content': {
                name: 'Контентные компоненты',
                icon: '📄',
                description: 'Поиск и анализ содержимого',
                color: '#FF9800',
                order: 3
            },
            'behavioral': {
                name: 'Поведенческие компоненты',
                icon: '📊',
                description: 'Анализ поведения и активности',
                color: '#9C27B0',
                order: 4
            },
            'temporal': {
                name: 'Временные компоненты',
                icon: '⏰',
                description: 'Временной анализ и расписания',
                color: '#607D8B',
                order: 5
            }
        };

        // Инициализируем категории
        Object.entries(categoryDefinitions).forEach(([type, definition]) => {
            this.categories.set(type, {
                ...definition,
                components: [],
                count: 0,
                isVisible: true,
                isExpanded: true
            });
            this.componentsByType.set(type, []);
        });

        // Распределяем компоненты по категориям
        this.components.forEach((component, componentId) => {
            const categoryType = component.type || 'other';

            if (this.categories.has(categoryType)) {
                const category = this.categories.get(categoryType);
                const componentsList = this.componentsByType.get(categoryType);

                category.components.push(componentId);
                category.count++;
                componentsList.push({ id: componentId, ...component });
            } else {
                console.warn(`⚠️ Unknown category type: ${categoryType} for component ${componentId}`);
            }
        });

        // Сортируем компоненты в каждой категории
        this.componentsByType.forEach((components, type) => {
            components.sort((a, b) => {
                // Сначала по порядку отображения, затем по названию
                if (a.displayOrder !== b.displayOrder) {
                    return a.displayOrder - b.displayOrder;
                }
                return a.name.localeCompare(b.name);
            });
        });

        console.log(`📂 Built ${this.categories.size} categories`);
    }

    /**
     * Настройка обработчиков событий
     */
    setupEventListeners() {
        console.log('⚡ Setting up event listeners...');

        // Поиск компонентов
        const searchInput = document.getElementById('component-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearchInput(e.target.value);
            });
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.clearSearch();
                }
            });
        }

        // Фильтр по категориям
        const categorySelect = document.getElementById('component-category');
        if (categorySelect) {
            categorySelect.addEventListener('change', (e) => {
                this.handleCategoryFilter(e.target.value);
            });
        }

        // События от core модуля
        if (this.core) {
            this.core.on?.('componentAdded', this.handleComponentAdded.bind(this));
            this.core.on?.('componentDeleted', this.handleComponentDeleted.bind(this));
        }

        console.log('✅ Event listeners setup completed');
    }

    /**
     * Настройка drag and drop функциональности
     */
    setupDragAndDrop() {
        if (!this.settings.enableDragDrop) return;

        console.log('🖱️ Setting up drag and drop...');

        // Обработчики будут добавлены при рендеринге компонентов
        document.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('component-item')) {
                this.handleDragStart(e);
            }
        });

        document.addEventListener('dragend', (e) => {
            if (e.target.classList.contains('component-item')) {
                this.handleDragEnd(e);
            }
        });

        console.log('✅ Drag and drop setup completed');
    }

    /**
     * Инициализация системы поиска
     */
    initializeSearch() {
        console.log('🔍 Initializing search system...');

        // Предустановленные фильтры
        this.searchFilters = {
            category: '',
            complexity: '',
            type: '',
            recent: false
        };

        // Индексирование для быстрого поиска
        this.searchIndex = this.buildSearchIndex();

        console.log('✅ Search system initialized');
    }

    /**
     * Построение индекса для поиска
     */
    buildSearchIndex() {
        const index = new Map();

        this.components.forEach((component, componentId) => {
            const searchable = [
                component.name.toLowerCase(),
                component.description.toLowerCase(),
                componentId.toLowerCase(),
                component.type.toLowerCase(),
                ...(component.searchKeywords || [])
            ].join(' ');

            index.set(componentId, searchable);
        });

        return index;
    }

    // =======================================================
    // РЕНДЕРИНГ КОМПОНЕНТОВ
    // =======================================================

    /**
     * Отрисовка библиотеки компонентов
     */
    renderComponentLibrary() {
        console.log('🎨 Rendering component library...');

        const startTime = performance.now();
        const libraryContainer = document.querySelector('.components-library');

        if (!libraryContainer) {
            console.warn('⚠️ Component library container not found');
            return;
        }

        // Очищаем контейнер
        libraryContainer.innerHTML = '';

        // Рендерим категории в порядке приоритета
        const sortedCategories = Array.from(this.categories.entries())
            .sort(([, a], [, b]) => a.order - b.order);

        sortedCategories.forEach(([categoryType, category]) => {
            if (category.isVisible && category.count > 0) {
                const categoryElement = this.renderCategory(categoryType, category);
                libraryContainer.appendChild(categoryElement);
            }
        });

        // Обновляем счетчики
        this.updateComponentCounts();

        const renderTime = performance.now() - startTime;
        this.lastRenderTime = renderTime;

        console.log(`✅ Component library rendered in ${renderTime.toFixed(2)}ms`);
    }

    /**
     * Отрисовка категории компонентов
     */
    renderCategory(categoryType, category) {
        const categoryElement = document.createElement('div');
        categoryElement.className = 'component-category';
        categoryElement.dataset.category = categoryType;

        // Заголовок категории
        const headerElement = this.createCategoryHeader(categoryType, category);
        categoryElement.appendChild(headerElement);

        // Контейнер для компонентов
        const componentsContainer = document.createElement('div');
        componentsContainer.className = 'category-components';

        if (!category.isExpanded) {
            componentsContainer.style.display = 'none';
        }

        // Рендерим компоненты категории
        const components = this.componentsByType.get(categoryType) || [];
        const visibleComponents = components.filter(component =>
            this.isComponentVisible(component.id)
        );

        visibleComponents.forEach(component => {
            const componentElement = this.renderComponent(component);
            componentsContainer.appendChild(componentElement);
        });

        categoryElement.appendChild(componentsContainer);
        return categoryElement;
    }

    /**
     * Создание заголовка категории
     */
    createCategoryHeader(categoryType, category) {
        const headerElement = document.createElement('div');
        headerElement.className = 'category-header';

        headerElement.innerHTML = `
            <div class="category-toggle" data-category="${categoryType}">
                <span class="category-icon" style="color: ${category.color}">${category.icon}</span>
                <span class="category-name">${category.name}</span>
                <span class="category-count">${category.count}</span>
                <span class="toggle-arrow ${category.isExpanded ? 'expanded' : ''}">${category.isExpanded ? '▼' : '▶'}</span>
            </div>
        `;

        // Добавляем обработчик переключения
        headerElement.addEventListener('click', () => {
            this.toggleCategoryExpansion(categoryType);
        });

        // Добавляем tooltip с описанием
        if (this.settings.showComponentTooltips) {
            headerElement.title = category.description;
        }

        return headerElement;
    }

    /**
     * Отрисовка компонента
     */
    renderComponent(component) {
        const componentElement = document.createElement('div');
        componentElement.className = 'component-item';
        componentElement.dataset.component = component.id;
        componentElement.dataset.type = component.type;
        componentElement.draggable = this.settings.enableDragDrop;

        // Определяем стили сложности
        const complexityClass = `complexity-${component.complexity}`;
        componentElement.classList.add(complexityClass);

        // Основное содержимое
        componentElement.innerHTML = `
            <div class="component-content">
                <div class="component-header">
                    <span class="component-icon">${component.icon}</span>
                    <div class="component-info">
                        <h4 class="component-name">${component.name}</h4>
                        <p class="component-description">${component.description}</p>
                    </div>
                </div>
                <div class="component-footer">
                    <span class="component-type-badge" data-type="${component.type}">
                        ${this.formatComponentType(component.type)}
                    </span>
                    <div class="component-stats">
                        <span class="usage-count" title="Использований">
                            📊 ${component.usageCount}
                        </span>
                    </div>
                </div>
                ${component.isExperimental ? '<div class="experimental-badge">⚠️ Экспериментальный</div>' : ''}
                ${component.isDeprecated ? '<div class="deprecated-badge">⚰️ Устарел</div>' : ''}
            </div>
        `;

        // Добавляем интерактивность
        this.addComponentInteractivity(componentElement, component);

        return componentElement;
    }

    /**
     * Добавление интерактивности к компоненту
     */
    addComponentInteractivity(element, component) {
        // Hover эффекты
        element.addEventListener('mouseenter', () => {
            this.showComponentTooltip(element, component);
        });

        element.addEventListener('mouseleave', () => {
            this.hideComponentTooltip();
        });

        // Клик для получения информации
        element.addEventListener('click', (e) => {
            if (!e.defaultPrevented) {
                this.showComponentDetails(component);
            }
        });

        // Двойной клик для быстрого добавления
        element.addEventListener('dblclick', (e) => {
            e.preventDefault();
            this.quickAddComponent(component.id);
        });

        // Правая кнопка мыши для контекстного меню
        element.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.showComponentContextMenu(component, e.clientX, e.clientY);
        });
    }

    // =======================================================
    // ПОИСК И ФИЛЬТРАЦИЯ
    // =======================================================

    /**
     * Обработка ввода в поиск
     */
    handleSearchInput(query) {
        this.searchQuery = query.toLowerCase().trim();

        // Debounce поиска для производительности
        this.debounce('search', () => {
            this.performSearch();
            this.trackSearchQuery(query);
        }, this.settings.searchDebounceTime);
    }

    /**
     * Выполнение поиска
     */
    performSearch() {
        console.log(`🔍 Performing search: "${this.searchQuery}"`);

        // Очищаем предыдущие результаты
        this.visibleComponents.clear();

        if (!this.searchQuery) {
            // Показываем все компоненты если поиск пустой
            this.components.forEach((component, componentId) => {
                this.visibleComponents.add(componentId);
            });
        } else {
            // Ищем по индексу
            this.searchIndex.forEach((searchable, componentId) => {
                if (searchable.includes(this.searchQuery)) {
                    this.visibleComponents.add(componentId);
                }
            });
        }

        // Применяем фильтр по категории
        if (this.selectedCategory) {
            const filteredComponents = new Set();
            this.visibleComponents.forEach(componentId => {
                const component = this.components.get(componentId);
                if (component && component.type === this.selectedCategory) {
                    filteredComponents.add(componentId);
                }
            });
            this.visibleComponents = filteredComponents;
        }

        // Перерисовываем библиотеку
        this.renderComponentLibrary();

        // Показываем результаты поиска
        this.displaySearchResults();
    }

    /**
     * Обработка фильтра по категории
     */
    handleCategoryFilter(category) {
        console.log(`📂 Applying category filter: ${category}`);

        this.selectedCategory = category;
        this.performSearch(); // Перевыполняем поиск с новым фильтром

        // Обновляем статистику
        if (category) {
            const categoryData = this.usageMetrics.categoryUsage.get(category) || { count: 0 };
            categoryData.count++;
            categoryData.lastUsed = Date.now();
            this.usageMetrics.categoryUsage.set(category, categoryData);
        }
    }

    /**
     * Проверка видимости компонента
     */
    isComponentVisible(componentId) {
        if (this.visibleComponents.size === 0) {
            return true; // Показываем все если нет фильтров
        }
        return this.visibleComponents.has(componentId);
    }

    /**
     * Очистка поиска
     */
    clearSearch() {
        this.searchQuery = '';
        this.selectedCategory = '';
        this.visibleComponents.clear();

        // Очищаем UI
        const searchInput = document.getElementById('component-search');
        const categorySelect = document.getElementById('component-category');

        if (searchInput) searchInput.value = '';
        if (categorySelect) categorySelect.value = '';

        // Перерисовываем
        this.renderComponentLibrary();

        console.log('🧹 Search cleared');
    }

    /**
     * Отображение результатов поиска
     */
    displaySearchResults() {
        const resultCount = this.visibleComponents.size;
        const totalCount = this.components.size;

        // Обновляем счетчик результатов
        const searchResults = document.querySelector('.search-results-info');
        if (searchResults) {
            if (this.searchQuery || this.selectedCategory) {
                searchResults.textContent = `Найдено ${resultCount} из ${totalCount} компонентов`;
                searchResults.style.display = 'block';
            } else {
                searchResults.style.display = 'none';
            }
        }

        // Подсвечиваем результаты поиска
        if (this.searchQuery) {
            this.highlightSearchResults();
        }
    }

    /**
     * Подсветка результатов поиска
     */
    highlightSearchResults() {
        const componentElements = document.querySelectorAll('.component-item');
        componentElements.forEach(element => {
            const componentId = element.dataset.component;
            if (this.visibleComponents.has(componentId)) {
                element.classList.add('search-highlighted');

                // Подсвечиваем текст
                const textElements = element.querySelectorAll('.component-name, .component-description');
                textElements.forEach(textElement => {
                    this.highlightText(textElement, this.searchQuery);
                });
            }
        });
    }

    /**
     * Подсветка текста в элементе
     */
    highlightText(element, query) {
        if (!query) return;

        const originalText = element.textContent;
        const regex = new RegExp(`(${this.escapeRegExp(query)})`, 'gi');
        const highlightedText = originalText.replace(regex, '<mark>$1</mark>');

        if (highlightedText !== originalText) {
            element.innerHTML = highlightedText;
        }
    }

    // =======================================================
    // DRAG AND DROP
    // =======================================================

    /**
     * Обработчик начала перетаскивания
     */
    handleDragStart(event) {
        const componentElement = event.target.closest('.component-item');
        const componentId = componentElement?.dataset.component;

        if (!componentId) return;

        const component = this.components.get(componentId);
        if (!component) return;

        // Устанавливаем данные для передачи
        event.dataTransfer.setData('text/plain', componentId);
        event.dataTransfer.setData('application/json', JSON.stringify({
            componentId,
            componentType: component.type,
            componentName: component.name
        }));

        // Визуальная обратная связь
        componentElement.style.opacity = '0.5';
        componentElement.classList.add('dragging');

        console.log(`🖱️ Started dragging component: ${componentId}`);

        // Уведомляем о начале drag
        this.emit('dragStart', { componentId, component });
    }

    /**
     * Обработчик окончания перетаскивания
     */
    handleDragEnd(event) {
        const componentElement = event.target.closest('.component-item');

        if (componentElement) {
            // Возвращаем стили
            componentElement.style.opacity = '1';
            componentElement.classList.remove('dragging');

            const componentId = componentElement.dataset.component;
            console.log(`✅ Ended dragging component: ${componentId}`);

            // Уведомляем об окончании drag
            this.emit('dragEnd', { componentId });
        }
    }

    // =======================================================
    // ИНТЕРАКТИВНОСТЬ КОМПОНЕНТОВ
    // =======================================================

    /**
     * Показ tooltip компонента
     */
    showComponentTooltip(element, component) {
        if (!this.settings.showComponentTooltips) return;

        let tooltip = document.querySelector('.component-tooltip');

        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.className = 'component-tooltip';
            document.body.appendChild(tooltip);
        }

        tooltip.innerHTML = `
            <div class="tooltip-header">
                <span class="tooltip-icon">${component.icon}</span>
                <strong>${component.name}</strong>
            </div>
            <div class="tooltip-content">
                <p>${component.description}</p>
                <div class="tooltip-stats">
                    <span class="stat-item">
                        <span class="stat-label">Тип:</span>
                        <span class="stat-value">${this.formatComponentType(component.type)}</span>
                    </span>
                    <span class="stat-item">
                        <span class="stat-label">Сложность:</span>
                        <span class="stat-value">${this.formatComplexity(component.complexity)}</span>
                    </span>
                    <span class="stat-item">
                        <span class="stat-label">Использований:</span>
                        <span class="stat-value">${component.usageCount}</span>
                    </span>
                </div>
                ${component.parameters ? `
                    <div class="tooltip-params">
                        <strong>Параметры:</strong>
                        <ul>
                            ${Object.keys(component.parameters).slice(0, 3).map(key =>
            `<li>${this.formatParameterName(key)}</li>`
        ).join('')}
                            ${Object.keys(component.parameters).length > 3 ?
                    `<li>и ещё ${Object.keys(component.parameters).length - 3}...</li>` : ''}
                        </ul>
                    </div>
                ` : ''}
            </div>
        `;

        // Позиционируем tooltip
        const rect = element.getBoundingClientRect();
        tooltip.style.cssText = `
            position: fixed;
            left: ${rect.right + 10}px;
            top: ${rect.top}px;
            max-width: 300px;
            background: var(--color-surface-elevated);
            border: 1px solid var(--color-border);
            border-radius: var(--radius-base);
            padding: var(--space-12);
            box-shadow: var(--shadow-lg);
            z-index: 1000;
            font-size: 0.875rem;
            line-height: 1.4;
        `;

        tooltip.classList.add('visible');
    }

    /**
     * Скрытие tooltip
     */
    hideComponentTooltip() {
        const tooltip = document.querySelector('.component-tooltip');
        if (tooltip) {
            tooltip.classList.remove('visible');
        }
    }

    /**
     * Показ деталей компонента
     */
    showComponentDetails(component) {
        console.log(`📋 Showing details for component: ${component.id}`);

        // Создаем модальное окно с деталями
        const modal = this.createComponentDetailsModal(component);
        document.body.appendChild(modal);

        // Показываем модальное окно
        requestAnimationFrame(() => {
            modal.classList.add('visible');
        });

        // Обновляем метрики
        this.trackComponentInteraction(component.id, 'details_viewed');
    }

    /**
     * Создание модального окна с деталями компонента
     */
    createComponentDetailsModal(component) {
        const modal = document.createElement('div');
        modal.className = 'component-details-modal';

        modal.innerHTML = `
            <div class="modal-backdrop"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <div class="modal-title">
                        <span class="component-icon-large">${component.icon}</span>
                        <div>
                            <h3>${component.name}</h3>
                            <p class="component-category">${this.formatComponentType(component.type)}</p>
                        </div>
                    </div>
                    <button class="modal-close">×</button>
                </div>
                
                <div class="modal-body">
                    <div class="component-overview">
                        <p class="component-description-full">${component.description}</p>
                        
                        <div class="component-metrics">
                            <div class="metric-item">
                                <span class="metric-label">Сложность</span>
                                <span class="metric-value complexity-${component.complexity}">
                                    ${this.formatComplexity(component.complexity)}
                                </span>
                            </div>
                            <div class="metric-item">
                                <span class="metric-label">Использований</span>
                                <span class="metric-value">${component.usageCount}</span>
                            </div>
                            <div class="metric-item">
                                <span class="metric-label">Последнее использование</span>
                                <span class="metric-value">
                                    ${component.lastUsed ? new Date(component.lastUsed).toLocaleDateString() : 'Никогда'}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    ${this.generateParametersSection(component)}
                    
                    <div class="component-actions">
                        <button class="btn btn--primary" onclick="signatureComponentsManager.quickAddComponent('${component.id}')">
                            <span class="btn-icon">➕</span>
                            Добавить на холст
                        </button>
                        <button class="btn btn--secondary" onclick="signatureComponentsManager.copyComponentInfo('${component.id}')">
                            <span class="btn-icon">📋</span>
                            Копировать информацию
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Обработчики закрытия
        modal.querySelector('.modal-close').addEventListener('click', () => {
            this.closeModal(modal);
        });

        modal.querySelector('.modal-backdrop').addEventListener('click', () => {
            this.closeModal(modal);
        });

        return modal;
    }

    /**
     * Генерация секции параметров
     */
    generateParametersSection(component) {
        if (!component.parameters || Object.keys(component.parameters).length === 0) {
            return '<div class="no-parameters">Этот компонент не имеет настраиваемых параметров</div>';
        }

        let html = '<div class="component-parameters"><h4>Параметры компонента</h4><div class="parameters-list">';

        Object.entries(component.parameters).forEach(([key, config]) => {
            const isRequired = config.required ? '<span class="required-mark">*</span>' : '';
            const defaultValue = config.default !== undefined ? config.default : 'Не задано';

            html += `
                <div class="parameter-item">
                    <div class="parameter-header">
                        <strong>${this.formatParameterName(key)}</strong>${isRequired}
                        <span class="parameter-type">${config.type}</span>
                    </div>
                    <div class="parameter-description">${config.description || 'Описание отсутствует'}</div>
                    <div class="parameter-default">
                        <span class="parameter-label">По умолчанию:</span>
                        <code>${defaultValue}</code>
                    </div>
                    ${config.options ? `
                        <div class="parameter-options">
                            <span class="parameter-label">Варианты:</span>
                            <span class="options-list">${config.options.join(', ')}</span>
                        </div>
                    ` : ''}
                </div>
            `;
        });

        html += '</div></div>';
        return html;
    }

    /**
     * Быстрое добавление компонента
     */
    quickAddComponent(componentId) {
        console.log(`⚡ Quick adding component: ${componentId}`);

        const component = this.components.get(componentId);
        if (!component) {
            console.warn(`⚠️ Component not found: ${componentId}`);
            return;
        }

        // Добавляем компонент в центр canvas
        const canvas = document.getElementById('rule-canvas');
        if (canvas && this.core?.addComponentToCanvas) {
            const rect = canvas.getBoundingClientRect();
            const x = rect.width / 2;
            const y = rect.height / 2;

            this.core.addComponentToCanvas(componentId, x, y);

            // Обновляем метрики
            this.updateComponentUsage(componentId);

            // Уведомляем о добавлении
            this.emit('componentQuickAdded', { componentId, component });
        }
    }

    /**
     * Копирование информации о компоненте
     */
    copyComponentInfo(componentId) {
        const component = this.components.get(componentId);
        if (!component) return;

        const info = `
Компонент: ${component.name}
Тип: ${this.formatComponentType(component.type)}
Описание: ${component.description}
Сложность: ${this.formatComplexity(component.complexity)}
Параметры: ${Object.keys(component.parameters || {}).length}
        `.trim();

        navigator.clipboard.writeText(info).then(() => {
            console.log('📋 Component info copied to clipboard');
            // Показываем уведомление
            if (window.app?.showSuccessNotification) {
                window.app.showSuccessNotification('Информация скопирована в буфер обмена');
            }
        });
    }

    // =======================================================
    // УПРАВЛЕНИЕ КАТЕГОРИЯМИ
    // =======================================================

    /**
     * Переключение развернутости категории
     */
    toggleCategoryExpansion(categoryType) {
        const category = this.categories.get(categoryType);
        if (!category) return;

        category.isExpanded = !category.isExpanded;

        // Обновляем UI
        const categoryElement = document.querySelector(`[data-category="${categoryType}"]`);
        if (categoryElement) {
            const componentsContainer = categoryElement.querySelector('.category-components');
            const toggleArrow = categoryElement.querySelector('.toggle-arrow');

            if (category.isExpanded) {
                componentsContainer.style.display = '';
                toggleArrow.textContent = '▼';
                toggleArrow.classList.add('expanded');
            } else {
                componentsContainer.style.display = 'none';
                toggleArrow.textContent = '▶';
                toggleArrow.classList.remove('expanded');
            }
        }

        console.log(`📂 Toggled category ${categoryType}: ${category.isExpanded ? 'expanded' : 'collapsed'}`);
    }

    /**
     * Показ/скрытие категории
     */
    toggleCategoryVisibility(categoryType, visible = null) {
        const category = this.categories.get(categoryType);
        if (!category) return;

        category.isVisible = visible !== null ? visible : !category.isVisible;

        // Перерисовываем библиотеку
        this.renderComponentLibrary();

        console.log(`👁️ Category ${categoryType} visibility: ${category.isVisible}`);
    }

    // =======================================================
    // МЕТРИКИ И АНАЛИТИКА
    // =======================================================

    /**
     * Обновление метрик использования компонента
     */
    updateComponentUsage(componentId) {
        const component = this.components.get(componentId);
        if (!component) return;

        // Обновляем счетчик использования
        component.usageCount++;
        component.lastUsed = Date.now();

        // Обновляем популярные компоненты
        this.usageMetrics.popularComponents.set(componentId, component.usageCount);

        // Обновляем список недавно использованных
        this.usageMetrics.recentlyUsed = this.usageMetrics.recentlyUsed.filter(id => id !== componentId);
        this.usageMetrics.recentlyUsed.unshift(componentId);

        if (this.usageMetrics.recentlyUsed.length > this.settings.maxRecentComponents) {
            this.usageMetrics.recentlyUsed.pop();
        }

        console.log(`📊 Updated usage for component: ${componentId} (${component.usageCount} uses)`);
    }

    /**
     * Отслеживание взаимодействий с компонентом
     */
    trackComponentInteraction(componentId, interactionType) {
        const timestamp = Date.now();

        // Здесь можно добавить отправку аналитики
        console.log(`📊 Component interaction: ${componentId} - ${interactionType}`);

        this.emit('componentInteraction', {
            componentId,
            interactionType,
            timestamp
        });
    }

    /**
     * Отслеживание поисковых запросов
     */
    trackSearchQuery(query) {
        if (!query.trim()) return;

        this.usageMetrics.searchQueries.push({
            query: query.trim(),
            timestamp: Date.now(),
            resultCount: this.visibleComponents.size
        });

        // Ограничиваем историю поиска
        if (this.usageMetrics.searchQueries.length > 100) {
            this.usageMetrics.searchQueries.shift();
        }
    }

    /**
     * Получение популярных компонентов
     */
    getPopularComponents(limit = 5) {
        return Array.from(this.usageMetrics.popularComponents.entries())
            .sort(([, a], [, b]) => b - a)
            .slice(0, limit)
            .map(([componentId, count]) => ({
                id: componentId,
                component: this.components.get(componentId),
                usageCount: count
            }));
    }

    /**
     * Получение недавно использованных компонентов
     */
    getRecentComponents() {
        return this.usageMetrics.recentlyUsed
            .map(componentId => ({
                id: componentId,
                component: this.components.get(componentId)
            }))
            .filter(item => item.component);
    }

    // =======================================================
    // ОБРАБОТЧИКИ СОБЫТИЙ
    // =======================================================

    /**
     * Обработчик добавления компонента
     */
    handleComponentAdded(data) {
        const { componentId } = data;
        this.updateComponentUsage(componentId);
        this.updateComponentCounts();
    }

    /**
     * Обработчик удаления компонента
     */
    handleComponentDeleted(data) {
        const { componentId } = data;
        console.log(`🗑️ Component deleted from canvas: ${componentId}`);

        // Обновляем счетчики
        this.updateComponentCounts();
    }

    // =======================================================
    // УТИЛИТАРНЫЕ МЕТОДЫ
    // =======================================================

    /**
     * Получение порядка отображения компонента
     */
    getComponentDisplayOrder(type) {
        const orders = {
            'network': 100,
            'file': 200,
            'content': 300,
            'behavioral': 400,
            'temporal': 500
        };
        return orders[type] || 999;
    }

    /**
     * Генерация ключевых слов для поиска
     */
    generateSearchKeywords(definition) {
        const keywords = [];

        // Добавляем синонимы на основе типа
        const synonyms = {
            'network': ['сеть', 'ip', 'протокол', 'трафик'],
            'file': ['файл', 'документ', 'хеш', 'pe'],
            'content': ['содержимое', 'текст', 'строка', 'regex'],
            'behavioral': ['поведение', 'анализ', 'статистика'],
            'temporal': ['время', 'период', 'расписание']
        };

        if (synonyms[definition.type]) {
            keywords.push(...synonyms[definition.type]);
        }

        // Добавляем ключевые слова из параметров
        if (definition.parameters) {
            Object.keys(definition.parameters).forEach(param => {
                keywords.push(param.toLowerCase());
            });
        }

        return keywords;
    }

    /**
     * Вычисление сложности компонента
     */
    calculateComponentComplexity(definition) {
        let complexity = 1; // базовая сложность

        // Увеличиваем сложность на основе параметров
        if (definition.parameters) {
            const paramCount = Object.keys(definition.parameters).length;
            complexity += Math.floor(paramCount / 3);
        }

        // Специальные случаи
        if (definition.type === 'behavioral') complexity += 1;
        if (definition.validation) complexity += 1;

        if (complexity <= 2) return 'simple';
        if (complexity <= 4) return 'medium';
        return 'complex';
    }

    /**
     * Форматирование типа компонента
     */
    formatComponentType(type) {
        const typeNames = {
            'network': 'Сетевой',
            'file': 'Файловый',
            'content': 'Контентный',
            'behavioral': 'Поведенческий',
            'temporal': 'Временной'
        };
        return typeNames[type] || type;
    }

    /**
     * Форматирование сложности
     */
    formatComplexity(complexity) {
        const complexityNames = {
            'simple': 'Простая',
            'medium': 'Средняя',
            'complex': 'Сложная'
        };
        return complexityNames[complexity] || complexity;
    }

    /**
     * Форматирование имени параметра
     */
    formatParameterName(paramName) {
        return paramName.split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    /**
     * Обновление счетчиков компонентов
     */
    updateComponentCounts() {
        // Обновляем счетчики в UI
        const totalCount = this.components.size;
        const visibleCount = this.visibleComponents.size || totalCount;

        document.querySelectorAll('[data-stat="components-total"]').forEach(el => {
            el.textContent = totalCount;
        });

        document.querySelectorAll('[data-stat="components-visible"]').forEach(el => {
            el.textContent = visibleCount;
        });

        // Обновляем счетчики категорий
        this.categories.forEach((category, type) => {
            const categoryElement = document.querySelector(`[data-category="${type}"] .category-count`);
            if (categoryElement) {
                const visibleInCategory = category.components.filter(id =>
                    this.isComponentVisible(id)
                ).length;
                categoryElement.textContent = visibleInCategory;
            }
        });
    }

    /**
     * Показ контекстного меню компонента
     */
    showComponentContextMenu(component, x, y) {
        const menuItems = [
            {
                label: 'Добавить на холст',
                icon: '➕',
                action: () => this.quickAddComponent(component.id)
            },
            {
                label: 'Показать детали',
                icon: '📋',
                action: () => this.showComponentDetails(component)
            },
            { separator: true },
            {
                label: 'Копировать ID',
                icon: '📄',
                action: () => {
                    navigator.clipboard.writeText(component.id);
                    console.log(`📋 Copied component ID: ${component.id}`);
                }
            },
            {
                label: 'Копировать информацию',
                icon: '📋',
                action: () => this.copyComponentInfo(component.id)
            }
        ];

        // Создаем контекстное меню (упрощенная версия)
        console.log(`🖱️ Context menu for ${component.name} at (${x}, ${y})`);

        // Здесь можно добавить полную реализацию контекстного меню
        // Пока просто показываем детали
        this.showComponentDetails(component);
    }

    /**
     * Экранирование регулярного выражения
     */
    escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    /**
     * Debounce функция
     */
    debounce(key, func, wait) {
        if (this.debounceTimers.has(key)) {
            clearTimeout(this.debounceTimers.get(key));
        }

        const timer = setTimeout(() => {
            func();
            this.debounceTimers.delete(key);
        }, wait);

        this.debounceTimers.set(key, timer);
    }

    /**
     * Закрытие модального окна
     */
    closeModal(modal) {
        modal.classList.remove('visible');
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }, 300);
    }

    /**
     * Получение статистики компонентов
     */
    getComponentsStats() {
        return {
            total: this.components.size,
            byCategory: Array.from(this.categories.entries()).map(([type, category]) => ({
                type,
                name: category.name,
                count: category.count
            })),
            byComplexity: {
                simple: Array.from(this.components.values()).filter(c => c.complexity === 'simple').length,
                medium: Array.from(this.components.values()).filter(c => c.complexity === 'medium').length,
                complex: Array.from(this.components.values()).filter(c => c.complexity === 'complex').length
            },
            usage: {
                popular: this.getPopularComponents(),
                recent: this.getRecentComponents(),
                totalUsage: Array.from(this.components.values()).reduce((sum, c) => sum + c.usageCount, 0)
            },
            search: {
                totalQueries: this.usageMetrics.searchQueries.length,
                recentQueries: this.usageMetrics.searchQueries.slice(-10)
            }
        };
    }

    // =======================================================
    // СИСТЕМА СОБЫТИЙ
    // =======================================================

    /**
     * Подписка на событие
     */
    on(event, handler) {
        if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, []);
        }
        this.eventHandlers.get(event).push(handler);
    }

    /**
     * Отписка от события
     */
    off(event, handler) {
        if (this.eventHandlers.has(event)) {
            const handlers = this.eventHandlers.get(event);
            const index = handlers.indexOf(handler);
            if (index > -1) {
                handlers.splice(index, 1);
            }
        }
    }

    /**
     * Генерация события
     */
    emit(event, data) {
        if (this.eventHandlers.has(event)) {
            this.eventHandlers.get(event).forEach(handler => {
                try {
                    handler(data);
                } catch (error) {
                    console.error(`Error in event handler for ${event}:`, error);
                }
            });
        }
    }

    // =======================================================
    // МЕТОДЫ ЖИЗНЕННОГО ЦИКЛА
    // =======================================================

    /**
     * Активация Components Manager
     */
    activate() {
        if (!this.isInitialized) {
            console.warn('⚠️ Components Manager not initialized');
            return;
        }

        // Перерисовываем библиотеку
        this.renderComponentLibrary();

        console.log('🟢 Signature Components Manager activated');
        this.emit('activated');
    }

    /**
     * Деактивация Components Manager
     */
    deactivate() {
        // Скрываем tooltip
        this.hideComponentTooltip();

        console.log('🟡 Signature Components Manager deactivated');
        this.emit('deactivated');
    }

    /**
     * Очистка ресурсов
     */
    cleanup() {
        console.log('🧹 Cleaning up Signature Components Manager...');

        try {
            // Очищаем таймеры
            this.debounceTimers.forEach(timer => clearTimeout(timer));
            this.debounceTimers.clear();

            // Скрываем tooltip
            this.hideComponentTooltip();

            // Очищаем кэши
            this.renderCache.clear();
            this.searchCache.clear();

            // Очищаем обработчики событий
            this.eventHandlers.clear();

            // Очищаем данные
            this.components.clear();
            this.categories.clear();
            this.componentsByType.clear();
            this.visibleComponents.clear();

            // Сбрасываем состояние
            this.isInitialized = false;
            this.searchQuery = '';
            this.selectedCategory = '';

            console.log('✅ Signature Components Manager cleanup completed');

        } catch (error) {
            console.error('❌ Error during Components Manager cleanup:', error);
        }
    }
}

// =======================================================
// ЭКСПОРТ И ГЛОБАЛЬНАЯ ИНТЕГРАЦИЯ
// =======================================================

/**
 * Глобальная функция создания Components Manager
 */
function createSignatureComponentsManager(coreInstance) {
    return new SignatureComponentsManager(coreInstance);
}

// Экспорт для модульных систем
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        SignatureComponentsManager,
        createSignatureComponentsManager
    };
}

// ES6 экспорты
if (typeof window !== 'undefined') {
    window.SignatureComponentsManager = SignatureComponentsManager;
    window.createSignatureComponentsManager = createSignatureComponentsManager;

    // Для интеграции с модульной системой attack-constructor
    window.SignatureComponentsExports = {
        SignatureComponentsManager,
        createSignatureComponentsManager,
        version: '4.0.0-Enhanced-Components'
    };

    // Глобальный экземпляр для HTML интеграции
    window.signatureComponentsManager = null;
}

console.log('✅ Signature Components Manager v4.0.0-Enhanced loaded successfully');

/**
 * =======================================================
 * КОНЕЦ ФАЙЛА signature-components.js
 * 
 * IP Roast Enterprise 4.0 - Signature Components Manager Module
 * Специализированный модуль для управления библиотекой компонентов
 * Версия: 4.0.0-Enhanced-Components
 * 
 * Ключевые возможности:
 * - Управление библиотекой компонентов сигнатурного анализа
 * - Интеллектуальный поиск и фильтрация компонентов
 * - Категоризация и группировка по типам
 * - Drag & Drop интерфейс с визуальной обратной связью
 * - Детальная информация о компонентах с модальными окнами
 * - Метрики использования и аналитика популярности
 * - Система tooltip и контекстных меню
 * - Быстрое добавление компонентов на canvas
 * - Интеграция с модульной архитектурой attack-constructor
 * - Enterprise-уровень производительности и надежности
 * =======================================================
 */
