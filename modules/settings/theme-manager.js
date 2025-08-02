/**
 * IP Roast Enterprise 4.0 — Theme Manager
 * Управление темами интерфейса
 * Версия: Enterprise 4.0
 */

import { THEMES, DEFAULT_UI_SETTINGS } from '../../shared/utils/constants.js';
import './theme-manager.css';

export class ThemeManager {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.state = { current: DEFAULT_UI_SETTINGS.theme };
        this.init();
    }

    init() {
        this.render();
        this.bindEvents();
        this.applyTheme();
    }

    render() {
        this.container.innerHTML = `
      <div class="theme-manager">
        <h3>Выбор темы</h3>
        ${Object.values(THEMES).map(theme => `
          <label class="theme-option">
            <input type="radio" name="theme" value="${theme}" ${this.state.current === theme ? 'checked' : ''}>
            ${theme}
          </label>
        `).join('')}
        <button id="theme-apply-btn" class="btn btn-primary">Применить</button>
      </div>`;
    }

    bindEvents() {
        this.container.querySelectorAll('[name="theme"]').forEach(radio => {
            radio.addEventListener('change', e => this.state.current = e.target.value);
        });
        this.container.querySelector('#theme-apply-btn').addEventListener('click', () => {
            this.applyTheme();
            alert(`Тема установлена на "${this.state.current}"`);
        });
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.state.current);
        localStorage.setItem('ui-theme', this.state.current);
    }
}
