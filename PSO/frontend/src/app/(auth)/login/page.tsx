'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/auth';
import { User, Lock, ArrowRight, Activity, ShieldCheck, Fuel } from 'lucide-react';

type UserRole = 'ADMIN' | 'OPERATOR';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedRole, setSelectedRole] = useState<UserRole>('ADMIN');
    const [mounted, setMounted] = useState(false);
    const router = useRouter();
    const login = useAuthStore((state) => state.login);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.login(username, password);

            if (response.user.role !== selectedRole) {
                setError(`This account is for ${response.user.role.toLowerCase()}s.`);
                setLoading(false);
                return;
            }

            login(response.user, response.accessToken, response.refreshToken);

            if (response.user.role === 'ADMIN') {
                router.push('/admin');
            } else {
                router.push('/operator');
            }
        } catch (err: any) {
            setError(err.message || 'Login failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white relative flex items-center justify-center overflow-hidden font-sans text-slate-900 selection:bg-green-500 selection:text-white">
            {/* Minimal Dot Pattern Background - Made darker/visible */}
            <div className="absolute inset-0 z-0 opacity-[0.8]"
                style={{
                    backgroundImage: 'radial-gradient(#e2e8f0 1.5px, transparent 1.5px), radial-gradient(#e2e8f0 1.5px, transparent 1.5px)',
                    backgroundSize: '24px 24px',
                    backgroundPosition: '0 0, 12px 12px'
                }}>
            </div>

            {/* Main Container */}
            <div className={`relative z-10 w-full max-w-[400px] px-6 transition-all duration-700 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>

                {/* Brand / Logo Area - PSO Theme */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-500 text-white rounded-2xl mb-6 shadow-xl shadow-emerald-500/20 rotate-3 transform hover:rotate-6 transition-transform duration-300">
                        <Fuel className="w-10 h-10" strokeWidth={1.5} />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">PSO Portal</h1>
                    <p className="text-slate-500 text-sm font-medium">Fuel Station Management System</p>
                </div>

                {/* Card */}
                <div className="bg-white/80 backdrop-blur-sm border border-slate-200 shadow-2xl shadow-slate-200/50 rounded-2xl p-8">

                    {/* Role Toggle */}
                    <div className="flex p-1 bg-slate-100/80 rounded-xl mb-8">
                        {(['ADMIN', 'OPERATOR'] as UserRole[]).map((role) => {
                            const isActive = selectedRole === role;
                            return (
                                <button
                                    key={role}
                                    onClick={() => { setSelectedRole(role); setError(''); }}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${isActive
                                        ? 'bg-white text-slate-900 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                >
                                    {role === 'ADMIN' ? <ShieldCheck className="w-4 h-4" /> : <Fuel className="w-4 h-4" />}
                                    {role === 'ADMIN' ? 'Admin' : 'Operator'}
                                </button>
                            );
                        })}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm font-medium flex items-center gap-2 animate-shake">
                                <span className="w-1 h-4 bg-red-500 rounded-full"></span>
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider">Username</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-slate-800 transition-colors" />
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full h-12 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-all font-medium"
                                        placeholder="Enter username"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1.5 ml-1 uppercase tracking-wider">Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-slate-800 transition-colors" />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full h-12 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-all font-medium"
                                        placeholder="Enter password"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 bg-slate-900 text-white rounded-xl font-bold text-sm tracking-wide hover:bg-black hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:hover:scale-100"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Sign In <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <div className="mt-8 text-center space-y-1">
                    <p className="text-slate-400 text-xs font-medium">PSO Pump Management System</p>
                    <div className="w-1 h-1 bg-slate-200 rounded-full mx-auto"></div>
                </div>
            </div>

            <style jsx>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
                    20%, 40%, 60%, 80% { transform: translateX(4px); }
                }
                .animate-shake {
                    animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
                }
            `}</style>
        </div>
    );
}
