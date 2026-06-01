// pages/ClubsSocieties.jsx - Fully Optimized with Hero Background Image
import { Helmet } from "react-helmet-async";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { useState, lazy, Suspense, memo, useCallback, useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";

// Lazy load non-critical components
const GetInTouch = lazy(() => import("../components/GetInTouch"));

// Optimized image component with theme classes
const OptimizedImage = memo(({ src, alt, width, height, priority = false, category = 'sports' }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef(null);

  // Handle different image paths
  const getImagePath = () => {
    if (src.startsWith('sports') || src.startsWith('clubs') || src.startsWith('events') || src.startsWith('boarding')) {
      return `/images/optimized/gallery/${src}.jpg`;
    }
    return `/images/optimized/${src}.jpg`;
  };

  const getWebpPath = () => {
    if (src.startsWith('sports') || src.startsWith('clubs') || src.startsWith('events') || src.startsWith('boarding')) {
      return `/images/optimized/gallery/${src}.webp`;
    }
    return `/images/optimized/${src}.webp`;
  };

  const basePath = getImagePath();
  const webpPath = getWebpPath();

  useEffect(() => {
    if (priority) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = webpPath;
      link.type = 'image/webp';
      document.head.appendChild(link);
      
      return () => {
        if (link.parentNode) document.head.removeChild(link);
      };
    }
  }, [priority, webpPath]);

  if (error) {
    return (
      <div 
        className="bg-light-custom d-flex align-items-center justify-content-center"
        style={{
          width: '100%',
          height: '100%',
          minHeight: height || '200px',
          aspectRatio: width && height ? `${width}/${height}` : '16/9',
          borderRadius: '16px'
        }}
        role="img"
        aria-label={`${alt} (image failed to load)`}
      >
        <span aria-hidden="true" className="fs-1 opacity-50">📷</span>
        <span className="visually-hidden">Image not available</span>
      </div>
    );
  }

  return (
    <div className="curriculum-image-wrapper" style={{ 
      position: 'relative', 
      width: '100%', 
      height: '100%',
      aspectRatio: width && height ? `${width}/${height}` : '16/9',
      backgroundColor: 'var(--gray-light)',
      borderRadius: '16px',
      overflow: 'hidden'
    }}>
      {!loaded && (
        <div 
          className="image-skeleton"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1
          }}
          aria-hidden="true"
        />
      )}
      
      <picture>
        <source 
          srcSet={webpPath}
          type="image/webp"
        />
        <img
          ref={imgRef}
          src={basePath}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          fetchpriority={priority ? "high" : "auto"}
          decoding="async"
          width={width}
          height={height}
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
    </div>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

// Scroll to contact function - same as homepage
const scrollToContact = (event) => {
  event?.preventDefault();
  
  let contactElement = document.getElementById('contactus');
  
  if (!contactElement) {
    contactElement = document.querySelector('#get-in-touch-form, .get-in-touch-section form, [id*="contact"]');
  }
  
  if (contactElement) {
    const elementPosition = contactElement.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - 80;
    
    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
    
    setTimeout(() => {
      const focusableElement = contactElement.querySelector('input, button, textarea, select, [tabindex="0"]');
      if (focusableElement) {
        focusableElement.focus();
      } else {
        contactElement.setAttribute('tabindex', '-1');
        contactElement.focus();
      }
    }, 500);
  } else {
    // If contact element not found, navigate to contact page
    window.location.href = '/contact';
  }
};

// Pillar Card Component with theme
const PillarCard = memo(({ icon, title, description }) => (
  <Col md={4}>
    <Card className="pillar-card h-100 border-0 shadow-sm" style={{
      borderRadius: '20px',
      overflow: 'hidden',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease'
    }}>
      <Card.Body className="text-center p-4">
        <div className="pillar-icon mb-3" style={{
          width: '70px',
          height: '70px',
          background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy-dark) 100%)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto',
          fontSize: '2rem',
          color: 'var(--gold)'
        }} aria-hidden="true">
          {icon}
        </div>
        <h3 className="card-title-navy h5 fw-bold mb-2">{title}</h3>
        <p className="text-dark mb-0" style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>{description}</p>
      </Card.Body>
    </Card>
  </Col>
));

PillarCard.displayName = 'PillarCard';

// Activity Card Component for Sports/Clubs Grid with theme
const ActivityCard = memo(({ icon, name }) => (
  <div className="activity-card text-center p-2" style={{
    background: 'var(--gray-light)',
    borderRadius: '12px',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    cursor: 'pointer'
  }}>
    <div style={{ fontSize: '1.8rem', marginBottom: '0.25rem' }} aria-hidden="true">{icon}</div>
    <span className="small fw-medium text-navy">{name}</span>
  </div>
));

ActivityCard.displayName = 'ActivityCard';

// Benefit Card Component with theme
const BenefitCard = memo(({ icon, title, description }) => (
  <Col md={3} sm={6}>
    <Card className="approach-card h-100 border-0 shadow-sm" style={{
      borderRadius: '16px',
      overflow: 'hidden',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease'
    }}>
      <Card.Body className="text-center p-3">
        <div className="benefit-icon mb-2" style={{
          width: '50px',
          height: '50px',
          background: 'rgba(13, 101, 251, 0.1)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto',
          fontSize: '1.5rem',
          color: 'white'
        }} aria-hidden="true">
          {icon}
        </div>
        <h3 className="text-white h6 fw-bold mb-1">{title}</h3>
        <p className="text-white small mb-0">{description}</p>
      </Card.Body>
    </Card>
  </Col>
));

BenefitCard.displayName = 'BenefitCard';

// Gallery Image Component for the "Experience Student Life" section
const GalleryImage = memo(({ image, onClick, priority = false }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(image);
    }
  }, [onClick, image]);

  if (error) {
    return (
      <div
        className="gallery-item"
        onClick={() => onClick(image)}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        style={{
          position: 'relative',
          borderRadius: '12px',
          overflow: 'hidden',
          aspectRatio: '4/3',
          cursor: 'pointer',
          backgroundColor: 'var(--gray-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        aria-label={`View larger image of ${image.alt}`}
      >
        <div className="text-center">
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }} aria-hidden="true">📷</div>
          <div className="text-dark small">{image.alt}</div>
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
      {!loaded && (
        <div 
          className="image-skeleton"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1
          }}
          aria-hidden="true"
        />
      )}
      
      <picture>
        <source 
          srcSet={`/images/optimized/gallery/${image.filename}.webp`}
          type="image/webp"
        />
        <img
          src={`/images/optimized/gallery/${image.filename}.jpg`}
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
    </div>
  );
});

GalleryImage.displayName = 'GalleryImage';

// Lightbox Modal Component
const LightboxModal = memo(({ selectedImage, onClose, onPrev, onNext }) => {
  const modalRef = useRef(null);

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
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [handleKeyDown]);

  if (!selectedImage) return null;

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
        padding: '2rem'
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Image lightbox"
      tabIndex={-1}
    >
      <button
        className="modal-close-btn"
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '44px',
          height: '44px',
          fontSize: '1.2rem',
          cursor: 'pointer',
          zIndex: 100001,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        aria-label="Close lightbox"
      >
        ✕
      </button>
      
      <button
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
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
          transition: 'background-color 0.2s ease'
        }}
        aria-label="Previous image"
      >
        ‹
      </button>
      
      <button
        onClick={(e) => { e.stopPropagation(); onNext(); }}
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
          transition: 'background-color 0.2s ease'
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
        <picture>
          <source 
            srcSet={`/images/optimized/gallery/${selectedImage.filename}.webp`}
            type="image/webp"
          />
          <img
            src={`/images/optimized/gallery/${selectedImage.filename}.jpg`}
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

function ClubsSocieties() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);
  
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Gallery images from sports category
  const galleryImages = useMemo(() => [
    { id: 5, filename: "sports1", alt: "Students playing football during sports day", category: "sports" },
    { id: 6, filename: "sports2", alt: "Athletics competition at school field", category: "sports" },
    { id: 1, filename: "academics2", alt: "Classroom learning activities", category: "academics" },
    { id: 9, filename: "cultural1", alt: "Traditional dance performance", category: "cultural" },
    { id: 13, filename: "events1", alt: "Graduation ceremony celebration", category: "events" },
    { id: 17, filename: "facilities5", alt: "Modern school library", category: "facilities" }
  ], []);

  // Three Pillars Data
  const pillars = useMemo(() => [
    { icon: "⭐", title: "Talent Development", description: "Learners explore interests in sports, arts, and clubs, discovering and nurturing their unique abilities." },
    { icon: "🤝", title: "Social Growth", description: "Students build friendships, teamwork, and communication skills through collaborative activities." },
    { icon: "👑", title: "Confidence & Leadership", description: "Activities help learners take initiative, develop leadership qualities, and grow in confidence." }
  ], []);

  // Sports Activities
  const sportsActivities = useMemo(() => [
    { icon: "⚽", name: "Football" },
    { icon: "🏃", name: "Athletics" },
    { icon: "⛸️", name: "Skating" },
    { icon: "🏊", name: "Swimming" },
    { icon: "🏐", name: "Netball" },
    { icon: "🏐", name: "Volleyball" },
    { icon: "🤾", name: "Handball" },
    { icon: "♟️", name: "Chess" }
  ], []);

  // Academic & Skills Clubs
  const academicClubs = useMemo(() => [
    { icon: "💻", name: "Coding & Computer Skills" },
    { icon: "📰", name: "Journalism" },
    { icon: "🎤", name: "Debates & Public Speaking" },
    { icon: "🇨🇳", name: "Chinese Language" }
  ], []);

  // Leadership Activities
  const leadershipActivities = useMemo(() => [
    { icon: "⛺", name: "Scouting" },
    { icon: "🗣️", name: "PPI (Peer Influence)" },
    { icon: "🎯", name: "Career Guidance" },
    { icon: "👥", name: "Student Leadership Roles" }
  ], []);

  // Spiritual Activities
  const spiritualActivities = useMemo(() => [
    { icon: "⛪", name: "School Chapel" },
    { icon: "💬", name: "Guidance & Counselling" },
    { icon: "📖", name: "Pastoral Instruction" }
  ], []);

  // Benefits Data
  const benefits = useMemo(() => [
    { icon: "💪", title: "Confidence", description: "Students build self-belief through participation." },
    { icon: "🤝", title: "Teamwork", description: "Learners develop strong social and collaboration skills." },
    { icon: "📏", title: "Discipline", description: "Structured activities build focus and responsibility." },
    { icon: "💡", title: "Talent Discovery", description: "Learners discover and develop their unique abilities." }
  ], []);

  const openLightbox = useCallback((image) => {
    setSelectedImage(image);
    const index = galleryImages.findIndex(img => img.id === image.id);
    setCurrentGalleryIndex(index);
    document.body.style.overflow = 'hidden';
  }, [galleryImages]);

  const closeLightbox = useCallback(() => {
    setSelectedImage(null);
    document.body.style.overflow = 'unset';
  }, []);

  const handlePrevImage = useCallback(() => {
    const prevIndex = currentGalleryIndex > 0 ? currentGalleryIndex - 1 : galleryImages.length - 1;
    setCurrentGalleryIndex(prevIndex);
    setSelectedImage(galleryImages[prevIndex]);
  }, [currentGalleryIndex, galleryImages]);

  const handleNextImage = useCallback(() => {
    const nextIndex = currentGalleryIndex < galleryImages.length - 1 ? currentGalleryIndex + 1 : 0;
    setCurrentGalleryIndex(nextIndex);
    setSelectedImage(galleryImages[nextIndex]);
  }, [currentGalleryIndex, galleryImages]);

  return (
    <>
      <Helmet>
        <title>Co-Curricular, Clubs & Societies | Kitale Progressive School</title>
        <meta 
          name="description" 
          content="A balanced school experience beyond the classroom at Kitale Progressive School. Discover our sports, clubs, leadership programs, and student development activities." 
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </Helmet>

      {/* Hero Section - Matching Curriculum Page with Background Image */}
      <section className="clubs-hero-section" aria-labelledby="page-title">
        <div className="clubs-hero-content">
          <h1 id="page-title">Co-curricular Activities</h1>
          <p>At Kitale Progressive School, co-curricular activities are an essential part of learning, helping learners grow socially, emotionally, and physically.</p>
        </div>
      </section>

      {/* Three Pillars Section */}
      <section className="py-5 bg-light-custom" aria-labelledby="pillars-heading">
        <Container>
          <Row className="text-center mb-4">
            <Col lg={8} className="mx-auto">
              <h2 id="pillars-heading" className="section-heading mb-3">
                Our Co-Curricular Pillars
              </h2>
              <p className="text-muted" style={{ fontSize: '1rem' }}>
                We provide a vibrant and structured school life that supports your child's academic, social, physical, and personal development.
              </p>
            </Col>
          </Row>

          {/* Three Pillars Cards */}
          <Row className="g-5">
            {pillars.map((pillar, idx) => (
              <PillarCard key={idx} {...pillar} />
            ))}
          </Row>
        </Container>
      </section>

      {/* Sports & Physical Development Section */}
      <section className="py-6"  aria-labelledby="sports-heading">
       <Container style={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.04)', 
            padding: '2rem clamp(1.5rem, 5vw, 3rem)', 
            borderRadius: '24px',
            marginBottom: '2rem',
            transition: 'all 0.3s ease'
          }}>
            <Row className="align-items-center g-4 g-lg-5">
              <Col lg={6} className="mb-4 mb-lg-0">
                <div className="curriculum-image-wrapper" style={{ 
                  boxShadow: '0 12px 28px rgba(0, 0, 0, 0.12)',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                }}>
                  <OptimizedImage 
                    src="indoor-games"
                    alt="Students participating in sports activities"
                    width="600"
                    height="400"
                    priority={true}
                    style={{ width: '100%', height: 'auto', display: 'block' }}
                  />
                </div>
              </Col>
              
              <Col lg={6}>
                <div className="sports-content-wrapper">
                  <span className="sports-badge" style={{
                    display: 'inline-block',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    color: '#0d65fb',
                    background: 'rgba(13, 101, 251, 0.1)',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '50px',
                    marginBottom: '1rem'
                  }}>
                    Physical Development
                  </span>
                  
                  <h2 id="sports-heading" className="section-heading-left mb-3" style={{ fontWeight: '700' }}>
                    Sports and Physical Development
                  </h2>
                  
                  <p className="lead mb-3" style={{ 
                    fontSize: '1.15rem', 
                    fontWeight: '600',
                    color: '#1e293b',
                    lineHeight: '1.4'
                  }}>
                    Do you want your child to stay active, healthy, and build teamwork skills?
                  </p>
                  
                  <p className="mb-4" style={{ 
                    fontSize: '0.95rem', 
                    lineHeight: '1.7',
                    color: '#475569'
                  }}>
                    Our sports program develops physical fitness, discipline, and teamwork through structured 
                    training and participation in various sports activities.
                  </p>
                  
                  <Row className="g-3 g-md-4 mb-4">
                    {sportsActivities.map((sport, idx) => (
                      <Col key={idx} xs={6} md={3}>
                        <ActivityCard {...sport} />
                      </Col>
                    ))}
                  </Row>

                  <div className="p-3 p-md-4 rounded-3" style={{ 
                    background: 'linear-gradient(135deg, rgba(13, 101, 251, 0.05), rgba(255, 0, 128, 0.03))',
                    borderLeft: `4px solid #ff0080`,
                    borderRadius: '12px',
                    transition: 'all 0.3s ease'
                  }}>
                    <p className="mb-0 fw-semibold" style={{ color: '#0d65fb' }}>
                      <i className="fas fa-trophy me-2" style={{ color: '#ff0080' }} aria-hidden="true"></i>
                      Outcome: Learners develop discipline, teamwork, and confidence through sports.
                    </p>
                  </div>
                </div>
              </Col>
            </Row>
          </Container>
      </section>

      {/* Academic & Skills Development Clubs Section */}
      <section className="py-6 bg-light-custom" aria-labelledby="academic-clubs-heading">
        <Container style={{ 
  backgroundColor: 'rgba(0, 0, 0, 0.04)', 
  padding: '2rem clamp(1.5rem, 5vw, 3rem)', 
  borderRadius: '24px',
  marginBottom: '2rem',
  transition: 'all 0.3s ease'
}}>
  <Row className="align-items-center g-4 g-lg-5 flex-row-reverse">
    <Col lg={6} className="mb-4 mb-lg-0">
      <div className="curriculum-image-wrapper" style={{ 
        boxShadow: '0 12px 28px rgba(0, 0, 0, 0.12)',
        borderRadius: '20px',
        overflow: 'hidden',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease'
      }}>
        <OptimizedImage 
          src="computer-club"
          alt="Students in coding and computer club"
          width="600"
          height="400"
          style={{ width: '100%', height: 'auto', display: 'block' }}
        />
      </div>
    </Col>
    
    <Col lg={6}>
      <div className="clubs-content-wrapper">
        <span className="clubs-badge" style={{
          display: 'inline-block',
          fontSize: '0.75rem',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          color: '#0d65fb',
          background: 'rgba(13, 101, 251, 0.1)',
          padding: '0.25rem 0.75rem',
          borderRadius: '50px',
          marginBottom: '1rem'
        }}>
          Co-Curricular Learning
        </span>
        
        <h2 id="academic-clubs-heading" className="section-heading-left mb-3" style={{ fontWeight: '700' }}>
          Academic and Skills Development Clubs
        </h2>
        
        <p className="lead mb-3" style={{ 
          fontSize: '1.15rem', 
          fontWeight: '600',
          color: '#1e293b',
          lineHeight: '1.4'
        }}>
          Do you want your child to develop creativity, communication, and practical skills?
        </p>
        
        <p className="mb-4" style={{ 
          fontSize: '0.95rem', 
          lineHeight: '1.7',
          color: '#475569'
        }}>
          Our clubs allow learners to explore interests and develop important academic and life 
          skills that complement their classroom learning.
        </p>
        
        <Row className="g-3 g-md-4 mb-4">
          {academicClubs.map((club, idx) => (
            <Col key={idx} xs={12} sm={6} md={6}>
              <div className="d-flex align-items-center gap-2 p-2 p-md-3 rounded-3 shadow-sm" style={{
                background: 'white',
                transition: 'all 0.2s ease',
                cursor: 'default',
                border: '1px solid rgba(13, 101, 251, 0.1)'
              }}>
                <div style={{ 
                  fontSize: '1.3rem', 
                  minWidth: '32px',
                  textAlign: 'center'
                }} aria-hidden="true">{club.icon}</div>
                <span className="small fw-semibold" style={{ color: '#0d65fb' }}>{club.name}</span>
              </div>
            </Col>
          ))}
        </Row>

        <div className="p-3 p-md-4 rounded-3" style={{ 
          background: 'linear-gradient(135deg, rgba(13, 101, 251, 0.05), rgba(255, 0, 128, 0.03))',
          borderLeft: `4px solid #ff0080`,
          borderRadius: '12px',
          transition: 'all 0.3s ease'
        }}>
          <p className="mb-0 fw-semibold" style={{ color: '#0d65fb' }}>
            <i className="fas fa-lightbulb me-2" style={{ color: '#ff0080' }} aria-hidden="true"></i>
            Outcome: Learners develop communication, creativity, and problem-solving skills.
          </p>
        </div>
      </div>
    </Col>
  </Row>
</Container>
      </section>

      {/* Leadership & Personal Development Section */}
      <section className="py-6" style={{ background: 'var(--white)' }} aria-labelledby="leadership-heading">
     <Container style={{ 
  backgroundColor: 'rgba(0, 0, 0, 0.04)', 
  padding: '2rem clamp(1.5rem, 5vw, 3rem)', 
  borderRadius: '24px',
  marginBottom: '2rem',
  transition: 'all 0.3s ease'
}}>
  <Row className="align-items-center g-4 g-lg-5">
    <Col lg={6} className="mb-4 mb-lg-0">
      <div className="curriculum-image-wrapper" style={{ 
        boxShadow: '0 12px 28px rgba(0, 0, 0, 0.12)',
        borderRadius: '20px',
        overflow: 'hidden',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease'
      }}>
        <OptimizedImage 
          src="events1"
          alt="Students in leadership and scouting activities"
          width="600"
          height="400"
          style={{ width: '100%', height: 'auto', display: 'block' }}
        />
      </div>
    </Col>
    
    <Col lg={6}>
      <div className="leadership-content-wrapper">
        <span className="leadership-badge" style={{
          display: 'inline-block',
          fontSize: '0.75rem',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          color: '#0d65fb',
          background: 'rgba(13, 101, 251, 0.1)',
          padding: '0.25rem 0.75rem',
          borderRadius: '50px',
          marginBottom: '1rem'
        }}>
          Character Development
        </span>
        
        <h2 id="leadership-heading" className="section-heading-left mb-3" style={{ fontWeight: '700' }}>
          Leadership and Personal Growth
        </h2>
        
        <p className="lead mb-3" style={{ 
          fontSize: '1.15rem', 
          fontWeight: '600',
          color: '#1e293b',
          lineHeight: '1.4'
        }}>
          Are you looking for a school that builds confidence and responsibility?
        </p>
        
        <p className="mb-4" style={{ 
          fontSize: '0.95rem', 
          lineHeight: '1.7',
          color: '#475569'
        }}>
          We guide learners to develop leadership, discipline, and responsibility through structured 
          programs that prepare them for future success.
        </p>
        
        <Row className="g-3 g-md-4 mb-4">
          {leadershipActivities.map((activity, idx) => (
            <Col key={idx} xs={12} sm={6} md={6}>
              <div className="d-flex align-items-center gap-2 p-2 p-md-3 rounded-3 shadow-sm" style={{
                background: 'white',
                transition: 'all 0.2s ease',
                cursor: 'default',
                border: '1px solid rgba(13, 101, 251, 0.1)'
              }}>
                <div style={{ 
                  fontSize: '1.3rem', 
                  minWidth: '32px',
                  textAlign: 'center'
                }} aria-hidden="true">{activity.icon}</div>
                <span className="small fw-semibold" style={{ color: '#0d65fb' }}>{activity.name}</span>
              </div>
            </Col>
          ))}
        </Row>

        <div className="p-3 p-md-4 rounded-3" style={{ 
          background: 'linear-gradient(135deg, rgba(13, 101, 251, 0.05), rgba(255, 0, 128, 0.03))',
          borderLeft: `4px solid #ff0080`,
          borderRadius: '12px',
          transition: 'all 0.3s ease'
        }}>
          <p className="mb-0 fw-semibold" style={{ color: '#0d65fb' }}>
            <i className="fas fa-chart-line me-2" style={{ color: '#ff0080' }} aria-hidden="true"></i>
            Outcome: Learners grow into confident and responsible individuals ready for leadership.
          </p>
        </div>
      </div>
    </Col>
  </Row>
</Container>
      </section>

      {/* Spiritual & Values Development Section */}
      <section className="py-6 bg-light-custom" aria-labelledby="spiritual-heading">
        <Container>
          <Row className="align-items-center g-5 flex-row-reverse">
            <Col lg={6}>
              <div className="curriculum-image-wrapper" style={{ boxShadow: '0 8px 20px rgba(0,0,0,0.1)' }}>
                <OptimizedImage 
                  src="events4"
                  alt="Students in school chapel service"
                  width="600"
                  height="400"
                />
              </div>
            </Col>
            <Col lg={6}>
              <h2 id="spiritual-heading" className="section-heading-left mb-3">
                Spiritual and Values Development
              </h2>
              <p className="lead mb-3 text-dark" style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                Do you want your child to grow in strong values and discipline?
              </p>
              <p className="mb-4 text-muted" style={{ fontSize: '0.95rem', lineHeight: '1.8' }}>
                We nurture character and values through spiritual guidance and mentorship, helping learners develop strong moral foundations.
              </p>
              
              <Row className="g-5 mb-3">
                {spiritualActivities.map((activity, idx) => (
                  <Col key={idx} xs={12} md={6}>
                    <div className="d-flex align-items-center gap-2 p-2 bg-white rounded-3 shadow-sm">
                      <div style={{ fontSize: '1.3rem' }} aria-hidden="true">{activity.icon}</div>
                      <span className="small fw-semibold text-navy">{activity.name}</span>
                    </div>
                  </Col>
                ))}
              </Row>

              <div className="p-3 bg-light-custom rounded-3" style={{ borderLeft: `4px solid var(--gold)` }}>
                <p className="mb-0 fw-semibold text-navy">
                  <i className="fas fa-heart me-2 text-gold" aria-hidden="true"></i>
                  Outcome: Learners develop discipline, respect, and strong moral values.
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Benefits Section */}
      <section className="py-6" style={{ background: 'var(--white)' }} aria-labelledby="benefits-heading">
        <Container>
          <Row className="text-center mb-4">
            <Col lg={8} className="mx-auto">
              <h2 id="benefits-heading" className="section-heading mb-3">
                How Your Child Benefits from Co-Curricular Activities
              </h2>
              <p className="text-muted">
                Through co-curricular activities, learners develop essential life skills that prepare them for success beyond the classroom.
              </p>
            </Col>
          </Row>

          <Row className="g-5">
            {benefits.map((benefit, idx) => (
              <BenefitCard key={idx} {...benefit} />
            ))}
          </Row>
        </Container>
      </section>

      {/* Gallery Section - Experience Student Life */}
      <section className="py-6 bg-light-custom" aria-labelledby="gallery-heading">
        <Container>
          <Row className="text-center mb-4">
            <Col lg={8} className="mx-auto">
              <h2 id="gallery-heading" className="section-heading mb-3">
                Experience Student Life at Kitale Progressive School
              </h2>
              <p className="text-muted">
                See your child in action - sports, clubs, events, and student life
              </p>
            </Col>
          </Row>

          <Row className="g-5">
            {galleryImages.map((image, idx) => (
              <Col key={image.id} xs={12} sm={6} lg={4}>
                <GalleryImage 
                  image={image} 
                  onClick={openLightbox}
                  priority={idx < 4}
                />
              </Col>
            ))}
          </Row>
          <div className="text-center mt-5">
            <Button 
              as="a" 
              href="/school-life/gallery"
              className="btn-navy"
              variant="outline-primary"
              size="lg"
            >
              View Full Gallery
            </Button>
          </div>
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

      {/* Final CTA Section - Updated with scroll to contact functionality */}
      <section className="cta-section cta-primary py-4">
        <Container>
          <div className="cta-content text-center">
            <h2 className="cta-title" style={{ fontSize: '1.3rem' }}>
              Ready to Give Your Child a Complete School Experience?
            </h2>
            <p className="cta-description" style={{ fontSize: '0.9rem' }}>
              Visit our school and experience the environment where learners grow academically, socially, and personally.
            </p>
            <div className="cta-buttons">
              <Link to="/admissions/apply">
                <button className="btn-navy">Apply Now</button>
              </Link>
              <button onClick={scrollToContact} className="btn-navy">Book a School Visit</button>
              <button onClick={scrollToContact} className="btn-navy">Contact Admissions</button>
            </div>
          </div>
        </Container>
      </section>

      <Suspense fallback={null}>
        <GetInTouch />
      </Suspense>

      {/* Optimized Critical CSS for Core Web Vitals */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* Hero Section with Background Image - Matching Curriculum Page */
        .clubs-hero-section {
          position: relative;
          background: linear-gradient(135deg, #0d65fb 0%, #0a55d6 100%);
          min-height: 400px;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          overflow: hidden;
        }

        .clubs-hero-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: url('/images/optimized/gallery/sports2.webp');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          filter: blur(0px);
          transform: scale(1.05);
          opacity: 0.9;
          z-index: 0;
        }

        .clubs-hero-section::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(13, 101, 251, 0.6), rgba(10, 85, 214, 0.7));
          z-index: 1;
        }

        .clubs-hero-content {
          position: relative;
          z-index: 2;
          max-width: 900px;
          margin: 0 auto;
          padding: 80px 20px;
          color: white;
        }

        .clubs-hero-content h1 {
          font-size: clamp(2rem, 5vw, 3rem);
          font-weight: 700;
          margin-bottom: 1rem;
          color: white;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        }

        .clubs-hero-content p {
          font-size: clamp(1rem, 4vw, 1.2rem);
          color: rgba(255, 255, 255, 0.95);
          line-height: 1.6;
          margin-bottom: 1rem;
          text-shadow: 0 1px 5px rgba(0, 0, 0, 0.2);
        }

        .clubs-hero-content .hero-highlight {
          color: var(--gold);
          font-weight: 600;
          font-size: 1rem;
          margin-top: 0.5rem;
        }

        /* Card Styles */
        .pillar-card,
        .benefit-card,
        .gallery-item {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .pillar-card:hover,
        .benefit-card:hover,
        .gallery-item:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 25px rgba(13, 101, 251, 0.15) !important;
        }
        
        .activity-card {
          transition: transform 0.2s ease, background 0.2s ease;
        }
        
        .activity-card:hover {
          transform: translateY(-2px);
          background: var(--navy) !important;
          color: white !important;
        }
        
        .activity-card:hover span {
          color: white !important;
        }

        button:focus-visible,
        a:focus-visible,
        .gallery-item:focus-visible {
          outline: 3px solid var(--gold);
          outline-offset: 2px;
        }
        
        .modal-overlay {
          backdrop-filter: blur(5px);
        }
        
        @media (max-width: 768px) {
          .clubs-hero-content {
            padding: 60px 20px;
          }
          
          .section-heading {
            font-size: 1.6rem;
          }
          
          .section-heading-left {
            font-size: 1.4rem;
          }
          
          .pillar-card:hover,
          .benefit-card:hover,
          .gallery-item:hover {
            transform: none;
          }
        }
        
        @media (max-width: 576px) {
          .clubs-hero-content {
            padding: 50px 20px;
          }
          
          .clubs-hero-content h1 {
            font-size: 1.8rem;
          }
          
          .section-heading {
            font-size: 1.4rem;
          }
          
          .section-heading-left {
            font-size: 1.2rem;
          }
        }
        
        @media (prefers-reduced-motion: reduce) {
          *,
          .pillar-card,
          .benefit-card,
          .gallery-item,
          .activity-card,
          .pillar-card:hover,
          .benefit-card:hover,
          .gallery-item:hover,
          .activity-card:hover {
            transition: none !important;
            animation: none !important;
            transform: none !important;
          }
        }
        
        /* Performance optimizations */
        .curriculum-image-wrapper {
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

export default memo(ClubsSocieties);