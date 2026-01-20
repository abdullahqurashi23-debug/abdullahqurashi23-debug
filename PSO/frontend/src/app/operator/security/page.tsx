'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import { api } from '@/lib/api';
import { ArrowLeft, Lock, Eye, EyeOff, Shield, Check } from 'lucide-react';

export default function OperatorSecurityPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [saving, setSaving] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const handleChangePassword = async () => {
        if (formData.newPassword !== formData.confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match' });
            return;
        }

        if (formData.newPassword.length < 6) {
            setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
            return;
        }

        setSaving(true);
        try {
            await api.changePassword({
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword,
            });
            setMessage({ type: 'success', text: 'Password changed successfully!' });
            setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Failed to change password' });
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
                        <h1 className="text-xl font-bold text-slate-900">Security</h1>
                        <p className="text-sm text-slate-500">Manage your password</p>
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

                {/* Security Info */}
                <div className="bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl p-6 shadow-sm mb-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
                            <Shield className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                            <h2 className="font-bold text-slate-900">Account Security</h2>
                            <p className="text-sm text-slate-500">Last login: Recently</p>
                        </div>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
                            <Check className="w-4 h-4" />
                            Your account is secured
                        </div>
                    </div>
                </div>

                {/* Change Password Form */}
                <div className="bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl p-6 shadow-sm mb-6">
                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Change Password</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Current Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type={showCurrentPassword ? 'text' : 'password'}
                                    value={formData.currentPassword}
                                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                                    className="w-full h-12 pl-12 pr-12 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all"
                                    placeholder="Enter current password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">New Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type={showNewPassword ? 'text' : 'password'}
                                    value={formData.newPassword}
                                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                    className="w-full h-12 pl-12 pr-12 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all"
                                    placeholder="Enter new password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Confirm New Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    className="w-full h-12 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all"
                                    placeholder="Confirm new password"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <button
                    onClick={handleChangePassword}
                    disabled={saving || !formData.currentPassword || !formData.newPassword || !formData.confirmPassword}
                    className="w-full h-14 bg-slate-900 text-white rounded-2xl font-bold text-base hover:bg-black transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {saving ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>
                            <Lock className="w-5 h-5" />
                            Change Password
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
