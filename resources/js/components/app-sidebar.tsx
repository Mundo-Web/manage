import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem, type Auth } from '@/types';
import { Link } from '@inertiajs/react';
import { FileText, BarChart3, Users } from 'lucide-react';
import AppLogo from './app-logo';

interface AppSidebarProps {
    auth?: Auth;
}

export function AppSidebar({ auth }: AppSidebarProps) {
    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
            icon: BarChart3,
        },
        {
            title: 'Solicitudes',
            href: '/solicitudes',
            icon: FileText,
        },
        // Solo mostrar usuarios si es super admin
        ...(auth?.isSuperAdmin ? [{
            title: 'Usuarios',
            href: '/usuarios',
            icon: Users,
        }] : []),
    ];

    return (
        <Sidebar collapsible="icon" variant="inset" className="  backdrop-blur-lg border-r border-white/50 shadow-xl shadow-blue-200/30">
            <SidebarHeader className="bg-gradient-to-r  backdrop-blur-sm border-b border-white/30 shadow-lg">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="">
                            <Link href="/dashboard" prefetch className="rounded-3xl overflow-hidden !p-0">
                               
                                    <AppLogo />

                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="bg-gradient-to-b from-transparent to-white/30 backdrop-blur-sm">
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter className="bg-gradient-to-r from-white/60 to-gray-50/60 backdrop-blur-sm border-t border-white/30 shadow-lg">
              
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
