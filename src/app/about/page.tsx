'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    FiDownload,
    FiArrowRight,
    FiBookOpen,
    FiCpu,
    FiEye,
    FiShield,
    FiActivity,
    FiTarget
} from 'react-icons/fi';
import Card from '@/components/ui/Card';

export default function AboutPage() {
    // Certifications state
    interface Certification {
        id: string;
        title: string;
        issuer: string;
        date_issued: string;
        credential_url?: string;
        image_url?: string;
    }

    const [certifications, setCertifications] = useState<Certification[]>([
        { id: '1', title: 'TensorFlow Developer Certificate', issuer: 'Google', date_issued: '2024', credential_url: 'https://www.credential.net/example' },
        { id: '2', title: 'Deep Learning Specialization', issuer: 'Coursera / DeepLearning.AI', date_issued: '2023', credential_url: 'https://coursera.org/verify/example' },
        { id: '3', title: 'AWS Machine Learning Specialty', issuer: 'Amazon Web Services', date_issued: '2024', credential_url: 'https://aws.amazon.com/verification/example' },
    ]);

    // Profile data from admin settings
    const [profile, setProfile] = useState({
        name: 'Emal Kamawal',
        title: 'AI Researcher & Developer',
        bio: '',
        profile_photo: '/profile.png',
        cv_url: '/cv.pdf',
    });

    // About content from admin settings
    const [aboutContent, setAboutContent] = useState({
        headline: 'AI Researcher & Developer',
        introduction: 'I am a passionate computer scientist focused on AI for healthcare and social impact. My research focuses on building explainable and privacy-preserving AI systems that can be safely deployed in clinical settings.',
        education: [
            { degree: 'Bachelor of Science in Computer Science', institution: 'Pak-Austria Fachhochschule (PAF-IAST)', year: '2022 - 2026' }
        ] as { degree: string; institution: string; year: string }[],
        skills: [] as string[],
        interests: '',
    });

    useEffect(() => {
        const fetchPortfolioData = async () => {
            try {
                const res = await fetch('/api/portfolio');
                if (!res.ok) return;
                const data = await res.json();

                // Update certifications
                if (data.certifications && data.certifications.length > 0) {
                    setCertifications(data.certifications.map((c: any) => ({
                        id: c.id,
                        title: c.title,
                        issuer: c.issuer,
                        date_issued: c.date_issued || '',
                        credential_url: c.credential_url || '',
                        image_url: c.image_url || '',
                    })));
                }

                // Update profile data
                if (data.profile) {
                    setProfile(prev => ({
                        name: data.profile.name || prev.name,
                        title: data.profile.title || prev.title,
                        bio: data.profile.bio || prev.bio,
                        profile_photo: data.profile.profile_photo || prev.profile_photo,
                        cv_url: data.profile.cv_url || prev.cv_url,
                    }));
                }

                // Update about content
                if (data.about) {
                    setAboutContent(prev => ({
                        headline: data.about.headline || prev.headline,
                        introduction: data.about.introduction || prev.introduction,
                        education: (data.about.education && data.about.education.length > 0) ? data.about.education : prev.education,
                        skills: data.about.skills || prev.skills,
                        interests: data.about.interests || prev.interests,
                    }));
                }
            } catch (e) {
                console.log('Using default about data');
            }
        };
        fetchPortfolioData();
    }, []);

    const fadeInUp = {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.5 }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const staggerItem = {
        hidden: { opacity: 0, y: 15 },
        show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
    };

    const researchInterests = [
        { icon: <FiActivity />, label: 'Medical Imaging AI', color: 'blue' },
        { icon: <FiCpu />, label: 'Brain-Computer Interfaces (EEG)', color: 'purple' },
        { icon: <FiEye />, label: 'Computer Vision', color: 'cyan' },
        { icon: <FiShield />, label: 'Federated Learning', color: 'emerald' },
        { icon: <FiBookOpen />, label: 'Explainable AI', color: 'amber' },
        { icon: <FiTarget />, label: 'Deep Learning', color: 'rose' },
    ];

    const futureDirections = [
        {
            title: 'Clinical AI Deployment',
            description: 'Working towards building AI systems that can be safely and ethically deployed in clinical settings for real-world patient impact.',
        },
        {
            title: 'Neural Signal Decoding',
            description: 'Advancing brain-computer interface research to help patients with motor disabilities communicate and control devices.',
        },
        {
            title: 'Privacy-First Healthcare AI',
            description: 'Developing federated learning solutions that enable multi-institutional collaboration without compromising patient privacy.',
        },
    ];

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative py-24 overflow-hidden">
                {/* Background */}
                <div className="absolute inset-0 bg-grid-fade opacity-40" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px]" />

                <div className="container mx-auto px-6 relative z-10">
                    <div className="grid lg:grid-cols-[400px_1fr] gap-12 lg:gap-16 items-start">
                        {/* Profile Image */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6 }}
                            className="relative mx-auto lg:mx-0"
                        >
                            <div className="relative w-80 lg:w-full aspect-[3/4] rounded-2xl overflow-hidden">
                                {/* Gradient Border */}
                                <div className="absolute inset-0 bg-gradient-to-br from-[var(--brand-primary)] via-purple-500 to-cyan-500 rounded-2xl" />
                                <div className="absolute inset-[3px] rounded-2xl overflow-hidden bg-[var(--background)]">
                                    <img
                                        src={profile.profile_photo}
                                        alt={profile.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>

                            {/* Floating Card */}
                            <motion.div
                                className="absolute -bottom-6 -right-6 p-4 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] shadow-xl"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                        🎓
                                    </div>
                                    <div>
                                        <p className="font-semibold text-[var(--text-primary)]">HEC Scholar</p>
                                        <p className="text-xs text-[var(--text-muted)]">Allama Iqbal Scholarship</p>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>

                        {/* Content */}
                        <motion.div
                            className="space-y-8"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <div>
                                <h1 className="text-4xl md:text-5xl font-bold font-display mb-4">
                                    About Me
                                </h1>
                                <h2 className="text-xl md:text-2xl text-[var(--brand-primary)] font-semibold mb-6">
                                    {aboutContent.headline || profile.title}
                                </h2>
                            </div>

                            <div className="space-y-4 text-[var(--text-secondary)] leading-relaxed">
                                <p className="text-lg">
                                    {aboutContent.introduction}
                                </p>
                                {profile.bio && aboutContent.introduction !== profile.bio && (
                                    <p>{profile.bio}</p>
                                )}
                            </div>

                            {/* Education Badge */}
                            {aboutContent.education.length > 0 && (
                                <div className="space-y-3">
                                    {aboutContent.education.map((edu, index) => (
                                        <div key={index} className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
                                            <div className="flex items-start gap-4">
                                                <div className="w-12 h-12 rounded-lg bg-[var(--brand-primary)]/10 flex items-center justify-center text-[var(--brand-primary)] flex-shrink-0">
                                                    🎓
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-[var(--text-primary)]">{edu.degree}</p>
                                                    <p className="text-sm text-[var(--text-secondary)]">{edu.institution} • {edu.year}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* CTA Buttons */}
                            <div className="flex flex-wrap gap-4 pt-4">
                                <a
                                    href={profile.cv_url}
                                    download
                                    className="btn btn-primary"
                                >
                                    <FiDownload />
                                    Download CV
                                </a>
                                <Link href="/contact" className="btn btn-secondary">
                                    Get in Touch
                                    <FiArrowRight />
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Research Interests */}
            <motion.section
                className="py-20 bg-[var(--surface)]"
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={staggerContainer}
            >
                <div className="container mx-auto px-6">
                    <motion.div variants={staggerItem} className="text-center mb-12">
                        <h2 className="text-3xl font-bold font-display mb-4">Research Interests</h2>
                        <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
                            Areas where I focus my research and development efforts
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                        {researchInterests.map((interest, index) => (
                            <motion.div key={index} variants={staggerItem}>
                                <div className="p-4 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] hover:border-[var(--brand-primary)] transition-all flex items-center gap-3">
                                    <span className={`text-${interest.color}-500 text-xl`}>{interest.icon}</span>
                                    <span className="font-medium text-[var(--text-primary)] text-sm">{interest.label}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.section>

            {/* Certifications */}
            <motion.section
                className="py-20 bg-gradient-to-b from-[var(--surface)] to-[var(--background)]"
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={staggerContainer}
            >
                <div className="container mx-auto px-6">
                    <motion.div variants={staggerItem} className="text-center mb-12">
                        <h2 className="text-3xl font-bold font-display mb-4">Certifications</h2>
                        <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
                            Professional certifications and credentials validating my expertise
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                        {certifications.map((cert, index) => {
                            const colors = [
                                'from-orange-500/20 to-yellow-500/20 border-orange-200 dark:border-orange-800',
                                'from-blue-500/20 to-purple-500/20 border-blue-200 dark:border-purple-800',
                                'from-emerald-500/20 to-cyan-500/20 border-emerald-200 dark:border-cyan-800',
                            ];
                            const colorClass = colors[index % colors.length];

                            return (
                                <motion.div key={cert.id} variants={staggerItem}>
                                    <div className={`p-6 rounded-2xl border bg-gradient-to-br ${colorClass} hover:shadow-lg transition-all group h-full flex flex-col`}>
                                        <div className="w-14 h-14 rounded-xl bg-[var(--surface-elevated)] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform shadow-sm">
                                            {cert.image_url ? (
                                                <img src={cert.image_url} alt={cert.title} className="w-10 h-10 object-contain" />
                                            ) : (
                                                <span className="text-2xl">🏆</span>
                                            )}
                                        </div>
                                        <h3 className="font-bold text-[var(--text-primary)] mb-1 text-lg">{cert.title}</h3>
                                        <p className="text-sm text-[var(--text-secondary)] mb-2">{cert.issuer}</p>
                                        <p className="text-xs text-[var(--text-muted)] mb-4">{cert.date_issued}</p>
                                        {cert.credential_url && (
                                            <a
                                                href={cert.credential_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-[var(--brand-primary)] hover:underline"
                                            >
                                                View Credential <FiArrowRight className="text-xs" />
                                            </a>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </motion.section>

            {/* Future Directions */}
            <motion.section
                className="py-20 bg-[var(--background)]"
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={staggerContainer}
            >
                <div className="container mx-auto px-6">
                    <motion.div variants={staggerItem} className="text-center mb-12">
                        <h2 className="text-3xl font-bold font-display mb-4">Future Directions</h2>
                        <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
                            Where I'm heading with my research and career
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {futureDirections.map((direction, index) => (
                            <motion.div key={index} variants={staggerItem}>
                                <Card className="h-full">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--brand-primary)]/20 to-purple-500/20 flex items-center justify-center text-2xl mb-4">
                                        {index === 0 ? '🏥' : index === 1 ? '🧠' : '🔐'}
                                    </div>
                                    <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">
                                        {direction.title}
                                    </h3>
                                    <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                                        {direction.description}
                                    </p>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.section>

            {/* CTA Section */}
            <section className="py-20 bg-[var(--surface)] border-t border-[var(--border)]">
                <div className="container mx-auto px-6">
                    <div className="max-w-3xl mx-auto text-center">
                        <h2 className="text-2xl md:text-3xl font-bold font-display mb-4">
                            Want to know more about my work?
                        </h2>
                        <p className="text-[var(--text-secondary)] mb-8">
                            Check out my projects to see my research in action, or explore my publications for academic work.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Link href="/projects" className="btn btn-primary">
                                View Projects <FiArrowRight />
                            </Link>
                            <Link href="/publications" className="btn btn-secondary">
                                Publications
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
