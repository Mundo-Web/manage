<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Solicitud extends Model
{
    use HasFactory;

    protected $table = 'solicitudes';

    protected $fillable = [
        'nombre_cliente',
        'nombre_landing',
        'nombre_producto',
        'estado',
        'prioridad',
        'fecha_creacion',
        'archivo_pdf',
        'logo',
        'user_id',
    ];

    protected $casts = [
        'fecha_creacion' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function getEstadoBadgeColorAttribute(): string
    {
        return match ($this->estado) {
            'pendiente' => 'bg-gray-100 text-gray-800',
            'en_diseño' => 'bg-blue-100 text-blue-800',
            'en_programación' => 'bg-yellow-100 text-yellow-800',
            'completada' => 'bg-green-100 text-green-800',
            default => 'bg-gray-100 text-gray-800',
        };
    }

    public function getPrioridadRowColorAttribute(): string
    {
        return match ($this->prioridad) {
            'alta' => 'bg-red-50',
            'media' => 'bg-yellow-50',
            'baja' => 'bg-green-50',
            default => 'bg-white',
        };
    }

    public function isCompletada(): bool
    {
        return $this->estado === 'completada';
    }
}
