import AppLogoIcon from '@/components/app-logo-icon';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    name?: string;
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({ children, title, description }: PropsWithChildren<AuthLayoutProps>) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-6">
            <div className="w-full max-w-lg">
                <div className="bg-white/70 backdrop-blur-lg rounded-3xl p-8 shadow-xl shadow-blue-200/50 border border-white/50">
                    <div className="flex flex-col gap-8">
                        <div className="flex flex-col items-center gap-6">
                            <Link href={route('home')} className="flex flex-col items-center gap-4 font-medium group">
                                <div className=" h-20 w-auto p-4 bg-gradient-to-br from-blue-400 to-purple-600 rounded-3xl flex items-center justify-center shadow-xl shadow-blue-300/50 group-hover:scale-105 transition-all duration-300">
                                    <AppLogoIcon className="h-full w-auto " />
                                </div>
                                <span className="sr-only">{title}</span>
                            </Link>

                            <div className="space-y-3 text-center">
                                <h1 className="text-3xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent drop-shadow-sm" style={{fontWeight: 900}}>
                                    {title}
                                </h1>
                                <p className="text-gray-600 font-medium text-lg">{description}</p>
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-white/60 to-gray-50/60 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
