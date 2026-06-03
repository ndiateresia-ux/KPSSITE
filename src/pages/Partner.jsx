import { Helmet } from "react-helmet-async";
import { Container, Row, Col, Button, Form } from "react-bootstrap";
import { useState, useCallback, lazy, Suspense, memo, useEffect } from "react";
import { Link } from "react-router-dom";
import { useGoogleLogin } from '@react-oauth/google';
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { parsePhoneNumber } from 'libphonenumber-js';

// Helper function for Unicode-safe base64 encoding
const utf8ToBase64 = (str) => {
  const utf8Bytes = new TextEncoder().encode(str);
  let binaryString = '';
  for (let i = 0; i < utf8Bytes.length; i++) {
    binaryString += String.fromCharCode(utf8Bytes[i]);
  }
  return btoa(binaryString);
};

// Simple intersection observer hook for Core Web Vitals
const useInView = ({ threshold = 0.1, triggerOnce = false }) => {
  const [ref, setRef] = useState(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!ref) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (entry.isIntersecting && triggerOnce) {
          observer.disconnect();
        }
      },
      { threshold }
    );
    
    observer.observe(ref);
    
    return () => observer.disconnect();
  }, [ref, threshold, triggerOnce]);

  return [setRef, inView];
};

// Simple CountUp component for Core Web Vitals
const CountUp = ({ end, duration = 2, suffix = "" }) => {
  const [count, setCount] = useState(0);
  const [ref, inView] = useInView({ threshold: 0.3, triggerOnce: true });

  useEffect(() => {
    if (!inView) return;
    
    let startTime;
    let animationFrame;
    
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      const currentCount = Math.floor(progress * end);
      setCount(currentCount);
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [inView, end, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
};

// Memoized stat card component with theme
const StatCard = memo(({ stat, index }) => {
  const [ref, inView] = useInView({ threshold: 0.3, triggerOnce: true });
  const cardId = `stat-${index}`;
  
  return (
    <Col md={3} className="text-center mb-3">
      <div ref={ref} className="stat-item text-center p-3" style={{
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '16px',
        backdropFilter: 'blur(10px)'
      }} role="article" aria-labelledby={cardId}>
        <div id={cardId} className="stat-number text-primary fw-bold display-6" aria-hidden="true">
          {inView ? (
            <CountUp end={stat.value} suffix={stat.suffix} />
          ) : (
            `0${stat.suffix}`
          )}
        </div>
        <div className="stat-label text-white small text-uppercase tracking-wide">{stat.label}</div>
        <span className="visually-hidden">{stat.value}{stat.suffix} {stat.label}</span>
      </div>
    </Col>
  );
});

StatCard.displayName = 'StatCard';

// Partnership Card Component with theme
const PartnershipCard = memo(({ icon, title, description }) => {
  const cardId = `partnership-${title.replace(/\s+/g, '-').toLowerCase()}`;
  
  return (
    <Col md={6} lg={3} className="mb-4">
      <div
        className="card-custom partnership-card text-center p-4 h-100"
        role="article"
        aria-labelledby={cardId}
        tabIndex={0}
      >
        <div className="partnership-icon mb-3" style={{ fontSize: '3rem' }} aria-hidden="true">{icon}</div>
        <h3 id={cardId} className="card-title-navy h6 fw-bold mb-2">{title}</h3>
        <p className="text-muted small mb-0">{description}</p>
      </div>
    </Col>
  );
});

PartnershipCard.displayName = 'PartnershipCard';

// Step Component for How Partnership Works with theme
const StepCard = memo(({ number, title, description }) => {
  const stepId = `step-${number}`;
  
  return (
    <Col md={6} lg={3} className="mb-4">
      <div className="card-custom step-card text-center p-3 h-100" role="article" aria-labelledby={stepId}>
        <div className="step-number mb-2" style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--navy)' }} aria-hidden="true">{number}</div>
        <h3 id={stepId} className="card-title-navy h5 fw-bold mb-4">{title}</h3>
        <p className="text-muted mb-2">{description}</p>
      </div>
    </Col>
  );
});

StepCard.displayName = 'StepCard';

// Terms Checkbox Component - FIXED: Proper label association using native elements
const TermsCheckbox = memo(({ checked, onChange, required = true }) => {
  const checkboxId = "agreeToTerms";
  const errorId = `${checkboxId}-error`;
  const [touched, setTouched] = useState(false);
  
  const isInvalid = required && !checked && touched;
  
  const handleBlur = useCallback(() => {
    setTouched(true);
  }, []);
  
  return (
    <Form.Group className="mb-4">
      <div className="d-flex align-items-start">
        <input
          type="checkbox"
          id={checkboxId}
          name="agreeToTerms"
          checked={checked}
          onChange={onChange}
          onBlur={handleBlur}
          required={required}
          className="terms-checkbox-input"
          style={{
            width: '16px',
            height: '16px',
            marginTop: '2px',
            cursor: 'pointer',
            accentColor: '#050265'
          }}
          aria-invalid={isInvalid ? "true" : "false"}
          aria-describedby={isInvalid ? errorId : undefined}
          aria-required="true"
        />
        <label 
          htmlFor={checkboxId} 
          className="mb-0 ms-2"
          style={{ cursor: 'pointer', fontSize: '0.9rem', lineHeight: '1.4' }}
        >
          I agree to the{' '}
          <Link to="/privacy-policy" target="_blank" className="text-navy text-decoration-underline">
            Privacy Policy
          </Link>
          {' '}and{' '}
          <Link to="/terms-of-service" target="_blank" className="text-navy text-decoration-underline">
            Terms of Service
          </Link>
          <span className="visually-hidden"> (required)</span>
          {required && <span className="text-danger ms-1" aria-hidden="true">*</span>}
        </label>
      </div>
      {isInvalid && (
        <div id={errorId} className="invalid-feedback d-block mt-1" style={{ fontSize: '0.875rem' }} role="alert">
          You must agree to the Privacy Policy and Terms of Service.
        </div>
      )}
    </Form.Group>
  );
});

TermsCheckbox.displayName = 'TermsCheckbox';

// Alert component with theme
const AlertMessage = memo(({ show, success, message, onClose }) => {
  if (!show) return null;
  
  return (
    <div 
      className={`sponsor-alert ${success ? 'sponsor-alert-success' : 'sponsor-alert-error'} mb-4 fade-in`}
      role="alert" 
      aria-live="polite"
    >
      <div className="d-flex align-items-center gap-2">
        <i className={`fas ${success ? 'fa-check-circle' : 'fa-exclamation-circle'}`} style={{ fontSize: '1.2rem' }} aria-hidden="true"></i>
        <span className="small">{message}</span>
      </div>
      <button
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClose();
          }
        }}
        className="sponsor-alert-close"
        aria-label="Close alert"
      >
        ×
      </button>
    </div>
  );
});

AlertMessage.displayName = 'AlertMessage';

// Create email with content function
const createEmailWithContent = async (to, from, subject, htmlContent, textContent) => {
  const boundary = 'boundary_' + Math.random().toString(36).substring(2);

  const emailParts = [
    `MIME-Version: 1.0`,
    `To: ${to}`,
    `From: ${from}`,
    `Subject: ${subject}`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 7bit',
    '',
    textContent,
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: 7bit',
    '',
    htmlContent,
    '',
    `--${boundary}--`
  ];

  const emailContent = emailParts.join('\r\n');
  
  return utf8ToBase64(emailContent)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

function Partner() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    organization: "",
    partnershipInterest: "",
    message: "",
    agreeToTerms: false
  });

  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [validated, setValidated] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({
    show: false,
    success: false,
    message: ""
  });

  // Get environment variables
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_GMAIL_CLIENT_ID;
  const SPONSORSHIP_EMAIL = import.meta.env.VITE_SPONSORSHIP_EMAIL || 'ndiateresia@gmail.com';
  const GMAIL_SCOPES = import.meta.env.VITE_GMAIL_SCOPES || 'https://www.googleapis.com/auth/gmail.send';

  // Partnership interest options
  const partnershipOptions = [
    { value: "Student Sponsorship", label: "Student Sponsorship" },
    { value: "Infrastructure Support", label: "Infrastructure Support" },
    { value: "Strategic Partnership", label: "Strategic Partnership" },
    { value: "Faith-Based / Mission Partnership", label: "Faith-Based / Mission Partnership" },
    { value: "Other", label: "Other" }
  ];

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  }, []);

  const handlePhoneChange = useCallback((value) => {
    setPhone(value);
    setPhoneError("");
    
    if (value) {
      try {
        const phoneNumber = parsePhoneNumber(value);
        if (phoneNumber) {
          const nationalNumber = phoneNumber.nationalNumber;
          if (nationalNumber.length !== 9) {
            setPhoneError("Phone number must be exactly 9 digits after country code");
          } else {
            setFormData(prev => ({ ...prev, phone: value }));
          }
        }
      } catch (error) {
        setPhoneError("Invalid phone number format");
      }
    } else {
      setFormData(prev => ({ ...prev, phone: value }));
    }
  }, []);

  const handleDismissAlert = useCallback(() => {
    setSubmitStatus(prev => ({ ...prev, show: false }));
  }, []);

  const getDisplayPartnershipInterest = useCallback(() => {
    return formData.partnershipInterest || 'Not specified';
  }, [formData.partnershipInterest]);

  // Create email content function
  const createEmailContents = useCallback(() => {
    const currentDate = new Date().toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const displayInterest = getDisplayPartnershipInterest();
    const formattedPhone = formData.phone || 'Not provided';

    // HTML version for SCHOOL
    const schoolHtmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px; padding: 20px; background: linear-gradient(135deg, #0d65fb 0%, #0a55d6 100%); border-radius: 10px;">
          <h2 style="color: white; margin: 0; font-size: 24px;">Kitale Progressive School</h2>
          <p style="color: #ff0080; margin: 5px 0 0;">In Pursuit of Excellence</p>
        </div>
        
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h3 style="color: #0d65fb; margin-top: 0; border-bottom: 2px solid #0d65fb; padding-bottom: 10px;">New Partnership Inquiry</h3>
          
          <p style="color: #666; margin-bottom: 20px;"><strong>Date:</strong> ${currentDate}</p>
          
          <h4 style="color: #0d65fb; margin: 20px 0 10px 0;">Partner Information</h4>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr><td style="padding: 10px; background-color: #f5f5f5; font-weight: bold; width: 140px;">Full Name:</td><td style="padding: 10px; border-bottom: 1px solid #eee;">${formData.fullName}Zoey</tr>
            <tr><td style="padding: 10px; background-color: #f5f5f5; font-weight: bold;">Email:</td><td style="padding: 10px; border-bottom: 1px solid #eee;"><a href="mailto:${formData.email}" style="color: #0d65fb;">${formData.email}</a>Zoey</tr>
            <tr><td style="padding: 10px; background-color: #f5f5f5; font-weight: bold;">Phone:</td><td style="padding: 10px; border-bottom: 1px solid #eee;">${formattedPhone}Zoey</td></tr>
            ${formData.organization ? `<tr><td style="padding: 10px; background-color: #f5f5f5; font-weight: bold;">Organization:</td><td style="padding: 10px; border-bottom: 1px solid #eee;">${formData.organization}Zoey</td><tr>` : ''}
            <tr><td style="padding: 10px; background-color: #f5f5f5; font-weight: bold;">Partnership Interest:</td><td style="padding: 10px; border-bottom: 1px solid #eee;">${displayInterest}Zoey</td></tr>
          </table>
          
          <h4 style="color: #0d65fb; margin: 20px 0 10px 0;">Message from Partner</h4>
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; border-left: 4px solid #0d65fb; margin-bottom: 20px;">
            <p style="margin: 0; line-height: 1.6; white-space: pre-wrap;">${formData.message.replace(/\n/g, '<br>')}</p>
          </div>
        </div>
      </div>
    `;

    // HTML version for PARTNER
    const partnerHtmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="text-align: center; margin-bottom: 30px; padding: 30px; background: linear-gradient(135deg, #0d65fb 0%, #0a55d6 100%); border-radius: 15px;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Thank You!</h1>
          <p style="color: #ff0080; margin: 10px 0 0; font-size: 18px;">Partnership Inquiry Received</p>
        </div>
        
        <div style="background-color: white; padding: 40px; border-radius: 15px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
          <p style="font-size: 18px; line-height: 1.6; color: #333; margin-bottom: 25px;">
            Dear <strong style="color: #0d65fb;">${formData.fullName}</strong>,
          </p>
          
          <p style="font-size: 16px; line-height: 1.8; color: #333; margin-bottom: 25px;">
            Thank you for reaching out to explore a partnership with Kitale Progressive School. Your interest in collaborating with us to expand access to quality education and build lasting impact is deeply appreciated.
          </p>
          
          <h3 style="color: #0d65fb; margin: 30px 0 20px 0;">What Happens Next:</h3>
          
          <ol style="font-size: 16px; line-height: 1.8; color: #333; margin-bottom: 30px;">
            <li>A member of our Partnership Team will contact you within 24-48 hours.</li>
            <li>We will discuss your goals and align them with priority areas within the school.</li>
            <li>Together, we will define the scope, expected outcomes, and implementation plan.</li>
            <li>We will provide structured updates and accountability throughout our partnership.</li>
          </ol>
          
          <p style="font-size: 18px; line-height: 1.6; color: #333; margin-top: 30px;">
            We look forward to building a meaningful partnership that transforms young lives and strengthens our community.
          </p>
          
          <p style="font-size: 18px; line-height: 1.6; color: #333; margin-top: 30px;">
            With gratitude,<br/>
            <strong style="color: #0d65fb; font-size: 20px;">The Partnership Team</strong><br/>
            <span style="color: #666;">Kitale Progressive School</span><br/>
            <em style="color: #0d65fb;">"In Pursuit of Excellence"</em>
          </p>
        </div>
      </div>
    `;

    return {
      school: { html: schoolHtmlContent, text: "" },
      partner: { html: partnerHtmlContent, text: "" }
    };
  }, [formData, getDisplayPartnershipInterest]);

  // Google Login configuration
  const login = useGoogleLogin({
    clientId: GOOGLE_CLIENT_ID,
    scope: GMAIL_SCOPES,
    onSuccess: async (tokenResponse) => {
      try {
        setSubmitting(true);
        
        const emailContents = createEmailContents();
        
        // SEND EMAIL TO SCHOOL
        const schoolEncodedEmail = await createEmailWithContent(
          SPONSORSHIP_EMAIL,
          formData.email,
          `NEW PARTNERSHIP INQUIRY: ${formData.fullName} - ${getDisplayPartnershipInterest()}`,
          emailContents.school.html,
          emailContents.school.text
        );
        
        const schoolResponse = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${tokenResponse.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ raw: schoolEncodedEmail })
        });
        
        if (!schoolResponse.ok) {
          throw new Error("Failed to send inquiry to school");
        }
        
        // SEND CONFIRMATION EMAIL TO PARTNER
        const partnerEncodedEmail = await createEmailWithContent(
          formData.email,
          formData.email,
          `Partnership Inquiry Received - Kitale Progressive School`,
          emailContents.partner.html,
          emailContents.partner.text
        );
        
        await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${tokenResponse.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ raw: partnerEncodedEmail })
        }).catch(err => console.warn("Partner confirmation warning:", err));

        setSubmitStatus({
          show: true,
          success: true,
          message: `Thank you for your partnership interest! A confirmation email has been sent to ${formData.email}. Our team will contact you within 24-48 hours.`
        });

        // Reset form
        setFormData({
          fullName: "", email: "", phone: "", organization: "", partnershipInterest: "", message: "", agreeToTerms: false
        });
        setPhone("");
        setPhoneError("");
        setValidated(false);
        
      } catch (error) {
        console.error("Email error:", error);
        setSubmitStatus({
          show: true,
          success: false,
          message: error.message || "Error sending inquiry. Please try again or call us at +254 722 631 433."
        });
      } finally {
        setSubmitting(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    onError: (errorResponse) => {
      console.error('Login Failed:', errorResponse);
      let errorMessage = "Google sign-in failed. ";
      
      if (errorResponse?.error === 'popup_blocked_by_browser') {
        errorMessage += "Please allow popups for this site.";
      } else if (errorResponse?.error === 'access_denied') {
        errorMessage += "You denied access to your account.";
      } else {
        errorMessage += "Please try again.";
      }
      
      setSubmitStatus({
        show: true,
        success: false,
        message: errorMessage
      });
      setSubmitting(false);
    }
  });

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.email || !formData.message || !formData.partnershipInterest) {
      setSubmitStatus({
        show: true,
        success: false,
        message: "Please fill in all required fields."
      });
      return;
    }

    if (phone && phoneError) {
      setSubmitStatus({
        show: true,
        success: false,
        message: phoneError
      });
      return;
    }

    if (!formData.agreeToTerms) {
      setSubmitStatus({
        show: true,
        success: false,
        message: "Please agree to the Privacy Policy and Terms of Service."
      });
      return;
    }

    if (!GOOGLE_CLIENT_ID) {
      setSubmitStatus({
        show: true,
        success: false,
        message: "Google Client ID is missing. Please check configuration."
      });
      return;
    }
    
    login();
  }, [formData, phone, phoneError, login, GOOGLE_CLIENT_ID]);

  // Partnership cards data
  const partnershipCards = [
    { icon: "🎓", title: "Student Sponsorship Program", description: "Support deserving bright learners through structured sponsorship with clear tracking and accountability." },
    { icon: "🏗️", title: "Resource & Infrastructure Partnerships", description: "Partner with us to improve classrooms, libraries, technology, and learning environments." },
    { icon: "🤝", title: "Strategic & Institutional Partnerships", description: "Collaborate on education programs, grants, and long-term development initiatives." },
    { icon: "⛪", title: "Faith-Based & Mission Partnerships", description: "Partner with us to support holistic education that nurtures both academic excellence and strong values." }
  ];

  // Partnership steps data
  const partnershipSteps = [
    { number: "01", title: "Expression of Interest", description: "Submit your interest through our partnership form." },
    { number: "02", title: "Needs Alignment", description: "We align your goals with priority areas within the school." },
    { number: "03", title: "Program Structuring", description: "Define scope, expected outcomes, and implementation plan." },
    { number: "04", title: "Implementation & Reporting", description: "Execute and provide structured updates and accountability." }
  ];

  return (
    <>
      <Helmet>
        <title>Partner With Us | Sponsorship & Partnerships | Kitale Progressive School</title>
        <meta
          name="description"
          content="Partner with Kitale Progressive School through student sponsorship, infrastructure support, strategic partnerships, or faith-based missions. Make a lasting impact in education."
        />
      </Helmet>

      {/* Hero Section - Matching Other Pages with Background Image */}
      <section className="partner-hero-section" aria-labelledby="page-title">
        <div className="partner-hero-content">
          <h1 id="page-title">Partner With Kitale Progressive School</h1>
          <p>We collaborate with organizations, foundations, and faith-based partners to expand access to quality education and build lasting impact.</p>
          <div className="hero-highlight">Structured programs. Shared values. Measurable impact.</div>
          <div className="hero-button mt-3">
            <Button 
              href="#partnership-form" 
              className="btn-navy"
              style={{ minHeight: '48px' }}
            >
              start a partnership conversation
            </Button>
          </div>
        </div>
      </section>

      {/* A Private School with a Purpose-Driven Impact Arm */}
      <section className="section-padding py-5" style={{ background: 'var(--gray-light)' }}>
        <Container>
          <Row className="justify-content-center">
            <Col lg={10}>
              <div className="text-center mb-4">
                <div className="d-inline-flex align-items-center justify-content-center mb-3" style={{
                  width: '60px',
                  height: '60px',
                  background: 'rgba(13,101,251,0.1)',
                  borderRadius: '50%',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <i className="fas fa-building" style={{ fontSize: '1.5rem', color: 'var(--navy)' }} aria-hidden="true"></i>
                </div>
                <h2 className="section-heading mb-2">A Private School with a Purpose-Driven Impact Arm</h2>
              </div>
              <p className="lead text-center text-dark">
                Kitale Progressive School is a private institution committed to academic excellence. Alongside this, we provide structured opportunities for partners to support deserving learners and strategic school development initiatives.
              </p>
            </Col>
          </Row>
        </Container>
      </section>

      {/* An Opportunity to Make Lasting Impact */}
      <section className="section-padding py-5" style={{ background: 'white' }}>
        <Container>
          <Row className="justify-content-center">
            <Col lg={10} xl={8}>
              <div className="text-center mb-5">
                <div className="d-inline-flex align-items-center justify-content-center mb-3" style={{
                  width: '70px',
                  height: '70px',
                  background: 'linear-gradient(135deg, rgba(5,2,101,0.1), rgba(26,107,255,0.1))',
                  borderRadius: '50%',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <i className="fas fa-hand-holding-heart" style={{ fontSize: '1.8rem', color: '#050265' }} aria-hidden="true"></i>
                </div>
                <h2 className="section-heading mb-3 text-dark" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.2rem)' }}>
                  An Opportunity to Make Lasting Impact
                </h2>
                <div style={{ width: '60px', height: '3px', margin: '0 auto 1.5rem', borderRadius: '2px' }}></div>
                <p className="lead text-center text-muted mx-auto" style={{ maxWidth: '800px', fontSize: '1.1rem', lineHeight: '1.6' }}>
                  We provide structured opportunities for partners to contribute meaningfully to education, not as charity, but as a strategic investment in future generations.
                </p>
              </div>
              
              <Row className="g-5 justify-content-center">
                <Col md={4}>
                  <div className="impact-card text-center p-4 h-100" style={{
                    background: '#f8f9fa',
                    borderRadius: '20px',
                    transition: 'all 0.3s ease',
                    border: '1px solid rgba(5,2,101,0.08)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                  }}>
                    <div className="impact-icon mb-3" style={{
                      width: '70px',
                      height: '70px',
                      background: 'linear-gradient(135deg, #050265, #1a6bff)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto'
                    }}>
                      <i className="fas fa-graduation-cap" style={{ fontSize: '1.8rem', color: 'white' }} aria-hidden="true"></i>
                    </div>
                    <h3 className="h6 fw-bold mb-2 text-dark">Quality Education Access</h3>
                    <p className="small text-muted mb-0">Support access to quality education for deserving learners</p>
                  </div>
                </Col>
                
                <Col md={4}>
                  <div className="impact-card text-center p-4 h-100" style={{
                    background: '#f8f9fa',
                    borderRadius: '20px',
                    transition: 'all 0.3s ease',
                    border: '1px solid rgba(5,2,101,0.08)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                  }}>
                    <div className="impact-icon mb-3" style={{
                      width: '70px',
                      height: '70px',
                      background: 'linear-gradient(135deg, #050265, #1a6bff)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto'
                    }}>
                      <i className="fas fa-star" style={{ fontSize: '1.8rem', color: 'white' }} aria-hidden="true"></i>
                    </div>
                    <h3 className="h6 fw-bold mb-2 text-dark">Character Development</h3>
                    <p className="small text-muted mb-0">Contribute to character and leadership development programs</p>
                  </div>
                </Col>
                
                <Col md={4}>
                  <div className="impact-card text-center p-4 h-100" style={{
                    background: '#f8f9fa',
                    borderRadius: '20px',
                    transition: 'all 0.3s ease',
                    border: '1px solid rgba(5,2,101,0.08)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                  }}>
                    <div className="impact-icon mb-3" style={{
                      width: '70px',
                      height: '70px',
                      background: 'linear-gradient(135deg, #050265, #1a6bff)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto'
                    }}>
                      <i className="fas fa-chart-line" style={{ fontSize: '1.8rem', color: 'white' }} aria-hidden="true"></i>
                    </div>
                    <h3 className="h6 fw-bold mb-2 text-dark">Long-term Transformation</h3>
                    <p className="small text-muted mb-0">Participate in long-term transformation of young lives</p>
                  </div>
                </Col>
              </Row>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Ways to Partner With Us - 4 GRID LAYOUT */}
      <Container className='card-custom border-0 mb-5' fluid style={{
        background: 'linear-gradient(135deg, #050265, #120b5d, #1a6bff)',
        margin: '0 20px',
        borderRadius: '20px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
        width: 'calc(100% - 40px)'
      }} aria-labelledby="partnership-ways-heading">
        <div style={{ padding: '40px 20px' }}>
          <div className="text-center mb-4">
            <div className="d-inline-flex align-items-center justify-content-center mb-3" style={{
              width: '60px',
              height: '60px',
              background: 'rgba(255,255,255,0.15)',
              borderRadius: '50%',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <i className="fas fa-handshake" style={{ fontSize: '1.5rem', color: 'var(--gold)' }} aria-hidden="true"></i>
            </div>
            <h2 className="text-white" style={{
              fontSize: 'clamp(1.3rem, 4vw, 1.8rem)',
              fontWeight: 'bold',
              marginBottom: '0.5rem'
            }}>
              Ways to Partner With Us
            </h2>
            <p className="text-white" style={{ opacity: 0.9, fontSize: '0.9rem', maxWidth: '600px', margin: '0 auto' }}>
              Choose a partnership model that aligns with your organization's mission and goals
            </p>
          </div>
          
          <Row className="g-5">
            {partnershipCards.map((card, index) => (
              <Col key={index} md={6} lg={3}>
                <div className="partnership-card-white h-100" style={{
                  background: 'white',
                  borderRadius: '20px',
                  padding: '1.5rem',
                  textAlign: 'center',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                  height: '100%'
                }}>
                  <div className="partnership-icon mb-3" style={{ fontSize: '2.5rem' }} aria-hidden="true">{card.icon}</div>
                  <h3 className="card-title-navy h6 fw-bold mb-2">{card.title}</h3>
                  <p className="text-muted small mb-0">{card.description}</p>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </Container>

      {/* Testimonial Section */}
      <Container className="py-4">
        <div>
          <h2 id="partnership-steps-heading" className="section-heading mb-4 text-center">What our partners say</h2>
        </div>
        <Row className="justify-content-center">
          <Col lg={10}>
            <div className="sponsor-testimonial p-4 text-center rounded-4" style={{ 
              background: 'linear-gradient(135deg, #fff9e6 0%, var(--white) 100%)',
              border: '1px solid rgba(255,0,128,0.2)',
              position: 'relative'
            }} role="complementary" aria-label="Partner testimonial">
              <div className="sponsor-testimonial-quote" style={{ fontSize: '4rem', color: 'var(--gold)', position: 'absolute', top: '10px', left: '20px', opacity: 0.3, fontFamily: 'Georgia, serif' }} aria-hidden="true">"</div>
              <p className="sponsor-testimonial-text text-dark fst-italic mb-3" style={{ fontSize: '1rem', lineHeight: 1.6 }}>
                "Kitale Progressive School provides a structured and transparent platform for meaningful impact in education. Partnering with the school has demonstrated how focused support can contribute to both academic excellence and holistic learner development."
              </p>
              <div className="sponsor-testimonial-author fw-bold text-navy">Ola Zlobinska</div>
              <div className="sponsor-testimonial-title text-muted small">Education Partner since 2010</div>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Education with Purpose and Values */}
      <section className="section-padding" style={{ background: 'var(--white)' }}>
        <Container>
          <Row className="justify-content-center">
            <Col lg={10}>
              <div className="text-center mb-4">
                <div className="d-inline-flex align-items-center justify-content-center mb-3" style={{
                  width: '60px',
                  height: '60px',
                  background: 'rgba(13,101,251,0.1)',
                  borderRadius: '50%',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <i className="fas fa-church" style={{ fontSize: '1.5rem', color: 'var(--navy)' }} aria-hidden="true"></i>
                </div>
                <h2 className="section-heading mb-2">Education with Purpose and Values</h2>
              </div>
              <p className="lead text-center text-dark mb-3">
                At Kitale Progressive School, we believe education goes beyond academics. We are committed to nurturing character, values, and responsibility alongside strong academic foundations.
              </p>
              <p className="lead text-center text-dark">
                We welcome partnerships with faith-based organizations and mission-driven partners who share a vision of raising a generation grounded in purpose, integrity, and service.
              </p>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Our Commitment to Impact */}
      <section className="statistics-section py-4">
        <Container>
          <Row className="justify-content-center">
            <Col lg={10} className="text-center">
              <h2 className="h3 fw-bold mb-3 text-white">Our Commitment to Impact</h2>
              <p className="mb-4 text-white opacity-90">
                We are building structured programs that allow partners to make meaningful, measurable contributions in education.
              </p>
              <Row className="g-5 justify-content-center">
                <Col xs={6} md={3}>
                  <div className="text-center p-3" style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}>
                    <i className="fas fa-clipboard-list text-gold" style={{ fontSize: '2rem' }} aria-hidden="true"></i>
                    <p className="mt-2 mb-0 fw-bold text-white">Accountability</p>
                  </div>
                </Col>
                <Col xs={6} md={3}>
                  <div className="text-center p-3" style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}>
                    <i className="fas fa-eye text-gold" style={{ fontSize: '2rem' }} aria-hidden="true"></i>
                    <p className="mt-2 mb-0 fw-bold text-white">Transparency</p>
                  </div>
                </Col>
                <Col xs={6} md={3}>
                  <div className="text-center p-3" style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}>
                    <i className="fas fa-chart-bar text-gold" style={{ fontSize: '2rem' }} aria-hidden="true"></i>
                    <p className="mt-2 mb-0 fw-bold text-white">Long-term Impact</p>
                  </div>
                </Col>
              </Row>
            </Col>
          </Row>
        </Container>
      </section>

      {/* How Partnership Works - 4-Step Layout */}
      <section className="section-padding" style={{ background: 'var(--gray-light)' }} aria-labelledby="partnership-steps-heading">
        <Container>
          <h2 id="partnership-steps-heading" className="section-heading mb-4 text-center">
            How Partnership Works
          </h2>
          
          <Row className="g-5">
            {partnershipSteps.map((step, index) => (
              <StepCard key={index} {...step} />
            ))}
          </Row>
        </Container>
      </section>

      {/* Partnership Form Section */}
      <section id="partnership-form" className="section-padding" style={{ background: 'var(--white)' }}>
        <Container>
          <Row className="mb-4">
            <Col lg={8} className="mx-auto text-center">
              <h2 className="section-heading mb-2">Start a Partnership Conversation</h2>
              <p className="lead text-muted">
                Tell us about your interest, and our team will guide you on the best way to collaborate with Kitale Progressive School.
              </p>
            </Col>
          </Row>

          <Row>
            <Col lg={8} className="mx-auto">
              <AlertMessage
                show={submitStatus.show}
                success={submitStatus.success}
                message={submitStatus.message}
                onClose={handleDismissAlert}
              />

              <div className="form-container bg-white p-4 p-lg-5 rounded-4 shadow-sm">
                <form onSubmit={handleSubmit} noValidate aria-label="Partnership inquiry form">
                  <div className="mb-3">
                    <label htmlFor="input-fullName" className="form-label-custom fw-bold small text-navy mb-1">
                      Full Name <span className="text-gold" aria-hidden="true">*</span>
                      <span className="visually-hidden"> (required)</span>
                    </label>
                    <input
                      type="text"
                      id="input-fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      required
                      className="form-control-custom"
                      style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px' }}
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="input-email" className="form-label-custom fw-bold small text-navy mb-1">
                      Email Address <span className="text-gold" aria-hidden="true">*</span>
                      <span className="visually-hidden"> (required)</span>
                    </label>
                    <input
                      type="email"
                      id="input-email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      required
                      className="form-control-custom"
                      style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px' }}
                    />
                  </div>

                  {/* Phone Input */}
                  <div className="mb-3">
                    <label htmlFor="phone" className="form-label-custom fw-bold small text-navy mb-1">
                      Phone Number
                    </label>
                    <PhoneInput
                      id="phone"
                      international
                      defaultCountry="KE"
                      value={phone}
                      onChange={handlePhoneChange}
                      placeholder="712345678"
                      className="form-control-custom"
                      style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px' }}
                      aria-invalid={phoneError ? "true" : "false"}
                      aria-describedby={phoneError ? "phone-error" : "phone-help"}
                    />
                    {phoneError && (
                      <div id="phone-error" className="text-danger small mt-1" role="alert">{phoneError}</div>
                    )}
                    <div id="phone-help" className="text-muted small mt-1">
                      Enter exactly 9 digits after country code (e.g., 712345678)
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="input-organization" className="form-label-custom fw-bold small text-navy mb-1">
                      Organization
                    </label>
                    <input
                      type="text"
                      id="input-organization"
                      name="organization"
                      value={formData.organization}
                      onChange={handleChange}
                      placeholder="Enter your organization name"
                      className="form-control-custom"
                      style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px' }}
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="input-partnershipInterest" className="form-label-custom fw-bold small text-navy mb-1">
                      Partnership Interest <span className="text-gold" aria-hidden="true">*</span>
                      <span className="visually-hidden"> (required)</span>
                    </label>
                    <select
                      id="input-partnershipInterest"
                      name="partnershipInterest"
                      value={formData.partnershipInterest}
                      onChange={handleChange}
                      required
                      className="form-control-custom"
                      style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px' }}
                    >
                      <option value="">Select an option</option>
                      {partnershipOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="input-message" className="form-label-custom fw-bold small text-navy mb-1">
                      Your Message <span className="text-gold" aria-hidden="true">*</span>
                      <span className="visually-hidden"> (required)</span>
                    </label>
                    <textarea
                      id="input-message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us about your partnership goals and how you'd like to collaborate..."
                      required
                      rows={5}
                      className="form-control-custom"
                      style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px' }}
                    />
                  </div>

                  {/* Terms Checkbox - Using the fixed component */}
                  <TermsCheckbox 
                    checked={formData.agreeToTerms}
                    onChange={handleChange}
                    required={true}
                  />

                  {/* Reassurance line */}
                  <div className="text-center mb-4">
                    <p className="small text-muted">
                      <i className="fas fa-handshake me-1 text-gold" aria-hidden="true"></i>
                      All partnership programs are designed to complement the school's structured fee system while expanding access and impact.
                    </p>
                  </div>

                  <div className="text-center">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-navy"
                      style={{
                        minHeight: '48px',
                        minWidth: '220px'
                      }}
                      aria-label={submitting ? "Sending your inquiry" : "Start Partnership Discussion"}
                    >
                      {submitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          <span>Sending...</span>
                          <span className="visually-hidden">Please wait while we send your inquiry</span>
                        </>
                      ) : (
                        'Submit Partnership inquiry'
                      )}
                    </button>
                  </div>

                  <p className="text-center text-muted small mt-3 mb-0">
                    <i className="fas fa-lock me-1" aria-hidden="true"></i>
                    You'll sign in with Google to verify your identity and receive a confirmation email
                  </p>
                </form>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

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
        
        /* Hero Section with Background Image - Matching Other Pages */
        .partner-hero-section {
          position: relative;
          background: linear-gradient(135deg, #0d65fb 0%, #0a55d6 100%);
          min-height: 450px;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          overflow: hidden;
        }

        .partner-hero-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: url('/images/optimized/school.webp');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          filter: blur(0px);
          transform: scale(1.05);
          opacity: 1;
          z-index: 0;
        }

        .partner-hero-section::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(13, 101, 251, 0.6), rgba(10, 85, 214, 0.7));
          z-index: 1;
        }

        .partner-hero-content {
          position: relative;
          z-index: 2;
          max-width: 900px;
          margin: 0 auto;
          padding: 80px 20px;
          color: white;
        }

        .partner-hero-content h1 {
          font-size: clamp(2rem, 5vw, 3rem);
          font-weight: 700;
          margin-bottom: 1rem;
          color: white;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        }

        .partner-hero-content p {
          font-size: clamp(1rem, 4vw, 1.2rem);
          color: rgba(255, 255, 255, 0.95);
          line-height: 1.6;
          margin-bottom: 1rem;
          text-shadow: 0 1px 5px rgba(0, 0, 0, 0.2);
        }

        .partner-hero-content .hero-highlight {
          color: rgba(255, 255, 255, 0.95);
          font-weight: 600;
          font-size: 1rem;
          margin-bottom: 0.5rem;
        }

        /* Terms Checkbox Styling */
        .terms-checkbox-input {
          accent-color: #050265;
        }
        
        .terms-checkbox-input:focus {
          outline: 2px solid #0d65fb;
          outline-offset: 2px;
        }
        
        .partnership-card:hover,
        .step-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 35px rgba(13,101,251,0.1) !important;
        }
        
        .fade-in {
          animation: fadeIn 0.3s ease;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @media (max-width: 768px) {
          .partner-hero-content {
            padding: 60px 20px;
          }
          .section-heading {
            font-size: 1.6rem;
          }
        }
        
        @media (max-width: 576px) {
          .partner-hero-content {
            padding: 50px 20px;
          }
          .partner-hero-content h1 {
            font-size: 1.8rem;
          }
        }
        
        @media (prefers-reduced-motion: reduce) {
          .partnership-card,
          .step-card,
          .fade-in {
            transition: none !important;
            animation: none !important;
            transform: none !important;
          }
          .partnership-card:hover,
          .step-card:hover {
            transform: none;
          }
          .partner-hero-section::before {
            filter: blur(0px);
            transform: none;
          }
        }
      `}} />
    </>
  );
}

export default memo(Partner);