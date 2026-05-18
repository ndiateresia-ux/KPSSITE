import { useState, useEffect, memo, useCallback } from "react";
import { Link } from "react-router-dom";
import styles from './WhatsAppFloat.module.css';

// SVG icon as a component for better performance
const WhatsAppIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 448 512"
    width="28"
    height="28"
    fill="white"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.2-99.6 224.2-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54.5-29.1-75.5-66-5.7-9.9 5.7-9.2 16.4-30.6 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.3-5.1-3.7-10.6-6.5z"/>
  </svg>
);

const WhatsAppFloat = memo(function WhatsAppFloat() {
  const [showWelcome, setShowWelcome] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const initTimers = () => {
      // Show the WhatsApp button faster - reduced from 2000ms to 500ms
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 500);

      // Show welcome message sooner - reduced from 6000ms to 2000ms
      const welcomeTimer = setTimeout(() => {
        if (!sessionStorage.getItem('whatsappShown')) {
          setShowWelcome(true);
          sessionStorage.setItem('whatsappShown', 'true');
        }
      }, 2000);

      return () => {
        clearTimeout(timer);
        clearTimeout(welcomeTimer);
      };
    };

    if ('requestIdleCallback' in window) {
      requestIdleCallback(initTimers, { timeout: 1000 });
    } else {
      initTimers();
    }
  }, []);

  const handleClose = useCallback((e) => {
    e.stopPropagation();
    setShowWelcome(false);
    sessionStorage.setItem('whatsappShown', 'true');
  }, []);

  const handleChatClick = useCallback(() => {
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', 'whatsapp_click', {
        'event_category': 'engagement',
        'event_label': 'whatsapp_chat'
      });
    }
  }, []);

  // Handle keyboard navigation for the welcome message close button
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape' && showWelcome) {
      handleClose(e);
    }
  }, [showWelcome, handleClose]);

  useEffect(() => {
    if (showWelcome) {
      document.addEventListener('keydown', handleKeyDown);
      // Move focus to the close button when welcome message appears
      const closeButton = document.querySelector(`.${styles.closeBtn}`);
      if (closeButton) {
        closeButton.focus();
      }
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showWelcome, handleKeyDown]);

  if (!isVisible) return null;

  const whatsappLink = "https://wa.me/254780841116?text=Hello%20Kitale%20Progressive%20School%2C%20I%20would%20like%20to%20inquire%20about...";

  return (
    <div className={styles.container}>
      {showWelcome && (
        <div 
          className={styles.welcomeMessage}
          role="dialog"
          aria-label="WhatsApp chat invitation"
          aria-modal="true"
          tabIndex={-1}
        >
          <button 
            className={styles.closeBtn} 
            onClick={handleClose}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleClose(e);
              }
            }}
            aria-label="Close message"
          >
            ×
            <span className="visually-hidden">Close</span>
          </button>
          
          <div className={styles.messageContent}>
            <div className={styles.messageIcon}>
              <i className="bi bi-whatsapp" aria-hidden="true"></i>
            </div>
            
            <div className={styles.messageBody}>
              <p className={styles.messageText}>
                👋 Welcome to Kitale Progressive School!
              </p>
              <p className={styles.messageSubText}>
                How can we help you today? Choose an option:
              </p>
              
              <div className={styles.messageButtons}>
                <Link 
                  to="/academics/curriculum"
                  className={styles.messageLink}
                  onClick={() => {
                    handleClose();
                    if (typeof window.gtag !== 'undefined') {
                      window.gtag('event', 'fees_click', {
                        'event_category': 'engagement',
                        'event_label': 'whatsapp_fees'
                      });
                    }
                  }}
                >
                  Our Programs
                </Link>
                
                <Link 
                  to="/admissions/fee-structure"
                  className={styles.messageLink}
                  onClick={() => {
                    handleClose();
                    if (typeof window.gtag !== 'undefined') {
                      window.gtag('event', 'fees_click', {
                        'event_category': 'engagement',
                        'event_label': 'whatsapp_fees'
                      });
                    }
                  }}
                >
                  💰 Download Fee Structure
                </Link>
                <Link 
                  to="/admissions/apply"
                  className={styles.messageLink}
                  onClick={() => {
                    handleClose();
                    if (typeof window.gtag !== 'undefined') {
                      window.gtag('event', 'apply_click', {
                        'event_category': 'engagement',
                        'event_label': 'whatsapp_apply'
                      });
                    }
                  }}
                >
                  📝 Apply Now
                </Link>
                
              </div>
            </div>
          </div>
        </div>
      )}
      
      <a
        href={whatsappLink}
        className={styles.float}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp (opens in new window)"
        onClick={handleChatClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            window.open(whatsappLink, '_blank', 'noopener noreferrer');
          }
        }}
      >
        <WhatsAppIcon />
        <span className={styles.tooltip} aria-hidden="true">Chat with us</span>
        <span className="visually-hidden">Chat with us on WhatsApp</span>
      </a>
    </div>
  );
});

WhatsAppFloat.displayName = 'WhatsAppFloat';

export default WhatsAppFloat;