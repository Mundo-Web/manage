import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const page = usePage();
    return (
        <SidebarGroup className="px-4 py-4">
            <SidebarGroupLabel className="text-sm font-bold text-gray-700 mb-3 px-3">Plataforma</SidebarGroupLabel>
            <SidebarMenu className="space-y-2">
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton 
                            asChild 
                            isActive={page.url.startsWith(item.href)} 
                            tooltip={{ children: item.title }}
                            className={`
                                transition-all duration-300 rounded-2xl px-3 !py-6 group
                                ${page.url.startsWith(item.href) 
                                    ? 'bg-gradient-to-r from-blue-200/80 to-purple-200/80 text-blue-900 shadow-lg shadow-blue-200/50 border border-blue-300/50' 
                                    : 'hover:bg-gradient-to-r hover:from-white/60 hover:to-blue-50/60 hover:shadow-lg hover:shadow-blue-100/30 border border-transparent'
                                }
                            `}
                        >
                            <Link href={item.href} prefetch className="flex items-center gap-3 w-full">
                                {item.icon && (
                                    <div className={`
                                        w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300
                                        ${page.url.startsWith(item.href) 
                                            ? 'bg-gradient-to-br from-blue-400 to-purple-600 text-white shadow-lg' 
                                            : 'bg-gradient-to-br from-gray-200 to-gray-300 text-gray-600 group-hover:from-blue-300 group-hover:to-purple-400 group-hover:text-white'
                                        }
                                    `}>
                                        <item.icon className="w-4 h-4" />
                                    </div>
                                )}
                                <span className={`font-semibold transition-colors duration-300 ${
                                    page.url.startsWith(item.href) ? 'text-blue-900' : 'text-gray-700 group-hover:text-blue-800'
                                }`}>
                                    {item.title}
                                </span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
