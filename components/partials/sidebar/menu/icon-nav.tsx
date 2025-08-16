'use client'

import React from 'react'
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from 'next/image';
import { Group, Submenu } from '@/lib/menus';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from "@/components/ui/tooltip"
import { Link } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { useConfig } from '@/hooks/use-config';

interface IconNavProps {
    menuList: Group[]
}

const IconNav = ({ menuList }: IconNavProps) => {
    const [config, setConfig] = useConfig();

    return (
        <TooltipProvider>
            <div className="flex flex-col h-full w-[70px] border-r border-border bg-background">
                <div className="flex items-center justify-center py-4 px-2 border-b border-border">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Link href="/dashboard" className="flex items-center justify-center">
                                <Image
                                    src="/ART.svg"
                                    alt="APT Logo"
                                    width={32}
                                    height={32}
                                    className="h-8 w-8"
                                />
                            </Link>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                            <p>APT - Automated Penetration Testing</p>
                        </TooltipContent>
                    </Tooltip>
                </div>

                <ScrollArea className="flex-1">
                    <div className="flex flex-col items-center py-4 px-2 space-y-2">
                        {menuList?.map(({ groupLabel, menus }, groupIndex) =>
                            menus.map(({ href, label, icon, active, id, submenus }, menuIndex) => (
                                <Tooltip key={`${groupIndex}-${menuIndex}`}>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant={active ? "default" : "ghost"}
                                            size="icon"
                                            className={cn(
                                                "w-10 h-10 rounded-md",
                                                {
                                                    "bg-primary text-primary-foreground": active,
                                                    "hover:bg-accent hover:text-accent-foreground": !active
                                                }
                                            )}
                                            onClick={() => {
                                                if (submenus.length > 0) {
                                                    setConfig({
                                                        ...config,
                                                        hasSubMenu: true,
                                                        subMenu: false
                                                    });
                                                }
                                            }}
                                            asChild={submenus.length === 0}
                                        >
                                            {submenus.length === 0 ? (
                                                <Link href={href}>
                                                    <Icon icon={icon} className="h-5 w-5" />
                                                </Link>
                                            ) : (
                                                <div>
                                                    <Icon icon={icon} className="h-5 w-5" />
                                                </div>
                                            )}
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="right">
                                        <p>{label}</p>
                                    </TooltipContent>
                                </Tooltip>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </div>
        </TooltipProvider>
    )
}

export default IconNav
