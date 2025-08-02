/**
 * IP Roast Enterprise 4.0 — System Configuration
 * Управление системными настройками
 * Версия: Enterprise 4.0
 */

import { IPRoastAPI } from '../shared/utils/api.js';
import './system-config.css';

export class SystemConfig {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.state = { settings: null };
        this.init();
    }

    async init() {
        this.renderSkeleton();
        await this.loadSettings();
        this.renderForm();
        this.bindEvents();
    }

    renderSkeleton() {
        this.container.innerHTML = `<div class="system-config">Загрузка настроек...</div>`;
    }

    async loadSettings() {
        this.state.settings = await IPRoastAPI.system.getSettings();
    }

    renderForm() {
        const s = this.state.settings;
        this.container.innerHTML = `
      <div class="system-config">
        <h3>Системные настройки</h3>
        <label>Auto-refresh interval (ms):
          <input type="number" id="cfg-refresh-interval" value="${s.refreshInterval}" min="5000" max="120000">
        </label>
        <label>Max notifications:
          <input type="number" id="cfg-max-notifications" value="${s.maxNotifications}" min="1" max="200">
        </label>
        <label>
          <input type="checkbox" id="cfg-enable-websocket" ${s.enableWebSocket ? 'checked' : ''}>
          Включить WebSocket
        </label>
        <button id="cfg-save-btn" class="btn btn-primary">Сохранить</button>
      </div>`;
    }

    bindEvents() {
        this.container.querySelector('#cfg-save-btn').addEventListener('click', () => this.save());
    }

    async save() {
        const updated = {
            refreshInterval: +this.container.querySelector('#cfg-refresh-interval').value,
            maxNotifications: +this.container.querySelector('#cfg-max-notifications').value,
            enableWebSocket: this.container.querySelector('#cfg-enable-websocket').checked
        };
        await IPRoastAPI.system.updateSettings(updated);
        alert('Системные настройки сохранены');
    }
}
