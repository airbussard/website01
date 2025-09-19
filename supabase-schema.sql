-- Create contact_requests table for storing form submissions
CREATE TABLE IF NOT EXISTS contact_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  project_type VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'new',
  notes TEXT
);

-- Create index for faster queries
CREATE INDEX idx_contact_requests_created_at ON contact_requests(created_at DESC);
CREATE INDEX idx_contact_requests_email ON contact_requests(email);
CREATE INDEX idx_contact_requests_status ON contact_requests(status);

-- Add Row Level Security (RLS)
ALTER TABLE contact_requests ENABLE ROW LEVEL SECURITY;

-- Create policy for inserting new contact requests (public access)
CREATE POLICY "Enable insert for all users" ON contact_requests
  FOR INSERT WITH CHECK (true);

-- Create projects table for managing portfolio projects
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  long_description TEXT,
  category VARCHAR(50) NOT NULL CHECK (category IN ('web', 'mobile', 'system')),
  technologies TEXT[] NOT NULL,
  image_url VARCHAR(500),
  live_url VARCHAR(500),
  github_url VARCHAR(500),
  featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for projects
CREATE INDEX idx_projects_featured ON projects(featured);
CREATE INDEX idx_projects_category ON projects(category);
CREATE INDEX idx_projects_display_order ON projects(display_order);

-- Add RLS for projects
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create policy for reading projects (public access)
CREATE POLICY "Enable read access for all users" ON projects
  FOR SELECT USING (true);

-- Create project_images table for multiple images per project
CREATE TABLE IF NOT EXISTS project_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  image_url VARCHAR(500) NOT NULL,
  thumbnail_url VARCHAR(500),
  caption TEXT,
  alt_text VARCHAR(255),
  is_primary BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  width INTEGER,
  height INTEGER,
  file_size INTEGER,
  mime_type VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for project_images
CREATE INDEX idx_project_images_project_id ON project_images(project_id);
CREATE INDEX idx_project_images_is_primary ON project_images(is_primary);
CREATE INDEX idx_project_images_display_order ON project_images(display_order);

-- Add RLS for project_images
ALTER TABLE project_images ENABLE ROW LEVEL SECURITY;

-- Create policy for reading project images (public access)
CREATE POLICY "Enable read access for all users" ON project_images
  FOR SELECT USING (true);

-- Create storage bucket for project images
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-images', 'project-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create policy for public access to project images
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'project-images');

-- Create policy for authenticated users to upload images
CREATE POLICY "Authenticated users can upload images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'project-images'
    AND auth.role() = 'authenticated'
  );

-- Create policy for authenticated users to update images
CREATE POLICY "Authenticated users can update images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'project-images'
    AND auth.role() = 'authenticated'
  );

-- Create policy for authenticated users to delete images
CREATE POLICY "Authenticated users can delete images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'project-images'
    AND auth.role() = 'authenticated'
  );