(function () {
    'use strict';

    // Проверяем, не был ли уже загружен SidebarManager
    if (typeof window.SidebarManager !== 'undefined') {
        console.log('⚠️ SidebarManager уже загружен, пропускаем инициализацию');
        return;
    }

    class SidebarManager {
        constructor() {
            this.elements = {
                sidebar: null,
                mobileToggle: null,
                collapseToggle: null,
                expandToggle: null,
                overlay: null,
                navItems: null,
                statusItems: null
            };

            this.state = {
                isCollapsed: false,
                isOpen: false,
                isMobile: false,
                isAnimating: false,
                activePage: 'dashboard'
            };

            this.config = {
                mobileBreakpoint: 1024,
                animationDuration: 300,
                persistState: true,
                autoCollapse: false
            };

            this.eventListeners = new Map();
            this.statusUpdateInterval = null;
            this.init();
        }

        /**
         * Инициализация sidebar менеджера
         */
        init() {
            try {
                this.findElements();
                this.setupEventListeners();
                this.loadState();
                this.checkMobileView();
                this.setupSystemStatus();
                this.updateView();
                console.log('✅ SidebarManager инициализирован');
            } catch (error) {
                console.error('❌ Ошибка инициализации SidebarManager:', error);
                this.handleInitError(error);
            }
        }

        /**
         * Поиск DOM элементов
         */
        findElements() {
            this.elements.sidebar = document.getElementById('sidebar');
            this.elements.mobileToggle = document.getElementById('sidebar-mobile-toggle');
            this.elements.collapseToggle = document.getElementById('sidebar-collapse');
            this.elements.expandToggle = document.getElementById('sidebar-expand');
            this.elements.overlay = document.getElementById('sidebar-overlay');
            this.elements.navItems = document.querySelectorAll('.nav-item');
            this.elements.statusItems = document.querySelectorAll('.status-item');

            if (!this.elements.sidebar) {
                throw new Error('SidebarManager: элемент sidebar не найден');
            }

            if (!this.elements.navItems || this.elements.navItems.length === 0) {
                console.warn('⚠️ Навигационные элементы не найдены');
            }

            console.log('🔍 Sidebar элементы найдены:', {
                sidebar: !!this.elements.sidebar,
                mobileToggle: !!this.elements.mobileToggle,
                collapseToggle: !!this.elements.collapseToggle,
                expandToggle: !!this.elements.expandToggle,
                overlay: !!this.elements.overlay,
                navItems: this.elements.navItems.length,
                statusItems: this.elements.statusItems.length
            });
        }

        /**
         * Настройка обработчиков событий
         */
        setupEventListeners() {
            // Мобильный toggle
            if (this.elements.mobileToggle) {
                this.elements.mobileToggle.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('🔘 Клик по мобильному toggle');
                    this.toggle();
                });
            } else {
                console.warn('⚠️ Мобильный toggle не найден');
            }

            // Кнопка сворачивания
            if (this.elements.collapseToggle) {
                this.elements.collapseToggle.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('🔘 Клик по collapse toggle');
                    if (!this.state.isMobile) {
                        this.collapse();
                    }
                });
            } else {
                console.warn('⚠️ Кнопка сворачивания не найдена');
            }

            // Кнопка разворачивания
            if (this.elements.expandToggle) {
                this.elements.expandToggle.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('🔘 Клик по expand toggle');
                    if (!this.state.isMobile) {
                        this.expand();
                    }
                });
            } else {
                console.warn('⚠️ Кнопка разворачивания не найдена');
            }

            // Overlay для мобильных
            if (this.elements.overlay) {
                this.elements.overlay.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('🔘 Клик по overlay');
                    this.close();
                });
            }

            // Навигационные элементы
            this.elements.navItems.forEach((item, index) => {
                const link = item.querySelector('.nav-link');
                if (link) {
                    link.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log(`🔘 Клик по навигации ${index}:`, item.dataset.page);
                        this.handleNavClick(item);
                    });
                }
            });

            // Глобальные события
            this.boundHandleResize = this.debounce(() => {
                this.handleResize();
            }, 250);

            window.addEventListener('resize', this.boundHandleResize);

            document.addEventListener('keydown', (e) => {
                this.handleKeydown(e);
            });

            document.addEventListener('click', (e) => {
                this.handleClickOutside(e);
            });

            console.log('⚡ Обработчики событий sidebar настроены');
        }

        /**
         * Обработка клика по навигации
         */
        handleNavClick(navItem) {
            const pageId = navItem.dataset.page;
            if (!pageId) {
                console.warn('⚠️ Page ID не найден в nav item');
                return;
            }

            console.log(`🔘 Клик по навигации: ${pageId}`);

            // Устанавливаем активную страницу
            this.setActivePage(pageId);

            // Множественные способы эмитирования события
            // 1. Внутренняя система событий
            this.emit('navigate', pageId);

            // 2. Глобальное событие DOM
            const navEvent = new CustomEvent('sidebar-navigate', {
                detail: { page: pageId, timestamp: Date.now() }
            });
            document.dispatchEvent(navEvent);

            // 3. Прямой вызов PageLoader если доступен
            if (window.pageLoader && typeof window.pageLoader.loadPage === 'function') {
                console.log(`📞 Прямой вызов PageLoader для: ${pageId}`);
                window.pageLoader.loadPage(pageId);
            }

            // 4. Глобальный callback если определен
            if (window.onSidebarNavigate && typeof window.onSidebarNavigate === 'function') {
                window.onSidebarNavigate(pageId);
            }

            // На мобильных закрываем меню после клика
            if (this.state.isMobile && this.state.isOpen) {
                setTimeout(() => this.close(), 150);
            }
        }

        /**
         * Установка активной страницы
         */
        setActivePage(pageId) {
            this.state.activePage = pageId;

            // Обновляем классы навигационных элементов
            this.elements.navItems.forEach(item => {
                const itemPageId = item.dataset.page;
                if (itemPageId === pageId) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });

            // Сохраняем состояние
            this.saveState();
            console.log(`✅ Активная страница установлена: ${pageId}`);
        }

        /**
         * Проверка мобильного режима
         */
        checkMobileView() {
            const wasMobile = this.state.isMobile;
            this.state.isMobile = window.innerWidth <= this.config.mobileBreakpoint;

            if (this.elements.sidebar) {
                if (this.state.isMobile) {
                    this.elements.sidebar.classList.add('sidebar--mobile');
                } else {
                    this.elements.sidebar.classList.remove('sidebar--mobile');
                }
            }

            // Если режим изменился
            if (wasMobile !== this.state.isMobile) {
                this.handleMobileChange();
            }

            console.log(`📱 Mobile режим: ${this.state.isMobile}`);
        }

        /**
         * Обработка смены режима
         */
        handleMobileChange() {
            if (this.state.isMobile) {
                // Переход на мобильный - закрываем меню
                this.close();
            } else {
                // Переход на десктоп - восстанавливаем состояние
                this.loadState();
                this.updateView();
            }

            this.emit('mobileChanged', this.state.isMobile);
        }

        /**
         * Переключение состояния
         */
        toggle() {
            if (this.state.isAnimating) {
                console.log('⏳ Анимация в процессе, игнорируем toggle');
                return;
            }

            if (this.state.isMobile) {
                this.state.isOpen ? this.close() : this.open();
            } else {
                this.state.isCollapsed ? this.expand() : this.collapse();
            }
        }

        /**
         * Открытие меню (мобильные)
         */
        open() {
            if (!this.state.isMobile || this.state.isOpen || this.state.isAnimating) {
                return;
            }

            console.log('📱 Открытие sidebar (мобильный режим)');
            this.state.isOpen = true;
            this.state.isAnimating = true;

            if (this.elements.sidebar) {
                this.elements.sidebar.classList.add('sidebar--open');
                this.elements.sidebar.classList.add('sidebar--opening');
            }

            if (this.elements.overlay) {
                this.elements.overlay.classList.add('sidebar__overlay--visible');
            }

            setTimeout(() => {
                this.state.isAnimating = false;
                if (this.elements.sidebar) {
                    this.elements.sidebar.classList.remove('sidebar--opening');
                }
            }, this.config.animationDuration);

            this.emit('opened');
        }

        /**
         * Закрытие меню (мобильные)
         */
        close() {
            if (!this.state.isMobile || !this.state.isOpen || this.state.isAnimating) {
                return;
            }

            console.log('📱 Закрытие sidebar (мобильный режим)');
            this.state.isOpen = false;
            this.state.isAnimating = true;

            if (this.elements.sidebar) {
                this.elements.sidebar.classList.add('sidebar--closing');
            }

            if (this.elements.overlay) {
                this.elements.overlay.classList.remove('sidebar__overlay--visible');
            }

            setTimeout(() => {
                this.state.isAnimating = false;
                if (this.elements.sidebar) {
                    this.elements.sidebar.classList.remove('sidebar--open');
                    this.elements.sidebar.classList.remove('sidebar--closing');
                }
            }, this.config.animationDuration);

            this.emit('closed');
        }

        /**
         * Сворачивание меню (десктоп)
         */
        collapse() {
            if (this.state.isMobile || this.state.isCollapsed) {
                return;
            }

            console.log('💻 Сворачивание sidebar (десктопный режим)');
            this.state.isCollapsed = true;
            this.elements.sidebar.classList.add('sidebar--collapsed');

            // Убираем отступ основного контента
            const main = document.querySelector('.main-content');
            if (main) {
                main.style.marginLeft = '64px';
            }

            this.saveState();
            this.emit('collapsed', true);
        }

        /**
         * Разворачивание меню (десктоп)
         */
        expand() {
            if (this.state.isMobile || !this.state.isCollapsed) {
                return;
            }

            console.log('💻 Разворачивание sidebar (десктопный режим)');
            this.state.isCollapsed = false;
            this.elements.sidebar.classList.remove('sidebar--collapsed');

            // Восстанавливаем отступ основного контента
            const main = document.querySelector('.main-content');
            if (main) {
                main.style.marginLeft = getComputedStyle(document.documentElement)
                    .getPropertyValue('--sidebar-width') || '';
            }

            this.saveState();
            this.emit('collapsed', false);
        }

        /**
         * Обновление отображения
         */
        updateView() {
            if (!this.elements.sidebar) {
                console.warn('⚠️ Sidebar элемент не найден при обновлении отображения');
                return;
            }

            if (this.state.isMobile) {
                // Мобильная логика
                if (this.state.isOpen) {
                    this.elements.sidebar.classList.add('sidebar--open');
                } else {
                    this.elements.sidebar.classList.remove('sidebar--open');
                }
            } else {
                // Десктопная логика
                if (this.state.isCollapsed) {
                    this.elements.sidebar.classList.add('sidebar--collapsed');
                } else {
                    this.elements.sidebar.classList.remove('sidebar--collapsed');
                }
            }

            console.log('✅ Отображение sidebar обновлено');
        }

        /**
         * Настройка системного статуса
         */
        setupSystemStatus() {
            if (!this.elements.statusItems || this.elements.statusItems.length === 0) {
                console.log('ℹ️ Status items не найдены, пропускаем настройку статуса');
                return;
            }

            // Обновляем статус сразу и каждые 30 секунд
            this.updateSystemStatus();
            this.statusUpdateInterval = setInterval(() => {
                this.updateSystemStatus();
            }, 30000);

            console.log('✅ Системный статус настроен');
        }

        /**
         * Обновление системного статуса
         */
        updateSystemStatus() {
            if (!this.elements.statusItems) return;

            // Имитация получения статуса системы
            const statusData = {
                'система': Math.random() > 0.1 ? 'OK' : 'WARNING',
                'system': Math.random() > 0.1 ? 'OK' : 'WARNING',
                'сеть': Math.random() > 0.05 ? 'Connected' : 'Disconnected',
                'network': Math.random() > 0.05 ? 'Connected' : 'Disconnected',
                'безопасность': Math.random() > 0.02 ? 'Protected' : 'Alert',
                'security': Math.random() > 0.02 ? 'Protected' : 'Alert'
            };

            this.elements.statusItems.forEach(item => {
                const label = item.querySelector('.status-label');
                const value = item.querySelector('.status-value');

                if (label && value) {
                    const statusType = label.textContent.toLowerCase().trim();
                    const statusValue = statusData[statusType];

                    if (statusValue) {
                        value.textContent = statusValue;

                        // Обновляем CSS классы
                        value.className = 'status-value';
                        if (statusValue === 'OK' || statusValue === 'Connected' || statusValue === 'Protected') {
                            value.classList.add('status-healthy');
                        } else if (statusValue === 'WARNING') {
                            value.classList.add('status-warning');
                        } else {
                            value.classList.add('status-error');
                        }
                    }
                }
            });
        }

        /**
         * Сохранение состояния
         */
        saveState() {
            if (!this.config.persistState) return;

            try {
                const state = {
                    isCollapsed: this.state.isCollapsed,
                    activePage: this.state.activePage,
                    timestamp: Date.now()
                };

                localStorage.setItem('sidebar-state', JSON.stringify(state));
                console.log('💾 Состояние sidebar сохранено');
            } catch (error) {
                console.warn('⚠️ Ошибка сохранения состояния:', error);
            }
        }

        /**
         * Загрузка состояния
         */
        loadState() {
            if (!this.config.persistState) return;

            try {
                const saved = localStorage.getItem('sidebar-state');
                if (saved) {
                    const state = JSON.parse(saved);
                    this.state.isCollapsed = state.isCollapsed || false;
                    this.state.activePage = state.activePage || 'dashboard';

                    // Устанавливаем активную страницу
                    this.setActivePage(this.state.activePage);
                    console.log('📂 Состояние sidebar загружено:', state);
                }
            } catch (error) {
                console.warn('⚠️ Ошибка загрузки состояния:', error);
            }
        }

        /**
         * Система событий
         */
        on(event, callback) {
            if (!this.eventListeners.has(event)) {
                this.eventListeners.set(event, []);
            }
            this.eventListeners.get(event).push(callback);
        }

        off(event, callback) {
            if (this.eventListeners.has(event)) {
                const listeners = this.eventListeners.get(event);
                const index = listeners.indexOf(callback);
                if (index > -1) {
                    listeners.splice(index, 1);
                }
            }
        }

        emit(event, data) {
            if (this.eventListeners.has(event)) {
                this.eventListeners.get(event).forEach(callback => {
                    try {
                        callback(data);
                    } catch (error) {
                        console.error(`Ошибка в обработчике события ${event}:`, error);
                    }
                });
            }
        }

        /**
         * Утилита debounce
         */
        debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }

        /**
         * Обработка нажатий клавиш
         */
        handleKeydown(e) {
            // ESC закрывает меню на мобильных
            if (e.key === 'Escape' && this.state.isMobile && this.state.isOpen) {
                this.close();
            }

            // Ctrl+B переключает меню на десктопе
            if (e.ctrlKey && e.key === 'b' && !this.state.isMobile) {
                e.preventDefault();
                this.toggle();
            }
        }

        /**
         * Обработка клика вне sidebar
         */
        handleClickOutside(e) {
            if (this.state.isMobile &&
                this.state.isOpen &&
                this.elements.sidebar &&
                !this.elements.sidebar.contains(e.target) &&
                !this.elements.mobileToggle?.contains(e.target)) {
                this.close();
            }
        }

        /**
         * Обработка изменения размера окна
         */
        handleResize() {
            this.checkMobileView();
            this.emit('resize', {
                width: window.innerWidth,
                height: window.innerHeight,
                isMobile: this.state.isMobile
            });
        }

        /**
         * Обработка ошибок инициализации
         */
        handleInitError(error) {
            console.error('💥 Критическая ошибка SidebarManager:', error);

            // Показываем уведомление об ошибке если возможно
            if (window.ipRoastApp && window.ipRoastApp.showErrorNotification) {
                window.ipRoastApp.showErrorNotification('Ошибка инициализации бокового меню');
            }

            // Попытка базовой инициализации
            this.fallbackInit();
        }

        /**
         * Базовая инициализация при ошибках
         */
        fallbackInit() {
            console.log('🚨 Запуск fallback инициализации');
            try {
                // Минимальная настройка
                this.elements.sidebar = document.getElementById('sidebar');
                if (this.elements.sidebar) {
                    console.log('✅ Fallback: основной элемент найден');
                }
            } catch (error) {
                console.error('❌ Fallback инициализация не удалась:', error);
            }
        }

        /**
         * Уничтожение sidebar менеджера
         */
        destroy() {
            // Останавливаем обновление статуса
            if (this.statusUpdateInterval) {
                clearInterval(this.statusUpdateInterval);
                this.statusUpdateInterval = null;
            }

            // Удаляем обработчики событий
            if (this.boundHandleResize) {
                window.removeEventListener('resize', this.boundHandleResize);
            }

            // Сохраняем финальное состояние
            this.saveState();

            // Очищаем слушатели событий
            this.eventListeners.clear();

            console.log('🗑️ SidebarManager уничтожен');
        }
    }

    // Экспорт
    window.SidebarManager = SidebarManager;
    console.log('✅ SidebarManager модуль загружен');

})();