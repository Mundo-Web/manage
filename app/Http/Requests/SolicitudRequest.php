<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SolicitudRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Will be handled by middleware and controller logic
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $rules = [
            'nombre_cliente' => ['required', 'string', 'max:255'],
            'nombre_landing' => ['required', 'string', 'max:255'],
            'nombre_producto' => ['required', 'string', 'max:255'],
            'prioridad' => ['required', 'in:alta,media,baja'],
            'archivo_pdf' => ['nullable', 'file', 'mimes:pdf', 'max:10240'], // 10MB max
            'logo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,svg', 'max:5120'], // 5MB max
        ];

        // Solo requerir estado en creación, no en actualización
        if ($this->isMethod('post')) {
            $rules['estado'] = ['required', 'in:pendiente,en_diseño,en_programación,completada'];
        } else {
            $rules['estado'] = ['sometimes', 'in:pendiente,en_diseño,en_programación,completada'];
        }

        return $rules;
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'nombre_cliente.required' => 'El nombre del cliente es obligatorio.',
            'nombre_landing.required' => 'El nombre de la landing page es obligatorio.',
            'nombre_producto.required' => 'El nombre del producto es obligatorio.',
            'estado.in' => 'El estado seleccionado no es válido.',
            'prioridad.in' => 'La prioridad seleccionada no es válida.',
            'archivo_pdf.mimes' => 'El archivo debe ser un PDF.',
            'archivo_pdf.max' => 'El archivo PDF no puede superar los 10MB.',
            'logo.image' => 'El logo debe ser una imagen.',
            'logo.mimes' => 'El logo debe ser JPG, JPEG, PNG o SVG.',
            'logo.max' => 'El logo no puede superar los 5MB.',
        ];
    }
}
