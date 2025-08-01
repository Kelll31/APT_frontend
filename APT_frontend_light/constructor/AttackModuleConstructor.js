/**
 * IP ROAST 4.0 - Attack Module Constructor
 * Энтерпрайз конструктор модулей атак с визуальным интерфейсом
 * Поддержка 25 модулей в 8 категориях, drag & drop, workflow management
 * 
 * @version 4.0.0
 * @author IP Roast Development Team
 * @license Enterprise
 */

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faSearch,
    faList,
    faGlobe,
    faKey,
    faBug,
    faBomb,
    faFile,
    faArrowUp,
    faAnchor,
    faTimes,
    faPlus,
    faSave,
    faUndo,
    faRedo,
    faPlay,
    faStop,
    faCog,
    faEye,
    faDownload,
    faUpload,
    faTrash,
    faCopy,
    faEdit,
    faNetworkWired,
    faShield,
    faUserSecret,
    faDatabase,
    faServer,
    faCode,
    faLock,
    faUnlock,
    faExclamationTriangle,
    faCheckCircle
} from '@fortawesome/free-solid-svg-icons';

// Полная библиотека из 25 модулей в 8 категориях
const MODULE_CATEGORIES = [
    {
        id: 'signature_analysis',
        name: 'Сигнатурный анализ',
        color: '#3B82F6',
        modules: [
            {
                id: 'sig_scanner',
                name: 'Сканер сигнатур',
                description: 'Базовое сканирование и анализ отпечатков сервисов',
                icon: faSearch,
                inputs: ['target'],
                outputs: ['signatures'],
                settings: {
                    target: { type: 'text', label: 'IP/Диапазон цели', required: true },
                    timeout: { type: 'number', label: 'Таймаут (сек)', default: 30 },
                    threads: { type: 'number', label: 'Количество потоков', default: 10 }
                }
            },
            {
                id: 'service_detector',
                name: 'Детектор сервисов',
                description: 'Интеллектуальная идентификация типов сервисов',
                icon: faNetworkWired,
                inputs: ['signatures'],
                outputs: ['services'],
                settings: {
                    deep_scan: { type: 'checkbox', label: 'Глубокое сканирование', default: false },
                    service_db: { type: 'select', label: 'База сервисов', options: ['standard', 'extended', 'custom'] }
                }
            },
            {
                id: 'vuln_matcher',
                name: 'Сопоставитель уязвимостей',
                description: 'Автоматический поиск CVE для обнаруженных сервисов',
                icon: faShield,
                inputs: ['services'],
                outputs: ['vulnerabilities'],
                settings: {
                    cve_database: { type: 'select', label: 'База CVE', options: ['nvd', 'mitre', 'exploit-db'] },
                    severity_filter: { type: 'select', label: 'Фильтр критичности', options: ['all', 'high', 'critical'] }
                }
            }
        ]
    },
    {
        id: 'intelligence',
        name: 'Интеллектуальные модули',
        color: '#8B5CF6',
        modules: [
            {
                id: 'decision_engine',
                name: 'Движок принятия решений',
                description: 'Центральный ИИ-модуль системы',
                icon: faCog,
                inputs: ['vulnerabilities', 'context'],
                outputs: ['decisions', 'priorities'],
                settings: {
                    ai_model: { type: 'select', label: 'ИИ модель', options: ['neural_net', 'decision_tree', 'ensemble'] },
                    confidence_threshold: { type: 'range', label: 'Порог уверенности', min: 0, max: 1, step: 0.1, default: 0.7 }
                }
            },
            {
                id: 'adaptive_selector',
                name: 'Адаптивный селектор',
                description: 'Динамический выбор стратегии атак',
                icon: faUserSecret,
                inputs: ['decisions'],
                outputs: ['strategy'],
                settings: {
                    adaptation_mode: { type: 'select', label: 'Режим адаптации', options: ['conservative', 'aggressive', 'balanced'] },
                    learning_rate: { type: 'range', label: 'Скорость обучения', min: 0.01, max: 1, step: 0.01, default: 0.1 }
                }
            },
            {
                id: 'priority_analyzer',
                name: 'Анализатор приоритетов',
                description: 'Ранжирование целей по критичности',
                icon: faList,
                inputs: ['strategy', 'vulnerabilities'],
                outputs: ['ranked_targets'],
                settings: {
                    ranking_algorithm: { type: 'select', label: 'Алгоритм ранжирования', options: ['cvss', 'custom', 'risk_based'] },
                    business_impact: { type: 'checkbox', label: 'Учитывать бизнес-влияние', default: true }
                }
            }
        ]
    },
    {
        id: 'reconnaissance',
        name: 'Разведка',
        color: '#10B981',
        modules: [
            {
                id: 'osint_collector',
                name: 'OSINT сборщик',
                description: 'Сбор открытой разведывательной информации',
                icon: faGlobe,
                inputs: ['target'],
                outputs: ['osint_data'],
                settings: {
                    sources: { type: 'multiselect', label: 'Источники OSINT', options: ['shodan', 'censys', 'google', 'social_media'] },
                    depth: { type: 'select', label: 'Глубина поиска', options: ['surface', 'deep', 'comprehensive'] }
                }
            },
            {
                id: 'dns_enum',
                name: 'DNS перечисление',
                description: 'Перечисление DNS записей и субдоменов',
                icon: faDatabase,
                inputs: ['target'],
                outputs: ['dns_records'],
                settings: {
                    record_types: { type: 'multiselect', label: 'Типы записей', options: ['A', 'AAAA', 'MX', 'TXT', 'NS', 'CNAME'] },
                    subdomain_bruteforce: { type: 'checkbox', label: 'Брутфорс субдоменов', default: true }
                }
            },
            {
                id: 'social_engineer',
                name: 'Социальная инженерия',
                description: 'Модуль социальной инженерии и фишинга',
                icon: faUserSecret,
                inputs: ['osint_data'],
                outputs: ['social_vectors'],
                settings: {
                    attack_vectors: { type: 'multiselect', label: 'Векторы атак', options: ['phishing', 'pretexting', 'baiting'] },
                    target_roles: { type: 'multiselect', label: 'Целевые роли', options: ['admin', 'user', 'support'] }
                }
            }
        ]
    },
    {
        id: 'attacks',
        name: 'Модули атак',
        color: '#EF4444',
        modules: [
            {
                id: 'web_attacks',
                name: 'Веб-атаки',
                description: 'SQL-инъекции, XSS, CSRF атаки',
                icon: faBug,
                inputs: ['web_services'],
                outputs: ['web_exploits'],
                settings: {
                    attack_types: { type: 'multiselect', label: 'Типы атак', options: ['sql_injection', 'xss', 'csrf', 'lfi', 'rfi'] },
                    payload_complexity: { type: 'select', label: 'Сложность пэйлоадов', options: ['basic', 'advanced', 'obfuscated'] }
                }
            },
            {
                id: 'network_attacks',
                name: 'Сетевые атаки',
                description: 'Buffer overflow, DoS, протокольные атаки',
                icon: faBomb,
                inputs: ['network_services'],
                outputs: ['network_exploits'],
                settings: {
                    protocols: { type: 'multiselect', label: 'Протоколы', options: ['tcp', 'udp', 'icmp', 'arp'] },
                    attack_intensity: { type: 'select', label: 'Интенсивность атак', options: ['low', 'medium', 'high'] }
                }
            },
            {
                id: 'auth_bypass',
                name: 'Обход аутентификации',
                description: 'Брутфорс, словарные атаки, обход аутентификации',
                icon: faKey,
                inputs: ['auth_services'],
                outputs: ['credentials'],
                settings: {
                    methods: { type: 'multiselect', label: 'Методы', options: ['bruteforce', 'dictionary', 'rainbow_tables'] },
                    wordlists: { type: 'select', label: 'Словари', options: ['common', 'rockyou', 'custom'] }
                }
            },
            {
                id: 'privilege_escalation',
                name: 'Повышение привилегий',
                description: 'Эскалация прав в системе',
                icon: faArrowUp,
                inputs: ['credentials', 'system_info'],
                outputs: ['elevated_access'],
                settings: {
                    os_type: { type: 'select', label: 'Тип ОС', options: ['windows', 'linux', 'macos', 'auto'] },
                    escalation_methods: { type: 'multiselect', label: 'Методы эскалации', options: ['kernel_exploits', 'suid', 'sudo', 'services'] }
                }
            }
        ]
    },
    {
        id: 'post_exploitation',
        name: 'Пост-эксплуатация',
        color: '#F59E0B',
        modules: [
            {
                id: 'data_extraction',
                name: 'Извлечение данных',
                description: 'Извлечение и экфильтрация конфиденциальных данных',
                icon: faFile,
                inputs: ['elevated_access'],
                outputs: ['extracted_data'],
                settings: {
                    data_types: { type: 'multiselect', label: 'Типы данных', options: ['documents', 'databases', 'passwords', 'certificates'] },
                    extraction_method: { type: 'select', label: 'Метод извлечения', options: ['direct', 'encrypted', 'steganography'] }
                }
            },
            {
                id: 'lateral_movement',
                name: 'Латеральное движение',
                description: 'Распространение по сети',
                icon: faNetworkWired,
                inputs: ['elevated_access', 'network_topology'],
                outputs: ['additional_access'],
                settings: {
                    movement_techniques: { type: 'multiselect', label: 'Техники движения', options: ['pass_the_hash', 'wmi', 'psexec', 'ssh_tunneling'] },
                    stealth_level: { type: 'select', label: 'Уровень скрытности', options: ['low', 'medium', 'high'] }
                }
            },
            {
                id: 'persistence',
                name: 'Поддержание доступа',
                description: 'Закрепление в системе для долговременного доступа',
                icon: faAnchor,
                inputs: ['elevated_access'],
                outputs: ['persistent_access'],
                settings: {
                    persistence_methods: { type: 'multiselect', label: 'Методы закрепления', options: ['services', 'registry', 'scheduled_tasks', 'backdoors'] },
                    persistence_level: { type: 'select', label: 'Уровень закрепления', options: ['user', 'system', 'kernel'] }
                }
            }
        ]
    },
    {
        id: 'evasion',
        name: 'Модули уклонения',
        color: '#6366F1',
        modules: [
            {
                id: 'av_evasion',
                name: 'Обход антивирусов',
                description: 'Обход антивирусного ПО и EDR систем',
                icon: faShield,
                inputs: ['payloads'],
                outputs: ['evasive_payloads'],
                settings: {
                    evasion_techniques: { type: 'multiselect', label: 'Техники обхода', options: ['polymorphism', 'encryption', 'packing', 'obfuscation'] },
                    target_av: { type: 'multiselect', label: 'Целевые антивирусы', options: ['windows_defender', 'kaspersky', 'norton', 'mcafee'] }
                }
            },
            {
                id: 'traffic_obfuscation',
                name: 'Обфускация трафика',
                description: 'Сокрытие сетевого трафика от систем мониторинга',
                icon: faEye,
                inputs: ['network_traffic'],
                outputs: ['obfuscated_traffic'],
                settings: {
                    obfuscation_methods: { type: 'multiselect', label: 'Методы обфускации', options: ['encryption', 'steganography', 'protocol_tunneling'] },
                    cover_protocols: { type: 'multiselect', label: 'Протоколы-прикрытия', options: ['http', 'https', 'dns', 'icmp'] }
                }
            },
            {
                id: 'anti_forensics',
                name: 'Анти-форензика',
                description: 'Противодействие криминалистическому анализу',
                icon: faTrash,
                inputs: ['system_state'],
                outputs: ['cleaned_system'],
                settings: {
                    cleanup_level: { type: 'select', label: 'Уровень очистки', options: ['basic', 'thorough', 'military'] },
                    artifact_removal: { type: 'multiselect', label: 'Удаление артефактов', options: ['logs', 'registry', 'temp_files', 'memory_dumps'] }
                }
            }
        ]
    },
    {
        id: 'analytics',
        name: 'Аналитические модули',
        color: '#14B8A6',
        modules: [
            {
                id: 'vuln_assessor',
                name: 'Оценщик уязвимостей',
                description: 'Анализ и оценка найденных уязвимостей',
                icon: faExclamationTriangle,
                inputs: ['vulnerabilities', 'exploits'],
                outputs: ['risk_assessment'],
                settings: {
                    assessment_framework: { type: 'select', label: 'Фреймворк оценки', options: ['cvss', 'owasp', 'nist'] },
                    business_context: { type: 'checkbox', label: 'Учитывать бизнес-контекст', default: true }
                }
            },
            {
                id: 'report_generator',
                name: 'Генератор отчетов',
                description: 'Автоматическая генерация детальных отчетов',
                icon: faFile,
                inputs: ['all_data'],
                outputs: ['reports'],
                settings: {
                    report_format: { type: 'multiselect', label: 'Форматы отчетов', options: ['pdf', 'html', 'docx', 'json'] },
                    detail_level: { type: 'select', label: 'Уровень детализации', options: ['executive', 'technical', 'comprehensive'] }
                }
            },
            {
                id: 'visualizer',
                name: 'Визуализатор',
                description: 'Создание интерактивных диаграмм и графиков',
                icon: faNetworkWired,
                inputs: ['network_topology', 'attack_paths'],
                outputs: ['visualizations'],
                settings: {
                    visualization_types: { type: 'multiselect', label: 'Типы визуализации', options: ['network_graph', 'attack_tree', 'timeline', 'heatmap'] },
                    interactive: { type: 'checkbox', label: 'Интерактивная визуализация', default: true }
                }
            }
        ]
    },
    {
        id: 'system',
        name: 'Системные модули',
        color: '#6B7280',
        modules: [
            {
                id: 'payload_generator',
                name: 'Генератор пэйлоадов',
                description: 'Создание пользовательских эксплойтов и пэйлоадов',
                icon: faCode,
                inputs: ['exploit_templates'],
                outputs: ['custom_payloads'],
                settings: {
                    payload_types: { type: 'multiselect', label: 'Типы пэйлоадов', options: ['shellcode', 'meterpreter', 'custom_binary'] },
                    encoding: { type: 'select', label: 'Кодировка', options: ['none', 'base64', 'hex', 'custom'] }
                }
            },
            {
                id: 'encoder',
                name: 'Кодировщик',
                description: 'Кодирование и шифрование данных и команд',
                icon: faLock,
                inputs: ['raw_data'],
                outputs: ['encoded_data'],
                settings: {
                    encoding_methods: { type: 'multiselect', label: 'Методы кодирования', options: ['base64', 'hex', 'url', 'unicode'] },
                    encryption: { type: 'select', label: 'Шифрование', options: ['none', 'aes', 'rsa', 'custom'] }
                }
            },
            {
                id: 'config_manager',
                name: 'Менеджер конфигураций',
                description: 'Управление настройками и конфигурациями модулей',
                icon: faCog,
                inputs: ['module_configs'],
                outputs: ['optimized_configs'],
                settings: {
                    auto_optimization: { type: 'checkbox', label: 'Автоматическая оптимизация', default: false },
                    config_profiles: { type: 'multiselect', label: 'Профили конфигурации', options: ['stealth', 'aggressive', 'balanced'] }
                }
            }
        ]
    }
];

// Предустановленные шаблоны workflow
const WORKFLOW_TEMPLATES = [
    {
        id: 'basic_pentest',
        name: 'Базовый пентест',
        description: 'Стандартная последовательность для тестирования на проникновение',
        modules: [
            { moduleId: 'sig_scanner', position: { x: 50, y: 100 } },
            { moduleId: 'service_detector', position: { x: 300, y: 100 } },
            { moduleId: 'vuln_matcher', position: { x: 550, y: 100 } },
            { moduleId: 'decision_engine', position: { x: 800, y: 100 } }
        ],
        connections: [
            { from: 0, to: 1 },
            { from: 1, to: 2 },
            { from: 2, to: 3 }
        ]
    },
    {
        id: 'advanced_apt',
        name: 'Продвинутая APT симуляция',
        description: 'Комплексная имитация APT-атаки с полным жизненным циклом',
        modules: [
            { moduleId: 'osint_collector', position: { x: 50, y: 50 } },
            { moduleId: 'social_engineer', position: { x: 300, y: 50 } },
            { moduleId: 'web_attacks', position: { x: 550, y: 50 } },
            { moduleId: 'privilege_escalation', position: { x: 800, y: 50 } },
            { moduleId: 'lateral_movement', position: { x: 550, y: 200 } },
            { moduleId: 'persistence', position: { x: 800, y: 200 } },
            { moduleId: 'data_extraction', position: { x: 1050, y: 200 } },
            { moduleId: 'anti_forensics', position: { x: 1050, y: 350 } }
        ],
        connections: [
            { from: 0, to: 1 },
            { from: 1, to: 2 },
            { from: 2, to: 3 },
            { from: 3, to: 4 },
            { from: 4, to: 5 },
            { from: 5, to: 6 },
            { from: 6, to: 7 }
        ]
    },
    {
        id: 'stealth_recon',
        name: 'Скрытная разведка',
        description: 'Пассивная разведка с минимальным следом',
        modules: [
            { moduleId: 'osint_collector', position: { x: 50, y: 100 } },
            { moduleId: 'dns_enum', position: { x: 300, y: 100 } },
            { moduleId: 'traffic_obfuscation', position: { x: 550, y: 100 } },
            { moduleId: 'visualizer', position: { x: 800, y: 100 } }
        ],
        connections: [
            { from: 0, to: 1 },
            { from: 1, to: 2 },
            { from: 2, to: 3 }
        ]
    }
];

// Utility функции
const generateUUID = () => {
    return 'module_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36);
};

const validateWorkflow = (modules, connections) => {
    const errors = [];

    // Проверка на циклические зависимости
    const visited = new Set();
    const recursionStack = new Set();

    const hasCycle = (moduleId) => {
        if (recursionStack.has(moduleId)) return true;
        if (visited.has(moduleId)) return false;

        visited.add(moduleId);
        recursionStack.add(moduleId);

        const outgoingConnections = connections.filter(conn => conn.from === moduleId);
        for (const conn of outgoingConnections) {
            if (hasCycle(conn.to)) return true;
        }

        recursionStack.delete(moduleId);
        return false;
    };

    for (const module of modules) {
        if (hasCycle(module.id)) {
            errors.push(`Обнаружена циклическая зависимость в модуле: ${module.name}`);
            break;
        }
    }

    // Проверка совместимости входов/выходов
    for (const conn of connections) {
        const fromModule = modules.find(m => m.id === conn.from);
        const toModule = modules.find(m => m.id === conn.to);

        if (!fromModule || !toModule) {
            errors.push(`Неверное соединение: модуль не найден`);
            continue;
        }

        const moduleDefFrom = findModuleDefinition(fromModule.moduleId);
        const moduleDefTo = findModuleDefinition(toModule.moduleId);

        if (moduleDefFrom && moduleDefTo) {
            const hasCompatibleOutput = moduleDefFrom.outputs?.some(output =>
                moduleDefTo.inputs?.includes(output)
            );

            if (!hasCompatibleOutput) {
                errors.push(`Несовместимые модули: ${fromModule.name} -> ${toModule.name}`);
            }
        }
    }

    return errors;
};

const findModuleDefinition = (moduleId) => {
    for (const category of MODULE_CATEGORIES) {
        const module = category.modules.find(m => m.id === moduleId);
        if (module) return module;
    }
    return null;
};

const exportWorkflow = (modules, connections, format = 'json') => {
    const workflow = {
        version: '4.0',
        timestamp: new Date().toISOString(),
        modules: modules.map(m => ({
            id: m.id,
            moduleId: m.moduleId,
            name: m.name,
            settings: m.settings,
            position: m.position
        })),
        connections: connections,
        metadata: {
            totalModules: modules.length,
            totalConnections: connections.length
        }
    };

    switch (format) {
        case 'json':
            return JSON.stringify(workflow, null, 2);
        case 'yaml':
            // Простая YAML сериализация
            return Object.entries(workflow).map(([key, value]) =>
                `${key}:\n  ${JSON.stringify(value, null, 2).replace(/\n/g, '\n  ')}`
            ).join('\n');
        default:
            return workflow;
    }
};

// Основной компонент конструктора модулей атак
export default function AttackModuleConstructor({
    onWorkflowChange,
    onExecute,
    initialWorkflow = null,
    readOnly = false,
    theme = 'dark'
}) {
    // Основные состояния
    const [workflowModules, setWorkflowModules] = useState([]);
    const [connections, setConnections] = useState([]);
    const [selectedModuleId, setSelectedModuleId] = useState(null);
    const [draggingModule, setDraggingModule] = useState(null);
    const [connecting, setConnecting] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [isExecuting, setIsExecuting] = useState(false);
    const [validationErrors, setValidationErrors] = useState([]);

    // UI состояния
    const [showLibrary, setShowLibrary] = useState(true);
    const [showProperties, setShowProperties] = useState(true);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
    const [history, setHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    // Refs
    const canvasRef = useRef(null);
    const fileInputRef = useRef(null);

    // Эффекты инициализации
    useEffect(() => {
        if (initialWorkflow) {
            setWorkflowModules(initialWorkflow.modules || []);
            setConnections(initialWorkflow.connections || []);
        }
    }, [initialWorkflow]);

    useEffect(() => {
        const errors = validateWorkflow(workflowModules, connections);
        setValidationErrors(errors);

        if (onWorkflowChange) {
            onWorkflowChange({
                modules: workflowModules,
                connections,
                isValid: errors.length === 0
            });
        }
    }, [workflowModules, connections, onWorkflowChange]);

    // Сохранение истории для Undo/Redo
    const saveToHistory = useCallback(() => {
        const state = {
            modules: [...workflowModules],
            connections: [...connections],
            timestamp: Date.now()
        };

        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(state);

        if (newHistory.length > 50) { // Лимит истории
            newHistory.shift();
        }

        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    }, [workflowModules, connections, history, historyIndex]);

    // Функции управления модулями
    const addModuleToWorkflow = useCallback((moduleDefinition, position) => {
        if (readOnly) return;

        const id = generateUUID();
        const newModule = {
            id,
            moduleId: moduleDefinition.id,
            category: findCategoryForModule(moduleDefinition.id),
            name: moduleDefinition.name,
            description: moduleDefinition.description,
            settings: getDefaultSettings(moduleDefinition),
            position: position || { x: 100, y: 100 },
            status: 'configured' // configured, running, completed, error
        };

        setWorkflowModules(prev => [...prev, newModule]);
        saveToHistory();
    }, [readOnly, saveToHistory]);

    const removeModuleFromWorkflow = useCallback((moduleId) => {
        if (readOnly) return;

        setWorkflowModules(prev => prev.filter(m => m.id !== moduleId));
        setConnections(prev => prev.filter(conn => conn.from !== moduleId && conn.to !== moduleId));

        if (selectedModuleId === moduleId) {
            setSelectedModuleId(null);
        }

        saveToHistory();
    }, [readOnly, selectedModuleId, saveToHistory]);

    const updateModuleSettings = useCallback((moduleId, newSettings) => {
        if (readOnly) return;

        setWorkflowModules(prev => prev.map(m =>
            m.id === moduleId
                ? { ...m, settings: { ...m.settings, ...newSettings } }
                : m
        ));
    }, [readOnly]);

    const updateModulePosition = useCallback((moduleId, position) => {
        if (readOnly) return;

        setWorkflowModules(prev => prev.map(m =>
            m.id === moduleId ? { ...m, position } : m
        ));
    }, [readOnly]);

    // Функции управления соединениями
    const addConnection = useCallback((fromModuleId, toModuleId) => {
        if (readOnly) return;

        const existingConnection = connections.find(
            conn => conn.from === fromModuleId && conn.to === toModuleId
        );

        if (!existingConnection) {
            setConnections(prev => [...prev, {
                from: fromModuleId,
                to: toModuleId,
                id: generateUUID()
            }]);
            saveToHistory();
        }
    }, [readOnly, connections, saveToHistory]);

    const removeConnection = useCallback((connectionId) => {
        if (readOnly) return;

        setConnections(prev => prev.filter(conn => conn.id !== connectionId));
        saveToHistory();
    }, [readOnly, saveToHistory]);

    // Drag & Drop обработчики
    const handleDragStart = useCallback((moduleDefinition, e) => {
        if (readOnly) return;

        setDraggingModule(moduleDefinition);
        e.dataTransfer.effectAllowed = 'copy';
        e.dataTransfer.setData('text/plain', moduleDefinition.id);
    }, [readOnly]);

    const handleCanvasDrop = useCallback((e) => {
        e.preventDefault();

        if (readOnly || !draggingModule) return;

        const rect = canvasRef.current.getBoundingClientRect();
        const position = {
            x: (e.clientX - rect.left - canvasOffset.x) / zoomLevel,
            y: (e.clientY - rect.top - canvasOffset.y) / zoomLevel
        };

        addModuleToWorkflow(draggingModule, position);
        setDraggingModule(null);
    }, [readOnly, draggingModule, canvasOffset, zoomLevel, addModuleToWorkflow]);

    const handleCanvasDragOver = useCallback((e) => {
        e.preventDefault();
    }, []);

    // Обработчики соединений
    const startConnection = useCallback((moduleId) => {
        if (readOnly) return;
        setConnecting(moduleId);
    }, [readOnly]);

    const completeConnection = useCallback((moduleId) => {
        if (readOnly || !connecting || connecting === moduleId) {
            setConnecting(null);
            return;
        }

        addConnection(connecting, moduleId);
        setConnecting(null);
    }, [readOnly, connecting, addConnection]);

    // Функции работы с шаблонами
    const loadTemplate = useCallback((template) => {
        if (readOnly) return;

        const moduleInstances = template.modules.map((moduleTemplate, index) => {
            const moduleDefinition = findModuleDefinition(moduleTemplate.moduleId);
            if (!moduleDefinition) return null;

            return {
                id: generateUUID(),
                moduleId: moduleTemplate.moduleId,
                category: findCategoryForModule(moduleTemplate.moduleId),
                name: moduleDefinition.name,
                description: moduleDefinition.description,
                settings: getDefaultSettings(moduleDefinition),
                position: moduleTemplate.position,
                status: 'configured'
            };
        }).filter(Boolean);

        const connectionInstances = template.connections.map(connTemplate => ({
            id: generateUUID(),
            from: moduleInstances[connTemplate.from]?.id,
            to: moduleInstances[connTemplate.to]?.id
        })).filter(conn => conn.from && conn.to);

        setWorkflowModules(moduleInstances);
        setConnections(connectionInstances);
        saveToHistory();
    }, [readOnly, saveToHistory]);

    // Функции импорта/экспорта
    const handleExport = useCallback((format = 'json') => {
        const workflowData = exportWorkflow(workflowModules, connections, format);
        const blob = new Blob([workflowData], {
            type: format === 'json' ? 'application/json' : 'text/yaml'
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `workflow_${Date.now()}.${format}`;
        link.click();
        URL.revokeObjectURL(url);
    }, [workflowModules, connections]);

    const handleImport = useCallback((e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const workflow = JSON.parse(event.target.result);
                setWorkflowModules(workflow.modules || []);
                setConnections(workflow.connections || []);
                saveToHistory();
            } catch (error) {
                console.error('Ошибка импорта workflow:', error);
            }
        };
        reader.readAsText(file);
    }, [saveToHistory]);

    // Функции Undo/Redo
    const undo = useCallback(() => {
        if (historyIndex > 0) {
            const prevState = history[historyIndex - 1];
            setWorkflowModules(prevState.modules);
            setConnections(prevState.connections);
            setHistoryIndex(historyIndex - 1);
        }
    }, [history, historyIndex]);

    const redo = useCallback(() => {
        if (historyIndex < history.length - 1) {
            const nextState = history[historyIndex + 1];
            setWorkflowModules(nextState.modules);
            setConnections(nextState.connections);
            setHistoryIndex(historyIndex + 1);
        }
    }, [history, historyIndex]);

    // Функция выполнения workflow
    const executeWorkflow = useCallback(async () => {
        if (readOnly || isExecuting || validationErrors.length > 0) return;

        setIsExecuting(true);

        try {
            if (onExecute) {
                await onExecute({
                    modules: workflowModules,
                    connections
                });
            }

            // Симуляция выполнения для демо
            for (let i = 0; i < workflowModules.length; i++) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                setWorkflowModules(prev => prev.map((m, index) =>
                    index === i ? { ...m, status: 'completed' } : m
                ));
            }

        } catch (error) {
            console.error('Ошибка выполнения workflow:', error);
        } finally {
            setIsExecuting(false);
        }
    }, [readOnly, isExecuting, validationErrors, workflowModules, connections, onExecute]);

    // Вспомогательные функции
    const getDefaultSettings = (moduleDefinition) => {
        const settings = {};
        if (moduleDefinition.settings) {
            Object.entries(moduleDefinition.settings).forEach(([key, config]) => {
                if (config.default !== undefined) {
                    settings[key] = config.default;
                }
            });
        }
        return settings;
    };

    const findCategoryForModule = (moduleId) => {
        for (const category of MODULE_CATEGORIES) {
            if (category.modules.some(m => m.id === moduleId)) {
                return category.id;
            }
        }
        return 'unknown';
    };

    // Фильтрация модулей для поиска
    const filteredCategories = useMemo(() => {
        return MODULE_CATEGORIES.map(category => ({
            ...category,
            modules: category.modules.filter(module => {
                const matchesSearch = searchQuery === '' ||
                    module.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    module.description.toLowerCase().includes(searchQuery.toLowerCase());

                const matchesCategory = selectedCategory === 'all' || category.id === selectedCategory;

                return matchesSearch && matchesCategory;
            })
        })).filter(category => category.modules.length > 0);
    }, [searchQuery, selectedCategory]);

    // Рендер компонентов UI
    const renderToolbar = () => (
        <div className="constructor-toolbar">
            <div className="toolbar-section">
                <button
                    className="tool-btn"
                    onClick={() => setShowLibrary(!showLibrary)}
                    title="Переключить библиотеку модулей"
                >
                    <FontAwesomeIcon icon={faList} />
                </button>

                <button
                    className="tool-btn"
                    onClick={() => setShowProperties(!showProperties)}
                    title="Переключить панель свойств"
                >
                    <FontAwesomeIcon icon={faCog} />
                </button>

                <div className="toolbar-divider"></div>

                <button
                    className="tool-btn"
                    onClick={undo}
                    disabled={historyIndex <= 0}
                    title="Отменить"
                >
                    <FontAwesomeIcon icon={faUndo} />
                </button>

                <button
                    className="tool-btn"
                    onClick={redo}
                    disabled={historyIndex >= history.length - 1}
                    title="Повторить"
                >
                    <FontAwesomeIcon icon={faRedo} />
                </button>

                <div className="toolbar-divider"></div>

                <button
                    className="tool-btn"
                    onClick={() => handleExport('json')}
                    title="Экспорт workflow"
                >
                    <FontAwesomeIcon icon={faDownload} />
                </button>

                <button
                    className="tool-btn"
                    onClick={() => fileInputRef.current?.click()}
                    title="Импорт workflow"
                >
                    <FontAwesomeIcon icon={faUpload} />
                </button>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    style={{ display: 'none' }}
                />
            </div>

            <div className="toolbar-section">
                <div className="zoom-controls">
                    <button
                        className="tool-btn"
                        onClick={() => setZoomLevel(Math.max(0.1, zoomLevel - 0.1))}
                        title="Уменьшить масштаб"
                    >
                        -
                    </button>
                    <span className="zoom-level">{Math.round(zoomLevel * 100)}%</span>
                    <button
                        className="tool-btn"
                        onClick={() => setZoomLevel(Math.min(3, zoomLevel + 0.1))}
                        title="Увеличить масштаб"
                    >
                        +
                    </button>
                </div>

                <div className="toolbar-divider"></div>

                <button
                    className={`execute-btn ${isExecuting ? 'executing' : ''} ${validationErrors.length > 0 ? 'disabled' : ''}`}
                    onClick={executeWorkflow}
                    disabled={isExecuting || validationErrors.length > 0}
                    title={validationErrors.length > 0 ? 'Исправьте ошибки перед выполнением' : 'Выполнить workflow'}
                >
                    <FontAwesomeIcon icon={isExecuting ? faStop : faPlay} />
                    {isExecuting ? 'Выполняется...' : 'Выполнить'}
                </button>
            </div>
        </div>
    );

    const renderModuleLibrary = () => {
        if (!showLibrary) return null;

        return (
            <div className="module-library">
                <div className="library-header">
                    <h3>Библиотека модулей</h3>

                    <div className="library-controls">
                        <input
                            type="text"
                            placeholder="Поиск модулей..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-modules"
                        />

                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="category-filter"
                        >
                            <option value="all">Все категории</option>
                            {MODULE_CATEGORIES.map(category => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="module-categories">
                    {filteredCategories.map(category => (
                        <div key={category.id} className="module-category">
                            <div
                                className="category-header"
                                style={{ borderLeftColor: category.color }}
                            >
                                <span>{category.name}</span>
                                <span className="module-count">({category.modules.length})</span>
                            </div>

                            <div className="module-list">
                                {category.modules.map(module => (
                                    <div
                                        key={module.id}
                                        className="module-item"
                                        draggable={!readOnly}
                                        onDragStart={(e) => handleDragStart(module, e)}
                                        title={module.description}
                                    >
                                        <div className="module-icon">
                                            <FontAwesomeIcon
                                                icon={module.icon}
                                                style={{ color: category.color }}
                                            />
                                        </div>
                                        <div className="module-content">
                                            <div className="module-name">{module.name}</div>
                                            <div className="module-description">{module.description}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="template-section">
                    <h4>Шаблоны Workflow</h4>
                    <div className="template-list">
                        {WORKFLOW_TEMPLATES.map(template => (
                            <div
                                key={template.id}
                                className="template-item"
                                onClick={() => loadTemplate(template)}
                                title={template.description}
                            >
                                <div className="template-name">{template.name}</div>
                                <div className="template-description">{template.description}</div>
                                <div className="template-stats">
                                    {template.modules.length} модулей, {template.connections.length} связей
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const renderCanvas = () => (
        <div
            className="canvas-container"
            style={{
                transform: `scale(${zoomLevel})`,
                transformOrigin: 'top left'
            }}
        >
            <div
                ref={canvasRef}
                className="workflow-canvas"
                onDrop={handleCanvasDrop}
                onDragOver={handleCanvasDragOver}
            >
                {/* Фоновая сетка */}
                <div className="canvas-grid"></div>

                {/* Соединения */}
                <svg className="connections-svg">
                    <defs>
                        <marker
                            id="arrow"
                            markerWidth="10"
                            markerHeight="10"
                            refX="5"
                            refY="5"
                            orient="auto"
                        >
                            <path d="M0,0 L10,5 L0,10 Z" fill="var(--color-teal-400)" />
                        </marker>
                    </defs>

                    {connections.map(connection => {
                        const fromModule = workflowModules.find(m => m.id === connection.from);
                        const toModule = workflowModules.find(m => m.id === connection.to);

                        if (!fromModule || !toModule) return null;

                        const startX = fromModule.position.x + 150;
                        const startY = fromModule.position.y + 60;
                        const endX = toModule.position.x;
                        const endY = toModule.position.y + 60;

                        return (
                            <g key={connection.id}>
                                <line
                                    x1={startX}
                                    y1={startY}
                                    x2={endX}
                                    y2={endY}
                                    stroke="var(--color-teal-400)"
                                    strokeWidth="2"
                                    markerEnd="url(#arrow)"
                                    className="connection-line"
                                    onClick={() => removeConnection(connection.id)}
                                />
                            </g>
                        );
                    })}
                </svg>

                {/* Модули workflow */}
                {workflowModules.map(module => {
                    const moduleDefinition = findModuleDefinition(module.moduleId);
                    const category = MODULE_CATEGORIES.find(c => c.id === module.category);

                    return (
                        <WorkflowModuleComponent
                            key={module.id}
                            module={module}
                            moduleDefinition={moduleDefinition}
                            category={category}
                            isSelected={selectedModuleId === module.id}
                            isConnecting={connecting === module.id}
                            readOnly={readOnly}
                            onSelect={() => setSelectedModuleId(module.id)}
                            onRemove={() => removeModuleFromWorkflow(module.id)}
                            onStartConnection={() => startConnection(module.id)}
                            onCompleteConnection={() => completeConnection(module.id)}
                            onPositionChange={(position) => updateModulePosition(module.id, position)}
                        />
                    );
                })}

                {/* Placeholder */}
                {workflowModules.length === 0 && (
                    <div className="canvas-placeholder">
                        <FontAwesomeIcon icon={faNetworkWired} className="placeholder-icon" />
                        <h3>Перетащите модули сюда</h3>
                        <p>Создайте свой workflow, перетащив модули из библиотеки</p>
                    </div>
                )}
            </div>
        </div>
    );

    const renderPropertiesPanel = () => {
        if (!showProperties) return null;

        return (
            <div className="properties-panel">
                <div className="panel-header">
                    <h3>Свойства модуля</h3>
                    {validationErrors.length > 0 && (
                        <div className="validation-indicator error" title="Ошибки валидации">
                            <FontAwesomeIcon icon={faExclamationTriangle} />
                            {validationErrors.length}
                        </div>
                    )}
                </div>

                <div className="panel-content">
                    {selectedModuleId ? (
                        <ModulePropertiesComponent
                            module={workflowModules.find(m => m.id === selectedModuleId)}
                            onSettingsChange={(settings) => updateModuleSettings(selectedModuleId, settings)}
                            readOnly={readOnly}
                        />
                    ) : (
                        <div className="no-selection">
                            <FontAwesomeIcon icon={faCog} className="no-selection-icon" />
                            <p>Выберите модуль для настройки</p>
                        </div>
                    )}

                    {validationErrors.length > 0 && (
                        <div className="validation-errors">
                            <h4>Ошибки валидации:</h4>
                            <ul>
                                {validationErrors.map((error, index) => (
                                    <li key={index} className="validation-error">
                                        <FontAwesomeIcon icon={faExclamationTriangle} />
                                        {error}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // Главный рендер
    return (
        <div className={`attack-module-constructor ${theme}`}>
            {renderToolbar()}

            <div className="constructor-content">
                {renderModuleLibrary()}

                <div className="canvas-wrapper">
                    {renderCanvas()}
                </div>

                {renderPropertiesPanel()}
            </div>
        </div>
    );
}

// Компонент модуля в workflow
const WorkflowModuleComponent = React.memo(({
    module,
    moduleDefinition,
    category,
    isSelected,
    isConnecting,
    readOnly,
    onSelect,
    onRemove,
    onStartConnection,
    onCompleteConnection,
    onPositionChange
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const handleMouseDown = (e) => {
        if (readOnly) return;

        setIsDragging(true);
        setDragStart({
            x: e.clientX - module.position.x,
            y: e.clientY - module.position.y
        });

        const handleMouseMove = (e) => {
            const newPosition = {
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            };
            onPositionChange(newPosition);
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const getStatusColor = () => {
        switch (module.status) {
            case 'configured': return 'var(--color-gray-400)';
            case 'running': return 'var(--color-orange-400)';
            case 'completed': return 'var(--color-success)';
            case 'error': return 'var(--color-error)';
            default: return 'var(--color-gray-400)';
        }
    };

    return (
        <div
            className={`workflow-module ${isSelected ? 'selected' : ''} ${isConnecting ? 'connecting' : ''} ${module.status}`}
            style={{
                left: module.position.x,
                top: module.position.y,
                borderColor: category?.color
            }}
            onClick={onSelect}
            onMouseDown={handleMouseDown}
        >
            <div className="module-header">
                <div className="module-icon">
                    <FontAwesomeIcon
                        icon={moduleDefinition?.icon || faCog}
                        style={{ color: category?.color }}
                    />
                </div>
                <div className="module-title">
                    <span>{module.name}</span>
                    <div
                        className="status-indicator"
                        style={{ backgroundColor: getStatusColor() }}
                        title={`Статус: ${module.status}`}
                    />
                </div>

                {!readOnly && (
                    <button
                        className="remove-btn"
                        onClick={(e) => { e.stopPropagation(); onRemove(); }}
                        title="Удалить модуль"
                    >
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                )}
            </div>

            <div className="module-body">
                <div className="module-description">{module.description}</div>

                {/* Порты ввода/вывода */}
                <div className="module-ports">
                    {moduleDefinition?.inputs && (
                        <div className="input-ports">
                            {moduleDefinition.inputs.map((input, index) => (
                                <div
                                    key={`input-${index}`}
                                    className="port input-port"
                                    title={`Вход: ${input}`}
                                    onClick={onCompleteConnection}
                                />
                            ))}
                        </div>
                    )}

                    {moduleDefinition?.outputs && (
                        <div className="output-ports">
                            {moduleDefinition.outputs.map((output, index) => (
                                <div
                                    key={`output-${index}`}
                                    className="port output-port"
                                    title={`Выход: ${output}`}
                                    onClick={onStartConnection}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

// Компонент панели свойств модуля
const ModulePropertiesComponent = React.memo(({ module, onSettingsChange, readOnly }) => {
    const moduleDefinition = findModuleDefinition(module.moduleId);

    if (!moduleDefinition || !moduleDefinition.settings) {
        return (
            <div className="no-settings">
                <p>У данного модуля нет настраиваемых параметров</p>
            </div>
        );
    }

    const handleSettingChange = (settingKey, value) => {
        if (readOnly) return;
        onSettingsChange({ [settingKey]: value });
    };

    return (
        <div className="module-properties">
            <div className="module-info">
                <h4>{module.name}</h4>
                <p>{module.description}</p>
            </div>

            <div className="settings-form">
                {Object.entries(moduleDefinition.settings).map(([key, config]) => (
                    <div key={key} className="setting-field">
                        <label htmlFor={`setting-${key}`}>
                            {config.label}
                            {config.required && <span className="required">*</span>}
                        </label>

                        {config.type === 'text' && (
                            <input
                                id={`setting-${key}`}
                                type="text"
                                value={module.settings[key] || ''}
                                onChange={(e) => handleSettingChange(key, e.target.value)}
                                placeholder={config.placeholder}
                                required={config.required}
                                disabled={readOnly}
                                className="form-control"
                            />
                        )}

                        {config.type === 'number' && (
                            <input
                                id={`setting-${key}`}
                                type="number"
                                value={module.settings[key] || ''}
                                onChange={(e) => handleSettingChange(key, parseInt(e.target.value))}
                                min={config.min}
                                max={config.max}
                                required={config.required}
                                disabled={readOnly}
                                className="form-control"
                            />
                        )}

                        {config.type === 'select' && (
                            <select
                                id={`setting-${key}`}
                                value={module.settings[key] || ''}
                                onChange={(e) => handleSettingChange(key, e.target.value)}
                                required={config.required}
                                disabled={readOnly}
                                className="form-control"
                            >
                                <option value="">Выберите значение</option>
                                {config.options.map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        )}

                        {config.type === 'checkbox' && (
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={module.settings[key] || false}
                                    onChange={(e) => handleSettingChange(key, e.target.checked)}
                                    disabled={readOnly}
                                />
                                <span className="checkmark"></span>
                            </label>
                        )}

                        {config.type === 'range' && (
                            <div className="range-input">
                                <input
                                    type="range"
                                    min={config.min}
                                    max={config.max}
                                    step={config.step}
                                    value={module.settings[key] || config.default}
                                    onChange={(e) => handleSettingChange(key, parseFloat(e.target.value))}
                                    disabled={readOnly}
                                    className="range-slider"
                                />
                                <span className="range-value">
                                    {module.settings[key] || config.default}
                                </span>
                            </div>
                        )}

                        {config.type === 'multiselect' && (
                            <div className="multiselect">
                                {config.options.map(option => (
                                    <label key={option} className="multiselect-option">
                                        <input
                                            type="checkbox"
                                            checked={(module.settings[key] || []).includes(option)}
                                            onChange={(e) => {
                                                const currentValues = module.settings[key] || [];
                                                const newValues = e.target.checked
                                                    ? [...currentValues, option]
                                                    : currentValues.filter(v => v !== option);
                                                handleSettingChange(key, newValues);
                                            }}
                                            disabled={readOnly}
                                        />
                                        <span>{option}</span>
                                    </label>
                                ))}
                            </div>
                        )}

                        {config.description && (
                            <div className="setting-description">{config.description}</div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
});

// PropTypes определения
AttackModuleConstructor.propTypes = {
    onWorkflowChange: PropTypes.func,
    onExecute: PropTypes.func,
    initialWorkflow: PropTypes.object,
    readOnly: PropTypes.bool,
    theme: PropTypes.oneOf(['light', 'dark'])
};

WorkflowModuleComponent.propTypes = {
    module: PropTypes.object.isRequired,
    moduleDefinition: PropTypes.object,
    category: PropTypes.object,
    isSelected: PropTypes.bool,
    isConnecting: PropTypes.bool,
    readOnly: PropTypes.bool,
    onSelect: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
    onStartConnection: PropTypes.func.isRequired,
    onCompleteConnection: PropTypes.func.isRequired,
    onPositionChange: PropTypes.func.isRequired
};

ModulePropertiesComponent.propTypes = {
    module: PropTypes.object.isRequired,
    onSettingsChange: PropTypes.func.isRequired,
    readOnly: PropTypes.bool
};

// Экспорт дополнительных утилит для внешнего использования
export {
    MODULE_CATEGORIES,
    WORKFLOW_TEMPLATES,
    validateWorkflow,
    exportWorkflow,
    generateUUID
};
