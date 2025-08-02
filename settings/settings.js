/**
 * IP Roast Enterprise 4.0 — Settings Controller
 * Главный контроллер раздела настроек
 * Версия: Enterprise 4.0
 */

import { SystemConfig } from './system-config.js';
import { ThemeManager } from './theme-manager.js';
import { UserPreferences } from './user-preferences.js';
import './settings.css';

export class SettingsController {
    constructor(containerSelector = '#settings-container') {
        this.container = document.querySelector(containerSelector);
        this.init();
    }

    init() {
        // Build tab navigation
        this.container.innerHTML = `
      <div class="settings-tabs">
        <button data-tab="system" class="settings-tab active">Система</button>
        <button data-tab="theme"  class="settings-tab">Тема</button>
        <button data-tab="user"   class="settings-tab">Профиль</button>
      </div>
      <div class="settings-content">
        <div id="system-config-area" class="settings-area"></div>
        <div id="theme-manager-area" class="settings-area hidden"></div>
        <div id="user-preferences-area" class="settings-area hidden"></div>
      </div>
    `;
        this.bindTabNavigation();

        // Initialize sub-modules
        this.systemConfig = new SystemConfig('system-config-area');
        this.themeManager = new ThemeManager('theme-manager-area');
        this.userPreferences = new UserPreferences('user-preferences-area');
    }

    bindTabNavigation() {
        const tabs = this.container.querySelectorAll('.settings-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.toggle('active', t === tab));
                this.container.querySelectorAll('.settings-area').forEach(area => {
                    area.classList.toggle('hidden', area.id !== `${tab.dataset.tab}${tab.dataset.tab === 'system' ? '-config-area' : '-manager-area'}` && area.id !== `${tab.dataset.tab}-preferences-area`);
                });
            });
        });
    }
}
