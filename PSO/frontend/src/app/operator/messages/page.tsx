'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MessageSquare, Check, AlertTriangle, Info, Target, Bell } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/auth';
import { useSocketEvent } from '@/lib/socket';

interface Message {
    id: string;
    type: 'urgent' | 'info' | 'target' | 'general';
    title: string;
    content: string;
    timestamp: Date;
    isRead: boolean;
    sender?: { fullName: string };
}

export default function MessagesPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchMessages = useCallback(async () => {
        if (!user?.id) return;
        try {
            const data = await api.getMessages(user.id);
            const formatted: Message[] = data.map((m: any) => ({
                id: m.id,
                type: m.content.toLowerCase().includes('urgent') ? 'urgent' :
                    m.content.toLowerCase().includes('target') ? 'target' : 'info',
                title: m.sender?.fullName || 'Admin Message',
                content: m.content,
                timestamp: new Date(m.createdAt),
                isRead: m.isRead,
                sender: m.sender
            }));
            setMessages(formatted);
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

    // Real-time listener
    useSocketEvent('message:new', (newMessage: any) => {
        const formatted: Message = {
            id: newMessage.id,
            type: newMessage.content.toLowerCase().includes('urgent') ? 'urgent' :
                newMessage.content.toLowerCase().includes('target') ? 'target' : 'info',
            title: newMessage.sender?.fullName || 'New Message',
            content: newMessage.content,
            timestamp: new Date(newMessage.createdAt),
            isRead: false,
            sender: newMessage.sender
        };
        setMessages(prev => [formatted, ...prev]);

        // Optional: Play sound or vibrate
        if (navigator.vibrate) navigator.vibrate(200);
    });

    const unreadCount = messages.filter(m => !m.isRead).length;

    const markAsRead = async (id: string) => {
        // Optimistic update
        setMessages(prev => prev.map(m =>
            m.id === id ? { ...m, isRead: true } : m
        ));
        try {
            await api.markMessageRead(id);
        } catch (error) {
            console.error('Failed to mark read:', error);
        }
    };

    const markAllAsRead = async () => {
        const unreadIds = messages.filter(m => !m.isRead).map(m => m.id);
        // Optimistic
        setMessages(prev => prev.map(m => ({ ...m, isRead: true })));

        try {
            await Promise.all(unreadIds.map(id => api.markMessageRead(id)));
        } catch (error) {
            console.error('Failed to mark all read:', error);
        }
    };

    const formatTimestamp = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));

        if (hours < 1) {
            const mins = Math.floor(diff / (1000 * 60));
            return `${mins} min ago`;
        }
        if (hours < 24) {
            return `${hours}h ago`;
        }
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen pb-32 pt-4 px-4 font-sans text-slate-900 bg-slate-50">
            {/* Background Pattern */}
            <div className="fixed inset-0 z-0 opacity-[0.6] pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(#cbd5e1 1.5px, transparent 1.5px), radial-gradient(#cbd5e1 1.5px, transparent 1.5px)',
                    backgroundSize: '24px 24px',
                    backgroundPosition: '0 0, 12px 12px'
                }}>
            </div>

            <div className="relative z-10 max-w-lg mx-auto animate-in fade-in zoom-in-95 duration-500">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 active:scale-95 transition-all"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Messages</h1>
                            {unreadCount > 0 && (
                                <p className="text-xs font-bold text-orange-500 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
                                    {unreadCount} Unread
                                </p>
                            )}
                        </div>
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50 active:scale-95 transition-all shadow-sm"
                        >
                            Mark all read
                        </button>
                    )}
                </div>

                {/* Messages List */}
                <div className="space-y-3">
                    {messages.map((message) => {
                        const Icon = message.type === 'urgent' ? AlertTriangle : message.type === 'info' ? Info : message.type === 'target' ? Target : MessageSquare;
                        const iconColor = message.type === 'urgent' ? 'text-red-500 bg-red-50' : message.type === 'info' ? 'text-blue-500 bg-blue-50' : message.type === 'target' ? 'text-orange-500 bg-orange-50' : 'text-slate-500 bg-slate-100';

                        return (
                            <div
                                key={message.id}
                                onClick={() => markAsRead(message.id)}
                                className={`relative p-5 rounded-2xl border transition-all duration-300 cursor-pointer group ${!message.isRead
                                    ? 'bg-white shadow-lg shadow-slate-200/50 border-slate-200 scale-[1.01]'
                                    : 'bg-white/60 border-transparent hover:bg-white hover:border-slate-200'
                                    }`}
                            >
                                {/* Unread Indicator */}
                                {!message.isRead && (
                                    <div className="absolute top-5 right-5 w-2 h-2 rounded-full bg-orange-500 animate-pulse shadow-sm shadow-orange-500/50"></div>
                                )}

                                <div className="flex gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center ${iconColor}`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-1 pr-4">
                                            <h3 className={`font-bold text-sm leading-tight ${!message.isRead ? 'text-slate-900' : 'text-slate-600'}`}>
                                                {message.title}
                                            </h3>
                                        </div>
                                        <p className={`text-sm mb-3 leading-relaxed whitespace-pre-wrap ${!message.isRead ? 'text-slate-600 font-medium' : 'text-slate-500'}`}>
                                            {message.content}
                                        </p>

                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                                                {formatTimestamp(message.timestamp)}
                                            </span>

                                            {!message.isRead && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        markAsRead(message.id);
                                                    }}
                                                    className="flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg hover:bg-slate-200 transition-colors"
                                                >
                                                    <Check className="w-3 h-3" />
                                                    Mark Read
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Empty State */}
                {messages.length === 0 && (
                    <div className="text-center py-16">
                        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 border border-slate-200 rotate-3 shadow-lg shadow-slate-200/50">
                            <Bell className="w-10 h-10 text-slate-300" />
                        </div>
                        <p className="font-bold text-slate-900 text-lg">No new messages</p>
                        <p className="text-slate-500 mt-1">You're all caught up!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
