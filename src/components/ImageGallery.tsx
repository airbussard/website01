'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Expand } from 'lucide-react';

interface GalleryImage {
  id: string;
  image_url: string;
  thumbnail_url?: string;
  caption?: string;
  alt_text?: string;
  display_order: number;
}

interface ImageGalleryProps {
  images: GalleryImage[];
  projectTitle: string;
}

export default function ImageGallery({ images, projectTitle }: ImageGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  if (images.length === 0) return null;

  const selectedImage = images[selectedImageIndex];

  const openLightbox = (index: number) => {
    setSelectedImageIndex(index);
    setIsLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    document.body.style.overflow = 'unset';
  };

  const goToPrevious = () => {
    setSelectedImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setSelectedImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isLightboxOpen) return;

    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') goToPrevious();
    if (e.key === 'ArrowRight') goToNext();
  };

  return (
    <>
      {/* Main Gallery */}
      <div className="space-y-4">
        {/* Primary Image */}
        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-gray-100 group cursor-pointer"
             onClick={() => openLightbox(0)}>
          <Image
            src={images[0].image_url}
            alt={images[0].alt_text || `${projectTitle} - Hauptbild`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
            priority
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
            <Expand className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-8 w-8" />
          </div>
          {images[0].caption && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
              <p className="text-white text-sm">{images[0].caption}</p>
            </div>
          )}
        </div>

        {/* Thumbnail Grid */}
        {images.length > 1 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {images.slice(1).map((image, index) => (
              <motion.div
                key={image.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative aspect-video overflow-hidden rounded-lg bg-gray-100 cursor-pointer group"
                onClick={() => openLightbox(index + 1)}
              >
                <Image
                  src={image.thumbnail_url || image.image_url}
                  alt={image.alt_text || `${projectTitle} - Bild ${index + 2}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200 flex items-center justify-center">
                  <Expand className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 h-6 w-6" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
            onClick={closeLightbox}
            onKeyDown={handleKeyDown}
            tabIndex={0}
          >
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors z-50"
            >
              <X className="h-8 w-8" />
            </button>

            {/* Navigation Buttons */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goToPrevious();
                  }}
                  className="absolute left-4 text-white/70 hover:text-white transition-colors z-50"
                >
                  <ChevronLeft className="h-12 w-12" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goToNext();
                  }}
                  className="absolute right-4 text-white/70 hover:text-white transition-colors z-50"
                >
                  <ChevronRight className="h-12 w-12" />
                </button>
              </>
            )}

            {/* Image Container */}
            <div className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center p-8"
                 onClick={(e) => e.stopPropagation()}>
              <motion.div
                key={selectedImageIndex}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="relative w-full h-full flex flex-col items-center"
              >
                <div className="relative w-full h-full flex items-center justify-center">
                  <Image
                    src={selectedImage.image_url}
                    alt={selectedImage.alt_text || `${projectTitle} - Bild ${selectedImageIndex + 1}`}
                    width={1920}
                    height={1080}
                    className="object-contain max-h-[80vh] w-auto h-auto"
                    priority
                  />
                </div>

                {/* Caption and Counter */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                  <div className="flex justify-between items-end">
                    <div className="flex-1">
                      {selectedImage.caption && (
                        <p className="text-white text-lg mb-2">{selectedImage.caption}</p>
                      )}
                      <p className="text-white/60 text-sm">
                        {selectedImageIndex + 1} / {images.length}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="absolute bottom-20 left-0 right-0 flex justify-center px-8">
                <div className="flex space-x-2 overflow-x-auto max-w-full pb-2">
                  {images.map((image, index) => (
                    <button
                      key={image.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImageIndex(index);
                      }}
                      className={`relative flex-shrink-0 w-20 h-14 overflow-hidden rounded transition-all ${
                        index === selectedImageIndex
                          ? 'ring-2 ring-primary-500 opacity-100'
                          : 'opacity-60 hover:opacity-80'
                      }`}
                    >
                      <Image
                        src={image.thumbnail_url || image.image_url}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}