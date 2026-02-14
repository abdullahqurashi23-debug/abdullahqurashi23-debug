'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiLock, FiUnlock, FiDownload, FiGithub, FiExternalLink, FiCheck, FiCopy } from 'react-icons/fi';
import RequestAccessForm from '@/components/ui/RequestAccessForm';
import Card from '@/components/ui/Card';
import { supabase } from '@/lib/supabase';

interface GatedProject {
    id: string;
    title: string;
    slug: string;
    short_description: string;
    full_description: string;
    problem_statement: string;
    approach: string;
    results: string;
    limitations: string;
    category: string[];
    tags: string[];
    github_link: string;
    visibility: 'gated';
    images: { url: string; caption: string }[];
    metrics: { label: string; value: string }[];
    // Gated-specific fields
    dataset_description: string;
    reproducibility: string;
    download_links: { label: string; url: string; size: string }[];
}

// Sample gated project data (fallback)
const sampleGatedProject: GatedProject = {
    id: '1',
    title: 'Brain Tumor Segmentation Dataset & Model',
    slug: 'brain-tumor-segmentation',
    short_description: 'A comprehensive dataset and trained model for automated brain tumor segmentation using MRI scans.',
    full_description: 'This project includes a curated dataset of 500+ MRI scans with expert annotations...',
    problem_statement: 'Brain tumor segmentation is a critical step in treatment planning...',
    approach: 'We developed a modified U-Net architecture with attention mechanisms...',
    results: 'Achieved 0.92 Dice score on the validation set, outperforming baseline models...',
    limitations: 'The dataset is limited to specific tumor types and imaging protocols...',
    category: ['Healthcare AI', 'Computer Vision'],
    tags: ['Deep Learning', 'Medical Imaging', 'Segmentation', 'PyTorch'],
    github_link: 'https://github.com/emalkamawal/brain-tumor-seg',
    visibility: 'gated',
    images: [{ url: '/projects/brain-tumor.png', caption: 'Model architecture overview' }],
    metrics: [
        { label: 'Dice Score', value: '0.92' },
        { label: 'MRI Scans', value: '500+' },
        { label: 'Expert Annotations', value: '100%' },
        { label: 'Training Time', value: '48h' }
    ],
    dataset_description: 'The dataset includes T1, T2, and FLAIR MRI sequences with corresponding tumor masks annotated by certified radiologists.',
    reproducibility: `## Environment Setup
\`\`\`bash
pip install -r requirements.txt
python train.py --config configs/base.yaml
\`\`\`

## Pre-trained Weights
Download from the links below and place in \`checkpoints/\` folder.`,
    download_links: [
        { label: 'Dataset (Train)', url: '/gated-assets/dataset-train.zip', size: '2.5GB' },
        { label: 'Dataset (Val)', url: '/gated-assets/dataset-val.zip', size: '500MB' },
        { label: 'Pre-trained Model', url: '/gated-assets/model-weights.pt', size: '150MB' }
    ]
};

export default function GatedProjectPage() {
    const params = useParams();
    const slug = params?.slug as string;

    const [project, setProject] = useState<GatedProject | null>(null);
    const [loading, setLoading] = useState(true);
    const [email, setEmail] = useState('');
    const [hasAccess, setHasAccess] = useState(false);
    const [checkingAccess, setCheckingAccess] = useState(false);
    const [showRequestForm, setShowRequestForm] = useState(false);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    useEffect(() => {
        // Check if user has access from localStorage
        const storedAccess = localStorage.getItem(`gated_access_${slug}`);
        if (storedAccess) {
            const { email, token } = JSON.parse(storedAccess);
            setEmail(email);
            setAccessToken(token);
            verifyAccess(email, slug, token);
        }

        // Load project data
        fetchProject();
    }, [slug]);

    const fetchProject = async () => {
        // Try to fetch from Supabase first
        try {
            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .eq('slug', slug)
                .eq('visibility', 'gated')
                .single();

            if (data && !error) {
                setProject({
                    ...data,
                    dataset_description: data.dataset_description || 'Dataset includes curated training data with expert annotations.',
                    reproducibility: data.reproducibility || '## Environment Setup\n```bash\npip install -r requirements.txt\n```',
                    download_links: data.download_links || []
                });
                setLoading(false);
                return;
            }
        } catch (e) {
            console.log('Could not fetch from Supabase, using fallback');
        }

        // Use sample data with dynamic slug
        setProject({
            ...sampleGatedProject,
            slug: slug,
            title: slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        });
        setLoading(false);
    };

    const verifyAccess = async (userEmail: string, projectId: string, token?: string) => {
        setCheckingAccess(true);
        try {
            const res = await fetch(`/api/access-request?email=${encodeURIComponent(userEmail)}&project_id=${projectId}`);
            const data = await res.json();

            if (data.hasAccess) {
                setHasAccess(true);
                setAccessToken(data.access_token || token);
                // Store access in localStorage
                localStorage.setItem(`gated_access_${slug}`, JSON.stringify({
                    email: userEmail,
                    token: data.access_token || token
                }));
            } else {
                setHasAccess(false);
                localStorage.removeItem(`gated_access_${slug}`);
            }
        } catch (error) {
            console.error('Error verifying access:', error);
        } finally {
            setCheckingAccess(false);
        }
    };

    const handleCheckAccess = (e: React.FormEvent) => {
        e.preventDefault();
        if (email && project) {
            verifyAccess(email, project.id);
        }
    };

    const copyToClipboard = (text: string, index: number) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedIndex(index);
            setTimeout(() => setCopiedIndex(null), 2000);
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--brand-primary)]" />
            </div>
        );
    }

    if (!project) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <h1 className="text-2xl font-bold mb-4">Project Not Found</h1>
                <Link href="/projects" className="text-[var(--brand-primary)] hover:underline">
                    ← Back to Projects
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--background)]">
            {/* Header */}
            <div className="bg-gradient-to-b from-amber-500/10 to-transparent py-6">
                <div className="container mx-auto px-4">
                    <Link href="/projects" className="inline-flex items-center text-[var(--text-secondary)] hover:text-[var(--brand-primary)] mb-6 transition">
                        <FiArrowLeft className="mr-2" /> Back to Projects
                    </Link>

                    <div className="flex flex-wrap items-center gap-3 mb-4">
                        <span className="px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full text-sm font-bold flex items-center gap-1">
                            <FiLock size={14} /> Gated Content
                        </span>
                        {project.tags?.map(tag => (
                            <span key={tag} className="px-3 py-1 bg-[var(--surface)] text-[var(--text-secondary)] rounded-full text-sm">
                                {tag}
                            </span>
                        ))}
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-4">{project.title}</h1>
                    <p className="text-xl text-[var(--text-secondary)] max-w-3xl">{project.short_description}</p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Access Check / Request Section */}
                {!hasAccess && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-2xl mx-auto mb-12"
                    >
                        <Card className="p-8 border-2 border-amber-500/20">
                            <AnimatePresence mode="wait">
                                {showRequestForm ? (
                                    <motion.div
                                        key="form"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        <RequestAccessForm
                                            projectId={project.id}
                                            projectTitle={project.title}
                                            onClose={() => setShowRequestForm(false)}
                                        />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="check"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        <div className="text-center mb-6">
                                            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-4">
                                                <FiLock size={32} />
                                            </div>
                                            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                                                Access Required
                                            </h2>
                                            <p className="text-[var(--text-secondary)]">
                                                This content requires approved access. Enter your email to check or request access.
                                            </p>
                                        </div>

                                        <form onSubmit={handleCheckAccess} className="space-y-4">
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="Enter your email to check access"
                                                className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
                                                required
                                            />
                                            <div className="flex gap-3">
                                                <button
                                                    type="submit"
                                                    className="btn btn-primary flex-1"
                                                    disabled={checkingAccess}
                                                >
                                                    {checkingAccess ? 'Checking...' : 'Check Access'}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowRequestForm(true)}
                                                    className="btn btn-secondary flex-1"
                                                >
                                                    Request Access
                                                </button>
                                            </div>
                                        </form>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </Card>
                    </motion.div>
                )}

                {/* Access Granted Content */}
                {hasAccess && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        {/* Access Banner */}
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 mb-8 flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                                    <FiUnlock size={20} />
                                </div>
                                <div>
                                    <p className="font-semibold text-emerald-600 dark:text-emerald-400">Access Granted</p>
                                    <p className="text-sm text-[var(--text-secondary)]">Logged in as {email}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setHasAccess(false);
                                    setEmail('');
                                    localStorage.removeItem(`gated_access_${slug}`);
                                }}
                                className="text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                            >
                                Sign out
                            </button>
                        </div>

                        {/* Metrics */}
                        {project.metrics && project.metrics.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                                {project.metrics.map((metric, idx) => (
                                    <Card key={idx} className="p-4 text-center">
                                        <p className="text-3xl font-bold text-[var(--brand-primary)]">{metric.value}</p>
                                        <p className="text-sm text-[var(--text-secondary)]">{metric.label}</p>
                                    </Card>
                                ))}
                            </div>
                        )}

                        <div className="grid lg:grid-cols-[1fr_400px] gap-12">
                            {/* Main Content */}
                            <div className="space-y-8">
                                {/* Dataset Description */}
                                {project.dataset_description && (
                                    <section>
                                        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">Dataset Description</h2>
                                        <Card className="p-6">
                                            <p className="text-[var(--text-secondary)] leading-relaxed">{project.dataset_description}</p>
                                        </Card>
                                    </section>
                                )}

                                {/* Problem Statement */}
                                {project.problem_statement && (
                                    <section>
                                        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">Problem Statement</h2>
                                        <p className="text-[var(--text-secondary)] leading-relaxed">{project.problem_statement}</p>
                                    </section>
                                )}

                                {/* Approach */}
                                {project.approach && (
                                    <section>
                                        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">Approach</h2>
                                        <p className="text-[var(--text-secondary)] leading-relaxed">{project.approach}</p>
                                    </section>
                                )}

                                {/* Reproducibility */}
                                {project.reproducibility && (
                                    <section>
                                        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">Reproducibility Guide</h2>
                                        <Card className="p-6 bg-gray-900 text-gray-100 font-mono text-sm overflow-x-auto">
                                            <pre className="whitespace-pre-wrap">{project.reproducibility}</pre>
                                        </Card>
                                    </section>
                                )}
                            </div>

                            {/* Sidebar - Downloads */}
                            <div className="space-y-6">
                                {/* Download Links */}
                                <Card className="p-6">
                                    <h3 className="font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                                        <FiDownload /> Downloads
                                    </h3>
                                    <div className="space-y-3">
                                        {project.download_links?.map((link, idx) => (
                                            <a
                                                key={idx}
                                                href={`${link.url}?token=${accessToken}`}
                                                className="block p-4 bg-[var(--surface-hover)] rounded-xl hover:bg-[var(--border)] transition group"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-medium text-[var(--text-primary)] group-hover:text-[var(--brand-primary)] transition">{link.label}</p>
                                                        <p className="text-sm text-[var(--text-muted)]">{link.size}</p>
                                                    </div>
                                                    <FiDownload className="text-[var(--text-muted)] group-hover:text-[var(--brand-primary)] transition" />
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                </Card>

                                {/* Links */}
                                {project.github_link && (
                                    <Card className="p-6">
                                        <h3 className="font-bold text-[var(--text-primary)] mb-4">Project Links</h3>
                                        <a
                                            href={project.github_link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-[var(--brand-primary)] hover:underline"
                                        >
                                            <FiGithub /> View on GitHub <FiExternalLink size={14} />
                                        </a>
                                    </Card>
                                )}

                                {/* Access Token Info */}
                                {accessToken && (
                                    <Card className="p-6 border border-[var(--border)]">
                                        <h3 className="font-bold text-[var(--text-primary)] mb-4">Your Access Token</h3>
                                        <div className="flex items-center gap-2">
                                            <code className="flex-1 p-2 bg-[var(--surface)] rounded text-xs truncate">
                                                {accessToken.substring(0, 20)}...
                                            </code>
                                            <button
                                                onClick={() => copyToClipboard(accessToken, -1)}
                                                className="p-2 hover:bg-[var(--surface-hover)] rounded transition"
                                            >
                                                {copiedIndex === -1 ? <FiCheck className="text-emerald-500" /> : <FiCopy />}
                                            </button>
                                        </div>
                                        <p className="text-xs text-[var(--text-muted)] mt-2">
                                            Use this for API access to gated assets.
                                        </p>
                                    </Card>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Preview Content (shown to everyone) */}
                {!hasAccess && (
                    <div className="max-w-4xl mx-auto opacity-75">
                        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Preview</h2>

                        {/* Metrics Preview */}
                        {project.metrics && project.metrics.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                {project.metrics.map((metric, idx) => (
                                    <Card key={idx} className="p-4 text-center">
                                        <p className="text-2xl font-bold text-[var(--brand-primary)]">{metric.value}</p>
                                        <p className="text-sm text-[var(--text-secondary)]">{metric.label}</p>
                                    </Card>
                                ))}
                            </div>
                        )}

                        <Card className="p-6 mb-8">
                            <h3 className="font-bold text-[var(--text-primary)] mb-2">What's Included</h3>
                            <ul className="space-y-2 text-[var(--text-secondary)]">
                                <li className="flex items-center gap-2"><FiCheck className="text-emerald-500" /> Full dataset with annotations</li>
                                <li className="flex items-center gap-2"><FiCheck className="text-emerald-500" /> Pre-trained model weights</li>
                                <li className="flex items-center gap-2"><FiCheck className="text-emerald-500" /> Reproducibility guide</li>
                                <li className="flex items-center gap-2"><FiCheck className="text-emerald-500" /> GitHub repository access</li>
                            </ul>
                        </Card>

                        <div className="text-center">
                            <p className="text-[var(--text-muted)] mb-4">
                                Request access to view the full content, download datasets, and get model weights.
                            </p>
                            <button
                                onClick={() => setShowRequestForm(true)}
                                className="btn btn-primary"
                            >
                                <FiLock className="mr-2" /> Request Access
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
