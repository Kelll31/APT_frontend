// IP Roast Pro - Энтерпрайз платформа кибербезопасности
class IPRoastPro {
    constructor() {
        this.currentPage = 'dashboard';
        this.charts = {};
        this.scanningInterval = null;
        this.moduleBuilder = null;
        this.selectedModule = null;
        this.workflow = [];
        this.connectionLines = [];
        this.settings = {};
        this.notifications = [];

        // Данные приложения на русском языке
        this.stats = {
            activeScans: 3,
            discoveredHosts: 47,
            openPorts: 156,
            vulnerabilities: 8
        };

        this.networkDevices = [
            {
                id: 1,
                ip: "192.168.1.1",
                hostname: "router.local",
                status: "active",
                ports: [22, 80, 443],
                os: "Linux",
                vendor: "Cisco",
                risk: "low",
                lastSeen: "2025-01-15 10:30:00",
                services: {
                    22: "OpenSSH 7.6",
                    80: "Apache httpd 2.4.41",
                    443: "SSL/TLS"
                }
            },
            {
                id: 2,
                ip: "192.168.1.10",
                hostname: "workstation-01",
                status: "active",
                ports: [135, 139, 445],
                os: "Windows 10",
                vendor: "Microsoft",
                risk: "medium",
                lastSeen: "2025-01-15 10:28:00",
                services: {
                    135: "Microsoft RPC",
                    139: "NetBIOS Session",
                    445: "Microsoft SMB"
                }
            },
            {
                id: 3,
                ip: "192.168.1.15",
                hostname: "server-db",
                status: "active",
                ports: [3306, 22, 80],
                os: "Ubuntu",
                vendor: "Canonical",
                risk: "high",
                lastSeen: "2025-01-15 10:25:00",
                services: {
                    3306: "MySQL 5.7.32",
                    22: "OpenSSH 7.6",
                    80: "nginx 1.18.0"
                }
            }
        ];

        this.attackModules = [
            {
                category: "Разведка",
                modules: [
                    {
                        id: "recon_port_scan",
                        name: "Сканер портов",
                        description: "Сканирование портов целевых хостов",
                        icon: "fas fa-search",
                        params: {
                            ports: "1-65535",
                            timeout: 1000,
                            threads: 100
                        }
                    },
                    {
                        id: "recon_service_enum",
                        name: "Перечисление сервисов",
                        description: "Идентификация запущенных сервисов",
                        icon: "fas fa-list",
                        params: {
                            intensity: 4,
                            version_detection: true
                        }
                    },
                    {
                        id: "recon_dns_lookup",
                        name: "DNS запросы",
                        description: "Разрешение имен хостов",
                        icon: "fas fa-globe",
                        params: {
                            record_types: ["A", "AAAA", "MX", "NS"],
                            recursive: true
                        }
                    }
                ]
            },
            {
                category: "Эксплуатация",
                modules: [
                    {
                        id: "exploit_ssh_brute",
                        name: "Брутфорс SSH",
                        description: "Подбор SSH учетных данных",
                        icon: "fas fa-key",
                        params: {
                            wordlist: "common_passwords.txt",
                            threads: 10,
                            delay: 100
                        }
                    },
                    {
                        id: "exploit_web_vuln",
                        name: "Веб-уязвимости",
                        description: "Эксплуатация веб-уязвимостей",
                        icon: "fas fa-bug",
                        params: {
                            scan_types: ["xss", "sqli", "lfi"],
                            deep_scan: false
                        }
                    },
                    {
                        id: "exploit_buffer_overflow",
                        name: "Переполнение буфера",
                        description: "Выполнение атак переполнения буфера",
                        icon: "fas fa-bomb",
                        params: {
                            payload_type: "shellcode",
                            architecture: "x86_64"
                        }
                    }
                ]
            },
            {
                category: "Пост-эксплуатация",
                modules: [
                    {
                        id: "post_file_collect",
                        name: "Сбор файлов",
                        description: "Сбор конфиденциальных файлов",
                        icon: "fas fa-file",
                        params: {
                            file_types: [".txt", ".doc", ".pdf"],
                            max_size: "10MB"
                        }
                    },
                    {
                        id: "post_privilege_esc",
                        name: "Повышение привилегий",
                        description: "Повышение привилегий в системе",
                        icon: "fas fa-arrow-up",
                        params: {
                            method: "auto",
                            verify_success: true
                        }
                    },
                    {
                        id: "post_persistence",
                        name: "Закрепление",
                        description: "Поддержание доступа к системе",
                        icon: "fas fa-anchor",
                        params: {
                            persistence_type: "service",
                            stealth_mode: true
                        }
                    }
                ]
            }
        ];

        this.reports = [
            {
                id: 1,
                name: "Оценка сетевой безопасности",
                date: "2025-01-15",
                type: "Сканирование уязвимостей",
                status: "Завершен",
                criticalIssues: 2,
                size: "2.4 MB"
            },
            {
                id: 2,
                name: "Отчет тестирования на проникновение",
                date: "2025-01-12",
                type: "Пентест",
                status: "Завершен",
                criticalIssues: 5,
                size: "4.1 MB"
            },
            {
                id: 3,
                name: "Анализ соответствия требованиям",
                date: "2025-01-10",
                type: "Комплаенс",
                status: "В процессе",
                criticalIssues: 0,
                size: "1.8 MB"
            }
        ];

        this.workflowTemplates = [
            {
                id: 'basic_recon',
                name: 'Базовая разведка',
                description: 'Стандартное обнаружение и перечисление сети',
                modules: ['recon_port_scan', 'recon_service_enum', 'recon_dns_lookup'],
                estimatedTime: "15 минут"
            },
            {
                id: 'web_attack',
                name: 'Атака на веб-приложение',
                description: 'Комплексное тестирование безопасности веб-приложений',
                modules: ['recon_port_scan', 'exploit_web_vuln', 'post_file_collect'],
                estimatedTime: "45 минут"
            },
            {
                id: 'privilege_escalation',
                name: 'Цепочка повышения привилегий',
                description: 'Получение повышенных привилегий и поддержание доступа',
                modules: ['exploit_ssh_brute', 'post_privilege_esc', 'post_persistence'],
                estimatedTime: "30 минут"
            }
        ];

        this.activityFeed = [
            {
                type: 'info',
                title: 'Новое устройство обнаружено',
                time: '2 минуты назад',
                icon: 'fas fa-plus-circle',
                details: '192.168.1.25 добавлен в список хостов'
            },
            {
                type: 'warning',
                title: 'Обнаружено подозрительное сканирование портов',
                time: '5 минут назад',
                icon: 'fas fa-exclamation-triangle',
                details: 'Источник: 192.168.1.100'
            },
            {
                type: 'error',
                title: 'Найдена критическая уязвимость',
                time: '10 минут назад',
                icon: 'fas fa-bug',
                details: 'CVE-2024-1234 на 192.168.1.15'
            },
            {
                type: 'info',
                title: 'Сканирование завершено успешно',
                time: '15 минут назад',
                icon: 'fas fa-check-circle',
                details: 'Обработано 47 хостов, найдено 8 уязвимостей'
            }
        ];

        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupDashboard();
        this.setupNetworkRecon();
        this.setupAttackModules();
        this.setupReports();
        this.setupSettings();
        this.loadDashboard();
        this.hideLoadingOverlay();
        this.setupEventListeners();
        this.loadSettings();
    }

    hideLoadingOverlay() {
        setTimeout(() => {
            const overlay = document.getElementById('loading-overlay');
            if (overlay) {
                overlay.classList.add('hidden');
            }
        }, 2000);
    }

    // Система навигации
    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        const actionCards = document.querySelectorAll('.action-card');

        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.getAttribute('data-page');
                this.navigateToPage(page);
            });
        });

        actionCards.forEach(card => {
            card.addEventListener('click', (e) => {
                const page = card.getAttribute('data-page');
                if (page) {
                    this.navigateToPage(page);
                }
            });
        });
    }

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
            case 'network-recon':
                this.loadNetworkRecon();
                break;
            case 'attack-modules':
                this.loadAttackModules();
                break;
            case 'reports':
                this.loadReports();
                break;
            case 'settings':
                this.loadSettings();
                break;
        }
    }

    // Реализация панели управления
    setupDashboard() {
        // Настройка графиков и статистики
        this.setupCharts();
    }

    setupCharts() {
        // Создание графиков с Chart.js
        if (typeof Chart !== 'undefined') {
            const ctx = document.getElementById('activity-chart');
            if (ctx) {
                this.charts.activity = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
                        datasets: [
                            {
                                label: 'Сканирования',
                                data: [12, 19, 3, 5, 2, 3],
                                borderColor: 'rgba(50, 184, 198, 1)',
                                backgroundColor: 'rgba(50, 184, 198, 0.1)',
                                tension: 0.4
                            },
                            {
                                label: 'Обнаружения',
                                data: [2, 3, 20, 5, 1, 4],
                                borderColor: 'rgba(16, 185, 129, 1)',
                                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                tension: 0.4
                            },
                            {
                                label: 'Уязвимости',
                                data: [1, 2, 1, 3, 5, 2],
                                borderColor: 'rgba(255, 84, 89, 1)',
                                backgroundColor: 'rgba(255, 84, 89, 0.1)',
                                tension: 0.4
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'bottom',
                                labels: {
                                    color: '#f5f5f5',
                                    usePointStyle: true
                                }
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                grid: {
                                    color: 'rgba(255, 255, 255, 0.1)'
                                },
                                ticks: {
                                    color: '#f5f5f5'
                                }
                            },
                            x: {
                                grid: {
                                    color: 'rgba(255, 255, 255, 0.1)'
                                },
                                ticks: {
                                    color: '#f5f5f5'
                                }
                            }
                        }
                    }
                });
            }
        }
    }

    loadDashboard() {
        this.updateDashboardStats();
        this.loadActivityFeed();
        this.animateStatCards();

        // Запуск обновления в реальном времени
        this.startRealTimeUpdates();
    }

    updateDashboardStats() {
        document.getElementById('active-scans').textContent = this.stats.activeScans;
        document.getElementById('discovered-hosts').textContent = this.stats.discoveredHosts;
        document.getElementById('open-ports').textContent = this.stats.openPorts;
        document.getElementById('vulnerabilities').textContent = this.stats.vulnerabilities;
    }

    loadActivityFeed() {
        const activityList = document.getElementById('activity-list');
        if (!activityList) return;

        activityList.innerHTML = '';

        this.activityFeed.forEach((activity, index) => {
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
                    ${activity.details ? `<div class="activity-details">${activity.details}</div>` : ''}
                </div>
            `;

            activityList.appendChild(item);
        });
    }

    animateStatCards() {
        const statCards = document.querySelectorAll('.stat-card');
        statCards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
            card.classList.add('slide-in');
        });
    }

    // Сетевая разведка
    setupNetworkRecon() {
        const startScanBtn = document.getElementById('start-scan-btn');
        if (startScanBtn) {
            startScanBtn.addEventListener('click', () => {
                this.startNetworkScan();
            });
        }
    }

    loadNetworkRecon() {
        this.loadDiscoveredDevices();
    }

    loadDiscoveredDevices() {
        const deviceList = document.getElementById('device-list');
        if (!deviceList) return;

        deviceList.innerHTML = '';

        this.networkDevices.forEach(device => {
            const deviceItem = document.createElement('div');
            deviceItem.className = 'device-item';

            const riskBadge = this.getRiskBadge(device.risk);
            const servicesList = Object.entries(device.services || {})
                .map(([port, service]) => `<span class="service-tag">${port}: ${service}</span>`)
                .join('');

            deviceItem.innerHTML = `
                <div class="device-header">
                    <div class="device-info">
                        <h4>${device.ip}</h4>
                        <span class="device-hostname">${device.hostname}</span>
                    </div>
                    <div class="device-status">
                        ${riskBadge}
                        <span class="status-indicator ${device.status}"></span>
                    </div>
                </div>
                <div class="device-details">
                    <div class="device-detail">
                        <strong>ОС:</strong> ${device.os}
                    </div>
                    <div class="device-detail">
                        <strong>Вендор:</strong> ${device.vendor}
                    </div>
                    <div class="device-detail">
                        <strong>Последний раз виден:</strong> ${device.lastSeen}
                    </div>
                    <div class="device-services">
                        <strong>Сервисы:</strong>
                        <div class="services-list">${servicesList}</div>
                    </div>
                </div>
            `;

            deviceList.appendChild(deviceItem);
        });
    }

    getRiskBadge(risk) {
        const badges = {
            low: '<span class="badge badge--success">Низкий</span>',
            medium: '<span class="badge badge--warning">Средний</span>',
            high: '<span class="badge badge--error">Высокий</span>',
            critical: '<span class="badge badge--error">Критический</span>'
        };
        return badges[risk] || badges.low;
    }

    startNetworkScan() {
        const progressContainer = document.getElementById('scan-progress');
        const startBtn = document.getElementById('start-scan-btn');

        if (progressContainer) {
            progressContainer.classList.remove('hidden');
        }

        if (startBtn) {
            startBtn.classList.add('btn--loading');
            startBtn.disabled = true;
        }

        // Симуляция процесса сканирования
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;

            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                this.completeScan();
            }

            this.updateScanProgress(progress);
        }, 500);

        this.scanningInterval = interval;
    }

    updateScanProgress(progress) {
        const progressFill = document.getElementById('progress-fill');
        const progressPercentage = document.getElementById('scan-percentage');
        const scannedPorts = document.getElementById('scanned-ports');
        const foundHosts = document.getElementById('found-hosts');
        const detectedServices = document.getElementById('detected-services');

        if (progressFill) {
            progressFill.style.width = `${progress}%`;
        }

        if (progressPercentage) {
            progressPercentage.textContent = `${Math.round(progress)}%`;
        }

        if (scannedPorts) {
            scannedPorts.textContent = Math.round(progress * 2.5);
        }

        if (foundHosts) {
            foundHosts.textContent = Math.round(progress * 0.5);
        }

        if (detectedServices) {
            detectedServices.textContent = Math.round(progress * 0.3);
        }
    }

    completeScan() {
        const startBtn = document.getElementById('start-scan-btn');

        if (startBtn) {
            startBtn.classList.remove('btn--loading');
            startBtn.disabled = false;
        }

        // Показать уведомление об успешном завершении
        this.showToast('Сканирование завершено успешно', 'success');

        // Обновить список устройств
        this.loadDiscoveredDevices();
    }

    // Модули атак
    setupAttackModules() {
        this.setupModuleBuilder();
    }

    setupModuleBuilder() {
        const moduleCategories = document.getElementById('module-categories');
        if (!moduleCategories) return;

        moduleCategories.innerHTML = '';

        this.attackModules.forEach(category => {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'module-category';

            categoryDiv.innerHTML = `
                <div class="category-header">${category.category}</div>
                <div class="module-list" id="modules-${category.category.toLowerCase()}">
                    ${category.modules.map(module => `
                        <div class="module-item" data-module-id="${module.id}" draggable="true">
                            <div class="module-icon">
                                <i class="${module.icon}"></i>
                            </div>
                            <div class="module-info">
                                <div class="module-name">${module.name}</div>
                                <div class="module-description">${module.description}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;

            moduleCategories.appendChild(categoryDiv);
        });

        // Настройка drag & drop
        this.setupDragAndDrop();
    }

    setupDragAndDrop() {
        const moduleItems = document.querySelectorAll('.module-item');
        const canvas = document.getElementById('workflow-canvas');

        moduleItems.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', item.dataset.moduleId);
            });
        });

        if (canvas) {
            canvas.addEventListener('dragover', (e) => {
                e.preventDefault();
            });

            canvas.addEventListener('drop', (e) => {
                e.preventDefault();
                const moduleId = e.dataTransfer.getData('text/plain');
                this.addModuleToWorkflow(moduleId, e.offsetX, e.offsetY);
            });
        }
    }

    addModuleToWorkflow(moduleId, x, y) {
        const module = this.findModuleById(moduleId);
        if (!module) return;

        const canvas = document.getElementById('workflow-canvas');
        const placeholder = canvas.querySelector('.canvas-placeholder');

        if (placeholder) {
            placeholder.style.display = 'none';
        }

        const moduleElement = document.createElement('div');
        moduleElement.className = 'workflow-module';
        moduleElement.dataset.moduleId = moduleId;
        moduleElement.style.left = `${x - 50}px`;
        moduleElement.style.top = `${y - 25}px`;

        moduleElement.innerHTML = `
            <div class="workflow-module-header">
                <i class="${module.icon}"></i>
                <span>${module.name}</span>
                <button class="remove-module" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
            <div class="workflow-module-body">
                <div class="module-ports">
                    <div class="input-port"></div>
                    <div class="output-port"></div>
                </div>
            </div>
        `;

        canvas.appendChild(moduleElement);

        // Добавить в массив workflow
        this.workflow.push({
            id: moduleId,
            x: x,
            y: y,
            module: module
        });
    }

    findModuleById(moduleId) {
        for (const category of this.attackModules) {
            const module = category.modules.find(m => m.id === moduleId);
            if (module) return module;
        }
        return null;
    }

    loadAttackModules() {
        this.setupModuleBuilder();
        this.loadWorkflowTemplates();
    }

    loadWorkflowTemplates() {
        const templateGrid = document.getElementById('template-grid');
        if (!templateGrid) return;

        templateGrid.innerHTML = '';

        this.workflowTemplates.forEach(template => {
            const templateCard = document.createElement('div');
            templateCard.className = 'template-card';

            templateCard.innerHTML = `
                <div class="template-header">
                    <h4>${template.name}</h4>
                    <span class="template-time">${template.estimatedTime}</span>
                </div>
                <div class="template-description">
                    ${template.description}
                </div>
                <div class="template-modules">
                    <strong>Модули:</strong> ${template.modules.length}
                </div>
                <div class="template-actions">
                    <button class="btn btn--outline btn--sm" onclick="window.ipRoastPro.loadTemplate('${template.id}')">
                        Загрузить
                    </button>
                </div>
            `;

            templateGrid.appendChild(templateCard);
        });
    }

    loadTemplate(templateId) {
        const template = this.workflowTemplates.find(t => t.id === templateId);
        if (!template) return;

        // Очистить текущий workflow
        this.clearWorkflow();

        // Добавить модули из шаблона
        template.modules.forEach((moduleId, index) => {
            setTimeout(() => {
                this.addModuleToWorkflow(moduleId, 100 + index * 150, 100);
            }, index * 200);
        });

        this.showToast(`Шаблон "${template.name}" загружен`, 'success');
    }

    clearWorkflow() {
        const canvas = document.getElementById('workflow-canvas');
        const modules = canvas.querySelectorAll('.workflow-module');
        modules.forEach(module => module.remove());

        const placeholder = canvas.querySelector('.canvas-placeholder');
        if (placeholder) {
            placeholder.style.display = 'block';
        }

        this.workflow = [];
    }

    // Отчеты
    setupReports() {
        // Настройка системы отчетов
    }

    loadReports() {
        this.loadGeneratedReports();
        this.setupReportCharts();
    }

    loadGeneratedReports() {
        const reportsContainer = document.getElementById('generated-reports');
        if (!reportsContainer) return;

        reportsContainer.innerHTML = '';

        this.reports.forEach(report => {
            const reportItem = document.createElement('div');
            reportItem.className = 'report-item';

            const statusBadge = this.getStatusBadge(report.status);

            reportItem.innerHTML = `
                <div class="report-header">
                    <h4>${report.name}</h4>
                    ${statusBadge}
                </div>
                <div class="report-meta">
                    <span><i class="fas fa-calendar"></i> ${report.date}</span>
                    <span><i class="fas fa-tag"></i> ${report.type}</span>
                    <span><i class="fas fa-file"></i> ${report.size}</span>
                </div>
                <div class="report-stats">
                    <span class="critical-issues">
                        <i class="fas fa-exclamation-triangle"></i>
                        ${report.criticalIssues} критических проблем
                    </span>
                </div>
                <div class="report-actions">
                    <button class="btn btn--outline btn--sm">
                        <i class="fas fa-eye"></i> Просмотр
                    </button>
                    <button class="btn btn--outline btn--sm">
                        <i class="fas fa-download"></i> Скачать
                    </button>
                </div>
            `;

            reportsContainer.appendChild(reportItem);
        });
    }

    getStatusBadge(status) {
        const badges = {
            'Завершен': '<span class="badge badge--success">Завершен</span>',
            'В процессе': '<span class="badge badge--warning">В процессе</span>',
            'Ошибка': '<span class="badge badge--error">Ошибка</span>'
        };
        return badges[status] || badges['В процессе'];
    }

    setupReportCharts() {
        // Настройка графиков для отчетов
        if (typeof Chart !== 'undefined') {
            this.setupThreatDistributionChart();
            this.setupSecurityScoreChart();
        }
    }

    setupThreatDistributionChart() {
        const ctx = document.getElementById('threat-distribution-chart');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Критические', 'Высокие', 'Средние', 'Низкие'],
                datasets: [{
                    data: [8, 15, 23, 12],
                    backgroundColor: [
                        'rgba(255, 84, 89, 0.8)',
                        'rgba(230, 129, 97, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(16, 185, 129, 0.8)'
                    ],
                    borderWidth: 2,
                    borderColor: '#1f2121'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#f5f5f5',
                            usePointStyle: true
                        }
                    }
                }
            }
        });
    }

    setupSecurityScoreChart() {
        const ctx = document.getElementById('security-score-chart');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн'],
                datasets: [{
                    label: 'Оценка безопасности',
                    data: [65, 72, 68, 75, 82, 78],
                    borderColor: 'rgba(50, 184, 198, 1)',
                    backgroundColor: 'rgba(50, 184, 198, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#f5f5f5'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#f5f5f5'
                        }
                    }
                }
            }
        });
    }

    // Настройки
    setupSettings() {
        const settingsNavItems = document.querySelectorAll('.settings-nav-item');

        settingsNavItems.forEach(item => {
            item.addEventListener('click', () => {
                const section = item.dataset.section;
                this.showSettingsSection(section);

                // Обновить активный элемент навигации
                settingsNavItems.forEach(navItem => navItem.classList.remove('active'));
                item.classList.add('active');
            });
        });
    }

    showSettingsSection(sectionId) {
        // Скрыть все секции
        document.querySelectorAll('.settings-section').forEach(section => {
            section.classList.remove('active');
        });

        // Показать выбранную секцию
        const targetSection = document.getElementById(`${sectionId}-settings`);
        if (targetSection) {
            targetSection.classList.add('active');
        }
    }

    loadSettings() {
        // Загрузка сохраненных настроек
        const saved = localStorage.getItem('ipRoastSettings');
        if (saved) {
            this.settings = JSON.parse(saved);
        }
    }

    saveSettings() {
        localStorage.setItem('ipRoastSettings', JSON.stringify(this.settings));
        this.showToast('Настройки сохранены', 'success');
    }

    // Обработчики событий
    setupEventListeners() {
        // Горячие клавиши
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey) {
                switch (e.key) {
                    case 's':
                        e.preventDefault();
                        this.saveSettings();
                        break;
                    case 'f':
                        e.preventDefault();
                        this.focusSearch();
                        break;
                }
            }
        });

        // Обработка кликов по уведомлениям
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('notification-badge')) {
                this.showNotificationsPanel();
            }
        });
    }

    focusSearch() {
        const searchInput = document.querySelector('.search-modules');
        if (searchInput) {
            searchInput.focus();
        }
    }

    // Система уведомлений
    showToast(message, type = 'info', duration = 5000) {
        const toast = document.createElement('div');
        toast.className = `toast toast--${type}`;

        const iconMap = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };

        toast.innerHTML = `
            <div class="toast-content">
                <i class="${iconMap[type]}"></i>
                <span>${message}</span>
            </div>
            <button class="toast-close">&times;</button>
        `;

        const container = document.getElementById('toast-container');
        if (container) {
            container.appendChild(toast);

            // Автоматическое удаление
            setTimeout(() => {
                toast.remove();
            }, duration);

            // Удаление по клику
            toast.querySelector('.toast-close').addEventListener('click', () => {
                toast.remove();
            });
        }
    }

    showNotificationsPanel() {
        // Показать панель уведомлений
        this.showToast('Панель уведомлений (в разработке)', 'info');
    }

    // Обновления в реальном времени
    startRealTimeUpdates() {
        setInterval(() => {
            this.updateRealTimeData();
        }, 30000); // Обновление каждые 30 секунд
    }

    updateRealTimeData() {
        if (this.currentPage === 'dashboard') {
            // Небольшие случайные изменения в статистике
            this.stats.activeScans += Math.floor(Math.random() * 3) - 1;
            this.stats.discoveredHosts += Math.floor(Math.random() * 2);
            this.stats.openPorts += Math.floor(Math.random() * 5) - 2;
            this.stats.vulnerabilities += Math.floor(Math.random() * 2) - 1;

            // Обеспечить минимальные значения
            this.stats.activeScans = Math.max(0, this.stats.activeScans);
            this.stats.vulnerabilities = Math.max(0, this.stats.vulnerabilities);

            this.updateDashboardStats();
        }
    }

    // API для внешнего использования
    getAPI() {
        return {
            navigateToPage: (page) => this.navigateToPage(page),
            startScan: () => this.startNetworkScan(),
            showToast: (message, type, duration) => this.showToast(message, type, duration),
            getCurrentPage: () => this.currentPage,
            getStats: () => this.stats,
            getDevices: () => this.networkDevices,
            getReports: () => this.reports
        };
    }
}

// Экспорт для использования в модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = IPRoastPro;
}