'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Activity,
    Banknote,
    Fuel,
    Users,
    CreditCard,
    FileBarChart,
    Settings,
    LogOut,
    MessageSquare,
    Bell
} from 'lucide-react';
import { useAuthStore } from '@/lib/auth';

import { LucideIcon } from 'lucide-react';

interface NavigationItem {
    name: string;
    href: string;
    icon: LucideIcon;
    subItems?: { name: string; href: string }[];
}

const navigation: NavigationItem[] = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    {
        name: 'Sales',
        href: '/admin/sales',
        icon: Banknote,
        subItems: [
            { name: 'All Sales', href: '/admin/sales' },
            { name: 'Shift Reports', href: '/admin/sales/shifts' },
        ]
    },
    {
        name: 'Inventory',
        href: '/admin/inventory',
        icon: Fuel,
        subItems: [
            { name: 'Tank Levels', href: '/admin/inventory' },
            { name: 'Deliveries', href: '/admin/inventory/deliveries' },
        ]
    },
    { name: 'Operators', href: '/admin/operators', icon: Users },
    { name: 'Banking', href: '/admin/banking', icon: CreditCard },
    { name: 'Messages', href: '/admin/messages', icon: MessageSquare },
    { name: 'Alerts', href: '/admin/alerts', icon: Bell },
    { name: 'Reports', href: '/admin/reports', icon: FileBarChart },
    { name: 'Customers', href: '/admin/customers', icon: Users },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export const Sidebar = ({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) => {
    const pathname = usePathname();
    const logout = useAuthStore((state) => state.logout);

    // Close sidebar on route change (mobile)
    const handleLinkClick = () => {
        if (window.innerWidth < 768 && onClose) {
            onClose();
        }
    };

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={`fixed inset-0 bg-black/60 z-40 transition-opacity backdrop-blur-sm lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />

            <aside className={`
                fixed top-0 bottom-0 lg:top-[var(--header-height)] bg-white/80 backdrop-blur-md border-r border-slate-200 z-50 lg:z-30 flex flex-col transition-transform duration-300
                w-[280px] lg:w-[var(--sidebar-width)]
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:translate-x-0 lg:left-0
                shadow-2xl shadow-slate-200/50 lg:shadow-none
            `}>
                {/* Mobile Header in Sidebar */}
                <div className="lg:hidden p-4 border-b border-slate-200 flex items-center justify-between bg-white/50">
                    <span className="font-bold text-lg text-slate-900">Menu</span>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Navigation Menu */}
                <nav className="flex-1 overflow-y-auto py-6 space-y-1 custom-scrollbar px-3">
                    {navigation.map((item) => (
                        <div key={item.name} className="mb-1">
                            <Link
                                href={item.href}
                                onClick={handleLinkClick}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 group ${pathname === item.href || (item.subItems && pathname.startsWith(item.href))
                                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20 scale-[1.02]'
                                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                                    }`}
                            >
                                <item.icon className={`w-5 h-5 transition-colors ${pathname === item.href || (item.subItems && pathname.startsWith(item.href)) ? 'text-white' : 'text-slate-400 group-hover:text-slate-900'}`} strokeWidth={2} />
                                {item.name}
                            </Link>

                            {/* Sub Items */}
                            {item.subItems && (pathname.startsWith(item.href) || isOpen) && (
                                <div className="ml-5 pl-4 mt-2 space-y-1 mb-2 border-l-2 border-slate-100">
                                    {item.subItems.map((sub) => (
                                        <Link
                                            key={sub.name}
                                            href={sub.href}
                                            onClick={handleLinkClick}
                                            className={`block px-3 py-2 rounded-lg text-xs font-bold transition-colors ${pathname === sub.href
                                                ? 'text-slate-900 bg-slate-100'
                                                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
                                                }`}
                                        >
                                            {sub.name}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </nav>

                {/* Footer / Logout */}
                <div className="p-4 border-t border-slate-200 bg-white/50 backdrop-blur-sm">
                    <div className="mb-4 px-2 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold border border-slate-200">
                            A
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold text-slate-900 truncate">Admin User</p>
                            <p className="text-xs text-slate-400 truncate">Manager</p>
                        </div>
                    </div>
                    <button
                        onClick={() => logout()}
                        className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-bold text-slate-600 hover:text-red-600 hover:bg-red-50 transition-all border border-transparent hover:border-red-100 group"
                    >
                        <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        Sign Out
                    </button>
                </div>
            </aside>
        </>
    );
};
