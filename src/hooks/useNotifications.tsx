import { useState, useCallback, useEffect, useRef } from 'react';
import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// Типы уведомлений
export interface BaseNotification {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info' | 'security' | 'system';
    title?: string | undefined;
    message: string;
    description?: string | undefined;
    timestamp: number;
    duration?: number | undefined;
    priority: 'low' | 'normal' | 'high' | 'critical';
    category: 'scan' | 'network' | 'security' | 'system' | 'user' | 'report';
    persistent?: boolean | undefined;
    read?: boolean | undefined;
    actions?: Array<{
        id: string;
        label: string;
        action: () => void;
        variant?: 'primary' | 'secondary' | 'danger' | undefined;
    }> | undefined;
    metadata?: Record<string, any> | undefined;
}

// Специализированные типы уведомлений для IP_Roast
export interface ScanNotification extends BaseNotification {
    category: 'scan';
    metadata: {
        scanId: string;
        targetCount?: number | undefined;
        vulnerabilityCount?: number | undefined;
        progress?: number | undefined;
        scanType?: 'port' | 'vulnerability' | 'network' | 'full' | undefined;
    };
}

export interface SecurityNotification extends BaseNotification {
    category: 'security';
    type: 'security';
    priority: 'high' | 'critical';
    metadata: {
        threatLevel: 'low' | 'medium' | 'high' | 'critical';
        source?: string | undefined;
        affectedAssets?: string[] | undefined;
        riskScore?: number | undefined;
    };
}

export interface NetworkNotification extends BaseNotification {
    category: 'network';
    metadata: {
        deviceId?: string | undefined;
        deviceType?: string | undefined;
        ipAddress?: string | undefined;
        port?: number | undefined;
        protocol?: string | undefined;
    };
}

export interface SystemNotification extends BaseNotification {
    category: 'system';
    metadata: {
        component: string;
        version?: string | undefined;
        status?: 'online' | 'offline' | 'degraded' | undefined;
        uptime?: number | undefined;
    };
}

export type IPRoastNotification =
    | ScanNotification
    | SecurityNotification
    | NetworkNotification
    | SystemNotification
    | BaseNotification;

// Настройки уведомлений
export interface NotificationSettings {
    maxNotifications: number;
    defaultDuration: number;
    enableSound: boolean;
    enableDesktop: boolean;
    enablePersistence: boolean;
    categories: {
        [K in BaseNotification['category']]: {
            enabled: boolean;
            sound?: boolean | undefined;
            desktop?: boolean | undefined;
            priority?: BaseNotification['priority'] | undefined;
        };
    };
    filters: {
        showReadNotifications: boolean;
        hideOldNotifications: boolean;
        groupSimilar: boolean;
        minPriority: BaseNotification['priority'];
    };
}

// Zustand store для глобального управления уведомлениями
interface NotificationStore {
    notifications: IPRoastNotification[];
    settings: NotificationSettings;
    unreadCount: number;

    // Actions
    addNotification: (notification: Omit<IPRoastNotification, 'id' | 'timestamp'>) => string;
    removeNotification: (id: string) => void;
    updateNotification: (id: string, updates: Partial<IPRoastNotification>) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    clearNotifications: (category?: BaseNotification['category'] | undefined) => void;
    clearOldNotifications: (olderThan: number) => void;
    updateSettings: (settings: Partial<NotificationSettings>) => void;

    // Getters
    getNotificationsByCategory: (category: BaseNotification['category']) => IPRoastNotification[];
    getNotificationsByPriority: (priority: BaseNotification['priority']) => IPRoastNotification[];
    getUnreadNotifications: () => IPRoastNotification[];
    getRecentNotifications: (limit?: number | undefined) => IPRoastNotification[];
}

// Настройки по умолчанию
const defaultSettings: NotificationSettings = {
    maxNotifications: 50,
    defaultDuration: 5000,
    enableSound: true,
    enableDesktop: true,
    enablePersistence: true,
    categories: {
        scan: { enabled: true, sound: true, desktop: true, priority: 'normal' },
        network: { enabled: true, sound: false, desktop: true, priority: 'normal' },
        security: { enabled: true, sound: true, desktop: true, priority: 'high' },
        system: { enabled: true, sound: false, desktop: false, priority: 'low' },
        user: { enabled: true, sound: false, desktop: false, priority: 'normal' },
        report: { enabled: true, sound: false, desktop: false, priority: 'normal' }
    },
    filters: {
        showReadNotifications: true,
        hideOldNotifications: false,
        groupSimilar: true,
        minPriority: 'low'
    }
};

// Zustand store
export const useNotificationStore = create<NotificationStore>()(
    subscribeWithSelector(
        persist(
            immer((set, get) => ({
                notifications: [],
                settings: defaultSettings,
                unreadCount: 0,

                addNotification: (notification) => {
                    const id = `notification-${Date.now()}-${Math.random().toString(36).substring(2)}`;
                    const newNotification: IPRoastNotification = {
                        ...notification,
                        id,
                        timestamp: Date.now(),
                        read: false,
                        duration: notification.duration ?? get().settings.defaultDuration
                    };

                    set((state) => {
                        // Добавляем новое уведомление
                        state.notifications.unshift(newNotification);

                        // Ограничиваем количество уведомлений
                        if (state.notifications.length > state.settings.maxNotifications) {
                            state.notifications = state.notifications.slice(0, state.settings.maxNotifications);
                        }

                        // Обновляем счетчик непрочитанных - ИСПРАВЛЕНО
                        state.unreadCount = state.notifications.filter((n: IPRoastNotification) => !n.read).length;
                    });

                    return id;
                },

                removeNotification: (id) => {
                    set((state) => {
                        // ИСПРАВЛЕНО: явная типизация
                        state.notifications = state.notifications.filter((n: IPRoastNotification) => n.id !== id);
                        state.unreadCount = state.notifications.filter((n: IPRoastNotification) => !n.read).length;
                    });
                },

                updateNotification: (id, updates) => {
                    set((state) => {
                        // ИСПРАВЛЕНО: явная типизация
                        const index = state.notifications.findIndex((n: IPRoastNotification) => n.id === id);
                        if (index !== -1) {
                            state.notifications[index] = { ...state.notifications[index], ...updates };
                            state.unreadCount = state.notifications.filter((n: IPRoastNotification) => !n.read).length;
                        }
                    });
                },

                markAsRead: (id) => {
                    set((state) => {
                        // ИСПРАВЛЕНО: явная типизация
                        const notification = state.notifications.find((n: IPRoastNotification) => n.id === id);
                        if (notification && !notification.read) {
                            notification.read = true;
                            state.unreadCount = state.notifications.filter((n: IPRoastNotification) => !n.read).length;
                        }
                    });
                },

                markAllAsRead: () => {
                    set((state) => {
                        // ИСПРАВЛЕНО: явная типизация
                        state.notifications.forEach((n: IPRoastNotification) => n.read = true);
                        state.unreadCount = 0;
                    });
                },

                clearNotifications: (category) => {
                    set((state) => {
                        if (category) {
                            // ИСПРАВЛЕНО: явная типизация
                            state.notifications = state.notifications.filter(
                                (n: IPRoastNotification) => n.category !== category
                            );
                        } else {
                            state.notifications = [];
                        }
                        state.unreadCount = state.notifications.filter((n: IPRoastNotification) => !n.read).length;
                    });
                },

                clearOldNotifications: (olderThan) => {
                    set((state) => {
                        // ИСПРАВЛЕНО: явная типизация
                        state.notifications = state.notifications.filter(
                            (n: IPRoastNotification) => n.timestamp > (Date.now() - olderThan)
                        );
                        state.unreadCount = state.notifications.filter((n: IPRoastNotification) => !n.read).length;
                    });
                },

                updateSettings: (newSettings) => {
                    set((state) => {
                        state.settings = { ...state.settings, ...newSettings };
                    });
                },

                getNotificationsByCategory: (category) => {
                    // ИСПРАВЛЕНО: явная типизация
                    return get().notifications.filter((n: IPRoastNotification) => n.category === category);
                },

                getNotificationsByPriority: (priority) => {
                    // ИСПРАВЛЕНО: явная типизация
                    return get().notifications.filter((n: IPRoastNotification) => n.priority === priority);
                },

                getUnreadNotifications: () => {
                    // ИСПРАВЛЕНО: явная типизация
                    return get().notifications.filter((n: IPRoastNotification) => !n.read);
                },

                getRecentNotifications: (limit = 10) => {
                    return get().notifications
                        // ИСПРАВЛЕНО: явная типизация для sort
                        .sort((a: IPRoastNotification, b: IPRoastNotification) => b.timestamp - a.timestamp)
                        .slice(0, limit);
                }
            })),
            {
                name: 'ip-roast-notifications',
                partialize: (state) => ({
                    settings: state.settings,
                    // ИСПРАВЛЕНО: явная типизация
                    notifications: state.notifications.filter((n: IPRoastNotification) => n.persistent)
                })
            }
        )
    )
);


// Основной хук useNotifications
export const useNotifications = () => {
    const [isClient, setIsClient] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const permissionRef = useRef<NotificationPermission>('default');

    const store = useNotificationStore();
    const {
        notifications,
        settings,
        unreadCount,
        addNotification: addNotificationToStore,
        removeNotification,
        updateNotification,
        markAsRead,
        markAllAsRead,
        clearNotifications,
        clearOldNotifications,
        updateSettings,
        getNotificationsByCategory,
        getNotificationsByPriority,
        getUnreadNotifications,
        getRecentNotifications
    } = store;

    // Инициализация на клиенте
    useEffect(() => {
        setIsClient(true);

        // Проверка разрешений для desktop уведомлений
        if (typeof window !== 'undefined' && 'Notification' in window) {
            permissionRef.current = Notification.permission;

            if (Notification.permission === 'default') {
                Notification.requestPermission().then((permission) => {
                    permissionRef.current = permission;
                });
            }
        }

        // Инициализация аудио для звуковых уведомлений
        if (settings.enableSound) {
            audioRef.current = new Audio('/sounds/notification.mp3');
            audioRef.current.volume = 0.5;
        }

        return () => {
            if (audioRef.current) {
                audioRef.current = null;
            }
        };
    }, [settings.enableSound]);

    // Автоочистка старых уведомлений
    useEffect(() => {
        const cleanup = () => {
            const oneWeekAgo = 7 * 24 * 60 * 60 * 1000;
            clearOldNotifications(oneWeekAgo);
        };

        const interval = setInterval(cleanup, 24 * 60 * 60 * 1000); // Раз в день
        return () => clearInterval(interval);
    }, [clearOldNotifications]);

    // Показ desktop уведомления
    const showDesktopNotification = useCallback((notification: IPRoastNotification) => {
        if (!isClient || !settings.enableDesktop || permissionRef.current !== 'granted') {
            return;
        }

        const categorySettings = settings.categories[notification.category];
        if (!categorySettings.desktop) return;

        const desktopNotification = new Notification(
            notification.title || `IP_Roast ${notification.category}`,
            {
                body: notification.message,
                icon: '/favicon.ico',
                badge: '/icon-192.png',
                tag: notification.id,
                requireInteraction: notification.priority === 'critical',
                silent: !settings.enableSound
            }
        );

        desktopNotification.onclick = () => {
            window.focus();
            markAsRead(notification.id);
            desktopNotification.close();
        };

        // Автозакрытие
        if (notification.duration && notification.duration > 0) {
            setTimeout(() => {
                desktopNotification.close();
            }, notification.duration);
        }
    }, [isClient, settings, markAsRead]);

    // Воспроизведение звука
    const playNotificationSound = useCallback((notification: IPRoastNotification) => {
        if (!settings.enableSound || !audioRef.current) return;

        const categorySettings = settings.categories[notification.category];
        if (!categorySettings.sound) return;

        // Разные звуки для разных типов
        const soundMap = {
            success: '/sounds/success.mp3',
            error: '/sounds/error.mp3',
            warning: '/sounds/warning.mp3',
            security: '/sounds/security-alert.mp3',
            info: '/sounds/info.mp3',
            system: '/sounds/system.mp3'
        };

        const soundFile = soundMap[notification.type] || '/sounds/notification.mp3';

        if (audioRef.current.src !== soundFile) {
            audioRef.current.src = soundFile;
        }

        audioRef.current.play().catch(console.warn);
    }, [settings]);

    // Добавление уведомления с обработкой звука и desktop
    const addNotification = useCallback((
        notification: Omit<IPRoastNotification, 'id' | 'timestamp'>
    ): string => {
        const categorySettings = settings.categories[notification.category];

        if (!categorySettings.enabled) {
            return '';
        }

        const id = addNotificationToStore(notification);
        const fullNotification = { ...notification, id, timestamp: Date.now() } as IPRoastNotification;

        // Показываем desktop уведомление
        setTimeout(() => showDesktopNotification(fullNotification), 100);

        // Воспроизводим звук
        setTimeout(() => playNotificationSound(fullNotification), 50);

        return id;
    }, [settings, addNotificationToStore, showDesktopNotification, playNotificationSound]);

    // Специализированные методы для IP_Roast
    const notifyScanComplete = useCallback((
        scanId: string,
        results: {
            targetCount: number;
            vulnerabilityCount: number;
            scanType: 'port' | 'vulnerability' | 'network' | 'full';
        }
    ) => {
        const hasVulnerabilities = results.vulnerabilityCount > 0;

        return addNotification({
            type: hasVulnerabilities ? 'warning' : 'success',
            category: 'scan',
            priority: hasVulnerabilities ? 'high' : 'normal',
            title: 'Сканирование завершено',
            message: `Обработано целей: ${results.targetCount}`,
            description: hasVulnerabilities
                ? `Обнаружено уязвимостей: ${results.vulnerabilityCount}`
                : 'Критических уязвимостей не найдено',
            duration: 8000,
            metadata: {
                scanId,
                targetCount: results.targetCount,
                vulnerabilityCount: results.vulnerabilityCount,
                scanType: results.scanType
            },
            actions: [
                {
                    id: 'view-results',
                    label: 'Посмотреть результаты',
                    action: () => window.location.href = `/scans/${scanId}`,
                    variant: 'primary'
                }
            ]
        });
    }, [addNotification]);

    const notifySecurityAlert = useCallback((
        alert: {
            threatLevel: 'low' | 'medium' | 'high' | 'critical';
            message: string;
            source?: string | undefined;
            affectedAssets?: string[] | undefined;
        }
    ) => {
        return addNotification({
            type: 'security',
            category: 'security',
            priority: alert.threatLevel === 'critical' ? 'critical' : 'high',
            title: '🚨 Угроза безопасности',
            message: alert.message,
            description: alert.source ? `Источник: ${alert.source}` : undefined,
            duration: alert.threatLevel === 'critical' ? 0 : 10000,
            persistent: alert.threatLevel === 'critical',
            metadata: {
                threatLevel: alert.threatLevel,
                source: alert.source,
                affectedAssets: alert.affectedAssets,
                riskScore: alert.threatLevel === 'critical' ? 10 : alert.threatLevel === 'high' ? 8 : 5
            }
        });
    }, [addNotification]);

    const notifyNetworkChange = useCallback((
        change: {
            type: 'device_online' | 'device_offline' | 'new_device' | 'port_change';
            deviceId: string;
            deviceType?: string | undefined;
            ipAddress?: string | undefined;
        }
    ) => {
        const typeConfig = {
            device_online: { type: 'success' as const, message: 'Устройство подключено' },
            device_offline: { type: 'warning' as const, message: 'Устройство отключено' },
            new_device: { type: 'info' as const, message: 'Обнаружено новое устройство' },
            port_change: { type: 'info' as const, message: 'Изменение портов устройства' }
        };

        const config = typeConfig[change.type];

        return addNotification({
            type: config.type,
            category: 'network',
            priority: 'normal',
            title: 'Изменение сети',
            message: config.message,
            description: change.ipAddress ? `IP: ${change.ipAddress}` : undefined,
            metadata: {
                deviceId: change.deviceId,
                deviceType: change.deviceType,
                ipAddress: change.ipAddress
            }
        });
    }, [addNotification]);

    const notifySystemEvent = useCallback((
        event: {
            component: string;
            type: 'startup' | 'shutdown' | 'error' | 'update' | 'maintenance';
            message: string;
            version?: string | undefined;
        }
    ) => {
        const typeConfig = {
            startup: { type: 'success' as const, priority: 'low' as const },
            shutdown: { type: 'info' as const, priority: 'low' as const },
            error: { type: 'error' as const, priority: 'high' as const },
            update: { type: 'info' as const, priority: 'normal' as const },
            maintenance: { type: 'warning' as const, priority: 'normal' as const }
        };

        const config = typeConfig[event.type];

        return addNotification({
            type: config.type,
            category: 'system',
            priority: config.priority,
            title: `Система: ${event.component}`,
            message: event.message,
            description: event.version ? `Версия: ${event.version}` : undefined,
            metadata: {
                component: event.component,
                version: event.version
            }
        });
    }, [addNotification]);

    // Фильтрация уведомлений
    const getFilteredNotifications = useCallback(() => {
        let filtered = [...notifications];

        // Фильтр по прочитанным
        if (!settings.filters.showReadNotifications) {
            filtered = filtered.filter(n => !n.read);
        }

        // Фильтр по старым
        if (settings.filters.hideOldNotifications) {
            const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
            filtered = filtered.filter((n: IPRoastNotification) =>
                n.timestamp && n.timestamp > oneDayAgo
            );
        }

        // Фильтр по приоритету
        const priorityOrder = { low: 0, normal: 1, high: 2, critical: 3 };
        const minPriorityLevel = priorityOrder[settings.filters.minPriority];
        filtered = filtered.filter(n => priorityOrder[n.priority] >= minPriorityLevel);

        return filtered.sort((a, b) => b.timestamp - a.timestamp);
    }, [notifications, settings.filters]);

    // Группировка похожих уведомлений
    const getGroupedNotifications = useCallback(() => {
        const filtered = getFilteredNotifications();

        if (!settings.filters.groupSimilar) {
            return filtered;
        }

        const groups = new Map<string, IPRoastNotification[]>();
        const standalone: IPRoastNotification[] = [];

        for (const notification of filtered) {
            if (!notification || !('message' in notification)) continue;

            const groupKey = `${notification.category}-${notification.type}-${notification.message}`;

            if (groups.has(groupKey)) {
                groups.get(groupKey)!.push(notification);
            } else {
                const similar = filtered.filter((n: IPRoastNotification) =>
                    n && n !== notification &&
                    n.category === notification.category &&
                    n.type === notification.type &&
                    n.message === notification.message
                );

                if (similar.length > 0) {
                    groups.set(groupKey, [notification, ...similar]);
                } else {
                    standalone.push(notification);
                }
            }
        }

        // Безопасное создание представителей групп
        const representatives = Array.from(groups.values())
            .map(group => {
                const latest = group.find((item: IPRoastNotification) =>
                    item && 'timestamp' in item && typeof item.timestamp === 'number'
                );

                if (!latest) {
                    console.warn('No valid notification found in group, using first item');
                    return group[0];
                }

                return {
                    ...latest,
                    message: group.length > 1 ? `${latest.message} (${group.length})` : latest.message,
                    metadata: {
                        ...latest.metadata,
                        groupCount: group.length,
                        groupIds: group.map((n: IPRoastNotification) => n.id)
                    }
                };
            })
            .filter((item: IPRoastNotification | undefined): item is IPRoastNotification =>
                item != null
            );

        return [...representatives, ...standalone]
            .sort((a: IPRoastNotification, b: IPRoastNotification) => {
                const aTime = ('timestamp' in a && typeof a.timestamp === 'number') ? a.timestamp : 0;
                const bTime = ('timestamp' in b && typeof b.timestamp === 'number') ? b.timestamp : 0;
                return bTime - aTime;
            });
    }, [getFilteredNotifications, settings.filters.groupSimilar]);


    return {
        // Состояние
        notifications: getGroupedNotifications(),
        allNotifications: notifications,
        settings,
        unreadCount,
        isClient,

        // Основные действия
        addNotification,
        removeNotification,
        updateNotification,
        markAsRead,
        markAllAsRead,
        clearNotifications,
        clearOldNotifications,
        updateSettings,

        // Геттеры
        getNotificationsByCategory,
        getNotificationsByPriority,
        getUnreadNotifications,
        getRecentNotifications,
        getFilteredNotifications,

        // Специализированные методы IP_Roast
        notifyScanComplete,
        notifySecurityAlert,
        notifyNetworkChange,
        notifySystemEvent,

        // Вспомогательные функции
        success: useCallback((message: string, options?: Partial<BaseNotification>) =>
            addNotification({ type: 'success', message, category: 'user', priority: 'normal', ...options }),
            [addNotification]),

        error: useCallback((message: string, options?: Partial<BaseNotification>) =>
            addNotification({ type: 'error', message, category: 'user', priority: 'high', ...options }),
            [addNotification]),

        warning: useCallback((message: string, options?: Partial<BaseNotification>) =>
            addNotification({ type: 'warning', message, category: 'user', priority: 'normal', ...options }),
            [addNotification]),

        info: useCallback((message: string, options?: Partial<BaseNotification>) =>
            addNotification({ type: 'info', message, category: 'user', priority: 'normal', ...options }),
            [addNotification])
    };
};

// Хук для подписки на определенные типы уведомлений
export const useNotificationSubscription = <T extends BaseNotification['category']>(
    category: T,
    callback: (notification: IPRoastNotification & { category: T }) => void
) => {
    const notifications = useNotificationStore(state => state.notifications);

    useEffect(() => {
        const unsubscribe = useNotificationStore.subscribe(
            (state) => state.notifications,
            (currentNotifications, previousNotifications) => {
                const newNotifications = currentNotifications.filter(
                    current =>
                        current.category === category &&
                        !previousNotifications.some(prev => prev.id === current.id)
                );

                newNotifications.forEach(notification => {
                    callback(notification as IPRoastNotification & { category: T });
                });
            }
        );

        return unsubscribe;
    }, [category, callback]);

    return notifications.filter(n => n.category === category) as (IPRoastNotification & { category: T })[];
};

// Провайдер контекста для настроек
export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { settings, updateSettings } = useNotifications();

    // Загрузка настроек из localStorage при монтировании
    useEffect(() => {
        const savedSettings = localStorage.getItem('ip-roast-notification-preferences');
        if (savedSettings) {
            try {
                const parsed = JSON.parse(savedSettings);
                updateSettings(parsed);
            } catch (error) {
                console.warn('Failed to load notification settings:', error);
            }
        }
    }, [updateSettings]);

    // Сохранение настроек в localStorage при изменении
    useEffect(() => {
        localStorage.setItem('ip-roast-notification-preferences', JSON.stringify(settings));
    }, [settings]);

    return <>{children}</>;
};

export default useNotifications;
