import React, { useState } from 'react';
import { Button } from '../../common/Button';
import { ScanRequest } from '../../../types/scanner';

interface ScanFormProps {
    onSubmit: (scanData: ScanRequest) => void;
    loading?: boolean;
}

export const ScanForm: React.FC<ScanFormProps> = ({ onSubmit, loading = false }) => {
    const [formData, setFormData] = useState<ScanRequest>({
        targets: '',
        scanType: 'quick',
        ports: '',
        aggressive: false,
        osDetection: false,
        serviceDetection: false,
        scripts: false,
        timing: 'normal',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const handleInputChange = (field: keyof ScanRequest, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-gray-900 p-6 rounded-lg">
            {/* Target Input */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Target Hosts *
                </label>
                <textarea
                    value={formData.targets}
                    onChange={(e) => handleInputChange('targets', e.target.value)}
                    placeholder="192.168.1.0/24&#10;example.com&#10;10.0.0.1-10.0.0.100"
                    rows={4}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                />
                <p className="text-xs text-gray-500 mt-1">
                    Enter IP addresses, CIDR ranges, hostnames, or IP ranges (one per line)
                </p>
            </div>

            {/* Scan Type */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Scan Type
                </label>
                <select
                    value={formData.scanType}
                    onChange={(e) => handleInputChange('scanType', e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                    <option value="quick">Quick Scan (Top 1000 ports)</option>
                    <option value="comprehensive">Comprehensive Scan (All 65535 ports)</option>
                    <option value="custom">Custom Port Range</option>
                    <option value="stealth">Stealth Scan (SYN)</option>
                    <option value="udp">UDP Scan</option>
                    <option value="ping">Ping Scan Only</option>
                </select>
            </div>

            {/* Custom Ports */}
            {formData.scanType === 'custom' && (
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Port Range
                    </label>
                    <input
                        type="text"
                        value={formData.ports}
                        onChange={(e) => handleInputChange('ports', e.target.value)}
                        placeholder="80,443,22,21-25,8000-9000"
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Specify ports (e.g., 80,443,22 or 1-1000)
                    </p>
                </div>
            )}

            {/* Timing */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Scan Timing
                </label>
                <select
                    value={formData.timing}
                    onChange={(e) => handleInputChange('timing', e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                    <option value="paranoid">Paranoid (Very Slow, Stealthy)</option>
                    <option value="sneaky">Sneaky (Slow, Stealthy)</option>
                    <option value="polite">Polite (Slow)</option>
                    <option value="normal">Normal (Default)</option>
                    <option value="aggressive">Aggressive (Fast)</option>
                    <option value="insane">Insane (Very Fast)</option>
                </select>
            </div>

            {/* Advanced Options */}
            <div>
                <h3 className="text-sm font-medium text-gray-300 mb-3">Advanced Options</h3>
                <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={formData.aggressive}
                            onChange={(e) => handleInputChange('aggressive', e.target.checked)}
                            className="form-checkbox bg-gray-800 border-gray-700 text-emerald-600 rounded focus:ring-emerald-500"
                        />
                        <span className="text-sm text-gray-300">
                            Aggressive Scan (Enable OS detection, version detection, script scanning)
                        </span>
                    </label>

                    <label className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={formData.osDetection}
                            onChange={(e) => handleInputChange('osDetection', e.target.checked)}
                            className="form-checkbox bg-gray-800 border-gray-700 text-emerald-600 rounded focus:ring-emerald-500"
                        />
                        <span className="text-sm text-gray-300">OS Detection (-O)</span>
                    </label>

                    <label className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={formData.serviceDetection}
                            onChange={(e) => handleInputChange('serviceDetection', e.target.checked)}
                            className="form-checkbox bg-gray-800 border-gray-700 text-emerald-600 rounded focus:ring-emerald-500"
                        />
                        <span className="text-sm text-gray-300">Service Version Detection (-sV)</span>
                    </label>

                    <label className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={formData.scripts}
                            onChange={(e) => handleInputChange('scripts', e.target.checked)}
                            className="form-checkbox bg-gray-800 border-gray-700 text-emerald-600 rounded focus:ring-emerald-500"
                        />
                        <span className="text-sm text-gray-300">Default NSE Scripts (-sC)</span>
                    </label>
                </div>
            </div>

            {/* Submit Button */}
            <div className="flex space-x-4">
                <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
                >
                    {loading ? 'Starting Scan...' : 'Start Scan'}
                </Button>

                <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                        setFormData({
                            targets: '',
                            scanType: 'quick',
                            ports: '',
                            aggressive: false,
                            osDetection: false,
                            serviceDetection: false,
                            scripts: false,
                            timing: 'normal',
                        });
                    }}
                >
                    Reset
                </Button>
            </div>
        </form>
    );
};

export default ScanForm;
