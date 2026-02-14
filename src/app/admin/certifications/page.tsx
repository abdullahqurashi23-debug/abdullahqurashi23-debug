'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Button from '@/components/ui/Button';
import { FiPlus, FiEdit2, FiTrash2, FiAward, FiExternalLink, FiCalendar, FiRefreshCw } from 'react-icons/fi';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface Certification {
    id: string;
    title: string;
    issuer: string;
    description: string;
    image_url: string;
    certificate_url: string;
    issue_date: string;
    created_at: string;
}

// Sample certifications for fallback
const sampleCertifications: Certification[] = [
    {
        id: '1',
        title: 'TensorFlow Developer Certificate',
        issuer: 'Google',
        description: 'Professional certification demonstrating proficiency in using TensorFlow to solve deep learning and ML problems.',
        image_url: '/certifications/tensorflow.png',
        certificate_url: 'https://www.credential.net/example',
        issue_date: '2024-06-15',
        created_at: '2024-06-15',
    },
    {
        id: '2',
        title: 'AWS Certified Machine Learning - Specialty',
        issuer: 'Amazon Web Services',
        description: 'Validates expertise in building, training, tuning, and deploying machine learning models on AWS.',
        image_url: '/certifications/aws-ml.png',
        certificate_url: 'https://aws.amazon.com/certification',
        issue_date: '2024-03-20',
        created_at: '2024-03-20',
    },
    {
        id: '3',
        title: 'Deep Learning Specialization',
        issuer: 'Coursera - DeepLearning.AI',
        description: 'Five-course specialization covering neural networks, CNNs, RNNs, and sequence models.',
        image_url: '/certifications/deeplearning.png',
        certificate_url: 'https://coursera.org/verify/specialization',
        issue_date: '2023-11-10',
        created_at: '2023-11-10',
    },
];

export default function AdminCertificationsPage() {
    const [certifications, setCertifications] = useState<Certification[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<string | null>(null);

    useEffect(() => {
        fetchCertifications();
    }, []);

    const fetchCertifications = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('certifications')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching certifications:', error);
                // Only use sample data if there's an actual error (like table doesn't exist)
                setCertifications(sampleCertifications);
            } else if (data && data.length > 0) {
                setCertifications(data);
            } else {
                // Empty table — show empty state rather than fake data
                setCertifications([]);
            }
        } catch (error) {
            console.error('Error fetching certifications:', error);
            setCertifications(sampleCertifications);
        }
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this certification?')) return;

        setDeleting(id);
        try {
            const { error } = await supabase.from('certifications').delete().eq('id', id);
            if (error) {
                alert('Failed to delete certification: ' + error.message);
            } else {
                setCertifications(certifications.filter(c => c.id !== id));
            }
        } catch (error: any) {
            alert('Failed to delete certification: ' + (error?.message || 'Unknown error'));
            console.error('Error deleting:', error);
        }
        setDeleting(null);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
        });
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <FiAward className="text-amber-500" />
                        Certifications
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Manage your professional certifications and credentials
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary" onClick={fetchCertifications} disabled={loading}>
                        <FiRefreshCw className={loading ? 'animate-spin' : ''} />
                    </Button>
                    <Link href="/admin/certifications/new">
                        <Button className="flex items-center gap-2">
                            <FiPlus /> Add Certification
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                    <p className="text-3xl font-bold text-amber-500">{certifications.length}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Certifications</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                    <p className="text-3xl font-bold text-blue-500">
                        {certifications.filter(c => new Date(c.issue_date).getFullYear() === new Date().getFullYear()).length}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">This Year</p>
                </div>
            </div>

            {/* Certifications Grid */}
            {loading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 animate-pulse">
                            <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg mb-4" />
                            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                        </div>
                    ))}
                </div>
            ) : certifications.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <FiAward className="mx-auto text-6xl text-gray-300 dark:text-gray-600 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No certifications yet</h3>
                    <p className="text-gray-500 mb-6">Add your first certification to showcase your credentials.</p>
                    <Link href="/admin/certifications/new">
                        <Button>
                            <FiPlus className="mr-2" /> Add Certification
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {certifications.map((cert) => (
                            <motion.div
                                key={cert.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden group hover:shadow-lg transition-shadow"
                            >
                                {/* Certificate Image */}
                                <div className="aspect-video bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/20 dark:to-gray-800 relative overflow-hidden">
                                    {cert.image_url ? (
                                        <img
                                            src={cert.image_url}
                                            alt={cert.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <FiAward className="text-6xl text-amber-300 dark:text-amber-600" />
                                        </div>
                                    )}
                                    {/* Hover Actions */}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                        <Link href={`/admin/certifications/${cert.id}/edit`}>
                                            <button className="p-3 bg-white rounded-full text-gray-800 hover:bg-blue-500 hover:text-white transition">
                                                <FiEdit2 size={18} />
                                            </button>
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(cert.id)}
                                            disabled={deleting === cert.id}
                                            className="p-3 bg-white rounded-full text-gray-800 hover:bg-red-500 hover:text-white transition disabled:opacity-50"
                                        >
                                            <FiTrash2 size={18} />
                                        </button>
                                        {cert.certificate_url && (
                                            <a
                                                href={cert.certificate_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-3 bg-white rounded-full text-gray-800 hover:bg-green-500 hover:text-white transition"
                                            >
                                                <FiExternalLink size={18} />
                                            </a>
                                        )}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-4">
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1 line-clamp-2">
                                        {cert.title}
                                    </h3>
                                    <p className="text-sm text-amber-600 dark:text-amber-400 font-medium mb-2">
                                        {cert.issuer}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                                        {cert.description}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <FiCalendar size={12} />
                                        <span>{formatDate(cert.issue_date)}</span>
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
