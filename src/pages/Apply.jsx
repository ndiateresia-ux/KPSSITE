// pages/Apply.jsx - Complete Fixed Page with Proper Label Associations
import { Helmet } from "react-helmet-async";
import { Container, Row, Col, Form, Button, Card, Alert } from "react-bootstrap";
import { useState, useEffect, useCallback, memo, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { useGoogleLogin } from '@react-oauth/google';
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import parsePhoneNumber from 'libphonenumber-js';

// Lazy load non-critical components
const GetInTouch = lazy(() => import("../components/GetInTouch"));

// Helper function for Unicode-safe base64 encoding
const utf8ToBase64 = (str) => {
  const utf8Bytes = new TextEncoder().encode(str);
  let binaryString = '';
  for (let i = 0; i < utf8Bytes.length; i++) {
    binaryString += String.fromCharCode(utf8Bytes[i]);
  }
  return btoa(binaryString);
};

// Helper function to convert image to base64
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

// Memoized form input component using theme classes
const FormInput = memo(({ 
  label, 
  type = "text", 
  name, 
  value, 
  onChange, 
  placeholder, 
  required = false,
  feedback,
  as,
  options,
  className = "form-control-custom",
  describedBy,
  autoComplete,
  max,
  min
}) => {
  const id = `input-${name}`;
  const errorId = `${id}-error`;
  const descriptionId = describedBy || (required ? errorId : undefined);
  
  return (
    <Form.Group controlId={id} className="mb-3">
      <Form.Label className="fw-bold small text-navy">
        {label} {required && <span className="text-gold" aria-hidden="true">*</span>}
        {required && <span className="visually-hidden"> (required)</span>}
      </Form.Label>
      {as === 'select' ? (
        <Form.Select 
          required={required}
          name={name}
          value={value}
          onChange={onChange}
          className={className}
          aria-invalid={required && !value ? "true" : "false"}
          aria-describedby={descriptionId}
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
          className={className}
          rows={as === 'textarea' ? 3 : undefined}
          aria-invalid={required && !value ? "true" : "false"}
          aria-describedby={descriptionId}
          autoComplete={autoComplete}
          max={max}
          min={min}
        />
      )}
      {required && (
        <Form.Control.Feedback type="invalid" id={errorId} role="alert">
          {feedback || `Please enter ${label.toLowerCase()}`}
        </Form.Control.Feedback>
      )}
    </Form.Group>
  );
});

FormInput.displayName = 'FormInput';

// FIXED: Phone input component with proper label association using htmlFor
const PhoneInputField = memo(({ phone, onChange, error, validated }) => {
  const id = "phone-input-field";
  const errorId = `${id}-error`;
  const helpId = `${id}-help`;
  
  return (
    <div className="mb-3">
      <label htmlFor={id} className="fw-bold small text-navy mb-2 d-block">
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
        <div id={errorId} className="invalid-feedback d-block mt-1" role="alert" style={{ display: 'block' }}>
          Phone number is required.
        </div>
      )}
      {error && (
        <div id={errorId} className="invalid-feedback d-block mt-1" role="alert" style={{ display: 'block' }}>
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

// Status alert component
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
      <div className="d-flex">
        <i className={`fas ${success ? 'fa-check-circle' : 'fa-exclamation-circle'} me-3 mt-1`} aria-hidden="true"></i>
        <div>{message}</div>
      </div>
    </Alert>
  );
});

StatusAlert.displayName = 'StatusAlert';

// Progress indicator component
const ProgressIndicator = memo(({ currentStep, totalSteps = 4 }) => {
  const steps = [
    { number: 1, label: "Parent Info" },
    { number: 2, label: "Child Info" },
    { number: 3, label: "Medical Info" },
    { number: 4, label: "Review" }
  ];
  
  return (
    <div className="progress-indicator mb-4" role="region" aria-label="Application progress">
      <div className="d-flex justify-content-between align-items-center">
        {steps.map((step, idx) => (
          <div key={step.number} className="text-center" style={{ flex: 1 }}>
            <div 
              className={`step-circle mx-auto mb-2 d-flex align-items-center justify-content-center ${currentStep >= step.number ? 'completed' : ''}`}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: currentStep >= step.number ? 'var(--navy)' : '#e9ecef',
                color: currentStep >= step.number ? 'white' : '#6c757d',
                fontWeight: 'bold',
                fontSize: '1rem'
              }}
              aria-current={currentStep === step.number ? "step" : undefined}
            >
              {step.number}
            </div>
            <div className="small text-muted d-none d-md-block">{step.label}</div>
          </div>
        ))}
      </div>
      <div className="progress mt-2" style={{ height: '4px' }}>
        <div 
          className="progress-bar" 
          role="progressbar"
          style={{ 
            width: `${(currentStep / totalSteps) * 100}%`, 
            backgroundColor: 'var(--gold)',
            transition: 'width 0.3s ease'
          }}
          aria-valuenow={(currentStep / totalSteps) * 100}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
});

ProgressIndicator.displayName = 'ProgressIndicator';

// FIXED: Proper checkbox component with correct label association using htmlFor
const SmallCheckbox = memo(({ label, name, checked, onChange, required = false, id }) => {
  const checkboxId = id || `checkbox-${name}`;
  
  return (
    <div className="mb-3">
      <div className="d-flex align-items-start">
        <input
          type="checkbox"
          id={checkboxId}
          name={name}
          checked={checked}
          onChange={onChange}
          required={required}
          className="small-checkbox-input"
          style={{
            width: '18px',
            height: '18px',
            marginTop: '2px',
            cursor: 'pointer',
            accentColor: 'var(--navy)'
          }}
          aria-invalid={required && !checked ? "true" : "false"}
          aria-describedby={required && !checked ? `${checkboxId}-error` : undefined}
        />
        <label 
          htmlFor={checkboxId} 
          className="mb-0 ms-2 small"
          style={{ cursor: 'pointer', color: 'var(--text-dark)', lineHeight: '1.4' }}
        >
          {label}
          {required && <span className="text-gold ms-1" aria-hidden="true">*</span>}
          {required && <span className="visually-hidden"> (required)</span>}
        </label>
      </div>
      {required && !checked && (
        <div id={`${checkboxId}-error`} className="invalid-feedback d-block mt-1" style={{ fontSize: '0.875rem' }} role="alert">
          Please agree to the terms and conditions
        </div>
      )}
    </div>
  );
});

SmallCheckbox.displayName = 'SmallCheckbox';

// FIXED: Simple checkbox component with proper label association
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
          className="small-checkbox-input"
          style={{
            width: '18px',
            height: '18px',
            marginTop: '0',
            cursor: 'pointer',
            accentColor: 'var(--navy)'
          }}
        />
        <label 
          htmlFor={checkboxId} 
          className="mb-0 ms-2 small"
          style={{ cursor: 'pointer', color: 'var(--text-dark)' }}
        >
          {label}
        </label>
      </div>
    </div>
  );
});

SimpleCheckbox.displayName = 'SimpleCheckbox';

// FIXED: Terms checkbox component with separate links for better accessibility
const TermsCheckbox = memo(({ checked, onChange, required = false }) => {
  const checkboxId = "agreeToTerms";
  
  return (
    <div className="mb-4">
      <div className="d-flex align-items-start">
        <input
          type="checkbox"
          id={checkboxId}
          name="agreeToTerms"
          checked={checked}
          onChange={onChange}
          required={required}
          style={{
            width: '18px',
            height: '18px',
            marginTop: '2px',
            cursor: 'pointer',
            accentColor: 'var(--navy)'
          }}
          aria-describedby="terms-description"
          aria-invalid={required && !checked ? "true" : "false"}
        />
        <label htmlFor={checkboxId} className="mb-0 ms-2 small" style={{ cursor: 'pointer', color: 'var(--text-dark)', lineHeight: '1.4' }}>
          I confirm that the information provided is accurate and I agree to the Terms of Service and Privacy Policy
          {required && <span className="text-gold ms-1" aria-hidden="true">*</span>}
          {required && <span className="visually-hidden"> (required)</span>}
        </label>
      </div>
      <div id="terms-description" className="visually-hidden">
        Please review our Terms of Service and Privacy Policy before agreeing
      </div>
      <div className="mt-2 ms-4">
        <Link to="/terms-of-service" target="_blank" className="text-navy me-3 small" aria-label="View Terms of Service (opens in new tab)">
          View Terms of Service
        </Link>
        <Link to="/privacy-policy" target="_blank" className="text-navy small" aria-label="View Privacy Policy (opens in new tab)">
          View Privacy Policy
        </Link>
      </div>
      {required && !checked && (
        <div className="invalid-feedback d-block mt-1" role="alert">
          Please agree to the terms and conditions
        </div>
      )}
    </div>
  );
});

TermsCheckbox.displayName = 'TermsCheckbox';

// Initial form state
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
  const [submitStatus, setSubmitStatus] = useState({
    show: false,
    success: false,
    message: ""
  });
  const [logoBase64, setLogoBase64] = useState(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [dateError, setDateError] = useState("");

  // Get environment variables
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_GMAIL_CLIENT_ID;
  const ADMISSIONS_EMAIL = import.meta.env.VITE_ADMISSIONS_EMAIL || 'ndiateresia@gmail.com';
  const GMAIL_SCOPES = import.meta.env.VITE_GMAIL_SCOPES || 'https://www.googleapis.com/auth/gmail.send';
  const SITE_URL = import.meta.env.VITE_SITE_URL || 'http://localhost:5173';

  // Get today's date in YYYY-MM-DD format for max date attribute
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Get min date (100 years ago)
  const getMinDate = () => {
    const hundredYearsAgo = new Date();
    hundredYearsAgo.setFullYear(hundredYearsAgo.getFullYear() - 100);
    const year = hundredYearsAgo.getFullYear();
    const month = String(hundredYearsAgo.getMonth() + 1).padStart(2, '0');
    const day = String(hundredYearsAgo.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Validate date of birth
  const validateDateOfBirth = useCallback((dateString) => {
    if (!dateString) return true;
    
    const selectedDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate > today) {
      setDateError("Date of birth cannot be in the future");
      return false;
    }
    
    // Check if child is at least 2 years old (for ECD) - optional warning
    const minAgeDate = new Date();
    minAgeDate.setFullYear(minAgeDate.getFullYear() - 2);
    if (selectedDate > minAgeDate && formData.gradeApplying === "Playgroup") {
      setDateError("Note: Child should be at least 2 years old for Playgroup");
      return true; // Warning only, not blocking
    }
    
    setDateError("");
    return true;
  }, [formData.gradeApplying]);

  // Load logo on component mount
  useEffect(() => {
    const loadLogo = async () => {
      try {
        const logoPath = '/images/optimized/logo.jpg';
        const base64 = await getImageBase64(logoPath);
        setLogoBase64(base64);
      } catch (error) {
        console.warn('Could not load logo:', error);
      }
    };
    loadLogo();
  }, []);

  // Load the last used application number from localStorage
  useEffect(() => {
    try {
      const lastNumber = localStorage.getItem('lastApplicationNumber');
      setApplicationCounter(lastNumber ? parseInt(lastNumber) + 1 : 1);
    } catch (error) {
      console.warn('Could not access localStorage:', error);
      setApplicationCounter(1);
    }
  }, []);

  // Memoized handlers
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'dateOfBirth') {
      validateDateOfBirth(value);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  }, [validateDateOfBirth]);

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

  // Get stay status options based on grade
  const getStayStatusOptions = useCallback(() => {
    const { gradeApplying: grade } = formData;
    if (grade === "Playgroup") return [
      { value: "full-day", label: "Full Day" }, 
      { value: "half-day", label: "Half Day" }
    ];
    if (["PP1", "PP2"].includes(grade)) return [
      { value: "day", label: "Day Scholar" }
    ];
    if (grade?.startsWith("Grade")) return [
      { value: "day", label: "Day Scholar" }, 
      { value: "boarding", label: "Boarding" }
    ];
    return [];
  }, [formData.gradeApplying]);

  // Validate current step
  const validateStep = useCallback((step) => {
    if (step === 1) {
      return formData.parentName && formData.email && formData.phone && formData.relationship;
    }
    if (step === 2) {
      const isDateValid = formData.dateOfBirth && !dateError && new Date(formData.dateOfBirth) <= new Date();
      return formData.childName && isDateValid && formData.gender && formData.gradeApplying;
    }
    if (step === 3) {
      return true; // Medical info is optional
    }
    return true;
  }, [formData, dateError]);

  // Next step handler
  const handleNextStep = useCallback((e) => {
    e.preventDefault();
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    } else {
      setValidated(true);
      let errorMessage = "Please complete all required fields before proceeding.";
      if (dateError && dateError.includes("future")) {
        errorMessage = dateError;
      }
      setSubmitStatus({
        show: true,
        success: false,
        message: errorMessage
      });
      setTimeout(() => setSubmitStatus(prev => ({ ...prev, show: false })), 3000);
    }
  }, [currentStep, validateStep, dateError]);

  // Previous step handler
  const handlePrevStep = useCallback((e) => {
    e.preventDefault();
    setCurrentStep(prev => Math.max(prev - 1, 1));
  }, []);

  // Generate PDF function
  const generatePDF = useCallback(async () => {
    try {
      const jsPDFModule = await import("jspdf");
      await import("jspdf-autotable");
      const jsPDF = jsPDFModule.default;
      
      const doc = new jsPDF();
      
      // Add logo if available
      if (logoBase64) {
        doc.addImage(logoBase64, 'JPEG', 14, 10, 40, 40);
      }
      
      // Title
      doc.setFontSize(20);
      doc.setTextColor(13, 101, 251);
      doc.text('Kitale Progressive School', 60, 25);
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text('Admission Application Form', 60, 35);
      
      // Application Number
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(`Application #: KPS/${new Date().getFullYear()}/${String(applicationCounter).padStart(4, '0')}`, 14, 55);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 62);
      
      // Parent Info Section
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
      
      // Child Info Section
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
        doc.text(`Stay Status: ${formData.stayStatus === 'full-day' ? 'Full Day' : formData.stayStatus === 'half-day' ? 'Half Day' : formData.stayStatus === 'boarding' ? 'Boarding' : 'Day Scholar'}`, 14, yPos);
        yPos += 6;
      }
      
      // Medical Info Section
      yPos += 12;
      doc.setFontSize(12);
      doc.setTextColor(13, 101, 251);
      doc.text('Medical Information', 14, yPos);
      yPos += 8;
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(`Allergies: ${formData.hasAllergies ? 'Yes' : 'No'}`, 14, yPos);
      yPos += 6;
      if (formData.medicalConditions) {
        doc.text(`Medical Conditions: ${formData.medicalConditions}`, 14, yPos);
        yPos += 6;
      }
      
      // Footer
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text('This is an automatically generated application confirmation.', 14, 280);
      doc.text('Please keep this for your records.', 14, 286);
      
      return doc;
    } catch (error) {
      console.error('PDF generation error:', error);
      throw error;
    }
  }, [formData, applicationCounter, logoBase64]);

  // Send email via Gmail API
  const sendEmailViaGmail = useCallback(async (accessToken, pdfDoc) => {
    const pdfOutput = pdfDoc.output('datauristring');
    const pdfBase64 = pdfOutput.split(',')[1];
    
    const currentDate = new Date().toLocaleDateString();
    const applicationRef = `KPS/${new Date().getFullYear()}/${String(applicationCounter).padStart(4, '0')}`;
    
    // Email content
    const emailContent = `
      <html>
        <head></head>
        <body>
          <h2 style="color: #0d65fb;">Kitale Progressive School - Application Received</h2>
          <p>Dear ${formData.parentName},</p>
          <p>Thank you for submitting an admission application for <strong>${formData.childName}</strong> to Kitale Progressive School.</p>
          
          <h3>Application Summary</h3>
          <ul>
            <li><strong>Application Reference:</strong> ${applicationRef}</li>
            <li><strong>Student Name:</strong> ${formData.childName}</li>
            <li><strong>Grade Applying For:</strong> ${formData.gradeApplying}</li>
            <li><strong>Submission Date:</strong> ${currentDate}</li>
          </ul>
          
          <h3>Next Steps</h3>
          <ol>
            <li>Our admissions team will review your application within 2-3 business days.</li>
            <li>You will receive a follow-up call or email to discuss the next steps.</li>
            <li>We may invite you for a school tour or assessment depending on the grade level.</li>
          </ol>
          
          <p>Please find attached a copy of your application for your records.</p>
          
          <p>If you have any questions, please contact our admissions office at:</p>
          <p>
            📞 Phone: +254 (0) 123 456 789<br>
            📧 Email: admissions@kitaleprogressiveschool.ac.ke
          </p>
          
          <p>Warm regards,<br>
          <strong>Admissions Office</strong><br>
          Kitale Progressive School</p>
          
          <hr>
          <small>This is an automated confirmation. Please do not reply to this email.</small>
        </body>
      </html>
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
      'Content-Transfer-Encoding: 7bit',
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
    
    const encodedEmail = utf8ToBase64(emailData);
    
    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        raw: encodedEmail
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to send email');
    }
    
    return await response.json();
  }, [formData, applicationCounter, ADMISSIONS_EMAIL]);

  // Google Login configuration
  const login = useGoogleLogin({
    clientId: GOOGLE_CLIENT_ID,
    scope: GMAIL_SCOPES,
    redirectUri: `${SITE_URL}/auth/callback`,
    onSuccess: async (tokenResponse) => {
      setSubmitting(true);
      try {
        // Save application number for next time
        localStorage.setItem('lastApplicationNumber', applicationCounter.toString());
        
        // Generate PDF
        const pdfDoc = await generatePDF();
        
        // Send email
        await sendEmailViaGmail(tokenResponse.access_token, pdfDoc);
        
        setFormSubmitted(true);
        setSubmitStatus({
          show: true,
          success: true,
          message: "Application submitted successfully! Check your email for confirmation."
        });
        
        // Reset form
        setFormData(INITIAL_FORM_STATE);
        setPhone("");
        setCurrentStep(1);
        
      } catch (error) {
        console.error('Submission error:', error);
        setSubmitStatus({
          show: true,
          success: false,
          message: error.message || "Failed to submit application. Please try again."
        });
      } finally {
        setSubmitting(false);
      }
    },
    onError: (errorResponse) => {
      console.error('Login Failed:', errorResponse);
      setSubmitStatus({
        show: true,
        success: false,
        message: "Google sign-in failed. Please allow popups and try again."
      });
      setSubmitting(false);
    }
  });

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    
    if (!formData.agreeToTerms) {
      setSubmitStatus({
        show: true,
        success: false,
        message: "Please agree to the terms and conditions."
      });
      return;
    }
    
    if (phoneError || !phone) {
      setSubmitStatus({
        show: true,
        success: false,
        message: phoneError || "Phone number is required."
      });
      return;
    }
    
    if (dateError && dateError.includes("future")) {
      setSubmitStatus({
        show: true,
        success: false,
        message: dateError
      });
      return;
    }

    if (!GOOGLE_CLIENT_ID) {
      setSubmitStatus({
        show: true,
        success: false,
        message: "Configuration error. Please contact support."
      });
      return;
    }
    
    login();
  }, [formData.agreeToTerms, phoneError, phone, login, GOOGLE_CLIENT_ID, dateError]);

  const stayStatusOptions = getStayStatusOptions();

  const gradeOptions = [
    { value: "Playgroup", label: "Playgroup" },
    { value: "PP1", label: "PP1" },
    { value: "PP2", label: "PP2" },
    ...Array.from({ length: 9 }, (_, i) => ({
      value: `Grade ${i + 1}`,
      label: `Grade ${i + 1}`
    }))
  ];

  // Trust strip data - Why Parents Choose KPS
  const trustPoints = [
    { icon: "fa fa-graduation-cap", text: "Clear learning pathway from ECD to Junior school" },
    { icon: "fa fa-chalkboard-user", text: "Experienced and supportive teachers who guide & support your learner" },
    { icon: "fa fa-shield-heart", text: "Safe and nurturing school environment" },
    { icon: "fa fa-futbol", text: "Balanced academic and co-curricular development" }
  ];

  return (
    <>
      <Helmet>
        <title>Admissions Application | Kitale Progressive School</title>
        <meta 
          name="description" 
          content="Begin your child's journey at Kitale Progressive School. Complete our simple admissions application in under 10 minutes." 
        />
      </Helmet>
      
      {/* Hero Section - Matching Other Pages with Background Image */}
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

      {/* Application Journey Section */}
      <section className="journey-section section-padding" aria-label="Application journey steps">
        <Container>
          <h2 className="section-heading text-center">Your Admissions Journey</h2>
          <p className="lead text-center mb-5" style={{ maxWidth: '800px', margin: '0 auto' }}>
            We've streamlined our admissions process to make it simple and transparent. 
            Follow these steps to secure your child's place at Kitale Progressive School.
          </p>
          
          <Row className="g-5 justify-content-center">
            <Col md={6} lg={3}>
              <div className="card-custom text-center p-4 h-100 journey-step-card">
                <div className="step-icon mb-3" style={{ width: '70px', height: '70px', background: 'var(--gray-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--navy)', fontSize: '2rem' }}>
                  <i className="fas fa-file-text" aria-hidden="true"></i>
                </div>
                <h3 className="card-title-navy h5 fw-bold mb-3">1. Complete Application</h3>
                <p className="text-muted mb-0">Fill in your child's details in a simple online form.</p>
              </div>
            </Col>
            <Col md={6} lg={3}>
              <div className="card-custom text-center p-4 h-100 journey-step-card">
                <div className="step-icon mb-3" style={{ width: '70px', height: '70px', background: 'var(--gray-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--navy)', fontSize: '2rem' }}>
                  <i className="fas fa-lock" aria-hidden="true"></i>
                </div>
                <h3 className="card-title-navy h5 fw-bold mb-3">2. Secure Submission</h3>
                <p className="text-muted mb-0">Submit your application securely and receive confirmation.</p>
              </div>
            </Col>
            <Col md={6} lg={3}>
              <div className="card-custom text-center p-4 h-100 journey-step-card">
                <div className="step-icon mb-3" style={{ width: '70px', height: '70px', background: 'var(--gray-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--navy)', fontSize: '2rem' }}>
                  <i className="fas fa-envelope" aria-hidden="true"></i>
                </div>
                <h3 className="card-title-navy h5 fw-bold mb-3">3. School Follow-Up</h3>
                <p className="text-muted mb-0">Our admissions team will contact you to guide you through the next steps.</p>
              </div>
            </Col>
            <Col md={6} lg={3}>
              <div className="card-custom text-center p-4 h-100 journey-step-card">
                <div className="step-icon mb-3" style={{ width: '70px', height: '70px', background: 'var(--gray-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--navy)', fontSize: '2rem' }}>
                  <i className="fas fa-handshake" aria-hidden="true"></i>
                </div>
                <h3 className="card-title-navy h5 fw-bold mb-3">4. Assessment/School Visit</h3>
                <p className="text-muted mb-0">Your child may have a brief interaction or assessment depending on level.</p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Trust Strip - Why Parents Choose KPS (Before Form) */}
      <section className="statistics-section" style={{ background: 'var(--gradient-primary)' }}>
        <Container>
          <h3 className="text-center mb-4 text-white" style={{ fontSize: '1.8rem', fontWeight: '600' }}>
            Why Parents Choose Kitale Progressive School
          </h3>
          <Row className="g-5 justify-content-center">
            {trustPoints.map((point, idx) => (
              <Col key={idx} md={6} lg={3}>
                <div className="d-flex align-items-center gap-3 p-3" style={{ 
                  background: 'white', 
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  height: '100%'
                }}>
                  <div className="bg-white text-primary" style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <i className={`fas ${point.icon}`} style={{ fontSize: '2.25rem', color: 'navy' }} aria-hidden="true"></i>
                  </div>
                  <p className="mb-0 fw-medium text-dark" style={{ lineHeight: '1.4' }}>{point.text}</p>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Application Form Section - Only show if not submitted */}
      {!formSubmitted && (
        <section className="apply-section section-padding" aria-label="Application form">
          <Container>
            <Row className="justify-content-center">
              <Col lg={11}>
                <StatusAlert 
                  show={submitStatus.show}
                  success={submitStatus.success}
                  message={submitStatus.message}
                  onClose={handleDismissAlert}
                />

                <Card className="card-custom shadow-lg border-0">
                  <Card.Body className="p-4 p-lg-5">
                    <h2 className="section-heading h3 mb-4">Complete Your Application</h2>
                    <p className="text-muted mb-4">
                      Please fill in the details below. Our admissions team will review your application and guide you through the next steps.
                    </p>
                    
                    {/* Progress Indicator */}
                    <ProgressIndicator currentStep={currentStep} totalSteps={4} />
                    
                    <Form 
                      noValidate 
                      validated={validated} 
                      onSubmit={(e) => {
                        if (currentStep === 4) {
                          e.preventDefault();
                          handleSubmit(e);
                        } else {
                          handleNextStep(e);
                        }
                      }}
                      aria-label="Admission application form"
                    >
                      {/* Step 1: Parent Info */}
                      {currentStep === 1 && (
                        <div className="step-content">
                          <h3 className="text-navy fw-bold h5 mb-3 pb-2 border-bottom">Parent/Guardian Information</h3>
                          <Row className="g-3">
                            <Col md={6}>
                              <FormInput
                                label="Full Name"
                                name="parentName"
                                value={formData.parentName}
                                onChange={handleChange}
                                placeholder="James Vincent"
                                required
                                feedback="Please enter parent/guardian name"
                                autoComplete="name"
                              />
                            </Col>
                            <Col md={6}>
                              <FormInput
                                label="Email Address"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="example@email.com"
                                required
                                feedback="Please enter a valid email"
                                autoComplete="email"
                              />
                            </Col>
                          </Row>
                          <Row className="g-3">
                            <Col md={6}>
                              <PhoneInputField
                                phone={phone}
                                onChange={handlePhoneChange}
                                error={phoneError}
                                validated={validated}
                              />
                            </Col>
                            <Col md={6}>
                              <FormInput
                                label="Relationship to Child"
                                as="select"
                                name="relationship"
                                value={formData.relationship}
                                onChange={handleChange}
                                required
                                options={[
                                  { value: "Father", label: "Father" },
                                  { value: "Mother", label: "Mother" },
                                  { value: "Brother", label: "Brother" },
                                  { value: "Sister", label: "Sister" },
                                  { value: "Guardian", label: "Guardian" },
                                  { value: "Grandparent", label: "Grandparent" },
                                  { value: "Other", label: "Other" }
                                ]}
                                feedback="Please select relationship"
                              />
                            </Col>
                          </Row>
                          <Row>
                            <Col md={12}>
                              <FormInput
                                label="Address"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="123 Street, Nairobi"
                                autoComplete="street-address"
                              />
                            </Col>
                          </Row>
                        </div>
                      )}

                      {/* Step 2: Child Info */}
                      {currentStep === 2 && (
                        <div className="step-content">
                          <h3 className="text-navy fw-bold h5 mb-3 pb-2 border-bottom">Child's Information</h3>
                          <Row className="g-3">
                            <Col md={12}>
                              <FormInput
                                label="Full Name"
                                name="childName"
                                value={formData.childName}
                                onChange={handleChange}
                                placeholder="Prince Vincent"
                                required
                                feedback="Please enter child's name"
                              />
                            </Col>
                          </Row>
                          <Row className="g-3">
                            <Col md={4}>
                              <FormInput
                                label="Date of Birth"
                                type="date"
                                name="dateOfBirth"
                                value={formData.dateOfBirth}
                                onChange={handleChange}
                                required
                                max={getTodayDate()}
                                min={getMinDate()}
                                feedback={dateError || "Please enter date of birth"}
                              />
                              {dateError && dateError.includes("Note:") && (
                                <Form.Text className="text-warning small">
                                  <i className="fas fa-info-circle me-1" aria-hidden="true"></i>
                                  {dateError}
                                </Form.Text>
                              )}
                            </Col>
                            <Col md={4}>
                              <FormInput
                                label="Gender"
                                as="select"
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                required
                                options={[
                                  { value: "Male", label: "Male" },
                                  { value: "Female", label: "Female" }
                                ]}
                                feedback="Please select gender"
                              />
                            </Col>
                            <Col md={4}>
                              <FormInput
                                label="Nationality"
                                as="select"
                                name="nationality"
                                value={formData.nationality}
                                onChange={handleChange}
                                options={[
                                  { value: "Kenyan", label: "Kenyan" },
                                  { value: "Ugandan", label: "Ugandan" },
                                  { value: "Tanzanian", label: "Tanzanian" },
                                  { value: "Rwandan", label: "Rwandan" },
                                  { value: "South Sudanese", label: "South Sudanese" },
                                  { value: "Other", label: "Other" }
                                ]}
                                autoComplete="country"
                              />
                            </Col>
                          </Row>
                          {formData.nationality === "Other" && (
                            <Row>
                              <Col md={4}>
                                <FormInput
                                  label="Specify Nationality"
                                  name="otherNationality"
                                  value={formData.otherNationality}
                                  onChange={handleChange}
                                  placeholder="Enter nationality"
                                />
                              </Col>
                            </Row>
                          )}
                          <Row className="g-3">
                            <Col md={6}>
                              <FormInput
                                label="Previous School/Nursery"
                                name="previousSchool"
                                value={formData.previousSchool}
                                onChange={handleChange}
                                placeholder="Enter previous school"
                              />
                            </Col>
                            <Col md={6}>
                              <FormInput
                                label="Grade Applying For"
                                as="select"
                                name="gradeApplying"
                                value={formData.gradeApplying}
                                onChange={handleChange}
                                required
                                options={gradeOptions}
                                feedback="Please select grade"
                              />
                            </Col>
                          </Row>
                          {stayStatusOptions.length > 0 && (
                            <Row>
                              <Col md={6}>
                                <FormInput
                                  label={`Stay Status ${formData.gradeApplying === "Playgroup" ? "(Full Day or Half Day)" : ""}`}
                                  as="select"
                                  name="stayStatus"
                                  value={formData.stayStatus}
                                  onChange={handleChange}
                                  required={formData.gradeApplying === "Playgroup"}
                                  options={stayStatusOptions}
                                  feedback="Please select stay status"
                                />
                              </Col>
                            </Row>
                          )}
                        </div>
                      )}

                      {/* Step 3: Medical Info */}
                      {currentStep === 3 && (
                        <div className="step-content">
                          <h3 className="text-navy fw-bold h5 mb-3 pb-2 border-bottom">Medical Information</h3>
                          <Row className="mb-3">
                            <Col md={12}>
                              <SimpleCheckbox 
                                label="Does the child have any allergies?"
                                name="hasAllergies"
                                checked={formData.hasAllergies}
                                onChange={handleChange}
                                id="hasAllergies"
                              />
                            </Col>
                          </Row>
                          <Row>
                            <Col md={12}>
                              <FormInput
                                label="Medical Conditions"
                                name="medicalConditions"
                                value={formData.medicalConditions}
                                onChange={handleChange}
                                placeholder="E.g., Asthma, Diabetes, Epilepsy"
                              />
                              <Form.Text className="text-muted small">
                                Please list any medical conditions, ongoing treatments, or medications.
                              </Form.Text>
                            </Col>
                          </Row>
                        </div>
                      )}

                      {/* Step 4: Review & Submit - Using TermsCheckbox component with proper label association */}
                      {currentStep === 4 && (
                        <div className="step-content">
                          <h3 className="text-navy fw-bold h5 mb-3 pb-2 border-bottom">Review & Submit</h3>
                          <div className="review-section bg-light-custom p-3 rounded-3 mb-3">
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
                          </div>
                          
                          {/* Using the dedicated TermsCheckbox component with proper accessibility */}
                          <TermsCheckbox 
                            checked={formData.agreeToTerms}
                            onChange={handleChange}
                            required={true}
                          />
                          
                          <p className="text-muted small">
                            <i className="fas fa-lock me-1" aria-hidden="true"></i>
                            You'll sign in with Google to verify your identity and receive your confirmation email.
                          </p>
                        </div>
                      )}

                      {/* Navigation Buttons */}
                      <div className="d-flex justify-content-between mt-4">
                        {currentStep > 1 && (
                          <Button 
                            variant="outline-secondary" 
                            onClick={handlePrevStep}
                            className="btn-outline-navy"
                            style={{ minWidth: '120px' }}
                          >
                            <i className="fas fa-arrow-left me-2" aria-hidden="true"></i>
                            Back
                          </Button>
                        )}
                        <Button 
                          type="submit" 
                          className="btn-navy"
                          disabled={submitting}
                          style={{ 
                            minWidth: '160px',
                            marginLeft: currentStep === 1 ? 'auto' : '0'
                          }}
                        >
                          {submitting ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                              <span>Submitting...</span>
                            </>
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
      <section className="after-apply-section section-padding" style={{ background: 'var(--gray-light)' }}>
        <Container>
          <Row className="justify-content-center">
            <Col lg={10}>
              <div className="card-custom p-4 p-lg-5" style={{ backgroundColor: '#0d65fb' }}>
                <h3 className="h4 fw-bold mb-4 text-white">What Happens After You Apply</h3>
                <div className="step-list">
                  <div className="step-item d-flex gap-3 mb-4">
                    <div className="step-number bg-white text-navy" style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>1</div>
                    <div>
                      <h4 className="h6 fw-bold mb-1 text-white">Application Review</h4>
                      <p className="text-white mb-0">Our admissions team will review your details within 2-3 business days.</p>
                    </div>
                  </div>
                  <div className="step-item d-flex gap-3 mb-4">
                    <div className="step-number bg-white text-navy" style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>2</div>
                    <div>
                      <h4 className="h6 fw-bold mb-1 text-white">Receive Confirmation</h4>
                      <p className="text-white mb-0">You will receive a confirmation email with your application details.</p>
                    </div>
                  </div>
                  <div className="step-item d-flex gap-3 mb-4">
                    <div className="step-number bg-white text-navy" style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>3</div>
                    <div>
                      <h4 className="h6 fw-bold mb-1 text-white">School Follow-Up</h4>
                      <p className="text-white mb-0">We will contact you to guide you through the next steps.</p>
                    </div>
                  </div>
                  <div className="step-item d-flex gap-3">
                    <div className="step-number bg-white text-navy" style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>4</div>
                    <div>
                      <h4 className="h6 fw-bold mb-1 text-white">School Visit/Assessment</h4>
                      <p className="text-white mb-0">You may be invited for a school visit or interaction with your child.</p>
                    </div>
                  </div>
                </div>
                <div className="contact-options mt-4 pt-3 text-center">
                  <p className="mb-3 text-white">
                    Have questions? Contact our admissions office
                  </p>
                  <Link 
                    to="/contact" 
                    className="btn-navy" 
                    aria-label="Contact Us"
                    style={{ textDecoration: 'none', background: 'white', color: '#0d65fb' }}
                  >
                    Contact Us
                  </Link>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* What Happens Next Section - AFTER form submission (Success Message) */}
      {formSubmitted && (
        <section className="success-section section-padding" style={{ background: 'var(--gray-light)' }}>
          <Container>
            <Row className="justify-content-center">
              <Col lg={8}>
                <div className="text-center">
                  <div className="success-icon mb-3">
                    <i className="fas fa-check-circle" style={{ fontSize: '4rem', color: '#48bb78' }} aria-hidden="true"></i>
                  </div>
                  <h2 className="display-6 fw-bold mb-3 text-navy">Application Submitted Successfully!</h2>
                  <p className="lead text-dark">
                    Thank you for choosing Kitale Progressive School.
                  </p>
                  <p className="text-muted">
                    A confirmation email has been sent to <strong>{formData.email}</strong>. 
                    Our admissions team will review your application and contact you within 2-3 business days.
                  </p>
                  <Link to="/" className="btn-navy mt-3">
                    Return to Homepage
                  </Link>
                </div>
              </Col>
            </Row>
          </Container>
        </section>
      )}

      <Suspense fallback={null}>
        <GetInTouch />
      </Suspense>

      {/* Additional CSS */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* Hero Section with Background Image */
        .apply-hero-section {
          position: relative;
          background: linear-gradient(135deg, #0d65fb 0%, #0a55d6 100%);
          min-height: 400px;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          overflow: hidden;
        }

        .apply-hero-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: url('/images/optimized/jss.webp');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          filter: blur(0px);
          transform: scale(1.05);
          opacity: 0.9;
          z-index: 0;
        }

        .apply-hero-section::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(13, 101, 251, 0.6), rgba(10, 85, 214, 0.7));
          z-index: 1;
        }

        .apply-hero-content {
          position: relative;
          z-index: 2;
          max-width: 900px;
          margin: 0 auto;
          padding: 80px 20px;
          color: white;
        }

        .apply-hero-content h1 {
          font-size: clamp(2rem, 5vw, 3rem);
          font-weight: 700;
          margin-bottom: 1rem;
          color: white;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        }

        .apply-hero-content p {
          font-size: clamp(1rem, 4vw, 1.2rem);
          color: rgba(255, 255, 255, 0.95);
          line-height: 1.6;
          margin-bottom: 1rem;
          text-shadow: 0 1px 5px rgba(0, 0, 0, 0.2);
        }

        .apply-hero-content .hero-badge {
          display: inline-block;
          background: rgba(3, 26, 65, 0.8);
          backdrop-filter: blur(10px);
          padding: 8px 20px;
          border-radius: 40px;
          font-size: 0.9rem;
          font-weight: 500;
          margin-top: 0.5rem;
          text-shadow: none;
        }

        .small-checkbox-input {
          accent-color: var(--navy);
        }
        
        .small-checkbox-input:focus {
          outline: 2px solid var(--navy);
          outline-offset: 2px;
        }
        
        .journey-step-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        
        .journey-step-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 16px 24px -8px rgba(0,35,70,0.15) !important;
        }
        
        .step-circle.completed {
          background-color: var(--navy);
          color: white;
        }
        
        .fade-in { 
          animation: fadeIn 0.3s ease; 
        }
        
        @keyframes fadeIn { 
          from { opacity: 0; } 
          to { opacity: 1; } 
        }
        
        .review-section {
          background-color: #f8f9fa;
          border-left: 4px solid var(--gold);
        }
        
        .bg-light-custom {
          background-color: #f8f9fa;
        }
        
        /* Style for phone input to match form controls */
        .PhoneInput {
          display: flex;
          align-items: center;
          border: 1px solid #ced4da;
          border-radius: 0.375rem;
          padding: 0.375rem 0.75rem;
          background-color: #fff;
          transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
        }
        
        .PhoneInput:focus-within {
          border-color: var(--navy);
          outline: 0;
          box-shadow: 0 0 0 0.2rem rgba(13, 101, 251, 0.25);
        }
        
        .PhoneInputInput {
          border: none;
          outline: none;
          flex: 1;
          padding: 0.375rem 0;
          background: transparent;
        }
        
        .form-control-custom.is-invalid,
        .PhoneInput.is-invalid {
          border-color: #dc3545;
          padding-right: calc(1.5em + 0.75rem);
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12' width='12' height='12' fill='none' stroke='%23dc3545'%3e%3ccircle cx='6' cy='6' r='4.5'/%3e%3cpath stroke-linejoin='round' d='M5.8 3.6h.4L6 6.5z'/%3e%3ccircle cx='6' cy='8.2' r='.6' fill='%23dc3545' stroke='none'/%3e%3c/svg%3e");
          background-repeat: no-repeat;
          background-position: right calc(0.375em + 0.1875rem) center;
          background-size: calc(0.75em + 0.375rem) calc(0.75em + 0.375rem);
        }
        
        @media (max-width: 768px) {
          .apply-hero-content {
            padding: 60px 20px;
          }
        }
        
        @media (max-width: 576px) {
          .apply-hero-content {
            padding: 50px 20px;
          }
          .apply-hero-content h1 {
            font-size: 1.8rem;
          }
          .apply-hero-content .hero-badge {
            font-size: 0.75rem;
            padding: 5px 12px;
          }
        }
        
        @media (prefers-reduced-motion: reduce) {
          * { 
            animation-duration: 0.01ms !important; 
            transition-duration: 0.01ms !important; 
          }
          .journey-step-card:hover { 
            transform: none; 
          }
          .apply-hero-section::before {
            filter: blur(0px);
            transform: none;
          }
        }
      `}} />
    </>
  );
}

export default memo(Apply);