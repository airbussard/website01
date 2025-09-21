'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Project } from '@/types';

export interface ProjectWithImages extends Project {
  project_images?: {
    id: string;
    image_url: string;
    thumbnail_url?: string;
    caption?: string;
    alt_text?: string;
    is_primary: boolean;
    display_order: number;
  }[];
}

export function useProjects() {
  const [projects, setProjects] = useState<ProjectWithImages[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    try {
      const supabase = createClient();

      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          project_images (
            id,
            image_url,
            thumbnail_url,
            caption,
            alt_text,
            is_primary,
            display_order
          )
        `)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data to match our types
      const transformedData = (data || []).map(project => ({
        ...project,
        technologies: project.technologies || [],
        imageUrl: project.project_images?.find((img: any) => img.is_primary)?.image_url || project.image_url || '',
      }));

      setProjects(transformedData);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching projects:', err);

      // Fallback to mock data if Supabase is not configured
      if (process.env.NODE_ENV === 'development') {
        setProjects(getMockProjects());
      }
    } finally {
      setLoading(false);
    }
  }

  return { projects, loading, error, refetch: fetchProjects };
}

export function useProject(id: string) {
  const [project, setProject] = useState<ProjectWithImages | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (id) {
      fetchProject();
    }
  }, [id]);

  async function fetchProject() {
    try {
      const supabase = createClient();

      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          project_images (
            id,
            image_url,
            thumbnail_url,
            caption,
            alt_text,
            is_primary,
            display_order
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      // Transform data to match our types
      const transformedData = {
        ...data,
        technologies: data.technologies || [],
        imageUrl: data.project_images?.find((img: any) => img.is_primary)?.image_url || data.image_url || '',
      };

      setProject(transformedData);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching project:', err);
    } finally {
      setLoading(false);
    }
  }

  return { project, loading, error };
}

// Mock data fallback for development
function getMockProjects(): ProjectWithImages[] {
  return [
    {
      id: '1',
      title: 'E-Commerce Platform',
      description: 'Moderne Shopping-Plattform mit React und Node.js',
      longDescription: 'Vollständige E-Commerce-Lösung mit Warenkorb, Zahlungsintegration und Admin-Dashboard',
      category: 'web',
      technologies: ['React', 'Node.js', 'PostgreSQL', 'Stripe', 'Docker'],
      imageUrl: '/api/placeholder/600/400',
      liveUrl: 'https://example.com',
      githubUrl: 'https://github.com',
      featured: true,
      createdAt: '2024-01-01',
    },
    {
      id: '2',
      title: 'iOS Fitness Tracker',
      description: 'Native iOS App für Fitness-Tracking und Workouts',
      longDescription: 'Fitness-App mit HealthKit Integration, personalisierten Trainingsplänen und Social Features',
      category: 'mobile',
      technologies: ['Swift', 'SwiftUI', 'Core Data', 'HealthKit', 'CloudKit'],
      imageUrl: '/api/placeholder/600/400',
      liveUrl: 'https://apps.apple.com',
      featured: true,
      createdAt: '2024-02-01',
    },
  ];
}