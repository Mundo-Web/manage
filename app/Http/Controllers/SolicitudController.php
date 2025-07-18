<?php

namespace App\Http\Controllers;

use App\Http\Requests\SolicitudRequest;
use App\Models\Solicitud;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
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

        $solicitudes = $query->orderBy('fecha_creacion', 'desc')->get();

                // Get paginated solicitudes
        $solicitudes = $query->latest('fecha_creacion')->paginate(10);

        return Inertia::render('solicitudes/index', [
            'solicitudes' => $solicitudes,
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

        // Check permissions
        if (!$user->hasAnyRole(['admin', 'super-admin']) && $solicitud->user_id !== $user->id) {
            abort(403, 'No tienes permisos para editar esta solicitud.');
        }

        $data = $request->validated();

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

        $solicitud->update($data);

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
