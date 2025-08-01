// src/types/theme.ts
/**
 * IP Roast Enterprise - Theme Types and Utilities v3.0
 * Типы данных и утилиты для системы тем с поддержкой TypeScript
 */

// ===== БАЗОВЫЕ ТИПЫ ТЕМ =====

export type ThemeMode = 'light' | 'dark' | 'auto';
export type AccentColor = 'blue' | 'green' | 'red' | 'purple' | 'orange' | 'teal' | 'pink' | 'indigo';
export type UISize = 'compact' | 'medium' | 'large';
export type FontFamily = 'inter' | 'roboto' | 'open-sans' | 'source-sans' | 'system';

// ===== ЦВЕТОВЫЕ СХЕМЫ =====

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

    // Цвета поверхностей
    surface: {
        primary: string;
        secondary: string;
        tertiary: string;
        inverse: string;
        disabled: string;
    };

    // Цвета границ
    border: {
        primary: string;
        secondary: string;
        tertiary: string;
        focus: string;
        error: string;
        success: string;
    };

    // Цвета текста
    text: {
        primary: string;
        secondary: string;
        tertiary: string;
        disabled: string;
        inverse: string;
        link: string;
        linkHover: string;
    };

    // Специальные цвета
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
        '7xl': string;
        '8xl': string;
        '9xl': string;
    };

    fontWeight: {
        thin: number;
        extralight: number;
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

// ===== SPACING И LAYOUT =====

export interface Spacing {
    0: string;
    px: string;
    0.5: string;
    1: string;
    1.5: string;
    2: string;
    2.5: string;
    3: string;
    3.5: string;
    4: string;
    5: string;
    6: string;
    7: string;
    8: string;
    9: string;
    10: string;
    11: string;
    12: string;
    14: string;
    16: string;
    20: string;
    24: string;
    28: string;
    32: string;
    36: string;
    40: string;
    44: string;
    48: string;
    52: string;
    56: string;
    60: string;
    64: string;
    72: string;
    80: string;
    96: string;
}

export interface BorderRadius {
    none: string;
    sm: string;
    base: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    full: string;
}

// ===== АНИМАЦИИ =====

export interface AnimationConfig {
    duration: {
        fast: string;
        normal: string;
        slow: string;
        slower: string;
    };

    timing: {
        linear: string;
        ease: string;
        easeIn: string;
        easeOut: string;
        easeInOut: string;
        bounce: string;
        elastic: string;
    };

    keyframes: {
        fadeIn: string;
        fadeOut: string;
        slideIn: string;
        slideOut: string;
        scaleIn: string;
        scaleOut: string;
        bounce: string;
        pulse: string;
        spin: string;
    };
}

// ===== ОСНОВНАЯ ТЕМА =====

export interface Theme {
    id: string;
    name: string;
    mode: ThemeMode;
    colors: ThemeColors;
    typography: Typography;
    spacing: Spacing;
    borderRadius: BorderRadius;
    animation: AnimationConfig;

    // Настройки компонентов
    components: {
        button: ComponentTheme;
        input: ComponentTheme;
        card: ComponentTheme;
        modal: ComponentTheme;
        tooltip: ComponentTheme;
        dropdown: ComponentTheme;
        navbar: ComponentTheme;
        sidebar: ComponentTheme;
        table: ComponentTheme;
        chart: ComponentTheme;
    };

    // Кастомные CSS переменные
    cssVariables: Record<string, string>;

    // Метаданные
    metadata: {
        version: string;
        author: string;
        description: string;
        tags: string[];
        created: string;
        updated: string;
    };
}

// ===== КОМПОНЕНТНЫЕ ТЕМЫ =====

export interface ComponentTheme {
    base: string;
    variants: Record<string, string>;
    sizes: Record<string, string>;
    states: {
        default: string;
        hover: string;
        focus: string;
        active: string;
        disabled: string;
        loading: string;
    };
}

// ===== ПОЛЬЗОВАТЕЛЬСКИЕ НАСТРОЙКИ =====

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

// ===== RGB/HEX ЦВЕТОВЫЕ УТИЛИТЫ =====

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

// ===== ЦВЕТОВЫЕ УТИЛИТЫ =====

/**
 * Преобразует HEX цвет в RGB
 * @param hex - HEX строка (например, "#ff0000" или "#f00")
 * @returns RGB объект или null при ошибке
 */
export function hexToRgb(hex: string): RGBColor | null {
    // Удаляем # если есть
    const cleanHex = hex.replace('#', '');

    // Проверяем валидность HEX
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

    // Парсим RGB компоненты с проверкой на undefined
    const rHex = normalizedHex.substring(0, 2);
    const gHex = normalizedHex.substring(2, 4);
    const bHex = normalizedHex.substring(4, 6);

    if (!rHex || !gHex || !bHex) {
        console.warn(`Не удается разобрать HEX цвет: ${hex}`);
        return null;
    }

    const r = parseInt(rHex, 16);
    const g = parseInt(gHex, 16);
    const b = parseInt(bHex, 16);

    // Проверяем валидность результата
    if (isNaN(r) || isNaN(g) || isNaN(b)) {
        console.warn(`Некорректные RGB значения для HEX: ${hex}`);
        return null;
    }

    return { r, g, b };
}

/**
 * Преобразует RGB в HEX
 * @param r - Красный компонент (0-255)
 * @param g - Зеленый компонент (0-255)
 * @param b - Синий компонент (0-255)
 * @returns HEX строка
 */
export function rgbToHex(r: number, g: number, b: number): string {
    // Валидация входных значений
    const clampedR = Math.max(0, Math.min(255, Math.round(r)));
    const clampedG = Math.max(0, Math.min(255, Math.round(g)));
    const clampedB = Math.max(0, Math.min(255, Math.round(b)));

    const toHex = (value: number): string => {
        const hex = value.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(clampedR)}${toHex(clampedG)}${toHex(clampedB)}`;
}

/**
 * Преобразует RGB в HSL
 * @param r - Красный компонент (0-255)
 * @param g - Зеленый компонент (0-255)
 * @param b - Синий компонент (0-255)
 * @returns HSL объект
 */
export function rgbToHsl(r: number, g: number, b: number): HSLColor {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h: number;
    let s: number;
    const l = (max + min) / 2;

    if (max === min) {
        h = s = 0; // ахроматический
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
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
 * Преобразует HSL в RGB
 * @param h - Оттенок (0-360)
 * @param s - Насыщенность (0-100)
 * @param l - Яркость (0-100)
 * @returns RGB объект
 */
export function hslToRgb(h: number, s: number, l: number): RGBColor {
    h = ((h % 360) + 360) % 360; // Нормализуем hue
    s = Math.max(0, Math.min(100, s)) / 100;
    l = Math.max(0, Math.min(100, l)) / 100;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;

    let r: number;
    let g: number;
    let b: number;

    if (0 <= h && h < 60) {
        r = c; g = x; b = 0;
    } else if (60 <= h && h < 120) {
        r = x; g = c; b = 0;
    } else if (120 <= h && h < 180) {
        r = 0; g = c; b = x;
    } else if (180 <= h && h < 240) {
        r = 0; g = x; b = c;
    } else if (240 <= h && h < 300) {
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
 * Осветляет цвет на указанный процент
 * @param color - HEX цвет
 * @param percent - Процент осветления (0-100)
 * @returns Осветленный HEX цвет
 */
export function lightenColor(color: string, percent: number): string {
    const rgb = hexToRgb(color);
    if (!rgb) return color;

    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    hsl.l = Math.min(100, hsl.l + percent);

    const newRgb = hslToRgb(hsl.h, hsl.s, hsl.l);
    return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
}

/**
 * Затемняет цвет на указанный процент
 * @param color - HEX цвет
 * @param percent - Процент затемнения (0-100)
 * @returns Затемненный HEX цвет
 */
export function darkenColor(color: string, percent: number): string {
    const rgb = hexToRgb(color);
    if (!rgb) return color;

    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    hsl.l = Math.max(0, hsl.l - percent);

    const newRgb = hslToRgb(hsl.h, hsl.s, hsl.l);
    return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
}

/**
 * Изменяет прозрачность цвета
 * @param color - HEX цвет
 * @param alpha - Значение альфа-канала (0-1)
 * @returns RGBA строка
 */
export function setColorAlpha(color: string, alpha: number): string {
    const rgb = hexToRgb(color);
    if (!rgb) return color;

    const clampedAlpha = Math.max(0, Math.min(1, alpha));
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${clampedAlpha})`;
}

/**
 * Проверяет контрастность между двумя цветами
 * @param color1 - Первый HEX цвет
 * @param color2 - Второй HEX цвет
 * @returns Коэффициент контрастности (1-21)
 */
export function getContrastRatio(color1: string, color2: string): number {
    const getLuminance = (color: string): number => {
        const rgb = hexToRgb(color);
        if (!rgb) return 0;

        const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(c => {
            c = c / 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });

        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };

    const lum1 = getLuminance(color1);
    const lum2 = getLuminance(color2);

    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);

    return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Проверяет, является ли цвет темным
 * @param color - HEX цвет
 * @returns true если цвет темный
 */
export function isDarkColor(color: string): boolean {
    const rgb = hexToRgb(color);
    if (!rgb) return false;

    // Используем формулу яркости
    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    return brightness < 128;
}

/**
 * Генерирует палитру цветов из базового цвета
 * @param baseColor - Базовый HEX цвет
 * @returns Палитра цветов
 */
export function generateColorPalette(baseColor: string): ColorPalette {
    const rgb = hexToRgb(baseColor);
    if (!rgb) {
        // Возвращаем дефолтную палитру если цвет невалидный
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
        500: baseColor, // Базовый цвет
        600: generateShade(Math.max(0, hsl.l - 10)),
        700: generateShade(Math.max(0, hsl.l - 20)),
        800: generateShade(Math.max(0, hsl.l - 30)),
        900: generateShade(Math.max(0, hsl.l - 40)),
        950: generateShade(Math.max(0, hsl.l - 50))
    };
}

// ===== ПРЕДУСТАНОВЛЕННЫЕ ТЕМЫ =====

/**
 * Светлая тема по умолчанию
 */
export const defaultLightTheme: Partial<Theme> = {
    id: 'default-light',
    name: 'IP Roast Light',
    mode: 'light',
    colors: {
        primary: generateColorPalette('#2563eb'),
        secondary: generateColorPalette('#6b7280'),
        accent: generateColorPalette('#3b82f6'),
        success: generateColorPalette('#16a34a'),
        warning: generateColorPalette('#ea580c'),
        error: generateColorPalette('#dc2626'),
        info: generateColorPalette('#0891b2'),
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
            focus: '#3b82f6',
            error: '#dc2626',
            success: '#16a34a'
        },
        text: {
            primary: '#1e293b',
            secondary: '#475569',
            tertiary: '#64748b',
            disabled: '#94a3b8',
            inverse: '#ffffff',
            link: '#3b82f6',
            linkHover: '#2563eb'
        },
        shadow: {
            sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
            md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
            lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
            xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
        }
    }
};

/**
 * Темная тема по умолчанию
 */
export const defaultDarkTheme: Partial<Theme> = {
    id: 'default-dark',
    name: 'IP Roast Dark',
    mode: 'dark',
    colors: {
        primary: generateColorPalette('#3b82f6'),
        secondary: generateColorPalette('#6b7280'),
        accent: generateColorPalette('#60a5fa'),
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
            focus: '#60a5fa',
            error: '#ef4444',
            success: '#22c55e'
        },
        text: {
            primary: '#f8fafc',
            secondary: '#cbd5e1',
            tertiary: '#94a3b8',
            disabled: '#64748b',
            inverse: '#1e293b',
            link: '#60a5fa',
            linkHover: '#93c5fd'
        },
        shadow: {
            sm: '0 1px 2px 0 rgb(0 0 0 / 0.3)',
            md: '0 4px 6px -1px rgb(0 0 0 / 0.3), 0 2px 4px -2px rgb(0 0 0 / 0.3)',
            lg: '0 10px 15px -3px rgb(0 0 0 / 0.3), 0 4px 6px -4px rgb(0 0 0 / 0.3)',
            xl: '0 20px 25px -5px rgb(0 0 0 / 0.3), 0 8px 10px -6px rgb(0 0 0 / 0.3)'
        }
    }
};

// ===== КОНСТАНТЫ И УТИЛИТЫ =====

/**
 * Доступные акцентные цвета
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
 * Размеры интерфейса
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
    defaultLightTheme,
    defaultDarkTheme,
    ACCENT_COLORS,
    UI_SIZES,
    FONT_FAMILIES
};
