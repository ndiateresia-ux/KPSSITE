import { Container, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { memo, useCallback } from "react";
import "./Footer.css";

function Footer() {
  const navigate = useNavigate();

  const handleLinkClick = useCallback((path) => {
    navigate(path);
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, [navigate]);

  // Social media links data
  const socialLinks = [
    { icon: "bi-facebook", url: "https://www.facebook.com/kitaleprogressive/", label: "Facebook" },
    { icon: "bi-instagram", url: "https://www.instagram.com/kitaleprogrsv1338/", label: "Instagram" },
    { icon: "bi-youtube", url: "https://www.youtube.com/@KPSConnect", label: "YouTube" },
    { icon: "bi-tiktok", url: "https://www.tiktok.com/@kitale.progressive", label: "TikTok" },
    { icon: "bi-whatsapp", url: "https://wa.me/254780841116", label: "WhatsApp" }
  ];

  return (
    
    <footer className="footer" role="contentinfo" aria-label="Site footer">
        {/* Text above the map */}
        <div className="footer-map-header">
          <div className="footer-map-title">Visit Us In Kitale</div>
          <div className="footer-map-subtitle">Easily accessible along Kitale–Kapenguria Road</div>
        </div>
      {/* Map Section - Full width on top */}
      <div className="footer-map-section">
        
        {/* Map iframe */}
        <div className="footer-map-container">
          <iframe 
            className="footer-map-iframe"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.1549118880284!2d34.995235373490296!3d1.0448587624833654!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x178226623113cbbd%3A0x9bc6b39a5f193f4a!2sKitale%20Progressive%20School%3A%20Top%20Private%20Christian%20School%20in%20Trans%20Nzoia%3A!5e0!3m2!1sen!2ske!4v1777746404738!5m2!1sen!2ske"
                style={{ 
              border: 0, 
              width: '100%', 
              height: '200px',
              display: 'block'
            }} 
            allowFullScreen 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            title="School Location Map"
            aria-label="Google Map showing school location"
          ></iframe>
        </div>
      </div>
      
      {/* MAIN FOOTER CONTENT - 3 COLUMNS */}
      <Container fluid className="footer-content py-4">
        <Row className="g-5">
          {/* Column 1: Description + Contact + Social */}
          <Col lg={5} md={6} className="mb-4">
            {/* Description */}
            <div className="mb-4">
              <h5 className="footer-title">Kitale Progressive School</h5>
              <p className="small" >
                Molding character, Inspiring excellence.
              </p>
            </div>

             {/* Social Links */}
           <div className="mb-3">
              <h5 className="footer-title">Connect With Us</h5>
              <div className="social-icons">
                {socialLinks.map((social, index) => (
                  <a 
                    key={index}
                    href={social.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="social-icon"
                    aria-label={`Visit our ${social.label} page`}
                  >
                    <i className={`bi ${social.icon}`} style={{ fontSize: '1.1rem' }}></i>
                  </a>
                ))}
              </div>
            </div>
            
            {/* Contact Information */}
            <div className="mb-3">
              <h5 className="footer-title">Contact</h5>
              <p className="mb-2" style={{ 
                wordWrap: 'break-word', 
                overflowWrap: 'break-word',
                whiteSpace: 'normal'
              }}>
                <span style={{ display: 'inline-block', width: '24px' }}>📍</span> Kitale-Kapenguria RD
              </p>
              <p className="mb-2">
                <span style={{ display: 'inline-block', width: '24px' }}>📞</span>
                <a href="tel:+254736756595" className="footer-contact-link">+254 736 756 595</a>
              </p>
              <p className="mb-2" style={{ 
                wordWrap: 'break-word', 
                overflowWrap: 'break-word',
                whiteSpace: 'normal'
              }}>
                <span style={{ display: 'inline-block', width: '24px' }}>📧</span>
                <a href="mailto:kitaleprogressivesocial@gmail.com" className="footer-contact-link">kitaleprogressivesocial@gmail.com</a>
              </p>
            </div>
            
           
          </Col>

          {/* Column 2: Quick Links */}
          <Col lg={3} md={6} className="mb-2">
            <h5 className="footer-title">Quick Links</h5>
            <ul className="list-unstyled">
              <li className="mb-2"><button onClick={() => handleLinkClick('/faq')} className="footer-link-btn">FAQs</button></li>
              <li className="mb-2"><button onClick={() => handleLinkClick('/school-life/gallery')} className="footer-link-btn">Gallery</button></li>
              <li className="mb-2"><button onClick={() => handleLinkClick('/academics/curriculum')} className="footer-link-btn">Curriculum</button></li>
              <li className="mb-2"><button onClick={() => handleLinkClick('/admissions/fee-structure')} className="footer-link-btn">Fee Structure</button></li>
              <li className="mb-2"><button onClick={() => handleLinkClick('/partner')} className="footer-link-btn">Partner Page</button></li>
              <li className="mb-2"><button onClick={() => handleLinkClick('/schoollife/blog')} className="footer-link-btn">Blogs</button></li>
            </ul>
          </Col>

          {/* Column 3: Admissions */}
          <Col lg={4} md={12} className="mb-4">
            <h5 className="footer-title">Admissions</h5>
            <ul className="list-unstyled">
              <li className="mb-2"><button onClick={() => handleLinkClick('/admissions/apply')} className="footer-link-btn">Apply Now</button></li>
              <li className="mb-2"><button onClick={() => handleLinkClick('/admissions/fee-structure')} className="footer-link-btn">Fee Structure</button></li>
            </ul>
          </Col>
        </Row>
      </Container>

      {/* RIGHTS SECTION */}
      <div className="footer-rights py-3">
        <Container fluid>
          <Row>
            <Col className="text-center">
              <p className="small mb-0" style={{ color: 'rgba(255,255,255,0.7)' }}>
                © {new Date().getFullYear()} Kitale Progressive School. All Rights Reserved. | 
                <button onClick={() => handleLinkClick('/privacy-policy')} className="footer-legal-link mx-2">Privacy Policy</button> | 
                <button onClick={() => handleLinkClick('/terms-of-service')} className="footer-legal-link mx-2">Terms of Service</button>
              </p>
            </Col>
          </Row>
        </Container>
      </div>
    </footer>
  );
}

export default memo(Footer);