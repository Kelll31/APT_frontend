/**
 * IP Roast Frontend - Overview Widget
 * Виджет обзора статистики для корпоративной платформы кибербезопасности
 * Версия: Enterprise 1.0
 */

import { formatNumber, formatFileSize, formatDate, timeAgo, addClass, removeClass, generateUUID, deepClone } from '../shared/utils/helpers.js';
import { RISK_LEVELS, SCAN_STATUS, DEVICE_STATUS, ANIMATION_DURATION, NOTIFICATION_TYPES, THEMES } from '../shared/utils/constants.js';
import { IPRoastAPI } from '../shared/utils/api.js';

/**
 * Виджет обзора статистики дашборда
 */
export class OverviewWidget {
    constructor(options = {}) {
        this.options = {
            container: null,
            autoUpdate: true,
            updateInterval: 30000,
            showAnimations: true,
            showTrends: true,
            maxChartPoints: 50,
            onStatsUpdate: null,
            onError: null,
            ...options
        };

        // Состояние виджета
        this.state = {
            isInitialized: false,
            isLoading: false,
            lastUpdate: null,
            stats: {},
            trends: {},
            historicalData: {
                scans: [],
                devices: [],
                vulnerabilities: [],
                threats: []
            }
        };

        // Интервалы и таймеры
        this.intervals = new Map();
        this.animations = new Map();

        // Графики
        this.charts = new Map();

        // ID виджета
        this.widgetId = generateUUID();

        this.init();
    }

    /**
     * Инициализация виджета
     */
    async init() {
        try {
            if (!this.options.container) {
                throw new Error('Контейнер не указан');
            }

            await this.createWidgetStructure();
            await this.initializeCharts();
            await this.loadInitialData();
            this.setupEventHandlers();

            if (this.options.autoUpdate) {
                this.startAutoUpdate();
            }

            this.state.isInitialized = true;
            console.log('Overview widget инициализирован');

        } catch (error) {
            console.error('Ошибка инициализации Overview widget:', error);
            if (this.options.onError) {
                this.options.onError(error);
            }
        }
    }

    /**
     * Создание структуры виджета
     */
    async createWidgetStructure() {
        const container = this.options.container;
        container.innerHTML = `
            <div class="dashboard-overview" id="overview-${this.widgetId}">
                <!-- KPI Карточки -->
                <div class="kpi-card" id="kpi-devices">
                    <div class="kpi-header">
                        <h3 class="kpi-title">Сетевые устройства</h3>
                        <div class="kpi-icon network">
                            <i class="fas fa-desktop"></i>
                        </div>
                    </div>
                    <div class="kpi-content">
                        <div class="kpi-value">0</div>
                        <div class="kpi-label">Устройств в сети</div>
                        <div class="kpi-description">Активные и неактивные устройства</div>
                    </div>
                    <div class="kpi-footer">
                        <div class="kpi-trend neutral">
                            <span class="trend-arrow">→</span>
                            <span>0%</span>
                        </div>
                        <div class="kpi-period">24ч</div>
                    </div>
                </div>

                <div class="kpi-card" id="kpi-scans">
                    <div class="kpi-header">
                        <h3 class="kpi-title">Активные сканирования</h3>
                        <div class="kpi-icon performance">
                            <i class="fas fa-search"></i>
                        </div>
                    </div>
                    <div class="kpi-content">
                        <div class="kpi-value">0</div>
                        <div class="kpi-label">Сканирований</div>
                        <div class="kpi-description">Выполняющиеся процессы</div>
                    </div>
                    <div class="kpi-footer">
                        <div class="kpi-trend neutral">
                            <span class="trend-arrow">→</span>
                            <span>0%</span>
                        </div>
                        <div class="kpi-period">24ч</div>
                    </div>
                </div>

                <div class="kpi-card" id="kpi-vulnerabilities">
                    <div class="kpi-header">
                        <h3 class="kpi-title">Критические уязвимости</h3>
                        <div class="kpi-icon security">
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                    </div>
                    <div class="kpi-content">
                        <div class="kpi-value">0</div>
                        <div class="kpi-label">Уязвимостей</div>
                        <div class="kpi-description">Требуют немедленного внимания</div>
                    </div>
                    <div class="kpi-footer">
                        <div class="kpi-trend neutral">
                            <span class="trend-arrow">→</span>
                            <span>0%</span>
                        </div>
                        <div class="kpi-period">24ч</div>
                    </div>
                </div>

                <div class="kpi-card" id="kpi-security">
                    <div class="kpi-header">
                        <h3 class="kpi-title">Уровень безопасности</h3>
                        <div class="kpi-icon security">
                            <i class="fas fa-shield-alt"></i>
                        </div>
                    </div>
                    <div class="kpi-content">
                        <div class="kpi-value">100%</div>
                        <div class="kpi-label">Общий уровень</div>
                        <div class="kpi-description">Оценка на основе уязвимостей</div>
                    </div>
                    <div class="kpi-footer">
                        <div class="kpi-trend neutral">
                            <span class="trend-arrow">→</span>
                            <span>0%</span>
                        </div>
                        <div class="kpi-period">24ч</div>
                    </div>
                </div>
            </div>

            <!-- Графики -->
            <div class="overview-charts">
                <div class="chart-section">
                    <h3>График активности</h3>
                    <div id="activity-chart" class="chart-container">
                        <div class="chart-loading">
                            <div class="chart-spinner"></div>
                            <p>Загрузка данных...</p>
                        </div>
                    </div>
                </div>

                <div class="chart-section">
                    <h3>Тренды</h3>
                    <div id="trends-chart" class="chart-container">
                        <div class="chart-loading">
                            <div class="chart-spinner"></div>
                            <p>Загрузка трендов...</p>
                        </div>
                    </div>
                </div>

                <div class="chart-section">
                    <h3>Распределение уязвимостей</h3>
                    <div id="distribution-chart" class="chart-container">
                        <div class="chart-loading">
                            <div class="chart-spinner"></div>
                            <p>Загрузка распределения...</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Инициализация графиков
     */
    async initializeCharts() {
        console.log('📊 Инициализация графиков');
        // Графики инициализируются при получении данных
    }

    /**
     * Загрузка начальных данных
     */
    async loadInitialData() {
        try {
            this.state.isLoading = true;
            await this.loadStats();
            await this.loadHistoricalData();
        } catch (error) {
            console.error('Ошибка загрузки данных Overview widget:', error);
            if (this.options.onError) {
                this.options.onError(error);
            }
        } finally {
            this.state.isLoading = false;
        }
    }

    /**
     * Загрузка статистики
     */
    async loadStats() {
        try {
            const response = await IPRoastAPI.analytics.getDashboardStats();
            const stats = response.data || response;

            this.state.stats = stats;
            this.state.lastUpdate = new Date();

            await this.updateStats(stats);

            if (this.options.onStatsUpdate) {
                this.options.onStatsUpdate(stats);
            }

        } catch (error) {
            console.error('Ошибка загрузки статистики:', error);
            throw error;
        }
    }

    /**
     * Обновление статистики
     */
    async updateStats(stats) {
        try {
            console.log('📊 Обновление статистики:', stats);

            // Проверяем наличие данных
            if (!stats || typeof stats !== 'object') {
                console.warn('Статистика отсутствует или некорректна');
                stats = this.getDefaultStats();
            }

            // Обновляем KPI карточки
            this.updateKPICards(stats);

            // Обновляем графики
            await this.updateCharts(stats);

            // Сохраняем данные в состояние
            this.state.stats = stats;
            this.state.lastUpdate = new Date();

        } catch (error) {
            console.error('Ошибка обновления статистики:', error);
            throw error;
        }
    }

    /**
     * Обновление KPI карточек
     */
    updateKPICards(stats) {
        try {
            console.log('📊 Обновление KPI карточек:', stats);

            // Безопасное получение данных с fallback значениями
            const devices = stats.devices || { total: 0, active: 0, inactive: 0 };
            const scans = stats.scans || { total: 0, running: 0, completed: 0 };
            const vulnerabilities = stats.vulnerabilities || { total: 0, critical: 0, high: 0, medium: 0, low: 0 };
            const trends = stats.trends || {};

            // Обновляем карточку устройств
            this.updateKPICard('devices', {
                value: devices.total,
                label: 'Устройств в сети',
                trend: trends.devices_trend || '0%',
                icon: 'fas fa-desktop',
                type: 'network'
            });

            // Обновляем карточку сканирований
            this.updateKPICard('scans', {
                value: scans.running,
                label: 'Активных сканирований',
                trend: trends.scans_trend || '0%',
                icon: 'fas fa-search',
                type: 'performance'
            });

            // Обновляем карточку уязвимостей
            this.updateKPICard('vulnerabilities', {
                value: vulnerabilities.critical,
                label: 'Критических уязвимостей',
                trend: trends.vulnerabilities_trend || '0%',
                icon: 'fas fa-exclamation-triangle',
                type: 'security'
            });

            // Обновляем карточку общей безопасности
            const securityScore = this.calculateSecurityScore(vulnerabilities);
            this.updateKPICard('security', {
                value: securityScore + '%',
                label: 'Уровень безопасности',
                trend: '0%',
                icon: 'fas fa-shield-alt',
                type: 'security'
            });

        } catch (error) {
            console.error('Ошибка обновления KPI карточек:', error);
        }
    }

    /**
     * Обновление отдельной KPI карточки
     */
    updateKPICard(cardId, data) {
        try {
            const card = document.querySelector(`#kpi-${cardId}`);
            if (!card) {
                console.warn(`KPI карточка ${cardId} не найдена`);
                return;
            }

            // Обновляем значение
            const valueElement = card.querySelector('.kpi-value');
            if (valueElement) {
                valueElement.textContent = data.value;
            }

            // Обновляем лейбл
            const labelElement = card.querySelector('.kpi-label');
            if (labelElement) {
                labelElement.textContent = data.label;
            }

            // Обновляем тренд
            const trendElement = card.querySelector('.kpi-trend');
            if (trendElement && data.trend) {
                trendElement.textContent = data.trend;
                trendElement.className = `kpi-trend ${this.getTrendClass(data.trend)}`;
            }

            // Обновляем иконку
            const iconElement = card.querySelector('.kpi-icon i');
            if (iconElement && data.icon) {
                iconElement.className = data.icon;
            }

            // Обновляем тип карточки
            if (data.type) {
                const iconContainer = card.querySelector('.kpi-icon');
                if (iconContainer) {
                    iconContainer.className = `kpi-icon ${data.type}`;
                }
            }

        } catch (error) {
            console.error(`Ошибка обновления KPI карточки ${cardId}:`, error);
        }
    }

    /**
     * Получение класса для тренда
     */
    getTrendClass(trend) {
        if (!trend || trend === '0%') return 'neutral';
        if (trend.startsWith('+')) return 'positive';
        if (trend.startsWith('-')) return 'negative';
        return 'neutral';
    }

    /**
     * Расчет общего уровня безопасности
     */
    calculateSecurityScore(vulnerabilities) {
        if (!vulnerabilities) return 100;

        const { critical = 0, high = 0, medium = 0, low = 0, total = 0 } = vulnerabilities;

        if (total === 0) return 100;

        // Весовые коэффициенты для разных уровней уязвимостей
        const weights = { critical: 10, high: 5, medium: 2, low: 1 };
        const maxPossibleScore = total * weights.critical;
        const actualScore = (critical * weights.critical) + (high * weights.high) +
            (medium * weights.medium) + (low * weights.low);

        const securityScore = Math.max(0, 100 - Math.round((actualScore / maxPossibleScore) * 100));
        return securityScore;
    }

    /**
     * Получение данных статистики по умолчанию
     */
    getDefaultStats() {
        return {
            devices: {
                total: 0,
                active: 0,
                inactive: 0
            },
            scans: {
                total: 0,
                running: 0,
                completed: 0
            },
            vulnerabilities: {
                total: 0,
                critical: 0,
                high: 0,
                medium: 0,
                low: 0
            },
            activity: [],
            trends: {}
        };
    }

    /**
     * Загрузка исторических данных
     */
    async loadHistoricalData() {
        try {
            // Загрузка данных активности
            const activityResponse = await IPRoastAPI.analytics.getActivityFeed({ limit: 5 });
            const activityData = activityResponse.data || activityResponse || [];

            this.state.historicalData.activity = activityData;

            // Обновляем графики
            await this.updateCharts(this.state.stats || {});

        } catch (error) {
            console.error('Ошибка загрузки исторических данных:', error);
        }
    }

    /**
     * Обновление графиков (исправленная версия)
     */
    updateCharts(stats) {
        try {
            console.log('📈 Обновление графиков:', stats);

            // Безопасное обновление графиков с проверкой данных
            const activityData = (stats && stats.activity) ? stats.activity : [];
            const trendsData = (stats && stats.trends) ? stats.trends : {};
            const vulnerabilitiesData = (stats && stats.vulnerabilities) ? stats.vulnerabilities : {};

            Promise.allSettled([
                this.updateActivityChart(activityData),
                this.updateTrendsChart(trendsData),
                this.updateDistributionChart(vulnerabilitiesData)
            ]).then(results => {
                results.forEach((result, index) => {
                    if (result.status === 'rejected') {
                        console.warn(`График ${index} не удалось обновить:`, result.reason);
                    }
                });
            });

        } catch (error) {
            console.error('Ошибка обновления графиков:', error);
        }
    }

    /**
     * Обновление графика активности
     */
    updateActivityChart(activityData) {
        try {
            console.log('📈 Обновление графика активности:', activityData);

            // Проверяем наличие данных
            if (!activityData || !Array.isArray(activityData)) {
                console.warn('Данные активности отсутствуют или некорректны');
                activityData = [];
            }

            const chartContainer = document.querySelector('#activity-chart');
            if (!chartContainer) {
                console.warn('Контейнер графика активности не найден');
                return;
            }

            // Если данных нет, показываем заглушку
            if (activityData.length === 0) {
                chartContainer.innerHTML = `
                    <div class="chart-empty">
                        <i class="fas fa-chart-line"></i>
                        <p>Нет данных для отображения</p>
                    </div>
                `;
                return;
            }

            // Простая визуализация активности
            const activityHTML = activityData.map(item => `
                <div class="activity-item">
                    <span class="activity-time">${formatDate(item.timestamp || new Date())}</span>
                    <span class="activity-type">${item.type || 'event'}</span>
                    <span class="activity-count">${item.count || 0}</span>
                </div>
            `).join('');

            chartContainer.innerHTML = `
                <div class="activity-container">
                    ${activityHTML}
                </div>
            `;

        } catch (error) {
            console.error('Ошибка обновления графика активности:', error);
            this.showChartError('activity-chart', 'Ошибка загрузки графика активности');
        }
    }

    /**
     * Обновление графика трендов
     */
    updateTrendsChart(trendsData) {
        try {
            console.log('📊 Обновление графика трендов:', trendsData);

            const chartContainer = document.querySelector('#trends-chart');
            if (!chartContainer) {
                console.warn('Контейнер графика трендов не найден');
                return;
            }

            if (!trendsData || Object.keys(trendsData).length === 0) {
                chartContainer.innerHTML = `
                    <div class="chart-empty">
                        <i class="fas fa-chart-bar"></i>
                        <p>Нет данных трендов</p>
                    </div>
                `;
                return;
            }

            // Простая визуализация трендов
            const trendsHTML = Object.entries(trendsData).map(([key, value]) => `
                <div class="trend-item">
                    <span class="trend-label">${this.getTrendLabel(key)}</span>
                    <span class="trend-value ${this.getTrendClass(value)}">${value}</span>
                </div>
            `).join('');

            chartContainer.innerHTML = `
                <div class="trends-container">
                    ${trendsHTML}
                </div>
            `;

        } catch (error) {
            console.error('Ошибка обновления графика трендов:', error);
            this.showChartError('trends-chart', 'Ошибка загрузки графика трендов');
        }
    }

    /**
     * Получение читаемого названия тренда
     */
    getTrendLabel(key) {
        const labels = {
            'devices_trend': 'Устройства',
            'scans_trend': 'Сканирования',
            'vulnerabilities_trend': 'Уязвимости',
            'threats_trend': 'Угрозы'
        };
        return labels[key] || key;
    }

    /**
     * Обновление графика распределения
     */
    updateDistributionChart(vulnerabilitiesData) {
        try {
            console.log('🍰 Обновление графика распределения:', vulnerabilitiesData);

            const chartContainer = document.querySelector('#distribution-chart');
            if (!chartContainer) {
                console.warn('Контейнер графика распределения не найден');
                return;
            }

            if (!vulnerabilitiesData || vulnerabilitiesData.total === 0) {
                chartContainer.innerHTML = `
                    <div class="chart-empty">
                        <i class="fas fa-chart-pie"></i>
                        <p>Нет уязвимостей для отображения</p>
                    </div>
                `;
                return;
            }

            // Простая визуализация распределения
            const { critical = 0, high = 0, medium = 0, low = 0, total = 0 } = vulnerabilitiesData;

            const distributionHTML = `
                <div class="distribution-container">
                    <div class="distribution-item critical">
                        <span class="distribution-label">Критические</span>
                        <span class="distribution-value">${critical}</span>
                        <div class="distribution-bar">
                            <div class="distribution-fill" style="width: ${total > 0 ? (critical / total * 100) : 0}%"></div>
                        </div>
                    </div>
                    <div class="distribution-item high">
                        <span class="distribution-label">Высокие</span>
                        <span class="distribution-value">${high}</span>
                        <div class="distribution-bar">
                            <div class="distribution-fill" style="width: ${total > 0 ? (high / total * 100) : 0}%"></div>
                        </div>
                    </div>
                    <div class="distribution-item medium">
                        <span class="distribution-label">Средние</span>
                        <span class="distribution-value">${medium}</span>
                        <div class="distribution-bar">
                            <div class="distribution-fill" style="width: ${total > 0 ? (medium / total * 100) : 0}%"></div>
                        </div>
                    </div>
                    <div class="distribution-item low">
                        <span class="distribution-label">Низкие</span>
                        <span class="distribution-value">${low}</span>
                        <div class="distribution-bar">
                            <div class="distribution-fill" style="width: ${total > 0 ? (low / total * 100) : 0}%"></div>
                        </div>
                    </div>
                </div>
            `;

            chartContainer.innerHTML = distributionHTML;

        } catch (error) {
            console.error('Ошибка обновления графика распределения:', error);
            this.showChartError('distribution-chart', 'Ошибка загрузки графика распределения');
        }
    }

    /**
     * Показать ошибку графика
     */
    showChartError(chartId, message) {
        const chartContainer = document.getElementById(chartId);
        if (chartContainer) {
            chartContainer.innerHTML = `
                <div class="chart-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>${message}</p>
                    <button class="btn btn-sm btn-secondary" onclick="location.reload()">
                        Обновить
                    </button>
                </div>
            `;
        }
    }

    /**
     * Настройка обработчиков событий
     */
    setupEventHandlers() {
        // Обработчики событий при необходимости
    }

    /**
     * Запуск автообновления
     */
    startAutoUpdate() {
        if (this.intervals.has('autoUpdate')) return;

        const interval = setInterval(async () => {
            try {
                await this.loadStats();
            } catch (error) {
                console.error('Ошибка автообновления:', error);
            }
        }, this.options.updateInterval);

        this.intervals.set('autoUpdate', interval);
    }

    /**
     * Остановка автообновления
     */
    stopAutoUpdate() {
        if (this.intervals.has('autoUpdate')) {
            clearInterval(this.intervals.get('autoUpdate'));
            this.intervals.delete('autoUpdate');
        }
    }

    /**
     * Уничтожение виджета
     */
    destroy() {
        this.stopAutoUpdate();
        this.intervals.forEach(interval => clearInterval(interval));
        this.intervals.clear();
        this.state.isInitialized = false;
    }
}
