/**
 * IP Roast Frontend - Helper Functions
 * Набор вспомогательных функций для корпоративной платформы кибербезопасности
 * Версия: Lite 1.0
 */

/**
 * ===========================
 * ПРОВЕРКА ТИПОВ ДАННЫХ
 * ===========================
 */

/**
 * Проверяет, является ли значение массивом
 */
function isArray(value) {
    return Array.isArray(value);
}

/**
 * Проверяет, является ли значение объектом (не массив и не null)
 */
function isObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Проверяет, является ли значение функцией
 */
function isFunction(value) {
    return typeof value === 'function';
}

/**
 * Проверяет, является ли значение строкой
 */
function isString(value) {
    return typeof value === 'string';
}

/**
 * Проверяет, является ли значение числом
 */
function isNumber(value) {
    return typeof value === 'number' && !isNaN(value);
}

/**
 * Проверяет, является ли значение boolean
 */
function isBoolean(value) {
    return typeof value === 'boolean';
}

/**
 * Проверяет, является ли значение null
 */
function isNull(value) {
    return value === null;
}

/**
 * Проверяет, является ли значение undefined
 */
function isUndefined(value) {
    return typeof value === 'undefined';
}

/**
 * Проверяет, является ли значение пустым (null, undefined, '', [], {})
 */
function isEmpty(value) {
    if (isNull(value) || isUndefined(value)) return true;
    if (isString(value) || isArray(value)) return value.length === 0;
    if (isObject(value)) return Object.keys(value).length === 0;
    return false;
}

/**
 * Проверяет, является ли значение валидным IP адресом
 */
function isValidIP(ip) {
    const ipv4Regex = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;

    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

/**
 * Проверяет, является ли значение валидным email
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * ===========================
 * РАБОТА С ОБЪЕКТАМИ И МАССИВАМИ
 * ===========================
 */

/**
 * Создает глубокую копию объекта
 */
function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => deepClone(item));
    if (isObject(obj)) {
        const cloned = {};
        Object.keys(obj).forEach(key => {
            cloned[key] = deepClone(obj[key]);
        });
        return cloned;
    }
    return obj;
}

/**
 * Объединяет два объекта (shallow merge)
 */
function mergeObjects(target, source) {
    return { ...target, ...source };
}

/**
 * Глубокое объединение объектов
 */
function deepMerge(target, source) {
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

/**
 * Удаляет элемент из массива
 */
function arrayRemove(arr, value) {
    return arr.filter(item => item !== value);
}

/**
 * Удаляет дубликаты из массива
 */
function arrayUnique(arr) {
    return [...new Set(arr)];
}

/**
 * Группирует элементы массива по ключу
 */
function groupBy(arr, key) {
    return arr.reduce((groups, item) => {
        const groupKey = isFunction(key) ? key(item) : item[key];
        if (!groups[groupKey]) {
            groups[groupKey] = [];
        }
        groups[groupKey].push(item);
        return groups;
    }, {});
}

/**
 * Сортирует массив объектов по ключу
 */
function sortBy(arr, key, direction = 'asc') {
    return [...arr].sort((a, b) => {
        const aVal = isFunction(key) ? key(a) : a[key];
        const bVal = isFunction(key) ? key(b) : b[key];

        if (aVal < bVal) return direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return direction === 'asc' ? 1 : -1;
        return 0;
    });
}

/**
 * Получает значение по пути в объекте (например, 'user.profile.name')
 */
function getNestedValue(obj, path, defaultValue = undefined) {
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

/**
 * Устанавливает значение по пути в объекте
 */
function setNestedValue(obj, path, value) {
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

/**
 * ===========================
 * РАБОТА СО СТРОКАМИ
 * ===========================
 */

/**
 * Капитализирует первую букву строки
 */
function capitalize(str) {
    if (!isString(str) || str.length === 0) return str;
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Преобразует строку в camelCase
 */
function toCamelCase(str) {
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
    }).replace(/\s+/g, '');
}

/**
 * Преобразует строку в kebab-case
 */
function toKebabCase(str) {
    return str
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .replace(/[\s_]+/g, '-')
        .toLowerCase();
}

/**
 * Преобразует строку в snake_case
 */
function toSnakeCase(str) {
    return str
        .replace(/([a-z])([A-Z])/g, '$1_$2')
        .replace(/[\s-]+/g, '_')
        .toLowerCase();
}

/**
 * Обрезает строку и добавляет троеточие
 */
function truncate(str, length = 100, suffix = '...') {
    if (!isString(str) || str.length <= length) return str;
    return str.substring(0, length) + suffix;
}

/**
 * Удаляет HTML теги из строки
 */
function stripHTML(str) {
    return str.replace(/<[^>]*>/g, '');
}

/**
 * Экранирует HTML специальные символы
 */
function escapeHTML(str) {
    const htmlEscapes = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;'
    };

    return str.replace(/[&<>"'\/]/g, (match) => htmlEscapes[match]);
}

/**
 * Создает slug из строки
 */
function slugify(str) {
    return str
        .toString()
        .toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
}

/**
 * ===========================
 * РАБОТА С ЧИСЛАМИ
 * ===========================
 */

/**
 * Генерирует случайное число в диапазоне
 */
function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Округляет число до указанного количества десятичных знаков
 */
function roundTo(num, decimals = 2) {
    return Number(Math.round(num + 'e' + decimals) + 'e-' + decimals);
}

/**
 * Форматирует число с разделителями тысяч
 */
function formatNumber(num, locale = 'ru-RU') {
    return new Intl.NumberFormat(locale).format(num);
}

/**
 * Форматирует размер файла в человекочитаемом виде
 */
function formatFileSize(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * ===========================
 * РАБОТА С ДАТАМИ
 * ===========================
 */

/**
 * Форматирует дату
 */
function formatDate(date, format = 'DD.MM.YYYY HH:mm:ss') {
    const d = new Date(date);

    const formats = {
        'DD': d.getDate().toString().padStart(2, '0'),
        'MM': (d.getMonth() + 1).toString().padStart(2, '0'),
        'YYYY': d.getFullYear().toString(),
        'YY': d.getFullYear().toString().slice(-2),
        'HH': d.getHours().toString().padStart(2, '0'),
        'mm': d.getMinutes().toString().padStart(2, '0'),
        'ss': d.getSeconds().toString().padStart(2, '0')
    };

    return Object.keys(formats).reduce((result, key) => {
        return result.replace(new RegExp(key, 'g'), formats[key]);
    }, format);
}

/**
 * Возвращает относительное время (например, "2 минуты назад")
 */
function timeAgo(date) {
    const now = new Date();
    const diff = now - new Date(date);
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} дн. назад`;
    if (hours > 0) return `${hours} ч. назад`;
    if (minutes > 0) return `${minutes} мин. назад`;
    return 'только что';
}

/**
 * ===========================
 * АСИНХРОННЫЕ ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
 * ===========================
 */

/**
 * Debounce функция - откладывает выполнение функции
 */
function debounce(func, wait = 300) {
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
 * Throttle функция - ограничивает частоту вызовов функции
 */
function throttle(func, limit = 300) {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Задержка выполнения
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Повторяет выполнение функции с интервалами
 */
function retry(fn, attempts = 3, delayMs = 1000) {
    return new Promise((resolve, reject) => {
        fn()
            .then(resolve)
            .catch(error => {
                if (attempts > 1) {
                    setTimeout(() => {
                        retry(fn, attempts - 1, delayMs)
                            .then(resolve)
                            .catch(reject);
                    }, delayMs);
                } else {
                    reject(error);
                }
            });
    });
}

/**
 * ===========================
 * DOM УТИЛИТЫ
 * ===========================
 */

/**
 * Shortcut для querySelector
 */
function $(selector, scope = document) {
    return scope.querySelector(selector);
}

/**
 * Shortcut для querySelectorAll
 */
function $$(selector, scope = document) {
    return Array.from(scope.querySelectorAll(selector));
}

/**
 * Добавляет класс элементу
 */
function addClass(element, className) {
    if (element) {
        element.classList.add(className);
    }
}

/**
 * Удаляет класс у элемента
 */
function removeClass(element, className) {
    if (element) {
        element.classList.remove(className);
    }
}

/**
 * Переключает класс у элемента
 */
function toggleClass(element, className) {
    if (element) {
        element.classList.toggle(className);
    }
}

/**
 * Проверяет наличие класса у элемента
 */
function hasClass(element, className) {
    return element && element.classList.contains(className);
}

/**
 * ===========================
 * КРИПТОГРАФИЧЕСКИЕ УТИЛИТЫ
 * ===========================
 */

/**
 * Генерирует случайную строку
 */
function generateRandomString(length = 16) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * Генерирует UUID v4
 */
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * Простое хеширование строки
 */
function hashString(str) {
    let hash = 0;
    if (str.length === 0) return hash;

    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Преобразование в 32-битное целое
    }

    return Math.abs(hash);
}

/**
 * ===========================
 * URL УТИЛИТЫ
 * ===========================
 */

/**
 * Парсит URL параметры
 */
function parseQueryString(queryString = window.location.search) {
    const params = new URLSearchParams(queryString);
    const result = {};

    for (const [key, value] of params) {
        result[key] = value;
    }

    return result;
}

/**
 * Строит URL из параметров
 */
function buildQueryString(params) {
    return new URLSearchParams(params).toString();
}

/**
 * ===========================
 * СЕТЕВЫЕ УТИЛИТЫ ДЛЯ КИБЕРБЕЗОПАСНОСТИ
 * ===========================
 */

/**
 * Проверяет, находится ли IP в подсети
 */
function isIPInSubnet(ip, subnet) {
    const [subnetIP, prefixLength] = subnet.split('/');
    const subnetMask = (-1 << (32 - parseInt(prefixLength))) >>> 0;

    const ipToNumber = (ip) => {
        return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0;
    };

    const ipNum = ipToNumber(ip);
    const subnetNum = ipToNumber(subnetIP);

    return (ipNum & subnetMask) === (subnetNum & subnetMask);
}

/**
 * Определяет тип IP адреса
 */
function getIPType(ip) {
    if (!isValidIP(ip)) return 'invalid';

    if (ip.includes(':')) return 'ipv6';

    const octets = ip.split('.').map(Number);
    const firstOctet = octets[0];
    const secondOctet = octets[1];

    // Частные адреса
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

/**
 * Генерирует диапазон портов
 */
function generatePortRange(start, end) {
    const ports = [];
    for (let i = start; i <= end; i++) {
        ports.push(i);
    }
    return ports;
}

/**
 * Парсит диапазон портов из строки (например, "80,443,8000-8080")
 */
function parsePortRange(portString) {
    const ports = new Set();
    const ranges = portString.split(',');

    ranges.forEach(range => {
        if (range.includes('-')) {
            const [start, end] = range.split('-').map(p => parseInt(p.trim()));
            for (let i = start; i <= end; i++) {
                ports.add(i);
            }
        } else {
            ports.add(parseInt(range.trim()));
        }
    });

    return Array.from(ports).sort((a, b) => a - b);
}

/**
 * ===========================
 * ЛОКАЛЬНОЕ ХРАНИЛИЩЕ
 * ===========================
 */

/**
 * Безопасная работа с localStorage
 */
const Storage = {
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.warn('Failed to save to localStorage:', e);
            return false;
        }
    },

    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.warn('Failed to read from localStorage:', e);
            return defaultValue;
        }
    },

    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.warn('Failed to remove from localStorage:', e);
            return false;
        }
    },

    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (e) {
            console.warn('Failed to clear localStorage:', e);
            return false;
        }
    }
};

// Экспорт функций
export {
    // Проверка типов
    isArray, isObject, isFunction, isString, isNumber, isBoolean,
    isNull, isUndefined, isEmpty, isValidIP, isValidEmail,

    // Работа с объектами и массивами
    deepClone, mergeObjects, deepMerge, arrayRemove, arrayUnique,
    groupBy, sortBy, getNestedValue, setNestedValue,

    // Работа со строками
    capitalize, toCamelCase, toKebabCase, toSnakeCase, truncate,
    stripHTML, escapeHTML, slugify,

    // Работа с числами
    randomBetween, roundTo, formatNumber, formatFileSize,

    // Работа с датами
    formatDate, timeAgo,

    // Асинхронные функции
    debounce, throttle, delay, retry,

    // DOM утилиты
    $, $$, addClass, removeClass, toggleClass, hasClass,

    // Криптографические утилиты
    generateRandomString, generateUUID, hashString,

    // URL утилиты
    parseQueryString, buildQueryString,

    // Сетевые утилиты
    isIPInSubnet, getIPType, generatePortRange, parsePortRange,

    // Локальное хранилище
    Storage
};