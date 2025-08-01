import React, { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string | undefined;
    subtitle?: string | undefined;
    children: React.ReactNode;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full' | undefined;
    showHeader?: boolean | undefined;
    showCloseButton?: boolean | undefined;
    showOverlay?: boolean | undefined;
    closeOnOverlayClick?: boolean | undefined;
    closeOnEscape?: boolean | undefined;
    preventBodyScroll?: boolean | undefined;
    className?: string | undefined;
    overlayClassName?: string | undefined;
    headerClassName?: string | undefined;
    bodyClassName?: string | undefined;
    footerClassName?: string | undefined;
    zIndex?: number | undefined;
    animationType?: 'fade' | 'scale' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | undefined;
    footer?: React.ReactNode | undefined;
    icon?: React.ReactNode | undefined;
    loading?: boolean | undefined;
    error?: string | undefined;
    onAfterOpen?: (() => void) | undefined;
    onAfterClose?: (() => void) | undefined;
}

const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    subtitle,
    children,
    size = 'md',
    showHeader = true,
    showCloseButton = true,
    showOverlay = true,
    closeOnOverlayClick = true,
    closeOnEscape = true,
    preventBodyScroll = true,
    className = '',
    overlayClassName = '',
    headerClassName = '',
    bodyClassName = '',
    footerClassName = '',
    zIndex = 9999,
    animationType = 'scale',
    footer,
    icon,
    loading = false,
    error,
    onAfterOpen,
    onAfterClose
}) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const previousActiveElement = useRef<HTMLElement | null>(null);
    const isAnimating = useRef(false);

    // Размеры модального окна
    const sizeClasses = {
        xs: 'max-w-xs',
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        full: 'max-w-none w-full h-full m-0 rounded-none'
    };

    // Анимации входа/выхода
    const animationClasses = {
        fade: {
            enter: 'animate-fadeIn',
            exit: 'animate-fadeOut'
        },
        scale: {
            enter: 'animate-scaleIn',
            exit: 'animate-scaleOut'
        },
        'slide-up': {
            enter: 'animate-slideInUp',
            exit: 'animate-slideOutDown'
        },
        'slide-down': {
            enter: 'animate-slideInDown',
            exit: 'animate-slideOutUp'
        },
        'slide-left': {
            enter: 'animate-slideInLeft',
            exit: 'animate-slideOutLeft'
        },
        'slide-right': {
            enter: 'animate-slideInRight',
            exit: 'animate-slideOutRight'
        }
    };

    // Управление прокруткой body
    useEffect(() => {
        if (isOpen && preventBodyScroll) {
            const originalStyle = window.getComputedStyle(document.body).overflow;
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = originalStyle;
            };
        }
        return undefined;
    }, [isOpen, preventBodyScroll]);

    // Управление фокусом
    useEffect(() => {
        if (isOpen) {
            previousActiveElement.current = document.activeElement as HTMLElement;

            const timer = setTimeout(() => {
                if (modalRef.current) {
                    modalRef.current.focus();
                    onAfterOpen?.();
                }
            }, 100);

            return () => clearTimeout(timer);
        } else if (previousActiveElement.current) {
            const timer = setTimeout(() => {
                previousActiveElement.current?.focus();
                onAfterClose?.();
            }, 100);

            return () => clearTimeout(timer);
        }
        return undefined;
    }, [isOpen, onAfterOpen, onAfterClose]);

    // Обработчик клавиши Escape
    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        if (event.key === 'Escape' && closeOnEscape && !isAnimating.current) {
            onClose();
        }

        // Trap focus внутри модального окна
        if (event.key === 'Tab' && modalRef.current) {
            const focusableElements = modalRef.current.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            const firstElement = focusableElements[0] as HTMLElement;
            const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

            if (event.shiftKey && document.activeElement === firstElement) {
                lastElement?.focus();
                event.preventDefault();
            } else if (!event.shiftKey && document.activeElement === lastElement) {
                firstElement?.focus();
                event.preventDefault();
            }
        }
    }, [closeOnEscape, onClose]);

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }
        return undefined;
    }, [isOpen, handleKeyDown]);

    // Обработчик клика по оверлею
    const handleOverlayClick = useCallback((event: React.MouseEvent) => {
        if (event.target === event.currentTarget && closeOnOverlayClick && !isAnimating.current) {
            onClose();
        }
    }, [closeOnOverlayClick, onClose]);

    // Обработчик закрытия с анимацией
    const handleClose = useCallback(() => {
        if (!isAnimating.current) {
            isAnimating.current = true;
            onClose();

            // Сброс флага анимации
            setTimeout(() => {
                isAnimating.current = false;
            }, 300);
        }
    }, [onClose]);

    // Рендеринг иконки статуса
    const renderStatusIcon = () => {
        if (loading) {
            return (
                <div className="animate-spin w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full" />
            );
        }

        if (error) {
            return (
                <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✕</span>
                </div>
            );
        }

        return icon;
    };

    // Рендеринг заголовка
    const renderHeader = () => {
        if (!showHeader && !title && !subtitle) return null;

        return (
            <div className={`
        flex items-start justify-between p-6 border-b border-gray-700 bg-gray-800/50
        ${headerClassName}
      `}>
                <div className="flex items-start gap-3 flex-1 min-w-0">
                    {(icon || loading || error) && (
                        <div className="flex-shrink-0 mt-0.5">
                            {renderStatusIcon()}
                        </div>
                    )}

                    <div className="flex-1 min-w-0">
                        {title && (
                            <h2 className="text-lg font-semibold text-white truncate">
                                {title}
                            </h2>
                        )}
                        {subtitle && (
                            <p className="text-sm text-gray-400 mt-1">
                                {subtitle}
                            </p>
                        )}
                        {error && (
                            <div className="mt-2 p-3 bg-red-900/20 border border-red-700 rounded-lg">
                                <p className="text-red-400 text-sm">{error}</p>
                            </div>
                        )}
                    </div>
                </div>

                {showCloseButton && (
                    <button
                        onClick={handleClose}
                        className="flex-shrink-0 ml-4 p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        aria-label="Закрыть модальное окно"
                        type="button"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>
        );
    };

    // Рендеринг контента
    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-center p-8">
                    <div className="flex items-center gap-3 text-gray-400">
                        <div className="animate-spin w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full" />
                        <span>Загрузка...</span>
                    </div>
                </div>
            );
        }

        return (
            <div className={`p-6 max-h-96 overflow-y-auto ${bodyClassName}`}>
                {children}
            </div>
        );
    };

    // Рендеринг футера
    const renderFooter = () => {
        if (!footer) return null;

        return (
            <div className={`
        px-6 py-4 border-t border-gray-700 bg-gray-800/30
        ${footerClassName}
      `}>
                {footer}
            </div>
        );
    };

    if (!isOpen) return null;

    const modalContent = (
        <div
            className={`
        fixed inset-0 z-[${zIndex}] flex items-center justify-center p-4
        ${showOverlay ? 'bg-black/80 backdrop-blur-sm' : ''}
        ${animationClasses[animationType].enter}
        ${overlayClassName}
      `}
            onClick={handleOverlayClick}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'modal-title' : undefined}
            aria-describedby={subtitle ? 'modal-subtitle' : undefined}
        >
            <div
                ref={modalRef}
                className={`
          relative w-full ${sizeClasses[size]} bg-gray-900 border border-gray-700 rounded-xl shadow-2xl
          ${size !== 'full' ? 'my-8' : ''}
          focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-gray-900
          ${className}
        `}
                tabIndex={-1}
                onClick={(e) => e.stopPropagation()}
            >
                {renderHeader()}
                {renderContent()}
                {renderFooter()}

                {/* Индикатор загрузки поверх контента */}
                {loading && (
                    <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm rounded-xl flex items-center justify-center">
                        <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
                            <div className="flex items-center gap-3 text-white">
                                <div className="animate-spin w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full" />
                                <span className="text-sm">Обработка...</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    // Использование портала для рендеринга в body
    return createPortal(modalContent, document.body);
};

// Дополнительные компоненты для специфичных случаев

// Модальное окно подтверждения
export const ConfirmModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string | undefined;
    message?: string | undefined;
    confirmText?: string | undefined;
    cancelText?: string | undefined;
    variant?: 'danger' | 'warning' | 'info' | undefined;
    loading?: boolean | undefined;
}> = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Подтверждение',
    message = 'Вы уверены что хотите продолжить?',
    confirmText = 'Подтвердить',
    cancelText = 'Отмена',
    variant = 'info',
    loading = false
}) => {
        const variantConfig = {
            danger: {
                icon: '⚠️',
                confirmClass: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
                iconClass: 'text-red-400'
            },
            warning: {
                icon: '⚠️',
                confirmClass: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
                iconClass: 'text-yellow-400'
            },
            info: {
                icon: 'ℹ️',
                confirmClass: 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500',
                iconClass: 'text-blue-400'
            }
        };

        const config = variantConfig[variant];

        return (
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                title={title}
                size="sm"
                loading={loading}
                footer={
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="px-4 py-2 text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={loading}
                            className={`
              px-4 py-2 text-white rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50
              ${config.confirmClass}
            `}
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Обработка...
                                </div>
                            ) : (
                                confirmText
                            )}
                        </button>
                    </div>
                }
            >
                <div className="flex items-start gap-4">
                    <div className={`text-2xl ${config.iconClass}`}>
                        {config.icon}
                    </div>
                    <p className="text-gray-300 leading-relaxed">
                        {message}
                    </p>
                </div>
            </Modal>
        );
    };

// Модальное окно формы
export const FormModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
    title?: string | undefined;
    children: React.ReactNode;
    submitText?: string | undefined;
    cancelText?: string | undefined;
    loading?: boolean | undefined;
    error?: string | undefined;
    size?: ModalProps['size'];
}> = ({
    isOpen,
    onClose,
    onSubmit,
    title,
    children,
    submitText = 'Сохранить',
    cancelText = 'Отмена',
    loading = false,
    error,
    size = 'lg'
}) => {
        const handleSubmit = (event: React.FormEvent) => {
            event.preventDefault();
            const formData = new FormData(event.target as HTMLFormElement);
            const data = Object.fromEntries(formData.entries());
            onSubmit(data);
        };

        return (
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                title={title}
                size={size}
                loading={loading}
                error={error}
                footer={
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-4 py-2 text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
                        >
                            {cancelText}
                        </button>
                        <button
                            type="submit"
                            form="modal-form"
                            disabled={loading}
                            className="px-4 py-2 text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Сохранение...
                                </div>
                            ) : (
                                submitText
                            )}
                        </button>
                    </div>
                }
            >
                <form id="modal-form" onSubmit={handleSubmit} className="space-y-4">
                    {children}
                </form>
            </Modal>
        );
    };

// Экспорт дополнительных CSS классов для анимаций (добавить в globals.css)
export const modalAnimations = `
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes scaleOut {
  from { opacity: 1; transform: scale(1); }
  to { opacity: 0; transform: scale(0.95); }
}

@keyframes slideInUp {
  from { opacity: 0; transform: translateY(100%); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideOutDown {
  from { opacity: 1; transform: translateY(0); }
  to { opacity: 0; transform: translateY(100%); }
}

@keyframes slideInDown {
  from { opacity: 0; transform: translateY(-100%); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideOutUp {
  from { opacity: 1; transform: translateY(0); }
  to { opacity: 0; transform: translateY(-100%); }
}

@keyframes slideInLeft {
  from { opacity: 0; transform: translateX(-100%); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes slideOutLeft {
  from { opacity: 1; transform: translateX(0); }
  to { opacity: 0; transform: translateX(-100%); }
}

@keyframes slideInRight {
  from { opacity: 0; transform: translateX(100%); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes slideOutRight {
  from { opacity: 1; transform: translateX(0); }
  to { opacity: 0; transform: translateX(100%); }
}

.animate-fadeIn { animation: fadeIn 0.2s ease-out; }
.animate-fadeOut { animation: fadeOut 0.2s ease-in; }
.animate-scaleIn { animation: scaleIn 0.2s ease-out; }
.animate-scaleOut { animation: scaleOut 0.2s ease-in; }
.animate-slideInUp { animation: slideInUp 0.3s ease-out; }
.animate-slideOutDown { animation: slideOutDown 0.3s ease-in; }
.animate-slideInDown { animation: slideInDown 0.3s ease-out; }
.animate-slideOutUp { animation: slideOutUp 0.3s ease-in; }
.animate-slideInLeft { animation: slideInLeft 0.3s ease-out; }
.animate-slideOutLeft { animation: slideOutLeft 0.3s ease-in; }
.animate-slideInRight { animation: slideInRight 0.3s ease-out; }
.animate-slideOutRight { animation: slideOutRight 0.3s ease-in; }
`;

export default Modal;
