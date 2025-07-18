import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SolicitudModal } from '@/components/solicitud-modal';
import { ConfirmationModal } from '@/components/confirmation-modal';
import { Pagination } from '@/components/pagination';
import { useToast } from '@/hooks/use-toast';
import { ToastProvider } from '@/components/ui/toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Plus,
    Filter,
    Edit3,
    Trash2,
    MoreHorizontal
} from 'lucide-react';
import { type Solicitud } from '@/types';

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginationMeta {
    current_page: number;
    last_page: number;
    total: number;
}

interface SolicitudesPageProps {
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
        };
        roles: string[];
        isSuperAdmin: boolean;
    };
    solicitudes: {
        data: Solicitud[];
        links: PaginationLink[];
        meta: PaginationMeta;
    };
    filters: {
        search?: string;
        estado?: string;
        prioridad?: string;
    };
    estados: string[];
    prioridades: string[];
}

export default function SolicitudesIndex({
    auth,
    solicitudes = { data: [], links: [], meta: { current_page: 1, last_page: 1, total: 0 } },
    filters = {},
    estados = [],
    prioridades = []
}: SolicitudesPageProps) {
    const [modalOpen, setModalOpen] = useState(false);
    const [editingSolicitud, setEditingSolicitud] = useState<Solicitud | null>(null);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [solicitudToDelete, setSolicitudToDelete] = useState<Solicitud | null>(null);
    const { toast } = useToast();

    const handleStatusUpdate = (solicitud: Solicitud, newStatus: string) => {
        router.patch(route('solicitudes.update-status', solicitud.id), {
            estado: newStatus
        }, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                toast({
                    title: "Estado actualizado",
                    description: `El estado de la solicitud de ${solicitud.nombre_cliente} se ha actualizado a ${newStatus.replace('_', ' ')}.`,
                });
            },
            onError: () => {
                toast({
                    title: "Error",
                    description: "No se pudo actualizar el estado de la solicitud.",
                    variant: "destructive",
                });
            }
        });
    };

    const handleFilter = (key: string, value: string) => {
        const newFilters = { ...filters };

        // Si el valor es vacío, undefined, "todos" o "todas", eliminar el filtro
        if (!value || value === 'todos' || value === 'todas') {
            delete newFilters[key as keyof typeof newFilters];
        } else {
            newFilters[key as keyof typeof newFilters] = value as never;
        }

        // Limpiar todos los parámetros vacíos
        Object.keys(newFilters).forEach(key => {
            const filterValue = newFilters[key as keyof typeof newFilters];
            if (!filterValue || filterValue === '' || filterValue === 'todos' || filterValue === 'todas') {
                delete newFilters[key as keyof typeof newFilters];
            }
        });

        router.get(route('solicitudes.index'), newFilters, {
            preserveState: true,
            preserveScroll: true
        });
    };

    const handleEdit = (solicitud: Solicitud) => {
        // Estrategia más suave para cerrar dropdowns sin interferir con React
        const activeElement = document.activeElement as HTMLElement;
        if (activeElement) {
            activeElement.blur();
        }

        // Cerrar dropdowns usando evento ESC (más compatible con React)
        const escEvent = new KeyboardEvent('keydown', {
            key: 'Escape',
            keyCode: 27,
            which: 27,
            bubbles: true
        });
        document.dispatchEvent(escEvent);

        // Timeout más corto para abrir el modal
        setTimeout(() => {
            setEditingSolicitud(solicitud);
            setModalOpen(true);
        }, 50);
    };

    const handleDelete = (solicitud: Solicitud) => {
        setSolicitudToDelete(solicitud);
        setConfirmModalOpen(true);
    };

    const confirmDelete = () => {
        if (!solicitudToDelete) return;

        router.delete(route('solicitudes.destroy', solicitudToDelete.id), {
            onSuccess: () => {
                toast({
                    title: "Solicitud eliminada",
                    description: `La solicitud de ${solicitudToDelete.nombre_cliente} ha sido eliminada correctamente.`,
                });
                setSolicitudToDelete(null);
            },
            onError: () => {
                toast({
                    title: "Error",
                    description: "No se pudo eliminar la solicitud. Intenta de nuevo.",
                    variant: "destructive",
                });
            }
        });
    };

    const cancelDelete = () => {
        setSolicitudToDelete(null);
    };

    const handlePageChange = (url: string) => {
        router.get(url, {}, {
            preserveState: true,
            preserveScroll: true
        });
    };

    const handleModalSuccess = () => {
        toast({
            title: editingSolicitud ? "Solicitud actualizada" : "Solicitud creada",
            description: editingSolicitud
                ? "Los cambios han sido guardados correctamente."
                : "La nueva solicitud ha sido creada exitosamente.",
        });

        // Recargar solo los datos sin refrescar toda la página
        router.reload({
            only: ['solicitudes']
        });

        setEditingSolicitud(null);
    };

    // Función para obtener las iniciales del cliente
    const getInitials = (nombre: string) => {
        return nombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    // Función para obtener color del avatar basado en las iniciales
    const getAvatarColor = (nombre: string) => {
        const colors = [
            'bg-blue-500',
            'bg-green-500',
            'bg-purple-500',
            'bg-pink-500',
            'bg-indigo-500',
            'bg-yellow-500',
            'bg-red-500',
            'bg-teal-500'
        ];
        const index = nombre.charCodeAt(0) % colors.length;
        return colors[index];
    };

    // Función para renderizar el avatar del cliente (logo o iniciales)
    const renderClientAvatar = (solicitud: Solicitud) => {
        return <ClientAvatar solicitud={solicitud} />;
    };

    // Componente para el avatar del cliente
    const ClientAvatar = ({ solicitud }: { solicitud: Solicitud }) => {
        const [imageError, setImageError] = useState(false);

        if (solicitud.logo && !imageError) {
            return (
                <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-lg border-2 border-white/20 bg-gray-100">
                    <img
                        src={`/storage/${solicitud.logo}`}
                        alt={`Logo de ${solicitud.nombre_cliente}`}
                        className="w-full h-full object-cover"
                        onError={() => setImageError(true)}
                    />
                </div>
            );
        } else {
            return (
                <div className={`w-12 h-12 ${getAvatarColor(solicitud.nombre_cliente)} rounded-2xl flex items-center justify-center text-white text-sm font-bold shadow-lg`}>
                    {getInitials(solicitud.nombre_cliente)}
                </div>
            );
        }
    };

    const getPrioridadBadge = (prioridad: string) => {
        switch (prioridad) {
            case 'alta':
                return (
                    <Badge className="bg-gradient-to-r from-red-200/80 to-red-300/80 text-red-900 hover:from-red-300/80 hover:to-red-400/80 border-0 rounded-2xl px-4 py-2 font-bold shadow-lg shadow-red-200/50 backdrop-blur-sm">
                        Alta
                    </Badge>
                );
            case 'media':
                return (
                    <Badge className="bg-gradient-to-r from-orange-200/80 to-orange-300/80 text-orange-900 hover:from-orange-300/80 hover:to-orange-400/80 border-0 rounded-2xl px-4 py-2 font-bold shadow-lg shadow-orange-200/50 backdrop-blur-sm">
                        Media
                    </Badge>
                );
            case 'baja':
                return (
                    <Badge className="bg-gradient-to-r from-emerald-200/80 to-emerald-300/80 text-emerald-900 hover:from-emerald-300/80 hover:to-emerald-400/80 border-0 rounded-2xl px-4 py-2 font-bold shadow-lg shadow-emerald-200/50 backdrop-blur-sm">
                        Baja
                    </Badge>
                );
            default:
                return (
                    <Badge className="bg-gradient-to-r from-gray-200/80 to-gray-300/80 text-gray-800 hover:from-gray-300/80 hover:to-gray-400/80 border-0 rounded-2xl px-4 py-2 font-bold shadow-lg shadow-gray-200/50 backdrop-blur-sm">
                        -
                    </Badge>
                );
        }
    };

    const getEstadoBadge = (estado: string) => {
        switch (estado) {
            case 'pendiente':
                return (
                    <Badge className="bg-gradient-to-r from-yellow-200/80 to-yellow-300/80 text-yellow-900 hover:from-yellow-300/80 hover:to-yellow-400/80 border-0 rounded-2xl px-4 py-2 font-bold shadow-lg shadow-yellow-200/50 backdrop-blur-sm flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clock w-4 h-4"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        Pendiente
                    </Badge>
                );
            case 'en_diseño':
                return (
                    <Badge className="bg-gradient-to-r from-blue-200/80 to-blue-300/80 text-blue-900 hover:from-blue-300/80 hover:to-blue-400/80 border-0 rounded-2xl px-4 py-2 font-bold shadow-lg shadow-blue-200/50 backdrop-blur-sm flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-palette w-4 h-4"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"></circle><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"></circle><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"></circle><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"></circle><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"></path></svg>
                        En Diseño
                    </Badge>
                );
            case 'en_programación':
                return (
                    <Badge className="bg-gradient-to-r from-purple-200/80 to-purple-300/80 text-purple-900 hover:from-purple-300/80 hover:to-purple-400/80 border-0 rounded-2xl px-4 py-2 font-bold shadow-lg shadow-purple-200/50 backdrop-blur-sm flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-code w-4 h-4"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
                        En Programación
                    </Badge>
                );
            case 'completada':
                return (
                    <Badge className="bg-gradient-to-r from-green-200/80 to-green-300/80 text-green-900 hover:from-green-300/80 hover:to-green-400/80 border-0 rounded-2xl px-4 py-2 font-bold shadow-lg shadow-green-200/50 backdrop-blur-sm flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-check-big w-4 h-4"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><path d="m9 11 3 3L22 4"></path></svg>
                        Completada
                    </Badge>
                );
            default:
                return (
                    <Badge className="bg-gradient-to-r from-gray-200/80 to-gray-300/80 text-gray-800 hover:from-gray-300/80 hover:to-gray-400/80 border-0 rounded-2xl px-4 py-2 font-bold shadow-lg shadow-gray-200/50 backdrop-blur-sm flex items-center gap-2">
                        <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                        -
                    </Badge>
                );
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    // Separar proyectos por estado
    const proyectosEnDesarrollo = solicitudes?.data?.filter(s =>
        s.estado === 'pendiente' || s.estado === 'en_diseño' || s.estado === 'en_programación'
    ) || [];

    const proyectosCompletados = solicitudes?.data?.filter(s =>
        s.estado === 'completada'
    ) || [];

    return (
        <ToastProvider>
            <AppLayout>
                <Head title="Mundo Web - Solicitudes de Landing Page" />

                <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
                    <div className="max-w-7xl mx-auto space-y-8">
                       

                        {/* Filtros */}
                        <div className="bg-white/60 backdrop-blur-lg rounded-3xl p-6 shadow-lg shadow-purple-200/30 border border-white/50">
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center shadow-inner">
                                        <Filter className="w-5 h-5 text-white" />
                                    </div>
                                    <span className="text-lg font-bold text-gray-800">Filtros</span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-semibold text-gray-700">Estado</span>
                                    <Select value={filters.estado || 'todos'} onValueChange={(value) => handleFilter('estado', value)}>
                                        <SelectTrigger className="w-48 text-sm bg-gradient-to-br from-orange-50/80 to-yellow-50/80 backdrop-blur-sm text-orange-800 rounded-2xl border border-orange-200/50 shadow-lg shadow-orange-100/50 font-medium focus:ring-2 focus:ring-orange-400 hover:from-orange-100/80 hover:to-yellow-100/80 transition-all duration-300">
                                            <SelectValue placeholder="📋 Todos los estados" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-orange-200/50">
                                            <SelectItem value="todos" className="rounded-xl hover:bg-orange-100/80 font-medium">
                                                📋 Todos los estados
                                            </SelectItem>
                                            {estados.map((estado) => (
                                                <SelectItem key={estado} value={estado} className="rounded-xl hover:bg-orange-100/80 font-medium">
                                                    {estado.replace('_', ' ')}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-semibold text-gray-700">Prioridad</span>
                                    <Select value={filters.prioridad || 'todas'} onValueChange={(value) => handleFilter('prioridad', value)}>
                                        <SelectTrigger className="w-52 text-sm bg-gradient-to-br from-purple-50/80 to-pink-50/80 backdrop-blur-sm text-purple-800 rounded-2xl border border-purple-200/50 shadow-lg shadow-purple-100/50 font-medium focus:ring-2 focus:ring-purple-400 hover:from-purple-100/80 hover:to-pink-100/80 transition-all duration-300">
                                            <SelectValue placeholder="⭐ Todas las prioridades" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-purple-200/50">
                                            <SelectItem value="todas" className="rounded-xl hover:bg-purple-100/80 font-medium">
                                                ⭐ Todas las prioridades
                                            </SelectItem>
                                            {prioridades.map((prioridad) => (
                                                <SelectItem key={prioridad} value={prioridad} className="rounded-xl hover:bg-purple-100/80 font-medium">
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-xl text-xs font-bold ${prioridad === 'alta' ? 'bg-gradient-to-r from-red-200 to-red-300 text-red-900' :
                                                        prioridad === 'media' ? 'bg-gradient-to-r from-orange-200 to-orange-300 text-orange-900' :
                                                            'bg-gradient-to-r from-green-200 to-green-300 text-green-900'
                                                        }`}>
                                                        {prioridad}
                                                    </span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="ml-auto bg-gradient-to-r from-blue-100 to-cyan-100 rounded-xl px-4 py-2 shadow-inner">
                                    <span className="text-sm font-bold text-blue-700">
                                        {solicitudes?.data?.length || 0} resultados
                                    </span>
                                </div>
                                  <Button
                                    onClick={() => setModalOpen(true)}
                                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-2xl px-6 py-3 shadow-lg shadow-blue-300/50 border-0 transform hover:scale-105 transition-all duration-300 font-semibold"
                                >
                                    <Plus className="w-5 h-5 mr-2" />
                                    Nueva Solicitud
                                </Button>
                            </div>
                        </div>

                        {/* Proyectos en Desarrollo */}
                        <div className="bg-gradient-to-br from-yellow-100/80 to-orange-100/80 backdrop-blur-lg rounded-3xl border border-yellow-200/50 shadow-xl shadow-yellow-200/40 overflow-hidden">
                            <div className="bg-gradient-to-r from-yellow-200/60 to-orange-200/60 p-6 border-b border-yellow-300/30 backdrop-blur-sm">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-inner">
                                        <span className="text-white font-bold text-xl">🟡</span>
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-800">Proyectos en Desarrollo</h2>
                                    <Badge className="bg-gradient-to-r from-yellow-300 to-orange-300 text-orange-900 hover:from-yellow-400 hover:to-orange-400 rounded-xl px-4 py-2 border-0 shadow-lg font-bold">
                                        {proyectosEnDesarrollo.length} activos
                                    </Badge>
                                </div>
                            </div>

                            <div className="overflow-x-auto ">
                                <Table className='!p-0'>
                                    <TableHeader>
                                        <TableRow className="border-none">
                                            <TableHead className="text-sm font-bold text-gray-700 bg-transparent uppercase tracking-wide">Cliente</TableHead>
                                            <TableHead className="text-sm font-bold text-gray-700 bg-transparent uppercase tracking-wide">Proyecto</TableHead>
                                          
                                            <TableHead className="text-sm font-bold text-gray-700 bg-transparent uppercase tracking-wide">Estado</TableHead>
                                            <TableHead className="text-sm font-bold text-gray-700 bg-transparent uppercase tracking-wide">Prioridad</TableHead>
                                           
                                            <TableHead className="text-sm font-bold text-gray-700 bg-transparent uppercase tracking-wide">Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody className='p-0'>
                                        {proyectosEnDesarrollo.map((solicitud) => (
                                            <TableRow key={solicitud.id} className={`border-none transition-all duration-300 rounded-2xl ${
                                                solicitud.prioridad === 'alta' ? 'bg-red-200/50 hover:bg-red-200' :
                                                solicitud.prioridad === 'media' ? 'bg-orange-200/50 hover:bg-orange-200' :
                                                solicitud.prioridad === 'baja' ? 'bg-green-200/50  hover:bg-green-200' :
                                                'hover:bg-gray-200/30'
                                            }`}>
                                                <TableCell className="pb-4">
                                                    <div className="flex items-center gap-4">
                                                        {renderClientAvatar(solicitud)}
                                                        <div>
                                                            <div className="font-bold text-gray-900 text-lg">{solicitud.nombre_cliente}</div>
                                                            <div className="text-sm text-gray-600 font-medium">{solicitud.user?.name || 'contact@cliente.com'}</div>
                                                            <div className="text-sm text-gray-600 font-medium">Solicitud {formatDate(solicitud.fecha_creacion)}</div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="">
                                                    <div>
                                                        <div className="font-bold text-gray-900 text-lg">{solicitud.nombre_landing}</div>
                                                         <span className="text-sm text-gray-600 font-medium">{solicitud.nombre_producto}</span>
                                                    </div>
                                                </TableCell>
                                           
                                                <TableCell className="">
                                                    {auth.isSuperAdmin ? (
                                                        <Select
                                                            value={solicitud.estado}
                                                            onValueChange={(value) => handleStatusUpdate(solicitud, value)}
                                                        >
                                                            <SelectTrigger className="w-44 text-sm bg-gradient-to-br from-blue-50/80 to-indigo-50/80 backdrop-blur-sm text-blue-800 rounded-2xl border border-blue-200/50 shadow-lg shadow-blue-100/50 font-medium focus:ring-2 focus:ring-blue-400 hover:from-blue-100/80 hover:to-indigo-100/80 transition-all duration-300">
                                                                <SelectValue placeholder="Estado" />
                                                            </SelectTrigger>
                                                            <SelectContent className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-blue-200/50">
                                                                <SelectItem value="pendiente" className="rounded-xl hover:bg-blue-100/80 font-medium">
                                                                    <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-bold bg-gradient-to-r from-yellow-200 to-yellow-300 text-yellow-900">

                                                                        pendiente
                                                                    </span>
                                                                </SelectItem>
                                                                <SelectItem value="en_diseño" className="rounded-xl hover:bg-blue-100/80 font-medium">
                                                                    <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-bold bg-gradient-to-r from-orange-200 to-orange-300 text-orange-900">
                                                                        en diseño
                                                                    </span>
                                                                </SelectItem>
                                                                <SelectItem value="en_programación" className="rounded-xl hover:bg-blue-100/80 font-medium">
                                                                    <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-200 to-blue-300 text-blue-900">
                                                                        en programación
                                                                    </span>
                                                                </SelectItem>
                                                                <SelectItem value="completada" className="rounded-xl hover:bg-blue-100/80 font-medium">
                                                                    <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-bold bg-gradient-to-r from-green-200 to-green-300 text-green-900">
                                                                        completada
                                                                    </span>
                                                                </SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    ) : (
                                                        getEstadoBadge(solicitud.estado)
                                                    )}
                                                </TableCell>
                                                <TableCell className="">
                                                    {getPrioridadBadge(solicitud.prioridad)}
                                                </TableCell>
                                                <TableCell className="">
                                                    <span className="text-sm text-gray-700 font-semibold">{formatDate(solicitud.fecha_creacion)}</span>
                                                </TableCell>
                                                <TableCell className="">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-10 w-10 p-0 bg-gradient-to-br from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 rounded-xl shadow-lg border-0 transform hover:scale-105 transition-all duration-300"
                                                            >
                                                                <MoreHorizontal className="h-5 w-5 text-gray-700" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent
                                                            className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-white/50 p-2"
                                                            onCloseAutoFocus={(e) => e.preventDefault()}
                                                        >
                                                            <DropdownMenuItem
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    handleEdit(solicitud);
                                                                }}
                                                                className="rounded-xl hover:bg-blue-100/80 text-gray-700 font-medium"
                                                            >
                                                                <Edit3 className="h-4 w-4 mr-3" />
                                                                Editar
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    handleDelete(solicitud);
                                                                }}
                                                                className="rounded-xl hover:bg-red-100/80 text-red-600 font-medium"
                                                            >
                                                                <Trash2 className="h-4 w-4 mr-3" />
                                                                Eliminar
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {proyectosEnDesarrollo.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center py-12 text-gray-600 font-semibold text-lg">
                                                    No hay proyectos en desarrollo
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>

                        {/* Proyectos Completados */}
                        <div className="bg-gradient-to-br from-green-100/80 to-emerald-100/80 backdrop-blur-lg rounded-3xl border border-green-200/50 shadow-xl shadow-green-200/40 overflow-hidden">
                            <div className="bg-gradient-to-r from-green-200/60 to-emerald-200/60 p-6 border-b border-green-300/30 backdrop-blur-sm">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-inner">
                                        <span className="text-white font-bold text-xl">🟢</span>
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-800">Proyectos Completados</h2>
                                    <Badge className="bg-gradient-to-r from-green-300 to-emerald-300 text-emerald-900 hover:from-green-400 hover:to-emerald-400 rounded-xl px-4 py-2 border-0 shadow-lg font-bold">
                                        {proyectosCompletados.length} finalizados
                                    </Badge>
                                </div>
                            </div>

                            <div className="overflow-x-auto ">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-none">
                                            <TableHead className="text-sm font-bold text-gray-700 bg-transparent uppercase tracking-wide">Cliente</TableHead>
                                            <TableHead className="text-sm font-bold text-gray-700 bg-transparent uppercase tracking-wide">Proyecto</TableHead>
                                            <TableHead className="text-sm font-bold text-gray-700 bg-transparent uppercase tracking-wide">Fecha entregada</TableHead>
                                            <TableHead className="text-sm font-bold text-gray-700 bg-transparent uppercase tracking-wide">Estado</TableHead>
                                            <TableHead className="text-sm font-bold text-gray-700 bg-transparent uppercase tracking-wide">Prioridad</TableHead>
                                         
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {proyectosCompletados.map((solicitud) => (
                                            <TableRow key={solicitud.id} className="border-none hover:bg-green-200/30 transition-all duration-300 rounded-2xl">
                                                <TableCell className="py-6">
                                                    <div className="flex items-center gap-4">
                                                        {renderClientAvatar(solicitud)}
                                                        <div>
                                                            <div className="font-bold text-gray-900 text-lg">{solicitud.nombre_cliente}</div>
                                                            <div className="text-sm text-gray-600 font-medium">{solicitud.user?.name || 'contact@cliente.com'}</div>

                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-6">
                                                    <div>
                                                        <div className="font-bold text-gray-900 text-lg">{solicitud.nombre_landing}</div>
                                                           <span className="text-sm text-gray-600 font-medium">{solicitud.nombre_producto}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-6">
                                                                                                          <div className="text-sm text-gray-600 font-medium">Finalizado {formatDate(solicitud.updated_at)}</div>

                                                </TableCell>
                                                <TableCell className="py-6">
                                                    {getEstadoBadge(solicitud.estado)}
                                                </TableCell>
                                                <TableCell className="py-6">
                                                    {getPrioridadBadge(solicitud.prioridad)}
                                                </TableCell>
                                              
                                            </TableRow>
                                        ))}
                                        {proyectosCompletados.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center py-12 text-gray-600 font-semibold text-lg">
                                                    No hay proyectos completados
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </div>

                    {/* Paginación */}
                    <div className="max-w-7xl mx-auto mt-8">

                        {solicitudes?.meta && (
                            <Pagination
                                links={solicitudes.links || []}
                                meta={solicitudes.meta}
                                onPageChange={handlePageChange}
                            />
                        )}
                    </div>
                </div>

                {/* Modal */}
                <SolicitudModal
                    open={modalOpen}
                    onOpenChange={(open) => {
                        setModalOpen(open);
                        if (!open) {
                            setEditingSolicitud(null);
                        }
                    }}
                    solicitud={editingSolicitud}
                    estados={estados}
                    prioridades={prioridades}
                    onSuccess={handleModalSuccess}
                />

                {/* Modal de Confirmación de Eliminación */}
                <ConfirmationModal
                    open={confirmModalOpen}
                    onOpenChange={setConfirmModalOpen}
                    title="Eliminar Solicitud"
                    description={`¿Estás seguro de que quieres eliminar la solicitud de ${solicitudToDelete?.nombre_cliente}? Esta acción no se puede deshacer.`}
                    confirmText="Sí, eliminar"
                    cancelText="Cancelar"
                    variant="destructive"
                    onConfirm={confirmDelete}
                    onCancel={cancelDelete}
                />
            </AppLayout>
        </ToastProvider>
    );
}
