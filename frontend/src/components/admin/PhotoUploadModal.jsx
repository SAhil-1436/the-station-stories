import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Upload,
  Loader2,
  AlertCircle,
  Camera,
  CheckCircle2,
  Image as ImageIcon,
  Sparkles,
} from 'lucide-react';
import { uploadMenuPhoto } from '../../services/adminApi.js';

export default function PhotoUploadModal({
  isOpen,
  onClose,
  dish = null,
  onSaved,
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isOriginal, setIsOriginal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (dish) {
      setIsOriginal(dish.originalImage ?? dish.isOriginalImage ?? false);
    } else {
      setIsOriginal(false);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
  }, [dish, isOpen]);

  // Clean up object URL when component unmounts or preview changes
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen || !dish) return null;

  const handleFileProcess = (file) => {
    setError(null);
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid format. Please select a JPEG, PNG, or WebP image file.');
      return;
    }

    const maxBytes = 10 * 1024 * 1024; // 10MB
    if (file.size > maxBytes) {
      setError('File is too large. Image size must not exceed 10 MB.');
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileProcess(e.target.files[0]);
    }
  };

  const handleClearSelection = () => {
    setSelectedFile(null);
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please choose an image file to upload.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const updated = await uploadMenuPhoto(dish.id, selectedFile, isOriginal);
      onSaved(updated);
      onClose();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Failed to upload image. Please verify the file and try again.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-plum-dark/60 backdrop-blur-sm animate-fadeIn"
    >
      <div
        className="w-full max-w-lg bg-white rounded-3xl border border-lavender-200 shadow-luxury overflow-hidden animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-lavender-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-lavender-100 border border-gold/30 flex items-center justify-center text-plum-royal">
              <Camera className="w-5 h-5 text-gold-600" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-plum-royal">
                Upload Dish Photograph
              </h3>
              <p className="text-xs text-body-muted">
                {dish.name} &bull; #{dish.id}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-8 h-8 rounded-full flex items-center justify-center text-body-muted hover:text-plum-royal hover:bg-lavender-100 transition-colors disabled:opacity-50"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Current vs New Photo Preview */}
          <div className="grid grid-cols-2 gap-4">
            {/* Current Image */}
            <div>
              <span className="block text-[11px] font-semibold text-body-muted uppercase tracking-wider mb-1.5">
                Current Image
              </span>
              <div className="h-32 rounded-2xl bg-ivory-100 border border-lavender-200 overflow-hidden flex items-center justify-center relative">
                {dish.imageUrl ? (
                  <img
                    src={dish.imageUrl}
                    alt={dish.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div
                  className={`flex flex-col items-center justify-center text-body-muted p-2 ${
                    dish.imageUrl ? 'hidden' : ''
                  }`}
                >
                  <ImageIcon className="w-6 h-6 text-body-muted/60 mb-1" />
                  <span className="text-[10px]">No photo currently set</span>
                </div>
              </div>
            </div>

            {/* New Image Preview */}
            <div>
              <span className="block text-[11px] font-semibold text-body-muted uppercase tracking-wider mb-1.5">
                New Photo Preview
              </span>
              <div className="h-32 rounded-2xl bg-ivory-100 border border-lavender-200 overflow-hidden flex items-center justify-center relative">
                {previewUrl ? (
                  <>
                    <img
                      src={previewUrl}
                      alt="New selection preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleClearSelection}
                      disabled={isSubmitting}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-plum-dark/80 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                      title="Clear photo selection"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center text-body-muted p-2">
                    <Upload className="w-6 h-6 text-body-muted/60 mb-1" />
                    <span className="text-[10px]">Select a file below</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Drag & Drop Upload Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-6 text-center cursor-pointer transition-all ${
              dragActive
                ? 'border-gold bg-lavender-100/70 scale-[0.99]'
                : 'border-lavender-200 hover:border-gold hover:bg-ivory-50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              onChange={handleFileInputChange}
              disabled={isSubmitting}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-2xl bg-lavender-100 border border-gold/30 flex items-center justify-center text-plum-royal mx-auto mb-2">
              <Upload className="w-6 h-6 text-gold-600" />
            </div>
            <p className="text-xs font-semibold text-plum-royal">
              {selectedFile ? selectedFile.name : 'Click to browse or drop photograph here'}
            </p>
            <p className="text-[11px] text-body-muted mt-1">
              Supports JPG, PNG, and WebP (Up to 10 MB)
            </p>
            {selectedFile && (
              <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-medium border border-emerald-200">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB ready
              </span>
            )}
          </div>

          {/* Authentic Kitchen Flag Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-ivory-50 border border-lavender-200">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-gold-600" />
              <div>
                <p className="text-xs font-semibold text-plum-royal">
                  Authentic Restaurant Photograph
                </p>
                <p className="text-[11px] text-body-muted">
                  Displays the gold "Authentic" badge on customer menus
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isOriginal}
                onChange={(e) => setIsOriginal(e.target.checked)}
                disabled={isSubmitting}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-plum-royal"></div>
            </label>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-lavender-50/60 border-t border-lavender-200">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2.5 rounded-full border border-lavender-200 text-xs font-semibold text-body hover:bg-lavender-100 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedFile}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold text-white bg-plum-royal hover:bg-plum-dark shadow-soft transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="w-3.5 h-3.5 text-gold" />
                <span>Save Photograph</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
