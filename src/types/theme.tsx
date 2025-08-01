// src/types/theme.tsx

/**
 * IP Roast Enterprise - Theme System v3.0
 * Комплексная система управления темами с типобезопасностью TypeScript
 */

import React from 'react';

// ===== БАЗОВЫЕ ТИПЫ ТЕМ =====

export type ThemeMode = 'light' | 'dark' | 'auto';
export type AccentColor = 'blue' | 'green' | 'red' | 'purple' | 'orange' | 'teal' | 'pink' | 'indigo';
export type UISize = 'compact' | 'medium' | 'large';
export type FontFamily = 'inter' | 'roboto' | 'open-sans' | 'source-sans' | 'system';

// ===== ЦВЕТОВЫЕ ТИПЫ =====

export interface RGBColor {
    r: number;
    g: number;
    b: number;
}

export interface HSLColor {
    h: number;
    s: number;
    l: number;
}

export interface RGBAColor extends RGBColor {
    a: number;
}

export interface HSLAColor extends HSLColor {
    a: number;
}

// ===== ЦВЕТОВАЯ ПАЛИТРА =====

export interface ColorPalette {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
    950: string;
}

// ===== ЦВЕТОВАЯ СХЕМА =====

export interface ThemeColors {
    // Основные цвета
    primary: ColorPalette;
    secondary: ColorPalette;
    accent: ColorPalette;

    // Семантические цвета
    success: ColorPalette;
    warning: ColorPalette;
    error: ColorPalette;
    info: ColorPalette;

    // Нейтральные цвета
    gray: ColorPalette;
    slate: ColorPalette;
    zinc: ColorPalette;

    // Фоновые цвета
    background: {
        primary: string;
        secondary: string;
        tertiary: string;
        elevated: string;
        overlay: string;
    };

    // Поверхности
    surface: {
        primary: string;
        secondary: string;
        tertiary: string;
        inverse: string;
        disabled: string;
    };

    // Границы
    border: {
        primary: string;
        secondary: string;
        tertiary: string;
        focus: string;
        error: string;
        success: string;
    };

    // Текст
    text: {
        primary: string;
        secondary: string;
        tertiary: string;
        disabled: string;
        inverse: string;
        link: string;
        linkHover: string;
    };

    // Тени
    shadow: {
        sm: string;
        md: string;
        lg: string;
        xl: string;
    };
}

// ===== ТИПОГРАФИКА =====

export interface Typography {
    fontFamily: {
        sans: string[];
        serif: string[];
        mono: string[];
    };
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
        normal: number;
        relaxed: number;
        loose: number;
    };
}

// ===== ОСНОВНАЯ ТЕМА =====

export interface Theme {
    id: string;
    name: string;
    mode: ThemeMode;
    colors: ThemeColors;
    typography: Typography;

    // CSS переменные
    cssVariables: Record<string, string>;

    // Метаданные
    metadata: {
        version: string;
        author: string;
        description: string;
        created: string;
        updated: string;
    };
}

// ===== НАСТРОЙКИ ПОЛЬЗОВАТЕЛЯ =====

export interface UserThemePreferences {
    mode: ThemeMode;
    accentColor: AccentColor;
    fontSize: number;
    fontFamily: FontFamily;
    uiSize: UISize;
    reducedMotion: boolean;
    highContrast: boolean;
    customColors?: Partial<ThemeColors>;
    customCSS?: string;
}

// ===== ЦВЕТОВЫЕ УТИЛИТЫ =====

/**
 * Безопасное преобразование HEX в RGB с проверкой типов
 */
export function hexToRgb(hex: string): RGBColor | null {
    if (!hex || typeof hex !== 'string') {
        console.warn(`Недопустимый тип для HEX: ${typeof hex}`);
        return null;
    }

    // Удаляем # если есть
    const cleanHex = hex.replace('#', '');

    // Проверяем валидность HEX формата
    if (!/^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/.test(cleanHex)) {
        console.warn(`Неверный HEX формат: ${hex}`);
        return null;
    }

    let normalizedHex = cleanHex;
    // Расширяем 3-символьный HEX до 6-символьного
    if (cleanHex.length === 3) {
        normalizedHex = cleanHex
            .split('')
            .map(char => char + char)
            .join('');
    }

    // Безопасное извлечение RGB компонентов
    if (normalizedHex.length !== 6) {
        console.warn(`Неверная длина HEX после нормализации: ${normalizedHex}`);
        return null;
    }

    const rHex = normalizedHex.substring(0, 2);
    const gHex = normalizedHex.substring(2, 4);
    const bHex = normalizedHex.substring(4, 6);

    // Дополнительная проверка на пустые значения
    if (!rHex || !gHex || !bHex) {
        console.warn(`Не удается разобрать RGB компоненты из HEX: ${hex}`);
        return null;
    }

    const r = parseInt(rHex, 16);
    const g = parseInt(gHex, 16);
    const b = parseInt(bHex, 16);

    // Проверяем на NaN
    if (isNaN(r) || isNaN(g) || isNaN(b)) {
        console.warn(`Некорректные RGB значения для HEX: ${hex}`);
        return null;
    }

    return { r, g, b };
}

/**
 * Преобразование RGB в HEX с валидацией
 */
export function rgbToHex(r: number, g: number, b: number): string {
    // Валидация и ограничение входных значений
    const clampedR = Math.max(0, Math.min(255, Math.round(r || 0)));
    const clampedG = Math.max(0, Math.min(255, Math.round(g || 0)));
    const clampedB = Math.max(0, Math.min(255, Math.round(b || 0)));

    const toHex = (value: number): string => {
        const hex = value.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(clampedR)}${toHex(clampedG)}${toHex(clampedB)}`;
}

/**
 * Безопасное преобразование RGB в HSL
 */
export function rgbToHsl(r: number, g: number, b: number): HSLColor {
    // Валидация входных значений
    const validR = Math.max(0, Math.min(255, r || 0)) / 255;
    const validG = Math.max(0, Math.min(255, g || 0)) / 255;
    const validB = Math.max(0, Math.min(255, b || 0)) / 255;

    const max = Math.max(validR, validG, validB);
    const min = Math.min(validR, validG, validB);
    let h: number;
    let s: number;
    const l = (max + min) / 2;

    if (max === min) {
        h = s = 0; // ахроматический
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
            case validR:
                h = (validG - validB) / d + (validG < validB ? 6 : 0);
                break;
            case validG:
                h = (validB - validR) / d + 2;
                break;
            case validB:
                h = (validR - validG) / d + 4;
                break;
            default:
                h = 0;
        }
        h /= 6;
    }

    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    };
}

/**
 * Преобразование HSL в RGB с валидацией
 */
export function hslToRgb(h: number, s: number, l: number): RGBColor {
    // Нормализация входных значений
    const normalizedH = ((h || 0) % 360 + 360) % 360;
    const normalizedS = Math.max(0, Math.min(100, s || 0)) / 100;
    const normalizedL = Math.max(0, Math.min(100, l || 0)) / 100;

    const c = (1 - Math.abs(2 * normalizedL - 1)) * normalizedS;
    const x = c * (1 - Math.abs(((normalizedH / 60) % 2) - 1));
    const m = normalizedL - c / 2;

    let r: number;
    let g: number;
    let b: number;

    if (0 <= normalizedH && normalizedH < 60) {
        r = c; g = x; b = 0;
    } else if (60 <= normalizedH && normalizedH < 120) {
        r = x; g = c; b = 0;
    } else if (120 <= normalizedH && normalizedH < 180) {
        r = 0; g = c; b = x;
    } else if (180 <= normalizedH && normalizedH < 240) {
        r = 0; g = x; b = c;
    } else if (240 <= normalizedH && normalizedH < 300) {
        r = x; g = 0; b = c;
    } else {
        r = c; g = 0; b = x;
    }

    return {
        r: Math.round((r + m) * 255),
        g: Math.round((g + m) * 255),
        b: Math.round((b + m) * 255)
    };
}

/**
 * Осветление цвета с безопасной обработкой
 */
export function lightenColor(color: string, percent: number): string {
    const rgb = hexToRgb(color);
    if (!rgb) return color;

    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    hsl.l = Math.min(100, hsl.l + Math.abs(percent || 0));

    const newRgb = hslToRgb(hsl.h, hsl.s, hsl.l);
    return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
}

/**
 * Затемнение цвета с безопасной обработкой
 */
export function darkenColor(color: string, percent: number): string {
    const rgb = hexToRgb(color);
    if (!rgb) return color;

    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    hsl.l = Math.max(0, hsl.l - Math.abs(percent || 0));

    const newRgb = hslToRgb(hsl.h, hsl.s, hsl.l);
    return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
}

/**
 * Изменение прозрачности с валидацией
 */
export function setColorAlpha(color: string, alpha: number): string {
    const rgb = hexToRgb(color);
    if (!rgb) return color;

    const clampedAlpha = Math.max(0, Math.min(1, alpha || 0));
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${clampedAlpha})`;
}

/**
 * Исправленная функция получения luminance с безопасной деструктуризацией
 */
export function getContrastRatio(color1: string, color2: string): number {
    const getLuminance = (color: string): number => {
        const rgb = hexToRgb(color);
        if (!rgb) {
            console.warn(`Не удается получить RGB для цвета: ${color}`);
            return 0;
        }

        // Безопасное извлечение значений с явной проверкой
        const { r: rValue, g: gValue, b: bValue } = rgb;

        // Проверяем, что значения определены и являются числами
        if (typeof rValue !== 'number' || typeof gValue !== 'number' || typeof bValue !== 'number') {
            console.warn(`Недопустимые RGB значения: r=${rValue}, g=${gValue}, b=${bValue}`);
            return 0;
        }

        // Функция для нормализации цветового компонента
        const normalizeColorComponent = (c: number): number => {
            const normalizedC = c / 255;
            return normalizedC <= 0.03928
                ? normalizedC / 12.92
                : Math.pow((normalizedC + 0.055) / 1.055, 2.4);
        };

        // Вычисляем каждый компонент отдельно для типобезопасности
        const r = normalizeColorComponent(rValue);
        const g = normalizeColorComponent(gValue);
        const b = normalizeColorComponent(bValue);

        // Дополнительная проверка на NaN
        if (isNaN(r) || isNaN(g) || isNaN(b)) {
            console.warn(`Получены NaN значения при нормализации RGB: r=${r}, g=${g}, b=${b}`);
            return 0;
        }

        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };

    const lum1 = getLuminance(color1);
    const lum2 = getLuminance(color2);

    // Проверяем на валидность luminance значений
    if (isNaN(lum1) || isNaN(lum2)) {
        console.warn(`Недопустимые luminance значения: lum1=${lum1}, lum2=${lum2}`);
        return 1; // Возвращаем минимальный контраст
    }

    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    const contrastRatio = (brightest + 0.05) / (darkest + 0.05);

    // Проверяем результат на валидность
    if (isNaN(contrastRatio) || contrastRatio < 1) {
        console.warn(`Недопустимый коэффициент контрастности: ${contrastRatio}`);
        return 1;
    }

    return contrastRatio;
}

/**
 * Проверка темноты цвета
 */
export function isDarkColor(color: string): boolean {
    const rgb = hexToRgb(color);
    if (!rgb) return false;

    // Используем формулу яркости
    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    return brightness < 128;
}

/**
 * Генерация цветовой палитры
 */
export function generateColorPalette(baseColor: string): ColorPalette {
    const rgb = hexToRgb(baseColor);
    if (!rgb) {
        // Возвращаем дефолтную серую палитру
        return {
            50: '#f8fafc',
            100: '#f1f5f9',
            200: '#e2e8f0',
            300: '#cbd5e1',
            400: '#94a3b8',
            500: '#64748b',
            600: '#475569',
            700: '#334155',
            800: '#1e293b',
            900: '#0f172a',
            950: '#020617'
        };
    }

    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

    const generateShade = (lightness: number): string => {
        const newRgb = hslToRgb(hsl.h, hsl.s, lightness);
        return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    };

    return {
        50: generateShade(98),
        100: generateShade(95),
        200: generateShade(90),
        300: generateShade(83),
        400: generateShade(70),
        500: baseColor,
        600: generateShade(Math.max(0, hsl.l - 10)),
        700: generateShade(Math.max(0, hsl.l - 20)),
        800: generateShade(Math.max(0, hsl.l - 30)),
        900: generateShade(Math.max(0, hsl.l - 40)),
        950: generateShade(Math.max(0, hsl.l - 50))
    };
}

// ===== REACT КОМПОНЕНТЫ ДЛЯ ТЕМ =====

/**
 * Провайдер темы
 */
export interface ThemeProviderProps {
    theme: Theme;
    children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ theme, children }) => {
    React.useEffect(() => {
        // Применяем CSS переменные при изменении темы
        const root = document.documentElement;
        Object.entries(theme.cssVariables).forEach(([property, value]) => {
            root.style.setProperty(property, value);
        });

        // Устанавливаем data-атрибуты
        root.setAttribute('data-theme', theme.mode);
        root.setAttribute('data-theme-id', theme.id);
    }, [theme]);

    return <>{children}</>;
};

/**
 * Хук для использования темы
 */
export const useTheme = () => {
    const [currentTheme, setCurrentTheme] = React.useState<Theme | null>(null);

    const applyTheme = React.useCallback((theme: Theme) => {
        setCurrentTheme(theme);
    }, []);

    return {
        currentTheme,
        applyTheme,
        isDark: currentTheme?.mode === 'dark',
        isLight: currentTheme?.mode === 'light',
        isAuto: currentTheme?.mode === 'auto'
    };
};

// ===== ПРЕДУСТАНОВЛЕННЫЕ ТЕМЫ =====

/**
 * Акцентные цвета
 */
export const ACCENT_COLORS: Record<AccentColor, string> = {
    blue: '#3b82f6',
    green: '#22c55e',
    red: '#ef4444',
    purple: '#a855f7',
    orange: '#f97316',
    teal: '#14b8a6',
    pink: '#ec4899',
    indigo: '#6366f1'
};

/**
 * Размеры UI
 */
export const UI_SIZES: Record<UISize, { multiplier: number; fontSize: string }> = {
    compact: { multiplier: 0.875, fontSize: '14px' },
    medium: { multiplier: 1, fontSize: '16px' },
    large: { multiplier: 1.125, fontSize: '18px' }
};

/**
 * Семейства шрифтов
 */
export const FONT_FAMILIES: Record<FontFamily, string[]> = {
    inter: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
    roboto: ['Roboto', 'ui-sans-serif', 'system-ui', 'sans-serif'],
    'open-sans': ['Open Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
    'source-sans': ['Source Sans Pro', 'ui-sans-serif', 'system-ui', 'sans-serif'],
    system: ['ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif']
};

/**
 * Создание светлой темы
 */
export function createLightTheme(accentColor: AccentColor = 'blue'): Theme {
    const primaryPalette = generateColorPalette(ACCENT_COLORS[accentColor]);

    return {
        id: `light-${accentColor}`,
        name: `IP Roast Light (${accentColor})`,
        mode: 'light',
        colors: {
            primary: primaryPalette,
            secondary: generateColorPalette('#6b7280'),
            accent: primaryPalette,
            success: generateColorPalette('#22c55e'),
            warning: generateColorPalette('#f59e0b'),
            error: generateColorPalette('#ef4444'),
            info: generateColorPalette('#06b6d4'),
            gray: generateColorPalette('#6b7280'),
            slate: generateColorPalette('#64748b'),
            zinc: generateColorPalette('#71717a'),
            background: {
                primary: '#ffffff',
                secondary: '#f8fafc',
                tertiary: '#f1f5f9',
                elevated: '#ffffff',
                overlay: 'rgba(0, 0, 0, 0.5)'
            },
            surface: {
                primary: '#ffffff',
                secondary: '#f8fafc',
                tertiary: '#f1f5f9',
                inverse: '#1e293b',
                disabled: '#f1f5f9'
            },
            border: {
                primary: '#e2e8f0',
                secondary: '#cbd5e1',
                tertiary: '#94a3b8',
                focus: primaryPalette[500],
                error: '#ef4444',
                success: '#22c55e'
            },
            text: {
                primary: '#1e293b',
                secondary: '#475569',
                tertiary: '#64748b',
                disabled: '#94a3b8',
                inverse: '#ffffff',
                link: primaryPalette[600],
                linkHover: primaryPalette[700]
            },
            shadow: {
                sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
                md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
            }
        },
        typography: {
            fontFamily: {
                sans: FONT_FAMILIES.inter,
                serif: ['ui-serif', 'Georgia', 'Cambria', 'serif'],
                mono: ['ui-monospace', 'SFMono-Regular', 'Consolas', 'monospace']
            },
            fontSize: {
                xs: '0.75rem',
                sm: '0.875rem',
                base: '1rem',
                lg: '1.125rem',
                xl: '1.25rem',
                '2xl': '1.5rem',
                '3xl': '1.875rem',
                '4xl': '2.25rem',
                '5xl': '3rem',
                '6xl': '3.75rem'
            },
            fontWeight: {
                thin: 100,
                light: 300,
                normal: 400,
                medium: 500,
                semibold: 600,
                bold: 700,
                extrabold: 800,
                black: 900
            },
            lineHeight: {
                none: 1,
                tight: 1.25,
                normal: 1.5,
                relaxed: 1.625,
                loose: 2
            }
        },
        cssVariables: {},
        metadata: {
            version: '3.0.0',
            author: 'IP Roast Team',
            description: `Light theme with ${accentColor} accent`,
            created: new Date().toISOString(),
            updated: new Date().toISOString()
        }
    };
}

/**
 * Создание темной темы
 */
export function createDarkTheme(accentColor: AccentColor = 'blue'): Theme {
    const primaryPalette = generateColorPalette(ACCENT_COLORS[accentColor]);

    return {
        id: `dark-${accentColor}`,
        name: `IP Roast Dark (${accentColor})`,
        mode: 'dark',
        colors: {
            primary: primaryPalette,
            secondary: generateColorPalette('#6b7280'),
            accent: primaryPalette,
            success: generateColorPalette('#22c55e'),
            warning: generateColorPalette('#f59e0b'),
            error: generateColorPalette('#ef4444'),
            info: generateColorPalette('#06b6d4'),
            gray: generateColorPalette('#6b7280'),
            slate: generateColorPalette('#64748b'),
            zinc: generateColorPalette('#71717a'),
            background: {
                primary: '#0f172a',
                secondary: '#1e293b',
                tertiary: '#334155',
                elevated: '#1e293b',
                overlay: 'rgba(0, 0, 0, 0.8)'
            },
            surface: {
                primary: '#1e293b',
                secondary: '#334155',
                tertiary: '#475569',
                inverse: '#ffffff',
                disabled: '#334155'
            },
            border: {
                primary: '#334155',
                secondary: '#475569',
                tertiary: '#64748b',
                focus: primaryPalette[400],
                error: '#ef4444',
                success: '#22c55e'
            },
            text: {
                primary: '#f8fafc',
                secondary: '#cbd5e1',
                tertiary: '#94a3b8',
                disabled: '#64748b',
                inverse: '#1e293b',
                link: primaryPalette[400],
                linkHover: primaryPalette[300]
            },
            shadow: {
                sm: '0 1px 2px 0 rgb(0 0 0 / 0.3)',
                md: '0 4px 6px -1px rgb(0 0 0 / 0.3), 0 2px 4px -2px rgb(0 0 0 / 0.3)',
                lg: '0 10px 15px -3px rgb(0 0 0 / 0.3), 0 4px 6px -4px rgb(0 0 0 / 0.3)',
                xl: '0 20px 25px -5px rgb(0 0 0 / 0.3), 0 8px 10px -6px rgb(0 0 0 / 0.3)'
            }
        },
        typography: {
            fontFamily: {
                sans: FONT_FAMILIES.inter,
                serif: ['ui-serif', 'Georgia', 'Cambria', 'serif'],
                mono: ['ui-monospace', 'SFMono-Regular', 'Consolas', 'monospace']
            },
            fontSize: {
                xs: '0.75rem',
                sm: '0.875rem',
                base: '1rem',
                lg: '1.125rem',
                xl: '1.25rem',
                '2xl': '1.5rem',
                '3xl': '1.875rem',
                '4xl': '2.25rem',
                '5xl': '3rem',
                '6xl': '3.75rem'
            },
            fontWeight: {
                thin: 100,
                light: 300,
                normal: 400,
                medium: 500,
                semibold: 600,
                bold: 700,
                extrabold: 800,
                black: 900
            },
            lineHeight: {
                none: 1,
                tight: 1.25,
                normal: 1.5,
                relaxed: 1.625,
                loose: 2
            }
        },
        cssVariables: {},
        metadata: {
            version: '3.0.0',
            author: 'IP Roast Team',
            description: `Dark theme with ${accentColor} accent`,
            created: new Date().toISOString(),
            updated: new Date().toISOString()
        }
    };
}

// ===== УТИЛИТЫ ПРОВЕРКИ =====

/**
 * Проверка WCAG соответствия
 */
export function isWCAGCompliant(foreground: string, background: string, level: 'AA' | 'AAA' = 'AA'): boolean {
    const ratio = getContrastRatio(foreground, background);
    return level === 'AA' ? ratio >= 4.5 : ratio >= 7;
}

/**
 * Валидация HEX цвета
 */
export function isValidHex(hex: string): boolean {
    return /^#?[0-9A-Fa-f]{3}$|^#?[0-9A-Fa-f]{6}$/.test(hex);
}

// ===== ЭКСПОРТ ПО УМОЛЧАНИЮ =====

export default {
    hexToRgb,
    rgbToHex,
    rgbToHsl,
    hslToRgb,
    lightenColor,
    darkenColor,
    setColorAlpha,
    getContrastRatio,
    isDarkColor,
    generateColorPalette,
    createLightTheme,
    createDarkTheme,
    isWCAGCompliant,
    isValidHex,
    ThemeProvider,
    useTheme,
    ACCENT_COLORS,
    UI_SIZES,
    FONT_FAMILIES
};
