<?php

namespace Database\Seeders;

use App\Models\Solicitud;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class SolicitudSeeder extends Seeder
{
    /**
     * Run the database seeder.
     */
    public function run(): void
    {
        // Create roles if they don't exist
        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $superAdminRole = Role::firstOrCreate(['name' => 'super-admin']);
        $userRole = Role::firstOrCreate(['name' => 'user']);

        // Create test users with roles
        $admin = User::firstOrCreate([
            'email' => 'admin@requestly.com'
        ], [
            'name' => 'Admin User',
            'password' => bcrypt('password'),
            'email_verified_at' => now(),
        ]);
        $admin->assignRole($adminRole);

        $superAdmin = User::firstOrCreate([
            'email' => 'superadmin@requestly.com'
        ], [
            'name' => 'Super Admin User',
            'password' => bcrypt('password'),
            'email_verified_at' => now(),
        ]);
        $superAdmin->assignRole($superAdminRole);

        $regularUser = User::firstOrCreate([
            'email' => 'user@requestly.com'
        ], [
            'name' => 'Regular User',
            'password' => bcrypt('password'),
            'email_verified_at' => now(),
        ]);
        $regularUser->assignRole($userRole);

        // Create sample solicitudes
        Solicitud::factory(5)->create(['user_id' => $admin->id]);
        Solicitud::factory(3)->create(['user_id' => $superAdmin->id]);
        Solicitud::factory(8)->create(['user_id' => $regularUser->id]);

        // Create some completed solicitudes
        Solicitud::factory(3)->completed()->create(['user_id' => $admin->id]);
        Solicitud::factory(2)->completed()->create(['user_id' => $regularUser->id]);
    }
}
