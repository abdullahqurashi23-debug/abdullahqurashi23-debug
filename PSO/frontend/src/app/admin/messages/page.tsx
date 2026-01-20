'use client';

import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { useSocketEvent } from '@/lib/socket';
import { useAuthStore } from '@/lib/auth';
import { Search, Send, User, Circle, Clock, Check, MoreVertical, Phone } from 'lucide-react';

interface Operator {
    id: string;
    fullName: string;
    username: string;
    status: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
    isOnline?: boolean;
    lastSeen?: Date;
    unreadCount?: number;
}

interface Message {
    id: string;
    content: string;
    senderId: string;
    receiverId: string;
    createdAt: string;
    isRead: boolean;
    sender: {
        id: string;
        fullName: string;
        role: string;
    };
}

export default function AdminMessagesPage() {
    const { user } = useAuthStore();
    const [operators, setOperators] = useState<Operator[]>([]);
    const [selectedOperator, setSelectedOperator] = useState<Operator | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [sending, setSending] = useState(false);

    // Fetch operators on mount
    useEffect(() => {
        const fetchOperators = async () => {
            try {
                const data = await api.getOperators();
                // Add dummy online status/unread for design
                const mapped = data.map((op: any) => ({
                    ...op,
                    isOnline: Math.random() > 0.5, // Mock for now, socket should provide real data
                    unreadCount: 0
                }));
                setOperators(mapped);
                if (mapped.length > 0) {
                    // setSelectedOperator(mapped[0]); Do not auto-select to keep empty state clean
                }
            } catch (error) {
                console.error('Failed to fetch operators:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchOperators();
    }, []);

    // Fetch conversation when operator selected
    useEffect(() => {
        const fetchConversation = async () => {
            if (!selectedOperator || !user?.id) return;
            try {
                const data = await api.getConversation(user.id, selectedOperator.id);
                setMessages(data);
                scrollToBottom();
            } catch (error) {
                console.error('Failed to fetch conversation:', error);
            }
        };
        fetchConversation();
    }, [selectedOperator, user?.id]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Real-time updates
    useSocketEvent('message:new', (newMsg: any) => {
        // If message belongs to current conversation
        if (selectedOperator && (
            (newMsg.senderId === selectedOperator.id) ||
            (newMsg.receiverId === selectedOperator.id && newMsg.senderId === user?.id)
        )) {
            setMessages(prev => [...prev, newMsg]);
            scrollToBottom();
        } else {
            // Update unread count for other operators (logic needed here)
        }
    });

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedOperator || !user?.id || sending) return;

        setSending(true);
        try {
            // Use API to send
            await api.sendMessage({
                senderId: user.id,
                receiverId: selectedOperator.id,
                content: newMessage
            });

            // Optimistic update done by socket usually, but for instant feel:
            const optimisticMsg: Message = {
                id: Date.now().toString(),
                content: newMessage,
                senderId: user.id,
                receiverId: selectedOperator.id,
                createdAt: new Date().toISOString(),
                isRead: false,
                sender: { id: user.id, fullName: user.fullName || 'Me', role: 'ADMIN' }
            };
            setMessages(prev => [...prev, optimisticMsg]);
            setNewMessage('');
            scrollToBottom();
        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            setSending(false);
        }
    };

    const formatTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="flex h-[calc(100vh-var(--header-height))] bg-slate-50 overflow-hidden">
            {/* Sidebar - Operators List */}
            <div className="w-80 border-r border-slate-200 bg-white flex flex-col z-10 shadow-sm">
                <div className="p-4 border-b border-slate-100">
                    <h2 className="text-lg font-bold text-slate-900 mb-4 tracking-tight">Messages</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search operators..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-slate-900 transition-all placeholder:text-slate-400"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {loading ? (
                        <div className="flex justify-center p-4"><div className="w-6 h-6 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div></div>
                    ) : (
                        operators.map(operator => (
                            <button
                                key={operator.id}
                                onClick={() => setSelectedOperator(operator)}
                                className={`w-full p-3 flex items-center gap-3 rounded-xl transition-all ${selectedOperator?.id === operator.id
                                    ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10'
                                    : 'hover:bg-slate-50 text-slate-600'
                                    }`}
                            >
                                <div className="relative">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${selectedOperator?.id === operator.id ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-500'
                                        }`}>
                                        {operator.fullName.charAt(0)}
                                    </div>
                                    {operator.isOnline && (
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
                                    )}
                                </div>
                                <div className="text-left flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-0.5">
                                        <span className={`font-bold text-sm truncate ${selectedOperator?.id === operator.id ? 'text-white' : 'text-slate-900'}`}>
                                            {operator.fullName}
                                        </span>
                                        {/* Time stub */}
                                        <span className={`text-[10px] ${selectedOperator?.id === operator.id ? 'text-slate-400' : 'text-slate-400'}`}>
                                            12:30
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className={`text-xs truncate ${selectedOperator?.id === operator.id ? 'text-slate-300' : 'text-slate-500'}`}>
                                            Start typing to chat...
                                        </p>
                                        {((operator.unreadCount || 0) > 0) && (
                                            <span className="min-w-[18px] h-[18px] flex items-center justify-center bg-orange-500 text-white text-[10px] font-bold rounded-full px-1">
                                                {operator.unreadCount}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-[#F8FAFC]"> {/* Slate-50/100ish */}
                {selectedOperator ? (
                    <>
                        {/* Chat Header */}
                        <div className="h-16 px-6 border-b border-slate-200 bg-white/80 backdrop-blur-md flex items-center justify-between shadow-sm z-10">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold">
                                        {selectedOperator.fullName.charAt(0)}
                                    </div>
                                    {selectedOperator.isOnline && (
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 text-sm leading-tight">{selectedOperator.fullName}</h3>
                                    <p className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                                        {selectedOperator.isOnline ? 'Online' : 'Offline'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">
                                    <Phone className="w-5 h-5" />
                                </button>
                                <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">
                                    <MoreVertical className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6" style={{ backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
                            <div className="text-center py-4">
                                <span className="bg-slate-100 text-slate-500 text-xs font-bold px-3 py-1 rounded-full border border-slate-200">
                                    Today
                                </span>
                            </div>

                            {messages.map((message, index) => {
                                const isMe = message.senderId === user?.id;
                                return (
                                    <div key={message.id || index} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                                        <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                                            <div className={`
                                                relative px-4 py-3 rounded-2xl shadow-sm text-sm leading-relaxed
                                                ${isMe
                                                    ? 'bg-slate-900 text-white rounded-br-none'
                                                    : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                                                }
                                            `}>
                                                {message.content}
                                            </div>
                                            <div className="flex items-center gap-1 mt-1 px-1">
                                                <span className="text-[10px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {message.createdAt && formatTime(message.createdAt)}
                                                </span>
                                                {isMe && (
                                                    <span className="text-slate-400">
                                                        {message.isRead ? <Check className="w-3 h-3 text-emerald-500" /> : <Check className="w-3 h-3" />}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t border-slate-200">
                            <form onSubmit={handleSendMessage} className="relative flex items-center gap-2 max-w-4xl mx-auto">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 h-12 pl-4 pr-12 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all font-medium text-slate-900 placeholder:text-slate-400"
                                    disabled={sending}
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim() || sending}
                                    className="absolute right-2 p-2 bg-slate-900 text-white rounded-lg hover:bg-black hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-all shadow-lg shadow-slate-900/20"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    // Empty State
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-[#F8FAFC]">
                        <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-slate-200/50 border border-slate-100 rotate-3">
                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center">
                                <User className="w-8 h-8 text-slate-300" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">Select an Operator</h2>
                        <p className="text-slate-500 max-w-xs font-medium">
                            Choose an operator from the sidebar to view sales activity, alerts, or start a conversation.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
