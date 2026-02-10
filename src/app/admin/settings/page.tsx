'use client';

import { useState, useRef } from 'react';
import { FiUser, FiMail, FiLinkedin, FiGithub, FiTwitter, FiGlobe, FiUpload, FiSave, FiCheck, FiPlus, FiX, FiImage, FiFileText, FiAward, FiLock, FiEye, FiEyeOff, FiShield } from 'react-icons/fi';
import Button from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';

export default function AdminSettingsPage() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);
    const [activeTab, setActiveTab] = useState<'profile' | 'about' | 'social' | 'security'>('profile');
    const [showCurrentPw, setShowCurrentPw] = useState(false);
    const [showNewPw, setShowNewPw] = useState(false);
    const [securityForm, setSecurityForm] = useState({ currentPassword: '', newEmail: '', newPassword: '', confirmPassword: '' });
    const [securityMsg, setSecurityMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>('/profile-placeholder.jpg');
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [newSkill, setNewSkill] = useState('');

    const [settings, setSettings] = useState({
        name: 'Emal Kamawal',
        title: 'AI Engineer & ML Researcher',
        email: 'emalkamawal@gmail.com',
        bio: 'M.S. in Artificial Intelligence and Data Analytics. Focused on Healthcare AI, Computer Vision, and Brain-Computer Interfaces.',
        profile_photo: '',
        linkedin: 'https://linkedin.com/in/emalkamawal',
        github: 'https://github.com/emalkamawal',
        twitter: '',
        website: '',
        google_scholar: '',
        cv_url: '/api/admin/upload-cv?download=1',
    });

    const [aboutContent, setAboutContent] = useState({
        headline: 'Building the Future of Healthcare AI',
        introduction: `I'm passionate about leveraging artificial intelligence to solve complex healthcare challenges. My research focuses on developing privacy-preserving machine learning systems, advanced computer vision algorithms for medical imaging, and brain-computer interfaces for assistive technologies.`,
        education: [
            { degree: 'M.S. in Artificial Intelligence', institution: 'Texas A&M University', year: '2024' },
            { degree: 'B.S. in Computer Science', institution: 'University of Engineering', year: '2021' },
        ],
        skills: ['Python', 'TensorFlow', 'PyTorch', 'Computer Vision', 'NLP', 'Healthcare AI', 'Medical Imaging', 'EEG/BCI', 'Federated Learning', 'Deep Learning'],
        interests: 'When not working on AI research, I enjoy hiking, reading science fiction, and contributing to open-source projects.',
    });

    const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPhotoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const addSkill = () => {
        if (newSkill.trim() && !aboutContent.skills.includes(newSkill.trim())) {
            setAboutContent({
                ...aboutContent,
                skills: [...aboutContent.skills, newSkill.trim()]
            });
            setNewSkill('');
        }
    };

    const removeSkill = (skill: string) => {
        setAboutContent({
            ...aboutContent,
            skills: aboutContent.skills.filter(s => s !== skill)
        });
    };

    const addEducation = () => {
        setAboutContent({
            ...aboutContent,
            education: [...aboutContent.education, { degree: '', institution: '', year: '' }]
        });
    };

    const updateEducation = (index: number, field: string, value: string) => {
        const updated = [...aboutContent.education];
        updated[index] = { ...updated[index], [field]: value };
        setAboutContent({ ...aboutContent, education: updated });
    };

    const removeEducation = (index: number) => {
        setAboutContent({
            ...aboutContent,
            education: aboutContent.education.filter((_, i) => i !== index)
        });
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            // Upload photo if selected
            if (photoFile) {
                const fileExt = photoFile.name.split('.').pop();
                const fileName = `profile-${Date.now()}.${fileExt}`;
                await supabase.storage.from('portfolio').upload(`profile/${fileName}`, photoFile);
            }

            // In production, save to settings table
            await new Promise(resolve => setTimeout(resolve, 500));
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (error) {
            console.error('Error saving settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'profile', label: 'Profile', icon: FiUser },
        { id: 'about', label: 'About Page', icon: FiFileText },
        { id: 'social', label: 'Social & Links', icon: FiGlobe },
        { id: 'security', label: 'Security', icon: FiShield },
    ];

    const handleCredentialUpdate = async () => {
        setSecurityMsg(null);
        if (!securityForm.currentPassword) {
            setSecurityMsg({ type: 'error', text: 'Current password is required' });
            return;
        }
        if (!securityForm.newEmail && !securityForm.newPassword) {
            setSecurityMsg({ type: 'error', text: 'Enter a new email or new password to update' });
            return;
        }
        if (securityForm.newPassword && securityForm.newPassword !== securityForm.confirmPassword) {
            setSecurityMsg({ type: 'error', text: 'New passwords do not match' });
            return;
        }
        if (securityForm.newPassword && securityForm.newPassword.length < 6) {
            setSecurityMsg({ type: 'error', text: 'Password must be at least 6 characters' });
            return;
        }
        setLoading(true);
        try {
            const res = await fetch('/api/admin/update-credentials', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: securityForm.currentPassword,
                    newEmail: securityForm.newEmail || undefined,
                    newPassword: securityForm.newPassword || undefined,
                }),
            });
            const data = await res.json();
            if (data.success) {
                setSecurityMsg({ type: 'success', text: '✅ Credentials updated! ' + (data.emailChanged ? 'Email changed. ' : '') + (data.passwordChanged ? 'Password changed. ' : '') + 'Please log in again with your new credentials.' });
                setSecurityForm({ currentPassword: '', newEmail: '', newPassword: '', confirmPassword: '' });
            } else {
                setSecurityMsg({ type: 'error', text: data.error });
            }
        } catch {
            setSecurityMsg({ type: 'error', text: 'Failed to update. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold mb-2">Settings</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">Manage your profile, About page content, and social links.</p>

            {saved && (
                <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 p-4 rounded-lg mb-6 flex items-center gap-2">
                    <FiCheck /> Settings saved successfully!
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 mb-8 border-b border-gray-200 dark:border-gray-700">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-4 py-3 font-medium transition border-b-2 -mb-px ${activeTab === tab.id
                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="space-y-8">
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                    <>
                        {/* Profile Photo */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                                <FiImage className="text-blue-500" /> Profile Photo
                            </h2>

                            <div className="flex items-center gap-8">
                                <div className="relative">
                                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 dark:border-gray-600 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20">
                                        {photoPreview ? (
                                            <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <FiUser className="text-4xl text-gray-400" />
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute bottom-0 right-0 p-2 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition"
                                    >
                                        <FiUpload size={16} />
                                    </button>
                                </div>
                                <div>
                                    <p className="font-medium mb-1">Upload a new photo</p>
                                    <p className="text-sm text-gray-500 mb-3">JPG, PNG. Max size 2MB</p>
                                    <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
                                        Choose File
                                    </Button>
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePhotoSelect}
                                    className="hidden"
                                />
                            </div>
                        </div>

                        {/* Basic Info */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                                <FiUser className="text-blue-500" /> Basic Information
                            </h2>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block font-medium mb-2">Full Name</label>
                                    <input
                                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
                                        value={settings.name}
                                        onChange={e => setSettings({ ...settings, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block font-medium mb-2">Professional Title</label>
                                    <input
                                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
                                        value={settings.title}
                                        onChange={e => setSettings({ ...settings, title: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block font-medium mb-2">Email</label>
                                    <div className="relative">
                                        <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <input
                                            className="w-full p-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
                                            value={settings.email}
                                            onChange={e => setSettings({ ...settings, email: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block font-medium mb-2">CV / Resume (PDF)</label>
                                    <div className="space-y-3">
                                        {/* Upload Area */}
                                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                            <div className="flex flex-col items-center justify-center pt-2 pb-3">
                                                <FiUpload className="w-8 h-8 mb-2 text-gray-400" />
                                                <p className="text-sm text-gray-500"><span className="font-semibold text-blue-500">Click to upload</span> your CV (PDF only, max 10MB)</p>
                                            </div>
                                            <input
                                                type="file"
                                                accept="application/pdf"
                                                className="hidden"
                                                onChange={async (e) => {
                                                    const file = e.target.files?.[0];
                                                    if (!file) return;
                                                    if (file.type !== 'application/pdf') {
                                                        alert('Only PDF files are accepted');
                                                        return;
                                                    }
                                                    setLoading(true);
                                                    try {
                                                        const formData = new FormData();
                                                        formData.append('cv', file);
                                                        const res = await fetch('/api/admin/upload-cv', {
                                                            method: 'POST',
                                                            body: formData,
                                                        });
                                                        const data = await res.json();
                                                        if (data.success) {
                                                            setSettings({ ...settings, cv_url: '/api/admin/upload-cv?download=1' });
                                                            setSaved(true);
                                                            setTimeout(() => setSaved(false), 3000);
                                                            alert('✅ CV uploaded successfully! (' + data.size + ')');
                                                        } else {
                                                            alert('Error: ' + data.error);
                                                        }
                                                    } catch (err) {
                                                        alert('Upload failed. Please try again.');
                                                    } finally {
                                                        setLoading(false);
                                                    }
                                                }}
                                            />
                                        </label>
                                        {/* Current CV Status */}
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <FiFileText className="text-red-500" />
                                            <span>Current: <a href="/api/admin/upload-cv?download=1" target="_blank" className="text-blue-500 hover:underline font-medium">cv.pdf</a></span>
                                            <span className="text-gray-400">• Visitors can download from the header CV button</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block font-medium mb-2">Short Bio (for header/hero)</label>
                                    <textarea
                                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
                                        value={settings.bio}
                                        onChange={e => setSettings({ ...settings, bio: e.target.value })}
                                        rows={3}
                                    />
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* About Page Tab */}
                {activeTab === 'about' && (
                    <>
                        {/* About Content */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                                <FiFileText className="text-blue-500" /> About Page Content
                            </h2>

                            <div className="space-y-6">
                                <div>
                                    <label className="block font-medium mb-2">Page Headline</label>
                                    <input
                                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
                                        value={aboutContent.headline}
                                        onChange={e => setAboutContent({ ...aboutContent, headline: e.target.value })}
                                        placeholder="Building the Future of Healthcare AI"
                                    />
                                </div>
                                <div>
                                    <label className="block font-medium mb-2">Introduction</label>
                                    <textarea
                                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
                                        value={aboutContent.introduction}
                                        onChange={e => setAboutContent({ ...aboutContent, introduction: e.target.value })}
                                        rows={5}
                                        placeholder="Write a detailed introduction about yourself..."
                                    />
                                </div>
                                <div>
                                    <label className="block font-medium mb-2">Personal Interests</label>
                                    <textarea
                                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
                                        value={aboutContent.interests}
                                        onChange={e => setAboutContent({ ...aboutContent, interests: e.target.value })}
                                        rows={2}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Skills */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                                <FiAward className="text-blue-500" /> Skills & Expertise
                            </h2>

                            <div className="mb-4">
                                <div className="flex gap-2">
                                    <input
                                        className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
                                        value={newSkill}
                                        onChange={e => setNewSkill(e.target.value)}
                                        placeholder="Add a skill..."
                                        onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                                    />
                                    <Button onClick={addSkill} variant="secondary">
                                        <FiPlus />
                                    </Button>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {aboutContent.skills.map(skill => (
                                    <span key={skill} className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm">
                                        {skill}
                                        <button onClick={() => removeSkill(skill)} className="hover:text-red-500 ml-1">
                                            <FiX size={14} />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Education */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                            <h2 className="text-lg font-bold mb-6 flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <FiAward className="text-blue-500" /> Education
                                </span>
                                <Button variant="secondary" onClick={addEducation}>
                                    <FiPlus className="mr-1" /> Add
                                </Button>
                            </h2>

                            <div className="space-y-4">
                                {aboutContent.education.map((edu, index) => (
                                    <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                        <div className="grid md:grid-cols-3 gap-4">
                                            <input
                                                className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900"
                                                value={edu.degree}
                                                onChange={e => updateEducation(index, 'degree', e.target.value)}
                                                placeholder="Degree"
                                            />
                                            <input
                                                className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900"
                                                value={edu.institution}
                                                onChange={e => updateEducation(index, 'institution', e.target.value)}
                                                placeholder="Institution"
                                            />
                                            <div className="flex gap-2">
                                                <input
                                                    className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900"
                                                    value={edu.year}
                                                    onChange={e => updateEducation(index, 'year', e.target.value)}
                                                    placeholder="Year"
                                                />
                                                <button onClick={() => removeEducation(index)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded">
                                                    <FiX />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {/* Social Links Tab */}
                {activeTab === 'social' && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <FiGlobe className="text-blue-500" /> Social Links
                        </h2>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block font-medium mb-2">LinkedIn</label>
                                <div className="relative">
                                    <FiLinkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        className="w-full p-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
                                        value={settings.linkedin}
                                        onChange={e => setSettings({ ...settings, linkedin: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block font-medium mb-2">GitHub</label>
                                <div className="relative">
                                    <FiGithub className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        className="w-full p-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
                                        value={settings.github}
                                        onChange={e => setSettings({ ...settings, github: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block font-medium mb-2">X / Twitter</label>
                                <div className="relative">
                                    <FiTwitter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        className="w-full p-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
                                        value={settings.twitter}
                                        onChange={e => setSettings({ ...settings, twitter: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block font-medium mb-2">Personal Website</label>
                                <div className="relative">
                                    <FiGlobe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        className="w-full p-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
                                        value={settings.website}
                                        onChange={e => setSettings({ ...settings, website: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block font-medium mb-2">Google Scholar</label>
                                <input
                                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
                                    value={settings.google_scholar}
                                    onChange={e => setSettings({ ...settings, google_scholar: e.target.value })}
                                    placeholder="https://scholar.google.com/citations?user=..."
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <h2 className="text-xl font-semibold mb-1 flex items-center gap-2">
                            <FiLock className="text-orange-500" /> Login Credentials
                        </h2>
                        <p className="text-gray-500 text-sm mb-6">Change your admin email and/or password. You&apos;ll need to enter your current password to confirm.</p>

                        {securityMsg && (
                            <div className={`p-4 rounded-lg mb-6 text-sm ${securityMsg.type === 'success'
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                }`}>
                                {securityMsg.text}
                            </div>
                        )}

                        <div className="space-y-5 max-w-lg">
                            {/* Current Password */}
                            <div>
                                <label className="block font-medium mb-2 text-sm">Current Password <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type={showCurrentPw ? 'text' : 'password'}
                                        className="w-full p-3 pl-10 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
                                        value={securityForm.currentPassword}
                                        onChange={e => setSecurityForm({ ...securityForm, currentPassword: e.target.value })}
                                        placeholder="Enter current password"
                                    />
                                    <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                        {showCurrentPw ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <hr className="border-gray-200 dark:border-gray-700" />

                            {/* New Email */}
                            <div>
                                <label className="block font-medium mb-2 text-sm">New Email</label>
                                <div className="relative">
                                    <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="email"
                                        className="w-full p-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
                                        value={securityForm.newEmail}
                                        onChange={e => setSecurityForm({ ...securityForm, newEmail: e.target.value })}
                                        placeholder="Leave blank to keep current email"
                                    />
                                </div>
                            </div>

                            {/* New Password */}
                            <div>
                                <label className="block font-medium mb-2 text-sm">New Password</label>
                                <div className="relative">
                                    <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type={showNewPw ? 'text' : 'password'}
                                        className="w-full p-3 pl-10 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
                                        value={securityForm.newPassword}
                                        onChange={e => setSecurityForm({ ...securityForm, newPassword: e.target.value })}
                                        placeholder="Min. 6 characters"
                                    />
                                    <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                        {showNewPw ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="block font-medium mb-2 text-sm">Confirm New Password</label>
                                <div className="relative">
                                    <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type={showNewPw ? 'text' : 'password'}
                                        className="w-full p-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
                                        value={securityForm.confirmPassword}
                                        onChange={e => setSecurityForm({ ...securityForm, confirmPassword: e.target.value })}
                                        placeholder="Re-enter new password"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleCredentialUpdate}
                                disabled={loading}
                                className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                <FiShield size={18} />
                                {loading ? 'Updating...' : 'Update Credentials'}
                            </button>

                            <p className="text-xs text-gray-400 text-center">You will need to log in again after changing your credentials.</p>
                        </div>
                    </div>
                )}

                {/* Save Button */}
                <div className="flex justify-end">
                    <Button onClick={handleSave} className="flex items-center gap-2" disabled={loading}>
                        <FiSave />
                        {loading ? 'Saving...' : 'Save All Settings'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
