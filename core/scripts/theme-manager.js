/**
 * core/scripts/theme-manager.js
 * ThemeManager — Система управления темами для IP Roast Enterprise 4.0
 * Экспортируется как window.ThemeManager
 */

(function () {
    'use strict';

    class ThemeManager {
        constructor() {
            if (window.themeManagerInstance) {
                return window.themeManagerInstance;
            }
            this.currentTheme = 'light';
            this.themes = ['light', 'dark'];
            this.storageKey = 'ip-roast-theme';
            this.elements = {
                root: document.documentElement,
                toggleButton: null
            };
            this.eventListeners = new Map();
            this.isInitialized = false;
            this.isToggling = false;
            this.init();
        }

        /**
         * Инициализация системы тем
         */
        init() {
            if (this.isInitialized) {
                console.log('⚠️ ThemeManager уже инициализирован');
                return;
            }
            console.log('🎨 ThemeManager инициализируется...');
            this.loadSavedTheme();
            this.findElements();
            this.setupEventListeners();
            this.applyTheme(this.currentTheme);
            this.isInitialized = true;
            console.log(`✅ ThemeManager инициализирован с темой: ${this.currentTheme}`);
        }

        /**
         * Загрузка сохраненной темы
         */
        loadSavedTheme() {
            try {
                const savedTheme = localStorage.getItem(this.storageKey);
                if (savedTheme && this.themes.includes(savedTheme)) {
                    this.currentTheme = savedTheme;
                    console.log(`📂 Загружена сохраненная тема: ${savedTheme}`);
                } else {
                    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                    this.currentTheme = systemTheme;
                    console.log(`🖥️ Определена системная тема: ${systemTheme}`);
                }
            } catch (error) {
                console.warn('⚠️ Ошибка загрузки темы, используем light:', error);
                this.currentTheme = 'light';
            }
        }

        /**
         * Поиск элементов управления темой
         */
        findElements() {
            const possibleIds = ['theme-toggle-btn', 'theme-toggle', 'dark-mode-toggle'];
            for (const id of possibleIds) {
                const element = document.getElementById(id);
                if (element) {
                    const oldHandler = element._themeToggleHandler;
                    if (oldHandler) {
                        element.removeEventListener('click', oldHandler);
                        delete element._themeToggleHandler;
                    }

                    this.elements.toggleButton = element;
                    console.log(`🔍 Найдена кнопка переключения темы: #${id}`);
                    break;
                }
            }

            if (!this.elements.toggleButton) {
                console.warn('⚠️ Кнопка переключения темы не найдена');
            }
        }
        /**
         * Настройка обработчиков событий
         */
        setupEventListeners() {
            // Кнопка переключения темы
            if (this.elements.toggleButton) {
                const handleToggle = (e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    // Предотвращаем множественные вызовы
                    if (this.isToggling) {
                        console.log('⏳ Переключение уже в процессе, игнорируем...');
                        return;
                    }

                    this.toggleTheme();
                };

                // Сохраняем ссылку на обработчик в элементе
                this.elements.toggleButton._themeToggleHandler = handleToggle;
                this.elements.toggleButton.addEventListener('click', handleToggle);
                console.log('🔘 Обработчик кнопки темы установлен');
            }

            // Слушаем изменения системной темы
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                if (!localStorage.getItem(this.storageKey)) {
                    const systemTheme = e.matches ? 'dark' : 'light';
                    console.log(`🖥️ Системная тема изменена на: ${systemTheme}`);
                    this.setTheme(systemTheme);
                }
            });

            // Горячие клавиши
            document.addEventListener('keydown', (e) => {
                if (e.ctrlKey && e.shiftKey && e.key === 'T') {
                    e.preventDefault();
                    this.toggleTheme();
                }
            });

            console.log('⚡ Обработчики событий тем настроены');
        }

        /**
         * Применение темы
         */
        applyTheme(theme) {
            if (!this.themes.includes(theme)) {
                console.warn(`⚠️ Неизвестная тема: ${theme}, используем light`);
                theme = 'light';
            }

            console.log(`🎨 Применяем тему: ${theme}`);

            // Устанавливаем data-theme на html элемент
            this.elements.root.setAttribute('data-theme', theme);
            this.elements.root.style.colorScheme = theme;

            if (theme === 'dark') {
                this.elements.root.classList.add('dark');
            } else {
                this.elements.root.classList.remove('dark');
            }

            // Очищаем старые атрибуты
            document.body.removeAttribute('data-theme');

            // Обновляем кнопку переключения
            this.updateToggleButton(theme);

            // Сохраняем тему
            this.saveTheme(theme);

            const previousTheme = this.currentTheme;
            this.currentTheme = theme;

            // Эмитируем событие
            this.emit('themeChanged', {
                theme,
                previous: previousTheme,
                timestamp: Date.now()
            });

            console.log(`✅ Тема ${theme} применена успешно`);
        }

        /**
         * Переключение темы
         */
        toggleTheme() {
            const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
            console.log(`🔄 Переключение темы: ${this.currentTheme} → ${newTheme}`);
            this.setTheme(newTheme);
        }

        /**
         * Установка конкретной темы
         */
        setTheme(theme) {
            this.applyTheme(theme);
        }

        /**
         * Получение текущей темы
         */
        getCurrentTheme() {
            return this.currentTheme;
        }

        /**
         * Обновление кнопки переключения темы
         */
        updateToggleButton(theme) {
            if (!this.elements.toggleButton) return;

            const icons = {
                'light': '🌙',
                'dark': '☀️'
            };

            const tooltips = {
                'light': 'Переключить на темную тему',
                'dark': 'Переключить на светлую тему'
            };

            this.elements.toggleButton.textContent = icons[theme];
            this.elements.toggleButton.title = tooltips[theme];
            this.elements.toggleButton.setAttribute('aria-label', tooltips[theme]);
            this.elements.toggleButton.className = `header-btn theme-toggle theme-toggle--${theme}`;

            console.log(`🔘 Кнопка темы обновлена: ${icons[theme]}`);
        }

        /**
         * Сохранение темы в localStorage
         */
        saveTheme(theme) {
            try {
                localStorage.setItem(this.storageKey, theme);
                console.log(`💾 Тема сохранена: ${theme}`);
            } catch (error) {
                console.warn('⚠️ Ошибка сохранения темы:', error);
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

            // Создаем глобальное DOM событие
            const customEvent = new CustomEvent('themeChanged', {
                detail: data
            });
            document.dispatchEvent(customEvent);
        }

        /**
         * Получение информации о теме
         */
        getThemeInfo() {
            return {
                current: this.currentTheme,
                available: this.themes,
                isSystemDark: window.matchMedia('(prefers-color-scheme: dark)').matches,
                hasCustomTheme: !!localStorage.getItem(this.storageKey),
                buttonFound: !!this.elements.toggleButton
            };
        }

        /**
         * Уничтожение менеджера тем
         */
        destroy() {
            this.eventListeners.clear();
            console.log('🗑️ ThemeManager уничтожен');
        }
    }

    // Экспорт как конструктор в глобальную область
    window.ThemeManager = ThemeManager;
    console.log('🎨 ThemeManager загружен и доступен как window.ThemeManager');

})();
