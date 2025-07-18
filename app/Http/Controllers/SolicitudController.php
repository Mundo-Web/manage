<?php

namespace App\Http\Controllers;

use App\Http\Requests\SolicitudRequest;
use App\Models\Solicitud;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class SolicitudController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $user = Auth::user();
        
        // Build base query based on user role
        $query = Solicitud::with('user');
        
        if (!$user->hasAnyRole(['admin', 'super-admin'])) {
            // Regular users can only see their own solicitudes
            $query->where('user_id', $user->id);
        }

        // Apply filters
        if ($request->has('estado') && $request->estado !== '') {
            $query->where('estado', $request->estado);
        }

        if ($request->has('prioridad') && $request->prioridad !== '') {
            $query->where('prioridad', $request->prioridad);
        }

        // Get paginated solicitudes (10 per page)
        $solicitudes = $query->latest('fecha_creacion')->paginate(10);

        // Debug: Log what we're sending to frontend
        Log::info('Pagination debug', [
            'current_page' => $solicitudes->currentPage(),
            'last_page' => $solicitudes->lastPage(),
            'total' => $solicitudes->total(),
            'per_page' => $solicitudes->perPage(),
            'has_links' => method_exists($solicitudes, 'links'),
            'links_count' => count($solicitudes->linkCollection()),
            'solicitudes_structure' => [
                'data' => count($solicitudes->items()),
                'links' => count($solicitudes->linkCollection()),
                'meta' => [
                    'current_page' => $solicitudes->currentPage(),
                    'last_page' => $solicitudes->lastPage(),
                    'total' => $solicitudes->total(),
                ]
            ]
        ]);

        // Manually structure the pagination data for Inertia
        $paginationData = [
            'data' => $solicitudes->items(),
            'links' => $solicitudes->linkCollection()->toArray(),
            'meta' => [
                'current_page' => $solicitudes->currentPage(),
                'last_page' => $solicitudes->lastPage(),
                'total' => $solicitudes->total(),
                'per_page' => $solicitudes->perPage(),
                'from' => $solicitudes->firstItem(),
                'to' => $solicitudes->lastItem(),
            ]
        ];

        return Inertia::render('solicitudes/index', [
            'solicitudes' => $paginationData,
            'filters' => [
                'search' => $request->search,
                'estado' => $request->estado,
                'prioridad' => $request->prioridad,
            ],
            'estados' => ['pendiente', 'en_diseño', 'en_programación', 'completada'],
            'prioridades' => ['alta', 'media', 'baja'],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('solicitudes/create', [
            'estados' => ['pendiente', 'en_diseño', 'en_programación', 'completada'],
            'prioridades' => ['alta', 'media', 'baja'],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(SolicitudRequest $request)
    {
        $data = $request->validated();
        $data['user_id'] = Auth::id();
        $data['fecha_creacion'] = now();

        // Handle file uploads
        if ($request->hasFile('archivo_pdf')) {
            $data['archivo_pdf'] = $request->file('archivo_pdf')->store('solicitudes/pdfs', 'public');
        }

        if ($request->hasFile('logo')) {
            $data['logo'] = $request->file('logo')->store('solicitudes/logos', 'public');
        }

        Solicitud::create($data);

        return redirect()->route('solicitudes.index')
            ->with('success', 'Solicitud creada exitosamente.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Solicitud $solicitud): Response
    {
        $user = Auth::user();

        // Check permissions
        if (!$user->hasAnyRole(['admin', 'super-admin']) && $solicitud->user_id !== $user->id) {
            abort(403, 'No tienes permisos para editar esta solicitud.');
        }

        return Inertia::render('solicitudes/edit', [
            'solicitud' => $solicitud->load('user'),
            'estados' => ['pendiente', 'en_diseño', 'en_programación', 'completada'],
            'prioridades' => ['alta', 'media', 'baja'],
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(SolicitudRequest $request, Solicitud $solicitud)
    {
        $user = Auth::user();

        // Log detallado para debug
        Log::info('Update method called', [
            'route_params' => $request->route()->parameters(),
            'request_method' => $request->method(),
            'request_url' => $request->url(),
            'request_all' => $request->all(),
            'request_input' => $request->input(),
            'files' => $request->allFiles(),
            'content_type' => $request->header('Content-Type'),
            'solicitud_id' => $solicitud?->id,
            'solicitud_exists' => $solicitud->exists,
            'user_id' => $user->id
        ]);

        // Verificar que la solicitud existe y tiene ID
        if (!$solicitud->exists || !$solicitud->id) {
            Log::error('Solicitud not found or has no ID', [
                'solicitud_exists' => $solicitud->exists,
                'solicitud_id' => $solicitud->id,
                'route_params' => $request->route()->parameters()
            ]);
            abort(404, 'Solicitud no encontrada');
        }

        // Check permissions
        if (!$user->hasAnyRole(['admin', 'super-admin']) && $solicitud->user_id !== $user->id) {
            abort(403, 'No tienes permisos para editar esta solicitud.');
        }

        $data = $request->validated();
        
        // Remove estado from update data as it's handled separately
        unset($data['estado']);

        // Handle file uploads
        if ($request->hasFile('archivo_pdf')) {
            // Delete old file if exists
            if ($solicitud->archivo_pdf) {
                Storage::disk('public')->delete($solicitud->archivo_pdf);
            }
            $data['archivo_pdf'] = $request->file('archivo_pdf')->store('solicitudes/pdfs', 'public');
        }

        if ($request->hasFile('logo')) {
            // Delete old file if exists
            if ($solicitud->logo) {
                Storage::disk('public')->delete($solicitud->logo);
            }
            $data['logo'] = $request->file('logo')->store('solicitudes/logos', 'public');
        }

        Log::info('About to update solicitud', [
            'solicitud_id' => $solicitud->id,
            'data_to_update' => $data
        ]);

        // Perform the update
        $updated = $solicitud->update($data);
        
        Log::info('Solicitud update result', [
            'updated' => $updated,
            'solicitud_id' => $solicitud->id,
            'solicitud_after' => $solicitud->fresh()->toArray()
        ]);

        return redirect()->route('solicitudes.index')
            ->with('success', 'Solicitud actualizada exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Solicitud $solicitud)
    {
        $user = Auth::user();

        // Check permissions - users can't delete, only admins can
        if (!$user->hasAnyRole(['admin', 'super-admin'])) {
            abort(403, 'No tienes permisos para eliminar solicitudes.');
        }

        // Protect completed requests from deletion
        if ($solicitud->isCompletada()) {
            return redirect()->route('solicitudes.index')
                ->withErrors(['error' => 'No se pueden eliminar solicitudes completadas.']);
        }

        // Delete associated files
        if ($solicitud->archivo_pdf) {
            Storage::disk('public')->delete($solicitud->archivo_pdf);
        }
        if ($solicitud->logo) {
            Storage::disk('public')->delete($solicitud->logo);
        }

        $solicitud->delete();

        return redirect()->route('solicitudes.index')
            ->with('success', 'Solicitud eliminada exitosamente.');
    }

    /**
     * Update only the status of a solicitud.
     * Only super-admin can use this endpoint.
     */
    public function updateStatus(Request $request, Solicitud $solicitud)
    {
        $user = Auth::user();
        
        // Only super-admin can update status
        if (!$user->hasRole('super-admin')) {
            abort(403, 'Solo el super-admin puede actualizar estados.');
        }

        $request->validate([
            'estado' => 'required|in:pendiente,en_diseño,en_programación,completada'
        ]);

        $solicitud->update([
            'estado' => $request->estado
        ]);

        return back()->with('success', 'Estado actualizado exitosamente.');
    }
}
