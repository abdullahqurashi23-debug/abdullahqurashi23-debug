// JSON-LD Schema Markup Types for SEO - Updated with Emal Kamawal's Information

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://emalkamawal.com';

// Person schema for Emal Kamawal
export function generatePersonSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: 'Emal Kamawal',
        givenName: 'Emal',
        familyName: 'Kamawal',
        url: baseUrl,
        image: `${baseUrl}/profile.jpg`,
        email: 'B22F1813CS118@fecid.paf-iast.edu.pk',
        jobTitle: 'AI Researcher in Healthcare',
        description: 'Passionate computer scientist focused on AI for healthcare and social impact. Research spans brain-computer interfaces (EEG), medical imaging, and computer vision.',
        alumniOf: {
            '@type': 'CollegeOrUniversity',
            name: 'Pak-Austria Fachhochschule: Institute of Applied Sciences & Technology',
            location: 'Haripur, KPK, Pakistan',
        },
        knowsAbout: [
            'Artificial Intelligence',
            'Machine Learning',
            'Healthcare AI',
            'Medical Imaging',
            'Deep Learning',
            'Computer Vision',
            'Brain-Computer Interfaces',
            'EEG Signal Processing',
            'Federated Learning',
            'Explainable AI',
            'Generative AI',
            'IoT Systems',
        ],
        knowsLanguage: ['English', 'Pashto', 'Persian', 'Dari', 'Urdu'],
        sameAs: [
            'https://github.com/emalkamawal',
            'https://linkedin.com/in/emalkamawal',
            'https://scholar.google.com/citations?user=emalkamawal',
        ],
        address: {
            '@type': 'PostalAddress',
            addressLocality: 'Haripur',
            addressRegion: 'KPK',
            addressCountry: 'Pakistan',
        },
        award: [
            'Allama Iqbal Scholarship for Afghan Students (HEC Pakistan)',
            'Mathematics Olympiad Participant',
        ],
        hasCredential: [
            {
                '@type': 'EducationalOccupationalCredential',
                name: 'Machine Learning Specialization',
                credentialCategory: 'Certificate',
                recognizedBy: { '@type': 'Organization', name: 'Stanford University' },
            },
            {
                '@type': 'EducationalOccupationalCredential',
                name: 'Deep Learning Specialization',
                credentialCategory: 'Certificate',
                recognizedBy: { '@type': 'Organization', name: 'DeepLearning.AI' },
            },
            {
                '@type': 'EducationalOccupationalCredential',
                name: 'AWS Certified Cloud Practitioner',
                credentialCategory: 'Certificate',
                recognizedBy: { '@type': 'Organization', name: 'Amazon Web Services' },
            },
        ],
    };
}

// Website schema
export function generateWebsiteSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Emal Kamawal - AI Researcher in Healthcare',
        url: baseUrl,
        description: 'Portfolio and research work of Emal Kamawal, specializing in AI applications in healthcare, brain-computer interfaces, and medical imaging.',
        author: generatePersonSchema(),
        potentialAction: {
            '@type': 'SearchAction',
            target: {
                '@type': 'EntryPoint',
                urlTemplate: `${baseUrl}/projects?search={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
        },
    };
}

// Project/SoftwareSourceCode schema
export function generateProjectSchema(project: {
    title: string;
    slug: string;
    description: string;
    category?: string[];
    tags?: string[];
    github_link?: string;
    created_at: string;
    updated_at?: string;
}) {
    return {
        '@context': 'https://schema.org',
        '@type': 'SoftwareSourceCode',
        name: project.title,
        description: project.description,
        url: `${baseUrl}/projects/${project.slug}`,
        author: {
            '@type': 'Person',
            name: 'Emal Kamawal',
            url: baseUrl,
        },
        programmingLanguage: project.tags?.slice(0, 5) || ['Python', 'TensorFlow'],
        applicationCategory: project.category?.[0] || 'Research',
        dateCreated: project.created_at,
        dateModified: project.updated_at || project.created_at,
        codeRepository: project.github_link || undefined,
        keywords: project.tags?.join(', ') || '',
    };
}

// Blog Article schema
export function generateArticleSchema(article: {
    title: string;
    slug: string;
    excerpt: string;
    content?: string;
    tags?: string[];
    created_at: string;
    updated_at?: string;
    reading_time?: number;
}) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: article.title,
        description: article.excerpt,
        url: `${baseUrl}/blog/${article.slug}`,
        author: {
            '@type': 'Person',
            name: 'Emal Kamawal',
            url: baseUrl,
        },
        publisher: {
            '@type': 'Person',
            name: 'Emal Kamawal',
            url: baseUrl,
        },
        datePublished: article.created_at,
        dateModified: article.updated_at || article.created_at,
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `${baseUrl}/blog/${article.slug}`,
        },
        keywords: article.tags?.join(', ') || '',
        wordCount: article.content ? article.content.split(' ').length : undefined,
        timeRequired: article.reading_time ? `PT${article.reading_time}M` : undefined,
        image: `${baseUrl}/api/og?title=${encodeURIComponent(article.title)}&type=blog`,
    };
}

// Publication/ScholarlyArticle schema
export function generatePublicationSchema(publication: {
    title: string;
    authors: string;
    venue: string;
    year: number;
    doi?: string;
    pdf_url?: string;
    citations?: number;
}) {
    return {
        '@context': 'https://schema.org',
        '@type': 'ScholarlyArticle',
        headline: publication.title,
        author: publication.authors.split(',').map(name => ({
            '@type': 'Person',
            name: name.trim(),
        })),
        publisher: {
            '@type': 'Organization',
            name: publication.venue,
        },
        datePublished: `${publication.year}`,
        isPartOf: {
            '@type': 'PublicationIssue',
            isPartOf: {
                '@type': 'Periodical',
                name: publication.venue,
            },
        },
        sameAs: publication.doi ? `https://doi.org/${publication.doi}` : undefined,
        url: publication.pdf_url,
        citation: publication.citations ? `Cited by ${publication.citations}` : undefined,
    };
}

// Breadcrumb schema helper
export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url.startsWith('http') ? item.url : `${baseUrl}${item.url}`,
        })),
    };
}

// Component to inject schema into page
export function SchemaScript({ schema }: { schema: object | object[] }) {
    const schemas = Array.isArray(schema) ? schema : [schema];

    return (
        <>
            {schemas.map((s, i) => (
                <script
                    key={i}
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }}
                />
            ))}
        </>
    );
}
