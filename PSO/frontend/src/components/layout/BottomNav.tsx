'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Plus, BarChart2, Pause, User } from 'lucide-react';

const navigation = [
    { name: 'Home', href: '/operator', icon: Home },
    { name: 'Stats', href: '/operator/stats', icon: BarChart2 },
    { name: 'Sale', href: '/operator/sale', icon: Plus, isCenter: true },
    { name: 'Break', href: '/operator/break', icon: Pause },
    { name: 'Profile', href: '/operator/profile', icon: User },
];

export const BottomNav = () => {
    const pathname = usePathname();
    const router = useRouter();

    return (
        <div className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-4 ptr-0">
            <nav className="relative bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl shadow-slate-200/50 border border-white/50 h-20 flex items-center justify-between px-2 max-w-md mx-auto">
                {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    if (item.isCenter) {
                        return (
                            <div key={item.name} className="relative w-16 flex justify-center">
                                <button
                                    onClick={() => router.push(item.href)}
                                    className="absolute -top-10 w-16 h-16 bg-slate-900 text-white rounded-2xl shadow-xl shadow-slate-900/30 flex items-center justify-center transform transition-all duration-300 hover:scale-110 active:scale-95 border-[6px] border-slate-50 group"
                                >
                                    <Icon className="w-7 h-7 group-hover:rotate-90 transition-transform duration-300" strokeWidth={2.5} />
                                </button>
                            </div>
                        );
                    }

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex flex-col items-center justify-center w-14 h-full gap-1 transition-all duration-300 ${isActive ? 'text-slate-900 scale-110' : 'text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            <Icon
                                className={`w-6 h-6 transition-all duration-300 ${isActive ? '-translate-y-0.5 fill-current/10' : ''}`}
                                strokeWidth={isActive ? 2.5 : 2}
                            />
                            {isActive && (
                                <span className="absolute bottom-2 w-1 h-1 bg-slate-900 rounded-full animate-in fade-in zoom-in"></span>
                            )}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
};
