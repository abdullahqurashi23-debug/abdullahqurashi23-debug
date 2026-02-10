'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiFilter, FiExternalLink, FiLock, FiGlobe, FiShield } from 'react-icons/fi';
import Card from '@/components/ui/Card';
import { supabase } from '@/lib/supabase';

interface Project {
    id: string;
    title: string;
    slug: string;
    short_description: string;
    category: string[];
    tags: string[];
    images: { url: string; caption: string }[];
    visibility: string;
    is_featured: boolean;
    created_at: string;
}

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    const categories = [
        { key: 'All', label: 'All Projects' },
        { key: 'Healthcare AI', label: 'Healthcare AI' },
        { key: 'Computer Vision', label: 'Computer Vision' },
        { key: 'EEG/BCI', label: 'EEG/BCI' },
        { key: 'NLP', label: 'NLP' },
        { key: 'Cybersecurity', label: 'Cybersecurity' },
        { key: 'Privacy', label: 'Privacy' },
        { key: 'IoT', label: 'IoT' },
    ];

    // Emal Kamawal's actual projects
    const staticProjects: Project[] = [
        {
            id: '1',
            title: 'Thought Viz: EEG-Driven Visual Reconstruction',
            slug: 'thought-viz',
            short_description: 'Novel BCI pipeline for reconstructing visual scenes from EEG signals using adaptive encoder-decoder architecture coupled with diffusion models. Achieved 78% accuracy with real-time processing under 200ms latency.',
            category: ['EEG/BCI', 'Healthcare AI'],
            tags: ['BCI', 'Deep Learning', 'EEG', 'Diffusion Models', 'Signal Processing'],
            images: [{ url: '/projects/thought-viz.png', caption: 'Thought Viz Architecture' }],
            visibility: 'public',
            is_featured: true,
            created_at: '2025-01-01',
        },
        {
            id: '2',
            title: 'Brain Tumor Segmentation System',
            slug: 'brain-tumor-segmentation',
            short_description: 'U-Net based brain tumor segmentation system achieving 98.2% dice coefficient on BRATS dataset. Validated with medical professionals for clinical deployment.',
            category: ['Healthcare AI', 'Computer Vision'],
            tags: ['Medical Imaging', 'Segmentation', 'U-Net', 'Deep Learning', 'MRI'],
            images: [{ url: '/projects/brain-tumor.png', caption: 'Segmentation Results' }],
            visibility: 'public',
            is_featured: true,
            created_at: '2024-01-15',
        },
        {
            id: '3',
            title: 'Heart Disease Prediction System',
            slug: 'heart-disease-prediction',
            short_description: 'Ensemble learning approach for heart disease prediction reaching 99.35% accuracy using clinical biomarkers. Collaborated with medical professionals for validation.',
            category: ['Healthcare AI'],
            tags: ['Ensemble Learning', 'Clinical Data', 'Healthcare', 'Biomarkers'],
            images: [{ url: '/projects/heart-disease.png', caption: 'Prediction Pipeline' }],
            visibility: 'public',
            is_featured: true,
            created_at: '2024-02-20',
        },
        {
            id: '4',
            title: 'Dental X-Ray AI Analysis',
            slug: 'dental-xray-ai',
            short_description: 'AI-driven dental X-ray image analysis system for automated missing-teeth detection using YOLO-based segmentation with high-resolution, multi-scale inference.',
            category: ['Healthcare AI', 'Computer Vision'],
            tags: ['Dental AI', 'X-Ray', 'YOLO', 'Object Detection', 'Healthcare'],
            images: [{ url: '/projects/dental-ai.png', caption: 'Detection Results' }],
            visibility: 'gated',
            is_featured: false,
            created_at: '2025-06-20',
        },
        {
            id: '5',
            title: 'Real-Time DDoS Attack Detection',
            slug: 'ddos-detection',
            short_description: 'Supervised learning pipeline for network intrusion detection achieving 96.8% accuracy with sub-millisecond response time. Implemented advanced feature engineering for high-dimensional network traffic.',
            category: ['Cybersecurity'],
            tags: ['DDoS', 'Network Security', 'Machine Learning', 'Anomaly Detection'],
            images: [{ url: '/projects/ddos-defense.png', caption: 'Detection Pipeline' }],
            visibility: 'public',
            is_featured: false,
            created_at: '2023-11-05',
        },
        {
            id: '6',
            title: 'YOLO-Powered Blackjack Strategy Assistant',
            slug: 'blackjack-cv',
            short_description: 'Real-time card detection and optimal strategy recommendation system using YOLOv8. Integrated probability calculations with live video feed processing.',
            category: ['Computer Vision'],
            tags: ['YOLO', 'Real-time Detection', 'Computer Vision', 'Gaming AI'],
            images: [{ url: '/projects/blackjack.png', caption: 'Card Detection' }],
            visibility: 'public',
            is_featured: false,
            created_at: '2023-09-15',
        },
        {
            id: '7',
            title: 'PDF Malware Analysis Framework',
            slug: 'pdf-malware-detection',
            short_description: 'Comprehensive NLP pipeline for detecting malicious JavaScript, embedded links, and phishing content in PDF documents using deep learning and pattern recognition.',
            category: ['Cybersecurity', 'NLP'],
            tags: ['Malware Detection', 'NLP', 'PDF Analysis', 'Deep Learning', 'Security'],
            images: [{ url: '/projects/pdf-malware.png', caption: 'Analysis Pipeline' }],
            visibility: 'public',
            is_featured: false,
            created_at: '2023-08-10',
        },
        {
            id: '8',
            title: 'Federated Learning Healthcare System',
            slug: 'federated-healthcare',
            short_description: 'Federated learning framework for collaborative medical AI model training while preserving patient data privacy across multiple healthcare institutions.',
            category: ['Healthcare AI', 'Privacy'],
            tags: ['Federated Learning', 'Privacy-Preserving ML', 'Healthcare', 'Distributed Systems'],
            images: [{ url: '/projects/federated-learning.png', caption: 'Federated Architecture' }],
            visibility: 'gated',
            is_featured: true,
            created_at: '2023-07-01',
        },
    ];

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        // Check if Supabase is properly configured (not a placeholder URL)
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        const isSupabaseConfigured = supabaseUrl && !supabaseUrl.includes('your-project');

        if (!isSupabaseConfigured) {
            // Use static projects when Supabase is not configured
            setProjects(staticProjects);
            setLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (data && data.length > 0) {
                setProjects(data);
            } else {
                setProjects(staticProjects);
            }
        } catch (error) {
            console.error('Error fetching projects:', error);
            setProjects(staticProjects);
        }
        setLoading(false);
    };

    const filteredProjects = projects.filter(project => {
        const matchesCategory = activeCategory === 'All' || project.category?.includes(activeCategory);
        const matchesSearch = searchQuery === '' ||
            project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            project.short_description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            project.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    const getProjectImage = (project: Project) => {
        if (project.images && project.images.length > 0) {
            return project.images[0].url;
        }
        return `/projects/${project.slug}.png`;
    };

    const getVisibilityBadge = (visibility: string) => {
        switch (visibility) {
            case 'public':
                return { icon: <FiGlobe size={12} />, label: 'Public', class: 'badge-public' };
            case 'gated':
                return { icon: <FiLock size={12} />, label: 'Gated', class: 'badge-gated' };
            case 'nda':
                return { icon: <FiShield size={12} />, label: 'NDA', class: 'badge-nda' };
            default:
                return { icon: <FiGlobe size={12} />, label: 'Public', class: 'badge-public' };
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
    };

    return (
        <div className="min-h-screen py-16">
            {/* Header */}
            <div className="container mx-auto px-6">
                <motion.div
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-4xl md:text-5xl font-bold font-display mb-4">Projects</h1>
                    <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
                        A showcase of my research and development work in AI, Healthcare, and Engineering.
                        Some projects are gated for confidentiality — request access to learn more.
                    </p>
                </motion.div>

                {/* Search & Filters */}
                <motion.div
                    className="mb-12 space-y-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    {/* Search Bar */}
                    <div className="max-w-md mx-auto">
                        <div className="relative">
                            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                            <input
                                type="text"
                                placeholder="Search projects..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)] transition-colors"
                            />
                        </div>
                    </div>

                    {/* Category Filters */}
                    <div className="flex flex-wrap justify-center gap-2">
                        {categories.map((cat) => (
                            <button
                                key={cat.key}
                                onClick={() => setActiveCategory(cat.key)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === cat.key
                                    ? 'bg-[var(--brand-primary)] text-white shadow-md'
                                    : 'bg-[var(--surface)] text-[var(--text-secondary)] border border-[var(--border)] hover:border-[var(--brand-primary)] hover:text-[var(--text-primary)]'
                                    }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Results Count */}
                <motion.div
                    className="mb-8 flex items-center justify-between"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <p className="text-sm text-[var(--text-muted)]">
                        Showing {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''}
                        {activeCategory !== 'All' && ` in ${activeCategory}`}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                        <span className="flex items-center gap-1"><FiGlobe size={12} /> Public</span>
                        <span className="flex items-center gap-1"><FiLock size={12} /> Gated</span>
                        <span className="flex items-center gap-1"><FiShield size={12} /> NDA</span>
                    </div>
                </motion.div>

                {/* Loading State */}
                {loading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="bg-[var(--surface)] rounded-xl p-6 animate-pulse">
                                <div className="aspect-video bg-[var(--border)] rounded-lg mb-4" />
                                <div className="h-6 bg-[var(--border)] rounded mb-2" />
                                <div className="h-4 bg-[var(--border)] rounded w-3/4" />
                            </div>
                        ))}
                    </div>
                )}

                {/* Projects Grid */}
                {!loading && filteredProjects.length === 0 ? (
                    <motion.div
                        className="text-center py-16"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <div className="text-6xl mb-4">🔍</div>
                        <p className="text-[var(--text-secondary)] text-lg mb-2">
                            No projects found
                        </p>
                        <p className="text-[var(--text-muted)] text-sm">
                            Try adjusting your search or filter criteria
                        </p>
                    </motion.div>
                ) : (
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                    >
                        <AnimatePresence mode="popLayout">
                            {filteredProjects.map((project) => {
                                const visibility = getVisibilityBadge(project.visibility);
                                return (
                                    <motion.div
                                        key={project.id}
                                        variants={itemVariants}
                                        layout
                                        exit={{ opacity: 0, scale: 0.9 }}
                                    >
                                        <Link href={`/projects/${project.slug}`}>
                                            <Card className="h-full overflow-hidden group cursor-pointer" hover>
                                                {/* Image */}
                                                <div className="aspect-video -mx-6 -mt-6 mb-6 overflow-hidden relative">
                                                    <img
                                                        src={getProjectImage(project)}
                                                        alt={project.title}
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).src = '/projects/thought-viz.png';
                                                        }}
                                                    />
                                                    {/* Gradient Overlay */}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                                    {/* Badges */}
                                                    <div className="absolute top-3 right-3 flex gap-2">
                                                        {project.is_featured && (
                                                            <span className="px-2 py-1 bg-amber-500/90 text-amber-900 text-xs font-bold rounded-md backdrop-blur-sm">
                                                                ⭐ Featured
                                                            </span>
                                                        )}
                                                        <span className={`badge ${visibility.class} flex items-center gap-1`}>
                                                            {visibility.icon} {visibility.label}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Tags */}
                                                <div className="flex gap-2 mb-3 flex-wrap">
                                                    {project.tags?.slice(0, 3).map(tag => (
                                                        <span key={tag} className="badge badge-primary">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                    {project.tags?.length > 3 && (
                                                        <span className="text-xs text-[var(--text-muted)]">
                                                            +{project.tags.length - 3} more
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Content */}
                                                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2 group-hover:text-[var(--brand-primary)] transition-colors">
                                                    {project.title}
                                                </h3>
                                                <p className="text-[var(--text-secondary)] text-sm mb-4 line-clamp-2">
                                                    {project.short_description}
                                                </p>

                                                {/* Link */}
                                                <span className="inline-flex items-center gap-1 text-[var(--brand-primary)] font-medium text-sm group-hover:gap-2 transition-all">
                                                    View Details <FiExternalLink size={14} />
                                                </span>
                                            </Card>
                                        </Link>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
