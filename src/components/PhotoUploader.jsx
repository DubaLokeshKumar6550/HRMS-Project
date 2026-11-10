import React, { useState, useRef } from 'react';
import Drawer from './Drawer';
import { Upload, Trash2, Camera, AlertCircle, Check } from 'lucide-react';

export default function PhotoUploader({
  isOpen,
  onClose,
  currentPhoto,
  onSavePhoto,
  onRemovePhoto,
  userName = 'User',
}) {
  const [previewUrl, setPreviewUrl] = useState(currentPhoto || null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    setError(null);
    if (!file) return;

    // Validate type (JPG / PNG)
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      setError('Only JPG or PNG images are allowed.');
      return;
    }

    // Validate size (max 2 MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('File size exceeds 2 MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (previewUrl && onSavePhoto) {
      onSavePhoto(previewUrl);
      onClose();
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    if (onRemovePhoto) {
      onRemovePhoto();
      onClose();
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Update Profile Photo"
      subtitle="PNG or JPG, maximum 2 MB"
      width="440px"
    >
      <div className="flex flex-col gap-5 text-[13px]">
        {/* Error message */}
        {error && (
          <div className="p-3 rounded-xl bg-bad/15 border border-bad/40 text-bad flex items-center gap-2 text-[12px]">
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Square Crop Preview */}
        <div className="flex flex-col items-center justify-center gap-3 py-4">
          <div className="relative w-44 h-44 rounded-2xl bg-surface2 border-2 border-dashed border-line overflow-hidden flex items-center justify-center group shadow-inner">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Profile Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted">
                <Camera size={36} strokeWidth={1.5} />
                <span className="text-[12px] font-medium">No photo selected</span>
              </div>
            )}
          </div>

          <span className="text-[11px] text-muted font-mono">
            Square 1:1 preview will be visible to your team
          </span>
        </div>

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/jpeg, image/png"
          className="hidden"
        />

        {/* Action Controls */}
        <div className="flex flex-col gap-2 pt-2 border-t border-line/40">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2.5 px-4 rounded-xl bg-surface2 border border-line hover:border-accent text-ink font-semibold flex items-center justify-center gap-2 transition-colors active:scale-98"
          >
            <Upload size={15} />
            <span>{previewUrl ? 'Choose different image' : 'Select image from device'}</span>
          </button>

          {previewUrl && (
            <button
              type="button"
              onClick={handleRemove}
              className="w-full py-2 px-4 rounded-xl text-bad hover:bg-bad/10 text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Trash2 size={13} />
              <span>Remove current photo</span>
            </button>
          )}
        </div>

        {/* Save & Cancel */}
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-line mt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-surface2 text-muted hover:text-ink border border-line text-[12.5px] font-semibold"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!previewUrl || previewUrl === currentPhoto}
            onClick={handleSave}
            className="px-4 py-2 rounded-xl bg-accent text-on-accent text-[12.5px] font-bold shadow-sm hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            <Check size={14} strokeWidth={2.2} />
            <span>Save photo</span>
          </button>
        </div>
      </div>
    </Drawer>
  );
}

