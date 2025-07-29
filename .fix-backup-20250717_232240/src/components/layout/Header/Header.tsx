// src/components/layout/Header/Header.tsx
import React from 'react';
import { Navigation } from './Navigation';
import { ThemeToggle } from './ThemeToggle';
import { StatusTooltip } from './StatusTooltip';

export const Header: React.FC = () => {
    return (
        <header className="bg-gray-900 border-b border-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">
                        <h1 className="text-xl font-bold text-white">IP Roast 4.0</h1>
                    </div>
                    <Navigation />
                    <div className="flex items-center space-x-4">
                        <StatusTooltip />
                        <ThemeToggle />
                    </div>
                </div>
            </div>
        </header>
    );
};
