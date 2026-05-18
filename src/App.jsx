import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from '@react-oauth/google';
import React, { lazy, Suspense, useEffect } from "react";
import "./theme.css"; // Non-critical CSS loaded asynchronously via index.html

// Lazy load all page components for code splitting
const Home = lazy(() => import("./pages/Home"));
const Curriculum = lazy(() => import("./pages/Curriculum"));
const ClubsSocieties = lazy(() => import("./pages/ClubsSocieties"));
const Blogs = lazy(() => import("./pages/Blogs"));
const Events = lazy(() => import("./pages/Events"));
const Gallery = lazy(() => import("./pages/Gallery"));
const Boarding = lazy(() => import("./pages/Boarding"));
const Dining = lazy(() => import("./pages/Dining"));
const Apply = lazy(() => import("./pages/Apply"));
const FeeStructure = lazy(() => import("./pages/FeeStructure"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Partner = lazy(() => import("./pages/Partner"));
const Contact = lazy(() => import("./pages/Contact"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));

// Lazy load non-critical components
const Header = lazy(() => import("./components/Header"));
const Footer = lazy(() => import("./components/Footer"));
const WhatsAppFloat = lazy(() => import("./components/WhatsAppFloat"));

// Loading fallback component with theme colors and accessibility
const PageLoader = () => (
  <div 
    role="status"
    aria-label="Loading page content"
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: 'var(--gray-light)'
    }}
  >
    <div style={{
      width: '50px',
      height: '50px',
      border: `3px solid var(--navy)`,
      borderTopColor: 'var(--gold)',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }} />
    <span className="visually-hidden">Loading...</span>
    <style>{`
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
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
    `}</style>
  </div>
);

// Header loader with proper height to prevent layout shift - using theme colors
const HeaderLoader = () => (
  <div 
    aria-hidden="true"
    style={{ 
      height: '76px', 
      backgroundColor: 'var(--white)',
      boxShadow: '0 2px 10px rgba(13,101,251,0.1)',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 9999
    }} 
  />
);

function App() {
  // Access environment variables using import.meta.env for Vite
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_GMAIL_CLIENT_ID;

  // Log to verify (remove in production)
  if (import.meta.env.DEV) {
    console.log("Google Client ID:", GOOGLE_CLIENT_ID ? "Present" : "Missing");
  }

  // Preload critical pages on idle
  useEffect(() => {
    if ('requestIdleCallback' in window) {
      // Preload Home page when idle
      requestIdleCallback(() => {
        import("./pages/Home");
      }, { timeout: 2000 });
    }
  }, []);

  // Add skip to content link for keyboard users with theme styling
  useEffect(() => {
    // Create skip link if it doesn't exist
    if (!document.getElementById('skip-to-content')) {
      const skipLink = document.createElement('a');
      skipLink.id = 'skip-to-content';
      skipLink.href = '#main-content';
      skipLink.className = 'skip-to-content-link';
      skipLink.textContent = 'Skip to main content';
      document.body.insertBefore(skipLink, document.body.firstChild);
    }
  }, []);

  // If no client ID, show a warning but still render the app
  if (!GOOGLE_CLIENT_ID && import.meta.env.DEV) {
    console.warn("Google Client ID is missing. Google OAuth will not work.");
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID || ""}>
      <Router
        future={{
          v7_relativeSplatPath: true,
          v7_startTransition: true,
        }}
      >
        <Suspense fallback={<HeaderLoader />}>
          <Header />
        </Suspense>
        
        <Suspense fallback={null}>
          <WhatsAppFloat />
        </Suspense>
        
        {/* Add main landmark with id for skip link */}
        <main id="main-content" tabIndex="-1">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Home />} />
              
              {/* Academics Routes */}
              <Route path="/academics/curriculum" element={<Curriculum />} />
              <Route path="/academics/clubs-societies" element={<ClubsSocieties />} />
              
              {/* School Life Routes */}
              <Route path="/school-life/blogs" element={<Blogs />} />
              <Route path="/school-life/events" element={<Events />} />
              <Route path="/school-life/gallery" element={<Gallery />} />
              <Route path="/school-life/boarding" element={<Boarding />} />
              <Route path="/school-life/dining" element={<Dining />} />

              {/* Admissions Routes */}
              <Route path="/admissions/apply" element={<Apply />} />
              <Route path="/admissions/fee-structure" element={<FeeStructure />} />
              
              {/* Other Routes */}
              <Route path="/faq" element={<FAQ />} />
              <Route path="/partner" element={<Partner />} />
              <Route path="/contact" element={<Contact />} />
              
              {/* Legal Routes */}
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
            </Routes>
          </Suspense>
        </main>
        
        <Suspense fallback={null}>
          <Footer />
        </Suspense>
      </Router>

      {/* Add styles for skip link with theme variables */}
      <style>{`
        .skip-to-content-link {
          position: absolute;
          top: -40px;
          left: 0;
          background: var(--navy);
          color: var(--white);
          padding: 8px 16px;
          z-index: 10000;
          text-decoration: none;
          border-radius: 0 0 4px 0;
          transition: top 0.2s ease;
          font-family: 'Montserrat', system-ui, sans-serif;
          font-weight: 500;
        }
        
        .skip-to-content-link:focus {
          top: 0;
          outline: 3px solid var(--gold);
          outline-offset: 2px;
        }
        
        #main-content:focus {
          outline: none;
        }
        
        /* Ensure Montserrat font throughout the app */
        body, 
        html, 
        #root,
        main,
        div,
        section,
        article,
        header,
        footer,
        nav,
        h1, h2, h3, h4, h5, h6,
        p, span, a, button, input, textarea, select, label,
        li, ul, ol {
          font-family: 'Montserrat', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        }
        
        /* Smooth scrolling for better UX */
        html {
          scroll-behavior: smooth;
        }
        
        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          .skip-to-content-link {
            transition: none;
          }
          html {
            scroll-behavior: auto;
          }
        }
        
        /* Print styles */
        @media print {
          .skip-to-content-link,
          .whatsapp-float-container,
          .cta-section {
            display: none !important;
          }
          body {
            background: white;
            color: black;
          }
        }
      `}</style>
    </GoogleOAuthProvider>
  );
}

export default App;