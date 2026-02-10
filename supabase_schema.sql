-- 1. Projects Table
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  short_description TEXT,
  full_description TEXT,
  problem_statement TEXT,
  approach TEXT,
  results TEXT,
  limitations TEXT,
  category TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  github_link TEXT,
  visibility TEXT CHECK (visibility IN ('public', 'gated', 'nda')),
  is_featured BOOLEAN DEFAULT false,
  images JSONB DEFAULT '[]',
  metrics JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Publications Table
CREATE TABLE publications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  authors TEXT[] DEFAULT '{}',
  journal TEXT,
  status TEXT CHECK (status IN ('under-review', 'published', 'preprint')),
  year INTEGER,
  abstract TEXT,
  contributions TEXT[] DEFAULT '{}',
  pdf_url TEXT,
  doi_link TEXT,
  code_repo TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Access Requests Table
CREATE TABLE access_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  affiliation TEXT,
  project_id UUID REFERENCES projects(id),
  reason TEXT,
  status TEXT CHECK (status IN ('pending', 'approved', 'denied')) DEFAULT 'pending',
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE
);

-- 4. Contact Messages Table
CREATE TABLE contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  collaboration_type TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Blog Posts Table
CREATE TABLE blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT,
  excerpt TEXT,
  featured_image TEXT,
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Admin Users Table
CREATE TABLE admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_projects_slug ON projects(slug);
CREATE INDEX idx_projects_visibility ON projects(visibility);
CREATE INDEX idx_projects_featured ON projects(is_featured);
CREATE INDEX idx_publications_year ON publications(year);
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_access_requests_status ON access_requests(status);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE publications ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Create policies (allow public read for public content)
CREATE POLICY "Public projects are viewable by everyone"
  ON projects FOR SELECT
  USING (visibility = 'public');

CREATE POLICY "All publications are viewable"
  ON publications FOR SELECT
  USING (true);

CREATE POLICY "Public blog posts are viewable"
  ON blog_posts FOR SELECT
  USING (is_published = true);
