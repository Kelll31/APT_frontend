// src/components/layout/Layout.tsx
import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ErrorBoundary } from 'react-error-boundary';
import clsx from 'clsx';

import { Header } from './Header';
import { useTheme } from '@/hooks/useTheme';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorFallback } from '@/components/common/ErrorFallback';

interface LayoutProps {
    children?: React.ReactNode;
    className?: string;
    showHeader?: boolean;
    headerFixed?: boolean;
    contentPadding?: boolean;
}

const Layout: React.FC<LayoutProps> = ({
    children,
    className,
    showHeader = true,
    headerFixed = true,
    contentPadding = true
}) => {
    const { isDark } = useTheme();

    return (
        <div className={clsx(
            'min-h-screen transition-colors duration-300',
            isDark
                ? 'bg-gray-900 text-white'
                : 'bg-gray-50 text-gray-900',
            className
        )}>
            {/* Header */}
            {showHeader && (
                <Header fixed={headerFixed} />
            )}

            {/* Main Content */}
            <main className={clsx(
                'flex-1',
                headerFixed && showHeader && 'pt-16',
                contentPadding && 'container mx-auto px-4 sm:px-6 lg:px-8 py-8'
            )}>
                <ErrorBoundary
                    FallbackComponent={ErrorFallback}
                    onReset={() => window.location.reload()}
                >
                    <Suspense
                        fallback={
                            <div className="flex items-center justify-center min-h-[50vh]">
                                <LoadingSpinner size="lg" />
                            </div>
                        }
                    >
                        {children || <Outlet />}
                    </Suspense>
                </ErrorBoundary>
            </main>

            {/* Toast Notifications */}
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    className: clsx(
                        'font-medium text-sm',
                        isDark
                            ? 'bg-gray-800 text-white border-gray-700'
                            : 'bg-white text-gray-900 border-gray-200'
                    ),
                    style: {
                        borderWidth: '1px',
                        borderRadius: '0.5rem',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                    },
                    success: {
                        iconTheme: {
                            primary: '#10b981',
                            secondary: '#ffffff'
                        }
                    },
                    error: {
                        iconTheme: {
                            primary: '#ef4444',
                            secondary: '#ffffff'
                        }
                    }
                }}
            />
        </div>
    );
};

export default Layout;
