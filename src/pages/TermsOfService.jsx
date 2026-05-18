import { Helmet } from "react-helmet-async";
import { Container, Row, Col } from "react-bootstrap";
import { lazy, Suspense, memo } from "react";
import { Link } from "react-router-dom";

// Lazy load non-critical components
const GetInTouch = lazy(() => import("../components/GetInTouch"));

function TermsOfService() {
  return (
    <>
      <Helmet>
        <title>Terms of Service | Kitale Progressive School</title>
        <meta 
          name="description" 
          content="Terms of Service for Kitale Progressive School. Please read these terms carefully before using our website and services." 
        />
      </Helmet>

      {/* Page Header with proper heading hierarchy */}
      <section 
        style={{
          background: 'linear-gradient(135deg, #132f66 0%, #0a1f4d 100%)',
          color: 'white',
          paddingTop: '120px',
          paddingBottom: '40px',
          textAlign: 'center',
          width: '100%'
        }}
        aria-labelledby="page-title"
      >
        <Container>
          <h1 id="page-title" style={{
            fontSize: 'clamp(2rem, 5vw, 2.5rem)',
            fontWeight: 'bold',
            marginBottom: '0.5rem',
            color: 'white'
          }}>
            Terms of Service
          </h1>
          <p style={{
            fontSize: 'clamp(1rem, 4vw, 1.1rem)',
            maxWidth: '700px',
            margin: '0 auto',
            color: 'rgba(255,255,255,0.95)'
          }}>
            Please read these terms carefully before using our website
          </p>
        </Container>
      </section>

      {/* Main Content */}
      <section style={{ padding: '3rem 0', backgroundColor: 'white' }} aria-labelledby="terms-content-heading">
        <Container>
          <Row className="justify-content-center">
            <Col lg={10}>
              <div style={{
                maxWidth: '800px',
                margin: '0 auto'
              }}>
                <h2 id="terms-content-heading" className="visually-hidden">Terms of Service Content</h2>
                
                {/* Last Updated */}
                <div 
                  style={{
                    backgroundColor: '#f8fafc',
                    padding: '1rem 1.5rem',
                    borderRadius: '8px',
                    marginBottom: '2rem',
                    border: '1px solid #e9ecef'
                  }}
                  role="status"
                  aria-live="polite"
                >
                  <p style={{ margin: 0, color: '#132f66', fontWeight: '500' }}>
                    <i className="fas fa-calendar-alt me-2" style={{ color: '#cebd04' }} aria-hidden="true"></i>
                    <span>Last Updated: March 2026</span>
                  </p>
                </div>

                {/* Terms Sections */}
                <section aria-labelledby="section1-heading" style={{ marginBottom: '2rem' }}>
                  <h3 id="section1-heading" style={{
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    color: '#132f66',
                    marginBottom: '0.75rem',
                    marginTop: '1.5rem'
                  }}>
                    1. Acceptance of Terms
                  </h3>
                  <p style={{
                    fontSize: '0.95rem',
                    lineHeight: '1.6',
                    color: '#4a5568',
                    marginBottom: '1rem'
                  }}>
                    By accessing or using the Kitale Progressive School website, you agree to be bound by these Terms of Service. 
                    If you disagree with any part of the terms, you may not access our services.
                  </p>
                </section>

                <section aria-labelledby="section2-heading" style={{ marginBottom: '2rem' }}>
                  <h3 id="section2-heading" style={{
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    color: '#132f66',
                    marginBottom: '0.75rem',
                    marginTop: '1.5rem'
                  }}>
                    2. Description of Services
                  </h3>
                  <p style={{
                    fontSize: '0.95rem',
                    lineHeight: '1.6',
                    color: '#4a5568',
                    marginBottom: '0.5rem'
                  }}>
                    Kitale Progressive School provides:
                  </p>
                  <ul style={{
                    paddingLeft: '1.5rem',
                    marginBottom: '1rem'
                  }}>
                    <li style={{ fontSize: '0.95rem', lineHeight: '1.6', color: '#4a5568', marginBottom: '0.3rem' }}>School information and resources</li>
                    <li style={{ fontSize: '0.95rem', lineHeight: '1.6', color: '#4a5568', marginBottom: '0.3rem' }}>Online admission applications</li>
                    <li style={{ fontSize: '0.95rem', lineHeight: '1.6', color: '#4a5568', marginBottom: '0.3rem' }}>Sponsorship and donation forms</li>
                    <li style={{ fontSize: '0.95rem', lineHeight: '1.6', color: '#4a5568', marginBottom: '0.3rem' }}>Contact and inquiry forms</li>
                    <li style={{ fontSize: '0.95rem', lineHeight: '1.6', color: '#4a5568', marginBottom: '0.3rem' }}>News and events information</li>
                  </ul>
                </section>

                <section aria-labelledby="section3-heading" style={{ marginBottom: '2rem' }}>
                  <h3 id="section3-heading" style={{
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    color: '#132f66',
                    marginBottom: '0.75rem',
                    marginTop: '1.5rem'
                  }}>
                    3. User Accounts and Authentication
                  </h3>
                  <p style={{
                    fontSize: '0.95rem',
                    lineHeight: '1.6',
                    color: '#4a5568',
                    marginBottom: '0.5rem'
                  }}>
                    When you use Google sign-in to submit forms:
                  </p>
                  <ul style={{
                    paddingLeft: '1.5rem',
                    marginBottom: '1rem'
                  }}>
                    <li style={{ fontSize: '0.95rem', lineHeight: '1.6', color: '#4a5568', marginBottom: '0.3rem' }}>You must have a valid Google account</li>
                    <li style={{ fontSize: '0.95rem', lineHeight: '1.6', color: '#4a5568', marginBottom: '0.3rem' }}>You are responsible for maintaining the security of your account</li>
                    <li style={{ fontSize: '0.95rem', lineHeight: '1.6', color: '#4a5568', marginBottom: '0.3rem' }}>You consent to Google's authentication process</li>
                    <li style={{ fontSize: '0.95rem', lineHeight: '1.6', color: '#4a5568', marginBottom: '0.3rem' }}>We only request permissions necessary for form submission</li>
                  </ul>
                </section>

                <section aria-labelledby="section4-heading" style={{ marginBottom: '2rem' }}>
                  <h3 id="section4-heading" style={{
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    color: '#132f66',
                    marginBottom: '0.75rem',
                    marginTop: '1.5rem'
                  }}>
                    4. User Obligations
                  </h3>
                  <p style={{
                    fontSize: '0.95rem',
                    lineHeight: '1.6',
                    color: '#4a5568',
                    marginBottom: '0.5rem'
                  }}>
                    You agree to:
                  </p>
                  <ul style={{
                    paddingLeft: '1.5rem',
                    marginBottom: '1rem'
                  }}>
                    <li style={{ fontSize: '0.95rem', lineHeight: '1.6', color: '#4a5568', marginBottom: '0.3rem' }}>Provide accurate and complete information</li>
                    <li style={{ fontSize: '0.95rem', lineHeight: '1.6', color: '#4a5568', marginBottom: '0.3rem' }}>Keep your information updated</li>
                    <li style={{ fontSize: '0.95rem', lineHeight: '1.6', color: '#4a5568', marginBottom: '0.3rem' }}>Not impersonate any person or entity</li>
                    <li style={{ fontSize: '0.95rem', lineHeight: '1.6', color: '#4a5568', marginBottom: '0.3rem' }}>Not use the service for any illegal purpose</li>
                    <li style={{ fontSize: '0.95rem', lineHeight: '1.6', color: '#4a5568', marginBottom: '0.3rem' }}>Not attempt to gain unauthorized access to our systems</li>
                  </ul>
                </section>

                <section aria-labelledby="section5-heading" style={{ marginBottom: '2rem' }}>
                  <h3 id="section5-heading" style={{
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    color: '#132f66',
                    marginBottom: '0.75rem',
                    marginTop: '1.5rem'
                  }}>
                    5. Admission Applications
                  </h3>
                  <p style={{
                    fontSize: '0.95rem',
                    lineHeight: '1.6',
                    color: '#4a5568',
                    marginBottom: '0.5rem'
                  }}>
                    By submitting an admission application:
                  </p>
                  <ul style={{
                    paddingLeft: '1.5rem',
                    marginBottom: '1rem'
                  }}>
                    <li style={{ fontSize: '0.95rem', lineHeight: '1.6', color: '#4a5568', marginBottom: '0.3rem' }}>You confirm all information provided is accurate</li>
                    <li style={{ fontSize: '0.95rem', lineHeight: '1.6', color: '#4a5568', marginBottom: '0.3rem' }}>You consent to the school processing your application</li>
                    <li style={{ fontSize: '0.95rem', lineHeight: '1.6', color: '#4a5568', marginBottom: '0.3rem' }}>You understand that submission does not guarantee admission</li>
                    <li style={{ fontSize: '0.95rem', lineHeight: '1.6', color: '#4a5568', marginBottom: '0.3rem' }}>You agree to be contacted regarding your application</li>
                  </ul>
                </section>

                <section aria-labelledby="section6-heading" style={{ marginBottom: '2rem' }}>
                  <h3 id="section6-heading" style={{
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    color: '#132f66',
                    marginBottom: '0.75rem',
                    marginTop: '1.5rem'
                  }}>
                    6. Sponsorships and Donations
                  </h3>
                  <p style={{
                    fontSize: '0.95rem',
                    lineHeight: '1.6',
                    color: '#4a5568',
                    marginBottom: '0.5rem'
                  }}>
                    When making sponsorship or donation inquiries:
                  </p>
                  <ul style={{
                    paddingLeft: '1.5rem',
                    marginBottom: '1rem'
                  }}>
                    <li style={{ fontSize: '0.95rem', lineHeight: '1.6', color: '#4a5568', marginBottom: '0.3rem' }}>You consent to follow-up communications</li>
                    <li style={{ fontSize: '0.95rem', lineHeight: '1.6', color: '#4a5568', marginBottom: '0.3rem' }}>All financial transactions are handled separately</li>
                    <li style={{ fontSize: '0.95rem', lineHeight: '1.6', color: '#4a5568', marginBottom: '0.3rem' }}>We do not process payments through this website</li>
                  </ul>
                </section>

                <section aria-labelledby="section7-heading" style={{ marginBottom: '2rem' }}>
                  <h3 id="section7-heading" style={{
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    color: '#132f66',
                    marginBottom: '0.75rem',
                    marginTop: '1.5rem'
                  }}>
                    7. Intellectual Property
                  </h3>
                  <p style={{
                    fontSize: '0.95rem',
                    lineHeight: '1.6',
                    color: '#4a5568',
                    marginBottom: '1rem'
                  }}>
                    All content on this website, including text, graphics, logos, and images, is the property of 
                    Kitale Progressive School and is protected by copyright laws.
                  </p>
                </section>

                <section aria-labelledby="section8-heading" style={{ marginBottom: '2rem' }}>
                  <h3 id="section8-heading" style={{
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    color: '#132f66',
                    marginBottom: '0.75rem',
                    marginTop: '1.5rem'
                  }}>
                    8. Limitation of Liability
                  </h3>
                  <p style={{
                    fontSize: '0.95rem',
                    lineHeight: '1.6',
                    color: '#4a5568',
                    marginBottom: '1rem'
                  }}>
                    Kitale Progressive School shall not be liable for any indirect, incidental, special, consequential, 
                    or punitive damages resulting from your use or inability to use our services.
                  </p>
                </section>

                <section aria-labelledby="section9-heading" style={{ marginBottom: '2rem' }}>
                  <h3 id="section9-heading" style={{
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    color: '#132f66',
                    marginBottom: '0.75rem',
                    marginTop: '1.5rem'
                  }}>
                    9. Modifications to Terms
                  </h3>
                  <p style={{
                    fontSize: '0.95rem',
                    lineHeight: '1.6',
                    color: '#4a5568',
                    marginBottom: '1rem'
                  }}>
                    We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting to the website.
                  </p>
                </section>

                <section aria-labelledby="section10-heading" style={{ marginBottom: '2rem' }}>
                  <h3 id="section10-heading" style={{
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    color: '#132f66',
                    marginBottom: '0.75rem',
                    marginTop: '1.5rem'
                  }}>
                    10. Governing Law
                  </h3>
                  <p style={{
                    fontSize: '0.95rem',
                    lineHeight: '1.6',
                    color: '#4a5568',
                    marginBottom: '1rem'
                  }}>
                    These terms shall be governed by the laws of Kenya, without regard to its conflict of law provisions.
                  </p>
                </section>

                <section aria-labelledby="section11-heading" style={{ marginBottom: '2rem' }}>
                  <h3 id="section11-heading" style={{
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    color: '#132f66',
                    marginBottom: '0.75rem',
                    marginTop: '1.5rem'
                  }}>
                    11. Contact Information
                  </h3>
                  <p style={{
                    fontSize: '0.95rem',
                    lineHeight: '1.6',
                    color: '#4a5568',
                    marginBottom: '0.5rem'
                  }}>
                    For questions about these Terms of Service, please contact us at:
                  </p>
                  <address style={{
                    backgroundColor: '#f8fafc',
                    padding: '1.5rem',
                    borderRadius: '8px',
                    border: '1px solid #e9ecef',
                    fontStyle: 'normal'
                  }}>
                    <p style={{ marginBottom: '0.3rem' }}>
                      <strong style={{ color: '#132f66' }}>Email:</strong>{' '}
                      <a 
                        href="mailto:progressivesch@gmail.com" 
                        style={{ color: '#132f66', textDecoration: 'none' }}
                        aria-label="Send email to progressivesch@gmail.com"
                      >
                        progressivesch@gmail.com
                      </a>
                    </p>
                    <p style={{ marginBottom: '0.3rem' }}>
                      <strong style={{ color: '#132f66' }}>Phone:</strong>{' '}
                      <a 
                        href="tel:+254722631433" 
                        style={{ color: '#132f66', textDecoration: 'none' }}
                        aria-label="Call +254 722 631 433"
                      >
                        +254 722 631 433
                      </a>
                    </p>
                    <p style={{ marginBottom: 0 }}>
                      <strong style={{ color: '#132f66' }}>Address:</strong> Kitale - Kapenguria Road, Kitale, Kenya
                    </p>
                  </address>
                </section>

                {/* Back to Home Link */}
                <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                  <Link
                    to="/"
                    style={{
                      display: 'inline-block',
                      backgroundColor: '#132f66',
                      color: 'white',
                      padding: '0.5rem 2rem',
                      borderRadius: '40px',
                      textDecoration: 'none',
                      fontSize: '0.9rem',
                      fontWeight: '500',
                      transition: 'all 0.3s ease',
                      minHeight: '44px',
                      minWidth: '44px'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#0a1f4d';
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 4px 12px rgba(19,47,102,0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#132f66';
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = 'none';
                    }}
                    aria-label="Return to home page"
                  >
                    <i className="fas fa-arrow-left me-2" aria-hidden="true"></i>
                    Back to Home
                  </Link>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      <Suspense fallback={null}>
        <GetInTouch />
      </Suspense>

      {/* Critical CSS inline with accessibility improvements */}
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
        a:focus-visible,
        button:focus-visible {
          outline: 3px solid #cebd04;
          outline-offset: 2px;
        }
        address {
          font-style: normal;
        }
        @media (max-width: 768px) {
          .terms-content h5 {
            font-size: 1rem;
          }
          .terms-content p, .terms-content li {
            font-size: 0.9rem;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          a {
            transition: none !important;
          }
          a:hover {
            transform: none !important;
          }
        }
      `}} />
    </>
  );
}

export default memo(TermsOfService);