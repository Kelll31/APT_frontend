/**
 * IP Roast Enterprise 4.0 - Canvas Manager Module
 * Управление canvas областью для drag & drop конструктора правил
 * Версия: 4.0.0-Enhanced-Canvas
 * 
 * @description Специализированный модуль для управления canvas и узлами
 * @author IP Roast Security Team
 * @requires attack-constructor-core.js
 * @integrates signature-components, connection-manager
 */

console.log('🎨 Loading Canvas Manager v4.0.0-Enhanced');

/**
 * Основной класс для управления Canvas
 */
class CanvasManager {
    constructor(coreInstance) {
        this.version = '4.0.0-Enhanced-Canvas';
        this.core = coreInstance;
        this.isInitialized = false;

        // Состояние canvas
        this.canvasElement = null;
        this.canvasNodes = new Map();
        this.selectedNodes = new Set();
        this.isDragging = false;
        this.draggedNode = null;

        // Настройки canvas
        this.gridSize = 20;
        this.snapToGrid = true;
        this.canvasScale = 1.0;
        this.canvasOffset = { x: 0, y: 0 };
        this.minZoom = 0.25;
        this.maxZoom = 3.0;

        // Счетчики и ID
        this.nextNodeId = 1;
        this.nodeIdPrefix = 'canvas-node';

        // События
        this.eventHandlers = new Map();
        this.nodeEventListeners = new Map();

        // Производительность
        this.performanceMode = false;
        this.maxNodes = 100;
        this.renderQueue = [];

        console.log('🎨 Canvas Manager initialized');
    }

    /**
     * Инициализация Canvas Manager
     */
    async initialize() {
        try {
            console.log('🚀 Initializing Canvas Manager...');

            await this.setupCanvas();
            this.bindCanvasEvents();
            this.setupGridSystem();
            this.initializeGestures();

            this.isInitialized = true;
            console.log('✅ Canvas Manager initialized successfully');

        } catch (error) {
            console.error('❌ Canvas Manager initialization failed:', error);
            throw error;
        }
    }

    /**
     * Настройка основного canvas элемента
     */
    async setupCanvas() {
        this.canvasElement = document.getElementById('rule-canvas');
        if (!this.canvasElement) {
            throw new Error('Canvas element not found');
        }

        // Применяем базовые стили
        this.applyCanvasStyles();

        // Создаем служебные слои
        this.createCanvasLayers();

        // Настраиваем начальное состояние
        this.resetCanvasState();

        console.log('🎨 Canvas setup completed');
    }

    /**
     * Применение базовых стилей к canvas
     */
    applyCanvasStyles() {
        const canvas = this.canvasElement;

        Object.assign(canvas.style, {
            position: 'relative',
            overflow: 'auto',
            userSelect: 'none',
            cursor: 'default',
            background: 'var(--color-background)',
            minHeight: '400px'
        });

        // Добавляем CSS классы
        canvas.classList.add('canvas-manager', 'drop-zone');
    }

    /**
     * Создание служебных слоев canvas
     */
    createCanvasLayers() {
        // Слой сетки
        this.gridLayer = this.createCanvasLayer('grid-layer', 1);

        // Слой для узлов
        this.nodeLayer = this.createCanvasLayer('node-layer', 10);

        // Слой для выделения
        this.selectionLayer = this.createCanvasLayer('selection-layer', 20);

        // Слой для drag preview
        this.previewLayer = this.createCanvasLayer('preview-layer', 30);

        console.log('🗂️ Canvas layers created');
    }

    /**
     * Создание отдельного слоя canvas
     */
    createCanvasLayer(className, zIndex) {
        const layer = document.createElement('div');
        layer.className = className;
        layer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: ${className === 'node-layer' ? 'auto' : 'none'};
            z-index: ${zIndex};
        `;

        this.canvasElement.appendChild(layer);
        return layer;
    }

    /**
     * Настройка системы сетки
     */
    setupGridSystem() {
        if (this.snapToGrid) {
            this.renderGrid();
        }

        // Обновляем сетку при изменении размеров
        const resizeObserver = new ResizeObserver(() => {
            if (this.snapToGrid) {
                this.renderGrid();
            }
        });

        resizeObserver.observe(this.canvasElement);
    }

    /**
     * Отрисовка сетки
     */
    renderGrid() {
        const canvas = this.canvasElement;
        const gridSize = this.gridSize;

        // Создаем SVG для сетки
        let gridSvg = this.gridLayer.querySelector('.grid-svg');
        if (!gridSvg) {
            gridSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            gridSvg.className = 'grid-svg';
            gridSvg.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
            `;
            this.gridLayer.appendChild(gridSvg);
        }

        // Очищаем предыдущую сетку
        gridSvg.innerHTML = '';

        const width = canvas.clientWidth;
        const height = canvas.clientHeight;

        // Создаем паттерн сетки
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const pattern = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');

        pattern.id = 'grid-pattern';
        pattern.setAttribute('width', gridSize);
        pattern.setAttribute('height', gridSize);
        pattern.setAttribute('patternUnits', 'userSpaceOnUse');

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', `M ${gridSize} 0 L 0 0 0 ${gridSize}`);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', 'var(--color-border-light)');
        path.setAttribute('stroke-width', '1');
        path.setAttribute('opacity', '0.3');

        pattern.appendChild(path);
        defs.appendChild(pattern);
        gridSvg.appendChild(defs);

        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('width', '100%');
        rect.setAttribute('height', '100%');
        rect.setAttribute('fill', 'url(#grid-pattern)');

        gridSvg.appendChild(rect);
    }

    /**
     * Привязка событий canvas
     */
    bindCanvasEvents() {
        const canvas = this.canvasElement;

        // Drag & Drop события
        canvas.addEventListener('dragover', this.handleDragOver.bind(this));
        canvas.addEventListener('drop', this.handleDrop.bind(this));
        canvas.addEventListener('dragenter', this.handleDragEnter.bind(this));
        canvas.addEventListener('dragleave', this.handleDragLeave.bind(this));

        // Mouse события
        canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
        canvas.addEventListener('click', this.handleClick.bind(this));
        canvas.addEventListener('contextmenu', this.handleContextMenu.bind(this));

        // Keyboard события
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        document.addEventListener('keyup', this.handleKeyUp.bind(this));

        // Wheel для зума
        canvas.addEventListener('wheel', this.handleWheel.bind(this), { passive: false });

        console.log('⚡ Canvas events bound');
    }

    /**
     * Инициализация жестов для touch устройств
     */
    initializeGestures() {
        const canvas = this.canvasElement;

        // Touch события
        canvas.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
        canvas.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        canvas.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });

        // Жесты для зума и панорамирования
        this.gestureState = {
            isGesturing: false,
            initialDistance: 0,
            initialScale: 1,
            touches: []
        };

        console.log('👆 Touch gestures initialized');
    }

    /**
     * Сброс состояния canvas
     */
    resetCanvasState() {
        this.clearCanvas();
        this.showEmptyState();
        this.canvasScale = 1.0;
        this.canvasOffset = { x: 0, y: 0 };
    }

    /**
     * Показ пустого состояния
     */
    showEmptyState() {
        let emptyState = this.canvasElement.querySelector('.canvas-empty-state');

        if (!emptyState) {
            emptyState = document.createElement('div');
            emptyState.className = 'canvas-empty-state';
            emptyState.innerHTML = `
                <div class="empty-content">
                    <div class="empty-icon">🎯</div>
                    <h4>Создайте правило сигнатурного анализа</h4>
                    <p>Перетащите компоненты из библиотеки в эту область</p>
                    <div class="empty-tips">
                        <div class="tip-item">
                            <span class="tip-icon">💡</span>
                            <span>Используйте drag & drop для добавления компонентов</span>
                        </div>
                        <div class="tip-item">
                            <span class="tip-icon">🔗</span>
                            <span>Соединяйте узлы для создания логических связей</span>
                        </div>
                    </div>
                </div>
            `;

            emptyState.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                text-align: center;
                color: var(--color-text-secondary);
                pointer-events: none;
                z-index: 5;
            `;

            this.canvasElement.appendChild(emptyState);
        }

        emptyState.style.display = 'flex';
    }

    /**
     * Скрытие пустого состояния
     */
    hideEmptyState() {
        const emptyState = this.canvasElement.querySelector('.canvas-empty-state');
        if (emptyState) {
            emptyState.style.display = 'none';
        }
    }

    // =======================================================
    // УПРАВЛЕНИЕ УЗЛАМИ
    // =======================================================

    /**
     * Добавление компонента на canvas
     */
    addComponent(componentId, x, y, parameters = {}) {
        try {
            // Получаем определение компонента
            const componentDef = this.core?.signatureComponents?.get(componentId);
            if (!componentDef) {
                throw new Error(`Component definition not found: ${componentId}`);
            }

            // Привязка к сетке
            const position = this.snapToGrid ?
                this.snapPositionToGrid(x, y) :
                { x, y };

            // Создаем узел
            const nodeId = this.generateNodeId();
            const node = this.createNodeData(nodeId, componentId, componentDef, position, parameters);

            // Сохраняем узел
            this.canvasNodes.set(nodeId, node);

            // Отрисовываем узел
            const nodeElement = this.renderNode(node);

            // Скрываем пустое состояние
            this.hideEmptyState();

            // Уведомляем об изменениях
            this.emit('nodeAdded', { nodeId, node, element: nodeElement });

            console.log(`📦 Added component ${componentId} as node ${nodeId}`);
            return { nodeId, node, element: nodeElement };

        } catch (error) {
            console.error('❌ Error adding component to canvas:', error);
            throw error;
        }
    }

    /**
     * Создание данных узла
     */
    createNodeData(nodeId, componentId, componentDef, position, parameters = {}) {
        return {
            id: nodeId,
            componentId,
            definition: componentDef,
            position: { ...position },
            parameters: { ...this.getDefaultParameters(componentDef), ...parameters },
            metadata: {
                created: new Date().toISOString(),
                updated: new Date().toISOString(),
                version: '1.0'
            },
            style: {
                width: 220,
                height: 100,
                zIndex: 10
            },
            state: {
                selected: false,
                dragging: false,
                valid: true
            }
        };
    }

    /**
     * Получение параметров по умолчанию
     */
    getDefaultParameters(componentDef) {
        const params = {};
        Object.entries(componentDef.parameters || {}).forEach(([key, config]) => {
            params[key] = config.default !== undefined ? config.default : '';
        });
        return params;
    }

    /**
     * Отрисовка узла
     */
    renderNode(node) {
        const nodeElement = document.createElement('div');
        nodeElement.className = 'canvas-node';
        nodeElement.id = node.id;
        nodeElement.dataset.componentId = node.componentId;

        // Применяем стили
        this.applyNodeStyles(nodeElement, node);

        // Создаем содержимое узла
        this.renderNodeContent(nodeElement, node);

        // Привязываем события
        this.bindNodeEvents(nodeElement, node);

        // Добавляем в слой узлов
        this.nodeLayer.appendChild(nodeElement);

        return nodeElement;
    }

    /**
     * Применение стилей к узлу
     */
    applyNodeStyles(element, node) {
        const { position, style } = node;

        Object.assign(element.style, {
            position: 'absolute',
            left: `${position.x}px`,
            top: `${position.y}px`,
            width: `${style.width}px`,
            minHeight: `${style.height}px`,
            background: 'var(--color-surface-elevated)',
            border: '2px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-12)',
            cursor: 'move',
            boxShadow: 'var(--shadow-md)',
            transition: 'var(--transition-all)',
            zIndex: style.zIndex,
            overflow: 'hidden'
        });
    }

    /**
     * Отрисовка содержимого узла
     */
    renderNodeContent(element, node) {
        const { definition } = node;

        element.innerHTML = `
            <div class="node-header">
                <div class="node-icon">${definition.icon}</div>
                <div class="node-title">${definition.name}</div>
                <div class="node-actions">
                    <button class="node-action-btn config-btn" data-action="configure" title="Настроить">
                        ⚙️
                    </button>
                    <button class="node-action-btn delete-btn" data-action="delete" title="Удалить">
                        🗑️
                    </button>
                </div>
            </div>
            <div class="node-content">
                <div class="node-description">${definition.description}</div>
                <div class="node-type-badge" data-type="${definition.type}">
                    ${definition.type}
                </div>
            </div>
            <div class="node-connections">
                <div class="connection-point input" data-type="input"></div>
                <div class="connection-point output" data-type="output"></div>
            </div>
        `;
    }

    /**
     * Привязка событий к узлу
     */
    bindNodeEvents(element, node) {
        const nodeEventHandler = {
            mousedown: this.handleNodeMouseDown.bind(this, node),
            click: this.handleNodeClick.bind(this, node),
            contextmenu: this.handleNodeContextMenu.bind(this, node),
            dragstart: (e) => e.preventDefault() // Отключаем стандартный drag
        };

        // Привязываем события
        Object.entries(nodeEventHandler).forEach(([event, handler]) => {
            element.addEventListener(event, handler);
        });

        // События кнопок действий
        element.querySelector('.config-btn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.configureNode(node.id);
        });

        element.querySelector('.delete-btn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.deleteNode(node.id);
        });

        // События точек соединения
        element.querySelectorAll('.connection-point').forEach(point => {
            point.addEventListener('mousedown', (e) => {
                e.stopPropagation();
                this.handleConnectionStart(node.id, point.dataset.type, e);
            });
        });

        // Сохраняем ссылки на обработчики для очистки
        this.nodeEventListeners.set(node.id, nodeEventHandler);
    }

    /**
     * Генерация уникального ID узла
     */
    generateNodeId() {
        return `${this.nodeIdPrefix}-${this.nextNodeId++}`;
    }

    /**
     * Привязка позиции к сетке
     */
    snapPositionToGrid(x, y) {
        return {
            x: Math.round(x / this.gridSize) * this.gridSize,
            y: Math.round(y / this.gridSize) * this.gridSize
        };
    }

    // =======================================================
    // ОБРАБОТЧИКИ СОБЫТИЙ DRAG & DROP
    // =======================================================

    /**
     * Обработчик dragover
     */
    handleDragOver(event) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';

        this.canvasElement.classList.add('drag-over');
        this.showDropPreview(event);
    }

    /**
     * Обработчик drop
     */
    handleDrop(event) {
        event.preventDefault();

        try {
            this.canvasElement.classList.remove('drag-over');
            this.hideDropPreview();

            const componentId = event.dataTransfer.getData('text/plain');
            if (!componentId) {
                console.warn('⚠️ No component data in drop event');
                return;
            }

            const rect = this.canvasElement.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            // Добавляем компонент
            const result = this.addComponent(componentId, x, y);

            console.log(`✅ Dropped component ${componentId} at (${x}, ${y})`);
            return result;

        } catch (error) {
            console.error('❌ Error handling drop:', error);
            this.showError('Ошибка добавления компонента');
        }
    }

    /**
     * Обработчик dragenter
     */
    handleDragEnter(event) {
        event.preventDefault();
        this.canvasElement.classList.add('drag-over');
    }

    /**
     * Обработчик dragleave
     */
    handleDragLeave(event) {
        if (!this.canvasElement.contains(event.relatedTarget)) {
            this.canvasElement.classList.remove('drag-over');
            this.hideDropPreview();
        }
    }

    /**
     * Показ превью при drop
     */
    showDropPreview(event) {
        let preview = this.previewLayer.querySelector('.drop-preview');

        if (!preview) {
            preview = document.createElement('div');
            preview.className = 'drop-preview';
            preview.style.cssText = `
                position: absolute;
                width: 220px;
                height: 100px;
                border: 2px dashed var(--color-primary);
                border-radius: var(--radius-lg);
                background: rgba(var(--color-primary-rgb), 0.1);
                pointer-events: none;
                opacity: 0.7;
                transition: var(--transition-all);
            `;
            this.previewLayer.appendChild(preview);
        }

        const rect = this.canvasElement.getBoundingClientRect();
        let x = event.clientX - rect.left - 110; // Центрируем по курсору
        let y = event.clientY - rect.top - 50;

        // Привязка к сетке
        if (this.snapToGrid) {
            const snapped = this.snapPositionToGrid(x + 110, y + 50);
            x = snapped.x - 110;
            y = snapped.y - 50;
        }

        preview.style.left = `${x}px`;
        preview.style.top = `${y}px`;
        preview.style.display = 'block';
    }

    /**
     * Скрытие превью drop
     */
    hideDropPreview() {
        const preview = this.previewLayer.querySelector('.drop-preview');
        if (preview) {
            preview.style.display = 'none';
        }
    }

    // =======================================================
    // ОБРАБОТЧИКИ СОБЫТИЙ УЗЛОВ
    // =======================================================

    /**
     * Обработчик mousedown узла
     */
    handleNodeMouseDown(node, event) {
        if (event.target.closest('.node-actions')) return;

        event.preventDefault();

        this.startNodeDrag(node, event);
    }

    /**
     * Обработчик клика по узлу
     */
    handleNodeClick(node, event) {
        if (event.target.closest('.node-actions')) return;

        event.stopPropagation();

        // Обработка множественного выбора
        if (event.ctrlKey || event.metaKey) {
            this.toggleNodeSelection(node.id);
        } else {
            this.selectNode(node.id);
        }
    }

    /**
     * Обработчик контекстного меню узла
     */
    handleNodeContextMenu(node, event) {
        event.preventDefault();
        this.showNodeContextMenu(node.id, event.clientX, event.clientY);
    }

    /**
     * Начало перетаскивания узла
     */
    startNodeDrag(node, event) {
        this.isDragging = true;
        this.draggedNode = node;

        const element = document.getElementById(node.id);
        const rect = element.getBoundingClientRect();

        this.dragOffset = {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };

        // Визуальные изменения
        element.style.zIndex = '100';
        element.style.opacity = '0.8';
        element.style.cursor = 'grabbing';

        // Если узел не выбран, выбираем его
        if (!node.state.selected) {
            this.selectNode(node.id);
        }

        node.state.dragging = true;

        console.log(`🖱️ Started dragging node ${node.id}`);
    }

    /**
     * Обработка перетаскивания узла
     */
    updateNodeDrag(event) {
        if (!this.isDragging || !this.draggedNode) return;

        const canvas = this.canvasElement;
        const canvasRect = canvas.getBoundingClientRect();

        let x = event.clientX - canvasRect.left - this.dragOffset.x;
        let y = event.clientY - canvasRect.top - this.dragOffset.y;

        // Ограничения границами canvas
        x = Math.max(0, Math.min(x, canvas.clientWidth - this.draggedNode.style.width));
        y = Math.max(0, Math.min(y, canvas.clientHeight - this.draggedNode.style.height));

        // Привязка к сетке
        if (this.snapToGrid) {
            const snapped = this.snapPositionToGrid(x, y);
            x = snapped.x;
            y = snapped.y;
        }

        // Обновляем позицию
        this.updateNodePosition(this.draggedNode.id, x, y);

        // Обновляем соединения (если есть connection manager)
        this.emit('nodePositionChanged', {
            nodeId: this.draggedNode.id,
            position: { x, y }
        });
    }

    /**
     * Завершение перетаскивания узла
     */
    endNodeDrag() {
        if (!this.isDragging || !this.draggedNode) return;

        const element = document.getElementById(this.draggedNode.id);

        // Возвращаем стили
        element.style.zIndex = this.draggedNode.style.zIndex;
        element.style.opacity = '1';
        element.style.cursor = 'move';

        this.draggedNode.state.dragging = false;

        console.log(`✅ Finished dragging node ${this.draggedNode.id}`);

        this.isDragging = false;
        this.draggedNode = null;
        this.dragOffset = null;
    }

    // =======================================================
    // УПРАВЛЕНИЕ ВЫБОРОМ УЗЛОВ
    // =======================================================

    /**
     * Выбор узла
     */
    selectNode(nodeId) {
        // Снимаем выделение с других узлов
        this.clearNodeSelection();

        // Выбираем узел
        this.addNodeToSelection(nodeId);

        console.log(`🎯 Selected node: ${nodeId}`);
    }

    /**
     * Переключение выбора узла
     */
    toggleNodeSelection(nodeId) {
        if (this.selectedNodes.has(nodeId)) {
            this.removeNodeFromSelection(nodeId);
        } else {
            this.addNodeToSelection(nodeId);
        }
    }

    /**
     * Добавление узла к выбранным
     */
    addNodeToSelection(nodeId) {
        const node = this.canvasNodes.get(nodeId);
        if (!node) return;

        this.selectedNodes.add(nodeId);
        node.state.selected = true;

        // Визуальное выделение
        const element = document.getElementById(nodeId);
        if (element) {
            element.classList.add('selected');
            element.style.borderColor = 'var(--color-primary)';
        }

        this.emit('nodeSelected', { nodeId, node });
    }

    /**
     * Удаление узла из выбранных
     */
    removeNodeFromSelection(nodeId) {
        const node = this.canvasNodes.get(nodeId);
        if (!node) return;

        this.selectedNodes.delete(nodeId);
        node.state.selected = false;

        // Убираем визуальное выделение
        const element = document.getElementById(nodeId);
        if (element) {
            element.classList.remove('selected');
            element.style.borderColor = 'var(--color-border)';
        }

        this.emit('nodeDeselected', { nodeId, node });
    }

    /**
     * Очистка выбора всех узлов
     */
    clearNodeSelection() {
        this.selectedNodes.forEach(nodeId => {
            this.removeNodeFromSelection(nodeId);
        });
    }

    // =======================================================
    // УПРАВЛЕНИЕ ПОЗИЦИЕЙ УЗЛОВ
    // =======================================================

    /**
     * Обновление позиции узла
     */
    updateNodePosition(nodeId, x, y) {
        const node = this.canvasNodes.get(nodeId);
        if (!node) return;

        // Обновляем данные
        node.position.x = x;
        node.position.y = y;
        node.metadata.updated = new Date().toISOString();

        // Обновляем DOM элемент
        const element = document.getElementById(nodeId);
        if (element) {
            element.style.left = `${x}px`;
            element.style.top = `${y}px`;
        }
    }

    /**
     * Автоматическая компоновка узлов
     */
    autoLayoutNodes() {
        if (this.canvasNodes.size === 0) return;

        console.log('🎯 Auto-arranging nodes...');

        const canvas = this.canvasElement;
        const padding = 40;
        const nodeWidth = 240;
        const nodeHeight = 140;

        const availableWidth = canvas.clientWidth - padding * 2;
        const availableHeight = canvas.clientHeight - padding * 2;

        const columns = Math.max(1, Math.floor(availableWidth / nodeWidth));
        const rows = Math.ceil(this.canvasNodes.size / columns);

        let index = 0;
        this.canvasNodes.forEach((node) => {
            const col = index % columns;
            const row = Math.floor(index / columns);

            const x = padding + col * nodeWidth;
            const y = padding + row * nodeHeight;

            this.updateNodePosition(node.id, x, y);
            index++;
        });

        // Уведомляем о завершении
        this.emit('nodesAutoArranged', { count: this.canvasNodes.size });
        console.log('✅ Auto-arrangement completed');
    }

    // =======================================================
    // УПРАВЛЕНИЕ УЗЛАМИ
    // =======================================================

    /**
 * Удаление узла
 */
    deleteNode(nodeId) {
        const node = this.canvasNodes.get(nodeId);
        if (!node) {
            console.warn(`⚠️ Node ${nodeId} not found for deletion`);
            return false;
        }

        const confirmMessage = `Удалить компонент "${node.definition.name}"?`;
        if (!confirm(confirmMessage)) {
            return false;
        }

        try {
            console.log(`🗑️ Deleting node: ${nodeId}`);

            // Удаляем из выбранных узлов
            this.removeNodeFromSelection(nodeId);

            // Уведомляем о предстоящем удалении (для connection-manager)
            this.emit('nodeDeleting', { nodeId, node });

            // Удаляем DOM элемент с анимацией
            const element = document.getElementById(nodeId);
            if (element) {
                this.animateNodeRemoval(element).then(() => {
                    element.remove();
                });
            }

            // Очищаем обработчики событий
            this.cleanupNodeEventListeners(nodeId);

            // Удаляем из данных
            this.canvasNodes.delete(nodeId);

            // Обновляем статистику компонента
            if (node.definition.instances > 0) {
                node.definition.instances--;
            }

            // Показываем пустое состояние если нужно
            if (this.canvasNodes.size === 0) {
                this.showEmptyState();
            }

            // Уведомляем об успешном удалении
            this.emit('nodeDeleted', { nodeId, componentId: node.componentId });

            console.log(`✅ Node ${nodeId} deleted successfully`);
            return true;

        } catch (error) {
            console.error(`❌ Error deleting node ${nodeId}:`, error);
            this.showError(`Ошибка удаления компонента: ${error.message}`);
            return false;
        }
    }

    /**
     * Анимация удаления узла
     */
    async animateNodeRemoval(element) {
        return new Promise((resolve) => {
            element.style.transition = 'all 0.3s var(--ease-out)';
            element.style.transform = 'scale(0.8)';
            element.style.opacity = '0';

            setTimeout(() => {
                resolve();
            }, 300);
        });
    }

    /**
     * Очистка обработчиков событий узла
     */
    cleanupNodeEventListeners(nodeId) {
        const handlers = this.nodeEventListeners.get(nodeId);
        if (handlers) {
            const element = document.getElementById(nodeId);
            if (element) {
                Object.entries(handlers).forEach(([event, handler]) => {
                    element.removeEventListener(event, handler);
                });
            }
            this.nodeEventListeners.delete(nodeId);
        }
    }

    /**
     * Настройка компонента (открытие модального окна настроек)
     */
    configureNode(nodeId) {
        const node = this.canvasNodes.get(nodeId);
        if (!node) {
            console.warn(`⚠️ Node ${nodeId} not found for configuration`);
            return;
        }

        // Выбираем узел если не выбран
        if (!node.state.selected) {
            this.selectNode(nodeId);
        }

        // Уведомляем core модуль о необходимости настройки
        this.emit('nodeConfigurationRequested', { nodeId, node });

        console.log(`⚙️ Configuration requested for node: ${nodeId}`);
    }

    /**
     * Показ контекстного меню узла
     */
    showNodeContextMenu(nodeId, x, y) {
        const node = this.canvasNodes.get(nodeId);
        if (!node) return;

        // Создаем контекстное меню
        this.createContextMenu(nodeId, x, y, [
            {
                label: 'Настроить',
                icon: '⚙️',
                action: () => this.configureNode(nodeId)
            },
            {
                label: 'Дублировать',
                icon: '📋',
                action: () => this.duplicateNode(nodeId)
            },
            {
                label: 'Переместить на передний план',
                icon: '⬆️',
                action: () => this.bringNodeToFront(nodeId)
            },
            { separator: true },
            {
                label: 'Удалить',
                icon: '🗑️',
                action: () => this.deleteNode(nodeId),
                danger: true
            }
        ]);
    }

    /**
     * Создание контекстного меню
     */
    createContextMenu(nodeId, x, y, items) {
        // Удаляем существующее меню
        this.removeContextMenu();

        const menu = document.createElement('div');
        menu.className = 'canvas-context-menu';
        menu.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            background: var(--color-surface-elevated);
            border: 1px solid var(--color-border);
            border-radius: var(--radius-base);
            box-shadow: var(--shadow-lg);
            padding: var(--space-4);
            z-index: 1000;
            min-width: 180px;
        `;

        items.forEach(item => {
            if (item.separator) {
                const separator = document.createElement('div');
                separator.style.cssText = `
                    height: 1px;
                    background: var(--color-border);
                    margin: var(--space-4) 0;
                `;
                menu.appendChild(separator);
            } else {
                const menuItem = document.createElement('div');
                menuItem.className = 'context-menu-item';
                menuItem.style.cssText = `
                    display: flex;
                    align-items: center;
                    gap: var(--space-8);
                    padding: var(--space-8) var(--space-12);
                    cursor: pointer;
                    border-radius: var(--radius-sm);
                    transition: var(--transition-all);
                    ${item.danger ? 'color: var(--color-error);' : ''}
                `;

                menuItem.innerHTML = `
                    <span class="menu-icon">${item.icon}</span>
                    <span class="menu-label">${item.label}</span>
                `;

                menuItem.addEventListener('click', () => {
                    item.action();
                    this.removeContextMenu();
                });

                menuItem.addEventListener('mouseenter', () => {
                    menuItem.style.background = item.danger ?
                        'rgba(var(--color-error-rgb), 0.1)' :
                        'var(--color-surface-hover)';
                });

                menuItem.addEventListener('mouseleave', () => {
                    menuItem.style.background = 'transparent';
                });

                menu.appendChild(menuItem);
            }
        });

        document.body.appendChild(menu);

        // Закрываем меню при клике вне его
        const closeHandler = (e) => {
            if (!menu.contains(e.target)) {
                this.removeContextMenu();
                document.removeEventListener('click', closeHandler);
            }
        };

        setTimeout(() => {
            document.addEventListener('click', closeHandler);
        }, 0);
    }

    /**
     * Удаление контекстного меню
     */
    removeContextMenu() {
        const existingMenu = document.querySelector('.canvas-context-menu');
        if (existingMenu) {
            existingMenu.remove();
        }
    }

    /**
     * Дублирование узла
     */
    duplicateNode(nodeId) {
        const originalNode = this.canvasNodes.get(nodeId);
        if (!originalNode) return;

        try {
            // Создаем копию с небольшим смещением
            const offset = 30;
            const newX = originalNode.position.x + offset;
            const newY = originalNode.position.y + offset;

            // Добавляем дублированный компонент
            const result = this.addComponent(
                originalNode.componentId,
                newX,
                newY,
                { ...originalNode.parameters }
            );

            if (result) {
                // Выбираем новый узел
                this.selectNode(result.nodeId);

                console.log(`📋 Node ${nodeId} duplicated as ${result.nodeId}`);
                this.showSuccess('Компонент продублирован');
            }

        } catch (error) {
            console.error('❌ Error duplicating node:', error);
            this.showError('Ошибка дублирования компонента');
        }
    }

    /**
     * Перемещение узла на передний план
     */
    bringNodeToFront(nodeId) {
        const node = this.canvasNodes.get(nodeId);
        if (!node) return;

        const element = document.getElementById(nodeId);
        if (element) {
            // Находим максимальный z-index среди всех узлов
            let maxZIndex = 10;
            this.canvasNodes.forEach(n => {
                if (n.style.zIndex > maxZIndex) {
                    maxZIndex = n.style.zIndex;
                }
            });

            // Устанавливаем новый z-index
            node.style.zIndex = maxZIndex + 1;
            element.style.zIndex = node.style.zIndex;

            console.log(`⬆️ Brought node ${nodeId} to front (z-index: ${node.style.zIndex})`);
        }
    }

    // =======================================================
    // ОБРАБОТЧИКИ MOUSE СОБЫТИЙ
    // =======================================================

    /**
     * Обработчик mousedown на canvas
     */
    handleMouseDown(event) {
        if (event.target.closest('.canvas-node')) return;

        // Начинаем выделение области
        this.startAreaSelection(event);
    }

    /**
     * Обработчик mousemove на canvas
     */
    handleMouseMove(event) {
        if (this.isDragging && this.draggedNode) {
            this.updateNodeDrag(event);
        } else if (this.isAreaSelecting) {
            this.updateAreaSelection(event);
        }
    }

    /**
     * Обработчик mouseup на canvas
     */
    handleMouseUp(event) {
        if (this.isDragging) {
            this.endNodeDrag();
        } else if (this.isAreaSelecting) {
            this.endAreaSelection();
        }
    }

    /**
     * Обработчик wheel для зума
     */
    handleWheel(event) {
        event.preventDefault();

        const rect = this.canvasElement.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        const zoomDelta = event.deltaY > 0 ? 0.9 : 1.1;
        this.zoomCanvas(zoomDelta, mouseX, mouseY);
    }

    /**
     * Обработчик keydown
     */
    handleKeyDown(event) {
        // Проверяем, что фокус на canvas или его дочерних элементах
        if (!this.canvasElement.contains(document.activeElement)) return;

        switch (event.key) {
            case 'Delete':
            case 'Backspace':
                if (this.selectedNodes.size > 0) {
                    this.deleteSelectedNodes();
                }
                event.preventDefault();
                break;

            case 'Escape':
                this.clearNodeSelection();
                this.removeContextMenu();
                event.preventDefault();
                break;

            case 'a':
                if (event.ctrlKey || event.metaKey) {
                    this.selectAllNodes();
                    event.preventDefault();
                }
                break;

            case 'd':
                if (event.ctrlKey || event.metaKey) {
                    this.duplicateSelectedNodes();
                    event.preventDefault();
                }
                break;
        }
    }

    /**
     * Обработчик keyup
     */
    handleKeyUp(event) {
        // Освобождаем модификаторы
        this.modifierKeys = {
            ctrl: event.ctrlKey,
            shift: event.shiftKey,
            alt: event.altKey
        };
    }

    // =======================================================
    // TOUCH СОБЫТИЯ И ЖЕСТЫ
    // =======================================================

    /**
     * Обработчик touchstart
     */
    handleTouchStart(event) {
        event.preventDefault();

        const touches = Array.from(event.touches);
        this.gestureState.touches = touches;

        if (touches.length === 1) {
            // Одиночное касание - имитируем mousedown
            const touch = touches[0];
            this.simulateMouseEvent('mousedown', touch);
        } else if (touches.length === 2) {
            // Два касания - начинаем жест зума/панорамирования
            this.startGesture(touches);
        }
    }

    /**
     * Обработчик touchmove
     */
    handleTouchMove(event) {
        event.preventDefault();

        const touches = Array.from(event.touches);

        if (touches.length === 1) {
            // Одиночное касание - имитируем mousemove
            const touch = touches[0];
            this.simulateMouseEvent('mousemove', touch);
        } else if (touches.length === 2) {
            // Два касания - обрабатываем жест
            this.updateGesture(touches);
        }
    }

    /**
     * Обработчик touchend
     */
    handleTouchEnd(event) {
        event.preventDefault();

        if (this.gestureState.touches.length === 1) {
            // Завершаем одиночное касание
            const touch = this.gestureState.touches[0];
            this.simulateMouseEvent('mouseup', touch);
        }

        this.endGesture();
    }

    /**
     * Имитация mouse события из touch
     */
    simulateMouseEvent(type, touch) {
        const mouseEvent = new MouseEvent(type, {
            bubbles: true,
            cancelable: true,
            clientX: touch.clientX,
            clientY: touch.clientY,
            button: 0
        });

        touch.target.dispatchEvent(mouseEvent);
    }

    /**
     * Начало жеста (зум/панорамирование)
     */
    startGesture(touches) {
        if (touches.length !== 2) return;

        this.gestureState.isGesturing = true;
        this.gestureState.initialDistance = this.getTouchDistance(touches);
        this.gestureState.initialScale = this.canvasScale;
        this.gestureState.touches = touches;
    }

    /**
     * Обновление жеста
     */
    updateGesture(touches) {
        if (!this.gestureState.isGesturing || touches.length !== 2) return;

        const currentDistance = this.getTouchDistance(touches);
        const scale = currentDistance / this.gestureState.initialDistance;

        // Применяем зум
        const newScale = this.gestureState.initialScale * scale;
        const clampedScale = Math.max(this.minZoom, Math.min(this.maxZoom, newScale));

        this.setCanvasScale(clampedScale);
    }

    /**
     * Завершение жеста
     */
    endGesture() {
        this.gestureState.isGesturing = false;
        this.gestureState.touches = [];
    }

    /**
     * Вычисление расстояния между двумя касаниями
     */
    getTouchDistance(touches) {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    // =======================================================
    // ЗУММИРОВАНИЕ И ПАНОРАМИРОВАНИЕ
    // =======================================================

    /**
     * Зум canvas
     */
    zoomCanvas(zoomDelta, centerX, centerY) {
        const newScale = Math.max(this.minZoom, Math.min(this.maxZoom, this.canvasScale * zoomDelta));

        if (newScale === this.canvasScale) return;

        // Вычисляем новое смещение для зума относительно точки
        const scaleDelta = newScale / this.canvasScale;
        const newOffsetX = centerX - (centerX - this.canvasOffset.x) * scaleDelta;
        const newOffsetY = centerY - (centerY - this.canvasOffset.y) * scaleDelta;

        this.setCanvasScale(newScale);
        this.setCanvasOffset(newOffsetX, newOffsetY);

        this.emit('canvasZoomed', { scale: newScale, centerX, centerY });
    }

    /**
     * Установка масштаба canvas
     */
    setCanvasScale(scale) {
        this.canvasScale = Math.max(this.minZoom, Math.min(this.maxZoom, scale));
        this.applyCanvasTransform();

        // Обновляем UI индикатор зума
        this.updateZoomIndicator();
    }

    /**
     * Установка смещения canvas
     */
    setCanvasOffset(x, y) {
        this.canvasOffset.x = x;
        this.canvasOffset.y = y;
        this.applyCanvasTransform();
    }

    /**
     * Применение трансформации к canvas
     */
    applyCanvasTransform() {
        if (this.nodeLayer) {
            this.nodeLayer.style.transform =
                `translate(${this.canvasOffset.x}px, ${this.canvasOffset.y}px) scale(${this.canvasScale})`;
        }

        // Обновляем масштаб сетки
        if (this.gridLayer && this.snapToGrid) {
            this.renderGrid();
        }
    }

    /**
     * Сброс зума и позиции
     */
    resetCanvasTransform() {
        this.setCanvasScale(1.0);
        this.setCanvasOffset(0, 0);

        console.log('🎯 Canvas transform reset');
        this.emit('canvasTransformReset');
    }

    /**
     * Подгонка всех узлов в видимую область
     */
    fitNodesToView() {
        if (this.canvasNodes.size === 0) return;

        // Находим границы всех узлов
        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;

        this.canvasNodes.forEach(node => {
            minX = Math.min(minX, node.position.x);
            minY = Math.min(minY, node.position.y);
            maxX = Math.max(maxX, node.position.x + node.style.width);
            maxY = Math.max(maxY, node.position.y + node.style.height);
        });

        // Вычисляем необходимый масштаб и смещение
        const padding = 50;
        const availableWidth = this.canvasElement.clientWidth - padding * 2;
        const availableHeight = this.canvasElement.clientHeight - padding * 2;

        const contentWidth = maxX - minX;
        const contentHeight = maxY - minY;

        const scaleX = availableWidth / contentWidth;
        const scaleY = availableHeight / contentHeight;
        const scale = Math.min(scaleX, scaleY, 1.0);

        // Центрируем содержимое
        const offsetX = (availableWidth - contentWidth * scale) / 2 + padding - minX * scale;
        const offsetY = (availableHeight - contentHeight * scale) / 2 + padding - minY * scale;

        this.setCanvasScale(scale);
        this.setCanvasOffset(offsetX, offsetY);

        console.log('📐 Fitted nodes to view');
        this.emit('nodesFittedToView');
    }

    // =======================================================
    // ВЫДЕЛЕНИЕ ОБЛАСТИ
    // =======================================================

    /**
     * Начало выделения области
     */
    startAreaSelection(event) {
        const rect = this.canvasElement.getBoundingClientRect();

        this.isAreaSelecting = true;
        this.areaSelectionStart = {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };

        // Создаем элемент выделения
        this.createSelectionBox();
    }

    /**
     * Обновление выделения области
     */
    updateAreaSelection(event) {
        if (!this.isAreaSelecting) return;

        const rect = this.canvasElement.getBoundingClientRect();
        const currentPos = {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };

        this.updateSelectionBox(this.areaSelectionStart, currentPos);
    }

    /**
     * Завершение выделения области
     */
    endAreaSelection() {
        if (!this.isAreaSelecting) return;

        this.isAreaSelecting = false;

        // Находим узлы в области выделения
        const selectedNodeIds = this.getNodesInSelectionArea();

        // Обновляем выделение узлов
        if (selectedNodeIds.length > 0) {
            this.clearNodeSelection();
            selectedNodeIds.forEach(nodeId => {
                this.addNodeToSelection(nodeId);
            });
        }

        // Удаляем элемент выделения
        this.removeSelectionBox();
    }

    /**
     * Создание рамки выделения
     */
    createSelectionBox() {
        this.removeSelectionBox();

        const selectionBox = document.createElement('div');
        selectionBox.className = 'selection-box';
        selectionBox.style.cssText = `
            position: absolute;
            border: 2px dashed var(--color-primary);
            background: rgba(var(--color-primary-rgb), 0.1);
            pointer-events: none;
            z-index: 15;
        `;

        this.selectionLayer.appendChild(selectionBox);
        this.selectionBox = selectionBox;
    }

    /**
     * Обновление рамки выделения
     */
    updateSelectionBox(start, current) {
        if (!this.selectionBox) return;

        const left = Math.min(start.x, current.x);
        const top = Math.min(start.y, current.y);
        const width = Math.abs(current.x - start.x);
        const height = Math.abs(current.y - start.y);

        Object.assign(this.selectionBox.style, {
            left: `${left}px`,
            top: `${top}px`,
            width: `${width}px`,
            height: `${height}px`
        });
    }

    /**
     * Удаление рамки выделения
     */
    removeSelectionBox() {
        if (this.selectionBox) {
            this.selectionBox.remove();
            this.selectionBox = null;
        }
    }

    /**
     * Получение узлов в области выделения
     */
    getNodesInSelectionArea() {
        if (!this.selectionBox) return [];

        const boxRect = this.selectionBox.getBoundingClientRect();
        const canvasRect = this.canvasElement.getBoundingClientRect();

        // Переводим координаты относительно canvas
        const selectionArea = {
            left: boxRect.left - canvasRect.left,
            top: boxRect.top - canvasRect.top,
            right: boxRect.right - canvasRect.left,
            bottom: boxRect.bottom - canvasRect.top
        };

        const selectedNodeIds = [];

        this.canvasNodes.forEach((node, nodeId) => {
            const nodeArea = {
                left: node.position.x,
                top: node.position.y,
                right: node.position.x + node.style.width,
                bottom: node.position.y + node.style.height
            };

            // Проверяем пересечение областей
            if (this.areAreasIntersecting(selectionArea, nodeArea)) {
                selectedNodeIds.push(nodeId);
            }
        });

        return selectedNodeIds;
    }

    /**
     * Проверка пересечения двух областей
     */
    areAreasIntersecting(area1, area2) {
        return !(area1.right < area2.left ||
            area1.left > area2.right ||
            area1.bottom < area2.top ||
            area1.top > area2.bottom);
    }

    // =======================================================
    // МАССОВЫЕ ОПЕРАЦИИ С УЗЛАМИ
    // =======================================================

    /**
     * Выбор всех узлов
     */
    selectAllNodes() {
        this.canvasNodes.forEach((node, nodeId) => {
            this.addNodeToSelection(nodeId);
        });

        console.log(`🎯 Selected all nodes: ${this.selectedNodes.size}`);
    }

    /**
     * Удаление выбранных узлов
     */
    deleteSelectedNodes() {
        if (this.selectedNodes.size === 0) return;

        const nodeCount = this.selectedNodes.size;
        const confirmMessage = `Удалить ${nodeCount} выбранных компонентов?`;

        if (!confirm(confirmMessage)) return;

        // Создаем массив для избежания изменения Set во время итерации
        const nodesToDelete = Array.from(this.selectedNodes);

        nodesToDelete.forEach(nodeId => {
            this.deleteNode(nodeId);
        });

        console.log(`🗑️ Deleted ${nodeCount} selected nodes`);
    }

    /**
     * Дублирование выбранных узлов
     */
    duplicateSelectedNodes() {
        if (this.selectedNodes.size === 0) return;

        const nodesToDuplicate = Array.from(this.selectedNodes);
        const newNodeIds = [];

        nodesToDuplicate.forEach(nodeId => {
            const newNodeId = this.duplicateNode(nodeId);
            if (newNodeId) {
                newNodeIds.push(newNodeId);
            }
        });

        // Выбираем дублированные узлы
        if (newNodeIds.length > 0) {
            this.clearNodeSelection();
            newNodeIds.forEach(nodeId => {
                this.addNodeToSelection(nodeId);
            });
        }

        console.log(`📋 Duplicated ${newNodeIds.length} nodes`);
    }

    // =======================================================
    // ОБРАБОТКА СОЕДИНЕНИЙ
    // =======================================================

    /**
     * Начало создания соединения
     */
    handleConnectionStart(nodeId, pointType, event) {
        event.stopPropagation();

        // Уведомляем connection-manager о начале соединения
        this.emit('connectionStarted', {
            nodeId,
            pointType,
            position: {
                x: event.clientX,
                y: event.clientY
            }
        });

        console.log(`🔗 Connection started from ${nodeId} (${pointType})`);
    }

    // =======================================================
    // УТИЛИТАРНЫЕ МЕТОДЫ
    // =======================================================

    /**
     * Очистка всего canvas
     */
    clearCanvas() {
        console.log('🧹 Clearing canvas...');

        // Удаляем все узлы
        this.canvasNodes.forEach((node, nodeId) => {
            const element = document.getElementById(nodeId);
            if (element) {
                element.remove();
            }
        });

        // Очищаем данные
        this.canvasNodes.clear();
        this.selectedNodes.clear();
        this.nodeEventListeners.clear();

        // Сбрасываем состояние
        this.isDragging = false;
        this.draggedNode = null;
        this.isAreaSelecting = false;

        // Показываем пустое состояние
        this.showEmptyState();

        // Уведомляем об очистке
        this.emit('canvasCleared');

        console.log('✅ Canvas cleared');
    }

    /**
     * Обновление индикатора зума
     */
    updateZoomIndicator() {
        const zoomPercent = Math.round(this.canvasScale * 100);

        // Ищем индикатор зума в UI
        const zoomIndicator = document.querySelector('.zoom-indicator');
        if (zoomIndicator) {
            zoomIndicator.textContent = `${zoomPercent}%`;
        }

        console.log(`🔍 Zoom updated: ${zoomPercent}%`);
    }

    /**
     * Показ сообщения об ошибке
     */
    showError(message) {
        if (window.app?.showErrorNotification) {
            window.app.showErrorNotification(message);
        } else {
            console.error('❌', message);
        }
    }

    /**
     * Показ сообщения об успехе
     */
    showSuccess(message) {
        if (window.app?.showSuccessNotification) {
            window.app.showSuccessNotification(message);
        } else {
            console.log('✅', message);
        }
    }

    /**
     * Получение статистики canvas
     */
    getCanvasStats() {
        return {
            version: this.version,
            nodeCount: this.canvasNodes.size,
            selectedCount: this.selectedNodes.size,
            scale: this.canvasScale,
            offset: { ...this.canvasOffset },
            performanceMode: this.performanceMode,
            gridEnabled: this.snapToGrid,
            initialized: this.isInitialized
        };
    }

    /**
     * Экспорт данных canvas
     */
    exportCanvasData() {
        const nodesData = Array.from(this.canvasNodes.values()).map(node => ({
            id: node.id,
            componentId: node.componentId,
            position: { ...node.position },
            parameters: { ...node.parameters },
            metadata: { ...node.metadata }
        }));

        return {
            version: this.version,
            timestamp: new Date().toISOString(),
            settings: {
                scale: this.canvasScale,
                offset: { ...this.canvasOffset },
                gridSize: this.gridSize,
                snapToGrid: this.snapToGrid
            },
            nodes: nodesData
        };
    }

    /**
     * Импорт данных canvas
     */
    async importCanvasData(data) {
        try {
            console.log('📥 Importing canvas data...');

            // Очищаем текущий canvas
            this.clearCanvas();

            // Применяем настройки
            if (data.settings) {
                this.setCanvasScale(data.settings.scale || 1.0);
                this.setCanvasOffset(
                    data.settings.offset?.x || 0,
                    data.settings.offset?.y || 0
                );

                if (data.settings.gridSize) {
                    this.gridSize = data.settings.gridSize;
                }

                if (data.settings.snapToGrid !== undefined) {
                    this.snapToGrid = data.settings.snapToGrid;
                }
            }

            // Импортируем узлы
            if (data.nodes && Array.isArray(data.nodes)) {
                for (const nodeData of data.nodes) {
                    const result = this.addComponent(
                        nodeData.componentId,
                        nodeData.position.x,
                        nodeData.position.y,
                        nodeData.parameters || {}
                    );

                    if (result && nodeData.metadata) {
                        // Восстанавливаем метаданные
                        result.node.metadata = { ...nodeData.metadata };
                    }
                }
            }

            console.log(`✅ Imported ${data.nodes?.length || 0} nodes`);
            this.emit('canvasImported', { nodeCount: data.nodes?.length || 0 });

        } catch (error) {
            console.error('❌ Error importing canvas data:', error);
            this.showError('Ошибка импорта данных canvas');
            throw error;
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
                    console.error(`Error in event handler for ${event}:`, error);
                }
            });
        }
    }

    // =======================================================
    // МЕТОДЫ ЖИЗНЕННОГО ЦИКЛА
    // =======================================================

    /**
     * Активация Canvas Manager
     */
    activate() {
        if (!this.isInitialized) {
            console.warn('⚠️ Canvas Manager not initialized');
            return;
        }

        // Обновляем сетку при активации
        if (this.snapToGrid) {
            this.renderGrid();
        }

        console.log('🟢 Canvas Manager activated');
        this.emit('activated');
    }

    /**
     * Деактивация Canvas Manager
     */
    deactivate() {
        // Сохраняем текущее состояние
        this.clearNodeSelection();
        this.removeContextMenu();

        console.log('🟡 Canvas Manager deactivated');
        this.emit('deactivated');
    }

    /**
     * Очистка ресурсов
     */
    cleanup() {
        console.log('🧹 Cleaning up Canvas Manager...');

        try {
            // Очищаем canvas
            this.clearCanvas();

            // Удаляем обработчики событий
            this.eventHandlers.clear();
            this.nodeEventListeners.clear();

            // Удаляем элементы UI
            this.removeContextMenu();
            this.removeSelectionBox();

            // Очищаем слои
            if (this.gridLayer) this.gridLayer.innerHTML = '';
            if (this.nodeLayer) this.nodeLayer.innerHTML = '';
            if (this.selectionLayer) this.selectionLayer.innerHTML = '';
            if (this.previewLayer) this.previewLayer.innerHTML = '';

            // Сбрасываем состояние
            this.isInitialized = false;
            this.isDragging = false;
            this.isAreaSelecting = false;
            this.draggedNode = null;

            console.log('✅ Canvas Manager cleanup completed');

        } catch (error) {
            console.error('❌ Error during Canvas Manager cleanup:', error);
        }
    }
}

// =======================================================
// ЭКСПОРТ И ГЛОБАЛЬНАЯ ИНТЕГРАЦИЯ
// =======================================================

/**
 * Глобальная функция создания Canvas Manager
 */
function createCanvasManager(coreInstance) {
    return new CanvasManager(coreInstance);
}

// Экспорт для модульных систем
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CanvasManager,
        createCanvasManager
    };
}

// ES6 экспорты
if (typeof window !== 'undefined') {
    window.CanvasManager = CanvasManager;
    window.createCanvasManager = createCanvasManager;

    // Для интеграции с модульной системой attack-constructor
    window.CanvasManagerExports = {
        CanvasManager,
        createCanvasManager,
        version: '4.0.0-Enhanced-Canvas'
    };
}

console.log('✅ Canvas Manager v4.0.0-Enhanced loaded successfully');

/**
 * =======================================================
 * КОНЕЦ ФАЙЛА canvas-manager.js
 * 
 * IP Roast Enterprise 4.0 - Canvas Manager Module
 * Специализированный модуль для управления canvas областью
 * Версия: 4.0.0-Enhanced-Canvas
 * 
 * Ключевые возможности:
 * - Полнофункциональное управление узлами (CRUD)
 * - Drag & Drop с привязкой к сетке
 * - Множественное выделение и массовые операции
 * - Зуммирование и панорамирование canvas
 * - Touch gestures для мобильных устройств
 * - Контекстные меню и клавиатурные сокращения
 * - Экспорт/импорт состояния canvas
 * - Интеграция с connection-manager
 * - Enterprise-уровень производительности и надежности
 * =======================================================
 */
