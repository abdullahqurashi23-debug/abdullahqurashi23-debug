'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiSave, FiUpload, FiX, FiImage, FiPlus, FiEye } from 'react-icons/fi';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';

export default function AddBlogPostPage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [newTag, setNewTag] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        cover_image: '',
        tags: [] as string[],
        status: 'draft' as 'draft' | 'published',
        reading_time: 5,
    });

    const generateSlug = (title: string) => {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    };

    const handleTitleChange = (title: string) => {
        setFormData({
            ...formData,
            title,
            slug: generateSlug(title)
        });
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setImagePreview(null);
        setImageFile(null);
        setFormData({ ...formData, cover_image: '' });
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
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

    const uploadImage = async (): Promise<string | null> => {
        if (!imageFile) return formData.cover_image || null;

        try {
            const fileExt = imageFile.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `blog/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('portfolio')
                .upload(filePath, imageFile);

            if (uploadError) {
                return imagePreview;
            }

            const { data: { publicUrl } } = supabase.storage
                .from('portfolio')
                .getPublicUrl(filePath);

            return publicUrl;
        } catch (error) {
            return imagePreview;
        }
    };

    const calculateReadingTime = (content: string) => {
        const wordsPerMinute = 200;
        const words = content.trim().split(/\s+/).length;
        return Math.max(1, Math.ceil(words / wordsPerMinute));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!formData.title.trim()) {
            setError('Title is required');
            setLoading(false);
            return;
        }
        if (!formData.slug.trim()) {
            setError('Slug is required');
            setLoading(false);
            return;
        }

        try {
            const coverImage = await uploadImage();
            const readingTime = calculateReadingTime(formData.content);

            const { error: dbError } = await supabase
                .from('blog_posts')
                .insert([{
                    title: formData.title.trim(),
                    slug: formData.slug.trim(),
                    excerpt: formData.excerpt.trim() || null,
                    content: formData.content.trim(),
                    cover_image: coverImage,
                    tags: formData.tags,
                    status: formData.status,
                    reading_time: readingTime,
                    published_at: formData.status === 'published' ? new Date().toISOString().split('T')[0] : null,
                }])
                .select()
                .single();

            if (dbError) {
                throw new Error(dbError.message);
            }

            router.push('/admin/blog');
        } catch (err: any) {
            setError(err.message || 'Failed to create post');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <Link href="/admin/blog" className="inline-flex items-center text-gray-600 dark:text-gray-400 mb-8 hover:text-purple-600 transition">
                <FiArrowLeft className="mr-2" /> Back to Blog
            </Link>

            <h1 className="text-3xl font-bold mb-8">Create New Post</h1>

            {error && (
                <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-4 rounded-lg mb-6">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Cover Image */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <FiImage className="text-purple-500" /> Cover Image
                    </h2>

                    <div className="flex flex-col items-center">
                        {imagePreview ? (
                            <div className="relative w-full aspect-video rounded-lg overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600 mb-4">
                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full"
                                >
                                    <FiX size={16} />
                                </button>
                            </div>
                        ) : (
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full aspect-video rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 transition mb-4"
                            >
                                <FiUpload className="text-4xl text-gray-400 mb-2" />
                                <p className="text-gray-600 dark:text-gray-400">Click to upload cover image</p>
                            </div>
                        )}

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageSelect}
                            className="hidden"
                        />

                        <input
                            className="mt-2 w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-sm"
                            value={formData.cover_image}
                            onChange={e => setFormData({ ...formData, cover_image: e.target.value })}
                            placeholder="Or enter image URL"
                            disabled={!!imagePreview}
                        />
                    </div>
                </div>

                {/* Basic Information */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-bold mb-6">Post Details</h2>

                    <div className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block font-medium mb-2">Title <span className="text-red-500">*</span></label>
                                <input
                                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
                                    value={formData.title}
                                    onChange={e => handleTitleChange(e.target.value)}
                                    placeholder="e.g., Understanding Neural Networks"
                                />
                            </div>
                            <div>
                                <label className="block font-medium mb-2">Slug <span className="text-red-500">*</span></label>
                                <input
                                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
                                    value={formData.slug}
                                    onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block font-medium mb-2">Excerpt</label>
                            <textarea
                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
                                value={formData.excerpt}
                                onChange={e => setFormData({ ...formData, excerpt: e.target.value })}
                                rows={2}
                                placeholder="Brief summary that appears in post listings..."
                            />
                        </div>

                        <div>
                            <label className="block font-medium mb-2">Content (Markdown supported)</label>
                            <textarea
                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 font-mono text-sm"
                                value={formData.content}
                                onChange={e => setFormData({ ...formData, content: e.target.value })}
                                rows={15}
                                placeholder="## Introduction

Write your blog post content here. Markdown formatting is supported:
- Use ## for headings
- Use **bold** and *italic* text
- Use - for bullet points
- Use 1. for numbered lists
"
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block font-medium mb-2">Status</label>
                                <select
                                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
                                    value={formData.status}
                                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                                >
                                    <option value="draft">Draft</option>
                                    <option value="published">Published</option>
                                </select>
                            </div>
                            <div>
                                <label className="block font-medium mb-2">Tags</label>
                                <div className="flex gap-2">
                                    <input
                                        className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
                                        value={newTag}
                                        onChange={e => setNewTag(e.target.value)}
                                        placeholder="Add tag..."
                                        onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                    />
                                    <Button type="button" onClick={addTag} variant="secondary">
                                        <FiPlus />
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {formData.tags.map(tag => (
                                        <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm">
                                            {tag}
                                            <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500">
                                                <FiX size={14} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Submit */}
                <div className="flex gap-4">
                    <Button type="submit" className="flex-1 flex items-center justify-center gap-2" disabled={loading}>
                        <FiSave />
                        {loading ? 'Saving...' : formData.status === 'published' ? 'Publish Post' : 'Save Draft'}
                    </Button>
                    <Link href="/admin/blog">
                        <Button type="button" variant="secondary">Cancel</Button>
                    </Link>
                </div>
            </form>
        </div>
    );
}
