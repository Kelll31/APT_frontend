/**
 * Форматирование даты
 */
export const formatDate = (date: string | Date, options?: Intl.DateTimeFormatOptions): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const defaultOptions: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };

    return dateObj.toLocaleDateString('ru-RU', { ...defaultOptions, ...options });
};

/**
 * Форматирование размера файла
 */
export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Б';

    const k = 1024;
    const sizes = ['Б', 'КБ', 'МБ', 'ГБ', 'ТБ'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Форматирование числа с разделителями
 */
export const formatNumber = (num: number): string => {
    return num.toLocaleString('ru-RU');
};

/**
 * Форматирование времени выполнения
 */
export const formatDuration = (milliseconds: number): string => {
    if (milliseconds < 1000) {
        return `${milliseconds}мс`;
    }

    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
        return `${hours}ч ${minutes % 60}м ${seconds % 60}с`;
    } else if (minutes > 0) {
        return `${minutes}м ${seconds % 60}с`;
    } else {
        return `${seconds}с`;
    }
};
