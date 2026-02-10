'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    FiActivity,
    FiMonitor,
    FiCpu,
    FiLock,
    FiArrowRight,
    FiCheck,
    FiZap,
    FiTarget,
    FiMessageCircle
} from 'react-icons/fi';
import Card from '@/components/ui/Card';

export default function ServicesPage() {
    const services = [
        {
            icon: <FiActivity />,
            title: 'Medical Imaging AI',
            description: 'Custom segmentation and detection models for X-ray, MRI, and CT scans. Production-ready solutions with clinical-grade accuracy.',
            features: [
                'Tumor/lesion detection & segmentation',
                'Automated radiology report assistance',
                'DICOM integration',
                'HIPAA-compliant deployment'
            ],
            color: 'blue',
            starting: '$5,000'
        },
        {
            icon: <FiMonitor />,
            title: 'Computer Vision Solutions',
            description: 'End-to-end object detection, tracking, and image analysis pipelines for industrial and research applications.',
            features: [
                'Real-time object detection (YOLO, SSD)',
                'Video analytics & tracking',
                'OCR & document processing',
                'Custom dataset annotation'
            ],
            color: 'emerald',
            starting: '$3,000'
        },
        {
            icon: <FiCpu />,
            title: 'Research Engineering',
            description: 'Implementation of state-of-the-art research papers, experimental design, and reproducible ML workflows.',
            features: [
                'Paper implementation & replication',
                'Experiment tracking (MLflow, W&B)',
                'Reproducibility audits',
                'Technical documentation'
            ],
            color: 'amber',
            starting: '$2,500'
        },
        {
            icon: <FiLock />,
            title: 'Privacy-Preserving ML',
            description: 'Federated learning setup and secure AI model deployment for organizations handling sensitive data.',
            features: [
                'Federated learning architecture',
                'Differential privacy implementation',
                'Secure model serving',
                'Compliance consulting'
            ],
            color: 'purple',
            starting: '$6,000'
        },
    ];

    const process = [
        { step: 1, title: 'Discovery Call', description: 'Understand your requirements and constraints' },
        { step: 2, title: 'Proposal', description: 'Detailed scope, timeline, and cost breakdown' },
        { step: 3, title: 'Development', description: 'Iterative development with regular check-ins' },
        { step: 4, title: 'Delivery', description: 'Deployment, documentation, and handoff' },
    ];

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
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-4xl md:text-5xl font-bold font-display mb-4">Services</h1>
                    <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
                        Specialized AI consulting and development services for healthcare and tech applications.
                        From prototype to production.
                    </p>
                </motion.div>

                {/* Services Grid */}
                <motion.div
                    className="grid md:grid-cols-2 gap-8 mb-20"
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                >
                    {services.map((service, idx) => (
                        <motion.div key={idx} variants={itemVariants}>
                            <Card className="h-full">
                                {/* Icon & Title */}
                                <div className="flex items-start gap-4 mb-4">
                                    <div className={`w-12 h-12 rounded-xl bg-${service.color}-500/10 text-${service.color}-500 flex items-center justify-center text-xl flex-shrink-0`}>
                                        {service.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-[var(--text-primary)]">{service.title}</h3>
                                        <p className="text-sm text-[var(--text-muted)]">Starting from {service.starting}</p>
                                    </div>
                                </div>

                                {/* Description */}
                                <p className="text-[var(--text-secondary)] mb-6">{service.description}</p>

                                {/* Features */}
                                <ul className="space-y-2">
                                    {service.features.map((feature, i) => (
                                        <li key={i} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                                            <FiCheck className="text-emerald-500 flex-shrink-0" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Process Section */}
                <motion.section
                    className="mb-20"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-2xl font-bold font-display text-center mb-8">How I Work</h2>
                    <div className="grid md:grid-cols-4 gap-6">
                        {process.map((item, idx) => (
                            <div key={idx} className="relative">
                                <div className="text-center">
                                    <div className="w-12 h-12 rounded-full bg-[var(--brand-primary)] text-white font-bold flex items-center justify-center mx-auto mb-4 text-lg">
                                        {item.step}
                                    </div>
                                    <h3 className="font-bold text-[var(--text-primary)] mb-2">{item.title}</h3>
                                    <p className="text-sm text-[var(--text-secondary)]">{item.description}</p>
                                </div>
                                {idx < process.length - 1 && (
                                    <div className="hidden md:block absolute top-6 left-[calc(50%+2rem)] w-[calc(100%-4rem)]">
                                        <div className="w-full h-0.5 bg-[var(--border)]" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </motion.section>

                {/* Why Work With Me */}
                <motion.section
                    className="mb-20"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-2xl font-bold font-display text-center mb-8">Why Work With Me</h2>
                    <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                        <Card>
                            <div className="text-center">
                                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-4 text-xl">
                                    <FiZap />
                                </div>
                                <h3 className="font-bold text-[var(--text-primary)] mb-2">Research-Backed</h3>
                                <p className="text-sm text-[var(--text-secondary)]">
                                    Solutions grounded in latest research with peer-reviewed publications
                                </p>
                            </div>
                        </Card>
                        <Card>
                            <div className="text-center">
                                <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mx-auto mb-4 text-xl">
                                    <FiTarget />
                                </div>
                                <h3 className="font-bold text-[var(--text-primary)] mb-2">Production-Ready</h3>
                                <p className="text-sm text-[var(--text-secondary)]">
                                    Focus on deployable, scalable solutions not just proof-of-concepts
                                </p>
                            </div>
                        </Card>
                        <Card>
                            <div className="text-center">
                                <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center mx-auto mb-4 text-xl">
                                    <FiMessageCircle />
                                </div>
                                <h3 className="font-bold text-[var(--text-primary)] mb-2">Clear Communication</h3>
                                <p className="text-sm text-[var(--text-secondary)]">
                                    Regular updates, transparent timelines, and accessible explanations
                                </p>
                            </div>
                        </Card>
                    </div>
                </motion.section>

                {/* CTA */}
                <motion.div
                    className="rounded-2xl p-8 md:p-12 text-center bg-gradient-to-br from-[var(--brand-primary)] to-purple-600"
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-3xl font-bold text-white mb-4">Ready to Collaborate?</h2>
                    <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
                        Whether you need a custom AI solution or research support, I'm here to help bring your ideas to life.
                    </p>
                    <Link href="/contact" className="btn bg-white text-[var(--brand-primary)] hover:bg-white/90 inline-flex">
                        Start a Project <FiArrowRight />
                    </Link>
                </motion.div>
            </div>
        </div>
    );
}
