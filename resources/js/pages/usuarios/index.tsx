import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmationModal } from '@/components/confirmation-modal';
import { Pagination } from '@/components/pagination';
import { useToast } from '@/hooks/use-toast';
import { ToastProvider } from '@/components/ui/toast';
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
    MoreHorizontal,
    Shield,
    ShieldCheck,
    RotateCcw,
    Users
} from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
    created_at: string;
    updated_at: string;
    roles: Array<{
        id: number;
        name: string;
    }>;
}

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

interface UsersPageProps {
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
        };
        roles: string[];
        isSuperAdmin: boolean;
    };
    users: {
        data: User[];
        links: PaginationLink[];
        meta: PaginationMeta;
    };
}

export default function UsersIndex({
    auth,
    users = { data: [], links: [], meta: { current_page: 1, last_page: 1, total: 0 } }
}: UsersPageProps) {
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [userToReset, setUserToReset] = useState<User | null>(null);
    const { toast } = useToast();

    const handleResetPassword = (user: User) => {
        setUserToReset(user);
        setConfirmModalOpen(true);
    };

    const confirmResetPassword = () => {
        if (!userToReset) return;

        router.patch(route('usuarios.reset-password', userToReset.id), {}, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                toast({
                    title: "Contraseña reseteada",
                    description: `La contraseña de ${userToReset.name} ha sido reseteada a su email.`,
                });
                setUserToReset(null);
            },
            onError: () => {
                toast({
                    title: "Error",
                    description: "No se pudo resetear la contraseña. Intenta de nuevo.",
                    variant: "destructive",
                });
            }
        });
    };

    const cancelResetPassword = () => {
        setUserToReset(null);
    };

    const handlePageChange = (url: string) => {
        router.get(url, {}, {
            preserveState: true,
            preserveScroll: true
        });
    };

    // Función para obtener las iniciales del usuario
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

    const getRoleBadge = (roles: Array<{name: string}>) => {
        if (roles.some(role => role.name === 'super-admin')) {
            return (
                <Badge className="bg-gradient-to-r from-red-200/80 to-red-300/80 text-red-900 hover:from-red-300/80 hover:to-red-400/80 border-0 rounded-2xl px-4 py-2 font-bold shadow-lg shadow-red-200/50 backdrop-blur-sm flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" />
                    Super Admin
                </Badge>
            );
        } else if (roles.some(role => role.name === 'admin')) {
            return (
                <Badge className="bg-gradient-to-r from-blue-200/80 to-blue-300/80 text-blue-900 hover:from-blue-300/80 hover:to-blue-400/80 border-0 rounded-2xl px-4 py-2 font-bold shadow-lg shadow-blue-200/50 backdrop-blur-sm flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Admin
                </Badge>
            );
        } else {
            return (
                <Badge className="bg-gradient-to-r from-gray-200/80 to-gray-300/80 text-gray-800 hover:from-gray-300/80 hover:to-gray-400/80 border-0 rounded-2xl px-4 py-2 font-bold shadow-lg shadow-gray-200/50 backdrop-blur-sm">
                    Usuario
                </Badge>
            );
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <ToastProvider>
            <AppLayout>
                <Head title="Gestión de Usuarios" />

                <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
                    <div className="max-w-7xl mx-auto space-y-8">
                        
                        {/* Header */}
                        <div className="flex items-center justify-between bg-white/70 backdrop-blur-lg rounded-3xl p-6 shadow-lg shadow-blue-200/50 border border-white/50">
                            <div className="flex items-center gap-4">
                                <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center shadow-inner">
                                    <Users className="w-10 h-10 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-4xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent drop-shadow-sm">
                                        Gestión de Usuarios
                                    </h1>
                                    <p className="text-lg text-gray-600 font-medium">Administrar usuarios del sistema</p>
                                </div>
                            </div>
                            <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl px-4 py-2 shadow-inner">
                                <span className="text-sm font-bold text-purple-700">
                                    {users?.data?.length || 0} usuarios registrados
                                </span>
                            </div>
                        </div>

                        {/* Tabla de Usuarios */}
                        <div className="bg-gradient-to-br from-white/80 to-gray-50/80 backdrop-blur-lg rounded-3xl border border-white/50 shadow-xl shadow-purple-200/40 overflow-hidden">
                            <div className="bg-gradient-to-r from-purple-200/60 to-blue-200/60 p-6 border-b border-purple-300/30 backdrop-blur-sm">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-inner">
                                        <Users className="text-white font-bold text-xl w-6 h-6" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-800">Usuarios del Sistema</h2>
                                </div>
                            </div>

                            <div className="overflow-x-auto p-6">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-none">
                                            <TableHead className="text-sm font-bold text-gray-700 bg-transparent uppercase tracking-wide">Usuario</TableHead>
                                            <TableHead className="text-sm font-bold text-gray-700 bg-transparent uppercase tracking-wide">Email</TableHead>
                                            <TableHead className="text-sm font-bold text-gray-700 bg-transparent uppercase tracking-wide">Rol</TableHead>
                                            <TableHead className="text-sm font-bold text-gray-700 bg-transparent uppercase tracking-wide">Registrado</TableHead>
                                            <TableHead className="text-sm font-bold text-gray-700 bg-transparent uppercase tracking-wide">Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {users.data.map((user) => (
                                            <TableRow key={user.id} className="border-none hover:bg-purple-200/30 transition-all duration-300 rounded-2xl">
                                                <TableCell className="py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-12 h-12 ${getAvatarColor(user.name)} rounded-2xl flex items-center justify-center text-white text-sm font-bold shadow-lg`}>
                                                            {getInitials(user.name)}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-gray-900 text-lg">{user.name}</div>
                                                            <div className="text-sm text-gray-600 font-medium">ID: {user.id}</div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-6">
                                                    <div className="font-semibold text-gray-800 text-base">{user.email}</div>
                                                </TableCell>
                                                <TableCell className="py-6">
                                                    {getRoleBadge(user.roles)}
                                                </TableCell>
                                                <TableCell className="py-6">
                                                    <span className="text-sm text-gray-700 font-semibold">{formatDate(user.created_at)}</span>
                                                </TableCell>
                                                <TableCell className="py-6">
                                                    {user.id !== auth.user.id && (
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
                                                                        handleResetPassword(user);
                                                                    }}
                                                                    className="rounded-xl hover:bg-orange-100/80 text-orange-700 font-medium"
                                                                >
                                                                    <RotateCcw className="h-4 w-4 mr-3" />
                                                                    Resetear Contraseña
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    )}
                                                    {user.id === auth.user.id && (
                                                        <Badge className="bg-gradient-to-r from-green-200/80 to-green-300/80 text-green-900 border-0 rounded-2xl px-4 py-2 font-bold">
                                                            Tú
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {users.data.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-12 text-gray-600 font-semibold text-lg">
                                                    No hay usuarios registrados
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>

                        {/* Paginación */}
                        {users?.meta && users.meta.total > 15 && (
                            <Pagination
                                links={users.links || []}
                                meta={users.meta}
                                onPageChange={handlePageChange}
                            />
                        )}
                    </div>
                </div>

                {/* Modal de Confirmación de Reset Password */}
                <ConfirmationModal
                    open={confirmModalOpen}
                    onOpenChange={setConfirmModalOpen}
                    title="Resetear Contraseña"
                    description={`¿Estás seguro de que quieres resetear la contraseña de ${userToReset?.name}? La nueva contraseña será su email: ${userToReset?.email}`}
                    confirmText="Sí, resetear"
                    cancelText="Cancelar"
                    variant="destructive"
                    onConfirm={confirmResetPassword}
                    onCancel={cancelResetPassword}
                />
            </AppLayout>
        </ToastProvider>
    );
}
