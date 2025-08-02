/**
 * IP Roast Enterprise 4.0 — Scanner Controller
 * Объединяет форму, запускает сканы и отображает результаты
 * Версия: Enterprise 4.0
 */

import { ScanForm } from './scan-form.js';
import { PortScanner } from './port-scanner.js';
import './scanner.css';

export class ScannerController {
    constructor(options = {}) {
        this.options = { container: '#scanner-container', ...options };
        this.container = document.querySelector(this.options.container);
        this.init();
    }

    init() {
        this.container.innerHTML = `
      <div class="scanner">
        <div class="scanner__form-area"    id="scan-form-area"></div>
        <div class="scanner__results-area" id="scan-results-area"></div>
        <div class="scanner__actions-area" id="scan-actions-area"></div>
      </div>`;
        this.form = new ScanForm('scan-form-area', { onStart: cfg => this.start(cfg) });
    }

    start(config) {
        this.portScanner = new PortScanner('scan-results-area');
        this.portScanner.startScan(config);
    }
}
