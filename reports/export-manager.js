/**
 * IP Roast Enterprise 4.0 — Export Manager
 * Полнофункциональный менеджер экспорта отчетов
 * Версия: Enterprise 4.0
 */

import { IPRoastAPI } from '../shared/utils/api.js';
import { debounce, formatDate } from '../shared/utils/helpers.js';
import './export-manager.css';

export class ExportManager {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.options = {
            formats: ['pdf', 'csv', 'json', 'xml', 'docx', 'xlsx'],
            onExportComplete: null,
            ...options
        };
        this.state = {
            selectedFormat: 'pdf',
            filters: {},
            advanced: false,
            progress: 0,
            history: []
        };
        this.init();
    }

    init() {
        this.render();
        this.bindEvents();
        this.loadHistory();
    }

    render() {
        this.container.innerHTML = `
      <div class="export-manager">
        <div class="export-manager-container">
          <aside class="export-sidebar">
            <header class="export-sidebar-header">
              <h2 class="export-sidebar-title">Экспорт отчетов</h2>
              <p class="export-sidebar-subtitle">Выберите формат и параметры</p>
            </header>
            <div class="export-sidebar-content">
              <section class="export-formats">
                <h3 class="export-formats-title">Форматы</h3>
                <div class="export-format-grid">
                  ${this.options.formats.map(fmt => `
                    <div class="export-format-card" data-format="${fmt}">
                      <div class="export-format-icon">${fmt.toUpperCase()}</div>
                      <div class="export-format-name">${fmt.toUpperCase()}</div>
                      <div class="export-format-description">Скачать в ${fmt}</div>
                    </div>
                  `).join('')}
                </div>
              </section>
            </div>
          </aside>
          <main class="export-main">
            <header class="export-main-header">
              <h2 class="export-main-title">Параметры экспорта</h2>
            </header>
            <div class="export-main-content">
              <!-- дополнительные опции можно добавить здесь -->
            </div>
          </main>
        </div>
        <footer class="export-actions">
          <div class="export-actions-buttons">
            <button class="export-btn export-btn--secondary" data-action="cancel">Отмена</button>
            <button class="export-btn export-btn--primary" data-action="start">Начать экспорт</button>
          </div>
        </footer>
      </div>
    `;
        this.formatCards = this.container.querySelectorAll('.export-format-card');
        this.startBtn = this.container.querySelector('[data-action="start"]');
        this.cancelBtn = this.container.querySelector('[data-action="cancel"]');
    }

    bindEvents() {
        this.formatCards.forEach(card => {
            card.addEventListener('click', () => this.selectFormat(card.dataset.format));
        });
        this.startBtn.addEventListener('click', () => this.startExport());
        this.cancelBtn.addEventListener('click', () => this.cancelExport());
    }

    selectFormat(fmt) {
        this.state.selectedFormat = fmt;
        this.formatCards.forEach(c => c.classList.toggle('selected', c.dataset.format === fmt));
    }

    async startExport() {
        const fmt = this.state.selectedFormat;
        this.startBtn.disabled = true;
        this.cancelBtn.disabled = false;

        // Показать progress overlay
        this.showProgress();

        try {
            // генерация на бэкенде
            const res = await IPRoastAPI.reports.downloadReport(this.options.reportId, fmt);
            // превращаем blob в скачиваемый файл
            const url = URL.createObjectURL(res);
            const a = document.createElement('a');
            a.href = url;
            a.download = `report_${formatDate(new Date(), 'YYYYMMDD_HHmmss')}.${fmt}`;
            a.click();
            URL.revokeObjectURL(url);

            this.recordHistory(fmt);
            if (this.options.onExportComplete) this.options.onExportComplete(fmt);
        } catch (e) {
            console.error('Export error', e);
            alert('Ошибка при экспорте');
        } finally {
            this.hideProgress();
            this.startBtn.disabled = false;
            this.cancelBtn.disabled = true;
        }
    }

    cancelExport() {
        // просто сброс progress и кнопок
        this.hideProgress();
        this.startBtn.disabled = false;
        this.cancelBtn.disabled = true;
    }

    showProgress() {
        this.progressOverlay = document.createElement('div');
        this.progressOverlay.className = 'export-progress-overlay';
        this.progressOverlay.innerHTML = `
      <div class="export-progress-modal">
        <div class="export-progress-icon">⏳</div>
        <h3 class="export-progress-title">Экспорт...</h3>
        <div class="export-progress-description">Пожалуйста, подождите</div>
        <div class="export-progress-bar">
          <div class="export-progress-fill" style="width:0%"></div>
        </div>
      </div>
    `;
        document.body.append(this.progressOverlay);
        // имитация прогресса
        let pct = 0;
        this.interval = setInterval(() => {
            pct = Math.min(90, pct + 10);
            this.progressOverlay.querySelector('.export-progress-fill').style.width = pct + '%';
        }, 300);
    }

    hideProgress() {
        clearInterval(this.interval);
        if (this.progressOverlay) this.progressOverlay.remove();
    }

    recordHistory(format) {
        const hist = JSON.parse(localStorage.getItem('export-history') || '[]');
        hist.unshift({ format, date: new Date().toISOString() });
        localStorage.setItem('export-history', JSON.stringify(hist.slice(0, 10)));
    }

    loadHistory() {
        this.state.history = JSON.parse(localStorage.getItem('export-history') || '[]');
    }
}
