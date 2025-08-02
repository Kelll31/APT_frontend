import { IPRoastAPI } from '../../shared/utils/api.js';
import { $, $$, addClass, removeClass } from '../../shared/utils/helpers.js';

export class NetworkTopologyController {
    /**
     * @param {{ container: string }} options
     */
    constructor({ container }) {
        this.container = document.querySelector(container);
        this.mapViewport = this.container.querySelector('.network-map-viewport');
        this.canvas = this.container.querySelector('.map-canvas');
        this.minimap = this.container.querySelector('.network-map-minimap');
        this.legend = this.container.querySelector('.network-map-legend');
        this.deviceDetails = null;
        this._init();
    }

    async _init() {
        addClass(this.container, 'loading');
        try {
            // Получаем исходные координаты и узлы
            const data = await IPRoastAPI.analytics.getNetworkTopology();
            this._renderSegments(data.segments);
            this._renderDevices(data.devices);
            this._renderConnections(data.connections);
            this._setupInteractions();
        } catch (e) {
            console.error('Ошибка загрузки топологии', e);
            this._showError('Не удалось загрузить топологию сети');
        } finally {
            removeClass(this.container, 'loading');
        }
    }

    _renderSegments(segments) {
        segments.forEach(seg => {
            const el = document.createElement('div');
            el.className = `network-segment ${seg.type}`;
            el.style.width = seg.width + 'px';
            el.style.height = seg.height + 'px';
            el.style.left = seg.x + 'px';
            el.style.top = seg.y + 'px';
            el.setAttribute('data-label', seg.label);
            this.canvas.appendChild(el);
        });
    }

    _renderDevices(devices) {
        devices.forEach(dev => {
            const wrapper = document.createElement('div');
            wrapper.className = `network-device ${dev.type}`;
            wrapper.style.left = dev.x + 'px';
            wrapper.style.top = dev.y + 'px';
            wrapper.setAttribute('data-id', dev.id);
            wrapper.innerHTML = `
        <div class="device-icon-container">
          <i class="device-icon ${dev.icon}"></i>
          <div class="device-status-indicator ${dev.status}"></div>
        </div>
        <div class="device-label">${dev.name}</div>
      `;
            this.canvas.appendChild(wrapper);
        });
    }

    _renderConnections(conns) {
        const svgNS = 'http://www.w3.org/2000/svg';
        conns.forEach(c => {
            const line = document.createElementNS(svgNS, 'line');
            line.classList.add('connection-line', c.medium);
            line.setAttribute('x1', c.from.x);
            line.setAttribute('y1', c.from.y);
            line.setAttribute('x2', c.to.x);
            line.setAttribute('y2', c.to.y);
            line.setAttribute('data-id', c.id);
            this.canvas.appendChild(line);
        });
    }

    _setupInteractions() {
        // Перетаскивание карты
        let isDragging = false, start = {};
        this.mapViewport.addEventListener('mousedown', e => {
            isDragging = true;
            start = { x: e.clientX, y: e.clientY };
            addClass(this.mapViewport, 'dragging');
        });
        document.addEventListener('mousemove', e => {
            if (!isDragging) return;
            const dx = e.clientX - start.x, dy = e.clientY - start.y;
            this.canvas.style.transform = `translate(${dx}px, ${dy}px)`;
        });
        document.addEventListener('mouseup', () => {
            isDragging = false;
            removeClass(this.mapViewport, 'dragging');
        });

        // Клик по устройству
        this.canvas.addEventListener('click', async e => {
            const devEl = e.target.closest('.network-device');
            if (!devEl) return;
            const id = devEl.dataset.id;
            await this._showDeviceDetails(id);
        });
    }

    async _showDeviceDetails(deviceId) {
        if (this.deviceDetails) {
            this.deviceDetails.remove();
            this.deviceDetails = null;
        }
        try {
            const dev = await IPRoastAPI.devices.getDevice(deviceId);
            this.deviceDetails = document.createElement('div');
            this.deviceDetails.className = 'device-details-panel';
            this.deviceDetails.innerHTML = `
        <div class="device-header">
          <div class="device-info">
            <div class="device-icon ${dev.type}"></div>
            <div class="device-primary-info">
              <h3 class="device-name">${dev.name}</h3>
              <p class="device-type">${dev.type.toUpperCase()}</p>
              <p class="device-ip">${dev.ip}</p>
            </div>
          </div>
        </div>
        <div class="device-details-content">
          <!-- Здесь будут секции спецификаций и интерфейсов -->
        </div>
      `;
            this.container.appendChild(this.deviceDetails);
        } catch (e) {
            console.error('Ошибка загрузки данных устройства', e);
            this._showError('Не удалось загрузить данные устройства');
        }
    }

    _showError(msg) {
        const err = document.createElement('div');
        err.className = 'network-map-error';
        err.textContent = msg;
        this.container.appendChild(err);
    }
}
