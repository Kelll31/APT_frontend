/// <reference types="vite/client" />

// ===== ПЕРЕМЕННЫЕ ОКРУЖЕНИЯ =====
interface ImportMetaEnv {
    // Основные настройки приложения
    readonly VITE_APP_TITLE: string;
    readonly VITE_APP_VERSION: string;
    readonly VITE_APP_DESCRIPTION: string;
    readonly VITE_BUILD_TIME: string;
    readonly VITE_GIT_HASH: string;
    readonly VITE_GIT_BRANCH: string;

    // API настройки
    readonly VITE_API_URL: string;
    readonly VITE_API_TIMEOUT: string;
    readonly VITE_API_RETRY_ATTEMPTS: string;

    // WebSocket настройки
    readonly VITE_WS_URL: string;
    readonly VITE_WS_NAMESPACE: string;
    readonly VITE_WS_TIMEOUT: string;
    readonly VITE_WS_RECONNECT_ATTEMPTS: string;

    // Настройки безопасности
    readonly VITE_ENABLE_ANALYTICS: string;
    readonly VITE_ENABLE_ERROR_REPORTING: string;
    readonly VITE_ENABLE_DEBUG_MODE: string;
    readonly VITE_ENABLE_DEV_TOOLS: string;

    // Настройки производительности
    readonly VITE_ENABLE_PERFORMANCE_MONITORING: string;
    readonly VITE_CHUNK_SIZE_WARNING_LIMIT: string;
    readonly VITE_ENABLE_SOURCE_MAPS: string;

    // Внешние сервисы
    readonly VITE_SENTRY_DSN: string;
    readonly VITE_GOOGLE_ANALYTICS_ID: string;
    readonly VITE_HOTJAR_ID: string;

    // Настройки темы
    readonly VITE_DEFAULT_THEME: string;
    readonly VITE_DEFAULT_ACCENT: string;
    readonly VITE_DEFAULT_LANGUAGE: string;

    // Настройки сканирования
    readonly VITE_DEFAULT_SCAN_TIMEOUT: string;
    readonly VITE_MAX_SCAN_TARGETS: string;
    readonly VITE_DEFAULT_SCAN_PROFILE: string;

    // Режим разработки
    readonly DEV: boolean;
    readonly PROD: boolean;
    readonly SSR: boolean;
    readonly MODE: string;
    readonly BASE_URL: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
    readonly hot?: {
        readonly data: any;
        accept(): void;
        accept(cb: (mod: any) => void): void;
        accept(dep: string, cb: (mod: any) => void): void;
        accept(deps: readonly string[], cb: (mods: any[]) => void): void;
        dispose(cb: (data: any) => void): void;
        decline(): void;
        invalidate(): void;
        on(event: string, cb: (...args: any[]) => void): void;
        send(event: string, data?: any): void;
    };
    readonly glob: (pattern: string, options?: { eager?: boolean; import?: string }) => Record<string, any>;
}

// ===== CSS МОДУЛИ =====
declare module '*.module.css' {
    const classes: { readonly [key: string]: string };
    export default classes;
}

declare module '*.module.scss' {
    const classes: { readonly [key: string]: string };
    export default classes;
}

declare module '*.module.sass' {
    const classes: { readonly [key: string]: string };
    export default classes;
}

declare module '*.module.less' {
    const classes: { readonly [key: string]: string };
    export default classes;
}

declare module '*.module.styl' {
    const classes: { readonly [key: string]: string };
    export default classes;
}

// ===== СТАТИЧЕСКИЕ РЕСУРСЫ =====

// Изображения
declare module '*.png' {
    const src: string;
    export default src;
}

declare module '*.jpg' {
    const src: string;
    export default src;
}

declare module '*.jpeg' {
    const src: string;
    export default src;
}

declare module '*.gif' {
    const src: string;
    export default src;
}

declare module '*.webp' {
    const src: string;
    export default src;
}

declare module '*.avif' {
    const src: string;
    export default src;
}

declare module '*.ico' {
    const src: string;
    export default src;
}

declare module '*.bmp' {
    const src: string;
    export default src;
}

// SVG с поддержкой React компонентов
declare module '*.svg' {
    import * as React from 'react';

    export const ReactComponent: React.FunctionComponent<
        React.SVGProps<SVGSVGElement> & { title?: string }
    >;

    const src: string;
    export default src;
}

// Шрифты
declare module '*.woff' {
    const src: string;
    export default src;
}

declare module '*.woff2' {
    const src: string;
    export default src;
}

declare module '*.eot' {
    const src: string;
    export default src;
}

declare module '*.ttf' {
    const src: string;
    export default src;
}

declare module '*.otf' {
    const src: string;
    export default src;
}

// Аудио и видео
declare module '*.mp4' {
    const src: string;
    export default src;
}

declare module '*.webm' {
    const src: string;
    export default src;
}

declare module '*.mp3' {
    const src: string;
    export default src;
}

declare module '*.wav' {
    const src: string;
    export default src;
}

declare module '*.flac' {
    const src: string;
    export default src;
}

declare module '*.aac' {
    const src: string;
    export default src;
}

// Документы
declare module '*.pdf' {
    const src: string;
    export default src;
}

declare module '*.txt' {
    const src: string;
    export default src;
}

// ===== CSS ИМПОРТЫ =====
declare module '*.css' {
    const content: string;
    export default content;
}

declare module '*.scss' {
    const content: string;
    export default content;
}

declare module '*.sass' {
    const content: string;
    export default content;
}

declare module '*.less' {
    const content: string;
    export default content;
}

declare module '*.styl' {
    const content: string;
    export default content;
}

// ===== JSON МОДУЛИ =====
declare module '*.json' {
    const value: any;
    export default value;
}

// ===== WEB WORKERS =====
declare module '*?worker' {
    const workerConstructor: {
        new(): Worker;
    };
    export default workerConstructor;
}

declare module '*?worker&inline' {
    const workerConstructor: {
        new(): Worker;
    };
    export default workerConstructor;
}

declare module '*?sharedworker' {
    const sharedWorkerConstructor: {
        new(): SharedWorker;
    };
    export default sharedWorkerConstructor;
}

// ===== ГЛОБАЛЬНЫЕ РАСШИРЕНИЯ WINDOW =====
declare global {
    interface Window {
        // IP Roast специфичные
        __IP_ROAST_CONFIG__?: {
            version: string;
            build: string;
            api: {
                baseUrl: string;
                timeout: number;
            };
            websocket: {
                url: string;
                namespace: string;
            };
            features: {
                notifications: boolean;
                analytics: boolean;
                errorReporting: boolean;
                performance: boolean;
            };
        };

        __IP_ROAST_DEBUG__?: {
            config: any;
            version: string;
            environment: string;
            reloadApp: () => void;
            clearStorage: () => void;
            exportLogs: () => void;
        };

        __BROWSER_SUPPORT__?: {
            webSockets: boolean;
            localStorage: boolean;
            sessionStorage: boolean;
            fetch: boolean;
            promises: boolean;
            modules: boolean;
            intersectionObserver: boolean;
            resizeObserver: boolean;
        };

        // Функции приложения
        hideInitialLoading?: () => void;

        // Socket.IO
        io?: typeof import('socket.io-client').io;

        // Компоненты IP Roast
        ApiManager?: any;
        WebSocketManager?: any;
        UIManager?: any;
        ScanningApp?: any;
        IPRoastNotifications?: any;

        // Флаги загрузки
        ApiManagerLoaded?: boolean;
        ScanningAppLoaded?: boolean;
        ipRoastIndexLoaded?: boolean;

        // StateManager
        stateManager?: any;

        // Аналитика
        gtag?: (...args: any[]) => void;
        dataLayer?: any[];

        // Мониторинг ошибок
        Sentry?: any;

        // Service Worker
        navigator: Navigator & {
            serviceWorker?: ServiceWorkerContainer;
        };

        // Performance API расширения
        performance: Performance & {
            measureUserAgentSpecificMemory?: () => Promise<any>;
            memory?: {
                usedJSHeapSize: number;
                totalJSHeapSize: number;
                jsHeapSizeLimit: number;
            };
        };

        // Кастомные события IP Roast
        addEventListener(type: 'ip-roast-ready', listener: (event: CustomEvent) => void): void;
        addEventListener(type: 'sw-update-available', listener: (event: CustomEvent) => void): void;
        addEventListener(type: 'page-visible', listener: (event: CustomEvent) => void): void;
        addEventListener(type: 'page-hidden', listener: (event: CustomEvent) => void): void;
        addEventListener(type: 'connection-restored', listener: (event: CustomEvent) => void): void;
        addEventListener(type: 'connection-lost', listener: (event: CustomEvent) => void): void;
    }

    // Console расширения для debug режима
    interface Console {
        trace?: (...args: any[]) => void;
        groupCollapsed?: (...args: any[]) => void;
        groupEnd?: () => void;
        table?: (data: any) => void;
        time?: (label: string) => void;
        timeEnd?: (label: string) => void;
        timeLog?: (label: string, ...args: any[]) => void;
        count?: (label?: string) => void;
        countReset?: (label?: string) => void;
        profile?: (label?: string) => void;
        profileEnd?: (label?: string) => void;
    }

    // Навигатор расширения
    interface Navigator {
        connection?: {
            effectiveType: string;
            downlink: number;
            rtt: number;
            saveData: boolean;
            addEventListener: (type: string, listener: EventListener) => void;
        };
        deviceMemory?: number;
        hardwareConcurrency?: number;
        webdriver?: boolean;
    }

    // Document расширения
    interface Document {
        documentElement: HTMLElement & {
            setAttribute(name: 'data-theme' | 'data-accent' | 'data-size' | 'data-high-contrast', value: string): void;
        };
    }
}

// ===== TAILWIND CSS ТИПЫ =====
declare module 'tailwindcss/tailwind.css';
declare module 'tailwindcss/base.css';
declare module 'tailwindcss/components.css';
declare module 'tailwindcss/utilities.css';

// ===== ZUSTAND STORE ТИПЫ =====
declare module 'zustand' {
    export interface StoreApi<T> {
        getState: () => T;
        setState: (partial: T | Partial<T> | ((state: T) => T | Partial<T>), replace?: boolean) => void;
        subscribe: (listener: (state: T, prevState: T) => void) => () => void;
        destroy: () => void;
    }
}

// ===== REACT РАСШИРЕНИЯ =====
declare module 'react' {
    interface HTMLAttributes<T> {
        // Кастомные data атрибуты
        'data-theme'?: 'light' | 'dark' | 'auto';
        'data-accent'?: 'blue' | 'green' | 'red' | 'purple' | 'orange' | 'teal';
        'data-size'?: 'compact' | 'medium' | 'large';
        'data-high-contrast'?: 'true' | 'false';
        'data-testid'?: string;
        'data-scan-id'?: string;
        'data-target'?: string;
        'data-status'?: string;
    }
}

// ===== WEBSOCKET ТИПЫ =====
declare module 'socket.io-client' {
    interface Socket {
        // IP Roast специфичные события
        on(event: 'scan_progress', listener: (data: any) => void): this;
        on(event: 'scan_completed', listener: (data: any) => void): this;
        on(event: 'scan_stopped', listener: (data: any) => void): this;
        on(event: 'scan_error', listener: (data: any) => void): this;
        on(event: 'join_success', listener: (data: any) => void): this;
        on(event: 'leave_success', listener: (data: any) => void): this;
        on(event: 'scan_not_found', listener: (data: any) => void): this;
        on(event: 'active_scans', listener: (data: any) => void): this;

        emit(event: 'join_scan', data: { scan_id: string }): this;
        emit(event: 'leave_scan', data: { scan_id: string }): this;
        emit(event: 'get_scan_status', data: { scan_id: string }): this;
        emit(event: 'stop_scan', data: { scan_id: string }): this;
        emit(event: 'get_active_scans'): this;
        emit(event: 'ping', data?: any): this;
    }
}

// ===== CHART.JS ТИПЫ =====
declare module 'chart.js' {
    interface ChartConfiguration {
        // Кастомные опции для IP Roast
        ipRoastOptions?: {
            theme: 'light' | 'dark';
            accent: string;
            animated: boolean;
        };
    }
}

// ===== УТИЛИТЫ ТИПОВ =====
type DeepPartial<T> = {
    [P in keyof T]?: DeepPartial<T[P]>;
};

type RequiredKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;

type OptionalKeys<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

type NonNullable<T> = T extends null | undefined ? never : T;

type Awaited<T> = T extends Promise<infer U> ? U : T;

// ===== IP ROAST СПЕЦИФИЧНЫЕ ТИПЫ =====
declare namespace IPRoast {
    interface ScanData {
        target: string;
        ports: string;
        profile: string;
        options?: Record<string, any>;
    }

    interface ScanResult {
        id: string;
        target: string;
        status: 'running' | 'completed' | 'failed' | 'stopped';
        progress: number;
        results?: any;
        created_at: string;
        completed_at?: string;
    }

    interface NotificationOptions {
        type: 'success' | 'error' | 'warning' | 'info' | 'loading';
        title: string;
        message: string;
        duration?: number;
        actions?: Array<{
            label: string;
            icon?: string;
            handler: () => void;
        }>;
    }

    interface ThemeConfig {
        theme: 'light' | 'dark' | 'auto';
        accent: string;
        size: 'compact' | 'medium' | 'large';
        fontSize: number;
        highContrast: boolean;
    }
}

// ===== ЭКСПОРТ ТИПОВ =====
export type { IPRoast };
export type {
    DeepPartial,
    RequiredKeys,
    OptionalKeys,
    NonNullable,
    Awaited
};
