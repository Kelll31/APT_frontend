/**
 * Navigation Component
 * Компонент навигации для IP Roast Enterprise
 */

export class NavigationComponent {
    constructor(options = {}) {
        this.options = {
            container: '.main-navigation',
            collapsible: true,
            persistent: true,
            ...options
        };

        this.state = {
            isCollapsed: false,
            isMobile: false
        };

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkMobileView();
        this.loadState();
    }

    setupEventListeners() {
        // Обработчик для переключения sidebar
        const toggleBtn = document.querySelector('.nav-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                this.toggle();
            });
        }

        // Обработчик изменения размера окна
        window.addEventListener('resize', () => {
            this.checkMobileView();
        });

        // Обработчики для навигационных элементов
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                this.handleNavClick(e, item);
            });
        });
    }

    toggle() {
        this.state.isCollapsed = !this.state.isCollapsed;
        this.updateView();
        this.saveState();

        // Эмитируем событие
        this.emit('toggle', this.state.isCollapsed);
    }

    collapse() {
        this.state.isCollapsed = true;
        this.updateView();
        this.saveState();
    }

    expand() {
        this.state.isCollapsed = false;
        this.updateView();
        this.saveState();
    }

    updateView() {
        const navigation = document.querySelector(this.options.container);
        if (!navigation) return;

        if (this.state.isCollapsed) {
            navigation.classList.add('collapsed');
        } else {
            navigation.classList.remove('collapsed');
        }
    }

    checkMobileView() {
        const wasMobile = this.state.isMobile;
        this.state.isMobile = window.innerWidth <= 768;

        if (wasMobile !== this.state.isMobile) {
            this.handleMobileChange();
        }
    }

    handleMobileChange() {
        const navigation = document.querySelector(this.options.container);
        if (!navigation) return;

        if (this.state.isMobile) {
            navigation.classList.add('mobile');
            // На мобильных всегда сворачиваем
            this.collapse();
        } else {
            navigation.classList.remove('mobile');
            // Восстанавливаем состояние на десктопе
            this.loadState();
        }
    }

    handleNavClick(e, item) {
        const page = item.getAttribute('data-page');
        if (!page) return;

        // Удаляем активный класс со всех элементов
        document.querySelectorAll('.nav-item').forEach(navItem => {
            navItem.classList.remove('active');
        });

        // Добавляем активный класс текущему элементу
        item.classList.add('active');

        // На мобильных устройствах сворачиваем меню после клика
        if (this.state.isMobile) {
            this.collapse();
        }

        // Эмитируем событие навигации
        this.emit('navigate', { page, item });
    }

    setActivePage(pageId) {
        document.querySelectorAll('.nav-item').forEach(item => {
            const itemPage = item.getAttribute('data-page');
            if (itemPage === pageId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    saveState() {
        if (this.options.persistent) {
            localStorage.setItem('nav-collapsed', this.state.isCollapsed);
        }
    }

    loadState() {
        if (this.options.persistent) {
            const saved = localStorage.getItem('nav-collapsed');
            if (saved !== null) {
                this.state.isCollapsed = JSON.parse(saved);
                this.updateView();
            }
        }
    }

    // Простая система событий
    emit(event, data) {
        const customEvent = new CustomEvent(`nav:${event}`, {
            detail: data
        });
        document.dispatchEvent(customEvent);
    }

    on(event, handler) {
        document.addEventListener(`nav:${event}`, handler);
    }

    off(event, handler) {
        document.removeEventListener(`nav:${event}`, handler);
    }
}

// Автоматическая инициализация если элемент найден
document.addEventListener('DOMContentLoaded', () => {
    const navElement = document.querySelector('.main-navigation');
    if (navElement) {
        window.navigationComponent = new NavigationComponent();
    }
});