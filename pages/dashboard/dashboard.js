/**
 * pages/dashboard/dashboard.js - IP Roast Enterprise Dashboard JavaScript
 * Версия: 4.0
 * Описание: Продвинутая функциональность панели управления
 */

class IPRoastDashboard {
    constructor() {
        this.config = {
            updateInterval: 30000, // 30 секунд
            chartAnimationDuration: 750,
            maxActivityItems: 50,
            autoRefresh: true,
            theme: 'light'
        };

        this.state = {
            isLoading: false,
            lastUpdate: null,
            selectedPeriod: '24h',
            charts: {},
            realTimeData: {},
            connectionStatus: 'connected'
        };

        this.eventListeners = new Map();
        this.updateTimer = null;
        this.chartInstances = new Map();

        this.init();
    }

    /**
     * Инициализация панели управления
     */
    async init() {
        try {
            console.log('🚀 Инициализация IP Roast Dashboard...');

            // Загружаем зависимости
            await this.loadDependencies();

            // Находим элементы DOM
            this.findElements();

            // Настраиваем обработчики событий
            this.setupEventListeners();

            // Загружаем начальные данные
            await this.loadInitialData();

            // Инициализируем графики
            this.initializeCharts();

            // Запускаем автообновление
            this.startAutoRefresh();

            // Инициализируем реал-тайм обновления
            this.initializeRealTime();

            console.log('✅ Dashboard успешно инициализирован');

        } catch (error) {
            console.error('❌ Ошибка инициализации Dashboard:', error);
            this.showErrorNotification('Ошибка инициализации панели управления');
        }
    }

    /**
     * Загрузка внешних зависимостей
     */
    async loadDependencies() {
        // Chart.js уже должен быть загружен в основном приложении
        if (typeof Chart === 'undefined') {
            console.warn('⚠️ Chart.js не найден, загружаем...');
            await this.loadScript('https://cdn.jsdelivr.net/npm/chart.js');
        }

        // Проверяем другие зависимости
        if (typeof moment !== 'undefined') {
            Chart.register(moment);
        }

        console.log('📦 Зависимости загружены');
    }

    /**
     * Поиск элементов DOM
     */
    findElements() {
        this.elements = {
            // Основные контейнеры
            dashboard: document.querySelector('.dashboard'),
            header: document.querySelector('.dashboard-header'),
            controls: document.querySelector('.dashboard-controls'),

            // Контролы
            autoRefreshToggle: document.querySelector('.toggle-switch'),
            periodSelector: document.querySelector('.period-dropdown'),
            refreshButton: document.querySelector('.refresh-button'),

            // Метрики
            metricsGrid: document.querySelector('.metrics-grid'),
            metricCards: document.querySelectorAll('.metric-card'),

            // Графики
            networkChart: document.querySelector('#network-activity-chart'),
            vulnerabilityChart: document.querySelector('#vulnerability-chart'),
            topologyChart: document.querySelector('#topology-chart'),

            // Таблицы
            scansTable: document.querySelector('#recent-scans-table'),
            devicesTable: document.querySelector('#active-devices-table'),

            // Лента активности
            activityFeed: document.querySelector('.activity-feed'),

            // Статус элементы
            systemStatus: document.querySelector('.system-status'),
            statusIndicator: document.querySelector('.status-indicator'),
            lastUpdate: document.querySelector('.last-update-time')
        };

        console.log('🔍 DOM элементы найдены');
    }

    /**
     * Настройка обработчиков событий
     */
    setupEventListeners() {
        // Автообновление
        if (this.elements.autoRefreshToggle) {
            this.elements.autoRefreshToggle.addEventListener('click', () => {
                this.toggleAutoRefresh();
            });
        }

        // Селектор периода
        if (this.elements.periodSelector) {
            this.elements.periodSelector.addEventListener('change', (e) => {
                this.changePeriod(e.target.value);
            });
        }

        // Кнопка обновления
        if (this.elements.refreshButton) {
            this.elements.refreshButton.addEventListener('click', () => {
                this.manualRefresh();
            });
        }

        // Карточки метрик
        this.elements.metricCards.forEach(card => {
            card.addEventListener('click', (e) => {
                const metric = card.dataset.metric;
                this.showMetricDetails(metric);
            });
        });

        // Глобальные события
        window.addEventListener('resize', this.debounce(() => {
            this.handleResize();
        }, 250));

        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });

        // Кастомные события
        document.addEventListener('dashboard-theme-changed', (e) => {
            this.handleThemeChange(e.detail.theme);
        });

        console.log('⚡ Обработчики событий настроены');
    }

    /**
     * Загрузка начальных данных
     */
    async loadInitialData() {
        this.showLoading(true);

        try {
            // Имитация загрузки данных (в реальном приложении это будут API вызовы)
            const [metricsData, chartsData, tableData, activityData] = await Promise.all([
                this.fetchMetricsData(),
                this.fetchChartsData(),
                this.fetchTableData(),
                this.fetchActivityData()
            ]);

            // Обновляем интерфейс
            this.updateMetrics(metricsData);
            this.updateChartData(chartsData);
            this.updateTables(tableData);
            this.updateActivityFeed(activityData);

            this.state.lastUpdate = new Date();
            this.updateLastUpdateTime();

        } catch (error) {
            console.error('❌ Ошибка загрузки данных:', error);
            this.showErrorNotification('Ошибка загрузки данных');
        } finally {
            this.showLoading(false);
        }
    }

    /**
     * Получение данных метрик (заглушка)
     */
    async fetchMetricsData() {
        // Имитация API вызова
        await this.delay(500);

        return {
            security: {
                score: Math.floor(Math.random() * 15) + 85,
                trend: Math.floor(Math.random() * 10) - 5,
                status: 'Система защищена'
            },
            network: {
                devices: Math.floor(Math.random() * 50) + 200,
                trend: Math.floor(Math.random() * 20) - 10,
                status: 'в сети обнаружено'
            },
            vulnerabilities: {
                critical: Math.floor(Math.random() * 20) + 5,
                trend: Math.floor(Math.random() * 10) - 5,
                status: 'требуют внимания'
            },
            scans: {
                completed: Math.floor(Math.random() * 30) + 70,
                trend: Math.floor(Math.random() * 20) + 5,
                status: 'завершено сегодня'
            }
        };
    }

    /**
     * Получение данных для графиков (заглушка)
     */
    async fetchChartsData() {
        await this.delay(300);

        const hours = Array.from({ length: 24 }, (_, i) => {
            const hour = new Date();
            hour.setHours(hour.getHours() - (23 - i));
            return hour.toISOString();
        });

        return {
            networkActivity: {
                labels: hours,
                datasets: [
                    {
                        label: 'Входящий трафик',
                        data: hours.map(() => Math.floor(Math.random() * 1000) + 500),
                        borderColor: '#3B82F6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.4
                    },
                    {
                        label: 'Исходящий трафик',
                        data: hours.map(() => Math.floor(Math.random() * 800) + 300),
                        borderColor: '#10B981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.4
                    },
                    {
                        label: 'Подозрительная активность',
                        data: hours.map(() => Math.floor(Math.random() * 50) + 10),
                        borderColor: '#EF4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        tension: 0.4
                    }
                ]
            },
            vulnerabilities: {
                labels: ['Критические', 'Высокий приоритет', 'Средний приоритет', 'Низкий приоритет'],
                datasets: [{
                    data: [12, 45, 128, 234],
                    backgroundColor: ['#EF4444', '#F59E0B', '#06B6D4', '#10B981'],
                    borderWidth: 0
                }]
            }
        };
    }

    /**
     * Инициализация графиков
     */
    initializeCharts() {
        // График сетевой активности
        if (this.elements.networkChart) {
            this.initNetworkActivityChart();
        }

        // График уязвимостей
        if (this.elements.vulnerabilityChart) {
            this.initVulnerabilityChart();
        }

        // График топологии сети
        if (this.elements.topologyChart) {
            this.initTopologyChart();
        }

        console.log('📊 Графики инициализированы');
    }

    /**
     * Инициализация графика сетевой активности
     */
    initNetworkActivityChart() {
        const ctx = this.elements.networkChart.getContext('2d');

        const config = {
            type: 'line',
            data: {
                labels: [],
                datasets: []
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 20
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: '#3B82F6',
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: true
                    }
                },
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'hour',
                            displayFormats: {
                                hour: 'HH:mm'
                            }
                        },
                        title: {
                            display: true,
                            text: 'Время'
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Трафик (Mbps)'
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    }
                },
                elements: {
                    point: {
                        radius: 4,
                        hoverRadius: 6
                    },
                    line: {
                        borderWidth: 2
                    }
                },
                animation: {
                    duration: this.config.chartAnimationDuration,
                    easing: 'easeInOutQuart'
                }
            }
        };

        this.chartInstances.set('networkActivity', new Chart(ctx, config));
    }

    /**
     * Инициализация графика уязвимостей
     */
    initVulnerabilityChart() {
        const ctx = this.elements.vulnerabilityChart.getContext('2d');

        const config = {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: []
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                const label = context.label || '';
                                const value = context.parsed;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                },
                cutout: '60%',
                animation: {
                    animateRotate: true,
                    duration: this.config.chartAnimationDuration
                }
            }
        };

        this.chartInstances.set('vulnerability', new Chart(ctx, config));
    }

    /**
     * Обновление данных графиков
     */
    updateChartData(chartsData) {
        // Обновляем график сетевой активности
        const networkChart = this.chartInstances.get('networkActivity');
        if (networkChart && chartsData.networkActivity) {
            networkChart.data = chartsData.networkActivity;
            networkChart.update('none');
        }

        // Обновляем график уязвимостей
        const vulnChart = this.chartInstances.get('vulnerability');
        if (vulnChart && chartsData.vulnerabilities) {
            vulnChart.data = chartsData.vulnerabilities;
            vulnChart.update('none');
        }
    }

    /**
     * Обновление метрик
     */
    updateMetrics(metricsData) {
        this.elements.metricCards.forEach(card => {
            const metricType = card.dataset.metric;
            const metric = metricsData[metricType];

            if (metric) {
                const valueElement = card.querySelector('.metric-value');
                const trendElement = card.querySelector('.metric-trend');
                const descElement = card.querySelector('.metric-description');

                if (valueElement) {
                    this.animateValue(valueElement, parseInt(valueElement.textContent), metric.score || metric.devices || metric.critical || metric.completed);
                }

                if (trendElement) {
                    this.updateTrend(trendElement, metric.trend);
                }

                if (descElement) {
                    descElement.textContent = metric.status;
                }
            }
        });
    }

    /**
     * Анимация изменения значения
     */
    animateValue(element, start, end) {
        const duration = 1000;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            const current = Math.round(start + (end - start) * this.easeOutQuart(progress));
            element.textContent = current.toLocaleString();

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    /**
     * Обновление индикатора тренда
     */
    updateTrend(element, value) {
        const icon = element.querySelector('.trend-icon');
        const text = element.querySelector('.trend-text');

        element.className = 'metric-trend';

        if (value > 0) {
            element.classList.add('trend-positive');
            if (icon) icon.textContent = '↗';
            if (text) text.textContent = `+${value}% за неделю`;
        } else if (value < 0) {
            element.classList.add('trend-negative');
            if (icon) icon.textContent = '↘';
            if (text) text.textContent = `${value}% за неделю`;
        } else {
            element.classList.add('trend-neutral');
            if (icon) icon.textContent = '→';
            if (text) text.textContent = 'Без изменений';
        }
    }

    /**
     * Автообновление данных
     */
    startAutoRefresh() {
        if (this.config.autoRefresh) {
            this.updateTimer = setInterval(() => {
                this.refreshData();
            }, this.config.updateInterval);

            console.log(`🔄 Автообновление запущено (${this.config.updateInterval}ms)`);
        }
    }

    stopAutoRefresh() {
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
            this.updateTimer = null;
            console.log('⏹️ Автообновление остановлено');
        }
    }

    toggleAutoRefresh() {
        this.config.autoRefresh = !this.config.autoRefresh;
        const toggle = this.elements.autoRefreshToggle;

        if (toggle) {
            toggle.classList.toggle('active', this.config.autoRefresh);
        }

        if (this.config.autoRefresh) {
            this.startAutoRefresh();
        } else {
            this.stopAutoRefresh();
        }

        this.showNotification(
            this.config.autoRefresh ? 'Автообновление включено' : 'Автообновление отключено',
            'info'
        );
    }

    /**
     * Ручное обновление
     */
    async manualRefresh() {
        const button = this.elements.refreshButton;
        if (button) {
            button.classList.add('loading');
            button.disabled = true;
        }

        try {
            await this.refreshData();
            this.showNotification('Данные обновлены', 'success');
        } catch (error) {
            console.error('Ошибка обновления:', error);
            this.showNotification('Ошибка при обновлении данных', 'error');
        } finally {
            if (button) {
                button.classList.remove('loading');
                button.disabled = false;
            }
        }
    }

    /**
     * Основная функция обновления данных
     */
    async refreshData() {
        if (this.state.isLoading) {
            console.log('⏳ Обновление уже в процессе');
            return;
        }

        try {
            this.state.isLoading = true;

            // Загружаем новые данные
            const [metricsData, chartsData] = await Promise.all([
                this.fetchMetricsData(),
                this.fetchChartsData()
            ]);

            // Обновляем интерфейс
            this.updateMetrics(metricsData);
            this.updateChartData(chartsData);

            this.state.lastUpdate = new Date();
            this.updateLastUpdateTime();

        } catch (error) {
            throw error;
        } finally {
            this.state.isLoading = false;
        }
    }

    /**
     * Обновление времени последнего обновления
     */
    updateLastUpdateTime() {
        if (this.elements.lastUpdate && this.state.lastUpdate) {
            const timeString = this.state.lastUpdate.toLocaleTimeString('ru-RU');
            this.elements.lastUpdate.textContent = timeString;
        }
    }

    /**
     * Обработка изменения видимости страницы
     */
    handleVisibilityChange() {
        if (document.hidden) {
            // Страница скрыта - приостанавливаем обновления
            this.stopAutoRefresh();
        } else {
            // Страница видима - возобновляем обновления и обновляем данные
            if (this.config.autoRefresh) {
                this.startAutoRefresh();
                this.refreshData();
            }
        }
    }

    /**
     * Обработка изменения размера окна
     */
    handleResize() {
        // Перерисовываем графики при изменении размера
        this.chartInstances.forEach(chart => {
            chart.resize();
        });
    }

    /**
     * Показ уведомлений
     */
    showNotification(message, type = 'info') {
        // Используем глобальную систему уведомлений если доступна
        if (window.notify) {
            window.notify[type](message);
        } else {
            // Fallback - простое уведомление
            console.log(`📢 ${type.toUpperCase()}: ${message}`);
        }
    }

    showErrorNotification(message) {
        this.showNotification(message, 'error');
    }

    /**
     * Показ/скрытие индикатора загрузки
     */
    showLoading(show) {
        if (this.elements.dashboard) {
            this.elements.dashboard.classList.toggle('loading', show);
        }
    }

    /**
     * Утилитарные функции
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    easeOutQuart(t) {
        return 1 - (--t) * t * t * t;
    }

    async loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    /**
     * Уничтожение экземпляра
     */
    destroy() {
        // Останавливаем таймеры
        this.stopAutoRefresh();

        // Уничтожаем графики
        this.chartInstances.forEach(chart => {
            chart.destroy();
        });
        this.chartInstances.clear();

        // Удаляем обработчики событий
        this.eventListeners.clear();

        console.log('🗑️ Dashboard уничтожен');
    }
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    // Создаем экземпляр dashboard только если мы на странице dashboard
    if (document.querySelector('.dashboard')) {
        window.ipRoastDashboard = new IPRoastDashboard();

        // Добавляем в глобальную область для отладки
        if (window.ipRoastApp) {
            window.ipRoastApp.dashboard = window.ipRoastDashboard;
        }
    }
});

// Экспортируем класс
window.IPRoastDashboard = IPRoastDashboard;

console.log('✅ Dashboard модуль загружен');
