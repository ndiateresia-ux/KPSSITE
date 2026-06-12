// pages/Dining.jsx - Professionally Enhanced with Hero Background Image
import { Helmet } from "react-helmet-async";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { useState, useCallback, lazy, Suspense, memo, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";

const GetInTouch = lazy(() => import("../components/GetInTouch"));

// Optimized image component with Core Web Vitals optimizations
const OptimizedImage = memo(({ src, alt, width, height, objectFit = 'cover', priority = false }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  
  if (error) {
    return (
      <div 
        className="bg-light-custom d-flex align-items-center justify-content-center image-fallback"
        role="img"
        aria-label={`${alt} (image coming soon)`}
      >
        <div className="text-center">
          <div className="fallback-icon" aria-hidden="true">🍽️</div>
          <div className="text-dark small">{alt}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="curriculum-image-wrapper">
      {!isLoaded && (
        <div 
          className="image-skeleton"
          aria-hidden="true"
        />
      )}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        fetchpriority={priority ? "high" : "auto"}
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        onError={() => setError(true)}
        className={`curriculum-image ${isLoaded ? 'loaded' : ''}`}
        style={{
          objectFit: objectFit
        }}
      />
    </div>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

// Kitchen Experience Grid Card with theme
const KitchenCard = memo(({ icon, title, description }) => (
  <div className="kitchen-card card-custom">
    <div className="kitchen-icon-circle" aria-hidden="true">
      {icon}
    </div>
    <h3 className="card-title-navy kitchen-card-title">{title}</h3>
    <p className="text-dark mb-0 kitchen-card-text">{description}</p>
  </div>
));

KitchenCard.displayName = 'KitchenCard';

// Trust Point Component with theme
const TrustPoint = memo(({ icon, title }) => (
  <div className="trust-point d-flex align-items-center gap-3 p-3 bg-white rounded-4 shadow-sm">
    <div className="trust-icon-circle">
      <span aria-hidden="true">{icon}</span>
    </div>
    <p className="mb-0 fw-medium text-dark trust-point-text">{title}</p>
  </div>
));

TrustPoint.displayName = 'TrustPoint';

function Dining() {
  const [isDownloading, setIsDownloading] = useState(false);
  
  const weeklyMenuImage = useMemo(() => "/images/optimized/menu.webp", []);
  const pdfDocuments = useMemo(() => ({
    weeklyMenu: "/pdfs/menu.pdf"
  }), []);

  const kitchenExperience = useMemo(() => [
    "Clean, modern kitchen designed for efficient food preparation",
    "Structured dining environment for positive eating habits",
    "Careful food handling procedures ensuring hygiene at every stage",
    "Safe food storage to maintain freshness and prevent contamination"
  ], []);

  const trustPoints = useMemo(() => [
    { icon: "🧼", title: "Hygienic food preparation" },
    { icon: "🧹", title: "Clean and well-maintained kitchen" },
    { icon: "👥", title: "Supervised meal service" }
  ], []);

  const childExperience = useMemo(() => [
    "Regular, well-timed meals throughout the day",
    "Balanced diet with essential nutrients for growth",
    "A clean and comfortable eating environment",
    "Supervision during meal times for safety"
  ], []);

  const handleDownload = useCallback(async (pdfUrl, filename) => {
    setIsDownloading(true);
    try {
      const response = await fetch(pdfUrl);
      if (!response.ok) throw new Error('PDF not found');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Unable to download the menu. Please contact the school.');
    } finally {
      setIsDownloading(false);
    }
  }, []);

  const scrollToContact = useCallback((event) => {
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
      window.location.href = '/contact';
    }
  }, []);

  return (
    <>
      <Helmet>
        <title>Nutritious Meals & Dining | Kitale Progressive School</title>
        <meta 
          name="description" 
          content="Nutritious, safe, and balanced meals every day at Kitale Progressive School. View our weekly menu, learn about our kitchen standards, and see how we care for your child's well-being." 
        />
        <meta name="keywords" content="school meals, nutritious food, dining hall, healthy eating, school kitchen, Kitale school" />
        <meta property="og:title" content="Nutritious Meals & Dining | Kitale Progressive School" />
        <meta property="og:description" content="Balanced, hygienic meals prepared daily to support your child's health and academic performance." />
        <meta property="og:type" content="website" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </Helmet>

      {/* Hero Section - Matching Curriculum Page with Background Image */}
      <section className="dining-hero-section" aria-labelledby="page-title">
        <div className="dining-hero-content">
          <h1 id="page-title">Nutritious, Safe, and Balanced Meals Every Day</h1>
          <p>Are you looking for a school that ensures your child is well-fed, healthy, and cared for throughout the day?</p>
        </div>
      </section>

      {/* Trust Section - A Kitchen You Can Trust */}
      <section className="py-6 bg-white" aria-labelledby="trust-heading">
        <Container>
          <div className="text-center mb-5">
            <div className="trust-icon-wrapper mx-auto">
              <i className="fas fa-check-circle text-navy" aria-hidden="true"></i>
            </div>
            <h2 id="trust-heading" className="section-heading mb-3">A Kitchen You Can Trust</h2>
            <p className="trust-intro mx-auto">
              Our kitchen follows strict hygiene standards and food safety practices to ensure every meal served is clean, nutritious, and safe for learners.
            </p>
          </div>
          
          <Row className="g-4 justify-content-center">
            {trustPoints.map((point, idx) => (
              <Col key={idx} md={4}>
                <TrustPoint {...point} />
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Kitchen & Dining Experience - Using Theme CTA Styles */}
      <section className="cta-section cta-primary" aria-labelledby="kitchen-experience-heading">
        <Container>
          <div className="cta-content text-center">
            <div className="kitchen-icon-badge mx-auto mb-3">
              <i className="fas fa-utensils" aria-hidden="true"></i>
            </div>
            <h2 id="kitchen-experience-heading" className="cta-title">
              How Meals Are Prepared and Served
            </h2>
            <p className="kitchen-subtitle">
              Every step is designed with your child's health and well-being in mind
            </p>

            <div className="benefits-cards">
              {kitchenExperience.map((text, idx) => (
                <div key={idx} className="benefit-card">
                  <div className="benefit-icon">
                    <i className="fas fa-utensils" aria-hidden="true"></i>
                  </div>
                  <span className="benefit-text">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* What Your Child Will Experience */}
      <section className="py-6 bg-white" aria-labelledby="child-experience-heading">
        <Container>
          <Row className="align-items-center g-5">
            <Col lg={6} className="mb-4 mb-lg-0">
              <div className="image-shadow rounded-3 overflow-hidden">
                <OptimizedImage 
                  src="/images/facilities/dining-hall-1.webp"
                  alt="Students enjoying healthy meals in the school dining hall"
                  width="600"
                  height="400"
                  priority={true}
                />
              </div>
            </Col>
            <Col lg={6}>
              <div className="ps-lg-3">
                <h2 id="child-experience-heading" className="section-heading-left mb-3">What Your Child Will Experience</h2>
                <p className="mb-4 text-dark child-experience-intro">
                  Every day, learners receive meals that support their energy, focus, and overall well-being.
                </p>
                <ul className="list-unstyled mb-4">
                  {childExperience.map((item, idx) => (
                    <li key={idx} className="mb-3 d-flex align-items-start gap-2">
                      <span className="text-gold checkmark" aria-hidden="true">✓</span>
                      <span className="text-dark">{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="nutrition-note p-3 rounded-3">
                  <i className="fas fa-apple-alt me-2 text-gold" aria-hidden="true"></i>
                  <span className="small">Meals are prepared fresh daily using high-quality ingredients</span>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Weekly Menu Section */}
      <section className="py-6 bg-light-custom" aria-labelledby="menu-heading">
        <Container>
          <Row className="justify-content-center">
            <Col lg={10}>
              <Card className="card-custom border-0 shadow-sm overflow-hidden">
                <Card.Body className="p-4">
                  <div className="text-center mb-4">
                    <div className="menu-badge d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill mb-3">
                      <i className="fas fa-calendar-week fa-sm" aria-hidden="true"></i>
                      <span className="small fw-semibold">Weekly Menu</span>
                    </div>
                    <h2 id="menu-heading" className="section-heading mb-2">Sample Weekly Menu</h2>
                    <p className="text-muted menu-intro">
                      Our meals are planned to provide a balanced diet that supports your child's health, energy, and growth throughout the school week.
                    </p>
                  </div>

                  <div className="menu-image-wrapper text-center mb-4">
                    <OptimizedImage 
                      src={weeklyMenuImage}
                      alt="Weekly balanced meal menu for students"
                      width="800"
                      height="800"
                      objectFit="contain"
                      priority={false}
                    />
                  </div>

                  <div className="text-center mb-4">
                    <small className="text-muted d-flex align-items-center justify-content-center gap-2">
                      <i className="fas fa-sync-alt fa-xs" aria-hidden="true"></i>
                      Menus are reviewed regularly to ensure variety, nutrition, and quality
                    </small>
                  </div>

                  <div className="d-flex justify-content-center">
                    <Button 
                      onClick={() => handleDownload(pdfDocuments.weeklyMenu, 'Weekly_Menu.pdf')}
                      className="btn-navy"
                      disabled={isDownloading}
                      aria-label="Download weekly menu PDF"
                    >
                      {isDownloading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          <span>Downloading...</span>
                        </>
                      ) : (
                        <>
                          <i className="fas fa-download me-2" aria-hidden="true"></i>
                          Download Menu
                        </>
                      )}
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Parent Peace of Mind Section */}
      <section className="py-6 bg-white" aria-labelledby="peace-heading">
        <Container>
          <Row className="justify-content-center">
            <Col lg={10}>
              <div className="text-center mb-5">
                <div className="peace-icon-wrapper mx-auto">
                  <i className="fas fa-heart text-navy" aria-hidden="true"></i>
                </div>
                <h2 id="peace-heading" className="section-heading mb-3">Giving Parents Peace of Mind</h2>
                <p className="text-left peace-intro mx-auto">
                  We understand that parents want assurance that their children are well cared for throughout the day. 
                  Our kitchen and dining services are designed to provide consistent, reliable, and healthy meals in a safe environment.
                </p>
              </div>
              
              <Row className="g-4 mt-4">
                <Col md={4}>
                  <Card className="peace-card text-center p-4 h-100 border-0 shadow-sm">
                    <div className="peace-icon-circle mx-auto mb-3" aria-hidden="true">👥</div>
                    <Card.Body className="p-0">
                      <Card.Title as="h3" className="peace-card-title fw-bold mb-2">Supervised Meals</Card.Title>
                      <Card.Text className="peace-card-text">
                        Children are supervised during meals to ensure proper nutrition and safety
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={4}>
                  <Card className="peace-card text-center p-4 h-100 border-0 shadow-sm">
                    <div className="peace-icon-circle mx-auto mb-3" aria-hidden="true">⏰</div>
                    <Card.Body className="p-0">
                      <Card.Title as="h3" className="peace-card-title fw-bold mb-2">Structured Routine</Card.Title>
                      <Card.Text className="peace-card-text">
                        Meals are served in a structured routine that promotes healthy eating habits
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={4}>
                  <Card className="peace-card text-center p-4 h-100 border-0 shadow-sm">
                    <div className="peace-icon-circle mx-auto mb-3" aria-hidden="true">🧼</div>
                    <Card.Body className="p-0">
                      <Card.Title as="h3" className="peace-card-title fw-bold mb-2">Strict Hygiene</Card.Title>
                      <Card.Text className="peace-card-text">
                        Hygiene and cleanliness are maintained at all times in our dining facilities
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Col>
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-5 bg-light-custom">
        <Container>
          <Row className="justify-content-center">
            <Col lg={10}>
              <Card className="card-custom border-0 shadow-lg cta-gradient-card">
                <Card.Body className="p-4 p-lg-5 text-center">
                  <h3 className="cta-title text-white mb-3">
                    Ready to Join a School That Supports Your Child's Health and Well-Being?
                  </h3>
                  <div className="d-flex gap-3 justify-content-center flex-wrap">
                    <button
                      onClick={() => window.location.href = '/admissions/apply'}
                      className="btn-outline-navy"
                      aria-label="Apply for admission now"
                    > Apply Now
                    </button>
                    <button
                      onClick={scrollToContact}
                      className="btn-outline-navy"
                      aria-label="Book a school visit"
                    >
                      Book a School Visit
                    </button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      <Suspense fallback={null}>
        <GetInTouch />
      </Suspense>

      {/* Component-specific styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* Hero Section - Matching Curriculum Page */
        .dining-hero-section {
          position: relative;
          background: linear-gradient(135deg, #0d65fb 0%, #0a55d6 100%);
          min-height: 400px;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          overflow: hidden;
        }

        .dining-hero-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: url('/images/facilities/dining-hall-2.webp');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          opacity: 0.9;
          z-index: 0;
        }

        .dining-hero-section::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(13, 101, 251, 0.6), rgba(10, 85, 214, 0.7));
          z-index: 1;
        }

        .dining-hero-content {
          position: relative;
          z-index: 2;
          max-width: 900px;
          margin: 0 auto;
          padding: 80px 20px;
          color: white;
        }

        .dining-hero-content h1 {
          font-size: clamp(1.5rem, 5vw, 1.8rem);
          font-weight: 700;
          margin-bottom: 1rem;
          color: white;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        }

        .dining-hero-content p {
          font-size: clamp(0.9rem, 4vw, 1rem);
          color: rgba(255, 255, 255, 0.95);
          line-height: 1.6;
          margin-bottom: 1rem;
          text-shadow: 0 1px 5px rgba(0, 0, 0, 0.2);
        }

        /* Trust Section */
        .trust-icon-wrapper {
          width: 70px;
          height: 70px;
          background: var(--gray-light);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
        }
        
        .trust-icon-wrapper i {
          font-size: 2rem;
        }
        
        .trust-intro {
          font-size: 1rem;
          max-width: 700px;
          line-height: 1.6;
          color: #6c757d;
        }

        /* Trust Point */
        .trust-point {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          border-radius: 16px;
          height: 100%;
          border: 1px solid rgba(13, 101, 251, 0.05);
        }
        
        .trust-point:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(13, 101, 251, 0.1) !important;
        }
        
        .trust-icon-circle {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #0d65fb, #0a55d6);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        
        .trust-icon-circle span {
          font-size: 1.2rem;
          color: white;
        }
        
        .trust-point-text {
          font-size: 0.95rem;
          font-weight: 500;
        }

        /* Kitchen Experience Section */
        .kitchen-icon-badge {
          width: 60px;
          height: 60px;
          background: rgba(255, 255, 255, 0.15);
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        
        .kitchen-icon-badge i {
          font-size: 1.8rem;
          color: white;
        }
        
        .kitchen-subtitle {
          font-size: 1rem;
          margin-bottom: 1.5rem;
          color: rgba(255, 255, 255, 0.9);
        }
        
        .benefits-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          max-width: 800px;
          margin: 0 auto;
        }
        
        .benefit-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          padding: 1rem 1.25rem;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          border: 1px solid rgba(255, 255, 255, 0.15);
        }
        
        .benefit-card:hover {
          transform: translateY(-2px);
          background: rgba(255, 255, 255, 0.15);
        }
        
        .benefit-icon {
          width: 36px;
          height: 36px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        
        .benefit-icon i {
          font-size: 1rem;
          color: white;
        }
        
        .benefit-text {
          font-size: 0.85rem;
          color: white;
          line-height: 1.5;
          text-align: left;
        }

        /* Kitchen Card */
        .kitchen-card {
          background: var(--white);
          border-radius: 20px;
          padding: 1.5rem;
          text-align: center;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease;
          height: 100%;
          border: 1px solid rgba(13, 101, 251, 0.08);
        }
        
        .kitchen-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 15px 30px rgba(13, 101, 251, 0.12) !important;
        }
        
        .kitchen-icon-circle {
          width: 65px;
          height: 65px;
          background: linear-gradient(135deg, #0d65fb, #0a55d6);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
          font-size: 1.8rem;
          color: var(--gold);
          transition: transform 0.3s ease;
        }
        
        .kitchen-card:hover .kitchen-icon-circle {
          transform: scale(1.05);
        }
        
        .kitchen-card-title {
          font-size: 0.9rem;
          font-weight: 700;
          margin-bottom: 0.75rem;
          color: var(--navy);
        }
        
        .kitchen-card-text {
          font-size: 0.85rem;
          line-height: 1.6;
          color: var(--text-dark);
        }

        /* Child Experience */
        .child-experience-intro {
          font-size: 1rem;
          line-height: 1.6;
        }
        
        .checkmark {
          font-size: 0.9rem;
          min-width: 20px;
        }

        /* Nutrition Note */
        .nutrition-note {
          background: var(--gray-light);
          border-left: 3px solid var(--gold);
        }
        
        .nutrition-note span {
          font-size: 0.85rem;
          color: var(--text-dark);
        }

        /* Menu Section */
        .menu-badge {
          background: rgba(13, 101, 251, 0.1);
          color: var(--navy);
          display: inline-flex;
        }
        
        .menu-intro {
          font-size: 0.9rem;
          max-width: 600px;
          margin: 0 auto;
        }
        
        .menu-image-wrapper {
          max-height: 700px;
          overflow: auto;
          border-radius: 16px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          margin: 0 auto;
          display: inline-block;
          background-color: var(--white);
          width: 100%;
        }

        /* Peace Section */
        .peace-icon-wrapper {
          width: 70px;
          height: 70px;
          background: var(--gray-light);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
        }
        
        .peace-icon-wrapper i {
          font-size: 2rem;
        }
        
        .peace-intro {
          font-size: 1rem;
          max-width: 700px;
          line-height: 1.6;
          color: #6c757d;
        }
        
        .peace-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          border-radius: 20px;
        }
        
        .peace-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 25px rgba(13, 101, 251, 0.1) !important;
        }
        
        .peace-icon-circle {
          width: 70px;
          height: 70px;
          background: linear-gradient(135deg, #0d65fb, #0545b3);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          color: white;
        }
        
        .peace-card-title {
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--text-dark);
        }
        
        .peace-card-text {
          font-size: 0.8rem;
          color: #6c757d;
          line-height: 1.5;
        }

        /* CTA Gradient Card */
        .cta-gradient-card {
          background: var(--gradient-primary);
          color: white;
          border-radius: 24px;
          overflow: hidden;
        }

        /* Image Styles */
        .curriculum-image-wrapper {
          position: relative;
          width: 100%;
          height: 100%;
          background-color: var(--gray-light);
          border-radius: 16px;
          overflow: hidden;
          contain: layout paint;
        }
        
        .curriculum-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          position: relative;
          z-index: 2;
          backface-visibility: hidden;
        }
        
        .image-skeleton {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
        
        .image-fallback {
          width: 100%;
          height: 100%;
          min-height: 200px;
          border-radius: 16px;
        }
        
        .fallback-icon {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }
        
        .image-shadow {
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
        }

        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .dining-hero-content {
            padding: 60px 20px;
          }
          .dining-hero-content h1 {
            font-size: 1.4rem;
          }
          .benefits-cards {
            gap: 1rem;
          }
          .kitchen-icon-circle {
            width: 55px;
            height: 55px;
            font-size: 1.5rem;
          }
          .peace-icon-circle {
            width: 60px;
            height: 60px;
            font-size: 1.8rem;
          }
        }
        
        @media (max-width: 576px) {
          .dining-hero-content {
            padding: 50px 20px;
          }
          .dining-hero-content h1 {
            font-size: 1.2rem;
          }
          .dining-hero-content p {
            font-size: 0.85rem;
          }
          .benefits-cards {
            grid-template-columns: 1fr;
          }
          .benefit-card {
            padding: 0.75rem 1rem;
          }
          .benefit-text {
            font-size: 0.8rem;
          }
          .cta-buttons {
            flex-direction: column;
            align-items: stretch;
          }
          .btn-light-navy {
            width: 100%;
            text-align: center;
          }
        }
        
        @media (prefers-reduced-motion: reduce) {
          *,
          .kitchen-card,
          .trust-point,
          .peace-card,
          .benefit-card,
          .kitchen-card:hover,
          .trust-point:hover,
          .peace-card:hover,
          .benefit-card:hover {
            transition: none !important;
            transform: none !important;
            animation: none !important;
          }
          .image-skeleton {
            animation: none !important;
          }
          .dining-hero-section::before {
            transform: none;
          }
        }
        
        button:focus-visible,
        a:focus-visible {
          outline: 3px solid var(--gold);
          outline-offset: 2px;
        }
      `}} />
    </>
  );
}

export default memo(Dining);