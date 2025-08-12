// Dashboard page JavaScript
console.log('📊 Dashboard page loaded');

// Инициализация данных страницы
function initDashboard() {
    console.log('🚀 Инициализация Dashboard');

    // Загрузка статистики
    loadDashboardStats();

    // Настройка обновления данных каждые 30 секунд
    const updateInterval = setInterval(updateDashboardStats, 30000);

    // Сохраняем интервал для очистки
    window.dashboardUpdateInterval = updateInterval;

    // Обновляем время последней проверки
    updateLastCheckTime();
}

function loadDashboardStats() {
    // Симуляция загрузки данных
    const stats = {
        activeScans: Math.floor(Math.random() * 10) + 1,
        threats: Math.floor(Math.random() * 15) + 1,
        systemStatus: Math.random() > 0.2 ? 'success' : 'warning'
    };

    // Обновляем UI
    document.getElementById('active-scans').textContent = stats.activeScans;
    document.getElementById('threats-count').textContent = stats.threats;

    console.log('📊 Dashboard статистика обновлена', stats);
}

function updateDashboardStats() {
    loadDashboardStats();
    updateLastCheckTime();
}

function updateLastCheckTime() {
    const lastCheckEl = document.getElementById('last-check');
    if (lastCheckEl) {
        lastCheckEl.textContent = 'только что';

        // Постепенно обновляем время
        setTimeout(() => {
            if (lastCheckEl) lastCheckEl.textContent = '1 минуту назад';
        }, 60000);

        setTimeout(() => {
            if (lastCheckEl) lastCheckEl.textContent = '2 минуты назад';
        }, 120000);
    }
}

// Тестирование всех страниц
window.testAllPages = async function() {
    if (window.testPageLoad) {
        await window.testPageLoad();
    } else {
        console.warn('testPageLoad function not available');
    }
};

// Инициализация при загрузке страницы
initDashboard();

// Очистка при покидании страницы
if (window.enhancedPageManager) {
    window.enhancedPageManager.on('pageCleanup', (data) => {
        if (data.pageId === 'dashboard') {
            console.log('🧹 Dashboard cleanup');

            // Очищаем интервал
            if (window.dashboardUpdateInterval) {
                clearInterval(window.dashboardUpdateInterval);
                window.dashboardUpdateInterval = null;
            }
        }
    });
}