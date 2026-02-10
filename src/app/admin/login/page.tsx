'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { FiLock, FiArrowRight, FiCodesandbox } from 'react-icons/fi';
import Link from 'next/link';

export default function AdminLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await signIn('credentials', {
            redirect: false,
            email,
            password,
        });

        setLoading(false);

        if (result?.error) {
            setError('Invalid credentials');
        } else {
            router.push('/admin/dashboard');
        }
    };

    return (
        <div className="min-h-screen w-full grid lg:grid-cols-2">
            {/* Left Side - Visual Aesthetic */}
            <div className="hidden lg:flex flex-col justify-between bg-[#0f172a] p-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-white/[0.05] [mask-image:linear-gradient(0deg,transparent,black)]"></div>
                <div className="absolute -top-20 -left-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                            <FiCodesandbox size={24} />
                        </div>
                        <span className="text-white font-bold text-xl tracking-wide">Emal Kamawal</span>
                    </div>
                </div>

                <div className="relative z-10 max-w-lg">
                    <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
                        Welcome to the <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Control Center</span>
                    </h1>
                    <p className="text-gray-400 text-lg leading-relaxed mb-8">
                        Manage your portfolio projects, publications, and messages from a secure, dedicated environment designed for efficiency.
                    </p>
                </div>

                <div className="relative z-10 text-gray-500 text-sm">
                    &copy; {new Date().getFullYear()} Emal Kamawal Portfolio.
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-8 lg:p-12">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Admin Login</h2>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Enter your credentials to access the dashboard.
                        </p>
                    </div>

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="rounded-lg bg-red-50 dark:bg-red-900/30 p-4 border border-red-200 dark:border-red-800">
                                <p className="text-sm font-medium text-red-800 dark:text-red-200 text-center">{error}</p>
                            </div>
                        )}

                        <div className="space-y-5">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Email address
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all sm:text-sm"
                                        placeholder="admin@example.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Password
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all sm:text-sm"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                                    Remember me
                                </label>
                            </div>

                            <div className="text-sm">
                                <Link href="/" className="font-medium text-blue-600 hover:text-blue-500">
                                    Forgot your password?
                                </Link>
                            </div>
                        </div>

                        <div>
                            <Button
                                type="submit"
                                size="lg"
                                className="w-full flex justify-center items-center gap-2 group"
                                disabled={loading}
                            >
                                {loading ? 'Signing in...' : 'Sign in'}
                                {!loading && <FiArrowRight className="group-hover:translate-x-1 transition-transform" />}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
