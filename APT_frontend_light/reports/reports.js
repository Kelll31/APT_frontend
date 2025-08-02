/**
 * IP Roast Enterprise 4.0 — Reports Dashboard
 * Главный контроллер вкладки Reports
 * Версия: Enterprise 4.0
 */

import { IPRoastAPI } from '../shared/utils/api.js';
import { NavigationComponent } from '../shared/components/navigation.js';
import { ExportManager } from './export-manager.js';
import { ReportGenerator } from './report-generator.js';
import { ReportViewer } from './report-viewer.js';
import './reports.css';

export class ReportsController {
    constructor(options = {}) {
        this.options = { container: '#reports-container', ...options };
        this.container = document.querySelector(this.options.container);
        this.navigation = new NavigationComponent();
        this.init();
    }

    async init() {
        this.container.innerHTML = `
      <div class="reports-container">
        <div class="reports-layout">
          <aside class="reports-sidebar">
            <header class="reports-header">
              <h2 class="reports-title"><i class="fas fa-file-alt"></i> Отчеты</h2>
            </header>
            <section class="reports-search-section"></section>
            <section class="reports-filters-section"></section>
          </aside>
          <main class="reports-main">
            <header class="reports-header">
              <div class="reports-results-info"></div>
              <div class="reports-header-actions">
                <button class="reports-action-btn" data-action="new"><i class="fas fa-plus"></i> Создать</button>
                <button class="reports-action-btn" data-action="refresh"><i class="fas fa-sync"></i> Обновить</button>
              </div>
            </header>
            <section class="reports-content">
              <div class="reports-grid"></div>
            </section>
            <footer class="reports-pagination"></footer>
          </main>
        </div>
      </div>
    `;
        this.bindToolbar();
        await this.loadReports();
    }

    bindToolbar() {
        this.container.querySelector('[data-action="new"]')
            .addEventListener('click', () => this.openGenerator());
        this.container.querySelector('[data-action="refresh"]')
            .addEventListener('click', () => this.loadReports());
    }

    async loadReports() {
        const list = await IPRoastAPI.reports.getReports();
        this.renderGrid(list);
    }

    renderGrid(list) {
        const grid = this.container.querySelector('.reports-grid');
        grid.innerHTML = list.map(r => `
      <div class="report-card" data-id="${r.id}">
        <div class="report-card-header"><div class="viewer-chart"></div></div>
        <div class="report-card-body">
          <h3 class="report-card-title">${r.name}</h3>
          <p class="report-card-description">${r.description}</p>
          <div class="report-card-meta">
            <span><i class="fas fa-calendar"></i> ${formatDate(r.createdAt, 'DD.MM.YYYY')}</span>
            <span><i class="fas fa-file"></i> ${r.pages.length} стр.</span>
          </div>
        </div>
        <div class="report-card-footer">
          <span class="report-card-status success">Готов</span>
          <div class="report-card-actions">
            <button class="report-card-action" data-action="view"><i class="fas fa-eye"></i></button>
            <button class="report-card-action" data-action="export"><i class="fas fa-download"></i></button>
          </div>
        </div>
      </div>
    `).join('');
        grid.querySelectorAll('.report-card').forEach(card => {
            const id = card.dataset.id;
            card.querySelector('[data-action="view"]')
                .addEventListener('click', () => this.viewReport(id));
            card.querySelector('[data-action="export"]')
                .addEventListener('click', () => this.exportReport(id));
        });
    }

    openGenerator() {
        this.exportManager?.container.remove();
        this.generator = new ReportGenerator(this.options.container, {
            onGenerate: id => {
                this.loadReports();
                this.viewReport(id);
            }
        });
    }

    viewReport(id) {
        new ReportViewer(this.options.container, id, {
            onClose: () => this.init()
        });
    }

    exportReport(id) {
        new ExportManager(this.options.container, {
            reportId: id,
            onExportComplete: () => alert('Экспорт завершён')
        });
    }
}
