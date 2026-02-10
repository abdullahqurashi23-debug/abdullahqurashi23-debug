import { NextRequest, NextResponse } from 'next/server';

interface GitHubRepoData {
    name: string;
    full_name: string;
    description: string;
    html_url: string;
    stargazers_count: number;
    forks_count: number;
    watchers_count: number;
    language: string;
    topics: string[];
    updated_at: string;
    pushed_at: string;
    created_at: string;
    open_issues_count: number;
    license: { name: string } | null;
    default_branch: string;
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const repo = searchParams.get('repo'); // format: owner/repo

        if (!repo) {
            return NextResponse.json(
                { error: 'Repository path is required (format: owner/repo)' },
                { status: 400 }
            );
        }

        // Validate repo format
        const repoParts = repo.split('/');
        if (repoParts.length !== 2) {
            return NextResponse.json(
                { error: 'Invalid repository format. Use owner/repo' },
                { status: 400 }
            );
        }

        const headers: HeadersInit = {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'Emal-Portfolio'
        };

        // Add auth token if available (increases rate limit)
        if (process.env.GITHUB_TOKEN) {
            headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
        }

        // Fetch repo metadata
        const repoResponse = await fetch(`https://api.github.com/repos/${repo}`, { headers });

        if (!repoResponse.ok) {
            if (repoResponse.status === 404) {
                return NextResponse.json(
                    { error: 'Repository not found' },
                    { status: 404 }
                );
            }
            if (repoResponse.status === 403) {
                return NextResponse.json(
                    { error: 'GitHub API rate limit exceeded' },
                    { status: 429 }
                );
            }
            throw new Error(`GitHub API error: ${repoResponse.status}`);
        }

        const repoData: GitHubRepoData = await repoResponse.json();

        // Fetch README
        let readme: string | null = null;
        try {
            const readmeResponse = await fetch(
                `https://api.github.com/repos/${repo}/readme`,
                { headers: { ...headers, 'Accept': 'application/vnd.github.v3.raw' } }
            );
            if (readmeResponse.ok) {
                const fullReadme = await readmeResponse.text();
                // Get first 500 characters for excerpt
                readme = fullReadme.substring(0, 500);
                if (fullReadme.length > 500) {
                    readme += '...';
                }
            }
        } catch (e) {
            // README is optional, continue without it
        }

        // Fetch languages
        let languages: { [key: string]: number } = {};
        try {
            const langResponse = await fetch(`https://api.github.com/repos/${repo}/languages`, { headers });
            if (langResponse.ok) {
                languages = await langResponse.json();
            }
        } catch (e) {
            // Languages are optional
        }

        // Calculate language percentages
        const totalBytes = Object.values(languages).reduce((sum, bytes) => sum + bytes, 0);
        const languagePercentages = Object.entries(languages).map(([lang, bytes]) => ({
            language: lang,
            percentage: Math.round((bytes / totalBytes) * 100)
        })).sort((a, b) => b.percentage - a.percentage);

        // Format response
        const result = {
            name: repoData.name,
            fullName: repoData.full_name,
            description: repoData.description,
            url: repoData.html_url,
            stars: repoData.stargazers_count,
            forks: repoData.forks_count,
            watchers: repoData.watchers_count,
            primaryLanguage: repoData.language,
            languages: languagePercentages,
            topics: repoData.topics,
            updatedAt: repoData.updated_at,
            pushedAt: repoData.pushed_at,
            createdAt: repoData.created_at,
            openIssues: repoData.open_issues_count,
            license: repoData.license?.name || null,
            defaultBranch: repoData.default_branch,
            readme: readme
        };

        return NextResponse.json(result, {
            headers: {
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
            }
        });

    } catch (error) {
        console.error('Error fetching GitHub data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch repository data' },
            { status: 500 }
        );
    }
}
