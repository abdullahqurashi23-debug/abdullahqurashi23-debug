'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiExternalLink, FiFileText, FiCode, FiCopy, FiCheck, FiBookOpen } from 'react-icons/fi';
import Card from '@/components/ui/Card';
import { supabase } from '@/lib/supabase';

interface Publication {
    id: string;
    title: string;
    authors: string[];
    journal: string;
    status: 'under-review' | 'published' | 'preprint';
    year: number;
    abstract: string;
    contributions: string[];
    pdf_url: string;
    doi_link: string;
    code_repo: string;
    created_at: string;
}

export default function PublicationsPage() {
    const [publications, setPublications] = useState<Publication[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [activeFilter, setActiveFilter] = useState('All');

    const filters = ['All', 'Published', 'Under Review', 'Preprint'];

    // Emal Kamawal's actual publications
    const staticPublications: Publication[] = [
        {
            id: '1',
            title: 'Expert Fusion Network for Automated Blastocyst Morphology and IVF Decision Support',
            authors: ['Ali Zia', 'Shahnawaz Qureshi', 'Fatima Ansarizadeh', 'Muhammad Fouzan', 'Emal Kamawal', 'Sajid Anwer', 'Chandan Karmakar'],
            journal: 'IEEE Transactions on Biomedical Engineering',
            status: 'under-review',
            year: 2025,
            abstract: 'This paper presents a novel multi-architecture deep learning framework combining U-Net, attention mechanisms, and mixture-of-experts for automated embryo morphology grading in IVF procedures.',
            contributions: [
                'Co-developed novel multi-architecture deep learning framework',
                'Achieved 98% accuracy in embryo morphology grading',
                'Implemented data preprocessing pipeline and conducted extensive validation studies'
            ],
            pdf_url: '',
            doi_link: '',
            code_repo: '',
            created_at: '2025-01-15',
        },
        {
            id: '2',
            title: 'UAV-Based Early Weed Detection in Wheat Fields: A Comparative Study of Deep Learning Approaches',
            authors: ['Shahnawaz Qureshi', 'Ali Zia', 'Emal Kamawal', 'Asif Ameer', 'Ahsan Latif'],
            journal: 'Precision Agriculture Journal',
            status: 'under-review',
            year: 2025,
            abstract: 'A comprehensive comparative analysis of CNN, SAM, ViT, and Mask R-CNN architectures for precision agriculture applications in weed detection from UAV imagery.',
            contributions: [
                'Led dataset curation and model optimization',
                'Achieved 15% improvement over baseline methods',
                'Conducted comparative analysis of multiple architectures'
            ],
            pdf_url: '',
            doi_link: '',
            code_repo: '',
            created_at: '2025-02-01',
        },
        {
            id: '3',
            title: 'Integrating Artificial Intelligence and Machine Learning in 3D Cell Culture Analysis and Prediction',
            authors: ['Muhammad Fozan', 'Muhammad Rizwan', 'Emal Kamawal', 'Muhammad Ahmad Khan', 'Dr. Shahnawaz Qureshi', 'Dr. Fazal Wahab'],
            journal: 'Book Chapter',
            status: 'published',
            year: 2026,
            abstract: 'A comprehensive chapter on applying AI/ML to 3D cell culture workflows, covering imaging-based segmentation, predictive modeling, biomarker discovery, and drug screening.',
            contributions: [
                'Co-authored chapter on AI/ML for 3D cell culture workflows',
                'Synthesized case studies in oncology and stem cell research',
                'Reviewed challenges including data quality, reproducibility, and model interpretability'
            ],
            pdf_url: '',
            doi_link: '',
            code_repo: '',
            created_at: '2026-01-01',
        },
        {
            id: '4',
            title: 'Advanced Imaging and Analysis Techniques for 3D Cell Cultures and Organoids',
            authors: ['Emal Kamawal', 'Hazrat Nabi', 'Muhammad Fozan', 'Arbab Waheed Ahmad', 'Habab Ali Ahmad'],
            journal: 'Advances in Drug Development: From Biosignaling to Precision Medicine, CRC Press',
            status: 'published',
            year: 2026,
            abstract: 'Chapter 4 focusing on advanced imaging and computational analysis for 3D cell cultures and organoids, covering end-to-end workflows including microscopy data preparation, segmentation and quantification techniques.',
            contributions: [
                'Co-authored Chapter 4 on advanced imaging techniques',
                'Covered end-to-end workflows for 3D cell culture analysis',
                'Discussed AI/ML-driven analysis for phenotyping and drug-response prediction'
            ],
            pdf_url: '',
            doi_link: '',
            code_repo: '',
            created_at: '2026-01-10',
        },
    ];

    useEffect(() => {
        fetchPublications();
    }, []);

    const fetchPublications = async () => {
        try {
            const { data, error } = await supabase
                .from('publications')
                .select('*')
                .order('year', { ascending: false });

            if (data && data.length > 0) {
                setPublications(data);
            } else {
                setPublications(staticPublications);
            }
        } catch (error) {
            console.error('Error fetching publications:', error);
            setPublications(staticPublications);
        }
        setLoading(false);
    };

    const filteredPublications = publications.filter(pub => {
        if (activeFilter === 'All') return true;
        if (activeFilter === 'Published') return pub.status === 'published';
        if (activeFilter === 'Under Review') return pub.status === 'under-review';
        if (activeFilter === 'Preprint') return pub.status === 'preprint';
        return true;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'under-review':
                return <span className="badge badge-warning">Under Review</span>;
            case 'published':
                return <span className="badge badge-success">Published</span>;
            case 'preprint':
                return <span className="badge badge-primary">Preprint</span>;
            default:
                return <span className="badge">Book Chapter</span>;
        }
    };

    const highlightAuthor = (authors: string[]) => {
        return authors?.map((author, idx) => {
            const isEmal = author.toLowerCase().includes('emal');
            return (
                <span key={idx}>
                    {isEmal ? (
                        <span className="font-semibold text-[var(--text-primary)]">{author}</span>
                    ) : (
                        author
                    )}
                    {idx < authors.length - 1 ? ', ' : ''}
                </span>
            );
        });
    };

    const handleCopyCitation = (pub: Publication) => {
        const citation = `${pub.authors?.join(', ')} (${pub.year}). ${pub.title}. ${pub.journal || 'Manuscript in preparation'}.`;
        navigator.clipboard.writeText(citation);
        setCopiedId(pub.id);
        setTimeout(() => setCopiedId(null), 2000);
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
                    <h1 className="text-4xl md:text-5xl font-bold font-display mb-4">Publications</h1>
                    <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
                        Peer-reviewed papers, book chapters, and research contributions in AI and healthcare.
                    </p>
                </motion.div>

                {/* Filters */}
                <motion.div
                    className="flex flex-wrap justify-center gap-2 mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    {filters.map(filter => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeFilter === filter
                                ? 'bg-[var(--brand-primary)] text-white'
                                : 'bg-[var(--surface)] text-[var(--text-secondary)] border border-[var(--border)] hover:border-[var(--brand-primary)]'
                                }`}
                        >
                            {filter}
                        </button>
                    ))}
                </motion.div>

                {/* Loading */}
                {loading && (
                    <div className="space-y-6 max-w-4xl mx-auto">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-[var(--surface)] rounded-xl p-6 animate-pulse">
                                <div className="h-6 bg-[var(--border)] rounded mb-4 w-3/4" />
                                <div className="h-4 bg-[var(--border)] rounded w-1/2" />
                            </div>
                        ))}
                    </div>
                )}

                {/* Publications List */}
                {!loading && filteredPublications.length === 0 ? (
                    <div className="text-center py-16">
                        <FiBookOpen className="mx-auto text-4xl text-[var(--text-muted)] mb-4" />
                        <p className="text-[var(--text-secondary)]">No publications found.</p>
                    </div>
                ) : (
                    <motion.div
                        className="space-y-6 max-w-4xl mx-auto"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        {filteredPublications.map((pub, index) => (
                            <motion.div
                                key={pub.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: index * 0.1 }}
                            >
                                <Card hover className="relative">
                                    {/* Status & Year */}
                                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                                        {getStatusBadge(pub.status)}
                                        <span className="text-sm text-[var(--text-muted)]">{pub.year}</span>
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                                        {pub.title}
                                    </h3>

                                    {/* Authors */}
                                    <p className="text-[var(--text-secondary)] text-sm mb-2">
                                        {pub.authors && highlightAuthor(pub.authors)}
                                    </p>

                                    {/* Journal */}
                                    {pub.journal && (
                                        <p className="text-[var(--text-muted)] text-sm italic mb-4">
                                            {pub.journal}
                                        </p>
                                    )}

                                    {/* Contributions */}
                                    {pub.contributions && pub.contributions.length > 0 && (
                                        <div className="mb-4 p-4 rounded-lg bg-[var(--surface)]">
                                            <p className="text-sm font-semibold text-[var(--text-primary)] mb-2">
                                                Key Contributions:
                                            </p>
                                            <ul className="space-y-1">
                                                {pub.contributions.map((c, idx) => (
                                                    <li key={idx} className="text-sm text-[var(--text-secondary)] flex items-start gap-2">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-primary)] mt-2 flex-shrink-0" />
                                                        {c}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Abstract Toggle */}
                                    {pub.abstract && (
                                        <div className="mb-4">
                                            <button
                                                onClick={() => setExpandedId(expandedId === pub.id ? null : pub.id)}
                                                className="text-[var(--brand-primary)] text-sm hover:underline"
                                            >
                                                {expandedId === pub.id ? 'Hide Abstract ▲' : 'Show Abstract ▼'}
                                            </button>
                                            {expandedId === pub.id && (
                                                <motion.p
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    className="mt-3 text-sm text-[var(--text-secondary)] bg-[var(--surface)] p-4 rounded-lg"
                                                >
                                                    {pub.abstract}
                                                </motion.p>
                                            )}
                                        </div>
                                    )}

                                    {/* Links */}
                                    <div className="flex flex-wrap gap-4 pt-2 border-t border-[var(--border)]">
                                        {pub.pdf_url && (
                                            <a
                                                href={pub.pdf_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 text-sm text-[var(--brand-primary)] hover:underline"
                                            >
                                                <FiFileText size={14} /> PDF
                                            </a>
                                        )}
                                        {pub.doi_link && (
                                            <a
                                                href={pub.doi_link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 text-sm text-[var(--brand-primary)] hover:underline"
                                            >
                                                <FiExternalLink size={14} /> DOI
                                            </a>
                                        )}
                                        {pub.code_repo && (
                                            <a
                                                href={pub.code_repo}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 text-sm text-[var(--brand-primary)] hover:underline"
                                            >
                                                <FiCode size={14} /> Code
                                            </a>
                                        )}
                                        <button
                                            onClick={() => handleCopyCitation(pub)}
                                            className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                                        >
                                            {copiedId === pub.id ? (
                                                <><FiCheck className="text-emerald-500" /> Copied!</>
                                            ) : (
                                                <><FiCopy size={14} /> Cite</>
                                            )}
                                        </button>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
