import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';


const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://emalkamawal.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 1,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/projects`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/publications`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/experience`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/services`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/blog`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/contact`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.6,
        },
    ];

    // Dynamic project pages (only public ones)
    let projectPages: MetadataRoute.Sitemap = [];
    try {
        const { data: projects } = await supabase
            .from('projects')
            .select('slug, updated_at')
            .eq('visibility', 'public')
            .order('created_at', { ascending: false });

        if (projects) {
            projectPages = projects.map((project: any) => ({
                url: `${baseUrl}/projects/${project.slug}`,
                lastModified: new Date(project.updated_at || new Date()),
                changeFrequency: 'monthly' as const,
                priority: 0.7,
            }));
        }
    } catch (e) {
        console.error('Error fetching projects for sitemap:', e);
    }

    // Dynamic blog pages
    let blogPages: MetadataRoute.Sitemap = [];
    try {
        const { data: posts } = await supabase
            .from('blog_posts')
            .select('slug, updated_at')
            .eq('status', 'published')
            .order('created_at', { ascending: false });

        if (posts) {
            blogPages = posts.map((post: any) => ({
                url: `${baseUrl}/blog/${post.slug}`,
                lastModified: new Date(post.updated_at || new Date()),
                changeFrequency: 'monthly' as const,
                priority: 0.6,
            }));
        }
    } catch (e) {
        console.error('Error fetching blog posts for sitemap:', e);
    }

    return [...staticPages, ...projectPages, ...blogPages];
}
