// pages/Apply.jsx - Complete Admissions Application Page
import { Helmet } from "react-helmet-async";
import { Container, Row, Col, Form, Button, Card, Alert } from "react-bootstrap";
import { useState, useEffect, useCallback, memo, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { useGoogleLogin } from '@react-oauth/google';
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import parsePhoneNumber from 'libphonenumber-js';

const GetInTouch = lazy(() => import("../components/GetInTouch"));

// ==================== HELPER FUNCTIONS ====================
const utf8ToBase64 = (str) => {
  const utf8Bytes = new TextEncoder().encode(str);
  let binaryString = '';
  for (let i = 0; i < utf8Bytes.length; i++) {
    binaryString += String.fromCharCode(utf8Bytes[i]);
  }
  return btoa(binaryString);
};

const getImageBase64 = (imagePath) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const dataURL = canvas.toDataURL('image/jpeg');
      resolve(dataURL);
    };
    img.onerror = reject;
    img.src = imagePath;
  });
};

// ==================== FORM INPUT COMPONENT ====================
const FormInput = memo(({ 
  label, type = "text", name, value, onChange, placeholder, required = false,
  feedback, as, options, describedBy, autoComplete, max, min
}) => {
  const id = `input-${name}`;
  const errorId = `${id}-error`;
  
  return (
    <Form.Group controlId={id} className="mb-3">
      <Form.Label className="form-label-custom">
        {label} {required && <span className="text-gold" aria-hidden="true">*</span>}
        {required && <span className="visually-hidden"> (required)</span>}
      </Form.Label>
      {as === 'select' ? (
        <Form.Select 
          required={required}
          name={name}
          value={value}
          onChange={onChange}
          className="form-control-custom"
          aria-describedby={required && !value ? errorId : undefined}
          autoComplete={autoComplete}
        >
          <option value="">Select</option>
          {options?.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </Form.Select>
      ) : (
        <Form.Control 
          as={as}
          type={type}
          required={required}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="form-control-custom"
          rows={as === 'textarea' ? 3 : undefined}
          aria-describedby={required && !value ? errorId : undefined}
          autoComplete={autoComplete}
          max={max}
          min={min}
        />
      )}
      {required && (
        <Form.Control.Feedback type="invalid" id={errorId} role="alert" className="small">
          {feedback || `Please enter ${label.toLowerCase()}`}
        </Form.Control.Feedback>
      )}
    </Form.Group>
  );
});

FormInput.displayName = 'FormInput';

// ==================== PHONE INPUT FIELD ====================
const PhoneInputField = memo(({ phone, onChange, error, validated }) => {
  const id = "phone-input-field";
  const errorId = `${id}-error`;
  const helpId = `${id}-help`;
  
  return (
    <div className="mb-3">
      <label htmlFor={id} className="form-label-custom mb-2 d-block">
        Phone Number <span className="text-gold" aria-hidden="true">*</span>
        <span className="visually-hidden"> (required)</span>
      </label>
      <PhoneInput
        id={id}
        international
        defaultCountry="KE"
        value={phone}
        onChange={onChange}
        placeholder="712345678"
        className={`form-control-custom ${validated && (!phone || error) ? 'is-invalid' : ''}`}
        limitMaxLength={true}
        aria-invalid={validated && (!phone || error) ? "true" : "false"}
        aria-describedby={`${errorId} ${helpId}`}
        aria-required="true"
      />
      {validated && !phone && (
        <div id={errorId} className="invalid-feedback d-block mt-1 small" role="alert">
          Phone number is required.
        </div>
      )}
      {error && (
        <div id={errorId} className="invalid-feedback d-block mt-1 small" role="alert">
          {error}
        </div>
      )}
      <div id={helpId} className="text-muted small mt-1">
        Enter 9 digits after country code (e.g., 712345678)
      </div>
    </div>
  );
});

PhoneInputField.displayName = 'PhoneInputField';

// ==================== PROGRESS INDICATOR ====================
const ProgressIndicator = memo(({ currentStep, totalSteps = 4 }) => {
  const steps = [
    { number: 1, label: "Parent Info" },
    { number: 2, label: "Child Info" },
    { number: 3, label: "Medical Info" },
    { number: 4, label: "Review" }
  ];
  
  return (
    <div className="progress-indicator" role="region" aria-label="Application progress">
      <div className="d-flex justify-content-between align-items-center">
        {steps.map((step) => (
          <div key={step.number} className="text-center" style={{ flex: 1 }}>
            <div 
              className={`step-circle mx-auto mb-2 ${currentStep >= step.number ? 'completed' : ''}`}
              aria-current={currentStep === step.number ? "step" : undefined}
            >
              {step.number}
            </div>
            <div className="small text-muted d-none d-md-block">{step.label}</div>
          </div>
        ))}
      </div>
      <div className="progress mt-2">
        <div 
          className="progress-bar" 
          role="progressbar"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          aria-valuenow={(currentStep / totalSteps) * 100}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
});

ProgressIndicator.displayName = 'ProgressIndicator';

// ==================== SIMPLE CHECKBOX ====================
const SimpleCheckbox = memo(({ label, name, checked, onChange, id }) => {
  const checkboxId = id || `checkbox-${name}`;
  
  return (
    <div className="mb-3">
      <div className="d-flex align-items-center">
        <input
          type="checkbox"
          id={checkboxId}
          name={name}
          checked={checked}
          onChange={onChange}
          className="terms-checkbox-input"
        />
        <label htmlFor={checkboxId} className="mb-0 ms-2 small">
          {label}
        </label>
      </div>
    </div>
  );
});

SimpleCheckbox.displayName = 'SimpleCheckbox';

// ==================== TERMS CHECKBOX ====================
const TermsCheckbox = memo(({ checked, onChange, required = false }) => {
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
        <label htmlFor={checkboxId} className="mb-0 ms-2 small">
          I confirm that the information provided is accurate and I agree to the Terms of Service and Privacy Policy
          {required && <span className="text-gold ms-1" aria-hidden="true">*</span>}
          {required && <span className="visually-hidden"> (required)</span>}
        </label>
      </div>
      <div className="mt-2 ms-4">
        <Link to="/terms-of-service" target="_blank" className="text-navy me-3 small">
          View Terms of Service
        </Link>
        <Link to="/privacy-policy" target="_blank" className="text-navy small">
          View Privacy Policy
        </Link>
      </div>
      {isInvalid && (
        <div id={errorId} className="invalid-feedback d-block mt-1 small" role="alert">
          Please agree to the terms and conditions
        </div>
      )}
    </div>
  );
});

TermsCheckbox.displayName = 'TermsCheckbox';

// ==================== STATUS ALERT ====================
const StatusAlert = memo(({ show, success, message, onClose }) => {
  if (!show) return null;
  
  return (
    <Alert 
      variant={success ? "success" : "danger"} 
      dismissible 
      onClose={onClose}
      className="mb-4 fade-in"
      role="alert"
      aria-live="polite"
    >
      <div className="d-flex align-items-center gap-2">
        <i className={`fas ${success ? 'fa-check-circle' : 'fa-exclamation-circle'}`} aria-hidden="true"></i>
        <div>{message}</div>
      </div>
    </Alert>
  );
});

StatusAlert.displayName = 'StatusAlert';

// ==================== INITIAL FORM STATE ====================
const INITIAL_FORM_STATE = {
  parentName: "", 
  email: "", 
  phone: "", 
  address: "", 
  relationship: "",
  childName: "", 
  dateOfBirth: "", 
  gender: "", 
  nationality: "", 
  otherNationality: "",
  previousSchool: "", 
  gradeApplying: "", 
  stayStatus: "", 
  hasAllergies: false, 
  allergyDetails: "", 
  medicalConditions: "",
  agreeToTerms: false
};

function Apply() {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [validated, setValidated] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [applicationCounter, setApplicationCounter] = useState(1);
  const [submitStatus, setSubmitStatus] = useState({ show: false, success: false, message: "" });
  const [logoBase64, setLogoBase64] = useState(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [dateError, setDateError] = useState("");

  // ==================== ENVIRONMENT VARIABLES ====================
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const ADMISSIONS_EMAIL = import.meta.env.VITE_ADMISSIONS_EMAIL || 'ndiateresia@gmail.com';
  const GMAIL_SCOPES = import.meta.env.VITE_GMAIL_SCOPES || 'https://www.googleapis.com/auth/gmail.send';
  const SITE_URL = import.meta.env.VITE_SITE_URL || window.location.origin;

  // Validate Google Client ID on mount
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === '') {
      console.warn('⚠️ Google Client ID is not configured. Please add VITE_GOOGLE_CLIENT_ID to your .env file.');
    } else {
      console.log('✅ Google Client ID is configured');
    }
  }, [GOOGLE_CLIENT_ID]);

  // ==================== HELPER FUNCTIONS ====================
  const getTodayDate = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  };

  const getMinDate = () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 100);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const validateDateOfBirth = useCallback((dateString) => {
    if (!dateString) return true;
    const selectedDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate > today) {
      setDateError("Date of birth cannot be in the future");
      return false;
    }
    setDateError("");
    return true;
  }, []);

  // ==================== LOAD LOGO ====================
  useEffect(() => {
    const loadLogo = async () => {
      try {
        const base64 = await getImageBase64('/images/optimized/logo.jpg');
        setLogoBase64(base64);
      } catch (error) {
        console.warn('Could not load logo:', error);
      }
    };
    loadLogo();
  }, []);

  useEffect(() => {
    try {
      const lastNumber = localStorage.getItem('lastApplicationNumber');
      setApplicationCounter(lastNumber ? parseInt(lastNumber) + 1 : 1);
    } catch (error) {
      setApplicationCounter(1);
    }
  }, []);

  // ==================== HANDLERS ====================
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'dateOfBirth') validateDateOfBirth(value);
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  }, [validateDateOfBirth]);

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

  const getStayStatusOptions = useCallback(() => {
    const { gradeApplying: grade } = formData;
    if (grade === "Playgroup") return [{ value: "full-day", label: "Full Day" }, { value: "half-day", label: "Half Day" }];
    if (["PP1", "PP2"].includes(grade)) return [{ value: "day", label: "Day Scholar" }];
    if (grade?.startsWith("Grade")) return [{ value: "day", label: "Day Scholar" }, { value: "boarding", label: "Boarding" }];
    return [];
  }, [formData.gradeApplying]);

  const validateStep = useCallback((step) => {
    if (step === 1) return formData.parentName && formData.email && formData.phone && formData.relationship;
    if (step === 2) return formData.childName && formData.dateOfBirth && !dateError && formData.gender && formData.gradeApplying;
    if (step === 3) return true; // Medical info is optional
    return true;
  }, [formData, dateError]);

  const handleNextStep = useCallback((e) => {
    e.preventDefault();
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    } else {
      setValidated(true);
      setSubmitStatus({ show: true, success: false, message: "Please complete all required fields before proceeding." });
      setTimeout(() => setSubmitStatus(prev => ({ ...prev, show: false })), 3000);
    }
  }, [currentStep, validateStep]);

  const handlePrevStep = useCallback((e) => {
    e.preventDefault();
    setCurrentStep(prev => Math.max(prev - 1, 1));
  }, []);

  // ==================== GENERATE PDF ====================
  const generatePDF = useCallback(async () => {
    try {
      const jsPDFModule = await import("jspdf");
      const jsPDF = jsPDFModule.default;
      const doc = new jsPDF();
      
      if (logoBase64) doc.addImage(logoBase64, 'JPEG', 14, 10, 40, 40);
      doc.setFontSize(20);
      doc.setTextColor(13, 101, 251);
      doc.text('Kitale Progressive School', 60, 25);
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text('Admission Application Form', 60, 35);
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(`Application #: KPS/${new Date().getFullYear()}/${String(applicationCounter).padStart(4, '0')}`, 14, 55);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 62);
      
      let yPos = 75;
      doc.setFontSize(12);
      doc.setTextColor(13, 101, 251);
      doc.text('Parent/Guardian Information', 14, yPos);
      yPos += 8;
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(`Name: ${formData.parentName || 'Not provided'}`, 14, yPos);
      yPos += 6;
      doc.text(`Email: ${formData.email || 'Not provided'}`, 14, yPos);
      yPos += 6;
      doc.text(`Phone: ${formData.phone || 'Not provided'}`, 14, yPos);
      yPos += 6;
      doc.text(`Relationship: ${formData.relationship || 'Not provided'}`, 14, yPos);
      yPos += 6;
      doc.text(`Address: ${formData.address || 'Not provided'}`, 14, yPos);
      
      yPos += 12;
      doc.setFontSize(12);
      doc.setTextColor(13, 101, 251);
      doc.text('Child Information', 14, yPos);
      yPos += 8;
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(`Name: ${formData.childName || 'Not provided'}`, 14, yPos);
      yPos += 6;
      doc.text(`Date of Birth: ${formData.dateOfBirth || 'Not provided'}`, 14, yPos);
      yPos += 6;
      doc.text(`Gender: ${formData.gender || 'Not provided'}`, 14, yPos);
      yPos += 6;
      doc.text(`Nationality: ${formData.nationality === 'Other' ? formData.otherNationality : formData.nationality || 'Not provided'}`, 14, yPos);
      yPos += 6;
      doc.text(`Previous School: ${formData.previousSchool || 'Not provided'}`, 14, yPos);
      yPos += 6;
      doc.text(`Grade Applying: ${formData.gradeApplying || 'Not provided'}`, 14, yPos);
      yPos += 6;
      if (formData.stayStatus) {
        const statusMap = { 'full-day': 'Full Day', 'half-day': 'Half Day', 'boarding': 'Boarding', 'day': 'Day Scholar' };
        doc.text(`Stay Status: ${statusMap[formData.stayStatus] || formData.stayStatus}`, 14, yPos);
        yPos += 6;
      }
      
      yPos += 12;
      doc.setFontSize(12);
      doc.setTextColor(13, 101, 251);
      doc.text('Medical Information', 14, yPos);
      yPos += 8;
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(`Allergies: ${formData.hasAllergies ? 'Yes' : 'No'}`, 14, yPos);
      yPos += 6;
      if (formData.hasAllergies && formData.allergyDetails) {
        doc.text(`Allergy Details: ${formData.allergyDetails}`, 14, yPos);
        yPos += 6;
      }
      if (formData.medicalConditions) {
        doc.text(`Medical Conditions: ${formData.medicalConditions}`, 14, yPos);
        yPos += 6;
      }
      
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text('This is an automatically generated application confirmation.', 14, 280);
      doc.text('Please keep this for your records.', 14, 286);
      
      return doc;
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Could not generate PDF. Please try again.');
    }
  }, [formData, applicationCounter, logoBase64]);

  // ==================== SEND EMAIL ====================
  const sendEmailViaGmail = useCallback(async (accessToken, pdfDoc) => {
    try {
      const pdfOutput = pdfDoc.output('datauristring');
      const pdfBase64 = pdfOutput.split(',')[1];
      const applicationRef = `KPS/${new Date().getFullYear()}/${String(applicationCounter).padStart(4, '0')}`;
      
      const emailContent = `
        <html><body>
          <h2 style="color:#0d65fb;">Application Received</h2>
          <p>Dear ${formData.parentName},</p>
          <p>Thank you for submitting an application for <strong>${formData.childName}</strong> to Kitale Progressive School.</p>
          <p><strong>Application Reference:</strong> ${applicationRef}</p>
          <p><strong>Grade Applying For:</strong> ${formData.gradeApplying}</p>
          <h3>Next Steps:</h3>
          <ol>
            <li>Our team will review your application within 2-3 business days.</li>
            <li>You will receive a follow-up call or email to discuss the next steps.</li>
            <li>We may invite you for a school tour or assessment.</li>
          </ol>
          <p>Please find attached a copy of your application for your records.</p>
          <p>Warm regards,<br>Admissions Office<br>Kitale Progressive School</p>
        </body></html>
      `;
      
      const emailBoundary = `boundary_${Date.now()}`;
      const emailData = [
        `From: Kitale Progressive School <${ADMISSIONS_EMAIL}>`,
        `To: ${formData.email}`,
        `Cc: ${ADMISSIONS_EMAIL}`,
        `Subject: Application Received - ${formData.childName} - ${applicationRef}`,
        'MIME-Version: 1.0',
        `Content-Type: multipart/mixed; boundary="${emailBoundary}"`,
        '',
        `--${emailBoundary}`,
        'Content-Type: text/html; charset="UTF-8"',
        '',
        emailContent,
        '',
        `--${emailBoundary}`,
        'Content-Type: application/pdf; name="application_form.pdf"',
        'Content-Transfer-Encoding: base64',
        'Content-Disposition: attachment; filename="application_form.pdf"',
        '',
        pdfBase64,
        '',
        `--${emailBoundary}--`
      ].join('\r\n');
      
      const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${accessToken}`, 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ raw: utf8ToBase64(emailData) })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to send email');
      }
      
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }, [formData, applicationCounter, ADMISSIONS_EMAIL]);

  // ==================== GOOGLE LOGIN ====================
  const login = useGoogleLogin({
    clientId: GOOGLE_CLIENT_ID,
    scope: GMAIL_SCOPES,
    redirectUri: `${SITE_URL}/auth/callback`,
    onSuccess: async (tokenResponse) => {
      setSubmitting(true);
      try {
        localStorage.setItem('lastApplicationNumber', applicationCounter.toString());
        const pdfDoc = await generatePDF();
        await sendEmailViaGmail(tokenResponse.access_token, pdfDoc);
        setFormSubmitted(true);
        setSubmitStatus({ 
          show: true, 
          success: true, 
          message: "Application submitted successfully! Check your email for confirmation." 
        });
        setFormData(INITIAL_FORM_STATE);
        setPhone("");
        setCurrentStep(1);
      } catch (error) {
        console.error('Submission error:', error);
        setSubmitStatus({ 
          show: true, 
          success: false, 
          message: error.message || "Failed to submit application. Please try again or contact the school directly." 
        });
      } finally {
        setSubmitting(false);
      }
    },
    onError: (errorResponse) => {
      console.error('Login Failed:', errorResponse);
      let errorMessage = "Google sign-in failed. ";
      
      if (errorResponse?.error === 'popup_blocked_by_browser') {
        errorMessage += "Please allow popups for this site.";
      } else if (errorResponse?.error === 'access_denied') {
        errorMessage += "You denied access to your account.";
      } else if (errorResponse?.error === 'invalid_client') {
        errorMessage += "The application is not properly configured. Please contact support.";
      } else {
        errorMessage += "Please try again.";
      }
      
      setSubmitStatus({ show: true, success: false, message: errorMessage });
      setSubmitting(false);
    }
  });

  // ==================== HANDLE FORM SUBMIT ====================
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    
    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === '') {
      setSubmitStatus({ 
        show: true, 
        success: false, 
        message: "Google sign-in is not configured. Please contact the school directly at +254 736 756 595." 
      });
      return;
    }
    
    if (!formData.agreeToTerms) {
      setSubmitStatus({ show: true, success: false, message: "Please agree to the terms and conditions." });
      return;
    }
    if (phoneError || !phone) {
      setSubmitStatus({ show: true, success: false, message: phoneError || "Phone number is required." });
      return;
    }
    
    login();
  }, [formData.agreeToTerms, phoneError, phone, login, GOOGLE_CLIENT_ID]);

  // ==================== GRADE OPTIONS ====================
  const gradeOptions = [
    { value: "Playgroup", label: "Playgroup" },
    { value: "PP1", label: "PP1" },
    { value: "PP2", label: "PP2" },
    ...Array.from({ length: 9 }, (_, i) => ({ value: `Grade ${i + 1}`, label: `Grade ${i + 1}` }))
  ];

  const trustPoints = [
    { icon: "fa-graduation-cap", text: "Clear learning pathway from ECD to Junior school" },
    { icon: "fa-chalkboard-user", text: "Experienced and supportive teachers" },
    { icon: "fa-shield-heart", text: "Safe and nurturing school environment" },
    { icon: "fa-futbol", text: "Balanced academic and co-curricular development" }
  ];

  // ==================== RENDER ====================
  return (
    <>
      <Helmet>
        <title>Admissions Application | Kitale Progressive School</title>
        <meta name="description" content="Begin your child's journey at Kitale Progressive School. Complete our simple admissions application in under 10 minutes." />
      </Helmet>
      
      <section className="apply-hero-section" aria-labelledby="page-title">
        <div className="apply-hero-content">
          <h1 id="page-title">Start Your Child's Journey at Kitale Progressive School</h1>
          <p>You're just a few steps away from giving your child a strong academic foundation and a supportive learning environment.</p>
          <div className="hero-badge">
            <i className="fas fa-clock me-2" aria-hidden="true"></i>
            Application takes less than 10 minutes to complete.
          </div>
        </div>
      </section>

      <section className="section-padding">
        <Container>
          <h2 className="section-heading text-center">Your Admissions Journey</h2>
          <p className="text-center mb-5" style={{ maxWidth: '800px', margin: '0 auto' }}>
            We've streamlined our admissions process to make it simple and transparent.
          </p>
          
          <Row className="g-5 justify-content-center">
            <Col md={6} lg={3}>
              <div className="journey-step-card">
                <i className="fas fa-file-text fa-3x text-navy mb-3 d-block" aria-hidden="true"></i>
                <h3 className="card-title-navy">1. Complete Application</h3>
                <p className="text-muted mb-0 small">Fill in your child's details in a simple online form.</p>
              </div>
            </Col>
            <Col md={6} lg={3}>
              <div className="journey-step-card">
                <i className="fas fa-lock fa-3x text-navy mb-3 d-block" aria-hidden="true"></i>
                <h3 className="card-title-navy">2. Secure Submission</h3>
                <p className="text-muted mb-0 small">Submit your application securely and receive confirmation.</p>
              </div>
            </Col>
            <Col md={6} lg={3}>
              <div className="journey-step-card">
                <i className="fas fa-envelope fa-3x text-navy mb-3 d-block" aria-hidden="true"></i>
                <h3 className="card-title-navy">3. School Follow-Up</h3>
                <p className="text-muted mb-0 small">Our team will contact you to guide you through the next steps.</p>
              </div>
            </Col>
            <Col md={6} lg={3}>
              <div className="journey-step-card">
                <i className="fas fa-handshake fa-3x text-navy mb-3 d-block" aria-hidden="true"></i>
                <h3 className="card-title-navy">4. Assessment/School Visit</h3>
                <p className="text-muted mb-0 small">Your child may have a brief interaction or assessment.</p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      <section className="statistics-section">
        <Container>
          <h3 className="text-center mb-4 text-white section-heading">Why Parents Choose Kitale Progressive School</h3>
          <Row className="g-4 justify-content-center">
            {trustPoints.map((point, idx) => (
              <Col key={idx} md={6} lg={3}>
                <div className="d-flex align-items-center gap-3 p-3 bg-white rounded-3 shadow-sm h-100">
                  <i className={`fas ${point.icon} fa-2x text-navy`} aria-hidden="true"></i>
                  <p className="mb-0 fw-medium text-dark small">{point.text}</p>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {!formSubmitted && (
        <section className="section-padding">
          <Container>
            <Row className="justify-content-center">
              <Col lg={11}>
                <StatusAlert show={submitStatus.show} success={submitStatus.success} message={submitStatus.message} onClose={handleDismissAlert} />
                <Card className="card-custom shadow-lg border-0">
                  <Card.Body className="p-4 p-lg-5">
                    <h2 className="section-heading mb-4">Complete Your Application</h2>
                    <p className="text-muted mb-4">Please fill in the details below. Our admissions team will review your application.</p>
                    
                    <ProgressIndicator currentStep={currentStep} totalSteps={4} />
                    
                    <Form noValidate validated={validated} onSubmit={(e) => currentStep === 4 ? handleSubmit(e) : handleNextStep(e)}>
                      {/* Step 1: Parent Info */}
                      {currentStep === 1 && (
                        <div>
                          <h3 className="text-navy fw-bold mb-3 pb-2 border-bottom" style={{ fontSize: '1rem' }}>Parent/Guardian Information</h3>
                          <Row className="g-3">
                            <Col md={6}>
                              <FormInput label="Full Name" name="parentName" value={formData.parentName} onChange={handleChange} required feedback="Please enter name" autoComplete="name" />
                            </Col>
                            <Col md={6}>
                              <FormInput label="Email Address" type="email" name="email" value={formData.email} onChange={handleChange} required feedback="Please enter valid email" autoComplete="email" />
                            </Col>
                          </Row>
                          <Row className="g-3">
                            <Col md={6}>
                              <PhoneInputField phone={phone} onChange={handlePhoneChange} error={phoneError} validated={validated} />
                            </Col>
                            <Col md={6}>
                              <FormInput label="Relationship to Child" as="select" name="relationship" value={formData.relationship} onChange={handleChange} required options={[
                                { value: "Father", label: "Father" }, 
                                { value: "Mother", label: "Mother" }, 
                                { value: "Guardian", label: "Guardian" },
                                { value: "Grandparent", label: "Grandparent" },
                                { value: "Other", label: "Other" }
                              ]} feedback="Please select relationship" />
                            </Col>
                          </Row>
                          <Row>
                            <Col md={12}>
                              <FormInput label="Address" name="address" value={formData.address} onChange={handleChange} placeholder="123 Street, Nairobi" autoComplete="street-address" />
                            </Col>
                          </Row>
                        </div>
                      )}

                      {/* Step 2: Child Info */}
                      {currentStep === 2 && (
                        <div>
                          <h3 className="text-navy fw-bold mb-3 pb-2 border-bottom" style={{ fontSize: '1rem' }}>Child's Information</h3>
                          <Row className="g-3">
                            <Col md={12}>
                              <FormInput label="Full Name" name="childName" value={formData.childName} onChange={handleChange} required feedback="Please enter child's name" />
                            </Col>
                          </Row>
                          <Row className="g-3">
                            <Col md={4}>
                              <FormInput label="Date of Birth" type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} required max={getTodayDate()} min={getMinDate()} feedback={dateError || "Please enter date of birth"} />
                              {dateError && dateError.includes("future") && (
                                <Form.Text className="text-danger small">{dateError}</Form.Text>
                              )}
                            </Col>
                            <Col md={4}>
                              <FormInput label="Gender" as="select" name="gender" value={formData.gender} onChange={handleChange} required options={[
                                { value: "Male", label: "Male" }, 
                                { value: "Female", label: "Female" }
                              ]} feedback="Please select gender" />
                            </Col>
                            <Col md={4}>
                              <FormInput label="Nationality" as="select" name="nationality" value={formData.nationality} onChange={handleChange} options={[
                                { value: "Kenyan", label: "Kenyan" },
                                { value: "Ugandan", label: "Ugandan" },
                                { value: "Tanzanian", label: "Tanzanian" },
                                { value: "Rwandan", label: "Rwandan" },
                                { value: "South Sudanese", label: "South Sudanese" },
                                { value: "Other", label: "Other" }
                              ]} autoComplete="country" />
                            </Col>
                          </Row>
                          {formData.nationality === "Other" && (
                            <Row>
                              <Col md={4}>
                                <FormInput label="Specify Nationality" name="otherNationality" value={formData.otherNationality} onChange={handleFormChange} placeholder="Enter nationality" />
                              </Col>
                            </Row>
                          )}
                          <Row className="g-3">
                            <Col md={6}>
                              <FormInput label="Previous School/Nursery" name="previousSchool" value={formData.previousSchool} onChange={handleFormChange} placeholder="Enter previous school" />
                            </Col>
                            <Col md={6}>
                              <FormInput label="Grade Applying For" as="select" name="gradeApplying" value={formData.gradeApplying} onChange={handleFormChange} required options={gradeOptions} feedback="Please select grade" />
                            </Col>
                          </Row>
                          {getStayStatusOptions().length > 0 && (
                            <Row>
                              <Col md={6}>
                                <FormInput label="Stay Status" as="select" name="stayStatus" value={formData.stayStatus} onChange={handleFormChange} required={formData.gradeApplying === "Playgroup"} options={getStayStatusOptions()} feedback="Please select stay status" />
                              </Col>
                            </Row>
                          )}
                        </div>
                      )}

                      {/* Step 3: Medical Information */}
                      {currentStep === 3 && (
                        <div>
                          <h3 className="text-navy fw-bold mb-3 pb-2 border-bottom" style={{ fontSize: '1rem' }}>Medical Information</h3>
                          <p className="text-muted small mb-3">This information helps us ensure your child receives the best possible care while at school.</p>
                          
                          <div className="mb-4 p-3 rounded-3" style={{ background: 'var(--gray-light)' }}>
                            <SimpleCheckbox 
                              label="Does your child have any allergies?"
                              name="hasAllergies"
                              checked={formData.hasAllergies}
                              onChange={handleChange}
                              id="hasAllergies"
                            />
                            {formData.hasAllergies && (
                              <div className="mt-2 ms-4">
                                <FormInput
                                  label="Please describe the allergies"
                                  name="allergyDetails"
                                  value={formData.allergyDetails}
                                  onChange={handleChange}
                                  placeholder="E.g., Peanuts, pollen, dust mites, bee stings, etc."
                                  as="textarea"
                                />
                              </div>
                            )}
                          </div>

                          <div className="mb-4">
                            <FormInput
                              label="Medical Conditions"
                              name="medicalConditions"
                              value={formData.medicalConditions}
                              onChange={handleChange}
                              placeholder="E.g., Asthma, Diabetes, Epilepsy, Heart condition, etc."
                              as="textarea"
                            />
                            <Form.Text className="text-muted small">
                              Please list any existing medical conditions, chronic illnesses, or special health needs.
                            </Form.Text>
                          </div>

                          <div className="alert alert-info small p-3 mt-3" role="alert" style={{ background: '#e6f0ff', border: 'none', borderRadius: '12px' }}>
                            <i className="fas fa-info-circle me-2 text-navy" aria-hidden="true"></i>
                            <strong>Note:</strong> This information is confidential and will only be shared with relevant school staff to ensure your child's safety and well-being.
                          </div>
                        </div>
                      )}

                      {/* Step 4: Review & Submit */}
                      {currentStep === 4 && (
                        <div>
                          <h3 className="text-navy fw-bold mb-3 pb-2 border-bottom" style={{ fontSize: '1rem' }}>Review & Submit</h3>
                          <div className="review-section mb-3">
                            <p className="fw-bold mb-1 text-navy">Parent: {formData.parentName || "Not provided"}</p>
                            <p className="mb-1">Email: {formData.email || "Not provided"}</p>
                            <p className="mb-1">Phone: {formData.phone || "Not provided"}</p>
                            <p className="mb-1">Child: {formData.childName || "Not provided"}</p>
                            <p className="mb-1">Grade: {formData.gradeApplying || "Not selected"}</p>
                            {formData.stayStatus && (
                              <p className="mb-1">Stay Status: {
                                formData.stayStatus === 'full-day' ? 'Full Day' : 
                                formData.stayStatus === 'half-day' ? 'Half Day' : 
                                formData.stayStatus === 'boarding' ? 'Boarding' : 'Day Scholar'
                              }</p>
                            )}
                            {formData.hasAllergies && (
                              <p className="mb-1">Allergies: Yes {formData.allergyDetails && `- ${formData.allergyDetails.substring(0, 50)}...`}</p>
                            )}
                            {formData.medicalConditions && (
                              <p className="mb-1">Medical Conditions: {formData.medicalConditions.substring(0, 50)}...</p>
                            )}
                          </div>
                          <TermsCheckbox checked={formData.agreeToTerms} onChange={handleChange} required={true} />
                          <p className="text-muted small"><i className="fas fa-lock me-1" aria-hidden="true"></i>You'll sign in with Google to verify your identity and receive your confirmation email.</p>
                        </div>
                      )}

                      {/* Navigation Buttons */}
                      <div className="d-flex justify-content-between mt-4">
                        {currentStep > 1 && (
                          <Button onClick={handlePrevStep} className="btn-outline-navy">
                            <i className="fas fa-arrow-left me-2"></i>Back
                          </Button>
                        )}
                        <Button type="submit" className="btn-navy" disabled={submitting} style={{ marginLeft: currentStep === 1 ? 'auto' : '0' }}>
                          {submitting ? (
                            <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Submitting...</>
                          ) : (
                            currentStep === 4 ? 'Submit Application' : 'Continue'
                          )}
                        </Button>
                      </div>
                    </Form>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Container>
        </section>
      )}

      {/* What Happens After You Apply Section */}
      <section className="section-padding bg-light-custom">
        <Container>
          <Row className="justify-content-center">
            <Col lg={10}>
              <div className="card-custom p-4 p-lg-5" style={{ background: 'var(--gradient-primary)', borderRadius: '24px' }}>
                <div className="text-center mb-4">
                  <div className="d-inline-flex align-items-center justify-content-center mb-3" style={{
                    width: '60px',
                    height: '60px',
                    background: 'rgba(255,255,255,0.15)',
                    borderRadius: '50%',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <i className="fas fa-check-circle fa-2x text-white" aria-hidden="true"></i>
                  </div>
                  <h3 className="text-white section-heading mb-0" style={{ fontSize: 'clamp(1.2rem, 4vw, 1.4rem)' }}>
                    What Happens After You Apply
                  </h3>
                  <p className="text-white-50 small mt-2 mb-0">Simple, transparent process from application to admission</p>
                </div>
                
                <Row className="g-3 mt-2">
                  {[
                    { num: "01", title: "Application Review", desc: "Our team reviews your application within 2-3 business days", icon: "fa-file-alt" },
                    { num: "02", title: "Confirmation", desc: "Receive email confirmation with your application details", icon: "fa-envelope" },
                    { num: "03", title: "Follow-Up Call", desc: "Our admissions team contacts you for next steps", icon: "fa-phone-alt" },
                    { num: "04", title: "School Visit", desc: "Schedule a tour or assessment for your child", icon: "fa-calendar-check" }
                  ].map((step, idx) => (
                    <Col md={6} key={idx}>
                      <div className="d-flex gap-3 p-3 rounded-3" style={{
                        background: 'rgba(255,255,255,0.08)',
                        backdropFilter: 'blur(10px)',
                        transition: 'transform 0.3s ease',
                        height: '100%'
                      }}>
                        <div className="flex-shrink-0" style={{
                          width: '50px',
                          height: '50px',
                          background: 'rgba(255,255,255,0.15)',
                          borderRadius: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <i className={`fas ${step.icon} text-white`} style={{ fontSize: '1.3rem' }} aria-hidden="true"></i>
                        </div>
                        <div>
                          <div className="d-flex align-items-center gap-2 mb-1">
                            <span style={{
                              fontSize: '0.7rem',
                              fontWeight: '600',
                              color: 'rgba(255,255,255,0.6)',
                              letterSpacing: '1px'
                            }}>STEP {step.num}</span>
                            <h4 className="mb-0 text-white fw-bold" style={{ fontSize: '0.95rem' }}>{step.title}</h4>
                          </div>
                          <p className="text-white-50 mb-0 small" style={{ opacity: 0.85, lineHeight: '1.5' }}>{step.desc}</p>
                        </div>
                      </div>
                    </Col>
                  ))}
                </Row>
                
                <hr className="my-4" style={{ borderColor: 'rgba(255,255,255,0.15)' }} />
                
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
                  <div className="d-flex align-items-center gap-2">
                    <i className="fas fa-tachometer-alt text-white" aria-hidden="true"></i>
                    <span className="text-white small">Still having questions?</span>
                    <Link to="/contact" className="btn-light-navy" style={{ 
                      background: 'white', 
                      color: '#0d65fb', 
                      border: 'none',
                      padding: '8px 24px',
                      fontWeight: '600',
                      borderRadius: '40px',
                      textDecoration: 'none',
                      fontSize: '0.85rem'
                    }}>
                      <i className="fas fa-envelope me-2" aria-hidden="true"></i>
                      Contact Admissions
                    </Link>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Success Message Section */}
      {formSubmitted && (
        <section className="success-section">
          <Container>
            <Row className="justify-content-center">
              <Col lg={8}>
                <div className="text-center">
                  <div className="success-icon mb-3"><i className="fas fa-check-circle" aria-hidden="true"></i></div>
                  <h2 className="fw-bold mb-3 text-navy section-heading">Application Submitted Successfully!</h2>
                  <p className="text-dark">Thank you for choosing Kitale Progressive School.</p>
                  <p className="text-muted small">A confirmation email has been sent to <strong>{formData.email}</strong>.</p>
                  <Link to="/" className="btn-navy mt-3">Return to Homepage</Link>
                </div>
              </Col>
            </Row>
          </Container>
        </section>
      )}

      <Suspense fallback={null}><GetInTouch /></Suspense>
    </>
  );
}

export default memo(Apply);