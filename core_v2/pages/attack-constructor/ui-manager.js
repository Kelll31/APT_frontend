/**
 * IP Roast Enterprise 4.0 - UI Manager Module
 * Управление пользовательским интерфейсом конструктора правил
 * Версия: 4.0.0-Enhanced-UI
 * 
 * @description Специализированный модуль для управления всем пользовательским интерфейсом
 * @author IP Roast Security Team
 * @requires attack-constructor-core.js, canvas-manager.js, connection-manager.js
 * @integrates signature-components, rule-generator, test-manager
 */

console.log('🎨 Loading UI Manager v4.0.0-Enhanced');

/**
 * Основной класс для управления пользовательским интерфейсом
 */
class UIManager {
    constructor(coreInstance) {
        this.version = '4.0.0-Enhanced-UI';
        this.core = coreInstance;
        this.isInitialized = false;

        // Состояние UI
        this.currentTab = 'properties';
        this.activeModals = new Set();
        this.notifications = [];
        this.searchQuery = '';
        this.selectedCategory = '';

        // Элементы DOM
        this.elements = new Map();
        this.forms = new Map();
        this.modals = new Map();

        // Настройки UI
        this.settings = {
            animationDuration: 300,
            notificationTimeout: 5000,
            searchDebounceTime: 300,
            maxNotifications: 5,
            autoSave: true,
            theme: 'default'
        };

        // События и обработчики
        this.eventHandlers = new Map();
        this.debounceTimers = new Map();
        this.animationQueue = [];

        // Статистика и метрики
        this.metrics = {
            tabSwitches: 0,
            searchQueries: 0,
            modalOpens: 0,
            formSubmissions: 0,
            lastActivity: Date.now()
        };

        console.log('🎨 UI Manager initialized');
    }

    /**
     * Инициализация UI Manager
     */
    async initialize() {
        try {
            console.log('🚀 Initializing UI Manager...');

            this.cacheUIElements();
            this.setupTabSystem();
            this.setupModalSystem();
            this.setupFormHandlers();
            this.setupSearchAndFilters();
            this.setupNotificationSystem();
            this.setupKeyboardShortcuts();
            this.setupAccessibility();
            this.initializeTheme();

            this.isInitialized = true;
            console.log('✅ UI Manager initialized successfully');

        } catch (error) {
            console.error('❌ UI Manager initialization failed:', error);
            throw error;
        }
    }

    /**
     * Кэширование элементов DOM для быстрого доступа
     */
    cacheUIElements() {
        const elementSelectors = {
            // Основные контейнеры
            constructorLayout: '.signature-constructor-layout',
            topRow: '.constructor-top-row',
            librarySection: '.components-library-section',
            propertiesSection: '.properties-testing-section',
            constructorSection: '.rule-constructor-section',

            // Вкладки
            tabButtons: '.tab-button',
            tabContents: '.tab-content',
            propertiesTab: '#tab-properties',
            testingTab: '#tab-testing',
            outputTab: '#tab-output',

            // Библиотека компонентов
            componentSearch: '#component-search',
            categoryFilter: '#component-category',
            componentCategories: '.component-category',
            componentItems: '.component-item',

            // Canvas и конструктор
            ruleCanvas: '#rule-canvas',
            canvasEmpty: '#canvas-empty',
            logicExpression: '#logic-expression',

            // Формы и элементы управления
            ruleName: '#rule-name',
            ruleType: '#rule-type',
            rulePriority: '#rule-priority',
            outputFormat: '#output-format',
            ruleOutput: '#rule-output',

            // Модальные окна
            templatesModal: '#templates-modal',
            configModal: '#component-config-modal',

            // Статистика и индикаторы
            componentsCount: '#components-count',
            connectionsCount: '#connections-count',
            ruleComplexity: '#rule-complexity',

            // Тестирование
            testDataSource: '#test-data-source',
            testInput: '#test-input',
            testResults: '#test-results'
        };

        // Кэшируем элементы с проверкой существования
        Object.entries(elementSelectors).forEach(([key, selector]) => {
            const element = typeof selector === 'string' ?
                document.querySelector(selector) :
                selector;

            if (element) {
                this.elements.set(key, element);
            } else {
                console.warn(`⚠️ UI element not found: ${key} (${selector})`);
            }
        });

        console.log(`📦 Cached ${this.elements.size} UI elements`);
    }

    /**
     * Настройка системы вкладок
     */
    setupTabSystem() {
        const tabButtons = this.elements.get('tabButtons');
        if (!tabButtons) return;

        // Привязываем обработчики к кнопкам вкладок
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const tabName = this.extractTabName(e.target);
                this.switchTab(tabName, true);
            });
        });

        // Инициализируем первую вкладку
        this.switchTab(this.currentTab, false);

        console.log('📑 Tab system initialized');
    }

    /**
     * Извлечение имени вкладки из элемента
     */
    extractTabName(element) {
        const id = element.id || element.closest('.tab-button')?.id;
        return id ? id.replace('tab-', '') : 'properties';
    }

    /**
     * Переключение вкладок с анимацией
     */
    switchTab(tabName, animated = true) {
        if (tabName === this.currentTab && animated) return;

        const tabButton = document.getElementById(`tab-${tabName}`);
        const tabContent = document.getElementById(`tab-content-${tabName}`);

        if (!tabButton || !tabContent) {
            console.warn(`⚠️ Tab not found: ${tabName}`);
            return;
        }

        // Деактивируем все вкладки
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
        });

        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });

        // Активируем выбранную вкладку
        if (animated) {
            this.animateTabSwitch(tabButton, tabContent);
        } else {
            tabButton.classList.add('active');
            tabContent.classList.add('active');
        }

        const previousTab = this.currentTab;
        this.currentTab = tabName;

        // Обновляем контент вкладки
        this.updateTabContent(tabName);

        // Уведомляем о переключении
        this.emit('tabSwitched', {
            from: previousTab,
            to: tabName
        });

        // Обновляем метрики
        this.metrics.tabSwitches++;
        this.updateActivity();

        console.log(`📑 Switched to tab: ${tabName}`);
    }

    /**
     * Анимация переключения вкладок
     */
    animateTabSwitch(tabButton, tabContent) {
        // Добавляем в очередь анимации
        this.addToAnimationQueue(() => {
            return new Promise(resolve => {
                tabButton.style.transition = `all ${this.settings.animationDuration}ms var(--ease-standard)`;
                tabContent.style.transition = `all ${this.settings.animationDuration}ms var(--ease-standard)`;

                tabButton.classList.add('active');
                tabContent.classList.add('active');

                setTimeout(resolve, this.settings.animationDuration);
            });
        });
    }

    /**
     * Обновление содержимого вкладки
     */
    updateTabContent(tabName) {
        switch (tabName) {
            case 'properties':
                this.updatePropertiesTab();
                break;
            case 'testing':
                this.updateTestingTab();
                break;
            case 'output':
                this.updateOutputTab();
                break;
        }
    }

    /**
     * Обновление вкладки свойств
     */
    updatePropertiesTab() {
        const propertiesContainer = document.getElementById('selected-component');
        if (!propertiesContainer) return;

        const selectedComponent = this.core?.selectedComponent;

        if (!selectedComponent) {
            propertiesContainer.innerHTML = this.generateNoSelectionHTML();
        } else {
            propertiesContainer.innerHTML = this.generatePropertiesHTML(selectedComponent);
            this.setupPropertyControls(selectedComponent);
        }
    }

    /**
     * Генерация HTML для состояния "нет выбора"
     */
    generateNoSelectionHTML() {
        return `
            <div class="no-selection">
                <div class="no-selection-icon">🎯</div>
                <h4>Компонент не выбран</h4>
                <p>Выберите компонент на холсте для настройки его параметров</p>
                <div class="selection-tips">
                    <div class="tip-item">
                        <span class="tip-icon">💡</span>
                        <span>Кликните по компоненту на canvas</span>
                    </div>
                    <div class="tip-item">
                        <span class="tip-icon">⚙️</span>
                        <span>Используйте контекстное меню для быстрых действий</span>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Генерация HTML для свойств компонента
     */
    generatePropertiesHTML(component) {
        const definition = component.definition;
        const parameters = component.parameters;

        let html = `
            <div class="component-properties">
                <div class="component-info-card">
                    <div class="component-header">
                        <div class="component-icon-large">${definition.icon}</div>
                        <div class="component-details">
                            <h4 class="component-title">${definition.name}</h4>
                            <p class="component-description">${definition.description}</p>
                            <div class="component-meta">
                                <span class="component-type-badge" data-type="${definition.type}">
                                    ${definition.type}
                                </span>
                                <span class="component-id">ID: ${component.id}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="properties-form">
                    <h5 class="form-section-title">
                        <span class="section-icon">⚙️</span>
                        Параметры компонента
                    </h5>
        `;

        // Генерируем поля параметров
        Object.entries(definition.parameters || {}).forEach(([key, config]) => {
            const value = parameters[key] || config.default || '';
            html += this.generateParameterField(key, config, value, component.id);
        });

        html += `
                </div>
                
                <div class="properties-actions">
                    <div class="action-buttons">
                        <button class="btn btn--primary btn--sm" onclick="uiManager.applyComponentChanges('${component.id}')">
                            <span class="btn-icon">✅</span>
                            Применить изменения
                        </button>
                        <button class="btn btn--secondary btn--sm" onclick="uiManager.resetComponentParameters('${component.id}')">
                            <span class="btn-icon">🔄</span>
                            Сброс
                        </button>
                        <button class="btn btn--danger btn--sm" onclick="uiManager.deleteComponent('${component.id}')">
                            <span class="btn-icon">🗑️</span>
                            Удалить
                        </button>
                    </div>
                    
                    <div class="properties-info">
                        <div class="info-item">
                            <span class="info-label">Создан:</span>
                            <span class="info-value">${new Date(component.metadata?.created || Date.now()).toLocaleString()}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Изменен:</span>
                            <span class="info-value">${new Date(component.metadata?.updated || Date.now()).toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        return html;
    }

    /**
     * Генерация поля параметра
     */
    generateParameterField(key, config, value, componentId) {
        const fieldId = `param-${componentId}-${key}`;
        const isRequired = config.required ? 'required' : '';
        const requiredMark = config.required ? '<span class="required-mark">*</span>' : '';

        let html = `
            <div class="form-group parameter-field" data-parameter="${key}">
                <label class="form-label" for="${fieldId}">
                    ${this.formatParameterLabel(key)}${requiredMark}
                </label>
        `;

        switch (config.type) {
            case 'select':
                html += `
                    <select class="form-control parameter-input" id="${fieldId}" data-param="${key}" ${isRequired}>
                        ${config.options.map(option =>
                    `<option value="${option}" ${value === option ? 'selected' : ''}>${option}</option>`
                ).join('')}
                    </select>
                `;
                break;

            case 'boolean':
                const checked = value ? 'checked' : '';
                html += `
                    <div class="checkbox-wrapper">
                        <input type="checkbox" class="form-control parameter-input" id="${fieldId}" 
                               data-param="${key}" ${checked}>
                        <label class="checkbox-label" for="${fieldId}">
                            <span class="checkbox-indicator"></span>
                            <span class="checkbox-text">${config.description || 'Включить опцию'}</span>
                        </label>
                    </div>
                `;
                break;

            case 'number':
                html += `
                    <input type="number" class="form-control parameter-input" id="${fieldId}" 
                           data-param="${key}" value="${value}" ${isRequired}
                           ${config.min !== undefined ? `min="${config.min}"` : ''}
                           ${config.max !== undefined ? `max="${config.max}"` : ''}
                           ${config.step !== undefined ? `step="${config.step}"` : ''}>
                `;
                break;

            case 'datetime':
                html += `
                    <input type="time" class="form-control parameter-input" id="${fieldId}" 
                           data-param="${key}" value="${value}" ${isRequired}>
                `;
                break;

            case 'array':
                const arrayValue = Array.isArray(value) ? value.join(', ') : value;
                html += `
                    <textarea class="form-control parameter-input" id="${fieldId}" 
                              data-param="${key}" rows="3" ${isRequired}
                              placeholder="Введите значения через запятую">${arrayValue}</textarea>
                `;
                break;

            default: // string и другие
                html += `
                    <input type="text" class="form-control parameter-input" id="${fieldId}" 
                           data-param="${key}" value="${value}" ${isRequired}
                           placeholder="${config.placeholder || ''}">
                `;
        }

        if (config.description) {
            html += `<small class="form-help">${config.description}</small>`;
        }

        if (config.unit) {
            html += `<small class="form-unit">Единица: ${config.unit}</small>`;
        }

        html += '</div>';
        return html;
    }

    /**
     * Форматирование названия параметра
     */
    formatParameterLabel(key) {
        return key.split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    /**
     * Настройка контролов свойств
     */
    setupPropertyControls(component) {
        // Привязываем обработчики изменений параметров
        document.querySelectorAll('.parameter-input').forEach(input => {
            input.addEventListener('change', (e) => {
                this.handleParameterChange(e, component.id);
            });

            input.addEventListener('input', (e) => {
                this.handleParameterInput(e, component.id);
            });
        });
    }

    /**
     * Обработчик изменения параметра
     */
    handleParameterChange(event, componentId) {
        const paramName = event.target.dataset.param;
        let value = event.target.value;

        // Обрабатываем разные типы данных
        if (event.target.type === 'checkbox') {
            value = event.target.checked;
        } else if (event.target.type === 'number') {
            value = parseFloat(value) || 0;
        } else if (event.target.closest('[data-parameter]')?.querySelector('textarea')) {
            // Для массивов
            value = value.split(',').map(v => v.trim()).filter(v => v);
        }

        // Обновляем компонент
        this.updateComponentParameter(componentId, paramName, value);

        console.log(`🔧 Parameter changed: ${componentId}.${paramName} = ${value}`);
    }

    /**
     * Обработчик ввода в параметр (для debounce)
     */
    handleParameterInput(event, componentId) {
        const paramName = event.target.dataset.param;

        // Debounce для предотвращения частых обновлений
        this.debounce(`param-${componentId}-${paramName}`, () => {
            this.validateParameter(componentId, paramName, event.target.value);
        }, this.settings.searchDebounceTime);
    }

    /**
     * Обновление параметра компонента
     */
    updateComponentParameter(componentId, paramName, value) {
        if (!this.core?.canvasNodes) return;

        const component = this.core.canvasNodes.get(componentId);
        if (!component) return;

        // Валидируем новое значение
        if (!this.validateParameterValue(component, paramName, value)) {
            this.showValidationError(`Неверное значение параметра "${this.formatParameterLabel(paramName)}"`);
            return;
        }

        // Обновляем параметр
        component.parameters[paramName] = value;
        component.metadata.updated = new Date().toISOString();

        // Помечаем как измененный
        this.markComponentAsModified(componentId);

        // Уведомляем об изменении
        this.emit('parameterChanged', {
            componentId,
            paramName,
            value,
            component
        });

        // Автосохранение
        if (this.settings.autoSave) {
            this.debounce('autosave', () => {
                this.core?.saveCurrentState?.();
            }, 2000);
        }
    }

    /**
     * Валидация значения параметра
     */
    validateParameterValue(component, paramName, value) {
        const definition = component.definition;
        const paramConfig = definition.parameters[paramName];

        if (!paramConfig) return false;

        // Проверка обязательных параметров
        if (paramConfig.required && (!value && value !== 0 && value !== false)) {
            return false;
        }

        // Валидация через функцию компонента
        if (definition.validation) {
            const testParams = { ...component.parameters, [paramName]: value };
            return definition.validation(testParams);
        }

        return true;
    }

    /**
     * Валидация параметра (визуальная обратная связь)
     */
    validateParameter(componentId, paramName, value) {
        const component = this.core?.canvasNodes?.get(componentId);
        if (!component) return;

        const fieldId = `param-${componentId}-${paramName}`;
        const input = document.getElementById(fieldId);
        if (!input) return;

        const isValid = this.validateParameterValue(component, paramName, value);

        // Обновляем визуальное состояние
        input.classList.toggle('invalid', !isValid);
        input.classList.toggle('valid', isValid);

        // Показываем/скрываем сообщение об ошибке
        const existingError = input.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }

        if (!isValid && value) {
            const errorMessage = document.createElement('small');
            errorMessage.className = 'field-error';
            errorMessage.textContent = `Некорректное значение для "${this.formatParameterLabel(paramName)}"`;
            input.parentNode.appendChild(errorMessage);
        }
    }

    /**
     * Применение изменений компонента
     */
    applyComponentChanges(componentId) {
        const component = this.core?.canvasNodes?.get(componentId);
        if (!component) return;

        // Собираем все параметры из формы
        const newParameters = {};
        let hasErrors = false;

        document.querySelectorAll('.parameter-input').forEach(input => {
            const paramName = input.dataset.param;
            let value = input.value;

            // Обрабатываем типы данных
            if (input.type === 'checkbox') {
                value = input.checked;
            } else if (input.type === 'number') {
                value = parseFloat(value) || 0;
            }

            // Валидируем значение
            if (!this.validateParameterValue(component, paramName, value)) {
                hasErrors = true;
                input.classList.add('invalid');
            } else {
                input.classList.remove('invalid');
                newParameters[paramName] = value;
            }
        });

        if (hasErrors) {
            this.showValidationError('Исправьте ошибки в параметрах перед применением');
            return;
        }

        // Применяем изменения
        component.parameters = newParameters;
        component.metadata.updated = new Date().toISOString();

        // Перерисовываем компонент если нужно
        this.core?.updateComponentVisualization?.(componentId);

        // Показываем успех
        this.showSuccessMessage('Параметры компонента обновлены');

        // Уведомляем об изменениях
        this.emit('componentUpdated', { componentId, parameters: newParameters });

        console.log(`✅ Applied changes to component: ${componentId}`);
    }

    /**
     * Сброс параметров компонента
     */
    resetComponentParameters(componentId) {
        const component = this.core?.canvasNodes?.get(componentId);
        if (!component) return;

        if (!confirm('Сбросить все параметры компонента к значениям по умолчанию?')) {
            return;
        }

        // Сбрасываем к значениям по умолчанию
        const defaultParams = {};
        Object.entries(component.definition.parameters || {}).forEach(([key, config]) => {
            defaultParams[key] = config.default !== undefined ? config.default : '';
        });

        component.parameters = defaultParams;
        component.metadata.updated = new Date().toISOString();

        // Обновляем форму
        this.updatePropertiesTab();

        // Показываем уведомление
        this.showInfoMessage('Параметры компонента сброшены');

        console.log(`🔄 Reset parameters for component: ${componentId}`);
    }

    /**
     * Удаление компонента через UI
     */
    deleteComponent(componentId) {
        if (this.core?.canvasManager?.deleteNode) {
            this.core.canvasManager.deleteNode(componentId);
        } else if (this.core?.deleteNode) {
            this.core.deleteNode(componentId);
        }
    }

    /**
     * Обновление вкладки тестирования
     */
    updateTestingTab() {
        // Проверяем наличие данных для тестирования
        this.updateTestingInterface();

        console.log('🧪 Testing tab updated');
    }

    /**
     * Обновление интерфейса тестирования
     */
    updateTestingInterface() {
        const hasComponents = (this.core?.canvasNodes?.size || 0) > 0;
        const testControls = document.querySelector('.test-controls');

        if (testControls) {
            testControls.style.opacity = hasComponents ? '1' : '0.5';

            const testButtons = testControls.querySelectorAll('.btn');
            testButtons.forEach(btn => {
                btn.disabled = !hasComponents;
            });
        }

        // Обновляем статистику тестирования
        this.updateTestingStats();
    }

    /**
     * Обновление статистики тестирования
     */
    updateTestingStats() {
        const statsElements = {
            componentsCount: this.core?.canvasNodes?.size || 0,
            connectionsCount: this.core?.connections?.size || 0,
            ruleComplexity: this.calculateRuleComplexity()
        };

        Object.entries(statsElements).forEach(([key, value]) => {
            const element = this.elements.get(key);
            if (element) {
                element.textContent = value;
            }
        });
    }

    /**
     * Вычисление сложности правила
     */
    calculateRuleComplexity() {
        const componentCount = this.core?.canvasNodes?.size || 0;
        const connectionCount = this.core?.connections?.size || 0;

        if (componentCount === 0) return 'Нет правил';
        if (componentCount <= 2 && connectionCount <= 1) return 'Простая';
        if (componentCount <= 5 && connectionCount <= 4) return 'Средняя';
        return 'Сложная';
    }

    /**
     * Обновление вкладки вывода
     */
    updateOutputTab() {
        // Генерируем вывод правила
        this.generateRuleOutput();

        // Обновляем статистику правила
        this.updateRuleStatistics();

        console.log('📝 Output tab updated');
    }

    /**
     * Генерация вывода правила
     */
    generateRuleOutput() {
        if (this.core?.generateRuleOutput) {
            this.core.generateRuleOutput();
        } else {
            // Fallback генерация
            const outputElement = this.elements.get('ruleOutput');
            if (outputElement) {
                const hasRules = (this.core?.canvasNodes?.size || 0) > 0;
                outputElement.textContent = hasRules ?
                    '# Правило будет сгенерировано...' :
                    '# Создайте правило для генерации кода\n# Перетащите компоненты в рабочую область';
            }
        }
    }

    /**
     * Обновление статистики правила
     */
    updateRuleStatistics() {
        const ruleSize = this.elements.get('ruleOutput')?.textContent?.length || 0;
        const conditions = this.core?.canvasNodes?.size || 0;

        // Обновляем элементы статистики
        const statsElements = document.querySelectorAll('[data-stat]');
        statsElements.forEach(element => {
            const statType = element.dataset.stat;
            let value = '';

            switch (statType) {
                case 'size':
                    value = `${ruleSize} символов`;
                    break;
                case 'conditions':
                    value = conditions;
                    break;
                case 'performance':
                    value = this.estimatePerformance();
                    break;
            }

            if (value !== '') {
                element.textContent = value;
            }
        });
    }

    /**
     * Оценка производительности правила
     */
    estimatePerformance() {
        const componentCount = this.core?.canvasNodes?.size || 0;
        const connectionCount = this.core?.connections?.size || 0;

        let score = 1000;
        score -= componentCount * 50;
        score -= connectionCount * 25;

        if (score > 500) return 'Высокая';
        if (score > 250) return 'Средняя';
        return 'Низкая';
    }

    // =======================================================
    // МОДАЛЬНЫЕ ОКНА
    // =======================================================

    /**
     * Настройка системы модальных окон
     */
    setupModalSystem() {
        // Кэшируем модальные окна
        document.querySelectorAll('.modal').forEach(modal => {
            const modalId = modal.id;
            this.modals.set(modalId, {
                element: modal,
                isOpen: false,
                openTime: null
            });
        });

        // Обработчики закрытия модальных окон
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });

        // Клик по backdrop для закрытия
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal.id);
                }
            });
        });

        // Кнопки закрытия
        document.querySelectorAll('.modal-close').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) {
                    this.closeModal(modal.id);
                }
            });
        });

        console.log(`🪟 Modal system initialized with ${this.modals.size} modals`);
    }

    /**
     * Открытие модального окна
     */
    showModal(modalId, data = {}) {
        const modal = this.modals.get(modalId);
        if (!modal) {
            console.warn(`⚠️ Modal not found: ${modalId}`);
            return false;
        }

        // Закрываем другие модальные окна
        this.closeAllModals();

        // Подготавливаем данные для модального окна
        this.prepareModalData(modalId, data);

        // Показываем модальное окно
        modal.element.style.display = 'flex';
        modal.element.classList.add('show');
        modal.isOpen = true;
        modal.openTime = Date.now();

        // Добавляем в активные
        this.activeModals.add(modalId);

        // Фокусируемся на модальном окне
        const firstInput = modal.element.querySelector('input, select, textarea, button');
        if (firstInput) {
            firstInput.focus();
        }

        // Блокируем прокрутку body
        document.body.style.overflow = 'hidden';

        // Уведомляем об открытии
        this.emit('modalOpened', { modalId, data });

        // Обновляем метрики
        this.metrics.modalOpens++;

        console.log(`🪟 Opened modal: ${modalId}`);
        return true;
    }

    /**
     * Подготовка данных для модального окна
     */
    prepareModalData(modalId, data) {
        switch (modalId) {
            case 'templates-modal':
                this.loadRuleTemplates();
                break;
            case 'component-config-modal':
                this.loadComponentConfig(data);
                break;
        }
    }

    /**
     * Загрузка шаблонов правил
     */
    loadRuleTemplates() {
        const templatesGrid = document.querySelector('.templates-grid');
        if (!templatesGrid) return;

        // Получаем шаблоны
        const templates = this.core?.getRuleTemplates?.() || {};

        let html = '';
        Object.entries(templates).forEach(([templateId, template]) => {
            html += `
                <div class="template-card" onclick="uiManager.loadTemplate('${templateId}')">
                    <div class="template-icon">${template.icon || '📋'}</div>
                    <h4>${template.name}</h4>
                    <p>${template.description}</p>
                    <div class="template-stats">
                        <span class="template-complexity ${template.complexity || 'medium'}">
                            ${template.complexity || 'Medium'}
                        </span>
                        <span class="template-components">
                            ${template.components?.length || 0} компонентов
                        </span>
                    </div>
                </div>
            `;
        });

        if (html === '') {
            html = `
                <div class="no-templates">
                    <div class="no-templates-icon">📋</div>
                    <h4>Шаблоны не найдены</h4>
                    <p>Создайте первый шаблон правила</p>
                </div>
            `;
        }

        templatesGrid.innerHTML = html;
    }

    /**
     * Загрузка шаблона
     */
    loadTemplate(templateId) {
        if (this.core?.loadRuleTemplate) {
            const success = this.core.loadRuleTemplate(templateId);
            if (success) {
                this.closeModal('templates-modal');
                this.showSuccessMessage(`Шаблон "${templateId}" загружен`);
            }
        } else {
            this.showErrorMessage('Функция загрузки шаблонов недоступна');
        }
    }

    /**
     * Закрытие модального окна
     */
    closeModal(modalId) {
        const modal = this.modals.get(modalId);
        if (!modal || !modal.isOpen) return false;

        // Анимация закрытия
        modal.element.classList.remove('show');

        setTimeout(() => {
            modal.element.style.display = 'none';
        }, this.settings.animationDuration);

        modal.isOpen = false;
        this.activeModals.delete(modalId);

        // Восстанавливаем прокрутку body если нет других модальных окон
        if (this.activeModals.size === 0) {
            document.body.style.overflow = '';
        }

        // Уведомляем о закрытии
        this.emit('modalClosed', { modalId });

        console.log(`🪟 Closed modal: ${modalId}`);
        return true;
    }

    /**
     * Закрытие всех модальных окон
     */
    closeAllModals() {
        Array.from(this.activeModals).forEach(modalId => {
            this.closeModal(modalId);
        });
    }

    // =======================================================
    // ПОИСК И ФИЛЬТРАЦИЯ
    // =======================================================

    /**
     * Настройка поиска и фильтров
     */
    setupSearchAndFilters() {
        const searchInput = this.elements.get('componentSearch');
        const categoryFilter = this.elements.get('categoryFilter');

        // Поиск компонентов
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearchInput(e.target.value);
            });
        }

        // Фильтр по категориям
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.handleCategoryFilter(e.target.value);
            });
        }

        // Инициализируем фильтры
        this.updateComponentFilters();

        console.log('🔍 Search and filters initialized');
    }

    /**
     * Обработка ввода в поиск
     */
    handleSearchInput(query) {
        this.searchQuery = query.toLowerCase();

        // Debounce поиска
        this.debounce('component-search', () => {
            this.filterComponents();
            this.metrics.searchQueries++;
        }, this.settings.searchDebounceTime);
    }

    /**
     * Обработка фильтра по категориям
     */
    handleCategoryFilter(category) {
        this.selectedCategory = category;
        this.filterComponents();

        console.log(`📂 Applied category filter: ${category}`);
    }

    /**
     * Фильтрация компонентов
     */
    filterComponents() {
        const components = document.querySelectorAll('.component-item');
        let visibleCount = 0;

        components.forEach(component => {
            const componentId = component.dataset.component;
            const componentType = component.dataset.type;
            const componentName = component.querySelector('.component-name')?.textContent?.toLowerCase() || '';
            const componentDesc = component.querySelector('.component-description')?.textContent?.toLowerCase() || '';

            // Проверяем поисковый запрос
            const matchesSearch = !this.searchQuery ||
                componentId.toLowerCase().includes(this.searchQuery) ||
                componentName.includes(this.searchQuery) ||
                componentDesc.includes(this.searchQuery);

            // Проверяем категорию
            const matchesCategory = !this.selectedCategory || componentType === this.selectedCategory;

            const isVisible = matchesSearch && matchesCategory;

            component.style.display = isVisible ? 'flex' : 'none';

            if (isVisible) {
                visibleCount++;
                this.highlightSearchTerms(component);
            }
        });

        // Обновляем счетчики категорий
        this.updateCategoryCounters(visibleCount);

        // Уведомляем о фильтрации
        this.emit('componentsFiltered', {
            query: this.searchQuery,
            category: this.selectedCategory,
            visibleCount
        });

        console.log(`🔍 Filtered components: ${visibleCount} visible`);
    }

    /**
     * Подсветка поисковых терминов
     */
    highlightSearchTerms(component) {
        if (!this.searchQuery) return;

        const textElements = component.querySelectorAll('.component-name, .component-description');
        textElements.forEach(element => {
            const text = element.textContent;
            const regex = new RegExp(`(${this.escapeRegex(this.searchQuery)})`, 'gi');
            const highlightedText = text.replace(regex, '<mark>$1</mark>');

            if (highlightedText !== text) {
                element.innerHTML = highlightedText;
            }
        });
    }

    /**
     * Экранирование регулярного выражения
     */
    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    /**
     * Обновление счетчиков категорий
     */
    updateCategoryCounters(totalVisible) {
        document.querySelectorAll('.component-category').forEach(category => {
            const categoryId = category.dataset.category;
            const categoryComponents = category.querySelectorAll('.component-item:not([style*="display: none"])');
            const count = categoryComponents.length;

            const countElement = category.querySelector('.category-count');
            if (countElement) {
                countElement.textContent = count;
            }

            // Скрываем пустые категории при поиске
            if (this.searchQuery && count === 0) {
                category.style.display = 'none';
            } else {
                category.style.display = '';
            }
        });
    }

    /**
     * Обновление фильтров компонентов
     */
    updateComponentFilters() {
        // Получаем уникальные категории компонентов
        const categories = new Set();
        document.querySelectorAll('.component-item').forEach(item => {
            const type = item.dataset.type;
            if (type) categories.add(type);
        });

        // Обновляем select фильтра категорий
        const categoryFilter = this.elements.get('categoryFilter');
        if (categoryFilter) {
            const currentValue = categoryFilter.value;
            categoryFilter.innerHTML = '<option value="">Все категории</option>';

            Array.from(categories).sort().forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = this.formatCategoryName(category);
                if (category === currentValue) {
                    option.selected = true;
                }
                categoryFilter.appendChild(option);
            });
        }
    }

    /**
     * Форматирование названия категории
     */
    formatCategoryName(category) {
        const categoryNames = {
            'network': 'Сетевые',
            'file': 'Файловые',
            'content': 'Контентные',
            'behavioral': 'Поведенческие',
            'temporal': 'Временные'
        };

        return categoryNames[category] || category.charAt(0).toUpperCase() + category.slice(1);
    }

    // =======================================================
    // СИСТЕМА УВЕДОМЛЕНИЙ
    // =======================================================

    /**
     * Настройка системы уведомлений
     */
    setupNotificationSystem() {
        // Создаем контейнер для уведомлений если его нет
        let container = document.getElementById('notification-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-container';
            container.className = 'notification-container';
            document.body.appendChild(container);
        }

        this.notificationContainer = container;
        console.log('🔔 Notification system initialized');
    }

    /**
     * Показ уведомления об успехе
     */
    showSuccessMessage(message, duration = null) {
        return this.showNotification(message, 'success', duration);
    }

    /**
     * Показ уведомления об ошибке
     */
    showErrorMessage(message, duration = null) {
        return this.showNotification(message, 'error', duration);
    }

    /**
     * Показ информационного уведомления
     */
    showInfoMessage(message, duration = null) {
        return this.showNotification(message, 'info', duration);
    }

    /**
     * Показ уведомления-предупреждения
     */
    showWarningMessage(message, duration = null) {
        return this.showNotification(message, 'warning', duration);
    }

    /**
     * Показ уведомления об ошибке валидации
     */
    showValidationError(message) {
        return this.showNotification(message, 'validation', 8000);
    }

    /**
     * Основная функция показа уведомлений
     */
    showNotification(message, type = 'info', duration = null) {
        const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const actualDuration = duration || this.settings.notificationTimeout;

        const notification = {
            id,
            message,
            type,
            timestamp: Date.now(),
            duration: actualDuration
        };

        // Ограничиваем количество уведомлений
        if (this.notifications.length >= this.settings.maxNotifications) {
            const oldestNotification = this.notifications.shift();
            this.removeNotificationElement(oldestNotification.id);
        }

        this.notifications.push(notification);

        // Создаем DOM элемент
        const element = this.createNotificationElement(notification);

        // Добавляем в контейнер
        this.notificationContainer.appendChild(element);

        // Анимация появления
        requestAnimationFrame(() => {
            element.classList.add('show');
        });

        // Автоматическое скрытие
        setTimeout(() => {
            this.hideNotification(id);
        }, actualDuration);

        console.log(`🔔 Notification shown: ${type} - ${message}`);
        return id;
    }

    /**
     * Создание элемента уведомления
     */
    createNotificationElement(notification) {
        const element = document.createElement('div');
        element.className = `notification notification--${notification.type}`;
        element.id = notification.id;

        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️',
            validation: '🚫'
        };

        element.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">${icons[notification.type] || 'ℹ️'}</div>
                <div class="notification-message">${notification.message}</div>
                <button class="notification-close" onclick="uiManager.hideNotification('${notification.id}')">
                    ×
                </button>
            </div>
            <div class="notification-progress"></div>
        `;

        // Анимация прогресса
        const progressBar = element.querySelector('.notification-progress');
        if (progressBar) {
            progressBar.style.animationDuration = `${notification.duration}ms`;
        }

        return element;
    }

    /**
     * Скрытие уведомления
     */
    hideNotification(notificationId) {
        const element = document.getElementById(notificationId);
        if (element) {
            element.classList.remove('show');
            element.classList.add('hide');

            setTimeout(() => {
                this.removeNotificationElement(notificationId);
            }, this.settings.animationDuration);
        }

        // Удаляем из массива
        this.notifications = this.notifications.filter(n => n.id !== notificationId);
    }

    /**
     * Удаление элемента уведомления
     */
    removeNotificationElement(notificationId) {
        const element = document.getElementById(notificationId);
        if (element && element.parentNode) {
            element.parentNode.removeChild(element);
        }
    }

    /**
     * Очистка всех уведомлений
     */
    clearAllNotifications() {
        this.notifications.forEach(notification => {
            this.hideNotification(notification.id);
        });
        this.notifications = [];
    }

    // =======================================================
    // ФОРМЫ И ЭЛЕМЕНТЫ УПРАВЛЕНИЯ
    // =======================================================

    /**
     * Настройка обработчиков форм
     */
    setupFormHandlers() {
        // Основные элементы управления правилом
        const ruleControls = {
            ruleName: this.elements.get('ruleName'),
            ruleType: this.elements.get('ruleType'),
            rulePriority: this.elements.get('rulePriority'),
            outputFormat: this.elements.get('outputFormat')
        };

        Object.entries(ruleControls).forEach(([key, element]) => {
            if (element) {
                element.addEventListener('change', (e) => {
                    this.handleRuleControlChange(key, e.target.value);
                });

                element.addEventListener('input', (e) => {
                    this.handleRuleControlInput(key, e.target.value);
                });
            }
        });

        // Форма тестирования
        this.setupTestingForm();

        // Автосохранение форм
        this.setupFormAutoSave();

        console.log('📝 Form handlers initialized');
    }

    /**
     * Обработчик изменения элементов управления правилом
     */
    handleRuleControlChange(controlName, value) {
        if (!this.core?.currentRule) return;

        switch (controlName) {
            case 'ruleName':
                this.core.currentRule.name = value;
                this.markRuleAsModified();
                break;
            case 'ruleType':
                this.core.currentRule.type = value;
                this.generateRuleOutput(); // Перегенерируем вывод
                break;
            case 'rulePriority':
                this.core.currentRule.priority = value;
                this.generateRuleOutput(); // Перегенерируем вывод
                break;
            case 'outputFormat':
                this.generateRuleOutput(); // Перегенерируем вывод
                break;
        }

        // Уведомляем об изменении
        this.emit('ruleControlChanged', { controlName, value });

        console.log(`🎛️ Rule control changed: ${controlName} = ${value}`);
    }

    /**
     * Обработчик ввода в элементы управления (debounced)
     */
    handleRuleControlInput(controlName, value) {
        // Debounce для предотвращения частых обновлений
        this.debounce(`rule-control-${controlName}`, () => {
            this.handleRuleControlChange(controlName, value);
        }, 500);
    }

    /**
     * Настройка формы тестирования
     */
    setupTestingForm() {
        const testDataSource = this.elements.get('testDataSource');
        const testInput = this.elements.get('testInput');

        if (testDataSource) {
            testDataSource.addEventListener('change', (e) => {
                this.handleTestDataSourceChange(e.target.value);
            });
        }

        if (testInput) {
            testInput.addEventListener('input', (e) => {
                this.updateTestingInterface();
            });
        }
    }

    /**
     * Обработчик изменения источника тестовых данных
     */
    handleTestDataSourceChange(source) {
        const testInput = this.elements.get('testInput');
        if (!testInput) return;

        switch (source) {
            case 'sample':
                testInput.placeholder = 'Будут использованы образцы данных...';
                testInput.disabled = true;
                break;
            case 'live':
                testInput.placeholder = 'Подключение к живому трафику...';
                testInput.disabled = true;
                break;
            case 'upload':
                testInput.placeholder = 'Выберите файл для загрузки...';
                testInput.disabled = true;
                // Здесь можно добавить логику загрузки файла
                break;
            case 'manual':
                testInput.placeholder = 'Введите тестовые данные...';
                testInput.disabled = false;
                break;
        }

        console.log(`🧪 Test data source changed: ${source}`);
    }

    /**
     * Настройка автосохранения форм
     */
    setupFormAutoSave() {
        if (!this.settings.autoSave) return;

        // Сохраняем состояние форм при изменениях
        document.addEventListener('input', (e) => {
            if (e.target.matches('.form-control, .parameter-input')) {
                this.debounce('form-autosave', () => {
                    this.saveFormState();
                }, 2000);
            }
        });

        // Восстанавливаем состояние при загрузке
        this.restoreFormState();
    }

    /**
     * Сохранение состояния форм
     */
    saveFormState() {
        const formState = {
            timestamp: Date.now(),
            ruleName: this.elements.get('ruleName')?.value || '',
            ruleType: this.elements.get('ruleType')?.value || 'detection',
            rulePriority: this.elements.get('rulePriority')?.value || 'medium',
            outputFormat: this.elements.get('outputFormat')?.value || 'snort',
            searchQuery: this.searchQuery,
            selectedCategory: this.selectedCategory,
            currentTab: this.currentTab
        };

        try {
            localStorage.setItem('ui-manager-form-state', JSON.stringify(formState));
            console.log('💾 Form state saved');
        } catch (error) {
            console.error('❌ Error saving form state:', error);
        }
    }

    /**
     * Восстановление состояния форм
     */
    restoreFormState() {
        try {
            const saved = localStorage.getItem('ui-manager-form-state');
            if (!saved) return;

            const formState = JSON.parse(saved);

            // Проверяем актуальность (не старше часа)
            const ageMinutes = (Date.now() - formState.timestamp) / (1000 * 60);
            if (ageMinutes > 60) return;

            // Восстанавливаем значения
            Object.entries(formState).forEach(([key, value]) => {
                if (key === 'timestamp') return;

                const element = this.elements.get(key);
                if (element && element.value !== undefined) {
                    element.value = value;
                } else if (key === 'searchQuery' && value) {
                    this.searchQuery = value;
                    const searchInput = this.elements.get('componentSearch');
                    if (searchInput) searchInput.value = value;
                } else if (key === 'selectedCategory' && value) {
                    this.selectedCategory = value;
                } else if (key === 'currentTab' && value !== this.currentTab) {
                    this.currentTab = value;
                }
            });

            // Применяем фильтры
            if (formState.searchQuery || formState.selectedCategory) {
                this.filterComponents();
            }

            console.log('🔄 Form state restored');
        } catch (error) {
            console.error('❌ Error restoring form state:', error);
        }
    }

    // =======================================================
    // ГОРЯЧИЕ КЛАВИШИ И ДОСТУПНОСТЬ
    // =======================================================

    /**
     * Настройка горячих клавиш
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Проверяем, что не в поле ввода
            if (e.target.matches('input, textarea, select')) return;

            // Комбинации с Ctrl
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case '1':
                        e.preventDefault();
                        this.switchTab('properties');
                        break;
                    case '2':
                        e.preventDefault();
                        this.switchTab('testing');
                        break;
                    case '3':
                        e.preventDefault();
                        this.switchTab('output');
                        break;
                    case 'f':
                        e.preventDefault();
                        this.focusSearch();
                        break;
                    case 'm':
                        e.preventDefault();
                        this.showModal('templates-modal');
                        break;
                }
            }
            // Отдельные клавиши
            else {
                switch (e.key) {
                    case 'Escape':
                        this.handleEscapeKey();
                        break;
                    case 'F1':
                        e.preventDefault();
                        this.showHelpModal();
                        break;
                    case '/':
                        if (!e.target.matches('input, textarea')) {
                            e.preventDefault();
                            this.focusSearch();
                        }
                        break;
                }
            }
        });

        console.log('⌨️ Keyboard shortcuts initialized');
    }

    /**
     * Фокус на поиске
     */
    focusSearch() {
        const searchInput = this.elements.get('componentSearch');
        if (searchInput) {
            searchInput.focus();
            searchInput.select();
        }
    }

    /**
     * Обработка клавиши Escape
     */
    handleEscapeKey() {
        // Закрываем модальные окна
        if (this.activeModals.size > 0) {
            this.closeAllModals();
            return;
        }

        // Очищаем поиск
        if (this.searchQuery) {
            const searchInput = this.elements.get('componentSearch');
            if (searchInput) {
                searchInput.value = '';
                this.handleSearchInput('');
            }
            return;
        }

        // Очищаем выделение
        if (this.core?.clearSelection) {
            this.core.clearSelection();
        }
    }

    /**
     * Показ модального окна помощи
     */
    showHelpModal() {
        const helpContent = `
            <div class="help-content">
                <h3>Горячие клавиши</h3>
                <div class="shortcuts-grid">
                    <div class="shortcut-item">
                        <kbd>Ctrl+1</kbd>
                        <span>Вкладка "Свойства"</span>
                    </div>
                    <div class="shortcut-item">
                        <kbd>Ctrl+2</kbd>
                        <span>Вкладка "Тестирование"</span>
                    </div>
                    <div class="shortcut-item">
                        <kbd>Ctrl+3</kbd>
                        <span>Вкладка "Вывод"</span>
                    </div>
                    <div class="shortcut-item">
                        <kbd>Ctrl+F</kbd>
                        <span>Поиск компонентов</span>
                    </div>
                    <div class="shortcut-item">
                        <kbd>Ctrl+M</kbd>
                        <span>Шаблоны правил</span>
                    </div>
                    <div class="shortcut-item">
                        <kbd>Escape</kbd>
                        <span>Отмена/Закрытие</span>
                    </div>
                    <div class="shortcut-item">
                        <kbd>/</kbd>
                        <span>Быстрый поиск</span>
                    </div>
                </div>
            </div>
        `;

        this.showInfoMessage('Нажмите F1 для показа справки', 3000);

        // Здесь можно показать полноценное модальное окно помощи
        console.log('❓ Help requested - shortcuts available');
    }

    /**
     * Настройка доступности (accessibility)
     */
    setupAccessibility() {
        // ARIA labels и роли
        this.setupAriaLabels();

        // Навигация с клавиатуры
        this.setupKeyboardNavigation();

        // Фокус-индикаторы
        this.setupFocusIndicators();

        console.log('♿ Accessibility features initialized');
    }

    /**
     * Настройка ARIA меток
     */
    setupAriaLabels() {
        // Вкладки
        document.querySelectorAll('.tab-button').forEach((button, index) => {
            button.setAttribute('role', 'tab');
            button.setAttribute('aria-selected', button.classList.contains('active'));
            button.setAttribute('tabindex', button.classList.contains('active') ? '0' : '-1');
        });

        // Панели вкладок
        document.querySelectorAll('.tab-content').forEach(content => {
            content.setAttribute('role', 'tabpanel');
            content.setAttribute('aria-hidden', !content.classList.contains('active'));
        });

        // Компоненты
        document.querySelectorAll('.component-item').forEach(item => {
            const name = item.querySelector('.component-name')?.textContent;
            const description = item.querySelector('.component-description')?.textContent;
            if (name) {
                item.setAttribute('aria-label', `${name}: ${description}`);
            }
        });
    }

    /**
     * Настройка навигации с клавиатуры
     */
    setupKeyboardNavigation() {
        // Навигация по вкладкам стрелками
        document.querySelector('.section-tabs')?.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                e.preventDefault();
                const tabs = [...document.querySelectorAll('.tab-button')];
                const currentIndex = tabs.findIndex(tab => tab.classList.contains('active'));

                let nextIndex;
                if (e.key === 'ArrowLeft') {
                    nextIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
                } else {
                    nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
                }

                const nextTab = tabs[nextIndex];
                if (nextTab) {
                    const tabName = this.extractTabName(nextTab);
                    this.switchTab(tabName);
                    nextTab.focus();
                }
            }
        });
    }

    /**
     * Настройка индикаторов фокуса
     */
    setupFocusIndicators() {
        // Улучшенные focus-visible стили применяются через CSS
        // Здесь можно добавить дополнительную логику если нужно

        document.addEventListener('focusin', (e) => {
            if (e.target.matches('.tab-button, .component-item, .form-control')) {
                this.updateActivity();
            }
        });
    }

    // =======================================================
    // ИНИЦИАЛИЗАЦИЯ ТЕМЫ
    // =======================================================

    /**
     * Инициализация темы
     */
    initializeTheme() {
        // Получаем сохраненную тему
        const savedTheme = localStorage.getItem('ui-theme') || this.settings.theme;
        this.setTheme(savedTheme);

        // Слушаем системные изменения темы
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                if (this.settings.theme === 'auto') {
                    this.setTheme('auto');
                }
            });
        }

        console.log(`🎨 Theme initialized: ${savedTheme}`);
    }

    /**
     * Установка темы
     */
    setTheme(theme) {
        this.settings.theme = theme;

        let actualTheme = theme;
        if (theme === 'auto') {
            actualTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }

        document.documentElement.setAttribute('data-theme', actualTheme);
        localStorage.setItem('ui-theme', theme);

        this.emit('themeChanged', { theme: actualTheme, original: theme });
    }

    // =======================================================
    // УТИЛИТАРНЫЕ МЕТОДЫ
    // =======================================================

    /**
     * Debounce функция для ограничения частоты вызовов
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
     * Добавление в очередь анимации
     */
    addToAnimationQueue(animationFunction) {
        this.animationQueue.push(animationFunction);

        if (this.animationQueue.length === 1) {
            this.processAnimationQueue();
        }
    }

    /**
     * Обработка очереди анимации
     */
    async processAnimationQueue() {
        while (this.animationQueue.length > 0) {
            const animation = this.animationQueue.shift();
            try {
                await animation();
            } catch (error) {
                console.error('❌ Animation error:', error);
            }
        }
    }

    /**
     * Отметка компонента как измененного
     */
    markComponentAsModified(componentId) {
        const element = document.getElementById(componentId);
        if (element) {
            element.classList.add('modified');
        }

        this.markRuleAsModified();
    }

    /**
     * Отметка правила как измененного
     */
    markRuleAsModified() {
        if (this.core?.state) {
            this.core.state.hasUnsavedChanges = true;
        }

        // Обновляем индикатор изменений в UI
        document.body.classList.add('has-unsaved-changes');
    }

    /**
     * Обновление последней активности
     */
    updateActivity() {
        this.metrics.lastActivity = Date.now();

        // Уведомляем о активности
        this.emit('userActivity', { timestamp: this.metrics.lastActivity });
    }

    /**
     * Получение метрик UI
     */
    getUIMetrics() {
        return {
            ...this.metrics,
            activeModals: this.activeModals.size,
            notifications: this.notifications.length,
            currentTab: this.currentTab,
            searchQuery: this.searchQuery,
            selectedCategory: this.selectedCategory,
            theme: this.settings.theme
        };
    }

    /**
     * Экспорт состояния UI
     */
    exportUIState() {
        return {
            version: this.version,
            timestamp: Date.now(),
            settings: { ...this.settings },
            currentTab: this.currentTab,
            searchQuery: this.searchQuery,
            selectedCategory: this.selectedCategory,
            metrics: this.getUIMetrics()
        };
    }

    /**
     * Импорт состояния UI
     */
    importUIState(state) {
        try {
            if (state.settings) {
                this.settings = { ...this.settings, ...state.settings };
            }

            if (state.currentTab) {
                this.switchTab(state.currentTab, false);
            }

            if (state.searchQuery) {
                this.searchQuery = state.searchQuery;
                const searchInput = this.elements.get('componentSearch');
                if (searchInput) {
                    searchInput.value = state.searchQuery;
                    this.filterComponents();
                }
            }

            if (state.selectedCategory) {
                this.selectedCategory = state.selectedCategory;
                const categoryFilter = this.elements.get('categoryFilter');
                if (categoryFilter) {
                    categoryFilter.value = state.selectedCategory;
                    this.filterComponents();
                }
            }

            console.log('✅ UI state imported successfully');
            return true;
        } catch (error) {
            console.error('❌ Error importing UI state:', error);
            return false;
        }
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
                    console.error(`Error in UI event handler for ${event}:`, error);
                }
            });
        }
    }

    // =======================================================
    // МЕТОДЫ ЖИЗНЕННОГО ЦИКЛА
    // =======================================================

    /**
     * Активация UI Manager
     */
    activate() {
        if (!this.isInitialized) {
            console.warn('⚠️ UI Manager not initialized');
            return;
        }

        // Обновляем все UI элементы
        this.updateAllInterfaces();

        // Восстанавливаем состояние
        this.restoreFormState();

        console.log('🟢 UI Manager activated');
        this.emit('activated');
    }

    /**
     * Деактивация UI Manager
     */
    deactivate() {
        // Сохраняем состояние
        this.saveFormState();

        // Закрываем модальные окна
        this.closeAllModals();

        // Очищаем уведомления
        this.clearAllNotifications();

        console.log('🟡 UI Manager deactivated');
        this.emit('deactivated');
    }

    /**
     * Очистка ресурсов
     */
    cleanup() {
        console.log('🧹 Cleaning up UI Manager...');

        try {
            // Сохраняем состояние
            this.saveFormState();

            // Очищаем таймеры
            this.debounceTimers.forEach(timer => clearTimeout(timer));
            this.debounceTimers.clear();

            // Очищаем обработчики событий
            this.eventHandlers.clear();

            // Закрываем все модальные окна
            this.closeAllModals();

            // Очищаем уведомления
            this.clearAllNotifications();

            // Очищаем кэш элементов
            this.elements.clear();
            this.forms.clear();
            this.modals.clear();

            // Сбрасываем состояние
            this.isInitialized = false;
            this.currentTab = 'properties';
            this.searchQuery = '';
            this.selectedCategory = '';

            console.log('✅ UI Manager cleanup completed');

        } catch (error) {
            console.error('❌ Error during UI Manager cleanup:', error);
        }
    }

    /**
     * Обновление всех интерфейсов
     */
    updateAllInterfaces() {
        this.updateTabContent(this.currentTab);
        this.updateComponentFilters();
        this.filterComponents();
        this.updateTestingInterface();
        this.updateRuleStatistics();
    }
}

// =======================================================
// ЭКСПОРТ И ГЛОБАЛЬНАЯ ИНТЕГРАЦИЯ
// =======================================================

/**
 * Глобальная функция создания UI Manager
 */
function createUIManager(coreInstance) {
    return new UIManager(coreInstance);
}

// Экспорт для модульных систем
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        UIManager,
        createUIManager
    };
}

// ES6 экспорты
if (typeof window !== 'undefined') {
    window.UIManager = UIManager;
    window.createUIManager = createUIManager;

    // Для интеграции с модульной системой attack-constructor
    window.UIManagerExports = {
        UIManager,
        createUIManager,
        version: '4.0.0-Enhanced-UI'
    };

    // Глобальный экземпляр для HTML интеграции
    window.uiManager = null;
}

console.log('✅ UI Manager v4.0.0-Enhanced loaded successfully');

/**
 * =======================================================
 * КОНЕЦ ФАЙЛА ui-manager.js
 * 
 * IP Roast Enterprise 4.0 - UI Manager Module
 * Специализированный модуль для управления пользовательским интерфейсом
 * Версия: 4.0.0-Enhanced-UI
 * 
 * Ключевые возможности:
 * - Полное управление пользовательским интерфейсом
 * - Система вкладок с анимацией и состоянием
 * - Модальные окна с управлением стеком
 * - Система уведомлений с очередью и лимитами
 * - Поиск и фильтрация компонентов в реальном времени
 * - Управление формами с автосохранением и валидацией
 * - Горячие клавиши и accessibility поддержка
 * - Система тем и персонализации
 * - Debounced операции для производительности
 * - Интеграция с модульной архитектурой
 * - Enterprise-уровень UX/UI паттернов
 * =======================================================
 */
