// pages/Partner.jsx - With Proper Theme Font Sizes
import { Helmet } from "react-helmet-async";
import { Container, Row, Col, Button } from "react-bootstrap";
import { useState, useCallback, memo, useEffect } from "react";
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

// Intersection observer hook
const useInView = ({ threshold = 0.1, triggerOnce = false }) => {
  const [ref, setRef] = useState(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!ref) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (entry.isIntersecting && triggerOnce) observer.disconnect();
      },
      { threshold }
    );
    observer.observe(ref);
    return () => observer.disconnect();
  }, [ref, threshold, triggerOnce]);

  return [setRef, inView];
};

// CountUp component
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
    return () => { if (animationFrame) cancelAnimationFrame(animationFrame); };
  }, [inView, end, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
};

// Stat Card component
const StatCard = memo(({ stat, index }) => {
  const [ref, inView] = useInView({ threshold: 0.3, triggerOnce: true });
  const cardId = `stat-${index}`;
  
  return (
    <Col md={3} className="text-center mb-3">
      <div ref={ref} className="stat-item text-center p-3 bg-white bg-opacity-10 rounded-3" role="article" aria-labelledby={cardId}>
        <div id={cardId} className="stat-number text-primary fw-bold display-6" aria-hidden="true">
          {inView ? <CountUp end={stat.value} suffix={stat.suffix} /> : `0${stat.suffix}`}
        </div>
        <div className="stat-label text-white small text-uppercase tracking-wide">{stat.label}</div>
        <span className="visually-hidden">{stat.value}{stat.suffix} {stat.label}</span>
      </div>
    </Col>
  );
});

StatCard.displayName = 'StatCard';

// Partnership Card component
const PartnershipCard = memo(({ icon, title, description }) => {
  const cardId = `partnership-${title.replace(/\s+/g, '-').toLowerCase()}`;
  
  return (
    <Col md={6} lg={3} className="mb-4">
      <div className="partnership-card-white" role="article" aria-labelledby={cardId} tabIndex={0}>
        <div className="partnership-icon mb-3" aria-hidden="true">{icon}</div>
        <h3 id={cardId} className="card-title-navy fw-bold mb-2">{title}</h3>
        <p className="text-muted mb-0 small">{description}</p>
      </div>
    </Col>
  );
});

PartnershipCard.displayName = 'PartnershipCard';

// Step Card component
const StepCard = memo(({ number, title, description }) => {
  const stepId = `step-${number}`;
  
  return (
    <Col md={6} lg={3} className="mb-4">
      <div className="step-card text-center p-4 h-100" role="article" aria-labelledby={stepId}>
        <div className="step-number mb-2" aria-hidden="true">{number}</div>
        <h3 id={stepId} className="card-title-navy fw-bold mb-2">{title}</h3>
        <p className="text-muted mb-0 small">{description}</p>
      </div>
    </Col>
  );
});

StepCard.displayName = 'StepCard';

// Terms Checkbox Component
const TermsCheckbox = memo(({ checked, onChange, required = true }) => {
  const checkboxId = "agreeToTerms";
  const errorId = `${checkboxId}-error`;
  const [touched, setTouched] = useState(false);
  const isInvalid = required && !checked && touched;
  
  return (
    <div className="mb-4">
      <div className="d-flex align-items-start">
        <input
          type="checkbox"
          id={checkboxId}
          name="agreeToTerms"
          checked={checked}
          onChange={onChange}
          onBlur={() => setTouched(true)}
          required={required}
          className="terms-checkbox-input"
          style={{ marginTop: '2px' }}
          aria-invalid={isInvalid ? "true" : "false"}
          aria-describedby={isInvalid ? errorId : undefined}
          aria-required="true"
        />
        <label htmlFor={checkboxId} className="mb-0 ms-2 small" style={{ cursor: 'pointer', lineHeight: '1.4' }}>
          I agree to the{' '}
          <Link to="/privacy-policy" target="_blank" className="text-navy text-decoration-underline">Privacy Policy</Link>
          {' '}and{' '}
          <Link to="/terms-of-service" target="_blank" className="text-navy text-decoration-underline">Terms of Service</Link>
          <span className="visually-hidden"> (required)</span>
          {required && <span className="text-danger ms-1" aria-hidden="true">*</span>}
        </label>
      </div>
      {isInvalid && (
        <div id={errorId} className="invalid-feedback d-block mt-1 small" role="alert">
          You must agree to the Privacy Policy and Terms of Service.
        </div>
      )}
    </div>
  );
});

TermsCheckbox.displayName = 'TermsCheckbox';

// Alert component
const AlertMessage = memo(({ show, success, message, onClose }) => {
  if (!show) return null;
  
  return (
    <div className={`sponsor-alert ${success ? 'sponsor-alert-success' : 'sponsor-alert-error'} mb-4 fade-in`} role="alert" aria-live="polite">
      <div className="d-flex align-items-center gap-2">
        <i className={`fas ${success ? 'fa-check-circle' : 'fa-exclamation-circle'}`} aria-hidden="true"></i>
        <span className="small">{message}</span>
      </div>
      <button onClick={onClose} className="sponsor-alert-close" aria-label="Close alert">×</button>
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
  return utf8ToBase64(emailContent).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

function Partner() {
  const [formData, setFormData] = useState({
    fullName: "", email: "", phone: "", organization: "", partnershipInterest: "", message: "", agreeToTerms: false
  });
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ show: false, success: false, message: "" });

  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_GMAIL_CLIENT_ID;
  const SPONSORSHIP_EMAIL = import.meta.env.VITE_SPONSORSHIP_EMAIL || 'ndiateresia@gmail.com';
  const GMAIL_SCOPES = import.meta.env.VITE_GMAIL_SCOPES || 'https://www.googleapis.com/auth/gmail.send';

  const partnershipOptions = [
    { value: "Student Sponsorship", label: "Student Sponsorship" },
    { value: "Infrastructure Support", label: "Infrastructure Support" },
    { value: "Strategic Partnership", label: "Strategic Partnership" },
    { value: "Faith-Based / Mission Partnership", label: "Faith-Based / Mission Partnership" },
    { value: "Other", label: "Other" }
  ];

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  }, []);

  const handlePhoneChange = useCallback((value) => {
    setPhone(value);
    setPhoneError("");
    if (value) {
      try {
        const phoneNumber = parsePhoneNumber(value);
        if (phoneNumber && phoneNumber.nationalNumber.length !== 9) {
          setPhoneError("Phone number must be exactly 9 digits after country code");
        } else {
          setFormData(prev => ({ ...prev, phone: value }));
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

  const getDisplayPartnershipInterest = useCallback(() => formData.partnershipInterest || 'Not specified', [formData.partnershipInterest]);

  const createEmailContents = useCallback(() => {
    const currentDate = new Date().toLocaleDateString('en-KE', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    const displayInterest = getDisplayPartnershipInterest();
    const formattedPhone = formData.phone || 'Not provided';

    const schoolHtmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px; padding: 20px; background: linear-gradient(135deg, #0d65fb 0%, #0a55d6 100%); border-radius: 10px;">
          <h2 style="color: white; margin: 0;">Kitale Progressive School</h2>
          <p style="color: #ff0080; margin: 5px 0 0;">In Pursuit of Excellence</p>
        </div>
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h3 style="color: #0d65fb; border-bottom: 2px solid #0d65fb; padding-bottom: 10px;">New Partnership Inquiry</h3>
          <p><strong>Date:</strong> ${currentDate}</p>
          <h4 style="color: #0d65fb;">Partner Information</h4>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px; background: #f5f5f5; font-weight: bold;">Full Name:</td><td style="padding: 8px;">${formData.fullName}Zoey</tr>
            <tr><td style="padding: 8px; background: #f5f5f5; font-weight: bold;">Email:</td><td style="padding: 8px;">${formData.email}Zoey</tr>
            <tr><td style="padding: 8px; background: #f5f5f5; font-weight: bold;">Phone:</td><td style="padding: 8px;">${formattedPhone}Zoey</tr>
            ${formData.organization ? `<tr><td style="padding: 8px; background: #f5f5f5; font-weight: bold;">Organization:</td><td style="padding: 8px;">${formData.organization}Zoey</tr>` : ''}
            <tr><td style="padding: 8px; background: #f5f5f5; font-weight: bold;">Partnership Interest:</td><td style="padding: 8px;">${displayInterest}Zoey</td>
          </table>
          <h4 style="color: #0d65fb;">Message</h4>
          <div style="background: #f9f9f9; padding: 15px; border-left: 4px solid #0d65fb;">${formData.message.replace(/\n/g, '<br>')}</div>
        </div>
      </div>
    `;

    const partnerHtmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px; padding: 30px; background: linear-gradient(135deg, #0d65fb 0%, #0a55d6 100%); border-radius: 15px;">
          <h1 style="color: white; margin: 0;">Thank You!</h1>
          <p style="color: #ff0080; margin: 10px 0 0;">Partnership Inquiry Received</p>
        </div>
        <div style="background-color: white; padding: 40px; border-radius: 15px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
          <p>Dear <strong style="color: #0d65fb;">${formData.fullName}</strong>,</p>
          <p>Thank you for reaching out to explore a partnership with Kitale Progressive School.</p>
          <h3 style="color: #0d65fb;">What Happens Next:</h3>
          <ol>
            <li>A member of our Partnership Team will contact you within 24-48 hours.</li>
            <li>We will discuss your goals and align them with priority areas.</li>
            <li>Together, we will define the scope, outcomes, and implementation plan.</li>
            <li>We will provide structured updates and accountability throughout our partnership.</li>
          </ol>
          <p>We look forward to building a meaningful partnership that transforms young lives.</p>
          <p>With gratitude,<br/><strong>The Partnership Team</strong><br/>Kitale Progressive School</p>
        </div>
      </div>
    `;

    return { school: { html: schoolHtmlContent, text: "" }, partner: { html: partnerHtmlContent, text: "" } };
  }, [formData, getDisplayPartnershipInterest]);

  const login = useGoogleLogin({
    clientId: GOOGLE_CLIENT_ID,
    scope: GMAIL_SCOPES,
    onSuccess: async (tokenResponse) => {
      setSubmitting(true);
      try {
        const emailContents = createEmailContents();
        const schoolEncodedEmail = await createEmailWithContent(
          SPONSORSHIP_EMAIL, formData.email,
          `NEW PARTNERSHIP INQUIRY: ${formData.fullName} - ${getDisplayPartnershipInterest()}`,
          emailContents.school.html, emailContents.school.text
        );
        await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${tokenResponse.access_token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ raw: schoolEncodedEmail })
        });
        
        const partnerEncodedEmail = await createEmailWithContent(
          formData.email, formData.email,
          `Partnership Inquiry Received - Kitale Progressive School`,
          emailContents.partner.html, emailContents.partner.text
        );
        await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${tokenResponse.access_token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ raw: partnerEncodedEmail })
        }).catch(err => console.warn("Partner confirmation warning:", err));

        setSubmitStatus({ show: true, success: true, message: `Thank you! A confirmation email has been sent to ${formData.email}.` });
        setFormData({ fullName: "", email: "", phone: "", organization: "", partnershipInterest: "", message: "", agreeToTerms: false });
        setPhone("");
      } catch (error) {
        setSubmitStatus({ show: true, success: false, message: error.message || "Error sending inquiry. Please try again." });
      } finally {
        setSubmitting(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    onError: (errorResponse) => {
      let errorMessage = "Google sign-in failed. ";
      if (errorResponse?.error === 'popup_blocked_by_browser') errorMessage += "Please allow popups.";
      else if (errorResponse?.error === 'access_denied') errorMessage += "You denied access.";
      else errorMessage += "Please try again.";
      setSubmitStatus({ show: true, success: false, message: errorMessage });
      setSubmitting(false);
    }
  });

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.message || !formData.partnershipInterest) {
      setSubmitStatus({ show: true, success: false, message: "Please fill in all required fields." });
      return;
    }
    if (phone && phoneError) {
      setSubmitStatus({ show: true, success: false, message: phoneError });
      return;
    }
    if (!formData.agreeToTerms) {
      setSubmitStatus({ show: true, success: false, message: "Please agree to the Privacy Policy and Terms of Service." });
      return;
    }
    if (!GOOGLE_CLIENT_ID) {
      setSubmitStatus({ show: true, success: false, message: "Configuration error. Please contact support." });
      return;
    }
    login();
  }, [formData, phone, phoneError, login, GOOGLE_CLIENT_ID]);

  const partnershipCards = [
    { icon: "🎓", title: "Student Sponsorship Program", description: "Support deserving bright learners through structured sponsorship." },
    { icon: "🏗️", title: "Resource & Infrastructure Partnerships", description: "Partner to improve classrooms, libraries, and technology." },
    { icon: "🤝", title: "Strategic & Institutional Partnerships", description: "Collaborate on education programs and development initiatives." },
    { icon: "⛪", title: "Faith-Based & Mission Partnerships", description: "Support holistic education nurturing excellence and values." }
  ];

  const partnershipSteps = [
    { number: "01", title: "Expression of Interest", description: "Submit your interest through our partnership form." },
    { number: "02", title: "Needs Alignment", description: "We align your goals with priority areas." },
    { number: "03", title: "Program Structuring", description: "Define scope, outcomes, and implementation plan." },
    { number: "04", title: "Implementation & Reporting", description: "Execute and provide structured updates." }
  ];

  const impactPoints = [
    { icon: "fa-graduation-cap", title: "Quality Education Access", desc: "Support access to quality education for deserving learners" },
    { icon: "fa-star", title: "Character Development", desc: "Contribute to character and leadership programs" },
    { icon: "fa-chart-line", title: "Long-term Transformation", desc: "Participate in transformation of young lives" }
  ];

  return (
    <>
      <Helmet>
        <title>Partner With Us | Sponsorship & Partnerships | Kitale Progressive School</title>
        <meta name="description" content="Partner with Kitale Progressive School through student sponsorship, infrastructure support, strategic partnerships, or faith-based missions." />
      </Helmet>

      <section className="partner-hero-section" aria-labelledby="page-title">
        <div className="partner-hero-content">
          <h1 id="page-title">Partner With Kitale Progressive School</h1>
          <p>We collaborate with organizations, foundations, and faith-based partners to expand access to quality education and build lasting impact.</p>
          <div className="hero-highlight">Structured programs. Shared values. Measurable impact.</div>
          <div className="hero-button mt-3">
            <Button href="#partnership-form" className="btn-navy">Start a Partnership Conversation</Button>
          </div>
        </div>
      </section>

      <section className="section-padding py-5 bg-light-custom">
        <Container>
          <Row className="justify-content-center">
            <Col lg={10}>
              <div className="text-center mb-4">
                <div className="d-inline-flex align-items-center justify-content-center mb-3 rounded-circle bg-navy-light p-3">
                  <i className="fas fa-building fa-2x text-navy" aria-hidden="true"></i>
                </div>
                <h2 className="section-heading mb-2">A Private School with a Purpose-Driven Impact Arm</h2>
              </div>
              <p className="text-center text-dark">Kitale Progressive School is a private institution committed to academic excellence. We provide structured opportunities for partners to support deserving learners and strategic school development.</p>
            </Col>
          </Row>
        </Container>
      </section>

      <section className="section-padding py-5 bg-white">
        <Container>
          <Row className="justify-content-center">
            <Col lg={10} xl={8}>
              <div className="text-center mb-5">
                <div className="d-inline-flex align-items-center justify-content-center mb-3 rounded-circle bg-gradient-light p-3">
                  <i className="fas fa-hand-holding-heart fa-2x text-primary" aria-hidden="true"></i>
                </div>
                <h2 className="section-heading mb-3">An Opportunity to Make Lasting Impact</h2>
                <p className="text-left text-muted">We provide structured opportunities for partners to contribute meaningfully to education as a strategic investment.</p>
              </div>
              <Row className="g-5 justify-content-center">
                {impactPoints.map((point, idx) => (
                  <Col key={idx} md={4}>
                    <div className="impact-card text-center p-4 h-100">
                      <div className="impact-icon mx-auto mb-3">
                        <i className={`fas ${point.icon} fa-2x text-white`} aria-hidden="true"></i>
                      </div>
                      <h3 className="impact-card-title">{point.title}</h3>
                      <p className="impact-card-text">{point.desc}</p>
                    </div>
                  </Col>
                ))}
              </Row>
            </Col>
          </Row>
        </Container>
      </section>

      <div className="partnership-section-wrapper mb-5">
        <Container fluid className="px-0">
          <div className="bg-gradient-primary mx-3 rounded-4 p-4 p-md-5">
            <div className="text-center mb-4">
              <div className="d-inline-flex align-items-center justify-content-center mb-3 rounded-circle bg-white bg-opacity-15 p-3">
                <i className="fas fa-handshake fa-2x text-gold" aria-hidden="true"></i>
              </div>
              <h2 className="text-white section-heading">Ways to Partner With Us</h2>
              <p className="text-white opacity-75 small">Choose a partnership model that aligns with your mission and goals</p>
            </div>
            <Row className="g-4">
              {partnershipCards.map((card, index) => (
                <PartnershipCard key={index} {...card} />
              ))}
            </Row>
          </div>
        </Container>
      </div>

      <Container className="py-4">
        <h2 className="section-heading text-center mb-4">What Our Partners Say</h2>
        <Row className="justify-content-center">
          <Col lg={10}>
            <div className="sponsor-testimonial text-center p-4 rounded-4">
              <div className="sponsor-testimonial-quote" aria-hidden="true">"</div>
              <p className="sponsor-testimonial-text fst-italic mb-3">Kitale Progressive School provides a structured and transparent platform for meaningful impact. Partnering has demonstrated how focused support can contribute to both academic excellence and holistic development.</p>
              <div className="sponsor-testimonial-author fw-bold text-navy">Ola Zlobinska</div>
              <div className="sponsor-testimonial-title text-muted small">Education Partner since 2010</div>
            </div>
          </Col>
        </Row>
      </Container>

      <section className="section-padding bg-white">
        <Container>
          <Row className="justify-content-center">
            <Col lg={10}>
              <div className="text-center mb-4">
                <div className="d-inline-flex align-items-center justify-content-center mb-3 rounded-circle bg-navy-light p-3">
                  <i className="fas fa-church fa-2x text-navy" aria-hidden="true"></i>
                </div>
                <h2 className="section-heading mb-2">Education with Purpose and Values</h2>
              </div>
              <p className="text-left text-dark mb-3">At Kitale Progressive School, we believe education goes beyond academics. We nurture character, values, and responsibility alongside academic foundations.</p>
              <p className="text-left text-dark">We welcome faith-based organizations and mission-driven partners who share a vision of raising a generation grounded in purpose, integrity, and service.</p>
            </Col>
          </Row>
        </Container>
      </section>

      <section className="statistics-section py-4">
        <Container>
          <Row className="justify-content-center">
            <Col lg={10} className="text-center">
              <h2 className="fw-bold mb-3 text-white section-heading">Our Commitment to Impact</h2>
              <p className="mb-4 text-white opacity-75 small">Building structured programs for meaningful, measurable contributions in education</p>
              <Row className="g-4 justify-content-center">
                <Col xs={12} sm={6} md={3}>
                  <div className="text-center p-3 bg-white bg-opacity-10 rounded-3">
                    <i className="fas fa-clipboard-list fa-2x text-gold mb-2 d-block" aria-hidden="true"></i>
                    <p className="mb-0 fw-bold text-white small">Accountability</p>
                  </div>
                </Col>
                <Col xs={12} sm={6} md={3}>
                  <div className="text-center p-3 bg-white bg-opacity-10 rounded-3">
                    <i className="fas fa-eye fa-2x text-gold mb-2 d-block" aria-hidden="true"></i>
                    <p className="mb-0 fw-bold text-white small">Transparency</p>
                  </div>
                </Col>
                <Col xs={12} sm={6} md={3}>
                  <div className="text-center p-3 bg-white bg-opacity-10 rounded-3">
                    <i className="fas fa-chart-bar fa-2x text-gold mb-2 d-block" aria-hidden="true"></i>
                    <p className="mb-0 fw-bold text-white small">Long-term Impact</p>
                  </div>
                </Col>
              </Row>
            </Col>
          </Row>
        </Container>
      </section>

      <section className="section-padding bg-light-custom">
        <Container>
          <h2 className="section-heading text-center mb-4">How Partnership Works</h2>
          <Row className="g-4">
            {partnershipSteps.map((step, index) => (
              <StepCard key={index} {...step} />
            ))}
          </Row>
        </Container>
      </section>

      <section id="partnership-form" className="section-padding bg-white">
        <Container>
          <Row className="mb-4">
            <Col lg={8} className="mx-auto text-center">
              <h2 className="section-heading mb-2">Start a Partnership Conversation</h2>
              <p className="text-muted">Tell us about your interest, and our team will guide you on collaboration opportunities.</p>
            </Col>
          </Row>
          <Row>
            <Col lg={8} className="mx-auto">
              <AlertMessage show={submitStatus.show} success={submitStatus.success} message={submitStatus.message} onClose={handleDismissAlert} />
              <div className="form-container">
                <form onSubmit={handleSubmit} noValidate>
                  <div className="mb-3">
                    <label htmlFor="input-fullName" className="form-label-custom">Full Name <span className="text-gold">*</span></label>
                    <input type="text" id="input-fullName" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Enter your full name" required className="form-control-custom" />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="input-email" className="form-label-custom">Email Address <span className="text-gold">*</span></label>
                    <input type="email" id="input-email" name="email" value={formData.email} onChange={handleChange} placeholder="Enter your email" required className="form-control-custom" />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="phone" className="form-label-custom">Phone Number</label>
                    <PhoneInput id="phone" international defaultCountry="KE" value={phone} onChange={handlePhoneChange} placeholder="712345678" className={`form-control-custom ${phoneError ? 'is-invalid' : ''}`} />
                    {phoneError && <div className="text-danger small mt-1">{phoneError}</div>}
                    <div className="text-muted small mt-1">Enter exactly 9 digits after country code</div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="input-organization" className="form-label-custom">Organization</label>
                    <input type="text" id="input-organization" name="organization" value={formData.organization} onChange={handleChange} placeholder="Enter your organization name" className="form-control-custom" />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="input-partnershipInterest" className="form-label-custom">Partnership Interest <span className="text-gold">*</span></label>
                    <select id="input-partnershipInterest" name="partnershipInterest" value={formData.partnershipInterest} onChange={handleChange} required className="form-control-custom">
                      <option value="">Select an option</option>
                      {partnershipOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="input-message" className="form-label-custom">Your Message <span className="text-gold">*</span></label>
                    <textarea id="input-message" name="message" value={formData.message} onChange={handleChange} placeholder="Tell us about your partnership goals..." required rows={5} className="form-control-custom" />
                  </div>

                  <TermsCheckbox checked={formData.agreeToTerms} onChange={handleChange} required={true} />

                  <div className="text-center mb-4">
                    <p className="small text-muted"><i className="fas fa-handshake me-1 text-gold" aria-hidden="true"></i> Partnership programs complement the school's structured fee system while expanding access and impact.</p>
                  </div>

                  <div className="text-center">
                    <button type="submit" disabled={submitting} className="btn-navy" style={{ minWidth: '220px' }}>
                      {submitting ? <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Sending...</> : 'Submit Partnership Inquiry'}
                    </button>
                  </div>

                  <p className="text-center text-muted small mt-3 mb-0"><i className="fas fa-lock me-1" aria-hidden="true"></i>You'll sign in with Google to verify your identity and receive confirmation</p>
                </form>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      <style dangerouslySetInnerHTML={{ __html: `
        .bg-navy-light { background: rgba(13, 101, 251, 0.1); }
        .bg-gradient-light { background: linear-gradient(135deg, rgba(5,2,101,0.1), rgba(26,107,255,0.1)); }
        .bg-gradient-primary { background: linear-gradient(135deg, #050265, #120b5d, #1a6bff); }
        .bg-white.bg-opacity-10 { background: rgba(255,255,255,0.1); }
        .bg-white.bg-opacity-15 { background: rgba(255,255,255,0.15); }
        .section-title-underline { width: 60px; height: 3px; background: var(--gold); margin: 1rem auto; border-radius: 2px; }
        .rounded-circle { border-radius: 50%; }
        .mx-3 { margin-left: 1rem; margin-right: 1rem; }
        .rounded-4 { border-radius: 1rem; }
        .opacity-75 { opacity: 0.75; }
      `}} />
    </>
  );
}

export default memo(Partner);