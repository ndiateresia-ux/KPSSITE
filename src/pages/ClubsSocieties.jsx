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
        className="bg-light-custom d-flex align-items-center justify-content-center image-fallback"
        role="img"
        aria-label={`${alt} (image failed to load)`}
      >
        <span aria-hidden="true" className="fs-1 opacity-50">📷</span>
        <span className="visually-hidden">Image not available</span>
      </div>
    );
  }

  return (
    <div className="curriculum-image-wrapper">
      {!loaded && (
        <div 
          className="image-skeleton"
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
    <Card className="pillar-card h-100 border-0 shadow-sm">
      <Card.Body className="text-center p-4">
        <div className="pillar-icon mb-3" aria-hidden="true">
          {icon}
        </div>
        <h3 className="card-title-navy fw-bold mb-2">{title}</h3>
        <p className="text-dark mb-0">{description}</p>
      </Card.Body>
    </Card>
  </Col>
));

PillarCard.displayName = 'PillarCard';

// Activity Card Component for Sports/Clubs Grid with theme
const ActivityCard = memo(({ icon, name }) => (
  <div className="activity-card text-center p-2">
    <div className="activity-icon" aria-hidden="true">{icon}</div>
    <span className="small fw-medium text-navy">{name}</span>
  </div>
));

ActivityCard.displayName = 'ActivityCard';

// Benefit Card Component with theme
const BenefitCard = memo(({ icon, title, description }) => (
  <Col md={3} sm={6}>
    <Card className="approach-card h-100 border-0 shadow-sm">
      <Card.Body className="text-center p-3">
        <div className="benefit-icon mb-2" aria-hidden="true">
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
        aria-label={`View larger image of ${image.alt}`}
      >
        <div className="text-center">
          <div className="gallery-fallback-icon" aria-hidden="true">📷</div>
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
    >
      {!loaded && (
        <div 
          className="image-skeleton"
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
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Image lightbox"
      tabIndex={-1}
    >
      <button
        className="modal-close-btn"
        onClick={onClose}
        aria-label="Close lightbox"
      >
        ✕
      </button>
      
      <button
        className="lightbox-nav-btn lightbox-nav-prev"
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
        aria-label="Previous image"
      >
        ‹
      </button>
      
      <button
        className="lightbox-nav-btn lightbox-nav-next"
        onClick={(e) => { e.stopPropagation(); onNext(); }}
        aria-label="Next image"
      >
        ›
      </button>

      <div
        className="lightbox-image-container"
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
            className="lightbox-image"
            loading="eager"
          />
        </picture>
        <p className="lightbox-caption">
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
              <p className="text-muted">
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
      <section className="py-4" aria-labelledby="sports-heading">
        <Container className="section-card-container">
          <Row className="align-items-center g-4 g-lg-5">
            <Col lg={6} className="mb-4 mb-lg-0">
              <div className="curriculum-image-wrapper image-shadow">
                <OptimizedImage 
                  src="indoor-games"
                  alt="Students participating in sports activities"
                  width="600"
                  height="400"
                  priority={true}
                />
              </div>
            </Col>
            
            <Col lg={6}>
              <div className="sports-content-wrapper">
                <span className="section-badge">
                  Physical Development
                </span>
                
                <h2 id="sports-heading" className="section-heading-left mb-3">
                  Sports and Physical Development
                </h2>
                
                <p className="lead mb-3">
                  Do you want your child to stay active, healthy, and build teamwork skills?
                </p>
                
                <p className="mb-4">
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

                <div className="outcome-box">
                  <p className="mb-0 fw-semibold">
                    <i className="fas fa-trophy me-2" aria-hidden="true"></i>
                    Outcome: Learners develop discipline, teamwork, and confidence through sports.
                  </p>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Academic & Skills Development Clubs Section */}
      <section className="py-4 bg-light-custom" aria-labelledby="academic-clubs-heading">
        <Container className="section-card-container">
          <Row className="align-items-center g-4 g-lg-5 flex-row-reverse">
            <Col lg={6} className="mb-4 mb-lg-0">
              <div className="curriculum-image-wrapper image-shadow">
                <OptimizedImage 
                  src="computer-club"
                  alt="Students in coding and computer club"
                  width="600"
                  height="400"
                />
              </div>
            </Col>
            
            <Col lg={6}>
              <div className="clubs-content-wrapper">
                <span className="section-badge">
                  Co-Curricular Learning
                </span>
                
                <h2 id="academic-clubs-heading" className="section-heading-left mb-3">
                  Academic and Skills Development Clubs
                </h2>
                
                <p className="lead mb-3">
                  Do you want your child to develop creativity, communication, and practical skills?
                </p>
                
                <p className="mb-4">
                  Our clubs allow learners to explore interests and develop important academic and life 
                  skills that complement their classroom learning.
                </p>
                
                <Row className="g-3 g-md-4 mb-4">
                  {academicClubs.map((club, idx) => (
                    <Col key={idx} xs={12} sm={6} md={6}>
                      <div className="club-item">
                        <div className="club-icon" aria-hidden="true">{club.icon}</div>
                        <span className="small fw-semibold">{club.name}</span>
                      </div>
                    </Col>
                  ))}
                </Row>

                <div className="outcome-box">
                  <p className="mb-0 fw-semibold">
                    <i className="fas fa-lightbulb me-2" aria-hidden="true"></i>
                    Outcome: Learners develop communication, creativity, and problem-solving skills.
                  </p>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Leadership & Personal Development Section */}
      <section className="py-4" aria-labelledby="leadership-heading">
        <Container className="section-card-container">
          <Row className="align-items-center g-4 g-lg-5">
            <Col lg={6} className="mb-4 mb-lg-0">
              <div className="curriculum-image-wrapper image-shadow">
                <OptimizedImage 
                  src="events1"
                  alt="Students in leadership and scouting activities"
                  width="600"
                  height="400"
                />
              </div>
            </Col>
            
            <Col lg={6}>
              <div className="leadership-content-wrapper">
                <span className="section-badge">
                  Character Development
                </span>
                
                <h2 id="leadership-heading" className="section-heading-left mb-3">
                  Leadership and Personal Growth
                </h2>
                
                <p className="lead mb-3">
                  Are you looking for a school that builds confidence and responsibility?
                </p>
                
                <p className="mb-4">
                  We guide learners to develop leadership, discipline, and responsibility through structured 
                  programs that prepare them for future success.
                </p>
                
                <Row className="g-3 g-md-4 mb-4">
                  {leadershipActivities.map((activity, idx) => (
                    <Col key={idx} xs={12} sm={6} md={6}>
                      <div className="club-item">
                        <div className="club-icon" aria-hidden="true">{activity.icon}</div>
                        <span className="small fw-semibold">{activity.name}</span>
                      </div>
                    </Col>
                  ))}
                </Row>

                <div className="outcome-box">
                  <p className="mb-0 fw-semibold">
                    <i className="fas fa-chart-line me-2" aria-hidden="true"></i>
                    Outcome: Learners grow into confident and responsible individuals ready for leadership.
                  </p>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Spiritual & Values Development Section */}
      <section className="py-4 bg-light-custom" aria-labelledby="spiritual-heading">
        <Container>
          <Row className="align-items-center g-5 flex-row-reverse">
            <Col lg={6}>
              <div className="curriculum-image-wrapper image-shadow">
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
              <p className="lead mb-3">
                Do you want your child to grow in strong values and discipline?
              </p>
              <p className="mb-4 text-muted">
                We nurture character and values through spiritual guidance and mentorship, helping learners develop strong moral foundations.
              </p>
              
              <Row className="g-5 mb-3">
                {spiritualActivities.map((activity, idx) => (
                  <Col key={idx} xs={12} md={6}>
                    <div className="club-item bg-white">
                      <div className="club-icon" aria-hidden="true">{activity.icon}</div>
                      <span className="small fw-semibold text-navy">{activity.name}</span>
                    </div>
                  </Col>
                ))}
              </Row>

              <div className="outcome-box outcome-box-light">
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
      <section className="py-4 bg-white" aria-labelledby="benefits-heading">
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
            <h2 className="cta-title">
              Ready to Give Your Child a Complete School Experience?
            </h2>
            <p className="cta-description">
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

        .clubs-hero-contentp {
          font-size: clamp(1rem, 4vw, 1.2rem);
          color: rgba(255, 255, 255, 0.95);
          line-height: 1.6;
          margin-bottom: 1rem;
          text-shadow: 0 1px 5px rgba(0, 0, 0, 0.2);
        }

        /* Section Card Container */
        .section-card-container {
          padding: 2rem clamp(1.5rem, 5vw, 3rem);
          border-radius: 24px;
          margin-bottom: 2rem;
          transition: all 0.3s ease;
          background: var(--white);
        }

        /* Section Badge */
        .section-badge {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #0d65fb;
          background: rgba(13, 101, 251, 0.1);
          padding: 0.25rem 0.75rem;
          border-radius: 50px;
          margin-bottom: 1rem;
        }

        /* Lead Text */
        .lead {
          font-size: 1rem;
          font-weight: 600;
          color: #1e293b;
          line-height: 1.4;
        }

        /* Image Shadow */
        .image-shadow {
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12);
          border-radius: 20px;
          overflow: hidden;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .image-shadow:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 35px rgba(13, 101, 251, 0.2);
        }

        /* Outcome Box */
        .outcome-box {
          padding: 1rem 1.5rem;
          background: linear-gradient(135deg, rgba(13, 101, 251, 0.05), rgba(255, 0, 128, 0.03));
          border-left: 4px solid #ff0080;
          border-radius: 12px;
          transition: all 0.3s ease;
        }

        .outcome-box-light {
          background: var(--gray-light);
        }

        /* Club Item */
        .club-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 12px;
          transition: all 0.2s ease;
          cursor: default;
          border: 1px solid rgba(13, 101, 251, 0.1);
          background: white;
        }

        .club-icon {
          font-size: 1.3rem;
          min-width: 32px;
          text-align: center;
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
          background: var(--gray-light);
          border-radius: 12px;
          cursor: pointer;
        }
        
        .activity-card:hover {
          transform: translateY(-2px);
          background: var(--navy) !important;
        }
        
        .activity-card:hover .activity-icon,
        .activity-card:hover span {
          color: white !important;
        }

        .activity-icon {
          font-size: 1.8rem;
          margin-bottom: 0.25rem;
        }

        /* Pillar Icon */
        .pillar-icon {
          width: 70px;
          height: 70px;
          background: linear-gradient(135deg, var(--navy) 0%, var(--navy-dark) 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
          font-size: 2rem;
          color: var(--gold);
        }

        /* Benefit Icon */
        .benefit-icon {
          width: 50px;
          height: 50px;
          background: rgba(255, 255, 255, 0.15);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
          font-size: 1.5rem;
          color: white;
        }

        /* Gallery Item */
        .gallery-item {
          position: relative;
          border-radius: 12px;
          overflow: hidden;
          aspect-ratio: 4/3;
          cursor: pointer;
          background-color: var(--gray-light);
        }

        .gallery-fallback-icon {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }

        /* Lightbox Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.95);
          z-index: 100000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          backdrop-filter: blur(5px);
        }

        .modal-close-btn {
          position: absolute;
          top: 20px;
          right: 20px;
          background: white;
          border: none;
          border-radius: 50%;
          width: 44px;
          height: 44px;
          font-size: 1.2rem;
          cursor: pointer;
          z-index: 100001;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .modal-close-btn:hover {
          background: var(--gold);
          color: white;
          transform: scale(1.1);
        }

        .lightbox-nav-btn {
          position: absolute;
          background: rgba(255, 255, 255, 0.2);
          border: none;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          font-size: 1.5rem;
          cursor: pointer;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s ease;
          z-index: 100001;
        }

        .lightbox-nav-btn:hover {
          background: rgba(255, 255, 255, 0.4);
        }

        .lightbox-nav-prev {
          left: 20px;
        }

        .lightbox-nav-next {
          right: 20px;
        }

        .lightbox-image-container {
          max-width: 90vw;
          max-height: 90vh;
        }

        .lightbox-image {
          max-width: 100%;
          max-height: 90vh;
          object-fit: contain;
          border-radius: 8px;
        }

        .lightbox-caption {
          color: white;
          text-align: center;
          margin-top: 1rem;
          font-size: 0.9rem;
        }

        /* Focus Styles */
        button:focus-visible,
        a:focus-visible,
        .gallery-item:focus-visible,
        .activity-card:focus-visible {
          outline: 3px solid var(--gold);
          outline-offset: 2px;
        }
        
        @media (max-width: 768px) {
          .clubs-hero-content {
            padding: 60px 20px;
          }
          
          .clubs-hero-content h1 {
            font-size: 1.4rem;
          }
          
          .section-heading {
            font-size: 1.2rem;
          }
          
          .section-heading-left {
            font-size: 1.1rem;
          }
          
          .pillar-card:hover,
          .benefit-card:hover,
          .gallery-item:hover {
            transform: none;
          }

          .lightbox-nav-btn {
            width: 40px;
            height: 40px;
            font-size: 1.2rem;
          }

          .modal-close-btn {
            width: 36px;
            height: 36px;
            font-size: 1rem;
          }
        }
        
        @media (max-width: 576px) {
          .clubs-hero-content {
            padding: 50px 20px;
          }
          
          .clubs-hero-content h1 {
            font-size: 1.2rem;
          }
          
          .section-heading {
            font-size: 1.1rem;
          }
          
          .section-heading-left {
            font-size: 1rem;
          }

          .section-card-container {
            padding: 1.5rem;
            margin-bottom: 1rem;
          }

          .lead {
            font-size: 0.95rem;
          }

          .outcome-box {
            padding: 0.75rem 1rem;
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
          .activity-card:hover,
          .image-shadow,
          .image-shadow:hover {
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

        .image-fallback {
          width: 100%;
          height: 100%;
          min-height: 200px;
          border-radius: 16px;
        }
      `}} />
    </>
  );
}

export default memo(ClubsSocieties);