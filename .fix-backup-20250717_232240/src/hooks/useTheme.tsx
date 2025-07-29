import { useEffect } from 'react';
import { useThemeStore } from '../stores/themeStore';

export function useTheme() {
    const {
        theme,
        accentColor,
        fontSize,
        uiSize,
        setTheme,
        setAccentColor,
        setFontSize,
        setUISize,
        initializeTheme,
    } = useThemeStore();

    useEffect(() => {
        initializeTheme();
    }, [initializeTheme]);

    // Apply theme to document
    useEffect(() => {
        const root = document.documentElement;

        // Remove existing theme classes
        root.classList.remove('theme-light', 'theme-dark', 'theme-auto');

        // Add current theme class
        root.classList.add(`theme-${theme}`);

        // Set CSS custom properties
        root.style.setProperty('--accent-color', accentColor);
        root.style.setProperty('--font-size-base', `${fontSize}px`);
        root.style.setProperty('--ui-scale', uiSize.toString());

        // Handle auto theme
        if (theme === 'auto') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handleChange = (e: MediaQueryListEvent) => {
                root.classList.remove('theme-light', 'theme-dark');
                root.classList.add(e.matches ? 'theme-dark' : 'theme-light');
            };

            mediaQuery.addEventListener('change', handleChange);

            // Set initial theme
            root.classList.add(mediaQuery.matches ? 'theme-dark' : 'theme-light');

            return () => {
                mediaQuery.removeEventListener('change', handleChange);
            };
        }
    }, [theme, accentColor, fontSize, uiSize]);

    const toggleTheme = () => {
        const themes = ['light', 'dark', 'auto'] as const;
        const currentIndex = themes.indexOf(theme);
        const nextIndex = (currentIndex + 1) % themes.length;
        setTheme(themes[nextIndex]);
    };

    const isDark = theme === 'dark' ||
        (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    return {
        theme,
        isDark,
        accentColor,
        fontSize,
        uiSize,
        setTheme,
        setAccentColor,
        setFontSize,
        setUISize,
        toggleTheme,
    };
}

export default useTheme;
