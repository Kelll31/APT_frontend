// IP Roast Pro - Advanced Cybersecurity Platform
class IPRoastPro {
    constructor() {
        this.currentPage = 'dashboard';
        this.charts = {};
        this.scanningInterval = null;
        this.moduleBuilder = null;
        this.selectedModule = null;
        this.workflow = [];
        this.connectionLines = [];

        // Application data from the provided JSON
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
                lastSeen: "2025-01-15 10:30:00"
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
                lastSeen: "2025-01-15 10:28:00"
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
                lastSeen: "2025-01-15 10:25:00"
            }
        ];

        this.attackModules = [
            {
                category: "Reconnaissance",
                modules: [
                    { id: "recon_port_scan", name: "Port Scanner", description: "Scan target ports", icon: "fas fa-search" },
                    { id: "recon_service_enum", name: "Service Enumeration", description: "Identify running services", icon: "fas fa-list" },
                    { id: "recon_dns_lookup", name: "DNS Lookup", description: "Resolve hostnames", icon: "fas fa-globe" }
                ]
            },
            {
                category: "Exploitation",
                modules: [
                    { id: "exploit_ssh_brute", name: "SSH Brute Force", description: "Brute force SSH credentials", icon: "fas fa-key" },
                    { id: "exploit_web_vuln", name: "Web Vulnerability", description: "Exploit web vulnerabilities", icon: "fas fa-bug" },
                    { id: "exploit_buffer_overflow", name: "Buffer Overflow", description: "Execute buffer overflow attacks", icon: "fas fa-bomb" }
                ]
            },
            {
                category: "Post-Exploitation",
                modules: [
                    { id: "post_file_collect", name: "File Collection", description: "Collect sensitive files", icon: "fas fa-file" },
                    { id: "post_privilege_esc", name: "Privilege Escalation", description: "Escalate privileges", icon: "fas fa-arrow-up" },
                    { id: "post_persistence", name: "Persistence", description: "Maintain access", icon: "fas fa-anchor" }
                ]
            }
        ];

        this.reports = [
            {
                id: 1,
                name: "Network Security Assessment",
                date: "2025-01-15",
                type: "Vulnerability Scan",
                status: "Complete",
                criticalIssues: 2
            },
            {
                id: 2,
                name: "Penetration Test Report",
                date: "2025-01-12",
                type: "Pen Test",
                status: "Complete",
                criticalIssues: 5
            }
        ];

        this.workflowTemplates = [
            {
                id: 'basic_recon',
                name: 'Basic Reconnaissance',
                description: 'Standard network discovery and enumeration',
                modules: ['recon_port_scan', 'recon_service_enum', 'recon_dns_lookup']
            },
            {
                id: 'web_attack',
                name: 'Web Application Assessment',
                description: 'Comprehensive web application security testing',
                modules: ['recon_port_scan', 'exploit_web_vuln', 'post_file_collect']
            },
            {
                id: 'privilege_escalation',
                name: 'Privilege Escalation Chain',
                description: 'Gain elevated privileges and maintain access',
                modules: ['exploit_ssh_brute', 'post_privilege_esc', 'post_persistence']
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

        // Add smooth loading animation
        this.hideLoadingOverlay();
    }

    hideLoadingOverlay() {
        setTimeout(() => {
            const overlay = document.getElementById('loading-overlay');
            if (overlay) {
                overlay.classList.add('hidden');
            }
        }, 1000);
    }

    // Navigation System
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
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        // Show selected page
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('active');
        }

        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });

        const activeNavItem = document.querySelector(`[data-page="${pageId}"]`);
        if (activeNavItem && activeNavItem.classList.contains('nav-item')) {
            activeNavItem.classList.add('active');
        }

        this.currentPage = pageId;

        // Load page content
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

    // Dashboard Implementation
    setupDashboard() {
        // Dashboard is mostly static, setup happens in loadDashboard
    }

    loadDashboard() {
        this.updateDashboardStats();
        this.loadActivityFeed();
        this.createActivityChart();
        this.animateStatCards();
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

        const activities = [
            {
                type: 'info',
                title: 'New device discovered',
                time: '2 minutes ago',
                icon: 'fas fa-plus-circle'
            },
            {
                type: 'warning',
                title: 'Suspicious port scan detected',
                time: '5 minutes ago',
                icon: 'fas fa-exclamation-triangle'
            },
            {
                type: 'error',
                title: 'Critical vulnerability found',
                time: '10 minutes ago',
                icon: 'fas fa-bug'
            },
            {
                type: 'info',
                title: 'Scan completed successfully',
                time: '15 minutes ago',
                icon: 'fas fa-check-circle'
            }
        ];

        activityList.innerHTML = '';
        activities.forEach(activity => {
            const item = document.createElement('div');
            item.className = 'activity-item slide-in';
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

    createActivityChart() {
        const ctx = document.getElementById('activity-chart');
        if (!ctx) return;

        if (this.charts.activity) {
            this.charts.activity.destroy();
        }

        this.charts.activity = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
                datasets: [{
                    label: 'Network Activity',
                    data: [12, 19, 8, 15, 22, 18, 25],
                    borderColor: '#1FB8CD',
                    backgroundColor: 'rgba(31, 184, 205, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#1FB8CD',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 4
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
                        ticks: {
                            color: 'rgba(245, 245, 245, 0.6)'
                        },
                        grid: {
                            color: 'rgba(245, 245, 245, 0.1)'
                        }
                    },
                    x: {
                        ticks: {
                            color: 'rgba(245, 245, 245, 0.6)'
                        },
                        grid: {
                            color: 'rgba(245, 245, 245, 0.1)'
                        }
                    }
                }
            }
        });
    }

    animateStatCards() {
        const statCards = document.querySelectorAll('.stat-card');
        statCards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('slide-in');
            }, index * 100);
        });
    }

    // Network Reconnaissance Implementation
    setupNetworkRecon() {
        const scanForm = document.getElementById('scan-form');
        if (scanForm) {
            scanForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.startNetworkScan();
            });
        }

        const viewButtons = document.querySelectorAll('.view-btn');
        viewButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                viewButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    }

    loadNetworkRecon() {
        this.renderDiscoveredDevices();
    }

    startNetworkScan() {
        const startBtn = document.getElementById('start-scan');
        const progressDiv = document.getElementById('scan-progress');
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        const scanDetails = document.getElementById('scan-details');

        startBtn.disabled = true;
        startBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Scanning...';
        progressDiv.classList.remove('hidden');

        let progress = 0;
        let hostsFound = 0;
        let portsFound = 0;
        let servicesFound = 0;

        this.scanningInterval = setInterval(() => {
            progress += Math.random() * 12 + 3;
            if (progress > 100) progress = 100;

            progressFill.style.width = progress + '%';
            progressText.textContent = Math.round(progress) + '%';

            // Simulate discoveries
            if (Math.random() < 0.3) {
                hostsFound += Math.floor(Math.random() * 3) + 1;
                portsFound += Math.floor(Math.random() * 10) + 1;
                servicesFound += Math.floor(Math.random() * 2) + 1;

                document.getElementById('hosts-found').textContent = hostsFound;
                document.getElementById('ports-found').textContent = portsFound;
                document.getElementById('services-found').textContent = servicesFound;
            }

            if (progress >= 100) {
                clearInterval(this.scanningInterval);
                startBtn.disabled = false;
                startBtn.innerHTML = '<i class="fas fa-play"></i> Start Reconnaissance';
                progressText.textContent = 'Scan Complete!';

                // Add discovered devices to the list
                setTimeout(() => {
                    this.renderDiscoveredDevices();
                }, 1000);
            }
        }, 500);
    }

    renderDiscoveredDevices() {
        const deviceList = document.getElementById('device-list');
        if (!deviceList) return;

        deviceList.innerHTML = '';
        this.networkDevices.forEach((device, index) => {
            const deviceItem = document.createElement('div');
            deviceItem.className = 'device-item slide-in';
            deviceItem.style.animationDelay = `${index * 0.1}s`;

            const statusIcon = device.status === 'active' ?
                '<i class="fas fa-circle" style="color: #10B981;"></i>' :
                '<i class="fas fa-circle" style="color: #EF4444;"></i>';

            const riskBadge = this.getRiskBadge(device.risk);

            deviceItem.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="font-weight: 500; margin-bottom: 4px; display: flex; align-items: center; gap: 8px;">
                            ${statusIcon}
                            ${device.hostname}
                        </div>
                        <div style="font-size: 14px; color: var(--color-text-secondary); margin-bottom: 4px;">
                            ${device.ip} • ${device.os} • ${device.vendor}
                        </div>
                        <div style="font-size: 12px; color: var(--color-text-secondary);">
                            Ports: ${device.ports.join(', ')}
                        </div>
                    </div>
                    <div style="text-align: right;">
                        ${riskBadge}
                        <div style="font-size: 11px; color: var(--color-text-secondary); margin-top: 4px;">
                            ${this.formatTime(device.lastSeen)}
                        </div>
                    </div>
                </div>
            `;

            deviceList.appendChild(deviceItem);
        });
    }

    getRiskBadge(risk) {
        const badges = {
            low: '<span style="padding: 2px 8px; background: rgba(16, 185, 129, 0.2); color: #10B981; border-radius: 12px; font-size: 11px; font-weight: 500;">LOW</span>',
            medium: '<span style="padding: 2px 8px; background: rgba(245, 158, 11, 0.2); color: #F59E0B; border-radius: 12px; font-size: 11px; font-weight: 500;">MEDIUM</span>',
            high: '<span style="padding: 2px 8px; background: rgba(239, 68, 68, 0.2); color: #EF4444; border-radius: 12px; font-size: 11px; font-weight: 500;">HIGH</span>'
        };
        return badges[risk] || badges.low;
    }

    formatTime(dateStr) {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);

        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    }

    // Attack Modules Implementation
    setupAttackModules() {
        this.setupModuleLibrary();
        this.setupCanvas();
        this.setupPropertiesPanel();
        this.setupToolbarActions();
    }

    loadAttackModules() {
        this.renderModuleLibrary();
        this.renderWorkflowTemplates();
        this.initializeCanvas();
    }

    setupModuleLibrary() {
        const searchInput = document.querySelector('.search-modules');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterModules(e.target.value);
            });
        }
    }

    renderModuleLibrary() {
        const categoriesContainer = document.getElementById('module-categories');
        if (!categoriesContainer) return;

        categoriesContainer.innerHTML = '';

        this.attackModules.forEach(category => {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'module-category';

            const categoryHeader = document.createElement('div');
            categoryHeader.className = 'category-header';
            categoryHeader.textContent = category.category;

            const moduleList = document.createElement('div');
            moduleList.className = 'module-list';

            category.modules.forEach(module => {
                const moduleItem = document.createElement('div');
                moduleItem.className = 'module-item';
                moduleItem.draggable = true;
                moduleItem.dataset.moduleId = module.id;

                moduleItem.innerHTML = `
                    <div class="module-name">${module.name}</div>
                    <div class="module-description">${module.description}</div>
                `;

                // Add drag functionality
                moduleItem.addEventListener('dragstart', (e) => {
                    e.dataTransfer.setData('text/plain', JSON.stringify({
                        id: module.id,
                        name: module.name,
                        description: module.description,
                        category: category.category
                    }));
                });

                moduleList.appendChild(moduleItem);
            });

            categoryDiv.appendChild(categoryHeader);
            categoryDiv.appendChild(moduleList);
            categoriesContainer.appendChild(categoryDiv);
        });
    }

    setupCanvas() {
        const canvas = document.getElementById('module-canvas');
        if (!canvas) return;

        canvas.addEventListener('dragover', (e) => {
            e.preventDefault();
            canvas.style.background = 'rgba(31, 184, 205, 0.05)';
        });

        canvas.addEventListener('dragleave', (e) => {
            canvas.style.background = '';
        });

        canvas.addEventListener('drop', (e) => {
            e.preventDefault();
            canvas.style.background = '';

            const moduleData = JSON.parse(e.dataTransfer.getData('text/plain'));
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            this.addModuleToCanvas(moduleData, x, y);
        });
    }

    initializeCanvas() {
        const canvas = document.getElementById('module-canvas');
        const placeholder = canvas.querySelector('.canvas-placeholder');

        if (this.workflow.length === 0 && placeholder) {
            placeholder.style.display = 'block';
        }
    }

    addModuleToCanvas(moduleData, x, y) {
        const canvas = document.getElementById('module-canvas');
        const placeholder = canvas.querySelector('.canvas-placeholder');

        if (placeholder) {
            placeholder.style.display = 'none';
        }

        const moduleElement = document.createElement('div');
        moduleElement.className = 'canvas-module';
        moduleElement.dataset.moduleId = moduleData.id;
        moduleElement.style.cssText = `
            position: absolute;
            left: ${x - 75}px;
            top: ${y - 30}px;
            width: 150px;
            padding: 12px;
            background: rgba(31, 184, 205, 0.1);
            border: 2px solid rgba(31, 184, 205, 0.3);
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
            backdrop-filter: blur(10px);
        `;

        moduleElement.innerHTML = `
            <div style="font-size: 14px; font-weight: 500; color: var(--color-text); margin-bottom: 4px;">
                ${moduleData.name}
            </div>
            <div style="font-size: 11px; color: var(--color-text-secondary);">
                ${moduleData.category}
            </div>
            <button class="module-remove" style="
                position: absolute;
                top: -8px;
                right: -8px;
                width: 20px;
                height: 20px;
                border: none;
                background: var(--color-error);
                color: white;
                border-radius: 50%;
                cursor: pointer;
                font-size: 10px;
                display: none;
            ">×</button>
        `;

        // Add interaction handlers
        moduleElement.addEventListener('click', () => {
            this.selectModule(moduleElement, moduleData);
        });

        moduleElement.addEventListener('mouseenter', () => {
            moduleElement.querySelector('.module-remove').style.display = 'flex';
            moduleElement.style.transform = 'scale(1.05)';
            moduleElement.style.borderColor = 'rgba(31, 184, 205, 0.6)';
        });

        moduleElement.addEventListener('mouseleave', () => {
            moduleElement.querySelector('.module-remove').style.display = 'none';
            moduleElement.style.transform = 'scale(1)';
            moduleElement.style.borderColor = 'rgba(31, 184, 205, 0.3)';
        });

        const removeBtn = moduleElement.querySelector('.module-remove');
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.removeModuleFromCanvas(moduleElement);
        });

        canvas.appendChild(moduleElement);

        // Add to workflow
        this.workflow.push({
            element: moduleElement,
            data: moduleData,
            position: { x: x - 75, y: y - 30 }
        });

        // Select the newly added module
        this.selectModule(moduleElement, moduleData);
    }

    selectModule(element, moduleData) {
        // Clear previous selection
        document.querySelectorAll('.canvas-module').forEach(el => {
            el.style.borderColor = 'rgba(31, 184, 205, 0.3)';
            el.style.boxShadow = 'none';
        });

        // Highlight selected module
        element.style.borderColor = 'rgba(31, 184, 205, 0.8)';
        element.style.boxShadow = '0 0 20px rgba(31, 184, 205, 0.3)';

        this.selectedModule = { element, data: moduleData };
        this.showModuleProperties(moduleData);
    }

    removeModuleFromCanvas(element) {
        element.remove();
        this.workflow = this.workflow.filter(item => item.element !== element);

        if (this.workflow.length === 0) {
            const placeholder = document.querySelector('.canvas-placeholder');
            if (placeholder) {
                placeholder.style.display = 'block';
            }
        }

        // Clear properties panel if this module was selected
        if (this.selectedModule && this.selectedModule.element === element) {
            this.clearPropertiesPanel();
        }
    }

    setupPropertiesPanel() {
        // Properties panel setup is handled in showModuleProperties
    }

    showModuleProperties(moduleData) {
        const propertiesContent = document.getElementById('properties-content');
        if (!propertiesContent) return;

        propertiesContent.innerHTML = `
            <div style="margin-bottom: 20px;">
                <h4 style="margin-bottom: 8px; color: var(--color-text);">${moduleData.name}</h4>
                <p style="margin-bottom: 16px; color: var(--color-text-secondary); font-size: 14px;">
                    ${moduleData.description}
                </p>
                <div style="padding: 8px 12px; background: rgba(31, 184, 205, 0.1); border-radius: 6px; font-size: 12px; color: var(--color-teal-300);">
                    Category: ${moduleData.category}
                </div>
            </div>

            <div class="form-group">
                <label class="form-label" style="font-size: 13px;">Target</label>
                <input type="text" class="form-control" placeholder="192.168.1.0/24" style="font-size: 13px;">
            </div>

            <div class="form-group">
                <label class="form-label" style="font-size: 13px;">Timeout (seconds)</label>
                <input type="number" class="form-control" value="30" style="font-size: 13px;">
            </div>

            <div class="form-group">
                <label class="form-label" style="font-size: 13px;">Threads</label>
                <input type="number" class="form-control" value="10" style="font-size: 13px;">
            </div>

            <div class="form-group">
                <label class="checkbox-item" style="font-size: 13px;">
                    <input type="checkbox" checked>
                    <span class="checkmark"></span>
                    Verbose Output
                </label>
            </div>

            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(31, 184, 205, 0.1);">
                <button class="btn btn--primary btn--sm btn--full-width">
                    <i class="fas fa-save"></i>
                    Save Configuration
                </button>
            </div>
        `;
    }

    clearPropertiesPanel() {
        const propertiesContent = document.getElementById('properties-content');
        if (!propertiesContent) return;

        propertiesContent.innerHTML = `
            <div class="no-selection">
                <i class="fas fa-mouse-pointer"></i>
                <p>Select a module to configure its properties</p>
            </div>
        `;
    }

    setupToolbarActions() {
        const saveBtn = document.getElementById('save-workflow');
        const loadBtn = document.getElementById('load-workflow');
        const clearBtn = document.getElementById('clear-canvas');
        const executeBtn = document.getElementById('execute-workflow');

        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveWorkflow());
        }

        if (loadBtn) {
            loadBtn.addEventListener('click', () => this.loadWorkflow());
        }

        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearCanvas());
        }

        if (executeBtn) {
            executeBtn.addEventListener('click', () => this.executeWorkflow());
        }
    }

    saveWorkflow() {
        if (this.workflow.length === 0) {
            this.showNotification('No modules to save', 'warning');
            return;
        }

        const workflowData = {
            name: `Workflow_${new Date().toISOString().slice(0, 10)}`,
            modules: this.workflow.map(item => ({
                ...item.data,
                position: item.position
            }))
        };

        // Simulate saving
        this.showNotification('Workflow saved successfully', 'success');
        console.log('Saved workflow:', workflowData);
    }

    loadWorkflow() {
        // Simulate loading a saved workflow
        this.showNotification('Workflow loaded successfully', 'success');
    }

    clearCanvas() {
        const canvas = document.getElementById('module-canvas');
        const modules = canvas.querySelectorAll('.canvas-module');

        modules.forEach(module => module.remove());
        this.workflow = [];
        this.selectedModule = null;

        const placeholder = canvas.querySelector('.canvas-placeholder');
        if (placeholder) {
            placeholder.style.display = 'block';
        }

        this.clearPropertiesPanel();
        this.showNotification('Canvas cleared', 'info');
    }

    executeWorkflow() {
        if (this.workflow.length === 0) {
            this.showNotification('No workflow to execute', 'warning');
            return;
        }

        this.showNotification('Executing workflow...', 'info');

        // Simulate workflow execution
        setTimeout(() => {
            this.showNotification('Workflow executed successfully', 'success');
        }, 2000);
    }

    renderWorkflowTemplates() {
        const templateGrid = document.getElementById('template-grid');
        if (!templateGrid) return;

        templateGrid.innerHTML = '';

        this.workflowTemplates.forEach(template => {
            const templateCard = document.createElement('div');
            templateCard.className = 'template-card';

            templateCard.innerHTML = `
                <h4 style="margin-bottom: 8px; color: var(--color-text);">${template.name}</h4>
                <p style="margin-bottom: 12px; color: var(--color-text-secondary); font-size: 14px;">
                    ${template.description}
                </p>
                <div style="font-size: 12px; color: var(--color-teal-300);">
                    ${template.modules.length} modules
                </div>
            `;

            templateCard.addEventListener('click', () => {
                this.loadTemplate(template);
            });

            templateGrid.appendChild(templateCard);
        });
    }

    loadTemplate(template) {
        this.clearCanvas();

        // Add modules from template to canvas
        template.modules.forEach((moduleId, index) => {
            const moduleData = this.findModuleById(moduleId);
            if (moduleData) {
                const x = 150 + (index * 200);
                const y = 100;
                this.addModuleToCanvas(moduleData, x, y);
            }
        });

        this.showNotification(`Template "${template.name}" loaded`, 'success');
    }

    findModuleById(moduleId) {
        for (const category of this.attackModules) {
            const module = category.modules.find(m => m.id === moduleId);
            if (module) {
                return {
                    ...module,
                    category: category.category
                };
            }
        }
        return null;
    }

    filterModules(searchTerm) {
        const moduleItems = document.querySelectorAll('.module-item');
        const searchLower = searchTerm.toLowerCase();

        moduleItems.forEach(item => {
            const name = item.querySelector('.module-name').textContent.toLowerCase();
            const description = item.querySelector('.module-description').textContent.toLowerCase();

            if (name.includes(searchLower) || description.includes(searchLower)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }

    // Reports Implementation
    setupReports() {
        // Reports setup
    }

    loadReports() {
        this.renderReportsList();
        this.createThreatChart();
        this.createSecurityTrendChart();
    }

    renderReportsList() {
        const reportsList = document.getElementById('reports-list');
        if (!reportsList) return;

        reportsList.innerHTML = '';

        this.reports.forEach(report => {
            const reportItem = document.createElement('div');
            reportItem.className = 'report-item';

            reportItem.innerHTML = `
                <div class="report-name">${report.name}</div>
                <div class="report-meta">
                    <span>${report.date}</span>
                    <span>${report.type}</span>
                    <span style="color: var(--color-error);">${report.criticalIssues} critical</span>
                </div>
            `;

            reportsList.appendChild(reportItem);
        });
    }

    createThreatChart() {
        const ctx = document.getElementById('threat-chart');
        if (!ctx) return;

        if (this.charts.threat) {
            this.charts.threat.destroy();
        }

        this.charts.threat = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['High Risk', 'Medium Risk', 'Low Risk', 'Safe'],
                datasets: [{
                    data: [8, 15, 32, 45],
                    backgroundColor: ['#B4413C', '#FFC185', '#1FB8CD', '#5D878F']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: 'rgba(245, 245, 245, 0.8)',
                            usePointStyle: true,
                            padding: 20
                        }
                    }
                }
            }
        });
    }

    createSecurityTrendChart() {
        const ctx = document.getElementById('security-trend-chart');
        if (!ctx) return;

        if (this.charts.securityTrend) {
            this.charts.securityTrend.destroy();
        }

        this.charts.securityTrend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Security Score',
                    data: [65, 72, 68, 75, 78, 82],
                    borderColor: '#1FB8CD',
                    backgroundColor: 'rgba(31, 184, 205, 0.1)',
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
                        ticks: {
                            color: 'rgba(245, 245, 245, 0.6)'
                        },
                        grid: {
                            color: 'rgba(245, 245, 245, 0.1)'
                        }
                    },
                    x: {
                        ticks: {
                            color: 'rgba(245, 245, 245, 0.6)'
                        },
                        grid: {
                            color: 'rgba(245, 245, 245, 0.1)'
                        }
                    }
                }
            }
        });
    }

    // Settings Implementation
    setupSettings() {
        const settingsNavItems = document.querySelectorAll('.settings-nav-item');
        settingsNavItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const section = item.getAttribute('data-section');
                this.showSettingsSection(section);

                settingsNavItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
            });
        });
    }

    loadSettings() {
        this.showSettingsSection('general');
    }

    showSettingsSection(sectionId) {
        document.querySelectorAll('.settings-section').forEach(section => {
            section.classList.remove('active');
        });

        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
        }
    }

    // Utility Methods
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            font-size: 14px;
            font-weight: 500;
            z-index: 10001;
            animation: slideIn 0.3s ease-out;
            max-width: 300px;
            backdrop-filter: blur(10px);
        `;

        const colors = {
            info: 'background: rgba(31, 184, 205, 0.9);',
            success: 'background: rgba(16, 185, 129, 0.9);',
            warning: 'background: rgba(245, 158, 11, 0.9);',
            error: 'background: rgba(239, 68, 68, 0.9);'
        };

        notification.style.cssText += colors[type] || colors.info;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.ipRoastPro = new IPRoastPro();
});

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);