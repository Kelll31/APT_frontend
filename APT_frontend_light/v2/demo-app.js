// IP ROAST 4.0 Demo Application
class IPRoastDemo {
    constructor() {
        this.currentPage = 'dashboard';
        this.scanProgress = 0;
        this.scanInterval = null;
        this.isScanning = false;

        // Демо данные
        this.stats = {
            activeScans: 3,
            discoveredHosts: 47, 
            openPorts: 156,
            vulnerabilities: 8
        };

        this.activityData = [
            {
                type: 'info',
                title: 'Новое устройство обнаружено',
                time: '2 минуты назад',
                icon: 'fas fa-plus-circle'
            },
            {
                type: 'warning', 
                title: 'Подозрительное сканирование портов',
                time: '5 минут назад',
                icon: 'fas fa-exclamation-triangle'
            },
            {
                type: 'error',
                title: 'Критическая уязвимость найдена',
                time: '10 минут назад', 
                icon: 'fas fa-bug'
            },
            {
                type: 'info',
                title: 'Сканирование завершено успешно',
                time: '15 минут назад',
                icon: 'fas fa-check-circle'
            }
        ];

        this.scanResults = [
            {
                ip: '192.168.1.1',
                hostname: 'router.local',
                ports: [22, 80, 443],
                services: {
                    22: 'SSH-2.0-OpenSSH_7.6',
                    80: 'Server: Apache/2.4.41',
                    443: 'SSL/TLS Certificate'
                },
                os: 'Linux',
                risk: 'medium'
            },
            {
                ip: '192.168.1.10', 
                hostname: 'workstation-01',
                ports: [135, 139, 445],
                services: {
                    135: 'Microsoft RPC',
                    139: 'NetBIOS Session Service',
                    445: 'Microsoft SMB'
                },
                os: 'Windows 10',
                risk: 'high'
            },
            {
                ip: '192.168.1.15',
                hostname: 'server-db',
                ports: [3306, 22, 80],
                services: {
                    3306: 'MySQL 5.7.32',
                    22: 'SSH-2.0-OpenSSH_7.6',
                    80: 'Server: nginx/1.18.0'
                },
                os: 'Ubuntu 20.04',
                risk: 'critical'
            }
        ];

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.hideLoadingScreen();
        this.loadDashboard();
        this.startLiveUpdates();
    }

    // Скрытие загрузочного экрана
    hideLoadingScreen() {
        const loadingTexts = [
            'Загружаем модули сигнатурного анализа...',
            'Инициализируем интеллектуальный движок...',
            'Подключаем базу сигнатур...',
            'Активируем 25 модулей атак...',
            'Система готова к работе!'
        ];

        let currentText = 0;
        const loadingTextElement = document.querySelector('.loading-text');
        const progressBar = document.querySelector('.loading-progress');

        const updateLoading = () => {
            if (currentText < loadingTexts.length) {
                loadingTextElement.textContent = loadingTexts[currentText];
                progressBar.style.width = `${(currentText + 1) * 20}%`;
                currentText++;
                setTimeout(updateLoading, 800);
            } else {
                setTimeout(() => {
                    document.getElementById('loading-overlay').classList.add('hidden');
                }, 500);
            }
        };

        setTimeout(updateLoading, 1000);
    }

    // Настройка обработчиков событий
    setupEventListeners() {
        // Навигация
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const page = item.getAttribute('data-page');
                this.navigateToPage(page);
            });
        });

        // Быстрые действия
        document.querySelectorAll('.action-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const page = card.getAttribute('data-page');
                if (page) {
                    this.navigateToPage(page);
                }
            });
        });

        // Кнопка запуска сканирования
        const startScanBtn = document.getElementById('start-scan');
        if (startScanBtn) {
            startScanBtn.addEventListener('click', () => {
                this.startScan();
            });
        }

        // Модальное окно помощи
        document.querySelector('[title="Помощь"]').addEventListener('click', () => {
            this.showInfoModal();
        });

        // Закрытие модального окна
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-close') || e.target.classList.contains('modal')) {
                this.hideInfoModal();
            }
        });
    }

    // Навигация между страницами
    navigateToPage(pageId) {
        // Скрыть все страницы
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        // Показать выбранную страницу
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('active');
        }

        // Обновить навигацию
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });

        const activeNavItem = document.querySelector(`[data-page="${pageId}"]`);
        if (activeNavItem && activeNavItem.classList.contains('nav-item')) {
            activeNavItem.classList.add('active');
        }

        this.currentPage = pageId;

        // Загрузить контент страницы
        switch (pageId) {
            case 'dashboard':
                this.loadDashboard();
                break;
            case 'signature-analysis':
                this.loadSignatureAnalysis();
                break;
            case 'intelligent-engine':
                this.loadIntelligentEngine();
                break;
            case 'attack-modules':
                this.loadAttackModules();
                break;
            case 'reports':
                this.loadReports();
                break;
        }
    }

    // Загрузка панели управления
    loadDashboard() {
        this.updateStats();
        this.loadActivityFeed();
        this.animateStatCards();
    }

    // Обновление статистики
    updateStats() {
        document.getElementById('active-scans').textContent = this.stats.activeScans;
        document.getElementById('discovered-hosts').textContent = this.stats.discoveredHosts;
        document.getElementById('open-ports').textContent = this.stats.openPorts;
        document.getElementById('vulnerabilities').textContent = this.stats.vulnerabilities;
    }

    // Загрузка ленты активности
    loadActivityFeed() {
        const activityList = document.getElementById('activity-list');
        if (!activityList) return;

        activityList.innerHTML = '';

        this.activityData.forEach((activity, index) => {
            const item = document.createElement('div');
            item.className = 'activity-item slide-in';
            item.style.animationDelay = `${index * 0.1}s`;

            item.innerHTML = `
                <div class="activity-icon ${activity.type}">
                    <i class="${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-time">${activity.time}</div>
                </div>
            `;

            activityList.appendChild(item);
        });
    }

    // Анимация статистических карточек
    animateStatCards() {
        const statCards = document.querySelectorAll('.stat-card');
        statCards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
            card.classList.add('slide-in');
        });
    }

    // Загрузка страницы сигнатурного анализа
    loadSignatureAnalysis() {
        // Здесь можно добавить дополнительную логику для страницы анализа
        console.log('Загружена страница сигнатурного анализа');
    }

    // Запуск сканирования
    startScan() {
        if (this.isScanning) return;

        const startBtn = document.getElementById('start-scan');
        const progressContainer = document.getElementById('scan-progress');
        const resultsContainer = document.getElementById('scan-results');

        // Показать прогресс
        progressContainer.classList.remove('hidden');
        startBtn.disabled = true;
        startBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Сканирование...';

        // Очистить результаты
        resultsContainer.innerHTML = '<div class="empty-state"><i class="fas fa-spinner fa-spin"></i><h4>Сканирование в процессе...</h4></div>';

        this.isScanning = true;
        this.scanProgress = 0;

        // Симуляция прогресса сканирования
        this.scanInterval = setInterval(() => {
            this.scanProgress += Math.random() * 15;

            if (this.scanProgress >= 100) {
                this.scanProgress = 100;
                this.completeScan();
            }

            this.updateScanProgress();
        }, 500);
    }

    // Обновление прогресса сканирования
    updateScanProgress() {
        const progressFill = document.querySelector('.progress-fill');
        const progressPercentage = document.querySelector('.progress-percentage');
        const scannedPorts = document.getElementById('scanned-ports');
        const foundServices = document.getElementById('found-services');
        const identifiedSignatures = document.getElementById('identified-signatures');

        if (progressFill) {
            progressFill.style.width = `${this.scanProgress}%`;
        }

        if (progressPercentage) {
            progressPercentage.textContent = `${Math.round(this.scanProgress)}%`;
        }

        // Обновление деталей сканирования
        if (scannedPorts) {
            scannedPorts.textContent = Math.round(this.scanProgress * 1.5);
        }

        if (foundServices) {
            foundServices.textContent = Math.round(this.scanProgress * 0.1);
        }

        if (identifiedSignatures) {
            identifiedSignatures.textContent = Math.round(this.scanProgress * 0.08);
        }
    }

    // Завершение сканирования
    completeScan() {
        clearInterval(this.scanInterval);
        this.isScanning = false;

        const startBtn = document.getElementById('start-scan');
        startBtn.disabled = false;
        startBtn.innerHTML = '<i class="fas fa-play"></i> Запустить сканирование';

        // Показать результаты
        setTimeout(() => {
            this.displayScanResults();
        }, 1000);
    }

    // Отображение результатов сканирования
    displayScanResults() {
        const resultsContainer = document.getElementById('scan-results');
        if (!resultsContainer) return;

        resultsContainer.innerHTML = '';

        this.scanResults.forEach((result, index) => {
            const resultItem = document.createElement('div');
            resultItem.className = 'scan-result-item slide-in';
            resultItem.style.animationDelay = `${index * 0.2}s`;

            const riskClass = result.risk === 'critical' ? 'error' : 
                             result.risk === 'high' ? 'warning' : 
                             result.risk === 'medium' ? 'info' : 'success';

            const servicesHtml = Object.entries(result.services)
                .map(([port, service]) => `
                    <div class="service-item">
                        <span class="port">${port}</span>
                        <span class="service">${service}</span>
                    </div>
                `).join('');

            resultItem.innerHTML = `
                <div class="result-header">
                    <div class="host-info">
                        <h4>${result.ip}</h4>
                        <span class="hostname">${result.hostname}</span>
                    </div>
                    <div class="risk-indicator ${riskClass}">
                        ${result.risk}
                    </div>
                </div>
                <div class="result-details">
                    <div class="detail-section">
                        <h5>Операционная система</h5>
                        <p>${result.os}</p>
                    </div>
                    <div class="detail-section">
                        <h5>Открытые порты и сервисы</h5>
                        <div class="services-list">
                            ${servicesHtml}
                        </div>
                    </div>
                </div>
            `;

            resultsContainer.appendChild(resultItem);
        });
    }

    // Загрузка интеллектуального движка
    loadIntelligentEngine() {
        // Анимация активности движка
        const statusIcon = document.querySelector('.status-icon.active');
        if (statusIcon) {
            statusIcon.style.animation = 'pulse-glow 2s infinite';
        }

        // Симуляция обновления метрик
        setTimeout(() => {
            this.updateEngineMetrics();
        }, 1000);
    }

    // Обновление метрик движка
    updateEngineMetrics() {
        const metrics = document.querySelectorAll('.metric-value');
        if (metrics.length >= 3) {
            this.animateNumber(metrics[0], 12);
            this.animateNumber(metrics[1], 7);
            // Третья метрика остается как текст "Высокий"
        }
    }

    // Анимация числа
    animateNumber(element, target) {
        let current = 0;
        const increment = target / 20;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.round(current);
        }, 50);
    }

    // Загрузка модулей атак
    loadAttackModules() {
        const moduleCards = document.querySelectorAll('.module-category-card');
        moduleCards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
            card.classList.add('slide-in');
        });
    }

    // Загрузка отчетов
    loadReports() {
        const reportCards = document.querySelectorAll('.report-card');
        reportCards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
            card.classList.add('slide-in');
        });
    }

    // Показать модальное окно с информацией
    showInfoModal() {
        const modal = document.getElementById('info-modal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    }

    // Скрыть модальное окно
    hideInfoModal() {
        const modal = document.getElementById('info-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    // Запуск обновлений в реальном времени
    startLiveUpdates() {
        // Обновление активности каждые 30 секунд
        setInterval(() => {
            if (this.currentPage === 'dashboard') {
                this.addRandomActivity();
            }
        }, 30000);

        // Обновление статистики каждые 10 секунд
        setInterval(() => {
            this.updateLiveStats();
        }, 10000);
    }

    // Добавление случайной активности
    addRandomActivity() {
        const randomActivities = [
            {
                type: 'info',
                title: 'Обновлена база сигнатур',
                time: 'только что',
                icon: 'fas fa-database'
            },
            {
                type: 'warning',
                title: 'Обнаружен новый хост',
                time: 'только что',
                icon: 'fas fa-server'
            },
            {
                type: 'info',
                title: 'Модуль атак активирован',
                time: 'только что', 
                icon: 'fas fa-rocket'
            }
        ];

        const randomActivity = randomActivities[Math.floor(Math.random() * randomActivities.length)];

        // Добавить в начало массива
        this.activityData.unshift(randomActivity);

        // Ограничить до 10 элементов
        if (this.activityData.length > 10) {
            this.activityData = this.activityData.slice(0, 10);
        }

        // Обновить время для существующих элементов
        this.activityData.forEach((activity, index) => {
            if (index > 0) {
                const minutes = index * 5;
                activity.time = `${minutes} минут${minutes === 1 ? 'у' : minutes < 5 ? 'ы' : ''} назад`;
            }
        });

        this.loadActivityFeed();
    }

    // Обновление статистики в реальном времени
    updateLiveStats() {
        // Небольшие случайные изменения в статистике
        this.stats.activeScans += Math.floor(Math.random() * 3) - 1;
        this.stats.discoveredHosts += Math.floor(Math.random() * 2);
        this.stats.openPorts += Math.floor(Math.random() * 5) - 2;
        this.stats.vulnerabilities += Math.floor(Math.random() * 2) - 1;

        // Обеспечить минимальные значения
        this.stats.activeScans = Math.max(0, this.stats.activeScans);
        this.stats.vulnerabilities = Math.max(0, this.stats.vulnerabilities);

        if (this.currentPage === 'dashboard') {
            this.updateStats();
        }
    }
}

// Дополнительные CSS стили для результатов сканирования
const additionalStyles = `
<style>
.scan-result-item {
    background: var(--color-bg-card);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: var(--space-lg);
    margin-bottom: var(--space-md);
    transition: all var(--transition-fast);
}

.scan-result-item:hover {
    border-color: var(--color-primary);
    box-shadow: var(--shadow-md);
}

.result-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-md);
    padding-bottom: var(--space-md);
    border-bottom: 1px solid var(--color-border);
}

.host-info h4 {
    margin-bottom: var(--space-xs);
    color: var(--color-text-primary);
}

.hostname {
    color: var(--color-text-muted);
    font-size: 0.9rem;
}

.risk-indicator {
    padding: var(--space-xs) var(--space-md);
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
}

.risk-indicator.error {
    background: rgba(253, 121, 168, 0.2);
    color: var(--color-error);
}

.risk-indicator.warning {
    background: rgba(253, 203, 110, 0.2);
    color: var(--color-warning);
}

.risk-indicator.info {
    background: rgba(108, 92, 231, 0.2);
    color: var(--color-info);
}

.risk-indicator.success {
    background: rgba(0, 206, 201, 0.2);
    color: var(--color-success);
}

.result-details {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: var(--space-lg);
}

.detail-section h5 {
    margin-bottom: var(--space-sm);
    color: var(--color-primary);
    font-size: 0.9rem;
}

.detail-section p {
    color: var(--color-text-secondary);
    margin: 0;
}

.services-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
}

.service-item {
    display: flex;
    justify-content: space-between;
    padding: var(--space-xs) var(--space-sm);
    background: rgba(0, 212, 170, 0.05);
    border-radius: var(--radius-sm);
    font-size: 0.85rem;
}

.port {
    color: var(--color-primary);
    font-weight: 600;
    font-family: var(--font-mono);
}

.service {
    color: var(--color-text-secondary);
    font-family: var(--font-mono);
}

@media (max-width: 768px) {
    .result-details {
        grid-template-columns: 1fr;
    }

    .result-header {
        flex-direction: column;
        gap: var(--space-sm);
        align-items: flex-start;
    }
}
</style>
`;

// Инициализация приложения после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    // Добавить дополнительные стили
    document.head.insertAdjacentHTML('beforeend', additionalStyles);

    // Запустить приложение
    const app = new IPRoastDemo();

    // Сделать доступным глобально для отладки
    window.ipRoastDemo = app;
});

// Дополнительные утилиты
class Utils {
    static formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    static formatUpTime(seconds) {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);

        if (days > 0) return `${days}д ${hours}ч`;
        if (hours > 0) return `${hours}ч ${minutes}м`;
        return `${minutes}м`;
    }

    static generateId() {
        return '_' + Math.random().toString(36).substr(2, 9);
    }
}

// Экспорт для использования в модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { IPRoastDemo, Utils };
}