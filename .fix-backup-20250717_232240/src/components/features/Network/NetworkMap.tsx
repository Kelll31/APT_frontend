import React, { useState, useEffect } from 'react';
import NetworkGraph from '../../charts/NetworkGraph';
import { NetworkDevice } from '../../../types/network';
import { useNetwork } from '../../../hooks/useNetwork';

interface NetworkMapProps {
    devices: NetworkDevice[];
    className?: string;
}

export const NetworkMap: React.FC<NetworkMapProps> = ({ devices, className = '' }) => {
    const [selectedDevice, setSelectedDevice] = useState<NetworkDevice | null>(null);
    const { getNetworkTopology } = useNetwork();

    const nodes = devices.map(device => ({
        id: device.id,
        name: device.name,
        type: device.type as 'router' | 'switch' | 'device' | 'server',
        ip: device.ip,
        status: device.status as 'online' | 'offline' | 'warning',
    }));

    const links = getNetworkTopology(devices).map(link => ({
        source: link.sourceId,
        target: link.targetId,
        strength: link.strength || 1,
    }));

    return (
        <div className={`bg-gray-800 border border-gray-700 rounded-lg ${className}`}>
            <div className="p-6 border-b border-gray-700">
                <h2 className="text-xl font-semibold text-white">Network Topology</h2>
                <p className="text-gray-400 mt-1">Interactive network map showing device connections</p>
            </div>

            <div className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1">
                        <NetworkGraph
                            nodes={nodes}
                            links={links}
                            width={800}
                            height={500}
                        />
                    </div>

                    <div className="w-full lg:w-80">
                        <h3 className="text-lg font-medium text-white mb-4">Network Statistics</h3>

                        <div className="space-y-4">
                            <div className="bg-gray-900 p-4 rounded-lg">
                                <div className="text-2xl font-bold text-emerald-400">
                                    {devices.filter(d => d.status === 'online').length}
                                </div>
                                <div className="text-sm text-gray-400">Online Devices</div>
                            </div>

                            <div className="bg-gray-900 p-4 rounded-lg">
                                <div className="text-2xl font-bold text-red-400">
                                    {devices.filter(d => d.status === 'offline').length}
                                </div>
                                <div className="text-sm text-gray-400">Offline Devices</div>
                            </div>

                            <div className="bg-gray-900 p-4 rounded-lg">
                                <div className="text-2xl font-bold text-yellow-400">
                                    {devices.filter(d => d.status === 'warning').length}
                                </div>
                                <div className="text-sm text-gray-400">Warning Status</div>
                            </div>

                            <div className="bg-gray-900 p-4 rounded-lg">
                                <div className="text-2xl font-bold text-blue-400">
                                    {links.length}
                                </div>
                                <div className="text-sm text-gray-400">Network Links</div>
                            </div>
                        </div>

                        <div className="mt-6">
                            <h4 className="text-md font-medium text-white mb-3">Device Types</h4>
                            <div className="space-y-2">
                                {['router', 'switch', 'server', 'device'].map(type => {
                                    const count = devices.filter(d => d.type === type).length;
                                    return (
                                        <div key={type} className="flex justify-between text-sm">
                                            <span className="text-gray-400 capitalize">{type}s:</span>
                                            <span className="text-gray-300">{count}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NetworkMap;
