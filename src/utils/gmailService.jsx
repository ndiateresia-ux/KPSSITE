import { hasGrantedAllScopesGoogle } from '@react-oauth/google';

// Gmail API scopes needed
const SCOPES = [
  'https://www.googleapis.com/auth/gmail.send',

];

/**
 * Create a properly formatted email with PDF attachment
 */
export const createEmailWithAttachment = (to, from, subject, textContent, pdfBlob, filename) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(pdfBlob);
    
    reader.onload = function() {
      const base64PDF = reader.result.split(',')[1];
      
      // Create MIME email with attachment [citation:3]
      const boundary = 'boundary123';
      const emailContent = [
        `Content-Type: multipart/mixed; boundary="${boundary}"`,
        'MIME-Version: 1.0',
        `To: ${to}`,
        `From: ${from}`,
        `Subject: ${subject}`,
        '',
        `--${boundary}`,
        'Content-Type: text/html; charset=UTF-8',
        'Content-Transfer-Encoding: 7bit',
        '',
        textContent,
        '',
        `--${boundary}`,
        'Content-Type: application/pdf',
        'Content-Transfer-Encoding: base64',
        `Content-Disposition: attachment; filename="${filename}"`,
        '',
        base64PDF,
        '',
        `--${boundary}--`
      ].join('\r\n');
      
      // Encode to base64url format for Gmail API [citation:3]
      const encodedEmail = btoa(emailContent)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
      
      resolve(encodedEmail);
    };
  });
};

/**
 * Send email using Gmail API
 */
export const sendEmailViaGmailAPI = async (accessToken, emailData) => {
  try {
    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        raw: emailData
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to send email');
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending email via Gmail API:', error);
    throw error;
  }
};

/**
 * Check if user has granted required scopes
 */
export const checkGmailScopes = (tokenResponse) => {
  return hasGrantedAllScopesGoogle(tokenResponse, ...SCOPES);
};