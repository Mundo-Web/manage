import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { SolicitudModal } from '@/components/solicitud-modal';
import { useToast } from '@/hooks/use-toast';
import { ToastProvider } from '@/components/ui/toast';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
    Plus, 
    Search, 
    Filter, 
    Edit3, 
    Trash2, 
    MoreHorizontal, 
    Download, 
    Eye,
    FileText,
    Image as ImageIcon,
    Calendar,
    User,
    Package
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
    solicitudes, 
    filters,
    estados,
    prioridades
}: SolicitudesPageProps) {
    const [modalOpen, setModalOpen] = useState(false);
    const [editingSolicitud, setEditingSolicitud] = useState<Solicitud | null>(null);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const { toast } = useToast();

    const handleSearch = (search: string) => {
        router.get(route('solicitudes.index'), { 
            ...filters, 
            search: search || undefined 
        }, { 
            preserveState: true,
            preserveScroll: true 
        });
    };

    const handleFilter = (key: string, value: string) => {
        router.get(route('solicitudes.index'), { 
            ...filters, 
            [key]: value || undefined 
        }, { 
            preserveState: true,
            preserveScroll: true 
        });
    };

    const handleEdit = (solicitud: Solicitud) => {
        setEditingSolicitud(solicitud);
        setModalOpen(true);
    };

    const handleDelete = (solicitud: Solicitud) => {
        if (confirm(`¿Estás seguro de que quieres eliminar la solicitud de ${solicitud.nombre_cliente}?`)) {
            router.delete(route('solicitudes.destroy', solicitud.id), {
                onSuccess: () => {
                    toast({
                        title: "Solicitud eliminada",
                        description: `La solicitud de ${solicitud.nombre_cliente} ha sido eliminada correctamente.`,
                    });
                },
                onError: () => {
                    toast({
                        title: "Error",
                        description: "No se pudo eliminar la solicitud. Intenta de nuevo.",
                        variant: "destructive",
                    });
                }
            });
        }
    };

    const handleModalSuccess = () => {
        toast({
            title: editingSolicitud ? "Solicitud actualizada" : "Solicitud creada",
            description: editingSolicitud 
                ? "Los cambios han sido guardados correctamente."
                : "La nueva solicitud ha sido creada exitosamente.",
        });
        setEditingSolicitud(null);
    };

    const getPrioridadColor = (prioridad: string) => {
        switch (prioridad) {
            case 'alta': return 'bg-red-100 text-red-800 hover:bg-red-200';
            case 'media': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
            case 'baja': return 'bg-green-100 text-green-800 hover:bg-green-200';
            default: return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
        }
    };

    const getEstadoColor = (estado: string) => {
        switch (estado) {
            case 'pendiente': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
            case 'en_proceso': return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
            case 'completado': return 'bg-green-100 text-green-800 hover:bg-green-200';
            case 'cancelado': return 'bg-red-100 text-red-800 hover:bg-red-200';
            default: return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <ToastProvider>
            <AppLayout>
                <Head title="Gestión de Solicitudes" />

                <div className="space-y-6">
                    {/* Header Section */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Gestión de Solicitudes
                                </h1>
                                <p className="text-gray-600 mt-1">
                                    Administra las solicitudes de landing pages y su estado.
                                </p>
                            </div>
                            <Button 
                                onClick={() => setModalOpen(true)}
                                className="bg-indigo-600 hover:bg-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Nueva Solicitud
                            </Button>
                        </div>
                    </div>

                    {/* Filters Section */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex flex-col lg:flex-row gap-4">
                            {/* Search */}
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <Input
                                        placeholder="Buscar por cliente, landing page o producto..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                handleSearch(searchTerm);
                                            }
                                        }}
                                        className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            {/* Estado Filter */}
                            <div className="w-full lg:w-48">
                                <select
                                    value={filters.estado || ''}
                                    onChange={(e) => handleFilter('estado', e.target.value)}
                                    className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                                >
                                    <option value="">Todos los estados</option>
                                    {estados.map((estado) => (
                                        <option key={estado} value={estado}>
                                            {estado.replace('_', ' ')}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Prioridad Filter */}
                            <div className="w-full lg:w-48">
                                <select
                                    value={filters.prioridad || ''}
                                    onChange={(e) => handleFilter('prioridad', e.target.value)}
                                    className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                                >
                                    <option value="">Todas las prioridades</option>
                                    {prioridades.map((prioridad) => (
                                        <option key={prioridad} value={prioridad}>
                                            {prioridad}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Search Button */}
                            <Button 
                                onClick={() => handleSearch(searchTerm)}
                                variant="outline"
                                className="transition-all duration-200 hover:bg-gray-50"
                            >
                                <Filter className="h-4 w-4 mr-2" />
                                Buscar
                            </Button>
                        </div>
                    </div>

                    {/* Results Count */}
                    <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>
                            Mostrando {solicitudes.data.length} de {solicitudes.meta?.total || 0} solicitudes
                        </span>
                        {(filters.search || filters.estado || filters.prioridad) && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.get(route('solicitudes.index'))}
                                className="text-indigo-600 hover:text-indigo-800"
                            >
                                Limpiar filtros
                            </Button>
                        )}
                    </div>

                    {/* Table Section */}
                    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50/50">
                                        <TableHead className="font-semibold text-gray-900">
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4" />
                                                Cliente
                                            </div>
                                        </TableHead>
                                        <TableHead className="font-semibold text-gray-900">
                                            <div className="flex items-center gap-2">
                                                <Package className="h-4 w-4" />
                                                Proyecto
                                            </div>
                                        </TableHead>
                                        <TableHead className="font-semibold text-gray-900">Estado</TableHead>
                                        <TableHead className="font-semibold text-gray-900">Prioridad</TableHead>
                                        <TableHead className="font-semibold text-gray-900">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4" />
                                                Fecha
                                            </div>
                                        </TableHead>
                                        <TableHead className="font-semibold text-gray-900">Archivos</TableHead>
                                        <TableHead className="text-center font-semibold text-gray-900">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {solicitudes.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-12">
                                                <div className="flex flex-col items-center gap-3 text-gray-500">
                                                    <Package className="h-12 w-12 text-gray-300" />
                                                    <div>
                                                        <p className="font-medium">No hay solicitudes</p>
                                                        <p className="text-sm">
                                                            {(filters.search || filters.estado || filters.prioridad) 
                                                                ? 'No se encontraron solicitudes con los filtros aplicados.'
                                                                : 'Comienza creando tu primera solicitud de landing page.'
                                                            }
                                                        </p>
                                                    </div>
                                                    {!(filters.search || filters.estado || filters.prioridad) && (
                                                        <Button onClick={() => setModalOpen(true)} className="mt-2">
                                                            <Plus className="h-4 w-4 mr-2" />
                                                            Crear Primera Solicitud
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        solicitudes.data.map((solicitud) => (
                                            <TableRow key={solicitud.id} className="hover:bg-gray-50/50 transition-colors duration-150">
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium text-gray-900">
                                                            {solicitud.nombre_cliente}
                                                        </div>
                                                        {solicitud.user && (
                                                            <div className="text-sm text-gray-500">
                                                                Por: {solicitud.user.name}
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium text-gray-900">
                                                            {solicitud.nombre_landing}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {solicitud.nombre_producto}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={`${getEstadoColor(solicitud.estado)} transition-colors duration-150`}>
                                                        {solicitud.estado.replace('_', ' ')}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={`${getPrioridadColor(solicitud.prioridad)} transition-colors duration-150`}>
                                                        {solicitud.prioridad}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm">
                                                        {formatDate(solicitud.fecha_creacion)}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        {solicitud.archivo_pdf && (
                                                            <a
                                                                href={`/storage/${solicitud.archivo_pdf}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors duration-150"
                                                                title="Ver PDF"
                                                            >
                                                                <FileText className="h-3 w-3" />
                                                                PDF
                                                            </a>
                                                        )}
                                                        {solicitud.logo && (
                                                            <a
                                                                href={`/storage/${solicitud.logo}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200 transition-colors duration-150"
                                                                title="Ver Logo"
                                                            >
                                                                <ImageIcon className="h-3 w-3" />
                                                                Logo
                                                            </a>
                                                        )}
                                                        {!solicitud.archivo_pdf && !solicitud.logo && (
                                                            <span className="text-xs text-gray-400">Sin archivos</span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center justify-center">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button 
                                                                    variant="ghost" 
                                                                    size="sm"
                                                                    className="h-8 w-8 p-0 hover:bg-gray-100 transition-colors duration-150"
                                                                >
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                    <span className="sr-only">Abrir menú</span>
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-48">
                                                                <DropdownMenuItem
                                                                    onClick={() => handleEdit(solicitud)}
                                                                    className="cursor-pointer"
                                                                >
                                                                    <Edit3 className="h-4 w-4 mr-2" />
                                                                    Editar
                                                                </DropdownMenuItem>
                                                                {solicitud.archivo_pdf && (
                                                                    <DropdownMenuItem asChild>
                                                                        <a
                                                                            href={`/storage/${solicitud.archivo_pdf}`}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="cursor-pointer"
                                                                        >
                                                                            <Download className="h-4 w-4 mr-2" />
                                                                            Descargar PDF
                                                                        </a>
                                                                    </DropdownMenuItem>
                                                                )}
                                                                {solicitud.logo && (
                                                                    <DropdownMenuItem asChild>
                                                                        <a
                                                                            href={`/storage/${solicitud.logo}`}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="cursor-pointer"
                                                                        >
                                                                            <Eye className="h-4 w-4 mr-2" />
                                                                            Ver Logo
                                                                        </a>
                                                                    </DropdownMenuItem>
                                                                )}
                                                                <DropdownMenuItem
                                                                    onClick={() => handleDelete(solicitud)}
                                                                    className="cursor-pointer text-red-600 focus:text-red-600"
                                                                >
                                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                                    Eliminar
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        {solicitudes.links && solicitudes.links.length > 3 && (
                            <div className="border-t px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-600">
                                        Página {solicitudes.meta?.current_page} de {solicitudes.meta?.last_page}
                                    </div>
                                    <div className="flex gap-2">
                                        {solicitudes.links.map((link: PaginationLink, index: number) => (
                                            <Button
                                                key={index}
                                                variant={link.active ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => link.url && router.get(link.url)}
                                                disabled={!link.url}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                                className="transition-all duration-150"
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
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
            </AppLayout>
        </ToastProvider>
    );
}
