import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { useEffect } from 'react';

interface ConfirmationModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'destructive' | 'warning' | 'info';
    onConfirm: () => void;
    onCancel?: () => void;
}

export function ConfirmationModal({
    open,
    onOpenChange,
    title,
    description,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    variant = 'destructive',
    onConfirm,
    onCancel
}: ConfirmationModalProps) {
    
    // Cleanup effect cuando el modal se cierra - igual que en SolicitudModal
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
                        
                        // Restaurar pointer-events del body y elementos principales
                        document.body.style.pointerEvents = '';
                        document.documentElement.style.pointerEvents = '';
                        
                        // Limpiar cualquier overlay que pueda haber quedado
                        const overlays = document.querySelectorAll('[data-radix-dialog-overlay]');
                        overlays.forEach(overlay => {
                            try {
                                if (document.contains(overlay) && overlay.parentElement) {
                                    overlay.parentElement.removeChild(overlay);
                                }
                            } catch (error) {
                                // Silencioso
                            }
                        });
                        
                    } catch (error) {
                        // En caso de cualquier error, al menos restaurar pointer-events
                        document.body.style.pointerEvents = '';
                        document.documentElement.style.pointerEvents = '';
                    }
                });
            };
            
            // Delay para permitir que la animación de cierre termine
            cleanupTimer = setTimeout(performSafeCleanup, 300);
        }
        
        return () => {
            if (cleanupTimer) {
                clearTimeout(cleanupTimer);
            }
        };
    }, [open]);
    
    const handleConfirm = () => {
        onConfirm();
        handleClose();
    };

    const handleCancel = () => {
        onCancel?.();
        handleClose();
    };

    const handleClose = () => {
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
            onOpenChange(newOpen);
        }
    };

    const getVariantStyles = () => {
        switch (variant) {
            case 'destructive':
                return {
                    icon: <Trash2 className="w-8 h-8 text-red-600" />,
                    iconBg: 'bg-gradient-to-br from-red-100 to-red-200',
                    titleColor: 'text-red-800',
                    confirmButton: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white'
                };
            case 'warning':
                return {
                    icon: <AlertTriangle className="w-8 h-8 text-orange-600" />,
                    iconBg: 'bg-gradient-to-br from-orange-100 to-orange-200',
                    titleColor: 'text-orange-800',
                    confirmButton: 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white'
                };
            case 'info':
                return {
                    icon: <AlertTriangle className="w-8 h-8 text-blue-600" />,
                    iconBg: 'bg-gradient-to-br from-blue-100 to-blue-200',
                    titleColor: 'text-blue-800',
                    confirmButton: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white'
                };
            default:
                return {
                    icon: <AlertTriangle className="w-8 h-8 text-red-600" />,
                    iconBg: 'bg-gradient-to-br from-red-100 to-red-200',
                    titleColor: 'text-red-800',
                    confirmButton: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white'
                };
        }
    };

    const styles = getVariantStyles();

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-lg bg-gradient-to-br from-white/95 to-gray-50/95 backdrop-blur-xl border-0 shadow-2xl shadow-gray-400/30 rounded-3xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/20 to-transparent pointer-events-none rounded-3xl"></div>
                
                <DialogHeader className="relative z-10 space-y-6 pt-6">
                    <div className="flex flex-col items-center space-y-4">
                        <div className={`w-20 h-20 ${styles.iconBg} rounded-2xl flex items-center justify-center shadow-inner`}>
                            {styles.icon}
                        </div>
                        
                        <DialogTitle className={`text-2xl font-bold ${styles.titleColor} text-center`}>
                            {title}
                        </DialogTitle>
                    </div>
                    
                    <DialogDescription className="text-center text-gray-700 text-lg font-medium leading-relaxed px-4">
                        {description}
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="relative z-10 flex flex-col-reverse sm:flex-row gap-3 pt-6 pb-6">
                    <Button
                        variant="outline"
                        onClick={handleCancel}
                        className="flex-1 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-800 border-0 rounded-2xl px-6 py-3 shadow-lg font-semibold transform hover:scale-105 transition-all duration-300"
                    >
                        {cancelText}
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        className={`flex-1 ${styles.confirmButton} border-0 rounded-2xl px-6 py-3 shadow-lg font-semibold transform hover:scale-105 transition-all duration-300`}
                    >
                        {confirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
