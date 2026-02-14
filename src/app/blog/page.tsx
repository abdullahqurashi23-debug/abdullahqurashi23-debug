'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiCalendar, FiClock, FiArrowRight, FiSearch, FiTag } from 'react-icons/fi';
import Card from '@/components/ui/Card';
import { supabase } from '@/lib/supabase';

interface BlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    cover_image: string;
    tags: string[];
    status: 'draft' | 'published';
    published_at: string;
    reading_time: number;
    created_at: string;
}

export default function BlogPage() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTag, setActiveTag] = useState('All');

    // Static sample posts
    const staticPosts: BlogPost[] = [
        {
            id: '1',
            title: 'Understanding EEG Signals for Brain-Computer Interfaces',
            slug: 'understanding-eeg-signals-bci',
            excerpt: 'A deep dive into how EEG signals can be processed and interpreted for building effective brain-computer interfaces.',
            content: '',
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
            content: '',
            cover_image: '/blog/federated-learning.png',
            tags: ['Federated Learning', 'Privacy', 'Healthcare'],
            status: 'published',
            published_at: '2024-02-20',
            reading_time: 12,
            created_at: '2024-02-20',
        },
        {
            id: '3',
            title: 'Building Production-Ready Medical Imaging Models',
            slug: 'production-medical-imaging',
            excerpt: 'Lessons learned from deploying medical imaging AI models in clinical settings.',
            content: '',
            cover_image: '/blog/medical-imaging.png',
            tags: ['Medical Imaging', 'MLOps', 'Deployment'],
            status: 'published',
            published_at: '2023-11-10',
            reading_time: 10,
            created_at: '2023-11-10',
        },
        {
            id: '4',
            title: 'Attention Mechanisms in U-Net Architectures',
            slug: 'attention-unet-architectures',
            excerpt: 'Exploring how attention mechanisms can improve segmentation performance in U-Net based models.',
            content: '',
            cover_image: '/blog/attention-unet.png',
            tags: ['Deep Learning', 'Segmentation', 'Architecture'],
            status: 'published',
            published_at: '2023-09-05',
            reading_time: 15,
            created_at: '2023-09-05',
        },
    ];

    const allTags = ['All', ...new Set(staticPosts.flatMap(post => post.tags))];

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const { data, error } = await supabase
                .from('blog_posts')
                .select('*')
                .eq('status', 'published')
                .order('published_at', { ascending: false });

            if (data) {
                // If data is empty array, it means no posts - which is valid
                setPosts(data);
            } else {
                // Fallback only if data is null (which shouldn't happen with select)
                setPosts(staticPosts);
            }
        } catch (error) {
            console.error('Error fetching blog posts:', error);
            setPosts(staticPosts);
        }
        setLoading(false);
    };

    const filteredPosts = posts.filter(post => {
        const matchesTag = activeTag === 'All' || post.tags?.includes(activeTag);
        const matchesSearch = searchQuery === '' ||
            post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesTag && matchesSearch;
    });

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="min-h-screen py-16">
            <div className="container mx-auto px-6">
                {/* Header */}
                <motion.div
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-4xl md:text-5xl font-bold font-display mb-4">Blog & Notes</h1>
                    <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
                        Research notes, experiment write-ups, and thoughts on AI, healthcare, and technology.
                    </p>
                </motion.div>

                {/* Search & Filters */}
                <motion.div
                    className="mb-12 space-y-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    {/* Search */}
                    <div className="max-w-md mx-auto">
                        <div className="relative">
                            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                            <input
                                type="text"
                                placeholder="Search posts..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)] transition-colors"
                            />
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap justify-center gap-2">
                        {allTags.map(tag => (
                            <button
                                key={tag}
                                onClick={() => setActiveTag(tag)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1 ${activeTag === tag
                                    ? 'bg-[var(--brand-primary)] text-white'
                                    : 'bg-[var(--surface)] text-[var(--text-secondary)] border border-[var(--border)] hover:border-[var(--brand-primary)]'
                                    }`}
                            >
                                {tag !== 'All' && <FiTag size={12} />}
                                {tag}
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Loading */}
                {loading && (
                    <div className="grid md:grid-cols-2 gap-8">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="bg-[var(--surface)] rounded-xl p-6 animate-pulse">
                                <div className="aspect-video bg-[var(--border)] rounded-lg mb-4" />
                                <div className="h-6 bg-[var(--border)] rounded mb-2" />
                                <div className="h-4 bg-[var(--border)] rounded w-3/4" />
                            </div>
                        ))}
                    </div>
                )}

                {/* Posts Grid */}
                {!loading && filteredPosts.length === 0 ? (
                    <motion.div
                        className="text-center py-16"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <div className="text-6xl mb-4">📝</div>
                        <p className="text-[var(--text-secondary)] text-lg mb-2">No posts found</p>
                        <p className="text-[var(--text-muted)] text-sm">Try adjusting your search or filters</p>
                    </motion.div>
                ) : (
                    <motion.div
                        className="grid md:grid-cols-2 gap-8"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        {filteredPosts.map((post, index) => (
                            <motion.div
                                key={post.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: index * 0.1 }}
                            >
                                <Link href={`/blog/${post.slug}`}>
                                    <Card className="h-full overflow-hidden group cursor-pointer" hover>
                                        {/* Cover Image */}
                                        <div className="aspect-video -mx-6 -mt-6 mb-6 overflow-hidden relative bg-gradient-to-br from-[var(--brand-primary)]/20 to-purple-500/20">
                                            {post.cover_image ? (
                                                <img
                                                    src={post.cover_image}
                                                    alt={post.title}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).style.display = 'none';
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-4xl">
                                                    📝
                                                </div>
                                            )}
                                        </div>

                                        {/* Meta */}
                                        <div className="flex items-center gap-4 text-sm text-[var(--text-muted)] mb-3">
                                            <span className="flex items-center gap-1">
                                                <FiCalendar size={14} />
                                                {formatDate(post.published_at)}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <FiClock size={14} />
                                                {post.reading_time} min read
                                            </span>
                                        </div>

                                        {/* Title */}
                                        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2 group-hover:text-[var(--brand-primary)] transition-colors">
                                            {post.title}
                                        </h2>

                                        {/* Excerpt */}
                                        <p className="text-[var(--text-secondary)] text-sm mb-4 line-clamp-2">
                                            {post.excerpt}
                                        </p>

                                        {/* Tags */}
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {post.tags?.slice(0, 3).map(tag => (
                                                <span key={tag} className="badge badge-primary text-xs">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>

                                        {/* Read More */}
                                        <span className="inline-flex items-center gap-1 text-[var(--brand-primary)] font-medium text-sm group-hover:gap-2 transition-all">
                                            Read More <FiArrowRight size={14} />
                                        </span>
                                    </Card>
                                </Link>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
