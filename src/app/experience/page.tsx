'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    FiBriefcase,
    FiCalendar,
    FiMapPin,
    FiArrowRight,
    FiDownload,
    FiCode,
    FiDatabase,
    FiCloud,
    FiCpu,
    FiSettings
} from 'react-icons/fi';
import Card from '@/components/ui/Card';

export default function ExperiencePage() {
    const experiences = [
        {
            role: 'Junior AI Intern (Computer Vision / Healthcare AI)',
            company: 'Forth Labs',
            location: 'Islamabad, Pakistan',
            period: 'June 2025 - August 2025',
            type: 'Internship',
            description: 'Developed AI-driven dental X-ray image analysis system for automated missing-teeth detection, delivering consistent, data-driven clinical insights.',
            achievements: [
                'Implemented YOLO-based segmentation with high-resolution, multi-scale inference',
                'Designed intelligent post-processing to reduce false positives and enhance clinical reliability',
                'Annotated and managed dataset using Roboflow platform for high-quality labeling'
            ],
            tags: ['Python', 'YOLO', 'Computer Vision', 'Roboflow', 'Healthcare AI']
        },
        {
            role: 'AI Research Intern',
            company: 'The Insaafdaar Law',
            location: 'Remote',
            period: 'Jan 2023 - Apr 2023',
            type: 'Internship',
            description: 'Architected and deployed ML-powered document processing system on AWS, significantly improving legal document automation efficiency.',
            achievements: [
                'Reduced processing time by 40% for 500+ users with ML-powered document system',
                'Achieved 92% text extraction accuracy with Python-based OCR application',
                'Built conversational AI using Rasa NLP, automating 70% of client inquiries with 85% satisfaction'
            ],
            tags: ['Python', 'TensorFlow', 'AWS SageMaker', 'Rasa', 'NLP', 'OCR']
        },
        {
            role: 'IoT Engineering Intern',
            company: 'SPCAI PAF-IAST',
            location: 'Haripur, Pakistan',
            period: 'Jan 2022 - Aug 2022',
            type: 'Research',
            description: 'Engineered IoT-enabled smart systems for campus management including waste management and environmental monitoring solutions.',
            achievements: [
                'Reduced manual monitoring by 60% through predictive analytics in smart waste system',
                'Integrated sensor networks with AWS IoT Core for real-time monitoring',
                'Prototyped Raspberry Pi-based environmental monitoring with custom sensor fusion algorithms'
            ],
            tags: ['Raspberry Pi', 'AWS IoT Core', 'Python', 'Edge Computing', 'Sensor Integration']
        }
    ];

    const skills = [
        {
            category: 'Machine Learning & AI',
            icon: <FiCpu />,
            items: ['PyTorch', 'TensorFlow/Keras', 'Scikit-learn', 'Federated Learning', 'AutoML']
        },
        {
            category: 'Computer Vision',
            icon: <FiCode />,
            items: ['YOLO v5-v9', 'U-Net', 'SAM', 'DeepLabV3+', 'Vision Transformers']
        },
        {
            category: 'Cloud & MLOps',
            icon: <FiCloud />,
            items: ['AWS (EC2, SageMaker, Lambda)', 'Docker', 'Kubernetes', 'MLflow', 'CI/CD']
        },
        {
            category: 'Data Engineering',
            icon: <FiDatabase />,
            items: ['PostgreSQL', 'MongoDB', 'Pandas', 'NumPy', 'Data Visualization']
        },
        {
            category: 'NLP & Genertic AI',
            icon: <FiSettings />,
            items: ['BERT', 'GPT-3.5/4', 'LLaMA', 'T5', 'Sentence Transformers']
        }
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.15 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        show: { opacity: 1, x: 0 }
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
                    <h1 className="text-4xl md:text-5xl font-bold font-display mb-4">Experience</h1>
                    <p className="text-[var(--text-secondary)] max-w-2xl mx-auto mb-6">
                        Building production-ready AI systems with measurable impact across research and industry.
                    </p>
                    <a href="/cv.pdf" download className="btn btn-primary inline-flex">
                        <FiDownload /> Download CV
                    </a>
                </motion.div>

                {/* Timeline */}
                <motion.div
                    className="max-w-4xl mx-auto mb-20"
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                >
                    <div className="relative">
                        {/* Timeline Line */}
                        <div className="absolute left-6 md:left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[var(--brand-primary)] via-purple-500 to-cyan-500" />

                        {experiences.map((exp, index) => (
                            <motion.div
                                key={index}
                                className="relative pl-16 md:pl-20 pb-12 last:pb-0"
                                variants={itemVariants}
                            >
                                {/* Timeline Dot */}
                                <div className="absolute left-4 md:left-6 w-4 h-4 rounded-full bg-[var(--brand-primary)] border-4 border-[var(--background)] z-10" />

                                <Card hover>
                                    {/* Header */}
                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-2 mb-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-[var(--text-primary)]">{exp.role}</h3>
                                            <p className="text-[var(--brand-primary)] font-medium">{exp.company}</p>
                                        </div>
                                        <div className="flex flex-wrap gap-2 text-sm text-[var(--text-muted)]">
                                            <span className="flex items-center gap-1">
                                                <FiCalendar size={14} /> {exp.period}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <FiMapPin size={14} /> {exp.location}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Type Badge */}
                                    <span className="badge badge-primary mb-4 inline-block">{exp.type}</span>

                                    {/* Description */}
                                    <p className="text-[var(--text-secondary)] mb-4">{exp.description}</p>

                                    {/* Achievements */}
                                    <div className="mb-4 space-y-2">
                                        {exp.achievements.map((achievement, idx) => (
                                            <div key={idx} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                                                {achievement}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Tags */}
                                    <div className="flex flex-wrap gap-2">
                                        {exp.tags.map(tag => (
                                            <span key={tag} className="badge">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Skills Section */}
                <motion.section
                    className="max-w-5xl mx-auto"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-2xl font-bold font-display text-center mb-8">Technical Skills</h2>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {skills.map((skill, index) => (
                            <Card key={index} hover>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-lg bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] flex items-center justify-center">
                                        {skill.icon}
                                    </div>
                                    <h3 className="font-bold text-[var(--text-primary)]">{skill.category}</h3>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {skill.items.map(item => (
                                        <span key={item} className="badge">{item}</span>
                                    ))}
                                </div>
                            </Card>
                        ))}
                    </div>
                </motion.section>

                {/* CTA */}
                <motion.section
                    className="mt-20 text-center"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-2xl font-bold font-display mb-4">Interested in working together?</h2>
                    <p className="text-[var(--text-secondary)] mb-6">
                        I'm always open to discussing new opportunities and collaborations.
                    </p>
                    <Link href="/contact" className="btn btn-primary inline-flex">
                        Get in Touch <FiArrowRight />
                    </Link>
                </motion.section>
            </div>
        </div>
    );
}
