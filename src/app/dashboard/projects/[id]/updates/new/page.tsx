'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Save,
  Loader2,
  FileText,
  Percent,
  Eye,
  EyeOff,
  AlertCircle,
  Upload,
  X,
} from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import RichTextEditor from '@/components/RichTextEditor';
import { createClient } from '@/lib/supabase/client';
import type { PMProject } from '@/types/dashboard';

export default function NewProjectUpdatePage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const { user, isManagerOrAdmin, loading: authLoading } = useAuth();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [project, setProject] = useState<PMProject | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [progressPercentage, setProgressPercentage] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  // Image upload state
  const [uploadedImages, setUploadedImages] = useState<{url: string, caption: string, uploaded_at: string}[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      if (!user || authLoading) return;

      try {
        const { data, error: projectError } = await supabase
          .from('pm_projects')
          .select('id, name')
          .eq('id', projectId)
          .single();

        if (projectError) throw projectError;
        setProject(data);
      } catch (err) {
        console.error('Error fetching project:', err);
        setError('Fehler beim Laden des Projekts');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [user, authLoading, projectId, supabase]);

  useEffect(() => {
    if (!authLoading && !isManagerOrAdmin) {
      router.push(`/dashboard/projects/${projectId}`);
    }
  }, [authLoading, isManagerOrAdmin, router, projectId]);

  // Drag & Drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFileUpload(e.dataTransfer.files);
    }
  };

  const handleFileUpload = async (files: FileList) => {
    setUploading(true);

    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue;

      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `updates/${projectId}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('project-images')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('project-images')
          .getPublicUrl(fileName);

        setUploadedImages(prev => [...prev, {
          url: publicUrl,
          caption: '',
          uploaded_at: new Date().toISOString()
        }]);
      } catch (err) {
        console.error('Upload error:', err);
      }
    }

    setUploading(false);
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title.trim()) return;

    setSaving(true);
    setError(null);

    try {
      const updateData = {
        title: title.trim(),
        content: content.trim() || null,
        project_id: projectId,
        progress_percentage: progressPercentage || null,
        is_public: isPublic,
        images: uploadedImages,
        attachments: [],
      };

      const response = await fetch('/api/progress-updates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Fehler beim Erstellen des Updates');
      }

      router.push(`/dashboard/projects/${projectId}`);
    } catch (err: unknown) {
      console.error('Error creating update:', err);
      const errorMessage = err instanceof Error ? err.message : 'Fehler beim Erstellen des Updates';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!isManagerOrAdmin) {
    return null;
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Projekt nicht gefunden</h2>
        <p className="text-gray-500 mb-4">Das angeforderte Projekt existiert nicht.</p>
        <Link href="/dashboard/projects" className="inline-flex items-center text-primary-600 hover:text-primary-700">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurück zu Projekten
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm">
        <Link href="/dashboard/projects" className="text-gray-500 hover:text-primary-600 transition-colors">
          Projekte
        </Link>
        <span className="text-gray-400">/</span>
        <Link href={`/dashboard/projects/${projectId}`} className="text-gray-500 hover:text-primary-600 transition-colors">
          {project.name}
        </Link>
        <span className="text-gray-400">/</span>
        <span className="text-gray-900 font-medium">Neues Update</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Neues Fortschrittsupdate</h1>
          <p className="text-gray-600">Update für Projekt: {project.name}</p>
        </div>
        <Link
          href={`/dashboard/projects/${projectId}`}
          className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurück
        </Link>
      </div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-gray-100 shadow-sm"
      >
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Titel *
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                placeholder="z.B. Woche 5 - Frontend fertiggestellt"
              />
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Inhalt
            </label>
            <RichTextEditor
              content={content}
              onChange={setContent}
              placeholder="Beschreiben Sie den Fortschritt, abgeschlossene Aufgaben, etc..."
            />
          </div>

          {/* Screenshots */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Screenshots
            </label>
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragActive
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              {uploading ? (
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary-600" />
              ) : (
                <>
                  <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-600 text-sm">
                    Screenshots hier ablegen oder{' '}
                    <label className="text-primary-600 cursor-pointer hover:underline">
                      durchsuchen
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                        className="hidden"
                      />
                    </label>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF</p>
                </>
              )}
            </div>

            {uploadedImages.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-3">
                {uploadedImages.map((img, index) => (
                  <div key={index} className="relative group rounded-lg overflow-hidden border border-gray-200">
                    <div className="aspect-video relative">
                      <Image src={img.url} alt="" fill className="object-cover" sizes="200px" />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Progress Percentage */}
          <div>
            <label htmlFor="progress" className="block text-sm font-medium text-gray-700 mb-2">
              Fortschritt (%)
            </label>
            <div className="relative">
              <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="progress"
                type="number"
                min="0"
                max="100"
                value={progressPercentage}
                onChange={(e) => setProgressPercentage(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                placeholder="z.B. 75"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Optional: Geben Sie den aktuellen Projektfortschritt in Prozent an
            </p>
          </div>

          {/* Progress Bar Preview */}
          {progressPercentage && (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2">Vorschau:</p>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-500 rounded-full transition-all"
                  style={{ width: `${Math.min(parseInt(progressPercentage) || 0, 100)}%` }}
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">{progressPercentage}% abgeschlossen</p>
            </div>
          )}

          {/* Visibility */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sichtbarkeit
            </label>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setIsPublic(true)}
                className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg border transition-colors ${
                  isPublic
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Eye className="h-5 w-5 mr-2" />
                Öffentlich
              </button>
              <button
                type="button"
                onClick={() => setIsPublic(false)}
                className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg border transition-colors ${
                  !isPublic
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <EyeOff className="h-5 w-5 mr-2" />
                Nur intern
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              {isPublic
                ? 'Dieses Update ist für den Kunden sichtbar'
                : 'Dieses Update ist nur für Manager und Admins sichtbar'}
            </p>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={saving || !title.trim()}
              className="w-full flex items-center justify-center px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Erstelle Update...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  Update veröffentlichen
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
