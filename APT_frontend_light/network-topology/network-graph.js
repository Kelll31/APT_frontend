import { IPRoastAPI } from '../shared/utils/api.js';
import { $, addClass, removeClass } from '../shared/utils/helpers.js';

export class NetworkGraphController {
    /**
     * @param {{ container: string }} options
     */
    constructor({ container }) {
        this.container = document.querySelector(container);
        this.svg = null;
        this._init();
    }

    async _init() {
        addClass(this.container, 'loading');
        try {
            const data = await IPRoastAPI.analytics.getNetworkTopology();
            this._createSvgCanvas();
            this._drawGrid();
            this._drawNodes(data.devices);
            this._drawLinks(data.connections);
            this._setupInteractions();
        } catch (e) {
            console.error('Ошибка загрузки графа', e);
            this._showError('Не удалось загрузить сетевой граф');
        } finally {
            removeClass(this.container, 'loading');
        }
    }

    _createSvgCanvas() {
        const svgNS = 'http://www.w3.org/2000/svg';
        this.svg = document.createElementNS(svgNS, 'svg');
        this.svg.classList.add('network-graph-canvas');
        this.svg.setAttribute('width', '100%');
        this.svg.setAttribute('height', '100%');
        this.container.appendChild(this.svg);
    }

    _drawGrid() {
        const { width, height } = this.container.getBoundingClientRect();
        const grid = document.createElementNS(this.svg.namespaceURI, 'g');
        grid.classList.add('graph-grid');
        const step = 20;
        for (let x = 0; x < width; x += step) {
            const line = document.createElementNS(this.svg.namespaceURI, 'line');
            line.setAttribute('x1', x);
            line.setAttribute('y1', 0);
            line.setAttribute('x2', x);
            line.setAttribute('y2', height);
            grid.appendChild(line);
        }
        for (let y = 0; y < height; y += step) {
            const line = document.createElementNS(this.svg.namespaceURI, 'line');
            line.setAttribute('x1', 0);
            line.setAttribute('y1', y);
            line.setAttribute('x2', width);
            line.setAttribute('y2', y);
            grid.appendChild(line);
        }
        this.svg.appendChild(grid);
    }

    _drawNodes(devices) {
        const svgNS = this.svg.namespaceURI;
        devices.forEach(d => {
            const g = document.createElementNS(svgNS, 'g');
            g.classList.add('network-node');
            g.setAttribute('data-id', d.id);
            const circle = document.createElementNS(svgNS, 'circle');
            circle.classList.add('node-circle', d.type);
            circle.setAttribute('cx', d.x);
            circle.setAttribute('cy', d.y);
            circle.setAttribute('r', 12);
            g.appendChild(circle);
            const icon = document.createElementNS(svgNS, 'text');
            icon.classList.add('node-icon');
            icon.setAttribute('x', d.x);
            icon.setAttribute('y', d.y);
            icon.textContent = d.iconChar;
            g.appendChild(icon);
            const label = document.createElementNS(svgNS, 'text');
            label.classList.add('node-label');
            label.setAttribute('x', d.x);
            label.setAttribute('y', d.y + 16);
            label.textContent = d.name;
            g.appendChild(label);
            this.svg.appendChild(g);
        });
    }

    _drawLinks(conns) {
        const svgNS = this.svg.namespaceURI;
        conns.forEach(c => {
            const path = document.createElementNS(svgNS, 'line');
            path.classList.add('network-link', c.medium);
            path.setAttribute('x1', c.from.x);
            path.setAttribute('y1', c.from.y);
            path.setAttribute('x2', c.to.x);
            path.setAttribute('y2', c.to.y);
            this.svg.appendChild(path);
        });
    }

    _setupInteractions() {
        // Наведение и выбор узлов
        this.svg.addEventListener('mouseover', e => {
            const g = e.target.closest('.network-node');
            if (g) addClass(g, 'highlighted');
        });
        this.svg.addEventListener('mouseout', e => {
            const g = e.target.closest('.network-node');
            if (g) removeClass(g, 'highlighted');
        });
        this.svg.addEventListener('click', e => {
            const g = e.target.closest('.network-node');
            if (g) {
                // TODO: Emit selection event
                const id = g.dataset.id;
                console.log('Node clicked', id);
            }
        });
    }

    _showError(msg) {
        this.container.innerHTML = `<div class="network-graph-error">${msg}</div>`;
    }
}
