// pages/Home.jsx - Fixed syntax errors
import { Helmet } from "react-helmet-async";
import { Container, Row, Col, Card } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import React, { useEffect, lazy, Suspense, useCallback, useMemo, useState, useRef } from 'react';
import { BlogSection } from './Blogs';
import '../theme.css';

// Lazy load non-critical components
const GetInTouch = lazy(() => import("../components/GetInTouch"));

// Loading fallback
const SectionLoader = () => (
  <div className="section-loader" aria-hidden="true"></div>
);

// Helper function to generate local placeholder images
const getLocalPlaceholder = (text, width = 80, height = 80) => {
  const encodedText = encodeURIComponent((text || 'User').substring(0, 2));
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}'%3E%3Crect width='100%25' height='100%25' fill='%230d65fb'/%3E%3Ctext x='50%25' y='50%25' font-size='${width/2.5}' text-anchor='middle' dy='.3em' fill='%23ffffff' font-weight='bold'%3E${encodedText}%3C/text%3E%3C/svg%3E`;
};

// Image with fallback component
const ImageWithFallback = ({ src, alt, width, height, className, fetchpriority }) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = useCallback(() => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(getLocalPlaceholder(alt || 'img', width || 80, height || 80));
    }
  }, [hasError, alt, width, height]);

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      width={width}
      height={height}
      loading="lazy"
      onError={handleError}
      {...(fetchpriority && { fetchpriority })}
    />
  );
};

const StarRating = ({ rating }) => {
  return (
    <div className="star-rating">
      {[...Array(5)].map((_, i) => (
        <span key={i} className={`star ${i < rating ? 'star-filled' : 'star-empty'}`}>★</span>
      ))}
    </div>
  );
};

const HeroCarousel = ({ images, onNavigate }) => {
  const [activeSlot, setActiveSlot] = useState(0);
  const [slotA, setSlotA] = useState(0);
  const [slotB, setSlotB] = useState(null);
  const [keyA, setKeyA] = useState(0);
  const [keyB, setKeyB] = useState(0);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const autoPlayRef = useRef(null);

  // Preload all images up front
  useEffect(() => {
    images.forEach((img) => {
      const el = new window.Image();
      el.src = img.jpg;
    });
  }, [images]);

  const advance = useCallback(() => {
    setActiveSlot((curSlot) => {
      const nextSlot = curSlot === 0 ? 1 : 0;

      if (curSlot === 0) {
        setSlotA((curA) => {
          const nextImg = (curA + 1) % images.length;
          setSlotB(nextImg);
          setKeyB((k) => k + 1);
          return curA;
        });
      } else {
        setSlotB((curB) => {
          const nextImg = ((curB ?? 0) + 1) % images.length;
          setSlotA(nextImg);
          setKeyA((k) => k + 1);
          return curB;
        });
      }

      return nextSlot;
    });
  }, [images.length]);

  useEffect(() => {
    autoPlayRef.current = setInterval(advance, 6000);
    return () => clearInterval(autoPlayRef.current);
  }, [advance]);

  const handleFirstLoad = useCallback(() => {
    setOverlayVisible(true);
  }, []);

  const FADE = '1.4s ease';

  return (
    <section
      className="hero-section"
      aria-label="Hero carousel showcasing school facilities"
    >
      <div className="hero-carousel-container">
        {/* Slot A */}
        {slotA !== null && (
          <img
            key={`a-${keyA}`}
            className="hero-carousel-slot"
            src={images[slotA].jpg}
            alt={images[slotA].alt}
            loading="eager"
            fetchpriority="high"
            decoding="sync"
            onLoad={slotA === 0 && keyA === 0 ? handleFirstLoad : undefined}
            style={{
              opacity: activeSlot === 0 ? 1 : 0,
              transition: `opacity ${FADE}`,
              zIndex: activeSlot === 0 ? 1 : 0,
            }}
          />
        )}

        {/* Slot B */}
        {slotB !== null && (
          <img
            key={`b-${keyB}`}
            className="hero-carousel-slot"
            src={images[slotB].jpg}
            alt={images[slotB].alt}
            loading="eager"
            fetchpriority="auto"
            decoding="async"
            style={{
              opacity: activeSlot === 1 ? 1 : 0,
              transition: `opacity ${FADE}`,
              zIndex: activeSlot === 1 ? 1 : 0,
            }}
          />
        )}

        <div className="hero-image-gradient-overlay" />
      </div>

      {/* Overlay — revealed once first image loads */}
      <div
        className="hero-overlay"
        style={{
          opacity: overlayVisible ? 1 : 0,
          transition: 'opacity 0.6s ease',
          pointerEvents: overlayVisible ? 'auto' : 'none',
        }}
      >
        <div className="hero-overlay-content">
          <h1 className="hero-title hero-animate-title py-3">
            Give Your Child the Foundation to Lead
          </h1>
          <p className="hero-subtitle hero-animate-subtitle">
            Excellence in CBE education, grounded in Christian values and the warmth of the Kenyan spirit.
            A safe haven where curiosity thrives.
          </p>
          <div className="hero-buttons-wrapper hero-animate-buttons">
            <button
              onClick={() => onNavigate('/admissions/apply')}
              className="hero-btn-primary"
              aria-label="Apply for Admissions"
            >
              Apply for Admissions
            </button>
            <button
              onClick={() => onNavigate('/academics/curriculum')}
              className="hero-btn-primary"
              aria-label="Explore our Programs"
            >
              Explore our Programs
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

// Stat Item Component with animation
const StatItemContent = ({ value, label, suffix }) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const checkIfVisible = () => {
      if (!hasAnimated && elementRef.current) {
        const rect = elementRef.current.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight - 100;

        if (isVisible) {
          setHasAnimated(true);
          let start = 0;
          const duration = 2000;

          const step = (timestamp) => {
            if (!start) start = timestamp;
            const progress = Math.min((timestamp - start) / duration, 1);
            const easedProgress = 1 - Math.pow(1 - progress, 3);
            const currentCount = Math.floor(easedProgress * value);
            setCount(currentCount);
            if (progress < 1) requestAnimationFrame(step);
          };

          requestAnimationFrame(step);
        }
      }
    };

    checkIfVisible();
    window.addEventListener('scroll', checkIfVisible);
    return () => window.removeEventListener('scroll', checkIfVisible);
  }, [value, hasAnimated]);

  return (
    <div ref={elementRef}>
      <div className="stat-number">{count}{suffix}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Home Component
// ─────────────────────────────────────────────────────────────────────────────
function Home() {
  const location = useLocation();
  const navigate = useNavigate();
  const contactFormRef = useRef(null);
  
  // State for testimonials loaded from localStorage
  const [testimonials, setTestimonials] = useState([]);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [isLoadingTestimonials, setIsLoadingTestimonials] = useState(true);

  // Default testimonials (fallback)
  const getDefaultTestimonials = () => [
    {
      id: 1,
      name: "Jane Akinyi",
      title: "Mrs.",
      parentType: "ECD Parent",
      section: "Early Childhood Development",
      quote: "Our child joined in ECD, and we have seen tremendous growth in confidence, communication, and learning. The teachers are caring, patient, and truly understand how young children develop.",
      rating: 5
    },
    {
      id: 2,
      name: "John Omondi",
      title: "Mr.",
      parentType: "Primary Parent",
      section: "Primary School",
      quote: "Kitale Progressive School has given our child a strong academic foundation. The teachers are committed, and the learning environment is very supportive.",
      rating: 5
    },
    {
      id: 3,
      name: "Sarah Kipchoge",
      title: "Mrs.",
      parentType: "Junior Secondary Parent",
      section: "Junior Secondary",
      quote: "We wanted a school that prepares our child for the future, and we found it here. The CBE approach is well implemented.",
      rating: 5
    },
    {
      id: 4,
      name: "David Mwangi",
      title: "Mr.",
      parentType: "Boarding Parent",
      section: "Boarding Program",
      quote: "The boarding environment is safe, structured, and well managed. As a parent, I have peace of mind.",
      rating: 5
    },
    {
      id: 5,
      name: "Grace Otieno",
      title: "Mrs.",
      parentType: "ECDE Parent",
      section: "Parent",
      quote: "What stands out is how the school combines strong academics with character development.",
      rating: 5
    }
  ];

  // Load testimonials from localStorage
  const loadTestimonials = useCallback(() => {
    setIsLoadingTestimonials(true);
    try {
      const saved = localStorage.getItem('admin_testimonials');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.length > 0) {
          setTestimonials(parsed);
          console.log('Loaded testimonials from admin:', parsed.length);
        } else {
          setTestimonials(getDefaultTestimonials());
        }
      } else {
        setTestimonials(getDefaultTestimonials());
      }
    } catch (error) {
      console.error('Error loading testimonials:', error);
      setTestimonials(getDefaultTestimonials());
    }
    setIsLoadingTestimonials(false);
  }, []);

  // Load testimonials on mount and listen for changes
  useEffect(() => {
    loadTestimonials();

    const handleStorageChange = (e) => {
      if (e.key === 'admin_testimonials') {
        console.log('Home: Testimonials storage changed, reloading...');
        loadTestimonials();
      }
    };

    const handleAdminDataChange = (e) => {
      if (e.detail?.key === 'admin_testimonials') {
        console.log('Home: adminDataChange event received, reloading testimonials...');
        loadTestimonials();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('adminDataChange', handleAdminDataChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('adminDataChange', handleAdminDataChange);
    };
  }, [loadTestimonials]);

  // Auto-rotate testimonials
  useEffect(() => {
    if (testimonials.length === 0) return;
    
    const interval = setInterval(() => {
      setTestimonialIndex((current) => (current + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const nextTestimonial = () => {
    setTestimonialIndex((current) => (current + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setTestimonialIndex((current) => (current - 1 + testimonials.length) % testimonials.length);
  };

  const scrollToContact = useCallback((event) => {
    event?.preventDefault();

    let contactElement = document.getElementById('contactus');

    if (!contactElement) {
      contactElement = document.querySelector('#get-in-touch-form, .get-in-touch-section form, [id*="contact"]');
    }

    if (contactElement) {
      const elementPosition = contactElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - 80;

      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });

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
      navigate('/contact');
    }
  }, [navigate]);

  useEffect(() => {
    if (location.hash === '#contact-section' || location.hash === '#contactus') {
      setTimeout(() => scrollToContact(), 100);
    } else if (location.hash === '') {
      requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }
  }, [location, scrollToContact]);

  const handleLinkClick = useCallback((path, scrollToForm = false) => {
    if (scrollToForm && (path === '/contact' || path === 'contact')) {
      scrollToContact();
    } else {
      navigate(path);
      requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }
  }, [navigate, scrollToContact]);

  const whyChooseUsItems = useMemo(() => [
    { icon: "👩‍🏫", title: "Teachers Who Know and Support Every Child", description: "Your child is not just another student here. Our teachers take time to understand each learner's strengths, guide their progress, and provide the support they need to grow with confidence." },
    { icon: "📚", title: "A Strong Academic Foundation That Builds Confidence", description: "We focus on helping learners understand, not just memorize. As a CBE school in Kitale, we guide students to develop critical thinking, problem-solving skills, and a strong academic foundation for future success." },
    { icon: "🛡️", title: "A Safe and Supportive Learning Environment", description: "Parents want peace of mind. Our school provides a secure, structured, and caring environment where learners feel safe, respected, and ready to learn every day." },
    { icon: "⚽", title: "Balanced Education Beyond the Classroom", description: "Learning does not stop in the classroom. From sports to clubs and creative activities, learners develop confidence, teamwork, and life skills that shape their overall growth." },
    { icon: "🌟", title: "Character and Leadership Development", description: "We prepare learners for life, not just exams. Through guidance, responsibility, and school programs, students grow into disciplined, confident, and responsible individuals." },
    { icon: "🗺️", title: "A Clear Pathway for Your Child's Growth", description: "Parents want continuity and direction. From Early Childhood Development to Junior Secondary, we provide a structured academic journey that supports your child at every stage of their development." }
  ], []);

  const academicPathways = useMemo(() => [
    { level: "ECDE", summary: "Our ECD program builds strong foundations through play-based and structured learning that develops curiosity, creativity, and confidence.", image: "ECDE3", section: "ecde-section", btnText: "Explore ECDE" },
    { level: "Primary", summary: "Our primary program strengthens literacy, numeracy, and critical thinking while encouraging creativity and independent learning.", image: "primary", section: "primary-section", btnText: "Explore Primary" },
    { level: "Junior Secondary", summary: "Our Junior Secondary program prepares learners for future academic and career pathways through advanced curriculum and leadership development.", image: "jss", section: "jss-section", btnText: "Explore JSS" },
  ], []);

  const learningApproaches = useMemo(() => [
    { title: "Student-Centered Learning", description: "Learners actively participate through discussions, projects, and practical activities." },
    { title: "Character & Leadership Development", description: "Programs nurture responsibility, discipline, and leadership skills." },
    { title: "Technology-Enhanced Learning", description: "ICT tools support digital literacy and modern learning experiences." },
  ], []);

  const stats = useMemo(() => [
    { value: 22, label: "Years of Excellence", suffix: "+" },
    { value: 500, label: "Happy Students", suffix: "+" },
    { value: 35, label: "Expert Teachers", suffix: "+" },
  ], []);

  const heroImages = useMemo(() => [
    { webp: "/images/optimized/gate3.webp", jpg: "/images/optimized/gate3.jpg", alt: "Kitale Progressive School Main Gate" },
    { webp: "/images/optimized/gate7.webp", jpg: "/images/optimized/gate7.jpg", alt: "School gate aerial" },
    { webp: "/images/optimized/gate.webp", jpg: "/images/optimized/gate.jpg", alt: "School Campus" },
    { webp: "/images/optimized/admin.webp", jpg: "/images/optimized/admin.jpg", alt: "Administration Block" },
    { webp: "/images/optimized/classroom2.webp", jpg: "/images/optimized/classroom2.jpg", alt: "Modern Classroom" },
    { webp: "/images/optimized/classroom3.webp", jpg: "/images/optimized/classroom3.jpg", alt: "Classroom Learning Environment" },
    { webp: "/images/optimized/school.webp", jpg: "/images/optimized/school.jpg", alt: "School Aerial View" },
  ], []);

  // Define currentTestimonial
  const defaultTestimonial = getDefaultTestimonials()[0];
  const currentTestimonial = testimonials.length > 0 
    ? testimonials[testimonialIndex % testimonials.length] 
    : defaultTestimonial;

  return (
    <>
      <Helmet>
        <title>Home | Kitale Progressive School</title>
        <meta name="description" content="Kitale Progressive School - Excellence in Education, Holistic Development and Safe Boarding Environment since 2004." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </Helmet>

      {/* Hero Section - Using theme.css styles */}
      <HeroCarousel
        images={heroImages}
        onNavigate={handleLinkClick}
      />

      {/* About Section - Using theme.css classes */}
      <section className="about-section section-padding" aria-labelledby="about-heading">
        <Container>
          <Row className="align-items-center g-5">
            <Col lg={6} className="order-2 order-lg-1">
              <picture>
                <source srcSet="/images/optimized/gate1.webp" type="image/webp" />
                <img
                  src="/images/optimized/gate1.jpg"
                  alt="Kitale Progressive School Campus"
                  className="img-fluid rounded w-100"
                  loading="lazy"
                  width="600"
                  height="400"
                  decoding="async"
                />
              </picture>
            </Col>
            <Col lg={6} className="order-1 order-lg-2">
              <h2 id="about-heading" className="section-heading-left mb-4">
                Are you looking for a school where your child will be known, nurtured, and inspired to succeed?
              </h2>
              <p className="about-text">
                At Kitale Progressive School, we believe every child carries unique potential. Our learning environment is designed to nurture curiosity, strengthen character, and build a strong academic foundation that prepares learners for the future.
              </p>
              <p className="about-text">
                As a trusted private school in Kitale, on the north-rift of Kenya, we serve families seeking quality CBE education from Early Childhood Development to Junior Secondary, providing a safe and nurturing environment where every learner is supported to succeed.
              </p>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Statistics Section - Using theme.css classes */}
      <section className="statistics-section" aria-labelledby="stats-heading">
        <Container>
          <h2 id="stats-heading" className="visually-hidden">School Statistics</h2>
          <Row className="justify-content-center">
            <Col lg={10} className="text-center">
              <h2 className="stats-intro-title">Are you looking for a reputable and established school where your child will thrive?</h2>
              <div className="stats-title-underline"></div>
            </Col>
          </Row>
          <Row className="justify-content-center g-5">
            {stats.map((stat, index) => (
              <Col md={4} sm={6} key={index} className="mb-4">
                <div className="stat-item-card">
                  <StatItemContent value={stat.value} label={stat.label} suffix={stat.suffix} />
                </div>
              </Col>
            ))}
          </Row>
          <Row className="justify-content-center mt-2">
            <Col lg={8}>
              <div className="stats-quote-block">
                <p className="stats-quote-text">
                  Parents in Kenya and East Africa choose our school because we combine strong academic standards with a supportive environment where children are encouraged to grow and excel.
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Testimonials Section - Using theme.css classes, loaded from admin */}
      <section className="testimonials-section section-padding" aria-labelledby="testimonials-heading">
        <Container>
          <Row className="justify-content-center text-center mb-4">
            <Col lg={8}>
              <h2 id="testimonials-heading" className="testimonials-title">What Parents Say About Kitale Progressive School</h2>
              <div className="testimonials-title-underline" style={{ background: 'linear-gradient(90deg, var(--gold), var(--navy))' }}></div>
              <p className="testimonials-subtitle">Hear from parents who have experienced the growth, care, and academic progress of their children at our school.</p>
            </Col>
          </Row>

          <Row className="justify-content-center">
            <Col lg={10}>
              <div className="testimonial-carousel">
                {isLoadingTestimonials ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status" style={{ width: '2rem', height: '2rem' }}>
                      <span className="visually-hidden">Loading testimonials...</span>
                    </div>
                  </div>
                ) : testimonials.length > 0 ? (
                  <div className="testimonial-card">
                    <div className="testimonial-quote-mark">"</div>
                    <div className="testimonial-content">
                      <Row className="align-items-center mb-3">
                        <Col xs="auto">
                          <div className="testimonial-avatar" style={{
                            width: '60px',
                            height: '60px',
                            borderRadius: '50%',
                            background: 'var(--gradient-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <div className="testimonial-avatar-initials" style={{
                              color: 'white',
                              fontWeight: '700',
                              fontSize: '1.2rem'
                            }}>
                              {currentTestimonial.name.split(' ').map(n => n[0]).join('')}
                            </div>
                          </div>
                        </Col>
                        <Col>
                          <h3 className="testimonial-name">{currentTestimonial.title || 'Mr.'} {currentTestimonial.name}</h3>
                          <p className="testimonial-parent-type">{currentTestimonial.parentType || 'Parent'}</p>
                          <p className="testimonial-section">{currentTestimonial.section || ''}</p>
                        </Col>
                      </Row>
                      <StarRating rating={currentTestimonial.rating || 5} />
                      <blockquote className="testimonial-quote">
                        "{currentTestimonial.quote}"
                      </blockquote>
                      <div className="testimonial-social-snapshot">
                        <span className="testimonial-shared-count">
                          <strong>{testimonials.length}+ parents</strong> shared similar experiences
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-5">
                    <p className="text-muted">No testimonials available yet.</p>
                  </div>
                )}
                
                {testimonials.length > 1 && (
                  <>
                    <button onClick={prevTestimonial} className="testimonial-prev" aria-label="Previous testimonial">‹</button>
                    <button onClick={nextTestimonial} className="testimonial-next" aria-label="Next testimonial">›</button>
                  </>
                )}
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Academic Pathway Section - Using theme.css classes */}
      <section className="academic-pathway-section section-padding" aria-labelledby="pathway-heading">
        <Container>
          <h2 id="pathway-heading" className="pathway-main-title text-center mb-5">Academic Pathway at KPS</h2>
          <h3 className="pathway-subtitle text-center">Are you seeking a school that gives your child a strong educational foundation?</h3>
          <p className="pathway-intro text-center">Our academic program provides a clear pathway for learners to grow step by step:</p>

          <Row className="g-5">
            {academicPathways.map((pathway, index) => (
              <Col md={4} key={index}>
                <div className="academic-card">
                  <div className="academic-image-container">
                    <ImageWithFallback
                      src={`/images/optimized/${pathway.image}.webp`}
                      alt={pathway.level}
                      width="100%"
                      height="160"
                      className="academic-card-image"
                    />
                  </div>
                  <div className="academic-card-body">
                    <h3 className="academic-card-title">{pathway.level}</h3>
                    <p className="academic-card-text">{pathway.summary}</p>
                    <button
                      onClick={() => handleLinkClick(`/academics/curriculum#${pathway.section}`)}
                      className="btn-navy"
                      aria-label={`Explore ${pathway.level}`}
                    >
                      {pathway.btnText}
                    </button>
                  </div>
                </div>
              </Col>
            ))}
          </Row>

          <p className="pathway-footer-note text-center mt-6">
            Each stage builds on the previous one, helping learners develop knowledge, discipline, and independent thinking that prepares them for future success.
          </p>
        </Container>
      </section>

      {/* CTA Section 1 - Using theme.css classes */}
      <section className="cta-section cta-primary" aria-label="Call to action">
        <Container>
          <div className="cta-content text-center">
            <h2 className="cta-title">Interested in enrolling your child at Kitale Progressive School?</h2>
            <div className="cta-buttons">
              <button onClick={() => handleLinkClick('/admissions/apply')} className="btn-navy" aria-label="Apply Now">Apply Now</button>
              <button onClick={scrollToContact} className="btn-navy" aria-label="Book A Tour">Book A Tour</button>
              <button onClick={() => handleLinkClick('/admissions/fee-structure')} className="btn-navy" aria-label="View Fees">View Fees</button>
            </div>
            <p className="cta-description mt-3">Our goal is to develop learners who are confident, capable, and prepared for the next stage of their education and life.</p>
          </div>
        </Container>
      </section>

      {/* Why Choose Us Section - Using theme.css classes */}
      <section className="why-choose-us-section section-padding" aria-labelledby="why-heading">
        <Container>
          <h2 id="why-heading" className="section-heading text-center mb-4">Why Parents Choose Kitale Progressive School</h2>
          <p className="why-choose-intro">Parents choose Kitale Progressive School because we combine strong academic excellence with a nurturing and supportive environment where every child is guided to discover their potential and grow in confidence.</p>
          <p className="why-choose-subintro mb-5">As a trusted CBE school in Kitale, we focus on developing not only academic skills, but also character, discipline, and leadership. Our goal is to build a school community where parents feel informed, involved, and confident in their child's learning journey.</p>
          <Row className="g-5 align-items-center" role="list" aria-label="Reasons to choose our school">
            {whyChooseUsItems.map((item, index) => (
              <Col md={6} lg={4} key={index} role="listitem">
                <Card className="card-custom h-100">
                  <Card.Body>
                    <div className="icon-wrapper"><span className="why-choose-icon" aria-hidden="true">{item.icon}</span></div>
                    <Card.Title as="h3" className="card-title-navy">{item.title}</Card.Title>
                    <Card.Text className="card-text-small">{item.description}</Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* CTA Section 2 - Using theme.css classes */}
      <section className="section-padding bg-light-custom">
        <Container>
          <Row className="justify-content-center">
            <Col lg={10}>
              <Card className="card-custom border-0 shadow-lg" style={{
                background: 'linear-gradient(135deg, #050265, #1a6bff)',
                color: 'white', borderRadius: '24px', overflow: 'hidden'
              }}>
                <Card.Body className="p-4 p-lg-5 text-center">
                  <h2 className="cta-title" style={{ color: 'white', marginBottom: '1rem' }}>
                    Ready to give your child a school environment where they will truly grow and succeed?
                  </h2>
                  <div className="d-flex gap-3 justify-content-center flex-wrap">
                    <button onClick={() => handleLinkClick('/admissions/apply')} className="btn-navy">Apply Now</button>
                    <button onClick={scrollToContact} className="btn-navy">Book A Tour</button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* YouTube Video Section - Using theme.css classes */}
      <section className="video-section section-padding" aria-labelledby="video-heading">
        <Container>
          <Row className="align-items-center g-5">
            <Col lg={6}>
              <h2 id="video-heading" className="video-section-title mb-4">
                Do you want your child to enjoy a balanced school experience —
                growing in confidence, building real friendships, and discovering their hidden talents?
              </h2>
              <p className="video-section-text mb-4">
                Education is more than textbooks and exams. At our school, children thrive through
                <strong> sports, creative arts, leadership roles, and team activities</strong> —
                all designed to build confidence and social skills.
                Every day, learners uncover new talents, form lasting friendships,
                and develop a deep sense of belonging.
              </p>
            </Col>
            <Col lg={6}>
              <p className="video-caption fst-italic text-secondary mb-3">
                Take a glimpse into daily school life — where learning, friendship, and discovery happen every day.
              </p>
              <div className="video-wrapper">
                <iframe
                  src="https://www.youtube-nocookie.com/embed/Vomydkvag_w"
                  title="School Life at Kitale Progressive School"
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </Col>
          </Row>
          <Row className="mt-5">
            <Col lg={12}>
              <h3 className="highlights-title text-center mb-4">School Life Highlights</h3>
              <Row className="g-5">
                <Col xs={6} md={3}>
                  <div className="highlight-block">
                    <span className="highlight-icon" aria-hidden="true">⚽</span>
                    <h4 className="highlight-label">Sports and Physical Development</h4>
                  </div>
                </Col>
                <Col xs={6} md={3}>
                  <div className="highlight-block">
                    <span className="highlight-icon" aria-hidden="true">🎨</span>
                    <h4 className="highlight-label">Clubs and Talent Development</h4>
                  </div>
                </Col>
                <Col xs={6} md={3}>
                  <div className="highlight-block">
                    <span className="highlight-icon" aria-hidden="true">🎉</span>
                    <h4 className="highlight-label">School Events and Celebrations</h4>
                  </div>
                </Col>
                <Col xs={6} md={3}>
                  <div className="highlight-block">
                    <span className="highlight-icon" aria-hidden="true">👥</span>
                    <h4 className="highlight-label">Student Leadership Opportunities</h4>
                  </div>
                </Col>
              </Row>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Learning Approach Section - Using theme.css classes */}
      <section className="learning-approach-section section-padding" aria-labelledby="approach-heading">
        <Container>
          <h2 id="approach-heading" className="section-heading text-center mb-4">
            Our Approach to Learning and Student Development
          </h2>
          <p className="approach-intro text-center">
            Learning at Kitale Progressive School encourages curiosity, critical thinking, creativity, and character development.
          </p>
          <p className="approach-subintro text-center mb-5">
            Our approach ensures that learning is not just about passing exams, but about developing skills that prepare learners for real life.
          </p>
          <Row className="g-5 justify-content-center" role="list" aria-label="Learning approaches">
            {learningApproaches.map((point, index) => (
              <Col md={6} lg={4} key={index} role="listitem">
                <Card className="approach-card h-100 border-0">
                  <Card.Body className="card-body p-4 p-lg-5">
                    <Card.Title as="h3" className="approach-card-title mb-3">
                      {point.title}
                    </Card.Title>
                    <Card.Text className="approach-card-text mb-0">
                      {point.description}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* CTA Section 3 - Using theme.css classes */}
      <section className="section-padding bg-light-custom">
        <Container>
          <Row className="justify-content-center">
            <Col lg={8}>
              <Card className="card-custom border-0 shadow-lg" style={{
                background: 'linear-gradient(135deg, #050265, #1a6bff)',
                color: 'white', borderRadius: '24px', overflow: 'hidden'
              }}>
                <Card.Body className="p-4 p-lg-5 text-center">
                  <h2 className="cta-title" style={{ color: 'white', marginBottom: '1rem' }}>
                    Ready to explore our complete academic curriculum?
                  </h2>
                  <button onClick={() => handleLinkClick('/academics/curriculum')} className="btn-navy">
                    Explore Full Curriculum
                  </button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Blog Section - Using theme.css classes */}
      <Suspense fallback={<SectionLoader />}>
        <BlogSection limit={3} showViewAll={true} variant="gold" />
      </Suspense>

      {/* Admissions CTA Section - Using theme.css classes */}
      <section className="section-padding bg-light-custom">
        <Container>
          <Row className="justify-content-center">
            <Col lg={10}>
              <Card className="card-custom border-0 shadow-lg" style={{
                background: 'linear-gradient(135deg, #050265, #1a6bff)',
                color: 'white', borderRadius: '24px', overflow: 'hidden'
              }}>
                <Card.Body className="p-4 p-lg-5 text-center">
                  <h2 className="admissions-cta-title" style={{ color: 'white', marginBottom: '1rem' }}>
                    Are you ready to give your child the best start in their educational journey?
                  </h2>
                  <p className="admissions-cta-text" style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '1rem' }}>
                    We welcome families seeking a supportive and inspiring learning environment.
                  </p>
                  <div className="d-flex gap-3 justify-content-center flex-wrap">
                    <button onClick={() => handleLinkClick('/admissions/apply')} className="btn-navy">Apply Now</button>
                    <button onClick={scrollToContact} className="btn-navy">Contact Us</button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Get In Touch Section - Using theme.css classes */}
      <div id="contactus-wrapper" ref={contactFormRef}>
        <Suspense fallback={<SectionLoader />}>
          <GetInTouch />
        </Suspense>
      </div>
    </>
  );
}

export default Home;