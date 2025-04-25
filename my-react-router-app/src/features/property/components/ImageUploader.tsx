import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import '../styles/property-forms.css';

// const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';
const API = import.meta.env.VITE_API_URL;

type Props = {
  propertyId?: string;
  value: string[];
  onChange: (urls: string[]) => void;
};

export default function ImageUploader({ propertyId, value, onChange }: Props) {
  const [previews, setPreviews] = useState<string[]>([]);

  // remove any previews that are now in `value`
  useEffect(() => {
    setPreviews((curr) => curr.filter((p) => !value.includes(p)));
  }, [value]);

  const currentImagesRef = useRef<string[]>(value);
  useEffect(() => {
    currentImagesRef.current = value;
  }, [value]);

  const onDrop = useCallback(async (files: File[]) => {
    // 1) generate local previews
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

    // 2) if no propertyId, just merge previews into value
    if (!propertyId) {
      const merged = [...currentImagesRef.current, ...newPreviews];
      onChange(merged);
      currentImagesRef.current = merged;
      return;
    }

    // 3) otherwise upload to server
    let updatedUrls = [...currentImagesRef.current];
    await Promise.all(
      files.map(async (file, idx) => {
        try {
          const formData = new FormData();
          formData.append('images', file);
          const { data } = await axios.post<{ location: string }>(
            `${API}/image/upload/${propertyId}`,
            formData
          );
          // drop that preview
          setPreviews((curr) => curr.filter((p) => p !== newPreviews[idx]));
          updatedUrls.push(data.location);
        } catch (err) {
          console.error('Upload failed:', err);
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
      {/* dropzone using your CSS */}
      <div {...getRootProps()} className="dropzone">
        <input {...getInputProps()} />
        {isDragActive
          ? 'Release to upload images'
          : 'Drag & drop images here, or click to select'}
      </div>

      {/* thumbnails using your CSS */}
      <div className="preview-container">
        {[...previews, ...value].map((src) => (
          <div key={src} style={{ position: 'relative' }}>
            <img src={src} alt="preview" />
            {value.includes(src) && (
              <button
                type="button"
                onClick={() => {
                  const filtered = value.filter((u) => u !== src);
                  onChange(filtered);
                  currentImagesRef.current = filtered;
                }}
                style={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  background: 'rgba(255,255,255,0.8)',
                  border: 'none',
                  borderRadius: '50%',
                  width: 24,
                  height: 24,
                  cursor: 'pointer',
                  padding: 0
                }}
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