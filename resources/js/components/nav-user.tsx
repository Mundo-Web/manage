import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { UserInfo } from '@/components/user-info';
import { UserMenuContent } from '@/components/user-menu-content';
import { useIsMobile } from '@/hooks/use-mobile';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { ChevronsUpDown } from 'lucide-react';

export function NavUser() {
    const { auth } = usePage<SharedData>().props;
    const { state } = useSidebar();
    const isMobile = useIsMobile();

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton 
                            size="lg" 
                            className="group bg-gradient-to-r from-white/60 to-gray-50/60 backdrop-blur-sm rounded-2xl p-3 border border-white/50 shadow-lg hover:from-blue-100/80 hover:to-purple-100/80 hover:shadow-xl transition-all duration-300 data-[state=open]:bg-gradient-to-r data-[state=open]:from-blue-200/80 data-[state=open]:to-purple-200/80"
                        >
                            <UserInfo user={auth.user} />
                            <ChevronsUpDown className="ml-auto w-4 h-4 text-gray-600 group-hover:text-blue-600 transition-colors duration-300" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-white/50"
                        align="end"
                        side={isMobile ? 'bottom' : state === 'collapsed' ? 'left' : 'bottom'}
                    >
                        <UserMenuContent user={auth.user} />
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
