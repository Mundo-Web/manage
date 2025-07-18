import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginationProps {
    links: PaginationLink[];
    meta?: {
        current_page: number;
        last_page: number;
        total: number;
    };
    onPageChange: (url: string) => void;
}

export function Pagination({ links, meta, onPageChange }: PaginationProps) {
    // Si no hay meta o solo hay una página, no mostrar paginación
    if (!meta || meta.last_page <= 1) {
        return null;
    }

    const handlePageClick = (url: string | null) => {
        if (url) {
            onPageChange(url);
        }
    };

    return (
        <div className="flex items-center justify-between bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-xl shadow-purple-300/40 border border-white/60 mx-auto max-w-4xl">
            <div className="flex items-center gap-3 text-sm text-gray-700">
                <span className="font-bold text-lg">
                    Página {meta.current_page} de {meta.last_page}
                </span>
                <span className="text-gray-600 font-medium">
                    ({meta.total} resultados totales)
                </span>
            </div>
            
            <div className="flex items-center gap-2">
                {links.map((link, index) => {
                    // Link de "Previous"
                    if (link.label.includes('Previous') || link.label.includes('Anterior')) {
                        return (
                            <Button
                                key={index}
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageClick(link.url)}
                                disabled={!link.url}
                                className="bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 border-0 rounded-xl px-3 py-2 shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-300"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Anterior
                            </Button>
                        );
                    }
                    
                    // Link de "Next"
                    if (link.label.includes('Next') || link.label.includes('Siguiente')) {
                        return (
                            <Button
                                key={index}
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageClick(link.url)}
                                disabled={!link.url}
                                className="bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 border-0 rounded-xl px-3 py-2 shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-300"
                            >
                                Siguiente
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        );
                    }
                    
                    // Links de números de página
                    if (link.label !== '...' && !isNaN(Number(link.label))) {
                        return (
                            <Button
                                key={index}
                                variant={link.active ? "default" : "outline"}
                                size="sm"
                                onClick={() => handlePageClick(link.url)}
                                disabled={!link.url}
                                className={`
                                    ${link.active 
                                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg shadow-blue-300/50' 
                                        : 'bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 shadow-lg'
                                    } 
                                    border-0 rounded-xl w-10 h-10 p-0 font-semibold transform hover:scale-105 transition-all duration-300
                                `}
                            >
                                {link.label}
                            </Button>
                        );
                    }
                    
                    // Puntos suspensivos
                    if (link.label === '...') {
                        return (
                            <span key={index} className="px-3 py-2 text-gray-500 font-medium">
                                ...
                            </span>
                        );
                    }
                    
                    return null;
                })}
            </div>
        </div>
    );
}
