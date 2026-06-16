// components/ImageUploader.jsx
import { useState, useRef, useCallback } from 'react';
import { Form, Spinner } from 'react-bootstrap';

/**
 * ImageUploader Component — uses ImgBB for hosting (no localStorage base64)
 *
 * Setup:
 *   1. Sign up free at https://imgbb.com
 *   2. Get your API key at https://api.imgbb.com
 *   3. Add to your .env file:  VITE_IMGBB_API_KEY=your_key_here
 *
 * @param {Function} onImageUpload - Callback when upload succeeds: (imageUrl, deleteUrl, filename)
 *                                   imageUrl   — direct URL to the uploaded image (use this to display/save)
 *                                   deleteUrl  — ImgBB URL to delete the image later if needed
 *                                   filename   — original file name
 * @param {string}   currentImage  - Existing image URL to show as preview
 * @param {string}   label         - Label text shown above the upload area
 * @param {number}   maxSize       - Max file size in MB (default: 5)
 * @param {boolean}  required      - Show a red asterisk on the label
 */
const ImageUploader = ({
  onImageUpload,
  currentImage = null,
  label = 'Upload Image',
  maxSize = 5,
  required = false,
}) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentImage || '');
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // ─── Validation ────────────────────────────────────────────────────────────

  const validateFile = useCallback(
    (file) => {
      const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowed.includes(file.type)) {
        setError('Please upload a valid image (JPEG, PNG, WEBP, or GIF).');
        return false;
      }
      const sizeMB = file.size / (1024 * 1024);
      if (sizeMB > maxSize) {
        setError(`Image must be under ${maxSize} MB (yours is ${sizeMB.toFixed(2)} MB).`);
        return false;
      }
      setError(null);
      return true;
    },
    [maxSize]
  );

  // ─── Upload to ImgBB ───────────────────────────────────────────────────────

  const uploadToImgBB = useCallback(async (file) => {
    const apiKey = import.meta.env.VITE_IMGBB_API_KEY;

    if (!apiKey) {
      throw new Error(
        'ImgBB API key is missing. Add VITE_IMGBB_API_KEY to your .env file.'
      );
    }

    const formData = new FormData();
    formData.append('image', file);
    // Optional: give the image a name on ImgBB (strips extension automatically)
    formData.append('name', file.name.replace(/\.[^/.]+$/, ''));

    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${apiKey}`,
      { method: 'POST', body: formData }
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`ImgBB upload failed (${response.status}): ${text}`);
    }

    const json = await response.json();

    if (!json.success) {
      throw new Error(`ImgBB error: ${json.error?.message || 'Unknown error'}`);
    }

    return {
      imageUrl: json.data.url,          // use this everywhere you previously stored the base64
      displayUrl: json.data.display_url, // same image, slightly smaller — good for thumbnails
      deleteUrl: json.data.delete_url,   // save this if you want to delete the image later
    };
  }, []);

  // ─── File selection handler ────────────────────────────────────────────────

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!validateFile(file)) return;

    setUploading(true);
    setError(null);

    // Show a local preview immediately so the user sees something while uploading
    const localPreviewUrl = URL.createObjectURL(file);
    setPreview(localPreviewUrl);

    try {
      const { imageUrl, deleteUrl } = await uploadToImgBB(file);

      // Swap the temporary blob URL for the real hosted URL
      URL.revokeObjectURL(localPreviewUrl);
      setPreview(imageUrl);
      setFileName(file.name);

      // Pass the permanent URL back to the parent
      // Parents that previously received (imagePath, base64) now get (imageUrl, imageUrl, filename)
      // so you can drop-in replace without changing every manager component.
      onImageUpload(imageUrl, imageUrl, file.name, deleteUrl);
    } catch (err) {
      console.error('Image upload error:', err);
      URL.revokeObjectURL(localPreviewUrl);
      setPreview(currentImage || '');
      setError(
        err.message.includes('API key')
          ? err.message
          : 'Upload failed. Check your internet connection and try again.'
      );
    } finally {
      setUploading(false);
      // Reset input so the same file can be re-selected after an error
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // ─── Helpers ───────────────────────────────────────────────────────────────

  const triggerFileInput = () => fileInputRef.current?.click();

  const handleRemoveImage = (e) => {
    e.stopPropagation();
    setPreview('');
    setFileName('');
    setError(null);
    onImageUpload(null, null, null, null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="image-uploader">
      <Form.Label className="fw-semibold small">
        {label}
        {required && <span className="text-danger ms-1">*</span>}
      </Form.Label>

      <div
        className={`image-upload-area${preview ? ' has-image' : ''}${error ? ' has-error' : ''}`}
        onClick={!uploading ? triggerFileInput : undefined}
        role="button"
        tabIndex={0}
        aria-label="Image upload area"
        onKeyDown={(e) => {
          if (!uploading && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            triggerFileInput();
          }
        }}
        style={{
          border: `2px dashed ${error ? '#dc3545' : '#dee2e6'}`,
          borderRadius: '12px',
          padding: preview ? '0.5rem' : '1.5rem',
          textAlign: 'center',
          cursor: uploading ? 'not-allowed' : 'pointer',
          backgroundColor: error ? '#fff5f5' : '#f8f9fa',
          transition: 'all 0.2s ease',
          position: 'relative',
          minHeight: '100px',
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          aria-label="Choose image file"
        />

        {/* ── Uploading state ── */}
        {uploading && (
          <div className="text-center py-4">
            <Spinner animation="border" size="sm" variant="primary" />
            <p className="mt-2 small text-muted mb-0">Uploading to ImgBB…</p>
          </div>
        )}

        {/* ── Preview state ── */}
        {!uploading && preview && (
          <div className="image-preview-container" style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
            <img
              src={preview}
              alt="Preview"
              style={{
                maxWidth: '100%',
                maxHeight: '200px',
                objectFit: 'contain',
                borderRadius: '8px',
                display: 'block',
                margin: '0 auto',
              }}
            />

            {/* Hover overlay with Change / Remove buttons */}
            <div className="imgbb-overlay">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); triggerFileInput(); }}
                style={overlayBtnStyle('#0d65fb')}
              >
                <i className="fas fa-sync-alt me-1"></i> Change
              </button>
              <button
                type="button"
                onClick={handleRemoveImage}
                style={overlayBtnStyle('#dc3545')}
              >
                <i className="fas fa-trash me-1"></i> Remove
              </button>
            </div>

            {fileName && (
              <div className="mt-2">
                <small className="text-muted">
                  <i className="fas fa-check-circle text-success me-1"></i>
                  {fileName} — hosted on ImgBB
                </small>
              </div>
            )}
          </div>
        )}

        {/* ── Empty state ── */}
        {!uploading && !preview && (
          <div className="text-center py-3">
            <i
              className="fas fa-cloud-upload-alt fa-3x text-muted mb-2"
              style={{ opacity: 0.4 }}
            ></i>
            <p className="mb-1 small text-muted">Click to upload image</p>
            <p className="text-muted small mb-0">
              <i className="fas fa-info-circle me-1"></i>
              PNG, JPG, WEBP, GIF — max {maxSize} MB
            </p>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-2">
          <small className="text-danger">
            <i className="fas fa-exclamation-circle me-1"></i>
            {error}
          </small>
        </div>
      )}

      <style>{`
        .image-upload-area:hover:not(.has-image):not(.has-error) {
          border-color: #0d65fb !important;
          background-color: #f0f4ff !important;
        }
        .image-preview-container:hover .imgbb-overlay {
          opacity: 1;
        }
        .imgbb-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.55);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          opacity: 0;
          transition: opacity 0.2s ease;
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
};

// ─── Tiny helper for overlay button style ─────────────────────────────────────
const overlayBtnStyle = (bg) => ({
  background: bg,
  color: 'white',
  border: 'none',
  borderRadius: '20px',
  padding: '5px 14px',
  fontSize: '12px',
  cursor: 'pointer',
  transition: 'transform 0.15s ease',
});

export default ImageUploader;