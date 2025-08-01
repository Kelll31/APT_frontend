// src/stores/notificationStore.tsx
/**
 * IP Roast Enterprise - Notification Store v3.0 ENTERPRISE
 * Centralized state management для системы уведомлений с расширенными возможностями
 * Построен на React + Zustand для IP Roast Frontend
 */

import React, { createContext, useContext, useEffect, useCallback, ReactNode } from 'react';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { persist, createJSONStorage } from 'zustand/middleware';

// ===== ТИПЫ ДАННЫХ ДЛЯ УВЕДОМЛЕНИЙ =====

export type NotificationType =
    | 'success' | 'error' | 'warning' | 'info' | 'loading'
    | 'critical' | 'security' | 'system' | 'update' | 'maintenance';

export type NotificationPosition =
    | 'top-left' | 'top-center' | 'top-right'
    | 'bottom-left' | 'bottom-center' | 'bottom-right'
    | 'center';

export type NotificationAnimation =
    | 'slide' | 'fade' | 'bounce' | 'flip' | 'zoom' | 'none';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'critical' | 'emergency';

export type NotificationStatus = 'pending' | 'visible' | 'dismissed' | 'expired' | 'archived';

// Действие уведомления
export interface NotificationAction {
    id: string;
    label: string;
    icon?: string;
    style?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
    action: string | (() => void | Promise<void>);
    loading?: boolean;
    disabled?: boolean;
    shortcut?: string;
    requiresConfirmation?: boolean;
    confirmationMessage?: string;
}

// Кнопка уведомления
export interface NotificationButton extends NotificationAction {
    position?: 'left' | 'right';
    size?: 'small' | 'medium' | 'large';
    variant?: 'text' | 'outlined' | 'contained';
}

// Группа уведомлений
export interface NotificationGroup {
    id: string;
    name: string;
    description?: string;
    maxNotifications?: number;
    collapseAfter?: number;
    priority: NotificationPriority;
    icon?: string;
    color?: string;
    sound?: string;
    persistent?: boolean;
    enabled: boolean;
}

// Шаблон уведомления
export interface NotificationTemplate {
    id: string;
    name: string;
    description?: string;
    type: NotificationType;
    title: string;
    message: string;
    duration?: number;
    persistent?: boolean;
    actions?: NotificationAction[];
    metadata?: Record<string, any>;
    variables?: string[];
    conditions?: string[];
    enabled: boolean;
    usage_count: number;
    created_at: string;
    updated_at: string;
}

// Правило уведомления
export interface NotificationRule {
    id: string;
    name: string;
    description?: string;
    conditions: Array<{
        field: string;
        operator: 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'regex' | 'greater_than' | 'less_than';
        value: any;
        case_sensitive?: boolean;
    }>;
    actions: Array<{
        type: 'modify' | 'suppress' | 'redirect' | 'duplicate' | 'transform';
        parameters: Record<string, any>;
    }>;
    priority: number;
    enabled: boolean;
    created_at: string;
}

// Основной интерфейс уведомления
export interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;

    // Визуальные настройки
    icon?: string;
    color?: string;
    avatar?: string;
    image?: string;
    badge?: string | number;

    // Поведение
    duration?: number;
    persistent?: boolean;
    dismissible?: boolean;
    autoHide?: boolean;

    // Анимация и позиционирование
    position?: NotificationPosition;
    animation?: NotificationAnimation;

    // Действия и интерактивность
    actions?: NotificationAction[];
    buttons?: NotificationButton[];
    clickAction?: string | (() => void);

    // Группировка и приоритизация
    group?: string;
    priority: NotificationPriority;
    category?: string;
    tags?: string[];

    // Метаданные
    metadata?: Record<string, any>;
    context?: {
        user_id?: string;
        session_id?: string;
        scan_id?: string;
        report_id?: string;
        source?: string;
        timestamp?: string;
        correlation_id?: string;
    };

    // Статусы и временные метки
    status: NotificationStatus;
    created_at: string;
    updated_at?: string;
    shown_at?: string;
    dismissed_at?: string;
    expires_at?: string;

    // Настройки отображения
    showProgress?: boolean;
    progress?: number;
    countdown?: boolean;
    sound?: string | boolean;
    vibration?: boolean;

    // Уникальность и дедупликация
    unique_key?: string;
    replace_existing?: boolean;
    merge_strategy?: 'replace' | 'append' | 'merge' | 'ignore';

    // Enterprise функции
    tenant_id?: string;
    user_permissions?: string[];
    compliance_labels?: string[];
    audit_log?: boolean;

    // Интеграции
    slack_channel?: string;
    email_recipients?: string[];
    webhook_url?: string;
    siem_integration?: boolean;

    // Аналитика
    view_count?: number;
    interaction_count?: number;
    effectiveness_score?: number;
}

// Конфигурация уведомлений
export interface NotificationConfig {
    enabled: boolean;
    position: NotificationPosition;
    animation: NotificationAnimation;
    max_notifications: number;
    default_duration: number;
    sound_enabled: boolean;
    vibration_enabled: boolean;
    group_similar: boolean;
    deduplicate: boolean;
    auto_dismiss_success: boolean;
    auto_dismiss_info: boolean;
    persist_errors: boolean;
    persist_warnings: boolean;
    show_timestamps: boolean;
    show_icons: boolean;
    compact_mode: boolean;
    dark_mode: boolean;
    accessibility_mode: boolean;
}

// Статистика уведомлений
export interface NotificationStats {
    total_sent: number;
    total_shown: number;
    total_dismissed: number;
    total_expired: number;
    by_type: Record<NotificationType, number>;
    by_priority: Record<NotificationPriority, number>;
    by_group: Record<string, number>;
    interaction_rate: number;
    average_view_time: number;
    most_common_categories: Array<{ category: string; count: number }>;
    peak_hours: Array<{ hour: number; count: number }>;
    effectiveness_metrics: {
        click_through_rate: number;
        action_completion_rate: number;
        user_satisfaction_score: number;
    };
}

// Фильтры уведомлений
export interface NotificationFilters {
    types?: NotificationType[];
    priorities?: NotificationPriority[];
    groups?: string[];
    categories?: string[];
    tags?: string[];
    status?: NotificationStatus[];
    date_from?: string;
    date_to?: string;
    search?: string;
    user_id?: string;
    tenant_id?: string;
}

// Интеграция уведомлений
export interface NotificationIntegration {
    id: string;
    name: string;
    type: 'slack' | 'teams' | 'email' | 'webhook' | 'sms' | 'push' | 'custom';
    enabled: boolean;
    configuration: Record<string, any>;
    filters?: NotificationFilters;
    template_mapping?: Record<string, string>;
    rate_limit?: {
        max_per_minute: number;
        max_per_hour: number;
        max_per_day: number;
    };
    retry_policy?: {
        max_attempts: number;
        backoff_strategy: 'linear' | 'exponential';
        base_delay: number;
    };
    health_check?: {
        enabled: boolean;
        interval: number;
        timeout: number;
        endpoint?: string;
    };
}

// Состояние уведомлений
export interface NotificationState {
    // Основные данные
    notifications: Map<string, Notification>;
    archivedNotifications: Map<string, Notification>;

    // Конфигурация
    config: NotificationConfig;

    // Группы и шаблоны
    groups: Map<string, NotificationGroup>;
    templates: Map<string, NotificationTemplate>;
    rules: Map<string, NotificationRule>;
    integrations: Map<string, NotificationIntegration>;

    // Статистика
    stats: NotificationStats;

    // Фильтры и UI
    filters: NotificationFilters;
    isVisible: boolean;
    isMinimized: boolean;
    selectedNotification: string | null;
    searchQuery: string;
    sortBy: 'date' | 'priority' | 'type' | 'status';
    sortOrder: 'asc' | 'desc';

    // Таймеры
    timers: Map<string, NodeJS.Timeout>;
    cleanupInterval: NodeJS.Timeout | null;
}

// Действия уведомлений
export interface NotificationActions {
    // Основные действия
    createNotification: (type: NotificationType, title: string, message: string, options?: Partial<Notification>) => string;
    showNotification: (id: string) => void;
    dismissNotification: (id: string, reason?: 'user' | 'expired' | 'replaced') => void;
    executeAction: (notificationId: string, actionId: string) => Promise<void>;
    updateNotification: (id: string, updates: Partial<Notification>) => void;
    clearAllNotifications: (includeArchive?: boolean) => void;
    clearNotificationsByType: (type: NotificationType) => void;
    clearNotificationsByGroup: (groupId: string) => void;

    // Шаблоны
    createFromTemplate: (templateId: string, variables?: Record<string, any>, overrides?: Partial<Notification>) => string | null;
    addTemplate: (template: Omit<NotificationTemplate, 'id' | 'usage_count' | 'created_at' | 'updated_at'>) => string;
    removeTemplate: (templateId: string) => void;

    // Группы
    addGroup: (group: Omit<NotificationGroup, 'id'>) => string;
    removeGroup: (groupId: string) => void;

    // Правила
    addRule: (rule: Omit<NotificationRule, 'id' | 'created_at'>) => string;
    removeRule: (ruleId: string) => void;

    // Интеграции
    addIntegration: (integration: Omit<NotificationIntegration, 'id'>) => string;
    removeIntegration: (integrationId: string) => void;

    // Фильтрация
    setFilters: (filters: NotificationFilters) => void;
    clearFilters: () => void;
    searchNotifications: (query: string) => Notification[];

    // UI управление
    setVisible: (visible: boolean) => void;
    setMinimized: (minimized: boolean) => void;
    setSelectedNotification: (id: string | null) => void;
    setSearchQuery: (query: string) => void;
    setSortBy: (sortBy: 'date' | 'priority' | 'type' | 'status') => void;
    setSortOrder: (order: 'asc' | 'desc') => void;

    // Статистика
    getStatsByPeriod: (period: 'day' | 'week' | 'month' | 'year') => NotificationStats;

    // Персистентность
    saveState: () => void;
    loadState: () => void;

    // Утилиты
    initialize: () => void;
    cleanup: () => void;
}

// Объединенный интерфейс хранилища
export type NotificationStore = NotificationState & NotificationActions;

// ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====

// Генерация ID уведомления
const generateNotificationId = (): string => {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Генерация ID с префиксом
const generateId = (prefix: string): string => {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Получение дефолтной длительности
const getDefaultDuration = (type: NotificationType): number => {
    const durations = {
        success: 4000,
        info: 5000,
        warning: 6000,
        error: 8000,
        critical: 0,
        security: 0,
        system: 7000,
        loading: 0,
        update: 5000,
        maintenance: 0
    };
    return durations[type] || 5000;
};

// Проверка персистентности
const shouldBePersistent = (type: NotificationType): boolean => {
    const persistentTypes: NotificationType[] = ['error', 'critical', 'security', 'loading', 'maintenance'];
    return persistentTypes.includes(type);
};

// Проверка автоскрытия
const shouldAutoHide = (type: NotificationType): boolean => {
    return !shouldBePersistent(type);
};

// Начальное состояние
const initialState: NotificationState = {
    notifications: new Map(),
    archivedNotifications: new Map(),
    config: {
        enabled: true,
        position: 'top-right',
        animation: 'slide',
        max_notifications: 5,
        default_duration: 5000,
        sound_enabled: true,
        vibration_enabled: false,
        group_similar: true,
        deduplicate: true,
        auto_dismiss_success: true,
        auto_dismiss_info: true,
        persist_errors: true,
        persist_warnings: false,
        show_timestamps: true,
        show_icons: true,
        compact_mode: false,
        dark_mode: false,
        accessibility_mode: false
    },
    groups: new Map(),
    templates: new Map(),
    rules: new Map(),
    integrations: new Map(),
    stats: {
        total_sent: 0,
        total_shown: 0,
        total_dismissed: 0,
        total_expired: 0,
        by_type: {} as Record<NotificationType, number>,
        by_priority: {} as Record<NotificationPriority, number>,
        by_group: {},
        interaction_rate: 0,
        average_view_time: 0,
        most_common_categories: [],
        peak_hours: [],
        effectiveness_metrics: {
            click_through_rate: 0,
            action_completion_rate: 0,
            user_satisfaction_score: 0
        }
    },
    filters: {},
    isVisible: true,
    isMinimized: false,
    selectedNotification: null,
    searchQuery: '',
    sortBy: 'date',
    sortOrder: 'desc',
    timers: new Map(),
    cleanupInterval: null
};

// ===== ZUSTAND ХРАНИЛИЩЕ =====

export const useNotificationStore = create<NotificationStore>()(
    persist(
        subscribeWithSelector((set, get) => ({
            ...initialState,

            // Основные действия
            createNotification: (type: NotificationType, title: string, message: string, options: Partial<Notification> = {}) => {
                const id = generateNotificationId();
                const now = new Date().toISOString();

                const notification: Notification = {
                    id,
                    type,
                    title,
                    message,
                    priority: 'normal',
                    status: 'pending',
                    created_at: now,
                    duration: getDefaultDuration(type),
                    persistent: shouldBePersistent(type),
                    dismissible: true,
                    autoHide: shouldAutoHide(type),
                    position: get().config.position,
                    animation: get().config.animation,
                    ...options
                };

                // Применяем правила
                get().applyNotificationRules(notification);

                // Проверяем дедупликацию
                if (get().config.deduplicate && notification.unique_key) {
                    const existingId = get().findDuplicateNotification(notification);
                    if (existingId) {
                        return get().handleDuplicateNotification(existingId, notification);
                    }
                }

                // Добавляем в стор
                set((state) => {
                    const newNotifications = new Map(state.notifications);
                    newNotifications.set(id, notification);
                    return {
                        notifications: newNotifications,
                        stats: {
                            ...state.stats,
                            total_sent: state.stats.total_sent + 1
                        }
                    };
                });

                // Показываем уведомление
                setTimeout(() => {
                    get().showNotification(id);
                }, 0);

                return id;
            },

            showNotification: (id: string) => {
                const notification = get().notifications.get(id);
                if (!notification || notification.status !== 'pending') return;

                const now = new Date().toISOString();

                set((state) => {
                    const newNotifications = new Map(state.notifications);
                    const updatedNotification = {
                        ...notification,
                        status: 'visible' as NotificationStatus,
                        shown_at: now,
                        view_count: (notification.view_count || 0) + 1
                    };
                    newNotifications.set(id, updatedNotification);

                    return {
                        notifications: newNotifications,
                        stats: {
                            ...state.stats,
                            total_shown: state.stats.total_shown + 1
                        }
                    };
                });

                // Устанавливаем таймер автоскрытия
                if (notification.autoHide && notification.duration && notification.duration > 0) {
                    const timer = setTimeout(() => {
                        get().dismissNotification(id, 'expired');
                    }, notification.duration);

                    set((state) => {
                        const newTimers = new Map(state.timers);
                        newTimers.set(id, timer);
                        return { timers: newTimers };
                    });
                }

                // Воспроизводим звук
                if (get().config.sound_enabled && notification.sound) {
                    get().playNotificationSound(notification.sound);
                }

                // Вибрация
                if (get().config.vibration_enabled && notification.vibration) {
                    get().triggerVibration();
                }
            },

            dismissNotification: (id: string, reason: 'user' | 'expired' | 'replaced' = 'user') => {
                const notification = get().notifications.get(id);
                if (!notification) return;

                // Очищаем таймер
                const timer = get().timers.get(id);
                if (timer) {
                    clearTimeout(timer);
                    set((state) => {
                        const newTimers = new Map(state.timers);
                        newTimers.delete(id);
                        return { timers: newTimers };
                    });
                }

                const now = new Date().toISOString();

                set((state) => {
                    const newNotifications = new Map(state.notifications);
                    const newArchivedNotifications = new Map(state.archivedNotifications);

                    const updatedNotification = {
                        ...notification,
                        status: (reason === 'expired' ? 'expired' : 'dismissed') as NotificationStatus,
                        dismissed_at: now
                    };

                    // Перемещаем в архив если нужно
                    if (get().shouldArchive(updatedNotification)) {
                        newArchivedNotifications.set(id, updatedNotification);
                        newNotifications.delete(id);
                    } else {
                        newNotifications.set(id, updatedNotification);
                    }

                    return {
                        notifications: newNotifications,
                        archivedNotifications: newArchivedNotifications,
                        stats: {
                            ...state.stats,
                            total_dismissed: reason === 'expired' ? state.stats.total_dismissed : state.stats.total_dismissed + 1,
                            total_expired: reason === 'expired' ? state.stats.total_expired + 1 : state.stats.total_expired
                        }
                    };
                });
            },

            executeAction: async (notificationId: string, actionId: string) => {
                const notification = get().notifications.get(notificationId);
                if (!notification) return;

                const action = notification.actions?.find(a => a.id === actionId);
                if (!action) return;

                try {
                    // Показываем загрузку
                    if (action.loading !== false) {
                        get().setActionLoading(notificationId, actionId, true);
                    }

                    // Подтверждение если требуется
                    if (action.requiresConfirmation) {
                        const confirmed = await get().showConfirmation(
                            action.confirmationMessage || `Выполнить действие "${action.label}"?`
                        );
                        if (!confirmed) return;
                    }

                    // Выполняем действие
                    if (typeof action.action === 'function') {
                        await action.action();
                    } else {
                        await get().processStringAction(action.action, notification);
                    }

                    // Обновляем счетчик взаимодействий
                    set((state) => {
                        const newNotifications = new Map(state.notifications);
                        const updated = {
                            ...notification,
                            interaction_count: (notification.interaction_count || 0) + 1
                        };
                        newNotifications.set(notificationId, updated);
                        return { notifications: newNotifications };
                    });

                    // Автоскрытие после выполнения действия
                    if (action.loading !== false) {
                        setTimeout(() => {
                            get().dismissNotification(notificationId, 'user');
                        }, 1000);
                    }

                } catch (error) {
                    console.error('Ошибка выполнения действия уведомления:', error);
                    get().createNotification('error', 'Ошибка', `Не удалось выполнить действие: ${error.message}`);
                } finally {
                    get().setActionLoading(notificationId, actionId, false);
                }
            },

            updateNotification: (id: string, updates: Partial<Notification>) => {
                set((state) => {
                    const newNotifications = new Map(state.notifications);
                    const notification = newNotifications.get(id);
                    if (!notification) return state;

                    const updated = {
                        ...notification,
                        ...updates,
                        updated_at: new Date().toISOString()
                    };
                    newNotifications.set(id, updated);
                    return { notifications: newNotifications };
                });
            },

            clearAllNotifications: (includeArchive = false) => {
                // Очищаем таймеры
                get().timers.forEach(timer => clearTimeout(timer));

                set((state) => ({
                    notifications: new Map(),
                    archivedNotifications: includeArchive ? new Map() : state.archivedNotifications,
                    timers: new Map()
                }));
            },

            clearNotificationsByType: (type: NotificationType) => {
                const toRemove: string[] = [];
                get().notifications.forEach((notification, id) => {
                    if (notification.type === type) {
                        toRemove.push(id);
                    }
                });
                toRemove.forEach(id => get().dismissNotification(id, 'user'));
            },

            clearNotificationsByGroup: (groupId: string) => {
                const toRemove: string[] = [];
                get().notifications.forEach((notification, id) => {
                    if (notification.group === groupId) {
                        toRemove.push(id);
                    }
                });
                toRemove.forEach(id => get().dismissNotification(id, 'user'));
            },

            // Шаблоны
            createFromTemplate: (templateId: string, variables: Record<string, any> = {}, overrides: Partial<Notification> = {}) => {
                const template = get().templates.get(templateId);
                if (!template || !template.enabled) return null;

                const title = get().replaceVariables(template.title, variables);
                const message = get().replaceVariables(template.message, variables);

                // Обновляем статистику использования шаблона
                set((state) => {
                    const newTemplates = new Map(state.templates);
                    const updated = {
                        ...template,
                        usage_count: template.usage_count + 1,
                        updated_at: new Date().toISOString()
                    };
                    newTemplates.set(templateId, updated);
                    return { templates: newTemplates };
                });

                return get().createNotification(template.type, title, message, {
                    ...template,
                    ...overrides,
                    metadata: {
                        ...template.metadata,
                        template_id: templateId,
                        variables
                    }
                });
            },

            addTemplate: (template: Omit<NotificationTemplate, 'id' | 'usage_count' | 'created_at' | 'updated_at'>) => {
                const id = generateId('template');
                const now = new Date().toISOString();

                const fullTemplate: NotificationTemplate = {
                    id,
                    usage_count: 0,
                    created_at: now,
                    updated_at: now,
                    ...template
                };

                set((state) => {
                    const newTemplates = new Map(state.templates);
                    newTemplates.set(id, fullTemplate);
                    return { templates: newTemplates };
                });

                return id;
            },

            removeTemplate: (templateId: string) => {
                set((state) => {
                    const newTemplates = new Map(state.templates);
                    newTemplates.delete(templateId);
                    return { templates: newTemplates };
                });
            },

            // Группы
            addGroup: (group: Omit<NotificationGroup, 'id'>) => {
                const id = generateId('group');
                const fullGroup: NotificationGroup = { id, ...group };

                set((state) => {
                    const newGroups = new Map(state.groups);
                    newGroups.set(id, fullGroup);
                    return { groups: newGroups };
                });

                return id;
            },

            removeGroup: (groupId: string) => {
                get().clearNotificationsByGroup(groupId);
                set((state) => {
                    const newGroups = new Map(state.groups);
                    newGroups.delete(groupId);
                    return { groups: newGroups };
                });
            },

            // Правила
            addRule: (rule: Omit<NotificationRule, 'id' | 'created_at'>) => {
                const id = generateId('rule');
                const fullRule: NotificationRule = {
                    id,
                    created_at: new Date().toISOString(),
                    ...rule
                };

                set((state) => {
                    const newRules = new Map(state.rules);
                    newRules.set(id, fullRule);
                    return { rules: newRules };
                });

                return id;
            },

            removeRule: (ruleId: string) => {
                set((state) => {
                    const newRules = new Map(state.rules);
                    newRules.delete(ruleId);
                    return { rules: newRules };
                });
            },

            // Интеграции
            addIntegration: (integration: Omit<NotificationIntegration, 'id'>) => {
                const id = generateId('integration');
                const fullIntegration: NotificationIntegration = { id, ...integration };

                set((state) => {
                    const newIntegrations = new Map(state.integrations);
                    newIntegrations.set(id, fullIntegration);
                    return { integrations: newIntegrations };
                });

                return id;
            },

            removeIntegration: (integrationId: string) => {
                set((state) => {
                    const newIntegrations = new Map(state.integrations);
                    newIntegrations.delete(integrationId);
                    return { integrations: newIntegrations };
                });
            },

            // Фильтрация
            setFilters: (filters: NotificationFilters) => {
                set((state) => ({
                    filters: { ...state.filters, ...filters }
                }));
            },

            clearFilters: () => {
                set({ filters: {}, searchQuery: '' });
            },

            searchNotifications: (query: string) => {
                const lowerQuery = query.toLowerCase();
                return Array.from(get().notifications.values()).filter(notification => {
                    return (
                        notification.title.toLowerCase().includes(lowerQuery) ||
                        notification.message.toLowerCase().includes(lowerQuery) ||
                        notification.tags?.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
                        notification.category?.toLowerCase().includes(lowerQuery)
                    );
                });
            },

            // UI управление
            setVisible: (visible: boolean) => {
                set({ isVisible: visible });
            },

            setMinimized: (minimized: boolean) => {
                set({ isMinimized: minimized });
            },

            setSelectedNotification: (id: string | null) => {
                set({ selectedNotification: id });
            },

            setSearchQuery: (query: string) => {
                set({ searchQuery: query });
            },

            setSortBy: (sortBy: 'date' | 'priority' | 'type' | 'status') => {
                set({ sortBy });
            },

            setSortOrder: (order: 'asc' | 'desc') => {
                set({ sortOrder: order });
            },

            // Статистика
            getStatsByPeriod: (period: 'day' | 'week' | 'month' | 'year') => {
                const now = new Date();
                const startDate = new Date();

                switch (period) {
                    case 'day':
                        startDate.setDate(now.getDate() - 1);
                        break;
                    case 'week':
                        startDate.setDate(now.getDate() - 7);
                        break;
                    case 'month':
                        startDate.setMonth(now.getMonth() - 1);
                        break;
                    case 'year':
                        startDate.setFullYear(now.getFullYear() - 1);
                        break;
                }

                const periodNotifications = Array.from(get().notifications.values())
                    .filter(n => new Date(n.created_at) >= startDate);

                return get().calculateStatistics(periodNotifications);
            },

            // Персистентность
            saveState: () => {
                try {
                    const state = get();
                    const stateToSave = {
                        config: state.config,
                        groups: Array.from(state.groups.entries()),
                        templates: Array.from(state.templates.entries()),
                        rules: Array.from(state.rules.entries()),
                        integrations: Array.from(state.integrations.entries()),
                        stats: state.stats
                    };
                    localStorage.setItem('ip-roast-notifications-state', JSON.stringify(stateToSave));
                } catch (error) {
                    console.error('Ошибка сохранения состояния уведомлений:', error);
                }
            },

            loadState: () => {
                try {
                    const savedState = localStorage.getItem('ip-roast-notifications-state');
                    if (!savedState) return;

                    const state = JSON.parse(savedState);

                    set((currentState) => ({
                        config: state.config ? { ...currentState.config, ...state.config } : currentState.config,
                        groups: state.groups ? new Map(state.groups) : currentState.groups,
                        templates: state.templates ? new Map(state.templates) : currentState.templates,
                        rules: state.rules ? new Map(state.rules) : currentState.rules,
                        integrations: state.integrations ? new Map(state.integrations) : currentState.integrations,
                        stats: state.stats ? { ...currentState.stats, ...state.stats } : currentState.stats
                    }));
                } catch (error) {
                    console.error('Ошибка загрузки состояния уведомлений:', error);
                }
            },

            // Утилиты
            initialize: () => {
                const store = get();
                store.loadState();
                store.initializeDefaultGroups();
                store.initializeDefaultTemplates();
                store.startCleanupTimer();
            },

            cleanup: () => {
                const state = get();
                state.timers.forEach(timer => clearTimeout(timer));
                if (state.cleanupInterval) {
                    clearInterval(state.cleanupInterval);
                }
                set({ timers: new Map(), cleanupInterval: null });
            },

            // Приватные методы
            applyNotificationRules: (notification: Notification) => {
                const activeRules = Array.from(get().rules.values())
                    .filter(rule => rule.enabled)
                    .sort((a, b) => b.priority - a.priority);

                for (const rule of activeRules) {
                    if (get().evaluateRuleConditions(rule.conditions, notification)) {
                        get().applyRuleActions(rule.actions, notification);
                    }
                }
            },

            findDuplicateNotification: (notification: Notification) => {
                for (const [id, existing] of get().notifications) {
                    if (existing.unique_key === notification.unique_key && existing.status === 'visible') {
                        return id;
                    }
                }
                return null;
            },

            handleDuplicateNotification: (existingId: string, newNotification: Notification) => {
                switch (newNotification.merge_strategy) {
                    case 'replace':
                        set((state) => {
                            const newNotifications = new Map(state.notifications);
                            newNotifications.set(existingId, { ...newNotification, id: existingId });
                            return { notifications: newNotifications };
                        });
                        return existingId;
                    case 'ignore':
                        return existingId;
                    case 'append':
                        const existing = get().notifications.get(existingId)!;
                        get().updateNotification(existingId, {
                            message: existing.message + '\n' + newNotification.message
                        });
                        return existingId;
                    default:
                        get().dismissNotification(existingId, 'replaced');
                        return get().createNotification(newNotification.type, newNotification.title, newNotification.message, newNotification);
                }
            },

            shouldArchive: (notification: Notification) => {
                return !notification.persistent || notification.status === 'expired';
            },

            setActionLoading: (notificationId: string, actionId: string, loading: boolean) => {
                set((state) => {
                    const newNotifications = new Map(state.notifications);
                    const notification = newNotifications.get(notificationId);
                    if (!notification) return state;

                    const action = notification.actions?.find(a => a.id === actionId);
                    if (action) {
                        action.loading = loading;
                        newNotifications.set(notificationId, { ...notification });
                    }
                    return { notifications: newNotifications };
                });
            },

            replaceVariables: (template: string, variables: Record<string, any>) => {
                return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
                    return variables[key]?.toString() || match;
                });
            },

            evaluateRuleConditions: (conditions: any[], notification: Notification) => {
                return conditions.every(condition => {
                    const value = get().getNestedValue(notification, condition.field);
                    return get().evaluateCondition(value, condition.operator, condition.value, condition.case_sensitive);
                });
            },

            applyRuleActions: (actions: any[], notification: Notification) => {
                actions.forEach(action => {
                    switch (action.type) {
                        case 'modify':
                            Object.assign(notification, action.parameters);
                            break;
                        case 'suppress':
                            notification.status = 'dismissed';
                            break;
                    }
                });
            },

            initializeDefaultGroups: () => {
                const state = get();
                if (state.groups.size === 0) {
                    state.addGroup({
                        name: 'Система',
                        priority: 'high',
                        icon: '⚙️',
                        color: '#6b7280',
                        enabled: true
                    });
                    state.addGroup({
                        name: 'Безопасность',
                        priority: 'critical',
                        icon: '🔒',
                        color: '#dc2626',
                        enabled: true
                    });
                    state.addGroup({
                        name: 'Сканирование',
                        priority: 'normal',
                        icon: '🔍',
                        color: '#2563eb',
                        enabled: true
                    });
                }
            },

            initializeDefaultTemplates: () => {
                const state = get();
                if (state.templates.size === 0) {
                    state.addTemplate({
                        name: 'Сканирование завершено',
                        type: 'success',
                        title: 'Сканирование завершено',
                        message: 'Сканирование {{target}} завершено за {{duration}}. Найдено уязвимостей: {{vulnerabilities}}',
                        variables: ['target', 'duration', 'vulnerabilities'],
                        enabled: true
                    });
                    state.addTemplate({
                        name: 'Ошибка сканирования',
                        type: 'error',
                        title: 'Ошибка сканирования',
                        message: 'Сканирование {{target}} завершилось с ошибкой: {{error}}',
                        variables: ['target', 'error'],
                        persistent: true,
                        enabled: true
                    });
                }
            },

            startCleanupTimer: () => {
                const state = get();
                if (state.cleanupInterval) {
                    clearInterval(state.cleanupInterval);
                }

                const interval = setInterval(() => {
                    get().performCleanup();
                }, 60000);

                set({ cleanupInterval: interval });
            },

            performCleanup: () => {
                const now = Date.now();
                const maxAge = 24 * 60 * 60 * 1000; // 24 часа

                set((state) => {
                    const newArchivedNotifications = new Map(state.archivedNotifications);
                    const newTimers = new Map(state.timers);

                    // Очищаем старые уведомления из архива
                    newArchivedNotifications.forEach((notification, id) => {
                        const age = now - new Date(notification.created_at).getTime();
                        if (age > maxAge) {
                            newArchivedNotifications.delete(id);
                        }
                    });

                    // Очищаем таймеры для несуществующих уведомлений
                    newTimers.forEach((timer, id) => {
                        if (!state.notifications.has(id)) {
                            clearTimeout(timer);
                            newTimers.delete(id);
                        }
                    });

                    return {
                        archivedNotifications: newArchivedNotifications,
                        timers: newTimers
                    };
                });
            },

            playNotificationSound: (sound: string | boolean) => {
                if (typeof sound === 'string') {
                    const audio = new Audio(sound);
                    audio.play().catch(console.error);
                } else if (sound === true) {
                    if ('Notification' in window && Notification.permission === 'granted') {
                        // Браузерное уведомление со звуком
                    }
                }
            },

            triggerVibration: () => {
                if ('vibrate' in navigator) {
                    navigator.vibrate([200, 100, 200]);
                }
            },

            processStringAction: async (action: string, notification: Notification) => {
                const [type, ...params] = action.split(':');
                switch (type) {
                    case 'redirect':
                        window.location.href = params.join(':');
                        break;
                    case 'close':
                        get().dismissNotification(notification.id);
                        break;
                    case 'copy':
                        await navigator.clipboard.writeText(params.join(':'));
                        break;
                }
            },

            showConfirmation: async (message: string) => {
                return window.confirm(message);
            },

            getNestedValue: (obj: any, path: string) => {
                return path.split('.').reduce((current, key) => current?.[key], obj);
            },

            evaluateCondition: (value: any, operator: string, expected: any, caseSensitive?: boolean) => {
                if (!caseSensitive && typeof value === 'string' && typeof expected === 'string') {
                    value = value.toLowerCase();
                    expected = expected.toLowerCase();
                }

                switch (operator) {
                    case 'equals': return value === expected;
                    case 'contains': return value?.includes?.(expected) || false;
                    case 'starts_with': return value?.startsWith?.(expected) || false;
                    case 'ends_with': return value?.endsWith?.(expected) || false;
                    case 'greater_than': return value > expected;
                    case 'less_than': return value < expected;
                    case 'regex': return new RegExp(expected).test(value);
                    default: return false;
                }
            },

            calculateStatistics: (notifications: Notification[]) => {
                const byType = {} as Record<NotificationType, number>;
                const byPriority = {} as Record<NotificationPriority, number>;

                notifications.forEach(n => {
                    byType[n.type] = (byType[n.type] || 0) + 1;
                    byPriority[n.priority] = (byPriority[n.priority] || 0) + 1;
                });

                return {
                    total_sent: notifications.length,
                    total_shown: notifications.filter(n => n.shown_at).length,
                    total_dismissed: notifications.filter(n => n.dismissed_at).length,
                    total_expired: notifications.filter(n => n.status === 'expired').length,
                    by_type: byType,
                    by_priority: byPriority,
                    by_group: {},
                    interaction_rate: 0,
                    average_view_time: 0,
                    most_common_categories: [],
                    peak_hours: [],
                    effectiveness_metrics: {
                        click_through_rate: 0,
                        action_completion_rate: 0,
                        user_satisfaction_score: 0
                    }
                };
            }
        })),
        {
            name: 'ip-roast-notification-store',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                config: state.config,
                groups: Array.from(state.groups.entries()),
                templates: Array.from(state.templates.entries()),
                rules: Array.from(state.rules.entries()),
                integrations: Array.from(state.integrations.entries()),
                stats: state.stats
            }),
            onRehydrateStorage: () => (state) => {
                if (state) {
                    // Восстанавливаем Map из массивов
                    if (state.groups) {
                        state.groups = new Map(state.groups as any);
                    }
                    if (state.templates) {
                        state.templates = new Map(state.templates as any);
                    }
                    if (state.rules) {
                        state.rules = new Map(state.rules as any);
                    }
                    if (state.integrations) {
                        state.integrations = new Map(state.integrations as any);
                    }
                }
            }
        }
    )
);

// ===== REACT CONTEXT И PROVIDER =====

export interface NotificationContextType {
    store: NotificationStore;
    filteredNotifications: Notification[];
    visibleNotifications: Notification[];
    criticalNotifications: Notification[];
    unreadCount: number;
    typeStats: Record<NotificationType, number>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export interface NotificationProviderProps {
    children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
    const store = useNotificationStore();

    // Инициализация при монтировании
    useEffect(() => {
        store.initialize();

        // Очистка при размонтировании
        return () => {
            store.cleanup();
        };
    }, []);

    // Вычисляемые значения
    const filteredNotifications = React.useMemo(() => {
        let result = Array.from(store.notifications.values());

        // Применяем фильтры
        if (store.filters.types?.length) {
            result = result.filter(n => store.filters.types!.includes(n.type));
        }

        if (store.filters.priorities?.length) {
            result = result.filter(n => store.filters.priorities!.includes(n.priority));
        }

        if (store.filters.groups?.length) {
            result = result.filter(n => n.group && store.filters.groups!.includes(n.group));
        }

        if (store.filters.status?.length) {
            result = result.filter(n => store.filters.status!.includes(n.status));
        }

        if (store.searchQuery) {
            const query = store.searchQuery.toLowerCase();
            result = result.filter(n =>
                n.title.toLowerCase().includes(query) ||
                n.message.toLowerCase().includes(query) ||
                n.tags?.some(tag => tag.toLowerCase().includes(query))
            );
        }

        // Сортировка
        result.sort((a, b) => {
            let comparison = 0;
            switch (store.sortBy) {
                case 'date':
                    comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                    break;
                case 'priority':
                    const priorityOrder = { emergency: 5, critical: 4, high: 3, normal: 2, low: 1 };
                    comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
                    break;
                case 'type':
                    comparison = a.type.localeCompare(b.type);
                    break;
                case 'status':
                    comparison = a.status.localeCompare(b.status);
                    break;
            }
            return store.sortOrder === 'desc' ? -comparison : comparison;
        });

        return result;
    }, [store.notifications, store.filters, store.searchQuery, store.sortBy, store.sortOrder]);

    const visibleNotifications = React.useMemo(() => {
        return filteredNotifications
            .filter(n => n.status === 'visible')
            .slice(0, store.config.max_notifications);
    }, [filteredNotifications, store.config.max_notifications]);

    const criticalNotifications = React.useMemo(() => {
        return filteredNotifications.filter(n =>
            n.priority === 'critical' || n.priority === 'emergency'
        );
    }, [filteredNotifications]);

    const unreadCount = React.useMemo(() => {
        return filteredNotifications.filter(n =>
            n.status === 'visible' && !n.shown_at
        ).length;
    }, [filteredNotifications]);

    const typeStats = React.useMemo(() => {
        const stats = {} as Record<NotificationType, number>;
        filteredNotifications.forEach(n => {
            stats[n.type] = (stats[n.type] || 0) + 1;
        });
        return stats;
    }, [filteredNotifications]);

    const contextValue: NotificationContextType = {
        store,
        filteredNotifications,
        visibleNotifications,
        criticalNotifications,
        unreadCount,
        typeStats
    };

    return (
        <NotificationContext.Provider value={contextValue}>
            {children}
        </NotificationContext.Provider>
    );
};

// ===== CUSTOM HOOK =====

export const useNotifications = (): NotificationContextType => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};

// ===== УДОБНЫЕ ФУНКЦИИ ДЛЯ БЫСТРОГО ИСПОЛЬЗОВАНИЯ =====

export const notifySuccess = (title: string, message: string, options?: Partial<Notification>): string => {
    const store = useNotificationStore.getState();
    return store.createNotification('success', title, message, options);
};

export const notifyError = (title: string, message: string, options?: Partial<Notification>): string => {
    const store = useNotificationStore.getState();
    return store.createNotification('error', title, message, { persistent: true, ...options });
};

export const notifyWarning = (title: string, message: string, options?: Partial<Notification>): string => {
    const store = useNotificationStore.getState();
    return store.createNotification('warning', title, message, options);
};

export const notifyInfo = (title: string, message: string, options?: Partial<Notification>): string => {
    const store = useNotificationStore.getState();
    return store.createNotification('info', title, message, options);
};

export const notifyLoading = (title: string, message: string, options?: Partial<Notification>): string => {
    const store = useNotificationStore.getState();
    return store.createNotification('loading', title, message, {
        persistent: true,
        showProgress: true,
        ...options
    });
};

export const notifyCritical = (title: string, message: string, options?: Partial<Notification>): string => {
    const store = useNotificationStore.getState();
    return store.createNotification('critical', title, message, {
        persistent: true,
        priority: 'critical',
        sound: true,
        ...options
    });
};

// ===== ЭКСПОРТ ПО УМОЛЧАНИЮ =====

export default useNotificationStore;
