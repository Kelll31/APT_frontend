import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

// Компоненты
import Button from '@/components/common/Button'
import Card from '@/components/common/Card'

// Хуки
import { useTheme } from '@/hooks/useTheme'
import { useNotifications } from '@/hooks/useNotifications'

// Утилиты
import { formatDuration } from '@/utils/formatters'

// Типы
interface ErrorStats {
    errorCode: string;
    timestamp: string;
    attemptedPath: string;
    userAgent: string;
    referrer: string;
}

interface QuickLink {
    id: string;
    title: string;
    description: string;
    icon: string;
    path: string;
    badge?: string;
}

const NotFoundPage: React.FC = () => {
    // Хуки
    const navigate = useNavigate();
    const location = useLocation();
    const { theme } = useTheme();
    const { addNotification } = useNotifications();

    // Состояние
    const [redirectTimer, setRedirectTimer] = useState<number | null>(null);
    const [timeLeft, setTimeLeft] = useState(10);
    const [isAutoRedirect, setIsAutoRedirect] = useState(false);
    const [errorStats, setErrorStats] = useState<ErrorStats | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Быстрые ссылки для навигации
    const quickLinks: QuickLink[] = [
        {
            id: 'scanner',
            title: 'Сканер портов',
            description: 'Запустить сканирование безопасности',
            icon: '🔍',
            path: '/scanner',
            badge: 'Основное'
        },
        {
            id: 'recon',
            title: 'Разведка сети',
            description: 'Обнаружение устройств в сети',
            icon: '🗺️',
            path: '/recon'
        },
        {
            id: 'reports',
            title: 'Отчеты',
            description: 'Просмотр результатов сканирования',
            icon: '📊',
            path: '/reports'
        },
        {
            id: 'settings',
            title: 'Настройки',
            description: 'Конфигурация системы',
            icon: '⚙️',
            path: '/settings'
        }
    ];

    // Инициализация статистики ошибки
    useEffect(() => {
        const stats: ErrorStats = {
            errorCode: '404',
            timestamp: new Date().toISOString(),
            attemptedPath: location.pathname + location.search,
            userAgent: navigator.userAgent,
            referrer: document.referrer || 'Direct access'
        };

        setErrorStats(stats);

        // Логируем ошибку для аналитики
        console.warn('📍 404 Error:', {
            path: stats.attemptedPath,
            referrer: stats.referrer,
            timestamp: stats.timestamp
        });

        // Отправляем в систему аналитики если включена
        if (window.__IP_ROAST_CONFIG__?.features?.analytics) {
            try {
                // Здесь можно интегрировать с системой аналитики
                console.log('📊 Analytics: 404 error tracked');
            } catch (error) {
                console.warn('⚠️ Failed to track 404 error:', error);
            }
        }
    }, [location]);

    // Автоматическое перенаправление
    useEffect(() => {
        let timer: NodeJS.Timeout;

        if (isAutoRedirect && timeLeft > 0) {
            timer = setTimeout(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (isAutoRedirect && timeLeft === 0) {
            handleRedirectHome();
        }

        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [isAutoRedirect, timeLeft]);

    // Обработчик перенаправления на главную
    const handleRedirectHome = useCallback(() => {
        addNotification({
            type: 'info',
            title: 'Перенаправление',
            message: 'Возвращаемся на главную страницу',
            duration: 2000
        });
        navigate('/scanner', { replace: true });
    }, [navigate, addNotification]);

    // Обработчик включения автоматического перенаправления
    const handleEnableAutoRedirect = useCallback(() => {
        setIsAutoRedirect(true);
        addNotification({
            type: 'info',
            title: 'Автоперенаправление включено',
            message: `Перенаправление через ${timeLeft} секунд`,
            duration: 3000
        });
    }, [timeLeft, addNotification]);

    // Обработчик отключения автоматического перенаправления
    const handleDisableAutoRedirect = useCallback(() => {
        setIsAutoRedirect(false);
        setTimeLeft(10);
        addNotification({
            type: 'info',
            title: 'Автоперенаправление отключено',
            message: 'Оставаться на текущей странице',
            duration: 2000
        });
    }, [addNotification]);

    // Обработчик навигации по быстрым ссылкам
    const handleQuickNavigation = useCallback((path: string, title: string) => {
        addNotification({
            type: 'success',
            title: 'Переход',
            message: `Переход в раздел: ${title}`,
            duration: 2000
        });
        navigate(path);
    }, [navigate, addNotification]);

    // Обработчик поиска
    const handleSearch = useCallback((e: React.FormEvent) => {
        e.preventDefault();

        if (!searchQuery.trim()) {
            addNotification({
                type: 'warning',
                title: 'Пустой запрос',
                message: 'Введите поисковый запрос'
            });
            return;
        }

        // Простой поиск по доступным разделам
        const matchingLink = quickLinks.find(link =>
            link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            link.description.toLowerCase().includes(searchQuery.toLowerCase())
        );

        if (matchingLink) {
            addNotification({
                type: 'success',
                title: 'Найдено совпадение',
                message: `Переход в: ${matchingLink.title}`,
                duration: 3000
            });
            navigate(matchingLink.path);
        } else {
            addNotification({
                type: 'info',
                title: 'Ничего не найдено',
                message: 'Попробуйте использовать быстрые ссылки ниже',
                duration: 4000
            });
        }
    }, [searchQuery, quickLinks, navigate, addNotification]);

    // Обработчик возврата назад
    const handleGoBack = useCallback(() => {
        if (window.history.length > 1) {
            navigate(-1);
        } else {
            navigate('/scanner', { replace: true });
        }
    }, [navigate]);

    // Обработчик отправки отчета об ошибке
    const handleReportError = useCallback(async () => {
        if (!errorStats) return;

        try {
            // Здесь можно интегрировать с API для отправки отчетов об ошибках
            console.log('📝 Error report:', errorStats);

            addNotification({
                type: 'success',
                title: 'Отчет отправлен',
                message: 'Спасибо за помощь в улучшении IP Roast!',
                duration: 4000
            });
        } catch (error) {
            addNotification({
                type: 'error',
                title: 'Ошибка отправки',
                message: 'Не удалось отправить отчет об ошибке'
            });
        }
    }, [errorStats, addNotification]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
            <div className="max-w-4xl w-full space-y-8">

                {/* Основная секция 404 */}
                <div className="text-center space-y-6">
                    <div className="relative">
                        {/* Анимированная иконка */}
                        <div className="inline-flex items-center justify-center w-32 h-32 mb-6">
                            <div className="relative">
                                {/* Внешний круг */}
                                <div className="w-32 h-32 border-4 border-gray-200 dark:border-gray-700 rounded-full animate-spin-slow opacity-20"></div>

                                {/* Внутренний контент */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-6xl animate-pulse">🔍</div>
                                </div>

                                {/* Точки сканирования */}
                                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
                                    <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                                </div>
                                <div className="absolute bottom-0 right-0 transform translate-x-2 translate-y-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping animation-delay-300"></div>
                                </div>
                                <div className="absolute top-1/2 left-0 transform -translate-x-2 -translate-y-1/2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-ping animation-delay-700"></div>
                                </div>
                            </div>
                        </div>

                        {/* Код ошибки и заголовок */}
                        <h1 className="text-8xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                            <span className="bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
                                404
                            </span>
                        </h1>

                        <h2 className="text-3xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                            Цель не найдена
                        </h2>

                        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                            IP Roast не смог обнаружить запрашиваемую страницу в сетевом пространстве.
                            Возможно, она была перемещена или удалена.
                        </p>
                    </div>

                    {/* Информация о запросе */}
                    {errorStats && (
                        <Card className="max-w-2xl mx-auto">
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                                    🕵️ Детали сканирования
                                </h3>

                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 dark:text-gray-400">Запрошенный путь:</span>
                                        <code className="text-red-600 dark:text-red-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono text-xs">
                                            {errorStats.attemptedPath}
                                        </code>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 dark:text-gray-400">Время обнаружения:</span>
                                        <span className="text-gray-900 dark:text-gray-100">
                                            {new Date(errorStats.timestamp).toLocaleString('ru-RU')}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 dark:text-gray-400">Источник:</span>
                                        <span className="text-gray-900 dark:text-gray-100 truncate max-w-48">
                                            {errorStats.referrer === 'Direct access' ? 'Прямой доступ' : errorStats.referrer}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )}
                </div>

                {/* Поиск */}
                <Card className="max-w-2xl mx-auto">
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                            🔎 Быстрый поиск
                        </h3>

                        <form onSubmit={handleSearch} className="flex gap-3">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Найти раздел или функцию..."
                                className="
                  flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 
                  rounded-lg bg-white dark:bg-gray-800 
                  text-gray-900 dark:text-gray-100
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  placeholder-gray-400 dark:placeholder-gray-500
                "
                            />
                            <Button type="submit" className="px-6">
                                🔍 Найти
                            </Button>
                        </form>
                    </div>
                </Card>

                {/* Быстрая навигация */}
                <div className="space-y-6">
                    <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 text-center">
                        🚀 Быстрый переход
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {quickLinks.map((link) => (
                            <Card
                                key={link.id}
                                className="group hover:shadow-lg transition-all duration-200 cursor-pointer transform hover:-translate-y-1"
                                onClick={() => handleQuickNavigation(link.path, link.title)}
                            >
                                <div className="p-6 text-center">
                                    <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-200">
                                        {link.icon}
                                    </div>

                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                                            {link.title}
                                        </h4>
                                        {link.badge && (
                                            <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                                                {link.badge}
                                            </span>
                                        )}
                                    </div>

                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {link.description}
                                    </p>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Действия */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Button
                        onClick={handleGoBack}
                        variant="outline"
                        className="flex items-center gap-2"
                    >
                        ⬅️ Назад
                    </Button>

                    <Button
                        onClick={handleRedirectHome}
                        className="flex items-center gap-2"
                    >
                        🏠 На главную
                    </Button>

                    {!isAutoRedirect ? (
                        <Button
                            onClick={handleEnableAutoRedirect}
                            variant="outline"
                            className="flex items-center gap-2 text-blue-600 border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        >
                            ⏱️ Автоперенаправление ({timeLeft}с)
                        </Button>
                    ) : (
                        <Button
                            onClick={handleDisableAutoRedirect}
                            variant="outline"
                            className="flex items-center gap-2 text-orange-600 border-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                        >
                            ⏸️ Отменить ({timeLeft}с)
                        </Button>
                    )}
                </div>

                {/* Дополнительные действия */}
                <Card className="max-w-2xl mx-auto">
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                            🛠️ Дополнительные действия
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Button
                                onClick={handleReportError}
                                variant="outline"
                                className="flex items-center gap-2 justify-center"
                            >
                                📝 Сообщить об ошибке
                            </Button>

                            <Button
                                onClick={() => window.location.reload()}
                                variant="outline"
                                className="flex items-center gap-2 justify-center"
                            >
                                🔄 Перезагрузить страницу
                            </Button>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                                Если проблема повторяется, обратитесь к администратору системы
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Системная информация */}
                <div className="text-center text-xs text-gray-500 dark:text-gray-400 space-y-1">
                    <p>IP Roast Security Platform v2.1.0</p>
                    <p>Время: {new Date().toLocaleString('ru-RU')}</p>
                    {isAutoRedirect && timeLeft > 0 && (
                        <p className="text-blue-600 dark:text-blue-400 font-medium">
                            Автоматическое перенаправление через {timeLeft} секунд...
                        </p>
                    )}
                </div>
            </div>

            {/* Дополнительные CSS стили */}
            <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        
        .animation-delay-300 {
          animation-delay: 300ms;
        }
        
        .animation-delay-700 {
          animation-delay: 700ms;
        }
      `}</style>
        </div>
    );
};

export default NotFoundPage;
