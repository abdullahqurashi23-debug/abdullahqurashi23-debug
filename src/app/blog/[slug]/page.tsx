'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiCalendar, FiClock, FiShare2, FiTwitter, FiLinkedin, FiCopy, FiCheck } from 'react-icons/fi';
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

export default function BlogPostPage() {
    const params = useParams();
    const slug = params?.slug as string;
    const [post, setPost] = useState<BlogPost | null>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    // Static sample posts for fallback
    const staticPosts: { [key: string]: BlogPost } = {
        'understanding-eeg-signals-bci': {
            id: '1',
            title: 'Understanding EEG Signals for Brain-Computer Interfaces',
            slug: 'understanding-eeg-signals-bci',
            excerpt: 'A deep dive into how EEG signals can be processed and interpreted for building effective brain-computer interfaces.',
            content: `
## Introduction

Electroencephalography (EEG) is a non-invasive method to record electrical activity of the brain. In this post, we explore how EEG signals can be leveraged for building brain-computer interfaces (BCIs).

## What is EEG?

EEG measures voltage fluctuations resulting from ionic current within the neurons of the brain. These signals are captured using electrodes placed on the scalp.

### Key Characteristics
- **Temporal Resolution**: Millisecond-level precision
- **Spatial Resolution**: Limited compared to fMRI
- **Portability**: Can be made portable for everyday use
- **Cost**: Relatively affordable compared to other neuroimaging

## Signal Processing Pipeline

1. **Preprocessing**: Filtering, artifact removal
2. **Feature Extraction**: Time-domain, frequency-domain, spatial features
3. **Classification**: ML models for intent recognition

## Applications in BCI

- Motor imagery classification
- P300 speller systems
- Emotion recognition
- Attention monitoring

## Challenges

- Signal noise from muscle movements
- Individual variability in EEG patterns
- Real-time processing requirements

## Conclusion

EEG-based BCIs hold immense potential for assistive technology, gaming, and healthcare applications. With advances in deep learning, we're seeing increasingly accurate and practical systems.
            `,
            cover_image: '/blog/eeg-bci.png',
            tags: ['EEG', 'BCI', 'Signal Processing'],
            status: 'published',
            published_at: '2024-01-15',
            reading_time: 8,
            created_at: '2024-01-15',
        },
        'federated-learning-healthcare': {
            id: '2',
            title: 'Federated Learning: Privacy-Preserving AI for Healthcare',
            slug: 'federated-learning-healthcare',
            excerpt: 'How federated learning enables multi-institutional collaboration without compromising patient privacy.',
            content: `
## Introduction

Federated learning is revolutionizing how we train AI models in healthcare by enabling collaboration without sharing raw patient data.

## The Privacy Challenge

Healthcare data is highly sensitive and regulated. Traditional centralized training requires pooling data, which raises:
- HIPAA compliance concerns
- Patient privacy risks
- Data sovereignty issues

## How Federated Learning Works

1. **Model Distribution**: Central server sends model to participants
2. **Local Training**: Each institution trains on local data
3. **Gradient Aggregation**: Only model updates are shared
4. **Global Model**: Server aggregates updates into improved model

## Benefits

- **Privacy Preservation**: Raw data never leaves the institution
- **Regulatory Compliance**: Easier to meet HIPAA, GDPR requirements
- **Larger Datasets**: Effectively train on distributed data
- **Reduced Bias**: More diverse training populations

## Implementation Considerations

- Communication efficiency
- Non-IID data distributions
- Secure aggregation protocols
- Differential privacy integration

## Conclusion

Federated learning enables the promise of AI in healthcare while respecting patient privacy—a crucial advancement for the field.
            `,
            cover_image: '/blog/federated-learning.png',
            tags: ['Federated Learning', 'Privacy', 'Healthcare'],
            status: 'published',
            published_at: '2024-02-20',
            reading_time: 12,
            created_at: '2024-02-20',
        },
    };

    useEffect(() => {
        fetchPost();
    }, [slug]);

    const fetchPost = async () => {
        if (!slug) return;

        try {
            const { data, error } = await supabase
                .from('blog_posts')
                .select('*')
                .eq('slug', slug)
                .eq('status', 'published')
                .single();

            if (data) {
                setPost(data);
            } else if (staticPosts[slug]) {
                setPost(staticPosts[slug]);
            }
        } catch (error) {
            console.error('Error fetching post:', error);
            if (staticPosts[slug]) {
                setPost(staticPosts[slug]);
            }
        }
        setLoading(false);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleCopyLink = () => {
        if (typeof window !== 'undefined') {
            navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const renderContent = (content: string) => {
        // Simple markdown-like rendering
        return content.split('\n').map((line, i) => {
            const trimmed = line.trim();
            if (trimmed.startsWith('## ')) {
                return <h2 key={i} className="text-2xl font-bold mt-8 mb-4 text-[var(--text-primary)]">{trimmed.replace('## ', '')}</h2>;
            }
            if (trimmed.startsWith('### ')) {
                return <h3 key={i} className="text-xl font-bold mt-6 mb-3 text-[var(--text-primary)]">{trimmed.replace('### ', '')}</h3>;
            }
            if (trimmed.startsWith('- ')) {
                return <li key={i} className="ml-4 mb-2 text-[var(--text-secondary)]">{trimmed.replace('- ', '')}</li>;
            }
            if (/^\d+\./.test(trimmed)) {
                return <li key={i} className="ml-4 mb-2 text-[var(--text-secondary)] list-decimal">{trimmed.replace(/^\d+\.\s*/, '')}</li>;
            }
            if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
                return <p key={i} className="font-bold mb-2 text-[var(--text-primary)]">{trimmed.replace(/\*\*/g, '')}</p>;
            }
            if (trimmed) {
                return <p key={i} className="mb-4 text-[var(--text-secondary)] leading-relaxed">{line}</p>;
            }
            return null;
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen py-16">
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="animate-pulse">
                        <div className="h-8 bg-[var(--border)] rounded w-24 mb-8" />
                        <div className="h-12 bg-[var(--border)] rounded w-3/4 mb-4" />
                        <div className="h-6 bg-[var(--border)] rounded w-1/2 mb-8" />
                        <div className="aspect-video bg-[var(--border)] rounded-xl mb-8" />
                        <div className="space-y-4">
                            <div className="h-4 bg-[var(--border)] rounded w-full" />
                            <div className="h-4 bg-[var(--border)] rounded w-full" />
                            <div className="h-4 bg-[var(--border)] rounded w-3/4" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen py-16">
                <div className="container mx-auto px-6 text-center">
                    <h1 className="text-4xl font-bold mb-4">Post Not Found</h1>
                    <p className="text-[var(--text-secondary)] mb-8">The blog post you're looking for doesn't exist.</p>
                    <Link href="/blog" className="btn btn-primary">
                        Back to Blog
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-16">
            <article className="container mx-auto px-6 max-w-4xl">
                {/* Back Link */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--brand-primary)] transition-colors mb-8"
                    >
                        <FiArrowLeft /> Back to Blog
                    </Link>
                </motion.div>

                {/* Header */}
                <motion.header
                    className="mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags?.map(tag => (
                            <span key={tag} className="badge badge-primary">
                                {tag}
                            </span>
                        ))}
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl md:text-4xl font-bold font-display text-[var(--text-primary)] mb-4">
                        {post.title}
                    </h1>

                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--text-muted)]">
                        <span className="flex items-center gap-1">
                            <FiCalendar size={14} />
                            {formatDate(post.published_at)}
                        </span>
                        <span className="flex items-center gap-1">
                            <FiClock size={14} />
                            {post.reading_time} min read
                        </span>
                    </div>
                </motion.header>

                {/* Cover Image */}
                {post.cover_image && (
                    <motion.div
                        className="aspect-video rounded-xl overflow-hidden mb-8 bg-gradient-to-br from-[var(--brand-primary)]/20 to-purple-500/20"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <img
                            src={post.cover_image}
                            alt={post.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                            }}
                        />
                    </motion.div>
                )}

                {/* Content */}
                <motion.div
                    className="prose prose-lg dark:prose-invert max-w-none"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    {renderContent(post.content)}
                </motion.div>

                {/* Share */}
                <motion.div
                    className="mt-12 pt-8 border-t border-[var(--border)]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-[var(--text-muted)] flex items-center gap-1">
                            <FiShare2 size={14} /> Share:
                        </span>
                        <a
                            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${typeof window !== 'undefined' ? encodeURIComponent(window.location.href) : ''}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 rounded-lg bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:text-[#1DA1F2] hover:border-[#1DA1F2] transition-all"
                        >
                            <FiTwitter size={18} />
                        </a>
                        <a
                            href={`https://www.linkedin.com/sharing/share-offsite/?url=${typeof window !== 'undefined' ? encodeURIComponent(window.location.href) : ''}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 rounded-lg bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:text-[#0077b5] hover:border-[#0077b5] transition-all"
                        >
                            <FiLinkedin size={18} />
                        </a>
                        <button
                            onClick={handleCopyLink}
                            className="w-10 h-10 rounded-lg bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--brand-primary)] hover:border-[var(--brand-primary)] transition-all"
                        >
                            {copied ? <FiCheck size={18} className="text-emerald-500" /> : <FiCopy size={18} />}
                        </button>
                    </div>
                </motion.div>

                {/* Back to Blog CTA */}
                <motion.div
                    className="mt-12 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    <Link href="/blog" className="btn btn-secondary">
                        ← More Posts
                    </Link>
                </motion.div>
            </article>
        </div>
    );
}
