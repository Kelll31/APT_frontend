import React, { useState } from 'react';
import { OpenPort } from '../../../types/scanner';

interface PortListProps {
    ports: OpenPort[];
    hostIp?: string;
    className?: string;
}

export const PortList: React.FC<PortListProps> = ({ ports, hostIp, className = '' }) => {
    const [sortBy, setSortBy] = useState<'port' | 'service' | 'state'>('port');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [filter, setFilter] = useState('');

    const getServiceColor = (service: string) => {
        const commonServices: { [key: string]: string } = {
            'http': 'text-blue-400',
            'https': 'text-green-400',
            'ssh': 'text-purple-400',
            'ftp': 'text-yellow-400',
            'smtp': 'text-red-400',
            'dns': 'text-indigo-400',
            'mysql': 'text-orange-400',
            'postgresql': 'text-pink-400',
        };
        return commonServices[service.toLowerCase()] || 'text-gray-400';
    };

    const getRiskLevel = (port: OpenPort) => {
        const highRiskPorts = [21, 23, 53, 135, 137, 138, 139, 445, 1433, 1521, 3389];
        const mediumRiskPorts = [25, 110, 143, 993, 995, 3306, 5432];

        if (highRiskPorts.includes(port.port)) return 'high';
        if (mediumRiskPorts.includes(port.port)) return 'medium';
        return 'low';
    };

    const getRiskColor = (risk: string) => {
        switch (risk) {
            case 'high': return 'bg-red-500/10 text-red-400 border-red-500/20';
            case 'medium': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
            case 'low': return 'bg-green-500/10 text-green-400 border-green-500/20';
            default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
        }
    };

    const sortedPorts = [...ports]
        .filter(port =>
            !filter ||
            port.port.toString().includes(filter) ||
            port.service.toLowerCase().includes(filter.toLowerCase()) ||
            port.version?.toLowerCase().includes(filter.toLowerCase())
        )
        .sort((a, b) => {
            let comparison = 0;

            switch (sortBy) {
                case 'port':
                    comparison = a.port - b.port;
                    break;
                case 'service':
                    comparison = a.service.localeCompare(b.service);
                    break;
                case 'state':
                    comparison = a.state.localeCompare(b.state);
                    break;
            }

            return sortOrder === 'asc' ? comparison : -comparison;
        });

    const handleSort = (field: 'port' | 'service' | 'state') => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    return (
        <div className={`bg-gray-800 border border-gray-700 rounded-lg ${className}`}>
            <div className="p-6 border-b border-gray-700">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h3 className="text-lg font-semibold text-white">Open Ports</h3>
                        {hostIp && (
                            <p className="text-gray-400 text-sm mt-1">{hostIp} - {ports.length} ports found</p>
                        )}
                    </div>

                    <div className="flex items-center space-x-3">
                        <input
                            type="text"
                            placeholder="Filter ports..."
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-1 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-900">
                        <tr>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white"
                                onClick={() => handleSort('port')}
                            >
                                <div className="flex items-center space-x-1">
                                    <span>Port</span>
                                    {sortBy === 'port' && (
                                        <svg className={`w-4 h-4 ${sortOrder === 'asc' ? '' : 'rotate-180'}`} fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                                        </svg>
                                    )}
                                </div>
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white"
                                onClick={() => handleSort('service')}
                            >
                                <div className="flex items-center space-x-1">
                                    <span>Service</span>
                                    {sortBy === 'service' && (
                                        <svg className={`w-4 h-4 ${sortOrder === 'asc' ? '' : 'rotate-180'}`} fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                                        </svg>
                                    )}
                                </div>
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white"
                                onClick={() => handleSort('state')}
                            >
                                <div className="flex items-center space-x-1">
                                    <span>State</span>
                                    {sortBy === 'state' && (
                                        <svg className={`w-4 h-4 ${sortOrder === 'asc' ? '' : 'rotate-180'}`} fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                                        </svg>
                                    )}
                                </div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Version
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Risk
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {sortedPorts.map((port, index) => {
                            const risk = getRiskLevel(port);
                            return (
                                <tr key={index} className="hover:bg-gray-700/50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <span className="text-white font-mono">{port.port}</span>
                                            <span className="text-gray-400 ml-2">/{port.protocol}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`font-medium ${getServiceColor(port.service)}`}>
                                            {port.service}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs rounded-full ${port.state === 'open'
                                                ? 'bg-green-500/10 text-green-400'
                                                : 'bg-red-500/10 text-red-400'
                                            }`}>
                                            {port.state}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-400">
                                        {port.version || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs rounded border ${getRiskColor(risk)}`}>
                                            {risk.toUpperCase()}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {sortedPorts.length === 0 && (
                <div className="p-6 text-center">
                    <div className="text-gray-400">
                        {filter ? 'No ports match the filter' : 'No open ports found'}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PortList;
