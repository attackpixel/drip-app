import { useState, useRef } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import { compressImage, formatFileSize } from '@drip/core';
import { Button } from '../ui/Button';

interface PhotoUploaderProps {
  onPhotoReady: (blob: Blob, preview: string) => void;
  currentPreview?: string;
  onClear?: () => void;
}

export function PhotoUploader({ onPhotoReady, currentPreview, onClear }: PhotoUploaderProps) {
  const [preview, setPreview] = useState<string | null>(currentPreview ?? null);
  const [compressing, setCompressing] = useState(false);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedSize, setCompressedSize] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setCompressing(true);
    setOriginalSize(file.size);

    try {
      const compressed = await compressImage(file);
      setCompressedSize(compressed.size);

      const url = URL.createObjectURL(compressed);
      setPreview(url);
      onPhotoReady(compressed, url);
    } catch (err) {
      console.error('Compression failed:', err);
    } finally {
      setCompressing(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const clear = () => {
    setPreview(null);
    setOriginalSize(0);
    setCompressedSize(0);
    onClear?.();
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Photo</label>

      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="h-64 w-full rounded-xl object-cover"
          />
          <button
            type="button"
            onClick={clear}
            className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
          >
            <X size={16} />
          </button>
          {originalSize > 0 && (
            <div className="mt-1 text-xs text-gray-500">
              {formatFileSize(originalSize)} → {formatFileSize(compressedSize)} (WebP)
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={compressing}
          className="flex h-48 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 text-gray-500 transition-colors hover:border-primary-400 hover:bg-primary-50"
        >
          {compressing ? (
            <>
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
              <span className="text-sm">Compressing...</span>
            </>
          ) : (
            <>
              <Camera size={32} />
              <span className="text-sm font-medium">Tap to add photo</span>
              <span className="text-xs">JPG, PNG, WebP — will be compressed</span>
            </>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}
