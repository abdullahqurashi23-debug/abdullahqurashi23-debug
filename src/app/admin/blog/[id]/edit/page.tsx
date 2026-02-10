'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FiArrowLeft, FiSave, FiUpload, FiX, FiImage, FiPlus } from 'react-icons/fi';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';

export default function EditBlogPostPage() {
    const router = useRouter();
    const params = useParams();
    const postId = params?.id as string;
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
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

    useEffect(() => {
        fetchPost();
    }, [postId]);

    const fetchPost = async () => {
        try {
            const { data, error } = await supabase
                .from('blog_posts')
                .select('*')
                .eq('id', postId)
                .single();

            if (data) {
                setFormData({
                    title: data.title || '',
                    slug: data.slug || '',
                    excerpt: data.excerpt || '',
                    content: data.content || '',
                    cover_image: data.cover_image || '',
                    tags: data.tags || [],
                    status: data.status || 'draft',
                    reading_time: data.reading_time || 5,
                });
                if (data.cover_image) {
                    setImagePreview(data.cover_image);
                }
            }
        } catch (error) {
            console.error('Error fetching post:', error);
        }
        setLoading(false);
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
        if (!imageFile) return formData.cover_image || imagePreview || null;

        try {
            const uploadData = new FormData();
            uploadData.append('file', imageFile);

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: uploadData,
            });

            const data = await res.json();
            if (!data.success) {
                console.error('Upload failed:', data.error);
                return imagePreview;
            }

            return data.url;
        } catch (error) {
            console.error('Upload error:', error);
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
        setSaving(true);
        setError('');

        if (!formData.title.trim()) {
            setError('Title is required');
            setSaving(false);
            return;
        }

        try {
            const coverImage = await uploadImage();
            const readingTime = calculateReadingTime(formData.content);

            const updateData: any = {
                title: formData.title.trim(),
                slug: formData.slug.trim(),
                excerpt: formData.excerpt.trim() || null,
                content: formData.content.trim(),
                cover_image: coverImage,
                tags: formData.tags,
                status: formData.status,
                reading_time: readingTime,
            };

            if (formData.status === 'published') {
                updateData.published_at = new Date().toISOString().split('T')[0];
            }

            const { error: dbError } = await supabase
                .from('blog_posts')
                .update(updateData)
                .eq('id', postId);

            if (dbError) {
                throw new Error(dbError.message);
            }

            router.push('/admin/blog');
        } catch (err: any) {
            setError(err.message || 'Failed to update post');
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
            <Link href="/admin/blog" className="inline-flex items-center text-gray-600 dark:text-gray-400 mb-8 hover:text-purple-600 transition">
                <FiArrowLeft className="mr-2" /> Back to Blog
            </Link>

            <h1 className="text-3xl font-bold mb-8">Edit Post</h1>

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
                            disabled={!!imageFile}
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
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block font-medium mb-2">Slug</label>
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
                            />
                        </div>

                        <div>
                            <label className="block font-medium mb-2">Content (Markdown supported)</label>
                            <textarea
                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 font-mono text-sm"
                                value={formData.content}
                                onChange={e => setFormData({ ...formData, content: e.target.value })}
                                rows={15}
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
                    <Button type="submit" className="flex-1 flex items-center justify-center gap-2" disabled={saving}>
                        <FiSave />
                        {saving ? 'Saving...' : 'Update Post'}
                    </Button>
                    <Link href="/admin/blog">
                        <Button type="button" variant="secondary">Cancel</Button>
                    </Link>
                </div>
            </form>
        </div>
    );
}
