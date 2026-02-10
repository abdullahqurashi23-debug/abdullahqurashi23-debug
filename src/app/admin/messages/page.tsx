'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { FiMail, FiTrash2, FiCheck, FiX, FiSearch, FiFilter, FiRefreshCw, FiInbox, FiStar, FiClock, FiUser, FiBriefcase } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
    id: string;
    name: string;
    email: string;
    company: string | null;
    subject: string;
    message: string;
    is_read: boolean;
    is_starred: boolean;
    created_at: string;
}

export default function AdminMessagesPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<'all' | 'unread' | 'starred'>('all');
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('contact_messages')
            .select('*')
            .order('created_at', { ascending: false });

        if (data) setMessages(data);
        setLoading(false);
    };

    const markAsRead = async (id: string, isRead: boolean) => {
        await supabase.from('contact_messages').update({ is_read: isRead }).eq('id', id);
        setMessages(messages.map(m => m.id === id ? { ...m, is_read: isRead } : m));
        if (selectedMessage?.id === id) {
            setSelectedMessage({ ...selectedMessage, is_read: isRead });
        }
    };

    const toggleStar = async (id: string, isStarred: boolean) => {
        await supabase.from('contact_messages').update({ is_starred: !isStarred }).eq('id', id);
        setMessages(messages.map(m => m.id === id ? { ...m, is_starred: !isStarred } : m));
    };

    const deleteMessage = async (id: string) => {
        if (!confirm('Delete this message?')) return;
        await supabase.from('contact_messages').delete().eq('id', id);
        setMessages(messages.filter(m => m.id !== id));
        if (selectedMessage?.id === id) setSelectedMessage(null);
    };

    const openMessage = async (msg: Message) => {
        setSelectedMessage(msg);
        if (!msg.is_read) {
            markAsRead(msg.id, true);
        }
    };

    const filteredMessages = messages.filter(m => {
        const matchesSearch =
            m.name.toLowerCase().includes(search.toLowerCase()) ||
            m.email.toLowerCase().includes(search.toLowerCase()) ||
            m.subject?.toLowerCase().includes(search.toLowerCase()) ||
            m.message.toLowerCase().includes(search.toLowerCase());
        const matchesFilter =
            filter === 'all' ||
            (filter === 'unread' && !m.is_read) ||
            (filter === 'starred' && m.is_starred);
        return matchesSearch && matchesFilter;
    });

    const unreadCount = messages.filter(m => !m.is_read).length;
    const starredCount = messages.filter(m => m.is_starred).length;

    const formatDate = (date: string) => {
        const d = new Date(date);
        const now = new Date();
        const diff = now.getTime() - d.getTime();
        const days = Math.floor(diff / 86400000);

        if (days === 0) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        if (days === 1) return 'Yesterday';
        if (days < 7) return d.toLocaleDateString([], { weekday: 'short' });
        return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    return (
        <div className="h-[calc(100vh-4rem)] flex">
            {/* Sidebar - Message List */}
            <div className="w-full md:w-96 border-r border-gray-200 dark:border-gray-700 flex flex-col bg-white dark:bg-gray-800">
                {/* Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-xl font-bold flex items-center gap-2">
                            <FiInbox /> Inbox
                            {unreadCount > 0 && (
                                <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">{unreadCount}</span>
                            )}
                        </h1>
                        <button onClick={fetchMessages} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                            <FiRefreshCw className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>

                    {/* Search */}
                    <div className="relative mb-3">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search messages..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm"
                        />
                    </div>

                    {/* Filters */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilter('all')}
                            className={`flex-1 py-2 text-sm rounded-lg ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
                        >
                            All ({messages.length})
                        </button>
                        <button
                            onClick={() => setFilter('unread')}
                            className={`flex-1 py-2 text-sm rounded-lg ${filter === 'unread' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
                        >
                            Unread ({unreadCount})
                        </button>
                        <button
                            onClick={() => setFilter('starred')}
                            className={`flex-1 py-2 text-sm rounded-lg ${filter === 'starred' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
                        >
                            Starred ({starredCount})
                        </button>
                    </div>
                </div>

                {/* Message List */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="p-8 text-center text-gray-500">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
                        </div>
                    ) : filteredMessages.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            <FiMail className="mx-auto text-3xl mb-3 opacity-50" />
                            <p>No messages found</p>
                        </div>
                    ) : (
                        <AnimatePresence>
                            {filteredMessages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    onClick={() => openMessage(msg)}
                                    className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer transition-colors ${selectedMessage?.id === msg.id
                                            ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-600'
                                            : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                        } ${!msg.is_read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${!msg.is_read ? 'bg-blue-600' : 'bg-gray-400'
                                            }`}>
                                            {msg.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <p className={`font-medium truncate ${!msg.is_read ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                                                    {msg.name}
                                                </p>
                                                <span className="text-xs text-gray-400 ml-2">{formatDate(msg.created_at)}</span>
                                            </div>
                                            <p className={`text-sm truncate ${!msg.is_read ? 'font-medium' : 'text-gray-500'}`}>
                                                {msg.subject || 'No subject'}
                                            </p>
                                            <p className="text-xs text-gray-400 truncate mt-1">{msg.message}</p>
                                        </div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); toggleStar(msg.id, msg.is_starred); }}
                                            className={`p-1 rounded ${msg.is_starred ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-500'}`}
                                        >
                                            <FiStar fill={msg.is_starred ? 'currentColor' : 'none'} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>
            </div>

            {/* Message Detail */}
            <div className="hidden md:flex flex-1 flex-col bg-gray-50 dark:bg-gray-900">
                {selectedMessage ? (
                    <>
                        {/* Message Header */}
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                        {selectedMessage.subject || 'No subject'}
                                    </h2>
                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <FiUser /> {selectedMessage.name}
                                        </span>
                                        <span>{selectedMessage.email}</span>
                                        {selectedMessage.company && (
                                            <span className="flex items-center gap-1">
                                                <FiBriefcase /> {selectedMessage.company}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-400 flex items-center gap-1">
                                        <FiClock /> {new Date(selectedMessage.created_at).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Message Body */}
                        <div className="flex-1 p-6 overflow-y-auto">
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                                    {selectedMessage.message}
                                </p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex gap-3">
                            <a
                                href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject || 'Your message'}`}
                                className="btn btn-primary flex-1 flex items-center justify-center gap-2"
                            >
                                <FiMail /> Reply
                            </a>
                            <button
                                onClick={() => markAsRead(selectedMessage.id, !selectedMessage.is_read)}
                                className="btn btn-secondary flex items-center gap-2"
                            >
                                {selectedMessage.is_read ? <FiX /> : <FiCheck />}
                                {selectedMessage.is_read ? 'Mark Unread' : 'Mark Read'}
                            </button>
                            <button
                                onClick={() => deleteMessage(selectedMessage.id)}
                                className="btn btn-secondary text-red-500 flex items-center gap-2"
                            >
                                <FiTrash2 /> Delete
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-400">
                        <div className="text-center">
                            <FiMail className="mx-auto text-5xl mb-4 opacity-30" />
                            <p>Select a message to view</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
