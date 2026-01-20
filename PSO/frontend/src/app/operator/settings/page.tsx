'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import { api } from '@/lib/api';
import { ArrowLeft, User, Phone, Save, Check } from 'lucide-react';

export default function OperatorSettingsPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [formData, setFormData] = useState({
        fullName: user?.fullName || '',
        phone: '',
    });

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.updateProfile(formData);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
        } finally {
            setSaving(false);
        }
    };

    if (!user) {
        return (
            <div className="p-4 flex items-center justify-center min-h-[60vh]">
                <div className="op-spinner"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 relative pb-10">
            {/* Background Pattern */}
            <div className="fixed inset-0 z-0 opacity-[0.6] pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(#cbd5e1 1.5px, transparent 1.5px), radial-gradient(#cbd5e1 1.5px, transparent 1.5px)',
                    backgroundSize: '24px 24px',
                    backgroundPosition: '0 0, 12px 12px'
                }}>
            </div>

            <div className="relative z-10 p-4 max-w-lg mx-auto">
                {/* Header */}
                <div className="mb-6 pt-2 flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="w-10 h-10 bg-white/80 backdrop-blur-md border border-slate-200 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">Settings</h1>
                        <p className="text-sm text-slate-500">Manage your profile</p>
                    </div>
                </div>

                {/* Success/Error Message */}
                {message.text && (
                    <div className={`p-4 rounded-xl border flex items-center gap-3 mb-6 ${message.type === 'success'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : 'bg-red-50 border-red-200 text-red-700'
                        }`}>
                        <span className="text-xl">{message.type === 'success' ? '✅' : '❌'}</span>
                        <p className="font-medium">{message.text}</p>
                    </div>
                )}

                {/* Profile Form */}
                <div className="bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl p-6 shadow-sm mb-6">
                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Profile Information</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    className="w-full h-12 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all"
                                    placeholder="Your full name"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full h-12 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all"
                                    placeholder="03XX-XXXXXXX"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Username</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={user.username}
                                    disabled
                                    className="w-full h-12 px-4 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-medium cursor-not-allowed"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400">Cannot change</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full h-14 bg-slate-900 text-white rounded-2xl font-bold text-base hover:bg-black transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-70"
                >
                    {saving ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>
                            <Save className="w-5 h-5" />
                            Save Changes
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
