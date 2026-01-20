'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Banknote, Fuel, Users, Menu } from 'lucide-react';

const navigation = [
    { name: 'Home', href: '/admin', icon: LayoutDashboard },
    { name: 'Sales', href: '/admin/sales', icon: Banknote },
    { name: 'Inventory', href: '/admin/inventory', icon: Fuel },
    { name: 'Operators', href: '/admin/operators', icon: Users },
    { name: 'More', href: '#', icon: Menu, isMenu: true },
];

interface AdminBottomNavProps {
    onMenuToggle: () => void;
    isHidden?: boolean;
}

export const AdminBottomNav = ({ onMenuToggle, isHidden }: AdminBottomNavProps) => {
    const pathname = usePathname();

    // Hide when sidebar is open or on desktop
    if (isHidden) return null;

    return (
        <div className="admin-bottom-nav">
            {navigation.map((item) => {
                const isActive = item.href === pathname ||
                    (item.href !== '/admin' && pathname.startsWith(item.href));
                const Icon = item.icon;

                if (item.isMenu) {
                    return (
                        <button
                            key={item.name}
                            onClick={onMenuToggle}
                            className="admin-nav-item"
                        >
                            <Icon />
                            <span>{item.name}</span>
                        </button>
                    );
                }

                return (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={`admin-nav-item ${isActive ? 'active' : ''}`}
                    >
                        <Icon />
                        <span>{item.name}</span>
                        {isActive && (
                            <span className="absolute bottom-1 w-1 h-1 bg-[var(--color-primary)] rounded-full"></span>
                        )}
                    </Link>
                );
            })}
        </div>
    );
};
