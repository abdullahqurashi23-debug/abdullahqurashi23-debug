'use client';

import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { AdminBottomNav } from '@/components/layout/AdminBottomNav';
import { useAuthStore } from '@/lib/auth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const user = useAuthStore((state) => state.user);
    const router = useRouter();
    const pathname = usePathname();
    const [hasHydrated, setHasHydrated] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Wait for Zustand to hydrate from localStorage
    useEffect(() => {
        // Give zustand persist time to rehydrate
        const timer = setTimeout(() => {
            setHasHydrated(true);
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    // Only check auth after hydration is complete
    useEffect(() => {
        if (!hasHydrated) return;

        // Additional check - ensure we have the actual state
        const storedAuth = localStorage.getItem('pso-auth');
        if (storedAuth) {
            const parsed = JSON.parse(storedAuth);
            if (parsed?.state?.user?.role === 'ADMIN') {
                // User is admin, stay here
                return;
            }
        }

        if (!user) {
            router.push('/login');
        } else if (user.role !== 'ADMIN') {
            router.push('/operator');
        }
    }, [hasHydrated, user, router]);

    // Scroll to top on route change
    useEffect(() => {
        window.scrollTo(0, 0);
        setIsSidebarOpen(false); // Close sidebar on navigation
    }, [pathname]);

    // Show loading while hydrating
    if (!hasHydrated) {
        return (
            <div className="min-h-screen bg-[var(--surface)] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
            </div>
        );
    }

    if (!user || user.role !== 'ADMIN') {
        return null;
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-slate-900 selection:text-white relative">
            {/* Global Background Pattern */}
            <div className="fixed inset-0 z-0 opacity-[0.6] pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(#cbd5e1 1.5px, transparent 1.5px), radial-gradient(#cbd5e1 1.5px, transparent 1.5px)',
                    backgroundSize: '24px 24px',
                    backgroundPosition: '0 0, 12px 12px'
                }}>
            </div>

            <Header onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            <main className="
                relative z-10
                pt-[var(--header-height)] 
                lg:pl-[var(--sidebar-width)] 
                pb-20 lg:pb-0
                min-h-screen 
                transition-all duration-300
            ">
                <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto animate-fade-up">
                    {children}
                </div>
            </main>
            <AdminBottomNav
                onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
                isHidden={isSidebarOpen}
            />
        </div>
    );
}

