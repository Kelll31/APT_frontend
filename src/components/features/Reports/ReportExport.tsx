// src/components/features/Reports/ReportExport.tsx

/**
 * IP Roast Enterprise - Report Export Component v4.0
 * Компонент экспорта отчетов с поддержкой множественных форматов
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    DocumentArrowDownIcon,
    Cog6ToothIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    XMarkIcon,
    ClockIcon
} from '@heroicons/react/24/outline';

// Импорты типов из существующих файлов проекта
import type {
    Report,
    ReportFormat,
    ExportSettings,
    GenerationSettings
} from '../../../stores/reportsStore';

// Импорты API и Store
import { useReportsStore } from '../../../stores/reportsStore';
import { reportsApi } from '../../../services/reportsApi';

// Компоненты UI (предполагаем, что они существуют в проекте)
interface ButtonProps {
    variant?: 'primary' | 'secondary' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    loading?: boolean;
    icon?: React.ComponentType<{ className?: string }>;
    onClick?: () => void;
    children: React.ReactNode;
    className?: string;
}

const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    icon: Icon,
    onClick,
    children,
    className = ''
}) => {
    const baseClasses = "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
    const variantClasses = {
        primary: "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500",
        secondary: "bg-gray-200 hover:bg-gray-300 text-gray-900 focus:ring-gray-500",
        danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500"
    };
    const sizeClasses = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2 text-sm",
        lg: "px-6 py-3 text-base"
    };

    return (
        <button
            className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
            disabled={disabled || loading}
            onClick={onClick}
        >
            {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            ) : Icon ? (
                <Icon className="w-4 h-4 mr-2" />
            ) : null}
            {children}
        </button>
    );
};

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    size = 'md',
    className = '',
    children
}) => {
    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl'
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

                <div className={`inline-block w-full ${sizeClasses[size]} p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg ${className}`}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
};

interface ProgressBarProps {
    progress: number;
    animated?: boolean;
    color?: 'blue' | 'green' | 'red' | 'yellow';
    className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
    progress,
    animated = false,
    color = 'blue',
    className = ''
}) => {
    const colorClasses = {
        blue: 'bg-blue-600',
        green: 'bg-green-600',
        red: 'bg-red-600',
        yellow: 'bg-yellow-600'
    };

    return (
        <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
            <div
                className={`h-2 rounded-full transition-all duration-300 ${colorClasses[color]} ${animated ? 'animate-pulse' : ''}`}
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
        </div>
    );
};

// ИСПРАВЛЕННЫЙ ИНТЕРФЕЙС ПРОПСОВ
interface ReportExportProps {
    reportId: string;
    reportTitle?: string;
    isOpen: boolean;
    onClose: () => void;
    onExportComplete?: (downloadUrl: string, format: ReportFormat) => void;
    onExportError?: (error: string) => void;
    availableFormats?: ReportFormat[];
    className?: string;
}

// ИСПРАВЛЕННЫЕ ЛОКАЛЬНЫЕ ТИПЫ
interface ExportProgress {
    isExporting: boolean;
    progress: number;
    phase: string;
    estimatedTimeRemaining?: number;
}

interface ExportValidation {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}

// ИСПРАВЛЕННЫЕ НАСТРОЙКИ ЭКСПОРТА
interface LocalExportSettings extends ExportSettings {
    customFileName?: string;
    includeWatermark?: boolean;
    digitalSignature?: boolean;
    scheduleExport?: boolean;
    scheduledTime?: string;
    notificationEmail?: string;
}

// ОСНОВНОЙ КОМПОНЕНТ
export const ReportExport: React.FC<ReportExportProps> = ({
    reportId,
    reportTitle = 'Отчет',
    isOpen,
    onClose,
    onExportComplete,
    onExportError,
    availableFormats = ['pdf', 'html', 'word', 'excel', 'csv', 'json'],
    className = ''
}) => {
    // СОСТОЯНИЕ КОМПОНЕНТА
    const [exportSettings, setExportSettings] = useState<LocalExportSettings>({
        format: 'pdf',
        include_metadata: true,
        include_attachments: true,
        compression: 'none',
        password_protected: false,
        custom_fields: [],
        customFileName: '',
        includeWatermark: true,
        digitalSignature: false,
        scheduleExport: false,
        scheduledTime: '',
        notificationEmail: ''
    });

    const [exportProgress, setExportProgress] = useState<ExportProgress>({
        isExporting: false,
        progress: 0,
        phase: ''
    });

    const [validation, setValidation] = useState<ExportValidation>({
        isValid: true,
        errors: [],
        warnings: []
    });

    const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
    const [toast, setToast] = useState<{
        type: 'success' | 'error' | 'warning';
        message: string
    } | null>(null);

    // ПОЛУЧЕНИЕ ДАННЫХ ИЗ STORE
    const { reports } = useReportsStore();
    const report = useMemo(() => reports.get(reportId), [reports, reportId]);

    // ВАЛИДАЦИЯ НАСТРОЕК ЭКСПОРТА
    const validateExportSettings = useCallback((settings: LocalExportSettings): ExportValidation => {
        const errors: string[] = [];
        const warnings: string[] = [];

        // Проверка формата
        if (!availableFormats.includes(settings.format)) {
            errors.push(`Формат ${settings.format} не поддерживается`);
        }

        // Проверка имени файла
        if (settings.customFileName && !/^[a-zA-Z0-9_\-\s\.]+$/.test(settings.customFileName)) {
            errors.push('Имя файла содержит недопустимые символы');
        }

        // Проверка расписания
        if (settings.scheduleExport && !settings.scheduledTime) {
            errors.push('Необходимо указать время для запланированного экспорта');
        }

        // Проверка email для уведомлений
        if (settings.notificationEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.notificationEmail)) {
            errors.push('Неверный формат email для уведомлений');
        }

        // Предупреждения
        if (settings.include_attachments && (!report?.attachments || report.attachments.length === 0)) {
            warnings.push('В отчете нет вложений для экспорта');
        }

        if (settings.format === 'csv' && settings.include_metadata) {
            warnings.push('Метаданные могут быть ограничены в CSV формате');
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }, [availableFormats, report]);

    // ОБНОВЛЕНИЕ ВАЛИДАЦИИ ПРИ ИЗМЕНЕНИИ НАСТРОЕК
    useEffect(() => {
        const validationResult = validateExportSettings(exportSettings);
        setValidation(validationResult);
    }, [exportSettings, validateExportSettings]);

    // ОПЦИИ ФОРМАТОВ
    const formatOptions = useMemo(() => [
        { value: 'pdf', label: 'PDF Document', description: 'Портативный документ, оптимален для печати' },
        { value: 'html', label: 'HTML Page', description: 'Веб-страница с интерактивными элементами' },
        { value: 'word', label: 'Word Document', description: 'Microsoft Word документ для редактирования' },
        { value: 'excel', label: 'Excel Spreadsheet', description: 'Таблица Excel для анализа данных' },
        { value: 'csv', label: 'CSV Data', description: 'Табличные данные в формате CSV' },
        { value: 'json', label: 'JSON Data', description: 'Структурированные данные в формате JSON' },
        { value: 'xml', label: 'XML Document', description: 'XML документ для интеграций' },
        { value: 'pptx', label: 'PowerPoint', description: 'Презентация Microsoft PowerPoint' }
    ].filter(option => availableFormats.includes(option.value as ReportFormat)), [availableFormats]);

    // ОПЦИИ СЖАТИЯ
    const compressionOptions = [
        { value: 'none', label: 'Без сжатия', description: 'Максимальное качество, больший размер' },
        { value: 'zip', label: 'ZIP сжатие', description: 'Стандартное сжатие для архивов' },
        { value: 'gzip', label: 'GZIP сжатие', description: 'Высокоэффективное сжатие' }
    ];

    // ОБРАБОТЧИК ЭКСПОРТА
    const handleExport = useCallback(async () => {
        if (!validation.isValid) {
            setToast({ type: 'error', message: 'Исправьте ошибки перед экспортом' });
            return;
        }

        try {
            setExportProgress({
                isExporting: true,
                progress: 0,
                phase: 'Подготовка экспорта...'
            });

            // Создаем настройки для API
            const apiSettings: ExportSettings = {
                format: exportSettings.format,
                include_metadata: exportSettings.include_metadata,
                include_attachments: exportSettings.include_attachments,
                compression: exportSettings.compression,
                password_protected: exportSettings.password_protected,
                custom_fields: exportSettings.custom_fields
            };

            // Симуляция прогресса
            const progressSteps = [
                { progress: 10, phase: 'Загрузка данных отчета...' },
                { progress: 30, phase: 'Обработка содержимого...' },
                { progress: 50, phase: 'Генерация документа...' },
                { progress: 70, phase: 'Применение форматирования...' },
                { progress: 90, phase: 'Финализация экспорта...' }
            ];

            for (const step of progressSteps) {
                setExportProgress(prev => ({ ...prev, ...step }));
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            // Выполняем экспорт через API
            const response = await reportsApi.exportReport(reportId, apiSettings);

            // Проверяем, что response содержит данные для скачивания
            if (!response || !response.data) {
                throw new Error('Не удалось получить данные экспорта');
            }

            // Создаем blob из response data
            const blob = new Blob([JSON.stringify(response.data)], {
                type: 'application/octet-stream'
            });
            const downloadUrl = URL.createObjectURL(blob);

            // Генерируем имя файла
            const fileName = exportSettings.customFileName ||
                `${reportTitle}_${new Date().toISOString().split('T')[0]}.${exportSettings.format}`;

            // Автоматическое скачивание
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setExportProgress({
                isExporting: false,
                progress: 100,
                phase: 'Экспорт завершен'
            });

            setToast({
                type: 'success',
                message: `Отчет успешно экспортирован в формате ${exportSettings.format.toUpperCase()}`
            });

            // Вызываем callback
            onExportComplete?.(downloadUrl, exportSettings.format);

            // Закрываем модальное окно через некоторое время
            setTimeout(() => {
                onClose();
                URL.revokeObjectURL(downloadUrl);
            }, 2000);

        } catch (error) {
            console.error('Ошибка экспорта:', error);
            const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка экспорта';

            setExportProgress({
                isExporting: false,
                progress: 0,
                phase: ''
            });

            setToast({ type: 'error', message: errorMessage });
            onExportError?.(errorMessage);
        }
    }, [reportId, exportSettings, validation, reportTitle, onExportComplete, onExportError, onClose]);

    // СБРОС НАСТРОЕК
    const handleReset = useCallback(() => {
        setExportSettings({
            format: 'pdf',
            include_metadata: true,
            include_attachments: true,
            compression: 'none',
            password_protected: false,
            custom_fields: [],
            customFileName: '',
            includeWatermark: true,
            digitalSignature: false,
            scheduleExport: false,
            scheduledTime: '',
            notificationEmail: ''
        });
        setShowAdvancedOptions(false);
    }, []);

    // ОБНОВЛЕНИЕ НАСТРОЕК
    const updateSettings = useCallback((updates: Partial<LocalExportSettings>) => {
        setExportSettings(prev => ({ ...prev, ...updates }));
    }, []);

    // Автоматическое скрытие toast
    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Экспорт отчета: ${reportTitle}`}
            size="lg"
            className={className}
        >
            <div className="space-y-6">
                {/* ОСНОВНЫЕ НАСТРОЙКИ */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">
                        Основные настройки
                    </h3>

                    {/* Выбор формата */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Формат экспорта
                        </label>
                        <div className="space-y-2">
                            {formatOptions.map((option) => (
                                <label key={option.value} className="flex items-start cursor-pointer">
                                    <input
                                        type="radio"
                                        name="format"
                                        value={option.value}
                                        checked={exportSettings.format === option.value}
                                        onChange={(e) => updateSettings({ format: e.target.value as ReportFormat })}
                                        className="mt-1 mr-3"
                                        disabled={exportProgress.isExporting}
                                    />
                                    <div>
                                        <div className="font-medium text-sm text-gray-900">{option.label}</div>
                                        <div className="text-xs text-gray-500">{option.description}</div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Пользовательское имя файла */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Имя файла (опционально)
                        </label>
                        <input
                            type="text"
                            value={exportSettings.customFileName}
                            onChange={(e) => updateSettings({ customFileName: e.target.value })}
                            placeholder={`${reportTitle}_${new Date().toISOString().split('T')[0]}`}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={exportProgress.isExporting}
                        />
                    </div>

                    {/* Базовые опции */}
                    <div className="space-y-3">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={exportSettings.include_metadata}
                                onChange={(e) => updateSettings({ include_metadata: e.target.checked })}
                                className="mr-2"
                                disabled={exportProgress.isExporting}
                            />
                            <div>
                                <div className="font-medium text-sm">Включить метаданные</div>
                                <div className="text-xs text-gray-500">Информация о создании, авторе и параметрах отчета</div>
                            </div>
                        </label>

                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={exportSettings.include_attachments}
                                onChange={(e) => updateSettings({ include_attachments: e.target.checked })}
                                className="mr-2"
                                disabled={exportProgress.isExporting || !report?.attachments?.length}
                            />
                            <div>
                                <div className="font-medium text-sm">Включить вложения</div>
                                <div className="text-xs text-gray-500">Файлы и изображения, прикрепленные к отчету</div>
                            </div>
                        </label>

                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={exportSettings.includeWatermark}
                                onChange={(e) => updateSettings({ includeWatermark: e.target.checked })}
                                className="mr-2"
                                disabled={exportProgress.isExporting}
                            />
                            <div>
                                <div className="font-medium text-sm">Добавить водяной знак</div>
                                <div className="text-xs text-gray-500">Защитный водяной знак с информацией о пользователе</div>
                            </div>
                        </label>
                    </div>
                </div>

                {/* ДОПОЛНИТЕЛЬНЫЕ НАСТРОЙКИ */}
                <div>
                    <button
                        type="button"
                        onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                        className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                        disabled={exportProgress.isExporting}
                    >
                        <Cog6ToothIcon className="w-4 h-4 mr-2" />
                        Дополнительные настройки
                        <motion.div
                            animate={{ rotate: showAdvancedOptions ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                            className="ml-2"
                        >
                            ▼
                        </motion.div>
                    </button>

                    <AnimatePresence>
                        {showAdvancedOptions && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden"
                            >
                                <div className="mt-4 space-y-4 p-4 bg-gray-50 rounded-lg">
                                    {/* Сжатие */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Уровень сжатия
                                        </label>
                                        <select
                                            value={exportSettings.compression}
                                            onChange={(e) => updateSettings({ compression: e.target.value as any })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            disabled={exportProgress.isExporting}
                                        >
                                            {compressionOptions.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label} - {option.description}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Защита паролем */}
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={exportSettings.password_protected}
                                            onChange={(e) => updateSettings({ password_protected: e.target.checked })}
                                            className="mr-2"
                                            disabled={exportProgress.isExporting || !['pdf', 'word', 'excel'].includes(exportSettings.format)}
                                        />
                                        <div>
                                            <div className="font-medium text-sm">Защитить паролем</div>
                                            <div className="text-xs text-gray-500">Документ будет защищен автоматически сгенерированным паролем</div>
                                        </div>
                                    </label>

                                    {/* Планирование экспорта */}
                                    <div className="space-y-3">
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={exportSettings.scheduleExport}
                                                onChange={(e) => updateSettings({ scheduleExport: e.target.checked })}
                                                className="mr-2"
                                                disabled={exportProgress.isExporting}
                                            />
                                            <div>
                                                <div className="font-medium text-sm">Запланировать экспорт</div>
                                                <div className="text-xs text-gray-500">Выполнить экспорт в указанное время</div>
                                            </div>
                                        </label>

                                        {exportSettings.scheduleExport && (
                                            <div className="ml-6 space-y-3">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Время экспорта
                                                    </label>
                                                    <input
                                                        type="datetime-local"
                                                        value={exportSettings.scheduledTime}
                                                        onChange={(e) => updateSettings({ scheduledTime: e.target.value })}
                                                        min={new Date().toISOString().slice(0, 16)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                        disabled={exportProgress.isExporting}
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Email для уведомления
                                                    </label>
                                                    <input
                                                        type="email"
                                                        value={exportSettings.notificationEmail}
                                                        onChange={(e) => updateSettings({ notificationEmail: e.target.value })}
                                                        placeholder="user@example.com"
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                        disabled={exportProgress.isExporting}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* ВАЛИДАЦИЯ И ПРЕДУПРЕЖДЕНИЯ */}
                {(validation.errors.length > 0 || validation.warnings.length > 0) && (
                    <div className="space-y-2">
                        {validation.errors.map((error, index) => (
                            <div key={index} className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                                <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" />
                                <span className="text-sm text-red-700">{error}</span>
                            </div>
                        ))}

                        {validation.warnings.map((warning, index) => (
                            <div key={index} className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500 mr-2 flex-shrink-0" />
                                <span className="text-sm text-yellow-700">{warning}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* ПРОГРЕСС ЭКСПОРТА */}
                {exportProgress.isExporting && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">
                                {exportProgress.phase}
                            </span>
                            <span className="text-sm text-gray-500">
                                {exportProgress.progress}%
                            </span>
                        </div>
                        <ProgressBar
                            progress={exportProgress.progress}
                            animated={true}
                            color="blue"
                        />
                        {exportProgress.estimatedTimeRemaining && (
                            <p className="text-xs text-gray-500">
                                Осталось примерно {Math.ceil(exportProgress.estimatedTimeRemaining / 60)} мин.
                            </p>
                        )}
                    </div>
                )}

                {/* КНОПКИ ДЕЙСТВИЙ */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <Button
                        variant="secondary"
                        onClick={handleReset}
                        disabled={exportProgress.isExporting}
                    >
                        Сбросить
                    </Button>

                    <div className="flex items-center space-x-3">
                        <Button
                            variant="secondary"
                            onClick={onClose}
                            disabled={exportProgress.isExporting}
                        >
                            Отмена
                        </Button>

                        <Button
                            variant="primary"
                            onClick={handleExport}
                            disabled={!validation.isValid || exportProgress.isExporting || exportSettings.scheduleExport}
                            icon={exportProgress.isExporting ? undefined : DocumentArrowDownIcon}
                            loading={exportProgress.isExporting}
                        >
                            {exportSettings.scheduleExport
                                ? 'Запланировать экспорт'
                                : exportProgress.isExporting
                                    ? 'Экспортируется...'
                                    : 'Экспортировать'
                            }
                        </Button>
                    </div>
                </div>

                {/* ИНФОРМАЦИЯ О ФАЙЛЕ */}
                {report && (
                    <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="font-medium">Отчет:</span> {report.title}
                            </div>
                            <div>
                                <span className="font-medium">Создан:</span> {new Date(report.created_at).toLocaleDateString()}
                            </div>
                            <div>
                                <span className="font-medium">Статус:</span> {report.status}
                            </div>
                            <div>
                                <span className="font-medium">Размер данных:</span> {report.metrics?.data_volume_mb ? `${report.metrics.data_volume_mb} MB` : 'Неизвестно'}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* TOAST УВЕДОМЛЕНИЯ */}
            {toast && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg z-50 ${toast.type === 'success' ? 'bg-green-500 text-white' :
                            toast.type === 'error' ? 'bg-red-500 text-white' :
                                'bg-yellow-500 text-black'
                        }`}
                >
                    <div className="flex items-center">
                        {toast.type === 'success' && <CheckCircleIcon className="w-5 h-5 mr-2" />}
                        {toast.type === 'error' && <ExclamationTriangleIcon className="w-5 h-5 mr-2" />}
                        {toast.type === 'warning' && <ClockIcon className="w-5 h-5 mr-2" />}
                        <span className="text-sm">{toast.message}</span>
                        <button
                            onClick={() => setToast(null)}
                            className="ml-2 text-white hover:text-gray-200"
                        >
                            <XMarkIcon className="w-4 h-4" />
                        </button>
                    </div>
                </motion.div>
            )}
        </Modal>
    );
};

export default ReportExport;
