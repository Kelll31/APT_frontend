import React, { useEffect, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

export interface ToastProps {
    id?: string | undefined;
    type: 'success' | 'error' | 'warning' | 'info';
    title?: string | undefined;
    message: string;
    description?: string | undefined;
    duration?: number | undefined;
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center' | undefined;
    showProgress?: boolean | undefined;
    showIcon?: boolean | undefined;
    showCloseButton?: boolean | undefined;
    persistOnHover?: boolean | undefined;
    onClick?: (() => void) | undefined;
    onClose?: (() => void) | undefined;
    onShow?: (() => void) | undefined;
    className?: string | undefined;
    style?: React.CSSProperties | undefined;
    priority?: 'low' | 'normal' | 'high' | 'critical' | undefined;
    actions?: Array<{
        label: string;
        onClick: () => void;
        variant?: 'primary' | 'secondary' | 'ghost' | undefined;
    }> | undefined;
}

const Toast: React.FC<ToastProps> = ({
    type,
    title,
    message,
    description,
    duration = 5000,
    position = 'top-right',
    showProgress = true,
    showIcon = true,
    showCloseButton = true,
    persistOnHover = true,
    onClick,
    onClose,
    onShow,
    className = '',
    style,
    priority = 'normal',
    actions
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isRemoving, setIsRemoving] = useState(false);
    const [progress, setProgress] = useState(100);
    const [isPaused, setIsPaused] = useState(false);
    const progressRef = useRef<number>(100);
    const timerRef = useRef<NodeJS.Timeout>();
    const progressIntervalRef = useRef<NodeJS.Timeout>();
    const startTimeRef = useRef<number>(0);
    const remainingTimeRef = useRef<number>(duration);

    // Конфигурация типов уведомлений
    const typeConfig = {
        success: {
            bgColor: 'bg-emerald-900/90',
            borderColor: 'border-emerald-700',
            iconColor: 'text-emerald-400',
            progressColor: 'bg-emerald-500',
            icon: (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
            )
        },
        error: {
            bgColor: 'bg-red-900/90',
            borderColor: 'border-red-700',
            iconColor: 'text-red-400',
            progressColor: 'bg-red-500',
            icon: (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            )
        },
        warning: {
            bgColor: 'bg-yellow-900/90',
            borderColor: 'border-yellow-700',
            iconColor: 'text-yellow-400',
            progressColor: 'bg-yellow-500',
            icon: (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
            )
        },
        info: {
            bgColor: 'bg-blue-900/90',
            borderColor: 'border-blue-700',
            iconColor: 'text-blue-400',
            progressColor: 'bg-blue-500',
            icon: (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
            )
        }
    };

    // Позиционирование
    const positionClasses = {
        'top-right': 'top-4 right-4',
        'top-left': 'top-4 left-4',
        'bottom-right': 'bottom-4 right-4',
        'bottom-left': 'bottom-4 left-4',
        'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
        'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
    };

    // Приоритетность уведомлений
    const priorityConfig = {
        low: { zIndex: 1000, duration: 3000 },
        normal: { zIndex: 1010, duration: 5000 },
        high: { zIndex: 1020, duration: 8000 },
        critical: { zIndex: 1030, duration: 0 } // Не закрывается автоматически
    };

    const config = typeConfig[type];
    const prioritySettings = priorityConfig[priority];
    const effectiveDuration = priority === 'critical' ? 0 : duration || prioritySettings.duration;

    // Функция закрытия
    const handleClose = useCallback(() => {
        setIsRemoving(true);

        // Очистка таймеров
        if (timerRef.current) clearTimeout(timerRef.current);
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

        // Задержка для анимации закрытия
        setTimeout(() => {
            setIsVisible(false);
            onClose?.();
        }, 300);
    }, [onClose]);

    // Управление таймером автозакрытия
    const startTimer = useCallback(() => {
        if (effectiveDuration === 0) return;

        startTimeRef.current = Date.now();

        timerRef.current = setTimeout(() => {
            handleClose();
        }, remainingTimeRef.current);

        // Прогресс-бар
        if (showProgress) {
            const interval = 50; // Обновление каждые 50мс
            progressIntervalRef.current = setInterval(() => {
                const elapsed = Date.now() - startTimeRef.current;
                const newProgress = Math.max(0, 100 - (elapsed / remainingTimeRef.current) * 100);
                setProgress(newProgress);
                progressRef.current = newProgress;

                if (newProgress <= 0) {
                    if (progressIntervalRef.current) {
                        clearInterval(progressIntervalRef.current);
                    }
                }
            }, interval);
        }
    }, [effectiveDuration, showProgress, handleClose]);

    const pauseTimer = useCallback(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

        // Сохраняем оставшееся время
        const elapsed = Date.now() - startTimeRef.current;
        remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);
        setIsPaused(true);
    }, []);

    const resumeTimer = useCallback(() => {
        if (effectiveDuration === 0) return;
        setIsPaused(false);
        startTimer();
    }, [effectiveDuration, startTimer]);

    // Инициализация
    useEffect(() => {
        setIsVisible(true);
        remainingTimeRef.current = effectiveDuration;

        const timer = setTimeout(() => {
            startTimer();
            onShow?.();
        }, 100);

        return () => {
            clearTimeout(timer);
            if (timerRef.current) clearTimeout(timerRef.current);
            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        };
    }, [effectiveDuration, startTimer, onShow]);

    // Обработчики мыши для паузы/возобновления
    const handleMouseEnter = useCallback(() => {
        if (persistOnHover && effectiveDuration > 0) {
            pauseTimer();
        }
    }, [persistOnHover, effectiveDuration, pauseTimer]);

    const handleMouseLeave = useCallback(() => {
        if (persistOnHover && effectiveDuration > 0 && !isRemoving) {
            resumeTimer();
        }
    }, [persistOnHover, effectiveDuration, isRemoving, resumeTimer]);

    // Обработчик клика
    const handleClick = useCallback(() => {
        onClick?.();
    }, [onClick]);

    // Рендеринг действий
    const renderActions = () => {
        if (!actions || actions.length === 0) return null;

        return (
            <div className="flex gap-2 mt-3">
                {actions.map((action, index) => (
                    <button
                        key={index}
                        onClick={(e) => {
                            e.stopPropagation();
                            action.onClick();
                        }}
                        className={`px-3 py-1 text-xs font-medium rounded transition-colors duration-200 ${action.variant === 'primary'
                            ? `${config.progressColor} text-white hover:opacity-80`
                            : action.variant === 'secondary'
                                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                : 'text-gray-400 hover:text-white hover:bg-gray-700'
                            }`}
                    >
                        {action.label}
                    </button>
                ))}
            </div>
        );
    };

    if (!isVisible) return null;

    const toastContent = (
        <div
            className={`
        fixed ${positionClasses[position]} w-full max-w-sm pointer-events-none
        transition-all duration-300 ease-out transform
        ${isVisible && !isRemoving ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}
      `}
            style={{ zIndex: prioritySettings.zIndex, ...style }}
        >
            <div
                className={`
          relative overflow-hidden rounded-lg border shadow-lg backdrop-blur-sm pointer-events-auto
          ${config.bgColor} ${config.borderColor}
          ${onClick ? 'cursor-pointer hover:shadow-xl' : ''}
          ${className}
        `}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onClick={onClick ? handleClick : undefined}
                role={onClick ? 'button' : 'alert'}
                aria-live="assertive"
                aria-atomic="true"
            >
                {/* Прогресс-бар */}
                {showProgress && effectiveDuration > 0 && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gray-800">
                        <div
                            className={`h-full transition-all duration-100 ease-linear ${config.progressColor} ${isPaused ? 'animate-pulse' : ''
                                }`}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                )}

                <div className="p-4">
                    <div className="flex items-start gap-3">
                        {/* Иконка */}
                        {showIcon && (
                            <div className={`flex-shrink-0 ${config.iconColor}`}>
                                {config.icon}
                            </div>
                        )}

                        {/* Контент */}
                        <div className="flex-1 min-w-0">
                            {title && (
                                <h4 className="text-sm font-semibold text-white mb-1 truncate">
                                    {title}
                                </h4>
                            )}
                            <p className="text-sm text-gray-200 leading-relaxed">
                                {message}
                            </p>
                            {description && (
                                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                                    {description}
                                </p>
                            )}

                            {renderActions()}
                        </div>

                        {/* Кнопка закрытия */}
                        {showCloseButton && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleClose();
                                }}
                                className="flex-shrink-0 text-gray-400 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/20 rounded"
                                aria-label="Закрыть уведомление"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>

                {/* Индикатор приоритета */}
                {priority === 'critical' && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 animate-pulse" />
                )}
                {priority === 'high' && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500" />
                )}
            </div>
        </div>
    );

    // Рендеринг через портал для правильного позиционирования
    return createPortal(toastContent, document.body);
};

// Менеджер уведомлений
export interface ToastManagerProps {
    toasts: (ToastProps & { id: string })[];
    onRemove: (id: string) => void;
    maxToasts?: number | undefined;
    position?: ToastProps['position'];
}

export const ToastManager: React.FC<ToastManagerProps> = ({
    toasts,
    onRemove,
    maxToasts = 5,
    position = 'top-right'
}) => {
    // Ограничиваем количество одновременных уведомлений
    const visibleToasts = toasts.slice(-maxToasts);

    return (
        <>
            {visibleToasts.map((toast, index) => (
                <Toast
                    key={toast.id}
                    {...toast}
                    position={position}
                    onClose={() => onRemove(toast.id)}
                    style={{
                        // Смещение для множественных уведомлений
                        ...(toast.style || {}),
                        transform: `translateY(${index * -80}px)`,
                        zIndex: (toast.priority === 'critical' ? 1030 : 1010) + index
                    }}
                />
            ))}
        </>
    );
};

// Хук для удобного использования
export const useToast = () => {
    const [toasts, setToasts] = useState<(ToastProps & { id: string })[]>([]);

    const addToast = useCallback((toast: Omit<ToastProps, 'id'>) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2)}`;
        const newToast = { ...toast, id };

        setToasts(prev => [...prev, newToast]);

        return id;
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    const clearToasts = useCallback(() => {
        setToasts([]);
    }, []);

    // Функции-помощники для разных типов уведомлений
    const success = useCallback((message: string, options?: Partial<ToastProps>) => {
        return addToast({ type: 'success', message, ...options });
    }, [addToast]);

    const error = useCallback((message: string, options?: Partial<ToastProps>) => {
        return addToast({ type: 'error', message, ...options });
    }, [addToast]);

    const warning = useCallback((message: string, options?: Partial<ToastProps>) => {
        return addToast({ type: 'warning', message, ...options });
    }, [addToast]);

    const info = useCallback((message: string, options?: Partial<ToastProps>) => {
        return addToast({ type: 'info', message, ...options });
    }, [addToast]);

    return {
        toasts,
        addToast,
        removeToast,
        clearToasts,
        success,
        error,
        warning,
        info
    };
};

// Специализированные компоненты для IP_Roast

// Уведомление о результатах сканирования
export const ScanResultToast: React.FC<{
    scanId: string;
    vulnerabilitiesFound: number;
    hostsScanned: number;
    onViewResults: (scanId: string) => void;
    onClose: () => void;
}> = ({ scanId, vulnerabilitiesFound, hostsScanned, onViewResults, onClose }) => {
    const type = vulnerabilitiesFound > 0 ? 'warning' : 'success';

    return (
        <Toast
            type={type}
            title="Сканирование завершено"
            message={`Просканировано хостов: ${hostsScanned}`}
            description={vulnerabilitiesFound > 0
                ? `Обнаружено уязвимостей: ${vulnerabilitiesFound}`
                : 'Критических уязвимостей не обнаружено'
            }
            priority="high"
            duration={8000}
            actions={[
                {
                    label: 'Посмотреть результаты',
                    onClick: () => onViewResults(scanId),
                    variant: 'primary'
                }
            ]}
            onClose={onClose}
        />
    );
};

// Уведомление о системных событиях
export const SystemEventToast: React.FC<{
    event: 'security_alert' | 'system_update' | 'backup_complete' | 'maintenance';
    message: string;
    details?: string | undefined;
    onClose: () => void;
}> = ({ event, message, details, onClose }) => {
    const eventConfig = {
        security_alert: { type: 'error' as const, priority: 'critical' as const, icon: '🛡️' },
        system_update: { type: 'info' as const, priority: 'normal' as const, icon: '🔄' },
        backup_complete: { type: 'success' as const, priority: 'normal' as const, icon: '💾' },
        maintenance: { type: 'warning' as const, priority: 'high' as const, icon: '🔧' }
    };

    const config = eventConfig[event];

    return (
        <Toast
            type={config.type}
            title={`${config.icon} Системное уведомление`}
            message={message}
            description={details}
            priority={config.priority}
            duration={config.priority === 'critical' ? 0 : 6000}
            onClose={onClose}
        />
    );
};

export default Toast;
