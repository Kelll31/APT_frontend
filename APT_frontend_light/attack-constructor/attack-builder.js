/**
 * IP Roast Enterprise 4.0 — Attack Builder
 * Полнофункциональная панель построения атак
 * Версия: Enterprise 4.0
 */

import { MODULE_CATEGORIES, WORKFLOW_TEMPLATES } from './AttackModuleConstructor.js';
import { generateUUID, addClass, removeClass, debounce } from '../shared/utils/helpers.js';
import './attack-builder.css';
import './constructor-styles.css';

export class AttackBuilder {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.options = {
            readOnly: false,
            showLibrary: true,
            showProperties: true,
            ...options
        };

        this.modules = [];
        this.connections = [];
        this.selectedModule = null;
        this.dragging = null;
        this.connecting = null;
        this.zoomLevel = 1;
        this.history = [];
        this.historyIndex = -1;

        this.init();
    }

    init() {
        this.render();
        this.bindEvents();
        this.loadTemplate('basic_pentest');
    }

    render() {
        this.container.innerHTML = `
      <div class="attack-builder" id="attack-builder-${generateUUID()}">
        <div class="attack-builder__header">
          <div class="attack-builder__title">Конструктор атак</div>
          <div class="attack-builder__toolbar">
            <button class="attack-builder__btn attack-builder__btn--add" data-action="add">Добавить модуль</button>
            <button class="attack-builder__btn attack-builder__btn--remove" data-action="remove">Удалить выделенный</button>
            <button class="attack-builder__btn" data-action="reset">Сбросить схему</button>
            <button class="attack-builder__btn" data-action="export">Экспорт JSON</button>
            <button class="attack-builder__btn" data-action="import">Импорт JSON</button>
          </div>
        </div>
        <div class="attack-builder__content">
          <div class="attack-builder__library" id="module-library"></div>
          <div class="attack-builder__canvas" id="builder-canvas"></div>
          <div class="attack-builder__properties" id="module-properties"></div>
        </div>
      </div>
    `;
        this.libraryEl = this.container.querySelector('#module-library');
        this.canvasEl = this.container.querySelector('#builder-canvas');
        this.propsEl = this.container.querySelector('#module-properties');

        this.renderLibrary();
    }

    renderLibrary() {
        this.libraryEl.innerHTML = MODULE_CATEGORIES.map(cat => `
      <div class="library-category">
        <h4>${cat.name}</h4>
        <div class="library-modules">
          ${cat.modules.map(mod => `
            <div class="library-item" data-module="${mod.id}" draggable="true">
              <i class="${mod.icon}"></i>
              <span>${mod.name}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');
    }

    bindEvents() {
        // Drag & drop добавление модулей
        this.libraryEl.addEventListener('dragstart', e => {
            if (e.target.matches('.library-item')) {
                this.dragging = MODULE_CATEGORIES
                    .flatMap(c => c.modules)
                    .find(m => m.id === e.target.dataset.module);
            }
        });
        this.canvasEl.addEventListener('dragover', e => e.preventDefault());
        this.canvasEl.addEventListener('drop', e => {
            if (this.dragging) {
                this.addModuleInstance(this.dragging, e.offsetX, e.offsetY);
                this.saveHistory();
            }
        });

        // Toolbar actions
        this.container.querySelectorAll('.attack-builder__btn').forEach(btn => {
            btn.addEventListener('click', () => this.handleToolbar(btn.dataset.action));
        });

        // Zoom (Ctrl + scroll)
        this.container.addEventListener('wheel', e => {
            if (e.ctrlKey) {
                e.preventDefault();
                this.zoomLevel = Math.min(2, Math.max(0.5, this.zoomLevel - e.deltaY * 0.001));
                this.canvasEl.style.transform = `scale(${this.zoomLevel})`;
            }
        });

        // Selection on canvas
        this.canvasEl.addEventListener('click', e => {
            if (e.target.closest('.constructor-block')) {
                this.selectModule(e.target.closest('.constructor-block').dataset.id);
            } else {
                this.clearSelection();
            }
        });

        // Undo/Redo
        window.addEventListener('keydown', debounce(e => {
            if (e.ctrlKey && e.key === 'z') this.undo();
            if (e.ctrlKey && e.key === 'y') this.redo();
        }, 100));
    }

    handleToolbar(action) {
        switch (action) {
            case 'add':
                alert('Перетащите модуль из библиотеки на канвас');
                break;
            case 'remove':
                this.removeSelected();
                break;
            case 'reset':
                this.resetBuilder();
                break;
            case 'export':
                this.exportJSON();
                break;
            case 'import':
                this.importJSON();
                break;
        }
    }

    addModuleInstance(moduleDef, x, y) {
        const id = generateUUID();
        const moduleEl = document.createElement('div');
        moduleEl.className = 'constructor-block';
        moduleEl.dataset.id = id;
        moduleEl.style.left = x + 'px';
        moduleEl.style.top = y + 'px';
        moduleEl.innerHTML = `
      <div class="constructor-block__title">${moduleDef.name}</div>
    `;
        this.canvasEl.appendChild(moduleEl);
        this.modules.push({ id, def: moduleDef, x, y, settings: { ...moduleDef.settings } });

        // Drag move
        moduleEl.draggable = true;
        moduleEl.addEventListener('dragstart', e => {
            this.connecting = { id, xOffset: e.offsetX, yOffset: e.offsetY };
        });
        moduleEl.addEventListener('dragend', e => {
            if (this.connecting && this.connecting.id === id) {
                this.updatePosition(id, e.pageX - this.canvasEl.offsetLeft - this.connecting.xOffset,
                    e.pageY - this.canvasEl.offsetTop - this.connecting.yOffset);
                this.saveHistory();
                this.connecting = null;
            }
        });
    }

    updatePosition(id, x, y) {
        const mod = this.modules.find(m => m.id === id);
        if (!mod) return;
        mod.x = x; mod.y = y;
        const el = this.canvasEl.querySelector(`[data-id="${id}"]`);
        if (el) { el.style.left = x + 'px'; el.style.top = y + 'px'; }
    }

    selectModule(id) {
        this.clearSelection();
        this.selectedModule = this.modules.find(m => m.id === id);
        const el = this.canvasEl.querySelector(`[data-id="${id}"]`);
        if (el) addClass(el, 'constructor-block--selected');
        this.renderProperties();
    }

    clearSelection() {
        this.modules.forEach(m => {
            const el = this.canvasEl.querySelector(`[data-id="${m.id}"]`);
            if (el) removeClass(el, 'constructor-block--selected');
        });
        this.selectedModule = null;
        this.propsEl.innerHTML = '';
    }

    renderProperties() {
        if (!this.selectedModule) return;
        const def = this.selectedModule.def;
        const settings = this.selectedModule.settings;
        this.propsEl.innerHTML = `
      <h3>${def.name} — Настройки</h3>
      ${Object.entries(def.settings || {}).map(([key, opt]) => `
        <div class="form-group">
          <label for="prop-${key}">${opt.label}</label>
          ${this.renderInput(key, opt, settings[key])}
        </div>
      `).join('')}
      <button class="btn btn-primary" id="save-props">Сохранить</button>
    `;
        this.propsEl.querySelector('#save-props')
            .addEventListener('click', () => this.saveProperties());
    }

    renderInput(key, opt, value) {
        const id = `prop-${key}`;
        switch (opt.type) {
            case 'text':
            case 'number':
                return `<input id="${id}" type="${opt.type}" value="${value}" 
          min="${opt.min || ''}" max="${opt.max || ''}" step="${opt.step || '1'}">`;
            case 'select':
                return `<select id="${id}">
          ${opt.options.map(o => `
            <option value="${o}" ${o === value ? 'selected' : ''}>${o}</option>
          `).join('')}
        </select>`;
            case 'checkbox':
                return `<input id="${id}" type="checkbox" ${value ? 'checked' : ''}>`;
            default:
                return `<input id="${id}" type="text" value="${value}">`;
        }
    }

    saveProperties() {
        if (!this.selectedModule) return;
        const def = this.selectedModule.def;
        Object.keys(def.settings).forEach(key => {
            const opt = def.settings[key];
            const el = this.propsEl.querySelector(`#prop-${key}`);
            if (!el) return;
            let val = el.value;
            if (opt.type === 'checkbox') val = el.checked;
            if (opt.type === 'number' || opt.type === 'range') val = parseFloat(val);
            this.selectedModule.settings[key] = val;
        });
        this.showMessage('Настройки сохранены');
        this.saveHistory();
    }

    removeSelected() {
        if (!this.selectedModule) return;
        const id = this.selectedModule.id;
        this.modules = this.modules.filter(m => m.id !== id);
        const el = this.canvasEl.querySelector(`[data-id="${id}"]`);
        if (el) el.remove();
        this.clearSelection();
        this.saveHistory();
    }

    resetBuilder() {
        this.modules = [];
        this.canvasEl.innerHTML = '';
        this.clearSelection();
        this.saveHistory();
    }

    exportJSON() {
        const data = {
            modules: this.modules,
            connections: this.connections
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'attack-workflow.json';
        a.click();
        URL.revokeObjectURL(url);
    }

    importJSON() {
        const input = document.createElement('input');
        input.type = 'file'; input.accept = 'application/json';
        input.addEventListener('change', e => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = evt => this.loadFromJSON(evt.target.result);
            reader.readAsText(file);
        });
        input.click();
    }

    loadFromJSON(text) {
        try {
            const data = JSON.parse(text);
            this.resetBuilder();
            data.modules.forEach(mod => this.addModuleInstance(mod.def, mod.x, mod.y));
            this.connections = data.connections || [];
            this.showMessage('Импорт завершен');
        } catch {
            this.showMessage('Ошибка импорта', 'error');
        }
    }

    loadTemplate(templateId) {
        const tpl = WORKFLOW_TEMPLATES.find(t => t.id === templateId);
        if (!tpl) return;
        this.resetBuilder();
        tpl.modules.forEach(item => {
            const def = MODULE_CATEGORIES.flatMap(c => c.modules).find(m => m.id === item.moduleId);
            this.addModuleInstance(def, item.position.x, item.position.y);
        });
    }

    undo() {
        if (this.historyIndex <= 0) return;
        this.historyIndex--;
        this.applyHistory();
    }

    redo() {
        if (this.historyIndex >= this.history.length - 1) return;
        this.historyIndex++;
        this.applyHistory();
    }

    saveHistory() {
        // simple snapshot
        this.history = this.history.slice(0, this.historyIndex + 1);
        this.history.push(JSON.stringify({ modules: this.modules, connections: this.connections }));
        this.historyIndex = this.history.length - 1;
    }

    applyHistory() {
        const snapshot = JSON.parse(this.history[this.historyIndex]);
        this.resetBuilder();
        snapshot.modules.forEach(mod => this.addModuleInstance(mod.def, mod.x, mod.y));
        this.connections = snapshot.connections;
    }

    showMessage(text, type = 'success') {
        // временное уведомление
        const msg = document.createElement('div');
        msg.className = `notification notification-${type}`;
        msg.textContent = text;
        document.body.append(msg);
        setTimeout(() => msg.remove(), 3000);
    }
}
