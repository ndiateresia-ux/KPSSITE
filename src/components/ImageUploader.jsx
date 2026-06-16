// components/ImageUploader.jsx
import { useState, useRef, useCallback } from 'react';
import { Spinner, Alert } from 'react-bootstrap';

/**
 * ImageUploader Component
 * A reusable image upload component with preview, validation, and base64 conversion
 * 
 * @param {Function} onImageUpload - Callback when image is uploaded, receives (imagePath, base64Data, filename)
 * @param {string} currentImage - Current image URL or base64 string for preview
 * @param {string} label - Label text for the upload area
 * @param {string} folder - Target folder for the image ('gallery' or 'general')
 * @param {number} maxSize - Maximum file size in MB (default: 5)
 * @param {boolean} required - Whether image is required
 */
const ImageUploader = ({ 
  onImageUpload, 
  currentImage = null, 
  label = "Upload Image", 
  folder = 'gallery',
  maxSize = 5,
  required = false
}) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentImage || '');
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef(null);

  /**
   * Generate a unique filename for the uploaded image
   */
  const generateFileName = useCallback((originalName) => {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = originalName.split('.').pop().toLowerCase();
    const baseName = originalName.replace(/\.[^/.]+$/, '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .substring(0, 30);
    
    return `${baseName}-${timestamp}-${randomString}.${extension}`;
  }, []);

  /**
   * Convert file to base64
   */
  const fileToBase64 = useCallback((file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  }, []);

  /**
   * Validate file before upload
   */
  const validateFile = useCallback((file) => {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a valid image file (JPEG, PNG, WEBP, or GIF)');
      return false;
    }

    // Check file size (maxSize in MB)
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      setError(`File size should be less than ${maxSize}MB (current: ${fileSizeMB.toFixed(2)}MB)`);
      return false;
    }

    setError(null);
    return true;
  }, [maxSize]);

  /**
   * Handle file selection
   */
  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file
    if (!validateFile(file)) return;

    setUploading(true);
    setError(null);

    try {
      // Convert to base64
      const base64String = await fileToBase64(file);
      
      // Generate unique filename
      const uniqueFileName = generateFileName(file.name);
      
      // Determine the path based on folder
      const imagePath = folder === 'gallery' 
        ? `/images/optimized/gallery/${uniqueFileName}`
        : `/images/optimized/${uniqueFileName}`;
      
      // Set preview
      setPreview(base64String);
      setFileName(file.name);
      
      // Call the parent callback with the image data
      onImageUpload(imagePath, base64String, uniqueFileName, file);
      
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  /**
   * Trigger file input dialog
   */
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  /**
   * Remove current image
   */
  const handleRemoveImage = (e) => {
    e.stopPropagation();
    setPreview('');
    setFileName('');
    setError(null);
    onImageUpload(null, null, null, null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="image-uploader">
      <Form.Label className="fw-semibold small">
        {label}
        {required && <span className="text-danger ms-1">*</span>}
      </Form.Label>
      
      <div 
        className={`image-upload-area ${preview ? 'has-image' : ''} ${error ? 'has-error' : ''}`}
        onClick={triggerFileInput}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            triggerFileInput();
          }
        }}
        style={{
          border: `2px dashed ${error ? '#dc3545' : '#dee2e6'}`,
          borderRadius: '12px',
          padding: preview ? '0.5rem' : '1.5rem',
          textAlign: 'center',
          cursor: 'pointer',
          backgroundColor: error ? '#fff5f5' : '#f8f9fa',
          transition: 'all 0.2s ease',
          position: 'relative'
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
        
        {uploading ? (
          <div className="text-center py-4">
            <Spinner animation="border" size="sm" variant="primary" />
            <p className="mt-2 small text-muted mb-0">Uploading image...</p>
          </div>
        ) : preview ? (
          <div className="image-preview-container">
            <img 
              src={preview} 
              alt="Preview" 
              className="image-preview"
              style={{
                maxWidth: '100%',
                maxHeight: '200px',
                objectFit: 'contain',
                borderRadius: '8px'
              }}
            />
            <div className="image-preview-overlay">
              <button 
                type="button"
                className="btn-change-image"
                onClick={(e) => {
                  e.stopPropagation();
                  triggerFileInput();
                }}
                style={{
                  background: 'rgba(13, 101, 251, 0.9)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '20px',
                  padding: '4px 12px',
                  fontSize: '12px',
                  marginRight: '8px',
                  cursor: 'pointer'
                }}
              >
                <i className="fas fa-sync-alt me-1"></i> Change
              </button>
              <button 
                type="button"
                className="btn-remove-image"
                onClick={handleRemoveImage}
                style={{
                  background: 'rgba(220, 53, 69, 0.9)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '20px',
                  padding: '4px 12px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                <i className="fas fa-trash me-1"></i> Remove
              </button>
            </div>
            {fileName && (
              <div className="image-filename mt-2">
                <small className="text-muted">{fileName}</small>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-4">
            <i className="fas fa-cloud-upload-alt fa-3x text-muted mb-2" style={{ opacity: 0.5 }}></i>
            <p className="mb-1 small text-muted">Click to upload image</p>
            <p className="text-muted small mb-0">
              <i className="fas fa-info-circle me-1"></i>
              PNG, JPG, WEBP, GIF (max {maxSize}MB)
            </p>
          </div>
        )}
      </div>
      
      {error && (
        <div className="mt-2">
          <small className="text-danger">
            <i className="fas fa-exclamation-circle me-1"></i>
            {error}
          </small>
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{ __html: `
        .image-upload-area {
          transition: all 0.2s ease;
        }
        .image-upload-area:hover:not(.has-image) {
          border-color: #0d65fb !important;
          background-color: #f0f4ff !important;
        }
        .image-upload-area.has-image:hover .image-preview-overlay {
          opacity: 1;
        }
        .image-preview-container {
          position: relative;
        }
        .image-preview-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.2s ease;
          border-radius: 8px;
        }
        .btn-change-image:hover,
        .btn-remove-image:hover {
          transform: translateY(-1px);
        }
      `}} />
    </div>
  );
};

// If using React-Bootstrap Form, import it
import { Form } from 'react-bootstrap';

export default ImageUploader;