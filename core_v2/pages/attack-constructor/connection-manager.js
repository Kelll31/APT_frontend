/**
 * IP Roast Enterprise 4.0 - Connection Manager Module
 * Управление соединениями между узлами в конструкторе правил
 * Версия: 4.0.0-Enhanced-Connection
 * 
 * @description Специализированный модуль для создания и управления логическими соединениями
 * @author IP Roast Security Team
 * @requires attack-constructor-core.js, canvas-manager.js
 * @integrates signature-components, rule-generator
 */

console.log('🔗 Loading Connection Manager v4.0.0-Enhanced');

/**
 * Основной класс для управления соединениями
 */
class ConnectionManager {
    constructor(coreInstance, canvasManager) {
        this.version = '4.0.0-Enhanced-Connection';
        this.core = coreInstance;
        this.canvasManager = canvasManager;
        this.isInitialized = false;

        // Состояние соединений
        this.connections = new Map();
        this.svgLayer = null;
        this.isConnecting = false;
        this.connectionStart = null;
        this.tempConnectionPath = null;

        // Настройки соединений
        this.connectionStyle = {
            strokeWidth: 2,
            strokeColor: 'var(--color-primary)',
            strokeColorHover: 'var(--color-primary-hover)',
            strokeColorSelected: 'var(--color-accent)',
            strokeDasharray: 'none',
            curveOffset: 100
        };

        // Типы логических операторов
        this.logicalOperators = {
            'AND': {
                symbol: '∧',
                color: 'var(--color-success)',
                description: 'Логическое И - все условия должны выполняться'
            },
            'OR': {
                symbol: '∨',
                color: 'var(--color-warning)',
                description: 'Логическое ИЛИ - любое условие должно выполняться'
            },
            'NOT': {
                symbol: '¬',
                color: 'var(--color-error)',
                description: 'Логическое НЕ - инверсия условия'
            },
            'XOR': {
                symbol: '⊕',
                color: 'var(--color-info)',
                description: 'Исключающее ИЛИ - только одно условие'
            },
            'NAND': {
                symbol: '⊼',
                color: 'var(--color-purple)',
                description: 'НЕ И - отрицание логического И'
            },
            'NOR': {
                symbol: '⊽',
                color: 'var(--color-cyan)',
                description: 'НЕ ИЛИ - отрицание логического ИЛИ'
            }
        };

        // Счетчики и ID
        this.nextConnectionId = 1;
        this.connectionIdPrefix = 'connection';

        // События
        this.eventHandlers = new Map();
        this.connectionEventListeners = new Map();

        // Производительность и валидация
        this.maxConnections = 200;
        this.validationRules = {
            allowSelfConnection: false,
            allowMultipleConnections: true,
            allowCycles: false,
            maxInputConnections: 10,
            maxOutputConnections: 10
        };

        console.log('🔗 Connection Manager initialized');
    }

    /**
     * Инициализация Connection Manager
     */
    async initialize() {
        try {
            console.log('🚀 Initializing Connection Manager...');

            await this.setupSvgLayer();
            this.bindCanvasEvents();
            this.setupConnectionGestures();
            this.initializeValidation();

            this.isInitialized = true;
            console.log('✅ Connection Manager initialized successfully');

        } catch (error) {
            console.error('❌ Connection Manager initialization failed:', error);
            throw error;
        }
    }

    /**
     * Настройка SVG слоя для соединений
     */
    async setupSvgLayer() {
        const canvasElement = this.canvasManager?.canvasElement || document.getElementById('rule-canvas');
        if (!canvasElement) {
            throw new Error('Canvas element not found for SVG layer');
        }

        // Ищем существующий SVG слой или создаем новый
        this.svgLayer = canvasElement.querySelector('#connection-layer');

        if (!this.svgLayer) {
            this.svgLayer = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            this.svgLayer.id = 'connection-layer';
            this.svgLayer.className = 'connection-svg-layer';

            this.applySvgStyles();
            canvasElement.appendChild(this.svgLayer);
        }

        // Создаем группы для организации элементов
        this.createSvgGroups();

        console.log('🎨 SVG layer setup completed');
    }

    /**
     * Применение стилей к SVG слою
     */
    applySvgStyles() {
        Object.assign(this.svgLayer.style, {
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: '15',
            overflow: 'visible'
        });

        // Устанавливаем атрибуты SVG
        this.svgLayer.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        this.svgLayer.setAttribute('viewBox', '0 0 100% 100%');
        this.svgLayer.setAttribute('preserveAspectRatio', 'none');
    }

    /**
     * Создание групп SVG элементов
     */
    createSvgGroups() {
        // Группа для соединений
        this.connectionsGroup = this.createSvgGroup('connections-group');

        // Группа для временных элементов (preview)
        this.tempGroup = this.createSvgGroup('temp-group');

        // Группа для меток операторов
        this.labelsGroup = this.createSvgGroup('labels-group');

        // Группа для точек соединения
        this.pointsGroup = this.createSvgGroup('points-group');
    }

    /**
     * Создание SVG группы
     */
    createSvgGroup(className) {
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.className = className;
        this.svgLayer.appendChild(group);
        return group;
    }

    /**
     * Привязка событий canvas для соединений
     */
    bindCanvasEvents() {
        if (!this.canvasManager) {
            console.warn('⚠️ Canvas Manager not available for connection events');
            return;
        }

        // Слушаем события от canvas manager
        this.canvasManager.on('connectionStarted', this.handleConnectionStart.bind(this));
        this.canvasManager.on('nodePositionChanged', this.handleNodePositionChanged.bind(this));
        this.canvasManager.on('nodeDeleted', this.handleNodeDeleted.bind(this));
        this.canvasManager.on('canvasCleared', this.handleCanvasCleared.bind(this));

        // Глобальные события мыши для завершения соединения
        document.addEventListener('mousemove', this.handleGlobalMouseMove.bind(this));
        document.addEventListener('mouseup', this.handleGlobalMouseUp.bind(this));

        console.log('⚡ Connection events bound to canvas');
    }

    /**
     * Настройка жестов для создания соединений
     */
    setupConnectionGestures() {
        // Touch события для мобильных устройств
        if (this.canvasManager?.canvasElement) {
            const canvas = this.canvasManager.canvasElement;

            canvas.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
            canvas.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
            canvas.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
        }

        console.log('👆 Connection gestures initialized');
    }

    /**
     * Инициализация системы валидации
     */
    initializeValidation() {
        // Настройка правил валидации по умолчанию
        this.validationCache = new Map();

        console.log('✅ Connection validation initialized');
    }

    // =======================================================
    // СОЗДАНИЕ СОЕДИНЕНИЙ
    // =======================================================

    /**
     * Обработчик начала создания соединения
     */
    handleConnectionStart(data) {
        const { nodeId, pointType, position } = data;

        if (this.isConnecting) {
            console.warn('⚠️ Connection already in progress');
            return;
        }

        console.log(`🔗 Starting connection from ${nodeId} (${pointType})`);

        this.isConnecting = true;
        this.connectionStart = {
            nodeId,
            pointType,
            position: this.getNodeConnectionPoint(nodeId, pointType)
        };

        // Создаем временную линию соединения
        this.createTempConnection(this.connectionStart.position, position);

        // Подсвечиваем доступные точки для соединения
        this.highlightAvailableConnectionPoints(nodeId);

        this.emit('connectionStarted', { nodeId, pointType });
    }

    /**
     * Получение координат точки соединения узла
     */
    getNodeConnectionPoint(nodeId, pointType) {
        const node = this.canvasManager?.canvasNodes?.get(nodeId);
        if (!node) {
            console.error(`❌ Node ${nodeId} not found for connection point`);
            return { x: 0, y: 0 };
        }

        const nodeElement = document.getElementById(nodeId);
        if (!nodeElement) {
            return { x: node.position.x, y: node.position.y };
        }

        const rect = nodeElement.getBoundingClientRect();
        const canvasRect = this.canvasManager.canvasElement.getBoundingClientRect();

        // Вычисляем координаты точки соединения
        let x, y;

        if (pointType === 'output') {
            x = (rect.right - canvasRect.left);
            y = (rect.top + rect.height / 2 - canvasRect.top);
        } else { // input
            x = (rect.left - canvasRect.left);
            y = (rect.top + rect.height / 2 - canvasRect.top);
        }

        return { x, y };
    }

    /**
     * Создание временной линии соединения
     */
    createTempConnection(startPos, endPos) {
        // Удаляем предыдущую временную линию
        this.removeTempConnection();

        // Создаем новую временную линию
        this.tempConnectionPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        this.tempConnectionPath.className = 'temp-connection-path';

        this.applyConnectionStyles(this.tempConnectionPath, {
            stroke: this.connectionStyle.strokeColor,
            strokeWidth: this.connectionStyle.strokeWidth,
            strokeDasharray: '5,5',
            fill: 'none',
            opacity: '0.7',
            pointerEvents: 'none'
        });

        // Строим путь
        const pathData = this.buildConnectionPath(startPos, endPos);
        this.tempConnectionPath.setAttribute('d', pathData);

        this.tempGroup.appendChild(this.tempConnectionPath);
    }

    /**
     * Построение SVG пути для соединения
     */
    buildConnectionPath(startPos, endPos) {
        const dx = endPos.x - startPos.x;
        const controlOffset = Math.max(Math.abs(dx) / 2, this.connectionStyle.curveOffset);

        // Контрольные точки для кривой Безье
        const cp1x = startPos.x + controlOffset;
        const cp1y = startPos.y;
        const cp2x = endPos.x - controlOffset;
        const cp2y = endPos.y;

        return `M ${startPos.x} ${startPos.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endPos.x} ${endPos.y}`;
    }

    /**
     * Подсветка доступных точек соединения
     */
    highlightAvailableConnectionPoints(excludeNodeId) {
        if (!this.canvasManager?.canvasNodes) return;

        this.canvasManager.canvasNodes.forEach((node, nodeId) => {
            if (nodeId === excludeNodeId) return;

            const nodeElement = document.getElementById(nodeId);
            if (!nodeElement) return;

            // Добавляем класс для подсветки точек соединения
            const connectionPoints = nodeElement.querySelectorAll('.connection-point');
            connectionPoints.forEach(point => {
                point.classList.add('connection-available');

                // Добавляем обработчик для завершения соединения
                point.addEventListener('mouseenter', this.handleConnectionPointHover.bind(this, nodeId));
                point.addEventListener('mouseleave', this.handleConnectionPointLeave.bind(this, nodeId));
                point.addEventListener('mouseup', this.handleConnectionPointClick.bind(this, nodeId));
            });
        });
    }

    /**
     * Обработчики событий точек соединения
     */
    handleConnectionPointHover(nodeId, event) {
        if (!this.isConnecting) return;

        event.target.classList.add('connection-target');

        // Обновляем временную линию до этой точки
        const pointType = event.target.dataset.type || 'input';
        const targetPos = this.getNodeConnectionPoint(nodeId, pointType);

        if (this.tempConnectionPath && this.connectionStart) {
            const pathData = this.buildConnectionPath(this.connectionStart.position, targetPos);
            this.tempConnectionPath.setAttribute('d', pathData);
        }
    }

    handleConnectionPointLeave(nodeId, event) {
        event.target.classList.remove('connection-target');
    }

    handleConnectionPointClick(nodeId, event) {
        if (!this.isConnecting) return;

        event.stopPropagation();
        event.preventDefault();

        const pointType = event.target.dataset.type || 'input';
        this.completeConnection(nodeId, pointType);
    }

    /**
     * Завершение создания соединения
     */
    completeConnection(targetNodeId, targetPointType) {
        if (!this.isConnecting || !this.connectionStart) {
            return false;
        }

        try {
            // Валидация соединения
            const validation = this.validateConnection(
                this.connectionStart.nodeId,
                targetNodeId,
                this.connectionStart.pointType,
                targetPointType
            );

            if (!validation.isValid) {
                console.warn('⚠️ Connection validation failed:', validation.errors);
                this.showValidationError(validation.errors);
                this.cancelConnection();
                return false;
            }

            // Создаем соединение
            const connectionId = this.generateConnectionId();
            const connection = this.createConnectionData(
                connectionId,
                this.connectionStart.nodeId,
                targetNodeId,
                this.connectionStart.pointType,
                targetPointType
            );

            // Сохраняем соединение
            this.connections.set(connectionId, connection);

            // Отрисовываем соединение
            this.renderConnection(connection);

            // Очищаем временные элементы
            this.cancelConnection();

            // Уведомляем о создании соединения
            this.emit('connectionCreated', { connectionId, connection });

            console.log(`✅ Connection created: ${this.connectionStart.nodeId} -> ${targetNodeId}`);
            return true;

        } catch (error) {
            console.error('❌ Error completing connection:', error);
            this.showError('Ошибка создания соединения');
            this.cancelConnection();
            return false;
        }
    }

    /**
     * Отмена создания соединения
     */
    cancelConnection() {
        this.isConnecting = false;
        this.connectionStart = null;

        // Удаляем временные элементы
        this.removeTempConnection();
        this.clearConnectionHighlights();

        console.log('🚫 Connection cancelled');
    }

    /**
     * Удаление временной линии соединения
     */
    removeTempConnection() {
        if (this.tempConnectionPath) {
            this.tempConnectionPath.remove();
            this.tempConnectionPath = null;
        }
    }

    /**
     * Очистка подсветки точек соединения
     */
    clearConnectionHighlights() {
        document.querySelectorAll('.connection-point').forEach(point => {
            point.classList.remove('connection-available', 'connection-target');

            // Удаляем временные обработчики
            const newPoint = point.cloneNode(true);
            point.parentNode.replaceChild(newPoint, point);
        });
    }

    // =======================================================
    // УПРАВЛЕНИЕ СОЕДИНЕНИЯМИ
    // =======================================================

    /**
     * Создание данных соединения
     */
    createConnectionData(connectionId, fromNodeId, toNodeId, fromPointType, toPointType) {
        return {
            id: connectionId,
            from: {
                nodeId: fromNodeId,
                pointType: fromPointType
            },
            to: {
                nodeId: toNodeId,
                pointType: toPointType
            },
            operator: 'AND', // По умолчанию
            metadata: {
                created: new Date().toISOString(),
                updated: new Date().toISOString(),
                version: '1.0'
            },
            style: {
                strokeWidth: this.connectionStyle.strokeWidth,
                strokeColor: this.connectionStyle.strokeColor,
                strokeDasharray: this.connectionStyle.strokeDasharray
            },
            state: {
                selected: false,
                valid: true,
                visible: true
            }
        };
    }

    /**
     * Отрисовка соединения
     */
    renderConnection(connection) {
        try {
            // Получаем позиции узлов
            const fromPos = this.getNodeConnectionPoint(connection.from.nodeId, connection.from.pointType);
            const toPos = this.getNodeConnectionPoint(connection.to.nodeId, connection.to.pointType);

            // Создаем группу для соединения
            const connectionGroup = this.createConnectionGroup(connection.id);

            // Создаем основную линию
            const pathElement = this.createConnectionPath(connection, fromPos, toPos);
            connectionGroup.appendChild(pathElement);

            // Создаем метку оператора
            const operatorLabel = this.createOperatorLabel(connection, fromPos, toPos);
            connectionGroup.appendChild(operatorLabel);

            // Привязываем события
            this.bindConnectionEvents(connectionGroup, connection);

            // Добавляем в группу соединений
            this.connectionsGroup.appendChild(connectionGroup);

            console.log(`🎨 Connection ${connection.id} rendered`);

        } catch (error) {
            console.error(`❌ Error rendering connection ${connection.id}:`, error);
        }
    }

    /**
     * Создание группы элементов соединения
     */
    createConnectionGroup(connectionId) {
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.id = connectionId;
        group.className = 'connection-group';
        group.style.pointerEvents = 'all';
        return group;
    }

    /**
     * Создание SVG пути соединения
     */
    createConnectionPath(connection, fromPos, toPos) {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.className = 'connection-path';

        // Применяем стили
        this.applyConnectionStyles(path, {
            stroke: connection.style.strokeColor,
            strokeWidth: connection.style.strokeWidth,
            strokeDasharray: connection.style.strokeDasharray,
            fill: 'none',
            cursor: 'pointer'
        });

        // Строим путь
        const pathData = this.buildConnectionPath(fromPos, toPos);
        path.setAttribute('d', pathData);

        return path;
    }

    /**
     * Создание метки логического оператора
     */
    createOperatorLabel(connection, fromPos, toPos) {
        const operator = this.logicalOperators[connection.operator];
        const centerX = (fromPos.x + toPos.x) / 2;
        const centerY = (fromPos.y + toPos.y) / 2;

        // Группа для метки
        const labelGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        labelGroup.className = 'operator-label';

        // Фон метки
        const background = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        background.setAttribute('cx', centerX);
        background.setAttribute('cy', centerY);
        background.setAttribute('r', '18');
        background.setAttribute('fill', 'var(--color-surface-elevated)');
        background.setAttribute('stroke', operator.color);
        background.setAttribute('stroke-width', '2');

        // Текст оператора
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', centerX);
        text.setAttribute('y', centerY);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('dominant-baseline', 'middle');
        text.setAttribute('font-size', '14');
        text.setAttribute('font-weight', 'bold');
        text.setAttribute('fill', operator.color);
        text.textContent = operator.symbol;

        labelGroup.appendChild(background);
        labelGroup.appendChild(text);

        return labelGroup;
    }

    /**
     * Применение стилей к SVG элементу
     */
    applyConnectionStyles(element, styles) {
        Object.entries(styles).forEach(([property, value]) => {
            element.setAttribute(this.camelToKebab(property), value);
        });
    }

    /**
     * Конвертация camelCase в kebab-case
     */
    camelToKebab(str) {
        return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
    }

    /**
     * Привязка событий к соединению
     */
    bindConnectionEvents(connectionGroup, connection) {
        const eventHandler = {
            click: this.handleConnectionClick.bind(this, connection.id),
            contextmenu: this.handleConnectionContextMenu.bind(this, connection.id),
            mouseenter: this.handleConnectionMouseEnter.bind(this, connection.id),
            mouseleave: this.handleConnectionMouseLeave.bind(this, connection.id)
        };

        // Привязываем события
        Object.entries(eventHandler).forEach(([event, handler]) => {
            connectionGroup.addEventListener(event, handler);
        });

        // Сохраняем ссылки на обработчики для очистки
        this.connectionEventListeners.set(connection.id, eventHandler);
    }

    /**
     * Генерация уникального ID соединения
     */
    generateConnectionId() {
        return `${this.connectionIdPrefix}-${this.nextConnectionId++}`;
    }

    // =======================================================
    // ОБРАБОТЧИКИ СОБЫТИЙ СОЕДИНЕНИЙ
    // =======================================================

    /**
     * Обработчик клика по соединению
     */
    handleConnectionClick(connectionId, event) {
        event.stopPropagation();

        const connection = this.connections.get(connectionId);
        if (!connection) return;

        // Выбираем соединение
        this.selectConnection(connectionId);

        console.log(`🎯 Selected connection: ${connectionId}`);
    }

    /**
     * Обработчик контекстного меню соединения
     */
    handleConnectionContextMenu(connectionId, event) {
        event.preventDefault();
        event.stopPropagation();

        this.showConnectionContextMenu(connectionId, event.clientX, event.clientY);
    }

    /**
     * Обработчик наведения на соединение
     */
    handleConnectionMouseEnter(connectionId, event) {
        const connectionGroup = document.getElementById(connectionId);
        if (connectionGroup) {
            connectionGroup.classList.add('connection-hover');

            // Подсвечиваем путь
            const path = connectionGroup.querySelector('.connection-path');
            if (path) {
                path.setAttribute('stroke', this.connectionStyle.strokeColorHover);
                path.setAttribute('stroke-width', this.connectionStyle.strokeWidth + 1);
            }
        }
    }

    /**
     * Обработчик ухода курсора с соединения
     */
    handleConnectionMouseLeave(connectionId, event) {
        const connectionGroup = document.getElementById(connectionId);
        if (connectionGroup) {
            connectionGroup.classList.remove('connection-hover');

            // Возвращаем обычные стили
            const path = connectionGroup.querySelector('.connection-path');
            const connection = this.connections.get(connectionId);
            if (path && connection) {
                path.setAttribute('stroke', connection.style.strokeColor);
                path.setAttribute('stroke-width', connection.style.strokeWidth);
            }
        }
    }

    /**
     * Выбор соединения
     */
    selectConnection(connectionId) {
        // Снимаем выделение с других соединений
        this.clearConnectionSelection();

        const connection = this.connections.get(connectionId);
        if (!connection) return;

        // Выделяем соединение
        connection.state.selected = true;

        const connectionGroup = document.getElementById(connectionId);
        if (connectionGroup) {
            connectionGroup.classList.add('connection-selected');

            const path = connectionGroup.querySelector('.connection-path');
            if (path) {
                path.setAttribute('stroke', this.connectionStyle.strokeColorSelected);
                path.setAttribute('stroke-width', this.connectionStyle.strokeWidth + 2);
            }
        }

        this.emit('connectionSelected', { connectionId, connection });
    }

    /**
     * Очистка выделения соединений
     */
    clearConnectionSelection() {
        this.connections.forEach((connection, connectionId) => {
            if (connection.state.selected) {
                connection.state.selected = false;

                const connectionGroup = document.getElementById(connectionId);
                if (connectionGroup) {
                    connectionGroup.classList.remove('connection-selected');

                    const path = connectionGroup.querySelector('.connection-path');
                    if (path) {
                        path.setAttribute('stroke', connection.style.strokeColor);
                        path.setAttribute('stroke-width', connection.style.strokeWidth);
                    }
                }
            }
        });
    }

    /**
     * Показ контекстного меню соединения
     */
    showConnectionContextMenu(connectionId, x, y) {
        const connection = this.connections.get(connectionId);
        if (!connection) return;

        const menuItems = [
            {
                label: 'Изменить оператор',
                icon: '🔄',
                submenu: Object.keys(this.logicalOperators).map(op => ({
                    label: `${this.logicalOperators[op].symbol} ${op}`,
                    action: () => this.changeConnectionOperator(connectionId, op)
                }))
            },
            {
                label: 'Стиль линии',
                icon: '🎨',
                submenu: [
                    {
                        label: 'Сплошная',
                        action: () => this.changeConnectionStyle(connectionId, { strokeDasharray: 'none' })
                    },
                    {
                        label: 'Штриховая',
                        action: () => this.changeConnectionStyle(connectionId, { strokeDasharray: '5,5' })
                    },
                    {
                        label: 'Точечная',
                        action: () => this.changeConnectionStyle(connectionId, { strokeDasharray: '2,2' })
                    }
                ]
            },
            { separator: true },
            {
                label: 'Удалить соединение',
                icon: '🗑️',
                action: () => this.deleteConnection(connectionId),
                danger: true
            }
        ];

        this.createContextMenu(connectionId, x, y, menuItems);
    }

    /**
     * Создание контекстного меню
     */
    createContextMenu(connectionId, x, y, items) {
        // Удаляем существующее меню
        this.removeContextMenu();

        const menu = document.createElement('div');
        menu.className = 'connection-context-menu';
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
                const menuItem = this.createMenuItem(item);
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
     * Создание элемента меню
     */
    createMenuItem(item) {
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
            ${item.submenu ? '<span class="menu-arrow">▶</span>' : ''}
        `;

        // Обработчики событий
        if (item.action) {
            menuItem.addEventListener('click', () => {
                item.action();
                this.removeContextMenu();
            });
        }

        if (item.submenu) {
            menuItem.addEventListener('mouseenter', () => {
                this.showSubmenu(menuItem, item.submenu);
            });
        }

        menuItem.addEventListener('mouseenter', () => {
            menuItem.style.background = item.danger ?
                'rgba(var(--color-error-rgb), 0.1)' :
                'var(--color-surface-hover)';
        });

        menuItem.addEventListener('mouseleave', () => {
            menuItem.style.background = 'transparent';
        });

        return menuItem;
    }

    /**
     * Удаление контекстного меню
     */
    removeContextMenu() {
        const existingMenu = document.querySelector('.connection-context-menu');
        if (existingMenu) {
            existingMenu.remove();
        }
    }

    // =======================================================
    // ОПЕРАЦИИ С СОЕДИНЕНИЯМИ
    // =======================================================

    /**
     * Изменение логического оператора соединения
     */
    changeConnectionOperator(connectionId, newOperator) {
        const connection = this.connections.get(connectionId);
        if (!connection || !this.logicalOperators[newOperator]) {
            console.warn(`⚠️ Invalid connection or operator: ${connectionId}, ${newOperator}`);
            return false;
        }

        try {
            // Обновляем данные
            connection.operator = newOperator;
            connection.metadata.updated = new Date().toISOString();

            // Перерисовываем соединение
            this.redrawConnection(connectionId);

            // Уведомляем об изменении
            this.emit('connectionOperatorChanged', { connectionId, operator: newOperator });

            console.log(`🔄 Changed operator for ${connectionId} to ${newOperator}`);
            return true;

        } catch (error) {
            console.error(`❌ Error changing connection operator:`, error);
            return false;
        }
    }

    /**
     * Изменение стиля соединения
     */
    changeConnectionStyle(connectionId, styleChanges) {
        const connection = this.connections.get(connectionId);
        if (!connection) return false;

        try {
            // Обновляем стиль
            Object.assign(connection.style, styleChanges);
            connection.metadata.updated = new Date().toISOString();

            // Применяем изменения к SVG элементу
            const connectionGroup = document.getElementById(connectionId);
            const path = connectionGroup?.querySelector('.connection-path');

            if (path) {
                Object.entries(styleChanges).forEach(([property, value]) => {
                    path.setAttribute(this.camelToKebab(property), value);
                });
            }

            this.emit('connectionStyleChanged', { connectionId, style: styleChanges });
            return true;

        } catch (error) {
            console.error(`❌ Error changing connection style:`, error);
            return false;
        }
    }

    /**
     * Удаление соединения
     */
    deleteConnection(connectionId) {
        const connection = this.connections.get(connectionId);
        if (!connection) {
            console.warn(`⚠️ Connection ${connectionId} not found for deletion`);
            return false;
        }

        const confirmMessage = `Удалить соединение между узлами?`;
        if (!confirm(confirmMessage)) {
            return false;
        }

        try {
            console.log(`🗑️ Deleting connection: ${connectionId}`);

            // Уведомляем о предстоящем удалении
            this.emit('connectionDeleting', { connectionId, connection });

            // Удаляем SVG элементы
            const connectionGroup = document.getElementById(connectionId);
            if (connectionGroup) {
                connectionGroup.remove();
            }

            // Очищаем обработчики событий
            this.connectionEventListeners.delete(connectionId);

            // Удаляем из данных
            this.connections.delete(connectionId);

            // Уведомляем об успешном удалении
            this.emit('connectionDeleted', { connectionId });

            console.log(`✅ Connection ${connectionId} deleted successfully`);
            return true;

        } catch (error) {
            console.error(`❌ Error deleting connection ${connectionId}:`, error);
            this.showError(`Ошибка удаления соединения: ${error.message}`);
            return false;
        }
    }

    /**
     * Перерисовка соединения
     */
    redrawConnection(connectionId) {
        const connection = this.connections.get(connectionId);
        if (!connection) return;

        // Удаляем существующий элемент
        const existingGroup = document.getElementById(connectionId);
        if (existingGroup) {
            existingGroup.remove();
        }

        // Перерисовываем
        this.renderConnection(connection);
    }

    /**
     * Перерисовка всех соединений
     */
    redrawAllConnections() {
        console.log('🎨 Redrawing all connections...');

        // Очищаем группу соединений
        this.connectionsGroup.innerHTML = '';

        // Перерисовываем каждое соединение
        this.connections.forEach((connection) => {
            this.renderConnection(connection);
        });

        console.log(`✅ Redrawn ${this.connections.size} connections`);
    }

    // =======================================================
    // ОБРАБОТЧИКИ СОБЫТИЙ CANVAS
    // =======================================================

    /**
     * Обработчик изменения позиции узла
     */
    handleNodePositionChanged(data) {
        const { nodeId } = data;

        // Находим все соединения, связанные с этим узлом
        const relatedConnections = Array.from(this.connections.values()).filter(
            connection => connection.from.nodeId === nodeId || connection.to.nodeId === nodeId
        );

        // Перерисовываем связанные соединения
        relatedConnections.forEach(connection => {
            this.redrawConnection(connection.id);
        });
    }

    /**
     * Обработчик удаления узла
     */
    handleNodeDeleted(data) {
        const { nodeId } = data;

        // Находим все соединения, связанные с удаленным узлом
        const connectionsToDelete = Array.from(this.connections.entries()).filter(
            ([connectionId, connection]) =>
                connection.from.nodeId === nodeId || connection.to.nodeId === nodeId
        );

        // Удаляем связанные соединения
        connectionsToDelete.forEach(([connectionId]) => {
            this.deleteConnection(connectionId);
        });

        console.log(`🗑️ Deleted ${connectionsToDelete.length} connections related to node ${nodeId}`);
    }

    /**
     * Обработчик очистки canvas
     */
    handleCanvasCleared() {
        console.log('🧹 Clearing all connections...');

        // Очищаем все соединения
        this.connections.clear();
        this.connectionEventListeners.clear();

        // Очищаем SVG слой
        if (this.connectionsGroup) {
            this.connectionsGroup.innerHTML = '';
        }

        // Сбрасываем состояние
        this.cancelConnection();

        console.log('✅ All connections cleared');
    }

    /**
     * Обработчики глобальных событий мыши
     */
    handleGlobalMouseMove(event) {
        if (!this.isConnecting || !this.tempConnectionPath || !this.connectionStart) {
            return;
        }

        // Обновляем временную линию
        const canvasRect = this.canvasManager.canvasElement.getBoundingClientRect();
        const currentPos = {
            x: event.clientX - canvasRect.left,
            y: event.clientY - canvasRect.top
        };

        const pathData = this.buildConnectionPath(this.connectionStart.position, currentPos);
        this.tempConnectionPath.setAttribute('d', pathData);
    }

    handleGlobalMouseUp(event) {
        if (!this.isConnecting) return;

        // Проверяем, не попали ли в точку соединения
        const target = event.target;
        if (target.classList.contains('connection-point')) {
            // Обработчик уже сработал в handleConnectionPointClick
            return;
        }

        // Отменяем соединение
        this.cancelConnection();
    }

    // =======================================================
    // TOUCH СОБЫТИЯ
    // =======================================================

    /**
     * Обработчики touch событий
     */
    handleTouchStart(event) {
        // Имитируем mouse события для touch устройств
        if (event.touches.length === 1) {
            const touch = event.touches[0];

            if (touch.target.classList.contains('connection-point')) {
                event.preventDefault();
                this.simulateTouchAsMouseEvent('mousedown', touch);
            }
        }
    }

    handleTouchMove(event) {
        if (this.isConnecting && event.touches.length === 1) {
            event.preventDefault();
            const touch = event.touches[0];
            this.simulateTouchAsMouseEvent('mousemove', touch);
        }
    }

    handleTouchEnd(event) {
        if (this.isConnecting) {
            event.preventDefault();

            // Проверяем, что находится под последним касанием
            const touch = event.changedTouches[0];
            const elementUnder = document.elementFromPoint(touch.clientX, touch.clientY);

            if (elementUnder && elementUnder.classList.contains('connection-point')) {
                this.simulateTouchAsMouseEvent('mouseup', touch, elementUnder);
            } else {
                this.cancelConnection();
            }
        }
    }

    /**
     * Имитация mouse события из touch
     */
    simulateTouchAsMouseEvent(type, touch, target = null) {
        const mouseEvent = new MouseEvent(type, {
            bubbles: true,
            cancelable: true,
            clientX: touch.clientX,
            clientY: touch.clientY,
            button: 0
        });

        (target || touch.target).dispatchEvent(mouseEvent);
    }

    // =======================================================
    // ВАЛИДАЦИЯ СОЕДИНЕНИЙ
    // =======================================================

    /**
     * Валидация соединения
     */
    validateConnection(fromNodeId, toNodeId, fromPointType, toPointType) {
        const errors = [];
        const warnings = [];

        // Проверка на самосоединение
        if (fromNodeId === toNodeId && !this.validationRules.allowSelfConnection) {
            errors.push('Самосоединение узла не разрешено');
        }

        // Проверка направления соединения
        if (fromPointType === 'input' && toPointType === 'output') {
            errors.push('Неверное направление соединения: выход должен соединяться с входом');
        }

        // Проверка на существующие соединения
        if (!this.validationRules.allowMultipleConnections) {
            const existingConnection = Array.from(this.connections.values()).find(
                conn => conn.from.nodeId === fromNodeId && conn.to.nodeId === toNodeId
            );

            if (existingConnection) {
                errors.push('Соединение между этими узлами уже существует');
            }
        }

        // Проверка на циклы
        if (!this.validationRules.allowCycles && this.wouldCreateCycle(fromNodeId, toNodeId)) {
            errors.push('Соединение создаст циклическую зависимость');
        }

        // Проверка лимитов соединений
        const inputConnections = this.getNodeInputConnections(toNodeId);
        const outputConnections = this.getNodeOutputConnections(fromNodeId);

        if (inputConnections.length >= this.validationRules.maxInputConnections) {
            warnings.push(`Узел имеет максимальное количество входящих соединений (${this.validationRules.maxInputConnections})`);
        }

        if (outputConnections.length >= this.validationRules.maxOutputConnections) {
            warnings.push(`Узел имеет максимальное количество исходящих соединений (${this.validationRules.maxOutputConnections})`);
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * Проверка на создание цикла
     */
    wouldCreateCycle(fromNodeId, toNodeId) {
        // Простая проверка: есть ли путь от toNodeId к fromNodeId
        const visited = new Set();

        const hasPath = (startNode, targetNode) => {
            if (startNode === targetNode) return true;
            if (visited.has(startNode)) return false;

            visited.add(startNode);

            // Ищем исходящие соединения от startNode
            const outgoingConnections = Array.from(this.connections.values()).filter(
                conn => conn.from.nodeId === startNode
            );

            return outgoingConnections.some(conn => hasPath(conn.to.nodeId, targetNode));
        };

        return hasPath(toNodeId, fromNodeId);
    }

    /**
     * Получение входящих соединений узла
     */
    getNodeInputConnections(nodeId) {
        return Array.from(this.connections.values()).filter(
            conn => conn.to.nodeId === nodeId
        );
    }

    /**
     * Получение исходящих соединений узла
     */
    getNodeOutputConnections(nodeId) {
        return Array.from(this.connections.values()).filter(
            conn => conn.from.nodeId === nodeId
        );
    }

    /**
     * Показ ошибки валидации
     */
    showValidationError(errors) {
        const message = errors.join('\n');

        if (window.app?.showErrorNotification) {
            window.app.showErrorNotification(message);
        } else {
            alert(`Ошибка валидации соединения:\n${message}`);
        }
    }

    // =======================================================
    // ЭКСПОРТ И ИМПОРТ
    // =======================================================

    /**
     * Экспорт данных соединений
     */
    exportConnectionsData() {
        const connectionsData = Array.from(this.connections.values()).map(connection => ({
            id: connection.id,
            from: { ...connection.from },
            to: { ...connection.to },
            operator: connection.operator,
            metadata: { ...connection.metadata },
            style: { ...connection.style }
        }));

        return {
            version: this.version,
            timestamp: new Date().toISOString(),
            settings: {
                validationRules: { ...this.validationRules },
                connectionStyle: { ...this.connectionStyle }
            },
            connections: connectionsData
        };
    }

    /**
     * Импорт данных соединений
     */
    async importConnectionsData(data) {
        try {
            console.log('📥 Importing connections data...');

            // Очищаем текущие соединения
            this.clearAllConnections();

            // Применяем настройки
            if (data.settings) {
                if (data.settings.validationRules) {
                    this.validationRules = { ...this.validationRules, ...data.settings.validationRules };
                }

                if (data.settings.connectionStyle) {
                    this.connectionStyle = { ...this.connectionStyle, ...data.settings.connectionStyle };
                }
            }

            // Импортируем соединения
            if (data.connections && Array.isArray(data.connections)) {
                for (const connectionData of data.connections) {
                    // Валидируем, что узлы существуют
                    const fromExists = this.canvasManager?.canvasNodes?.has(connectionData.from.nodeId);
                    const toExists = this.canvasManager?.canvasNodes?.has(connectionData.to.nodeId);

                    if (fromExists && toExists) {
                        this.connections.set(connectionData.id, connectionData);
                        this.renderConnection(connectionData);
                    } else {
                        console.warn(`⚠️ Skipping connection ${connectionData.id} - nodes not found`);
                    }
                }
            }

            console.log(`✅ Imported ${data.connections?.length || 0} connections`);
            this.emit('connectionsImported', { count: data.connections?.length || 0 });

        } catch (error) {
            console.error('❌ Error importing connections data:', error);
            this.showError('Ошибка импорта соединений');
            throw error;
        }
    }

    /**
     * Очистка всех соединений
     */
    clearAllConnections() {
        console.log('🧹 Clearing all connections...');

        this.connections.clear();
        this.connectionEventListeners.clear();

        if (this.connectionsGroup) {
            this.connectionsGroup.innerHTML = '';
        }

        this.cancelConnection();
    }

    // =======================================================
    // УТИЛИТАРНЫЕ МЕТОДЫ
    // =======================================================

    /**
     * Генерация логического выражения
     */
    generateLogicExpression() {
        if (this.connections.size === 0) {
            return '';
        }

        try {
            // Простое построение выражения на основе соединений
            const expressions = [];

            this.connections.forEach(connection => {
                const fromNode = this.canvasManager?.canvasNodes?.get(connection.from.nodeId);
                const toNode = this.canvasManager?.canvasNodes?.get(connection.to.nodeId);

                if (fromNode && toNode) {
                    const fromName = fromNode.definition?.name || connection.from.nodeId;
                    const toName = toNode.definition?.name || connection.to.nodeId;
                    expressions.push(`${fromName} ${connection.operator} ${toName}`);
                }
            });

            return expressions.join(' ');

        } catch (error) {
            console.error('❌ Error generating logic expression:', error);
            return '';
        }
    }

    /**
     * Получение статистики соединений
     */
    getConnectionStats() {
        const operatorCounts = {};

        this.connections.forEach(connection => {
            operatorCounts[connection.operator] = (operatorCounts[connection.operator] || 0) + 1;
        });

        return {
            version: this.version,
            totalConnections: this.connections.size,
            operatorCounts,
            maxConnections: this.maxConnections,
            validationRules: { ...this.validationRules },
            initialized: this.isInitialized
        };
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
     * Активация Connection Manager
     */
    activate() {
        if (!this.isInitialized) {
            console.warn('⚠️ Connection Manager not initialized');
            return;
        }

        // Перерисовываем все соединения
        this.redrawAllConnections();

        console.log('🟢 Connection Manager activated');
        this.emit('activated');
    }

    /**
     * Деактивация Connection Manager
     */
    deactivate() {
        // Отменяем текущее соединение
        this.cancelConnection();

        console.log('🟡 Connection Manager deactivated');
        this.emit('deactivated');
    }

    /**
     * Очистка ресурсов
     */
    cleanup() {
        console.log('🧹 Cleaning up Connection Manager...');

        try {
            // Отменяем текущее соединение
            this.cancelConnection();

            // Очищаем все соединения
            this.clearAllConnections();

            // Удаляем обработчики событий
            this.eventHandlers.clear();
            this.connectionEventListeners.clear();

            // Очищаем SVG слой
            if (this.svgLayer) {
                this.svgLayer.innerHTML = '';
            }

            // Удаляем контекстное меню
            this.removeContextMenu();

            // Сбрасываем состояние
            this.isInitialized = false;
            this.isConnecting = false;
            this.connectionStart = null;

            console.log('✅ Connection Manager cleanup completed');

        } catch (error) {
            console.error('❌ Error during Connection Manager cleanup:', error);
        }
    }
}

// =======================================================
// ЭКСПОРТ И ГЛОБАЛЬНАЯ ИНТЕГРАЦИЯ
// =======================================================

/**
 * Глобальная функция создания Connection Manager
 */
function createConnectionManager(coreInstance, canvasManager) {
    return new ConnectionManager(coreInstance, canvasManager);
}

// Экспорт для модульных систем
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ConnectionManager,
        createConnectionManager
    };
}

// ES6 экспорты
if (typeof window !== 'undefined') {
    window.ConnectionManager = ConnectionManager;
    window.createConnectionManager = createConnectionManager;

    // Для интеграции с модульной системой attack-constructor
    window.ConnectionManagerExports = {
        ConnectionManager,
        createConnectionManager,
        version: '4.0.0-Enhanced-Connection'
    };
}

console.log('✅ Connection Manager v4.0.0-Enhanced loaded successfully');

/**
 * =======================================================
 * КОНЕЦ ФАЙЛА connection-manager.js
 * 
 * IP Roast Enterprise 4.0 - Connection Manager Module
 * Специализированный модуль для управления соединениями
 * Версия: 4.0.0-Enhanced-Connection
 * 
 * Ключевые возможности:
 * - Полнофункциональное управление соединениями (CRUD)
 * - Drag & Drop создание соединений между узлами
 * - 6 типов логических операторов (AND, OR, NOT, XOR, NAND, NOR)
 * - SVG отрисовка с кривыми Безье
 * - Валидация соединений и предотвращение циклов
 * - Контекстные меню для редактирования
 * - Touch gestures для мобильных устройств
 * - Экспорт/импорт состояния соединений
 * - Интеграция с canvas-manager и core модулем
 * - Enterprise-уровень производительности и надежности
 * =======================================================
 */
