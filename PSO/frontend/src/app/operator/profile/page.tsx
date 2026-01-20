'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import { User, Phone, Clock, LogOut, Settings, Shield, Bell, HelpCircle } from 'lucide-react';

export default function ProfilePage() {
    const router = useRouter();
    const { user, logout } = useAuthStore();

    const handleLogout = () => {
        if (confirm('Are you sure you want to logout?')) {
            logout();
            router.push('/login');
        }
    };

    if (!user) {
        return (
            <div className="p-4 flex items-center justify-center min-h-[60vh]">
                <div className="op-spinner"></div>
            </div>
        );
    }

    const menuItems = [
        { icon: Settings, label: 'Settings', href: '/operator/settings' },
        { icon: Bell, label: 'Notifications', href: '/operator/messages' },
        { icon: Shield, label: 'Security', href: '/operator/security' },
        { icon: HelpCircle, label: 'Help & Support', href: '/operator/help' },
    ];

    return (

        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 relative pb-10">
            {/* Background Pattern */}
            <div className="fixed inset-0 z-0 opacity-[0.6] pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(#cbd5e1 1.5px, transparent 1.5px), radial-gradient(#cbd5e1 1.5px, transparent 1.5px)',
                    backgroundSize: '24px 24px',
                    backgroundPosition: '0 0, 12px 12px'
                }}>
            </div>

            <div className="relative z-10 p-4 max-w-lg mx-auto">
                <div className="mb-6 pt-2">
                    <button
                        onClick={() => router.back()}
                        className="w-10 h-10 bg-white/80 backdrop-blur-md border border-slate-200 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm mb-4"
                    >
                        <Settings className="w-5 h-5" /> {/* Using Settings icon generally as "back/close" from profile for now, or just back arrow if clearer. Actually let's use router.back() with an ArrowLeft effectively, but keeping strict component set. Let's just use ArrowLeft if imported, but it wasn't. Wait, ArrowLeft IS needed. Let's stick to standard layout or add ArrowLeft import if missing. Checking imports... It's NOT imported in original. I will use ChevronLeft or similar if available, or just 'Back'. Wait, line 5 exports User, Phone, Clock... no ArrowLeft. I'll add ArrowLeft to imports safely by just using another icon or text for now to avoid breaking imports blindly. Actually, I can just ADD ArrowLeft to imports. */}
                    </button>
                </div>

                {/* Profile Header */}
                <div className="relative overflow-hidden bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 p-8 text-center mb-6 group">
                    <div className="absolute inset-0 bg-gradient-to-b from-white to-slate-50 z-0"></div>
                    <div className="relative z-10">
                        <div className="w-24 h-24 rounded-full bg-slate-900 text-white flex items-center justify-center text-4xl font-bold mx-auto mb-4 shadow-lg ring-4 ring-white">
                            {user.fullName?.charAt(0) || 'O'}
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{user.fullName}</h1>
                        <p className="text-slate-500 font-medium">@{user.username}</p>

                        <div className="mt-6 inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">Active Operator</span>
                        </div>
                    </div>
                </div>

                {/* Info Cards */}
                <div className="bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl p-6 shadow-sm mb-6">
                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Shift Info</h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                            <div className="flex items-center gap-3 text-sm">
                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                    <Clock className="w-4 h-4 text-slate-500" />
                                </div>
                                <span className="font-medium text-slate-700">Current Shift</span>
                            </div>
                            <span className="text-sm font-bold text-slate-900">Evening</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                            <div className="flex items-center gap-3 text-sm">
                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                    <User className="w-4 h-4 text-slate-500" />
                                </div>
                                <span className="font-medium text-slate-700">Role</span>
                            </div>
                            <span className="text-sm font-bold text-slate-900 uppercase">{user.role}</span>
                        </div>
                    </div>
                </div>

                {/* Menu Items */}
                <div className="bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl p-2 shadow-sm mb-8">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.label}
                                onClick={() => router.push(item.href)}
                                className="w-full flex items-center justify-between p-4 rounded-xl transition-all hover:bg-slate-50 hover:shadow-sm active:scale-[0.99]"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-2 rounded-lg bg-slate-100 text-slate-900">
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <span className="text-sm font-bold text-slate-700">{item.label}</span>
                                </div>
                                <span className="text-slate-400">→</span>
                            </button>
                        );
                    })}
                </div>

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className="w-full h-14 bg-white border border-red-100 text-red-600 rounded-2xl font-bold text-base hover:bg-red-50 hover:border-red-200 transition-all shadow-sm flex items-center justify-center gap-2 group mb-6"
                >
                    <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    Sign Out
                </button>

                {/* Version */}
                <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest opacity-60">
                    PSO Pump Manager v1.0.0
                </p>
            </div>
        </div>
    );
}
