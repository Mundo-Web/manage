import { Icon } from '@/components/icon';
import { SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { type ComponentPropsWithoutRef } from 'react';

export function NavFooter({
    items,
    className,
    ...props
}: ComponentPropsWithoutRef<typeof SidebarGroup> & {
    items: NavItem[];
}) {
    return (
        <SidebarGroup {...props} className={`group-data-[collapsible=icon]:p-0 px-4 py-2 ${className || ''}`}>
            <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                    {items.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                className="text-gray-600 hover:text-blue-700 transition-all duration-300 rounded-xl p-2 hover:bg-gradient-to-r hover:from-white/60 hover:to-blue-50/60 hover:shadow-lg"
                            >
                                <a href={item.href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3">
                                    {item.icon && (
                                        <div className="w-6 h-6 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center group-hover:from-blue-300 group-hover:to-purple-400 transition-all duration-300">
                                            <Icon iconNode={item.icon} className="w-3 h-3 text-gray-600 group-hover:text-white" />
                                        </div>
                                    )}
                                    <span className="text-sm font-medium">{item.title}</span>
                                </a>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
