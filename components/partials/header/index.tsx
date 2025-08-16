import React from 'react'
import HeaderContent from './header-content'
import HeaderSearch from './header-search'
import ProfileInfo from './profile-info'
import Notifications from './notifications'
import Messages from "./messages"
import ThemeSwitcher from './theme-switcher'
import { SidebarToggle } from '@/components/partials/sidebar/sidebar-toggle'
import { SheetMenu } from '@/components/partials/sidebar/menu/sheet-menu'
import HorizontalMenu from "./horizontal-menu"
import LocalSwitcher from './locale-switcher'

const DashCodeHeader = async () => {
    return (
        <>
            <HeaderContent>
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                        <SidebarToggle />
                        <HeaderSearch />
                    </div>

                    <div className="flex items-center gap-2">
                        <LocalSwitcher />
                        <ThemeSwitcher />
                        <Messages />
                        <Notifications />
                        <ProfileInfo />
                        <SheetMenu />
                    </div>
                </div>
            </HeaderContent>
            <HorizontalMenu />
        </>
    )
}

export default DashCodeHeader
