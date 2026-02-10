'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FiArrowLeft, FiPlus, FiX, FiSave } from 'react-icons/fi';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';

const CATEGORIES = [
    'Healthcare AI',
    'Computer Vision',
    'EEG/BCI',
    'NLP',
    'Cybersecurity',
    'Privacy',
    'IoT',
    'Medical Imaging',
    'Deep Learning',
    'Machine Learning'
];

export default function EditProjectPage() {
    const router = useRouter();
    const params = useParams();
    const projectId = params?.id as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [newTag, setNewTag] = useState('');
    const [newMetricLabel, setNewMetricLabel] = useState('');
    const [newMetricValue, setNewMetricValue] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        short_description: '',
        full_description: '',
        problem_statement: '',
        approach: '',
        results: '',
        limitations: '',
        category: [] as string[],
        tags: [] as string[],
        github_link: '',
        visibility: 'public',
        is_featured: false,
        metrics: [] as { label: string; value: string }[],
        gated_code: '',
    });

    useEffect(() => {
        fetchProject();
    }, [projectId]);

    const fetchProject = async () => {
        try {
            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .eq('id', projectId)
                .single();

            if (data) {
                setFormData({
                    title: data.title || '',
                    slug: data.slug || '',
                    short_description: data.short_description || '',
                    full_description: data.full_description || '',
                    problem_statement: data.problem_statement || '',
                    approach: data.approach || '',
                    results: data.results || '',
                    limitations: data.limitations || '',
                    category: data.category || [],
                    tags: data.tags || [],
                    github_link: data.github_link || '',
                    visibility: data.visibility || 'public',
                    is_featured: data.is_featured || false,
                    metrics: data.metrics || [],
                    gated_code: data.gated_code || '',
                });
            }
        } catch (err) {
            console.error('Error fetching project:', err);
            setError('Failed to load project');
        }
        setLoading(false);
    };

    const toggleCategory = (cat: string) => {
        setFormData({
            ...formData,
            category: formData.category.includes(cat)
                ? formData.category.filter(c => c !== cat)
                : [...formData.category, cat]
        });
    };

    const addTag = () => {
        if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
            setFormData({
                ...formData,
                tags: [...formData.tags, newTag.trim()]
            });
            setNewTag('');
        }
    };

    const removeTag = (tag: string) => {
        setFormData({
            ...formData,
            tags: formData.tags.filter(t => t !== tag)
        });
    };

    const addMetric = () => {
        if (newMetricLabel.trim() && newMetricValue.trim()) {
            setFormData({
                ...formData,
                metrics: [...formData.metrics, { label: newMetricLabel.trim(), value: newMetricValue.trim() }]
            });
            setNewMetricLabel('');
            setNewMetricValue('');
        }
    };

    const removeMetric = (idx: number) => {
        setFormData({
            ...formData,
            metrics: formData.metrics.filter((_, i) => i !== idx)
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
        if (!formData.slug.trim()) {
            setError('Slug is required');
            setSaving(false);
            return;
        }
        if (formData.category.length === 0) {
            setError('Please select at least one category');
            setSaving(false);
            return;
        }

        try {
            const { error: dbError } = await supabase
                .from('projects')
                .update({
                    title: formData.title.trim(),
                    slug: formData.slug.trim(),
                    short_description: formData.short_description.trim(),
                    full_description: formData.full_description.trim() || null,
                    problem_statement: formData.problem_statement.trim() || null,
                    approach: formData.approach.trim() || null,
                    results: formData.results.trim() || null,
                    limitations: formData.limitations.trim() || null,
                    category: formData.category,
                    tags: formData.tags,
                    github_link: formData.github_link.trim() || null,
                    visibility: formData.visibility,
                    is_featured: formData.is_featured,
                    metrics: formData.metrics,
                    gated_code: formData.gated_code.trim() || null,
                })
                .eq('id', projectId);

            if (dbError) {
                throw new Error(dbError.message);
            }

            router.push('/admin/projects');
        } catch (err: any) {
            setError(err.message || 'Failed to update project');
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
            <Link href="/admin/projects" className="inline-flex items-center text-gray-600 dark:text-gray-400 mb-8 hover:text-blue-600 transition">
                <FiArrowLeft className="mr-2" /> Back to Projects
            </Link>

            <h1 className="text-3xl font-bold mb-8">Edit Project</h1>

            {error && (
                <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-4 rounded-lg mb-6">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Information */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-bold mb-6">Basic Information</h2>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block font-medium mb-2">Project Title <span className="text-red-500">*</span></label>
                            <input
                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block font-medium mb-2">Slug <span className="text-red-500">*</span></label>
                            <input
                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                value={formData.slug}
                                onChange={e => setFormData({ ...formData, slug: e.target.value })}
                            />
                            <p className="text-xs text-gray-500 mt-1">URL-friendly identifier</p>
                        </div>
                    </div>

                    <div className="mt-6">
                        <label className="block font-medium mb-2">Short Description</label>
                        <textarea
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            value={formData.short_description}
                            onChange={e => setFormData({ ...formData, short_description: e.target.value })}
                            rows={2}
                        />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 mt-6">
                        <div>
                            <label className="block font-medium mb-2">Visibility</label>
                            <select
                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                value={formData.visibility}
                                onChange={e => setFormData({ ...formData, visibility: e.target.value })}
                            >
                                <option value="public">Public - Visible to everyone</option>
                                <option value="gated">Gated - Requires access request</option>
                                <option value="nda">NDA - Under non-disclosure</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-4 pt-8">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.is_featured}
                                    onChange={e => setFormData({ ...formData, is_featured: e.target.checked })}
                                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="font-medium">Featured Project</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Categories & Tags */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-bold mb-6">Categories & Tags</h2>

                    <div>
                        <label className="block font-medium mb-3">Categories <span className="text-red-500">*</span></label>
                        <div className="flex flex-wrap gap-2">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => toggleCategory(cat)}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${formData.category.includes(cat)
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mt-6">
                        <label className="block font-medium mb-3">Tags</label>
                        <div className="flex gap-2 mb-3">
                            <input
                                className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                value={newTag}
                                onChange={e => setNewTag(e.target.value)}
                                placeholder="Add a tag"
                                onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                            />
                            <Button type="button" onClick={addTag} variant="secondary">
                                <FiPlus />
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {formData.tags.map(tag => (
                                <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm">
                                    {tag}
                                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500">
                                        <FiX size={14} />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Detailed Content */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-bold mb-6">Project Details</h2>

                    <div className="space-y-6">
                        <div>
                            <label className="block font-medium mb-2">Problem Statement</label>
                            <textarea
                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                value={formData.problem_statement}
                                onChange={e => setFormData({ ...formData, problem_statement: e.target.value })}
                                rows={3}
                            />
                        </div>

                        <div>
                            <label className="block font-medium mb-2">Approach / Methodology</label>
                            <textarea
                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                value={formData.approach}
                                onChange={e => setFormData({ ...formData, approach: e.target.value })}
                                rows={4}
                            />
                        </div>

                        <div>
                            <label className="block font-medium mb-2">Results / Impact</label>
                            <textarea
                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                value={formData.results}
                                onChange={e => setFormData({ ...formData, results: e.target.value })}
                                rows={3}
                            />
                        </div>

                        <div>
                            <label className="block font-medium mb-2">Limitations / Future Work</label>
                            <textarea
                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                value={formData.limitations}
                                onChange={e => setFormData({ ...formData, limitations: e.target.value })}
                                rows={2}
                            />
                        </div>

                        {formData.visibility === 'gated' && (
                            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                                <label className="block font-medium mb-2 text-amber-800 dark:text-amber-300 flex items-center gap-2">
                                    🔒 Gated Source Code
                                </label>
                                <p className="text-sm text-amber-700 dark:text-amber-400 mb-3">
                                    This code will be shown blurred on the project page.
                                </p>
                                <textarea
                                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition font-mono text-sm"
                                    value={formData.gated_code}
                                    onChange={e => setFormData({ ...formData, gated_code: e.target.value })}
                                    rows={12}
                                />
                            </div>
                        )}

                        <div>
                            <label className="block font-medium mb-2">Full Description</label>
                            <textarea
                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                value={formData.full_description}
                                onChange={e => setFormData({ ...formData, full_description: e.target.value })}
                                rows={6}
                            />
                        </div>
                    </div>
                </div>

                {/* Metrics */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-bold mb-6">Key Metrics</h2>

                    <div className="flex gap-2 mb-4">
                        <input
                            className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
                            value={newMetricLabel}
                            onChange={e => setNewMetricLabel(e.target.value)}
                            placeholder="Label (e.g., Accuracy)"
                        />
                        <input
                            className="w-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
                            value={newMetricValue}
                            onChange={e => setNewMetricValue(e.target.value)}
                            placeholder="Value (e.g., 98%)"
                            onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addMetric())}
                        />
                        <Button type="button" onClick={addMetric} variant="secondary">
                            <FiPlus />
                        </Button>
                    </div>

                    {formData.metrics.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {formData.metrics.map((metric, idx) => (
                                <div key={idx} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-center relative group">
                                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{metric.value}</p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">{metric.label}</p>
                                    <button
                                        type="button"
                                        onClick={() => removeMetric(idx)}
                                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-red-500 transition"
                                    >
                                        <FiX size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Links */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-bold mb-6">Links</h2>

                    <div>
                        <label className="block font-medium mb-2">GitHub Repository URL</label>
                        <input
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            value={formData.github_link}
                            onChange={e => setFormData({ ...formData, github_link: e.target.value })}
                            placeholder="https://github.com/username/repo"
                        />
                    </div>
                </div>

                {/* Submit */}
                <div className="flex gap-4">
                    <Button type="submit" className="flex-1 flex items-center justify-center gap-2" disabled={saving}>
                        <FiSave />
                        {saving ? 'Saving...' : 'Update Project'}
                    </Button>
                    <Link href="/admin/projects">
                        <Button type="button" variant="secondary">Cancel</Button>
                    </Link>
                </div>
            </form>
        </div>
    );
}
