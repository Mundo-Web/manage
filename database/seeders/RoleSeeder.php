<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Hash;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeder.
     */
    public function run(): void
    {
        // Create roles
        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $superAdminRole = Role::firstOrCreate(['name' => 'super-admin']);

        // Create the only super-admin user
        $superAdmin = User::firstOrCreate([
            'email' => 'superadmin@mundoweb.com'
        ], [
            'name' => 'Super Admin',
            'password' => Hash::make('mundoweb2025'),
            'email_verified_at' => now(),
        ]);

        // Assign super-admin role
        if (!$superAdmin->hasRole('super-admin')) {
            $superAdmin->assignRole($superAdminRole);
        }

        $this->command->info('Roles created successfully!');
        $this->command->info('Super Admin created: superadmin@mundoweb.com / mundoweb2025');
    }
}
