<?php

use App\Models\Solicitud;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

beforeEach(function () {
    Storage::fake('public');
    
    // Create roles
    Role::create(['name' => 'admin']);
    Role::create(['name' => 'super-admin']);
    Role::create(['name' => 'user']);
});

test('admin can view all solicitudes', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');
    
    $user = User::factory()->create();
    $user->assignRole('user');
    
    // Create solicitudes for different users (ensuring they are not completed)
    Solicitud::factory()->create(['user_id' => $admin->id, 'estado' => 'pendiente']);
    Solicitud::factory()->create(['user_id' => $user->id, 'estado' => 'en_diseño']);
    
    $response = $this->actingAs($admin)->get('/solicitudes');
    
    $response->assertOk();
    $response->assertInertia(fn ($page) => 
        $page->component('solicitudes/index')
            ->has('solicitudes.en_progreso', 2)
    );
});

test('regular user can only view their own solicitudes', function () {
    $user1 = User::factory()->create();
    $user1->assignRole('user');
    
    $user2 = User::factory()->create();
    $user2->assignRole('user');
    
    // Create solicitudes for different users (ensuring they are not completed)
    Solicitud::factory()->create(['user_id' => $user1->id, 'estado' => 'pendiente']);
    Solicitud::factory()->create(['user_id' => $user2->id, 'estado' => 'pendiente']);
    
    $response = $this->actingAs($user1)->get('/solicitudes');
    
    $response->assertOk();
    $response->assertInertia(fn ($page) => 
        $page->component('solicitudes/index')
            ->has('solicitudes.en_progreso', 1)
    );
});

test('can create solicitud with files', function () {
    $user = User::factory()->create();
    $user->assignRole('user');
    
    $pdf = UploadedFile::fake()->create('document.pdf', 1024);
    $logo = UploadedFile::fake()->image('logo.jpg');
    
    $response = $this->actingAs($user)->post('/solicitudes', [
        'nombre_cliente' => 'Test Client',
        'nombre_landing' => 'Test Landing',
        'nombre_producto' => 'Test Product',
        'estado' => 'pendiente',
        'prioridad' => 'alta',
        'archivo_pdf' => $pdf,
        'logo' => $logo,
    ]);
    
    $response->assertRedirect('/solicitudes');
    
    $solicitud = Solicitud::first();
    expect($solicitud->nombre_cliente)->toBe('Test Client');
    expect($solicitud->user_id)->toBe($user->id);
    expect($solicitud->archivo_pdf)->not->toBeNull();
    expect($solicitud->logo)->not->toBeNull();
    
    expect(Storage::disk('public')->exists($solicitud->archivo_pdf))->toBeTrue();
    expect(Storage::disk('public')->exists($solicitud->logo))->toBeTrue();
});

test('regular user cannot delete solicitudes', function () {
    $user = User::factory()->create();
    $user->assignRole('user');
    
    $solicitud = Solicitud::factory()->create(['user_id' => $user->id]);
    
    $response = $this->actingAs($user)->delete("/solicitudes/{$solicitud->id}");
    
    $response->assertForbidden();
});

test('admin can delete non-completed solicitudes', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');
    
    $solicitud = Solicitud::factory()->create([
        'user_id' => $admin->id,
        'estado' => 'pendiente'
    ]);
    
    $response = $this->actingAs($admin)->delete("/solicitudes/{$solicitud->id}");
    
    $response->assertRedirect('/solicitudes');
    expect(Solicitud::count())->toBe(0);
});

test('admin cannot delete completed solicitudes', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');
    
    $solicitud = Solicitud::factory()->create([
        'user_id' => $admin->id,
        'estado' => 'completada'
    ]);
    
    $response = $this->actingAs($admin)->delete("/solicitudes/{$solicitud->id}");
    
    $response->assertRedirect('/solicitudes');
    expect(Solicitud::count())->toBe(1);
});

test('user can edit their own solicitudes', function () {
    $user = User::factory()->create();
    $user->assignRole('user');
    
    $solicitud = Solicitud::factory()->create(['user_id' => $user->id]);
    
    $response = $this->actingAs($user)->put("/solicitudes/{$solicitud->id}", [
        'nombre_cliente' => 'Updated Client',
        'nombre_landing' => $solicitud->nombre_landing,
        'nombre_producto' => $solicitud->nombre_producto,
        'estado' => 'en_diseño',
        'prioridad' => $solicitud->prioridad,
    ]);
    
    $response->assertRedirect('/solicitudes');
    
    $solicitud->refresh();
    expect($solicitud->nombre_cliente)->toBe('Updated Client');
    expect($solicitud->estado)->toBe('en_diseño');
});

test('user cannot edit other users solicitudes', function () {
    $user1 = User::factory()->create();
    $user1->assignRole('user');
    
    $user2 = User::factory()->create();
    $user2->assignRole('user');
    
    $solicitud = Solicitud::factory()->create(['user_id' => $user2->id]);
    
    $response = $this->actingAs($user1)->put("/solicitudes/{$solicitud->id}", [
        'nombre_cliente' => 'Hacked Client',
        'nombre_landing' => $solicitud->nombre_landing,
        'nombre_producto' => $solicitud->nombre_producto,
        'estado' => $solicitud->estado,
        'prioridad' => $solicitud->prioridad,
    ]);
    
    $response->assertForbidden();
});
