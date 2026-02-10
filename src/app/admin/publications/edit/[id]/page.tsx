'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FiArrowLeft, FiPlus, FiX, FiSave } from 'react-icons/fi';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';

export default function EditPublicationPage() {
    const router = useRouter();
    const params = useParams();
    const pubId = params?.id as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [newAuthor, setNewAuthor] = useState('');
    const [newContribution, setNewContribution] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        authors: [] as string[],
        journal: '',
        status: 'under-review',
        year: new Date().getFullYear(),
        abstract: '',
        contributions: [] as string[],
        pdf_url: '',
        doi_link: '',
        code_repo: '',
    });

    useEffect(() => {
        fetchPublication();
    }, [pubId]);

    const fetchPublication = async () => {
        try {
            const { data, error } = await supabase
                .from('publications')
                .select('*')
                .eq('id', pubId)
                .single();

            if (data) {
                setFormData({
                    title: data.title || '',
                    authors: data.authors || [],
                    journal: data.journal || '',
                    status: data.status || 'under-review',
                    year: data.year || new Date().getFullYear(),
                    abstract: data.abstract || '',
                    contributions: data.contributions || [],
                    pdf_url: data.pdf_url || '',
                    doi_link: data.doi_link || '',
                    code_repo: data.code_repo || '',
                });
            }
        } catch (err) {
            console.error('Error fetching publication:', err);
            setError('Failed to load publication');
        }
        setLoading(false);
    };

    const addAuthor = () => {
        if (newAuthor.trim() && !formData.authors.includes(newAuthor.trim())) {
            setFormData({
                ...formData,
                authors: [...formData.authors, newAuthor.trim()]
            });
            setNewAuthor('');
        }
    };

    const removeAuthor = (author: string) => {
        setFormData({
            ...formData,
            authors: formData.authors.filter(a => a !== author)
        });
    };

    const addContribution = () => {
        if (newContribution.trim() && !formData.contributions.includes(newContribution.trim())) {
            setFormData({
                ...formData,
                contributions: [...formData.contributions, newContribution.trim()]
            });
            setNewContribution('');
        }
    };

    const removeContribution = (contribution: string) => {
        setFormData({
            ...formData,
            contributions: formData.contributions.filter(c => c !== contribution)
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        if (!formData.title.trim()) {
            setError('Title is required');
            setSaving(false);
            return;
        }
        if (formData.authors.length === 0) {
            setError('Please add at least one author');
            setSaving(false);
            return;
        }

        try {
            const { error: dbError } = await supabase
                .from('publications')
                .update({
                    title: formData.title.trim(),
                    authors: formData.authors,
                    journal: formData.journal.trim() || null,
                    status: formData.status,
                    year: formData.year,
                    abstract: formData.abstract.trim() || null,
                    contributions: formData.contributions,
                    pdf_url: formData.pdf_url.trim() || null,
                    doi_link: formData.doi_link.trim() || null,
                    code_repo: formData.code_repo.trim() || null,
                })
                .eq('id', pubId);

            if (dbError) {
                throw new Error(dbError.message);
            }

            router.push('/admin/publications');
        } catch (err: any) {
            setError(err.message || 'Failed to update publication');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="p-8 max-w-4xl mx-auto">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48" />
                    <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                    <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <Link href="/admin/publications" className="inline-flex items-center text-gray-600 dark:text-gray-400 mb-8 hover:text-blue-600 transition">
                <FiArrowLeft className="mr-2" /> Back to Publications
            </Link>

            <h1 className="text-3xl font-bold mb-8">Edit Publication</h1>

            {error && (
                <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-4 rounded-lg mb-6">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Information */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-bold mb-6">Basic Information</h2>

                    <div>
                        <label className="block font-medium mb-2">Title <span className="text-red-500">*</span></label>
                        <input
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 mt-6">
                        <div>
                            <label className="block font-medium mb-2">Year</label>
                            <input
                                type="number"
                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                value={formData.year}
                                onChange={e => setFormData({ ...formData, year: Number(e.target.value) })}
                                min={2000}
                                max={2030}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block font-medium mb-2">Journal / Conference</label>
                            <input
                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                value={formData.journal}
                                onChange={e => setFormData({ ...formData, journal: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="mt-6">
                        <label className="block font-medium mb-2">Status</label>
                        <div className="flex flex-wrap gap-3">
                            {[
                                { value: 'under-review', label: 'Under Review', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
                                { value: 'published', label: 'Published', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
                                { value: 'preprint', label: 'Preprint', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
                                { value: 'book-chapter', label: 'Book Chapter', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
                            ].map(option => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, status: option.value })}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${formData.status === option.value
                                        ? option.color + ' ring-2 ring-offset-2 ring-current'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                        }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Authors */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-bold mb-6">Authors <span className="text-red-500">*</span></h2>

                    <div className="flex gap-2 mb-4">
                        <input
                            className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            value={newAuthor}
                            onChange={e => setNewAuthor(e.target.value)}
                            placeholder="Add author name"
                            onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addAuthor())}
                        />
                        <Button type="button" onClick={addAuthor} variant="secondary">
                            <FiPlus />
                        </Button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {formData.authors.map((author, idx) => (
                            <span
                                key={idx}
                                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${author.toLowerCase().includes('emal')
                                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                    }`}
                            >
                                {author}
                                <button type="button" onClick={() => removeAuthor(author)} className="hover:text-red-500 ml-1">
                                    <FiX size={14} />
                                </button>
                            </span>
                        ))}
                    </div>
                </div>

                {/* Abstract & Contributions */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-bold mb-6">Content</h2>

                    <div>
                        <label className="block font-medium mb-2">Abstract</label>
                        <textarea
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            value={formData.abstract}
                            onChange={e => setFormData({ ...formData, abstract: e.target.value })}
                            rows={5}
                        />
                    </div>

                    <div className="mt-6">
                        <label className="block font-medium mb-2">Key Contributions</label>
                        <div className="flex gap-2 mb-3">
                            <input
                                className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                value={newContribution}
                                onChange={e => setNewContribution(e.target.value)}
                                placeholder="Add a key contribution..."
                                onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addContribution())}
                            />
                            <Button type="button" onClick={addContribution} variant="secondary">
                                <FiPlus />
                            </Button>
                        </div>

                        {formData.contributions.length > 0 && (
                            <ul className="space-y-2">
                                {formData.contributions.map((contribution, idx) => (
                                    <li key={idx} className="flex items-start gap-2 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                                        <span className="text-blue-500 mt-1">•</span>
                                        <span className="flex-1 text-sm">{contribution}</span>
                                        <button type="button" onClick={() => removeContribution(contribution)} className="text-gray-400 hover:text-red-500">
                                            <FiX size={16} />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Links */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-bold mb-6">Links</h2>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block font-medium mb-2">PDF URL</label>
                            <input
                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                value={formData.pdf_url}
                                onChange={e => setFormData({ ...formData, pdf_url: e.target.value })}
                                placeholder="https://arxiv.org/pdf/..."
                            />
                        </div>

                        <div>
                            <label className="block font-medium mb-2">DOI Link</label>
                            <input
                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                value={formData.doi_link}
                                onChange={e => setFormData({ ...formData, doi_link: e.target.value })}
                                placeholder="https://doi.org/10.1109/..."
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block font-medium mb-2">Code Repository</label>
                            <input
                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                value={formData.code_repo}
                                onChange={e => setFormData({ ...formData, code_repo: e.target.value })}
                                placeholder="https://github.com/..."
                            />
                        </div>
                    </div>
                </div>

                {/* Submit */}
                <div className="flex gap-4">
                    <Button type="submit" className="flex-1 flex items-center justify-center gap-2" disabled={saving}>
                        <FiSave />
                        {saving ? 'Saving...' : 'Update Publication'}
                    </Button>
                    <Link href="/admin/publications">
                        <Button type="button" variant="secondary">Cancel</Button>
                    </Link>
                </div>
            </form>
        </div>
    );
}
