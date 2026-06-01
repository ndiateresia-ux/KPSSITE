// pages/BoardingLife.jsx - Optimized with Hero Background Image
import { Helmet } from "react-helmet-async";
import { Container, Row, Col, Card, Button, Modal } from "react-bootstrap";
import { useState, useCallback, lazy, Suspense, memo, useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";

// Lazy load non-critical components
const GetInTouch = lazy(() => import("../components/GetInTouch"));

// Optimized image component with theme classes
const OptimizedImage = memo(({ src, alt, width, height, objectFit = 'cover', priority = false, onClick, style }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  
  // Preload critical images
  useEffect(() => {
    if (priority && src) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      link.type = src.endsWith('.webp') ? 'image/webp' : 'image/jpeg';
      document.head.appendChild(link);
      
      return () => {
        if (link.parentNode) document.head.removeChild(link);
      };
    }
  }, [priority, src]);
  
  if (error) {
    return (
      <div 
        className="bg-light-custom d-flex align-items-center justify-content-center"
        style={{ 
          width: '100%',
          height: '100%',
          minHeight: height || '200px',
          borderRadius: '12px'
        }}
        role="img"
        aria-label={`${alt} (image coming soon)`}
      >
        <div className="text-center">
          <div style={{ fontSize: '2rem' }} aria-hidden="true">🏠</div>
          <div className="text-dark small">{alt}</div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="curriculum-image-wrapper" 
      style={{ 
        position: 'relative', 
        width: '100%', 
        height: '100%',
        aspectRatio: width && height ? `${width}/${height}` : '16/9',
        backgroundColor: 'var(--gray-light)',
        borderRadius: '12px',
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        ...style
      }}
      onClick={onClick}
    >
      {!isLoaded && (
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
          width: '100%',
          height: '100%',
          objectFit: objectFit,
          position: 'relative',
          zIndex: 2
        }}
      />
    </div>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

// Experience Card Component with Icons - Using theme classes
const ExperienceCard = memo(({ icon, title, description }) => (
  <div className="card-custom experience-card" style={{
    background: 'var(--white)',
    borderRadius: '16px',
    padding: '1.25rem',
    textAlign: 'center',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    height: '100%'
  }}>
    <div className="bg-navy text-white" style={{
      width: '60px',
      height: '60px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 1rem',
      fontSize: '1.8rem'
    }} aria-hidden="true">
      {icon}
    </div>
    <h3 className="card-title-navy h6 fw-bold mb-1">{title}</h3>
    <p className="text-muted mb-0 small" style={{ lineHeight: 1.5 }}>{description}</p>
  </div>
));

ExperienceCard.displayName = 'ExperienceCard';

// Routine Row Component with theme classes
const RoutineRow = memo(({ item, index }) => {
  let rowClass = index % 2 === 0 ? 'routine-row-even' : 'routine-row-odd';
  
  return (
    <div className={`routine-row ${rowClass}`} role="row">
      <span className="time-column" role="cell">{item.time}</span>
      <span className="activity-column" role="cell">
        <span>{item.activity}</span>
      </span>
    </div>
  );
});

RoutineRow.displayName = 'RoutineRow';

function BoardingLife() {
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Boarding images
  const boardingImages = useMemo(() => ({
    dormitory: "/images/optimized/boarding.webp",
    commonRoom: "/images/optimized/gate2.webp",
    studyArea: "/images/optimized/jss.webp",
    recreation: "/images/optimized/ecde.webp"
  }), []);

  const boardingItemsImage = useMemo(() => "/images/optimized/boarding-items.webp", []);
  
  // PDF documents
  const pdfDocuments = useMemo(() => ({
    itemsList: "/pdf/boarding-items-list.pdf"
  }), []);

  // Daily routine data
  const dailyRoutine = useMemo(() => [
    { time: "6:00 AM - 6:45 AM", activity: "Morning Prep (Study Time)" },
    { time: "7:00 AM - 7:45 AM", activity: "Breakfast" },
    { time: "8:00 AM - 5:00 PM", activity: "Classes (with breaks)" },
    { time: "5:00 PM - 6:00 PM", activity: "Sports & Recreation" },
    { time: "6:00 PM - 7:00 PM", activity: "Personal Time/Shower" },
    { time: "7:00 PM - 8:00 PM", activity: "Supper" },
    { time: "8:00 PM - 9:00 PM", activity: "Evening Prep (Homework)" },
    { time: "9:00 PM", activity: "Lights Out (Younger Students)" },
    { time: "10:00 PM", activity: "Lights Out (Older Students)" }
  ], []);

  // What Your Child Will Experience - Icons
  const childExperiences = useMemo(() => [
    { icon: "📚",  description: "Supervised prep time with teacher support." },
    { icon: "⏰",  description: "Clear daily routine that build discipline and consistency." },
    { icon: "🏠", description: "Secure and well supervised living environment." },
    { icon: "🤝", description: "Academic support and personal guidance for each learner." }
  ], []);

  // What Parents Can Expect
  const parentExpectations = useMemo(() => [
    { icon: "🛡️", description: "Peace of mind knowing your child is safe, supervised & well cared for." },
    { icon: "📋", description: "Structured routines that support discipline & academic focus." },
    { icon: "⚖️", description: "Balancd environment for both academic progress and personal growth." }
  ], []);

  // Outcomes for Learners
  const outcomes = useMemo(() => [
    { icon: "🌟", title: "Independence", description: "Learners manage daily routine." },
    { icon: "🎯", title: "Responsibility", description: "Learners Develop accountability for actions and growth." },
    { icon: "📏", title: "Discipline", description: "Build self-discipline through structured routines and expectations." }
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
      alert('Unable to download. Please contact the school.');
    } finally {
      setIsDownloading(false);
    }
  }, []);

  const handleViewImage = useCallback((imageUrl, alt) => {
    setSelectedImage({ url: imageUrl, alt });
    setShowImageModal(true);
  }, []);

  const closeImageModal = useCallback(() => {
    setShowImageModal(false);
    setSelectedImage(null);
  }, []);

  return (
    <>
      <Helmet>
        <title>Boarding Life | Kitale Progressive School</title>
        <meta 
          name="description" 
          content="A safe and structured boarding experience at Kitale Progressive School. Learn about our daily routines, facilities, and how we help learners develop independence and responsibility." 
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </Helmet>

      {/* Hero Section - Matching Curriculum Page with Background Image */}
      <section className="boarding-hero-section" aria-labelledby="page-title">
        <div className="boarding-hero-content">
          <h1 id="page-title">A Safe and Structured Boarding Experience</h1>
          <p>Are you looking for a boarding school environment where your child will be safe, guided, and well cared for?</p>
          <p className="hero-highlight">Our boarding program provides astructured, disciplined and supportive environment
            where learners live, study and grow under the care of experienced and attentive staff.</p>
        </div>
      </section>

      {/* What Your Child Will Experience - Grid with Icons */}
      <section className="child-experience-section" aria-labelledby="child-experience-heading">
        <Container>
          <div className="text-center mb-5">
           
            <h2 id="child-experience-heading" className="section-heading mb-3">
              What Your Child Will Experience
            </h2>
            
            <p className="text-muted" style={{ maxWidth: '650px', margin: '0 auto', fontSize: '1.1rem' }}>
              Every day in our boarding program is designed to support academic success and personal growth.
            </p>
          </div>
          
          <Row className="g-4 justify-content-center">
            {childExperiences.map((exp, idx) => (
              <Col key={idx} xs={12} sm={6} md={4} lg={3}>
                <ExperienceCard {...exp} />
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* What to Expect as a Parent - Grid with Icons */}
      <section className="py-5" style={{ background: 'var(--white)' }} aria-labelledby="parent-expectations-heading">
        <Container>
          <div className="text-center mb-3">
            <h2 id="parent-expectations-heading" className="section-heading mb-3">
              What to Expect as a Parent
            </h2>
            
          </div>
          
          <Row className="g-5 justify-content-center">
            {parentExpectations.map((exp, idx) => (
              <Col key={idx} xs={12} sm={6} md={4} lg={3}>
                <ExperienceCard {...exp} />
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Outcomes Section - Using statistics-section theme */}
      <section className="statistics-section " aria-labelledby="outcomes-heading">
        <Container>
          <h2 id="outcomes-heading" className="text-center" >
            Learners Develop
          </h2>
          
          <Row className="g-5 justify-content-center">
            {outcomes.map((outcome, idx) => (
              <Col key={idx} md={4}>
                <div className="text-center p-3" style={{
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  backdropFilter: 'blur(10px)',
                  height: '100%'
                }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 0.75rem',
                    fontSize: '1.9rem',
                    color: 'var(--navy)'
                  }} aria-hidden="true">
                    {outcome.icon}
                  </div>
                  <h3 className="h3 fw-bold mb-1 text-gold">{outcome.title}</h3>
                  <p className="mb-0 text-white" style={{ opacity: 0.9 }}>{outcome.description}</p>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Image Gallery Section - Alternate text + image layout */}
      <section className="py-4 bg-light-custom">
        <Container>
          <Row className="align-items-center g-5 mb-4">
            <Col lg={6}>
              <div className="curriculum-image-wrapper" style={{ borderRadius: '16px', overflow: 'hidden', boxShadow: '0 8px 20px rgba(0,0,0,0.1)' }}>
                <OptimizedImage 
                  src={boardingImages.dormitory}
                  alt="Comfortable dormitory with modern amenities"
                  width="600"
                  height="400"
                  priority={true}
                />
              </div>
            </Col>
            <Col lg={6}>
              <div>
                <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }} aria-hidden="true">🛏️</div>
                <h3 className="card-title-navy h3 fw-bold mb-4">Comfortable Living Spaces</h3>
                <p  style={{ lineHeight: 1.8 }}>
                  Our dormitories are designed to be a home away from home. Each room is well-ventilated, 
                  spacious, and maintained to the highest standards of cleanliness.
                </p>
              </div>
            </Col>
          </Row>

          <Row className="align-items-center g-5 flex-row-reverse mb-4">
            <Col lg={6}>
              <div className="curriculum-image-wrapper" style={{ borderRadius: '16px', overflow: 'hidden', boxShadow: '0 8px 20px rgba(0,0,0,0.1)' }}>
                <OptimizedImage 
                  src={boardingImages.studyArea}
                  alt="Quiet study area for evening prep"
                  width="600"
                  height="400"
                />
              </div>
            </Col>
            <Col lg={6}>
              <div>
                <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }} aria-hidden="true">📚</div>
                <h3 className="card-title-navy h3 fw-bold mb-4">Supervised Study Time</h3>
                <p  style={{ lineHeight: 1.8 }}>
                  Evening prep sessions are supervised by qualified teachers who provide academic support 
                  and ensure homework completion.
                </p>
              </div>
            </Col>
          </Row>

          <Row className="align-items-center g-5">
            <Col lg={6}>
              <div className="curriculum-image-wrapper" style={{ borderRadius: '16px', overflow: 'hidden', boxShadow: '0 8px 20px rgba(0,0,0,0.1)' }}>
                <OptimizedImage 
                  src={boardingImages.recreation}
                  alt="Recreation and sports facilities"
                  width="600"
                  height="400"
                />
              </div>
            </Col>
            <Col lg={6}>
              <div>
                <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }} aria-hidden="true">⚽</div>
                <h3 className="card-title-navy h3 fw-bold mb-4">Recreation & Wellness</h3>
                <p style={{ lineHeight: 1.8 }}>
                  We believe in holistic development. Our boarding students have access to sports facilities, 
                  common rooms with recreational activities.
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Daily Routine Section */}
      <section className="py-6" style={{ background: 'var(--white)' }}>
        <Container>
          <Row className="justify-content-center">
            <Col lg={10}>
              <Card className="card-custom border-0 shadow-sm overflow-hidden">
                <Card.Body className="p-4">
                  <h3 className="card-title-navy h3 fw-bold mb-3">
                    <i className="fas fa-clock me-2 text-gold" aria-hidden="true"></i>
                    Daily Routine for Boarders
                  </h3>

                  <div className="routine-header" role="row">
                    <span className="time-column" role="columnheader">Time</span>
                    <span className="activity-column" role="columnheader">Activity</span>
                  </div>

                  <div className="routine-body" role="table" aria-label="Daily boarding schedule">
                    {dailyRoutine.map((item, index) => (
                      <RoutineRow key={index} item={item} index={index} />
                    ))}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Boarding Items Checklist Section - Image View */}
      <section className="py-5 bg-light-custom">
        <Container>
          <Row className="justify-content-center">
            <Col lg={10}>
              <Card className="card-custom border-0 shadow-sm">
                <Card.Body className="p-4">
                  <h2 className="card-title-navy h5 fw-bold mb-3">
                    <i className="fas fa-box me-2 text-gold" aria-hidden="true"></i>
                    Boarding Checklist
                  </h2>
                  <p>Essential Items Your Child will need for Boarding </p>
                  <div className="text-center mb-3">
                    <div 
                      className="curriculum-image-wrapper" 
                      style={{ 
                        maxHeight: '700px', 
                        overflow: 'hidden',
                        borderRadius: '12px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        margin: '0 auto',
                        display: 'inline-block',
                        cursor: 'pointer',
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                      }}
                      onClick={() => handleViewImage(boardingItemsImage, "Boarding Items Checklist")}
                    >
                      <OptimizedImage 
                        src={boardingItemsImage}
                        alt="Boarding Items Checklist"
                        width="800"
                        height="600"
                        objectFit="contain"
                      />
                      <div className="zoom-overlay">
                        <div className="zoom-icon">
                          <i className="fas fa-search-plus" aria-hidden="true"></i>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex justify-content-center gap-3 flex-wrap">
                    <Button 
                      onClick={() => handleViewImage(boardingItemsImage, "Boarding Items Checklist")}
                      className="btn-navy"
                      style={{ minHeight: '40px', minWidth: '140px' }}
                      aria-label="View boarding items checklist"
                    >
                      <i className="fas fa-eye me-2" stylearia-hidden="true"></i>
                      View Checklist
                    </Button>
                    <Button 
                      onClick={() => handleDownload(pdfDocuments.itemsList, 'Boarding_Items_List.pdf')}
                      className="btn-navy"
                      disabled={isDownloading}
                      style={{ minHeight: '40px', minWidth: '140px' }}
                      aria-label="Download boarding items checklist PDF"
                    >
                      {isDownloading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          <span>Downloading...</span>
                        </>
                      ) : (
                        <>
                          <i className="fas fa-download me-2" aria-hidden="true"></i>
                          Download PDF
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

      {/* CTA Section - Using cta-section theme */}
      <section className="py-5" style={{ background: 'var(--gray-light)' }}>
  <Container>
    <Row className="justify-content-center">
      <Col lg={10}>
        <Card className="card-custom border-0 shadow-lg" style={{
          background: 'var(--gradient-primary)',
          color: 'white',
          borderRadius: '24px',
          overflow: 'hidden'
        }}>
          <Card.Body className="p-4 p-lg-5 text-center">
            <div className="cta-content">
              <h2 className="cta-title" style={{ color: 'white', marginBottom: '1rem', fontSize: '1.3rem' }}>
                Ready to Join Our Boarding Community?
              </h2>
              <p className="cta-description" style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                Give your child the gift of independence, responsibility, and academic excellence in a safe, structured environment.
              </p>
              <div className="cta-buttons d-flex gap-3 justify-content-center flex-wrap">
                <Link
                  to="/admissions/apply"
                  className="btn-navy"
                  style={{
                    minHeight: '44px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'white',
                    border: 'none',
                    textDecorationLine: 'none',
                    color: 'var(--navy)'
                  }}
                  aria-label="Apply for admission now"
                >
                  Apply Now
                </Link>
                <Link
                  to="/contact"
                  className="btn-navy"
                  style={{
                    minHeight: '44px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'white',
                    border: 'none',
                    textDecorationLine: 'none',
                    color: 'var(--navy)'
                  }}
                  aria-label="Book a school visit"
                >
                  Book a School Visit
                </Link>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  </Container>
</section>

      {/* Image Modal - Full View */}
      <Modal 
        show={showImageModal} 
        onHide={closeImageModal}
        size="xl"
        centered
        dialogClassName="image-modal"
        fullscreen="lg-down"
      >
        <Modal.Header closeButton style={{ 
          borderBottom: `2px solid var(--gold)`,
          padding: '0.75rem 1rem',
          backgroundColor: 'var(--white)'
        }}>
          <Modal.Title className="card-title-navy h6 fw-bold">
            <i className="fas fa-list me-2 text-gold" aria-hidden="true"></i>
            {selectedImage?.alt || "Boarding Items Checklist"}
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body style={{ 
          padding: 0, 
          backgroundColor: 'rgba(0,0,0,0.95)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '50vh'
        }}>
          <div style={{ 
            maxWidth: '100%', 
            maxHeight: '80vh', 
            overflow: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <img 
              src={selectedImage?.url} 
              alt={selectedImage?.alt}
              style={{ 
                maxWidth: '100%', 
                maxHeight: '80vh', 
                objectFit: 'contain',
                display: 'block'
              }}
            />
          </div>
        </Modal.Body>
        
        <Modal.Footer style={{ 
          borderTop: `1px solid rgba(13,101,251,0.1)`,
          padding: '0.75rem 1rem',
          backgroundColor: 'var(--white)',
          justifyContent: 'center'
        }}>
          <Button 
            onClick={closeImageModal}
            className="btn-navy"
            style={{ minHeight: '36px' }}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <Suspense fallback={null}>
        <GetInTouch />
      </Suspense>

      <style dangerouslySetInnerHTML={{ __html: `
        /* Hero Section with Background Image - Matching Curriculum Page */
        .boarding-hero-section {
          position: relative;
          background: linear-gradient(135deg, #0d65fb 0%, #0a55d6 100%);
          min-height: 400px;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          overflow: hidden;
        }

        .boarding-hero-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: url('/images/optimized/boarding.webp');
           background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          filter: blur(0px);
          transform: scale(1.05);
          opacity: 1.0;
          z-index: 0;
        }

        .boarding-hero-section::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(13, 101, 251, 0.6), rgba(10, 85, 214, 0.7));
          z-index: 1;
        }

        .boarding-hero-content {
          position: relative;
          z-index: 2;
          max-width: 900px;
          margin: 0 auto;
          padding: 80px 20px;
          color: white;
        }

        .boarding-hero-content h1 {
          font-size: clamp(2rem, 5vw, 3rem);
          font-weight: 700;
          margin-bottom: 1rem;
          color: white;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        }

        .boarding-hero-content p {
          font-size: clamp(1rem, 4vw, 1.2rem);
          color: rgba(255, 255, 255, 0.95);
          line-height: 1.6;
          margin-bottom: 1rem;
          text-shadow: 0 1px 5px rgba(0, 0, 0, 0.2);
        }

        .boarding-hero-content .hero-highlight {
          color: var(--gold);
          font-weight: 600;
          font-size: 1rem;
          margin-top: 0.5rem;
        }

        .routine-header {
          display: flex;
          padding: 0.75rem 1rem;
          background: var(--gradient-primary);
          color: var(--white);
          border-radius: 12px 12px 0 0;
          font-weight: 700;
          font-size: 0.9rem;
          letter-spacing: 0.5px;
        }
        .time-column {
          width: 180px;
        }
        .activity-column {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .routine-body {
          border: 1px solid #e9ecef;
          border-top: none;
          border-radius: 0 0 12px 12px;
          overflow: hidden;
        }
        .routine-row {
          display: flex;
          padding: 0.75rem 1rem;
          border-bottom: 1px solid #e9ecef;
          transition: all 0.2s ease;
        }
        .routine-row:last-child {
          border-bottom: none;
        }
        .routine-row-even {
          background-color: var(--white);
        }
        .routine-row-odd {
          background-color: var(--gray-light);
        }
        .routine-row:hover {
          background-color: #e6f0ff !important;
          transform: scale(1.01);
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          position: relative;
          z-index: 1;
        }
        .experience-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .experience-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
        }
        .stat-card {
          transition: transform 0.2s ease;
        }
        .stat-card:hover {
          transform: translateY(-2px);
        }
        .zoom-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(13,101,251,0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;
          backdrop-filter: blur(3px);
          border-radius: 12px;
        }
        .curriculum-image-wrapper:hover .zoom-overlay {
          opacity: 1;
        }
        .zoom-icon {
          color: white;
          font-size: 1.8rem;
          background: rgba(0, 0, 0, 0.5);
          border-radius: 50%;
          width: 45px;
          height: 45px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .image-modal .modal-content {
          background: transparent;
          border: none;
        }
        .image-modal .modal-header {
          background: var(--white) !important;
          border-radius: 16px 16px 0 0;
        }
        .image-modal .modal-footer {
          background: var(--white) !important;
          border-radius: 0 0 16px 16px;
        }
        .image-modal .modal-header .btn-close {
          background-color: var(--gray-light);
          border-radius: 50%;
          padding: 0.5rem;
          transition: all 0.2s ease;
        }
        .image-modal .modal-header .btn-close:hover {
          background-color: var(--gold);
          transform: scale(1.05);
        }
        
        @media (max-width: 768px) {
          .boarding-hero-content {
            padding: 60px 20px;
          }
          .routine-header {
            display: none;
          }
          .routine-row {
            flex-direction: column;
            gap: 0.5rem;
            padding: 0.75rem;
          }
          .time-column {
            width: 100%;
            font-weight: 700;
            color: var(--navy);
          }
          .activity-column {
            margin-left: 0;
          }
          .section-heading {
            font-size: 1.5rem;
          }
        }
        
        @media (max-width: 576px) {
          .boarding-hero-content {
            padding: 50px 20px;
          }
          .boarding-hero-content h1 {
            font-size: 1.8rem;
          }
          .cta-buttons {
            flex-direction: column;
            align-items: stretch;
          }
          .cta-buttons .btn-navy,
          .cta-buttons .btn-outline-navy {
            width: 100%;
            text-align: center;
          }
        }
        
        @media (prefers-reduced-motion: reduce) {
          .experience-card,
          .routine-row,
          .zoom-overlay,
          .stat-card,
          .experience-card:hover,
          .routine-row:hover {
            transition: none !important;
            transform: none !important;
            animation: none !important;
          }
          .boarding-hero-section::before {
            filter: blur(0px);
            transform: none;
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

export default memo(BoardingLife);