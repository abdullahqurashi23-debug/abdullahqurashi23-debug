'use client';

import { useState, useEffect } from 'react';
import { FiStar, FiGitBranch, FiClock, FiCode, FiExternalLink, FiGithub, FiLock, FiEye } from 'react-icons/fi';
import { motion } from 'framer-motion';

interface GitHubRepoData {
    name: string;
    fullName: string;
    description: string;
    url: string;
    stars: number;
    forks: number;
    watchers: number;
    primaryLanguage: string;
    languages: { language: string; percentage: number }[];
    topics: string[];
    updatedAt: string;
    pushedAt: string;
    createdAt: string;
    openIssues: number;
    license: string | null;
    defaultBranch: string;
    readme: string | null;
}

interface GitHubRepoCardProps {
    repoUrl: string; // Full GitHub URL or owner/repo format
    showReadme?: boolean;
    variant?: 'full' | 'compact' | 'badge';
    isPrivate?: boolean;
    requestAccess?: boolean;
    projectSlug?: string; // Slug for gated access routing
}

// Language colors based on GitHub's linguist
const languageColors: { [key: string]: string } = {
    Python: '#3572A5',
    JavaScript: '#f1e05a',
    TypeScript: '#3178c6',
    Java: '#b07219',
    'C++': '#f34b7d',
    C: '#555555',
    'C#': '#178600',
    Go: '#00ADD8',
    Rust: '#dea584',
    Ruby: '#701516',
    PHP: '#4F5D95',
    Swift: '#F05138',
    Kotlin: '#A97BFF',
    Jupyter: '#DA5B0B',
    HTML: '#e34c26',
    CSS: '#563d7c',
    Shell: '#89e051',
    R: '#198CE7',
    MATLAB: '#e16737',
};

export default function GitHubRepoCard({
    repoUrl,
    showReadme = false,
    variant = 'full',
    isPrivate = false,
    requestAccess = false,
    projectSlug
}: GitHubRepoCardProps) {
    const [data, setData] = useState<GitHubRepoData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Extract owner/repo from URL or use directly
    const getRepoPath = (url: string): string => {
        if (url.includes('github.com')) {
            const match = url.match(/github\.com\/([^\/]+\/[^\/]+)/);
            return match ? match[1].replace(/\.git$/, '') : url;
        }
        return url;
    };

    const repoPath = getRepoPath(repoUrl);

    useEffect(() => {
        if (isPrivate) {
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            try {
                const res = await fetch(`/api/github?repo=${encodeURIComponent(repoPath)}`);
                if (!res.ok) {
                    throw new Error('Failed to fetch');
                }
                const json = await res.json();
                setData(json);
            } catch (e) {
                setError('Unable to load repository data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [repoPath, isPrivate]);

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / 86400000);

        if (days === 0) return 'today';
        if (days === 1) return 'yesterday';
        if (days < 30) return `${days} days ago`;
        if (days < 365) return `${Math.floor(days / 30)} months ago`;
        return `${Math.floor(days / 365)} years ago`;
    };

    // Badge variant - minimal inline badge
    if (variant === 'badge') {
        if (isPrivate || requestAccess) {
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-sm font-medium">
                    <FiLock size={14} />
                    {requestAccess ? 'Available upon request' : 'Private repository'}
                </span>
            );
        }

        if (loading) {
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-full text-sm animate-pulse">
                    <FiGithub size={14} />
                    Loading...
                </span>
            );
        }

        if (error || !data) {
            return (
                <a
                    href={`https://github.com/${repoPath}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full text-sm transition"
                >
                    <FiGithub size={14} />
                    View on GitHub
                    <FiExternalLink size={12} />
                </a>
            );
        }

        return (
            <a
                href={data.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full text-sm transition"
            >
                <FiGithub size={14} />
                <span className="flex items-center gap-1">
                    <FiStar size={12} className="text-yellow-500" />
                    {data.stars}
                </span>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: languageColors[data.primaryLanguage] || '#666' }} />
                {data.primaryLanguage}
                <FiExternalLink size={12} />
            </a>
        );
    }

    // Private repo display
    if (isPrivate) {
        return (
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700 border-dashed">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                        <FiLock size={20} />
                    </div>
                    <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{repoPath.split('/')[1] || 'Private Repository'}</p>
                        <p className="text-sm text-gray-500">Private repository</p>
                    </div>
                </div>
                {requestAccess && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        This repository is available upon request. Request access to view the source code.
                    </p>
                )}
                <a
                    href={requestAccess && projectSlug ? `/gated/${projectSlug}` : (requestAccess ? `/gated/${repoPath.split('/')[1] || 'request'}` : "/contact")}
                    className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                    {requestAccess ? 'Request access →' : 'Contact for access →'}
                </a>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700" />
                    <div className="flex-1">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2" />
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                    </div>
                </div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                    <FiGithub className="text-2xl text-gray-400" />
                    <div>
                        <p className="font-medium text-gray-900 dark:text-white">{repoPath}</p>
                        <a
                            href={`https://github.com/${repoPath}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                        >
                            View on GitHub <FiExternalLink size={12} />
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    // Compact variant
    if (variant === 'compact') {
        return (
            <motion.a
                href={data.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="block bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md transition-all group"
            >
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 transition truncate">
                            {data.name}
                        </p>
                        <p className="text-sm text-gray-500 truncate">{data.description}</p>
                    </div>
                    <FiExternalLink className="text-gray-400 group-hover:text-blue-600 transition flex-shrink-0" />
                </div>
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                    {data.primaryLanguage && (
                        <span className="flex items-center gap-1">
                            <span
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: languageColors[data.primaryLanguage] || '#666' }}
                            />
                            {data.primaryLanguage}
                        </span>
                    )}
                    <span className="flex items-center gap-1">
                        <FiStar className="text-yellow-500" /> {data.stars}
                    </span>
                    <span className="flex items-center gap-1">
                        <FiGitBranch /> {data.forks}
                    </span>
                </div>
            </motion.a>
        );
    }

    // Full variant
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
            {/* Header */}
            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gray-900 dark:bg-gray-700 text-white flex items-center justify-center">
                            <FiGithub size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white">{data.name}</h3>
                            <p className="text-sm text-gray-500">{data.fullName}</p>
                        </div>
                    </div>
                    <a
                        href={data.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                    >
                        <FiExternalLink />
                    </a>
                </div>
                {data.description && (
                    <p className="mt-4 text-gray-600 dark:text-gray-400">{data.description}</p>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 divide-x divide-gray-100 dark:divide-gray-700 border-b border-gray-100 dark:border-gray-700">
                <div className="p-4 text-center">
                    <p className="text-xl font-bold text-gray-900 dark:text-white flex items-center justify-center gap-1">
                        <FiStar className="text-yellow-500" /> {data.stars}
                    </p>
                    <p className="text-xs text-gray-500">Stars</p>
                </div>
                <div className="p-4 text-center">
                    <p className="text-xl font-bold text-gray-900 dark:text-white flex items-center justify-center gap-1">
                        <FiGitBranch className="text-blue-500" /> {data.forks}
                    </p>
                    <p className="text-xs text-gray-500">Forks</p>
                </div>
                <div className="p-4 text-center">
                    <p className="text-xl font-bold text-gray-900 dark:text-white flex items-center justify-center gap-1">
                        <FiEye className="text-green-500" /> {data.watchers}
                    </p>
                    <p className="text-xs text-gray-500">Watchers</p>
                </div>
                <div className="p-4 text-center">
                    <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center justify-center gap-1">
                        <FiClock className="text-gray-400" />
                    </p>
                    <p className="text-xs text-gray-500">Updated {formatDate(data.pushedAt)}</p>
                </div>
            </div>

            {/* Languages */}
            {data.languages && data.languages.length > 0 && (
                <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex h-2 rounded-full overflow-hidden mb-3">
                        {data.languages.slice(0, 5).map((lang, idx) => (
                            <div
                                key={lang.language}
                                className="h-full"
                                style={{
                                    width: `${lang.percentage}%`,
                                    backgroundColor: languageColors[lang.language] || '#666'
                                }}
                                title={`${lang.language}: ${lang.percentage}%`}
                            />
                        ))}
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs">
                        {data.languages.slice(0, 5).map(lang => (
                            <span key={lang.language} className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                <span
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: languageColors[lang.language] || '#666' }}
                                />
                                {lang.language} {lang.percentage}%
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Topics */}
            {data.topics && data.topics.length > 0 && (
                <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex flex-wrap gap-2">
                        {data.topics.map(topic => (
                            <span
                                key={topic}
                                className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-md text-xs font-medium"
                            >
                                {topic}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* README Excerpt */}
            {showReadme && data.readme && (
                <div className="p-4">
                    <p className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
                        <FiCode /> README
                    </p>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 text-sm text-gray-600 dark:text-gray-400 font-mono overflow-hidden">
                        <pre className="whitespace-pre-wrap">{data.readme}</pre>
                    </div>
                </div>
            )}

            {/* Footer */}
            <div className="p-4 bg-gray-50 dark:bg-gray-900 flex items-center justify-between">
                {data.license && (
                    <span className="text-xs text-gray-500">📄 {data.license}</span>
                )}
                <span className="text-xs text-gray-500">
                    Created {new Date(data.createdAt).toLocaleDateString()}
                </span>
            </div>
        </motion.div>
    );
}
