'use client'
import { Button } from '@/components/ui/button'
import { useConfig } from '@/hooks/use-config'
import Image from 'next/image'
import React from 'react'

const MenuWidget = () => {
    const [config] = useConfig();
    if (config.sidebar === 'compact') return null
    return (
        <div className="dark">
            <div className="bg-default-50 mb-16 mt-24 p-4 relative text-center rounded-2xl  text-white">
                <div className="max-w-[160px] mx-auto mt-6">
                    <div className="">Добро пожаловать</div>
                    <div className="text-xs font-light">
                        Это демо версия проекта APT
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MenuWidget