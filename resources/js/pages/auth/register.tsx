import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

type RegisterForm = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
};

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm<Required<RegisterForm>>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout title="Crear cuenta" description="Ingresa tus datos para crear tu cuenta de administrador">
            <Head title="Crear cuenta" />
            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-6">
                    <div className="grid gap-3">
                        <Label htmlFor="name" className="text-sm font-bold text-gray-700">Nombre completo</Label>
                        <Input
                            id="name"
                            type="text"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            disabled={processing}
                            placeholder="Nombre completo"
                            className="bg-gradient-to-br from-blue-50/80 to-indigo-50/80 backdrop-blur-sm text-blue-900 rounded-2xl border border-blue-200/50 shadow-lg shadow-blue-100/50 font-medium focus:ring-2 focus:ring-blue-400 hover:from-blue-100/80 hover:to-indigo-100/80 transition-all duration-300 px-4 !py-6"
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="grid gap-3">
                        <Label htmlFor="email" className="text-sm font-bold text-gray-700">Correo electrónico</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            tabIndex={2}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            disabled={processing}
                            placeholder="correo@ejemplo.com"
                            className="bg-gradient-to-br from-purple-50/80 to-pink-50/80 backdrop-blur-sm text-purple-900 rounded-2xl border border-purple-200/50 shadow-lg shadow-purple-100/50 font-medium focus:ring-2 focus:ring-purple-400 hover:from-purple-100/80 hover:to-pink-100/80 transition-all duration-300 px-4 py-6"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-3">
                        <Label htmlFor="password" className="text-sm font-bold text-gray-700">Contraseña</Label>
                        <Input
                            id="password"
                            type="password"
                            required
                            tabIndex={3}
                            autoComplete="new-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            disabled={processing}
                            placeholder="Contraseña"
                            className="bg-gradient-to-br from-green-50/80 to-emerald-50/80 backdrop-blur-sm text-green-900 rounded-2xl border border-green-200/50 shadow-lg shadow-green-100/50 font-medium focus:ring-2 focus:ring-green-400 hover:from-green-100/80 hover:to-emerald-100/80 transition-all duration-300 px-4 py-6"
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="grid gap-3">
                        <Label htmlFor="password_confirmation" className="text-sm font-bold text-gray-700">Confirmar contraseña</Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            required
                            tabIndex={4}
                            autoComplete="new-password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            disabled={processing}
                            placeholder="Confirmar contraseña"
                            className="bg-gradient-to-br from-orange-50/80 to-yellow-50/80 backdrop-blur-sm text-orange-900 rounded-2xl border border-orange-200/50 shadow-lg shadow-orange-100/50 font-medium focus:ring-2 focus:ring-orange-400 hover:from-orange-100/80 hover:to-yellow-100/80 transition-all duration-300 px-4 py-6"
                        />
                        <InputError message={errors.password_confirmation} />
                    </div>

                    <Button 
                        type="submit" 
                        className="mt-4 !py-6 w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-2xl px-6 shadow-xl shadow-green-300/50 border-0 transform hover:scale-105 transition-all duration-300 font-bold text-lg" 
                        tabIndex={5} 
                        disabled={processing}
                    >
                        {processing && <LoaderCircle className="h-5 w-5 animate-spin mr-2" />}
                        Crear cuenta
                    </Button>

                    <div className="text-center mt-6">
                        <p className="text-sm text-gray-600">
                            ¿Ya tienes cuenta?{' '}
                            <TextLink 
                                href={route('login')} 
                                className="font-semibold text-blue-600 hover:text-purple-600 transition-colors duration-300"
                                tabIndex={6}
                            >
                                Iniciar sesión
                            </TextLink>
                        </p>
                    </div>
                </div>
            </form>
        </AuthLayout>
    );
}
