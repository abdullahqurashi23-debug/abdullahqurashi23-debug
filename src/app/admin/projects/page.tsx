'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Button from '@/components/ui/Button';
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiSearch, FiFilter, FiLock, FiGlobe, FiShield, FiStar, FiRefreshCw } from 'react-icons/fi';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface Project {
    id: string;
    title: string;
    slug: string;
    short_description: string;
    category: string[];
    visibility: 'public' | 'gated' | 'nda';
    is_featured: boolean;
    created_at: string;
}

export default function AdminProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<'all' | 'public' | 'gated' | 'nda'>('all');
    const [updating, setUpdating] = useState<string | null>(null);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('projects')
            .select('id, title, slug, short_description, category, visibility, is_featured, created_at')
            .order('created_at', { ascending: false });

        if (data) setProjects(data);
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this project?')) return;

        try {
            const { error } = await supabase.from('projects').delete().eq('id', id);
            if (error) {
                alert('Failed to delete project: ' + error.message);
            } else {
                fetchProjects();
            }
        } catch (err: any) {
            alert('Failed to delete project: ' + (err?.message || 'Unknown error'));
        }
    };

    const toggleVisibility = async (id: string, current: string) => {
        const order = ['public', 'gated', 'nda'];
        const next = order[(order.indexOf(current) + 1) % order.length];

        setUpdating(id);
        await supabase.from('projects').update({ visibility: next }).eq('id', id);
        setProjects(projects.map(p => p.id === id ? { ...p, visibility: next as any } : p));
        setUpdating(null);
    };

    const toggleFeatured = async (id: string, current: boolean) => {
        setUpdating(id);
        await supabase.from('projects').update({ is_featured: !current }).eq('id', id);
        setProjects(projects.map(p => p.id === id ? { ...p, is_featured: !current } : p));
        setUpdating(null);
    };

    const filteredProjects = projects.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
            p.short_description?.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === 'all' || p.visibility === filter;
        return matchesSearch && matchesFilter;
    });

    const getVisibilityIcon = (visibility: string) => {
        switch (visibility) {
            case 'public': return <FiGlobe className="text-green-500" />;
            case 'gated': return <FiLock className="text-amber-500" />;
            case 'nda': return <FiShield className="text-red-500" />;
            default: return <FiGlobe />;
        }
    };

    const getVisibilityBadge = (visibility: string) => {
        const styles: { [key: string]: string } = {
            public: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
            gated: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
            nda: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        };
        return styles[visibility] || styles.public;
    };

    const visibilityCounts = {
        all: projects.length,
        public: projects.filter(p => p.visibility === 'public').length,
        gated: projects.filter(p => p.visibility === 'gated').length,
        nda: projects.filter(p => p.visibility === 'nda').length,
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Projects</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your portfolio projects and visibility settings</p>
                </div>
                <div className="flex gap-3">
                    <Button onClick={fetchProjects} variant="secondary" className="flex items-center gap-2">
                        <FiRefreshCw className={loading ? 'animate-spin' : ''} /> Refresh
                    </Button>
                    <Link href="/admin/projects/new">
                        <Button className="flex items-center gap-2">
                            <FiPlus /> Add Project
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search projects..."
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:border-blue-500"
                    />
                </div>
                <div className="flex gap-2">
                    {(['all', 'public', 'gated', 'nda'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${filter === f
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                }`}
                        >
                            {f !== 'all' && getVisibilityIcon(f)}
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                            <span className="ml-1 px-1.5 py-0.5 bg-white/20 dark:bg-black/20 rounded text-xs">
                                {visibilityCounts[f]}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Projects Table */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-gray-500">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
                        Loading projects...
                    </div>
                ) : filteredProjects.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <FiFilter className="mx-auto text-4xl mb-4 opacity-50" />
                        <p>No projects found{filter !== 'all' ? ` with ${filter} visibility` : ''}.</p>
                        <Link href="/admin/projects/new" className="text-blue-600 hover:underline mt-2 inline-block">
                            Create your first project →
                        </Link>
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 font-medium text-sm border-b border-gray-100 dark:border-gray-700">
                            <tr>
                                <th className="p-4">Project</th>
                                <th className="p-4">Category</th>
                                <th className="p-4 text-center">Visibility</th>
                                <th className="p-4 text-center">Featured</th>
                                <th className="p-4">Date</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            <AnimatePresence>
                                {filteredProjects.map((project) => (
                                    <motion.tr
                                        key={project.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                                    >
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                {project.is_featured && (
                                                    <span className="text-yellow-500" title="Featured">
                                                        <FiStar fill="currentColor" />
                                                    </span>
                                                )}
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">{project.title}</p>
                                                    <p className="text-sm text-gray-500 truncate max-w-xs">
                                                        {project.short_description || 'No description'}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-sm text-gray-500">
                                                {project.category?.[0] || 'Uncategorized'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <button
                                                onClick={() => toggleVisibility(project.id, project.visibility)}
                                                disabled={updating === project.id}
                                                className={`px-3 py-1.5 rounded-full text-xs font-medium inline-flex items-center gap-1.5 transition-all hover:scale-105 ${getVisibilityBadge(project.visibility)}`}
                                                title="Click to cycle visibility"
                                            >
                                                {getVisibilityIcon(project.visibility)}
                                                {project.visibility}
                                            </button>
                                        </td>
                                        <td className="p-4 text-center">
                                            <button
                                                onClick={() => toggleFeatured(project.id, project.is_featured)}
                                                disabled={updating === project.id}
                                                className={`p-2 rounded-lg transition-all ${project.is_featured
                                                    ? 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30'
                                                    : 'text-gray-300 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                                                    }`}
                                                title={project.is_featured ? 'Remove from featured' : 'Add to featured'}
                                            >
                                                <FiStar fill={project.is_featured ? 'currentColor' : 'none'} />
                                            </button>
                                        </td>
                                        <td className="p-4 text-sm text-gray-500">
                                            {new Date(project.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex justify-end gap-1">
                                                <Link
                                                    href={`/projects/${project.slug}`}
                                                    target="_blank"
                                                    className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                    title="View"
                                                >
                                                    <FiEye />
                                                </Link>
                                                <Link
                                                    href={`/admin/projects/edit/${project.id}`}
                                                    className="p-2 text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <FiEdit2 />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(project.id)}
                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                )}
            </div>

            {/* Summary */}
            <div className="mt-6 text-sm text-gray-500 flex justify-between items-center">
                <span>
                    Showing {filteredProjects.length} of {projects.length} projects
                </span>
                <div className="flex gap-4">
                    <span className="flex items-center gap-1"><FiGlobe className="text-green-500" /> Public: {visibilityCounts.public}</span>
                    <span className="flex items-center gap-1"><FiLock className="text-amber-500" /> Gated: {visibilityCounts.gated}</span>
                    <span className="flex items-center gap-1"><FiShield className="text-red-500" /> NDA: {visibilityCounts.nda}</span>
                </div>
            </div>
        </div>
    );
}
