/**
 * IP Roast Enterprise - Validators Utility v4.0.0
 * Комплексная система валидации для корпоративной платформы сетевой безопасности
 * Построен на TypeScript с использованием Zod и validator.js
 */

import { z } from 'zod';
import validator from 'validator';

// =============================================================================
// ТИПЫ И ИНТЕРФЕЙСЫ
// =============================================================================

export interface ValidationResult<T = unknown> {
    isValid: boolean;
    value?: T | undefined;
    error?: string | undefined;
    warnings?: string[] | undefined;
    metadata?: Record<string, unknown> | undefined;
}


export interface ValidationOptions {
    strict?: boolean;
    allowPrivate?: boolean;
    allowLocalhost?: boolean;
    maxLength?: number;
    minLength?: number;
    customMessage?: string;
}

export type ValidatorFunction<T = string> = (
    value: unknown,
    options?: ValidationOptions
) => ValidationResult<T>;

// =============================================================================
// ZOD СХЕМЫ ДЛЯ ОСНОВНЫХ ТИПОВ
// =============================================================================

// IPv4 адрес
export const IPv4Schema = z.string().refine(
    (value) => {
        if (!value || typeof value !== 'string') return false;
        const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        return ipv4Regex.test(value.trim());
    },
    { message: 'Недопустимый формат IPv4 адреса' }
);

// IPv6 адрес
export const IPv6Schema = z.string().refine(
    (value) => {
        if (!value || typeof value !== 'string') return false;
        return validator.isIP(value.trim(), 6);
    },
    { message: 'Недопустимый формат IPv6 адреса' }
);

// IP адрес (IPv4 или IPv6)
export const IPSchema = z.string().refine(
    (value) => {
        if (!value || typeof value !== 'string') return false;
        return validator.isIP(value.trim());
    },
    { message: 'Недопустимый IP адрес' }
);

// CIDR нотация
export const CIDRSchema = z.string().refine(
    (value) => {
        if (!value || typeof value !== 'string') return false;
        const cidrRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\/(?:[0-9]|[1-2][0-9]|3[0-2])$/;
        return cidrRegex.test(value.trim());
    },
    { message: 'Недопустимый формат CIDR' }
);

// MAC адрес
export const MACSchema = z.string().refine(
    (value) => {
        if (!value || typeof value !== 'string') return false;
        return validator.isMACAddress(value.trim());
    },
    { message: 'Недопустимый MAC адрес' }
);

// Домен
export const DomainSchema = z.string().refine(
    (value) => {
        if (!value || typeof value !== 'string') return false;
        return validator.isFQDN(value.trim(), {
            require_tld: true,
            allow_underscores: false,
            allow_trailing_dot: false
        });
    },
    { message: 'Недопустимый домен' }
);

// Порт
export const PortSchema = z.number().int().min(1).max(65535);

// Диапазон портов
export const PortRangeSchema = z.string().refine(
    (value) => {
        if (!value || typeof value !== 'string') return false;
        const portRangeRegex = /^(\d+(-\d+)?)(,\d+(-\d+)?)*$/;
        if (!portRangeRegex.test(value.trim())) return false;

        const parts = value.trim().split(',');
        return parts.every(part => {
            if (part.includes('-')) {
                const rangeParts = part.split('-');
                if (rangeParts.length !== 2) return false;
                const start = Number(rangeParts[0]);
                const end = Number(rangeParts[1]);
                if (isNaN(start) || isNaN(end)) return false;
                return start >= 1 && end <= 65535 && start <= end;
            } else {
                const port = Number(part);
                return port >= 1 && port <= 65535;
            }
        });
    },
    { message: 'Недопустимый диапазон портов' }
);

// Email
export const EmailSchema = z.string().email('Недопустимый email адрес');

// URL
export const URLSchema = z.string().url('Недопустимый URL');

// UUID
export const UUIDSchema = z.string().uuid('Недопустимый UUID');

// =============================================================================
// ВАЛИДАТОРЫ IP АДРЕСОВ
// =============================================================================

/**
 * Валидация IPv4 адреса
 */
export const validateIPv4: ValidatorFunction<string> = (value, options = {}) => {
    try {
        if (!value || typeof value !== 'string') {
            return { isValid: false, error: 'Значение должно быть строкой' };
        }

        const trimmedValue = value.trim();
        const result = IPv4Schema.safeParse(trimmedValue);

        if (!result.success) {
            return {
                isValid: false,
                error: result.error.errors[0]?.message || 'Недопустимый IPv4 адрес'
            };
        }

        const warnings: string[] = [];

        // Проверка приватных адресов
        if (!options.allowPrivate && isPrivateIP(trimmedValue)) {
            warnings.push('Приватный IP адрес');
        }

        // Проверка localhost
        if (!options.allowLocalhost && isLocalhostIP(trimmedValue)) {
            warnings.push('Localhost адрес');
        }

        return {
            isValid: true,
            value: trimmedValue,
            warnings: warnings.length > 0 ? warnings : undefined,
            metadata: {
                type: 'ipv4',
                isPrivate: isPrivateIP(trimmedValue),
                isLocalhost: isLocalhostIP(trimmedValue)
            }
        };
    } catch (error) {
        return {
            isValid: false,
            error: error instanceof Error ? error.message : 'Ошибка валидации IPv4'
        };
    }
};

/**
 * Валидация IPv6 адреса
 */
export const validateIPv6: ValidatorFunction<string> = (value) => {
    try {
        if (!value || typeof value !== 'string') {
            return { isValid: false, error: 'Значение должно быть строкой' };
        }

        const trimmedValue = value.trim();
        const result = IPv6Schema.safeParse(trimmedValue);

        if (!result.success) {
            return {
                isValid: false,
                error: result.error.errors[0]?.message || 'Недопустимый IPv6 адрес'
            };
        }

        return {
            isValid: true,
            value: trimmedValue,
            metadata: {
                type: 'ipv6',
                isCompressed: trimmedValue.includes('::')
            }
        };
    } catch (error) {
        return {
            isValid: false,
            error: error instanceof Error ? error.message : 'Ошибка валидации IPv6'
        };
    }
};

/**
 * Универсальная валидация IP адреса (IPv4 или IPv6)
 */
export const validateIP: ValidatorFunction<string> = (value, options = {}) => {
    const ipv4Result = validateIPv4(value, options);
    if (ipv4Result.isValid) {
        return ipv4Result;
    }

    const ipv6Result = validateIPv6(value, options);
    return ipv6Result;
};

// =============================================================================
// ВАЛИДАТОРЫ СЕТЕВЫХ ДИАПАЗОНОВ
// =============================================================================

/**
 * Валидация CIDR нотации
 */
export const validateCIDR: ValidatorFunction<string> = (value) => {
    try {
        if (!value || typeof value !== 'string') {
            return { isValid: false, error: 'Значение должно быть строкой' };
        }

        const trimmedValue = value.trim();
        const result = CIDRSchema.safeParse(trimmedValue);

        if (!result.success) {
            return {
                isValid: false,
                error: result.error.errors[0]?.message || 'Недопустимый CIDR'
            };
        }

        const cidrParts = trimmedValue.split('/');
        if (cidrParts.length !== 2) {
            return {
                isValid: false,
                error: 'Недопустимый формат CIDR',
                value: undefined,
                warnings: undefined,
                metadata: undefined
            };
        }
        const ip = cidrParts[0]!;
        const prefix = cidrParts[1]!;
        const prefixNum = parseInt(prefix, 10);

        return {
            isValid: true,
            value: trimmedValue,
            metadata: {
                ip,
                prefix: prefixNum,
                hostBits: 32 - prefixNum,
                maxHosts: Math.pow(2, 32 - prefixNum) - 2,
                isPrivate: isPrivateIP(ip),
                networkClass: getNetworkClass(ip)
            }
        };
    } catch (error) {
        return {
            isValid: false,
            error: error instanceof Error ? error.message : 'Ошибка валидации CIDR'
        };
    }
};

/**
 * Валидация диапазона IP адресов
 */
export const validateIPRange: ValidatorFunction<string> = (value, options = {}) => {
    try {
        if (!value || typeof value !== 'string') {
            return { isValid: false, error: 'Значение должно быть строкой' };
        }

        const trimmedValue = value.trim();

        // Поддержка различных форматов
        if (trimmedValue.includes('/')) {
            return validateCIDR(trimmedValue, options);
        }

        if (trimmedValue.includes('-')) {
            const [startIP, endIP] = trimmedValue.split('-').map(ip => ip.trim());

            const startResult = validateIPv4(startIP, options);
            const endResult = validateIPv4(endIP, options);

            if (!startResult.isValid) {
                return { isValid: false, error: `Начальный IP недопустим: ${startResult.error}` };
            }

            if (!endResult.isValid) {
                return { isValid: false, error: `Конечный IP недопустим: ${endResult.error}` };
            }

            return {
                isValid: true,
                value: trimmedValue,
                metadata: {
                    type: 'range',
                    startIP: startResult.value,
                    endIP: endResult.value,
                    count: calculateIPRangeCount(startResult.value!, endResult.value!)
                }
            };
        }

        // Одиночный IP
        return validateIP(trimmedValue, options);
    } catch (error) {
        return {
            isValid: false,
            error: error instanceof Error ? error.message : 'Ошибка валидации диапазона IP'
        };
    }
};

// =============================================================================
// ВАЛИДАТОРЫ ПОРТОВ
// =============================================================================

/**
 * Валидация порта
 */
export const validatePort: ValidatorFunction<number> = (value) => {
    try {
        const numValue = typeof value === 'string' ? parseInt(value, 10) : Number(value);

        if (isNaN(numValue)) {
            return { isValid: false, error: 'Порт должен быть числом' };
        }

        const result = PortSchema.safeParse(numValue);

        if (!result.success) {
            return {
                isValid: false,
                error: 'Порт должен быть от 1 до 65535'
            };
        }

        const warnings: string[] = [];

        if (numValue <= 1024) {
            warnings.push('Системный порт (требуются права администратора)');
        }

        return {
            isValid: true,
            value: numValue,
            warnings: warnings.length > 0 ? warnings : undefined,
            metadata: {
                isSystemPort: numValue <= 1024,
                isRegisteredPort: numValue >= 1024 && numValue <= 49151,
                isDynamicPort: numValue >= 49152,
                wellKnownService: getWellKnownService(numValue)
            }
        };
    } catch (error) {
        return {
            isValid: false,
            error: error instanceof Error ? error.message : 'Ошибка валидации порта'
        };
    }
};

/**
 * Валидация диапазона портов
 */
const validatePortRange = (portRange: string): ValidationResult<string> => {
    try {
        if (!portRange || typeof portRange !== 'string') {
            return {
                isValid: false,
                error: 'Значение должно быть строкой',
                value: undefined,
                warnings: undefined,
                metadata: undefined
            };
        }

        const trimmedValue = portRange.trim();
        const result = PortRangeSchema.safeParse(trimmedValue);

        if (!result.success) {
            return {
                isValid: false,
                error: result.error.errors[0]?.message || 'Недопустимый диапазон портов',
                value: undefined,
                warnings: undefined,
                metadata: undefined
            };
        }

        const portCount = calculatePortCount(trimmedValue);
        const warnings: string[] = [];

        if (portCount > 10000) {
            warnings.push('Большое количество портов может замедлить сканирование');
        }

        return {
            isValid: true,
            value: trimmedValue,
            error: undefined,
            warnings: warnings.length > 0 ? warnings : undefined,
            metadata: {
                portCount,
                hasSystemPorts: hasSystemPorts(trimmedValue),
                examples: getPortExamples(trimmedValue, 5)
            }
        };
    } catch (error) {
        return {
            isValid: false,
            error: error instanceof Error ? error.message : 'Ошибка валидации диапазона портов',
            value: undefined,
            warnings: undefined,
            metadata: undefined
        };
    }
};

// =============================================================================
// ВАЛИДАТОРЫ ДОМЕНОВ И ХОСТОВ
// =============================================================================

/**
 * Валидация домена
 */
export const validateDomain: ValidatorFunction<string> = (value, options = {}) => {
    try {
        if (!value || typeof value !== 'string') {
            return { isValid: false, error: 'Значение должно быть строкой' };
        }

        const trimmedValue = value.trim().toLowerCase();

        // Проверяем максимальную длину
        if (options.maxLength && trimmedValue.length > options.maxLength) {
            return {
                isValid: false,
                error: `Домен слишком длинный (максимум ${options.maxLength} символов)`
            };
        }

        const result = DomainSchema.safeParse(trimmedValue);

        if (!result.success) {
            return {
                isValid: false,
                error: result.error.errors[0]?.message || 'Недопустимый домен'
            };
        }

        const warnings: string[] = [];

        // Проверка на localhost
        if (!options.allowLocalhost && isLocalhostDomain(trimmedValue)) {
            warnings.push('Localhost домен');
        }

        return {
            isValid: true,
            value: trimmedValue,
            warnings: warnings.length > 0 ? warnings : undefined,
            metadata: {
                tld: getTLD(trimmedValue),
                subdomains: getSubdomainCount(trimmedValue),
                isLocalhost: isLocalhostDomain(trimmedValue),
                hasWildcard: trimmedValue.includes('*')
            }
        };
    } catch (error) {
        return {
            isValid: false,
            error: error instanceof Error ? error.message : 'Ошибка валидации домена'
        };
    }
};

/**
 * Валидация хоста (IP или домен)
 */
export const validateHost: ValidatorFunction<string> = (value, options = {}) => {
    // Сначала пробуем IP
    const ipResult = validateIP(value, options);
    if (ipResult.isValid) {
        return {
            ...ipResult,
            metadata: {
                ...ipResult.metadata,
                hostType: 'ip'
            }
        };
    }

    // Затем пробуем домен
    const domainResult = validateDomain(value, options);
    if (domainResult.isValid) {
        return {
            ...domainResult,
            metadata: {
                ...domainResult.metadata,
                hostType: 'domain'
            }
        };
    }

    return {
        isValid: false,
        error: 'Значение должно быть допустимым IP адресом или доменом'
    };
};

// =============================================================================
// ВАЛИДАТОРЫ MAC АДРЕСОВ
// =============================================================================

/**
 * Валидация MAC адреса
 */
export const validateMAC: ValidatorFunction<string> = (value) => {
    try {
        if (!value || typeof value !== 'string') {
            return { isValid: false, error: 'Значение должно быть строкой' };
        }

        const trimmedValue = value.trim();
        const result = MACSchema.safeParse(trimmedValue);

        if (!result.success) {
            return {
                isValid: false,
                error: result.error.errors[0]?.message || 'Недопустимый MAC адрес'
            };
        }

        const normalizedMAC = normalizeMACAddress(trimmedValue);

        return {
            isValid: true,
            value: normalizedMAC,
            metadata: {
                original: trimmedValue,
                normalized: normalizedMAC,
                vendor: getMACVendor(normalizedMAC),
                isLocal: isLocalMAC(normalizedMAC),
                isMulticast: isMulticastMAC(normalizedMAC)
            }
        };
    } catch (error) {
        return {
            isValid: false,
            error: error instanceof Error ? error.message : 'Ошибка валидации MAC адреса'
        };
    }
};

// =============================================================================
// ВАЛИДАТОРЫ URL И EMAIL
// =============================================================================

/**
 * Валидация URL
 */
export const validateURL: ValidatorFunction<string> = (value, options = {}) => {
    try {
        if (!value || typeof value !== 'string') {
            return { isValid: false, error: 'Значение должно быть строкой' };
        }

        const trimmedValue = value.trim();
        const result = URLSchema.safeParse(trimmedValue);

        if (!result.success) {
            return {
                isValid: false,
                error: result.error.errors[0]?.message || 'Недопустимый URL'
            };
        }

        const url = new URL(trimmedValue);
        const warnings: string[] = [];

        if (url.protocol === 'http:' && !options.allowLocalhost) {
            warnings.push('Небезопасный HTTP протокол');
        }

        return {
            isValid: true,
            value: trimmedValue,
            warnings: warnings.length > 0 ? warnings : undefined,
            metadata: {
                protocol: url.protocol,
                hostname: url.hostname,
                port: url.port || getDefaultPort(url.protocol),
                pathname: url.pathname,
                isSecure: url.protocol === 'https:',
                hasQuery: !!url.search,
                hasFragment: !!url.hash
            }
        };
    } catch (error) {
        return {
            isValid: false,
            error: error instanceof Error ? error.message : 'Ошибка валидации URL'
        };
    }
};

/**
 * Валидация Email
 */
export const validateEmail: ValidatorFunction<string> = (value) => {
    try {
        if (!value || typeof value !== 'string') {
            return { isValid: false, error: 'Значение должно быть строкой' };
        }

        const trimmedValue = value.trim().toLowerCase();
        const emailParts = trimmedValue.split('@');
        if (emailParts.length !== 2) {
            return {
                isValid: false,
                error: 'Недопустимый формат email',
                value: undefined,
                warnings: undefined,
                metadata: undefined
            };
        }
        const localPart = emailParts[0]!;
        const domain = emailParts[1]!;

        return {
            isValid: true,
            value: trimmedValue,
            metadata: {
                localPart,
                domain,
                isDisposable: isDisposableEmail(domain),
                hasPlus: localPart.includes('+')
            }
        };
    } catch (error) {
        return {
            isValid: false,
            error: error instanceof Error ? error.message : 'Ошибка валидации email'
        };
    }
};

// =============================================================================
// ВАЛИДАТОРЫ ФАЙЛОВ И ПУТЕЙ
// =============================================================================

/**
 * Валидация пути к файлу
 */
export const validateFilePath: ValidatorFunction<string> = (value) => {
    try {
        if (!value || typeof value !== 'string') {
            return { isValid: false, error: 'Значение должно быть строкой' };
        }

        const trimmedValue = value.trim();

        // Проверка на опасные символы
        const dangerousChars = /[<>:"|*?]/;
        if (dangerousChars.test(trimmedValue)) {
            return { isValid: false, error: 'Путь содержит недопустимые символы' };
        }

        // Проверка на path traversal
        if (trimmedValue.includes('../') || trimmedValue.includes('..\\')) {
            return { isValid: false, error: 'Обнаружена попытка обхода каталогов' };
        }

        const warnings: string[] = [];

        if (trimmedValue.startsWith('/')) {
            warnings.push('Абсолютный путь');
        }

        return {
            isValid: true,
            value: trimmedValue,
            warnings: warnings.length > 0 ? warnings : undefined,
            metadata: {
                isAbsolute: trimmedValue.startsWith('/') || /^[A-Za-z]:/.test(trimmedValue),
                extension: getFileExtension(trimmedValue),
                depth: (trimmedValue.match(/[\/\\]/g) || []).length
            }
        };
    } catch (error) {
        return {
            isValid: false,
            error: error instanceof Error ? error.message : 'Ошибка валидации пути'
        };
    }
};

// =============================================================================
// ВАЛИДАТОРЫ ДЛЯ СКАНИРОВАНИЯ
// =============================================================================

/**
 * Валидация цели сканирования (множественные хосты)
 */
export const validateScanTarget: ValidatorFunction<string[]> = (value, options = {}) => {
    try {
        if (!value || typeof value !== 'string') {
            return { isValid: false, error: 'Значение должно быть строкой' };
        }

        const targets = value.trim().split(/[,\s\n]+/).filter(t => t.trim());

        if (targets.length === 0) {
            return { isValid: false, error: 'Укажите хотя бы одну цель' };
        }

        const validTargets: string[] = [];
        const invalidTargets: string[] = [];
        const warnings: string[] = [];

        for (const target of targets) {
            const trimmed = target.trim();
            if (!trimmed) continue;

            const hostResult = validateHost(trimmed, options);
            const rangeResult = validateIPRange(trimmed, options);

            if (hostResult.isValid || rangeResult.isValid) {
                validTargets.push(trimmed);

                // Собираем предупреждения
                const result = hostResult.isValid ? hostResult : rangeResult;
                if (result.warnings) {
                    warnings.push(...result.warnings.map(w => `${trimmed}: ${w}`));
                }
            } else {
                invalidTargets.push(trimmed);
            }
        }

        if (invalidTargets.length > 0) {
            return {
                isValid: false,
                error: `Недопустимые цели: ${invalidTargets.join(', ')}`
            };
        }

        return {
            isValid: true,
            value: validTargets,
            warnings: warnings.length > 0 ? warnings : undefined,
            metadata: {
                totalTargets: validTargets.length,
                estimatedHosts: estimateHostCount(validTargets)
            }
        };
    } catch (error) {
        return {
            isValid: false,
            error: error instanceof Error ? error.message : 'Ошибка валидации целей сканирования'
        };
    }
};

/**
 * Валидация nmap опций
 */
export const validateNmapOptions: ValidatorFunction<string> = (value) => {
    try {
        if (!value || typeof value !== 'string') {
            return {
                isValid: true,
                value: '',
                error: undefined,
                warnings: undefined,
                metadata: undefined
            };
        }

        const trimmedValue = value.trim();

        // Базовая проверка на опасные команды
        const dangerousPatterns = [
            /--script.*\s*(shell|exec|command)/i,
            /;\s*(rm|del|format|shutdown)/i,
            /\|\s*(curl|wget|nc|netcat)/i
        ];

        for (const pattern of dangerousPatterns) {
            if (pattern.test(trimmedValue)) {
                return {
                    isValid: false,
                    error: 'Обнаружена потенциально опасная команда',
                    value: undefined,
                    warnings: undefined,
                    metadata: undefined
                };
            }
        }

        const warnings: string[] = [];

        if (trimmedValue.includes('--script')) {
            warnings.push('Использование NSE скриптов может увеличить время сканирования');
        }

        if (trimmedValue.includes('-A')) {
            warnings.push('Агрессивное сканирование может быть обнаружено');
        }

        return {
            isValid: true,
            value: trimmedValue,
            error: undefined,
            warnings: warnings.length > 0 ? warnings : undefined,
            metadata: {
                hasScripts: trimmedValue.includes('--script'),
                isAggressive: trimmedValue.includes('-A'),
                hasTiming: /(-T[0-5])/.test(trimmedValue)
            }
        };
    } catch (error) {
        return {
            isValid: false,
            error: error instanceof Error ? error.message : 'Ошибка валидации nmap опций',
            value: undefined,
            warnings: undefined,
            metadata: undefined
        };
    }
};

// =============================================================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// =============================================================================

/**
 * Проверка приватного IP адреса
 */
const isPrivateIP = (ip: string): boolean => {
    const privateRanges = [
        /^10\./,
        /^172\.(1[6-9]|2[0-9]|3[01])\./,
        /^192\.168\./,
        /^127\./,
        /^169\.254\./,
        /^::1$/,
        /^fc00:/,
        /^fe80:/
    ];

    return privateRanges.some(range => range.test(ip));
};

/**
 * Проверка localhost IP
 */
const isLocalhostIP = (ip: string): boolean => {
    return ip === '127.0.0.1' || ip === '::1' || ip.startsWith('127.');
};

/**
 * Проверка localhost домена
 */
const isLocalhostDomain = (domain: string): boolean => {
    const localhostDomains = ['localhost', 'localhost.localdomain'];
    return localhostDomains.includes(domain.toLowerCase());
};

/**
 * Получение сетевого класса IP
 */
const getNetworkClass = (ip: string): string => {
    const ipParts = ip.split('.');
    if (ipParts.length === 0) return 'Unknown';
    const firstOctet = parseInt(ipParts[0] || '0', 10);
    if (firstOctet >= 1 && firstOctet <= 126) return 'A';
    if (firstOctet >= 128 && firstOctet <= 191) return 'B';
    if (firstOctet >= 192 && firstOctet <= 223) return 'C';
    if (firstOctet >= 224 && firstOctet <= 239) return 'D';
    if (firstOctet >= 240 && firstOctet <= 255) return 'E';

    return 'Unknown';
};

/**
 * Подсчет IP адресов в диапазоне
 */
const calculateIPRangeCount = (startIP: string, endIP: string): number => {
    const start = ipToNumber(startIP);
    const end = ipToNumber(endIP);
    return Math.max(0, end - start + 1);
};

/**
 * Преобразование IP в число
 */
const ipToNumber = (ip: string): number => {
    return ip.split('.')
        .reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
};

/**
 * Подсчет портов в диапазоне
 */
const calculatePortCount = (portRange: string): number => {
    const parts = portRange.split(',');
    let count = 0;

    for (const part of parts) {
        if (part.includes('-')) {
            const rangeParts = part.split('-');
            const start = rangeParts[0];
            const end = rangeParts[1];

            // Проверяем на undefined
            if (start === undefined || end === undefined) {
                continue;
            }

            const startNum = Number(start);
            const endNum = Number(end);

            if (!isNaN(startNum) && !isNaN(endNum)) {
                count += (endNum - startNum + 1);
            }
        } else {
            count += 1;
        }
    }

    return count;
};

/**
 * Проверка наличия системных портов
 */
const hasSystemPorts = (portRange: string): boolean => {
    const parts = portRange.split(',');

    return parts.some(part => {
        if (part.includes('-')) {
            const rangeParts = part.split('-');
            const start = rangeParts[0];

            if (start === undefined) {
                return false;
            }

            const startNum = Number(start);
            return !isNaN(startNum) && startNum <= 1024;
        } else {
            const portNum = Number(part);
            return !isNaN(portNum) && portNum <= 1024;
        }
    });
};

/**
 * Получение примеров портов
 */
const getPortExamples = (portRange: string, maxCount: number): number[] => {
    const ports: number[] = [];
    const parts = portRange.split(',');

    for (const part of parts) {
        if (ports.length >= maxCount) break;

        if (part.includes('-')) {
            const rangeParts = part.split('-');
            const start = rangeParts[0];
            const end = rangeParts[1];

            if (start === undefined || end === undefined) {
                continue;
            }

            const startNum = Number(start);
            const endNum = Number(end);

            if (!isNaN(startNum) && !isNaN(endNum)) {
                for (let i = startNum; i <= endNum && ports.length < maxCount; i++) {
                    ports.push(i);
                }
            }
        } else {
            const portNum = Number(part);
            if (!isNaN(portNum)) {
                ports.push(portNum);
            }
        }
    }

    return ports.slice(0, maxCount);
};

/**
 * Получение известного сервиса для порта
 */
const getWellKnownService = (port: number): string | undefined => {
    const services: Record<number, string> = {
        21: 'FTP',
        22: 'SSH',
        23: 'Telnet',
        25: 'SMTP',
        53: 'DNS',
        80: 'HTTP',
        110: 'POP3',
        143: 'IMAP',
        443: 'HTTPS',
        993: 'IMAPS',
        995: 'POP3S'
    };

    return services[port];
};

/**
 * Получение TLD домена
 */
const getTLD = (domain: string): string => {
    const parts = domain.split('.');
    const tld = parts[parts.length - 1];
    return tld || '';
};

/**
 * Подсчет поддоменовexport interface ValidationResult<T
 */
const getSubdomainCount = (domain: string): number => {
    return Math.max(0, domain.split('.').length - 2);
};

/**
 * Нормализация MAC адреса
 */
const normalizeMACAddress = (mac: string): string => {
    return mac.replace(/[:-]/g, '').toLowerCase()
        .match(/.{2}/g)?.join(':') || mac;
};

/**
 * Получение вендора по MAC адресу (заглушка)
 */
const getMACVendor = (mac: string): string | undefined => {
    const oui = mac.substring(0, 8).replace(/:/g, '').toUpperCase();

    const vendors: Record<string, string> = {
        '001122': 'Cisco Systems',
        '001A2B': 'Intel Corporation',
        '00236C': 'Apple Inc',
    };

    return vendors[oui];
};

/**
 * Проверка локального MAC адреса
 */
const isLocalMAC = (mac: string): boolean => {
    const firstByte = parseInt(mac.substring(0, 2), 16);
    return (firstByte & 2) !== 0;
};

/**
 * Проверка multicast MAC адреса
 */
const isMulticastMAC = (mac: string): boolean => {
    const firstByte = parseInt(mac.substring(0, 2), 16);
    return (firstByte & 1) !== 0;
};

/**
 * Получение порта по умолчанию для протокола
 */
const getDefaultPort = (protocol: string): string => {
    const defaultPorts: Record<string, string> = {
        'http:': '80',
        'https:': '443',
        'ftp:': '21',
        'ssh:': '22'
    };

    return defaultPorts[protocol] || '';
};

/**
 * Проверка одноразового email
 */
const isDisposableEmail = (domain: string): boolean => {
    const disposableDomains = [
        '10minutemail.com',
        'tempmail.org',
        'guerrillamail.com',
        'mailinator.com'
    ];

    return disposableDomains.includes(domain.toLowerCase());
};

/**
 * Получение расширения файла
 */
const getFileExtension = (filename: string): string | undefined => {
    const lastDot = filename.lastIndexOf('.');
    return lastDot > 0 ? filename.substring(lastDot + 1).toLowerCase() : undefined;
};

/**
 * Оценка количества хостов для сканирования
 */
const estimateHostCount = (targets: string[]): number => {
    let count = 0;

    for (const target of targets) {
        if (target.includes('/')) {
            const cidrParts = target.split('/');
            if (cidrParts.length === 2) {
                const prefix = cidrParts[1];
                if (prefix) {
                    const prefixNum = parseInt(prefix, 10);
                    count += Math.pow(2, 32 - prefixNum) - 2;
                }
            }
        } else if (target.includes('-')) {
            const rangeParts = target.split('-');
            if (rangeParts.length === 2) {
                const start = rangeParts[0];
                const end = rangeParts[1];
                if (start && end) {
                    count += calculateIPRangeCount(start.trim(), end.trim());
                }
            }
        }
    }

    return count;
};

// =============================================================================
// КОМПОЗИТНЫЕ ВАЛИДАТОРЫ
// =============================================================================

/**
 * Валидация конфигурации сканирования
 */
export interface ScanConfig {
    targets: string;
    ports?: string;
    timing?: string;
    options?: string;
}

export const validateScanConfig: ValidatorFunction<ScanConfig> = (value) => {
    try {
        if (!value || typeof value !== 'object') {
            return {
                isValid: false,
                error: 'Конфигурация должна быть объектом',
                value: undefined,
                warnings: undefined,
                metadata: undefined
            };
        }

        const config = value as ScanConfig;
        const errors: string[] = [];
        const warnings: string[] = [];

        // Валидация целей
        const targetsResult = validateScanTarget(config.targets);
        if (!targetsResult.isValid) {
            errors.push(`Цели: ${targetsResult.error}`);
        } else if (targetsResult.warnings && targetsResult.warnings.length > 0) {
            warnings.push(...targetsResult.warnings);
        }

        // Валидация портов (если указаны)
        if (config.ports) {
            const portsResult = validatePortRange(config.ports);
            if (!portsResult.isValid) {
                errors.push(`Порты: ${portsResult.error}`);
            } else if (portsResult.warnings && portsResult.warnings.length > 0) {
                warnings.push(...portsResult.warnings);
            }
        }

        // Валидация опций nmap (если указаны)
        if (config.options) {
            const optionsResult = validateNmapOptions(config.options);
            if (!optionsResult.isValid) {
                errors.push(`Опции: ${optionsResult.error}`);
            } else if (optionsResult.warnings && optionsResult.warnings.length > 0) {
                warnings.push(...optionsResult.warnings);
            }
        }

        if (errors.length > 0) {
            return {
                isValid: false,
                error: errors.join('; '),
                value: undefined,
                warnings: undefined,
                metadata: undefined
            };
        }

        return {
            isValid: true,
            value: config,
            error: undefined,
            warnings: warnings.length > 0 ? warnings : undefined,
            metadata: {
                estimatedDuration: estimateScanDuration(config),
                hostCount: targetsResult.metadata?.estimatedHosts ?? 0,
                portCount: config.ports ? calculatePortCount(config.ports) : 1000
            }
        };
    } catch (error) {
        return {
            isValid: false,
            error: error instanceof Error ? error.message : 'Ошибка валидации конфигурации',
            value: undefined,
            warnings: undefined,
            metadata: undefined
        };
    }
};

/**
 * Оценка времени сканирования
 */
const estimateScanDuration = (config: ScanConfig): string => {
    // Базовая эвристика для оценки времени
    const hostCount = 100; // Заглушка
    const portCount = config.ports ? calculatePortCount(config.ports) : 1000;

    const baseTime = hostCount * portCount * 0.01; // секунды
    const minutes = Math.ceil(baseTime / 60);

    if (minutes < 60) {
        return `~${minutes} мин`;
    } else {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return `~${hours}ч ${remainingMinutes}мин`;
    }
};

// =============================================================================
// ЭКСПОРТ ВСЕХ ВАЛИДАТОРОВ
// =============================================================================

export const validators = {
    // IP валидаторы
    ipv4: validateIPv4,
    ipv6: validateIPv6,
    ip: validateIP,
    cidr: validateCIDR,
    ipRange: validateIPRange,

    // Порты
    port: validatePort,
    portRange: validatePortRange,

    // Домены и хосты
    domain: validateDomain,
    host: validateHost,

    // MAC адрес
    mac: validateMAC,

    // URL и Email
    url: validateURL,
    email: validateEmail,

    // Файлы
    filePath: validateFilePath,

    // Сканирование
    scanTarget: validateScanTarget,
    nmapOptions: validateNmapOptions,
    scanConfig: validateScanConfig
} as const;

export default validators;

// Type guards для runtime проверки типов
export const isValidationResult = (value: unknown): value is ValidationResult => {
    return (
        typeof value === 'object' &&
        value !== null &&
        'isValid' in value &&
        typeof (value as ValidationResult).isValid === 'boolean'
    );
};
