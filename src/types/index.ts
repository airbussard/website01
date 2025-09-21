export interface Project {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  category: 'web' | 'mobile' | 'system';
  technologies: string[];
  imageUrl: string;
  liveUrl?: string;
  githubUrl?: string;
  featured: boolean;
  createdAt: string;
  display_order?: number;
}

export interface ContactForm {
  name: string;
  email: string;
  company?: string;
  subject: string;
  message: string;
  projectType?: 'website' | 'webapp' | 'mobile' | 'other';
}

export interface Technology {
  name: string;
  icon?: string;
  category: 'frontend' | 'backend' | 'mobile' | 'database' | 'tools';
}