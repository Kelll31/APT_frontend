/**
 * IP Roast Enterprise 4.0 — Scan Form
 * Форма настройки и запуска сканирования
 * Версия: Enterprise 4.0
 */

import { IPRoastAPI } from '../../../shared/utils/api.js';
import { debounce, isValidIP, parsePortRange } from '../../../shared/utils/helpers.js';
import './scan-form.css';

export class ScanForm {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.options = {
            onStart: null,
            ...options
        };
        this.state = {
            target: '',
            ports: '80,443',
            scanType: 'port_scan',
            timeout: 5000,
            threads: 10,
            errors: {}
        };
        this.init();
    }

    init() {
        this.render();
        this.bindEvents();
    }

    render() {
        this.container.innerHTML = `
      <form class="scan-form">
        <div class="scan-form__header">
          <h3 class="scan-form__title">Настройка сканирования</h3>
        </div>
        <div class="scan-form__body">
          <div class="scan-form__group">
            <label class="scan-form__label">Цель (IP или подсеть)</label>
            <input type="text" class="scan-form__input scan-form__input--target" placeholder="192.168.1.0/24">
            <div class="scan-form__error scan-form__error--target"></div>
          </div>
          <div class="scan-form__group">
            <label class="scan-form__label">Порты (80,443 или 8000-8080)</label>
            <input type="text" class="scan-form__input scan-form__input--ports" value="80,443">
            <div class="scan-form__error scan-form__error--ports"></div>
          </div>
          <div class="scan-form__group">
            <label class="scan-form__label">Тип сканирования</label>
            <select class="scan-form__select scan-form__select--type">
              <option value="ping_sweep">Ping Sweep</option>
              <option value="port_scan" selected>Port Scan</option>
              <option value="service_scan">Service Scan</option>
              <option value="vulnerability_scan">Vulnerability Scan</option>
              <option value="full_scan">Full Scan</option>
            </select>
          </div>
          <div class="scan-form__group">
            <label class="scan-form__label">Таймаут (мс)</label>
            <input type="number" class="scan-form__input scan-form__input--timeout" value="5000" min="100" max="60000">
          </div>
          <div class="scan-form__group">
            <label class="scan-form__label">Потоки</label>
            <input type="number" class="scan-form__input scan-form__input--threads" value="10" min="1" max="100">
          </div>
        </div>
        <div class="scan-form__actions">
          <button type="button" class="scan-form__btn scan-form__btn--secondary" data-action="reset">Сброс</button>
          <button type="button" class="scan-form__btn scan-form__btn--primary" data-action="start">Старт</button>
        </div>
      </form>
    `;
        this.targetInput = this.container.querySelector('.scan-form__input--target');
        this.portsInput = this.container.querySelector('.scan-form__input--ports');
        this.typeSelect = this.container.querySelector('.scan-form__select--type');
        this.timeoutInput = this.container.querySelector('.scan-form__input--timeout');
        this.threadsInput = this.container.querySelector('.scan-form__input--threads');
        this.errorTarget = this.container.querySelector('.scan-form__error--target');
        this.errorPorts = this.container.querySelector('.scan-form__error--ports');
        this.startBtn = this.container.querySelector('[data-action="start"]');
        this.resetBtn = this.container.querySelector('[data-action="reset"]');
    }

    bindEvents() {
        this.targetInput.addEventListener('input', debounce(() => {
            const v = this.targetInput.value.trim();
            const invalid = !isValidIP(v) && !v.includes('/');
            this.state.errors.target = invalid;
            this.errorTarget.textContent = invalid ? 'Неверный IP или подсеть' : '';
            this.state.target = v;
        }, 300));

        this.portsInput.addEventListener('input', debounce(() => {
            try {
                parsePortRange(this.portsInput.value);
                this.state.errors.ports = false;
                this.errorPorts.textContent = '';
            } catch {
                this.state.errors.ports = true;
                this.errorPorts.textContent = 'Неверный формат портов';
            }
            this.state.ports = this.portsInput.value;
        }, 300));

        this.typeSelect.addEventListener('change', e => this.state.scanType = e.target.value);
        this.timeoutInput.addEventListener('input', e => this.state.timeout = +e.target.value);
        this.threadsInput.addEventListener('input', e => this.state.threads = +e.target.value);

        this.startBtn.addEventListener('click', () => this.handleStart());
        this.resetBtn.addEventListener('click', () => this.handleReset());
    }

    handleStart() {
        if (this.state.errors.target || this.state.errors.ports || !this.state.target) {
            alert('Исправьте ошибки перед запуском');
            return;
        }
        const cfg = {
            target: this.state.target,
            ports: parsePortRange(this.state.ports),
            type: this.state.scanType,
            timeout: this.state.timeout,
            threads: this.state.threads
        };
        this.options.onStart && this.options.onStart(cfg);
    }

    handleReset() {
        this.targetInput.value = '';
        this.portsInput.value = '80,443';
        this.typeSelect.value = 'port_scan';
        this.timeoutInput.value = 5000;
        this.threadsInput.value = 10;
        this.errorTarget.textContent = '';
        this.errorPorts.textContent = '';
        this.state = {
            target: '',
            ports: '80,443',
            scanType: 'port_scan',
            timeout: 5000,
            threads: 10,
            errors: {}
        };
    }
}
