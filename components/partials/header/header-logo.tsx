// components/partials/header/header-logo.tsx
'use client'

import React from 'react'
import { Link } from '@/components/navigation'
import { useConfig } from '@/hooks/use-config'
import { useMediaQuery } from '@/hooks/use-media-query'
import Image from 'next/image'

const HeaderLogo = () => {
    const [config] = useConfig();
    const isDesktop = useMediaQuery('(min-width: 1280px)');

    return (
        config.layout === 'horizontal' ? (
            <Link href="/dashboard" className="flex items-center gap-2">
                <Image
                    src="/APT.svg"
                    alt="APT Logo"
                    width={32}
                    height={32}
                    className="h-8 w-8"
                />
                <span className="font-bold text-xl text-primary">APT</span>
            </Link>
        ) : (
            <Link href="/dashboard" className="flex items-center gap-2">
                <Image
                    src="/APT.svg"
                    alt="APT Logo"
                    width={28}
                    height={28}
                    className="h-7 w-7"
                />
                <span className="font-semibold text-lg text-primary">APT</span>
            </Link>
        )
    );
}

export default HeaderLogo
