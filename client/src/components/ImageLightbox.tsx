import { useEffect } from 'react';
import { X } from 'lucide-react';

interface ImageLightboxProps {
  src: string | null;
  onClose: () => void;
}

export function ImageLightbox({ src, onClose }: ImageLightboxProps) {
  useEffect(() => {
    if (!src) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [src, onClose]);

  if (!src) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"
        aria-label="Close"
      >
        <X className="w-6 h-6" />
      </button>
      <img
        src={src}
        alt="Full size preview"
        className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}
