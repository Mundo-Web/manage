import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
};

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<Required<LoginForm>>({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthLayout title="Iniciar sesión" description="Ingresa tu email y contraseña para acceder">
            <Head title="Iniciar sesión" />

            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-6">
                    <div className="grid gap-3">
                        <Label htmlFor="email" className="text-sm font-bold text-gray-700">Correo electrónico</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="correo@ejemplo.com"
                            className="bg-gradient-to-br from-blue-50/80 to-indigo-50/80 backdrop-blur-sm text-blue-900 rounded-2xl border border-blue-200/50 shadow-lg shadow-blue-100/50 font-medium focus:ring-2 focus:ring-blue-400 hover:from-blue-100/80 hover:to-indigo-100/80 transition-all duration-300 px-4 !py-6"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-3">
                        <div className="flex items-center">
                            <Label htmlFor="password" className="text-sm font-bold text-gray-700">Contraseña</Label>
                            {canResetPassword && (
                                <TextLink href={route('password.request')} className="ml-auto text-sm font-semibold text-blue-600 hover:text-purple-600 transition-colors duration-300" tabIndex={5}>
                                    ¿Olvidaste tu contraseña?
                                </TextLink>
                            )}
                        </div>
                        <Input
                            id="password"
                            type="password"
                            required
                            tabIndex={2}
                            autoComplete="current-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Contraseña"
                            className="bg-gradient-to-br from-purple-50/80 to-pink-50/80 backdrop-blur-sm text-purple-900 rounded-2xl border border-purple-200/50 shadow-lg shadow-purple-100/50 font-medium focus:ring-2 focus:ring-purple-400 hover:from-purple-100/80 hover:to-pink-100/80 transition-all duration-300 px-4 py-6"
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="flex items-center space-x-3 bg-gradient-to-br from-gray-50/60 to-slate-50/60 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50 shadow-lg">
                        <Checkbox
                            id="remember"
                            name="remember"
                            checked={data.remember}
                            onClick={() => setData('remember', !data.remember)}
                            tabIndex={3}
                            className="rounded-lg border-2 border-gray-300 data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-500 data-[state=checked]:to-purple-600 data-[state=checked]:border-transparent"
                        />
                        <Label htmlFor="remember" className="text-sm font-semibold text-gray-700 cursor-pointer">Recordarme</Label>
                    </div>

                    <Button 
                        type="submit" 
                        className="mt-4  !py-6 w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-2xl px-6  shadow-xl shadow-blue-300/50 border-0 transform hover:scale-105 transition-all duration-300 font-bold text-lg" 
                        tabIndex={4} 
                        disabled={processing}
                    >
                        {processing && <LoaderCircle className="h-5 w-5 animate-spin mr-2" />}
                        Iniciar sesión
                    </Button>

                    <div className="text-center mt-6">
                        <p className="text-sm text-gray-600">
                            ¿No tienes cuenta?{' '}
                            <TextLink 
                                href={route('register')} 
                                className="font-semibold text-blue-600 hover:text-purple-600 transition-colors duration-300"
                            >
                                Crear cuenta
                            </TextLink>
                        </p>
                    </div>
                </div>

              
            </form>

            {status && (
                <div className="bg-gradient-to-r from-green-100/80 to-emerald-100/80 backdrop-blur-sm rounded-2xl p-4 border border-green-200/50 shadow-lg">
                    <p className="text-center text-sm font-bold text-green-800">{status}</p>
                </div>
            )}
        </AuthLayout>
    );
}
