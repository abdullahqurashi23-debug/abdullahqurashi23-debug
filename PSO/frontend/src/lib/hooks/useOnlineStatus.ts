'use client';

import { useState, useEffect, useCallback } from 'react';

export function useOnlineStatus() {
    const [isOnline, setIsOnline] = useState(true);
    const [wasOffline, setWasOffline] = useState(false);

    useEffect(() => {
        // Set initial state
        if (typeof navigator !== 'undefined') {
            setIsOnline(navigator.onLine);
        }

        const handleOnline = () => {
            console.log('🌐 Connection restored');
            setIsOnline(true);
            if (!isOnline) {
                setWasOffline(true);
                // Reset wasOffline after a short delay
                setTimeout(() => setWasOffline(false), 5000);
            }
        };

        const handleOffline = () => {
            console.log('📴 Connection lost');
            setIsOnline(false);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [isOnline]);

    // Force check connection by making a small request
    const checkConnection = useCallback(async (): Promise<boolean> => {
        try {
            const response = await fetch('/api/health', {
                method: 'HEAD',
                cache: 'no-store',
            });
            const online = response.ok;
            setIsOnline(online);
            return online;
        } catch {
            setIsOnline(false);
            return false;
        }
    }, []);

    return {
        isOnline,
        wasOffline, // True briefly when coming back online
        checkConnection,
    };
}
