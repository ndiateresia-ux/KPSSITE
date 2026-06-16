// pages/Gallery.jsx - Updated to use JSON Bin (No localStorage)
import { Helmet } from "react-helmet-async";
import { Container, Row, Col } from "react-bootstrap";
import { useState, useEffect, useCallback, lazy, Suspense, memo, useMemo, useRef } from "react";
import { getGallery } from "../services/dataService";

// Lazy load non-critical components
const GetInTouch = lazy(() => import("../components/GetInTouch"));

// ==================== ORIGINAL GALLERY DATA (PRESERVED - DO NOT MODIFY) ====================
const getDefaultGalleryData = () => ({
  all: [
    { id: 1, filename: "academics1", alt: "Classroom learning", category: "academics" },
    { id: 2, filename: "academics2", alt: "Science experiment", category: "academics" },
    { id: 3, filename: "academics3", alt: "Library reading", category: "academics" },
    { id: 4, filename: "academics4", alt: "Computer class", category: "academics" },
    { id: 5, filename: "sports1", alt: "Football match", category: "sports" },
    { id: 6, filename: "sports2", alt: "Athletics", category: "sports" },
    { id: 7, filename: "sports5", alt: "Netball", category: "sports" },
    { id: 8, filename: "sports4", alt: "Swimming gala", category: "sports" },
    { id: 9, filename: "cultural1", alt: "Traditional dance", category: "cultural" },
    { id: 10, filename: "cultural2", alt: "Music festival", category: "cultural" },
    { id: 11, filename: "cultural3", alt: "Drama performance", category: "cultural" },
    { id: 12, filename: "cultural4", alt: "Art exhibition", category: "cultural" },
    { id: 13, filename: "events1", alt: "Graduation", category: "events" },
    { id: 14, filename: "events2", alt: "Prize giving day", category: "events" },
    { id: 16, filename: "events5", alt: "Open day", category: "events" },
    { id: 17, filename: "facilities1", alt: "School library", category: "facilities" },
    { id: 18, filename: "facilities2", alt: "Science lab", category: "facilities" },
    { id: 19, filename: "facilities3", alt: "Playground", category: "facilities" },
    { id: 20, filename: "facilities4", alt: "Computer lab", category: "facilities" },
    { id: 21, filename: "facilities5", alt: "Dorm", category: "facilities" },
    { id: 22, filename: "facilities6", alt: "dorm", category: "facilities" },
    { id: 23, filename: "facilities7", alt: "playground", category: "facilities" },
    { id: 24, filename: "slide2", alt: "School van", category: "facilities" },
  ],
  academics: [
    { id: 1, filename: "academics1", alt: "Classroom learning" },
    { id: 2, filename: "academics2", alt: "Science experiment" },
    { id: 3, filename: "academics3", alt: "Library reading" },
    { id: 4, filename: "academics4", alt: "Computer class" },
    { id: 25, filename: "academics5", alt: "Academic tour" },
    { id: 26, filename: "practicals2", alt: "practicals" },
  ],
  sports: [
    { id: 5, filename: "sports1", alt: "Football match" },
    { id: 6, filename: "sports2", alt: "Athletics" },
    { id: 7, filename: "sports5", alt: "Netball" },
    { id: 8, filename: "sports4", alt: "Swimming gala" },
  ],
  cultural: [
    { id: 9, filename: "cultural1", alt: "Traditional dance" },
    { id: 10, filename: "cultural2", alt: "Music festival" },
    { id: 11, filename: "cultural3", alt: "Drama performance" },
    { id: 12, filename: "cultural4", alt: "Art exhibition" },
  ],
  events: [
    { id: 13, filename: "events1", alt: "Graduation" },
    { id: 14, filename: "events2", alt: "Prize giving day" },
    { id: 15, filename: "events3", alt: "Parents day" },
    { id: 16, filename: "events5", alt: "Open day" },
  ],
  facilities: [
    { id: 17, filename: "facilities1", alt: "School library" },
    { id: 18, filename: "facilities2", alt: "Science lab" },
    { id: 19, filename: "facilities3", alt: "Playground" },
    { id: 20, filename: "facilities4", alt: "Computer lab" },
    { id: 21, filename: "facilities5", alt: "Dorm" },
    { id: 22, filename: "facilities6", alt: "dorm" },
    { id: 23, filename: "facilities7", alt: "playground" },
    { id: 24, filename: "slide2", alt: "School van" },
    { id: 27, filename: "facilities8", alt: "School van" },
  ]
});

// ==================== MERGE GALLERY DATA ====================
const mergeGalleryData = (defaultData, adminItems) => {
  // Start with a deep copy of default data
  const mergedData = {
    all: [...defaultData.all],
    academics: [...defaultData.academics],
    sports: [...defaultData.sports],
    cultural: [...defaultData.cultural],
    events: [...defaultData.events],
    facilities: [...defaultData.facilities]
  };
  
  // If no admin items, return defaults
  if (!adminItems || adminItems.length === 0) {
    return mergedData;
  }
  
  // Track existing filenames to avoid duplicates
  const existingFilenames = new Set();
  mergedData.all.forEach(img => existingFilenames.add(img.filename));
  
  // Add admin items that don't already exist
  adminItems.forEach((item) => {
    // Skip if filename already exists in default data
    if (existingFilenames.has(item.filename)) {
      return;
    }
    
    // Generate alt text
    const altText = item.alt || item.filename.replace(/-/g, ' ').replace(/\d+$/, '').trim();
    
    const newId = Math.max(...mergedData.all.map(img => img.id), 0) + 1;
    const imageObj = {
      id: newId,
      filename: item.filename,
      alt: altText,
      category: item.category || 'facilities',
      imageUrl: item.imageUrl || `/images/optimized/gallery/${item.filename}.jpg`,
      isUploaded: true // Flag to identify uploaded images
    };
    
    // Add to 'all' category
    mergedData.all.push(imageObj);
    existingFilenames.add(item.filename);
    
    // Add to specific category
    const category = item.category || 'facilities';
    if (mergedData[category]) {
      mergedData[category].push(imageObj);
    }
  });
  
  return mergedData;
};

// ==================== OPTIMIZED GALLERY IMAGE COMPONENT ====================
const GalleryImage = memo(({ image, onClick, priority = false }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef(null);
  const imageId = `gallery-img-${image.id}`;

  // Get the image source
  const getImageSrc = useCallback(() => {
    if (image.imageUrl) {
      return image.imageUrl;
    }
    return `/images/optimized/gallery/${image.filename}.jpg`;
  }, [image.imageUrl, image.filename]);

  // Get webp source (only for non-uploaded images)
  const getWebpSrc = useCallback(() => {
    if (image.imageUrl) {
      return null; // Uploaded images use their URL
    }
    return `/images/optimized/gallery/${image.filename}.webp`;
  }, [image.imageUrl, image.filename]);

  // Preload priority images
  useEffect(() => {
    if (priority && image.filename && !image.imageUrl) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = `/images/optimized/gallery/${image.filename}.webp`;
      link.type = 'image/webp';
      document.head.appendChild(link);
      
      return () => {
        if (link.parentNode) document.head.removeChild(link);
      };
    }
  }, [priority, image.filename, image.imageUrl]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(image);
    }
  }, [onClick, image]);

  const imageSrc = getImageSrc();
  const webpSrc = getWebpSrc();
  const isUploaded = !!image.imageUrl;

  // Error fallback
  if (error) {
    return (
      <div
        className="gallery-item bg-light-custom"
        onClick={() => onClick(image)}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-label={`View larger image of ${image.alt}`}
        style={{
          position: 'relative',
          borderRadius: '12px',
          overflow: 'hidden',
          aspectRatio: '4/3',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-dark)',
          fontSize: '0.875rem'
        }}
      >
        <div className="text-center">
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }} aria-hidden="true">📷</div>
          <div>{image.alt}</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="gallery-item"
      onClick={() => onClick(image)}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`View larger image of ${image.alt}`}
      style={{
        position: 'relative',
        borderRadius: '12px',
        overflow: 'hidden',
        aspectRatio: '4/3',
        cursor: 'pointer',
        backgroundColor: 'var(--gray-light)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease'
      }}
    >
      {/* Loading skeleton */}
      {!loaded && (
        <div 
          className="image-skeleton"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1,
            background: 'linear-gradient(90deg, #f0f2f5 25%, #e2e6ea 50%, #f0f2f5 75%)',
            backgroundSize: '200% 100%',
            animation: 'skeleton-loading 1.5s infinite'
          }}
          aria-hidden="true"
        />
      )}
      
      {isUploaded ? (
        // For uploaded images (ImgBB URLs)
        <img
          ref={imgRef}
          id={imageId}
          src={imageSrc}
          alt={image.alt}
          loading={priority ? "eager" : "lazy"}
          fetchpriority={priority ? "high" : "auto"}
          decoding="async"
          width="400"
          height="300"
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={`curriculum-image ${loaded ? 'loaded' : ''}`}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            position: 'relative',
            zIndex: 2
          }}
        />
      ) : (
        // For default images with webp support
        <picture>
          {webpSrc && (
            <source 
              srcSet={webpSrc}
              type="image/webp"
            />
          )}
          <img
            ref={imgRef}
            id={imageId}
            src={imageSrc}
            alt={image.alt}
            loading={priority ? "eager" : "lazy"}
            fetchpriority={priority ? "high" : "auto"}
            decoding="async"
            width="400"
            height="300"
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
            className={`curriculum-image ${loaded ? 'loaded' : ''}`}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              position: 'relative',
              zIndex: 2
            }}
          />
        </picture>
      )}
    </div>
  );
});

GalleryImage.displayName = 'GalleryImage';

// ==================== FILTER BUTTON COMPONENT ====================
const FilterButton = memo(({ category, isActive, onClick }) => {
  const buttonRef = useRef(null);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(category.id);
    }
  }, [onClick, category.id]);

  return (
    <button
      ref={buttonRef}
      onClick={() => onClick(category.id)}
      onKeyDown={handleKeyDown}
      aria-pressed={isActive}
      aria-label={`${category.name} photos${isActive ? ', currently selected' : ''}`}
      className={`filter-button ${isActive ? 'active' : ''}`}
      style={{
        padding: '0.5rem 1rem',
        borderRadius: '40px',
        border: isActive ? 'none' : '2px solid var(--gray-light)',
        backgroundColor: isActive ? 'var(--navy)' : 'transparent',
        color: isActive ? 'var(--white)' : 'var(--text-dark)',
        fontWeight: '500',
        fontSize: '0.9rem',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        whiteSpace: 'nowrap',
        minHeight: '44px',
        minWidth: '44px'
      }}
    >
      <span style={{ fontSize: '1.1rem' }} aria-hidden="true">{category.icon}</span>
      <span>{category.name}</span>
      {isActive && <span className="visually-hidden"> (selected)</span>}
    </button>
  );
});

FilterButton.displayName = 'FilterButton';

// ==================== LIGHTBOX MODAL ====================
const LightboxModal = memo(({ selectedImage, onClose, onPrev, onNext }) => {
  const modalRef = useRef(null);
  const closeButtonRef = useRef(null);

  const getImageSrc = useCallback(() => {
    if (selectedImage?.imageUrl) {
      return selectedImage.imageUrl;
    }
    return `/images/optimized/gallery/${selectedImage?.filename}.jpg`;
  }, [selectedImage]);

  const getWebpSrc = useCallback(() => {
    if (selectedImage?.imageUrl) {
      return null;
    }
    return `/images/optimized/gallery/${selectedImage?.filename}.webp`;
  }, [selectedImage]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      onPrev();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      onNext();
    }
  }, [onClose, onPrev, onNext]);

  useEffect(() => {
    if (modalRef.current) {
      closeButtonRef.current?.focus();
    }
    
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [handleKeyDown]);

  if (!selectedImage) return null;

  const imageSrc = getImageSrc();
  const webpSrc = getWebpSrc();
  const isUploaded = !!selectedImage.imageUrl;

  return (
    <div
      ref={modalRef}
      className="modal-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.95)',
        zIndex: 100000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        backdropFilter: 'blur(5px)'
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Image lightbox"
      tabIndex={-1}
    >
      <button
        ref={closeButtonRef}
        onClick={onClose}
        className="modal-close-btn"
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'var(--white)',
          border: 'none',
          borderRadius: '50%',
          width: '44px',
          height: '44px',
          fontSize: '1.2rem',
          cursor: 'pointer',
          zIndex: 100001,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          transition: 'transform 0.2s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        aria-label="Close lightbox"
      >
        ✕
      </button>
      
      <button
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
        className="lightbox-nav prev"
        style={{
          position: 'absolute',
          left: '20px',
          background: 'rgba(255,255,255,0.2)',
          border: 'none',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          fontSize: '1.5rem',
          cursor: 'pointer',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background-color 0.2s ease, transform 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.3)';
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)';
          e.currentTarget.style.transform = 'scale(1)';
        }}
        aria-label="Previous image"
      >
        ‹
      </button>
      
      <button
        onClick={(e) => { e.stopPropagation(); onNext(); }}
        className="lightbox-nav next"
        style={{
          position: 'absolute',
          right: '20px',
          background: 'rgba(255,255,255,0.2)',
          border: 'none',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          fontSize: '1.5rem',
          cursor: 'pointer',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background-color 0.2s ease, transform 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.3)';
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)';
          e.currentTarget.style.transform = 'scale(1)';
        }}
        aria-label="Next image"
      >
        ›
      </button>

      <div
        style={{
          maxWidth: '90vw',
          maxHeight: '90vh'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {isUploaded ? (
          <img
            src={imageSrc}
            alt={selectedImage.alt}
            style={{
              maxWidth: '100%',
              maxHeight: '90vh',
              objectFit: 'contain',
              borderRadius: '8px'
            }}
            loading="eager"
          />
        ) : (
          <picture>
            {webpSrc && (
              <source 
                srcSet={webpSrc}
                type="image/webp"
              />
            )}
            <img
              src={imageSrc}
              alt={selectedImage.alt}
              style={{
                maxWidth: '100%',
                maxHeight: '90vh',
                objectFit: 'contain',
                borderRadius: '8px'
              }}
              loading="eager"
            />
          </picture>
        )}
        <p style={{ 
          color: 'white', 
          textAlign: 'center', 
          marginTop: '1rem',
          fontSize: '0.9rem'
        }}>
          {selectedImage.alt}
        </p>
      </div>
    </div>
  );
});

LightboxModal.displayName = 'LightboxModal';

// ==================== MAIN GALLERY COMPONENT ====================
function Gallery() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [visibleImages, setVisibleImages] = useState(9);
  const [loading, setLoading] = useState(false);
  const [galleryData, setGalleryData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const announcerRef = useRef(null);

  // Categories definition
  const categories = useMemo(() => [
    { id: "all", name: "All", icon: "🖼️" },
    { id: "academics", name: "Academics", icon: "📚" },
    { id: "sports", name: "Sports", icon: "⚽" },
    { id: "cultural", name: "Cultural", icon: "🎭" },
    { id: "events", name: "Events", icon: "🎉" },
    { id: "facilities", name: "Facilities", icon: "🏫" }
  ], []);

  // Load gallery data from JSON Bin (No localStorage)
  const loadGalleryData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Get default data first
      const defaultData = getDefaultGalleryData();
      
      // Try to load admin uploaded images from JSON Bin
      const adminItems = await getGallery();
      
      // Merge default data with admin items (preserves all defaults)
      const mergedData = mergeGalleryData(defaultData, adminItems);
      
      setGalleryData(mergedData);
      console.log('Gallery loaded with', mergedData.all.length, 'total images');
      if (adminItems && adminItems.length > 0) {
        console.log('Including', adminItems.length, 'admin uploaded images');
      }
    } catch (error) {
      console.error('Error loading gallery:', error);
      setGalleryData(getDefaultGalleryData());
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load (No localStorage listeners needed)
  useEffect(() => {
    loadGalleryData();
  }, [loadGalleryData]);

  // Reset visible images when category changes
  useEffect(() => {
    setVisibleImages(9);
    if (announcerRef.current) {
      const categoryName = categories.find(c => c.id === activeCategory)?.name || activeCategory;
      announcerRef.current.textContent = `Showing ${categoryName} photos`;
    }
  }, [activeCategory, categories]);

  const openLightbox = useCallback((image) => {
    setSelectedImage(image);
    document.body.style.overflow = 'hidden';
  }, []);

  const closeLightbox = useCallback(() => {
    setSelectedImage(null);
    document.body.style.overflow = 'unset';
  }, []);

  const handlePrevImage = useCallback(() => {
    if (!galleryData || !selectedImage) return;
    const currentImages = galleryData[activeCategory] || galleryData.all;
    const currentIndex = currentImages.findIndex(img => img.id === selectedImage.id);
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : currentImages.length - 1;
    setSelectedImage(currentImages[prevIndex]);
  }, [selectedImage, activeCategory, galleryData]);

  const handleNextImage = useCallback(() => {
    if (!galleryData || !selectedImage) return;
    const currentImages = galleryData[activeCategory] || galleryData.all;
    const currentIndex = currentImages.findIndex(img => img.id === selectedImage.id);
    const nextIndex = currentIndex < currentImages.length - 1 ? currentIndex + 1 : 0;
    setSelectedImage(currentImages[nextIndex]);
  }, [selectedImage, activeCategory, galleryData]);

  const handleLoadMore = useCallback(() => {
    setLoading(true);
    requestAnimationFrame(() => {
      setTimeout(() => {
        setVisibleImages(prev => prev + 9);
        setLoading(false);
      }, 300);
    });
  }, []);

  const handleCategoryChange = useCallback((categoryId) => {
    setActiveCategory(categoryId);
  }, []);

  // Get current images based on active category
  const currentImages = useMemo(() => {
    if (!galleryData) return [];
    return galleryData[activeCategory] || galleryData.all || [];
  }, [activeCategory, galleryData]);
  
  const displayedImages = useMemo(() => 
    currentImages.slice(0, visibleImages),
    [currentImages, visibleImages]
  );
  
  const hasMoreImages = visibleImages < currentImages.length;

  // Show loading state
  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading gallery...</span>
        </div>
        <p className="mt-3 text-muted">Loading gallery images...</p>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Gallery | Kitale Progressive School</title>
        <meta 
          name="description" 
          content="Explore our school gallery featuring academic activities, sports events, cultural celebrations, and modern facilities at Kitale Progressive School." 
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </Helmet>

      {/* Hero Section - Matching Curriculum Page with Background Image */}
      <section className="gallery-hero-section" aria-labelledby="page-title">
        <div className="gallery-hero-content">
          <h1 id="page-title">Our Gallery</h1>
          <p>A glimpse into daily life at Kitale Progressive School.</p>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="section-padding" aria-labelledby="gallery-heading">
        <Container>
          <h2 id="gallery-heading" className="visually-hidden">Photo Gallery</h2>
          
          {/* Screen reader announcer */}
          <div 
            ref={announcerRef}
            className="visually-hidden" 
            role="status" 
            aria-live="polite"
            aria-atomic="true"
          />

          {/* Category Filter */}
          <div 
            className="d-flex justify-content-center gap-2 mb-5 flex-wrap" 
            role="tablist"
            aria-label="Photo categories"
          >
            {categories.map(category => (
              <div key={category.id} role="tab" style={{ display: 'inline-block' }}>
                <FilterButton
                  category={category}
                  isActive={activeCategory === category.id}
                  onClick={handleCategoryChange}
                />
              </div>
            ))}
          </div>

          {/* Photo Grid - 3 columns on desktop */}
          {displayedImages.length > 0 ? (
            <>
              <div
                className="gallery-grid"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '1.5rem',
                  overflow: 'hidden'
                }}
                role="list"
                aria-label="Gallery images"
              >
                {displayedImages.map((image, index) => (
                  <div key={image.id || index} role="listitem">
                    <GalleryImage
                      image={image}
                      onClick={openLightbox}
                      priority={index < 3 && activeCategory === 'all'}
                    />
                  </div>
                ))}
              </div>

              {/* Load More Button */}
              {hasMoreImages && (
                <div className="text-center mt-5">
                  <button
                    onClick={handleLoadMore}
                    disabled={loading}
                    className="btn-navy"
                    style={{
                      minHeight: '44px',
                      minWidth: '160px'
                    }}
                    aria-label="Load more photos"
                  >
                    {loading ? (
                      <>
                        <i className="fas fa-spinner fa-spin me-2" aria-hidden="true"></i>
                        <span>Loading...</span>
                      </>
                    ) : (
                      <>
                        <i className="fas fa-sync-alt me-2" aria-hidden="true"></i>
                        View more moments
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-5">
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }} aria-hidden="true">🖼️</div>
              <h3 className="h5 text-muted">No images in this category</h3>
              <p className="text-muted">Check back later for more photos.</p>
            </div>
          )}
        </Container>
      </section>

      {/* Featured Video Section */}
      <section className="section-padding bg-light-custom" aria-labelledby="video-heading">
        <Container>
          <Row className="align-items-center g-5">
            <Col lg={6}>
              <div className="pe-lg-4">
                <h2 id="video-heading" className="section-heading-left mb-3">
                  School Life at a Glance
                </h2>
                <p className="text-dark mb-4" style={{ fontSize: '1rem', lineHeight: '1.6' }}>
                  Watch our school video to see the vibrant life at Kitale Progressive School. 
                  From classroom activities to sports events and cultural celebrations, experience 
                  the nurturing environment that makes our school a second home for your child.
                </p>
                
                {/* Stats Section - Centered */}
                <div className="d-flex justify-content-center justify-content-lg-start gap-4 flex-wrap mt-4">
                  <div className="text-center text-lg-start">
                    <span className="display-6 fw-bold text-gold" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.2rem)' }}>22+</span>
                    <span className="d-block small text-muted" style={{ fontSize: '0.85rem' }}>Years of Excellence</span>
                  </div>
                  <div className="text-center text-lg-start">
                    <span className="display-6 fw-bold text-gold" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.2rem)' }}>450+</span>
                    <span className="d-block small text-muted" style={{ fontSize: '0.85rem' }}>Happy Students</span>
                  </div>
                  <div className="text-center text-lg-start">
                    <span className="display-6 fw-bold text-gold" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.2rem)' }}>35+</span>
                    <span className="d-block small text-muted" style={{ fontSize: '0.85rem' }}>Expert Teachers</span>
                  </div>
                </div>
                
                {/* Optional: Call to action button */}
                <div className="mt-4">
                  <button 
                    onClick={() => window.location.href = '/admissions/apply'}
                    className="btn-navy"
                  >
                    <i className="fas fa-child" aria-hidden="true"></i>
                    Enroll Your Child Today
                    <i className="fas fa-arrow-right" aria-hidden="true"></i>
                  </button>
                </div>
              </div>
            </Col>
            
            <Col lg={6}>
              <div className="video-wrapper" style={{
                position: 'relative',
                paddingBottom: '56.25%',
                height: 0,
                overflow: 'hidden',
                borderRadius: '16px',
                boxShadow: '0 15px 35px rgba(13, 101, 251, 0.15)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease'
              }}>
                <iframe 
                  src="https://www.youtube-nocookie.com/embed/Vomydkvag_w"
                  title="School life video - Kitale Progressive School"
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    border: 0
                  }}
                />
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Lightbox Modal */}
      {selectedImage && (
        <LightboxModal
          selectedImage={selectedImage}
          onClose={closeLightbox}
          onPrev={handlePrevImage}
          onNext={handleNextImage}
        />
      )}

      <Suspense fallback={null}>
        <GetInTouch />
      </Suspense>

      {/* Optimized Critical CSS for Core Web Vitals - RETAINS ALL ORIGINAL STYLES */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes skeleton-loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        
        .visually-hidden {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          border: 0;
        }
        
        /* Hero Section with Background Image - Matching Curriculum Page */
        .gallery-hero-section {
          position: relative;
          background: linear-gradient(135deg, #0d65fb 0%, #0a55d6 100%);
          min-height: 350px;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          overflow: hidden;
        }

        .gallery-hero-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: url('/images/optimized/ecde.webp');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          filter: blur(0px);
          opacity: 0.9;
          z-index: 0;
        }

        .gallery-hero-section::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(13, 101, 251, 0.6), rgba(10, 85, 214, 0.7));
          z-index: 1;
        }

        .gallery-hero-content {
          position: relative;
          z-index: 2;
          max-width: 800px;
          margin: 0 auto;
          padding: 80px 20px;
          color: white;
        }

        .gallery-hero-content h1 {
          font-size: clamp(2rem, 5vw, 3rem);
          font-weight: 700;
          margin-bottom: 1rem;
          color: white;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        }

        .gallery-hero-content p {
          font-size: clamp(1rem, 4vw, 1.2rem);
          color: rgba(255, 255, 255, 0.95);
          line-height: 1.6;
          text-shadow: 0 1px 5px rgba(0, 0, 0, 0.2);
        }

        /* Gallery Item Styles - RETAINED FROM ORIGINAL */
        .gallery-item {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          border-radius: 12px;
          overflow: hidden;
          aspect-ratio: 4/3;
          cursor: pointer;
          will-change: transform;
        }
        .gallery-item:focus-visible,
        .gallery-item:hover {
          transform: scale(1.02);
          outline: 3px solid var(--gold);
          outline-offset: 2px;
          box-shadow: 0 10px 25px rgba(13,101,251,0.15);
        }
        
        /* Filter Button Styles - RETAINED FROM ORIGINAL */
        .filter-button {
          transition: all 0.2s ease;
        }
        .filter-button:hover {
          transform: translateY(-2px);
        }
        .filter-button.active {
          box-shadow: 0 4px 12px rgba(13,101,251,0.3);
        }
        
        /* Focus Styles - RETAINED FROM ORIGINAL */
        button:focus-visible,
        a:focus-visible,
        [role="button"]:focus-visible {
          outline: 3px solid var(--gold);
          outline-offset: 2px;
        }
        
        /* Modal Styles - RETAINED FROM ORIGINAL */
        .modal-overlay {
          backdrop-filter: blur(5px);
        }
        .lightbox-nav {
          transition: background-color 0.2s ease, transform 0.2s ease;
        }
        
        /* Button Styles - RETAINED FROM ORIGINAL */
        .btn-navy {
          background: var(--gradient-primary);
          color: white;
          border: none;
          font-weight: 600;
          border-radius: 40px;
          padding: 0.75rem 2rem;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }
        .btn-navy:hover:not(:disabled) {
          background: var(--gradient-hover);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(13,101,251,0.3);
        }
        .btn-navy:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        /* Gallery Grid - No scrollbar */
        .gallery-grid {
          overflow: hidden !important;
        }
        
        /* Responsive - 2 columns on tablet, 1 column on mobile - RETAINED FROM ORIGINAL */
        @media (max-width: 992px) {
          .gallery-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 1.25rem !important;
          }
        }
        
        @media (max-width: 768px) {
          .gallery-hero-content {
            padding: 60px 20px;
          }
          .gallery-grid {
            gap: 1rem !important;
          }
          .section-heading-left {
            font-size: 1.5rem;
          }
          .lightbox-nav {
            width: 40px !important;
            height: 40px !important;
            font-size: 1.2rem !important;
          }
          .lightbox-nav.prev {
            left: 10px;
          }
          .lightbox-nav.next {
            right: 10px;
          }
          .modal-close-btn {
            top: 10px !important;
            right: 10px !important;
            width: 40px !important;
            height: 40px !important;
          }
        }
        
        @media (max-width: 576px) {
          .gallery-hero-content {
            padding: 50px 20px;
          }
          .gallery-hero-content h1 {
            font-size: 1.8rem;
          }
          .gallery-grid {
            grid-template-columns: 1fr !important;
          }
        }
        
        /* Reduced Motion - RETAINED FROM ORIGINAL */
        @media (prefers-reduced-motion: reduce) {
          .gallery-item,
          .gallery-item:focus-visible,
          .gallery-item:hover,
          .filter-button,
          .lightbox-nav,
          .modal-close-btn,
          .btn-navy {
            transition: none !important;
            animation: none !important;
            transform: none !important;
          }
          .gallery-item {
            will-change: auto;
          }
        }
        
        /* Performance optimizations - RETAINED FROM ORIGINAL */
        .gallery-item {
          contain: layout paint;
        }
        .curriculum-image {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
      `}} />
    </>
  );
}

export default memo(Gallery);