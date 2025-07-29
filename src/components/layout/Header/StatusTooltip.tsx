// src/components/layout/Header/StatusTooltip.tsx
import React, { useState, useRef } from 'react';
import { Wifi, WifiOff, Loader2, AlertCircle } from 'lucide-react';
import clsx from 'clsx';
import { useTheme } from '@/hooks/useTheme';

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'error';

export interface StatusTooltipProps {
    status: ConnectionStatus;
    isConnected: boolean;
    lastUpdate?: Date;
    serverInfo?: {
        version?: string;
        uptime?: string;
        activeUsers?: number;
    };
    children: React.ReactNode;
    className?: string;
}

export const StatusTooltip: React.FC<StatusTooltipProps> = ({
    status,
    isConnected,
    lastUpdate,
    serverInfo,
    children,
    className
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout>();
    const { isDark } = useTheme();

    const handleMouseEnter = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
            setIsVisible(true);
        }, 500);
    };

    const handleMouseLeave = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setIsVisible(false);
    };

    const getStatusConfig = () => {
        switch (status) {
            case 'connected':
                return {
                    icon: Wifi,
                    title: 'Подключено',
                    message: 'Соединение с сервером установлено',
                    color: 'text-emerald-500'
                };
            case 'connecting':
                return {
                    icon: Loader2,
                    title: 'Подключение...',
                    message: 'Установка соединения с сервером',
                    color: 'text-yellow-500',
                    animated: true
                };
            case 'error':
                return {
                    icon: AlertCircle,
                    title: 'Ошибка подключения',
                    message: 'Не удалось подключиться к серверу',
                    color: 'text-red-500'
                };
            case 'disconnected':
            default:
                return {
                    icon: WifiOff,
                    title: 'Отключено',
                    message: 'Нет соединения с сервером',
                    color: 'text-red-500'
                };
        }
    };

    const statusConfig = getStatusConfig();
    const StatusIcon = statusConfig.icon;

    return (
        <div
            className={clsx('relative', className)}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {children}

            {/* Tooltip */}
            {isVisible && (
                <div className={clsx(
                    'absolute top-full right-0 mt-2 p-4 w-80 rounded-lg shadow-xl z-50',
                    'border backdrop-blur-sm',
                    isDark
                        ? 'bg-gray-900/95 border-gray-700'
                        : 'bg-white/95 border-gray-200'
                )}>
                    {/* Arrow */}
                    <div className={clsx(
                        'absolute -top-1 right-4 w-2 h-2 rotate-45',
                        isDark ? 'bg-gray-900 border-l border-t border-gray-700' : 'bg-white border-l border-t border-gray-200'
                    )} />

                    {/* Header */}
                    <div className="flex items-center space-x-3 mb-3">
                        <StatusIcon
                            className={clsx(
                                'w-5 h-5',
                                statusConfig.color,
                                statusConfig.animated && 'animate-spin'
                            )}
                        />
                        <div>
                            <h3 className={clsx(
                                'font-semibold text-sm',
                                isDark ? 'text-white' : 'text-gray-900'
                            )}>
                                {statusConfig.title}
                            </h3>
                            <p className={clsx(
                                'text-xs',
                                isDark ? 'text-gray-400' : 'text-gray-600'
                            )}>
                                {statusConfig.message}
                            </p>
                        </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-2">
                        {lastUpdate && (
                            <div className="flex justify-between text-xs">
                                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                                    Последнее обновление:
                                </span>
                                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                                    {lastUpdate.toLocaleTimeString()}
                                </span>
                            </div>
                        )}

                        {serverInfo && (
                            <>
                                {serverInfo.version && (
                                    <div className="flex justify-between text-xs">
                                        <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                                            Версия сервера:
                                        </span>
                                        <span className={clsx(
                                            'font-mono',
                                            isDark ? 'text-gray-300' : 'text-gray-700'
                                        )}>
                                            {serverInfo.version}
                                        </span>
                                    </div>
                                )}

                                {serverInfo.uptime && (
                                    <div className="flex justify-between text-xs">
                                        <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                                            Время работы:
                                        </span>
                                        <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                                            {serverInfo.uptime}
                                        </span>
                                    </div>
                                )}

                                {typeof serverInfo.activeUsers === 'number' && (
                                    <div className="flex justify-between text-xs">
                                        <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                                            Активных пользователей:
                                        </span>
                                        <span className={clsx(
                                            'font-medium',
                                            isDark ? 'text-emerald-400' : 'text-emerald-600'
                                        )}>
                                            {serverInfo.activeUsers}
                                        </span>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Connection indicator */}
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-center space-x-2">
                            <div className={clsx(
                                'w-2 h-2 rounded-full',
                                isConnected ? 'bg-emerald-500' : 'bg-red-500',
                                isConnected && 'animate-pulse'
                            )} />
                            <span className={clsx(
                                'text-xs font-medium',
                                isConnected
                                    ? (isDark ? 'text-emerald-400' : 'text-emerald-600')
                                    : (isDark ? 'text-red-400' : 'text-red-600')
                            )}>
                                {isConnected ? 'WebSocket подключен' : 'WebSocket отключен'}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
