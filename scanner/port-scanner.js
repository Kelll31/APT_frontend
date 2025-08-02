/**
 * IP Roast Enterprise 4.0 — Port Scanner
 * Модуль выполнения и визуализации порт-сканирования
 * Версия: Enterprise 4.0
 */

import { IPRoastAPI } from '../shared/utils/api.js';
import './port-scanner.css';

export class PortScanner {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.state = { jobs: [], page: 1, pageSize: 25 };
        this.renderSkeleton();
    }

    renderSkeleton() {
        this.container.innerHTML = `
      <div class="port-scanner">
        <div class="port-scanner__header"></div>
        <div class="port-scanner__results"></div>
        <div class="port-scanner__pagination"></div>
      </div>`;
    }

    async startScan(cfg) {
        this.showHeader(`Сканирование ${cfg.target}: порты ${cfg.ports.join(',')}`);
        const job = await IPRoastAPI.scanning.startScan(cfg);
        this.jobId = job.id;
        this.pollStatus();
    }

    showHeader(title) {
        const hdr = this.container.querySelector('.port-scanner__header');
        hdr.innerHTML = `
      <div class="port-scanner__title">${title}</div>
      <div class="port-scanner__controls">
        <button class="port-scanner__reset-btn">Отменить</button>
      </div>`;
        hdr.querySelector('.port-scanner__reset-btn')
            .addEventListener('click', () => this.cancel());
    }

    async pollStatus() {
        const st = await IPRoastAPI.scanning.getScanStatus(this.jobId);
        if (st.status === 'running') {
            setTimeout(() => this.pollStatus(), 1000);
        } else {
            this.fetchResults();
        }
    }

    async fetchResults() {
        const res = await IPRoastAPI.scanning.getScanResults(this.jobId);
        this.state.jobs = res.results;
        this.renderResults();
    }

    renderResults() {
        const list = this.container.querySelector('.port-scanner__results');
        if (!this.state.jobs.length) {
            list.innerHTML = '<div class="port-scanner__empty">Нет результатов</div>';
            return;
        }
        const slice = this.state.jobs.slice(
            (this.state.page - 1) * this.state.pageSize,
            this.state.page * this.state.pageSize
        );
        list.innerHTML = `
      <table class="port-scanner__table">
        <thead>
          <tr><th>Порт</th><th>Состояние</th></tr>
        </thead>
        <tbody>
          ${slice.map(r => `
            <tr>
              <td>${r.port}</td>
              <td>
                <span class="port-scanner__status port-scanner__status--${r.open ? 'open' : 'closed'}">
                  ${r.open ? 'Открыт' : 'Закрыт'}
                </span>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>`;
        this.renderPagination();
    }

    renderPagination() {
        const total = this.state.jobs.length;
        const pages = Math.ceil(total / this.state.pageSize);
        const pg = this.container.querySelector('.port-scanner__pagination');
        if (pages < 2) { pg.innerHTML = ''; return; }
        pg.innerHTML = `
      <button class="port-scanner__pagination-btn" ${this.state.page === 1 ? 'disabled' : ''}>&lt;</button>
      <span>${this.state.page}/${pages}</span>
      <button class="port-scanner__pagination-btn" ${this.state.page === pages ? 'disabled' : ''}>&gt;</button>`;
        const [prev, , next] = pg.querySelectorAll('button');
        prev.addEventListener('click', () => this.goto(this.state.page - 1));
        next.addEventListener('click', () => this.goto(this.state.page + 1));
    }

    goto(p) {
        const pages = Math.ceil(this.state.jobs.length / this.state.pageSize);
        if (p < 1 || p > pages) return;
        this.state.page = p;
        this.renderResults();
    }

    async cancel() {
        await IPRoastAPI.scanning.stopScan(this.jobId);
        alert('Сканирование отменено');
    }
}
