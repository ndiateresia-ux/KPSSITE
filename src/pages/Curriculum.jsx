// pages/Curriculum.jsx - Fully Updated with Increased Text Sizes
import { lazy, Suspense, memo, useCallback, useMemo, useEffect, useState, useRef } from "react";
import { useLocation, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';

// Lazy load heavy components
const GetInTouch = lazy(() => import("../components/GetInTouch"));

// Optimized image component with theme classes
const OptimizedImage = memo(({ 
  src, 
  alt, 
  className = '', 
  width, 
  height,
  priority = false,
  folder = '',
  ...props 
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef(null);

  const basePath = folder ? `/images/optimized/${folder}/${src}` : `/images/optimized/${src}`;

  useEffect(() => {
    if (priority) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = `${basePath}.webp`;
      link.type = 'image/webp';
      document.head.appendChild(link);
      
      return () => {
        if (link.parentNode) document.head.removeChild(link);
      };
    }
  }, [priority, basePath]);

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
            zIndex: 1,
            background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite'
          }}
          aria-hidden="true"
        />
      )}
      
      <picture>
        <source 
          srcSet={`${basePath}.webp`}
          type="image/webp"
        />
        <img
          ref={imgRef}
          src={`${basePath}.jpg`}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          fetchpriority={priority ? "high" : "auto"}
          decoding="async"
          width={width}
          height={height}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={`curriculum-image ${loaded ? 'loaded' : ''} ${className}`}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            position: 'relative',
            zIndex: 2
          }}
          {...props}
        />
      </picture>
      
      {/* Image Tag - using theme image-tag class */}
      {src === 'ecde' && (
        <div className="image-tag" style={{ background: 'rgba(255, 215, 0, 0.95)', color: 'var(--navy)' }}>
          <i className="fas fa-child me-2" aria-hidden="true"></i>
          Play-based Learning
        </div>
      )}
      {src === 'primary' && (
        <div className="image-tag" style={{ background: 'rgba(76, 175, 80, 0.95)', color: 'white' }}>
          <i className="fas fa-book-open me-2" aria-hidden="true"></i>
          Structured Learning
        </div>
      )}
      {src === 'jss' && (
        <div className="image-tag" style={{ background: 'rgba(33, 150, 243, 0.95)', color: 'white' }}>
          <i className="fas fa-flask me-2" aria-hidden="true"></i>
          Specialized Learning
        </div>
      )}
    </div>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

// Stat item component with theme
const StatItem = memo(({ value, label }) => (
  <Col xs={6} md={3}>
    <div className="curriculum-stat-badge text-center" role="article">
      <div className="stat-number text-gold fw-bold display-6" aria-hidden="true">{value}</div>
      <div className="stat-label text-white-50 small text-uppercase tracking-wide">{label}</div>
      <span className="visually-hidden">{value} {label}</span>
    </div>
  </Col>
));

StatItem.displayName = 'StatItem';

// Pillar item component with theme - Increased text size
const PillarItem = memo(({ icon, label }) => (
  <Col md={3} sm={6}>
    <div className="pillar-item text-center p-3 bg-white rounded-2 shadow-sm h-100" role="article">
      <div className="pillar-icon fs-1 mb-2" aria-hidden="true">{icon}</div>
      <h5 className="fw-bold text-navy mb-0" style={{ fontSize: '0.95rem' }}>{label}</h5>
      <span className="visually-hidden">Competency: {label}</span>
    </div>
  </Col>
));

PillarItem.displayName = 'PillarItem';

// Navigation card component with theme
const NavCard = memo(({ data, onClick }) => {
  const handleClick = useCallback(() => {
    onClick(`${data.id}-section`);
  }, [onClick, data.id]);
  
  return (
    <Col md={4} className="mb-4">
      <Card 
        className="curriculum-nav-card card-custom h-100 border-0" 
        role="article" 
        aria-labelledby={`nav-card-${data.id}`}
      >
        <div className="curriculum-image-wrapper" style={{ 
          aspectRatio: '16/9', 
          overflow: 'hidden', 
          borderRadius: '16px 16px 0 0'
        }}>
          <OptimizedImage
            src={data.image}
            alt={`${data.badge} level learning activities`}
            width="400"
            height="225"
            priority={data.id === 'ecde'}
          />
        </div>
        <Card.Body className="text-center p-3">
          <Card.Title id={`nav-card-${data.id}`} className="card-title-navy fw-bold h5 mb-1" style={{ fontSize: '1.1rem' }}>{data.badge}</Card.Title>
          <Card.Text className="text-dark mb-2" style={{ fontSize: '0.9rem' }}>{data.ageRange}</Card.Text>
          <Button 
            variant="primary"
            size="sm"
            className="btn-navy px-3"
            onClick={handleClick}
            aria-label={`Explore ${data.badge} curriculum`}
            style={{ minHeight: '40px', borderRadius: '40px', fontSize: '0.85rem' }}
          >
            Explore
          </Button>
        </Card.Body>
      </Card>
    </Col>
  );
});

NavCard.displayName = 'NavCard';

// Info Card Component for sections using theme - Increased text size
const InfoCard = memo(({ title, items, icon, bgColor = 'var(--gray-light)' }) => (
  <div className="info-card p-3 rounded-3 h-100" style={{ background: bgColor }}>
    <h4 className="fw-bold mb-3 text-navy" style={{ fontSize: '1.1rem' }}>
      <i className={`fas ${icon} me-2 text-gold`} aria-hidden="true"></i>
      {title}
    </h4>
    <ul className="list-unstyled mb-0">
      {items.map((item, idx) => (
        <li key={idx} className="mb-2 d-flex align-items-start gap-2">
          <span className="text-gold mt-1" aria-hidden="true">✓</span>
          <span className="text-dark" style={{ fontSize: '0.9rem' }}>{item}</span>
        </li>
      ))}
    </ul>
  </div>
));

InfoCard.displayName = 'InfoCard';

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

// Updated CTA Banner Component with scroll to contact functionality
const CTABanner = memo(({ title, description, primaryText, primaryLink, secondaryText }) => {
  const handlePrimaryClick = useCallback((e) => {
    e.preventDefault();
    if (primaryLink === '/contact') {
      scrollToContact(e);
    } else {
      window.location.href = primaryLink;
    }
  }, [primaryLink]);

  const handleSecondaryClick = useCallback((e) => {
    e.preventDefault();
    scrollToContact(e);
  }, []);

  return (
    <div className="cta-section cta-primary" style={{ marginTop: '1rem' }}>
      <div className="cta-content" style={{ padding: '20px 20px' }}>
        <h3 className="cta-title" style={{ fontSize: '1.3rem', marginBottom: '0.75rem' }}>{title}</h3>
        <p className="cta-description" style={{ fontSize: '0.9rem', marginBottom: '0.75rem', lineHeight: '1.6' }}>{description}</p>
        <div className="cta-buttons">
          <button 
            onClick={handlePrimaryClick}
            className="btn-navy" 
            style={{ padding: '6px 20px', fontSize: '0.85rem' }}
          >
            {primaryText}
          </button>
          <button 
            onClick={handleSecondaryClick}
            className="btn-navy" 
            style={{ padding: '6px 20px', fontSize: '0.85rem' }}
          >
            {secondaryText}
          </button>
        </div>
      </div>
    </div>
  );
});

CTABanner.displayName = 'CTABanner';

// ECD Section Component using theme - Increased text sizes
const ECDSection = memo(() => {
  const sectionId = "ecde-section";
  const headingId = "ecd-heading";

  const childExperiences = [
    "Play-based learning in a structured environment",
    "Early literacy (letters, sounds, communication)",
    "Numeracy (counting, patterns, basic concepts)",
    "Social interaction and teamwork",
    "Creative expression through music, storytelling, and art"
  ];

  const learningApproaches = [
    "Learning through play and guided activities",
    "Building independence at each child's pace",
    "Creating small successes that build confidence",
    "Encouraging communication and social interaction"
  ];

  const parentExpectations = [
    "A smooth transition into school life",
    "Regular communication on your child's progress",
    "A caring environment where your child feels safe and supported"
  ];

  return (
    <section 
      id={sectionId}
      className="curriculum-section py-6"
      style={{ background: 'var(--white)' }}
      aria-labelledby={headingId}
      tabIndex="-1"
    >
      <Container>
        <Row className="align-items-center g-5">
          <Col lg={6}>
            <div className="curriculum-content">
              <span className="curriculum-badge ecde-badge" style={{ fontSize: '0.8rem', padding: '6px 14px' }}>ECDE</span>
              <h2 id={headingId} className="section-heading-left mb-5" style={{ fontSize: '1.8rem' }}>Early Childhood Development (ECD): The Right Start for Your Child</h2>
              <p className="lead mb-3 text-dark" style={{ fontSize: '1.1rem', fontWeight:'bold' }}>
                Are you looking for a safe, nurturing, and structured environment where your child can confidently begin their learning journey?
              </p>
              <p className="lead mb-2 text-dark" style={{ fontSize: '1rem', lineHeight: '1.8' }}>
                Our ECD program introduces young learners to school life through a balanced combination of guided learning and play-based exploration, helping them develop confidence, curiosity, and essential foundational skills.
              </p>
            </div>
          </Col>
          <Col lg={6}>
            <OptimizedImage
              src="ecde"
              alt="Young children engaged in play-based learning activities"
              width="600"
              height="450"
              priority={true}
            />
          </Col>
        </Row>

        {/* Info Cards Row */}
        <Row className="mt-4 g-5">
          <Col lg={4}>
            <InfoCard 
              title="What Your Child Will Experience"
              items={childExperiences}
              icon="fa-face-smile"
              bgColor="var(--gray-light)"
            />
          </Col>
          <Col lg={4}>
            <InfoCard 
              title="Learning Approach"
              items={learningApproaches}
              icon="fa-graduation-cap"
              bgColor="var(--gray-light)"
            />
          </Col>
          <Col lg={4}>
            <InfoCard 
              title="What to Expect as a Parent"
              items={parentExpectations}
              icon="fa-heart"
              bgColor="var(--gray-light)"
            />
          </Col>
        </Row>

        {/* CTA Banner */}
        <Row className="mt-3">
          <Col lg={12}>
            <CTABanner 
              title="By the end of ECD, your child will be:"
              description="✓ Confident and socially developed | ✓ Ready for structured classroom learning | ✓ Equipped with early literacy and numeracy skills"
              primaryText="Apply Now"
              primaryLink="/admissions/apply"
              secondaryText="Book a School Visit"
            />
          </Col>
        </Row>
      </Container>
    </section>
  );
});

ECDSection.displayName = 'ECDSection';

// Primary Section Component using theme - Increased text sizes
const PrimarySection = memo(() => {
  const sectionId = "primary-section";
  const headingId = "primary-heading";

  const childExperiences = [
    "Structured lessons in literacy and numeracy",
    "Science, social studies, and environmental learning",
    "Interactive classroom discussions",
    "Problem-solving and analytical thinking",
    "Participation in co-curricular activities"
  ];

  const learningApproaches = [
    "Understanding concepts rather than memorization",
    "Continuous assessment and feedback",
    "Active participation and guided learning"
  ];

  const parentExpectations = [
    "Clear visibility of academic progress",
    "Support for your child's strengths and weaknesses",
    "Guidance from experienced teachers"
  ];

  return (
    <section 
      id={sectionId}
      className="curriculum-section py-6"
      style={{ background: 'var(--gray-light)' }}
      aria-labelledby={headingId}
      tabIndex="-1"
    >
      <Container>
        <Row className="align-items-center g-5 flex-row-reverse">
          <Col lg={6}>
            <div className="curriculum-content">
              <span className="curriculum-badge primary-badge" style={{ fontSize: '0.8rem', padding: '6px 14px' }}>Primary</span>
              <h2 id={headingId} className="section-heading-left mb-3" style={{ fontSize: '1.8rem' }}>Primary School: Building Strong Academic Skills and Confidence</h2>
              <p className="lead mb-4 text-dark" style={{ fontSize: '1.1rem', fontWeight:'bold' }}>
                Are you looking for a school that will strengthen your child's academic foundation while developing confidence and discipline?
              </p>
              <p className="lead mb-2 text-dark" style={{ fontSize: '1rem', lineHeight: '1.8' }}>
                Our Primary School program builds on foundational skills and introduces structured academic learning, helping learners grow in knowledge, independence, and critical thinking.
              </p>
            </div>
          </Col>
          <Col lg={6}>
            <OptimizedImage
              src="primary"
              alt="Primary school students engaged in structured learning"
              width="600"
              height="450"
            />
          </Col>
        </Row>

        {/* Info Cards Row */}
        <Row className="mt-4 g-5">
          <Col lg={4}>
            <InfoCard 
              title="What Your Child Will Experience"
              items={childExperiences}
              icon="fa-smile"
              bgColor="var(--white)"
            />
          </Col>
          <Col lg={4}>
            <InfoCard 
              title="Learning Approach"
              items={learningApproaches}
              icon="fa-graduation-cap"
              bgColor="var(--white)"
            />
          </Col>
          <Col lg={4}>
            <InfoCard 
              title="What to Expect as a Parent"
              items={parentExpectations}
              icon="fa-heart"
              bgColor="var(--white)"
            />
          </Col>
        </Row>

        {/* CTA Banner */}
        <Row className="mt-3">
          <Col lg={12}>
            <CTABanner 
              title="Your child will:"
              description="✓ Develop strong academic skills | ✓ Become confident and disciplined | ✓ Be prepared for more advanced learning"
              primaryText="Apply Now"
              primaryLink="/admissions/apply"
              secondaryText="Book a School Visit"
            />
          </Col>
        </Row>
      </Container>
    </section>
  );
});

PrimarySection.displayName = 'PrimarySection';

// Junior Secondary Section Component using theme - Increased text sizes
const JuniorSecondarySection = memo(() => {
  const sectionId = "jss-section";
  const headingId = "jss-heading";

  const childExperiences = [
    "Deeper subject understanding",
    "Project-based and collaborative learning",
    "Development of analytical thinking",
    "Exposure to career pathways and interests",
    "Increased academic responsibility"
  ];

  const learningApproaches = [
    "Critical thinking and problem solving",
    "Collaboration and teamwork",
    "Real-world application of knowledge"
  ];

  const parentExpectations = [
    "Increased independence in your child",
    "Structured academic guidance",
    "Preparation for senior school pathways"
  ];

  return (
    <section 
      id={sectionId}
      className="curriculum-section py-6"
      style={{ background: 'var(--white)' }}
      aria-labelledby={headingId}
      tabIndex="-1"
    >
      <Container>
        <Row className="align-items-center g-5">
          <Col lg={6}>
            <div className="curriculum-content">
              <span className="curriculum-badge jss-badge" style={{ fontSize: '0.8rem', padding: '6px 14px' }}>JSS</span>
              <h2 id={headingId} className="section-heading-left mb-2" style={{ fontSize: '1.8rem' }}>Junior Secondary School: Preparing Learners for the Future</h2>
              <p className="lead mb-2 text-dark" style={{ fontSize: '1.1rem', fontWeight:'bold' }}>
                Are you looking for a school that will prepare your child for senior school, future careers, and real-life success?
              </p>
              <p className="lead mb-2 text-dark" style={{ fontSize: '1rem', lineHeight: '1.8' }}>
                Our Junior Secondary program builds independence and prepares learners for the next stage through advanced academic learning, critical thinking, and exposure to future pathways.
              </p>
            </div>
          </Col>
          <Col lg={6}>
            <OptimizedImage
              src="jss"
              alt="Junior secondary students engaged in project-based learning"
              width="600"
              height="450"
            />
          </Col>
        </Row>

        {/* Info Cards Row */}
        <Row className="mt-4 g-5">
          <Col lg={4}>
            <InfoCard 
              title="What Your Child Will Experience"
              items={childExperiences}
              icon="fa-smile"
              bgColor="var(--gray-light)"
            />
          </Col>
          <Col lg={4}>
            <InfoCard 
              title="Learning Approach"
              items={learningApproaches}
              icon="fa-graduation-cap"
              bgColor="var(--gray-light)"
            />
          </Col>
          <Col lg={4}>
            <InfoCard 
              title="What to Expect as a Parent"
              items={parentExpectations}
              icon="fa-heart"
              bgColor="var(--gray-light)"
            />
          </Col>
        </Row>

        {/* CTA Banner */}
        <Row className="mt-3">
          <Col lg={12}>
            <CTABanner 
              title="Learners leave Junior Secondary:"
              description="✓ Confident and self-driven | ✓ Academically prepared | ✓ Ready for the next stage of education"
              primaryText="Apply Now"
              primaryLink="/admissions/apply"
              secondaryText="Book a School Visit"
            />
          </Col>
        </Row>
      </Container>
    </section>
  );
});

JuniorSecondarySection.displayName = 'JuniorSecondarySection';

function Curriculum() {
  const location = useLocation();

  // Handle scrolling to section
  useEffect(() => {
    if (location.hash) {
      const timer = setTimeout(() => {
        const section = document.getElementById(location.hash.substring(1));
        if (section) {
          section.scrollIntoView({ behavior: 'smooth', block: 'start' });
          section.setAttribute('tabindex', '-1');
          section.focus({ preventScroll: true });
        }
      }, 100);
      return () => clearTimeout(timer);
    } else {
      window.scrollTo(0, 0);
    }
  }, [location]);

  const handleNavClick = useCallback((sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      section.setAttribute('tabindex', '-1');
      section.focus({ preventScroll: true });
    }
  }, []);

  const navData = {
    ecde: {
      id: 'ecde',
      badge: 'ECDE',
      ageRange: 'Ages 2-5 years',
      image: 'ecde'
    },
    primary: {
      id: 'primary',
      badge: 'Primary',
      ageRange: 'Grades 1-6',
      image: 'primary'
    },
    jss: {
      id: 'jss',
      badge: 'Junior Secondary',
      ageRange: 'Grades 7-9',
      image: 'jss'
    }
  };

  const cbePillars = [
    { icon: "🧠", label: "Critical Thinking and problem solving" },
    { icon: "🎨", label: "Imagination and Creativity" },
    { icon: "🤝", label: "Learning to Learn" },
    { icon: "💬", label: "Communication and Collaboration" },
    { icon: "💻", label: "Digital Literacy" },
    { icon: "🌍", label: "Citizenship" },
    { icon: "🔍", label: "Self-efficacy" },
  ];

  // Daily schedule flow
  const dailyFlow = useMemo(() => [
    { time: "Morning", icon: "📚", activity: "Morning Classes" },
    { time: "Break", icon: "🍎", activity: "Break and Social Time" },
    { time: "Mid-Day", icon: "📖", activity: "Academic Lessons" },
    { time: "Afternoon", icon: "⚽", activity: "Co-curricular Activities" },
    { time: "Evening", icon: "📝", activity: "Wrap-up / Prep" }
  ], []);
  
  return (
    <>
      <Helmet>
        <title>Academics & Curriculum | Kitale Progressive School</title>
        <meta
          name="description"
          content="Explore our ECD, Primary, and Junior Secondary programs at Kitale Progressive School. Learn about our Competency-Based Education (CBE) and how we nurture confident, capable learners."
        />
      </Helmet>
      
      {/* Page Header - Using theme page-title-section */}
      <section className="curriculum-hero-section" aria-labelledby="page-title">
        <div className="curriculum-hero-content">
          <h1 id="page-title" className="display-5 fw-bold" style={{ fontSize: '3rem' }}>
            Academics
          </h1>
          <p className="lead" style={{ fontSize: '1.2rem' }}>
            Our paths to building confident scholars
          </p>
        </div>
      </section>

      {/* Curriculum Overview */}
      <section className="py-5 bg-light-custom" aria-labelledby="overview-heading">
        <Container>
          <Row className="text-center mb-4">
            <Col lg={8} className="mx-auto">
              <h2 id="overview-heading" className="section-heading mb-4" style={{ fontSize: '2rem' }}>
                The CBE Pathway
              </h2>
              <p className="lead text-dark" style={{ fontSize: '1rem', maxWidth: '700px', margin: '0 auto' }}>
                We follow the Competency-Based Education (CBE) approved by (KICD), guiding learners
                from early years through junior school.          
              </p>
            </Col>
          </Row>

          {/* Quick Navigation Cards */}
          <Row className="mb-5 g-5" role="list" aria-label="Curriculum levels">
            <NavCard data={navData.ecde} onClick={handleNavClick} />
            <NavCard data={navData.primary} onClick={handleNavClick} />
            <NavCard data={navData.jss} onClick={handleNavClick} />
          </Row>

          {/* CBE Pillars */}
          <Row className="mt-4">
            <Col lg={12}>
              <div className="p-4 rounded-3 shadow-sm" style={{ background: 'var(--white)' }}>
                <h3 className="text-center fw-bold mb-4 text-navy" style={{ fontSize: '1.5rem' }}>
                  The 7 Core Competencies of CBE
                </h3>
                <Row className="g-5" role="list" aria-label="Core competencies">
                  {cbePillars.map((pillar, index) => (
                    <PillarItem key={index} icon={pillar.icon} label={pillar.label} />
                  ))}
                </Row>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* ECD Section */}
      <ECDSection />

      {/* Primary Section */}
      <PrimarySection />

      {/* Junior Secondary Section */}
      <JuniorSecondarySection />

      {/* A Typical Day Section */}
      <section className="py-6" style={{ background: 'var(--white)' }} aria-labelledby="typical-day-heading">
        <Container>
          <Row className="text-center mb-3">
            <Col lg={8} className="mx-auto">
              <h2 id="typical-day-heading" className="section-heading mb-3">
                The Daily Experience
              </h2>
              <p className="text-muted lead">
                A thoughtfully structured day that fosters intellectual growth, character development, and holistic well-being.
              </p>
            </Col>
          </Row>

          <Row className="g-5 justify-content-center">
            {dailyFlow.map((item, idx) => (
              <Col key={idx} xs={12} sm={6} md={3} lg={3}>
                <div className="text-center p-3 border rounded-4 h-100 bg-white shadow-sm hover-shadow transition">
                  <div 
                    className="mb-3 d-inline-flex align-items-center justify-content-center rounded-circle bg-primary-soft" 
                    style={{ fontSize: '2rem', width: '64px', height: '64px' }}
                    aria-hidden="true"
                  >
                    {item.icon}
                  </div>
                  <h3 className="h5 fw-semibold mb-1">{item.activity}</h3>
                  <p className="small text-secondary mb-0">{item.time}</p>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      <Suspense fallback={<div className="section-loader" aria-hidden="true"></div>}>
        <GetInTouch />
      </Suspense>

      {/* Additional Styles that complement theme.css */}
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
        [tabindex="-1"]:focus {
          outline: 3px solid var(--gold);
          outline-offset: 2px;
        }
        button:focus-visible,
        a:focus-visible {
          outline: 3px solid var(--gold);
          outline-offset: 2px;
        }
        .curriculum-nav-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          border-radius: 14px;
          overflow: hidden;
          cursor: pointer;
        }
        .curriculum-nav-card:focus-within,
        .curriculum-nav-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 25px rgba(13,101,251,0.15) !important;
        }
        .curriculum-section {
          scroll-margin-top: 80px;
        }
        .curriculum-badge {
          display: inline-block;
          padding: 6px 14px;
          border-radius: 30px;
          font-size: 0.8rem;
          font-weight: 600;
          margin-bottom: 0.75rem;
          letter-spacing: 0.5px;
        }
        .ecde-badge {
          background: #ffd700;
          color: var(--navy);
        }
        .primary-badge {
          background: #4CAF50;
          color: white;
        }
        .jss-badge {
          background: #2196F3;
          color: white;
        }
        .pillar-item {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          border-radius: 12px;
        }
        .pillar-item:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(13,101,251,0.12);
        }
        .info-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .info-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(13,101,251,0.1);
        }
        .tracking-wide {
          letter-spacing: 0.5px;
        }
        .bg-light-custom {
          background-color: var(--gray-light);
        }
        .text-navy {
          color: var(--navy);
        }
        .text-gold {
          color: var(--gold);
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @media (max-width: 768px) {
          .section-heading {
            font-size: 1.6rem;
          }
          .section-heading-left {
            font-size: 1.4rem;
          }
          .curriculum-hero-content h1 {
            font-size: 2rem;
          }
          .curriculum-hero-content p {
            font-size: 1rem;
          }
        }
        @media (max-width: 576px) {
          .section-heading {
            font-size: 1.4rem;
          }
          .section-heading-left {
            font-size: 1.2rem;
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
          *,
          .curriculum-nav-card,
          .curriculum-nav-card:focus-within,
          .curriculum-nav-card:hover,
          .pillar-item,
          .info-card,
          .curriculum-image {
            transition: none !important;
          }
          .image-skeleton {
            animation: none !important;
          }
        }
      `}} />
    </>
  );
}

export default memo(Curriculum);