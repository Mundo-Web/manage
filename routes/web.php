<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\SolicitudController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    if (Auth::check()) {
        return redirect()->route('dashboard.solicitudes');
    }
    return redirect()->route('login');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
  /*  Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');
 */
    // Dashboard de solicitudes
    Route::get('/dashboard', [App\Http\Controllers\DashboardController::class, 'solicitudes'])
        ->name('dashboard.solicitudes');

    // Rutas de Solicitudes
    Route::resource('solicitudes', App\Http\Controllers\SolicitudController::class)
        ->parameters(['solicitudes' => 'solicitud']);
    
    // Ruta especial para actualizar solo el estado (super-admin only)
    Route::patch('/solicitudes/{solicitud}/status', [App\Http\Controllers\SolicitudController::class, 'updateStatus'])
        ->name('solicitudes.update-status');

    // Rutas de Usuarios (solo super-admin)
    Route::get('/usuarios', [UserController::class, 'index'])
        ->name('usuarios.index');
    
    Route::patch('/usuarios/{user}/reset-password', [UserController::class, 'resetPassword'])
        ->name('usuarios.reset-password');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
