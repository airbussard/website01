'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { X, Upload, Trash2, Star, Loader2, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface ImageUploaderProps {
  projectId: string;
  onClose: () => void;
}

interface ProjectImage {
  id: string;
  image_url: string;
  caption?: string;
  is_primary: boolean;
  display_order: number;
}

export default function ImageUploader({ projectId, onClose }: ImageUploaderProps) {
  const [images, setImages] = useState<ProjectImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchImages();
  }, [projectId]);

  async function fetchImages() {
    const { data, error } = await supabase
      .from('project_images')
      .select('*')
      .eq('project_id', projectId)
      .order('display_order', { ascending: true });

    if (!error && data) {
      setImages(data);
    }
    setLoading(false);
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    for (const file of Array.from(files)) {
      try {
        // Upload to Supabase Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${projectId}/${Date.now()}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('project-images')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('project-images')
          .getPublicUrl(fileName);

        // Save image record to database
        const { error: dbError } = await supabase
          .from('project_images')
          .insert({
            project_id: projectId,
            image_url: publicUrl,
            is_primary: images.length === 0, // First image is primary
            display_order: images.length,
          });

        if (dbError) throw dbError;

        // Refresh images
        await fetchImages();
      } catch (error) {
        console.error('Upload error:', error);
        alert('Fehler beim Upload');
      }
    }

    setUploading(false);
  }

  async function deleteImage(imageId: string, imageUrl: string) {
    if (!confirm('Bild wirklich löschen?')) return;

    try {
      // Delete from database
      const { error: dbError } = await supabase
        .from('project_images')
        .delete()
        .eq('id', imageId);

      if (dbError) throw dbError;

      // Delete from storage
      const path = imageUrl.split('/').slice(-2).join('/');
      await supabase.storage
        .from('project-images')
        .remove([path]);

      // Refresh images
      await fetchImages();
    } catch (error) {
      console.error('Delete error:', error);
      alert('Fehler beim Löschen');
    }
  }

  async function setPrimaryImage(imageId: string) {
    try {
      // Remove primary from all images
      await supabase
        .from('project_images')
        .update({ is_primary: false })
        .eq('project_id', projectId);

      // Set new primary
      await supabase
        .from('project_images')
        .update({ is_primary: true })
        .eq('id', imageId);

      // Refresh images
      await fetchImages();
    } catch (error) {
      console.error('Error setting primary:', error);
    }
  }

  async function updateCaption(imageId: string, caption: string) {
    await supabase
      .from('project_images')
      .update({ caption })
      .eq('id', imageId);
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <ImageIcon className="h-6 w-6 mr-2" />
            Bilder verwalten
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Upload Area */}
        <div className="p-6">
          <label className="block w-full">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-500 transition-colors cursor-pointer">
              {uploading ? (
                <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary-600" />
              ) : (
                <>
                  <Upload className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-600">
                    Klicken oder Dateien hier ablegen
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    PNG, JPG, GIF bis zu 10MB
                  </p>
                </>
              )}
            </div>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>

        {/* Images Grid */}
        <div className="p-6 pt-0">
          {images.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              Noch keine Bilder hochgeladen
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {images.map((image) => (
                <div
                  key={image.id}
                  className="relative group bg-gray-100 rounded-lg overflow-hidden"
                >
                  <div className="aspect-video relative">
                    <Image
                      src={image.image_url}
                      alt={image.caption || 'Project image'}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 33vw"
                    />
                  </div>

                  {/* Primary Badge */}
                  {image.is_primary && (
                    <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded text-xs font-semibold">
                      Hauptbild
                    </div>
                  )}

                  {/* Actions */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                    {!image.is_primary && (
                      <button
                        onClick={() => setPrimaryImage(image.id)}
                        className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                        title="Als Hauptbild setzen"
                      >
                        <Star className="h-4 w-4 text-gray-700" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteImage(image.id, image.image_url)}
                      className="p-2 bg-white rounded-lg hover:bg-red-100 transition-colors"
                      title="Löschen"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </button>
                  </div>

                  {/* Caption Input */}
                  <input
                    type="text"
                    placeholder="Bildunterschrift..."
                    value={image.caption || ''}
                    onChange={(e) => updateCaption(image.id, e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border-t border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}