import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
    roles: string[];
    isSuperAdmin: boolean;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface Solicitud {
    id: number;
    nombre_cliente: string;
    nombre_landing: string;
    nombre_producto: string;
    estado: 'pendiente' | 'en_diseño' | 'en_programación' | 'completada';
    prioridad: 'alta' | 'media' | 'baja';
    fecha_creacion: string;
    archivo_pdf?: string;
    logo?: string;
    user_id: number;
    user?: User;
    created_at: string;
    updated_at: string;
    estado_badge_color: string;
    prioridad_row_color: string;
}

export interface SolicitudesData {
    en_progreso: Solicitud[];
    completadas: Solicitud[];
}

export interface SolicitudesPageProps {
    solicitudes: SolicitudesData;
    filters: {
        estado?: string;
        prioridad?: string;
    };
    estados: string[];
    prioridades: string[];
    canCreate: boolean;
    isAdmin: boolean;
}
