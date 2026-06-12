// pages/BoardingLife.jsx - Optimized with Hero Background Image
import { Helmet } from "react-helmet-async";
import { Container, Row, Col, Card, Button, Modal } from "react-bootstrap";
import { useState, useCallback, lazy, Suspense, memo, useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";

// Lazy load non-critical components
const GetInTouch = lazy(() => import("../components/GetInTouch"));

// Optimized image component with theme classes
const OptimizedImage = memo(({ src, alt, width, height, objectFit = 'cover', priority = false, onClick, style, className = '' }) => {
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
        className={`bg-light-custom d-flex align-items-center justify-content-center image-fallback ${className}`}
        role="img"
        aria-label={`${alt} (image coming soon)`}
      >
        <div className="text-center">
          <div className="fallback-icon" aria-hidden="true">🏠</div>
          <div className="text-dark small">{alt}</div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`curriculum-image-wrapper ${className}`}
      style={{ 
        cursor: onClick ? 'pointer' : 'default',
        ...style
      }}
      onClick={onClick}
    >
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

// Experience Card Component with Icons - Using theme classes
const ExperienceCard = memo(({ icon, title, description }) => (
  <div className="card-custom experience-card">
    <div className="experience-icon-circle" aria-hidden="true">
      {icon}
    </div>
    <h3 className="card-title-navy h6 fw-bold mb-1">{title}</h3>
    <p className="text-muted mb-0 small">{description}</p>
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
    dormitory: "/images/optimized/gallery/facilities5.webp",
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
    { icon: "📚", title: "Academic Support", description: "Supervised prep time with teacher support." },
    { icon: "⏰", title: "Structured Routine", description: "Clear daily routine that build discipline and consistency." },
    { icon: "🏠", title: "Safe Environment", description: "Secure and well supervised living environment." },
    { icon: "🤝", title: "Personal Guidance", description: "Academic support and personal guidance for each learner." }
  ], []);

  // What Parents Can Expect
  const parentExpectations = useMemo(() => [
    { icon: "🛡️", title: "Peace of Mind", description: "Peace of mind knowing your child is safe, supervised & well cared for." },
    { icon: "📋", title: "Structured Routines", description: "Structured routines that support discipline & academic focus." },
    { icon: "⚖️", title: "Balanced Environment", description: "Balanced environment for both academic progress and personal growth." }
  ], []);

  // Outcomes for Learners
  const outcomes = useMemo(() => [
    { icon: "🌟", title: "Independence", description: "Learners manage daily routine." },
    { icon: "🎯", title: "Responsibility", description: "Learners develop accountability for actions and growth." },
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
          <p>Our boarding program provides a structured, disciplined and supportive environment
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
            <p className="text-muted experience-intro">
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
      <section className="py-5 bg-white" aria-labelledby="parent-expectations-heading">
        <Container>
          <div className="text-center mb-5">
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
      <section className="statistics-section" aria-labelledby="outcomes-heading">
        <Container>
          <h2 id="outcomes-heading" className="text-center text-white mb-4">
            Learners Develop
          </h2>
          
          <Row className="g-5 justify-content-center">
            {outcomes.map((outcome, idx) => (
              <Col key={idx} md={4}>
                <div className="outcome-card text-center">
                  <div className="outcome-icon" aria-hidden="true">
                    {outcome.icon}
                  </div>
                  <h3 className="h3 fw-bold mb-1 text-gold">{outcome.title}</h3>
                  <p className="mb-0 text-white outcome-description">{outcome.description}</p>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Image Gallery Section - Alternate text + image layout */}
      <section className="py-5 bg-light-custom">
        <Container>
          <Row className="align-items-center g-5 mb-5">
            <Col lg={6}>
              <div className="image-shadow rounded-3 overflow-hidden">
                <OptimizedImage 
                  src={boardingImages.dormitory}
                  alt="Comfortable dormitory with modern amenities"
                  width="600"
                  height="400"
                  priority={true}
                  className="rounded-3"
                />
              </div>
            </Col>
            <Col lg={6}>
              <div>
                <div className="section-icon mb-3" aria-hidden="true">🛏️</div>
                <h3 className="card-title-navy h3 fw-bold mb-4">Comfortable Living Spaces</h3>
                <p className="text-muted">
                Our dormitories are thoughtfully designed to be a true home away from home. Each room is bright, well-ventilated, and generously spacious, offering plenty of room to live, study, and unwind. With a steadfast commitment to the highest standards of cleanliness, every space is meticulously maintained—creating a fresh, comfortable, and serene environment where you can feel safe, respected, and truly at ease.
                </p>
              </div>
            </Col>
          </Row>

          <Row className="align-items-center g-5 flex-row-reverse mb-5">
            <Col lg={6}>
              <div className="image-shadow rounded-3 overflow-hidden">
                <OptimizedImage 
                  src={boardingImages.studyArea}
                  alt="Quiet study area for evening prep"
                  width="600"
                  height="400"
                  className="rounded-3"
                />
              </div>
            </Col>
            <Col lg={6}>
              <div>
                <div className="section-icon mb-3" aria-hidden="true">📚</div>
                <h3 className="card-title-navy h3 fw-bold mb-4">Supervised Study Time</h3>
                <p className="text-muted">
                  Evening prep sessions are supervised by qualified teachers who provide academic support 
                  and ensure homework completion.
                </p>
              </div>
            </Col>
          </Row>

          <Row className="align-items-center g-5">
            <Col lg={6}>
              <div className="image-shadow rounded-3 overflow-hidden">
                <OptimizedImage 
                  src={boardingImages.recreation}
                  alt="Recreation and sports facilities"
                  width="600"
                  height="400"
                  className="rounded-3"
                />
              </div>
            </Col>
            <Col lg={6}>
              <div>
                <div className="section-icon mb-3" aria-hidden="true">⚽</div>
                <h3 className="card-title-navy h3 fw-bold mb-4">Recreation & Wellness</h3>
                <p className="text-muted">
                  We believe in holistic development. Our boarding students have access to sports facilities, 
                  common rooms with recreational activities.
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Daily Routine Section */}
      <section className="py-5 bg-white">
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
                  <p className="mb-4">Essential Items Your Child will need for Boarding</p>
                  
                  <div className="text-center mb-4">
                    <div 
                      className="boarding-checklist-image-wrapper"
                      onClick={() => handleViewImage(boardingItemsImage, "Boarding Items Checklist")}
                    >
                      <OptimizedImage 
                        src={boardingItemsImage}
                        alt="Boarding Items Checklist"
                        width="800"
                        height="600"
                        objectFit="contain"
                        className="boarding-checklist-image"
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
                      aria-label="View boarding items checklist"
                    >
                      <i className="fas fa-eye me-2" aria-hidden="true"></i>
                      View Checklist
                    </Button>
                    <Button 
                      onClick={() => handleDownload(pdfDocuments.itemsList, 'Boarding_Items_List.pdf')}
                      className="btn-navy"
                      disabled={isDownloading}
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
      <section className="py-5 bg-light-custom">
        <Container>
          <Row className="justify-content-center">
            <Col lg={10}>
              <Card className="card-custom border-0 shadow-lg cta-gradient-card">
                <Card.Body className="p-4 p-lg-5 text-center">
                  <div className="cta-content">
                    <h2 className="cta-title text-white mb-3">
                      Ready to Join Our Boarding Community?
                    </h2>
                    <p className="cta-description text-white opacity-90 mb-4">
                      Give your child the gift of independence, responsibility, and academic excellence in a safe, structured environment.
                    </p>
                    <div className="cta-buttons d-flex gap-3 justify-content-center flex-wrap">
                      <Link
                        to="/admissions/apply"
                        className="btn-light-navy"
                        aria-label="Apply for admission now"
                      >
                        Apply Now
                      </Link>
                      <Link
                        to="/contact"
                        className="btn-light-navy"
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
        <Modal.Header closeButton className="image-modal-header">
          <Modal.Title className="card-title-navy h6 fw-bold">
            <i className="fas fa-list me-2 text-gold" aria-hidden="true"></i>
            {selectedImage?.alt || "Boarding Items Checklist"}
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body className="image-modal-body">
          <div className="lightbox-image-container">
            <img 
              src={selectedImage?.url} 
              alt={selectedImage?.alt}
              className="lightbox-image"
            />
          </div>
        </Modal.Body>
        
        <Modal.Footer className="image-modal-footer">
          <Button 
            onClick={closeImageModal}
            className="btn-navy"
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
          font-size: clamp(1.5rem, 5vw, 1.8rem);
          font-weight: 700;
          margin-bottom: 1rem;
          color: white;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        }

        .boarding-hero-content p {
          font-size: clamp(0.9rem, 4vw, 1rem);
          color: rgba(255, 255, 255, 0.95);
          line-height: 1.6;
          margin-bottom: 1rem;
          text-shadow: 0 1px 5px rgba(0, 0, 0, 0.2);
        }

        /* Experience Card */
        .experience-card {
          background: var(--white);
          border-radius: 16px;
          padding: 1.25rem;
          text-align: center;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          height: 100%;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .experience-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1) !important;
        }

        .experience-icon-circle {
          width: 60px;
          height: 60px;
          background: var(--gradient-primary);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
          font-size: 1.8rem;
          color: var(--gold);
        }

        .experience-intro {
          max-width: 650px;
          margin: 0 auto;
          font-size: 1rem;
        }

        /* Outcome Card */
        .outcome-card {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          backdrop-filter: blur(10px);
          padding: 1.5rem;
          height: 100%;
          transition: transform 0.2s ease;
        }

        .outcome-card:hover {
          transform: translateY(-2px);
        }

        .outcome-icon {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 0.75rem;
          font-size: 1.9rem;
          color: var(--navy);
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
        }

        .outcome-description {
          opacity: 0.9;
        }

        /* Section Icon */
        .section-icon {
          font-size: 1.8rem;
          margin-bottom: 0.5rem;
        }

        /* Image Shadow */
        .image-shadow {
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .image-shadow:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 35px rgba(13, 101, 251, 0.2);
        }

        /* Boarding Checklist Image */
        .boarding-checklist-image-wrapper {
          max-height: 700px;
          overflow: hidden;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          margin: 0 auto;
          display: inline-block;
          cursor: pointer;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .boarding-checklist-image-wrapper:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(13, 101, 251, 0.15);
        }

        .boarding-checklist-image {
          width: 100%;
          height: auto;
          display: block;
        }

        /* Zoom Overlay */
        .zoom-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(13, 101, 251, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;
          backdrop-filter: blur(3px);
          border-radius: 12px;
        }

        .boarding-checklist-image-wrapper:hover .zoom-overlay {
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

        /* CTA Gradient Card */
        .cta-gradient-card {
          background: var(--gradient-primary);
          color: white;
          border-radius: 24px;
          overflow: hidden;
        }

        /* Routine Header */
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
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          position: relative;
          z-index: 1;
        }

        /* Modal Styles */
        .image-modal .modal-content {
          background: transparent;
          border: none;
        }

        .image-modal-header {
          background: var(--white) !important;
          border-radius: 16px 16px 0 0;
          border-bottom: 2px solid var(--gold);
          padding: 0.75rem 1rem;
        }

        .image-modal-body {
          padding: 0;
          background-color: rgba(0, 0, 0, 0.95);
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 50vh;
        }

        .image-modal-footer {
          background: var(--white) !important;
          border-radius: 0 0 16px 16px;
          border-top: 1px solid rgba(13, 101, 251, 0.1);
          padding: 0.75rem 1rem;
          justify-content: center;
        }

        .image-modal-header .btn-close {
          background-color: var(--gray-light);
          border-radius: 50%;
          padding: 0.5rem;
          transition: all 0.2s ease;
        }

        .image-modal-header .btn-close:hover {
          background-color: var(--gold);
          transform: scale(1.05);
        }

        .lightbox-image-container {
          max-width: 100%;
          max-height: 80vh;
          overflow: auto;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .lightbox-image {
          max-width: 100%;
          max-height: 80vh;
          object-fit: contain;
          display: block;
        }

        /* Image Fallback */
        .image-fallback {
          width: 100%;
          height: 100%;
          min-height: 200px;
          border-radius: 12px;
        }

        .fallback-icon {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .boarding-hero-content {
            padding: 60px 20px;
          }
          
          .boarding-hero-content h1 {
            font-size: 1.4rem;
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
        }
        
        @media (max-width: 576px) {
          .boarding-hero-content {
            padding: 50px 20px;
          }
          
          .boarding-hero-content h1 {
            font-size: 1.2rem;
          }

          .cta-buttons {
            flex-direction: column;
            align-items: stretch;
          }
          
          .cta-buttons .btn-navy,
          .cta-buttons .btn-outline-navy,
          .cta-buttons .btn-light-navy {
            width: 100%;
            text-align: center;
          }
        }
        
        @media (prefers-reduced-motion: reduce) {
          .experience-card,
          .routine-row,
          .zoom-overlay,
          .outcome-card,
          .image-shadow,
          .boarding-checklist-image-wrapper,
          .experience-card:hover,
          .routine-row:hover,
          .image-shadow:hover {
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
          width: 100%;
          height: 100%;
          position: relative;
          z-index: 2;
        }
      `}} />
    </>
  );
}

export default memo(BoardingLife);