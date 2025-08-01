// src/stores/themeStore.tsx

/**
 * IP Roast Enterprise - Theme Store v3.0
 * Centralized state management для системы тем и оформления
 * Построен на React + Zustand
 */

import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { persist, createJSONStorage } from 'zustand/middleware';

// ===== ТИПЫ ДАННЫХ ДЛЯ ТЕМ =====

export type ThemeMode = 'light' | 'dark' | 'auto';
export type AccentColor = 'blue' | 'green' | 'red' | 'purple' | 'orange' | 'teal';
export type UISize = 'compact' | 'medium' | 'large';
export type Language = 'ru' | 'en' | 'es' | 'fr' | 'de' | 'zh' | 'ja';
export type TextDirection = 'ltr' | 'rtl';
export type AnimationLevel = 'none' | 'reduced' | 'normal' | 'enhanced';

// Цветовая схема
export interface ColorScheme {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    info: string;
    background: string;
    surface: string;
    surfaceVariant: string;
    outline: string;
    outlineVariant: string;
    textPrimary: string;
    textSecondary: string;
    textDisabled: string;
    textOnPrimary: string;
    textOnSecondary: string;
    textOnSuccess: string;
    textOnWarning: string;
    textOnError: string;
    textOnInfo: string;
    shadow: string;
    scrim: string;
    inverseSurface: string;
    inverseOnSurface: string;
    inversePrimary: string;
}

// Типографика
export interface Typography {
    fontFamily: string;
    fontFamilyMono: string;
    fontSize: {
        xs: string;
        sm: string;
        base: string;
        lg: string;
        xl: string;
        '2xl': string;
        '3xl': string;
        '4xl': string;
        '5xl': string;
        '6xl': string;
    };
    fontWeight: {
        thin: number;
        light: number;
        normal: number;
        medium: number;
        semibold: number;
        bold: number;
        extrabold: number;
        black: number;
    };
    lineHeight: {
        none: number;
        tight: number;
        snug: number;
        normal: number;
        relaxed: number;
        loose: number;
    };
    letterSpacing: {
        tighter: string;
        tight: string;
        normal: string;
        wide: string;
        wider: string;
        widest: string;
    };
}

// Настройки доступности
export interface AccessibilitySettings {
    highContrast: boolean;
    reducedMotion: boolean;
    largeText: boolean;
    screenReaderMode: boolean;
    enhancedFocus: boolean;
    colorBlindFriendly: boolean;
    keyboardNavigation: boolean;
    automaticDescriptions: boolean;
    audioFeedback: boolean;
    hapticFeedback: boolean;
}

// Настройки анимации
export interface AnimationSettings {
    level: AnimationLevel;
    duration: {
        fast: number;
        normal: number;
        slow: number;
    };
    easing: {
        linear: string;
        ease: string;
        easeIn: string;
        easeOut: string;
        easeInOut: string;
        elastic: string;
        bounce: string;
    };
    enabledTypes: {
        transitions: boolean;
        transforms: boolean;
        opacity: boolean;
        scale: boolean;
        slide: boolean;
        fade: boolean;
        bounce: boolean;
        elastic: boolean;
    };
    effects: {
        parallax: boolean;
        blur: boolean;
        glow: boolean;
        particles: boolean;
    };
}

// Настройки локализации
export interface LocalizationSettings {
    language: Language;
    direction: TextDirection;
    locale: string;
    timezone: string;
    dateFormat: string;
    timeFormat: '12h' | '24h';
    numberFormat: string;
    currency: string;
    translationOverrides: Record<string, any>;
}

// Кастомная тема
export interface CustomTheme {
    id: string;
    name: string;
    description?: string;
    author?: string;
    version: string;
    baseTheme: ThemeMode;
    colors: ColorScheme;
    typography?: Partial<Typography>;
    cssVariables: Record<string, string>;
    customCSS?: string;
    tags: string[];
    featured: boolean;
    builtin: boolean;
    created_at: string;
    updated_at: string;
    preview?: {
        screenshot?: string;
        thumbnail?: string;
        colors: string[];
    };
}

// Основной интерфейс темы
export interface ThemeState {
    // Основные настройки
    mode: ThemeMode;
    accentColor: AccentColor;
    uiSize: UISize;
    fontSize: number;
    lineHeight: number;
    borderRadius: number;

    // Кастомные темы
    customThemes: Map<string, CustomTheme>;
    activeCustomTheme: string | null;

    // Настройки
    accessibility: AccessibilitySettings;
    animations: AnimationSettings;
    localization: LocalizationSettings;

    // Пользовательские данные
    userVariables: Record<string, string>;
    customCSS: string;

    // Системные настройки
    systemPreferences: {
        prefersColorScheme: 'light' | 'dark' | null;
        prefersReducedMotion: boolean;
        prefersHighContrast: boolean;
        prefersReducedTransparency: boolean;
    };

    // Временное состояние
    isTransitioning: boolean;
    previewMode: boolean;
    lastThemeChange: string;
}

// Действия для управления темой
export interface ThemeActions {
    // Основные действия
    setTheme: (mode: ThemeMode) => void;
    setAccentColor: (color: AccentColor) => void;
    setUISize: (size: UISize) => void;
    setFontSize: (size: number) => void;
    toggleTheme: () => void;

    // Кастомные темы
    createCustomTheme: (theme: Omit<CustomTheme, 'id' | 'created_at' | 'updated_at'>) => string;
    applyCustomTheme: (themeId: string) => void;
    deleteCustomTheme: (themeId: string) => void;

    // Настройки
    updateAccessibility: (settings: Partial<AccessibilitySettings>) => void;
    updateAnimations: (settings: Partial<AnimationSettings>) => void;
    updateLocalization: (settings: Partial<LocalizationSettings>) => void;

    // Пользовательские данные
    setUserVariables: (variables: Record<string, string>) => void;
    setCustomCSS: (css: string) => void;

    // Режим предпросмотра
    enablePreviewMode: () => void;
    disablePreviewMode: () => void;

    // Утилиты
    resetToDefaults: () => void;
    applyTheme: () => void;
    initializeSystemPreferences: () => void;
}

// Объединенный интерфейс хранилища
export type ThemeStore = ThemeState & ThemeActions;

// ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====

// Генерация ID темы
const generateThemeId = (): string => {
    return `theme_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Получение встроенной цветовой схемы
const getBuiltinColorScheme = (theme: 'light' | 'dark', accent: AccentColor): ColorScheme => {
    const accentColors = {
        blue: '#2563eb',
        green: '#16a34a',
        red: '#dc2626',
        purple: '#9333ea',
        orange: '#ea580c',
        teal: '#0891b2'
    };

    const baseColors = {
        light: {
            primary: accentColors[accent],
            secondary: '#6b7280',
            success: '#16a34a',
            warning: '#ea580c',
            error: '#dc2626',
            info: '#0891b2',
            background: '#ffffff',
            surface: '#f8fafc',
            surfaceVariant: '#f1f5f9',
            outline: '#e2e8f0',
            outlineVariant: '#cbd5e1',
            textPrimary: '#1f2937',
            textSecondary: '#6b7280',
            textDisabled: '#9ca3af',
            textOnPrimary: '#ffffff',
            textOnSecondary: '#ffffff',
            textOnSuccess: '#ffffff',
            textOnWarning: '#ffffff',
            textOnError: '#ffffff',
            textOnInfo: '#ffffff',
            shadow: 'rgba(0, 0, 0, 0.1)',
            scrim: 'rgba(0, 0, 0, 0.5)',
            inverseSurface: '#374151',
            inverseOnSurface: '#f9fafb',
            inversePrimary: '#93c5fd'
        },
        dark: {
            primary: accentColors[accent],
            secondary: '#9ca3af',
            success: '#22c55e',
            warning: '#f59e0b',
            error: '#ef4444',
            info: '#06b6d4',
            background: '#111827',
            surface: '#1f2937',
            surfaceVariant: '#374151',
            outline: '#4b5563',
            outlineVariant: '#6b7280',
            textPrimary: '#f9fafb',
            textSecondary: '#d1d5db',
            textDisabled: '#9ca3af',
            textOnPrimary: '#ffffff',
            textOnSecondary: '#000000',
            textOnSuccess: '#000000',
            textOnWarning: '#000000',
            textOnError: '#ffffff',
            textOnInfo: '#000000',
            shadow: 'rgba(0, 0, 0, 0.3)',
            scrim: 'rgba(0, 0, 0, 0.7)',
            inverseSurface: '#e5e7eb',
            inverseOnSurface: '#374151',
            inversePrimary: '#1e40af'
        }
    };

    return baseColors[theme];
};

// Начальное состояние
const initialState: ThemeState = {
    mode: 'dark',
    accentColor: 'blue',
    uiSize: 'medium',
    fontSize: 14,
    lineHeight: 1.5,
    borderRadius: 6,

    customThemes: new Map(),
    activeCustomTheme: null,

    accessibility: {
        highContrast: false,
        reducedMotion: false,
        largeText: false,
        screenReaderMode: false,
        enhancedFocus: false,
        colorBlindFriendly: false,
        keyboardNavigation: true,
        automaticDescriptions: false,
        audioFeedback: false,
        hapticFeedback: false
    },

    animations: {
        level: 'normal',
        duration: {
            fast: 150,
            normal: 300,
            slow: 500
        },
        easing: {
            linear: 'linear',
            ease: 'ease',
            easeIn: 'ease-in',
            easeOut: 'ease-out',
            easeInOut: 'ease-in-out',
            elastic: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
            bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
        },
        enabledTypes: {
            transitions: true,
            transforms: true,
            opacity: true,
            scale: true,
            slide: true,
            fade: true,
            bounce: false,
            elastic: false
        },
        effects: {
            parallax: false,
            blur: false,
            glow: false,
            particles: false
        }
    },

    localization: {
        language: 'ru',
        direction: 'ltr',
        locale: 'ru-RU',
        timezone: 'Europe/Moscow',
        dateFormat: 'DD.MM.YYYY',
        timeFormat: '24h',
        numberFormat: 'ru-RU',
        currency: 'RUB',
        translationOverrides: {}
    },

    userVariables: {},
    customCSS: '',

    systemPreferences: {
        prefersColorScheme: null,
        prefersReducedMotion: false,
        prefersHighContrast: false,
        prefersReducedTransparency: false
    },

    isTransitioning: false,
    previewMode: false,
    lastThemeChange: new Date().toISOString()
};

// ===== ZUSTAND ХРАНИЛИЩЕ =====

export const useThemeStore = create<ThemeStore>()(
    persist(
        subscribeWithSelector((set, get) => ({
            ...initialState,

            // Основные действия
            setTheme: (mode: ThemeMode) => {
                set(() => ({
                    mode,
                    lastThemeChange: new Date().toISOString()
                }));
                get().applyTheme();
            },

            setAccentColor: (accentColor: AccentColor) => {
                set(() => ({
                    accentColor,
                    lastThemeChange: new Date().toISOString()
                }));
                get().applyTheme();
            },

            setUISize: (uiSize: UISize) => {
                set(() => ({
                    uiSize,
                    lastThemeChange: new Date().toISOString()
                }));
                get().applyTheme();
            },

            setFontSize: (fontSize: number) => {
                if (fontSize < 8 || fontSize > 32) {
                    console.warn('⚠️ Недопустимый размер шрифта:', fontSize);
                    return;
                }

                set(() => ({
                    fontSize,
                    lastThemeChange: new Date().toISOString()
                }));
                get().applyTheme();
            },

            toggleTheme: () => {
                const { mode } = get();
                const themes: ThemeMode[] = ['light', 'dark'];

                if (mode === 'auto') {
                    get().setTheme('light');
                } else {
                    const currentIndex = themes.indexOf(mode as 'light' | 'dark');
                    const nextIndex = (currentIndex + 1) % themes.length;
                    const nextTheme = themes[nextIndex];

                    // Безопасная проверка на undefined
                    if (nextTheme) {
                        get().setTheme(nextTheme);
                    } else {
                        get().setTheme('light'); // Fallback
                    }
                }
            },

            // Кастомные темы
            createCustomTheme: (themeData: Omit<CustomTheme, 'id' | 'created_at' | 'updated_at'>) => {
                const id = generateThemeId();
                const now = new Date().toISOString();
                const customTheme: CustomTheme = {
                    id,
                    created_at: now,
                    updated_at: now,
                    ...themeData
                };

                set((state) => {
                    const newCustomThemes = new Map(state.customThemes);
                    newCustomThemes.set(id, customTheme);
                    return { customThemes: newCustomThemes };
                });

                return id;
            },

            applyCustomTheme: (themeId: string) => {
                const { customThemes } = get();
                const theme = customThemes.get(themeId);

                if (!theme) {
                    console.error(`❌ Кастомная тема не найдена: ${themeId}`);
                    return;
                }

                set(() => ({
                    activeCustomTheme: themeId,
                    mode: theme.baseTheme,
                    lastThemeChange: new Date().toISOString()
                }));
                get().applyTheme();
            },

            deleteCustomTheme: (themeId: string) => {
                const { customThemes, activeCustomTheme } = get();
                const theme = customThemes.get(themeId);

                if (!theme) {
                    console.error(`❌ Кастомная тема не найдена: ${themeId}`);
                    return;
                }

                if (theme.builtin) {
                    console.error(`❌ Нельзя удалить встроенную тему: ${themeId}`);
                    return;
                }

                set((state) => {
                    const newCustomThemes = new Map(state.customThemes);
                    newCustomThemes.delete(themeId);
                    return {
                        customThemes: newCustomThemes,
                        activeCustomTheme: activeCustomTheme === themeId ? null : activeCustomTheme
                    };
                });

                if (activeCustomTheme === themeId) {
                    get().applyTheme();
                }
            },

            // Настройки
            updateAccessibility: (settings: Partial<AccessibilitySettings>) => {
                set((state) => ({
                    accessibility: { ...state.accessibility, ...settings },
                    lastThemeChange: new Date().toISOString()
                }));
                get().applyTheme();
            },

            updateAnimations: (settings: Partial<AnimationSettings>) => {
                set((state) => ({
                    animations: { ...state.animations, ...settings },
                    lastThemeChange: new Date().toISOString()
                }));
                get().applyTheme();
            },

            updateLocalization: (settings: Partial<LocalizationSettings>) => {
                set((state) => ({
                    localization: { ...state.localization, ...settings },
                    lastThemeChange: new Date().toISOString()
                }));
                get().applyTheme();
            },

            // Пользовательские данные
            setUserVariables: (variables: Record<string, string>) => {
                set((state) => ({
                    userVariables: { ...state.userVariables, ...variables },
                    lastThemeChange: new Date().toISOString()
                }));
                get().applyTheme();
            },

            setCustomCSS: (customCSS: string) => {
                set(() => ({
                    customCSS,
                    lastThemeChange: new Date().toISOString()
                }));
                get().applyTheme();
            },

            // Режим предпросмотра
            enablePreviewMode: () => {
                set({ previewMode: true });
                get().applyTheme();
            },

            disablePreviewMode: () => {
                set({ previewMode: false });
                get().applyTheme();
            },

            // Утилиты
            resetToDefaults: () => {
                set({
                    ...initialState,
                    lastThemeChange: new Date().toISOString()
                });
                get().applyTheme();
            },

            applyTheme: () => {
                if (typeof document === 'undefined') return;

                const state = get();
                const { mode, accentColor, uiSize, accessibility, animations, localization, customThemes, activeCustomTheme } = state;

                // Определяем эффективную тему
                let effectiveTheme = mode;
                if (mode === 'auto') {
                    effectiveTheme = state.systemPreferences.prefersColorScheme || 'light';
                }

                // Получаем цветовую схему
                let colorScheme: ColorScheme;
                if (activeCustomTheme) {
                    const customTheme = customThemes.get(activeCustomTheme);
                    colorScheme = customTheme?.colors || getBuiltinColorScheme(effectiveTheme as 'light' | 'dark', accentColor);
                } else {
                    colorScheme = getBuiltinColorScheme(effectiveTheme as 'light' | 'dark', accentColor);
                }

                const root = document.documentElement;
                const body = document.body;

                // Устанавливаем data-атрибуты
                root.setAttribute('data-theme', effectiveTheme);
                root.setAttribute('data-accent', accentColor);
                root.setAttribute('data-size', uiSize);
                root.setAttribute('data-direction', localization.direction);

                // Применяем классы
                const themeClasses = [
                    `theme-${effectiveTheme}`,
                    `accent-${accentColor}`,
                    `size-${uiSize}`,
                    `lang-${localization.language}`,
                    `dir-${localization.direction}`
                ];

                if (accessibility.highContrast) themeClasses.push('high-contrast');
                if (accessibility.reducedMotion) themeClasses.push('reduced-motion');
                if (accessibility.largeText) themeClasses.push('large-text');
                if (accessibility.screenReaderMode) themeClasses.push('screen-reader');
                if (accessibility.enhancedFocus) themeClasses.push('enhanced-focus');
                if (accessibility.colorBlindFriendly) themeClasses.push('color-blind-friendly');
                if (state.isTransitioning) themeClasses.push('theme-transitioning');
                if (state.previewMode) themeClasses.push('theme-preview');

                // Очищаем старые классы и добавляем новые
                body.className = body.className.replace(/theme-\w+|accent-\w+|size-\w+|lang-\w+|dir-\w+|high-contrast|reduced-motion|large-text|screen-reader|enhanced-focus|color-blind-friendly|theme-transitioning|theme-preview/g, '');
                themeClasses.forEach(cls => body.classList.add(cls));

                // Применяем CSS переменные
                const cssVariables: Record<string, string> = {};

                // Цветовая схема
                Object.entries(colorScheme).forEach(([key, value]) => {
                    const cssKey = `--theme-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
                    cssVariables[cssKey] = value;
                });

                // Размеры
                const sizeMultipliers = { compact: 0.875, medium: 1, large: 1.125 };
                const multiplier = sizeMultipliers[uiSize];

                cssVariables['--theme-font-size'] = `${state.fontSize}px`;
                cssVariables['--theme-line-height'] = state.lineHeight.toString();
                cssVariables['--theme-border-radius'] = `${state.borderRadius}px`;
                cssVariables['--theme-size-multiplier'] = multiplier.toString();

                // Анимации
                if (accessibility.reducedMotion) {
                    cssVariables['--theme-animation-duration'] = '0ms';
                    cssVariables['--theme-transition-duration'] = '0ms';
                } else {
                    cssVariables['--theme-animation-duration-fast'] = `${animations.duration.fast}ms`;
                    cssVariables['--theme-animation-duration-normal'] = `${animations.duration.normal}ms`;
                    cssVariables['--theme-animation-duration-slow'] = `${animations.duration.slow}ms`;
                }

                // Easing функции
                Object.entries(animations.easing).forEach(([key, value]) => {
                    cssVariables[`--theme-easing-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`] = value;
                });

                // Пользовательские переменные
                Object.entries(state.userVariables).forEach(([key, value]) => {
                    if (key.startsWith('--')) {
                        cssVariables[key] = value;
                    } else {
                        cssVariables[`--user-${key}`] = value;
                    }
                });

                // Применяем переменные
                Object.entries(cssVariables).forEach(([property, value]) => {
                    root.style.setProperty(property, value);
                });

                // Применяем кастомный CSS
                let styleElement = document.getElementById('ip-roast-custom-theme-css');
                if (!styleElement) {
                    styleElement = document.createElement('style');
                    styleElement.id = 'ip-roast-custom-theme-css';
                    document.head.appendChild(styleElement);
                }

                let css = state.customCSS;
                if (activeCustomTheme) {
                    const theme = customThemes.get(activeCustomTheme);
                    if (theme?.customCSS) {
                        css += '\n' + theme.customCSS;
                    }
                }
                styleElement.textContent = css;

                // Переходная анимация
                set({ isTransitioning: true });
                setTimeout(() => {
                    set({ isTransitioning: false });
                }, animations.duration.normal);
            },

            initializeSystemPreferences: () => {
                if (typeof window === 'undefined') return;

                // Цветовая схема
                const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
                const prefersColorScheme = colorSchemeQuery.matches ? 'dark' : 'light';

                // Уменьшенная анимация
                const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
                const prefersReducedMotion = motionQuery.matches;

                // Высокий контраст
                const contrastQuery = window.matchMedia('(prefers-contrast: high)');
                const prefersHighContrast = contrastQuery.matches;

                set(() => ({
                    systemPreferences: {
                        prefersColorScheme,
                        prefersReducedMotion,
                        prefersHighContrast,
                        prefersReducedTransparency: false
                    }
                }));

                // Слушатели изменений
                colorSchemeQuery.addEventListener('change', (e) => {
                    set((state) => ({
                        systemPreferences: {
                            ...state.systemPreferences,
                            prefersColorScheme: e.matches ? 'dark' : 'light'
                        }
                    }));
                    if (get().mode === 'auto') {
                        get().applyTheme();
                    }
                });

                motionQuery.addEventListener('change', (e) => {
                    set((state) => ({
                        systemPreferences: {
                            ...state.systemPreferences,
                            prefersReducedMotion: e.matches
                        }
                    }));
                    if (!get().accessibility.reducedMotion) {
                        get().updateAccessibility({ reducedMotion: e.matches });
                    }
                });

                contrastQuery.addEventListener('change', (e) => {
                    set((state) => ({
                        systemPreferences: {
                            ...state.systemPreferences,
                            prefersHighContrast: e.matches
                        }
                    }));
                    if (!get().accessibility.highContrast) {
                        get().updateAccessibility({ highContrast: e.matches });
                    }
                });
            }
        })),
        {
            name: 'ip-roast-theme-store',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                mode: state.mode,
                accentColor: state.accentColor,
                uiSize: state.uiSize,
                fontSize: state.fontSize,
                lineHeight: state.lineHeight,
                borderRadius: state.borderRadius,
                accessibility: state.accessibility,
                animations: state.animations,
                localization: state.localization,
                userVariables: state.userVariables,
                customCSS: state.customCSS,
                activeCustomTheme: state.activeCustomTheme,
                customThemes: Array.from(state.customThemes.entries())
            }),
            onRehydrateStorage: () => (state) => {
                if (state?.customThemes) {
                    // Восстанавливаем Map из массива
                    state.customThemes = new Map(state.customThemes as any);
                }
            }
        }
    )
);

// ===== REACT CONTEXT И PROVIDER =====

export interface ThemeContextType {
    theme: ThemeStore;
    effectiveTheme: 'light' | 'dark';
    currentColorScheme: ColorScheme;
    cssVariables: Record<string, string>;
    themeClasses: string[];
    availableThemes: Array<{ id: string; name: string; description: string; custom?: boolean }>;
    availableAccents: Array<{ id: AccentColor; name: string; color: string }>;
    accessibilityScore: number;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export interface ThemeProviderProps {
    children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    const theme = useThemeStore();

    // Инициализация при монтировании
    useEffect(() => {
        theme.initializeSystemPreferences();
        theme.applyTheme();
    }, []);

    // Вычисляемые значения
    const effectiveTheme = theme.mode === 'auto'
        ? theme.systemPreferences.prefersColorScheme || 'light'
        : theme.mode as 'light' | 'dark';

    const currentColorScheme = theme.activeCustomTheme
        ? theme.customThemes.get(theme.activeCustomTheme)?.colors || getBuiltinColorScheme(effectiveTheme, theme.accentColor)
        : getBuiltinColorScheme(effectiveTheme, theme.accentColor);

    const cssVariables: Record<string, string> = {};
    Object.entries(currentColorScheme).forEach(([key, value]) => {
        const cssKey = `--theme-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
        cssVariables[cssKey] = value;
    });

    const themeClasses = [
        `theme-${effectiveTheme}`,
        `accent-${theme.accentColor}`,
        `size-${theme.uiSize}`,
        `lang-${theme.localization.language}`,
        `dir-${theme.localization.direction}`
    ];

    const availableThemes = [
        { id: 'light', name: 'Светлая', description: 'Классическая светлая тема' },
        { id: 'dark', name: 'Темная', description: 'Современная темная тема' },
        { id: 'auto', name: 'Автоматическая', description: 'Следует системным настройкам' },
        ...Array.from(theme.customThemes.values()).map(customTheme => ({
            id: customTheme.id,
            name: customTheme.name,
            description: customTheme.description || '',
            custom: true
        }))
    ];

    const availableAccents = [
        { id: 'blue' as AccentColor, name: 'Синий', color: '#2563eb' },
        { id: 'green' as AccentColor, name: 'Зеленый', color: '#16a34a' },
        { id: 'red' as AccentColor, name: 'Красный', color: '#dc2626' },
        { id: 'purple' as AccentColor, name: 'Фиолетовый', color: '#9333ea' },
        { id: 'orange' as AccentColor, name: 'Оранжевый', color: '#ea580c' },
        { id: 'teal' as AccentColor, name: 'Бирюзовый', color: '#0891b2' }
    ];

    const accessibilityScore = Math.round(
        (Object.values(theme.accessibility).filter(Boolean).length / Object.keys(theme.accessibility).length) * 100
    );

    const contextValue: ThemeContextType = {
        theme,
        effectiveTheme,
        currentColorScheme,
        cssVariables,
        themeClasses,
        availableThemes,
        availableAccents,
        accessibilityScore
    };

    return (
        <ThemeContext.Provider value={contextValue}>
            {children}
        </ThemeContext.Provider>
    );
};

// ===== CUSTOM HOOK =====

export const useTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

// ===== ЭКСПОРТ ПО УМОЛЧАНИЮ =====

export default useThemeStore;
