/**
 * Integration code for Enhanced PageManager
 * Интеграция улучшенного PageManager в существующую систему
 */

// Создаем глобальный экземпляр Enhanced PageManager
let enhancedPageManager = null;

// Функция инициализации Enhanced PageManager
async function initializeEnhancedPageManager() {
    if (enhancedPageManager) {
        console.warn('Enhanced PageManager уже инициализирован');
        return enhancedPageManager;
    }

    try {
        // Создаем экземпляр Enhanced PageManager
        enhancedPageManager = new EnhancedPageManager();

        // Инициализируем его
        await enhancedPageManager.init();

        // Делаем доступным глобально для совместимости
        window.pageManager = enhancedPageManager;
        window.enhancedPageManager = enhancedPageManager;

        console.log('✅ Enhanced PageManager успешно инициализирован');
        return enhancedPageManager;

    } catch (error) {
        console.error('❌ Ошибка инициализации Enhanced PageManager:', error);
        throw error;
    }
}

// Обновляем существующие классы для интеграции с Enhanced PageManager

// Обновление SPANavigator для работы с Enhanced PageManager
if (window.SPANavigator) {
    const originalNavigateTo = SPANavigator.prototype.navigateTo;

    SPANavigator.prototype.navigateTo = async function(route, options = {}) {
        console.log(`🧭 SPANavigator: навигация к "${route}"`);

        try {
            // Вызываем оригинальную логику навигации
            const success = await originalNavigateTo.call(this, route, options);

            if (success && enhancedPageManager) {
                // Загружаем страницу через Enhanced PageManager
                await enhancedPageManager.loadPage(route, {
                    skipTransition: options.skipHistory
                });
            }

            return success;

        } catch (error) {
            console.error(`❌ Ошибка навигации SPANavigator к "${route}":`, error);
            return false;
        }
    };
}

// Обновление IPRoastSPAApp для использования Enhanced PageManager
if (window.IPRoastSPAApp) {
    const originalInitializeComponentManagers = IPRoastSPAApp.prototype.initializeComponentManagers;

    IPRoastSPAApp.prototype.initializeComponentManagers = async function() {
        // Вызываем оригинальный метод
        await originalInitializeComponentManagers.call(this);

        // Инициализируем Enhanced PageManager вместо обычного PageManager
        if (window.EnhancedPageManager) {
            console.log('🔄 Заменяем PageManager на Enhanced PageManager');

            // Уничтожаем старый PageManager если есть
            if (this.components.pageManager) {
                try {
                    await this.components.pageManager.destroy();
                } catch (error) {
                    console.warn('⚠️ Ошибка уничтожения старого PageManager:', error);
                }
            }

            // Создаем и инициализируем Enhanced PageManager
            this.components.pageManager = await initializeEnhancedPageManager();

            console.log('✅ Enhanced PageManager интегрирован в IPRoastSPAApp');
        }
    };
}

// Функция для замены существующего PageManager
async function upgradeToEnhancedPageManager() {
    console.log('🔄 Обновление до Enhanced PageManager...');

    try {
        // Проверяем, есть ли уже инициализированное приложение
        if (window.app && window.app.components && window.app.components.pageManager) {
            // Уничтожаем старый PageManager
            if (window.app.components.pageManager.destroy) {
                await window.app.components.pageManager.destroy();
            }

            // Заменяем на Enhanced PageManager
            window.app.components.pageManager = await initializeEnhancedPageManager();

            console.log('✅ Существующий PageManager заменен на Enhanced PageManager');
        } else {
            // Просто инициализируем Enhanced PageManager
            await initializeEnhancedPageManager();
        }

        return true;

    } catch (error) {
        console.error('❌ Ошибка обновления до Enhanced PageManager:', error);
        return false;
    }
}

// Автоматическое обновление при загрузке страницы
document.addEventListener('DOMContentLoaded', async () => {
    // Ждем немного для инициализации других компонентов
    setTimeout(async () => {
        if (window.EnhancedPageManager && !enhancedPageManager) {
            await upgradeToEnhancedPageManager();
        }
    }, 1000);
});

// Утилиты для работы с Enhanced PageManager

/**
 * Безопасная загрузка страницы
 */
window.loadPage = async function(pageId, options = {}) {
    if (enhancedPageManager) {
        return await enhancedPageManager.loadPage(pageId, options);
    } else {
        console.warn('Enhanced PageManager не инициализирован');
        return false;
    }
};

/**
 * Предварительная загрузка страницы
 */
window.preloadPage = async function(pageId) {
    if (enhancedPageManager) {
        return await enhancedPageManager.preloadPage(pageId);
    } else {
        console.warn('Enhanced PageManager не инициализирован');
        return false;
    }
};

/**
 * Очистка кэша страниц
 */
window.clearPageCache = function() {
    if (enhancedPageManager) {
        enhancedPageManager.clearCache();
        console.log('✅ Кэш страниц очищен');
    } else {
        console.warn('Enhanced PageManager не инициализирован');
    }
};

/**
 * Получение статистики кэша
 */
window.getPageCacheStats = function() {
    if (enhancedPageManager) {
        return enhancedPageManager.getCacheStats();
    } else {
        console.warn('Enhanced PageManager не инициализирован');
        return null;
    }
};

// Экспорт функций
window.initializeEnhancedPageManager = initializeEnhancedPageManager;
window.upgradeToEnhancedPageManager = upgradeToEnhancedPageManager;

console.log('✅ Интеграционный код Enhanced PageManager загружен');