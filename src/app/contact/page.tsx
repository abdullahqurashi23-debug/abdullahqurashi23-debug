'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    FiMail,
    FiMapPin,
    FiLinkedin,
    FiGithub,
    FiSend,
    FiCheck,
    FiCalendar
} from 'react-icons/fi';
import Card from '@/components/ui/Card';

export default function ContactPage() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        collaborationType: 'Research Collaboration',
        subject: '',
        message: ''
    });

    const collaborationTypes = [
        'Research Collaboration',
        'Internship Inquiry',
        'Client Project',
        'Speaking/Workshop',
        'General Question'
    ];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess(true);
                setFormData({ name: '', email: '', collaborationType: 'Research Collaboration', subject: '', message: '' });
            } else {
                setError(data.error || 'Failed to send message');
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen py-16">
            <div className="container mx-auto px-6">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
                    {/* Contact Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-4xl md:text-5xl font-bold font-display mb-6">Get in Touch</h1>
                        <p className="text-[var(--text-secondary)] text-lg mb-8">
                            Interested in collaboration? Have a project in mind?
                            Feel free to reach out directly or use the form.
                        </p>

                        {/* Contact Cards */}
                        <div className="space-y-4 mb-8">
                            <Card>
                                <a
                                    href="mailto:emalkamawal@outlook.com"
                                    className="flex items-center gap-4 group"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] flex items-center justify-center text-xl flex-shrink-0">
                                        <FiMail />
                                    </div>
                                    <div>
                                        <p className="text-sm text-[var(--text-muted)]">Email</p>
                                        <p className="font-semibold text-[var(--text-primary)] group-hover:text-[var(--brand-primary)] transition-colors">
                                            emalkamawal@outlook.com
                                        </p>
                                    </div>
                                </a>
                            </Card>

                            <Card>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-xl flex-shrink-0">
                                        <FiMapPin />
                                    </div>
                                    <div>
                                        <p className="text-sm text-[var(--text-muted)]">Location</p>
                                        <p className="font-semibold text-[var(--text-primary)]">Haripur, KPK, Pakistan</p>
                                    </div>
                                </div>
                            </Card>

                            <Card>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center text-xl flex-shrink-0">
                                        <FiCalendar />
                                    </div>
                                    <div>
                                        <p className="text-sm text-[var(--text-muted)]">Availability</p>
                                        <p className="font-semibold text-[var(--text-primary)]">Open for new opportunities</p>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* Social Links */}
                        <div className="flex gap-4">
                            <a
                                href="https://linkedin.com/in/emalkamawal"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-12 h-12 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-xl text-[var(--text-muted)] hover:text-[#0077b5] hover:border-[#0077b5] transition-all"
                            >
                                <FiLinkedin />
                            </a>
                            <a
                                href="https://github.com/emalkamawal"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-12 h-12 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--text-primary)] transition-all"
                            >
                                <FiGithub />
                            </a>
                        </div>
                    </motion.div>

                    {/* Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        <Card className="lg:p-8">
                            {success ? (
                                <motion.div
                                    className="text-center py-12"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                >
                                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-4 text-3xl">
                                        <FiCheck />
                                    </div>
                                    <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Message Sent!</h3>
                                    <p className="text-[var(--text-secondary)] mb-6">
                                        Thank you for reaching out. I'll get back to you within 24-48 hours.
                                    </p>
                                    <button
                                        onClick={() => setSuccess(false)}
                                        className="btn btn-secondary"
                                    >
                                        Send Another
                                    </button>
                                </motion.div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Send a Message</h2>

                                    {error && (
                                        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm">
                                            {error}
                                        </div>
                                    )}

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Name</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)] transition-colors"
                                                placeholder="Your Full Name"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Email</label>
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
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Collaboration Type</label>
                                        <select
                                            name="collaborationType"
                                            value={formData.collaborationType}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)] transition-colors"
                                        >
                                            {collaborationTypes.map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Subject</label>
                                        <input
                                            type="text"
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)] transition-colors"
                                            placeholder="Subject of your message"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Message</label>
                                        <textarea
                                            name="message"
                                            rows={4}
                                            value={formData.message}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)] transition-colors resize-none"
                                            placeholder="How can we work together?"
                                            required
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn btn-primary w-full"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>Sending...</>
                                        ) : (
                                            <>Send Message <FiSend /></>
                                        )}
                                    </button>
                                </form>
                            )}
                        </Card>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
