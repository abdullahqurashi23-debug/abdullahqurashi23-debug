'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, MessageCircle, Phone, Mail, FileText, ExternalLink } from 'lucide-react';

export default function OperatorHelpPage() {
    const router = useRouter();

    const helpItems = [
        {
            icon: FileText,
            title: 'User Guide',
            description: 'Learn how to use the app',
            action: () => alert('User guide coming soon!'),
        },
        {
            icon: MessageCircle,
            title: 'Contact Admin',
            description: 'Send a message to admin',
            action: () => router.push('/operator/messages'),
        },
        {
            icon: Phone,
            title: 'Call Support',
            description: 'Speak with support team',
            action: () => window.location.href = 'tel:+923001234567',
        },
    ];

    const faqItems = [
        {
            question: 'How do I record a sale?',
            answer: 'Tap the Sale button at the bottom, select fuel type, enter the amount, choose payment method, and confirm.',
        },
        {
            question: 'How do I request a break?',
            answer: 'Go to the Break page from your dashboard, select break duration, and submit the request. Admin will be notified.',
        },
        {
            question: 'What should I do if I make a mistake?',
            answer: 'Contact your admin immediately through the Messages section. They can help correct any errors.',
        },
        {
            question: 'How do I end my shift?',
            answer: 'Tap "End Shift" from the dashboard, enter your closing cash amount, and confirm. Make sure all sales are recorded first.',
        },
    ];

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
                        <h1 className="text-xl font-bold text-slate-900">Help & Support</h1>
                        <p className="text-sm text-slate-500">Get assistance</p>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl p-4 shadow-sm mb-6">
                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Quick Actions</h2>
                    <div className="space-y-2">
                        {helpItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <button
                                    key={item.title}
                                    onClick={item.action}
                                    className="w-full flex items-center gap-4 p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center">
                                        <Icon className="w-5 h-5 text-slate-600" />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className="font-bold text-slate-900">{item.title}</p>
                                        <p className="text-sm text-slate-500">{item.description}</p>
                                    </div>
                                    <ExternalLink className="w-4 h-4 text-slate-400" />
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* FAQ */}
                <div className="bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl p-4 shadow-sm">
                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                        {faqItems.map((item, index) => (
                            <div key={index} className="p-4 bg-slate-50 rounded-xl">
                                <h3 className="font-bold text-slate-900 mb-2">{item.question}</h3>
                                <p className="text-sm text-slate-600 leading-relaxed">{item.answer}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Version */}
                <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest opacity-60 mt-8">
                    PSO Pump Manager v1.0.0
                </p>
            </div>
        </div>
    );
}
