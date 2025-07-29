import { useEffect, useMemo } from 'react';
import { useThemeStore, ThemeMode, AccentColor, UISize } from '../stores/themeStore';

/**
 * IP Roast Enterprise - Theme Hook v3.0
 * Хук для работы с системой тем и оформления
 * Интегрируется с ThemeStore для централизованного управления
 */

export interface UseThemeReturn {
    // Основные свойства темы
    theme: ThemeMode;
    mode: ThemeMode;
    isDark: boolean;
    accentColor: AccentColor;
    fontSize: number;
    uiSize: UISize;

    // Действия
    setTheme: (mode: ThemeMode) => void;
    setAccentColor: (color: AccentColor) => void;
    setFontSize: (size: number) => void;
    setUISize: (size: UISize) => void;
    toggleTheme: () => void;

    // Дополнительные свойства
    effectiveTheme: 'light' | 'dark';
    isTransitioning: boolean;
    previewMode: boolean;

    // Системные предпочтения
    systemPreferences: {
        prefersColorScheme: 'light' | 'dark' | null;
        prefersReducedMotion: boolean;
        prefersHighContrast: boolean;
        prefersReducedTransparency: boolean;
    };

    // Настройки доступности
    accessibility: {
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
    };

    // Кастомные темы
    customThemes: Map<string, any>;
    activeCustomTheme: string | null;

    // Утилиты
    enablePreviewMode: () => void;
    disablePreviewMode: () => void;
    resetToDefaults: () => void;
}

export function useTheme(): UseThemeReturn {
    // Получаем все необходимые данные и методы из store
    const {
        mode,
        accentColor,
        fontSize,
        uiSize,
        customThemes,
        activeCustomTheme,
        accessibility,
        animations,
        customCSS,
        systemPreferences,
        isTransitioning,
        previewMode,

        // Действия
        setTheme,
        setAccentColor,
        setFontSize,
        setUISize,
        toggleTheme,
        updateAccessibility,
        enablePreviewMode,
        disablePreviewMode,
        resetToDefaults,
        applyTheme,
        initializeSystemPreferences
    } = useThemeStore();

    // Инициализация при первом монтировании
    useEffect(() => {
        initializeSystemPreferences();
        applyTheme();
    }, [initializeSystemPreferences, applyTheme]);

    // Применяем тему при изменении настроек
    useEffect(() => {
        applyTheme();
    }, [
        mode,
        accentColor,
        fontSize,
        uiSize,
        activeCustomTheme,
        accessibility,
        animations,
        customCSS,
        applyTheme
    ]);

    // Вычисляем эффективную тему (с учетом auto режима)
    const effectiveTheme = useMemo((): 'light' | 'dark' => {
        if (mode === 'auto') {
            return systemPreferences.prefersColorScheme || 'light';
        }
        return mode as 'light' | 'dark';
    }, [mode, systemPreferences.prefersColorScheme]);

    // Определяем, является ли текущая тема темной
    const isDark = useMemo(() => {
        return effectiveTheme === 'dark';
    }, [effectiveTheme]);

    // Слушаем изменения системных предпочтений для auto режима
    useEffect(() => {
        if (mode === 'auto') {
            applyTheme();
        }
    }, [mode, systemPreferences.prefersColorScheme, applyTheme]);

    // Применяем настройки доступности из системных предпочтений
    useEffect(() => {
        if (systemPreferences.prefersReducedMotion && !accessibility.reducedMotion) {
            updateAccessibility({ reducedMotion: true });
        }
        if (systemPreferences.prefersHighContrast && !accessibility.highContrast) {
            updateAccessibility({ highContrast: true });
        }
    }, [
        systemPreferences.prefersReducedMotion,
        systemPreferences.prefersHighContrast,
        accessibility.reducedMotion,
        accessibility.highContrast,
        updateAccessibility
    ]);

    // Возвращаем объект с полным API темы
    return {
        // Основные свойства
        theme: mode, // Для обратной совместимости
        mode,
        isDark,
        accentColor,
        fontSize,
        uiSize,

        // Действия
        setTheme,
        setAccentColor,
        setFontSize,
        setUISize,
        toggleTheme,

        // Дополнительные свойства
        effectiveTheme,
        isTransitioning,
        previewMode,

        // Системные предпочтения
        systemPreferences,

        // Настройки доступности
        accessibility,

        // Кастомные темы
        customThemes,
        activeCustomTheme,

        // Утилиты
        enablePreviewMode,
        disablePreviewMode,
        resetToDefaults
    };
}

/**
 * Упрощенный хук для быстрого доступа к основным свойствам темы
 */
export function useSimpleTheme() {
    const { mode, isDark, accentColor, setTheme, toggleTheme } = useTheme();

    return {
        theme: mode,
        isDark,
        accentColor,
        setTheme,
        toggleTheme
    };
}

/**
 * Хук для работы с кастомными темами
 */
export function useCustomThemes() {
    const {
        customThemes,
        activeCustomTheme,
        createCustomTheme,
        applyCustomTheme,
        deleteCustomTheme
    } = useThemeStore();

    const themes = useMemo(() => {
        return Array.from(customThemes.values());
    }, [customThemes]);

    const activeTheme = useMemo(() => {
        return activeCustomTheme ? customThemes.get(activeCustomTheme) : null;
    }, [customThemes, activeCustomTheme]);

    return {
        themes,
        activeTheme,
        activeCustomTheme,
        createCustomTheme,
        applyCustomTheme,
        deleteCustomTheme
    };
}

/**
 * Хук для работы с настройками доступности
 */
export function useAccessibility() {
    const {
        accessibility,
        updateAccessibility,
        systemPreferences
    } = useThemeStore();

    const accessibilityScore = useMemo(() => {
        const enabledFeatures = Object.values(accessibility).filter(Boolean).length;
        const totalFeatures = Object.keys(accessibility).length;
        return Math.round((enabledFeatures / totalFeatures) * 100);
    }, [accessibility]);

    return {
        accessibility,
        updateAccessibility,
        systemPreferences,
        accessibilityScore
    };
}

/**
 * Хук для получения CSS переменных темы
 */
export function useThemeVariables() {
    const { mode, accentColor, uiSize, fontSize } = useThemeStore();

    const cssVariables = useMemo(() => {
        const variables: Record<string, string> = {};

        // Основные переменные
        variables['--theme-mode'] = mode;
        variables['--theme-accent'] = accentColor;
        variables['--theme-size'] = uiSize;
        variables['--theme-font-size'] = `${fontSize}px`;

        // Размеры UI
        const sizeMultipliers = { compact: 0.875, medium: 1, large: 1.125 };
        variables['--theme-size-multiplier'] = sizeMultipliers[uiSize].toString();

        return variables;
    }, [mode, accentColor, uiSize, fontSize]);

    return cssVariables;
}

export default useTheme;
