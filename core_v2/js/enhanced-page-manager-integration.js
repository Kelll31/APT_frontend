/**
 * Enhanced PageManager Integration – Fixed (12 Aug 2025)
 * • Гарантирует наличие метода registerPage даже при старых версиях
 * • Инициализирует EPM и делает его глобально доступным
 */

let enhancedPageManager = null;

/* — функция инициализации — */
async function initializeEnhancedPageManager() {
    if (enhancedPageManager) return enhancedPageManager;

    /* создаём EPM */
    enhancedPageManager = new EnhancedPageManager();
    await enhancedPageManager.init();

    /* — POLYFILL: registerPage — */
    if (typeof enhancedPageManager.registerPage !== 'function') {
        enhancedPageManager.registerPage = () => { console.warn('⚠️ registerPage polyfilled (no-op)'); };
    }

    /* экспорт в глобальный scope */
    window.pageManager = enhancedPageManager;
    window.enhancedPageManager = enhancedPageManager;

    console.log('✅ Enhanced PageManager initialised & integrated');
    return enhancedPageManager;
}

/* авто-upgrade старого PageManager */
async function upgradeToEnhancedPageManager() {
    if (window.app?.components?.pageManager?.destroy) {
        try { await window.app.components.pageManager.destroy(); }
        catch (e) { console.warn('⚠️ old PageManager destroy failed', e); }
    }
    window.app.components.pageManager = await initializeEnhancedPageManager();
}

/* автозапуск после DOMContentLoaded */
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => initializeEnhancedPageManager(), 500);
});

/* экспорт утилит */
window.initializeEnhancedPageManager = initializeEnhancedPageManager;
window.upgradeToEnhancedPageManager = upgradeToEnhancedPageManager;
