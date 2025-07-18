import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import InputError from '@/components/input-error';
import { type BreadcrumbItem, type Solicitud } from '@/types';

interface EditPageProps {
    solicitud: Solicitud;
    estados: string[];
    prioridades: string[];
}

export default function Edit({ solicitud, estados, prioridades }: EditPageProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Solicitudes',
            href: '/solicitudes',
        },
        {
            title: `Editar: ${solicitud.nombre_cliente}`,
            href: `/solicitudes/${solicitud.id}/edit`,
        },
    ];

    const { data, setData, post, processing, errors } = useForm({
        nombre_cliente: solicitud.nombre_cliente,
        nombre_landing: solicitud.nombre_landing,
        nombre_producto: solicitud.nombre_producto,
        estado: solicitud.estado,
        prioridad: solicitud.prioridad,
        archivo_pdf: null as File | null,
        logo: null as File | null,
        _method: 'PUT',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('solicitudes.update', solicitud.id), {
            forceFormData: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Editar Solicitud - ${solicitud.nombre_cliente}`} />

            <div className="max-w-2xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle>Editar Solicitud de Landing Page</CardTitle>
                        <CardDescription>
                            Modifica los datos de la solicitud de {solicitud.nombre_cliente}.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-6">
                            {/* Información del Cliente */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">Información del Cliente</h3>
                                
                                <div>
                                    <Label htmlFor="nombre_cliente">Nombre del Cliente *</Label>
                                    <Input
                                        id="nombre_cliente"
                                        type="text"
                                        value={data.nombre_cliente}
                                        className="mt-1"
                                        onChange={(e) => setData('nombre_cliente', e.target.value)}
                                        placeholder="Ej: Empresa ABC S.A."
                                    />
                                    <InputError message={errors.nombre_cliente} className="mt-2" />
                                </div>
                            </div>

                            {/* Información del Proyecto */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">Información del Proyecto</h3>
                                
                                <div>
                                    <Label htmlFor="nombre_landing">Nombre de la Landing Page *</Label>
                                    <Input
                                        id="nombre_landing"
                                        type="text"
                                        value={data.nombre_landing}
                                        className="mt-1"
                                        onChange={(e) => setData('nombre_landing', e.target.value)}
                                        placeholder="Ej: Landing Page Promocional"
                                    />
                                    <InputError message={errors.nombre_landing} className="mt-2" />
                                </div>

                                <div>
                                    <Label htmlFor="nombre_producto">Nombre del Producto *</Label>
                                    <Input
                                        id="nombre_producto"
                                        type="text"
                                        value={data.nombre_producto}
                                        className="mt-1"
                                        onChange={(e) => setData('nombre_producto', e.target.value)}
                                        placeholder="Ej: Software de Gestión"
                                    />
                                    <InputError message={errors.nombre_producto} className="mt-2" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="estado">Estado *</Label>
                                        <Select value={data.estado} onValueChange={(value) => setData('estado', value as typeof data.estado)}>
                                            <SelectTrigger className="mt-1">
                                                <SelectValue placeholder="Seleccionar estado" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {estados.map((estado) => (
                                                    <SelectItem key={estado} value={estado}>
                                                        {estado.replace('_', ' ')}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.estado} className="mt-2" />
                                    </div>

                                    <div>
                                        <Label htmlFor="prioridad">Prioridad *</Label>
                                        <Select value={data.prioridad} onValueChange={(value) => setData('prioridad', value as typeof data.prioridad)}>
                                            <SelectTrigger className="mt-1">
                                                <SelectValue placeholder="Seleccionar prioridad" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {prioridades.map((prioridad) => (
                                                    <SelectItem key={prioridad} value={prioridad}>
                                                        {prioridad}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.prioridad} className="mt-2" />
                                    </div>
                                </div>
                            </div>

                            {/* Archivos Actuales */}
                            {(solicitud.archivo_pdf || solicitud.logo) && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium">Archivos Actuales</h3>
                                    <div className="bg-gray-50 p-4 rounded-md">
                                        {solicitud.archivo_pdf && (
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm text-gray-600">PDF actual:</span>
                                                <a 
                                                    href={`/storage/${solicitud.archivo_pdf}`} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="text-indigo-600 hover:text-indigo-800 text-sm"
                                                >
                                                    Ver archivo
                                                </a>
                                            </div>
                                        )}
                                        {solicitud.logo && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">Logo actual:</span>
                                                <a 
                                                    href={`/storage/${solicitud.logo}`} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="text-indigo-600 hover:text-indigo-800 text-sm"
                                                >
                                                    Ver imagen
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Archivos Nuevos */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">Reemplazar Archivos</h3>
                                
                                <div>
                                    <Label htmlFor="archivo_pdf">Nuevo Archivo PDF</Label>
                                    <Input
                                        id="archivo_pdf"
                                        type="file"
                                        accept=".pdf"
                                        className="mt-1"
                                        onChange={(e) => setData('archivo_pdf', e.target.files?.[0] || null)}
                                    />
                                    <p className="text-sm text-gray-500 mt-1">
                                        Opcional. Formato PDF, máximo 10MB. Solo subir si quieres reemplazar el archivo actual.
                                    </p>
                                    <InputError message={errors.archivo_pdf} className="mt-2" />
                                </div>

                                <div>
                                    <Label htmlFor="logo">Nuevo Logo</Label>
                                    <Input
                                        id="logo"
                                        type="file"
                                        accept="image/*"
                                        className="mt-1"
                                        onChange={(e) => setData('logo', e.target.files?.[0] || null)}
                                    />
                                    <p className="text-sm text-gray-500 mt-1">
                                        Opcional. Formatos: JPG, PNG, SVG. Máximo 5MB. Solo subir si quieres reemplazar el logo actual.
                                    </p>
                                    <InputError message={errors.logo} className="mt-2" />
                                </div>
                            </div>

                            {/* Información adicional */}
                            <div className="bg-blue-50 p-4 rounded-md">
                                <p className="text-sm text-blue-800">
                                    <strong>Creado por:</strong> {solicitud.user?.name || 'Usuario desconocido'} <br />
                                    <strong>Fecha de creación:</strong> {new Date(solicitud.fecha_creacion).toLocaleDateString('es-ES', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                            </div>

                            {/* Botones */}
                            <div className="flex items-center justify-end space-x-4 pt-6 border-t">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => window.history.back()}
                                >
                                    Cancelar
                                </Button>
                                <Button 
                                    type="submit" 
                                    disabled={processing}
                                    className="bg-indigo-600 hover:bg-indigo-700"
                                >
                                    {processing ? 'Guardando...' : 'Guardar Cambios'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
