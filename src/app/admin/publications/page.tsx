'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Button from '@/components/ui/Button';
import { FiPlus, FiEdit2, FiTrash2, FiExternalLink, FiSearch, FiFilter, FiRefreshCw, FiBook, FiAward, FiClock, FiCheck } from 'react-icons/fi';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface Publication {
    id: string;
    title: string;
    authors: string;
    venue: string;
    year: number;
    doi: string;
    pdf_url: string;
    status: 'published' | 'under_review' | 'preprint';
    impact_factor: number | null;
    citations: number;
    created_at: string;
}

export default function AdminPublicationsPage() {
    const [publications, setPublications] = useState<Publication[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<'all' | 'published' | 'under_review' | 'preprint'>('all');
    const [deleting, setDeleting] = useState<string | null>(null);

    useEffect(() => {
        fetchPublications();
    }, []);

    const fetchPublications = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('publications')
            .select('*')
            .order('year', { ascending: false });

        if (data) setPublications(data);
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this publication?')) return;

        setDeleting(id);
        try {
            const { error } = await supabase.from('publications').delete().eq('id', id);
            if (error) {
                alert('Failed to delete publication: ' + error.message);
            } else {
                setPublications(publications.filter(p => p.id !== id));
            }
        } catch (err: any) {
            alert('Failed to delete publication: ' + (err?.message || 'Unknown error'));
        }
        setDeleting(null);
    };

    const updateStatus = async (id: string, status: string) => {
        await supabase.from('publications').update({ status }).eq('id', id);
        setPublications(publications.map(p => p.id === id ? { ...p, status: status as any } : p));
    };

    const filteredPublications = publications.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
            p.authors?.toLowerCase().includes(search.toLowerCase()) ||
            p.venue?.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === 'all' || p.status === filter;
        return matchesSearch && matchesFilter;
    });

    const getStatusBadge = (status: string) => {
        const styles: { [key: string]: string } = {
            published: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
            under_review: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
            preprint: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        };
        return styles[status] || styles.published;
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'published': return <FiCheck className="text-green-500" />;
            case 'under_review': return <FiClock className="text-amber-500" />;
            default: return <FiBook className="text-blue-500" />;
        }
    };

    const totalCitations = publications.reduce((sum, p) => sum + (p.citations || 0), 0);

    return (
        <div className="p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Publications</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        {publications.length} publications • {totalCitations} total citations
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button onClick={fetchPublications} variant="secondary" className="flex items-center gap-2">
                        <FiRefreshCw className={loading ? 'animate-spin' : ''} /> Refresh
                    </Button>
                    <Link href="/admin/publications/new">
                        <Button className="flex items-center gap-2">
                            <FiPlus /> Add Publication
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-lg flex items-center justify-center">
                            <FiCheck />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{publications.filter(p => p.status === 'published').length}</p>
                            <p className="text-xs text-gray-500">Published</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-lg flex items-center justify-center">
                            <FiClock />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{publications.filter(p => p.status === 'under_review').length}</p>
                            <p className="text-xs text-gray-500">Under Review</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg flex items-center justify-center">
                            <FiBook />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{publications.filter(p => p.status === 'preprint').length}</p>
                            <p className="text-xs text-gray-500">Preprints</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-lg flex items-center justify-center">
                            <FiAward />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{totalCitations}</p>
                            <p className="text-xs text-gray-500">Citations</p>
                        </div>
                    </div>
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
                        placeholder="Search by title, authors, or venue..."
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                    />
                </div>
                <div className="flex gap-2">
                    {(['all', 'published', 'under_review', 'preprint'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === f
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                                }`}
                        >
                            {f === 'all' ? 'All' : f.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                        </button>
                    ))}
                </div>
            </div>

            {/* Publications List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-gray-200 dark:border-gray-700">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
                        Loading publications...
                    </div>
                ) : filteredPublications.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-gray-200 dark:border-gray-700">
                        <FiBook className="mx-auto text-4xl mb-4 text-gray-300" />
                        <p className="text-gray-500">No publications found.</p>
                        <Link href="/admin/publications/new" className="text-blue-600 hover:underline mt-2 inline-block">
                            Add your first publication →
                        </Link>
                    </div>
                ) : (
                    <AnimatePresence>
                        {filteredPublications.map((pub) => (
                            <motion.div
                                key={pub.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                            >
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1 ${getStatusBadge(pub.status)}`}>
                                                {getStatusIcon(pub.status)}
                                                {pub.status.replace('_', ' ')}
                                            </span>
                                            <span className="text-sm text-gray-500">{pub.year}</span>
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{pub.title}</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{pub.authors}</p>
                                        <p className="text-sm text-gray-500 italic">{pub.venue}</p>
                                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                                            {pub.citations > 0 && (
                                                <span className="flex items-center gap-1">
                                                    <FiAward className="text-purple-500" /> {pub.citations} citations
                                                </span>
                                            )}
                                            {pub.impact_factor && (
                                                <span>IF: {pub.impact_factor}</span>
                                            )}
                                            {pub.doi && (
                                                <a href={`https://doi.org/${pub.doi}`} target="_blank" className="text-blue-600 hover:underline flex items-center gap-1">
                                                    DOI <FiExternalLink size={12} />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex md:flex-col gap-2">
                                        <select
                                            value={pub.status}
                                            onChange={(e) => updateStatus(pub.id, e.target.value)}
                                            className="px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                                        >
                                            <option value="published">Published</option>
                                            <option value="under_review">Under Review</option>
                                            <option value="preprint">Preprint</option>
                                        </select>
                                        <div className="flex gap-1">
                                            <Link
                                                href={`/admin/publications/edit/${pub.id}`}
                                                className="p-2 text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg"
                                            >
                                                <FiEdit2 />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(pub.id)}
                                                disabled={deleting === pub.id}
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                            >
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
}
