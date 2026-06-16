// pages/FeeStructure.jsx - Updated to use JSON Bin (No localStorage)
import { Helmet } from "react-helmet-async";
import { Container, Row, Col, Button, Card, Spinner } from "react-bootstrap";
import { useState, useCallback, memo, lazy, Suspense, useEffect } from "react";
import { getFeeStructure } from "../services/dataService";

// Lazy load non-critical components
const GetInTouch = lazy(() => import("../components/GetInTouch"));

// Enhanced StatBadge component with accessibility
const StatBadge = memo(({ value, label }) => (
  <div className="fee-stat-badge" style={{
    background: 'linear-gradient(135deg, #ffffff 0%, var(--gray-light) 100%)',
    padding: '0.5rem 1rem',
    borderRadius: '50px',
    display: 'inline-flex',
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: '100px',
    boxShadow: '0 4px 15px rgba(13,101,251,0.08)',
    border: '1px solid rgba(13,101,251,0.1)'
  }}
  role="article"
  >
    <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--navy)', lineHeight: 1.2 }} aria-hidden="true">{value}</span>
    <span style={{ fontSize: '0.7rem', color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
    <span className="visually-hidden">{value} {label}</span>
  </div>
));

StatBadge.displayName = 'StatBadge';

// Enhanced InfoCard component with accessibility
const InfoCard = memo(({ icon, title, description }) => (
  <Col md={4}>
    <Card className="card-custom h-100 info-card" style={{
      background: 'white',
      borderRadius: '16px',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      overflow: 'hidden',
      position: 'relative'
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        background: 'var(--gradient-primary)'
      }} aria-hidden="true" />
      <Card.Body className="text-center p-3">
        <div style={{
          width: '60px',
          height: '60px',
          background: 'linear-gradient(135deg, rgba(13,101,251,0.1) 0%, rgba(255,0,128,0.1) 100%)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1rem',
          fontSize: '2rem',
          color: 'var(--gold)'
        }} aria-hidden="true">
          <i className={`bi bi-${icon}`} aria-hidden="true"></i>
        </div>
        <h3 className="card-title-navy h6 fw-bold mb-1">{title}</h3>
        <p className="small text-muted mb-0" style={{ lineHeight: 1.5 }}>{description}</p>
      </Card.Body>
    </Card>
  </Col>
));

InfoCard.displayName = 'InfoCard';

// Enhanced ClassButton component with FIXED SPACING for descriptions
const ClassButton = memo(({ category, isActive, onClick }) => {
  const buttonId = `class-${category.id}`;
  
  return (
    <button
      id={buttonId}
      onClick={() => onClick(category.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(category.id);
        }
      }}
      aria-pressed={isActive}
      aria-label={`${category.name} level, ${category.description}`}
      className={`class-selector-btn ${isActive ? 'active' : ''}`}
      style={{
        width: '100%',
        padding: '0.8rem 0.75rem',
        borderRadius: '12px',
        border: 'none',
        background: isActive 
          ? 'linear-gradient(135deg, #050265 70%, #4637f3 85%, #1a6bff 100%)'
          : 'white',
        color: isActive ? 'white' : 'var(--text-dark)',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        textAlign: 'center',
        boxShadow: isActive 
          ? '0 8px 16px rgba(13,101,251,0.2)'
          : '0 4px 12px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.02)',
        position: 'relative',
        overflow: 'hidden',
        minHeight: '44px',
        minWidth: '44px'
      }}
    >
      {isActive && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: '#ff0080'
        }} aria-hidden="true" />
      )}
      {/* Grade Name */}
      <div style={{ 
        fontWeight: '700', 
        fontSize: '1rem',
        marginBottom: '0.35rem',
        letterSpacing: '-0.2px'
      }}>
        {category.name}
      </div>
      {/* Visual Separator - small dot or line */}
      <div style={{
            width: '14px',
            height: '2px',
            background: isActive ? 'rgba(255,255,255,0.5)' : 'rgba(5,2,101,0.2)',
            margin: '0.15rem auto 0.2rem auto',
            borderRadius: '2px'
          }} aria-hidden="true" />

          {/* Grade Description */}
          <div style={{ 
            fontSize: '0.75rem',
            opacity: isActive ? 0.95 : 0.75,
            lineHeight: '1',
            letterSpacing: '0.1px',
            
          }}>
        {category.description}
      </div>
      {isActive && <span className="visually-hidden"> (selected)</span>}
    </button>
  );
});

ClassButton.displayName = 'ClassButton';

// Enhanced Image Modal with accessibility
const ImageModal = memo(({ selectedImage, showTransportImage, onClose, onDownload, selectedClass }) => {
  if (!selectedImage) return null;

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div 
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
        padding: '1rem',
        backdropFilter: 'blur(5px)'
      }}
      onClick={onClose}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-label={showTransportImage ? "Transportation costs enlarged view" : `Fee structure for ${selectedClass} enlarged view`}
      tabIndex={-1}
    >
      <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }} onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onClose();
            }
          }}
          className="modal-close-btn"
          style={{
            position: 'absolute',
            top: '-40px',
            right: '-40px',
            background: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '44px',
            height: '44px',
            fontSize: '1.5rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
            zIndex: 100001
          }}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          aria-label="Close enlarged view"
        >
          ×
        </button>
        <img
          src={selectedImage}
          alt={showTransportImage ? "Transportation costs" : `Fee structure for ${selectedClass}`}
          style={{ 
            maxWidth: '100%', 
            maxHeight: '90vh', 
            objectFit: 'contain', 
            borderRadius: '12px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
          }}
        />
        <div style={{
          position: 'absolute',
          bottom: '-60px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '1rem'
        }}>
          <button
            onClick={onDownload}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onDownload();
              }
            }}
            className="btn-navy"
            style={{
              padding: '0.6rem 1.5rem',
              borderRadius: '50px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.9rem',
              boxShadow: '0 10px 20px rgba(13,101,251,0.3)',
              transition: 'transform 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              minHeight: '44px',
              minWidth: '44px',
              background: 'linear-gradient(135deg, #050265 70%, #4637f3 85%, #1a6bff 100%)',
              border: 'none',
              color: 'white'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            aria-label="Download image"
          >
            <i className="bi bi-download" aria-hidden="true"></i>
            Download
          </button>
        </div>
      </div>
    </div>
  );
});

ImageModal.displayName = 'ImageModal';

// Value Proposition Component - What Your Child Benefits From
const ValueProposition = memo(() => {
  const benefits = [
    { icon: "book-half", text: "Structured CBC academic program" },
    { icon: "people-fill", text: "Experienced and dedicated teachers" },
    { icon: "shield-check", text: "Safe and supportive environment" },
    { icon: "trophy-fill", text: "Co-curricular activities and sports" },
    { icon: "building", text: "Facilities that support learning and growth" }
  ];

  return (
    <Container>
      <Card className="card-custom border-0 mb-5" style={{ 
        background: 'linear-gradient(135deg, #050265, #120b5d, #1a6bff)',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 15px 30px rgba(12, 88, 218, 0.2)'
      }}>
        <Card.Body className="p-4 text-center">
          <div className="d-inline-flex align-items-center justify-content-center mb-3" style={{
            width: '70px',
            height: '70px',
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '50%',
            boxShadow: '0 8px 20px rgba(0,0,0,0.2)'
          }}>
            <i className="bi bi-star-fill" style={{ fontSize: '2rem', color: 'white' }} aria-hidden="true"></i>
          </div>
          
          <h3 className="h4 fw-bold mb-3 text-white">
            What Your Child Benefits From
          </h3>
          
          <p style={{ fontSize: '1rem', color: 'white' }}>
            Your school fees support a complete learning experience that includes:
          </p>
          
          <div className="d-flex flex-wrap justify-content-center gap-3">
            {benefits.map((benefit, idx) => (
              <div key={idx} className="benefit-chip" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                background: 'white',
                borderRadius: '50px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                border: '1px solid rgba(0,0,0,0.05)',
                transition: 'all 0.3s ease'
              }}>
                <i className={`bi bi-${benefit.icon}`} style={{ fontSize: '1rem', color: '#050265' }} aria-hidden="true"></i>
                <span className="small fw-medium text-dark">{benefit.text}</span>
              </div>
            ))}
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
});

ValueProposition.displayName = 'ValueProposition';

// Decision Support Component - Need Help Understanding Fee Structure
const DecisionSupport = memo(() => (
  <Card className="card-custom border-0 mb-4" style={{ 
    background: 'linear-gradient(135deg, #050265, #120b5d, #1a6bff)',
    borderRadius: '20px',
    overflow: 'hidden',
    boxShadow: '0 15px 30px rgba(13,101,251,0.2)'
  }}>
    <Card.Body className="p-4 text-center">
      <h3 className="h4 fw-bold mb-3 text-white">
        Need Help Understanding the Fee Structure?
      </h3>
      <p className="mb-3 text-white small" style={{ opacity: 0.9, maxWidth: '550px', margin: '0 auto' }}>
        Our team is available to guide you through the fee structure and help you plan effectively.
      </p>
      <div className="d-flex flex-wrap justify-content-center gap-2">
        <Button className="btn-outline-navy"
          href="/contact" aria-label="Contact admissions team"
        >
          <i className="bi bi-envelope-fill me-2" aria-hidden="true"></i>
          Contact Admissions
        </Button>
        <Button className="btn-outline-navy"
          href="/admissions/apply"
          aria-label="apply now"
        >
          <i className="me-2" aria-hidden="true"></i>
          Apply Now
        </Button>
      </div>
    </Card.Body>
  </Card>
));

DecisionSupport.displayName = 'DecisionSupport';

// ============================================================
// Default fee images (fallback)
// ============================================================
const DEFAULT_FEE_IMAGES = {
  ecde: "/images/fee-structure/ecde.jpg",
  primary: "/images/fee-structure/primary.jpg",
  junior: "/images/fee-structure/junior.jpg",
  transport: "/images/fee-structure/transport.jpg"
};

function FeeStructure() {
  const [selectedClass, setSelectedClass] = useState("ecde");
  const [selectedImage, setSelectedImage] = useState(null);
  const [showTransportImage, setShowTransportImage] = useState(false);
  const [imageLoaded, setImageLoaded] = useState({});
  const [feeImages, setFeeImages] = useState(DEFAULT_FEE_IMAGES);
  const [transportImage, setTransportImage] = useState(DEFAULT_FEE_IMAGES.transport);
  const [loading, setLoading] = useState(true);

  // Load images from JSON Bin (No localStorage)
  useEffect(() => {
    const loadImages = async () => {
      setLoading(true);
      try {
        const data = await getFeeStructure();
        if (data) {
          const images = {
            ecde: data.ecde?.image || DEFAULT_FEE_IMAGES.ecde,
            primary: data.primary?.image || DEFAULT_FEE_IMAGES.primary,
            junior: data.junior?.image || DEFAULT_FEE_IMAGES.junior,
            transport: data.transport?.image || DEFAULT_FEE_IMAGES.transport
          };
          setFeeImages({
            ecde: images.ecde,
            primary: images.primary,
            junior: images.junior
          });
          setTransportImage(images.transport);
          console.log('Fee structure images loaded from JSON Bin');
        } else {
          // Use defaults if no data
          setFeeImages({
            ecde: DEFAULT_FEE_IMAGES.ecde,
            primary: DEFAULT_FEE_IMAGES.primary,
            junior: DEFAULT_FEE_IMAGES.junior
          });
          setTransportImage(DEFAULT_FEE_IMAGES.transport);
        }
      } catch (error) {
        console.error('Error loading fee images:', error);
        // Fallback to defaults
        setFeeImages({
          ecde: DEFAULT_FEE_IMAGES.ecde,
          primary: DEFAULT_FEE_IMAGES.primary,
          junior: DEFAULT_FEE_IMAGES.junior
        });
        setTransportImage(DEFAULT_FEE_IMAGES.transport);
      } finally {
        setLoading(false);
      }
    };

    loadImages();
  }, []);

  useEffect(() => {
    // Don't scroll to top if there's a hash (coming from another page)
    if (!window.location.hash) {
      window.scrollTo(0, 0);
    } else {
      // Handle hash navigation
      setTimeout(() => {
        const elementId = window.location.hash.substring(1);
        const element = document.getElementById(elementId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          element.setAttribute('tabindex', '-1');
          element.focus({ preventScroll: true });
        }
      }, 300);
    }
  }, []);

  const classCategories = [
    { id: "ecde", name: "ECDE", description: "Playgroup, PP1, PP2" },
    { id: "primary", name: "Primary", description: "Grade 1 - 6" },
    { id: "junior", name: "Junior Secondary", description: "Grade 7 - 9" }
  ];

  // Updated Trust Strip with enhanced messaging
  const trustPoints = [
    { icon: "wallet2", title: "Flexible Payment Options", description: "Pay in structured instalments to make school fees manageable across the term." },
    { icon: "percent", title: "Sibling Discount", description: "Families with more than one child benefit from reduced fees." },
    { icon: "bus-front", title: "Safe Transport Services", description: "Reliable transport options available for convenience and safety." }
  ];

  // Memoized handlers
  const handleViewImage = useCallback(() => {
    const imageUrl = feeImages[selectedClass];
    setSelectedImage(imageUrl);
    setShowTransportImage(false);
    document.body.style.overflow = 'hidden';
  }, [selectedClass, feeImages]);

  const handleViewTransportImage = useCallback(() => {
    setSelectedImage(transportImage);
    setShowTransportImage(true);
    document.body.style.overflow = 'hidden';
  }, [transportImage]);

  const handleDownloadImage = useCallback(() => {
    const imageUrl = showTransportImage ? transportImage : feeImages[selectedClass];
    const filename = showTransportImage 
      ? "Kitale_Progressive_Transport_Costs.jpg" 
      : `Kitale_Progressive_Fee_Structure_${selectedClass.toUpperCase()}.jpg`;
    
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [selectedClass, showTransportImage, feeImages, transportImage]);

  // Download both fee structure and transport costs
  const handleDownloadBoth = useCallback(() => {
    const link1 = document.createElement('a');
    link1.href = feeImages[selectedClass];
    link1.download = `Kitale_Progressive_Fee_Structure_${selectedClass.toUpperCase()}.jpg`;
    link1.target = '_blank';
    link1.rel = 'noopener noreferrer';
    document.body.appendChild(link1);
    link1.click();
    document.body.removeChild(link1);

    setTimeout(() => {
      const link2 = document.createElement('a');
      link2.href = transportImage;
      link2.download = "Kitale_Progressive_Transport_Costs.jpg";
      link2.target = '_blank';
      link2.rel = 'noopener noreferrer';
      document.body.appendChild(link2);
      link2.click();
      document.body.removeChild(link2);
    }, 500);
  }, [selectedClass, feeImages, transportImage]);

  const closeModal = useCallback(() => {
    setSelectedImage(null);
    setShowTransportImage(false);
    document.body.style.overflow = 'unset';
  }, []);

  const handleClassChange = useCallback((classId) => {
    setSelectedClass(classId);
    const announcer = document.getElementById('class-announcer');
    if (announcer) {
      const category = classCategories.find(c => c.id === classId);
      announcer.textContent = `Showing ${category.name} fee structure`;
    }
  }, [classCategories]);

  const handleImageLoad = useCallback((key) => {
    setImageLoaded(prev => ({ ...prev, [key]: true }));
  }, []);

  // Show loading state
  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading fee structure...</span>
        </div>
        <p className="mt-3 text-muted">Loading fee structure images...</p>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Fee Structure | Kitale Progressive School</title>
        <meta 
          name="description" 
          content="Clear, flexible, and value-driven school fees at Kitale Progressive School. View our transparent fee structure for ECDE, Primary, and Junior Secondary levels." 
        />
        <meta name="keywords" content="school fees, tuition, payment plans, sibling discount, transport costs, Kitale school, CBC program" />
      </Helmet>
      
      {/* Hero Section - Matching Curriculum Page with Background Image */}
      <section className="fee-hero-section" aria-labelledby="page-title">
        <div className="fee-hero-content">
          <h1 id="page-title">Clear, Flexible, and Value-Driven School Fees</h1>
          <p>Our fee structure is transparent, manageable and aligned with the quality of education, care and support your child receives.</p>
        </div>
      </section>

      {/* Trust Strip - Reduced spacing */}
      <section className="py-5" style={{ background: 'var(--gray-light)', borderBottom: '1px solid #eef2f6' }}>
        <Container>
          <Row className="g-4">
            {trustPoints.map((point, idx) => (
              <Col key={idx} md={4}>
                <div className="trust-card d-flex align-items-start gap-3 p-3 bg-white rounded-3 shadow-sm" style={{ 
                  borderRadius: '14px',
                  height: '100%',
                  transition: 'all 0.3s ease'
                }}>
                  <div style={{
                    width: '45px',
                    height: '45px',
                    background: '#100474)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <i className={`bi bi-${point.icon}`} style={{ fontSize: '1.2rem', color: 'navy' }} aria-hidden="true"></i>
                  </div>
                  <div>
                    <h3 className="h6 fw-bold mb-1" style={{ color: '#050265' }}>{point.title}</h3>
                    <p className="mb-0 small text-muted">{point.description}</p>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Parent Reassurance Section - Reduced spacing */}
      <section className="py-5" style={{ background: 'white' }}>
        <Container>
          <h2 className="section-heading text-center mb-3">Designed to Support Families</h2>
          <p className="text-center mx-auto text-muted" style={{ maxWidth: '900px' }}>
            We understand that school fees are an important consideration. Our structure is
            designed to balance affordability with quality education, ensuring your child receives a well
            rounded learning experience.     
          </p>
        </Container>
      </section>
    
      {/* Value Justification - What Your Child Benefits From */}
      <ValueProposition />
      
      {/* Fee Structure Section */}
      <section className="py-5" style={{ background: 'var(--gray-light)' }} aria-labelledby="fee-details-heading">
        <Container>
          <h2 id="fee-details-heading" className="visually-hidden">Fee Details</h2>

          {/* Screen reader announcer */}
          <div id="class-announcer" className="visually-hidden" role="status" aria-live="polite"></div>

          {/* Fee Table Section Context */}
          <h3 className="text-center mb-4">
            View detailed fee structure by level.
          </h3>
          <p className="text-center mb-4">
           click on preferred grade.
          </p>

          {/* Class Selector - FIXED with better spacing */}
          <Row className="justify-content-center mb-4">
            <Col lg={10}>
              <div 
                className="bg-white p-4 rounded-3 shadow-sm"
                style={{ 
                  display: 'flex', 
                  gap: '1rem',
                  borderRadius: '16px',
                  flexWrap: 'wrap',
                  justifyContent: 'center'
                }}
                role="tablist"
                aria-label="Education levels"
              >
                {classCategories.map(category => (
                  <div 
                    key={category.id} 
                    role="tab" 
                    style={{ 
                      flex: '1 1 200px',
                      minWidth: '160px',
                      maxWidth: '280px'
                    }}
                  >
                    <ClassButton
                      category={category}
                      isActive={selectedClass === category.id}
                      onClick={handleClassChange}
                    />
                  </div>
                ))}
              </div>
            </Col>
          </Row>
        
          {/* Fee Structure Image Preview */}
          <Card className="card-custom border-0 mb-5" style={{ 
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            borderRadius: '24px',
            overflow: 'hidden',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease'
          }}>
            <div style={{
              background: 'var(--gradient-primary)',
              padding: '1rem 1.75rem',
              color: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.75rem'
            }}>
              <div>
                <h3 className="h5 mb-0 fw-bold">
                  <i className="bi bi-receipt me-2" aria-hidden="true"></i>
                  {selectedClass === 'ecde' ? 'ECDE Fee Structure' : 
                  selectedClass === 'primary' ? 'Primary School Fee Structure' : 
                  'Junior Secondary Fee Structure'}
                </h3>
                <p className="mb-0 mt-1 small opacity-75">
                  <i className="bi bi-credit-card-2-front me-1" aria-hidden="true"></i>
                  View detailed fee breakdown by term
                </p>
              </div>
              <Button 
                size="sm"
                variant="outline-light"
                style={{
                  borderRadius: '40px',
                  padding: '0.5rem 1.25rem',
                  fontWeight: '500',
                  minHeight: '40px',
                  minWidth: '40px',
                  fontSize: '0.875rem',
                  borderColor: 'rgba(255,255,255,0.3)',
                  transition: 'all 0.3s ease',
                  background: 'transparent',
                  color: 'white'
                }}
                onClick={handleDownloadImage}
                aria-label={`Download ${selectedClass} fee structure`}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <i className="bi bi-download me-2" aria-hidden="true"></i> Download PDF
              </Button>
            </div>
            
            <Card.Body className="text-center p-4 bg-white">
              <div 
                onClick={handleViewImage} 
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleViewImage();
                  }
                }}
                style={{ 
                  cursor: 'pointer',
                  position: 'relative',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '100%'
                }}
                role="button"
                tabIndex={0}
                aria-label={`View enlarged fee structure for ${selectedClass}`}
              >
                {!imageLoaded[selectedClass] && (
                  <div className="image-skeleton" style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    borderRadius: '16px',
                    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                    backgroundSize: '200% 100%',
                    animation: 'skeleton-loading 1.5s infinite',
                    zIndex: 1
                  }} aria-hidden="true" />
                )}
                <img 
                  src={feeImages[selectedClass]} 
                  alt={`Fee Structure for ${selectedClass}`}
                  className={`curriculum-image ${imageLoaded[selectedClass] ? 'loaded' : ''}`}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '500px',
                    width: 'auto',
                    height: 'auto',
                    borderRadius: '16px',
                    boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
                    transition: 'transform 0.3s ease',
                    objectFit: 'contain'
                  }}
                  onLoad={() => handleImageLoad(selectedClass)}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "https://via.placeholder.com/800x600?text=No+Image+Available";
                  }}
                />
                <div className="image-tag" style={{
                  position: 'absolute',
                  bottom: '20px',
                  right: '20px',
                  background: 'rgba(5, 2, 101, 0.95)',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '40px',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  pointerEvents: 'none',
                  backdropFilter: 'blur(8px)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  zIndex: 2
                }} aria-hidden="true">
                  <i className="bi bi-zoom-in" aria-hidden="true"></i>
                  Click to enlarge
                </div>
              </div>
              
              {/* Quick info note */}
              <div className="mt-4 d-flex justify-content-center">
                <div className="p-2 px-3" style={{ 
                  background: 'linear-gradient(135deg, rgba(5,2,101,0.08), rgba(26,107,255,0.08))',
                  borderRadius: '12px',
                  display: 'inline-block'
                }}>
                  <p className="mb-0 small text-muted">
                    <i className="bi bi-info-circle-fill me-1 text-primary" aria-hidden="true"></i>
                    Fees are payable per term. Contact the accounts office for payment plans.
                  </p>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Spacer between cards */}
          <div style={{ height: '2rem' }} aria-hidden="true"></div>

          {/* Transport Section */}
          <Card id="transport-section" className="card-custom border-0 mb-5" style={{ 
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            borderRadius: '24px',
            overflow: 'hidden',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease'
          }}>
            <div style={{
              background: 'var(--gradient-primary)',
              padding: '1rem 1.75rem',
              color: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.75rem'
            }}>
              <div>
                <h3 className="h5 mb-0 fw-bold">
                  <i className="bi bi-bus-front me-2" aria-hidden="true"></i>
                  School Transportation Services
                </h3>
                <p className="mb-0 mt-1 small opacity-75">
                  <i className="bi bi-geo-alt me-1" aria-hidden="true"></i>
                  Convenient pick-up and drop-off routes
                </p>
              </div>
              <Button 
                size="sm"
                variant="outline-light"
                style={{
                  borderRadius: '40px',
                  padding: '0.5rem 1.25rem',
                  fontWeight: '500',
                  minHeight: '40px',
                  minWidth: '40px',
                  fontSize: '0.875rem',
                  borderColor: 'rgba(255,255,255,0.3)',
                  transition: 'all 0.3s ease',
                  background: 'transparent',
                  color: 'white'
                }}
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = transportImage;
                  link.download = "Kitale_Progressive_Transport.jpg";
                  link.target = '_blank';
                  link.rel = 'noopener noreferrer';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                aria-label="Download transportation costs"
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <i className="bi bi-download me-2" aria-hidden="true"></i> Download PDF
              </Button>
            </div>
            
            <Card.Body className="text-center p-4 bg-white">
              <div 
                onClick={handleViewTransportImage} 
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleViewTransportImage();
                  }
                }}
                style={{ 
                  cursor: 'pointer',
                  position: 'relative',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '100%'
                }}
                role="button"
                tabIndex={0}
                aria-label="View enlarged transportation costs"
              >
                {!imageLoaded.transport && (
                  <div className="image-skeleton" style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    borderRadius: '16px',
                    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                    backgroundSize: '200% 100%',
                    animation: 'skeleton-loading 1.5s infinite',
                    zIndex: 1
                  }} aria-hidden="true" />
                )}
                <img 
                  src={transportImage} 
                  alt="Transportation Costs"
                  className={`curriculum-image ${imageLoaded.transport ? 'loaded' : ''}`}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '500px',
                    width: 'auto',
                    height: 'auto',
                    borderRadius: '16px',
                    boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
                    transition: 'transform 0.3s ease',
                    objectFit: 'contain'
                  }}
                  onLoad={() => handleImageLoad('transport')}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "https://via.placeholder.com/800x400?text=No+Image+Available";
                  }}
                />
                <div className="image-tag" style={{
                  position: 'absolute',
                  bottom: '20px',
                  right: '20px',
                  background: 'rgba(5, 2, 101, 0.95)',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '40px',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  pointerEvents: 'none',
                  backdropFilter: 'blur(8px)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  zIndex: 2
                }} aria-hidden="true">
                  <i className="bi bi-zoom-in" aria-hidden="true"></i>
                  Click to enlarge
                </div>
              </div>
              
              {/* Service highlights */}
              <div className="mt-4">
                <div className="d-flex flex-wrap justify-content-center gap-2">
                  <div className="p-2 px-3" style={{ background: 'var(--gray-light)', borderRadius: '30px' }}>
                    <small className="text-muted">
                      <i className="bi bi-check-circle-fill text-primary me-1" style={{ fontSize: '0.7rem' }}></i>
                      Safe & Reliable Transport
                    </small>
                  </div>
                </div>
              </div>
              
              {/* Info note */}
              <div className="mt-4 d-flex justify-content-center">
                <div className="p-3" style={{ 
                  background: 'var(--gray-light)', 
                  borderRadius: '14px',
                  borderLeft: '4px solid #0d65fb',
                  maxWidth: '90%'
                }}>
                  <p className="mb-0 small text-muted">
                    <i className="bi bi-info-circle-fill me-1 text-primary" aria-hidden="true"></i>
                    Transport routes and costs vary based on location. Contact the transport office for personalized guidance and availability.
                  </p>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Action Buttons */}
          <Row className="mt-3 g-2 mb-5">
            <Col xs={6} md={3}>
              <Button 
                className="btn-navy w-100 py-2"
                style={{
                  borderRadius: '40px',
                  fontWeight: '600',
                  fontSize: '0.8rem',
                  minHeight: '40px',
                  background: 'linear-gradient(135deg, #050265 70%, #4637f3 85%, #1a6bff 100%)',
                  border: 'none'
                }}
                onClick={handleViewImage}
                aria-label={`View fee structure for ${selectedClass}`}
              >
                <i className="bi bi-eye me-2" aria-hidden="true"></i>
                <span className="d-none d-sm-inline">View Fee</span>
                <span className="d-inline d-sm-none">Fee</span>
              </Button>
            </Col>
            <Col xs={6} md={3}>
              <Button 
                className="btn-navy w-100 py-2"
                style={{
                  borderRadius: '40px',
                  fontWeight: '600',
                  fontSize: '0.8rem',
                  minHeight: '40px',
                  background: 'linear-gradient(135deg, #050265 70%, #4637f3 85%, #1a6bff 100%)',
                  border: 'none'
                }}
                onClick={handleViewTransportImage}
                aria-label="View transportation costs"
              >
                <i className="bi bi-bus-front me-2" aria-hidden="true"></i>
                <span className="d-none d-sm-inline">Transport</span>
                <span className="d-inline d-sm-none">Bus</span>
              </Button>
            </Col>
            <Col xs={6} md={3}>
              <Button 
                className="btn-navy w-100 py-2"
                style={{
                  borderRadius: '40px',
                  fontWeight: '600',
                  fontSize: '0.8rem',
                  minHeight: '40px',
                  background: 'linear-gradient(135deg, #050265 70%, #4637f3 85%, #1a6bff 100%)',
                  border: 'none'
                }}
                onClick={handleDownloadImage}
                aria-label="Download current view"
              >
                <i className="bi bi-download me-2" aria-hidden="true"></i>
                <span className="d-none d-sm-inline">Download</span>
                <span className="d-inline d-sm-none">Download</span>
              </Button>
            </Col>
            <Col xs={6} md={3}>
              <Button 
                className="btn-navy w-100 py-2"
                style={{
                  borderRadius: '40px',
                  fontWeight: '600',
                  fontSize: '0.8rem',
                  minHeight: '40px',
                  background: 'linear-gradient(135deg, #050265 70%, #4637f3 85%, #1a6bff 100%)',
                  border: 'none'
                }}
                onClick={handleDownloadBoth}
                aria-label="Download both fee structure and transportation costs"
              >
                <i className="bi bi-download me-2" aria-hidden="true"></i>
                <span className="d-none d-sm-inline">Download Both</span>
                <span className="d-inline d-sm-none">Download Both</span>
              </Button>
            </Col>
          </Row>

          {/* Payment Policy Section - Flexible Fee Payment Options */}
          <Row className="pt-4">
            <Col lg={12}>
              <Card className="card-custom border-0" style={{ 
                borderRadius: '20px',
                overflow: 'hidden'
              }}>
                <div style={{
                  background: '#1a6bff',
                  padding: '1rem 1.5rem'
                }}>
                  <h2 className="h6 fw-bold mb-0 text-white">
                    <i className="bi bi-clock-history me-2" aria-hidden="true"></i>
                    Flexible Fee Payment Options
                  </h2>
                  <p className="mb-0 small opacity-75 text-white">We offer two clear payment options to help you plan your child's education with confidence and convenience.</p>
                </div>
                <Card.Body className="p-4 bg-white">
                  <Row className="g-4">
                    <Col md={6}>
                      <div style={{ 
                        background: 'var(--gray-light)',
                        padding: '1.5rem',
                        borderRadius: '16px',
                        height: '100%'
                      }}>
                        <div className="d-flex align-items-center gap-2 mb-3">
                          <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '1.2rem' }} aria-hidden="true"></i>
                          <h3 className="h6 fw-bold mb-0" style={{ color: '#050265' }}>Option 1: Full Term Payment</h3>
                        </div>
                        <p className="text-muted small mb-3">Pay the full school fees before the term begins.</p>
                        <div className="ms-2">
                          <p className="mb-2 small"><i className="bi bi-check-lg text-success me-1" aria-hidden="true"></i> Ideal for parents who prefer to settle fees in one payment</p>
                          <p className="mb-2 small"><i className="bi bi-check-lg text-success me-1" aria-hidden="true"></i> Ensures a smooth start to the school term</p>
                          <p className="mb-0 small"><i className="bi bi-check-lg text-success me-1" aria-hidden="true"></i> No follow-up payment tracking required</p>
                        </div>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div style={{ 
                        background: 'var(--gray-light)',
                        padding: '1.5rem',
                        borderRadius: '16px',
                        height: '100%'
                      }}>
                        <div className="d-flex align-items-center gap-2 mb-3">
                          <i className="bi bi-calendar-week" style={{ fontSize: '1.2rem', color: '#050265' }} aria-hidden="true"></i>
                          <h3 className="h6 fw-bold mb-0" style={{ color: '#050265' }}>Option 2: Instalment Payment Plan</h3>
                        </div>
                        <p className="text-muted small mb-3">Pay school fees in structured instalments across the term.</p>
                        <div className="mb-3">
                          <p className="fw-bold mb-2 small" style={{ color: '#050265' }}>Payment Schedule:</p>
                          <div className="ms-2">
                            <p className="mb-1 small"><span className="fw-bold">50%</span> — Before or on opening day</p>
                            <p className="mb-1 small"><span className="fw-bold">75%</span> — By the end of the first month</p>
                            <p className="mb-0 small"><span className="fw-bold">100%</span> — By mid-term</p>
                          </div>
                        </div>
                        <div className="mt-3 pt-2 border-top border-light">
                          <p className="mb-1 small"><i className="bi bi-check-lg text-success me-1" aria-hidden="true"></i> Designed to make fee payment manageable for families</p>
                          <p className="mb-0 small"><i className="bi bi-check-lg text-success me-1" aria-hidden="true"></i> Helps you spread payments while keeping your child's learning uninterrupted</p>
                        </div>
                      </div>
                    </Col>
                  </Row>

                  <hr className="my-4" />

                  <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
                    <div>
                      <p className="mb-0 text-muted small">
                        <i className="bi bi-shield-check me-1" style={{ color: '#050265' }} aria-hidden="true"></i>
                        5% sibling discount available for families with more than one child
                      </p>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Decision Support Section */}
      <Container>
        <DecisionSupport />
      </Container>

      {/* Image Modal */}
      <ImageModal 
        selectedImage={selectedImage}
        showTransportImage={showTransportImage}
        onClose={closeModal}
        onDownload={handleDownloadImage}
        selectedClass={selectedClass}
      />

      <Suspense fallback={null}>
        <GetInTouch />
      </Suspense>

      <style dangerouslySetInnerHTML={{ __html: `
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
        
        /* Hero Section with Background Image */
        .fee-hero-section {
          position: relative;
          background: linear-gradient(135deg, #0d65fb 0%, #0a55d6 100%);
          min-height: 400px;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          overflow: hidden;
        }

        .fee-hero-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: url('/images/optimized/ECDE3.webp');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          filter: blur(0px);
          transform: scale(1.05);
          opacity: 1.0;
          z-index: 0;
        }

        .fee-hero-section::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(5,2,101,0.7), rgba(26,107,255,0.7));
          z-index: 1;
        }

        .fee-hero-content {
          position: relative;
          z-index: 2;
          max-width: 900px;
          margin: 0 auto;
          padding: 80px 20px;
          color: white;
        }

        .fee-hero-content h1 {
          font-size: clamp(2rem, 5vw, 3rem);
          font-weight: 700;
          margin-bottom: 1rem;
          color: white;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        }

        .fee-hero-content p {
          font-size: clamp(1rem, 4vw, 1.2rem);
          color: rgba(255, 255, 255, 0.95);
          line-height: 1.6;
          margin-bottom: 1rem;
          text-shadow: 0 1px 5px rgba(0, 0, 0, 0.2);
        }

        .info-card:hover,
        .info-card:focus-within {
          transform: translateY(-3px);
          box-shadow: 0 15px 30px rgba(0,0,0,0.1) !important;
        }
        
        .class-selector-btn {
          transition: all 0.3s ease;
        }
        
        .class-selector-btn:hover {
          transform: translateY(-2px);
        }
        
        button:focus-visible,
        [role="button"]:focus-visible {
          outline: 3px solid #ffd700;
          outline-offset: 2px;
        }
        
        @keyframes skeleton-loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        
        .card-custom:hover {
          transform: translateY(-4px);
          box-shadow: 0 25px 50px rgba(0,0,0,0.15) !important;
        }
        
        .curriculum-image {
          transition: all 0.3s ease;
        }
        
        .curriculum-image:hover {
          transform: scale(1.02);
        }
        
        @media (max-width: 768px) {
          .fee-hero-content {
            padding: 60px 20px;
          }
          .fee-stat-badge { min-width: 80px; padding: 0.4rem 0.75rem; }
          .fee-stat-badge span:first-child { font-size: 1.2rem; }
        }
        
        @media (max-width: 576px) {
          .fee-hero-content {
            padding: 50px 20px;
          }
          .fee-hero-content h1 {
            font-size: 1.8rem;
          }
          .fee-stat-badge { min-width: 70px; padding: 0.3rem 0.5rem; }
          .fee-stat-badge span:first-child { font-size: 1rem; }
        }
        
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; transition: none !important; }
          .info-card:hover { transform: none; }
          button:hover { transform: none !important; }
          .card-custom:hover { transform: none; }
        }
      `}} />
    </>
  );
}

export default memo(FeeStructure);