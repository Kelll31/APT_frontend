import React, { useState } from 'react';
import { ScanResult } from '../../../types/scanner';
import PortList from './PortList';
import { Button } from '../../common/Button';

interface ScanResultsProps {
    results: ScanResult[];
    onExport?: (format: 'json' | 'csv' | 'xml') => void;
    className?: string;
}

export const ScanResults: React.FC<ScanResultsProps> = ({
    results,
    onExport,
    className = ''
}) => {
    const [selectedHost, setSelectedHost] = useState<ScanResult | null>(null);
    const [filter, setFilter] = useState('all');

    const filteredResults = results.filter(result => {
        if (filter === 'all') return true;
        if (filter === 'up') return result.status === 'up';
        if (filter === 'down') return result.status === 'down';
        if (filter === 'ports') return result.openPorts && result.openPorts.length > 0;
        return true;
    });

    const totalHosts = results.length;
    const hostsUp = results.filter(r => r.status === 'up').length;
    const totalPorts = results.reduce((sum, r) => sum + (r.openPorts?.length || 0), 0);
    const uniqueServices = new Set(
        results.flatMap(r => r.openPorts?.map(p => p.service?.name).filter(Boolean) || [])
    ).size;

    // Функция для безопасного отображения информации об ОС
    const renderOSInfo = (result: ScanResult) => {
        if (!result.os) return 'Unknown';

        const osInfo = result.os;
        const parts = [];

        if (osInfo.name) parts.push(osInfo.name);
        if (osInfo.family && osInfo.family !== osInfo.name) parts.push(`(${osInfo.family})`);
        if (osInfo.vendor && osInfo.vendor !== osInfo.name) parts.push(`- ${osInfo.vendor}`);

        return parts.join(' ') || 'Unknown OS';
    };

    // Функция для получения точности определения ОС
    const getOSAccuracy = (result: ScanResult): number => {
        return result.os?.accuracy || 0;
    };

    return (
        <div className={`scan-results ${className}`}>
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-800 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-white">{totalHosts}</div>
                    <div className="text-gray-300 text-sm">Total Hosts</div>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-emerald-400">{hostsUp}</div>
                    <div className="text-gray-300 text-sm">Hosts Up</div>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-400">{totalPorts}</div>
                    <div className="text-gray-300 text-sm">Open Ports</div>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-400">{uniqueServices}</div>
                    <div className="text-gray-300 text-sm">Services</div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center justify-between mb-4 gap-4">
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                    <option value="all">All Hosts ({totalHosts})</option>
                    <option value="up">Online Hosts ({hostsUp})</option>
                    <option value="down">Offline Hosts ({totalHosts - hostsUp})</option>
                    <option value="ports">Hosts with Ports ({results.filter(r => r.openPorts?.length).length})</option>
                </select>

                {onExport && (
                    <div className="flex items-center space-x-2">
                        <span className="text-gray-300 text-sm">Export:</span>
                        <Button size="sm" variant="secondary" onClick={() => onExport('json')}>
                            JSON
                        </Button>
                        <Button size="sm" variant="secondary" onClick={() => onExport('csv')}>
                            CSV
                        </Button>
                        <Button size="sm" variant="secondary" onClick={() => onExport('xml')}>
                            XML
                        </Button>
                    </div>
                )}
            </div>

            {/* Results List */}
            <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Scan Results</h3>
                    <span className="text-gray-300 text-sm">{filteredResults.length} hosts found</span>
                </div>

                <div className="space-y-2">
                    {filteredResults.map((result, index) => (
                        <div
                            key={result.id || index}
                            className="border border-gray-700 rounded-lg p-4 hover:bg-gray-750 transition-colors"
                        >
                            <div
                                className="flex items-center justify-between cursor-pointer"
                                onClick={() => setSelectedHost(selectedHost?.id === result.id ? null : result)}
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="text-white font-medium">{result.ip}</div>
                                    {result.hostname && (
                                        <div className="text-gray-400 text-sm">({result.hostname})</div>
                                    )}
                                    <div className={`px-2 py-1 rounded-full text-xs ${result.status === 'up'
                                            ? 'bg-emerald-100 text-emerald-800'
                                            : 'bg-red-100 text-red-800'
                                        }`}>
                                        {result.status.toUpperCase()}
                                    </div>
                                </div>

                                <div className="flex items-center space-x-4">
                                    {result.openPorts && result.openPorts.length > 0 && (
                                        <div className="text-blue-400 text-sm">{result.openPorts.length} ports</div>
                                    )}
                                    {result.os && (
                                        <div className="text-purple-400 text-sm">
                                            {renderOSInfo(result)}
                                        </div>
                                    )}
                                    <div className="text-gray-400">
                                        {selectedHost?.id === result.id ? '▲' : '▼'}
                                    </div>
                                </div>
                            </div>

                            {/* Expanded Details */}
                            {selectedHost?.id === result.id && (
                                <div className="mt-4 border-t border-gray-700 pt-4 space-y-4">
                                    {/* Host Information */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <div className="text-gray-400 text-sm">Status</div>
                                            <div className="text-white">{result.status.toUpperCase()}</div>
                                        </div>
                                        {result.latency && (
                                            <div>
                                                <div className="text-gray-400 text-sm">Latency</div>
                                                <div className="text-white">{result.latency}ms</div>
                                            </div>
                                        )}
                                        {result.lastSeen && (
                                            <div>
                                                <div className="text-gray-400 text-sm">Last Seen</div>
                                                <div className="text-white">{new Date(result.lastSeen).toLocaleString()}</div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Open Ports */}
                                    {result.openPorts && result.openPorts.length > 0 && (
                                        <div>
                                            <h4 className="text-white font-medium mb-2">Open Ports</h4>
                                            <PortList ports={result.openPorts} className="bg-gray-900 rounded-lg" />
                                        </div>
                                    )}

                                    {/* OS Information */}
                                    {result.os && (
                                        <div>
                                            <h4 className="text-white font-medium mb-2">Operating System</h4>
                                            <div className="bg-gray-900 rounded-lg p-3">
                                                <div className="text-white">{renderOSInfo(result)}</div>
                                                {getOSAccuracy(result) > 0 && (
                                                    <div className="text-gray-400 text-sm mt-1">
                                                        Accuracy: {getOSAccuracy(result)}%
                                                    </div>
                                                )}
                                                {result.os.type && (
                                                    <div className="text-gray-400 text-sm">
                                                        Device Type: {result.os.type}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* MAC Address */}
                                    {result.mac && (
                                        <div>
                                            <h4 className="text-white font-medium mb-2">MAC Address</h4>
                                            <div className="bg-gray-900 rounded-lg p-3">
                                                <div className="text-white font-mono">{result.mac}</div>
                                                {result.vendor && (
                                                    <div className="text-gray-400 text-sm mt-1">{result.vendor}</div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {filteredResults.length === 0 && (
                    <div className="text-center py-8">
                        <div className="text-gray-400 text-lg mb-2">No results found</div>
                        <p className="text-gray-500">
                            {filter !== 'all'
                                ? `No hosts match the filter "${filter}"`
                                : 'Run a scan to see results'
                            }
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ScanResults;
