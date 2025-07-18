import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
    Filter, 
    Edit3, 
    Trash2, 
    MoreHorizontal, 
    Download,
    FileText,
    Image as ImageIcon,
    Calendar,
    Package,
    Clock,
    CheckCircle
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
    solicitudes = { data: [], links: [], meta: { current_page: 1, last_page: 1, total: 0 } }, 
    filters = {},
    estados = [],
    prioridades = []
}: SolicitudesPageProps) {
    const [modalOpen, setModalOpen] = useState(false);
    const [editingSolicitud, setEditingSolicitud] = useState<Solicitud | null>(null);
    const { toast } = useToast();

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
            case 'alta': return 'bg-red-100 text-red-800 border-red-200';
            case 'media': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'baja': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getEstadoColor = (estado: string) => {
        switch (estado) {
            case 'pendiente': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'en_diseño': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'en_programación': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'completada': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const getClienteInitials = (nombre: string) => {
        return nombre.split(' ')
            .map(word => word.charAt(0))
            .join('')
            .substring(0, 2)
            .toUpperCase();
    };

    const getAvatarColor = (nombre: string) => {
        const colors = [
            'bg-blue-500',
            'bg-green-500', 
            'bg-purple-500',
            'bg-pink-500',
            'bg-indigo-500',
            'bg-red-500',
            'bg-yellow-500',
            'bg-teal-500'
        ];
        const index = nombre.length % colors.length;
        return colors[index];
    };

    // Separar solicitudes por estado
    const enDesarrollo = solicitudes?.data?.filter(s => 
        s.estado === 'pendiente' || s.estado === 'en_diseño' || s.estado === 'en_programación'
    ) || [];
    
    const completadas = solicitudes?.data?.filter(s => 
        s.estado === 'completada'
    ) || [];

    const SolicitudCard = ({ solicitud, showEstado = true }: { solicitud: Solicitud, showEstado?: boolean }) => (
        <Card className="hover:shadow-lg transition-all duration-200 border border-gray-200">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold ${getAvatarColor(solicitud.nombre_cliente)}`}>
                            {getClienteInitials(solicitud.nombre_cliente)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 text-sm truncate">
                                {solicitud.nombre_cliente}
                            </h3>
                            <p className="text-xs text-gray-500 truncate">
                                {solicitud.user?.name || 'Usuario'}
                            </p>
                        </div>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(solicitud)}>
                                <Edit3 className="h-4 w-4 mr-2" />
                                Editar
                            </DropdownMenuItem>
                            {solicitud.archivo_pdf && (
                                <DropdownMenuItem asChild>
                                    <a href={`/storage/${solicitud.archivo_pdf}`} target="_blank" rel="noopener noreferrer">
                                        <Download className="h-4 w-4 mr-2" />
                                        Descargar PDF
                                    </a>
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => handleDelete(solicitud)} className="text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Eliminar
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="space-y-3">
                    <div>
                        <p className="font-medium text-sm text-gray-900">
                            {solicitud.nombre_landing}
                        </p>
                        <p className="text-xs text-gray-600">
                            {solicitud.nombre_producto}
                        </p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                        {showEstado && (
                            <Badge className={`text-xs px-2 py-1 ${getEstadoColor(solicitud.estado)}`}>
                                {solicitud.estado === 'en_diseño' ? 'En Diseño' : 
                                 solicitud.estado === 'en_programación' ? 'En Programación' : 
                                 solicitud.estado === 'pendiente' ? 'Pendiente' :
                                 solicitud.estado.replace('_', ' ')}
                            </Badge>
                        )}
                        <Badge className={`text-xs px-2 py-1 ${getPrioridadColor(solicitud.prioridad)}`}>
                            {solicitud.prioridad}
                        </Badge>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(solicitud.fecha_creacion)}
                        </div>
                        <div className="flex items-center gap-2">
                            {solicitud.archivo_pdf && (
                                <div className="flex items-center gap-1 text-blue-600">
                                    <FileText className="h-3 w-3" />
                                    <span className="text-xs">PDF</span>
                                </div>
                            )}
                            {solicitud.logo && (
                                <div className="flex items-center gap-1 text-green-600">
                                    <ImageIcon className="h-3 w-3" />
                                    <span className="text-xs">Logo</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <ToastProvider>
            <AppLayout>
                <Head title="Solicitudes de Landing Page" />

                <div className="space-y-6">
                    {/* Header Section */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <Package className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">
                                    Mundo Web
                                </h1>
                                <p className="text-sm text-gray-600">
                                    Solicitudes de Landing Page • {solicitudes?.data?.length || 0} solicitudes activas
                                </p>
                            </div>
                        </div>
                        <Button 
                            onClick={() => setModalOpen(true)}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Nueva Solicitud
                        </Button>
                    </div>

                    {/* Filtros */}
                    <Card className="p-4">
                        <div className="flex items-center gap-2 mb-4">
                            <Filter className="h-4 w-4 text-blue-600" />
                            <span className="font-medium text-sm">Filtros</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Estado</label>
                                <select
                                    value={filters.estado || ''}
                                    onChange={(e) => handleFilter('estado', e.target.value)}
                                    className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Todos los estados</option>
                                    {estados.map((estado) => (
                                        <option key={estado} value={estado}>
                                            {estado.replace('_', ' ')}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Prioridad</label>
                                <select
                                    value={filters.prioridad || ''}
                                    onChange={(e) => handleFilter('prioridad', e.target.value)}
                                    className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Todas las prioridades</option>
                                    {prioridades.map((prioridad) => (
                                        <option key={prioridad} value={prioridad}>
                                            {prioridad}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-end">
                                <span className="text-sm text-blue-600 font-medium">
                                    {solicitudes?.data?.length || 0} resultados
                                </span>
                            </div>
                        </div>
                    </Card>

                    {/* Proyectos en Desarrollo */}
                    <Card className="border-l-4 border-l-yellow-400">
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                                        <Clock className="h-4 w-4 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900">
                                            Proyectos en Desarrollo
                                        </h2>
                                        <p className="text-sm text-gray-600">
                                            {enDesarrollo.length} en curso
                                        </p>
                                    </div>
                                </div>
                                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                    {enDesarrollo.length} en curso
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {enDesarrollo.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                    <p className="font-medium">No hay proyectos en desarrollo</p>
                                    <p className="text-sm">Los nuevos proyectos aparecerán aquí.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {enDesarrollo.map((solicitud) => (
                                        <SolicitudCard key={solicitud.id} solicitud={solicitud} />
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Proyectos Completados */}
                    <Card className="border-l-4 border-l-green-400">
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
                                        <CheckCircle className="h-4 w-4 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900">
                                            Proyectos Completados
                                        </h2>
                                        <p className="text-sm text-gray-600">
                                            {completadas.length} finalizados
                                        </p>
                                    </div>
                                </div>
                                <Badge variant="secondary" className="bg-green-100 text-green-800">
                                    {completadas.length} finalizados
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {completadas.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <CheckCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                    <p className="font-medium">No hay proyectos completados</p>
                                    <p className="text-sm">Los proyectos finalizados aparecerán aquí.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {completadas.map((solicitud) => (
                                        <SolicitudCard key={solicitud.id} solicitud={solicitud} showEstado={false} />
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
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
