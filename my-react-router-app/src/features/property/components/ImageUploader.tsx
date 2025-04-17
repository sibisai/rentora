// src/features/property/components/ImageUploader.tsx
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001';

type Props = {
  /** Mongo ID – undefined on the “Create” page */
  propertyId?: string;
  /** Controlled array of image URLs */
  value: string[];
  onChange: (urls: string[]) => void;
};

export default function ImageUploader({ propertyId, value, onChange }: Props) {
  const [previews, setPreviews] = useState<string[]>([]);

  // Remove any previews that have since been uploaded
  useEffect(() => {
    setPreviews((curr) => curr.filter((p) => !value.includes(p)));
  }, [value]);

  // Keep a ref so we can build incremental arrays
  const currentImagesRef = useRef<string[]>(value);
  useEffect(() => {
    currentImagesRef.current = value;
  }, [value]);

  const onDrop = useCallback(async (files: File[]) => {
    // 1) Create base‑64 previews immediately
    const newPreviews = await Promise.all(
      files.map(
        (file) =>
          new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          })
      )
    );
    setPreviews((curr) => [...curr, ...newPreviews]);

    // 2) If we’re still on “create” (no propertyId), just merge into value
    if (!propertyId) {
      const merged = [...currentImagesRef.current, ...newPreviews];
      onChange(merged);
      currentImagesRef.current = merged;
      return;
    }

    // 3) Otherwise upload each file to your backend S3 endpoint
    let updatedUrls = [...currentImagesRef.current];
    await Promise.all(
      files.map(async (file, idx) => {
        try {
          const formData = new FormData();
          formData.append('images', file); // multer.array('images')
          const { data } = await axios.post<{ location: string }>(
            `${API_BASE}/image/upload/${propertyId}`,
            formData
          );
          // remove this one preview
          setPreviews((curr) => curr.filter((p) => p !== newPreviews[idx]));
          updatedUrls.push(data.location);
        } catch (err) {
          console.error('Image upload failed:', err);
        }
      })
    );
    onChange(updatedUrls);
    currentImagesRef.current = updatedUrls;
  }, [propertyId, onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': [] },
    onDrop,
  });

  return (
    <div>
      <div
        {...getRootProps()}
        className="border-2 border-dashed rounded p-6 text-center cursor-pointer"
      >
        <input {...getInputProps()} />
        {isDragActive
          ? 'Drop images here…'
          : 'Drag & drop or click to select'}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {[...previews, ...value].map((src) => (
          <div key={src} className="relative">
            <img src={src} alt="preview" className="h-24 w-full object-cover rounded" />
            {value.includes(src) && (
              <button
                type="button"
                onClick={() => {
                  const filtered = value.filter((u) => u !== src);
                  onChange(filtered);
                  currentImagesRef.current = filtered;
                }}
                className="absolute top-1 right-1 bg-white rounded-full px-2"
                aria-label="Remove image"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}