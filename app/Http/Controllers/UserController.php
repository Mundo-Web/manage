<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class UserController extends Controller
{
    /**
     * Display a listing of users (Super Admin only).
     */
    public function index()
    {
        $user = Auth::user();
        
        // Only super-admin can access users management
        if (!$user->hasRole('super-admin')) {
            abort(403, 'Solo el super-admin puede gestionar usuarios.');
        }

        $users = User::with('roles')
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return Inertia::render('usuarios/index', [
            'users' => $users,
        ]);
    }

    /**
     * Reset password for a user (Super Admin only).
     * The new password will be the same as the user's email.
     */
    public function resetPassword(Request $request, User $user)
    {
        $currentUser = Auth::user();
        
        // Log para debug
        Log::info('Reset password attempt', [
            'current_user_id' => $currentUser->id,
            'target_user_id' => $user->id,
            'current_user_roles' => $currentUser->getRoleNames(),
            'is_super_admin' => $currentUser->hasRole('super-admin')
        ]);
        
        // Only super-admin can reset passwords
        if (!$currentUser->hasRole('super-admin')) {
            Log::error('User without super-admin role tried to reset password', [
                'user_id' => $currentUser->id,
                'roles' => $currentUser->getRoleNames()
            ]);
            abort(403, 'Solo el super-admin puede resetear contraseñas.');
        }

        // Don't allow resetting own password through this method
        if ($currentUser->id === $user->id) {
            Log::warning('User tried to reset own password', [
                'user_id' => $currentUser->id
            ]);
            return back()->withErrors(['error' => 'No puedes resetear tu propia contraseña desde aquí.']);
        }

        try {
            // Set password to be the same as email
            $user->update([
                'password' => Hash::make($user->email),
            ]);

            Log::info('Password reset successful', [
                'target_user_id' => $user->id,
                'target_user_email' => $user->email,
                'reset_by' => $currentUser->id
            ]);

            return back()->with('success', "Contraseña de {$user->name} reseteada exitosamente. La nueva contraseña es: {$user->email}");
            
        } catch (\Exception $e) {
            Log::error('Password reset failed', [
                'target_user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return back()->withErrors(['error' => 'Error al resetear la contraseña: ' . $e->getMessage()]);
        }
    }
}
