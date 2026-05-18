// components/OptimizedImage.jsx
import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

// WebP support detection (cached)
let webpSupportCache = null;

const checkWebPSupport = () => {
  if (webpSupportCache !== null) return webpSupportCache;
  
  const canvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;
  if (!canvas || !canvas.getContext) {
    webpSupportCache = false;
    return false;
  }
  
  webpSupportCache = canvas.toDataURL('image/webp').indexOf('image/webp') === 5;
  return webpSupportCache;
};

// Intersection Observer for lazy loading (cached)
let observer = null;

const getObserver = () => {
  if (typeof window === 'undefined' || !window.IntersectionObserver) return null;
  
  if (!observer) {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.srcset = img.dataset.srcset;
            img.classList.add('loaded');
            observer.unobserve(img);
          }
        });
      },
      {
        rootMargin: '50px 0px',
        threshold: 0.01
      }
    );
  }
  return observer;
};

// Generate srcset for responsive images
const generateSrcSet = (baseName, formats, sizes = [400, 800, 1200, 1600]) => {
  if (!baseName) return '';
  
  return sizes
    .map(size => {
      const paths = formats
        .map(format => `/images/optimized/${baseName}-${size}w.${format} ${size}w`)
        .join(', ');
      return paths;
    })
    .join(', ');
};

const OptimizedImage = ({ 
  src, 
  alt, 
  className = '', 
  width, 
  height,
  priority = false,
  sizes = '100vw',
  quality = 80,
  objectFit = 'cover',
  onLoad,
  onError,
  ...props 
}) => {
  const imgRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [imgSrc, setImgSrc] = useState('');
  const [imgSrcSet, setImgSrcSet] = useState('');

  // Extract base name without extension
  const baseName = src.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '').replace(/^\/images\/(optimized\/)?/i, '');
  
  // Check WebP support
  const webpSupported = checkWebPSupport();
  
  // Define formats based on support
  const formats = webpSupported ? ['webp'] : ['jpg'];
  
  // Define available sizes (should match your generated images)
  const availableSizes = [400, 800, 1200, 1600, 1920];

  useEffect(() => {
    // Generate the appropriate src and srcset
    const srcSet = generateSrcSet(baseName, formats, availableSizes);
    setImgSrcSet(srcSet);
    
    // Set default src based on viewport
    if (typeof window !== 'undefined') {
      const viewportWidth = window.innerWidth;
      let defaultSize = 800; // Default for mobile
      
      if (viewportWidth >= 1920) defaultSize = 1600;
      else if (viewportWidth >= 1200) defaultSize = 1200;
      else if (viewportWidth >= 800) defaultSize = 800;
      else defaultSize = 400;
      
      setImgSrc(`/images/optimized/${baseName}-${defaultSize}w.${formats[0]}`);
    } else {
      setImgSrc(`/images/optimized/${baseName}-800w.${formats[0]}`);
    }
  }, [baseName, formats, availableSizes]);

  // Handle priority (eager) loading
  useEffect(() => {
    if (priority && imgSrc) {
      // Preload critical images
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = imgSrc;
      link.type = `image/${formats[0]}`;
      link.media = `(min-width: ${sizes})`;
      document.head.appendChild(link);
      
      return () => {
        if (link.parentNode) {
          document.head.removeChild(link);
        }
      };
    }
  }, [priority, imgSrc, formats, sizes]);

  // Setup lazy loading with Intersection Observer
  useEffect(() => {
    if (priority || !imgRef.current) return;
    
    const observer = getObserver();
    if (observer && imgRef.current) {
      observer.observe(imgRef.current);
    }
    
    return () => {
      if (observer && imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [priority]);

  // Error fallback
  if (error) {
    return (
      <div 
        style={{
          width: width || '100%',
          height: height || '200px',
          backgroundColor: '#f8f9fa',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#6c757d',
          fontSize: '14px',
          borderRadius: '8px',
          border: '1px dashed #dee2e6'
        }}
        role="img"
        aria-label={`${alt} (image failed to load)`}
      >
        <span>📷</span>
      </div>
    );
  }

  return (
    <div 
      style={{ 
        position: 'relative', 
        width: '100%', 
        height: height ? 'auto' : '100%',
        backgroundColor: '#f8f9fa',
        overflow: 'hidden',
        borderRadius: 'inherit'
      }}
    >
      {/* Shimmer loading effect */}
      {!isLoaded && (
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
            zIndex: 1
          }}
          aria-hidden="true"
        />
      )}
      
      {/* Responsive picture element with source sets */}
      <picture>
        {/* WebP sources for modern browsers */}
        {webpSupported && (
          <source
            srcSet={generateSrcSet(baseName, ['webp'], availableSizes)}
            sizes={sizes}
            type="image/webp"
          />
        )}
        
        {/* JPEG fallback */}
        <source
          srcSet={generateSrcSet(baseName, ['jpg'], availableSizes)}
          sizes={sizes}
          type="image/jpeg"
        />
        
        {/* Actual img element */}
        <img
          ref={imgRef}
          src={priority ? imgSrc : 'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22${width}%22%20height%3D%22${height}%22%2F%3E'}
          data-src={imgSrc}
          data-srcset={imgSrcSet}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          fetchpriority={priority ? 'high' : 'auto'}
          decoding="async"
          width={width}
          height={height}
          onLoad={(e) => {
            setIsLoaded(true);
            if (onLoad) onLoad(e);
          }}
          onError={(e) => {
            setError(true);
            if (onError) onError(e);
          }}
          style={{
            width: '100%',
            height: '100%',
            objectFit: objectFit,
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.2s ease-in-out',
            position: 'relative',
            zIndex: 2
          }}
          className={`optimized-image ${className} ${isLoaded ? 'loaded' : ''}`}
          {...props}
        />
      </picture>
      
      {/* Add CSS animation */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        .optimized-image {
          background-color: #f8f9fa;
        }
        
        @media (prefers-reduced-motion: reduce) {
          .optimized-image {
            transition: none;
          }
          div[style*="shimmer"] {
            animation: none;
            background: #f0f0f0;
          }
        }
      `}} />
    </div>
  );
};

OptimizedImage.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  className: PropTypes.string,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  priority: PropTypes.bool,
  sizes: PropTypes.string,
  quality: PropTypes.number,
  objectFit: PropTypes.oneOf(['cover', 'contain', 'fill', 'none', 'scale-down']),
  onLoad: PropTypes.func,
  onError: PropTypes.func
};

export default OptimizedImage;