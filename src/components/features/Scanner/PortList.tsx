import React, { useState, useMemo } from 'react';
import { OpenPort, ServiceDetection } from '../../../types/scanner';

interface PortListProps {
    ports: OpenPort[];
    hostIp?: string;
    className?: string;
}

export const PortList: React.FC<PortListProps> = ({ ports, className = '' }) => {
    const [sortBy, setSortBy] = useState<'port' | 'service' | 'version'>('port');
    const [filterText, setFilterText] = useState('');

    // Функция для получения имени сервиса как строки
    const getServiceName = (service: ServiceDetection | undefined): string => {
        return service?.name || 'unknown';
    };

    // Функция для получения версии как строки
    const getServiceVersion = (port: OpenPort): string => {
        return port.service?.version || port.version || '';
    };

    // Сортированные и отфильтрованные порты
    const sortedPorts = useMemo(() => {
        let filtered = ports.filter(port => {
            const serviceName = getServiceName(port.service).toLowerCase();
            const version = getServiceVersion(port).toLowerCase();
            const portNum = port.port.toString();
            const searchText = filterText.toLowerCase();

            return serviceName.includes(searchText) ||
                version.includes(searchText) ||
                portNum.includes(searchText);
        });

        return filtered.sort((a, b) => {
            switch (sortBy) {
                case 'port':
                    return a.port - b.port;
                case 'service':
                    return getServiceName(a.service).localeCompare(getServiceName(b.service));
                case 'version':
                    return getServiceVersion(a).localeCompare(getServiceVersion(b));
                default:
                    return 0;
            }
        });
    }, [ports, sortBy, filterText]);

    return (
        <div className={`port-list ${className}`}>
            {/* Поиск и сортировка */}
            <div className="flex items-center justify-between mb-4">
                <input
                    type="text"
                    placeholder="Поиск по портам, сервисам, версиям..."
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="port">Сортировка по порту</option>
                    <option value="service">Сортировка по сервису</option>
                    <option value="version">Сортировка по версии</option>
                </select>
            </div>

            {/* Таблица портов */}
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Порт
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Протокол
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Сервис
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Версия
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Состояние
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {sortedPorts.map((port, index) => (
                            <tr key={`${port.port}-${port.protocol}-${index}`}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {port.port}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {port.protocol.toUpperCase()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                        {getServiceName(port.service)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {getServiceVersion(port)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${port.state === 'open'
                                        ? 'bg-green-100 text-green-800'
                                        : port.state === 'closed'
                                            ? 'bg-red-100 text-red-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {port.state}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Пустое состояние */}
            {sortedPorts.length === 0 && (
                <div className="text-center py-8">
                    <p className="text-gray-500">
                        {filterText ? 'Порты не найдены по заданному фильтру' : 'Открытые порты не обнаружены'}
                    </p>
                </div>
            )}
        </div>
    );
};

export default PortList;
