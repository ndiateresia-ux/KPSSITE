// pages/Curriculum.jsx - Uniform Font Sizes (1.3rem headings, 1rem body)
// Uses fetchpriority instead of preload to avoid console warnings
import { lazy, Suspense, memo, useCallback, useMemo, useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';

// Lazy load heavy components
const GetInTouch = lazy(() => import("../components/GetInTouch"));

// Optimized image component - uses fetchpriority (no preload warnings)
const OptimizedImage = memo(({ 
  src, 
  alt, 
  className = '', 
  width, 
  height,
  priority = false,
  ...props 
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const basePath = `/images/optimized/${src}`;

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
          srcSet={`${basePath}.webp`}
          type="image/webp"
        />
        <img
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
          {...props}
        />
      </picture>
      
      {/* Image Tags */}
      {src === 'ecde' && (
        <div className="image-tag ecde-tag">
          <i className="fas fa-child me-2" aria-hidden="true"></i>
          Play-based Learning
        </div>
      )}
      {src === 'primary' && (
        <div className="image-tag primary-tag">
          <i className="fas fa-book-open me-2" aria-hidden="true"></i>
          Structured Learning
        </div>
      )}
      {src === 'jss' && (
        <div className="image-tag jss-tag">
          <i className="fas fa-flask me-2" aria-hidden="true"></i>
          Specialized Learning
        </div>
      )}
    </div>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

// Pillar item component
const PillarItem = memo(({ icon, label }) => (
  <Col md={3} sm={6}>
    <div className="pillar-item text-center p-3 bg-white rounded-2 shadow-sm h-100" role="article">
      <div className="pillar-icon mb-2" aria-hidden="true">{icon}</div>
      <div className="fw-bold text-navy pillar-label">{label}</div>
      <span className="visually-hidden">Competency: {label}</span>
    </div>
  </Col>
));

PillarItem.displayName = 'PillarItem';

// Navigation card component
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
        <div className="curriculum-image-wrapper nav-card-image">
          <OptimizedImage
            src={data.image}
            alt={`${data.badge} level learning activities`}
            width="400"
            height="225"
            priority={data.id === 'ecde'}
          />
        </div>
        <Card.Body className="text-center p-4">
          <Card.Title id={`nav-card-${data.id}`} className="card-title-navy fw-bold mb-2 nav-card-title">{data.badge}</Card.Title>
          <Card.Text className="text-dark mb-3 nav-card-text">{data.ageRange}</Card.Text>
          <Button 
            variant="primary"
            size="sm"
            className="btn-navy px-4 nav-card-btn"
            onClick={handleClick}
            aria-label={`Explore ${data.badge} curriculum`}
          >
            Explore
          </Button>
        </Card.Body>
      </Card>
    </Col>
  );
});

NavCard.displayName = 'NavCard';

// Scroll to contact function
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
    window.location.href = '/contact';
  }
};

// CTA Banner Component
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
    <div className="cta-section cta-primary">
      <div className="cta-content">
        <h3 className="cta-title">{title}</h3>
        <p className="cta-description">{description}</p>
        <div className="cta-buttons">
          <button onClick={handlePrimaryClick} className="btn-navy">
            {primaryText}
          </button>
          <button onClick={handleSecondaryClick} className="btn-navy">
            {secondaryText}
          </button>
        </div>
      </div>
    </div>
  );
});

CTABanner.displayName = 'CTABanner';

// ECD Section Component
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
      className="curriculum-section py-6 bg-white"
      aria-labelledby={headingId}
      tabIndex="-1"
    >
      <Container>
        <Row className="align-items-center g-5">
          <Col lg={6}>
            <div className="curriculum-content">
              <span className="curriculum-badge ecde-badge">ECDE</span>
              <h2 id={headingId} className="section-heading-left mb-4" style={{ fontSize: '1.3rem', fontWeight: '700' }}>
                Early Childhood Development (ECD): The Right Start for Your Child
              </h2>
              <p className="mb-3 text-dark" style={{ fontSize: '1rem', lineHeight: '1.6' }}>
                Are you looking for a safe, nurturing, and structured environment where your child can confidently begin their learning journey?
              </p>
              <p className="mb-2 text-dark" style={{ fontSize: '1rem', lineHeight: '1.6' }}>
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

        <Row className="mt-5 g-4">
          <Col lg={4}>
            <div className="info-card p-4 rounded-3 h-100" style={{ background: 'var(--gray-light)' }}>
              <h4 className="fw-bold mb-3 text-navy" style={{ fontSize: '1rem' }}>
                <i className="fas fa-face-smile me-2 text-gold" aria-hidden="true"></i>
                What Your Child Will Experience
              </h4>
              <ul className="list-unstyled mb-0">
                {childExperiences.map((item, idx) => (
                  <li key={idx} className="mb-2 d-flex align-items-start gap-2">
                    <span className="text-gold mt-1" style={{ fontSize: '0.9rem' }} aria-hidden="true">✓</span>
                    <span className="text-dark" style={{ fontSize: '1rem', lineHeight: '1.5' }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Col>
          <Col lg={4}>
            <div className="info-card p-4 rounded-3 h-100" style={{ background: 'var(--gray-light)' }}>
              <h4 className="fw-bold mb-3 text-navy" style={{ fontSize: '1rem' }}>
                <i className="fas fa-graduation-cap me-2 text-gold" aria-hidden="true"></i>
                Learning Approach
              </h4>
              <ul className="list-unstyled mb-0">
                {learningApproaches.map((item, idx) => (
                  <li key={idx} className="mb-2 d-flex align-items-start gap-2">
                    <span className="text-gold mt-1" style={{ fontSize: '0.9rem' }} aria-hidden="true">✓</span>
                    <span className="text-dark" style={{ fontSize: '1rem', lineHeight: '1.5' }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Col>
          <Col lg={4}>
            <div className="info-card p-4 rounded-3 h-100" style={{ background: 'var(--gray-light)' }}>
              <h4 className="fw-bold mb-3 text-navy" style={{ fontSize: '1rem' }}>
                <i className="fas fa-heart me-2 text-gold" aria-hidden="true"></i>
                What to Expect as a Parent
              </h4>
              <ul className="list-unstyled mb-0">
                {parentExpectations.map((item, idx) => (
                  <li key={idx} className="mb-2 d-flex align-items-start gap-2">
                    <span className="text-gold mt-1" style={{ fontSize: '0.9rem' }} aria-hidden="true">✓</span>
                    <span className="text-dark" style={{ fontSize: '1rem', lineHeight: '1.5' }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Col>
        </Row>

        <Row className="mt-5">
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

// Primary Section Component
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
      className="curriculum-section py-6 bg-light-custom"
      aria-labelledby={headingId}
      tabIndex="-1"
    >
      <Container>
        <Row className="align-items-center g-5 flex-row-reverse">
          <Col lg={6}>
            <div className="curriculum-content">
              <span className="curriculum-badge primary-badge">Primary</span>
              <h2 id={headingId} className="section-heading-left mb-4" style={{ fontSize: '1.3rem', fontWeight: '700' }}>
                Primary School: Building Strong Academic Skills and Confidence
              </h2>
              <p className="mb-3 text-dark" style={{ fontSize: '1rem', lineHeight: '1.6' }}>
                Are you looking for a school that will strengthen your child's academic foundation while developing confidence and discipline?
              </p>
              <p className="mb-2 text-dark" style={{ fontSize: '1rem', lineHeight: '1.6' }}>
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
              priority={false}
            />
          </Col>
        </Row>

        <Row className="mt-5 g-4">
          <Col lg={4}>
            <div className="info-card p-4 rounded-3 h-100" style={{ background: 'var(--white)' }}>
              <h4 className="fw-bold mb-3 text-navy" style={{ fontSize: '1rem' }}>
                <i className="fas fa-smile me-2 text-gold" aria-hidden="true"></i>
                What Your Child Will Experience
              </h4>
              <ul className="list-unstyled mb-0">
                {childExperiences.map((item, idx) => (
                  <li key={idx} className="mb-2 d-flex align-items-start gap-2">
                    <span className="text-gold mt-1" style={{ fontSize: '0.9rem' }} aria-hidden="true">✓</span>
                    <span className="text-dark" style={{ fontSize: '1rem', lineHeight: '1.5' }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Col>
          <Col lg={4}>
            <div className="info-card p-4 rounded-3 h-100" style={{ background: 'var(--white)' }}>
              <h4 className="fw-bold mb-3 text-navy" style={{ fontSize: '1rem' }}>
                <i className="fas fa-graduation-cap me-2 text-gold" aria-hidden="true"></i>
                Learning Approach
              </h4>
              <ul className="list-unstyled mb-0">
                {learningApproaches.map((item, idx) => (
                  <li key={idx} className="mb-2 d-flex align-items-start gap-2">
                    <span className="text-gold mt-1" style={{ fontSize: '0.9rem' }} aria-hidden="true">✓</span>
                    <span className="text-dark" style={{ fontSize: '1rem', lineHeight: '1.5' }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Col>
          <Col lg={4}>
            <div className="info-card p-4 rounded-3 h-100" style={{ background: 'var(--white)' }}>
              <h4 className="fw-bold mb-3 text-navy" style={{ fontSize: '1rem' }}>
                <i className="fas fa-heart me-2 text-gold" aria-hidden="true"></i>
                What to Expect as a Parent
              </h4>
              <ul className="list-unstyled mb-0">
                {parentExpectations.map((item, idx) => (
                  <li key={idx} className="mb-2 d-flex align-items-start gap-2">
                    <span className="text-gold mt-1" style={{ fontSize: '0.9rem' }} aria-hidden="true">✓</span>
                    <span className="text-dark" style={{ fontSize: '1rem', lineHeight: '1.5' }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Col>
        </Row>

        <Row className="mt-5">
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

// Junior Secondary Section Component
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
      className="curriculum-section py-6 bg-white"
      aria-labelledby={headingId}
      tabIndex="-1"
    >
      <Container>
        <Row className="align-items-center g-5">
          <Col lg={6}>
            <div className="curriculum-content">
              <span className="curriculum-badge jss-badge">JSS</span>
              <h2 id={headingId} className="section-heading-left mb-4" style={{ fontSize: '1.3rem', fontWeight: '700' }}>
                Junior Secondary School: Preparing Learners for the Future
              </h2>
              <p className="mb-3 text-dark" style={{ fontSize: '1rem', lineHeight: '1.6' }}>
                Are you looking for a school that will prepare your child for senior school, future careers, and real-life success?
              </p>
              <p className="mb-2 text-dark" style={{ fontSize: '1rem', lineHeight: '1.6' }}>
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
              priority={false}
            />
          </Col>
        </Row>

        <Row className="mt-5 g-4">
          <Col lg={4}>
            <div className="info-card p-4 rounded-3 h-100" style={{ background: 'var(--gray-light)' }}>
              <h4 className="fw-bold mb-3 text-navy" style={{ fontSize: '1rem' }}>
                <i className="fas fa-smile me-2 text-gold" aria-hidden="true"></i>
                What Your Child Will Experience
              </h4>
              <ul className="list-unstyled mb-0">
                {childExperiences.map((item, idx) => (
                  <li key={idx} className="mb-2 d-flex align-items-start gap-2">
                    <span className="text-gold mt-1" style={{ fontSize: '0.9rem' }} aria-hidden="true">✓</span>
                    <span className="text-dark" style={{ fontSize: '1rem', lineHeight: '1.5' }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Col>
          <Col lg={4}>
            <div className="info-card p-4 rounded-3 h-100" style={{ background: 'var(--gray-light)' }}>
              <h4 className="fw-bold mb-3 text-navy" style={{ fontSize: '1rem' }}>
                <i className="fas fa-graduation-cap me-2 text-gold" aria-hidden="true"></i>
                Learning Approach
              </h4>
              <ul className="list-unstyled mb-0">
                {learningApproaches.map((item, idx) => (
                  <li key={idx} className="mb-2 d-flex align-items-start gap-2">
                    <span className="text-gold mt-1" style={{ fontSize: '0.9rem' }} aria-hidden="true">✓</span>
                    <span className="text-dark" style={{ fontSize: '1rem', lineHeight: '1.5' }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Col>
          <Col lg={4}>
            <div className="info-card p-4 rounded-3 h-100" style={{ background: 'var(--gray-light)' }}>
              <h4 className="fw-bold mb-3 text-navy" style={{ fontSize: '1rem' }}>
                <i className="fas fa-heart me-2 text-gold" aria-hidden="true"></i>
                What to Expect as a Parent
              </h4>
              <ul className="list-unstyled mb-0">
                {parentExpectations.map((item, idx) => (
                  <li key={idx} className="mb-2 d-flex align-items-start gap-2">
                    <span className="text-gold mt-1" style={{ fontSize: '0.9rem' }} aria-hidden="true">✓</span>
                    <span className="text-dark" style={{ fontSize: '1rem', lineHeight: '1.5' }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Col>
        </Row>

        <Row className="mt-5">
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
    { icon: "🧠", label: "Critical Thinking & Problem Solving" },
    { icon: "🎨", label: "Imagination & Creativity" },
    { icon: "🤝", label: "Learning to Learn" },
    { icon: "💬", label: "Communication & Collaboration" },
    { icon: "💻", label: "Digital Literacy" },
    { icon: "🌍", label: "Citizenship" },
    { icon: "🔍", label: "Self-efficacy" },
  ];

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
      
      {/* Hero Section */}
      <section className="curriculum-hero-section" aria-labelledby="page-title">
        <div className="curriculum-hero-content">
          <h1 id="page-title">Academics</h1>
          <p>Our paths to building confident scholars</p>
        </div>
      </section>

      {/* Curriculum Overview */}
      <section className="py-6 bg-light-custom" aria-labelledby="overview-heading">
        <Container>
          <Row className="text-center mb-5">
            <Col lg={8} className="mx-auto">
              <h2 id="overview-heading" className="section-heading mb-3" style={{ fontSize: '1.3rem', fontWeight: '700' }}>
                The CBE Pathway
              </h2>
              <p className="overview-intro" style={{ fontSize: '1rem' }}>
                We follow the Competency-Based Education (CBE) approved by KICD, guiding learners from early years through junior school.
              </p>
            </Col>
          </Row>

          {/* Quick Navigation Cards */}
          <Row className="mb-5 g-4" role="list" aria-label="Curriculum levels">
            <NavCard data={navData.ecde} onClick={handleNavClick} />
            <NavCard data={navData.primary} onClick={handleNavClick} />
            <NavCard data={navData.jss} onClick={handleNavClick} />
          </Row>

          {/* CBE Pillars */}
          <Row className="mt-5">
            <Col lg={12}>
              <div className="pillars-container p-5 rounded-3 shadow-sm bg-white">
                <h3 className="text-center fw-bold mb-4 text-navy" style={{ fontSize: '1.3rem', fontWeight: '700' }}>
                  The 7 Core Competencies of CBE
                </h3>
                <Row className="g-4" role="list" aria-label="Core competencies">
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

      {/* Daily Experience Section */}
      <section className="py-6 bg-white" aria-labelledby="typical-day-heading">
        <Container>
          <Row className="text-center mb-5">
            <Col lg={8} className="mx-auto">
              <h2 id="typical-day-heading" className="section-heading mb-3" style={{ fontSize: '1.3rem', fontWeight: '700' }}>
                The Daily Experience
              </h2>
              <p className="daily-intro" style={{ fontSize: '1rem' }}>
                A thoughtfully structured day that fosters intellectual growth, character development, and holistic well-being.
              </p>
            </Col>
          </Row>

          <Row className="g-4 justify-content-center">
            {dailyFlow.map((item, idx) => (
              <Col key={idx} xs={12} sm={6} md={3} lg={3}>
                <div className="daily-flow-card text-center p-4 border rounded-4 h-100 bg-white shadow-sm">
                  <div className="daily-flow-icon mb-3" style={{ fontSize: '2rem' }} aria-hidden="true">{item.icon}</div>
                  <h3 className="daily-flow-title" style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>{item.activity}</h3>
                  <p className="daily-flow-time" style={{ fontSize: '0.85rem', color: '#6c757d', marginBottom: '0' }}>{item.time}</p>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      <Suspense fallback={<div className="section-loader" aria-hidden="true"></div>}>
        <GetInTouch />
      </Suspense>

      <style dangerouslySetInnerHTML={{ __html: `
  .curriculum-hero-section {
    position: relative;
    background: linear-gradient(135deg, #0d65fb 0%, #0a55d6 100%);
    min-height: 400px;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    overflow: hidden;
  }

  .curriculum-hero-section::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: url('/images/optimized/jss.webp');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    opacity: 0.9;
    z-index: 0;
  }

  .curriculum-hero-section::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(13, 101, 251, 0.6), rgba(10, 85, 214, 0.7));
    z-index: 1;
  }

  .curriculum-hero-content {
    position: relative;
    z-index: 2;
    max-width: 900px;
    margin: 0 auto;
    padding: 80px 24px;
    color: white;
  }

  .curriculum-hero-content h1 {
          font-size: clamp(2rem, 5vw, 3rem);
          font-weight: 700;
          margin-bottom: 1rem;
          color: white;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        }


  .curriculum-hero-content p {
          font-size: clamp(1rem, 4vw, 1.2rem);
          color: rgba(255, 255, 255, 0.95);
          line-height: 1.6;
          margin-bottom: 1rem;
          text-shadow: 0 1px 5px rgba(0, 0, 0, 0.2);
        }
`}} />
    </>
  );
}

export default memo(Curriculum);