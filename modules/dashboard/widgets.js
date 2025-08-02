/**
 * IP Roast Frontend - Widgets Library
 * Набор переиспользуемых виджетов для панели дашборда Enterprise версии
 * Версия: Enterprise 1.0
 */

import { $, $$, addClass, removeClass, toggleClass, debounce, throttle, generateUUID, formatNumber, formatDate, timeAgo } from '../../shared/utils/helpers.js';
import { IPRoastAPI } from '../../shared/utils/api.js';
import { NOTIFICATION_TYPES } from '../../shared/utils/constants.js';

/**
 * Базовый класс для всех виджетов
 */
export class BaseWidget {
    constructor(options = {}) {
        this.options = {
            id: generateUUID(),
            container: null,
            title: '',
            icon: '',
            autoUpdate: false,
            updateInterval: 30000,
            ...options
        };

        this.state = {
            isInitialized: false,
            isLoading: false,
            lastUpdate: null
        };

        this.intervals = new Map();
        this.init();
    }

    /**
     * Абстрактный метод инициализации
     */
    async init() {
        if (!this.options.container) {
            throw new Error('Container element is required for widget');
        }
        await this.render();
        this.state.isInitialized = true;
        if (this.options.autoUpdate) {
            this.startAutoUpdate();
        }
    }

    /**
     * Абстрактный метод отрисовки виджета
     */
    async render() {
        // Должен быть переопределён в наследнике
    }

    /**
     * Обновление данных виджета
     */
    async refresh() {
        // Переопределяется при необходимости
    }

    /**
     * Запуск автообновления
     */
    startAutoUpdate() {
        if (this.intervals.has('auto')) return;
        this.intervals.set('auto', setInterval(() => {
            this.refresh();
        }, this.options.updateInterval));
    }

    /**
     * Остановка автообновления
     */
    stopAutoUpdate() {
        if (this.intervals.has('auto')) {
            clearInterval(this.intervals.get('auto'));
            this.intervals.delete('auto');
        }
    }

    /**
     * Очистка ресурсов
     */
    destroy() {
        this.stopAutoUpdate();
        this.intervals.forEach(interval => clearInterval(interval));
        this.intervals.clear();
        this.state.isInitialized = false;
    }
}

/**
 * Widget: DeviceListWidget
 * Список активных устройств сети
 */
export class DeviceListWidget extends BaseWidget {
    async render() {
        const container = this.options.container;
        container.innerHTML = `
            <div class="device-list-widget" id="device-list-${this.options.id}">
                <div class="widget-header">
                    <h3><i class="fas fa-server"></i> Устройства сети</h3>
                    <button class="btn btn--sm btn--secondary" id="refresh-devices-${this.options.id}">
                        <i class="fas fa-sync-alt"></i>
                    </button>
                </div>
                <div class="widget-body custom-scrollbar" id="device-list-body-${this.options.id}"></div>
            </div>`;

        $('#refresh-devices-' + this.options.id).addEventListener('click', () => this.refresh());
        await this.refresh();
    }

    async refresh() {
        try {
            this.state.isLoading = true;
            const result = await IPRoastAPI.devices.getDevices({ status: 'active', limit: 100 });
            const devices = result.items || [];
            this.renderDeviceList(devices);
            this.state.isLoading = false;
            this.state.lastUpdate = new Date();
        } catch (error) {
            console.error('Ошибка получения устройств:', error);
        }
    }

    renderDeviceList(devices) {
        const body = $('#device-list-body-' + this.options.id);
        if (!body) return;

        if (devices.length === 0) {
            body.innerHTML = `<div class="empty-state"><i class="fas fa-server"></i> Нет активных устройств</div>`;
            return;
        }

        const html = devices.map(d => `
            <div class="device-row">
                <div class="device-col device-ip">${d.ip}</div>
                <div class="device-col device-host">${d.hostname || 'N/A'}</div>
                <div class="device-col device-os">${d.os || '—'}</div>
                <div class="device-col device-last">${timeAgo(d.last_seen)}</div>
            </div>`).join('');
        body.innerHTML = html;
    }
}

/**
 * Widget: VulnerabilityWidget
 * Список уязвимостей
 */
export class VulnerabilityWidget extends BaseWidget {
    async render() {
        const container = this.options.container;
        container.innerHTML = `
            <div class="vuln-widget" id="vuln-widget-${this.options.id}">
                <div class="widget-header">
                    <h3><i class="fas fa-shield-virus"></i> Уязвимости</h3>
                    <select class="form-control" id="vuln-severity-${this.options.id}">
                        <option value="all">Все</option>
                        <option value="critical">Критические</option>
                        <option value="high">Высокие</option>
                        <option value="medium">Средние</option>
                    </select>
                </div>
                <div class="widget-body custom-scrollbar" id="vuln-body-${this.options.id}"></div>
            </div>`;

        $('#vuln-severity-' + this.options.id).addEventListener('change', (e) => this.refresh(e.target.value));
        await this.refresh();
    }

    async refresh(severity = 'all') {
        try {
            const params = { limit: 100 };
            if (severity !== 'all') params.severity = severity;
            const result = await IPRoastAPI.vulnerabilities.getVulnerabilities(params);
            const vulns = result.items || [];
            this.renderVulnList(vulns);
        } catch (error) {
            console.error('Ошибка получения уязвимостей:', error);
        }
    }

    renderVulnList(vulns) {
        const body = $('#vuln-body-' + this.options.id);
        if (!body) return;

        if (vulns.length === 0) {
            body.innerHTML = `<div class="empty-state"><i class="fas fa-shield-alt"></i> Нет уязвимостей</div>`;
            return;
        }

        const html = vulns.map(v => `
            <div class="vuln-row vuln-${v.severity}">
                <div class="vuln-sev">${v.severity.toUpperCase()}</div>
                <div class="vuln-title">${v.title}</div>
                <div class="vuln-cve">${v.cve || '—'}</div>
                <div class="vuln-score">${v.cvss_score || 'N/A'}</div>
            </div>`).join('');
        body.innerHTML = html;
    }
}

/**
 * Widget: ActivityFeedWidget
 * Лента активности системы
 */
export class ActivityFeedWidget extends BaseWidget {
    async render() {
        const container = this.options.container;
        container.innerHTML = `
            <div class="activity-widget" id="activity-widget-${this.options.id}">
                <div class="widget-header">
                    <h3><i class="fas fa-bell"></i> Активность</h3>
                </div>
                <div class="widget-body custom-scrollbar" id="activity-body-${this.options.id}"></div>
            </div>`;

        await this.refresh();
    }

    async refresh() {
        try {
            const result = await IPRoastAPI.analytics.getActivityFeed({ limit: 50 });
            const events = result.items || [];
            this.renderEvents(events);
        } catch (error) {
            console.error('Ошибка загрузки активности:', error);
        }
    }

    renderEvents(events) {
        const body = $('#activity-body-' + this.options.id);
        if (!body) return;

        if (events.length === 0) {
            body.innerHTML = `<div class="empty-state"><i class="fas fa-history"></i> Нет активности</div>`;
            return;
        }

        const iconMap = {
            scan: 'fas fa-search',
            vulnerability: 'fas fa-exclamation-triangle',
            device: 'fas fa-server',
            attack: 'fas fa-shield-alt',
            system: 'fas fa-cog'
        };

        const html = events.map(e => `
            <div class="event-row event-${e.type}">
                <div class="event-icon"><i class="${iconMap[e.type] || 'fas fa-info-circle'}"></i></div>
                <div class="event-content">
                    <div class="event-title">${e.title}</div>
                    <div class="event-time">${timeAgo(e.timestamp)}</div>
                </div>
            </div>`).join('');
        body.innerHTML = html;
    }
}

/**
 * Регистрация всех виджетов в глобальной фабрике
 */
export const WidgetsFactory = {
    registry: new Map(),

    register(name, cls) {
        this.registry.set(name, cls);
    },

    create(name, options) {
        const WidgetClass = this.registry.get(name);
        if (!WidgetClass) throw new Error(`Widget ${name} not registered`);
        return new WidgetClass(options);
    }
};

// Регистрация стандартных виджетов
WidgetsFactory.register('deviceList', DeviceListWidget);
WidgetsFactory.register('vulnerabilityList', VulnerabilityWidget);
WidgetsFactory.register('activityFeed', ActivityFeedWidget);

// Глобальный экспорт
window.WidgetsFactory = WidgetsFactory;
