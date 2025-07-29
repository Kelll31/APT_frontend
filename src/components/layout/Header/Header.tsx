// src/components/layout/Header/Header.tsx
import React, { useState, useEffect } from 'react';
import { Shield, Menu, X } from 'lucide-react';
import clsx from 'clsx';

import { Navigation } from './Navigation';
import { ThemeToggle } from './ThemeToggle';
import { StatusTooltip } from './StatusTooltip';
import { useTheme } from '@/hooks/useTheme';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import styles from './Header.module.css';

interface HeaderProps {
    className?: string;
    fixed?: boolean;
    showNavigation?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
    className,
    fixed = true,
    showNavigation = true
}) => {
    const { isDark } = useTheme();
    const { status, isConnected } = useConnectionStatus();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Close mobile menu on resize
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setIsMobileMenuOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isMobileMenuOpen]);

    const getStatusConfig = () => {
        switch (status) {
            case 'connected':
                return {
                    text: 'Online',
                    className: styles.statusOnline,
                    dotColor: 'bg-emerald-400'
                };
            case 'connecting':
                return {
                    text: 'Connecting',
                    className: styles.statusConnecting,
                    dotColor: 'bg-yellow-400'
                };
            case 'disconnected':
            default:
                return {
                    text: 'Offline',
                    className: styles.statusOffline,
                    dotColor: 'bg-red-400'
                };
        }
    };

    const statusConfig = getStatusConfig();

    return (
        <>
            <header
                className={clsx(
                    styles.header,
                    !isDark && styles.headerLight,
                    isDark ? styles.headerGradient : styles.headerGradientLight,
                    fixed && 'sticky top-0',
                    className
                )}
            >
                <div className={styles.headerContainer}>
                    <div className={styles.headerContent}>
                        {/* Logo Section */}
                        <div className={styles.logo}>
                            <Shield className={styles.logoIcon} />
                            <div className="flex flex-col">
                                <h1 className={clsx(
                                    styles.logoText,
                                    !isDark && styles.logoTextLight
                                )}>
                                    IP Roast
                                </h1>
                                <span className={clsx(
                                    styles.logoSubtext,
                                    !isDark && styles.logoSubtextLight
                                )}>
                                    Enterprise
                                </span>
                            </div>
                        </div>

                        {/* Desktop Navigation */}
                        {showNavigation && (
                            <div className={styles.navigationWrapper}>
                                <Navigation />
                            </div>
                        )}

                        {/* Right Section */}
                        <div className={styles.rightSection}>
                            {/* Connection Status */}
                            <StatusTooltip status={status} isConnected={isConnected}>
                                <div className={clsx(
                                    styles.statusIndicator,
                                    statusConfig.className
                                )}>
                                    <div className={clsx(
                                        styles.statusDot,
                                        statusConfig.dotColor
                                    )} />
                                    <span className="hidden sm:inline">
                                        {statusConfig.text}
                                    </span>
                                </div>
                            </StatusTooltip>

                            {/* Theme Toggle */}
                            <ThemeToggle />

                            {/* Mobile Menu Button */}
                            {showNavigation && (
                                <button
                                    type="button"
                                    className={clsx(
                                        styles.mobileMenuButton,
                                        !isDark && styles.mobileMenuButtonLight
                                    )}
                                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                    aria-expanded={isMobileMenuOpen}
                                    aria-label="Toggle navigation menu"
                                >
                                    {isMobileMenuOpen ? (
                                        <X className="w-6 h-6" />
                                    ) : (
                                        <Menu className="w-6 h-6" />
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Navigation Overlay */}
            {showNavigation && isMobileMenuOpen && (
                <div
                    className="md:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                >
                    <div
                        className={clsx(
                            'absolute top-16 left-0 right-0 max-h-[calc(100vh-4rem)] overflow-y-auto',
                            isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200',
                            'border-b shadow-xl'
                        )}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Navigation
                            mobile
                            onItemClick={() => setIsMobileMenuOpen(false)}
                        />
                    </div>
                </div>
            )}
        </>
    );
};
