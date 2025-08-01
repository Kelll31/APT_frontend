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
        results.flatMap(r => r.openPorts?.map(p => p.service) || [])
    ).size;

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                    <div className="text-2xl font-bold text-white">{totalHosts}</div>
                    <div className="text-sm text-gray-400">Total Hosts</div>
                </div>
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                    <div className="text-2xl font-bold text-emerald-400">{hostsUp}</div>
                    <div className="text-sm text-gray-400">Hosts Up</div>
                </div>
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-400">{totalPorts}</div>
                    <div className="text-sm text-gray-400">Open Ports</div>
                </div>
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                    <div className="text-2xl font-bold text-purple-400">{uniqueServices}</div>
                    <div className="text-sm text-gray-400">Services</div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center space-x-4">
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
                </div>

                {onExport && (
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-400">Export:</span>
                        <Button size="sm" variant="ghost" onClick={() => onExport('json')}>
                            JSON
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => onExport('csv')}>
                            CSV
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => onExport('xml')}>
                            XML
                        </Button>
                    </div>
                )}
            </div>

            {/* Results List */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg">
                <div className="p-6 border-b border-gray-700">
                    <h3 className="text-lg font-semibold text-white">Scan Results</h3>
                    <p className="text-gray-400 text-sm mt-1">
                        {filteredResults.length} hosts found
                    </p>
                </div>

                <div className="divide-y divide-gray-700">
                    {filteredResults.map((result, index) => (
                        <div key={index} className="p-6">
                            <div
                                className="flex items-center justify-between cursor-pointer"
                                onClick={() => setSelectedHost(selectedHost?.ip === result.ip ? null : result)}
                            >
                                <div className="flex items-center space-x-4">
                                    <div className={`w-3 h-3 rounded-full ${result.status === 'up' ? 'bg-green-400' : 'bg-red-400'
                                        }`} />
                                    <div>
                                        <div className="text-white font-medium">{result.ip}</div>
                                        {result.hostname && (
                                            <div className="text-gray-400 text-sm">{result.hostname}</div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center space-x-4">
                                    {result.openPorts && result.openPorts.length > 0 && (
                                        <span className="text-sm text-emerald-400">
                                            {result.openPorts.length} ports
                                        </span>
                                    )}
                                    {result.os && (
                                        <span className="text-sm text-gray-400">{result.os}</span>
                                    )}
                                    <svg
                                        className={`w-5 h-5 text-gray-400 transition-transform ${selectedHost?.ip === result.ip ? 'rotate-180' : ''
                                            }`}
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                                    </svg>
                                </div>
                            </div>

                            {/* Expanded Details */}
                            {selectedHost?.ip === result.ip && (
                                <div className="mt-6 space-y-4">
                                    {/* Host Information */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="bg-gray-900 p-4 rounded-lg">
                                            <div className="text-sm text-gray-400">Status</div>
                                            <div className={`font-medium ${result.status === 'up' ? 'text-green-400' : 'text-red-400'
                                                }`}>
                                                {result.status.toUpperCase()}
                                            </div>
                                        </div>
                                        {result.latency && (
                                            <div className="bg-gray-900 p-4 rounded-lg">
                                                <div className="text-sm text-gray-400">Latency</div>
                                                <div className="text-white font-medium">{result.latency}ms</div>
                                            </div>
                                        )}
                                        {result.lastSeen && (
                                            <div className="bg-gray-900 p-4 rounded-lg">
                                                <div className="text-sm text-gray-400">Last Seen</div>
                                                <div className="text-white font-medium">
                                                    {new Date(result.lastSeen).toLocaleString()}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Open Ports */}
                                    {result.openPorts && result.openPorts.length > 0 && (
                                        <PortList
                                            ports={result.openPorts}
                                            hostIp={result.ip}
                                        />
                                    )}

                                    {/* OS Information */}
                                    {result.os && (
                                        <div className="bg-gray-900 p-4 rounded-lg">
                                            <div className="text-sm text-gray-400 mb-2">Operating System</div>
                                            <div className="text-white">{result.os}</div>
                                            {result.osAccuracy && (
                                                <div className="text-sm text-gray-400 mt-1">
                                                    Accuracy: {result.osAccuracy}%
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* MAC Address */}
                                    {result.mac && (
                                        <div className="bg-gray-900 p-4 rounded-lg">
                                            <div className="text-sm text-gray-400 mb-2">MAC Address</div>
                                            <div className="text-white font-mono">{result.mac}</div>
                                            {result.vendor && (
                                                <div className="text-sm text-gray-400 mt-1">{result.vendor}</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {filteredResults.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-gray-400 text-lg">No results found</div>
                    <div className="text-gray-500 text-sm mt-2">
                        {filter !== 'all'
                            ? `No hosts match the filter "${filter}"`
                            : 'Run a scan to see results'
                        }
                    </div>
                </div>
            )}
        </div>
    );
};

export default ScanResults;
