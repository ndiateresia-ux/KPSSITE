import React, { useState, useEffect } from 'react';
import { Navbar, Nav, NavDropdown, Container } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const [expanded, setExpanded] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Close menu when route changes
  useEffect(() => {
    setExpanded(false);
  }, [location.pathname, location.hash]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle body scroll when mobile menu is open
  useEffect(() => {
    if (expanded) {
      document.body.style.overflow = 'hidden';
      document.body.classList.add('menu-open');
      // Announce menu open to screen readers
      const announcer = document.getElementById('menu-announcer');
      if (announcer) {
        announcer.textContent = 'Mobile menu opened';
      }
    } else {
      document.body.style.overflow = 'unset';
      document.body.classList.remove('menu-open');
      // Announce menu close to screen readers
      const announcer = document.getElementById('menu-announcer');
      if (announcer) {
        announcer.textContent = 'Mobile menu closed';
      }
    }
    
    return () => {
      document.body.style.overflow = 'unset';
      document.body.classList.remove('menu-open');
    };
  }, [expanded]);

  // Handle hash scrolling when coming from external link with focus management
  useEffect(() => {
    if (location.pathname === '/' && location.hash === '#contact-section') {
      setTimeout(() => {
        const contactSection = document.getElementById('contact-section');
        if (contactSection) {
          contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // Set focus for keyboard users
          contactSection.setAttribute('tabindex', '-1');
          contactSection.focus({ preventScroll: true });
        }
      }, 100);
    } else if (location.pathname === '/school-life/blogs' && location.hash === '#blog-section') {
      setTimeout(() => {
        const blogSection = document.getElementById('blog-section');
        if (blogSection) {
          blogSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // Set focus for keyboard users
          blogSection.setAttribute('tabindex', '-1');
          blogSection.focus({ preventScroll: true });
        }
      }, 100);
    } else {
      window.scrollTo(0, 0);
    }
  }, [location]);

  // Handle navigation with scroll to top for all pages except contact
  const handleNavigation = (path, isContact = false, isBlog = false) => {
    setExpanded(false);
    
    if (isContact) {
      // Special handling for contact - scroll to contact section on home page
      if (location.pathname === '/') {
        // Already on home page, just scroll to contact section
        setTimeout(() => {
          const contactSection = document.getElementById('contact-section');
          if (contactSection) {
            contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            // Set focus for keyboard users
            contactSection.setAttribute('tabindex', '-1');
            contactSection.focus({ preventScroll: true });
          }
        }, 100);
      } else {
        // Navigate to home page with hash
        navigate('/#contact-section');
      }
    } else if (isBlog) {
      // Special handling for blog - scroll to blog section on news page
      if (location.pathname === '/school-life/blogs') {
        // Already on news page, just scroll to blog section
        setTimeout(() => {
          const blogSection = document.getElementById('blog-section');
          if (blogSection) {
            blogSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            // Set focus for keyboard users
            blogSection.setAttribute('tabindex', '-1');
            blogSection.focus({ preventScroll: true });
          }
        }, 100);
      } else {
        // Navigate to news page with hash
        navigate('/school-life/blogs#blog-section');
      }
    } else {
      // For all other links, navigate and scroll to top
      navigate(path);
      // Use requestAnimationFrame for better performance
      requestAnimationFrame(() => {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'smooth'
        });
      });
    }
  };

  const toggleMenu = () => {
    setExpanded(!expanded);
  };

  // Handle keyboard navigation for menu toggle
  const handleMenuKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleMenu();
    }
  };

  // Determine if a link is active
  const isActive = (path, hash = null) => {
    if (hash) {
      return location.pathname === path && location.hash === hash;
    }
    return location.pathname === path;
  };

  return (
    <>
      {/* Skip to content link for accessibility */}
      <a href="#main-content" className="skip-to-content-link">
        Skip to main content
      </a>
      
      {/* Screen reader announcer for menu state */}
      <div id="menu-announcer" className="visually-hidden" aria-live="polite"></div>
      
      <header className={`main-header ${scrolled ? 'header-scrolled' : 'header-transparent'}`} role="banner">
        <Navbar expanded={expanded} expand="lg" className="p-0">
          <Container fluid>
            <Link 
              to="/" 
              className="brand-container" 
              onClick={() => handleNavigation('/')}
              aria-label="Kitale Progressive School - Return to home page"
            >
              <div className="logo-wrapper">
                <img 
                  src="/images/optimized/logo.png" 
                  alt="" // Decorative image - logo text provides context
                  aria-hidden="true"
                  loading="eager" 
                />
              </div>
              <span className="brand-text">
                <span >KITALE PROGRESSIVE SCHOOL </span>
                <small>In Pursuit of Excellence</small>
              </span>
            </Link>

            <button
              onClick={toggleMenu}
              onKeyDown={handleMenuKeyDown}
              className={`navbar-toggler custom-toggler ${expanded ? 'active' : ''}`}
              type="button"
              aria-label="Toggle navigation menu"
              aria-expanded={expanded}
              aria-controls="navbar-collapse"
              style={{ minHeight: '44px', minWidth: '44px' }}
            >
              <span className="navbar-toggler-icon" aria-hidden="true"></span>
            </button>

            <div 
              id="navbar-collapse"
              className={`navbar-collapse ${expanded ? 'show' : ''}`}
              role="navigation"
              aria-label="Main navigation"
            >
              <Nav className="ms-auto">
                <Nav.Link 
                  onClick={() => handleNavigation('/')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleNavigation('/');
                    }
                  }}
                  className={isActive('/') && !location.hash ? 'active' : ''}
                  aria-current={isActive('/') && !location.hash ? 'page' : undefined}
                >
                  Home
                </Nav.Link>
                
                <NavDropdown 
                  title="Academics" 
                  id="academics-dropdown"
                  className="nav-dropdown-custom"
                  renderMenuOnMount={false}
                >
                  <NavDropdown.Item 
                    onClick={() => handleNavigation('/academics/curriculum')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleNavigation('/academics/curriculum');
                      }
                    }}
                  >
                    Curriculum
                  </NavDropdown.Item>
                  <NavDropdown.Item 
                    onClick={() => handleNavigation('/academics/clubs-societies')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleNavigation('/academics/clubs-societies');
                      }
                    }}
                  >
                    Co-curricular
                  </NavDropdown.Item>
                </NavDropdown>

                <NavDropdown 
                  title="School Life" 
                  id="school-life-dropdown"
                  className="nav-dropdown-custom"
                  renderMenuOnMount={false}
                >
                  <NavDropdown.Item 
                    onClick={() => handleNavigation('/school-life/blogs')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleNavigation('/school-life/blogs');
                      }
                    }}
                  >
                    Blogs
                  </NavDropdown.Item>
                  
                 
                  
                  <NavDropdown.Item 
                    onClick={() => handleNavigation('/school-life/events')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleNavigation('/school-life/events');
                      }
                    }}
                  >
                    Events
                  </NavDropdown.Item>
                  <NavDropdown.Item 
                    onClick={() => handleNavigation('/school-life/gallery')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleNavigation('/school-life/gallery');
                      }
                    }}
                  >
                    Gallery
                  </NavDropdown.Item>
                  <NavDropdown.Item 
                    onClick={() => handleNavigation('/school-life/dining')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleNavigation('/school-life/dining');
                      }
                    }}
                  >
                    Dining
                  </NavDropdown.Item>
                  <NavDropdown.Item 
                    onClick={() => handleNavigation('/school-life/boarding')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleNavigation('/school-life/boarding');
                      }
                    }}
                  >
                    Boarding Life
                  </NavDropdown.Item>
                </NavDropdown>
                
                <NavDropdown 
                  title="Admissions" 
                  id="admissions-dropdown"
                  className="nav-dropdown-custom"
                  renderMenuOnMount={false}
                >
                  <NavDropdown.Item 
                    onClick={() => handleNavigation('/admissions/apply')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleNavigation('/admissions/apply');
                      }
                    }}
                  >
                    Apply Now
                  </NavDropdown.Item>
                  <NavDropdown.Item 
                    onClick={() => handleNavigation('/admissions/fee-structure')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleNavigation('/admissions/fee-structure');
                      }
                    }}
                  >
                    Fee Structure
                  </NavDropdown.Item>
                </NavDropdown>

                <Nav.Link 
                  onClick={() => handleNavigation('/faq')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleNavigation('/faq');
                    }
                  }}
                  className={isActive('/faq') ? 'active' : ''}
                  aria-current={isActive('/faq') ? 'page' : undefined}
                >
                  FAQ
                </Nav.Link>

                <Nav.Link 
                  onClick={() => handleNavigation('/partner')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleNavigation('/partner');
                    }
                  }}
                  className={isActive('/partner') ? 'active' : ''}
                  aria-current={isActive('/partner') ? 'page' : undefined}
                >
                  Partners/Donors
                </Nav.Link>

                {/* Contact link with special handling */}
              <Nav.Link 
                onClick={() => handleNavigation('/contact')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleNavigation('/contact');
                  }
                }}
                className={isActive('/contact') ? 'active' : ''}
                aria-current={isActive('/contact') ? 'page' : undefined}
              >
                Contact
              </Nav.Link>

                <Nav.Link 
                  onClick={() => handleNavigation('/admissions/apply')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleNavigation('/admissions/apply');
                    }
                  }}
                  className="apply-btn"
                >
                  Apply Now
                </Nav.Link>
              </Nav>
            </div>
          </Container>
        </Navbar>
      </header>
    </>
  );
};

export default Header;