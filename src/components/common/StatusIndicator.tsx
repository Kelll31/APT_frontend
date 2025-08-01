import React from 'react';

export interface StatusIndicatorProps {
    status: 'success' | 'error' | 'warning' | 'info' | 'loading' | 'idle' | 'pending';
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | undefined;
    text?: string | undefined;
    showPulse?: boolean | undefined;
    className?: string | undefined;
    textClassName?: string | undefined;
    iconOnly?: boolean | undefined;
    position?: 'left' | 'right' | 'top' | 'bottom' | undefined;
}


const StatusIndicator: React.FC<StatusIndicatorProps> = ({
    status,
    size = 'md',
    text,
    showPulse = false,
    className = '',
    textClassName = '',
    iconOnly = false,
    position = 'left'
}) => {
    // Размеры индикатора
    const sizeClasses = {
        xs: 'w-2 h-2',
        sm: 'w-3 h-3',
        md: 'w-4 h-4',
        lg: 'w-5 h-5',
        xl: 'w-6 h-6'
    };

    // Размеры текста
    const textSizeClasses = {
        xs: 'text-xs',
        sm: 'text-sm',
        md: 'text-sm',
        lg: 'text-base',
        xl: 'text-lg'
    };

    // Цвета и стили для разных статусов
    const statusConfig = {
        success: {
            bgColor: 'bg-emerald-500',
            textColor: 'text-emerald-400',
            borderColor: 'border-emerald-500/20',
            icon: '✓',
            label: 'Успешно'
        },
        error: {
            bgColor: 'bg-red-500',
            textColor: 'text-red-400',
            borderColor: 'border-red-500/20',
            icon: '✕',
            label: 'Ошибка'
        },
        warning: {
            bgColor: 'bg-yellow-500',
            textColor: 'text-yellow-400',
            borderColor: 'border-yellow-500/20',
            icon: '⚠',
            label: 'Предупреждение'
        },
        info: {
            bgColor: 'bg-blue-500',
            textColor: 'text-blue-400',
            borderColor: 'border-blue-500/20',
            icon: 'ℹ',
            label: 'Информация'
        },
        loading: {
            bgColor: 'bg-gray-500',
            textColor: 'text-gray-400',
            borderColor: 'border-gray-500/20',
            icon: '⟳',
            label: 'Загрузка'
        },
        idle: {
            bgColor: 'bg-gray-600',
            textColor: 'text-gray-500',
            borderColor: 'border-gray-600/20',
            icon: '○',
            label: 'Ожидание'
        },
        pending: {
            bgColor: 'bg-orange-500',
            textColor: 'text-orange-400',
            borderColor: 'border-orange-500/20',
            icon: '⏳',
            label: 'В обработке'
        }
    };

    const config = statusConfig[status];

    // Базовые классы для индикатора
    const indicatorClasses = [
        'relative inline-flex items-center justify-center rounded-full transition-all duration-200',
        sizeClasses[size],
        config.bgColor,
        showPulse && (status === 'loading' || status === 'pending') ? 'animate-pulse' : '',
        status === 'loading' ? 'animate-spin' : '',
        className
    ].filter(Boolean).join(' ');

    // Классы для текста
    const textClasses = [
        'font-medium transition-colors duration-200',
        textSizeClasses[size],
        config.textColor,
        textClassName
    ].filter(Boolean).join(' ');

    // Определение layout в зависимости от позиции
    const getLayoutClasses = () => {
        if (iconOnly) return 'inline-flex';

        switch (position) {
            case 'right':
                return 'inline-flex items-center gap-2 flex-row-reverse';
            case 'top':
                return 'inline-flex flex-col items-center gap-1';
            case 'bottom':
                return 'inline-flex flex-col-reverse items-center gap-1';
            default: // left
                return 'inline-flex items-center gap-2';
        }
    };

    // Рендеринг пульсирующего эффекта для активных состояний
    const renderPulseEffect = () => {
        if (!showPulse || (status !== 'loading' && status !== 'pending' && status !== 'success')) {
            return null;
        }

        return (
            <span className={`absolute inline-flex h-full w-full rounded-full ${config.bgColor} opacity-75 animate-ping`} />
        );
    };

    // Рендеринг иконки внутри индикатора
    const renderIcon = () => {
        return (
            <span className={`relative text-white text-xs font-bold leading-none ${status === 'loading' ? 'animate-spin' : ''
                }`}>
                {config.icon}
            </span>
        );
    };

    return (
        <div className={`${getLayoutClasses()}`}>
            <div className="relative">
                {renderPulseEffect()}
                <div className={indicatorClasses}>
                    {renderIcon()}
                </div>
            </div>

            {!iconOnly && (
                <span className={textClasses}>
                    {text || config.label}
                </span>
            )}
        </div>
    );
};

// Дополнительные компоненты для специфичных случаев использования

// Индикатор состояния сканирования
export const ScanStatusIndicator: React.FC<{
    isActive: boolean;
    progress?: number;
    className?: string;
}> = ({ isActive, progress, className }) => {
    if (isActive) {
        return (
            <StatusIndicator
                status="loading"
                text={`Сканирование${progress ? ` ${progress}%` : '...'}`}
                showPulse
                className={className}
            />
        );
    }

    return (
        <StatusIndicator
            status="idle"
            text="Готов к сканированию"
            className={className}
        />
    );
};

// Индикатор состояния подключения
export const ConnectionStatusIndicator: React.FC<{
    isConnected: boolean;
    isConnecting?: boolean;
    className?: string;
}> = ({ isConnected, isConnecting = false, className }) => {
    if (isConnecting) {
        return (
            <StatusIndicator
                status="loading"
                text="Подключение..."
                showPulse
                size="sm"
                className={className}
            />
        );
    }

    return (
        <StatusIndicator
            status={isConnected ? 'success' : 'error'}
            text={isConnected ? 'Подключено' : 'Отключено'}
            size="sm"
            showPulse={isConnected}
            className={className}
        />
    );
};

// Индикатор безопасности
export const SecurityStatusIndicator: React.FC<{
    level: 'low' | 'medium' | 'high' | 'critical';
    className?: string;
}> = ({ level, className }) => {
    const securityConfig = {
        low: { status: 'success' as const, text: 'Низкий уровень риска' },
        medium: { status: 'warning' as const, text: 'Средний уровень риска' },
        high: { status: 'error' as const, text: 'Высокий уровень риска' },
        critical: { status: 'error' as const, text: 'Критический уровень риска' }
    };

    const config = securityConfig[level];

    return (
        <StatusIndicator
            status={config.status}
            text={config.text}
            showPulse={level === 'critical'}
            className={className}
        />
    );
};

// Компонент-группа для множественных индикаторов
export const StatusIndicatorGroup: React.FC<{
    indicators: Array<{
        id: string;
        status: StatusIndicatorProps['status'];
        text?: string;
        size?: StatusIndicatorProps['size'];
    }>;
    orientation?: 'horizontal' | 'vertical';
    spacing?: 'tight' | 'normal' | 'relaxed';
    className?: string;
}> = ({ indicators, orientation = 'horizontal', spacing = 'normal', className }) => {
    const spacingClasses = {
        tight: 'gap-1',
        normal: 'gap-2',
        relaxed: 'gap-4'
    };

    const orientationClass = orientation === 'vertical' ? 'flex-col' : 'flex-row';

    return (
        <div className={`inline-flex ${orientationClass} ${spacingClasses[spacing]} ${className}`}>
            {indicators.map((indicator) => (
                <StatusIndicator
                    key={indicator.id}
                    status={indicator.status}
                    text={indicator.text}
                    size={indicator.size}
                />
            ))}
        </div>
    );
};

export default StatusIndicator;
