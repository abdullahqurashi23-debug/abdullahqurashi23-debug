'use client';

import { io, Socket } from 'socket.io-client';
import { useEffect, useRef, useCallback } from 'react';
import { create } from 'zustand';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';

// Socket state store
interface SocketState {
    isConnected: boolean;
    connectionError: string | null;
    setConnected: (connected: boolean) => void;
    setConnectionError: (error: string | null) => void;
}

export const useSocketStore = create<SocketState>((set) => ({
    isConnected: false,
    connectionError: null,
    setConnected: (connected) => set({ isConnected: connected, connectionError: null }),
    setConnectionError: (error) => set({ connectionError: error }),
}));

// Singleton socket instance
let socket: Socket | null = null;
let heartbeatInterval: NodeJS.Timeout | null = null;

export function getSocket(): Socket {
    if (!socket) {
        socket = io(`${WS_URL}/pump`, {
            autoConnect: false,
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 2000,
            reconnectionDelayMax: 10000,
            timeout: 20000,
        });
    }
    return socket;
}

// Start heartbeat to keep connection alive
function startHeartbeat(s: Socket) {
    if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
    }
    heartbeatInterval = setInterval(() => {
        if (s.connected) {
            s.emit('heartbeat', { timestamp: Date.now() });
        }
    }, 30000); // Every 30 seconds
}

// Stop heartbeat
function stopHeartbeat() {
    if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
        heartbeatInterval = null;
    }
}

// Hook for using socket
export function useSocket() {
    const socketRef = useRef<Socket | null>(null);
    const { setConnected, setConnectionError } = useSocketStore();

    useEffect(() => {
        socketRef.current = getSocket();
        const s = socketRef.current;

        s.on('connect', () => {
            console.log('✅ Socket connected to server');
            setConnected(true);
            startHeartbeat(s);
        });

        s.on('disconnect', (reason) => {
            console.log('❌ Socket disconnected:', reason);
            setConnected(false);
            stopHeartbeat();
        });

        s.on('connect_error', (error) => {
            console.error('🔴 Socket connection error:', error.message);
            setConnectionError(error.message);
        });

        s.on('reconnect', (attemptNumber) => {
            console.log(`🔄 Socket reconnected after ${attemptNumber} attempts`);
            setConnected(true);
        });

        s.on('reconnect_attempt', (attemptNumber) => {
            console.log(`🔄 Attempting to reconnect... (attempt ${attemptNumber})`);
        });

        s.on('reconnect_failed', () => {
            console.error('🔴 Socket reconnection failed after all attempts');
            setConnectionError('Failed to reconnect to server');
        });

        return () => {
            s.off('connect');
            s.off('disconnect');
            s.off('connect_error');
            s.off('reconnect');
            s.off('reconnect_attempt');
            s.off('reconnect_failed');
            stopHeartbeat();
        };
    }, [setConnected, setConnectionError]);

    const connect = useCallback((userId: string, role: string, username: string) => {
        const s = socketRef.current;
        if (s && !s.connected) {
            console.log('🔌 Connecting socket for:', username, role);
            s.connect();
            // Wait for connection before registering
            s.once('connect', () => {
                s.emit('auth:register', { userId, role, username });
            });
            // If already connected (race condition), register immediately
            if (s.connected) {
                s.emit('auth:register', { userId, role, username });
            }
        } else if (s?.connected) {
            // Already connected, just re-register
            s.emit('auth:register', { userId, role, username });
        }
    }, []);

    const disconnect = useCallback(() => {
        const s = socketRef.current;
        if (s?.connected) {
            s.disconnect();
            stopHeartbeat();
        }
    }, []);

    return {
        socket: socketRef.current,
        connect,
        disconnect,
        isConnected: useSocketStore((state) => state.isConnected),
        connectionError: useSocketStore((state) => state.connectionError),
    };
}

// Hook for subscribing to specific events
export function useSocketEvent<T>(event: string, callback: (data: T) => void) {
    const socketRef = useRef<Socket | null>(null);
    const callbackRef = useRef(callback);
    
    // Keep callback ref updated
    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    useEffect(() => {
        socketRef.current = getSocket();
        const s = socketRef.current;

        const handler = (data: T) => {
            callbackRef.current(data);
        };

        s.on(event, handler);

        return () => {
            s.off(event, handler);
        };
    }, [event]);
}
