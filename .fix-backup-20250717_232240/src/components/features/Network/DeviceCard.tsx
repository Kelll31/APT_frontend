import React from 'react';
import { NetworkDevice } from '../../../types/network';

interface DeviceCardProps {
    device: NetworkDevice;
    onClick?: () => void;
    className?: string;
}

export const DeviceCard: React.FC<DeviceCardProps> = ({
    device,
    onClick,
    className = ''
}) => {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'online': return 'text-green-400 bg-green-400/10';
            case 'offline': return 'text-red-400 bg-red-400/10';
            case 'warning': return 'text-yellow-400 bg-yellow-400/10';
            default: return 'text-gray-400 bg-gray-400/10';
        }
    };

    const getDeviceIcon = (type: string) => {
        switch (type) {
            case 'router':
                return (
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                    </svg>
                );
            case 'server':
                return (
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h10a2 2 0 002-2v-2a2 2 0 00-2-2H5z" />
                    </svg>
                );
            default:
                return (
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                    </svg>
                );
        }
    };

    return (
        <div
            className={`
        bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-gray-600 
        transition-all duration-200 cursor-pointer ${className}
      `}
            onClick={onClick}
        >
            <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                    <div className="text-gray-400">
                        {getDeviceIcon(device.type)}
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">{device.name}</h3>
                        <p className="text-sm text-gray-400">{device.ip}</p>
                    </div>
                </div>

                <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(device.status)}`}>
                    {device.status.toUpperCase()}
                </div>
            </div>

            <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-400">MAC:</span>
                    <span className="text-gray-300">{device.mac || 'Unknown'}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Vendor:</span>
                    <span className="text-gray-300">{device.vendor || 'Unknown'}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Last Seen:</span>
                    <span className="text-gray-300">
                        {device.lastSeen ? new Date(device.lastSeen).toLocaleString() : 'Never'}
                    </span>
                </div>
            </div>

            {device.openPorts && device.openPorts.length > 0 && (
                <div className="mt-4">
                    <span className="text-sm text-gray-400">Open Ports:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                        {device.openPorts.slice(0, 5).map((port, index) => (
                            <span
                                key={index}
                                className="px-2 py-1 text-xs bg-emerald-400/10 text-emerald-400 rounded"
                            >
                                {port}
                            </span>
                        ))}
                        {device.openPorts.length > 5 && (
                            <span className="px-2 py-1 text-xs bg-gray-600 text-gray-300 rounded">
                                +{device.openPorts.length - 5} more
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DeviceCard;
