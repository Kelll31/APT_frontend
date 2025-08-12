// Проверка на повторную загрузку классов
if (window.ThemeManager) {
  console.warn('ThemeManager уже загружен');
}

if (window.PageLoader) {
  console.warn('PageLoader уже загружен');
}

if (window.NotificationSystem) {
  console.warn('NotificationSystem уже загружен');
}

if (window.IPRoastApp) {
  console.warn('IPRoastApp уже загружен');
}

/**
 * Менеджер тем
 */
class ThemeManager {
  constructor() {
    this.storageKey = 'iproast-theme';
    this.themes = ['light', 'dark', 'auto'];
    this.currentTheme = this.getStoredTheme() || 'auto';
    
    this.init();
  }

  init() {
    this.applyTheme(this.currentTheme);
    this.setupMediaQueryListener();
  }

  getStoredTheme() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return this.themes.includes(stored) ? stored : null;
    } catch (e) {
      console.warn('Не удалось получить тему из localStorage:', e);
      return null;
    }
  }

  setStoredTheme(theme) {
    try {
      localStorage.setItem(this.storageKey, theme);
    } catch (e) {
      console.warn('Не удалось сохранить тему в localStorage:', e);
    }
  }

  getCurrentTheme() {
    return this.currentTheme;
  }

  getEffectiveTheme() {
    if (this.currentTheme === 'auto') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return this.currentTheme;
  }

  applyTheme(theme) {
    this.currentTheme = theme;
    const effectiveTheme = this.getEffectiveTheme();
    
    document.documentElement.setAttribute('data-color-scheme', effectiveTheme);
    this.setStoredTheme(theme);
    
    // Диспетчим событие изменения темы
    window.dispatchEvent(new CustomEvent('themeChanged', {
      detail: { theme: effectiveTheme, original: theme }
    }));
  }

  toggleTheme() {
    const themes = ['light', 'dark', 'auto'];
    const currentIndex = themes.indexOf(this.currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    const nextTheme = themes[nextIndex];
    
    this.applyTheme(nextTheme);
    return nextTheme;
  }

  setupMediaQueryListener() {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', () => {
      if (this.currentTheme === 'auto') {
        this.applyTheme('auto');
      }
    });
  }

  setTheme(theme) {
    if (!this.themes.includes(theme)) {
      console.warn(`Неподдерживаемая тема: ${theme}`);
      return;
    }
    this.applyTheme(theme);
  }
}

/**
 * Загрузчик страниц
 */
class PageLoader {
  constructor() {
    this.cache = new Map();
    this.currentPage = null;
    this.loading = false;
    
    this.templates = {
      dashboard: document.getElementById('dashboard-template'),
      settings: document.getElementById('settings-template'),
      analytics: document.getElementById('analytics-template')
    };

    this.pageTitles = {
      dashboard: 'Панель управления',
      settings: 'Настройки',
      analytics: 'Аналитика'
    };
  }

  async loadPage(pageId) {
    if (this.loading) {
      console.warn('Загрузка уже выполняется');
      return;
    }

    this.loading = true;
    
    try {
      // Показываем индикатор загрузки
      this.showLoadingState();
      
      // Проверяем кэш
      let content;
      if (this.cache.has(pageId)) {
        content = this.cache.get(pageId);
      } else {
        content = await this.fetchPageContent(pageId);
        if (content) {
          this.cache.set(pageId, content);
        }
      }
      
      // Рендерим контент
      if (content) {
        this.renderPage(pageId, content);
        this.currentPage = pageId;
        
        // Обновляем заголовок - ВАЖНО: делаем это после рендеринга
        setTimeout(() => {
          this.updatePageTitle(pageId);
        }, 50);
        
        // Диспетчим событие успешной загрузки
        window.dispatchEvent(new CustomEvent('pageLoaded', {
          detail: { pageId, content }
        }));
      } else {
        throw new Error(`Контент для страницы "${pageId}" не найден`);
      }
      
    } catch (error) {
      console.error(`Ошибка загрузки страницы ${pageId}:`, error);
      this.showErrorState(pageId, error);
      
      // Диспетчим событие ошибки
      window.dispatchEvent(new CustomEvent('pageError', {
        detail: { pageId, error }
      }));
      
    } finally {
      this.loading = false;
    }
  }

  async fetchPageContent(pageId) {
    // Имитируем загрузку с сервера
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 200));
    
    const template = this.templates[pageId];
    if (!template) {
      console.error(`Шаблон для страницы "${pageId}" не найден`);
      return null;
    }
    
    return template.content.cloneNode(true);
  }

  showLoadingState() {
    const container = document.getElementById('page-content');
    if (container) {
      container.innerHTML = `
        <div class="page-loading">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" opacity="0.25"/>
            <path d="M12 2 A10 10 0 0 1 22 12" stroke="currentColor" stroke-width="2">
              <animateTransform attributeName="transform" type="rotate" dur="1s" repeatCount="indefinite" values="0 12 12;360 12 12"/>
            </path>
          </svg>
          <span style="margin-left: 12px;">Загрузка...</span>
        </div>
      `;
    }
  }

  showErrorState(pageId, error) {
    const container = document.getElementById('page-content');
    if (container) {
      container.innerHTML = `
        <div class="page-error">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
            <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
          </svg>
          <h3>Ошибка загрузки</h3>
          <p>Не удалось загрузить страницу "${pageId}"</p>
          <button class="btn btn--primary" onclick="window.app.pageLoader.loadPage('${pageId}')">
            Попробовать снова
          </button>
        </div>
      `;
    }
  }

  renderPage(pageId, content) {
    const container = document.getElementById('page-content');
    if (container) {
      container.innerHTML = '';
      container.appendChild(content);
      container.classList.add('fade-in');
      
      // Удаляем класс анимации через некоторое время
      setTimeout(() => {
        container.classList.remove('fade-in');
      }, 300);

      // Инициализируем обработчики событий для страницы
      setTimeout(() => {
        this.initPageHandlers(pageId);
      }, 100);
    }
  }

  initPageHandlers(pageId) {
    if (pageId === 'settings') {
      this.initSettingsHandlers();
    }
  }

  initSettingsHandlers() {
    const themeSelect = document.getElementById('theme-select');
    const testButtons = {
      success: document.getElementById('test-success'),
      error: document.getElementById('test-error'),
      warning: document.getElementById('test-warning'),
      info: document.getElementById('test-info')
    };

    if (themeSelect && window.app) {
      themeSelect.value = window.app.themeManager.getCurrentTheme();
      themeSelect.addEventListener('change', (e) => {
        window.app.themeManager.setTheme(e.target.value);
      });
    }

    // Обработчики для тестовых уведомлений
    Object.keys(testButtons).forEach(type => {
      const button = testButtons[type];
      if (button && window.app) {
        button.addEventListener('click', () => {
          const messages = {
            success: 'Операция выполнена успешно!',
            error: 'Произошла ошибка при выполнении операции',
            warning: 'Обратите внимание на этот момент',
            info: 'Это информационное сообщение'
          };
          window.app.notifications[type](messages[type]);
        });
      }
    });
  }

  updatePageTitle(pageId) {
    const title = this.pageTitles[pageId] || pageId;
    const titleElement = document.getElementById('page-title');
    if (titleElement) {
      titleElement.textContent = title;
    }
    // Также обновляем заголовок вкладки браузера
    document.title = `${title} - IP Roast Enterprise`;
  }

  getCurrentPage() {
    return this.currentPage;
  }

  clearCache() {
    this.cache.clear();
  }
}

/**
 * Система уведомлений
 */
class NotificationSystem {
  constructor() {
    this.container = document.getElementById('notifications-container');
    this.notifications = new Map();
    this.maxNotifications = 50;
    this.defaultDuration = 5000;
    this.counter = 0;
  }

  show(type, title, message, duration = this.defaultDuration) {
    const id = ++this.counter;
    
    // Удаляем старые уведомления если превышен лимит
    if (this.notifications.size >= this.maxNotifications) {
      const oldestId = this.notifications.keys().next().value;
      this.remove(oldestId);
    }
    
    const notification = this.createNotification(id, type, title, message);
    this.notifications.set(id, notification);
    this.container.appendChild(notification.element);
    
    // Автоматическое удаление
    if (duration > 0) {
      notification.timeout = setTimeout(() => {
        this.remove(id);
      }, duration);
    }
    
    return id;
  }

  createNotification(id, type, title, message) {
    const element = document.createElement('div');
    element.className = `notification notification--${type}`;
    
    const icons = {
      success: `<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" stroke-width="2" fill="none"/>
                <polyline points="22,4 12,14.01 9,11.01" stroke="currentColor" stroke-width="2" fill="none"/>`,
      error: `<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
              <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
              <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>`,
      warning: `<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" stroke-width="2" fill="none"/>
                <line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" stroke-width="2"/>
                <circle cx="12" cy="17" r="1" fill="currentColor"/>`,
      info: `<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
             <line x1="12" y1="16" x2="12" y2="12" stroke="currentColor" stroke-width="2"/>
             <circle cx="12" cy="8" r="1" fill="currentColor"/>`
    };
    
    element.innerHTML = `
      <div class="notification-icon notification-icon--${type}">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          ${icons[type]}
        </svg>
      </div>
      <div class="notification-content">
        <div class="notification-title">${title}</div>
        <div class="notification-message">${message}</div>
      </div>
      <button class="notification-close" aria-label="Закрыть уведомление">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" stroke-width="2"/>
        </svg>
      </button>
    `;
    
    // Обработчик закрытия
    const closeBtn = element.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
      this.remove(id);
    });
    
    return {
      id,
      element,
      type,
      timeout: null
    };
  }

  remove(id) {
    const notification = this.notifications.get(id);
    if (!notification) return;
    
    // Очищаем таймаут
    if (notification.timeout) {
      clearTimeout(notification.timeout);
    }
    
    // Анимация удаления
    notification.element.classList.add('removing');
    
    setTimeout(() => {
      if (notification.element.parentNode) {
        notification.element.parentNode.removeChild(notification.element);
      }
      this.notifications.delete(id);
    }, 300);
  }

  success(message, title = 'Успех') {
    return this.show('success', title, message);
  }

  error(message, title = 'Ошибка') {
    return this.show('error', title, message, 8000);
  }

  warning(message, title = 'Предупреждение') {
    return this.show('warning', title, message, 6000);
  }

  info(message, title = 'Информация') {
    return this.show('info', title, message);
  }

  clear() {
    this.notifications.forEach((notification, id) => {
      this.remove(id);
    });
  }

  getCount() {
    return this.notifications.size;
  }
}

/**
 * Главный класс приложения - оркестратор
 */
class IPRoastApp {
  constructor() {
    this.initialized = false;
    this.loading = true;
    this.state = {
      currentPage: 'dashboard',
      sidebarOpen: false
    };
    
    // Инициализируем менеджеры
    this.themeManager = null;
    this.pageLoader = null;
    this.notifications = null;
    
    // Элементы DOM
    this.elements = {};
    
    this.init();
  }

  async init() {
    try {
      await this.showInitializationProgress();
      await this.initializeManagers();
      await this.loadComponents();
      await this.setupEventHandlers();
      await this.loadInitialPage();
      
      this.initialized = true;
      this.hideLoadingScreen();
      
      this.notifications.success('Core v2 успешно инициализирован');
      
    } catch (error) {
      console.error('Ошибка инициализации приложения:', error);
      this.showInitializationError(error);
    }
  }

  async showInitializationProgress() {
    const progressFill = document.getElementById('loading-progress-fill');
    const loadingText = document.getElementById('loading-text');
    
    const steps = [
      { text: 'Инициализация менеджеров...', progress: 20 },
      { text: 'Загрузка компонентов...', progress: 40 },
      { text: 'Настройка обработчиков...', progress: 60 },
      { text: 'Загрузка интерфейса...', progress: 80 },
      { text: 'Завершение...', progress: 100 }
    ];
    
    for (const step of steps) {
      if (loadingText) loadingText.textContent = step.text;
      if (progressFill) progressFill.style.width = `${step.progress}%`;
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }

  async initializeManagers() {
    // Инициализируем менеджеры
    this.themeManager = new ThemeManager();
    this.pageLoader = new PageLoader();
    this.notifications = new NotificationSystem();
    
    // Кэшируем элементы DOM
    this.elements = {
      loadingScreen: document.getElementById('loading-screen'),
      sidebarContainer: document.getElementById('sidebar-container'),
      sidebarOverlay: document.getElementById('sidebar-overlay'),
      headerContainer: document.getElementById('header-container'),
      pageContent: document.getElementById('page-content')
    };
  }

  async loadComponents() {
    // Загружаем заголовок
    const headerTemplate = document.getElementById('header-template');
    if (headerTemplate && this.elements.headerContainer) {
      this.elements.headerContainer.appendChild(headerTemplate.content.cloneNode(true));
    }
    
    // Загружаем сайдбар
    const sidebarTemplate = document.getElementById('sidebar-template');
    if (sidebarTemplate && this.elements.sidebarContainer) {
      this.elements.sidebarContainer.appendChild(sidebarTemplate.content.cloneNode(true));
    }
  }

  setupEventHandlers() {
    // Обработчик переключения темы
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        const newTheme = this.themeManager.toggleTheme();
        const themeNames = { light: 'светлая', dark: 'темная', auto: 'автоматическая' };
        this.notifications.info(`Тема изменена на ${themeNames[newTheme]}`);
      });
    }

    // Обработчик показа уведомлений
    const showNotification = document.getElementById('show-notification');
    if (showNotification) {
      showNotification.addEventListener('click', () => {
        const messages = [
          'Система работает нормально',
          'Все компоненты загружены',
          'Менеджеры инициализированы',
          'Приложение готово к работе'
        ];
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        this.notifications.info(randomMessage);
      });
    }

    // Обработчики навигации
    this.setupNavigationHandlers();
    
    // Обработчики мобильного меню
    this.setupMobileMenuHandlers();
    
    // Обработчик событий изменения страницы
    window.addEventListener('pageLoaded', (e) => {
      this.state.currentPage = e.detail.pageId;
      this.updateNavigationState();
    });
  }

  setupNavigationHandlers() {
    // Делегированный обработчик для пунктов меню
    document.addEventListener('click', (e) => {
      const menuItem = e.target.closest('[data-page]');
      if (menuItem) {
        e.preventDefault();
        const pageId = menuItem.getAttribute('data-page');
        this.navigateToPage(pageId);
      }
    });
  }

  setupMobileMenuHandlers() {
    // Используем делегирование событий для динамически загружаемых элементов
    document.addEventListener('click', (e) => {
      if (e.target.closest('#mobile-menu-toggle')) {
        this.toggleMobileSidebar();
      } else if (e.target.closest('#sidebar-close')) {
        this.closeMobileSidebar();
      }
    });
    
    const sidebarOverlay = this.elements.sidebarOverlay;
    if (sidebarOverlay) {
      sidebarOverlay.addEventListener('click', () => {
        this.closeMobileSidebar();
      });
    }
  }

  toggleMobileSidebar() {
    this.state.sidebarOpen = !this.state.sidebarOpen;
    this.updateSidebarState();
  }

  closeMobileSidebar() {
    this.state.sidebarOpen = false;
    this.updateSidebarState();
  }

  updateSidebarState() {
    const sidebarContainer = this.elements.sidebarContainer;
    const sidebarOverlay = this.elements.sidebarOverlay;
    
    if (this.state.sidebarOpen) {
      if (sidebarContainer) sidebarContainer.classList.add('mobile-open');
      if (sidebarOverlay) sidebarOverlay.classList.add('visible');
    } else {
      if (sidebarContainer) sidebarContainer.classList.remove('mobile-open');
      if (sidebarOverlay) sidebarOverlay.classList.remove('visible');
    }
  }

  async navigateToPage(pageId) {
    if (this.state.currentPage === pageId) return;
    
    // Закрываем мобильное меню при навигации
    if (this.state.sidebarOpen) {
      this.closeMobileSidebar();
    }
    
    await this.pageLoader.loadPage(pageId);
  }

  updateNavigationState() {
    // Обновляем активное состояние пунктов меню
    const menuItems = document.querySelectorAll('[data-page]');
    menuItems.forEach(item => {
      const pageId = item.getAttribute('data-page');
      if (pageId === this.state.currentPage) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  async loadInitialPage() {
    await this.navigateToPage('dashboard');
  }

  hideLoadingScreen() {
    const loadingScreen = this.elements.loadingScreen;
    if (loadingScreen) {
      loadingScreen.classList.add('hidden');
      setTimeout(() => {
        loadingScreen.style.display = 'none';
      }, 300);
    }
  }

  showInitializationError(error) {
    const loadingContent = document.querySelector('.loading-content');
    if (loadingContent) {
      loadingContent.innerHTML = `
        <div style="color: var(--color-error); text-align: center;">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" style="margin-bottom: 16px;">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
            <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
          </svg>
          <h2>Ошибка инициализации</h2>
          <p>Не удалось запустить приложение</p>
          <button class="btn btn--primary" onclick="location.reload()">
            Перезагрузить
          </button>
        </div>
      `;
    }
  }

  // Публичные методы для взаимодействия с приложением
  getState() {
    return { ...this.state };
  }

  isInitialized() {
    return this.initialized;
  }
}

// Экспортируем классы в глобальную область
window.ThemeManager = ThemeManager;
window.PageLoader = PageLoader;
window.NotificationSystem = NotificationSystem;
window.IPRoastApp = IPRoastApp;

// Инициализируем приложение при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
  if (!window.app) {
    window.app = new IPRoastApp();
  }
});

// Дополнительная проверка для случаев когда DOM уже загружен
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (!window.app) {
      window.app = new IPRoastApp();
    }
  });
} else {
  if (!window.app) {
    window.app = new IPRoastApp();
  }
}