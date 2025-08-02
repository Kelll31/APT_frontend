/**
 * IP Roast Enterprise 4.0 — Scan Results
 * Универсальный контроллер отображения результатов
 * Версия: Enterprise 4.0
 */

import './scan-results.css';

export class ScanResults {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.init();
    }

    init() {
        this.container.innerHTML = `
      <div class="scan-results">
        <div class="scan-results__header">
          <h3>Результаты сканирования</h3>
        </div>
        <ul class="scan-results__list"></ul>
        <div class="scan-results__pagination"></div>
      </div>`;
    }

    display(jobs, page = 1, pageSize = 25) {
        const list = this.container.querySelector('.scan-results__list');
        if (!jobs.length) {
            list.innerHTML = `<li class="scan-results__empty">Нет результатов</li>`;
        } else {
            const start = (page - 1) * pageSize;
            const slice = jobs.slice(start, start + pageSize);
            list.innerHTML = slice.map(j => `
        <li class="scan-results__item">
          <div class="scan-results__info">
            <i class="scan-results__icon fas fa-${j.open ? 'check-circle' : 'times-circle'}"></i>
            <span class="scan-results__text">Порт ${j.port}</span>
          </div>
          <span class="scan-results__status scan-results__status--${j.open ? 'success' : 'failure'}">
            ${j.open ? 'Открыт' : 'Закрыт'}
          </span>
        </li>`).join('');
        }
        this.renderPagination(jobs.length, pageSize, page);
    }

    renderPagination(total, size, current) {
        const pages = Math.ceil(total / size);
        const pg = this.container.querySelector('.scan-results__pagination');
        if (pages < 2) { pg.innerHTML = ''; return; }
        pg.innerHTML = `
      <button class="scan-results__page-btn" ${current === 1 ? 'disabled' : ''}>&lt;</button>
      <span>${current}/${pages}</span>
      <button class="scan-results__page-btn" ${current === pages ? 'disabled' : ''}>&gt;</button>`;
        const [prev, , next] = pg.querySelectorAll('button');
        prev.addEventListener('click', () => this.onPage(current - 1));
        next.addEventListener('click', () => this.onPage(current + 1));
    }

    onPage() {
        // Привяжите свой callback: скролл или обновление через контроллер ScannerController
    }
}
