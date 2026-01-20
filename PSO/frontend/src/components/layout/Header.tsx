'use client';

import { useState, useEffect } from 'react';
import { Search, Bell, Moon, Sun, User, Menu } from 'lucide-react';
import { Button } from '@/components/ui/Button';

import { useThemeStore } from '@/lib/store/themeStore';
import { API_URL } from '@/lib/api';

export const Header = ({ onMenuToggle }: { onMenuToggle?: () => void }) => {
    const { theme, toggleTheme } = useThemeStore();
    const [todayDate, setTodayDate] = useState('');
    const [pumpName, setPumpName] = useState('PSO Station');

    useEffect(() => {
        const now = new Date();
        setTodayDate(now.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }));

        // Fetch pump info from settings
        const fetchPumpInfo = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${API_URL}/settings/pump-info`, {
                    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.name) setPumpName(data.name);
                }
            } catch (error) {
                console.error('Failed to fetch pump info:', error);
            }
        };
        fetchPumpInfo();
    }, []);

    return (

        <header className="fixed top-0 left-0 right-0 h-[var(--header-height)] bg-white/80 backdrop-blur-md border-b border-slate-200 z-40 px-4 md:px-6 flex items-center justify-between shadow-sm transition-all duration-300">

            {/* ... other parts ... */}

            <div className="flex items-center gap-4 lg:w-[var(--sidebar-width)] flex-shrink-0">
                {/* Mobile Menu Button */}
                <button
                    onClick={onMenuToggle}
                    className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-xl lg:hidden transition-colors"
                >
                    <Menu className="w-6 h-6" />
                </button>

                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 md:w-10 md:h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-bold text-lg md:text-xl shadow-lg shadow-slate-900/20 border border-slate-800">
                        P
                    </div>
                    <div className="hidden sm:block">
                        <h1 className="text-sm font-bold text-slate-900 tracking-tight">
                            {pumpName}
                        </h1>
                        <span className="text-[10px] bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                            PSO Station
                        </span>
                    </div>
                </div>
            </div>

            {/* Search Bar - Hidden on small mobile */}
            <div className="flex-1 max-w-xl px-4 md:px-8 hidden md:block">
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search sales, operators, invoices..."
                        className="w-full h-10 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all font-medium"
                    />
                </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 md:gap-4">

                {/* Date Picker Stub */}
                <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-xs text-slate-500 font-bold">Today:</span>
                    <span className="text-xs font-bold text-slate-900">{todayDate}</span>
                </div>

                <div className="h-6 w-px bg-slate-200 mx-1 md:mx-2 hidden sm:block"></div>

                <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors hover:text-slate-900">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>

                <button
                    onClick={toggleTheme}
                    className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors hidden sm:block hover:text-slate-900"
                >
                    {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>

                <div className="flex items-center gap-3 pl-2 border-l border-slate-100 md:border-none">
                    <div className="w-9 h-9 md:w-10 md:h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-bold shadow-sm ring-2 ring-white cursor-pointer hover:bg-slate-200 transition-colors">
                        <User className="w-5 h-5" />
                    </div>
                </div>
            </div>
        </header>
    );
};
