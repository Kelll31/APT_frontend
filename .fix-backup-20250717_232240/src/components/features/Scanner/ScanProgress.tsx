import React from 'react';
import { ScanProgress as ScanProgressType } from '../../../types/scanner';

interface ScanProgressProps {
    progress: ScanProgressType;
    onCancel?: () => void;
}

export const ScanProgress: React.FC<ScanProgressProps> = ({ progress, onCancel }) => {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'running': return 'text-blue-400';
            case 'completed': return 'text-green-400';
            case 'cancelled': return 'text-yellow-400';
            case 'failed': return 'text-red-400';
            default: return 'text-gray-400';
        }
    };

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}h ${minutes}m ${secs}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${secs}s`;
        } else {
            return `${secs}s`;
        }
    };

    return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Scan Progress</h3>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(progress.status)} bg-gray-700`}>
                    {progress.status.toUpperCase()}
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                    <span>Overall Progress</span>
                    <span>{Math.round(progress.percentage)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                        className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${progress.percentage}%` }}
                    />
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-900 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-white">{progress.hostsScanned}</div>
                    <div className="text-xs text-gray-400">Hosts Scanned</div>
                </div>
                <div className="bg-gray-900 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-emerald-400">{progress.hostsUp}</div>
                    <div className="text-xs text-gray-400">Hosts Up</div>
                </div>
                <div className="bg-gray-900 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-blue-400">{progress.openPorts}</div>
                    <div className="text-xs text-gray-400">Open Ports</div>
                </div>
                <div className="bg-gray-900 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-400">{progress.vulnerabilities}</div>
                    <div className="text-xs text-gray-400">Vulnerabilities</div>
                </div>
            </div>

            {/* Time Information */}
            <div className="flex justify-between items-center mb-4">
                <div className="text-sm text-gray-400">
                    <span>Elapsed: </span>
                    <span className="text-white">{formatTime(progress.elapsedTime)}</span>
                </div>
                {progress.estimatedTime && (
                    <div className="text-sm text-gray-400">
                        <span>ETA: </span>
                        <span className="text-white">{formatTime(progress.estimatedTime)}</span>
                    </div>
                )}
            </div>

            {/* Current Activity */}
            {progress.currentHost && (
                <div className="mb-4">
                    <div className="text-sm text-gray-400 mb-1">Currently scanning:</div>
                    <div className="text-white font-mono">{progress.currentHost}</div>
                    {progress.currentActivity && (
                        <div className="text-sm text-gray-500">{progress.currentActivity}</div>
                    )}
                </div>
            )}

            {/* Recent Discoveries */}
            {progress.recentDiscoveries && progress.recentDiscoveries.length > 0 && (
                <div className="mb-4">
                    <div className="text-sm text-gray-400 mb-2">Recent Discoveries:</div>
                    <div className="bg-gray-900 rounded-lg p-3 max-h-32 overflow-y-auto">
                        {progress.recentDiscoveries.slice(-5).map((discovery, index) => (
                            <div key={index} className="text-sm text-gray-300 mb-1">
                                <span className="text-emerald-400">{discovery.host}</span>
                                <span className="text-gray-500"> - </span>
                                <span>{discovery.description}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Controls */}
            <div className="flex space-x-3">
                {progress.status === 'running' && onCancel && (
                    <button
                        onClick={onCancel}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                        Cancel Scan
                    </button>
                )}

                {(progress.status === 'completed' || progress.status === 'failed') && (
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                        New Scan
                    </button>
                )}
            </div>
        </div>
    );
};

export default ScanProgress;
