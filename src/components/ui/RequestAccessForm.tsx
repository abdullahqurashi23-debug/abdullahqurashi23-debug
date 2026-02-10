'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiCheck, FiLock, FiUser, FiMail, FiBriefcase, FiFileText } from 'react-icons/fi';
import Card from '@/components/ui/Card';

interface RequestAccessFormProps {
    projectId: string;
    projectTitle: string;
    onClose?: () => void;
}

export default function RequestAccessForm({ projectId, projectTitle, onClose }: RequestAccessFormProps) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        company: '',
        role: '',
        reason: ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/access-request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    project_id: projectId,
                    project_title: projectTitle
                })
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess(true);
            } else {
                setError(data.error || 'Failed to submit request');
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
            >
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-4">
                    <FiCheck size={32} />
                </div>
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Request Submitted!</h3>
                <p className="text-[var(--text-secondary)] mb-6">
                    Thank you for your interest. You'll receive an email once your request is reviewed.
                </p>
                {onClose && (
                    <button onClick={onClose} className="btn btn-secondary">
                        Close
                    </button>
                )}
            </motion.div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                    <FiLock size={24} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-[var(--text-primary)]">Request Access</h3>
                    <p className="text-sm text-[var(--text-muted)]">{projectTitle}</p>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm">
                    {error}
                </div>
            )}

            {/* Name */}
            <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    <FiUser className="inline mr-1" size={14} /> Full Name *
                </label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)] transition-colors"
                    placeholder="Your full name"
                    required
                />
            </div>

            {/* Email */}
            <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    <FiMail className="inline mr-1" size={14} /> Email *
                </label>
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)] transition-colors"
                    placeholder="your.email@example.com"
                    required
                />
            </div>

            {/* Company & Role */}
            <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                        <FiBriefcase className="inline mr-1" size={14} /> Company/Institution
                    </label>
                    <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)] transition-colors"
                        placeholder="Your organization"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                        Role/Position
                    </label>
                    <input
                        type="text"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)] transition-colors"
                        placeholder="e.g., Researcher, Engineer"
                    />
                </div>
            </div>

            {/* Reason */}
            <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    <FiFileText className="inline mr-1" size={14} /> Reason for Access *
                </label>
                <textarea
                    name="reason"
                    rows={4}
                    value={formData.reason}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)] transition-colors resize-none"
                    placeholder="Please describe why you're interested in this project and how you plan to use the materials..."
                    required
                />
            </div>

            {/* Submit */}
            <div className="flex gap-3">
                {onClose && (
                    <button type="button" onClick={onClose} className="btn btn-secondary flex-1">
                        Cancel
                    </button>
                )}
                <button
                    type="submit"
                    className="btn btn-primary flex-1"
                    disabled={loading}
                >
                    {loading ? (
                        'Submitting...'
                    ) : (
                        <>Submit Request <FiSend size={16} /></>
                    )}
                </button>
            </div>

            <p className="text-xs text-[var(--text-muted)] text-center">
                By submitting, you agree to use the materials only for the stated purpose.
            </p>
        </form>
    );
}
