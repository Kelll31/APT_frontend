/**
 * IP Roast Enterprise 4.0 - Fixed Helper Functions
 * Исправленный набор вспомогательных функций
 * Версия: Enterprise 4.0 (Fixed)
 */

import { LOG_LEVELS, ERROR_MESSAGES, STORAGE_KEYS } from './constants.js';

/**
 * ===========================
 * КЛАСС СОБЫТИЙ (EventEmitter)
 * ===========================
 */

export class EventEmitter {
    constructor() {
        this.events = new Map();
    }

    on(event, listener) {
        if (!this.events.has(event)) {
            this.events.set(event, []);
        }
        this.events.get(event).push(listener);
        return () => this.off(event, listener);
    }

    off(event, listenerToRemove) {
        if (!this.events.has(event)) return;

        const listeners = this.events.get(event);
        const index = listeners.indexOf(listenerToRemove);

        if (index !== -1) {
            listeners.splice(index, 1);
        }

        if (listeners.length === 0) {
            this.events.delete(event);
        }
    }

    emit(event, ...args) {
        if (!this.events.has(event)) return false;

        const listeners = this.events.get(event).slice();
        for (const listener of listeners) {
            try {
                listener.apply(this, args);
            } catch (error) {
                console.error(`Error in event listener for "${event}":`, error);
            }
        }

        return true;
    }

    once(event, listener) {
        const onceWrapper = (...args) => {
            this.off(event, onceWrapper);
            listener.apply(this, args);
        };

        return this.on(event, onceWrapper);
    }

    removeAllListeners(event) {
        if (event) {
            this.events.delete(event);
        } else {
            this.events.clear();
        }
    }

    listenerCount(event) {
        return this.events.has(event) ? this.events.get(event).length : 0;
    }

    eventNames() {
        return Array.from(this.events.keys());
    }
}

/**
 * ===========================
 * СИСТЕМА ЛОГИРОВАНИЯ
 * ===========================
 */

class Logger {
    constructor() {
        this.level = LOG_LEVELS.INFO;
        this.prefix = '[IP Roast]';
        this.colors = {
            [LOG_LEVELS.DEBUG]: '#6B7280',
            [LOG_LEVELS.INFO]: '#3B82F6',
            [LOG_LEVELS.WARN]: '#F59E0B',
            [LOG_LEVELS.ERROR]: '#EF4444',
            [LOG_LEVELS.FATAL]: '#991B1B'
        };
    }

    setLevel(level) {
        this.level = level;
    }

    shouldLog(level) {
        const levels = Object.values(LOG_LEVELS);
        return levels.indexOf(level) >= levels.indexOf(this.level);
    }

    formatMessage(level, message, ...args) {
        const timestamp = new Date().toISOString();
        return [`${this.prefix} [${timestamp}] [${level.toUpperCase()}]`, message, ...args];
    }

    log(level, message, ...args) {
        if (!this.shouldLog(level)) return;

        const formatted = this.formatMessage(level, message, ...args);
        const color = this.colors[level];

        switch (level) {
            case LOG_LEVELS.DEBUG:
                console.debug(`%c${formatted[0]}`, `color: ${color}`, ...formatted.slice(1));
                break;
            case LOG_LEVELS.INFO:
                console.info(`%c${formatted[0]}`, `color: ${color}`, ...formatted.slice(1));
                break;
            case LOG_LEVELS.WARN:
                console.warn(`%c${formatted[0]}`, `color: ${color}`, ...formatted.slice(1));
                break;
            case LOG_LEVELS.ERROR:
            case LOG_LEVELS.FATAL:
                console.error(`%c${formatted[0]}`, `color: ${color}`, ...formatted.slice(1));
                break;
            default:
                console.log(`%c${formatted[0]}`, `color: ${color}`, ...formatted.slice(1));
        }
    }

    debug(message, ...args) {
        this.log(LOG_LEVELS.DEBUG, message, ...args);
    }

    info(message, ...args) {
        this.log(LOG_LEVELS.INFO, message, ...args);
    }

    warn(message, ...args) {
        this.log(LOG_LEVELS.WARN, message, ...args);
    }

    error(message, ...args) {
        this.log(LOG_LEVELS.ERROR, message, ...args);
    }

    fatal(message, ...args) {
        this.log(LOG_LEVELS.FATAL, message, ...args);
    }
}

export const logger = new Logger();

/**
 * ===========================
 * КЛАССЫ ОШИБОК
 * ===========================
 */

export class AppError extends Error {
    constructor(message, code = 500, type = 'GENERIC_ERROR', context = null) {
        super(message);
        this.name = 'AppError';
        this.code = code;
        this.type = type;
        this.context = context;
        this.timestamp = new Date().toISOString();

        // Maintain proper stack trace
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, AppError);
        }
    }

    toJSON() {
        return {
            name: this.name,
            message: this.message,
            code: this.code,
            type: this.type,
            context: this.context,
            timestamp: this.timestamp,
            stack: this.stack
        };
    }
}

export function createError(message, code = 500, type = 'GENERIC_ERROR', context = null) {
    return new AppError(message, code, type, context);
}

export function handleError(error, context = 'Unknown') {
    let appError;

    if (error instanceof AppError) {
        appError = error;
    } else if (error instanceof Error) {
        appError = new AppError(error.message, 500, 'RUNTIME_ERROR', context);
        appError.stack = error.stack;
    } else {
        appError = new AppError(String(error), 500, 'UNKNOWN_ERROR', context);
    }

    // Добавляем контекст если его нет
    if (!appError.context) {
        appError.context = context;
    }

    return appError;
}

/**
 * ===========================
 * ЛОКАЛЬНОЕ ХРАНИЛИЩЕ
 * ===========================
 */

export class Storage {
    static isSupported() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    static get(key, defaultValue = null) {
        if (!this.isSupported()) {
            logger.warn('LocalStorage not supported');
            return defaultValue;
        }

        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            logger.error(`Error reading from localStorage (${key}):`, error);
            return defaultValue;
        }
    }

    static set(key, value) {
        if (!this.isSupported()) {
            logger.warn('LocalStorage not supported');
            return false;
        }

        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            logger.error(`Error writing to localStorage (${key}):`, error);
            return false;
        }
    }

    static remove(key) {
        if (!this.isSupported()) {
            logger.warn('LocalStorage not supported');
            return false;
        }

        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            logger.error(`Error removing from localStorage (${key}):`, error);
            return false;
        }
    }

    static clear() {
        if (!this.isSupported()) {
            logger.warn('LocalStorage not supported');
            return false;
        }

        try {
            localStorage.clear();
            return true;
        } catch (error) {
            logger.error('Error clearing localStorage:', error);
            return false;
        }
    }

    static keys() {
        if (!this.isSupported()) {
            return [];
        }

        try {
            return Object.keys(localStorage);
        } catch (error) {
            logger.error('Error getting localStorage keys:', error);
            return [];
        }
    }

    static size() {
        return this.keys().length;
    }
}

/**
 * ===========================
 * ПРОВЕРКА ТИПОВ ДАННЫХ
 * ===========================
 */

export function isArray(value) {
    return Array.isArray(value);
}

export function isObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function isFunction(value) {
    return typeof value === 'function';
}

export function isString(value) {
    return typeof value === 'string';
}

export function isNumber(value) {
    return typeof value === 'number' && !isNaN(value);
}

export function isBoolean(value) {
    return typeof value === 'boolean';
}

export function isNull(value) {
    return value === null;
}

export function isUndefined(value) {
    return typeof value === 'undefined';
}

export function isEmpty(value) {
    if (isNull(value) || isUndefined(value)) return true;
    if (isString(value) || isArray(value)) return value.length === 0;
    if (isObject(value)) return Object.keys(value).length === 0;
    return false;
}

export function isValidIP(ip) {
    const ipv4Regex = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

export function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export function isValidURL(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

/**
 * Разбор строки портов: "80", "22,80-90,443"
 * → [22, 80, 81, …, 90, 443]
 */
export function parsePortRange(str) {
    if (!str || typeof str !== 'string') return [];
    const out = new Set();

    str.split(',').forEach(seg => {
        const s = seg.trim();
        if (!s) return;

        if (s.includes('-')) {
            const [from, to] = s.split('-').map(v => parseInt(v.trim(), 10));
            if (from >= 1 && to <= 65_535 && from <= to) {
                for (let p = from; p <= to; p++) out.add(p);
            }
        } else {
            const p = parseInt(s, 10);
            if (p >= 1 && p <= 65_535) out.add(p);
        }
    });

    return [...out].sort((a, b) => a - b);
}

/**
 * ===========================
 * РАБОТА С ОБЪЕКТАМИ И МАССИВАМИ
 * ===========================
 */

export function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => deepClone(item));
    if (obj instanceof RegExp) return new RegExp(obj);
    if (obj instanceof Map) return new Map(Array.from(obj, ([key, val]) => [key, deepClone(val)]));
    if (obj instanceof Set) return new Set(Array.from(obj, val => deepClone(val)));

    if (isObject(obj)) {
        const cloned = {};
        Object.keys(obj).forEach(key => {
            cloned[key] = deepClone(obj[key]);
        });
        return cloned;
    }

    return obj;
}

export function mergeObjects(target, source) {
    return { ...target, ...source };
}

export function deepMerge(target, source) {
    const result = deepClone(target);

    Object.keys(source).forEach(key => {
        if (isObject(source[key]) && isObject(result[key])) {
            result[key] = deepMerge(result[key], source[key]);
        } else {
            result[key] = deepClone(source[key]);
        }
    });

    return result;
}

export function arrayRemove(arr, value) {
    return arr.filter(item => item !== value);
}

export function arrayUnique(arr) {
    return [...new Set(arr)];
}

export function groupBy(arr, key) {
    return arr.reduce((groups, item) => {
        const groupKey = isFunction(key) ? key(item) : item[key];
        if (!groups[groupKey]) {
            groups[groupKey] = [];
        }
        groups[groupKey].push(item);
        return groups;
    }, {});
}

export function sortBy(arr, key, direction = 'asc') {
    return [...arr].sort((a, b) => {
        const aVal = isFunction(key) ? key(a) : a[key];
        const bVal = isFunction(key) ? key(b) : b[key];

        if (aVal < bVal) return direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return direction === 'asc' ? 1 : -1;
        return 0;
    });
}

export function getNestedValue(obj, path, defaultValue = undefined) {
    const keys = isString(path) ? path.split('.') : path;
    let current = obj;

    for (let key of keys) {
        if (current === null || current === undefined || !(key in current)) {
            return defaultValue;
        }
        current = current[key];
    }

    return current;
}

export function setNestedValue(obj, path, value) {
    const keys = isString(path) ? path.split('.') : path;
    const lastKey = keys.pop();
    let current = obj;

    for (let key of keys) {
        if (!(key in current) || !isObject(current[key])) {
            current[key] = {};
        }
        current = current[key];
    }

    current[lastKey] = value;
    return obj;
}

export function pick(obj, keys) {
    const result = {};
    keys.forEach(key => {
        if (key in obj) {
            result[key] = obj[key];
        }
    });
    return result;
}

export function omit(obj, keys) {
    const result = { ...obj };
    keys.forEach(key => {
        delete result[key];
    });
    return result;
}

/**
 * ===========================
 * РАБОТА СО СТРОКАМИ
 * ===========================
 */

export function capitalize(str) {
    if (!isString(str) || str.length === 0) return str;
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function toCamelCase(str) {
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
    }).replace(/\s+/g, '');
}

export function toKebabCase(str) {
    return str
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .replace(/[\s_]+/g, '-')
        .toLowerCase();
}

export function toSnakeCase(str) {
    return str
        .replace(/([a-z])([A-Z])/g, '$1_$2')
        .replace(/[\s-]+/g, '_')
        .toLowerCase();
}

export function truncate(str, length = 100, suffix = '...') {
    if (!isString(str) || str.length <= length) return str;
    return str.substring(0, length) + suffix;
}

export function stripHTML(str) {
    return str.replace(/<[^>]*>/g, '');
}

export function escapeHTML(str) {
    const htmlEscapes = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;'
    };
    return str.replace(/[&<>"'/]/g, (match) => htmlEscapes[match]);
}

export function unescapeHTML(str) {
    const htmlUnescapes = {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#x27;': "'",
        '&#x2F;': '/',
        '&#39;': "'"
    };
    return str.replace(/&(?:amp|lt|gt|quot|#x27|#x2F|#39);/g, (match) => htmlUnescapes[match]);
}

export function slugify(str) {
    return str
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

export function randomString(length = 16, alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') {
    let result = '';
    for (let i = 0; i < length; i++) {
        result += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    }
    return result;
}

/**
 * ===========================
 * РАБОТА С ЧИСЛАМИ
 * ===========================
 */

export function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function roundTo(num, decimals = 2) {
    return Number(Math.round(num + 'e' + decimals) + 'e-' + decimals);
}

export function formatNumber(num, locale = 'ru-RU') {
    if (!isNumber(num)) return '0';
    return new Intl.NumberFormat(locale).format(num);
}

export function formatFileSize(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function formatPercentage(value, total, decimals = 1) {
    if (total === 0) return '0%';
    const percentage = (value / total) * 100;
    return `${roundTo(percentage, decimals)}%`;
}

export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

/**
 * ===========================
 * РАБОТА С ДАТАМИ
 * ===========================
 */

export function formatDate(date, format = 'DD.MM.YYYY HH:mm:ss') {
    const d = new Date(date);

    if (isNaN(d.getTime())) {
        return 'Invalid Date';
    }

    const formats = {
        'DD': d.getDate().toString().padStart(2, '0'),
        'MM': (d.getMonth() + 1).toString().padStart(2, '0'),
        'YYYY': d.getFullYear().toString(),
        'YY': d.getFullYear().toString().slice(-2),
        'HH': d.getHours().toString().padStart(2, '0'),
        'mm': d.getMinutes().toString().padStart(2, '0'),
        'ss': d.getSeconds().toString().padStart(2, '0'),
        'sss': d.getMilliseconds().toString().padStart(3, '0')
    };

    return Object.keys(formats).reduce((result, key) => {
        return result.replace(new RegExp(key, 'g'), formats[key]);
    }, format);
}

export function timeAgo(date) {
    const now = new Date();
    const diff = now - new Date(date);

    if (isNaN(diff)) return 'Invalid Date';

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(months / 12);

    if (years > 0) return `${years} г. назад`;
    if (months > 0) return `${months} мес. назад`;
    if (days > 0) return `${days} дн. назад`;
    if (hours > 0) return `${hours} ч. назад`;
    if (minutes > 0) return `${minutes} мин. назад`;
    return 'только что';
}

export function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

export function addHours(date, hours) {
    const result = new Date(date);
    result.setHours(result.getHours() + hours);
    return result;
}

export function isToday(date) {
    const today = new Date();
    const checkDate = new Date(date);

    return today.getDate() === checkDate.getDate() &&
        today.getMonth() === checkDate.getMonth() &&
        today.getFullYear() === checkDate.getFullYear();
}

export function isYesterday(date) {
    const yesterday = addDays(new Date(), -1);
    const checkDate = new Date(date);

    return yesterday.getDate() === checkDate.getDate() &&
        yesterday.getMonth() === checkDate.getMonth() &&
        yesterday.getFullYear() === checkDate.getFullYear();
}

/**
 * ===========================
 * АСИНХРОННЫЕ ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
 * ===========================
 */

export function debounce(func, wait = 300) {
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

export function throttle(func, limit = 300) {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

export function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function retry(fn, attempts = 3, delayMs = 1000) {
    return new Promise((resolve, reject) => {
        fn()
            .then(resolve)
            .catch(error => {
                if (attempts > 1) {
                    setTimeout(() => {
                        retry(fn, attempts - 1, delayMs * 1.5)
                            .then(resolve)
                            .catch(reject);
                    }, delayMs);
                } else {
                    reject(error);
                }
            });
    });
}

export function timeout(promise, ms) {
    return Promise.race([
        promise,
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Operation timed out')), ms)
        )
    ]);
}

/**
 * ===========================
 * DOM УТИЛИТЫ
 * ===========================
 */

export function $(selector, scope = document) {
    return scope.querySelector(selector);
}

export function $$(selector, scope = document) {
    return Array.from(scope.querySelectorAll(selector));
}

export function addClass(element, className) {
    if (element && className) {
        if (isString(className)) {
            element.classList.add(className);
        } else if (isArray(className)) {
            element.classList.add(...className);
        }
    }
}

export function removeClass(element, className) {
    if (element && className) {
        if (isString(className)) {
            element.classList.remove(className);
        } else if (isArray(className)) {
            element.classList.remove(...className);
        }
    }
}

export function toggleClass(element, className) {
    if (element && className) {
        element.classList.toggle(className);
    }
}

export function hasClass(element, className) {
    return element && element.classList.contains(className);
}

export function createElement(tag, attributes = {}, children = []) {
    const element = document.createElement(tag);

    // Установка атрибутов
    Object.entries(attributes).forEach(([key, value]) => {
        if (key === 'className') {
            element.className = value;
        } else if (key === 'innerHTML') {
            element.innerHTML = value;
        } else if (key === 'textContent') {
            element.textContent = value;
        } else if (key.startsWith('on') && isFunction(value)) {
            element.addEventListener(key.slice(2).toLowerCase(), value);
        } else {
            element.setAttribute(key, value);
        }
    });

    // Добавление дочерних элементов
    children.forEach(child => {
        if (isString(child)) {
            element.appendChild(document.createTextNode(child));
        } else if (child instanceof Element) {
            element.appendChild(child);
        }
    });

    return element;
}

export function getElementOffset(element) {
    const rect = element.getBoundingClientRect();
    return {
        top: rect.top + window.pageYOffset,
        left: rect.left + window.pageXOffset,
        width: rect.width,
        height: rect.height
    };
}

export function isElementInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

/**
 * ===========================
 * КРИПТОГРАФИЧЕСКИЕ УТИЛИТЫ
 * ===========================
 */

export function generateUUID() {
    if (crypto && crypto.randomUUID) {
        return crypto.randomUUID();
    }

    // Fallback implementation
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export function hashString(str) {
    let hash = 0;
    if (str.length === 0) return hash;

    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }

    return Math.abs(hash);
}

export async function sha256(message) {
    if (!crypto || !crypto.subtle) {
        throw new Error('WebCrypto API not available');
    }

    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return hashHex;
}

/**
 * ===========================
 * URL УТИЛИТЫ
 * ===========================
 */

export function parseQueryString(queryString = window.location.search) {
    const params = new URLSearchParams(queryString);
    const result = {};

    for (const [key, value] of params) {
        result[key] = value;
    }

    return result;
}

export function buildQueryString(params) {
    const filtered = Object.entries(params).filter(([_, value]) =>
        value !== null && value !== undefined && value !== ''
    );
    return new URLSearchParams(filtered).toString();
}

export function updateQueryString(params, replace = false) {
    const url = new URL(window.location);

    Object.entries(params).forEach(([key, value]) => {
        if (value === null || value === undefined) {
            url.searchParams.delete(key);
        } else {
            url.searchParams.set(key, value);
        }
    });

    const method = replace ? 'replaceState' : 'pushState';
    window.history[method]({}, '', url);
}

/**
 * ===========================
 * СЕТЕВЫЕ УТИЛИТЫ ДЛЯ КИБЕРБЕЗОПАСНОСТИ
 * ===========================
 */

export function isIPInSubnet(ip, subnet) {
    const [subnetIP, prefixLength] = subnet.split('/');
    const subnetMask = (-1 << (32 - parseInt(prefixLength))) >>> 0;

    const ipToNumber = (ip) => {
        return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0;
    };

    const ipNum = ipToNumber(ip);
    const subnetNum = ipToNumber(subnetIP);

    return (ipNum & subnetMask) === (subnetNum & subnetMask);
}

export function getIPType(ip) {
    if (!isValidIP(ip)) return 'invalid';
    if (ip.includes(':')) return 'ipv6';

    const octets = ip.split('.').map(Number);
    const firstOctet = octets[0];
    const secondOctet = octets[1];

    // Private addresses
    if (firstOctet === 10) return 'private';
    if (firstOctet === 172 && secondOctet >= 16 && secondOctet <= 31) return 'private';
    if (firstOctet === 192 && secondOctet === 168) return 'private';

    // Loopback
    if (firstOctet === 127) return 'loopback';

    // Link-local
    if (firstOctet === 169 && secondOctet === 254) return 'link-local';

    // Multicast
    if (firstOctet >= 224 && firstOctet <= 239) return 'multicast';

    return 'public';
}

export function expandIPv6(ip) {
    // Expand IPv6 address to full form
    let expanded = ip;

    // Handle double colon
    if (expanded.includes('::')) {
        const parts = expanded.split('::');
        const leftParts = parts[0] ? parts[0].split(':') : [];
        const rightParts = parts[1] ? parts[1].split(':') : [];
        const missingZeros = 8 - leftParts.length - rightParts.length;

        expanded = [
            ...leftParts,
            ...Array(missingZeros).fill('0000'),
            ...rightParts
        ].join(':');
    }

    // Pad each part to 4 digits
    return expanded.split(':').map(part => part.padStart(4, '0')).join(':');
}

export function isPrivateIP(ip) {
    return getIPType(ip) === 'private';
}

export function isPublicIP(ip) {
    return getIPType(ip) === 'public';
}

/**
 * ===========================
 * УТИЛИТЫ ВАЛИДАЦИИ
 * ===========================
 */

export function validateRequired(value, fieldName = 'Field') {
    if (isEmpty(value)) {
        return { valid: false, message: `${fieldName} is required` };
    }
    return { valid: true };
}

export function validateEmail(email) {
    if (!isValidEmail(email)) {
        return { valid: false, message: 'Invalid email format' };
    }
    return { valid: true };
}

export function validateIP(ip) {
    if (!isValidIP(ip)) {
        return { valid: false, message: 'Invalid IP address' };
    }
    return { valid: true };
}

export function validatePort(port) {
    const portNum = parseInt(port);
    if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
        return { valid: false, message: 'Port must be between 1 and 65535' };
    }
    return { valid: true };
}

export function validateURL(url) {
    if (!isValidURL(url)) {
        return { valid: false, message: 'Invalid URL format' };
    }
    return { valid: true };
}

/**
 * ===========================
 * УТИЛИТЫ ФОРМАТИРОВАНИЯ
 * ===========================
 */

export function formatDuration(ms) {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    if (ms < 3600000) return `${(ms / 60000).toFixed(1)}m`;
    return `${(ms / 3600000).toFixed(1)}h`;
}

export function formatBytes(bytes, decimals = 2) {
    return formatFileSize(bytes, decimals);
}

export function formatSpeed(bytesPerSecond) {
    const units = ['B/s', 'KB/s', 'MB/s', 'GB/s'];
    let unitIndex = 0;
    let speed = bytesPerSecond;

    while (speed >= 1024 && unitIndex < units.length - 1) {
        speed /= 1024;
        unitIndex++;
    }

    return `${speed.toFixed(2)} ${units[unitIndex]}`;
}

/**
 * ===========================
 * УТИЛИТЫ БЕЗОПАСНОСТИ
 * ===========================
 */

export function sanitizeInput(input) {
    if (!isString(input)) return input;

    return input
        .replace(/[<>]/g, '') // Remove potential HTML tags
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+=/gi, '') // Remove event handlers
        .trim();
}

export function generateSecureToken(length = 32) {
    if (crypto && crypto.getRandomValues) {
        const array = new Uint8Array(length);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    // Fallback for environments without crypto
    return randomString(length, 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789');
}

/**
 * ===========================
 * УТИЛИТЫ ПРОИЗВОДИТЕЛЬНОСТИ
 * ===========================
 */

export function memoize(fn, keyGenerator) {
    const cache = new Map();

    return function (...args) {
        const key = keyGenerator ? keyGenerator(args) : JSON.stringify(args);

        if (cache.has(key)) {
            return cache.get(key);
        }

        const result = fn.apply(this, args);
        cache.set(key, result);

        return result;
    };
}

export function measureTime(fn, context = 'Operation') {
    return async function (...args) {
        const start = performance.now();

        try {
            const result = await fn.apply(this, args);
            const duration = performance.now() - start;
            logger.debug(`${context} took ${formatDuration(duration)}`);
            return result;
        } catch (error) {
            const duration = performance.now() - start;
            logger.debug(`${context} failed after ${formatDuration(duration)}`);
            throw error;
        }
    };
}

/**
 * ===========================
 * ЭКСПОРТ ВСЕХ УТИЛИТ
 * ===========================
 */

export default {
    // Classes
    EventEmitter,
    Logger,
    AppError,
    Storage,

    // Functions
    logger,
    createError,
    handleError,

    // Type checking
    isArray,
    isObject,
    isFunction,
    isString,
    isNumber,
    isBoolean,
    isNull,
    isUndefined,
    isEmpty,
    isValidIP,
    isValidEmail,
    isValidURL,

    // Object/Array utilities
    deepClone,
    mergeObjects,
    deepMerge,
    arrayRemove,
    arrayUnique,
    groupBy,
    sortBy,
    getNestedValue,
    setNestedValue,
    pick,
    omit,

    // String utilities
    capitalize,
    toCamelCase,
    toKebabCase,
    toSnakeCase,
    truncate,
    stripHTML,
    escapeHTML,
    unescapeHTML,
    slugify,
    randomString,

    // Number utilities
    randomBetween,
    roundTo,
    formatNumber,
    formatFileSize,
    formatPercentage,
    clamp,

    // Date utilities
    formatDate,
    timeAgo,
    addDays,
    addHours,
    isToday,
    isYesterday,

    // Async utilities
    debounce,
    throttle,
    delay,
    retry,
    timeout,

    // DOM utilities
    $,
    $$,
    addClass,
    removeClass,
    toggleClass,
    hasClass,
    createElement,
    getElementOffset,
    isElementInViewport,

    // Crypto utilities
    generateUUID,
    hashString,
    sha256,

    // URL utilities
    parseQueryString,
    buildQueryString,
    updateQueryString,

    // Network utilities
    isIPInSubnet,
    getIPType,
    expandIPv6,
    isPrivateIP,
    isPublicIP,

    // Validation utilities
    validateRequired,
    validateEmail,
    validateIP,
    validatePort,
    validateURL,

    // Formatting utilities
    formatDuration,
    formatBytes,
    formatSpeed,

    // Security utilities
    sanitizeInput,
    generateSecureToken,

    // Performance utilities
    memoize,
    measureTime
};