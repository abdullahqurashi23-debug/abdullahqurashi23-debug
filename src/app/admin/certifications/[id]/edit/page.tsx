'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FiArrowLeft, FiSave, FiUpload, FiX, FiImage } from 'react-icons/fi';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';

export default function EditCertificationPage() {
    const router = useRouter();
    const params = useParams();
    const certId = params?.id as string;
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        issuer: '',
        description: '',
        image_url: '',
        certificate_url: '',
        issue_date: '',
    });

    useEffect(() => {
        fetchCertification();
    }, [certId]);

    const fetchCertification = async () => {
        try {
            const { data, error } = await supabase
                .from('certifications')
                .select('*')
                .eq('id', certId)
                .single();

            if (data) {
                setFormData({
                    title: data.title || '',
                    issuer: data.issuer || '',
                    description: data.description || '',
                    image_url: data.image_url || '',
                    certificate_url: data.certificate_url || '',
                    issue_date: data.issue_date || '',
                });
                if (data.image_url) {
                    setImagePreview(data.image_url);
                }
            }
        } catch (error) {
            console.error('Error fetching certification:', error);
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
        setFormData({ ...formData, image_url: '' });
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const uploadImage = async (): Promise<string | null> => {
        if (!imageFile) return formData.image_url || imagePreview || null;

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        if (!formData.title.trim()) {
            setError('Title is required');
            setSaving(false);
            return;
        }
        if (!formData.issuer.trim()) {
            setError('Issuer is required');
            setSaving(false);
            return;
        }

        try {
            const imageUrl = await uploadImage();

            const { error: dbError } = await supabase
                .from('certifications')
                .update({
                    title: formData.title.trim(),
                    issuer: formData.issuer.trim(),
                    description: formData.description.trim() || null,
                    image_url: imageUrl,
                    certificate_url: formData.certificate_url.trim() || null,
                    issue_date: formData.issue_date,
                })
                .eq('id', certId);

            if (dbError) {
                throw new Error(dbError.message);
            }

            router.push('/admin/certifications');
        } catch (err: any) {
            setError(err.message || 'Failed to update certification');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="p-8 max-w-3xl mx-auto">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48" />
                    <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                    <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-3xl mx-auto">
            <Link href="/admin/certifications" className="inline-flex items-center text-gray-600 dark:text-gray-400 mb-8 hover:text-blue-600 transition">
                <FiArrowLeft className="mr-2" /> Back to Certifications
            </Link>

            <h1 className="text-3xl font-bold mb-8">Edit Certification</h1>

            {error && (
                <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-4 rounded-lg mb-6">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Image Upload */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <FiImage className="text-amber-500" /> Certificate Image
                    </h2>

                    <div className="flex flex-col items-center">
                        {imagePreview ? (
                            <div className="relative w-full max-w-md aspect-video rounded-lg overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600 mb-4">
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                                >
                                    <FiX size={16} />
                                </button>
                            </div>
                        ) : (
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full max-w-md aspect-video rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition mb-4"
                            >
                                <FiUpload className="text-4xl text-gray-400 mb-2" />
                                <p className="text-gray-600 dark:text-gray-400 font-medium">Click to upload image</p>
                                <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                            </div>
                        )}

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageSelect}
                            className="hidden"
                        />

                        <p className="text-xs text-gray-500 text-center">Or enter an image URL below</p>
                        <input
                            className="mt-2 w-full max-w-md p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-sm"
                            value={formData.image_url}
                            onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                            placeholder="https://example.com/certificate.png"
                            disabled={!!imageFile}
                        />
                    </div>
                </div>

                {/* Basic Information */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-bold mb-6">Certificate Details</h2>

                    <div className="space-y-6">
                        <div>
                            <label className="block font-medium mb-2">Title <span className="text-red-500">*</span></label>
                            <input
                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block font-medium mb-2">Issuer <span className="text-red-500">*</span></label>
                            <input
                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
                                value={formData.issuer}
                                onChange={e => setFormData({ ...formData, issuer: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block font-medium mb-2">Description</label>
                            <textarea
                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block font-medium mb-2">Issue Date</label>
                                <input
                                    type="date"
                                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
                                    value={formData.issue_date}
                                    onChange={e => setFormData({ ...formData, issue_date: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block font-medium mb-2">Certificate URL</label>
                                <input
                                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
                                    value={formData.certificate_url}
                                    onChange={e => setFormData({ ...formData, certificate_url: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Submit */}
                <div className="flex gap-4">
                    <Button type="submit" className="flex-1 flex items-center justify-center gap-2" disabled={saving}>
                        <FiSave />
                        {saving ? 'Saving...' : 'Update Certification'}
                    </Button>
                    <Link href="/admin/certifications">
                        <Button type="button" variant="secondary">Cancel</Button>
                    </Link>
                </div>
            </form>
        </div>
    );
}
