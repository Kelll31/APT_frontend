import { IPRoastAPI } from '../shared/utils/api.js';
import { $, addClass, removeClass } from '../shared/utils/helpers.js';

export class DeviceDetailsController {
    /**
     * @param {{ container: string, deviceId: string }} options
     */
    constructor({ container, deviceId }) {
        this.container = document.querySelector(container);
        this.deviceId = deviceId;
        this.panel = null;
        this._init();
    }

    async _init() {
        addClass(this.container, 'loading');
        try {
            const dev = await IPRoastAPI.devices.getDevice(this.deviceId);
            this._render(dev);
        } catch (e) {
            console.error('Не удалось получить детали устройства', e);
            this._showError('Ошибка загрузки деталей устройства');
        } finally {
            removeClass(this.container, 'loading');
        }
    }

    _render(dev) {
        this.panel = document.createElement('div');
        this.panel.className = 'device-details';
        this.panel.innerHTML = `
      <div class="device-details-panel">
        <div class="device-header">
          <div class="device-info">
            <div class="device-icon ${dev.type} ${dev.status}"></div>
            <div class="device-primary-info">
              <h3 class="device-name">${dev.name}</h3>
              <p class="device-type">${dev.type}</p>
              <p class="device-ip">${dev.ip}</p>
            </div>
          </div>
        </div>
        <div class="device-details-content">
          <div class="device-specs">
            ${this._renderSpecs(dev.specs)}
          </div>
          <div class="device-interfaces">
            ${this._renderInterfaces(dev.interfaces)}
          </div>
        </div>
      </div>
    `;
        this.container.innerHTML = '';
        this.container.appendChild(this.panel);
    }

    _renderSpecs(specs) {
        return specs.map(group => `
      <div class="device-spec-group">
        <h4 class="device-spec-title">${group.title}</h4>
        ${group.items.map(item => `
          <div class="device-spec-item">
            <span class="device-spec-label">${item.label}</span>
            <span class="device-spec-value">${item.value}</span>
          </div>
        `).join('')}
      </div>
    `).join('');
    }

    _renderInterfaces(intfs) {
        return `
      <div class="interfaces-header">
        <h4 class="interfaces-title">Interfaces</h4>
        <div class="interfaces-summary">
          <span class="interface-count active">${intfs.filter(i => i.status === 'up').length} UP</span>
          <span class="interface-count inactive">${intfs.filter(i => i.status !== 'up').length} DOWN</span>
        </div>
      </div>
      <div class="interfaces-grid">
        ${intfs.map(i => `
          <div class="interface-card ${i.status === 'up' ? 'active' : 'inactive'}">
            <div class="interface-header">
              <h5 class="interface-name">${i.name}</h5>
              <div class="interface-status ${i.status}">${i.status.toUpperCase()}</div>
            </div>
            <div class="interface-details">
              ${Object.entries(i.metrics).map(([k, v]) => `
                <div class="interface-detail">
                  <span class="interface-detail-label">${k}</span>
                  <span class="interface-detail-value">${v}</span>
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    `;
    }

    _showError(msg) {
        this.container.innerHTML = `<div class="device-details-error">${msg}</div>`;
    }
}
