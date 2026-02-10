'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { FiFileText, FiBook, FiMail, FiLock, FiPlus, FiTrendingUp, FiTrendingDown, FiEye, FiClock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';

interface Stats {
    projects: number;
    publications: number;
    messages: number;
    accessRequests: number;
    pendingRequests: number;
    unreadMessages: number;
}

interface RecentActivity {
    id: string;
    type: 'message' | 'access_request' | 'project' | 'publication';
    title: string;
    description: string;
    timestamp: string;
    status?: 'pending' | 'approved' | 'rejected';
}

export default function AdminDashboard() {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<Stats>({
        projects: 0,
        publications: 0,
        messages: 0,
        accessRequests: 0,
        pendingRequests: 0,
        unreadMessages: 0,
    });
    const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
    const [projectsByCategory, setProjectsByCategory] = useState<{ category: string; count: number }[]>([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // Fetch counts
            const [projectsRes, publicationsRes, messagesRes, accessRes, pendingRes, unreadRes] = await Promise.all([
                supabase.from('projects').select('id', { count: 'exact', head: true }),
                supabase.from('publications').select('id', { count: 'exact', head: true }),
                supabase.from('contact_messages').select('id', { count: 'exact', head: true }),
                supabase.from('access_requests').select('id', { count: 'exact', head: true }),
                supabase.from('access_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
                supabase.from('contact_messages').select('id', { count: 'exact', head: true }).eq('is_read', false),
            ]);

            setStats({
                projects: projectsRes.count || 0,
                publications: publicationsRes.count || 0,
                messages: messagesRes.count || 0,
                accessRequests: accessRes.count || 0,
                pendingRequests: pendingRes.count || 0,
                unreadMessages: unreadRes.count || 0,
            });

            // Fetch recent activity
            const [recentMessages, recentRequests] = await Promise.all([
                supabase.from('contact_messages').select('*').order('created_at', { ascending: false }).limit(3),
                supabase.from('access_requests').select('*').order('created_at', { ascending: false }).limit(3),
            ]);

            const activities: RecentActivity[] = [
                ...(recentMessages.data || []).map((msg: any) => ({
                    id: msg.id,
                    type: 'message' as const,
                    title: `New message from ${msg.name}`,
                    description: msg.subject || msg.message?.substring(0, 50) + '...',
                    timestamp: msg.created_at,
                })),
                ...(recentRequests.data || []).map((req: any) => ({
                    id: req.id,
                    type: 'access_request' as const,
                    title: `Access request from ${req.name}`,
                    description: req.project_title || 'Gated content access',
                    timestamp: req.created_at,
                    status: req.status,
                })),
            ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5);

            setRecentActivity(activities);

            // Fetch projects by category
            const { data: projects } = await supabase.from('projects').select('category');
            if (projects) {
                const categoryCount: { [key: string]: number } = {};
                projects.forEach((p: any) => {
                    const cat = p.category?.[0] || 'Uncategorized';
                    categoryCount[cat] = (categoryCount[cat] || 0) + 1;
                });
                setProjectsByCategory(
                    Object.entries(categoryCount).map(([category, count]) => ({ category, count }))
                );
            }

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        }
        setLoading(false);
    };

    const StatCard = ({ title, value, subtitle, icon: Icon, color, trend }: any) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all"
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">{title}</p>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{value}</h3>
                    {subtitle && (
                        <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
                    )}
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${color}`}>
                    <Icon />
                </div>
            </div>
            {trend !== undefined && (
                <div className={`flex items-center gap-1 mt-3 text-xs font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {trend >= 0 ? <FiTrendingUp /> : <FiTrendingDown />}
                    <span>{Math.abs(trend)}% from last month</span>
                </div>
            )}
        </motion.div>
    );

    const formatTimeAgo = (timestamp: string) => {
        const diff = Date.now() - new Date(timestamp).getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    };

    const getActivityIcon = (type: string, status?: string) => {
        if (type === 'message') return <FiMail className="text-blue-500" />;
        if (type === 'access_request') {
            if (status === 'pending') return <FiClock className="text-yellow-500" />;
            if (status === 'approved') return <FiCheckCircle className="text-green-500" />;
            return <FiAlertCircle className="text-red-500" />;
        }
        if (type === 'project') return <FiFileText className="text-purple-500" />;
        return <FiBook className="text-orange-500" />;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            {/* Welcome Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back, {session?.user?.name || 'Admin'}</h1>
                    <p className="text-gray-500 dark:text-gray-400">Here's what's happening with your portfolio.</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/admin/projects/new" className="btn btn-primary flex items-center gap-2">
                        <FiPlus /> New Project
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Projects"
                    value={stats.projects}
                    icon={FiFileText}
                    color="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                />
                <StatCard
                    title="Publications"
                    value={stats.publications}
                    icon={FiBook}
                    color="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
                />
                <StatCard
                    title="Messages"
                    value={stats.messages}
                    subtitle={stats.unreadMessages > 0 ? `${stats.unreadMessages} unread` : undefined}
                    icon={FiMail}
                    color="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
                />
                <StatCard
                    title="Access Requests"
                    value={stats.accessRequests}
                    subtitle={stats.pendingRequests > 0 ? `${stats.pendingRequests} pending` : undefined}
                    icon={FiLock}
                    color="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Quick Actions */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-bold mb-6">Quick Actions</h3>
                    <div className="space-y-3">
                        <Link href="/admin/projects/new" className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-xl transition-all group">
                            <div className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                <FiPlus />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900 dark:text-white">Add Project</p>
                                <p className="text-xs text-gray-500">Create a new case study</p>
                            </div>
                        </Link>
                        <Link href="/admin/publications/new" className="flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-xl transition-all group">
                            <div className="w-10 h-10 bg-purple-600 text-white rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                <FiPlus />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900 dark:text-white">Add Publication</p>
                                <p className="text-xs text-gray-500">Log a new research paper</p>
                            </div>
                        </Link>
                        <Link href="/admin/messages" className="flex items-center gap-3 p-4 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 rounded-xl transition-all group">
                            <div className="w-10 h-10 bg-orange-600 text-white rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                <FiMail />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900 dark:text-white">View Messages</p>
                                <p className="text-xs text-gray-500">{stats.unreadMessages} unread</p>
                            </div>
                        </Link>
                        <Link href="/admin/access-requests" className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-xl transition-all group">
                            <div className="w-10 h-10 bg-green-600 text-white rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                <FiLock />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900 dark:text-white">Access Requests</p>
                                <p className="text-xs text-gray-500">{stats.pendingRequests} pending</p>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold">Recent Activity</h3>
                        <Link href="/admin/messages" className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All</Link>
                    </div>
                    {recentActivity.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <FiClock className="mx-auto text-3xl mb-3 opacity-50" />
                            <p>No recent activity</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {recentActivity.map((activity) => (
                                <motion.div
                                    key={activity.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                                >
                                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                        {getActivityIcon(activity.type, activity.status)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{activity.title}</p>
                                        <p className="text-xs text-gray-500 truncate">{activity.description}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs text-gray-400">{formatTimeAgo(activity.timestamp)}</span>
                                        {activity.status && (
                                            <span className={`block mt-1 text-xs px-2 py-0.5 rounded-full ${activity.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                    activity.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                        'bg-red-100 text-red-700'
                                                }`}>
                                                {activity.status}
                                            </span>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Projects by Category */}
            {projectsByCategory.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-bold mb-6">Projects by Category</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {projectsByCategory.map(({ category, count }) => (
                            <div key={category} className="text-center p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{count}</p>
                                <p className="text-xs text-gray-500 truncate">{category}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Quick Links */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link href="/" target="_blank" className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <FiEye className="text-gray-400" />
                    <span className="text-sm font-medium">View Site</span>
                </Link>
                <Link href="/admin/settings" className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <span className="text-sm font-medium">⚙️ Settings</span>
                </Link>
                <Link href="/blog" target="_blank" className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <span className="text-sm font-medium">📝 Blog</span>
                </Link>
                <Link href="/admin/projects" className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <span className="text-sm font-medium">📁 All Projects</span>
                </Link>
            </div>
        </div>
    );
}
