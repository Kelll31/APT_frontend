import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

// Компоненты
import { LineChart } from '@/components/charts/LineChart'
import { BarChart } from '@/components/charts/BarChart'
import { PieChart } from '@/components/charts/PieChart'
import { NetworkGraph } from '@/components/charts/NetworkGraph'
import { Button } from '@/components/common/Button'

// Хуки (mock версии)
import { useTheme } from '@/hooks/useTheme'

// Типы
interface DashboardStats {
    totalScans: number
    activeScans: number
    completedScans: number
    totalDevices: number
    totalVulnerabilities: number
    totalReports: number
    uptime: string
    systemStatus: 'healthy' | 'warning' | 'error'
}

interface QuickAction {
    id: string
    title: string
    description: string
    icon: string
    action: () => void
    disabled?: boolean
}

interface RecentScan {
    id: string
    target: string
    status: 'completed' | 'running' | 'failed'
    created_at: string
    vulnerabilities: number
    ports: number
}

interface NetworkDevice {
    id: string
    name: string
    ip: string
    type: 'router' | 'switch' | 'device' | 'server'
    status: 'online' | 'offline' | 'warning'
    os?: string
    lastSeen: string
}

interface SecurityAlert {
    id: string
    type: 'critical' | 'high' | 'medium' | 'low'
    title: string
    description: string
    timestamp: string
    resolved: boolean
}

const HomePage: React.FC = () => {
    // Навигация
    const navigate = useNavigate()

    // Состояние
    const [isLoading, setIsLoading] = useState(true)
    const [currentTime, setCurrentTime] = useState(new Date())
    const [selectedTab, setSelectedTab] = useState<'overview' | 'network' | 'security'>('overview')
    const [quickScanTarget, setQuickScanTarget] = useState('')
    const [isScanning, setIsScanning] = useState(false)
    const [scanProgress, setScanProgress] = useState(0)

    // Хуки
    const { theme } = useTheme()

    // Mock данные
    const dashboardStats: DashboardStats = {
        totalScans: 1247,
        activeScans: 3,
        completedScans: 1244,
        totalDevices: 89,
        totalVulnerabilities: 23,
        totalReports: 156,
        uptime: '15 дней 7 часов',
        systemStatus: 'healthy'
    }

    const recentScans: RecentScan[] = [
        {
            id: '1',
            target: '192.168.1.100-110',
            status: 'completed',
            created_at: '2024-07-11T14:30:00Z',
            vulnerabilities: 5,
            ports: 23
        },
        {
            id: '2',
            target: 'example.com',
            status: 'running',
            created_at: '2024-07-11T15:15:00Z',
            vulnerabilities: 0,
            ports: 8
        },
        {
            id: '3',
            target: '10.0.0.1/24',
            status: 'completed',
            created_at: '2024-07-11T13:45:00Z',
            vulnerabilities: 12,
            ports: 156
        }
    ]

    const networkDevices: NetworkDevice[] = [
        {
            id: '1',
            name: 'Main Router',
            ip: '192.168.1.1',
            type: 'router',
            status: 'online',
            os: 'Linux 5.4',
            lastSeen: '2024-07-11T17:00:00Z'
        },
        {
            id: '2',
            name: 'Web Server',
            ip: '192.168.1.100',
            type: 'server',
            status: 'online',
            os: 'Ubuntu 22.04',
            lastSeen: '2024-07-11T16:58:00Z'
        },
        {
            id: '3',
            name: 'Database Server',
            ip: '192.168.1.101',
            type: 'server',
            status: 'warning',
            os: 'CentOS 8',
            lastSeen: '2024-07-11T16:45:00Z'
        },
        {
            id: '4',
            name: 'Workstation-05',
            ip: '192.168.1.205',
            type: 'device',
            status: 'offline',
            os: 'Windows 11',
            lastSeen: '2024-07-11T12:30:00Z'
        }
    ]

    const securityAlerts: SecurityAlert[] = [
        {
            id: '1',
            type: 'critical',
            title: 'Подозрительная активность на порту 22',
            description: 'Обнаружены множественные попытки SSH подключения с неизвестного IP',
            timestamp: '2024-07-11T16:45:00Z',
            resolved: false
        },
        {
            id: '2',
            type: 'high',
            title: 'Уязвимость Apache 2.4.41',
            description: 'Найдена известная уязвимость в веб-сервере',
            timestamp: '2024-07-11T15:30:00Z',
            resolved: false
        },
        {
            id: '3',
            type: 'medium',
            title: 'Устройство отключилось от сети',
            description: 'Workstation-05 не отвечает на ping запросы',
            timestamp: '2024-07-11T12:30:00Z',
            resolved: true
        }
    ]

    // Данные для графиков
    const scanActivityData = {
        labels: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
        datasets: [{
            label: 'Сканирования',
            data: [12, 19, 3, 5, 2, 3, 9],
            borderColor: 'rgb(16, 185, 129)',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.4
        }]
    }

    const vulnerabilityData = {
        labels: ['Критические', 'Высокие', 'Средние', 'Низкие'],
        datasets: [{
            data: [5, 12, 18, 23],
            backgroundColor: [
                'rgb(239, 68, 68)',
                'rgb(245, 158, 11)',
                'rgb(59, 130, 246)',
                'rgb(34, 197, 94)'
            ]
        }]
    }

    const portUsageData = {
        labels: ['HTTP', 'HTTPS', 'SSH', 'FTP', 'DNS', 'SMTP', 'Другие'],
        datasets: [{
            label: 'Открытые порты',
            data: [45, 78, 23, 12, 34, 8, 67],
            backgroundColor: 'rgba(16, 185, 129, 0.8)',
            borderColor: 'rgb(16, 185, 129)'
        }]
    }

    const networkGraphData = {
        nodes: [
            { id: '1', name: 'Router', type: 'router' as const, ip: '192.168.1.1', status: 'online' as const },
            { id: '2', name: 'Server', type: 'server' as const, ip: '192.168.1.100', status: 'online' as const },
            { id: '3', name: 'DB', type: 'server' as const, ip: '192.168.1.101', status: 'warning' as const },
            { id: '4', name: 'PC-05', type: 'device' as const, ip: '192.168.1.205', status: 'offline' as const }
        ],
        links: [
            { source: '1', target: '2', strength: 5 },
            { source: '1', target: '3', strength: 3 },
            { source: '1', target: '4', strength: 2 }
        ]
    }

    // Быстрые действия
    const quickActions: QuickAction[] = [
        {
            id: 'quick-scan',
            title: 'Быстрое сканирование',
            description: 'Сканирование основных портов',
            icon: '⚡',
            action: () => handleQuickScan(),
            disabled: isScanning
        },
        {
            id: 'network-discovery',
            title: 'Обнаружение сети',
            description: 'Поиск устройств в локальной сети',
            icon: '🗺️',
            action: () => navigate('/recon'),
            disabled: false
        },
        {
            id: 'vulnerability-scan',
            title: 'Поиск уязвимостей',
            description: 'Детальное сканирование безопасности',
            icon: '🔍',
            action: () => navigate('/scanner?profile=vulnerability'),
            disabled: false
        },
        {
            id: 'view-reports',
            title: 'Просмотр отчетов',
            description: 'Анализ результатов сканирования',
            icon: '📊',
            action: () => navigate('/reports'),
            disabled: false
        }
    ]

    // Эффекты
    useEffect(() => {
        // Симуляция загрузки
        const timer = setTimeout(() => {
            setIsLoading(false)
        }, 1500)

        return () => clearTimeout(timer)
    }, [])

    useEffect(() => {
        // Обновление времени каждую секунду
        const timer = setInterval(() => {
            setCurrentTime(new Date())
        }, 1000)

        return () => clearInterval(timer)
    }, [])

    // Симуляция процесса сканирования
    useEffect(() => {
        if (isScanning) {
            const timer = setInterval(() => {
                setScanProgress(prev => {
                    if (prev >= 100) {
                        setIsScanning(false)
                        return 0
                    }
                    return prev + Math.random() * 15
                })
            }, 500)

            return () => clearInterval(timer)
        }
    }, [isScanning])

    // Обработчики
    const handleQuickScan = useCallback(() => {
        if (!quickScanTarget.trim()) return

        setIsScanning(true)
        setScanProgress(0)

        // Симуляция завершения сканирования
        setTimeout(() => {
            setIsScanning(false)
            setScanProgress(0)
            setQuickScanTarget('')
        }, 8000)
    }, [quickScanTarget])

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'online': return 'text-green-400'
            case 'offline': return 'text-red-400'
            case 'warning': return 'text-yellow-400'
            case 'healthy': return 'text-green-400'
            case 'error': return 'text-red-400'
            default: return 'text-gray-400'
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'online': return '🟢'
            case 'offline': return '🔴'
            case 'warning': return '🟡'
            case 'healthy': return '✅'
            case 'error': return '❌'
            default: return '⚪'
        }
    }

    const getAlertColor = (type: string) => {
        switch (type) {
            case 'critical': return 'border-red-500 bg-red-500/10'
            case 'high': return 'border-orange-500 bg-orange-500/10'
            case 'medium': return 'border-yellow-500 bg-yellow-500/10'
            case 'low': return 'border-blue-500 bg-blue-500/10'
            default: return 'border-gray-500 bg-gray-500/10'
        }
    }

    // Рендер загрузки
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <h2 className="text-2xl font-bold text-white mb-2">Загрузка IP Roast</h2>
                    <p className="text-gray-400">Инициализация системы безопасности...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Заголовок */}
            <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white">IP Roast Dashboard</h1>
                        <p className="text-gray-400 mt-1">Профессиональная платформа тестирования безопасности сети</p>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-gray-400">
                            {currentTime.toLocaleString('ru-RU')}
                        </div>
                        <div className="flex items-center mt-1">
                            <span className="text-sm text-gray-400 mr-2">Статус системы:</span>
                            <span className={`text-sm font-medium ${getStatusColor(dashboardStats.systemStatus)}`}>
                                {getStatusIcon(dashboardStats.systemStatus)} {dashboardStats.systemStatus === 'healthy' ? 'Исправна' : 'Проблемы'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Статистика */}
            <div className="p-6 border-b border-gray-700">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                    <div className="bg-gray-800 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-emerald-400">{dashboardStats.totalScans}</div>
                        <div className="text-sm text-gray-400">Всего сканирований</div>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-blue-400">{dashboardStats.activeScans}</div>
                        <div className="text-sm text-gray-400">Активных</div>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-green-400">{dashboardStats.completedScans}</div>
                        <div className="text-sm text-gray-400">Завершено</div>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-purple-400">{dashboardStats.totalDevices}</div>
                        <div className="text-sm text-gray-400">Устройств</div>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-red-400">{dashboardStats.totalVulnerabilities}</div>
                        <div className="text-sm text-gray-400">Уязвимости</div>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-400">{dashboardStats.totalReports}</div>
                        <div className="text-sm text-gray-400">Отчетов</div>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-lg">
                        <div className="text-lg font-bold text-gray-400">{dashboardStats.uptime}</div>
                        <div className="text-sm text-gray-400">Время работы</div>
                    </div>
                </div>
            </div>

            {/* Табы */}
            <div className="border-b border-gray-700">
                <div className="px-6">
                    <div className="flex space-x-8">
                        {[
                            { id: 'overview', label: 'Обзор', icon: '📊' },
                            { id: 'network', label: 'Сеть', icon: '🌐' },
                            { id: 'security', label: 'Безопасность', icon: '🔒' }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setSelectedTab(tab.id as typeof selectedTab)}
                                className={`py-4 px-2 border-b-2 font-medium text-sm ${selectedTab === tab.id
                                        ? 'border-emerald-500 text-emerald-400'
                                        : 'border-transparent text-gray-400 hover:text-gray-300'
                                    }`}
                            >
                                {tab.icon} {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Основной контент */}
            <div className="p-6">
                {selectedTab === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Левая колонка */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Быстрое сканирование */}
                            <div className="bg-gray-800 rounded-lg p-6">
                                <h2 className="text-xl font-bold text-white mb-4">⚡ Быстрое сканирование</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Цель сканирования
                                        </label>
                                        <input
                                            type="text"
                                            value={quickScanTarget}
                                            onChange={(e) => setQuickScanTarget(e.target.value)}
                                            placeholder="192.168.1.1 или example.com"
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-emerald-500 focus:outline-none"
                                            disabled={isScanning}
                                        />
                                    </div>

                                    {isScanning && (
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-300">Прогресс сканирования</span>
                                                <span className="text-emerald-400">{Math.round(scanProgress)}%</span>
                                            </div>
                                            <div className="w-full bg-gray-700 rounded-full h-2">
                                                <div
                                                    className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                                                    style={{ width: `${scanProgress}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    )}

                                    <Button
                                        onClick={handleQuickScan}
                                        disabled={!quickScanTarget.trim() || isScanning}
                                        variant="primary"
                                        className="w-full"
                                    >
                                        {isScanning ? '🔄 Сканирование...' : '🚀 Запустить сканирование'}
                                    </Button>
                                </div>
                            </div>

                            {/* Быстрые действия */}
                            <div className="bg-gray-800 rounded-lg p-6">
                                <h2 className="text-xl font-bold text-white mb-4">🚀 Быстрые действия</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {quickActions.map((action) => (
                                        <button
                                            key={action.id}
                                            onClick={action.action}
                                            disabled={action.disabled}
                                            className="p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left"
                                        >
                                            <div className="text-2xl mb-2">{action.icon}</div>
                                            <div className="font-medium text-white">{action.title}</div>
                                            <div className="text-sm text-gray-400">{action.description}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Графики активности */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-gray-800 rounded-lg p-6">
                                    <h3 className="text-lg font-bold text-white mb-4">Активность сканирования</h3>
                                    <div className="h-64">
                                        <LineChart data={scanActivityData} title="" />
                                    </div>
                                </div>

                                <div className="bg-gray-800 rounded-lg p-6">
                                    <h3 className="text-lg font-bold text-white mb-4">Распределение уязвимостей</h3>
                                    <div className="h-64">
                                        <PieChart data={vulnerabilityData} title="" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Правая колонка */}
                        <div className="space-y-6">
                            {/* Последние сканирования */}
                            <div className="bg-gray-800 rounded-lg p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-bold text-white">🔍 Последние сканирования</h3>
                                    <button
                                        onClick={() => navigate('/scanner')}
                                        className="text-emerald-400 hover:text-emerald-300 text-sm"
                                    >
                                        Все сканирования →
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {recentScans.map((scan) => (
                                        <div key={scan.id} className="p-3 bg-gray-700 rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <div className="font-medium text-white">{scan.target}</div>
                                                <div className={`text-xs px-2 py-1 rounded ${scan.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                                                        scan.status === 'running' ? 'bg-blue-500/20 text-blue-400' :
                                                            'bg-red-500/20 text-red-400'
                                                    }`}>
                                                    {scan.status === 'completed' ? 'Завершено' :
                                                        scan.status === 'running' ? 'Выполняется' : 'Ошибка'}
                                                </div>
                                            </div>
                                            <div className="text-sm text-gray-400 mt-1">
                                                {new Date(scan.created_at).toLocaleString('ru-RU')}
                                            </div>
                                            <div className="text-sm text-gray-400 mt-1">
                                                Уязвимости: {scan.vulnerabilities} | Порты: {scan.ports}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Алерты безопасности */}
                            <div className="bg-gray-800 rounded-lg p-6">
                                <h3 className="text-lg font-bold text-white mb-4">⚠️ Алерты безопасности</h3>
                                <div className="space-y-3">
                                    {securityAlerts.slice(0, 3).map((alert) => (
                                        <div key={alert.id} className={`p-3 rounded-lg border ${getAlertColor(alert.type)}`}>
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="font-medium text-white">{alert.title}</div>
                                                    <div className="text-sm text-gray-400 mt-1">{alert.description}</div>
                                                    <div className="text-xs text-gray-500 mt-2">
                                                        {new Date(alert.timestamp).toLocaleString('ru-RU')}
                                                    </div>
                                                </div>
                                                {alert.resolved && (
                                                    <div className="text-green-400 text-xs">✓ Решено</div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {selectedTab === 'network' && (
                    <div className="space-y-6">
                        {/* Топология сети */}
                        <div className="bg-gray-800 rounded-lg p-6">
                            <h2 className="text-xl font-bold text-white mb-4">🌐 Топология сети</h2>
                            <div className="h-96 bg-gray-700 rounded-lg p-4">
                                <NetworkGraph
                                    nodes={networkGraphData.nodes}
                                    links={networkGraphData.links}
                                    width={800}
                                    height={350}
                                />
                            </div>
                        </div>

                        {/* Список устройств */}
                        <div className="bg-gray-800 rounded-lg p-6">
                            <h2 className="text-xl font-bold text-white mb-4">📱 Обнаруженные устройства</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-700">
                                            <th className="text-left py-2 px-4 text-gray-300">Устройство</th>
                                            <th className="text-left py-2 px-4 text-gray-300">IP адрес</th>
                                            <th className="text-left py-2 px-4 text-gray-300">Тип</th>
                                            <th className="text-left py-2 px-4 text-gray-300">ОС</th>
                                            <th className="text-left py-2 px-4 text-gray-300">Статус</th>
                                            <th className="text-left py-2 px-4 text-gray-300">Последняя активность</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {networkDevices.map((device) => (
                                            <tr key={device.id} className="border-b border-gray-700">
                                                <td className="py-2 px-4 font-medium text-white">{device.name}</td>
                                                <td className="py-2 px-4 text-gray-300">{device.ip}</td>
                                                <td className="py-2 px-4 text-gray-300 capitalize">{device.type}</td>
                                                <td className="py-2 px-4 text-gray-300">{device.os || 'Неизвестно'}</td>
                                                <td className="py-2 px-4">
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${device.status === 'online' ? 'bg-green-500/20 text-green-400' :
                                                            device.status === 'offline' ? 'bg-red-500/20 text-red-400' :
                                                                'bg-yellow-500/20 text-yellow-400'
                                                        }`}>
                                                        {getStatusIcon(device.status)} {device.status}
                                                    </span>
                                                </td>
                                                <td className="py-2 px-4 text-gray-300">
                                                    {new Date(device.lastSeen).toLocaleString('ru-RU')}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Статистика портов */}
                        <div className="bg-gray-800 rounded-lg p-6">
                            <h2 className="text-xl font-bold text-white mb-4">🔌 Использование портов</h2>
                            <div className="h-64">
                                <BarChart data={portUsageData} title="" />
                            </div>
                        </div>
                    </div>
                )}

                {selectedTab === 'security' && (
                    <div className="space-y-6">
                        {/* Все алерты */}
                        <div className="bg-gray-800 rounded-lg p-6">
                            <h2 className="text-xl font-bold text-white mb-4">🔒 Алерты безопасности</h2>
                            <div className="space-y-4">
                                {securityAlerts.map((alert) => (
                                    <div key={alert.id} className={`p-4 rounded-lg border ${getAlertColor(alert.type)}`}>
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2">
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${alert.type === 'critical' ? 'bg-red-500 text-white' :
                                                            alert.type === 'high' ? 'bg-orange-500 text-white' :
                                                                alert.type === 'medium' ? 'bg-yellow-500 text-black' :
                                                                    'bg-blue-500 text-white'
                                                        }`}>
                                                        {alert.type.toUpperCase()}
                                                    </span>
                                                    <span className="font-medium text-white">{alert.title}</span>
                                                </div>
                                                <div className="text-gray-400 mt-2">{alert.description}</div>
                                                <div className="text-xs text-gray-500 mt-2">
                                                    {new Date(alert.timestamp).toLocaleString('ru-RU')}
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                {alert.resolved ? (
                                                    <span className="text-green-400 text-sm">✓ Решено</span>
                                                ) : (
                                                    <button className="text-emerald-400 hover:text-emerald-300 text-sm">
                                                        Решить →
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Статистика безопасности */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-gray-800 p-4 rounded-lg">
                                <div className="text-2xl font-bold text-red-400">5</div>
                                <div className="text-sm text-gray-400">Критические уязвимости</div>
                            </div>
                            <div className="bg-gray-800 p-4 rounded-lg">
                                <div className="text-2xl font-bold text-orange-400">12</div>
                                <div className="text-sm text-gray-400">Высокий риск</div>
                            </div>
                            <div className="bg-gray-800 p-4 rounded-lg">
                                <div className="text-2xl font-bold text-yellow-400">18</div>
                                <div className="text-sm text-gray-400">Средний риск</div>
                            </div>
                            <div className="bg-gray-800 p-4 rounded-lg">
                                <div className="text-2xl font-bold text-blue-400">23</div>
                                <div className="text-sm text-gray-400">Низкий риск</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default HomePage
