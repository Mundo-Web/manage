<?php

namespace App\Http\Controllers;

use App\Models\Solicitud;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function solicitudes()
    {
        // Obtener estadísticas generales
        $totalSolicitudes = Solicitud::count();
        $solicitudesPendientes = Solicitud::where('estado', 'pendiente')->count();
        $solicitudesEnProceso = Solicitud::whereIn('estado', ['en_diseño', 'en_programación'])->count();
        $solicitudesCompletadas = Solicitud::where('estado', 'completada')->count();
        
        // Solicitudes de este mes
        $solicitudesEsteMes = Solicitud::whereMonth('fecha_creacion', Carbon::now()->month)
            ->whereYear('fecha_creacion', Carbon::now()->year)
            ->count();
        
        // Distribución por prioridad
        $solicitudesPorPrioridad = [
            'alta' => Solicitud::where('prioridad', 'alta')->count(),
            'media' => Solicitud::where('prioridad', 'media')->count(),
            'baja' => Solicitud::where('prioridad', 'baja')->count(),
        ];
        
        // Últimas solicitudes
        $ultimasSolicitudes = Solicitud::with('user')
            ->latest('fecha_creacion')
            ->take(5)
            ->get();
        
        // Promedio de completado
        $promedioCompletado = $totalSolicitudes > 0 
            ? round(($solicitudesCompletadas / $totalSolicitudes) * 100, 1)
            : 0;
        
        $stats = [
            'total_solicitudes' => $totalSolicitudes,
            'solicitudes_pendientes' => $solicitudesPendientes,
            'solicitudes_en_proceso' => $solicitudesEnProceso,
            'solicitudes_completadas' => $solicitudesCompletadas,
            'solicitudes_este_mes' => $solicitudesEsteMes,
            'solicitudes_por_prioridad' => $solicitudesPorPrioridad,
            'ultimas_solicitudes' => $ultimasSolicitudes,
            'promedio_completado' => $promedioCompletado,
        ];
        
        return Inertia::render('dashboard/solicitudes', [
            'stats' => $stats,
        ]);
    }
}
