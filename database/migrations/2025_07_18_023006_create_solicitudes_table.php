<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('solicitudes', function (Blueprint $table) {
            $table->id();
            $table->string('nombre_cliente');
            $table->string('nombre_landing');
            $table->string('nombre_producto');
            $table->enum('estado', ['pendiente', 'en_diseño', 'en_programación', 'completada'])->default('pendiente');
            $table->enum('prioridad', ['alta', 'media', 'baja'])->default('media');
            $table->timestamp('fecha_creacion')->useCurrent();
            $table->string('archivo_pdf')->nullable();
            $table->string('logo')->nullable();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('solicitudes');
    }
};
