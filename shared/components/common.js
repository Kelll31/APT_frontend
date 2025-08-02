/**
 * IP Roast Enterprise 4.0 — Ultimate Common UI Components Library
 * Максимально полная библиотека переиспользуемых компонентов
 * Версия: Enterprise 4.0 Ultimate Edition
 */

import { generateUUID, addClass, removeClass, toggleClass, debounce, formatDate, formatNumber } from '../utils/helpers.js';
import { THEMES, NOTIFICATION_TYPES, COMPONENT_SIZES, ANIMATION_DURATION } from '../utils/constants.js';

// ===========================================
// БАЗОВЫЕ КОМПОНЕНТЫ ФОРМ
// ===========================================

/**
 * Enterprise Button Component
 */
export class Button {
    constructor(options = {}) {
        this.options = {
            text: '',
            icon: null,
            iconPosition: 'left', // 'left' | 'right'
            variant: 'primary', // 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'info' | 'ghost' | 'link'
            size: 'md', // 'xs' | 'sm' | 'md' | 'lg' | 'xl'
            disabled: false,
            loading: false,
            fullWidth: false,
            rounded: false,
            outlined: false,
            gradient: false,
            glow: false,
            ripple: true,
            tooltip: null,
            badge: null,
            onClick: null,
            onHover: null,
            onFocus: null,
            className: '',
            id: null,
            ...options
        };

        this.element = this.createElement();
        this.bindEvents();
    }

    createElement() {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = this.getClasses();

        if (this.options.id) button.id = this.options.id;
        if (this.options.disabled) button.disabled = true;

        // Создание содержимого
        const content = this.createContent();
        button.appendChild(content);

        // Tooltip
        if (this.options.tooltip) {
            button.title = this.options.tooltip;
        }

        // Badge
        if (this.options.badge) {
            const badge = this.createBadge();
            button.appendChild(badge);
        }

        return button;
    }

    getClasses() {
        const classes = [
            'btn',
            `btn--${this.options.variant}`,
            `btn--${this.options.size}`
        ];

        if (this.options.fullWidth) classes.push('btn--full-width');
        if (this.options.rounded) classes.push('btn--rounded');
        if (this.options.outlined) classes.push('btn--outlined');
        if (this.options.gradient) classes.push('btn--gradient');
        if (this.options.glow) classes.push('btn--glow');
        if (this.options.loading) classes.push('btn--loading');
        if (this.options.className) classes.push(this.options.className);

        return classes.join(' ');
    }

    createContent() {
        const content = document.createElement('span');
        content.className = 'btn__content';

        if (this.options.loading) {
            const spinner = document.createElement('span');
            spinner.className = 'btn__spinner';
            spinner.innerHTML = '⟳';
            content.appendChild(spinner);
        }

        if (this.options.icon && this.options.iconPosition === 'left') {
            const icon = document.createElement('i');
            icon.className = `btn__icon btn__icon--left ${this.options.icon}`;
            content.appendChild(icon);
        }

        if (this.options.text) {
            const text = document.createElement('span');
            text.className = 'btn__text';
            text.textContent = this.options.text;
            content.appendChild(text);
        }

        if (this.options.icon && this.options.iconPosition === 'right') {
            const icon = document.createElement('i');
            icon.className = `btn__icon btn__icon--right ${this.options.icon}`;
            content.appendChild(icon);
        }

        return content;
    }

    createBadge() {
        const badge = document.createElement('span');
        badge.className = 'btn__badge';
        badge.textContent = this.options.badge;
        return badge;
    }

    bindEvents() {
        if (this.options.onClick) {
            this.element.addEventListener('click', this.options.onClick);
        }

        if (this.options.onHover) {
            this.element.addEventListener('mouseenter', this.options.onHover);
        }

        if (this.options.onFocus) {
            this.element.addEventListener('focus', this.options.onFocus);
        }

        // Ripple effect
        if (this.options.ripple) {
            this.element.addEventListener('click', this.createRipple.bind(this));
        }
    }

    createRipple(e) {
        const ripple = document.createElement('span');
        const rect = this.element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.6);
            transform: scale(0);
            animation: ripple 0.6s linear;
            left: ${x}px;
            top: ${y}px;
            width: ${size}px;
            height: ${size}px;
        `;

        this.element.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    }

    // Методы управления
    setLoading(loading) {
        this.options.loading = loading;
        if (loading) {
            addClass(this.element, 'btn--loading');
            this.element.disabled = true;
        } else {
            removeClass(this.element, 'btn--loading');
            this.element.disabled = this.options.disabled;
        }
    }

    setDisabled(disabled) {
        this.options.disabled = disabled;
        this.element.disabled = disabled;
    }

    setText(text) {
        const textEl = this.element.querySelector('.btn__text');
        if (textEl) textEl.textContent = text;
        this.options.text = text;
    }

    setBadge(badge) {
        const existingBadge = this.element.querySelector('.btn__badge');
        if (existingBadge) existingBadge.remove();

        if (badge) {
            const badgeEl = this.createBadge();
            this.element.appendChild(badgeEl);
        }
        this.options.badge = badge;
    }

    mount(parent) {
        const container = typeof parent === 'string' ? document.querySelector(parent) : parent;
        container.appendChild(this.element);
        return this;
    }

    destroy() {
        this.element.remove();
    }
}

/**
 * Enterprise Input Component
 */
export class Input {
    constructor(options = {}) {
        this.options = {
            type: 'text', // 'text' | 'password' | 'email' | 'number' | 'search' | 'tel' | 'url'
            placeholder: '',
            value: '',
            label: '',
            helperText: '',
            errorText: '',
            required: false,
            disabled: false,
            readonly: false,
            size: 'md', // 'sm' | 'md' | 'lg'
            variant: 'outlined', // 'outlined' | 'filled' | 'underlined'
            icon: null,
            iconPosition: 'left',
            clearable: false,
            maxLength: null,
            pattern: null,
            validation: null,
            autoComplete: null,
            autoFocus: false,
            debounceDelay: 300,
            onChange: null,
            onInput: null,
            onFocus: null,
            onBlur: null,
            onValidate: null,
            className: '',
            id: null,
            ...options
        };

        this.value = this.options.value;
        this.isValid = true;
        this.element = this.createElement();
        this.bindEvents();
    }

    createElement() {
        const container = document.createElement('div');
        container.className = this.getContainerClasses();

        // Label
        if (this.options.label) {
            const label = document.createElement('label');
            label.className = 'input__label';
            label.textContent = this.options.label;
            if (this.options.required) {
                const required = document.createElement('span');
                required.className = 'input__required';
                required.textContent = ' *';
                label.appendChild(required);
            }
            container.appendChild(label);
        }

        // Input wrapper
        const wrapper = document.createElement('div');
        wrapper.className = 'input__wrapper';

        // Left icon
        if (this.options.icon && this.options.iconPosition === 'left') {
            const icon = document.createElement('i');
            icon.className = `input__icon input__icon--left ${this.options.icon}`;
            wrapper.appendChild(icon);
        }

        // Input element
        const input = document.createElement('input');
        input.type = this.options.type;
        input.className = 'input__field';
        input.placeholder = this.options.placeholder;
        input.value = this.options.value;

        if (this.options.id) input.id = this.options.id;
        if (this.options.required) input.required = true;
        if (this.options.disabled) input.disabled = true;
        if (this.options.readonly) input.readOnly = true;
        if (this.options.maxLength) input.maxLength = this.options.maxLength;
        if (this.options.pattern) input.pattern = this.options.pattern;
        if (this.options.autoComplete) input.autoComplete = this.options.autoComplete;
        if (this.options.autoFocus) input.autoFocus = true;

        wrapper.appendChild(input);
        this.input = input;

        // Right icon
        if (this.options.icon && this.options.iconPosition === 'right') {
            const icon = document.createElement('i');
            icon.className = `input__icon input__icon--right ${this.options.icon}`;
            wrapper.appendChild(icon);
        }

        // Clear button
        if (this.options.clearable) {
            const clearBtn = document.createElement('button');
            clearBtn.type = 'button';
            clearBtn.className = 'input__clear';
            clearBtn.innerHTML = '✕';
            clearBtn.addEventListener('click', () => this.clear());
            wrapper.appendChild(clearBtn);
        }

        container.appendChild(wrapper);

        // Helper text
        if (this.options.helperText) {
            const helper = document.createElement('div');
            helper.className = 'input__helper';
            helper.textContent = this.options.helperText;
            container.appendChild(helper);
        }

        // Error text
        const error = document.createElement('div');
        error.className = 'input__error';
        error.textContent = this.options.errorText;
        container.appendChild(error);

        return container;
    }

    getContainerClasses() {
        const classes = [
            'input',
            `input--${this.options.variant}`,
            `input--${this.options.size}`
        ];

        if (this.options.disabled) classes.push('input--disabled');
        if (this.options.readonly) classes.push('input--readonly');
        if (!this.isValid) classes.push('input--error');
        if (this.options.className) classes.push(this.options.className);

        return classes.join(' ');
    }

    bindEvents() {
        let debounceTimer;

        this.input.addEventListener('input', (e) => {
            this.value = e.target.value;

            // Debounced onChange
            if (this.options.onChange) {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    this.options.onChange(this.value, e);
                }, this.options.debounceDelay);
            }

            // Immediate onInput
            if (this.options.onInput) {
                this.options.onInput(this.value, e);
            }

            // Auto validation
            this.validate();
        });

        if (this.options.onFocus) {
            this.input.addEventListener('focus', this.options.onFocus);
        }

        if (this.options.onBlur) {
            this.input.addEventListener('blur', this.options.onBlur);
        }
    }

    validate() {
        let isValid = true;
        let errorMessage = '';

        // Required validation
        if (this.options.required && !this.value.trim()) {
            isValid = false;
            errorMessage = 'Это поле обязательно для заполнения';
        }

        // Custom validation
        if (isValid && this.options.validation) {
            const result = this.options.validation(this.value);
            if (typeof result === 'boolean') {
                isValid = result;
            } else if (typeof result === 'object') {
                isValid = result.valid;
                errorMessage = result.message || '';
            }
        }

        this.setError(isValid ? '' : errorMessage);
        this.isValid = isValid;

        if (this.options.onValidate) {
            this.options.onValidate({ valid: isValid, message: errorMessage });
        }

        return isValid;
    }

    setError(message) {
        const errorEl = this.element.querySelector('.input__error');
        errorEl.textContent = message;

        if (message) {
            addClass(this.element, 'input--error');
        } else {
            removeClass(this.element, 'input--error');
        }
    }

    setValue(value) {
        this.value = value;
        this.input.value = value;
        this.validate();
    }

    getValue() {
        return this.value;
    }

    clear() {
        this.setValue('');
        this.input.focus();
    }

    focus() {
        this.input.focus();
    }

    blur() {
        this.input.blur();
    }

    setDisabled(disabled) {
        this.options.disabled = disabled;
        this.input.disabled = disabled;
        if (disabled) {
            addClass(this.element, 'input--disabled');
        } else {
            removeClass(this.element, 'input--disabled');
        }
    }

    mount(parent) {
        const container = typeof parent === 'string' ? document.querySelector(parent) : parent;
        container.appendChild(this.element);
        return this;
    }

    destroy() {
        this.element.remove();
    }
}

/**
 * Enterprise Select Component
 */
export class Select {
    constructor(options = {}) {
        this.options = {
            options: [], // [{ value, label, disabled?, selected? }]
            placeholder: 'Выберите опцию',
            value: null,
            multiple: false,
            searchable: false,
            clearable: false,
            disabled: false,
            size: 'md',
            label: '',
            helperText: '',
            errorText: '',
            required: false,
            loading: false,
            loadingText: 'Загрузка...',
            noOptionsText: 'Нет доступных опций',
            maxHeight: 200,
            onChange: null,
            onSearch: null,
            onOpen: null,
            onClose: null,
            className: '',
            id: null,
            ...options
        };

        this.isOpen = false;
        this.searchQuery = '';
        this.selectedValues = this.options.multiple ? [] : (this.options.value || null);
        this.element = this.createElement();
        this.bindEvents();
    }

    createElement() {
        const container = document.createElement('div');
        container.className = this.getContainerClasses();

        // Label
        if (this.options.label) {
            const label = document.createElement('label');
            label.className = 'select__label';
            label.textContent = this.options.label;
            if (this.options.required) {
                const required = document.createElement('span');
                required.className = 'select__required';
                required.textContent = ' *';
                label.appendChild(required);
            }
            container.appendChild(label);
        }

        // Select wrapper
        const wrapper = document.createElement('div');
        wrapper.className = 'select__wrapper';

        // Trigger
        const trigger = document.createElement('div');
        trigger.className = 'select__trigger';
        trigger.tabIndex = 0;

        const display = document.createElement('div');
        display.className = 'select__display';
        display.textContent = this.options.placeholder;
        trigger.appendChild(display);

        const arrow = document.createElement('i');
        arrow.className = 'select__arrow fas fa-chevron-down';
        trigger.appendChild(arrow);

        wrapper.appendChild(trigger);

        // Dropdown
        const dropdown = document.createElement('div');
        dropdown.className = 'select__dropdown';
        dropdown.style.maxHeight = `${this.options.maxHeight}px`;

        // Search input (if searchable)
        if (this.options.searchable) {
            const searchWrapper = document.createElement('div');
            searchWrapper.className = 'select__search';

            const searchInput = document.createElement('input');
            searchInput.type = 'text';
            searchInput.className = 'select__search-input';
            searchInput.placeholder = 'Поиск...';
            searchWrapper.appendChild(searchInput);

            dropdown.appendChild(searchWrapper);
            this.searchInput = searchInput;
        }

        // Options list
        const optionsList = document.createElement('div');
        optionsList.className = 'select__options';
        dropdown.appendChild(optionsList);

        wrapper.appendChild(dropdown);
        container.appendChild(wrapper);

        // Helper text
        if (this.options.helperText) {
            const helper = document.createElement('div');
            helper.className = 'select__helper';
            helper.textContent = this.options.helperText;
            container.appendChild(helper);
        }

        // Error text
        const error = document.createElement('div');
        error.className = 'select__error';
        error.textContent = this.options.errorText;
        container.appendChild(error);

        this.trigger = trigger;
        this.display = display;
        this.dropdown = dropdown;
        this.optionsList = optionsList;

        this.renderOptions();
        this.updateDisplay();

        return container;
    }

    getContainerClasses() {
        const classes = [
            'select',
            `select--${this.options.size}`
        ];

        if (this.isOpen) classes.push('select--open');
        if (this.options.disabled) classes.push('select--disabled');
        if (this.options.multiple) classes.push('select--multiple');
        if (this.options.searchable) classes.push('select--searchable');
        if (this.options.className) classes.push(this.options.className);

        return classes.join(' ');
    }

    renderOptions() {
        this.optionsList.innerHTML = '';

        if (this.options.loading) {
            const loading = document.createElement('div');
            loading.className = 'select__loading';
            loading.textContent = this.options.loadingText;
            this.optionsList.appendChild(loading);
            return;
        }

        const filteredOptions = this.filterOptions();

        if (filteredOptions.length === 0) {
            const noOptions = document.createElement('div');
            noOptions.className = 'select__no-options';
            noOptions.textContent = this.options.noOptionsText;
            this.optionsList.appendChild(noOptions);
            return;
        }

        filteredOptions.forEach(option => {
            const optionEl = document.createElement('div');
            optionEl.className = 'select__option';
            optionEl.dataset.value = option.value;
            optionEl.textContent = option.label;

            if (option.disabled) {
                addClass(optionEl, 'select__option--disabled');
            } else {
                optionEl.addEventListener('click', () => this.selectOption(option));
            }

            if (this.isSelected(option.value)) {
                addClass(optionEl, 'select__option--selected');
            }

            this.optionsList.appendChild(optionEl);
        });
    }

    filterOptions() {
        if (!this.searchQuery.trim()) return this.options.options;

        return this.options.options.filter(option =>
            option.label.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
    }

    selectOption(option) {
        if (this.options.multiple) {
            const index = this.selectedValues.findIndex(val => val === option.value);
            if (index > -1) {
                this.selectedValues.splice(index, 1);
            } else {
                this.selectedValues.push(option.value);
            }
        } else {
            this.selectedValues = option.value;
            this.close();
        }

        this.updateDisplay();
        this.renderOptions();

        if (this.options.onChange) {
            this.options.onChange(this.selectedValues);
        }
    }

    isSelected(value) {
        if (this.options.multiple) {
            return this.selectedValues.includes(value);
        }
        return this.selectedValues === value;
    }

    updateDisplay() {
        if (this.options.multiple) {
            if (this.selectedValues.length === 0) {
                this.display.textContent = this.options.placeholder;
            } else {
                const labels = this.selectedValues.map(value => {
                    const option = this.options.options.find(opt => opt.value === value);
                    return option ? option.label : value;
                });
                this.display.textContent = labels.join(', ');
            }
        } else {
            if (this.selectedValues === null) {
                this.display.textContent = this.options.placeholder;
            } else {
                const option = this.options.options.find(opt => opt.value === this.selectedValues);
                this.display.textContent = option ? option.label : this.selectedValues;
            }
        }
    }

    bindEvents() {
        // Trigger click
        this.trigger.addEventListener('click', () => {
            if (!this.options.disabled) {
                this.toggle();
            }
        });

        // Keyboard navigation
        this.trigger.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.toggle();
            }
        });

        // Search input
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value;
                this.renderOptions();

                if (this.options.onSearch) {
                    this.options.onSearch(this.searchQuery);
                }
            });
        }

        // Click outside to close
        document.addEventListener('click', (e) => {
            if (!this.element.contains(e.target)) {
                this.close();
            }
        });
    }

    open() {
        if (this.isOpen || this.options.disabled) return;

        this.isOpen = true;
        addClass(this.element, 'select--open');

        if (this.searchInput) {
            setTimeout(() => this.searchInput.focus(), 0);
        }

        if (this.options.onOpen) {
            this.options.onOpen();
        }
    }

    close() {
        if (!this.isOpen) return;

        this.isOpen = false;
        removeClass(this.element, 'select--open');
        this.searchQuery = '';

        if (this.searchInput) {
            this.searchInput.value = '';
        }

        this.renderOptions();

        if (this.options.onClose) {
            this.options.onClose();
        }
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    setOptions(options) {
        this.options.options = options;
        this.renderOptions();
        this.updateDisplay();
    }

    setValue(value) {
        this.selectedValues = value;
        this.updateDisplay();
        this.renderOptions();
    }

    getValue() {
        return this.selectedValues;
    }

    setLoading(loading) {
        this.options.loading = loading;
        this.renderOptions();
    }

    clear() {
        this.selectedValues = this.options.multiple ? [] : null;
        this.updateDisplay();
        this.renderOptions();

        if (this.options.onChange) {
            this.options.onChange(this.selectedValues);
        }
    }

    mount(parent) {
        const container = typeof parent === 'string' ? document.querySelector(parent) : parent;
        container.appendChild(this.element);
        return this;
    }

    destroy() {
        this.element.remove();
    }
}

// ===========================================
// ИНДИКАТОРЫ И ОБРАТНАЯ СВЯЗЬ
// ===========================================

/**
 * Enterprise Spinner/Loader Component
 */
export class Spinner {
    constructor(options = {}) {
        this.options = {
            size: 24, // px or 'sm' | 'md' | 'lg' | 'xl'
            color: null,
            thickness: 2,
            speed: 'normal', // 'slow' | 'normal' | 'fast'
            type: 'circular', // 'circular' | 'dots' | 'bars' | 'pulse' | 'skeleton'
            overlay: false,
            message: '',
            className: '',
            ...options
        };

        this.element = this.createElement();
    }

    createElement() {
        const container = document.createElement('div');
        container.className = this.getContainerClasses();

        if (this.options.overlay) {
            container.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
            `;
        }

        const spinner = this.createSpinner();
        container.appendChild(spinner);

        if (this.options.message) {
            const message = document.createElement('div');
            message.className = 'spinner__message';
            message.textContent = this.options.message;
            container.appendChild(message);
        }

        return container;
    }

    getContainerClasses() {
        const classes = ['spinner'];

        if (typeof this.options.size === 'string') {
            classes.push(`spinner--${this.options.size}`);
        }

        classes.push(`spinner--${this.options.type}`);
        classes.push(`spinner--${this.options.speed}`);

        if (this.options.overlay) classes.push('spinner--overlay');
        if (this.options.className) classes.push(this.options.className);

        return classes.join(' ');
    }

    createSpinner() {
        const spinner = document.createElement('div');
        spinner.className = 'spinner__element';

        if (typeof this.options.size === 'number') {
            spinner.style.width = `${this.options.size}px`;
            spinner.style.height = `${this.options.size}px`;
        }

        if (this.options.color) {
            spinner.style.borderTopColor = this.options.color;
        }

        switch (this.options.type) {
            case 'dots':
                return this.createDotsSpinner();
            case 'bars':
                return this.createBarsSpinner();
            case 'pulse':
                return this.createPulseSpinner();
            case 'skeleton':
                return this.createSkeletonSpinner();
            default:
                return spinner;
        }
    }

    createDotsSpinner() {
        const container = document.createElement('div');
        container.className = 'spinner__dots';

        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.className = 'spinner__dot';
            dot.style.animationDelay = `${i * 0.1}s`;
            container.appendChild(dot);
        }

        return container;
    }

    createBarsSpinner() {
        const container = document.createElement('div');
        container.className = 'spinner__bars';

        for (let i = 0; i < 4; i++) {
            const bar = document.createElement('div');
            bar.className = 'spinner__bar';
            bar.style.animationDelay = `${i * 0.1}s`;
            container.appendChild(bar);
        }

        return container;
    }

    createPulseSpinner() {
        const container = document.createElement('div');
        container.className = 'spinner__pulse';
        return container;
    }

    createSkeletonSpinner() {
        const container = document.createElement('div');
        container.className = 'spinner__skeleton';

        // Create skeleton lines
        for (let i = 0; i < 3; i++) {
            const line = document.createElement('div');
            line.className = 'spinner__skeleton-line';
            line.style.width = `${100 - (i * 10)}%`;
            container.appendChild(line);
        }

        return container;
    }

    show() {
        this.element.style.display = 'flex';
    }

    hide() {
        this.element.style.display = 'none';
    }

    mount(parent) {
        const container = typeof parent === 'string' ? document.querySelector(parent) : parent;
        container.appendChild(this.element);
        return this;
    }

    destroy() {
        this.element.remove();
    }
}

/**
 * Enterprise Progress Bar Component
 */
export class ProgressBar {
    constructor(options = {}) {
        this.options = {
            value: 0, // 0-100
            max: 100,
            size: 'md', // 'sm' | 'md' | 'lg'
            variant: 'default', // 'default' | 'success' | 'warning' | 'error' | 'info'
            striped: false,
            animated: false,
            showLabel: true,
            showPercentage: true,
            label: '',
            indeterminate: false,
            color: null,
            backgroundColor: null,
            borderRadius: null,
            gradient: false,
            glow: false,
            className: '',
            ...options
        };

        this.element = this.createElement();
        this.updateProgress();
    }

    createElement() {
        const container = document.createElement('div');
        container.className = this.getContainerClasses();

        // Label
        if (this.options.showLabel && this.options.label) {
            const label = document.createElement('div');
            label.className = 'progress__label';
            label.textContent = this.options.label;
            container.appendChild(label);
        }

        // Progress wrapper
        const wrapper = document.createElement('div');
        wrapper.className = 'progress__wrapper';

        // Progress bar track
        const track = document.createElement('div');
        track.className = 'progress__track';

        // Progress bar fill
        const fill = document.createElement('div');
        fill.className = 'progress__fill';
        track.appendChild(fill);

        // Progress percentage text
        if (this.options.showPercentage) {
            const percentage = document.createElement('div');
            percentage.className = 'progress__percentage';
            fill.appendChild(percentage);
            this.percentageEl = percentage;
        }

        wrapper.appendChild(track);
        container.appendChild(wrapper);

        this.fill = fill;
        this.track = track;

        return container;
    }

    getContainerClasses() {
        const classes = [
            'progress',
            `progress--${this.options.size}`,
            `progress--${this.options.variant}`
        ];

        if (this.options.striped) classes.push('progress--striped');
        if (this.options.animated) classes.push('progress--animated');
        if (this.options.indeterminate) classes.push('progress--indeterminate');
        if (this.options.gradient) classes.push('progress--gradient');
        if (this.options.glow) classes.push('progress--glow');
        if (this.options.className) classes.push(this.options.className);

        return classes.join(' ');
    }

    updateProgress() {
        const percentage = Math.min(100, Math.max(0, (this.options.value / this.options.max) * 100));

        if (!this.options.indeterminate) {
            this.fill.style.width = `${percentage}%`;
        }

        if (this.percentageEl) {
            this.percentageEl.textContent = `${Math.round(percentage)}%`;
        }

        // Custom colors
        if (this.options.color) {
            this.fill.style.backgroundColor = this.options.color;
        }

        if (this.options.backgroundColor) {
            this.track.style.backgroundColor = this.options.backgroundColor;
        }

        if (this.options.borderRadius) {
            this.track.style.borderRadius = this.options.borderRadius;
            this.fill.style.borderRadius = this.options.borderRadius;
        }
    }

    setValue(value) {
        this.options.value = value;
        this.updateProgress();
    }

    setMax(max) {
        this.options.max = max;
        this.updateProgress();
    }

    setVariant(variant) {
        removeClass(this.element, `progress--${this.options.variant}`);
        this.options.variant = variant;
        addClass(this.element, `progress--${variant}`);
    }

    setIndeterminate(indeterminate) {
        this.options.indeterminate = indeterminate;
        if (indeterminate) {
            addClass(this.element, 'progress--indeterminate');
        } else {
            removeClass(this.element, 'progress--indeterminate');
            this.updateProgress();
        }
    }

    mount(parent) {
        const container = typeof parent === 'string' ? document.querySelector(parent) : parent;
        container.appendChild(this.element);
        return this;
    }

    destroy() {
        this.element.remove();
    }
}

/**
 * Enterprise Toast Notification Component
 */
export class Toast {
    constructor(options = {}) {
        this.options = {
            message: '',
            type: 'info', // 'success' | 'error' | 'warning' | 'info'
            duration: 5000,
            position: 'top-right', // 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
            closable: true,
            pauseOnHover: true,
            showProgress: true,
            icon: null,
            title: null,
            action: null, // { text, handler }
            className: '',
            onShow: null,
            onHide: null,
            onClose: null,
            ...options
        };

        this.element = this.createElement();
        this.timeoutId = null;
        this.progressInterval = null;

        this.show();
    }

    createElement() {
        const toast = document.createElement('div');
        toast.className = this.getClasses();

        // Icon
        if (this.options.icon || this.getDefaultIcon()) {
            const icon = document.createElement('div');
            icon.className = 'toast__icon';
            icon.innerHTML = `<i class="${this.options.icon || this.getDefaultIcon()}"></i>`;
            toast.appendChild(icon);
        }

        // Content
        const content = document.createElement('div');
        content.className = 'toast__content';

        // Title
        if (this.options.title) {
            const title = document.createElement('div');
            title.className = 'toast__title';
            title.textContent = this.options.title;
            content.appendChild(title);
        }

        // Message
        const message = document.createElement('div');
        message.className = 'toast__message';
        message.textContent = this.options.message;
        content.appendChild(message);

        toast.appendChild(content);

        // Action button
        if (this.options.action) {
            const action = document.createElement('button');
            action.className = 'toast__action';
            action.textContent = this.options.action.text;
            action.addEventListener('click', () => {
                if (this.options.action.handler) {
                    this.options.action.handler();
                }
                this.close();
            });
            toast.appendChild(action);
        }

        // Close button
        if (this.options.closable) {
            const close = document.createElement('button');
            close.className = 'toast__close';
            close.innerHTML = '✕';
            close.addEventListener('click', () => this.close());
            toast.appendChild(close);
        }

        // Progress bar
        if (this.options.showProgress && this.options.duration > 0) {
            const progress = document.createElement('div');
            progress.className = 'toast__progress';
            toast.appendChild(progress);
            this.progressEl = progress;
        }

        return toast;
    }

    getClasses() {
        const classes = [
            'toast',
            `toast--${this.options.type}`,
            `toast--${this.options.position}`
        ];

        if (this.options.className) classes.push(this.options.className);

        return classes.join(' ');
    }

    getDefaultIcon() {
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };

        return icons[this.options.type];
    }

    show() {
        // Get or create container
        let container = document.querySelector(`.toast-container--${this.options.position}`);
        if (!container) {
            container = document.createElement('div');
            container.className = `toast-container toast-container--${this.options.position}`;
            document.body.appendChild(container);
        }

        container.appendChild(this.element);

        // Animate in
        setTimeout(() => addClass(this.element, 'toast--show'), 10);

        // Setup auto hide
        if (this.options.duration > 0) {
            this.startAutoHide();
        }

        // Pause on hover
        if (this.options.pauseOnHover) {
            this.element.addEventListener('mouseenter', () => this.pauseAutoHide());
            this.element.addEventListener('mouseleave', () => this.resumeAutoHide());
        }

        if (this.options.onShow) {
            this.options.onShow();
        }
    }

    startAutoHide() {
        this.timeoutId = setTimeout(() => this.close(), this.options.duration);

        if (this.progressEl) {
            this.progressEl.style.transition = `width ${this.options.duration}ms linear`;
            setTimeout(() => {
                if (this.progressEl) {
                    this.progressEl.style.width = '0%';
                }
            }, 10);
        }
    }

    pauseAutoHide() {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }

        if (this.progressEl) {
            this.progressEl.style.animationPlayState = 'paused';
        }
    }

    resumeAutoHide() {
        const remaining = this.getRemainingTime();
        if (remaining > 0) {
            this.timeoutId = setTimeout(() => this.close(), remaining);

            if (this.progressEl) {
                this.progressEl.style.animationPlayState = 'running';
            }
        }
    }

    getRemainingTime() {
        if (!this.progressEl) return 0;

        const currentWidth = parseFloat(this.progressEl.style.width) || 100;
        return (currentWidth / 100) * this.options.duration;
    }

    close() {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }

        if (this.progressInterval) {
            clearInterval(this.progressInterval);
        }

        addClass(this.element, 'toast--hide');

        setTimeout(() => {
            this.element.remove();

            // Remove container if empty
            const container = this.element.parentElement;
            if (container && container.children.length === 0) {
                container.remove();
            }
        }, ANIMATION_DURATION.NORMAL);

        if (this.options.onClose) {
            this.options.onClose();
        }
    }

    static show(message, type = 'info', options = {}) {
        return new Toast({
            message,
            type,
            ...options
        });
    }

    static success(message, options = {}) {
        return Toast.show(message, 'success', options);
    }

    static error(message, options = {}) {
        return Toast.show(message, 'error', options);
    }

    static warning(message, options = {}) {
        return Toast.show(message, 'warning', options);
    }

    static info(message, options = {}) {
        return Toast.show(message, 'info', options);
    }
}

// ===========================================
// LAYOUT КОМПОНЕНТЫ
// ===========================================

/**
 * Enterprise Card Component
 */
export class Card {
    constructor(options = {}) {
        this.options = {
            title: '',
            subtitle: '',
            content: '',
            footer: '',
            image: null,
            imagePosition: 'top', // 'top' | 'bottom' | 'left' | 'right'
            actions: [], // [{ text, variant, handler }]
            variant: 'default', // 'default' | 'outlined' | 'elevated' | 'filled'
            size: 'md', // 'sm' | 'md' | 'lg'
            clickable: false,
            selectable: false,
            selected: false,
            loading: false,
            className: '',
            onClick: null,
            onSelect: null,
            ...options
        };

        this.element = this.createElement();
        this.bindEvents();
    }

    createElement() {
        const card = document.createElement('div');
        card.className = this.getClasses();

        // Loading overlay
        if (this.options.loading) {
            const loading = document.createElement('div');
            loading.className = 'card__loading';

            const spinner = new Spinner({ size: 'sm' });
            loading.appendChild(spinner.element);

            card.appendChild(loading);
        }

        // Image
        if (this.options.image) {
            const imageEl = document.createElement('div');
            imageEl.className = `card__image card__image--${this.options.imagePosition}`;

            if (typeof this.options.image === 'string') {
                imageEl.innerHTML = `<img src="${this.options.image}" alt="" />`;
            } else {
                imageEl.appendChild(this.options.image);
            }

            card.appendChild(imageEl);
        }

        // Header
        if (this.options.title || this.options.subtitle) {
            const header = document.createElement('div');
            header.className = 'card__header';

            if (this.options.title) {
                const title = document.createElement('h3');
                title.className = 'card__title';
                title.textContent = this.options.title;
                header.appendChild(title);
            }

            if (this.options.subtitle) {
                const subtitle = document.createElement('div');
                subtitle.className = 'card__subtitle';
                subtitle.textContent = this.options.subtitle;
                header.appendChild(subtitle);
            }

            card.appendChild(header);
        }

        // Content
        if (this.options.content) {
            const content = document.createElement('div');
            content.className = 'card__content';

            if (typeof this.options.content === 'string') {
                content.innerHTML = this.options.content;
            } else {
                content.appendChild(this.options.content);
            }

            card.appendChild(content);
        }

        // Actions
        if (this.options.actions.length > 0) {
            const actions = document.createElement('div');
            actions.className = 'card__actions';

            this.options.actions.forEach(action => {
                const btn = new Button({
                    text: action.text,
                    variant: action.variant || 'ghost',
                    size: 'sm',
                    onClick: action.handler
                });
                actions.appendChild(btn.element);
            });

            card.appendChild(actions);
        }

        // Footer
        if (this.options.footer) {
            const footer = document.createElement('div');
            footer.className = 'card__footer';

            if (typeof this.options.footer === 'string') {
                footer.innerHTML = this.options.footer;
            } else {
                footer.appendChild(this.options.footer);
            }

            card.appendChild(footer);
        }

        // Selection indicator
        if (this.options.selectable) {
            const indicator = document.createElement('div');
            indicator.className = 'card__selection-indicator';
            indicator.innerHTML = '<i class="fas fa-check"></i>';
            card.appendChild(indicator);
        }

        return card;
    }

    getClasses() {
        const classes = [
            'card',
            `card--${this.options.variant}`,
            `card--${this.options.size}`
        ];

        if (this.options.clickable) classes.push('card--clickable');
        if (this.options.selectable) classes.push('card--selectable');
        if (this.options.selected) classes.push('card--selected');
        if (this.options.loading) classes.push('card--loading');
        if (this.options.className) classes.push(this.options.className);

        return classes.join(' ');
    }

    bindEvents() {
        if (this.options.clickable && this.options.onClick) {
            this.element.addEventListener('click', this.options.onClick);
        }

        if (this.options.selectable) {
            this.element.addEventListener('click', () => {
                this.setSelected(!this.options.selected);
            });
        }
    }

    setSelected(selected) {
        this.options.selected = selected;

        if (selected) {
            addClass(this.element, 'card--selected');
        } else {
            removeClass(this.element, 'card--selected');
        }

        if (this.options.onSelect) {
            this.options.onSelect(selected);
        }
    }

    setLoading(loading) {
        this.options.loading = loading;

        if (loading) {
            addClass(this.element, 'card--loading');

            if (!this.element.querySelector('.card__loading')) {
                const loadingEl = document.createElement('div');
                loadingEl.className = 'card__loading';

                const spinner = new Spinner({ size: 'sm' });
                loadingEl.appendChild(spinner.element);

                this.element.appendChild(loadingEl);
            }
        } else {
            removeClass(this.element, 'card--loading');

            const loadingEl = this.element.querySelector('.card__loading');
            if (loadingEl) {
                loadingEl.remove();
            }
        }
    }

    setContent(content) {
        const contentEl = this.element.querySelector('.card__content');
        if (contentEl) {
            if (typeof content === 'string') {
                contentEl.innerHTML = content;
            } else {
                contentEl.innerHTML = '';
                contentEl.appendChild(content);
            }
        }
        this.options.content = content;
    }

    mount(parent) {
        const container = typeof parent === 'string' ? document.querySelector(parent) : parent;
        container.appendChild(this.element);
        return this;
    }

    destroy() {
        this.element.remove();
    }
}

// ===========================================
// НАВИГАЦИОННЫЕ КОМПОНЕНТЫ
// ===========================================

/**
 * Enterprise Tab View Component
 */
export class TabView {
    constructor(options = {}) {
        this.options = {
            tabs: [], // [{ id, label, content, disabled?, badge? }]
            activeTab: null,
            variant: 'default', // 'default' | 'pills' | 'underlined'
            size: 'md', // 'sm' | 'md' | 'lg'
            orientation: 'horizontal', // 'horizontal' | 'vertical'
            closable: false,
            lazy: false,
            keepAlive: true,
            onChange: null,
            onClose: null,
            className: '',
            ...options
        };

        this.activeTabId = this.options.activeTab || (this.options.tabs[0]?.id);
        this.element = this.createElement();
        this.bindEvents();

        if (this.activeTabId) {
            this.setActiveTab(this.activeTabId);
        }
    }

    createElement() {
        const container = document.createElement('div');
        container.className = this.getContainerClasses();

        // Tab navigation
        const nav = document.createElement('div');
        nav.className = 'tabs__nav';

        const tabsList = document.createElement('div');
        tabsList.className = 'tabs__list';

        this.options.tabs.forEach(tab => {
            const tabButton = document.createElement('button');
            tabButton.type = 'button';
            tabButton.className = 'tabs__tab';
            tabButton.dataset.tabId = tab.id;

            if (tab.disabled) {
                tabButton.disabled = true;
                addClass(tabButton, 'tabs__tab--disabled');
            }

            // Tab content
            const tabContent = document.createElement('span');
            tabContent.className = 'tabs__tab-content';
            tabContent.textContent = tab.label;
            tabButton.appendChild(tabContent);

            // Badge
            if (tab.badge) {
                const badge = document.createElement('span');
                badge.className = 'tabs__tab-badge';
                badge.textContent = tab.badge;
                tabButton.appendChild(badge);
            }

            // Close button
            if (this.options.closable) {
                const closeBtn = document.createElement('button');
                closeBtn.type = 'button';
                closeBtn.className = 'tabs__tab-close';
                closeBtn.innerHTML = '✕';
                closeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.closeTab(tab.id);
                });
                tabButton.appendChild(closeBtn);
            }

            tabsList.appendChild(tabButton);
        });

        nav.appendChild(tabsList);
        container.appendChild(nav);

        // Tab panels
        const panels = document.createElement('div');
        panels.className = 'tabs__panels';

        this.options.tabs.forEach(tab => {
            const panel = document.createElement('div');
            panel.className = 'tabs__panel';
            panel.dataset.tabId = tab.id;
            panel.setAttribute('role', 'tabpanel');
            panel.setAttribute('aria-labelledby', `tab-${tab.id}`);

            if (!this.options.lazy || tab.id === this.activeTabId) {
                this.loadTabContent(panel, tab);
            }

            panels.appendChild(panel);
        });

        container.appendChild(panels);

        this.nav = nav;
        this.panels = panels;

        return container;
    }

    getContainerClasses() {
        const classes = [
            'tabs',
            `tabs--${this.options.variant}`,
            `tabs--${this.options.size}`,
            `tabs--${this.options.orientation}`
        ];

        if (this.options.closable) classes.push('tabs--closable');
        if (this.options.className) classes.push(this.options.className);

        return classes.join(' ');
    }

    loadTabContent(panel, tab) {
        if (typeof tab.content === 'string') {
            panel.innerHTML = tab.content;
        } else if (typeof tab.content === 'function') {
            const content = tab.content();
            if (content instanceof Promise) {
                // Show loading
                panel.innerHTML = '<div class="tabs__loading">Загрузка...</div>';
                content.then(result => {
                    panel.innerHTML = '';
                    if (typeof result === 'string') {
                        panel.innerHTML = result;
                    } else {
                        panel.appendChild(result);
                    }
                });
            } else {
                panel.appendChild(content);
            }
        } else if (tab.content) {
            panel.appendChild(tab.content);
        }
    }

    bindEvents() {
        this.nav.addEventListener('click', (e) => {
            const tab = e.target.closest('.tabs__tab');
            if (tab && !tab.disabled) {
                const tabId = tab.dataset.tabId;
                this.setActiveTab(tabId);
            }
        });

        // Keyboard navigation
        this.nav.addEventListener('keydown', (e) => {
            const currentTab = this.nav.querySelector('.tabs__tab--active');
            let nextTab = null;

            switch (e.key) {
                case 'ArrowRight':
                case 'ArrowDown':
                    nextTab = currentTab.nextElementSibling;
                    break;
                case 'ArrowLeft':
                case 'ArrowUp':
                    nextTab = currentTab.previousElementSibling;
                    break;
                case 'Home':
                    nextTab = this.nav.querySelector('.tabs__tab');
                    break;
                case 'End':
                    const tabs = this.nav.querySelectorAll('.tabs__tab');
                    nextTab = tabs[tabs.length - 1];
                    break;
            }

            if (nextTab && !nextTab.disabled) {
                e.preventDefault();
                this.setActiveTab(nextTab.dataset.tabId);
                nextTab.focus();
            }
        });
    }

    setActiveTab(tabId) {
        const previousTab = this.activeTabId;
        this.activeTabId = tabId;

        // Update tab buttons
        this.nav.querySelectorAll('.tabs__tab').forEach(tab => {
            if (tab.dataset.tabId === tabId) {
                addClass(tab, 'tabs__tab--active');
                tab.setAttribute('aria-selected', 'true');
                tab.setAttribute('tabindex', '0');
            } else {
                removeClass(tab, 'tabs__tab--active');
                tab.setAttribute('aria-selected', 'false');
                tab.setAttribute('tabindex', '-1');
            }
        });

        // Update panels
        this.panels.querySelectorAll('.tabs__panel').forEach(panel => {
            if (panel.dataset.tabId === tabId) {
                addClass(panel, 'tabs__panel--active');

                // Lazy load content if needed
                if (this.options.lazy && !panel.innerHTML.trim()) {
                    const tab = this.options.tabs.find(t => t.id === tabId);
                    if (tab) {
                        this.loadTabContent(panel, tab);
                    }
                }
            } else {
                removeClass(panel, 'tabs__panel--active');

                // Remove content if not keeping alive
                if (!this.options.keepAlive && panel.dataset.tabId !== tabId) {
                    panel.innerHTML = '';
                }
            }
        });

        if (this.options.onChange) {
            this.options.onChange(tabId, previousTab);
        }
    }

    addTab(tab, index = -1) {
        if (index >= 0) {
            this.options.tabs.splice(index, 0, tab);
        } else {
            this.options.tabs.push(tab);
        }

        // Rebuild
        const newElement = this.createElement();
        this.element.replaceWith(newElement);
        this.element = newElement;
        this.bindEvents();
    }

    removeTab(tabId) {
        const index = this.options.tabs.findIndex(tab => tab.id === tabId);
        if (index > -1) {
            this.options.tabs.splice(index, 1);

            // If removing active tab, switch to next
            if (tabId === this.activeTabId) {
                const nextTab = this.options.tabs[index] || this.options.tabs[index - 1];
                if (nextTab) {
                    this.setActiveTab(nextTab.id);
                }
            }

            // Rebuild
            const newElement = this.createElement();
            this.element.replaceWith(newElement);
            this.element = newElement;
            this.bindEvents();
        }
    }

    closeTab(tabId) {
        if (this.options.onClose) {
            const result = this.options.onClose(tabId);
            if (result === false) return; // Cancel close
        }

        this.removeTab(tabId);
    }

    updateTabBadge(tabId, badge) {
        const tab = this.options.tabs.find(t => t.id === tabId);
        if (tab) {
            tab.badge = badge;

            const tabButton = this.nav.querySelector(`[data-tab-id="${tabId}"]`);
            if (tabButton) {
                let badgeEl = tabButton.querySelector('.tabs__tab-badge');

                if (badge) {
                    if (!badgeEl) {
                        badgeEl = document.createElement('span');
                        badgeEl.className = 'tabs__tab-badge';
                        tabButton.appendChild(badgeEl);
                    }
                    badgeEl.textContent = badge;
                } else if (badgeEl) {
                    badgeEl.remove();
                }
            }
        }
    }

    getActiveTab() {
        return this.activeTabId;
    }

    mount(parent) {
        const container = typeof parent === 'string' ? document.querySelector(parent) : parent;
        container.appendChild(this.element);
        return this;
    }

    destroy() {
        this.element.remove();
    }
}

// ===========================================
// РАСШИРЕННЫЕ КОМПОНЕНТЫ
// ===========================================

/**
 * Enterprise Data Table Component
 */
export class DataTable {
    constructor(options = {}) {
        this.options = {
            columns: [], // [{ key, title, sortable?, searchable?, width?, render? }]
            data: [],
            pagination: true,
            pageSize: 25,
            pageSizeOptions: [10, 25, 50, 100],
            sortable: true,
            searchable: true,
            selectable: false,
            multiSelect: false,
            rowActions: [], // [{ label, icon, handler }]
            loading: false,
            emptyText: 'Нет данных для отображения',
            loadingText: 'Загрузка...',
            onSort: null,
            onSearch: null,
            onSelect: null,
            onRowClick: null,
            onPageChange: null,
            className: '',
            ...options
        };

        this.state = {
            currentPage: 1,
            sortColumn: null,
            sortDirection: 'asc', // 'asc' | 'desc'
            searchQuery: '',
            selectedRows: new Set()
        };

        this.element = this.createElement();
        this.bindEvents();
        this.render();
    }

    createElement() {
        const container = document.createElement('div');
        container.className = this.getContainerClasses();

        // Toolbar
        const toolbar = document.createElement('div');
        toolbar.className = 'datatable__toolbar';

        // Search
        if (this.options.searchable) {
            const searchWrapper = document.createElement('div');
            searchWrapper.className = 'datatable__search';

            const searchInput = document.createElement('input');
            searchInput.type = 'text';
            searchInput.className = 'datatable__search-input';
            searchInput.placeholder = 'Поиск...';
            searchWrapper.appendChild(searchInput);

            toolbar.appendChild(searchWrapper);
            this.searchInput = searchInput;
        }

        // Actions
        const actions = document.createElement('div');
        actions.className = 'datatable__actions';
        toolbar.appendChild(actions);

        container.appendChild(toolbar);

        // Table wrapper
        const tableWrapper = document.createElement('div');
        tableWrapper.className = 'datatable__wrapper';

        // Table
        const table = document.createElement('table');
        table.className = 'datatable__table';

        // Header
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');

        // Select all checkbox
        if (this.options.selectable && this.options.multiSelect) {
            const selectCell = document.createElement('th');
            selectCell.className = 'datatable__select-cell';

            const selectAllCheckbox = document.createElement('input');
            selectAllCheckbox.type = 'checkbox';
            selectAllCheckbox.className = 'datatable__select-all';
            selectCell.appendChild(selectAllCheckbox);

            headerRow.appendChild(selectCell);
        }

        // Column headers
        this.options.columns.forEach(column => {
            const th = document.createElement('th');
            th.className = 'datatable__header-cell';
            th.dataset.columnKey = column.key;

            const content = document.createElement('div');
            content.className = 'datatable__header-content';
            content.textContent = column.title;

            if (column.sortable !== false && this.options.sortable) {
                addClass(th, 'datatable__header-cell--sortable');

                const sortIcon = document.createElement('i');
                sortIcon.className = 'datatable__sort-icon fas fa-sort';
                content.appendChild(sortIcon);
            }

            if (column.width) {
                th.style.width = column.width;
            }

            th.appendChild(content);
            headerRow.appendChild(th);
        });

        // Row actions column
        if (this.options.rowActions.length > 0) {
            const actionsCell = document.createElement('th');
            actionsCell.className = 'datatable__actions-cell';
            actionsCell.textContent = 'Действия';
            headerRow.appendChild(actionsCell);
        }

        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Body
        const tbody = document.createElement('tbody');
        table.appendChild(tbody);

        tableWrapper.appendChild(table);
        container.appendChild(tableWrapper);

        // Pagination
        if (this.options.pagination) {
            const pagination = document.createElement('div');
            pagination.className = 'datatable__pagination';
            container.appendChild(pagination);
        }

        // Loading overlay
        const loadingOverlay = document.createElement('div');
        loadingOverlay.className = 'datatable__loading';
        loadingOverlay.innerHTML = `
            <div class="datatable__loading-content">
                <div class="datatable__loading-spinner"></div>
                <div class="datatable__loading-text">${this.options.loadingText}</div>
            </div>
        `;
        container.appendChild(loadingOverlay);

        this.table = table;
        this.tbody = tbody;
        this.pagination = container.querySelector('.datatable__pagination');
        this.loadingOverlay = loadingOverlay;

        return container;
    }

    getContainerClasses() {
        const classes = ['datatable'];

        if (this.options.loading) classes.push('datatable--loading');
        if (this.options.selectable) classes.push('datatable--selectable');
        if (this.options.className) classes.push(this.options.className);

        return classes.join(' ');
    }

    bindEvents() {
        // Search
        if (this.searchInput) {
            this.searchInput.addEventListener('input', debounce((e) => {
                this.state.searchQuery = e.target.value;
                this.state.currentPage = 1;

                if (this.options.onSearch) {
                    this.options.onSearch(this.state.searchQuery);
                } else {
                    this.render();
                }
            }, 300));
        }

        // Column sorting
        this.table.addEventListener('click', (e) => {
            const headerCell = e.target.closest('.datatable__header-cell--sortable');
            if (headerCell) {
                const columnKey = headerCell.dataset.columnKey;
                this.sort(columnKey);
            }
        });

        // Row selection
        if (this.options.selectable) {
            this.tbody.addEventListener('change', (e) => {
                if (e.target.matches('.datatable__row-select')) {
                    const rowIndex = parseInt(e.target.dataset.rowIndex);
                    this.toggleRowSelection(rowIndex, e.target.checked);
                }
            });

            // Select all
            const selectAllCheckbox = this.element.querySelector('.datatable__select-all');
            if (selectAllCheckbox) {
                selectAllCheckbox.addEventListener('change', (e) => {
                    this.selectAll(e.target.checked);
                });
            }
        }

        // Row clicks
        if (this.options.onRowClick) {
            this.tbody.addEventListener('click', (e) => {
                const row = e.target.closest('tr');
                if (row && !e.target.closest('.datatable__actions')) {
                    const rowIndex = parseInt(row.dataset.rowIndex);
                    const rowData = this.getFilteredData()[rowIndex];
                    this.options.onRowClick(rowData, rowIndex);
                }
            });
        }
    }

    render() {
        this.renderTable();
        this.renderPagination();
        this.updateSortHeaders();
    }

    renderTable() {
        const data = this.getPageData();
        this.tbody.innerHTML = '';

        if (data.length === 0) {
            const emptyRow = document.createElement('tr');
            const emptyCell = document.createElement('td');
            emptyCell.colSpan = this.getColumnCount();
            emptyCell.className = 'datatable__empty';
            emptyCell.textContent = this.options.emptyText;
            emptyRow.appendChild(emptyCell);
            this.tbody.appendChild(emptyRow);
            return;
        }

        data.forEach((rowData, index) => {
            const row = document.createElement('tr');
            row.className = 'datatable__row';
            row.dataset.rowIndex = index;

            // Selection checkbox
            if (this.options.selectable) {
                const selectCell = document.createElement('td');
                selectCell.className = 'datatable__select-cell';

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.className = 'datatable__row-select';
                checkbox.dataset.rowIndex = index;
                checkbox.checked = this.state.selectedRows.has(index);
                selectCell.appendChild(checkbox);

                row.appendChild(selectCell);
            }

            // Data columns
            this.options.columns.forEach(column => {
                const cell = document.createElement('td');
                cell.className = 'datatable__cell';

                const value = rowData[column.key];

                if (column.render) {
                    const rendered = column.render(value, rowData, index);
                    if (typeof rendered === 'string') {
                        cell.innerHTML = rendered;
                    } else {
                        cell.appendChild(rendered);
                    }
                } else {
                    cell.textContent = value || '';
                }

                row.appendChild(cell);
            });

            // Actions column
            if (this.options.rowActions.length > 0) {
                const actionsCell = document.createElement('td');
                actionsCell.className = 'datatable__actions';

                const actionsWrapper = document.createElement('div');
                actionsWrapper.className = 'datatable__actions-wrapper';

                this.options.rowActions.forEach(action => {
                    const actionBtn = document.createElement('button');
                    actionBtn.type = 'button';
                    actionBtn.className = 'datatable__action-btn';
                    actionBtn.title = action.label;

                    if (action.icon) {
                        actionBtn.innerHTML = `<i class="${action.icon}"></i>`;
                    } else {
                        actionBtn.textContent = action.label;
                    }

                    actionBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        action.handler(rowData, index);
                    });

                    actionsWrapper.appendChild(actionBtn);
                });

                actionsCell.appendChild(actionsWrapper);
                row.appendChild(actionsCell);
            }

            this.tbody.appendChild(row);
        });
    }

    renderPagination() {
        if (!this.options.pagination || !this.pagination) return;

        const totalItems = this.getFilteredData().length;
        const totalPages = Math.ceil(totalItems / this.options.pageSize);

        if (totalPages <= 1) {
            this.pagination.innerHTML = '';
            return;
        }

        const paginationHTML = `
            <div class="datatable__pagination-info">
                Показано ${this.getPageStartIndex() + 1}-${Math.min(this.getPageEndIndex(), totalItems)} из ${totalItems}
            </div>
            <div class="datatable__pagination-controls">
                <button class="datatable__pagination-btn" ${this.state.currentPage === 1 ? 'disabled' : ''} data-action="first">
                    <i class="fas fa-angle-double-left"></i>
                </button>
                <button class="datatable__pagination-btn" ${this.state.currentPage === 1 ? 'disabled' : ''} data-action="prev">
                    <i class="fas fa-angle-left"></i>
                </button>
                <span class="datatable__pagination-pages">
                    Страница ${this.state.currentPage} из ${totalPages}
                </span>
                <button class="datatable__pagination-btn" ${this.state.currentPage === totalPages ? 'disabled' : ''} data-action="next">
                    <i class="fas fa-angle-right"></i>
                </button>
                <button class="datatable__pagination-btn" ${this.state.currentPage === totalPages ? 'disabled' : ''} data-action="last">
                    <i class="fas fa-angle-double-right"></i>
                </button>
            </div>
            <div class="datatable__page-size">
                <select class="datatable__page-size-select">
                    ${this.options.pageSizeOptions.map(size =>
            `<option value="${size}" ${size === this.options.pageSize ? 'selected' : ''}>${size} на странице</option>`
        ).join('')}
                </select>
            </div>
        `;

        this.pagination.innerHTML = paginationHTML;

        // Bind pagination events
        this.pagination.addEventListener('click', (e) => {
            const btn = e.target.closest('.datatable__pagination-btn');
            if (btn && !btn.disabled) {
                const action = btn.dataset.action;

                switch (action) {
                    case 'first':
                        this.goToPage(1);
                        break;
                    case 'prev':
                        this.goToPage(this.state.currentPage - 1);
                        break;
                    case 'next':
                        this.goToPage(this.state.currentPage + 1);
                        break;
                    case 'last':
                        this.goToPage(totalPages);
                        break;
                }
            }
        });

        // Page size change
        const pageSizeSelect = this.pagination.querySelector('.datatable__page-size-select');
        if (pageSizeSelect) {
            pageSizeSelect.addEventListener('change', (e) => {
                this.setPageSize(parseInt(e.target.value));
            });
        }
    }

    updateSortHeaders() {
        this.element.querySelectorAll('.datatable__header-cell').forEach(cell => {
            const sortIcon = cell.querySelector('.datatable__sort-icon');
            if (sortIcon) {
                const columnKey = cell.dataset.columnKey;

                if (this.state.sortColumn === columnKey) {
                    sortIcon.className = `datatable__sort-icon fas fa-sort-${this.state.sortDirection === 'asc' ? 'up' : 'down'}`;
                    addClass(cell, 'datatable__header-cell--sorted');
                } else {
                    sortIcon.className = 'datatable__sort-icon fas fa-sort';
                    removeClass(cell, 'datatable__header-cell--sorted');
                }
            }
        });
    }

    getFilteredData() {
        let data = [...this.options.data];

        // Apply search filter
        if (this.state.searchQuery && !this.options.onSearch) {
            data = data.filter(row => {
                return this.options.columns.some(column => {
                    if (column.searchable === false) return false;

                    const value = row[column.key];
                    if (value == null) return false;

                    return value.toString().toLowerCase().includes(this.state.searchQuery.toLowerCase());
                });
            });
        }

        // Apply sorting
        if (this.state.sortColumn && !this.options.onSort) {
            data.sort((a, b) => {
                const aValue = a[this.state.sortColumn];
                const bValue = b[this.state.sortColumn];

                let comparison = 0;

                if (aValue < bValue) comparison = -1;
                if (aValue > bValue) comparison = 1;

                return this.state.sortDirection === 'desc' ? -comparison : comparison;
            });
        }

        return data;
    }

    getPageData() {
        if (!this.options.pagination) {
            return this.getFilteredData();
        }

        const data = this.getFilteredData();
        const startIndex = this.getPageStartIndex();
        const endIndex = this.getPageEndIndex();

        return data.slice(startIndex, endIndex);
    }

    getPageStartIndex() {
        return (this.state.currentPage - 1) * this.options.pageSize;
    }

    getPageEndIndex() {
        return this.state.currentPage * this.options.pageSize;
    }

    getColumnCount() {
        let count = this.options.columns.length;
        if (this.options.selectable) count++;
        if (this.options.rowActions.length > 0) count++;
        return count;
    }

    // Public methods
    setData(data) {
        this.options.data = data;
        this.state.currentPage = 1;
        this.state.selectedRows.clear();
        this.render();
    }

    appendData(data) {
        this.options.data.push(...data);
        this.render();
    }

    sort(columnKey) {
        if (this.state.sortColumn === columnKey) {
            this.state.sortDirection = this.state.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.state.sortColumn = columnKey;
            this.state.sortDirection = 'asc';
        }

        if (this.options.onSort) {
            this.options.onSort(this.state.sortColumn, this.state.sortDirection);
        } else {
            this.render();
        }
    }

    search(query) {
        this.state.searchQuery = query;
        this.state.currentPage = 1;

        if (this.searchInput) {
            this.searchInput.value = query;
        }

        if (this.options.onSearch) {
            this.options.onSearch(query);
        } else {
            this.render();
        }
    }

    goToPage(page) {
        const totalPages = Math.ceil(this.getFilteredData().length / this.options.pageSize);

        if (page >= 1 && page <= totalPages) {
            this.state.currentPage = page;
            this.render();

            if (this.options.onPageChange) {
                this.options.onPageChange(page);
            }
        }
    }

    setPageSize(size) {
        this.options.pageSize = size;
        this.state.currentPage = 1;
        this.render();
    }

    toggleRowSelection(rowIndex, selected) {
        if (selected) {
            if (!this.options.multiSelect) {
                this.state.selectedRows.clear();
            }
            this.state.selectedRows.add(rowIndex);
        } else {
            this.state.selectedRows.delete(rowIndex);
        }

        this.updateSelectAllCheckbox();

        if (this.options.onSelect) {
            this.options.onSelect(Array.from(this.state.selectedRows));
        }
    }

    selectAll(selected) {
        if (selected) {
            const data = this.getPageData();
            data.forEach((_, index) => {
                this.state.selectedRows.add(index);
            });
        } else {
            this.state.selectedRows.clear();
        }

        this.render();

        if (this.options.onSelect) {
            this.options.onSelect(Array.from(this.state.selectedRows));
        }
    }

    updateSelectAllCheckbox() {
        const selectAllCheckbox = this.element.querySelector('.datatable__select-all');
        if (selectAllCheckbox) {
            const pageData = this.getPageData();
            const selectedInPage = pageData.filter((_, index) => this.state.selectedRows.has(index)).length;

            selectAllCheckbox.checked = selectedInPage === pageData.length && pageData.length > 0;
            selectAllCheckbox.indeterminate = selectedInPage > 0 && selectedInPage < pageData.length;
        }
    }

    getSelectedRows() {
        return Array.from(this.state.selectedRows).map(index => this.options.data[index]);
    }

    clearSelection() {
        this.state.selectedRows.clear();
        this.render();
    }

    setLoading(loading) {
        this.options.loading = loading;

        if (loading) {
            addClass(this.element, 'datatable--loading');
        } else {
            removeClass(this.element, 'datatable--loading');
        }
    }

    refresh() {
        this.render();
    }

    mount(parent) {
        const container = typeof parent === 'string' ? document.querySelector(parent) : parent;
        container.appendChild(this.element);
        return this;
    }

    destroy() {
        this.element.remove();
    }
}

// ===========================================
// УТИЛИТАРНЫЕ КОМПОНЕНТЫ
// ===========================================

/**
 * Enterprise Tooltip Component
 */
export class Tooltip {
    constructor(target, options = {}) {
        this.target = typeof target === 'string' ? document.querySelector(target) : target;
        this.options = {
            content: '',
            position: 'top', // 'top' | 'bottom' | 'left' | 'right'
            trigger: 'hover', // 'hover' | 'click' | 'focus' | 'manual'
            delay: 300,
            hideDelay: 100,
            animation: true,
            arrow: true,
            theme: 'dark', // 'dark' | 'light'
            maxWidth: 300,
            offset: 10,
            className: '',
            onShow: null,
            onHide: null,
            ...options
        };

        this.tooltip = null;
        this.isVisible = false;
        this.timeoutId = null;

        this.init();
    }

    init() {
        if (!this.target) return;

        this.bindEvents();
    }

    bindEvents() {
        switch (this.options.trigger) {
            case 'hover':
                this.target.addEventListener('mouseenter', () => this.show());
                this.target.addEventListener('mouseleave', () => this.hide());
                break;

            case 'click':
                this.target.addEventListener('click', () => this.toggle());
                document.addEventListener('click', (e) => {
                    if (!this.target.contains(e.target) && !this.tooltip?.contains(e.target)) {
                        this.hide();
                    }
                });
                break;

            case 'focus':
                this.target.addEventListener('focus', () => this.show());
                this.target.addEventListener('blur', () => this.hide());
                break;
        }
    }

    show() {
        if (this.isVisible) return;

        clearTimeout(this.timeoutId);

        this.timeoutId = setTimeout(() => {
            this.createTooltip();
            this.positionTooltip();

            if (this.options.animation) {
                setTimeout(() => addClass(this.tooltip, 'tooltip--show'), 10);
            } else {
                addClass(this.tooltip, 'tooltip--show');
            }

            this.isVisible = true;

            if (this.options.onShow) {
                this.options.onShow();
            }
        }, this.options.delay);
    }

    hide() {
        if (!this.isVisible) return;

        clearTimeout(this.timeoutId);

        this.timeoutId = setTimeout(() => {
            if (this.tooltip) {
                if (this.options.animation) {
                    removeClass(this.tooltip, 'tooltip--show');
                    setTimeout(() => {
                        this.destroyTooltip();
                    }, ANIMATION_DURATION.FAST);
                } else {
                    this.destroyTooltip();
                }
            }

            this.isVisible = false;

            if (this.options.onHide) {
                this.options.onHide();
            }
        }, this.options.hideDelay);
    }

    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    createTooltip() {
        this.tooltip = document.createElement('div');
        this.tooltip.className = this.getTooltipClasses();
        this.tooltip.style.maxWidth = `${this.options.maxWidth}px`;

        // Content
        const content = document.createElement('div');
        content.className = 'tooltip__content';

        if (typeof this.options.content === 'string') {
            content.innerHTML = this.options.content;
        } else {
            content.appendChild(this.options.content);
        }

        this.tooltip.appendChild(content);

        // Arrow
        if (this.options.arrow) {
            const arrow = document.createElement('div');
            arrow.className = 'tooltip__arrow';
            this.tooltip.appendChild(arrow);
        }

        document.body.appendChild(this.tooltip);
    }

    destroyTooltip() {
        if (this.tooltip) {
            this.tooltip.remove();
            this.tooltip = null;
        }
    }

    getTooltipClasses() {
        const classes = [
            'tooltip',
            `tooltip--${this.options.position}`,
            `tooltip--${this.options.theme}`
        ];

        if (this.options.arrow) classes.push('tooltip--arrow');
        if (this.options.animation) classes.push('tooltip--animated');
        if (this.options.className) classes.push(this.options.className);

        return classes.join(' ');
    }

    positionTooltip() {
        if (!this.tooltip) return;

        const targetRect = this.target.getBoundingClientRect();
        const tooltipRect = this.tooltip.getBoundingClientRect();

        let top, left;

        switch (this.options.position) {
            case 'top':
                top = targetRect.top - tooltipRect.height - this.options.offset;
                left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
                break;

            case 'bottom':
                top = targetRect.bottom + this.options.offset;
                left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
                break;

            case 'left':
                top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
                left = targetRect.left - tooltipRect.width - this.options.offset;
                break;

            case 'right':
                top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
                left = targetRect.right + this.options.offset;
                break;
        }

        // Viewport bounds checking
        const viewport = {
            top: window.scrollY,
            left: window.scrollX,
            right: window.scrollX + window.innerWidth,
            bottom: window.scrollY + window.innerHeight
        };

        // Adjust for viewport bounds
        if (left < viewport.left) {
            left = viewport.left + 10;
        } else if (left + tooltipRect.width > viewport.right) {
            left = viewport.right - tooltipRect.width - 10;
        }

        if (top < viewport.top) {
            top = viewport.top + 10;
        } else if (top + tooltipRect.height > viewport.bottom) {
            top = viewport.bottom - tooltipRect.height - 10;
        }

        this.tooltip.style.top = `${top}px`;
        this.tooltip.style.left = `${left}px`;
    }

    setContent(content) {
        this.options.content = content;

        if (this.tooltip) {
            const contentEl = this.tooltip.querySelector('.tooltip__content');
            if (contentEl) {
                if (typeof content === 'string') {
                    contentEl.innerHTML = content;
                } else {
                    contentEl.innerHTML = '';
                    contentEl.appendChild(content);
                }
            }
        }
    }

    destroy() {
        clearTimeout(this.timeoutId);
        this.destroyTooltip();

        // Remove event listeners would require storing references
        // For now, just mark as destroyed
        this.target = null;
    }

    static create(target, content, options = {}) {
        return new Tooltip(target, { content, ...options });
    }
}

/**
 * Enterprise Dropdown Component
 */
export class Dropdown {
    constructor(trigger, options = {}) {
        this.trigger = typeof trigger === 'string' ? document.querySelector(trigger) : trigger;
        this.options = {
            items: [], // [{ label, value, icon?, disabled?, divider?, handler? }]
            position: 'bottom-left', // 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right'
            trigger: 'click', // 'click' | 'hover'
            closeOnSelect: true,
            searchable: false,
            maxHeight: 300,
            offset: { x: 0, y: 0 },
            className: '',
            onSelect: null,
            onOpen: null,
            onClose: null,
            ...options
        };

        this.isOpen = false;
        this.dropdown = null;
        this.searchQuery = '';

        this.init();
    }

    init() {
        if (!this.trigger) return;

        this.bindEvents();
    }

    bindEvents() {
        if (this.options.trigger === 'click') {
            this.trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggle();
            });

            document.addEventListener('click', () => {
                if (this.isOpen) {
                    this.close();
                }
            });
        } else if (this.options.trigger === 'hover') {
            this.trigger.addEventListener('mouseenter', () => this.open());
            this.trigger.addEventListener('mouseleave', () => {
                setTimeout(() => {
                    if (!this.dropdown?.matches(':hover')) {
                        this.close();
                    }
                }, 100);
            });
        }

        // Keyboard navigation
        this.trigger.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.toggle();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.open();
                this.focusFirstItem();
            }
        });
    }

    open() {
        if (this.isOpen) return;

        this.createDropdown();
        this.positionDropdown();

        this.isOpen = true;
        addClass(this.trigger, 'dropdown-trigger--active');

        setTimeout(() => {
            addClass(this.dropdown, 'dropdown--show');
        }, 10);

        if (this.options.onOpen) {
            this.options.onOpen();
        }
    }

    close() {
        if (!this.isOpen) return;

        this.isOpen = false;
        removeClass(this.trigger, 'dropdown-trigger--active');

        if (this.dropdown) {
            removeClass(this.dropdown, 'dropdown--show');

            setTimeout(() => {
                this.destroyDropdown();
            }, ANIMATION_DURATION.FAST);
        }

        if (this.options.onClose) {
            this.options.onClose();
        }
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    createDropdown() {
        this.dropdown = document.createElement('div');
        this.dropdown.className = this.getDropdownClasses();
        this.dropdown.style.maxHeight = `${this.options.maxHeight}px`;

        // Prevent clicks inside dropdown from bubbling
        this.dropdown.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        // Search input
        if (this.options.searchable) {
            const searchWrapper = document.createElement('div');
            searchWrapper.className = 'dropdown__search';

            const searchInput = document.createElement('input');
            searchInput.type = 'text';
            searchInput.className = 'dropdown__search-input';
            searchInput.placeholder = 'Поиск...';

            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value.toLowerCase();
                this.renderItems();
            });

            searchWrapper.appendChild(searchInput);
            this.dropdown.appendChild(searchWrapper);
        }

        // Items container
        const itemsContainer = document.createElement('div');
        itemsContainer.className = 'dropdown__items';
        this.dropdown.appendChild(itemsContainer);

        this.renderItems();

        // Add keyboard navigation to dropdown
        this.dropdown.addEventListener('keydown', (e) => {
            const items = this.dropdown.querySelectorAll('.dropdown__item:not(.dropdown__item--disabled)');
            const focusedItem = this.dropdown.querySelector('.dropdown__item:focus');
            const currentIndex = Array.from(items).indexOf(focusedItem);

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
                    items[nextIndex]?.focus();
                    break;

                case 'ArrowUp':
                    e.preventDefault();
                    const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
                    items[prevIndex]?.focus();
                    break;

                case 'Enter':
                    e.preventDefault();
                    focusedItem?.click();
                    break;

                case 'Escape':
                    e.preventDefault();
                    this.close();
                    this.trigger.focus();
                    break;
            }
        });

        document.body.appendChild(this.dropdown);
    }

    renderItems() {
        const itemsContainer = this.dropdown.querySelector('.dropdown__items');
        itemsContainer.innerHTML = '';

        const filteredItems = this.getFilteredItems();

        if (filteredItems.length === 0) {
            const emptyItem = document.createElement('div');
            emptyItem.className = 'dropdown__empty';
            emptyItem.textContent = 'Нет результатов';
            itemsContainer.appendChild(emptyItem);
            return;
        }

        filteredItems.forEach((item, index) => {
            if (item.divider) {
                const divider = document.createElement('div');
                divider.className = 'dropdown__divider';
                itemsContainer.appendChild(divider);
                return;
            }

            const itemEl = document.createElement('div');
            itemEl.className = 'dropdown__item';
            itemEl.tabIndex = 0;
            itemEl.setAttribute('role', 'menuitem');

            if (item.disabled) {
                addClass(itemEl, 'dropdown__item--disabled');
                itemEl.tabIndex = -1;
            }

            // Icon
            if (item.icon) {
                const icon = document.createElement('i');
                icon.className = `dropdown__item-icon ${item.icon}`;
                itemEl.appendChild(icon);
            }

            // Label
            const label = document.createElement('span');
            label.className = 'dropdown__item-label';
            label.textContent = item.label;
            itemEl.appendChild(label);

            // Click handler
            if (!item.disabled) {
                itemEl.addEventListener('click', () => {
                    this.selectItem(item, index);
                });
            }

            itemsContainer.appendChild(itemEl);
        });
    }

    getFilteredItems() {
        if (!this.searchQuery) {
            return this.options.items;
        }

        return this.options.items.filter(item => {
            if (item.divider) return false;
            return item.label.toLowerCase().includes(this.searchQuery);
        });
    }

    selectItem(item, index) {
        if (item.handler) {
            item.handler(item, index);
        }

        if (this.options.onSelect) {
            this.options.onSelect(item, index);
        }

        if (this.options.closeOnSelect) {
            this.close();
        }
    }

    getDropdownClasses() {
        const classes = [
            'dropdown',
            `dropdown--${this.options.position}`
        ];

        if (this.options.searchable) classes.push('dropdown--searchable');
        if (this.options.className) classes.push(this.options.className);

        return classes.join(' ');
    }

    positionDropdown() {
        if (!this.dropdown) return;

        const triggerRect = this.trigger.getBoundingClientRect();
        const dropdownRect = this.dropdown.getBoundingClientRect();

        let top, left;

        const [vAlign, hAlign] = this.options.position.split('-');

        // Vertical positioning
        if (vAlign === 'bottom') {
            top = triggerRect.bottom + this.options.offset.y;
        } else {
            top = triggerRect.top - dropdownRect.height + this.options.offset.y;
        }

        // Horizontal positioning
        if (hAlign === 'left') {
            left = triggerRect.left + this.options.offset.x;
        } else {
            left = triggerRect.right - dropdownRect.width + this.options.offset.x;
        }

        // Viewport bounds checking
        const viewport = {
            top: window.scrollY,
            left: window.scrollX,
            right: window.scrollX + window.innerWidth,
            bottom: window.scrollY + window.innerHeight
        };

        // Adjust for viewport
        if (left < viewport.left) {
            left = viewport.left + 10;
        } else if (left + dropdownRect.width > viewport.right) {
            left = viewport.right - dropdownRect.width - 10;
        }

        if (top < viewport.top) {
            top = triggerRect.bottom + 10;
        } else if (top + dropdownRect.height > viewport.bottom) {
            top = triggerRect.top - dropdownRect.height - 10;
        }

        this.dropdown.style.top = `${top}px`;
        this.dropdown.style.left = `${left}px`;
    }

    destroyDropdown() {
        if (this.dropdown) {
            this.dropdown.remove();
            this.dropdown = null;
        }
    }

    focusFirstItem() {
        if (this.dropdown) {
            const firstItem = this.dropdown.querySelector('.dropdown__item:not(.dropdown__item--disabled)');
            firstItem?.focus();
        }
    }

    setItems(items) {
        this.options.items = items;
        if (this.dropdown) {
            this.renderItems();
        }
    }

    addItem(item, index = -1) {
        if (index >= 0) {
            this.options.items.splice(index, 0, item);
        } else {
            this.options.items.push(item);
        }

        if (this.dropdown) {
            this.renderItems();
        }
    }

    removeItem(index) {
        this.options.items.splice(index, 1);

        if (this.dropdown) {
            this.renderItems();
        }
    }

    destroy() {
        this.close();
        this.trigger = null;
    }

    static create(trigger, items, options = {}) {
        return new Dropdown(trigger, { items, ...options });
    }
}

// ===========================================
// ЭКСПОРТ ВСЕХ КОМПОНЕНТОВ
// ===========================================


// Статические методы для удобства
export const Components = {
    Button,
    Input,
    Select,
    Spinner,
    ProgressBar,
    Toast,
    Card,
    TabView,
    DataTable,
    Tooltip,
    Dropdown,

    // Factory methods
    createButton: (options) => new Button(options),
    createInput: (options) => new Input(options),
    createSelect: (options) => new Select(options),
    createSpinner: (options) => new Spinner(options),
    createProgressBar: (options) => new ProgressBar(options),
    createToast: (message, type, options) => new Toast({ message, type, ...options }),
    createCard: (options) => new Card(options),
    createTabView: (options) => new TabView(options),
    createDataTable: (options) => new DataTable(options),
    createTooltip: (target, content, options) => new Tooltip(target, { content, ...options }),
    createDropdown: (trigger, items, options) => new Dropdown(trigger, { items, ...options })
};

// Глобальный доступ для отладки
if (typeof window !== 'undefined') {
    window.IPRoastComponents = Components;
}
