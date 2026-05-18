import React, { useState, useCallback, memo, lazy, Suspense } from "react";
import { Container, Row, Col, Form, Button, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useGoogleLogin } from '@react-oauth/google';

// Helper function for Unicode-safe base64 encoding
const utf8ToBase64 = (str) => {
  const utf8Bytes = new TextEncoder().encode(str);
  let binaryString = '';
  for (let i = 0; i < utf8Bytes.length; i++) {
    binaryString += String.fromCharCode(utf8Bytes[i]);
  }
  return btoa(binaryString);
};

// Memoized form input component with accessibility improvements
const FormInput = memo(({ 
  label, 
  type = "text", 
  name, 
  value, 
  onChange, 
  placeholder, 
  required = false,
  as,
  rows,
  feedback,
  options,
  min
}) => {
  const id = `input-${name}`;
  const errorId = `${id}-error`;
  
  if (as === 'select') {
    return (
      <Form.Group className="mb-3" controlId={id}>
        <Form.Label className="form-label-custom">
          {label} {required && <span className="text-danger" aria-hidden="true">*</span>}
          {required && <span className="visually-hidden"> (required)</span>}
        </Form.Label>
        <Form.Select 
          name={name}
          value={value}
          onChange={onChange}
          className="form-control-custom"
          required={required}
          aria-invalid={required && !value ? "true" : "false"}
          aria-describedby={required && !value ? errorId : undefined}
        >
          <option value="">Select an option</option>
          {options?.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </Form.Select>
        {required && (
          <Form.Control.Feedback type="invalid" id={errorId} role="alert">
            {feedback || `Please select ${label.toLowerCase()}.`}
          </Form.Control.Feedback>
        )}
      </Form.Group>
    );
  }
  
  return (
    <Form.Group className="mb-3" controlId={id}>
      <Form.Label className="form-label-custom">
        {label} {required && <span className="text-danger" aria-hidden="true">*</span>}
        {required && <span className="visually-hidden"> (required)</span>}
      </Form.Label>
      <Form.Control 
        as={as}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="form-control-custom"
        required={required}
        rows={rows}
        min={min}
        aria-invalid={required && !value ? "true" : "false"}
        aria-describedby={required && !value ? errorId : undefined}
      />
      {required && (
        <Form.Control.Feedback type="invalid" id={errorId} role="alert">
          {feedback || `Please enter your ${label.toLowerCase()}.`}
        </Form.Control.Feedback>
      )}
    </Form.Group>
  );
});

FormInput.displayName = 'FormInput';

// Memoized contact info component with accessibility improvements
const ContactInfo = memo(({ icon, label, value, isLight = false }) => {
  const id = `contact-${label.toLowerCase().replace(/\s+/g, '-')}`;
  
  return (
    <div className="d-flex align-items-center gap-3 mb-3" id={id}>
      <span 
        className={`contact-icon-circle${isLight ? '-light' : ''}`}
        aria-hidden="true"
      >
        <i className={`bi ${icon}`} aria-hidden="true"></i>
      </span>
      <div>
        <div className="contact-label small text-uppercase text-muted" id={`${id}-label`}>
          {label}
        </div>
        <div className="contact-value fw-medium" aria-labelledby={`${id}-label`}>
          {value}
        </div>
      </div>
    </div>
  );
});

ContactInfo.displayName = 'ContactInfo';

// Memoized status alert component with accessibility improvements
const StatusAlert = memo(({ show, success, message, onClose }) => {
  if (!show) return null;
  
  return (
    <Alert 
      variant={success ? "success" : "danger"} 
      className="mb-4 fade-in"
      dismissible
      onClose={onClose}
      role="alert"
      aria-live="polite"
    >
      <div className="d-flex align-items-center">
        <i className={`fas ${success ? 'fa-check-circle' : 'fa-exclamation-circle'} me-3 fs-3`} aria-hidden="true"></i>
        <div>
          <h5 className={success ? "text-success" : "text-danger"} mb-1>
            {success ? "Success!" : "Error!"}
          </h5>
          <p className="mb-0 small">{message}</p>
        </div>
      </div>
    </Alert>
  );
});

StatusAlert.displayName = 'StatusAlert';

const GetInTouch = () => {
  const [inquiryType, setInquiryType] = useState("general");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    inquiryType: "general",
    subject: "",
    message: "",
    preferredDate: "",
    preferredTime: "",
    numberOfVisitors: "1",
    childGrade: "",
    agreeToTerms: false
  });

  const [validated, setValidated] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({
    show: false,
    success: false,
    message: ""
  });

  // Get environment variables
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_GMAIL_CLIENT_ID;
  const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL || 'ndiateresia@gmail.com';
  const GMAIL_SCOPES = import.meta.env.VITE_GMAIL_SCOPES || 'https://www.googleapis.com/auth/gmail.send';

  // Memoize handlers
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'inquiryType') {
      setInquiryType(value);
    }
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  }, []);

  const handleDismissAlert = useCallback(() => {
    setSubmitStatus(prev => ({ ...prev, show: false }));
  }, []);

  // Create email with content function - UPDATED with Reply-To header
  const createEmailWithContent = useCallback(async (to, from, subject, htmlContent, textContent, replyTo) => {
    const boundary = 'boundary_' + Math.random().toString(36).substring(2);

    const emailParts = [
      `MIME-Version: 1.0`,
      `To: ${to}`,
      `From: ${from}`,
      `Reply-To: ${replyTo || from}`,  // Explicit Reply-To header for easy replies
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
  }, []);

  // Create email content based on inquiry type
  const createEmailContents = useCallback(() => {
    const currentDate = new Date().toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const isVisitInquiry = inquiryType === 'school_visit';
    const inquiryTypeLabel = isVisitInquiry ? 'SCHOOL VISIT REQUEST' : 'GENERAL INQUIRY';
    
    // Build additional details for visit inquiry
    let visitDetails = '';
    if (isVisitInquiry) {
      visitDetails = `
PREFERRED VISIT DATE: ${formData.preferredDate || 'Not specified'}
PREFERRED TIME: ${formData.preferredTime || 'Not specified'}
NUMBER OF VISITORS: ${formData.numberOfVisitors || '1'}
CHILD'S GRADE: ${formData.childGrade || 'Not specified'}`;
    }

    // Plain text version for SCHOOL
    const schoolTextContent = `
KITALE PROGRESSIVE SCHOOL - ${inquiryTypeLabel}
====================================================
Date: ${currentDate}

INQUIRY TYPE: ${inquiryTypeLabel}
CONTACT DETAILS:
----------------
Full Name: ${formData.fullName}
Email: ${formData.email}
Phone: ${formData.phone || 'Not provided'}
Subject: ${formData.subject || 'Not specified'}

${visitDetails}

MESSAGE:
--------
${formData.message}

TERMS AGREED: ${formData.agreeToTerms ? 'Yes' : 'No'}

---
To reply to this inquiry, simply click "Reply" in your email client. The reply will go directly to: ${formData.email}

This ${isVisitInquiry ? 'visit request' : 'inquiry'} was sent via the Kitale Progressive School website.
    `.trim();

    // HTML version for SCHOOL - with reply instructions
    const schoolHtmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px; padding: 20px; background: linear-gradient(135deg, #132f66 0%, #0a1f4d 100%); border-radius: 10px;">
          <h2 style="color: white; margin: 0; font-size: 24px;">Kitale Progressive School</h2>
          <p style="color: #cebd04; margin: 5px 0 0;">In Pursuit of Excellence</p>
        </div>
        
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h3 style="color: #132f66; margin-top: 0;">${inquiryTypeLabel}</h3>
          <p style="color: #666; margin-bottom: 20px;"><strong>Date:</strong> ${currentDate}</p>
          
          <div style="background-color: #e8f0fe; padding: 12px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #132f66;">
            <p style="margin: 0; color: #132f66; font-size: 14px;">
              <strong>📧 Reply Information:</strong> To respond to this inquiry, simply click "Reply" in your email client. 
              Your reply will be sent directly to: <strong>${formData.email}</strong>
            </p>
          </div>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 12px; background-color: #f5f5f5; font-weight: bold; width: 140px;">Inquiry Type:</td>
              <td style="padding: 12px; border-bottom: 1px solid #eee;">${inquiryTypeLabel}</td>
            </tr>
            <tr>
              <td style="padding: 12px; background-color: #f5f5f5; font-weight: bold;">Full Name:</td>
              <td style="padding: 12px; border-bottom: 1px solid #eee;">${formData.fullName}</td>
            </tr>
            <tr>
              <td style="padding: 12px; background-color: #f5f5f5; font-weight: bold;">Email:</td>
              <td style="padding: 12px; border-bottom: 1px solid #eee;">${formData.email}</td>
            </tr>
            <tr>
              <td style="padding: 12px; background-color: #f5f5f5; font-weight: bold;">Phone:</td>
              <td style="padding: 12px; border-bottom: 1px solid #eee;">${formData.phone || 'Not provided'}</td>
            </tr>
            ${isVisitInquiry ? `
            <tr>
              <td style="padding: 12px; background-color: #f5f5f5; font-weight: bold;">Preferred Date:</td>
              <td style="padding: 12px; border-bottom: 1px solid #eee;">${formData.preferredDate || 'Not specified'}</td>
            </tr>
            <tr>
              <td style="padding: 12px; background-color: #f5f5f5; font-weight: bold;">Preferred Time:</td>
              <td style="padding: 12px; border-bottom: 1px solid #eee;">${formData.preferredTime || 'Not specified'}</td>
            </tr>
            <tr>
              <td style="padding: 12px; background-color: #f5f5f5; font-weight: bold;">Number of Visitors:</td>
              <td style="padding: 12px; border-bottom: 1px solid #eee;">${formData.numberOfVisitors || '1'}</td>
            </tr>
            <tr>
              <td style="padding: 12px; background-color: #f5f5f5; font-weight: bold;">Child's Grade:</td>
              <td style="padding: 12px; border-bottom: 1px solid #eee;">${formData.childGrade || 'Not specified'}</td>
            </tr>
            ` : `
            <tr>
              <td style="padding: 12px; background-color: #f5f5f5; font-weight: bold;">Subject:</td>
              <td style="padding: 12px; border-bottom: 1px solid #eee;">${formData.subject || 'Not specified'}</td>
            </tr>
            `}
            <tr>
              <td style="padding: 12px; background-color: #f5f5f5; font-weight: bold; vertical-align: top;">Message:</td>
              <td style="padding: 12px; border-bottom: 1px solid #eee;">${formData.message.replace(/\n/g, '<br>')}</td>
            </tr>
            <tr>
              <td style="padding: 12px; background-color: #f5f5f5; font-weight: bold;">Terms Agreed:</td>
              <td style="padding: 12px;">${formData.agreeToTerms ? 'Yes' : 'No'}</td>
            </tr>
          </table>
          
          <div style="margin-top: 20px; padding: 12px; background-color: #f0f5fa; border-radius: 8px;">
            <p style="margin: 0; color: #666; font-size: 12px;">
              <strong>💡 Tip:</strong> When you reply to this email, your response will go directly to ${formData.fullName} at ${formData.email}.
            </p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; padding: 15px; color: #666; font-size: 12px;">
          <p style="margin: 5px 0;">This ${isVisitInquiry ? 'visit request' : 'inquiry'} was sent via the Kitale Progressive School website.</p>
        </div>
      </div>
    `;

    // User confirmation email content (stays the same - good for user)
    const userTextContent = `
KITALE PROGRESSIVE SCHOOL - ${isVisitInquiry ? 'VISIT REQUEST RECEIVED' : 'INQUIRY RECEIVED'}
${'='.repeat(50)}
Date: ${currentDate}

Dear ${formData.fullName},

Thank you for ${isVisitInquiry ? 'requesting a school visit to' : 'contacting'} Kitale Progressive School. We have received your ${isVisitInquiry ? 'visit request' : 'inquiry'} and will get back to you as soon as possible.

${isVisitInquiry ? `
YOUR VISIT REQUEST DETAILS:
---------------------------
Preferred Date: ${formData.preferredDate || 'Not specified'}
Preferred Time: ${formData.preferredTime || 'Not specified'}
Number of Visitors: ${formData.numberOfVisitors || '1'}
Child's Grade: ${formData.childGrade || 'Not specified'}

` : `
YOUR INQUIRY DETAILS:
--------------------
Subject: ${formData.subject || 'Not specified'}
Message: ${formData.message}
`}

What happens next?
------------------
1. Our admissions team will review your ${isVisitInquiry ? 'request' : 'inquiry'} within 24-48 hours.
2. A representative will contact you via email or phone.
3. ${isVisitInquiry ? 'We will confirm your preferred date or suggest alternative dates.' : 'For urgent matters, please call us directly.'}

CONTACT INFORMATION:
-------------------
Phone: +254 736 756 595
Email: kitaleprogressivesocial@gmail.com
Location: Kitale - Kapenguria RD

Thank you for your interest in Kitale Progressive School!

Best regards,
The Admissions Team
Kitale Progressive School
"In Pursuit of Excellence"
    `.trim();

    const userHtmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="text-align: center; margin-bottom: 30px; padding: 20px; background: linear-gradient(135deg, #132f66 0%, #0a1f4d 100%); border-radius: 10px;">
          <h2 style="color: white; margin: 0; font-size: 24px;">Kitale Progressive School</h2>
          <p style="color: #cebd04; margin: 5px 0 0;">In Pursuit of Excellence</p>
        </div>
        
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h3 style="color: #132f66; margin-top: 0;">${isVisitInquiry ? 'Visit Request Received!' : 'Thank You for Contacting Us!'}</h3>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333;">Dear <strong>${formData.fullName}</strong>,</p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333;">Thank you for ${isVisitInquiry ? 'requesting a school visit to' : 'reaching out to'} Kitale Progressive School. We have received your ${isVisitInquiry ? 'visit request' : 'inquiry'} and will get back to you as soon as possible.</p>
          
          <div style="background-color: #f0f5fa; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #132f66;">
            <p style="margin: 0 0 10px 0; font-weight: bold; color: #132f66;">${isVisitInquiry ? 'Your Visit Request Details:' : 'Your Inquiry Details:'}</p>
            <p style="margin: 5px 0;"><strong>Date:</strong> ${currentDate}</p>
            ${isVisitInquiry ? `
            <p style="margin: 5px 0;"><strong>Preferred Date:</strong> ${formData.preferredDate || 'Not specified'}</p>
            <p style="margin: 5px 0;"><strong>Preferred Time:</strong> ${formData.preferredTime || 'Not specified'}</p>
            <p style="margin: 5px 0;"><strong>Number of Visitors:</strong> ${formData.numberOfVisitors || '1'}</p>
            <p style="margin: 5px 0;"><strong>Child's Grade:</strong> ${formData.childGrade || 'Not specified'}</p>
            ` : `
            <p style="margin: 5px 0;"><strong>Subject:</strong> ${formData.subject || 'Not specified'}</p>
            <p style="margin: 5px 0;"><strong>Message:</strong> ${formData.message}</p>
            `}
          </div>
          
          <h4 style="color: #132f66; margin: 25px 0 15px 0;">What Happens Next:</h4>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee; width: 40px; vertical-align: top;">
                <span style="background-color: #132f66; color: white; width: 24px; height: 24px; display: inline-block; border-radius: 50%; text-align: center; line-height: 24px; font-weight: bold;">1</span>
               </td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">
                <strong style="color: #333;">Review</strong><br/>
                <span style="color: #666;">Our team will review your ${isVisitInquiry ? 'request' : 'inquiry'} within 24-48 hours.</span>
               </td>
             </tr>
             <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">
                <span style="background-color: #132f66; color: white; width: 24px; height: 24px; display: inline-block; border-radius: 50%; text-align: center; line-height: 24px; font-weight: bold;">2</span>
               </td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">
                <strong style="color: #333;">Response</strong><br/>
                <span style="color: #666;">A representative will contact you via email or phone.</span>
               </td>
             </tr>
             <tr>
              <td style="padding: 10px;">
                <span style="background-color: #132f66; color: white; width: 24px; height: 24px; display: inline-block; border-radius: 50%; text-align: center; line-height: 24px; font-weight: bold;">3</span>
               </td>
              <td style="padding: 10px;">
                <strong style="color: #333;">${isVisitInquiry ? 'Confirmation' : 'Follow-up'}</strong><br/>
                <span style="color: #666;">${isVisitInquiry ? 'We will confirm your preferred date or suggest alternative dates.' : 'We will address your questions and provide guidance.'}</span>
               </td>
             </tr>
           </table>
          
          <div style="margin: 30px 0 20px 0; padding: 20px; background-color: #fff8e7; border-radius: 8px; border: 1px solid #cebd04;">
            <p style="margin: 0; color: #132f66;">
              <strong>📌 Contact Information:</strong><br/>
              Phone: +254 736 756 595<br/>
              Email: kitaleprogressivesocial@gmail.com<br/>
              Location: Kitale - Kapenguria RD
            </p>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333;">We look forward to ${isVisitInquiry ? 'welcoming you to our school' : 'assisting you'}!</p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333; margin-top: 25px;">Best regards,<br/>
          <strong style="color: #132f66;">The Admissions Team</strong><br/>
          Kitale Progressive School<br/>
          <em style="color: #666;">"In Pursuit of Excellence"</em></p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; padding: 15px; color: #666; font-size: 12px;">
          <p style="margin: 5px 0;">Kitale Progressive School | P.O. Box 1338, Kitale, Kenya</p>
          <p style="margin: 5px 0;">© ${new Date().getFullYear()} Kitale Progressive School. All rights reserved.</p>
        </div>
      </div>
    `;

    return {
      school: { html: schoolHtmlContent, text: schoolTextContent },
      user: { html: userHtmlContent, text: userTextContent }
    };
  }, [formData, inquiryType]);

  // Google Login configuration
  const login = useGoogleLogin({
    clientId: GOOGLE_CLIENT_ID,
    scope: GMAIL_SCOPES,
    onSuccess: async (tokenResponse) => {
      try {
        setSubmitting(true);
        
        console.log("Google login successful, sending emails...");
        
        const emailContents = createEmailContents();
        
        const isVisitInquiry = inquiryType === 'school_visit';
        const emailSubject = isVisitInquiry 
          ? `School Visit Request: ${formData.fullName}`
          : `Contact Form Inquiry: ${formData.subject?.slice(0, 50) || 'General Inquiry'} - ${formData.fullName}`;
        
        // Send email to SCHOOL - with Reply-To set to user's email
        // This allows admin to click "Reply" and respond directly to the user
        const schoolEncodedEmail = await createEmailWithContent(
          CONTACT_EMAIL,           // To: Admin/School
          formData.email,          // From: User's email
          emailSubject,
          emailContents.school.html,
          emailContents.school.text,
          formData.email           // Reply-To: User's email (so admin replies go to user)
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
          throw new Error("Failed to send message");
        }
        
        // Send confirmation to USER - with Reply-To set to school email
        // This way if user replies to confirmation, it goes to the school
        const userEncodedEmail = await createEmailWithContent(
          formData.email,          // To: User
          formData.email,          // From: User's email
          isVisitInquiry 
            ? `Your School Visit Request - Kitale Progressive School`
            : `We Received Your Inquiry - Kitale Progressive School`,
          emailContents.user.html,
          emailContents.user.text,
          CONTACT_EMAIL            // Reply-To: School email (so user replies go to school)
        );
        
        await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${tokenResponse.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ raw: userEncodedEmail })
        }).catch(err => console.warn("User confirmation warning:", err));

        const successMessage = isVisitInquiry
          ? `Thank you for requesting a school visit! A confirmation email has been sent to ${formData.email}. We'll contact you to confirm your preferred date.`
          : `Thank you for contacting us! A confirmation email has been sent to ${formData.email}. We'll get back to you soon.`;

        setSubmitStatus({
          show: true,
          success: true,
          message: successMessage
        });

        // Reset form
        setFormData({
          fullName: "",
          email: "",
          phone: "",
          inquiryType: "general",
          subject: "",
          message: "",
          preferredDate: "",
          preferredTime: "",
          numberOfVisitors: "1",
          childGrade: "",
          agreeToTerms: false
        });
        setInquiryType("general");
        setValidated(false);
        
      } catch (error) {
        console.error("Email error:", error);
        setSubmitStatus({
          show: true,
          success: false,
          message: error.message || "Error sending message. Please try again or call us at +254 736 756 595."
        });
      } finally {
        setSubmitting(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    onError: (error) => {
      console.error('Login Failed:', error);
      let errorMessage = "Google sign-in failed. ";
      
      if (error?.error === 'popup_blocked_by_browser') {
        errorMessage += "Please allow popups for this site.";
      } else if (error?.error === 'access_denied') {
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
    const form = e.currentTarget;
    
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    
    if (!formData.fullName || !formData.email || !formData.message) {
      setSubmitStatus({
        show: true,
        success: false,
        message: "Please fill in all required fields."
      });
      return;
    }

    if (inquiryType === 'school_visit' && !formData.preferredDate) {
      setSubmitStatus({
        show: true,
        success: false,
        message: "Please select a preferred date for your school visit."
      });
      return;
    }

    if (!formData.agreeToTerms) {
      setSubmitStatus({
        show: true,
        success: false,
        message: "Please agree to the Terms of Service and Privacy Policy."
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
  }, [formData, login, GOOGLE_CLIENT_ID, inquiryType]);

  // Get tomorrow's date for min date attribute
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  // Inquiry type options
  const inquiryTypeOptions = [
    { value: "general", label: "General Inquiry" },
    { value: "school_visit", label: "Book a School Visit" },
    { value: "admissions", label: "Admissions Information" },
    { value: "fee_structure", label: "Fee Structure Inquiry" },
    { value: "boarding", label: "Boarding Information" }
  ];

  // Contact information array
  const contactInfo = [
    { icon: 'bi-envelope-fill', label: 'EMAIL', value: 'kitaleprogressivesocial@gmail.com', isLight: false },
    { icon: 'bi-telephone-fill', label: 'PHONE', value: '+254 736 756 595', isLight: false },
    { icon: 'bi-geo-alt-fill', label: 'Location', value: 'Kitale - Kapenguria RD', isLight: true }
  ];

  return (
    <section id="contact-section" className="section-padding bg-light-custom" aria-labelledby="contact-heading">
      <Container>
        <h1 id="contact-heading" className="section-heading text-center">
          GET IN TOUCH
        </h1>

        <div className="quote-block lead mb-4 text-center">
         Begin your child's journey today.
        </div>
        
        {/* Status Alert */}
        <StatusAlert 
          show={submitStatus.show}
          success={submitStatus.success}
          message={submitStatus.message}
          onClose={handleDismissAlert}
        />

        <Row className="g-4">
          <Col md={6}>
            {contactInfo.map((info, index) => (
              <ContactInfo 
                key={index}
                icon={info.icon}
                label={info.label}
                value={info.value}
                isLight={info.isLight}
              />
            ))}

            {/* Quick Links */}
            <div className="mt-4 pt-2">
              <Link to="/privacy-policy" className="text-muted me-2 small" aria-label="Read our Privacy Policy">
                Privacy Policy
              </Link>
              <span className="text-muted" aria-hidden="true">|</span>
              <Link to="/terms-of-service" className="text-muted ms-2 small" aria-label="Read our Terms of Service">
                Terms of Service
              </Link>
            </div>
          </Col>

          <Col md={6}>
            <div className="form-container">
              <Form noValidate validated={validated} onSubmit={handleSubmit} aria-label="Contact form">
                {/* Inquiry Type Selector */}
                <FormInput 
                  label="I would like to"
                  as="select"
                  name="inquiryType"
                  value={inquiryType}
                  onChange={handleChange}
                  required
                  options={inquiryTypeOptions}
                  feedback="Please select an inquiry type."
                />

                <FormInput 
                  label="Your Full Name"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="e.g., Mueni Achieng"
                  required
                  feedback="Please enter your name."
                />

                <FormInput 
                  label="Email Address"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  required
                  feedback="Please enter a valid email address."
                />

                <FormInput 
                  label="Phone Number (Optional)"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+254 712 345 678"
                />

                {/* Conditional fields based on inquiry type */}
                {inquiryType === 'school_visit' ? (
                  <>
                    <FormInput 
                      label="Preferred Visit Date"
                      type="date"
                      name="preferredDate"
                      value={formData.preferredDate}
                      onChange={handleChange}
                      required
                      min={getTomorrowDate()}
                      feedback="Please select a preferred date for your visit."
                    />
                    
                    <FormInput 
                      label="Preferred Time"
                      as="select"
                      name="preferredTime"
                      value={formData.preferredTime}
                      onChange={handleChange}
                      required
                      options={[
                        { value: "9:00 AM", label: "9:00 AM" },
                        { value: "10:00 AM", label: "10:00 AM" },
                        { value: "11:00 AM", label: "11:00 AM" },
                        { value: "12:00 PM", label: "12:00 PM" },
                        { value: "2:00 PM", label: "2:00 PM" },
                        { value: "3:00 PM", label: "3:00 PM" }
                      ]}
                      feedback="Please select a preferred time."
                    />
                    
                    <FormInput 
                      label="Number of Visitors"
                      as="select"
                      name="numberOfVisitors"
                      value={formData.numberOfVisitors}
                      onChange={handleChange}
                      required
                      options={[
                        { value: "1", label: "1 person" },
                        { value: "2", label: "2 people" },
                        { value: "3", label: "3 people" },
                        { value: "4", label: "4 people" },
                        { value: "5+", label: "5 or more" }
                      ]}
                    />
                    
                    <FormInput 
                      label="Child's Grade (if applicable)"
                      as="select"
                      name="childGrade"
                      value={formData.childGrade}
                      onChange={handleChange}
                      options={[
                        { value: "", label: "Not applicable / Just browsing" },
                        { value: "Playgroup", label: "Playgroup" },
                        { value: "PP1", label: "PP1" },
                        { value: "PP2", label: "PP2" },
                        { value: "Grade 1", label: "Grade 1" },
                        { value: "Grade 2", label: "Grade 2" },
                        { value: "Grade 3", label: "Grade 3" },
                        { value: "Grade 4", label: "Grade 4" },
                        { value: "Grade 5", label: "Grade 5" },
                        { value: "Grade 6", label: "Grade 6" },
                        { value: "Grade 7", label: "Grade 7" },
                        { value: "Grade 8", label: "Grade 8" },
                        { value: "Grade 9", label: "Grade 9" }
                      ]}
                    />
                  </>
                ) : (
                  <FormInput 
                    label="Subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="e.g., Admissions, Fees, Curriculum"
                    required={inquiryType !== 'general'}
                  />
                )}

                <FormInput 
                  label="Message"
                  as="textarea"
                  rows={4}
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder={inquiryType === 'school_visit' ? "Any special requests or questions about your visit?" : "Write your message here..."}
                  required
                  feedback="Please enter your message."
                />

                {/* Terms Checkbox */}
                <Form.Group className="mb-4">
                  <div className="custom-checkbox-wrapper">
                    <Form.Check
                      required
                      type="checkbox"
                      name="agreeToTerms"
                      id="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onChange={handleChange}
                      className="custom-checkbox-input"
                      label={
                        <span style={{ fontSize: '0.9rem' }}>
                          I agree to the{' '}
                          <Link to="/terms-of-service" target="_blank" className="text-navy text-decoration-underline">
                            Terms
                          </Link>
                          {' '}and{' '}
                          <Link to="/privacy-policy" target="_blank" className="text-navy text-decoration-underline">
                            Privacy Policy
                          </Link>
                          <span className="visually-hidden"> (required)</span>
                        </span>
                      }
                      feedback="You must agree to the Terms and Privacy Policy."
                    />
                  </div>
                </Form.Group>

                <Button 
                  type="submit" 
                  className="btn-navy w-100 w-md-auto"
                  disabled={submitting}
                  aria-label={submitting ? "Sending message" : "Submit inquiry"}
                  style={{ minHeight: '44px', minWidth: '44px' }}
                >
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      <span>Sending...</span>
                      <span className="visually-hidden">Please wait while we send your message</span>
                    </>
                  ) : (
                    inquiryType === 'school_visit' ? 'REQUEST SCHOOL VISIT' : 'SUBMIT INQUIRY'
                  )}
                </Button>

                <p className="text-muted small mt-3 mb-0 d-flex align-items-center justify-content-center gap-2 flex-wrap">
                  <i className="fas fa-lock me-1" aria-hidden="true"></i>
                  <span>Sign in with Google to verify your identity and receive a confirmation email.</span>
                </p>
              </Form>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default memo(GetInTouch);