import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { 
    TrendingUp, 
    Clock, 
    CheckCircle, 
    FileText,
    AlertTriangle,
    BarChart3,
    Package,
    Calendar
} from 'lucide-react';
import { type Solicitud } from '@/types';

interface DashboardStats {
    total_solicitudes: number;
    solicitudes_pendientes: number;
    solicitudes_en_proceso: number;
    solicitudes_completadas: number;
    solicitudes_este_mes: number;
    solicitudes_por_prioridad: {
        alta: number;
        media: number;
        baja: number;
    };
    ultimas_solicitudes: Solicitud[];
    promedio_completado: number;
}

interface DashboardPageProps {
    stats: DashboardStats;
}

export default function Dashboard({ 
    stats = {
        total_solicitudes: 0,
        solicitudes_pendientes: 0,
        solicitudes_en_proceso: 0,
        solicitudes_completadas: 0,
        solicitudes_este_mes: 0,
        solicitudes_por_prioridad: { alta: 0, media: 0, baja: 0 },
        ultimas_solicitudes: [],
        promedio_completado: 0
    }
}: DashboardPageProps) {
    console.log('Dashboard stats:', stats);
    
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <AppLayout>
            <Head title="Dashboard - Solicitudes" />

            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* Header */}
                    <div className="bg-white/70 backdrop-blur-lg rounded-3xl p-6 shadow-lg shadow-blue-200/50 border border-white/50">
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
                                <BarChart3 className="w-10 h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent drop-shadow-sm" style={{fontWeight: 900}}>
                                    Dashboard
                                </h1>
                                <p className="text-lg text-gray-600 font-medium">Estadísticas y métricas de solicitudes</p>
                            </div>
                        </div>
                    </div>

                    {/* Main Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-gradient-to-br from-blue-100/80 to-indigo-100/80 backdrop-blur-lg rounded-3xl border border-blue-200/50 shadow-xl shadow-blue-200/40 overflow-hidden">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
                                        <Package className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="text-3xl font-black text-blue-800">{stats.total_solicitudes}</div>
                                </div>
                                <h3 className="text-lg font-bold text-blue-900 mb-1">Total Solicitudes</h3>
                                <p className="text-sm text-blue-700/80 font-medium">Solicitudes registradas</p>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-yellow-100/80 to-orange-100/80 backdrop-blur-lg rounded-3xl border border-yellow-200/50 shadow-xl shadow-yellow-200/40 overflow-hidden">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-inner">
                                        <Clock className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="text-3xl font-black text-orange-800">{stats.solicitudes_pendientes}</div>
                                </div>
                                <h3 className="text-lg font-bold text-orange-900 mb-1">Pendientes</h3>
                                <p className="text-sm text-orange-700/80 font-medium">Esperando procesamiento</p>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-100/80 to-blue-100/80 backdrop-blur-lg rounded-3xl border border-purple-200/50 shadow-xl shadow-purple-200/40 overflow-hidden">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-inner">
                                        <TrendingUp className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="text-3xl font-black text-purple-800">{stats.solicitudes_en_proceso}</div>
                                </div>
                                <h3 className="text-lg font-bold text-purple-900 mb-1">En Proceso</h3>
                                <p className="text-sm text-purple-700/80 font-medium">Siendo trabajadas</p>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-green-100/80 to-emerald-100/80 backdrop-blur-lg rounded-3xl border border-green-200/50 shadow-xl shadow-green-200/40 overflow-hidden">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-inner">
                                        <CheckCircle className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="text-3xl font-black text-green-800">{stats.solicitudes_completadas}</div>
                                </div>
                                <h3 className="text-lg font-bold text-green-900 mb-1">Completadas</h3>
                                <p className="text-sm text-green-700/80 font-medium">Finalizadas exitosamente</p>
                            </div>
                        </div>
                    </div>

                    {/* Secondary Stats */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Progress Card */}
                        <div className="bg-gradient-to-br from-indigo-100/80 to-blue-100/80 backdrop-blur-lg rounded-3xl border border-indigo-200/50 shadow-xl shadow-indigo-200/40 overflow-hidden">
                            <div className="bg-gradient-to-r from-indigo-200/60 to-blue-200/60 p-6 border-b border-indigo-300/30 backdrop-blur-sm">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-inner">
                                        <BarChart3 className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-800">Progreso General</h3>
                                        <p className="text-sm text-gray-600">Porcentaje de solicitudes completadas</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="space-y-3">
                                    <div className="flex justify-between text-lg font-semibold text-gray-800">
                                        <span>Completadas</span>
                                        <span>{stats.promedio_completado}%</span>
                                    </div>
                                    <div className="w-full bg-gradient-to-r from-gray-200 to-gray-300 rounded-full h-4 shadow-inner">
                                        <div 
                                            className="bg-gradient-to-r from-indigo-400 to-blue-500 h-4 rounded-full shadow-lg transition-all duration-500 ease-out"
                                            style={{ width: `${stats.promedio_completado}%` }}
                                        ></div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div className="bg-gradient-to-br from-yellow-200/60 to-yellow-300/60 rounded-2xl p-4 backdrop-blur-sm">
                                        <div className="text-2xl font-black text-yellow-800">
                                            {stats.solicitudes_pendientes}
                                        </div>
                                        <div className="text-xs text-yellow-700 font-medium">Pendientes</div>
                                    </div>
                                    <div className="bg-gradient-to-br from-blue-200/60 to-blue-300/60 rounded-2xl p-4 backdrop-blur-sm">
                                        <div className="text-2xl font-black text-blue-800">
                                            {stats.solicitudes_en_proceso}
                                        </div>
                                        <div className="text-xs text-blue-700 font-medium">En Proceso</div>
                                    </div>
                                    <div className="bg-gradient-to-br from-green-200/60 to-green-300/60 rounded-2xl p-4 backdrop-blur-sm">
                                        <div className="text-2xl font-black text-green-800">
                                            {stats.solicitudes_completadas}
                                        </div>
                                        <div className="text-xs text-green-700 font-medium">Completadas</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Priority Distribution */}
                        <div className="bg-gradient-to-br from-pink-100/80 to-rose-100/80 backdrop-blur-lg rounded-3xl border border-pink-200/50 shadow-xl shadow-pink-200/40 overflow-hidden">
                            <div className="bg-gradient-to-r from-pink-200/60 to-rose-200/60 p-6 border-b border-pink-300/30 backdrop-blur-sm">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-rose-500 rounded-2xl flex items-center justify-center shadow-inner">
                                        <AlertTriangle className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-800">Distribución por Prioridad</h3>
                                        <p className="text-sm text-gray-600">Solicitudes agrupadas por nivel de prioridad</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="bg-gradient-to-br from-red-200/60 to-red-300/60 rounded-2xl p-6 backdrop-blur-sm shadow-lg">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="text-3xl font-black text-red-800">
                                                    {stats.solicitudes_por_prioridad.alta}
                                                </div>
                                                <div className="text-sm text-red-700 font-bold">Alta Prioridad</div>
                                            </div>
                                            <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-500 rounded-xl flex items-center justify-center">
                                                <span className="text-white font-bold text-xl">🔴</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gradient-to-br from-orange-200/60 to-orange-300/60 rounded-2xl p-6 backdrop-blur-sm shadow-lg">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="text-3xl font-black text-orange-800">
                                                    {stats.solicitudes_por_prioridad.media}
                                                </div>
                                                <div className="text-sm text-orange-700 font-bold">Media Prioridad</div>
                                            </div>
                                            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl flex items-center justify-center">
                                                <span className="text-white font-bold text-xl">🟠</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gradient-to-br from-green-200/60 to-green-300/60 rounded-2xl p-6 backdrop-blur-sm shadow-lg">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="text-3xl font-black text-green-800">
                                                    {stats.solicitudes_por_prioridad.baja}
                                                </div>
                                                <div className="text-sm text-green-700 font-bold">Baja Prioridad</div>
                                            </div>
                                            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-500 rounded-xl flex items-center justify-center">
                                                <span className="text-white font-bold text-xl">🟢</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-gradient-to-br from-gray-100/80 to-slate-100/80 backdrop-blur-lg rounded-3xl border border-gray-200/50 shadow-xl shadow-gray-200/40 overflow-hidden">
                        <div className="bg-gradient-to-r from-gray-200/60 to-slate-200/60 p-6 border-b border-gray-300/30 backdrop-blur-sm">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-slate-500 rounded-2xl flex items-center justify-center shadow-inner">
                                    <FileText className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800">Solicitudes Recientes</h3>
                                    <p className="text-sm text-gray-600">Últimas {stats.ultimas_solicitudes.length} solicitudes registradas</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 custom-scrollbar-table max-h-96 overflow-y-auto">
                            {stats.ultimas_solicitudes.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                                        <Package className="w-10 h-10 text-gray-500" />
                                    </div>
                                    <p className="text-lg font-semibold mb-2">No hay solicitudes registradas aún</p>
                                    <p className="text-sm text-gray-400">Las nuevas solicitudes aparecerán aquí</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {stats.ultimas_solicitudes.map((solicitud) => (
                                        <div key={solicitud.id} className="bg-gradient-to-br from-white/60 to-gray-50/60 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg hover:shadow-xl hover:scale-95 transition-all duration-300">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center text-white text-sm font-bold shadow-lg">
                                                            {solicitud.nombre_cliente.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                                        </div>
                                                        <div className="flex-1">
                                                            <h3 className="font-bold text-gray-900 text-lg">
                                                                {solicitud.nombre_cliente}
                                                            </h3>
                                                            <p className="text-sm text-gray-600 font-medium">
                                                                {solicitud.nombre_landing} - {solicitud.nombre_producto}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <div className={`px-4 py-2 rounded-2xl text-xs font-bold shadow-lg ${
                                                                solicitud.estado === 'pendiente' ? 'bg-gradient-to-r from-yellow-200 to-yellow-300 text-yellow-900' :
                                                                solicitud.estado === 'en_diseño' ? 'bg-gradient-to-r from-blue-200 to-blue-300 text-blue-900' :
                                                                solicitud.estado === 'en_programación' ? 'bg-gradient-to-r from-purple-200 to-purple-300 text-purple-900' :
                                                                solicitud.estado === 'completada' ? 'bg-gradient-to-r from-green-200 to-green-300 text-green-900' :
                                                                'bg-gradient-to-r from-red-200 to-red-300 text-red-900'
                                                            }`}>
                                                                {solicitud.estado.replace('_', ' ')}
                                                            </div>
                                                            <div className={`px-4 py-2 rounded-2xl text-xs font-bold shadow-lg ${
                                                                solicitud.prioridad === 'alta' ? 'bg-gradient-to-r from-red-200 to-red-300 text-red-900' :
                                                                solicitud.prioridad === 'media' ? 'bg-gradient-to-r from-orange-200 to-orange-300 text-orange-900' :
                                                                'bg-gradient-to-r from-green-200 to-green-300 text-green-900'
                                                            }`}>
                                                                {solicitud.prioridad}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-600 font-medium ml-4">
                                                    <div className="w-8 h-8 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl flex items-center justify-center">
                                                        <Calendar className="w-4 h-4" />
                                                    </div>
                                                    {formatDate(solicitud.fecha_creacion)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Monthly Summary */}
                    <div className="bg-gradient-to-br from-cyan-100/80 to-teal-100/80 backdrop-blur-lg rounded-3xl border border-cyan-200/50 shadow-xl shadow-cyan-200/40 overflow-hidden">
                        <div className="bg-gradient-to-r from-cyan-200/60 to-teal-200/60 p-6 border-b border-cyan-300/30 backdrop-blur-sm">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-inner">
                                    <Calendar className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800">Resumen del Mes</h3>
                                    <p className="text-sm text-gray-600">Estadísticas del mes actual</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-gradient-to-br from-white/60 to-cyan-50/60 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-2xl flex items-center justify-center shadow-inner">
                                            <span className="text-white font-bold text-2xl">📊</span>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 font-medium mb-1">Solicitudes este mes</p>
                                            <p className="text-3xl font-black text-cyan-800">{stats.solicitudes_este_mes}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gradient-to-br from-white/60 to-teal-50/60 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-teal-600 rounded-2xl flex items-center justify-center shadow-inner">
                                            <span className="text-white font-bold text-2xl">✅</span>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 font-medium mb-1">Promedio de completado</p>
                                            <p className="text-3xl font-black text-teal-800">{stats.promedio_completado}%</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
