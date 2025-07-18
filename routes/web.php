<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\SolicitudController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', [AuthenticatedSessionController::class, 'create'])
        ->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');

    // Dashboard de solicitudes
    Route::get('/dashboard/solicitudes', [App\Http\Controllers\DashboardController::class, 'solicitudes'])
        ->name('dashboard.solicitudes');

    // Rutas de Solicitudes
    Route::resource('solicitudes', App\Http\Controllers\SolicitudController::class);
    
    // Ruta especial para actualizar solo el estado (super-admin only)
    Route::patch('/solicitudes/{solicitud}/status', [App\Http\Controllers\SolicitudController::class, 'updateStatus'])
        ->name('solicitudes.update-status');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
