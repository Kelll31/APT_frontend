// src/components/layout/Header/ThemeToggle.tsx
import React, { useState } from 'react';
import { Sun, Moon, Monitor, Palette } from 'lucide-react';
import clsx from 'clsx';
import { useTheme } from '@/hooks/useTheme';

interface ThemeOption {
    value: 'light' | 'dark' | 'auto';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
}

const themeOptions: ThemeOption[] = [
    {
        value: 'light',
        label: 'Светлая',
        icon: Sun,
        description: 'Светлая тема'
    },
    {
        value: 'dark',
        label: 'Темная',
        icon: Moon,
        description: 'Темная тема'
    },
    {
        value: 'auto',
        label: 'Авто',
        icon: Monitor,
        description: 'Следует системным настройкам'
    }
];

export const ThemeToggle: React.FC = () => {
    const { mode, isDark, setTheme, accentColor } = useTheme();
    const [isOpen, setIsOpen] = useState(false);

    const currentTheme = themeOptions.find(option => option.value === mode);
    const CurrentIcon = currentTheme?.icon || Monitor;

    return (
        <div className="relative">
            {/* Toggle Button */}
            <button
                type="button"
                className={clsx(
                    'flex items-center space-x-2 p-2 rounded-lg transition-all duration-200',
                    'hover:bg-gray-100 dark:hover:bg-gray-800',
                    'focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2',
                    'dark:focus:ring-offset-gray-900',
                    isOpen && 'bg-gray-100 dark:bg-gray-800'
                )}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Переключить тему"
                aria-expanded={isOpen}
            >
                <CurrentIcon className={clsx(
                    'w-5 h-5 transition-transform duration-200',
                    isDark ? 'text-gray-400' : 'text-gray-600',
                    isOpen && 'scale-110'
                )} />
                <span className={clsx(
                    'hidden sm:inline text-sm font-medium',
                    isDark ? 'text-gray-400' : 'text-gray-600'
                )}>
                    {currentTheme?.label}
                </span>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Menu */}
                    <div className={clsx(
                        'absolute top-full right-0 mt-2 w-56 rounded-lg shadow-xl z-20',
                        'border backdrop-blur-sm',
                        isDark
                            ? 'bg-gray-900/95 border-gray-700'
                            : 'bg-white/95 border-gray-200'
                    )}>
                        {/* Header */}
                        <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center space-x-2">
                                <Palette className="w-4 h-4 text-emerald-500" />
                                <h3 className={clsx(
                                    'font-semibold text-sm',
                                    isDark ? 'text-white' : 'text-gray-900'
                                )}>
                                    Выбор темы
                                </h3>
                            </div>
                        </div>

                        {/* Theme Options */}
                        <div className="p-2">
                            {themeOptions.map((option) => {
                                const OptionIcon = option.icon;
                                const isActive = mode === option.value;

                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        className={clsx(
                                            'w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200',
                                            'hover:bg-gray-100 dark:hover:bg-gray-800',
                                            'focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-inset',
                                            isActive && 'bg-emerald-50 dark:bg-emerald-900/30'
                                        )}
                                        onClick={() => {
                                            setTheme(option.value);
                                            setIsOpen(false);
                                        }}
                                    >
                                        <OptionIcon className={clsx(
                                            'w-5 h-5 flex-shrink-0',
                                            isActive
                                                ? 'text-emerald-600 dark:text-emerald-400'
                                                : (isDark ? 'text-gray-400' : 'text-gray-600')
                                        )} />
                                        <div className="flex-1 text-left">
                                            <div className={clsx(
                                                'text-sm font-medium',
                                                isActive
                                                    ? 'text-emerald-700 dark:text-emerald-400'
                                                    : (isDark ? 'text-white' : 'text-gray-900')
                                            )}>
                                                {option.label}
                                            </div>
                                            <div className={clsx(
                                                'text-xs',
                                                isActive
                                                    ? 'text-emerald-600 dark:text-emerald-500'
                                                    : (isDark ? 'text-gray-400' : 'text-gray-500')
                                            )}>
                                                {option.description}
                                            </div>
                                        </div>
                                        {isActive && (
                                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Footer */}
                        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                            <div className="text-xs text-center text-gray-500 dark:text-gray-400">
                                Акцент: <span className={`text-${accentColor}-500`}>{accentColor}</span>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
