/**
 * IP Roast Enterprise 4.0 — Report Viewer
 * Просмотр сгенерированного отчёта
 * Версия: Enterprise 4.0
 */

import { IPRoastAPI } from '../../shared/utils/api.js';
import { formatDate, timeAgo } from '../../shared/utils/helpers.js';
import './report-viewer.css';

export class ReportViewer {
    constructor(containerId, reportId, options = {}) {
        this.container = document.getElementById(containerId);
        this.reportId = reportId;
        this.options = {
            onClose: null,
            ...options
        };
        this.state = { report: null, page: 1 };
        this.init();
    }

    async init() {
        this.renderSkeleton();
        try {
            const rpt = await IPRoastAPI.reports.getReport(this.reportId);
            this.state.report = rpt;
            this.render();
        } catch (e) {
            this.container.innerHTML = `<p>Ошибка загрузки отчёта</p>`;
        }
    }

    renderSkeleton() {
        this.container.innerHTML = `<div class="report-viewer__body">${'<div class="viewer-chart"></div>'.repeat(3)}</div>`;
    }

    render() {
        const { title, createdAt, pages } = this.state.report;
        this.container.innerHTML = `
      <div class="report-viewer">
        <header class="report-viewer__header">
          <h2>${title}</h2>
          <span class="report-date">${timeAgo(createdAt)}</span>
          <button class="viewer-btn viewer-btn--primary" data-action="close">Закрыть</button>
        </header>
        <div class="report-viewer__body">
          <div class="report-viewer__toc"></div>
          <div class="viewer-document-wrapper">
            <div class="viewer-document">${pages[this.state.page - 1]}</div>
          </div>
        </div>
        <footer class="report-viewer__footer">
          <span class="viewer-page-indicator">Страница ${this.state.page} из ${pages.length}</span>
          <div class="viewer-pagination">
            <button class="viewer-page-btn" data-action="prev" ${this.state.page === 1 ? 'disabled' : ''}>&lt;</button>
            <button class="viewer-page-btn" data-action="next" ${this.state.page === pages.length ? 'disabled' : ''}>&gt;</button>
          </div>
        </footer>
      </div>
    `;
        this.container.querySelector('[data-action="close"]').addEventListener('click', () => {
            if (this.options.onClose) this.options.onClose();
        });
        this.container.querySelector('[data-action="prev"]').addEventListener('click', () => this.gotoPage(this.state.page - 1));
        this.container.querySelector('[data-action="next"]').addEventListener('click', () => this.gotoPage(this.state.page + 1));
    }

    gotoPage(n) {
        if (n < 1 || n > this.state.report.pages.length) return;
        this.state.page = n;
        this.render();
    }
}
