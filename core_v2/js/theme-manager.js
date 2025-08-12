/**
 * IP Roast Enterprise Core v2 - Theme Manager
 * Система управления темами с улучшенной архитектурой
 * Version: 2.0.0
 */

(function() {
    'use strict';

    // Предотвращаем повторную загрузку
    if (window.IPRoastCore?.ThemeManager) {
        console.log('⚠️ ThemeManager v2 уже загружен');
        return window.IPRoastCore.ThemeManager;
    }

    class ThemeManager {
        constructor(options = {}) {
            this.version = '2.0.0';
            this.config = {
                defaultTheme: 'dark',
                availableThemes: ['light', 'dark', 'auto'],
                storageKey: 'ip-roast-theme-v2',
                animationDuration: 300,
                respectSystemTheme: true,
                ...options
            };

            this.state = {
                currentTheme: null,
                systemTheme: null,
                isTransitioning: false,
                initialized: false
            };

            this.elements = {
                root: document.documentElement,
                body: document.body,
                toggleButtons: new Set(),
                themeIndicators: new Set()
            };

            this.listeners = new Map();
            this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

            // Привязываем контекст
            this.handleSystemThemeChange = this.handleSystemThemeChange.bind(this);
            this.handleStorageChange = this.handleStorageChange.bind(this);
            
            console.log(`🎨 ThemeManager v${this.version} создан`);
        }

        /**
         * Инициализация менеджера тем
         */
        async init() {
            if (this.state.initialized) {
                console.log('⚠️ ThemeManager уже инициализирован');
                return;
            }

            console.log('🚀 Инициализация ThemeManager v2...');

            try {
                // Определяем системную тему
                this.state.systemTheme = this.mediaQuery.matches ? 'dark' : 'light';
                
                // Загружаем сохраненную тему
                await this.loadSavedTheme();
                
                // Настраиваем слушатели
                this.setupEventListeners();
                
                // Инициализируем элементы управления
                this.initializeThemeControls();
                
                // Применяем тему
                await this.applyTheme(this.state.currentTheme, false);
                
                this.state.initialized = true;
                this.emit('initialized', { theme: this.state.currentTheme });
                
                console.log(`✅ ThemeManager v2 инициализирован с темой: ${this.state.currentTheme}`);
            } catch (error) {
                console.error('❌ Ошибка инициализации ThemeManager:', error);
                throw error;
            }
        }

        /**
         * Загрузка сохраненной темы
         */
        async loadSavedTheme() {
            try {
                const savedTheme = localStorage.getItem(this.config.storageKey);
                
                if (savedTheme && this.config.availableThemes.includes(savedTheme)) {
                    this.state.currentTheme = savedTheme;
                } else if (this.config.respectSystemTheme) {
                    this.state.currentTheme = 'auto';
                } else {
                    this.state.currentTheme = this.config.defaultTheme;
                }

                console.log(`📂 Загружена тема: ${this.state.currentTheme}`);
            } catch (error) {
                console.warn('⚠️ Ошибка загрузки темы, используем по умолчанию');
                this.state.currentTheme = this.config.defaultTheme;
            }
        }

        /**
         * Настройка слушателей событий
         */
        setupEventListeners() {
            // Слушаем изменения системной темы
            this.mediaQuery.addEventListener('change', this.handleSystemThemeChange);
            
            // Слушаем изменения в других вкладках
            window.addEventListener('storage', this.handleStorageChange);
            
            // Горячие клавиши
            document.addEventListener('keydown', (e) => {
                if (e.ctrlKey && e.shiftKey && e.key === 'T') {
                    e.preventDefault();
                    this.toggleTheme();
                }
            });

            console.log('⚡ Слушатели ThemeManager настроены');
        }

        /**
         * Инициализация элементов управления темой
         */
        initializeThemeControls() {
            // Находим все кнопки переключения темы
            const toggleSelectors = [
                '[data-theme-toggle]',
                '.theme-toggle',
                '#theme-toggle-btn',
                '#theme-toggle'
            ];

            toggleSelectors.forEach(selector => {
                document.querySelectorAll(selector).forEach(btn => {
                    this.registerToggleButton(btn);
                });
            });

            // Находим индикаторы темы
            document.querySelectorAll('[data-theme-indicator]').forEach(indicator => {
                this.registerThemeIndicator(indicator);
            });

            console.log(`🔘 Зарегистрировано элементов управления: ${this.elements.toggleButtons.size} кнопок, ${this.elements.themeIndicators.size} индикаторов`);
        }

        /**
         * Регистрация кнопки переключения
         */
        registerToggleButton(button) {
            if (this.elements.toggleButtons.has(button)) return;

            const handleClick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleTheme();
            };

            button.addEventListener('click', handleClick);
            button._themeToggleHandler = handleClick;
            this.elements.toggleButtons.add(button);
            
            this.updateToggleButton(button);
        }

        /**
         * Регистрация индикатора темы
         */
        registerThemeIndicator(indicator) {
            this.elements.themeIndicators.add(indicator);
            this.updateThemeIndicator(indicator);
        }

        /**
         * Переключение темы
         */
        async toggleTheme() {
            if (this.state.isTransitioning) {
                console.log('⏳ Переключение темы уже в процессе');
                return;
            }

            const currentTheme = this.getEffectiveTheme();
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            
            console.log(`🔄 Переключение темы: ${currentTheme} → ${newTheme}`);
            
            await this.setTheme(newTheme);
        }

        /**
         * Установка конкретной темы
         */
        async setTheme(theme) {
            if (!this.config.availableThemes.includes(theme)) {
                console.warn(`⚠️ Неподдерживаемая тема: ${theme}`);
                return false;
            }

            if (theme === this.state.currentTheme) {
                console.log(`ℹ️ Тема ${theme} уже активна`);
                return true;
            }

            const previousTheme = this.state.currentTheme;
            this.state.currentTheme = theme;

            try {
                await this.applyTheme(theme, true);
                this.saveTheme(theme);
                
                this.emit('themeChanged', {
                    theme,
                    previousTheme,
                    effectiveTheme: this.getEffectiveTheme()
                });

                return true;
            } catch (error) {
                console.error('❌ Ошибка установки темы:', error);
                this.state.currentTheme = previousTheme;
                return false;
            }
        }

        /**
         * Применение темы к DOM
         */
        async applyTheme(theme, animate = false) {
            this.state.isTransitioning = animate;
            
            const effectiveTheme = this.resolveTheme(theme);
            
            console.log(`🎨 Применение темы: ${theme} (эффективная: ${effectiveTheme})`);

            try {
                // Анимация перехода
                if (animate) {
                    this.elements.root.style.transition = `color-scheme ${this.config.animationDuration}ms ease`;
                    this.elements.body.style.transition = `background-color ${this.config.animationDuration}ms ease, color ${this.config.animationDuration}ms ease`;
                }

                // Устанавливаем атрибуты
                this.elements.root.setAttribute('data-theme', theme);
                this.elements.root.setAttribute('data-effective-theme', effectiveTheme);
                this.elements.root.style.colorScheme = effectiveTheme;

                // CSS классы для совместимости
                this.elements.root.classList.remove('theme-light', 'theme-dark', 'theme-auto');
                this.elements.root.classList.add(`theme-${theme}`);

                this.elements.body.classList.remove('light-theme', 'dark-theme');
                this.elements.body.classList.add(`${effectiveTheme}-theme`);

                // Обновляем элементы управления
                this.updateAllControls();

                // Ждем завершения анимации
                if (animate) {
                    await new Promise(resolve => setTimeout(resolve, this.config.animationDuration));
                    this.elements.root.style.transition = '';
                    this.elements.body.style.transition = '';
                }

                this.state.isTransitioning = false;
                
                console.log(`✅ Тема ${theme} применена успешно`);
            } catch (error) {
                this.state.isTransitioning = false;
                throw error;
            }
        }

        /**
         * Разрешение эффективной темы
         */
        resolveTheme(theme) {
            if (theme === 'auto') {
                return this.state.systemTheme || 'dark';
            }
            return theme;
        }

        /**
         * Получение текущей эффективной темы
         */
        getEffectiveTheme() {
            return this.resolveTheme(this.state.currentTheme);
        }

        /**
         * Обновление всех элементов управления
         */
        updateAllControls() {
            this.elements.toggleButtons.forEach(btn => this.updateToggleButton(btn));
            this.elements.themeIndicators.forEach(indicator => this.updateThemeIndicator(indicator));
        }

        /**
         * Обновление кнопки переключения
         */
        updateToggleButton(button) {
            const effectiveTheme = this.getEffectiveTheme();
            const currentTheme = this.state.currentTheme;
            
            const config = {
                light: { icon: '🌙', text: 'Темная тема', class: 'theme-light' },
                dark: { icon: '☀️', text: 'Светлая тема', class: 'theme-dark' },
                auto: { icon: '🌓', text: 'Авто тема', class: 'theme-auto' }
            };

            const themeConfig = config[currentTheme] || config.dark;
            
            // Обновляем содержимое
            const iconEl = button.querySelector('.theme-icon') || button.querySelector('i') || button;
            if (iconEl) {
                iconEl.textContent = themeConfig.icon;
            }

            // Обновляем атрибуты
            button.setAttribute('data-theme', currentTheme);
            button.setAttribute('data-effective-theme', effectiveTheme);
            button.setAttribute('title', themeConfig.text);
            button.setAttribute('aria-label', themeConfig.text);
            
            // Обновляем классы
            button.classList.remove('theme-light', 'theme-dark', 'theme-auto');
            button.classList.add(themeConfig.class);
        }

        /**
         * Обновление индикатора темы
         */
        updateThemeIndicator(indicator) {
            const theme = this.state.currentTheme;
            const effectiveTheme = this.getEffectiveTheme();
            
            indicator.setAttribute('data-theme', theme);
            indicator.setAttribute('data-effective-theme', effectiveTheme);
            indicator.textContent = `${theme} (${effectiveTheme})`;
        }

        /**
         * Сохранение темы
         */
        saveTheme(theme) {
            try {
                localStorage.setItem(this.config.storageKey, theme);
                console.log(`💾 Тема сохранена: ${theme}`);
            } catch (error) {
                console.warn('⚠️ Не удалось сохранить тему:', error);
            }
        }

        /**
         * Обработчик изменения системной темы
         */
        handleSystemThemeChange(e) {
            const newSystemTheme = e.matches ? 'dark' : 'light';
            console.log(`🖥️ Системная тема изменилась: ${this.state.systemTheme} → ${newSystemTheme}`);
            
            this.state.systemTheme = newSystemTheme;
            
            if (this.state.currentTheme === 'auto') {
                this.applyTheme('auto', true);
            }
            
            this.emit('systemThemeChanged', { systemTheme: newSystemTheme });
        }

        /**
         * Обработчик изменения в localStorage
         */
        handleStorageChange(e) {
            if (e.key === this.config.storageKey && e.newValue !== this.state.currentTheme) {
                console.log(`🔄 Синхронизация темы из другой вкладки: ${e.newValue}`);
                if (e.newValue && this.config.availableThemes.includes(e.newValue)) {
                    this.setTheme(e.newValue);
                }
            }
        }

        /**
         * Получение информации о текущем состоянии
         */
        getState() {
            return {
                currentTheme: this.state.currentTheme,
                effectiveTheme: this.getEffectiveTheme(),
                systemTheme: this.state.systemTheme,
                availableThemes: [...this.config.availableThemes],
                isTransitioning: this.state.isTransitioning,
                initialized: this.state.initialized,
                controlsCount: {
                    toggleButtons: this.elements.toggleButtons.size,
                    indicators: this.elements.themeIndicators.size
                }
            };
        }

        /**
         * Система событий
         */
        on(event, callback) {
            if (!this.listeners.has(event)) {
                this.listeners.set(event, new Set());
            }
            this.listeners.get(event).add(callback);
        }

        off(event, callback) {
            if (this.listeners.has(event)) {
                this.listeners.get(event).delete(callback);
            }
        }

        emit(event, data) {
            if (this.listeners.has(event)) {
                this.listeners.get(event).forEach(callback => {
                    try {
                        callback(data);
                    } catch (error) {
                        console.error(`❌ Ошибка в обработчике ${event}:`, error);
                    }
                });
            }

            // Глобальное DOM событие
            document.dispatchEvent(new CustomEvent(`theme:${event}`, {
                detail: { ...data, manager: this }
            }));
        }

        /**
         * Очистка ресурсов
         */
        destroy() {
            // Удаляем слушатели
            this.mediaQuery.removeEventListener('change', this.handleSystemThemeChange);
            window.removeEventListener('storage', this.handleStorageChange);
            
            // Очищаем обработчики кнопок
            this.elements.toggleButtons.forEach(btn => {
                if (btn._themeToggleHandler) {
                    btn.removeEventListener('click', btn._themeToggleHandler);
                    delete btn._themeToggleHandler;
                }
            });
            
            // Очищаем коллекции
            this.elements.toggleButtons.clear();
            this.elements.themeIndicators.clear();
            this.listeners.clear();
            
            console.log('🗑️ ThemeManager v2 уничтожен');
        }
    }

    // Экспорт
    if (!window.IPRoastCore) window.IPRoastCore = {};
    window.IPRoastCore.ThemeManager = ThemeManager;
    
    console.log('✅ ThemeManager v2 загружен');
    
    return ThemeManager;
})();