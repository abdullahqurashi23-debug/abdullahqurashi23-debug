'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Button from '@/components/ui/Button';
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiSearch, FiEdit3, FiRefreshCw, FiCalendar, FiClock } from 'react-icons/fi';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface BlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    cover_image: string;
    tags: string[];
    status: 'draft' | 'published';
    published_at: string;
    reading_time: number;
    created_at: string;
}

// Sample blog posts for fallback
const samplePosts: BlogPost[] = [
    {
        id: '1',
        title: 'Understanding EEG Signals for Brain-Computer Interfaces',
        slug: 'understanding-eeg-signals-bci',
        excerpt: 'A deep dive into how EEG signals can be processed and interpreted for building effective brain-computer interfaces.',
        cover_image: '/blog/eeg-bci.png',
        tags: ['EEG', 'BCI', 'Signal Processing'],
        status: 'published',
        published_at: '2024-01-15',
        reading_time: 8,
        created_at: '2024-01-15',
    },
    {
        id: '2',
        title: 'Federated Learning: Privacy-Preserving AI for Healthcare',
        slug: 'federated-learning-healthcare',
        excerpt: 'How federated learning enables multi-institutional collaboration without compromising patient privacy.',
        cover_image: '/blog/federated-learning.png',
        tags: ['Federated Learning', 'Privacy', 'Healthcare'],
        status: 'published',
        published_at: '2024-02-20',
        reading_time: 12,
        created_at: '2024-02-20',
    },
    {
        id: '3',
        title: 'Getting Started with PyTorch for Medical Imaging',
        slug: 'pytorch-medical-imaging',
        excerpt: 'A beginner-friendly guide to using PyTorch for medical image analysis and segmentation tasks.',
        cover_image: '/blog/pytorch-medical.png',
        tags: ['PyTorch', 'Medical Imaging', 'Tutorial'],
        status: 'draft',
        published_at: '',
        reading_time: 15,
        created_at: '2024-03-01',
    },
];

export default function AdminBlogPage() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');
    const [deleting, setDeleting] = useState<string | null>(null);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('blog_posts')
                .select('*')
                .order('created_at', { ascending: false });

            if (data && data.length > 0) {
                setPosts(data);
            } else {
                setPosts(samplePosts);
            }
        } catch (error) {
            console.error('Error fetching posts:', error);
            setPosts(samplePosts);
        }
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this post?')) return;

        setDeleting(id);
        try {
            const { error } = await supabase.from('blog_posts').delete().eq('id', id);
            if (error) {
                alert('Failed to delete post: ' + error.message);
            } else {
                setPosts(posts.filter(p => p.id !== id));
            }
        } catch (err: any) {
            alert('Failed to delete post: ' + (err?.message || 'Unknown error'));
            console.error('Error deleting:', err);
        }
        setDeleting(null);
    };

    const toggleStatus = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'published' ? 'draft' : 'published';
        const updateData: any = { status: newStatus };
        if (newStatus === 'published') {
            updateData.published_at = new Date().toISOString().split('T')[0];
        }

        try {
            await supabase.from('blog_posts').update(updateData).eq('id', id);
            setPosts(posts.map(p => p.id === id ? { ...p, status: newStatus as any, published_at: updateData.published_at || p.published_at } : p));
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const filteredPosts = posts.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
            p.excerpt?.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === 'all' || p.status === filter;
        return matchesSearch && matchesFilter;
    });

    const formatDate = (dateString: string) => {
        if (!dateString) return 'Not published';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const statusCounts = {
        all: posts.length,
        published: posts.filter(p => p.status === 'published').length,
        draft: posts.filter(p => p.status === 'draft').length,
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <FiEdit3 className="text-purple-500" />
                        Blog Posts
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Create and manage your blog content
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary" onClick={fetchPosts} disabled={loading}>
                        <FiRefreshCw className={loading ? 'animate-spin' : ''} />
                    </Button>
                    <Link href="/admin/blog/new">
                        <Button className="flex items-center gap-2">
                            <FiPlus /> New Post
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                    <p className="text-3xl font-bold text-purple-500">{statusCounts.all}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Posts</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                    <p className="text-3xl font-bold text-green-500">{statusCounts.published}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Published</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                    <p className="text-3xl font-bold text-yellow-500">{statusCounts.draft}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Drafts</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search posts..."
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-purple-500"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    {(['all', 'published', 'draft'] as const).map(status => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-2 rounded-lg font-medium transition ${filter === status
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                                }`}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)} ({statusCounts[status]})
                        </button>
                    ))}
                </div>
            </div>

            {/* Posts List */}
            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 animate-pulse">
                            <div className="flex gap-4">
                                <div className="w-32 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                                <div className="flex-1">
                                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : filteredPosts.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <FiEdit3 className="mx-auto text-6xl text-gray-300 dark:text-gray-600 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No posts found</h3>
                    <p className="text-gray-500 mb-6">Start sharing your insights with the world.</p>
                    <Link href="/admin/blog/new">
                        <Button>
                            <FiPlus className="mr-2" /> Create First Post
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    <AnimatePresence>
                        {filteredPosts.map((post) => (
                            <motion.div
                                key={post.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg transition-shadow"
                            >
                                <div className="flex flex-col md:flex-row gap-4">
                                    {/* Cover Image */}
                                    <div className="w-full md:w-40 h-24 bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/20 dark:to-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                                        {post.cover_image ? (
                                            <img
                                                src={post.cover_image}
                                                alt={post.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <FiEdit3 className="text-2xl text-purple-300" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1 line-clamp-1">
                                                    {post.title}
                                                </h3>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                                                    {post.excerpt}
                                                </p>
                                                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <FiCalendar size={12} />
                                                        {formatDate(post.published_at || post.created_at)}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <FiClock size={12} />
                                                        {post.reading_time} min read
                                                    </span>
                                                    <button
                                                        onClick={() => toggleStatus(post.id, post.status)}
                                                        className={`px-2 py-1 rounded-full text-xs font-medium ${post.status === 'published'
                                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                            }`}
                                                    >
                                                        {post.status}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex gap-2">
                                                <Link href={`/blog/${post.slug}`} target="_blank">
                                                    <button className="p-2 text-gray-400 hover:text-blue-500 transition">
                                                        <FiEye size={18} />
                                                    </button>
                                                </Link>
                                                <Link href={`/admin/blog/${post.id}/edit`}>
                                                    <button className="p-2 text-gray-400 hover:text-purple-500 transition">
                                                        <FiEdit2 size={18} />
                                                    </button>
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(post.id)}
                                                    disabled={deleting === post.id}
                                                    className="p-2 text-gray-400 hover:text-red-500 transition disabled:opacity-50"
                                                >
                                                    <FiTrash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
