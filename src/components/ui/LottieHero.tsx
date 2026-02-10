'use client';

import { useEffect, useRef } from 'react';
import { Player } from '@lottiefiles/react-lottie-player';

interface LottieHeroProps {
    className?: string;
}

// AI/Neural Network animation - using a CDN-hosted Lottie
const LOTTIE_URL = 'https://assets10.lottiefiles.com/packages/lf20_UJNc2t.json'; // Neural network animation

export default function LottieHero({ className = '' }: LottieHeroProps) {
    const playerRef = useRef<Player>(null);

    // Check for reduced motion preference
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            if (prefersReducedMotion && playerRef.current) {
                playerRef.current.pause();
            }
        }
    }, []);

    return (
        <div className={`lottie-hero ${className}`}>
            <Player
                ref={playerRef}
                autoplay
                loop
                src={LOTTIE_URL}
                style={{ width: '100%', height: '100%' }}
                className="opacity-30 dark:opacity-20"
            />
        </div>
    );
}
