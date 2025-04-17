import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { v4 as uuid } from 'uuid';
import axios from 'axios';

type Props = {
  propertyId?: string;
  value: string[];
  onChange: (urls: string[]) => void;
};

export default function ImageUploader({ propertyId, value, onChange }: Props) {
  const onDrop = useCallback(async (files: File[]) => {
    // 1️⃣ optimistic previews
    const previews = await Promise.all(
      files.map(
        f =>
          new Promise<string>(res => {
            const reader = new FileReader();
            reader.onload = () => res(reader.result as string);
            reader.readAsDataURL(f);
          }),
      ),
    );
    onChange([...value, ...previews]);

    // 2️⃣ upload each file (skip if no propertyId yet)
    await Promise.all(
      files.map(async (file, idx) => {
        if (!propertyId) return; // create‑page: wait until after save

        const fd = new FormData();
        fd.append('image', file);

        try {
          const { data } = await axios.post<{ location: string }>(
            `/image/upload/${propertyId}`,
            fd,
          );

          const next = value
            .filter(u => u !== previews[idx]) // remove just this preview
            .concat(data.location);

          onChange(next);
        } catch (err) {
          console.error('Image upload failed:', err);
          // TODO: toast + maybe remove the preview
        }
      }),
    );
  }, [propertyId, value, onChange]);

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

      {/* thumbnails */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        {value.map(src => (
          <div key={uuid()} className="relative">
            <img src={src} className="h-24 w-full object-cover rounded" />
            <button
              type="button"
              onClick={() => onChange(value.filter(u => u !== src))}
              className="absolute top-1 right-1 bg-white rounded-full px-2"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}