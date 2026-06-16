// pages/AdminLogin.jsx
import { Helmet } from "react-helmet-async";
import { Container, Row, Col, Card, Form, Button, Alert } from "react-bootstrap";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if already logged in
    const auth = localStorage.getItem('adminAuthenticated');
    const expiry = localStorage.getItem('adminExpiry');
    if (auth === 'true' && expiry && new Date().getTime() < parseInt(expiry)) {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Check password (you can change this or use environment variable)
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';
    
    setTimeout(() => {
      if (password === adminPassword) {
        const expiry = new Date().getTime() + 24 * 60 * 60 * 1000;
        localStorage.setItem('adminAuthenticated', 'true');
        localStorage.setItem('adminExpiry', expiry.toString());
        navigate('/admin/dashboard');
      } else {
        setError('Invalid password. Please try again.');
      }
      setLoading(false);
    }, 500);
  };

  return (
    <>
      <Helmet>
        <title>Admin Login | Kitale Progressive School</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      
      <div className="admin-login-container">
        <div className="admin-login-card">
          <div className="text-center mb-4">
            <div className="admin-login-logo mb-3">
              <i className="fas fa-school fa-3x text-navy"></i>
            </div>
            <h1 className="h4 fw-bold text-navy">Admin Login</h1>
            <p className="text-muted small">Enter your password to access the admin panel</p>
          </div>
          
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small">Password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="form-control-custom"
                autoFocus
              />
            </Form.Group>
            
            {error && (
              <Alert variant="danger" className="py-2 small">
                <i className="fas fa-exclamation-circle me-2"></i>
                {error}
              </Alert>
            )}
            
            <Button 
              type="submit" 
              className="btn-navy w-100"
              disabled={loading}
            >
              {loading ? (
                <><span className="spinner-border spinner-border-sm me-2"></span> Logging in...</>
              ) : (
                'Login to Dashboard'
              )}
            </Button>
          </Form>
          
          <div className="text-center mt-3">
            <small className="text-muted">
              <i className="fas fa-lock me-1"></i>
              Secure admin access only
            </small>
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        .admin-login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #050265, #0d65fb);
          padding: 1rem;
        }
        
        .admin-login-card {
          background: white;
          padding: 2rem;
          border-radius: 20px;
          width: 100%;
          max-width: 400px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.2);
        }
        
        .admin-login-logo {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #050265, #0d65fb);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
        }
        
        .admin-login-logo i {
          font-size: 1.8rem;
          color: white;
        }
        
        @media (max-width: 576px) {
          .admin-login-card {
            padding: 1.5rem;
          }
        }
      `}} />
    </>
  );
}

export default AdminLogin;