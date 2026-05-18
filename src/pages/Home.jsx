// pages/Home.jsx - Fully Optimized with Proper Heading Hierarchy
import { Helmet } from "react-helmet-async";
import { Carousel, Container, Row, Col, Card } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import React, { useEffect, lazy, Suspense, useCallback, useMemo, useState, useRef } from 'react';
import BlogSection from '../components/BlogSection';

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

// Star Rating Component
const StarRating = ({ rating }) => {
  return (
    <div className="star-rating">
      {[...Array(5)].map((_, i) => (
        <span key={i} className={`star ${i < rating ? 'star-filled' : 'star-empty'}`}>★</span>
      ))}
    </div>
  );
};

// Optimized count-up hook
const useCountUp = (end, duration = 2000) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef(null);
  const rafRef = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (observerRef.current) observerRef.current.disconnect();
        }
      },
      { threshold: 0.3, rootMargin: '50px' }
    );

    if (elementRef.current) observerRef.current.observe(elementRef.current);

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    
    let startTime;
    let lastProgress = 0;
    
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      if (Math.abs(progress - lastProgress) > 0.01 || progress === 1) {
        setCount(Math.floor(progress * end));
        lastProgress = progress;
      }
      
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };
    
    rafRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isVisible, end, duration]);

  return { count, elementRef };
};

// Stat Component
const StatItem = ({ value, label, suffix = "" }) => {
  const { count, elementRef } = useCountUp(value);
  
  return (
    <Col md={3} sm={6} className="mb-4">
      <div ref={elementRef} className="stat-item-card">
        <h3 className="stat-number">{count}{suffix}</h3>
        <p className="stat-label">{label}</p>
        <span className="visually-hidden">{count}{suffix} {label}</span>
      </div>
    </Col>
  );
};

// Main Home Component
function Home() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  
  useEffect(() => {
    if (location.hash === '#contact-section') {
      const contactSection = document.getElementById('contact-section');
      if (contactSection) {
        requestAnimationFrame(() => {
          contactSection.scrollIntoView({ behavior: 'smooth' });
          contactSection.setAttribute('tabindex', '-1');
          contactSection.focus({ preventScroll: true });
        });
      }
    } else if (location.hash === '') {
      requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }
  }, [location]);

  const handleLinkClick = useCallback((path) => {
    navigate(path);
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }, [navigate]);

  const goToSlide = (index) => setActiveIndex(index);
  const nextSlide = () => setActiveIndex((current) => (current + 1) % testimonials.length);
  const prevSlide = () => setActiveIndex((current) => (current - 1 + testimonials.length) % testimonials.length);

  const testimonials = useMemo(() => [
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
  ], []);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

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
    { level: "Primary", summary: "Our primary program strengthens literacy, numeracy, and critical thinking while encouraging creativity and independent learning.", image: "computer1", section: "primary-section", btnText: "Explore Primary" },
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

  const carouselImages = useMemo(() => [
    { webp: "/images/optimized/gate3.webp", jpg: "/images/optimized/gate3.jpg", alt: "Kitale Progressive School Main Gate" },
    { webp: "/images/optimized/slide2.webp", jpg: "/images/optimized/slide2.jpg", alt: "School Activities" },
    { webp: "/images/optimized/gate.webp", jpg: "/images/optimized/gate.jpg", alt: "Campus" },
    { webp: "/images/optimized/classroom2.webp", jpg: "/images/optimized/classroom2.jpg", alt: "Classroom" }
  ], []);

  return (
    <>
      <Helmet>
        <title>Home | Kitale Progressive School</title>
        <meta name="description" content="Kitale Progressive School - Excellence in Education, Holistic Development and Safe Boarding Environment since 2004." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </Helmet>

      {/* HERO CAROUSEL */}
      <section className="hero-carousel-section" aria-label="Hero carousel showcasing school facilities">
        <Carousel   
          fade 
          interval={5000}
          controls={false}
          pause={false}
          wrap={true}
          indicators={false}
          className="hero-carousel"
        >
          {carouselImages.map((item, index) => (
            <Carousel.Item key={index}>
              <div className="carousel-image-wrapper">
                <picture>
                  <source srcSet={item.webp} type="image/webp" />
                  <img 
                    className="d-block w-100 h-100 carousel-zoom" 
                    src={item.jpg}
                    srcSet={`${item.jpg} 1x, ${item.webp} 2x`}
                    alt={item.alt}
                    loading={index === 0 ? "eager" : "lazy"}
                    fetchpriority={index === 0 ? "high" : "auto"}
                    width="1920"
                    height="1080"
                    decoding="async"
                    style={{ 
                      objectFit: 'cover', 
                      width: '100%', 
                      height: '100%',
                      position: 'absolute',
                      top: 0,
                      left: 0
                    }}
                  />
                </picture>
              </div>
            </Carousel.Item>
          ))}
        </Carousel>
        
        <div className="carousel-overlay-simple" aria-label="School welcome message">
          <div className="overlay-content">
            <div className="welcome-header-simple">
              <h1 className="welcome-title-simple">Give Your Child the Foundation to Lead</h1>
              <p className="welcome-subtitle-simple">Excellence in CBE education, grounded in Christian values and the warmth of the Kenyan spirit. A safe haven where curiosity thrives.</p>
            </div>
            <div className="overlay-buttons">
              <button onClick={() => handleLinkClick('/admissions/apply')} className="btn-overlay-primary" aria-label="Apply for Admissions">
                Apply for Admissions
              </button>
              <button onClick={() => handleLinkClick('/academics/curriculum')} className="btn-overlay-primary" aria-label="Explore our Programs">
                Explore our Programs
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section className="about-section section-padding" aria-labelledby="about-heading">
        <Container>
          <Row className="align-items-center g-5">
            <Col lg={6} className="order-2 order-lg-1">
              <picture>
                <source srcSet="/images/optimized/gate1.webp" type="image/webp" />
                <img src="/images/optimized/gate1.jpg" alt="Kitale Progressive School Campus" className="img-fluid rounded w-100" loading="lazy" width="600" height="400" decoding="async" />
              </picture>
            </Col>
            <Col lg={6} className="order-1 order-lg-2">
              <h2 id="about-heading" className="section-heading-left mb-4">Are you looking for a school where your child will be known, nurtured, and inspired to succeed?</h2>
              <p className="about-text" style={{lineHeight:'1.8'}}>At Kitale Progressive School, we believe every child carries unique potential. Our learning environment is designed to nurture curiosity, strengthen character, and build a strong academic foundation that prepares learners for the future.</p>
              <p className="about-text" style={{lineHeight:'1.8'}}>As a trusted private school in Kitale, on the north-rift of Kenya, we serve families seeking quality CBE education from Early Childhood Development to Junior Secondary, providing a safe and nurturing environment where every learner is supported to succeed.</p>
            </Col>
          </Row>
        </Container>
      </section>

      {/* STATISTICS SECTION */}
      <section className="statistics-section" aria-labelledby="stats-heading">
        <Container>
          <h2 id="stats-heading" className="visually-hidden">School Statistics</h2>
          <Row className="justify-content-center">
            <Col lg={10} className="text-center">
              <h3 className="stats-intro-title">Are you looking for a reputable and established school where your child will thrive?</h3>
              <div className="stats-title-underline"></div>
            </Col>
          </Row>
          <Row className="justify-content-center g-5">
            {stats.map((stat, index) => (
              <StatItem key={index} value={stat.value} label={stat.label} suffix={stat.suffix} />
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

      {/* TESTIMONIALS SECTION */}
      <section className="testimonials-section" aria-labelledby="testimonials-heading">
        <Container>
          <Row className="justify-content-center text-center mb-4">
            <Col lg={8}>
              <h2 id="testimonials-heading" className="testimonials-title">What Parents Say About Kitale Progressive School</h2>
              <div className="testimonials-title-underline"></div>
              <p className="testimonials-subtitle">Hear from parents who have experienced the growth, care, and academic progress of their children at our school.</p>
            </Col>
          </Row>

          <Row className="justify-content-center">
            <Col lg={10}>
              <div className="testimonial-carousel">
                <div className="testimonial-card">
                  <div className="testimonial-quote-mark">"</div>
                  <div className="testimonial-content">
                    <Row className="align-items-center mb-3">
                      <Col xs="auto">
                        <div className="testimonial-avatar">
                          {testimonials[activeIndex].image ? (
                            <ImageWithFallback 
                              src={testimonials[activeIndex].image}
                              alt={testimonials[activeIndex].name}
                              width={60}
                              height={60}
                              className="testimonial-avatar-img"
                            />
                          ) : (
                            <div className="testimonial-avatar-initials" style={{
                              width: '60px',
                              height: '60px',
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, #0a0a2a, #050515)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontSize: '1.2rem',
                              fontWeight: 'bold'
                            }}>
                              {testimonials[activeIndex].name.split(' ').map(n => n[0]).join('')}
                            </div>
                          )}
                        </div>
                      </Col>
                      <Col>
                        <h3 className="testimonial-name">{testimonials[activeIndex].title} {testimonials[activeIndex].name}</h3>
                        <p className="testimonial-parent-type">{testimonials[activeIndex].parentType}</p>
                        <p className="testimonial-section">{testimonials[activeIndex].section}</p>
                      </Col>
                    </Row>
                    <StarRating rating={testimonials[activeIndex].rating} />
                    <blockquote className="testimonial-quote">
                      "{testimonials[activeIndex].quote}"
                    </blockquote>
                    <div className="testimonial-social-snapshot">
                      <div className="testimonial-avatars">
                        {[1,2,3].map((_, i) => (
                          <div key={i} className="testimonial-avatar-stack">
                            {i === 2 ? '+12' : ''}
                          </div>
                        ))}
                      </div>
                      <span className="testimonial-shared-count"><strong>15+ parents</strong> shared similar experiences</span>
                    </div>
                  </div>
                </div>

                <button onClick={prevSlide} className="testimonial-prev" aria-label="Previous testimonial">‹</button>
                <button onClick={nextSlide} className="testimonial-next" aria-label="Next testimonial">›</button>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* ACADEMIC PATHWAY SECTION */}
      <section className="academic-pathway-section" aria-labelledby="pathway-heading">
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
                    <button onClick={() => handleLinkClick(`/academics/curriculum#${pathway.section}`)} className="btn-navy btn-lg" aria-label={`Explore ${pathway.level}`}>
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

      {/* CTA SECTION 1 */}
      <section className="cta-section cta-primary" aria-label="Call to action">
        <Container>
          <div className="cta-content text-center">
            <h2 className="cta-title">Interested in enrolling your child at Kitale Progressive School?</h2>
            <div className="cta-buttons">
              <button onClick={() => handleLinkClick('/admissions/apply')} className="btn-navy" aria-label="Apply Now">Apply Now</button>
              <button onClick={() => handleLinkClick('/contact')} className="btn-navy" aria-label="Book A Tour">Book A Tour</button>
              <button onClick={() => handleLinkClick('/admissions/fee-structure')} className="btn-navy" aria-label="View Fees">View Fees</button>
            </div>
            <p className="cta-description mt-3">Our goal is to develop learners who are confident, capable, and prepared for the next stage of their education and life.</p>
          </div>
        </Container>
      </section>

      {/* WHY CHOOSE US SECTION */}
      <section className="why-choose-us-section" aria-labelledby="why-heading">
        <Container>
          <h2 id="why-heading" className="section-heading text-center mb-4">Why Parents Choose Kitale Progressive School</h2>
          <p className="why-choose-intro text-center">Parents choose Kitale Progressive School because we combine strong academic excellence with a nurturing and supportive environment where every child is guided to discover their potential and grow in confidence.</p>
          <p className="why-choose-subintro text-center mb-5">As a trusted CBE school in Kitale, we focus on developing not only academic skills, but also character, discipline, and leadership. Our goal is to build a school community where parents feel informed, involved, and confident in their child's learning journey.</p>
          <Row className="g-5" role="list" aria-label="Reasons to choose our school">
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

      {/* CTA SECTION 2 - Card Style */}
      <section className="py-5" style={{ background: '#f8f9fa' }}>
        <Container>
          <Row className="justify-content-center">
            <Col lg={10}>
              <Card className="card-custom border-0 shadow-lg" style={{
                background: 'linear-gradient(135deg, #050265, #1a6bff)',
                color: 'white',
                borderRadius: '24px',
                overflow: 'hidden'
              }}>
                <Card.Body className="p-4 p-lg-5 text-center">
                  <div className="cta-content">
                    <h2 className="cta-title" style={{ color: 'white', marginBottom: '1rem', fontSize: '1.3rem' }}>
                      Ready to give your child a school environment where they will truly grow and succeed?
                    </h2>
                    <div className="cta-buttons d-flex gap-3 justify-content-center flex-wrap">
                      <button 
                        onClick={() => handleLinkClick('/admissions/apply')} 
                        className="btn-navy"
                        style={{
                          minHeight: '44px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'white',
                          border: 'none',
                          color: '#050265',
                          padding: '12px 32px',
                          borderRadius: '50px',
                          fontWeight: '600'
                        }}
                        aria-label="Apply Now"
                      >
                        Apply Now
                      </button>
                      <button 
                        onClick={() => handleLinkClick('/contact')} 
                        className="btn-navy"
                        style={{
                          minHeight: '44px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'white',
                          border: 'none',
                          color: '#050265',
                          padding: '12px 32px',
                          borderRadius: '50px',
                          fontWeight: '600'
                        }}
                        aria-label="Book A Tour"
                      >
                        Book A Tour
                      </button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>
      
      {/* YOUTUBE VIDEO SECTION */}
        <section className="video-section" aria-labelledby="video-heading">
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

      {/* OUR LEARNING APPROACH SECTION */}
      <section className="learning-approach-section" aria-labelledby="approach-heading">
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
                <Card className="approach-card h-100 border-0 shadow-sm">
                  <Card.Body className="text-center p-4">
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
      
      {/* CTA SECTION 3 - Curriculum */}
      <section className="py-5" style={{ background: '#f8f9fa' }}>
        <Container>
          <Row className="justify-content-center">
            <Col lg={8}>
              <Card className="card-custom border-0 shadow-lg" style={{
                background: 'linear-gradient(135deg, #050265, #1a6bff)',
                color: 'white',
                borderRadius: '24px',
                overflow: 'hidden'
              }}>
                <Card.Body className="p-4 p-lg-5 text-center">
                  <div className="cta-content">
                    <h2 className="cta-title" style={{ color: 'white', marginBottom: '1rem', fontSize: '1.3rem' }}>
                      Ready to explore our complete academic curriculum?
                    </h2>
                    <div className="cta-buttons">
                      <button 
                        onClick={() => handleLinkClick('/academics/curriculum')} 
                        className="btn-navy"
                        style={{
                          minHeight: '44px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'white',
                          border: 'none',
                          color: '#050265',
                          padding: '12px 32px',
                          borderRadius: '50px',
                          fontWeight: '600'
                        }}
                        aria-label="Explore Full Curriculum"
                      >
                        Explore Full Curriculum
                      </button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Blog Section */}
      <Suspense fallback={<SectionLoader />}>
        <BlogSection limit={3} showViewAll={true} variant="navy" />
      </Suspense>

      {/* ADMISSIONS CTA SECTION */}
      <section className="py-5" style={{ background: '#f8f9fa' }}>
        <Container>
          <Row className="justify-content-center">
            <Col lg={10}>
              <Card className="card-custom border-0 shadow-lg" style={{
                background: 'linear-gradient(135deg, #050265, #1a6bff)',
                color: 'white',
                borderRadius: '24px',
                overflow: 'hidden'
              }}>
                <Card.Body className="p-4 p-lg-5 text-center">
                  <div className="admissions-cta-content">
                    <h2 className="admissions-cta-title" style={{ color: 'white', marginBottom: '1rem' }}>
                      Are you ready to give your child the best start in their educational journey?
                    </h2>
                    <p className="admissions-cta-text" style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '1rem' }}>
                      We welcome families seeking a supportive and inspiring learning environment. Start the admissions process today or schedule a visit to experience our school community.
                    </p>
                    <p className="admissions-cta-quote fst-italic" style={{ color: 'rgba(255,255,255,0.85)', marginBottom: '1.5rem' }}>
                      "Our admissions team will guide you through every step of the enrollment process."
                    </p>
                    <div className="admissions-cta-buttons d-flex gap-3 justify-content-center flex-wrap">
                      <button 
                        onClick={() => handleLinkClick('/admissions/apply')} 
                        className="btn-navy"
                        style={{
                          minHeight: '44px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'white',
                          border: 'none',
                          color: '#050265',
                          padding: '12px 32px',
                          borderRadius: '50px',
                          fontWeight: '600'
                        }}
                        aria-label="Apply Now"
                      >
                        Apply Now
                      </button>
                      <button 
                        onClick={() => handleLinkClick('/contact')} 
                        className="btn-navy"
                        style={{
                          minHeight: '44px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'white',
                          border: 'none',
                          color: '#050265',
                          padding: '12px 32px',
                          borderRadius: '50px',
                          fontWeight: '600'
                        }}
                        aria-label="Contact Us"
                      >
                        Contact Us
                      </button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* GET IN TOUCH SECTION */}
      <Suspense fallback={<SectionLoader />}>
        <GetInTouch />
      </Suspense>

      {/* Critical inline styles for animations only */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes zoomOut{0%{transform:scale(1.2)}100%{transform:scale(1)}}
        .carousel-zoom{animation:zoomOut 8s ease forwards}
        @media (max-width:768px){.carousel-zoom{animation:zoomOut 6s ease forwards}}
        @media (prefers-reduced-motion:reduce){.carousel-zoom{animation:none!important}}
        .hero-carousel .carousel-indicators,
        .carousel-indicators { display: none !important; }
      `}} />
    </>
  );
}

export default Home;