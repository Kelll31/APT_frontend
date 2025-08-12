// Settings page JavaScript
console.log('⚙️ Settings page loaded');

function initSettings() {
    console.log('🚀 Инициализация Settings');

    // Устанавливаем текущую тему
    const currentTheme = localStorage.getItem('ip-roast-theme-v2') || 'dark';
    const themeSelect = document.querySelector('select');
    if (themeSelect) {
        themeSelect.value = currentTheme;
    }
}

window.changeTheme = function(theme) {
    console.log(`🎨 Смена темы на: ${theme}`);

    if (window.app && window.app.components.themeManager) {
        window.app.components.themeManager.setTheme(theme);
    } else if (window.IPRoastCore && window.IPRoastCore.ThemeManager) {
        const themeManager = new window.IPRoastCore.ThemeManager();
        themeManager.setTheme(theme);
    } else {
        // Fallback
        localStorage.setItem('ip-roast-theme-v2', theme);
        document.documentElement.setAttribute('data-theme', theme);
        location.reload();
    }
};

initSettings();