/**
 * IP Roast Enterprise 4.0 — Common UI Components
 * Универсальные компоненты для приложения
 * Версия: Enterprise 4.0
 */

export class Button {
    /**
     * Создаёт кнопку с иконкой и текстом
     * @param {Object} options
     * @param {string} options.text — Текст на кнопке
     * @param {string} [options.icon] — CSS-класс иконки (например, 'icon-refresh')
     * @param {string} [options.variant] — 'primary'|'secondary'|'danger'|'link'
     * @param {Function} [options.onClick] — Обработчик клика
     */
    constructor({ text, icon, variant = 'primary', onClick } = {}) {
        this.button = document.createElement('button');
        this.button.classList.add('btn', `btn--${variant}`);
        if (icon) {
            const i = document.createElement('i');
            i.className = icon;
            this.button.append(i);
        }
        this.button.insertAdjacentText('beforeend', text);
        if (onClick) this.button.addEventListener('click', onClick);
    }

    mount(parent) {
        const container = parent instanceof HTMLElement ? parent : document.querySelector(parent);
        container.appendChild(this.button);
    }

    setLoading(isLoading) {
        if (isLoading) {
            this.button.disabled = true;
            this.button.classList.add('btn--loading');
        } else {
            this.button.disabled = false;
            this.button.classList.remove('btn--loading');
        }
    }
}

export class Spinner {
    /**
     * Индикатор загрузки
     * @param {Object} options
     * @param {number} [options.size=24] — Размер в пикселях
     * @param {string} [options.color] — CSS-цвет
     */
    constructor({ size = 24, color } = {}) {
        this.el = document.createElement('div');
        this.el.classList.add('spinner');
        this.el.style.width = `${size}px`;
        this.el.style.height = `${size}px`;
        if (color) this.el.style.borderTopColor = color;
    }

    mount(parent) {
        const container = parent instanceof HTMLElement ? parent : document.querySelector(parent);
        container.appendChild(this.el);
    }

    show() {
        this.el.classList.remove('hidden');
    }

    hide() {
        this.el.classList.add('hidden');
    }
}

export class TabView {
    /**
     * Создаёт таб-контейнер
     * @param {string} containerSelector
     */
    constructor(containerSelector) {
        this.container = document.querySelector(containerSelector);
        this.tabButtons = Array.from(this.container.querySelectorAll('[data-tab]'));
        this.tabPanels = Array.from(this.container.querySelectorAll('.tab-panel'));
        this.tabButtons.forEach(btn =>
            btn.addEventListener('click', () => this.activate(btn.dataset.tab))
        );
    }

    activate(tabId) {
        this.tabButtons.forEach(btn =>
            btn.classList.toggle('active', btn.dataset.tab === tabId)
        );
        this.tabPanels.forEach(panel =>
            panel.classList.toggle('hidden', panel.dataset.panel !== tabId)
        );
    }
}
