/**
 * IP Roast Enterprise 4.0 — User Preferences
 * Личные настройки пользователя
 * Версия: Enterprise 4.0
 */

import { IPRoastAPI } from '../../shared/utils/api.js';
import './user-preferences.css';

export class UserPreferences {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.state = { profile: null };
        this.init();
    }

    async init() {
        this.renderSkeleton();
        await this.loadProfile();
        this.renderForm();
        this.bindEvents();
    }

    renderSkeleton() {
        this.container.innerHTML = `<div class="user-preferences">Загрузка профиля...</div>`;
    }

    async loadProfile() {
        this.state.profile = await IPRoastAPI.auth.getProfile();
    }

    renderForm() {
        const p = this.state.profile;
        this.container.innerHTML = `
      <div class="user-preferences">
        <h3>Профиль пользователя</h3>
        <label>Имя:
          <input type="text" id="user-name" value="${p.name}">
        </label>
        <label>Email:
          <input type="email" id="user-email" value="${p.email}">
        </label>
        <label>
          <input type="checkbox" id="pref-notifications" ${p.preferences.notifications ? 'checked' : ''}>
          Уведомления
        </label>
        <button id="user-save-btn" class="btn btn-primary">Сохранить</button>
      </div>`;
    }

    bindEvents() {
        this.container.querySelector('#user-save-btn').addEventListener('click', () => this.save());
    }

    async save() {
        const updated = {
            name: this.container.querySelector('#user-name').value.trim(),
            email: this.container.querySelector('#user-email').value.trim(),
            preferences: {
                notifications: this.container.querySelector('#pref-notifications').checked
            }
        };
        await IPRoastAPI.auth.updateProfile(updated);
        alert('Настройки пользователя сохранены');
    }
}
