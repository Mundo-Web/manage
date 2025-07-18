import { useForm, router } from '@inertiajs/react';
import { FormEventHandler, useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import InputError from '@/components/input-error';
import { type Solicitud } from '@/types';
import { Upload, FileText, Image, X, CheckCircle, Eye, ScanEye } from 'lucide-react';

interface SolicitudModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    solicitud?: Solicitud | null;
    estados: string[];
    prioridades: string[];
    onSuccess?: () => void;
}

export function SolicitudModal({ 
    open, 
    onOpenChange, 
    solicitud, 
    estados, 
    prioridades, 
    onSuccess 
}: SolicitudModalProps) {
    const isEditing = !!solicitud;
    
    const [pdfPreview, setPdfPreview] = useState<string | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [isDraggingPdf, setIsDraggingPdf] = useState(false);
    const [isDraggingLogo, setIsDraggingLogo] = useState(false);
    const pdfInputRef = useRef<HTMLInputElement>(null);
    const logoInputRef = useRef<HTMLInputElement>(null);
    
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        nombre_cliente: solicitud?.nombre_cliente || '',
        nombre_landing: solicitud?.nombre_landing || '',
        nombre_producto: solicitud?.nombre_producto || '',
        estado: solicitud?.estado || 'pendiente',
        prioridad: solicitud?.prioridad || 'media',
        archivo_pdf: null as File | null,
        logo: null as File | null,
        _method: isEditing ? 'PUT' : 'POST',
    });

    // Reset form when modal opens/closes or solicitud changes
    useEffect(() => {
        if (open && solicitud) {
            setData({
                nombre_cliente: solicitud.nombre_cliente,
                nombre_landing: solicitud.nombre_landing,
                nombre_producto: solicitud.nombre_producto,
                estado: solicitud.estado || 'pendiente',
                prioridad: solicitud.prioridad,
                archivo_pdf: null,
                logo: null,
                _method: 'PUT',
            });
        } else if (open && !solicitud) {
            reset();
            setData(prev => ({ ...prev, _method: 'POST' }));
        }
        if (open) {
            clearErrors();
        }
    }, [open, solicitud, setData, reset, clearErrors]);

    // Cleanup effect cuando el modal se cierra
    useEffect(() => {
        let cleanupTimer: NodeJS.Timeout;
        
        if (!open) {
            // Función de limpieza completamente segura
            const performSafeCleanup = () => {
                // Usar requestAnimationFrame para asegurar que React termine su reconciliación
                requestAnimationFrame(() => {
                    try {
                        // Limpiar overlays de manera más específica
                        const selectors = [
                            '[data-radix-popper-content-wrapper]',
                            '[data-radix-dropdown-menu-content]', 
                            '[data-radix-select-content]',
                            '[data-radix-portal]',
                            '.radix-popper'
                        ];
                        
                        selectors.forEach(selector => {
                            const elements = document.querySelectorAll(selector);
                            elements.forEach(element => {
                                try {
                                    // Verificar si el elemento aún está en el DOM antes de intentar eliminarlo
                                    if (document.contains(element) && element.parentElement) {
                                        element.parentElement.removeChild(element);
                                    }
                                } catch (error) {
                                    // Silencioso - elemento ya removido o no accesible
                                }
                            });
                        });
                        
                        // Restaurar estilos del body de forma segura
                        Object.assign(document.body.style, {
                            overflow: '',
                            paddingRight: '',
                            pointerEvents: '',
                            position: '',
                            top: ''
                        });
                        
                        // Limpiar atributos inert de forma segura
                        document.querySelectorAll('[inert]').forEach(el => {
                            try {
                                el.removeAttribute('inert');
                            } catch (error) {
                                // Silencioso
                            }
                        });
                        
                    } catch (error) {
                        // Log solo en desarrollo, silencioso en producción
                        if (process.env.NODE_ENV === 'development') {
                            console.debug('Modal cleanup handled:', error);
                        }
                    }
                });
            };

            // Limpiar inmediatamente y después con timeout
            performSafeCleanup();
            cleanupTimer = setTimeout(performSafeCleanup, 100);
        }
        
        // Cleanup del timer cuando el componente se desmonte
        return () => {
            if (cleanupTimer) {
                clearTimeout(cleanupTimer);
            }
        };
    }, [open]);

    // Funciones para manejo de archivos
    const handleFileChange = (file: File | null, type: 'pdf' | 'logo') => {
        if (file) {
            if (type === 'pdf') {
                setData('archivo_pdf', file);
                setPdfPreview(`${file.name} (${formatFileSize(file.size)})`);
            } else {
                setData('logo', file);
                const reader = new FileReader();
                reader.onload = (e) => {
                    setLogoPreview(e.target?.result as string);
                };
                reader.readAsDataURL(file);
            }
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleDrop = (e: React.DragEvent, type: 'pdf' | 'logo') => {
        e.preventDefault();
        e.stopPropagation();
        
        if (type === 'pdf') {
            setIsDraggingPdf(false);
        } else {
            setIsDraggingLogo(false);
        }

        const files = Array.from(e.dataTransfer.files);
        const file = files[0];
        
        if (file) {
            if (type === 'pdf') {
                if (file.type === 'application/pdf') {
                    if (file.size <= 10 * 1024 * 1024) { // 10MB
                        handleFileChange(file, 'pdf');
                    } else {
                        alert('El archivo PDF debe ser menor a 10MB');
                    }
                } else {
                    alert('Solo se permiten archivos PDF');
                }
            } else if (type === 'logo') {
                if (file.type.startsWith('image/')) {
                    if (file.size <= 5 * 1024 * 1024) { // 5MB
                        handleFileChange(file, 'logo');
                    } else {
                        alert('La imagen debe ser menor a 5MB');
                    }
                } else {
                    alert('Solo se permiten imágenes');
                }
            }
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDragEnter = (e: React.DragEvent, type: 'pdf' | 'logo') => {
        e.preventDefault();
        e.stopPropagation();
        
        if (type === 'pdf') {
            setIsDraggingPdf(true);
        } else {
            setIsDraggingLogo(true);
        }
    };

    const handleDragLeave = (e: React.DragEvent, type: 'pdf' | 'logo') => {
        e.preventDefault();
        e.stopPropagation();
        
        if (type === 'pdf') {
            setIsDraggingPdf(false);
        } else {
            setIsDraggingLogo(false);
        }
    };

    const removeFile = (type: 'pdf' | 'logo') => {
        if (type === 'pdf') {
            setData('archivo_pdf', null);
            setPdfPreview(null);
        } else {
            setData('logo', null);
            setLogoPreview(null);
        }
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        
        if (isEditing) {
            // Verificar que tenemos una solicitud válida
            if (!solicitud?.id) {
                console.error('No se puede editar: solicitud ID no encontrado', solicitud);
                return;
            }
            
            // Para edición, enviar como objeto regular si no hay archivos nuevos
            if (!data.archivo_pdf && !data.logo) {
                // Sin archivos nuevos, enviar como objeto regular
                const updateData = {
                    nombre_cliente: data.nombre_cliente,
                    nombre_landing: data.nombre_landing,
                    nombre_producto: data.nombre_producto,
                    prioridad: data.prioridad,
                };
                
                console.log('Enviando datos de actualización (objeto):', {
                    ...updateData,
                    solicitud_id: solicitud?.id,
                    url: route('solicitudes.update', solicitud?.id)
                });
                
                router.put(route('solicitudes.update', solicitud.id), updateData, {
                    onSuccess: (page) => {
                        console.log('Update successful:', page);
                        handleClose();
                        onSuccess?.();
                    },
                    onError: (errors) => {
                        console.error('Update errors:', errors);
                    },
                    onFinish: () => {
                        console.log('Update request finished');
                    }
                });
            } else {
                // Con archivos, usar FormData
                const formData = new FormData();
                formData.append('nombre_cliente', data.nombre_cliente);
                formData.append('nombre_landing', data.nombre_landing);
                formData.append('nombre_producto', data.nombre_producto);
                formData.append('prioridad', data.prioridad);
                
                if (data.archivo_pdf) {
                    formData.append('archivo_pdf', data.archivo_pdf);
                }
                if (data.logo) {
                    formData.append('logo', data.logo);
                }
                
                console.log('Enviando datos de actualización (FormData):', {
                    nombre_cliente: data.nombre_cliente,
                    nombre_landing: data.nombre_landing,
                    nombre_producto: data.nombre_producto,
                    prioridad: data.prioridad,
                    solicitud_id: solicitud?.id,
                    url: route('solicitudes.update', solicitud?.id),
                    hasFiles: !!(data.archivo_pdf || data.logo)
                });
                
                router.post(route('solicitudes.update', solicitud.id), formData, {
                    forceFormData: true,
                    headers: {
                        'X-HTTP-Method-Override': 'PUT'
                    },
                    onSuccess: (page) => {
                        console.log('Update successful:', page);
                        handleClose();
                        onSuccess?.();
                    },
                    onError: (errors) => {
                        console.error('Update errors:', errors);
                    },
                    onFinish: () => {
                        console.log('Update request finished');
                    }
                });
            }
        } else {
            // Para creación, usar el método normal
            post(route('solicitudes.store'), {
                forceFormData: true,
                onSuccess: () => {
                    handleClose();
                    onSuccess?.();
                },
            });
        }
    };

    const handleClose = () => {
        // Primero limpiar el estado del modal
        reset();
        clearErrors();
        setPdfPreview(null);
        setLogoPreview(null);
        setIsDraggingPdf(false);
        setIsDraggingLogo(false);
        
        // Usar requestAnimationFrame para asegurar que React termine su ciclo
        requestAnimationFrame(() => {
            onOpenChange(false);
        });
    };

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            // Solo llamar handleClose, no hacer onOpenChange inmediatamente
            handleClose();
        } else {
            // Para abrir, llamar directamente onOpenChange
            onOpenChange(newOpen);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-3xl min-w-2xl max-h-[90vh] flex flex-col bg-gradient-to-br from-white/90 to-blue-50/90 backdrop-blur-xl rounded-3xl border border-white/50 shadow-2xl shadow-blue-200/30 scrollbar-thin scrollbar-track-blue-50/30 scrollbar-thumb-blue-300/50 hover:scrollbar-thumb-blue-400/70 scrollbar-thumb-rounded-full scrollbar-track-rounded-full z-50" 
                onEscapeKeyDown={handleClose}
                onPointerDownOutside={handleClose}
                onInteractOutside={handleClose}
            >
                <DialogHeader className="pb-6 flex-shrink-0">
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-700 bg-clip-text text-transparent">
                        {isEditing ? 'Editar Solicitud' : 'Nueva Solicitud'}
                    </DialogTitle>
                    <DialogDescription className="text-gray-600 font-medium">
                        {isEditing 
                            ? `Modifica los datos de la solicitud de ${solicitud?.nombre_cliente}.`
                            : 'Completa el formulario para crear una nueva solicitud de landing page.'
                        }
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 py-4 overflow-x-hidden overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-blue-200/40 hover:scrollbar-thumb-blue-300/60 scrollbar-thumb-rounded-full scrollbar-track-rounded-full pr-3">
                    <form onSubmit={submit} className="h-full flex flex-col">
                        <div className="flex-1 space-y-8 pr-2">
                    {/* Información del Cliente */}
                    <div className="space-y-6 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 rounded-2xl p-6 border border-blue-200/50 shadow-lg shadow-blue-100/50">
                        <h3 className="text-lg font-bold text-gray-900 pb-2 border-b border-blue-200/60">
                            Información del Cliente
                        </h3>
                        
                        <div className="space-y-2">
                            <Label htmlFor="nombre_cliente" className="text-sm font-bold text-gray-700">
                                Nombre del Cliente *
                            </Label>
                            <Input
                                id="nombre_cliente"
                                type="text"
                                value={data.nombre_cliente}
                                onChange={(e) => setData('nombre_cliente', e.target.value)}
                                placeholder="Ej: Empresa ABC S.A."
                                className="transition-all duration-300 focus:ring-2 focus:ring-blue-400 bg-white/80 backdrop-blur-sm rounded-xl border border-blue-200/50 shadow-inner font-medium"
                            />
                            <InputError message={errors.nombre_cliente} />
                        </div>
                    </div>

                    {/* Información del Proyecto */}
                    <div className="space-y-6 bg-gradient-to-br from-purple-50/80 to-pink-50/80 rounded-2xl p-6 border border-purple-200/50 shadow-lg shadow-purple-100/50">
                        <h3 className="text-lg font-bold text-gray-900 pb-2 border-b border-purple-200/60">
                            Información del Proyecto
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="nombre_landing" className="text-sm font-bold text-gray-700">
                                    Nombre de la Landing Page *
                                </Label>
                                <Input
                                    id="nombre_landing"
                                    type="text"
                                    value={data.nombre_landing}
                                    onChange={(e) => setData('nombre_landing', e.target.value)}
                                    placeholder="Ej: Landing Page Promocional"
                                    className="transition-all duration-300 focus:ring-2 focus:ring-purple-400 bg-white/80 backdrop-blur-sm rounded-xl border border-purple-200/50 shadow-inner font-medium"
                                />
                                <InputError message={errors.nombre_landing} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="nombre_producto" className="text-sm font-bold text-gray-700">
                                    Nombre del Producto *
                                </Label>
                                <Input
                                    id="nombre_producto"
                                    type="text"
                                    value={data.nombre_producto}
                                    onChange={(e) => setData('nombre_producto', e.target.value)}
                                    placeholder="Ej: Software de Gestión"
                                    className="transition-all duration-300 focus:ring-2 focus:ring-purple-400 bg-white/80 backdrop-blur-sm rounded-xl border border-purple-200/50 shadow-inner font-medium"
                                />
                                <InputError message={errors.nombre_producto} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1  gap-6">
                          
                            <div className="space-y-2">
                                <Label htmlFor="prioridad" className="text-sm font-bold text-gray-700">Prioridad *</Label>
                                <Select value={data.prioridad} onValueChange={(value) => setData('prioridad', value as typeof data.prioridad)}>
                                    <SelectTrigger className="transition-all duration-300 focus:ring-2 focus:ring-purple-400 bg-white/80 backdrop-blur-sm rounded-xl border border-purple-200/50 shadow-inner font-medium">
                                        <SelectValue placeholder="Seleccionar prioridad" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white/90 backdrop-blur-lg rounded-xl shadow-xl border border-white/50">
                                        {prioridades.map((prioridad) => (
                                            <SelectItem key={prioridad} value={prioridad} className="rounded-lg hover:bg-purple-100/80 font-medium">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-xl text-xs font-bold ${
                                                    prioridad === 'alta' ? 'bg-gradient-to-r from-red-200 to-red-300 text-red-900' :
                                                    prioridad === 'media' ? 'bg-gradient-to-r from-orange-200 to-orange-300 text-orange-900' :
                                                    'bg-gradient-to-r from-green-200 to-green-300 text-green-900'
                                                }`}>
                                                    {prioridad}
                                                </span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.prioridad} />
                            </div>
                        </div>
                    </div>

                    {/* Archivos Actuales (solo en edición) */}
                    {isEditing && (solicitud?.archivo_pdf || solicitud?.logo) && (
                        <div className="space-y-6 bg-gradient-to-br from-gray-50/80 to-slate-50/80 rounded-2xl p-6 border border-gray-200/50 shadow-lg shadow-gray-100/50">
                            <h3 className="text-lg font-bold text-gray-900 pb-2 border-b border-gray-200/60">
                                Archivos Actuales
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {solicitud.archivo_pdf && (
                                    <div className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-inner">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                                                <FileText className="h-5 w-5 text-white" />
                                            </div>
                                            <span className="text-sm font-bold text-gray-700">PDF actual</span>
                                        </div>
                                        <a 
                                            href={`/storage/${solicitud.archivo_pdf}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-2 py-2 rounded-xl text-sm font-bold shadow-lg transition-all duration-300 transform hover:scale-105"
                                        >
                                         <Eye/>
                                        </a>
                                    </div>
                                )}
                                {solicitud.logo && (
                                    <div className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-inner">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-500 rounded-xl flex items-center justify-center shadow-lg">
                                                <Image className="h-5 w-5 text-white" />
                                            </div>
                                            <span className="text-sm font-bold text-gray-700">Logo actual</span>
                                        </div>
                                        <a 
                                            href={`/storage/${solicitud.logo}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-2 py-2 rounded-xl text-sm font-bold shadow-lg transition-all duration-300 transform hover:scale-105"
                                        >
                                            <ScanEye/>
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Archivos */}
                    <div className="space-y-6 bg-gradient-to-br from-green-50/80 to-teal-50/80 rounded-2xl p-6 border border-green-200/50 shadow-lg shadow-green-100/50">
                        <h3 className="text-lg font-bold text-gray-900 pb-2 border-b border-green-200/60">
                            {isEditing ? 'Reemplazar Archivos' : 'Archivos'}
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* PDF Drag & Drop */}
                            <div className="space-y-2">
                                <Label htmlFor="archivo_pdf" className="text-sm font-bold text-gray-700">
                                    {isEditing ? 'Nuevo ' : ''}Archivo PDF
                                </Label>
                                <div 
                                    className={`relative border-2 border-dashed rounded-2xl p-6 transition-all duration-300 cursor-pointer bg-white/80 backdrop-blur-sm shadow-inner ${
                                        isDraggingPdf 
                                            ? 'border-green-400 bg-green-50/80 scale-105' 
                                            : 'border-green-300/50 hover:border-green-400 hover:bg-green-50/60'
                                    }`}
                                    onDrop={(e) => handleDrop(e, 'pdf')}
                                    onDragOver={handleDragOver}
                                    onDragEnter={(e) => handleDragEnter(e, 'pdf')}
                                    onDragLeave={(e) => handleDragLeave(e, 'pdf')}
                                    onClick={() => pdfInputRef.current?.click()}
                                >
                                    <input
                                        ref={pdfInputRef}
                                        id="archivo_pdf"
                                        type="file"
                                        accept=".pdf"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                if (file.type === 'application/pdf') {
                                                    if (file.size <= 10 * 1024 * 1024) {
                                                        handleFileChange(file, 'pdf');
                                                    } else {
                                                        alert('El archivo PDF debe ser menor a 10MB');
                                                        e.target.value = '';
                                                    }
                                                } else {
                                                    alert('Solo se permiten archivos PDF');
                                                    e.target.value = '';
                                                }
                                            }
                                        }}
                                        className="hidden"
                                    />
                                    
                                    {pdfPreview ? (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                                                    <FileText className="h-6 w-6 text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-800">{pdfPreview}</p>
                                                    <p className="text-xs text-green-600 font-medium">✓ Archivo seleccionado</p>
                                                </div>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeFile('pdf');
                                                }}
                                                className="text-red-500 hover:text-red-700 hover:bg-red-100/80 rounded-xl"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="text-center">
                                            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                                <Upload className="h-8 w-8 text-white" />
                                            </div>
                                            <p className="text-sm font-bold text-gray-700 mb-2">
                                                Arrastra tu archivo PDF aquí
                                            </p>
                                            <p className="text-xs text-gray-600 mb-3">
                                                o haz clic para seleccionar
                                            </p>
                                            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-xl text-xs font-bold inline-block shadow-lg">
                                                Subir PDF
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs text-gray-600 font-medium">
                                    Opcional. Formato PDF, máximo 10MB.
                                    {isEditing && ' Solo subir si quieres reemplazar el archivo actual.'}
                                </p>
                                <InputError message={errors.archivo_pdf} />
                            </div>

                            {/* Logo Drag & Drop */}
                            <div className="space-y-2">
                                <Label htmlFor="logo" className="text-sm font-bold text-gray-700">
                                    {isEditing ? 'Nuevo ' : ''}Logo
                                </Label>
                                <div 
                                    className={`relative border-2 border-dashed rounded-2xl p-6 transition-all duration-300 cursor-pointer bg-white/80 backdrop-blur-sm shadow-inner ${
                                        isDraggingLogo 
                                            ? 'border-green-400 bg-green-50/80 scale-105' 
                                            : 'border-green-300/50 hover:border-green-400 hover:bg-green-50/60'
                                    }`}
                                    onDrop={(e) => handleDrop(e, 'logo')}
                                    onDragOver={handleDragOver}
                                    onDragEnter={(e) => handleDragEnter(e, 'logo')}
                                    onDragLeave={(e) => handleDragLeave(e, 'logo')}
                                    onClick={() => logoInputRef.current?.click()}
                                >
                                    <input
                                        ref={logoInputRef}
                                        id="logo"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                if (file.type.startsWith('image/')) {
                                                    if (file.size <= 5 * 1024 * 1024) {
                                                        handleFileChange(file, 'logo');
                                                    } else {
                                                        alert('La imagen debe ser menor a 5MB');
                                                        e.target.value = '';
                                                    }
                                                } else {
                                                    alert('Solo se permiten imágenes');
                                                    e.target.value = '';
                                                }
                                            }
                                        }}
                                        className="hidden"
                                    />
                                    
                                    {logoPreview ? (
                                        <div className="space-y-3">
                                            <div className="relative">
                                                <img 
                                                    src={logoPreview} 
                                                    alt="Logo preview" 
                                                    className="w-full h-32 object-cover rounded-xl shadow-lg"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        removeFile('logo');
                                                    }}
                                                    className="absolute top-2 right-2 text-white bg-red-500/80 hover:bg-red-600/90 rounded-xl backdrop-blur-sm"
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <div className="flex items-center justify-center">
                                                <div className="flex items-center space-x-2">
                                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                                    <p className="text-xs text-green-600 font-bold">Imagen seleccionada</p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center">
                                            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                                <Image className="h-8 w-8 text-white" />
                                            </div>
                                            <p className="text-sm font-bold text-gray-700 mb-2">
                                                Arrastra tu logo aquí
                                            </p>
                                            <p className="text-xs text-gray-600 mb-3">
                                                o haz clic para seleccionar
                                            </p>
                                            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-xl text-xs font-bold inline-block shadow-lg">
                                                Subir Imagen
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs text-gray-600 font-medium">
                                    Opcional. Formatos: JPG, PNG, SVG. Máximo 5MB.
                                    {isEditing && ' Solo subir si quieres reemplazar el logo actual.'}
                                </p>
                                <InputError message={errors.logo} />
                            </div>
                        </div>
                    </div>

                    {/* Información adicional en edición */}
                    {isEditing && solicitud?.user && (
                        <div className="p-6 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 rounded-2xl border border-blue-200/50 shadow-lg shadow-blue-100/50">
                            <p className="text-sm text-blue-800 font-semibold">
                                <strong>Creado por:</strong> {solicitud.user.name} <br />
                                <strong>Fecha de creación:</strong> {new Date(solicitud.fecha_creacion).toLocaleDateString('es-ES', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                        </div>
                    )}

                        </div>

                        <DialogFooter className="gap-4 pt-8 border-t border-gray-200/60 flex-shrink-0 mt-6 pr-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleClose}
                                disabled={processing}
                                className="transition-all duration-300 bg-gradient-to-br from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 border-0 rounded-xl shadow-lg font-bold text-gray-700 transform hover:scale-105"
                            >
                                Cancelar
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={processing}
                                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-xl hover:shadow-2xl border-0 rounded-xl font-bold transform hover:scale-105"
                            >
                                {processing ? (
                                    <div className="flex items-center space-x-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>{isEditing ? 'Guardando...' : 'Creando...'}</span>
                                    </div>
                                ) : (
                                    isEditing ? 'Guardar Cambios' : 'Crear Solicitud'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
