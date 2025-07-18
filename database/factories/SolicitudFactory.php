<?php

namespace Database\Factories;

use App\Models\Solicitud;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Solicitud>
 */
class SolicitudFactory extends Factory
{
    protected $model = Solicitud::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nombre_cliente' => $this->faker->company(),
            'nombre_landing' => $this->faker->words(3, true) . ' Landing Page',
            'nombre_producto' => $this->faker->words(2, true) . ' Product',
            'estado' => $this->faker->randomElement(['pendiente', 'en_diseño', 'en_programación', 'completada']),
            'prioridad' => $this->faker->randomElement(['alta', 'media', 'baja']),
            'fecha_creacion' => $this->faker->dateTimeBetween('-1 month', 'now'),
            'archivo_pdf' => null,
            'logo' => null,
            'user_id' => User::factory(),
        ];
    }

    public function completed(): Factory
    {
        return $this->state(fn (array $attributes) => [
            'estado' => 'completada',
        ]);
    }

    public function highPriority(): Factory
    {
        return $this->state(fn (array $attributes) => [
            'prioridad' => 'alta',
        ]);
    }
}
