// src/components/layout/Header/Navigation.tsx
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    Search,
    BarChart3,
    Network,
    FileText,
    Settings,
    Target,
    Shield,
    Activity
} from 'lucide-react';
import clsx from 'clsx';
import { useTheme } from '@/hooks/useTheme';

export interface NavigationItem {
    id: string;
    label: string;
    path: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
    description?: string;
    requiresAuth?: boolean;
    permissions?: string[];
}

interface NavigationProps {
    mobile?: boolean;
    onItemClick?: () => void;
    className?: string;
}

const navigationItems: NavigationItem[] = [
    {
        id: 'scanner',
        label: 'Сканер',
        path: '/scanner',
        icon: Search,
        description: 'Сканирование сети и поиск устройств'
    },
    {
        id: 'network',
        label: 'Топология',
        path: '/network',
        icon: Network,
        description: 'Карта сети и топология устройств'
    },
    {
        id: 'recon',
        label: 'Разведка',
        path: '/recon',
        icon: Target,
        description: 'Углубленный анализ и разведка'
    },
    {
        id: 'reports',
        label: 'Отчеты',
        path: '/reports',
        icon: FileText,
        description: 'Аналитика и отчетность'
    },
    {
        id: 'analytics',
        label: 'Аналитика',
        path: '/analytics',
        icon: BarChart3,
        description: 'Графики и статистика'
    },
    {
        id: 'security',
        label: 'Безопасность',
        path: '/security',
        icon: Shield,
        description: 'Анализ уязвимостей и угроз'
    },
    {
        id: 'monitoring',
        label: 'Мониторинг',
        path: '/monitoring',
        icon: Activity,
        description: 'Отслеживание активности в реальном времени'
    },
    {
        id: 'settings',
        label: 'Настройки',
        path: '/settings',
        icon: Settings,
        description: 'Конфигурация системы'
    }
];

export const Navigation: React.FC<NavigationProps> = ({
    mobile = false,
    onItemClick,
    className
}) => {
    const { isDark } = useTheme();
    const location = useLocation();

    const isActive = (path: string) => {
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    const baseClasses = mobile
        ? 'flex flex-col'
        : 'flex items-center space-x-1';

    const itemClasses = mobile
        ? clsx(
            'flex items-center space-x-3 px-6 py-4 text-sm font-medium transition-colors',
            'hover:bg-gray-100 dark:hover:bg-gray-800',
            'border-l-4 border-transparent'
        )
        : clsx(
            'flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium',
            'transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800'
        );

    const activeClasses = mobile
        ? clsx(
            'border-l-emerald-500 bg-emerald-50 dark:bg-emerald-900/20',
            'text-emerald-700 dark:text-emerald-400'
        )
        : clsx(
            'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
            'shadow-sm ring-1 ring-emerald-200 dark:ring-emerald-800'
        );

    const inactiveClasses = mobile
        ? 'text-gray-700 dark:text-gray-300'
        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100';

    return (
        <nav className={clsx(baseClasses, className)}>
            {navigationItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);

                return (
                    <NavLink
                        key={item.id}
                        to={item.path}
                        className={clsx(
                            itemClasses,
                            active ? activeClasses : inactiveClasses
                        )}
                        onClick={onItemClick}
                        title={mobile ? undefined : item.description}
                    >
                        <Icon
                            className={clsx(
                                mobile ? 'w-5 h-5' : 'w-4 h-4',
                                'flex-shrink-0'
                            )}
                        />
                        <span>{item.label}</span>

                        {item.badge && (
                            <span className={clsx(
                                'ml-auto px-2 py-1 text-xs font-medium rounded-full',
                                'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            )}>
                                {item.badge}
                            </span>
                        )}

                        {mobile && item.description && (
                            <span className="block text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {item.description}
                            </span>
                        )}
                    </NavLink>
                );
            })}
        </nav>
    );
};
