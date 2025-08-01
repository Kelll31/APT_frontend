import React, { useState } from 'react';
import { NetworkDevice } from '../../../types/network';
import DeviceCard from './DeviceCard';
import NetworkMap from './NetworkMap';

interface TopologyViewProps {
    devices: NetworkDevice[];
    loading?: boolean;
    onRefresh?: () => void;
}

export const TopologyView: React.FC<TopologyViewProps> = ({
    devices,
    loading = false,
    onRefresh,
}) => {
    const [view, setView] = useState<'map' | 'grid'>('map');
    const [filter, setFilter] = useState<string>('all');

    const filteredDevices = devices.filter(device => {
        if (filter === 'all') return true;
        return device.status === filter;
    });

    return (
        <div className="space-y-6">
            {/* Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center space-x-4">
                    <div className="flex bg-gray-800 rounded-lg p-1">
                        <button
                            onClick={() => setView('map')}
                            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${view === 'map'
                                    ? 'bg-emerald-600 text-white'
                                    : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            Map View
                        </button>
                        <button
                            onClick={() => setView('grid')}
                            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${view === 'grid'
                                    ? 'bg-emerald-600 text-white'
                                    : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            Grid View
                        </button>
                    </div>

                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                        <option value="all">All Devices</option>
                        <option value="online">Online Only</option>
                        <option value="offline">Offline Only</option>
                        <option value="warning">Warning Only</option>
                    </select>
                </div>

                <div className="flex items-center space-x-3">
                    <div className="text-sm text-gray-400">
                        {filteredDevices.length} of {devices.length} devices
                    </div>
                    <button
                        onClick={onRefresh}
                        disabled={loading}
                        className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                        {loading ? (
                            <div className="flex items-center">
                                <svg className="animate-spin w-4 h-4 mr-2" viewBox="0 0 24 24">
                                    <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="4" opacity="0.25" />
                                    <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Scanning...
                            </div>
                        ) : (
                            'Refresh'
                        )}
                    </button>
                </div>
            </div>

            {/* Content */}
            {view === 'map' ? (
                <NetworkMap devices={filteredDevices} />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDevices.map((device) => (
                        <DeviceCard
                            key={device.id}
                            device={device}
                            onClick={() => {
                                // Handle device selection
                                console.log('Device selected:', device);
                            }}
                        />
                    ))}
                </div>
            )}

            {filteredDevices.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-gray-400 text-lg">No devices found</div>
                    <div className="text-gray-500 text-sm mt-2">
                        {filter !== 'all'
                            ? `No devices with status "${filter}"`
                            : 'Run a network scan to discover devices'
                        }
                    </div>
                </div>
            )}
        </div>
    );
};

export default TopologyView;
