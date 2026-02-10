'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { FiLock, FiExternalLink, FiGithub } from 'react-icons/fi';

// Dynamically import the GitHubRepoCard to avoid SSR issues
const GitHubRepoCard = dynamic(() => import('@/components/ui/GitHubRepoCard'), {
    ssr: false,
    loading: () => (
        <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 animate-pulse">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                <div className="flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                </div>
            </div>
        </div>
    )
});

interface ProjectGitHubSectionProps {
    githubLink: string | null;
    visibility: 'public' | 'gated' | 'nda';
    projectSlug?: string;
}

export default function ProjectGitHubSection({ githubLink, visibility, projectSlug }: ProjectGitHubSectionProps) {
    // For PUBLIC projects - show GitHub link if available, otherwise don't show the section at all
    if (visibility === 'public') {
        if (githubLink) {
            return (
                <div className="space-y-4">
                    <h3 className="font-bold">Repository</h3>
                    <GitHubRepoCard
                        repoUrl={githubLink}
                        variant="compact"
                        showReadme={false}
                    />
                </div>
            );
        }
        // No GitHub link for public project - don't show anything
        return null;
    }

    // For GATED projects - show request access card
    if (visibility === 'gated') {
        return (
            <div className="p-6 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                <h3 className="font-bold mb-4 flex items-center gap-2 text-amber-800 dark:text-amber-300">
                    <FiLock /> Source Code
                </h3>
                <p className="text-sm text-amber-700 dark:text-amber-400 mb-4">
                    This repository requires approved access. Request access to view the source code.
                </p>
                <Link
                    href={`/gated/${projectSlug || 'request'}`}
                    className="inline-flex items-center gap-2 text-sm text-amber-700 dark:text-amber-300 hover:text-amber-800 dark:hover:text-amber-200 font-medium"
                >
                    Request access →
                </Link>
            </div>
        );
    }

    // For NDA projects - show private indicator
    if (visibility === 'nda') {
        return (
            <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                    <FiLock className="text-red-500" /> Source Code
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    This project is under NDA. Source code is not available for public access.
                </p>
            </div>
        );
    }

    return null;
}
