/**
 * IP Roast Enterprise 4.0 — Report Generator
 * Модуль создания и настройки шаблона отчета
 * Версия: Enterprise 4.0
 */

import { IPRoastAPI } from '../shared/utils/api.js';
import { debounce } from '../shared/utils/helpers.js';
import './report-generator.css';

export class ReportGenerator {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.options = {
            onGenerate: null,
            ...options
        };
        this.state = {
            templateId: null,
            dataSources: [],
            filters: {},
            name: '',
            description: ''
        };
        this.init();
    }

    async init() {
        this.render();
        this.bindEvents();
        this.loadTemplates();
    }

    render() {
        this.container.innerHTML = `
      <div class="report-generator">
        <div class="report-generator-container">
          <aside class="report-builder-sidebar">
            <header class="report-builder-header">
              <h3 class="report-builder-title">Создать отчёт</h3>
            </header>
            <nav class="report-builder-nav">
              <button class="report-builder-nav-item active" data-step="1">Шаблон</button>
              <button class="report-builder-nav-item" data-step="2">Источники</button>
              <button class="report-builder-nav-item" data-step="3">Параметры</button>
            </nav>
            <div class="report-builder-content"></div>
          </aside>
          <section class="report-preview">
            <header class="report-preview-header">
              <h4 class="report-preview-title">Предварительный просмотр</h4>
              <div class="report-preview-controls"></div>
            </header>
            <div class="report-preview-content">
              <div class="report-preview-placeholder">
                <i class="fas fa-file-alt"></i>
                <h3>Выберите шаблон и источники</h3>
                <p>Настройте отчёт и нажмите «Генерировать»</p>
              </div>
            </div>
          </section>
        </div>
        <footer class="export-actions">
          <div class="export-actions-buttons">
            <button class="export-btn export-btn--secondary" data-action="back">Назад</button>
            <button class="export-btn export-btn--primary" data-action="generate">Генерировать</button>
          </div>
        </footer>
      </div>
    `;
        this.stepsNav = this.container.querySelectorAll('.report-builder-nav-item');
        this.contentEl = this.container.querySelector('.report-builder-content');
        this.backBtn = this.container.querySelector('[data-action="back"]');
        this.generateBtn = this.container.querySelector('[data-action="generate"]');
    }

    bindEvents() {
        this.stepsNav.forEach(btn => btn.addEventListener('click', () => this.switchStep(btn.dataset.step)));
        this.backBtn.addEventListener('click', () => this.prevStep());
        this.generateBtn.addEventListener('click', () => this.generateReport());
    }

    switchStep(step) {
        this.currentStep = parseInt(step);
        this.stepsNav.forEach(btn => btn.classList.toggle('active', btn.dataset.step == step));
        this.renderStep();
    }

    prevStep() {
        const prev = Math.max(1, this.currentStep - 1);
        this.switchStep(prev);
    }

    async loadTemplates() {
        this.templates = await IPRoastAPI.reports.getReportTemplates();
        this.switchStep(1);
    }

    renderStep() {
        switch (this.currentStep) {
            case 1: this.renderTemplates(); break;
            case 2: this.renderSources(); break;
            case 3: this.renderParameters(); break;
        }
    }

    renderTemplates() {
        this.contentEl.innerHTML = `
      <div class="template-grid">
        ${this.templates.map(t => `
          <div class="template-card" data-id="${t.id}">
            <div class="template-preview"><i class="${t.icon}"></i></div>
            <div class="template-info">
              <h4 class="template-name">${t.name}</h4>
              <p class="template-description">${t.description}</p>
            </div>
          </div>
        `).join('')}
        <div class="template-custom">
          <i class="fas fa-plus"></i>
          <span class="template-custom-text">Свой шаблон</span>
        </div>
      </div>
    `;
        this.contentEl.querySelectorAll('.template-card').forEach(card => {
            card.addEventListener('click', () => {
                this.state.templateId = card.dataset.id;
                this.contentEl.querySelectorAll('.template-card').forEach(c => c.classList.toggle('selected', c === card));
            });
        });
        this.contentEl.querySelector('.template-custom').addEventListener('click', () => {
            // TODO: custom upload
            alert('Импорт шаблона пока недоступен');
        });
    }

    async renderSources() {
        this.contentEl.innerHTML = `
      <section class="data-sources-section">
        <h3 class="section-title">Источники данных</h3>
        <div class="data-source-list"></div>
      </section>
    `;
        const listEl = this.contentEl.querySelector('.data-source-list');
        const devices = await IPRoastAPI.devices.getDevices();
        devices.forEach(d => {
            const item = document.createElement('div');
            item.className = 'data-source-item';
            item.innerHTML = `
        <input type="checkbox" class="data-source-checkbox">
        <div class="data-source-icon"><i class="fas fa-server"></i></div>
        <div class="data-source-info">
          <h5 class="data-source-name">${d.name}</h5>
          <p class="data-source-description">${d.ip}</p>
        </div>
      `;
            item.querySelector('input').addEventListener('change', e => {
                if (e.target.checked) this.state.dataSources.push(d.id);
                else this.state.dataSources = this.state.dataSources.filter(id => id !== d.id);
            });
            listEl.append(item);
        });
    }

    renderParameters() {
        this.contentEl.innerHTML = `
      <div class="filter-group">
        <label class="filter-label">Название отчёта</label>
        <input type="text" class="filter-input report-name-input" placeholder="Введите название">
      </div>
      <div class="filter-group">
        <label class="filter-label">Описание</label>
        <textarea class="filter-input report-desc-input" rows="3"></textarea>
      </div>
    `;
        this.contentEl.querySelector('.report-name-input').addEventListener('input',
            debounce(e => this.state.name = e.target.value, 300)
        );
        this.contentEl.querySelector('.report-desc-input').addEventListener('input',
            debounce(e => this.state.description = e.target.value, 300)
        );
    }

    async generateReport() {
        if (!this.state.templateId || !this.state.dataSources.length || !this.state.name) {
            alert('Заполните все обязательные поля');
            return;
        }
        this.generateBtn.disabled = true;
        try {
            const config = {
                templateId: this.state.templateId,
                sources: this.state.dataSources,
                name: this.state.name,
                description: this.state.description
            };
            const report = await IPRoastAPI.reports.generateReport(config);
            if (this.options.onGenerate) this.options.onGenerate(report.id);
        } catch (e) {
            console.error(e);
            alert('Ошибка генерации отчёта');
        } finally {
            this.generateBtn.disabled = false;
        }
    }
}
