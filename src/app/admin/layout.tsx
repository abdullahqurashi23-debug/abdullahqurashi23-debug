'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FiFileText, FiBook, FiMail, FiLock, FiGrid, FiLogOut, FiHome, FiMenu, FiX, FiSettings, FiAward, FiEdit3 } from 'react-icons/fi';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/admin/login');
        }
    }, [status, router]);

    if (status === 'loading') {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-500">Initializing Admin...</div>;
    }

    // Exclude Sidebar/Header on Login Page
    if (pathname === '/admin/login') {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
            {/* Sidebar Desktop */}
            <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 fixed inset-y-0 z-10">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                    <Link href="/" className="flex items-center gap-3 text-xl font-bold tracking-tight group">
                        <div className="relative w-9 h-9 transition-all duration-500 group-hover:scale-105">
                            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-400 p-[2px] opacity-80 group-hover:opacity-100 transition-opacity">
                                <div className="w-full h-full rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center">
                                    <span className="text-sm font-bold bg-gradient-to-br from-blue-500 to-purple-500 bg-clip-text text-transparent">
                                        EK
                                    </span>
                                </div>
                            </div>
                        </div>
                        <span className="text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">Admin</span>
                    </Link>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-3">Main</div>
                    <Link href="/admin/dashboard" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${pathname === '/admin/dashboard' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}>
                        <FiGrid /> Dashboard
                    </Link>
                    <Link href="/admin/projects" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${pathname?.startsWith('/admin/projects') ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}>
                        <FiFileText /> Projects
                    </Link>
                    <Link href="/admin/publications" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${pathname?.startsWith('/admin/publications') ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}>
                        <FiBook /> Publications
                    </Link>
                    <Link href="/admin/messages" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${pathname?.startsWith('/admin/messages') ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}>
                        <FiMail /> Messages
                    </Link>
                    <Link href="/admin/access-requests" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${pathname?.startsWith('/admin/access-requests') ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}>
                        <FiLock /> Access Requests
                    </Link>

                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-6 mb-2 px-3">Content</div>
                    <Link href="/admin/certifications" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${pathname?.startsWith('/admin/certifications') ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}>
                        <FiAward /> Certifications
                    </Link>
                    <Link href="/admin/blog" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${pathname?.startsWith('/admin/blog') ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}>
                        <FiEdit3 /> Blog
                    </Link>

                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-6 mb-2 px-3">Settings</div>
                    <Link href="/admin/settings" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${pathname?.startsWith('/admin/settings') ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}>
                        <FiSettings /> Settings
                    </Link>
                </nav>
                <div className="p-4 border-t border-gray-100 dark:border-gray-700">
                    <button onClick={() => signOut()} className="flex items-center gap-3 w-full px-3 py-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-sm font-medium">
                        <FiLogOut /> Sign Out
                    </button>
                </div>
            </aside>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} onClick={() => setIsSidebarOpen(false)} className="md:hidden fixed inset-0 bg-black z-40" />
                        <motion.aside initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'tween' }} className="md:hidden fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 z-50 flex flex-col p-4 shadow-xl">
                            <div className="flex justify-between items-center mb-8">
                                <span className="text-xl font-bold">Menu</span>
                                <button onClick={() => setIsSidebarOpen(false)}><FiX size={24} /></button>
                            </div>
                            <nav className="space-y-4">
                                <Link href="/admin/dashboard" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 text-lg font-medium"><FiGrid /> Dashboard</Link>
                                <Link href="/admin/projects" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 text-lg font-medium text-gray-600"><FiFileText /> Projects</Link>
                                <Link href="/admin/publications" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 text-lg font-medium text-gray-600"><FiBook /> Publications</Link>
                                <Link href="/admin/certifications" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 text-lg font-medium text-gray-600"><FiAward /> Certifications</Link>
                                <Link href="/admin/blog" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 text-lg font-medium text-gray-600"><FiEdit3 /> Blog</Link>
                                <Link href="/admin/messages" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 text-lg font-medium text-gray-600"><FiMail /> Messages</Link>
                                <Link href="/admin/access-requests" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 text-lg font-medium text-gray-600"><FiLock /> Access Requests</Link>
                                <Link href="/admin/settings" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 text-lg font-medium text-gray-600"><FiSettings /> Settings</Link>
                                <Link href="/" className="flex items-center gap-3 text-lg font-medium text-gray-600"><FiHome /> View Site</Link>
                                <button onClick={() => signOut()} className="flex items-center gap-3 text-lg font-medium text-red-600 mt-8"><FiLogOut /> Sign Out</button>
                            </nav>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 transition-all duration-300">
                {/* Topbar */}
                <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md sticky top-0 z-20 px-6 py-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-4">
                        <button className="md:hidden p-2 -ml-2 text-gray-600" onClick={() => setIsSidebarOpen(true)}>
                            <FiMenu size={24} />
                        </button>
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Admin Portal</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold text-gray-900 dark:text-white">{session?.user?.name}</p>
                            <p className="text-xs text-gray-500">Administrator</p>
                        </div>
                        <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                            A
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                {children}
            </main>
        </div>
    );
}
